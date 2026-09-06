import { defineConfig } from 'vite'
import baseConfig from './vite.prompt-library-dev.config.js'
import { phraseThemeExpansionV2 } from './vite.phrase-theme-plugin-v2.js'
import { phraseThemeExpansionV3 } from './vite.phrase-theme-plugin-v3.js'
import { photoReferencePromptStructure } from './vite.photo-reference-prompt-plugin.js'
import { goldenComboRebuildV2 } from './vite.golden-combo-plugin-v2.js'
import { adsensePlacementPlugin } from './vite.adsense-placement-plugin.js'
import { mainAdCleanupPlugin } from './vite.main-ad-cleanup-plugin.js'
import { bulkSaveLayoutPlugin } from './vite.bulk-save-layout-plugin.js'
import { defaultArtStyleFallbackPlugin } from './vite.default-art-style-fallback.js'
import { modelPromptPriorityV4Plugin } from './vite.model-prompt-priority-v4.js'
import { geminiIdentityStyleLockPlugin } from './vite.gemini-identity-style-lock.js'
import { geminiLayoutInstanceLockPlugin } from './vite.gemini-layout-instance-lock.js'
import { geminiStyleSceneLockPlugin } from './vite.gemini-style-scene-lock.js'
import { geminiFinalExecutionLockPlugin } from './vite.gemini-final-execution-lock.js'
import { safeWhiteSheetRoutingPlugin } from './vite.safe-white-sheet-routing-plugin.js'
import { transparentSheetAspectPlugin } from './vite.transparent-sheet-aspect-plugin.js'

export default defineConfig({
  ...baseConfig,
  plugins: [transparentSheetAspectPlugin(), safeWhiteSheetRoutingPlugin(), defaultArtStyleFallbackPlugin(), modelPromptPriorityV4Plugin(), geminiIdentityStyleLockPlugin(), geminiLayoutInstanceLockPlugin(), geminiStyleSceneLockPlugin(), geminiFinalExecutionLockPlugin(), bulkSaveLayoutPlugin(), mainAdCleanupPlugin(), adsensePlacementPlugin(), photoReferencePromptStructure(), phraseThemeExpansionV2(), phraseThemeExpansionV3(), goldenComboRebuildV2(), ...(baseConfig.plugins || [])],
})
