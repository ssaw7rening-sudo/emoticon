from pathlib import Path

path = Path('src/components/BackgroundRemover.jsx')
s = path.read_text(encoding='utf-8')
old = """async function detectEmoticonSheet(blob) {
  const { canvas, ctx } = await drawFileToCanvas(blob);
  const { width, height } = canvas;
  if (!width || !height) return { status: 'not-sheet', confidence: 0 };
  const components = extractConnectedComponents(ctx, width, height);
  return classifyEmoticonSheetComponents(components, width, height);
}
"""
new = """async function detectEmoticonSheet(blob) {
  const { canvas } = await drawFileToCanvas(blob);
  const { width, height } = canvas;
  if (!width || !height) return { status: 'not-sheet', confidence: 0 };

  // Layout detection does not need full-resolution pixels. Analyze a bounded
  // preview so high-resolution phone photos do not allocate a huge BFS queue.
  const maxDimension = 900;
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const analysisWidth = Math.max(1, Math.round(width * scale));
  const analysisHeight = Math.max(1, Math.round(height * scale));
  const analysisCanvas = document.createElement('canvas');
  analysisCanvas.width = analysisWidth;
  analysisCanvas.height = analysisHeight;
  const analysisCtx = analysisCanvas.getContext('2d', { willReadFrequently: true });
  if (!analysisCtx) return { status: 'not-sheet', confidence: 0 };
  analysisCtx.imageSmoothingEnabled = true;
  analysisCtx.imageSmoothingQuality = 'high';
  analysisCtx.drawImage(canvas, 0, 0, analysisWidth, analysisHeight);

  const components = extractConnectedComponents(analysisCtx, analysisWidth, analysisHeight);
  return classifyEmoticonSheetComponents(components, analysisWidth, analysisHeight);
}
"""
if old not in s:
    raise SystemExit('Missing detectEmoticonSheet anchor')
s = s.replace(old, new, 1)
path.write_text(s, encoding='utf-8')
print('optimized sheet detection')
