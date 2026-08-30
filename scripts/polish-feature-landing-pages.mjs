import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');

const locales = {
  ko: { prefix: '', kicker: 'Prompt Maker · 무료 웹 도구' },
  en: { prefix: 'en', kicker: 'Prompt Maker · Free Web Tool' },
  ja: { prefix: 'ja', kicker: 'Prompt Maker · 無料Webツール' },
  zh: { prefix: 'zh', kicker: 'Prompt Maker · 免费在线工具' }
};

const features = [
  'ai-sticker-maker',
  'photo-to-sticker',
  'sticker-sheet-splitter',
  'transparent-png-maker',
  'image-upscaler'
];

const polishCss = `
/* LANDING_POLISH_V1 */
:root{
  font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Apple SD Gothic Neo","Noto Sans KR","Noto Sans JP","Microsoft YaHei",Arial,sans-serif;
  font-synthesis:none;
  text-rendering:optimizeLegibility;
  -webkit-font-smoothing:antialiased;
  color:#332d27;
  background:#fffaf2;
}
html{background:#fffaf2}
body{
  margin:0;
  background:linear-gradient(180deg,#fff9ea 0,#fffdf8 44%,#fff 100%);
  color:#332d27;
}
body,a,button{font-family:inherit}
.seo-feature-shell{
  width:min(100%,900px);
  margin:0 auto;
  padding:18px 20px 72px;
}
.seo-nav{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:18px;
  padding:12px 0 18px;
}
.seo-brand{
  font-size:22px;
  line-height:1.2;
  font-weight:900;
  letter-spacing:-.025em;
  color:#68430c;
  text-decoration:none;
  white-space:nowrap;
}
.seo-home-link{
  min-height:40px;
  display:inline-flex;
  align-items:center;
  padding:0 12px;
  border:1px solid #eadfcf;
  border-radius:999px;
  background:#fff;
  color:#6d5d49;
  text-decoration:none;
  font-size:13px;
  font-weight:800;
}
.seo-locale-switch{
  display:flex;
  flex-wrap:wrap;
  gap:7px;
  justify-content:flex-end;
  margin:0 0 14px;
}
.seo-locale-switch a{
  min-height:38px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  padding:0 11px;
  border-radius:999px;
  border:1px solid #eadfcf;
  background:#fff;
  color:#675a4a;
  text-decoration:none;
  font-size:12px;
  line-height:1;
  font-weight:800;
  white-space:nowrap;
}
.seo-locale-switch a[aria-current="page"]{
  background:#fff1bd;
  border-color:#e3c25d;
  color:#6d480c;
}
.seo-visible-breadcrumb{
  display:flex;
  align-items:center;
  gap:7px;
  flex-wrap:wrap;
  margin:0 0 18px;
  color:#82766a;
  font-size:12px;
  line-height:1.5;
  font-weight:700;
}
.seo-visible-breadcrumb a{color:#765b35;text-decoration:none}
.seo-visible-breadcrumb strong{color:#51483f;font-weight:800}
.seo-hero{
  padding:42px 42px 40px;
  border:1px solid #edd69a;
  border-radius:24px;
  background:rgba(255,255,255,.9);
  box-shadow:0 14px 38px rgba(94,65,26,.07);
  text-align:left;
}
.seo-kicker{
  display:inline-flex;
  align-items:center;
  min-height:30px;
  padding:0 11px;
  border-radius:999px;
  background:#fff2c4;
  color:#76520f;
  font-size:12px;
  line-height:1;
  font-weight:850;
  letter-spacing:-.01em;
}
.seo-hero h1{
  max-width:780px;
  margin:18px 0 16px;
  font-size:clamp(30px,4.8vw,47px);
  line-height:1.16;
  letter-spacing:-.035em;
  font-weight:900;
  text-wrap:balance;
}
.seo-hero p{
  max-width:750px;
  margin:0 0 26px;
  font-size:17px;
  line-height:1.78;
  color:#655c52;
  font-weight:500;
  text-wrap:pretty;
}
.seo-primary-cta{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:50px;
  padding:0 20px;
  border-radius:14px;
  border:1px solid #e2bd50;
  background:#fff0b7;
  color:#68430f;
  text-decoration:none;
  font-size:14px;
  line-height:1.25;
  font-weight:900;
  box-shadow:0 6px 16px rgba(140,95,20,.10);
}
.seo-card{
  margin-top:18px;
  padding:26px;
  border:1px solid #ece3d7;
  border-radius:20px;
  background:#fff;
  box-shadow:0 4px 16px rgba(70,52,28,.035);
}
.seo-card h2,.seo-related h2{
  margin:0 0 17px;
  font-size:21px;
  line-height:1.35;
  letter-spacing:-.025em;
  font-weight:900;
  color:#39322b;
  text-wrap:balance;
}
.seo-card h3{
  margin:0 0 9px;
  font-size:17px;
  line-height:1.5;
  letter-spacing:-.015em;
  color:#40382f;
}
.seo-feature-grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:10px;
}
.seo-mini-card{
  min-width:0;
  display:flex;
  align-items:flex-start;
  gap:12px;
  padding:17px;
  border:1px solid #f0e4cb;
  border-radius:15px;
  background:#fffbf3;
}
.seo-mini-card span{
  flex:0 0 auto;
  min-width:27px;
  font-size:12px;
  line-height:1.5;
  font-weight:900;
  color:#ad7b18;
}
.seo-mini-card p,.seo-faq p{
  margin:0;
  color:#5f574e;
  font-size:14px;
  line-height:1.7;
  text-wrap:pretty;
}
.seo-steps{
  margin:0;
  padding:0;
  list-style:none;
  counter-reset:steps;
  display:grid;
  gap:9px;
}
.seo-steps li{
  counter-increment:steps;
  position:relative;
  min-height:42px;
  padding:10px 12px 10px 45px;
  border-radius:13px;
  background:#fbf8f2;
  color:#5d554c;
  font-size:14px;
  line-height:1.65;
}
.seo-steps li::before{
  content:counter(steps);
  position:absolute;
  left:11px;
  top:10px;
  width:24px;
  height:24px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:50%;
  background:#fff0bd;
  color:#795311;
  font-size:12px;
  line-height:1;
  font-weight:900;
}
.seo-search-intent ul{
  display:grid;
  gap:8px;
  margin:0;
  padding:0;
  list-style:none;
}
.seo-search-intent li{
  position:relative;
  padding:9px 12px 9px 34px;
  border-radius:12px;
  background:#fbfaf7;
  color:#5f574e;
  font-size:14px;
  line-height:1.65;
}
.seo-search-intent li::before{
  content:'✓';
  position:absolute;
  left:12px;
  top:9px;
  color:#9d7a2d;
  font-weight:900;
}
.seo-related{
  margin-top:22px;
  padding:24px 0 4px;
}
.seo-related div{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:9px;
}
.seo-related a{
  min-width:0;
  min-height:46px;
  display:flex;
  align-items:center;
  padding:10px 13px;
  border:1px solid #e9dfd0;
  border-radius:13px;
  background:#fff;
  color:#675a4b;
  text-decoration:none;
  font-size:13px;
  line-height:1.45;
  font-weight:800;
}
.seo-final-cta{text-align:left;padding:20px 0 0}

html[lang="ko"] .seo-feature-shell,
html[lang="ko"] .seo-feature-shell h1,
html[lang="ko"] .seo-feature-shell h2,
html[lang="ko"] .seo-feature-shell h3,
html[lang="ko"] .seo-feature-shell p,
html[lang="ko"] .seo-feature-shell li,
html[lang="ko"] .seo-feature-shell a,
html[lang="ko"] .seo-feature-shell strong{
  word-break:keep-all;
  overflow-wrap:break-word;
}
html[lang="en"] .seo-feature-shell h1,
html[lang="en"] .seo-feature-shell h2,
html[lang="en"] .seo-feature-shell h3,
html[lang="en"] .seo-feature-shell p,
html[lang="en"] .seo-feature-shell li{
  overflow-wrap:break-word;
  hyphens:none;
}
html[lang="ja"] .seo-feature-shell,
html[lang="zh-CN"] .seo-feature-shell{
  line-break:strict;
  word-break:normal;
  overflow-wrap:break-word;
}

@media(max-width:640px){
  .seo-feature-shell{padding:12px 15px 52px}
  .seo-nav{padding:8px 0 13px}
  .seo-brand{font-size:20px}
  .seo-home-link{min-height:36px;font-size:12px;padding:0 10px}
  .seo-locale-switch{justify-content:flex-start;margin:0 0 12px;gap:6px}
  .seo-locale-switch a{min-height:36px;padding:0 10px;font-size:11.5px}
  .seo-visible-breadcrumb{margin-bottom:14px;font-size:11.5px}
  .seo-hero{padding:29px 20px 27px;border-radius:20px}
  .seo-kicker{font-size:11.5px}
  .seo-hero h1{margin:16px 0 13px;font-size:clamp(28px,8vw,34px);line-height:1.2;letter-spacing:-.03em}
  .seo-hero p{margin-bottom:22px;font-size:15px;line-height:1.75}
  .seo-primary-cta{width:100%;min-height:48px;padding:0 15px;font-size:13.5px}
  .seo-card{margin-top:13px;padding:20px 17px;border-radius:17px}
  .seo-card h2,.seo-related h2{margin-bottom:14px;font-size:19px}
  .seo-card h3{font-size:16px}
  .seo-feature-grid{grid-template-columns:1fr;gap:8px}
  .seo-mini-card{padding:14px}
  .seo-mini-card p,.seo-faq p,.seo-steps li,.seo-search-intent li{font-size:13.5px}
  .seo-related{margin-top:17px;padding-top:19px}
  .seo-related div{grid-template-columns:1fr;gap:7px}
  .seo-related a{min-height:44px;font-size:12.5px}
  .seo-final-cta{padding-top:14px}
}
`;

for (const [lang, meta] of Object.entries(locales)) {
  for (const slug of features) {
    const filePath = path.join(distDir, ...(meta.prefix ? [meta.prefix] : []), slug, 'index.html');
    if (!fs.existsSync(filePath)) throw new Error(`[landing-polish] Missing ${filePath}`);

    let html = fs.readFileSync(filePath, 'utf8');

    html = html.replace(
      /<span class="seo-kicker">[\s\S]*?<\/span>/,
      `<span class="seo-kicker">${meta.kicker}</span>`
    );

    // The main-page tool hub is intentionally hidden, so the visible breadcrumb
    // should not point users to that hidden anchor.
    html = html.replace(
      /<nav class="seo-visible-breadcrumb" aria-label="Breadcrumb">([\s\S]*?)<\/nav>/,
      (match) => match.replace(/<a href="[^"]*#prompt-maker-tool-links">[\s\S]*?<\/a><span>›<\/span>/, '')
    );

    if (!html.includes('LANDING_POLISH_V1')) {
      if (!html.includes('</head>')) throw new Error(`[landing-polish] </head> missing in ${filePath}`);
      html = html.replace('</head>', `<style>${polishCss}</style>\n</head>`);
    }

    fs.writeFileSync(filePath, html, 'utf8');
  }
}

console.log('Feature landing pages polished: typography, responsive layout, localized wrapping, breadcrumb and locale controls updated');
