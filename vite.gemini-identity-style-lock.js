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
\`[정체성·의상·화풍 고정 — 최우선]
- [캐릭터 고정 정보]에 적힌 외형과 의상은 15개 전체에서 변경 금지입니다. 의상 항목에 지정된 옷의 종류, 색상, 실루엣, 길이, 주요 디테일을 모든 스티커에서 동일하게 유지하세요.
- 감정, 행동, 직업, 장소, 소품 또는 상황이 다른 복장을 암시하더라도 절대 의상을 바꾸지 마세요. 예를 들어 격투·운동 동작이 있어도 도복이나 운동복으로, 업무 상황이어도 정장으로, 휴식 상황이어도 잠옷으로 자동 변경하지 마세요.
- 참고 사진과 별도 의상 지정이 함께 있으면 별도 지정 의상을 우선하고, 얼굴·헤어·안경 등 정체성 특징만 참고 사진에서 유지하세요.
- 한 스티커 안에서만 다른 의상을 쓰거나 색을 바꾸는 변형도 금지합니다. 15개 모두 같은 캐릭터, 같은 기본 의상이어야 합니다.
- [최우선 화풍]에 적힌 스타일 문장을 절대적인 렌더링 기준으로 사용하세요. 선의 성격, 채색 방식, 재질감, 명암, 비율, 조명, 질감, 브러시/펜 터치와 효과 표현을 15개 전체에 동일하게 적용하세요.
- '웹툰', '만화', '스티커', '이모티콘' 같은 일반 장르 표현은 선택 화풍을 대체하는 기본 스타일이 아닙니다. 선택한 화풍이 한국 웹툰이 아닌 경우 일반적인 한국 웹툰/셀 셰이딩 스타일로 평준화하지 마세요.
- 감정과 포즈는 크게 바꿔도 되지만 캐릭터 디자인, 의상, 선택 화풍 자체는 바꾸지 마세요.\`;

    const enLock = \
\`[IDENTITY, OUTFIT & SELECTED STYLE — HIGHEST PRIORITY]
- Treat the appearance and outfit written in [FIXED CHARACTER INFORMATION] as immutable across all 15 stickers. Preserve the exact clothing type, colors, silhouette, length and defining details in every sticker.
- Never substitute clothing to match an action, emotion, occupation, location, prop or situation. A fighting pose must not become a martial-arts uniform; an office situation must not become a suit; a resting pose must not become sleepwear unless that outfit was explicitly selected.
- If both a reference photo and a separately specified outfit exist, the specified outfit controls clothing while the reference photo controls identity features such as face, hair and glasses.
- Do not create one-off costume changes or recolors. All 15 stickers must depict the same character in the same base outfit.
- Treat the exact text under [HIGHEST PRIORITY ART STYLE] as the binding rendering specification. Apply its line quality, coloring method, texture, shading, proportions, lighting, brush/pen character and effects consistently across all 15 stickers.
- Generic terms such as webtoon, comic, sticker or emoticon are not substitute styles. Do not collapse the selected style into generic Korean webtoon/cel-shaded sticker art unless that is the style explicitly selected.
- Expressions and poses may vary strongly, but character design, outfit and selected art style must remain fixed.\`;

    return base + '\\n\\n' + (lang === 'ko' ? koLock : enLock);
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
