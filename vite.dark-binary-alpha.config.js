import { defineConfig } from 'vite'
import baseConfig from './vite.tailwind-motion-cleanup.config.js'

function strictDarkBackgroundBinaryAlpha() {
  return {
    name: 'strict-dark-background-binary-alpha-v9',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      const darkStart = transformed.indexOf('async function trySafeDarkBorderRemoval(file) {')
      const removeStart = transformed.indexOf('const removeBackground = async', darkStart)
      if (darkStart < 0 || removeStart < 0) {
        throw new Error('[dark-binary-alpha] Dark prepass/removeBackground boundaries were not found')
      }

      let darkSegment = transformed.slice(darkStart, removeStart)
      const replaceDarkOnce = (from, to, label) => {
        if (!darkSegment.includes(from)) {
          throw new Error(`[dark-binary-alpha] ${label} anchor was not found`)
        }
        darkSegment = darkSegment.replace(from, to)
      }

      // Accept black and near-black generated mattes even when antialiasing,
      // glow or compression makes the outer edge slightly non-uniform.
      replaceDarkOnce(
        'return luminance <= 78 && Math.max(r, g, b) <= 104;',
        'return luminance <= 112 && Math.max(r, g, b) <= 148;',
        'dark border threshold'
      )
      replaceDarkOnce(
        'if (darkBorderColours.length / borderColours.length < 0.72) return null;',
        'if (darkBorderColours.length / borderColours.length < 0.55) return null;',
        'dark border ratio'
      )
      replaceDarkOnce(
        'if (p95 > 30) return null;',
        'if (p95 > 52) return null;',
        'dark border deviation'
      )
      replaceDarkOnce(
        'const tolerance = Math.max(18, Math.min(42, 18 + p95 * 1.6));',
        'const tolerance = Math.max(22, Math.min(68, 24 + p95 * 1.45));',
        'dark flood tolerance'
      )
      replaceDarkOnce(
        'return luminance <= 112 && colorDistance([r, g, b], background) <= tolerance;',
        'return luminance <= 150 && colorDistance([r, g, b], background) <= tolerance;',
        'dark matte pixel threshold'
      )
      replaceDarkOnce(
        'if (tail < total * 0.06 || tail > total * 0.92) return null;',
        'if (tail < total * 0.04 || tail > total * 0.97) return null;',
        'dark component coverage'
      )

      transformed = transformed.slice(0, darkStart) + darkSegment + transformed.slice(removeStart)

      const helper = `async function forceBinaryDarkForegroundAlpha(blob) {
  const { canvas, ctx } = await drawFileToCanvas(blob);
  const { width, height } = canvas;
  if (!width || !height) return blob;
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  for (let p = 3; p < pixels.length; p += 4) {
    pixels[p] = pixels[p] === 0 ? 0 : 255;
  }
  ctx.putImageData(imageData, 0, 0);
  return await canvasToPngBlob(canvas);
}

`

      const removeStartAfterDarkPatch = transformed.indexOf('const removeBackground = async', darkStart)
      transformed = transformed.slice(0, removeStartAfterDarkPatch) + helper + transformed.slice(removeStartAfterDarkPatch)

      const updatedRemoveStart = transformed.indexOf('const removeBackground = async', removeStartAfterDarkPatch + helper.length)
      const retryStart = transformed.indexOf('const runPrecisionRetry = async', updatedRemoveStart)
      if (updatedRemoveStart < 0 || retryStart < 0) {
        throw new Error('[dark-binary-alpha] Updated handler boundaries were not found')
      }

      let removeHandler = transformed.slice(updatedRemoveStart, retryStart)

      const darkClassification = 'const fastBackgroundIsDark = isDarkBackgroundColor(fastResult?.background);'
      if (!removeHandler.includes(darkClassification)) {
        throw new Error('[dark-binary-alpha] Fast dark classification anchor was not found')
      }
      removeHandler = removeHandler.replace(
        darkClassification,
        'const fastBackgroundIsDark = fastResult?.deterministicDark === true || isDarkBackgroundColor(fastResult?.background);'
      )

      const finalMarker = "const fastDarkMatteIsFinal = (method === 'fast-dark' || method === 'fast') && fastBackgroundIsDark;"
      if (!removeHandler.includes(finalMarker)) {
        throw new Error('[dark-binary-alpha] Final dark-matte marker was not found')
      }
      removeHandler = removeHandler.replace(
        finalMarker,
        `${finalMarker}\n      if (fastDarkMatteIsFinal) {\n        // Strict mode: dark-background sticker output is binary alpha only.\n        // Background stays fully transparent (0); every retained foreground\n        // pixel becomes fully opaque (255). No semi-transparent subject pixels.\n        blob = await forceBinaryDarkForegroundAlpha(blob);\n      }`
      )

      transformed = transformed.slice(0, updatedRemoveStart) + removeHandler + transformed.slice(retryStart)

      if (!transformed.includes('data-alpha-engine="v8"')) {
        throw new Error('[dark-binary-alpha] Alpha engine badge anchor was not found')
      }
      transformed = transformed.replace('data-alpha-engine="v8"', 'data-alpha-engine="v9"')
      transformed = transformed.replace(' · Alpha v8', ' · Alpha v9 · α 0/255')

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), strictDarkBackgroundBinaryAlpha()],
})
