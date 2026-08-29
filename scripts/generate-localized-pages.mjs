import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const sourcePath = path.join(distDir, 'index.html');
if (!fs.existsSync(sourcePath)) throw new Error('dist/index.html not found');
const source = fs.readFileSync(sourcePath, 'utf8');

const origin = 'https://emoticon-beige.vercel.app';

const mainPages = {
  ko: { htmlLang: 'ko', dir: 'ko', canonical: `${origin}/`, ogLocale: 'ko_KR', title: '프롬프트 메이커 | AI 카카오톡 이모티콘 프롬프트 생성기 (ChatGPT · Gemini · Grok)', description: '사진 한 장이나 캐릭터 태그 선택으로 ChatGPT, Gemini, Grok 전용 15종 메신저 이모티콘 프롬프트를 만드는 무료 AI 프롬프트 메이커입니다.' },
  en: { htmlLang: 'en', dir: 'en', canonical: `${origin}/en/`, ogLocale: 'en_US', title: 'Prompt Maker | AI Emoticon Prompt Generator (ChatGPT · Gemini · Grok)', description: 'Create 15-expression AI messenger emoticon prompts from a photo or character tags for ChatGPT, Gemini and Grok. Free prompt maker with multiple art styles and themes.' },
  ja: { htmlLang: 'ja', dir: 'ja', canonical: `${origin}/ja/`, ogLocale: 'ja_JP', title: 'プロンプトメーカー | AI絵文字プロンプト生成ツール (ChatGPT・Gemini・Grok)', description: '写真やキャラクタータグからChatGPT・Gemini・Grok向けの15種類のメッセンジャー絵文字プロンプトを作成できる無料AIプロンプトメーカーです。' },
  zh: { htmlLang: 'zh-CN', dir: 'zh', canonical: `${origin}/zh/`, ogLocale: 'zh_CN', title: '提示词生成器 | AI表情包提示词工具 (ChatGPT · Gemini · Grok)', description: '通过照片或角色标签，为ChatGPT、Gemini和Grok生成15种聊天表情包提示词。支持多种画风与主题的免费AI提示词工具。' }
};

const removerPages = {
  ko: { htmlLang: 'ko', dir: 'background-remover', canonical: `${origin}/background-remover/`, ogLocale: 'ko_KR', title: '무료 이미지 배경 제거 | 누끼 따기 · 투명 PNG 만들기', description: '사진·이미지 배경을 무료로 제거하고 투명 PNG로 저장하세요. 흰색뿐 아니라 균일한 단색 배경은 빠르게 처리하며, 복잡한 배경은 AI로 자동 제거합니다. 이미지 파일은 서버에 업로드하지 않고 브라우저에서 처리합니다.', keywords: '배경 제거, 이미지 배경 제거, 사진 배경 제거, 누끼 따기, 무료 누끼 따기, 투명 PNG, PNG 배경 제거, 무료 배경 제거, 이모티콘 배경 제거' },
  en: { htmlLang: 'en', dir: 'en/background-remover', canonical: `${origin}/en/background-remover/`, ogLocale: 'en_US', title: 'Free Image Background Remover | Transparent PNG Maker', description: 'Remove image and photo backgrounds for free in your browser. Fast solid-color background removal, AI processing for complex scenes, and transparent PNG export without uploading images to our server.', keywords: 'background remover, remove image background, free background remover, transparent PNG, photo background remover, PNG background remover' },
  ja: { htmlLang: 'ja', dir: 'ja/background-remover', canonical: `${origin}/ja/background-remover/`, ogLocale: 'ja_JP', title: '無料画像背景削除 | 透過PNG・背景透過ツール', description: '写真や画像の背景を無料で削除し、透過PNGとして保存できます。均一な単色背景は高速処理、複雑な背景はAIで自動処理。画像はサーバーへアップロードせずブラウザ内で処理します。', keywords: '背景削除, 画像背景削除, 背景透過, 透過PNG, 無料背景削除, 写真背景削除, PNG背景透過' },
  zh: { htmlLang: 'zh-CN', dir: 'zh/background-remover', canonical: `${origin}/zh/background-remover/`, ogLocale: 'zh_CN', title: '免费图片背景移除 | 透明PNG制作工具', description: '免费移除照片和图片背景并保存为透明PNG。均匀纯色背景快速处理，复杂背景自动使用AI；图片在浏览器中处理，不上传到本站服务器。', keywords: '背景移除, 图片背景移除, 免费抠图, 透明PNG, 照片背景移除, PNG背景透明, AI抠图' }
};

const mainAlternates = {
  ko: `${origin}/`,
  en: `${origin}/en/`,
  ja: `${origin}/ja/`,
  zh: `${origin}/zh/`,
  default: `${origin}/`
};

const removerAlternates = {
  ko: `${origin}/background-remover/`,
  en: `${origin}/en/background-remover/`,
  ja: `${origin}/ja/background-remover/`,
  zh: `${origin}/zh/background-remover/`,
  default: `${origin}/background-remover/`
};

const replaceRequired = (html, regex, replacement, label) => {
  if (!regex.test(html)) throw new Error(`Missing ${label}`);
  return html.replace(regex, replacement);
};

function buildHtml(page, alternates, { remover = false } = {}) {
  let html = source;
  html = replaceRequired(html, /<html lang="[^"]+">/, `<html lang="${page.htmlLang}">`, 'html lang');
  html = replaceRequired(html, /<title>[\s\S]*?<\/title>/, `<title>${page.title}</title>`, 'title');
  html = replaceRequired(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${page.description}" />`, 'description');
  if (page.keywords) html = replaceRequired(html, /<meta name="keywords" content="[^"]*" \/>/, `<meta name="keywords" content="${page.keywords}" />`, 'keywords');
  html = replaceRequired(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${page.canonical}" />`, 'canonical');
  html = replaceRequired(html, /<link rel="alternate" hreflang="ko" href="[^"]*" \/>/, `<link rel="alternate" hreflang="ko" href="${alternates.ko}" />`, 'hreflang ko');
  html = replaceRequired(html, /<link rel="alternate" hreflang="en" href="[^"]*" \/>/, `<link rel="alternate" hreflang="en" href="${alternates.en}" />`, 'hreflang en');
  html = replaceRequired(html, /<link rel="alternate" hreflang="ja" href="[^"]*" \/>/, `<link rel="alternate" hreflang="ja" href="${alternates.ja}" />`, 'hreflang ja');
  html = replaceRequired(html, /<link rel="alternate" hreflang="zh(?:-CN)?" href="[^"]*" \/>/, `<link rel="alternate" hreflang="zh-CN" href="${alternates.zh}" />`, 'hreflang zh');
  html = replaceRequired(html, /<link rel="alternate" hreflang="x-default" href="[^"]*" \/>/, `<link rel="alternate" hreflang="x-default" href="${alternates.default}" />`, 'hreflang default');
  html = replaceRequired(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${page.canonical}" />`, 'og:url');
  html = replaceRequired(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${page.title}" />`, 'og:title');
  html = replaceRequired(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${page.description}" />`, 'og:description');
  html = replaceRequired(html, /<meta property="og:locale" content="[^"]*" \/>/, `<meta property="og:locale" content="${page.ogLocale}" />`, 'og:locale');
  html = replaceRequired(html, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${page.title}" />`, 'twitter:title');
  html = replaceRequired(html, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${page.description}" />`, 'twitter:description');

  if (remover) {
    const jsonLd = `\n    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: page.title,
      url: page.canonical,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'All',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: ['Image background removal', 'Transparent PNG export', 'Solid-color fast removal', 'AI background removal', '15-emoticon auto split', '360x360 PNG export'],
      inLanguage: page.htmlLang
    })}</script>\n`;
    html = replaceRequired(html, /<\/head>/, `${jsonLd}  </head>`, 'head close');
  }
  return html;
}

for (const page of Object.values(mainPages)) {
  const outDir = path.join(distDir, page.dir);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), buildHtml(page, mainAlternates), 'utf8');
}

for (const page of Object.values(removerPages)) {
  const outDir = path.join(distDir, page.dir);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), buildHtml(page, removerAlternates, { remover: true }), 'utf8');
}

console.log('Localized SEO pages generated: /ko/, /en/, /ja/, /zh/ and background-remover variants');
