import { useState } from 'react'
import { useLibrary } from './store/useLibrary'
import Sidebar from './components/Sidebar'
import NoteEditor from './components/NoteEditor'
import FolderView from './components/FolderView'
import Home from './components/Home'
import Icon from './components/Icon'

export default function App() {
  const lib = useLibrary()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['uni', 'uni-1']))
  const [drawer, setDrawer] = useState(false)

  if (!lib.ready) return <div className="boot">載入中…</div>

  const selected = selectedId ? lib.byId.get(selectedId) ?? null : null
  const path = lib.pathOf(selected?.id ?? null)

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const select = (id: string | null) => {
    setSelectedId(id)
    setDrawer(false)
  }

  const create = (parentId: string | null, type: 'folder' | 'note') => {
    const node = lib.create(parentId, type, type === 'folder' ? '新資料夾' : '新筆記')
    if (parentId) setExpanded((prev) => new Set(prev).add(parentId))
    if (type === 'folder') setRenamingId(node.id)
    else setSelectedId(node.id)
  }

  const remove = (id: string) => {
    const n = lib.byId.get(id)
    if (!n) return
    const hasKids = lib.childrenOf(id).length > 0
    const msg = hasKids ? `刪除「${n.title}」和裡面的所有內容？這個動作無法復原。` : `刪除「${n.title}」？`
    if (!window.confirm(msg)) return
    const gone = lib.remove(id)
    if (selectedId && gone.has(selectedId)) setSelectedId(n.parentId)
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="icon-btn menu" aria-label="開啟選單" onClick={() => setDrawer(true)}>
          <Icon name="menu" />
        </button>
        <span className="brand">腦圖書館</span>
      </header>

      {drawer && <div className="scrim" onClick={() => setDrawer(false)} />}
      <aside className={'side-wrap glass-strong' + (drawer ? ' open' : '')}>
        <div className="side-brand">
          <span className="brand">腦圖書館</span>
          <button className="icon-btn menu" aria-label="關閉選單" onClick={() => setDrawer(false)}>
            <Icon name="close" />
          </button>
        </div>
        <Sidebar
          childrenOf={lib.childrenOf}
          selectedId={selectedId}
          onSelect={select}
          onCreate={create}
          onRename={(id, title) => lib.patch(id, { title })}
          onDelete={remove}
          renamingId={renamingId}
          setRenamingId={setRenamingId}
          expanded={expanded}
          toggle={toggle}
        />
      </aside>

      <main className="main">
        {path.length > 0 && (
          <div className="crumbs" aria-label="目前位置">
            <button onClick={() => select(null)}>首頁</button>
            {path.map((n) => (
              <span key={n.id}>
                <i>/</i>
                <button onClick={() => select(n.id)}>{n.title || '未命名'}</button>
              </span>
            ))}
          </div>
        )}
        {!selected && (
          <Home nodes={lib.nodes} topLevel={lib.childrenOf(null)} onOpen={select} onCreateTop={() => create(null, 'folder')} />
        )}
        {selected?.type === 'folder' && (
          <FolderView
            folder={selected}
            items={lib.childrenOf(selected.id)}
            onOpen={(id) => {
              setExpanded((prev) => new Set(prev).add(selected.id))
              select(id)
            }}
            onCreate={(type) => create(selected.id, type)}
          />
        )}
        {selected?.type === 'note' && <NoteEditor key={selected.id} note={selected} onChange={(c) => lib.patch(selected.id, c)} />}
      </main>
    </div>
  )
}
