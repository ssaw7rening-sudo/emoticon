import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function preservePrecisionBackgroundRemovalRgb() {
  const replacements = [
    [
      'async function cleanAiForegroundArtifacts(blob) {',
      'async function cleanAiForegroundArtifacts(blob, preserveRgb = false) {'
    ],
    [
      '      if (!count) continue;\n      const mix = Math.min(0.42, ((218 - alpha) / 186) * 0.42);',
      '      if (!count) continue;\n      if (preserveRgb) continue;\n      const mix = Math.min(0.42, ((218 - alpha) / 186) * 0.42);'
    ],
    [
      'async function refinePrecisionEdges(blob) {',
      'async function refinePrecisionEdges(blob, preserveRgb = false) {'
    ],
    [
      '      if (nextAlpha > 0 && confidentCount > 0) {',
      '      if (!preserveRgb && nextAlpha > 0 && confidentCount > 0) {'
    ],
    [
      '      precisionBlob = await cleanAiForegroundArtifacts(precisionBlob);',
      '      precisionBlob = await cleanAiForegroundArtifacts(precisionBlob, true);'
    ],
    [
      '      precisionBlob = await refinePrecisionEdges(precisionBlob);',
      '      precisionBlob = await refinePrecisionEdges(precisionBlob, true);'
    ]
  ]

  return {
    name: 'preserve-precision-background-removal-rgb',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code
      for (const [from, to] of replacements) {
        if (!transformed.includes(from)) {
          throw new Error(`[precision-rgb] Expected BackgroundRemover source pattern was not found: ${from}`)
        }
        transformed = transformed.replace(from, to)
      }

      return { code: transformed, map: null }
    }
  }
}

// Keep precision background-removal post-processing alpha-only so the original
// image RGB values are not blended or dulled at foreground edges.
export default defineConfig({
  plugins: [preservePrecisionBackgroundRemovalRgb(), react()],
})
