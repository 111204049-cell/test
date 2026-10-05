import type { LibNode } from '../store/types'
import Icon from './Icon'

interface Props {
  folder: LibNode
  items: LibNode[]
  onOpen: (id: string) => void
  onCreate: (type: 'folder' | 'note') => void
}

export default function FolderView({ folder, items, onOpen, onCreate }: Props) {
  return (
    <section className="page">
      <p className="eyebrow">資料夾</p>
      <h1 className="big">{folder.title}</h1>
      <div className="actions">
        <button className="btn" onClick={() => onCreate('folder')}>
          <Icon name="folder" size={16} /> 新增子資料夾
        </button>
        <button className="btn primary" onClick={() => onCreate('note')}>
          <Icon name="note" size={16} /> 新增筆記
        </button>
      </div>
      {items.length === 0 ? (
        <p className="empty">這裡還是空的。先新增一個子資料夾或一篇筆記吧。</p>
      ) : (
        <div className="cards">
          {items.map((n) => (
            <button key={n.id} className="glass card-item" onClick={() => onOpen(n.id)}>
              <span className="card-kind">
                <Icon name={n.type === 'folder' ? 'folder' : 'note'} size={16} />
                {n.type === 'folder' ? '資料夾' : '筆記'}
              </span>
              <strong>{n.title || '未命名'}</strong>
              {n.type === 'note' && <span className="snippet">{n.content.slice(0, 60) || '（空白）'}</span>}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
