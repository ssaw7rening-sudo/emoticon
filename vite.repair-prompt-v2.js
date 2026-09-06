const TARGET = '/src/App.jsx'

function replacementRepairPrompt(repairType, textMode, model = 'gpt') {
  const targetPhrase = getSelectedPhrase();
  const isSheetRepair = generationMode === 'sheet';
  const modelName = model === 'gemini' ? 'Gemini' : model === 'grok' ? 'Grok' : 'ChatGPT';
  const currentCharTrait = charManual.trim() || '';
  const selectedStyle = getSelectedArtStyle() || '';

  const panelPlanKo = emoticons
    .map((phrase, index) => `${Math.floor(index / 5) + 1}행 ${index % 5 + 1}열: "${phrase.trim()}"`)
    .join('\n');
  const panelPlanEn = emoticons
    .map((phrase, index) => `Row ${Math.floor(index / 5) + 1}, Col ${index % 5 + 1}: "${phrase.trim()}"`)
    .join('\n');
  const panelPlanJa = emoticons
    .map((phrase, index) => `${Math.floor(index / 5) + 1}行 ${index % 5 + 1}列: 「${phrase.trim()}」`)
    .join('\n');
  const panelPlanZh = emoticons
    .map((phrase, index) => `第${Math.floor(index / 5) + 1}行 第${index % 5 + 1}列: “${phrase.trim()}”`)
    .join('\n');

  const identitySourceKo = characterSource === 'photo'
    ? '이 채팅에 처음 첨부된 원본 참고 사진을 캐릭터 정체성의 최우선 기준으로 사용하세요.'
    : `현재 캐릭터 설정을 정체성 보조 기준으로 사용하세요: "${currentCharTrait || '현재 이미지의 동일 캐릭터'}"`;
  const identitySourceEn = characterSource === 'photo'
    ? 'Use the original reference photo previously attached in this chat as the highest-priority identity reference.'
    : `Use the current character setup as supporting identity reference: "${currentCharTrait || 'the same character shown in the current image'}"`;
  const identitySourceJa = characterSource === 'photo'
    ? 'このチャットで最初に添付された元の参考写真を、キャラクター同一性の最優先基準として使用してください。'
    : `現在のキャラクター設定を同一性の補助基準として使用してください: 「${currentCharTrait || '現在画像の同一キャラクター'}」`;
  const identitySourceZh = characterSource === 'photo'
    ? '请把本对话中最初上传的原始参考照片作为角色身份的最高优先级依据。'
    : `请把当前角色设定作为身份辅助依据：“${currentCharTrait || '当前图片中的同一角色'}”`;

  const styleKo = selectedStyle ? `현재 선택 화풍 "${selectedStyle}"은 그대로 유지하세요.` : '현재 이미지의 화풍과 렌더링 문법을 그대로 유지하세요.';
  const styleEn = selectedStyle ? `Preserve the currently selected art style "${selectedStyle}" exactly.` : 'Preserve the current image style and rendering language exactly.';
  const styleJa = selectedStyle ? `現在選択中の画風「${selectedStyle}」をそのまま維持してください。` : '現在画像の画風と描画ルールをそのまま維持してください。';
  const styleZh = selectedStyle ? `请完整保留当前选择的画风“${selectedStyle}”。` : '请完整保留当前图片的画风与渲染语言。';

  if (lang === 'ko') {
    const sheetLock = isSheetRepair
      ? `[15개 시트 슬롯 격리 HARD LOCK]
- 5열 × 3행 구조와 각 셀의 현재 문구·장면 의미를 유지하세요.
- 문제가 없는 셀은 가능한 한 변경하지 마세요.
- 각 슬롯 가장자리 최소 8%, 가능하면 10%는 절대 빈 공간으로 유지하세요.
- 머리카락·의상·손·발·문자·외곽선·먹선·속도선·장풍·빛·잔상 등 모든 최외곽 요소는 자기 슬롯 내부에서 완전히 끝나야 합니다.
- 인접 슬롯과 닿거나 이어져 보이는 효과도 금지합니다.
- 경계 충돌 가능성이 있으면 해당 셀의 캐릭터+문자+효과 전체 Scene Group을 90% → 85% → 80% 순으로 균일 축소해 내부에 재배치하세요. 크롭으로 해결하지 마세요.`
      : `[단일 이미지 구도 HARD LOCK]
- 현재 장면의 감정·행동·화풍을 유지하세요.
- 신체, 소품, 문자, 효과의 최외곽까지 화면 안에 완전히 들어오게 하세요.
- 경계 충돌 시 일부를 잘라내지 말고 장면 전체를 균일하게 축소·재배치하세요.`;

    const exactText = isSheetRepair
      ? `[정확한 15개 원문 — 셀 위치 변경 금지]
${panelPlanKo}`
      : `[정확한 원문]
"${targetPhrase}"`;

    const prompts = {
      identity: `[수정 모드 — 얼굴·캐릭터 정체성 복원]
[대상 AI: ${modelName}]
첨부한 현재 이미지를 처음부터 새로 만들지 말고, 현재 이미지의 전체 구성과 잘된 부분을 최대한 보존한 상태에서 캐릭터 정체성 오류만 선택적으로 수정하세요.

[최우선 목표]
${identitySourceKo}
얼굴형, 눈매와 눈 사이 간격, 눈썹, 코, 입술·입 모양, 턱선, 헤어스타일·머리 길이, 피부톤 또는 털 색상, 대표적인 인상을 모든 셀에서 동일하게 복원·통일하세요.

[절대 유지]
- 현재 5×3 배치 또는 현재 단일 구도
- 현재 의상과 고정 액세서리
- 현재 문구와 문구 위치
- 현재 장면의 감정과 핵심 행동
- 이미 잘된 포즈·카메라·효과
- ${styleKo}

[수정 범위 최소화]
얼굴을 고친다는 이유로 다른 사람이나 새로운 캐릭터로 재디자인하지 마세요. 정체성 문제가 있는 부분만 고치고, 문제가 없는 셀과 요소는 가능한 한 픽셀 수준으로 보존하세요.
${isSheetRepair ? '\n[시트 일관성]\n15개 셀을 비교했을 때 전부 같은 인물·같은 캐릭터로 보여야 하며, 얼굴 수정 때문에 문구·슬롯·효과 위치가 서로 바뀌면 안 됩니다.' : ''}

[최종 확인]
수정 후에도 현재 이미지와 같은 작품이며, 캐릭터 정체성만 더 정확해진 보정본이어야 합니다.`,

      crop: `[수정 모드 — 구도·이미지 결함 정밀 보정]
[대상 AI: ${modelName}]
첨부한 현재 이미지를 새로 재디자인하지 말고, 현재 결과에서 실제로 발생한 시각적 결함만 찾아 선택적으로 수정하세요.

[절대 유지]
- 동일한 캐릭터 정체성·얼굴·체형
- 의상과 고정 액세서리
- 현재 문구와 철자
- 장면별 감정과 행동 의미
- 전체 색감과 ${styleKo}

[우선 수정 대상]
- 캐릭터·머리카락·옷자락·손·발·소품·문자·효과가 다른 슬롯을 침범하거나 닿는 문제
- 붓획·먹비산·속도선·빛·장풍·기류·잔상이 이웃 셀로 넘어가거나 연결되어 보이는 문제
- 잘린 신체, 의도치 않은 크롭, 추가 팔다리, 손가락 수 오류, 뒤틀린 손·발, 얼굴 비대칭, 비정상적인 신체 연결
- 소품과 신체의 비정상적인 겹침, 문자와 캐릭터·효과의 충돌, 깨진 배경·불필요한 요소

${sheetLock}

[수정 방식]
결함이 없는 셀은 가능한 한 변경하지 마세요. 한 셀의 문제를 고치면서 다른 셀의 얼굴·포즈·문자·화풍을 다시 설계하지 마세요.

[최종 검사]
${isSheetRepair ? '15개 슬롯을 각각 따로 잘라낸다고 가정했을 때 모든 캐릭터·문자·효과가 잘리지 않고 서로 독립된 하나의 이모티콘으로 보여야 합니다.' : '신체·문자·효과가 모두 완전하게 보이고 의도치 않은 잘림이나 추가 요소가 없어야 합니다.'}`,

      text: `[수정 모드 — 문자 오류만 수정 / IMAGE LOCK]
[대상 AI: ${modelName}]
첨부한 현재 이미지를 기준으로 수정하세요. 이번 수정에서는 캐릭터·얼굴·의상·포즈·카메라·효과·배치·색감·화풍을 다시 생성하거나 변경하지 마세요. 이미지의 시각 요소는 최대한 그대로 유지하고 잘못된 문자만 수정하세요.

[IMAGE LOCK — 절대 변경 금지]
- 캐릭터 얼굴·체형·머리카락·의상
- 표정·손동작·자세·카메라 구도
- 소품·효과·색감·배경 방식
- 5×3 배치와 각 셀의 캐릭터 위치
- ${styleKo}

${exactText}

[텍스트 HARD LOCK]
- 지정 문구를 해당 위치에서 정확히 1회만 출력하세요.
- 번역·의역·철자 변경·생략·중복·합치기·임의 글자 추가 금지.
- 문구 위치를 다른 셀과 교환하지 마세요.
- 정확하게 표현된 문구는 가능한 한 그대로 유지하고, 오타가 있는 글자만 다시 그리세요.
- 한글은 초성·중성·종성 구조와 받침을 명확히 유지하세요. ㅗ/ㅜ, ㅏ/ㅓ, ㄹ/ㅌ을 서로 혼동하거나 합치지 마세요.
- 문자 가독성을 높인다는 이유로 현재 화풍의 Typography를 범용 고딕·산세리프·일반 스티커 폰트로 바꾸지 마세요.
- 문자 수정 때문에 말풍선·텍스트 박스·새 장식·추가 문구를 만들지 마세요.

[최종 검수]
${isSheetRepair ? '15개 셀의 문구를 위 원문과 하나씩 대조해 철자·띄어쓰기·문장부호·반복 문자 수까지 확인한 뒤, 틀린 글자만 수정된 상태로 마무리하세요.' : `최종 문구가 정확히 "${targetPhrase}"인지 문자 단위로 대조한 뒤 마무리하세요.`}`,
    };
    return prompts[repairType] || prompts.crop;
  }

  if (lang === 'ja') {
    const sheetLock = isSheetRepair
      ? `[15枠シート分離 HARD LOCK]
- 5列×3行の構成と各枠の現在の文言・意味を維持してください。
- 問題のない枠は変更しないでください。
- 各枠の外周8%、可能なら10%を完全な空白として残してください。
- キャラ、髪、服、手足、文字、輪郭、効果の最外周は必ず自分の枠内で完結させてください。
- 境界に触れる可能性がある場合は、その枠のキャラ+文字+効果をScene Groupとして90%→85%→80%の順に均等縮小し、枠内へ再配置してください。クロップで解決しないでください。`
      : '[単体画像 HARD LOCK]\n現在の場面と画風を維持し、身体・文字・効果を切らずに画面内へ完全に収めてください。';
    const exactText = isSheetRepair ? `[正確な15文言 — 位置変更禁止]\n${panelPlanJa}` : `[正確な原文]\n「${targetPhrase}」`;
    const prompts = {
      identity: `[修正モード — 顔・キャラクター同一性の復元]
[対象AI: ${modelName}]
現在の画像を一から作り直さず、構図と良い部分を最大限維持したまま、キャラクター同一性の誤りだけを選択的に修正してください。
${identitySourceJa}
顔型、目元、眉、鼻、口、顎、髪型、肌色または毛色、代表的な印象を全枠で同一に統一してください。
現在の衣装、文言、配置、感情、ポーズ、カメラ、効果を維持し、${styleJa}
問題のない要素は変更しないでください。`,
      crop: `[修正モード — 構図・画像不具合の精密補正]
[対象AI: ${modelName}]
現在画像を再デザインせず、実際に発生している不具合だけを修正してください。
維持: キャラクター同一性、衣装、文言、感情、色、${styleJa}
修正対象: 枠侵入、髪や服や文字や効果の越境、隣接効果の接続、身体の欠損、余分な手足・指、崩れた手足、意図しないクロップ、異常な重なり、文字との衝突、壊れた背景。
${sheetLock}
問題のない枠や要素は可能な限り変更しないでください。`,
      text: `[修正モード — 文字エラーのみ修正 / IMAGE LOCK]
[対象AI: ${modelName}]
キャラクター、顔、衣装、ポーズ、カメラ、効果、配置、色、画風を再生成しないでください。間違った文字だけを修正してください。
${styleJa}
${exactText}
各文言は指定位置に正確に1回だけ描画し、翻訳・言い換え・省略・重複・追加を禁止します。正しい文字は維持し、誤字部分だけを描き直してください。文字修正のために吹き出しやテキストボックスを追加しないでください。`,
    };
    return prompts[repairType] || prompts.crop;
  }

  if (lang === 'zh') {
    const sheetLock = isSheetRepair
      ? `[15格独立 HARD LOCK]
- 保持5列×3行结构以及每格当前文案和含义。
- 没有问题的格子尽量不要改动。
- 每格外缘至少8%，最好10%，保持完全空白。
- 角色、头发、服装、手脚、文字、轮廓和特效最外缘必须完全结束在自己的格子内。
- 如有触碰边界风险，将该格的角色+文字+特效作为Scene Group按90%→85%→80%依次等比缩小并重新排入安全区，不要用裁切解决。`
      : '[单图 HARD LOCK]\n保持当前场景和画风，让身体、文字和特效完整位于画面内，不要裁切。';
    const exactText = isSheetRepair ? `[准确的15条原文 — 禁止换位]\n${panelPlanZh}` : `[准确原文]\n“${targetPhrase}”`;
    const prompts = {
      identity: `[修正模式 — 面部与角色身份恢复]
[目标AI: ${modelName}]
不要从头重做当前图片。请最大限度保留现有构图和正确部分，只修复角色身份不一致的问题。
${identitySourceZh}
统一所有格子的脸型、眼型、眉毛、鼻子、嘴型、下巴、发型、肤色或毛色与代表性气质。
保持当前服装、文案、位置、情绪、姿势、镜头与特效，${styleZh}
没有问题的元素不要改动。`,
      crop: `[修正模式 — 构图与图像缺陷精修]
[目标AI: ${modelName}]
不要重新设计当前图片，只修复实际存在的视觉缺陷。
必须保持：角色身份、服装、当前文案、场景含义、整体色调，${styleZh}
优先修复：跨格、头发/衣摆/手脚/文字/特效越界、相邻特效连成一体、身体被裁切、多余肢体或手指、扭曲手脚、异常重叠、文字冲突、破损背景和多余元素。
${sheetLock}
没有缺陷的格子和元素尽量保持不变。`,
      text: `[修正模式 — 仅修复文字 / IMAGE LOCK]
[目标AI: ${modelName}]
不要重新生成角色、面部、服装、姿势、镜头、特效、布局、色彩或画风。只修正错误文字。
${styleZh}
${exactText}
每条文案只能在指定位置准确出现1次，禁止翻译、改写、漏字、重复、合并或增加字符。正确文字尽量保留，只重画错误字符。不要因为修字新增气泡、文字框或额外装饰。`,
    };
    return prompts[repairType] || prompts.crop;
  }

  const sheetLock = isSheetRepair
    ? `[15-SLOT SHEET ISOLATION — HARD LOCK]
- Preserve the current 5-column × 3-row structure and each slot's assigned phrase/meaning.
- Leave unaffected slots unchanged whenever possible.
- Keep at least 8%, preferably 10%, of every slot edge absolutely empty.
- Every outermost part of character, hair, clothing, limbs, lettering, outlines and effects must terminate fully inside its own slot.
- If anything risks touching a boundary, treat character + lettering + effects as one Scene Group and uniformly scale 90% → 85% → 80% until it fits inside the safe frame. Never solve it by cropping.`
    : '[SINGLE IMAGE HARD LOCK]\nPreserve the current scene and style. Keep the complete body, lettering and effects fully inside the canvas; scale the whole scene instead of cropping.';
  const exactText = isSheetRepair ? `[EXACT 15 SOURCE PHRASES — DO NOT SWAP CELLS]\n${panelPlanEn}` : `[EXACT SOURCE PHRASE]\n"${targetPhrase}"`;

  const prompts = {
    identity: `[EDIT MODE — CHARACTER IDENTITY RESTORATION]
[TARGET AI: ${modelName}]
Do not regenerate the image from scratch. Preserve the current composition and all successful elements, and selectively correct only character-identity errors.
${identitySourceEn}
Unify face shape, eye shape and spacing, brows, nose, mouth/lips, jawline, hair, skin/fur color and signature impression across all relevant cells.
Preserve the current outfit, wording, positions, emotions, successful poses/camera/effects. ${styleEn}
Do not redesign unaffected cells or turn the subject into a different character.`,
    crop: `[EDIT MODE — LAYOUT / IMAGE DEFECT PRECISION FIX]
[TARGET AI: ${modelName}]
Do not redesign the current image. Fix only actual visual defects while preserving successful content.
LOCK: same character identity, outfit, exact wording, scene meaning, overall color treatment. ${styleEn}
FIX: cross-cell overlap, hair/clothing/limbs/text/effects crossing boundaries, adjacent effects visually connecting, cropped anatomy, extra limbs/fingers, malformed hands/feet, asymmetry, unintended crop, abnormal prop/body overlap, text collisions, broken background or unwanted elements.
${sheetLock}
Leave unaffected cells and elements unchanged whenever possible.`,
    text: `[EDIT MODE — TEXT ERRORS ONLY / IMAGE LOCK]
[TARGET AI: ${modelName}]
Do not regenerate or alter the character, face, outfit, pose, camera, effects, layout, colors or art style. Keep the image visually locked and correct only erroneous lettering.
${styleEn}
${exactText}
Render each assigned phrase exactly once in its assigned position. Do not translate, paraphrase, respell, omit, duplicate, merge or invent characters. Preserve correct phrases and redraw only erroneous glyphs. Do not add speech bubbles, text boxes or extra decoration to solve text errors.`,
  };
  return prompts[repairType] || prompts.crop;
}

export function repairPromptV2Plugin() {
  return {
    name: 'repair-prompt-v2',
    enforce: 'post',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null;

      let out = code;
      const startMarker = '  const getRepairPrompt = ';
      const endMarker = '  const copyRepairPrompt = ';
      const start = out.indexOf(startMarker);
      const end = out.indexOf(endMarker, start + startMarker.length);
      if (start < 0 || end < 0) {
        throw new Error('[repair-prompt-v2] getRepairPrompt/copyRepairPrompt markers not found');
      }
      if (out.indexOf(startMarker, start + startMarker.length) >= 0) {
        throw new Error('[repair-prompt-v2] getRepairPrompt marker is not unique');
      }

      const functionExpression = replacementRepairPrompt
        .toString()
        .replace(/^function replacementRepairPrompt/, 'function');
      out = out.slice(0, start) + `  const getRepairPrompt = ${functionExpression};\n\n` + out.slice(end);

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
          "repairHelp: 'Attach the image to the same AI chat and paste a request below. Each prompt locks successful content and edits only the selected problem. Text corrections are not guaranteed to be perfect.'"
        )
        .replaceAll(
          "repairHelp: '修正する画像を同じAIチャットに添付し、下のボタンでコピーした修正依頼を貼り付けてください。文字修正は完全性を保証できません。'",
          "repairHelp: '修正画像を同じAIチャットに添付し、下の依頼を貼り付けてください。良い部分を固定し、選択した問題だけを直す設計です。文字修正は完全性を保証できません。'"
        )
        .replaceAll(
          "repairHelp: '请将待修改图片上传到同一个AI对话，再粘贴下方按钮复制的修改要求。文字修正无法保证完全准确。'",
          "repairHelp: '请将待修改图片上传到同一个AI对话并粘贴下方请求。提示词会锁定正确部分，只修复所选问题；文字修正仍无法保证完全准确。'"
        );

      return { code: out, map: null };
    },
  };
}
