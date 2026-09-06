const TARGET = '/src/App.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[grok-style-director-lock] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[grok-style-director-lock] ${label} marker is not unique`);
  }
  return source.slice(0, first) + replacement + source.slice(first + marker.length);
};

const replaceCount = (source, marker, replacement, expected, label) => {
  const parts = source.split(marker);
  const count = parts.length - 1;
  if (count !== expected) {
    throw new Error(`[grok-style-director-lock] ${label} expected ${expected} occurrence(s), found ${count}`);
  }
  return parts.join(replacement);
};

export function grokStyleDirectorLockPlugin() {
  return {
    name: 'grok-style-director-lock',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null;

      let out = code;
      const helperMarker = `  const getPreviewPrompt = () => {`;
      const helper = `  const optimizeGrokStyleDirector = (prompt) => {
    let base = String(prompt || '');
    const styleName = getSelectedArtStyle();
    const isKo = lang === 'ko';
    const textEnabled = grokTextMode === 'text';

    base = base
      .replace('선택한 화풍의 핵심 선·채색·질감을 유지하면서 메신저 이모티콘처럼 감정과 행동이 즉시 읽히게 연출하세요.', '선택 화풍의 고유한 연출 문법 안에서만 감정과 행동을 연기하세요. 일반 메신저 스티커의 보편적 포즈·카메라·효과로 되돌아가지 마세요.')
      .replace('Preserve the essential line, color and texture language of the selected style while keeping messenger-sticker emotion immediately readable.', 'Make emotion readable only through the selected style’s own directing grammar. Do not fall back to generic messenger-sticker posing, camera or effects.');

    const koText = textEnabled
      ? \
\`[문자 = 화풍 연출]
- 지정 문구의 철자와 띄어쓰기를 정확히 유지하고 각 문구는 해당 스티커에서 정확히 1회만 출력하세요.
- 가독성은 획일적인 기본 스티커 폰트를 뜻하지 않습니다. 글자 형태, 획의 재료감, 굵기 변화, 기울기, 자간, baseline, 크기 대비, 배치 방향, 속도감과 주변 효과까지 현재 화풍의 시각 언어를 따라야 합니다.
- 감정은 같은 화풍 내부에서 글자의 연기만 변화시킵니다. 웃음·흥분·분노·당황·위로·감동 등 문구마다 힘, 리듬, 간격과 흐름을 달리하되 다른 폰트 세계로 이동하지 마세요.
- 캐릭터를 가리고 글자만 보아도 현재 화풍이 느껴져야 합니다.\`
      : '[문자 미포함 유지] 현재 모드는 글자 미포함입니다. Typography 연출 원칙 때문에 글자나 의미 없는 기호를 새로 만들지 마세요.';

    const enText = textEnabled
      ? \
\`[TYPOGRAPHY = STYLE DIRECTION]
- Preserve the assigned phrase exactly and render it exactly once on its sticker.
- Readability does not mean a uniform generic sticker font. Letterform shape, stroke material, weight variation, tilt, spacing, baseline, scale contrast, placement, motion and surrounding effects must inherit the current art style.
- Emotion changes lettering performance only inside the same style world. Vary force, rhythm, spacing and flow without switching to another generic font family.
- If the character is hidden, the lettering alone should still reveal the selected art style.\`
      : '[KEEP NO-TEXT MODE] Do not introduce lettering or meaningless symbols merely because typography is part of art direction.';

    const ko = \
\`[화풍 = 전체 연출 감독 — 절대 최우선]
현재 적용 화풍: \${styleName}
- 이 화풍은 선·채색·질감만 바꾸는 표면 필터가 아닙니다. Rendering + Acting + Camera + Effects + Typography 전체를 지배하는 하나의 작품 세계이자 연출 문법입니다.
- 먼저 이 화풍의 세계와 시각 문법을 확정한 뒤 모든 문구를 그 세계 안에서 연기하세요. 일반 스티커 장면을 먼저 만든 다음 화풍을 덧씌우는 방식은 금지합니다.
- Rendering: 선, 형태, 비율, 채색, 질감, 재질, 조명과 마감은 현재 화풍의 고유 문법을 유지합니다.
- Acting: 표정, 시선, 손동작, 몸의 방향, 무게중심, 자세, 긴장과 이완을 현재 화풍에서 실제 사용할 법한 몸짓 어휘로 재해석합니다.
- Camera: 정면 흉상에 고정하지 말고 현재 화풍과 행동에 맞는 전신·반신·근접, 로우/하이/사선, 원근과 단축을 선택합니다.
- Effects: 속도선, 먹, 바람, 빛, 반짝임, 충격, 하트, 땀, 상징 등은 범용 이모지나 스톡 그래픽이 아니라 현재 화풍의 재료와 효과 언어로 표현합니다.
- Typography: 문자는 별도 장식이 아니라 같은 장면의 연출 요소이며 현재 화풍의 재료, 획, 리듬과 동세를 공유합니다.
- 문구/테마는 WHAT만 결정합니다: 의미, 감정, 행동, 상황과 필요한 소품. HOW인 화풍, 장르, 시대감, 카메라 문법, 효과 언어, 문자 스타일은 바꾸지 못합니다.
- 축하, 학교, 게임, 음식, 계절, 운동 같은 문구 소재 때문에 선택 화풍이 일반 2D 카툰이나 범용 메신저 스티커풍으로 약해지면 실패입니다.
- 화풍을 따로 선택하지 않았을 때만 자동 지정된 기본 2D 화풍이 이 전체 연출 감독 역할을 합니다. 사용자가 화풍을 선택했다면 기본 2D의 렌더링·포즈·카메라·문자 문법은 개입하지 않습니다.
- 캐릭터 정체성, 얼굴의 식별 특징과 고정 의상은 불변 조건입니다. 화풍·문구·행동 때문에 다른 인물이나 다른 의상으로 바꾸지 마세요.

\${koText}\`;

    const en = \
\`[ART STYLE = COMPLETE DIRECTOR — ABSOLUTE PRIORITY]
Current art style: \${styleName}
- Art style is not a surface filter for linework, color or texture. It is one coherent world controlling Rendering + Acting + Camera + Effects + Typography.
- Establish this style world first, then perform every phrase inside it. Never build a generic sticker scene first and apply style afterward.
- Rendering: preserve the style's linework, form, proportions, coloring, texture, material, lighting and finish.
- Acting: reinterpret expression, gaze, gesture, body direction, weight, tension and pose through the movement vocabulary native to the style.
- Camera: do not default to frontal bust shots. Choose full, medium or close framing, angle, perspective and foreshortening according to the action and the style's visual grammar.
- Effects: redraw motion lines, ink, wind, light, sparkles, impact, hearts, sweat and symbols in the current style instead of stock emoji or generic sticker graphics.
- Typography: lettering is part of the same scene direction and shares the style's material, stroke, rhythm and motion.
- Phrase/theme controls WHAT only: meaning, emotion, action, situation and necessary props. It must never replace HOW: art style, genre, era, camera grammar, effect language or typography family.
- Celebration, school, gaming, food, season or sports themes must never dilute a selected style into generic 2D cartoon or stock messenger-sticker language.
- Only when no art style was selected may the automatically assigned default 2D style act as director. A user-selected style must never be diluted by default 2D rendering, posing, camera or typography language.
- Character identity, recognizable facial traits and fixed outfit are immutable constraints, not style variables.

\${enText}\`;

    const finalKo = \
\`[최종 화풍 판정]
문구가 달라져도 ①작화 ②동작 ③카메라 ④효과 ⑤문자가 모두 같은 선택 화풍의 DNA를 유지해야 합니다. 글자를 가려도 화풍이 느껴지고, 캐릭터를 가리고 문자만 보아도 같은 화풍이 느껴져야 합니다.\`;
    const finalEn = '[FINAL STYLE TEST] Across phrase changes, rendering, acting, camera, effects and typography must all preserve one style DNA. The style should remain recognizable from staging without text and from lettering without the character.';

    return (isKo ? ko : en) + '\\n\\n' + base + '\\n\\n' + (isKo ? finalKo : finalEn);
  };

${helperMarker}`;

      out = replaceOnce(out, helperMarker, helper, 'helper injection');
      const marker = `optimizeModelPromptV4(generateGrokPrompt(phraseOverride), 'grok')`;
      const replacement = `optimizeGrokStyleDirector(optimizeModelPromptV4(generateGrokPrompt(phraseOverride), 'grok'))`;
      out = replaceCount(out, marker, replacement, 3, 'Grok prompt wrapping');

      return { code: out, map: null };
    },
  };
}
