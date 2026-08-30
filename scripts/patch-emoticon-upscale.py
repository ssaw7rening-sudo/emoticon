from pathlib import Path
import re

p = Path('src/components/EmoticonPostProcessor.jsx')
s = p.read_text(encoding='utf-8')

replacements = {
    """    title: '이모티콘 마무리', ready: '분리된 15개 이미지를 수정하고 360×360 규격으로 저장할 수 있습니다.',
    normalizeAll: '전체 360×360 변환', zip: 'ZIP 일괄 저장', working: '처리 중…', edit: '수정', save: '저장',
    editorTitle: '360×360 미세조정', zoom: '크기', x: '좌우 위치', y: '상하 위치', reset: '초기화', cancel: '취소', apply: '수정 적용',
    normalized: '360', raw: '자동', zipName: 'emoticon-360', failed: '이미지 처리 중 오류가 발생했습니다.'""": """    title: '이모티콘 마무리', ready: '분리된 15개 이미지를 수정하고 360~1440px 고화질 PNG로 저장할 수 있습니다.',
    sizeLabel: '출력 크기', qualityNote: '2×·4×는 고품질 확대와 선명도 보정을 적용합니다.',
    normalizeAll: '전체 {size}×{size} 변환', zip: 'ZIP 일괄 저장', working: '처리 중…', edit: '수정', save: '저장',
    editorTitle: '미세조정', zoom: '크기', x: '좌우 위치', y: '상하 위치', reset: '초기화', cancel: '취소', apply: '수정 적용',
    raw: '자동', basic: '기본', upscale: '업스케일', zipName: 'emoticon', failed: '이미지 처리 중 오류가 발생했습니다.'""",
    """    title: 'Finish emoticons', ready: 'Fine-tune the 15 split images and export them at 360×360.',
    normalizeAll: 'Convert all to 360×360', zip: 'Download ZIP', working: 'Processing…', edit: 'Edit', save: 'Save',
    editorTitle: 'Fine-tune 360×360', zoom: 'Size', x: 'Horizontal', y: 'Vertical', reset: 'Reset', cancel: 'Cancel', apply: 'Apply edit',
    normalized: '360', raw: 'Auto', zipName: 'emoticon-360', failed: 'An error occurred while processing the image.'""": """    title: 'Finish emoticons', ready: 'Fine-tune the 15 split images and export high-quality PNGs from 360 to 1440px.',
    sizeLabel: 'Output size', qualityNote: '2× and 4× use high-quality scaling with light sharpening.',
    normalizeAll: 'Convert all to {size}×{size}', zip: 'Download ZIP', working: 'Processing…', edit: 'Edit', save: 'Save',
    editorTitle: 'Fine-tune', zoom: 'Size', x: 'Horizontal', y: 'Vertical', reset: 'Reset', cancel: 'Cancel', apply: 'Apply edit',
    raw: 'Auto', basic: 'Base', upscale: 'Upscale', zipName: 'emoticon', failed: 'An error occurred while processing the image.'""",
    """    title: '絵文字の仕上げ', ready: '分割した15枚を微調整し、360×360で保存できます。',
    normalizeAll: 'すべて360×360に変換', zip: 'ZIP一括保存', working: '処理中…', edit: '編集', save: '保存',
    editorTitle: '360×360微調整', zoom: 'サイズ', x: '左右位置', y: '上下位置', reset: 'リセット', cancel: 'キャンセル', apply: '編集を適用',
    normalized: '360', raw: '自動', zipName: 'emoticon-360', failed: '画像処理中にエラーが発生しました。'""": """    title: '絵文字の仕上げ', ready: '分割した15枚を微調整し、360〜1440pxの高画質PNGで保存できます。',
    sizeLabel: '出力サイズ', qualityNote: '2×・4×は高品質拡大と軽いシャープ補正を適用します。',
    normalizeAll: 'すべて{size}×{size}に変換', zip: 'ZIP一括保存', working: '処理中…', edit: '編集', save: '保存',
    editorTitle: '微調整', zoom: 'サイズ', x: '左右位置', y: '上下位置', reset: 'リセット', cancel: 'キャンセル', apply: '編集を適用',
    raw: '自動', basic: '基本', upscale: 'アップスケール', zipName: 'emoticon', failed: '画像処理中にエラーが発生しました。'""",
    """    title: '表情包收尾', ready: '可微调已分割的15张图片，并按360×360规格保存。',
    normalizeAll: '全部转换为360×360', zip: 'ZIP批量保存', working: '处理中…', edit: '调整', save: '保存',
    editorTitle: '360×360微调', zoom: '大小', x: '左右位置', y: '上下位置', reset: '重置', cancel: '取消', apply: '应用调整',
    normalized: '360', raw: '自动', zipName: 'emoticon-360', failed: '图片处理时发生错误。'""": """    title: '表情包收尾', ready: '可微调已分割的15张图片，并保存为360到1440px的高画质PNG。',
    sizeLabel: '输出尺寸', qualityNote: '2×和4×会使用高质量放大并进行轻度锐化。',
    normalizeAll: '全部转换为{size}×{size}', zip: 'ZIP批量保存', working: '处理中…', edit: '调整', save: '保存',
    editorTitle: '微调', zoom: '大小', x: '左右位置', y: '上下位置', reset: '重置', cancel: '取消', apply: '应用调整',
    raw: '自动', basic: '基础', upscale: '放大', zipName: 'emoticon', failed: '图片处理时发生错误。'"""
}

for old, new in replacements.items():
    if old not in s:
        raise SystemExit('Translation anchor not found')
    s = s.replace(old, new, 1)

new_render = r'''function sharpenCanvas(canvas, amount = 0.08) {
  if (amount <= 0) return;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const source = new Uint8ClampedArray(data);
  const stride = width * 4;
  const clamp = (value) => Math.max(0, Math.min(255, Math.round(value)));

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const p = (y * width + x) * 4;
      if (source[p + 3] < 16) continue;
      for (let channel = 0; channel < 3; channel += 1) {
        const center = source[p + channel];
        const neighbors = source[p - 4 + channel] + source[p + 4 + channel] + source[p - stride + channel] + source[p + stride + channel];
        data[p + channel] = clamp(center * (1 + amount * 4) - neighbors * amount);
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

async function makeOutput(blob, transform = { zoom: 1, x: 0, y: 0 }, outputScale = 1) {
  const image = await loadBitmap(blob);
  const width = image.width || image.naturalWidth;
  const height = image.height || image.naturalHeight;
  const scaleFactor = [1, 2, 4].includes(outputScale) ? outputScale : 1;
  const size = 360 * scaleFactor;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: scaleFactor > 1 });
  if (!ctx) throw new Error('Canvas unavailable');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const safeSize = 300 * scaleFactor;
  const fit = Math.min(safeSize / Math.max(1, width), safeSize / Math.max(1, height));
  const zoom = Math.max(0.55, Math.min(1.45, transform.zoom || 1));
  const drawScale = fit * zoom;
  const drawW = width * drawScale;
  const drawH = height * drawScale;
  const x = (size - drawW) / 2 + (transform.x || 0) * scaleFactor;
  const y = (size - drawH) / 2 + (transform.y || 0) * scaleFactor;
  ctx.drawImage(image, x, y, drawW, drawH);
  image.close?.();

  if (scaleFactor > 1) sharpenCanvas(canvas, scaleFactor === 4 ? 0.11 : 0.075);
  return canvasToBlob(canvas);
}

function downloadBlob'''

s, count = re.subn(
    r"async function make360\(blob, transform = \{ zoom: 1, x: 0, y: 0 \}\) \{[\s\S]*?\n\}\n\nfunction downloadBlob",
    new_render,
    s,
    count=1
)
if count != 1:
    raise SystemExit('make360 function anchor not found')

state_anchor = "  const [editor, setEditor] = useState({ zoom: 1, x: 0, y: 0 });"
if state_anchor not in s:
    raise SystemExit('Editor state anchor not found')
s = s.replace(state_anchor, state_anchor + "\n  const [outputScale, setOutputScale] = useState(1);", 1)

base_anchor = "  const base = safeBaseName(sourceName);"
base_insert = """  const base = safeBaseName(sourceName);
  const outputSize = 360 * outputScale;
  const normalizeLabel = t.normalizeAll.replace('{size}', String(outputSize));

  const changeOutputScale = (nextScale) => {
    if (working || nextScale === outputScale) return;
    setProcessed((list) => list.map((item) => {
      if (item.finalUrl) URL.revokeObjectURL(item.finalUrl);
      return { ...item, finalBlob: null, finalUrl: '' };
    }));
    setOutputScale(nextScale);
  };"""
if base_anchor not in s:
    raise SystemExit('Base name anchor not found')
s = s.replace(base_anchor, base_insert, 1)

s = s.replace("const blob = await make360(item.blob, transform);", "const blob = await makeOutput(item.blob, transform, outputScale);", 2)
s = s.replace("blob = await make360(item.blob, item.transform || { zoom: 1, x: 0, y: 0 });", "blob = await makeOutput(item.blob, item.transform || { zoom: 1, x: 0, y: 0 }, outputScale);", 1)
s = s.replace("downloadBlob(blob, `${base}-${String(item.index).padStart(2, '0')}-360.png`);", "downloadBlob(blob, `${base}-${String(item.index).padStart(2, '0')}-${outputSize}.png`);", 1)
s = s.replace("downloadBlob(zipBlob, `${base}-${t.zipName}.zip`);", "downloadBlob(zipBlob, `${base}-${t.zipName}-${outputSize}.zip`);", 1)

old_header = '''      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm sm:text-base font-extrabold text-[#35312C]">🧰 {t.title}</h4>
          <p className="mt-1 text-xs sm:text-[13px] leading-5 text-[#746E65]">{t.ready}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={working} onClick={normalizeAll} className="rounded-xl border border-[#BFCDBA] bg-[#F3F8F0] px-3 py-2 text-xs font-extrabold text-[#4F684A] disabled:opacity-50">▣ {working ? t.working : t.normalizeAll}</button>
          <button type="button" disabled={working} onClick={downloadZip} className="rounded-xl bg-[#3E6B4B] px-3 py-2 text-xs font-extrabold text-white shadow-sm disabled:opacity-50">📦 {working ? t.working : t.zip}</button>
        </div>
      </div>'''

new_header = '''      <div>
        <h4 className="text-sm sm:text-base font-extrabold text-[#35312C]">🧰 {t.title}</h4>
        <p className="mt-1 text-xs sm:text-[13px] leading-5 text-[#746E65]">{t.ready}</p>
      </div>

      <div className="mt-3 rounded-xl border border-[#E4DED5] bg-white p-2.5 sm:p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="shrink-0 text-[11px] font-extrabold text-[#625C54] sm:text-xs">{t.sizeLabel}</span>
          <div className="grid flex-1 grid-cols-3 gap-1.5 sm:max-w-sm">
            {[1, 2, 4].map((scale) => {
              const size = 360 * scale;
              const active = outputScale === scale;
              return (
                <button
                  key={scale}
                  type="button"
                  disabled={working}
                  onClick={() => changeOutputScale(scale)}
                  className={`rounded-lg border px-1.5 py-1.5 text-center transition disabled:opacity-50 ${active ? 'border-[#6F8C68] bg-[#EEF5EA] text-[#3F5F3A]' : 'border-[#DDD7CE] bg-[#FBFAF7] text-[#6C655D]'}`}
                >
                  <span className="block text-[11px] font-black leading-4 sm:text-xs">{size}</span>
                  <span className="block text-[8px] font-bold leading-3 sm:text-[9px]">{scale === 1 ? t.basic : `${scale}× ${t.upscale}`}</span>
                </button>
              );
            })}
          </div>
        </div>
        <p className="mt-2 text-[10px] font-medium leading-4 text-[#817970] sm:text-[11px]">{t.qualityNote}</p>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-2">
        <button type="button" disabled={working} onClick={normalizeAll} className="rounded-xl border border-[#BFCDBA] bg-[#F3F8F0] px-3 py-2 text-xs font-extrabold text-[#4F684A] disabled:opacity-50">▣ {working ? t.working : normalizeLabel}</button>
        <button type="button" disabled={working} onClick={downloadZip} className="rounded-xl bg-[#3E6B4B] px-3 py-2 text-xs font-extrabold text-white shadow-sm disabled:opacity-50">📦 {working ? t.working : t.zip}</button>
      </div>'''

if old_header not in s:
    raise SystemExit('Header action block not found')
s = s.replace(old_header, new_header, 1)

old_card = '''          <div key={item.index} className="overflow-hidden rounded-xl border border-[#E2DDD5] bg-white shadow-sm">
            <div className="relative aspect-square overflow-hidden" style={checkerStyle}>
              {item.finalUrl ? (
                <img src={item.finalUrl} alt={`emoticon ${item.index}`} className="h-full w-full object-contain" />
              ) : (
                <img src={item.url} alt={`emoticon ${item.index}`} className="h-full w-full object-contain p-1.5" />
              )}
              <span className="absolute left-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-md bg-black/55 px-1 text-[9px] font-extrabold leading-none text-white shadow-sm">{String(item.index).padStart(2, '0')}</span>
              <span className="absolute right-1 top-1 rounded-md bg-white/88 px-1.5 py-0.5 text-[8px] font-extrabold leading-none text-[#5B6E56] shadow-sm backdrop-blur-[1px]">✓ {item.finalBlob ? t.normalized : t.raw}</span>
            </div>
            <div className="grid grid-cols-2 border-t border-[#EEEAE3] bg-white">
              <button type="button" onClick={() => openEditor(item)} className="whitespace-nowrap border-r border-[#EEEAE3] px-1 py-1.5 text-[9px] font-extrabold leading-5 text-[#6A5A46] hover:bg-[#FFF9F0] sm:text-[10px]">✏️ {t.edit}</button>
              <button type="button" onClick={() => downloadItem(item)} className="whitespace-nowrap px-1 py-1.5 text-[9px] font-extrabold leading-5 text-[#4E664A] hover:bg-[#F8FBF6] sm:text-[10px]">↓ {t.save}</button>
            </div>
          </div>'''

new_card = '''          <div key={item.index} className="overflow-hidden rounded-xl border border-[#E2DDD5] bg-white shadow-sm">
            <div className="flex h-7 items-center justify-between gap-1 border-b border-[#EEEAE3] bg-[#FBFAF7] px-1.5">
              <span className="text-[9px] font-black leading-none text-[#5B554E] sm:text-[10px]">{String(item.index).padStart(2, '0')}</span>
              <div className="flex min-w-0 items-center gap-1">
                <span className="rounded-md bg-[#EEF4EA] px-1.5 py-0.5 text-[8px] font-extrabold leading-none text-[#5B6E56]">{item.finalBlob ? outputSize : t.raw}</span>
                {item.finalBlob && outputScale > 1 && <span className="rounded-md bg-[#F1ECE5] px-1 py-0.5 text-[8px] font-extrabold leading-none text-[#75644E]">↑{outputScale}×</span>}
              </div>
            </div>
            <div className="aspect-square overflow-hidden" style={checkerStyle}>
              {item.finalUrl ? (
                <img src={item.finalUrl} alt={`emoticon ${item.index}`} className="h-full w-full object-contain" />
              ) : (
                <img src={item.url} alt={`emoticon ${item.index}`} className="h-full w-full object-contain p-1.5" />
              )}
            </div>
            <div className="grid grid-cols-2 border-t border-[#EEEAE3] bg-white">
              <button type="button" onClick={() => openEditor(item)} className="whitespace-nowrap border-r border-[#EEEAE3] px-1 py-1.5 text-[9px] font-extrabold leading-5 text-[#6A5A46] hover:bg-[#FFF9F0] sm:text-[10px]">✏️ {t.edit}</button>
              <button type="button" onClick={() => downloadItem(item)} className="whitespace-nowrap px-1 py-1.5 text-[9px] font-extrabold leading-5 text-[#4E664A] hover:bg-[#F8FBF6] sm:text-[10px]">↓ {t.save}</button>
            </div>
          </div>'''

if old_card not in s:
    raise SystemExit('Sticker card block not found')
s = s.replace(old_card, new_card, 1)

editor_old = '<h4 className="font-extrabold text-[#35312C]">✏️ {t.editorTitle} · {current.index}</h4>'
editor_new = '<h4 className="font-extrabold text-[#35312C]">✏️ {t.editorTitle} · {outputSize}×{outputSize} · {current.index}</h4>'
if editor_old not in s:
    raise SystemExit('Editor title anchor not found')
s = s.replace(editor_old, editor_new, 1)

if 'make360(' in s:
    raise SystemExit('Old make360 references remain')

p.write_text(s, encoding='utf-8')
print('Patched EmoticonPostProcessor.jsx')
