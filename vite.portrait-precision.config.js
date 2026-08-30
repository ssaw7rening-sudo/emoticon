import { defineConfig } from 'vite'
import baseConfig from './vite.text-default.config.js'

function backgroundQualityRouting() {
  return {
    name: 'background-quality-routing',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      // Fast removal is reserved for genuinely uniform backgrounds. If any of
      // these source snippets change in a future refactor, skip that one rule
      // instead of breaking production builds; the AI route is the safe fallback.
      const strictFastReplacements = [
        [
          '.filter((patch) => patch && patch.spread <= 24);',
          '.filter((patch) => patch && patch.spread <= 12);'
        ],
        [
          'if (patches.length < 4) return null;',
          'if (patches.length < 6) return null;'
        ],
        [
          'const group = patches.filter((patch) => colorDistance(seed.mean, patch.mean) <= 42);',
          'const group = patches.filter((patch) => colorDistance(seed.mean, patch.mean) <= 22);'
        ],
        [
          'if (bestGroup.length < 4) return null;',
          'if (bestGroup.length < 6) return null;'
        ],
        [
          'const tolerance = Math.max(24, Math.min(52, 24 + groupSpread * 1.35));',
          'const tolerance = Math.max(14, Math.min(30, 14 + groupSpread * 0.9));'
        ]
      ]

      for (const [from, to] of strictFastReplacements) {
        if (transformed.includes(from)) transformed = transformed.replace(from, to)
      }

      // Add mobile-aware inference helpers once. Heavy WASM models receive a
      // resized working image, while preserveOriginalRgb restores the original
      // resolution and RGB data after the alpha mask has been generated.
      const canvasHelper = `const canvasToPngBlob = (canvas) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (blob) resolve(blob);
    else reject(new Error('Canvas PNG export failed'));
  }, 'image/png');
});`

      if (!transformed.includes('MOBILE_BG_REMOVAL_STABILITY_V2')) {
        if (!transformed.includes(canvasHelper)) {
          throw new Error('[background-quality] canvas helper pattern was not found')
        }
        transformed = transformed.replace(
          canvasHelper,
          `${canvasHelper}

// MOBILE_BG_REMOVAL_STABILITY_V2
function isMobileLikeDevice() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Android|iPhone|iPad|iPod/i.test(ua) || window.innerWidth < 900;
}

function isHeavyInferenceError(error) {
  const text = String(error?.message || error || '').toLowerCase();
  return [
    'out of memory', 'memory', 'wasm', 'webassembly', 'abort', 'allocation',
    'tensor', 'out of bounds', 'runtimeerror', 'failed to fetch', 'network', 'compile'
  ].some((keyword) => text.includes(keyword));
}

const canvasToInferenceBlob = (canvas, type = 'image/jpeg', quality = 0.92) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (blob) resolve(blob);
    else reject(new Error('Canvas export failed'));
  }, type, quality);
});

async function createInferenceInputFile(file, maxSide = 1400) {
  const { canvas } = await drawFileToCanvas(file);
  const { width, height } = canvas;
  const longest = Math.max(width, height);
  if (!longest || longest <= maxSide) return file;

  const scale = maxSide / longest;
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));
  const resizedCanvas = document.createElement('canvas');
  resizedCanvas.width = targetWidth;
  resizedCanvas.height = targetHeight;
  const resizedCtx = resizedCanvas.getContext('2d');
  if (!resizedCtx) throw new Error('Resize canvas unavailable');
  resizedCtx.imageSmoothingEnabled = true;
  resizedCtx.imageSmoothingQuality = 'high';
  resizedCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

  const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const resizedBlob = await canvasToInferenceBlob(resizedCanvas, mimeType, 0.92);
  const baseName = (file.name || 'image').replace(/\\.[^.]+$/, '');
  const ext = mimeType === 'image/png' ? 'png' : 'jpg';
  return new File([resizedBlob], baseName + '-inference.' + ext, { type: mimeType });
}`
        )
      }

      const pipelinePattern = /async function pipelineRemovalToBlob\(file, loader, onProgress\) \{[\s\S]*?\n\}/
      if (!pipelinePattern.test(transformed)) {
        throw new Error('[background-quality] pipeline removal pattern was not found')
      }
      transformed = transformed.replace(
        pipelinePattern,
        `async function pipelineRemovalToBlob(file, loader, onProgress) {
  const mobile = isMobileLikeDevice();
  const portraitModel = loader === getModnetRemover;
  const primaryMaxSide = portraitModel ? (mobile ? 1280 : 1800) : (mobile ? 1400 : 2200);
  const retryMaxSide = portraitModel ? (mobile ? 960 : 1400) : (mobile ? 1024 : 1600);

  const run = async (maxSide) => {
    const preparedFile = await createInferenceInputFile(file, maxSide);
    const { remover, RawImage } = await loader(onProgress);
    const rawImage = await RawImage.fromBlob(preparedFile);
    const output = await remover([rawImage]);
    const image = Array.isArray(output) ? output[0] : output;
    if (image instanceof Blob) return image;
    if (!image?.toBlob) throw new Error('No removable image output');
    const blob = await image.toBlob();
    if (!blob) throw new Error('No output blob');
    return blob;
  };

  try {
    return await run(primaryMaxSide);
  } catch (error) {
    if (!isHeavyInferenceError(error) || retryMaxSide >= primaryMaxSide) throw error;
    onProgress?.({ progress: 0 });
    return run(retryMaxSide);
  }
}`
      )

      // The pre-plugin already injects preserveOriginalRgb. Replace its pixel-array
      // implementation with Canvas compositing to reduce peak mobile memory while
      // keeping the original image colors and output dimensions.
      const preservePattern = /async function preserveOriginalRgb\(file, alphaBlob\) \{[\s\S]*?\n\}\n\nasync function removeWithModnet/
      if (!preservePattern.test(transformed)) {
        throw new Error('[background-quality] preserveOriginalRgb pattern was not found')
      }
      transformed = transformed.replace(
        preservePattern,
        `async function preserveOriginalRgb(file, alphaBlob) {
  const { canvas: originalCanvas } = await drawFileToCanvas(file);
  const { canvas: alphaCanvas } = await drawFileToCanvas(alphaBlob);
  const { width, height } = originalCanvas;
  if (!width || !height || !alphaCanvas.width || !alphaCanvas.height) return alphaBlob;

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = width;
  outputCanvas.height = height;
  const outputCtx = outputCanvas.getContext('2d');
  if (!outputCtx) return alphaBlob;
  outputCtx.imageSmoothingEnabled = true;
  outputCtx.imageSmoothingQuality = 'high';
  outputCtx.drawImage(originalCanvas, 0, 0);
  outputCtx.globalCompositeOperation = 'destination-in';
  outputCtx.drawImage(alphaCanvas, 0, 0, alphaCanvas.width, alphaCanvas.height, 0, 0, width, height);
  outputCtx.globalCompositeOperation = 'source-over';
  return canvasToPngBlob(outputCanvas);
}

async function removeWithModnet`
      )

      const modnetPattern = /async function removeWithModnet\(file, onProgress\) \{[\s\S]*?\n\}/
      if (!modnetPattern.test(transformed)) {
        throw new Error('[background-quality] MODNet function pattern was not found')
      }
      transformed = transformed.replace(
        modnetPattern,
        `async function removeWithModnet(file, onProgress) {
  const blob = await pipelineRemovalToBlob(file, getModnetRemover, onProgress);
  const corrected = await correctUnexpectedForegroundTransparency(blob);
  const cleaned = await cleanAiForegroundArtifacts(corrected, true);
  return preserveOriginalRgb(file, cleaned);
}`
      )

      const aiPattern = /async function removeWithAi\(file, onProgress\) \{[\s\S]*?\n\}/
      if (!aiPattern.test(transformed)) {
        throw new Error('[background-quality] ORMBG function pattern was not found')
      }
      transformed = transformed.replace(
        aiPattern,
        `async function removeWithAi(file, onProgress) {
  const blob = await pipelineRemovalToBlob(file, getRemover, onProgress);
  const corrected = await correctUnexpectedForegroundTransparency(blob);
  const cleaned = await cleanAiForegroundArtifacts(corrected, true);
  return preserveOriginalRgb(file, cleaned);
}`
      )

      const birefPattern = /async function removeWithBiRefNet\(file, onProgress\) \{[\s\S]*?\n\}\nfunction qualityRank/
      if (!birefPattern.test(transformed)) {
        throw new Error('[background-quality] BiRefNet function pattern was not found')
      }
      transformed = transformed.replace(
        birefPattern,
        `async function removeWithBiRefNet(file, onProgress) {
  const preparedFile = await createInferenceInputFile(file, isMobileLikeDevice() ? 1280 : 1800);
  const { model, processor, RawImage } = await getBiRefNet(onProgress);
  const rawImage = await RawImage.fromBlob(preparedFile);
  const { pixel_values } = await processor(rawImage);
  const output = await model({ input_image: pixel_values });
  const tensor = output?.output_image || output?.output;
  if (!tensor?.[0]) throw new Error('BiRefNet output is unavailable');
  const mask = await RawImage.fromTensor(tensor[0].sigmoid().mul(255).to('uint8'))
    .resize(rawImage.width, rawImage.height);
  const { canvas, ctx } = await drawFileToCanvas(preparedFile);
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
  const matteBlob = await canvasToPngBlob(canvas);
  return preserveOriginalRgb(file, matteBlob);
}
function qualityRank`
      )

      // Desktop keeps the precision-first route. Mobile skips the automatic
      // BiRefNet -> MODNet -> ORMBG chain and starts with the lighter ORMBG path.
      const routePattern = /const\s+\{\s*canvas:\s*sourceCanvas\s*\}\s*=\s*await drawFileToCanvas\(file\);\s*const\s+portraitFirst\s*=\s*[\s\S]*?;/
      if (!routePattern.test(transformed)) {
        throw new Error('[background-quality] AI routing pattern was not found')
      }
      transformed = transformed.replace(
        routePattern,
        `const portraitFirst = !isMobileLikeDevice(); // desktop precision-first, mobile lightweight-first`
      )

      const precisionBranchPattern = /if\s*\(portraitFirst\)\s*\{[\s\S]*?\n\s*\}\s*else\s*\{/
      if (!precisionBranchPattern.test(transformed)) {
        throw new Error('[background-quality] Precision branch pattern was not found')
      }

      const precisionTarget = `if (portraitFirst) {
          // Desktop: use BiRefNet Lite first for difficult backgrounds, then keep
          // the existing fallbacks. Mobile bypasses this branch to avoid loading
          // several large WASM models in sequence.
          let precisionError = null;
          try {
            method = 'birefnet';
            setStage('preparing');
            setProgress(null);
            blob = await removeWithBiRefNet(file, (info) => {
              if (typeof info?.progress === 'number') {
                setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
              }
            });
            blob = await refineHairBackgroundChannels(blob);
            blob = await cleanAiForegroundArtifacts(blob);
            blob = await refinePrecisionEdges(blob);
            quality = await assessRemovalQuality(blob);
          } catch (error) {
            precisionError = error;
            blob = null;
            quality = { status: 'fail', score: 99 };
            console.warn('BiRefNet primary removal failed:', error);
          }

          if (!blob || quality.status === 'fail') {
            try {
              setStage('preparing');
              setProgress(null);
              const portraitBlob = await removeWithModnet(file, (info) => {
                if (typeof info?.progress === 'number') {
                  setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
                }
              });
              const portraitQuality = await assessRemovalQuality(portraitBlob);
              if (!blob || qualityRank(portraitQuality) < qualityRank(quality)) {
                blob = portraitBlob;
                quality = portraitQuality;
                method = 'modnet';
              }
            } catch (portraitError) {
              console.warn('MODNet fallback after BiRefNet failed:', portraitError);
            }
          }

          if (!blob || quality.status === 'fail') {
            try {
              setStage('preparing');
              setProgress(null);
              const generalBlob = await removeWithAi(file, (info) => {
                if (typeof info?.progress === 'number') {
                  setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
                }
              });
              const generalQuality = await assessRemovalQuality(generalBlob);
              if (!blob || qualityRank(generalQuality) < qualityRank(quality)) {
                blob = generalBlob;
                quality = generalQuality;
                method = 'ai';
              }
            } catch (generalError) {
              console.warn('ORMBG last-resort fallback failed:', generalError, precisionError);
            }
          }

          if (!blob) throw precisionError || new Error('Background removal failed');
        } else {`

      transformed = transformed.replace(precisionBranchPattern, precisionTarget)

      // On mobile, only attempt the additional MODNet fallback for smaller files.
      transformed = transformed.replace(
        "          if (quality.status !== 'pass') {",
        "          if (quality.status !== 'pass' && (!isMobileLikeDevice() || file.size <= 3 * 1024 * 1024)) {"
      )

      const copyReplacements = [
        [
          "failed: '배경 제거에 실패했습니다. 브라우저를 새로고침한 뒤 다시 시도해 주세요.'",
          "failed: '배경 제거를 완료하지 못했습니다. 아래 버튼으로 다시 시도해 주세요.', retryNow: '다시 시도', memoryFail: '기기 메모리 또는 AI 모델 로딩 문제로 처리에 실패했습니다. 다시 시도하면 더 가벼운 설정으로 자동 재처리합니다.'"
        ],
        [
          "failed: 'Background removal failed. Refresh the page and try again.'",
          "failed: 'Background removal could not be completed. Please try again below.', retryNow: 'Try again', memoryFail: 'Processing failed because of device memory or AI model loading limits. Trying again will automatically use a lighter setting.'"
        ],
        [
          "failed: '背景の削除に失敗しました。ページを再読み込みしてもう一度お試しください。'",
          "failed: '背景の削除を完了できませんでした。下のボタンからもう一度お試しください。', retryNow: '再試行', memoryFail: '端末メモリまたはAIモデルの読み込み制限により処理に失敗しました。再試行すると、より軽い設定で自動処理します。'"
        ],
        [
          "failed: '背景移除失败。请刷新页面后重试。'",
          "failed: '未能完成背景移除。请点击下方按钮重新尝试。', retryNow: '重新尝试', memoryFail: '由于设备内存或AI模型加载限制，处理失败。再次尝试时会自动使用更轻量的设置。'"
        ]
      ]
      for (const [from, to] of copyReplacements) {
        if (!transformed.includes(from)) {
          throw new Error(`[background-quality] failure copy pattern was not found: ${from}`)
        }
        transformed = transformed.replace(from, to)
      }

      const failureCatch = `    } catch (e) {
      console.error('Background removal failed:', e);
      setError(t.failed);
    } finally {`
      if (!transformed.includes(failureCatch)) {
        throw new Error('[background-quality] failure catch pattern was not found')
      }
      transformed = transformed.replace(
        failureCatch,
        `    } catch (e) {
      console.error('Background removal failed:', e);
      setError(isHeavyInferenceError(e) ? (t.memoryFail || t.failed) : t.failed);
    } finally {`
      )

      const errorUi = `{error && <div className="mt-3 rounded-xl bg-[#FFF1EE] px-3.5 py-3 text-sm font-semibold text-[#A64D3D]">{error}</div>}`
      if (!transformed.includes(errorUi)) {
        throw new Error('[background-quality] error UI pattern was not found')
      }
      transformed = transformed.replace(
        errorUi,
        `{error && (
            <div className="mt-3 rounded-xl bg-[#FFF1EE] px-3.5 py-3 text-sm font-semibold text-[#A64D3D]">
              <div>{error}</div>
              {file && !busy && (
                <button
                  type="button"
                  onClick={removeBackground}
                  className="mt-3 rounded-lg border border-[#E2B5AC] bg-white px-3 py-2 text-xs font-extrabold text-[#8E4D40] transition hover:bg-[#FFF8F6]"
                >
                  ↻ {t.retryNow || '다시 시도'}
                </button>
              )}
            </div>
          )}`
      )

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), backgroundQualityRouting()],
})
