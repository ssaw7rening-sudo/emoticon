import { defineConfig } from 'vite'
import baseConfig from './vite.prompt-library-dev.config.js'
import { phraseThemeExpansion } from './vite.phrase-theme-plugin.js'

export default defineConfig({
  ...baseConfig,
  plugins: [phraseThemeExpansion(), ...(baseConfig.plugins || [])],
})
