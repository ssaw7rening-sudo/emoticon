const TARGET = '/src/components/BackgroundRemover.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[safe-white-sheet-routing] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[safe-white-sheet-routing] ${label} marker is not unique`);
  }
  return source.slice(0, first) + replacement + source.slice(first + marker.length);
};

export function safeWhiteSheetRoutingPlugin() {
  return {
    name: 'safe-white-sheet-routing',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/');
      if (!normalizedId.endsWith(TARGET)) return null;

      const marker = `    if (grid.looksLikeGrid) {\n      return {\n        kind: 'solid-sheet',\n        confidence: 0.92,\n        width,\n        height,\n        background: estimate.bg,\n        tolerance: estimate.tolerance,\n        grid,\n      };\n    }`;

      const replacement = `${marker}\n\n    // Conservative rescue path for AI-generated 5x3 sticker sheets on a nearly pure-white backdrop.\n    // The normal strict classifier above remains the default. This fallback is intentionally narrow\n    // so ordinary photos and already-detected sheets continue through their existing paths unchanged.\n    const [bgR = 0, bgG = 0, bgB = 0] = estimate.bg || [];\n    const bgLuminance = bgR * 0.2126 + bgG * 0.7152 + bgB * 0.0722;\n    const bgChroma = Math.max(bgR, bgG, bgB) - Math.min(bgR, bgG, bgB);\n    const nearPureWhite =\n      bgLuminance >= 242 &&\n      bgChroma <= 14 &&\n      estimate.tolerance <= 34;\n\n    if (nearPureWhite) {\n      const looseOccupied = grid.ratios.filter((ratio) => ratio >= 0.008 && ratio <= 0.68).length;\n      const looseRows = [0, 1, 2].map((row) =>\n        grid.ratios.slice(row * 5, row * 5 + 5).filter((ratio) => ratio >= 0.008 && ratio <= 0.68).length\n      );\n      const meanForegroundRatio = grid.ratios.reduce((sum, ratio) => sum + ratio, 0) / 15;\n      const looksLikeWhiteStickerSheet =\n        looseOccupied >= 11 &&\n        looseRows.every((count) => count >= 3) &&\n        grid.seamForegroundRatio <= 0.50 &&\n        meanForegroundRatio >= 0.025 &&\n        meanForegroundRatio <= 0.55;\n\n      if (looksLikeWhiteStickerSheet) {\n        return {\n          kind: 'solid-sheet',\n          confidence: 0.78,\n          width,\n          height,\n          background: estimate.bg,\n          tolerance: estimate.tolerance,\n          grid,\n          routingFallback: 'near-pure-white-5x3-sticker-sheet',\n        };\n      }\n    }`;

      const out = replaceOnce(code, marker, replacement, 'solid sheet routing');
      if (!out.includes("routingFallback: 'near-pure-white-5x3-sticker-sheet'")) {
        throw new Error('[safe-white-sheet-routing] fallback was not injected');
      }
      return { code: out, map: null };
    },
  };
}
