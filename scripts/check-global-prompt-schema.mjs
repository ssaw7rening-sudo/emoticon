import fs from 'node:fs';

const canonicalPath = 'vite.global-canonical-prompt-schema-v1.js';
const wrapperPath = 'vite.global-canonical-scene-wrapper-v1.js';
const canonical = fs.readFileSync(canonicalPath, 'utf8');
const wrapper = fs.readFileSync(wrapperPath, 'utf8');

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
if (!wrapper.includes('scenePlugin.transform.call(this')) {
  throw new Error('scene wrapper must explicitly chain the scene transform before canonical normalization');
}
if (!wrapper.includes('canonicalPlugin.transform.call(this')) {
  throw new Error('scene wrapper must explicitly run canonical normalization on the scene-transformed source');
}

for (const configPath of ['vite.phrase-theme-build.config.js', 'vite.phrase-theme-dev.config.js']) {
  const config = fs.readFileSync(configPath, 'utf8');
  if (!config.includes("import { globalCanonicalSceneWrapperV1Plugin }")) {
    throw new Error(`${configPath}: canonical scene wrapper import missing`);
  }
  if (!config.includes('globalCanonicalSceneWrapperV1Plugin(sceneTypographyDirectionV5Plugin())')) {
    throw new Error(`${configPath}: scene transform must be wrapped by the canonical normalizer`);
  }
  if (config.includes('inlineTagAccordionV1Plugin()')) {
    throw new Error(`${configPath}: stale inline tag accordion transform must not remain in the active build pipeline`);
  }
}

console.log('global canonical prompt schema checks passed');