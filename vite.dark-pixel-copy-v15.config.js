import { defineConfig } from 'vite'
import baseConfig from './vite.dark-runtime-verified-split.config.js'

function pixelExactDarkSplitV15() {
  return {
    name: 'pixel-exact-dark-split-v15',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      let transformed = code.replace(/\r\n/g, '\n')

      if (normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) {
        const oldCrop = `        outCtx.imageSmoothingEnabled = false;\n        outCtx.drawImage(canvas, cropLeft, cropTop, cropW, cropH, safety, safety, cropW, cropH);\n\n        // Final hard guarantee: no semi-transparent foreground is allowed in\n        // this dedicated path. Transparent canvas margin/background stays 0.\n        const outData = outCtx.getImageData(0, 0, output.width, output.height);\n        for (let p = 3; p < outData.data.length; p += 4) {\n          outData.data[p] = outData.data[p] === 0 ? 0 : 255;\n        }\n        outCtx.putImageData(outData, 0, 0);`

        const newCrop = `        // v15: copy exact RGBA bytes instead of drawImage(). This avoids any\n        // Android/WebView premultiplied-alpha or resampling side effects.\n        const sourceCrop = ctx.getImageData(cropLeft, cropTop, cropW, cropH);\n        const sourceData = sourceCrop.data;\n        const outData = outCtx.createImageData(output.width, output.height);\n        const targetData = outData.data;\n        for (let y = 0; y < cropH; y += 1) {\n          for (let x = 0; x < cropW; x += 1) {\n            const sp = (y * cropW + x) * 4;\n            const dp = ((y + safety) * output.width + (x + safety)) * 4;\n            targetData[dp] = sourceData[sp];\n            targetData[dp + 1] = sourceData[sp + 1];\n            targetData[dp + 2] = sourceData[sp + 2];\n            targetData[dp + 3] = sourceData[sp + 3] === 0 ? 0 : 255;\n          }\n        }\n        outCtx.putImageData(outData, 0, 0);`

        if (!transformed.includes(oldCrop)) {
          throw new Error('[split-v15] direct crop anchor not found')
        }
        transformed = transformed.replace(oldCrop, newCrop)

        // v20 export source: keep the exact, already verified RGBA bytes before
        // PNG encoding. The finish/save stage can then render from these pixels
        // directly instead of decoding the transparent PNG again on Android.
        const oldPush = `        const blob = await canvasToPngBlob(output);\n        items.push({\n          index: items.length + 1,\n          blob,\n          width: output.width,\n          height: output.height,\n          needsReview: false,\n          reviewReasons: []\n        });`
        const newPush = `        const blob = await canvasToPngBlob(output);\n        items.push({\n          index: items.length + 1,\n          blob,\n          width: output.width,\n          height: output.height,\n          pixelSafe: true,\n          pixelData: new Uint8ClampedArray(targetData),\n          pixelWidth: output.width,\n          pixelHeight: output.height,\n          needsReview: false,\n          reviewReasons: []\n        });`
        if (!transformed.includes(oldPush)) {
          throw new Error('[split-v20] direct item push anchor not found')
        }
        transformed = transformed.replace(oldPush, newPush)

        transformed = transformed.replace(/Split v14 · Direct Lock/g, 'Split v15 · Pixel Copy')
        return { code: transformed, map: null }
      }

      if (normalizedId.endsWith('/src/components/EmoticonPostProcessor.jsx')) {
        const rawPreview = '<img src={item.url} alt={`emoticon ${item.index}`} className="h-full w-full object-contain p-1.5" />'
        const rawPreviewFixed = '<img src={item.url} alt={`emoticon ${item.index}`} className="h-full w-full object-contain p-1.5" style={{ opacity: 1, mixBlendMode: \'normal\', filter: \'none\' }} />'
        const finalPreview = '<img src={item.finalUrl} alt={`emoticon ${item.index}`} className="h-full w-full object-contain" />'
        const finalPreviewFixed = '<img src={item.finalUrl} alt={`emoticon ${item.index}`} className="h-full w-full object-contain" style={{ opacity: 1, mixBlendMode: \'normal\', filter: \'none\' }} />'
        const editorPreview = '<img src={current.url} alt={`edit ${current.index}`} draggable={false} className="absolute object-contain" style={previewStyle(current, editor)} />'
        const editorPreviewFixed = '<img src={current.url} alt={`edit ${current.index}`} draggable={false} className="absolute object-contain" style={{ ...previewStyle(current, editor), opacity: 1, mixBlendMode: \'normal\', filter: \'none\' }} />'

        if (transformed.includes(rawPreview)) transformed = transformed.replace(rawPreview, rawPreviewFixed)
        if (transformed.includes(finalPreview)) transformed = transformed.replace(finalPreview, finalPreviewFixed)
        if (transformed.includes(editorPreview)) transformed = transformed.replace(editorPreview, editorPreviewFixed)
        return { code: transformed, map: null }
      }

      return null
    }
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), pixelExactDarkSplitV15()]
})
