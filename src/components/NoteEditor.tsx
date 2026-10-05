import type { LibNode } from '../store/types'

export default function NoteEditor({ note, onChange }: { note: LibNode; onChange: (c: Partial<Pick<LibNode, 'title' | 'content'>>) => void }) {
  const chars = note.content.replace(/\s/g, '').length
  return (
    <article className="editor">
      <input
        className="note-title"
        value={note.title}
        placeholder="筆記標題"
        aria-label="筆記標題"
        onChange={(e) => onChange({ title: e.target.value })}
      />
      <textarea
        className="note-body"
        value={note.content}
        placeholder="在這裡寫下今天學到的東西…"
        aria-label="筆記內容"
        onChange={(e) => onChange({ content: e.target.value })}
      />
      <footer className="note-foot">
        <span>{chars} 字</span>
        <span>自動保存 · {new Date(note.updatedAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</span>
      </footer>
    </article>
  )
}
