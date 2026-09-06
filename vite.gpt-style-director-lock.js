const TARGET = '/src/App.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[gpt-style-director-lock] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[gpt-style-director-lock] ${label} marker is not unique`);
  }
  return source.slice(0, first) + replacement + source.slice(first + marker.length);
};

export function gptStyleDirectorLockPlugin() {
  return {
    name: 'gpt-style-director-lock',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null;

      let out = code;
      let wrappedCalls = 0;
      out = out.replace(/generateGptPrompt\(([^()]*)\)/g, (match) => {
        wrappedCalls += 1;
        return `optimizeGptStyleDirector(${match})`;
      });
      if (wrappedCalls < 1) {
        throw new Error('[gpt-style-director-lock] no generateGptPrompt call sites found');
      }

      const helperMarker = `  const getPreviewPrompt = () => {`;
      const helper = `  const optimizeGptStyleDirector = (prompt) => {
    let base = String(prompt || '');
    const styleName = getSelectedArtStyle();
    const isKo = lang === 'ko';
    const textEnabled = gptTextMode === 'text';

    base = base
      .replace('메신저 이모티콘에 적합하도록 작은 화면에서도 식별 가능한 명확한 실루엣과 즉시 읽히는 표정·포즈를 유지하고,', '작은 화면에서도 식별 가능한 명확한 실루엣은 유지하되, 표정·포즈·장면 연출은 반드시 선택 화풍 고유의 연출 문법으로 구성하고,')
      .replace('For messenger-sticker use, keep a clear small-screen silhouette and instantly readable expression and pose.', 'Keep a clear small-screen silhouette, but stage expression, pose and scene strictly through the selected style’s own directing grammar.');

    const koText = textEnabled
      ? \
\`[문자 = 화풍 연출]
- 한글 원문의 철자와 띄어쓰기는 정확히 유지하고 각 문구는 지정 슬롯에서 정확히 1회만 출력하세요.
- 정확성과 가독성은 글자를 획일적인 기본 스티커 폰트로 만들라는 뜻이 아닙니다. 글자 형태, 획의 재료감, 굵기 변화, 기울기, 자간, 행간, baseline, 크기 대비, 배치 방향, 속도감과 주변 효과까지 현재 화풍의 시각 언어를 따라야 합니다.
- 감정은 화풍을 바꾸지 않고 같은 화풍 안에서 글자의 연기만 변화시킵니다. 웃음·흥분·분노·당황·위로·감동 등 문구마다 힘, 리듬, 간격과 흐름을 달리하되 다른 폰트 세계로 이동하지 마세요.
- 캐릭터를 가리고 글자만 보아도 현재 화풍이 느껴져야 합니다.\`
      : '[문자 미포함 유지] 현재 모드는 글자 미포함입니다. Typography 연출 원칙 때문에 글자나 의미 없는 기호를 새로 만들지 마세요.';

    const enText = textEnabled
      ? \
\`[TYPOGRAPHY = STYLE DIRECTION]
- Preserve the exact source phrase and spacing and render each assigned phrase exactly once.
- Accuracy and readability do not mean falling back to one uniform generic sticker font. Letterform shape, stroke material, weight variation, tilt, spacing, baseline, scale contrast, placement, motion and surrounding effects must inherit the current art style.
- Emotion changes lettering performance only inside the same style world. Vary force, rhythm, spacing and flow without switching to a different generic font family.
- If the character is hidden, the lettering alone should still reveal the selected art style.\`
      : '[KEEP NO-TEXT MODE] Do not introduce lettering or meaningless symbols merely because typography is part of art direction.';

    const ko = \
\`[화풍 = 전체 연출 감독 — 절대 최우선]
현재 적용 화풍: \${styleName}
- 이 화풍은 단순히 선·채색·질감을 바꾸는 표면 필터가 아닙니다. Rendering + Acting + Camera + Effects + Typography 전체를 지배하는 하나의 작품 세계이자 연출 문법입니다.
- 모든 결과는 먼저 이 화풍의 세계를 확정한 뒤 그 안에서 문구를 연기하세요. 일반 이모티콘 장면을 먼저 만든 후 화풍을 덧씌우는 방식은 금지합니다.
- Rendering: 선, 형태, 비율, 채색, 질감, 재질, 조명과 마감은 현재 화풍을 끝까지 유지합니다.
- Acting: 표정, 시선, 손동작, 몸의 방향, 무게중심, 자세, 긴장과 이완은 현재 화풍에서 실제로 사용할 법한 연기 어휘로 재해석합니다.
- Camera: 정면 흉상에 고정하지 말고 현재 화풍에 맞는 전신·반신·근접, 로우/하이/사선, 원근과 단축을 문구 행동에 맞게 선택합니다.
- Effects: 속도선, 먹, 바람, 빛, 반짝임, 충격, 하트, 땀, 상징 등은 스톡 이모지나 범용 그래픽이 아니라 현재 화풍의 재료와 효과 언어로 표현합니다.
- Typography: 문자는 별도 장식이 아니라 같은 장면의 연출 요소이며 현재 화풍의 재료, 획, 리듬과 동세를 공유합니다.
- 문구/테마는 WHAT만 결정합니다: 의미, 감정, 행동, 상황과 필요한 소품. 문구/테마가 HOW인 화풍, 장르, 시대감, 카메라 문법, 효과 언어, 문자 스타일을 바꾸면 실패입니다.
- '귀엽게', '메신저답게', '축하답게', '학교답게', '게임답게' 같은 의미가 선택 화풍을 일반 2D 카툰이나 범용 스티커풍으로 되돌리면 안 됩니다.
- 화풍을 사용자가 따로 선택하지 않았을 때만 자동 지정된 기본 2D 화풍이 이 전체 연출 감독 역할을 합니다. 사용자가 화풍을 선택했다면 그 선택 화풍 외의 기본 렌더링 문법은 개입하지 않습니다.
- 캐릭터 정체성, 얼굴의 식별 특징과 고정 의상은 연출 대상이 아니라 불변 조건입니다. 화풍·문구·행동 때문에 다른 인물이나 다른 의상으로 바꾸지 마세요.

\${koText}\`;

    const en = \
\`[ART STYLE = COMPLETE DIRECTOR — ABSOLUTE PRIORITY]
Current art style: \${styleName}
- The art style is not a surface filter for linework, color or texture. It is one coherent world that controls Rendering + Acting + Camera + Effects + Typography.
- Establish this style world first, then perform every phrase inside it. Never build a generic sticker scene first and apply the style afterward.
- Rendering: preserve the style's linework, form, proportions, coloring, texture, material, lighting and finish.
- Acting: reinterpret expression, gaze, gesture, body direction, weight, tension and pose through the movement vocabulary native to this style.
- Camera: do not default to frontal bust shots. Choose full, medium or close framing, angle, perspective and foreshortening according to the action and the style's visual grammar.
- Effects: redraw motion lines, ink, wind, light, sparkles, impact, hearts, sweat and symbols in the current style rather than using stock emoji or generic sticker graphics.
- Typography: lettering is part of the same scene direction and shares the style's material, stroke, rhythm and motion.
- Phrase/theme controls WHAT only: meaning, emotion, action, situation and necessary props. It must never replace HOW: art style, genre, era, camera grammar, effect language or typography family.
- Generic cues such as cute, messenger-like, celebration, school or gaming must never pull a selected style back toward generic 2D cartoon or stock sticker language.
- Only when no art style was selected may the automatically assigned default 2D style act as the director. A user-selected style must never be diluted by the default rendering language.
- Character identity, recognizable facial traits and fixed outfit are immutable constraints, not style variables.

\${enText}\`;

    const finalKo = \
\`[최종 화풍 판정]
문구가 달라져도 ①작화 ②동작 ③카메라 ④효과 ⑤문자가 모두 같은 선택 화풍의 DNA를 유지해야 합니다. 글자를 가려도 화풍이 느껴지고, 캐릭터를 가리고 문자만 보아도 같은 화풍이 느껴져야 합니다.\`;
    const finalEn = '[FINAL STYLE TEST] Across phrase changes, rendering, acting, camera, effects and typography must all preserve one style DNA. The style should remain recognizable from the staging without text and from the lettering without the character.';

    return (isKo ? ko : en) + '\\n\\n' + base + '\\n\\n' + (isKo ? finalKo : finalEn);
  };

${helperMarker}`;

      out = replaceOnce(out, helperMarker, helper, 'helper injection');
      return { code: out, map: null };
    },
  };
}
