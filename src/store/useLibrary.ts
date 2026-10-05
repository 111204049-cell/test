import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { localStore } from './localStore'
import { seedNodes } from './seed'
import type { LibNode, NodeType, Store } from './types'

const store: Store = localStore
const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

export function useLibrary() {
  const [nodes, setNodes] = useState<LibNode[]>([])
  const [ready, setReady] = useState(false)
  const timers = useRef(new Map<string, number>())

  useEffect(() => {
    let alive = true
    ;(async () => {
      if (!store.hasData()) for (const n of seedNodes()) await store.upsert(n)
      const all = await store.list()
      if (alive) {
        setNodes(all)
        setReady(true)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const childrenOf = useCallback(
    (parentId: string | null) => nodes.filter((n) => n.parentId === parentId).sort((a, b) => a.order - b.order),
    [nodes],
  )

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])

  const create = useCallback(
    (parentId: string | null, type: NodeType, title: string) => {
      const siblings = nodes.filter((n) => n.parentId === parentId)
      const t = Date.now()
      const node: LibNode = {
        id: newId(),
        parentId,
        type,
        title,
        content: '',
        order: siblings.length ? Math.max(...siblings.map((s) => s.order)) + 1 : 0,
        createdAt: t,
        updatedAt: t,
      }
      setNodes((prev) => [...prev, node])
      void store.upsert(node)
      return node
    },
    [nodes],
  )

  /** 修改欄位。內容類的變更會延遲 400ms 再寫入，避免每個按鍵都存一次。 */
  const patch = useCallback(
    (id: string, changes: Partial<Pick<LibNode, 'title' | 'content'>>) => {
      let updated: LibNode | undefined
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id !== id) return n
          updated = { ...n, ...changes, updatedAt: Date.now() }
          return updated
        }),
      )
      const pending = timers.current.get(id)
      if (pending) window.clearTimeout(pending)
      timers.current.set(
        id,
        window.setTimeout(() => {
          timers.current.delete(id)
          const latest = updated
          if (latest) void store.upsert(latest)
        }, 400),
      )
    },
    [],
  )

  const remove = useCallback(
    (id: string) => {
      const doomed = new Set<string>([id])
      let grew = true
      while (grew) {
        grew = false
        for (const n of nodes) {
          if (n.parentId && doomed.has(n.parentId) && !doomed.has(n.id)) {
            doomed.add(n.id)
            grew = true
          }
        }
      }
      setNodes((prev) => prev.filter((n) => !doomed.has(n.id)))
      void store.remove([...doomed])
      return doomed
    },
    [nodes],
  )

  const pathOf = useCallback(
    (id: string | null) => {
      const path: LibNode[] = []
      let cur = id ? byId.get(id) : undefined
      while (cur) {
        path.unshift(cur)
        cur = cur.parentId ? byId.get(cur.parentId) : undefined
      }
      return path
    },
    [byId],
  )

  return { nodes, ready, byId, childrenOf, create, patch, remove, pathOf }
}
