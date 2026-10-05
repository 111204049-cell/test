import type { LibNode, Store } from './types'
import type { StudyCard } from './cards'

function createLocalStore<T extends { id: string }>(key: string): Store<T> {
  const read = (): T[] | null => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T[]) : null
    } catch {
      return null
    }
  }
  const write = (items: T[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(items))
    } catch {
      /* 儲存空間滿了或被封鎖時，畫面仍可使用，只是不會保存 */
    }
  }
  return {
    hasData: async () => read() !== null,
    async list() {
      return read() ?? []
    },
    async upsert(item) {
      const all = read() ?? []
      const i = all.findIndex((n) => n.id === item.id)
      if (i >= 0) all[i] = item
      else all.push(item)
      write(all)
    },
    async remove(ids) {
      const drop = new Set(ids)
      write((read() ?? []).filter((n) => !drop.has(n.id)))
    },
  }
}

export const localStore = createLocalStore<LibNode>('naotushuguan:v1:nodes')
export const localCardStore = createLocalStore<StudyCard>('naotushuguan:v1:cards')
