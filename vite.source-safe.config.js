import { defineConfig } from 'vite'
import baseConfig from './vite.source-safe-v23.config.js'

function stableSourceSafeLabel() {
  return {
    name: 'stable-source-safe-label',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null
      const transformed = code
        .replace(/Split v23 · Source Safe/g, '원본 보존 분리 · 직접 RGBA 저장')
        .replace(/Split v\d+(?: · [^`'\"}]+)?/g, '원본 보존 분리 · 직접 RGBA 저장')
      return transformed === code ? null : { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), stableSourceSafeLabel()],
})
