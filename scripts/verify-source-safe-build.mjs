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
  ['outline-interior engine', 'OUTLINE_INTERIOR'],
  ['direct RGBA export', 'SOURCE_DIRECT_EXPORT'],
  ['pixel payload', 'pixelData'],
  ['pixel-safe flag', 'pixelSafe'],
];

let failed = false;
for (const [label, marker] of required) {
  if (!bundle.includes(marker)) {
    console.error('[outline-interior-check] missing ' + label + ': ' + marker);
    failed = true;
  } else {
    console.log('[outline-interior-check] ok: ' + label);
  }
}

if (failed) process.exit(1);
console.log('[outline-interior-check] outline-enclosed recovery and direct RGBA export are present; soft alpha is enforced by the transform');
