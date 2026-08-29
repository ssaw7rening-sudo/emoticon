import React, { useEffect, useRef, useState } from 'react';

let removerPromise = null;

const COPY = {
  ko: {
    title: '배경 제거', badge: 'BETA', desc: '이미지의 배경을 AI로 지우고 투명 PNG로 저장해 보세요.',
    privacy: '이미지는 서버에 업로드하지 않고 이 기기에서 처리됩니다.', first: '첫 실행은 AI 모델을 준비하느라 조금 오래 걸릴 수 있습니다.',
    upload: '이미지를 선택하거나 여기에 끌어놓으세요', format: 'PNG · JPG · WEBP / 최대 12MB', change: '이미지 변경',
    remove: '배경 제거하기', preparing: 'AI 모델 준비 중…', processing: '배경을 제거하고 있어요…',
    original: '원본', result: '투명 배경', download: '투명 PNG 저장', again: '다른 이미지',
    badType: 'PNG, JPG, WEBP 이미지만 사용할 수 있습니다.', tooLarge: '12MB 이하의 이미지를 사용해 주세요.', failed: '배경 제거에 실패했습니다. 다른 이미지로 다시 시도해 주세요.'
  },
  en: {
    title: 'Remove Background', badge: 'BETA', desc: 'Remove an image background with AI and save it as a transparent PNG.',
    privacy: 'Your image is processed on this device and is not uploaded to our server.', first: 'The first run may take longer while the AI model is prepared.',
    upload: 'Choose an image or drop it here', format: 'PNG · JPG · WEBP / up to 12MB', change: 'Change image',
    remove: 'Remove background', preparing: 'Preparing AI model…', processing: 'Removing background…',
    original: 'Original', result: 'Transparent', download: 'Save transparent PNG', again: 'Try another image',
    badType: 'Please use a PNG, JPG, or WEBP image.', tooLarge: 'Please use an image under 12MB.', failed: 'Background removal failed. Please try another image.'
  },
  ja: {
    title: '背景を削除', badge: 'BETA', desc: 'AIで画像の背景を削除し、透過PNGとして保存できます。',
    privacy: '画像はサーバーへ送信せず、この端末内で処理します。', first: '初回はAIモデルの準備に少し時間がかかる場合があります。',
    upload: '画像を選択するか、ここにドロップしてください', format: 'PNG · JPG · WEBP / 最大12MB', change: '画像を変更',
    remove: '背景を削除する', preparing: 'AIモデルを準備中…', processing: '背景を削除しています…',
    original: '元画像', result: '透過背景', download: '透過PNGを保存', again: '別の画像',
    badType: 'PNG、JPG、WEBP画像のみ使用できます。', tooLarge: '12MB以下の画像を使用してください。', failed: '背景の削除に失敗しました。別の画像でもう一度お試しください。'
  },
  zh: {
    title: '移除背景', badge: 'BETA', desc: '使用AI移除图片背景，并保存为透明PNG。',
    privacy: '图片不会上传到服务器，而是在当前设备中处理。', first: '首次使用需要准备AI模型，可能会稍慢一些。',
    upload: '选择图片或将图片拖到这里', format: 'PNG · JPG · WEBP / 最大12MB', change: '更换图片',
    remove: '移除背景', preparing: '正在准备AI模型…', processing: '正在移除背景…',
    original: '原图', result: '透明背景', download: '保存透明PNG', again: '换一张图片',
    badType: '仅支持PNG、JPG、WEBP图片。', tooLarge: '请使用12MB以内的图片。', failed: '背景移除失败，请换一张图片重试。'
  }
};

const checkerStyle = {
  backgroundColor: '#fff',
  backgroundImage: 'linear-gradient(45deg,#eceae5 25%,transparent 25%),linear-gradient(-45deg,#eceae5 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eceae5 75%),linear-gradient(-45deg,transparent 75%,#eceae5 75%)',
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0,0 10px,10px -10px,-10px 0px'
};

async function getRemover(onProgress) {
  if (!removerPromise) {
    removerPromise = (async () => {
      const { pipeline } = await import('@huggingface/transformers');
      return pipeline('background-removal', 'onnx-community/ormbg-ONNX', {
        dtype: 'q8',
        progress_callback: (info) => onProgress?.(info)
      });
    })().catch((error) => {
      removerPromise = null;
      throw error;
    });
  }
  return removerPromise;
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

  useEffect(() => () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [sourceUrl, resultUrl]);

  const clearResult = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl('');
    setResultBlob(null);
    setError('');
    setProgress(null);
    setStage('');
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
    if (!file || !sourceUrl || busy) return;
    clearResult();
    setBusy(true);
    setStage('preparing');
    try {
      const remover = await getRemover((info) => {
        if (typeof info?.progress === 'number') setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
      });
      setStage('processing');
      setProgress(null);
      const output = await remover(sourceUrl);
      const image = Array.isArray(output) ? output[0] : output?.[0];
      if (!image?.toBlob) throw new Error('No removable image output');
      const blob = await image.toBlob();
      if (!blob) throw new Error('No output blob');
      const url = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResultUrl(url);
    } catch (e) {
      console.error('Background removal failed:', e);
      setError(t.failed);
    } finally {
      setBusy(false);
      setStage('');
      setProgress(null);
    }
  };

  const download = () => {
    if (!resultBlob || !resultUrl) return;
    const base = (file?.name || 'image').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9가-힣ぁ-んァ-ン一-龥_-]+/g, '-');
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${base || 'image'}-transparent.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
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
          <div className={`grid gap-3 ${resultUrl ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
            <div className="overflow-hidden rounded-2xl border border-[#E2DDD5] bg-white">
              <div className="border-b border-[#EEE9E1] px-3 py-2 text-xs font-bold text-[#716A62]">{t.original}</div>
              <div className="flex min-h-[230px] items-center justify-center bg-[#F7F5F1] p-3">
                <img src={sourceUrl} alt={t.original} className="max-h-[420px] max-w-full rounded-xl object-contain" />
              </div>
            </div>
            {resultUrl && (
              <div className="overflow-hidden rounded-2xl border border-[#D8E0D2] bg-white">
                <div className="border-b border-[#E7ECE3] px-3 py-2 text-xs font-bold text-[#61705D]">{t.result}</div>
                <div className="flex min-h-[230px] items-center justify-center p-3" style={checkerStyle}>
                  <img src={resultUrl} alt={t.result} className="max-h-[420px] max-w-full rounded-xl object-contain" />
                </div>
              </div>
            )}
          </div>

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
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => selectFile(e.target.files?.[0])} />
      {!sourceUrl && error && <div className="mt-3 rounded-xl bg-[#FFF1EE] px-3.5 py-3 text-sm font-semibold text-[#A64D3D]">{error}</div>}
    </section>
  );
}
