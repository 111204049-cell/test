import type { LibNode } from './types'

const now = Date.now()
let order = 0

function node(id: string, parentId: string | null, type: LibNode['type'], title: string, content = ''): LibNode {
  return { id, parentId, type, title, content, order: order++, createdAt: now, updatedAt: now }
}

/** 第一次開啟時的範例結構，可以全部刪掉重來。 */
export function seedNodes(): LibNode[] {
  return [
    node('uni', null, 'folder', '大學'),
    node('uni-1', 'uni', 'folder', '大一'),
    node('uni-1-calc', 'uni-1', 'folder', '微積分'),
    node('art', null, 'folder', '藝術'),
    node('ai', null, 'folder', 'AI 學習'),
    node(
      'welcome',
      null,
      'note',
      '歡迎來到腦圖書館',
      [
        '這是你的私人學習空間。',
        '',
        '左邊是科目樹：每一層都可以自己命名，深度不限。',
        '大學可以分「大一 → 課程」，藝術和 AI 學習則可以用別的分法。',
        '',
        '目前可以做的事：',
        '- 新增、重新命名、刪除資料夾和筆記',
        '- 在筆記裡寫下學習內容，會自動保存',
        '',
        '之後會加入：單字卡與複習、PDF 螢光筆、影片、AI 小助手。',
      ].join('\n'),
    ),
  ]
}
