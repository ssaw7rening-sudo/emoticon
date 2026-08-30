from pathlib import Path

path = Path('src/components/BackgroundRemover.jsx')
s = path.read_text(encoding='utf-8')

def rep(old, new, label):
    global s
    if old not in s:
        raise SystemExit(f'Missing anchor: {label}')
    s = s.replace(old, new, 1)

# Add compact manual-fallback copy for uncertain sheet detection.
rep(
"    splitReady: '분리 완료 · 각 이미지를 눌러 개별 PNG로 저장할 수 있습니다.',\n    splitAgain: '다시 분리', splitDownload: 'PNG 저장', splitFailed: '자동 분리에 실패했습니다. 이미지를 다시 처리한 뒤 시도해 주세요.',",
"    splitReady: '분리 완료 · 각 이미지를 눌러 개별 PNG로 저장할 수 있습니다.',\n    splitAgain: '다시 분리', splitDownload: 'PNG 저장', splitFailed: '자동 분리에 실패했습니다. 이미지를 다시 처리한 뒤 시도해 주세요.',\n    splitMaybeTitle: '15개 이모티콘 시트인가요?', splitMaybeDesc: '자동 감지가 확실하지 않습니다. 이모티콘 시트라면 직접 분리를 실행할 수 있습니다.', splitMaybeAction: '이모티콘 시트 분리',",
'ko copy')
rep(
"    splitReady: 'Split complete · Save each emoticon as an individual PNG.',\n    splitAgain: 'Split again', splitDownload: 'Save PNG', splitFailed: 'Auto split failed. Process the image again and retry.',",
"    splitReady: 'Split complete · Save each emoticon as an individual PNG.',\n    splitAgain: 'Split again', splitDownload: 'Save PNG', splitFailed: 'Auto split failed. Process the image again and retry.',\n    splitMaybeTitle: 'Is this a 15-emoticon sheet?', splitMaybeDesc: 'The layout is uncertain. If this is an emoticon sheet, you can run the splitter manually.', splitMaybeAction: 'Split emoticon sheet',",
'en copy')
rep(
"    splitReady: '分割完了 · 各画像を個別PNGとして保存できます。',\n    splitAgain: '再分割', splitDownload: 'PNG保存', splitFailed: '自動分割に失敗しました。画像を再処理してお試しください。',",
"    splitReady: '分割完了 · 各画像を個別PNGとして保存できます。',\n    splitAgain: '再分割', splitDownload: 'PNG保存', splitFailed: '自動分割に失敗しました。画像を再処理してお試しください。',\n    splitMaybeTitle: '15個の絵文字シートですか？', splitMaybeDesc: '自動判定が確実ではありません。絵文字シートの場合は手動で分割を実行できます。', splitMaybeAction: '絵文字シートを分割',",
'ja copy')
rep(
"    splitReady: '分割完成 · 可将每个表情单独保存为PNG。',\n    splitAgain: '重新分割', splitDownload: '保存PNG', splitFailed: '自动分割失败，请重新处理图片后再试。',",
"    splitReady: '分割完成 · 可将每个表情单独保存为PNG。',\n    splitAgain: '重新分割', splitDownload: '保存PNG', splitFailed: '自动分割失败，请重新处理图片后再试。',\n    splitMaybeTitle: '这是15个表情的图片合集吗？', splitMaybeDesc: '自动判断不够确定。如果这是表情合集，可以手动启动分割。', splitMaybeAction: '分割表情合集',",
'zh copy')

# Insert layout classifier before the splitter itself.
anchor = "async function splitIntoFifteen(blob) {\n"
classifier = r'''function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function classifyEmoticonSheetComponents(components, width, height) {
  const total = width * height;
  if (!total || components.length < 10) return { status: 'not-sheet', confidence: 0 };

  // A sticker-sheet primary is substantial but still much smaller than the full image.
  // This excludes faces/bodies in ordinary group photos while filtering tiny text/noise fragments.
  const candidates = components.filter((component) => {
    const areaRatio = component.area / total;
    const fillRatio = component.area / Math.max(1, component.width * component.height);
    return (
      areaRatio >= 0.0015 &&
      component.width >= width * 0.045 &&
      component.width <= width * 0.34 &&
      component.height >= height * 0.065 &&
      component.height <= height * 0.34 &&
      fillRatio >= 0.055
    );
  });

  if (candidates.length < 10) return { status: 'not-sheet', confidence: 0.08 };

  const expectedCellWidth = width / 5;
  const expectedCellHeight = height / 3;
  const ranked = [...candidates].sort((a, b) => {
    const aFill = a.area / Math.max(1, a.width * a.height);
    const bFill = b.area / Math.max(1, b.width * b.height);
    return b.area * (0.82 + Math.min(0.6, bFill)) - a.area * (0.82 + Math.min(0.6, aFill));
  });

  const selected = [];
  for (const candidate of ranked) {
    const tooClose = selected.some((picked) => {
      const dx = (candidate.centerX - picked.centerX) / expectedCellWidth;
      const dy = (candidate.centerY - picked.centerY) / expectedCellHeight;
      return Math.hypot(dx, dy) < 0.43;
    });
    if (!tooClose) selected.push(candidate);
    if (selected.length === 15) break;
  }

  if (selected.length < 13) return { status: 'not-sheet', confidence: 0.22 };
  if (selected.length < 15) return { status: 'ambiguous', confidence: 0.52 };

  const byY = selected.slice(0, 15).sort((a, b) => a.centerY - b.centerY);
  const rows = [0, 1, 2].map((row) => byY.slice(row * 5, row * 5 + 5).sort((a, b) => a.centerX - b.centerX));
  const rowMeans = rows.map((row) => row.reduce((sum, item) => sum + item.centerY, 0) / row.length);
  const rowSpreads = rows.map((row) => (Math.max(...row.map((item) => item.centerY)) - Math.min(...row.map((item) => item.centerY))) / height);
  const rowGaps = [rowMeans[1] - rowMeans[0], rowMeans[2] - rowMeans[1]].map((gap) => gap / height);

  const xCenters = selected.map((item) => item.centerX);
  const yCenters = selected.map((item) => item.centerY);
  const xCoverage = (Math.max(...xCenters) - Math.min(...xCenters)) / width;
  const yCoverage = (Math.max(...yCenters) - Math.min(...yCenters)) / height;
  const averageRowSpread = rowSpreads.reduce((sum, value) => sum + value, 0) / rowSpreads.length;
  const minRowGap = Math.min(...rowGaps);
  const edgeRows = rows.filter((row) => row[0].centerX / width < 0.29 && row[4].centerX / width > 0.71).length;

  const columnDrifts = [0, 1, 2, 3, 4].map((column) => {
    const centers = rows.map((row) => row[column].centerX);
    return (Math.max(...centers) - Math.min(...centers)) / width;
  });
  const averageColumnDrift = columnDrifts.reduce((sum, value) => sum + value, 0) / columnDrifts.length;

  const medianWidth = median(selected.map((item) => item.width / width));
  const medianHeight = median(selected.map((item) => item.height / height));

  let confidence = 0.15; // fifteen separated primary candidates were found
  if (xCoverage >= 0.62) confidence += 0.15;
  if (yCoverage >= 0.44) confidence += 0.15;
  if (averageRowSpread <= 0.13) confidence += 0.15;
  if (minRowGap >= 0.17) confidence += 0.12;
  if (edgeRows >= 2) confidence += 0.12;
  if (averageColumnDrift <= 0.12) confidence += 0.10;
  if (medianWidth >= 0.055 && medianWidth <= 0.25 && medianHeight >= 0.08 && medianHeight <= 0.29) confidence += 0.06;

  if (confidence >= 0.78) return { status: 'sheet', confidence };
  if (confidence >= 0.58) return { status: 'ambiguous', confidence };
  return { status: 'not-sheet', confidence };
}

async function detectEmoticonSheet(blob) {
  const { canvas, ctx } = await drawFileToCanvas(blob);
  const { width, height } = canvas;
  if (!width || !height) return { status: 'not-sheet', confidence: 0 };
  const components = extractConnectedComponents(ctx, width, height);
  return classifyEmoticonSheetComponents(components, width, height);
}

'''
rep(anchor, classifier + anchor, 'classifier insertion')

# Add detection state.
rep(
"  const [splitError, setSplitError] = useState('');\n",
"  const [splitError, setSplitError] = useState('');\n  const [sheetDetection, setSheetDetection] = useState({ status: 'idle', confidence: 0 });\n",
'detection state')

# Analyze every new transparent result asynchronously. It does not block showing the result.
state_anchor = "  useEffect(() => () => {\n    splitItems.forEach((item) => URL.revokeObjectURL(item.url));\n  }, [splitItems]);\n\n"
detection_effect = r'''  useEffect(() => {
    let cancelled = false;
    if (!resultBlob) {
      setSheetDetection({ status: 'idle', confidence: 0 });
      return () => { cancelled = true; };
    }

    setSheetDetection({ status: 'checking', confidence: 0 });
    detectEmoticonSheet(resultBlob)
      .then((detection) => {
        if (!cancelled) setSheetDetection(detection);
      })
      .catch((error) => {
        console.warn('Emoticon sheet detection failed:', error);
        if (!cancelled) setSheetDetection({ status: 'ambiguous', confidence: 0 });
      });

    return () => { cancelled = true; };
  }, [resultBlob]);

'''
rep(state_anchor, state_anchor + detection_effect, 'detection effect')

# Replace unconditional splitter card with conditional sheet/ambiguous rendering.
old_start = "          {resultUrl && (\n            <div className=\"mt-5 rounded-2xl border border-[#DDD8CE] bg-white p-3.5 sm:p-4\">"
new_start = "          {resultUrl && (sheetDetection.status === 'sheet' || splitItems.length > 0) && (\n            <div className=\"mt-5 rounded-2xl border border-[#DDD8CE] bg-white p-3.5 sm:p-4\">"
rep(old_start, new_start, 'conditional full splitter')

# Insert compact manual fallback immediately after the full splitter card.
full_end = "          )}\n        </div>\n      )}\n"
manual = r'''          )}

          {resultUrl && sheetDetection.status === 'ambiguous' && splitItems.length === 0 && (
            <div className="mt-4 rounded-xl border border-[#E5DED3] bg-[#FCFBF8] px-3.5 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-extrabold text-[#4A453F]">✂️ {t.splitMaybeTitle}</div>
                  <p className="mt-1 text-[11px] sm:text-xs leading-5 text-[#7A736B]">{t.splitMaybeDesc}</p>
                </div>
                <button
                  type="button"
                  disabled={splitting}
                  onClick={autoSplit}
                  className="shrink-0 rounded-lg border border-[#D8CDBD] bg-white px-3 py-2 text-xs font-extrabold text-[#625544] transition hover:bg-[#FFF8ED] disabled:cursor-wait disabled:opacity-60"
                >
                  {splitting ? `⏳ ${t.splitting}` : `✂️ ${t.splitMaybeAction}`}
                </button>
              </div>
              {splitError && <div className="mt-2 rounded-lg bg-[#FFF1EE] px-3 py-2 text-xs font-semibold leading-5 text-[#A64D3D]">{splitError}</div>}
            </div>
          )}
        </div>
      )}
'''
rep(full_end, manual, 'manual fallback insertion')

path.write_text(s, encoding='utf-8')
print('patched BackgroundRemover sheet detection')
