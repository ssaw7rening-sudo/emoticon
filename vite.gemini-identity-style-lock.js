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

    // User-facing prompt must not expose internal version labels.
    base = base
      .replace(/\\[모델 최적화 v\\d+(?:\\.\\d+)*\\]/g, '[모델 최적화]')
      .replace(/ — Gemini v\\d+(?:\\.\\d+)*/g, '')
      .replace(/ — GEMINI v\\d+(?:\\.\\d+)*/g, '')
      .replace(/ — v\\d+(?:\\.\\d+)*/g, '');

    const koLock = \
\`[정체성·의상 고정 — 최우선]
- [캐릭터 고정 정보]에 적힌 외형과 의상은 15개 전체에서 변경 금지입니다. 의상 항목에 지정된 옷의 종류, 색상, 실루엣, 길이, 주요 디테일을 모든 스티커에서 동일하게 유지하세요.
- 감정, 행동, 직업, 장소, 소품 또는 상황이 다른 복장을 암시하더라도 절대 의상을 바꾸지 마세요. 예를 들어 격투·운동 동작이 있어도 도복이나 운동복으로, 업무 상황이어도 정장으로, 휴식 상황이어도 잠옷으로 자동 변경하지 마세요.
- 참고 사진과 별도 의상 지정이 함께 있으면 별도 지정 의상을 우선하고, 얼굴·헤어·안경 등 정체성 특징만 참고 사진에서 유지하세요.
- 한 스티커 안에서만 다른 의상을 쓰거나 색을 바꾸는 변형도 금지합니다. 15개 모두 같은 캐릭터, 같은 기본 의상이어야 합니다.
- 감정과 포즈는 크게 바꿔도 되지만 캐릭터 정체성과 고정 의상 자체는 바꾸지 마세요.\`;

    const koStyleDirector = \
\`[선택 화풍 = 전체 연출 감독 — 최우선]
- [최우선 화풍]에 적힌 스타일은 단순히 선, 색, 질감만 바꾸는 필터가 아닙니다. 15개 전체의 포즈, 몸의 선, 손동작, 시선, 카메라 앵글, 원근 과장, 소품 사용, 속도감, 효과선, 배경 장식, 감정 연출, 레터링의 형태까지 지배하는 전체 미술·연출 지침입니다.
- 각 감정과 문구의 의미는 그대로 유지하되, 행동 자체를 선택 화풍의 세계관과 연출 문법으로 다시 연기하세요. 일반적인 메신저 스티커의 뻔한 엄지척, 정면 서기, 단순 손흔들기 같은 기본 포즈로 평준화하지 마세요.
- 선택 화풍에 고유한 동작 언어가 있으면 적극적으로 사용하세요. 정적인 감정도 해당 화풍에서 자연스러운 자세, 호흡, 시선, 실루엣과 화면 구도로 표현하세요.
- 예: '전통 무협 만화풍'이면 고정 의상은 그대로 유지한 채 무협지의 한 장면처럼 연출하세요. 낮은 시점·사선 구도·과감한 원근, 장풍이나 기운을 연상시키는 먹선과 바람, 잔상·속도선, 절도 있는 무공 자세, 검객 같은 중심축과 손끝의 긴장, 강호 분위기의 여백과 먹 번짐을 사용하세요. 무협풍을 이유로 도복·한복·갑옷 등으로 의상을 교체하면 안 됩니다.
- 예: 수묵담채/동양화면 여백, 붓의 방향성, 먹 번짐, 절제된 동작과 서예적 화면 리듬까지 적용하세요. 크레파스 그림책이면 동작도 단순하고 장난스럽게, 손그림 낙서와 아동적인 시각 언어로 표현하세요. 펠트·자수·클레이 계열이면 포즈와 소품도 실제 수공예 인형이나 스톱모션 세트처럼 느껴지게 연출하세요. 열혈 배틀 만화면 극단적 원근, 강한 동세, 충돌 직전의 긴장과 속도선을 사용하세요.
- 화풍의 핵심 특징이 행동과 화면 연출에서 보이지 않으면 실패입니다. 결과를 보았을 때 캐릭터의 얼굴을 가려도 어떤 화풍을 선택했는지 느껴질 정도로 연출 차이를 분명히 하세요.

[레터링 연출]
- 따옴표 안의 한글 문구 철자와 띄어쓰기는 정확히 유지하되, 글자 디자인은 선택 화풍과 감정에 맞게 적극적으로 연출하세요.
- 모든 문구를 동일한 둥근 폰트·동일 굵기·동일 외곽선으로 찍어낸 듯 반복하지 마세요. 감정마다 크기, 기울기, 자간, 획의 힘, 배치 리듬과 작은 효과를 다르게 하되 한눈에 읽혀야 합니다.
- 전통 무협 만화풍이라면 붓글씨·서예·검획 같은 획의 긴장감, 먹 번짐, 강약 있는 붓터치와 기세를 살리고, 귀엽고 부드러운 화풍이라면 그 화풍에 맞는 둥글거나 손그림 같은 레터링을 사용하세요.
- 기존의 일반적인 '레터링 패밀리'나 스티커 기본 폰트보다 [최우선 화풍]과 각 문구의 감정이 우선합니다. 정확성과 가독성은 유지하면서도 딱딱한 템플릿 글자처럼 보이지 않게 하세요.\`;

    const enLock = \
\`[IDENTITY & OUTFIT LOCK — HIGHEST PRIORITY]
- Treat the appearance and outfit written in [FIXED CHARACTER INFORMATION] as immutable across all 15 stickers. Preserve the exact clothing type, colors, silhouette, length and defining details in every sticker.
- Never substitute clothing to match an action, emotion, occupation, location, prop or situation. A fighting pose must not become a martial-arts uniform; an office situation must not become a suit; a resting pose must not become sleepwear unless that outfit was explicitly selected.
- If both a reference photo and a separately specified outfit exist, the specified outfit controls clothing while the reference photo controls identity features such as face, hair and glasses.
- Do not create one-off costume changes or recolors. All 15 stickers must depict the same character in the same base outfit.
- Expressions and poses may vary strongly, but identity and fixed clothing must remain unchanged.\`;

    const enStyleDirector = \
\`[SELECTED ART STYLE = COMPLETE ART DIRECTION — HIGHEST PRIORITY]
- The exact text under [HIGHEST PRIORITY ART STYLE] is not merely a rendering filter for line, color and texture. It is the complete directing language for pose, gesture, gaze, body line, camera angle, foreshortening, props, motion, effects, decorative accents, emotional staging and typography across all 15 stickers.
- Preserve the meaning of each phrase, but re-stage the action through the selected style's own visual grammar. Do not collapse every phrase into generic messenger-sticker poses such as a plain thumbs-up, frontal standing pose or simple wave when the selected style has a distinctive action vocabulary.
- When a style has a recognizable movement language, actively use it. Even quiet emotions should inherit that style's posture, breathing, silhouette, framing and screen rhythm.
- Example: for a traditional wuxia comic style, KEEP THE FIXED OUTFIT UNCHANGED while staging each sticker like a frame from a classic martial-arts comic: dramatic low/high angles, diagonal composition, bold foreshortening, disciplined martial poses, swordplay-like body lines, qi/wind suggested through ink strokes, afterimages, speed lines, tension in fingertips and stance, jianghu-style negative space and ink energy. Never replace the fixed outfit with robes, martial-arts uniforms, armor or historical clothing merely because the style is wuxia.
- Example: ink-wash / East Asian painting should also control negative space, brush direction, gesture restraint and calligraphic screen rhythm. Crayon picture-book style should simplify acting into playful childlike gesture and hand-drawn visual language. Felt, embroidery or clay styles should stage poses and props like tactile handmade figures or stop-motion sets. Hot-blooded battle manga should push extreme perspective, explosive body motion, tension and speed-line choreography.
- If the selected style is visible only in surface texture while the pose, staging and typography remain generic, the result is a failure. The directing difference should be obvious even if the character's face were hidden.

[TYPOGRAPHY DIRECTION]
- Preserve the exact spelling and spacing of the quoted Korean phrase, but let typography strongly reflect both the selected art style and the emotion.
- Do not repeat the same rounded sticker font, weight, outline and placement for every phrase. Vary scale, tilt, spacing, stroke energy, rhythm and small effects while keeping the text immediately readable.
- For traditional wuxia comic style, use brush-calligraphy energy, sword-stroke tension, ink bleed and forceful stroke contrast. For softer or handmade styles, adapt lettering into the corresponding drawn, stitched, clay-like or gentle visual language.
- Selected art style and emotional expression outrank a generic sticker lettering family. Keep spelling and legibility exact, but avoid rigid template-like typography.\`;

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
