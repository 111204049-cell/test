import { useCallback, useEffect, useRef, useState } from 'react'
import type { Grade } from 'ts-fsrs'
import { localCardStore } from './localStore'
import { newCard, rate, seedCards, type StudyCard } from './cards'

const store = localCardStore
const newId = () => 'c' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

export function useCards() {
  const [cards, setCards] = useState<StudyCard[]>([])
  const [ready, setReady] = useState(false)
  const ref = useRef<StudyCard[]>([])
  ref.current = cards

  useEffect(() => {
    let alive = true
    ;(async () => {
      if (!store.hasData()) for (const c of seedCards()) await store.upsert(c)
      const all = await store.list()
      if (alive) {
        setCards(all)
        setReady(true)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const add = useCallback((front: string, back: string, folderId: string | null) => {
    const c = newCard(newId(), front, back, folderId)
    setCards((prev) => [...prev, c])
    void store.upsert(c)
  }, [])

  const replace = useCallback((next: StudyCard) => {
    setCards((prev) => prev.map((c) => (c.id === next.id ? next : c)))
    void store.upsert(next)
  }, [])

  const edit = useCallback(
    (id: string, front: string, back: string) => {
      const c = ref.current.find((x) => x.id === id)
      if (c) replace({ ...c, front, back })
    },
    [replace],
  )

  const remove = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id))
    void store.remove([id])
  }, [])

  const review = useCallback(
    (id: string, grade: Grade) => {
      const c = ref.current.find((x) => x.id === id)
      if (c) replace(rate(c, grade))
    },
    [replace],
  )

  return { cards, ready, add, edit, remove, review }
}
