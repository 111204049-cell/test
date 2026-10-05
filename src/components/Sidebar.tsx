import { useEffect, useRef, useState } from 'react'
import type { LibNode } from '../store/types'
import Icon from './Icon'

interface Props {
  childrenOf: (parentId: string | null) => LibNode[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onCreate: (parentId: string | null, type: 'folder' | 'note') => void
  onRename: (id: string, title: string) => void
  onDelete: (id: string) => void
  renamingId: string | null
  setRenamingId: (id: string | null) => void
  expanded: Set<string>
  toggle: (id: string) => void
  view: 'tree' | 'cards' | 'review'
  dueCount: number
  onView: (v: 'cards' | 'review') => void
}

export default function Sidebar(p: Props) {
  return (
    <nav className="sidebar" aria-label="科目樹">
      <button className={'side-home' + (p.view === 'tree' && p.selectedId === null ? ' on' : '')} onClick={() => p.onSelect(null)}>
        <Icon name="home" /> 首頁
      </button>
      <button className={'side-home' + (p.view === 'cards' ? ' on' : '')} onClick={() => p.onView('cards')}>
        <Icon name="cards" /> 單字卡
      </button>
      <button className={'side-home' + (p.view === 'review' ? ' on' : '')} onClick={() => p.onView('review')}>
        <Icon name="bolt" /> 複習
        {p.dueCount > 0 && <span className="badge">{p.dueCount}</span>}
      </button>
      <div className="side-head">
        <span>科目</span>
        <button className="icon-btn" title="新增頂層資料夾" onClick={() => p.onCreate(null, 'folder')}>
          <Icon name="plus" size={16} />
        </button>
      </div>
      <ul className="tree">
        {p.childrenOf(null).map((n) => (
          <Item key={n.id} node={n} depth={0} {...p} />
        ))}
      </ul>
    </nav>
  )
}

function Item({ node, depth, ...p }: Props & { node: LibNode; depth: number }) {
  const isFolder = node.type === 'folder'
  const open = p.expanded.has(node.id)
  const kids = isFolder ? p.childrenOf(node.id) : []
  return (
    <li>
      <div
        className={'row' + (p.view === 'tree' && p.selectedId === node.id ? ' on' : '')}
        style={{ paddingLeft: 8 + depth * 14 }}
        onClick={() => {
          p.onSelect(node.id)
          if (isFolder) p.toggle(node.id)
        }}
      >
        <span className={'caret' + (isFolder ? '' : ' none') + (open ? ' open' : '')}>
          <Icon name="chevron" size={14} />
        </span>
        <span className="kind">
          <Icon name={isFolder ? 'folder' : 'note'} size={16} />
        </span>
        {p.renamingId === node.id ? (
          <RenameInput value={node.title} onDone={(t) => { p.onRename(node.id, t); p.setRenamingId(null) }} />
        ) : (
          <span className="name" onDoubleClick={(e) => { e.stopPropagation(); p.setRenamingId(node.id) }}>
            {node.title || '未命名'}
          </span>
        )}
        <span className="acts" onClick={(e) => e.stopPropagation()}>
          {isFolder && (
            <>
              <button className="icon-btn" title="新增子資料夾" onClick={() => { p.onCreate(node.id, 'folder') }}>
                <Icon name="folder" size={14} />
              </button>
              <button className="icon-btn" title="新增筆記" onClick={() => { p.onCreate(node.id, 'note') }}>
                <Icon name="note" size={14} />
              </button>
            </>
          )}
          <button className="icon-btn" title="重新命名" onClick={() => p.setRenamingId(node.id)}>
            <Icon name="edit" size={14} />
          </button>
          <button className="icon-btn danger" title="刪除" onClick={() => p.onDelete(node.id)}>
            <Icon name="trash" size={14} />
          </button>
        </span>
      </div>
      {isFolder && open && kids.length > 0 && (
        <ul className="tree">
          {kids.map((k) => (
            <Item key={k.id} node={k} depth={depth + 1} {...p} />
          ))}
        </ul>
      )}
    </li>
  )
}

function RenameInput({ value, onDone }: { value: string; onDone: (title: string) => void }) {
  const [text, setText] = useState(value)
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])
  const finish = () => onDone(text.trim() || value)
  return (
    <input
      ref={ref}
      className="rename"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onBlur={finish}
      onKeyDown={(e) => {
        if (e.key === 'Enter') finish()
        if (e.key === 'Escape') onDone(value)
      }}
    />
  )
}
