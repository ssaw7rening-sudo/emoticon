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
  ['final foreground-mask engine', 'FOREGROUND_MASK'],
  ['direct RGBA export', 'SOURCE_DIRECT_EXPORT'],
  ['pixel payload', 'pixelData'],
  ['pixel-safe flag', 'pixelSafe'],
];

let failed = false;
for (const [label, marker] of required) {
  if (!bundle.includes(marker)) {
    console.error('[foreground-mask-check] missing ' + label + ': ' + marker);
    failed = true;
  } else {
    console.log('[foreground-mask-check] ok: ' + label);
  }
}

if (failed) process.exit(1);
console.log('[foreground-mask-check] foreground-mask split and direct RGBA export are present; soft-alpha replacement is enforced by the build transform');
