import { defineConfig } from 'vite'
import baseConfig from './vite.legal-notices.config.js'

function preciseStickerSheetSplit() {
  return {
    name: 'precise-sticker-sheet-split-v8-floating-component-reattach',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')
      const startMarker = 'async function detectEmoticonSheet(blob) {'
      const endMarker = 'async function hasRealTransparency(file) {'
      const start = transformed.indexOf(startMarker)
      const end = transformed.indexOf(endMarker)

      if (start < 0 || end < 0 || end <= start) {
        throw new Error('[precise-sticker-split] Detection/split block anchors were not found')
      }

      const replacement = `function buildStickerForegroundMask(canvas) {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx || !width || !height) return null;

  const pixels = ctx.getImageData(0, 0, width, height).data;
  const total = width * height;
  const mask = new Uint8Array(total);
  let transparentSamples = 0;
  let sampleCount = 0;
  const sampleStep = Math.max(1, Math.floor(Math.sqrt(total / 180000)));

  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
      sampleCount += 1;
      if (pixels[(y * width + x) * 4 + 3] < 245) transparentSamples += 1;
    }
  }

  const useAlpha = transparentSamples / Math.max(1, sampleCount) >= 0.035;
  let visibleTotal = 0;

  if (useAlpha) {
    for (let i = 0; i < total; i += 1) {
      if (pixels[i * 4 + 3] > 8) {
        mask[i] = 1;
        visibleTotal += 1;
      }
    }
    return { mask, width, height, visibleTotal, mode: 'alpha' };
  }

  // Opaque sheets can be black or white. Instead of deleting every pixel close
  // to the border colour, flood-fill only the background that is actually
  // connected to the outer edge. This preserves black hair on a black sheet and
  // white clothing on a white sheet when a sticker outline encloses the subject.
  const borderR = [];
  const borderG = [];
  const borderB = [];
  const borderStep = Math.max(1, Math.floor(Math.max(width, height) / 180));
  const collect = (x, y) => {
    const idx = (y * width + x) * 4;
    borderR.push(pixels[idx]);
    borderG.push(pixels[idx + 1]);
    borderB.push(pixels[idx + 2]);
  };
  for (let x = 0; x < width; x += borderStep) {
    collect(x, 0);
    collect(x, height - 1);
  }
  for (let y = 0; y < height; y += borderStep) {
    collect(0, y);
    collect(width - 1, y);
  }

  const median = (values) => {
    const sorted = values.slice().sort((a, b) => a - b);
    return sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
  };
  const bgR = median(borderR);
  const bgG = median(borderG);
  const bgB = median(borderB);
  const background = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;
  const toleranceSq = 46 * 46;

  const isBackgroundLike = (index) => {
    const idx = index * 4;
    const dr = pixels[idx] - bgR;
    const dg = pixels[idx + 1] - bgG;
    const db = pixels[idx + 2] - bgB;
    return dr * dr + dg * dg + db * db <= toleranceSq;
  };
  const pushBackground = (index) => {
    if (index < 0 || index >= total || background[index] || !isBackgroundLike(index)) return;
    background[index] = 1;
    queue[tail++] = index;
  };

  for (let x = 0; x < width; x += 1) {
    pushBackground(x);
    pushBackground((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    pushBackground(y * width);
    pushBackground(y * width + width - 1);
  }

  while (head < tail) {
    const index = queue[head++];
    const x = index % width;
    const y = Math.floor(index / width);
    if (x > 0) pushBackground(index - 1);
    if (x + 1 < width) pushBackground(index + 1);
    if (y > 0) pushBackground(index - width);
    if (y + 1 < height) pushBackground(index + width);
  }

  for (let i = 0; i < total; i += 1) {
    if (!background[i] && pixels[i * 4 + 3] > 8) {
      mask[i] = 1;
      visibleTotal += 1;
    }
  }

  return { mask, width, height, visibleTotal, mode: 'edge-flood' };
}

function labelStickerComponents(mask, width, height) {
  const total = width * height;
  const labels = new Int32Array(total);
  const queue = new Int32Array(total);
  const components = [];
  let nextLabel = 0;

  for (let start = 0; start < total; start += 1) {
    if (!mask[start] || labels[start]) continue;
    nextLabel += 1;
    let head = 0;
    let tail = 0;
    queue[tail++] = start;
    labels[start] = nextLabel;
    let area = 0;
    let sumX = 0;
    let sumY = 0;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    while (head < tail) {
      const index = queue[head++];
      const x = index % width;
      const y = Math.floor(index / width);
      area += 1;
      sumX += x;
      sumY += y;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      const visit = (neighbor) => {
        if (neighbor < 0 || neighbor >= total || labels[neighbor] || !mask[neighbor]) return;
        labels[neighbor] = nextLabel;
        queue[tail++] = neighbor;
      };

      if (x > 0) visit(index - 1);
      if (x + 1 < width) visit(index + 1);
      if (y > 0) visit(index - width);
      if (y + 1 < height) visit(index + width);
      if (x > 0 && y > 0) visit(index - width - 1);
      if (x + 1 < width && y > 0) visit(index - width + 1);
      if (x > 0 && y + 1 < height) visit(index + width - 1);
      if (x + 1 < width && y + 1 < height) visit(index + width + 1);
    }

    components.push({
      id: nextLabel,
      area,
      cx: sumX / Math.max(1, area),
      cy: sumY / Math.max(1, area),
      minX,
      minY,
      maxX,
      maxY
    });
  }

  return { labels, components, componentCount: nextLabel };
}

function nearestStickerGroup(x, y, centers, cellWidth, cellHeight) {
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < centers.length; i += 1) {
    const dx = (x - centers[i].x) / Math.max(1, cellWidth);
    const dy = (y - centers[i].y) / Math.max(1, cellHeight);
    const distance = dx * dx + dy * dy;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  }
  return best;
}

function buildStickerOwnershipMap(foreground, labelled, centers, cellWidth, cellHeight) {
  const { mask, width, height } = foreground;
  const total = width * height;
  const pixelGroup = new Int16Array(total);
  pixelGroup.fill(-1);

  // Prefer thick interior pixels as seeds so a hand, caption or effect that
  // crosses an old grid boundary does not become the identity anchor.
  const coreMask = new Uint8Array(total);
  for (let y = 1; y + 1 < height; y += 1) {
    for (let x = 1; x + 1 < width; x += 1) {
      const index = y * width + x;
      if (!mask[index]) continue;
      let neighbors = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (mask[(y + dy) * width + x + dx]) neighbors += 1;
        }
      }
      if (neighbors >= 6) coreMask[index] = 1;
    }
  }

  const seedIndexes = new Int32Array(15);
  seedIndexes.fill(-1);
  const claimedSeed = new Uint8Array(total);
  const maxSeedDistanceSq = 0.95 * 0.95;

  for (let group = 0; group < 15; group += 1) {
    let bestCore = -1;
    let bestCoreDistance = Number.POSITIVE_INFINITY;
    let bestAny = -1;
    let bestAnyDistance = Number.POSITIVE_INFINITY;
    const center = centers[group];

    for (let index = 0; index < total; index += 1) {
      if (!mask[index] || claimedSeed[index]) continue;
      const x = index % width;
      const y = Math.floor(index / width);
      const dx = (x - center.x) / Math.max(1, cellWidth);
      const dy = (y - center.y) / Math.max(1, cellHeight);
      const distance = dx * dx + dy * dy;
      if (distance < bestAnyDistance) {
        bestAnyDistance = distance;
        bestAny = index;
      }
      if (coreMask[index] && distance < bestCoreDistance) {
        bestCoreDistance = distance;
        bestCore = index;
      }
    }

    let seed = -1;
    if (bestCore >= 0 && bestCoreDistance <= maxSeedDistanceSq) seed = bestCore;
    else if (bestAny >= 0 && bestAnyDistance <= maxSeedDistanceSq) seed = bestAny;
    if (seed < 0) continue;

    claimedSeed[seed] = 1;
    seedIndexes[group] = seed;
    pixelGroup[seed] = group;
  }

  // Multi-source geodesic growth (watershed-like ownership). If two generated
  // stickers touch and become one connected component, seeds from both bodies
  // expand through the actual foreground and meet at the contact area instead
  // of assigning the entire merged component to one sticker.
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;
  let seedCount = 0;
  for (let group = 0; group < 15; group += 1) {
    const seed = seedIndexes[group];
    if (seed < 0) continue;
    queue[tail++] = seed;
    seedCount += 1;
  }

  const visit = (neighbor, group) => {
    if (neighbor < 0 || neighbor >= total || !mask[neighbor] || pixelGroup[neighbor] >= 0) return;
    pixelGroup[neighbor] = group;
    queue[tail++] = neighbor;
  };

  while (head < tail) {
    const index = queue[head++];
    const group = pixelGroup[index];
    const x = index % width;
    const y = Math.floor(index / width);
    if (x > 0) visit(index - 1, group);
    if (x + 1 < width) visit(index + 1, group);
    if (y > 0) visit(index - width, group);
    if (y + 1 < height) visit(index + width, group);
    if (x > 0 && y > 0) visit(index - width - 1, group);
    if (x + 1 < width && y > 0) visit(index - width + 1, group);
    if (x > 0 && y + 1 < height) visit(index + width - 1, group);
    if (x + 1 < width && y + 1 < height) visit(index + width + 1, group);
  }

  // Detached captions, hearts, stars and other islands have no path to a body
  // seed. Keep each island intact and attach it to the nearest sticker centre.
  const fallbackGroup = new Int16Array(labelled.componentCount + 1);
  fallbackGroup.fill(-1);
  for (const component of labelled.components) {
    fallbackGroup[component.id] = nearestStickerGroup(
      component.cx,
      component.cy,
      centers,
      cellWidth,
      cellHeight
    );
  }

  for (let index = 0; index < total; index += 1) {
    if (!mask[index] || pixelGroup[index] >= 0) continue;
    const label = labelled.labels[index];
    if (label > 0 && fallbackGroup[label] >= 0) pixelGroup[index] = fallbackGroup[label];
  }

  return { pixelGroup, seedIndexes, seedCount };
}

function analyzeStickerContentGroups(canvas) {
  const sourceWidth = canvas.width;
  const sourceHeight = canvas.height;
  if (!sourceWidth || !sourceHeight) return null;

  const maxDimension = 720;
  const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const analysisCanvas = document.createElement('canvas');
  analysisCanvas.width = width;
  analysisCanvas.height = height;
  const ctx = analysisCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, width, height);

  const foreground = buildStickerForegroundMask(analysisCanvas);
  if (!foreground || foreground.visibleTotal < width * height * 0.01) return null;
  const labelled = labelStickerComponents(foreground.mask, width, height);
  if (!labelled.components.length) return null;

  const cellWidth = width / 5;
  const cellHeight = height / 3;
  const nominalCenters = [];
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      nominalCenters.push({ x: (col + 0.5) * cellWidth, y: (row + 0.5) * cellHeight });
    }
  }
  let centers = nominalCenters.map((center) => ({ ...center }));
  const minClusterArea = Math.max(3, Math.round(foreground.visibleTotal * 0.000015));
  const clusteringComponents = labelled.components.filter((component) => component.area >= minClusterArea);

  // The 5×3 grid is now only a set of soft starting positions. No pixel is ever
  // cropped at a grid boundary. Connected foreground components move the 15
  // centres toward the actual generated characters and captions.
  for (let iteration = 0; iteration < 5; iteration += 1) {
    const sumX = new Float64Array(15);
    const sumY = new Float64Array(15);
    const sumWeight = new Float64Array(15);

    for (const component of clusteringComponents) {
      const group = nearestStickerGroup(component.cx, component.cy, centers, cellWidth, cellHeight);
      const weight = Math.pow(component.area, 0.72);
      sumX[group] += component.cx * weight;
      sumY[group] += component.cy * weight;
      sumWeight[group] += weight;
    }

    centers = centers.map((center, index) => {
      if (!sumWeight[index]) return { ...center };
      const observedX = sumX[index] / sumWeight[index];
      const observedY = sumY[index] / sumWeight[index];
      const nominal = nominalCenters[index];
      const blendedX = observedX * 0.75 + nominal.x * 0.25;
      const blendedY = observedY * 0.75 + nominal.y * 0.25;
      return {
        x: Math.max(nominal.x - cellWidth * 0.38, Math.min(nominal.x + cellWidth * 0.38, blendedX)),
        y: Math.max(nominal.y - cellHeight * 0.38, Math.min(nominal.y + cellHeight * 0.38, blendedY))
      };
    });
  }

  const componentGroup = new Int16Array(labelled.componentCount + 1);
  componentGroup.fill(-1);
  const groupAreas = new Float64Array(15);
  const weightedX = new Float64Array(15);
  const weightedY = new Float64Array(15);

  for (const component of labelled.components) {
    const group = nearestStickerGroup(component.cx, component.cy, centers, cellWidth, cellHeight);
    componentGroup[component.id] = group;
    groupAreas[group] += component.area;
    weightedX[group] += component.cx * component.area;
    weightedY[group] += component.cy * component.area;
  }

  const ownership = buildStickerOwnershipMap(
    foreground,
    labelled,
    centers,
    cellWidth,
    cellHeight
  );

  let nonEmpty = 0;
  let alignmentSum = 0;
  const meaningfulArea = Math.max(10, foreground.visibleTotal * 0.012);
  const activeAreas = [];
  for (let i = 0; i < 15; i += 1) {
    if (groupAreas[i] < meaningfulArea) continue;
    nonEmpty += 1;
    activeAreas.push(groupAreas[i]);
    const gx = weightedX[i] / Math.max(1, groupAreas[i]);
    const gy = weightedY[i] / Math.max(1, groupAreas[i]);
    const dx = (gx - nominalCenters[i].x) / Math.max(1, cellWidth);
    const dy = (gy - nominalCenters[i].y) / Math.max(1, cellHeight);
    alignmentSum += Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 0.8);
  }
  const alignment = nonEmpty ? alignmentSum / nonEmpty : 0;
  const meanArea = activeAreas.reduce((sum, value) => sum + value, 0) / Math.max(1, activeAreas.length);
  const deviation = activeAreas.reduce((sum, value) => sum + Math.abs(value - meanArea), 0) / Math.max(1, activeAreas.length);
  const balance = meanArea > 0 ? Math.max(0, 1 - deviation / meanArea) : 0;
  const score = Math.min(1, (nonEmpty / 15) * 0.72 + alignment * 0.18 + balance * 0.10);

  return {
    analysisCanvas,
    foreground,
    labels: labelled.labels,
    components: labelled.components,
    componentGroup,
    pixelGroup: ownership.pixelGroup,
    ownershipSeedCount: ownership.seedCount,
    centers,
    nominalCenters,
    cellWidth,
    cellHeight,
    width,
    height,
    sourceWidth,
    sourceHeight,
    scaleX: sourceWidth / width,
    scaleY: sourceHeight / height,
    groupAreas,
    nonEmpty,
    alignment,
    balance,
    score
  };
}

async function detectEmoticonSheet(blob) {
  const { canvas } = await drawFileToCanvas(blob);
  const analysis = analyzeStickerContentGroups(canvas);
  if (!analysis) return { status: 'not-sheet', confidence: 0 };
  const confidence = analysis.score;
  if (analysis.nonEmpty >= 14 && confidence >= 0.72) return { status: 'sheet', confidence, cols: 5, rows: 3 };
  if (analysis.nonEmpty >= 12 && confidence >= 0.52) return { status: 'ambiguous', confidence, cols: 5, rows: 3 };
  return { status: 'not-sheet', confidence };
}

async function splitIntoFifteen(blob) {
  const { canvas, ctx } = await drawFileToCanvas(blob);
  const width = canvas.width;
  const height = canvas.height;
  const analysis = analyzeStickerContentGroups(canvas);
  if (!analysis || analysis.nonEmpty < 12) throw new Error('Could not reliably detect 15 sticker groups');

  const sourceForeground = buildStickerForegroundMask(canvas);
  if (!sourceForeground) throw new Error('Could not analyze sticker foreground');
  const groupBounds = Array.from({ length: 15 }, () => ({ minX: width, minY: height, maxX: -1, maxY: -1, count: 0 }));
  const nearestFallback = (analysisX, analysisY) => nearestStickerGroup(
    analysisX,
    analysisY,
    analysis.centers,
    analysis.cellWidth,
    analysis.cellHeight
  );
  const groupForSourcePixel = (x, y) => {
    const analysisX = Math.max(0, Math.min(analysis.width - 1, Math.floor(x / analysis.scaleX)));
    const analysisY = Math.max(0, Math.min(analysis.height - 1, Math.floor(y / analysis.scaleY)));
    const readOwner = (sampleX, sampleY) => {
      if (sampleX < 0 || sampleY < 0 || sampleX >= analysis.width || sampleY >= analysis.height) return -1;
      const group = analysis.pixelGroup[sampleY * analysis.width + sampleX];
      return group >= 0 ? group : -1;
    };

    const directGroup = readOwner(analysisX, analysisY);
    if (directGroup >= 0) return directGroup;

    // Downscaling can erase a one-pixel hair tip, finger, caption stroke or
    // effect. Recover ownership from a weighted neighbourhood vote rather than
    // one nearest label; this is much more stable close to two touching stickers.
    const votes = new Float64Array(15);
    const recoveryRadius = 4;
    for (let dy = -recoveryRadius; dy <= recoveryRadius; dy += 1) {
      for (let dx = -recoveryRadius; dx <= recoveryRadius; dx += 1) {
        if (dx === 0 && dy === 0) continue;
        const group = readOwner(analysisX + dx, analysisY + dy);
        if (group < 0) continue;
        const distance = Math.sqrt(dx * dx + dy * dy);
        votes[group] += 1 / (1 + distance);
      }
    }

    let recoveredGroup = -1;
    let recoveredVote = 0;
    for (let group = 0; group < 15; group += 1) {
      if (votes[group] <= recoveredVote) continue;
      recoveredVote = votes[group];
      recoveredGroup = group;
    }
    if (recoveredGroup >= 0) return recoveredGroup;
    return nearestFallback(analysisX, analysisY);
  };

  // First pass: assign every foreground pixel to a content group and measure the
  // real content bounds. There are no cell rectangles and no hard crop lines.
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sourceIndex = y * width + x;
      if (!sourceForeground.mask[sourceIndex]) continue;
      const group = groupForSourcePixel(x, y);
      const bounds = groupBounds[group];
      bounds.count += 1;
      if (x < bounds.minX) bounds.minX = x;
      if (x > bounds.maxX) bounds.maxX = x;
      if (y < bounds.minY) bounds.minY = y;
      if (y > bounds.maxY) bounds.maxY = y;
    }
  }

  // Re-evaluate small disconnected captions/effects at source resolution. The
  // watershed remains authoritative for large/touching bodies; only compact
  // connected components are allowed to move as a whole. This protects labels
  // such as "헐", hearts and sparkles that sit close to a neighbouring sticker.
  const sourceLabelled = labelStickerComponents(sourceForeground.mask, width, height);
  const floatingOverride = new Int16Array(sourceLabelled.componentCount + 1);
  floatingOverride.fill(-1);
  const componentVotes = new Int32Array((sourceLabelled.componentCount + 1) * 15);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sourceIndex = y * width + x;
      if (!sourceForeground.mask[sourceIndex]) continue;
      const label = sourceLabelled.labels[sourceIndex];
      if (label <= 0) continue;
      const group = groupForSourcePixel(x, y);
      componentVotes[label * 15 + group] += 1;
    }
  }

  const componentOwner = new Int16Array(sourceLabelled.componentCount + 1);
  componentOwner.fill(-1);
  for (const component of sourceLabelled.components) {
    let bestGroup = -1;
    let bestVotes = -1;
    const voteOffset = component.id * 15;
    for (let group = 0; group < 15; group += 1) {
      const votes = componentVotes[voteOffset + group];
      if (votes <= bestVotes) continue;
      bestVotes = votes;
      bestGroup = group;
    }
    componentOwner[component.id] = bestGroup;
  }

  const sourceCellWidth = width / 5;
  const sourceCellHeight = height / 3;
  const sourceCellArea = Math.max(1, sourceCellWidth * sourceCellHeight);
  const maxFloatingArea = Math.max(40, Math.round(sourceCellArea * 0.16));
  const maxFloatingWidth = sourceCellWidth * 0.78;
  const maxFloatingHeight = sourceCellHeight * 0.48;
  const bodyBounds = Array.from({ length: 15 }, () => ({
    minX: width,
    minY: height,
    maxX: -1,
    maxY: -1,
    count: 0
  }));

  const isFloatingCandidate = (component) => {
    const componentWidth = component.maxX - component.minX + 1;
    const componentHeight = component.maxY - component.minY + 1;
    return component.area <= maxFloatingArea
      && componentWidth <= maxFloatingWidth
      && componentHeight <= maxFloatingHeight;
  };

  const expandBounds = (bounds, component) => {
    bounds.count += component.area;
    if (component.minX < bounds.minX) bounds.minX = component.minX;
    if (component.maxX > bounds.maxX) bounds.maxX = component.maxX;
    if (component.minY < bounds.minY) bounds.minY = component.minY;
    if (component.maxY > bounds.maxY) bounds.maxY = component.maxY;
  };

  // Build stable body bounds from substantial components only. Small words and
  // decorative islands therefore cannot pull a neighbouring body's centre/bounds.
  for (const component of sourceLabelled.components) {
    const owner = componentOwner[component.id];
    if (owner < 0 || isFloatingCandidate(component)) continue;
    expandBounds(bodyBounds[owner], component);
  }

  const boundsCentre = (bounds, fallback) => {
    if (bounds && bounds.maxX >= bounds.minX && bounds.maxY >= bounds.minY) {
      return {
        x: (bounds.minX + bounds.maxX) * 0.5,
        y: (bounds.minY + bounds.maxY) * 0.5
      };
    }
    return fallback;
  };

  const distanceToBounds = (x, y, bounds) => {
    if (!bounds || bounds.maxX < bounds.minX || bounds.maxY < bounds.minY) {
      return Number.POSITIVE_INFINITY;
    }
    const dx = x < bounds.minX ? bounds.minX - x : x > bounds.maxX ? x - bounds.maxX : 0;
    const dy = y < bounds.minY ? bounds.minY - y : y > bounds.maxY ? y - bounds.maxY : 0;
    return Math.hypot(dx / Math.max(1, sourceCellWidth), dy / Math.max(1, sourceCellHeight));
  };

  let floatingReassigned = 0;
  for (const component of sourceLabelled.components) {
    if (!isFloatingCandidate(component)) continue;
    const currentOwner = componentOwner[component.id];
    let bestGroup = currentOwner;
    let bestScore = Number.POSITIVE_INFINITY;
    let bestBoundsDistance = Number.POSITIVE_INFINITY;
    let currentScore = Number.POSITIVE_INFINITY;

    for (let group = 0; group < 15; group += 1) {
      const stableBounds = bodyBounds[group].count > 0 ? bodyBounds[group] : groupBounds[group];
      if (!stableBounds || stableBounds.maxX < stableBounds.minX || stableBounds.maxY < stableBounds.minY) continue;
      const fallbackCenter = {
        x: analysis.centers[group].x * analysis.scaleX,
        y: analysis.centers[group].y * analysis.scaleY
      };
      const bodyCenter = boundsCentre(stableBounds, fallbackCenter);
      const boundsDistance = distanceToBounds(component.cx, component.cy, stableBounds);
      const centerDx = (component.cx - bodyCenter.x) / Math.max(1, sourceCellWidth);
      const centerDy = (component.cy - bodyCenter.y) / Math.max(1, sourceCellHeight);
      const centerDistance = Math.hypot(centerDx, centerDy);
      const rowDistance = Math.abs(centerDy);
      const rowPenalty = rowDistance <= 0.68 ? 0 : (rowDistance - 0.68) * 2.4;
      const ownerBias = group === currentOwner ? -0.08 : 0;
      const score = boundsDistance * 1.75 + centerDistance * 0.42 + rowPenalty + ownerBias;

      if (group === currentOwner) currentScore = score;
      if (score >= bestScore) continue;
      bestScore = score;
      bestGroup = group;
      bestBoundsDistance = boundsDistance;
    }

    // Require proximity to a real body and a meaningful improvement before a
    // component changes owners. This keeps noise/confetti stable while allowing
    // captions straddling an old grid boundary to follow the visually nearest body.
    const canMove = bestGroup >= 0
      && bestGroup !== currentOwner
      && bestBoundsDistance <= 0.72
      && (currentOwner < 0 || bestScore + 0.045 < currentScore);
    if (!canMove) continue;
    floatingOverride[component.id] = bestGroup;
    floatingReassigned += 1;
  }

  const finalGroupForSourcePixel = (x, y) => {
    const sourceIndex = y * width + x;
    const label = sourceLabelled.labels[sourceIndex];
    if (label > 0) {
      const override = floatingOverride[label];
      if (override >= 0) return override;
    }
    return groupForSourcePixel(x, y);
  };

  if (floatingReassigned > 0) {
    for (const bounds of groupBounds) {
      bounds.minX = width;
      bounds.minY = height;
      bounds.maxX = -1;
      bounds.maxY = -1;
      bounds.count = 0;
    }
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const sourceIndex = y * width + x;
        if (!sourceForeground.mask[sourceIndex]) continue;
        const group = finalGroupForSourcePixel(x, y);
        const bounds = groupBounds[group];
        bounds.count += 1;
        if (x < bounds.minX) bounds.minX = x;
        if (x > bounds.maxX) bounds.maxX = x;
        if (y < bounds.minY) bounds.minY = y;
        if (y > bounds.maxY) bounds.maxY = y;
      }
    }
  }

  const totalVisible = sourceForeground.visibleTotal;
  const minimumGroupPixels = Math.max(24, Math.round(totalVisible * 0.006));
  const detectedGroups = groupBounds.filter((bounds) => bounds.count >= minimumGroupPixels).length;
  if (detectedGroups < 12) throw new Error('Could not reliably separate sticker content groups');

  const items = [];
  const basePadding = Math.max(14, Math.round(Math.min(width / 5, height / 3) * 0.12));

  for (let group = 0; group < 15; group += 1) {
    const bounds = groupBounds[group];
    if (bounds.maxX < bounds.minX || bounds.maxY < bounds.minY) {
      throw new Error('A sticker content group is empty');
    }

    // Final crop is only around the pixels already assigned to this sticker.
    // It may overlap the position of another sticker, but foreign pixels are
    // masked out below, so hands/captions can cross former grid boundaries safely.
    const minX = Math.max(0, bounds.minX - basePadding);
    const minY = Math.max(0, bounds.minY - basePadding);
    const maxX = Math.min(width - 1, bounds.maxX + basePadding);
    const maxY = Math.min(height - 1, bounds.maxY + basePadding);
    const cropWidth = Math.max(1, maxX - minX + 1);
    const cropHeight = Math.max(1, maxY - minY + 1);
    const imageData = ctx.getImageData(minX, minY, cropWidth, cropHeight);
    const data = imageData.data;

    for (let localY = 0; localY < cropHeight; localY += 1) {
      const sourceY = minY + localY;
      for (let localX = 0; localX < cropWidth; localX += 1) {
        const sourceX = minX + localX;
        const localIndex = localY * cropWidth + localX;
        const rgbaIndex = localIndex * 4;
        const sourceIndex = sourceY * width + sourceX;
        if (!sourceForeground.mask[sourceIndex] || finalGroupForSourcePixel(sourceX, sourceY) !== group) {
          data[rgbaIndex] = 0;
          data[rgbaIndex + 1] = 0;
          data[rgbaIndex + 2] = 0;
          data[rgbaIndex + 3] = 0;
        }
      }
    }

    // Keep a transparent safety border around every extracted sticker. This
    // avoids a visually clipped result after later resize/export steps without
    // shrinking the actual sticker pixels.
    const outputSafetyMargin = Math.max(8, Math.round(Math.min(cropWidth, cropHeight) * 0.08));
    const output = document.createElement('canvas');
    output.width = cropWidth + outputSafetyMargin * 2;
    output.height = cropHeight + outputSafetyMargin * 2;
    const outputCtx = output.getContext('2d');
    if (!outputCtx) throw new Error('Canvas 2D is unavailable');
    outputCtx.putImageData(imageData, outputSafetyMargin, outputSafetyMargin);

    const itemBlob = await canvasToPngBlob(output);
    items.push({ index: group + 1, blob: itemBlob, width: output.width, height: output.height });
  }

  if (items.length !== 15) throw new Error('Could not create 15 sticker outputs');
  return items;
}

`

      transformed = transformed.slice(0, start) + replacement + transformed.slice(end)
      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), preciseStickerSheetSplit()],
})
