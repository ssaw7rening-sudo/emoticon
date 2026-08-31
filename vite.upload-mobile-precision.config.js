import { defineConfig } from 'vite'
import baseConfig from './vite.processing-feedback.config.js'

function robustImageUploadAndPrewarm() {
  return {
    name: 'robust-image-upload-and-prewarm-v1',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      const oldTypeCheck = `    if (!['image/png', 'image/jpeg', 'image/webp'].includes(nextFile.type)) {
      setError(t.badType);
      return;
    }`

      const robustTypeCheck = `    const declaredType = String(nextFile.type || '').toLowerCase();
    const lowerName = String(nextFile.name || '').toLowerCase();
    const extensionType =
      /\\.png$/i.test(lowerName) ? 'image/png' :
      /\\.(jpg|jpeg|jfif)$/i.test(lowerName) ? 'image/jpeg' :
      /\\.webp$/i.test(lowerName) ? 'image/webp' : '';
    const normalizedDeclaredType =
      declaredType === 'image/jpg' || declaredType === 'image/pjpeg' ? 'image/jpeg' :
      declaredType === 'image/x-png' ? 'image/png' : declaredType;
    const normalizedImageType = ['image/png', 'image/jpeg', 'image/webp'].includes(normalizedDeclaredType)
      ? normalizedDeclaredType
      : extensionType;

    if (!normalizedImageType) {
      setError(t.badType);
      return;
    }

    // Android galleries, messengers and file providers sometimes expose a JPEG
    // as image/jpg or with an empty MIME type. Normalize the File metadata while
    // keeping the original bytes untouched so the rest of the pipeline receives
    // a standards-compliant image type.
    if (nextFile.type !== normalizedImageType && typeof File === 'function') {
      try {
        nextFile = new File([nextFile], nextFile.name || 'image', {
          type: normalizedImageType,
          lastModified: nextFile.lastModified || Date.now()
        });
      } catch (error) {
        console.warn('Image MIME normalization skipped:', error);
      }
    }`

      if (!transformed.includes(oldTypeCheck)) {
        throw new Error('[upload-mobile-precision] Upload type-check anchor was not found')
      }
      transformed = transformed.replace(oldTypeCheck, robustTypeCheck)

      const sourceAnchor = '    setSourceUrl(URL.createObjectURL(nextFile));'
      if (!transformed.includes(sourceAnchor)) {
        throw new Error('[upload-mobile-precision] Source URL anchor was not found')
      }
      transformed = transformed.replace(
        sourceAnchor,
        `${sourceAnchor}\n\n    // Start loading BEN2 shortly after a normal photo is selected. This moves\n    // model download/setup time ahead of the user's Remove Background click.\n    // Transparent sticker sheets skip the warmup because they need no matting.\n    if (typeof scheduleBen2Prewarm === 'function') {\n      const shouldPrewarm = typeof alreadyTransparent === 'boolean' ? !alreadyTransparent : true;\n      if (shouldPrewarm) scheduleBen2Prewarm();\n    }`
      )

      const oldAccept = 'accept="image/png,image/jpeg,image/webp"'
      if (!transformed.includes(oldAccept)) {
        throw new Error('[upload-mobile-precision] File input accept anchor was not found')
      }
      transformed = transformed.replace(
        oldAccept,
        'accept="image/*,.png,.jpg,.jpeg,.jfif,.webp"'
      )

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), robustImageUploadAndPrewarm()],
})
