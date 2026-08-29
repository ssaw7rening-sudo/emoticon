import fs from 'node:fs';
import path from 'node:path';

const read = (p) => fs.readFileSync(p, 'utf8');
const write = (p, s) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, s, 'utf8');
};
const replaceOnce = (source, from, to, label) => {
  if (!source.includes(from)) throw new Error(`Missing pattern: ${label}`);
  return source.replace(from, to);
};

// 1) React app: URL-driven language initialization + client SEO sync + language URL updates.
{
  const appPath = 'src/App.jsx';
  let app = read(appPath);

  const oldStart = `function App() {\n  const [lang, setLang] = useState('ko');`;
  const newStart = `const APP_LOCALE_PATHS = { ko: '/', en: '/en/', ja: '/ja/', zh: '/zh/' };\nconst APP_HTML_LANGS = { ko: 'ko', en: 'en', ja: 'ja', zh: 'zh-CN' };\nconst APP_SEO_META = {\n  ko: {\n    title: '프롬프트 메이커 | AI 카카오톡 이모티콘 프롬프트 생성기 (ChatGPT · Gemini · Grok)',\n    description: '사진 한 장이나 캐릭터 태그 선택으로 ChatGPT, Gemini, Grok 전용 15종 메신저 이모티콘 프롬프트를 만드는 무료 AI 프롬프트 메이커입니다.',\n    canonical: 'https://emoticon-beige.vercel.app/'\n  },\n  en: {\n    title: 'Prompt Maker | AI Emoticon Prompt Generator (ChatGPT · Gemini · Grok)',\n    description: 'Create 15-expression AI messenger emoticon prompts from a photo or character tags for ChatGPT, Gemini and Grok. Free prompt maker with multiple art styles and themes.',\n    canonical: 'https://emoticon-beige.vercel.app/en/'\n  },\n  ja: {\n    title: 'プロンプトメーカー | AI絵文字プロンプト生成ツール (ChatGPT・Gemini・Grok)',\n    description: '写真やキャラクタータグからChatGPT・Gemini・Grok向けの15種類のメッセンジャー絵文字プロンプトを作成できる無料AIプロンプトメーカーです。',\n    canonical: 'https://emoticon-beige.vercel.app/ja/'\n  },\n  zh: {\n    title: '提示词生成器 | AI表情包提示词工具 (ChatGPT · Gemini · Grok)',\n    description: '通过照片或角色标签，为ChatGPT、Gemini和Grok生成15种聊天表情包提示词。支持多种画风与主题的免费AI提示词工具。',\n    canonical: 'https://emoticon-beige.vercel.app/zh/'\n  }\n};\n\nconst getAppLanguageFromLocation = () => {\n  if (typeof window === 'undefined') return 'ko';\n  const segment = window.location.pathname.toLowerCase().split('/').filter(Boolean)[0];\n  if (['ko', 'en', 'ja', 'zh'].includes(segment)) return segment;\n  const legacyLang = new URLSearchParams(window.location.search).get('lang');\n  if (['ko', 'en', 'ja', 'zh'].includes(legacyLang)) return legacyLang;\n  return 'ko';\n};\n\nconst syncClientSeoMeta = (lang) => {\n  if (typeof document === 'undefined') return;\n  const seo = APP_SEO_META[lang] || APP_SEO_META.ko;\n  document.documentElement.lang = APP_HTML_LANGS[lang] || 'ko';\n  document.title = seo.title;\n\n  const setContent = (selector, value) => {\n    const el = document.querySelector(selector);\n    if (el) el.setAttribute('content', value);\n  };\n  const canonical = document.querySelector('link[rel="canonical"]');\n  if (canonical) canonical.setAttribute('href', seo.canonical);\n  setContent('meta[name="description"]', seo.description);\n  setContent('meta[property="og:title"]', seo.title);\n  setContent('meta[property="og:description"]', seo.description);\n  setContent('meta[property="og:url"]', seo.canonical);\n  setContent('meta[name="twitter:title"]', seo.title);\n  setContent('meta[name="twitter:description"]', seo.description);\n};\n\nfunction App() {\n  const [lang, setLang] = useState(getAppLanguageFromLocation);\n\n  useEffect(() => {\n    syncClientSeoMeta(lang);\n  }, [lang]);\n\n  useEffect(() => {\n    if (typeof window === 'undefined') return undefined;\n\n    const legacyLang = new URLSearchParams(window.location.search).get('lang');\n    if (['ko', 'en', 'ja', 'zh'].includes(legacyLang) && window.location.pathname === '/') {\n      window.history.replaceState({ lang: legacyLang }, '', APP_LOCALE_PATHS[legacyLang]);\n    }\n\n    const handlePopState = () => {\n      setLang(getAppLanguageFromLocation());\n    };\n    window.addEventListener('popstate', handlePopState);\n    return () => window.removeEventListener('popstate', handlePopState);\n  }, []);`;
  app = replaceOnce(app, oldStart, newStart, 'App language initializer');

  const oldSetLang = `    setLang(newLang);`;
  const newSetLang = `    if (typeof window !== 'undefined') {\n      const currentPagePath = window.location.pathname.toLowerCase();\n      const isPolicyPage = currentPagePath === '/privacy' || currentPagePath === '/terms';\n      if (!isPolicyPage) {\n        const nextPath = APP_LOCALE_PATHS[newLang] || '/';\n        const currentUrl = new URL(window.location.href);\n        if (currentUrl.pathname !== nextPath || currentUrl.search) {\n          window.history.pushState({ lang: newLang }, '', nextPath);\n        }\n      }\n    }\n    setLang(newLang);`;
  app = replaceOnce(app, oldSetLang, newSetLang, 'changeLanguage URL sync');
  write(appPath, app);
}

// 2) Source HTML: replace query-string hreflang URLs with crawlable locale paths.
{
  const indexPath = 'index.html';
  let html = read(indexPath);
  html = html.replace('https://emoticon-beige.vercel.app/?lang=en', 'https://emoticon-beige.vercel.app/en/');
  html = html.replace('https://emoticon-beige.vercel.app/?lang=ja', 'https://emoticon-beige.vercel.app/ja/');
  html = html.replace('https://emoticon-beige.vercel.app/?lang=zh', 'https://emoticon-beige.vercel.app/zh/');
  if (!html.includes('hreflang="x-default"')) {
    html = html.replace(
      '<link rel="alternate" hreflang="zh" href="https://emoticon-beige.vercel.app/zh/" />',
      '<link rel="alternate" hreflang="zh" href="https://emoticon-beige.vercel.app/zh/" />\n    <link rel="alternate" hreflang="x-default" href="https://emoticon-beige.vercel.app/" />'
    );
  }
  write(indexPath, html);
}

// 3) Permanent post-build generator for localized static HTML entry pages.
{
  const generatorPath = 'scripts/generate-localized-pages.mjs';
  const generator = [
    "import fs from 'node:fs';",
    "import path from 'node:path';",
    "",
    "const distDir = path.resolve('dist');",
    "const sourcePath = path.join(distDir, 'index.html');",
    "if (!fs.existsSync(sourcePath)) throw new Error('dist/index.html not found');",
    "const source = fs.readFileSync(sourcePath, 'utf8');",
    "",
    "const pages = {",
    "  ko: { htmlLang: 'ko', dir: 'ko', canonical: 'https://emoticon-beige.vercel.app/', ogLocale: 'ko_KR', title: '프롬프트 메이커 | AI 카카오톡 이모티콘 프롬프트 생성기 (ChatGPT · Gemini · Grok)', description: '사진 한 장이나 캐릭터 태그 선택으로 ChatGPT, Gemini, Grok 전용 15종 메신저 이모티콘 프롬프트를 만드는 무료 AI 프롬프트 메이커입니다.' },",
    "  en: { htmlLang: 'en', dir: 'en', canonical: 'https://emoticon-beige.vercel.app/en/', ogLocale: 'en_US', title: 'Prompt Maker | AI Emoticon Prompt Generator (ChatGPT · Gemini · Grok)', description: 'Create 15-expression AI messenger emoticon prompts from a photo or character tags for ChatGPT, Gemini and Grok. Free prompt maker with multiple art styles and themes.' },",
    "  ja: { htmlLang: 'ja', dir: 'ja', canonical: 'https://emoticon-beige.vercel.app/ja/', ogLocale: 'ja_JP', title: 'プロンプトメーカー | AI絵文字プロンプト生成ツール (ChatGPT・Gemini・Grok)', description: '写真やキャラクタータグからChatGPT・Gemini・Grok向けの15種類のメッセンジャー絵文字プロンプトを作成できる無料AIプロンプトメーカーです。' },",
    "  zh: { htmlLang: 'zh-CN', dir: 'zh', canonical: 'https://emoticon-beige.vercel.app/zh/', ogLocale: 'zh_CN', title: '提示词生成器 | AI表情包提示词工具 (ChatGPT · Gemini · Grok)', description: '通过照片或角色标签，为ChatGPT、Gemini和Grok生成15种聊天表情包提示词。支持多种画风与主题的免费AI提示词工具。' }",
    "};",
    "",
    "const replaceRequired = (html, regex, replacement, label) => {",
    "  if (!regex.test(html)) throw new Error(`Missing ${label}`);",
    "  return html.replace(regex, replacement);",
    "};",
    "",
    "for (const page of Object.values(pages)) {",
    "  let html = source;",
    "  html = replaceRequired(html, /<html lang=\"[^\"]+\">/, `<html lang=\"${page.htmlLang}\">`, 'html lang');",
    "  html = replaceRequired(html, /<title>[\\s\\S]*?<\\/title>/, `<title>${page.title}</title>`, 'title');",
    "  html = replaceRequired(html, /<meta name=\"description\" content=\"[^\"]*\" \\/>/, `<meta name=\"description\" content=\"${page.description}\" />`, 'description');",
    "  html = replaceRequired(html, /<link rel=\"canonical\" href=\"[^\"]*\" \\/>/, `<link rel=\"canonical\" href=\"${page.canonical}\" />`, 'canonical');",
    "  html = replaceRequired(html, /<meta property=\"og:url\" content=\"[^\"]*\" \\/>/, `<meta property=\"og:url\" content=\"${page.canonical}\" />`, 'og:url');",
    "  html = replaceRequired(html, /<meta property=\"og:title\" content=\"[^\"]*\" \\/>/, `<meta property=\"og:title\" content=\"${page.title}\" />`, 'og:title');",
    "  html = replaceRequired(html, /<meta property=\"og:description\" content=\"[^\"]*\" \\/>/, `<meta property=\"og:description\" content=\"${page.description}\" />`, 'og:description');",
    "  html = replaceRequired(html, /<meta property=\"og:locale\" content=\"[^\"]*\" \\/>/, `<meta property=\"og:locale\" content=\"${page.ogLocale}\" />`, 'og:locale');",
    "  html = replaceRequired(html, /<meta name=\"twitter:title\" content=\"[^\"]*\" \\/>/, `<meta name=\"twitter:title\" content=\"${page.title}\" />`, 'twitter:title');",
    "  html = replaceRequired(html, /<meta name=\"twitter:description\" content=\"[^\"]*\" \\/>/, `<meta name=\"twitter:description\" content=\"${page.description}\" />`, 'twitter:description');",
    "  const outDir = path.join(distDir, page.dir);",
    "  fs.mkdirSync(outDir, { recursive: true });",
    "  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');",
    "}",
    "",
    "console.log('Localized SEO pages generated: /ko/, /en/, /ja/, /zh/');",
    ""
  ].join('\n');
  write(generatorPath, generator);
}

// 4) Build pipeline: generate locale entry pages after Vite output.
{
  const pkgPath = 'package.json';
  let pkg = read(pkgPath);
  pkg = replaceOnce(pkg, '"build": "vite build"', '"build": "vite build && node scripts/generate-localized-pages.mjs"', 'package build script');
  write(pkgPath, pkg);
}

// 5) Sitemap: root Korean page + separate EN/JA/ZH search pages. /ko/ is a user-facing alias canonicalized to root.
{
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n  <url>\n    <loc>https://emoticon-beige.vercel.app/</loc>\n    <lastmod>2026-08-29</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n    <xhtml:link rel="alternate" hreflang="ko" href="https://emoticon-beige.vercel.app/" />\n    <xhtml:link rel="alternate" hreflang="en" href="https://emoticon-beige.vercel.app/en/" />\n    <xhtml:link rel="alternate" hreflang="ja" href="https://emoticon-beige.vercel.app/ja/" />\n    <xhtml:link rel="alternate" hreflang="zh-CN" href="https://emoticon-beige.vercel.app/zh/" />\n    <xhtml:link rel="alternate" hreflang="x-default" href="https://emoticon-beige.vercel.app/" />\n  </url>\n  <url>\n    <loc>https://emoticon-beige.vercel.app/en/</loc>\n    <lastmod>2026-08-29</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n    <xhtml:link rel="alternate" hreflang="ko" href="https://emoticon-beige.vercel.app/" />\n    <xhtml:link rel="alternate" hreflang="en" href="https://emoticon-beige.vercel.app/en/" />\n    <xhtml:link rel="alternate" hreflang="ja" href="https://emoticon-beige.vercel.app/ja/" />\n    <xhtml:link rel="alternate" hreflang="zh-CN" href="https://emoticon-beige.vercel.app/zh/" />\n    <xhtml:link rel="alternate" hreflang="x-default" href="https://emoticon-beige.vercel.app/" />\n  </url>\n  <url>\n    <loc>https://emoticon-beige.vercel.app/ja/</loc>\n    <lastmod>2026-08-29</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n    <xhtml:link rel="alternate" hreflang="ko" href="https://emoticon-beige.vercel.app/" />\n    <xhtml:link rel="alternate" hreflang="en" href="https://emoticon-beige.vercel.app/en/" />\n    <xhtml:link rel="alternate" hreflang="ja" href="https://emoticon-beige.vercel.app/ja/" />\n    <xhtml:link rel="alternate" hreflang="zh-CN" href="https://emoticon-beige.vercel.app/zh/" />\n    <xhtml:link rel="alternate" hreflang="x-default" href="https://emoticon-beige.vercel.app/" />\n  </url>\n  <url>\n    <loc>https://emoticon-beige.vercel.app/zh/</loc>\n    <lastmod>2026-08-29</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n    <xhtml:link rel="alternate" hreflang="ko" href="https://emoticon-beige.vercel.app/" />\n    <xhtml:link rel="alternate" hreflang="en" href="https://emoticon-beige.vercel.app/en/" />\n    <xhtml:link rel="alternate" hreflang="ja" href="https://emoticon-beige.vercel.app/ja/" />\n    <xhtml:link rel="alternate" hreflang="zh-CN" href="https://emoticon-beige.vercel.app/zh/" />\n    <xhtml:link rel="alternate" hreflang="x-default" href="https://emoticon-beige.vercel.app/" />\n  </url>\n  <url>\n    <loc>https://emoticon-beige.vercel.app/privacy</loc>\n    <lastmod>2026-08-29</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n  <url>\n    <loc>https://emoticon-beige.vercel.app/terms</loc>\n    <lastmod>2026-08-29</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n</urlset>\n`;
  write('public/sitemap.xml', sitemap);
}

console.log('Multilingual SEO patch applied.');
