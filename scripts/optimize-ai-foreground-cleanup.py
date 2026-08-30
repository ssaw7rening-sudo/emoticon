from pathlib import Path

path = Path('src/components/BackgroundRemover.jsx')
s = path.read_text(encoding='utf-8')

old = r'''    while (head < tail) {
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
'''
new = r'''    while (head < tail) {
      const index = queue[head++];
      const x = index % width;
      const y = Math.floor(index / width);
      area += 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      if (x > 0) {
        const next = index - 1;
        if (!labels[next] && visible(next)) {
          labels[next] = nextLabel;
          queue[tail++] = next;
        }
      }
      if (x + 1 < width) {
        const next = index + 1;
        if (!labels[next] && visible(next)) {
          labels[next] = nextLabel;
          queue[tail++] = next;
        }
      }
      if (y > 0) {
        const next = index - width;
        if (!labels[next] && visible(next)) {
          labels[next] = nextLabel;
          queue[tail++] = next;
        }
      }
      if (y + 1 < height) {
        const next = index + width;
        if (!labels[next] && visible(next)) {
          labels[next] = nextLabel;
          queue[tail++] = next;
        }
      }
    }
'''
if old not in s:
    raise SystemExit('Missing BFS loop anchor')
s = s.replace(old, new, 1)

old2 = r'''  const original = new Uint8ClampedArray(pixels);
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
'''
new2 = r'''  const neighborOffsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const p = (y * width + x) * 4;
      const alpha = pixels[p + 3];
      if (alpha < 32 || alpha > 218) continue;
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;
      for (const [dx, dy] of neighborOffsets) {
        const np = ((y + dy) * width + (x + dx)) * 4;
        if (pixels[np + 3] < 238) continue;
        r += pixels[np];
        g += pixels[np + 1];
        b += pixels[np + 2];
        count += 1;
      }
      if (!count) continue;
      const mix = Math.min(0.42, ((218 - alpha) / 186) * 0.42);
      pixels[p] = Math.round(pixels[p] * (1 - mix) + (r / count) * mix);
      pixels[p + 1] = Math.round(pixels[p + 1] * (1 - mix) + (g / count) * mix);
      pixels[p + 2] = Math.round(pixels[p + 2] * (1 - mix) + (b / count) * mix);
    }
  }
'''
if old2 not in s:
    raise SystemExit('Missing fringe memory anchor')
s = s.replace(old2, new2, 1)

path.write_text(s, encoding='utf-8')
print('optimized AI foreground cleanup')
