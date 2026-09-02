import { defineConfig } from 'vite'
import baseConfig from './vite.background-hole-aware.config.js'

function alwaysAvailableStickerSplitMenu() {
  return {
    name: 'always-available-sticker-split-menu-v3-watershed-compatible',
    enforce: 'pre',
    transform() {
      // The source component now owns adaptive visibility and manual grid
      // splitting directly. Keep this legacy plugin inert for config compatibility.
      return null
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), alwaysAvailableStickerSplitMenu()],
})
