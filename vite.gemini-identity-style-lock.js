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
- [캐릭터 고정 정보]에 적힌 외형과 의상은 15개 전체에서 변경 금지입니다. 의상 항목에 지정된 옷의 종류, 색상, 실루엣, 길이, 주요 디테일을 모든 스티커에서 동일하게 유지하세요.
- 감정, 행동, 직업, 장소, 소품 또는 상황이 다른 복장을 암시하더라도 절대 의상을 바꾸지 마세요. 격투·운동 동작이어도 도복이나 운동복으로, 업무 상황이어도 정장으로, 휴식 상황이어도 잠옷으로 자동 변경하지 마세요.
- 참고 사진과 별도 의상 지정이 함께 있으면 별도 지정 의상을 우선하고, 얼굴·헤어·안경 등 정체성 특징만 참고 사진에서 유지하세요.
- 한 스티커만 다른 의상을 쓰거나 색을 바꾸는 변형도 금지합니다. 15개 모두 같은 캐릭터, 같은 기본 의상이어야 합니다.
- 감정과 포즈는 크게 바꿔도 되지만 캐릭터 정체성과 고정 의상은 바꾸지 마세요.\`;

    const koStyleDirector = \
\`[선택 화풍 = 전체 연출 감독 — 최우선]
- [최우선 화풍]은 선·색·질감만 바꾸는 필터가 아닙니다. 포즈, 몸의 선, 손동작, 시선, 카메라 앵글, 원근 과장, 소품, 속도감, 효과선, 여백, 감정 연기와 레터링까지 지배하는 전체 연출 지침입니다.
- 각 문구의 의미는 유지하되 행동 자체를 선택 화풍의 시각 문법으로 다시 연기하세요. 일반적인 엄지척, 정면 서기, 단순 손흔들기 같은 메신저 스티커 기본 포즈로 평준화하지 마세요.
- 선택 화풍에 고유한 동작 언어가 있으면 적극적으로 사용하고, 정적인 감정도 그 화풍에 맞는 자세·호흡·시선·실루엣·화면 구도로 표현하세요.
- 전통 무협 만화풍이면 고정 의상은 그대로 둔 채 무협지 한 장면처럼 연출하세요. 낮은 시점·높은 시점·사선 구도·과감한 원근, 장풍과 기운을 연상시키는 먹선과 바람, 잔상·속도선, 절도 있는 무공 자세, 검객 같은 중심축과 손끝의 긴장, 강호 분위기의 여백과 먹 번짐을 사용하세요. 무협풍을 이유로 도복·한복·갑옷으로 의상을 바꾸면 안 됩니다.
- 수묵담채/동양화는 여백·붓 방향·먹 번짐·절제된 동작·서예적 화면 리듬까지, 크레파스 그림책은 장난스럽고 단순한 몸짓과 손그림 리듬까지, 펠트·자수·클레이는 실제 수공예 인형이나 스톱모션 세트 같은 포즈와 소품까지, 열혈 배틀 만화는 극단적 원근·폭발적 동세·충돌 직전의 긴장까지 적용하세요.
- 화풍 차이가 표면 질감에만 남고 포즈·카메라·효과·레터링이 평범하면 실패입니다.

[감정형 레터링 — 딱딱한 템플릿 금지]
- 따옴표 안의 한글 철자와 띄어쓰기는 정확히 유지하되, 글자 자체도 캐릭터처럼 감정을 연기해야 합니다.
- 모든 문구를 같은 폰트, 같은 굵기, 같은 크기, 같은 외곽선, 같은 직선 정렬로 반복하지 마세요.
- 감정에 따라 글자의 크기 변화, 기울기, 자간, 줄의 높낮이, 획의 강약, 흔들림, 튀는 리듬, 눌리는 리듬, 작은 효과를 자연스럽게 달리하세요.
- 웃음·신남은 통통 튀고 약간 비틀리거나 상승하는 손글씨 리듬, 놀람·당황은 크기 차와 불안정한 기울기, 분노·격정은 거칠고 빠른 획과 강한 방향성, 슬픔·미안함은 힘이 빠지고 처지는 흐름, 감동·따뜻함은 부드럽고 여유 있는 획과 넓은 호흡처럼 감정별 성격을 다르게 주세요.
- 전통 무협 만화풍도 모든 문구를 무겁고 각진 서예 제목처럼 만들지 마세요. 붓의 기세·먹의 강약·검획 느낌은 화풍의 맛으로 사용하되, 문구의 감정에 따라 유쾌하고 가볍게 튀거나, 작게 머뭇거리거나, 크게 폭발하는 등 리듬을 자유롭게 바꾸세요.
- 문자는 캐릭터 주변의 빈 공간에 자연스럽게 떠 있어야 하며 포스터 제목, 간판, 로고, 배지처럼 정형화하지 마세요.
- 문자 뒤에 사각형·둥근 사각형·라벨판·배너·캡션 박스 같은 배경판을 만들지 마세요. 글자는 흰 캔버스 위에 직접 배치하세요.
- 정확성과 가독성은 유지하되, 가장 중요한 목표는 각 문구의 감정과 선택 화풍이 동시에 느껴지는 살아있는 손맛입니다.\`;

    const enLock = \
\`[IDENTITY & OUTFIT LOCK — HIGHEST PRIORITY]
- Treat the appearance and outfit written in [FIXED CHARACTER INFORMATION] as immutable across all 15 stickers. Preserve clothing type, colors, silhouette, length and defining details in every sticker.
- Never substitute clothing to match an action, emotion, occupation, location, prop or situation. Fighting must not create martial-arts uniforms, office scenes must not create suits, and resting must not create sleepwear unless explicitly selected.
- If both a reference photo and a separately specified outfit exist, the specified outfit controls clothing while the reference photo controls identity features such as face, hair and glasses.
- Do not create one-off costume changes or recolors. All 15 stickers depict the same character in the same base outfit.
- Expressions and poses may vary strongly, but identity and fixed clothing must remain unchanged.\`;

    const enStyleDirector = \
\`[SELECTED ART STYLE = COMPLETE ART DIRECTION — HIGHEST PRIORITY]
- The exact text under [HIGHEST PRIORITY ART STYLE] is not merely a surface filter. It directs pose, gesture, gaze, body line, camera angle, foreshortening, props, motion, effects, negative space, emotional staging and typography across all 15 stickers.
- Preserve each phrase meaning but re-stage its action through the selected style's visual grammar. Do not collapse phrases into generic messenger-sticker poses.
- When a style has a recognizable movement language, use it actively. Even quiet emotions inherit that style's posture, silhouette, framing and screen rhythm.
- For traditional wuxia comic style, KEEP THE FIXED OUTFIT UNCHANGED while staging each sticker like a classic martial-arts comic frame: dramatic low/high angles, diagonal composition, bold foreshortening, disciplined martial poses, swordplay-like body lines, qi/wind through ink strokes, afterimages, speed lines, fingertip and stance tension, jianghu negative space and ink energy. Never replace fixed clothing with robes, martial-arts uniforms, armor or historical clothing.
- Ink-wash styles also control negative space and gesture restraint; crayon picture-book styles control playful childlike acting; felt, embroidery and clay styles stage like tactile handmade figures; hot-blooded battle manga pushes extreme perspective and explosive choreography.
- If style appears only as surface texture while pose, camera, effects and typography remain generic, the result is a failure.

[EMOTION-DRIVEN LETTERING — NO RIGID TEMPLATE]
- Preserve the exact Korean spelling and spacing, but the lettering itself must act out the emotion.
- Do not repeat one font, weight, size, outline, baseline or rigid alignment across all phrases.
- Vary scale, tilt, spacing, baseline rhythm, stroke pressure, wobble and small accents according to emotion.
- Laughter and excitement can bounce and rise; surprise and awkwardness can become uneven and hesitant; anger can use fast forceful strokes; sadness can droop and soften; warmth and gratitude can breathe with gentler wider strokes.
- Even in traditional wuxia style, do not turn every phrase into a heavy formal calligraphy title. Use brush energy, ink pressure and sword-stroke flavor as stylistic ingredients while allowing each emotion to remain playful, shy, explosive, soft or light as appropriate.
- Lettering should float naturally around the character, not behave like a poster headline, logo, badge or sign.
- Do NOT place text on rectangular or rounded-rectangle plaques, banners, labels, caption boxes or background cards. Put the lettering directly on the plain canvas.
- Keep spelling and readability exact while prioritizing lively emotional rhythm and hand-made character.\`;

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
