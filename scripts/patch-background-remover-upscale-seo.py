from pathlib import Path


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f'Missing anchor: {label}')
    return text.replace(old, new, 1)

# Visible landing-page copy
landing = Path('src/components/BackgroundRemoverLanding.jsx')
s = landing.read_text(encoding='utf-8')

replacements = [
    # Korean
    ("title: '무료 이미지 배경 제거 · 투명 PNG 만들기',", "title: '무료 이미지 배경 제거 · 투명 PNG 만들기 · 고화질 업스케일',", 'ko title'),
    ("lead: '사진이나 이미지의 배경을 브라우저에서 바로 제거하고 투명 PNG로 저장하세요. 균일한 단색 배경은 빠르게 처리하고, 복잡한 배경은 AI로 자동 처리합니다.',", "lead: '사진이나 이미지의 배경을 브라우저에서 바로 제거하고 투명 PNG로 저장하세요. 균일한 단색 배경은 빠르게 처리하고, 복잡한 배경은 AI로 자동 처리합니다. 배경 제거 후 2×·4× 업스케일로 더 크게 저장할 수도 있습니다.',", 'ko lead'),
    ("feature3: '이모티콘 후처리',\n    feature3Desc: '15개 자동 분리, 360×360 규격화, 개별 수정과 ZIP 저장까지 이어집니다.',", "feature3: '고화질 업스케일',\n    feature3Desc: '360·720·1440 크기로 확대 저장하고 선명도를 보정할 수 있습니다.',\n    feature4: '이모티콘 후처리',\n    feature4Desc: '15개 자동 분리, 개별 수정, 360·720·1440 저장, ZIP 일괄 저장까지 지원합니다.',", 'ko features'),
    ("steps: ['배경이 있는 PNG·JPG·WEBP 이미지를 선택합니다.', '배경 제거하기를 눌러 결과를 확인합니다.', '좌우 비교 슬라이더로 원본과 결과를 비교합니다.', '투명 PNG로 저장하거나 이모티콘 자동 분리를 진행합니다.'],", "steps: ['배경이 있는 PNG·JPG·WEBP 이미지를 선택합니다.', '배경 제거하기를 눌러 결과를 확인합니다.', '좌우 비교 슬라이더로 원본과 결과를 비교합니다.', '투명 PNG로 저장하거나, 이모티콘은 자동 분리 후 360·720·1440 크기로 저장합니다.'],", 'ko steps'),
    ("faq3a: '이미 투명 영역이 있는 PNG는 다시 배경 제거하지 않고 안내합니다. 배경이 있는 원본 이미지를 사용하는 것이 좋습니다.'", "faq3a: '이미 투명 영역이 있는 PNG는 다시 배경 제거하지 않고 안내합니다. 배경이 있는 원본 이미지를 사용하는 것이 좋습니다.',\n    faq4: '업스케일로 얼마나 크게 저장할 수 있나요?',\n    faq4a: '360px 기본, 720px(2×), 1440px(4×)로 저장할 수 있으며 2×·4×에는 고품질 확대와 가벼운 선명도 보정이 적용됩니다.'", 'ko faq'),

    # English
    ("title: 'Free Image Background Remover',", "title: 'Free Background Remover, Transparent PNG & Image Upscaler',", 'en title'),
    ("lead: 'Remove photo and image backgrounds directly in your browser and save transparent PNG files. Uniform solid backgrounds are handled quickly, while complex scenes use AI.',", "lead: 'Remove photo and image backgrounds directly in your browser and save transparent PNG files. Uniform solid backgrounds are handled quickly, while complex scenes use AI. After removal, export at 2× or 4× with high-quality scaling.',", 'en lead'),
    ("feature3: 'Emoticon finishing tools', feature3Desc: 'Auto-split 15 stickers, resize to 360×360, fine-tune, and download as ZIP.',", "feature3: 'High-quality upscaling', feature3Desc: 'Export at 360, 720, or 1440px with high-quality scaling and light sharpening.',\n    feature4: 'Emoticon finishing tools', feature4Desc: 'Auto-split 15 stickers, fine-tune them, export at 360/720/1440px, and download as ZIP.',", 'en features'),
    ("steps: ['Choose a PNG, JPG, or WEBP image with a background.', 'Select Remove Background and wait for the result.', 'Drag the comparison slider to check the original and transparent result.', 'Save as transparent PNG or continue to auto-split emoticons.'],", "steps: ['Choose a PNG, JPG, or WEBP image with a background.', 'Select Remove Background and wait for the result.', 'Drag the comparison slider to check the original and transparent result.', 'Save the transparent PNG, or auto-split emoticons and export at 360, 720, or 1440px.'],", 'en steps'),
    ("faq3: 'Can I upload an already transparent PNG?', faq3a: 'PNG files that already contain transparency are detected and are not processed again. Use the original image with a background instead.'", "faq3: 'Can I upload an already transparent PNG?', faq3a: 'PNG files that already contain transparency are detected and are not processed again. Use the original image with a background instead.',\n    faq4: 'How large can I upscale the image?', faq4a: 'Choose 360px base output, 720px (2×), or 1440px (4×). The 2× and 4× options use high-quality scaling with light sharpening.'", 'en faq'),

    # Japanese
    ("title: '無料の画像背景削除・透過PNG作成',", "title: '無料の背景削除・透過PNG作成・高画質アップスケール',", 'ja title'),
    ("lead: '写真や画像の背景をブラウザ上で削除し、透過PNGとして保存できます。均一な単色背景は高速処理し、複雑な背景はAIで自動処理します。',", "lead: '写真や画像の背景をブラウザ上で削除し、透過PNGとして保存できます。均一な単色背景は高速処理し、複雑な背景はAIで自動処理します。背景削除後は2×・4×の高画質アップスケールでより大きく保存できます。',", 'ja lead'),
    ("feature3: '絵文字の仕上げ', feature3Desc: '15個の自動分割、360×360変換、微調整、ZIP保存まで利用できます。',", "feature3: '高画質アップスケール', feature3Desc: '360・720・1440pxで拡大保存し、軽いシャープ補正を適用できます。',\n    feature4: '絵文字の仕上げ', feature4Desc: '15個の自動分割、個別調整、360・720・1440px保存、ZIP一括保存まで対応します。',", 'ja features'),
    ("steps: ['背景のあるPNG・JPG・WEBP画像を選びます。', '背景を削除するボタンを押します。', '比較スライダーで元画像と結果を確認します。', '透過PNGで保存するか、絵文字の自動分割へ進みます。'],", "steps: ['背景のあるPNG・JPG・WEBP画像を選びます。', '背景を削除するボタンを押します。', '比較スライダーで元画像と結果を確認します。', '透過PNGで保存するか、絵文字を自動分割して360・720・1440pxで保存します。'],", 'ja steps'),
    ("faq3: 'すでに透過済みのPNGも使えますか？', faq3a: 'すでに透明部分があるPNGは再処理せず案内します。背景のある元画像をご利用ください。'", "faq3: 'すでに透過済みのPNGも使えますか？', faq3a: 'すでに透明部分があるPNGは再処理せず案内します。背景のある元画像をご利用ください。',\n    faq4: 'どのサイズまでアップスケールできますか？', faq4a: '360pxの基本出力に加え、720px（2×）と1440px（4×）で保存できます。2×・4×では高品質拡大と軽いシャープ補正を適用します。'", 'ja faq'),

    # Chinese
    ("title: '免费图片背景移除 · 透明PNG制作',", "title: '免费图片背景移除 · 透明PNG制作 · 高清放大',", 'zh title'),
    ("lead: '直接在浏览器中移除照片或图片背景，并保存为透明PNG。均匀纯色背景会快速处理，复杂背景则自动使用AI。',", "lead: '直接在浏览器中移除照片或图片背景，并保存为透明PNG。均匀纯色背景会快速处理，复杂背景则自动使用AI。移除背景后，还可使用2×或4×高质量放大保存更大的图片。',", 'zh lead'),
    ("feature3: '表情包后期处理', feature3Desc: '支持15张自动分割、360×360规格化、单张微调和ZIP批量保存。',", "feature3: '高清图片放大', feature3Desc: '可按360、720或1440px放大保存，并进行轻度锐化处理。',\n    feature4: '表情包后期处理', feature4Desc: '支持15张自动分割、单张微调、360/720/1440px保存以及ZIP批量保存。',", 'zh features'),
    ("steps: ['选择带背景的PNG、JPG或WEBP图片。', '点击移除背景并等待处理完成。', '拖动对比滑块查看原图与透明结果。', '保存透明PNG，或继续进行表情包自动分割。'],", "steps: ['选择带背景的PNG、JPG或WEBP图片。', '点击移除背景并等待处理完成。', '拖动对比滑块查看原图与透明结果。', '保存透明PNG，或自动分割表情并按360、720或1440px保存。'],", 'zh steps'),
    ("faq3: '已经透明的PNG还能处理吗？', faq3a: '系统会检测已有透明区域的PNG并避免重复处理。建议使用带背景的原始图片。'", "faq3: '已经透明的PNG还能处理吗？', faq3a: '系统会检测已有透明区域的PNG并避免重复处理。建议使用带背景的原始图片。',\n    faq4: '可以放大到多大尺寸？', faq4a: '可选择360px基础输出、720px（2×）或1440px（4×）。2×和4×会使用高质量缩放并进行轻度锐化。'", 'zh faq'),

    # Render structure
    ("<span className=\"mt-1 block whitespace-nowrap\">투명 PNG 만들기</span>", "<span className=\"mt-1 block whitespace-nowrap\">투명 PNG 만들기</span>\n      <span className=\"mt-1 block whitespace-nowrap text-[0.88em]\">고화질 업스케일</span>", 'ko h1 third line'),
    ("<section className=\"mt-7 grid gap-2.5 sm:grid-cols-3\">", "<section className=\"mt-7 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4\">", 'feature grid'),
    ("[[t.feature1, t.feature1Desc], [t.feature2, t.feature2Desc], [t.feature3, t.feature3Desc]]", "[[t.feature1, t.feature1Desc], [t.feature2, t.feature2Desc], [t.feature3, t.feature3Desc], [t.feature4, t.feature4Desc]]", 'feature list'),
    ("[[t.faq1, t.faq1a], [t.faq2, t.faq2a], [t.faq3, t.faq3a]]", "[[t.faq1, t.faq1a], [t.faq2, t.faq2a], [t.faq3, t.faq3a], [t.faq4, t.faq4a]]", 'faq list'),
]
for old, new, label in replacements:
    s = replace_once(s, old, new, label)
landing.write_text(s, encoding='utf-8')

# Static localized SEO pages
gen = Path('scripts/generate-localized-pages.mjs')
g = gen.read_text(encoding='utf-8')
gen_replacements = [
    ("title: '무료 이미지 배경 제거 | 누끼 따기 · 투명 PNG 만들기'", "title: '무료 이미지 배경 제거 | 누끼 따기 · 투명 PNG · 업스케일'", 'static ko title'),
    ("description: '사진·이미지 배경을 무료로 제거하고 투명 PNG로 저장하세요. 흰색뿐 아니라 균일한 단색 배경은 빠르게 처리하며, 복잡한 배경은 AI로 자동 제거합니다. 이미지 파일은 서버에 업로드하지 않고 브라우저에서 처리합니다.'", "description: '사진·이미지 배경을 무료로 제거하고 투명 PNG로 저장하세요. 균일한 단색 배경은 빠르게 처리하고 복잡한 배경은 AI로 자동 제거합니다. 360·720·1440px 저장과 2×·4× 고화질 업스케일도 지원하며 이미지는 브라우저에서 처리합니다.'", 'static ko desc'),
    ("keywords: '배경 제거, 이미지 배경 제거, 사진 배경 제거, 누끼 따기, 무료 누끼 따기, 투명 PNG, PNG 배경 제거, 무료 배경 제거, 이모티콘 배경 제거'", "keywords: '배경 제거, 이미지 배경 제거, 사진 배경 제거, 누끼 따기, 무료 누끼 따기, 투명 PNG, PNG 배경 제거, 무료 배경 제거, 이미지 업스케일, 사진 업스케일, 고화질 이미지 확대, 이모티콘 배경 제거'", 'static ko keywords'),
    ("title: 'Free Image Background Remover | Transparent PNG Maker'", "title: 'Free Background Remover | Transparent PNG & Image Upscaler'", 'static en title'),
    ("description: 'Remove image and photo backgrounds for free in your browser. Fast solid-color background removal, AI processing for complex scenes, and transparent PNG export without uploading images to our server.'", "description: 'Remove image and photo backgrounds for free in your browser, export transparent PNGs, and upscale to 720px (2×) or 1440px (4×) with high-quality scaling and light sharpening.'", 'static en desc'),
    ("keywords: 'background remover, remove image background, free background remover, transparent PNG, photo background remover, PNG background remover'", "keywords: 'background remover, remove image background, free background remover, transparent PNG, photo background remover, PNG background remover, image upscaler, upscale image, high quality image enlargement'", 'static en keywords'),
    ("title: '無料画像背景削除 | 透過PNG・背景透過ツール'", "title: '無料の画像背景削除 | 透過PNG・高画質アップスケール'", 'static ja title'),
    ("description: '写真や画像の背景を無料で削除し、透過PNGとして保存できます。均一な単色背景は高速処理、複雑な背景はAIで自動処理。画像はサーバーへアップロードせずブラウザ内で処理します。'", "description: '写真や画像の背景を無料で削除して透過PNGとして保存し、720px（2×）・1440px（4×）へ高品質アップスケールできます。画像はサーバーへアップロードせずブラウザ内で処理します。'", 'static ja desc'),
    ("keywords: '背景削除, 画像背景削除, 背景透過, 透過PNG, 無料背景削除, 写真背景削除, PNG背景透過'", "keywords: '背景削除, 画像背景削除, 背景透過, 透過PNG, 無料背景削除, 写真背景削除, PNG背景透過, 画像アップスケール, 高画質化, 画像拡大'", 'static ja keywords'),
    ("title: '免费图片背景移除 | 透明PNG制作工具'", "title: '免费图片背景移除 | 透明PNG・高清图片放大'", 'static zh title'),
    ("description: '免费移除照片和图片背景并保存为透明PNG。均匀纯色背景快速处理，复杂背景自动使用AI；图片在浏览器中处理，不上传到本站服务器。'", "description: '免费移除照片和图片背景并保存为透明PNG，还可高质量放大至720px（2×）或1440px（4×）并轻度锐化。图片在浏览器中处理，不上传到本站服务器。'", 'static zh desc'),
    ("keywords: '背景移除, 图片背景移除, 免费抠图, 透明PNG, 照片背景移除, PNG背景透明, AI抠图'", "keywords: '背景移除, 图片背景移除, 免费抠图, 透明PNG, 照片背景移除, PNG背景透明, 图片放大, 图片高清化, 图片upscale, AI抠图'", 'static zh keywords'),
    ("featureList: ['Image background removal', 'Transparent PNG export', 'Solid-color fast removal', 'AI background removal', '15-emoticon auto split', '360x360 PNG export']", "featureList: ['Image background removal', 'Transparent PNG export', 'Solid-color fast removal', 'AI background removal', '15-emoticon auto split', '360px PNG export', '720px 2x high-quality upscale', '1440px 4x high-quality upscale', 'ZIP batch export']", 'structured features'),
]
for old, new, label in gen_replacements:
    g = replace_once(g, old, new, label)
gen.write_text(g, encoding='utf-8')

# Runtime SPA metadata
app = Path('src/App.jsx')
a = app.read_text(encoding='utf-8')
app_replacements = [
    ("title: '무료 이미지 배경 제거 | 누끼 따기 · 투명 PNG 만들기',", "title: '무료 이미지 배경 제거 | 누끼 따기 · 투명 PNG · 업스케일',", 'runtime ko title'),
    ("description: '사진·이미지 배경을 무료로 제거하고 투명 PNG로 저장하세요. 균일한 단색 배경은 빠르게 처리하고 복잡한 배경은 AI로 자동 제거합니다.',", "description: '사진·이미지 배경을 무료로 제거하고 투명 PNG로 저장하세요. 360·720·1440px 저장과 2×·4× 고화질 업스케일도 지원합니다.',", 'runtime ko desc'),
    ("title: 'Free Image Background Remover | Transparent PNG Maker',", "title: 'Free Background Remover | Transparent PNG & Image Upscaler',", 'runtime en title'),
    ("description: 'Remove image and photo backgrounds for free in your browser. Fast solid-color removal, AI processing for complex scenes, and transparent PNG export.',", "description: 'Remove backgrounds for free, export transparent PNGs, and upscale to 720px (2×) or 1440px (4×) with high-quality scaling.',", 'runtime en desc'),
    ("title: '無料画像背景削除 | 透過PNG・背景透過ツール',", "title: '無料の画像背景削除 | 透過PNG・高画質アップスケール',", 'runtime ja title'),
    ("description: '写真や画像の背景を無料で削除し、透過PNGとして保存できます。単色背景は高速処理し、複雑な背景はAIで自動処理します。',", "description: '写真や画像の背景を無料で削除して透過PNGとして保存し、720px（2×）・1440px（4×）へ高品質アップスケールできます。',", 'runtime ja desc'),
    ("title: '免费图片背景移除 | 透明PNG制作工具',", "title: '免费图片背景移除 | 透明PNG・高清图片放大',", 'runtime zh title'),
    ("description: '免费移除照片和图片背景并保存为透明PNG。均匀纯色背景快速处理，复杂背景自动使用AI。',", "description: '免费移除图片背景并保存透明PNG，还可高质量放大至720px（2×）或1440px（4×）。',", 'runtime zh desc'),
]
for old, new, label in app_replacements:
    a = replace_once(a, old, new, label)
app.write_text(a, encoding='utf-8')

print('Background remover upscale landing and SEO copy patched.')
