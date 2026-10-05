/**
 * 查字：英文釋義與音標來自 Free Dictionary API，中文翻譯來自 MyMemory。
 * 兩個都免費、不用金鑰。查過的字存在本機，同一個字不會重複送出請求。
 */
export interface Lookup {
  word: string
  phonetic?: string
  meanings: { pos: string; def: string }[]
  zh?: string
}

const CACHE_KEY = 'naotushuguan:v1:dict'
const MAX_CACHED = 500

function readCache(): Record<string, Lookup> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeCache(key: string, value: Lookup) {
  try {
    const all = readCache()
    all[key] = value
    const keys = Object.keys(all)
    if (keys.length > MAX_CACHED) for (const k of keys.slice(0, keys.length - MAX_CACHED)) delete all[k]
    localStorage.setItem(CACHE_KEY, JSON.stringify(all))
  } catch {
    /* 沒有儲存空間就不快取 */
  }
}

async function fetchJson(url: string, signal?: AbortSignal) {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(String(res.status))
  return res.json()
}

export async function lookup(raw: string, signal?: AbortSignal): Promise<Lookup> {
  const word = raw.trim()
  const key = word.toLowerCase()
  const hit = readCache()[key]
  if (hit) return hit

  const isSingleEnglishWord = /^[A-Za-z][A-Za-z'-]*$/.test(word)
  const q = encodeURIComponent(word)
  const [dict, zh] = await Promise.allSettled([
    isSingleEnglishWord ? fetchJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${q}`, signal) : Promise.reject(new Error('skip')),
    fetchJson(`https://api.mymemory.translated.net/get?q=${q}&langpair=${/[A-Za-z]/.test(word) ? 'en|zh-TW' : 'zh-TW|en'}`, signal),
  ])

  const out: Lookup = { word, meanings: [] }
  if (dict.status === 'fulfilled' && Array.isArray(dict.value) && dict.value[0]) {
    const e = dict.value[0]
    out.phonetic = e.phonetic || e.phonetics?.find((p: { text?: string }) => p.text)?.text
    for (const m of (e.meanings ?? []).slice(0, 3)) {
      const def = m.definitions?.[0]?.definition
      if (def) out.meanings.push({ pos: m.partOfSpeech, def })
    }
  }
  if (zh.status === 'fulfilled') {
    const t: string | undefined = zh.value?.responseData?.translatedText
    if (t && t.toLowerCase() !== key && !/MYMEMORY WARNING/i.test(t)) out.zh = t
  }
  if (!out.zh && out.meanings.length === 0) throw new Error('not-found')
  writeCache(key, out)
  return out
}

/** 取出包含 [index, index+length) 的那個句子，當作例句。 */
export function sentenceAround(text: string, index: number, length: number): string {
  const enders = /[.!?。！？\n]/
  let start = index
  while (start > 0 && !enders.test(text[start - 1])) start--
  let end = index + length
  while (end < text.length && !enders.test(text[end])) end++
  if (end < text.length && text[end] !== '\n') end++
  return text.slice(start, end).trim().slice(0, 240)
}
