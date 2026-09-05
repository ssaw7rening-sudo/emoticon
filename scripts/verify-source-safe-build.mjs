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

// The split-specific console string exists only inside the source-level
// splitIntoFifteenSourceSafe() implementation. Requiring it prevents a legacy
// Vite splitter from deleting that function while leaving the export path intact.
const required = [
  ['source-direct splitter', 'Direct source decode failed; using processed split:'],
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
console.log('[source-direct-check] source splitter and direct RGBA export both survived the production build');
