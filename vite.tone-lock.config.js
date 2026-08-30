import { defineConfig } from 'vite'
import baseConfig from './vite.portrait-precision.config.js'

function originalToneLock() {
  return {
    name: 'original-rgb-tone-lock',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')
      const helperPattern = /\/\/ FOREGROUND_TONE_PRESERVATION_V1[\s\S]*?(?=\/\/ MOBILE_BG_REMOVAL_STABILITY_V3)/
      if (!helperPattern.test(transformed)) {
        throw new Error('[tone-lock] Existing tone preservation helper was not found')
      }

      const helper = `// FOREGROUND_TONE_PRESERVATION_V3
async function restoreSolidForegroundOpacity(sourceFile, matteBlob) {
  const sourceUrl = URL.createObjectURL(sourceFile);
  const matteUrl = URL.createObjectURL(matteBlob);

  const loadImage = (url) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Tone-lock image decode failed'));
    image.src = url;
  });

  try {
    const [sourceImage, matteImage] = await Promise.all([
      loadImage(sourceUrl),
      loadImage(matteUrl)
    ]);

    const width = sourceImage.naturalWidth || sourceImage.width;
    const height = sourceImage.naturalHeight || sourceImage.height;
    if (!width || !height || width < 5 || height < 5) return matteBlob;

    // Keep the source image in a color-managed canvas. On wide-gamut phones,
    // Display-P3 prevents the default sRGB canvas from muting the original tone.
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = width;
    sourceCanvas.height = height;

    const wantsP3 =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(color-gamut: p3)').matches;

    let sourceCtx = null;
    if (wantsP3) {
      try {
        sourceCtx = sourceCanvas.getContext('2d', {
          alpha: true,
          colorSpace: 'display-p3'
        });
      } catch (error) {
        sourceCtx = null;
      }
    }
    if (!sourceCtx) sourceCtx = sourceCanvas.getContext('2d', { alpha: true });
    if (!sourceCtx) return matteBlob;

    sourceCtx.imageSmoothingEnabled = true;
    sourceCtx.imageSmoothingQuality = 'high';
    sourceCtx.drawImage(sourceImage, 0, 0, width, height);

    // The AI output is used only for alpha. Its RGB never touches the source.
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
    if (!maskCtx) return matteBlob;
    maskCtx.imageSmoothingEnabled = true;
    maskCtx.imageSmoothingQuality = 'high';
    maskCtx.drawImage(matteImage, 0, 0, width, height);

    // Harden only interior matte pixels. A nearby weak-alpha pixel marks a true
    // contour, so hair strands and antialiased edges remain soft.
    const maskImageData = maskCtx.getImageData(0, 0, width, height);
    const maskPixels = maskImageData.data;
    const alphaSource = new Uint8ClampedArray(width * height);
    for (let i = 0; i < alphaSource.length; i += 1) {
      alphaSource[i] = maskPixels[i * 4 + 3];
    }

    const offsets = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [1, -1], [-1, 1], [1, 1],
      [-2, 0], [2, 0], [0, -2], [0, 2]
    ];

    for (let y = 2; y < height - 2; y += 1) {
      for (let x = 2; x < width - 2; x += 1) {
        const index = y * width + x;
        const alpha = alphaSource[index];
        if (alpha < 165 || alpha >= 255) continue;

        let minNearby = 255;
        let sumNearby = 0;
        let weakNearby = 0;
        for (const [dx, dy] of offsets) {
          const nearby = alphaSource[(y + dy) * width + (x + dx)];
          if (nearby < minNearby) minNearby = nearby;
          sumNearby += nearby;
          if (nearby < 112) weakNearby += 1;
        }

        const avgNearby = sumNearby / offsets.length;
        let nextAlpha = alpha;
        if (alpha >= 190 && minNearby >= 128 && avgNearby >= 190 && weakNearby === 0) {
          nextAlpha = 255;
        } else if (alpha >= 165 && minNearby >= 116 && avgNearby >= 178 && weakNearby <= 1) {
          nextAlpha = Math.min(255, Math.round(alpha + (255 - alpha) * 0.92));
        }

        if (nextAlpha > alpha) maskPixels[index * 4 + 3] = nextAlpha;
      }
    }

    maskCtx.putImageData(maskImageData, 0, 0);

    // destination-in multiplies only alpha coverage. The source RGB/color space
    // remains untouched, unlike getImageData/putImageData round-tripping.
    sourceCtx.save();
    sourceCtx.globalCompositeOperation = 'destination-in';
    sourceCtx.drawImage(maskCanvas, 0, 0, width, height);
    sourceCtx.restore();

    return canvasToPngBlob(sourceCanvas);
  } finally {
    URL.revokeObjectURL(sourceUrl);
    URL.revokeObjectURL(matteUrl);
  }
}

`

      transformed = transformed.replace(helperPattern, helper)
      transformed = transformed.replace(
        /restoreSolidForegroundOpacity\(blob\)/g,
        'restoreSolidForegroundOpacity(file, blob)'
      )
      transformed = transformed.replace(
        /restoreSolidForegroundOpacity\(precisionBlob\)/g,
        'restoreSolidForegroundOpacity(file, precisionBlob)'
      )

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), originalToneLock()],
})
