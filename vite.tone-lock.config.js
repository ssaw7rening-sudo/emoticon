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

      const helper = `// FOREGROUND_TONE_PRESERVATION_V2
async function restoreSolidForegroundOpacity(sourceFile, matteBlob) {
  const { canvas: sourceCanvas, ctx: sourceCtx } = await drawFileToCanvas(sourceFile);
  const { canvas: matteCanvas } = await drawFileToCanvas(matteBlob);
  const { width, height } = sourceCanvas;
  if (!width || !height || width < 5 || height < 5) return matteBlob;

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
  if (!maskCtx) return matteBlob;
  maskCtx.imageSmoothingEnabled = true;
  maskCtx.imageSmoothingQuality = 'high';
  maskCtx.drawImage(matteCanvas, 0, 0, width, height);

  const sourceData = sourceCtx.getImageData(0, 0, width, height);
  const maskData = maskCtx.getImageData(0, 0, width, height).data;
  const pixels = sourceData.data;
  const alphaSource = new Uint8ClampedArray(width * height);

  // Use the model output strictly as an alpha matte. RGB always comes from the
  // original file, so skin, clothing and product colors cannot shift darker.
  for (let i = 0; i < width * height; i += 1) {
    const p = i * 4;
    const originalAlpha = pixels[p + 3];
    const matteAlpha = maskData[p + 3];
    const alpha = Math.round((originalAlpha * matteAlpha) / 255);
    pixels[p + 3] = alpha;
    alphaSource[i] = alpha;
  }

  const offsets = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [1, -1], [-1, 1], [1, 1],
    [-2, 0], [2, 0], [0, -2], [0, 2]
  ];

  // Restore only solid subject interiors. Any nearby low-alpha sample marks a
  // real edge, so hair strands and antialiased contours keep their soft matte.
  for (let y = 2; y < height - 2; y += 1) {
    for (let x = 2; x < width - 2; x += 1) {
      const index = y * width + x;
      const alpha = alphaSource[index];
      if (alpha < 185 || alpha >= 255) continue;

      let minNearby = 255;
      let sumNearby = 0;
      let solidNearby = 0;
      for (const [dx, dy] of offsets) {
        const nearby = alphaSource[(y + dy) * width + (x + dx)];
        if (nearby < minNearby) minNearby = nearby;
        sumNearby += nearby;
        if (nearby >= 205) solidNearby += 1;
      }

      const avgNearby = sumNearby / offsets.length;
      let nextAlpha = alpha;
      if (alpha >= 205 && minNearby >= 170 && avgNearby >= 210 && solidNearby >= 9) {
        nextAlpha = 255;
      } else if (alpha >= 185 && minNearby >= 165 && avgNearby >= 200 && solidNearby >= 8) {
        nextAlpha = Math.min(255, Math.round(alpha + (255 - alpha) * 0.85));
      }

      if (nextAlpha > alpha) pixels[index * 4 + 3] = nextAlpha;
    }
  }

  sourceCtx.putImageData(sourceData, 0, 0);
  return canvasToPngBlob(sourceCanvas);
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
