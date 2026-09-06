const TARGET = "  const aspectLooksLikeSheet = Math.abs(aspect - (5 / 3)) <= 0.16;";
const REPLACEMENT = `  // Support both the original 5:3 sheet canvas and common 3:2 AI outputs\n  // such as 1536×1024. Aspect ratio alone never classifies an image as a sheet:\n  // the existing 15-cell occupancy, row distribution and seam checks must still pass.\n  const aspectLooksLikeSheet =\n    Math.abs(aspect - (5 / 3)) <= 0.16 ||\n    Math.abs(aspect - (3 / 2)) <= 0.08;`;

export function transparentSheetAspectPlugin() {
  return {
    name: 'sheet-aspect-3x2-plugin',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('/src/components/BackgroundRemover.jsx')) return null;
      if (!code.includes(TARGET)) {
        throw new Error('[sheet-aspect-3x2-plugin] aspect routing target was not found');
      }
      const transformed = code.replace(TARGET, REPLACEMENT);
      if (transformed.includes(TARGET) || !transformed.includes('Math.abs(aspect - (3 / 2)) <= 0.08')) {
        throw new Error('[sheet-aspect-3x2-plugin] 3:2 routing replacement did not complete');
      }
      return { code: transformed, map: null };
    },
  };
}
