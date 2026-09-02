import fs from 'node:fs';

const file = 'vite.precise-sticker-split.config.js';
let source = fs.readFileSync(file, 'utf8');

function replaceOnce(oldText, newText, label) {
  const first = source.indexOf(oldText);
  if (first < 0) throw new Error(`Missing patch anchor: ${label}`);
  if (source.indexOf(oldText, first + oldText.length) >= 0) throw new Error(`Patch anchor is not unique: ${label}`);
  source = source.slice(0, first) + newText + source.slice(first + oldText.length);
}

replaceOnce(
  "name: 'precise-sticker-sheet-split-v6-content-groups'",
  "name: 'precise-sticker-sheet-split-v7-object-watershed'",
  'plugin version'
);

const analyzeMarker = 'function analyzeStickerContentGroups(canvas) {';
const ownershipHelper = `function buildStickerOwnershipMap(foreground, labelled, centers, cellWidth, cellHeight) {
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

`;

if (!source.includes(analyzeMarker)) throw new Error('Missing analyze function marker');
source = source.replace(analyzeMarker, ownershipHelper + analyzeMarker);

const componentAssignmentTail = `  for (const component of labelled.components) {
    const group = nearestStickerGroup(component.cx, component.cy, centers, cellWidth, cellHeight);
    componentGroup[component.id] = group;
    groupAreas[group] += component.area;
    weightedX[group] += component.cx * component.area;
    weightedY[group] += component.cy * component.area;
  }

`;
replaceOnce(
  componentAssignmentTail,
  componentAssignmentTail + `  const ownership = buildStickerOwnershipMap(
    foreground,
    labelled,
    centers,
    cellWidth,
    cellHeight
  );

`,
  'component assignment tail'
);

replaceOnce(
  `    componentGroup,\n    centers,`,
  `    componentGroup,\n    pixelGroup: ownership.pixelGroup,\n    ownershipSeedCount: ownership.seedCount,\n    centers,`,
  'analysis return ownership'
);

const groupFunctionStart = source.indexOf('  const groupForSourcePixel = (x, y) => {');
const firstPassMarker = '\n\n  // First pass: assign every foreground pixel to a content group';
const groupFunctionEnd = source.indexOf(firstPassMarker, groupFunctionStart);
if (groupFunctionStart < 0 || groupFunctionEnd < 0) throw new Error('Missing source pixel ownership block');

const newGroupFunction = `  const groupForSourcePixel = (x, y) => {
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
  };`;

source = source.slice(0, groupFunctionStart) + newGroupFunction + source.slice(groupFunctionEnd);

if (!source.includes("precise-sticker-sheet-split-v7-object-watershed")) throw new Error('Version marker was not applied');
if (!source.includes('buildStickerOwnershipMap')) throw new Error('Ownership helper was not applied');
if (!source.includes('pixelGroup: ownership.pixelGroup')) throw new Error('Ownership map is not returned');
if (!source.includes('const recoveryRadius = 4;')) throw new Error('Neighbourhood recovery was not applied');

fs.writeFileSync(file, source);
