import { defineConfig } from 'vite'
import baseConfig from './vite.one-click-auto-precision.config.js'

function pixelOwnershipStickerSplit() {
  return {
    name: 'pixel-ownership-sticker-split-v7',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      const componentOwnership = `  const nearestFallback = (analysisX, analysisY) => nearestStickerGroup(
    analysisX,
    analysisY,
    analysis.centers,
    analysis.cellWidth,
    analysis.cellHeight
  );
  const groupForSourcePixel = (x, y) => {
    const analysisX = Math.max(0, Math.min(analysis.width - 1, Math.floor(x / analysis.scaleX)));
    const analysisY = Math.max(0, Math.min(analysis.height - 1, Math.floor(y / analysis.scaleY)));
    const label = analysis.labels[analysisY * analysis.width + analysisX];
    if (label > 0) {
      const group = analysis.componentGroup[label];
      if (group >= 0) return group;
    }
    return nearestFallback(analysisX, analysisY);
  };`

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

      if (!transformed.includes(componentOwnership)) {
        throw new Error('[pixel-owner-split] Component ownership block was not found')
      }

      transformed = transformed.replace(componentOwnership, pixelOwnership)
      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), pixelOwnershipStickerSplit()],
})
