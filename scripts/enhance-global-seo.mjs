import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const origin = 'https://emoticon-beige.vercel.app';

const locales = {
  ko: { prefix: '', html: 'ko', home: '/', homeLabel: '홈', toolsLabel: '기능별 무료 도구', intentTitle: '이런 작업에 특히 유용합니다' },
  en: { prefix: 'en', html: 'en', home: '/en/', homeLabel: 'Home', toolsLabel: 'Free tools by task', intentTitle: 'Popular ways to use this tool' },
  ja: { prefix: 'ja', html: 'ja', home: '/ja/', homeLabel: 'ホーム', toolsLabel: '目的別の無料ツール', intentTitle: 'こんな用途におすすめです' },
  zh: { prefix: 'zh', html: 'zh-CN', home: '/zh/', homeLabel: '首页', toolsLabel: '按用途选择免费工具', intentTitle: '适合这些常见用途' }
};

const features = {
  'ai-sticker-maker': {
    ko: ['AI로 카카오톡·메신저 이모티콘을 처음 만들 때', '사진이나 캐릭터 설정을 15가지 표정·동작으로 확장할 때', 'ChatGPT·Gemini·Grok용 프롬프트를 한 번에 준비할 때'],
    en: ['Create custom AI stickers or messenger emojis from a character idea', 'Turn one photo or character identity into a 15-expression sticker set', 'Prepare model-ready prompts for ChatGPT, Gemini, and Grok'],
    ja: ['AIでLINE・メッセンジャー用スタンプを作りたいとき', '写真やキャラクターを15種類の表情・ポーズへ展開したいとき', 'ChatGPT・Gemini・Grok向けプロンプトをまとめて準備したいとき'],
    zh: ['制作AI聊天表情包或个性贴纸时', '把一张照片或一个角色扩展成15种表情动作时', '一次准备适用于ChatGPT、Gemini和Grok的提示词时']
  },
  'photo-to-sticker': {
    ko: ['내 얼굴 사진으로 닮은 캐릭터 이모티콘을 만들 때', '반려견·반려묘 사진을 스티커 캐릭터로 만들 때', '한 인물의 정체성을 유지하면서 여러 감정 표현을 만들 때'],
    en: ['Turn a selfie into a recognizable cartoon sticker set', 'Create pet stickers from a dog or cat photo', 'Keep one identity consistent across multiple expressions and poses'],
    ja: ['自分の写真から似顔絵スタンプを作りたいとき', '犬・猫などペット写真をキャラクタースタンプにしたいとき', '同じ人物の特徴を保ちながら複数の表情を作りたいとき'],
    zh: ['把自拍照做成有辨识度的卡通表情包时', '把猫狗等宠物照片做成贴纸角色时', '保持同一人物特征并生成多种表情动作时']
  },
  'sticker-sheet-splitter': {
    ko: ['5×3 형태의 15개 이모티콘 시트를 개별 이미지로 나눌 때', '고정 격자보다 실제 캐릭터·문구 위치를 기준으로 분리하고 싶을 때', '분리한 15개 이미지를 수정 후 ZIP으로 한 번에 저장할 때'],
    en: ['Split a 5×3, 15-sticker sheet into individual images', 'Use detected character and text regions instead of a blind fixed-grid crop', 'Review, edit, resize, and batch-download all 15 stickers as a ZIP'],
    ja: ['5×3の15個スタンプシートを個別画像に分けたいとき', '固定グリッドではなくキャラクターや文字位置を見て分割したいとき', '分割後に修正して15個をZIPでまとめて保存したいとき'],
    zh: ['把5×3的15张表情合集拆成单张图片时', '希望根据角色与文字实际位置而不是固定网格裁切时', '拆分后逐张修正并将15张图片打包ZIP保存时']
  },
  'transparent-png-maker': {
    ko: ['이모티콘·프로필 이미지의 배경을 투명하게 만들 때', '머리카락·외곽선이 복잡한 이미지에 정밀 재처리가 필요할 때', '원본 색상을 최대한 유지한 투명 PNG가 필요할 때'],
    en: ['Make sticker, avatar, or product-style images transparent', 'Refine difficult hair and edge areas with precision reprocessing', 'Export transparent PNGs while minimizing unwanted RGB color shifts'],
    ja: ['スタンプやプロフィール画像の背景を透過したいとき', '髪や輪郭など複雑な部分を精密再処理したいとき', '元の色をできるだけ保った透過PNGが必要なとき'],
    zh: ['需要把表情包或头像背景变透明时', '头发与复杂边缘需要精细再处理时', '希望尽量保留原始颜色并导出透明PNG时']
  },
  'image-upscaler': {
    ko: ['분리한 이모티콘을 360·720·1440px 규격으로 맞출 때', '작은 PNG를 2배·4배 확대해 저장할 때', '15개 이미지를 같은 크기로 변환해 ZIP으로 정리할 때'],
    en: ['Resize split stickers to 360, 720, or 1440px', 'Scale a small transparent PNG to 2× or 4× output', 'Convert a full 15-sticker set to one consistent size and download it as ZIP'],
    ja: ['分割したスタンプを360・720・1440pxに揃えたいとき', '小さなPNGを2倍・4倍に拡大して保存したいとき', '15個すべてを同じサイズへ変換してZIP保存したいとき'],
    zh: ['把拆分后的表情统一转换为360、720或1440px时', '将小尺寸透明PNG放大2倍或4倍保存时', '把15张图片统一尺寸并打包ZIP下载时']
  }
};

const pageUrl = (lang, slug) => `${origin}${locales[lang].prefix ? `/${locales[lang].prefix}` : ''}/${slug}/`;
const relativeFile = (lang, slug) => path.join(distDir, ...(locales[lang].prefix ? [locales[lang].prefix] : []), slug, 'index.html');

const localeSwitch = (slug, currentLang) => {
  const labels = { ko: '한국어', en: 'English', ja: '日本語', zh: '中文' };
  return `<div class="seo-locale-switch" aria-label="Language versions">${Object.keys(locales).map((lang) => `<a href="${pageUrl(lang, slug)}" hreflang="${locales[lang].html}"${lang === currentLang ? ' aria-current="page"' : ''}>${labels[lang]}</a>`).join('')}</div>`;
};

const breadcrumb = (lang, slug, pageTitle) => {
  const meta = locales[lang];
  return `<nav class="seo-visible-breadcrumb" aria-label="Breadcrumb"><a href="${meta.home}">${meta.homeLabel}</a><span>›</span><a href="${meta.home}#prompt-maker-tool-links">${meta.toolsLabel}</a><span>›</span><strong>${pageTitle}</strong></nav>`;
};

const intentSection = (lang, items) => {
  const meta = locales[lang];
  return `<section class="seo-card seo-search-intent"><h2>${meta.intentTitle}</h2><ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul></section>`;
};

for (const [slug, localized] of Object.entries(features)) {
  for (const lang of Object.keys(locales)) {
    const filePath = relativeFile(lang, slug);
    if (!fs.existsSync(filePath)) throw new Error(`[global-seo] Missing ${filePath}`);

    let html = fs.readFileSync(filePath, 'utf8');
    if (html.includes('class="seo-search-intent"')) continue;

    const h1Match = html.match(/<h1>([\s\S]*?)<\/h1>/);
    if (!h1Match) throw new Error(`[global-seo] H1 missing in ${filePath}`);
    const pageTitle = h1Match[1].replace(/<[^>]+>/g, '').trim();

    if (!html.includes('</nav>')) throw new Error(`[global-seo] top nav missing in ${filePath}`);
    html = html.replace('</nav>', `</nav>${localeSwitch(slug, lang)}${breadcrumb(lang, slug, pageTitle)}`);

    const faqMarker = '<section class="seo-card seo-faq">';
    if (!html.includes(faqMarker)) throw new Error(`[global-seo] FAQ marker missing in ${filePath}`);
    html = html.replace(faqMarker, `${intentSection(lang, localized[lang])}${faqMarker}`);

    const cssMarker = '.seo-final-cta{text-align:center;padding:18px 0 0}';
    if (!html.includes(cssMarker)) throw new Error(`[global-seo] CSS marker missing in ${filePath}`);
    html = html.replace(cssMarker, `${cssMarker}\n      .seo-locale-switch{display:flex;flex-wrap:wrap;gap:7px;justify-content:flex-end;margin:-18px 0 14px}.seo-locale-switch a{padding:7px 10px;border-radius:999px;border:1px solid #eadfcf;background:#fff;color:#6b5d4d;text-decoration:none;font-size:12px;font-weight:800}.seo-locale-switch a[aria-current="page"]{background:#fff1bd;border-color:#e4c45f;color:#6f490d}.seo-visible-breadcrumb{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:0 0 18px;color:#7b7063;font-size:12px;font-weight:700}.seo-visible-breadcrumb a{color:#7b5a27;text-decoration:none}.seo-visible-breadcrumb strong{color:#544a40}.seo-search-intent ul{margin:0;padding-left:22px}.seo-search-intent li{padding:7px 0;line-height:1.65;color:#5f5549}`);

    fs.writeFileSync(filePath, html, 'utf8');
  }
}

const robotsPath = path.join(distDir, 'robots.txt');
if (!fs.existsSync(robotsPath)) throw new Error('[global-seo] robots.txt missing from build output');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes(`Sitemap: ${origin}/sitemap.xml`)) throw new Error('[global-seo] robots.txt does not reference sitemap.xml');

console.log('Global SEO enhanced: 20 feature pages received visible breadcrumbs, language switching, and localized search-intent content; robots sitemap verified');
