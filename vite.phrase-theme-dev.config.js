import { defineConfig } from 'vite'
import baseConfig from './vite.prompt-library-dev.config.js'
import { phraseThemeExpansionV2 } from './vite.phrase-theme-plugin-v2.js'
import { photoReferencePromptStructure } from './vite.photo-reference-prompt-plugin.js'

export default defineConfig({
  ...baseConfig,
  plugins: [photoReferencePromptStructure(), phraseThemeExpansionV2(), ...(baseConfig.plugins || [])],
})
