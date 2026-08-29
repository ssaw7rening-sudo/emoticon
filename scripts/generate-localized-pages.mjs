import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const sourcePath = path.join(distDir, 'index.html');
if (!fs.existsSync(sourcePath)) throw new Error('dist/index.html not found');
const source = fs.readFileSync(sourcePath, 'utf8');

const pages = {
  ko: { htmlLang: 'ko', dir: 'ko', canonical: 'https://emoticon-beige.vercel.app/', ogLocale: 'ko_KR', title: '프롬프트 메이커 | AI 카카오톡 이모티콘 프롬프트 생성기 (ChatGPT · Gemini · Grok)', description: '사진 한 장이나 캐릭터 태그 선택으로 ChatGPT, Gemini, Grok 전용 15종 메신저 이모티콘 프롬프트를 만드는 무료 AI 프롬프트 메이커입니다.' },
  en: { htmlLang: 'en', dir: 'en', canonical: 'https://emoticon-beige.vercel.app/en/', ogLocale: 'en_US', title: 'Prompt Maker | AI Emoticon Prompt Generator (ChatGPT · Gemini · Grok)', description: 'Create 15-expression AI messenger emoticon prompts from a photo or character tags for ChatGPT, Gemini and Grok. Free prompt maker with multiple art styles and themes.' },
  ja: { htmlLang: 'ja', dir: 'ja', canonical: 'https://emoticon-beige.vercel.app/ja/', ogLocale: 'ja_JP', title: 'プロンプトメーカー | AI絵文字プロンプト生成ツール (ChatGPT・Gemini・Grok)', description: '写真やキャラクタータグからChatGPT・Gemini・Grok向けの15種類のメッセンジャー絵文字プロンプトを作成できる無料AIプロンプトメーカーです。' },
  zh: { htmlLang: 'zh-CN', dir: 'zh', canonical: 'https://emoticon-beige.vercel.app/zh/', ogLocale: 'zh_CN', title: '提示词生成器 | AI表情包提示词工具 (ChatGPT · Gemini · Grok)', description: '通过照片或角色标签，为ChatGPT、Gemini和Grok生成15种聊天表情包提示词。支持多种画风与主题的免费AI提示词工具。' }
};

const replaceRequired = (html, regex, replacement, label) => {
  if (!regex.test(html)) throw new Error(`Missing ${label}`);
  return html.replace(regex, replacement);
};

for (const page of Object.values(pages)) {
  let html = source;
  html = replaceRequired(html, /<html lang="[^"]+">/, `<html lang="${page.htmlLang}">`, 'html lang');
  html = replaceRequired(html, /<title>[\s\S]*?<\/title>/, `<title>${page.title}</title>`, 'title');
  html = replaceRequired(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${page.description}" />`, 'description');
  html = replaceRequired(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${page.canonical}" />`, 'canonical');
  html = replaceRequired(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${page.canonical}" />`, 'og:url');
  html = replaceRequired(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${page.title}" />`, 'og:title');
  html = replaceRequired(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${page.description}" />`, 'og:description');
  html = replaceRequired(html, /<meta property="og:locale" content="[^"]*" \/>/, `<meta property="og:locale" content="${page.ogLocale}" />`, 'og:locale');
  html = replaceRequired(html, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${page.title}" />`, 'twitter:title');
  html = replaceRequired(html, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${page.description}" />`, 'twitter:description');
  const outDir = path.join(distDir, page.dir);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
}

console.log('Localized SEO pages generated: /ko/, /en/, /ja/, /zh/');
