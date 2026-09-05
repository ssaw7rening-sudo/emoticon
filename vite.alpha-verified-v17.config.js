import { defineConfig } from 'vite'
import baseConfig from './vite.direct-first-v16.config.js'

function mobileSaveDecoderPre() {
  return {
    name: 'pixel-safe-save-v20-pre',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/EmoticonPostProcessor.jsx')) return null
      let transformed = code.replace(/\r\n/g, '\n')

      // Keep the non-direct fallback safe on Android too.
      const oldLoader = `async function loadBitmap(blob) {
  if (typeof createImageBitmap === 'function') return createImageBitmap(blob);
  const url = URL.createObjectURL(blob);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}`
      const safeLoader = `async function loadBitmap(blob) {
  const url = URL.createObjectURL(blob);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'sync';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('PNG image decode failed'));
      img.src = url;
    });
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}`
      if (!transformed.includes(oldLoader)) {
        throw new Error('[pixel-safe-v20] original loadBitmap anchor not found')
      }
      transformed = transformed.replace(oldLoader, safeLoader)

      // Replace every finish/save path before inserting the helper so the helper's
      // own fallback call remains makeOutput(item.blob, ...).
      const saveCall = 'makeOutput(item.blob,'
      const saveCallCount = transformed.split(saveCall).length - 1
      if (saveCallCount < 3) {
        throw new Error(`[pixel-safe-v20] expected at least 3 item export calls, found ${saveCallCount}`)
      }
      transformed = transformed.replaceAll(saveCall, 'makeOutputForItem(item,')

      const makeOutputAnchor = 'async function makeOutput(blob, transform = { zoom: 1, x: 0, y: 0 }, outputScale = 1) {'
      if (!transformed.includes(makeOutputAnchor)) {
        throw new Error('[pixel-safe-v20] makeOutput anchor not found')
      }

      const pixelSafeHelper = `async function makePixelSafeOutput(item, transform = { zoom: 1, x: 0, y: 0 }, outputScale = 1) {
  const pixels = item?.pixelData;
  const sourceWidth = Math.max(0, Number(item?.pixelWidth || 0));
  const sourceHeight = Math.max(0, Number(item?.pixelHeight || 0));
  if (!pixels || !sourceWidth || !sourceHeight || pixels.length !== sourceWidth * sourceHeight * 4) {
    return makeOutput(item.blob, transform, outputScale);
  }

  // Reconstruct directly from the exact RGBA bytes captured at split time.
  // No PNG/JPEG/ImageBitmap decoding occurs in this path.
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = sourceWidth;
  sourceCanvas.height = sourceHeight;
  const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  if (!sourceCtx) throw new Error('Canvas unavailable');
  const sourceImage = sourceCtx.createImageData(sourceWidth, sourceHeight);
  sourceImage.data.set(pixels);
  sourceCtx.putImageData(sourceImage, 0, 0);

  const scaleFactor = [1, 2, 4].includes(outputScale) ? outputScale : 1;
  const size = 360 * scaleFactor;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas unavailable');

  ctx.clearRect(0, 0, size, size);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const safeSize = 300 * scaleFactor;
  const fit = Math.min(safeSize / Math.max(1, sourceWidth), safeSize / Math.max(1, sourceHeight));
  const zoom = Math.max(0.55, Math.min(1.45, transform?.zoom || 1));
  const drawScale = fit * zoom;
  const drawW = sourceWidth * drawScale;
  const drawH = sourceHeight * drawScale;
  const x = (size - drawW) / 2 + (transform?.x || 0) * scaleFactor;
  const y = (size - drawH) / 2 + (transform?.y || 0) * scaleFactor;
  ctx.drawImage(sourceCanvas, x, y, drawW, drawH);

  if (scaleFactor > 1) sharpenCanvas(canvas, scaleFactor === 4 ? 0.11 : 0.075);

  // Final binary-alpha guarantee after resizing: true background remains 0 and
  // every retained subject pixel remains fully opaque. This prevents white/ivory
  // faces and legs from becoming transparent during the finish/export stage.
  const finalImage = ctx.getImageData(0, 0, size, size);
  const finalData = finalImage.data;
  for (let p = 3; p < finalData.length; p += 4) {
    finalData[p] = finalData[p] <= 8 ? 0 : 255;
  }
  ctx.putImageData(finalImage, 0, 0);
  return canvasToBlob(canvas);
}

async function makeOutputForItem(item, transform = { zoom: 1, x: 0, y: 0 }, outputScale = 1) {
  if (item?.pixelSafe && item?.pixelData && item?.pixelWidth && item?.pixelHeight) {
    return makePixelSafeOutput(item, transform, outputScale);
  }
  return makeOutput(item.blob, transform, outputScale);
}

`
      transformed = transformed.replace(makeOutputAnchor, pixelSafeHelper + makeOutputAnchor)
      return { code: transformed, map: null }
    }
  }
}

function alphaVerifiedV17() {
  return {
    name: 'alpha-verified-v17',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')
      const componentMarker = 'export default function BackgroundRemover'
      const componentIndex = transformed.indexOf(componentMarker)
      if (componentIndex < 0) throw new Error('[alpha-v17] BackgroundRemover marker not found')

      const helper = `async function inspectSplitAlphaTopology(blob) {
  try {
    const { canvas, ctx } = await drawFileToCanvas(blob);
    const width = canvas.width;
    const height = canvas.height;
    if (!width || !height) return { holes: -1, semi: -1, zeroRatio: -1 };
    const data = ctx.getImageData(0, 0, width, height).data;
    const total = width * height;
    const zero = new Uint8Array(total);
    let zeroCount = 0;
    let semi = 0;
    for (let i = 0; i < total; i += 1) {
      const a = data[i * 4 + 3];
      if (a === 0) { zero[i] = 1; zeroCount += 1; }
      else if (a < 255) semi += 1;
    }
    const outside = new Uint8Array(total);
    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;
    const enqueue = (index) => {
      if (index < 0 || index >= total || outside[index] || !zero[index]) return;
      outside[index] = 1;
      queue[tail++] = index;
    };
    for (let x = 0; x < width; x += 1) {
      enqueue(x);
      enqueue((height - 1) * width + x);
    }
    for (let y = 1; y < height - 1; y += 1) {
      enqueue(y * width);
      enqueue(y * width + width - 1);
    }
    while (head < tail) {
      const index = queue[head++];
      const x = index % width;
      const y = Math.floor(index / width);
      if (x > 0) enqueue(index - 1);
      if (x + 1 < width) enqueue(index + 1);
      if (y > 0) enqueue(index - width);
      if (y + 1 < height) enqueue(index + width);
    }
    let holes = 0;
    for (let i = 0; i < total; i += 1) {
      if (zero[i] && !outside[i]) holes += 1;
    }
    return { holes, semi, zeroRatio: zeroCount / Math.max(1, total) };
  } catch (error) {
    console.warn('Split alpha inspection failed:', error);
    return { holes: -1, semi: -1, zeroRatio: -1 };
  }
}

`
      transformed = transformed.slice(0, componentIndex) + helper + transformed.slice(componentIndex)

      const splitUrlRegex = /const withUrls = [\s\S]*?;\n\s*setSplitItems\(withUrls\);/
      if (!splitUrlRegex.test(transformed)) throw new Error('[alpha-v17] split URL block not found')
      const newWithUrls = `const inspectedItems = [];
      for (const item of items) {
        const alphaDiag = await inspectSplitAlphaTopology(item.blob);
        inspectedItems.push({ ...item, alphaDiag });
      }
      const withUrls = inspectedItems.map((item) => ({ ...item, url: URL.createObjectURL(item.blob) }));
      setSplitItems(withUrls);
      if (inspectedItems[0]) {
        const d = inspectedItems[0].alphaDiag;
        setPrecisionMessage('Alpha v20 · ' + (inspectedItems[0].splitEngine || 'NA') + ' · H' + d.holes + ' · S' + d.semi + ' · Z' + (d.zeroRatio >= 0 ? d.zeroRatio.toFixed(3) : '?'));
      }`
      transformed = transformed.replace(splitUrlRegex, newWithUrls)
      transformed = transformed.replace(/Split v16 · Direct First/g, 'Split v20 · Pixel Safe Save')
      transformed = transformed.replace(/Split v17 · Alpha Verified/g, 'Split v20 · Pixel Safe Save')
      transformed = transformed.replace(/Split v18 · Strict Source/g, 'Split v20 · Pixel Safe Save')
      transformed = transformed.replace(/Split v19 · Mobile Save Fix/g, 'Split v20 · Pixel Safe Save')
      return { code: transformed, map: null }
    }
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [mobileSaveDecoderPre(), ...(baseConfig.plugins || []), alphaVerifiedV17()]
})
