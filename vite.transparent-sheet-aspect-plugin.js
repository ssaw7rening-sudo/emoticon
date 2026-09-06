const TARGET = "  const aspectLooksLikeSheet = Math.abs(aspect - (5 / 3)) <= 0.16;";
const REPLACEMENT = `  // Support both the original 5:3 sheet canvas and Grok-style 3:2 canvases.\n  // Grid occupancy and seam checks below still have to pass, so ordinary transparent PNGs\n  // are not promoted to emoticon sheets based on aspect ratio alone.\n  const aspectLooksLikeSheet =\n    Math.abs(aspect - (5 / 3)) <= 0.16 ||\n    Math.abs(aspect - (3 / 2)) <= 0.08;`;

export function transparentSheetAspectPlugin() {
  return {
    name: 'transparent-sheet-aspect-plugin',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('/src/components/BackgroundRemover.jsx')) return null;
      if (!code.includes(TARGET)) {
        throw new Error('[transparent-sheet-aspect-plugin] aspect routing target was not found');
      }
      const transformed = code.replace(TARGET, REPLACEMENT);
      if (transformed.includes(TARGET)) {
        throw new Error('[transparent-sheet-aspect-plugin] aspect routing replacement did not complete');
      }
      return { code: transformed, map: null };
    },
  };
}
