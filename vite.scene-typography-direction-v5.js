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

    const isKoPrompt = base.includes('[화풍 =')
      || base.includes('[목표]')
      || base.includes('[패널 계획]')
      || base.includes('[구도 및 배경]')
      || base.includes('[시트 구성 및 배경]');

    const sceneKo = [
      '[장면 연출 = 하나의 완결된 장면으로 설계]',
      '- 각 셀을 단순한 캐릭터 포즈 + 문자의 조합으로 만들지 말고, 선택 화풍 안에서 하나의 완결된 만화 장면으로 연출하세요.',
      '- 문구의 감정 강도와 행동 목적을 해석한 뒤 몸의 축, 손발 방향, 시선, 머리카락과 의상의 흐름, 카메라 거리와 원근, 효과를 하나의 동세로 연결하세요.',
      '- 15개 장면이 정면 상반신 위주로 반복되지 않도록 전신·반신·근접, 정면·사선·로우·하이앵글, 전경 손발과 과감한 단축을 선택 화풍의 카메라 문법 안에서 적극적으로 변화시키세요.',
      '- 강한 감정은 화면 점유율과 동세를 키우고, 억눌리거나 지친 감정은 몸을 압축하거나 여백을 넓히는 등 감정에 따라 화면 에너지와 무게중심까지 변화시키세요.',
      '- 캐릭터를 셀 중앙에 항상 고정하지 말고 좌·우·상·하의 비대칭 구도를 적극 활용하세요. 빈 공간도 감정과 동세를 만드는 연출 요소로 사용하세요.',
      '- 특정 예시 포즈를 복제하지 마세요. 손하트·엄지척·점프·고개 숙임 같은 범용 스티커 클리셰를 미리 답으로 정하지 말고, 감정별 화면 에너지·카메라 변화·전신 활용·비대칭 구도라는 연출 원리만 적용하세요.',
      '- 별도의 시각 효과를 사용자가 지정하지 않았더라도 Acting과 Camera를 완성하는 데 필요한 효과는 선택 화풍이 자율적으로 사용할 수 있습니다. 효과의 양과 강도는 문구 테마가 아니라 선택 화풍과 장면의 감정 강도가 결정합니다.'
    ].join('\\n');

    const textKo = [
      '[문자 가독성 보호 — 화풍 유지형 HARD CONSTRAINT]',
      '- 문자는 장면의 보조 설명이 아니라 캐릭터와 함께 화면을 구성하는 두 번째 주연 요소이며, 작은 메신저 화면에서도 즉시 읽혀야 합니다.',
      '- 문자 위치는 캐릭터를 다 그린 뒤 남은 공간에 끼워 넣지 말고 포즈·카메라·효과를 설계하는 순간부터 함께 확보하세요.',
      '- 각 셀에서 충분한 Text Safe Zone과 Negative Space를 확보하고, 글자 바로 뒤에는 얼굴·손·복잡한 의상 주름·강한 먹비산·속도선·장풍·고대비 효과를 배치하지 마세요.',
      '- 장풍·기류·먹선·잔상·빛·충격·반짝임 등 화풍 효과는 문자와 충돌하지 말고 문자 주변으로 갈라지거나 비켜가며 흐르도록 연출하세요.',
      '- 문자와 효과가 같은 방향성을 공유할 수는 있지만 서로 겹쳐 읽기 어려워져서는 안 됩니다. 기본 시각 위계는 배경 효과 → 캐릭터 → 문자이며 문자가 최종 전경에서 명확히 읽히게 하세요.',
      '- 문자와 주변의 명도·색·밀도가 비슷하면 선택 화풍 내부의 방법으로 대비를 확보하세요. 먹 농담 분리, 옅은 워시, 역상 획, 외곽 붓질, 화풍 고유의 그림자·밑칠 등은 허용합니다.',
      '- 범용 사각 텍스트 박스나 획일적인 기본 스티커 폰트로 가독성을 해결하지 마세요. 고정적인 순백색 다이컷 외곽선도 강제하지 말고 필요한 분리는 선택 화풍의 재료 언어로 해결하세요.',
      '- 문자의 화풍성보다 철자 정확성과 순간 가독성이 우선하며, 가독성을 확보하는 방법 자체는 선택 화풍이 결정합니다.',
      '- 캐릭터·효과·문자는 서로 경쟁하는 세 요소가 아니라 같은 장면의 하나의 방향과 리듬을 공유해야 합니다.'
    ].join('\\n');

    const sceneEn = [
      '[SCENE DIRECTION = DESIGN ONE COMPLETE PERFORMANCE]',
      '- Do not build each slot as a generic character pose with text pasted on later. Stage it as one complete mini-scene inside the selected art style.',
      '- Interpret emotional intensity and purpose, then connect body axis, limbs, gaze, hair/clothing flow, camera distance, perspective and effects into one directional rhythm.',
      '- Avoid repeating front-facing bust shots. Vary full, medium and close framing, frontal and diagonal views, low/high angles, foreground limbs and bold foreshortening through the selected style’s own camera grammar.',
      '- Let strong emotions occupy more visual energy; compress the body or open negative space for restrained, tired or subdued emotions. Vary screen occupancy and center of gravity with the emotion.',
      '- Do not center the character by default. Use asymmetrical left/right/top/bottom placement and treat empty space as part of the directing language.',
      '- Do not copy fixed example poses. Avoid pre-solving phrases with stock heart-hands, thumbs-up, jumps or bows; preserve only the directing principles of energy variation, camera variation, full-body use and asymmetrical composition.',
      '- If the user did not explicitly choose a visual effect, the selected style may autonomously use effects needed to complete Acting and Camera. Effect amount and intensity are decided by the selected style and scene emotion, not the phrase theme.'
    ].join('\\n');

    const textEn = [
      '[TYPOGRAPHY LEGIBILITY LOCK — STYLE-PRESERVING HARD CONSTRAINT]',
      '- Lettering is a second lead in the scene, not a late caption, and must read instantly on a small messenger screen.',
      '- Reserve lettering space while designing pose, camera and effects; never squeeze the phrase into leftover space after the character is finished.',
      '- Give every phrase a clear Text Safe Zone and negative space. Do not place faces, hands, dense clothing folds, heavy splashes, speed lines, energy bursts or other high-contrast detail directly behind the glyphs.',
      '- Style-native effects may share the lettering direction, but they must split, bend or flow around the letters rather than crossing through them and reducing readability.',
      '- Default visual order is background effects → character → lettering, with the lettering clearly readable in the final foreground.',
      '- When value, color or texture contrast is weak, create separation using methods native to the selected style: density shifts, pale wash, reverse strokes, edge brushwork, style-native shadow or underpainting.',
      '- Do not solve readability with generic rectangular text boxes, one uniform stock sticker font, or a mandatory pure-white die-cut outline. Separation itself must inherit the selected style’s material language.',
      '- Exact spelling and instant readability take priority over decorative complexity, while the selected style decides how that readability is achieved.',
      '- Character, effects and lettering must share one scene rhythm without competing for the same visual space.'
    ].join('\\n');

    const sceneBlock = isKoPrompt ? sceneKo : sceneEn;
    const textBlock = isKoPrompt ? textKo : textEn;
    const sceneLockKo = '[장면 연출 = 하나의 완결된 장면으로 설계]';
    const sceneLockEn = '[SCENE DIRECTION = DESIGN ONE COMPLETE PERFORMANCE]';
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
