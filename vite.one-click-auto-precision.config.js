import { defineConfig } from 'vite'
import baseConfig from './vite.hair-fur-precision-v3.config.js'

function oneClickUiCleanup() {
  return {
    name: 'one-click-auto-precision-ui-v4',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      // The default action already chooses the processing route automatically.
      // Hide manual retry controls so the UI matches the actual one-click flow.
      const precisionUi = `          {resultUrl && ['ai', 'modnet'].includes(resultMethod) && (
            <div className="mt-3 rounded-xl border border-[#D8D0C5] bg-white px-3.5 py-3">
              <button type="button" disabled={busy} onClick={runPrecisionRetry} className="w-full rounded-xl bg-[#4B5868] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#394554] disabled:cursor-wait disabled:opacity-60">
                🧪 {busy && stage === 'precision' ? t.precisionWorking : t.precisionRetry}
              </button>
              <p className="mt-2 text-[11px] sm:text-xs font-medium leading-5 text-[#7B746B]">{t.precisionHint}</p>
            </div>
          )}

`
      if (transformed.includes(precisionUi)) transformed = transformed.replace(precisionUi, '')

      const hairFurUi = `          {resultUrl && ['ai', 'modnet', 'birefnet', 'hair-fur'].includes(resultMethod) && (
            <div className="mt-3 rounded-xl border border-[#D7DED2] bg-[#FCFEFB] px-3.5 py-3">
              <button type="button" disabled={busy} onClick={runHairFurRetry} className="w-full rounded-xl bg-[#556B55] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#455B45] disabled:cursor-wait disabled:opacity-60">
                🪶 {busy && stage === 'hair-fur' ? getHairFurText(lang).working : getHairFurText(lang).retry}
              </button>
              <p className="mt-2 text-[11px] sm:text-xs font-medium leading-5 text-[#6F786B]">{getHairFurText(lang).hint}</p>
            </div>
          )}

`
      if (transformed.includes(hairFurUi)) transformed = transformed.replace(hairFurUi, '')

      transformed = transformed
        .replaceAll("['ai', 'modnet'].includes(resultMethod)", "['ai', 'modnet', 'birefnet', 'ben2'].includes(resultMethod)")
        .replace("remove: '배경 제거하기'", "remove: '자동 배경 제거'")
        .replace("remove: 'Remove background'", "remove: 'Auto remove background'")
        .replace("remove: '背景を削除する'", "remove: '自動で背景を削除'")
        .replace("remove: '移除背景'", "remove: '自动移除背景'")
        .replace("precisionWorking: '정밀 모델로 다시 처리하고 있어요…'", "precisionWorking: '정밀하게 배경을 제거하고 있어요…'")
        .replace("precisionWorking: 'Retrying with the precision model…'", "precisionWorking: 'Removing the background with precision…'")
        .replace("precisionWorking: '高精度モデルで再処理しています…'", "precisionWorking: '高精度で背景を削除しています…'")
        .replace("precisionWorking: '正在使用高精度模型重新处理…'", "precisionWorking: '正在高精度移除背景…'")
        .replace(
          "first: '균일한 단색 배경은 빠르게 처리하며, 복잡한 배경은 AI 모델을 사용해 처음 실행이 조금 오래 걸릴 수 있습니다.'",
          "first: '균일한 단색 배경은 빠르게 처리하고, 인물·머리카락·털·복잡한 배경은 처음부터 정밀 모델을 한 번만 사용합니다.'"
        )
        .replace(
          "first: 'Uniform solid-color backgrounds are handled quickly. Complex backgrounds use an AI model, so the first run may take longer.'",
          "first: 'Uniform backgrounds use the fast path. Portraits, hair, fur and complex backgrounds go directly through one precision pass.'"
        )
        .replace(
          "first: '均一な単色背景は高速処理し、複雑な背景ではAIモデルを使用するため初回は少し時間がかかる場合があります。'",
          "first: '均一な単色背景は高速処理し、人物・髪・毛並み・複雑な背景は最初から高精度モデルで1回だけ処理します。'"
        )
        .replace(
          "first: '均匀的纯色背景会快速处理；复杂背景会使用AI模型，因此首次使用可能稍慢。'",
          "first: '均匀纯色背景使用快速处理；人物、发丝、毛发和复杂背景会直接使用一次高精度处理。'"
        )

      return { code: transformed, map: null }
    },
  }
}

function saferStickerGridRouting() {
  return {
    name: 'safer-sticker-grid-routing-v1',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')
      const oldSelection = `  const portrait = evaluate(3, 5);
  const landscape = evaluate(5, 3);
  const best = portrait.score >= landscape.score ? portrait : landscape;`

      if (!transformed.includes(oldSelection)) {
        throw new Error('[safer-sticker-grid] Grid orientation selection was not found')
      }

      const safeSelection = `  const portrait = evaluate(3, 5);
  const landscape = evaluate(5, 3);

  // Generated 15-emoticon sheets are normally 5 columns × 3 rows even when
  // the source canvas itself is square. The previous score-only decision could
  // occasionally choose 3 × 5 on a square image and slice two neighboring
  // stickers into the same output cell. Prefer 5 × 3 for square/landscape
  // sheets, and use 3 × 5 only when the canvas is clearly portrait or when the
  // alpha-grid evidence is overwhelmingly stronger.
  const clearlyPortraitCanvas = sourceHeight >= sourceWidth * 1.16;
  const clearlyLandscapeCanvas = sourceWidth >= sourceHeight * 1.16;
  const portraitClearlyStronger =
    portrait.nonEmpty >= 14 &&
    landscape.nonEmpty <= 12 &&
    portrait.score >= landscape.score + 0.14;
  const landscapeClearlyStronger =
    landscape.nonEmpty >= 14 &&
    portrait.nonEmpty <= 12 &&
    landscape.score >= portrait.score + 0.14;

  let best;
  if (clearlyPortraitCanvas) best = portrait;
  else if (clearlyLandscapeCanvas) best = landscape;
  else if (portraitClearlyStronger) best = portrait;
  else if (landscapeClearlyStronger) best = landscape;
  else best = landscape; // square sheets default to the expected 5 × 3 layout`

      transformed = transformed.replace(oldSelection, safeSelection)
      return { code: transformed, map: null }
    },
  }
}

function singlePassRouting() {
  return {
    name: 'single-pass-background-routing-v4',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      // BEN2 routing has already decided whether a device is low-power at this
      // point. For the automatic flow, use the precision branch for every
      // non-uniform image so we do not run a lightweight AI model first and then
      // repeat the image with the precision model.
      const ben2RoutePattern = /const\s+portraitFirst\s*=\s*!lowPowerForBen2;[^\n]*/
      const baseRoutePattern = /const\s+portraitFirst\s*=\s*!isMobileLikeDevice\(\);[^\n]*/

      if (ben2RoutePattern.test(transformed)) {
        transformed = transformed.replace(
          ben2RoutePattern,
          `const portraitFirst = true; // uniform background => fast, otherwise one BEN2 precision pass`
        )
      } else if (baseRoutePattern.test(transformed)) {
        transformed = transformed.replace(
          baseRoutePattern,
          `const portraitFirst = true; // uniform background => fast, otherwise one precision pass`
        )
      } else {
        throw new Error('[single-pass-routing] Precision route marker was not found')
      }

      // Quality warnings are still shown, but they no longer launch a second full
      // AI model. A fallback model is used only when the current model fails to
      // produce any result blob at all.
      const qualityFallback = "if (!blob || quality.status === 'fail') {"
      const fallbackCount = transformed.split(qualityFallback).length - 1
      if (fallbackCount < 2) {
        throw new Error('[single-pass-routing] Precision fallback markers were not found')
      }
      transformed = transformed.replaceAll(qualityFallback, "if (!blob) {")

      return { code: transformed, map: null }
    },
  }
}

const inheritedPlugins = [...(baseConfig.plugins || [])]
const preciseSplitIndex = inheritedPlugins.findIndex(
  (plugin) => plugin?.name === 'precise-sticker-sheet-split-v2'
)
const ben2RouteIndex = inheritedPlugins.findIndex(
  (plugin) => plugin?.name === 'prefer-ben2-precision-route'
)
const qualityRoutingIndex = inheritedPlugins.findIndex(
  (plugin) => plugin?.name === 'background-quality-routing'
)
const insertionIndex = ben2RouteIndex >= 0 ? ben2RouteIndex : qualityRoutingIndex
const finalPlugins = [...inheritedPlugins]

if (preciseSplitIndex >= 0) {
  finalPlugins.splice(preciseSplitIndex + 1, 0, saferStickerGridRouting())
} else {
  finalPlugins.push(saferStickerGridRouting())
}

const adjustedBen2RouteIndex = finalPlugins.findIndex(
  (plugin) => plugin?.name === 'prefer-ben2-precision-route'
)
const adjustedQualityRoutingIndex = finalPlugins.findIndex(
  (plugin) => plugin?.name === 'background-quality-routing'
)
const adjustedInsertionIndex = adjustedBen2RouteIndex >= 0 ? adjustedBen2RouteIndex : adjustedQualityRoutingIndex

if (adjustedInsertionIndex >= 0) {
  finalPlugins.splice(adjustedInsertionIndex + 1, 0, singlePassRouting())
} else {
  finalPlugins.push(singlePassRouting())
}
finalPlugins.push(oneClickUiCleanup())

export default defineConfig({
  ...baseConfig,
  plugins: finalPlugins,
})