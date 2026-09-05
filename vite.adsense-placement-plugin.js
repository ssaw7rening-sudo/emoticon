const TARGET = '/src/components/BackgroundRemoverLanding.jsx';

export function adsensePlacementPlugin() {
  return {
    name: 'adsense-placement-before-background-howto',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/');
      if (!normalizedId.endsWith(TARGET)) return null;

      let out = code;

      const importMarker = "import BackgroundRemover from './BackgroundRemover.jsx';";
      if (!out.includes("import AdSenseUnit from './AdSenseUnit.jsx';")) {
        if (!out.includes(importMarker)) {
          throw new Error('[adsense-placement] BackgroundRemover import marker not found');
        }
        out = out.replace(
          importMarker,
          `${importMarker}\nimport AdSenseUnit from './AdSenseUnit.jsx';`
        );
      }

      const placementMarker = '        <BackgroundRemover lang={lang} />';
      const adBlock = `${placementMarker}\n\n        <AdSenseUnit\n          slot={import.meta.env.VITE_ADSENSE_BACKGROUND_HOWTO_SLOT || import.meta.env.VITE_ADSENSE_SLOT || ''}\n          className="mx-auto mt-8 max-w-3xl"\n        />`;

      if (!out.includes('data-adsense-placement="background-howto"') && !out.includes('<AdSenseUnit')) {
        if (!out.includes(placementMarker)) {
          throw new Error('[adsense-placement] BackgroundRemover placement marker not found');
        }
        out = out.replace(placementMarker, adBlock);
      }

      if (!out.includes('<AdSenseUnit')) {
        throw new Error('[adsense-placement] AdSense unit was not inserted');
      }

      return { code: out, map: null };
    },
  };
}
