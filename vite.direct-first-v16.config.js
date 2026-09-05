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

      const strictRuntime = `const sourceDarkInfo = await inspectOriginalDarkSource(file);\n      // Strict source rule: a dark original sheet must NEVER fall back to the\n      // AI/resultBlob splitter. The original upload is authoritative because\n      // semantic masks can make pale faces and white fills translucent.\n      let directDarkItemsRaw = null;\n      let fallbackItemsRaw = null;\n      let splitEngine = 'STD18';\n      if (sourceDarkInfo.isDark) {\n        directDarkItemsRaw = await splitOriginalDarkSheetDirectly(file);\n        splitEngine = 'D18';\n        if (!directDarkItemsRaw || directDarkItemsRaw.length !== 15) {\n          throw new Error('D18 원본 직접 분리 실패 · AI fallback 차단 · dark=' + sourceDarkInfo.ratio.toFixed(3));\n        }\n      } else {\n        fallbackItemsRaw = await splitIntoFifteen(resultBlob, file);\n      }\n      const items = (directDarkItemsRaw || fallbackItemsRaw || []).map((item) => ({\n        ...item,\n        splitEngine,\n        sourceDarkRatio: sourceDarkInfo.ratio\n      }));`

      if (!transformed.includes(gatedRuntime)) {
        throw new Error('[split-v16] gated runtime anchor not found')
      }
      transformed = transformed.replace(gatedRuntime, strictRuntime)

      const oldEngineLabel = "engineLabel={`${resultMethod === 'fast' ? t.methodSafe : t.methodAi} · Alpha v7`}"
      const newEngineLabel = "engineLabel={`${resultMethod === 'fast-dark' ? t.methodSafeDark : resultMethod === 'fast' ? t.methodSafe : t.methodAi} · ${splitItems[0]?.splitEngine || '…'}${typeof splitItems[0]?.sourceDarkRatio === 'number' ? ` ${splitItems[0].sourceDarkRatio.toFixed(2)}` : ''} · Split v18 · Strict Source`}"
      if (transformed.includes(oldEngineLabel)) {
        transformed = transformed.replace(oldEngineLabel, newEngineLabel)
      }

      transformed = transformed.replace(/Split v15 · Pixel Copy/g, 'Split v18 · Strict Source')
      return { code: transformed, map: null }
    }
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), directFirstV16()]
})
