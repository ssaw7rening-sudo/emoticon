import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function preservePrecisionBackgroundRemovalRgb() {
  const replacements = [
    [
      'async function cleanAiForegroundArtifacts(blob) {',
      'async function cleanAiForegroundArtifacts(blob, preserveRgb = false) {'
    ],
    [
      '      if (!count) continue;\n      const mix = Math.min(0.42, ((218 - alpha) / 186) * 0.42);',
      '      if (!count) continue;\n      if (preserveRgb) continue;\n      const mix = Math.min(0.42, ((218 - alpha) / 186) * 0.42);'
    ],
    [
      'async function refinePrecisionEdges(blob) {',
      'async function refinePrecisionEdges(blob, preserveRgb = false) {'
    ],
    [
      '      if (nextAlpha > 0 && confidentCount > 0) {',
      '      if (!preserveRgb && nextAlpha > 0 && confidentCount > 0) {'
    ],
    [
      '      precisionBlob = await cleanAiForegroundArtifacts(precisionBlob);',
      '      precisionBlob = await cleanAiForegroundArtifacts(precisionBlob, true);'
    ],
    [
      '      precisionBlob = await refinePrecisionEdges(precisionBlob);',
      '      precisionBlob = await refinePrecisionEdges(precisionBlob, true);'
    ],
    [
      'async function splitIntoFifteen(blob) {',
      `function getDetectedStickerCellBounds(primaries, index, width, height) {
  const row = Math.floor(index / 5);
  const column = index % 5;
  const primary = primaries[index];
  const left = column > 0 ? primaries[index - 1] : null;
  const right = column < 4 ? primaries[index + 1] : null;
  const above = row > 0 ? primaries[index - 5] : null;
  const below = row < 2 ? primaries[index + 5] : null;

  // Use the midpoint between detected sticker centers as a soft cell boundary.
  // This is layout-aware rather than a fixed grid, so shifted rows/columns still work.
  const minX = left ? Math.max(0, Math.floor((left.centerX + primary.centerX) / 2)) : 0;
  const maxX = right ? Math.min(width - 1, Math.ceil((primary.centerX + right.centerX) / 2)) : width - 1;
  const minY = above ? Math.max(0, Math.floor((above.centerY + primary.centerY) / 2)) : 0;
  const maxY = below ? Math.min(height - 1, Math.ceil((primary.centerY + below.centerY) / 2)) : height - 1;

  return { minX, minY, maxX, maxY };
}

async function splitIntoFifteen(blob) {`
    ],
    [
      `    const primary = primaries[index];
    const group = groups.get(primary.id) || [primary];
    const minX = Math.max(0, Math.min(...group.map((item) => item.minX)) - padding);
    const minY = Math.max(0, Math.min(...group.map((item) => item.minY)) - padding);
    const maxX = Math.min(width - 1, Math.max(...group.map((item) => item.maxX)) + padding);
    const maxY = Math.min(height - 1, Math.max(...group.map((item) => item.maxY)) + padding);`,
      `    const primary = primaries[index];
    const group = groups.get(primary.id) || [primary];
    const cell = getDetectedStickerCellBounds(primaries, index, width, height);

    // A nearby detached hand, text glyph or effect can be assigned to the wrong
    // primary by the distance matcher. Keep only component centers that belong
    // to this detected cell, then clamp the crop to the same cell boundary.
    const safeGroup = group.filter((item) =>
      item.id === primary.id ||
      (item.centerX >= cell.minX && item.centerX <= cell.maxX &&
       item.centerY >= cell.minY && item.centerY <= cell.maxY)
    );
    const cropGroup = safeGroup.length ? safeGroup : [primary];
    const minX = Math.max(cell.minX, Math.min(...cropGroup.map((item) => item.minX)) - padding);
    const minY = Math.max(cell.minY, Math.min(...cropGroup.map((item) => item.minY)) - padding);
    const maxX = Math.min(cell.maxX, Math.max(...cropGroup.map((item) => item.maxX)) + padding);
    const maxY = Math.min(cell.maxY, Math.max(...cropGroup.map((item) => item.maxY)) + padding);`
    ]
  ]

  return {
    name: 'preserve-precision-background-removal-rgb',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')
      for (const [from, to] of replacements) {
        if (!transformed.includes(from)) {
          throw new Error(`[precision-rgb] Expected BackgroundRemover source pattern was not found: ${from}`)
        }
        transformed = transformed.replace(from, to)
      }

      return { code: transformed, map: null }
    }
  }
}

// Keep precision background-removal post-processing alpha-only so the original
// image RGB values are not blended or dulled at foreground edges. Auto-split
// also uses detected center midpoints to prevent neighboring stickers leaking
// into each other's crops.
export default defineConfig({
  plugins: [preservePrecisionBackgroundRemovalRgb(), react()],
})
