const TARGET = '/src/App.jsx'

const replaceUniqueText = (source, marker, replacement, label) => {
  const first = source.indexOf(marker)
  if (first < 0) throw new Error(`[slot-isolation-lock] ${label} marker not found`)
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[slot-isolation-lock] ${label} marker is not unique`)
  }
  return source.slice(0, first) + replacement + source.slice(first + marker.length)
}

export function slotIsolationLockPlugin() {
  return {
    name: 'slot-isolation-lock',
    enforce: 'post',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null

      let out = code.replace(/\r\n/g, '\n')

      // Run after the existing scene/style prompt transforms. Match only the unique
      // sheet-mode sentence content so quote style/formatting changes made by React or
      // other transforms cannot break this lock.
      const koMarker = '- 각 셀은 복잡한 만화 컷이나 포스터가 아니라 하나의 감정과 하나의 중심 행동이 즉시 읽히는 독립형 이모티콘 장면으로 설계하세요.'
      const koLock = [
        koMarker,
        '[슬롯 완전 격리 — NO CROSS-CELL OVERLAP HARD CONSTRAINT]',
        '- 5열 × 3행의 15개 보이지 않는 슬롯은 각각 완전히 독립된 하나의 clipping canvas처럼 취급하세요. 슬롯 경계는 이미지에 그리지 않지만 배치 판단에서는 절대 경계입니다.',
        '- 캐릭터·머리카락·의상·손·발·소품·문자·외곽선·그림자·빛·먹선·속도선·장풍·기류·잔상·먼지·반짝임 등 모든 시각 요소의 최외곽까지 반드시 자기 슬롯 안에서 완전히 끝나야 합니다.',
        '- 어떤 요소도 인접 슬롯의 캐릭터·문자·효과 영역으로 넘어가거나 접촉하거나 겹쳐서는 안 됩니다. 한 슬롯의 붓획·머리카락·효과가 옆 슬롯과 이어져 하나의 장면처럼 보이는 것도 금지합니다.',
        '- 긴 머리카락·옷자락·팔·손·무기·속도선·장풍처럼 바깥으로 뻗는 요소는 경계를 넘긴 뒤 잘라내지 말고, 처음부터 슬롯 내부에서 방향을 꺾거나 압축하거나 자연스럽게 소멸하도록 연출하세요.',
        '- 인접 슬롯 사이에는 명확한 Negative Gutter를 확보하세요. 각 슬롯 외곽 최소 8%, 권장 10%는 안전 여백으로 보고 이웃 방향으로 뻗는 강한 실루엣·문자·효과를 두지 마세요.',
        '[슬롯 내부 안전 프레임 — ABSOLUTE INNER BOUNDING BOX]',
        '- 각 슬롯 전체를 전부 사용하는 것이 아니라 슬롯 중심부의 가로 약 80~84% × 세로 약 80~84%만 실제 렌더링 가능 영역으로 사용하세요.',
        '- 슬롯 가장자리 최소 8%, 가능하면 10%는 절대 빈 공간(Absolute Empty Gutter)으로 남기고, 이 영역에는 캐릭터·머리카락·의상·손·발·소품·문자·외곽선·그림자·붓획·먹비산·속도선·장풍·기류·잔상·빛·먼지·반짝임 등 어떠한 시각 요소의 최외곽도 들어가지 않게 하세요.',
        '- 이 안전 프레임은 권장 여백이 아니라 슬롯별 내부 clipping boundary입니다. 경계에 닿는 것 자체를 실패로 간주하고 모든 요소가 안전 프레임 안에서 완전히 종료되게 하세요.',
        '- 인접 슬롯의 붓획·폭발·빛·먹번짐·배경 효과가 서로 가까워져 하나의 연속된 장면처럼 읽히는 구성도 금지합니다. 각 슬롯의 효과는 자기 슬롯 중앙 방향으로 회수되거나 내부에서 자연스럽게 소멸해야 합니다.',
        '[경계 충돌 시 자동 축소 규칙 — SCENE GROUP AUTO-SHRINK]',
        '- 슬롯 경계 또는 내부 안전 프레임과 충돌 가능성이 있으면 문자만 줄이거나 캐릭터 일부를 크롭하거나 효과 끝을 잘라내지 마세요.',
        '- 대신 해당 셀의 캐릭터·문자·효과를 하나의 완성된 Scene Group으로 묶어 90% → 85% → 80% 순으로 균일하게 축소하고, 모든 요소가 내부 안전 프레임 안에 완전히 들어올 때까지 다시 배치하세요.',
        '- 강한 동세와 효과의 크기보다 완전한 슬롯 격리가 우선합니다. 동세는 슬롯을 넘는 크기가 아니라 선·곡선·압축·원근·리듬으로 표현하세요.',
        '- 슬롯이 비좁아지면 문자나 캐릭터 일부를 경계 밖으로 밀어내지 말고 캐릭터 크기·카메라 거리·포즈·문구 크기·효과 길이와 방향을 다시 설계하세요. 의도치 않은 크롭으로 해결하지 마세요.',
        '- 15개 장면은 서로 연결된 만화 장면이 아니라 독립된 이모티콘 15개입니다. 각 슬롯은 시작부터 끝까지 자체 실루엣·문자·효과가 완결되어야 합니다.',
        '- 최종 렌더링 직전 15개 슬롯을 각각 독립 이미지로 잘라낸다고 가정해 검사하세요. 어떤 캐릭터·문자·효과도 잘리거나 경계에 닿거나 이웃과 연결되지 않아야 합니다. 하나라도 예상되면 해당 셀의 Scene Group을 먼저 축소·재배치한 뒤 생성하세요.'
      ].join('\\n')
      out = replaceUniqueText(out, koMarker, koLock, 'Korean sheet composition')

      const enMarker = '- Each slot is an independent sticker scene with one immediately readable emotion and one primary action, not a dense comic panel or poster.'
      const enLock = [
        enMarker,
        '[COMPLETE SLOT ISOLATION — NO CROSS-CELL OVERLAP HARD CONSTRAINT]',
        '- Treat the invisible 5-column × 3-row sheet as 15 completely independent clipping canvases. Do not draw the boundaries, but treat them as absolute composition limits.',
        '- Every outermost part of the character, hair, clothing, hands, feet, props, lettering, outlines, shadows, light, ink, speed lines, energy, particles and motion trails must finish completely inside its own slot.',
        '- No visual element may enter, touch or overlap a neighboring slot’s character, lettering or effects. Never let brush strokes, hair or effects visually connect two stickers into one scene.',
        '- For outward-reaching hair, fabric, limbs, weapons or effects, do not let them cross the boundary and then crop them. Restage from the start so they bend, compress, redirect or dissipate naturally before the slot edge.',
        '- Preserve a clear Negative Gutter between neighboring stickers. Treat at least the outer 8% of every slot, preferably 10%, as safety space and keep strong silhouettes, lettering and outward effects away from the neighboring direction.',
        '[ABSOLUTE INNER BOUNDING BOX — SLOT SAFE FRAME]',
        '- Do not use the full slot as drawable area. Use only roughly the central 80–84% of each slot in both width and height as the practical rendering zone.',
        '- Keep at least 8%, preferably 10%, of every slot edge as an Absolute Empty Gutter. No outermost pixel of character, hair, clothing, hands, feet, props, lettering, outlines, shadows, brush marks, ink splatter, speed lines, energy, particles, glow or motion trails may enter this gutter.',
        '- This safe frame is not a suggestion. Treat it as an internal clipping boundary. Touching the safe-frame edge counts as failure; every element must visibly terminate before it.',
        '- Never allow adjacent brush strokes, explosions, glows, ink washes or background effects to approach so closely that two stickers read as one continuous scene. Redirect or dissipate each effect back toward the center of its own slot.',
        '[BOUNDARY COLLISION AUTO-SHRINK — SCENE GROUP RULE]',
        '- If any element risks touching the slot boundary or inner safe frame, do not shrink only the text, crop the character, or cut off the effect tip.',
        '- Instead, treat character + lettering + effects as one complete Scene Group and uniformly scale the group 90% → 85% → 80% until every outermost element fits fully inside the safe frame, then restage it inside the slot.',
        '- Complete slot isolation has higher priority than oversized motion or effects. Express intensity with style-native line, curve, compression, perspective and rhythm rather than by crossing the slot.',
        '- If a slot becomes crowded, redesign character scale, camera distance, pose, lettering scale, effect length or effect direction. Never solve crowding by pushing content across the slot boundary or by accidental cropping.',
        '- The 15 scenes are 15 independent messenger stickers, not one continuous comic tableau. Each slot must have its own fully self-contained silhouette, lettering and effects.',
        '- Immediately before rendering, inspect all 15 slots as if each were exported as a separate image. Nothing may be clipped, touch the boundary, or visually connect to a neighboring sticker. If any risk remains, shrink and restage that Scene Group before generation.'
      ].join('\\n')
      out = replaceUniqueText(out, enMarker, enLock, 'English sheet composition')

      return { code: out, map: null }
    },
  }
}
