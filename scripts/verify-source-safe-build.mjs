import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const assetsDir = path.join(rootDir, 'dist', 'assets');
if (!fs.existsSync(assetsDir)) process.exit(1);
const bundle = fs.readdirSync(assetsDir).filter((name) => name.endsWith('.js')).map((name) => fs.readFileSync(path.join(assetsDir, name), 'utf8')).join('\n');
const required = [['direct source split', 'SOURCE_DIRECT_SPLIT'], ['direct RGBA export', 'SOURCE_DIRECT_EXPORT'], ['direct engine', 'SOURCE_DIRECT']];
let failed = false;
for (const [label, marker] of required) {
  if (!bundle.includes(marker)) { console.error('[source-direct-check] missing ' + label + ': ' + marker); failed = true; }
  else console.log('[source-direct-check] ok: ' + label);
}
if (failed) process.exit(1);
console.log('[source-direct-check] source-level split and export are present in production bundle');
