from pathlib import Path

path = Path('src/components/BackgroundRemover.jsx')
s = path.read_text(encoding='utf-8')

anchor = "async function removeWithAi(file, onProgress) {\n"
if anchor not in s:
    raise SystemExit('Missing removeWithAi anchor')

cleanup = r'''function analyzeAlphaComponents(ctx, width, height, alphaThreshold = 36) {
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const total = width * height;
  const labels = new Int32Array(total);
  const queue = new Int32Array(total);
  const components = [];
  let nextLabel = 0;

  const visible = (index) => pixels[index * 4 + 3] >= alphaThreshold;

  for (let seed = 0; seed < total; seed += 1) {
    if (labels[seed] || !visible(seed)) continue;
    nextLabel += 1;
    let head = 0;
    let tail = 0;
    queue[tail++] = seed;
    labels[seed] = nextLabel;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    let area = 0;

    while (head < tail) {
      const index = queue[head++];
      const x = index % width;
      const y = Math.floor(index / width);
      area += 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      const visit = (next) => {
        if (next < 0 || next >= total || labels[next] || !visible(next)) return;
        labels[next] = nextLabel;
        queue[tail++] = next;
      };

      if (x > 0) visit(index - 1);
      if (x + 1 < width) visit(index + 1);
      if (y > 0) visit(index - width);
      if (y + 1 < height) visit(index + width);
    }

    components.push({
      label: nextLabel,
      area,
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2
    });
  }

  return { pixels, labels, components };
}

function componentGap(a, b) {
  const dx = Math.max(a.minX - b.maxX, b.minX - a.maxX, 0);
  const dy = Math.max(a.minY - b.maxY, b.minY - a.maxY, 0);
  return Math.hypot(dx, dy);
}

async function cleanAiForegroundArtifacts(blob) {
  const { canvas, ctx } = await drawFileToCanvas(blob);
  const { width, height } = canvas;
  if (!width || !height) return blob;

  // Detect disconnected remnants on a bounded preview. The full-resolution
  // image is only touched once after the keep-mask is decided, which keeps
  // memory use reasonable on phones.
  const maxAnalysisDimension = 960;
  const scale = Math.min(1, maxAnalysisDimension / Math.max(width, height));
  const analysisWidth = Math.max(1, Math.round(width * scale));
  const analysisHeight = Math.max(1, Math.round(height * scale));
  const analysisCanvas = document.createElement('canvas');
  analysisCanvas.width = analysisWidth;
  analysisCanvas.height = analysisHeight;
  const analysisCtx = analysisCanvas.getContext('2d', { willReadFrequently: true });
  if (!analysisCtx) return blob;
  analysisCtx.imageSmoothingEnabled = true;
  analysisCtx.imageSmoothingQuality = 'high';
  analysisCtx.drawImage(canvas, 0, 0, analysisWidth, analysisHeight);

  const { labels, components } = analyzeAlphaComponents(analysisCtx, analysisWidth, analysisHeight, 36);
  if (!components.length) return blob;

  const ranked = [...components].sort((a, b) => b.area - a.area);
  const visibleArea = ranked.reduce((sum, item) => sum + item.area, 0);
  const largest = ranked[0];
  const largestShare = largest.area / Math.max(1, visibleArea);
  const topFiveShare = ranked.slice(0, 5).reduce((sum, item) => sum + item.area, 0) / Math.max(1, visibleArea);

  // A 15-sticker sheet has many similarly sized foreground islands. Skip this
  // cleanup unless a few dominant subjects account for most visible pixels.
  // This still supports two or three people because several large components
  // can be retained at the same time.
  const photoLikeForeground = largestShare >= 0.30 || topFiveShare >= 0.72;
  if (!photoLikeForeground) return blob;

  const analysisTotal = analysisWidth * analysisHeight;
  const majorMinArea = Math.max(analysisTotal * 0.0025, largest.area * 0.075);
  const keepLabels = new Set([largest.label]);
  const keptComponents = [largest];

  for (const component of ranked.slice(1)) {
    if (component.area < majorMinArea) continue;
    const fillRatio = component.area / Math.max(1, component.width * component.height);
    const aspect = Math.max(component.width / Math.max(1, component.height), component.height / Math.max(1, component.width));
    const touchesLeft = component.minX <= 2;
    const touchesRight = component.maxX >= analysisWidth - 3;
    const touchesTop = component.minY <= 2;
    const touchesBottom = component.maxY >= analysisHeight - 3;
    const edgeCount = Number(touchesLeft) + Number(touchesRight) + Number(touchesTop) + Number(touchesBottom);

    // Typical ORMBG leftovers are wall/sign/ceiling fragments attached to the
    // outer frame. Do not discard a sizeable second/third person merely for
    // being near one edge; only reject strongly background-like edge shapes.
    const suspiciousEdgeFragment =
      (edgeCount >= 2 && component.area < largest.area * 0.62) ||
      (((touchesLeft || touchesRight || touchesTop) && !touchesBottom) &&
        component.area < largest.area * 0.28 &&
        (fillRatio < 0.48 || aspect > 2.7));

    if (suspiciousEdgeFragment) continue;
    keepLabels.add(component.label);
    keptComponents.push(component);
  }

  // Preserve disconnected hands, hair wisps and accessories close to a kept
  // person, while still dropping distant text/sign fragments.
  const satelliteMinArea = Math.max(analysisTotal * 0.00012, largest.area * 0.0035);
  const satelliteMaxGap = Math.max(4, Math.max(analysisWidth, analysisHeight) * 0.026);
  for (const component of ranked) {
    if (keepLabels.has(component.label) || component.area < satelliteMinArea) continue;
    if (keptComponents.some((kept) => componentGap(component, kept) <= satelliteMaxGap)) {
      keepLabels.add(component.label);
    }
  }

  const keepMask = new Uint8Array(analysisTotal);
  for (let i = 0; i < labels.length; i += 1) {
    if (keepLabels.has(labels[i])) keepMask[i] = 1;
  }

  // Expand the keep mask slightly so antialiased hair/clothing edges survive.
  const expandedMask = keepMask.slice();
  const radius = 2;
  for (let y = 0; y < analysisHeight; y += 1) {
    for (let x = 0; x < analysisWidth; x += 1) {
      const index = y * analysisWidth + x;
      if (!keepMask[index]) continue;
      for (let dy = -radius; dy <= radius; dy += 1) {
        const ny = y + dy;
        if (ny < 0 || ny >= analysisHeight) continue;
        for (let dx = -radius; dx <= radius; dx += 1) {
          const nx = x + dx;
          if (nx < 0 || nx >= analysisWidth) continue;
          expandedMask[ny * analysisWidth + nx] = 1;
        }
      }
    }
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const xScale = analysisWidth / width;
  const yScale = analysisHeight / height;
  let removedPixels = 0;

  for (let y = 0; y < height; y += 1) {
    const ay = Math.min(analysisHeight - 1, Math.floor(y * yScale));
    for (let x = 0; x < width; x += 1) {
      const ax = Math.min(analysisWidth - 1, Math.floor(x * xScale));
      const p = (y * width + x) * 4;
      const alpha = pixels[p + 3];
      if (!alpha) continue;

      if (!expandedMask[ay * analysisWidth + ax]) {
        pixels[p + 3] = 0;
        removedPixels += 1;
        continue;
      }

      // Tighten only weak matte pixels. Strong hair/skin/clothing alpha stays
      // untouched; faint white/gray halos become less visible.
      if (alpha < 16) pixels[p + 3] = 0;
      else if (alpha < 72) pixels[p + 3] = Math.round(alpha * 0.68);
      else if (alpha < 132) pixels[p + 3] = Math.round(alpha * 0.90);
    }
  }

  // Very small cleanups are mostly antialias noise; avoid an unnecessary
  // re-encode unless the mask actually removed something meaningful.
  if (removedPixels < width * height * 0.00008) return blob;

  // Reduce bright fringe color using adjacent confident foreground colors.
  // This is deliberately one-pixel and conservative so facial detail is not
  // blurred and multiple people remain independent.
  const original = new Uint8ClampedArray(pixels);
  const neighborOffsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const p = (y * width + x) * 4;
      const alpha = original[p + 3];
      if (alpha < 32 || alpha > 218) continue;
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;
      for (const [dx, dy] of neighborOffsets) {
        const np = ((y + dy) * width + (x + dx)) * 4;
        if (original[np + 3] < 238) continue;
        r += original[np];
        g += original[np + 1];
        b += original[np + 2];
        count += 1;
      }
      if (!count) continue;
      const mix = Math.min(0.42, ((218 - alpha) / 186) * 0.42);
      pixels[p] = Math.round(original[p] * (1 - mix) + (r / count) * mix);
      pixels[p + 1] = Math.round(original[p + 1] * (1 - mix) + (g / count) * mix);
      pixels[p + 2] = Math.round(original[p + 2] * (1 - mix) + (b / count) * mix);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvasToPngBlob(canvas);
}

'''

s = s.replace(anchor, cleanup + anchor, 1)
old = "  if (!blob) throw new Error('No output blob');\n  return correctUnexpectedForegroundTransparency(blob);\n"
new = "  if (!blob) throw new Error('No output blob');\n  const corrected = await correctUnexpectedForegroundTransparency(blob);\n  return cleanAiForegroundArtifacts(corrected);\n"
if old not in s:
    raise SystemExit('Missing removeWithAi return anchor')
s = s.replace(old, new, 1)

path.write_text(s, encoding='utf-8')
print('patched AI foreground cleanup')
