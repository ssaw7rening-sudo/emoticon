import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const sourcePath = path.join(distDir, 'index.html');
if (!fs.existsSync(sourcePath)) throw new Error('dist/index.html not found');
const source = fs.readFileSync(sourcePath, 'utf8');

const origin = 'https://emoticonpromptmaker.com';

const mainPages = {
  ko: {
    htmlLang: 'ko',
    dir: '',
    canonical: `${origin}/`,
    ogLocale: 'ko_KR',
    title: '프롬프트 메이커 | AI 카카오톡 이모티콘 프롬프트 생성기',
    description: '사진이나 캐릭터 설정으로 ChatGPT·Gemini·Grok용 15종 카카오톡 이모티콘 프롬프트를 만들고, 배경 제거·자동 분할·투명 PNG 저장까지 지원하는 무료 도구입니다.',
    keywords: 'AI 이모티콘 만들기, 이모티콘 제작, AI 스티커 만들기, 카카오톡 이모티콘, 이모티콘 프롬프트, 프롬프트 메이커, 사진 이모티콘, 15종 이모티콘, AI 캐릭터 만들기',
    schemaName: '프롬프트 메이커',
    schemaDescription: '사진이나 캐릭터 설정으로 ChatGPT·Gemini·Grok용 15종 카카오톡 이모티콘 프롬프트를 만들고, 배경 제거·자동 분할·투명 PNG 저장까지 지원하는 무료 도구입니다.',
    features: ['AI 이모티콘 프롬프트 생성', '사진 기반 캐릭터 프롬프트', '15종 이모티콘 시트 제작 지원', '이미지 배경 제거', '투명 PNG 저장', '15개 이모티콘 자동 분리', '360·720·1440px 변환', 'ZIP 일괄 저장']
  },
  en: {
    htmlLang: 'en',
    dir: 'en',
    canonical: `${origin}/en/`,
    ogLocale: 'en_US',
    title: 'Prompt Maker | AI Messenger Sticker Prompt Generator',
    description: 'Create 15 AI sticker prompts for ChatGPT, Gemini and Grok from photos or character settings, then remove backgrounds, auto-split sheets, and export transparent PNGs for WhatsApp, Telegram and other messengers.',
    keywords: 'AI sticker maker, AI messenger sticker prompt generator, WhatsApp sticker maker, Telegram sticker maker, photo to sticker, AI sticker prompts, sticker sheet maker, transparent PNG, background remover',
    schemaName: 'Prompt Maker',
    schemaDescription: 'Create 15 AI sticker prompts for ChatGPT, Gemini and Grok from photos or character settings, then remove backgrounds, auto-split sheets, and export transparent PNGs for WhatsApp, Telegram and other messengers.',
    features: ['AI sticker and emoticon prompt generation', 'Photo-based character prompts', '15-sticker sheet workflow', 'Background removal', 'Transparent PNG export', '15-sticker auto split', '360px, 720px and 1440px export', 'ZIP batch download']
  },
  ja: {
    htmlLang: 'ja',
    dir: 'ja',
    canonical: `${origin}/ja/`,
    ogLocale: 'ja_JP',
    title: 'Prompt Maker | AIメッセージスタンプ用プロンプト生成',
    description: '写真やキャラクター設定からChatGPT・Gemini・Grok向けの15種スタンプ用プロンプトを作成し、背景透過・自動分割・透過PNG保存まで対応。LINEなどのメッセージスタンプ制作に活用できます。',
    keywords: 'AIスタンプ作成, AIスタンプメーカー, LINEスタンプ作成, 絵文字メーカー, 写真からスタンプ, スタンプシート, 背景透過, 透過PNG, AIプロンプト',
    schemaName: 'Prompt Maker - AIスタンププロンプトメーカー',
    schemaDescription: '写真やキャラクター設定からChatGPT・Gemini・Grok向けの15種スタンプ用プロンプトを作成し、背景透過・自動分割・透過PNG保存まで対応。LINEなどのメッセージスタンプ制作に活用できます。',
    features: ['AIスタンププロンプト生成', '写真ベースのキャラクター設定', '15個スタンプシート対応', '背景削除・透過', '透過PNG保存', '15個自動分割', '360・720・1440px出力', 'ZIP一括保存']
  },
  zh: {
    htmlLang: 'zh-CN',
    dir: 'zh',
    canonical: `${origin}/zh/`,
    ogLocale: 'zh_CN',
    title: 'Prompt Maker | AI聊天表情包提示词生成器',
    description: '根据照片或角色设置，为ChatGPT、Gemini和Grok生成15款AI表情包提示词，并支持去背景、自动分割和透明PNG导出，适用于微信等聊天平台。',
    keywords: 'AI表情包生成器, AI聊天表情包提示词生成器, 微信表情包, 表情包制作, 照片转贴纸, AI提示词, 图片去背景, 透明PNG, 表情包分割',
    schemaName: 'Prompt Maker AI表情包提示词生成器',
    schemaDescription: '根据照片或角色设置，为ChatGPT、Gemini和Grok生成15款AI表情包提示词，并支持去背景、自动分割和透明PNG导出，适用于微信等聊天平台。',
    features: ['AI表情包提示词生成', '照片角色提示词', '15张表情包工作流', '图片背景移除', '透明PNG导出', '15张自动分割', '360/720/1440px导出', 'ZIP批量保存']
  }
};

const removerPages = {
  ko: {
    htmlLang: 'ko', dir: 'background-remover', canonical: `${origin}/background-remover/`, ogLocale: 'ko_KR',
    title: '무료 이미지 배경 제거 | 누끼 따기 · 투명 PNG · 업스케일',
    description: '사진·이미지 배경을 무료로 제거하고 투명 PNG로 저장하세요. 15개 이모티콘 자동 분리와 360·720·1440px 저장, ZIP 일괄 저장을 지원하며 이미지는 브라우저에서 처리합니다.',
    keywords: '배경 제거, 이미지 배경 제거, 사진 배경 제거, 누끼 따기, 무료 누끼 따기, 투명 PNG, PNG 배경 제거, 이모티콘 배경 제거, 이모티콘 분리, 이미지 업스케일',
    schemaName: '무료 이미지 배경 제거 · 이모티콘 분리',
    schemaDescription: '브라우저에서 이미지 배경을 제거해 투명 PNG로 저장하고 15개 이모티콘 시트 자동 분리와 고해상도 변환을 지원하는 무료 도구입니다.',
    features: ['이미지 배경 제거', '투명 PNG 저장', '정밀 배경 제거', '15개 이모티콘 자동 분리', '360px PNG 저장', '720px 2배 변환', '1440px 4배 변환', 'ZIP 일괄 저장']
  },
  en: {
    htmlLang: 'en', dir: 'en/background-remover', canonical: `${origin}/en/background-remover/`, ogLocale: 'en_US',
    title: 'Free Background Remover | Transparent PNG & Image Upscaler',
    description: 'Remove image backgrounds for free in your browser, export transparent PNGs, auto-split 15-sticker sheets, and export at 360px, 720px or 1440px with ZIP batch download.',
    keywords: 'background remover, remove image background, free background remover, transparent PNG, photo background remover, sticker background remover, sticker sheet splitter, image upscaler, PNG export',
    schemaName: 'Free Background Remover & Sticker Sheet Splitter',
    schemaDescription: 'A free browser-based tool to remove image backgrounds, export transparent PNGs, split 15-sticker sheets and create higher-resolution sticker files.',
    features: ['Image background removal', 'Transparent PNG export', 'Precision background removal', '15-sticker auto split', '360px PNG export', '720px 2x export', '1440px 4x export', 'ZIP batch export']
  },
  ja: {
    htmlLang: 'ja', dir: 'ja/background-remover', canonical: `${origin}/ja/background-remover/`, ogLocale: 'ja_JP',
    title: '無料の画像背景削除 | 透過PNG・高画質アップスケール',
    description: '写真や画像の背景を無料で削除して透過PNGとして保存。15個スタンプシートの自動分割、360・720・1440px出力、ZIP一括保存にも対応します。',
    keywords: '背景削除, 画像背景削除, 背景透過, 透過PNG, 無料背景削除, スタンプ背景削除, スタンプ分割, 画像アップスケール, PNG保存',
    schemaName: '無料画像背景削除・スタンプ自動分割',
    schemaDescription: 'ブラウザ内で画像背景を透過し、15個のスタンプシートを自動分割して透過PNGとして保存できる無料ツールです。',
    features: ['画像背景削除', '透過PNG保存', '精密背景削除', '15個スタンプ自動分割', '360px保存', '720px 2倍出力', '1440px 4倍出力', 'ZIP一括保存']
  },
  zh: {
    htmlLang: 'zh-CN', dir: 'zh/background-remover', canonical: `${origin}/zh/background-remover/`, ogLocale: 'zh_CN',
    title: '免费图片背景移除 | 透明PNG・高清图片放大',
    description: '免费移除图片背景并导出透明PNG，支持15张表情包自动分割、360/720/1440px输出和ZIP批量保存，图片在浏览器中处理。',
    keywords: '背景移除, 图片背景移除, 免费抠图, 透明PNG, 表情包背景移除, 表情包分割, 图片放大, PNG导出, AI抠图',
    schemaName: '免费图片背景移除与表情包分割工具',
    schemaDescription: '在浏览器中移除图片背景、导出透明PNG，并自动分割15张表情包及生成高清版本的免费工具。',
    features: ['图片背景移除', '透明PNG导出', '精细背景移除', '15张表情自动分割', '360px导出', '720px 2倍导出', '1440px 4倍导出', 'ZIP批量保存']
  }
};

const mainAlternates = {
  ko: `${origin}/`, en: `${origin}/en/`, ja: `${origin}/ja/`, zh: `${origin}/zh/`, default: `${origin}/`
};
const removerAlternates = {
  ko: `${origin}/background-remover/`, en: `${origin}/en/background-remover/`, ja: `${origin}/ja/background-remover/`, zh: `${origin}/zh/background-remover/`, default: `${origin}/background-remover/`
};

const replaceRequired = (html, regex, replacement, label) => {
  if (!regex.test(html)) throw new Error(`Missing ${label}`);
  return html.replace(regex, replacement);
};

const escapeAttr = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

function localizedSchema(page, { remover = false } = {}) {
  const webApp = {
    '@type': 'WebApplication',
    '@id': `${page.canonical}#webapp`,
    url: page.canonical,
    name: page.schemaName,
    description: page.schemaDescription,
    applicationCategory: remover ? 'UtilitiesApplication' : 'DesignApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript',
    isAccessibleForFree: true,
    inLanguage: page.htmlLang,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: page.features
  };

  const graph = remover
    ? [webApp]
    : [
        {
          '@type': 'WebSite',
          '@id': `${origin}/#website`,
          url: `${origin}/`,
          name: 'Prompt Maker',
          inLanguage: ['ko', 'en', 'ja', 'zh-CN']
        },
        webApp
      ];

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

function buildHtml(page, alternates, { remover = false } = {}) {
  let html = source;
  html = replaceRequired(html, /<html lang="[^"]+">/, `<html lang="${page.htmlLang}">`, 'html lang');
  html = replaceRequired(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(page.title)}</title>`, 'title');
  html = replaceRequired(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeAttr(page.description)}" />`, 'description');
  html = replaceRequired(html, /<meta name="keywords" content="[^"]*" \/>/, `<meta name="keywords" content="${escapeAttr(page.keywords)}" />`, 'keywords');
  html = replaceRequired(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${page.canonical}" />`, 'canonical');
  html = replaceRequired(html, /<link rel="alternate" hreflang="ko" href="[^"]*" \/>/, `<link rel="alternate" hreflang="ko" href="${alternates.ko}" />`, 'hreflang ko');
  html = replaceRequired(html, /<link rel="alternate" hreflang="en" href="[^"]*" \/>/, `<link rel="alternate" hreflang="en" href="${alternates.en}" />`, 'hreflang en');
  html = replaceRequired(html, /<link rel="alternate" hreflang="ja" href="[^"]*" \/>/, `<link rel="alternate" hreflang="ja" href="${alternates.ja}" />`, 'hreflang ja');
  html = replaceRequired(html, /<link rel="alternate" hreflang="zh(?:-CN)?" href="[^"]*" \/>/, `<link rel="alternate" hreflang="zh-CN" href="${alternates.zh}" />`, 'hreflang zh');
  html = replaceRequired(html, /<link rel="alternate" hreflang="x-default" href="[^"]*" \/>/, `<link rel="alternate" hreflang="x-default" href="${alternates.default}" />`, 'hreflang default');
  html = replaceRequired(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${page.canonical}" />`, 'og:url');
  html = replaceRequired(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeAttr(page.title)}" />`, 'og:title');
  html = replaceRequired(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeAttr(page.description)}" />`, 'og:description');
  html = replaceRequired(html, /<meta property="og:locale" content="[^"]*" \/>/, `<meta property="og:locale" content="${page.ogLocale}" />`, 'og:locale');
  html = replaceRequired(html, /<meta property="og:site_name" content="[^"]*" \/>/, '<meta property="og:site_name" content="Prompt Maker" />', 'og:site_name');
  html = replaceRequired(html, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapeAttr(page.title)}" />`, 'twitter:title');
  html = replaceRequired(html, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${escapeAttr(page.description)}" />`, 'twitter:description');

  // Remove source-page structured data so localized pages never inherit Korean-only schema.
  html = html.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');

  if (!/<meta name="robots"/.test(html)) {
    html = replaceRequired(
      html,
      /<meta name="viewport"[^>]*\/>/,
      (match) => `${match}\n    <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />`,
      'viewport for robots insertion'
    );
  }

  const schema = `\n    <script type="application/ld+json">${localizedSchema(page, { remover })}</script>\n`;
  html = replaceRequired(html, /<\/head>/, `${schema}  </head>`, 'head close');
  return html;
}

// Rewrite the root HTML itself with Korean-localized SEO and schema.
fs.writeFileSync(sourcePath, buildHtml(mainPages.ko, mainAlternates), 'utf8');

// Generate only the actual alternate locale URLs. Korean canonical stays at /, not /ko/.
for (const lang of ['en', 'ja', 'zh']) {
  const page = mainPages[lang];
  const outDir = path.join(distDir, page.dir);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), buildHtml(page, mainAlternates), 'utf8');
}

for (const page of Object.values(removerPages)) {
  const outDir = path.join(distDir, page.dir);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), buildHtml(page, removerAlternates, { remover: true }), 'utf8');
}

console.log('Localized SEO pages generated for /, /en/, /ja/, /zh/ and all background-remover variants');
