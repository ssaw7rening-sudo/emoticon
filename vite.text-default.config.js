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
      `      if (!blob) {
        method = 'ai';
        setStage('preparing');
        blob = await removeWithAi(file, (info) => {
          if (typeof info?.progress === 'number') {
            setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
          }
        });
        quality = await assessRemovalQuality(blob);

        // ORMBG is broad-purpose. If its mask looks unreliable, automatically
        // try MODNet, a smaller portrait-matting model, and keep whichever
        // result scores better. This costs nothing on clean ORMBG results.
        if (quality.status !== 'pass') {
          try {
            setStage('preparing');
            setProgress(null);
            const portraitBlob = await removeWithModnet(file, (info) => {
              if (typeof info?.progress === 'number') {
                setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
              }
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
      }`,
      `      if (!blob) {
        const { canvas: sourceCanvas } = await drawFileToCanvas(file);
        const portraitFirst =
          sourceCanvas.width > 0 &&
          sourceCanvas.height > 0 &&
          sourceCanvas.height >= sourceCanvas.width * 1.08;

        if (portraitFirst) {
          // Vertical photos are most often people/selfies in this tool. Start with
          // the portrait-matting model so ceilings, pillars and wall structures are
          // less likely to be retained as foreground. Only fall back to ORMBG when
          // MODNet is clearly unreliable.
          method = 'modnet';
          setStage('preparing');
          setProgress(null);
          blob = await removeWithModnet(file, (info) => {
            if (typeof info?.progress === 'number') {
              setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
            }
          });
          quality = await assessRemovalQuality(blob);

          const modnetClearlyFailed =
            quality.status === 'fail' ||
            (quality.status === 'warning' && (quality.score ?? 0) >= 4);

          if (modnetClearlyFailed) {
            try {
              setStage('preparing');
              setProgress(null);
              const generalBlob = await removeWithAi(file, (info) => {
                if (typeof info?.progress === 'number') {
                  setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
                }
              });
              const generalQuality = await assessRemovalQuality(generalBlob);
              if (qualityRank(generalQuality) < qualityRank(quality)) {
                blob = generalBlob;
                quality = generalQuality;
                method = 'ai';
              }
            } catch (generalError) {
              console.warn('ORMBG fallback after MODNet failed:', generalError);
            }
          }
        } else {
          // Square/landscape images keep the broad-purpose path so sticker sheets,
          // objects and product images are not forced through a portrait model.
          method = 'ai';
          setStage('preparing');
          blob = await removeWithAi(file, (info) => {
            if (typeof info?.progress === 'number') {
              setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
            }
          });
          quality = await assessRemovalQuality(blob);

          if (quality.status !== 'pass') {
            try {
              setStage('preparing');
              setProgress(null);
              const portraitBlob = await removeWithModnet(file, (info) => {
                if (typeof info?.progress === 'number') {
                  setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
                }
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
        }
      }`
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
