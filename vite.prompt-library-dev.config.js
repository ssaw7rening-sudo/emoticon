import { defineConfig } from 'vite'
import baseConfig from './vite.tailwind-motion-cleanup.config.js'
import { promptLibraryExpansion } from './vite.prompt-library-plugin.js'

export default defineConfig({
  ...baseConfig,
  plugins: [promptLibraryExpansion(), ...(baseConfig.plugins || [])],
})
