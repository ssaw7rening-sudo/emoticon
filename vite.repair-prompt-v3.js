const TARGET = '/src/App.jsx'

export function repairPromptV3Plugin() {
  return {
    name: 'repair-prompt-v3',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null

      let out = code
      const copyMarker = '  const copyRepairPrompt = '
      const copyIndex = out.indexOf(copyMarker)
      if (copyIndex < 0) throw new Error('[repair-prompt-v3] copyRepairPrompt marker not found')
      if (out.indexOf(copyMarker, copyIndex + copyMarker.length) >= 0) {
        throw new Error('[repair-prompt-v3] copyRepairPrompt marker is not unique')
      }

      const helper = `  const getRepairPromptV3 = (repairType, textMode, model = 'gpt') => {
    const targetPhrase = getSelectedPhrase();
    const isSheet = generationMode === 'sheet';
    const modelName = model === 'gemini' ? 'Gemini' : model === 'grok' ? 'Grok' : 'ChatGPT';
    const currentCharTrait = charManual.trim() || '';
    const selectedStyle = getSelectedArtStyle() || '';
    const phrasePlanKo = emoticons.map((phrase, index) => \`\${Math.floor(index / 5) + 1}행 \${index % 5 + 1}열: "\${phrase.trim()}"\`).join('\\n');
    const phrasePlanEn = emoticons.map((phrase, index) => \`Row \${Math.floor(index / 5) + 1}, Col \${index % 5 + 1}: "\${phrase.trim()}"\`).join('\\n');

    const styleLockKo = selectedStyle
      ? \`현재 선택 화풍 "\${selectedStyle}"의 Rendering + Acting + Camera + Effects + Typography 문법을 그대로 유지하세요.\`
      : '현재 이미지의 화풍과 렌더링·연출 문법을 그대로 유지하세요.';
    const styleLockEn = selectedStyle
      ? \`Preserve the currently selected art style "\${selectedStyle}" across Rendering, Acting, Camera, Effects and Typography.\`
      : 'Preserve the current image style and directing language.';
    const identitySourceKo = characterSource === 'photo'
      ? '이 채팅에 첨부된 원본 참고 사진을 캐릭터 정체성의 최우선 기준으로 사용하세요.'
      : \`현재 캐릭터 설정을 정체성 보조 기준으로 사용하세요: "\${currentCharTrait || '현재 이미지의 동일 캐릭터'}"\`;
    const identitySourceEn = characterSource === 'photo'
      ? 'Use the original reference photo attached in this chat as the highest-priority identity reference.'
      : \`Use the current character setup as supporting identity reference: "\${currentCharTrait || 'the same character in the current image'}"\`;

    const sheetIsolationKo = isSheet ? \`
[15개 슬롯 완전 격리 — HARD LOCK]
- 현재 5열 × 3행, 정확히 15개 구조와 각 셀의 문구·장면 의미를 유지하세요.
- 문제가 없는 셀은 가능한 한 변경하지 마세요.
- 각 슬롯 가장자리 최소 8%, 가능하면 10%는 Absolute Empty Gutter로 완전히 비워 두세요.
- 캐릭터·머리카락·옷자락·손·발·소품·문자·외곽선·그림자·먹선·속도선·장풍·기류·잔상·빛·먼지 등 모든 최외곽 요소가 자기 슬롯 안에서 완전히 끝나야 합니다.
- 인접 슬롯의 붓획·빛·먹번짐·효과가 닿거나 하나의 연속 장면처럼 이어져 보이는 것도 금지합니다.
- 경계 충돌 위험이 있으면 해당 셀의 캐릭터 + 문자 + 효과 전체를 하나의 Scene Group으로 묶어 90% → 85% → 80% 순으로 균일 축소하고 안전영역 안에 재배치하세요. 크롭으로 해결하지 마세요.
\` : \`
[단일 이미지 구도 LOCK]
- 현재 장면의 감정·행동·화풍을 유지하세요.
- 신체·문자·효과를 잘라내지 말고 장면 전체를 균일 축소·재배치하여 화면 내부에 완전히 넣으세요.
\`;

    const sheetIsolationEn = isSheet ? \`
[15-SLOT COMPLETE ISOLATION — HARD LOCK]
- Preserve the exact 5-column × 3-row structure and all 15 assigned phrases/scenes.
- Leave unaffected cells unchanged whenever possible.
- Keep at least 8%, preferably 10%, of every slot edge as an Absolute Empty Gutter.
- Every outermost part of the character, hair, clothing, limbs, props, lettering, outlines, shadows and effects must terminate fully inside its own slot.
- Adjacent brush strokes, glows, particles or effects must not touch or visually connect two cells.
- If anything risks a boundary collision, treat character + lettering + effects as one Scene Group and uniformly scale it 90% → 85% → 80% until it fits completely inside the safe frame. Never solve this by cropping.
\` : \`
[SINGLE IMAGE COMPOSITION LOCK]
Preserve the current scene and style. Keep the complete body, text and effects inside the canvas by scaling/repositioning the whole scene instead of cropping.
\`;

    if (lang === 'ko') {
      if (repairType === 'identity') return \`[수정 모드 — 얼굴·캐릭터 정체성 복원]
[대상 AI: \${modelName}]
첨부한 현재 이미지를 처음부터 새로 생성하지 마세요. 현재 결과의 전체 구성과 잘된 부분을 최대한 보존하면서 캐릭터 정체성 오류만 선택적으로 수정하세요.

[최우선 기준]
\${identitySourceKo}
얼굴형, 눈매와 눈 사이 간격, 눈썹, 코, 입술·입 모양, 턱선, 헤어스타일·머리 길이, 피부톤 또는 털 색상, 대표적인 인상을 모든 관련 셀에서 동일하게 복원·통일하세요.

[절대 유지]
- 현재 5×3 배치 또는 현재 단일 구도
- 현재 의상과 고정 액세서리
- 현재 문구와 문구 위치
- 각 장면의 감정과 핵심 행동
- 이미 잘된 포즈·카메라·효과
- \${styleLockKo}

[수정 범위 최소화]
얼굴을 고친다는 이유로 다른 사람이나 새로운 캐릭터로 재디자인하지 마세요. 정체성 문제가 있는 부분만 고치고 문제가 없는 셀과 요소는 가능한 한 그대로 보존하세요.
\${isSheet ? '15개 셀을 비교했을 때 모두 같은 인물·같은 캐릭터로 보여야 하며 얼굴 수정 때문에 문구·슬롯·효과 위치를 바꾸지 마세요.' : ''}\`;

      if (repairType === 'text') return \`[수정 모드 — 문자 오류만 수정 / IMAGE LOCK]
[대상 AI: \${modelName}]
첨부한 현재 이미지를 기준으로 문자만 수정하세요. 캐릭터·얼굴·의상·포즈·카메라·효과·배치·색감·배경·화풍을 다시 생성하거나 변경하지 마세요.

[IMAGE LOCK — 절대 변경 금지]
- 캐릭터 얼굴·체형·머리카락·의상
- 표정·손동작·자세·카메라 구도
- 소품·효과·배경·색감
- 현재 슬롯과 캐릭터 위치
- \${styleLockKo}

\${isSheet ? '[정확한 15개 원문 — 셀 위치 변경 금지]\\n' + phrasePlanKo : '[정확한 원문]\\n"' + targetPhrase + '"'}

[텍스트 HARD LOCK]
- 지정 문구를 지정 위치에서 정확히 1회만 출력하세요.
- 번역·의역·철자 변경·생략·중복·합치기·임의 글자 추가 금지.
- 문구를 다른 셀과 교환하지 마세요.
- 정확한 문구는 그대로 유지하고 오타가 있는 글자만 다시 그리세요.
- 한글 초성·중성·종성과 받침을 명확히 유지하고 ㅗ/ㅜ, ㅏ/ㅓ, ㄹ/ㅌ을 혼동·병합하지 마세요.
- 정확성을 위해 범용 고딕·산세리프·일반 스티커 폰트로 바꾸지 말고 현재 화풍의 Typography DNA를 유지하세요.
- 말풍선·텍스트 박스·추가 문구·새 장식을 만들지 마세요.

[최종 검수]
\${isSheet ? '15개 셀의 문구를 원문과 하나씩 대조하여 철자·띄어쓰기·문장부호·반복 문자 수까지 맞는지 확인하고, 틀린 글자만 수정된 상태로 마무리하세요.' : '최종 문구를 원문과 문자 단위로 대조한 뒤 마무리하세요.'}\`;

      return \`[수정 모드 — 구도·이미지 결함 정밀 보정]
[대상 AI: \${modelName}]
첨부한 현재 이미지를 새로 재디자인하지 말고 현재 결과에서 실제로 발생한 시각적 결함만 선택적으로 수정하세요.

[절대 유지]
- 동일한 캐릭터 정체성·얼굴·체형
- 의상과 고정 액세서리
- 현재 문구와 철자
- 장면별 감정과 행동 의미
- 전체 색감과 \${styleLockKo}

[우선 수정 대상]
- 캐릭터·머리카락·옷자락·손·발·소품·문자·효과가 다른 슬롯을 침범하거나 닿는 문제
- 붓획·먹비산·속도선·빛·장풍·기류·잔상이 이웃 셀로 넘어가거나 연결되는 문제
- 잘린 신체·의도치 않은 크롭·추가 팔다리·손가락 수 오류·뒤틀린 손발·얼굴 비대칭·비정상적인 신체 연결
- 소품과 신체의 비정상적인 겹침·문자와 캐릭터/효과 충돌·깨진 배경·불필요한 요소
\${sheetIsolationKo}
[수정 범위 최소화]
결함이 없는 셀은 가능한 한 변경하지 마세요. 한 셀을 고치면서 다른 셀의 얼굴·포즈·문자·화풍을 다시 설계하지 마세요.\`;
    }

    const localeHeader = lang === 'ja'
      ? '[修正モード — 選択箇所のみ精密修正]'
      : lang === 'zh'
      ? '[修正模式 — 仅精修所选问题]'
      : '[EDIT MODE — PRECISION REPAIR ONLY]';

    if (repairType === 'identity') return \`\${localeHeader}
[TARGET AI: \${modelName}]
Do not regenerate the image from scratch. Preserve the current composition and successful content, and correct only character-identity errors.
\${identitySourceEn}
Unify face shape, eye shape/spacing, brows, nose, mouth, jawline, hair, skin/fur color and signature identity across relevant cells.
Preserve outfit, exact text, text positions, emotions, successful poses/camera/effects. \${styleLockEn}
Do not redesign unaffected cells or turn the subject into a different character.\`;

    if (repairType === 'text') return \`\${localeHeader}
[TEXT ERRORS ONLY — IMAGE LOCK]
[TARGET AI: \${modelName}]
Do not alter the character, face, outfit, pose, camera, effects, layout, background, colors or art style. Correct only erroneous lettering.
\${styleLockEn}
\${isSheet ? '[EXACT 15 SOURCE PHRASES — DO NOT SWAP CELLS]\\n' + phrasePlanEn : '[EXACT SOURCE PHRASE]\\n"' + targetPhrase + '"'}
Render every assigned phrase exactly once in its assigned position. Do not translate, paraphrase, respell, omit, duplicate, merge or invent text. Preserve correct lettering and redraw only erroneous glyphs. Do not add speech bubbles, text boxes or new decorative text.\`;

    return \`\${localeHeader}
[LAYOUT / IMAGE DEFECT PRECISION FIX]
[TARGET AI: \${modelName}]
Do not redesign the current image. Fix only actual visual defects while preserving successful content.
LOCK: same character identity, outfit, exact wording, scene meanings and overall colors. \${styleLockEn}
FIX: cross-cell overlap, hair/clothing/limbs/text/effects crossing boundaries, adjacent effects connecting, cropped anatomy, extra limbs/fingers, malformed hands/feet, unintended crop, abnormal overlap, text collisions, broken background or unwanted elements.
\${sheetIsolationEn}
Leave unaffected cells and elements unchanged whenever possible.\`;
  };

`;

      out = out.slice(0, copyIndex) + helper + out.slice(copyIndex)

      const oldCall = 'navigator.clipboard.writeText(getRepairPrompt(repairType, textMode, model));'
      const callCount = out.split(oldCall).length - 1
      if (callCount !== 1) throw new Error(`[repair-prompt-v3] expected one repair clipboard call, found ${callCount}`)
      out = out.replace(oldCall, 'navigator.clipboard.writeText(getRepairPromptV3(repairType, textMode, model));')

      out = out
        .replaceAll("geminiRepairCrop: '이미지 결함'", "geminiRepairCrop: '구도·이미지 결함'")
        .replaceAll("geminiRepairCrop: 'Image defects'", "geminiRepairCrop: 'Layout / image defects'")
        .replaceAll("geminiRepairCrop: '画像の不具合'", "geminiRepairCrop: '構図・画像不具合'")
        .replaceAll("geminiRepairCrop: '图像缺陷'", "geminiRepairCrop: '构图与图像缺陷'")
        .replaceAll(
          "repairHelp: '수정할 이미지를 같은 AI 채팅에 첨부한 뒤, 아래 버튼으로 복사한 수정 요청을 붙여넣으세요. 글자 오류는 완벽한 수정을 보장하지 않습니다.'",
          "repairHelp: '수정할 이미지를 같은 AI 채팅에 첨부한 뒤 아래 요청을 붙여넣으세요. 잘된 부분은 잠그고 선택한 문제만 수정하도록 설계되어 있습니다. 글자 오류는 완벽한 수정을 보장하지 않습니다.'"
        )
        .replaceAll(
          "repairHelp: 'Attach the image to the same AI chat, then paste the correction request copied below. Text corrections are not guaranteed to be perfect.'",
          "repairHelp: 'Attach the image to the same AI chat and paste a request below. Successful content is locked so only the selected problem is edited. Text corrections are not guaranteed to be perfect.'"
        )

      return { code: out, map: null }
    },
  }
}
