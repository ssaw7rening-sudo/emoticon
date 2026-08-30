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

      const fastSource = '      let blob = await tryFastUniformBackgroundRemoval(file);'
      const fastTarget = `      // Portrait photos must not use the edge-color shortcut. A complex indoor\n      // photo can have a wall color that looks uniform at the border while ceiling,\n      // furniture and pillars remain as false foreground. Route vertical photos\n      // directly to the precision matte instead.\n      const { canvas: fastPreflightCanvas } = await drawFileToCanvas(file);\n      const skipFastForPortrait =\n        fastPreflightCanvas.width > 0 &&\n        fastPreflightCanvas.height >= fastPreflightCanvas.width * 1.08;\n      let blob = skipFastForPortrait ? null : await tryFastUniformBackgroundRemoval(file);`

      if (!transformed.includes(fastSource)) {
        throw new Error('[portrait-precision] Fast-removal source pattern was not found')
      }
      transformed = transformed.replace(fastSource, fastTarget)

      const portraitSource = `        if (portraitFirst) {\n          // Vertical photos are most often people/selfies in this tool. Start with\n          // the portrait-matting model so ceilings, pillars and wall structures are\n          // less likely to be retained as foreground. Only fall back to ORMBG when\n          // MODNet is clearly unreliable.\n          method = 'modnet';\n          setStage('preparing');\n          setProgress(null);\n          blob = await removeWithModnet(file, (info) => {\n            if (typeof info?.progress === 'number') {\n              setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));\n            }\n          });\n          quality = await assessRemovalQuality(blob);\n\n          const modnetClearlyFailed =\n            quality.status === 'fail' ||\n            (quality.status === 'warning' && (quality.score ?? 0) >= 4);\n\n          if (modnetClearlyFailed) {\n            try {\n              setStage('preparing');\n              setProgress(null);\n              const generalBlob = await removeWithAi(file, (info) => {\n                if (typeof info?.progress === 'number') {\n                  setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));\n                }\n              });\n              const generalQuality = await assessRemovalQuality(generalBlob);\n              if (qualityRank(generalQuality) < qualityRank(quality)) {\n                blob = generalBlob;\n                quality = generalQuality;\n                method = 'ai';\n              }\n            } catch (generalError) {\n              console.warn('ORMBG fallback after MODNet failed:', generalError);\n            }\n          }\n        } else {`

      const portraitTarget = `        if (portraitFirst) {\n          // Complex vertical photos bypass the fast edge-color remover and use\n          // BiRefNet Lite first. Unlike the generic alpha correction path, the\n          // precision matte is kept as-is so weak background alpha is not boosted\n          // back into visible ceiling/pillar fragments.\n          let precisionError = null;\n          try {\n            method = 'birefnet';\n            setStage('preparing');\n            setProgress(null);\n            blob = await removeWithBiRefNet(file, (info) => {\n              if (typeof info?.progress === 'number') {\n                setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));\n              }\n            });\n            blob = await refineHairBackgroundChannels(blob);\n            blob = await cleanAiForegroundArtifacts(blob);\n            blob = await refinePrecisionEdges(blob);\n            quality = await assessRemovalQuality(blob);\n          } catch (error) {\n            precisionError = error;\n            blob = null;\n            quality = { status: 'fail', score: 99 };\n            console.warn('BiRefNet portrait-first removal failed:', error);\n          }\n\n          // MODNet is the first fallback only when the precision model failed or\n          // produced a result that the quality gate explicitly rejects.\n          if (!blob || quality.status === 'fail') {\n            try {\n              setStage('preparing');\n              setProgress(null);\n              const portraitBlob = await removeWithModnet(file, (info) => {\n                if (typeof info?.progress === 'number') {\n                  setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));\n                }\n              });\n              const portraitQuality = await assessRemovalQuality(portraitBlob);\n              if (!blob || qualityRank(portraitQuality) < qualityRank(quality)) {\n                blob = portraitBlob;\n                quality = portraitQuality;\n                method = 'modnet';\n              }\n            } catch (portraitError) {\n              console.warn('MODNet fallback after BiRefNet failed:', portraitError);\n            }\n          }\n\n          // The broad-purpose model is only a last resort for a vertical portrait.\n          if (!blob || quality.status === 'fail') {\n            try {\n              setStage('preparing');\n              setProgress(null);\n              const generalBlob = await removeWithAi(file, (info) => {\n                if (typeof info?.progress === 'number') {\n                  setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));\n                }\n              });\n              const generalQuality = await assessRemovalQuality(generalBlob);\n              if (!blob || qualityRank(generalQuality) < qualityRank(quality)) {\n                blob = generalBlob;\n                quality = generalQuality;\n                method = 'ai';\n              }\n            } catch (generalError) {\n              console.warn('ORMBG last-resort fallback failed:', generalError, precisionError);\n            }\n          }\n\n          if (!blob) throw precisionError || new Error('Portrait background removal failed');\n        } else {`

      if (!transformed.includes(portraitSource)) {
        throw new Error('[portrait-precision] Portrait-first source pattern was not found')
      }
      transformed = transformed.replace(portraitSource, portraitTarget)

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), portraitPrecisionBackgroundFix()],
})
