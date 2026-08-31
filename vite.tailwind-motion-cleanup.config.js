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

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), tailwindMotionCleanup()],
})
