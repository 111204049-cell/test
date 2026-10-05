import { useState } from 'react'
import type { LibNode } from '../store/types'
import { stateLabel, type StudyCard } from '../store/cards'
import Icon from './Icon'

interface Props {
  cards: StudyCard[]
  folders: LibNode[]
  dueCount: number
  onAdd: (front: string, back: string, folderId: string | null) => void
  onRemove: (id: string) => void
  onReview: () => void
}

function dueText(c: StudyCard, now: number) {
  const diff = c.due - now
  if (diff <= 0) return '現在'
  const day = Math.round(diff / 86400000)
  if (diff < 3600000) return `${Math.max(1, Math.round(diff / 60000))} 分鐘後`
  if (diff < 86400000) return `${Math.round(diff / 3600000)} 小時後`
  return `${day} 天後`
}

export default function CardsPage({ cards, folders, dueCount, onAdd, onRemove, onReview }: Props) {
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [folderId, setFolderId] = useState('')
  const now = Date.now()
  const sorted = [...cards].sort((a, b) => a.due - b.due)
  const nameOf = (id: string | null) => folders.find((f) => f.id === id)?.title

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!front.trim() || !back.trim()) return
    onAdd(front.trim(), back.trim(), folderId || null)
    setFront('')
    setBack('')
  }

  return (
    <section className="page">
      <p className="eyebrow">單字卡與問答卡</p>
      <h1 className="big">
        {cards.length} 張卡<span className="dot">.</span>
      </h1>
      <div className="actions">
        <button className="btn primary" onClick={onReview} disabled={dueCount === 0}>
          {dueCount > 0 ? `開始複習（${dueCount} 張）` : '今天沒有要複習的卡'}
        </button>
      </div>

      <form className="glass add-form" onSubmit={submit}>
        <h2>新增一張卡</h2>
        <label>
          正面（單字或問題）
          <input id="card-front" value={front} onChange={(e) => setFront(e.target.value)} placeholder="例如：ephemeral" />
        </label>
        <label>
          背面（解釋或答案）
          <textarea id="card-back" value={back} onChange={(e) => setBack(e.target.value)} placeholder="例如：adj. 短暫的" rows={3} />
        </label>
        <label>
          屬於哪個科目（可不選）
          <select id="card-folder" value={folderId} onChange={(e) => setFolderId(e.target.value)}>
            <option value="">未分類</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>
        </label>
        <button className="btn primary" type="submit" disabled={!front.trim() || !back.trim()}>
          <Icon name="plus" size={16} /> 加入
        </button>
      </form>

      <div className="section-head">
        <h2>所有卡片</h2>
      </div>
      <ul className="card-list">
        {sorted.map((c) => (
          <li key={c.id} className="glass card-row">
            <div className="card-text">
              <strong>{c.front}</strong>
              <span>{c.back}</span>
              <small>
                {stateLabel(c.state)} · 下次 {dueText(c, now)}
                {nameOf(c.folderId) ? ` · ${nameOf(c.folderId)}` : ''}
              </small>
            </div>
            <button className="icon-btn danger" title="刪除這張卡" onClick={() => onRemove(c.id)}>
              <Icon name="trash" size={16} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
