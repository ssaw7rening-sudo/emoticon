import { defineConfig } from 'vite'
import baseConfig from './vite.shadow-cleanup.config.js'

function injectBen2Runtime() {
  return {
    name: 'inject-ben2-runtime',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      const promiseAnchor = 'let birefNetPromise = null;'
      if (!transformed.includes(promiseAnchor)) {
        throw new Error('[ben2-auto] BiRefNet promise anchor was not found')
      }
      if (!transformed.includes('let ben2Promise = null;')) {
        transformed = transformed.replace(
          promiseAnchor,
          `${promiseAnchor}\nlet ben2Promise = null;`
        )
      }

      const getterAnchor = 'async function getBiRefNet(onProgress) {'
      if (!transformed.includes(getterAnchor)) {
        throw new Error('[ben2-auto] BiRefNet getter anchor was not found')
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
        throw new Error('[ben2-auto] BiRefNet removal anchor was not found')
      }
      if (!transformed.includes('async function removeWithBen2(file, onProgress)')) {
        const ben2Remove = `async function removeWithBen2(file, onProgress) {
  return pipelineRemovalToBlob(file, getBen2Remover, onProgress);
}

`
        transformed = transformed.replace(removeAnchor, `${ben2Remove}${removeAnchor}`)
      }

      return { code: transformed, map: null }
    },
  }
}

function preferBen2PrecisionRoute() {
  return {
    name: 'prefer-ben2-precision-route',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code

      if (!transformed.includes('async function removeWithBen2')) {
        throw new Error('[ben2-auto] Compiled BEN2 helper was not found')
      }
      if (!transformed.includes('removeWithBiRefNet(file,')) {
        throw new Error('[ben2-auto] Precision model call was not found')
      }

      // Replace both the automatic high-precision route and the manual precision
      // retry with BEN2. The existing quality gate, RGB restoration, subject
      // cleanup and shadow cleanup remain untouched around the new model.
      transformed = transformed.split('removeWithBiRefNet(file,').join('removeWithBen2(file,')
      transformed = transformed.split("method = 'birefnet';").join("method = 'ben2';")
      transformed = transformed.split("setResultMethod('birefnet');").join("setResultMethod('ben2');")
      transformed = transformed.split('BiRefNet primary removal failed:').join('BEN2 primary removal failed:')
      transformed = transformed.split('MODNet fallback after BiRefNet failed:').join('MODNet fallback after BEN2 failed:')
      transformed = transformed.split('BiRefNet precision retry failed:').join('BEN2 precision retry failed:')

      // The previous route treated every phone as low-power. BEN2 is now used
      // automatically on capable phones too. Only devices that explicitly report
      // limited memory, or very few CPU cores when memory is unavailable, stay on
      // the lightweight automatic route. They can still request BEN2 manually.
      const mobileRoute = 'const portraitFirst = !isMobileLikeDevice(); // desktop precision-first, mobile lightweight-first'
      if (!transformed.includes(mobileRoute)) {
        throw new Error('[ben2-auto] Existing mobile precision route was not found')
      }
      transformed = transformed.replace(
        mobileRoute,
        `const reportedDeviceMemory = typeof navigator !== 'undefined' && typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : null;
        const reportedHardwareConcurrency = typeof navigator !== 'undefined' && typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : null;
        const lowPowerForBen2 =
          (reportedDeviceMemory !== null && reportedDeviceMemory <= 4) ||
          (reportedDeviceMemory === null && reportedHardwareConcurrency !== null && reportedHardwareConcurrency <= 4);
        const portraitFirst = !lowPowerForBen2; // BEN2 precision-first on capable desktop/mobile devices`
      )

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), injectBen2Runtime(), preferBen2PrecisionRoute()],
})
