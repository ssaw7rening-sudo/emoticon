import { defineConfig } from 'vite'
import baseConfig from './vite.one-click-auto-precision.config.js'

function pixelOwnershipStickerSplit() {
  return {
    name: 'pixel-ownership-sticker-split-v8-watershed-compatible',
    // Keep this in the pre-transform chain so it sees the BackgroundRemover
    // function injected by precise-sticker-sheet-split-v6 before React/Rolldown
    // compiles and rewrites the source structure.
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      const groupForSourcePixelPattern = /  const groupForSourcePixel = \(x, y\) => \{[\s\S]*?\n  \};/
      const currentBlock = transformed.match(groupForSourcePixelPattern)?.[0] || ''

      // The precise splitter v7 already provides an object-aware watershed
      // ownership map. Preserve it exactly; this legacy compatibility transform
      // must never downgrade it back to nearest-centre Voronoi ownership.
      if (!currentBlock) {
        throw new Error('[pixel-owner-split] Sticker ownership function was not found')
      }
      if (currentBlock.includes('analysis.pixelGroup')) {
        return null
      }

      // Backward compatibility only for the older v6 component-group path.
      if (!currentBlock.includes('analysis.componentGroup')) {
        throw new Error('[pixel-owner-split] Component ownership function was not found')
      }

      const pixelOwnership = `  // Connected-component ownership can accidentally merge two neighboring
  // stickers when anti-aliased outlines, text or background-removal residue make
  // them touch by even one pixel. Assign each foreground pixel independently to
  // the nearest of the 15 detected sticker centres instead. The 5×3 layout is
  // only a soft seed arrangement; no rectangular crop boundary is used here.
  const groupForSourcePixel = (x, y) => {
    const analysisX = Math.max(0, Math.min(analysis.width - 1, x / analysis.scaleX));
    const analysisY = Math.max(0, Math.min(analysis.height - 1, y / analysis.scaleY));
    return nearestStickerGroup(
      analysisX,
      analysisY,
      analysis.centers,
      analysis.cellWidth,
      analysis.cellHeight
    );
  };`

      transformed = transformed.replace(groupForSourcePixelPattern, pixelOwnership)
      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), pixelOwnershipStickerSplit()],
})
