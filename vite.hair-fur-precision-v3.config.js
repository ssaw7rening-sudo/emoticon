import { defineConfig } from 'vite'
import baseConfig from './vite.hybrid-edge-refine.config.js'

function hairFurPrecisionPre() {
  return {
    name: 'hair-fur-fine-detail-precision-v6',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')
      const assessAnchor = 'async function assessRemovalQuality(blob) {'
      if (!transformed.includes(assessAnchor)) {
        throw new Error('[hair-fur-v3] Quality-assessment anchor was not found')
      }

      const helper = `// HAIR_FUR_FINE_DETAIL_PRECISION_V6
function getHairFurText(lang) {
  const copy = {
    ko: {
      retry: '헤어·퍼 정밀',
      hint: '머리카락 한 올, 동물 털, 수염처럼 매우 얇은 경계를 원본 해상도에서 정밀 복원합니다. 필요한 이미지에만 사용해 주세요.',
      working: '머리카락·털의 미세 경계를 복원하고 있어요…',
      noBetter: '헤어·퍼 정밀 결과에서 배경 잔상이 크게 늘어 기존 결과를 유지했습니다.',
      applied: '헤어·퍼 정밀 보정을 적용했습니다. 확대해서 털 끝과 머리카락 경계를 확인해 주세요.'
    },
    en: {
      retry: 'Hair & fur precision',
      hint: 'Refines very fine edges such as individual hairs, fur and whiskers at the original resolution. Use it only when fine strands matter.',
      working: 'Restoring fine hair and fur edges…',
      noBetter: 'The hair/fur pass introduced too much background residue, so the current result was kept.',
      applied: 'Hair/fur precision was applied. Zoom in to inspect fine strands and edge detail.'
    },
    ja: {
      retry: '髪・毛並み高精度',
      hint: '髪の毛一本、動物の毛、ひげなど非常に細い輪郭を元の解像度で復元します。必要な画像でのみ使用してください。',
      working: '髪・毛並みの細部を復元しています…',
      noBetter: '背景の残りが増えたため、現在の結果を維持しました。',
      applied: '髪・毛並みの高精度補正を適用しました。拡大して細い輪郭をご確認ください。'
    },
    zh: {
      retry: '发丝·毛发精修',
      hint: '在原始分辨率下精细恢复单根发丝、动物毛发和胡须等极细边缘。仅在需要细节时使用。',
      working: '正在恢复发丝和毛发细节…',
      noBetter: '精修后背景残留明显增加，因此保留当前结果。',
      applied: '已应用发丝·毛发精修。请放大检查细小毛发和边缘。'
    }
  };
  return copy[lang] || copy.ko;
}

async function refineHairFurEdges(matteBlob, sourceFile, options = {}) {
  if (!sourceFile) return matteBlob;

  const autoMode = options?.mode === 'auto';
  const alreadyBalanced = options?.alreadyBalanced === true;

  // Automatic one-click processing reaches this helper after the hybrid pass.
  // Manual/detail routes may still enter with a raw precision matte, so keep the
  // existing hybrid refinement as the default without running it twice.
  const balancedBlob = alreadyBalanced
    ? matteBlob
    : (typeof refineHybridPrecisionEdges === 'function'
      ? await refineHybridPrecisionEdges(matteBlob, sourceFile)
      : matteBlob);

  const [{ canvas: sourceCanvas, ctx: sourceCtx }, { canvas: matteCanvas }] = await Promise.all([
    drawFileToCanvas(sourceFile),
    drawFileToCanvas(balancedBlob)
  ]);
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  if (!width || !height || width < 8 || height < 8) return balancedBlob;

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
  if (!maskCtx) return balancedBlob;
  maskCtx.imageSmoothingEnabled = true;
  maskCtx.imageSmoothingQuality = 'high';
  maskCtx.drawImage(matteCanvas, 0, 0, width, height);

  const mobileLike = typeof isMobileLikeDevice === 'function' ? isMobileLikeDevice() : false;
  const analysisMax = mobileLike ? 840 : 1280;
  const analysisScale = Math.min(1, analysisMax / Math.max(width, height));
  const analysisWidth = Math.max(1, Math.round(width * analysisScale));
  const analysisHeight = Math.max(1, Math.round(height * analysisScale));
  const analysisCanvas = document.createElement('canvas');
  analysisCanvas.width = analysisWidth;
  analysisCanvas.height = analysisHeight;
  const analysisCtx = analysisCanvas.getContext('2d', { willReadFrequently: true });
  if (!analysisCtx) return balancedBlob;
  analysisCtx.imageSmoothingEnabled = true;
  analysisCtx.imageSmoothingQuality = 'high';
  analysisCtx.drawImage(maskCanvas, 0, 0, analysisWidth, analysisHeight);

  const analysisPixels = analysisCtx.getImageData(0, 0, analysisWidth, analysisHeight).data;
  const total = analysisWidth * analysisHeight;
  let edgeBand = new Uint8Array(total);

  // Hair/fur mode deliberately uses a more sensitive contour than the balanced
  // refinement so low-alpha hairs, whiskers and fine fur are included.
  for (let y = 1; y < analysisHeight - 1; y += 1) {
    for (let x = 1; x < analysisWidth - 1; x += 1) {
      const index = y * analysisWidth + x;
      const a = analysisPixels[index * 4 + 3];
      const left = analysisPixels[(index - 1) * 4 + 3];
      const right = analysisPixels[(index + 1) * 4 + 3];
      const up = analysisPixels[(index - analysisWidth) * 4 + 3];
      const down = analysisPixels[(index + analysisWidth) * 4 + 3];
      const minA = Math.min(a, left, right, up, down);
      const maxA = Math.max(a, left, right, up, down);
      if ((a > 2 && a < 253) || (maxA - minA >= 28 && maxA >= 54 && minA <= 205)) {
        edgeBand[index] = 1;
      }
    }
  }

  const expandIterations = mobileLike ? 4 : 5;
  for (let iteration = 0; iteration < expandIterations; iteration += 1) {
    const expanded = edgeBand.slice();
    for (let y = 1; y < analysisHeight - 1; y += 1) {
      for (let x = 1; x < analysisWidth - 1; x += 1) {
        const index = y * analysisWidth + x;
        if (!edgeBand[index]) continue;
        expanded[index - 1] = 1;
        expanded[index + 1] = 1;
        expanded[index - analysisWidth] = 1;
        expanded[index + analysisWidth] = 1;
        expanded[index - analysisWidth - 1] = 1;
        expanded[index - analysisWidth + 1] = 1;
        expanded[index + analysisWidth - 1] = 1;
        expanded[index + analysisWidth + 1] = 1;
      }
    }
    edgeBand = expanded;
  }

  // HAIR_FUR_TRACE_BAND_V5
  // The matte itself can contain a fully transparent 2-3 px break, so a second
  // slightly wider candidate band is needed. It is still derived from the matte
  // contour and never scans unrelated image interiors.
  let traceBand = edgeBand.slice();
  const traceExpandIterations = mobileLike ? 3 : 4;
  for (let iteration = 0; iteration < traceExpandIterations; iteration += 1) {
    const expanded = traceBand.slice();
    for (let y = 1; y < analysisHeight - 1; y += 1) {
      for (let x = 1; x < analysisWidth - 1; x += 1) {
        const index = y * analysisWidth + x;
        if (!traceBand[index]) continue;
        expanded[index - 1] = 1;
        expanded[index + 1] = 1;
        expanded[index - analysisWidth] = 1;
        expanded[index + analysisWidth] = 1;
        expanded[index - analysisWidth - 1] = 1;
        expanded[index - analysisWidth + 1] = 1;
        expanded[index + analysisWidth - 1] = 1;
        expanded[index + analysisWidth + 1] = 1;
      }
    }
    traceBand = expanded;
  }

  const sourceImageData = sourceCtx.getImageData(0, 0, width, height);
  const sourcePixels = sourceImageData.data;
  const maskImageData = maskCtx.getImageData(0, 0, width, height);
  const maskPixels = maskImageData.data;
  const alphaOut = new Uint8ClampedArray(width * height);
  for (let index = 0; index < alphaOut.length; index += 1) {
    alphaOut[index] = maskPixels[index * 4 + 3];
  }

  const xScale = analysisWidth / width;
  const yScale = analysisHeight / height;
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [1, -1], [-1, 1], [1, 1]
  ];
  const sampleRadii = mobileLike ? [1, 2, 4, 6] : [1, 2, 3, 5, 7];
  const colorDistanceSq = (r1, g1, b1, r2, g2, b2) => {
    const dr = r1 - r2;
    const dg = g1 - g2;
    const db = b1 - b2;
    return dr * dr + dg * dg + db * db;
  };

  for (let y = 1; y < height - 1; y += 1) {
    const ay = Math.min(analysisHeight - 1, Math.floor(y * yScale));
    for (let x = 1; x < width - 1; x += 1) {
      const ax = Math.min(analysisWidth - 1, Math.floor(x * xScale));
      if (!edgeBand[ay * analysisWidth + ax]) continue;

      const index = y * width + x;
      const p = index * 4;
      const currentAlpha = alphaOut[index];
      if (currentAlpha >= 250) continue;

      // HAIR_FUR_CONTINUITY_RESCUE_V4
      // A one-pixel gap inside a real strand should have foreground support on
      // opposite sides. This lets us rescue broken hairs without reviving isolated
      // background speckles that happen to have a similar colour.
      const leftAlpha = alphaOut[index - 1];
      const rightAlpha = alphaOut[index + 1];
      const upAlpha = alphaOut[index - width];
      const downAlpha = alphaOut[index + width];
      const upLeftAlpha = alphaOut[index - width - 1];
      const upRightAlpha = alphaOut[index - width + 1];
      const downLeftAlpha = alphaOut[index + width - 1];
      const downRightAlpha = alphaOut[index + width + 1];
      const continuitySupport = Math.max(
        Math.min(leftAlpha, rightAlpha),
        Math.min(upAlpha, downAlpha),
        Math.min(upLeftAlpha, downRightAlpha),
        Math.min(upRightAlpha, downLeftAlpha)
      );
      let nearbyStrandSupport = 0;
      if (leftAlpha >= 42) nearbyStrandSupport += 1;
      if (rightAlpha >= 42) nearbyStrandSupport += 1;
      if (upAlpha >= 42) nearbyStrandSupport += 1;
      if (downAlpha >= 42) nearbyStrandSupport += 1;
      if (upLeftAlpha >= 42) nearbyStrandSupport += 1;
      if (upRightAlpha >= 42) nearbyStrandSupport += 1;
      if (downLeftAlpha >= 42) nearbyStrandSupport += 1;
      if (downRightAlpha >= 42) nearbyStrandSupport += 1;
      const bridgeLike = currentAlpha <= 18 && continuitySupport >= 64;
      const supportedStrand = nearbyStrandSupport >= 2 || continuitySupport >= 48;
      const autoStrandCandidate =
        bridgeLike ||
        (currentAlpha <= 104 && nearbyStrandSupport >= 1 && nearbyStrandSupport <= 4);
      if (autoMode && !autoStrandCandidate) continue;

      let fgR = 0, fgG = 0, fgB = 0, fgCount = 0;
      let bgR = 0, bgG = 0, bgB = 0, bgCount = 0;
      for (const radius of sampleRadii) {
        for (const [dx, dy] of directions) {
          const nx = x + dx * radius;
          const ny = y + dy * radius;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const ni = ny * width + nx;
          const np = ni * 4;
          const neighborAlpha = alphaOut[ni];
          if (neighborAlpha >= 218) {
            fgR += sourcePixels[np]; fgG += sourcePixels[np + 1]; fgB += sourcePixels[np + 2]; fgCount += 1;
          } else if (neighborAlpha <= 22) {
            bgR += sourcePixels[np]; bgG += sourcePixels[np + 1]; bgB += sourcePixels[np + 2]; bgCount += 1;
          }
        }
      }
      if (fgCount < 2 || bgCount < 2) continue;
      fgR /= fgCount; fgG /= fgCount; fgB /= fgCount;
      bgR /= bgCount; bgG /= bgCount; bgB /= bgCount;
      if (colorDistanceSq(fgR, fgG, fgB, bgR, bgG, bgB) < 196) continue;

      const pr = sourcePixels[p], pg = sourcePixels[p + 1], pb = sourcePixels[p + 2];
      const dFg = colorDistanceSq(pr, pg, pb, fgR, fgG, fgB);
      const dBg = colorDistanceSq(pr, pg, pb, bgR, bgG, bgB);
      const distanceTotal = dFg + dBg;
      if (distanceTotal < 8) continue;

      const colorAlpha = Math.max(0, Math.min(255, Math.round((dBg / distanceTotal) * 255)));
      const fgAdvantage = (dBg + 1) / (dFg + 1);
      const confidence = Math.min(1, Math.abs(dBg - dFg) / Math.max(1, distanceTotal));
      let nextAlpha = currentAlpha;

      // Rescue nearly-lost filaments using both source colour and local strand
      // continuity. Supported one-pixel gaps may use a lower colour threshold; an
      // isolated pixel still needs very strong foreground evidence.
      const bridgeRescue = bridgeLike && fgAdvantage >= 1.28 && colorAlpha >= 82;
      const supportedRescue = currentAlpha <= 30 && supportedStrand && fgAdvantage >= 1.38 && colorAlpha >= 92;
      const isolatedStrongRescue = currentAlpha <= 24 && fgAdvantage >= 1.72 && colorAlpha >= 118;
      if (bridgeRescue || supportedRescue || isolatedStrongRescue) {
        const continuityBoost = bridgeRescue ? 0.12 : (supportedRescue ? 0.07 : 0);
        const rescueStrength = Math.min(0.88, 0.60 + confidence * 0.22 + continuityBoost);
        nextAlpha = Math.max(currentAlpha, Math.min(202, Math.round(colorAlpha * rescueStrength)));
      } else if (currentAlpha < 220) {
        let blend = 0.48 + confidence * 0.28;
        if (currentAlpha <= 6) blend *= 0.72;
        nextAlpha = Math.max(0, Math.min(255, Math.round(currentAlpha * (1 - blend) + colorAlpha * blend)));
      }
      if (colorAlpha < 42 && currentAlpha < 110) {
        nextAlpha = Math.min(nextAlpha, Math.round(currentAlpha * 0.68));
      }
      alphaOut[index] = nextAlpha;

      if (nextAlpha > 7 && nextAlpha < 244) {
        // Low-alpha supported strands carry more of the old background colour, so
        // decontaminate them a little more while leaving ordinary edges unchanged.
        const fineStrand = nextAlpha < 136 && supportedStrand;
        const pull = Math.min(
          fineStrand ? 0.42 : 0.30,
          (1 - nextAlpha / 255) * (fineStrand ? 0.48 : 0.34)
        );
        sourcePixels[p] = Math.round(sourcePixels[p] * (1 - pull) + fgR * pull);
        sourcePixels[p + 1] = Math.round(sourcePixels[p + 1] * (1 - pull) + fgG * pull);
        sourcePixels[p + 2] = Math.round(sourcePixels[p + 2] * (1 - pull) + fgB * pull);
      }
    }
  }

  // HAIR_FUR_DIRECTIONAL_TRACE_V5
  // V4 could only restore a one-pixel hole whose immediate opposite neighbours
  // were already visible. V5 traces the original RGB along four axes so a short
  // fully transparent break (or the first pixels past a thin strand tip) can be
  // recovered without widening broad skin/clothing silhouettes.
  let tracedAlpha = alphaOut.slice();
  const traceAxes = [[1, 0], [0, 1], [1, 1], [1, -1]];
  const traceDirections = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [-1, -1], [1, -1], [-1, 1]
  ];
  const alphaAt = (map, x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return 0;
    return map[y * width + x];
  };
  const findSupport = (map, x, y, dx, dy, maxStep = 4) => {
    for (let step = 1; step <= maxStep; step += 1) {
      const nx = x + dx * step;
      const ny = y + dy * step;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) break;
      const index = ny * width + nx;
      const alpha = map[index];
      if (alpha >= 42) return { index, x: nx, y: ny, alpha, step };
    }
    return null;
  };
  const sourceColor = (index) => {
    const p = index * 4;
    return [sourcePixels[p], sourcePixels[p + 1], sourcePixels[p + 2]];
  };
  const colorDistanceTo = (index, color) => {
    const p = index * 4;
    return colorDistanceSq(sourcePixels[p], sourcePixels[p + 1], sourcePixels[p + 2], color[0], color[1], color[2]);
  };
  const tracePasses = autoMode ? 2 : 3;

  for (let pass = 0; pass < tracePasses; pass += 1) {
    const nextTrace = tracedAlpha.slice();
    for (let y = 3; y < height - 3; y += 1) {
      const ay = Math.min(analysisHeight - 1, Math.floor(y * yScale));
      for (let x = 3; x < width - 3; x += 1) {
        const ax = Math.min(analysisWidth - 1, Math.floor(x * xScale));
        if (!traceBand[ay * analysisWidth + ax]) continue;

        const index = y * width + x;
        const currentAlpha = tracedAlpha[index];
        if (currentAlpha > 38) continue;

        let nearbySupport = 0;
        for (const [dx, dy] of traceDirections) {
          if (alphaAt(tracedAlpha, x + dx, y + dy) >= 38) nearbySupport += 1;
        }

        let bestAlpha = currentAlpha;
        let bestColor = null;

        // Bridge a short transparent gap only when both ends line up and their
        // source colours agree. This is the main fix for visibly broken hairs.
        for (const [dx, dy] of traceAxes) {
          const positive = findSupport(tracedAlpha, x, y, dx, dy, 4);
          const negative = findSupport(tracedAlpha, x, y, -dx, -dy, 4);
          if (!positive || !negative) continue;
          if (positive.step + negative.step > 9) continue;

          const positiveColor = sourceColor(positive.index);
          const negativeColor = sourceColor(negative.index);
          const endDistance = colorDistanceSq(
            positiveColor[0], positiveColor[1], positiveColor[2],
            negativeColor[0], negativeColor[1], negativeColor[2]
          );
          if (endDistance > (autoMode ? 2800 : 4200)) continue;

          const meanColor = [
            (positiveColor[0] + negativeColor[0]) / 2,
            (positiveColor[1] + negativeColor[1]) / 2,
            (positiveColor[2] + negativeColor[2]) / 2
          ];
          if (colorDistanceTo(index, meanColor) > (autoMode ? 3300 : 4800)) continue;

          const endpointAlpha = (positive.alpha + negative.alpha) / 2;
          const gapSpan = positive.step + negative.step;
          const gapFactor = gapSpan >= 8 ? 0.48 : (gapSpan >= 6 ? 0.56 : 0.64);
          const candidateAlpha = Math.min(autoMode ? 156 : 182, Math.round(endpointAlpha * gapFactor));
          if (candidateAlpha > bestAlpha) {
            bestAlpha = candidateAlpha;
            bestColor = meanColor;
          }
        }

        // Also extend a genuinely thin visible tip by at most two iterative pixels.
        // Broad object boundaries have too many adjacent foreground pixels and are
        // therefore excluded from this one-sided continuation rule.
        if (bestAlpha === currentAlpha && currentAlpha <= 12 && nearbySupport <= 2) {
          for (const [dx, dy] of traceDirections) {
            const back1X = x - dx;
            const back1Y = y - dy;
            const back2X = x - dx * 2;
            const back2Y = y - dy * 2;
            const back1Alpha = alphaAt(tracedAlpha, back1X, back1Y);
            const back2Alpha = alphaAt(tracedAlpha, back2X, back2Y);
            if (back1Alpha < 48 || back2Alpha < 38) continue;

            const back1Index = back1Y * width + back1X;
            const back2Index = back2Y * width + back2X;
            const c1 = sourceColor(back1Index);
            const c2 = sourceColor(back2Index);
            if (colorDistanceSq(c1[0], c1[1], c1[2], c2[0], c2[1], c2[2]) > (autoMode ? 2400 : 3400)) continue;
            const meanColor = [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2, (c1[2] + c2[2]) / 2];
            if (colorDistanceTo(index, meanColor) > (autoMode ? 2800 : 4000)) continue;

            const candidateAlpha = Math.min(autoMode ? 96 : 120, Math.round(Math.min(back1Alpha, back2Alpha) * 0.54));
            if (candidateAlpha > bestAlpha) {
              bestAlpha = candidateAlpha;
              bestColor = meanColor;
            }
          }
        }

        if (bestAlpha <= currentAlpha) continue;
        nextTrace[index] = bestAlpha;
        if (bestColor) {
          const p = index * 4;
          const mix = autoMode ? 0.24 : 0.30;
          sourcePixels[p] = Math.round(sourcePixels[p] * (1 - mix) + bestColor[0] * mix);
          sourcePixels[p + 1] = Math.round(sourcePixels[p + 1] * (1 - mix) + bestColor[1] * mix);
          sourcePixels[p + 2] = Math.round(sourcePixels[p + 2] * (1 - mix) + bestColor[2] * mix);
        }
      }
    }
    tracedAlpha = nextTrace;
  }

  alphaOut.set(tracedAlpha);

  // Minimal alpha stabilization retains strand texture instead of feathering it away.
  const stabilized = alphaOut.slice();
  for (let y = 1; y < height - 1; y += 1) {
    const ay = Math.min(analysisHeight - 1, Math.floor(y * yScale));
    for (let x = 1; x < width - 1; x += 1) {
      const ax = Math.min(analysisWidth - 1, Math.floor(x * xScale));
      if (!edgeBand[ay * analysisWidth + ax]) continue;
      const index = y * width + x;
      const a = alphaOut[index];
      if (a <= 4 || a >= 251) continue;
      const neighborMean = (alphaOut[index - 1] + alphaOut[index + 1] + alphaOut[index - width] + alphaOut[index + width]) / 4;
      const stabilizeMix = a < 96 ? 0.06 : 0.12;
      stabilized[index] = Math.max(0, Math.min(255, Math.round(a * (1 - stabilizeMix) + neighborMean * stabilizeMix)));
    }
  }

  for (let index = 0; index < stabilized.length; index += 1) {
    sourcePixels[index * 4 + 3] = stabilized[index];
  }
  sourceCtx.putImageData(sourceImageData, 0, 0);
  return canvasToPngBlob(sourceCanvas);
}

`
      transformed = transformed.replace(assessAnchor, `${helper}${assessAnchor}`)

      const downloadAnchor = '  const downloadBlob = (blob, filename) => {'
      if (!transformed.includes(downloadAnchor)) {
        throw new Error('[hair-fur-v3] Download handler anchor was not found')
      }
      const handler = `  const runHairFurRetry = async () => {
    if (!file || busy || !resultBlob) return;
    processingCancelledRef.current = false;
    setProcessingDetail('');
    setProcessingWorkerStage('');
    setBusy(true);
    setStage('hair-fur');
    setProgress(null);
    setPrecisionMessage('');
    try {
      let detailBlob = await removeWithBiRefNet(file, (info) => {
        if (typeof info?.progress === 'number') {
          setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
        }
      });
      detailBlob = await refineHairBackgroundChannels(detailBlob);
      detailBlob = await correctUnexpectedForegroundTransparency(detailBlob);
      detailBlob = await cleanAiForegroundArtifacts(detailBlob);
      detailBlob = await refineHairFurEdges(detailBlob, file);
      const detailQuality = await assessRemovalQuality(detailBlob);
      if (detailQuality.status === 'fail' && qualityAssessment.status !== 'fail') {
        setPrecisionMessage(getHairFurText(lang).noBetter);
      } else {
        const url = URL.createObjectURL(detailBlob);
        setResultBlob(detailBlob);
        setResultUrl(url);
        setResultMethod('hair-fur');
        setQualityAssessment(detailQuality);
        setComparePosition(50);
        setPrecisionMessage(getHairFurText(lang).applied);
      }
    } catch (e) {
      if (processingCancelledRef.current || e?.name === 'AbortError') {
        setPrecisionMessage('');
      } else {
        console.error('Hair/fur precision retry failed:', e);
        setPrecisionMessage(t.failed);
      }
    } finally {
      setBusy(false);
      setStage('');
      setProgress(null);
      setProcessingDetail('');
      setProcessingWorkerStage('');
    }
  };

`
      transformed = transformed.replace(downloadAnchor, `${handler}${downloadAnchor}`)

      const messageAnchor = '          {precisionMessage && <div className="mt-3 rounded-xl bg-[#F6F3EE] px-3.5 py-3 text-xs sm:text-[13px] font-semibold leading-5 text-[#6F675E]">{precisionMessage}</div>}'
      if (!transformed.includes(messageAnchor)) {
        throw new Error('[hair-fur-v3] Precision-message UI anchor was not found')
      }
      const hairFurUi = `          {resultUrl && ['ai', 'modnet', 'birefnet', 'hair-fur'].includes(resultMethod) && (
            <div className="mt-3 rounded-xl border border-[#D7DED2] bg-[#FCFEFB] px-3.5 py-3">
              <button type="button" disabled={busy} onClick={runHairFurRetry} className="w-full rounded-xl bg-[#556B55] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#455B45] disabled:cursor-wait disabled:opacity-60">
                🪶 {busy && stage === 'hair-fur' ? getHairFurText(lang).working : getHairFurText(lang).retry}
              </button>
              <p className="mt-2 text-[11px] sm:text-xs font-medium leading-5 text-[#6F786B]">{getHairFurText(lang).hint}</p>
            </div>
          )}

`
      transformed = transformed.replace(messageAnchor, `${hairFurUi}${messageAnchor}`)

      const feedbackBusy = "processingDetail || (stage === 'precision' ? t.precisionWorking : (stage === 'preparing' ? t.preparing : t.processing))"
      if (transformed.includes(feedbackBusy)) {
        transformed = transformed.split(feedbackBusy).join("processingDetail || (stage === 'hair-fur' ? getHairFurText(lang).working : (stage === 'precision' ? t.precisionWorking : (stage === 'preparing' ? t.preparing : t.processing)))")
      }
      const simpleBusy = "stage === 'precision' ? t.precisionWorking : (stage === 'preparing' ? t.preparing : t.processing)"
      if (transformed.includes(simpleBusy)) {
        transformed = transformed.split(simpleBusy).join("stage === 'hair-fur' ? getHairFurText(lang).working : (stage === 'precision' ? t.precisionWorking : (stage === 'preparing' ? t.preparing : t.processing))")
      }

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), hairFurPrecisionPre()],
})
