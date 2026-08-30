import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function preservePrecisionBackgroundRemovalRgb() {
  const replacements = [
    [
      'async function cleanAiForegroundArtifacts(blob) {',
      'async function cleanAiForegroundArtifacts(blob, preserveRgb = false) {'
    ],
    [
      '      if (!count) continue;\n      const mix = Math.min(0.42, ((218 - alpha) / 186) * 0.42);',
      '      if (!count) continue;\n      if (preserveRgb) continue;\n      const mix = Math.min(0.42, ((218 - alpha) / 186) * 0.42);'
    ],
    [
      'async function refinePrecisionEdges(blob) {',
      'async function refinePrecisionEdges(blob, preserveRgb = false) {'
    ],
    [
      '      if (nextAlpha > 0 && confidentCount > 0) {',
      '      if (!preserveRgb && nextAlpha > 0 && confidentCount > 0) {'
    ],
    [
      '      precisionBlob = await cleanAiForegroundArtifacts(precisionBlob);',
      '      precisionBlob = await cleanAiForegroundArtifacts(precisionBlob, true);'
    ],
    [
      '      precisionBlob = await refinePrecisionEdges(precisionBlob);',
      '      precisionBlob = await refinePrecisionEdges(precisionBlob, true);'
    ],
    [
      'async function splitIntoFifteen(blob) {',
      `function getDetectedStickerCellBounds(primaries, index, width, height) {
  const row = Math.floor(index / 5);
  const column = index % 5;
  const primary = primaries[index];
  const left = column > 0 ? primaries[index - 1] : null;
  const right = column < 4 ? primaries[index + 1] : null;
  const above = row > 0 ? primaries[index - 5] : null;
  const below = row < 2 ? primaries[index + 5] : null;

  const minX = left ? Math.max(0, Math.floor((left.centerX + primary.centerX) / 2)) : 0;
  const maxX = right ? Math.min(width - 1, Math.ceil((primary.centerX + right.centerX) / 2)) : width - 1;
  const minY = above ? Math.max(0, Math.floor((above.centerY + primary.centerY) / 2)) : 0;
  const maxY = below ? Math.min(height - 1, Math.ceil((primary.centerY + below.centerY) / 2)) : height - 1;

  return { minX, minY, maxX, maxY };
}

async function splitIntoFifteen(blob) {`
    ],
    [
      `    const primary = primaries[index];
    const group = groups.get(primary.id) || [primary];
    const minX = Math.max(0, Math.min(...group.map((item) => item.minX)) - padding);
    const minY = Math.max(0, Math.min(...group.map((item) => item.minY)) - padding);
    const maxX = Math.min(width - 1, Math.max(...group.map((item) => item.maxX)) + padding);
    const maxY = Math.min(height - 1, Math.max(...group.map((item) => item.maxY)) + padding);`,
      `    const primary = primaries[index];
    const group = groups.get(primary.id) || [primary];
    const cell = getDetectedStickerCellBounds(primaries, index, width, height);

    const safeGroup = group.filter((item) =>
      item.id === primary.id ||
      (item.centerX >= cell.minX && item.centerX <= cell.maxX &&
       item.centerY >= cell.minY && item.centerY <= cell.maxY)
    );
    const cropGroup = safeGroup.length ? safeGroup : [primary];
    const minX = Math.max(cell.minX, Math.min(...cropGroup.map((item) => item.minX)) - padding);
    const minY = Math.max(cell.minY, Math.min(...cropGroup.map((item) => item.minY)) - padding);
    const maxX = Math.min(cell.maxX, Math.max(...cropGroup.map((item) => item.maxX)) + padding);
    const maxY = Math.min(cell.maxY, Math.max(...cropGroup.map((item) => item.maxY)) + padding);`
    ],
    [
      'className="flex flex-wrap items-center justify-between gap-2"',
      'className="flex flex-col items-stretch gap-3"'
    ],
    [
      'className="shrink-0 rounded-lg border border-[#D8CDBD] bg-white px-3 py-2 text-xs font-extrabold text-[#625544] transition hover:bg-[#FFF8ED] disabled:cursor-wait disabled:opacity-60"',
      'className="w-full rounded-xl border border-[#E8C66E] bg-[#FFF8E8] px-4 py-3 text-sm font-extrabold text-[#7A4B22] transition hover:bg-[#FFF2D2] disabled:cursor-wait disabled:opacity-60"'
    ]
  ]

  return {
    name: 'preserve-precision-background-removal-rgb',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')
      for (const [from, to] of replacements) {
        if (!transformed.includes(from)) {
          throw new Error(`[precision-rgb] Expected BackgroundRemover source pattern was not found: ${from}`)
        }
        transformed = transformed.replace(from, to)
      }

      return { code: transformed, map: null }
    }
  }
}

function refreshBackgroundGuide() {
  const blockPattern = /\n        \{activeTab === 'bg' && \(\n[\s\S]*?\n        \)\}\n\n        \{activeTab === 'usage' && \(/

  const replacement = `
        {activeTab === 'bg' && (() => {
          const guide = ({
            ko: {
              title: '배경 제거부터 15개 이모티콘 분리까지, Prompt Maker에서 한 번에!',
              desc: '외부 사이트로 이동할 필요 없이 이미지 선택부터 투명 PNG 저장과 시트 분리까지 이 페이지에서 바로 처리할 수 있습니다.',
              privacy: '이미지는 서버에 업로드하지 않고 현재 기기에서 처리됩니다.',
              action: '배경 제거 도구 바로 열기',
              steps: [
                ['🖼️', '이미지 선택', 'AI로 만든 이모티콘 시트나 사진을 선택합니다.'],
                ['✨', '배경 제거', '배경 제거를 실행해 투명 배경으로 자동 처리합니다.'],
                ['↔️', '원본과 결과 비교', '가운데 슬라이더를 움직여 제거 전후를 바로 확인합니다.'],
                ['🧪', '필요하면 정밀 재처리', '머리카락·외곽선처럼 복잡한 부분은 정밀 재처리로 한 번 더 다듬습니다.'],
                ['✂️', '15개 시트 자동 분리', '15개 이모티콘 시트라면 자동 감지 후 각각의 PNG로 분리할 수 있습니다.'],
                ['📦', '크기 조정 후 저장', '360·720·1440px로 마무리하고 개별 PNG 또는 ZIP으로 한 번에 저장합니다.']
              ]
            },
            en: {
              title: 'Remove backgrounds and split 15 emoticons — all inside Prompt Maker',
              desc: 'No external site is needed. Choose an image, remove the background, review the result, split the sheet, and export your PNGs here.',
              privacy: 'Images are processed on this device and are not uploaded to our server.',
              action: 'Open Background Remover',
              steps: [
                ['🖼️', 'Choose an image', 'Select an AI-generated emoticon sheet or photo.'],
                ['✨', 'Remove the background', 'Run background removal to create a transparent result.'],
                ['↔️', 'Compare before and after', 'Move the center slider to inspect the original and result.'],
                ['🧪', 'Use precision retry if needed', 'Refine difficult hair and edge areas with the precision model.'],
                ['✂️', 'Auto-split a 15-sticker sheet', 'Detect and separate a 15-emoticon sheet into individual PNGs.'],
                ['📦', 'Resize and export', 'Finish at 360, 720, or 1440px and save individual PNGs or one ZIP.']
              ]
            },
            ja: {
              title: '背景透過から15個のスタンプ分割まで、Prompt Makerでまとめて完了！',
              desc: '外部サイトへ移動せず、画像選択・背景透過・結果確認・分割・PNG保存までこのページ内で行えます。',
              privacy: '画像はサーバーへ送信せず、この端末内で処理されます。',
              action: '背景削除ツールを開く',
              steps: [
                ['🖼️', '画像を選択', 'AIで作成したスタンプシートや写真を選びます。'],
                ['✨', '背景を削除', '背景削除を実行して透過画像にします。'],
                ['↔️', '元画像と結果を比較', '中央スライダーで処理前後を確認します。'],
                ['🧪', '必要なら高精度で再処理', '髪や輪郭など難しい部分を高精度処理で整えます。'],
                ['✂️', '15個のシートを自動分割', '15個のスタンプシートを検出し、個別PNGに分割できます。'],
                ['📦', 'サイズ調整して保存', '360・720・1440pxに仕上げ、個別PNGまたはZIPで保存します。']
              ]
            },
            zh: {
              title: '从移除背景到拆分15个表情，全部在 Prompt Maker 内完成！',
              desc: '无需跳转到外部网站，从选择图片、移除背景、检查结果到拆分和保存PNG，都可以在这里完成。',
              privacy: '图片不会上传到服务器，而是在当前设备中处理。',
              action: '打开背景移除工具',
              steps: [
                ['🖼️', '选择图片', '选择AI生成的表情合集或照片。'],
                ['✨', '移除背景', '运行背景移除并生成透明背景结果。'],
                ['↔️', '对比原图与结果', '拖动中间滑块检查处理前后的差异。'],
                ['🧪', '需要时高精度重试', '针对头发和边缘等复杂区域进行高精度处理。'],
                ['✂️', '自动拆分15个表情', '自动识别15个表情合集并拆分为单独PNG。'],
                ['📦', '调整尺寸并保存', '可输出360、720或1440px，并保存单张PNG或ZIP。']
              ]
            }
          })[lang] || ({})

          const route = lang === 'en' ? '/en/background-remover/' : lang === 'ja' ? '/ja/background-remover/' : lang === 'zh' ? '/zh/background-remover/' : '/background-remover/'

          return (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="rounded-2xl border border-[#E7DEC9] bg-[#FFFDF8] p-4 sm:p-5">
                <h3 className="text-[17px] sm:text-[19px] font-black leading-7 text-[#2F2D2A]">{guide.title}</h3>
                <p className="mt-2 text-[13px] sm:text-[14px] leading-6 text-[#6D665E]">{guide.desc}</p>
                <div className="mt-3 rounded-xl bg-[#F7F8F2] px-3.5 py-2.5 text-[12px] sm:text-[13px] font-semibold leading-5 text-[#596454]">🔒 {guide.privacy}</div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {guide.steps.map((step, index) => (
                  <div key={step[1]} className="flex gap-3 rounded-xl border border-[#E8E1D6] bg-white px-3.5 py-3.5 shadow-[0_1px_3px_rgba(80,65,45,0.04)]">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF3D6] text-[15px] font-black text-[#81551E]">{index + 1}</div>
                    <div className="min-w-0">
                      <div className="text-[13px] sm:text-[14px] font-extrabold text-[#37332F]">{step[0]} {step[1]}</div>
                      <p className="mt-1 text-[12px] sm:text-[13px] leading-5 text-[#756E65]">{step[2]}</p>
                    </div>
                  </div>
                ))}
              </div>

              <a href={route} className="mt-4 flex min-h-[46px] w-full items-center justify-center rounded-xl border border-[#E1BF68] bg-[#FFF4D7] px-4 py-3 text-sm font-extrabold text-[#744B1C] no-underline shadow-sm transition hover:bg-[#FFECC0]">
                ✂️ {guide.action} →
              </a>
            </div>
          )
        })()}

        {activeTab === 'usage' && (`

  return {
    name: 'refresh-background-guide',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/App.jsx')) return null

      const source = code.replace(/\r\n/g, '\n')
      if (!blockPattern.test(source)) {
        throw new Error('[background-guide] Could not find the background guide tab block')
      }
      return { code: source.replace(blockPattern, replacement), map: null }
    }
  }
}

export default defineConfig({
  plugins: [preservePrecisionBackgroundRemovalRgb(), refreshBackgroundGuide(), react()],
})
