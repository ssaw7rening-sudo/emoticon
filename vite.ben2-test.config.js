import { defineConfig } from 'vite'
import baseConfig from './vite.shadow-cleanup.config.js'

function ben2PrecisionExperiment() {
  return {
    name: 'ben2-precision-experiment',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code

      const promiseAnchor = 'let birefNetPromise = null;'
      if (!transformed.includes(promiseAnchor)) {
        throw new Error('[ben2-test] BiRefNet promise anchor was not found')
      }
      if (!transformed.includes('let ben2Promise = null;')) {
        transformed = transformed.replace(
          promiseAnchor,
          `${promiseAnchor}\nlet ben2Promise = null;`
        )
      }

      const getterAnchor = 'async function getBiRefNet(onProgress) {'
      if (!transformed.includes(getterAnchor)) {
        throw new Error('[ben2-test] BiRefNet getter anchor was not found')
      }
      if (!transformed.includes('async function getBen2Remover(onProgress)')) {
        const ben2Getter = `async function getBen2Remover(onProgress) {
  if (!ben2Promise) {
    ben2Promise = (async () => {
      const { pipeline, RawImage } = await import('@huggingface/transformers');
      const remover = await pipeline('background-removal', 'onnx-community/BEN2-ONNX', {
        device: 'wasm',
        progress_callback: (info) => onProgress?.(info)
      });
      return { remover, RawImage };
    })().catch((error) => {
      ben2Promise = null;
      throw error;
    });
  }
  return ben2Promise;
}

`
        transformed = transformed.replace(getterAnchor, `${ben2Getter}${getterAnchor}`)
      }

      const removeAnchor = 'async function removeWithBiRefNet(file, onProgress) {'
      if (!transformed.includes(removeAnchor)) {
        throw new Error('[ben2-test] BiRefNet removal anchor was not found')
      }
      if (!transformed.includes('async function removeWithBen2(file, onProgress)')) {
        const ben2Remove = `async function removeWithBen2(file, onProgress) {
  return pipelineRemovalToBlob(file, getBen2Remover, onProgress);
}

`
        transformed = transformed.replace(removeAnchor, `${ben2Remove}${removeAnchor}`)
      }

      const precisionStart = transformed.indexOf('const runPrecisionRetry = async () => {')
      if (precisionStart < 0) {
        throw new Error('[ben2-test] Precision retry handler was not found')
      }

      const beforePrecision = transformed.slice(0, precisionStart)
      let precisionSection = transformed.slice(precisionStart)

      if (!precisionSection.includes('let precisionBlob = await removeWithBiRefNet(file,')) {
        throw new Error('[ben2-test] Precision BiRefNet call was not found')
      }

      precisionSection = precisionSection.replace(
        'let precisionBlob = await removeWithBiRefNet(file,',
        'let precisionBlob = await removeWithBen2(file,'
      )
      precisionSection = precisionSection.replace(
        "setResultMethod('birefnet');",
        "setResultMethod('ben2');"
      )
      precisionSection = precisionSection.replace(
        "console.error('BiRefNet precision retry failed:', e);",
        "console.error('BEN2 precision retry failed:', e);"
      )

      transformed = beforePrecision + precisionSection
      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), ben2PrecisionExperiment()],
})
