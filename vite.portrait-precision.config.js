import { defineConfig } from 'vite'
import baseConfig from './vite.text-default.config.js'

function backgroundQualityRouting() {
  return {
    name: 'background-quality-routing',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      // The fast flood-fill path is only allowed for genuinely uniform backdrops.
      // These stricter checks deliberately prefer a slower AI pass over a false
      // positive on indoor scenes, landscapes, furniture, signage or mixed light.
      const strictFastReplacements = [
        [
          '.filter((patch) => patch && patch.spread <= 24);',
          '.filter((patch) => patch && patch.spread <= 12);'
        ],
        [
          'if (patches.length < 4) return null;',
          'if (patches.length < 6) return null;'
        ],
        [
          'const group = patches.filter((patch) => colorDistance(seed.mean, patch.mean) <= 42);',
          'const group = patches.filter((patch) => colorDistance(seed.mean, patch.mean) <= 22);'
        ],
        [
          'if (bestGroup.length < 4) return null;',
          'if (bestGroup.length < 6) return null;'
        ],
        [
          'const tolerance = Math.max(24, Math.min(52, 24 + groupSpread * 1.35));',
          'const tolerance = Math.max(14, Math.min(30, 14 + groupSpread * 0.9));'
        ],
        [
          'if (tail < total * 0.06) return null;',
          'if (tail < total * 0.15) return null;'
        ]
      ]

      for (const [from, to] of strictFastReplacements) {
        if (!transformed.includes(from)) {
          throw new Error(`[background-quality] Expected fast-removal pattern was not found: ${from}`)
        }
        transformed = transformed.replace(from, to)
      }

      // The previous build routing created a portraitFirst branch after the fast
      // check. Direction is not a reliable proxy for photo type, so every image
      // that was not confidently removed by the strict uniform-background path
      // now enters the precision branch regardless of portrait/landscape ratio.
      const routePattern = /const\s+portraitFirst\s*=\s*[\s\S]*?;/
      if (!routePattern.test(transformed)) {
        throw new Error('[background-quality] AI routing pattern was not found')
      }
      transformed = transformed.replace(
        routePattern,
        `const portraitFirst = true; // all non-uniform images use precision removal`
      )

      const precisionBranchPattern = /if\s*\(portraitFirst\)\s*\{[\s\S]*?\n\s*\}\s*else\s*\{/
      if (!precisionBranchPattern.test(transformed)) {
        throw new Error('[background-quality] Precision branch pattern was not found')
      }

      const precisionTarget = `if (portraitFirst) {
          // All non-uniform images use BiRefNet Lite first. This covers people,
          // pets, products, food, vehicles, indoor/outdoor photos and sticker
          // sheets without guessing from image orientation or background type.
          // Sticker-sheet classification happens after matte generation using
          // the existing connected-component layout analysis.
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
            console.warn('BiRefNet primary removal failed:', error);
          }

          // MODNet is a portrait-specialized fallback when the general precision
          // matte is explicitly rejected by the quality gate.
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

          // ORMBG remains the broad-purpose last resort only when both earlier
          // outputs are unavailable or still fail the quality gate.
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

          if (!blob) throw precisionError || new Error('Background removal failed');
        } else {`

      transformed = transformed.replace(precisionBranchPattern, precisionTarget)
      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), backgroundQualityRouting()],
})
