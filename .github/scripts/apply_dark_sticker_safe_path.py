from pathlib import Path

path = Path('src/components/BackgroundRemover.jsx')
text = path.read_text(encoding='utf-8')


def replace_once(old, new, label):
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly 1 match, found {count}')
    text = text.replace(old, new, 1)

# 1) Localized UI copy for the locked dark-background sticker path.
copy_replacements = [
    (
        "compareHint: '가운데 슬라이더를 좌우로 움직여 원본과 결과를 비교하세요.', methodSafe: '밝은색 보호 안전 처리', methodAi: 'AI 정밀 처리',",
        "compareHint: '가운데 슬라이더를 좌우로 움직여 원본과 결과를 비교하세요.', methodSafe: '밝은색 보호 안전 처리', methodSafeDark: '검정 배경 스티커 안전 처리', methodAi: 'AI 정밀 처리', precisionDarkLocked: '검정/짙은 단색 배경 시트는 밝은 얼굴·솜털·흰 외곽선을 보호하기 위해 AI 정밀 처리 대신 안전 재처리를 사용합니다.',",
        'ko copy',
    ),
    (
        "compareHint: 'Drag the center slider left or right to compare the original and result.', methodSafe: 'Light-color safe processing', methodAi: 'AI precision processing',",
        "compareHint: 'Drag the center slider left or right to compare the original and result.', methodSafe: 'Light-color safe processing', methodSafeDark: 'Dark-background sticker safe mode', methodAi: 'AI precision processing', precisionDarkLocked: 'Dark or near-black sticker sheets use the safe path instead of AI precision processing to protect pale faces, fine fur, and white outlines.',",
        'en copy',
    ),
    (
        "compareHint: '中央のスライダーを左右に動かして元画像と結果を比較できます。', methodSafe: '明るい色を保護する安全処理', methodAi: 'AI高精度処理',",
        "compareHint: '中央のスライダーを左右に動かして元画像と結果を比較できます。', methodSafe: '明るい色を保護する安全処理', methodSafeDark: '暗い背景ステッカー安全処理', methodAi: 'AI高精度処理', precisionDarkLocked: '黒または暗い単色背景のステッカーシートでは、明るい顔・細い毛・白い縁取りを保護するためAI高精度処理ではなく安全処理を使用します。',",
        'ja copy',
    ),
    (
        "compareHint: '左右拖动中间滑块即可对比原图和处理结果。', methodSafe: '浅色保护安全处理', methodAi: 'AI精细处理',",
        "compareHint: '左右拖动中间滑块即可对比原图和处理结果。', methodSafe: '浅色保护安全处理', methodSafeDark: '深色背景贴纸安全处理', methodAi: 'AI精细处理', precisionDarkLocked: '黑色或深色纯色背景的贴纸合集会使用安全处理而非AI精细处理，以保护浅色脸部、细毛和白色描边。',",
        'zh copy',
    ),
]
for old, new, label in copy_replacements:
    replace_once(old, new, label)

# 2) Dedicated classifier: dark backdrop + detected 15-sticker layout.
old_helper = """function isDarkBackgroundColor(color) {
  if (!Array.isArray(color) || color.length < 3) return false;
  const [r, g, b] = color;
  const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722;
  return luminance <= 96 && Math.max(r, g, b) <= 128;
}
"""
new_helper = old_helper + """
function isLikelyDarkStickerSheet(backgroundColor, detection) {
  if (!isDarkBackgroundColor(backgroundColor)) return false;
  return detection?.status === 'sheet' || detection?.status === 'ambiguous';
}
"""
replace_once(old_helper, new_helper, 'dark sticker helper')

# 3) Lock dark sticker sheets to border-connected flood-fill result before the
# semantic AI models can weaken pale foreground.
old_fast_block = """      let method = 'fast';
      const fastResult = await tryFastUniformBackgroundRemoval(file);
      let blob = fastResult?.blob || null;
      const fastBackgroundIsDark = isDarkBackgroundColor(fastResult?.background);
      let quality = { status: 'pass', score: 0 };

      // The edge-color shortcut can occasionally mistake a complex indoor scene
      // for a uniform backdrop. Validate the fast result before accepting it.
      // Any warning/failure is discarded and routed through the AI models.
      if (blob) {
        try {
          const fastQuality = await assessRemovalQuality(blob);
          if (fastQuality.status === 'pass') {
            const fastSheetDetection = await detectEmoticonSheet(blob);
            if (
              !fastBackgroundIsDark
              && (fastSheetDetection.status === 'sheet' || fastSheetDetection.status === 'ambiguous')
            ) {
              // Uniform-colour flood fill cannot reliably distinguish a white
              // character face from a white sheet background when their
              // outlines contain tiny openings. Route sticker sheets through
              // the semantic model instead of risking permanent alpha loss.
              // A dark backdrop is safe to flood-fill and must stay on this
              // path: semantic models can mistake pale faces for background.
              blob = null;
              quality = { status: 'idle', score: 0 };
            } else {
              quality = fastQuality;
            }
          } else {
            console.warn('Fast background removal rejected by quality gate:', fastQuality);
            blob = null;
            quality = { status: 'idle', score: 0 };
          }
        } catch (fastQualityError) {
          console.warn('Fast background validation failed; falling back to AI:', fastQualityError);
          blob = null;
          quality = { status: 'idle', score: 0 };
        }
      }
"""
new_fast_block = """      let method = 'fast';
      const fastResult = await tryFastUniformBackgroundRemoval(file);
      let blob = fastResult?.blob || null;
      const fastBackgroundIsDark = isDarkBackgroundColor(fastResult?.background);
      let darkStickerSafePath = false;
      let quality = { status: 'pass', score: 0 };

      // Uniform black / near-black sticker sheets are safest when only the
      // border-connected backdrop is flood-filled away. Semantic matting can
      // misclassify white faces, ivory fur, dandelion-like wisps and white
      // sticker outlines as background, so detect and lock this path first.
      if (blob) {
        try {
          const fastSheetDetection = await detectEmoticonSheet(blob);
          darkStickerSafePath = isLikelyDarkStickerSheet(fastResult?.background, fastSheetDetection);

          if (darkStickerSafePath) {
            method = 'fast-dark';
            // tryFastUniformBackgroundRemoval already requires a meaningful
            // border-connected removal area. For a detected dark sticker sheet,
            // keep that topology-safe result even if the generic photo quality
            // heuristic is conservative; never route it through semantic AI.
            quality = { status: 'pass', score: 0 };
          } else {
            const fastQuality = await assessRemovalQuality(blob);
            if (fastQuality.status === 'pass') {
              if (
                !fastBackgroundIsDark
                && (fastSheetDetection.status === 'sheet' || fastSheetDetection.status === 'ambiguous')
              ) {
                // On a light sheet background, flood fill can leak through tiny
                // outline openings into a white face. Let semantic removal handle
                // those cases, then restore light foreground in post-processing.
                blob = null;
                quality = { status: 'idle', score: 0 };
              } else {
                quality = fastQuality;
              }
            } else {
              console.warn('Fast background removal rejected by quality gate:', fastQuality);
              blob = null;
              quality = { status: 'idle', score: 0 };
            }
          }
        } catch (fastQualityError) {
          if (fastBackgroundIsDark) {
            // A validated uniform dark edge is still safer than semantic AI for
            // pale sticker artwork. Keep the flood-fill result if available.
            console.warn('Dark-background validation was inconclusive; keeping safe flood-fill result:', fastQualityError);
            darkStickerSafePath = true;
            method = 'fast-dark';
            quality = { status: 'pass', score: 0 };
          } else {
            console.warn('Fast background validation failed; falling back to AI:', fastQualityError);
            blob = null;
            quality = { status: 'idle', score: 0 };
          }
        }
      }
"""
replace_once(old_fast_block, new_fast_block, 'main safe-path block')

# 4) On the dark safe path, do not run enclosed-backdrop cleanup. The border
# flood fill is the authoritative alpha operation; only opacity restoration may
# follow it.
old_cleanup = """      const sheetBeforeCleanup = await detectEmoticonSheet(blob);
      if (sheetBeforeCleanup.status === 'not-sheet') {
        blob = await removeEnclosedBackdropPockets(blob, file, true);
      }
"""
new_cleanup = """      const sheetBeforeCleanup = await detectEmoticonSheet(blob);
      if (!darkStickerSafePath && sheetBeforeCleanup.status === 'not-sheet') {
        blob = await removeEnclosedBackdropPockets(blob, file, true);
      }
"""
replace_once(old_cleanup, new_cleanup, 'safe cleanup guard')

# 5) Precision retry must also respect the dark sticker lock. If an older AI
# result is on screen or sheet detection changed, re-run the safe flood-fill
# path rather than BiRefNet.
old_precision_start = """    setPrecisionMessage('');
    try {
      let precisionBlob = await removeWithBiRefNet(file, (info) => {
"""
new_precision_start = """    setPrecisionMessage('');
    try {
      const safeFastResult = await tryFastUniformBackgroundRemoval(file);
      if (safeFastResult?.blob && isDarkBackgroundColor(safeFastResult.background)) {
        const safeDetection = await detectEmoticonSheet(safeFastResult.blob);
        if (isLikelyDarkStickerSheet(safeFastResult.background, safeDetection)) {
          let safeBlob = await correctUnexpectedForegroundTransparency(safeFastResult.blob);
          safeBlob = await protectLightForegroundOpacity(safeBlob, file);
          const safeQuality = await assessRemovalQuality(safeBlob);
          const url = URL.createObjectURL(safeBlob);
          setResultBlob(safeBlob);
          setResultUrl(url);
          setResultMethod('fast-dark');
          setQualityAssessment(safeQuality.status === 'fail' ? { status: 'pass', score: 0 } : safeQuality);
          setComparePosition(50);
          setPrecisionMessage(t.precisionDarkLocked);
          return;
        }
      }

      let precisionBlob = await removeWithBiRefNet(file, (info) => {
"""
replace_once(old_precision_start, new_precision_start, 'precision safe reroute')

# 6) Surface the active method clearly and bump alpha engine marker.
old_badge = """              data-alpha-engine=\"v7\"
              className=\"mt-3 rounded-xl border border-[#DCE8D5] bg-[#F4F8F1] px-3 py-2 text-center text-[11px] font-extrabold text-[#587052] sm:text-xs\"
            >
              ✓ {resultMethod === 'fast' ? t.methodSafe : t.methodAi} · Alpha v7
"""
new_badge = """              data-alpha-engine=\"v8\"
              className=\"mt-3 rounded-xl border border-[#DCE8D5] bg-[#F4F8F1] px-3 py-2 text-center text-[11px] font-extrabold text-[#587052] sm:text-xs\"
            >
              ✓ {resultMethod === 'fast-dark' ? t.methodSafeDark : resultMethod === 'fast' ? t.methodSafe : t.methodAi} · Alpha v8
"""
replace_once(old_badge, new_badge, 'alpha v8 badge')

# Static sanity checks.
required = [
    "function isLikelyDarkStickerSheet",
    "let darkStickerSafePath = false;",
    "method = 'fast-dark';",
    "if (!darkStickerSafePath && sheetBeforeCleanup.status === 'not-sheet')",
    "setPrecisionMessage(t.precisionDarkLocked);",
    'data-alpha-engine="v8"',
]
for marker in required:
    if marker not in text:
        raise SystemExit(f'missing marker after patch: {marker}')

path.write_text(text, encoding='utf-8')
print('Applied dark-background sticker safe path and Alpha v8 UI.')
