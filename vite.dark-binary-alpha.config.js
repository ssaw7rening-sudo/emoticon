import { defineConfig } from 'vite'
import baseConfig from './vite.tailwind-motion-cleanup.config.js'

function strictDarkBackgroundBinaryAlpha() {
  return {
    name: 'strict-dark-background-binary-alpha-v12',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      const darkStart = transformed.indexOf('async function trySafeDarkBorderRemoval(file) {')
      const removeStart = transformed.indexOf('const removeBackground = async', darkStart)
      if (darkStart < 0 || removeStart < 0) {
        throw new Error('[dark-binary-alpha] Dark prepass/removeBackground boundaries were not found')
      }

      let darkSegment = transformed.slice(darkStart, removeStart)
      const replaceDarkOnce = (from, to, label) => {
        if (!darkSegment.includes(from)) {
          throw new Error(`[dark-binary-alpha] ${label} anchor was not found`)
        }
        darkSegment = darkSegment.replace(from, to)
      }

      // Accept black and near-black generated mattes even when antialiasing,
      // glow or compression makes the outer edge slightly non-uniform.
      replaceDarkOnce(
        'return luminance <= 78 && Math.max(r, g, b) <= 104;',
        'return luminance <= 112 && Math.max(r, g, b) <= 148;',
        'dark border threshold'
      )
      replaceDarkOnce(
        'if (darkBorderColours.length / borderColours.length < 0.72) return null;',
        'if (darkBorderColours.length / borderColours.length < 0.55) return null;',
        'dark border ratio'
      )
      replaceDarkOnce(
        'if (p95 > 30) return null;',
        'if (p95 > 52) return null;',
        'dark border deviation'
      )
      replaceDarkOnce(
        'const tolerance = Math.max(18, Math.min(42, 18 + p95 * 1.6));',
        'const tolerance = Math.max(22, Math.min(68, 24 + p95 * 1.45));',
        'dark flood tolerance'
      )
      replaceDarkOnce(
        'return luminance <= 112 && colorDistance([r, g, b], background) <= tolerance;',
        'return luminance <= 150 && colorDistance([r, g, b], background) <= tolerance;',
        'dark matte pixel threshold'
      )
      replaceDarkOnce(
        'if (tail < total * 0.06 || tail > total * 0.92) return null;',
        'if (tail < total * 0.04 || tail > total * 0.97) return null;',
        'dark component coverage'
      )

      transformed = transformed.slice(0, darkStart) + darkSegment + transformed.slice(removeStart)

      const helper = `async function forceBinaryDarkForegroundAlpha(blob) {
  const { canvas, ctx } = await drawFileToCanvas(blob);
  const { width, height } = canvas;
  if (!width || !height) return blob;
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  for (let p = 3; p < pixels.length; p += 4) {
    pixels[p] = pixels[p] === 0 ? 0 : 255;
  }
  ctx.putImageData(imageData, 0, 0);
  return await canvasToPngBlob(canvas);
}

async function rebuildOriginalDarkSheetForSplit(sourceFile) {
  if (!sourceFile) return null;

  try {
    const { canvas, ctx } = await drawFileToCanvas(sourceFile);
    const { width, height } = canvas;
    if (!width || !height) return null;

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    const border = [];
    const step = Math.max(1, Math.floor(Math.min(width, height) / 500));
    const pushBorder = (x, y) => {
      const p = (y * width + x) * 4;
      if (pixels[p + 3] < 240) return;
      border.push([pixels[p], pixels[p + 1], pixels[p + 2]]);
    };

    for (let x = 0; x < width; x += step) {
      pushBorder(x, 0);
      pushBorder(x, height - 1);
    }
    for (let y = step; y < height - 1; y += step) {
      pushBorder(0, y);
      pushBorder(width - 1, y);
    }
    if (!border.length) return null;

    const darkBorder = border.filter(([r, g, b]) => {
      const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722;
      return luminance <= 118 && Math.max(r, g, b) <= 152;
    });
    if (darkBorder.length / border.length < 0.5) return null;

    const background = [0, 0, 0];
    for (const [r, g, b] of darkBorder) {
      background[0] += r;
      background[1] += g;
      background[2] += b;
    }
    background[0] /= darkBorder.length;
    background[1] /= darkBorder.length;
    background[2] /= darkBorder.length;

    const total = width * height;
    const visited = new Uint8Array(total);
    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;
    const tolerance = 62;

    const isBackground = (index) => {
      const p = index * 4;
      const r = pixels[p];
      const g = pixels[p + 1];
      const b = pixels[p + 2];
      const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722;
      const distance = Math.sqrt(
        (r - background[0]) ** 2 +
        (g - background[1]) ** 2 +
        (b - background[2]) ** 2
      );
      return luminance <= 145 && distance <= tolerance;
    };

    const enqueue = (index) => {
      if (index < 0 || index >= total || visited[index] || !isBackground(index)) return;
      visited[index] = 1;
      queue[tail++] = index;
    };

    for (let x = 0; x < width; x += 1) {
      enqueue(x);
      enqueue((height - 1) * width + x);
    }
    for (let y = 1; y < height - 1; y += 1) {
      enqueue(y * width);
      enqueue(y * width + width - 1);
    }

    while (head < tail) {
      const index = queue[head++];
      const x = index % width;
      const y = Math.floor(index / width);
      if (x > 0) enqueue(index - 1);
      if (x + 1 < width) enqueue(index + 1);
      if (y > 0) enqueue(index - width);
      if (y + 1 < height) enqueue(index + width);
    }

    const removedRatio = tail / Math.max(1, total);
    if (removedRatio < 0.08 || removedRatio > 0.94) return null;

    // Original-authoritative binary alpha: only the outer connected dark matte
    // becomes transparent. Every other source pixel is fully opaque, including
    // white/ivory faces, pale fur, wisps, captions and sticker outlines.
    for (let index = 0; index < total; index += 1) {
      pixels[index * 4 + 3] = visited[index] ? 0 : 255;
    }
    ctx.putImageData(imageData, 0, 0);
    return await canvasToPngBlob(canvas);
  } catch (error) {
    console.warn('Original dark-sheet split rebuild failed:', error);
    return null;
  }
}

`

      const removeStartAfterDarkPatch = transformed.indexOf('const removeBackground = async', darkStart)
      transformed = transformed.slice(0, removeStartAfterDarkPatch) + helper + transformed.slice(removeStartAfterDarkPatch)

      const updatedRemoveStart = transformed.indexOf('const removeBackground = async', removeStartAfterDarkPatch + helper.length)
      const retryStart = transformed.indexOf('const runPrecisionRetry = async', updatedRemoveStart)
      if (updatedRemoveStart < 0 || retryStart < 0) {
        throw new Error('[dark-binary-alpha] Updated handler boundaries were not found')
      }

      let removeHandler = transformed.slice(updatedRemoveStart, retryStart)

      const darkClassification = 'const fastBackgroundIsDark = isDarkBackgroundColor(fastResult?.background);'
      if (!removeHandler.includes(darkClassification)) {
        throw new Error('[dark-binary-alpha] Fast dark classification anchor was not found')
      }
      removeHandler = removeHandler.replace(
        darkClassification,
        'const fastBackgroundIsDark = fastResult?.deterministicDark === true || isDarkBackgroundColor(fastResult?.background);'
      )

      const finalMarker = "const fastDarkMatteIsFinal = (method === 'fast-dark' || method === 'fast') && fastBackgroundIsDark;"
      if (!removeHandler.includes(finalMarker)) {
        throw new Error('[dark-binary-alpha] Final dark-matte marker was not found')
      }
      removeHandler = removeHandler.replace(
        finalMarker,
        `${finalMarker}\n      if (fastDarkMatteIsFinal) {\n        // Strict mode: dark-background sticker output is binary alpha only.\n        // Background stays fully transparent (0); every retained foreground\n        // pixel becomes fully opaque (255). No semi-transparent subject pixels.\n        blob = await forceBinaryDarkForegroundAlpha(blob);\n      }`
      )

      transformed = transformed.slice(0, updatedRemoveStart) + removeHandler + transformed.slice(retryStart)

      // Production auto-split must not trust a possibly damaged removal result
      // for dark-background sheets. Rebuild a fresh binary-alpha sheet from the
      // original upload immediately before the 15-way splitter runs.
      const splitCallWithSource = 'const items = await splitIntoFifteen(resultBlob, file);'
      const splitCallLegacy = 'const items = await splitIntoFifteen(resultBlob);'
      const splitReplacement = `const originalDarkSplitBlob = await rebuildOriginalDarkSheetForSplit(file);\n      const items = await splitIntoFifteen(originalDarkSplitBlob || resultBlob, file);`
      if (transformed.includes(splitCallWithSource)) {
        transformed = transformed.replace(splitCallWithSource, splitReplacement)
      } else if (transformed.includes(splitCallLegacy)) {
        transformed = transformed.replace(splitCallLegacy, splitReplacement)
      } else {
        throw new Error('[dark-binary-alpha] Auto-split call anchor was not found')
      }

      // Visible build stamp so production/mobile cache can be verified instantly.
      transformed = transformed.replace(/Alpha v7/g, 'Split v12')

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), strictDarkBackgroundBinaryAlpha()],
})
