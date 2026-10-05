/** 雲端同步出問題時，把白話的原因傳給畫面上的提示列。 */
type Listener = (message: string | null) => void

const listeners = new Set<Listener>()
let last: string | null = null

function friendly(e: unknown): string {
  const code = (e as { code?: string })?.code ?? ''
  if (code.includes('permission-denied')) return '沒有權限寫入雲端。請確認 Firestore 的安全規則已經部署。'
  if (code.includes('not-found')) return '找不到 Firestore 資料庫。請先在 Firebase 主控台建立。'
  if (code.includes('unavailable')) return '目前連不上雲端，變更會在恢復連線後同步。'
  return '雲端同步發生問題，資料暫時只存在這台裝置。'
}

export function reportSyncError(e: unknown) {
  console.warn('[sync]', e)
  last = friendly(e)
  listeners.forEach((l) => l(last))
}

export function clearSyncError() {
  last = null
  listeners.forEach((l) => l(null))
}

export function onSyncError(l: Listener) {
  listeners.add(l)
  if (last) l(last)
  return () => {
    listeners.delete(l)
  }
}
