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

      // Runtime-only helpers are prepended so they do not depend on formatting
      // changes made by earlier Vite/React transforms.
      if (!transformed.includes('MOBILE_BG_REMOVAL_STABILITY_V3')) {
        const mobileHelpers = `// MOBILE_BG_REMOVAL_STABILITY_V3
function isMobileLikeDevice() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Android|iPhone|iPad|iPod/i.test(ua) || window.innerWidth < 900;
}

function isHeavyInferenceError(error) {
  const text = String(error?.message || error || '').toLowerCase();
  return ['out of memory', 'memory', 'wasm', 'webassembly', 'abort', 'allocation', 'tensor', 'out of bounds', 'runtimeerror'].some((keyword) => text.includes(keyword));
}

const canvasToInferenceBlob = (canvas, type = 'image/jpeg', quality = 0.92) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Canvas export failed')), type, quality);
});

async function createInferenceInputFile(file, maxSide = 1400) {
  const { canvas } = await drawFileToCanvas(file);
  const longest = Math.max(canvas.width, canvas.height);
  if (!longest || longest <= maxSide) return file;
  const scale = maxSide / longest;
  const resized = document.createElement('canvas');
  resized.width = Math.max(1, Math.round(canvas.width * scale));
  resized.height = Math.max(1, Math.round(canvas.height * scale));
  const ctx = resized.getContext('2d');
  if (!ctx) throw new Error('Resize canvas unavailable');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, resized.width, resized.height);
  const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await canvasToInferenceBlob(resized, mimeType, 0.92);
  return new File([blob], 'background-removal-input', { type: mimeType });
}`
        transformed = `${mobileHelpers}\n\n${transformed}`
      }

      // If the source still has the simple pipeline form, resize only the model
      // input. The existing preserveOriginalRgb logic restores original colors
      // and dimensions after ORMBG/MODNet completes.
      const pipelinePattern = /async function pipelineRemovalToBlob\(file, loader, onProgress\) \{[\s\S]*?\n\}/
      if (pipelinePattern.test(transformed)) {
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
      }

      // Desktop keeps the precision-first route. Mobile avoids automatically
      // loading BiRefNet, MODNet and ORMBG in sequence and starts with ORMBG.
      const routePattern = /const\s+portraitFirst\s*=\s*[\s\S]*?;/
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
          // Desktop keeps the high-precision route for difficult backgrounds.
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

      // Mobile skips the automatic second AI model unless the source is small.
      transformed = transformed.replace(
        "          if (quality.status !== 'pass') {",
        "          if (quality.status !== 'pass' && (!isMobileLikeDevice() || file.size <= 3 * 1024 * 1024)) {"
      )

      // Improve the failure copy without making the build depend on the exact UI.
      const failureCopy = [
        ["failed: '배경 제거에 실패했습니다. 브라우저를 새로고침한 뒤 다시 시도해 주세요.'", "failed: '배경 제거를 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.'"],
        ["failed: 'Background removal failed. Refresh the page and try again.'", "failed: 'Background removal could not be completed. Please try again.'"],
        ["failed: '背景の削除に失敗しました。ページを再読み込みしてもう一度お試しください。'", "failed: '背景の削除を完了できませんでした。もう一度お試しください。'"],
        ["failed: '背景移除失败。请刷新页面后重试。'", "failed: '未能完成背景移除。请重新尝试。'"]
      ]
      for (const [from, to] of failureCopy) {
        if (transformed.includes(from)) transformed = transformed.replace(from, to)
      }

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), backgroundQualityRouting()],
})
