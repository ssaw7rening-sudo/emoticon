import { defineConfig } from 'vite'
import baseConfig from './vite.text-default.config.js'

function portraitPrecisionBackgroundFix() {
  return {
    name: 'portrait-precision-background-fix',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      const fastPattern = /let\s+blob\s*=\s*await\s+tryFastUniformBackgroundRemoval\(file\);/
      if (!fastPattern.test(transformed)) {
        throw new Error('[portrait-precision] Fast-removal source pattern was not found')
      }
      transformed = transformed.replace(
        fastPattern,
        `// Portrait photos must not use the edge-color shortcut. Complex indoor
      // backgrounds can look uniform at the border while ceiling, furniture and
      // pillars remain as false foreground. Vertical photos go straight to AI.
      const { canvas: fastPreflightCanvas } = await drawFileToCanvas(file);
      const skipFastForPortrait =
        fastPreflightCanvas.width > 0 &&
        fastPreflightCanvas.height >= fastPreflightCanvas.width * 1.08;
      let blob = skipFastForPortrait ? null : await tryFastUniformBackgroundRemoval(file);`
      )

      const portraitPattern = /if\s*\(portraitFirst\)\s*\{[\s\S]*?\n\s*\}\s*else\s*\{/
      if (!portraitPattern.test(transformed)) {
        throw new Error('[portrait-precision] Portrait-first source pattern was not found')
      }

      const portraitTarget = `if (portraitFirst) {
          // Vertical photos bypass the fast remover and use BiRefNet Lite first.
          // Do not run the generic alpha booster here: it can turn weak residual
          // background alpha back into visible ceiling or pillar fragments.
          let precisionError = null;
          try {
            method = 'birefnet';
            setStage('preparing');
            setProgress(null);
            blob = await removeWithBiRefNet(file, (info) => {
              if (typeof info?.progress === 'number') {
                setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
              }
            });
            blob = await refineHairBackgroundChannels(blob);
            blob = await cleanAiForegroundArtifacts(blob);
            blob = await refinePrecisionEdges(blob);
            quality = await assessRemovalQuality(blob);
          } catch (error) {
            precisionError = error;
            blob = null;
            quality = { status: 'fail', score: 99 };
            console.warn('BiRefNet portrait-first removal failed:', error);
          }

          if (!blob || quality.status === 'fail') {
            try {
              setStage('preparing');
              setProgress(null);
              const portraitBlob = await removeWithModnet(file, (info) => {
                if (typeof info?.progress === 'number') {
                  setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
                }
              });
              const portraitQuality = await assessRemovalQuality(portraitBlob);
              if (!blob || qualityRank(portraitQuality) < qualityRank(quality)) {
                blob = portraitBlob;
                quality = portraitQuality;
                method = 'modnet';
              }
            } catch (portraitError) {
              console.warn('MODNet fallback after BiRefNet failed:', portraitError);
            }
          }

          if (!blob || quality.status === 'fail') {
            try {
              setStage('preparing');
              setProgress(null);
              const generalBlob = await removeWithAi(file, (info) => {
                if (typeof info?.progress === 'number') {
                  setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
                }
              });
              const generalQuality = await assessRemovalQuality(generalBlob);
              if (!blob || qualityRank(generalQuality) < qualityRank(quality)) {
                blob = generalBlob;
                quality = generalQuality;
                method = 'ai';
              }
            } catch (generalError) {
              console.warn('ORMBG last-resort fallback failed:', generalError, precisionError);
            }
          }

          if (!blob) throw precisionError || new Error('Portrait background removal failed');
        } else {`

      transformed = transformed.replace(portraitPattern, portraitTarget)
      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), portraitPrecisionBackgroundFix()],
})
