import { defineConfig } from 'vite'
import baseConfig from './vite.background-hole-aware.config.js'

function alwaysAvailableStickerSplitMenu() {
  return {
    name: 'always-available-sticker-split-menu-v2-force-manual',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      const replaceOnce = (from, to, label) => {
        if (!transformed.includes(from)) {
          throw new Error(`[split-menu] ${label} anchor was not found`)
        }
        transformed = transformed.replace(from, to)
      }

      const detectedOnlyCondition = "{resultUrl && qualityAssessment.status !== 'fail' && (sheetDetection.status === 'sheet' || splitItems.length > 0) && ("
      const availableCondition = "{resultUrl && qualityAssessment.status !== 'fail' && (((sheetDetection.status !== 'checking' && sheetDetection.status !== 'idle')) || splitItems.length > 0) && ("
      replaceOnce(detectedOnlyCondition, availableCondition, 'main split-menu condition')

      const ambiguousCondition = "{resultUrl && qualityAssessment.status !== 'fail' && sheetDetection.status === 'ambiguous' && splitItems.length === 0 && ("
      replaceOnce(
        ambiguousCondition,
        "{false && resultUrl && qualityAssessment.status !== 'fail' && sheetDetection.status === 'ambiguous' && splitItems.length === 0 && (",
        'ambiguous split-menu condition'
      )

      const badgeAnchor = '<span className="rounded-full bg-[#EEF4EA] px-2.5 py-1 text-[11px] font-extrabold text-[#597153]">{t.splitBadge}</span>'
      const adaptiveBadge = `<span className="rounded-full bg-[#EEF4EA] px-2.5 py-1 text-[11px] font-extrabold text-[#597153]">{
                  sheetDetection.status === 'sheet'
                    ? t.splitBadge
                    : (lang === 'ko' ? '직접 분리' : lang === 'ja' ? '手動分割' : lang === 'zh' ? '手动分割' : 'Manual split')
                }</span>`
      replaceOnce(badgeAnchor, adaptiveBadge, 'split badge')

      // Manual split is an explicit user instruction. It must not be blocked by
      // the automatic sheet-classifier thresholds. Keep the same content/pixel
      // ownership splitter, but use the canonical 5×3 seed centres when forcing
      // a split. This is still not rectangular cell cropping: each foreground
      // pixel is assigned to its nearest seed and the final PNG is cropped only
      // to that group's actual content bounds.
      replaceOnce(
        'async function splitIntoFifteen(blob) {',
        'async function splitIntoFifteen(blob, { force = false } = {}) {',
        'split function signature'
      )

      const analysisGate = `  const analysis = analyzeStickerContentGroups(canvas);
  if (!analysis || analysis.nonEmpty < 12) throw new Error('Could not reliably detect 15 sticker groups');`
      const forceAwareAnalysisGate = `  const analysis = analyzeStickerContentGroups(canvas);
  if (!analysis) throw new Error('Could not analyze sticker layout');
  if (!force && analysis.nonEmpty < 12) throw new Error('Could not reliably detect 15 sticker groups');
  const ownershipCenters = force ? analysis.nominalCenters : analysis.centers;`
      replaceOnce(analysisGate, forceAwareAnalysisGate, 'automatic detection gate')

      const pixelOwnerCenters = `    return nearestStickerGroup(
      analysisX,
      analysisY,
      analysis.centers,
      analysis.cellWidth,
      analysis.cellHeight
    );`
      const forceAwarePixelOwnerCenters = `    return nearestStickerGroup(
      analysisX,
      analysisY,
      ownershipCenters,
      analysis.cellWidth,
      analysis.cellHeight
    );`
      replaceOnce(pixelOwnerCenters, forceAwarePixelOwnerCenters, 'pixel ownership centres')

      replaceOnce(
        "  if (detectedGroups < 12) throw new Error('Could not reliably separate sticker content groups');",
        "  if (!force && detectedGroups < 12) throw new Error('Could not reliably separate sticker content groups');",
        'separated-group reliability gate'
      )

      const autoSplitCall = '      const items = await splitIntoFifteen(resultBlob);'
      const forceAwareAutoSplitCall = `      let items;
      const directSplit = sheetDetection.status !== 'sheet';
      try {
        items = await splitIntoFifteen(resultBlob, { force: directSplit });
      } catch (primarySplitError) {
        // If automatic classification said “sheet” but its adaptive centres still
        // produce an unreliable grouping, retry once with the stable 5×3 seeds.
        // A direct/manual split already uses those seeds, so do not repeat it.
        if (directSplit) throw primarySplitError;
        console.warn('Adaptive sticker split failed; retrying with direct 5x3 pixel ownership:', primarySplitError);
        items = await splitIntoFifteen(resultBlob, { force: true });
      }`
      replaceOnce(autoSplitCall, forceAwareAutoSplitCall, 'autoSplit invocation')

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), alwaysAvailableStickerSplitMenu()],
})
