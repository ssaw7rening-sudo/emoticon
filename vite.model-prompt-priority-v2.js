const TARGET = '/src/App.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[model-prompt-v2] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[model-prompt-v2] ${label} marker is not unique`);
  }
  return source.slice(0, first) + replacement + source.slice(first + marker.length);
};

const replaceCount = (source, marker, replacement, expected, label) => {
  const parts = source.split(marker);
  const count = parts.length - 1;
  if (count !== expected) {
    throw new Error(`[model-prompt-v2] ${label} expected ${expected} occurrence(s), found ${count}`);
  }
  return parts.join(replacement);
};

const COMMON_PRIORITY_KO = `[공통 생성 우선순위 — 절대 규칙]
반드시 다음 순서를 지키세요: 1) 참고 사진의 정체성·캐릭터 고정 정보, 2) 고정 의상, 3) 선택 화풍, 4) 문구 의미와 테마에 맞는 행동·표정, 5) 문자 정확도·배치, 6) 장식·효과.
뒤 단계는 앞 단계를 절대 변경할 수 없습니다. 문구 테마나 화풍은 얼굴, 헤어스타일, 체형, 성별, 정체성, 고정 의상을 바꾸는 근거가 될 수 없습니다.`;

const COMMON_IDENTITY_KO = `[정체성·의상 고정 — 변경 금지]
- 참고 사진이 있으면 얼굴형, 눈매, 코, 입, 턱선, 헤어스타일, 피부톤, 핵심 체형 특징을 일관되게 유지하세요.
- 캐릭터 고정 정보에 의상이 명시되어 있으면 그 의상이 최우선입니다. 별도 지정이 없다면 참고 사진 속 의상의 종류, 색상, 패턴, 실루엣, 소매, 목선, 대표 디테일을 유지하세요.
- 사극·고전·무협·악당·영웅·판타지·여행·직장·게임 등 어떤 테마도 의상을 한복, 도복, 갑옷, 제복 등 다른 콘셉트 복장으로 바꾸지 마세요.
- 선택 화풍은 선, 채색, 질감, 단순화, 분위기에 적용하되 정체성과 의상의 핵심 형태·색·특징은 보존하세요.
- 문구 포함 여부 때문에 캐릭터를 재의상화하거나 얼굴·체형·정체성을 재설계하지 마세요.`;

const COMMON_PRIORITY_EN = `[COMMON GENERATION PRIORITY — ABSOLUTE]
Follow this order strictly: 1) reference identity and fixed character information, 2) locked outfit, 3) selected art style, 4) phrase/theme acting, 5) text accuracy and layout, 6) decoration and effects.
A later level must never override an earlier level. Phrase themes and art styles must never redesign the face, hair, body proportions, gender, identity, or locked outfit.`;

const COMMON_IDENTITY_EN = `[IDENTITY AND OUTFIT LOCK]
- If a reference photo is present, preserve its key face shape, eyes, nose, mouth, jawline, hairstyle, skin tone, and body cues consistently.
- If fixed character information explicitly specifies an outfit, that outfit is locked. Otherwise preserve the reference outfit's type, colors, pattern, silhouette, sleeves, neckline, and identifying details.
- Historical, fantasy, villain, heroic, travel, office, gaming, or other themes must never replace the locked outfit with a costume.
- Apply the selected art style to line, color, texture, simplification, and mood while preserving identity and the defining outfit features.
- Text on/off must not cause redesign of the character or outfit.`;

const GEMINI_EXECUTION_KO = `[Gemini 전용 실행 방식 — 정확성·안정성·사진 충실도 우선]
1. 먼저 참고 사진/고정 정보에서 얼굴 정체성과 의상을 확정하고, 15개 모든 칸에서 동일한 캐릭터로 유지하세요.
2. 그 다음 각 문구의 감정과 상황을 표정·시선·포즈·손동작으로만 변화시키세요. 테마를 의상이나 외형으로 재해석하지 마세요.
3. 15개 시트에서는 각 칸을 독립된 스티커처럼 명확히 구분하고, 캐릭터 크기와 얼굴 인식성을 안정적으로 유지하세요.
4. 소품과 효과는 문구 이해에 꼭 필요한 것만 최소한으로 사용하세요. 과도한 장식, 배경 소품, 복장 변형보다 원본 충실도를 우선하세요.
5. 극적인 카메라 앵글이나 과한 신체 왜곡 때문에 얼굴·의상 특징이 손실되지 않도록 하세요.
6. 생성 전 각 칸을 '정체성/의상 확인 → 문구 의미에 맞는 행동 선택 → 텍스트는 마지막에 1회 배치' 순서로 처리하세요.`;

const GEMINI_EXECUTION_EN = `[GEMINI EXECUTION MODE — ACCURACY, STABILITY, REFERENCE FIDELITY]
1. Lock the reference identity and outfit first and keep the same recognizable character in every sticker.
2. Then vary only expression, gaze, pose, hand gesture, and body language to act out each phrase. Never reinterpret the theme as a new costume or character design.
3. In a 15-sticker sheet, keep each cell clearly separated with stable character scale and highly recognizable facial identity.
4. Use only props and effects that are necessary to explain the phrase. Prefer reference fidelity over decorative complexity.
5. Avoid extreme camera angles or body distortion when they weaken facial likeness or outfit fidelity.
6. Process each sticker in this order: verify identity/outfit, choose phrase-specific acting, then add the single text block last.`;

const GROK_EXECUTION_KO = `[Grok 전용 실행 방식 — 동세·그래픽 임팩트·표현력 우선]
1. 참고 사진/고정 정보의 얼굴 정체성과 의상은 절대 고정한 상태에서만 동세와 연출을 확장하세요.
2. 문구마다 표정, 손동작, 몸의 방향, 무게중심, 실루엣을 과감하게 달리해 15개가 즉시 구분되게 하세요.
3. 속도선, 충격선, 오라, 하트, 땀, 반짝임 등 그래픽 효과를 적극적으로 사용할 수 있지만 얼굴·의상·문자를 가리거나 바꾸면 안 됩니다.
4. 앵글, 포즈 크기, 기울기에는 변화를 줄 수 있지만 동일 인물의 얼굴과 고정 의상이 항상 즉시 알아보여야 합니다.
5. 소품은 행동을 강화하는 범위에서만 사용하고, 테마를 이유로 새로운 복장·갑옷·도복·제복을 추가하지 마세요.
6. 강한 만화적 임팩트를 허용하되 '캐릭터 정체성/의상 고정 → 문구 행동 → 그래픽 효과 → 텍스트 1회' 순서는 바꾸지 마세요.`;

const GROK_EXECUTION_EN = `[GROK EXECUTION MODE — MOTION, GRAPHIC IMPACT, EXPRESSIVE ACTING]
1. Expand motion and staging only after the reference identity and locked outfit are fixed.
2. Make the 15 stickers immediately distinct through varied expressions, hand gestures, body direction, weight shift, and silhouette.
3. Speed lines, impact lines, aura, hearts, sweat, sparkles, and other graphic effects may be energetic, but must never cover or redesign the face, outfit, or text.
4. Camera angle, pose scale, and tilt may vary, but the same person and locked outfit must remain instantly recognizable.
5. Use props only to strengthen the action; never add a new costume, armor, robe, uniform, or historical outfit because of the theme.
6. Preserve this order: locked identity/outfit, phrase acting, graphic effects, then exactly one text block.`;

const TEXT_SINGLE_KO = `[문자 정확도·배치 — 단일 스티커]
- 지정된 원문 문구를 한 글자도 바꾸지 말고 그대로 사용하세요. 번역, 요약, 맞춤법 교정, 띄어쓰기 변경, 글자 추가·삭제를 금지합니다.
- 텍스트 블록을 정확히 1개만 만들고 지정 문구를 정확히 1회만 렌더링하세요.
- 제목+하단 캡션, 위+아래 반복, 말풍선+본문, 라벨, 자막, 에코 텍스트 등 두 번째 텍스트 블록을 만들지 마세요. 문구 일부의 반복도 금지합니다.
- 1줄을 우선하고 길 때만 의미 단위로 자연스럽게 2줄까지 허용합니다. 한글 음절을 세로 한 글자씩 쪼개거나 어절을 부자연스럽게 분해하지 마세요.
- 작업 지시용 번호, Sticker 번호, 따옴표, 라벨을 이미지에 출력하지 마세요.`;

const TEXT_SHEET_KO = `[15개 문자 정확도·배치 — 시트]
- 제공된 15개 원문 문구를 순서대로 1:1 대응해 각각 정확히 한 번만 사용하세요. 번역, 요약, 교정, 띄어쓰기 변경, 글자 추가·삭제를 금지합니다.
- 각 스티커에는 텍스트 블록을 정확히 1개만 만들고 전체 시트에는 총 15개의 텍스트 블록만 존재해야 합니다.
- 같은 문구나 문구 일부를 제목, 하단 캡션, 말풍선, 라벨, 자막, 에코 텍스트로 다시 표시하지 마세요.
- 각 문구는 1줄 우선, 필요할 때만 자연스러운 2줄까지 허용합니다. '알겠 / 사옵 / 니다'처럼 음절 단위 또는 부자연스러운 어절 단위로 세로 분해하지 마세요.
- 목록 번호 1~15와 Sticker 번호는 작업 지시일 뿐 이미지에 출력하지 마세요.`;

const TEXT_SINGLE_EN = `[TEXT ACCURACY AND LAYOUT — SINGLE STICKER]
Use the supplied source phrase exactly as written. Create exactly ONE text block and render it exactly once. Never add a second title, subtitle, caption, speech bubble, label, or echo text, and never repeat part of the phrase. Prefer one line and use at most two natural semantic lines when necessary. Never split Korean syllables vertically or into unnatural fragments. Do not render instruction labels or sticker numbers.`;

const TEXT_SHEET_EN = `[TEXT ACCURACY AND LAYOUT — 15-STICKER SHEET]
Use all 15 supplied source phrases in order, one exact phrase per sticker, exactly once each. Create exactly ONE text block per sticker and exactly 15 text blocks total. Never duplicate a phrase or part of it as a title, subtitle, caption, speech bubble, label, or echo text. Prefer one line and allow at most two natural semantic lines. Never split Korean syllables vertically or into unnatural fragments. Never render list or sticker numbers.`;

const GEMINI_TEXT_KO = `[Gemini 전용 한글 레터링]
- 일반 UI·자막·인쇄체처럼 보이지 않는 굵고 친근한 한국 만화식 손글씨·붓펜·마커 레터링을 사용하세요.
- 기본은 진한 검정/먹색 획과 두껍고 깨끗한 순백색 다이컷 외곽선입니다.
- 글자를 캐릭터 주위의 깨끗한 여백에 안정적으로 배치하고 얼굴, 손, 핵심 의상 디테일을 덮지 마세요.
- 글자 크기와 기울기는 감정에 따라 소폭 변화할 수 있지만 과도한 장식보다 정확한 원문·가독성·1회 출력이 항상 우선입니다.`;

const GEMINI_TEXT_EN = `[GEMINI LETTERING]
Use bold friendly hand-drawn comic/brush-marker lettering rather than generic UI, subtitle, or printed typography. Prefer deep black/ink strokes with a thick crisp pure-white die-cut outline. Place the single text block in clean negative space without covering the face, hands, or defining outfit details. Exact source text, readability, and one-time rendering outrank decoration.`;

const GROK_TEXT_KO = `[Grok 전용 한글 레터링]
- 굵은 검정/먹색 브러시·마커 계열의 손그림 만화 레터링과 두껍고 선명한 순백색 다이컷 외곽선을 사용하세요.
- 문구의 감정에 따라 크기, 기울기, 자간에 더 강한 리듬감을 줄 수 있지만 반드시 하나의 텍스트 블록 안에서만 표현하세요.
- 속도선·충격선·오라 등 그래픽 효과를 글자와 연결할 수 있으나 글자 획을 변형, 가림, 복제하거나 두 번째 문구처럼 보이게 만들지 마세요.
- 그래픽 임팩트보다 정확한 원문·가독성·1회 출력이 우선입니다.`;

const GROK_TEXT_EN = `[GROK LETTERING]
Use bold black/ink brush-marker comic lettering with a thick crisp pure-white die-cut outline. Stronger scale, tilt, and spacing rhythm are allowed inside the single text block. Motion lines, impact lines, or aura may connect visually to the lettering but must never alter, obscure, echo, or duplicate glyphs. Exact source text, readability, and one-time rendering outrank graphic impact.`;

export function modelPromptPriorityV2Plugin() {
  return {
    name: 'model-prompt-priority-v2',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null;

      let out = code;
      const helperMarker = `  const getPreviewPrompt = () => {`;
      const helper = `  const enhanceModelSpecificPrompt = (prompt, model) => {
    if (model !== 'gemini' && model !== 'grok') return prompt;
    const textEnabled = model === 'gemini' ? geminiTextMode === 'text' : grokTextMode === 'text';
    const isSingle = generationMode === 'individual' || generationMode === 'batch';
    const sourcePrompt = String(prompt || '');

    const themeGuideKo = (() => {
      const guides = [
        [/(?:의성어|효과음|쿵|쾅|팡|펑|탁|톡)/, '소리의 세기와 성격이 몸동작, 충격감, 속도선, 효과선에서 바로 느껴지게 연기하세요.'],
        [/(?:의태어|움직임|살금|두근|벌벌|뒹굴|힐끔)/, '몸 전체의 움직임, 시선, 리듬, 무게중심을 분명하게 표현하세요.'],
        [/(?:사과|미안|죄송|용서)/, '고개 숙임, 두 손 모음, 조심스러운 손짓, 쭈굴한 자세 등 미안함의 강도를 문구마다 다르게 연기하세요.'],
        [/(?:거절|사양|패스|어려워|곤란|안 할래|못 가)/, '손사래, 고개 젓기, 거리 두기, 난처함 또는 단호함으로 거절 의사가 한눈에 보이게 표현하세요.'],
        [/(?:애교|뿌잉|안아쥬|놀아쥬|보고시퍼|조아용)/, '하트, 볼에 손 대기, 몸 기울이기, 반짝이는 눈, 귀여운 손동작 등 사랑스러운 연기를 사용하세요.'],
        [/(?:악당|계획대로|덤벼|각오|지배|절망|어둠)/, '음흉한 미소, 자신만만한 자세, 위협적인 손짓, 오라와 그림자 등 악당 연기를 사용하되 의상은 바꾸지 마세요.'],
        [/(?:속마음|혼잣말|부럽|신경 쓰여|서운|긴장|질투|참는 중)/, '멍함, 한숨, 망설임, 민망함, 귀찮음, 은근한 기쁨처럼 내면 감정을 표정과 자세로 드러내세요.'],
        [/(?:사투리|맞제|고맙데이|오메|아이가|당께)/, '친근함, 능청스러움, 구수함, 활달함이 표정과 제스처에서 느껴지도록 연기하세요.'],
        [/(?:명대사|결의|운명|기억해|새겨 둬)/, '결의, 자신감, 비장함, 강조된 시선과 손짓으로 한 장면의 클라이맥스처럼 연출하세요.'],
        [/(?:중2병|세계관|각성|봉인|오라)/, '각성, 허세, 오라, 손 뻗기, 극적인 시선과 앵글을 사용하되 의상은 바꾸지 마세요.'],
        [/(?:로봇|AI 말투|분석|스캔|시스템|데이터)/i, '분석적인 자세, 스캔 제스처, 규칙적인 움직임, 데이터 패널 같은 기계적 연기를 사용하세요.'],
        [/(?:여행|비행기|호텔|체크인|티켓|배낭|면세점|수영장)/, '장소성, 이동감, 여행 소품과 실제 행동 맥락이 문구 의미와 정확히 연결되도록 표현하세요.'],
        [/(?:직장|회사|출근|퇴근|회의|야근|칼퇴)/, '업무 상황, 피로, 집중, 퇴근의 해방감 등을 최소한의 업무 소품과 행동으로 표현하세요.'],
        [/(?:게임|E스포츠|게이머|승리|패배|랭크|캐리)/i, '집중, 환호, 좌절, 승리 포즈, 컨트롤 동작 등 게임 상황의 감정을 명확히 연기하세요.'],
        [/(?:연애|커플|사랑|보고 싶|심쿵|데이트)/, '설렘, 애정, 서운함, 기다림 등 관계 감정이 시선, 거리감, 손동작에서 자연스럽게 드러나게 하세요.'],
        [/(?:헬스|다이어트|운동|근육|단백질|러닝)/, '힘쓰기, 지침, 성취감, 운동 루틴을 몸의 긴장과 필요한 운동 소품으로 직접 보여주세요.'],
      ];
      const hit = guides.find(([pattern]) => pattern.test(sourcePrompt));
      return hit ? hit[1] : '현재 선택된 문구 테마와 각 문구의 의미를 해석해 그 테마의 감정·관계·상황·목적이 캐릭터 행동에서 즉시 읽히도록 연기하세요.';
    })();

    const actingKo = isSingle
      ? '[문구 의미 → 캐릭터 연기]\\n- 현재 문구의 의미를 표정, 시선, 포즈, 손동작, 몸짓, 필요한 소품, 효과선으로 직접 시각화하세요.\\n- 문구를 읽지 않아도 감정과 상황이 느껴지게 하되 정체성과 의상은 변경하지 마세요.\\n- 선택 테마 보강: ' + themeGuideKo
      : '[15개 문구 의미 → 캐릭터 연기]\\n- 15개 스티커 각각이 자신의 문구 의미를 표정, 시선, 포즈, 손동작, 몸짓, 필요한 소품, 효과선으로 직접 시각화해야 합니다.\\n- 같은 포즈, 같은 표정, 같은 손동작, 같은 구도를 반복하지 말고 15개가 서로 다른 감정·상황·행동으로 구분되게 하세요.\\n- 단순히 글자만 바꾸고 비슷한 캐릭터 연기를 반복하지 마세요.\\n- 선택 테마 보강: ' + themeGuideKo;

    const actingEn = isSingle
      ? '[PHRASE MEANING TO CHARACTER ACTING] Directly act out the assigned phrase through facial expression, gaze, pose, hand gesture, body language, only necessary props, and motion/effect lines. Preserve identity and outfit.'
      : '[PHRASE MEANING TO CHARACTER ACTING — ALL 15] Each sticker must distinctly act out its own phrase through facial expression, gaze, pose, hand gesture, body language, only necessary props, and motion/effect lines. Avoid repeated acting while preserving identity and outfit.';

    const commonBlocks = lang === 'ko'
      ? [${JSON.stringify(COMMON_PRIORITY_KO)}, ${JSON.stringify(COMMON_IDENTITY_KO)}, actingKo]
      : [${JSON.stringify(COMMON_PRIORITY_EN)}, ${JSON.stringify(COMMON_IDENTITY_EN)}, actingEn];

    const modelExecution = model === 'gemini'
      ? (lang === 'ko' ? ${JSON.stringify(GEMINI_EXECUTION_KO)} : ${JSON.stringify(GEMINI_EXECUTION_EN)})
      : (lang === 'ko' ? ${JSON.stringify(GROK_EXECUTION_KO)} : ${JSON.stringify(GROK_EXECUTION_EN)});

    const blocks = [commonBlocks[0], commonBlocks[1], modelExecution, commonBlocks[2]];

    if (textEnabled) {
      const exactText = lang === 'ko'
        ? (isSingle ? ${JSON.stringify(TEXT_SINGLE_KO)} : ${JSON.stringify(TEXT_SHEET_KO)})
        : (isSingle ? ${JSON.stringify(TEXT_SINGLE_EN)} : ${JSON.stringify(TEXT_SHEET_EN)});
      const modelText = model === 'gemini'
        ? (lang === 'ko' ? ${JSON.stringify(GEMINI_TEXT_KO)} : ${JSON.stringify(GEMINI_TEXT_EN)})
        : (lang === 'ko' ? ${JSON.stringify(GROK_TEXT_KO)} : ${JSON.stringify(GROK_TEXT_EN)});
      blocks.push(exactText, modelText);
    }

    return String(prompt || '') + '\\n\\n' + blocks.join('\\n\\n');
  };

${helperMarker}`;

      out = replaceOnce(out, helperMarker, helper, 'helper injection');

      const geminiMarker = `generateGeminiPrompt(phraseOverride)`;
      const geminiReplacement = `enhanceModelSpecificPrompt(generateGeminiPrompt(phraseOverride), 'gemini')`;
      out = replaceCount(out, geminiMarker, geminiReplacement, 3, 'Gemini prompt wrapping');

      const grokMarker = `generateGrokPrompt(phraseOverride)`;
      const grokReplacement = `enhanceModelSpecificPrompt(generateGrokPrompt(phraseOverride), 'grok')`;
      out = replaceCount(out, grokMarker, grokReplacement, 3, 'Grok prompt wrapping');

      return { code: out, map: null };
    },
  };
}
