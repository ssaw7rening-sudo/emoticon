from pathlib import Path

path = Path('src/components/BackgroundRemover.jsx')
s = path.read_text(encoding='utf-8')

def rep(old, new, label):
    global s
    if old not in s:
        raise SystemExit(f'Missing anchor: {label}')
    s = s.replace(old, new, 1)

rep(
"  let topVisible = 0;\n  let bottomVisible = 0;\n  let leftVisible = 0;\n  let rightVisible = 0;\n",
"  let topVisible = 0;\n  let bottomVisible = 0;\n  let leftVisible = 0;\n  let rightVisible = 0;\n  let topLeftCornerVisible = 0;\n  let topRightCornerVisible = 0;\n  let upperLeftSideVisible = 0;\n  let upperRightSideVisible = 0;\n  const cornerWidth = Math.max(3, Math.round(analysisWidth * 0.18));\n  const cornerHeight = Math.max(3, Math.round(analysisHeight * 0.16));\n  const upperSideHeight = Math.max(3, Math.round(analysisHeight * 0.62));\n",
'corner counters')

rep(
"      if (y < bandY) topVisible += 1;\n      if (y >= analysisHeight - bandY) bottomVisible += 1;\n      if (x < bandX) leftVisible += 1;\n      if (x >= analysisWidth - bandX) rightVisible += 1;\n",
"      if (y < bandY) topVisible += 1;\n      if (y >= analysisHeight - bandY) bottomVisible += 1;\n      if (x < bandX) leftVisible += 1;\n      if (x >= analysisWidth - bandX) rightVisible += 1;\n      if (x < cornerWidth && y < cornerHeight) topLeftCornerVisible += 1;\n      if (x >= analysisWidth - cornerWidth && y < cornerHeight) topRightCornerVisible += 1;\n      if (x < bandX && y < upperSideHeight) upperLeftSideVisible += 1;\n      if (x >= analysisWidth - bandX && y < upperSideHeight) upperRightSideVisible += 1;\n",
'corner accumulation')

rep(
"  const rightEdge = rightVisible / Math.max(1, analysisHeight * bandX);\n\n  const { components } = analyzeAlphaComponents(ctx, analysisWidth, analysisHeight, threshold);\n",
"  const rightEdge = rightVisible / Math.max(1, analysisHeight * bandX);\n  const topLeftCorner = topLeftCornerVisible / Math.max(1, cornerWidth * cornerHeight);\n  const topRightCorner = topRightCornerVisible / Math.max(1, cornerWidth * cornerHeight);\n  const upperLeftSide = upperLeftSideVisible / Math.max(1, bandX * upperSideHeight);\n  const upperRightSide = upperRightSideVisible / Math.max(1, bandX * upperSideHeight);\n\n  const { components } = analyzeAlphaComponents(ctx, analysisWidth, analysisHeight, threshold);\n",
'corner ratios')

rep(
"  const ranked = [...components].sort((a, b) => b.area - a.area);\n  const largest = ranked[0];\n",
"  const sheetCheck = classifyEmoticonSheetComponents(components, analysisWidth, analysisHeight);\n  if (sheetCheck.status === 'sheet') return { status: 'pass', score: 0 };\n\n  const ranked = [...components].sort((a, b) => b.area - a.area);\n  const largest = ranked[0];\n",
'sheet bypass')

rep(
"  if (leftEdge > 0.58 && rightEdge > 0.58 && visibleRatio > 0.48) score += 2;\n  if (suspiciousDetachedRatio > 0.12) score += 2;\n",
"  if (leftEdge > 0.58 && rightEdge > 0.58 && visibleRatio > 0.48) score += 2;\n\n  // Complex indoor failures often leave large ceiling/signboard regions in both\n  // upper corners even though the center subject was isolated. A legitimate\n  // close-up may touch the frame too, so only treat this as strong contamination\n  // when the overall foreground is not already filling nearly the whole image.\n  const bothUpperCornersContaminated =\n    topLeftCorner > 0.30 &&\n    topRightCorner > 0.30 &&\n    topEdge > 0.26 &&\n    visibleRatio > 0.28 &&\n    visibleRatio < 0.74;\n  if (bothUpperCornersContaminated) score += 4;\n\n  const leftUpperFrameContaminated =\n    topLeftCorner > 0.50 && upperLeftSide > 0.38 && topEdge > 0.20 && visibleRatio < 0.72;\n  const rightUpperFrameContaminated =\n    topRightCorner > 0.50 && upperRightSide > 0.38 && topEdge > 0.20 && visibleRatio < 0.72;\n  if (leftUpperFrameContaminated) score += 2;\n  if (rightUpperFrameContaminated) score += 2;\n\n  const broadUpperFrameContamination =\n    topEdge > 0.30 && leftEdge > 0.24 && rightEdge > 0.24 && visibleRatio > 0.34 && visibleRatio < 0.74;\n  if (broadUpperFrameContamination) score += 3;\n\n  if (suspiciousDetachedRatio > 0.12) score += 2;\n",
'upper frame scoring')

rep(
"  if (score >= 4) return { status: 'fail', score };\n",
"  // Two independent strong upper-frame signals are enough to block saving even\n  // when the foreground component graph is connected by thin alpha bridges.\n  if ((bothUpperCornersContaminated && (leftUpperFrameContaminated || rightUpperFrameContaminated)) ||\n      (broadUpperFrameContamination && (topLeftCorner > 0.42 || topRightCorner > 0.42))) {\n    score = Math.max(score, 5);\n  }\n\n  if (score >= 4) return { status: 'fail', score };\n",
'hard fail synthesis')

path.write_text(s, encoding='utf-8')
print('strengthened removal quality gate')
