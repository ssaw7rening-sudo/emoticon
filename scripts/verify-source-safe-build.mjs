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
  ['strict dark-source lock', 'SOURCE_DIRECT_STRICT_DARK'],
  ['direct RGBA export', 'SOURCE_DIRECT_EXPORT'],
  ['direct engine', 'SOURCE_DIRECT'],
  ['pixel payload', 'pixelData'],
  ['pixel-safe flag', 'pixelSafe'],
];

let failed = false;
for (const [label, marker] of required) {
  if (!bundle.includes(marker)) {
    console.error('[source-direct-check] missing ' + label + ': ' + marker);
    failed = true;
  } else {
    console.log('[source-direct-check] ok: ' + label);
  }
}

if (failed) process.exit(1);
console.log('[source-direct-check] source-safe split/export routes are present; alpha preservation is enforced by the transform guard');
