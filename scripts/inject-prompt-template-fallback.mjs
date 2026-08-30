import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const targets = [
  'index.html',
  'en/index.html',
  'ja/index.html',
  'zh/index.html'
];

const tag = '<script defer src="/prompt-template-fallback.js"></script>';

for (const relative of targets) {
  const filePath = path.join(distDir, relative);
  if (!fs.existsSync(filePath)) throw new Error(`[prompt-template-fallback] missing ${relative}`);
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('/prompt-template-fallback.js')) continue;
  if (!html.includes('</body>')) throw new Error(`[prompt-template-fallback] </body> missing in ${relative}`);
  html = html.replace('</body>', `  ${tag}\n</body>`);
  fs.writeFileSync(filePath, html, 'utf8');
}

console.log('Prompt template fallback injected into KO/EN/JA/ZH main pages');
