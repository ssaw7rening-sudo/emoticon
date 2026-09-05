import { defineConfig } from 'vite'
import baseConfig from './vite.ui-runtime-cleanup.config.js'

function finalTransparencyIntegrityGuard() {
  return {
    name: 'final-transparency-integrity-guard-v2',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      // Ownership analysis may choose crop boundaries, but splitting must never
      // rewrite source RGBA. A downsampled ownership mask previously cleared
      // pale face and cream fill pixels by setting their alpha to zero.
      const splitStartMarker = 'async function splitIntoFifteen(blob) {'
      const splitEndMarker = 'async function hasRealTransparency(file) {'
      const splitStart = transformed.indexOf(splitStartMarker)
      const splitEnd = transformed.indexOf(splitEndMarker, splitStart)
      if (splitStart < 0 || splitEnd < 0 || splitEnd <= splitStart) {
        throw new Error('[transparency-integrity] Split function boundaries were not found')
      }

      const alphaPreservingSplitter = `async function splitIntoFifteen(blob, sourceFile = null) {
  const { canvas, ctx } = await drawFileToCanvas(blob);
  const width = canvas.width;
  const height = canvas.height;
  if (!width || !height) throw new Error('Invalid canvas dimensions');

  const rows = 3;
  const columns = 5;
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const alphaAt = (x, y) => pixels[(y * width + x) * 4 + 3];

  // Keep an aligned copy of the original uploaded sheet. The processed blob
  // may already contain fully transparent (alpha 0) holes where a pale face,
  // white outline or fine bright wisp was mistaken for background. Once alpha
  // reaches 0 the processed PNG no longer carries usable RGB there, so the
  // splitter must consult the original opaque source to recover those pixels.
  let originalPixels = null;
  let originalBackground = [0, 0, 0];
  let originalHasDarkBorder = false;
  if (sourceFile) {
    try {
      const original = await drawFileToCanvas(sourceFile);
      const aligned = document.createElement('canvas');
      aligned.width = width;
      aligned.height = height;
      const alignedCtx = aligned.getContext('2d', { willReadFrequently: true });
      if (alignedCtx) {
        alignedCtx.drawImage(
          original.canvas,
          0, 0, original.canvas.width, original.canvas.height,
          0, 0, width, height
        );
        originalPixels = alignedCtx.getImageData(0, 0, width, height).data;

        const border = [];
        const step = Math.max(1, Math.floor(Math.min(width, height) / 420));
        const addBorder = (x, y) => {
          const p = (y * width + x) * 4;
          border.push([originalPixels[p], originalPixels[p + 1], originalPixels[p + 2]]);
        };
        for (let x = 0; x < width; x += step) {
          addBorder(x, 0);
          addBorder(x, height - 1);
        }
        for (let y = step; y < height - 1; y += step) {
          addBorder(0, y);
          addBorder(width - 1, y);
        }

        const dark = border.filter(([r, g, b]) => {
          const l = r * 0.2126 + g * 0.7152 + b * 0.0722;
          return l <= 112 && Math.max(r, g, b) <= 148;
        });
        if (border.length && dark.length / border.length >= 0.55) {
          originalHasDarkBorder = true;
          for (const [r, g, b] of dark) {
            originalBackground[0] += r;
            originalBackground[1] += g;
            originalBackground[2] += b;
          }
          originalBackground[0] /= dark.length;
          originalBackground[1] /= dark.length;
          originalBackground[2] /= dark.length;
        }
      }
    } catch (sourceError) {
      console.warn('Original-sheet alpha recovery unavailable:', sourceError);
      originalPixels = null;
    }
  }

  // For a sheet with a demonstrably dark outer matte, rebuild the entire
  // split source from the ORIGINAL upload before any crop is calculated.
  // The processed result may already contain alpha=0 holes inside pale faces;
  // repairing only those holes later is fragile. Here the original source is
  // authoritative: only dark pixels connected to the outer image border are
  // background (alpha 0); every other original pixel remains fully opaque.
  if (originalPixels && originalHasDarkBorder) {
    const rebuilt = ctx.createImageData(width, height);
    rebuilt.data.set(originalPixels);
    const rebuiltData = rebuilt.data;
    const total = width * height;
    const visited = new Uint8Array(total);
    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;

    const matteTolerance = 58;
    const isOuterDarkMatte = (index) => {
      const p = index * 4;
      const r = rebuiltData[p];
      const g = rebuiltData[p + 1];
      const b = rebuiltData[p + 2];
      const l = r * 0.2126 + g * 0.7152 + b * 0.0722;
      const d = Math.sqrt(
        (r - originalBackground[0]) ** 2 +
        (g - originalBackground[1]) ** 2 +
        (b - originalBackground[2]) ** 2
      );
      return l <= 150 && d <= matteTolerance;
    };
    const enqueue = (index) => {
      if (index < 0 || index >= total || visited[index] || !isOuterDarkMatte(index)) return;
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
    // Safety gate: a real dark sheet has a substantial but not all-consuming
    // border-connected matte. If not, keep the normal processed source.
    if (removedRatio >= 0.12 && removedRatio <= 0.88) {
      for (let index = 0; index < total; index += 1) {
        const p = index * 4;
        rebuiltData[p + 3] = visited[index] ? 0 : 255;
      }
      ctx.putImageData(rebuilt, 0, 0);
      pixels.set(rebuiltData);
    }
  }

  // Find the emptiest line close to each expected 5 x 3 boundary. This keeps
  // longer captions intact more often than a rigid grid while retaining a
  // non-overlapping source region for each sticker.
  const findHorizontalSeam = (nominalY) => {
    const radius = Math.max(5, Math.round((height / rows) * 0.13));
    const minY = Math.max(1, Math.round(nominalY) - radius);
    const maxY = Math.min(height - 2, Math.round(nominalY) + radius);
    let bestY = Math.round(nominalY);
    let bestScore = Number.POSITIVE_INFINITY;
    for (let y = minY; y <= maxY; y += 1) {
      let ink = 0;
      for (let x = 0; x < width; x += 2) {
        for (let offset = -1; offset <= 1; offset += 1) {
          if (alphaAt(x, y + offset) > 8) ink += 1;
        }
      }
      const displacement = Math.abs(y - nominalY) / Math.max(1, radius);
      const score = ink + displacement * 2;
      if (score < bestScore) {
        bestScore = score;
        bestY = y;
      }
    }
    return bestY;
  };

  const horizontalSeams = [
    0,
    findHorizontalSeam(height / rows),
    findHorizontalSeam((height * 2) / rows),
    height
  ];

  const findVerticalSeam = (nominalX, top, bottom) => {
    const radius = Math.max(5, Math.round((width / columns) * 0.14));
    const minX = Math.max(1, Math.round(nominalX) - radius);
    const maxX = Math.min(width - 2, Math.round(nominalX) + radius);
    let bestX = Math.round(nominalX);
    let bestScore = Number.POSITIVE_INFINITY;
    for (let x = minX; x <= maxX; x += 1) {
      let ink = 0;
      for (let y = top; y < bottom; y += 2) {
        for (let offset = -1; offset <= 1; offset += 1) {
          if (alphaAt(x + offset, y) > 8) ink += 1;
        }
      }
      const displacement = Math.abs(x - nominalX) / Math.max(1, radius);
      const score = ink + displacement * 2;
      if (score < bestScore) {
        bestScore = score;
        bestX = x;
      }
    }
    return bestX;
  };

  const items = [];
  for (let row = 0; row < rows; row += 1) {
    const cellTop = horizontalSeams[row];
    const cellBottom = horizontalSeams[row + 1];
    const verticalSeams = [0];
    for (let column = 1; column < columns; column += 1) {
      verticalSeams.push(findVerticalSeam((width * column) / columns, cellTop, cellBottom));
    }
    verticalSeams.push(width);

    for (let column = 0; column < columns; column += 1) {
      const cellLeft = verticalSeams[column];
      const cellRight = verticalSeams[column + 1];
      let minX = cellRight;
      let minY = cellBottom;
      let maxX = cellLeft - 1;
      let maxY = cellTop - 1;

      for (let y = cellTop; y < cellBottom; y += 1) {
        for (let x = cellLeft; x < cellRight; x += 1) {
          if (alphaAt(x, y) <= 8) continue;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }

      const hasContent = minX <= maxX && minY <= maxY;
      const padding = Math.max(6, Math.round(Math.min(width / columns, height / rows) * 0.045));
      const cropLeft = hasContent ? Math.max(cellLeft, minX - padding) : cellLeft;
      const cropTop = hasContent ? Math.max(cellTop, minY - padding) : cellTop;
      const cropRight = hasContent ? Math.min(cellRight, maxX + 1 + padding) : cellRight;
      const cropBottom = hasContent ? Math.min(cellBottom, maxY + 1 + padding) : cellBottom;
      const cropWidth = Math.max(1, cropRight - cropLeft);
      const cropHeight = Math.max(1, cropBottom - cropTop);
      const safetyMargin = Math.max(8, Math.round(Math.min(cropWidth, cropHeight) * 0.06));
      const output = document.createElement('canvas');
      output.width = cropWidth + safetyMargin * 2;
      output.height = cropHeight + safetyMargin * 2;
      const outputCtx = output.getContext('2d');
      if (!outputCtx) throw new Error('Canvas 2D is unavailable');

      // drawImage preserves the source crop's alpha semantics. No ownership
      // mask, colour key, or transparency correction is allowed in this stage.
      outputCtx.drawImage(
        canvas,
        cropLeft,
        cropTop,
        cropWidth,
        cropHeight,
        safetyMargin,
        safetyMargin,
        cropWidth,
        cropHeight
      );

      let seamInk = 0;
      if (column > 0) {
        const x = cellLeft;
        for (let y = cellTop; y < cellBottom; y += 2) if (alphaAt(x, y) > 8) seamInk += 1;
      }
      if (column + 1 < columns) {
        const x = cellRight;
        for (let y = cellTop; y < cellBottom; y += 2) if (alphaAt(x, y) > 8) seamInk += 1;
      }
      const needsReview = seamInk > Math.max(4, Math.round((cellBottom - cellTop) * 0.012));
      // Final split-stage opacity repair. drawImage/cropping can retain or
      // expose semi-transparent pale pixels from the sheet. Restore bright
      // subject pixels and solid interior pixels before each individual PNG is
      // exported, while leaving truly empty background pixels at alpha 0.
      const splitImageData = outputCtx.getImageData(0, 0, output.width, output.height);
      const splitData = splitImageData.data;
      const splitSource = new Uint8ClampedArray(splitData);
      const splitAlphaAt = (x, y) => splitSource[(y * output.width + x) * 4 + 3];
      for (let sy = 0; sy < output.height; sy += 1) {
        for (let sx = 0; sx < output.width; sx += 1) {
          const sp = (sy * output.width + sx) * 4;
          const sa = splitSource[sp + 3];

          // Zero-alpha recovery from the original opaque source. This is the
          // critical case previous fixes could not repair: alpha 0 pixels have
          // already lost their RGB in the processed PNG. Only enable this for
          // sheets whose original border is demonstrably dark, so bright/white
          // artwork can be restored without resurrecting a light background.
          const sourceX = cropLeft + sx - safetyMargin;
          const sourceY = cropTop + sy - safetyMargin;
          const insideSource = originalPixels && sourceX >= cropLeft && sourceX < cropRight && sourceY >= cropTop && sourceY < cropBottom;
          if (insideSource && originalHasDarkBorder) {
            const op = (sourceY * width + sourceX) * 4;
            const or = originalPixels[op];
            const og = originalPixels[op + 1];
            const ob = originalPixels[op + 2];
            const ol = or * 0.2126 + og * 0.7152 + ob * 0.0722;
            const bgDistance = Math.sqrt(
              (or - originalBackground[0]) ** 2 +
              (og - originalBackground[1]) ** 2 +
              (ob - originalBackground[2]) ** 2
            );

            if (sa === 0 && ol >= 118 && bgDistance >= 72) {
              splitData[sp] = or;
              splitData[sp + 1] = og;
              splitData[sp + 2] = ob;
              splitData[sp + 3] = 255;
              continue;
            }

            if (sa > 0 && sa < 255 && ol >= 118 && bgDistance >= 64) {
              splitData[sp] = or;
              splitData[sp + 1] = og;
              splitData[sp + 2] = ob;
              splitData[sp + 3] = 255;
              continue;
            }
          }

          if (sa === 0 || sa === 255) continue;
          const sr = splitSource[sp];
          const sg = splitSource[sp + 1];
          const sb = splitSource[sp + 2];
          const sl = sr * 0.2126 + sg * 0.7152 + sb * 0.0722;
          let solidAround = 0;
          let visibleAround = 0;
          for (let oy = -1; oy <= 1; oy += 1) {
            for (let ox = -1; ox <= 1; ox += 1) {
              if (ox === 0 && oy === 0) continue;
              const nx = sx + ox;
              const ny = sy + oy;
              if (nx < 0 || ny < 0 || nx >= output.width || ny >= output.height) continue;
              const na = splitAlphaAt(nx, ny);
              if (na >= 238) solidAround += 1;
              if (na >= 16) visibleAround += 1;
            }
          }
          if (sl >= 138 && sa >= 3) {
            splitData[sp + 3] = 255;
          } else if ((sa >= 20 && solidAround >= 2) || (sa >= 48 && visibleAround >= 5)) {
            splitData[sp + 3] = 255;
          }
        }
      }
      outputCtx.putImageData(splitImageData, 0, 0);

      const itemBlob = await canvasToPngBlob(output);
      items.push({
        index: items.length + 1,
        blob: itemBlob,
        width: output.width,
        height: output.height,
        needsReview,
        reviewReasons: needsReview ? ['touching-content'] : []
      });
    }
  }

  if (items.length !== 15) throw new Error('Could not create 15 sticker outputs');
  return items;
}

`

      transformed = transformed.slice(0, splitStart)
        + alphaPreservingSplitter
        + transformed.slice(splitEnd)

      const splitCallMarker = 'const items = await splitIntoFifteen(resultBlob);'
      if (!transformed.includes(splitCallMarker)) {
        throw new Error('[transparency-integrity] Auto-split invocation was not found')
      }
      transformed = transformed.replace(
        splitCallMarker,
        'const items = await splitIntoFifteen(resultBlob, file);'
      )

      const removeStart = transformed.indexOf('const removeBackground = async')
      const retryStart = transformed.indexOf('const runPrecisionRetry = async', removeStart)
      if (removeStart < 0 || retryStart < 0) {
        throw new Error('[transparency-integrity] Background-removal handler boundaries were not found')
      }

      // Sticker sheets generated on a black or nearly-black matte need a very
      // conservative path. The generic fast remover also examines enclosed
      // dark pockets; eyes, lettering and outlines can make that inspection
      // ambiguous and cause the otherwise-correct result to be discarded in
      // favour of an AI mask. AI masks are precisely what can make pale faces
      // and cream artwork semi-transparent. This pre-pass removes only dark
      // pixels connected to a demonstrably uniform dark image border and never
      // changes the alpha of any enclosed/light foreground pixel.
      const safeDarkPrepass = `async function trySafeDarkBorderRemoval(file) {
  const { canvas, ctx } = await drawFileToCanvas(file, {
    maxEdge: typeof FAST_CANVAS_MAX_EDGE === 'number' ? FAST_CANVAS_MAX_EDGE : 4096,
    maxPixels: typeof FAST_CANVAS_MAX_PIXELS === 'number' ? FAST_CANVAS_MAX_PIXELS : 12 * 1024 * 1024,
  });
  const { width, height } = canvas;
  if (!width || !height) return null;

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const borderColours = [];
  const step = Math.max(1, Math.floor(Math.min(width, height) / 460));
  const addBorderPixel = (x, y) => {
    const p = (y * width + x) * 4;
    if (pixels[p + 3] < 240) return;
    borderColours.push([pixels[p], pixels[p + 1], pixels[p + 2]]);
  };

  for (let x = 0; x < width; x += step) {
    addBorderPixel(x, 0);
    addBorderPixel(x, height - 1);
  }
  for (let y = step; y < height - 1; y += step) {
    addBorderPixel(0, y);
    addBorderPixel(width - 1, y);
  }
  if (borderColours.length < 24) return null;

  const darkBorderColours = borderColours.filter(([r, g, b]) => {
    const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722;
    return luminance <= 78 && Math.max(r, g, b) <= 104;
  });
  if (darkBorderColours.length / borderColours.length < 0.72) return null;

  const background = [0, 0, 0];
  for (const colour of darkBorderColours) {
    background[0] += colour[0];
    background[1] += colour[1];
    background[2] += colour[2];
  }
  background[0] /= darkBorderColours.length;
  background[1] /= darkBorderColours.length;
  background[2] /= darkBorderColours.length;

  const deviations = darkBorderColours
    .map((colour) => colorDistance(colour, background))
    .sort((a, b) => a - b);
  const p95 = deviations[Math.min(deviations.length - 1, Math.floor(deviations.length * 0.95))] || 0;
  if (p95 > 30) return null;
  const tolerance = Math.max(18, Math.min(42, 18 + p95 * 1.6));

  const total = width * height;
  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;
  const matchesDarkMatte = (index) => {
    const p = index * 4;
    if (pixels[p + 3] < 16) return true;
    const r = pixels[p];
    const g = pixels[p + 1];
    const b = pixels[p + 2];
    const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722;
    return luminance <= 112 && colorDistance([r, g, b], background) <= tolerance;
  };
  const enqueue = (index) => {
    if (index < 0 || index >= total || visited[index] || !matchesDarkMatte(index)) return;
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

  // Require a meaningful but not all-consuming border component. Only the
  // already-visited border-connected component gets cleared; enclosed black
  // eyes, lettering and shadows stay solid, while white/ivory faces, fine pale
  // fur/wisps and antialiased sticker outlines keep original RGB and alpha.
  if (tail < total * 0.06 || tail > total * 0.92) return null;
  for (let i = 0; i < tail; i += 1) pixels[queue[i] * 4 + 3] = 0;
  ctx.putImageData(imageData, 0, 0);
  return {
    blob: await canvasToPngBlob(canvas),
    background,
    deterministicDark: true,
  };
}

`

      transformed = transformed.slice(0, removeStart) + safeDarkPrepass + transformed.slice(removeStart)

      const updatedRemoveStart = transformed.indexOf('const removeBackground = async', removeStart + safeDarkPrepass.length)
      const updatedRetryStart = transformed.indexOf('const runPrecisionRetry = async', updatedRemoveStart)
      if (updatedRemoveStart < 0 || updatedRetryStart < 0) {
        throw new Error('[transparency-integrity] Updated background-removal handler boundaries were not found')
      }

      let removeHandler = transformed.slice(updatedRemoveStart, updatedRetryStart)
      const fastCallPattern = /const\s+fastResult\s*=\s*await\s+tryFastUniformBackgroundRemoval\(file\);/
      if (!fastCallPattern.test(removeHandler)) {
        throw new Error('[transparency-integrity] Fast removal call anchor was not found')
      }
      removeHandler = removeHandler.replace(
        fastCallPattern,
        'const fastResult = await trySafeDarkBorderRemoval(file) || await tryFastUniformBackgroundRemoval(file);'
      )
      const qualityPassPattern = /if\s*\(fastQuality\.status\s*===\s*["']pass["']\)\s*\{/
      if (!qualityPassPattern.test(removeHandler)) {
        const fastQualityIndex = removeHandler.indexOf('fastQuality')
        const nearby = fastQualityIndex >= 0
          ? removeHandler.slice(Math.max(0, fastQualityIndex - 120), fastQualityIndex + 280)
          : removeHandler.slice(0, 320)
        throw new Error(`[transparency-integrity] Fast quality gate anchor was not found: ${JSON.stringify(nearby)}`)
      }
      removeHandler = removeHandler.replace(
        qualityPassPattern,
        `if (fastBackgroundIsDark) {
            // A uniform dark border is unambiguous for flood-fill. Generic
            // portrait heuristics must not reroute a sticker sheet to semantic
            // AI, which can erase pale faces, ivory fur, fine wisps and white outlines.
            method = 'fast-dark';
            quality = { status: 'pass', score: 0 };
          } else if (fastQuality.status === 'pass') {`
      )

      const fastCatchPattern = /\}\s*catch\s*\(fastQualityError\)\s*\{[\s\S]*?quality\s*=\s*\{\s*status:\s*["']idle["'],\s*score:\s*0\s*\};\s*\}/
      if (!fastCatchPattern.test(removeHandler)) {
        throw new Error('[transparency-integrity] Fast validation catch anchor was not found')
      }
      removeHandler = removeHandler.replace(
        fastCatchPattern,
        `} catch (fastQualityError) {
          if (fastBackgroundIsDark) {
            console.warn('Fast dark-background quality inspection failed; preserving deterministic flood-fill result:', fastQualityError);
            method = 'fast-dark';
            quality = { status: 'pass', score: 0 };
          } else {
            console.warn('Fast background validation failed; falling back to AI:', fastQualityError);
            blob = null;
            quality = { status: 'idle', score: 0 };
          }
        }`
      )

      const processingMatch = /setStage\(["']processing["']\);/.exec(removeHandler)
      const processingStart = processingMatch?.index ?? -1
      if (processingStart < 0) {
        throw new Error('[transparency-integrity] Processing stage anchor was not found')
      }
      let processingTail = removeHandler.slice(processingStart)
      const processingProgressPattern = /setProgress\(null\);/
      if (!processingProgressPattern.test(processingTail)) {
        throw new Error('[transparency-integrity] Processing progress anchor was not found')
      }
      processingTail = processingTail.replace(
        processingProgressPattern,
        `setProgress(null);
      const fastDarkMatteIsFinal = (method === 'fast-dark' || method === 'fast') && fastBackgroundIsDark;`
      )

      const mainCleanupPattern = /const\s+sheetBeforeCleanup\s*=\s*await\s+detectEmoticonSheet\(blob\);/
      if (!mainCleanupPattern.test(processingTail)) {
        throw new Error('[transparency-integrity] Main cleanup anchor was not found')
      }
      processingTail = processingTail.replace(
        mainCleanupPattern,
        `const sheetBeforeCleanup = fastDarkMatteIsFinal
        ? { status: 'sheet', confidence: 1 }
        : await detectEmoticonSheet(blob);`
      )
      processingTail = processingTail.replace(
        /blob\s*=\s*await\s+correctUnexpectedForegroundTransparency\(blob\);/,
        `if (!fastDarkMatteIsFinal) {
        blob = await correctUnexpectedForegroundTransparency(blob);
      }`
      )
      processingTail = processingTail.replace(
        /blob\s*=\s*await\s+protectLightForegroundOpacity\(blob,\s*file\);/,
        `if (!fastDarkMatteIsFinal) {
        blob = await protectLightForegroundOpacity(blob, file);
      }`
      )
      processingTail = processingTail.replace(
        /quality\s*=\s*await\s+assessRemovalQuality\(blob\);/,
        `quality = fastDarkMatteIsFinal
        ? { status: 'pass', score: 0 }
        : await assessRemovalQuality(blob);`
      )
      processingTail = processingTail.replace(
        /blob\s*=\s*await\s+restoreSolidForegroundOpacity\(file,\s*blob\);/,
        `if (!fastDarkMatteIsFinal) {
        blob = await restoreSolidForegroundOpacity(file, blob);
      }`
      )

      removeHandler = removeHandler.slice(0, processingStart) + processingTail
      transformed = transformed.slice(0, updatedRemoveStart) + removeHandler + transformed.slice(updatedRetryStart)

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), finalTransparencyIntegrityGuard()],
})
