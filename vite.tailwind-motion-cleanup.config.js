import { defineConfig } from 'vite'
import baseConfig from './vite.ui-runtime-cleanup.config.js'

function tailwindMotionCleanup() {
  return {
    name: 'tailwind-motion-cleanup-v6-dead-transform-cleanup',
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

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [
    ...(baseConfig.plugins || []),
    tailwindMotionCleanup(),
  ],
})
