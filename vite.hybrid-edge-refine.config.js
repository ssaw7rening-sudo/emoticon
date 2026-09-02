import { defineConfig } from 'vite'
import baseConfig from './vite.upload-mobile-precision.config.js'

function hybridEdgeRefinement() {
  return {
    name: 'hybrid-original-resolution-edge-refinement-v1',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      // Mobile keeps the same precision model, but inference is only used for a
      // coarse subject matte. Fine hair/clothing/finger edges are reconstructed
      // afterwards from original-resolution RGB, so a smaller inference image is
      // both faster and less likely to stall the browser.
      const mobileInferenceAnchor = 'return highEndMobile ? 1152 : 960;'
      if (!transformed.includes(mobileInferenceAnchor)) {
        throw new Error('[hybrid-edge] Mobile inference size anchor was not found')
      }
      transformed = transformed.replace(
        mobileInferenceAnchor,
        'return highEndMobile ? 960 : 768;'
      )

      const assessAnchor = 'async function assessRemovalQuality(blob) {'
      if (!transformed.includes(assessAnchor)) {
        throw new Error('[hybrid-edge] Quality-assessment anchor was not found')
      }

      const helper = `// HYBRID_ORIGINAL_RESOLUTION_EDGE_REFINEMENT_V1
async function refineHybridPrecisionEdges(matteBlob, sourceFile) {
  if (!sourceFile) return refinePrecisionEdges(matteBlob);

  const [{ canvas: sourceCanvas, ctx: sourceCtx }, { canvas: matteCanvas }] = await Promise.all([
    drawFileToCanvas(sourceFile),
    drawFileToCanvas(matteBlob)
  ]);

  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  if (!width || !height || width < 6 || height < 6) return matteBlob;

  // Upscale only the matte to original dimensions. RGB always comes from the
  // original source image, which avoids the soft/painted look of an upscaled AI
  // result and gives the edge pass access to the real hair pixels.
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
  if (!maskCtx) return matteBlob;
  maskCtx.imageSmoothingEnabled = true;
  maskCtx.imageSmoothingQuality = 'high';
  maskCtx.drawImage(matteCanvas, 0, 0, width, height);

  // Build a cheap low-resolution edge map first. All expensive color-aware work
  // is then restricted to this narrow band rather than scanning/neighbour-testing
  // every source pixel.
  const mobileLike = typeof isMobileLikeDevice === 'function' ? isMobileLikeDevice() : false;
  const analysisMax = mobileLike ? 640 : 900;
  const analysisScale = Math.min(1, analysisMax / Math.max(width, height));
  const analysisWidth = Math.max(1, Math.round(width * analysisScale));
  const analysisHeight = Math.max(1, Math.round(height * analysisScale));
  const analysisCanvas = document.createElement('canvas');
  analysisCanvas.width = analysisWidth;
  analysisCanvas.height = analysisHeight;
  const analysisCtx = analysisCanvas.getContext('2d', { willReadFrequently: true });
  if (!analysisCtx) return matteBlob;
  analysisCtx.imageSmoothingEnabled = true;
  analysisCtx.imageSmoothingQuality = 'high';
  analysisCtx.drawImage(maskCanvas, 0, 0, analysisWidth, analysisHeight);

  const analysisPixels = analysisCtx.getImageData(0, 0, analysisWidth, analysisHeight).data;
  const analysisTotal = analysisWidth * analysisHeight;
  let edgeBand = new Uint8Array(analysisTotal);

  for (let y = 1; y < analysisHeight - 1; y += 1) {
    for (let x = 1; x < analysisWidth - 1; x += 1) {
      const index = y * analysisWidth + x;
      const a = analysisPixels[index * 4 + 3];
      const left = analysisPixels[(index - 1) * 4 + 3];
      const right = analysisPixels[(index + 1) * 4 + 3];
      const up = analysisPixels[(index - analysisWidth) * 4 + 3];
      const down = analysisPixels[(index + analysisWidth) * 4 + 3];
      const minA = Math.min(a, left, right, up, down);
      const maxA = Math.max(a, left, right, up, down);

      // Catch both naturally feathered mattes and hard/stepped silhouettes.
      if ((a > 5 && a < 250) || (maxA - minA >= 52 && maxA >= 88 && minA <= 176)) {
        edgeBand[index] = 1;
      }
    }
  }

  // Expand only a few analysis pixels. At source resolution this corresponds to
  // a narrow contour around hair, shoulders, fingers and clothing edges.
  const expandIterations = mobileLike ? 2 : 3;
  for (let iteration = 0; iteration < expandIterations; iteration += 1) {
    const expanded = edgeBand.slice();
    for (let y = 1; y < analysisHeight - 1; y += 1) {
      for (let x = 1; x < analysisWidth - 1; x += 1) {
        const index = y * analysisWidth + x;
        if (!edgeBand[index]) continue;
        expanded[index - 1] = 1;
        expanded[index + 1] = 1;
        expanded[index - analysisWidth] = 1;
        expanded[index + analysisWidth] = 1;
        expanded[index - analysisWidth - 1] = 1;
        expanded[index - analysisWidth + 1] = 1;
        expanded[index + analysisWidth - 1] = 1;
        expanded[index + analysisWidth + 1] = 1;
      }
    }
    edgeBand = expanded;
  }

  const sourceImageData = sourceCtx.getImageData(0, 0, width, height);
  const sourcePixels = sourceImageData.data;
  const maskImageData = maskCtx.getImageData(0, 0, width, height);
  const maskPixels = maskImageData.data;
  const alphaOut = new Uint8ClampedArray(width * height);
  const xScale = analysisWidth / width;
  const yScale = analysisHeight / height;

  for (let index = 0; index < alphaOut.length; index += 1) {
    alphaOut[index] = maskPixels[index * 4 + 3];
  }

  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [1, -1], [-1, 1], [1, 1]
  ];
  const sampleRadii = mobileLike ? [2, 4] : [2, 4, 6];
  const colorDistanceSq = (r1, g1, b1, r2, g2, b2) => {
    const dr = r1 - r2;
    const dg = g1 - g2;
    const db = b1 - b2;
    return dr * dr + dg * dg + db * db;
  };

  for (let y = 1; y < height - 1; y += 1) {
    const ay = Math.min(analysisHeight - 1, Math.floor(y * yScale));
    for (let x = 1; x < width - 1; x += 1) {
      const ax = Math.min(analysisWidth - 1, Math.floor(x * xScale));
      if (!edgeBand[ay * analysisWidth + ax]) continue;

      const index = y * width + x;
      const p = index * 4;
      const currentAlpha = alphaOut[index];
      let fgR = 0;
      let fgG = 0;
      let fgB = 0;
      let fgCount = 0;
      let bgR = 0;
      let bgG = 0;
      let bgB = 0;
      let bgCount = 0;

      for (const radius of sampleRadii) {
        for (const [dx, dy] of directions) {
          const nx = x + dx * radius;
          const ny = y + dy * radius;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const ni = ny * width + nx;
          const np = ni * 4;
          const neighborAlpha = alphaOut[ni];
          if (neighborAlpha >= 238) {
            fgR += sourcePixels[np];
            fgG += sourcePixels[np + 1];
            fgB += sourcePixels[np + 2];
            fgCount += 1;
          } else if (neighborAlpha <= 18) {
            bgR += sourcePixels[np];
            bgG += sourcePixels[np + 1];
            bgB += sourcePixels[np + 2];
            bgCount += 1;
          }
        }
      }

      if (fgCount < 2 || bgCount < 2) continue;
      fgR /= fgCount;
      fgG /= fgCount;
      fgB /= fgCount;
      bgR /= bgCount;
      bgG /= bgCount;
      bgB /= bgCount;

      const pr = sourcePixels[p];
      const pg = sourcePixels[p + 1];
      const pb = sourcePixels[p + 2];
      const dFg = colorDistanceSq(pr, pg, pb, fgR, fgG, fgB);
      const dBg = colorDistanceSq(pr, pg, pb, bgR, bgG, bgB);
      const distanceTotal = dFg + dBg;
      if (distanceTotal < 4) continue;

      // A source pixel closer to confident foreground receives more opacity.
      // Confidence controls how strongly the original matte may be changed.
      const colorAlpha = Math.max(0, Math.min(255, Math.round((dBg / distanceTotal) * 255)));
      const confidence = Math.min(1, Math.abs(dBg - dFg) / Math.max(1, distanceTotal));
      let blend = 0.38 + confidence * 0.30;
      if (currentAlpha <= 6 || currentAlpha >= 249) blend *= 0.72;
      const refinedAlpha = Math.max(0, Math.min(255, Math.round(currentAlpha * (1 - blend) + colorAlpha * blend)));
      alphaOut[index] = refinedAlpha;

      // Remove background-color fringe from semi-transparent strands by gently
      // pulling RGB toward nearby confident foreground color. This is localized
      // to the edge band and never recolors opaque subject interiors.
      if (refinedAlpha > 8 && refinedAlpha < 244) {
        const pull = Math.min(0.34, (1 - refinedAlpha / 255) * 0.40);
        sourcePixels[p] = Math.round(sourcePixels[p] * (1 - pull) + fgR * pull);
        sourcePixels[p + 1] = Math.round(sourcePixels[p + 1] * (1 - pull) + fgG * pull);
        sourcePixels[p + 2] = Math.round(sourcePixels[p + 2] * (1 - pull) + fgB * pull);
      }
    }
  }

  // ADAPTIVE_ALPHA_EDGE_SMOOTHING_V4
  // Smooth only the narrow detected contour. Existing partial alpha receives a
  // stronger edge-aware blend, while a hard 0/255 staircase may gain at most one
  // anti-aliased contour pixel. Fine isolated strands are protected by requiring
  // local foreground support before a hard transparent pixel can be softened.
  const smoothedAlpha = alphaOut.slice();
  for (let y = 1; y < height - 1; y += 1) {
    const ay = Math.min(analysisHeight - 1, Math.floor(y * yScale));
    for (let x = 1; x < width - 1; x += 1) {
      const ax = Math.min(analysisWidth - 1, Math.floor(x * xScale));
      if (!edgeBand[ay * analysisWidth + ax]) continue;
      const index = y * width + x;
      const a = alphaOut[index];
      const neighbours = [
        alphaOut[index - 1], alphaOut[index + 1],
        alphaOut[index - width], alphaOut[index + width],
        alphaOut[index - width - 1], alphaOut[index - width + 1],
        alphaOut[index + width - 1], alphaOut[index + width + 1]
      ];
      let localMin = 255;
      let localMax = 0;
      let opaqueSupport = 0;
      let transparentSupport = 0;
      let orthogonalSum = 0;
      let diagonalSum = 0;
      for (let n = 0; n < neighbours.length; n += 1) {
        const value = neighbours[n];
        if (value < localMin) localMin = value;
        if (value > localMax) localMax = value;
        if (value >= 224) opaqueSupport += 1;
        if (value <= 31) transparentSupport += 1;
        if (n < 4) orthogonalSum += value;
        else diagonalSum += value;
      }

      const mixedBoundary = localMin <= 28 && localMax >= 227;
      const targetAlpha = (orthogonalSum / 4) * 0.72 + (diagonalSum / 4) * 0.28;

      // Existing feathered pixels: remove staircase wobble while preserving
      // low-alpha hair/fur texture. Medium-alpha clothing/skin edges can accept
      // a little more smoothing than very fine strands.
      if (a > 3 && a < 252) {
        const localSpan = localMax - localMin;
        const strandLike = a < 72 || (opaqueSupport <= 2 && transparentSupport >= 4);
        let smoothing = strandLike ? 0.16 : 0.36;
        if (!strandLike && localSpan >= 96) smoothing = 0.45;
        if (!strandLike && a >= 72 && a <= 216 && localSpan >= 144) smoothing = 0.50;
        const blended = Math.round(a * (1 - smoothing) + targetAlpha * smoothing);
        const maxDelta = strandLike ? 18 : 40;
        smoothedAlpha[index] = Math.max(0, Math.min(255, Math.max(a - maxDelta, Math.min(a + maxDelta, blended))));
        continue;
      }

      // Hard matte staircases previously stayed perfectly binary. Create only a
      // restrained one-pixel AA contour. Transparent pixels need at least two
      // confident foreground neighbours so isolated hairs are not thickened.
      if (!mixedBoundary) continue;
      if (a <= 3) {
        if (opaqueSupport < 2) continue;
        const softened = Math.round(targetAlpha * 0.24);
        smoothedAlpha[index] = Math.max(0, Math.min(52, softened));
      } else if (a >= 252) {
        if (transparentSupport < 2) continue;
        const softened = Math.round(255 * 0.76 + targetAlpha * 0.24);
        smoothedAlpha[index] = Math.max(202, Math.min(255, softened));
      }
    }
  }

  for (let index = 0; index < smoothedAlpha.length; index += 1) {
    sourcePixels[index * 4 + 3] = smoothedAlpha[index];
  }
  sourceCtx.putImageData(sourceImageData, 0, 0);
  return canvasToPngBlob(sourceCanvas);
}

`

      if (!transformed.includes('HYBRID_ORIGINAL_RESOLUTION_EDGE_REFINEMENT_V1')) {
        transformed = transformed.replace(assessAnchor, `${helper}${assessAnchor}`)
      }

      let replacementCount = 0
      const replaceCall = (from, to) => {
        if (transformed.includes(from)) {
          replacementCount += transformed.split(from).length - 1
          transformed = transformed.split(from).join(to)
        }
      }
      replaceCall('await refinePrecisionEdges(blob)', 'await refineHybridPrecisionEdges(blob, file)')
      replaceCall('await refinePrecisionEdges(precisionBlob)', 'await refineHybridPrecisionEdges(precisionBlob, file)')

      if (!replacementCount) {
        throw new Error('[hybrid-edge] Precision edge-refinement calls were not found')
      }

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), hybridEdgeRefinement()],
})
