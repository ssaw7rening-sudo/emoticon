import { defineConfig } from 'vite'
import baseConfig from './vite.direct-first-v16.config.js'

function alphaVerifiedV17() {
  return {
    name: 'alpha-verified-v17',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      let transformed = code.replace(/\r\n/g, '\n')

      if (normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) {
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

        const oldWithUrls = 'const withUrls = items.map((item) => ({ ...item, url: URL.createObjectURL(item.blob) }));'
        const newWithUrls = `const inspectedItems = [];
      for (const item of items) {
        const alphaDiag = await inspectSplitAlphaTopology(item.blob);
        inspectedItems.push({ ...item, alphaDiag });
      }
      const withUrls = inspectedItems.map((item) => ({ ...item, url: URL.createObjectURL(item.blob) }));`
        if (!transformed.includes(oldWithUrls)) throw new Error('[alpha-v17] split URL anchor not found')
        transformed = transformed.replace(oldWithUrls, newWithUrls)

        // Replace whichever engineLabel previous build layers produced with a
        // runtime label sourced from the actual first split PNG.
        const engineRegex = /engineLabel=\{[^\n]*\}/
        if (!engineRegex.test(transformed)) throw new Error('[alpha-v17] engineLabel prop not found')
        const runtimeLabel = "engineLabel={(resultMethod === 'fast-dark' ? t.methodSafeDark : resultMethod === 'fast' ? t.methodSafe : t.methodAi) + ' · ' + (splitItems[0]?.splitEngine || 'NA') + ' · H' + (splitItems[0]?.alphaDiag?.holes ?? '?') + ' · S' + (splitItems[0]?.alphaDiag?.semi ?? '?') + ' · Split v17 · Alpha Verified'}"
        transformed = transformed.replace(engineRegex, runtimeLabel)
        transformed = transformed.replace(/Split v16 · Direct First/g, 'Split v17 · Alpha Verified')
        return { code: transformed, map: null }
      }

      if (normalizedId.endsWith('/src/components/EmoticonPostProcessor.jsx')) {
        const makeOutputMarker = 'async function makeOutput(blob, transform = { zoom: 1, x: 0, y: 0 }, outputScale = 1) {'
        const makeOutputIndex = transformed.indexOf(makeOutputMarker)
        if (makeOutputIndex < 0) throw new Error('[alpha-v17] makeOutput marker not found')

        const binaryHelper = `function forceBinaryOutputAlpha(canvas) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let p = 3; p < data.length; p += 4) {
    data[p] = data[p] === 0 ? 0 : 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

`
        transformed = transformed.slice(0, makeOutputIndex) + binaryHelper + transformed.slice(makeOutputIndex)

        const returnAnchor = `  stabilizeBrightForegroundAlpha(canvas);\n  return canvasToBlob(canvas);`
        const returnReplacement = `  stabilizeBrightForegroundAlpha(canvas);\n  forceBinaryOutputAlpha(canvas);\n  return canvasToBlob(canvas);`
        if (!transformed.includes(returnAnchor)) throw new Error('[alpha-v17] makeOutput return anchor not found')
        transformed = transformed.replace(returnAnchor, returnReplacement)

        // Prevent the browser's CSS downscaling from visually blending opaque
        // artwork with the checkerboard underneath on small mobile cards.
        transformed = transformed.replace(/filter: 'none'/g, "filter: 'none', imageRendering: 'pixelated'")
        return { code: transformed, map: null }
      }

      return null
    }
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), alphaVerifiedV17()]
})
