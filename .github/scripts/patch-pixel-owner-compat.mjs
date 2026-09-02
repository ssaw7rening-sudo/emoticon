import fs from 'node:fs';

const file = 'vite.pixel-owner-split.config.js';
let source = fs.readFileSync(file, 'utf8');

function replaceOnce(oldText, newText, label) {
  const first = source.indexOf(oldText);
  if (first < 0) throw new Error(`Missing patch anchor: ${label}`);
  if (source.indexOf(oldText, first + oldText.length) >= 0) throw new Error(`Patch anchor is not unique: ${label}`);
  source = source.slice(0, first) + newText + source.slice(first + oldText.length);
}

replaceOnce(
  "name: 'pixel-ownership-sticker-split-v7'",
  "name: 'pixel-ownership-sticker-split-v8-watershed-compatible'",
  'plugin version'
);

replaceOnce(
  `      // Only replace the v6 content-group ownership path. If another unrelated\n      // function with the same local name ever appears, leave it untouched.\n      if (!currentBlock || !currentBlock.includes('analysis.componentGroup')) {\n        throw new Error('[pixel-owner-split] Component ownership function was not found')\n      }\n`,
  `      // The precise splitter v7 already provides an object-aware watershed\n      // ownership map. Preserve it exactly; this legacy compatibility transform\n      // must never downgrade it back to nearest-centre Voronoi ownership.\n      if (!currentBlock) {\n        throw new Error('[pixel-owner-split] Sticker ownership function was not found')\n      }\n      if (currentBlock.includes('analysis.pixelGroup')) {\n        return null\n      }\n\n      // Backward compatibility only for the older v6 component-group path.\n      if (!currentBlock.includes('analysis.componentGroup')) {\n        throw new Error('[pixel-owner-split] Component ownership function was not found')\n      }\n`,
  'ownership compatibility gate'
);

if (!source.includes("pixel-ownership-sticker-split-v8-watershed-compatible")) throw new Error('Version marker was not applied');
if (!source.includes("currentBlock.includes('analysis.pixelGroup')")) throw new Error('Watershed preservation gate was not applied');

fs.writeFileSync(file, source);
