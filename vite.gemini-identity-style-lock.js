const TARGET = '/src/App.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[gemini-lock] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[gemini-lock] ${label} marker is not unique`);
  }
  return source.slice(0, first) + replacement + source.slice(first + marker.length);
};

const replaceCount = (source, marker, replacement, expected, label) => {
  const parts = source.split(marker);
  const count = parts.length - 1;
  if (count !== expected) {
    throw new Error(`[gemini-lock] ${label} expected ${expected} occurrence(s), found ${count}`);
  }
  return parts.join(replacement);
};

export function geminiIdentityStyleLockPlugin() {
  return {
    name: 'gemini-identity-style-lock',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null;

      let out = code;
      const helperMarker = `  const getPreviewPrompt = () => {`;
      const helper = `  const optimizeGeminiIdentityStyleLock = (prompt) => {
    let base = String(prompt || '');

    base = base
      .replace(/\\[모델 최적화 v\\d+(?:\\.\\d+)*\\]/g, '[모델 최적화]')
      .replace(/ — Gemini v\\d+(?:\\.\\d+)*/g, '')
      .replace(/ — GEMINI v\\d+(?:\\.\\d+)*/g, '')
      .replace(/ — v\\d+(?:\\.\\d+)*/g, '');

    const koLock = \
\`[정체성·의상 고정 — 최우선]
- [캐릭터 고정 정보]의 외형과 의상은 15개 전체에서 변경 금지입니다. 옷의 종류, 색상, 실루엣, 길이, 재질과 주요 디테일을 동일하게 유지하세요.
- 감정, 액션, 장소, 직업이나 화풍이 다른 복장을 암시해도 의상을 교체하지 마세요. 격투 동작이어도 도복으로, 업무 상황이어도 정장으로, 휴식 상황이어도 잠옷으로 바꾸지 마세요.
- 참고 사진과 별도 의상 지정이 함께 있으면 지정 의상이 착장을 결정하고 참고 사진은 얼굴·헤어·안경 등 정체성을 결정합니다.
- 한 스티커만 다른 옷이나 색으로 바꾸는 변형도 금지합니다. 감정과 포즈만 크게 바꾸고 정체성과 의상은 고정하세요.\`;

    const koStyleDirector = \
\`[선택 화풍 = 전체 연출 감독 — 최우선]
- [최우선 화풍]은 선·색·질감만 바꾸는 필터가 아닙니다. 포즈, 몸의 선, 손동작, 시선, 카메라, 원근, 소품, 속도감, 효과, 여백, 감정 연기와 레터링까지 지배합니다.
- 문구 의미는 유지하되 행동 자체를 선택 화풍의 시각 문법으로 다시 연기하세요. 정면 흉상, 평범한 엄지척, 단순 손흔들기 같은 메신저 스티커 기본 포즈로 평준화하지 마세요.
- 전통 무협 만화풍이면 고정 의상은 그대로 둔 채 무협지 한 장면처럼 연출하세요. 로우/하이 앵글, 사선 구도, 과감한 단축법, 장풍·기운을 연상시키는 먹선과 바람, 잔상·속도선, 절도 있는 무공 자세, 중심축과 손끝의 긴장, 강호 분위기의 여백과 먹 번짐을 사용하세요. 무협풍을 이유로 도복·한복·갑옷으로 바꾸면 안 됩니다.
- 다른 화풍도 같은 원리입니다. 수묵담채는 여백·붓 방향·절제된 몸짓까지, 크레파스는 장난스러운 아동적 동작까지, 펠트·자수·클레이는 수공예 인형/스톱모션 같은 자세와 소품까지, 열혈 배틀 만화는 극단적 원근과 폭발적 동세까지 화풍에 포함하세요.

[화풍 우선순위 · 문구 테마 격리]
- 우선순위는 항상 '선택 화풍 → 캐릭터 정체성·의상 → 문구 의미·감정·소품'입니다. 문구나 문구 테마가 선택 화풍을 덮어쓰거나 새로운 화풍을 만들면 실패입니다.
- 문구 테마는 문장 선택을 위한 분류일 뿐 시각 스타일 지시가 아닙니다. 테마명 자체를 그림의 장르, 시대, 색감, 재질, 카메라 문법, 레터링 스타일로 해석하지 마세요.
- 문구는 WHAT만 결정합니다: 무슨 감정인지, 무슨 행동인지, 어떤 소품이 필요한지. 선택 화풍은 HOW를 결정합니다: 어떻게 그리고, 어떻게 연기하고, 어떤 카메라와 효과와 글씨 리듬을 사용할지.
- 문구에서 계절, 음식, 직업, 학교, 게임, 공룡, 눈사람, 여행, 운동 같은 소재가 등장해도 해당 소재의 전형적인 카툰/광고/아동/포스터 화풍으로 전환하지 마세요. 소재는 선택 화풍 안에서 소품·행동·상황으로만 번역하세요.
- 예: 선택 화풍이 전통 무협 만화풍이고 문구가 '눈사람 만드는 중'이면, 겨울 그림책풍으로 바꾸지 말고 무협 만화의 먹선·동세·카메라·여백을 유지한 채 눈사람을 소품으로 다루세요.
- 예: '공룡 댄스 타임'이어도 공룡 아동 카툰풍으로 바꾸지 말고, 선택 화풍의 몸짓·원근·효과·레터링을 유지한 채 공룡 모티프만 행동이나 소품으로 사용하세요.
- 예: '중간고사 기간'이어도 학습 포스터나 학원 광고풍으로 바꾸지 말고, 선택 화풍의 화면 문법 안에서 책·시험지·긴장감만 표현하세요.
- 최종 결과를 보았을 때 15개 모두 같은 화풍의 한 작품 세계에 속해야 하며, 문구 소재가 달라져도 렌더링·카메라·효과·레터링의 화풍 DNA는 흔들리지 않아야 합니다.

[행동 기반 화각·카메라 선택]
- 상반신을 기본값으로 사용하지 마세요. 각 문구의 행동을 먼저 판단한 뒤 그 행동이 가장 잘 보이는 화각을 선택하세요.
- 도약, 달리기, 착지, 재기, 회피, 보법, 전신 자세처럼 다리와 중심 이동이 중요한 행동은 반드시 전신 또는 거의 전신으로 보여주세요.
- 장풍, 점혈, 주먹, 손끝, 밀치기처럼 팔과 몸통의 방향성이 중요한 행동은 반신 또는 3/4 신체와 강한 단축법을 사용하세요.
- 눈빛, 미세한 당황, 억눌린 분노처럼 얼굴이 핵심인 경우에만 상반신/클로즈업을 사용하세요.
- 15개 전체가 가슴 위 초상처럼 보이면 실패입니다. 시트 전체에 최소 4개의 전신/거의 전신, 최소 4개의 반신·3/4 신체를 포함하고, 순수 상반신/클로즈업은 최대 5개까지만 사용하세요.
- 카메라 역시 반복하지 마세요. 정면 눈높이만 반복하지 말고 로우 앵글, 하이 앵글, 사선, 측면, 뒤돌아보는 구도, 전경으로 튀어나오는 손·발의 단축법을 행동에 맞춰 섞으세요.

[감정형 레터링 — 글자도 연기]
- 따옴표 안 한글 철자와 띄어쓰기는 정확히 유지하되, 글자 자체도 감정을 연기해야 합니다.
- 같은 폰트, 같은 굵기, 같은 크기, 같은 외곽선, 같은 직선 정렬을 15개에 반복하지 마세요.
- 웃음·신남은 통통 튀거나 올라가는 리듬, 놀람·당황은 크기와 기울기가 살짝 흔들리는 리듬, 분노는 빠르고 거친 방향성, 슬픔·체념은 힘이 빠져 처지는 흐름, 따뜻함·감동은 부드럽고 여유 있는 호흡처럼 감정에 따라 크기·기울기·자간·baseline·획의 힘을 바꾸세요.
- 전통 무협풍도 모든 문구를 무거운 서예 제목으로 만들지 마세요. 붓의 기세와 먹의 강약은 재료일 뿐이며, 웃기는 문구는 가볍게 튀고 머뭇거리는 문구는 작고 불안정하게, 폭발하는 문구는 크게 터지듯 표현하세요.
- 한 글자씩 세로로 기계적으로 쌓는 조판, 세로 간판형 조판, 포스터 제목형 정렬을 기본값으로 사용하지 마세요. 문구 의미상 꼭 필요한 경우가 아니면 자연스러운 한 덩어리의 자유로운 손글씨 구성을 우선하세요.
- 글자는 캐릭터의 몸짓과 시선 방향을 따라 곡선·사선·비대칭으로 자연스럽게 배치할 수 있으며, 캐릭터와 함께 하나의 동세를 만들어야 합니다.
- 문자는 캐릭터 주변 흰 공간에 직접 떠 있어야 합니다. 사각형·둥근 사각형·라벨·배너·캡션 박스·명패 같은 배경판은 절대 만들지 마세요.
- 정확성과 가독성은 유지하되, 포스터나 정보 라벨보다 살아있는 손글씨 감정 표현을 우선하세요.\`;

    const enLock = \
\`[IDENTITY & OUTFIT LOCK — HIGHEST PRIORITY]
- Keep the appearance and outfit in [FIXED CHARACTER INFORMATION] immutable across all 15 stickers, including clothing type, color, silhouette, length, material and defining details.
- Never substitute clothing to match action, emotion, occupation, setting or art style. Fighting must not create martial-arts uniforms, office scenes must not create suits, and resting must not create sleepwear unless explicitly selected.
- If both a reference photo and a separate outfit are specified, the outfit controls clothing while the photo controls identity features such as face, hair and glasses.
- Do not create one-off costume or color changes. Vary expression and pose strongly while keeping identity and outfit fixed.\`;

    const enStyleDirector = \
\`[SELECTED ART STYLE = COMPLETE ART DIRECTION — HIGHEST PRIORITY]
- [HIGHEST PRIORITY ART STYLE] directs not only rendering but pose, body line, gesture, gaze, camera, foreshortening, props, motion, effects, negative space, emotional staging and typography.
- Preserve phrase meaning while re-staging the action through the selected style's visual grammar. Do not collapse the set into generic frontal bust portraits or standard messenger-sticker poses.
- For traditional wuxia comic style, KEEP THE FIXED OUTFIT UNCHANGED while using dramatic low/high angles, diagonal framing, bold foreshortening, martial body lines, qi/wind ink strokes, afterimages, speed lines, fingertip and stance tension, jianghu negative space and ink energy. Never replace fixed clothing with robes, martial-arts uniforms or historical costumes.
- Apply the same principle to every other style: ink-wash controls space and restrained gesture, crayon controls playful childlike acting, felt/embroidery/clay stages tactile handmade or stop-motion movement, and hot-blooded battle manga controls explosive perspective and choreography.

[STYLE PRIORITY & PHRASE-THEME ISOLATION]
- Priority is always Selected Art Style → Character Identity/Outfit → Phrase Meaning/Emotion/Props. A phrase or phrase theme must never override the selected art style or create a new visual style.
- Phrase-theme names are only categories used to choose wording. Never interpret the category name as instructions for genre, era, palette, material, camera grammar or lettering style.
- The phrase controls WHAT: emotion, action and necessary props. The selected style controls HOW: rendering, acting language, camera, effects and typography.
- Seasonal, food, school, work, game, dinosaur, snowman, travel or sports subjects must not trigger their stereotypical cartoon, advertising, children's-book or poster styles. Translate those subjects only into props, actions and situations inside the selected style.
- Example: with traditional wuxia comic style, 'making a snowman' remains wuxia in ink, staging, camera and negative space; the snowman is only a prop.
- Example: a dinosaur-dance phrase must not become a children's dinosaur cartoon. Keep the selected style's movement, perspective, effects and lettering while using dinosaur imagery only as a motif or prop.
- Example: an exam-period phrase must not become an education poster. Keep the selected style's visual grammar and express only books, papers and tension as content.
- All 15 stickers must feel as if they belong to one visual world. Phrase subject matter may change, but the style DNA of rendering, camera, effects and typography must remain stable.

[ACTION-DRIVEN FRAMING & CAMERA]
- Do not use upper-body framing as the default. Choose framing only after deciding what part of the body the action needs.
- Jumps, runs, landings, recoveries, evasions, footwork and stance-driven actions must be full-body or near-full-body.
- Palm strikes, pressure-point gestures, punches and hand-led actions should use half-body or three-quarter framing with meaningful foreshortening.
- Use bust close-ups only when eyes or subtle facial emotion are genuinely the main action.
- A sheet dominated by chest-up portraits is a failure. Across 15 stickers include at least 4 full/near-full-body shots and at least 4 half/three-quarter-body shots; use no more than 5 pure bust/close-up shots.
- Vary the camera according to action: low angle, high angle, diagonal/Dutch framing, profile, over-shoulder turn, and hands/feet projecting into the foreground. Do not repeat eye-level frontal framing.

[EMOTION-DRIVEN LETTERING — LETTERS MUST ACT]
- Preserve exact Korean spelling and spacing, but make the lettering itself perform the emotion.
- Do not repeat one font, weight, size, outline, baseline or rigid alignment across the set.
- Excitement may bounce or rise; surprise may wobble with uneven scale; anger may slash forward with fast forceful strokes; sadness may droop and soften; warmth may breathe with gentler wider spacing.
- Even in wuxia style, do not turn every phrase into heavy formal calligraphy. Brush energy and ink pressure are ingredients; playful phrases can bounce, hesitant phrases can shrink and wobble, explosive phrases can burst outward.
- Do not default to one-character-per-line vertical stacks, signboard columns or poster-title typography. Prefer one lively hand-lettered phrase block unless the phrase itself truly needs another arrangement.
- Lettering may curve, tilt and follow gaze or body motion so character and text share one visual rhythm.
- Put lettering directly on the plain white canvas. Never place it on rectangular or rounded plaques, labels, banners, caption boxes or signboards.
- Keep spelling and readability exact while prioritizing expressive hand-made emotional rhythm over information-label typography.\`;

    return base + '\\n\\n' + (lang === 'ko' ? koLock + '\\n\\n' + koStyleDirector : enLock + '\\n\\n' + enStyleDirector);
  };

${helperMarker}`;

      out = replaceOnce(out, helperMarker, helper, 'helper injection');

      const marker = `optimizeModelPromptV4(generateGeminiPrompt(phraseOverride), 'gemini')`;
      const replacement = `optimizeGeminiIdentityStyleLock(optimizeModelPromptV4(generateGeminiPrompt(phraseOverride), 'gemini'))`;
      out = replaceCount(out, marker, replacement, 3, 'Gemini prompt wrapping');

      return { code: out, map: null };
    },
  };
}
