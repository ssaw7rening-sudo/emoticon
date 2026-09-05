import { defineConfig } from 'vite'
import baseConfig from './vite.dark-binary-alpha.config.js'

function directOriginalDarkSplit() {
  return {
    name: 'direct-original-dark-split-v13',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')
      const componentMarker = 'export default function BackgroundRemover'
      const componentIndex = transformed.indexOf(componentMarker)
      if (componentIndex < 0) throw new Error('[direct-dark-split] component marker not found')

      const helper = `async function splitOriginalDarkSheetDirectly(sourceFile) {
  if (!sourceFile) return null;
  try {
    const { canvas, ctx } = await drawFileToCanvas(sourceFile);
    const { width, height } = canvas;
    if (!width || !height) return null;

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    const border = [];
    const step = Math.max(1, Math.floor(Math.min(width, height) / 520));
    const sample = (x, y) => {
      const p = (y * width + x) * 4;
      border.push([pixels[p], pixels[p + 1], pixels[p + 2]]);
    };
    for (let x = 0; x < width; x += step) {
      sample(x, 0);
      sample(x, height - 1);
    }
    for (let y = step; y < height - 1; y += step) {
      sample(0, y);
      sample(width - 1, y);
    }
    if (!border.length) return null;

    const dark = border.filter(([r, g, b]) => {
      const l = r * 0.2126 + g * 0.7152 + b * 0.0722;
      return l <= 122 && Math.max(r, g, b) <= 158;
    });
    if (dark.length / border.length < 0.48) return null;

    const bg = [0, 0, 0];
    for (const [r, g, b] of dark) {
      bg[0] += r; bg[1] += g; bg[2] += b;
    }
    bg[0] /= dark.length; bg[1] /= dark.length; bg[2] /= dark.length;

    const total = width * height;
    const visited = new Uint8Array(total);
    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;
    const tolerance = 66;
    const isMatte = (index) => {
      const p = index * 4;
      const r = pixels[p], g = pixels[p + 1], b = pixels[p + 2];
      const l = r * 0.2126 + g * 0.7152 + b * 0.0722;
      const d = Math.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2);
      return l <= 150 && d <= tolerance;
    };
    const enqueue = (index) => {
      if (index < 0 || index >= total || visited[index] || !isMatte(index)) return;
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

    // The original upload is authoritative. Only the dark matte connected to
    // the OUTER image border is transparent. Everything else is fully opaque.
    for (let index = 0; index < total; index += 1) {
      pixels[index * 4 + 3] = visited[index] ? 0 : 255;
    }
    ctx.putImageData(imageData, 0, 0);

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
        let minX = right, minY = bottom, maxX = left - 1, maxY = top - 1;

        for (let y = top; y < bottom; y += 1) {
          for (let x = left; x < right; x += 1) {
            if (pixels[(y * width + x) * 4 + 3] === 0) continue;
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
        outCtx.imageSmoothingEnabled = false;
        outCtx.drawImage(canvas, cropLeft, cropTop, cropW, cropH, safety, safety, cropW, cropH);

        // Final hard guarantee: no semi-transparent foreground is allowed in
        // this dedicated path. Transparent canvas margin/background stays 0.
        const outData = outCtx.getImageData(0, 0, output.width, output.height);
        for (let p = 3; p < outData.data.length; p += 4) {
          outData.data[p] = outData.data[p] === 0 ? 0 : 255;
        }
        outCtx.putImageData(outData, 0, 0);

        const blob = await canvasToPngBlob(output);
        items.push({
          index: items.length + 1,
          blob,
          width: output.width,
          height: output.height,
          needsReview: false,
          reviewReasons: []
        });
      }
    }

    return items.length === 15 ? items : null;
  } catch (error) {
    console.warn('Direct original dark-sheet split failed:', error);
    return null;
  }
}

`
      transformed = transformed.slice(0, componentIndex) + helper + transformed.slice(componentIndex)

      const v12Call = `const originalDarkSplitBlob = await rebuildOriginalDarkSheetForSplit(file);\n      const items = await splitIntoFifteen(originalDarkSplitBlob || resultBlob, file);`
      const sourceCall = 'const items = await splitIntoFifteen(resultBlob, file);'
      const legacyCall = 'const items = await splitIntoFifteen(resultBlob);'
      const replacement = `const directDarkItems = await splitOriginalDarkSheetDirectly(file);\n      const items = directDarkItems || await splitIntoFifteen(resultBlob, file);`

      if (transformed.includes(v12Call)) transformed = transformed.replace(v12Call, replacement)
      else if (transformed.includes(sourceCall)) transformed = transformed.replace(sourceCall, replacement)
      else if (transformed.includes(legacyCall)) transformed = transformed.replace(legacyCall, replacement)
      else throw new Error('[direct-dark-split] autoSplit call not found')

      transformed = transformed.replace(/Split v12/g, 'Split v13 · Direct')
      return { code: transformed, map: null }
    }
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), directOriginalDarkSplit()]
})
