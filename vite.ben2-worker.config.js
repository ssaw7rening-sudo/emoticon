import { defineConfig } from 'vite'
import baseConfig from './vite.precise-sticker-split.config.js'

function offloadBen2ToWorker() {
  return {
    name: 'ben2-worker-offload-v3',
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

function getBen2InferencePlan() {
  if (typeof navigator === 'undefined') {
    return { primaryMaxSide: 1152, retryMaxSide: 896, threads: 1, inferenceTimeoutMs: 70000 };
  }

  const memory = typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : null;
  const cores = typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : null;
  const mobileLike = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
  const lowPower =
    (memory !== null && memory <= 4) ||
    (memory === null && cores !== null && cores <= 4);

  if (lowPower) {
    return { primaryMaxSide: 768, retryMaxSide: 640, threads: 1, inferenceTimeoutMs: 45000 };
  }
  if (mobileLike) {
    return { primaryMaxSide: 1024, retryMaxSide: 768, threads: 1, inferenceTimeoutMs: 60000 };
  }
  return { primaryMaxSide: 1280, retryMaxSide: 960, threads: 2, inferenceTimeoutMs: 75000 };
}

function makeBen2Error(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

async function runBen2WorkerAttempt(file, onProgress, options) {
  if (typeof Worker !== 'function') {
    throw makeBen2Error('Web Worker is unavailable', 'BEN2_WORKER_UNAVAILABLE');
  }

  const worker = getBen2WorkerInstance();
  const id = ++ben2WorkerRequestSequence;
  const {
    maxSide,
    threads = 1,
    inferenceTimeoutMs = 60000,
    modelTimeoutMs = 240000
  } = options;

  return new Promise((resolve, reject) => {
    let settled = false;
    let cancelCurrent = null;
    let modelTimeoutId = null;
    let inferenceTimeoutId = null;

    const clearTimers = () => {
      if (modelTimeoutId) clearTimeout(modelTimeoutId);
      if (inferenceTimeoutId) clearTimeout(inferenceTimeoutId);
      modelTimeoutId = null;
      inferenceTimeoutId = null;
    };

    const cleanup = () => {
      clearTimers();
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      worker.removeEventListener('messageerror', handleMessageError);
      if (ben2WorkerActiveCancel === cancelCurrent) ben2WorkerActiveCancel = null;
    };

    const failAndReset = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      resetBen2Worker();
      reject(error);
    };

    cancelCurrent = () => {
      const error = makeBen2Error('BEN2 processing cancelled', 'BEN2_CANCELLED');
      error.name = 'AbortError';
      failAndReset(error);
    };
    ben2WorkerActiveCancel = cancelCurrent;

    modelTimeoutId = setTimeout(() => {
      failAndReset(makeBen2Error('BEN2 model loading timed out', 'BEN2_MODEL_TIMEOUT'));
    }, modelTimeoutMs);

    function startInferenceWatchdog() {
      if (modelTimeoutId) {
        clearTimeout(modelTimeoutId);
        modelTimeoutId = null;
      }
      if (inferenceTimeoutId) return;
      inferenceTimeoutId = setTimeout(() => {
        failAndReset(makeBen2Error('BEN2 inference took too long', 'BEN2_INFERENCE_TIMEOUT'));
      }, inferenceTimeoutMs);
    }

    function handleMessage(event) {
      const data = event.data || {};
      if (data.id !== id || settled) return;

      if (data.type === 'progress') {
        if (data.stage === 'model-ready') {
          if (modelTimeoutId) {
            clearTimeout(modelTimeoutId);
            modelTimeoutId = null;
          }
        }
        if (data.stage === 'inference') startInferenceWatchdog();
        if (data.stage === 'inference-done' && inferenceTimeoutId) {
          clearTimeout(inferenceTimeoutId);
          inferenceTimeoutId = null;
        }
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
        failAndReset(makeBen2Error(data.message || 'BEN2 worker failed', 'BEN2_WORKER_ERROR'));
      }
    }

    function handleError(event) {
      failAndReset(event?.error || makeBen2Error(event?.message || 'BEN2 worker crashed', 'BEN2_WORKER_CRASH'));
    }

    function handleMessageError() {
      failAndReset(makeBen2Error('BEN2 worker message failed', 'BEN2_MESSAGE_ERROR'));
    }

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);
    worker.addEventListener('messageerror', handleMessageError);
    worker.postMessage({ type: 'process', id, file, maxSide, threads });
  });
}

async function removeWithBen2(file, onProgress) {
  const plan = getBen2InferencePlan();
  try {
    return await runBen2WorkerAttempt(file, onProgress, {
      maxSide: plan.primaryMaxSide,
      threads: plan.threads,
      inferenceTimeoutMs: plan.inferenceTimeoutMs
    });
  } catch (firstError) {
    if (firstError?.name === 'AbortError') throw firstError;

    if (firstError?.code === 'BEN2_INFERENCE_TIMEOUT') {
      onProgress?.({
        progress: 36,
        workerStage: 'retry',
        detail: '처리가 오래 걸려 가벼운 정밀 모드로 자동 재시도 중…'
      });
      await new Promise((resolve) => setTimeout(resolve, 80));

      try {
        return await runBen2WorkerAttempt(file, onProgress, {
          maxSide: plan.retryMaxSide,
          threads: 1,
          inferenceTimeoutMs: Math.max(35000, Math.round(plan.inferenceTimeoutMs * 0.75))
        });
      } catch (retryError) {
        if (retryError?.name === 'AbortError') throw retryError;
        console.warn('BEN2 lightweight retry failed; using outer fallback route:', retryError);
        throw retryError;
      }
    }

    console.warn('BEN2 worker failed; using outer fallback route:', firstError);
    // Do not automatically run a heavy precision model on the UI thread here.
    // The surrounding route will choose MODNet/ORMBG as a safer fallback.
    throw firstError;
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
