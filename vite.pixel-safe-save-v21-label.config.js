import { defineConfig } from 'vite'
import baseConfig from './vite.pixel-safe-save-v21.config.js'

function directRgbaVersionLabelV21() {
  return {
    name: 'direct-rgba-version-label-v21',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null
      const transformed = code.replaceAll('Split v20 · Pixel Safe Save', 'Split v21 · Direct RGBA Save')
      return transformed === code ? null : { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), directRgbaVersionLabelV21()],
})
