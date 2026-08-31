import { defineConfig } from 'vite'
import baseConfig from './vite.legal-notices.config.js'

function preciseStickerSheetSplit() {
  return {
    name: 'precise-sticker-sheet-split-v5',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')
      const startMarker = 'async function detectEmoticonSheet(blob) {'
      const endMarker = 'async function hasRealTransparency(file) {'
      const start = transformed.indexOf(startMarker)
      const end = transformed.indexOf(endMarker)

      if (start < 0 || end < 0 || end <= start) {
        throw new Error('[precise-sticker-split] Detection/split block anchors were not found')
      }

      const replacement = `function buildStickerForegroundMask(canvas) {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx || !width || !height) return null;

  const pixels = ctx.getImageData(0, 0, width, height).data;
  const total = width * height;
  let transparent = 0;
  const alphaStep = Math.max(1, Math.floor(Math.sqrt(total / 220000)));

  for (let y = 0; y < height; y += alphaStep) {
    for (let x = 0; x < width; x += alphaStep) {
      if (pixels[(y * width + x) * 4 + 3] < 245) transparent += 1;
    }
  }

  const sampledTotal = Math.ceil(width / alphaStep) * Math.ceil(height / alphaStep);
  const useAlpha = transparent / Math.max(1, sampledTotal) >= 0.06;

  // If the image is still opaque, estimate the solid background from border
  // samples. This keeps sheet detection/splitting stable for both black and
  // white source sheets instead of depending on a successful alpha matte first.
  const borderR = [];
  const borderG = [];
  const borderB = [];
  if (!useAlpha) {
    const borderStep = Math.max(1, Math.floor(Math.max(width, height) / 180));
    const collect = (x, y) => {
      const idx = (y * width + x) * 4;
      borderR.push(pixels[idx]);
      borderG.push(pixels[idx + 1]);
      borderB.push(pixels[idx + 2]);
    };
    for (let x = 0; x < width; x += borderStep) {
      collect(x, 0);
      collect(x, height - 1);
    }
    for (let y = 0; y < height; y += borderStep) {
      collect(0, y);
      collect(width - 1, y);
    }
  }

  const channelMedian = (values) => {
    if (!values.length) return 0;
    const sorted = values.slice().sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };

  const bgR = channelMedian(borderR);
  const bgG = channelMedian(borderG);
  const bgB = channelMedian(borderB);
  const mask = new Uint8Array(total);
  let visibleTotal = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = y * width + x;
      const idx = pixelIndex * 4;
      const alpha = pixels[idx + 3];
      let visible = false;

      if (useAlpha) {
        visible = alpha > 10;
      } else if (alpha > 10) {
        const dr = pixels[idx] - bgR;
        const dg = pixels[idx + 1] - bgG;
        const db = pixels[idx + 2] - bgB;
        // About 28 RGB-distance units ignores JPEG noise and soft white/black
        // backgrounds while keeping sticker outlines, text and pale clothing.
        visible = Math.sqrt(dr * dr + dg * dg + db * db) > 28;
      }

      if (visible) {
        mask[pixelIndex] = 1;
        visibleTotal += 1;
      }
    }
  }

  return { mask, width, height, visibleTotal, mode: useAlpha ? 'alpha' : 'border-color' };
}

function analyzeStickerGridLayout(canvas) {
  const sourceWidth = canvas.width;
  const sourceHeight = canvas.height;
  if (!sourceWidth || !sourceHeight) return null;

  const maxDimension = 900;
  const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const analysisCanvas = document.createElement('canvas');
  analysisCanvas.width = width;
  analysisCanvas.height = height;
  const ctx = analysisCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, width, height);

  const foreground = buildStickerForegroundMask(analysisCanvas);
  if (!foreground || foreground.visibleTotal < width * height * 0.012) return null;

  const { mask } = foreground;
  const colProjection = new Uint32Array(width);
  const rowProjection = new Uint32Array(height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!mask[y * width + x]) continue;
      colProjection[x] += 1;
      rowProjection[y] += 1;
    }
  }

  const findCuts = (projection, cellCount) => {
    const length = projection.length;
    const nominalCell = length / cellCount;
    const cuts = [];
    let valleyScore = 0;

    for (let k = 1; k < cellCount; k += 1) {
      const expected = nominalCell * k;
      const radius = Math.max(4, Math.round(nominalCell * 0.20));
      const from = Math.max(3, Math.round(expected - radius));
      const to = Math.min(length - 4, Math.round(expected + radius));
      let best = Math.round(expected);
      let bestValue = Number.POSITIVE_INFINITY;
      let bestBandAverage = Number.POSITIVE_INFINITY;

      let localSum = 0;
      let localCount = 0;
      const localRadius = Math.max(5, Math.round(nominalCell * 0.15));
      for (let p = Math.max(0, Math.round(expected) - localRadius); p <= Math.min(length - 1, Math.round(expected) + localRadius); p += 1) {
        localSum += projection[p];
        localCount += 1;
      }
      const localAverage = localSum / Math.max(1, localCount);

      for (let p = from; p <= to; p += 1) {
        // Score a small separator band rather than one pixel so anti-aliased text
        // or a stray hair cannot pull the cut through a neighboring sticker.
        const bandAverage = (
          projection[p - 2] +
          projection[p - 1] +
          projection[p] +
          projection[p + 1] +
          projection[p + 2]
        ) / 5;
        const expectedPenalty = Math.abs(p - expected) / Math.max(1, radius) * Math.max(1, localAverage) * 0.12;
        const adjusted = bandAverage + expectedPenalty;
        if (adjusted < bestValue) {
          bestValue = adjusted;
          bestBandAverage = bandAverage;
          best = p;
        }
      }

      valleyScore += localAverage > 0 ? Math.max(0, 1 - bestBandAverage / localAverage) : 0;
      cuts.push(best);
    }

    return {
      cuts,
      valleyScore: valleyScore / Math.max(1, cellCount - 1)
    };
  };

  const makeBounds = (length, cuts) => {
    const points = [0, ...cuts, length];
    const bounds = [];
    for (let i = 0; i < points.length - 1; i += 1) {
      bounds.push({ start: points[i], end: Math.max(points[i], points[i + 1] - 1) });
    }
    return bounds;
  };

  const evaluate = (cols, rows) => {
    const xCuts = findCuts(colProjection, cols);
    const yCuts = findCuts(rowProjection, rows);
    const colBounds = makeBounds(width, xCuts.cuts);
    const rowBounds = makeBounds(height, yCuts.cuts);
    const cellVisible = [];
    let nonEmpty = 0;

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x0 = colBounds[col].start;
        const x1 = colBounds[col].end;
        const y0 = rowBounds[row].start;
        const y1 = rowBounds[row].end;
        const cellArea = Math.max(1, (x1 - x0 + 1) * (y1 - y0 + 1));
        let count = 0;
        for (let y = y0; y <= y1; y += 1) {
          for (let x = x0; x <= x1; x += 1) {
            if (mask[y * width + x]) count += 1;
          }
        }
        const occupancy = count / cellArea;
        cellVisible.push(occupancy);
        if (occupancy >= 0.006) nonEmpty += 1;
      }
    }

    const occupied = cellVisible.filter((value) => value >= 0.006);
    const mean = occupied.reduce((sum, value) => sum + value, 0) / Math.max(1, occupied.length);
    const deviation = occupied.reduce((sum, value) => sum + Math.abs(value - mean), 0) / Math.max(1, occupied.length);
    const balance = mean > 0 ? Math.max(0, 1 - deviation / mean) : 0;
    const separatorScore = (xCuts.valleyScore + yCuts.valleyScore) / 2;
    const score = (nonEmpty / 15) * 0.64 + separatorScore * 0.24 + balance * 0.12;
    return { cols, rows, colBounds, rowBounds, nonEmpty, score, separatorScore, balance, width, height, maskMode: foreground.mode };
  };

  // Prompt Maker's 15-emoticon specification is canonical 5 columns × 3 rows.
  // The canvas itself may be portrait (for example 1031×1536) or square, so the
  // image aspect ratio must never switch the logical grid to 3×5.
  const best = evaluate(5, 3);

  return {
    ...best,
    scaleX: sourceWidth / width,
    scaleY: sourceHeight / height
  };
}

async function detectEmoticonSheet(blob) {
  const { canvas } = await drawFileToCanvas(blob);
  const layout = analyzeStickerGridLayout(canvas);
  if (!layout) return { status: 'not-sheet', confidence: 0 };

  let confidence = Math.max(0, Math.min(1, layout.score));
  if (layout.nonEmpty >= 15 && layout.separatorScore >= 0.24) confidence = Math.max(confidence, 0.84);
  else if (layout.nonEmpty >= 14) confidence = Math.max(confidence, 0.72);
  else if (layout.nonEmpty >= 13) confidence = Math.max(confidence, 0.60);

  if (layout.nonEmpty >= 14 && confidence >= 0.72) return { status: 'sheet', confidence, cols: 5, rows: 3 };
  if (layout.nonEmpty >= 12 && confidence >= 0.50) return { status: 'ambiguous', confidence, cols: 5, rows: 3 };
  return { status: 'not-sheet', confidence };
}

async function splitIntoFifteen(blob) {
  const { canvas } = await drawFileToCanvas(blob);
  const { width, height } = canvas;
  const layout = analyzeStickerGridLayout(canvas);
  if (!layout) throw new Error('Could not analyze sticker sheet layout');

  const foreground = buildStickerForegroundMask(canvas);
  if (!foreground) throw new Error('Could not analyze sticker foreground');
  const { mask } = foreground;
  const items = [];
  let detectedCells = 0;

  const toSourceBounds = (bound, axisScale, maxValue) => ({
    start: Math.max(0, Math.min(maxValue - 1, Math.round(bound.start * axisScale))),
    end: Math.max(0, Math.min(maxValue - 1, Math.round((bound.end + 1) * axisScale) - 1))
  });

  const colBounds = layout.colBounds.map((bound) => toSourceBounds(bound, layout.scaleX, width));
  const rowBounds = layout.rowBounds.map((bound) => toSourceBounds(bound, layout.scaleY, height));

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const cellX0 = colBounds[col].start;
      const cellX1 = colBounds[col].end;
      const cellY0 = rowBounds[row].start;
      const cellY1 = rowBounds[row].end;
      const cellWidth = Math.max(1, cellX1 - cellX0 + 1);
      const cellHeight = Math.max(1, cellY1 - cellY0 + 1);

      // Give each cell a very small overlap into the separator gutter. This is
      // enough to preserve a hand, hair strand or caption outline that crosses a
      // cut by a few pixels without reaching the neighboring sticker body.
      const overlapX = Math.max(2, Math.round(cellWidth * 0.035));
      const overlapY = Math.max(2, Math.round(cellHeight * 0.025));
      const scanX0 = Math.max(0, cellX0 - overlapX);
      const scanX1 = Math.min(width - 1, cellX1 + overlapX);
      const scanY0 = Math.max(0, cellY0 - overlapY);
      const scanY1 = Math.min(height - 1, cellY1 + overlapY);

      let minX = scanX1;
      let minY = scanY1;
      let maxX = scanX0;
      let maxY = scanY0;
      let visible = 0;

      for (let y = scanY0; y <= scanY1; y += 1) {
        for (let x = scanX0; x <= scanX1; x += 1) {
          if (!mask[y * width + x]) continue;
          visible += 1;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }

      const minVisible = Math.max(16, Math.round(cellWidth * cellHeight * 0.0025));
      if (visible >= minVisible && maxX >= minX && maxY >= minY) {
        detectedCells += 1;
      } else {
        minX = cellX0;
        minY = cellY0;
        maxX = cellX1;
        maxY = cellY1;
      }

      const padding = Math.max(8, Math.round(Math.min(cellWidth, cellHeight) * 0.075));
      minX = Math.max(scanX0, minX - padding);
      minY = Math.max(scanY0, minY - padding);
      maxX = Math.min(scanX1, maxX + padding);
      maxY = Math.min(scanY1, maxY + padding);

      const cropWidth = Math.max(1, maxX - minX + 1);
      const cropHeight = Math.max(1, maxY - minY + 1);
      const output = document.createElement('canvas');
      output.width = cropWidth;
      output.height = cropHeight;
      const outputCtx = output.getContext('2d');
      if (!outputCtx) throw new Error('Canvas 2D is unavailable');
      outputCtx.clearRect(0, 0, cropWidth, cropHeight);
      outputCtx.drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      const itemBlob = await canvasToPngBlob(output);
      items.push({
        index: items.length + 1,
        blob: itemBlob,
        width: cropWidth,
        height: cropHeight
      });
    }
  }

  if (items.length !== 15 || detectedCells < 12) {
    throw new Error('Could not reliably detect 15 sticker cells');
  }
  return items;
}

`

      transformed = transformed.slice(0, start) + replacement + transformed.slice(end)
      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), preciseStickerSheetSplit()],
})
