const TARGET = '/src/App.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[model-lettering] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[model-lettering] ${label} marker is not unique`);
  }
  return source.slice(0, first) + replacement + source.slice(first + marker.length);
};

const replaceCount = (source, marker, replacement, expected, label) => {
  const parts = source.split(marker);
  const count = parts.length - 1;
  if (count !== expected) {
    throw new Error(`[model-lettering] ${label} expected ${expected} occurrence(s), found ${count}`);
  }
  return parts.join(replacement);
};

export function modelLetteringPromptPlugin() {
  return {
    name: 'model-lettering-prompt',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/');
      if (!normalizedId.endsWith(TARGET)) return null;

      let out = code;

      const helperMarker = `  const getPreviewPrompt = () => {`;
      const helper = [
        `  const enhanceModelLetteringPrompt = (prompt, model) => {`,
        `    const textEnabled = model === 'gemini'`,
        `      ? geminiTextMode === 'text'`,
        `      : model === 'grok'`,
        `        ? grokTextMode === 'text'`,
        `        : false;`,
        `    if (!textEnabled) return prompt;`,
        ``,
        `    const isSingle = generationMode === 'individual' || generationMode === 'batch';`,
        `    const exactKo = isSingle`,
        `      ? \`[한글 문구 정확도 — 최우선]`,
        `- 지정된 원문 문구 1개를 한 글자도 바꾸지 말고 정확히 그대로 사용하세요.`,
        `- 번역, 요약, 맞춤법 교정, 유사 표현 치환, 조사 변경, 띄어쓰기 변경, 글자 추가·삭제를 모두 금지합니다.`,
        `- 작업 지시용 번호, Sticker 번호, 따옴표, 라벨은 이미지 안에 절대 출력하지 마세요.`,
        `- 한글 음절을 쪼개거나 글자를 장식 아이콘으로 대체하지 마세요.`,
        `- 장식성과 철자 정확도가 충돌하면 반드시 원문 철자 정확도를 우선하세요.\``,
        `      : \`[15개 한글 문구 정확도 — 최우선]`,
        `- 프롬프트에 나열된 15개 원문 문구를 순서대로 1:1 대응해 각각 정확히 한 번씩 사용하세요.`,
        `- 각 스티커에는 지정된 문구 하나만 넣고, 다른 스티커의 문구를 합치거나 반복하지 마세요.`,
        `- 한 글자도 바꾸거나 줄이거나 추가하지 말고, 번역·요약·맞춤법 교정·유사 표현 치환·띄어쓰기 변경을 금지합니다.`,
        `- 목록의 1~15, Sticker 1~15 같은 번호는 작업 지시용일 뿐이며 이미지 안에는 절대 출력하지 마세요.`,
        `- 한글 음절을 분해하거나 글자 일부를 하트·별·아이콘으로 대체하지 마세요.`,
        `- 장식성과 철자 정확도가 충돌하면 반드시 원문 철자 정확도를 우선하세요.\`;`,
        ``,
        `    const exactEn = isSingle`,
        `      ? \`[EXACT SOURCE TEXT — HIGHEST PRIORITY]`,
        `Use the one supplied source phrase exactly as written. Do not translate, paraphrase, shorten, correct, respell, merge, add, or remove characters or spaces. Never render instruction labels, sticker numbers, quotation marks, or list numbers. If decoration conflicts with text accuracy, preserve the exact source text first.\``,
        `      : \`[EXACT SOURCE TEXT FOR ALL 15 STICKERS — HIGHEST PRIORITY]`,
        `Use all 15 supplied source phrases in order, one exact phrase per sticker, exactly once each. Do not translate, paraphrase, shorten, correct, respell, merge, add, or remove characters or spaces. The list numbers and Sticker 1–15 labels are instructions only and must never appear in the image. If decoration conflicts with text accuracy, preserve the exact source text first.\`;`,
        ``,
        `    const duplicateKo = isSingle`,
        `      ? \`[문구 중복 출력 금지 — 매우 중요]`,
        `- 이 스티커에는 지정된 문구의 시각적 인스턴스를 정확히 1회만 렌더링하세요.`,
        `- 같은 문구를 제목+하단 캡션, 위+아래 반복, 말풍선+본문, 라벨, 자막, 장식용 에코 텍스트 등 어떤 형태로도 두 번 표시하지 마세요.`,
        `- 문구 전체뿐 아니라 문구 일부를 다른 위치에 복제하거나 다시 쓰는 것도 금지합니다.`,
        `- 문구가 한 번 배치되면 스티커 안의 다른 모든 텍스트 영역은 비워 두세요.\``,
        `      : \`[15개 시트 문구 중복 출력 금지 — 매우 중요]`,
        `- 각 스티커에는 배정된 문구의 시각적 인스턴스를 정확히 1회만 렌더링하세요.`,
        `- 같은 문구를 제목+하단 캡션, 위+아래 반복, 말풍선+본문, 라벨, 자막, 장식용 에코 텍스트 등 어떤 형태로도 두 번 표시하지 마세요.`,
        `- 문구 전체뿐 아니라 문구 일부를 같은 스티커 안의 다른 위치에 복제하거나 다시 쓰는 것도 금지합니다.`,
        `- 문구가 한 번 배치되면 해당 스티커 안의 다른 모든 텍스트 영역은 비워 두세요.`,
        `- 전체 15개 스티커 = 15개 원문 문구 = 총 15개의 텍스트 인스턴스만 존재해야 합니다. 각 스티커당 정확히 1개입니다.\`;`,
        ``,
        `    const duplicateEn = isSingle`,
        `      ? \`[SINGLE TEXT INSTANCE — CRITICAL]`,
        `Render exactly ONE visual instance of the assigned phrase in this sticker. Never repeat it as a title, subtitle, top caption, bottom caption, speech bubble, label, echo text, or decorative duplicate. Do not repeat any part of the phrase elsewhere. Once the phrase is rendered, leave every other text area empty.\``,
        `      : \`[SINGLE TEXT INSTANCE FOR ALL 15 STICKERS — CRITICAL]`,
        `Render exactly ONE visual instance of the assigned phrase per sticker. Never repeat the same phrase as a title, subtitle, top caption, bottom caption, speech bubble, label, echo text, or decorative duplicate. Do not repeat any part of a phrase elsewhere in the same sticker. Once the assigned phrase is rendered, leave all other text areas empty. Across the complete sheet there must be exactly 15 text instances total: 15 stickers = 15 source phrases = one phrase once per sticker.\`;`,
        ``,
        `    const geminiKo = \`[Gemini 전용 한글 만화 레터링 — 이전 타이포그래피 지시보다 우선]`,
        `- 문구를 일반 고딕체, 인쇄체, UI 폰트, 자막형 텍스트처럼 만들지 마세요.`,
        `- 한국 만화 이모티콘에 직접 그린 듯한 굵고 친근한 손글씨·붓펜·마커 레터링으로 그리세요.`,
        `- 기본 글자색은 진한 검정 또는 먹색을 중심으로 하고, 글자 전체에 두껍고 깨끗한 순백색 다이컷 외곽선을 두르세요.`,
        `- 선택 화풍의 질감은 유지하되 글자 획은 선명하고 단순하게, 작은 모바일 화면에서도 즉시 읽히게 하세요.`,
        `- 같은 레터링 계열을 15개 전체에 유지하면서 감정에 따라 크기, 기울기, 자간, 최대 2줄 줄바꿈만 자연스럽게 변화시키세요.`,
        `- 문구는 머리 위나 얼굴·어깨 옆의 여백에 배치하고 얼굴, 손, 핵심 소품을 가리지 마세요.`,
        `- 문구와 캐릭터가 따로 떠 있는 자막처럼 보이지 않도록 하나의 완성된 스티커 실루엣으로 결합하세요.`,
        `- 글자 주변의 하트·별·번개 등은 최대 1~2개만 사용하고 어떤 장식도 글자 획을 침범하지 마세요.`,
        `- 정확한 한글 원문 재현이 최우선입니다. 글자 장식 때문에 철자가 흔들리면 장식을 줄이세요.\`;`,
        ``,
        `    const grokKo = \`[Grok 전용 한글 그래픽 레터링 — 이전 타이포그래피 지시보다 우선]`,
        `- 문구를 일반 폰트나 자막처럼 배치하지 말고 캐릭터와 함께 직접 그린 강한 만화형 손글씨로 표현하세요.`,
        `- 굵은 검정·먹색 브러시/마커 획 + 두껍고 선명한 순백색 다이컷 외곽선을 기본 레터링 문법으로 사용하세요.`,
        `- 감정과 동작에 맞춰 글자의 크기, 기울기, 자간을 역동적으로 조절하되 전체 15개는 같은 글자체 가족으로 보여야 합니다.`,
        `- 머리 위 또는 상단 여백에 우선 배치하고 얼굴을 가리지 마세요.`,
        `- 필요하면 속도선, 먹선, 오라, 충격선과 시각적으로 연결하되 효과가 한글 획 안으로 들어오거나 글자를 변형해서는 안 됩니다.`,
        `- 일반 고딕체, 얇은 산세리프, 인쇄체, UI 텍스트, 자막 스타일은 금지합니다.`,
        `- 그래픽 효과보다 가독성과 정확한 원문 철자가 우선입니다. 한글이 깨질 위험이 있으면 효과를 단순화하세요.\`;`,
        ``,
        `    const geminiEn = \`[GEMINI HAND-DRAWN COMIC LETTERING — OVERRIDES EARLIER TYPOGRAPHY SUGGESTIONS]`,
        `Render the supplied phrase text as bold, hand-drawn comic sticker lettering rather than a generic digital font. Prefer deep black/ink-like marker strokes with a thick crisp pure-white die-cut outline. Keep one consistent lettering family while allowing modest changes in scale, tilt, spacing, and up to two compact lines. Place text in clean negative space above or beside the character without covering the face, hands, or key props. Never use thin sans-serif, UI, subtitle, or plain printed typography. Exact source text is more important than decoration.\`;`,
        ``,
        `    const grokEn = \`[GROK GRAPHIC COMIC LETTERING — OVERRIDES EARLIER TYPOGRAPHY SUGGESTIONS]`,
        `Integrate the supplied phrase text into the sticker as bold hand-drawn comic lettering, using deep black/ink-like brush or marker strokes with a thick crisp pure-white die-cut outline. Keep one lettering family across the set, with dynamic but controlled scale, tilt, and spacing. Effects may visually support the lettering but must never alter, obscure, or replace glyphs. Avoid generic printed fonts, thin sans-serif, UI text, and subtitle styling. Exact source text and readability always outrank graphic decoration.\`;`,
        ``,
        `    const exactBlock = lang === 'ko' ? exactKo : exactEn;`,
        `    const duplicateBlock = lang === 'ko' ? duplicateKo : duplicateEn;`,
        `    const modelBlock = lang === 'ko'`,
        `      ? (model === 'gemini' ? geminiKo : grokKo)`,
        `      : (model === 'gemini' ? geminiEn : grokEn);`,
        ``,
        `    return \`${'${prompt}'}\\n\\n${'${exactBlock}'}\\n\\n${'${duplicateBlock}'}\\n\\n${'${modelBlock}'}\`;`,
        `  };`,
        ``,
        helperMarker,
      ].join('\n');
      out = replaceOnce(out, helperMarker, helper, 'helper injection');

      const previewMarker = `    if (previewMode === 'gemini') return generateGeminiPrompt(phraseOverride);\n    return generateGrokPrompt(phraseOverride);`;
      const previewReplacement = `    if (previewMode === 'gemini') return enhanceModelLetteringPrompt(generateGeminiPrompt(phraseOverride), 'gemini');\n    return enhanceModelLetteringPrompt(generateGrokPrompt(phraseOverride), 'grok');`;
      out = replaceOnce(out, previewMarker, previewReplacement, 'preview enhancer');

      const copyMarker = `      : type === 'gemini'\n        ? generateGeminiPrompt(phraseOverride)\n        : generateGrokPrompt(phraseOverride);`;
      const copyReplacement = `      : type === 'gemini'\n        ? enhanceModelLetteringPrompt(generateGeminiPrompt(phraseOverride), 'gemini')\n        : enhanceModelLetteringPrompt(generateGrokPrompt(phraseOverride), 'grok');`;
      out = replaceCount(out, copyMarker, copyReplacement, 2, 'copy enhancer');

      if (!out.includes('[Gemini 전용 한글 만화 레터링')) {
        throw new Error('[model-lettering] Gemini Korean lettering block missing');
      }
      if (!out.includes('[Grok 전용 한글 그래픽 레터링')) {
        throw new Error('[model-lettering] Grok Korean lettering block missing');
      }
      if (!out.includes('[15개 시트 문구 중복 출력 금지')) {
        throw new Error('[model-lettering] duplicate text prevention block missing');
      }
      if (!out.includes('exactly 15 text instances total')) {
        throw new Error('[model-lettering] English duplicate text prevention block missing');
      }
      if (!out.includes("enhanceModelLetteringPrompt(generateGeminiPrompt(phraseOverride), 'gemini')")) {
        throw new Error('[model-lettering] Gemini prompt enhancer not connected');
      }
      if (!out.includes("enhanceModelLetteringPrompt(generateGrokPrompt(phraseOverride), 'grok')")) {
        throw new Error('[model-lettering] Grok prompt enhancer not connected');
      }

      return { code: out, map: null };
    },
  };
}
