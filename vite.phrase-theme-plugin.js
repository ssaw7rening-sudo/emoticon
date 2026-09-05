import {
  PHRASE_THEME_ADDITIONS,
  PHRASE_THEME_EXPECTED_ADDITIONS,
  PHRASES_PER_THEME,
} from './phrase-theme-data.js'

const THEME_OBJECTS = {
  ko: 'THEMES_KO',
  en: 'THEMES_EN',
  ja: 'THEMES_JA',
  zh: 'THEMES_ZH',
}

const EXPECTED_BASE_THEME_COUNT = 124
const EXPECTED_FINAL_THEME_COUNT = EXPECTED_BASE_THEME_COUNT + PHRASE_THEME_EXPECTED_ADDITIONS

function findMatchingBrace(source, openingIndex) {
  let depth = 0
  let quote = null
  let escaped = false
  let lineComment = false
  let blockComment = false

  for (let i = openingIndex; i < source.length; i += 1) {
    const char = source[i]
    const next = source[i + 1]

    if (lineComment) {
      if (char === '\n') lineComment = false
      continue
    }
    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false
        i += 1
      }
      continue
    }
    if (quote) {
      if (escaped) {
        escaped = false
        continue
      }
      if (char === '\\') {
        escaped = true
        continue
      }
      if (char === quote) quote = null
      continue
    }

    if (char === '/' && next === '/') {
      lineComment = true
      i += 1
      continue
    }
    if (char === '/' && next === '*') {
      blockComment = true
      i += 1
      continue
    }
    if (char === "'" || char === '"' || char === '`') {
      quote = char
      continue
    }
    if (char === '{') depth += 1
    if (char === '}') {
      depth -= 1
      if (depth === 0) return i
    }
  }

  return -1
}

function getObjectBounds(source, objectName) {
  const marker = `const ${objectName} = {`
  const markerIndex = source.indexOf(marker)
  if (markerIndex < 0) throw new Error(`[phrase-theme] ${objectName} was not found`)
  const open = source.indexOf('{', markerIndex)
  const close = findMatchingBrace(source, open)
  if (open < 0 || close < 0) throw new Error(`[phrase-theme] ${objectName} bounds were not found`)
  return { open, close, body: source.slice(open + 1, close) }
}

function countThemeEntries(body) {
  return (body.match(/^\s*'(?:\\.|[^'])+'\s*:\s*\[/gm) || []).length
}

function decodeSingleQuoted(value) {
  return value.replace(/\\'/g, "'").replace(/\\\\/g, '\\')
}

function extractPhraseValues(body) {
  const phrases = []
  const linePattern = /^\s*'(?:\\.|[^'])+'\s*:\s*\[(.*)\],?\s*$/gm
  let lineMatch
  while ((lineMatch = linePattern.exec(body))) {
    const valuesPart = lineMatch[1]
    const stringPattern = /'((?:\\.|[^'])*)'/g
    let stringMatch
    while ((stringMatch = stringPattern.exec(valuesPart))) {
      phrases.push(decodeSingleQuoted(stringMatch[1]))
    }
  }
  return phrases
}

function normalizePhrase(value) {
  return String(value)
    .toLocaleLowerCase('ko-KR')
    .replace(/[\p{P}\p{S}\s]+/gu, '')
}

function validateData() {
  for (const [locale, themes] of Object.entries(PHRASE_THEME_ADDITIONS)) {
    const entries = Object.entries(themes)
    if (entries.length !== PHRASE_THEME_EXPECTED_ADDITIONS) {
      throw new Error(`[phrase-theme] ${locale} must contain exactly ${PHRASE_THEME_EXPECTED_ADDITIONS} new themes; found ${entries.length}`)
    }
    for (const [themeName, phrases] of entries) {
      if (phrases.length !== PHRASES_PER_THEME) {
        throw new Error(`[phrase-theme] ${locale}/${themeName} must contain exactly ${PHRASES_PER_THEME} phrases; found ${phrases.length}`)
      }
    }
  }

  const seenKo = new Map()
  for (const [themeName, phrases] of Object.entries(PHRASE_THEME_ADDITIONS.ko)) {
    for (const phrase of phrases) {
      const normalized = normalizePhrase(phrase)
      if (!normalized) throw new Error(`[phrase-theme] empty normalized Korean phrase in ${themeName}: ${phrase}`)
      const previous = seenKo.get(normalized)
      if (previous) {
        throw new Error(`[phrase-theme] duplicate new Korean phrase: "${phrase}" in ${themeName}; conflicts with "${previous.phrase}" in ${previous.theme}`)
      }
      seenKo.set(normalized, { theme: themeName, phrase })
    }
  }
}

function quote(value) {
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

function serializeThemeEntries(themes) {
  return Object.entries(themes)
    .map(([themeName, phrases]) => `  ${quote(themeName)}: [${phrases.map(quote).join(', ')}],`)
    .join('\n')
}

function appendThemes(source, locale, objectName, themes) {
  const bounds = getObjectBounds(source, objectName)
  const baseCount = countThemeEntries(bounds.body)
  if (baseCount !== EXPECTED_BASE_THEME_COUNT) {
    throw new Error(`[phrase-theme] ${objectName} expected ${EXPECTED_BASE_THEME_COUNT} existing themes, found ${baseCount}`)
  }

  if (locale === 'ko') {
    const existingNormalized = new Map()
    for (const phrase of extractPhraseValues(bounds.body)) {
      const normalized = normalizePhrase(phrase)
      if (normalized && !existingNormalized.has(normalized)) existingNormalized.set(normalized, phrase)
    }
    for (const [themeName, phrases] of Object.entries(themes)) {
      for (const phrase of phrases) {
        const normalized = normalizePhrase(phrase)
        const conflict = existingNormalized.get(normalized)
        if (conflict) {
          throw new Error(`[phrase-theme] Korean phrase already exists: "${phrase}" in ${themeName}; existing phrase: "${conflict}"`)
        }
      }
    }
  }

  const duplicateTheme = Object.keys(themes).find((name) => bounds.body.includes(`${quote(name)}:`))
  if (duplicateTheme) throw new Error(`[phrase-theme] theme already exists in ${objectName}: ${duplicateTheme}`)

  const insertion = `\n${serializeThemeEntries(themes)}\n`
  const transformed = `${source.slice(0, bounds.close)}${insertion}${source.slice(bounds.close)}`
  const finalBounds = getObjectBounds(transformed, objectName)
  const finalCount = countThemeEntries(finalBounds.body)
  if (finalCount !== EXPECTED_FINAL_THEME_COUNT) {
    throw new Error(`[phrase-theme] ${objectName} expected ${EXPECTED_FINAL_THEME_COUNT} final themes, found ${finalCount}`)
  }
  return transformed
}

validateData()

export function phraseThemeExpansion() {
  return {
    name: 'phrase-theme-expansion-v1',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/App.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')
      for (const [locale, objectName] of Object.entries(THEME_OBJECTS)) {
        transformed = appendThemes(transformed, locale, objectName, PHRASE_THEME_ADDITIONS[locale])
      }

      for (const requiredName of Object.keys(PHRASE_THEME_ADDITIONS.ko)) {
        if (!transformed.includes(requiredName)) {
          throw new Error(`[phrase-theme] verification failed: ${requiredName} is missing`)
        }
      }

      return { code: transformed, map: null }
    },
  }
}
