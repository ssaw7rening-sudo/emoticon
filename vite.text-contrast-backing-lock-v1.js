const TARGET = '/src/App.jsx'

const replaceRequired = (source, marker, replacement, label) => {
  const count = source.split(marker).length - 1
  if (count !== 1) {
    throw new Error(`[text-contrast-backing-v1] ${label} expected 1 occurrence, found ${count}`)
  }
  return source.replace(marker, replacement)
}

export function textContrastBackingLockV1Plugin() {
  return {
    name: 'text-contrast-backing-lock-v1',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null

      let out = code.replace(/\r\n/g, '\n')

      const koOld = "      '- 문자 바로 뒤 영역은 같은 셀의 다른 부분보다 시각 밀도를 낮게 유지하세요. 필요한 분리는 선택 화풍 고유의 농담, Negative Space, 워시, 밑칠, 역상 획, 외곽 붓질, 그림자 또는 재료 대비로 해결하세요.',"
      const koNew = [
        "      '- [투명 배경 대비 잠금] 문자 뒤를 무조건 비우는 것이 목적이 아닙니다. 투명 배경에서는 외부 메신저 배경색에 기대지 말고, 문구 자체가 밝은 화면과 어두운 화면 모두에서 읽히도록 각 문구 주변에 선택 화풍 고유의 국소 대비를 완성하세요.',",
        "      '- 글자가 거의 순검정 또는 순백색이면 그 색만 투명 배경 위에 단독으로 두지 마세요. 화풍에 맞는 유채색 또는 중간톤 워시·먹 농담·밑칠·기류·국소 광채·보조 외곽획 중 하나 이상을 글자 뒤나 가장자리에 제한적으로 배치해 글자의 최외곽을 배경에서 분리하세요.',",
        "      '- 색이 들어간 국소 배경이나 중간톤 받침은 허용하며 권장합니다. 단, 범용 사각 텍스트 박스나 화면을 메우는 순검정판·순백색판으로 해결하지 마세요. 받침 자체도 선택 화풍의 재료·형태·리듬을 따라야 합니다.',",
        "      '- 문자와 바로 맞닿는 배경 효과가 글자와 동일한 명도·색상으로 합쳐지지 않게 하세요. 검정 획은 충분히 밝거나 유채색인 국소 받침과, 흰 획은 충분히 어둡거나 유채색인 국소 받침과 분리되게 하며, 혼합색 글자는 주변에서 가장 안정적인 명도·색 대비를 선택하세요.',",
        "      '- 문자 주변의 시각 밀도는 가독성을 해치지 않을 정도로 정돈하되, 완전한 빈 공간을 강제하지 마세요. 필요한 분리는 선택 화풍 고유의 농담, 워시, 밑칠, 역상 획, 외곽 붓질, 그림자 또는 재료 대비로 해결하세요.',"
      ].join('\n')
      out = replaceRequired(out, koOld, koNew, 'Korean scene typography contrast marker')

      const enOld = "      '- Keep the area directly behind lettering visually calmer than the rest of the cell. Create separation using style-native value control, negative space, wash, underpainting, reverse strokes, edge brushwork, shadow or material contrast.',"
      const enNew = [
        "      '- [TRANSPARENT-BACKGROUND CONTRAST LOCK] The goal is not to force empty space behind lettering. On transparent output, never rely on the viewer or messenger background color; complete a style-native local contrast treatment around every phrase so it remains readable on both light and dark interfaces.',",
        "      '- If the lettering is near pure black or pure white, never leave that color alone against transparency. Add a restrained style-native colored or mid-tone wash, ink value, underpaint, aura, local glow or supporting edge stroke behind or around the phrase so the full glyph silhouette stays separated from any external background.',",
        "      '- A colored local backing or mid-tone support is allowed and encouraged. Do not solve this with a generic rectangular text box, an all-black plate or an all-white plate that dominates the sticker. The backing itself must inherit the selected style’s material, shape and rhythm.',",
        "      '- Do not let the immediately adjacent effect share the same value/color and merge into the glyph. Separate black strokes with a sufficiently lighter or colored local support, white strokes with a sufficiently darker or colored local support, and mixed-color lettering with the most stable local value/color contrast.',",
        "      '- Keep visual density around the phrase controlled enough for instant reading, but do not force a completely empty zone. Use style-native value control, wash, underpainting, reverse strokes, edge brushwork, shadow or material contrast as needed.',"
      ].join('\n')
      out = replaceRequired(out, enOld, enNew, 'English scene typography contrast marker')

      // Older model-specific lettering enhancers may still force a black + pure-white
      // sticker treatment. Normalize those lines when present so the final prompt uses
      // style-native local color/value contrast that survives both light and dark UIs.
      out = out
        .replaceAll(
          '- 기본 글자색은 진한 검정 또는 먹색을 중심으로 하고, 글자 전체에 두껍고 깨끗한 순백색 다이컷 외곽선을 두르세요.',
          '- 기본 글자색을 순검정 + 순백색 외곽선 조합으로 고정하지 마세요. 문자 색과 대비 받침은 선택 화풍이 결정하되, 투명 배경에서는 밝고 어두운 메신저 화면 양쪽에서 읽히도록 유채색 또는 중간톤의 국소 대비를 함께 확보하세요.'
        )
        .replaceAll(
          '- 굵은 검정·먹색 브러시/마커 획 + 두껍고 선명한 순백색 다이컷 외곽선을 기본 레터링 문법으로 사용하세요.',
          '- 굵기와 재료감은 선택 화풍을 따르되 순검정 획 + 순백 외곽선을 고정 공식으로 사용하지 마세요. 투명 배경에서 밝고 어두운 화면 모두에 견디는 유채색 또는 중간톤의 국소 대비를 화풍 안에서 함께 설계하세요.'
        )
        .replaceAll(
          'Prefer deep black/ink-like marker strokes with a thick crisp pure-white die-cut outline.',
          'Do not lock lettering to a pure-black plus pure-white-outline formula; let the selected style choose the lettering colors and add style-native colored or mid-tone local contrast so transparent stickers remain readable on both light and dark interfaces.'
        )
        .replaceAll(
          'using deep black/ink-like brush or marker strokes with a thick crisp pure-white die-cut outline.',
          'using style-native brush or marker strokes without locking them to a pure-black plus pure-white-outline formula; add colored or mid-tone local contrast that keeps transparent stickers readable on both light and dark interfaces.'
        )

      return out === code ? null : { code: out, map: null }
    },
  }
}
