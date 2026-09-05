import { GOLDEN_COMBOS_V2 } from './golden-combo-data-v2.js'

const APP_SUFFIX = '/src/App.jsx'
const FINAL_THEME_COUNT = 150
const EXPECTED_COMBO_COUNT = 12

function validateCombos() {
  if (GOLDEN_COMBOS_V2.length !== EXPECTED_COMBO_COUNT) {
    throw new Error(`[golden-combo-v2] expected ${EXPECTED_COMBO_COUNT} combos, found ${GOLDEN_COMBOS_V2.length}`)
  }

  const ids = new Set()
  let photoCount = 0
  let directCount = 0
  for (const combo of GOLDEN_COMBOS_V2) {
    if (!combo.id || ids.has(combo.id)) throw new Error(`[golden-combo-v2] duplicate/missing id: ${combo.id}`)
    ids.add(combo.id)
    if (!Number.isInteger(combo.themeIdx) || combo.themeIdx < 0 || combo.themeIdx >= FINAL_THEME_COUNT) {
      throw new Error(`[golden-combo-v2] invalid themeIdx for ${combo.id}: ${combo.themeIdx}`)
    }
    if (!combo.title?.ko || !combo.desc?.ko || !combo.tags?.ko) {
      throw new Error(`[golden-combo-v2] missing Korean copy for ${combo.id}`)
    }
    if (combo.characterSource === 'photo') photoCount += 1
    else if (combo.characterSource === 'direct') directCount += 1
    else throw new Error(`[golden-combo-v2] invalid characterSource for ${combo.id}`)
  }

  if (photoCount !== 4 || directCount !== 8) {
    throw new Error(`[golden-combo-v2] expected 4 photo + 8 direct combos, found ${photoCount} photo + ${directCount} direct`)
  }

  const requiredThemeIndexes = [138, 140, 142, 144, 146, 148]
  for (const index of requiredThemeIndexes) {
    if (!GOLDEN_COMBOS_V2.some((combo) => combo.themeIdx === index)) {
      throw new Error(`[golden-combo-v2] new phrase theme index ${index} is not represented`)
    }
  }
}

validateCombos()

export function goldenComboRebuildV2() {
  return {
    name: 'golden-combo-rebuild-v2',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(APP_SUFFIX)) return null

      let out = code.replace(/\r\n/g, '\n')
      const arrayMarker = 'const ALL_GOLDEN_COMBOS = ['
      const start = out.indexOf(arrayMarker)
      if (start < 0) throw new Error('[golden-combo-v2] ALL_GOLDEN_COMBOS marker not found')

      const aliasMarker = '\n\n// Alias for safety'
      const alias = out.indexOf(aliasMarker, start)
      if (alias < 0) throw new Error('[golden-combo-v2] alias marker not found')

      const replacement = `const ALL_GOLDEN_COMBOS = ${JSON.stringify(GOLDEN_COMBOS_V2, null, 2)};`
      out = `${out.slice(0, start)}${replacement}${out.slice(alias)}`

      const seasonalOld = "const isSeasonA = (a.seasonMonths || []).includes(currentMonth) ? 100 : 0;\n    const isSeasonB = (b.seasonMonths || []).includes(currentMonth) ? 100 : 0;\n    const scoreA = (comboStats[a.id] || 0) + isSeasonA;\n    const scoreB = (comboStats[b.id] || 0) + isSeasonB;"
      const seasonalNew = "const isSeasonA = (a.seasonMonths || []).includes(currentMonth) ? 35 : 0;\n    const isSeasonB = (b.seasonMonths || []).includes(currentMonth) ? 35 : 0;\n    const scoreA = (a.baseScore || 0) + (comboStats[a.id] || 0) + isSeasonA;\n    const scoreB = (b.baseScore || 0) + (comboStats[b.id] || 0) + isSeasonB;"
      if (!out.includes(seasonalOld)) throw new Error('[golden-combo-v2] ranking block not found')
      out = out.replace(seasonalOld, seasonalNew)

      const guideOld = "{lang === 'ko' ? '옆으로 밀어 더 보기 → 원하는 세트를 터치하세요' : lang === 'ja' ? '横にスワイプして表示 → セットをタップ' : lang === 'zh' ? '左右滑动查看更多 → 点击想要的组合' : 'Swipe sideways for more → Tap a combo'}"
      const guideNew = "{lang === 'ko' ? '📷 사진 추천 · 🎨 캐릭터 추천 → 원하는 조합을 터치하세요' : lang === 'ja' ? '📷 写真向け · 🎨 キャラ向け → 好きな組み合わせをタップ' : lang === 'zh' ? '📷 照片推荐 · 🎨 角色推荐 → 点击喜欢的组合' : '📷 Photo picks · 🎨 Character picks → Tap a combo'}"
      if (out.includes(guideOld)) out = out.replace(guideOld, guideNew)

      if (!out.includes("id: \"dialect-shiba\"") && !out.includes('"id": "dialect-shiba"')) {
        throw new Error('[golden-combo-v2] curated combo data was not injected')
      }

      return { code: out, map: null }
    },
  }
}
