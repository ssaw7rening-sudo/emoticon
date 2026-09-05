const TARGET = '/src/App.jsx';

export function mainAdCleanupPlugin() {
  return {
    name: 'main-ad-cleanup',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/');
      if (!normalizedId.endsWith(TARGET)) return null;

      const configMarker = `const ADSENSE_CLIENT_ID = 'ca-pub-2418297087346563';\nconst IS_AD_CONFIGURED = ADSENSE_CLIENT_ID !== 'ca-pub-0000000000000000';`;
      const configReplacement = `const ADSENSE_CLIENT_ID = 'ca-pub-2418297087346563';\nconst MAIN_AD_SLOT = import.meta.env.VITE_ADSENSE_MAIN_SLOT || '';\nconst IS_AD_CONFIGURED = Boolean(MAIN_AD_SLOT);`;
      const slotMarker = 'data-ad-slot="1234567890"';
      const slotReplacement = 'data-ad-slot={MAIN_AD_SLOT}';

      let out = code;

      if (out.includes(configMarker)) {
        out = out.replace(configMarker, configReplacement);
      } else if (!out.includes('const MAIN_AD_SLOT = import.meta.env.VITE_ADSENSE_MAIN_SLOT')) {
        throw new Error('[main-ad-cleanup] AdSense config marker not found');
      }

      if (out.includes(slotMarker)) {
        out = out.replace(slotMarker, slotReplacement);
      } else if (!out.includes(slotReplacement)) {
        throw new Error('[main-ad-cleanup] temporary main ad slot marker not found');
      }

      if (out.includes('data-ad-slot="1234567890"')) {
        throw new Error('[main-ad-cleanup] temporary slot 1234567890 still exists');
      }

      return { code: out, map: null };
    },
  };
}
