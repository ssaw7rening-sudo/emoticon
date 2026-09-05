import fs from 'node:fs';

const path = 'src/components/BackgroundRemover.jsx';
let code = fs.readFileSync(path, 'utf8');

const helperMarker = 'async function analyzeInputImageRouting(file) {';
if (!code.includes(helperMarker)) {
  const insertAt = code.indexOf('\nexport default function BackgroundRemover');
  if (insertAt < 0) throw new Error('BackgroundRemover export anchor not found');

  const helpers = String.raw`

async function analyzeInputImageRouting(file) {
  const { canvas, ctx } = await drawFileToCanvas(file);
  const width = canvas.width;
  const height = canvas.height;
  if (!width || !height) return { kind: 'photo', confidence: 0, width, height };

  const pixels = ctx.getImageData(0, 0, width, height).data;
  const total = width * height;
  const aspect = width / Math.max(1, height);
  const aspectLooksLikeSheet = Math.abs(aspect - (5 / 3)) <= 0.16;
  const sampleStep = Math.max(1, Math.floor(Math.sqrt(total / 320000)));

  let samples = 0;
  let transparentSamples = 0;
  let partialSamples = 0;
  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
      const alpha = pixels[(y * width + x) * 4 + 3];
      samples += 1;
      if (alpha <= 8) transparentSamples += 1;
      else if (alpha < 248) partialSamples += 1;
    }
  }

  const transparentRatio = transparentSamples / Math.max(1, samples);
  const partialRatio = partialSamples / Math.max(1, samples);
  const hasMeaningfulAlpha = transparentRatio >= 0.004 || partialRatio >= 0.008;

  const measureGrid = (isForeground) => {
    const occupied = new Array(15).fill(0);
    const counts = new Array(15).fill(0);
    let seamForeground = 0;
    let seamSamples = 0;
    const seamBandX = Math.max(1, Math.round(width * 0.0045));
    const seamBandY = Math.max(1, Math.round(height * 0.0075));

    const nearVerticalSeam = (x) => {
      for (let k = 1; k < 5; k += 1) {
        if (Math.abs(x - (width * k / 5)) <= seamBandX) return true;
      }
      return false;
    };
    const nearHorizontalSeam = (y) => {
      for (let k = 1; k < 3; k += 1) {
        if (Math.abs(y - (height * k / 3)) <= seamBandY) return true;
      }
      return false;
    };

    for (let y = 0; y < height; y += sampleStep) {
      const row = Math.min(2, Math.floor(y * 3 / height));
      for (let x = 0; x < width; x += sampleStep) {
        const column = Math.min(4, Math.floor(x * 5 / width));
        const cell = row * 5 + column;
        const foreground = isForeground(x, y);
        counts[cell] += 1;
        if (foreground) occupied[cell] += 1;
        if (nearVerticalSeam(x) || nearHorizontalSeam(y)) {
          seamSamples += 1;
          if (foreground) seamForeground += 1;
        }
      }
    }

    const ratios = occupied.map((value, index) => value / Math.max(1, counts[index]));
    const occupiedCells = ratios.filter((ratio) => ratio >= 0.012 && ratio <= 0.82).length;
    const rowOccupancy = [0, 1, 2].map((row) => ratios.slice(row * 5, row * 5 + 5).filter((ratio) => ratio >= 0.012).length);
    const seamForegroundRatio = seamForeground / Math.max(1, seamSamples);
    const looksLikeGrid =
      aspectLooksLikeSheet &&
      occupiedCells >= 13 &&
      rowOccupancy.every((count) => count >= 4) &&
      seamForegroundRatio <= 0.30;

    return { looksLikeGrid, occupiedCells, rowOccupancy, seamForegroundRatio, ratios };
  };

  if (hasMeaningfulAlpha) {
    const grid = measureGrid((x, y) => pixels[(y * width + x) * 4 + 3] > 20);
    if (grid.looksLikeGrid) {
      return {
        kind: 'transparent-sheet',
        confidence: 0.96,
        width,
        height,
        transparentRatio,
        grid,
      };
    }
    return {
      kind: 'transparent-image',
      confidence: Math.min(0.95, 0.72 + transparentRatio),
      width,
      height,
      transparentRatio,
      grid,
    };
  }

  const estimate = estimateUniformEdgeBackground(pixels, width, height);
  if (estimate && aspectLooksLikeSheet) {
    const threshold = Math.max(24, Math.min(64, estimate.tolerance * 1.08));
    const grid = measureGrid((x, y) => {
      const p = (y * width + x) * 4;
      return colorDistance([pixels[p], pixels[p + 1], pixels[p + 2]], estimate.bg) > threshold;
    });
    if (grid.looksLikeGrid) {
      return {
        kind: 'solid-sheet',
        confidence: 0.92,
        width,
        height,
        background: estimate.bg,
        tolerance: estimate.tolerance,
        grid,
      };
    }
  }

  return { kind: 'photo', confidence: 0.9, width, height };
}

async function splitGridPreserveAlpha(input) {
  const { canvas, ctx } = await drawFileToCanvas(input);
  const width = canvas.width;
  const height = canvas.height;
  if (!width || !height) throw new Error('Invalid sheet dimensions');
  const source = ctx.getImageData(0, 0, width, height).data;
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
          if (source[(y * width + x) * 4 + 3] <= 8) continue;
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
      const safety = Math.max(8, Math.round(Math.min(cropW, cropH) * 0.05));
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
          out[dp] = source[sp];
          out[dp + 1] = source[sp + 1];
          out[dp + 2] = source[sp + 2];
          out[dp + 3] = source[sp + 3];
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
        splitEngine: 'DIRECT_ALPHA_CROP',
        needsReview: false,
        reviewReasons: [],
      });
    }
  }
  return items;
}

async function removeUniformSheetBackground(file, analysis) {
  const { canvas, ctx } = await drawFileToCanvas(file);
  const width = canvas.width;
  const height = canvas.height;
  if (!width || !height) throw new Error('Invalid sheet dimensions');

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const original = new Uint8ClampedArray(pixels);
  const bg = analysis?.background || [255, 255, 255];
  const baseTolerance = Math.max(20, Math.min(52, Number(analysis?.tolerance || 34)));
  const innerTolerance = Math.max(8, Math.min(30, baseTolerance * 0.52));
  const outerTolerance = Math.max(innerTolerance + 10, Math.min(72, baseTolerance * 1.38));
  const strongThreshold = Math.max(30, Math.min(78, baseTolerance * 1.35));
  const rows = 3;
  const columns = 5;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const left = Math.floor(column * width / columns);
      const top = Math.floor(row * height / rows);
      const right = Math.min(width, Math.ceil((column + 1) * width / columns));
      const bottom = Math.min(height, Math.ceil((row + 1) * height / rows));
      const cellW = right - left;
      const cellH = bottom - top;
      const cellTotal = cellW * cellH;
      const distance = new Float32Array(cellTotal);
      const strong = new Uint8Array(cellTotal);

      for (let y = 0; y < cellH; y += 1) {
        for (let x = 0; x < cellW; x += 1) {
          const local = y * cellW + x;
          const p = ((top + y) * width + left + x) * 4;
          const d = colorDistance([original[p], original[p + 1], original[p + 2]], bg);
          distance[local] = d;
          if (original[p + 3] >= 12 && d >= strongThreshold) strong[local] = 1;
        }
      }

      // Close tiny outline gaps before background flood-fill. This protects
      // white/ivory faces and clothing without globally restoring bright pixels.
      const barrier = strong.slice();
      const barrierRadius = Math.max(1, Math.min(2, Math.round(Math.min(cellW, cellH) / 180)));
      for (let y = 0; y < cellH; y += 1) {
        for (let x = 0; x < cellW; x += 1) {
          const local = y * cellW + x;
          if (!strong[local]) continue;
          for (let dy = -barrierRadius; dy <= barrierRadius; dy += 1) {
            const ny = y + dy;
            if (ny < 0 || ny >= cellH) continue;
            for (let dx = -barrierRadius; dx <= barrierRadius; dx += 1) {
              const nx = x + dx;
              if (nx < 0 || nx >= cellW) continue;
              barrier[ny * cellW + nx] = 1;
            }
          }
        }
      }

      // Find the main character component from strong source pixels. Large
      // background-coloured pockets are restored only inside this region;
      // enclosed text counters and decorative gaps remain transparent.
      const labels = new Int32Array(cellTotal);
      const componentQueue = new Int32Array(cellTotal);
      let nextLabel = 0;
      let main = null;
      for (let seed = 0; seed < cellTotal; seed += 1) {
        if (!strong[seed] || labels[seed]) continue;
        nextLabel += 1;
        let head = 0, tail = 0, area = 0;
        let minX = cellW, minY = cellH, maxX = -1, maxY = -1;
        labels[seed] = nextLabel;
        componentQueue[tail++] = seed;
        while (head < tail) {
          const local = componentQueue[head++];
          const x = local % cellW;
          const y = Math.floor(local / cellW);
          area += 1;
          minX = Math.min(minX, x); minY = Math.min(minY, y);
          maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
          const visit = (next) => {
            if (next < 0 || next >= cellTotal || labels[next] || !strong[next]) return;
            labels[next] = nextLabel;
            componentQueue[tail++] = next;
          };
          if (x > 0) visit(local - 1);
          if (x + 1 < cellW) visit(local + 1);
          if (y > 0) visit(local - cellW);
          if (y + 1 < cellH) visit(local + cellW);
        }
        const componentW = maxX - minX + 1;
        const componentH = maxY - minY + 1;
        const score = area * (1 + componentH / Math.max(1, cellH)) + componentW * componentH * 0.08;
        if (!main || score > main.score) main = { score, minX, minY, maxX, maxY, area };
      }

      if (main) {
        const expandX = Math.round(cellW * 0.08);
        const expandY = Math.round(cellH * 0.08);
        main.minX = Math.max(0, main.minX - expandX);
        main.maxX = Math.min(cellW - 1, main.maxX + expandX);
        main.minY = Math.max(0, main.minY - expandY);
        main.maxY = Math.min(cellH - 1, main.maxY + expandY);
      }

      const background = new Uint8Array(cellTotal);
      const queue = new Int32Array(cellTotal);
      let head = 0, tail = 0;
      const enqueue = (local) => {
        if (local < 0 || local >= cellTotal || background[local] || barrier[local]) return;
        if (distance[local] > outerTolerance) return;
        background[local] = 1;
        queue[tail++] = local;
      };
      for (let x = 0; x < cellW; x += 1) { enqueue(x); enqueue((cellH - 1) * cellW + x); }
      for (let y = 1; y < cellH - 1; y += 1) { enqueue(y * cellW); enqueue(y * cellW + cellW - 1); }
      while (head < tail) {
        const local = queue[head++];
        const x = local % cellW;
        const y = Math.floor(local / cellW);
        if (x > 0) enqueue(local - 1);
        if (x + 1 < cellW) enqueue(local + 1);
        if (y > 0) enqueue(local - cellW);
        if (y + 1 < cellH) enqueue(local + cellW);
      }

      // Any background-coloured region that the flood cannot reach is either a
      // protected character interior or an enclosed text/decorative gap.
      const pocketVisited = new Uint8Array(cellTotal);
      const removePocket = new Uint8Array(cellTotal);
      const pocketQueue = new Int32Array(cellTotal);
      const minProtectedArea = Math.max(28, Math.round(cellTotal * 0.0017));
      const minProtectedSpan = Math.max(5, Math.round(Math.min(cellW, cellH) * 0.035));

      for (let seed = 0; seed < cellTotal; seed += 1) {
        if (background[seed] || barrier[seed] || pocketVisited[seed] || distance[seed] > outerTolerance) continue;
        let ph = 0, pt = 0;
        let minX = cellW, minY = cellH, maxX = -1, maxY = -1;
        pocketVisited[seed] = 1;
        pocketQueue[pt++] = seed;
        while (ph < pt) {
          const local = pocketQueue[ph++];
          const x = local % cellW;
          const y = Math.floor(local / cellW);
          minX = Math.min(minX, x); minY = Math.min(minY, y);
          maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
          const visit = (next) => {
            if (next < 0 || next >= cellTotal || background[next] || barrier[next] || pocketVisited[next] || distance[next] > outerTolerance) return;
            pocketVisited[next] = 1;
            pocketQueue[pt++] = next;
          };
          if (x > 0) visit(local - 1);
          if (x + 1 < cellW) visit(local + 1);
          if (y > 0) visit(local - cellW);
          if (y + 1 < cellH) visit(local + cellW);
        }

        const pocketW = maxX - minX + 1;
        const pocketH = maxY - minY + 1;
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        const insideMain = Boolean(main && cx >= main.minX && cx <= main.maxX && cy >= main.minY && cy <= main.maxY);
        const protect = insideMain && pt >= minProtectedArea && (pocketW >= minProtectedSpan || pocketH >= minProtectedSpan);
        if (!protect) {
          for (let i = 0; i < pt; i += 1) removePocket[pocketQueue[i]] = 1;
        }
      }

      for (let y = 0; y < cellH; y += 1) {
        for (let x = 0; x < cellW; x += 1) {
          const local = y * cellW + x;
          const p = ((top + y) * width + left + x) * 4;
          if (removePocket[local]) {
            pixels[p] = 0; pixels[p + 1] = 0; pixels[p + 2] = 0; pixels[p + 3] = 0;
            continue;
          }
          if (!background[local]) {
            pixels[p] = original[p];
            pixels[p + 1] = original[p + 1];
            pixels[p + 2] = original[p + 2];
            pixels[p + 3] = original[p + 3];
            continue;
          }

          const d = distance[local];
          let alpha = 0;
          if (d > innerTolerance) {
            alpha = Math.max(0, Math.min(255, Math.round(((d - innerTolerance) / Math.max(1, outerTolerance - innerTolerance)) * 255)));
          }
          if (alpha <= 2) {
            pixels[p] = 0; pixels[p + 1] = 0; pixels[p + 2] = 0; pixels[p + 3] = 0;
            continue;
          }

          let nr = 0, ng = 0, nb = 0, neighbours = 0;
          for (let radius = 1; radius <= 2; radius += 1) {
            const points = [[x - radius, y], [x + radius, y], [x, y - radius], [x, y + radius]];
            for (const [nx, ny] of points) {
              if (nx < 0 || ny < 0 || nx >= cellW || ny >= cellH) continue;
              const next = ny * cellW + nx;
              if (background[next] || removePocket[next]) continue;
              const np = ((top + ny) * width + left + nx) * 4;
              nr += original[np]; ng += original[np + 1]; nb += original[np + 2]; neighbours += 1;
            }
            if (neighbours) break;
          }
          const mix = neighbours ? Math.min(0.72, (1 - alpha / 255) * 0.7) : 0;
          pixels[p] = neighbours ? Math.round(original[p] * (1 - mix) + (nr / neighbours) * mix) : original[p];
          pixels[p + 1] = neighbours ? Math.round(original[p + 1] * (1 - mix) + (ng / neighbours) * mix) : original[p + 1];
          pixels[p + 2] = neighbours ? Math.round(original[p + 2] * (1 - mix) + (nb / neighbours) * mix) : original[p + 2];
          pixels[p + 3] = Math.min(original[p + 3], alpha);
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvasToPngBlob(canvas);
}
`;

  code = code.slice(0, insertAt) + helpers + code.slice(insertAt);
}

if (!code.includes("const [inputKind, setInputKind]")) {
  const anchor = "  const [precisionMessage, setPrecisionMessage] = useState('');";
  if (!code.includes(anchor)) throw new Error('state anchor not found');
  code = code.replace(anchor, `${anchor}\n  const [inputKind, setInputKind] = useState('unknown');\n  const [inputAnalysis, setInputAnalysis] = useState(null);`);
}

const oldSelectStart = code.indexOf('  const selectFile = async (nextFile) => {');
const oldResetStart = code.indexOf('  const reset = () => {', oldSelectStart);
if (oldSelectStart < 0 || oldResetStart < 0) throw new Error('selectFile block not found');
const newSelect = String.raw`  const selectFile = async (nextFile) => {
    if (!nextFile) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(nextFile.type)) {
      setError(t.badType);
      return;
    }
    if (nextFile.size > 12 * 1024 * 1024) {
      setError(t.tooLarge);
      return;
    }

    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    clearResult();
    setBusy(true);
    setStage('preparing');
    setInputKind('unknown');
    setInputAnalysis(null);
    const nextSourceUrl = URL.createObjectURL(nextFile);
    setFile(nextFile);
    setSourceUrl(nextSourceUrl);

    try {
      const analysis = await analyzeInputImageRouting(nextFile);
      setInputAnalysis(analysis);
      setInputKind(analysis.kind);

      if (analysis.kind === 'transparent-sheet') {
        const result = nextFile;
        setResultBlob(result);
        setResultUrl(URL.createObjectURL(result));
        setResultMethod('sheet-transparent');
        setQualityAssessment({ status: 'pass', score: 0 });
        setSheetDetection({ status: 'sheet', confidence: analysis.confidence || 0.96 });
        const items = await splitGridPreserveAlpha(result);
        const withUrls = items.map((item) => ({ ...item, url: URL.createObjectURL(item.blob) }));
        setSplitItems(withUrls);
        return;
      }

      if (analysis.kind === 'solid-sheet') {
        setStage('processing');
        const result = await removeUniformSheetBackground(nextFile, analysis);
        setResultBlob(result);
        setResultUrl(URL.createObjectURL(result));
        setResultMethod('sheet-solid');
        setQualityAssessment({ status: 'pass', score: 0 });
        setSheetDetection({ status: 'sheet', confidence: analysis.confidence || 0.92 });
        const items = await splitGridPreserveAlpha(result);
        const withUrls = items.map((item) => ({ ...item, url: URL.createObjectURL(item.blob) }));
        setSplitItems(withUrls);
        return;
      }

      if (analysis.kind === 'transparent-image') {
        setResultBlob(nextFile);
        setResultUrl(URL.createObjectURL(nextFile));
        setResultMethod('already-transparent');
        setQualityAssessment({ status: 'pass', score: 0 });
        setSheetDetection({ status: 'not-sheet', confidence: 0.96 });
      }
    } catch (classificationError) {
      console.warn('Automatic image routing failed; using general photo mode:', classificationError);
      setInputKind('photo');
      setInputAnalysis({ kind: 'photo', confidence: 0.4 });
    } finally {
      setBusy(false);
      setStage('');
      setProgress(null);
    }
  };

`;
code = code.slice(0, oldSelectStart) + newSelect + code.slice(oldResetStart);

// Reset routing state when the user starts over.
if (!code.includes("setInputKind('unknown');\n    setInputAnalysis(null);\n    if (inputRef.current)")) {
  code = code.replace(
    "    setSourceUrl('');\n    if (inputRef.current) inputRef.current.value = '';",
    "    setSourceUrl('');\n    setInputKind('unknown');\n    setInputAnalysis(null);\n    if (inputRef.current) inputRef.current.value = '';"
  );
}

// Replace the general-photo removal path. Sheets never call this function.
const removeStart = code.indexOf('  const removeBackground = async () => {');
const precisionStart = code.indexOf('  const runPrecisionRetry = async () => {', removeStart);
if (removeStart < 0 || precisionStart < 0) throw new Error('removeBackground block not found');
const newRemove = String.raw`  const removeBackground = async () => {
    if (!file || busy || (inputKind !== 'photo' && inputKind !== 'unknown')) return;
    clearResult();
    setBusy(true);
    setStage('preparing');
    try {
      let method = 'ai';
      let blob = await removeWithAi(file, (info) => {
        if (typeof info?.progress === 'number') updateRemovalProgress(info.progress);
      });
      let quality = await assessRemovalQuality(blob);

      if (quality.status !== 'pass') {
        try {
          setProgress(null);
          const portraitBlob = await removeWithModnet(file, (info) => {
            if (typeof info?.progress === 'number') updateRemovalProgress(info.progress);
          });
          const portraitQuality = await assessRemovalQuality(portraitBlob);
          if (qualityRank(portraitQuality) < qualityRank(quality)) {
            blob = portraitBlob;
            quality = portraitQuality;
            method = 'modnet';
          }
        } catch (portraitError) {
          console.warn('MODNet portrait retry failed:', portraitError);
        }
      }

      // remove.bg-style principle: preserve a soft alpha matte and correct edge
      // colour contamination instead of forcing a binary 0/255 mask.
      setStage('processing');
      setProgress(null);
      blob = await correctUnexpectedForegroundTransparency(blob);
      blob = await refinePrecisionEdges(blob);
      quality = await assessRemovalQuality(blob);

      setResultMethod(method);
      setQualityAssessment(quality);
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
      setComparePosition(50);
    } catch (e) {
      console.error('Background removal failed:', e);
      setError(t.failed);
    } finally {
      setBusy(false);
      setStage('');
      setProgress(null);
    }
  };

`;
code = code.slice(0, removeStart) + newRemove + code.slice(precisionStart);

// Precision retry is for general photos only; avoid all sheet-specific hole/light restoration.
const precisionEnd = code.indexOf('  const downloadBlob = (blob, filename) => {', precisionStart);
if (precisionEnd < 0) throw new Error('precision block end not found');
const newPrecision = String.raw`  const runPrecisionRetry = async () => {
    if (!file || busy || !resultBlob || inputKind !== 'photo') return;
    setBusy(true);
    setStage('precision');
    setProgress(null);
    setPrecisionMessage('');
    try {
      let precisionBlob = await removeWithBiRefNet(file, (info) => {
        if (typeof info?.progress === 'number') updateRemovalProgress(info.progress);
      });
      precisionBlob = await refineHairBackgroundChannels(precisionBlob);
      precisionBlob = await correctUnexpectedForegroundTransparency(precisionBlob);
      precisionBlob = await cleanAiForegroundArtifacts(precisionBlob);
      precisionBlob = await refinePrecisionEdges(precisionBlob);
      const precisionQuality = await assessRemovalQuality(precisionBlob);
      if (qualityRank(precisionQuality) <= qualityRank(qualityAssessment)) {
        setResultBlob(precisionBlob);
        setResultUrl(URL.createObjectURL(precisionBlob));
        setResultMethod('birefnet');
        setQualityAssessment(precisionQuality);
        setComparePosition(50);
      } else {
        setPrecisionMessage(t.precisionNoBetter);
      }
    } catch (e) {
      console.error('BiRefNet precision retry failed:', e);
      setPrecisionMessage(t.failed);
    } finally {
      setBusy(false);
      setStage('');
      setProgress(null);
    }
  };

`;
code = code.slice(0, precisionStart) + newPrecision + code.slice(precisionEnd);

const autoStart = code.indexOf('  const autoSplit = async () => {');
const autoRef = code.indexOf('  autoSplitCallbackRef.current = autoSplit;', autoStart);
if (autoStart < 0 || autoRef < 0) throw new Error('autoSplit block not found');
const newAuto = String.raw`  const autoSplit = async () => {
    if (splitting || (inputKind !== 'transparent-sheet' && inputKind !== 'solid-sheet')) return;
    const splitSource = inputKind === 'transparent-sheet' ? file : resultBlob;
    if (!splitSource) return;
    clearSplitItems();
    setSplitting(true);
    setSplitError('');
    try {
      const items = await splitGridPreserveAlpha(splitSource);
      if (!items || items.length !== 15) throw new Error('Could not create 15 stickers');
      const withUrls = items.map((item) => ({ ...item, url: URL.createObjectURL(item.blob) }));
      setSplitItems(withUrls);
      setTimeout(() => splitCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    } catch (e) {
      console.error('Sticker auto split failed:', e);
      setSplitError(`${t.splitFailed} [원인: ${e?.message || String(e)}]`);
    } finally {
      setSplitting(false);
    }
  };

`;
code = code.slice(0, autoStart) + newAuto + code.slice(autoRef);

// Auto-split effect follows routing state instead of semantic result detection.
const effectStart = code.indexOf('  useEffect(() => {\n    if (\n      sheetDetection.status', autoRef);
const downloadSplitStart = code.indexOf('  const downloadSplitItem = (item) => {', effectStart);
if (effectStart >= 0 && downloadSplitStart > effectStart) {
  const newEffect = String.raw`  useEffect(() => {
    if (
      (inputKind !== 'transparent-sheet' && inputKind !== 'solid-sheet') ||
      !resultBlob || splitItems.length > 0 || splitting ||
      automaticSplitBlobRef.current === resultBlob
    ) return;
    automaticSplitBlobRef.current = resultBlob;
    autoSplitCallbackRef.current?.();
  }, [inputKind, resultBlob, splitItems.length, splitting]);

`;
  code = code.slice(0, effectStart) + newEffect + code.slice(downloadSplitStart);
}

// Detection notice in UI.
if (!code.includes("data-input-routing")) {
  const uiAnchor = "          {!resultUrl && <div className=\"mb-3 rounded-xl border border-[#DCE8D5] bg-[#F4F8F1] px-3.5 py-2.5 text-xs sm:text-[13px] font-bold leading-5 text-[#587052]\">✂️ {t.sheetSelectedHint}</div>}";
  const ui = `${uiAnchor}\n          {inputKind !== 'unknown' && (\n            <div data-input-routing className=\"mb-3 rounded-xl border border-[#E2DDD5] bg-white px-3.5 py-2.5 text-xs sm:text-[13px] font-extrabold leading-5 text-[#615A52]\">\n              {inputKind === 'transparent-sheet'\n                ? '✂️ 투명 이모티콘 시트 감지 · 배경제거 없이 크롭만 적용'\n                : inputKind === 'solid-sheet'\n                  ? '✂️ 단색 배경 이모티콘 시트 감지 · 5×3 셀별 외곽 배경만 제거'\n                  : inputKind === 'transparent-image'\n                    ? '✅ 이미 투명한 일반 이미지 감지 · 원본 알파 유지'\n                    : '🪄 일반 이미지 감지 · AI 누끼 + 소프트 알파 + 경계 색 보정'}\n            </div>\n          )}`;
  if (!code.includes(uiAnchor)) throw new Error('UI routing anchor not found');
  code = code.replace(uiAnchor, ui);
}

// Precision controls only belong to photos.
code = code.replace(
  "{resultUrl && ['ai', 'modnet'].includes(resultMethod) && qualityAssessment.status === 'fail' && (",
  "{resultUrl && inputKind === 'photo' && ['ai', 'modnet'].includes(resultMethod) && qualityAssessment.status === 'fail' && ("
);
code = code.replace(
  "{resultUrl && ['ai', 'modnet'].includes(resultMethod) && qualityAssessment.status === 'warning' && (",
  "{resultUrl && inputKind === 'photo' && ['ai', 'modnet'].includes(resultMethod) && qualityAssessment.status === 'warning' && ("
);
code = code.replace(
  "{resultUrl && ['ai', 'modnet'].includes(resultMethod) && (",
  "{resultUrl && inputKind === 'photo' && ['ai', 'modnet'].includes(resultMethod) && ("
);

// Main button: only ordinary photos need the AI removal action.
code = code.replace(
  "{!resultUrl ? (\n              <button type=\"button\" disabled={busy} onClick={removeBackground}",
  "{!resultUrl && (inputKind === 'photo' || inputKind === 'unknown') ? (\n              <button type=\"button\" disabled={busy} onClick={removeBackground}"
);

// Split UI only for sheet routes.
code = code.replace(
  "{resultUrl && qualityAssessment.status !== 'fail' && (\n            <div ref={splitCardRef}",
  "{resultUrl && qualityAssessment.status !== 'fail' && (inputKind === 'transparent-sheet' || inputKind === 'solid-sheet') && (\n            <div ref={splitCardRef}"
);

// Human-readable engine labels.
code = code.replace(
  "✓ {resultMethod === 'fast-dark' ? t.methodSafeDark : resultMethod === 'fast' ? t.methodSafe : t.methodAi} · Alpha v8",
  "✓ {resultMethod === 'sheet-transparent' ? '투명 시트 · 원본 Alpha' : resultMethod === 'sheet-solid' ? '단색 시트 · 셀별 배경 제거' : resultMethod === 'already-transparent' ? '원본 투명도 유지' : t.methodAi}"
);

fs.writeFileSync(path, code);
console.log('Applied automatic image routing refactor to', path);
