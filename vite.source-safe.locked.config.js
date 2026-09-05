import { defineConfig } from 'vite'
import sourceSafeConfig from './vite.source-safe.config.js'

function sourceSafeRuntimeLock() {
  return {
    name: 'source-safe-runtime-lock',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      let transformed = code.replace(/\r\n/g, '\n')

      if (normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) {
        const autoStart = transformed.indexOf('  const autoSplit = async () => {')
        const autoEnd = transformed.indexOf('\n\n  autoSplitCallbackRef.current = autoSplit;', autoStart)
        if (autoStart < 0 || autoEnd < 0) {
          throw new Error('[source-safe-lock] autoSplit boundaries not found')
        }

        const replacement = `  const autoSplit = async () => {
    if (!resultBlob || splitting || qualityAssessment.status === 'fail') return;
    clearSplitItems();
    setSplitting(true);
    setSplitError('');
    try {
      const sourceLock = 'AUTO_SPLIT_ORIGINAL_SOURCE_LOCK';
      void sourceLock;
      const items = await splitIntoFifteen(resultBlob, file);
      if (!items || items.length !== 15) {
        throw new Error('Could not create 15 sticker outputs');
      }
      const hasSourceSafeItems = items.some((item) => item?.splitEngine === 'SRC23');
      if (hasSourceSafeItems) {
        const invalid = items.find((item) => (
          item?.splitEngine !== 'SRC23' ||
          !item?.pixelSafe ||
          !item?.pixelData ||
          !item?.pixelWidth ||
          !item?.pixelHeight ||
          item.pixelData.length !== item.pixelWidth * item.pixelHeight * 4
        ));
        if (invalid) throw new Error('Original-source RGBA payload was lost before finish stage');
      }
      const withUrls = items.map((item) => ({ ...item, url: URL.createObjectURL(item.blob) }));
      setSplitItems(withUrls);
      setTimeout(() => {
        splitCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    } catch (e) {
      console.error('Sticker auto split failed:', e);
      setSplitError(\`${'${t.splitFailed}'} [원인: ${'${e?.message || String(e)}'}]\`);
    } finally {
      setSplitting(false);
    }
  };`

        transformed = transformed.slice(0, autoStart) + replacement + transformed.slice(autoEnd)
        return { code: transformed, map: null }
      }

      if (normalizedId.endsWith('/src/components/EmoticonPostProcessor.jsx')) {
        const oldGuard = `  if (!item?.pixelSafe || !pixels || !sourceWidth || !sourceHeight || pixels.length !== sourceWidth * sourceHeight * 4) {
    return makeOutput(item.blob, transform, outputScale);
  }`
        const newGuard = `  const sourceSafeRequired = item?.splitEngine === 'SRC23';
  const sourceSafeValid = Boolean(
    item?.pixelSafe && pixels && sourceWidth && sourceHeight &&
    pixels.length === sourceWidth * sourceHeight * 4
  );
  if (sourceSafeRequired && !sourceSafeValid) {
    throw new Error('SOURCE_SAFE_EXPORT_LOCK: original RGBA payload is missing');
  }
  if (!sourceSafeValid) {
    return makeOutput(item.blob, transform, outputScale);
  }
  const exportLock = 'SOURCE_SAFE_EXPORT_LOCK';
  void exportLock;`
        if (!transformed.includes(oldGuard)) {
          throw new Error('[source-safe-lock] export guard anchor not found')
        }
        transformed = transformed.replace(oldGuard, newGuard)
        return { code: transformed, map: null }
      }

      return null
    },
  }
}

const filteredPlugins = (sourceSafeConfig.plugins || []).filter((plugin) => (
  plugin?.name !== 'final-transparency-integrity-guard-v2'
))

export default defineConfig({
  ...sourceSafeConfig,
  plugins: [...filteredPlugins, sourceSafeRuntimeLock()],
})
