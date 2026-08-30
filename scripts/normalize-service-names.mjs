import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const assetsDir = path.join(distDir, 'assets');
if (!fs.existsSync(assetsDir)) throw new Error('[service-names] dist/assets not found');

const replacements = [
  [
    '이모티콘 프롬프트 메이커는 사용자의 키워드 선택이나 사진을 바탕으로 ChatGPT(DALL-E 3), Google Gemini(Imagen 3), xAI Grok(Imagine Image 2.0)에 즉시 사용 가능한 15종 카카오톡·라인 이모티콘 프롬프트를 1초 만에 자동 생성해 주는 무료 웹 도구입니다.',
    '이모티콘 프롬프트 메이커는 사용자의 키워드 선택이나 사진을 바탕으로 ChatGPT · Gemini · Grok에서 바로 사용할 수 있는 15종 메신저 이모티콘 프롬프트를 자동 생성해 주는 무료 웹 도구입니다.'
  ],
  [
    'Emoticon Prompt Maker is a free web tool that instantly generates 15-sticker emoticon prompts for ChatGPT (DALL-E 3), Google Gemini (Imagen 3), and xAI Grok (Imagine Image 2.0) in 1 second based on your keywords or photos.',
    'Emoticon Prompt Maker is a free web tool that creates ready-to-use 15-sticker prompts for ChatGPT, Gemini, and Grok from your keywords or photos.'
  ],
  [
    'スタンププロンプトメーカーは、キーワード選択や写真をもとに、ChatGPT (DALL-E 3)、Google Gemini (Imagen 3)、xAI Grok (Imagine Image 2.0) で使える15種LINE・KakaoTalkスタンププロンプトを1秒で自動生成する無料Webツールです。',
    'スタンププロンプトメーカーは、キーワード選択や写真をもとに、ChatGPT・Gemini・Grokですぐ使える15種類のメッセンジャースタンプ用プロンプトを作成する無料Webツールです。'
  ],
  [
    '表情包提示词生成器是一款免费在线工具，根据您选择的关键词或上传的照片，1秒内自动生成适用于 ChatGPT (DALL-E 3)、Google Gemini (Imagen 3) 和 xAI Grok (Imagine Image 2.0) 的15格全套表情包提示词。',
    '表情包提示词生成器是一款免费在线工具，可根据您选择的关键词或照片，生成适用于 ChatGPT、Gemini 和 Grok 的15张表情包提示词。'
  ]
];

const jsFiles = fs.readdirSync(assetsDir).filter((name) => name.endsWith('.js'));
let changedFiles = 0;
let replacementCount = 0;

for (const name of jsFiles) {
  const filePath = path.join(assetsDir, name);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      replacementCount += 1;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    changedFiles += 1;
  }
}

// The source copy may already be normalized or may have been intentionally
// rewritten by a newer prompt-template update. In that case there is nothing
// for this legacy bundle-normalization step to replace. Treat zero matches as
// a valid no-op, but still fail on a partial 1~3 language replacement because
// that would leave localized bundles inconsistent.
if (replacementCount > 0 && replacementCount < replacements.length) {
  throw new Error(`[service-names] Partial localized template update: replaced ${replacementCount} of ${replacements.length}`);
}

if (replacementCount === 0) {
  console.log('Service-name copy already normalized or superseded; no bundle replacements needed');
} else {
  console.log(`Service-name copy normalized in ${changedFiles} bundle file(s); ${replacementCount} localized descriptions updated`);
}
