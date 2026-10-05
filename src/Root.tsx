import { useEffect, useMemo, useState } from 'react'
import type { User } from 'firebase/auth'
import App, { type Account } from './App'
import Login from './components/Login'
import { useAuth } from './store/useAuth'
import { createCloudStore } from './store/cloudStore'
import { localCardStore, localStore } from './store/localStore'
import type { StudyCard } from './store/cards'
import type { LibNode } from './store/types'

const MODE_KEY = 'naotushuguan:v1:mode'
const readMode = () => {
  try {
    return localStorage.getItem(MODE_KEY) === 'local'
  } catch {
    return false
  }
}
const writeMode = (local: boolean) => {
  try {
    if (local) localStorage.setItem(MODE_KEY, 'local')
    else localStorage.removeItem(MODE_KEY)
  } catch {
    /* 無法記住也沒關係 */
  }
}

export default function Root() {
  const auth = useAuth()
  const [localMode, setLocalMode] = useState(readMode)

  if (auth.loading) return <div className="boot">載入中…</div>

  if (auth.user) return <CloudSpace user={auth.user} onSignOut={auth.signOut} />

  if (localMode) {
    return (
      <App
        key="local"
        nodeStore={localStore}
        cardStore={localCardStore}
        account={{ mode: 'local', onSignIn: () => { writeMode(false); setLocalMode(false) } }}
      />
    )
  }

  return <Login error={auth.error} onSignIn={auth.signIn} onLocal={() => { writeMode(true); setLocalMode(true) }} />
}

const migratedKey = (uid: string) => `naotushuguan:v1:migrated:${uid}`

/** 第一次登入時，如果雲端是空的、這台裝置有資料，問要不要上傳。 */
function CloudSpace({ user, onSignOut }: { user: User; onSignOut: () => Promise<void> }) {
  const nodeStore = useMemo(() => createCloudStore<LibNode>(user.uid, 'nodes'), [user.uid])
  const cardStore = useMemo(() => createCloudStore<StudyCard>(user.uid, 'cards'), [user.uid])
  const [step, setStep] = useState<'checking' | 'ask' | 'ready'>('checking')
  const [localCount, setLocalCount] = useState(0)

  useEffect(() => {
    let alive = true
    ;(async () => {
      let done = false
      try {
        done = localStorage.getItem(migratedKey(user.uid)) === '1'
      } catch {
        done = false
      }
      if (done) return alive && setStep('ready')
      const [cloudHas, localHas] = await Promise.all([nodeStore.hasData(), localStore.hasData()])
      if (!alive) return
      if (!cloudHas && localHas) {
        setLocalCount((await localStore.list()).length + (await localCardStore.list()).length)
        if (alive) setStep('ask')
      } else setStep('ready')
    })()
    return () => {
      alive = false
    }
  }, [user.uid, nodeStore])

  const finish = () => {
    try {
      localStorage.setItem(migratedKey(user.uid), '1')
    } catch {
      /* 下次會再問一次 */
    }
    setStep('ready')
  }

  const upload = async () => {
    for (const n of await localStore.list()) await nodeStore.upsert(n)
    for (const c of await localCardStore.list()) await cardStore.upsert(c)
    finish()
  }

  if (step === 'checking') return <div className="boot">同步中…</div>

  if (step === 'ask') {
    return (
      <main className="login">
        <div className="login-inner">
          <p className="eyebrow">第一次登入</p>
          <h1 className="big">
            上傳這台裝置的資料？<span className="dot">.</span>
          </h1>
          <p className="lead">這台裝置上有 {localCount} 筆科目、筆記和單字卡，雲端目前是空的。要放上雲端，這樣你的手機也看得到嗎？</p>
          <div className="actions">
            <button className="btn primary" onClick={upload}>
              上傳到雲端
            </button>
            <button className="btn" onClick={finish}>
              不要，從空白開始
            </button>
          </div>
        </div>
      </main>
    )
  }

  const account: Account = {
    mode: 'cloud',
    name: user.displayName ?? '',
    email: user.email ?? '',
    onSignOut: () => void onSignOut(),
  }
  return <App key={user.uid} nodeStore={nodeStore} cardStore={cardStore} account={account} />
}
