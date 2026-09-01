import fs from 'node:fs';

const path = 'src/components/BackgroundRemover.jsx';
let text = fs.readFileSync(path, 'utf8');

function replaceOnce(oldText, newText, label) {
  const count = text.split(oldText).length - 1;
  if (count !== 1) throw new Error(`${label}: expected 1 match, got ${count}`);
  text = text.replace(oldText, newText);
}

replaceOnce('let birefNetPromise = null;', 'const birefNetPromises = new Map();', 'promise-cache');

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
  const canUseFullModel = !isLikelyMobilePrecisionDevice() && (!deviceMemory || deviceMemory >= 8);
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
replaceOnce(oldLoader, newLoader, 'birefnet-loader');

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

  for (const profile of profiles) {
    try {
      const { model, processor, RawImage } = await getBiRefNet(profile, onProgress);
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
    } catch (error) {
      lastError = error;
      console.warn(\`BiRefNet precision profile \${profile.key} failed; trying fallback:\`, error);
    }
  }

  throw lastError || new Error('BiRefNet precision processing failed');
}`;
replaceOnce(oldRemove, newRemove, 'birefnet-removal');

const hints = [
  ["precisionHint: '첫 실행은 필요한 파일을 불러오는 과정으로 오래 걸릴 수 있습니다.'", "precisionHint: '지원 기기에서는 WebGPU와 고정밀 모델을 자동 사용하며, 모바일·미지원 환경에서는 가벼운 정밀 모델로 안전하게 처리합니다. 첫 실행은 모델 파일을 불러와 오래 걸릴 수 있습니다.'"],
  ["precisionHint: 'The first run may take longer while the required files are loaded.'", "precisionHint: 'Supported devices automatically use WebGPU and a higher-precision model; mobile or unsupported environments safely fall back to the lighter precision model. The first run may take longer while model files load.'"],
  ["precisionHint: '初回は必要なファイルの読み込みに時間がかかる場合があります。'", "precisionHint: '対応端末ではWebGPUと高精度モデルを自動使用し、モバイルや非対応環境では軽量な高精度モデルへ安全に切り替えます。初回はモデル読み込みに時間がかかる場合があります。'"],
  ["precisionHint: '首次运行需要加载必要文件，可能耗时较长。'", "precisionHint: '支持的设备会自动使用WebGPU和更高精度模型；移动端或不支持的环境会安全回退到轻量精度模型。首次运行加载模型文件时可能较慢。'"]
];
for (const [oldText, newText] of hints) replaceOnce(oldText, newText, 'precision-hint');

fs.writeFileSync(path, text);
