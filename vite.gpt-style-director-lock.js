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

    // Phrase/theme data may define WHAT only. Neutralize legacy sticker-style instructions
    // that accidentally seize HOW (pose, camera, effects, typography) from the selected art style.
    base = base
      .replaceAll('[HIGH-PRECISION KOREAN HANDWRITTEN STICKER TYPOGRAPHY]', '[HIGH-PRECISION KOREAN TEXT ACCURACY — TYPOGRAPHY SUBORDINATE TO SELECTED STYLE]')
      .replaceAll(
        '2. Place each phrase beside or above its character in readable, bold 2D pop-art sticker lettering with neat print-style Korean handwriting. Keep it warm and naturally hand-drawn; do not replace it with a mechanical Gothic/sans-serif typeface and do not use connected cursive strokes.',
        '2. Place each phrase beside or above its character with clear readability. The selected art style alone decides letterform character, stroke material, weight, tilt, spacing, color, outline, shadow, motion and finish. Do not impose generic pop-art, cute handwriting, Gothic/sans-serif, or stock sticker lettering.'
      )
      .replaceAll(
        '2. Place it beside or above the character in readable, bold 2D pop-art sticker lettering with neat print-style Korean handwriting. Keep it warm and naturally hand-drawn; do not replace it with a mechanical Gothic/sans-serif typeface and do not use connected cursive strokes.',
        '2. Place it beside or above the character with clear readability. The selected art style alone decides letterform character, stroke material, weight, tilt, spacing, color, outline, shadow, motion and finish. Do not impose generic pop-art, cute handwriting, Gothic/sans-serif, or stock sticker lettering.'
      )
      .replaceAll(
        '5. Add a crisp, thick pure-white die-cut outline outside the complete lettering and a subtle shadow without covering internal Hangul strokes.',
        '5. Preserve internal Hangul strokes clearly. Outline, border, shadow and edge treatment are optional style decisions and must follow the selected art style rather than a mandatory white die-cut sticker treatment.'
      )
      .replaceAll(
        '6. Use at most one small emotion-matching accent per phrase, such as a heart, crown, thumbs-up, confetti, bouquet, sweat drop, sparkle, or zZ. It must not touch or obscure any glyph.',
        '6. Use a small accent only when the phrase meaning genuinely needs one. Its material and visual language must be native to the selected art style; never fall back to a stock heart, crown, thumbs-up, confetti, sparkle or other generic sticker icon by default.'
      )
      .replaceAll(
        '- Preserve a cute, warm handwritten feeling, but use neat, clearly separated print-style handwriting rather than cursive or connected writing.',
        '- Preserve correct, clearly separated Hangul glyph anatomy. Do not impose a cute or warm handwriting mood; the selected art style decides whether the lettering feels brushy, inked, digital, rough, elegant, severe, playful or restrained.'
      )
      .replaceAll(
        '- Apply the white sticker outline outside each complete glyph only. Never fill or merge the internal spaces, short vowel strokes, or final consonants.',
        '- If the selected art style uses an outline, apply it outside each complete glyph without filling or merging internal spaces, short vowel strokes, or final consonants. Do not force a white sticker outline when it conflicts with the style.'
      )
      .replaceAll(
        '1. Render each text in a clean 2D commercial messenger pop sticker font.',
        '1. Render each text with exact spelling and clear readability while inheriting the selected art style’s typography language. Do not impose a generic 2D commercial messenger font.'
      )
      .replaceAll(
        '2. Text Style: Bold handwritten font filled with vibrant color (yellow, pink, red, mint, orange, purple, sky blue) + crisp inner stroke + heavy white die-cut sticker outline around the entire text.',
        '2. Text Style: Letterform, stroke, color, material, outline, shadow and motion are decided by the selected art style. Do not force a bright preset palette, bold handwriting, inner stroke, or white die-cut outline.'
      )
      .replaceAll(
        '5. Cute Accent Icons: Use at most one matching mini comic icon/effect beside the lettering without touching any glyph.',
        '5. Accent: Add at most one accent only if semantically necessary, and render it entirely through the selected art style rather than as a generic cute comic icon.'
      )
      .replaceAll(
        '각 문구에서 바로 이해할 수 있는 표정 하나와 서로 다른 전신 자세 하나를 구성하세요. 셀마다 보조 소품과 만화 효과는 각각 최대 하나만 사용하고 자세를 반복하지 마세요.',
        '각 문구는 말의 의미, 감정의 방향, 행동 목적과 상황적 맥락만 제공합니다. 구체적인 표정, 시선, 자세, 무게중심, 카메라 거리·앵글·원근, 효과, 소품의 시각화 방식과 문자 연출은 선택 화풍이 결정합니다. 15개 표현은 의미상 충분히 구별하되 특정 전신 포즈나 범용 이모티콘 자세를 미리 강제하지 마세요.'
      )
      .replaceAll('[문구·표정·동작]', '[문구 의미 — 연출 권한 없음]')
      .replaceAll('동일한 크기의 셀 15개에 완전한 캐릭터 한 명씩 배치하고', '15개의 보이지 않는 슬롯 각각에 하나의 완결된 캐릭터 표현을 배치하고')
      .replaceAll('잘린 신체', '의도치 않은 신체 절단·부자연스러운 크롭')
      .replace('메신저 이모티콘에 적합하도록 작은 화면에서도 식별 가능한 명확한 실루엣과 즉시 읽히는 표정·포즈를 유지하고,', '작은 화면에서도 식별 가능한 명확한 실루엣은 유지하되, 표정·포즈·장면 연출은 반드시 선택 화풍 고유의 연출 문법으로 구성하고,')
      .replace('For messenger-sticker use, keep a clear small-screen silhouette and instantly readable expression and pose.', 'Keep a clear small-screen silhouette, but stage expression, pose and scene strictly through the selected style’s own directing grammar.');

    base = base.split('\\n').map((line) => {
      if (line.startsWith('- 감정/동작:')) {
        return '- 의미/감정/상황: 원문에서 자연스럽게 해석합니다. 구체적인 표정·포즈·카메라·효과·문자 연출은 선택 화풍이 결정합니다.';
      }
      return line;
    }).join('\\n');

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

[테마/문구 = 의미 데이터 — 연출 권한 없음]
- 문구와 문구 테마는 WHAT만 제공합니다: 말의 의미, 감정의 방향, 행동 목적, 상황적 맥락, 그리고 의미상 꼭 필요한 대상·소품의 존재 여부까지입니다.
- 문구와 문구 테마는 구체적인 포즈, 표정의 그림 방식, 시선, 무게중심, 카메라 거리·화각·앵글·원근·단축, 효과 재료, 색상, 채색, 문자 서체·획·색·외곽선·배치를 지정하지 않습니다.
- 위 HOW 요소는 전부 현재 선택 화풍의 Rendering + Acting + Camera + Effects + Typography가 결정합니다.
- 문구 테마명은 문구 묶음을 선택하고 의미 맥락을 보조하는 분류 정보일 뿐, 새로운 장르나 두 번째 화풍 지시가 아닙니다.
- 예를 들어 '대박'은 강한 감탄이라는 의미만 제공하며, 놀라는 포즈·카메라·효과·문자 모양을 미리 정하지 않습니다. 그 표현 방식은 현재 화풍이 결정합니다.
- '귀엽게', '메신저답게', '축하답게', '학교답게', '게임답게' 같은 관습적 의미가 선택 화풍을 일반 2D 카툰이나 범용 스티커풍으로 되돌리면 실패입니다.
- 화풍을 사용자가 따로 선택하지 않았을 때만 자동 지정된 기본 2D 화풍이 이 전체 연출 감독 역할을 합니다. 사용자가 화풍을 선택했다면 그 선택 화풍 외의 기본 렌더링 문법은 개입하지 않습니다.
- 캐릭터 정체성, 얼굴의 식별 특징과 고정 의상은 연출 대상이 아니라 불변 조건입니다. 화풍·문구·행동 때문에 다른 인물이나 다른 의상으로 바꾸지 마세요.

[우선순위]
- 불변 레이어: 캐릭터 정체성 + 고정 의상은 절대 변경하지 않습니다.
- 연출 레이어: 선택 화풍 > 문구의 의미 > 레이아웃·기술 제약 순으로 해석합니다.
- 문구의 의미가 선택 화풍의 표현 방식을 수정하거나 대체해서는 안 됩니다.

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

[PHRASE/THEME = SEMANTIC DATA — NO DIRECTING AUTHORITY]
- A phrase and its phrase-theme provide WHAT only: verbal meaning, emotional direction, action purpose, situational context, and only the existence of a prop/object when semantically necessary.
- They do not prescribe concrete pose, facial rendering, gaze, weight distribution, camera distance/angle/perspective/foreshortening, effect material, color treatment, or typography style.
- Every HOW decision belongs to the selected art style's Rendering + Acting + Camera + Effects + Typography.
- Phrase-theme names are classification/semantic context for choosing phrase sets, not a second genre or second art-style instruction.
- Generic cues such as cute, messenger-like, celebration, school or gaming must never pull a selected style back toward generic 2D cartoon or stock sticker language.
- Only when no art style was selected may the automatically assigned default 2D style act as the director. A user-selected style must never be diluted by the default rendering language.
- Character identity, recognizable facial traits and fixed outfit are immutable constraints, not style variables.

[PRIORITY]
- Immutable layer: character identity + fixed outfit.
- Direction layer: selected art style > phrase meaning > layout/technical constraints.
- Phrase meaning must never modify or replace the selected style's directing method.

\${enText}\`;

    const finalKo = \
\`[최종 화풍 판정]
문구가 달라져도 ①작화 ②동작 ③카메라 ④효과 ⑤문자가 모두 같은 선택 화풍의 DNA를 유지해야 합니다. 글자를 가려도 화풍이 느껴지고, 캐릭터를 가리고 문자만 보아도 같은 화풍이 느껴져야 합니다. 문구 때문에 범용 손하트·엄지척·점프·고개 숙임 같은 스티커 클리셰나 고정 팝아트 문자로 평균화되면 실패입니다.\`;
    const finalEn = '[FINAL STYLE TEST] Across phrase changes, rendering, acting, camera, effects and typography must all preserve one style DNA. The style should remain recognizable from the staging without text and from the lettering without the character. If phrases collapse the set into stock sticker poses, generic icons or one fixed pop-lettering style, the result fails.';

    return (isKo ? ko : en) + '\\n\\n' + base + '\\n\\n' + (isKo ? finalKo : finalEn);
  };

${helperMarker}`;

      out = replaceOnce(out, helperMarker, helper, 'helper injection');
      return { code: out, map: null };
    },
  };
}
