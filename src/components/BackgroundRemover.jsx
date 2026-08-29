import React, { useEffect, useRef, useState } from 'react';

let removerPromise = null;

const COPY = {
  ko: {
    title: '배경 제거', badge: 'BETA', desc: '이미지의 배경을 지우고 투명 PNG로 저장해 보세요.',
    privacy: '이미지는 서버에 업로드하지 않고 이 기기에서 처리됩니다.', first: '흰 배경 이미지는 빠르게 처리하며, 복잡한 배경은 AI 모델을 사용해 처음 실행이 조금 오래 걸릴 수 있습니다.',
    upload: '이미지를 선택하거나 여기에 끌어놓으세요', format: 'PNG · JPG · WEBP / 최대 12MB', change: '이미지 변경',
    remove: '배경 제거하기', preparing: '이미지 분석 중…', processing: '배경을 제거하고 있어요…',
    original: '원본', result: '투명 배경', download: '투명 PNG 저장', again: '다른 이미지',
    compareHint: '가운데 슬라이더를 좌우로 움직여 원본과 결과를 비교하세요.',
    splitTitle: '15개 이모티콘 자동 분리', splitBadge: '5열 × 3행',
    splitDesc: '투명 배경 결과를 15개 영역으로 나누고, 각 이모티콘의 불필요한 투명 여백을 자동으로 정리합니다.',
    splitAction: '15개로 자동 분리', splitting: '15개 이모티콘을 분리하고 있어요…',
    splitReady: '분리 완료 · 각 이미지를 눌러 개별 PNG로 저장할 수 있습니다.',
    splitAgain: '다시 분리', splitDownload: 'PNG 저장', splitFailed: '자동 분리에 실패했습니다. 이미지를 다시 처리한 뒤 시도해 주세요.',
    badType: 'PNG, JPG, WEBP 이미지만 사용할 수 있습니다.', tooLarge: '12MB 이하의 이미지를 사용해 주세요.', failed: '배경 제거에 실패했습니다. 브라우저를 새로고침한 뒤 다시 시도해 주세요.'
  },
  en: {
    title: 'Remove Background', badge: 'BETA', desc: 'Remove an image background and save it as a transparent PNG.',
    privacy: 'Your image is processed on this device and is not uploaded to our server.', first: 'White backgrounds are handled quickly. Complex backgrounds use an AI model, so the first run may take longer.',
    upload: 'Choose an image or drop it here', format: 'PNG · JPG · WEBP / up to 12MB', change: 'Change image',
    remove: 'Remove background', preparing: 'Analyzing image…', processing: 'Removing background…',
    original: 'Original', result: 'Transparent', download: 'Save transparent PNG', again: 'Try another image',
    compareHint: 'Drag the center slider left or right to compare the original and result.',
    splitTitle: 'Auto-split 15 emoticons', splitBadge: '5 columns × 3 rows',
    splitDesc: 'Split the transparent sheet into 15 areas and automatically trim unnecessary transparent space around each emoticon.',
    splitAction: 'Auto-split into 15', splitting: 'Splitting 15 emoticons…',
    splitReady: 'Split complete · Save each emoticon as an individual PNG.',
    splitAgain: 'Split again', splitDownload: 'Save PNG', splitFailed: 'Auto split failed. Process the image again and retry.',
    badType: 'Please use a PNG, JPG, or WEBP image.', tooLarge: 'Please use an image under 12MB.', failed: 'Background removal failed. Refresh the page and try again.'
  },
  ja: {
    title: '背景を削除', badge: 'BETA', desc: '画像の背景を削除し、透過PNGとして保存できます。',
    privacy: '画像はサーバーへ送信せず、この端末内で処理します。', first: '白背景は高速処理し、複雑な背景ではAIモデルを使用するため初回は少し時間がかかる場合があります。',
    upload: '画像を選択するか、ここにドロップしてください', format: 'PNG · JPG · WEBP / 最大12MB', change: '画像を変更',
    remove: '背景を削除する', preparing: '画像を解析中…', processing: '背景を削除しています…',
    original: '元画像', result: '透過背景', download: '透過PNGを保存', again: '別の画像',
    compareHint: '中央のスライダーを左右に動かして元画像と結果を比較できます。',
    splitTitle: '15個の絵文字を自動分割', splitBadge: '5列 × 3行',
    splitDesc: '透過背景のシートを15領域に分け、各絵文字の不要な透明余白を自動で整えます。',
    splitAction: '15個に自動分割', splitting: '15個の絵文字を分割しています…',
    splitReady: '分割完了 · 各画像を個別PNGとして保存できます。',
    splitAgain: '再分割', splitDownload: 'PNG保存', splitFailed: '自動分割に失敗しました。画像を再処理してお試しください。',
    badType: 'PNG、JPG、WEBP画像のみ使用できます。', tooLarge: '12MB以下の画像を使用してください。', failed: '背景の削除に失敗しました。ページを再読み込みしてもう一度お試しください。'
  },
  zh: {
    title: '移除背景', badge: 'BETA', desc: '移除图片背景，并保存为透明PNG。',
    privacy: '图片不会上传到服务器，而是在当前设备中处理。', first: '白色背景会快速处理；复杂背景会使用AI模型，因此首次使用可能稍慢。',
    upload: '选择图片或将图片拖到这里', format: 'PNG · JPG · WEBP / 最大12MB', change: '更换图片',
    remove: '移除背景', preparing: '正在分析图片…', processing: '正在移除背景…',
    original: '原图', result: '透明背景', download: '保存透明PNG', again: '换一张图片',
    compareHint: '左右拖动中间滑块即可对比原图和处理结果。',
    splitTitle: '自动分割15个表情', splitBadge: '5列 × 3行',
    splitDesc: '将透明背景图片分成15个区域，并自动裁掉每个表情周围多余的透明空间。',
    splitAction: '自动分成15个', splitting: '正在分割15个表情…',
    splitReady: '分割完成 · 可将每个表情单独保存为PNG。',
    splitAgain: '重新分割', splitDownload: '保存PNG', splitFailed: '自动分割失败，请重新处理图片后再试。',
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

function estimateCornerBackground(data, width, height) {
  const sampleSize = Math.max(6, Math.min(24, Math.floor(Math.min(width, height) * 0.025)));
  const corners = [
    [0, 0],
    [Math.max(0, width - sampleSize), 0],
    [0, Math.max(0, height - sampleSize)],
    [Math.max(0, width - sampleSize), Math.max(0, height - sampleSize)]
  ];

  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  let varianceSeed = 0;

  for (const [startX, startY] of corners) {
    for (let y = startY; y < Math.min(height, startY + sampleSize); y += 2) {
      for (let x = startX; x < Math.min(width, startX + sampleSize); x += 2) {
        const p = (y * width + x) * 4;
        r += data[p];
        g += data[p + 1];
        b += data[p + 2];
        varianceSeed += data[p] * data[p] + data[p + 1] * data[p + 1] + data[p + 2] * data[p + 2];
        count += 1;
      }
    }
  }

  if (!count) return null;
  const bg = [r / count, g / count, b / count];
  const meanSquare = varianceSeed / (count * 3);
  const channelMean = (bg[0] + bg[1] + bg[2]) / 3;
  const variance = Math.max(0, meanSquare - channelMean * channelMean);
  return { bg, brightness: channelMean, spread: Math.sqrt(variance) };
}

async function tryFastLightBackgroundRemoval(file) {
  const { canvas, ctx } = await drawFileToCanvas(file);
  const { width, height } = canvas;
  if (!width || !height) return null;

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const estimate = estimateCornerBackground(pixels, width, height);
  if (!estimate || estimate.brightness < 224 || estimate.spread > 22) return null;

  const [bgR, bgG, bgB] = estimate.bg;
  const total = width * height;
  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const matchesBackground = (index) => {
    const p = index * 4;
    const r = pixels[p];
    const g = pixels[p + 1];
    const b = pixels[p + 2];
    const maxDelta = Math.max(Math.abs(r - bgR), Math.abs(g - bgG), Math.abs(b - bgB));
    const brightness = (r + g + b) / 3;
    return maxDelta <= 38 && brightness >= 205;
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
    const p = index * 4;
    pixels[p + 3] = 0;
    if (x > 0) enqueue(index - 1);
    if (x + 1 < width) enqueue(index + 1);
    if (y > 0) enqueue(index - width);
    if (y + 1 < height) enqueue(index + width);
  }

  if (tail < total * 0.08) return null;

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

async function removeWithAi(file, onProgress) {
  const { remover, RawImage } = await getRemover(onProgress);
  const rawImage = await RawImage.fromBlob(file);
  const output = await remover([rawImage]);
  const image = Array.isArray(output) ? output[0] : output;
  if (image instanceof Blob) return image;
  if (!image?.toBlob) throw new Error('No removable image output');
  const blob = await image.toBlob();
  if (!blob) throw new Error('No output blob');
  return blob;
}

function findVisibleBounds(ctx, width, height) {
  const pixels = ctx.getImageData(0, 0, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = pixels[(y * width + x) * 4 + 3];
      if (alpha <= 10) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < minX || maxY < minY) return null;
  return { minX, minY, maxX, maxY };
}

async function splitIntoFifteen(blob) {
  const { canvas } = await drawFileToCanvas(blob);
  const columns = 5;
  const rows = 3;
  const items = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x0 = Math.floor((column * canvas.width) / columns);
      const x1 = Math.floor(((column + 1) * canvas.width) / columns);
      const y0 = Math.floor((row * canvas.height) / rows);
      const y1 = Math.floor(((row + 1) * canvas.height) / rows);
      const cellWidth = Math.max(1, x1 - x0);
      const cellHeight = Math.max(1, y1 - y0);

      const cell = document.createElement('canvas');
      cell.width = cellWidth;
      cell.height = cellHeight;
      const cellCtx = cell.getContext('2d', { willReadFrequently: true });
      if (!cellCtx) throw new Error('Canvas 2D is unavailable');
      cellCtx.drawImage(canvas, x0, y0, cellWidth, cellHeight, 0, 0, cellWidth, cellHeight);

      const bounds = findVisibleBounds(cellCtx, cellWidth, cellHeight);
      const basePadding = Math.max(8, Math.round(Math.min(cellWidth, cellHeight) * 0.035));

      let cropX = 0;
      let cropY = 0;
      let cropWidth = cellWidth;
      let cropHeight = cellHeight;

      if (bounds) {
        cropX = Math.max(0, bounds.minX - basePadding);
        cropY = Math.max(0, bounds.minY - basePadding);
        const cropRight = Math.min(cellWidth - 1, bounds.maxX + basePadding);
        const cropBottom = Math.min(cellHeight - 1, bounds.maxY + basePadding);
        cropWidth = Math.max(1, cropRight - cropX + 1);
        cropHeight = Math.max(1, cropBottom - cropY + 1);
      }

      const output = document.createElement('canvas');
      output.width = cropWidth;
      output.height = cropHeight;
      const outputCtx = output.getContext('2d');
      if (!outputCtx) throw new Error('Canvas 2D is unavailable');
      outputCtx.drawImage(cell, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      const itemBlob = await canvasToPngBlob(output);
      items.push({
        index: row * columns + column + 1,
        blob: itemBlob,
        width: cropWidth,
        height: cropHeight
      });
    }
  }

  return items;
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

  useEffect(() => () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [sourceUrl, resultUrl]);

  useEffect(() => () => {
    splitItems.forEach((item) => URL.revokeObjectURL(item.url));
  }, [splitItems]);

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

  const selectFile = (nextFile) => {
    if (!nextFile) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(nextFile.type)) {
      setError(t.badType);
      return;
    }
    if (nextFile.size > 12 * 1024 * 1024) {
      setError(t.tooLarge);
      return;
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
      let blob = await tryFastLightBackgroundRemoval(file);

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

          {resultUrl && (
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

                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-2.5">
                    {splitItems.map((item) => (
                      <div key={item.index} className="overflow-hidden rounded-xl border border-[#E2DDD5] bg-white shadow-sm">
                        <div className="relative aspect-square overflow-hidden" style={checkerStyle}>
                          <img src={item.url} alt={`${t.splitTitle} ${item.index}`} className="h-full w-full object-contain p-1.5" />
                          <span className="absolute left-1.5 top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-black/65 px-1.5 text-[10px] font-extrabold text-white">{item.index}</span>
                        </div>
                        <button type="button" onClick={() => downloadSplitItem(item)} className="w-full border-t border-[#EEEAE3] px-1.5 py-2 text-[10px] sm:text-[11px] font-extrabold text-[#4E664A] hover:bg-[#F8FBF6]">
                          ↓ {t.splitDownload}
                        </button>
                      </div>
                    ))}
                  </div>
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
