import fs from 'node:fs';

const file = 'vite.hair-fur-precision-v3.config.js';
let source = fs.readFileSync(file, 'utf8');

function replaceOnce(from, to, label) {
  const first = source.indexOf(from);
  if (first < 0) throw new Error(`Missing anchor: ${label}`);
  if (source.indexOf(from, first + from.length) >= 0) throw new Error(`Non-unique anchor: ${label}`);
  source = source.slice(0, first) + to + source.slice(first + from.length);
}

replaceOnce("name: 'hair-fur-fine-detail-precision-v3'", "name: 'hair-fur-fine-detail-precision-v4'", 'plugin version');
replaceOnce('// HAIR_FUR_FINE_DETAIL_PRECISION_V3', '// HAIR_FUR_FINE_DETAIL_PRECISION_V4', 'helper version');
replaceOnce('const analysisMax = mobileLike ? 760 : 1100;', 'const analysisMax = mobileLike ? 840 : 1280;', 'analysis resolution');

replaceOnce(
`      const currentAlpha = alphaOut[index];\n      if (currentAlpha >= 250) continue;`,
`      const currentAlpha = alphaOut[index];\n      if (currentAlpha >= 250) continue;\n\n      // HAIR_FUR_CONTINUITY_RESCUE_V4\n      // A one-pixel gap inside a real strand should have foreground support on\n      // opposite sides. This lets us rescue broken hairs without reviving isolated\n      // background speckles that happen to have a similar colour.\n      const leftAlpha = alphaOut[index - 1];\n      const rightAlpha = alphaOut[index + 1];\n      const upAlpha = alphaOut[index - width];\n      const downAlpha = alphaOut[index + width];\n      const upLeftAlpha = alphaOut[index - width - 1];\n      const upRightAlpha = alphaOut[index - width + 1];\n      const downLeftAlpha = alphaOut[index + width - 1];\n      const downRightAlpha = alphaOut[index + width + 1];\n      const continuitySupport = Math.max(\n        Math.min(leftAlpha, rightAlpha),\n        Math.min(upAlpha, downAlpha),\n        Math.min(upLeftAlpha, downRightAlpha),\n        Math.min(upRightAlpha, downLeftAlpha)\n      );\n      let nearbyStrandSupport = 0;\n      if (leftAlpha >= 42) nearbyStrandSupport += 1;\n      if (rightAlpha >= 42) nearbyStrandSupport += 1;\n      if (upAlpha >= 42) nearbyStrandSupport += 1;\n      if (downAlpha >= 42) nearbyStrandSupport += 1;\n      if (upLeftAlpha >= 42) nearbyStrandSupport += 1;\n      if (upRightAlpha >= 42) nearbyStrandSupport += 1;\n      if (downLeftAlpha >= 42) nearbyStrandSupport += 1;\n      if (downRightAlpha >= 42) nearbyStrandSupport += 1;\n      const bridgeLike = currentAlpha <= 18 && continuitySupport >= 64;\n      const supportedStrand = nearbyStrandSupport >= 2 || continuitySupport >= 48;`,
'continuity support');

replaceOnce(
`      // Rescue a nearly-lost filament only when original RGB is clearly closer to\n      // foreground than background. This avoids restoring broad background halos.\n      if (currentAlpha <= 24 && fgAdvantage >= 1.55 && colorAlpha >= 110) {\n        const rescueStrength = 0.56 + confidence * 0.20;\n        nextAlpha = Math.max(currentAlpha, Math.min(188, Math.round(colorAlpha * rescueStrength)));\n      } else if (currentAlpha < 220) {`,
`      // Rescue nearly-lost filaments using both source colour and local strand\n      // continuity. Supported one-pixel gaps may use a lower colour threshold; an\n      // isolated pixel still needs very strong foreground evidence.\n      const bridgeRescue = bridgeLike && fgAdvantage >= 1.28 && colorAlpha >= 82;\n      const supportedRescue = currentAlpha <= 30 && supportedStrand && fgAdvantage >= 1.38 && colorAlpha >= 92;\n      const isolatedStrongRescue = currentAlpha <= 24 && fgAdvantage >= 1.72 && colorAlpha >= 118;\n      if (bridgeRescue || supportedRescue || isolatedStrongRescue) {\n        const continuityBoost = bridgeRescue ? 0.12 : (supportedRescue ? 0.07 : 0);\n        const rescueStrength = Math.min(0.88, 0.60 + confidence * 0.22 + continuityBoost);\n        nextAlpha = Math.max(currentAlpha, Math.min(202, Math.round(colorAlpha * rescueStrength)));\n      } else if (currentAlpha < 220) {`,
'filament rescue');

replaceOnce(
`      if (nextAlpha > 7 && nextAlpha < 244) {\n        const pull = Math.min(0.30, (1 - nextAlpha / 255) * 0.34);\n        sourcePixels[p] = Math.round(sourcePixels[p] * (1 - pull) + fgR * pull);\n        sourcePixels[p + 1] = Math.round(sourcePixels[p + 1] * (1 - pull) + fgG * pull);\n        sourcePixels[p + 2] = Math.round(sourcePixels[p + 2] * (1 - pull) + fgB * pull);\n      }`,
`      if (nextAlpha > 7 && nextAlpha < 244) {\n        // Low-alpha supported strands carry more of the old background colour, so\n        // decontaminate them a little more while leaving ordinary edges unchanged.\n        const fineStrand = nextAlpha < 136 && supportedStrand;\n        const pull = Math.min(\n          fineStrand ? 0.38 : 0.30,\n          (1 - nextAlpha / 255) * (fineStrand ? 0.44 : 0.34)\n        );\n        sourcePixels[p] = Math.round(sourcePixels[p] * (1 - pull) + fgR * pull);\n        sourcePixels[p + 1] = Math.round(sourcePixels[p + 1] * (1 - pull) + fgG * pull);\n        sourcePixels[p + 2] = Math.round(sourcePixels[p + 2] * (1 - pull) + fgB * pull);\n      }`,
'edge colour decontamination');

if (!source.includes('HAIR_FUR_FINE_DETAIL_PRECISION_V4')) throw new Error('V4 helper marker missing');
if (!source.includes('HAIR_FUR_CONTINUITY_RESCUE_V4')) throw new Error('Continuity rescue marker missing');
if (!source.includes('const bridgeRescue = bridgeLike')) throw new Error('Bridge rescue missing');
if (!source.includes('fineStrand ? 0.38 : 0.30')) throw new Error('Fine strand decontamination missing');
if (!source.includes('mobileLike ? 840 : 1280')) throw new Error('Higher detail analysis resolution missing');

fs.writeFileSync(file, source);
