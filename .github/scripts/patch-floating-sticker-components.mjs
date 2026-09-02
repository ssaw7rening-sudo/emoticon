import fs from 'node:fs';

const file = 'vite.precise-sticker-split.config.js';
let source = fs.readFileSync(file, 'utf8');

function replaceOnce(oldText, newText, label) {
  const first = source.indexOf(oldText);
  if (first < 0) throw new Error(`Missing patch anchor: ${label}`);
  if (source.indexOf(oldText, first + oldText.length) >= 0) {
    throw new Error(`Patch anchor is not unique: ${label}`);
  }
  source = source.slice(0, first) + newText + source.slice(first + oldText.length);
}

replaceOnce(
  "name: 'precise-sticker-sheet-split-v7-object-watershed'",
  "name: 'precise-sticker-sheet-split-v8-floating-component-reattach'",
  'plugin version'
);

const floatingReattachBlock = `  // Re-evaluate small disconnected captions/effects at source resolution. The
  // watershed remains authoritative for large/touching bodies; only compact
  // connected components are allowed to move as a whole. This protects labels
  // such as \"헐\", hearts and sparkles that sit close to a neighbouring sticker.
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

`;

replaceOnce(
  '  const totalVisible = sourceForeground.visibleTotal;',
  floatingReattachBlock + '  const totalVisible = sourceForeground.visibleTotal;',
  'floating component reattach insertion'
);

replaceOnce(
  '        if (!sourceForeground.mask[sourceIndex] || groupForSourcePixel(sourceX, sourceY) !== group) {',
  '        if (!sourceForeground.mask[sourceIndex] || finalGroupForSourcePixel(sourceX, sourceY) !== group) {',
  'final crop owner lookup'
);

if (!source.includes("precise-sticker-sheet-split-v8-floating-component-reattach")) {
  throw new Error('Version marker was not applied');
}
if (!source.includes('const floatingOverride = new Int16Array')) {
  throw new Error('Floating override map was not applied');
}
if (!source.includes('bestBoundsDistance <= 0.72')) {
  throw new Error('Floating proximity guard was not applied');
}
if (!source.includes('finalGroupForSourcePixel(sourceX, sourceY)')) {
  throw new Error('Final crop does not use reattached ownership');
}

fs.writeFileSync(file, source);
