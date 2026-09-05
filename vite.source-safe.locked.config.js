import { defineConfig } from 'vite'
import sourceSafeConfig from './vite.source-safe.config.js'

// Keep the current source-safe split/export pipeline, but remove the older
// transparency guard that rewrites BackgroundRemover a second time.
const filteredPlugins = (sourceSafeConfig.plugins || []).filter((plugin) => (
  plugin?.name !== 'final-transparency-integrity-guard-v2'
))

export default defineConfig({
  ...sourceSafeConfig,
  plugins: filteredPlugins,
})
