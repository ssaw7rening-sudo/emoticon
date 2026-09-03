import React, { useEffect, useRef, useState } from 'react';
import EmoticonPostProcessor from './EmoticonPostProcessor';

let removerPromise = null;
let modnetPromise = null;
const birefNetPromises = new Map();

const COPY = {
  ko: {
    title: '배경 제거', badge: 'BETA', desc: '이미지의 배경을 지우고 투명 PNG로 저장해 보세요.',
    privacy: '이미지는 서버에 업로드하지 않고 이 기기에서 처리됩니다.', first: '균일한 단색 배경은 빠르게 처리하며, 복잡한 배경은 AI 모델을 사용해 처음 실행이 조금 오래 걸릴 수 있습니다.',
    upload: '이미지를 선택하거나 여기에 끌어놓으세요', format: 'PNG · JPG · WEBP / 최대 12MB', change: '이미지 변경',
    sheetUploadHint: '15개 이모티콘 시트는 배경 제거 후 자동으로 감지해 각각 분리합니다.', sheetSelectedHint: '15개 시트로 확인되면 배경 제거 완료 후 자동 분할됩니다.',
    remove: '배경 제거하기', preparing: '이미지 분석 중…', processing: '배경을 제거하고 있어요…',
    original: '원본', result: '투명 배경', download: '투명 PNG 저장', again: '다른 이미지',
    compareHint: '가운데 슬라이더를 좌우로 움직여 원본과 결과를 비교하세요.',
    transparentAlready: '이미 투명 배경인 PNG는 배경 제거 대상이 아닙니다. 배경이 있는 PNG·JPG·WEBP 이미지를 사용해 주세요.',
    splitTitle: '15개 이모티콘 자동 분리', splitBadge: '스마트 감지',
    splitDesc: '고정 격자로 자르지 않고 실제 캐릭터·문구 덩어리를 감지해 15개 이모티콘을 각각 분리합니다.',
    splitAction: '15개로 자동 분리', splitting: '15개 이모티콘을 분리하고 있어요…',
    splitReady: '분리 완료 · 각 이미지를 눌러 개별 PNG로 저장할 수 있습니다.',
    splitAgain: '다시 분리', splitDownload: 'PNG 저장', splitFailed: '자동 분리에 실패했습니다. 이미지를 다시 처리한 뒤 시도해 주세요.',
    splitMaybeTitle: '15개 이모티콘 시트인가요?', splitMaybeDesc: '자동 감지가 확실하지 않습니다. 이모티콘 시트라면 직접 분리를 실행할 수 있습니다.', splitMaybeAction: '이모티콘 시트 분리',
    splitChooseTitle: '분할 방식 선택', splitChooseDesc: '시트의 행과 열에 맞는 구성을 선택해 주세요.', splitRows: '행', splitColumns: '열', splitCustom: '직접 설정', splitSelected: '선택한 방식으로 분할', splitGridFailed: '선택한 행·열로 분할하지 못했습니다.',
    qualityFailTitle: '결과 품질을 다시 확인해 주세요', qualityFailDesc: '복잡한 배경이 많이 남아 정확한 투명 PNG로 보기 어렵습니다. 배경이 더 단순한 다른 이미지를 사용하는 것을 권장합니다.', qualityBlocked: '품질 확인 필요',
    qualityWarnTitle: '일부 배경이 남아 있을 수 있어요', qualityWarnDesc: '슬라이더로 원본과 결과를 확인한 뒤 저장해 주세요.',
    precisionRetry: '정밀 재처리', precisionHint: '정밀 처리 실패 시 지원 기기에서는 WebGPU와 고정밀 보조 모델을 자동 사용하며, 모바일·미지원 환경에서는 가벼운 모델로 안전하게 처리합니다. 첫 실행은 모델 파일을 불러와 오래 걸릴 수 있습니다.', precisionWorking: '정밀 모델로 다시 처리하고 있어요…', precisionNoBetter: '정밀 재처리 결과가 현재 결과보다 좋아지지 않아 기존 결과를 유지했습니다.',
    badType: 'PNG, JPG, WEBP 이미지만 사용할 수 있습니다.', tooLarge: '12MB 이하의 이미지를 사용해 주세요.', failed: '배경 제거에 실패했습니다. 브라우저를 새로고침한 뒤 다시 시도해 주세요.'
  },
  en: {
    title: 'Remove Background', badge: 'BETA', desc: 'Remove an image background and save it as a transparent PNG.',
    privacy: 'Your image is processed on this device and is not uploaded to our server.', first: 'Uniform solid-color backgrounds are handled quickly. Complex backgrounds use an AI model, so the first run may take longer.',
    upload: 'Choose an image or drop it here', format: 'PNG · JPG · WEBP / up to 12MB', change: 'Change image',
    sheetUploadHint: 'A 15-emoticon sheet is detected and split automatically after background removal.', sheetSelectedHint: 'If this is a 15-emoticon sheet, it will be split automatically after background removal.',
    remove: 'Remove background', preparing: 'Analyzing image…', processing: 'Removing background…',
    original: 'Original', result: 'Transparent', download: 'Save transparent PNG', again: 'Try another image',
    compareHint: 'Drag the center slider left or right to compare the original and result.',
    transparentAlready: 'A PNG that already has transparency does not need background removal. Please use a PNG, JPG, or WEBP with a background.',
    splitTitle: 'Auto-split 15 emoticons', splitBadge: 'Smart detect',
    splitDesc: 'Detect the actual character and text groups instead of using a fixed grid, then split all 15 emoticons.',
    splitAction: 'Auto-split into 15', splitting: 'Splitting 15 emoticons…',
    splitReady: 'Split complete · Save each emoticon as an individual PNG.',
    splitAgain: 'Split again', splitDownload: 'Save PNG', splitFailed: 'Auto split failed. Process the image again and retry.',
    splitMaybeTitle: 'Is this a 15-emoticon sheet?', splitMaybeDesc: 'The layout is uncertain. If this is an emoticon sheet, you can run the splitter manually.', splitMaybeAction: 'Split emoticon sheet',
    splitChooseTitle: 'Choose a split layout', splitChooseDesc: 'Select the rows and columns that match your sheet.', splitRows: 'Rows', splitColumns: 'Columns', splitCustom: 'Custom', splitSelected: 'Split with this layout', splitGridFailed: 'Could not split with the selected rows and columns.',
    qualityFailTitle: 'Please check the removal result', qualityFailDesc: 'Too much complex background appears to remain for a reliable transparent PNG. Try another image with a simpler background.', qualityBlocked: 'Quality check needed',
    qualityWarnTitle: 'Some background may remain', qualityWarnDesc: 'Compare the original and result with the slider before saving.',
    precisionRetry: 'Precision retry', precisionHint: 'If precision processing needs a fallback, supported devices automatically use WebGPU and a higher-precision backup model; mobile or unsupported environments use the lighter fallback. The first run may take longer while model files load.', precisionWorking: 'Retrying with the precision model…', precisionNoBetter: 'The precision retry was not better, so the current result was kept.',
    badType: 'Please use a PNG, JPG, or WEBP image.', tooLarge: 'Please use an image under 12MB.', failed: 'Background removal failed. Refresh the page and try again.'
  },
  ja: {
    title: '背景を削除', badge: 'BETA', desc: '画像の背景を削除し、透過PNGとして保存できます。',
    privacy: '画像はサーバーへ送信せず、この端末内で処理します。', first: '均一な単色背景は高速処理し、複雑な背景ではAIモデルを使用するため初回は少し時間がかかる場合があります。',
    upload: '画像を選択するか、ここにドロップしてください', format: 'PNG · JPG · WEBP / 最大12MB', change: '画像を変更',
    sheetUploadHint: '15個の絵文字シートは背景削除後に自動検出し、個別に分割します。', sheetSelectedHint: '15個のシートと確認されると、背景削除後に自動分割されます。',
    remove: '背景を削除する', preparing: '画像を解析中…', processing: '背景を削除しています…',
    original: '元画像', result: '透過背景', download: '透過PNGを保存', again: '別の画像',
    compareHint: '中央のスライダーを左右に動かして元画像と結果を比較できます。',
    transparentAlready: 'すでに透過背景のPNGは背景削除の対象ではありません。背景のあるPNG・JPG・WEBPをご利用ください。',
    splitTitle: '15個の絵文字を自動分割', splitBadge: 'スマート検出',
    splitDesc: '固定グリッドではなく実際のキャラクターと文字のまとまりを検出し、15個の絵文字を個別に分割します。',
    splitAction: '15個に自動分割', splitting: '15個の絵文字を分割しています…',
    splitReady: '分割完了 · 各画像を個別PNGとして保存できます。',
    splitAgain: '再分割', splitDownload: 'PNG保存', splitFailed: '自動分割に失敗しました。画像を再処理してお試しください。',
    splitMaybeTitle: '15個の絵文字シートですか？', splitMaybeDesc: '自動判定が確実ではありません。絵文字シートの場合は手動で分割を実行できます。', splitMaybeAction: '絵文字シートを分割',
    splitChooseTitle: '分割方法を選択', splitChooseDesc: 'シートに合う行数と列数を選択してください。', splitRows: '行', splitColumns: '列', splitCustom: '直接設定', splitSelected: '選択した方法で分割', splitGridFailed: '選択した行・列では分割できませんでした。',
    qualityFailTitle: '背景削除結果を確認してください', qualityFailDesc: '複雑な背景が多く残っており、正確な透過PNGとして保存するには不安定です。背景がより単純な別の画像をおすすめします。', qualityBlocked: '品質確認が必要',
    qualityWarnTitle: '背景が一部残っている可能性があります', qualityWarnDesc: 'スライダーで元画像と結果を確認してから保存してください。',
    precisionRetry: '高精度で再処理', precisionHint: '高精度処理のフォールバックが必要な場合、対応端末ではWebGPUと高精度の補助モデルを自動使用し、モバイルや非対応環境では軽量モデルを使用します。初回はモデル読み込みに時間がかかる場合があります。', precisionWorking: '高精度モデルで再処理しています…', precisionNoBetter: '高精度処理でも改善しなかったため、現在の結果を維持しました。',
    badType: 'PNG、JPG、WEBP画像のみ使用できます。', tooLarge: '12MB以下の画像を使用してください。', failed: '背景の削除に失敗しました。ページを再読み込みしてもう一度お試しください。'
  },
  zh: {
    title: '移除背景', badge: 'BETA', desc: '移除图片背景，并保存为透明PNG。',
    privacy: '图片不会上传到服务器，而是在当前设备中处理。', first: '均匀的纯色背景会快速处理；复杂背景会使用AI模型，因此首次使用可能稍慢。',
    upload: '选择图片或将图片拖到这里', format: 'PNG · JPG · WEBP / 最大12MB', change: '更换图片',
    sheetUploadHint: '包含15个表情的图片将在移除背景后自动识别并分别分割。', sheetSelectedHint: '如果识别为15个表情的图片，移除背景后将自动分割。',
    remove: '移除背景', preparing: '正在分析图片…', processing: '正在移除背景…',
    original: '原图', result: '透明背景', download: '保存透明PNG', again: '换一张图片',
    compareHint: '左右拖动中间滑块即可对比原图和处理结果。',
    transparentAlready: '已经带透明背景的PNG无需再次移除背景。请使用带背景的PNG、JPG或WEBP图片。',
    splitTitle: '自动分割15个表情', splitBadge: '智能检测',
    splitDesc: '不再按固定网格切割，而是检测实际角色和文字组合并分别分割15个表情。',
    splitAction: '自动分成15个', splitting: '正在分割15个表情…',
    splitReady: '分割完成 · 可将每个表情单独保存为PNG。',
    splitAgain: '重新分割', splitDownload: '保存PNG', splitFailed: '自动分割失败，请重新处理图片后再试。',
    splitMaybeTitle: '这是15个表情的图片合集吗？', splitMaybeDesc: '自动判断不够确定。如果这是表情合集，可以手动启动分割。', splitMaybeAction: '分割表情合集',
    splitChooseTitle: '选择分割方式', splitChooseDesc: '请选择与图片合集相符的行数和列数。', splitRows: '行', splitColumns: '列', splitCustom: '自定义', splitSelected: '按所选方式分割', splitGridFailed: '无法按所选行列完成分割。',
    qualityFailTitle: '请检查背景移除结果', qualityFailDesc: '复杂背景残留较多，当前结果不适合直接作为可靠的透明PNG保存。建议换用背景更简单的图片。', qualityBlocked: '需要检查质量',
    qualityWarnTitle: '可能仍有部分背景残留', qualityWarnDesc: '请先用滑块对比原图和结果，再决定是否保存。',
    precisionRetry: '高精度重试', precisionHint: '高精度处理需要回退时，支持的设备会自动使用WebGPU和更高精度的备用模型；移动端或不支持的环境会使用轻量备用模型。首次加载模型文件可能较慢。', precisionWorking: '正在使用高精度模型重新处理…', precisionNoBetter: '高精度重试没有改善，因此保留当前结果。',
    badType: '仅支持PNG、JPG、WEBP图片。', tooLarge: '请使用12MB以内的图片。', failed: '背景移除失败。请刷新页面后重试。'
  }
};

const checkerStyle = {
  backgroundColor: '#fff',
  backgroundImage: 'linear-gradient(45deg,#eceae5 25%,transparent 25%),linear-gradient(-45deg,#eceae5 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eceae5 75%),linear-gradient(-45deg,transparent 75%,#eceae5 75%)',
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0,0 10px,10px -10px,-10px 0px'
};

const canvasToPngBlob = (canvas) => new Promise((resolve, reject) => {
  if (!canvas) {
    reject(new Error('Canvas is null'));
    return;
  }
  const fallbackToDataUrl = () => {
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const parts = dataUrl.split(',');
      const byteStr = atob(parts[1]);
      const arr = new Uint8Array(byteStr.length);
      for (let i = 0; i < byteStr.length; i += 1) {
        arr[i] = byteStr.charCodeAt(i);
      }
      resolve(new Blob([arr], { type: 'image/png' }));
    } catch (e) {
      reject(e);
    }
  };

  try {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else fallbackToDataUrl();
    }, 'image/png');
  } catch (_err) {
    fallbackToDataUrl();
  }
});

async function drawFileToCanvas(file) {
  const canvas = document.createElement('canvas');

  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Canvas 2D is unavailable');
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close?.();
      return { canvas, ctx };
    } catch (e) {
      console.warn('createImageBitmap failed, falling back to Image():', e);
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image decode failed'));
      img.src = objectUrl;
    });
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas 2D is unavailable');
    ctx.drawImage(image, 0, 0);
    return { canvas, ctx };
  } finally {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 3000);
  }
}

function colorDistance(a, b) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function sampleBackgroundPatch(data, width, height, startX, startY, sampleSize) {
  const colors = [];
  let r = 0;
  let g = 0;
  let b = 0;

  for (let y = startY; y < Math.min(height, startY + sampleSize); y += 2) {
    for (let x = startX; x < Math.min(width, startX + sampleSize); x += 2) {
      const p = (y * width + x) * 4;
      if (data[p + 3] < 240) continue;
      const color = [data[p], data[p + 1], data[p + 2]];
      colors.push(color);
      r += color[0];
      g += color[1];
      b += color[2];
    }
  }

  if (colors.length < 6) return null;
  const mean = [r / colors.length, g / colors.length, b / colors.length];
  const distances = colors.map((color) => colorDistance(color, mean)).sort((a, b) => a - b);
  const p90 = distances[Math.min(distances.length - 1, Math.floor(distances.length * 0.9))] || 0;
  return { mean, spread: p90, count: colors.length };
}

function estimateUniformEdgeBackground(data, width, height) {
  const sampleSize = Math.max(8, Math.min(30, Math.floor(Math.min(width, height) * 0.025)));
  const half = Math.floor(sampleSize / 2);
  const points = [
    [0, 0],
    [Math.max(0, width - sampleSize), 0],
    [0, Math.max(0, height - sampleSize)],
    [Math.max(0, width - sampleSize), Math.max(0, height - sampleSize)],
    [Math.max(0, Math.floor(width / 2) - half), 0],
    [Math.max(0, Math.floor(width / 2) - half), Math.max(0, height - sampleSize)],
    [0, Math.max(0, Math.floor(height / 2) - half)],
    [Math.max(0, width - sampleSize), Math.max(0, Math.floor(height / 2) - half)]
  ];

  const patches = points
    .map(([x, y]) => sampleBackgroundPatch(data, width, height, x, y, sampleSize))
    .filter((patch) => patch && patch.spread <= 24);

  if (patches.length < 4) return null;

  let bestGroup = [];
  for (const seed of patches) {
    const group = patches.filter((patch) => colorDistance(seed.mean, patch.mean) <= 42);
    if (group.length > bestGroup.length) bestGroup = group;
  }

  if (bestGroup.length < 4) return null;

  const bg = [0, 0, 0];
  let totalWeight = 0;
  for (const patch of bestGroup) {
    const weight = Math.max(1, patch.count);
    bg[0] += patch.mean[0] * weight;
    bg[1] += patch.mean[1] * weight;
    bg[2] += patch.mean[2] * weight;
    totalWeight += weight;
  }
  bg[0] /= totalWeight;
  bg[1] /= totalWeight;
  bg[2] /= totalWeight;

  const groupSpread = Math.max(
    ...bestGroup.map((patch) => Math.max(patch.spread, colorDistance(patch.mean, bg)))
  );
  const tolerance = Math.max(24, Math.min(52, 24 + groupSpread * 1.35));
  return { bg, tolerance };
}

async function tryFastUniformBackgroundRemoval(file) {
  const { canvas, ctx } = await drawFileToCanvas(file);
  const { width, height } = canvas;
  if (!width || !height) return null;

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const estimate = estimateUniformEdgeBackground(pixels, width, height);
  if (!estimate) return null;

  const { bg, tolerance } = estimate;
  const total = width * height;
  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const matchesBackground = (index) => {
    const p = index * 4;
    if (pixels[p + 3] < 16) return true;
    return colorDistance([pixels[p], pixels[p + 1], pixels[p + 2]], bg) <= tolerance;
  };

  const enqueue = (index) => {
    if (index < 0 || index >= total || visited[index] || !matchesBackground(index)) return;
    visited[index] = 1;
    queue[tail++] = index;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }

  while (head < tail) {
    const index = queue[head++];
    const x = index % width;
    const y = Math.floor(index / width);
    pixels[index * 4 + 3] = 0;
    if (x > 0) enqueue(index - 1);
    if (x + 1 < width) enqueue(index + 1);
    if (y > 0) enqueue(index - width);
    if (y + 1 < height) enqueue(index + width);
  }

  // A solid backdrop should occupy a meaningful border-connected area.
  // If too little was removed, fall back to the AI model rather than risk a false positive.
  if (tail < total * 0.06) return null;

  ctx.putImageData(imageData, 0, 0);
  return canvasToPngBlob(canvas);
}

async function getRemover(onProgress) {
  if (!removerPromise) {
    removerPromise = (async () => {
      const { pipeline, RawImage } = await import('@huggingface/transformers');
      const remover = await pipeline('background-removal', 'onnx-community/ormbg-ONNX', {
        device: 'wasm',
        dtype: 'q8',
        progress_callback: (info) => onProgress?.(info)
      });
      return { remover, RawImage };
    })().catch((error) => {
      removerPromise = null;
      throw error;
    });
  }
  return removerPromise;
}

async function getModnetRemover(onProgress) {
  if (!modnetPromise) {
    modnetPromise = (async () => {
      const { pipeline, RawImage } = await import('@huggingface/transformers');
      const remover = await pipeline('background-removal', 'Xenova/modnet', {
        device: 'wasm',
        dtype: 'fp32',
        progress_callback: (info) => onProgress?.(info)
      });
      return { remover, RawImage };
    })().catch((error) => {
      modnetPromise = null;
      throw error;
    });
  }
  return modnetPromise;
}

const BIREFNET_LITE_MODEL = 'onnx-community/BiRefNet_lite-ONNX';
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
}

async function pipelineRemovalToBlob(file, loader, onProgress) {
  const { remover, RawImage } = await loader(onProgress);
  const rawImage = await RawImage.fromBlob(file);
  const output = await remover([rawImage]);
  const image = Array.isArray(output) ? output[0] : output;
  if (image instanceof Blob) return image;
  if (!image?.toBlob) throw new Error('No removable image output');
  const blob = await image.toBlob();
  if (!blob) throw new Error('No output blob');
  return blob;
}

async function removeWithModnet(file, onProgress) {
  return pipelineRemovalToBlob(file, getModnetRemover, onProgress);
}

async function removeWithBiRefNet(file, onProgress) {
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
      console.warn(`BiRefNet precision profile ${profile.key} failed; trying fallback:`, error);
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
}

function qualityRank(quality) {
  if (!quality) return 99;
  const statusBase = quality.status === 'pass' ? 0 : quality.status === 'warning' ? 10 : 20;
  return statusBase + (quality.score || 0);
}

function alphaPercentile(histogram, visibleCount, percentile) {
  if (!visibleCount) return 0;
  const target = Math.max(1, Math.ceil(visibleCount * percentile));
  let seen = 0;
  for (let alpha = 1; alpha <= 255; alpha += 1) {
    seen += histogram[alpha];
    if (seen >= target) return alpha;
  }
  return 255;
}

async function correctUnexpectedForegroundTransparency(blob) {
  const { canvas, ctx } = await drawFileToCanvas(blob);
  const { width, height } = canvas;
  if (!width || !height) return blob;

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const histogram = new Uint32Array(256);
  let visibleCount = 0;

  for (let p = 3; p < pixels.length; p += 4) {
    const alpha = pixels[p];
    if (alpha <= 2) continue;
    histogram[alpha] += 1;
    visibleCount += 1;
  }

  if (visibleCount < width * height * 0.005) return blob;

  const p50 = alphaPercentile(histogram, visibleCount, 0.5);
  const p90 = alphaPercentile(histogram, visibleCount, 0.9);
  const p98 = alphaPercentile(histogram, visibleCount, 0.98);

  // ORMBG can occasionally return a correct mask whose entire foreground alpha
  // is scaled down. Only compensate when the high percentile itself is translucent,
  // so normal antialiased edges and intentional soft boundaries are preserved.
  if (p98 >= 242 || p50 >= 225 || p90 >= 238) return blob;

  const scale = Math.min(3.25, 255 / Math.max(32, p98));
  if (scale <= 1.04) return blob;

  for (let p = 3; p < pixels.length; p += 4) {
    const alpha = pixels[p];
    if (alpha <= 2) continue;
    pixels[p] = Math.min(255, Math.round(alpha * scale));
  }

  ctx.putImageData(imageData, 0, 0);
  return canvasToPngBlob(canvas);
}

async function protectLightForegroundOpacity(blob) {
  const { canvas, ctx } = await drawFileToCanvas(blob);
  const { width, height } = canvas;
  if (!width || !height) return blob;

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const total = width * height;
  const visibleThreshold = 36;
  const confidentThreshold = 220;
  const maxAnalysisDimension = 1200;
  const analysisScale = Math.min(1, maxAnalysisDimension / Math.max(width, height));
  const analysisWidth = Math.max(1, Math.round(width * analysisScale));
  const analysisHeight = Math.max(1, Math.round(height * analysisScale));
  let analysisPixels = pixels;
  if (analysisScale < 1) {
    const analysisCanvas = document.createElement('canvas');
    analysisCanvas.width = analysisWidth;
    analysisCanvas.height = analysisHeight;
    const analysisCtx = analysisCanvas.getContext('2d', { willReadFrequently: true });
    if (!analysisCtx) return blob;
    analysisCtx.imageSmoothingEnabled = true;
    analysisCtx.imageSmoothingQuality = 'high';
    analysisCtx.drawImage(canvas, 0, 0, analysisWidth, analysisHeight);
    analysisPixels = analysisCtx.getImageData(0, 0, analysisWidth, analysisHeight).data;
  }

  const analysisTotal = analysisWidth * analysisHeight;
  const labels = new Int32Array(analysisTotal);
  const queue = new Int32Array(analysisTotal);
  const strongComponents = [false];
  const minimumComponentArea = Math.max(12, Math.round(analysisTotal * 0.00004));
  let label = 0;

  // Label only non-trivial matte components. A light pixel is restored only
  // when it belongs to the same component as confidently opaque foreground.
  // This prevents pale background remnants from being made opaque again.
  for (let seed = 0; seed < analysisTotal; seed += 1) {
    if (labels[seed] || analysisPixels[seed * 4 + 3] < visibleThreshold) continue;
    label += 1;
    let head = 0;
    let tail = 0;
    let area = 0;
    let hasConfidentForeground = false;
    labels[seed] = label;
    queue[tail++] = seed;

    while (head < tail) {
      const index = queue[head++];
      const alpha = analysisPixels[index * 4 + 3];
      area += 1;
      if (alpha >= confidentThreshold) hasConfidentForeground = true;
      const x = index % analysisWidth;
      const y = Math.floor(index / analysisWidth);

      const enqueue = (next) => {
        if (next < 0 || next >= analysisTotal || labels[next] || analysisPixels[next * 4 + 3] < visibleThreshold) return;
        labels[next] = label;
        queue[tail++] = next;
      };
      if (x > 0) enqueue(index - 1);
      if (x + 1 < analysisWidth) enqueue(index + 1);
      if (y > 0) enqueue(index - analysisWidth);
      if (y + 1 < analysisHeight) enqueue(index + analysisWidth);
    }

    strongComponents[label] = hasConfidentForeground && area >= minimumComponentArea;
  }

  let changed = false;
  for (let index = 0; index < total; index += 1) {
    const x = index % width;
    const y = Math.floor(index / width);
    const analysisX = Math.min(analysisWidth - 1, Math.floor(x * analysisWidth / width));
    const analysisY = Math.min(analysisHeight - 1, Math.floor(y * analysisHeight / height));
    const componentLabel = labels[analysisY * analysisWidth + analysisX];
    if (!componentLabel || !strongComponents[componentLabel]) continue;
    const p = index * 4;
    const alpha = pixels[p + 3];
    if (alpha < 56 || alpha >= 248) continue;

    const r = pixels[p];
    const g = pixels[p + 1];
    const b = pixels[p + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const luminance = r * 0.299 + g * 0.587 + b * 0.114;

    // White, ivory, cream, and light beige foreground are the colours most
    // often weakened by a white-background matte. Saturated highlights and
    // intentional translucent effects are left untouched.
    if (luminance < 158 || max - min > 78) continue;

    let touchesTransparency = false;
    let supportingNeighbours = 0;
    for (let dy = -1; dy <= 1; dy += 1) {
      const ny = y + dy;
      if (ny < 0 || ny >= height) continue;
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        if (nx < 0 || nx >= width) continue;
        const neighbourAlpha = pixels[(ny * width + nx) * 4 + 3];
        if (neighbourAlpha <= 14) touchesTransparency = true;
        if (neighbourAlpha >= 96) supportingNeighbours += 1;
      }
    }

    // Preserve the true antialiased outer edge. Only interior matte pixels,
    // supported by surrounding foreground, receive an opacity floor.
    if (touchesTransparency || supportingNeighbours < 4) continue;

    const opacityFloor = alpha < 96 ? 156 : alpha < 160 ? 214 : 242;
    if (alpha < opacityFloor) {
      pixels[p + 3] = opacityFloor;
      changed = true;
    }
  }

  if (!changed) return blob;
  ctx.putImageData(imageData, 0, 0);
  return canvasToPngBlob(canvas);
}

function estimateOpaqueCleanupBackdrop(sourcePixels, resultPixels, width, height) {
  const total = width * height;
  if (!total) return null;

  // A PNG may already be transparent around the stickers while small pieces of the
  // old white/cream backdrop remain trapped inside lettering. In that case the
  // normal edge sampler has no opaque border from which to estimate a backdrop.
  // Find the dominant bright, low-chroma colour touching transparency instead.
  const bins = new Map();
  const searchRadius = Math.max(1, Math.min(4, Math.round(Math.min(width, height) / 420)));

  for (let index = 0; index < total; index += 1) {
    const p = index * 4;
    if (resultPixels[p + 3] < 128 || sourcePixels[p + 3] < 128) continue;

    const r = sourcePixels[p];
    const g = sourcePixels[p + 1];
    const b = sourcePixels[p + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const luminance = r * 0.299 + g * 0.587 + b * 0.114;
    if (luminance < 150 || max - min > 54) continue;

    const x = index % width;
    const y = Math.floor(index / width);
    let nearTransparency = false;
    for (let offset = 1; offset <= searchRadius && !nearTransparency; offset += 1) {
      const neighbours = [
        x >= offset ? index - offset : -1,
        x + offset < width ? index + offset : -1,
        y >= offset ? index - width * offset : -1,
        y + offset < height ? index + width * offset : -1
      ];
      nearTransparency = neighbours.some((next) => next >= 0 && resultPixels[next * 4 + 3] < 36);
    }
    if (!nearTransparency) continue;

    const key = `${r >> 4}:${g >> 4}:${b >> 4}`;
    const bin = bins.get(key) || { count: 0, r: 0, g: 0, b: 0 };
    bin.count += 1;
    bin.r += r;
    bin.g += g;
    bin.b += b;
    bins.set(key, bin);
  }

  let best = null;
  for (const bin of bins.values()) {
    if (!best || bin.count > best.count) best = bin;
  }
  if (!best || best.count < Math.max(18, Math.round(total * 0.00002))) return null;

  return {
    bg: [Math.round(best.r / best.count), Math.round(best.g / best.count), Math.round(best.b / best.count)],
    tolerance: 44
  };
}

async function removeEnclosedBackdropPockets(blob, sourceFile, aggressive = false) {
  try {
    const source = await drawFileToCanvas(sourceFile);
    const result = await drawFileToCanvas(blob);
    const { width, height } = result.canvas;
    if (!width || !height) return blob;

    let sourceCtx = source.ctx;
    if (source.canvas.width !== width || source.canvas.height !== height) {
      const scaled = document.createElement('canvas');
      scaled.width = width;
      scaled.height = height;
      const scaledCtx = scaled.getContext('2d', { willReadFrequently: true });
      if (!scaledCtx) return blob;
      scaledCtx.drawImage(source.canvas, 0, 0, width, height);
      sourceCtx = scaledCtx;
    }

    const resultData = result.ctx.getImageData(0, 0, width, height);
    const sourceData = sourceCtx.getImageData(0, 0, width, height);
    const pixels = resultData.data;
    const original = sourceData.data;
    let estimate = estimateUniformEdgeBackground(original, width, height);
    let usedTransparentFallback = false;
    if (!estimate) {
      estimate = estimateOpaqueCleanupBackdrop(original, pixels, width, height);
      usedTransparentFallback = Boolean(estimate);
    }
    if (!estimate) return blob;

    const { bg, tolerance } = estimate;
    const total = width * height;
    const visited = new Uint8Array(total);
    const queue = new Int32Array(total);
    const sourceTolerance = Math.max(16, Math.min(32, tolerance * 0.62));
    const resultTolerance = Math.max(22, Math.min(42, tolerance * 0.9));
    const boundaryDistance = Math.max(30, tolerance * 1.05);
    const minArea = Math.max(8, Math.round(total * 0.000004));
    const maxArea = Math.max(minArea + 1, Math.round(total * 0.008));
    const maxWidth = Math.max(8, Math.round(width * 0.17));
    const maxHeight = Math.max(8, Math.round(height * 0.14));
    let changed = false;

    const isCandidate = (index) => {
      if (index < 0 || index >= total || visited[index]) return false;
      const p = index * 4;
      if (pixels[p + 3] < 128 || original[p + 3] < 220) return false;
      return (
        colorDistance([original[p], original[p + 1], original[p + 2]], bg) <= sourceTolerance &&
        colorDistance([pixels[p], pixels[p + 1], pixels[p + 2]], bg) <= resultTolerance
      );
    };

    // On an already-transparent PNG, the fallback colour is usually also the
    // sticker's white outline. Skip broad component deletion and only use the
    // much safer, stroke-bracketed text-gap pass below.
    for (let seed = 0; seed < total && !usedTransparentFallback; seed += 1) {
      if (!isCandidate(seed)) continue;

      let head = 0;
      let tail = 0;
      visited[seed] = 1;
      queue[tail++] = seed;
      let area = 0;
      let minX = width;
      let minY = height;
      let maxX = -1;
      let maxY = -1;
      let touchesEdge = false;

      while (head < tail) {
        const index = queue[head++];
        const x = index % width;
        const y = Math.floor(index / width);
        area += 1;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) touchesEdge = true;

        const enqueue = (next) => {
          if (!isCandidate(next)) return;
          visited[next] = 1;
          queue[tail++] = next;
        };
        if (x > 0) enqueue(index - 1);
        if (x + 1 < width) enqueue(index + 1);
        if (y > 0) enqueue(index - width);
        if (y + 1 < height) enqueue(index + width);
      }

      const componentWidth = maxX - minX + 1;
      const componentHeight = maxY - minY + 1;
      if (
        touchesEdge ||
        area < minArea ||
        area > maxArea ||
        componentWidth > maxWidth ||
        componentHeight > maxHeight
      ) continue;

      let boundarySamples = 0;
      let strongBoundarySamples = 0;
      for (let i = 0; i < tail; i += 1) {
        const index = queue[i];
        const x = index % width;
        const y = Math.floor(index / width);
        const neighbours = [];
        if (x > 0) neighbours.push(index - 1);
        if (x + 1 < width) neighbours.push(index + 1);
        if (y > 0) neighbours.push(index - width);
        if (y + 1 < height) neighbours.push(index + width);

        for (const next of neighbours) {
          if (visited[next]) continue;
          const p = next * 4;
          if (pixels[p + 3] < 48) continue;
          boundarySamples += 1;
          if (colorDistance([pixels[p], pixels[p + 1], pixels[p + 2]], bg) >= boundaryDistance) {
            strongBoundarySamples += 1;
          }
        }
      }

      const fillRatio = area / Math.max(1, componentWidth * componentHeight);
      const boundaryRatio = strongBoundarySamples / Math.max(1, boundarySamples);
      const isTrappedBackdrop =
        fillRatio >= 0.16 &&
        boundarySamples >= 6 &&
        boundaryRatio >= 0.68;

      if (!isTrappedBackdrop) continue;
      for (let i = 0; i < tail; i += 1) {
        pixels[queue[i] * 4 + 3] = 0;
      }
      changed = true;
    }

    // Text labels often use a white outline that joins the remaining white gaps into
    // one large component. Detect those glyph gaps separately: a backdrop-coloured
    // pixel is removed when saturated text strokes bracket it horizontally or vertically.
    // Low-saturation boundaries (eyes, skin highlights and white clothing) are excluded.
    const glyphGapMask = new Uint8Array(total);
    const maxGlyphSpan = aggressive ? Math.max(14, Math.min(56, Math.round(Math.min(width, height) * 0.052))) : Math.max(8, Math.min(34, Math.round(Math.min(width, height) * 0.032)));
    const isBackdropPixel = (index) => {
      if (index < 0 || index >= total) return false;
      const p = index * 4;
      if (pixels[p + 3] < 128 || original[p + 3] < 220) return false;
      return (
        colorDistance([original[p], original[p + 1], original[p + 2]], bg) <= sourceTolerance &&
        colorDistance([pixels[p], pixels[p + 1], pixels[p + 2]], bg) <= resultTolerance
      );
    };
    const isSaturatedStroke = (index) => {
      const p = index * 4;
      if (pixels[p + 3] < 96) return false;
      const r = pixels[p];
      const g = pixels[p + 1];
      const b = pixels[p + 2];
      const chroma = Math.max(r, g, b) - Math.min(r, g, b);
      const luminance = r * 0.299 + g * 0.587 + b * 0.114;
      const backgroundLuminance = bg[0] * 0.299 + bg[1] * 0.587 + bg[2] * 0.114;
      const contrast = colorDistance([r, g, b], bg);
      return (
        contrast >= (aggressive ? 34 : Math.max(42, boundaryDistance)) &&
        (chroma >= (aggressive ? 18 : 34) || (aggressive && backgroundLuminance - luminance >= 54))
      );
    };
    const hasStroke = (x, y, dx, dy) => {
      for (let step = 1; step <= maxGlyphSpan; step += 1) {
        const nx = x + dx * step;
        const ny = y + dy * step;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) return false;
        const next = ny * width + nx;
        const p = next * 4;
        if (pixels[p + 3] < 40) return false;
        if (isSaturatedStroke(next)) return true;
        if (!isBackdropPixel(next)) return false;
      }
      return false;
    };

    for (let index = 0; index < total; index += 1) {
      if (!isBackdropPixel(index)) continue;
      const x = index % width;
      const y = Math.floor(index / width);
      const horizontallyBracketed = hasStroke(x, y, -1, 0) && hasStroke(x, y, 1, 0);
      const verticallyBracketed = hasStroke(x, y, 0, -1) && hasStroke(x, y, 0, 1);
      const diagonalDownBracketed = aggressive && hasStroke(x, y, -1, -1) && hasStroke(x, y, 1, 1);
      const diagonalUpBracketed = aggressive && hasStroke(x, y, -1, 1) && hasStroke(x, y, 1, -1);
      if (horizontallyBracketed || verticallyBracketed || diagonalDownBracketed || diagonalUpBracketed) {
        glyphGapMask[index] = 1;
      }
    }

    // Grow confirmed seeds only a few pixels through matching backdrop colour.
    // This clears the full antialiased gap without following that colour around
    // the entire white sticker outline.
    const expansionPasses = aggressive ? 4 : 1;
    for (let pass = 0; pass < expansionPasses; pass += 1) {
      const additions = [];
      for (let index = 0; index < total; index += 1) {
        if (!glyphGapMask[index]) continue;
        const x = index % width;
        const y = Math.floor(index / width);
        const neighbours = [];
        if (x > 0) neighbours.push(index - 1);
        if (x + 1 < width) neighbours.push(index + 1);
        if (y > 0) neighbours.push(index - width);
        if (y + 1 < height) neighbours.push(index + width);
        if (aggressive && x > 0 && y > 0) neighbours.push(index - width - 1);
        if (aggressive && x + 1 < width && y > 0) neighbours.push(index - width + 1);
        if (aggressive && x > 0 && y + 1 < height) neighbours.push(index + width - 1);
        if (aggressive && x + 1 < width && y + 1 < height) neighbours.push(index + width + 1);
        for (const next of neighbours) {
          if (!glyphGapMask[next] && isBackdropPixel(next)) additions.push(next);
        }
      }
      if (!additions.length) break;
      for (const next of additions) glyphGapMask[next] = 2;
    }
    for (let index = 0; index < total; index += 1) {
      if (!glyphGapMask[index]) continue;
      pixels[index * 4 + 3] = 0;
      changed = true;
    }

    if (!changed) return blob;
    result.ctx.putImageData(resultData, 0, 0);
    return await canvasToPngBlob(result.canvas);
  } catch (error) {
    console.warn('Enclosed backdrop cleanup skipped:', error);
    return blob;
  }
}

async function refineHairBackgroundChannels(blob) {
  const { canvas, ctx } = await drawFileToCanvas(blob);
  const { width, height } = canvas;
  if (!width || !height || width < 8 || height < 8) return blob;

  const maxAnalysisDimension = 1200;
  const scale = Math.min(1, maxAnalysisDimension / Math.max(width, height));
  const analysisWidth = Math.max(1, Math.round(width * scale));
  const analysisHeight = Math.max(1, Math.round(height * scale));
  if (analysisWidth < 8 || analysisHeight < 8) return blob;

  const analysisCanvas = document.createElement('canvas');
  analysisCanvas.width = analysisWidth;
  analysisCanvas.height = analysisHeight;
  const analysisCtx = analysisCanvas.getContext('2d', { willReadFrequently: true });
  if (!analysisCtx) return blob;
  analysisCtx.imageSmoothingEnabled = true;
  analysisCtx.imageSmoothingQuality = 'high';
  analysisCtx.drawImage(canvas, 0, 0, analysisWidth, analysisHeight);

  const analysisData = analysisCtx.getImageData(0, 0, analysisWidth, analysisHeight).data;
  const total = analysisWidth * analysisHeight;
  const reachable = new Uint8Array(total);
  const queue = new Int32Array(total);
  const transparentThreshold = 14;
  const weakThreshold = 205;
  const confidentThreshold = 225;
  let head = 0;
  let tail = 0;

  // Start from pixels that the precision matte already considers background,
  // including small transparent holes. Grow only through weak-confidence matte
  // so solid hair, skin and clothing cannot become part of the background path.
  for (let index = 0; index < total; index += 1) {
    if (analysisData[index * 4 + 3] > transparentThreshold) continue;
    reachable[index] = 1;
    queue[tail++] = index;
  }

  const tryReach = (index) => {
    if (index < 0 || index >= total || reachable[index]) return;
    if (analysisData[index * 4 + 3] > weakThreshold) return;
    reachable[index] = 1;
    queue[tail++] = index;
  };

  while (head < tail) {
    const index = queue[head++];
    const x = index % analysisWidth;
    const y = Math.floor(index / analysisWidth);
    if (x > 0) tryReach(index - 1);
    if (x + 1 < analysisWidth) tryReach(index + 1);
    if (y > 0) tryReach(index - analysisWidth);
    if (y + 1 < analysisHeight) tryReach(index + analysisWidth);
  }

  const candidates = new Uint8Array(total);
  const axes = [[1, 0], [0, 1], [1, 1], [1, -1]];
  const searchRadius = 6;
  let candidateCount = 0;

  const hasConfidentPixel = (x, y, dx, dy) => {
    for (let step = 1; step <= searchRadius; step += 1) {
      const nx = x + dx * step;
      const ny = y + dy * step;
      if (nx < 0 || nx >= analysisWidth || ny < 0 || ny >= analysisHeight) break;
      const alpha = analysisData[(ny * analysisWidth + nx) * 4 + 3];
      if (alpha >= confidentThreshold) return true;
    }
    return false;
  };

  for (let y = searchRadius; y < analysisHeight - searchRadius; y += 1) {
    for (let x = searchRadius; x < analysisWidth - searchRadius; x += 1) {
      const index = y * analysisWidth + x;
      if (!reachable[index]) continue;
      const alpha = analysisData[index * 4 + 3];
      if (alpha <= transparentThreshold || alpha > weakThreshold) continue;

      let betweenForeground = false;
      for (const [dx, dy] of axes) {
        if (hasConfidentPixel(x, y, dx, dy) && hasConfidentPixel(x, y, -dx, -dy)) {
          betweenForeground = true;
          break;
        }
      }
      if (!betweenForeground) continue;
      candidates[index] = 1;
      candidateCount += 1;
    }
  }

  if (!candidateCount || candidateCount > total * 0.04) return blob;

  // Expand a detected narrow gap slightly through the same weak background path.
  // This opens the middle of a gap without crossing high-confidence hair strands.
  const refinedMask = candidates.slice();
  const expandRadius = 2;
  for (let y = 0; y < analysisHeight; y += 1) {
    for (let x = 0; x < analysisWidth; x += 1) {
      const index = y * analysisWidth + x;
      if (!candidates[index]) continue;
      for (let dy = -expandRadius; dy <= expandRadius; dy += 1) {
        const ny = y + dy;
        if (ny < 0 || ny >= analysisHeight) continue;
        for (let dx = -expandRadius; dx <= expandRadius; dx += 1) {
          const nx = x + dx;
          if (nx < 0 || nx >= analysisWidth) continue;
          const next = ny * analysisWidth + nx;
          if (!reachable[next]) continue;
          if (analysisData[next * 4 + 3] <= weakThreshold) refinedMask[next] = 1;
        }
      }
    }
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const xScale = analysisWidth / width;
  const yScale = analysisHeight / height;
  let changedPixels = 0;

  for (let y = 0; y < height; y += 1) {
    const ay = Math.min(analysisHeight - 1, Math.floor(y * yScale));
    for (let x = 0; x < width; x += 1) {
      const ax = Math.min(analysisWidth - 1, Math.floor(x * xScale));
      if (!refinedMask[ay * analysisWidth + ax]) continue;
      const p = (y * width + x) * 4;
      const alpha = pixels[p + 3];
      if (alpha <= transparentThreshold || alpha >= 224) continue;

      let nextAlpha = alpha;
      if (alpha < 72) nextAlpha = 0;
      else if (alpha < 130) nextAlpha = Math.round(alpha * 0.35);
      else if (alpha < 180) nextAlpha = Math.round(alpha * 0.55);
      else nextAlpha = Math.round(alpha * 0.72);

      if (nextAlpha === alpha) continue;
      pixels[p + 3] = nextAlpha;
      changedPixels += 1;
    }
  }

  if (!changedPixels) return blob;
  ctx.putImageData(imageData, 0, 0);
  return canvasToPngBlob(canvas);
}

async function refinePrecisionEdges(blob) {
  const { canvas, ctx } = await drawFileToCanvas(blob);
  const { width, height } = canvas;
  if (!width || !height || width < 5 || height < 5) return blob;

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const source = new Uint8ClampedArray(pixels);
  const neighborOffsets = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [1, -1], [-1, 1], [1, 1],
    [-2, 0], [2, 0], [0, -2], [0, 2],
    [-2, -1], [2, -1], [-2, 1], [2, 1],
    [-1, -2], [1, -2], [-1, 2], [1, 2]
  ];
  let changedPixels = 0;

  for (let y = 2; y < height - 2; y += 1) {
    for (let x = 2; x < width - 2; x += 1) {
      const p = (y * width + x) * 4;
      const alpha = source[p + 3];
      if (alpha <= 0 || alpha >= 238) continue;

      let transparentNearby = false;
      let r = 0;
      let g = 0;
      let b = 0;
      let confidentCount = 0;

      for (const [dx, dy] of neighborOffsets) {
        const np = ((y + dy) * width + (x + dx)) * 4;
        const neighborAlpha = source[np + 3];
        if (neighborAlpha <= 14) transparentNearby = true;
        if (neighborAlpha >= 232) {
          r += source[np];
          g += source[np + 1];
          b += source[np + 2];
          confidentCount += 1;
        }
      }

      // Only touch the actual matte boundary. Semi-transparent details inside
      // the subject are preserved even if their alpha happens to be similar.
      if (!transparentNearby) continue;

      let nextAlpha = alpha;
      if (alpha < 22) nextAlpha = 0;
      else if (alpha < 64) nextAlpha = Math.round(alpha * 0.48);
      else if (alpha < 118) nextAlpha = Math.round(alpha * 0.72);
      else if (alpha < 170) nextAlpha = Math.round(alpha * 0.88);
      else nextAlpha = Math.round(alpha * 0.96);

      if (nextAlpha !== alpha) {
        pixels[p + 3] = nextAlpha;
        changedPixels += 1;
      }

      // Pull contaminated edge colors toward nearby confident foreground pixels.
      // This reduces faint skin/hair colors from a person standing behind the
      // subject without blurring the solid face, hair or clothing interior.
      if (nextAlpha > 0 && confidentCount > 0) {
        const mix = alpha < 118 ? 0.34 : alpha < 170 ? 0.22 : 0.12;
        pixels[p] = Math.round(source[p] * (1 - mix) + (r / confidentCount) * mix);
        pixels[p + 1] = Math.round(source[p + 1] * (1 - mix) + (g / confidentCount) * mix);
        pixels[p + 2] = Math.round(source[p + 2] * (1 - mix) + (b / confidentCount) * mix);
        changedPixels += 1;
      }
    }
  }

  if (!changedPixels) return blob;
  ctx.putImageData(imageData, 0, 0);
  return canvasToPngBlob(canvas);
}

function analyzeAlphaComponents(ctx, width, height, alphaThreshold = 36) {
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const total = width * height;
  const labels = new Int32Array(total);
  const queue = new Int32Array(total);
  const components = [];
  let nextLabel = 0;

  const visible = (index) => pixels[index * 4 + 3] >= alphaThreshold;

  for (let seed = 0; seed < total; seed += 1) {
    if (labels[seed] || !visible(seed)) continue;
    nextLabel += 1;
    let head = 0;
    let tail = 0;
    queue[tail++] = seed;
    labels[seed] = nextLabel;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    let area = 0;

    while (head < tail) {
      const index = queue[head++];
      const x = index % width;
      const y = Math.floor(index / width);
      area += 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      if (x > 0) {
        const next = index - 1;
        if (!labels[next] && visible(next)) {
          labels[next] = nextLabel;
          queue[tail++] = next;
        }
      }
      if (x + 1 < width) {
        const next = index + 1;
        if (!labels[next] && visible(next)) {
          labels[next] = nextLabel;
          queue[tail++] = next;
        }
      }
      if (y > 0) {
        const next = index - width;
        if (!labels[next] && visible(next)) {
          labels[next] = nextLabel;
          queue[tail++] = next;
        }
      }
      if (y + 1 < height) {
        const next = index + width;
        if (!labels[next] && visible(next)) {
          labels[next] = nextLabel;
          queue[tail++] = next;
        }
      }
    }

    components.push({
      label: nextLabel,
      area,
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2
    });
  }

  return { pixels, labels, components };
}

function componentGap(a, b) {
  const dx = Math.max(a.minX - b.maxX, b.minX - a.maxX, 0);
  const dy = Math.max(a.minY - b.maxY, b.minY - a.maxY, 0);
  return Math.hypot(dx, dy);
}

async function cleanAiForegroundArtifacts(blob) {
  const { canvas, ctx } = await drawFileToCanvas(blob);
  const { width, height } = canvas;
  if (!width || !height) return blob;

  // Detect disconnected remnants on a bounded preview. The full-resolution
  // image is only touched once after the keep-mask is decided, which keeps
  // memory use reasonable on phones.
  const maxAnalysisDimension = 960;
  const scale = Math.min(1, maxAnalysisDimension / Math.max(width, height));
  const analysisWidth = Math.max(1, Math.round(width * scale));
  const analysisHeight = Math.max(1, Math.round(height * scale));
  const analysisCanvas = document.createElement('canvas');
  analysisCanvas.width = analysisWidth;
  analysisCanvas.height = analysisHeight;
  const analysisCtx = analysisCanvas.getContext('2d', { willReadFrequently: true });
  if (!analysisCtx) return blob;
  analysisCtx.imageSmoothingEnabled = true;
  analysisCtx.imageSmoothingQuality = 'high';
  analysisCtx.drawImage(canvas, 0, 0, analysisWidth, analysisHeight);

  const { labels, components } = analyzeAlphaComponents(analysisCtx, analysisWidth, analysisHeight, 36);
  if (!components.length) return blob;

  const ranked = [...components].sort((a, b) => b.area - a.area);
  const visibleArea = ranked.reduce((sum, item) => sum + item.area, 0);
  const largest = ranked[0];
  const largestShare = largest.area / Math.max(1, visibleArea);
  const topFiveShare = ranked.slice(0, 5).reduce((sum, item) => sum + item.area, 0) / Math.max(1, visibleArea);

  // A 15-sticker sheet has many similarly sized foreground islands. Skip this
  // cleanup unless a few dominant subjects account for most visible pixels.
  // This still supports two or three people because several large components
  // can be retained at the same time.
  const photoLikeForeground = largestShare >= 0.30 || topFiveShare >= 0.72;
  if (!photoLikeForeground) return blob;

  const analysisTotal = analysisWidth * analysisHeight;
  const majorMinArea = Math.max(analysisTotal * 0.0025, largest.area * 0.075);
  const keepLabels = new Set([largest.label]);
  const keptComponents = [largest];

  for (const component of ranked.slice(1)) {
    if (component.area < majorMinArea) continue;
    const fillRatio = component.area / Math.max(1, component.width * component.height);
    const aspect = Math.max(component.width / Math.max(1, component.height), component.height / Math.max(1, component.width));
    const touchesLeft = component.minX <= 2;
    const touchesRight = component.maxX >= analysisWidth - 3;
    const touchesTop = component.minY <= 2;
    const touchesBottom = component.maxY >= analysisHeight - 3;
    const edgeCount = Number(touchesLeft) + Number(touchesRight) + Number(touchesTop) + Number(touchesBottom);

    // Typical ORMBG leftovers are wall/sign/ceiling fragments attached to the
    // outer frame. Do not discard a sizeable second/third person merely for
    // being near one edge; only reject strongly background-like edge shapes.
    const suspiciousEdgeFragment =
      (edgeCount >= 2 && component.area < largest.area * 0.62) ||
      (((touchesLeft || touchesRight || touchesTop) && !touchesBottom) &&
        component.area < largest.area * 0.28 &&
        (fillRatio < 0.48 || aspect > 2.7));

    if (suspiciousEdgeFragment) continue;
    keepLabels.add(component.label);
    keptComponents.push(component);
  }

  // Preserve disconnected hands, hair wisps and accessories close to a kept
  // person, while still dropping distant text/sign fragments.
  const satelliteMinArea = Math.max(analysisTotal * 0.00012, largest.area * 0.0035);
  const satelliteMaxGap = Math.max(4, Math.max(analysisWidth, analysisHeight) * 0.026);
  for (const component of ranked) {
    if (keepLabels.has(component.label) || component.area < satelliteMinArea) continue;
    if (keptComponents.some((kept) => componentGap(component, kept) <= satelliteMaxGap)) {
      keepLabels.add(component.label);
    }
  }

  const keepMask = new Uint8Array(analysisTotal);
  for (let i = 0; i < labels.length; i += 1) {
    if (keepLabels.has(labels[i])) keepMask[i] = 1;
  }

  // Expand the keep mask slightly so antialiased hair/clothing edges survive.
  const expandedMask = keepMask.slice();
  const radius = 2;
  for (let y = 0; y < analysisHeight; y += 1) {
    for (let x = 0; x < analysisWidth; x += 1) {
      const index = y * analysisWidth + x;
      if (!keepMask[index]) continue;
      for (let dy = -radius; dy <= radius; dy += 1) {
        const ny = y + dy;
        if (ny < 0 || ny >= analysisHeight) continue;
        for (let dx = -radius; dx <= radius; dx += 1) {
          const nx = x + dx;
          if (nx < 0 || nx >= analysisWidth) continue;
          expandedMask[ny * analysisWidth + nx] = 1;
        }
      }
    }
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const xScale = analysisWidth / width;
  const yScale = analysisHeight / height;
  let removedPixels = 0;

  for (let y = 0; y < height; y += 1) {
    const ay = Math.min(analysisHeight - 1, Math.floor(y * yScale));
    for (let x = 0; x < width; x += 1) {
      const ax = Math.min(analysisWidth - 1, Math.floor(x * xScale));
      const p = (y * width + x) * 4;
      const alpha = pixels[p + 3];
      if (!alpha) continue;

      if (!expandedMask[ay * analysisWidth + ax]) {
        pixels[p + 3] = 0;
        removedPixels += 1;
        continue;
      }

      // Tighten only weak matte pixels. Strong hair/skin/clothing alpha stays
      // untouched; faint white/gray halos become less visible.
      if (alpha < 16) pixels[p + 3] = 0;
      else if (alpha < 72) pixels[p + 3] = Math.round(alpha * 0.68);
      else if (alpha < 132) pixels[p + 3] = Math.round(alpha * 0.90);
    }
  }

  // Very small cleanups are mostly antialias noise; avoid an unnecessary
  // re-encode unless the mask actually removed something meaningful.
  if (removedPixels < width * height * 0.00008) return blob;

  // Reduce bright fringe color using adjacent confident foreground colors.
  // This is deliberately one-pixel and conservative so facial detail is not
  // blurred and multiple people remain independent.
  const neighborOffsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const p = (y * width + x) * 4;
      const alpha = pixels[p + 3];
      if (alpha < 32 || alpha > 218) continue;
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;
      for (const [dx, dy] of neighborOffsets) {
        const np = ((y + dy) * width + (x + dx)) * 4;
        if (pixels[np + 3] < 238) continue;
        r += pixels[np];
        g += pixels[np + 1];
        b += pixels[np + 2];
        count += 1;
      }
      if (!count) continue;
      const mix = Math.min(0.42, ((218 - alpha) / 186) * 0.42);
      pixels[p] = Math.round(pixels[p] * (1 - mix) + (r / count) * mix);
      pixels[p + 1] = Math.round(pixels[p + 1] * (1 - mix) + (g / count) * mix);
      pixels[p + 2] = Math.round(pixels[p + 2] * (1 - mix) + (b / count) * mix);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvasToPngBlob(canvas);
}

async function assessRemovalQuality(blob) {
  const { canvas } = await drawFileToCanvas(blob);
  const { width, height } = canvas;
  if (!width || !height) return { status: 'warning', score: 2 };

  const maxDimension = 720;
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const analysisWidth = Math.max(1, Math.round(width * scale));
  const analysisHeight = Math.max(1, Math.round(height * scale));
  const analysisCanvas = document.createElement('canvas');
  analysisCanvas.width = analysisWidth;
  analysisCanvas.height = analysisHeight;
  const ctx = analysisCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { status: 'warning', score: 2 };
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, analysisWidth, analysisHeight);

  const imageData = ctx.getImageData(0, 0, analysisWidth, analysisHeight);
  const pixels = imageData.data;
  const total = analysisWidth * analysisHeight;
  const threshold = 36;
  let visible = 0;
  let solid = 0;

  const bandX = Math.max(2, Math.round(analysisWidth * 0.035));
  const bandY = Math.max(2, Math.round(analysisHeight * 0.035));
  let topVisible = 0;
  let bottomVisible = 0;
  let leftVisible = 0;
  let rightVisible = 0;
  let topLeftCornerVisible = 0;
  let topRightCornerVisible = 0;
  let upperLeftSideVisible = 0;
  let upperRightSideVisible = 0;
  const cornerWidth = Math.max(3, Math.round(analysisWidth * 0.18));
  const cornerHeight = Math.max(3, Math.round(analysisHeight * 0.16));
  const upperSideHeight = Math.max(3, Math.round(analysisHeight * 0.62));

  for (let y = 0; y < analysisHeight; y += 1) {
    for (let x = 0; x < analysisWidth; x += 1) {
      const alpha = pixels[(y * analysisWidth + x) * 4 + 3];
      if (alpha < threshold) continue;
      visible += 1;
      if (alpha >= 180) solid += 1;
      if (y < bandY) topVisible += 1;
      if (y >= analysisHeight - bandY) bottomVisible += 1;
      if (x < bandX) leftVisible += 1;
      if (x >= analysisWidth - bandX) rightVisible += 1;
      if (x < cornerWidth && y < cornerHeight) topLeftCornerVisible += 1;
      if (x >= analysisWidth - cornerWidth && y < cornerHeight) topRightCornerVisible += 1;
      if (x < bandX && y < upperSideHeight) upperLeftSideVisible += 1;
      if (x >= analysisWidth - bandX && y < upperSideHeight) upperRightSideVisible += 1;
    }
  }

  const visibleRatio = visible / Math.max(1, total);
  if (visibleRatio < 0.01) return { status: 'fail', score: 5 };

  const topEdge = topVisible / Math.max(1, analysisWidth * bandY);
  const bottomEdge = bottomVisible / Math.max(1, analysisWidth * bandY);
  const leftEdge = leftVisible / Math.max(1, analysisHeight * bandX);
  const rightEdge = rightVisible / Math.max(1, analysisHeight * bandX);
  const topLeftCorner = topLeftCornerVisible / Math.max(1, cornerWidth * cornerHeight);
  const topRightCorner = topRightCornerVisible / Math.max(1, cornerWidth * cornerHeight);
  const upperLeftSide = upperLeftSideVisible / Math.max(1, bandX * upperSideHeight);
  const upperRightSide = upperRightSideVisible / Math.max(1, bandX * upperSideHeight);

  const { components } = analyzeAlphaComponents(ctx, analysisWidth, analysisHeight, threshold);
  const sheetCheck = classifyEmoticonSheetComponents(components, analysisWidth, analysisHeight);
  if (sheetCheck.status === 'sheet') return { status: 'pass', score: 0 };

  const ranked = [...components].sort((a, b) => b.area - a.area);
  const largest = ranked[0];
  const major = ranked.filter((item) => item.area >= total * 0.018);
  let suspiciousDetachedArea = 0;

  for (const component of major.slice(1)) {
    const touchesTop = component.minY <= 2;
    const touchesLeft = component.minX <= 2;
    const touchesRight = component.maxX >= analysisWidth - 3;
    const touchesBottom = component.maxY >= analysisHeight - 3;
    const edgeAttached = touchesTop || touchesLeft || touchesRight;
    const fillRatio = component.area / Math.max(1, component.width * component.height);
    const aspect = Math.max(component.width / Math.max(1, component.height), component.height / Math.max(1, component.width));
    if (edgeAttached && !touchesBottom && (fillRatio < 0.52 || aspect > 2.1)) suspiciousDetachedArea += component.area;
  }

  const suspiciousDetachedRatio = suspiciousDetachedArea / Math.max(1, total);
  const largestWidthRatio = largest ? largest.width / analysisWidth : 0;
  const largestHeightRatio = largest ? largest.height / analysisHeight : 0;
  const largestTouchesTop = largest ? largest.minY <= 2 : false;
  const largestTouchesSide = largest ? (largest.minX <= 2 || largest.maxX >= analysisWidth - 3) : false;

  let score = 0;
  if (visibleRatio > 0.78) score += 4;
  else if (visibleRatio > 0.67) score += 2;
  else if (visibleRatio > 0.58) score += 1;

  if (topEdge > 0.42 && Math.max(leftEdge, rightEdge) > 0.32) score += 2;
  else if (topEdge > 0.30 && Math.max(leftEdge, rightEdge) > 0.24) score += 1;

  if (leftEdge > 0.58 && rightEdge > 0.58 && visibleRatio > 0.48) score += 2;

  // Complex indoor failures often leave large ceiling/signboard regions in both
  // upper corners even though the center subject was isolated. A legitimate
  // close-up may touch the frame too, so only treat this as strong contamination
  // when the overall foreground is not already filling nearly the whole image.
  const bothUpperCornersContaminated =
    topLeftCorner > 0.24 &&
    topRightCorner > 0.24 &&
    topEdge > 0.20 &&
    visibleRatio > 0.24 &&
    visibleRatio < 0.78;
  if (bothUpperCornersContaminated) score += 4;

  // Softer upper-frame signals are intentionally warning-grade. They make
  // ORMBG compare against MODNet without immediately blocking a legitimate
  // close-up or group photo that happens to touch one edge.
  const softBothUpperCorners =
    topLeftCorner > 0.16 &&
    topRightCorner > 0.16 &&
    topEdge > 0.13 &&
    visibleRatio > 0.20 &&
    visibleRatio < 0.82;
  if (!bothUpperCornersContaminated && softBothUpperCorners) score += 2;

  const leftUpperFrameContaminated =
    topLeftCorner > 0.42 && upperLeftSide > 0.30 && topEdge > 0.16 && visibleRatio < 0.78;
  const rightUpperFrameContaminated =
    topRightCorner > 0.42 && upperRightSide > 0.30 && topEdge > 0.16 && visibleRatio < 0.78;
  if (leftUpperFrameContaminated) score += 2;
  if (rightUpperFrameContaminated) score += 2;

  const softLeftUpperFrame =
    topLeftCorner > 0.30 && upperLeftSide > 0.22 && topEdge > 0.11 && visibleRatio < 0.82;
  const softRightUpperFrame =
    topRightCorner > 0.30 && upperRightSide > 0.22 && topEdge > 0.11 && visibleRatio < 0.82;
  if (!leftUpperFrameContaminated && softLeftUpperFrame) score += 1;
  if (!rightUpperFrameContaminated && softRightUpperFrame) score += 1;

  const broadUpperFrameContamination =
    topEdge > 0.24 && leftEdge > 0.18 && rightEdge > 0.18 && visibleRatio > 0.30 && visibleRatio < 0.78;
  if (broadUpperFrameContamination) score += 3;

  if (suspiciousDetachedRatio > 0.12) score += 2;
  else if (suspiciousDetachedRatio > 0.065) score += 1;

  if (largest && largestWidthRatio > 0.90 && largestHeightRatio > 0.72 && largestTouchesTop && largestTouchesSide && visibleRatio > 0.46) score += 2;

  // Bottom contact is common for a correctly isolated person or group. Reward it
  // slightly so normal full-body/upper-body photos are less likely to be blocked.
  if (bottomEdge > 0.28 && topEdge < 0.24 && visibleRatio < 0.66) score = Math.max(0, score - 1);

  // A solid foreground is expected; this metric is only diagnostic for future tuning.
  const solidRatio = solid / Math.max(1, visible);
  if (solidRatio < 0.26 && visibleRatio > 0.44) score += 1;

  // Two independent strong upper-frame signals are enough to block saving even
  // when the foreground component graph is connected by thin alpha bridges.
  if ((bothUpperCornersContaminated && (leftUpperFrameContaminated || rightUpperFrameContaminated)) ||
      (broadUpperFrameContamination && (topLeftCorner > 0.42 || topRightCorner > 0.42))) {
    score = Math.max(score, 5);
  }

  if (score >= 4) return { status: 'fail', score };
  if (score >= 2) return { status: 'warning', score };
  return { status: 'pass', score };
}

async function removeWithAi(file, onProgress) {
  const blob = await pipelineRemovalToBlob(file, getRemover, onProgress);
  const corrected = await correctUnexpectedForegroundTransparency(blob);
  return cleanAiForegroundArtifacts(corrected);
}

function extractConnectedComponents(ctx, width, height) {
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const total = width * height;
  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);
  const components = [];
  const minPixels = Math.max(8, Math.round(total * 0.000004));

  const isVisible = (index) => pixels[index * 4 + 3] > 18;
  const enqueue = (index, state) => {
    if (index < 0 || index >= total || visited[index] || !isVisible(index)) return;
    visited[index] = 1;
    queue[state.tail++] = index;
  };

  for (let seed = 0; seed < total; seed += 1) {
    if (visited[seed] || !isVisible(seed)) continue;

    const state = { head: 0, tail: 0 };
    enqueue(seed, state);
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    let area = 0;

    while (state.head < state.tail) {
      const index = queue[state.head++];
      const x = index % width;
      const y = Math.floor(index / width);
      area += 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      if (x > 0) enqueue(index - 1, state);
      if (x + 1 < width) enqueue(index + 1, state);
      if (y > 0) enqueue(index - width, state);
      if (y + 1 < height) enqueue(index + width, state);
    }

    if (area < minPixels || maxX < minX || maxY < minY) continue;
    components.push({
      id: components.length + 1,
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
      area,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2
    });
  }

  return components;
}

function orderPrimaryStickerComponents(components, width, height) {
  if (components.length < 15) throw new Error('Not enough visible sticker components');

  const expectedCellWidth = width / 5;
  const expectedCellHeight = height / 3;
  const score = (component) => {
    const heightBoost = 0.65 + Math.min(1.4, component.height / Math.max(1, height * 0.12));
    return component.area * heightBoost;
  };

  const ranked = [...components].sort((a, b) => score(b) - score(a));
  const selected = [];

  for (const candidate of ranked) {
    const tooClose = selected.some((picked) => {
      const dx = (candidate.centerX - picked.centerX) / expectedCellWidth;
      const dy = (candidate.centerY - picked.centerY) / expectedCellHeight;
      return Math.hypot(dx, dy) < 0.45;
    });
    if (!tooClose) selected.push(candidate);
    if (selected.length === 15) break;
  }

  if (selected.length < 15) {
    for (const candidate of ranked) {
      if (!selected.includes(candidate)) selected.push(candidate);
      if (selected.length === 15) break;
    }
  }

  const byY = selected.slice(0, 15).sort((a, b) => a.centerY - b.centerY);
  const ordered = [];
  for (let row = 0; row < 3; row += 1) {
    const rowItems = byY.slice(row * 5, row * 5 + 5).sort((a, b) => a.centerX - b.centerX);
    ordered.push(...rowItems);
  }
  return ordered;
}

function assignComponentsToStickers(components, primaries, width, height) {
  const expectedCellWidth = width / 5;
  const expectedVerticalGap = (height / 3) * 0.43;
  const primaryIds = new Set(primaries.map((item) => item.id));
  const groups = new Map(primaries.map((item) => [item.id, [item]]));

  for (const component of components) {
    if (primaryIds.has(component.id)) continue;

    let bestPrimary = null;
    let bestScore = Number.POSITIVE_INFINITY;

    for (const primary of primaries) {
      const dx = Math.max(primary.minX - component.maxX, component.minX - primary.maxX, 0);
      const dy = Math.max(primary.minY - component.maxY, component.minY - primary.maxY, 0);
      const centerDx = component.centerX - primary.centerX;
      const centerDy = component.centerY - primary.centerY;
      const distanceScore =
        (dx / expectedCellWidth) ** 2 +
        (dy / expectedVerticalGap) ** 2 +
        0.04 * (centerDx / expectedCellWidth) ** 2 +
        0.02 * (centerDy / expectedVerticalGap) ** 2;

      if (distanceScore < bestScore) {
        bestScore = distanceScore;
        bestPrimary = primary;
      }
    }

    if (bestPrimary && bestScore < 2.2) groups.get(bestPrimary.id).push(component);
  }

  return groups;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function classifyEmoticonSheetComponents(components, width, height) {
  const total = width * height;
  if (!total || components.length < 10) return { status: 'not-sheet', confidence: 0 };

  // A sticker-sheet primary is substantial but still much smaller than the full image.
  // This excludes faces/bodies in ordinary group photos while filtering tiny text/noise fragments.
  const candidates = components.filter((component) => {
    const areaRatio = component.area / total;
    const fillRatio = component.area / Math.max(1, component.width * component.height);
    return (
      areaRatio >= 0.0015 &&
      component.width >= width * 0.045 &&
      component.width <= width * 0.34 &&
      component.height >= height * 0.065 &&
      component.height <= height * 0.34 &&
      fillRatio >= 0.055
    );
  });

  if (candidates.length < 10) return { status: 'not-sheet', confidence: 0.08 };

  const expectedCellWidth = width / 5;
  const expectedCellHeight = height / 3;
  const ranked = [...candidates].sort((a, b) => {
    const aFill = a.area / Math.max(1, a.width * a.height);
    const bFill = b.area / Math.max(1, b.width * b.height);
    return b.area * (0.82 + Math.min(0.6, bFill)) - a.area * (0.82 + Math.min(0.6, aFill));
  });

  const selected = [];
  for (const candidate of ranked) {
    const tooClose = selected.some((picked) => {
      const dx = (candidate.centerX - picked.centerX) / expectedCellWidth;
      const dy = (candidate.centerY - picked.centerY) / expectedCellHeight;
      return Math.hypot(dx, dy) < 0.43;
    });
    if (!tooClose) selected.push(candidate);
    if (selected.length === 15) break;
  }

  if (selected.length < 13) return { status: 'not-sheet', confidence: 0.22 };
  if (selected.length < 15) return { status: 'ambiguous', confidence: 0.52 };

  const byY = selected.slice(0, 15).sort((a, b) => a.centerY - b.centerY);
  const rows = [0, 1, 2].map((row) => byY.slice(row * 5, row * 5 + 5).sort((a, b) => a.centerX - b.centerX));
  const rowMeans = rows.map((row) => row.reduce((sum, item) => sum + item.centerY, 0) / row.length);
  const rowSpreads = rows.map((row) => (Math.max(...row.map((item) => item.centerY)) - Math.min(...row.map((item) => item.centerY))) / height);
  const rowGaps = [rowMeans[1] - rowMeans[0], rowMeans[2] - rowMeans[1]].map((gap) => gap / height);

  const xCenters = selected.map((item) => item.centerX);
  const yCenters = selected.map((item) => item.centerY);
  const xCoverage = (Math.max(...xCenters) - Math.min(...xCenters)) / width;
  const yCoverage = (Math.max(...yCenters) - Math.min(...yCenters)) / height;
  const averageRowSpread = rowSpreads.reduce((sum, value) => sum + value, 0) / rowSpreads.length;
  const minRowGap = Math.min(...rowGaps);
  const edgeRows = rows.filter((row) => row[0].centerX / width < 0.29 && row[4].centerX / width > 0.71).length;

  const columnDrifts = [0, 1, 2, 3, 4].map((column) => {
    const centers = rows.map((row) => row[column].centerX);
    return (Math.max(...centers) - Math.min(...centers)) / width;
  });
  const averageColumnDrift = columnDrifts.reduce((sum, value) => sum + value, 0) / columnDrifts.length;

  const medianWidth = median(selected.map((item) => item.width / width));
  const medianHeight = median(selected.map((item) => item.height / height));

  let confidence = 0.15; // fifteen separated primary candidates were found
  if (xCoverage >= 0.62) confidence += 0.15;
  if (yCoverage >= 0.44) confidence += 0.15;
  if (averageRowSpread <= 0.13) confidence += 0.15;
  if (minRowGap >= 0.17) confidence += 0.12;
  if (edgeRows >= 2) confidence += 0.12;
  if (averageColumnDrift <= 0.12) confidence += 0.10;
  if (medianWidth >= 0.055 && medianWidth <= 0.25 && medianHeight >= 0.08 && medianHeight <= 0.29) confidence += 0.06;

  if (confidence >= 0.78) return { status: 'sheet', confidence };
  if (confidence >= 0.58) return { status: 'ambiguous', confidence };
  return { status: 'not-sheet', confidence };
}

async function detectEmoticonSheet(blob) {
  const { canvas } = await drawFileToCanvas(blob);
  const { width, height } = canvas;
  if (!width || !height) return { status: 'not-sheet', confidence: 0 };

  // Layout detection does not need full-resolution pixels. Analyze a bounded
  // preview so high-resolution phone photos do not allocate a huge BFS queue.
  const maxDimension = 900;
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const analysisWidth = Math.max(1, Math.round(width * scale));
  const analysisHeight = Math.max(1, Math.round(height * scale));
  const analysisCanvas = document.createElement('canvas');
  analysisCanvas.width = analysisWidth;
  analysisCanvas.height = analysisHeight;
  const analysisCtx = analysisCanvas.getContext('2d', { willReadFrequently: true });
  if (!analysisCtx) return { status: 'not-sheet', confidence: 0 };
  analysisCtx.imageSmoothingEnabled = true;
  analysisCtx.imageSmoothingQuality = 'high';
  analysisCtx.drawImage(canvas, 0, 0, analysisWidth, analysisHeight);

  const components = extractConnectedComponents(analysisCtx, analysisWidth, analysisHeight);
  return classifyEmoticonSheetComponents(components, analysisWidth, analysisHeight);
}

async function splitIntoFifteen(input) {
  let canvas, ctx;
  if (input && typeof input.getContext === 'function') {
    canvas = input;
    ctx = canvas.getContext('2d', { willReadFrequently: true });
  } else {
    const drawn = await drawFileToCanvas(input);
    canvas = drawn.canvas;
    ctx = drawn.ctx;
  }
  const { width, height } = canvas;
  if (!width || !height) throw new Error('Invalid canvas dimensions');

  const rows = 3;
  const columns = 5;
  const cellW = width / columns;
  const cellH = height / rows;
  const padding = Math.max(6, Math.round(Math.min(cellW, cellH) * 0.045));

  // 1. 전체 이미지의 알파 픽셀 데이터를 단 한 번만 읽어옴 (초고속 성능 & 메모리 최적화)
  const fullImageData = ctx.getImageData(0, 0, width, height);
  const data = fullImageData.data;

  const items = [];

  // 2. 15개 셀(3행 5열) 순서대로 정밀 Bounding Box 스캔
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < columns; c += 1) {
      const cellLeft = Math.floor(c * cellW);
      const cellTop = Math.floor(r * cellH);
      const cellRight = Math.min(width, Math.ceil((c + 1) * cellW));
      const cellBottom = Math.min(height, Math.ceil((r + 1) * cellH));

      let minX = cellRight;
      let minY = cellBottom;
      let maxX = cellLeft - 1;
      let maxY = cellTop - 1;
      let hasPixels = false;

      // 해당 셀 구역 내부의 모든 유효 픽셀(캐릭터 본체 + 한글/영문 텍스트 + 말풍선 + 하트/별 효과선 등 일체)을 탐색
      for (let y = cellTop; y < cellBottom; y += 1) {
        const rowOffset = y * width * 4;
        for (let x = cellLeft; x < cellRight; x += 1) {
          const alpha = data[rowOffset + x * 4 + 3];
          // Splitting never changes alpha. Include faint antialiased pixels in
          // the crop bounds so pale lettering and beige edges are not clipped.
          if (alpha > 8) {
            hasPixels = true;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      // 3. 정밀 바운딩 박스 결정 (타이트 크롭 + 자연스러운 여백 패딩)
      let cropX, cropY, cropW, cropH;
      if (hasPixels && minX <= maxX && minY <= maxY) {
        // 인접 셀을 침범하지 않는 선에서 최대 패딩 적용
        const absMinX = Math.max(cellLeft, minX - padding);
        const absMinY = Math.max(cellTop, minY - padding);
        const absMaxX = Math.min(cellRight, maxX + 1 + padding);
        const absMaxY = Math.min(cellBottom, maxY + 1 + padding);

        cropX = Math.round(absMinX);
        cropY = Math.round(absMinY);
        cropW = Math.max(1, Math.round(absMaxX - absMinX));
        cropH = Math.max(1, Math.round(absMaxY - absMinY));
      } else {
        // 픽셀이 없더라도 셀 전체 영역을 안전하게 크롭
        cropX = Math.round(cellLeft);
        cropY = Math.round(cellTop);
        cropW = Math.max(1, Math.round(cellRight - cellLeft));
        cropH = Math.max(1, Math.round(cellBottom - cellTop));
      }

      // 4. 개별 캔버스에 정밀 크롭 렌더링
      const output = document.createElement('canvas');
      output.width = cropW;
      output.height = cropH;
      const outCtx = output.getContext('2d');
      if (outCtx) {
        try {
          outCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        } catch (_drawErr) {
          console.warn('Cell drawImage error:', _drawErr);
        }
      }

      // 5. 모바일 안전 PNG Blob 추출
      let itemBlob;
      try {
        itemBlob = await canvasToPngBlob(output);
      } catch (_blobErr) {
        const dataUrl = output.toDataURL('image/png');
        const binStr = atob(dataUrl.split(',')[1]);
        const arr = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i += 1) arr[i] = binStr.charCodeAt(i);
        itemBlob = new Blob([arr], { type: 'image/png' });
      }

      items.push({
        index: items.length + 1,
        blob: itemBlob,
        width: cropW,
        height: cropH
      });
    }
  }

  return items;
}

async function splitBySmartGrid(input) {
  return splitIntoFifteen(input);
}

async function hasRealTransparency(file) {
  if (file?.type !== 'image/png') return false;
  const { canvas, ctx } = await drawFileToCanvas(file);
  const { width, height } = canvas;
  if (!width || !height) return false;
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const step = Math.max(1, Math.floor(Math.sqrt((width * height) / 300000)));
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (pixels[(y * width + x) * 4 + 3] < 250) return true;
    }
  }
  return false;
}

export default function BackgroundRemover({ lang = 'ko' }) {
  const t = COPY[lang] || COPY.ko;
  const inputRef = useRef(null);
  const splitCardRef = useRef(null);
  const [file, setFile] = useState(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [resultBlob, setResultBlob] = useState(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState('');
  const [progress, setProgress] = useState(null);
  const progressRenderRef = useRef({ value: null, time: 0 });
  const updateRemovalProgress = (rawProgress) => {
    const numericProgress = Number(rawProgress);
    if (!Number.isFinite(numericProgress)) return;

    const nextValue = Math.max(0, Math.min(100, Math.round(numericProgress)));
    const now = typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
    const previous = progressRenderRef.current;
    const isBoundary = nextValue === 0 || nextValue === 100;

    if (!isBoundary && previous.value !== null && now - previous.time < 80) return;

    progressRenderRef.current = { value: nextValue, time: now };
    setProgress((current) => current === nextValue ? current : nextValue);
  };
  const [error, setError] = useState('');
  const [comparePosition, setComparePosition] = useState(50);
  const [splitItems, setSplitItems] = useState([]);
  const [splitting, setSplitting] = useState(false);
  const [splitError, setSplitError] = useState('');
  const [sheetDetection, setSheetDetection] = useState({ status: 'idle', confidence: 0 });
  const automaticSplitBlobRef = useRef(null);
  const autoSplitCallbackRef = useRef(null);
  const [qualityAssessment, setQualityAssessment] = useState({ status: 'idle', score: 0 });
  const [resultMethod, setResultMethod] = useState('');
  const [precisionMessage, setPrecisionMessage] = useState('');

  useEffect(() => () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [sourceUrl, resultUrl]);

  useEffect(() => () => {
    splitItems.forEach((item) => URL.revokeObjectURL(item.url));
  }, [splitItems]);

  useEffect(() => {
    let cancelled = false;
    if (!resultBlob) {
      setSheetDetection({ status: 'idle', confidence: 0 });
      return () => { cancelled = true; };
    }

    setSheetDetection({ status: 'checking', confidence: 0 });
    detectEmoticonSheet(resultBlob)
      .then((detection) => {
        if (!cancelled) setSheetDetection(detection);
      })
      .catch((error) => {
        console.warn('Emoticon sheet detection failed:', error);
        if (!cancelled) setSheetDetection({ status: 'not-sheet', confidence: 0 });
      });

    return () => { cancelled = true; };
  }, [resultBlob]);

  const clearSplitItems = () => {
    splitItems.forEach((item) => URL.revokeObjectURL(item.url));
    setSplitItems([]);
    setSplitError('');
    setSplitting(false);
  };

  const clearResult = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    clearSplitItems();
    setResultUrl('');
    setResultBlob(null);
    setQualityAssessment({ status: 'idle', score: 0 });
    setResultMethod('');
    setPrecisionMessage('');
    setError('');
    setProgress(null);
    setStage('');
    setComparePosition(50);
  };

  const selectFile = async (nextFile) => {
    if (!nextFile) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(nextFile.type)) {
      setError(t.badType);
      return;
    }
    if (nextFile.size > 12 * 1024 * 1024) {
      setError(t.tooLarge);
      return;
    }
    if (nextFile.type === 'image/png') {
      try {
        if (await hasRealTransparency(nextFile)) {
          setError(t.transparentAlready);
          return;
        }
      } catch (e) {
        console.warn('Transparent PNG detection failed:', e);
      }
    }
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    clearResult();
    setFile(nextFile);
    setSourceUrl(URL.createObjectURL(nextFile));
  };

  const reset = () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    clearResult();
    setFile(null);
    setSourceUrl('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeBackground = async () => {
    if (!file || busy) return;
    clearResult();
    setBusy(true);
    setStage('preparing');
    try {
      let method = 'fast';
      let blob = await tryFastUniformBackgroundRemoval(file);
      let quality = { status: 'pass', score: 0 };

      // The edge-color shortcut can occasionally mistake a complex indoor scene
      // for a uniform backdrop. Validate the fast result before accepting it.
      // Any warning/failure is discarded and routed through the AI models.
      if (blob) {
        try {
          const fastQuality = await assessRemovalQuality(blob);
          if (fastQuality.status === 'pass') {
            quality = fastQuality;
          } else {
            console.warn('Fast background removal rejected by quality gate:', fastQuality);
            blob = null;
            quality = { status: 'idle', score: 0 };
          }
        } catch (fastQualityError) {
          console.warn('Fast background validation failed; falling back to AI:', fastQualityError);
          blob = null;
          quality = { status: 'idle', score: 0 };
        }
      }

      if (!blob) {
        method = 'ai';
        setStage('preparing');
        blob = await removeWithAi(file, (info) => {
          if (typeof info?.progress === 'number') {
            updateRemovalProgress(info.progress);
          }
        });
        quality = await assessRemovalQuality(blob);

        // ORMBG is broad-purpose. If its mask looks unreliable, automatically
        // try MODNet, a smaller portrait-matting model, and keep whichever
        // result scores better. This costs nothing on clean ORMBG results.
        if (quality.status !== 'pass') {
          try {
            setStage('preparing');
            setProgress(null);
            const portraitBlob = await removeWithModnet(file, (info) => {
              if (typeof info?.progress === 'number') {
                updateRemovalProgress(info.progress);
              }
            });
            const portraitQuality = await assessRemovalQuality(portraitBlob);
            if (qualityRank(portraitQuality) < qualityRank(quality)) {
              blob = portraitBlob;
              quality = portraitQuality;
              method = 'modnet';
            }
          } catch (portraitError) {
            console.warn('MODNet portrait retry failed:', portraitError);
          }
        }
      }

      setStage('processing');
      setProgress(null);
      blob = await removeEnclosedBackdropPockets(blob, file, true);
      blob = await correctUnexpectedForegroundTransparency(blob);
      blob = await protectLightForegroundOpacity(blob);
      quality = await assessRemovalQuality(blob);
      const url = URL.createObjectURL(blob);
      setResultMethod(method);
      setQualityAssessment(quality);
      setResultBlob(blob);
      setResultUrl(url);
      setComparePosition(50);
    } catch (e) {
      console.error('Background removal failed:', e);
      setError(t.failed);
    } finally {
      setBusy(false);
      setStage('');
      setProgress(null);
    }
  };

  const runPrecisionRetry = async () => {
    if (!file || busy || !resultBlob) return;
    setBusy(true);
    setStage('precision');
    setProgress(null);
    setPrecisionMessage('');
    try {
      let precisionBlob = await removeWithBiRefNet(file, (info) => {
        if (typeof info?.progress === 'number') {
          updateRemovalProgress(info.progress);
        }
      });
      precisionBlob = await refineHairBackgroundChannels(precisionBlob);
      precisionBlob = await correctUnexpectedForegroundTransparency(precisionBlob);
      precisionBlob = await cleanAiForegroundArtifacts(precisionBlob);
      precisionBlob = await refinePrecisionEdges(precisionBlob);
      precisionBlob = await removeEnclosedBackdropPockets(precisionBlob, file, true);
      precisionBlob = await protectLightForegroundOpacity(precisionBlob);
      const precisionQuality = await assessRemovalQuality(precisionBlob);
      if (qualityRank(precisionQuality) <= qualityRank(qualityAssessment)) {
        const url = URL.createObjectURL(precisionBlob);
        setResultBlob(precisionBlob);
        setResultUrl(url);
        setResultMethod('birefnet');
        setQualityAssessment(precisionQuality);
        setComparePosition(50);
      } else {
        setPrecisionMessage(t.precisionNoBetter);
      }
    } catch (e) {
      console.error('BiRefNet precision retry failed:', e);
      setPrecisionMessage(t.failed);
    } finally {
      setBusy(false);
      setStage('');
      setProgress(null);
    }
  };

  const downloadBlob = (blob, filename) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  };

  const download = () => {
    if (!resultBlob || qualityAssessment.status === 'fail') return;
    const base = (file?.name || 'image').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9가-힣ぁ-んァ-ン一-龥_-]+/g, '-');
    downloadBlob(resultBlob, `${base || 'image'}-transparent.png`);
  };

  const autoSplit = async () => {
    if (!resultBlob || splitting || qualityAssessment.status === 'fail') return;
    clearSplitItems();
    setSplitting(true);
    setSplitError('');
    try {
      const items = await splitIntoFifteen(resultBlob);
      if (!items || items.length === 0) {
        throw new Error('No stickers detected');
      }
      const withUrls = items.map((item) => ({ ...item, url: URL.createObjectURL(item.blob) }));
      setSplitItems(withUrls);
      setTimeout(() => {
        splitCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    } catch (e) {
      console.error('Sticker auto split failed:', e);
      setSplitError(`${t.splitFailed} [원인: ${e?.message || String(e)}]`);
    } finally {
      setSplitting(false);
    }
  };

  autoSplitCallbackRef.current = autoSplit;

  useEffect(() => {
    if (
      sheetDetection.status !== 'sheet' || !resultBlob ||
      qualityAssessment.status === 'fail' || splitItems.length > 0 ||
      splitting || automaticSplitBlobRef.current === resultBlob
    ) return;
    automaticSplitBlobRef.current = resultBlob;
    autoSplitCallbackRef.current?.();
  }, [sheetDetection.status, resultBlob, qualityAssessment.status, splitItems.length, splitting]);

  const downloadSplitItem = (item) => {
    const base = (file?.name || 'emoticon').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9가-힣ぁ-んァ-ン一-龥_-]+/g, '-');
    downloadBlob(item.blob, `${base || 'emoticon'}-${String(item.index).padStart(2, '0')}.png`);
  };

  const updateComparePosition = (element, clientX) => {
    const rect = element.getBoundingClientRect();
    if (!rect.width) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setComparePosition(Math.max(0, Math.min(100, next)));
  };

  const handleComparePointerDown = (event) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    updateComparePosition(event.currentTarget, event.clientX);
  };

  const handleComparePointerMove = (event) => {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      updateComparePosition(event.currentTarget, event.clientX);
    }
  };

  const handleCompareKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowLeft' ? -1 : 1;
    setComparePosition((value) => Math.max(0, Math.min(100, value + direction * 5)));
  };

  return (
    <section id="background-remover" className="mt-8 sm:mt-10 rounded-2xl border border-[#E8DFD1] bg-[#FFFDF9] p-4 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg sm:text-xl font-extrabold text-[#2F2D2A]">✨ {t.title}</h2>
        <span className="rounded-full bg-[#F4EADB] px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-[#8A6841]">{t.badge}</span>
      </div>
      <p className="mt-2 text-sm sm:text-[15px] leading-6 text-[#625D55]">{t.desc}</p>
      <div className="mt-3 flex flex-col gap-1 rounded-xl bg-[#F6F8F3] px-3.5 py-3 text-xs sm:text-[13px] leading-5 text-[#536052]">
        <span>🔒 {t.privacy}</span>
        <span>⚡ {t.first}</span>
      </div>

      {!sourceUrl ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); selectFile(e.dataTransfer.files?.[0]); }}
          className="mt-4 w-full rounded-2xl border-2 border-dashed border-[#D9CDBB] bg-white px-5 py-9 text-center transition hover:border-[#B9A98F] hover:bg-[#FFFCF7]"
        >
          <div className="text-3xl">🖼️</div>
          <div className="mt-2 text-sm sm:text-base font-bold text-[#3E3A35]">{t.upload}</div>
          <div className="mt-1 text-xs text-[#8A837A]">{t.format}</div>
          <div className="mx-auto mt-3 max-w-md rounded-xl bg-[#F2F7EE] px-3 py-2 text-xs font-bold leading-5 text-[#587052]">✂️ {t.sheetUploadHint}</div>
        </button>
      ) : (
        <div className="mt-4">
          {!resultUrl && <div className="mb-3 rounded-xl border border-[#DCE8D5] bg-[#F4F8F1] px-3.5 py-2.5 text-xs sm:text-[13px] font-bold leading-5 text-[#587052]">✂️ {t.sheetSelectedHint}</div>}
          {!resultUrl ? (
            <div className="overflow-hidden rounded-2xl border border-[#E2DDD5] bg-white">
              <div className="border-b border-[#EEE9E1] px-3 py-2 text-xs font-bold text-[#716A62]">{t.original}</div>
              <div className="flex min-h-[230px] items-center justify-center bg-[#F7F5F1] p-3">
                <img src={sourceUrl} alt={t.original} className="max-h-[520px] max-w-full rounded-xl object-contain" />
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#D8E0D2] bg-white">
              <div className="flex items-center justify-between border-b border-[#E7ECE3] px-3 py-2 text-xs font-extrabold">
                <span className="text-[#716A62]">{t.original}</span>
                <span className="text-[#61705D]">{t.result}</span>
              </div>
              <div
                role="slider"
                tabIndex={0}
                aria-label={t.compareHint}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(comparePosition)}
                onPointerDown={handleComparePointerDown}
                onPointerMove={handleComparePointerMove}
                onPointerUp={(event) => event.currentTarget.releasePointerCapture?.(event.pointerId)}
                onPointerCancel={(event) => event.currentTarget.releasePointerCapture?.(event.pointerId)}
                onKeyDown={handleCompareKeyDown}
                className="relative cursor-ew-resize select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#7D9A75] focus-visible:ring-inset"
                style={{ ...checkerStyle, touchAction: 'pan-y' }}
              >
                <img
                  src={resultUrl}
                  alt={t.result}
                  draggable={false}
                  className="pointer-events-none block h-auto w-full select-none"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-white"
                  style={{ clipPath: `inset(0 ${100 - comparePosition}% 0 0)` }}
                >
                  <img
                    src={sourceUrl}
                    alt={t.original}
                    draggable={false}
                    className="h-full w-full select-none object-contain"
                  />
                </div>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 top-0 z-10 w-0.5 bg-white shadow-[0_0_0_1px_rgba(52,48,43,0.22),0_0_10px_rgba(0,0,0,0.18)]"
                  style={{ left: `${comparePosition}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#3E3933] text-lg font-black text-white shadow-lg">
                    ↔
                  </div>
                </div>
                <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-extrabold text-white shadow-sm">
                  {t.original}
                </div>
                <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-[#3E6B4B]/90 px-2.5 py-1 text-[11px] font-extrabold text-white shadow-sm">
                  {t.result}
                </div>
              </div>
              <div className="border-t border-[#E7ECE3] bg-[#FBFCFA] px-3 py-2.5 text-center text-xs font-semibold leading-5 text-[#6B7467]">
                ↔ {t.compareHint}
              </div>
            </div>
          )}

          {busy && (
            <div className="mt-4 rounded-xl border border-[#E8DFD1] bg-white px-4 py-3">
              <div className="flex items-center justify-between gap-3 text-sm font-bold text-[#514B44]">
                <span className="flex items-center gap-2"><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#C8B79D] border-t-[#6D5C46]" />{stage === 'precision' ? t.precisionWorking : (stage === 'preparing' ? t.preparing : t.processing)}</span>
                {typeof progress === 'number' && <span className="text-xs text-[#897D6D]">{progress}%</span>}
              </div>
              {typeof progress === 'number' && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EFEAE2]"><div className="h-full rounded-full bg-[#7D9A75] transition-[width]" style={{ width: `${progress}%` }} /></div>
              )}
            </div>
          )}

          {error && <div className="mt-3 rounded-xl bg-[#FFF1EE] px-3.5 py-3 text-sm font-semibold text-[#A64D3D]">{error}</div>}

          {resultUrl && ['ai', 'modnet'].includes(resultMethod) && qualityAssessment.status === 'fail' && (
            <div className="mt-4 rounded-xl border border-[#E8B8AE] bg-[#FFF4F1] px-3.5 py-3.5">
              <div className="text-sm font-extrabold text-[#914B3F]">⚠️ {t.qualityFailTitle}</div>
              <p className="mt-1.5 text-xs sm:text-[13px] font-medium leading-5 text-[#8B5C53]">{t.qualityFailDesc}</p>
            </div>
          )}

          {resultUrl && ['ai', 'modnet'].includes(resultMethod) && qualityAssessment.status === 'warning' && (
            <div className="mt-4 rounded-xl border border-[#E7D5A4] bg-[#FFFBEF] px-3.5 py-3">
              <div className="text-sm font-extrabold text-[#806A32]">⚠️ {t.qualityWarnTitle}</div>
              <p className="mt-1 text-xs sm:text-[13px] font-medium leading-5 text-[#7B704F]">{t.qualityWarnDesc}</p>
            </div>
          )}

          {resultUrl && ['ai', 'modnet'].includes(resultMethod) && (
            <div className="mt-3 rounded-xl border border-[#D8D0C5] bg-white px-3.5 py-3">
              <button type="button" disabled={busy} onClick={runPrecisionRetry} className="w-full rounded-xl bg-[#4B5868] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#394554] disabled:cursor-wait disabled:opacity-60">
                🧪 {busy && stage === 'precision' ? t.precisionWorking : t.precisionRetry}
              </button>
              <p className="mt-2 text-[11px] sm:text-xs font-medium leading-5 text-[#7B746B]">{t.precisionHint}</p>
            </div>
          )}

          {precisionMessage && <div className="mt-3 rounded-xl bg-[#F6F3EE] px-3.5 py-3 text-xs sm:text-[13px] font-semibold leading-5 text-[#6F675E]">{precisionMessage}</div>}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {!resultUrl ? (
              <button type="button" disabled={busy} onClick={removeBackground} className="flex-1 rounded-xl bg-[#38332D] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#27231F] disabled:cursor-wait disabled:opacity-60">
                {busy ? (stage === 'precision' ? t.precisionWorking : (stage === 'preparing' ? t.preparing : t.processing)) : `✨ ${t.remove}`}
              </button>
            ) : (
              <button type="button" disabled={qualityAssessment.status === 'fail'} onClick={download} className="background-remover-download flex-1 rounded-xl bg-[#3E6B4B] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#31573D] disabled:cursor-not-allowed disabled:bg-[#9D9A94] disabled:shadow-none">{qualityAssessment.status === 'fail' ? `⚠️ ${t.qualityBlocked}` : `⬇️ ${t.download}`}</button>
            )}
            <button type="button" disabled={busy} onClick={resultUrl ? reset : () => inputRef.current?.click()} className="rounded-xl border border-[#D8D0C5] bg-white px-4 py-3 text-sm font-bold text-[#5F574E] transition hover:bg-[#F8F5EF] disabled:opacity-50">
              {resultUrl ? t.again : t.change}
            </button>
          </div>

          {resultUrl && qualityAssessment.status !== 'fail' && (
            <div ref={splitCardRef} className="mt-5 rounded-2xl border border-[#DDD8CE] bg-white p-3.5 sm:p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-[#35312C]">✂️ {t.splitTitle}</h3>
                <span className="rounded-full bg-[#EEF4EA] px-2.5 py-1 text-[11px] font-extrabold text-[#597153]">
                  {sheetDetection.status === 'sheet'
                    ? t.splitBadge
                    : (lang === 'ko' ? '15컷 분리' : lang === 'ja' ? '15分割' : lang === 'zh' ? '15图分割' : '15-Sticker Split')}
                </span>
              </div>
              <p className="mt-2 text-xs sm:text-[13px] leading-5 text-[#746E65]">{t.splitDesc}</p>

              {splitError && (
                <div className="mt-3 rounded-xl bg-[#FFF1EE] p-3 text-xs font-semibold leading-5 text-[#A64D3D]">
                  ⚠️ {splitError}
                </div>
              )}

              {splitItems.length === 0 ? (
                <button
                  type="button"
                  disabled={splitting}
                  onClick={autoSplit}
                  className="mt-3 w-full rounded-xl border border-[#CFC5B7] bg-[#FFF9F0] px-4 py-3 text-sm font-extrabold text-[#5B4B39] transition hover:bg-[#FFF3DF] disabled:cursor-wait disabled:opacity-60"
                >
                  {splitting ? `⏳ ${t.splitting}` : `✂️ ${t.splitAction}`}
                </button>
              ) : (
                <>
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-[#F4F8F1] px-3 py-2.5">
                    <span className="text-xs font-bold leading-5 text-[#5D6D58]">✓ {t.splitReady}</span>
                    <button type="button" onClick={autoSplit} className="shrink-0 text-xs font-extrabold text-[#607859] underline underline-offset-2">{t.splitAgain}</button>
                  </div>

                  <EmoticonPostProcessor
                    items={splitItems}
                    sourceName={file?.name || 'emoticon'}
                    lang={lang}
                  />
                </>
              )}
            </div>
          )}

        </div>
      )}

      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => selectFile(e.target.files?.[0])} />
      {!sourceUrl && error && <div className="mt-3 rounded-xl bg-[#FFF1EE] px-3.5 py-3 text-sm font-semibold text-[#A64D3D]">{error}</div>}
    </section>
  );
}
