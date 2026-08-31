import { defineConfig } from 'vite'
import baseConfig from './vite.precise-sticker-split.config.js'

function offloadBen2ToWorker() {
  return {
    name: 'ben2-worker-offload-v5-single-flight',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')
      const oldHelper = `async function removeWithBen2(file, onProgress) {
  return pipelineRemovalToBlob(file, getBen2Remover, onProgress);
}`

      if (!transformed.includes(oldHelper)) {
        throw new Error('[ben2-worker] BEN2 helper anchor was not found')
      }

      const workerHelper = `let ben2WorkerInstance = null;
let ben2WorkerRequestSequence = 0;
let ben2WorkerActiveCancel = null;
let ben2PrewarmScheduled = false;

function resetBen2Worker() {
  if (ben2WorkerInstance) {
    try { ben2WorkerInstance.terminate(); } catch (error) { /* noop */ }
  }
  ben2WorkerInstance = null;
  ben2PrewarmScheduled = false;
}

function cancelBen2Processing() {
  if (typeof ben2WorkerActiveCancel === 'function') {
    const cancel = ben2WorkerActiveCancel;
    ben2WorkerActiveCancel = null;
    cancel();
    return true;
  }
  resetBen2Worker();
  return false;
}

function getBen2WorkerInstance() {
  if (!ben2WorkerInstance) {
    ben2WorkerInstance = new Worker(
      new URL('../workers/ben2Worker.js', import.meta.url),
      { type: 'module', name: 'ben2-background-removal' }
    );
  }
  return ben2WorkerInstance;
}

function scheduleBen2Prewarm() {
  if (ben2PrewarmScheduled || typeof Worker !== 'function') return;
  ben2PrewarmScheduled = true;

  const start = () => {
    try {
      const worker = getBen2WorkerInstance();
      const id = 'warmup-' + (++ben2WorkerRequestSequence);
      worker.postMessage({ type: 'warmup', id });
    } catch (error) {
      ben2PrewarmScheduled = false;
      console.warn('BEN2 prewarm skipped:', error);
    }
  };

  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(start, { timeout: 900 });
  } else {
    setTimeout(start, 180);
  }
}

function getBen2InferenceMaxSide() {
  if (typeof navigator === 'undefined') return 1440;
  const memory = typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : null;
  const cores = typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : null;
  const mobileLike = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');

  if (mobileLike) {
    const highEndMobile =
      (memory !== null && memory >= 8) ||
      (memory === null && cores !== null && cores >= 8);
    // Keep BEN2 precision on mobile, but reduce only the inference-mask size.
    // The existing original-RGB/tone-lock pass scales the matte back onto the
    // full-resolution source, so saved output dimensions remain unchanged.
    return highEndMobile ? 1152 : 960;
  }

  if ((memory !== null && memory <= 4) || (memory === null && cores !== null && cores <= 4)) {
    return 1152;
  }
  return 1600;
}

async function runBen2Worker(file, onProgress) {
  if (typeof Worker !== 'function') {
    throw new Error('Web Worker is unavailable');
  }

  // Only one heavyweight WASM inference may exist at a time. Starting a new
  // request terminates the previous worker first so a suspended/zombie run
  // cannot keep consuming CPU or memory behind the replacement request.
  if (typeof ben2WorkerActiveCancel === 'function') {
    const cancelPrevious = ben2WorkerActiveCancel;
    ben2WorkerActiveCancel = null;
    cancelPrevious();
  }

  const worker = getBen2WorkerInstance();
  const id = ++ben2WorkerRequestSequence;
  const maxSide = getBen2InferenceMaxSide();

  return new Promise((resolve, reject) => {
    let settled = false;
    let cancelCurrent = null;

    const cleanup = () => {
      clearTimeout(timeoutId);
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      worker.removeEventListener('messageerror', handleMessageError);
      if (ben2WorkerActiveCancel === cancelCurrent) ben2WorkerActiveCancel = null;
    };

    cancelCurrent = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resetBen2Worker();
      const error = new Error('BEN2 processing cancelled');
      error.name = 'AbortError';
      reject(error);
    };
    ben2WorkerActiveCancel = cancelCurrent;

    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      resetBen2Worker();
      reject(new Error('BEN2 worker timed out'));
    }, 240000);

    function handleMessage(event) {
      const data = event.data || {};
      if (data.id !== id || settled) return;

      if (data.type === 'progress') {
        if (typeof data.progress === 'number') {
          onProgress?.({
            progress: Math.max(0, Math.min(96, data.progress)),
            workerStage: data.stage || '',
            detail: data.detail || ''
          });
        }
        return;
      }

      if (data.type === 'result' && data.blob instanceof Blob) {
        settled = true;
        cleanup();
        resolve(data.blob);
        return;
      }

      if (data.type === 'error') {
        settled = true;
        cleanup();
        reject(new Error(data.message || 'BEN2 worker failed'));
      }
    }

    function handleError(event) {
      if (settled) return;
      settled = true;
      cleanup();
      resetBen2Worker();
      reject(event?.error || new Error(event?.message || 'BEN2 worker crashed'));
    }

    function handleMessageError() {
      if (settled) return;
      settled = true;
      cleanup();
      resetBen2Worker();
      reject(new Error('BEN2 worker message failed'));
    }

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);
    worker.addEventListener('messageerror', handleMessageError);
    worker.postMessage({ type: 'process', id, file, maxSide });
  });
}

async function removeWithBen2(file, onProgress) {
  try {
    return await runBen2Worker(file, onProgress);
  } catch (workerError) {
    if (workerError?.name === 'AbortError') throw workerError;
    console.warn('BEN2 worker failed, using BiRefNet fallback:', workerError);
    // Keep the UI responsive route as the default. Only if the worker itself is
    // unavailable/crashes do we fall back to the smaller existing precision model.
    return removeWithBiRefNet(file, onProgress);
  }
}`

      transformed = transformed.replace(oldHelper, workerHelper)

      // The BiRefNet fallback runs on the main thread. Keep model/processor caches,
      // but explicitly release per-request tensors once the PNG has been produced.
      // Optional dispose() calls keep this compatible if a tensor implementation
      // does not expose explicit disposal on a particular platform.
      const biRefStart = transformed.indexOf('async function removeWithBiRefNet(file, onProgress) {')
      const biRefEnd = transformed.indexOf('\nfunction qualityRank(', biRefStart)
      if (biRefStart < 0 || biRefEnd < 0) {
        throw new Error('[ben2-worker] BiRefNet helper boundaries were not found')
      }

      const biRefHelper = `async function removeWithBiRefNet(file, onProgress) {
  const { model, processor, RawImage } = await getBiRefNet(onProgress);
  let pixelValues = null;
  let outputTensor = null;
  let sigmoidTensor = null;
  let scaledTensor = null;
  let uint8Tensor = null;

  const disposeSafely = (value) => {
    if (!value || typeof value.dispose !== 'function') return;
    try {
      value.dispose();
    } catch (disposeError) {
      console.warn('Tensor disposal skipped:', disposeError);
    }
  };

  try {
    const rawImage = await RawImage.fromBlob(file);
    const processed = await processor(rawImage);
    pixelValues = processed?.pixel_values || null;
    if (!pixelValues) throw new Error('BiRefNet processor output is unavailable');

    const output = await model({ input_image: pixelValues });
    outputTensor = output?.output_image || output?.output || null;
    const sourceTensor = outputTensor?.[0];
    if (!sourceTensor) throw new Error('BiRefNet output is unavailable');

    sigmoidTensor = sourceTensor.sigmoid();
    scaledTensor = sigmoidTensor.mul(255);
    uint8Tensor = scaledTensor.to('uint8');

    const mask = await RawImage.fromTensor(uint8Tensor)
      .resize(rawImage.width, rawImage.height);
    const { canvas, ctx } = await drawFileToCanvas(file);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const maskData = mask.data;
    const maskChannels = Math.max(1, mask.channels || 1);
    const total = canvas.width * canvas.height;
    if (!maskData || mask.width !== canvas.width || mask.height !== canvas.height) {
      throw new Error('BiRefNet mask size mismatch');
    }
    for (let i = 0; i < total; i += 1) {
      const alpha = maskData[i * maskChannels];
      pixels[i * 4 + 3] = Math.round((pixels[i * 4 + 3] * alpha) / 255);
    }
    ctx.putImageData(imageData, 0, 0);
    return await canvasToPngBlob(canvas);
  } finally {
    const disposed = new Set();
    for (const tensor of [uint8Tensor, scaledTensor, sigmoidTensor, outputTensor, pixelValues]) {
      if (!tensor || disposed.has(tensor)) continue;
      disposed.add(tensor);
      disposeSafely(tensor);
    }
  }
}
`

      transformed = transformed.slice(0, biRefStart) + biRefHelper + transformed.slice(biRefEnd + 1)
      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), offloadBen2ToWorker()],
})
