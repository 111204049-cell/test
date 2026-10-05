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
export interface Store {
  list(): Promise<LibNode[]>
  upsert(node: LibNode): Promise<void>
  remove(ids: string[]): Promise<void>
}
