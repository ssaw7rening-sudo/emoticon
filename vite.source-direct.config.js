import { defineConfig } from 'vite'
import baseConfig from './vite.ui-runtime-cleanup.config.js'

// The production image split/export pipeline now lives directly in
// BackgroundRemover.jsx and EmoticonPostProcessor.jsx. Legacy split plugins
// used to replace the whole detect/split source block at build time, which
// removed splitIntoFifteenSourceSafe() and silently restored the old damaged
// alpha path. Keep unrelated UI/background-removal plugins, but never allow
// build-time sticker split transforms to overwrite the source implementation.
const blockedImagePipelinePlugins = new Set([
  'precise-sticker-sheet-split-v9-safe-component-fallback',
  'pixel-ownership-sticker-split-v8-watershed-compatible',
  'final-transparency-integrity-guard-v2',
]);

const plugins = (baseConfig.plugins || []).filter((plugin) => {
  const name = String(plugin?.name || '');
  if (blockedImagePipelinePlugins.has(name)) return false;
  if (name.startsWith('precise-sticker-sheet-split-')) return false;
  if (name.startsWith('pixel-ownership-sticker-split-')) return false;
  if (name.startsWith('final-transparency-integrity-guard-')) return false;
  return true;
});

export default defineConfig({
  ...baseConfig,
  plugins,
})
