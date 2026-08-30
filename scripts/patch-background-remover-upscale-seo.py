from pathlib import Path


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f'Missing anchor: {label}')
    return text.replace(old, new, 1)

# 1) Landing-page visible copy
landing = Path('src/components/BackgroundRemoverLanding.jsx')
s = landing.read_text(encoding='utf-8')

replacements = [
    ("title: '무료 이미지 배경 제거 · 투명 PNG 만들기',", "title: '무료 이미지 배경 제거 · 투명 PNG 만들기 · 고화질 업스케일',", 'ko title'),
    ("titleLines: ['무료 이미지 배경 제거', '투명 PNG 만들기'],", "titleLines: ['무료 이미지 배경 제거', '투명 PNG 만들기', '고화질 업스케일'],", 'ko title lines'),
    ("lead: '사진이나 이미지의 배경을 브라우저에서 바로 제거하고 투명 PNG로 저장하세요. 균일한 단색 배경은 빠르게 처리하고, 복잡한 배경은 AI로 자동 처리합니다.',", "lead: '사진이나 이미지의 배경을 브라우저에서 바로 제거하고 투명 PNG로 저장하세요. 균일한 단색 배경은 빠르게 처리하고, 복잡한 배경은 AI로 자동 처리합니다. 배경 제거 후 2×·4× 업스케일로 더 크게 저장할 수도 있습니다.',", 'ko lead'),
    ("feature3: ['이모티콘 후처리', '15개 자동 분리, 360×360 규격화, 개별 수정과 ZIP 저장까지 이어집니다.'],", "feature3: ['고화질 업스케일', '360·720·1440 크기로 확대 저장하고 선명도를 보정할 수 있습니다.'],\n    feature4: ['이모티콘 후처리', '15개 자동 분리, 개별 수정, 360·720·1440 저장, ZIP 일괄 저장까지 지원합니다.'],", 'ko features'),
    ("['4. PNG 저장 또는 자동 분리', '투명 PNG를 저장하거나 15개 이모티콘 시트라면 자동 분리를 이어서 사용할 수 있습니다.']", "['4. 저장·업스케일 또는 자동 분리', '투명 PNG를 저장하거나, 15개 이모티콘 시트는 자동 분리한 뒤 360·720·1440 크기로 저장할 수 있습니다.']", 'ko step4'),
    ("['흰색 배경만 제거할 수 있나요?', '아니요. 균일한 단색 배경은 색상에 관계없이 빠르게 제거하고, 복잡한 배경은 AI 처리를 사용합니다.']", "['흰색 배경만 제거할 수 있나요?', '아니요. 균일한 단색 배경은 색상에 관계없이 빠르게 제거하고, 복잡한 배경은 AI 처리를 사용합니다.'],\n      ['업스케일로 얼마나 크게 저장할 수 있나요?', '360px 기본, 720px(2×), 1440px(4×)로 저장할 수 있으며 2×·4×에는 고품질 확대와 가벼운 선명도 보정이 적용됩니다.']", 'ko faq upscale'),

    ("title: 'Free Image Background Remover & Transparent PNG Maker',", "title: 'Free Image Background Remover, Transparent PNG Maker & Upscaler',", 'en title'),
    ("lead: 'Remove image backgrounds directly in your browser and save transparent PNGs. Uniform solid backgrounds are handled quickly, while complex backgrounds are processed with AI.',", "lead: 'Remove image backgrounds directly in your browser and save transparent PNGs. Uniform solid backgrounds are handled quickly, while complex backgrounds are processed with AI. After removal, export at 2× or 4× with high-quality scaling.',", 'en lead'),
    ("feature3: ['Emoticon post-processing', 'Auto-split 15 stickers, normalize to 360×360, fine-tune, and save a ZIP.'],", "feature3: ['High-quality upscaling', 'Export at 360, 720, or 1440px with high-quality scaling and light sharpening.'],\n    feature4: ['Emoticon post-processing', 'Auto-split 15 stickers, fine-tune them, export at 360/720/1440px, and save a ZIP.'],", 'en features'),
    ("['4. Save or split', 'Save the transparent PNG, or auto-split a 15-sticker sheet for further editing.']", "['4. Save, upscale, or split', 'Save the transparent PNG, or auto-split a 15-sticker sheet and export at 360, 720, or 1440px.']", 'en step4'),
    ("['Does it only remove white backgrounds?', 'No. Uniform solid colors are removed locally regardless of color, while complex scenes use AI processing.']", "['Does it only remove white backgrounds?', 'No. Uniform solid colors are removed locally regardless of color, while complex scenes use AI processing.'],\n      ['How large can I upscale the image?', 'Choose 360px base output, 720px (2×), or 1440px (4×). The 2× and 4× options use high-quality scaling with light sharpening.']", 'en faq upscale'),

    ("title: '無料で画像の背景を削除・透過PNGを作成',", "title: '無料の背景削除・透過PNG作成・高画質アップスケール',", 'ja title'),
    ("lead: '画像の背景をブラウザ上で削除し、透過PNGとして保存できます。均一な単色背景は高速処理し、複雑な背景はAIで自動処理します。',", "lead: '画像の背景をブラウザ上で削除し、透過PNGとして保存できます。均一な単色背景は高速処理し、複雑な背景はAIで自動処理します。背景削除後は2×・4×の高画質アップスケールでより大きく保存できます。',", 'ja lead'),
    ("feature3: ['絵文字の後処理', '15個の自動分割、360×360整形、個別調整、ZIP保存まで続けて使えます。'],", "feature3: ['高画質アップスケール', '360・720・1440pxで拡大保存し、軽いシャープ補正を適用できます。'],\n    feature4: ['絵文字の後処理', '15個の自動分割、個別調整、360・720・1440px保存、ZIP一括保存まで対応します。'],", 'ja features'),
    ("['4. PNG保存または自動分割', '透過PNGを保存するか、15個の絵文字シートなら自動分割を続けて利用できます。']", "['4. 保存・アップスケールまたは自動分割', '透過PNGを保存するか、15個の絵文字シートを自動分割して360・720・1440pxで保存できます。']", 'ja step4'),
    ("['白い背景だけ削除できますか？', 'いいえ。均一な単色背景は色に関係なく高速削除し、複雑な背景はAI処理を使用します。']", "['白い背景だけ削除できますか？', 'いいえ。均一な単色背景は色に関係なく高速削除し、複雑な背景はAI処理を使用します。'],\n      ['どのサイズまでアップスケールできますか？', '360pxの基本出力に加え、720px（2×）と1440px（4×）で保存できます。2×・4×では高品質拡大と軽いシャープ補正を適用します。']", 'ja faq upscale'),

    ("title: '免费图片背景移除与透明PNG制作',", "title: '免费图片背景移除・透明PNG制作・高清放大',", 'zh title'),
    ("lead: '直接在浏览器中移除图片背景并保存透明PNG。均匀纯色背景会快速处理，复杂背景则由AI自动处理。',", "lead: '直接在浏览器中移除图片背景并保存透明PNG。均匀纯色背景会快速处理，复杂背景则由AI自动处理。移除背景后，还可使用2×或4×高质量放大保存更大的图片。',", 'zh lead'),
    ("feature3: ['表情包后处理', '可继续进行15个自动分割、360×360整理、单独调整和ZIP保存。'],", "feature3: ['高清图片放大', '可按360、720或1440px放大保存，并进行轻度锐化处理。'],\n    feature4: ['表情包后处理', '支持15个自动分割、单独调整、360/720/1440px保存以及ZIP批量保存。'],", 'zh features'),
    ("['4. 保存PNG或自动分割', '可以保存透明PNG；如果是15个表情的整图，还可以继续自动分割。']", "['4. 保存、放大或自动分割', '可以保存透明PNG；15个表情的整图还可自动分割并按360、720或1440px保存。']", 'zh step4'),
    ("['只能移除白色背景吗？', '不是。均匀纯色背景无论颜色都可以快速移除，复杂背景则使用AI处理。']", "['只能移除白色背景吗？', '不是。均匀纯色背景无论颜色都可以快速移除，复杂背景则使用AI处理。'],\n      ['可以放大到多大尺寸？', '可选择360px基础输出、720px（2×）或1440px（4×）。2×和4×会使用高质量缩放并进行轻度锐化。']", 'zh faq upscale'),

    ("className=\"mt-6 grid gap-3 sm:grid-cols-3\"", "className=\"mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4\"", 'feature grid columns'),
    ("[t.feature1, t.feature2, t.feature3]", "[t.feature1, t.feature2, t.feature3, t.feature4]", 'feature array'),
]

for old, new, label in replacements:
    s = replace_once(s, old, new, label)
landing.write_text(s, encoding='utf-8')

# 2) Static localized SEO HTML metadata + structured data
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
    ("featureList: ['Image background removal', 'Transparent PNG export', 'Solid-color fast removal', 'AI background removal', '15-emoticon auto split', '360x360 PNG export']", "featureList: ['Image background removal', 'Transparent PNG export', 'Solid-color fast removal', 'AI background removal', '15-emoticon auto split', '360px PNG export', '720px 2x high-quality upscale', '1440px 4x high-quality upscale', 'ZIP batch export']", 'structured feature list'),
]
for old, new, label in gen_replacements:
    g = replace_once(g, old, new, label)
gen.write_text(g, encoding='utf-8')

# 3) Runtime SPA SEO metadata in the large App.jsx
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

print('Background remover upscale landing + SEO copy patched.')
