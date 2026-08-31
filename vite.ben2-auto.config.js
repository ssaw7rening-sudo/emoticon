import { defineConfig } from 'vite'
import baseConfig from './vite.shadow-cleanup.config.js'

function automaticBen2Routing() {
  return {
    name: 'automatic-ben2-routing',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code

      const promiseAnchor = 'let birefNetPromise = null;'
      if (!transformed.includes(promiseAnchor)) {
        throw new Error('[ben2-auto] BiRefNet promise anchor was not found')
      }
      transformed = transformed.replace(
        promiseAnchor,
        `${promiseAnchor}\nlet ben2Promise = null;`
      )

      const getterAnchor = 'async function getBiRefNet(onProgress) {'
      if (!transformed.includes(getterAnchor)) {
        throw new Error('[ben2-auto] BiRefNet getter anchor was not found')
      }
      const ben2Getter = `async function getBen2Remover(onProgress) {
  if (!ben2Promise) {
    ben2Promise = (async () => {
      const { pipeline, RawImage } = await import('@huggingface/transformers');
      const remover = await pipeline('background-removal', 'onnx-community/BEN2-ONNX', {
        device: 'wasm',
        progress_callback: (info) => onProgress?.(info)
      });
      return { remover, RawImage };
    })().catch((error) => {
      ben2Promise = null;
      throw error;
    });
  }
  return ben2Promise;
}

`
      transformed = transformed.replace(getterAnchor, `${ben2Getter}${getterAnchor}`)

      const removeAnchor = 'async function removeWithBiRefNet(file, onProgress) {'
      if (!transformed.includes(removeAnchor)) {
        throw new Error('[ben2-auto] BiRefNet removal anchor was not found')
      }
      const ben2Remove = `async function removeWithBen2(file, onProgress) {
  return pipelineRemovalToBlob(file, getBen2Remover, onProgress);
}

`
      transformed = transformed.replace(removeAnchor, `${ben2Remove}${removeAnchor}`)

      const startAnchor = "      if (!blob) {\n        method = 'ai';"
      const endAnchor = "\n\n      setStage('processing');"
      const start = transformed.indexOf(startAnchor)
      const end = transformed.indexOf(endAnchor, start)
      if (start < 0 || end < 0) {
        throw new Error('[ben2-auto] AI routing block was not found')
      }

      const replacement = `      if (!blob) {
        const deviceMemory =
          typeof navigator !== 'undefined' && typeof navigator.deviceMemory === 'number'
            ? navigator.deviceMemory
            : null;
        const hardwareConcurrency =
          typeof navigator !== 'undefined' && typeof navigator.hardwareConcurrency === 'number'
            ? navigator.hardwareConcurrency
            : null;
        const lowMemoryDevice =
          (deviceMemory !== null && deviceMemory <= 4) ||
          (deviceMemory === null && hardwareConcurrency !== null && hardwareConcurrency <= 4);

        let bestBlob = null;
        let bestQuality = null;
        let bestMethod = '';

        const keepCandidate = (candidateBlob, candidateQuality, candidateMethod) => {
          if (!candidateBlob || !candidateQuality) return;
          if (!bestBlob || qualityRank(candidateQuality) < qualityRank(bestQuality)) {
            bestBlob = candidateBlob;
            bestQuality = candidateQuality;
            bestMethod = candidateMethod;
          }
        };

        const updateModelProgress = (info) => {
          if (typeof info?.progress === 'number') {
            setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
          }
        };

        // Normal photos prefer BEN2. Devices that explicitly report limited
        // memory stay on the lighter path automatically and can still request
        // BEN2 through the precision retry button.
        if (!lowMemoryDevice) {
          try {
            setStage('preparing');
            setProgress(null);
            let ben2Blob = await removeWithBen2(file, updateModelProgress);
            ben2Blob = await refineHairBackgroundChannels(ben2Blob);
            ben2Blob = await correctUnexpectedForegroundTransparency(ben2Blob);
            ben2Blob = await cleanAiForegroundArtifacts(ben2Blob);
            ben2Blob = await refinePrecisionEdges(ben2Blob);
            const ben2Quality = await assessRemovalQuality(ben2Blob);
            keepCandidate(ben2Blob, ben2Quality, 'ben2');
          } catch (ben2Error) {
            console.warn('Automatic BEN2 removal failed; falling back to lightweight models:', ben2Error);
          }
        }

        // A clean BEN2 result ends here. Only uncertain results pay the cost of
        // additional models, preserving quality without running every model.
        if (!bestBlob || bestQuality.status !== 'pass') {
          try {
            setStage('preparing');
            setProgress(null);
            const aiBlob = await removeWithAi(file, updateModelProgress);
            const aiQuality = await assessRemovalQuality(aiBlob);
            keepCandidate(aiBlob, aiQuality, 'ai');
          } catch (aiError) {
            console.warn('ORMBG fallback failed:', aiError);
          }
        }

        if (!bestBlob || bestQuality.status !== 'pass') {
          try {
            setStage('preparing');
            setProgress(null);
            const portraitBlob = await removeWithModnet(file, updateModelProgress);
            const portraitQuality = await assessRemovalQuality(portraitBlob);
            keepCandidate(portraitBlob, portraitQuality, 'modnet');
          } catch (portraitError) {
            console.warn('MODNet fallback failed:', portraitError);
          }
        }

        if (!bestBlob) throw new Error('All background-removal models failed');

        blob = bestBlob;
        quality = bestQuality;
        method = bestMethod;
      }`

      transformed = transformed.slice(0, start) + replacement + transformed.slice(end)

      // Low-memory automatic runs still expose the existing precision retry.
      // That retry now uses BEN2 instead of BiRefNet so users get the same
      // high-quality path on demand.
      const precisionStart = transformed.indexOf('const runPrecisionRetry = async () => {')
      if (precisionStart < 0) {
        throw new Error('[ben2-auto] Precision retry handler was not found')
      }
      const beforePrecision = transformed.slice(0, precisionStart)
      let precisionSection = transformed.slice(precisionStart)
      if (!precisionSection.includes('let precisionBlob = await removeWithBiRefNet(file,')) {
        throw new Error('[ben2-auto] Precision BiRefNet call was not found')
      }
      precisionSection = precisionSection.replace(
        'let precisionBlob = await removeWithBiRefNet(file,',
        'let precisionBlob = await removeWithBen2(file,'
      )
      precisionSection = precisionSection.replace(
        "setResultMethod('birefnet');",
        "setResultMethod('ben2');"
      )
      precisionSection = precisionSection.replace(
        "console.error('BiRefNet precision retry failed:', e);",
        "console.error('BEN2 precision retry failed:', e);"
      )

      transformed = beforePrecision + precisionSection
      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [automaticBen2Routing(), ...(baseConfig.plugins || [])],
})
