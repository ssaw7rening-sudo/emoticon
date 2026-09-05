import { defineConfig } from 'vite'
import baseConfig from './vite.direct-first-v16.config.js'

function mobileSaveDecoderPre() {
  return {
    name: 'mobile-save-decoder-v19-pre',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/EmoticonPostProcessor.jsx')) return null
      let transformed = code.replace(/\r\n/g, '\n')
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
  // Android/mobile save path must use the same decoder as the correct preview.
  // createImageBitmap() can corrupt premultiplied alpha only during Canvas export.
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
        throw new Error('[mobile-save-v19-pre] original loadBitmap anchor not found')
      }
      transformed = transformed.replace(oldLoader, safeLoader)
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
        setPrecisionMessage('Alpha v19 · ' + (inspectedItems[0].splitEngine || 'NA') + ' · H' + d.holes + ' · S' + d.semi + ' · Z' + (d.zeroRatio >= 0 ? d.zeroRatio.toFixed(3) : '?'));
      }`
      transformed = transformed.replace(splitUrlRegex, newWithUrls)
      transformed = transformed.replace(/Split v16 · Direct First/g, 'Split v19 · Mobile Save Fix')
      transformed = transformed.replace(/Split v17 · Alpha Verified/g, 'Split v19 · Mobile Save Fix')
      transformed = transformed.replace(/Split v18 · Strict Source/g, 'Split v19 · Mobile Save Fix')
      return { code: transformed, map: null }
    }
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [mobileSaveDecoderPre(), ...(baseConfig.plugins || []), alphaVerifiedV17()]
})
