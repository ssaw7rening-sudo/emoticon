import {
  ART_STYLE_ADDITIONS,
  EXTRA_CREATURE_TERMS,
  RANDOM_SUBJECT_EXTRAS,
  TAG_ADDITIONS,
  WORLD_STYLE_ALIASES,
  WORLD_STYLE_PRESETS,
} from './prompt-library-data.js'

const OBJECT_NAMES = {
  ko: 'CHARACTER_TAGS_KO',
  en: 'CHARACTER_TAGS_EN',
  ja: 'CHARACTER_TAGS_JA',
  zh: 'CHARACTER_TAGS_ZH',
}

function findMatchingBracket(source, openingIndex) {
  let depth = 0
  let quote = null
  let escaped = false

  for (let index = openingIndex; index < source.length; index += 1) {
    const char = source[index]

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

    if (char === "'" || char === '"' || char === '`') {
      quote = char
      continue
    }

    if (char === '[') depth += 1
    if (char === ']') {
      depth -= 1
      if (depth === 0) return index
    }
  }

  return -1
}

function toSingleQuotedString(value) {
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

function appendItemsToCategory(source, objectName, categoryKey, items) {
  if (!items?.length) return source

  const objectMarker = `const ${objectName} = {`
  const objectStart = source.indexOf(objectMarker)
  if (objectStart < 0) {
    throw new Error(`[prompt-library] ${objectName} was not found`)
  }

  const nextObjectStart = source.indexOf('\nconst CHARACTER_TAGS_', objectStart + objectMarker.length)
  const objectLimit = nextObjectStart >= 0 ? nextObjectStart : source.length

  const singleQuoteMarker = `'${categoryKey}': [`
  const doubleQuoteMarker = `"${categoryKey}": [`
  let categoryStart = source.indexOf(singleQuoteMarker, objectStart)
  if (categoryStart < 0 || categoryStart >= objectLimit) {
    categoryStart = source.indexOf(doubleQuoteMarker, objectStart)
  }
  if (categoryStart < 0 || categoryStart >= objectLimit) {
    throw new Error(`[prompt-library] ${objectName} / ${categoryKey} category was not found`)
  }

  const openingBracket = source.indexOf('[', categoryStart)
  const closingBracket = findMatchingBracket(source, openingBracket)
  if (openingBracket < 0 || closingBracket < 0 || closingBracket >= objectLimit) {
    throw new Error(`[prompt-library] ${objectName} / ${categoryKey} array boundary was not found`)
  }

  const currentBody = source.slice(openingBracket + 1, closingBracket)
  const additions = items.filter((item) => {
    const single = toSingleQuotedString(item)
    const double = JSON.stringify(item)
    return !currentBody.includes(single) && !currentBody.includes(double)
  })
  if (!additions.length) return source

  const trimmedBody = currentBody.trimEnd()
  const separator = !trimmedBody ? '' : trimmedBody.endsWith(',') ? ' ' : ', '
  const additionText = additions.map(toSingleQuotedString).join(', ')

  return `${source.slice(0, closingBracket)}${separator}${additionText}${source.slice(closingBracket)}`
}

function replaceExactlyOnce(source, from, to, label) {
  const first = source.indexOf(from)
  if (first < 0) throw new Error(`[prompt-library] ${label} anchor was not found`)
  const second = source.indexOf(from, first + from.length)
  if (second >= 0) throw new Error(`[prompt-library] ${label} anchor appeared more than once`)
  return `${source.slice(0, first)}${to}${source.slice(first + from.length)}`
}

function injectWorldStylePresets(source) {
  const functionAnchor = '  const getExpandedArtStyleText = (styleTag, isKo) => {'
  if (!source.includes('PROMPT_LIBRARY_WORLD_STYLE_PRESETS')) {
    const presetBlock = `  // PROMPT_LIBRARY_WORLD_STYLE_PRESETS — additive only; existing style definitions stay untouched.\n  const PROMPT_LIBRARY_WORLD_STYLE_PRESETS = ${JSON.stringify(WORLD_STYLE_PRESETS)};\n  const PROMPT_LIBRARY_WORLD_STYLE_ALIASES = ${JSON.stringify(WORLD_STYLE_ALIASES)};\n  const getPromptLibraryWorldStylePreset = (styleTag) => {\n    const presetId = PROMPT_LIBRARY_WORLD_STYLE_ALIASES[styleTag];\n    return presetId ? PROMPT_LIBRARY_WORLD_STYLE_PRESETS[presetId] : null;\n  };\n\n`
    source = replaceExactlyOnce(source, functionAnchor, `${presetBlock}${functionAnchor}`, 'art-style function')
  }

  const foundAnchor = '    const found = styleMap[styleTag];'
  const foundReplacement = '    const found = styleMap[styleTag] || getPromptLibraryWorldStylePreset(styleTag);'
  if (!source.includes(foundReplacement)) {
    source = replaceExactlyOnce(source, foundAnchor, foundReplacement, 'art-style lookup')
  }

  return source
}

function injectRandomSubjectExtras(source) {
  if (source.includes('promptLibraryRandomExtras')) return source

  const anchor = '    const allSubjects = ['
  const replacement = `    const promptLibraryRandomExtras = ${JSON.stringify(RANDOM_SUBJECT_EXTRAS)};\n\n    const allSubjects = [\n      ...promptLibraryRandomExtras,`
  return replaceExactlyOnce(source, anchor, replacement, 'random subject pool')
}

function injectCreatureRecognition(source) {
  if (source.includes('isExtraPromptLibraryCreature')) return source

  const textAnchor = "    const text = (subjectText || '').toLowerCase();"
  const textReplacement = `${textAnchor}\n    const promptLibraryCreatureTerms = ${JSON.stringify(EXTRA_CREATURE_TERMS)};\n    const isExtraPromptLibraryCreature = promptLibraryCreatureTerms.some((term) => text.includes(term.toLowerCase()));`
  source = replaceExactlyOnce(source, textAnchor, textReplacement, 'creature recognition text')

  const creaturePattern = /^(\s*const isAnimalOrCreature = .*?\.test\(text\));$/m
  const match = source.match(creaturePattern)
  if (!match) {
    throw new Error('[prompt-library] isAnimalOrCreature assignment was not found')
  }
  source = source.replace(creaturePattern, `${match[1]} || isExtraPromptLibraryCreature;`)

  return source
}

function verifyExpansion(source) {
  const requiredKoreanStyles = ART_STYLE_ADDITIONS.ko?.['🖌️ 화풍'] || []
  const requiredKoreanInsects = TAG_ADDITIONS.ko?.['🐞 곤충/벌레'] || []
  const required = [
    ...requiredKoreanStyles,
    ...requiredKoreanInsects,
    'PROMPT_LIBRARY_WORLD_STYLE_PRESETS',
    'getPromptLibraryWorldStylePreset',
    'promptLibraryRandomExtras',
    'isExtraPromptLibraryCreature',
  ]

  const missing = required.filter((item) => !source.includes(item))
  if (missing.length) {
    throw new Error(`[prompt-library] expansion verification failed: ${missing.join(', ')}`)
  }
}

export function promptLibraryExpansion() {
  return {
    name: 'prompt-library-expansion-v1',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/App.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      for (const [locale, categories] of Object.entries(TAG_ADDITIONS)) {
        const objectName = OBJECT_NAMES[locale]
        for (const [categoryKey, items] of Object.entries(categories)) {
          transformed = appendItemsToCategory(transformed, objectName, categoryKey, items)
        }
      }

      for (const [locale, categories] of Object.entries(ART_STYLE_ADDITIONS)) {
        const objectName = OBJECT_NAMES[locale]
        for (const [categoryKey, items] of Object.entries(categories)) {
          transformed = appendItemsToCategory(transformed, objectName, categoryKey, items)
        }
      }

      transformed = injectWorldStylePresets(transformed)
      transformed = injectRandomSubjectExtras(transformed)
      transformed = injectCreatureRecognition(transformed)
      verifyExpansion(transformed)

      return { code: transformed, map: null }
    },
  }
}
