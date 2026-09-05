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

function strictDarkSourceSplit() {
  return {
    name: 'strict-dark-source-split-lock',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null
      if (!code.includes('async function splitIntoFifteenSourceSafe')) {
        throw new Error('[strict-dark-source] source-safe splitter is missing before strict lock')
      }

      let transformed = code

      const decodeFallback = "    console.warn('Direct source decode failed; using processed split:', error);\n    return splitIntoFifteen(input);"
      if (transformed.includes(decodeFallback)) {
        transformed = transformed.replace(
          decodeFallback,
          "    console.error('Direct source decode failed:', error);\n    throw new Error('SOURCE_DIRECT_STRICT_DARK: original source decode failed');"
        )
      }

      const emptyFallback = '  if (!width || !height) return splitIntoFifteen(input);'
      if (transformed.includes(emptyFallback)) {
        transformed = transformed.replace(
          emptyFallback,
          "  if (!width || !height) throw new Error('SOURCE_DIRECT_STRICT_DARK: original source has no pixels');"
        )
      }

      const ratioFallback = '  if (removedRatio < 0.08 || removedRatio > 0.94) return splitIntoFifteen(input);'
      if (transformed.includes(ratioFallback)) {
        transformed = transformed.replace(
          ratioFallback,
          "  if (removedRatio < 0.08 || removedRatio > 0.94) throw new Error('SOURCE_DIRECT_STRICT_DARK: unsafe background flood ratio');"
        )
      }

      // Once the border has been positively classified as a dark sheet, never
      // fall back to the already-processed resultBlob. That blob may have lost
      // white/ivory foreground pixels. Only the original upload is allowed.
      const darkFallback = '  if (!border.length || dark.length / border.length < 0.58) return splitIntoFifteen(input);'
      if (!transformed.includes(darkFallback)) {
        throw new Error('[strict-dark-source] dark-border decision anchor is missing')
      }
      transformed = transformed.replace(
        darkFallback,
        "  const darkBorderRatio = border.length ? dark.length / border.length : 0;\n  if (!border.length || darkBorderRatio < 0.58) return splitIntoFifteen(input);\n  const SOURCE_DIRECT_STRICT_DARK = 'SOURCE_DIRECT_STRICT_DARK';\n  void SOURCE_DIRECT_STRICT_DARK;"
      )

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...plugins, strictDarkSourceSplit()],
})
