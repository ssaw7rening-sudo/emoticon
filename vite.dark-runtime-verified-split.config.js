import { defineConfig } from 'vite'
import baseConfig from './vite.dark-direct-split.config.js'

function verifyDarkSplitRuntime() {
  return {
    name: 'verify-dark-split-runtime-v14',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')
      const componentMarker = 'export default function BackgroundRemover'
      const componentIndex = transformed.indexOf(componentMarker)
      if (componentIndex < 0) throw new Error('[split-v14] BackgroundRemover marker not found')

      const helper = `async function inspectOriginalDarkSource(sourceFile) {
  if (!sourceFile) return { isDark: false, ratio: 0 };
  try {
    const { canvas, ctx } = await drawFileToCanvas(sourceFile);
    const { width, height } = canvas;
    if (!width || !height) return { isDark: false, ratio: 0 };
    const pixels = ctx.getImageData(0, 0, width, height).data;
    let total = 0;
    let dark = 0;
    const step = Math.max(1, Math.floor(Math.min(width, height) / 420));
    const sample = (x, y) => {
      const p = (y * width + x) * 4;
      const r = pixels[p], g = pixels[p + 1], b = pixels[p + 2];
      const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722;
      total += 1;
      if (luminance <= 128 && Math.max(r, g, b) <= 165) dark += 1;
    };
    for (let x = 0; x < width; x += step) {
      sample(x, 0);
      sample(x, height - 1);
    }
    for (let y = step; y < height - 1; y += step) {
      sample(0, y);
      sample(width - 1, y);
    }
    const ratio = dark / Math.max(1, total);
    return { isDark: ratio >= 0.42, ratio };
  } catch (error) {
    console.warn('Dark-source inspection failed:', error);
    return { isDark: false, ratio: 0 };
  }
}

`
      transformed = transformed.slice(0, componentIndex) + helper + transformed.slice(componentIndex)

      const v13Runtime = `const directDarkItems = await splitOriginalDarkSheetDirectly(file);\n      const items = directDarkItems || await splitIntoFifteen(resultBlob, file);`
      const replacement = `const sourceDarkInfo = await inspectOriginalDarkSource(file);\n      const directDarkItems = sourceDarkInfo.isDark ? await splitOriginalDarkSheetDirectly(file) : null;\n      if (sourceDarkInfo.isDark && !directDarkItems) {\n        throw new Error('검정 원본 Direct 분리 실패 · fallback 차단 · dark=' + sourceDarkInfo.ratio.toFixed(3));\n      }\n      const items = directDarkItems || await splitIntoFifteen(resultBlob, file);`

      if (!transformed.includes(v13Runtime)) {
        throw new Error('[split-v14] v13 autoSplit runtime anchor not found')
      }
      transformed = transformed.replace(v13Runtime, replacement)
      transformed = transformed.replace(/Split v13 · Direct/g, 'Split v14 · Direct Lock')
      return { code: transformed, map: null }
    }
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), verifyDarkSplitRuntime()]
})
