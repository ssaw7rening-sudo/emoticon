import fs from 'node:fs';

const canonicalPath = 'vite.global-canonical-prompt-schema-v1.js';
const canonical = fs.readFileSync(canonicalPath, 'utf8');

for (const locale of ['ko-KR', 'en-US', 'ja-JP', 'zh-CN']) {
  if (!canonical.includes(locale)) throw new Error(`${canonicalPath}: missing ${locale}`);
}

const requiredConcepts = [
  'PHRASE/THEME = SEMANTIC DATA',
  'PRIORITY',
  'TYPOGRAPHY = STYLE DIRECTION',
  'GLOBAL STICKER COMPOSITION DIRECTOR',
  'COMPLETE SLOT ISOLATION + SAFE FRAME',
  'TYPOGRAPHY LEGIBILITY LOCK',
  'HAND/FINGER STABILITY',
  'CANONICAL GLOBAL PROMPT SCHEMA',
  'FINAL STYLE TEST',
  'フレーズ/テーマ = 意味データ',
  'セル完全分離 + Safe Frame',
  '文字可読性 LOCK',
  'グローバル共通プロンプト構造',
  '短语/主题 = 语义数据',
  '单元完全隔离 + Safe Frame',
  '文字可读性 LOCK',
  '全球统一提示词结构',
];
for (const marker of requiredConcepts) {
  if (!canonical.includes(marker)) throw new Error(`canonical schema missing: ${marker}`);
}

if (!canonical.includes("typeof lang !== 'undefined'")) {
  throw new Error('locale resolver must use the app language safely');
}
if (!canonical.includes('Wrap English by natural word groups rather than character count')) {
  throw new Error('English wrapping policy missing');
}
if (!canonical.includes('日本語は文字数を機械的に固定せず')) {
  throw new Error('Japanese wrapping policy missing');
}
if (!canonical.includes('简体中文不要套用韩文字符数规则')) {
  throw new Error('Chinese wrapping policy missing');
}

for (const configPath of ['vite.phrase-theme-build.config.js', 'vite.phrase-theme-dev.config.js']) {
  const config = fs.readFileSync(configPath, 'utf8');
  if (!config.includes("import { globalCanonicalPromptSchemaV1Plugin }")) {
    throw new Error(`${configPath}: canonical plugin import missing`);
  }
  const pluginPos = config.lastIndexOf('globalCanonicalPromptSchemaV1Plugin()');
  const inlinePos = config.lastIndexOf('inlineTagAccordionV1Plugin()');
  if (pluginPos < 0 || pluginPos < inlinePos) {
    throw new Error(`${configPath}: canonical plugin must run after existing prompt decorators`);
  }
}

console.log('global canonical prompt schema checks passed');