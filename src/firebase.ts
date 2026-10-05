import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

// 這些是網頁用的公開識別碼，不是密碼。資料安全靠 firestore.rules 保護。
const host = typeof location === 'undefined' ? '' : location.hostname
// 部署在 Firebase Hosting 時，登入網域用目前的網址，行動裝置的登入才不會被瀏覽器擋住。
const authDomain = host.endsWith('.web.app') || host.endsWith('.firebaseapp.com') ? host : 'brain-6e0c0.firebaseapp.com'

const app = initializeApp({
  apiKey: 'AIzaSyA1djWffQ5Gs_bGcULNl6rLdhEDiAjIF-E',
  authDomain,
  projectId: 'brain-6e0c0',
  storageBucket: 'brain-6e0c0.firebasestorage.app',
  messagingSenderId: '472946454129',
  appId: '1:472946454129:web:4092cf80b2b6c902c9f5d0',
})

export const auth = getAuth(app)

// 本機快取：沒有網路時也能讀寫，恢復連線後自動同步。
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  ignoreUndefinedProperties: true,
})
