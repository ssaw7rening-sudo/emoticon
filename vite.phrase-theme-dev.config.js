import { defineConfig } from 'vite'
import baseConfig from './vite.prompt-library-dev.config.js'
import { phraseThemeExpansionV2 } from './vite.phrase-theme-plugin-v2.js'

export default defineConfig({
  ...baseConfig,
  plugins: [phraseThemeExpansionV2(), ...(baseConfig.plugins || [])],
})
