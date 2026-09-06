const TARGET = '/src/App.jsx'

const countOccurrences = (source, marker) => source.split(marker).length - 1

export function sceneTypographyDirectionV5Plugin() {
  return {
    name: 'scene-typography-direction-v5',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null

      let out = code.replace(/\r\n/g, '\n')

      // When the user did not explicitly choose an effect, let the selected style decide
      // which effects it needs and how intense they should be.
      const effectFallbackOld = "effects: effects.join(', ') || (isKo ? '감정 전달에 필요한 최소한의 효과만 사용' : 'use only a minimal effect when it clarifies the emotion'),"
      const effectFallbackNew = "effects: effects.join(', ') || (isKo ? '선택 화풍의 Acting과 Camera를 완성하는 데 필요한 효과를 화풍이 자율적으로 사용하고, 효과의 양은 문구 테마가 아니라 화풍과 장면의 감정 강도가 결정' : 'let the selected art style use the effects needed to complete its acting and camera direction; effect intensity is determined by the style and scene emotion, not by the phrase theme'),"
      const effectFallbackCount = countOccurrences(out, effectFallbackOld)
      if (effectFallbackCount < 1) {
        throw new Error('[scene-typography-v5] default effect fallback marker not found')
      }
      out = out.split(effectFallbackOld).join(effectFallbackNew)

      const helperMarker = `  const getPreviewPrompt = () => {`
      if (!out.includes(helperMarker)) {
        throw new Error('[scene-typography-v5] getPreviewPrompt marker not found')
      }

      const helper = `  const enhanceSceneTypographyV5 = (prompt, model) => {
    let base = String(prompt || '');
    const textEnabled = model === 'gpt'
      ? gptTextMode === 'text'
      : model === 'gemini'
        ? geminiTextMode === 'text'
        : grokTextMode === 'text';
    const isSingle = generationMode === 'individual' || generationMode === 'batch';

    const isKoPrompt = base.includes('[화풍 =')
      || base.includes('[목표]')
      || base.includes('[패널 계획]')
      || base.includes('[구도 및 배경]')
      || base.includes('[시트 구성 및 배경]');

    const sceneKo = (isSingle ? [
      '[공통 이모티콘 구도 감독 — 모든 화풍 공통 HARD CONSTRAINT]',
      '- 이 규칙은 특정 화풍을 정의하거나 약화하지 않습니다. 선택 화풍의 Rendering + Acting + Camera + Effects + Typography를 그대로 유지하면서 메신저 이모티콘으로서의 화면 구성만 안정화합니다.',
      '- 하나의 복잡한 만화 컷이나 포스터처럼 만들지 말고, 하나의 감정과 하나의 중심 행동이 즉시 읽히는 독립형 이모티콘 장면으로 구성하세요.',
      '- 전신 또는 3/4 전신을 우선하고, 얼굴 근접·극단 원근·전경 손발 확대는 의미 전달에 꼭 필요한 경우에만 사용하세요.',
      '- 캐릭터와 문구가 서로 경쟁하지 않게 독립적인 여백을 먼저 확보하세요. 캐릭터 동세가 한쪽으로 향하면 문구는 반대쪽이나 상단·측면의 Negative Space를 우선 사용하세요.',
      '- 선택 화풍의 효과는 캐릭터 뒤쪽·외곽·동세 방향을 중심으로 사용하고 얼굴과 문구를 가리지 마세요. 효과로 화면 전체를 채우지 마세요.',
      '- 화풍의 강도는 장면 복잡도로 증명하지 않습니다. 선·형태·동작·카메라·효과·문자에서 화풍 DNA가 명확하면 충분하며 불필요한 배경·효과·원근은 추가하지 마세요.'
    ] : [
      '[공통 이모티콘 구도 감독 — 모든 화풍 공통 HARD CONSTRAINT]',
      '- 이 규칙은 특정 화풍을 정의하거나 약화하지 않습니다. 선택 화풍의 Rendering + Acting + Camera + Effects + Typography를 그대로 유지하면서 메신저 이모티콘으로서의 화면 구성만 안정화합니다.',
      '- 각 셀은 복잡한 만화 컷이나 포스터가 아니라 하나의 감정과 하나의 중심 행동이 즉시 읽히는 독립형 이모티콘 장면으로 설계하세요.',
      '- 15개 시트에서는 전신 또는 3/4 전신을 기본 구도로 우선하고, 얼굴 근접·극단 원근·전경 손발 확대는 감정 전달에 꼭 필요한 소수 장면에서만 사용하세요.',
      '- 캐릭터는 일반적으로 셀의 약 55~70% 범위에서 배치하고, 문구와 숨 쉴 여백을 위해 약 25~35%의 독립 공간을 확보하세요. 문구 길이에 따라 자연스럽게 조정하되 캐릭터가 문자 공간을 압박하지 않게 하세요.',
      '- 캐릭터의 동세가 한쪽으로 향하면 문구는 반대쪽 또는 상단·측면의 Negative Space를 우선 사용하세요. 캐릭터와 문자를 억지로 겹치거나 문자를 캐릭터 위에 덮는 구도를 기본값으로 삼지 마세요.',
      '- 각 셀에는 하나의 중심 행동만 강하게 표현하세요. 복수의 사건·복수 포즈·과도한 전경 오브젝트·복잡한 배경 서사를 동시에 넣지 마세요.',
      '- 카메라는 선택 화풍이 결정하지만 다양성을 위해 무조건 극단적으로 만들지 마세요. 먼저 실루엣 → 표정 → 행동 → 문구가 읽혀야 하며, 정면 상반신 위주의 반복도 피하세요.',
      '- 선택 화풍의 효과는 캐릭터 뒤쪽·외곽·동세 방향을 중심으로 사용하고 얼굴과 문구를 가리지 마세요. 효과가 셀 전체를 메우지 않게 하며, 장면 복잡도를 화풍 강도의 증거로 사용하지 마세요.',
      '- 15개 전체는 포즈와 카메라가 달라도 캐릭터 크기·문구 비중·시각 밀도를 일정 범위 안에서 유지해 하나의 통일된 이모티콘 세트처럼 보이게 하세요. 강한 감정은 일부 확대하고 지침·허탈한 감정은 여백을 늘릴 수 있지만 전체 균형은 유지하세요.',
      '- 화풍의 강도는 장면 복잡도로 증명하지 않습니다. 선·형태·동작·카메라·효과·문자에서 화풍 DNA가 명확하면 충분하며 불필요한 배경·효과·원근은 추가하지 마세요.'
    ]).join('\\n');

    const textKo = [
      '[문자 가독성 보호 — 화풍 유지형 HARD CONSTRAINT]',
      '- [생성 순서 잠금] 캐릭터를 먼저 완성한 뒤 남는 공간에 문자를 넣지 마세요. 각 셀은 반드시 문구의 위치·줄 수·크기·Text Safe Zone을 먼저 확정한 뒤 캐릭터 점유 영역, 카메라, Acting과 Effects를 설계하세요.',
      '- 문자는 장면의 보조 설명이 아니라 캐릭터와 함께 화면을 구성하는 두 번째 주연 요소이며, 작은 메신저 화면에서도 즉시 읽혀야 합니다.',
      '- 15개 시트에서는 일반적으로 셀 면적의 약 25~35%를 문구와 주변 여백의 가용 영역으로 확보하세요. 긴 문구나 시각 밀도가 높은 화풍은 필요한 만큼 더 넓게 확보하고, 단일 이모티콘에서도 문구가 숨 쉴 독립 공간을 충분히 확보하세요.',
      '- 문자 안전영역 안에는 얼굴·손·소품·복잡한 의상 주름·강한 명암 덩어리·패턴·스크린톤·픽셀 장식·먹비산·속도선·장풍·광선·잔상·고대비 효과 등 높은 시각 밀도의 요소를 두지 마세요.',
      '- 캐릭터나 효과가 문자 공간과 충돌하면 문자를 줄이거나 밀어내지 말고 캐릭터의 크기·위치·포즈·카메라 또는 효과량을 다시 설계하세요. 문자 가독성을 희생해 캐릭터 화면 점유율을 키우는 것은 금지합니다.',
      '- 문자 바로 뒤 영역은 같은 셀의 다른 부분보다 시각 밀도를 낮게 유지하세요. 필요한 분리는 선택 화풍 고유의 농담, Negative Space, 워시, 밑칠, 역상 획, 외곽 붓질, 그림자 또는 재료 대비로 해결하세요.',
      '- 먹선·스크린톤·민화 문양·픽셀·그래피티·네온·자수·크레파스처럼 본래 시각 밀도가 높은 화풍일수록 Text Safe Zone 주변의 효과 밀도를 더 적극적으로 낮추되, 문자 획과 재료감 자체는 반드시 해당 화풍의 Typography DNA를 유지하세요.',
      '- 장풍·기류·먹선·잔상·빛·충격·반짝임 등 화풍 효과는 문자와 충돌하지 말고 문자 주변으로 갈라지거나 비켜가며 흐르도록 연출하세요.',
      '- 문자와 효과가 같은 방향성을 공유할 수는 있지만 서로 겹쳐 읽기 어려워져서는 안 됩니다. 기본 시각 위계는 배경 효과 → 캐릭터 → 문자이며 문자가 최종 전경에서 명확히 읽히게 하세요.',
      '- 범용 사각 텍스트 박스나 획일적인 기본 스티커 폰트로 가독성을 해결하지 마세요. 고정적인 순백색 다이컷 외곽선도 강제하지 말고 필요한 분리는 선택 화풍의 재료 언어로 해결하세요.',
      '- 문자의 화풍성보다 철자 정확성과 순간 가독성이 우선하며, 가독성을 확보하는 방법 자체는 선택 화풍이 결정합니다.',
      '- 생성 직전 각 셀을 다시 검사하세요: 문구 전체가 작은 메신저 화면에서 즉시 읽히는가, 어떤 효과선도 글자를 관통하지 않는가, 자모가 배경과 합쳐지지 않는가. 하나라도 아니면 캐릭터·효과 구도를 먼저 수정한 뒤 렌더링하세요.',
      '- 충돌 시 우선순위는 캐릭터 정체성·고정 의상 유지 → 선택 화풍 유지 → 문자 철자 정확성·순간 가독성 → 문구 의미 연출 → 캐릭터 화면 점유율·효과량 순입니다.',
      '- 캐릭터·효과·문자는 서로 경쟁하는 세 요소가 아니라 같은 장면의 하나의 방향과 리듬을 공유해야 합니다.'
    ].join('\\n');

    const sceneEn = (isSingle ? [
      '[GLOBAL STICKER COMPOSITION DIRECTOR — ALL ART STYLES HARD CONSTRAINT]',
      '- This rule does not define or weaken any art style. Preserve the selected style’s Rendering + Acting + Camera + Effects + Typography and stabilize only the composition needed for a readable messenger sticker.',
      '- Do not turn the sticker into a complex comic panel or poster. Build one immediately readable emotion and one primary action.',
      '- Prefer full-body or three-quarter-body framing. Use close face crops, extreme perspective or enlarged foreground limbs only when the meaning truly benefits from them.',
      '- Reserve independent breathing room for character and lettering before staging. When motion leans one way, place lettering primarily in opposite-side, upper or side Negative Space.',
      '- Keep style-native effects mainly behind or around the character and along the motion direction. Never let them cover the face or lettering, and do not fill the entire frame with effects.',
      '- Style strength is not proven by scene complexity. If line, shape, acting, camera, effects and typography clearly carry the style DNA, do not add unnecessary background, effects or perspective.'
    ] : [
      '[GLOBAL STICKER COMPOSITION DIRECTOR — ALL ART STYLES HARD CONSTRAINT]',
      '- This rule does not define or weaken any art style. Preserve the selected style’s Rendering + Acting + Camera + Effects + Typography and stabilize only the composition needed for a readable messenger-sticker sheet.',
      '- Each slot is an independent sticker scene with one immediately readable emotion and one primary action, not a dense comic panel or poster.',
      '- On the 15-sticker sheet, prefer full-body or three-quarter-body framing as the default. Use close crops, extreme perspective and enlarged foreground limbs only for a small number of scenes where they materially improve the emotion.',
      '- As a general composition target, keep the character around 55–70% of the slot and reserve about 25–35% as independent phrase/breathing space. Adjust naturally for phrase length without letting the character pressure the lettering zone.',
      '- When character motion leans toward one side, place lettering primarily in opposite-side, upper or side Negative Space. Do not make character-text overlap the default solution.',
      '- Give each slot one strong primary action. Avoid combining multiple events, multiple simultaneous poses, excessive foreground objects or complex background narrative in one sticker.',
      '- Camera choices belong to the selected style, but do not make shots extreme merely for variety. Readability order is silhouette → expression → action → phrase, while also avoiding repetitive front-facing bust shots.',
      '- Keep style-native effects mainly behind/around the character and along the motion direction. Do not cover the face or lettering, do not fill the entire slot with effects, and never use scene complexity as proof of style strength.',
      '- Across all 15 stickers, allow pose and camera variety while keeping character scale, lettering share and visual density within a coherent range so the sheet reads as one unified set. Strong emotions may expand and tired/subdued scenes may use more space, but preserve overall balance.',
      '- Style strength is not proven by complexity. If line, shape, acting, camera, effects and typography clearly carry the style DNA, do not add unnecessary background, effects or perspective.'
    ]).join('\\n');

    const textEn = [
      '[TYPOGRAPHY LEGIBILITY LOCK — STYLE-PRESERVING HARD CONSTRAINT]',
      '- [GENERATION-ORDER LOCK] Never finish the character first and place lettering in leftover space. For every cell, establish phrase position, line count, scale and Text Safe Zone first; only then design character occupancy, camera, Acting and Effects.',
      '- Lettering is a second lead in the scene, not a late caption, and must read instantly on a small messenger screen.',
      '- On a 15-sticker sheet, generally reserve about 25–35% of each slot for the phrase and its breathing room. Expand it for long phrases or visually dense styles; on single stickers, still reserve enough independent breathing room for the phrase.',
      '- Keep faces, hands, props, dense clothing folds, heavy value masses, patterns, screentones, pixel ornaments, ink splashes, speed lines, energy bursts, light rays and other high-density detail out of the lettering safe zone.',
      '- If the character or effects collide with the lettering zone, do not shrink or push away the text. Restage character scale, position, pose, camera or effect amount first. Never sacrifice instant readability to maximize character occupancy.',
      '- Keep the area directly behind lettering visually calmer than the rest of the cell. Create separation using style-native value control, negative space, wash, underpainting, reverse strokes, edge brushwork, shadow or material contrast.',
      '- In inherently dense styles such as ink manga, screentone comics, folk painting, pixel art, graffiti, neon, embroidery or crayon, reduce effect density around the Text Safe Zone more aggressively while preserving that style’s native Typography DNA in the glyphs themselves.',
      '- Style-native effects may share the lettering direction, but they must split, bend or flow around the letters rather than crossing through them and reducing readability.',
      '- Default visual order is background effects → character → lettering, with the lettering clearly readable in the final foreground.',
      '- Do not solve readability with generic rectangular text boxes, one uniform stock sticker font, or a mandatory pure-white die-cut outline. Separation itself must inherit the selected style’s material language.',
      '- Exact spelling and instant readability take priority over decorative complexity, while the selected style decides how that readability is achieved.',
      '- Immediately before rendering each cell, verify that the complete phrase reads instantly at messenger size, no effect line crosses the glyphs, and no consonant, vowel or final stroke merges into the background. If any check fails, revise character/effect composition before rendering.',
      '- Conflict priority: preserve character identity/fixed outfit → preserve selected art style → exact spelling and instant lettering readability → phrase meaning performance → character occupancy and effect amount.',
      '- Character, effects and lettering must share one scene rhythm without competing for the same visual space.'
    ].join('\\n');

    const sceneBlock = isKoPrompt ? sceneKo : sceneEn;
    const textBlock = isKoPrompt ? textKo : textEn;
    const sceneLockKo = '[공통 이모티콘 구도 감독 — 모든 화풍 공통 HARD CONSTRAINT]';
    const sceneLockEn = '[GLOBAL STICKER COMPOSITION DIRECTOR — ALL ART STYLES HARD CONSTRAINT]';
    const textLockKo = '[문자 가독성 보호 — 화풍 유지형 HARD CONSTRAINT]';
    const textLockEn = '[TYPOGRAPHY LEGIBILITY LOCK — STYLE-PRESERVING HARD CONSTRAINT]';
    const markers = isKoPrompt
      ? ['\\n[패널 계획]', '\\n[장면]', '\\n[구도 및 배경]', '\\n[시트 구성 및 배경]']
      : ['\\n[PANEL PLAN]', '\\n[SCENE]', '\\n[COMPOSITION & BACKGROUND]', '\\n[SHEET COMPOSITION & BACKGROUND]', '\\n[LAYOUT & STRICT SPATIAL RULES'];

    const insertBeforeFirstMarker = (source, block) => {
      for (const marker of markers) {
        const index = source.indexOf(marker);
        if (index >= 0) {
          return source.slice(0, index) + '\\n\\n' + block + source.slice(index);
        }
      }
      return source + '\\n\\n' + block;
    };

    if (!base.includes(sceneLockKo) && !base.includes(sceneLockEn)) {
      base = insertBeforeFirstMarker(base, sceneBlock);
    }
    if (textEnabled && !base.includes(textLockKo) && !base.includes(textLockEn)) {
      base = insertBeforeFirstMarker(base, textBlock);
    }

    return base;
  };

`
      out = out.replace(helperMarker, helper + helperMarker)

      const gptReturnOld = "    return (isKo ? ko : en) + '\\n\\n' + base + '\\n\\n' + (isKo ? finalKo : finalEn);"
      const gptReturnNew = "    return enhanceSceneTypographyV5((isKo ? ko : en) + '\\n\\n' + base + '\\n\\n' + (isKo ? finalKo : finalEn), 'gpt');"
      if (!out.includes(gptReturnOld)) {
        throw new Error('[scene-typography-v5] GPT optimizer return marker not found')
      }
      out = out.replace(gptReturnOld, gptReturnNew)

      const modelReturnOld = "    return base + '\\n\\n' + versionLabel + '\\n' + blocks.join('\\n\\n');"
      const modelReturnNew = "    return enhanceSceneTypographyV5(base + '\\n\\n' + versionLabel + '\\n' + blocks.join('\\n\\n'), model);"
      if (!out.includes(modelReturnOld)) {
        throw new Error('[scene-typography-v5] Gemini/Grok optimizer return marker not found')
      }
      out = out.replace(modelReturnOld, modelReturnNew)

      return { code: out, map: null }
    },
  }
}
