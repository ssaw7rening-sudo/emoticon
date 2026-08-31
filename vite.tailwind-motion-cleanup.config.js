import { defineConfig } from 'vite'
import baseConfig from './vite.ui-runtime-cleanup.config.js'

function tailwindMotionCleanup() {
  return {
    name: 'tailwind-motion-cleanup-v1',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/App.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      // Avoid transition-all so layout-related properties are not accidentally
      // animated. Preserve the visual interactions the UI actually uses.
      transformed = transformed.replace(
        /\btransition-all\b/g,
        'transition-[color,background-color,border-color,box-shadow,opacity,transform,filter]'
      )

      // text inputs do not benefit from overflow scrolling; the browser already
      // handles caret/selection scrolling internally for a single-line input.
      transformed = transformed.replace(
        'focus:border-mint-strong transition-[color,background-color,border-color,box-shadow,opacity,transform,filter] overflow-x-auto whitespace-nowrap',
        'focus:border-mint-strong transition-[color,background-color,border-color,box-shadow,opacity,transform,filter] whitespace-nowrap'
      )

      // Remove no-op responsive duplicates. This changes no rendered size.
      transformed = transformed.replace(/text-\[13px\] sm:text-\[13px\]/g, 'text-[13px]')

      return { code: transformed, map: null }
    },
  }
}

function backgroundProgressRenderThrottle() {
  return {
    name: 'background-progress-render-throttle-v1',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')
      const stateAnchor = "  const [progress, setProgress] = useState(null);"
      if (!transformed.includes(stateAnchor)) {
        throw new Error('[progress-throttle] progress state anchor was not found')
      }

      const progressHelper = `${stateAnchor}\n  const progressRenderRef = useRef({ value: null, time: 0 });\n  const updateRemovalProgress = (rawProgress) => {\n    const numericProgress = Number(rawProgress);\n    if (!Number.isFinite(numericProgress)) return;\n\n    const nextValue = Math.max(0, Math.min(100, Math.round(numericProgress)));\n    const now = typeof performance !== 'undefined' && typeof performance.now === 'function'\n      ? performance.now()\n      : Date.now();\n    const previous = progressRenderRef.current;\n    const isBoundary = nextValue === 0 || nextValue === 100;\n\n    if (!isBoundary && previous.value !== null && now - previous.time < 80) return;\n\n    progressRenderRef.current = { value: nextValue, time: now };\n    setProgress((current) => current === nextValue ? current : nextValue);\n  };`
      transformed = transformed.replace(stateAnchor, progressHelper)

      const directProgressUpdate = 'setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));'
      const matches = transformed.split(directProgressUpdate).length - 1
      if (matches < 1) {
        throw new Error('[progress-throttle] model progress callbacks were not found')
      }

      transformed = transformed.split(directProgressUpdate).join('updateRemovalProgress(info.progress);')

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [
    ...(baseConfig.plugins || []),
    tailwindMotionCleanup(),
    backgroundProgressRenderThrottle(),
  ],
})
