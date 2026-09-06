const TARGET = '/src/App.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[model-prompt-v4] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[model-prompt-v4] ${label} marker is not unique`);
  }
  return source.slice(0, first) + replacement + source.slice(first + marker.length);
};

const replaceCount = (source, marker, replacement, expected, label) => {
  const parts = source.split(marker);
  const count = parts.length - 1;
  if (count !== expected) {
    throw new Error(`[model-prompt-v4] ${label} expected ${expected} occurrence(s), found ${count}`);
  }
  return parts.join(replacement);
};

export function modelPromptPriorityV4Plugin() {
  return {
    name: 'model-prompt-priority-v4',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null;

      let out = code;
      const helperMarker = `  const getPreviewPrompt = () => {`;
      const helper = `  const optimizeModelPromptV4 = (prompt, model) => {
    if (model !== 'gemini' && model !== 'grok') return prompt;

    const isSingle = generationMode === 'individual' || generationMode === 'batch';
    const textEnabled = model === 'gemini' ? geminiTextMode === 'text' : grokTextMode === 'text';
    let base = String(prompt || '');

    if (!isSingle) {
      base = base.replace(/\\n\\[종료 검증\\]\\n[\\s\\S]*?(?=\\n\\n\\[제외 조건\\])/, '');
      base = base.replace(
        /\\[구도 및 배경\\]\\n- 16:9 와이드 가로형 캔버스,[\\s\\S]*?- 배경: ([^\\n]+)/,
        '[시트 구성 및 배경]\\n- 총 15개의 독립 스티커를 가로형 캔버스에 5개씩 3줄로 자연스럽게 배치하세요.\\n- 격자선이나 카드 프레임 없이 하나의 자유로운 스티커 시트처럼 보이게 하고, 스티커마다 크기·포즈·화각을 자연스럽게 달리하세요.\\n- 서로 겹치지 않을 정도의 여백을 두고 상반신·반신·전신 구도를 섞어 시각적 리듬을 만드세요.\\n- 배경: $1'
      );
      base = base.replace(
        /\\[COMPOSITION & BACKGROUND\\]\\n- 16:9 wide landscape canvas,[\\s\\S]*?- Background: ([^\\n]+)/,
        '[SHEET COMPOSITION & BACKGROUND]\\n- Arrange exactly 15 independent stickers on one landscape sheet, five per row across three natural rows.\\n- Make it feel like a free sticker sheet rather than boxed cards: vary scale, pose, crop, and silhouette while keeping comfortable separation.\\n- Mix upper-body, half-body, and full-body acting for visual rhythm.\\n- Background: $1'
      );
      base = base.replace(
        /SHEET COMPOSITION:\\n[\\s\\S]*?(?=\\nTEXT:)/,
        'SHEET COMPOSITION:\\nArrange exactly 15 independent stickers on one landscape sheet, five per row across three natural rows. Keep the overall reading order clear while allowing varied scale, pose, crop, and silhouette. Use comfortable negative space so the result feels like a lively sticker sheet rather than a boxed card grid.\\n'
      );
      base = base
        .replace(/4x4 레이아웃, 16번째 스티커, 4번째 행, 격자선, 셀 경계선, ?/g, '')
        .replace(/4x4 레이아웃, 16번째 스티커, 격자선, ?/g, '')
        .replace(/15번째 스티커에서 종료\\. 4번째 행과 16번째 스티커는 절대 만들지 마세요\\.?/g, '');
    }

    base = base.replace(
      '캐릭터 정체성 → 선택 태그/테마 융합 → 선택 화풍 → 문구 정확도 → 스티커 디자인 완성도 순으로 모두 충족했는지 확인하세요.',
      '문구 정확도 → 캐릭터 정체성·의상 → 15개 수량 → 화풍·행동 → 레터링 완성도 순으로 확인하세요.'
    );

    const koText = textEnabled
      ? '[텍스트 정확성 — 최우선]\\n- 따옴표 안의 지정 한글 문구를 원문 철자와 띄어쓰기 그대로 사용하고, 각 스티커에 해당 문구를 정확히 한 번만 표시하세요.\\n- 자연스러운 1줄을 우선하고 긴 문구만 단어·의미 단위로 2줄까지 구성하세요.\\n- 기존 선택적 Glyph Lock/음절·자모 정보는 오타 방지를 위한 내부 철자 검증용입니다. 실제 이미지에는 따옴표 안의 완성형 한글 문구만 출력하세요.\\n- 문자 정확성과 가독성이 레터링 장식보다 우선합니다.'
      : '[텍스트 미포함] 문구는 표정·행동의 의미 맥락으로만 사용하고 결과 이미지는 문자 없는 스티커 아트로 구성하세요.';

    const enText = textEnabled
      ? '[TEXT ACCURACY — HIGHEST PRIORITY] Render each quoted Korean source phrase exactly once on its assigned sticker, preserving spelling and spacing. Prefer one natural line and use at most two semantic lines for longer phrases. Existing selective Glyph Lock / syllable-jamo data is internal spelling verification only; render only the completed Hangul phrase inside quotation marks. Text accuracy and readability outrank decorative lettering.'
      : '[NO-TEXT MODE] Use the phrases only as acting context and keep the final sticker artwork free of rendered text.';

    const koIdentity = '[정체성·의상] 참고 사진이 있으면 얼굴·헤어·안경 등 식별 특징과 실제 착장을 15개 전체에서 일관되게 유지하세요. 고정 정보에 별도 의상이 지정된 경우 그 의상을 기준으로 합니다. 화풍은 선·채색·질감·표현 방식에 적용하고 캐릭터 정체성과 의상 자체는 유지하세요.';
    const enIdentity = '[IDENTITY & OUTFIT] When a reference photo is present, keep recognizable facial features, hair, glasses and the actual outfit consistent across the set. If fixed character information specifies an outfit, use that outfit. Apply art style to rendering language rather than redesigning identity or clothing.';

    const koSheet = isSingle
      ? '[구도] 문구의 행동이 얼굴뿐 아니라 손·상체·몸짓에서도 읽히도록 상반신 이상의 자연스러운 화각을 우선하세요.'
      : '[15개 시트] 정확히 15개의 독립 스티커를 5개씩 3줄로 자연스럽게 배치하세요. 실제 격자나 카드 프레임처럼 보이지 않게 하고, 각 스티커의 크기·포즈·화각·실루엣은 문구에 맞춰 자유롭게 변화시키세요. 상반신·반신·전신 동작을 섞고 서로 겹치지 않을 정도의 여백을 유지하세요.';
    const enSheet = isSingle
      ? '[FRAMING] Prefer upper-body or wider acting so the phrase is communicated through hands, torso and body language as well as the face.'
      : '[15-STICKER SHEET] Create exactly 15 independent stickers, naturally arranged five per row across three rows. Keep the sheet visually free and lively rather than boxed; vary scale, pose, framing and silhouette to fit each phrase, mixing upper-body, half-body and full-body acting with comfortable separation.';

    const koActing = '[화풍·행동] 선택한 화풍의 핵심 선·채색·질감을 유지하면서 메신저 이모티콘처럼 감정과 행동이 즉시 읽히게 연출하세요. 각 문구는 표정, 시선, 손동작, 몸의 방향과 필요한 소품·효과로 의미를 직접 연기하고, 같은 흉상 포즈의 반복을 피하세요.';
    const enActing = '[STYLE & ACTING] Preserve the essential line, color and texture language of the selected style while keeping messenger-sticker emotion immediately readable. Let each phrase drive expression, gaze, hand gesture, body direction and only the props/effects that help communicate its meaning.';

    const koLettering = textEnabled
      ? '[레터링] 전체 시트는 하나의 레터링 패밀리로 통일하되 문구의 감정과 상황에 따라 색상, 굵기, 기울기, 크기 리듬, 붓터치와 작은 장식 효과를 자연스럽게 변주하세요. 고정 팔레트에 억지로 맞추지 말고 배경에서 즉시 읽히는 대비를 확보하세요.'
      : '';
    const enLettering = textEnabled
      ? '[LETTERING] Keep one coherent lettering family across the sheet, while naturally varying color, weight, tilt, scale rhythm, brush character and small accents according to each phrase. Do not force a rigid theme palette; choose contrast that stays immediately readable against the selected background.'
      : '';

    const koModel = model === 'gemini'
      ? '[Gemini 실행] 한글 정확도와 참고 사진 충실도, 15개 수량을 먼저 안정적으로 확보한 뒤 포즈와 레터링을 정돈하세요. 장식은 문구와 캐릭터를 보조하는 수준으로 사용하세요.'
      : '[Grok 실행] 정확한 문구·정체성·15개 수량을 유지한 상태에서 손·상체·전신의 동세, 실루엣과 그래픽 임팩트를 더 과감하게 사용할 수 있습니다.';
    const enModel = model === 'gemini'
      ? '[GEMINI EXECUTION] Secure Korean text accuracy, reference fidelity and the exact sticker count first, then refine acting and lettering with a clean stable composition.'
      : '[GROK EXECUTION] Keep exact text, identity and sticker count fixed, then push motion, silhouette and graphic impact more boldly through hands, torso and full-body action.';

    const blocks = lang === 'ko'
      ? [koText, koIdentity, koSheet, koActing, koLettering, koModel].filter(Boolean)
      : [enText, enIdentity, enSheet, enActing, enLettering, enModel].filter(Boolean);

    return base + '\\n\\n[모델 최적화 v4]\\n' + blocks.join('\\n\\n');
  };

${helperMarker}`;

      out = replaceOnce(out, helperMarker, helper, 'helper injection');

      const geminiMarker = `generateGeminiPrompt(phraseOverride)`;
      const geminiReplacement = `optimizeModelPromptV4(generateGeminiPrompt(phraseOverride), 'gemini')`;
      out = replaceCount(out, geminiMarker, geminiReplacement, 3, 'Gemini prompt wrapping');

      const grokMarker = `generateGrokPrompt(phraseOverride)`;
      const grokReplacement = `optimizeModelPromptV4(generateGrokPrompt(phraseOverride), 'grok')`;
      out = replaceCount(out, grokMarker, grokReplacement, 3, 'Grok prompt wrapping');

      return { code: out, map: null };
    },
  };
}
