const TARGET = '/src/App.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[model-prompt-v3] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[model-prompt-v3] ${label} marker is not unique`);
  }
  return source.slice(0, first) + replacement + source.slice(first + marker.length);
};

const replaceCount = (source, marker, replacement, expected, label) => {
  const parts = source.split(marker);
  const count = parts.length - 1;
  if (count !== expected) {
    throw new Error(`[model-prompt-v3] ${label} expected ${expected} occurrence(s), found ${count}`);
  }
  return parts.join(replacement);
};

const COMMON_PRIORITY_KO = `[공통 생성 우선순위 — 절대 규칙]
반드시 다음 순서를 지키세요: 1) 참고 사진의 정체성·캐릭터 고정 정보, 2) 참고 사진/고정 정보의 의상, 3) 구도와 신체 노출 범위, 4) 선택 화풍, 5) 문구 의미와 테마에 맞는 행동·표정, 6) 문자 정확도·배치, 7) 장식·효과.
뒤 단계는 앞 단계를 절대 변경할 수 없습니다. 문구 테마나 화풍은 얼굴, 헤어스타일, 체형, 성별, 정체성, 고정 의상 또는 기본 화각을 바꾸는 근거가 될 수 없습니다.`;

const COMMON_IDENTITY_KO = `[정체성·의상 잠금 — 사진참고 시 최우선]
- 참고 사진이 있으면 얼굴형, 눈매, 코, 입, 턱선, 헤어스타일, 피부톤, 안경/수염 등 식별 특징을 일관되게 유지하세요.
- 생성 전에 참고 사진에서 보이는 의상을 시각적으로 분석해 의상 종류, 주색, 보조색, 패턴/프린트/로고/패치, 목선, 소매 길이, 핏과 실루엣, 겹쳐 입은 층, 눈에 띄는 액세서리를 고정하세요.
- 캐릭터 고정 정보에 별도 의상이 명시되어 있으면 그 지정 의상이 우선이며, 그렇지 않으면 참고 사진의 실제 의상을 그대로 사용하세요.
- 고정된 의상의 종류와 색을 다른 옷으로 교체하거나 테마에 맞게 재디자인하지 마세요. 프린트나 패치가 단순화되더라도 위치와 존재감은 유지하세요.
- 사극·고전·무협·악당·영웅·판타지·여행·직장·게임 등 어떤 테마도 한복, 도복, 무술복, 갑옷, 망토, 제복, 코스튬, 판타지 복장 등으로 바꾸는 근거가 될 수 없습니다.
- 화풍은 선, 채색, 질감, 단순화, 분위기에만 적용하고 의상의 종류·색·소매·목선·대표 디테일은 보존하세요.
- 문구 포함 여부 때문에 캐릭터를 재의상화하거나 얼굴·체형·정체성을 재설계하지 마세요.`;

const COMMON_FRAMING_KO = `[구도·화각 규칙 — 얼굴 클로즈업 편중 금지]
- 얼굴만 크게 보이는 초근접 초상, 머리와 목만 보이는 구도, 동일한 흉상 클로즈업 반복을 기본값으로 사용하지 마세요.
- 기본은 상반신 미디엄 샷 또는 반신 구도이며, 얼굴뿐 아니라 어깨·가슴/몸통·팔·손동작과 고정 의상이 함께 보여야 합니다.
- 15개 시트에서는 최소 10개 스티커에서 몸통과 팔 또는 손이 충분히 보이게 하고, 그중 최소 3개는 반신~전신 동작 구도로 구성하세요. 얼굴 중심 근접 구도는 전체 15개 중 최대 2개까지만 허용하세요.
- 각 스티커에서 문구의 행동을 손과 몸으로 읽을 수 있어야 하며, 의상 특징을 확인할 수 있을 정도로 몸통 영역을 프레임 안에 남기세요.
- 텍스트를 넣기 위해 캐릭터를 얼굴만 남도록 과도하게 확대하거나 잘라내지 마세요. 텍스트는 캐릭터 주변 여백을 사용하세요.
- 단일 스티커도 특별히 얼굴 클로즈업이 필요한 문구가 아니면 상반신 이상을 우선하세요.`;

const COMMON_PRIORITY_EN = `[COMMON GENERATION PRIORITY — ABSOLUTE]
Follow this order strictly: 1) reference identity/fixed character information, 2) reference or fixed outfit, 3) framing/body visibility, 4) selected art style, 5) phrase/theme acting, 6) text accuracy/layout, 7) decoration/effects. Later levels must never override earlier ones.`;

const COMMON_IDENTITY_EN = `[IDENTITY AND OUTFIT LOCK — HIGHEST PRIORITY WITH A REFERENCE PHOTO]
- When a reference photo is present, preserve face shape, eyes, nose, mouth, jawline, hairstyle, skin tone, glasses/facial hair, and other identifying cues consistently.
- Before stylizing, visually identify and lock the visible outfit: garment type, main and secondary colors, pattern/print/logo/patch, neckline, sleeve length, fit/silhouette, layers, and distinctive accessories.
- If fixed character information explicitly specifies an outfit, use that. Otherwise reuse the actual reference-photo outfit rather than inventing a new one.
- Never replace or redesign the locked outfit to match a historical, fantasy, villain, heroic, travel, office, gaming, or other theme. Do not substitute robes, martial-arts uniforms, armor, capes, uniforms, costumes, or fantasy clothing.
- Apply art style to line, color treatment, texture, simplification, and mood while preserving garment type, colors, sleeves, neckline, and defining details.`;

const COMMON_FRAMING_EN = `[FRAMING AND BODY VISIBILITY — AVOID FACE-HEAVY RESULTS]
- Do not default to face-only close-ups, head-and-neck portraits, or repeated bust crops.
- Default to medium upper-body or half-body framing so the face, shoulders, torso, arms/hands, acting gesture, and locked outfit are visible together.
- In a 15-sticker sheet, at least 10 stickers should clearly show torso plus arms or hands; at least 3 of those should use half-body to full-body action framing. Limit face-dominant close-ups to at most 2 of 15.
- Keep enough torso area visible to verify the outfit. Use surrounding negative space for text instead of cropping the body away.
- For a single sticker, prefer upper-body or wider unless the phrase genuinely requires a close-up.`;

const GEMINI_EXECUTION_KO = `[Gemini 전용 실행 방식 — 사진 충실도·안정성 우선]
1. 각 칸을 만들기 전에 참고 사진의 얼굴과 의상을 먼저 고정하고, 그 고정값을 15개 전체에 반복 적용하세요.
2. 의상은 새로 디자인하지 말고 참고 사진에서 확인한 실제 옷을 그대로 스타일화하세요. 테마와 어울리지 않아 보여도 옷은 바꾸지 않습니다.
3. 기본 화각은 상반신~반신입니다. 얼굴 인식성뿐 아니라 가슴/몸통, 팔, 손동작, 의상 디테일이 함께 보이게 하세요.
4. 15개에서 얼굴 크기를 지나치게 키우지 말고, 손동작과 몸의 자세로 감정을 설명하세요. 얼굴 클로즈업은 정말 필요한 최대 2개만 사용하세요.
5. 소품과 효과는 문구 이해에 필요한 최소 수준으로 제한하고, 의상이나 몸통을 가리지 마세요.
6. 각 칸을 '정체성 확인 → 의상 확인 → 화각 확인 → 문구 행동 → 텍스트 마지막 1회' 순서로 처리하세요.
7. 생성 직전 자체 점검: 다른 옷으로 바뀌었거나 몸통이 잘려 의상이 보이지 않으면 해당 칸의 구성을 수정한 뒤 생성하세요.`;

const GEMINI_EXECUTION_EN = `[GEMINI EXECUTION — REFERENCE FIDELITY AND STABILITY]
1. Lock the face and actual reference outfit before composing each sticker, then reuse those locked traits across all 15.
2. Stylize the real outfit instead of redesigning it. Never change clothing just because another costume seems to fit the phrase theme better.
3. Default to upper-body or half-body framing with visible torso, arms/hands, acting gesture, and defining outfit details.
4. Avoid oversized face crops. Use body language and hand gestures; allow at most two genuinely necessary face-dominant close-ups in a 15-sheet.
5. Keep props/effects minimal and never let them hide the outfit or torso.
6. Process each sticker as: identity check, outfit check, framing check, phrase acting, then one text block last.`;

const GROK_EXECUTION_KO = `[Grok 전용 실행 방식 — 동세 강화, 의상·화각은 고정]
1. 참고 사진의 얼굴 정체성과 실제 의상을 먼저 잠근 뒤에만 동세와 그래픽 연출을 확장하세요.
2. 문구마다 손동작, 몸의 방향, 무게중심, 실루엣, 앵글을 과감하게 바꿀 수 있지만 옷의 종류·색·소매·목선·대표 프린트/패치는 유지하세요.
3. 강한 동세는 얼굴 확대가 아니라 팔·손·상체·반신·전신의 움직임으로 만드세요. 15개 중 최소 10개는 몸통+팔/손이 보이고, 최소 3개는 반신~전신 동작이어야 합니다. 얼굴 중심 근접은 최대 2개입니다.
4. 속도선, 충격선, 오라, 하트, 땀, 반짝임은 적극적으로 사용할 수 있지만 얼굴·고정 의상·문자를 가리거나 대체하지 마세요.
5. 테마를 이유로 새로운 도복, 한복, 갑옷, 망토, 제복, 코스튬을 추가하지 마세요. 극적인 분위기는 포즈·앵글·효과선으로만 만드세요.
6. '정체성/의상 잠금 → 화각 확보 → 문구 행동 → 그래픽 효과 → 텍스트 1회' 순서를 유지하세요.`;

const GROK_EXECUTION_EN = `[GROK EXECUTION — DYNAMIC MOTION WITH LOCKED OUTFIT AND FRAMING]
1. Lock reference identity and the actual reference outfit before expanding motion or graphic staging.
2. Vary gesture, body direction, weight shift, silhouette, and camera energy while preserving garment type, colors, sleeves, neckline, and defining prints/patches.
3. Create impact with arms, hands, upper body, half-body, and full-body motion rather than oversized face crops. At least 10 of 15 should show torso plus arms/hands, at least 3 should be half/full-body action, and face-dominant close-ups are limited to 2.
4. Energetic motion lines, impact lines, aura, hearts, sweat, and sparkles are allowed but must not hide or replace the face, locked outfit, or text.
5. Never add robes, martial-arts uniforms, armor, capes, uniforms, or costumes because of theme. Express theme through pose, angle, acting, and effects instead.`;

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
- 각 문구는 1줄 우선, 필요할 때만 자연스러운 2줄까지 허용합니다. 한글 음절이나 어절을 부자연스럽게 세로 분해하지 마세요.
- 목록 번호 1~15와 Sticker 번호는 작업 지시일 뿐 이미지에 출력하지 마세요.`;

const TEXT_SINGLE_EN = `[TEXT ACCURACY AND LAYOUT — SINGLE STICKER]
Use the supplied source phrase exactly as written. Create exactly ONE text block and render it exactly once. Never add a second title, subtitle, caption, speech bubble, label, echo text, or partial duplicate. Prefer one line and use at most two natural semantic lines. Never split Korean syllables vertically or into unnatural fragments. Do not render instruction labels or sticker numbers.`;

const TEXT_SHEET_EN = `[TEXT ACCURACY AND LAYOUT — 15-STICKER SHEET]
Use all 15 supplied source phrases in order, one exact phrase per sticker, exactly once each. Create exactly ONE text block per sticker and exactly 15 text blocks total. Never duplicate a phrase or part of it as a title, subtitle, caption, speech bubble, label, or echo text. Prefer one line and allow at most two natural semantic lines. Never split Korean syllables vertically or into unnatural fragments. Never render list or sticker numbers.`;

const GEMINI_TEXT_KO = `[Gemini 전용 한글 레터링]
- 일반 UI·자막·인쇄체가 아니라 굵고 친근한 한국 만화식 손글씨·붓펜·마커 레터링을 사용하세요.
- 진한 검정/먹색 획과 두껍고 깨끗한 순백색 다이컷 외곽선을 기본으로 하세요.
- 글자는 캐릭터 주변 여백에 배치하고 얼굴, 손, 몸통, 핵심 의상 디테일을 덮지 마세요.
- 정확한 원문·가독성·1회 출력이 장식보다 우선입니다.`;

const GEMINI_TEXT_EN = `[GEMINI LETTERING]
Use bold friendly hand-drawn comic/brush-marker lettering with deep black/ink strokes and a thick crisp pure-white die-cut outline. Place the single text block in surrounding negative space without covering face, hands, torso, or defining outfit details. Exact text and readability outrank decoration.`;

const GROK_TEXT_KO = `[Grok 전용 한글 레터링]
- 굵은 검정/먹색 브러시·마커 계열의 손그림 만화 레터링과 두껍고 선명한 순백색 다이컷 외곽선을 사용하세요.
- 크기, 기울기, 자간에 강한 리듬감을 줄 수 있지만 반드시 하나의 텍스트 블록 안에서만 표현하세요.
- 효과선은 글자와 연결할 수 있으나 글자 획을 변형·가림·복제하거나 두 번째 문구처럼 만들지 마세요.
- 정확한 원문·가독성·1회 출력이 그래픽 임팩트보다 우선입니다.`;

const GROK_TEXT_EN = `[GROK LETTERING]
Use bold black/ink brush-marker comic lettering with a thick crisp pure-white die-cut outline. Strong scale, tilt, and spacing rhythm are allowed inside the single text block. Effects may connect visually to lettering but must never alter, obscure, echo, or duplicate glyphs. Exact text and one-time rendering outrank impact.`;

export function modelPromptPriorityV3Plugin() {
  return {
    name: 'model-prompt-priority-v3',
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
      return hit ? hit[1] : '현재 선택된 문구 테마와 각 문구의 의미를 해석해 그 감정·상황·목적이 캐릭터의 표정뿐 아니라 손과 몸의 행동에서도 즉시 읽히도록 연기하세요.';
    })();

    const actingKo = isSingle
      ? '[문구 의미 → 캐릭터 연기]\\n- 현재 문구의 의미를 표정, 시선, 포즈, 손동작, 몸짓, 필요한 소품, 효과선으로 직접 시각화하세요.\\n- 얼굴만으로 표현하지 말고 손과 상체의 행동을 함께 사용하세요. 정체성과 의상은 변경하지 마세요.\\n- 선택 테마 보강: ' + themeGuideKo
      : '[15개 문구 의미 → 캐릭터 연기]\\n- 15개 각각이 자신의 문구를 표정, 시선, 포즈, 손동작, 몸짓, 필요한 소품, 효과선으로 직접 시각화해야 합니다.\\n- 같은 포즈, 표정, 손동작, 구도를 반복하지 말고 얼굴만 바꾼 비슷한 흉상 시리즈가 되지 않게 하세요.\\n- 선택 테마 보강: ' + themeGuideKo;

    const actingEn = isSingle
      ? '[PHRASE ACTING] Act out the phrase through expression, gaze, pose, hand gesture, upper-body action, only necessary props, and effect lines. Do not rely on the face alone; preserve identity and outfit.'
      : '[PHRASE ACTING — ALL 15] Each sticker must distinctly act out its phrase through expression, gaze, pose, hand gesture, upper-body/body action, necessary props, and effects. Avoid repeated bust portraits while preserving identity and outfit.';

    const commonBlocks = lang === 'ko'
      ? [${JSON.stringify(COMMON_PRIORITY_KO)}, ${JSON.stringify(COMMON_IDENTITY_KO)}, ${JSON.stringify(COMMON_FRAMING_KO)}, actingKo]
      : [${JSON.stringify(COMMON_PRIORITY_EN)}, ${JSON.stringify(COMMON_IDENTITY_EN)}, ${JSON.stringify(COMMON_FRAMING_EN)}, actingEn];

    const modelExecution = model === 'gemini'
      ? (lang === 'ko' ? ${JSON.stringify(GEMINI_EXECUTION_KO)} : ${JSON.stringify(GEMINI_EXECUTION_EN)})
      : (lang === 'ko' ? ${JSON.stringify(GROK_EXECUTION_KO)} : ${JSON.stringify(GROK_EXECUTION_EN)});

    const blocks = [commonBlocks[0], commonBlocks[1], commonBlocks[2], modelExecution, commonBlocks[3]];

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
