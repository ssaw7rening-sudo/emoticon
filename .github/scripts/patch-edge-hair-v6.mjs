import fs from 'node:fs';

function patchFile(path, replacements) {
  let source = fs.readFileSync(path, 'utf8');
  for (const [from, to, label] of replacements) {
    const first = source.indexOf(from);
    if (first < 0) throw new Error(`Missing anchor in ${path}: ${label}`);
    if (source.indexOf(from, first + from.length) >= 0) throw new Error(`Non-unique anchor in ${path}: ${label}`);
    source = source.slice(0, first) + to + source.slice(first + from.length);
  }
  fs.writeFileSync(path, source);
}

patchFile('vite.hybrid-edge-refine.config.js', [
  ['// ADAPTIVE_ALPHA_EDGE_SMOOTHING_V3', '// ADAPTIVE_ALPHA_EDGE_SMOOTHING_V4', 'edge version'],
  ['let smoothing = strandLike ? 0.16 : 0.34;', 'let smoothing = strandLike ? 0.16 : 0.36;', 'base smoothing'],
  ['if (!strandLike && localSpan >= 96) smoothing = 0.42;', 'if (!strandLike && localSpan >= 96) smoothing = 0.45;', 'strong smoothing'],
  ['if (!strandLike && a >= 72 && a <= 216 && localSpan >= 144) smoothing = 0.46;', 'if (!strandLike && a >= 72 && a <= 216 && localSpan >= 144) smoothing = 0.50;', 'max smoothing'],
  ['const maxDelta = strandLike ? 18 : 38;', 'const maxDelta = strandLike ? 18 : 40;', 'edge delta guard'],
  ['const softened = Math.round(targetAlpha * 0.22);', 'const softened = Math.round(targetAlpha * 0.24);', 'outer aa'],
  ['smoothedAlpha[index] = Math.max(0, Math.min(48, softened));', 'smoothedAlpha[index] = Math.max(0, Math.min(52, softened));', 'outer aa cap'],
  ['const softened = Math.round(255 * 0.78 + targetAlpha * 0.22);', 'const softened = Math.round(255 * 0.76 + targetAlpha * 0.24);', 'inner aa'],
  ['smoothedAlpha[index] = Math.max(207, Math.min(255, softened));', 'smoothedAlpha[index] = Math.max(202, Math.min(255, softened));', 'inner aa floor'],
]);

patchFile('vite.hair-fur-precision-v3.config.js', [
  ["name: 'hair-fur-fine-detail-precision-v5'", "name: 'hair-fur-fine-detail-precision-v6'", 'hair plugin version'],
  ['// HAIR_FUR_FINE_DETAIL_PRECISION_V5', '// HAIR_FUR_FINE_DETAIL_PRECISION_V6', 'hair helper version'],
  ['const traceExpandIterations = mobileLike ? 2 : 3;', 'const traceExpandIterations = mobileLike ? 3 : 4;', 'trace band width'],
  ['const findSupport = (map, x, y, dx, dy, maxStep = 3) => {', 'const findSupport = (map, x, y, dx, dy, maxStep = 4) => {', 'support radius'],
  ['const positive = findSupport(tracedAlpha, x, y, dx, dy, 3);', 'const positive = findSupport(tracedAlpha, x, y, dx, dy, 4);', 'positive support radius'],
  ['const negative = findSupport(tracedAlpha, x, y, -dx, -dy, 3);', 'const negative = findSupport(tracedAlpha, x, y, -dx, -dy, 4);', 'negative support radius'],
  ['if (positive.step + negative.step > 7) continue;', 'if (positive.step + negative.step > 9) continue;', 'bridge span'],
  ['if (endDistance > (autoMode ? 3200 : 4600)) continue;', 'if (endDistance > (autoMode ? 2800 : 4200)) continue;', 'endpoint colour guard'],
  ['if (colorDistanceTo(index, meanColor) > (autoMode ? 3600 : 5200)) continue;', 'if (colorDistanceTo(index, meanColor) > (autoMode ? 3300 : 4800)) continue;', 'path colour guard'],
  [
    'const endpointAlpha = (positive.alpha + negative.alpha) / 2;\n          const candidateAlpha = Math.min(autoMode ? 156 : 182, Math.round(endpointAlpha * 0.64));',
    'const endpointAlpha = (positive.alpha + negative.alpha) / 2;\n          const gapSpan = positive.step + negative.step;\n          const gapFactor = gapSpan >= 8 ? 0.48 : (gapSpan >= 6 ? 0.56 : 0.64);\n          const candidateAlpha = Math.min(autoMode ? 156 : 182, Math.round(endpointAlpha * gapFactor));',
    'distance-weighted bridge alpha'
  ],
  ['fineStrand ? 0.38 : 0.30,', 'fineStrand ? 0.42 : 0.30,', 'fine strand decontamination cap'],
  ['(1 - nextAlpha / 255) * (fineStrand ? 0.44 : 0.34)', '(1 - nextAlpha / 255) * (fineStrand ? 0.48 : 0.34)', 'fine strand decontamination strength'],
  [
    'const neighborMean = (alphaOut[index - 1] + alphaOut[index + 1] + alphaOut[index - width] + alphaOut[index + width]) / 4;\n      stabilized[index] = Math.max(0, Math.min(255, Math.round(a * 0.88 + neighborMean * 0.12)));',
    'const neighborMean = (alphaOut[index - 1] + alphaOut[index + 1] + alphaOut[index - width] + alphaOut[index + width]) / 4;\n      const stabilizeMix = a < 96 ? 0.06 : 0.12;\n      stabilized[index] = Math.max(0, Math.min(255, Math.round(a * (1 - stabilizeMix) + neighborMean * stabilizeMix)));',
    'low-alpha strand stabilization'
  ],
]);

const hybrid = fs.readFileSync('vite.hybrid-edge-refine.config.js', 'utf8');
const hair = fs.readFileSync('vite.hair-fur-precision-v3.config.js', 'utf8');
if (!hybrid.includes('ADAPTIVE_ALPHA_EDGE_SMOOTHING_V4') || !hybrid.includes('smoothing = 0.50')) throw new Error('Hybrid V4 verification failed');
if (!hair.includes('HAIR_FUR_FINE_DETAIL_PRECISION_V6') || !hair.includes('gapFactor = gapSpan >= 8')) throw new Error('Hair V6 verification failed');
