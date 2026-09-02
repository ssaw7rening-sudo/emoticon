import fs from 'node:fs';

const file = 'vite.always-split-menu.config.js';
let source = fs.readFileSync(file, 'utf8');

function replaceOnce(oldText, newText, label) {
  const first = source.indexOf(oldText);
  if (first < 0) throw new Error(`Missing patch anchor: ${label}`);
  if (source.indexOf(oldText, first + oldText.length) >= 0) throw new Error(`Patch anchor is not unique: ${label}`);
  source = source.slice(0, first) + newText + source.slice(first + oldText.length);
}

replaceOnce(
  "name: 'always-available-sticker-split-menu-v2-force-manual'",
  "name: 'always-available-sticker-split-menu-v3-watershed-compatible'",
  'plugin version'
);

replaceOnce(
  `      // Manual split is an explicit user instruction. It must not be blocked by\n      // the automatic sheet-classifier thresholds. Keep the same content/pixel\n      // ownership splitter, but use the canonical 5×3 seed centres when forcing\n      // a split. This is still not rectangular cell cropping: each foreground\n      // pixel is assigned to its nearest seed and the final PNG is cropped only\n      // to that group's actual content bounds.`,
  `      // Manual split is an explicit user instruction. It must not be blocked by\n      // the automatic sheet-classifier thresholds. Keep the same object-aware\n      // watershed ownership for both automatic and manual splitting; force mode\n      // only bypasses classifier reliability gates and never downgrades ownership\n      // to rectangular cells or nearest-centre Voronoi slicing.`,
  'manual split ownership comment'
);

const analysisBlockStart = source.indexOf('      const analysisGate = `');
const reliabilityGateMarker = `      replaceOnce(\n        "  if (detectedGroups < 12) throw new Error('Could not reliably separate sticker content groups');"`;
const analysisBlockEnd = source.indexOf(reliabilityGateMarker, analysisBlockStart);
if (analysisBlockStart < 0 || analysisBlockEnd < 0) {
  throw new Error('Could not locate split-menu analysis compatibility block');
}

const newAnalysisBlock = [
  '      const analysisGate = `  const analysis = analyzeStickerContentGroups(canvas);',
  "  if (!analysis || analysis.nonEmpty < 12) throw new Error('Could not reliably detect 15 sticker groups');`",
  '      const forceAwareAnalysisGate = `  const analysis = analyzeStickerContentGroups(canvas);',
  "  if (!analysis) throw new Error('Could not analyze sticker layout');",
  "  if (!force && analysis.nonEmpty < 12) throw new Error('Could not reliably detect 15 sticker groups');`",
  "      replaceOnce(analysisGate, forceAwareAnalysisGate, 'automatic detection gate')",
  '',
  "      // Object ownership is supplied by the precise splitter's watershed map.",
  '      // Do not rewrite it for force/manual mode.',
  '',
].join('\n');
source = source.slice(0, analysisBlockStart) + newAnalysisBlock + source.slice(analysisBlockEnd);

replaceOnce(
  `        // If automatic classification said “sheet” but its adaptive centres still\n        // produce an unreliable grouping, retry once with the stable 5×3 seeds.\n        // A direct/manual split already uses those seeds, so do not repeat it.`,
  `        // If automatic classification said “sheet” but reliability gating still\n        // rejects the split, retry once in force mode. Ownership remains the same\n        // object-aware watershed map; only the classifier gate is bypassed.`,
  'fallback comment'
);

replaceOnce(
  `        console.warn('Adaptive sticker split failed; retrying with direct 5x3 pixel ownership:', primarySplitError);`,
  `        console.warn('Adaptive sticker split failed; retrying with forced object-aware ownership:', primarySplitError);`,
  'fallback warning'
);

if (!source.includes("always-available-sticker-split-menu-v3-watershed-compatible")) throw new Error('Version marker was not applied');
if (source.includes("'pixel ownership centres'")) throw new Error('Legacy pixel ownership rewrite still exists');
if (source.includes('ownershipCenters')) throw new Error('Legacy ownershipCenters variable still exists');
if (!source.includes('Object ownership is supplied by the precise splitter')) throw new Error('Watershed compatibility comment missing');

fs.writeFileSync(file, source);
