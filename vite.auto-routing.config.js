import { defineConfig } from 'vite'
import baseConfig from './vite.config.js'

const disabledPlugins = new Set([
  // Legacy exact-string App transform. Background-mode policy should live in
  // App source, not in a brittle build-time rewrite.
  'align-model-background-options',
  // General-photo cutouts now intentionally keep edge-colour correction on.
  // Do not disable RGB correction for the precision path.
  'preserve-precision-background-removal-rgb',
])

export default defineConfig({
  ...baseConfig,
  plugins: (baseConfig.plugins || []).filter((plugin) => !disabledPlugins.has(plugin?.name)),
})
