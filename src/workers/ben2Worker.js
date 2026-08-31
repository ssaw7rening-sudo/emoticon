import { pipeline, RawImage } from '@huggingface/transformers';

let removerPromise = null;
let activeRequestId = null;
const modelWaiters = new Set();

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

function sendModelProgress(progress, stage, detail) {
  for (const id of modelWaiters) {
    sendProgress(id, progress, stage, detail);
  }
}

async function ensureRemover(id) {
  modelWaiters.add(id);
  try {
    if (!removerPromise) {
      removerPromise = (async () => {
        sendModelProgress(2, 'model', 'BEN2 모델 준비 중');
        const remover = await pipeline('background-removal', 'onnx-community/BEN2-ONNX', {
          device: 'wasm',
          progress_callback: (info) => {
            const raw = normalizeModelProgress(info?.progress);
            if (raw === null) return;
            // Model download/loading is only the first part of the job. Never
            // expose 100% here because inference still has to run afterwards.
            sendModelProgress(3 + raw * 0.25, 'model', 'BEN2 모델 불러오는 중');
          },
        });
        return remover;
      })().catch((error) => {
        removerPromise = null;
        throw error;
      });
    }

    const remover = await removerPromise;
    sendProgress(id, 30, 'model-ready', '정밀 모델 준비 완료');
    return remover;
  } finally {
    modelWaiters.delete(id);
  }
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
    sendProgress(id, 38, 'resize', '정밀 분석용 이미지 준비 완료');
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

async function runBen2(file, maxSide, id) {
  const remover = await ensureRemover(id);
  const prepared = await resizeForInference(file, maxSide, id);

  sendProgress(id, 42, 'decode', '이미지 분석 준비 중');
  const rawImage = await RawImage.fromBlob(prepared.blob);

  // The expensive WASM inference happens inside this dedicated worker so the
  // React/UI main thread can keep painting and responding to browser events.
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

  if (data.type === 'warmup') {
    const id = data.id || `warmup-${Date.now()}`;
    try {
      await ensureRemover(id);
      self.postMessage({ type: 'warmup-ready', id });
    } catch (error) {
      self.postMessage({
        type: 'warmup-error',
        id,
        message: error?.message || 'BEN2 warmup failed',
      });
    }
    return;
  }

  if (data.type !== 'process') return;

  const id = data.id;
  activeRequestId = id;
  try {
    const blob = await runBen2(data.file, data.maxSide, id);
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
