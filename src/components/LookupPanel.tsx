import { useEffect, useState } from 'react'
import { lookup, type Lookup } from '../store/dictionary'
import Icon from './Icon'

interface Props {
  word: string
  context: string
  alreadyAdded: boolean
  onAdd: (front: string, back: string) => void
  onClose: () => void
}

function buildBack(r: Lookup, context: string) {
  const lines: string[] = []
  if (r.zh) lines.push(r.zh)
  for (const m of r.meanings.slice(0, 2)) lines.push(`${m.pos}. ${m.def}`)
  if (context && context.toLowerCase() !== r.word.toLowerCase()) lines.push(`例句：${context}`)
  return lines.join('\n')
}

export default function LookupPanel({ word, context, alreadyAdded, onAdd, onClose }: Props) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [result, setResult] = useState<Lookup | null>(null)
  const [back, setBack] = useState('')
  const [added, setAdded] = useState(alreadyAdded)

  useEffect(() => {
    const ctrl = new AbortController()
    setState('loading')
    setAdded(alreadyAdded)
    lookup(word, ctrl.signal)
      .then((r) => {
        setResult(r)
        setBack(buildBack(r, context))
        setState('ready')
      })
      .catch((e) => {
        if (ctrl.signal.aborted) return
        setResult(null)
        setBack(context ? `例句：${context}` : '')
        setState(e instanceof Error && e.message === 'not-found' ? 'ready' : 'error')
      })
    return () => ctrl.abort()
  }, [word, context, alreadyAdded])

  return (
    <aside className="lookup glass-strong" role="dialog" aria-label={`查字：${word}`}>
      <header>
        <div>
          <strong className="lk-word">{word}</strong>
          {result?.phonetic && <span className="lk-ph">{result.phonetic}</span>}
        </div>
        <button className="icon-btn" aria-label="關閉" onClick={onClose}>
          <Icon name="close" />
        </button>
      </header>

      {state === 'loading' && <p className="lk-muted">查詢中…</p>}
      {state === 'error' && <p className="lk-muted">查詢失敗，可能沒有網路。你仍然可以手動寫解釋後加入。</p>}
      {state === 'ready' && !result && <p className="lk-muted">找不到這個字的解釋，可以自己寫。</p>}
      {result?.zh && <p className="lk-zh">{result.zh}</p>}
      {result && result.meanings.length > 0 && (
        <ul className="lk-mean">
          {result.meanings.map((m, i) => (
            <li key={i}>
              <em>{m.pos}</em> {m.def}
            </li>
          ))}
        </ul>
      )}

      {state !== 'loading' && (
        <div className="lk-add">
          <label>
            卡片背面（可修改）
            <textarea value={back} rows={4} onChange={(e) => setBack(e.target.value)} />
          </label>
          <button
            className="btn primary"
            disabled={added || !back.trim()}
            onClick={() => {
              onAdd(word, back.trim())
              setAdded(true)
            }}
          >
            {added ? '已在單字卡中' : '加入單字卡'}
          </button>
        </div>
      )}
    </aside>
  )
}
