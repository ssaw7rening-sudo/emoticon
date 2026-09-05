import { defineConfig } from 'vite'
import baseConfig from './vite.dark-pixel-copy-v15.config.js'

function directFirstV16() {
  return {
    name: 'direct-first-split-v16',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      let transformed = code.replace(/\r\n/g, '\n')

      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      const gatedRuntime = `const sourceDarkInfo = await inspectOriginalDarkSource(file);\n      const directDarkItems = sourceDarkInfo.isDark ? await splitOriginalDarkSheetDirectly(file) : null;\n      if (sourceDarkInfo.isDark && !directDarkItems) {\n        throw new Error('검정 원본 Direct 분리 실패 · fallback 차단 · dark=' + sourceDarkInfo.ratio.toFixed(3));\n      }\n      const items = directDarkItems || await splitIntoFifteen(resultBlob, file);`

      const directFirstRuntime = `const sourceDarkInfo = await inspectOriginalDarkSource(file);\n      // v16: always attempt the original-pixel splitter first. The splitter\n      // already performs its own safety checks, so a separate classifier must\n      // not silently force a valid dark sheet through the AI result path.\n      const directDarkItemsRaw = await splitOriginalDarkSheetDirectly(file);\n      const fallbackItemsRaw = directDarkItemsRaw ? null : await splitIntoFifteen(resultBlob, file);\n      const splitEngine = directDarkItemsRaw ? 'D16' : 'AI';\n      const items = (directDarkItemsRaw || fallbackItemsRaw || []).map((item) => ({\n        ...item,\n        splitEngine,\n        sourceDarkRatio: sourceDarkInfo.ratio\n      }));`

      if (!transformed.includes(gatedRuntime)) {
        throw new Error('[split-v16] gated runtime anchor not found')
      }
      transformed = transformed.replace(gatedRuntime, directFirstRuntime)

      const oldEngineLabel = "engineLabel={`${resultMethod === 'fast' ? t.methodSafe : t.methodAi} · Alpha v7`}"
      const newEngineLabel = "engineLabel={`${resultMethod === 'fast-dark' ? t.methodSafeDark : resultMethod === 'fast' ? t.methodSafe : t.methodAi} · ${splitItems[0]?.splitEngine || '…'}${typeof splitItems[0]?.sourceDarkRatio === 'number' ? ` ${splitItems[0].sourceDarkRatio.toFixed(2)}` : ''} · Split v16 · Direct First`}"
      if (transformed.includes(oldEngineLabel)) {
        transformed = transformed.replace(oldEngineLabel, newEngineLabel)
      }

      transformed = transformed.replace(/Split v15 · Pixel Copy/g, 'Split v16 · Direct First')
      return { code: transformed, map: null }
    }
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), directFirstV16()]
})
