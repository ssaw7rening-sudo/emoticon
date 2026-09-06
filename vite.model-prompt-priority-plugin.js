const TARGET = '/src/App.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[model-prompt-priority] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[model-prompt-priority] ${label} marker is not unique`);
  }
  return source.slice(0, first) + replacement + source.slice(first + marker.length);
};

const replaceCount = (source, marker, replacement, expected, label) => {
  const parts = source.split(marker);
  const count = parts.length - 1;
  if (count !== expected) throw new Error(`[model-prompt-priority] ${label} expected ${expected}, found ${count}`);
  return parts.join(replacement);
};

export function modelPromptPriorityPlugin() {
  return {
    name: 'model-prompt-priority',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null;

      let out = code;
      const helperMarker = `  const getPreviewPrompt = () => {`;
      const helper = [
        `  const enhanceModelPromptPriority = (prompt, model) => {`,
        `    if (model !== 'gemini' && model !== 'grok') return prompt;`,
        `    const textEnabled = model === 'gemini' ? geminiTextMode === 'text' : grokTextMode === 'text';`,
        `    const isSingle = generationMode === 'individual' || generationMode === 'batch';`,
        `    const sourcePrompt = String(prompt || '');`,
        ``,
        `    const themeGuideKo = (() => {`,
        `      const guides = [`,
        `        [/(?:의성어|효과음|쿵|쾅|팡|펑|탁|톡)/, '소리의 세기와 성격이 몸동작, 충격감, 속도선, 효과선에서 바로 느껴지게 연기하세요.'],`,
        `        [/(?:의태어|움직임|살금|두근|벌벌|뒹굴|힐끔)/, '몸 전체의 움직임, 시선, 리듬, 무게중심을 분명하게 표현하세요.'],`,
        `        [/(?:사과|미안|죄송|용서)/, '고개 숙임, 두 손 모음, 조심스러운 손짓, 쭈굴한 자세 등 미안함의 강도를 문구마다 다르게 연기하세요.'],`,
        `        [/(?:거절|사양|패스|어려워|곤란|안 할래|못 가)/, '손사래, 고개 젓기, 거리 두기, 난처함 또는 단호함으로 거절 의사가 한눈에 보이게 표현하세요.'],`,
        `        [/(?:애교|뿌잉|안아쥬|놀아쥬|보고시퍼|조아용)/, '하트, 볼에 손 대기, 몸 기울이기, 반짝이는 눈, 귀여운 손동작 등 사랑스러운 연기를 사용하세요.'],`,
        `        [/(?:악당|계획대로|덤벼|각오|지배|절망|어둠)/, '음흉한 미소, 자신만만한 자세, 위협적인 손짓, 오라와 그림자 등 과장된 악당 연기를 사용하되 의상은 바꾸지 마세요.'],`,
        `        [/(?:속마음|혼잣말|부럽|신경 쓰여|서운|긴장|질투|참는 중)/, '멍함, 한숨, 망설임, 민망함, 귀찮음, 은근한 기쁨처럼 내면 감정을 미세한 표정과 자세로 드러내세요.'],`,
        `        [/(?:사투리|맞제|고맙데이|오메|아이가|당께)/, '친근함, 능청스러움, 구수함, 활달함이 표정과 제스처에서 느껴지도록 연기하세요.'],`,
        `        [/(?:명대사|결의|운명|기억해|새겨 둬)/, '결의, 자신감, 비장함, 강조된 시선과 손짓으로 한 장면의 클라이맥스처럼 연출하세요.'],`,
        `        [/(?:중2병|세계관|각성|봉인|오라)/, '각성, 허세, 오라, 손 뻗기, 극적인 시선과 앵글 등 과장된 세계관 연기를 사용하되 의상은 바꾸지 마세요.'],`,
        `        [/(?:로봇|AI 말투|분석|스캔|시스템|데이터)/i, '분석적인 자세, 스캔 제스처, 규칙적인 움직임, 데이터 패널 같은 기계적 연기를 사용하세요.'],`,
        `        [/(?:여행|비행기|호텔|체크인|티켓|배낭|면세점|수영장)/, '장소성, 이동감, 여행 소품과 실제 행동 맥락이 문구 의미와 정확히 연결되도록 표현하세요.'],`,
        `        [/(?:직장|회사|출근|퇴근|회의|야근|칼퇴)/, '업무 상황, 피로, 집중, 퇴근의 해방감 등을 최소한의 업무 소품과 행동으로 표현하세요.'],`,
        `        [/(?:게임|E스포츠|게이머|승리|패배|랭크|캐리)/i, '집중, 환호, 좌절, 승리 포즈, 컨트롤 동작 등 게임 상황의 감정을 명확히 연기하세요.'],`,
        `        [/(?:연애|커플|사랑|보고 싶|심쿵|데이트)/, '설렘, 애정, 서운함, 기다림 등 관계 감정이 시선, 거리감, 손동작에서 자연스럽게 드러나게 하세요.'],`,
        `        [/(?:헬스|다이어트|운동|근육|단백질|러닝)/, '힘쓰기, 지침, 성취감, 운동 루틴을 몸의 긴장과 필요한 운동 소품으로 직접 보여주세요.'],`,
        `      ];`,
        `      const hit = guides.find(([pattern]) => pattern.test(sourcePrompt));`,
        `      return hit ? hit[1] : '현재 선택된 문구 테마와 각 문구의 의미를 해석해 그 테마의 감정·관계·상황·목적이 캐릭터 행동에서 즉시 읽히도록 연기하세요.';`,
        `    })();`,
        ``,
        `    const priorityKo = \`[Gemini/Grok 생성 우선순위 — 최우선]`,
        `아래 우선순위를 반드시 지키세요: 참고 사진의 정체성 및 캐릭터 고정 정보 > 고정 의상 > 선택 화풍 > 문구 의미와 테마에 맞는 행동·표정 > 문자 정확도·배치 > 장식·효과.`,
        `뒤의 지시는 앞의 지시를 변경할 수 없습니다. 문구 테마나 화풍 때문에 얼굴, 헤어, 체형, 의상을 임의로 바꾸지 마세요.\`;`,
        ``,
        `    const identityKo = \`[정체성·의상 고정 — 변경 금지]`,
        `- 참고 사진이 있으면 얼굴형, 눈매, 코, 입, 턱선, 헤어스타일, 피부톤과 핵심 체형 특징을 유지하세요.`,
        `- 캐릭터 고정 정보에 의상이 명시되어 있으면 그 의상이 최우선 고정 의상입니다. 별도 의상 지정이 없다면 참고 사진 속 의상의 종류, 색상, 패턴, 실루엣, 소매, 목선과 대표 디테일을 유지하세요.`,
        `- 사극·고전·무협·악당·영웅·판타지·여행·직장·게임 등 어떤 문구 테마도 의상을 한복, 도복, 갑옷, 제복 등 다른 콘셉트 의상으로 바꾸는 근거가 될 수 없습니다.`,
        `- 화풍은 선, 채색, 질감, 단순화, 분위기에만 적용하고 정체성과 고정 의상의 형태·색·대표 특징을 보존하세요.`,
        `- 문구 포함 여부 때문에 캐릭터를 재의상화하거나 얼굴·체형·정체성을 재설계하지 마세요.\`;`,
        ``,
        `    const actingKo = isSingle`,
        `      ? \`[문구 의미 → 캐릭터 연기]`,
        `- 현재 문구의 의미를 표정, 시선, 포즈, 손동작, 몸짓, 필요한 소품, 효과선으로 직접 시각화하세요.`,
        `- 문구를 읽지 않아도 감정과 상황이 느껴질 정도로 명확하게 연기하되 정체성과 의상은 변경하지 마세요.`,
        `- 선택 테마 보강: ${'${themeGuideKo}'}\``,
        `      : \`[15개 문구 의미 → 캐릭터 연기]`,
        `- 15개 스티커 각각이 자신의 문구 의미를 표정, 시선, 포즈, 손동작, 몸짓, 필요한 소품, 효과선으로 직접 시각화해야 합니다.`,
        `- 같은 포즈, 같은 표정, 같은 손동작, 같은 구도를 반복하지 말고 15개가 서로 다른 감정·상황·행동으로 구분되게 하세요.`,
        `- 단순히 글자만 바꾸고 비슷한 캐릭터 연기를 반복하지 마세요.`,
        `- 선택 테마 보강: ${'${themeGuideKo}'}\`;`,
        ``,
        `    const exactKo = isSingle`,
        `      ? \`[문자 정확도·배치 — 문구 포함 시 최우선]`,
        `- 지정된 원문 문구를 한 글자도 바꾸지 말고 정확히 그대로 사용하세요. 번역, 요약, 맞춤법 교정, 띄어쓰기 변경, 글자 추가·삭제를 금지합니다.`,
        `- 이 스티커에는 텍스트 블록을 정확히 1개만 만들고 지정 문구를 정확히 1회만 렌더링하세요.`,
        `- 제목+하단 캡션, 위+아래 반복, 말풍선+본문, 라벨, 자막, 에코 텍스트 등 두 번째 텍스트 블록은 절대 만들지 마세요. 문구 일부의 반복도 금지합니다.`,
        `- 문구는 1줄을 우선하고 길 때만 의미 단위로 자연스럽게 2줄까지 허용합니다. 한글 음절을 세로로 한 글자씩 쪼개거나 어절을 부자연스럽게 분해하지 마세요.`,
        `- 작업 지시용 번호, Sticker 번호, 따옴표, 라벨은 이미지 안에 출력하지 마세요.\``,
        `      : \`[15개 문자 정확도·배치 — 문구 포함 시 최우선]`,
        `- 나열된 15개 원문 문구를 순서대로 1:1 대응해 각각 정확히 한 번씩 사용하세요. 한 글자도 바꾸지 말고 번역, 요약, 맞춤법 교정, 띄어쓰기 변경, 글자 추가·삭제를 금지합니다.`,
        `- 각 스티커에는 텍스트 블록을 정확히 1개만 만들고 배정된 문구를 정확히 1회만 렌더링하세요. 전체 시트에는 총 15개의 텍스트 블록만 존재해야 합니다.`,
        `- 같은 문구를 제목+하단 캡션, 위+아래 반복, 말풍선+본문, 라벨, 자막, 에코 텍스트로 다시 표시하지 마세요. 문구 일부의 반복도 금지합니다.`,
        `- 각 문구는 1줄을 우선하고 길 때만 의미 단위로 자연스럽게 2줄까지 허용합니다. 한글 음절을 세로로 한 글자씩 쪼개거나 '알겠 / 사옵 / 니다'처럼 부자연스럽게 분해하지 마세요.`,
        `- 목록 번호 1~15와 Sticker 번호는 작업 지시용이며 이미지 안에 출력하지 마세요.\`;`,
        ``,
        `    const letteringKo = model === 'gemini'`,
        `      ? \`[Gemini 레터링] 문구는 일반 UI·자막·인쇄체가 아니라 굵고 친근한 한국 만화식 손글씨·붓펜·마커 레터링으로 표현하세요. 기본은 진한 검정/먹색 획과 두껍고 깨끗한 순백색 다이컷 외곽선입니다. 같은 레터링 계열을 유지하고 장식보다 정확한 원문과 가독성을 우선하세요.\``,
        `      : \`[Grok 레터링] 문구는 굵은 검정/먹색 브러시·마커 계열의 손그림 만화 레터링과 두껍고 선명한 순백색 다이컷 외곽선을 사용하세요. 효과선은 글자를 변형·가림·복제하지 않는 범위에서만 사용하고 장식보다 정확한 원문과 가독성을 우선하세요.\`;`,
        ``,
        `    const priorityEn = \`[GENERATION PRIORITY — HIGHEST PRIORITY] Follow this hierarchy strictly: reference identity and fixed character information > locked outfit > selected art style > phrase/theme acting > text accuracy/layout > decoration. Later instructions must never override earlier levels. A phrase theme or art style must not arbitrarily change the face, hair, body proportions, identity, or outfit.\`;`,
        `    const identityEn = \`[IDENTITY AND OUTFIT LOCK] If a reference photo is present, preserve its key facial identity, hairstyle, skin tone, and body cues. If fixed character information explicitly specifies an outfit, that outfit is locked; otherwise preserve the reference photo outfit's type, colors, pattern, silhouette, sleeves, neckline, and identifying details. Historical, fantasy, villain, heroic, travel, office, gaming, or other phrase themes must never replace the locked outfit with a costume. Apply art style to line, color, texture, simplification, and mood without changing identity or the locked outfit.\`;`,
        `    const actingEn = isSingle`,
        `      ? \`[PHRASE MEANING TO CHARACTER ACTING] Act out the assigned phrase directly through facial expression, gaze, pose, hand gesture, body language, only necessary props, and motion/effect lines. The emotion and situation should be readable before the text is read. Preserve identity and outfit. Infer the selected theme from the prompt and use theme-appropriate acting without redesigning the character.\``,
        `      : \`[PHRASE MEANING TO CHARACTER ACTING FOR ALL 15 STICKERS] Each of the 15 stickers must distinctly act out its own phrase through facial expression, gaze, pose, hand gesture, body language, only necessary props, and motion/effect lines. Do not merely swap text while repeating similar acting. Avoid repeating the same pose, expression, gesture, or composition. Preserve identity and outfit and infer the selected theme without redesigning the character.\`;`,
        `    const exactEn = isSingle`,
        `      ? \`[TEXT ACCURACY AND LAYOUT — CRITICAL] Use the supplied source phrase exactly as written. Create exactly ONE text block and render the assigned phrase exactly once. Never create a second title, subtitle, caption, speech bubble, label, echo text, or duplicate of any part of the phrase. Prefer one line; use at most two natural semantic lines when necessary. Never split Korean syllables vertically or into unnatural fragments. Do not render instruction labels or sticker numbers.\``,
        `      : \`[TEXT ACCURACY AND LAYOUT FOR ALL 15 STICKERS — CRITICAL] Use all 15 supplied source phrases in order, one exact phrase per sticker, exactly once each. Create exactly ONE text block per sticker and exactly 15 text blocks total. Never duplicate a phrase or any part of it as a title, subtitle, caption, speech bubble, label, or echo text. Prefer one line and allow at most two natural semantic lines. Never split Korean syllables vertically or into unnatural fragments. Never render list or sticker numbers.\`;`,
        `    const letteringEn = model === 'gemini'`,
        `      ? \`[GEMINI COMIC LETTERING] Use bold hand-drawn comic/brush-marker lettering rather than generic UI or subtitle typography, with deep black/ink strokes and a thick crisp pure-white die-cut outline. Exact source text and readability outrank decoration.\``,
        `      : \`[GROK COMIC LETTERING] Use bold black/ink brush-marker comic lettering with a thick crisp pure-white die-cut outline. Effects must never alter, obscure, or duplicate glyphs. Exact source text and readability outrank decoration.\`;`,
        ``,
        `    const blocks = lang === 'ko' ? [priorityKo, identityKo, actingKo] : [priorityEn, identityEn, actingEn];`,
        `    if (textEnabled) {`,
        `      blocks.push(lang === 'ko' ? exactKo : exactEn);`,
        `      blocks.push(lang === 'ko' ? letteringKo : letteringEn);`,
        `    }`,
        `    return \`${'${prompt}'}\\n\\n${'${blocks.join("\\n\\n")}'}\`;`,
        `  };`,
        ``,
        helperMarker,
      ].join('\n');
      out = replaceOnce(out, helperMarker, helper, 'helper injection');

      const previewMarker = `    if (previewMode === 'gemini') return generateGeminiPrompt(phraseOverride);\n    return generateGrokPrompt(phraseOverride);`;
      const previewReplacement = `    if (previewMode === 'gemini') return enhanceModelPromptPriority(generateGeminiPrompt(phraseOverride), 'gemini');\n    return enhanceModelPromptPriority(generateGrokPrompt(phraseOverride), 'grok');`;
      out = replaceOnce(out, previewMarker, previewReplacement, 'preview enhancer');

      const copyMarker = `      : type === 'gemini'\n        ? generateGeminiPrompt(phraseOverride)\n        : generateGrokPrompt(phraseOverride);`;
      const copyReplacement = `      : type === 'gemini'\n        ? enhanceModelPromptPriority(generateGeminiPrompt(phraseOverride), 'gemini')\n        : enhanceModelPromptPriority(generateGrokPrompt(phraseOverride), 'grok');`;
      out = replaceCount(out, copyMarker, copyReplacement, 2, 'copy enhancer');

      if (!out.includes('[Gemini/Grok 생성 우선순위 — 최우선]')) throw new Error('[model-prompt-priority] priority block missing');
      if (!out.includes('[정체성·의상 고정 — 변경 금지]')) throw new Error('[model-prompt-priority] outfit lock missing');
      if (!out.includes('텍스트 블록을 정확히 1개만')) throw new Error('[model-prompt-priority] single text block rule missing');
      if (!out.includes('자연스럽게 2줄까지')) throw new Error('[model-prompt-priority] line-break rule missing');
      if (!out.includes("enhanceModelPromptPriority(generateGeminiPrompt(phraseOverride), 'gemini')")) throw new Error('[model-prompt-priority] Gemini not connected');
      if (!out.includes("enhanceModelPromptPriority(generateGrokPrompt(phraseOverride), 'grok')")) throw new Error('[model-prompt-priority] Grok not connected');

      return { code: out, map: null };
    },
  };
}
