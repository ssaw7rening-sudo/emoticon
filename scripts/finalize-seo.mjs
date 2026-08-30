import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const origin = 'https://emoticon-beige.vercel.app';

const locales = {
  ko: {
    prefix: '',
    htmlLang: 'ko',
    home: '/',
    homeName: 'Prompt Maker',
    main: {
      title: '프롬프트 메이커 | AI 이모티콘·스티커 만들기, 배경 제거·15개 분리',
      description: '사진·캐릭터 설정으로 ChatGPT, Gemini, Grok용 15종 이모티콘 프롬프트를 만들고, 배경 제거·정밀 재처리·15개 자동 분리·360/720/1440px PNG·ZIP 저장까지 한 번에 이용하세요.',
      keywords: 'AI 이모티콘 만들기, AI 스티커 메이커, 사진 이모티콘, 카카오톡 이모티콘, 배경 제거, 정밀 누끼, 15개 이모티콘 분리, 투명 PNG, 이미지 업스케일, ZIP 저장'
    },
    removerName: '배경 제거·이모티콘 분리',
    remover: {
      title: '무료 이미지 배경 제거 | 정밀 누끼·15개 분리·투명 PNG',
      description: '이미지 배경을 브라우저에서 무료로 제거하고 정밀 재처리로 외곽선을 다듬으세요. 15개 이모티콘 자동 분리, 360/720/1440px 변환, 투명 PNG·ZIP 저장까지 지원합니다.'
    }
  },
  en: {
    prefix: 'en',
    htmlLang: 'en',
    home: '/en/',
    homeName: 'Prompt Maker',
    main: {
      title: 'Prompt Maker | AI Sticker Maker, Background Remover & Sheet Splitter',
      description: 'Create 15-sticker prompts for ChatGPT, Gemini and Grok from photos or character settings, then remove backgrounds, auto-split sticker sheets, export transparent PNGs at 360/720/1440px, and download ZIP files.',
      keywords: 'AI sticker maker, AI emoji maker, photo to sticker, background remover, transparent PNG maker, sticker sheet splitter, 15 sticker splitter, image upscaler, ZIP export'
    },
    removerName: 'Background Remover & Sticker Splitter',
    remover: {
      title: 'Free Background Remover | Precision Cutout, Sticker Splitter & PNG Export',
      description: 'Remove image backgrounds in your browser, refine difficult edges, auto-split 15-sticker sheets, export transparent PNGs at 360/720/1440px, and batch-download ZIP files.'
    }
  },
  ja: {
    prefix: 'ja',
    htmlLang: 'ja',
    home: '/ja/',
    homeName: 'Prompt Maker',
    main: {
      title: 'Prompt Maker | AIスタンプ作成・背景透過・15個自動分割',
      description: '写真やキャラクター設定からChatGPT・Gemini・Grok向け15種類のAIスタンププロンプトを作成し、背景透過・精密再処理・15個自動分割・360/720/1440px PNG・ZIP保存まで一括で利用できます。',
      keywords: 'AIスタンプ作成, AIスタンプメーカー, 写真からスタンプ, LINEスタンプ作成, 背景透過, 精密切り抜き, 15個スタンプ分割, 透過PNG, 画像高画質化, ZIP保存'
    },
    removerName: '背景削除・スタンプ分割',
    remover: {
      title: '無料画像背景削除 | 精密切り抜き・15個分割・透過PNG',
      description: 'ブラウザで画像背景を無料削除し、精密再処理で輪郭を調整。15個スタンプの自動分割、360/720/1440px変換、透過PNG・ZIP一括保存まで対応します。'
    }
  },
  zh: {
    prefix: 'zh',
    htmlLang: 'zh-CN',
    home: '/zh/',
    homeName: 'Prompt Maker',
    main: {
      title: 'Prompt Maker | AI表情包生成・去背景・15张自动分割',
      description: '根据照片或角色设置生成适用于ChatGPT、Gemini和Grok的15张AI表情包提示词，并完成去背景、精细处理、15张自动分割、360/720/1440px透明PNG与ZIP批量导出。',
      keywords: 'AI表情包生成器, AI贴纸生成器, 照片转表情包, 图片去背景, 精细抠图, 15张表情分割, 透明PNG, 图片放大, ZIP批量导出'
    },
    removerName: '背景移除与表情包分割',
    remover: {
      title: '免费图片背景移除 | 精细抠图・15张分割・透明PNG',
      description: '在浏览器中免费移除图片背景并精细处理复杂边缘，支持15张表情自动分割、360/720/1440px输出、透明PNG及ZIP批量保存。'
    }
  }
};

const features = {
  'ai-sticker-maker': {
    ko: 'AI 이모티콘·스티커 메이커', en: 'AI Sticker Maker', ja: 'AIスタンプメーカー', zh: 'AI表情包生成器'
  },
  'photo-to-sticker': {
    ko: '사진으로 이모티콘 만들기', en: 'Photo to Sticker', ja: '写真からスタンプ作成', zh: '照片转表情包'
  },
  'sticker-sheet-splitter': {
    ko: '15개 이모티콘 시트 자동 분리', en: 'Sticker Sheet Splitter', ja: '15個スタンプ自動分割', zh: '15张表情自动分割'
  },
  'transparent-png-maker': {
    ko: '투명 PNG 만들기', en: 'Transparent PNG Maker', ja: '透過PNG作成', zh: '透明PNG制作'
  },
  'image-upscaler': {
    ko: '이미지 360·720·1440px 변환', en: 'Sticker Image Upscaler', ja: 'スタンプ画像高画質化', zh: '表情包高清放大'
  }
};

const relativePath = (lang, slug = '') => {
  const prefix = locales[lang].prefix;
  return path.join(...(prefix ? [prefix] : []), ...(slug ? [slug] : []), 'index.html');
};

const absoluteUrl = (lang, slug = '') => {
  const prefix = locales[lang].prefix ? `/${locales[lang].prefix}` : '';
  return `${origin}${prefix}/${slug ? `${slug}/` : ''}`;
};

const replaceRequired = (html, regex, replacement, label, filePath) => {
  if (!regex.test(html)) throw new Error(`[finalize-seo] Missing ${label} in ${filePath}`);
  return html.replace(regex, replacement);
};

const setMeta = (html, { title, description, keywords }, filePath) => {
  html = replaceRequired(html, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`, 'title', filePath);
  html = replaceRequired(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${description}" />`, 'description', filePath);
  if (keywords) {
    html = replaceRequired(html, /<meta name="keywords" content="[^"]*" \/>/, `<meta name="keywords" content="${keywords}" />`, 'keywords', filePath);
  }
  html = replaceRequired(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${title}" />`, 'og:title', filePath);
  html = replaceRequired(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${description}" />`, 'og:description', filePath);
  html = replaceRequired(html, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${title}" />`, 'twitter:title', filePath);
  html = replaceRequired(html, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${description}" />`, 'twitter:description', filePath);
  return html;
};

const injectBreadcrumb = (html, canonical, homeUrl, homeName, currentName) => {
  if (html.includes(`${canonical}#breadcrumb`)) return html;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonical}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: homeName, item: homeUrl },
      { '@type': 'ListItem', position: 2, name: currentName, item: canonical }
    ]
  };
  return html.replace('</head>', `    <script type="application/ld+json">${JSON.stringify(schema)}</script>\n  </head>`);
};

for (const [lang, locale] of Object.entries(locales)) {
  const mainFile = path.join(distDir, relativePath(lang));
  if (!fs.existsSync(mainFile)) throw new Error(`[finalize-seo] Missing ${mainFile}`);
  let mainHtml = fs.readFileSync(mainFile, 'utf8');
  mainHtml = setMeta(mainHtml, locale.main, mainFile);
  fs.writeFileSync(mainFile, mainHtml, 'utf8');

  const removerFile = path.join(distDir, relativePath(lang, 'background-remover'));
  if (!fs.existsSync(removerFile)) throw new Error(`[finalize-seo] Missing ${removerFile}`);
  let removerHtml = fs.readFileSync(removerFile, 'utf8');
  removerHtml = setMeta(removerHtml, locale.remover, removerFile);
  removerHtml = injectBreadcrumb(
    removerHtml,
    absoluteUrl(lang, 'background-remover'),
    `${origin}${locale.home}`,
    locale.homeName,
    locale.removerName
  );
  fs.writeFileSync(removerFile, removerHtml, 'utf8');

  for (const [slug, names] of Object.entries(features)) {
    const featureFile = path.join(distDir, relativePath(lang, slug));
    if (!fs.existsSync(featureFile)) throw new Error(`[finalize-seo] Missing ${featureFile}`);
    let featureHtml = fs.readFileSync(featureFile, 'utf8');
    featureHtml = injectBreadcrumb(
      featureHtml,
      absoluteUrl(lang, slug),
      `${origin}${locale.home}`,
      locale.homeName,
      names[lang]
    );
    fs.writeFileSync(featureFile, featureHtml, 'utf8');
  }
}

const notFoundHtml = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>404 | Prompt Maker</title>
  <style>
    *{box-sizing:border-box}body{margin:0;background:#fffaf0;color:#39332d;font-family:Arial,"Noto Sans KR",sans-serif}.wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}.card{width:min(620px,100%);padding:38px 28px;border:1px solid #eadfcf;border-radius:24px;background:#fff;box-shadow:0 14px 45px rgba(96,68,28,.08);text-align:center}.code{font-size:64px;font-weight:900;color:#c9932e;letter-spacing:-.04em}.card h1{margin:8px 0 10px;font-size:25px}.card p{margin:0 auto 22px;max-width:480px;color:#74695d;line-height:1.65}.links{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}.links a{padding:10px 13px;border:1px solid #e5c875;border-radius:12px;background:#fff6d9;color:#704b17;font-weight:800;text-decoration:none}
  </style>
</head>
<body>
  <main class="wrap"><section class="card">
    <div class="code">404</div>
    <h1>페이지를 찾을 수 없습니다</h1>
    <p>주소가 변경되었거나 존재하지 않는 페이지입니다. Prompt Maker의 언어별 홈으로 이동해 주세요.</p>
    <nav class="links" aria-label="Prompt Maker language home links">
      <a href="/">한국어</a><a href="/en/">English</a><a href="/ja/">日本語</a><a href="/zh/">中文</a>
    </nav>
  </section></main>
</body>
</html>`;
fs.writeFileSync(path.join(distDir, '404.html'), notFoundHtml, 'utf8');

const sitemapPath = path.join(distDir, 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) throw new Error('[finalize-seo] sitemap.xml missing');
const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const expectedUrls = [];
for (const lang of Object.keys(locales)) {
  expectedUrls.push(absoluteUrl(lang));
  expectedUrls.push(absoluteUrl(lang, 'background-remover'));
  for (const slug of Object.keys(features)) expectedUrls.push(absoluteUrl(lang, slug));
}
const missingUrls = expectedUrls.filter((url) => !sitemap.includes(`<loc>${url}</loc>`));
if (missingUrls.length) throw new Error(`[finalize-seo] sitemap missing URLs: ${missingUrls.join(', ')}`);

console.log(`SEO finalized: ${expectedUrls.length} indexed pages checked, BreadcrumbList added, custom noindex 404 created`);
