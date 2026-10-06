import { useCallback, useEffect, useState } from 'react'
import { GoogleAuthProvider, getRedirectResult, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut as fbSignOut, type User } from 'firebase/auth'
import { auth } from '../firebase'

const PENDING = 'naotushuguan:auth-pending'

function explain(e: unknown): string {
  const code = (e as { code?: string })?.code ?? ''
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return '登入視窗被關閉，沒有完成登入。如果你沒有關它，請把瀏覽器的彈出視窗設為允許後再試。'
  if (code === 'auth/unauthorized-domain') return '這個網址還沒加入 Firebase 的授權網域。到 Authentication → 設定 → 授權網域 新增它。'
  if (code === 'auth/operation-not-allowed') return '還沒有在 Firebase 啟用 Google 登入。到 Authentication → 登入方式 開啟 Google。'
  if (code === 'auth/network-request-failed') return '連不上網路，請稍後再試。'
  return `登入失敗，請再試一次。（錯誤碼：${code || String((e as Error)?.message ?? e)}）`
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // 從 Google 轉回來時，如果登入沒有成功，把原因顯示出來。
    getRedirectResult(auth).catch((e) => setError(explain(e)))
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
      try {
        if (u) sessionStorage.removeItem(PENDING)
        else if (sessionStorage.getItem(PENDING)) {
          sessionStorage.removeItem(PENDING)
          setError((prev) => prev || '從 Google 轉回來了，但瀏覽器沒有保留登入資訊。請改用無痕視窗以外的一般視窗，或到網站設定允許 Cookie 與網站資料後再試。')
        }
      } catch {
        /* sessionStorage 不能用時略過 */
      }
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
          sessionStorage.setItem(PENDING, '1')
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
