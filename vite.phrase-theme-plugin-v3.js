import { PHRASE_THEME_ADDITIONS_V3, PHRASE_THEME_EXPECTED_ADDITIONS_V3, PHRASES_PER_THEME_V3 } from './phrase-theme-data-v3.js'

const additions = structuredClone(PHRASE_THEME_ADDITIONS_V3)
const OBJECTS = { ko: 'THEMES_KO', en: 'THEMES_EN', ja: 'THEMES_JA', zh: 'THEMES_ZH' }
const BASE_COUNT = 138
const FINAL_COUNT = BASE_COUNT + PHRASE_THEME_EXPECTED_ADDITIONS_V3
const norm = (v) => String(v).toLocaleLowerCase('ko-KR').replace(/[\p{P}\p{S}\s]+/gu, '')
const quote = (v) => `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

function bounds(source, name) {
  const marker = `const ${name} = {`
  const start = source.indexOf(marker)
  if (start < 0) throw new Error(`[phrase-theme-v3] ${name} not found`)
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
  throw new Error(`[phrase-theme-v3] ${name} closing brace not found`)
}

const countThemes = (body) => (body.match(/^\s*'(?:\\.|[^'])+'\s*:\s*\[/gm) || []).length

function existingThemes(body) {
  return new Set((body.match(/^\s*'((?:\\.|[^'])+)'\s*:\s*\[/gm) || []).map((line) => {
    const m = line.match(/^\s*'((?:\\.|[^'])+)'/)
    return m ? m[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\') : ''
  }).filter(Boolean))
}

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
    if (Object.keys(themes).length !== PHRASE_THEME_EXPECTED_ADDITIONS_V3) errors.push(`${locale}: theme count ${Object.keys(themes).length}`)
    for (const [name, phrases] of Object.entries(themes)) {
      if (phrases.length !== PHRASES_PER_THEME_V3) errors.push(`${locale}/${name}: phrase count ${phrases.length}`)
    }
  }

  const seen = new Map()
  for (const [theme, phrases] of Object.entries(additions.ko)) {
    for (const phrase of phrases) {
      const n = norm(phrase)
      if (seen.has(n)) errors.push(`new Korean duplicate: ${theme} "${phrase}" ↔ "${seen.get(n)}"`)
      else seen.set(n, phrase)
    }
  }

  if (errors.length) throw new Error(`[phrase-theme-v3] ${errors.join(' | ')}`)
}

function append(source, locale, objectName) {
  const b = bounds(source, objectName)
  const before = countThemes(b.body)
  if (before !== BASE_COUNT) throw new Error(`[phrase-theme-v3] ${objectName}: expected ${BASE_COUNT} themes before append, found ${before}`)

  const oldThemes = existingThemes(b.body)
  const duplicateThemeNames = Object.keys(additions[locale]).filter((name) => oldThemes.has(name))
  if (duplicateThemeNames.length) throw new Error(`[phrase-theme-v3] ${objectName}: duplicate theme names ${duplicateThemeNames.join(', ')}`)

  if (locale === 'ko') {
    const old = new Map(existingPhrases(b.body).map((p) => [norm(p), p]))
    const collisions = []
    for (const [theme, phrases] of Object.entries(additions.ko)) {
      for (const phrase of phrases) {
        const hit = old.get(norm(phrase))
        if (hit) collisions.push(`${theme}: "${phrase}" ↔ existing "${hit}"`)
      }
    }
    if (collisions.length) throw new Error(`[phrase-theme-v3] existing Korean collisions (${collisions.length}): ${collisions.join(' | ')}`)
  }

  const rows = Object.entries(additions[locale]).map(([name, phrases]) => `  ${quote(name)}: [${phrases.map(quote).join(', ')}],`).join('\n')
  const next = `${source.slice(0, b.close)}\n${rows}\n${source.slice(b.close)}`
  const after = countThemes(bounds(next, objectName).body)
  if (after !== FINAL_COUNT) throw new Error(`[phrase-theme-v3] ${objectName}: expected final ${FINAL_COUNT}, found ${after}`)
  return next
}

validateNewData()

export function phraseThemeExpansionV3() {
  return {
    name: 'phrase-theme-expansion-v3',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith('/src/App.jsx')) return null
      let out = code.replace(/\r\n/g, '\n')
      for (const [locale, objectName] of Object.entries(OBJECTS)) out = append(out, locale, objectName)
      return { code: out, map: null }
    },
  }
}
