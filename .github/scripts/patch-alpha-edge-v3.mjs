import fs from 'node:fs';

const file = 'vite.hybrid-edge-refine.config.js';
let source = fs.readFileSync(file, 'utf8');

function replaceOnce(from, to, label) {
  const first = source.indexOf(from);
  if (first < 0) throw new Error(`Missing anchor: ${label}`);
  if (source.indexOf(from, first + from.length) >= 0) throw new Error(`Non-unique anchor: ${label}`);
  source = source.slice(0, first) + to + source.slice(first + from.length);
}

replaceOnce('// ADAPTIVE_ALPHA_EDGE_SMOOTHING_V2', '// ADAPTIVE_ALPHA_EDGE_SMOOTHING_V3', 'version marker');
replaceOnce('let smoothing = strandLike ? 0.16 : 0.30;', 'let smoothing = strandLike ? 0.16 : 0.34;', 'base smoothing');
replaceOnce('if (!strandLike && localSpan >= 96) smoothing = 0.38;', 'if (!strandLike && localSpan >= 96) smoothing = 0.42;', 'strong smoothing');
replaceOnce('if (!strandLike && a >= 72 && a <= 216 && localSpan >= 144) smoothing = 0.42;', 'if (!strandLike && a >= 72 && a <= 216 && localSpan >= 144) smoothing = 0.46;', 'maximum smoothing');
replaceOnce('const maxDelta = strandLike ? 18 : 34;', 'const maxDelta = strandLike ? 18 : 38;', 'alpha delta guard');
replaceOnce('const softened = Math.round(targetAlpha * 0.18);', 'const softened = Math.round(targetAlpha * 0.22);', 'transparent hard edge blend');
replaceOnce('smoothedAlpha[index] = Math.max(0, Math.min(42, softened));', 'smoothedAlpha[index] = Math.max(0, Math.min(48, softened));', 'transparent hard edge cap');
replaceOnce('const softened = Math.round(255 * 0.82 + targetAlpha * 0.18);', 'const softened = Math.round(255 * 0.78 + targetAlpha * 0.22);', 'opaque hard edge blend');
replaceOnce('smoothedAlpha[index] = Math.max(214, Math.min(255, softened));', 'smoothedAlpha[index] = Math.max(207, Math.min(255, softened));', 'opaque hard edge floor');

if (!source.includes('ADAPTIVE_ALPHA_EDGE_SMOOTHING_V3')) throw new Error('V3 marker missing');
if (!source.includes('strandLike ? 0.16 : 0.34')) throw new Error('Fine-strand protection changed unexpectedly');
if (!source.includes('smoothing = 0.46')) throw new Error('Maximum smoothing missing');
if (!source.includes('Math.min(48, softened)')) throw new Error('Hard edge cap missing');

fs.writeFileSync(file, source);
