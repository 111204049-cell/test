import type { LibNode, Store } from './types'

const KEY = 'naotushuguan:v1:nodes'

function read(): LibNode[] | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as LibNode[]) : null
  } catch {
    return null
  }
}

function write(nodes: LibNode[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(nodes))
  } catch {
    /* 儲存空間滿了或被封鎖時，畫面仍可使用，只是不會保存 */
  }
}

export const hasSavedData = () => read() !== null

export const localStore: Store = {
  async list() {
    return read() ?? []
  },
  async upsert(node) {
    const all = read() ?? []
    const i = all.findIndex((n) => n.id === node.id)
    if (i >= 0) all[i] = node
    else all.push(node)
    write(all)
  },
  async remove(ids) {
    const drop = new Set(ids)
    write((read() ?? []).filter((n) => !drop.has(n.id)))
  },
}
