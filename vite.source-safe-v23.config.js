import { defineConfig } from 'vite'
import baseConfig from './vite.tailwind-motion-cleanup.config.js'

function sourceSafeExportPreV23() {
  return {
    name: 'source-safe-export-v23-pre',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/EmoticonPostProcessor.jsx')) return null
      let transformed = code.replace(/\r\n/g, '\n')

      const makeOutputAnchor = 'async function makeOutput(blob, transform = { zoom: 1, x: 0, y: 0 }, outputScale = 1) {'
      const insertAt = transformed.indexOf(makeOutputAnchor)
      if (insertAt < 0) throw new Error('[source-safe-v23] original makeOutput anchor not found')

      const helper = `async function makeSourceSafeOutput(item, transform = { zoom: 1, x: 0, y: 0 }, outputScale = 1) {
  const pixels = item?.pixelData;
  const sourceWidth = Math.max(0, Number(item?.pixelWidth || 0));
  const sourceHeight = Math.max(0, Number(item?.pixelHeight || 0));
  if (!item?.pixelSafe || !pixels || !sourceWidth || !sourceHeight || pixels.length !== sourceWidth * sourceHeight * 4) {
    return makeOutput(item.blob, transform, outputScale);
  }

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
  const image = ctx.createImageData(size, size);
  const out = image.data;

  const minX = Math.max(0, Math.floor(offsetX));
  const maxX = Math.min(size - 1, Math.ceil(offsetX + drawW) - 1);
  const minY = Math.max(0, Math.floor(offsetY));
  const maxY = Math.min(size - 1, Math.ceil(offsetY + drawH) - 1);

  const sourcePixel = (x, y) => {
    const sx = Math.max(0, Math.min(sourceWidth - 1, x));
    const sy = Math.max(0, Math.min(sourceHeight - 1, y));
    return (sy * sourceWidth + sx) * 4;
  };

  for (let oy = minY; oy <= maxY; oy += 1) {
    const sy = ((oy + 0.5 - offsetY) / drawScale) - 0.5;
    if (sy < -1 || sy > sourceHeight) continue;
    const y0 = Math.floor(sy), y1 = y0 + 1;
    const fy = sy - y0;
    for (let ox = minX; ox <= maxX; ox += 1) {
      const sx = ((ox + 0.5 - offsetX) / drawScale) - 0.5;
      if (sx < -1 || sx > sourceWidth) continue;
      const x0 = Math.floor(sx), x1 = x0 + 1;
      const fx = sx - x0;
      const p00 = sourcePixel(x0, y0), p10 = sourcePixel(x1, y0);
      const p01 = sourcePixel(x0, y1), p11 = sourcePixel(x1, y1);
      const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy);
      const w01 = (1 - fx) * fy, w11 = fx * fy;
      const a00 = pixels[p00 + 3] > 0 ? 1 : 0;
      const a10 = pixels[p10 + 3] > 0 ? 1 : 0;
      const a01 = pixels[p01 + 3] > 0 ? 1 : 0;
      const a11 = pixels[p11 + 3] > 0 ? 1 : 0;
      const coverage = w00 * a00 + w10 * a10 + w01 * a01 + w11 * a11;
      if (coverage <= 0.04) continue;
      const dp = (oy * size + ox) * 4;
      out[dp] = Math.round((pixels[p00] * w00 * a00 + pixels[p10] * w10 * a10 + pixels[p01] * w01 * a01 + pixels[p11] * w11 * a11) / coverage);
      out[dp + 1] = Math.round((pixels[p00 + 1] * w00 * a00 + pixels[p10 + 1] * w10 * a10 + pixels[p01 + 1] * w01 * a01 + pixels[p11 + 1] * w11 * a11) / coverage);
      out[dp + 2] = Math.round((pixels[p00 + 2] * w00 * a00 + pixels[p10 + 2] * w10 * a10 + pixels[p01 + 2] * w01 * a01 + pixels[p11 + 2] * w11 * a11) / coverage);
      out[dp + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvasToBlob(canvas);
}

async function makeOutputForItem(item, transform = { zoom: 1, x: 0, y: 0 }, outputScale = 1) {
  if (item?.pixelSafe && item?.pixelData) return makeSourceSafeOutput(item, transform, outputScale);
  return makeOutput(item.blob, transform, outputScale);
}

`
      transformed = transformed.slice(0, insertAt) + helper + transformed.slice(insertAt)
      const call = 'makeOutput(item.blob,'
      const count = transformed.split(call).length - 1
      if (count < 3) throw new Error('[source-safe-v23] expected export call sites not found')
      transformed = transformed.replaceAll(call, 'makeOutputForItem(item,')
      return { code: transformed, map: null }
    }
  }
}

function sourceSafeSplitPostV23() {
  return {
    name: 'source-safe-split-v23-post',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null
      let transformed = code.replace(/\r\n/g, '\n')

      const splitStart = transformed.indexOf('async function splitIntoFifteen(')
      const splitEnd = transformed.indexOf('async function hasRealTransparency(file) {', splitStart)
      if (splitStart < 0 || splitEnd < 0 || splitEnd <= splitStart) {
        throw new Error('[source-safe-v23] split function boundaries not found')
      }

      const splitter = `async function splitIntoFifteen(input, sourceFile = null) {
  const drawn = await drawFileToCanvas(input);
  let workCanvas = drawn.canvas;
  let workCtx = drawn.ctx;
  const width = workCanvas.width;
  const height = workCanvas.height;
  if (!width || !height) throw new Error('Invalid canvas dimensions');
  let darkOriginal = false;

  if (sourceFile) {
    try {
      const source = await drawFileToCanvas(sourceFile);
      const aligned = document.createElement('canvas');
      aligned.width = width;
      aligned.height = height;
      const alignedCtx = aligned.getContext('2d', { willReadFrequently: true });
      if (alignedCtx) {
        alignedCtx.imageSmoothingEnabled = false;
        alignedCtx.drawImage(source.canvas, 0, 0, source.canvas.width, source.canvas.height, 0, 0, width, height);
        const originalImage = alignedCtx.getImageData(0, 0, width, height);
        const original = originalImage.data;
        const border = [];
        const step = Math.max(1, Math.floor(Math.min(width, height) / 520));
        const push = (x, y) => {
          const p = (y * width + x) * 4;
          border.push([original[p], original[p + 1], original[p + 2]]);
        };
        for (let x = 0; x < width; x += step) { push(x, 0); push(x, height - 1); }
        for (let y = step; y < height - 1; y += step) { push(0, y); push(width - 1, y); }
        const dark = border.filter(([r, g, b]) => {
          const l = r * 0.2126 + g * 0.7152 + b * 0.0722;
          return l <= 118 && Math.max(r, g, b) <= 154;
        });
        if (border.length && dark.length / border.length >= 0.48) {
          const bg = [0, 0, 0];
          for (const [r, g, b] of dark) { bg[0] += r; bg[1] += g; bg[2] += b; }
          bg[0] /= dark.length; bg[1] /= dark.length; bg[2] /= dark.length;
          const total = width * height;
          const visited = new Uint8Array(total);
          const queue = new Int32Array(total);
          let head = 0, tail = 0;
          const isMatte = (index) => {
            const p = index * 4;
            const r = original[p], g = original[p + 1], b = original[p + 2];
            const l = r * 0.2126 + g * 0.7152 + b * 0.0722;
            const d = Math.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2);
            return l <= 145 && d <= 64;
          };
          const enqueue = (index) => {
            if (index < 0 || index >= total || visited[index] || !isMatte(index)) return;
            visited[index] = 1; queue[tail++] = index;
          };
          for (let x = 0; x < width; x += 1) { enqueue(x); enqueue((height - 1) * width + x); }
          for (let y = 1; y < height - 1; y += 1) { enqueue(y * width); enqueue(y * width + width - 1); }
          while (head < tail) {
            const index = queue[head++];
            const x = index % width, y = Math.floor(index / width);
            if (x > 0) enqueue(index - 1);
            if (x + 1 < width) enqueue(index + 1);
            if (y > 0) enqueue(index - width);
            if (y + 1 < height) enqueue(index + width);
          }
          const removedRatio = tail / Math.max(1, total);
          if (removedRatio >= 0.08 && removedRatio <= 0.94) {
            for (let index = 0; index < total; index += 1) original[index * 4 + 3] = visited[index] ? 0 : 255;
            alignedCtx.putImageData(originalImage, 0, 0);
            workCanvas = aligned;
            workCtx = alignedCtx;
            darkOriginal = true;
          }
        }
      }
    } catch (error) {
      console.warn('v23 original source rebuild skipped:', error);
    }
  }

  const pixels = workCtx.getImageData(0, 0, width, height).data;
  const rows = 3, columns = 5;
  const cellW = width / columns, cellH = height / rows;
  const items = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const left = Math.floor(column * cellW), top = Math.floor(row * cellH);
      const right = Math.min(width, Math.ceil((column + 1) * cellW));
      const bottom = Math.min(height, Math.ceil((row + 1) * cellH));
      let minX = right, minY = bottom, maxX = left - 1, maxY = top - 1;
      for (let y = top; y < bottom; y += 1) {
        for (let x = left; x < right; x += 1) {
          if (pixels[(y * width + x) * 4 + 3] <= 8) continue;
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
      const hasContent = minX <= maxX && minY <= maxY;
      const pad = Math.max(8, Math.round(Math.min(cellW, cellH) * 0.045));
      const cropLeft = hasContent ? Math.max(left, minX - pad) : left;
      const cropTop = hasContent ? Math.max(top, minY - pad) : top;
      const cropRight = hasContent ? Math.min(right, maxX + 1 + pad) : right;
      const cropBottom = hasContent ? Math.min(bottom, maxY + 1 + pad) : bottom;
      const cropW = Math.max(1, cropRight - cropLeft), cropH = Math.max(1, cropBottom - cropTop);
      const safety = Math.max(8, Math.round(Math.min(cropW, cropH) * 0.055));
      const output = document.createElement('canvas');
      output.width = cropW + safety * 2; output.height = cropH + safety * 2;
      const outCtx = output.getContext('2d', { willReadFrequently: true });
      if (!outCtx) throw new Error('Canvas 2D is unavailable');
      const outImage = outCtx.createImageData(output.width, output.height);
      const out = outImage.data;
      for (let y = 0; y < cropH; y += 1) {
        for (let x = 0; x < cropW; x += 1) {
          const sp = ((cropTop + y) * width + (cropLeft + x)) * 4;
          const dp = ((y + safety) * output.width + (x + safety)) * 4;
          out[dp] = pixels[sp]; out[dp + 1] = pixels[sp + 1]; out[dp + 2] = pixels[sp + 2];
          out[dp + 3] = darkOriginal ? (pixels[sp + 3] === 0 ? 0 : 255) : pixels[sp + 3];
        }
      }
      outCtx.putImageData(outImage, 0, 0);
      const blob = await canvasToPngBlob(output);
      items.push({
        index: items.length + 1, blob, width: output.width, height: output.height,
        pixelSafe: darkOriginal,
        pixelData: darkOriginal ? new Uint8ClampedArray(out) : null,
        pixelWidth: output.width, pixelHeight: output.height,
        splitEngine: darkOriginal ? 'SRC23' : 'STD23',
        needsReview: false, reviewReasons: []
      });
    }
  }
  return items;
}

`
      transformed = transformed.slice(0, splitStart) + splitter + transformed.slice(splitEnd)
      transformed = transformed.replaceAll('splitIntoFifteen(resultBlob);', 'splitIntoFifteen(resultBlob, file);')
      transformed = transformed.replace(/Alpha v7/g, 'Split v23 · Source Safe')
      return { code: transformed, map: null }
    }
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [sourceSafeExportPreV23(), ...(baseConfig.plugins || []), sourceSafeSplitPostV23()]
})
