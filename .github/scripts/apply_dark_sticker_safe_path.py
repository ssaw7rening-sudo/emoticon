from pathlib import Path

source_path = Path('src/components/BackgroundRemover.jsx')
config_path = Path('vite.tailwind-motion-cleanup.config.js')
source = source_path.read_text(encoding='utf-8')
config = config_path.read_text(encoding='utf-8')


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly 1 match, found {count}')
    return text.replace(old, new, 1)

# UI only: do not modify removeBackground/runPrecisionRetry source structures;
# several chained Vite resilience plugins intentionally anchor to them.
copy_replacements = [
    (
        "compareHint: '가운데 슬라이더를 좌우로 움직여 원본과 결과를 비교하세요.', methodSafe: '밝은색 보호 안전 처리', methodAi: 'AI 정밀 처리',",
        "compareHint: '가운데 슬라이더를 좌우로 움직여 원본과 결과를 비교하세요.', methodSafe: '밝은색 보호 안전 처리', methodSafeDark: '검정 배경 스티커 안전 처리', methodAi: 'AI 정밀 처리',",
        'ko copy',
    ),
    (
        "compareHint: 'Drag the center slider left or right to compare the original and result.', methodSafe: 'Light-color safe processing', methodAi: 'AI precision processing',",
        "compareHint: 'Drag the center slider left or right to compare the original and result.', methodSafe: 'Light-color safe processing', methodSafeDark: 'Dark-background sticker safe mode', methodAi: 'AI precision processing',",
        'en copy',
    ),
    (
        "compareHint: '中央のスライダーを左右に動かして元画像と結果を比較できます。', methodSafe: '明るい色を保護する安全処理', methodAi: 'AI高精度処理',",
        "compareHint: '中央のスライダーを左右に動かして元画像と結果を比較できます。', methodSafe: '明るい色を保護する安全処理', methodSafeDark: '暗い背景ステッカー安全処理', methodAi: 'AI高精度処理',",
        'ja copy',
    ),
    (
        "compareHint: '左右拖动中间滑块即可对比原图和处理结果。', methodSafe: '浅色保护安全处理', methodAi: 'AI精细处理',",
        "compareHint: '左右拖动中间滑块即可对比原图和处理结果。', methodSafe: '浅色保护安全处理', methodSafeDark: '深色背景贴纸安全处理', methodAi: 'AI精细处理',",
        'zh copy',
    ),
]
for old, new, label in copy_replacements:
    source = replace_once(source, old, new, label)

source = replace_once(
    source,
    '''              data-alpha-engine="v7"\n              className="mt-3 rounded-xl border border-[#DCE8D5] bg-[#F4F8F1] px-3 py-2 text-center text-[11px] font-extrabold text-[#587052] sm:text-xs"\n            >\n              ✓ {resultMethod === 'fast' ? t.methodSafe : t.methodAi} · Alpha v7\n''',
    '''              data-alpha-engine="v8"\n              className="mt-3 rounded-xl border border-[#DCE8D5] bg-[#F4F8F1] px-3 py-2 text-center text-[11px] font-extrabold text-[#587052] sm:text-xs"\n            >\n              ✓ {resultMethod === 'fast-dark' ? t.methodSafeDark : resultMethod === 'fast' ? t.methodSafe : t.methodAi} · Alpha v8\n''',
    'Alpha v8 badge',
)

# Strengthen the existing FINAL build-time transparency guard instead of
# competing with earlier source transforms. Its deterministic dark prepass
# removes only border-connected dark pixels and already skips all alpha/RGB
# cleanup for the final dark matte result.
config = replace_once(
    config,
    """          if (fastBackgroundIsDark) {\n            // A uniform dark border is unambiguous for flood-fill. Generic\n            // portrait heuristics must not reroute a sticker sheet to semantic\n            // AI, which can erase pale faces and cream artwork.\n            quality = { status: 'pass', score: 0 };\n          } else if (fastQuality.status === 'pass') {""",
    """          if (fastBackgroundIsDark) {\n            // A uniform dark border is unambiguous for flood-fill. Generic\n            // portrait heuristics must not reroute a sticker sheet to semantic\n            // AI, which can erase pale faces, ivory fur, fine white wisps, or\n            // die-cut outlines. Mark this deterministic path explicitly so\n            // later cleanup and the UI cannot mistake it for semantic AI.\n            method = 'fast-dark';\n            quality = { status: 'pass', score: 0 };\n          } else if (fastQuality.status === 'pass') {""",
    'final guard dark quality branch',
)

config = replace_once(
    config,
    "const fastDarkMatteIsFinal = method === 'fast' && fastBackgroundIsDark;",
    "const fastDarkMatteIsFinal = (method === 'fast-dark' || method === 'fast') && fastBackgroundIsDark;",
    'final guard dark final flag',
)

# If generic fast validation itself throws after a deterministic dark result,
# keep the flood-fill and mark it as fast-dark instead of falling through.
config = replace_once(
    config,
    """          if (fastBackgroundIsDark) {\n            console.warn('Fast dark-background quality inspection failed; preserving deterministic flood-fill result:', fastQualityError);\n            quality = { status: 'pass', score: 0 };""",
    """          if (fastBackgroundIsDark) {\n            console.warn('Fast dark-background quality inspection failed; preserving deterministic flood-fill result:', fastQualityError);\n            method = 'fast-dark';\n            quality = { status: 'pass', score: 0 };""",
    'final guard dark catch branch',
)

# Tighten the comment/contract around the deterministic prepass. The actual
# pixel rule remains topology-first: only the dark component connected to the
# image border can become transparent; enclosed black eyes/text remain opaque.
config = replace_once(
    config,
    """  // Require a meaningful but not all-consuming border component. Only the\n  // already-visited component gets cleared; enclosed black details stay solid.\n  if (tail < total * 0.06 || tail > total * 0.92) return null;""",
    """  // Require a meaningful but not all-consuming border component. Only the\n  // already-visited border-connected component gets cleared; enclosed black\n  // eyes, lettering, shadows, white/ivory faces, fine pale fur and antialiased\n  // sticker outlines keep their original RGB and alpha.\n  if (tail < total * 0.06 || tail > total * 0.92) return null;""",
    'dark prepass preservation contract',
)

required_source = ["methodSafeDark", "resultMethod === 'fast-dark'", 'data-alpha-engine="v8"']
required_config = ["method = 'fast-dark';", "method === 'fast-dark' || method === 'fast'", "fine pale fur"]
for marker in required_source:
    if marker not in source:
        raise SystemExit(f'missing source marker: {marker}')
for marker in required_config:
    if marker not in config:
        raise SystemExit(f'missing config marker: {marker}')

source_path.write_text(source, encoding='utf-8')
config_path.write_text(config, encoding='utf-8')
print('Strengthened final dark-background transparency guard and Alpha v8 UI.')
