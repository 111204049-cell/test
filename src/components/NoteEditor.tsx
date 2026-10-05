import { useMemo, useState } from 'react'
import type { LibNode } from '../store/types'
import { sentenceAround } from '../store/dictionary'
import LookupPanel from './LookupPanel'

interface Props {
  note: LibNode
  onChange: (c: Partial<Pick<LibNode, 'title' | 'content'>>) => void
  /** 已經做成單字卡的字（小寫），用來避免重複加入。 */
  existingFronts: Set<string>
  onAddCard: (front: string, back: string) => void
}

interface Target {
  word: string
  context: string
}

const WORD = /([A-Za-z][A-Za-z'-]*)/g

export default function NoteEditor({ note, onChange, existingFronts, onAddCard }: Props) {
  const [mode, setMode] = useState<'edit' | 'read'>('edit')
  const [sel, setSel] = useState<Target | null>(null)
  const [target, setTarget] = useState<Target | null>(null)
  const chars = note.content.replace(/\s/g, '').length

  const lines = useMemo(() => note.content.split('\n'), [note.content])

  const onSelect = (el: HTMLTextAreaElement) => {
    const { selectionStart: a, selectionEnd: b, value } = el
    const text = value.slice(a, b).trim()
    if (text && text.length <= 60 && /[A-Za-z一-鿿]/.test(text) && !text.includes('\n')) {
      setSel({ word: text, context: sentenceAround(value, a, b - a) })
    } else setSel(null)
  }

  return (
    <article className="editor">
      <input className="note-title" value={note.title} placeholder="筆記標題" aria-label="筆記標題" onChange={(e) => onChange({ title: e.target.value })} />

      <div className="mode-bar">
        <div className="seg" role="tablist" aria-label="檢視方式">
          <button role="tab" aria-selected={mode === 'edit'} className={mode === 'edit' ? 'on' : ''} onClick={() => setMode('edit')}>
            編輯
          </button>
          <button role="tab" aria-selected={mode === 'read'} className={mode === 'read' ? 'on' : ''} onClick={() => { setMode('read'); setSel(null) }}>
            閱讀
          </button>
        </div>
        <span className="mode-hint">{mode === 'edit' ? '選取文字可以查字典' : '點任何英文單字查字典'}</span>
        {mode === 'edit' && sel && (
          <button className="btn lookup-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => setTarget(sel)}>
            查「{sel.word.length > 18 ? sel.word.slice(0, 18) + '…' : sel.word}」
          </button>
        )}
      </div>

      {mode === 'edit' ? (
        <textarea
          className="note-body"
          value={note.content}
          placeholder="在這裡寫下今天學到的東西…"
          aria-label="筆記內容"
          onChange={(e) => onChange({ content: e.target.value })}
          onSelect={(e) => onSelect(e.currentTarget)}
          onBlur={() => window.setTimeout(() => setSel(null), 200)}
        />
      ) : (
        <div className="reader" aria-label="筆記內容（閱讀模式）">
          {lines.map((line, li) => {
            if (!line.trim()) return <div key={li} className="gap" />
            const parts = line.split(WORD)
            let offset = 0
            return (
              <p key={li}>
                {parts.map((part, pi) => {
                  const at = offset
                  offset += part.length
                  if (pi % 2 === 0) return part
                  return (
                    <span
                      key={pi}
                      className={'w' + (existingFronts.has(part.toLowerCase()) ? ' saved' : '')}
                      role="button"
                      tabIndex={0}
                      onClick={() => setTarget({ word: part, context: sentenceAround(line, at, part.length) })}
                      onKeyDown={(e) => e.key === 'Enter' && setTarget({ word: part, context: sentenceAround(line, at, part.length) })}
                    >
                      {part}
                    </span>
                  )
                })}
              </p>
            )
          })}
        </div>
      )}

      <footer className="note-foot">
        <span>{chars} 字</span>
        <span>自動保存 · {new Date(note.updatedAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</span>
      </footer>

      {target && (
        <LookupPanel
          word={target.word}
          context={target.context}
          alreadyAdded={existingFronts.has(target.word.toLowerCase())}
          onAdd={onAddCard}
          onClose={() => setTarget(null)}
        />
      )}
    </article>
  )
}
