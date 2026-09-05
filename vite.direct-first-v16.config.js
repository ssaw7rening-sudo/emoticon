import { defineConfig } from 'vite'
import baseConfig from './vite.dark-pixel-copy-v15.config.js'

function directFirstV16() {
  return {
    name: 'direct-first-split-v16',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      let transformed = code.replace(/\r\n/g, '\n')

      if (normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) {
        const gatedRuntime = `const sourceDarkInfo = await inspectOriginalDarkSource(file);\n      const directDarkItems = sourceDarkInfo.isDark ? await splitOriginalDarkSheetDirectly(file) : null;\n      if (sourceDarkInfo.isDark && !directDarkItems) {\n        throw new Error('검정 원본 Direct 분리 실패 · fallback 차단 · dark=' + sourceDarkInfo.ratio.toFixed(3));\n      }\n      const items = directDarkItems || await splitIntoFifteen(resultBlob, file);`

        const directFirstRuntime = `const sourceDarkInfo = await inspectOriginalDarkSource(file);\n      // v16: the dedicated original-pixel path is authoritative whenever it can\n      // successfully understand the source. Do not gate it behind a separate\n      // border classifier; the direct splitter already has its own safety checks.\n      const directDarkItemsRaw = await splitOriginalDarkSheetDirectly(file);\n      const fallbackItemsRaw = directDarkItemsRaw ? null : await splitIntoFifteen(resultBlob, file);\n      const splitEngine = directDarkItemsRaw ? 'D16' : 'AI';\n      const items = (directDarkItemsRaw || fallbackItemsRaw || []).map((item) => ({\n        ...item,\n        splitEngine,\n        sourceDarkRatio: sourceDarkInfo.ratio\n      }));`

        if (!transformed.includes(gatedRuntime)) {
          throw new Error('[split-v16] gated runtime anchor not found')
        }
        transformed = transformed.replace(gatedRuntime, directFirstRuntime)

        const oldEngineLabel = "engineLabel={`${resultMethod === 'fast' ? t.methodSafe : t.methodAi} · Alpha v7`}"
        const newEngineLabel = "engineLabel={`${resultMethod === 'fast-dark' ? t.methodSafeDark : resultMethod === 'fast' ? t.methodSafe : t.methodAi} · Split v16 · Direct First`}"
        if (transformed.includes(oldEngineLabel)) {
          transformed = transformed.replace(oldEngineLabel, newEngineLabel)
        }

        transformed = transformed.replace(/Split v15 · Pixel Copy/g, 'Split v16 · Direct First')
        return { code: transformed, map: null }
      }

      if (normalizedId.endsWith('/src/components/EmoticonPostProcessor.jsx')) {
        const statusSpan = `<span className={\`rounded-md px-1.5 py-1 text-[10px] font-extrabold leading-none \${item.needsReview ? 'bg-[#FFF0CC] text-[#8A5A11]' : 'bg-[#EEF4EA] text-[#5B6E56]'}\`}>{item.needsReview ? \`⚠ \${t.review}\` : (item.finalBlob ? outputSize : t.raw)}</span>\n                {item.finalBlob && outputScale > 1 && <span className="rounded-md bg-[#F1ECE5] px-1 py-1 text-[10px] font-extrabold leading-none text-[#75644E]">↑{outputScale}×</span>}`

        const statusWithEngine = `<span className={\`rounded-md px-1.5 py-1 text-[10px] font-extrabold leading-none \${item.needsReview ? 'bg-[#FFF0CC] text-[#8A5A11]' : 'bg-[#EEF4EA] text-[#5B6E56]'}\`}>{item.needsReview ? \`⚠ \${t.review}\` : (item.finalBlob ? outputSize : t.raw)}</span>\n                {item.splitEngine && <span className={\`rounded-md px-1 py-1 text-[9px] font-black leading-none \${item.splitEngine === 'D16' ? 'bg-[#DFF3E6] text-[#2F6B45]' : 'bg-[#FCE9D8] text-[#9A5A24]'}\`}>{item.splitEngine}{typeof item.sourceDarkRatio === 'number' ? \` \${item.sourceDarkRatio.toFixed(2)}\` : ''}</span>}\n                {item.finalBlob && outputScale > 1 && <span className="rounded-md bg-[#F1ECE5] px-1 py-1 text-[10px] font-extrabold leading-none text-[#75644E]">↑{outputScale}×</span>}`

        if (!transformed.includes(statusSpan)) {
          throw new Error('[split-v16] postprocessor status anchor not found')
        }
        transformed = transformed.replace(statusSpan, statusWithEngine)
        return { code: transformed, map: null }
      }

      return null
    }
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), directFirstV16()]
})
