import { defineConfig } from 'vite'
import baseConfig from './vite.hair-fur-precision-v3.config.js'

function oneClickAutoPrecision() {
  return {
    name: 'one-click-auto-precision-v1',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      // After the normal fast/AI route has produced a candidate, automatically
      // run the precision matte + hair/fur refinement for non-uniform photos.
      // The user still performs only one action; the app chooses the best result.
      const finalizeAnchor = `      setStage('processing');\n      setProgress(null);\n      const url = URL.createObjectURL(blob);`
      if (!transformed.includes(finalizeAnchor)) {
        throw new Error('[one-click-auto-precision] Finalization anchor was not found')
      }

      const automaticPrecision = `      if (method !== 'fast') {
        try {
          setStage('precision');
          setProgress(null);
          setProcessingDetail(getHairFurText(lang).working);
          let precisionBlob = await removeWithBiRefNet(file, (info) => {
            if (typeof info?.progress === 'number') {
              setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
            }
            if (info?.workerStage) {
              setProcessingWorkerStage(info.workerStage);
              setProcessingDetail(info.detail || getHairFurText(lang).working);
            }
          });
          precisionBlob = await refineHairBackgroundChannels(precisionBlob);
          precisionBlob = await correctUnexpectedForegroundTransparency(precisionBlob);
          precisionBlob = await cleanAiForegroundArtifacts(precisionBlob);
          precisionBlob = await refineHairFurEdges(precisionBlob, file);
          const precisionQuality = await assessRemovalQuality(precisionBlob);

          // Fine hair/fur naturally creates more semi-transparent edge pixels, so
          // do not require a strictly lower score. Reject only a hard quality fail
          // when the current candidate is not already failing.
          if (!(precisionQuality.status === 'fail' && quality.status !== 'fail')) {
            blob = precisionBlob;
            quality = precisionQuality;
            method = 'auto-precision';
          }
        } catch (precisionError) {
          if (!(processingCancelledRef.current || precisionError?.name === 'AbortError')) {
            console.warn('Automatic precision refinement failed; keeping current result:', precisionError);
          }
        } finally {
          setProcessingDetail('');
          setProcessingWorkerStage('');
        }
      }

      setStage('processing');
      setProgress(null);
      const url = URL.createObjectURL(blob);`

      transformed = transformed.replace(finalizeAnchor, automaticPrecision)

      // Manual step buttons are no longer necessary in the default flow.
      const precisionUi = `          {resultUrl && ['ai', 'modnet'].includes(resultMethod) && (
            <div className="mt-3 rounded-xl border border-[#D8D0C5] bg-white px-3.5 py-3">
              <button type="button" disabled={busy} onClick={runPrecisionRetry} className="w-full rounded-xl bg-[#4B5868] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#394554] disabled:cursor-wait disabled:opacity-60">
                🧪 {busy && stage === 'precision' ? t.precisionWorking : t.precisionRetry}
              </button>
              <p className="mt-2 text-[11px] sm:text-xs font-medium leading-5 text-[#7B746B]">{t.precisionHint}</p>
            </div>
          )}

`
      if (transformed.includes(precisionUi)) transformed = transformed.replace(precisionUi, '')

      const hairFurUi = `          {resultUrl && ['ai', 'modnet', 'birefnet', 'hair-fur'].includes(resultMethod) && (
            <div className="mt-3 rounded-xl border border-[#D7DED2] bg-[#FCFEFB] px-3.5 py-3">
              <button type="button" disabled={busy} onClick={runHairFurRetry} className="w-full rounded-xl bg-[#556B55] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#455B45] disabled:cursor-wait disabled:opacity-60">
                🪶 {busy && stage === 'hair-fur' ? getHairFurText(lang).working : getHairFurText(lang).retry}
              </button>
              <p className="mt-2 text-[11px] sm:text-xs font-medium leading-5 text-[#6F786B]">{getHairFurText(lang).hint}</p>
            </div>
          )}

`
      if (transformed.includes(hairFurUi)) transformed = transformed.replace(hairFurUi, '')

      // Update the main action copy so the one-click behavior is clear.
      transformed = transformed
        .replace("remove: '배경 제거하기'", "remove: '자동 정밀 배경 제거'")
        .replace("remove: 'Remove background'", "remove: 'Auto precision remove'")
        .replace("remove: '背景を削除する'", "remove: '自動高精度で背景削除'")
        .replace("remove: '移除背景'", "remove: '自动精细移除背景'")

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), oneClickAutoPrecision()],
})
