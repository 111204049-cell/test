import { useEffect, useMemo, useState } from 'react'
import type { Grade } from 'ts-fsrs'
import { GRADES, previewIntervals, type StudyCard } from '../store/cards'

interface Props {
  cards: StudyCard[]
  onRate: (id: string, grade: Grade) => void
  onExit: () => void
}

/** 學習中的卡（幾分鐘後會再出現）也算進這次，和 Anki 一樣的做法。 */
const WINDOW_MS = 20 * 60 * 1000

export default function ReviewSession({ cards, onRate, onExit }: Props) {
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(0)
  const [total] = useState(() => cards.filter((c) => c.due <= Date.now() + WINDOW_MS).length)

  const queue = useMemo(
    () => cards.filter((c) => c.due <= Date.now() + WINDOW_MS).sort((a, b) => a.due - b.due),
    [cards],
  )
  const current = queue[0]
  const hints = useMemo(() => (current ? previewIntervals(current) : null), [current])

  const answer = (grade: Grade) => {
    if (!current || !flipped) return
    onRate(current.id, grade)
    setFlipped(false)
    setDone((d) => d + 1)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input,textarea,select')) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setFlipped(true)
      }
      const g = GRADES.find((x) => x.key === e.key)
      if (g) answer(g.grade)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!current) {
    return (
      <section className="page center">
        <p className="eyebrow">複習完成</p>
        <h1 className="big">
          今天到這裡<span className="dot">.</span>
        </h1>
        <p className="lead">{done > 0 ? `這次複習了 ${done} 次。` : '目前沒有需要複習的卡。'}</p>
        <button className="btn primary" onClick={onExit}>
          回到卡片
        </button>
      </section>
    )
  }

  const pct = total ? Math.min(100, Math.round((done / (done + queue.length)) * 100)) : 0

  return (
    <section className="review">
      <div className="review-top">
        <button className="btn" onClick={onExit}>
          結束
        </button>
        <span className="review-count">剩 {queue.length} 張</span>
      </div>
      <div className="meter" aria-hidden="true">
        <u style={{ width: pct + '%' }} />
      </div>

      <button className={'flip' + (flipped ? ' on' : '')} onClick={() => setFlipped(true)} aria-label={flipped ? '卡片背面' : '點一下翻面'}>
        <span className="face front glass">
          <em>{current.front}</em>
          <small>點一下或按空白鍵翻面</small>
        </span>
        <span className="face back glass">
          <small>{current.front}</small>
          <em>{current.back}</em>
        </span>
      </button>

      <div className={'grades' + (flipped ? ' show' : '')}>
        {GRADES.map((g) => (
          <button key={g.grade} className={'grade g' + g.grade} disabled={!flipped} onClick={() => answer(g.grade)}>
            <b>{g.label}</b>
            <span>{hints?.[g.grade]}</span>
            <kbd>{g.key}</kbd>
          </button>
        ))}
      </div>
    </section>
  )
}
