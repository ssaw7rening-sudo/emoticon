import React, { useEffect, useMemo, useRef, useState } from 'react';

const COPY = {
  ko: {
    title: '이모티콘 마무리', ready: '분리된 15개 이미지를 수정하고 360~1440px 고화질 PNG로 저장할 수 있습니다.',
    sizeLabel: '출력 크기', qualityNote: '2×·4×는 고품질 확대와 선명도 보정을 적용합니다.',
    normalizeAll: '전체 {size}×{size} 변환', zip: 'ZIP 일괄 저장', working: '처리 중…', edit: '수정', save: '저장',
    editorTitle: '미세조정', zoom: '크기', x: '좌우 위치', y: '상하 위치', reset: '초기화', cancel: '취소', apply: '수정 적용',
    raw: '자동', review: '확인 필요', reviewSummary: (count) => `${count}개 결과에서 글자·효과가 이웃 영역과 맞닿았을 가능성이 있습니다. 표시된 이미지만 확대해 확인해 주세요.`,
    reviewHint: '자동 분할은 완료되었습니다. 글자 끝, 문장부호, 손·소품이 빠지거나 이웃 이미지가 섞이지 않았는지 확인해 주세요.',
    basic: '기본', upscale: '업스케일', zipName: 'emoticon', failed: '이미지 처리 중 오류가 발생했습니다.'
  },
  en: {
    title: 'Finish emoticons', ready: 'Fine-tune the 15 split images and export high-quality PNGs from 360 to 1440px.',
    sizeLabel: 'Output size', qualityNote: '2× and 4× use high-quality scaling with light sharpening.',
    normalizeAll: 'Convert all to {size}×{size}', zip: 'Download ZIP', working: 'Processing…', edit: 'Edit', save: 'Save',
    editorTitle: 'Fine-tune', zoom: 'Size', x: 'Horizontal', y: 'Vertical', reset: 'Reset', cancel: 'Cancel', apply: 'Apply edit',
    raw: 'Auto', review: 'Review', reviewSummary: (count) => `${count} result(s) may contain text or effects touching a neighboring region. Please inspect only the marked images.`,
    reviewHint: 'Auto-splitting is complete. Check that text endings, punctuation, hands, and props are intact and that neighboring artwork was not included.',
    basic: 'Base', upscale: 'Upscale', zipName: 'emoticon', failed: 'An error occurred while processing the image.'
  },
  ja: {
    title: '絵文字の仕上げ', ready: '分割した15枚を微調整し、360〜1440pxの高画質PNGで保存できます。',
    sizeLabel: '出力サイズ', qualityNote: '2×・4×は高品質拡大と軽いシャープ補正を適用します。',
    normalizeAll: 'すべて{size}×{size}に変換', zip: 'ZIP一括保存', working: '処理中…', edit: '編集', save: '保存',
    editorTitle: '微調整', zoom: 'サイズ', x: '左右位置', y: '上下位置', reset: 'リセット', cancel: 'キャンセル', apply: '編集を適用',
    raw: '自動', review: '要確認', reviewSummary: (count) => `${count}件で文字や効果が隣接領域に触れている可能性があります。印のある画像だけ拡大して確認してください。`,
    reviewHint: '自動分割は完了しています。文字の末尾、句読点、手や小物の欠け、隣の画像の混入がないか確認してください。',
    basic: '基本', upscale: 'アップスケール', zipName: 'emoticon', failed: '画像処理中にエラーが発生しました。'
  },
  zh: {
    title: '表情包收尾', ready: '可微调已分割的15张图片，并保存为360到1440px的高画质PNG。',
    sizeLabel: '输出尺寸', qualityNote: '2×和4×会使用高质量放大并进行轻度锐化。',
    normalizeAll: '全部转换为{size}×{size}', zip: 'ZIP批量保存', working: '处理中…', edit: '调整', save: '保存',
    editorTitle: '微调', zoom: '大小', x: '左右位置', y: '上下位置', reset: '重置', cancel: '取消', apply: '应用调整',
    raw: '自动', review: '需要检查', reviewSummary: (count) => `${count}个结果中的文字或效果可能接近相邻区域，请只放大检查已标记的图片。`,
    reviewHint: '自动分割已完成。请确认文字末尾、标点、手部和道具没有缺失，也没有混入相邻图片。',
    basic: '基础', upscale: '放大', zipName: 'emoticon', failed: '图片处理时发生错误。'
  }
};

const checkerStyle = {
  backgroundColor: '#fff',
  backgroundImage: 'linear-gradient(45deg,#eceae5 25%,transparent 25%),linear-gradient(-45deg,#eceae5 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eceae5 75%),linear-gradient(-45deg,transparent 75%,#eceae5 75%)',
  backgroundSize: '18px 18px',
  backgroundPosition: '0 0,0 9px,9px -9px,-9px 0px'
};

const canvasToBlob = (canvas) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('PNG export failed')), 'image/png');
});

async function loadBitmap(blob) {
  if (typeof createImageBitmap === 'function') return createImageBitmap(blob);
  const url = URL.createObjectURL(blob);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function sharpenCanvas(canvas, amount = 0.08) {
  if (amount <= 0) return;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const source = new Uint8ClampedArray(data);
  const stride = width * 4;
  const clamp = (value) => Math.max(0, Math.min(255, Math.round(value)));

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const p = (y * width + x) * 4;
      if (source[p + 3] < 16) continue;
      for (let channel = 0; channel < 3; channel += 1) {
        const center = source[p + channel];
        const neighbors = source[p - 4 + channel] + source[p + 4 + channel] + source[p - stride + channel] + source[p + stride + channel];
        data[p + channel] = clamp(center * (1 + amount * 4) - neighbors * amount);
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function stabilizeBrightForegroundAlpha(canvas) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;
  const { width, height } = canvas;
  if (!width || !height) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const source = new Uint8ClampedArray(data);
  const alphaAt = (x, y) => source[(y * width + x) * 4 + 3];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const p = (y * width + x) * 4;
      const alpha = source[p + 3];
      if (alpha === 0 || alpha === 255) continue;

      const r = source[p];
      const g = source[p + 1];
      const b = source[p + 2];
      const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722;
      let opaqueNeighbors = 0;
      let visibleNeighbors = 0;

      for (let oy = -1; oy <= 1; oy += 1) {
        for (let ox = -1; ox <= 1; ox += 1) {
          if (ox === 0 && oy === 0) continue;
          const nx = x + ox;
          const ny = y + oy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const neighborAlpha = alphaAt(nx, ny);
          if (neighborAlpha >= 238) opaqueNeighbors += 1;
          if (neighborAlpha >= 16) visibleNeighbors += 1;
        }
      }

      // Bright sticker artwork must never become see-through because of
      // resampling. This specifically protects white/ivory faces, pale fur,
      // dandelion-like wisps, captions and white sticker outlines.
      if (luminance >= 138 && alpha >= 3) {
        data[p + 3] = 255;
        continue;
      }

      // Interior foreground pixels of any colour are also restored when their
      // local alpha topology shows that they belong to the solid subject.
      if ((alpha >= 20 && opaqueNeighbors >= 2) || (alpha >= 48 && visibleNeighbors >= 5)) {
        data[p + 3] = 255;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

async function makeOutputForItem(item, transform = { zoom: 1, x: 0, y: 0 }, outputScale = 1) {
  const SOURCE_DIRECT_EXPORT = 'SOURCE_DIRECT_EXPORT';
  void SOURCE_DIRECT_EXPORT;

  const pixels = item?.pixelData;
  const sourceWidth = Math.max(0, Number(item?.pixelWidth || 0));
  const sourceHeight = Math.max(0, Number(item?.pixelHeight || 0));
  const directRequired = item?.splitEngine === 'SOURCE_DIRECT';
  const validDirect = Boolean(
    item?.pixelSafe && pixels && sourceWidth && sourceHeight &&
    pixels.length === sourceWidth * sourceHeight * 4
  );

  if (directRequired && !validDirect) {
    throw new Error('SOURCE_DIRECT_EXPORT: original RGBA payload is missing');
  }
  if (!validDirect) return makeOutput(item.blob, transform, outputScale);

  const scaleFactor = [1, 2, 4].includes(outputScale) ? outputScale : 1;
  const size = 360 * scaleFactor;
  const safeSize = 300 * scaleFactor;
  const zoom = Math.max(0.55, Math.min(1.45, transform?.zoom || 1));
  const fit = Math.min(safeSize / Math.max(1, sourceWidth), safeSize / Math.max(1, sourceHeight));
  const drawScale = fit * zoom;
  const drawW = sourceWidth * drawScale;
  const drawH = sourceHeight * drawScale;
  const offsetX = (size - drawW) / 2 + (transform?.x || 0) * scaleFactor;
  const offsetY = (size - drawH) / 2 + (transform?.y || 0) * scaleFactor;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas unavailable');
  const image = ctx.createImageData(size, size);
  const out = image.data;

  const sourceIndex = (x, y) => {
    const sx = Math.max(0, Math.min(sourceWidth - 1, x));
    const sy = Math.max(0, Math.min(sourceHeight - 1, y));
    return (sy * sourceWidth + sx) * 4;
  };

  const minX = Math.max(0, Math.floor(offsetX));
  const maxX = Math.min(size - 1, Math.ceil(offsetX + drawW) - 1);
  const minY = Math.max(0, Math.floor(offsetY));
  const maxY = Math.min(size - 1, Math.ceil(offsetY + drawH) - 1);

  for (let oy = minY; oy <= maxY; oy += 1) {
    const sy = ((oy + 0.5 - offsetY) / drawScale) - 0.5;
    const y0 = Math.floor(sy);
    const y1 = y0 + 1;
    const fy = sy - y0;
    for (let ox = minX; ox <= maxX; ox += 1) {
      const sx = ((ox + 0.5 - offsetX) / drawScale) - 0.5;
      const x0 = Math.floor(sx);
      const x1 = x0 + 1;
      const fx = sx - x0;
      const ids = [sourceIndex(x0, y0), sourceIndex(x1, y0), sourceIndex(x0, y1), sourceIndex(x1, y1)];
      const weights = [(1 - fx) * (1 - fy), fx * (1 - fy), (1 - fx) * fy, fx * fy];
      let coverage = 0;
      let rr = 0, gg = 0, bb = 0;
      for (let i = 0; i < 4; i += 1) {
        const p = ids[i];
        if (pixels[p + 3] === 0) continue;
        coverage += weights[i];
        rr += pixels[p] * weights[i];
        gg += pixels[p + 1] * weights[i];
        bb += pixels[p + 2] * weights[i];
      }
      if (coverage <= 0.02) continue;
      const dp = (oy * size + ox) * 4;
      out[dp] = Math.round(rr / coverage);
      out[dp + 1] = Math.round(gg / coverage);
      out[dp + 2] = Math.round(bb / coverage);
      out[dp + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvasToBlob(canvas);
}

async function makeOutput(blob, transform = { zoom: 1, x: 0, y: 0 }, outputScale = 1) {
  const image = await loadBitmap(blob);
  const width = image.width || image.naturalWidth;
  const height = image.height || image.naturalHeight;
  const scaleFactor = [1, 2, 4].includes(outputScale) ? outputScale : 1;
  const size = 360 * scaleFactor;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas unavailable');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const safeSize = 300 * scaleFactor;
  const fit = Math.min(safeSize / Math.max(1, width), safeSize / Math.max(1, height));
  const zoom = Math.max(0.55, Math.min(1.45, transform.zoom || 1));
  const drawScale = fit * zoom;
  const drawW = width * drawScale;
  const drawH = height * drawScale;
  const x = (size - drawW) / 2 + (transform.x || 0) * scaleFactor;
  const y = (size - drawH) / 2 + (transform.y || 0) * scaleFactor;
  ctx.drawImage(image, x, y, drawW, drawH);
  image.close?.();

  if (scaleFactor > 1) sharpenCanvas(canvas, scaleFactor === 4 ? 0.11 : 0.075);
  stabilizeBrightForegroundAlpha(canvas);
  return canvasToBlob(canvas);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

const safeBaseName = (name = 'emoticon') => name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9가-힣ぁ-んァ-ン一-龥_-]+/g, '-') || 'emoticon';

export default function EmoticonPostProcessor({ items = [], sourceName = 'emoticon', lang = 'ko', engineLabel = '' }) {
  const t = COPY[lang] || COPY.ko;
  const [processed, setProcessed] = useState([]);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editor, setEditor] = useState({ zoom: 1, x: 0, y: 0 });
  const [outputScale, setOutputScale] = useState(1);
  const processedRef = useRef([]);

  useEffect(() => {
    setProcessed((previous) => {
      previous.forEach((item) => item.finalUrl && URL.revokeObjectURL(item.finalUrl));
      return items.map((item) => ({ ...item, transform: { zoom: 1, x: 0, y: 0 }, finalBlob: null, finalUrl: '' }));
    });
    setEditingIndex(null);
    setError('');
  }, [items]);

  useEffect(() => {
    processedRef.current = processed;
  }, [processed]);

  useEffect(() => () => {
    processedRef.current.forEach((item) => item.finalUrl && URL.revokeObjectURL(item.finalUrl));
  }, []);

  const current = useMemo(() => processed.find((item) => item.index === editingIndex) || null, [processed, editingIndex]);
  const reviewCount = useMemo(() => processed.filter((item) => item.needsReview).length, [processed]);
  const base = safeBaseName(sourceName);
  const outputSize = 360 * outputScale;
  const normalizeLabel = t.normalizeAll.split('{size}').join(String(outputSize));

  const changeOutputScale = (nextScale) => {
    if (working || nextScale === outputScale) return;
    setProcessed((list) => list.map((item) => {
      if (item.finalUrl) URL.revokeObjectURL(item.finalUrl);
      return { ...item, finalBlob: null, finalUrl: '' };
    }));
    setOutputScale(nextScale);
  };

  const saveProcessedItem = async (item, transform) => {
    const blob = await makeOutputForItem(item, transform, outputScale);
    const url = URL.createObjectURL(blob);
    setProcessed((list) => list.map((entry) => {
      if (entry.index !== item.index) return entry;
      if (entry.finalUrl) URL.revokeObjectURL(entry.finalUrl);
      return { ...entry, transform: { ...transform }, finalBlob: blob, finalUrl: url };
    }));
    return blob;
  };

  const normalizeAll = async () => {
    if (working || !processed.length) return;
    setWorking(true);
    setError('');
    try {
      const next = [];
      for (const item of processed) {
        const transform = item.transform || { zoom: 1, x: 0, y: 0 };
        const blob = await makeOutputForItem(item, transform, outputScale);
        next.push({ ...item, finalBlob: blob, finalUrl: URL.createObjectURL(blob) });
      }
      setProcessed((old) => {
        old.forEach((item) => item.finalUrl && URL.revokeObjectURL(item.finalUrl));
        return next;
      });
    } catch (e) {
      console.error('Normalize emoticons failed:', e);
      setError(t.failed);
    } finally {
      setWorking(false);
    }
  };

  const downloadItem = async (item) => {
    try {
      const blob = item.finalBlob || await saveProcessedItem(item, item.transform || { zoom: 1, x: 0, y: 0 });
      downloadBlob(blob, `${base}-${String(item.index).padStart(2, '0')}-${outputSize}.png`);
    } catch (e) {
      console.error('Download emoticon failed:', e);
      setError(t.failed);
    }
  };

  const downloadZip = async () => {
    if (working || !processed.length) return;
    setWorking(true);
    setError('');
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      const replacements = [];
      for (const item of processed) {
        let blob = item.finalBlob;
        let finalUrl = item.finalUrl;
        if (!blob) {
          blob = await makeOutputForItem(item, item.transform || { zoom: 1, x: 0, y: 0 }, outputScale);
          finalUrl = URL.createObjectURL(blob);
        }
        zip.file(`${String(item.index).padStart(2, '0')}.png`, blob);
        replacements.push({ ...item, finalBlob: blob, finalUrl });
      }
      setProcessed((old) => {
        old.forEach((item) => {
          const replacement = replacements.find((next) => next.index === item.index);
          if (item.finalUrl && replacement?.finalUrl !== item.finalUrl) URL.revokeObjectURL(item.finalUrl);
        });
        return replacements;
      });
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
      downloadBlob(zipBlob, `${base}-${t.zipName}-${outputSize}.zip`);
    } catch (e) {
      console.error('ZIP export failed:', e);
      setError(t.failed);
    } finally {
      setWorking(false);
    }
  };

  const openEditor = (item) => {
    setEditingIndex(item.index);
    setEditor(item.transform || { zoom: 1, x: 0, y: 0 });
  };

  const applyEditor = async () => {
    if (!current || working) return;
    setWorking(true);
    setError('');
    try {
      await saveProcessedItem(current, editor);
      setEditingIndex(null);
    } catch (e) {
      console.error('Edit emoticon failed:', e);
      setError(t.failed);
    } finally {
      setWorking(false);
    }
  };

  const previewStyle = (item, transform) => {
    const maxDim = Math.max(1, item.width || 1, item.height || 1);
    const zoom = transform?.zoom || 1;
    return {
      width: `${83.333 * ((item.width || 1) / maxDim) * zoom}%`,
      height: `${83.333 * ((item.height || 1) / maxDim) * zoom}%`,
      left: `calc(50% + ${(transform?.x || 0) / 3.6}%)`,
      top: `calc(50% + ${(transform?.y || 0) / 3.6}%)`,
      transform: 'translate(-50%, -50%)'
    };
  };

  if (!processed.length) return null;

  return (
    <div className="mt-4 rounded-2xl border border-[#DDD8CE] bg-[#FFFDF9] p-3.5 sm:p-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm sm:text-base font-extrabold text-[#35312C]">🧰 {t.title}</h4>
          {engineLabel && (
            <span className="rounded-full bg-[#EEF4EA] px-2 py-1 text-[10px] font-extrabold leading-none text-[#587052]">
              {engineLabel}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs sm:text-[13px] leading-5 text-[#746E65]">{t.ready}</p>
      </div>

      <div className="mt-3 rounded-xl border border-[#E4DED5] bg-white p-2.5 sm:p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="shrink-0 text-[11px] font-extrabold text-[#625C54] sm:text-xs">{t.sizeLabel}</span>
          <div className="grid flex-1 grid-cols-3 gap-1.5 sm:max-w-sm">
            {[1, 2, 4].map((scale) => {
              const size = 360 * scale;
              const active = outputScale === scale;
              return (
                <button
                  key={scale}
                  type="button"
                  disabled={working}
                  onClick={() => changeOutputScale(scale)}
                  className={`rounded-lg border px-1.5 py-1.5 text-center transition disabled:opacity-50 ${active ? 'border-[#6F8C68] bg-[#EEF5EA] text-[#3F5F3A]' : 'border-[#DDD7CE] bg-[#FBFAF7] text-[#6C655D]'}`}
                >
                  <span className="block text-[11px] font-black leading-4 sm:text-xs">{size}</span>
                  <span className="block text-[8px] font-bold leading-3 sm:text-[9px]">{scale === 1 ? t.basic : `${scale}× ${t.upscale}`}</span>
                </button>
              );
            })}
          </div>
        </div>
        <p className="mt-2 text-[10px] font-medium leading-4 text-[#817970] sm:text-[11px]">{t.qualityNote}</p>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <button type="button" disabled={working} onClick={normalizeAll} className="min-h-11 rounded-xl border border-[#BFCDBA] bg-[#F3F8F0] px-2.5 py-2 text-xs font-extrabold leading-5 text-[#4F684A] disabled:opacity-50 sm:px-3">▣ {working ? t.working : normalizeLabel}</button>
        <button type="button" disabled={working} onClick={downloadZip} className="min-h-11 rounded-xl bg-[#3E6B4B] px-2.5 py-2 text-xs font-extrabold leading-5 text-white shadow-sm disabled:opacity-50 sm:px-3">📦 {working ? t.working : t.zip}</button>
      </div>

      {error && <div className="mt-3 rounded-xl bg-[#FFF1EE] px-3 py-2.5 text-xs font-semibold text-[#A64D3D]">{error}</div>}

      {reviewCount > 0 && (
        <div className="mt-3 rounded-xl border border-[#F0D29A] bg-[#FFF8E8] px-3 py-2.5 text-[11px] font-semibold leading-5 text-[#7A5925] sm:text-xs" role="status">
          ⚠️ {t.reviewSummary(reviewCount)}
        </div>
      )}

      <div className="mt-3 grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-2.5">
        {processed.map((item) => (
          <div key={item.index} className={`min-w-0 overflow-hidden rounded-xl border bg-white shadow-sm ${item.needsReview ? 'border-[#E7B85F] ring-1 ring-[#F5D99F]' : 'border-[#E2DDD5]'}`}>
            <div className="flex h-8 items-center justify-between gap-1 border-b border-[#EEEAE3] bg-[#FBFAF7] px-2">
              <span className="text-xs font-black leading-none text-[#5B554E]">{String(item.index).padStart(2, '0')}</span>
              <div className="flex min-w-0 items-center gap-1">
                <span className={`rounded-md px-1.5 py-1 text-[10px] font-extrabold leading-none ${item.needsReview ? 'bg-[#FFF0CC] text-[#8A5A11]' : 'bg-[#EEF4EA] text-[#5B6E56]'}`}>{item.needsReview ? `⚠ ${t.review}` : (item.finalBlob ? outputSize : t.raw)}</span>
                {item.finalBlob && outputScale > 1 && <span className="rounded-md bg-[#F1ECE5] px-1 py-1 text-[10px] font-extrabold leading-none text-[#75644E]">↑{outputScale}×</span>}
              </div>
            </div>
            <button
              type="button"
              onClick={() => openEditor(item)}
              aria-label={`${String(item.index).padStart(2, '0')} ${t.edit}`}
              className="block aspect-square w-full touch-manipulation overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#6F8C68]"
              style={checkerStyle}
            >
              {item.finalUrl ? (
                <img src={item.finalUrl} alt={`emoticon ${item.index}`} className="h-full w-full object-contain" />
              ) : (
                <img src={item.url} alt={`emoticon ${item.index}`} className="h-full w-full object-contain p-1.5" />
              )}
            </button>
            <div className="grid grid-cols-2 border-t border-[#EEEAE3] bg-white">
              <button type="button" onClick={() => openEditor(item)} className="min-h-10 touch-manipulation whitespace-nowrap border-r border-[#EEEAE3] px-1.5 py-2 text-xs font-extrabold leading-5 text-[#6A5A46] hover:bg-[#FFF9F0]">✏️ {t.edit}</button>
              <button type="button" onClick={() => downloadItem(item)} className="min-h-10 touch-manipulation whitespace-nowrap px-1.5 py-2 text-xs font-extrabold leading-5 text-[#4E664A] hover:bg-[#F8FBF6]">↓ {t.save}</button>
            </div>
          </div>
        ))}
      </div>

      {current && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-5" onMouseDown={(e) => { if (e.target === e.currentTarget && !working) setEditingIndex(null); }}>
          <div className="w-full max-w-md rounded-t-3xl bg-[#FFFDF9] p-4 shadow-2xl sm:rounded-3xl sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-extrabold text-[#35312C]">✏️ {t.editorTitle} · {outputSize}×{outputSize} · {current.index}</h4>
              <button type="button" disabled={working} onClick={() => setEditingIndex(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0ECE5] font-bold text-[#625B52]">×</button>
            </div>

            <div className="mx-auto mt-4 aspect-square w-full max-w-[360px] overflow-hidden rounded-2xl border border-[#DDD8CE]" style={checkerStyle}>
              <div className="relative h-full w-full overflow-hidden">
                <img src={current.url} alt={`edit ${current.index}`} draggable={false} className="absolute object-contain" style={previewStyle(current, editor)} />
              </div>
            </div>

            {current.needsReview && (
              <div className="mt-3 rounded-xl border border-[#F0D29A] bg-[#FFF8E8] px-3 py-2 text-[11px] font-semibold leading-5 text-[#7A5925]">
                ⚠️ {t.reviewHint}
              </div>
            )}

            <div className="mt-4 space-y-3">
              <label className="block text-xs font-bold text-[#635D55]">{t.zoom} · {Math.round(editor.zoom * 100)}%
                <input type="range" min="0.65" max="1.35" step="0.01" value={editor.zoom} onChange={(e) => setEditor((v) => ({ ...v, zoom: Number(e.target.value) }))} className="mt-1 w-full" />
              </label>
              <label className="block text-xs font-bold text-[#635D55]">{t.x} · {Math.round(editor.x)}
                <input type="range" min="-60" max="60" step="1" value={editor.x} onChange={(e) => setEditor((v) => ({ ...v, x: Number(e.target.value) }))} className="mt-1 w-full" />
              </label>
              <label className="block text-xs font-bold text-[#635D55]">{t.y} · {Math.round(editor.y)}
                <input type="range" min="-60" max="60" step="1" value={editor.y} onChange={(e) => setEditor((v) => ({ ...v, y: Number(e.target.value) }))} className="mt-1 w-full" />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button type="button" disabled={working} onClick={() => setEditor({ zoom: 1, x: 0, y: 0 })} className="rounded-xl border border-[#D8D0C5] bg-white px-3 py-3 text-xs font-extrabold text-[#625A51]">{t.reset}</button>
              <button type="button" disabled={working} onClick={() => setEditingIndex(null)} className="rounded-xl border border-[#D8D0C5] bg-white px-3 py-3 text-xs font-extrabold text-[#625A51]">{t.cancel}</button>
              <button type="button" disabled={working} onClick={applyEditor} className="rounded-xl bg-[#3E6B4B] px-3 py-3 text-xs font-extrabold text-white">{working ? t.working : t.apply}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
