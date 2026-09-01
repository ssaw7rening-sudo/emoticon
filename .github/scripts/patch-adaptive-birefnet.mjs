import fs from 'node:fs';

function replaceOnce(text, oldText, newText, label) {
  const count = text.split(oldText).length - 1;
  if (count !== 1) throw new Error(`${label}: expected 1 match, got ${count}`);
  return text.replace(oldText, newText);
}

const sourcePath = 'src/components/BackgroundRemover.jsx';
let source = fs.readFileSync(sourcePath, 'utf8');
source = replaceOnce(source, 'let birefNetPromise = null;', 'const birefNetPromises = new Map();', 'promise-cache');

const oldLoader = `async function getBiRefNet(onProgress) {
  if (!birefNetPromise) {
    birefNetPromise = (async () => {
      const { AutoModel, AutoProcessor, RawImage } = await import('@huggingface/transformers');
      const modelId = 'onnx-community/BiRefNet_lite-ONNX';
      const model = await AutoModel.from_pretrained(modelId, {
        device: 'wasm',
        dtype: 'fp32',
        progress_callback: (info) => onProgress?.(info)
      });
      const processor = await AutoProcessor.from_pretrained(modelId, {
        progress_callback: (info) => onProgress?.(info)
      });
      return { model, processor, RawImage };
    })().catch((error) => {
      birefNetPromise = null;
      throw error;
    });
  }
  return birefNetPromise;
}`;

const newLoader = `const BIREFNET_LITE_MODEL = 'onnx-community/BiRefNet_lite-ONNX';
const BIREFNET_FULL_MODEL = 'onnx-community/BiRefNet-ONNX';

function isLikelyMobilePrecisionDevice() {
  if (typeof navigator === 'undefined') return true;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
}

async function getBiRefNetProfiles() {
  const fallback = { key: 'lite-wasm-fp32', modelId: BIREFNET_LITE_MODEL, device: 'wasm', dtype: 'fp32' };
  if (typeof navigator === 'undefined' || !navigator.gpu) return [fallback];

  try {
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
    if (!adapter) return [fallback];
  } catch (error) {
    console.warn('WebGPU adapter check failed; using WASM precision model:', error);
    return [fallback];
  }

  const deviceMemory = Number(navigator.deviceMemory || 0);
  const canUseFullModel = !isLikelyMobilePrecisionDevice() && deviceMemory >= 8;
  const profiles = [];
  if (canUseFullModel) {
    profiles.push({ key: 'full-webgpu-fp16', modelId: BIREFNET_FULL_MODEL, device: 'webgpu', dtype: 'fp16' });
  }
  profiles.push({ key: 'lite-webgpu-fp16', modelId: BIREFNET_LITE_MODEL, device: 'webgpu', dtype: 'fp16' });
  profiles.push(fallback);
  return profiles;
}

async function getBiRefNet(profile, onProgress) {
  if (!birefNetPromises.has(profile.key)) {
    const promise = (async () => {
      const { AutoModel, AutoProcessor, RawImage } = await import('@huggingface/transformers');
      const model = await AutoModel.from_pretrained(profile.modelId, {
        device: profile.device,
        dtype: profile.dtype,
        progress_callback: (info) => onProgress?.(info)
      });
      const processor = await AutoProcessor.from_pretrained(profile.modelId, {
        progress_callback: (info) => onProgress?.(info)
      });
      return { model, processor, RawImage };
    })().catch((error) => {
      birefNetPromises.delete(profile.key);
      throw error;
    });
    birefNetPromises.set(profile.key, promise);
  }
  return birefNetPromises.get(profile.key);
}`;
source = replaceOnce(source, oldLoader, newLoader, 'birefnet-loader');

const oldRemove = `async function removeWithBiRefNet(file, onProgress) {
  const { model, processor, RawImage } = await getBiRefNet(onProgress);
  const rawImage = await RawImage.fromBlob(file);
  const { pixel_values } = await processor(rawImage);
  const output = await model({ input_image: pixel_values });
  const tensor = output?.output_image || output?.output;
  if (!tensor?.[0]) throw new Error('BiRefNet output is unavailable');

  const mask = await RawImage.fromTensor(tensor[0].sigmoid().mul(255).to('uint8'))
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
  return canvasToPngBlob(canvas);
}`;

const newRemove = `async function removeWithBiRefNet(file, onProgress) {
  const profiles = await getBiRefNetProfiles();
  let lastError = null;

  const disposeSafely = (value) => {
    if (!value || typeof value.dispose !== 'function') return;
    try { value.dispose(); } catch (error) { console.warn('Tensor disposal skipped:', error); }
  };

  for (const profile of profiles) {
    let pixelValues = null;
    let outputTensor = null;
    let sigmoidTensor = null;
    let scaledTensor = null;
    let uint8Tensor = null;
    try {
      const { model, processor, RawImage } = await getBiRefNet(profile, onProgress);
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
      const mask = await RawImage.fromTensor(uint8Tensor).resize(rawImage.width, rawImage.height);
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
    } catch (error) {
      lastError = error;
      console.warn(\`BiRefNet precision profile \${profile.key} failed; trying fallback:\`, error);
    } finally {
      const disposed = new Set();
      for (const tensor of [uint8Tensor, scaledTensor, sigmoidTensor, outputTensor, pixelValues]) {
        if (!tensor || disposed.has(tensor)) continue;
        disposed.add(tensor);
        disposeSafely(tensor);
      }
    }
  }

  throw lastError || new Error('BiRefNet precision processing failed');
}`;
source = replaceOnce(source, oldRemove, newRemove, 'birefnet-removal');

const hints = [
  ["precisionHint: '첫 실행은 필요한 파일을 불러오는 과정으로 오래 걸릴 수 있습니다.'", "precisionHint: '정밀 처리 실패 시 지원 기기에서는 WebGPU와 고정밀 보조 모델을 자동 사용하며, 모바일·미지원 환경에서는 가벼운 모델로 안전하게 처리합니다. 첫 실행은 모델 파일을 불러와 오래 걸릴 수 있습니다.'"],
  ["precisionHint: 'The first run may take longer while the required files are loaded.'", "precisionHint: 'If precision processing needs a fallback, supported devices automatically use WebGPU and a higher-precision backup model; mobile or unsupported environments use the lighter fallback. The first run may take longer while model files load.'"],
  ["precisionHint: '初回は必要なファイルの読み込みに時間がかかる場合があります。'", "precisionHint: '高精度処理のフォールバックが必要な場合、対応端末ではWebGPUと高精度の補助モデルを自動使用し、モバイルや非対応環境では軽量モデルを使用します。初回はモデル読み込みに時間がかかる場合があります。'"],
  ["precisionHint: '首次运行需要加载必要文件，可能耗时较长。'", "precisionHint: '高精度处理需要回退时，支持的设备会自动使用WebGPU和更高精度的备用模型；移动端或不支持的环境会使用轻量备用模型。首次加载模型文件可能较慢。'"]
];
for (const [oldText, newText] of hints) source = replaceOnce(source, oldText, newText, 'precision-hint');
fs.writeFileSync(sourcePath, source);

const ben2AutoPath = 'vite.ben2-auto.config.js';
let ben2Auto = fs.readFileSync(ben2AutoPath, 'utf8');
ben2Auto = replaceOnce(
  ben2Auto,
  "const promiseAnchor = 'let birefNetPromise = null;'",
  "const promiseAnchor = 'const birefNetPromises = new Map();'",
  'ben2-promise-anchor'
);
ben2Auto = replaceOnce(
  ben2Auto,
  "const getterAnchor = 'async function getBiRefNet(onProgress) {'",
  "const getterAnchor = 'async function getBiRefNet(profile, onProgress) {'",
  'ben2-getter-anchor'
);
fs.writeFileSync(ben2AutoPath, ben2Auto);

const ben2WorkerPath = 'vite.ben2-worker.config.js';
let ben2Worker = fs.readFileSync(ben2WorkerPath, 'utf8');
const legacyStart = ben2Worker.indexOf('      // The BiRefNet fallback runs on the main thread.');
const returnMarker = '      return { code: transformed, map: null }';
const legacyEnd = ben2Worker.indexOf(returnMarker, legacyStart);
if (legacyStart < 0 || legacyEnd < 0) throw new Error('ben2-worker BiRefNet override block was not found');
ben2Worker = ben2Worker.slice(0, legacyStart)
  + "      // BiRefNet fallback selection, WebGPU routing, and tensor disposal now live\n"
  + "      // in BackgroundRemover.jsx so this worker plugin does not overwrite them.\n"
  + ben2Worker.slice(legacyEnd);
fs.writeFileSync(ben2WorkerPath, ben2Worker);
