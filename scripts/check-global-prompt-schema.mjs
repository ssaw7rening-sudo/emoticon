import fs from 'node:fs';

const files = ['vite.global-canonical-prompt-schema-v1.js'];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const locale of ['ko-KR', 'en-US', 'ja-JP', 'zh-CN']) {
    if (!text.includes(locale)) throw new Error(`${file}: missing ${locale}`);
  }
}

const canonical = fs.readFileSync('vite.global-canonical-prompt-schema-v1.js', 'utf8');
const required = [
  'Art Style Director',
  'Phrase/Theme = Semantic Data',
  'Priority',
  'Typography = Style Direction',
  'Goal',
  'Reference Image',
  'Character Identity LOCK',
  'Five-Axis Preset',
  'Global Sticker Composition Director',
  'Complete Slot Isolation + Safe Frame',
  'Typography Legibility LOCK',
  'Hand/Finger Stability',
  'Panel Plan',
  'Composition and Background',
  'Consistency',
  'Locale-Specific Text Policy',
  'Exclude',
  'Final Style Test',
];
for (const marker of required) {
  if (!canonical.includes(marker)) throw new Error(`canonical schema missing: ${marker}`);
}

if (!canonical.includes('Never inject a Korean-only typography heading/rule into en-US, ja-JP or zh-CN')) {
  throw new Error('cross-locale Korean typography leak guard missing');
}

console.log('global canonical prompt schema checks passed');
