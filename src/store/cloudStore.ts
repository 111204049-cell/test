import { collection, doc, getDocs, limit, onSnapshot, query, setDoc, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { reportSyncError } from './syncStatus'
import type { Store } from './types'

/**
 * Firestore 儲存層：資料放在 users/{uid}/{name}/{id}，
 * 安全規則只允許本人讀寫自己的 users/{uid}。
 * 寫入不等伺服器回應（離線時也能立刻繼續使用），失敗會顯示在提示列。
 */
export function createCloudStore<T extends { id: string }>(uid: string, name: string): Store<T> {
  const col = collection(db, 'users', uid, name)
  return {
    async hasData() {
      try {
        return !(await getDocs(query(col, limit(1)))).empty
      } catch (e) {
        reportSyncError(e)
        return true // 查不到時寧可不放範例，避免蓋掉真正的資料
      }
    },
    async list() {
      return (await getDocs(col)).docs.map((d) => d.data() as T)
    },
    async upsert(item) {
      setDoc(doc(col, item.id), item).catch(reportSyncError)
    },
    async remove(ids) {
      for (let i = 0; i < ids.length; i += 400) {
        const batch = writeBatch(db)
        for (const id of ids.slice(i, i + 400)) batch.delete(doc(col, id))
        batch.commit().catch(reportSyncError)
      }
    },
    subscribe(onData) {
      return onSnapshot(
        col,
        (snap) => onData(snap.docs.map((d) => d.data() as T)),
        (e) => reportSyncError(e),
      )
    },
  }
}
