from pathlib import Path

post_path = Path('src/components/EmoticonPostProcessor.jsx')
post = post_path.read_text(encoding='utf-8')

helper_anchor = "async function makeOutput(blob, transform = { zoom: 1, x: 0, y: 0 }, outputScale = 1) {"
if helper_anchor not in post:
    raise SystemExit('makeOutput anchor not found')

helper = r'''function stabilizeBrightForegroundAlpha(canvas) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;
  const { width, height } = canvas;
  if (!width || !height) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const source = new Uint8ClampedArray(data);
  const alphaAt = (x, y) => source[(y * width + x) * 4 + 3];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const p = (y * width + x) * 4;
      const alpha = source[p + 3];
      if (alpha === 0 || alpha === 255) continue;

      const r = source[p];
      const g = source[p + 1];
      const b = source[p + 2];
      const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722;
      let opaqueNeighbors = 0;
      let visibleNeighbors = 0;

      for (let oy = -1; oy <= 1; oy += 1) {
        for (let ox = -1; ox <= 1; ox += 1) {
          if (ox === 0 && oy === 0) continue;
          const nx = x + ox;
          const ny = y + oy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const neighborAlpha = alphaAt(nx, ny);
          if (neighborAlpha >= 238) opaqueNeighbors += 1;
          if (neighborAlpha >= 16) visibleNeighbors += 1;
        }
      }

      // Bright sticker artwork must never become see-through because of
      // resampling. This specifically protects white/ivory faces, pale fur,
      // dandelion-like wisps, captions and white sticker outlines.
      if (luminance >= 138 && alpha >= 3) {
        data[p + 3] = 255;
        continue;
      }

      // Interior foreground pixels of any colour are also restored when their
      // local alpha topology shows that they belong to the solid subject.
      if ((alpha >= 20 && opaqueNeighbors >= 2) || (alpha >= 48 && visibleNeighbors >= 5)) {
        data[p + 3] = 255;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

'''
post = post.replace(helper_anchor, helper + helper_anchor, 1)

post = post.replace(
    "const ctx = canvas.getContext('2d', { willReadFrequently: scaleFactor > 1 });",
    "const ctx = canvas.getContext('2d', { willReadFrequently: true });",
    1,
)

finish_anchor = "  if (scaleFactor > 1) sharpenCanvas(canvas, scaleFactor === 4 ? 0.11 : 0.075);\n  return canvasToBlob(canvas);"
if finish_anchor not in post:
    raise SystemExit('makeOutput finish anchor not found')
post = post.replace(
    finish_anchor,
    "  if (scaleFactor > 1) sharpenCanvas(canvas, scaleFactor === 4 ? 0.11 : 0.075);\n  stabilizeBrightForegroundAlpha(canvas);\n  return canvasToBlob(canvas);",
    1,
)
post_path.write_text(post, encoding='utf-8')

vite_path = Path('vite.tailwind-motion-cleanup.config.js')
vite = vite_path.read_text(encoding='utf-8')

split_anchor = """      const itemBlob = await canvasToPngBlob(output);"""
if split_anchor not in vite:
    raise SystemExit('split itemBlob anchor not found')

split_repair = r'''      // Final split-stage opacity repair. drawImage/cropping can retain or
      // expose semi-transparent pale pixels from the sheet. Restore bright
      // subject pixels and solid interior pixels before each individual PNG is
      // exported, while leaving truly empty background pixels at alpha 0.
      const splitImageData = outputCtx.getImageData(0, 0, output.width, output.height);
      const splitData = splitImageData.data;
      const splitSource = new Uint8ClampedArray(splitData);
      const splitAlphaAt = (x, y) => splitSource[(y * output.width + x) * 4 + 3];
      for (let sy = 0; sy < output.height; sy += 1) {
        for (let sx = 0; sx < output.width; sx += 1) {
          const sp = (sy * output.width + sx) * 4;
          const sa = splitSource[sp + 3];
          if (sa === 0 || sa === 255) continue;
          const sr = splitSource[sp];
          const sg = splitSource[sp + 1];
          const sb = splitSource[sp + 2];
          const sl = sr * 0.2126 + sg * 0.7152 + sb * 0.0722;
          let solidAround = 0;
          let visibleAround = 0;
          for (let oy = -1; oy <= 1; oy += 1) {
            for (let ox = -1; ox <= 1; ox += 1) {
              if (ox === 0 && oy === 0) continue;
              const nx = sx + ox;
              const ny = sy + oy;
              if (nx < 0 || ny < 0 || nx >= output.width || ny >= output.height) continue;
              const na = splitAlphaAt(nx, ny);
              if (na >= 238) solidAround += 1;
              if (na >= 16) visibleAround += 1;
            }
          }
          if (sl >= 138 && sa >= 3) {
            splitData[sp + 3] = 255;
          } else if ((sa >= 20 && solidAround >= 2) || (sa >= 48 && visibleAround >= 5)) {
            splitData[sp + 3] = 255;
          }
        }
      }
      outputCtx.putImageData(splitImageData, 0, 0);

      const itemBlob = await canvasToPngBlob(output);'''

vite = vite.replace(split_anchor, split_repair, 1)
vite_path.write_text(vite, encoding='utf-8')

print('Patched finish-stage alpha handling in EmoticonPostProcessor and split exporter')
