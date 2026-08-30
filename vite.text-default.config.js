import { defineConfig } from 'vite'
import baseConfig from './vite.config.js'

function improveBackgroundRemoval() {
  const replacements = [
    [
      'async function removeWithModnet(file, onProgress) {\n  return pipelineRemovalToBlob(file, getModnetRemover, onProgress);\n}',
      `async function preserveOriginalRgb(file, alphaBlob) {
  const { canvas, ctx } = await drawFileToCanvas(file);
  const { canvas: alphaCanvas } = await drawFileToCanvas(alphaBlob);
  const { width, height } = canvas;
  if (!width || !height) return alphaBlob;

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
  if (!maskCtx) return alphaBlob;
  maskCtx.imageSmoothingEnabled = true;
  maskCtx.imageSmoothingQuality = 'high';
  maskCtx.clearRect(0, 0, width, height);
  maskCtx.drawImage(alphaCanvas, 0, 0, width, height);

  const originalData = ctx.getImageData(0, 0, width, height);
  const maskData = maskCtx.getImageData(0, 0, width, height).data;
  const pixels = originalData.data;
  for (let p = 0; p < pixels.length; p += 4) {
    const sourceAlpha = pixels[p + 3];
    const matteAlpha = maskData[p + 3];
    pixels[p + 3] = Math.round((sourceAlpha * matteAlpha) / 255);
  }

  ctx.putImageData(originalData, 0, 0);
  return canvasToPngBlob(canvas);
}

async function removeWithModnet(file, onProgress) {
  const blob = await pipelineRemovalToBlob(file, getModnetRemover, onProgress);
  const preserved = await preserveOriginalRgb(file, blob);
  const corrected = await correctUnexpectedForegroundTransparency(preserved);
  return cleanAiForegroundArtifacts(corrected, true);
}`
    ],
    [
      `async function removeWithAi(file, onProgress) {
  const blob = await pipelineRemovalToBlob(file, getRemover, onProgress);
  const corrected = await correctUnexpectedForegroundTransparency(blob);
  return cleanAiForegroundArtifacts(corrected);
}`,
      `async function removeWithAi(file, onProgress) {
  const blob = await pipelineRemovalToBlob(file, getRemover, onProgress);
  const preserved = await preserveOriginalRgb(file, blob);
  const corrected = await correctUnexpectedForegroundTransparency(preserved);
  return cleanAiForegroundArtifacts(corrected, true);
}`
    ],
    [
      '  const { labels, components } = analyzeAlphaComponents(analysisCtx, analysisWidth, analysisHeight, 36);',
      '  const { labels, components } = analyzeAlphaComponents(analysisCtx, analysisWidth, analysisHeight, 48);'
    ],
    [
      `    // Typical ORMBG leftovers are wall/sign/ceiling fragments attached to the
    // outer frame. Do not discard a sizeable second/third person merely for
    // being near one edge; only reject strongly background-like edge shapes.
    const suspiciousEdgeFragment =
      (edgeCount >= 2 && component.area < largest.area * 0.62) ||
      (((touchesLeft || touchesRight || touchesTop) && !touchesBottom) &&
        component.area < largest.area * 0.28 &&
        (fillRatio < 0.48 || aspect > 2.7));`,
      `    // Typical ORMBG leftovers are wall/sign/ceiling fragments attached to the
    // outer frame. Preserve plausible secondary people, but reject tall narrow
    // pillars, ceiling bars and other large edge remnants more aggressively.
    const plausibleSecondaryPerson =
      component.height >= analysisHeight * 0.42 &&
      component.width >= analysisWidth * 0.10 &&
      component.centerY >= analysisHeight * 0.36;

    const narrowVerticalEdgeFragment =
      !plausibleSecondaryPerson &&
      (touchesLeft || touchesRight) &&
      !touchesBottom &&
      component.width <= analysisWidth * 0.22 &&
      component.height >= analysisHeight * 0.18 &&
      aspect >= 2.55 &&
      component.area < largest.area * 0.82;

    const flatTopEdgeFragment =
      !plausibleSecondaryPerson &&
      touchesTop &&
      !touchesBottom &&
      component.height <= analysisHeight * 0.20 &&
      component.width >= analysisWidth * 0.15 &&
      aspect >= 2.55 &&
      component.area < largest.area * 0.82;

    const distantEdgeFragment =
      !plausibleSecondaryPerson &&
      (touchesLeft || touchesRight || touchesTop) &&
      !touchesBottom &&
      component.area < largest.area * 0.58 &&
      (Math.abs(component.centerX - analysisWidth / 2) > analysisWidth * 0.27 ||
        component.centerY < analysisHeight * 0.30) &&
      (fillRatio < 0.60 || aspect > 2.15);

    const suspiciousEdgeFragment =
      (edgeCount >= 2 && component.area < largest.area * 0.68 && !plausibleSecondaryPerson) ||
      (((touchesLeft || touchesRight || touchesTop) && !touchesBottom) &&
        component.area < largest.area * 0.34 &&
        (fillRatio < 0.52 || aspect > 2.45) &&
        !plausibleSecondaryPerson) ||
      narrowVerticalEdgeFragment ||
      flatTopEdgeFragment ||
      distantEdgeFragment;`
    ],
    [
      'async function assessRemovalQuality(blob) {',
      `async function shouldTryPortraitModel(blob) {
  const { canvas } = await drawFileToCanvas(blob);
  const { width, height } = canvas;
  if (!width || !height) return false;

  // Portrait matting is only auto-compared for clearly vertical images. This
  // keeps square sticker sheets and most object/product images on ORMBG.
  const aspect = width / Math.max(1, height);
  if (aspect > 0.92 || height < width * 1.08) return false;

  const maxDimension = 420;
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const analysisWidth = Math.max(1, Math.round(width * scale));
  const analysisHeight = Math.max(1, Math.round(height * scale));
  const analysisCanvas = document.createElement('canvas');
  analysisCanvas.width = analysisWidth;
  analysisCanvas.height = analysisHeight;
  const ctx = analysisCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return false;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, analysisWidth, analysisHeight);

  const pixels = ctx.getImageData(0, 0, analysisWidth, analysisHeight).data;
  const threshold = 56;
  let coreVisible = 0;
  let coreTotal = 0;
  let lowerCoreVisible = 0;
  let lowerCoreTotal = 0;
  let upperOuterVisible = 0;
  let upperOuterTotal = 0;
  let upperSideVisible = 0;
  let upperSideTotal = 0;
  let topVisible = 0;
  let topTotal = 0;

  for (let y = 0; y < analysisHeight; y += 1) {
    const yRatio = y / Math.max(1, analysisHeight - 1);
    for (let x = 0; x < analysisWidth; x += 1) {
      const xRatio = x / Math.max(1, analysisWidth - 1);
      const visible = pixels[(y * analysisWidth + x) * 4 + 3] >= threshold;

      if (xRatio >= 0.25 && xRatio <= 0.75 && yRatio >= 0.18 && yRatio <= 0.95) {
        coreTotal += 1;
        if (visible) coreVisible += 1;
      }
      if (xRatio >= 0.18 && xRatio <= 0.82 && yRatio >= 0.66 && yRatio <= 0.98) {
        lowerCoreTotal += 1;
        if (visible) lowerCoreVisible += 1;
      }
      if (yRatio <= 0.62 && (xRatio <= 0.24 || xRatio >= 0.76)) {
        upperOuterTotal += 1;
        if (visible) upperOuterVisible += 1;
      }
      if (yRatio <= 0.70 && (xRatio <= 0.10 || xRatio >= 0.90)) {
        upperSideTotal += 1;
        if (visible) upperSideVisible += 1;
      }
      if (yRatio <= 0.12) {
        topTotal += 1;
        if (visible) topVisible += 1;
      }
    }
  }

  const coreRatio = coreVisible / Math.max(1, coreTotal);
  const lowerCoreRatio = lowerCoreVisible / Math.max(1, lowerCoreTotal);
  const upperOuterRatio = upperOuterVisible / Math.max(1, upperOuterTotal);
  const upperSideRatio = upperSideVisible / Math.max(1, upperSideTotal);
  const topRatio = topVisible / Math.max(1, topTotal);

  // A centered upper-body/full-body photo normally has strong central and lower
  // foreground coverage. Large upper-corner/side coverage is then more likely to
  // be ceiling, wall, sign or pillar residue than part of the person.
  const centeredSubject = coreRatio >= 0.34 && lowerCoreRatio >= 0.38;
  const suspiciousPortraitFrame =
    upperOuterRatio >= 0.09 ||
    upperSideRatio >= 0.11 ||
    topRatio >= 0.10;

  return centeredSubject && suspiciousPortraitFrame;
}

async function assessRemovalQuality(blob) {`
    ],
    [
      `        // ORMBG is broad-purpose. If its mask looks unreliable, automatically
        // try MODNet, a smaller portrait-matting model, and keep whichever
        // result scores better. This costs nothing on clean ORMBG results.
        if (quality.status !== 'pass') {`,
      `        // ORMBG is broad-purpose. Besides warning/failure cases, vertical
        // centered portraits with suspicious upper-frame residue are compared
        // against MODNet even if the generic quality score says "pass".
        const portraitCandidate = quality.status === 'pass' ? await shouldTryPortraitModel(blob) : false;
        if (quality.status !== 'pass' || portraitCandidate) {`
    ],
    [
      `            const portraitQuality = await assessRemovalQuality(portraitBlob);
            if (qualityRank(portraitQuality) < qualityRank(quality)) {`,
      `            const portraitQuality = await assessRemovalQuality(portraitBlob);
            const portraitPassPreferred =
              portraitCandidate &&
              quality.status === 'pass' &&
              portraitQuality.status === 'pass';
            if (qualityRank(portraitQuality) < qualityRank(quality) || portraitPassPreferred) {`
    ]
  ]

  return {
    name: 'improve-background-removal',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')
      for (const [from, to] of replacements) {
        if (!transformed.includes(from)) {
          throw new Error(`[background-removal] Expected source pattern was not found: ${from}`)
        }
        transformed = transformed.replace(from, to)
      }

      return { code: transformed, map: null }
    },
  }
}

function defaultTextIncludedMode() {
  const replacements = [
    ["const [geminiTextMode, setGeminiTextMode] = useState('visual');", "const [geminiTextMode, setGeminiTextMode] = useState('text');"],
    ["const [grokTextMode, setGrokTextMode] = useState('visual');", "const [grokTextMode, setGrokTextMode] = useState('text');"],
    ["setGeminiTextMode('visual');", "setGeminiTextMode('text');"],
    ["setGrokTextMode('visual');", "setGrokTextMode('text');"],
  ]

  return {
    name: 'default-text-included-mode',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/App.jsx')) return null

      let transformed = code
      for (const [from, to] of replacements) {
        if (!transformed.includes(from)) {
          throw new Error(`[text-default] Expected App source pattern was not found: ${from}`)
        }
        transformed = transformed.split(from).join(to)
      }

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [improveBackgroundRemoval(), defaultTextIncludedMode(), ...(baseConfig.plugins || [])],
})
