import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const assetsDir = path.join(rootDir, 'dist', 'assets');
if (!fs.existsSync(assetsDir)) {
  console.error('[source-safe-check] dist/assets not found');
  process.exit(1);
}

const jsFiles = fs.readdirSync(assetsDir).filter((name) => name.endsWith('.js'));
const bundle = jsFiles.map((name) => fs.readFileSync(path.join(assetsDir, name), 'utf8')).join('\n');

const required = [
  ['source splitter marker', 'SRC23'],
  ['pixel-safe payload', 'pixelData'],
  ['pixel-safe flag', 'pixelSafe'],
  ['direct RGBA export lock', 'SOURCE_SAFE_EXPORT_LOCK'],
  ['stable UI label', '원본 보존 분리 · 직접 RGBA 저장'],
];

let failed = false;
for (const [label, marker] of required) {
  if (!bundle.includes(marker)) {
    console.error(`[source-safe-check] missing ${label}: ${marker}`);
    failed = true;
  } else {
    console.log(`[source-safe-check] ok: ${label}`);
  }
}

if (failed) process.exit(1);
console.log('[source-safe-check] original-source split payload and direct RGBA export are present in production bundle');
