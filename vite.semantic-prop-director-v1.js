const TARGET = '/src/App.jsx'

const replaceUniqueText = (source, marker, replacement, label) => {
  const first = source.indexOf(marker)
  if (first < 0) throw new Error(`[semantic-prop-director-v1] ${label} marker not found`)
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[semantic-prop-director-v1] ${label} marker is not unique`)
  }
  return source.slice(0, first) + replacement + source.slice(first + marker.length)
}

export function semanticPropDirectorV1Plugin() {
  return {
    name: 'semantic-prop-director-v1',
    enforce: 'post',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null

      let out = code.replace(/\r\n/g, '\n')

      // Inject into the universal style-first semantic lock after all pre transforms.
      // Phrase/theme may decide WHAT semantic support is useful, but selected style owns HOW.
      const koMarker = '- 문자를 가려도 동작·카메라·효과만으로 선택 화풍이 느껴져야 하며, 캐릭터를 가려도 문자만으로 같은 화풍이 느껴져야 합니다.'
      const koBlock = [
        koMarker,
        '',
        '[문구·테마 의미 소품 감독 — WHAT→STYLE TRANSLATION HARD CONSTRAINT]',
        '- 문구와 테마는 장면에 필요한 WHAT만 제안할 수 있습니다. 각 표현마다 내부적으로 ① 핵심 행동 목적 ② 상황·맥락 ③ 의미상 필요한 소품 후보 ④ 잠시 착용하거나 들 수 있는 임시 액세서리 후보 ⑤ 상징적 효과 후보를 먼저 판단하세요.',
        '- 위 후보는 반드시 모두 그리라는 목록이 아닙니다. 문구를 더 빨리 이해시키거나 감정을 강화하는 요소만 선택하고, 필요하지 않으면 소품·액세서리·효과를 추가하지 마세요. 장식 수를 채우기 위한 추가는 금지합니다.',
        '- 문구·테마는 소품의 종류나 상징 의미 같은 WHAT까지만 제공하며, 형태·재질·시대감·장르 문법·색·크기·배치·카메라와의 관계·동작 방식 같은 HOW는 선택 화풍이 결정합니다.',
        '- 하트·엄지·왕관·꽃다발·폭죽·땀방울·별·물음표 같은 범용 스티커 아이콘을 의미와 1:1로 자동 매핑하지 마세요. 같은 의미라도 현재 화풍의 세계에서 더 자연스러운 물건·상징·현상·몸짓이 있다면 그것을 우선하세요.',
        '- 예를 들어 축하·사랑·퇴근·배고픔 같은 의미도 현대 메신저 아이콘을 그대로 붙이지 말고, 선택 화풍의 시대·장르·재료·연출 문법 안에서 해당 의미를 다시 번역하세요. 소품도 선택 화풍의 배우여야 합니다.',
        '- 자동 추론한 임시 액세서리는 캐릭터 정체성이나 고정 의상·헤어·대표 특징을 바꾸는 새 설정이 아닙니다. 장면 의미에 꼭 필요할 때만 일시적으로 사용하고, 다른 셀에 영구적으로 전파하지 마세요.',
        '- 사용자가 명시적으로 선택한 소품·액세서리·효과·의상 설정이 있다면 자동 추론 후보보다 우선합니다. 다만 그 시각적 표현 방식과 재료감은 선택 화풍 안에서 자연스럽게 통합하세요.',
        '- 소품은 캐릭터와 실제로 상호작용하게 하세요. 손에 들기, 기대기, 착용하기, 피하기, 바라보기, 주변에 놓기처럼 Acting과 연결하고, 의미 없이 캐릭터 옆에 떠 있는 클립아트 장식으로 붙이지 마세요.',
        '- 효과는 문구 테마가 양을 강제하지 않습니다. 효과의 종류·강도·방향·밀도는 선택 화풍의 Effects 문법과 해당 장면의 감정 강도가 결정합니다. 같은 문구라도 화풍이 다르면 효과의 재료와 움직임이 달라져야 합니다.',
        '- 소품·액세서리·효과가 캐릭터 얼굴·핵심 정체성·문자 가독성·Text Safe Zone을 침범하거나 15개 시트의 Slot Safe Zone을 넘으면 해당 보조 요소를 줄이거나 재배치하거나 제거하세요. 의미 보조보다 정체성·화풍·문자·슬롯 안정성이 우선입니다.',
        '- 내부 후보 판단의 카테고리명, 설명문, 번호, 라벨은 최종 이미지에 절대 렌더링하지 마세요. 최종 이미지에는 선택된 장면 요소만 자연스럽게 존재해야 합니다.'
      ].join('\\n')
      out = replaceUniqueText(out, koMarker, koBlock, 'Korean semantic prop director')

      const enMarker = '- The style must remain recognizable from acting/camera/effects with text hidden, and from typography alone with the character hidden.'
      const enBlock = [
        enMarker,
        '',
        '[PHRASE/THEME SEMANTIC PROP DIRECTOR — WHAT→STYLE TRANSLATION HARD CONSTRAINT]',
        '- Phrase and theme may propose only the semantic WHAT needed by the scene. For each expression, internally infer: 1) core action purpose, 2) situation/context, 3) semantically useful prop candidates, 4) temporary wearable/held accessory candidates, and 5) symbolic effect candidates.',
        '- These candidates are not a checklist that must all be rendered. Select only elements that make the phrase faster to understand or materially strengthen the emotion. If none are needed, add no prop, accessory or effect. Never decorate merely to fill space.',
        '- Phrase/theme may supply WHAT such as object category or symbolic meaning, while the selected art style owns HOW: form, material, era, genre grammar, color, scale, placement, camera relationship and acting behavior.',
        '- Never auto-map meanings one-to-one to stock sticker icons such as hearts, thumbs-up, crowns, bouquets, confetti, sweat drops, stars or question marks. If the current style world has a more native object, symbol, phenomenon or gesture for the same meaning, prefer that.',
        '- Meanings such as celebration, affection, leaving work or hunger must not receive generic messenger clip-art by default. Translate the semantic support through the selected style’s era, genre, material and directing language. Props are actors inside the style world too.',
        '- Automatically inferred temporary accessories are not new permanent character design. Use them only when the scene meaning truly needs them, do not replace fixed outfit/hair/identity traits, and do not propagate them to unrelated cells.',
        '- User-explicit props, accessories, effects and outfit settings outrank inferred candidates. Their visual treatment should still integrate naturally with the selected art style.',
        '- Make props physically participate in Acting: held, worn, leaned on, avoided, watched or placed in the scene. Do not paste floating clip-art beside the character without interaction.',
        '- Phrase/theme does not dictate effect quantity. Effect type, intensity, direction and density are decided by the selected style’s Effects grammar plus the scene’s emotional intensity. The same phrase should use different effect material and motion in different styles.',
        '- If any prop, accessory or effect obstructs face/identity, lettering readability, the Text Safe Zone, or the 15-sheet Slot Safe Zone, reduce, restage or remove the supporting element. Identity, selected style, exact readable text and spatial safety outrank semantic decoration.',
        '- Never render the internal candidate category names, planning labels, numbers or explanations. Only the selected scene elements may appear naturally in the final image.'
      ].join('\\n')
      out = replaceUniqueText(out, enMarker, enBlock, 'English semantic prop director')

      return { code: out, map: null }
    },
  }
}
