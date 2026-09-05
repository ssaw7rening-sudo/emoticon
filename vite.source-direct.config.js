import { defineConfig } from 'vite'
import baseConfig from './vite.ui-runtime-cleanup.config.js'

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || [])],
})
