import { defineConfig } from 'vite'
import baseConfig from './vite.ui-runtime-cleanup.config.js'

function finalTransparencyIntegrityGuard() {
  return {
    name: 'final-transparency-integrity-guard-v1',
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

      const alphaPreservingSplitter = `async function splitIntoFifteen(blob) {
  const { canvas, ctx } = await drawFileToCanvas(blob);
  const width = canvas.width;
  const height = canvas.height;
  if (!width || !height) throw new Error('Invalid canvas dimensions');

  const rows = 3;
  const columns = 5;
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const alphaAt = (x, y) => pixels[(y * width + x) * 4 + 3];

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

      const removeStart = transformed.indexOf('const removeBackground = async')
      const retryStart = transformed.indexOf('const runPrecisionRetry = async', removeStart)
      if (removeStart < 0 || retryStart < 0) {
        throw new Error('[transparency-integrity] Background-removal handler boundaries were not found')
      }

      let removeHandler = transformed.slice(removeStart, retryStart)
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
            // AI, which can erase pale faces and cream artwork.
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
      const fastDarkMatteIsFinal = method === 'fast' && fastBackgroundIsDark;`
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
      transformed = transformed.slice(0, removeStart) + removeHandler + transformed.slice(retryStart)

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), finalTransparencyIntegrityGuard()],
})
