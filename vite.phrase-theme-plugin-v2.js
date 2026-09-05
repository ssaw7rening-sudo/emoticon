import { PHRASE_THEME_ADDITIONS, PHRASE_THEME_EXPECTED_ADDITIONS, PHRASES_PER_THEME } from './phrase-theme-data.js'

const additions = structuredClone(PHRASE_THEME_ADDITIONS)
additions.ko['명대사풍 ②'][11] = '새겨 둬'
additions.en['Cinematic Line ②'][11] = 'Mark my words'
additions.ja['名セリフ風 ②'][11] = '胸に刻め'
additions.zh['名台词风 ②'][11] = '刻在心里'

const OBJECTS = { ko: 'THEMES_KO', en: 'THEMES_EN', ja: 'THEMES_JA', zh: 'THEMES_ZH' }
const BASE_COUNT = 124
const FINAL_COUNT = BASE_COUNT + PHRASE_THEME_EXPECTED_ADDITIONS
const norm = (v) => String(v).toLocaleLowerCase('ko-KR').replace(/[\p{P}\p{S}\s]+/gu, '')
const quote = (v) => `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

function bounds(source, name) {
  const marker = `const ${name} = {`
  const start = source.indexOf(marker)
  if (start < 0) throw new Error(`[phrase-theme] ${name} not found`)
  const open = source.indexOf('{', start)
  let depth = 0, q = null, esc = false
  for (let i = open; i < source.length; i += 1) {
    const c = source[i]
    if (q) {
      if (esc) { esc = false; continue }
      if (c === '\\') { esc = true; continue }
      if (c === q) q = null
      continue
    }
    if (c === "'" || c === '"' || c === '`') { q = c; continue }
    if (c === '{') depth += 1
    if (c === '}' && --depth === 0) return { open, close: i, body: source.slice(open + 1, i) }
  }
  throw new Error(`[phrase-theme] ${name} closing brace not found`)
}

const countThemes = (body) => (body.match(/^\s*'(?:\\.|[^'])+'\s*:\s*\[/gm) || []).length

function existingPhrases(body) {
  const out = []
  const lines = body.match(/^\s*'(?:\\.|[^'])+'\s*:\s*\[.*\],?\s*$/gm) || []
  for (const line of lines) {
    const values = line.slice(line.indexOf('[') + 1, line.lastIndexOf(']'))
    const re = /'((?:\\.|[^'])*)'/g
    let m
    while ((m = re.exec(values))) out.push(m[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\'))
  }
  return out
}

function validateNewData() {
  const errors = []
  for (const [locale, themes] of Object.entries(additions)) {
    if (Object.keys(themes).length !== PHRASE_THEME_EXPECTED_ADDITIONS) errors.push(`${locale}: theme count`)
    for (const [name, phrases] of Object.entries(themes)) if (phrases.length !== PHRASES_PER_THEME) errors.push(`${locale}/${name}: phrase count ${phrases.length}`)
  }
  const seen = new Map()
  for (const [theme, phrases] of Object.entries(additions.ko)) for (const phrase of phrases) {
    const n = norm(phrase)
    if (seen.has(n)) errors.push(`new duplicate: "${phrase}" ↔ "${seen.get(n)}"`)
    else seen.set(n, phrase)
  }
  if (errors.length) throw new Error(`[phrase-theme] ${errors.join(' | ')}`)
}

function append(source, locale, objectName) {
  const b = bounds(source, objectName)
  const before = countThemes(b.body)
  if (before !== BASE_COUNT) throw new Error(`[phrase-theme] ${objectName}: expected ${BASE_COUNT}, found ${before}`)

  if (locale === 'ko') {
    const old = new Map(existingPhrases(b.body).map((p) => [norm(p), p]))
    const collisions = []
    for (const [theme, phrases] of Object.entries(additions.ko)) for (const phrase of phrases) {
      const hit = old.get(norm(phrase))
      if (hit) collisions.push(`${theme}: "${phrase}" ↔ existing "${hit}"`)
    }
    if (collisions.length) throw new Error(`[phrase-theme] existing Korean collisions (${collisions.length}): ${collisions.join(' | ')}`)
  }

  const rows = Object.entries(additions[locale]).map(([name, phrases]) => `  ${quote(name)}: [${phrases.map(quote).join(', ')}],`).join('\n')
  const next = `${source.slice(0, b.close)}\n${rows}\n${source.slice(b.close)}`
  const after = countThemes(bounds(next, objectName).body)
  if (after !== FINAL_COUNT) throw new Error(`[phrase-theme] ${objectName}: expected final ${FINAL_COUNT}, found ${after}`)
  return next
}

validateNewData()

export function phraseThemeExpansionV2() {
  return {
    name: 'phrase-theme-expansion-v2',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith('/src/App.jsx')) return null
      let out = code.replace(/\r\n/g, '\n')
      for (const [locale, objectName] of Object.entries(OBJECTS)) out = append(out, locale, objectName)
      return { code: out, map: null }
    },
  }
}
