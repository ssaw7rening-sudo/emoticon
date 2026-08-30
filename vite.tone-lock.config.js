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

      const helper = `// FOREGROUND_TONE_PRESERVATION_V4
async function restoreSolidForegroundOpacity(sourceFile, matteBlob) {
  const sourceUrl = URL.createObjectURL(sourceFile);
  const matteUrl = URL.createObjectURL(matteBlob);

  const loadImage = (url) => new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
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

    // Full-resolution matte used only as alpha; its RGB never touches the source.
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
    if (!maskCtx) return matteBlob;
    maskCtx.imageSmoothingEnabled = true;
    maskCtx.imageSmoothingQuality = 'high';
    maskCtx.drawImage(matteImage, 0, 0, width, height);

    const maskImageData = maskCtx.getImageData(0, 0, width, height);
    const maskPixels = maskImageData.data;

    // Detect distance from true transparent background on a bounded preview.
    // Pixels safely inside the subject become fully opaque regardless of the
    // model's slightly soft alpha. Only the real contour band stays feathered.
    const maxAnalysisDimension = 900;
    const analysisScale = Math.min(1, maxAnalysisDimension / Math.max(width, height));
    const analysisWidth = Math.max(1, Math.round(width * analysisScale));
    const analysisHeight = Math.max(1, Math.round(height * analysisScale));
    const analysisCanvas = document.createElement('canvas');
    analysisCanvas.width = analysisWidth;
    analysisCanvas.height = analysisHeight;
    const analysisCtx = analysisCanvas.getContext('2d', { willReadFrequently: true });
    if (!analysisCtx) return matteBlob;
    analysisCtx.imageSmoothingEnabled = true;
    analysisCtx.imageSmoothingQuality = 'high';
    analysisCtx.drawImage(matteImage, 0, 0, analysisWidth, analysisHeight);

    const analysisPixels = analysisCtx.getImageData(0, 0, analysisWidth, analysisHeight).data;
    const total = analysisWidth * analysisHeight;
    const distance = new Uint8Array(total);
    distance.fill(255);
    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;
    const backgroundSeedAlpha = 44;
    const maxDistance = 8;

    for (let index = 0; index < total; index += 1) {
      if (analysisPixels[index * 4 + 3] <= backgroundSeedAlpha) {
        distance[index] = 0;
        queue[tail++] = index;
      }
    }

    const tryVisit = (index, nextDistance) => {
      if (index < 0 || index >= total) return;
      if (nextDistance >= distance[index] || nextDistance > maxDistance) return;
      distance[index] = nextDistance;
      queue[tail++] = index;
    };

    while (head < tail) {
      const index = queue[head++];
      const currentDistance = distance[index];
      if (currentDistance >= maxDistance) continue;
      const x = index % analysisWidth;
      const y = Math.floor(index / analysisWidth);
      const nextDistance = currentDistance + 1;
      if (x > 0) tryVisit(index - 1, nextDistance);
      if (x + 1 < analysisWidth) tryVisit(index + 1, nextDistance);
      if (y > 0) tryVisit(index - analysisWidth, nextDistance);
      if (y + 1 < analysisHeight) tryVisit(index + analysisWidth, nextDistance);
    }

    const xScale = analysisWidth / width;
    const yScale = analysisHeight / height;
    const solidInteriorDistance = 4;
    const nearInteriorDistance = 3;

    for (let y = 0; y < height; y += 1) {
      const ay = Math.min(analysisHeight - 1, Math.floor(y * yScale));
      for (let x = 0; x < width; x += 1) {
        const ax = Math.min(analysisWidth - 1, Math.floor(x * xScale));
        const interiorDistance = distance[ay * analysisWidth + ax];
        const p = (y * width + x) * 4;
        const alpha = maskPixels[p + 3];
        if (alpha <= 0 || alpha >= 255) continue;

        // Solid opaque subjects such as skin, clothing, products and stickers
        // should not inherit the model's soft interior matte. Keeping a 3-4px
        // analysis-space contour band protects hair strands and antialiasing.
        if (interiorDistance >= solidInteriorDistance && alpha >= 92) {
          maskPixels[p + 3] = 255;
        } else if (interiorDistance >= nearInteriorDistance && alpha >= 150) {
          maskPixels[p + 3] = Math.min(255, Math.round(alpha + (255 - alpha) * 0.94));
        }
      }
    }

    maskCtx.putImageData(maskImageData, 0, 0);

    // destination-in changes coverage only. Source RGB and its color-managed
    // rendering remain untouched from the original image element.
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

      // Preview the transparent result using the original image element for RGB
      // and the generated PNG only as an alpha mask. This avoids the canvas/PNG
      // color conversion path in the comparison UI while keeping the real saved
      // resultBlob unchanged for download and sticker splitting.
      const resultPreviewPattern = /<img\s+src=\{resultUrl\}\s+alt=\{t\.result\}\s+draggable=\{false\}\s+className="pointer-events-none block h-auto w-full select-none"\s*\/>/
      if (!resultPreviewPattern.test(transformed)) {
        throw new Error('[tone-lock] Result preview image pattern was not found')
      }
      transformed = transformed.replace(
        resultPreviewPattern,
        `<img
                  src={sourceUrl}
                  alt={t.result}
                  draggable={false}
                  className="pointer-events-none block h-auto w-full select-none"
                  style={{
                    WebkitMaskImage: \`url(\${resultUrl})\`,
                    maskImage: \`url(\${resultUrl})\`,
                    WebkitMaskMode: 'alpha',
                    maskMode: 'alpha',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                    WebkitMaskSize: '100% 100%',
                    maskSize: '100% 100%'
                  }}
                />`
      )

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), originalToneLock()],
})
