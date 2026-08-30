import { defineConfig } from 'vite'
import baseConfig from './vite.subject-cleanup.config.js'

function removeLocalizedFootShadows() {
  return {
    name: 'foot-shadow-cleanup-v1',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code
      const compositeGate = /sourceCtx\.save\(\);\s*sourceCtx\.globalCompositeOperation = 'destination-in';/
      if (!compositeGate.test(transformed)) {
        throw new Error('[shadow-cleanup] Final alpha-composite gate was not found')
      }

      const shadowCleanup = `// FOOT_SHADOW_CLEANUP_V1
    // Remove only flat, dark, low-saturation foreground patches around the feet.
    // The body/legs stay protected by a corridor learned from the lower torso and
    // leg silhouette, so dark trousers and shoes are not treated as shadows.
    {
      const shadowMaxDimension = 720;
      const shadowScale = Math.min(1, shadowMaxDimension / Math.max(width, height));
      const shadowWidth = Math.max(1, Math.round(width * shadowScale));
      const shadowHeight = Math.max(1, Math.round(height * shadowScale));

      if (shadowWidth >= 48 && shadowHeight >= 48) {
        const shadowMaskCanvas = document.createElement('canvas');
        shadowMaskCanvas.width = shadowWidth;
        shadowMaskCanvas.height = shadowHeight;
        const shadowMaskCtx = shadowMaskCanvas.getContext('2d', { willReadFrequently: true });

        const shadowSourceCanvas = document.createElement('canvas');
        shadowSourceCanvas.width = shadowWidth;
        shadowSourceCanvas.height = shadowHeight;
        const shadowSourceCtx = shadowSourceCanvas.getContext('2d', { willReadFrequently: true });

        if (shadowMaskCtx && shadowSourceCtx) {
          shadowMaskCtx.imageSmoothingEnabled = true;
          shadowMaskCtx.imageSmoothingQuality = 'high';
          shadowMaskCtx.drawImage(maskCanvas, 0, 0, shadowWidth, shadowHeight);
          shadowSourceCtx.imageSmoothingEnabled = true;
          shadowSourceCtx.imageSmoothingQuality = 'high';
          shadowSourceCtx.drawImage(sourceImage, 0, 0, shadowWidth, shadowHeight);

          const shadowMaskPixels = shadowMaskCtx.getImageData(0, 0, shadowWidth, shadowHeight).data;
          const shadowSourcePixels = shadowSourceCtx.getImageData(0, 0, shadowWidth, shadowHeight).data;
          const shadowTotal = shadowWidth * shadowHeight;
          const foreground = new Uint8Array(shadowTotal);
          const labels = new Int32Array(shadowTotal);
          const queue = new Int32Array(shadowTotal);
          const components = [];
          const foregroundThreshold = 68;
          let visibleCount = 0;
          let nextLabel = 1;

          for (let index = 0; index < shadowTotal; index += 1) {
            if (shadowMaskPixels[index * 4 + 3] >= foregroundThreshold) {
              foreground[index] = 1;
              visibleCount += 1;
            }
          }

          for (let start = 0; start < shadowTotal; start += 1) {
            if (!foreground[start] || labels[start]) continue;
            const label = nextLabel++;
            let head = 0;
            let tail = 0;
            queue[tail++] = start;
            labels[start] = label;
            let area = 0;
            let minX = shadowWidth;
            let minY = shadowHeight;
            let maxX = -1;
            let maxY = -1;
            let sumX = 0;
            let sumY = 0;

            while (head < tail) {
              const index = queue[head++];
              const x = index % shadowWidth;
              const y = Math.floor(index / shadowWidth);
              area += 1;
              sumX += x;
              sumY += y;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;

              const visit = (neighbor) => {
                if (neighbor < 0 || neighbor >= shadowTotal) return;
                if (!foreground[neighbor] || labels[neighbor]) return;
                labels[neighbor] = label;
                queue[tail++] = neighbor;
              };

              if (x > 0) visit(index - 1);
              if (x + 1 < shadowWidth) visit(index + 1);
              if (y > 0) visit(index - shadowWidth);
              if (y + 1 < shadowHeight) visit(index + shadowWidth);
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

          components.sort((a, b) => b.area - a.area);
          const main = components[0];
          const mainDominance = main ? main.area / Math.max(1, visibleCount) : 0;
          const mainAreaRatio = main ? main.area / Math.max(1, shadowTotal) : 0;
          const singleSubjectLike =
            main &&
            mainDominance >= 0.62 &&
            mainAreaRatio >= 0.025 &&
            main.height >= shadowHeight * 0.34 &&
            main.width >= shadowWidth * 0.10 &&
            main.centerX >= shadowWidth * 0.10 &&
            main.centerX <= shadowWidth * 0.90;

          if (singleSubjectLike) {
            // Learn a protected leg/body corridor from rows above the feet, before
            // floor shadows normally begin. This naturally supports wide stances.
            const corridorStartY = Math.max(0, Math.round(main.minY + main.height * 0.58));
            const corridorEndY = Math.min(shadowHeight - 1, Math.round(main.minY + main.height * 0.84));
            let corridorMinX = shadowWidth;
            let corridorMaxX = -1;
            for (let y = corridorStartY; y <= corridorEndY; y += 1) {
              for (let x = Math.max(0, main.minX); x <= Math.min(shadowWidth - 1, main.maxX); x += 1) {
                const index = y * shadowWidth + x;
                if (!foreground[index]) continue;
                if (x < corridorMinX) corridorMinX = x;
                if (x > corridorMaxX) corridorMaxX = x;
              }
            }

            if (corridorMaxX >= corridorMinX) {
              const corridorPad = Math.max(3, Math.round(main.width * 0.055));
              const safeMinX = Math.max(0, corridorMinX - corridorPad);
              const safeMaxX = Math.min(shadowWidth - 1, corridorMaxX + corridorPad);
              const searchMinY = Math.max(0, Math.round(main.minY + main.height * 0.72));
              const searchMaxY = Math.min(shadowHeight - 1, Math.round(main.maxY + main.height * 0.10));
              const searchMinX = Math.max(0, Math.round(main.minX - main.width * 0.38));
              const searchMaxX = Math.min(shadowWidth - 1, Math.round(main.maxX + main.width * 0.38));

              const candidate = new Uint8Array(shadowTotal);
              const lumaAt = (index) => {
                const p = index * 4;
                return shadowSourcePixels[p] * 0.2126 + shadowSourcePixels[p + 1] * 0.7152 + shadowSourcePixels[p + 2] * 0.0722;
              };
              const saturationAt = (index) => {
                const p = index * 4;
                const r = shadowSourcePixels[p];
                const g = shadowSourcePixels[p + 1];
                const b = shadowSourcePixels[p + 2];
                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                return max > 0 ? (max - min) / max : 0;
              };

              for (let y = searchMinY; y <= searchMaxY; y += 1) {
                for (let x = searchMinX; x <= searchMaxX; x += 1) {
                  const index = y * shadowWidth + x;
                  const alpha = shadowMaskPixels[index * 4 + 3];
                  if (alpha < 38) continue;
                  const luma = lumaAt(index);
                  const saturation = saturationAt(index);
                  if (luma >= 28 && luma <= 188 && saturation <= 0.40) {
                    candidate[index] = 1;
                  }
                }
              }

              const candidateLabels = new Int32Array(shadowTotal);
              const candidateComponents = [];
              let candidateLabel = 1;

              for (let start = 0; start < shadowTotal; start += 1) {
                if (!candidate[start] || candidateLabels[start]) continue;
                const label = candidateLabel++;
                let head = 0;
                let tail = 0;
                queue[tail++] = start;
                candidateLabels[start] = label;
                let area = 0;
                let minX = shadowWidth;
                let minY = shadowHeight;
                let maxX = -1;
                let maxY = -1;
                let sumLuma = 0;
                let sumSaturation = 0;
                let outsideCorridor = 0;

                while (head < tail) {
                  const index = queue[head++];
                  const x = index % shadowWidth;
                  const y = Math.floor(index / shadowWidth);
                  area += 1;
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;
                  sumLuma += lumaAt(index);
                  sumSaturation += saturationAt(index);
                  if (x < safeMinX || x > safeMaxX) outsideCorridor += 1;

                  const visit = (neighbor) => {
                    if (neighbor < 0 || neighbor >= shadowTotal) return;
                    if (!candidate[neighbor] || candidateLabels[neighbor]) return;
                    candidateLabels[neighbor] = label;
                    queue[tail++] = neighbor;
                  };

                  if (x > 0) visit(index - 1);
                  if (x + 1 < shadowWidth) visit(index + 1);
                  if (y > 0) visit(index - shadowWidth);
                  if (y + 1 < shadowHeight) visit(index + shadowWidth);
                }

                candidateComponents.push({
                  label,
                  area,
                  minX,
                  minY,
                  maxX,
                  maxY,
                  width: maxX - minX + 1,
                  height: maxY - minY + 1,
                  meanLuma: sumLuma / Math.max(1, area),
                  meanSaturation: sumSaturation / Math.max(1, area),
                  outsideRatio: outsideCorridor / Math.max(1, area)
                });
              }

              const removeLabels = new Set();
              const minShadowArea = Math.max(10, Math.round(shadowTotal * 0.000025));
              for (const component of candidateComponents) {
                const areaRatio = component.area / Math.max(1, shadowTotal);
                const flat = component.width >= component.height * 1.18;
                const lowProfile = component.height <= Math.max(8, main.height * 0.18);
                const nearFeet = component.minY >= main.minY + main.height * 0.68;
                const closeHorizontally =
                  component.maxX >= main.minX - main.width * 0.18 &&
                  component.minX <= main.maxX + main.width * 0.18;
                const shadowColored = component.meanLuma <= 170 && component.meanSaturation <= 0.34;
                const mostlyOutsideLegs = component.outsideRatio >= 0.52;

                if (
                  component.area >= minShadowArea &&
                  areaRatio <= 0.022 &&
                  flat &&
                  lowProfile &&
                  nearFeet &&
                  closeHorizontally &&
                  shadowColored &&
                  mostlyOutsideLegs
                ) {
                  removeLabels.add(component.label);
                }
              }

              if (removeLabels.size) {
                const removeMap = new Uint8Array(shadowTotal);
                for (let index = 0; index < shadowTotal; index += 1) {
                  if (removeLabels.has(candidateLabels[index])) removeMap[index] = 1;
                }

                // Expand one pixel only through shadow-like pixels outside the
                // protected leg corridor to clear the soft matte fringe.
                const expanded = removeMap.slice();
                for (let y = searchMinY; y <= searchMaxY; y += 1) {
                  for (let x = searchMinX; x <= searchMaxX; x += 1) {
                    const index = y * shadowWidth + x;
                    if (!removeMap[index]) continue;
                    for (let dy = -1; dy <= 1; dy += 1) {
                      const ny = y + dy;
                      if (ny < searchMinY || ny > searchMaxY) continue;
                      for (let dx = -1; dx <= 1; dx += 1) {
                        const nx = x + dx;
                        if (nx < searchMinX || nx > searchMaxX) continue;
                        if (nx >= safeMinX && nx <= safeMaxX) continue;
                        const neighbor = ny * shadowWidth + nx;
                        if (shadowMaskPixels[neighbor * 4 + 3] < 24) continue;
                        if (lumaAt(neighbor) <= 195 && saturationAt(neighbor) <= 0.44) {
                          expanded[neighbor] = 1;
                        }
                      }
                    }
                  }
                }

                const sx = shadowWidth / width;
                const sy = shadowHeight / height;
                for (let y = 0; y < height; y += 1) {
                  const ay = Math.min(shadowHeight - 1, Math.floor(y * sy));
                  for (let x = 0; x < width; x += 1) {
                    const ax = Math.min(shadowWidth - 1, Math.floor(x * sx));
                    if (expanded[ay * shadowWidth + ax]) {
                      maskPixels[(y * width + x) * 4 + 3] = 0;
                    }
                  }
                }
                maskCtx.putImageData(maskImageData, 0, 0);
              }
            }
          }
        }
      }
    }
`

      transformed = transformed.replace(
        compositeGate,
        `${shadowCleanup}\n    sourceCtx.save();\n    sourceCtx.globalCompositeOperation = 'destination-in';`
      )

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), removeLocalizedFootShadows()],
})
