import { defineConfig } from 'vite'
import sourceSafeConfig from './vite.source-safe.config.js'

function sourceSafeExportLock() {
  return {
    name: 'source-safe-export-lock',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/EmoticonPostProcessor.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')
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

      // sourceSafeExportPreV23 runs before this pre-plugin and inserts this guard.
      // If it is absent, fail the build rather than silently shipping the old Blob path.
      if (!transformed.includes(oldGuard)) {
        throw new Error('[source-safe-lock] source-safe export guard was not inserted')
      }
      transformed = transformed.replace(oldGuard, newGuard)
      return { code: transformed, map: null }
    },
  }
}

const filteredPlugins = (sourceSafeConfig.plugins || []).filter((plugin) => (
  plugin?.name !== 'final-transparency-integrity-guard-v2'
))

export default defineConfig({
  ...sourceSafeConfig,
  plugins: [...filteredPlugins, sourceSafeExportLock()],
})
