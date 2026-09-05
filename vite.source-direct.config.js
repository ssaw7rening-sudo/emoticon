import { defineConfig } from 'vite'
import baseConfig from './vite.ui-runtime-cleanup.config.js'

// Production image pipeline now lives in the source components themselves.
export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || [])],
})
