const TARGET = '/src/App.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[sheet-layout-lock] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[sheet-layout-lock] ${label} marker is not unique`);
  }
  return source.slice(0, first) + replacement + source.slice(first + marker.length);
};

const replaceCount = (source, marker, replacement, expected, label) => {
  const parts = source.split(marker);
  const count = parts.length - 1;
  if (count !== expected) {
    throw new Error(`[sheet-layout-lock] ${label} expected ${expected}, found ${count}`);
  }
  return parts.join(replacement);
};

export function sheetLayoutLockPlugin() {
  return {
    name: 'sheet-layout-lock',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null;

      let out = code;
      const helperMarker = `  const getPreviewPrompt = () => {`;
      const helper = `  const enforceFifteenStickerLayout = (prompt, model) => {
    if (model !== 'gemini' && model !== 'grok') return prompt;
    const isSingle = generationMode === 'individual' || generationMode === 'batch';
    if (isSingle) return prompt;

    const textEnabled = model === 'gemini' ? geminiTextMode === 'text' : grokTextMode === 'text';

    const layoutKo = '[15개 이모티콘 시트 레이아웃 잠금 — 최상위 규칙]\\n- 최종 결과는 정확히 15개의 독립된 이모티콘으로 구성하세요. 12개, 16개 또는 다른 개수는 허용하지 않습니다.\\n- 캔버스는 가로형 3:2 비율을 우선하고, 지원되는 경우 1536×1024를 사용하세요. 세로형 3×4 콜라주로 바꾸지 마세요.\\n- 보이지 않는 고정 격자를 먼저 정확히 5열 × 3행으로 확보하세요. 1행은 1~5, 2행은 6~10, 3행은 11~15입니다.\\n- 3열×4행, 4열×3행, 4×4, 자유 콜라주, 행마다 다른 개수의 배치를 금지합니다. 반드시 5×3입니다.\\n- 각 셀에는 정확히 하나의 캐릭터/스티커만 배치하고 셀 경계를 넘어 이웃 스티커와 겹치지 마세요. 실제 격자선은 그리지 마세요.\\n- 제목, 헤더, 푸터, 범례, 추가 미니 캐릭터, 보너스 스티커를 넣지 마세요.\\n- 문구가 길거나 동작이 커도 셀 안에서 캐릭터와 문구의 크기를 조절해 해결하세요. 공간이 부족하다는 이유로 스티커를 삭제하거나 합치거나 행/열 수를 바꾸지 마세요.\\n- 이전의 의상 고정·상반신/반신/전신 구도·테마별 레터링 규칙은 각 셀 안에서 그대로 지키세요.';

    const textKo = textEnabled
      ? '\\n- 제공된 15개 원문 문구를 1번부터 15번까지 각 셀에 1:1로 정확히 대응하세요. 누락, 추가, 합치기, 순서 변경을 금지합니다. 전체 시트에는 정확히 15개의 스티커와 정확히 15개의 문구 인스턴스가 있어야 합니다.\\n- 생성 직전 자체 점검: 5열×3행인가? 셀이 15개인가? 캐릭터가 15개인가? 문구가 15개인가? 하나라도 아니면 구성을 수정한 뒤 생성하세요.'
      : '\\n- 문구 미포함 모드에서도 정확히 15개의 스티커를 유지하세요. 생성 직전 자체 점검: 5열×3행, 셀 15개, 캐릭터 15개인지 확인하고 하나라도 아니면 수정한 뒤 생성하세요.';

    const layoutEn = '[15-STICKER SHEET LAYOUT LOCK — HIGHEST PRIORITY] Produce exactly 15 independent stickers, never 12, 16, or any other count. Use a landscape 3:2 canvas, preferably 1536×1024 when supported. Reserve an invisible fixed grid of exactly 5 columns × 3 rows before drawing: row 1 = stickers 1–5, row 2 = 6–10, row 3 = 11–15. Never switch to 3×4, 4×3, 4×4, free collage, or uneven rows. Put exactly one sticker in each cell, with no overlap across cells and no visible grid lines. Do not add titles, headers, footers, legends, bonus stickers, or extra mini characters. If content is crowded, scale the character/text within the cell; never drop, merge, or rearrange stickers.';

    const textEn = textEnabled
      ? ' Map the 15 supplied source phrases one-to-one to cells 1–15 in order, with no omission, addition, merge, or reordering. The final sheet must contain exactly 15 stickers and exactly 15 phrase instances. Before rendering, self-check: 5×3 grid, 15 cells, 15 characters, 15 phrase instances.'
      : ' Even without rendered text, keep exactly 15 stickers. Before rendering, self-check: 5×3 grid, 15 cells, 15 characters.';

    const modelKo = model === 'gemini'
      ? '[Gemini 격자 실행 — 수량 정확도 최우선] 먼저 빈 5×3 레이아웃 15칸을 모두 확보한 다음 1번부터 15번까지 순서대로 하나씩 채우세요. 자동 레이아웃 최적화로 3×4 또는 12개 콜라주를 선택하지 마세요. 개별 스티커의 크기나 장식 완성도보다 15개 수량과 5×3 구조가 우선입니다.'
      : '[Grok 격자 실행 — 동세보다 수량/격자 우선] 강한 동작과 효과를 허용하되 반드시 고정 5×3 셀 안에서만 표현하세요. 동세 때문에 셀을 합치거나 큰 스티커가 여러 칸을 차지하지 않게 하고, 정확히 15개를 유지하세요.';

    const modelEn = model === 'gemini'
      ? '[GEMINI GRID EXECUTION] Allocate all 15 empty cells first, then fill stickers 1 through 15 in order. Never auto-optimize into a 3×4 or 12-item collage. Exact count and 5×3 structure outrank individual sticker size or decorative polish.'
      : '[GROK GRID EXECUTION] Keep dynamic acting and effects strictly inside the fixed 5×3 cells. Never merge cells or let one large sticker occupy multiple cells. Exact count of 15 is mandatory.';

    const blocks = lang === 'ko'
      ? [layoutKo + textKo, modelKo]
      : [layoutEn + textEn, modelEn];

    return String(prompt || '') + '\\n\\n' + blocks.join('\\n\\n');
  };

${helperMarker}`;

      out = replaceOnce(out, helperMarker, helper, 'helper injection');

      const geminiMarker = `enhanceThemeAwareLettering(enhanceModelSpecificPrompt(generateGeminiPrompt(phraseOverride), 'gemini'), 'gemini')`;
      const geminiReplacement = `enforceFifteenStickerLayout(enhanceThemeAwareLettering(enhanceModelSpecificPrompt(generateGeminiPrompt(phraseOverride), 'gemini'), 'gemini'), 'gemini')`;
      out = replaceCount(out, geminiMarker, geminiReplacement, 3, 'Gemini 15-sheet wrapping');

      const grokMarker = `enhanceThemeAwareLettering(enhanceModelSpecificPrompt(generateGrokPrompt(phraseOverride), 'grok'), 'grok')`;
      const grokReplacement = `enforceFifteenStickerLayout(enhanceThemeAwareLettering(enhanceModelSpecificPrompt(generateGrokPrompt(phraseOverride), 'grok'), 'grok'), 'grok')`;
      out = replaceCount(out, grokMarker, grokReplacement, 3, 'Grok 15-sheet wrapping');

      return { code: out, map: null };
    },
  };
}
