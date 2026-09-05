import { defineConfig } from 'vite'
import baseConfig from './vite.ui-runtime-cleanup.config.js'

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

function safeTransparentSourceRoute() {
  return {
    name: 'transparent-source-safe-route',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null
      if (!code.includes('sourceAlreadyTransparent')) return null
      if (!code.includes('splitIntoFifteenSourceSafe')) {
        throw new Error('[transparent-source-safe] source-safe splitter is missing')
      }

      let transformed = code
      let sourceProtected = false
      let splitProtected = false

      transformed = transformed.replace(
        /const\s+transparentResult\s*=\s*await\s+removeEnclosedBackdropPockets\(\s*nextFile\s*,\s*nextFile\s*,\s*true\s*\);/,
        () => {
          sourceProtected = true
          return "const transparentResult = nextFile;"
        }
      )

      transformed = transformed.replace(
        /setResultMethod\(\s*['\"]transparent['\"]\s*\);/,
        "setResultMethod('transparent-source-safe');"
      )

      transformed = transformed.replace(
        /const\s+items\s*=\s*await\s+splitIntoFifteen\(\s*transparentResult\s*\);/,
        () => {
          splitProtected = true
          return "const items = await splitIntoFifteenSourceSafe(transparentResult, nextFile);"
        }
      )

      if (!sourceProtected || !splitProtected) {
        throw new Error('[transparent-source-safe] legacy transparent split route could not be replaced')
      }

      return { code: transformed, map: null }
    },
  }
}

function strictDarkSourceSplit() {
  return {
    name: 'strict-dark-source-split-lock',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null
      if (!code.includes('splitIntoFifteenSourceSafe')) {
        throw new Error('[strict-dark-source] source-safe splitter is missing before strict lock')
      }

      let transformed = code
      let strictApplied = false

      transformed = transformed.replace(
        /console\.warn\(\s*['\"]Direct source decode failed; using processed split:['\"]\s*,\s*error\s*\);\s*return\s+splitIntoFifteen\(input\);/,
        "console.error('Direct source decode failed:', error); throw new Error('SOURCE_DIRECT_STRICT_DARK: original source decode failed');"
      )

      transformed = transformed.replace(
        /if\s*\(\s*!width\s*\|\|\s*!height\s*\)\s*return\s+splitIntoFifteen\(input\);/,
        "if (!width || !height) throw new Error('SOURCE_DIRECT_STRICT_DARK: original source has no pixels');"
      )

      transformed = transformed.replace(
        /if\s*\(\s*removedRatio\s*<\s*0?\.08\s*\|\|\s*removedRatio\s*>\s*0?\.94\s*\)\s*return\s+splitIntoFifteen\(input\);/,
        "if (removedRatio < 0.08 || removedRatio > 0.94) throw new Error('SOURCE_DIRECT_STRICT_DARK: unsafe background flood ratio');"
      )

      transformed = transformed.replace(
        /if\s*\(\s*!border\.length\s*\|\|\s*dark\.length\s*\/\s*border\.length\s*<\s*0?\.58\s*\)\s*return\s+splitIntoFifteen\(input\);/,
        () => {
          strictApplied = true
          return "const darkBorderRatio = border.length ? dark.length / border.length : 0; if (!border.length || darkBorderRatio < 0.58) return splitIntoFifteen(input); const SOURCE_DIRECT_STRICT_DARK = 'SOURCE_DIRECT_STRICT_DARK'; void SOURCE_DIRECT_STRICT_DARK;"
        }
      )

      if (!strictApplied) {
        throw new Error('[strict-dark-source] dark-border decision could not be locked')
      }

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...plugins, safeTransparentSourceRoute(), strictDarkSourceSplit()],
})
