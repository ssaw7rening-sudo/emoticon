import { defineConfig } from 'vite'
import baseConfig from './vite.ben2-test.config.js'

function automaticBen2Routing() {
  return {
    name: 'automatic-ben2-routing',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      if (!code.includes('async function removeWithBen2(file, onProgress)')) {
        throw new Error('[ben2-auto] BEN2 removal helper was not found')
      }

      const startAnchor = "      if (!blob) {\n        method = 'ai';"
      const endAnchor = "\n\n      setStage('processing');"
      const start = code.indexOf(startAnchor)
      const end = code.indexOf(endAnchor, start)

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

        // BEN2 is the preferred model for normal photos because it generally
        // preserves detailed subject boundaries better. On memory-constrained
        // devices we keep the lightweight path as the automatic default; the
        // precision retry button can still load BEN2 explicitly when requested.
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

        // Only pay for the lightweight fallback when BEN2 is unavailable or its
        // quality gate is not clean. This keeps normal high-quality BEN2 runs to
        // a single model inference while retaining the existing safety net.
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

        if (!bestBlob) {
          throw new Error('All background-removal models failed');
        }

        blob = bestBlob;
        quality = bestQuality;
        method = bestMethod;
      }`

      const transformed = code.slice(0, start) + replacement + code.slice(end)
      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), automaticBen2Routing()],
})
