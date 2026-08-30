import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const origin = 'https://emoticon-beige.vercel.app';

const locales = {
  ko: { prefix: '', labels: {
    main: 'Prompt Maker AI 이모티콘 제작 도구',
    'background-remover': 'Prompt Maker 배경 제거 도구',
    'ai-sticker-maker': 'Prompt Maker AI 이모티콘·스티커 메이커',
    'photo-to-sticker': 'Prompt Maker 사진으로 이모티콘 만들기',
    'sticker-sheet-splitter': 'Prompt Maker 15개 이모티콘 시트 자동 분리',
    'transparent-png-maker': 'Prompt Maker 투명 PNG 만들기',
    'image-upscaler': 'Prompt Maker 이미지 업스케일'
  }},
  en: { prefix: 'en', labels: {
    main: 'Prompt Maker AI Sticker Toolkit',
    'background-remover': 'Prompt Maker Background Remover',
    'ai-sticker-maker': 'Prompt Maker AI Sticker Maker',
    'photo-to-sticker': 'Prompt Maker Photo to Sticker',
    'sticker-sheet-splitter': 'Prompt Maker 15 Sticker Sheet Splitter',
    'transparent-png-maker': 'Prompt Maker Transparent PNG Maker',
    'image-upscaler': 'Prompt Maker Image Upscaler'
  }},
  ja: { prefix: 'ja', labels: {
    main: 'Prompt Maker AIスタンプ制作ツール',
    'background-remover': 'Prompt Maker 背景削除ツール',
    'ai-sticker-maker': 'Prompt Maker AIスタンプメーカー',
    'photo-to-sticker': 'Prompt Maker 写真からスタンプ作成',
    'sticker-sheet-splitter': 'Prompt Maker 15個スタンプ自動分割',
    'transparent-png-maker': 'Prompt Maker 透過PNG作成',
    'image-upscaler': 'Prompt Maker 画像高画質化'
  }},
  zh: { prefix: 'zh', labels: {
    main: 'Prompt Maker AI表情包制作工具',
    'background-remover': 'Prompt Maker 背景移除工具',
    'ai-sticker-maker': 'Prompt Maker AI表情包生成器',
    'photo-to-sticker': 'Prompt Maker 照片转表情包',
    'sticker-sheet-splitter': 'Prompt Maker 15张表情自动分割',
    'transparent-png-maker': 'Prompt Maker 透明PNG制作',
    'image-upscaler': 'Prompt Maker 图片高清放大'
  }}
};

const targets = ['main','background-remover','ai-sticker-maker','photo-to-sticker','sticker-sheet-splitter','transparent-png-maker','image-upscaler'];

const relativeFile = (lang, key) => {
  const prefix = locales[lang].prefix;
  const segments = [];
  if (prefix) segments.push(prefix);
  if (key !== 'main') segments.push(key);
  segments.push('index.html');
  return path.join(distDir, ...segments);
};

const imageFile = (key) => key === 'main' ? 'main.png' : `${key}.png`;

const replaceOrInsert = (html, regex, replacement, anchor) => {
  if (regex.test(html)) return html.replace(regex, replacement);
  if (!html.includes(anchor)) throw new Error(`[og-images] Could not find insertion anchor ${anchor}`);
  return html.replace(anchor, `${replacement}\n    ${anchor}`);
};

for (const [lang, locale] of Object.entries(locales)) {
  for (const key of targets) {
    const filePath = relativeFile(lang, key);
    if (!fs.existsSync(filePath)) throw new Error(`[og-images] Missing ${filePath}`);

    const pngName = imageFile(key);
    const builtPng = path.join(distDir, 'og', pngName);
    if (!fs.existsSync(builtPng)) throw new Error(`[og-images] Missing generated image ${builtPng}`);

    const imageUrl = `${origin}/og/${pngName}`;
    const alt = locale.labels[key];
    let html = fs.readFileSync(filePath, 'utf8');

    html = replaceOrInsert(
      html,
      /<meta property="og:image" content="[^"]*" \/>/,
      `<meta property="og:image" content="${imageUrl}" />`,
      '<meta property="og:site_name"'
    );
    html = replaceOrInsert(
      html,
      /<meta name="twitter:image" content="[^"]*" \/>/,
      `<meta name="twitter:image" content="${imageUrl}" />`,
      '<meta name="twitter:card"'
    );

    const extras = [
      `<meta property="og:image:width" content="1200" />`,
      `<meta property="og:image:height" content="630" />`,
      `<meta property="og:image:type" content="image/png" />`,
      `<meta property="og:image:alt" content="${alt}" />`,
      `<meta name="twitter:image:alt" content="${alt}" />`
    ];

    html = html.replace(/\s*<meta property="og:image:width" content="[^"]*" \/>/g, '');
    html = html.replace(/\s*<meta property="og:image:height" content="[^"]*" \/>/g, '');
    html = html.replace(/\s*<meta property="og:image:type" content="[^"]*" \/>/g, '');
    html = html.replace(/\s*<meta property="og:image:alt" content="[^"]*" \/>/g, '');
    html = html.replace(/\s*<meta name="twitter:image:alt" content="[^"]*" \/>/g, '');
    html = html.replace(`<meta property="og:image" content="${imageUrl}" />`, `<meta property="og:image" content="${imageUrl}" />\n    ${extras.join('\n    ')}`);

    fs.writeFileSync(filePath, html, 'utf8');
  }
}

console.log(`Open Graph images applied to ${Object.keys(locales).length * targets.length} localized pages`);
