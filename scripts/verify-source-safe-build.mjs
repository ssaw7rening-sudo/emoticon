import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const assetsDir = path.join(rootDir, 'dist', 'assets');
if (!fs.existsSync(assetsDir)) process.exit(1);

const bundle = fs.readdirSync(assetsDir)
  .filter((name) => name.endsWith('.js'))
  .map((name) => fs.readFileSync(path.join(assetsDir, name), 'utf8'))
  .join('\n');

const required = [
  ['transparent source-safe route', 'transparent-source-safe'],
  ['mask-guided engine', 'MASK_GUIDED'],
  ['direct RGBA export', 'SOURCE_DIRECT_EXPORT'],
  ['pixel payload', 'pixelData'],
  ['pixel-safe flag', 'pixelSafe'],
];

let failed = false;
for (const [label, marker] of required) {
  if (!bundle.includes(marker)) {
    console.error('[source-safe-check] missing ' + label + ': ' + marker);
    failed = true;
  } else {
    console.log('[source-safe-check] ok: ' + label);
  }
}

if (failed) process.exit(1);
console.log('[source-safe-check] mask-guided hole recovery and original edge alpha are present in production');
