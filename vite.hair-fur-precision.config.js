import { defineConfig } from 'vite'
import baseConfig from './vite.hybrid-edge-refine.config.js'

function hairFurPrecision() {
  return {
    name: 'hair-fur-fine-detail-precision-v1',
    enforce: 'post',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/BackgroundRemover.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      const assessAnchor = 'async function assessRemovalQuality(blob) {'
      if (!transformed.includes(assessAnchor)) {
        throw new Error('[hair-fur] Quality-assessment anchor was not found')
      }
      if (!transformed.includes('HYBRID_ORIGINAL_RESOLUTION_EDGE_REFINEMENT_V1')) {
        throw new Error('[hair-fur] Hybrid edge refinement must run before hair/fur refinement')
      }

      const helper = `// HAIR_FUR_FINE_DETAIL_PRECISION_V1
async function refineHairFurEdges(matteBlob, sourceFile) {
  if (!sourceFile) return matteBlob;

  // Start with the balanced original-resolution hybrid pass, then run a second
  // conservative filament-rescue pass only around the matte contour.
  const balancedBlob = typeof refineHybridPrecisionEdges === 'function'
    ? await refineHybridPrecisionEdges(matteBlob, sourceFile)
    : matteBlob;

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
  const analysisMax = mobileLike ? 760 : 1100;
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

  // Detect both feathered alpha and hard silhouette transitions. The threshold is
  // deliberately more sensitive than the balanced pass so hair tips, whiskers,
  // feathers and fine fur can enter the candidate band.
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

  // Hair can extend several pixels beyond a coarse AI silhouette. Expand the
  // candidate band, but never run the expensive rescue logic across the full image.
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

  let rescuedPixels = 0;
  for (let y = 1; y < height - 1; y += 1) {
    const ay = Math.min(analysisHeight - 1, Math.floor(y * yScale));
    for (let x = 1; x < width - 1; x += 1) {
      const ax = Math.min(analysisWidth - 1, Math.floor(x * xScale));
      if (!edgeBand[ay * analysisWidth + ax]) continue;

      const index = y * width + x;
      const p = index * 4;
      const currentAlpha = alphaOut[index];
      if (currentAlpha >= 250) continue;

      let fgR = 0;
      let fgG = 0;
      let fgB = 0;
      let fgCount = 0;
      let bgR = 0;
      let bgG = 0;
      let bgB = 0;
      let bgCount = 0;

      for (const radius of sampleRadii) {
        for (const [dx, dy] of directions) {
          const nx = x + dx * radius;
          const ny = y + dy * radius;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const ni = ny * width + nx;
          const np = ni * 4;
          const neighborAlpha = alphaOut[ni];
          if (neighborAlpha >= 218) {
            fgR += sourcePixels[np];
            fgG += sourcePixels[np + 1];
            fgB += sourcePixels[np + 2];
            fgCount += 1;
          } else if (neighborAlpha <= 22) {
            bgR += sourcePixels[np];
            bgG += sourcePixels[np + 1];
            bgB += sourcePixels[np + 2];
            bgCount += 1;
          }
        }
      }

      if (fgCount < 2 || bgCount < 2) continue;
      fgR /= fgCount;
      fgG /= fgCount;
      fgB /= fgCount;
      bgR /= bgCount;
      bgG /= bgCount;
      bgB /= bgCount;

      const fgBgSeparation = colorDistanceSq(fgR, fgG, fgB, bgR, bgG, bgB);
      if (fgBgSeparation < 196) continue;

      const pr = sourcePixels[p];
      const pg = sourcePixels[p + 1];
      const pb = sourcePixels[p + 2];
      const dFg = colorDistanceSq(pr, pg, pb, fgR, fgG, fgB);
      const dBg = colorDistanceSq(pr, pg, pb, bgR, bgG, bgB);
      const distanceTotal = dFg + dBg;
      if (distanceTotal < 8) continue;

      const colorAlpha = Math.max(0, Math.min(255, Math.round((dBg / distanceTotal) * 255)));
      const fgAdvantage = (dBg + 1) / (dFg + 1);
      const confidence = Math.min(1, Math.abs(dBg - dFg) / Math.max(1, distanceTotal));
      let nextAlpha = currentAlpha;

      // Rescue nearly-lost filaments only when the original RGB is clearly more
      // foreground-like than background-like. This is what brings back individual
      // hairs/fur without broadly restoring the removed backdrop.
      if (currentAlpha <= 24 && fgAdvantage >= 1.55 && colorAlpha >= 110) {
        const rescueStrength = 0.56 + confidence * 0.20;
        nextAlpha = Math.max(currentAlpha, Math.min(188, Math.round(colorAlpha * rescueStrength)));
        if (nextAlpha > currentAlpha + 8) rescuedPixels += 1;
      } else if (currentAlpha < 220) {
        let blend = 0.48 + confidence * 0.28;
        if (currentAlpha <= 6) blend *= 0.72;
        nextAlpha = Math.max(0, Math.min(255, Math.round(currentAlpha * (1 - blend) + colorAlpha * blend)));
      }

      // Strongly background-like pixels are allowed to fade instead of becoming a halo.
      if (colorAlpha < 42 && currentAlpha < 110) {
        nextAlpha = Math.min(nextAlpha, Math.round(currentAlpha * 0.68));
      }

      alphaOut[index] = nextAlpha;

      // Defringe only semi-transparent detail pixels. Opaque subject colors stay untouched.
      if (nextAlpha > 7 && nextAlpha < 244) {
        const pull = Math.min(0.30, (1 - nextAlpha / 255) * 0.34);
        sourcePixels[p] = Math.round(sourcePixels[p] * (1 - pull) + fgR * pull);
        sourcePixels[p + 1] = Math.round(sourcePixels[p + 1] * (1 - pull) + fgG * pull);
        sourcePixels[p + 2] = Math.round(sourcePixels[p + 2] * (1 - pull) + fgB * pull);
      }
    }
  }

  // Very light alpha stabilization. Hair/fur mode intentionally keeps much more
  // of the original pixel-level variation than the balanced edge pass.
  const stabilized = alphaOut.slice();
  for (let y = 1; y < height - 1; y += 1) {
    const ay = Math.min(analysisHeight - 1, Math.floor(y * yScale));
    for (let x = 1; x < width - 1; x += 1) {
      const ax = Math.min(analysisWidth - 1, Math.floor(x * xScale));
      if (!edgeBand[ay * analysisWidth + ax]) continue;
      const index = y * width + x;
      const a = alphaOut[index];
      if (a <= 4 || a >= 251) continue;
      const neighborMean = (
        alphaOut[index - 1] +
        alphaOut[index + 1] +
        alphaOut[index - width] +
        alphaOut[index + width]
      ) / 4;
      stabilized[index] = Math.max(0, Math.min(255, Math.round(a * 0.88 + neighborMean * 0.12)));
    }
  }

  // If no near-zero filament needed rescuing, the pass still improves partially
  // transparent fur through color-aware alpha refinement above.
  void rescuedPixels;
  for (let index = 0; index < stabilized.length; index += 1) {
    sourcePixels[index * 4 + 3] = stabilized[index];
  }
  sourceCtx.putImageData(sourceImageData, 0, 0);
  return canvasToPngBlob(sourceCanvas);
}

`

      if (!transformed.includes('HAIR_FUR_FINE_DETAIL_PRECISION_V1')) {
        transformed = transformed.replace(assessAnchor, `${helper}${assessAnchor}`)
      }

      const componentAnchor = "  const t = COPY[lang] || COPY.ko;"
      if (!transformed.includes(componentAnchor)) {
        throw new Error('[hair-fur] Component copy anchor was not found')
      }
      const hairFurCopy = `
  const hairFurText = ({
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
  })[lang] || ({
    retry: '헤어·퍼 정밀',
    hint: '머리카락 한 올, 동물 털, 수염처럼 매우 얇은 경계를 원본 해상도에서 정밀 복원합니다. 필요한 이미지에만 사용해 주세요.',
    working: '머리카락·털의 미세 경계를 복원하고 있어요…',
    noBetter: '헤어·퍼 정밀 결과에서 배경 잔상이 크게 늘어 기존 결과를 유지했습니다.',
    applied: '헤어·퍼 정밀 보정을 적용했습니다. 확대해서 털 끝과 머리카락 경계를 확인해 주세요.'
  });`
      transformed = transformed.replace(componentAnchor, `${componentAnchor}${hairFurCopy}`)

      const downloadAnchor = '  const downloadBlob = (blob, filename) => {'
      if (!transformed.includes(downloadAnchor)) {
        throw new Error('[hair-fur] Download handler anchor was not found')
      }
      const handler = `  const runHairFurRetry = async () => {
    if (!file || busy || !resultBlob) return;
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

      // Fine strands naturally create more semi-transparent pixels. Do not reject
      // the mode for a slightly worse score; reject only a new hard failure.
      if (detailQuality.status === 'fail' && qualityAssessment.status !== 'fail') {
        setPrecisionMessage(hairFurText.noBetter);
      } else {
        const url = URL.createObjectURL(detailBlob);
        setResultBlob(detailBlob);
        setResultUrl(url);
        setResultMethod('hair-fur');
        setQualityAssessment(detailQuality);
        setComparePosition(50);
        setPrecisionMessage(hairFurText.applied);
      }
    } catch (e) {
      console.error('Hair/fur precision retry failed:', e);
      setPrecisionMessage(t.failed);
    } finally {
      setBusy(false);
      setStage('');
      setProgress(null);
    }
  };

`
      transformed = transformed.replace(downloadAnchor, `${handler}${downloadAnchor}`)

      const messageAnchor = '          {precisionMessage && <div className="mt-3 rounded-xl bg-[#F6F3EE] px-3.5 py-3 text-xs sm:text-[13px] font-semibold leading-5 text-[#6F675E]">{precisionMessage}</div>}'
      if (!transformed.includes(messageAnchor)) {
        throw new Error('[hair-fur] Precision-message UI anchor was not found')
      }
      const hairFurUi = `          {resultUrl && ['ai', 'modnet', 'birefnet', 'hair-fur'].includes(resultMethod) && (
            <div className="mt-3 rounded-xl border border-[#D7DED2] bg-[#FCFEFB] px-3.5 py-3">
              <button type="button" disabled={busy} onClick={runHairFurRetry} className="w-full rounded-xl bg-[#556B55] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#455B45] disabled:cursor-wait disabled:opacity-60">
                🪶 {busy && stage === 'hair-fur' ? hairFurText.working : hairFurText.retry}
              </button>
              <p className="mt-2 text-[11px] sm:text-xs font-medium leading-5 text-[#6F786B]">{hairFurText.hint}</p>
            </div>
          )}

`
      transformed = transformed.replace(messageAnchor, `${hairFurUi}${messageAnchor}`)

      const busyText = "stage === 'precision' ? t.precisionWorking : (stage === 'preparing' ? t.preparing : t.processing)"
      if (!transformed.includes(busyText)) {
        throw new Error('[hair-fur] Busy-stage text anchor was not found')
      }
      transformed = transformed.split(busyText).join("stage === 'hair-fur' ? hairFurText.working : (stage === 'precision' ? t.precisionWorking : (stage === 'preparing' ? t.preparing : t.processing))")

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), hairFurPrecision()],
})
