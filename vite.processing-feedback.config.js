import { defineConfig } from 'vite'
import baseConfig from './vite.ben2-worker.config.js'

function processingFeedbackUi() {
  return {
    name: 'processing-feedback-ui-v1',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      const tAnchor = "  const t = COPY[lang] || COPY.ko;"
      if (!transformed.includes(tAnchor)) throw new Error('[processing-feedback] Language anchor not found')
      transformed = transformed.replace(
        tAnchor,
        `${tAnchor}\n  const processingCopy = ({\n    ko: { seconds: '초 경과', active: '정상적으로 처리 중입니다. 정밀 분석은 조금 더 걸릴 수 있어요.', complex: '복잡한 이미지라 분석 시간이 길어지고 있어요. 페이지는 정상적으로 작동 중입니다.', cancel: '처리 취소' },\n    en: { seconds: 's elapsed', active: 'Processing is continuing normally. Precision analysis may take a little longer.', complex: 'This image is complex, so analysis is taking longer. The page is still working normally.', cancel: 'Cancel' },\n    ja: { seconds: '秒経過', active: '正常に処理中です。高精度解析には少し時間がかかる場合があります。', complex: '複雑な画像のため解析に時間がかかっています。ページは正常に動作しています。', cancel: '処理をキャンセル' },\n    zh: { seconds: '秒', active: '正在正常处理中。高精度分析可能还需要一些时间。', complex: '图片较复杂，分析时间较长。页面仍在正常工作。', cancel: '取消处理' }\n  }[lang] || { seconds: '초 경과', active: '정상적으로 처리 중입니다. 정밀 분석은 조금 더 걸릴 수 있어요.', complex: '복잡한 이미지라 분석 시간이 길어지고 있어요. 페이지는 정상적으로 작동 중입니다.', cancel: '처리 취소' });`
      )

      const stateAnchor = "  const [precisionMessage, setPrecisionMessage] = useState('');"
      if (!transformed.includes(stateAnchor)) throw new Error('[processing-feedback] State anchor not found')
      transformed = transformed.replace(
        stateAnchor,
        `${stateAnchor}\n  const [processingSeconds, setProcessingSeconds] = useState(0);\n  const [processingDetail, setProcessingDetail] = useState('');\n  const [processingWorkerStage, setProcessingWorkerStage] = useState('');\n  const processingCancelledRef = useRef(false);`
      )

      const effectAnchor = '  useEffect(() => () => {'
      if (!transformed.includes(effectAnchor)) throw new Error('[processing-feedback] Effect anchor not found')
      const elapsedEffect = `  useEffect(() => {\n    if (!busy) {\n      setProcessingSeconds(0);\n      return undefined;\n    }\n    const startedAt = Date.now();\n    setProcessingSeconds(0);\n    const timer = window.setInterval(() => {\n      setProcessingSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));\n    }, 1000);\n    return () => window.clearInterval(timer);\n  }, [busy]);\n\n`
      transformed = transformed.replace(effectAnchor, `${elapsedEffect}${effectAnchor}`)

      const mainStart = `    clearResult();\n    setBusy(true);\n    setStage('preparing');\n    try {`
      if (!transformed.includes(mainStart)) throw new Error('[processing-feedback] Main processing start not found')
      transformed = transformed.replace(
        mainStart,
        `    clearResult();\n    processingCancelledRef.current = false;\n    setProcessingDetail('');\n    setProcessingWorkerStage('');\n    setBusy(true);\n    setStage('preparing');\n    try {`
      )

      const precisionStart = `    setBusy(true);\n    setStage('precision');\n    setProgress(null);\n    setPrecisionMessage('');\n    try {`
      if (!transformed.includes(precisionStart)) throw new Error('[processing-feedback] Precision processing start not found')
      transformed = transformed.replace(
        precisionStart,
        `    processingCancelledRef.current = false;\n    setProcessingDetail('');\n    setProcessingWorkerStage('');\n    setBusy(true);\n    setStage('precision');\n    setProgress(null);\n    setPrecisionMessage('');\n    try {`
      )

      const mainCatch = `    } catch (e) {\n      console.error('Background removal failed:', e);\n      setError(t.failed);\n    } finally {`
      if (!transformed.includes(mainCatch)) throw new Error('[processing-feedback] Main catch not found')
      transformed = transformed.replace(
        mainCatch,
        `    } catch (e) {\n      if (processingCancelledRef.current || e?.name === 'AbortError') {\n        setError('');\n      } else {\n        console.error('Background removal failed:', e);\n        setError(t.failed);\n      }\n    } finally {`
      )

      const precisionCatch = `    } catch (e) {\n      console.error('BiRefNet precision retry failed:', e);\n      setPrecisionMessage(t.failed);\n    } finally {`
      if (!transformed.includes(precisionCatch)) throw new Error('[processing-feedback] Precision catch not found')
      transformed = transformed.replace(
        precisionCatch,
        `    } catch (e) {\n      if (processingCancelledRef.current || e?.name === 'AbortError') {\n        setPrecisionMessage('');\n      } else {\n        console.error('BiRefNet precision retry failed:', e);\n        setPrecisionMessage(t.failed);\n      }\n    } finally {`
      )

      const downloadAnchor = '  const downloadBlob = (blob, filename) => {'
      if (!transformed.includes(downloadAnchor)) throw new Error('[processing-feedback] Download anchor not found')
      const cancelHandler = `  const cancelProcessing = () => {\n    if (!busy || !processingWorkerStage) return;\n    processingCancelledRef.current = true;\n    try { cancelBen2Processing(); } catch (error) { console.warn('BEN2 cancel failed:', error); }\n    setBusy(false);\n    setStage('');\n    setProgress(null);\n    setProcessingDetail('');\n    setProcessingWorkerStage('');\n  };\n\n`
      transformed = transformed.replace(downloadAnchor, `${cancelHandler}${downloadAnchor}`)

      const busyStart = transformed.indexOf('          {busy && (')
      const busyEndAnchor = '\n\n          {resultUrl &&'
      const busyEnd = transformed.indexOf(busyEndAnchor, busyStart)
      if (busyStart < 0 || busyEnd < 0) throw new Error('[processing-feedback] Busy UI block not found')

      const busyUi = `          {busy && (\n            <div className="mt-4 rounded-xl border border-[#E8DFD1] bg-white px-4 py-3">\n              <div className="flex items-center justify-between gap-3 text-sm font-bold text-[#514B44]">\n                <span className="flex min-w-0 items-center gap-2">\n                  <span className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#C8B79D] border-t-[#6D5C46]" />\n                  <span className="truncate">{processingDetail || (stage === 'precision' ? t.precisionWorking : (stage === 'preparing' ? t.preparing : t.processing))}</span>\n                </span>\n                {processingWorkerStage === 'inference' ? (\n                  <span className="shrink-0 text-xs text-[#897D6D]">{processingSeconds}{processingCopy.seconds}</span>\n                ) : (\n                  typeof progress === 'number' && <span className="shrink-0 text-xs text-[#897D6D]">{progress}%</span>\n                )}\n              </div>\n\n              {processingWorkerStage === 'inference' ? (\n                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EFEAE2]">\n                  <div className="h-full w-full animate-pulse rounded-full bg-[#7D9A75]" />\n                </div>\n              ) : (\n                typeof progress === 'number' && (\n                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EFEAE2]">\n                    <div className="h-full rounded-full bg-[#7D9A75] transition-all" style={{ width: \`${'${progress}'}%\` }} />\n                  </div>\n                )\n              )}\n\n              {processingWorkerStage && processingSeconds >= 20 && (\n                <p className="mt-2 text-[11px] sm:text-xs font-semibold leading-5 text-[#756C60]">\n                  {processingSeconds >= 40 ? processingCopy.complex : processingCopy.active}\n                </p>\n              )}\n\n              {processingWorkerStage && ['model', 'model-ready', 'decode', 'resize', 'inference'].includes(processingWorkerStage) && (\n                <button type="button" onClick={cancelProcessing} className="mt-2 rounded-lg border border-[#D8D0C5] bg-[#FAF8F4] px-3 py-1.5 text-xs font-bold text-[#6C6257] transition hover:bg-[#F2EEE8]">\n                  {processingCopy.cancel}\n                </button>\n              )}\n            </div>\n          )}`

      transformed = transformed.slice(0, busyStart) + busyUi + transformed.slice(busyEnd)
      return { code: transformed, map: null }
    },
  }
}

function captureWorkerProgressDetails() {
  return {
    name: 'processing-feedback-worker-details-v1',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      const progressPattern = /if \(typeof info\?\.progress === 'number'\) \{\s*setProgress\(Math\.max\(0, Math\.min\(100, Math\.round\(info\.progress\)\)\)\);\s*\}/g
      let matches = 0
      const transformed = code.replace(progressPattern, (match) => {
        matches += 1
        return `${match}\n              if (info?.workerStage) {\n                setProcessingWorkerStage(info.workerStage);\n                setProcessingDetail(info.detail || '');\n              } else {\n                setProcessingWorkerStage('');\n                setProcessingDetail('');\n              }`
      })

      if (!matches) throw new Error('[processing-feedback] Progress callbacks were not found')
      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), processingFeedbackUi(), captureWorkerProgressDetails()],
})
