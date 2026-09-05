import { defineConfig } from 'vite'
import baseConfig from './vite.alpha-verified-v17.config.js'

function manualPixelSafeExportV21() {
  return {
    name: 'manual-pixel-safe-export-v21',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/EmoticonPostProcessor.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')
      const startMarker = 'async function makePixelSafeOutput(item, transform = { zoom: 1, x: 0, y: 0 }, outputScale = 1) {'
      const endMarker = '\nasync function makeOutputForItem('
      const start = transformed.indexOf(startMarker)
      const end = transformed.indexOf(endMarker, start)
      if (start < 0 || end < 0 || end <= start) {
        throw new Error('[pixel-safe-v21] v20 pixel-safe helper boundaries not found')
      }

      const replacement = `async function makePixelSafeOutput(item, transform = { zoom: 1, x: 0, y: 0 }, outputScale = 1) {
  const pixels = item?.pixelData;
  const sourceWidth = Math.max(0, Number(item?.pixelWidth || 0));
  const sourceHeight = Math.max(0, Number(item?.pixelHeight || 0));
  if (!pixels || !sourceWidth || !sourceHeight || pixels.length !== sourceWidth * sourceHeight * 4) {
    throw new Error('Pixel-safe source is missing');
  }

  // v21: no PNG decode and no Canvas drawImage in the direct-sticker save path.
  // Resize the preserved split RGBA bytes manually so Android/WebView never gets
  // an opportunity to reinterpret premultiplied alpha during export.
  const scaleFactor = [1, 2, 4].includes(outputScale) ? outputScale : 1;
  const size = 360 * scaleFactor;
  const safeSize = 300 * scaleFactor;
  const zoom = Math.max(0.55, Math.min(1.45, transform?.zoom || 1));
  const fit = Math.min(safeSize / Math.max(1, sourceWidth), safeSize / Math.max(1, sourceHeight));
  const drawScale = fit * zoom;
  const drawW = sourceWidth * drawScale;
  const drawH = sourceHeight * drawScale;
  const offsetX = (size - drawW) / 2 + (transform?.x || 0) * scaleFactor;
  const offsetY = (size - drawH) / 2 + (transform?.y || 0) * scaleFactor;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas unavailable');
  const outImage = ctx.createImageData(size, size);
  const out = outImage.data;

  const minX = Math.max(0, Math.floor(offsetX));
  const maxX = Math.min(size - 1, Math.ceil(offsetX + drawW) - 1);
  const minY = Math.max(0, Math.floor(offsetY));
  const maxY = Math.min(size - 1, Math.ceil(offsetY + drawH) - 1);

  const sample = (sx, sy) => {
    const x = Math.max(0, Math.min(sourceWidth - 1, sx));
    const y = Math.max(0, Math.min(sourceHeight - 1, sy));
    const p = (y * sourceWidth + x) * 4;
    return p;
  };

  for (let oy = minY; oy <= maxY; oy += 1) {
    const sy = ((oy + 0.5 - offsetY) / drawScale) - 0.5;
    if (sy < -1 || sy > sourceHeight) continue;
    const y0 = Math.floor(sy);
    const y1 = y0 + 1;
    const fy = sy - y0;
    const wy0 = 1 - fy;
    const wy1 = fy;

    for (let ox = minX; ox <= maxX; ox += 1) {
      const sx = ((ox + 0.5 - offsetX) / drawScale) - 0.5;
      if (sx < -1 || sx > sourceWidth) continue;
      const x0 = Math.floor(sx);
      const x1 = x0 + 1;
      const fx = sx - x0;
      const wx0 = 1 - fx;
      const wx1 = fx;

      const p00 = sample(x0, y0);
      const p10 = sample(x1, y0);
      const p01 = sample(x0, y1);
      const p11 = sample(x1, y1);
      const w00 = wx0 * wy0;
      const w10 = wx1 * wy0;
      const w01 = wx0 * wy1;
      const w11 = wx1 * wy1;

      const a00 = pixels[p00 + 3] > 0 ? 1 : 0;
      const a10 = pixels[p10 + 3] > 0 ? 1 : 0;
      const a01 = pixels[p01 + 3] > 0 ? 1 : 0;
      const a11 = pixels[p11 + 3] > 0 ? 1 : 0;
      const alphaWeight = w00 * a00 + w10 * a10 + w01 * a01 + w11 * a11;
      if (alphaWeight <= 0.035) continue;

      // Premultiplied-alpha interpolation using only opaque source samples.
      // Transparent source RGB never contributes, so white/ivory art cannot
      // turn black around edges and no interior subject pixel can become a hole.
      const r = (
        pixels[p00] * w00 * a00 + pixels[p10] * w10 * a10 +
        pixels[p01] * w01 * a01 + pixels[p11] * w11 * a11
      ) / alphaWeight;
      const g = (
        pixels[p00 + 1] * w00 * a00 + pixels[p10 + 1] * w10 * a10 +
        pixels[p01 + 1] * w01 * a01 + pixels[p11 + 1] * w11 * a11
      ) / alphaWeight;
      const b = (
        pixels[p00 + 2] * w00 * a00 + pixels[p10 + 2] * w10 * a10 +
        pixels[p01 + 2] * w01 * a01 + pixels[p11 + 2] * w11 * a11
      ) / alphaWeight;

      const dp = (oy * size + ox) * 4;
      out[dp] = Math.max(0, Math.min(255, Math.round(r)));
      out[dp + 1] = Math.max(0, Math.min(255, Math.round(g)));
      out[dp + 2] = Math.max(0, Math.min(255, Math.round(b)));
      out[dp + 3] = 255;
    }
  }

  ctx.putImageData(outImage, 0, 0);
  return canvasToBlob(canvas);
}`

      transformed = transformed.slice(0, start) + replacement + transformed.slice(end)
      transformed = transformed.replaceAll('Split v20 · Pixel Safe Save', 'Split v21 · Direct RGBA Save')
      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), manualPixelSafeExportV21()],
})
