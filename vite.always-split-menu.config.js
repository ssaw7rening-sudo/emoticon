import { defineConfig } from 'vite'
import baseConfig from './vite.background-hole-aware.config.js'

function alwaysAvailableStickerSplitMenu() {
  return {
    name: 'always-available-sticker-split-menu-v1',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      const detectedOnlyCondition = "{resultUrl && qualityAssessment.status !== 'fail' && (sheetDetection.status === 'sheet' || splitItems.length > 0) && ("
      const availableCondition = "{resultUrl && qualityAssessment.status !== 'fail' && (((sheetDetection.status !== 'checking' && sheetDetection.status !== 'idle')) || splitItems.length > 0) && ("
      if (!transformed.includes(detectedOnlyCondition)) {
        throw new Error('[split-menu] Main split-menu condition anchor was not found')
      }
      transformed = transformed.replace(detectedOnlyCondition, availableCondition)

      const ambiguousCondition = "{resultUrl && qualityAssessment.status !== 'fail' && sheetDetection.status === 'ambiguous' && splitItems.length === 0 && ("
      if (!transformed.includes(ambiguousCondition)) {
        throw new Error('[split-menu] Ambiguous split-menu condition anchor was not found')
      }
      transformed = transformed.replace(ambiguousCondition, "{false && resultUrl && qualityAssessment.status !== 'fail' && sheetDetection.status === 'ambiguous' && splitItems.length === 0 && (")

      const badgeAnchor = '<span className="rounded-full bg-[#EEF4EA] px-2.5 py-1 text-[11px] font-extrabold text-[#597153]">{t.splitBadge}</span>'
      const adaptiveBadge = `<span className="rounded-full bg-[#EEF4EA] px-2.5 py-1 text-[11px] font-extrabold text-[#597153]">{
                  sheetDetection.status === 'sheet'
                    ? t.splitBadge
                    : (lang === 'ko' ? '직접 분리' : lang === 'ja' ? '手動分割' : lang === 'zh' ? '手动分割' : 'Manual split')
                }</span>`
      if (!transformed.includes(badgeAnchor)) {
        throw new Error('[split-menu] Split badge anchor was not found')
      }
      transformed = transformed.replace(badgeAnchor, adaptiveBadge)

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), alwaysAvailableStickerSplitMenu()],
})
