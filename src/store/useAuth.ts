import { useCallback, useEffect, useState } from 'react'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut as fbSignOut, type User } from 'firebase/auth'
import { auth } from '../firebase'

function explain(e: unknown): string {
  const code = (e as { code?: string })?.code ?? ''
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return ''
  if (code === 'auth/unauthorized-domain') return '這個網址還沒加入 Firebase 的授權網域。到 Authentication → 設定 → 授權網域 新增它。'
  if (code === 'auth/operation-not-allowed') return '還沒有在 Firebase 啟用 Google 登入。到 Authentication → 登入方式 開啟 Google。'
  if (code === 'auth/network-request-failed') return '連不上網路，請稍後再試。'
  return '登入失敗，請再試一次。'
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const signIn = useCallback(async () => {
    setError('')
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    try {
      await signInWithPopup(auth, provider)
    } catch (e) {
      const code = (e as { code?: string })?.code ?? ''
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        try {
          await signInWithRedirect(auth, provider)
          return
        } catch (e2) {
          setError(explain(e2))
          return
        }
      }
      setError(explain(e))
    }
  }, [])

  const signOut = useCallback(() => fbSignOut(auth), [])

  return { user, loading, error, signIn, signOut }
}
