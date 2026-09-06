const TARGET = '/src/App.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[model-prompt-v4] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[model-prompt-v4] ${label} marker is not unique`);
  }
  return source.slice(0, first) + replacement + source.slice(first + marker.length);
};

const replaceCount = (source, marker, replacement, expected, label) => {
  const parts = source.split(marker);
  const count = parts.length - 1;
  if (count !== expected) {
    throw new Error(`[model-prompt-v4] ${label} expected ${expected} occurrence(s), found ${count}`);
  }
  return parts.join(replacement);
};

export function modelPromptPriorityV4Plugin() {
  return {
    name: 'model-prompt-priority-v4',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null;

      let out = code;
      const helperMarker = `  const getPreviewPrompt = () => {`;
      const helper = `  const optimizeModelPromptV4 = (prompt, model) => {
    if (model !== 'gemini' && model !== 'grok') return prompt;

    const isSingle = generationMode === 'individual' || generationMode === 'batch';
    const textEnabled = model === 'gemini' ? geminiTextMode === 'text' : grokTextMode === 'text';
    let base = String(prompt || '');

    // Keep phrase/theme data semantic-only. Legacy pose/typography prescriptions are
    // normalized so the selected art style retains full directing authority.
    base = base
      .replaceAll('[HIGH-PRECISION KOREAN HANDWRITTEN STICKER TYPOGRAPHY]', '[HIGH-PRECISION KOREAN TEXT ACCURACY — TYPOGRAPHY SUBORDINATE TO SELECTED STYLE]')
      .replaceAll(
        '2. Place each phrase beside or above its character in readable, bold 2D pop-art sticker lettering with neat print-style Korean handwriting. Keep it warm and naturally hand-drawn; do not replace it with a mechanical Gothic/sans-serif typeface and do not use connected cursive strokes.',
        '2. Place each phrase beside or above its character with clear readability. Letterform, stroke material, weight, tilt, spacing, color, outline, shadow, motion and finish are decided by the selected art style. Do not impose generic pop-art, cute handwriting, Gothic/sans-serif, or stock sticker lettering.'
      )
      .replaceAll(
        '2. Place it beside or above the character in readable, bold 2D pop-art sticker lettering with neat print-style Korean handwriting. Keep it warm and naturally hand-drawn; do not replace it with a mechanical Gothic/sans-serif typeface and do not use connected cursive strokes.',
        '2. Place it beside or above the character with clear readability. Letterform, stroke material, weight, tilt, spacing, color, outline, shadow, motion and finish are decided by the selected art style. Do not impose generic pop-art, cute handwriting, Gothic/sans-serif, or stock sticker lettering.'
      )
      .replaceAll(
        '5. Add a crisp, thick pure-white die-cut outline outside the complete lettering and a subtle shadow without covering internal Hangul strokes.',
        '5. Preserve internal Hangul strokes clearly. Outline, border, shadow and edge treatment are optional and must follow the selected art style rather than a mandatory white die-cut treatment.'
      )
      .replaceAll(
        '6. Use at most one small emotion-matching accent per phrase, such as a heart, crown, thumbs-up, confetti, bouquet, sweat drop, sparkle, or zZ. It must not touch or obscure any glyph.',
        '6. Use an accent only when the phrase meaning genuinely needs one, and render it through the selected art style rather than as a stock sticker icon.'
      )
      .replaceAll(
        '- Preserve a cute, warm handwritten feeling, but use neat, clearly separated print-style handwriting rather than cursive or connected writing.',
        '- Preserve correct, clearly separated Hangul glyph anatomy. Do not impose a cute or warm handwriting mood; the selected art style determines the lettering character and material.'
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
      .replaceAll('잘린 신체', '의도치 않은 신체 절단·부자연스러운 크롭');

    base = base.split('\\n').map((line) => {
      if (line.startsWith('- 감정/동작:')) {
        return '- 의미/감정/상황: 원문에서 자연스럽게 해석합니다. 구체적인 표정·포즈·카메라·효과·문자 연출은 선택 화풍이 결정합니다.';
      }
      if (line.includes(' | 동작=') && line.includes(' | 타이포=')) {
        const head = line.split(' | 동작=')[0];
        return head + ' | 의미=원문 의미·감정·상황만 전달; HOW는 선택 화풍이 결정';
      }
      if (line.startsWith('Sticker ') && line.includes(' – ')) {
        return line.split(' – ')[0] + ' – semantic meaning/emotion/context only; pose, camera, effects and typography are decided by the selected art style';
      }
      return line;
    }).join('\\n');

    const geminiLayoutV51 = \
\`[LAYOUT & STRICT SPATIAL RULES — HIGHEST PRIORITY]

- Canvas Orientation: WIDE LANDSCAPE format.
- Grid Format: A wide landscape sticker sheet strictly arranged in a 5-column by 3-row grid (5 columns × 3 rows = exactly 15 stickers).
- Absolute Quantity Constraint: Exactly 15 stickers. Never 12, never 14, never 16. Total sticker count MUST be exactly 15.
- Size vs. Count Priority: If horizontal or vertical space is limited, ALWAYS REDUCE THE SIZE OF EACH CHARACTER. Never reduce, remove, merge, combine, or overlap the number of stickers under any circumstances.
- Position Mapping (Left to Right, Top to Bottom):
  * Row 1 (Top): Stickers 01, 02, 03, 04, 05
  * Row 2 (Middle): Stickers 06, 07, 08, 09, 10
  * Row 3 (Bottom): Stickers 11, 12, 13, 14, 15
- Slot Rule: Each of the 15 positions must contain ONE AND ONLY ONE character performance.
- Numbering Rule: Sticker numbers 01–15 are INTERNAL LAYOUT REFERENCES ONLY. Do NOT render these numbers, row labels, grid labels, position markers, or guide text anywhere in the final image.
- Visual Structure: Maintain strict 5×3 spatial alignment while letting the selected art style decide pose, expression, gesture, camera and effects for each phrase meaning.
- Character Visibility: Keep each sticker composition safely inside its slot. Full, medium and close framing are allowed when native to the selected style; avoid only accidental clipping or broken anatomy.
- Sticker Separation: Each character performance must remain visually independent. Edge treatment and outline style are decided by the selected art style rather than a mandatory white die-cut outline.
- Background: Use the background mode requested elsewhere in the prompt.
- Borderless Composition: NO comic panels. NO framing boxes. NO rectangular cards. NO grid lines. NO dividing lines. NO visible layout guides.
- Forbidden Layouts: NO 3×4 grid. NO 4×3 grid. NO 4-column layout. NO portrait composition. NO missing stickers. NO duplicated stickers. NO merged characters. NO accidental crop that damages identity or anatomy.

[FINAL COMPOSITION CHECK]
Wide Landscape Canvas → Top Row: exactly 5 stickers → Middle Row: exactly 5 stickers → Bottom Row: exactly 5 stickers → 5 + 5 + 5 = EXACTLY 15 sticker performances.
The 5-column × 3-row structure and the total count of exactly 15 take priority over decorative detail, but they must not replace the selected art style’s directing language.\`;

    if (!isSingle) {
      base = base.replace(/\\n\\[종료 검증\\]\\n[\\s\\S]*?(?=\\n\\n\\[제외 조건\\])/, '');

      if (model === 'gemini') {
        base = geminiLayoutV51 + '\\n\\n' + base;
        base = base.replace(
          /\\[구도 및 배경\\]\\n- 16:9 와이드 가로형 캔버스,[\\s\\S]*?- 배경: ([^\\n]+)/,
          '[시트 구성 및 배경]\\n- 정확히 15개의 독립 스티커 표현을 가로형 5열 × 3행으로 고정 배치하세요. 각 행은 반드시 5개이며 5+5+5=15를 유지하세요.\\n- 공간이 부족하면 전체 스케일과 장식을 줄이되 수량을 줄이거나 합치거나 겹치지 마세요.\\n- 각 슬롯은 독립적으로 유지하되 근접·반신·전신 등 구체 화각과 가장자리 처리는 선택 화풍이 결정합니다. 사각 패널·카드 프레임·격자선은 만들지 마세요.\\n- 배경: $1'
        );
        base = base.replace(
          /\\[COMPOSITION & BACKGROUND\\]\\n- 16:9 wide landscape canvas,[\\s\\S]*?- Background: ([^\\n]+)/,
          '[SHEET COMPOSITION & BACKGROUND]\\n- Arrange exactly 15 independent sticker performances in a strict 5-column × 3-row landscape layout. Every row must contain exactly five.\\n- If space is limited, reduce overall scale and decoration rather than count. Never merge, overlap, omit, or duplicate stickers.\\n- Keep each slot independent, while framing and edge treatment remain decisions of the selected art style. No panels, card frames, grid lines, or cell containers.\\n- Background: $1'
        );
        base = base.replace(
          /SHEET COMPOSITION:\\n[\\s\\S]*?(?=\\nTEXT:)/,
          'SHEET COMPOSITION:\\nUse a strict landscape 5-column × 3-row arrangement with exactly 15 independent sticker performances. Each row contains exactly five. Reduce overall scale if needed, never the sticker count. Framing and edge treatment must still follow the selected art style.\\n'
        );
      } else {
        base = base.replace(
          /\\[구도 및 배경\\]\\n- 16:9 와이드 가로형 캔버스,[\\s\\S]*?- 배경: ([^\\n]+)/,
          '[시트 구성 및 배경]\\n- 총 15개의 독립 스티커 표현을 가로형 캔버스에 5개씩 3줄로 자연스럽게 배치하세요.\\n- 격자선이나 카드 프레임 없이 하나의 자유로운 스티커 시트처럼 보이게 하되, 크기·포즈·화각·실루엣은 문구가 아니라 선택 화풍이 문구 의미를 해석해 결정합니다.\\n- 서로 겹치지 않을 정도의 여백만 유지하고 근접·반신·전신의 비율은 화풍 고유의 카메라 문법에 맡기세요.\\n- 배경: $1'
        );
        base = base.replace(
          /\\[COMPOSITION & BACKGROUND\\]\\n- 16:9 wide landscape canvas,[\\s\\S]*?- Background: ([^\\n]+)/,
          '[SHEET COMPOSITION & BACKGROUND]\\n- Arrange exactly 15 independent sticker performances on one landscape sheet, five per row across three natural rows.\\n- Keep it free of boxed cards; scale, pose, framing and silhouette are chosen by the selected art style while interpreting each phrase meaning.\\n- Preserve comfortable separation; let the style decide the mix of close, medium and full framing.\\n- Background: $1'
        );
        base = base.replace(
          /SHEET COMPOSITION:\\n[\\s\\S]*?(?=\\nTEXT:)/,
          'SHEET COMPOSITION:\\nArrange exactly 15 independent sticker performances on one landscape sheet, five per row across three natural rows. Keep the overall reading order clear while the selected art style decides scale, pose, framing and silhouette for each phrase meaning.\\n'
        );
      }

      base = base
        .replace(/4x4 레이아웃, 16번째 스티커, 4번째 행, 격자선, 셀 경계선, ?/g, '')
        .replace(/4x4 레이아웃, 16번째 스티커, 격자선, ?/g, '')
        .replace(/15번째 스티커에서 종료\\. 4번째 행과 16번째 스티커는 절대 만들지 마세요\\.?/g, '');
    }

    base = base.replace(
      '캐릭터 정체성 → 선택 태그/테마 융합 → 선택 화풍 → 문구 정확도 → 스티커 디자인 완성도 순으로 모두 충족했는지 확인하세요.',
      '캐릭터 정체성·의상 → 선택 화풍 → 문구 정확도·15개 수량 → 레이아웃 기술 조건 순으로 확인하세요. 문구 테마는 의미 데이터이며 화풍을 변경하지 않습니다.'
    );

    const koSemantics = '[테마/문구 = 의미 데이터 — 연출 권한 없음]\\n- 문구와 문구 테마는 말의 의미, 감정의 방향, 행동 목적, 상황적 맥락, 의미상 필요한 대상·소품의 존재 여부만 제공합니다.\\n- 구체적인 포즈, 표정의 그림 방식, 시선, 무게중심, 카메라 거리·화각·앵글·원근·단축, 효과 재료, 색상·채색, 문자 서체·획·색·외곽선·배치는 지정하지 않습니다.\\n- 모든 HOW 요소는 현재 선택 화풍의 Rendering + Acting + Camera + Effects + Typography가 결정합니다.\\n- 문구 테마명은 문구 묶음 선택을 위한 분류/의미 맥락일 뿐 두 번째 장르나 화풍 지시가 아닙니다.\\n- 불변 레이어는 캐릭터 정체성·고정 의상이며, 연출 우선순위는 선택 화풍 > 문구 의미 > 레이아웃·기술 제약입니다.';
    const enSemantics = '[PHRASE/THEME = SEMANTIC DATA — NO DIRECTING AUTHORITY]\\n- A phrase and its phrase-theme provide verbal meaning, emotional direction, action purpose, situational context, and only the existence of an object/prop when semantically necessary.\\n- They do not prescribe concrete pose, facial rendering, gaze, weight, camera distance/angle/perspective/foreshortening, effect material, color treatment, or typography style.\\n- Every HOW decision belongs to the selected art style’s Rendering + Acting + Camera + Effects + Typography.\\n- Phrase-theme names are classification/semantic context for choosing phrase sets, not a second genre or art style.\\n- Immutable layer: character identity + fixed outfit. Direction priority: selected art style > phrase meaning > layout/technical constraints.';

    const koText = textEnabled
      ? '[텍스트 정확성]\\n- 따옴표 안의 지정 한글 문구를 원문 철자와 띄어쓰기 그대로 사용하고, 각 스티커에 해당 문구를 정확히 한 번만 표시하세요.\\n- 자연스러운 1줄을 우선하고 긴 문구만 단어·의미 단위로 2줄까지 구성하세요.\\n- 기존 선택적 Glyph Lock/음절·자모 정보는 오타 방지를 위한 내부 철자 검증용입니다. 실제 이미지에는 따옴표 안의 완성형 한글 문구만 출력하세요.\\n- 문자 정확성과 최소 가독성만 고정하며, 문자의 시각적 연출은 선택 화풍의 Typography가 결정합니다.'
      : '[텍스트 미포함] 문구는 의미·감정·상황 맥락으로만 사용하고 결과 이미지는 문자 없는 스티커 아트로 구성하세요.';

    const enText = textEnabled
      ? '[TEXT ACCURACY] Render each quoted Korean source phrase exactly once on its assigned sticker, preserving spelling and spacing. Prefer one natural line and use at most two semantic lines for longer phrases. Existing selective Glyph Lock / syllable-jamo data is internal spelling verification only; render only the completed Hangul phrase inside quotation marks. Only accuracy and minimum readability are fixed; visual lettering direction belongs to the selected art style.'
      : '[NO-TEXT MODE] Use the phrases only as semantic/emotional context and keep the final sticker artwork free of rendered text.';

    const koIdentity = '[정체성·의상] 참고 사진이 있으면 얼굴·헤어·안경 등 식별 특징과 실제 착장을 15개 전체에서 일관되게 유지하세요. 고정 정보에 별도 의상이 지정된 경우 그 의상을 기준으로 합니다. 화풍은 선·채색·질감·표현 방식에 적용하고 캐릭터 정체성과 의상 자체는 유지하세요.';
    const enIdentity = '[IDENTITY & OUTFIT] When a reference photo is present, keep recognizable facial features, hair, glasses and the actual outfit consistent across the set. If fixed character information specifies an outfit, use that outfit. Apply art style to rendering language rather than redesigning identity or clothing.';

    const koSheet = isSingle
      ? '[구도] 구체적인 화각을 미리 고정하지 않습니다. 문구 의미가 읽히는 범위에서 근접·반신·전신, 앵글과 원근은 선택 화풍의 Camera가 결정합니다.'
      : model === 'gemini'
        ? '[15개 시트 — Gemini v5.1] 정확히 15개의 독립 표현을 가로형 5열 × 3행으로 고정하세요. 각 행은 반드시 5개이며 5+5+5=15입니다. 공간이 부족하면 전체 스케일과 장식을 줄이고 수량은 절대 줄이지 마세요. 각 슬롯은 하나의 캐릭터 표현만 담고 겹침·누락·중복·병합 없이 분리하세요. 근접·반신·전신 등 화각과 가장자리 처리는 선택 화풍이 결정하며 실제 격자선·사각 패널·카드 박스는 표시하지 마세요.'
        : '[15개 시트] 정확히 15개의 독립 표현을 5개씩 3줄로 자연스럽게 배치하세요. 실제 격자나 카드 프레임처럼 보이지 않게 하고, 각 표현의 크기·포즈·화각·실루엣은 선택 화풍이 문구 의미를 해석해 결정합니다. 서로 겹치지 않을 정도의 여백을 유지하세요.';
    const enSheet = isSingle
      ? '[FRAMING] Do not pre-lock one framing type. Let the selected art style choose close, medium or full framing, angle and perspective while keeping the phrase meaning readable.'
      : model === 'gemini'
        ? '[15-STICKER SHEET — GEMINI v5.1] Lock the composition to exactly 15 independent performances in a strict landscape 5-column × 3-row layout. Each row must contain exactly five. If space becomes tight, reduce overall scale and decoration before sacrificing count. Each slot contains one character performance only; never overlap, omit, duplicate, or merge. Framing and edge treatment remain style decisions; show no visible grid lines, rectangular panels, card boxes, or cell containers.'
        : '[15-STICKER SHEET] Create exactly 15 independent performances, naturally arranged five per row across three rows. Keep the sheet visually free rather than boxed; the selected art style decides scale, pose, framing and silhouette while interpreting each phrase meaning.';

    const koActing = '[화풍 연기] 문구는 의미·감정·상황만 전달하고, 그 의미를 어떤 표정·시선·손동작·몸의 방향·무게중심·긴장감으로 연기할지는 선택 화풍이 결정합니다. 범용 손하트·엄지척·점프·고개 숙임 같은 메신저 스티커 클리셰를 자동 기본값으로 사용하지 마세요.';
    const enActing = '[STYLE-DIRECTED ACTING] The phrase provides meaning, emotion and situation only. The selected art style decides expression, gaze, gesture, body direction, weight and tension. Do not default to stock messenger poses such as heart hands, thumbs-up, jumping or bowing.';

    const koLettering = textEnabled
      ? '[화풍 종속 레터링] 철자 정확성과 최소 가독성만 고정합니다. 글자 형태, 획 재료, 굵기, 기울기, 자간, baseline, 크기 대비, 색상, 외곽선, 그림자, 배치와 주변 효과는 모두 선택 화풍의 Typography가 결정합니다. 고정 팝아트 팔레트·귀여운 손글씨·흰색 다이컷 외곽선을 기본값으로 강제하지 마세요.'
      : '';
    const enLettering = textEnabled
      ? '[STYLE-SUBORDINATE LETTERING] Only spelling accuracy and minimum readability are fixed. Letterform, stroke material, weight, tilt, spacing, baseline, scale contrast, color, outline, shadow, placement and surrounding effects are all decided by the selected art style’s Typography. Do not force a generic pop palette, cute handwriting or white die-cut outline.'
      : '';

    const koModel = model === 'gemini'
      ? '[Gemini 실행 — v5.1] 5열 × 3행과 정확히 15개 수량을 기술적으로 유지하되, 그 기술 조건이 선택 화풍의 작화·연기·카메라·효과·문자 문법을 평균화해서는 안 됩니다. 공간이 부족하면 전체 스케일과 장식을 줄이세요.'
      : '[Grok 실행] 정확한 문구·정체성·15개 수량을 유지하되, 동세·실루엣·그래픽 임팩트의 구체 방식은 문구가 아니라 선택 화풍의 Acting·Camera·Effects가 결정합니다.';
    const enModel = model === 'gemini'
      ? '[GEMINI EXECUTION — v5.1] Preserve the technical 5-column × 3-row structure and exactly 15 outputs, but these constraints must not average away the selected style’s rendering, acting, camera, effects or typography grammar. Reduce overall scale/decoration if space is tight.'
      : '[GROK EXECUTION] Keep exact text, identity and count fixed, while the selected art style—not the phrase—decides the concrete motion, silhouette and graphic-impact language.';

    const blocks = lang === 'ko'
      ? [koSemantics, koText, koIdentity, koSheet, koActing, koLettering, koModel].filter(Boolean)
      : [enSemantics, enText, enIdentity, enSheet, enActing, enLettering, enModel].filter(Boolean);

    const versionLabel = model === 'gemini' ? '[Gemini 모델 최적화 v5.2 — 화풍 우선]' : '[Grok 모델 최적화 v5 — 화풍 우선]';
    return base + '\\n\\n' + versionLabel + '\\n' + blocks.join('\\n\\n');
  };

${helperMarker}`;

      out = replaceOnce(out, helperMarker, helper, 'helper injection');

      const geminiMarker = `generateGeminiPrompt(phraseOverride)`;
      const geminiReplacement = `optimizeModelPromptV4(generateGeminiPrompt(phraseOverride), 'gemini')`;
      out = replaceCount(out, geminiMarker, geminiReplacement, 3, 'Gemini prompt wrapping');

      const grokMarker = `generateGrokPrompt(phraseOverride)`;
      const grokReplacement = `optimizeModelPromptV4(generateGrokPrompt(phraseOverride), 'grok')`;
      out = replaceCount(out, grokMarker, grokReplacement, 3, 'Grok prompt wrapping');

      return { code: out, map: null };
    },
  };
}
