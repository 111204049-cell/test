import type { LibNode } from '../store/types'
import Icon from './Icon'

interface Props {
  nodes: LibNode[]
  topLevel: LibNode[]
  onOpen: (id: string) => void
  onCreateTop: () => void
}

export default function Home({ nodes, topLevel, onOpen, onCreateTop }: Props) {
  const folders = nodes.filter((n) => n.type === 'folder').length
  const notes = nodes.filter((n) => n.type === 'note').length
  const recent = nodes
    .filter((n) => n.type === 'note')
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 4)
  return (
    <section className="page">
      <p className="eyebrow">腦圖書館</p>
      <h1 className="big">
        你的私人
        <br />
        學習空間<span className="dot">.</span>
      </h1>
      <p className="lead">所有資料只屬於你。從左邊挑一個科目開始，或先建一個新的。</p>

      <div className="stats">
        <div className="glass stat">
          <b>{folders}</b>
          <span>資料夾</span>
        </div>
        <div className="glass stat">
          <b>{notes}</b>
          <span>筆記</span>
        </div>
      </div>

      <div className="section-head">
        <h2>科目</h2>
        <button className="btn" onClick={onCreateTop}>
          <Icon name="plus" size={16} /> 新增科目
        </button>
      </div>
      <div className="cards">
        {topLevel.map((n) => (
          <button key={n.id} className="glass card-item" onClick={() => onOpen(n.id)}>
            <span className="card-kind">
              <Icon name={n.type === 'folder' ? 'folder' : 'note'} size={16} />
              {n.type === 'folder' ? '資料夾' : '筆記'}
            </span>
            <strong>{n.title || '未命名'}</strong>
          </button>
        ))}
      </div>

      {recent.length > 0 && (
        <>
          <div className="section-head">
            <h2>最近編輯</h2>
          </div>
          <div className="cards">
            {recent.map((n) => (
              <button key={n.id} className="glass card-item" onClick={() => onOpen(n.id)}>
                <span className="card-kind">
                  <Icon name="note" size={16} /> 筆記
                </span>
                <strong>{n.title || '未命名'}</strong>
                <span className="snippet">{n.content.slice(0, 60) || '（空白）'}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
