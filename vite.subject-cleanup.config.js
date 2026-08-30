import { defineConfig } from 'vite'
import baseConfig from './vite.tone-lock.config.js'

function strengthenDominantSubjectCleanup() {
  return {
    name: 'dominant-subject-cleanup-v3',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code
      const countGate = /if \(significant\.length >= 2 && significant\.length <= 7\) \{/
      const dominanceGate = /const dominance = main\.area \/ Math\.max\(1, visibleArea\);\s*\n\s*if \(dominance >= 0\.72\) \{/
      const compositeGate = /sourceCtx\.save\(\);\s*sourceCtx\.globalCompositeOperation = 'destination-in';/

      if (!countGate.test(transformed)) {
        throw new Error('[subject-cleanup] Significant-component count gate was not found')
      }
      if (!dominanceGate.test(transformed)) {
        throw new Error('[subject-cleanup] Dominant-subject gate was not found')
      }
      if (!compositeGate.test(transformed)) {
        throw new Error('[subject-cleanup] Final alpha-composite gate was not found')
      }

      transformed = transformed.replace(
        countGate,
        'if (significant.length >= 2) {'
      )

      transformed = transformed.replace(
        dominanceGate,
        `const dominance = main.area / Math.max(1, visibleArea);
        const mainAreaRatio = main.area / Math.max(1, cleanupTotal);
        const portraitLikeMain =
          mainAreaRatio >= 0.16 &&
          main.height >= cleanupHeight * 0.50 &&
          main.width >= cleanupWidth * 0.24 &&
          main.centerX >= cleanupWidth * 0.20 &&
          main.centerX <= cleanupWidth * 0.80 &&
          main.centerY >= cleanupHeight * 0.38;

        if (dominance >= 0.68 && portraitLikeMain) {`
      )

      const branchPruning = `// DOMINANT_SUBJECT_BRANCH_PRUNING_V1
    // A background face can touch the subject around an ear/hair edge and become
    // one connected component. Temporarily erode the matte so a thin bridge
    // breaks, keep the dominant portrait core, then flood only the detached side
    // branch back through the original mask while protecting the main contour.
    {
      const branchMaxDimension = 640;
      const branchScale = Math.min(1, branchMaxDimension / Math.max(width, height));
      const branchWidth = Math.max(1, Math.round(width * branchScale));
      const branchHeight = Math.max(1, Math.round(height * branchScale));
      const branchCanvas = document.createElement('canvas');
      branchCanvas.width = branchWidth;
      branchCanvas.height = branchHeight;
      const branchCtx = branchCanvas.getContext('2d', { willReadFrequently: true });

      if (branchCtx && branchWidth >= 40 && branchHeight >= 40) {
        branchCtx.imageSmoothingEnabled = true;
        branchCtx.imageSmoothingQuality = 'high';
        branchCtx.drawImage(maskCanvas, 0, 0, branchWidth, branchHeight);
        const branchPixels = branchCtx.getImageData(0, 0, branchWidth, branchHeight).data;
        const branchTotal = branchWidth * branchHeight;
        const foreground = new Uint8Array(branchTotal);
        let visibleCount = 0;
        const foregroundThreshold = 72;

        for (let index = 0; index < branchTotal; index += 1) {
          if (branchPixels[index * 4 + 3] >= foregroundThreshold) {
            foreground[index] = 1;
            visibleCount += 1;
          }
        }

        if (visibleCount >= branchTotal * 0.12) {
          const labels = new Int32Array(branchTotal);
          const queue = new Int32Array(branchTotal);
          const components = [];
          let labelId = 1;

          for (let start = 0; start < branchTotal; start += 1) {
            if (!foreground[start] || labels[start]) continue;
            const label = labelId++;
            let head = 0;
            let tail = 0;
            queue[tail++] = start;
            labels[start] = label;
            let area = 0;
            let minX = branchWidth;
            let minY = branchHeight;
            let maxX = -1;
            let maxY = -1;
            let sumX = 0;
            let sumY = 0;

            while (head < tail) {
              const index = queue[head++];
              const x = index % branchWidth;
              const y = Math.floor(index / branchWidth);
              area += 1;
              sumX += x;
              sumY += y;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;

              const visit = (neighbor) => {
                if (neighbor < 0 || neighbor >= branchTotal) return;
                if (!foreground[neighbor] || labels[neighbor]) return;
                labels[neighbor] = label;
                queue[tail++] = neighbor;
              };

              if (x > 0) visit(index - 1);
              if (x + 1 < branchWidth) visit(index + 1);
              if (y > 0) visit(index - branchWidth);
              if (y + 1 < branchHeight) visit(index + branchWidth);
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
          const originalMain = components[0];
          const originalDominance = originalMain ? originalMain.area / Math.max(1, visibleCount) : 0;
          const originalMainRatio = originalMain ? originalMain.area / Math.max(1, branchTotal) : 0;
          const portraitLikeMain =
            originalMain &&
            originalDominance >= 0.68 &&
            originalMainRatio >= 0.15 &&
            originalMain.height >= branchHeight * 0.48 &&
            originalMain.width >= branchWidth * 0.23 &&
            originalMain.centerX >= branchWidth * 0.20 &&
            originalMain.centerX <= branchWidth * 0.80 &&
            originalMain.centerY >= branchHeight * 0.36;

          if (portraitLikeMain) {
            const distance = new Uint8Array(branchTotal);
            distance.fill(255);
            let distanceHead = 0;
            let distanceTail = 0;
            const distanceQueue = new Int32Array(branchTotal);
            const maxDistance = 7;

            for (let index = 0; index < branchTotal; index += 1) {
              if (!foreground[index]) {
                distance[index] = 0;
                distanceQueue[distanceTail++] = index;
              }
            }

            const distanceVisit = (index, nextDistance) => {
              if (index < 0 || index >= branchTotal) return;
              if (nextDistance >= distance[index] || nextDistance > maxDistance) return;
              distance[index] = nextDistance;
              distanceQueue[distanceTail++] = index;
            };

            while (distanceHead < distanceTail) {
              const index = distanceQueue[distanceHead++];
              const current = distance[index];
              if (current >= maxDistance) continue;
              const x = index % branchWidth;
              const y = Math.floor(index / branchWidth);
              const next = current + 1;
              if (x > 0) distanceVisit(index - 1, next);
              if (x + 1 < branchWidth) distanceVisit(index + 1, next);
              if (y > 0) distanceVisit(index - branchWidth, next);
              if (y + 1 < branchHeight) distanceVisit(index + branchWidth, next);
            }

            // Four analysis pixels are enough to sever a narrow person-to-ear
            // bridge while leaving the much thicker face/head/body core intact.
            const coreMask = new Uint8Array(branchTotal);
            for (let index = 0; index < branchTotal; index += 1) {
              if (foreground[index] && distance[index] >= 4) coreMask[index] = 1;
            }

            const coreLabels = new Int32Array(branchTotal);
            const coreComponents = [];
            let coreLabelId = 1;
            for (let start = 0; start < branchTotal; start += 1) {
              if (!coreMask[start] || coreLabels[start]) continue;
              const label = coreLabelId++;
              let head = 0;
              let tail = 0;
              queue[tail++] = start;
              coreLabels[start] = label;
              let area = 0;
              let minX = branchWidth;
              let minY = branchHeight;
              let maxX = -1;
              let maxY = -1;
              let sumX = 0;
              let sumY = 0;

              while (head < tail) {
                const index = queue[head++];
                const x = index % branchWidth;
                const y = Math.floor(index / branchWidth);
                area += 1;
                sumX += x;
                sumY += y;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;

                const visit = (neighbor) => {
                  if (neighbor < 0 || neighbor >= branchTotal) return;
                  if (!coreMask[neighbor] || coreLabels[neighbor]) return;
                  coreLabels[neighbor] = label;
                  queue[tail++] = neighbor;
                };

                if (x > 0) visit(index - 1);
                if (x + 1 < branchWidth) visit(index + 1);
                if (y > 0) visit(index - branchWidth);
                if (y + 1 < branchHeight) visit(index + branchWidth);
              }

              coreComponents.push({
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

            coreComponents.sort((a, b) => b.area - a.area);
            const mainCore = coreComponents[0];
            if (mainCore && mainCore.area >= originalMain.area * 0.46 && coreComponents.length >= 2) {
              const mainRowMin = new Int32Array(branchHeight);
              const mainRowMax = new Int32Array(branchHeight);
              mainRowMin.fill(branchWidth);
              mainRowMax.fill(-1);
              for (let index = 0; index < branchTotal; index += 1) {
                if (coreLabels[index] !== mainCore.label) continue;
                const x = index % branchWidth;
                const y = Math.floor(index / branchWidth);
                if (x < mainRowMin[y]) mainRowMin[y] = x;
                if (x > mainRowMax[y]) mainRowMax[y] = x;
              }

              const candidateLabels = new Set();
              for (let i = 1; i < coreComponents.length; i += 1) {
                const candidate = coreComponents[i];
                const relativeArea = candidate.area / Math.max(1, mainCore.area);
                if (relativeArea > 0.095 || candidate.area < 10) continue;
                if (candidate.height > branchHeight * 0.24 || candidate.width > branchWidth * 0.20) continue;
                if (candidate.centerY > originalMain.minY + originalMain.height * 0.58) continue;

                const centerRow = Math.max(0, Math.min(branchHeight - 1, Math.round(candidate.centerY)));
                let rowMin = branchWidth;
                let rowMax = -1;
                for (let y = Math.max(0, centerRow - 4); y <= Math.min(branchHeight - 1, centerRow + 4); y += 1) {
                  if (mainRowMax[y] < 0) continue;
                  if (mainRowMin[y] < rowMin) rowMin = mainRowMin[y];
                  if (mainRowMax[y] > rowMax) rowMax = mainRowMax[y];
                }
                if (rowMax < 0) continue;

                const leftSide = candidate.maxX <= rowMin + branchWidth * 0.025;
                const rightSide = candidate.minX >= rowMax - branchWidth * 0.025;
                const horizontalGap = leftSide
                  ? Math.max(0, rowMin - candidate.maxX)
                  : rightSide
                    ? Math.max(0, candidate.minX - rowMax)
                    : branchWidth;
                const closeEnough = horizontalGap <= branchWidth * 0.085;

                if ((leftSide || rightSide) && closeEnough) {
                  candidateLabels.add(candidate.label);
                }
              }

              if (candidateLabels.size) {
                // Protect the dominant core plus a 3px contour band. Candidate
                // flood-fill can travel through the original soft bridge but can
                // never eat into the real head/ear/hair core.
                const protectedMain = new Uint8Array(branchTotal);
                for (let index = 0; index < branchTotal; index += 1) {
                  if (coreLabels[index] === mainCore.label) protectedMain[index] = 1;
                }
                for (let pass = 0; pass < 3; pass += 1) {
                  const next = protectedMain.slice();
                  for (let y = 0; y < branchHeight; y += 1) {
                    for (let x = 0; x < branchWidth; x += 1) {
                      const index = y * branchWidth + x;
                      if (!protectedMain[index]) continue;
                      if (x > 0) next[index - 1] = 1;
                      if (x + 1 < branchWidth) next[index + 1] = 1;
                      if (y > 0) next[index - branchWidth] = 1;
                      if (y + 1 < branchHeight) next[index + branchWidth] = 1;
                    }
                  }
                  protectedMain.set(next);
                }

                const removeMap = new Uint8Array(branchTotal);
                let removeHead = 0;
                let removeTail = 0;
                const removeQueue = new Int32Array(branchTotal);
                for (let index = 0; index < branchTotal; index += 1) {
                  if (candidateLabels.has(coreLabels[index]) && !protectedMain[index]) {
                    removeMap[index] = 1;
                    removeQueue[removeTail++] = index;
                  }
                }

                const maxBranchY = Math.min(branchHeight - 1, Math.round(originalMain.minY + originalMain.height * 0.64));
                while (removeHead < removeTail) {
                  const index = removeQueue[removeHead++];
                  const x = index % branchWidth;
                  const y = Math.floor(index / branchWidth);
                  const visit = (neighbor, nx, ny) => {
                    if (neighbor < 0 || neighbor >= branchTotal) return;
                    if (ny < 0 || ny > maxBranchY || nx < 0 || nx >= branchWidth) return;
                    if (!foreground[neighbor] || protectedMain[neighbor] || removeMap[neighbor]) return;
                    removeMap[neighbor] = 1;
                    removeQueue[removeTail++] = neighbor;
                  };
                  if (x > 0) visit(index - 1, x - 1, y);
                  if (x + 1 < branchWidth) visit(index + 1, x + 1, y);
                  if (y > 0) visit(index - branchWidth, x, y - 1);
                  if (y + 1 < branchHeight) visit(index + branchWidth, x, y + 1);
                }

                // Clear a one-pixel halo outside the protected subject contour.
                const expandedRemove = removeMap.slice();
                for (let y = 0; y < branchHeight; y += 1) {
                  for (let x = 0; x < branchWidth; x += 1) {
                    const index = y * branchWidth + x;
                    if (!removeMap[index]) continue;
                    for (let dy = -1; dy <= 1; dy += 1) {
                      const ny = y + dy;
                      if (ny < 0 || ny >= branchHeight) continue;
                      for (let dx = -1; dx <= 1; dx += 1) {
                        const nx = x + dx;
                        if (nx < 0 || nx >= branchWidth) continue;
                        const neighbor = ny * branchWidth + nx;
                        if (!protectedMain[neighbor]) expandedRemove[neighbor] = 1;
                      }
                    }
                  }
                }

                const branchXScale = branchWidth / width;
                const branchYScale = branchHeight / height;
                for (let y = 0; y < height; y += 1) {
                  const by = Math.min(branchHeight - 1, Math.floor(y * branchYScale));
                  for (let x = 0; x < width; x += 1) {
                    const bx = Math.min(branchWidth - 1, Math.floor(x * branchXScale));
                    if (expandedRemove[by * branchWidth + bx]) {
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
        `${branchPruning}\n    sourceCtx.save();\n    sourceCtx.globalCompositeOperation = 'destination-in';`
      )

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), strengthenDominantSubjectCleanup()],
})
