from pathlib import Path

path = Path('vite.tailwind-motion-cleanup.config.js')
text = path.read_text(encoding='utf-8')

anchor = """  // Find the emptiest line close to each expected 5 x 3 boundary. This keeps\n"""
insert = r"""  // For a sheet with a demonstrably dark outer matte, rebuild the entire
  // split source from the ORIGINAL upload before any crop is calculated.
  // The processed result may already contain alpha=0 holes inside pale faces;
  // repairing only those holes later is fragile. Here the original source is
  // authoritative: only dark pixels connected to the outer image border are
  // background (alpha 0); every other original pixel remains fully opaque.
  if (originalPixels && originalHasDarkBorder) {
    const rebuilt = ctx.createImageData(width, height);
    rebuilt.data.set(originalPixels);
    const rebuiltData = rebuilt.data;
    const total = width * height;
    const visited = new Uint8Array(total);
    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;

    const matteTolerance = 58;
    const isOuterDarkMatte = (index) => {
      const p = index * 4;
      const r = rebuiltData[p];
      const g = rebuiltData[p + 1];
      const b = rebuiltData[p + 2];
      const l = r * 0.2126 + g * 0.7152 + b * 0.0722;
      const d = Math.sqrt(
        (r - originalBackground[0]) ** 2 +
        (g - originalBackground[1]) ** 2 +
        (b - originalBackground[2]) ** 2
      );
      return l <= 150 && d <= matteTolerance;
    };
    const enqueue = (index) => {
      if (index < 0 || index >= total || visited[index] || !isOuterDarkMatte(index)) return;
      visited[index] = 1;
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

    const removedRatio = tail / Math.max(1, total);
    // Safety gate: a real dark sheet has a substantial but not all-consuming
    // border-connected matte. If not, keep the normal processed source.
    if (removedRatio >= 0.12 && removedRatio <= 0.88) {
      for (let index = 0; index < total; index += 1) {
        const p = index * 4;
        rebuiltData[p + 3] = visited[index] ? 0 : 255;
      }
      ctx.putImageData(rebuilt, 0, 0);
      pixels.set(rebuiltData);
    }
  }

  // Find the emptiest line close to each expected 5 x 3 boundary. This keeps
"""

if anchor not in text:
    raise SystemExit('dark-sheet rebuild insertion anchor not found')
if 'rebuild the entire\n  // split source from the ORIGINAL upload' in text:
    raise SystemExit('dark-sheet rebuild already applied')
text = text.replace(anchor, insert, 1)
path.write_text(text, encoding='utf-8')
print('Applied original-authoritative dark-sheet reconstruction before auto split.')
