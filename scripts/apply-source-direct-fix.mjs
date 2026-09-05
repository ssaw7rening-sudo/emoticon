import fs from 'node:fs';

const bgPath = 'src/components/BackgroundRemover.jsx';
const postPath = 'src/components/EmoticonPostProcessor.jsx';
const buildPath = 'scripts/build-app.mjs';
const verifyPath = 'scripts/verify-source-safe-build.mjs';
const configPath = 'vite.source-direct.config.js';

function replaceOnce(text, from, to, label) {
  if (!text.includes(from)) throw new Error(`[source-direct] ${label} anchor not found`);
  return text.replace(from, to);
}

let post = fs.readFileSync(postPath, 'utf8').replace(/\r\n/g, '\n');
if (!post.includes('SOURCE_DIRECT_EXPORT')) {
  post = replaceOnce(
    post,
    '    const blob = await makeOutput(item.blob, transform, outputScale);',
    '    const blob = await makeOutputForItem(item, transform, outputScale);',
    'single save call'
  );
  post = replaceOnce(
    post,
    '        const blob = await makeOutput(item.blob, transform, outputScale);',
    '        const blob = await makeOutputForItem(item, transform, outputScale);',
    'normalize-all call'
  );
  post = replaceOnce(
    post,
    "          blob = await makeOutput(item.blob, item.transform || { zoom: 1, x: 0, y: 0 }, outputScale);",
    "          blob = await makeOutputForItem(item, item.transform || { zoom: 1, x: 0, y: 0 }, outputScale);",
    'zip call'
  );

  const anchor = 'async function makeOutput(blob, transform = { zoom: 1, x: 0, y: 0 }, outputScale = 1) {';
  const helper = `async function makeOutputForItem(item, transform = { zoom: 1, x: 0, y: 0 }, outputScale = 1) {
  const SOURCE_DIRECT_EXPORT = 'SOURCE_DIRECT_EXPORT';
  void SOURCE_DIRECT_EXPORT;

  const pixels = item?.pixelData;
  const sourceWidth = Math.max(0, Number(item?.pixelWidth || 0));
  const sourceHeight = Math.max(0, Number(item?.pixelHeight || 0));
  const directRequired = item?.splitEngine === 'SOURCE_DIRECT';
  const validDirect = Boolean(
    item?.pixelSafe && pixels && sourceWidth && sourceHeight &&
    pixels.length === sourceWidth * sourceHeight * 4
  );

  if (directRequired && !validDirect) {
    throw new Error('SOURCE_DIRECT_EXPORT: original RGBA payload is missing');
  }
  if (!validDirect) return makeOutput(item.blob, transform, outputScale);

  const scaleFactor = [1, 2, 4].includes(outputScale) ? outputScale : 1;
  const size = 360 * scaleFactor;
  const safeSize = 300 * scaleFactor;
  const zoom = Math.max(0.55, Math.min(1.45, transform?.zoom || 1));
  const fit = Math.min(safeSize / Math.max(1, sourceWidth), safeSize / Math.max(1, sourceHeight));
  const drawScale = fit * zoom;
  const drawW = sourceWidth * drawScale;
  const drawH = sourceHeight * drawScale;
  const offsetX = (size - drawW) / 2 + (transform?.x || 0) * scaleFactor;
  const offsetY = (size - drawH) / 2 + (transform?.y || 0) * scaleFactor;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas unavailable');
  const image = ctx.createImageData(size, size);
  const out = image.data;

  const sourceIndex = (x, y) => {
    const sx = Math.max(0, Math.min(sourceWidth - 1, x));
    const sy = Math.max(0, Math.min(sourceHeight - 1, y));
    return (sy * sourceWidth + sx) * 4;
  };

  const minX = Math.max(0, Math.floor(offsetX));
  const maxX = Math.min(size - 1, Math.ceil(offsetX + drawW) - 1);
  const minY = Math.max(0, Math.floor(offsetY));
  const maxY = Math.min(size - 1, Math.ceil(offsetY + drawH) - 1);

  for (let oy = minY; oy <= maxY; oy += 1) {
    const sy = ((oy + 0.5 - offsetY) / drawScale) - 0.5;
    const y0 = Math.floor(sy);
    const y1 = y0 + 1;
    const fy = sy - y0;
    for (let ox = minX; ox <= maxX; ox += 1) {
      const sx = ((ox + 0.5 - offsetX) / drawScale) - 0.5;
      const x0 = Math.floor(sx);
      const x1 = x0 + 1;
      const fx = sx - x0;
      const ids = [sourceIndex(x0, y0), sourceIndex(x1, y0), sourceIndex(x0, y1), sourceIndex(x1, y1)];
      const weights = [(1 - fx) * (1 - fy), fx * (1 - fy), (1 - fx) * fy, fx * fy];
      let coverage = 0;
      let rr = 0, gg = 0, bb = 0;
      for (let i = 0; i < 4; i += 1) {
        const p = ids[i];
        if (pixels[p + 3] === 0) continue;
        coverage += weights[i];
        rr += pixels[p] * weights[i];
        gg += pixels[p + 1] * weights[i];
        bb += pixels[p + 2] * weights[i];
      }
      if (coverage <= 0.02) continue;
      const dp = (oy * size + ox) * 4;
      out[dp] = Math.round(rr / coverage);
      out[dp + 1] = Math.round(gg / coverage);
      out[dp + 2] = Math.round(bb / coverage);
      out[dp + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvasToBlob(canvas);
}

`;
  post = replaceOnce(post, anchor, helper + anchor, 'makeOutput insertion');
  fs.writeFileSync(postPath, post);
}

let bg = fs.readFileSync(bgPath, 'utf8').replace(/\r\n/g, '\n');
if (!bg.includes('SOURCE_DIRECT_SPLIT')) {
  const anchor = 'async function hasRealTransparency(file) {';
  const splitter = `async function splitIntoFifteenSourceSafe(input, sourceFile = null) {
  const SOURCE_DIRECT_SPLIT = 'SOURCE_DIRECT_SPLIT';
  void SOURCE_DIRECT_SPLIT;

  if (!sourceFile) return splitIntoFifteen(input);

  let source;
  try {
    source = await drawFileToCanvas(sourceFile);
  } catch (error) {
    console.warn('Direct source decode failed; using processed split:', error);
    return splitIntoFifteen(input);
  }

  const canvas = source.canvas;
  const ctx = source.ctx;
  const width = canvas.width;
  const height = canvas.height;
  if (!width || !height) return splitIntoFifteen(input);

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const border = [];
  const sampleStep = Math.max(1, Math.floor(Math.min(width, height) / 600));
  const sample = (x, y) => {
    const p = (y * width + x) * 4;
    const r = pixels[p], g = pixels[p + 1], b = pixels[p + 2];
    const l = r * 0.2126 + g * 0.7152 + b * 0.0722;
    border.push({ r, g, b, l });
  };
  for (let x = 0; x < width; x += sampleStep) { sample(x, 0); sample(x, height - 1); }
  for (let y = sampleStep; y < height - 1; y += sampleStep) { sample(0, y); sample(width - 1, y); }

  const dark = border.filter((c) => c.l <= 90 && Math.max(c.r, c.g, c.b) <= 115);
  if (!border.length || dark.length / border.length < 0.58) return splitIntoFifteen(input);

  const bgColor = dark.reduce((acc, c) => [acc[0] + c.r, acc[1] + c.g, acc[2] + c.b], [0, 0, 0]);
  bgColor[0] /= dark.length; bgColor[1] /= dark.length; bgColor[2] /= dark.length;
  const distances = dark.map((c) => Math.sqrt(
    (c.r - bgColor[0]) ** 2 + (c.g - bgColor[1]) ** 2 + (c.b - bgColor[2]) ** 2
  )).sort((a, b) => a - b);
  const p95 = distances[Math.min(distances.length - 1, Math.floor(distances.length * 0.95))] || 0;
  const tolerance = Math.max(14, Math.min(34, p95 + 14));

  const total = width * height;
  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0, tail = 0;
  const isBackground = (index) => {
    const p = index * 4;
    const r = pixels[p], g = pixels[p + 1], b = pixels[p + 2];
    const l = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const d = Math.sqrt((r - bgColor[0]) ** 2 + (g - bgColor[1]) ** 2 + (b - bgColor[2]) ** 2);
    return l <= 105 && d <= tolerance;
  };
  const enqueue = (index) => {
    if (index < 0 || index >= total || visited[index] || !isBackground(index)) return;
    visited[index] = 1;
    queue[tail++] = index;
  };
  for (let x = 0; x < width; x += 1) { enqueue(x); enqueue((height - 1) * width + x); }
  for (let y = 1; y < height - 1; y += 1) { enqueue(y * width); enqueue(y * width + width - 1); }
  while (head < tail) {
    const index = queue[head++];
    const x = index % width;
    const y = Math.floor(index / width);
    if (x > 0) enqueue(index - 1);
    if (x + 1 < width) enqueue(index + 1);
    if (y > 0) enqueue(index - width);
    if (y + 1 < height) enqueue(index + width);
  }

  const removedRatio = tail / Math.max(1, total);
  if (removedRatio < 0.08 || removedRatio > 0.94) return splitIntoFifteen(input);

  for (let index = 0; index < total; index += 1) {
    pixels[index * 4 + 3] = visited[index] ? 0 : 255;
  }
  ctx.putImageData(imageData, 0, 0);

  const rows = 3, columns = 5;
  const cellW = width / columns, cellH = height / rows;
  const items = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const left = Math.floor(column * cellW);
      const top = Math.floor(row * cellH);
      const right = Math.min(width, Math.ceil((column + 1) * cellW));
      const bottom = Math.min(height, Math.ceil((row + 1) * cellH));
      let minX = right, minY = bottom, maxX = left - 1, maxY = top - 1;
      for (let y = top; y < bottom; y += 1) {
        for (let x = left; x < right; x += 1) {
          if (pixels[(y * width + x) * 4 + 3] === 0) continue;
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
      const hasContent = minX <= maxX && minY <= maxY;
      const pad = Math.max(8, Math.round(Math.min(cellW, cellH) * 0.045));
      const cropLeft = hasContent ? Math.max(left, minX - pad) : left;
      const cropTop = hasContent ? Math.max(top, minY - pad) : top;
      const cropRight = hasContent ? Math.min(right, maxX + 1 + pad) : right;
      const cropBottom = hasContent ? Math.min(bottom, maxY + 1 + pad) : bottom;
      const cropW = Math.max(1, cropRight - cropLeft);
      const cropH = Math.max(1, cropBottom - cropTop);
      const safety = Math.max(8, Math.round(Math.min(cropW, cropH) * 0.055));
      const output = document.createElement('canvas');
      output.width = cropW + safety * 2;
      output.height = cropH + safety * 2;
      const outCtx = output.getContext('2d', { willReadFrequently: true });
      if (!outCtx) throw new Error('Canvas 2D is unavailable');
      const outImage = outCtx.createImageData(output.width, output.height);
      const out = outImage.data;
      for (let y = 0; y < cropH; y += 1) {
        for (let x = 0; x < cropW; x += 1) {
          const sp = ((cropTop + y) * width + (cropLeft + x)) * 4;
          const dp = ((y + safety) * output.width + (x + safety)) * 4;
          out[dp] = pixels[sp];
          out[dp + 1] = pixels[sp + 1];
          out[dp + 2] = pixels[sp + 2];
          out[dp + 3] = pixels[sp + 3] === 0 ? 0 : 255;
        }
      }
      outCtx.putImageData(outImage, 0, 0);
      const blob = await canvasToPngBlob(output);
      items.push({
        index: items.length + 1,
        blob,
        width: output.width,
        height: output.height,
        pixelSafe: true,
        pixelData: new Uint8ClampedArray(out),
        pixelWidth: output.width,
        pixelHeight: output.height,
        splitEngine: 'SOURCE_DIRECT',
        needsReview: false,
        reviewReasons: []
      });
    }
  }
  if (items.length !== 15) throw new Error('Could not create 15 sticker outputs');
  return items;
}

`;
  bg = replaceOnce(bg, anchor, splitter + anchor, 'splitter insertion');
  bg = replaceOnce(
    bg,
    '      const items = await splitIntoFifteen(resultBlob);',
    '      const items = await splitIntoFifteenSourceSafe(resultBlob, file);',
    'auto split source call'
  );
  fs.writeFileSync(bgPath, bg);
}

fs.writeFileSync(configPath, `import { defineConfig } from 'vite'\nimport baseConfig from './vite.ui-runtime-cleanup.config.js'\n\nexport default defineConfig({\n  ...baseConfig,\n  plugins: [...(baseConfig.plugins || [])],\n})\n`);

let build = fs.readFileSync(buildPath, 'utf8').replace(/\r\n/g, '\n');
build = build.replace(/vite\.source-safe(?:\.locked)?\.config\.js/g, 'vite.source-direct.config.js');
fs.writeFileSync(buildPath, build);

fs.writeFileSync(verifyPath, `import fs from 'node:fs';\nimport path from 'node:path';\nimport { fileURLToPath } from 'node:url';\n\nconst rootDir = fileURLToPath(new URL('..', import.meta.url));\nconst assetsDir = path.join(rootDir, 'dist', 'assets');\nif (!fs.existsSync(assetsDir)) process.exit(1);\nconst bundle = fs.readdirSync(assetsDir).filter((name) => name.endsWith('.js')).map((name) => fs.readFileSync(path.join(assetsDir, name), 'utf8')).join('\\n');\nconst required = [['direct source split', 'SOURCE_DIRECT_SPLIT'], ['direct RGBA export', 'SOURCE_DIRECT_EXPORT'], ['direct engine', 'SOURCE_DIRECT']];\nlet failed = false;\nfor (const [label, marker] of required) {\n  if (!bundle.includes(marker)) { console.error('[source-direct-check] missing ' + label + ': ' + marker); failed = true; }\n  else console.log('[source-direct-check] ok: ' + label);\n}\nif (failed) process.exit(1);\nconsole.log('[source-direct-check] source-level split and export are present in production bundle');\n`);

console.log('Source-direct emoticon pipeline applied.');
