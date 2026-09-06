const TARGET = '/src/App.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[style-first-semantic-lock-v3] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[style-first-semantic-lock-v3] ${label} marker is not unique`);
  }
  return source.slice(0, first) + replacement + source.slice(first + marker.length);
};

export function styleFirstSemanticLockV3Plugin() {
  return {
    name: 'style-first-semantic-lock-v3',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null;

      let out = code;
      const helperMarker = `  const getPreviewPrompt = () => {`;
      const helper = `  const getUniversalStyleFirstTranslationLock = (isKo) => isKo
    ? \
\`[화풍 고유 의미 번역 — HARD CONSTRAINT]
- 해석 순서는 반드시 "선택 화풍 확정 → 그 화풍의 Acting·Camera·Effects·Typography 어휘 확정 → 문구의 의미·감정·상황을 그 어휘로 번역"입니다. "문구 → 익숙한 이모티콘 포즈 선택 → 화풍 재질 덧씌우기" 순서는 금지합니다.
- 안녕·좋아요·사랑·축하·사과·응원·놀람 같은 의미는 손 흔들기·엄지척·손하트·점프·고개 숙임·양손 벌리기 같은 특정 범용 제스처와 1:1로 자동 매핑하지 마세요.
- 익숙한 제스처는 그 제스처 자체가 현재 선택 화풍의 고유 연기 문법 안에서 자연스럽고 장면상 가장 설득력 있을 때만 사용할 수 있습니다. 같은 의미를 더 화풍답게 표현할 수 있는 몸짓·시선·몸축·거리·구도가 있으면 그것을 우선하세요.
- [손·손가락 안정성] 손가락을 카메라 정면으로 내미는 손가락질, 크게 펼친 손바닥, 손가락 튕기기·휘젓기, 여러 손가락이 강하게 겹치는 극단 단축 포즈를 문구 의미에 대한 자동 기본값으로 선택하지 마세요. 같은 감정을 시선·고개 방향·몸축·회전·팔의 위치·소매 흐름으로 충분히 전달할 수 있다면 그 표현을 우선하세요.
- 냉소·무시·거절·경고 계열, 특히 "너나 잘하세요" 같은 의미는 손가락 제스처보다 흘겨보는 시선, 몸을 반쯤 돌리기, 팔짱, 한 손을 소매 안에 두기처럼 현재 화풍에 맞는 안정적인 자세를 우선하세요. 손동작은 감정을 설명하는 필수 기호가 아닙니다.
- 손이 반드시 필요한 장면에서는 손을 작고 명확한 실루엣으로 설계하고 다섯 손가락의 해부학적 연결이 자연스럽게 읽히게 하세요. 손가락 교차·융합·추가 손가락·관절 왜곡·과도한 전경 확대를 피하고 얼굴·문자와 겹치지 않게 하세요.
- 손 형태가 불안정해질 가능성이 있으면 잘못된 손을 유지하거나 손가락 일부를 숨기는 식으로 봉합하지 말고 포즈·카메라·팔 방향 자체를 다시 설계하세요. 손의 해부학적 안정성은 복잡한 손 제스처의 박력보다 우선하되, 최종 자세의 HOW는 계속 선택 화풍이 결정합니다.
- Rendering만 화풍에 맞고 Acting·Camera·Effects가 범용 메신저 스티커 문법이면 실패입니다. 재질을 바꾸는 것이 아니라 장면의 행동과 촬영 방식부터 다시 구성하세요.
- 각 셀은 캐릭터의 몸축, 시선, 손발, 의상·머리카락 흐름, 카메라 원근, 효과의 방향, 문자 획의 흐름이 하나의 장면 리듬을 공유해야 합니다.
- 15개 장면 전체가 같은 범용 스티커 동작 세트에 서로 다른 화풍만 입힌 것처럼 보이면 실패입니다. 선택 화풍마다 동작의 어휘와 카메라 습관 자체가 달라져야 합니다.
- 문자를 가려도 동작·카메라·효과만으로 선택 화풍이 느껴져야 하며, 캐릭터를 가려도 문자만으로 같은 화풍이 느껴져야 합니다.
- 생성 직전 각 셀을 검사하세요: "이 문구를 몰라도 이 포즈와 카메라가 현재 화풍의 장면인가?" 아니면 범용 포즈를 폐기하고 화풍 고유의 연출로 다시 번역하세요.\`
    : \
\`[STYLE-NATIVE SEMANTIC TRANSLATION — HARD CONSTRAINT]
- The mandatory interpretation order is: establish the selected art style → establish that style's Acting, Camera, Effects and Typography vocabulary → translate phrase meaning, emotion and situation through that vocabulary. Never use the reverse order of phrase → familiar sticker pose → style skin applied afterward.
- Meanings such as greeting, approval, affection, celebration, apology, encouragement and surprise must not be auto-mapped one-to-one to stock gestures such as waving, thumbs-up, heart hands, jumping, bowing or spread-arm reactions.
- A familiar gesture is allowed only when it is genuinely native to the selected style's acting grammar and is the strongest choice for that scene. If a more style-specific gesture, gaze, body axis, distance or composition expresses the same meaning, prefer the style-specific solution.
- [HAND/FINGER STABILITY] Do not auto-select direct-to-camera pointing, a large open palm, finger flicking/waving, or severe foreshortening with overlapping fingers as the default visual translation of a phrase. When gaze, head direction, body axis, torso rotation, arm placement or sleeve flow can express the same emotion, prefer the safer style-native acting choice.
- For sarcasm, dismissal, refusal or warning—especially meanings like "너나 잘하세요"—prefer a sidelong contemptuous glance, half-turned body, folded arms, or a hand naturally hidden inside a sleeve rather than a complex finger gesture. A hand sign is not required to explain the emotion.
- When a visible hand is genuinely necessary, keep it small and clearly readable, with anatomically coherent attachment and five distinct fingers. Avoid crossed or fused fingers, extra digits, warped joints, extreme foreground enlargement, and overlap with the face or lettering.
- If the hand is likely to become unstable, redesign the pose, camera or arm direction before rendering. Do not preserve a risky gesture and patch the anatomy afterward. Anatomical hand stability outranks the spectacle of a complicated hand gesture, while the selected art style still owns the final HOW of the pose.
- If only Rendering matches the style while Acting, Camera or Effects still use generic messenger-sticker grammar, the result fails. Restage the action and shot; do not merely reskin the surface.
- In every cell, body axis, gaze, hands/feet, clothing or hair flow, perspective, effect direction and lettering strokes must share one scene rhythm.
- The 15 scenes must not look like one reusable stock sticker-motion kit wearing different art-style skins. Each selected style must change the action vocabulary and camera habits themselves.
- The style must remain recognizable from acting/camera/effects with text hidden, and from typography alone with the character hidden.
- Immediately before rendering each cell, ask: "Would this pose and camera still belong to the selected style if I did not know the phrase?" If not, discard the generic pose and translate the meaning again through style-native direction.\`;

${helperMarker}`;

      out = replaceOnce(out, helperMarker, helper, 'universal style-first helper injection');

      const gptReturn = String.raw`    return (isKo ? ko : en) + '\n\n' + base + '\n\n' + (isKo ? finalKo : finalEn);`;
      const gptReplacement = String.raw`    return (isKo ? ko : en) + '\n\n' + base + '\n\n' + (isKo ? finalKo : finalEn) + '\n\n' + getUniversalStyleFirstTranslationLock(isKo);`;
      out = replaceOnce(out, gptReturn, gptReplacement, 'GPT style-first final lock');

      const koBlocks = `[koSemantics, koText, koIdentity, koSheet, koActing, koLettering, koModel].filter(Boolean)`;
      const koBlocksReplacement = `[koSemantics, koText, koIdentity, koSheet, koActing, koLettering, koModel, getUniversalStyleFirstTranslationLock(true)].filter(Boolean)`;
      out = replaceOnce(out, koBlocks, koBlocksReplacement, 'Gemini/Grok Korean style-first block');

      const enBlocks = `[enSemantics, enText, enIdentity, enSheet, enActing, enLettering, enModel].filter(Boolean)`;
      const enBlocksReplacement = `[enSemantics, enText, enIdentity, enSheet, enActing, enLettering, enModel, getUniversalStyleFirstTranslationLock(false)].filter(Boolean)`;
      out = replaceOnce(out, enBlocks, enBlocksReplacement, 'Gemini/Grok English style-first block');

      return { code: out, map: null };
    },
  };
}
