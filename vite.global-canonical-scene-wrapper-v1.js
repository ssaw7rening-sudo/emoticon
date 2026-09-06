import { globalCanonicalPromptSchemaV1Plugin } from './vite.global-canonical-prompt-schema-v1.js';

const resultCode = (result, fallback) => {
  if (typeof result === 'string') return result;
  if (result && typeof result.code === 'string') return result.code;
  return fallback;
};

export function globalCanonicalSceneWrapperV1Plugin(scenePlugin) {
  const canonicalPlugin = globalCanonicalPromptSchemaV1Plugin();

  return {
    name: 'global-canonical-scene-wrapper-v1',
    enforce: 'pre',
    async transform(code, id) {
      let out = code;
      let sceneResult = null;

      if (scenePlugin?.transform) {
        sceneResult = await scenePlugin.transform.call(this, out, id);
        out = resultCode(sceneResult, out);
      }

      const canonicalResult = await canonicalPlugin.transform.call(this, out, id);
      if (canonicalResult) return canonicalResult;
      return sceneResult;
    },
  };
}
