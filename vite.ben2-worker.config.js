import { defineConfig } from 'vite'
import baseConfig from './vite.precise-sticker-split.config.js'

function offloadBen2ToWorker() {
  return {
    name: 'ben2-worker-offload-v2',
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

function resetBen2Worker() {
  if (ben2WorkerInstance) {
    try { ben2WorkerInstance.terminate(); } catch (error) { /* noop */ }
  }
  ben2WorkerInstance = null;
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

function getBen2InferenceMaxSide() {
  if (typeof navigator === 'undefined') return 1440;
  const memory = typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : null;
  const cores = typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : null;
  const mobileLike = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');

  if ((memory !== null && memory <= 4) || (memory === null && cores !== null && cores <= 4)) {
    return 1024;
  }
  return mobileLike ? 1280 : 1600;
}

async function runBen2Worker(file, onProgress) {
  if (typeof Worker !== 'function') {
    throw new Error('Web Worker is unavailable');
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
      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), offloadBen2ToWorker()],
})
