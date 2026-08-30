from pathlib import Path

path = Path('src/components/BackgroundRemover.jsx')
s = path.read_text(encoding='utf-8')

def rep(old, new, label):
    global s
    if old not in s:
        raise SystemExit(f'Missing anchor: {label}')
    s = s.replace(old, new, 1)

rep(
"let removerPromise = null;\n",
"let removerPromise = null;\nlet modnetPromise = null;\nlet birefNetPromise = null;\n",
'promise vars')

# Localized model retry copy.
copy_pairs = [
("    qualityWarnTitle: '일부 배경이 남아 있을 수 있어요', qualityWarnDesc: '슬라이더로 원본과 결과를 확인한 뒤 저장해 주세요.',\n    badType:",
 "    qualityWarnTitle: '일부 배경이 남아 있을 수 있어요', qualityWarnDesc: '슬라이더로 원본과 결과를 확인한 뒤 저장해 주세요.',\n    precisionRetry: '정밀 재처리', precisionHint: 'BiRefNet Lite를 사용합니다. 첫 실행은 모델 다운로드로 오래 걸릴 수 있습니다.', precisionWorking: '정밀 모델로 다시 처리하고 있어요…', precisionNoBetter: '정밀 재처리 결과가 현재 결과보다 좋아지지 않아 기존 결과를 유지했습니다.',\n    badType:"),
("    qualityWarnTitle: 'Some background may remain', qualityWarnDesc: 'Compare the original and result with the slider before saving.',\n    badType:",
 "    qualityWarnTitle: 'Some background may remain', qualityWarnDesc: 'Compare the original and result with the slider before saving.',\n    precisionRetry: 'Precision retry', precisionHint: 'Uses BiRefNet Lite. The first run may take longer while the model downloads.', precisionWorking: 'Retrying with the precision model…', precisionNoBetter: 'The precision retry was not better, so the current result was kept.',\n    badType:"),
("    qualityWarnTitle: '背景が一部残っている可能性があります', qualityWarnDesc: 'スライダーで元画像と結果を確認してから保存してください。',\n    badType:",
 "    qualityWarnTitle: '背景が一部残っている可能性があります', qualityWarnDesc: 'スライダーで元画像と結果を確認してから保存してください。',\n    precisionRetry: '高精度で再処理', precisionHint: 'BiRefNet Liteを使用します。初回はモデルのダウンロードで時間がかかる場合があります。', precisionWorking: '高精度モデルで再処理しています…', precisionNoBetter: '高精度処理でも改善しなかったため、現在の結果を維持しました。',\n    badType:"),
("    qualityWarnTitle: '可能仍有部分背景残留', qualityWarnDesc: '请先用滑块对比原图和结果，再决定是否保存。',\n    badType:",
 "    qualityWarnTitle: '可能仍有部分背景残留', qualityWarnDesc: '请先用滑块对比原图和结果，再决定是否保存。',\n    precisionRetry: '高精度重试', precisionHint: '使用 BiRefNet Lite。首次运行需要下载模型，可能耗时较长。', precisionWorking: '正在使用高精度模型重新处理…', precisionNoBetter: '高精度重试没有改善，因此保留当前结果。',\n    badType:")]
for i, (a,b) in enumerate(copy_pairs): rep(a,b,f'copy {i}')

# Add MODNet and BiRefNet loaders after getRemover.
anchor = "function alphaPercentile(histogram, visibleCount, percentile) {\n"
helpers = r'''async function getModnetRemover(onProgress) {
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

async function getBiRefNet(onProgress) {
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
  const { model, processor, RawImage } = await getBiRefNet(onProgress);
  const rawImage = await RawImage.fromBlob(file);
  const { pixel_values } = await processor(rawImage);
  const output = await model({ input_image: pixel_values });
  const tensor = output?.output_image || output?.output;
  if (!tensor?.[0]) throw new Error('BiRefNet output is unavailable');

  const mask = await RawImage.fromTensor(tensor[0].sigmoid().mul(255).to('uint8'))
    .resize(rawImage.width, rawImage.height);
  const maskCanvas = mask.toCanvas();
  const { canvas, ctx } = await drawFileToCanvas(file);
  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
  ctx.restore();
  return canvasToPngBlob(canvas);
}

function qualityRank(quality) {
  if (!quality) return 99;
  const statusBase = quality.status === 'pass' ? 0 : quality.status === 'warning' ? 10 : 20;
  return statusBase + (quality.score || 0);
}

'''
rep(anchor, helpers + anchor, 'model helpers')

# Replace removeWithAi with shared loader implementation to avoid duplication.
old = r'''async function removeWithAi(file, onProgress) {
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
'''
new = r'''async function removeWithAi(file, onProgress) {
  const blob = await pipelineRemovalToBlob(file, getRemover, onProgress);
  const corrected = await correctUnexpectedForegroundTransparency(blob);
  return cleanAiForegroundArtifacts(corrected);
}
'''
rep(old,new,'removeWithAi')

# Add precision result message state.
rep(
"  const [resultMethod, setResultMethod] = useState('');\n",
"  const [resultMethod, setResultMethod] = useState('');\n  const [precisionMessage, setPrecisionMessage] = useState('');\n",
'precision state')
rep(
"    setResultMethod('');\n    setError('');",
"    setResultMethod('');\n    setPrecisionMessage('');\n    setError('');",
'clear precision state')

# Replace AI path with automatic MODNet retry when ORMBG quality is poor.
old_remove = r'''      if (!blob) {
        method = 'ai';
        setStage('preparing');
        blob = await removeWithAi(file, (info) => {
          if (typeof info?.progress === 'number') {
            setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
          }
        });
      }

      setStage('processing');
      setProgress(null);
      const quality = method === 'ai' ? await assessRemovalQuality(blob) : { status: 'pass', score: 0 };
      const url = URL.createObjectURL(blob);
      setResultMethod(method);
      setQualityAssessment(quality);
'''
new_remove = r'''      let quality = { status: 'pass', score: 0 };
      if (!blob) {
        method = 'ai';
        setStage('preparing');
        blob = await removeWithAi(file, (info) => {
          if (typeof info?.progress === 'number') {
            setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
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
                setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
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
      const url = URL.createObjectURL(blob);
      setResultMethod(method);
      setQualityAssessment(quality);
'''
rep(old_remove,new_remove,'auto modnet retry')

# Add precision retry function before downloadBlob.
anchor2 = "  const downloadBlob = (blob, filename) => {\n"
precision_fn = r'''  const runPrecisionRetry = async () => {
    if (!file || busy || !resultBlob) return;
    setBusy(true);
    setStage('precision');
    setProgress(null);
    setPrecisionMessage('');
    try {
      const precisionBlob = await removeWithBiRefNet(file, (info) => {
        if (typeof info?.progress === 'number') {
          setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
        }
      });
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

'''
rep(anchor2,precision_fn+anchor2,'precision function')

# Busy status label handles precision.
rep(
"{stage === 'preparing' ? t.preparing : t.processing}",
"{stage === 'precision' ? t.precisionWorking : (stage === 'preparing' ? t.preparing : t.processing)}",
'busy status label')
rep(
"{busy ? (stage === 'preparing' ? t.preparing : t.processing) : `✨ ${t.remove}`}",
"{busy ? (stage === 'precision' ? t.precisionWorking : (stage === 'preparing' ? t.preparing : t.processing)) : `✨ ${t.remove}`}",
'remove button busy label')

# Add precision button under quality notices, only for non-BiRefNet AI results.
anchor3 = '''          {resultUrl && resultMethod === 'ai' && qualityAssessment.status === 'warning' && (\n            <div className="mt-4 rounded-xl border border-[#E7D5A4] bg-[#FFFBEF] px-3.5 py-3">\n              <div className="text-sm font-extrabold text-[#806A32]">⚠️ {t.qualityWarnTitle}</div>\n              <p className="mt-1 text-xs sm:text-[13px] font-medium leading-5 text-[#7B704F]">{t.qualityWarnDesc}</p>\n            </div>\n          )}\n\n          <div className="mt-4 flex flex-col gap-2 sm:flex-row">'''
replacement3 = '''          {resultUrl && ['ai', 'modnet'].includes(resultMethod) && qualityAssessment.status === 'warning' && (\n            <div className="mt-4 rounded-xl border border-[#E7D5A4] bg-[#FFFBEF] px-3.5 py-3">\n              <div className="text-sm font-extrabold text-[#806A32]">⚠️ {t.qualityWarnTitle}</div>\n              <p className="mt-1 text-xs sm:text-[13px] font-medium leading-5 text-[#7B704F]">{t.qualityWarnDesc}</p>\n            </div>\n          )}\n\n          {resultUrl && ['ai', 'modnet'].includes(resultMethod) && ['warning', 'fail'].includes(qualityAssessment.status) && (\n            <div className="mt-3 rounded-xl border border-[#D8D0C5] bg-white px-3.5 py-3">\n              <button type="button" disabled={busy} onClick={runPrecisionRetry} className="w-full rounded-xl bg-[#4B5868] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#394554] disabled:cursor-wait disabled:opacity-60">\n                🧪 {busy && stage === 'precision' ? t.precisionWorking : t.precisionRetry}\n              </button>\n              <p className="mt-2 text-[11px] sm:text-xs font-medium leading-5 text-[#7B746B]">{t.precisionHint}</p>\n            </div>\n          )}\n\n          {precisionMessage && <div className="mt-3 rounded-xl bg-[#F6F3EE] px-3.5 py-3 text-xs sm:text-[13px] font-semibold leading-5 text-[#6F675E]">{precisionMessage}</div>}\n\n          <div className="mt-4 flex flex-col gap-2 sm:flex-row">'''
rep(anchor3,replacement3,'precision UI')

# Fail notice should cover MODNet too.
rep(
"resultUrl && resultMethod === 'ai' && qualityAssessment.status === 'fail'",
"resultUrl && ['ai', 'modnet'].includes(resultMethod) && qualityAssessment.status === 'fail'",
'fail notice method')

path.write_text(s, encoding='utf-8')
print('patched Hugging Face model fallback and precision retry')
