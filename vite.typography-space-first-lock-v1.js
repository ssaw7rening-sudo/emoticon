const TARGET = '/src/App.jsx'

const countOccurrences = (source, marker) => source.split(marker).length - 1

export function typographySpaceFirstLockV1Plugin() {
  return {
    name: 'typography-space-first-lock-v1',
    enforce: 'post',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null

      let out = code.replace(/\r\n/g, '\n')

      const koMarker = "      '[문자 가독성 보호 — 화풍 유지형 HARD CONSTRAINT]',"
      const koReplacement = [
        koMarker,
        "      '- [생성 순서 잠금] 캐릭터를 먼저 완성한 뒤 남는 곳에 문자를 넣지 마세요. 각 셀은 반드시 문구의 위치·줄 수·크기·Text Safe Zone을 먼저 확정한 뒤 캐릭터 점유 영역, 카메라, 효과 흐름을 설계하세요.',",
        "      '- 각 셀에서 문자용 시각 공간을 처음부터 충분히 선점하세요. 일반적으로 셀 면적의 약 20~30%를 문자와 주변 여백을 위한 가용 영역으로 확보하되, 긴 문구나 시각 밀도가 높은 화풍은 필요한 만큼 더 넓게 확보하세요.',",
        "      '- 문자 안전영역 안에는 얼굴·손·소품·복잡한 의상 주름·강한 명암 덩어리·패턴·스크린톤·픽셀 장식·먹비산·속도선·광선·장식 효과 등 높은 시각 밀도의 요소를 두지 마세요.',",
        "      '- 캐릭터나 효과가 문자 공간과 충돌하면 문자를 줄이거나 밀어내지 말고 캐릭터의 크기·위치·포즈·카메라 또는 효과량을 다시 설계하세요. 문자 가독성을 희생해 캐릭터 화면 점유율을 키우는 것은 금지합니다.',",
        "      '- 문자 바로 뒤 영역은 같은 셀의 다른 부분보다 시각 밀도를 낮게 유지하세요. 필요한 분리는 선택 화풍 고유의 농담, 여백, 워시, 밑칠, 역상 획, 그림자, 재료 대비 등으로 만들고 범용 사각 박스나 획일적인 흰 스티커 외곽선으로 평균화하지 마세요.',",
        "      '- 먹선·스크린톤·민화 문양·픽셀·그래피티·네온·자수·크레파스처럼 본래 시각 밀도가 높은 화풍일수록 Text Safe Zone 주변의 효과 밀도를 더 적극적으로 낮추되, 문자 획과 재료감 자체는 반드시 해당 화풍의 Typography DNA를 유지하세요.',",
        "      '- 생성 직전 각 셀을 다시 검사하세요: 문구 전체가 작은 메신저 화면에서 즉시 읽히는가, 어떤 효과선도 글자를 관통하지 않는가, 자모가 배경과 합쳐지지 않는가. 하나라도 아니면 캐릭터·효과 구도를 먼저 수정한 뒤 렌더링하세요.',",
        "      '- 충돌 시 우선순위는 캐릭터 정체성·고정 의상 유지 → 선택 화풍 유지 → 문자 철자 정확성·순간 가독성 → 문구 의미 연출 → 캐릭터 화면 점유율·효과량 순입니다.'"
      ].join('\n')

      const enMarker = "      '[TYPOGRAPHY LEGIBILITY LOCK — STYLE-PRESERVING HARD CONSTRAINT]',"
      const enReplacement = [
        enMarker,
        "      '- [GENERATION-ORDER LOCK] Never finish the character first and place lettering in leftover space. For every cell, establish phrase position, line count, scale and Text Safe Zone first; only then design character occupancy, camera and effect flow.',",
        "      '- Reserve meaningful visual area for lettering from the start. As a general target, keep roughly 20–30% of each cell available for the phrase and its breathing room, expanding it for long phrases or visually dense styles.',",
        "      '- Keep faces, hands, props, dense clothing folds, heavy value masses, patterns, screentones, pixel ornaments, ink splashes, speed lines, light rays and decorative effects out of the lettering safe zone.',",
        "      '- If the character or effects collide with the lettering zone, do not shrink or push away the text. Restage character scale, position, pose, camera or effect amount first. Never sacrifice instant readability to maximize character occupancy.',",
        "      '- Keep the area directly behind lettering visually calmer than the rest of the cell. Create separation with style-native value control, negative space, wash, underpainting, reverse strokes, shadow or material contrast rather than generic boxes or a mandatory white sticker outline.',",
        "      '- In inherently dense styles such as ink manga, screentone comics, folk painting, pixel art, graffiti, neon, embroidery or crayon, reduce effect density around the Text Safe Zone more aggressively while preserving that style’s native Typography DNA in the glyphs themselves.',",
        "      '- Immediately before rendering each cell, verify that the complete phrase reads instantly at messenger size, no effect line crosses the glyphs, and no consonant/vowel/final stroke merges into the background. If any check fails, revise character/effect composition before rendering.',",
        "      '- Conflict priority: preserve character identity/fixed outfit → preserve selected art style → exact spelling and instant lettering readability → phrase meaning performance → character occupancy and effect amount.'"
      ].join('\n')

      const koCount = countOccurrences(out, koMarker)
      const enCount = countOccurrences(out, enMarker)
      if (koCount !== 1) {
        throw new Error(`[typography-space-first-v1] expected exactly one Korean typography marker, found ${koCount}`)
      }
      if (enCount !== 1) {
        throw new Error(`[typography-space-first-v1] expected exactly one English typography marker, found ${enCount}`)
      }

      out = out.replace(koMarker, koReplacement)
      out = out.replace(enMarker, enReplacement)

      return { code: out, map: null }
    },
  }
}
