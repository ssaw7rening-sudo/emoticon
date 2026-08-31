import { defineConfig } from 'vite'
import baseConfig from './vite.social-share-tabs.config.js'

function enclosedBackgroundHoleGuard() {
  return {
    name: 'enclosed-background-hole-guard-v1',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')
      const anchor = `  if (tail < total * 0.06) return null;\n\n  ctx.putImageData(imageData, 0, 0);`

      if (!transformed.includes(anchor)) {
        throw new Error('[background-hole-guard] Fast-removal completion anchor was not found')
      }

      const guarded = `  if (tail < total * 0.06) return null;\n\n  // Border flood-fill deliberately preserves background-coloured pixels that are\n  // enclosed by foreground. That protects dark hair on black backgrounds and\n  // white clothing on white backgrounds, but it also leaves the counters inside\n  // glyphs such as ㅇ, ㅁ, ㅂ, ㅎ, O, 0, A, P and R opaque.\n  //\n  // Do not blindly erase those enclosed regions here: a pupil, eye highlight or\n  // genuine foreground detail can have the same colour as the backdrop. Instead,\n  // detect a meaningful enclosed backdrop-colour pocket and reject the fast path.\n  // The normal one-click flow then routes the original image through the AI mask,\n  // which can distinguish the object/text stroke from the background hole.\n  const holeTolerance = Math.max(8, Math.min(20, tolerance * 0.40));\n  const interiorVisited = new Uint8Array(total);\n  const minHoleArea = Math.max(18, Math.round(total * 0.000012));\n  const maxHoleArea = Math.max(minHoleArea + 1, Math.round(total * 0.012));\n  const maxHoleWidth = Math.max(8, Math.round(width * 0.18));\n  const maxHoleHeight = Math.max(8, Math.round(height * 0.14));\n\n  const isEnclosedBackgroundCandidate = (index) => {\n    if (index < 0 || index >= total || visited[index] || interiorVisited[index]) return false;\n    const p = index * 4;\n    if (pixels[p + 3] < 16) return false;\n    return colorDistance([pixels[p], pixels[p + 1], pixels[p + 2]], bg) <= holeTolerance;\n  };\n\n  for (let seed = 0; seed < total; seed += 1) {\n    if (!isEnclosedBackgroundCandidate(seed)) continue;\n\n    head = 0;\n    tail = 0;\n    interiorVisited[seed] = 1;\n    queue[tail++] = seed;\n    let area = 0;\n    let minX = width;\n    let minY = height;\n    let maxX = -1;\n    let maxY = -1;\n    let touchesImageEdge = false;\n\n    while (head < tail) {\n      const index = queue[head++];\n      const x = index % width;\n      const y = Math.floor(index / width);\n      area += 1;\n      if (x < minX) minX = x;\n      if (x > maxX) maxX = x;\n      if (y < minY) minY = y;\n      if (y > maxY) maxY = y;\n      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) touchesImageEdge = true;\n\n      const tryInterior = (next) => {\n        if (!isEnclosedBackgroundCandidate(next)) return;\n        interiorVisited[next] = 1;\n        queue[tail++] = next;\n      };\n\n      if (x > 0) tryInterior(index - 1);\n      if (x + 1 < width) tryInterior(index + 1);\n      if (y > 0) tryInterior(index - width);\n      if (y + 1 < height) tryInterior(index + width);\n    }\n\n    const componentWidth = maxX >= minX ? maxX - minX + 1 : 0;\n    const componentHeight = maxY >= minY ? maxY - minY + 1 : 0;\n    const looksLikeEnclosedPocket =\n      !touchesImageEdge &&\n      area >= minHoleArea &&\n      area <= maxHoleArea &&\n      componentWidth <= maxHoleWidth &&\n      componentHeight <= maxHoleHeight;\n\n    if (looksLikeEnclosedPocket) {\n      console.info('Fast background removal found an enclosed background-colour pocket; routing through AI for hole-safe transparency.');\n      return null;\n    }\n  }\n\n  ctx.putImageData(imageData, 0, 0);`

      transformed = transformed.replace(anchor, guarded)
      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), enclosedBackgroundHoleGuard()],
})
