import { defineConfig } from 'vite'
import baseConfig from './vite.ui-runtime-cleanup.config.js'

const blockedImagePipelinePlugins = new Set([
  'precise-sticker-sheet-split-v9-safe-component-fallback',
  'pixel-ownership-sticker-split-v8-watershed-compatible',
  'final-transparency-integrity-guard-v2',
]);

const plugins = (baseConfig.plugins || []).filter((plugin) => {
  const name = String(plugin?.name || '');
  if (blockedImagePipelinePlugins.has(name)) return false;
  if (name.startsWith('precise-sticker-sheet-split-')) return false;
  if (name.startsWith('pixel-ownership-sticker-split-')) return false;
  if (name.startsWith('final-transparency-integrity-guard-')) return false;
  return true;
});

function safeTransparentSourceRoute() {
  return {
    name: 'transparent-source-safe-route',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null
      if (!code.includes('sourceAlreadyTransparent')) return null
      if (!code.includes('splitIntoFifteenSourceSafe')) {
        throw new Error('[transparent-source-safe] source-safe splitter is missing')
      }

      let transformed = code
      let sourceProtected = false
      let splitProtected = false

      transformed = transformed.replace(
        /const\s+transparentResult\s*=\s*await\s+removeEnclosedBackdropPockets\(\s*nextFile\s*,\s*nextFile\s*,\s*true\s*\);/,
        () => {
          sourceProtected = true
          return "const transparentResult = nextFile;"
        }
      )

      transformed = transformed.replace(
        /setResultMethod\(\s*['\"]transparent['\"]\s*\);/,
        "setResultMethod('transparent-source-safe');"
      )

      transformed = transformed.replace(
        /const\s+items\s*=\s*await\s+splitIntoFifteen\(\s*transparentResult\s*\);/,
        () => {
          splitProtected = true
          return "const items = await splitIntoFifteenSourceSafe(transparentResult, nextFile);"
        }
      )

      if (!sourceProtected || !splitProtected) {
        throw new Error('[transparent-source-safe] legacy transparent split route could not be replaced')
      }

      return { code: transformed, map: null }
    },
  }
}

const MASK_GUIDED_SPLITTER = String.raw`
async function splitIntoFifteenSourceSafe(input, sourceFile = null) {
  const MASK_GUIDED_SOURCE_SAFE = 'MASK_GUIDED_SOURCE_SAFE';
  void MASK_GUIDED_SOURCE_SAFE;

  if (!sourceFile) return splitIntoFifteen(input);

  let processed;
  let source;
  try {
    processed = await drawFileToCanvas(input);
    source = await drawFileToCanvas(sourceFile);
  } catch (error) {
    console.warn('Mask-guided source decode failed; using processed split:', error);
    return splitIntoFifteen(input);
  }

  const width = processed.canvas.width;
  const height = processed.canvas.height;
  if (!width || !height) return splitIntoFifteen(input);

  let sourceCtx = source.ctx;
  if (source.canvas.width !== width || source.canvas.height !== height) {
    const scaled = document.createElement('canvas');
    scaled.width = width;
    scaled.height = height;
    const scaledCtx = scaled.getContext('2d', { willReadFrequently: true });
    if (!scaledCtx) return splitIntoFifteen(input);
    scaledCtx.imageSmoothingEnabled = true;
    scaledCtx.imageSmoothingQuality = 'high';
    scaledCtx.drawImage(source.canvas, 0, 0, width, height);
    sourceCtx = scaledCtx;
  }

  const resultData = processed.ctx.getImageData(0, 0, width, height);
  const sourceData = sourceCtx.getImageData(0, 0, width, height);
  const pixels = resultData.data;
  const original = sourceData.data;
  const total = width * height;
  const visibleThreshold = 24;

  const foreground = new Uint8Array(total);
  for (let index = 0; index < total; index += 1) {
    if (pixels[index * 4 + 3] >= visibleThreshold) foreground[index] = 1;
  }

  const sealRadius = Math.max(1, Math.min(5, Math.round(Math.min(width, height) / 420)));
  let sealed = foreground;
  for (let pass = 0; pass < sealRadius; pass += 1) {
    const next = sealed.slice();
    for (let y = 0; y < height; y += 1) {
      const row = y * width;
      for (let x = 0; x < width; x += 1) {
        const index = row + x;
        if (!sealed[index]) continue;
        if (x > 0) next[index - 1] = 1;
        if (x + 1 < width) next[index + 1] = 1;
        if (y > 0) next[index - width] = 1;
        if (y + 1 < height) next[index + width] = 1;
      }
    }
    sealed = next;
  }

  const exterior = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;
  const enqueueExterior = (index) => {
    if (index < 0 || index >= total || exterior[index] || sealed[index]) return;
    exterior[index] = 1;
    queue[tail++] = index;
  };

  for (let x = 0; x < width; x += 1) {
    enqueueExterior(x);
    enqueueExterior((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueueExterior(y * width);
    enqueueExterior(y * width + width - 1);
  }

  while (head < tail) {
    const index = queue[head++];
    const x = index % width;
    const y = Math.floor(index / width);
    if (x > 0) enqueueExterior(index - 1);
    if (x + 1 < width) enqueueExterior(index + 1);
    if (y > 0) enqueueExterior(index - width);
    if (y + 1 < height) enqueueExterior(index + width);
  }

  let bgR = 0;
  let bgG = 0;
  let bgB = 0;
  let bgCount = 0;
  const sampleStep = Math.max(1, Math.floor(Math.min(width, height) / 700));
  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
      const index = y * width + x;
      const p = index * 4;
      if (pixels[p + 3] >= 8 || original[p + 3] < 16) continue;
      const r = original[p];
      const g = original[p + 1];
      const b = original[p + 2];
      const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722;
      if (luminance > 150) continue;
      bgR += r;
      bgG += g;
      bgB += b;
      bgCount += 1;
    }
  }
  if (bgCount) {
    bgR /= bgCount;
    bgG /= bgCount;
    bgB /= bgCount;
  }

  const restore = new Uint8Array(total);
  for (let index = 0; index < total; index += 1) {
    const p = index * 4;
    const resultAlpha = pixels[p + 3];
    if (resultAlpha >= visibleThreshold || exterior[index]) continue;

    const sourceAlpha = original[p + 3];
    if (sourceAlpha < 24) continue;

    const r = original[p];
    const g = original[p + 1];
    const b = original[p + 2];
    const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const distanceFromBackdrop = bgCount
      ? Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2)
      : luminance;

    if (luminance >= 112 || distanceFromBackdrop >= 58) {
      restore[index] = 1;
    }
  }

  const restoreLabels = new Uint32Array(total);
  const restoreQueue = new Int32Array(total);
  let label = 0;
  const keepRestoreLabel = new Set();
  const minimumRestoreArea = Math.max(6, Math.round(total * 0.0000015));

  for (let seed = 0; seed < total; seed += 1) {
    if (!restore[seed] || restoreLabels[seed]) continue;
    label += 1;
    let rh = 0;
    let rt = 0;
    let area = 0;
    restoreQueue[rt++] = seed;
    restoreLabels[seed] = label;
    while (rh < rt) {
      const index = restoreQueue[rh++];
      area += 1;
      const x = index % width;
      const y = Math.floor(index / width);
      const visit = (next) => {
        if (next < 0 || next >= total || !restore[next] || restoreLabels[next]) return;
        restoreLabels[next] = label;
        restoreQueue[rt++] = next;
      };
      if (x > 0) visit(index - 1);
      if (x + 1 < width) visit(index + 1);
      if (y > 0) visit(index - width);
      if (y + 1 < height) visit(index + width);
    }
    if (area >= minimumRestoreArea) keepRestoreLabel.add(label);
  }

  let restoredPixels = 0;
  for (let index = 0; index < total; index += 1) {
    const p = index * 4;
    if (restoreLabels[index] && keepRestoreLabel.has(restoreLabels[index])) {
      pixels[p] = original[p];
      pixels[p + 1] = original[p + 1];
      pixels[p + 2] = original[p + 2];
      pixels[p + 3] = Math.max(pixels[p + 3], original[p + 3]);
      restoredPixels += 1;
    }

    if (pixels[p + 3] === 0) {
      pixels[p] = 0;
      pixels[p + 1] = 0;
      pixels[p + 2] = 0;
    }
  }

  processed.ctx.putImageData(resultData, 0, 0);

  const rows = 3;
  const columns = 5;
  const cellW = width / columns;
  const cellH = height / rows;
  const items = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const left = Math.floor(column * cellW);
      const top = Math.floor(row * cellH);
      const right = Math.min(width, Math.ceil((column + 1) * cellW));
      const bottom = Math.min(height, Math.ceil((row + 1) * cellH));

      let minX = right;
      let minY = bottom;
      let maxX = left - 1;
      let maxY = top - 1;

      for (let y = top; y < bottom; y += 1) {
        for (let x = left; x < right; x += 1) {
          if (pixels[(y * width + x) * 4 + 3] <= 8) continue;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }

      const hasContent = minX <= maxX && minY <= maxY;
      const pad = Math.max(8, Math.round(Math.min(cellW, cellH) * 0.045));
      const cropLeft = hasContent ? Math.max(left, minX - pad) : left;
      const cropTop = hasContent ? Math.max(top, minY - pad) : top;
      const cropRight = hasContent ? Math.min(right, maxX + 1 + pad) : right;
      const cropBottom = hasContent ? Math.min(bottom, maxY + 1 + pad) : bottom;
      const cropW = Math.max(1, cropRight - cropLeft);
      const cropH = Math.max(1, cropBottom - cropTop);
      const safety = Math.max(8, Math.round(Math.min(cropW, cropH) * 0.055));

      const output = document.createElement('canvas');
      output.width = cropW + safety * 2;
      output.height = cropH + safety * 2;
      const outCtx = output.getContext('2d', { willReadFrequently: true });
      if (!outCtx) throw new Error('Canvas 2D is unavailable');

      const outImage = outCtx.createImageData(output.width, output.height);
      const out = outImage.data;
      for (let y = 0; y < cropH; y += 1) {
        for (let x = 0; x < cropW; x += 1) {
          const sp = ((cropTop + y) * width + (cropLeft + x)) * 4;
          const dp = ((y + safety) * output.width + (x + safety)) * 4;
          const alpha = pixels[sp + 3];
          if (alpha === 0) {
            out[dp] = 0;
            out[dp + 1] = 0;
            out[dp + 2] = 0;
            out[dp + 3] = 0;
          } else {
            out[dp] = pixels[sp];
            out[dp + 1] = pixels[sp + 1];
            out[dp + 2] = pixels[sp + 2];
            out[dp + 3] = alpha;
          }
        }
      }

      outCtx.putImageData(outImage, 0, 0);
      const blob = await canvasToPngBlob(output);
      items.push({
        index: items.length + 1,
        blob,
        width: output.width,
        height: output.height,
        pixelSafe: true,
        pixelData: new Uint8ClampedArray(out),
        pixelWidth: output.width,
        pixelHeight: output.height,
        splitEngine: 'MASK_GUIDED',
        restoredPixels,
        needsReview: false,
        reviewReasons: []
      });
    }
  }

  if (items.length !== 15) throw new Error('Could not create 15 sticker outputs');
  return items;
}
`;

function maskGuidedSourceSplitter() {
  return {
    name: 'mask-guided-source-safe-splitter',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null
      if (!code.includes('splitIntoFifteenSourceSafe')) return null

      const start = code.indexOf('async function splitIntoFifteenSourceSafe')
      const end = code.indexOf('async function hasRealTransparency', start)
      if (start < 0 || end < 0 || end <= start) {
        throw new Error('[mask-guided-source-safe] splitter function could not be located')
      }

      return {
        code: code.slice(0, start) + MASK_GUIDED_SPLITTER + '\n\n' + code.slice(end),
        map: null,
      }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...plugins, safeTransparentSourceRoute(), maskGuidedSourceSplitter()],
})
