import { defineConfig } from 'vite'
import baseConfig from './vite.tone-lock.config.js'

function strengthenDominantSubjectCleanup() {
  return {
    name: 'dominant-subject-cleanup-v2',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code
      const countGate = /if \(significant\.length >= 2 && significant\.length <= 7\) \{/
      const dominanceGate = /const dominance = main\.area \/ Math\.max\(1, visibleArea\);\s*\n\s*if \(dominance >= 0\.72\) \{/

      if (!countGate.test(transformed)) {
        throw new Error('[subject-cleanup] Significant-component count gate was not found')
      }
      if (!dominanceGate.test(transformed)) {
        throw new Error('[subject-cleanup] Dominant-subject gate was not found')
      }

      // Do not skip cleanup just because hair/antialiasing created many tiny
      // components. Sticker sheets and group photos are protected by the
      // dominance + portrait-like main-subject gate below instead.
      transformed = transformed.replace(
        countGate,
        'if (significant.length >= 2) {'
      )

      transformed = transformed.replace(
        dominanceGate,
        `const dominance = main.area / Math.max(1, visibleArea);
        const mainAreaRatio = main.area / Math.max(1, cleanupTotal);
        const portraitLikeMain =
          mainAreaRatio >= 0.16 &&
          main.height >= cleanupHeight * 0.50 &&
          main.width >= cleanupWidth * 0.24 &&
          main.centerX >= cleanupWidth * 0.20 &&
          main.centerX <= cleanupWidth * 0.80 &&
          main.centerY >= cleanupHeight * 0.38;

        if (dominance >= 0.68 && portraitLikeMain) {`
      )

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), strengthenDominantSubjectCleanup()],
})
