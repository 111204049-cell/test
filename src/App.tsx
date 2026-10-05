import { useState } from 'react'
import { useLibrary } from './store/useLibrary'
import { useCards } from './store/useCards'
import CardsPage from './components/CardsPage'
import ReviewSession from './components/ReviewSession'
import Sidebar from './components/Sidebar'
import NoteEditor from './components/NoteEditor'
import FolderView from './components/FolderView'
import Home from './components/Home'
import Icon from './components/Icon'

export default function App() {
  const lib = useLibrary()
  const deck = useCards()
  const [view, setView] = useState<'tree' | 'cards' | 'review'>('tree')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['uni', 'uni-1']))
  const [drawer, setDrawer] = useState(false)

  if (!lib.ready || !deck.ready) return <div className="boot">載入中…</div>

  const selected = selectedId ? lib.byId.get(selectedId) ?? null : null
  const path = lib.pathOf(selected?.id ?? null)

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const dueCount = deck.cards.filter((c) => c.due <= Date.now()).length
  const existingFronts = new Set(deck.cards.map((c) => c.front.toLowerCase()))
  const folders = lib.nodes.filter((n) => n.type === 'folder')

  const select = (id: string | null) => {
    setView('tree')
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
          view={view}
          dueCount={dueCount}
          onView={(v) => {
            setView(v)
            setDrawer(false)
          }}
        />
      </aside>

      <main className="main">
        {view === 'tree' && path.length > 0 && (
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
        {view === 'cards' && (
          <CardsPage
            cards={deck.cards}
            folders={folders}
            dueCount={dueCount}
            onAdd={deck.add}
            onRemove={deck.remove}
            onReview={() => setView('review')}
          />
        )}
        {view === 'review' && <ReviewSession cards={deck.cards} onRate={deck.review} onExit={() => setView('cards')} />}
        {view === 'tree' && !selected && (
          <Home nodes={lib.nodes} topLevel={lib.childrenOf(null)} onOpen={select} onCreateTop={() => create(null, 'folder')} />
        )}
        {view === 'tree' && selected?.type === 'folder' && (
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
        {view === 'tree' && selected?.type === 'note' && (
          <NoteEditor
            key={selected.id}
            note={selected}
            onChange={(c) => lib.patch(selected.id, c)}
            existingFronts={existingFronts}
            onAddCard={(front, back) => deck.add(front, back, selected.parentId)}
          />
        )}
      </main>

      <nav className="tabbar glass-strong" aria-label="主要導覽">
        <button className={view === 'tree' && !drawer ? 'on' : ''} onClick={() => select(null)}>
          <Icon name="home" /> <span>首頁</span>
        </button>
        <button className={drawer ? 'on' : ''} onClick={() => setDrawer(true)}>
          <Icon name="folder" /> <span>科目</span>
        </button>
        <button className={view === 'cards' ? 'on' : ''} onClick={() => setView('cards')}>
          <Icon name="cards" /> <span>單字卡</span>
        </button>
        <button className={view === 'review' ? 'on' : ''} onClick={() => setView('review')}>
          <Icon name="bolt" /> <span>複習</span>
          {dueCount > 0 && <i className="tab-badge">{dueCount}</i>}
        </button>
      </nav>
    </div>
  )
}
