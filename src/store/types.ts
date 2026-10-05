export type NodeType = 'folder' | 'note'

/** 科目樹上的一個節點：資料夾（可任意深度）或筆記。 */
export interface LibNode {
  id: string
  parentId: string | null
  type: NodeType
  title: string
  content: string
  order: number
  createdAt: number
  updatedAt: number
}

/**
 * 儲存層介面。現在用瀏覽器本機儲存，之後接 Firestore 時
 * 只要換一個實作，介面不用動。
 */
export interface Store<T extends { id: string } = LibNode> {
  list(): Promise<T[]>
  upsert(item: T): Promise<void>
  remove(ids: string[]): Promise<void>
  /** 是否已經有資料（用來判斷要不要放範例）。 */
  hasData(): Promise<boolean>
  /** 有提供時，資料變動（包含其他裝置的變動）會即時通知。 */
  subscribe?(onData: (items: T[]) => void): () => void
}
