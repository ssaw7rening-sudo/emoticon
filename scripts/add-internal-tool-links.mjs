import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');

const locales = {
  ko: {
    prefix: '',
    title: 'Prompt Maker 무료 도구',
    desc: '이모티콘 제작부터 배경 제거, 시트 분리, 투명 PNG, 고화질 변환까지 필요한 기능을 바로 이용하세요.',
    links: [
      ['ai-sticker-maker', 'AI 이모티콘 만들기'],
      ['photo-to-sticker', '사진으로 이모티콘 만들기'],
      ['sticker-sheet-splitter', '15개 시트 자동 분리'],
      ['transparent-png-maker', '투명 PNG 만들기'],
      ['image-upscaler', '이미지 고화질 변환'],
      ['background-remover', '배경 제거 도구']
    ]
  },
  en: {
    prefix: 'en',
    title: 'Free Prompt Maker Tools',
    desc: 'Create AI stickers, turn photos into stickers, remove backgrounds, split sticker sheets, export transparent PNGs, and upscale images.',
    links: [
      ['ai-sticker-maker', 'AI Sticker Maker'],
      ['photo-to-sticker', 'Photo to Sticker'],
      ['sticker-sheet-splitter', 'Sticker Sheet Splitter'],
      ['transparent-png-maker', 'Transparent PNG Maker'],
      ['image-upscaler', 'Image Upscaler'],
      ['background-remover', 'Background Remover']
    ]
  },
  ja: {
    prefix: 'ja',
    title: 'Prompt Maker 無料ツール',
    desc: 'AIスタンプ作成、写真からスタンプ、背景透過、15個シート分割、透過PNG、高画質化までまとめて利用できます。',
    links: [
      ['ai-sticker-maker', 'AIスタンプメーカー'],
      ['photo-to-sticker', '写真からスタンプ作成'],
      ['sticker-sheet-splitter', '15個スタンプ自動分割'],
      ['transparent-png-maker', '透過PNG作成'],
      ['image-upscaler', '画像高画質化'],
      ['background-remover', '背景削除ツール']
    ]
  },
  zh: {
    prefix: 'zh',
    title: 'Prompt Maker 免费工具',
    desc: '从AI表情包制作、照片转贴纸，到去背景、15张自动分割、透明PNG和高清放大，一站完成。',
    links: [
      ['ai-sticker-maker', 'AI表情包生成器'],
      ['photo-to-sticker', '照片转表情包'],
      ['sticker-sheet-splitter', '15张表情自动分割'],
      ['transparent-png-maker', '透明PNG制作'],
      ['image-upscaler', '图片高清放大'],
      ['background-remover', '背景移除工具']
    ]
  }
};

const pageTargets = [
  ['ko', 'index.html'],
  ['en', 'en/index.html'],
  ['ja', 'ja/index.html'],
  ['zh', 'zh/index.html'],
  ['ko', 'background-remover/index.html'],
  ['en', 'en/background-remover/index.html'],
  ['ja', 'ja/background-remover/index.html'],
  ['zh', 'zh/background-remover/index.html']
];

const hrefFor = (locale, slug) => {
  const prefix = locale.prefix ? `/${locale.prefix}` : '';
  return `${prefix}/${slug}/`;
};

const blockFor = (locale) => {
  const links = locale.links.map(([slug, label]) => (
    `<a href="${hrefFor(locale, slug)}" style="display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:8px 12px;border:1px solid #e7d7b7;border-radius:10px;background:#fffaf0;color:#6f512e;font-size:12px;font-weight:800;text-decoration:none;line-height:1.35">${label}</a>`
  )).join('');

  return `\n<section id="prompt-maker-tool-links" aria-label="${locale.title}" style="max-width:896px;margin:18px auto 28px;padding:0 16px;font-family:inherit;color:#403a33">\n  <div style="border:1px solid #eadfce;border-radius:16px;background:#fffdf8;padding:16px;box-shadow:0 2px 8px rgba(80,60,30,.04)">\n    <div style="font-size:14px;font-weight:900;margin-bottom:4px">🧰 ${locale.title}</div>\n    <p style="margin:0 0 12px;font-size:12px;line-height:1.6;color:#766d63;font-weight:600">${locale.desc}</p>\n    <nav style="display:flex;flex-wrap:wrap;gap:7px">${links}</nav>\n  </div>\n</section>\n`;
};

for (const [code, relativePath] of pageTargets) {
  const filePath = path.join(distDir, relativePath);
  if (!fs.existsSync(filePath)) {
    console.warn(`[internal-links] skipped missing ${relativePath}`);
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('id="prompt-maker-tool-links"')) continue;
  if (!html.includes('</body>')) throw new Error(`[internal-links] </body> missing in ${relativePath}`);

  html = html.replace('</body>', `${blockFor(locales[code])}</body>`);
  fs.writeFileSync(filePath, html, 'utf8');
}

console.log('Localized internal tool links added to main and background-remover pages');
