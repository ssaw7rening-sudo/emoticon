import { defineConfig } from 'vite'
import baseConfig from './vite.legal-notices.config.js'

function preciseStickerSheetSplit() {
  return {
    name: 'precise-sticker-sheet-split-v3',
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

      const replacement = `function analyzeStickerGridLayout(canvas) {
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

  const pixels = ctx.getImageData(0, 0, width, height).data;
  const colProjection = new Uint32Array(width);
  const rowProjection = new Uint32Array(height);
  let visibleTotal = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = pixels[(y * width + x) * 4 + 3];
      if (alpha <= 8) continue;
      colProjection[x] += 1;
      rowProjection[y] += 1;
      visibleTotal += 1;
    }
  }

  if (visibleTotal < width * height * 0.015) return null;

  const findCuts = (projection, cellCount) => {
    const length = projection.length;
    const nominalCell = length / cellCount;
    const cuts = [];
    let valleyScore = 0;

    for (let k = 1; k < cellCount; k += 1) {
      const expected = nominalCell * k;
      const radius = Math.max(3, Math.round(nominalCell * 0.19));
      const from = Math.max(2, Math.round(expected - radius));
      const to = Math.min(length - 3, Math.round(expected + radius));
      let best = Math.round(expected);
      let bestValue = Number.POSITIVE_INFINITY;

      for (let p = from; p <= to; p += 1) {
        const value = projection[p - 1] + projection[p] + projection[p + 1];
        const expectedPenalty = Math.abs(p - expected) / Math.max(1, radius) * Math.max(1, projection[p]) * 0.12;
        const adjusted = value + expectedPenalty;
        if (adjusted < bestValue) {
          bestValue = adjusted;
          best = p;
        }
      }

      const localRadius = Math.max(4, Math.round(nominalCell * 0.12));
      let localSum = 0;
      let localCount = 0;
      for (let p = Math.max(0, best - localRadius); p <= Math.min(length - 1, best + localRadius); p += 1) {
        localSum += projection[p];
        localCount += 1;
      }
      const localAverage = localSum / Math.max(1, localCount);
      const cutValue = projection[best];
      valleyScore += localAverage > 0 ? Math.max(0, 1 - cutValue / localAverage) : 0;
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
            if (pixels[(y * width + x) * 4 + 3] > 8) count += 1;
          }
        }
        const occupancy = count / cellArea;
        cellVisible.push(occupancy);
        if (occupancy >= 0.008) nonEmpty += 1;
      }
    }

    const occupied = cellVisible.filter((value) => value >= 0.008);
    const mean = occupied.reduce((sum, value) => sum + value, 0) / Math.max(1, occupied.length);
    const deviation = occupied.reduce((sum, value) => sum + Math.abs(value - mean), 0) / Math.max(1, occupied.length);
    const balance = mean > 0 ? Math.max(0, 1 - deviation / mean) : 0;
    const separatorScore = (xCuts.valleyScore + yCuts.valleyScore) / 2;

    const score = (nonEmpty / 15) * 0.64 + separatorScore * 0.24 + balance * 0.12;
    return { cols, rows, colBounds, rowBounds, nonEmpty, score, separatorScore, balance, width, height };
  };

  const portrait = evaluate(3, 5);
  const landscape = evaluate(5, 3);
  const aspect = sourceWidth / Math.max(1, sourceHeight);

  // The generated 15-emoticon sheets used by Prompt Maker are normally a 5×3
  // layout, including square 1:1 outputs. The former score-only choice often
  // mistook those square sheets for 3×5, which sliced every sticker horizontally
  // across two rows. Keep 5×3 for square/landscape sheets; use 3×5 only when the
  // source itself is clearly portrait-oriented.
  let best;
  if (aspect >= 0.84) {
    best = landscape;
  } else if (aspect <= 0.72) {
    best = portrait;
  } else {
    // In the narrow ambiguous portrait band, require a meaningful score advantage
    // before changing away from the expected 5×3 layout.
    best = portrait.score > landscape.score + 0.16 ? portrait : landscape;
  }

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
  if (layout.nonEmpty >= 15 && layout.separatorScore >= 0.28) confidence = Math.max(confidence, 0.84);
  else if (layout.nonEmpty >= 14) confidence = Math.max(confidence, 0.72);
  else if (layout.nonEmpty >= 13) confidence = Math.max(confidence, 0.60);

  if (layout.nonEmpty >= 14 && confidence >= 0.72) return { status: 'sheet', confidence, cols: layout.cols, rows: layout.rows };
  if (layout.nonEmpty >= 12 && confidence >= 0.50) return { status: 'ambiguous', confidence, cols: layout.cols, rows: layout.rows };
  return { status: 'not-sheet', confidence };
}

async function splitIntoFifteen(blob) {
  const { canvas, ctx } = await drawFileToCanvas(blob);
  const { width, height } = canvas;
  const layout = analyzeStickerGridLayout(canvas);
  if (!layout) throw new Error('Could not analyze sticker sheet layout');

  const pixels = ctx.getImageData(0, 0, width, height).data;
  const items = [];
  let detectedCells = 0;

  const toSourceBounds = (bound, axisScale, maxValue) => ({
    start: Math.max(0, Math.min(maxValue - 1, Math.round(bound.start * axisScale))),
    end: Math.max(0, Math.min(maxValue - 1, Math.round((bound.end + 1) * axisScale) - 1))
  });

  const colBounds = layout.colBounds.map((bound) => toSourceBounds(bound, layout.scaleX, width));
  const rowBounds = layout.rowBounds.map((bound) => toSourceBounds(bound, layout.scaleY, height));

  for (let row = 0; row < layout.rows; row += 1) {
    for (let col = 0; col < layout.cols; col += 1) {
      const cellX0 = colBounds[col].start;
      const cellX1 = colBounds[col].end;
      const cellY0 = rowBounds[row].start;
      const cellY1 = rowBounds[row].end;
      const cellWidth = Math.max(1, cellX1 - cellX0 + 1);
      const cellHeight = Math.max(1, cellY1 - cellY0 + 1);

      let minX = cellX1;
      let minY = cellY1;
      let maxX = cellX0;
      let maxY = cellY0;
      let visible = 0;

      // Scan the entire cell instead of selecting only one connected component.
      // This keeps separated text, character parts, hearts, motion marks and
      // other detached decoration in the same sticker crop.
      for (let y = cellY0; y <= cellY1; y += 1) {
        for (let x = cellX0; x <= cellX1; x += 1) {
          const alpha = pixels[(y * width + x) * 4 + 3];
          if (alpha <= 3) continue;
          visible += 1;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }

      const minVisible = Math.max(16, Math.round(cellWidth * cellHeight * 0.003));
      if (visible >= minVisible && maxX >= minX && maxY >= minY) {
        detectedCells += 1;
      } else {
        minX = cellX0;
        minY = cellY0;
        maxX = cellX1;
        maxY = cellY1;
      }

      const padding = Math.max(8, Math.round(Math.min(cellWidth, cellHeight) * 0.065));
      minX = Math.max(cellX0, minX - padding);
      minY = Math.max(cellY0, minY - padding);
      maxX = Math.min(cellX1, maxX + padding);
      maxY = Math.min(cellY1, maxY + padding);

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
