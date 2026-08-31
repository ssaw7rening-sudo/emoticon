import { env, pipeline, RawImage } from '@huggingface/transformers';

let removerPromise = null;
let activeRequestId = null;
let configuredThreads = null;

function normalizeModelProgress(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const normalized = value <= 1 ? value * 100 : value;
  return Math.max(0, Math.min(100, normalized));
}

function sendProgress(id, progress, stage, detail = '') {
  self.postMessage({
    type: 'progress',
    id,
    progress: Math.max(0, Math.min(99, Math.round(progress))),
    stage,
    detail,
  });
}

function configureWasmRuntime(requestedThreads = 1) {
  if (configuredThreads !== null) return configuredThreads;

  // Multi-threaded WASM can monopolize mobile/browser CPU even though inference
  // runs in a Worker. Without cross-origin isolation, force a single inference
  // thread. On isolated desktop pages allow at most two threads.
  const requested = Math.max(1, Math.min(2, Math.round(requestedThreads || 1)));
  const threads = self.crossOriginIsolated === true ? requested : 1;
  try {
    if (env?.backends?.onnx?.wasm) {
      env.backends.onnx.wasm.numThreads = threads;
    }
  } catch (error) {
    console.warn('Unable to limit ONNX WASM threads:', error);
  }
  configuredThreads = threads;
  return threads;
}

async function ensureRemover(id, requestedThreads) {
  if (!removerPromise) {
    removerPromise = (async () => {
      const threads = configureWasmRuntime(requestedThreads);
      sendProgress(id, 2, 'model', `BEN2 모델 준비 중 · CPU ${threads}스레드`);
      const remover = await pipeline('background-removal', 'onnx-community/BEN2-ONNX', {
        device: 'wasm',
        progress_callback: (info) => {
          const raw = normalizeModelProgress(info?.progress);
          if (raw === null) return;
          // Download/loading is only the first part. Never show 100% before
          // inference itself has actually completed.
          sendProgress(id, 3 + raw * 0.25, 'model', 'BEN2 모델 불러오는 중');
        },
      });
      return remover;
    })().catch((error) => {
      removerPromise = null;
      configuredThreads = null;
      throw error;
    });
  }

  const remover = await removerPromise;
  sendProgress(id, 30, 'model-ready', '정밀 모델 준비 완료');
  return remover;
}

async function resizeForInference(file, maxSide, id) {
  if (
    typeof createImageBitmap !== 'function' ||
    typeof OffscreenCanvas === 'undefined' ||
    !maxSide ||
    maxSide <= 0
  ) {
    return { blob: file, resized: false };
  }

  sendProgress(id, 33, 'decode', '이미지 준비 중');
  const bitmap = await createImageBitmap(file);
  try {
    const width = bitmap.width;
    const height = bitmap.height;
    const longest = Math.max(width, height);
    if (!width || !height || longest <= maxSide) {
      return { blob: file, resized: false, width, height };
    }

    const scale = maxSide / longest;
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));
    const canvas = new OffscreenCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return { blob: file, resized: false, width, height };

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    sendProgress(id, 38, 'resize', `정밀 분석용 이미지 준비 완료 · ${targetWidth}×${targetHeight}`);
    return {
      blob,
      resized: true,
      width,
      height,
      targetWidth,
      targetHeight,
    };
  } finally {
    bitmap.close?.();
  }
}

async function runBen2(file, maxSide, requestedThreads, id) {
  const remover = await ensureRemover(id, requestedThreads);
  const prepared = await resizeForInference(file, maxSide, id);

  sendProgress(id, 42, 'decode', '이미지 분석 준비 중');
  const rawImage = await RawImage.fromBlob(prepared.blob);

  sendProgress(id, 48, 'inference', 'AI 정밀 분석 중');
  const output = await remover([rawImage]);
  sendProgress(id, 88, 'inference-done', 'AI 분석 완료');

  const image = Array.isArray(output) ? output[0] : output;
  let blob = null;
  if (image instanceof Blob) {
    blob = image;
  } else if (image?.toBlob) {
    blob = await image.toBlob();
  }
  if (!blob) throw new Error('BEN2 worker produced no image output');

  sendProgress(id, 96, 'finalize', '경계 결과 전달 중');
  return blob;
}

self.onmessage = async (event) => {
  const data = event.data || {};
  if (data.type !== 'process') return;

  const id = data.id;
  activeRequestId = id;
  try {
    const blob = await runBen2(data.file, data.maxSide, data.threads, id);
    if (activeRequestId !== id) return;
    self.postMessage({ type: 'result', id, blob });
  } catch (error) {
    if (activeRequestId !== id) return;
    self.postMessage({
      type: 'error',
      id,
      message: error?.message || 'BEN2 worker failed',
    });
  }
};
