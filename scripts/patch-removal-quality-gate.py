from pathlib import Path

path = Path('src/components/BackgroundRemover.jsx')
s = path.read_text(encoding='utf-8')

def rep(old, new, label):
    global s
    if old not in s:
        raise SystemExit(f'Missing anchor: {label}')
    s = s.replace(old, new, 1)

# Localized quality copy.
rep(
"    splitMaybeTitle: '15개 이모티콘 시트인가요?', splitMaybeDesc: '자동 감지가 확실하지 않습니다. 이모티콘 시트라면 직접 분리를 실행할 수 있습니다.', splitMaybeAction: '이모티콘 시트 분리',\n    badType:",
"    splitMaybeTitle: '15개 이모티콘 시트인가요?', splitMaybeDesc: '자동 감지가 확실하지 않습니다. 이모티콘 시트라면 직접 분리를 실행할 수 있습니다.', splitMaybeAction: '이모티콘 시트 분리',\n    qualityFailTitle: '결과 품질을 다시 확인해 주세요', qualityFailDesc: '복잡한 배경이 많이 남아 정확한 투명 PNG로 보기 어렵습니다. 배경이 더 단순한 다른 이미지를 사용하는 것을 권장합니다.', qualityBlocked: '품질 확인 필요',\n    qualityWarnTitle: '일부 배경이 남아 있을 수 있어요', qualityWarnDesc: '슬라이더로 원본과 결과를 확인한 뒤 저장해 주세요.',\n    badType:",
'ko copy')
rep(
"    splitMaybeTitle: 'Is this a 15-emoticon sheet?', splitMaybeDesc: 'The layout is uncertain. If this is an emoticon sheet, you can run the splitter manually.', splitMaybeAction: 'Split emoticon sheet',\n    badType:",
"    splitMaybeTitle: 'Is this a 15-emoticon sheet?', splitMaybeDesc: 'The layout is uncertain. If this is an emoticon sheet, you can run the splitter manually.', splitMaybeAction: 'Split emoticon sheet',\n    qualityFailTitle: 'Please check the removal result', qualityFailDesc: 'Too much complex background appears to remain for a reliable transparent PNG. Try another image with a simpler background.', qualityBlocked: 'Quality check needed',\n    qualityWarnTitle: 'Some background may remain', qualityWarnDesc: 'Compare the original and result with the slider before saving.',\n    badType:",
'en copy')
rep(
"    splitMaybeTitle: '15個の絵文字シートですか？', splitMaybeDesc: '自動判定が確実ではありません。絵文字シートの場合は手動で分割を実行できます。', splitMaybeAction: '絵文字シートを分割',\n    badType:",
"    splitMaybeTitle: '15個の絵文字シートですか？', splitMaybeDesc: '自動判定が確実ではありません。絵文字シートの場合は手動で分割を実行できます。', splitMaybeAction: '絵文字シートを分割',\n    qualityFailTitle: '背景削除結果を確認してください', qualityFailDesc: '複雑な背景が多く残っており、正確な透過PNGとして保存するには不安定です。背景がより単純な別の画像をおすすめします。', qualityBlocked: '品質確認が必要',\n    qualityWarnTitle: '背景が一部残っている可能性があります', qualityWarnDesc: 'スライダーで元画像と結果を確認してから保存してください。',\n    badType:",
'ja copy')
rep(
"    splitMaybeTitle: '这是15个表情的图片合集吗？', splitMaybeDesc: '自动判断不够确定。如果这是表情合集，可以手动启动分割。', splitMaybeAction: '分割表情合集',\n    badType:",
"    splitMaybeTitle: '这是15个表情的图片合集吗？', splitMaybeDesc: '自动判断不够确定。如果这是表情合集，可以手动启动分割。', splitMaybeAction: '分割表情合集',\n    qualityFailTitle: '请检查背景移除结果', qualityFailDesc: '复杂背景残留较多，当前结果不适合直接作为可靠的透明PNG保存。建议换用背景更简单的图片。', qualityBlocked: '需要检查质量',\n    qualityWarnTitle: '可能仍有部分背景残留', qualityWarnDesc: '请先用滑块对比原图和结果，再决定是否保存。',\n    badType:",
'zh copy')

# Add a conservative AI result quality assessor before removeWithAi.
anchor = "async function removeWithAi(file, onProgress) {\n"
quality = r'''async function assessRemovalQuality(blob) {
  const { canvas } = await drawFileToCanvas(blob);
  const { width, height } = canvas;
  if (!width || !height) return { status: 'warning', score: 2 };

  const maxDimension = 720;
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const analysisWidth = Math.max(1, Math.round(width * scale));
  const analysisHeight = Math.max(1, Math.round(height * scale));
  const analysisCanvas = document.createElement('canvas');
  analysisCanvas.width = analysisWidth;
  analysisCanvas.height = analysisHeight;
  const ctx = analysisCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { status: 'warning', score: 2 };
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, analysisWidth, analysisHeight);

  const imageData = ctx.getImageData(0, 0, analysisWidth, analysisHeight);
  const pixels = imageData.data;
  const total = analysisWidth * analysisHeight;
  const threshold = 36;
  let visible = 0;
  let solid = 0;

  const bandX = Math.max(2, Math.round(analysisWidth * 0.035));
  const bandY = Math.max(2, Math.round(analysisHeight * 0.035));
  let topVisible = 0;
  let bottomVisible = 0;
  let leftVisible = 0;
  let rightVisible = 0;

  for (let y = 0; y < analysisHeight; y += 1) {
    for (let x = 0; x < analysisWidth; x += 1) {
      const alpha = pixels[(y * analysisWidth + x) * 4 + 3];
      if (alpha < threshold) continue;
      visible += 1;
      if (alpha >= 180) solid += 1;
      if (y < bandY) topVisible += 1;
      if (y >= analysisHeight - bandY) bottomVisible += 1;
      if (x < bandX) leftVisible += 1;
      if (x >= analysisWidth - bandX) rightVisible += 1;
    }
  }

  const visibleRatio = visible / Math.max(1, total);
  if (visibleRatio < 0.01) return { status: 'fail', score: 5 };

  const topEdge = topVisible / Math.max(1, analysisWidth * bandY);
  const bottomEdge = bottomVisible / Math.max(1, analysisWidth * bandY);
  const leftEdge = leftVisible / Math.max(1, analysisHeight * bandX);
  const rightEdge = rightVisible / Math.max(1, analysisHeight * bandX);

  const { components } = analyzeAlphaComponents(ctx, analysisWidth, analysisHeight, threshold);
  const ranked = [...components].sort((a, b) => b.area - a.area);
  const largest = ranked[0];
  const major = ranked.filter((item) => item.area >= total * 0.018);
  let suspiciousDetachedArea = 0;

  for (const component of major.slice(1)) {
    const touchesTop = component.minY <= 2;
    const touchesLeft = component.minX <= 2;
    const touchesRight = component.maxX >= analysisWidth - 3;
    const touchesBottom = component.maxY >= analysisHeight - 3;
    const edgeAttached = touchesTop || touchesLeft || touchesRight;
    const fillRatio = component.area / Math.max(1, component.width * component.height);
    const aspect = Math.max(component.width / Math.max(1, component.height), component.height / Math.max(1, component.width));
    if (edgeAttached && !touchesBottom && (fillRatio < 0.52 || aspect > 2.1)) suspiciousDetachedArea += component.area;
  }

  const suspiciousDetachedRatio = suspiciousDetachedArea / Math.max(1, total);
  const largestWidthRatio = largest ? largest.width / analysisWidth : 0;
  const largestHeightRatio = largest ? largest.height / analysisHeight : 0;
  const largestTouchesTop = largest ? largest.minY <= 2 : false;
  const largestTouchesSide = largest ? (largest.minX <= 2 || largest.maxX >= analysisWidth - 3) : false;

  let score = 0;
  if (visibleRatio > 0.78) score += 4;
  else if (visibleRatio > 0.67) score += 2;
  else if (visibleRatio > 0.58) score += 1;

  if (topEdge > 0.42 && Math.max(leftEdge, rightEdge) > 0.32) score += 2;
  else if (topEdge > 0.30 && Math.max(leftEdge, rightEdge) > 0.24) score += 1;

  if (leftEdge > 0.58 && rightEdge > 0.58 && visibleRatio > 0.48) score += 2;
  if (suspiciousDetachedRatio > 0.12) score += 2;
  else if (suspiciousDetachedRatio > 0.065) score += 1;

  if (largest && largestWidthRatio > 0.90 && largestHeightRatio > 0.72 && largestTouchesTop && largestTouchesSide && visibleRatio > 0.46) score += 2;

  // Bottom contact is common for a correctly isolated person or group. Reward it
  // slightly so normal full-body/upper-body photos are less likely to be blocked.
  if (bottomEdge > 0.28 && topEdge < 0.24 && visibleRatio < 0.66) score = Math.max(0, score - 1);

  // A solid foreground is expected; this metric is only diagnostic for future tuning.
  const solidRatio = solid / Math.max(1, visible);
  if (solidRatio < 0.26 && visibleRatio > 0.44) score += 1;

  if (score >= 4) return { status: 'fail', score };
  if (score >= 2) return { status: 'warning', score };
  return { status: 'pass', score };
}

'''
rep(anchor, quality + anchor, 'quality assessor')

# State.
rep(
"  const [sheetDetection, setSheetDetection] = useState({ status: 'idle', confidence: 0 });\n",
"  const [sheetDetection, setSheetDetection] = useState({ status: 'idle', confidence: 0 });\n  const [qualityAssessment, setQualityAssessment] = useState({ status: 'idle', score: 0 });\n  const [resultMethod, setResultMethod] = useState('');\n",
'quality state')

# Reset quality state.
rep(
"    setResultBlob(null);\n    setError('');",
"    setResultBlob(null);\n    setQualityAssessment({ status: 'idle', score: 0 });\n    setResultMethod('');\n    setError('');",
'clear quality state')

# Track fast/AI path and assess AI result before showing it.
old_remove = r'''    try {
      let blob = await tryFastUniformBackgroundRemoval(file);

      if (!blob) {
        setStage('preparing');
        blob = await removeWithAi(file, (info) => {
          if (typeof info?.progress === 'number') {
            setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
          }
        });
      }

      setStage('processing');
      setProgress(null);
      const url = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResultUrl(url);
      setComparePosition(50);
'''
new_remove = r'''    try {
      let method = 'fast';
      let blob = await tryFastUniformBackgroundRemoval(file);

      if (!blob) {
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
      setResultBlob(blob);
      setResultUrl(url);
      setComparePosition(50);
'''
rep(old_remove, new_remove, 'remove quality path')

# Prevent accidental downloads and splitting when hard-failed.
rep(
"  const download = () => {\n    if (!resultBlob) return;",
"  const download = () => {\n    if (!resultBlob || qualityAssessment.status === 'fail') return;",
'download guard')
rep(
"  const autoSplit = async () => {\n    if (!resultBlob || splitting) return;",
"  const autoSplit = async () => {\n    if (!resultBlob || splitting || qualityAssessment.status === 'fail') return;",
'split guard')

# Quality notice before actions.
action_anchor = "          {error && <div className=\"mt-3 rounded-xl bg-[#FFF1EE] px-3.5 py-3 text-sm font-semibold text-[#A64D3D]\">{error}</div>}\n\n          <div className=\"mt-4 flex flex-col gap-2 sm:flex-row\">"
notice = r'''          {error && <div className="mt-3 rounded-xl bg-[#FFF1EE] px-3.5 py-3 text-sm font-semibold text-[#A64D3D]">{error}</div>}

          {resultUrl && resultMethod === 'ai' && qualityAssessment.status === 'fail' && (
            <div className="mt-4 rounded-xl border border-[#E8B8AE] bg-[#FFF4F1] px-3.5 py-3.5">
              <div className="text-sm font-extrabold text-[#914B3F]">⚠️ {t.qualityFailTitle}</div>
              <p className="mt-1.5 text-xs sm:text-[13px] font-medium leading-5 text-[#8B5C53]">{t.qualityFailDesc}</p>
            </div>
          )}

          {resultUrl && resultMethod === 'ai' && qualityAssessment.status === 'warning' && (
            <div className="mt-4 rounded-xl border border-[#E7D5A4] bg-[#FFFBEF] px-3.5 py-3">
              <div className="text-sm font-extrabold text-[#806A32]">⚠️ {t.qualityWarnTitle}</div>
              <p className="mt-1 text-xs sm:text-[13px] font-medium leading-5 text-[#7B704F]">{t.qualityWarnDesc}</p>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">'''
rep(action_anchor, notice, 'quality notice')

# Disable save button on fail and change label.
old_btn = '<button type="button" onClick={download} className="flex-1 rounded-xl bg-[#3E6B4B] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#31573D]">⬇️ {t.download}</button>'
new_btn = '<button type="button" disabled={qualityAssessment.status === \'fail\'} onClick={download} className="flex-1 rounded-xl bg-[#3E6B4B] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#31573D] disabled:cursor-not-allowed disabled:bg-[#9D9A94] disabled:shadow-none">{qualityAssessment.status === \'fail\' ? `⚠️ ${t.qualityBlocked}` : `⬇️ ${t.download}`}</button>'
rep(old_btn, new_btn, 'save button')

# Hide splitter when quality is hard-failed.
rep(
"          {resultUrl && (sheetDetection.status === 'sheet' || splitItems.length > 0) && (",
"          {resultUrl && qualityAssessment.status !== 'fail' && (sheetDetection.status === 'sheet' || splitItems.length > 0) && (",
'full splitter quality gate')
rep(
"          {resultUrl && sheetDetection.status === 'ambiguous' && splitItems.length === 0 && (",
"          {resultUrl && qualityAssessment.status !== 'fail' && sheetDetection.status === 'ambiguous' && splitItems.length === 0 && (",
'ambiguous splitter quality gate')

path.write_text(s, encoding='utf-8')
print('patched removal quality gate')
