import { defineConfig } from 'vite'
import baseConfig from './vite.ben2-auto.config.js'

function transparentStickerSheetDirectSplit() {
  return {
    name: 'transparent-sticker-sheet-direct-split',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      const copyReplacements = [
        [
          "    transparentAlready: '이미 투명 배경인 PNG는 배경 제거 대상이 아닙니다. 배경이 있는 PNG·JPG·WEBP 이미지를 사용해 주세요.',",
          "    transparentAlready: '이미 투명 배경인 PNG는 배경 제거 대상이 아닙니다. 배경이 있는 PNG·JPG·WEBP 이미지를 사용해 주세요.',\n    transparentDirect: '투명 배경 PNG가 감지되었습니다. 배경 제거 없이 원본 투명도를 그대로 유지해 15개 스티커 분리를 준비합니다.',"
        ],
        [
          "    transparentAlready: 'A PNG that already has transparency does not need background removal. Please use a PNG, JPG, or WEBP with a background.',",
          "    transparentAlready: 'A PNG that already has transparency does not need background removal. Please use a PNG, JPG, or WEBP with a background.',\n    transparentDirect: 'A transparent PNG was detected. Its original transparency will be preserved and the app will prepare direct 15-sticker splitting without background removal.',"
        ],
        [
          "    transparentAlready: 'すでに透過背景のPNGは背景削除の対象ではありません。背景のあるPNG・JPG・WEBPをご利用ください。',",
          "    transparentAlready: 'すでに透過背景のPNGは背景削除の対象ではありません。背景のあるPNG・JPG・WEBPをご利用ください。',\n    transparentDirect: '透過PNGを検出しました。背景削除を行わず、元の透明度を維持したまま15個のスタンプ分割を準備します。',"
        ],
        [
          "    transparentAlready: '已经带透明背景的PNG无需再次移除背景。请使用带背景的PNG、JPG或WEBP图片。',",
          "    transparentAlready: '已经带透明背景的PNG无需再次移除背景。请使用带背景的PNG、JPG或WEBP图片。',\n    transparentDirect: '检测到透明PNG。无需再次去除背景，将保留原始透明度并直接准备15张表情分割。',"
        ]
      ]

      for (const [from, to] of copyReplacements) {
        if (!transformed.includes(from)) {
          throw new Error(`[transparent-split] Copy anchor was not found: ${from}`)
        }
        transformed = transformed.replace(from, to)
      }

      const stateAnchor = "  const [precisionMessage, setPrecisionMessage] = useState('');"
      if (!transformed.includes(stateAnchor)) {
        throw new Error('[transparent-split] State anchor was not found')
      }
      transformed = transformed.replace(
        stateAnchor,
        `${stateAnchor}\n  const [sourceAlreadyTransparent, setSourceAlreadyTransparent] = useState(false);`
      )

      const clearAnchor = "    setPrecisionMessage('');\n    setError('');"
      if (!transformed.includes(clearAnchor)) {
        throw new Error('[transparent-split] clearResult anchor was not found')
      }
      transformed = transformed.replace(
        clearAnchor,
        "    setPrecisionMessage('');\n    setSourceAlreadyTransparent(false);\n    setError('');"
      )

      const transparentRejectBlock = `    if (nextFile.type === 'image/png') {
      try {
        if (await hasRealTransparency(nextFile)) {
          setError(t.transparentAlready);
          return;
        }
      } catch (e) {
        console.warn('Transparent PNG detection failed:', e);
      }
    }
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    clearResult();
    setFile(nextFile);
    setSourceUrl(URL.createObjectURL(nextFile));`

      const transparentDirectBlock = `    let alreadyTransparent = false;
    if (nextFile.type === 'image/png') {
      try {
        alreadyTransparent = await hasRealTransparency(nextFile);
      } catch (e) {
        console.warn('Transparent PNG detection failed:', e);
      }
    }

    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    clearResult();
    setFile(nextFile);
    setSourceUrl(URL.createObjectURL(nextFile));

    if (alreadyTransparent) {
      setSourceAlreadyTransparent(true);
      setResultBlob(nextFile);
      setResultUrl(URL.createObjectURL(nextFile));
      setResultMethod('transparent');
      setQualityAssessment({ status: 'pass', score: 0 });
      setComparePosition(50);

      // Transparent sticker sheets need no matting pass. Detect the existing
      // alpha layout directly and auto-split only when the 3x5 structure is
      // confident. Ambiguous layouts keep the manual split option as fallback.
      try {
        setSheetDetection({ status: 'checking', confidence: 0 });
        const detection = await detectEmoticonSheet(nextFile);
        setSheetDetection(detection);
        if (detection.status === 'sheet') {
          setSplitting(true);
          try {
            const items = await splitIntoFifteen(nextFile);
            const withUrls = items.map((item) => ({ ...item, url: URL.createObjectURL(item.blob) }));
            setSplitItems(withUrls);
          } catch (splitError) {
            console.warn('Transparent sticker auto split failed:', splitError);
            setSplitError(t.splitFailed);
          } finally {
            setSplitting(false);
          }
        }
      } catch (detectionError) {
        console.warn('Transparent sticker sheet detection failed:', detectionError);
        setSheetDetection({ status: 'ambiguous', confidence: 0 });
      }
    }`

      if (!transformed.includes(transparentRejectBlock)) {
        throw new Error('[transparent-split] Transparent PNG rejection block was not found')
      }
      transformed = transformed.replace(transparentRejectBlock, transparentDirectBlock)

      const previewCondition = '          {!resultUrl ? ('
      if (!transformed.includes(previewCondition)) {
        throw new Error('[transparent-split] Preview condition was not found')
      }
      transformed = transformed.replace(
        previewCondition,
        '          {!resultUrl || sourceAlreadyTransparent ? ('
      )

      const errorAnchor = '          {error && <div className="mt-3 rounded-xl bg-[#FFF1EE] px-3.5 py-3 text-sm font-semibold text-[#A64D3D]">{error}</div>}'
      if (!transformed.includes(errorAnchor)) {
        throw new Error('[transparent-split] Error UI anchor was not found')
      }
      transformed = transformed.replace(
        errorAnchor,
        `${errorAnchor}\n\n          {sourceAlreadyTransparent && (\n            <div className="mt-3 rounded-xl border border-[#CFE2C8] bg-[#F3FAF0] px-3.5 py-3 text-xs sm:text-[13px] font-semibold leading-5 text-[#526C4B]">\n              ✅ {t.transparentDirect}\n            </div>\n          )}`
      )

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), transparentStickerSheetDirectSplit()],
})
