import { defineConfig } from 'vite'
import baseConfig from './vite.portrait-precision.config.js'

function originalColorPreviewMask() {
  return {
    name: 'original-color-preview-mask',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      const pattern = /<img\s+src=\{resultUrl\}[\s\S]*?className="pointer-events-none block h-auto w-full select-none"\s*\/>/
      if (!pattern.test(code)) {
        throw new Error('[tone-preview] Result preview image pattern was not found')
      }

      const transformed = code.replace(
        pattern,
        `<img
                  src={sourceUrl}
                  alt={t.result}
                  draggable={false}
                  className="pointer-events-none block h-auto w-full select-none"
                  style={{
                    WebkitMaskImage: \`url(\${resultUrl})\`,
                    maskImage: \`url(\${resultUrl})\`,
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

      const helper = `// FOREGROUND_TONE_PRESERVATION_V5
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

    // Keep solid subject interiors opaque while preserving a narrow feathered
    // contour for hair, fingers and antialiased clothing edges.
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

        if (interiorDistance >= solidInteriorDistance && alpha >= 92) {
          maskPixels[p + 3] = 255;
        } else if (interiorDistance >= nearInteriorDistance && alpha >= 150) {
          maskPixels[p + 3] = Math.min(255, Math.round(alpha + (255 - alpha) * 0.94));
        }
      }
    }

    maskCtx.putImageData(maskImageData, 0, 0);

    // Remove small detached foreground islands near the upper/middle part of a
    // clearly dominant main subject. This targets a background face or partial
    // person accidentally classified as foreground without harming group photos
    // or sticker sheets, where no single component strongly dominates.
    const cleanupMaxDimension = 720;
    const cleanupScale = Math.min(1, cleanupMaxDimension / Math.max(width, height));
    const cleanupWidth = Math.max(1, Math.round(width * cleanupScale));
    const cleanupHeight = Math.max(1, Math.round(height * cleanupScale));
    const cleanupCanvas = document.createElement('canvas');
    cleanupCanvas.width = cleanupWidth;
    cleanupCanvas.height = cleanupHeight;
    const cleanupCtx = cleanupCanvas.getContext('2d', { willReadFrequently: true });

    if (cleanupCtx) {
      cleanupCtx.imageSmoothingEnabled = true;
      cleanupCtx.imageSmoothingQuality = 'high';
      cleanupCtx.drawImage(maskCanvas, 0, 0, cleanupWidth, cleanupHeight);
      const cleanupPixels = cleanupCtx.getImageData(0, 0, cleanupWidth, cleanupHeight).data;
      const cleanupTotal = cleanupWidth * cleanupHeight;
      const labels = new Int32Array(cleanupTotal);
      const componentQueue = new Int32Array(cleanupTotal);
      const components = [];
      const componentThreshold = 76;
      let nextLabel = 1;

      for (let start = 0; start < cleanupTotal; start += 1) {
        if (labels[start] !== 0 || cleanupPixels[start * 4 + 3] < componentThreshold) continue;

        const label = nextLabel++;
        let qHead = 0;
        let qTail = 0;
        componentQueue[qTail++] = start;
        labels[start] = label;
        let area = 0;
        let minX = cleanupWidth;
        let minY = cleanupHeight;
        let maxX = -1;
        let maxY = -1;
        let sumX = 0;
        let sumY = 0;

        while (qHead < qTail) {
          const index = componentQueue[qHead++];
          const x = index % cleanupWidth;
          const y = Math.floor(index / cleanupWidth);
          area += 1;
          sumX += x;
          sumY += y;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;

          const visit = (neighbor) => {
            if (neighbor < 0 || neighbor >= cleanupTotal) return;
            if (labels[neighbor] !== 0) return;
            if (cleanupPixels[neighbor * 4 + 3] < componentThreshold) return;
            labels[neighbor] = label;
            componentQueue[qTail++] = neighbor;
          };

          if (x > 0) visit(index - 1);
          if (x + 1 < cleanupWidth) visit(index + 1);
          if (y > 0) visit(index - cleanupWidth);
          if (y + 1 < cleanupHeight) visit(index + cleanupWidth);
        }

        components.push({
          label,
          area,
          minX,
          minY,
          maxX,
          maxY,
          width: maxX - minX + 1,
          height: maxY - minY + 1,
          centerX: sumX / Math.max(1, area),
          centerY: sumY / Math.max(1, area)
        });
      }

      const minSignificantArea = Math.max(18, Math.round(cleanupTotal * 0.00012));
      const significant = components
        .filter((component) => component.area >= minSignificantArea)
        .sort((a, b) => b.area - a.area);

      if (significant.length >= 2 && significant.length <= 7) {
        const main = significant[0];
        const visibleArea = significant.reduce((sum, component) => sum + component.area, 0);
        const dominance = main.area / Math.max(1, visibleArea);

        if (dominance >= 0.72) {
          const removeLabels = new Set();
          for (let i = 1; i < significant.length; i += 1) {
            const component = significant[i];
            const relativeArea = component.area / Math.max(1, main.area);
            const imageAreaRatio = component.area / Math.max(1, cleanupTotal);
            const touchesBottom = component.maxY >= cleanupHeight - 3;
            const upperOrMiddle = component.centerY <= main.minY + main.height * 0.67;
            const nearMainHorizontally =
              component.centerX >= main.minX - main.width * 0.38 &&
              component.centerX <= main.maxX + main.width * 0.38;
            const verySmall = relativeArea <= 0.06 && imageAreaRatio <= 0.014;
            const smallPeekingFragment =
              relativeArea <= 0.13 &&
              imageAreaRatio <= 0.028 &&
              component.height <= cleanupHeight * 0.30 &&
              component.width <= cleanupWidth * 0.22;

            if (
              !touchesBottom &&
              upperOrMiddle &&
              nearMainHorizontally &&
              (verySmall || smallPeekingFragment)
            ) {
              removeLabels.add(component.label);
            }
          }

          if (removeLabels.size) {
            const removeMap = new Uint8Array(cleanupTotal);
            for (let index = 0; index < cleanupTotal; index += 1) {
              if (removeLabels.has(labels[index])) removeMap[index] = 1;
            }

            // One-pixel expansion clears the antialiased halo around the removed
            // background face while remaining far from the dominant subject.
            const expanded = removeMap.slice();
            for (let y = 0; y < cleanupHeight; y += 1) {
              for (let x = 0; x < cleanupWidth; x += 1) {
                const index = y * cleanupWidth + x;
                if (!removeMap[index]) continue;
                for (let dy = -1; dy <= 1; dy += 1) {
                  const ny = y + dy;
                  if (ny < 0 || ny >= cleanupHeight) continue;
                  for (let dx = -1; dx <= 1; dx += 1) {
                    const nx = x + dx;
                    if (nx < 0 || nx >= cleanupWidth) continue;
                    expanded[ny * cleanupWidth + nx] = 1;
                  }
                }
              }
            }

            const cleanupXScale = cleanupWidth / width;
            const cleanupYScale = cleanupHeight / height;
            for (let y = 0; y < height; y += 1) {
              const cy = Math.min(cleanupHeight - 1, Math.floor(y * cleanupYScale));
              for (let x = 0; x < width; x += 1) {
                const cx = Math.min(cleanupWidth - 1, Math.floor(x * cleanupXScale));
                if (expanded[cy * cleanupWidth + cx]) {
                  maskPixels[(y * width + x) * 4 + 3] = 0;
                }
              }
            }
            maskCtx.putImageData(maskImageData, 0, 0);
          }
        }
      }
    }

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
  plugins: [originalColorPreviewMask(), ...(baseConfig.plugins || []), originalToneLock()],
})
