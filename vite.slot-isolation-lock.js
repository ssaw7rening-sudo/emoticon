const TARGET = '/src/App.jsx'

const insertAfterOnce = (source, marker, lines, label) => {
  const first = source.indexOf(marker)
  if (first < 0) throw new Error(`[slot-isolation-lock] ${label} marker not found`)
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[slot-isolation-lock] ${label} marker is not unique`)
  }
  return source.slice(0, first) + marker + '\n' + lines.join('\n') + source.slice(first + marker.length)
}

export function slotIsolationLockPlugin() {
  return {
    name: 'slot-isolation-lock',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null

      let out = code.replace(/\r\n/g, '\n')

      // This plugin intentionally runs as a normal Vite transform. The scene/style
      // pre-plugins build the shared composition block first; this lock then strengthens
      // only the 15-sheet branch before React transforms the JSX source.
      const koMarker = "      '- 각 셀은 복잡한 만화 컷이나 포스터가 아니라 하나의 감정과 하나의 중심 행동이 즉시 읽히는 독립형 이모티콘 장면으로 설계하세요.',"
      const koLines = [
        "      '[슬롯 완전 격리 — NO CROSS-CELL OVERLAP HARD CONSTRAINT]',",
        "      '- 5열 × 3행의 15개 보이지 않는 슬롯은 각각 완전히 독립된 하나의 clipping canvas처럼 취급하세요. 슬롯 경계는 이미지에 그리지 않지만 배치 판단에서는 절대 경계입니다.',",
        "      '- 캐릭터·머리카락·의상·손·발·소품·문자·외곽선·그림자·빛·먹선·속도선·장풍·기류·잔상·먼지·반짝임 등 모든 시각 요소의 최외곽까지 반드시 자기 슬롯 안에서 완전히 끝나야 합니다.',",
        "      '- 어떤 요소도 인접 슬롯의 캐릭터·문자·효과 영역으로 넘어가거나 접촉하거나 겹쳐서는 안 됩니다. 한 슬롯의 붓획·머리카락·효과가 옆 슬롯과 이어져 하나의 장면처럼 보이는 것도 금지합니다.',",
        "      '- 긴 머리카락·옷자락·팔·손·무기·속도선·장풍처럼 바깥으로 뻗는 요소는 경계를 넘긴 뒤 잘라내지 말고, 처음부터 슬롯 내부에서 방향을 꺾거나 압축하거나 자연스럽게 소멸하도록 연출하세요.',",
        "      '- 인접 슬롯 사이에는 명확한 Negative Gutter를 확보하세요. 각 슬롯 외곽 약 5~8%는 안전 여백으로 보고 이웃 방향으로 뻗는 강한 실루엣·문자·효과를 두지 마세요.',",
        "      '- 슬롯이 비좁아지면 문자나 캐릭터 일부를 경계 밖으로 밀어내지 말고 캐릭터 크기·카메라 거리·포즈·문구 크기·효과 길이와 방향을 다시 설계하세요. 의도치 않은 크롭으로 해결하지 마세요.',",
        "      '- 강한 동세는 슬롯을 넘는 크기로 증명하지 않습니다. 선택 화풍의 선·곡선·압축·원근·리듬을 이용해 같은 슬롯 내부에서 충분히 강하게 표현하세요.',",
        "      '- 15개 장면은 서로 연결된 만화 장면이 아니라 독립된 이모티콘 15개입니다. 각 슬롯은 시작부터 끝까지 자체 실루엣·문자·효과가 완결되어야 합니다.',",
        "      '- 최종 렌더링 직전 15개 슬롯을 각각 검사하세요. 자기 슬롯 밖으로 나가는 캐릭터·문자·효과 픽셀이 하나라도 예상되면 해당 셀의 크기·카메라·동세·효과를 먼저 재배치한 뒤 생성하세요.'"
      ]
      out = insertAfterOnce(out, koMarker, koLines, 'Korean sheet composition')

      const enMarker = "      '- Each slot is an independent sticker scene with one immediately readable emotion and one primary action, not a dense comic panel or poster.',"
      const enLines = [
        "      '[COMPLETE SLOT ISOLATION — NO CROSS-CELL OVERLAP HARD CONSTRAINT]',",
        "      '- Treat the invisible 5-column × 3-row sheet as 15 completely independent clipping canvases. Do not draw the boundaries, but treat them as absolute composition limits.',",
        "      '- Every outermost part of the character, hair, clothing, hands, feet, props, lettering, outlines, shadows, light, ink, speed lines, energy, particles and motion trails must finish completely inside its own slot.',",
        "      '- No visual element may enter, touch or overlap a neighboring slot’s character, lettering or effects. Never let brush strokes, hair or effects visually connect two stickers into one scene.',",
        "      '- For outward-reaching hair, fabric, limbs, weapons or effects, do not let them cross the boundary and then crop them. Restage from the start so they bend, compress, redirect or dissipate naturally before the slot edge.',",
        "      '- Preserve a clear Negative Gutter between neighboring stickers. Treat roughly the outer 5–8% of every slot as safety space and keep strong silhouettes, lettering and outward effects away from the neighboring direction.',",
        "      '- If a slot becomes crowded, redesign character scale, camera distance, pose, lettering scale, effect length or effect direction. Never solve crowding by pushing content across the slot boundary or by accidental cropping.',",
        "      '- Strong motion does not require crossing the slot. Express intensity through style-native line, curve, compression, perspective and rhythm while remaining fully contained.',",
        "      '- The 15 scenes are 15 independent messenger stickers, not one continuous comic tableau. Each slot must have its own fully self-contained silhouette, lettering and effects.',",
        "      '- Immediately before rendering, inspect all 15 slots individually. If any character, text or effect is expected to escape its own slot, restage that cell before generation.'"
      ]
      out = insertAfterOnce(out, enMarker, enLines, 'English sheet composition')

      return { code: out, map: null }
    },
  }
}
