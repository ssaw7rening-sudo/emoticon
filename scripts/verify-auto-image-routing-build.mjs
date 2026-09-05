import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const assetsDir = path.join(rootDir, 'dist', 'assets');
if (!fs.existsSync(assetsDir)) {
  console.error('[image-routing-check] dist/assets not found');
  process.exit(1);
}

const bundle = fs.readdirSync(assetsDir)
  .filter((name) => name.endsWith('.js'))
  .map((name) => fs.readFileSync(path.join(assetsDir, name), 'utf8'))
  .join('\n');

const required = [
  ['transparent sheet route', 'transparent-sheet'],
  ['solid sheet route', 'solid-sheet'],
  ['transparent image route', 'transparent-image'],
  ['direct alpha crop', 'DIRECT_ALPHA_CROP'],
  ['routing UI marker', 'data-input-routing'],
  ['sheet transparent result', 'sheet-transparent'],
  ['sheet solid result', 'sheet-solid'],
];

let failed = false;
for (const [label, marker] of required) {
  if (!bundle.includes(marker)) {
    console.error(`[image-routing-check] missing ${label}: ${marker}`);
    failed = true;
  } else {
    console.log(`[image-routing-check] ok: ${label}`);
  }
}

if (failed) process.exit(1);
console.log('[image-routing-check] production bundle contains automatic image routing and sheet-safe crop paths');
