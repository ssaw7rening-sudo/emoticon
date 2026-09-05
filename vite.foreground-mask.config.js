import { defineConfig } from 'vite'
import baseConfig from './vite.source-direct.config.js'

const FINAL_SPLITTER = String.raw`
async function splitIntoFifteenSourceSafe(input, sourceFile = null) {
  const FOREGROUND_MASK_FINAL = 'FOREGROUND_MASK_FINAL';
  void FOREGROUND_MASK_FINAL;
  if (!sourceFile) return splitIntoFifteen(input);

  let processed;
  let source;
  try {
    processed = await drawFileToCanvas(input);
    source = await drawFileToCanvas(sourceFile);
  } catch (error) {
    console.warn('Foreground-mask decode failed; using processed split:', error);
    return splitIntoFifteen(input);
  }

  const width = processed.canvas.width;
  const height = processed.canvas.height;
  if (!width || !height) return splitIntoFifteen(input);

  let sourceCtx = source.ctx;
  if (source.canvas.width !== width || source.canvas.height !== height) {
    const aligned = document.createElement('canvas');
    aligned.width = width;
    aligned.height = height;
    const alignedCtx = aligned.getContext('2d', { willReadFrequently: true });
    if (!alignedCtx) return splitIntoFifteen(input);
    alignedCtx.imageSmoothingEnabled = true;
    alignedCtx.imageSmoothingQuality = 'high';
    alignedCtx.drawImage(source.canvas, 0, 0, source.canvas.width, source.canvas.height, 0, 0, width, height);
    sourceCtx = alignedCtx;
  }

  const processedData = processed.ctx.getImageData(0, 0, width, height);
  const sourceData = sourceCtx.getImageData(0, 0, width, height);
  const processedPixels = processedData.data;
  const sourcePixels = sourceData.data;
  const total = width * height;

  // 1) Estimate the true backdrop only from the outer border of the original.
  const border = [];
  const step = Math.max(1, Math.floor(Math.min(width, height) / 650));
  const pushBorder = (x, y) => {
    const p = (y * width + x) * 4;
    border.push({
      r: sourcePixels[p], g: sourcePixels[p + 1], b: sourcePixels[p + 2], a: sourcePixels[p + 3],
      l: sourcePixels[p] * 0.2126 + sourcePixels[p + 1] * 0.7152 + sourcePixels[p + 2] * 0.0722,
    });
  };
  for (let x = 0; x < width; x += step) { pushBorder(x, 0); pushBorder(x, height - 1); }
  for (let y = step; y < height - 1; y += step) { pushBorder(0, y); pushBorder(width - 1, y); }

  const transparentBorder = border.filter((c) => c.a < 16).length / Math.max(1, border.length);
  const darkBorder = border.filter((c) => c.a >= 16 && c.l <= 122 && Math.max(c.r, c.g, c.b) <= 160);
  const darkBorderRatio = darkBorder.length / Math.max(1, border.length);
  const darkBackdrop = darkBorderRatio >= 0.42;

  let bgR = 0, bgG = 0, bgB = 0;
  if (darkBorder.length) {
    for (const c of darkBorder) { bgR += c.r; bgG += c.g; bgB += c.b; }
    bgR /= darkBorder.length; bgG /= darkBorder.length; bgB /= darkBorder.length;
  }

  // 2) Flood-fill only background pixels connected to the outside.
  // Internal black outlines can never be removed because they are not edge-connected.
  const background = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0, tail = 0;
  const isBackdropPixel = (index) => {
    const p = index * 4;
    const a = sourcePixels[p + 3];
    if (a < 12) return true;
    if (!darkBackdrop) return false;
    const r = sourcePixels[p], g = sourcePixels[p + 1], b = sourcePixels[p + 2];
    const l = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const d = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
    return l <= 152 && d <= 72;
  };
  const enqueue = (index) => {
    if (index < 0 || index >= total || background[index] || !isBackdropPixel(index)) return;
    background[index] = 1;
    queue[tail++] = index;
  };
  for (let x = 0; x < width; x += 1) { enqueue(x); enqueue((height - 1) * width + x); }
  for (let y = 1; y < height - 1; y += 1) { enqueue(y * width); enqueue(y * width + width - 1); }
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
  if ((!darkBackdrop && transparentBorder < 0.15) || removedRatio > 0.96) {
    return splitIntoFifteen(input);
  }

  // 3) Build source-foreground components. Keep only real artwork components:
  // components already seen by the processed mask, or sizeable components from the original.
  const foreground = new Uint8Array(total);
  for (let index = 0; index < total; index += 1) {
    const a = sourcePixels[index * 4 + 3];
    if (!background[index] && a >= 12) foreground[index] = 1;
  }

  const labels = new Uint32Array(total);
  const componentQueue = new Int32Array(total);
  const keepLabels = new Set();
  let label = 0;
  const largeEnough = Math.max(18, Math.round(total * 0.000012));

  for (let seed = 0; seed < total; seed += 1) {
    if (!foreground[seed] || labels[seed]) continue;
    label += 1;
    let ch = 0, ct = 0, area = 0, overlap = 0;
    componentQueue[ct++] = seed;
    labels[seed] = label;
    while (ch < ct) {
      const index = componentQueue[ch++];
      area += 1;
      if (processedPixels[index * 4 + 3] >= 12) overlap += 1;
      const x = index % width;
      const y = Math.floor(index / width);
      const visit = (next) => {
        if (next < 0 || next >= total || !foreground[next] || labels[next]) return;
        labels[next] = label;
        componentQueue[ct++] = next;
      };
      if (x > 0) visit(index - 1);
      if (x + 1 < width) visit(index + 1);
      if (y > 0) visit(index - width);
      if (y + 1 < height) visit(index + width);
    }
    if (overlap >= 2 || area >= largeEnough) keepLabels.add(label);
  }

  // 4) Rebuild RGBA from the original source, but never resurrect true transparent pixels.
  // Existing processed alpha is preferred on the actual outer edge; source alpha repairs interior holes.
  const rebuilt = new Uint8ClampedArray(sourcePixels.length);
  const nearBackground = (index) => {
    const x = index % width;
    const y = Math.floor(index / width);
    for (let dy = -1; dy <= 1; dy += 1) {
      const ny = y + dy;
      if (ny < 0 || ny >= height) continue;
      for (let dx = -1; dx <= 1; dx += 1) {
        const nx = x + dx;
        if (nx < 0 || nx >= width) continue;
        if (background[ny * width + nx]) return true;
      }
    }
    return false;
  };

  for (let index = 0; index < total; index += 1) {
    const p = index * 4;
    const keep = labels[index] && keepLabels.has(labels[index]) && !background[index];
    const sourceAlpha = sourcePixels[p + 3];
    if (!keep || sourceAlpha < 12) continue;

    rebuilt[p] = sourcePixels[p];
    rebuilt[p + 1] = sourcePixels[p + 1];
    rebuilt[p + 2] = sourcePixels[p + 2];

    const processedAlpha = processedPixels[p + 3];
    let alpha = sourceAlpha;
    if (nearBackground(index)) {
      if (processedAlpha > 0) {
        alpha = processedAlpha;
      } else if (darkBackdrop && sourceAlpha >= 248) {
        const r = sourcePixels[p], g = sourcePixels[p + 1], b = sourcePixels[p + 2];
        const d = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
        alpha = Math.max(24, Math.min(255, Math.round(((d - 8) / 58) * 255)));
      }
    } else if (processedAlpha >= 220) {
      alpha = processedAlpha;
    } else {
      // Interior source foreground wins over accidental AI transparency.
      alpha = sourceAlpha;
    }
    rebuilt[p + 3] = alpha;
  }

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
          if (rebuilt[(y * width + x) * 4 + 3] <= 8) continue;
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
          out[dp] = rebuilt[sp];
          out[dp + 1] = rebuilt[sp + 1];
          out[dp + 2] = rebuilt[sp + 2];
          out[dp + 3] = rebuilt[sp + 3];
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
        splitEngine: 'FOREGROUND_MASK',
        needsReview: false,
        reviewReasons: [],
      });
    }
  }
  if (items.length !== 15) throw new Error('Could not create 15 sticker outputs');
  return items;
}
`;

function finalForegroundMask() {
  return {
    name: 'final-foreground-mask-split-and-alpha',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) {
        const start = code.indexOf('async function splitIntoFifteenSourceSafe')
        const end = code.indexOf('async function hasRealTransparency', start)
        if (start < 0 || end < 0 || end <= start) {
          throw new Error('[foreground-mask-final] source-safe splitter not found')
        }
        return { code: code.slice(0, start) + FINAL_SPLITTER + '\n\n' + code.slice(end), map: null }
      }

      if (normalizedId.endsWith('/src/components/EmoticonPostProcessor.jsx')) {
        let transformed = code
        const oldLoop = `        if (pixels[p + 3] === 0) continue;\n        coverage += weights[i];\n        rr += pixels[p] * weights[i];\n        gg += pixels[p + 1] * weights[i];\n        bb += pixels[p + 2] * weights[i];`
        const newLoop = `        const alpha = pixels[p + 3] / 255;\n        if (alpha <= 0) continue;\n        const weightedAlpha = weights[i] * alpha;\n        coverage += weightedAlpha;\n        rr += pixels[p] * weightedAlpha;\n        gg += pixels[p + 1] * weightedAlpha;\n        bb += pixels[p + 2] * weightedAlpha;`
        if (!transformed.includes(oldLoop)) {
          throw new Error('[foreground-mask-final] RGBA resample loop not found')
        }
        transformed = transformed.replace(oldLoop, newLoop)
        transformed = transformed.replace(
          '      out[dp + 3] = 255;',
          "      out[dp + 3] = Math.max(1, Math.min(255, Math.round(coverage * 255))); const SOFT_ALPHA_EXPORT = 'SOFT_ALPHA_EXPORT'; void SOFT_ALPHA_EXPORT;"
        )
        return { code: transformed, map: null }
      }

      return null
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), finalForegroundMask()],
})
