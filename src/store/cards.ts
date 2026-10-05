import { createEmptyCard, fsrs, generatorParameters, Rating, State, type Card as FsrsCard, type Grade } from 'ts-fsrs'

/**
 * 一張學習卡。排程欄位對應 FSRS 演算法，時間一律存毫秒，
 * 這樣不論換成哪個儲存層都不用處理日期格式。
 * 單字和學科問答共用同一個結構：正面是單字或問題，背面是解釋或答案。
 */
export interface StudyCard {
  id: string
  folderId: string | null
  front: string
  back: string
  createdAt: number
  due: number
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  learning_steps: number
  reps: number
  lapses: number
  state: number
  last_review?: number
}

export const GRADES: { grade: Grade; label: string; key: string }[] = [
  { grade: Rating.Again, label: '再一次', key: '1' },
  { grade: Rating.Hard, label: '困難', key: '2' },
  { grade: Rating.Good, label: '良好', key: '3' },
  { grade: Rating.Easy, label: '簡單', key: '4' },
]

const scheduler = fsrs(generatorParameters({ enable_fuzz: true }))

const toFsrs = (c: StudyCard): FsrsCard => ({
  due: new Date(c.due),
  stability: c.stability,
  difficulty: c.difficulty,
  elapsed_days: c.elapsed_days,
  scheduled_days: c.scheduled_days,
  learning_steps: c.learning_steps,
  reps: c.reps,
  lapses: c.lapses,
  state: c.state as State,
  last_review: c.last_review ? new Date(c.last_review) : undefined,
})

const fromFsrs = (base: StudyCard, f: FsrsCard): StudyCard => ({
  ...base,
  due: f.due.getTime(),
  stability: f.stability,
  difficulty: f.difficulty,
  elapsed_days: f.elapsed_days,
  scheduled_days: f.scheduled_days,
  learning_steps: f.learning_steps,
  reps: f.reps,
  lapses: f.lapses,
  state: f.state,
  last_review: f.last_review?.getTime(),
})

export function newCard(id: string, front: string, back: string, folderId: string | null, now = Date.now()): StudyCard {
  const empty = createEmptyCard(new Date(now))
  return fromFsrs({ id, folderId, front, back, createdAt: now } as StudyCard, empty)
}

/** 按下某個評分後的新狀態。 */
export function rate(card: StudyCard, grade: Grade, now = Date.now()): StudyCard {
  const result = scheduler.next(toFsrs(card), new Date(now), grade)
  return fromFsrs(card, result.card)
}

/** 把「多久之後再出現」變成人看得懂的字。 */
export function formatInterval(ms: number): string {
  const min = Math.max(1, Math.round(ms / 60000))
  if (min < 60) return `${min} 分鐘`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr} 小時`
  const day = Math.round(hr / 24)
  if (day < 30) return `${day} 天`
  const mon = Math.round(day / 30)
  return mon < 12 ? `${mon} 個月` : `${(day / 365).toFixed(1)} 年`
}

/** 四個評分按鈕各自會把這張卡排到多久之後。 */
export function previewIntervals(card: StudyCard, now = Date.now()): Record<number, string> {
  const rec = scheduler.repeat(toFsrs(card), new Date(now))
  const out: Record<number, string> = {}
  for (const { grade } of GRADES) out[grade] = formatInterval(rec[grade].card.due.getTime() - now)
  return out
}

export const stateLabel = (s: number) => (s === State.New ? '新卡' : s === State.Learning ? '學習中' : s === State.Review ? '複習' : '重學')

export function seedCards(now = Date.now()): StudyCard[] {
  return [
    ['ephemeral', 'adj. 短暫的；朝生暮死的'],
    ['ubiquitous', 'adj. 無所不在的'],
    ['微積分的基本定理說了什麼？', '連結微分與積分：對 f 的積分函數求導，會得到 f 本身。'],
  ].map(([front, back], i) => newCard(`seed-${i}`, front, back, null, now))
}
