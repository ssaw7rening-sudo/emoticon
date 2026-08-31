import { defineConfig } from 'vite'
import baseConfig from './vite.hair-fur-precision-v3.config.js'

function oneClickAutoPrecision() {
  return {
    name: 'one-click-auto-precision-v2-single-pass',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      // Single-pass strategy:
      // 1) Try the lightweight uniform-background path. This is only local pixel work.
      // 2) If that path is unavailable or fails the quality gate, go directly to
      //    BiRefNet precision once. Do not run ORMBG/MODNet first and do not retry
      //    the same image with a second AI model afterwards.
      const handlerAnchor = `  const removeBackground = async () => {`
      const handlerStart = transformed.indexOf(handlerAnchor)
      if (handlerStart < 0) {
        throw new Error('[one-click-auto-precision] Background-removal handler was not found')
      }

      const aiRouteStart = transformed.indexOf(`      if (!blob) {`, handlerStart)
      const finalizeAnchor = `      setStage('processing');\n      setProgress(null);\n      const url = URL.createObjectURL(blob);`
      const finalizeStart = transformed.indexOf(finalizeAnchor, aiRouteStart)
      if (aiRouteStart < 0 || finalizeStart < 0) {
        throw new Error('[one-click-auto-precision] AI route/finalization anchor was not found')
      }

      const precisionRoute = `      if (!blob) {
        method = 'birefnet';
        setStage('precision');
        setProgress(null);
        if (typeof setProcessingDetail === 'function') {
          setProcessingDetail(
            typeof getHairFurText === 'function'
              ? getHairFurText(lang).working
              : t.precisionWorking
          );
        }
        blob = await removeWithBiRefNet(file, (info) => {
          if (typeof info?.progress === 'number') {
            setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
          }
          if (info?.workerStage && typeof setProcessingWorkerStage === 'function') {
            setProcessingWorkerStage(info.workerStage);
          }
          if (info?.detail && typeof setProcessingDetail === 'function') {
            setProcessingDetail(info.detail);
          }
        });
        blob = await refineHairBackgroundChannels(blob);
        blob = await correctUnexpectedForegroundTransparency(blob);
        blob = await cleanAiForegroundArtifacts(blob);
        blob = await refineHairFurEdges(blob, file);
        quality = await assessRemovalQuality(blob);
        if (typeof setProcessingDetail === 'function') setProcessingDetail('');
        if (typeof setProcessingWorkerStage === 'function') setProcessingWorkerStage('');
      }

`

      transformed =
        transformed.slice(0, aiRouteStart) +
        precisionRoute +
        transformed.slice(finalizeStart)

      // Manual retry buttons are unnecessary because the default action now picks
      // fast vs precision before any AI model is run.
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

      // BiRefNet is now a normal final result, so keep the same quality warning UI
      // used by the previous AI routes.
      transformed = transformed
        .replaceAll("['ai', 'modnet'].includes(resultMethod)", "['ai', 'modnet', 'birefnet'].includes(resultMethod)")

      // User-facing copy: one action, one selected processing route, no "retry" wording.
      transformed = transformed
        .replace("remove: '배경 제거하기'", "remove: '자동 배경 제거'")
        .replace("remove: 'Remove background'", "remove: 'Auto remove background'")
        .replace("remove: '背景を削除する'", "remove: '自動で背景を削除'")
        .replace("remove: '移除背景'", "remove: '自动移除背景'")
        .replace("precisionWorking: '정밀 모델로 다시 처리하고 있어요…'", "precisionWorking: '정밀하게 배경을 제거하고 있어요…'")
        .replace("precisionWorking: 'Retrying with the precision model…'", "precisionWorking: 'Removing the background with precision…'")
        .replace("precisionWorking: '高精度モデルで再処理しています…'", "precisionWorking: '高精度で背景を削除しています…'")
        .replace("precisionWorking: '正在使用高精度模型重新处理…'", "precisionWorking: '正在高精度移除背景…'")
        .replace(
          "first: '균일한 단색 배경은 빠르게 처리하며, 복잡한 배경은 AI 모델을 사용해 처음 실행이 조금 오래 걸릴 수 있습니다.'",
          "first: '균일한 단색 배경은 빠르게 처리하고, 인물·머리카락·털·복잡한 배경은 처음부터 정밀 모델을 한 번만 사용합니다.'"
        )
        .replace(
          "first: 'Uniform solid-color backgrounds are handled quickly. Complex backgrounds use an AI model, so the first run may take longer.'",
          "first: 'Uniform backgrounds use the fast path. Portraits, hair, fur and complex backgrounds go directly through one precision pass.'"
        )
        .replace(
          "first: '均一な単色背景は高速処理し、複雑な背景ではAIモデルを使用するため初回は少し時間がかかる場合があります。'",
          "first: '均一な単色背景は高速処理し、人物・髪・毛並み・複雑な背景は最初から高精度モデルで1回だけ処理します。'"
        )
        .replace(
          "first: '均匀的纯色背景会快速处理；复杂背景会使用AI模型，因此首次使用可能稍慢。'",
          "first: '均匀纯色背景使用快速处理；人物、发丝、毛发和复杂背景会直接使用一次高精度处理。'"
        )

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), oneClickAutoPrecision()],
})
