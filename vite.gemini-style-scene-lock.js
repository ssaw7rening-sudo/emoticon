const TARGET = '/src/App.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[gemini-style-scene-lock] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) throw new Error(`[gemini-style-scene-lock] ${label} marker is not unique`);
  return source.slice(0, first) + replacement + source.slice(first + marker.length);
};

const replaceCount = (source, marker, replacement, expected, label) => {
  const parts = source.split(marker);
  const count = parts.length - 1;
  if (count !== expected) throw new Error(`[gemini-style-scene-lock] ${label} expected ${expected}, found ${count}`);
  return parts.join(replacement);
};

export function geminiStyleSceneLockPlugin() {
  return {
    name: 'gemini-style-scene-lock',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null;

      let out = code;
      const helperMarker = `  const getPreviewPrompt = () => {`;
      const helper = `  const optimizeGeminiStyleSceneLock = (prompt) => {
    let base = String(prompt || '');

    base = base
      .replace('선택한 화풍의 핵심 선·채색·질감을 유지하면서 메신저 이모티콘처럼 감정과 행동이 즉시 읽히게 연출하세요.', '선택 화풍의 고유한 연출 문법 안에서만 감정과 행동을 읽히게 연기하세요. 일반 메신저 스티커의 보편적 포즈·아이콘·연출로 되돌아가지 마세요.')
      .replace('Preserve the essential line, color and texture language of the selected style while keeping messenger-sticker emotion immediately readable.', 'Make emotion readable only through the selected style’s own directing grammar. Do not fall back to generic messenger-sticker poses, icons or visual language.');

    const ko = \
\`[화풍 세계 고정 · 문구/문자 연출 통합 — 절대 우선]
- 먼저 [최우선 화풍] 하나로 15개 전체가 속할 동일한 작품 세계와 시각 문법을 확정하세요. 그 다음 각 문구를 그 세계 안에서 연기하세요. 문구를 일반 이모티콘 장면으로 만든 뒤 화풍을 표면에 덧씌우는 방식은 금지합니다.
- 화풍은 Rendering + Acting + Camera + Effects + Typography 전체를 동시에 지배합니다. 문구는 감정·행동·상황·필요 소품만 결정하며, 화풍·장르·시대감·카메라 문법·색감·선·효과·문자 스타일은 절대 변경하지 못합니다.
- 모든 슬롯은 같은 화풍의 서로 다른 장면이어야 합니다. 문구의 소재가 축하, 응원, 사랑, 학교, 음식, 계절, 게임, 운동 등으로 달라져도 15개 모두 같은 작품의 컷처럼 보여야 합니다.
- 문구의 행동도 선택 화풍의 몸짓 어휘로 재해석하세요. 일반적인 엄지척, 손하트, 만세, 정면 미소, 단순 손흔들기, 스톡 이모지 같은 관습적 스티커 포즈를 그대로 쓰지 말고, 해당 화풍이 실제 만화·회화·인형극·그림책 안에서 그 감정을 표현한다면 어떤 자세와 구도를 쓸지 먼저 판단하세요.
- 소품과 기호도 화풍 밖의 그래픽으로 튀어나오면 안 됩니다. 하트, 별, 땀방울, 폭발, 왕관, 말풍선, 아이콘이 필요하면 반드시 선택 화풍의 선·재질·질감·효과 언어로 다시 그리세요. 앱 UI 아이콘이나 스톡 이모지처럼 보이면 실패입니다.

[문자도 화풍 연출의 일부]
- Typography는 별도 장식 레이어가 아니라 선택 화풍의 연출 그 자체입니다. 글자 모양, 획의 재질, 외곽선, 먹/물감/크레파스/자수/점토 등의 재료감, 기울기, 크기 변화, 자간, baseline, 배치 방향, 속도감, 주변 효과까지 모두 [최우선 화풍]을 먼저 따라야 합니다.
- 문구의 감정은 같은 화풍 내부에서 글자의 연기만 변화시킵니다. 감정 때문에 다른 폰트 계열이나 일반 스티커 폰트로 전환하지 마세요.
- 예: 전통 무협 만화풍에서 축하는 일반 노란색 축하 폰트가 아니라 승전의 기세를 가진 붓획과 먹의 비산으로, 응원은 무림 동료를 북돋는 힘찬 획과 상승하는 기세로, 위로는 같은 먹붓 재료를 쓰되 힘을 낮추고 호흡을 넓혀 표현하세요.
- 전통 무협 만화풍에서 귀엽거나 따뜻한 문구도 둥근 디지털 스티커 폰트로 바꾸지 마세요. 동일한 붓·먹·검획 계열을 유지하면서 획의 강도, 곡률, 간격, 크기, 흐름만 부드럽게 조절하세요.
- 크레파스 화풍이면 글자도 크레파스 손그림, 자수 화풍이면 실밥/패치 레터링, 클레이면 점토로 만든 글자, 미국 코믹스면 해당 코믹스의 잉크·효과음 문법처럼 표현하세요. 어떤 화풍이든 문자만 별도의 현대 디지털 폰트처럼 떠 있으면 실패입니다.
- 글자는 캐릭터의 동세와 같은 방향으로 움직이고 같은 장면의 일부처럼 보여야 합니다. 캐릭터가 강하게 전진하면 글자도 그 방향성을 공유하고, 감정이 가라앉으면 글자도 같은 화풍 안에서 힘과 높이를 낮추세요.
- 한글 원문은 정확히 1회만 유지하되, 정보표·포스터 제목·간판·라벨처럼 딱딱하게 정렬하지 마세요. 글자는 선택 화풍의 장면 연출에 자연스럽게 통합되어야 합니다.

[최종 판정]
- 캐릭터를 가리고 글자만 보아도 선택 화풍이 느껴져야 하고, 글자를 가리고 포즈·카메라·효과만 보아도 같은 화풍이 느껴져야 합니다.
- 문구가 바뀌어도 화풍 DNA가 흔들리면 실패입니다. 화풍 안에서 문구와 문자가 연기되어야 합니다.\`;

    const en = \
\`[LOCK ONE STYLE WORLD · INTEGRATE PHRASE AND TYPOGRAPHY — ABSOLUTE]
- First establish one visual world from [HIGHEST PRIORITY ART STYLE] for all 15 stickers, then stage every phrase inside that world. Never create a generic sticker scene first and apply the style only as a surface filter afterward.
- Art style controls Rendering + Acting + Camera + Effects + Typography together. The phrase controls only meaning, emotion, action, situation and necessary props; it must never change genre, era, palette, line language, camera grammar, effects or typography family.
- All 15 stickers must feel like different scenes from the same work even when phrase topics vary widely.
- Reinterpret every action using the selected style's own movement vocabulary. Do not fall back to generic thumbs-up, hand-heart, frontal smile, simple wave, stock emoji or standard messenger-sticker poses when the selected style has a stronger visual grammar.
- Props and symbols must also be redrawn in the selected style. Hearts, stars, sweat, explosions, crowns and icons must never look like stock UI emoji.

[TYPOGRAPHY IS ART DIRECTION]
- Typography is not a separate decoration layer. Letterform shape, stroke material, outline, texture, tilt, scale, spacing, baseline, placement, motion and surrounding effects all inherit the selected art style first.
- Emotion changes the performance of lettering only inside the same style. Never switch to a different generic sticker-font family because the phrase is cute, warm, funny or celebratory.
- In traditional wuxia comic style, celebration, encouragement, comfort, anger and humor must all remain within the same brush/ink/sword-stroke language while varying force, curvature, spacing, scale and rhythm according to emotion.
- In crayon style, lettering is crayon-drawn; in embroidery it is stitched/patch-like; in clay it feels physically sculpted; in American comics it follows that comic's ink and sound-effect language. Typography that looks like a separate modern digital font is a failure.
- Lettering should share the character's motion vector and scene rhythm. Preserve the exact Korean phrase once, but avoid rigid signboard, label or poster-title arrangement.

[FINAL TEST]
- If the character is hidden, the lettering alone should still reveal the selected style. If the lettering is hidden, pose, camera and effects should reveal the same style. Phrase changes must never weaken the style DNA.\`;

    return (lang === 'ko' ? ko : en) + '\\n\\n' + base;
  };

${helperMarker}`;

      out = replaceOnce(out, helperMarker, helper, 'helper injection');
      const marker = `optimizeGeminiLayoutInstanceLock(optimizeGeminiIdentityStyleLock(optimizeModelPromptV4(generateGeminiPrompt(phraseOverride), 'gemini')))`;
      const replacement = `optimizeGeminiStyleSceneLock(optimizeGeminiLayoutInstanceLock(optimizeGeminiIdentityStyleLock(optimizeModelPromptV4(generateGeminiPrompt(phraseOverride), 'gemini'))))`;
      out = replaceCount(out, marker, replacement, 3, 'Gemini prompt wrapping');

      return { code: out, map: null };
    },
  };
}
