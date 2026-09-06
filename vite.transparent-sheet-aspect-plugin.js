const ASPECT_TARGET = "  const aspectLooksLikeSheet = Math.abs(aspect - (5 / 3)) <= 0.16;";
const ASPECT_REPLACEMENT = `  const aspectLooksLikeSheet = Math.abs(aspect - (5 / 3)) <= 0.16;\n  // Some AI image outputs use a 1536×1024 (3:2) transparent canvas for a 5×3 sticker sheet.\n  // Only transparent-sheet routing may use this wider candidate range. Solid-background\n  // sheets and ordinary images keep the original 5:3 rule.\n  const aspectLooksLikeTransparentSheet =\n    aspectLooksLikeSheet || Math.abs(aspect - (3 / 2)) <= 0.08;`;

const SIGNATURE_TARGET = "  const measureGrid = (isForeground) => {";
const SIGNATURE_REPLACEMENT = "  const measureGrid = (isForeground, allowThreeByTwo = false) => {";

const GRID_TARGET = `    const looksLikeGrid =\n      aspectLooksLikeSheet &&`;
const GRID_REPLACEMENT = `    const looksLikeGrid =\n      (aspectLooksLikeSheet || (allowThreeByTwo && aspectLooksLikeTransparentSheet)) &&`;

const TRANSPARENT_CALL_TARGET = "    const grid = measureGrid((x, y) => pixels[(y * width + x) * 4 + 3] > 20);";
const TRANSPARENT_CALL_REPLACEMENT = "    const grid = measureGrid((x, y) => pixels[(y * width + x) * 4 + 3] > 20, true);";

export function transparentSheetAspectPlugin() {
  return {
    name: 'transparent-sheet-aspect-plugin',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('/src/components/BackgroundRemover.jsx')) return null;

      for (const target of [ASPECT_TARGET, SIGNATURE_TARGET, GRID_TARGET, TRANSPARENT_CALL_TARGET]) {
        if (!code.includes(target)) {
          throw new Error(`[transparent-sheet-aspect-plugin] required routing target was not found: ${target.slice(0, 48)}`);
        }
      }

      let transformed = code
        .replace(ASPECT_TARGET, ASPECT_REPLACEMENT)
        .replace(SIGNATURE_TARGET, SIGNATURE_REPLACEMENT)
        .replace(GRID_TARGET, GRID_REPLACEMENT)
        .replace(TRANSPARENT_CALL_TARGET, TRANSPARENT_CALL_REPLACEMENT);

      if (
        transformed.includes(SIGNATURE_TARGET) ||
        transformed.includes(TRANSPARENT_CALL_TARGET) ||
        !transformed.includes('aspectLooksLikeTransparentSheet')
      ) {
        throw new Error('[transparent-sheet-aspect-plugin] transparent-only 3:2 routing replacement did not complete');
      }

      return { code: transformed, map: null };
    },
  };
}
