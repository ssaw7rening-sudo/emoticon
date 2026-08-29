import React, { useEffect, useMemo, useState } from 'react';

const COPY = {
  ko: {
    title: '이모티콘 마무리', ready: '분리된 15개 이미지를 수정하고 360×360 규격으로 저장할 수 있습니다.',
    normalizeAll: '전체 360×360 변환', zip: 'ZIP 일괄 저장', working: '처리 중…', edit: '수정', save: 'PNG 저장',
    editorTitle: '360×360 미세조정', zoom: '크기', x: '좌우 위치', y: '상하 위치', reset: '초기화', cancel: '취소', apply: '수정 적용',
    normalized: '360', raw: '자동', zipName: 'emoticon-360', failed: '이미지 처리 중 오류가 발생했습니다.'
  },
  en: {
    title: 'Finish emoticons', ready: 'Fine-tune the 15 split images and export them at 360×360.',
    normalizeAll: 'Convert all to 360×360', zip: 'Download ZIP', working: 'Processing…', edit: 'Edit', save: 'Save PNG',
    editorTitle: 'Fine-tune 360×360', zoom: 'Size', x: 'Horizontal', y: 'Vertical', reset: 'Reset', cancel: 'Cancel', apply: 'Apply edit',
    normalized: '360', raw: 'Auto', zipName: 'emoticon-360', failed: 'An error occurred while processing the image.'
  },
  ja: {
    title: '絵文字の仕上げ', ready: '分割した15枚を微調整し、360×360で保存できます。',
    normalizeAll: 'すべて360×360に変換', zip: 'ZIP一括保存', working: '処理中…', edit: '編集', save: 'PNG保存',
    editorTitle: '360×360微調整', zoom: 'サイズ', x: '左右位置', y: '上下位置', reset: 'リセット', cancel: 'キャンセル', apply: '編集を適用',
    normalized: '360', raw: '自動', zipName: 'emoticon-360', failed: '画像処理中にエラーが発生しました。'
  },
  zh: {
    title: '表情包收尾', ready: '可微调已分割的15张图片，并按360×360规格保存。',
    normalizeAll: '全部转换为360×360', zip: 'ZIP批量保存', working: '处理中…', edit: '调整', save: '保存PNG',
    editorTitle: '360×360微调', zoom: '大小', x: '左右位置', y: '上下位置', reset: '重置', cancel: '取消', apply: '应用调整',
    normalized: '360', raw: '自动', zipName: 'emoticon-360', failed: '图片处理时发生错误。'
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

async function make360(blob, transform = { zoom: 1, x: 0, y: 0 }) {
  const image = await loadBitmap(blob);
  const width = image.width || image.naturalWidth;
  const height = image.height || image.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = 360;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  const safeSize = 300;
  const fit = Math.min(safeSize / Math.max(1, width), safeSize / Math.max(1, height));
  const scale = fit * Math.max(0.55, Math.min(1.45, transform.zoom || 1));
  const drawW = width * scale;
  const drawH = height * scale;
  const x = (360 - drawW) / 2 + (transform.x || 0);
  const y = (360 - drawH) / 2 + (transform.y || 0);
  ctx.drawImage(image, x, y, drawW, drawH);
  image.close?.();
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

export default function EmoticonPostProcessor({ items = [], sourceName = 'emoticon', lang = 'ko' }) {
  const t = COPY[lang] || COPY.ko;
  const [processed, setProcessed] = useState([]);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editor, setEditor] = useState({ zoom: 1, x: 0, y: 0 });

  useEffect(() => {
    setProcessed((previous) => {
      previous.forEach((item) => item.finalUrl && URL.revokeObjectURL(item.finalUrl));
      return items.map((item) => ({ ...item, transform: { zoom: 1, x: 0, y: 0 }, finalBlob: null, finalUrl: '' }));
    });
    setEditingIndex(null);
    setError('');
  }, [items]);

  useEffect(() => () => {
    processed.forEach((item) => item.finalUrl && URL.revokeObjectURL(item.finalUrl));
  }, [processed]);

  const current = useMemo(() => processed.find((item) => item.index === editingIndex) || null, [processed, editingIndex]);
  const base = safeBaseName(sourceName);

  const saveProcessedItem = async (item, transform) => {
    const blob = await make360(item.blob, transform);
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
        const blob = await make360(item.blob, transform);
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
      downloadBlob(blob, `${base}-${String(item.index).padStart(2, '0')}-360.png`);
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
          blob = await make360(item.blob, item.transform || { zoom: 1, x: 0, y: 0 });
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
      downloadBlob(zipBlob, `${base}-${t.zipName}.zip`);
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm sm:text-base font-extrabold text-[#35312C]">🧰 {t.title}</h4>
          <p className="mt-1 text-xs sm:text-[13px] leading-5 text-[#746E65]">{t.ready}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={working} onClick={normalizeAll} className="rounded-xl border border-[#BFCDBA] bg-[#F3F8F0] px-3 py-2 text-xs font-extrabold text-[#4F684A] disabled:opacity-50">▣ {working ? t.working : t.normalizeAll}</button>
          <button type="button" disabled={working} onClick={downloadZip} className="rounded-xl bg-[#3E6B4B] px-3 py-2 text-xs font-extrabold text-white shadow-sm disabled:opacity-50">📦 {working ? t.working : t.zip}</button>
        </div>
      </div>

      {error && <div className="mt-3 rounded-xl bg-[#FFF1EE] px-3 py-2.5 text-xs font-semibold text-[#A64D3D]">{error}</div>}

      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-2.5">
        {processed.map((item) => (
          <div key={item.index} className="overflow-hidden rounded-xl border border-[#E2DDD5] bg-white shadow-sm">
            <div className="relative aspect-square overflow-hidden" style={checkerStyle}>
              {item.finalUrl ? (
                <img src={item.finalUrl} alt={`emoticon ${item.index}`} className="h-full w-full object-contain" />
              ) : (
                <img src={item.url} alt={`emoticon ${item.index}`} className="h-full w-full object-contain p-1.5" />
              )}
              <span className="absolute left-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-md bg-black/55 px-1 text-[9px] font-extrabold leading-none text-white shadow-sm">{String(item.index).padStart(2, '0')}</span>
              <span className="absolute right-1 top-1 rounded-md bg-white/88 px-1.5 py-0.5 text-[8px] font-extrabold leading-none text-[#5B6E56] shadow-sm backdrop-blur-[1px]">✓ {item.finalBlob ? t.normalized : t.raw}</span>
            </div>
            <div className="grid grid-cols-2 border-t border-[#EEEAE3] bg-white">
              <button type="button" onClick={() => openEditor(item)} className="whitespace-nowrap border-r border-[#EEEAE3] px-1 py-1.5 text-[9px] font-extrabold leading-5 text-[#6A5A46] hover:bg-[#FFF9F0] sm:text-[10px]">✏️ {t.edit}</button>
              <button type="button" onClick={() => downloadItem(item)} className="whitespace-nowrap px-1 py-1.5 text-[9px] font-extrabold leading-5 text-[#4E664A] hover:bg-[#F8FBF6] sm:text-[10px]">↓ {t.save}</button>
            </div>
          </div>
        ))}
      </div>

      {current && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-5" onMouseDown={(e) => { if (e.target === e.currentTarget && !working) setEditingIndex(null); }}>
          <div className="w-full max-w-md rounded-t-3xl bg-[#FFFDF9] p-4 shadow-2xl sm:rounded-3xl sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-extrabold text-[#35312C]">✏️ {t.editorTitle} · {current.index}</h4>
              <button type="button" disabled={working} onClick={() => setEditingIndex(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0ECE5] font-bold text-[#625B52]">×</button>
            </div>

            <div className="mx-auto mt-4 aspect-square w-full max-w-[360px] overflow-hidden rounded-2xl border border-[#DDD8CE]" style={checkerStyle}>
              <div className="relative h-full w-full overflow-hidden">
                <img src={current.url} alt={`edit ${current.index}`} draggable={false} className="absolute object-contain" style={previewStyle(current, editor)} />
              </div>
            </div>

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
