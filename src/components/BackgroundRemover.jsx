import React, { useEffect, useRef, useState } from 'react';
import EmoticonPostProcessor from './EmoticonPostProcessor';

let removerPromise = null;

const COPY = {
  ko: {
    title: '배경 제거', badge: 'BETA', desc: '이미지의 배경을 지우고 투명 PNG로 저장해 보세요.',
    privacy: '이미지는 서버에 업로드하지 않고 이 기기에서 처리됩니다.', first: '균일한 단색 배경은 빠르게 처리하며, 복잡한 배경은 AI 모델을 사용해 처음 실행이 조금 오래 걸릴 수 있습니다.',
    upload: '이미지를 선택하거나 여기에 끌어놓으세요', format: 'PNG · JPG · WEBP / 최대 12MB', change: '이미지 변경',
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
    badType: 'PNG, JPG, WEBP 이미지만 사용할 수 있습니다.', tooLarge: '12MB 이하의 이미지를 사용해 주세요.', failed: '배경 제거에 실패했습니다. 브라우저를 새로고침한 뒤 다시 시도해 주세요.'
  },
  en: {
    title: 'Remove Background', badge: 'BETA', desc: 'Remove an image background and save it as a transparent PNG.',
    privacy: 'Your image is processed on this device and is not uploaded to our server.', first: 'Uniform solid-color backgrounds are handled quickly. Complex backgrounds use an AI model, so the first run may take longer.',
    upload: 'Choose an image or drop it here', format: 'PNG · JPG · WEBP / up to 12MB', change: 'Change image',
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
    badType: 'Please use a PNG, JPG, or WEBP image.', tooLarge: 'Please use an image under 12MB.', failed: 'Background removal failed. Refresh the page and try again.'
  },
  ja: {
    title: '背景を削除', badge: 'BETA', desc: '画像の背景を削除し、透過PNGとして保存できます。',
    privacy: '画像はサーバーへ送信せず、この端末内で処理します。', first: '均一な単色背景は高速処理し、複雑な背景ではAIモデルを使用するため初回は少し時間がかかる場合があります。',
    upload: '画像を選択するか、ここにドロップしてください', format: 'PNG · JPG · WEBP / 最大12MB', change: '画像を変更',
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
    badType: 'PNG、JPG、WEBP画像のみ使用できます。', tooLarge: '12MB以下の画像を使用してください。', failed: '背景の削除に失敗しました。ページを再読み込みしてもう一度お試しください。'
  },
  zh: {
    title: '移除背景', badge: 'BETA', desc: '移除图片背景，并保存为透明PNG。',
    privacy: '图片不会上传到服务器，而是在当前设备中处理。', first: '均匀的纯色背景会快速处理；复杂背景会使用AI模型，因此首次使用可能稍慢。',
    upload: '选择图片或将图片拖到这里', format: 'PNG · JPG · WEBP / 最大12MB', change: '更换图片',
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
  canvas.toBlob((blob) => {
    if (blob) resolve(blob);
    else reject(new Error('Canvas PNG export failed'));
  }, 'image/png');
});

async function drawFileToCanvas(file) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D is unavailable');

  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file);
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close?.();
    return { canvas, ctx };
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
    ctx.drawImage(image, 0, 0);
    return { canvas, ctx };
  } finally {
    URL.revokeObjectURL(objectUrl);
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

      const visit = (next) => {
        if (next < 0 || next >= total || labels[next] || !visible(next)) return;
        labels[next] = nextLabel;
        queue[tail++] = next;
      };

      if (x > 0) visit(index - 1);
      if (x + 1 < width) visit(index + 1);
      if (y > 0) visit(index - width);
      if (y + 1 < height) visit(index + width);
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
  const original = new Uint8ClampedArray(pixels);
  const neighborOffsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const p = (y * width + x) * 4;
      const alpha = original[p + 3];
      if (alpha < 32 || alpha > 218) continue;
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;
      for (const [dx, dy] of neighborOffsets) {
        const np = ((y + dy) * width + (x + dx)) * 4;
        if (original[np + 3] < 238) continue;
        r += original[np];
        g += original[np + 1];
        b += original[np + 2];
        count += 1;
      }
      if (!count) continue;
      const mix = Math.min(0.42, ((218 - alpha) / 186) * 0.42);
      pixels[p] = Math.round(original[p] * (1 - mix) + (r / count) * mix);
      pixels[p + 1] = Math.round(original[p + 1] * (1 - mix) + (g / count) * mix);
      pixels[p + 2] = Math.round(original[p + 2] * (1 - mix) + (b / count) * mix);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvasToPngBlob(canvas);
}

async function removeWithAi(file, onProgress) {
  const { remover, RawImage } = await getRemover(onProgress);
  const rawImage = await RawImage.fromBlob(file);
  const output = await remover([rawImage]);
  const image = Array.isArray(output) ? output[0] : output;
  let blob;
  if (image instanceof Blob) blob = image;
  else {
    if (!image?.toBlob) throw new Error('No removable image output');
    blob = await image.toBlob();
  }
  if (!blob) throw new Error('No output blob');
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

async function splitIntoFifteen(blob) {
  const { canvas, ctx } = await drawFileToCanvas(blob);
  const { width, height } = canvas;
  const components = extractConnectedComponents(ctx, width, height);
  const primaries = orderPrimaryStickerComponents(components, width, height);
  const groups = assignComponentsToStickers(components, primaries, width, height);
  const items = [];
  const padding = Math.max(8, Math.round(Math.min(width / 5, height / 3) * 0.035));

  for (let index = 0; index < primaries.length; index += 1) {
    const primary = primaries[index];
    const group = groups.get(primary.id) || [primary];
    const minX = Math.max(0, Math.min(...group.map((item) => item.minX)) - padding);
    const minY = Math.max(0, Math.min(...group.map((item) => item.minY)) - padding);
    const maxX = Math.min(width - 1, Math.max(...group.map((item) => item.maxX)) + padding);
    const maxY = Math.min(height - 1, Math.max(...group.map((item) => item.maxY)) + padding);
    const cropWidth = Math.max(1, maxX - minX + 1);
    const cropHeight = Math.max(1, maxY - minY + 1);

    const output = document.createElement('canvas');
    output.width = cropWidth;
    output.height = cropHeight;
    const outputCtx = output.getContext('2d');
    if (!outputCtx) throw new Error('Canvas 2D is unavailable');
    outputCtx.drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    const itemBlob = await canvasToPngBlob(output);
    items.push({
      index: index + 1,
      blob: itemBlob,
      width: cropWidth,
      height: cropHeight
    });
  }

  if (items.length !== 15) throw new Error('Could not detect 15 sticker groups');
  return items;
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
  const [file, setFile] = useState(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [resultBlob, setResultBlob] = useState(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState('');
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [comparePosition, setComparePosition] = useState(50);
  const [splitItems, setSplitItems] = useState([]);
  const [splitting, setSplitting] = useState(false);
  const [splitError, setSplitError] = useState('');
  const [sheetDetection, setSheetDetection] = useState({ status: 'idle', confidence: 0 });

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
        if (!cancelled) setSheetDetection({ status: 'ambiguous', confidence: 0 });
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
      let blob = await tryFastUniformBackgroundRemoval(file);

      if (!blob) {
        setStage('preparing');
        blob = await removeWithAi(file, (info) => {
          if (typeof info?.progress === 'number') {
            setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
          }
        });
      }

      setStage('processing');
      setProgress(null);
      const url = URL.createObjectURL(blob);
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
    if (!resultBlob) return;
    const base = (file?.name || 'image').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9가-힣ぁ-んァ-ン一-龥_-]+/g, '-');
    downloadBlob(resultBlob, `${base || 'image'}-transparent.png`);
  };

  const autoSplit = async () => {
    if (!resultBlob || splitting) return;
    clearSplitItems();
    setSplitting(true);
    setSplitError('');
    try {
      const items = await splitIntoFifteen(resultBlob);
      const withUrls = items.map((item) => ({ ...item, url: URL.createObjectURL(item.blob) }));
      setSplitItems(withUrls);
    } catch (e) {
      console.error('Sticker auto split failed:', e);
      setSplitError(t.splitFailed);
    } finally {
      setSplitting(false);
    }
  };

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
        </button>
      ) : (
        <div className="mt-4">
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
                <span className="flex items-center gap-2"><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#C8B79D] border-t-[#6D5C46]" />{stage === 'preparing' ? t.preparing : t.processing}</span>
                {typeof progress === 'number' && <span className="text-xs text-[#897D6D]">{progress}%</span>}
              </div>
              {typeof progress === 'number' && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EFEAE2]"><div className="h-full rounded-full bg-[#7D9A75] transition-all" style={{ width: `${progress}%` }} /></div>
              )}
            </div>
          )}

          {error && <div className="mt-3 rounded-xl bg-[#FFF1EE] px-3.5 py-3 text-sm font-semibold text-[#A64D3D]">{error}</div>}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {!resultUrl ? (
              <button type="button" disabled={busy} onClick={removeBackground} className="flex-1 rounded-xl bg-[#38332D] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#27231F] disabled:cursor-wait disabled:opacity-60">
                {busy ? (stage === 'preparing' ? t.preparing : t.processing) : `✨ ${t.remove}`}
              </button>
            ) : (
              <button type="button" onClick={download} className="flex-1 rounded-xl bg-[#3E6B4B] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#31573D]">⬇️ {t.download}</button>
            )}
            <button type="button" disabled={busy} onClick={resultUrl ? reset : () => inputRef.current?.click()} className="rounded-xl border border-[#D8D0C5] bg-white px-4 py-3 text-sm font-bold text-[#5F574E] transition hover:bg-[#F8F5EF] disabled:opacity-50">
              {resultUrl ? t.again : t.change}
            </button>
          </div>

          {resultUrl && (sheetDetection.status === 'sheet' || splitItems.length > 0) && (
            <div className="mt-5 rounded-2xl border border-[#DDD8CE] bg-white p-3.5 sm:p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-[#35312C]">✂️ {t.splitTitle}</h3>
                <span className="rounded-full bg-[#EEF4EA] px-2.5 py-1 text-[11px] font-extrabold text-[#597153]">{t.splitBadge}</span>
              </div>
              <p className="mt-2 text-xs sm:text-[13px] leading-5 text-[#746E65]">{t.splitDesc}</p>

              {splitError && <div className="mt-3 rounded-xl bg-[#FFF1EE] px-3 py-2.5 text-xs font-semibold leading-5 text-[#A64D3D]">{splitError}</div>}

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

          {resultUrl && sheetDetection.status === 'ambiguous' && splitItems.length === 0 && (
            <div className="mt-4 rounded-xl border border-[#E5DED3] bg-[#FCFBF8] px-3.5 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-extrabold text-[#4A453F]">✂️ {t.splitMaybeTitle}</div>
                  <p className="mt-1 text-[11px] sm:text-xs leading-5 text-[#7A736B]">{t.splitMaybeDesc}</p>
                </div>
                <button
                  type="button"
                  disabled={splitting}
                  onClick={autoSplit}
                  className="shrink-0 rounded-lg border border-[#D8CDBD] bg-white px-3 py-2 text-xs font-extrabold text-[#625544] transition hover:bg-[#FFF8ED] disabled:cursor-wait disabled:opacity-60"
                >
                  {splitting ? `⏳ ${t.splitting}` : `✂️ ${t.splitMaybeAction}`}
                </button>
              </div>
              {splitError && <div className="mt-2 rounded-lg bg-[#FFF1EE] px-3 py-2 text-xs font-semibold leading-5 text-[#A64D3D]">{splitError}</div>}
            </div>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => selectFile(e.target.files?.[0])} />
      {!sourceUrl && error && <div className="mt-3 rounded-xl bg-[#FFF1EE] px-3.5 py-3 text-sm font-semibold text-[#A64D3D]">{error}</div>}
    </section>
  );
}
