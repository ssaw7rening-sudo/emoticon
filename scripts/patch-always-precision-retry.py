from pathlib import Path

path = Path('src/components/BackgroundRemover.jsx')
s = path.read_text(encoding='utf-8')

def rep(old, new, label):
    global s
    if old not in s:
        raise SystemExit(f'Missing anchor: {label}')
    s = s.replace(old, new, 1)

old_quality = '''  const bothUpperCornersContaminated =\n    topLeftCorner > 0.30 &&\n    topRightCorner > 0.30 &&\n    topEdge > 0.26 &&\n    visibleRatio > 0.28 &&\n    visibleRatio < 0.74;\n  if (bothUpperCornersContaminated) score += 4;\n\n  const leftUpperFrameContaminated =\n    topLeftCorner > 0.50 && upperLeftSide > 0.38 && topEdge > 0.20 && visibleRatio < 0.72;\n  const rightUpperFrameContaminated =\n    topRightCorner > 0.50 && upperRightSide > 0.38 && topEdge > 0.20 && visibleRatio < 0.72;\n  if (leftUpperFrameContaminated) score += 2;\n  if (rightUpperFrameContaminated) score += 2;\n\n  const broadUpperFrameContamination =\n    topEdge > 0.30 && leftEdge > 0.24 && rightEdge > 0.24 && visibleRatio > 0.34 && visibleRatio < 0.74;\n  if (broadUpperFrameContamination) score += 3;\n'''
new_quality = '''  const bothUpperCornersContaminated =\n    topLeftCorner > 0.24 &&\n    topRightCorner > 0.24 &&\n    topEdge > 0.20 &&\n    visibleRatio > 0.24 &&\n    visibleRatio < 0.78;\n  if (bothUpperCornersContaminated) score += 4;\n\n  // Softer upper-frame signals are intentionally warning-grade. They make\n  // ORMBG compare against MODNet without immediately blocking a legitimate\n  // close-up or group photo that happens to touch one edge.\n  const softBothUpperCorners =\n    topLeftCorner > 0.16 &&\n    topRightCorner > 0.16 &&\n    topEdge > 0.13 &&\n    visibleRatio > 0.20 &&\n    visibleRatio < 0.82;\n  if (!bothUpperCornersContaminated && softBothUpperCorners) score += 2;\n\n  const leftUpperFrameContaminated =\n    topLeftCorner > 0.42 && upperLeftSide > 0.30 && topEdge > 0.16 && visibleRatio < 0.78;\n  const rightUpperFrameContaminated =\n    topRightCorner > 0.42 && upperRightSide > 0.30 && topEdge > 0.16 && visibleRatio < 0.78;\n  if (leftUpperFrameContaminated) score += 2;\n  if (rightUpperFrameContaminated) score += 2;\n\n  const softLeftUpperFrame =\n    topLeftCorner > 0.30 && upperLeftSide > 0.22 && topEdge > 0.11 && visibleRatio < 0.82;\n  const softRightUpperFrame =\n    topRightCorner > 0.30 && upperRightSide > 0.22 && topEdge > 0.11 && visibleRatio < 0.82;\n  if (!leftUpperFrameContaminated && softLeftUpperFrame) score += 1;\n  if (!rightUpperFrameContaminated && softRightUpperFrame) score += 1;\n\n  const broadUpperFrameContamination =\n    topEdge > 0.24 && leftEdge > 0.18 && rightEdge > 0.18 && visibleRatio > 0.30 && visibleRatio < 0.78;\n  if (broadUpperFrameContamination) score += 3;\n'''
rep(old_quality, new_quality, 'quality thresholds')

old_precision = "          {resultUrl && ['ai', 'modnet'].includes(resultMethod) && ['warning', 'fail'].includes(qualityAssessment.status) && ("
new_precision = "          {resultUrl && ['ai', 'modnet'].includes(resultMethod) && ("
rep(old_precision, new_precision, 'precision visibility')

path.write_text(s, encoding='utf-8')
print('Patched BackgroundRemover.jsx')
