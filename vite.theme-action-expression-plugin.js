const TARGET = '/src/App.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[theme-action-expression] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[theme-action-expression] ${label} marker is not unique`);
  }
  return source.slice(0, first) + replacement + source.slice(first + marker.length);
};

const replaceCount = (source, marker, replacement, expected, label) => {
  const parts = source.split(marker);
  const count = parts.length - 1;
  if (count !== expected) {
    throw new Error(`[theme-action-expression] ${label} expected ${expected} occurrence(s), found ${count}`);
  }
  return parts.join(replacement);
};

export function themeActionExpressionPlugin() {
  return {
    name: 'theme-action-expression',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/');
      if (!normalizedId.endsWith(TARGET)) return null;

      let out = code;
      const helperMarker = `  const getPreviewPrompt = () => {`;
      const helper = [
        `  const enhanceThemeActingPrompt = (prompt, model) => {`,
        `    if (model !== 'gemini' && model !== 'grok') return prompt;`,
        `    const isSingle = generationMode === 'individual' || generationMode === 'batch';`,
        `    const sourcePrompt = String(prompt || '');`,
        ``,
        `    const commonKo = isSingle`,
        `      ? \`[문구 테마-행동 연결 — 매우 중요]`,
        `- 현재 스티커에 배정된 문구와 선택된 문구 테마의 의미를 캐릭터의 표정, 시선, 몸짓, 포즈, 손동작, 소품, 효과선으로 직접 시각화하세요.`,
        `- 문구와 관계없는 임의의 포즈를 사용하지 말고, 문구를 읽지 않아도 감정과 상황이 느껴질 정도로 캐릭터 연기가 분명해야 합니다.`,
        `- 문구 테마는 말투만 바꾸는 요소가 아니라 감정 연기와 장면 연출 방식을 결정하는 지침입니다.`,
        `- 캐릭터의 고정 정체성, 얼굴 특징, 체형, 의상, 선택 화풍은 유지하고 행동과 표정만 문구 의미에 맞게 자연스럽게 연기하세요.`,
        `- 아래 예시에 없는 어떤 문구 테마라도 같은 원칙으로 의미를 해석해 행동과 표정에 반영하세요.\``,
        `      : \`[15개 문구 테마-행동 연결 — 매우 중요]`,
        `- 15개 스티커 각각의 표정, 시선, 몸짓, 포즈, 손동작, 소품, 효과선은 해당 스티커에 배정된 문구의 의미와 선택된 문구 테마를 직접 시각화해야 합니다.`,
        `- 단순히 문구만 바꾸고 비슷한 캐릭터 연기를 반복하지 마세요. 15개가 서로 다른 감정·상황·행동으로 한눈에 구분되어야 합니다.`,
        `- 같은 포즈, 같은 표정, 같은 손동작, 같은 구도를 반복하지 말고 각 문구의 핵심 동사·감정·상황에 맞는 연기를 선택하세요.`,
        `- 문구를 읽지 않아도 대략적인 감정과 상황이 느껴질 정도로 캐릭터 행동을 명확하게 만드세요.`,
        `- 문구 테마는 말투만 바꾸는 요소가 아니라 15개 전체의 감정 연기와 장면 연출 문법을 결정하는 핵심 지침입니다.`,
        `- 캐릭터의 고정 정체성, 얼굴 특징, 체형, 의상, 선택 화풍은 유지하면서 각 문구마다 행동과 표정만 차별화하세요.`,
        `- 아래 예시에 없는 어떤 문구 테마라도 동일하게 테마의 감정·관계·상황·목적을 해석해 행동과 표정에 반영하세요.\`;`,
        ``,
        `    const commonEn = isSingle`,
        `      ? \`[PHRASE THEME TO CHARACTER ACTING — CRITICAL]`,
        `Directly visualize the meaning of the assigned phrase and selected phrase theme through facial expression, gaze, body language, pose, hand gesture, props, and motion/effect lines. Do not use a generic pose unrelated to the phrase. The emotion and situation should be understandable even before reading the text. Treat the phrase theme as an acting and scene-direction rule, not merely a wording style. Preserve the character's fixed identity, face, body proportions, outfit, and selected art style while changing only the acting needed by the phrase. Apply this rule to every theme, including themes not listed in examples.\``,
        `      : \`[PHRASE THEME TO CHARACTER ACTING FOR ALL 15 STICKERS — CRITICAL]`,
        `Each of the 15 stickers must directly act out its assigned phrase and selected phrase theme through facial expression, gaze, body language, pose, hand gesture, props, and motion/effect lines. Do not merely swap the text while reusing similar acting. Avoid repeating the same pose, expression, gesture, or composition; all 15 should be clearly distinct in emotion, action, and situation. Preserve the character's fixed identity, face, body proportions, outfit, and selected art style. Treat the phrase theme as an acting and scene-direction rule, not merely a wording style. Apply this rule to every theme, including themes not listed in examples.\`;`,
        ``,
        `    const specificKo = (() => {`,
        `      const guides = [`,
        `        [/(?:의성어|효과음|쿵|쾅|팡|펑|탁|톡)/, '의성어·효과음은 소리의 세기와 성격이 몸동작, 충격감, 속도선, 효과선에서 바로 느껴지게 연기하세요.'],`,
        `        [/(?:의태어|움직임|살금|두근|벌벌|뒹굴|힐끔)/, '의태어·움직임은 리듬과 방향성이 핵심이므로 몸 전체의 동작, 시선, 무게중심을 분명하게 표현하세요.'],`,
        `        [/(?:사과|미안|죄송|용서)/, '사과 계열은 고개 숙임, 두 손 모음, 쭈굴한 자세, 조심스러운 손짓 등 미안함의 강도를 문구마다 다르게 연기하세요.'],`,
        `        [/(?:거절|사양|패스|어려워|곤란|안 할래|못 가)/, '거절 계열은 손사래, 고개 젓기, 거리 두기, 난처함 또는 단호함 등 거절 의사가 한눈에 보이게 표현하세요.'],`,
        `        [/(?:애교|뿌잉|안아쥬|놀아쥬|보고시퍼|조아용)/, '애교 계열은 하트, 볼에 손 대기, 몸 기울이기, 반짝이는 눈, 귀여운 손동작 등 사랑스러운 연기를 사용하세요.'],`,
        `        [/(?:악당|계획대로|덤벼|각오|지배|절망|어둠)/, '악당 계열은 음흉한 미소, 자신만만한 자세, 위협적인 손짓, 오라와 그림자 등 과장된 악당 연기를 사용하세요.'],`,
        `        [/(?:속마음|혼잣말|부럽|신경 쓰여|서운|긴장|질투|참는 중)/, '속마음·혼잣말 계열은 멍함, 한숨, 망설임, 민망함, 귀찮음, 은근한 기쁨처럼 내면 감정을 미세한 표정과 자세로 드러내세요.'],`,
        `        [/(?:사투리|맞제|고맙데이|오메|아이가|당께)/, '사투리 계열은 친근함, 능청스러움, 구수함, 활달함이 표정과 제스처에서 느껴지도록 연기하세요.'],`,
        `        [/(?:명대사|결의|운명|기억해|새겨 둬)/, '명대사 계열은 결의, 자신감, 비장함, 강조된 시선과 손짓으로 한 장면의 클라이맥스처럼 연출하세요.'],`,
        `        [/(?:중2병|세계관|각성|봉인|어둠|오라)/, '중2병·세계관 계열은 각성, 허세, 오라, 손 뻗기, 극적인 시선과 앵글 등 과장된 세계관 연기를 사용하세요.'],`,
        `        [/(?:로봇|AI 말투|분석|스캔|시스템|데이터)/i, '로봇·AI 계열은 분석적인 자세, 스캔 제스처, 규칙적인 움직임, 데이터 패널 같은 기계적 연기를 사용하세요.'],`,
        `        [/(?:여행|비행기|호텔|체크인|티켓|배낭|면세점|수영장)/, '여행·상황형 문구는 장소성, 이동감, 여행 소품과 실제 행동 맥락이 문구 의미와 정확히 연결되도록 표현하세요.'],`,
        `        [/(?:직장|회사|출근|퇴근|회의|야근|칼퇴)/, '직장·오피스 계열은 업무 상황, 피로, 집중, 퇴근의 해방감 등을 책상·노트북·서류·시계 같은 최소한의 소품과 행동으로 표현하세요.'],`,
        `        [/(?:게임|E스포츠|게이머|승리|패배|랭크|캐리)/i, '게임·E스포츠 계열은 집중, 환호, 좌절, 승리 포즈, 컨트롤 동작 등 게임 상황의 감정을 명확히 연기하세요.'],`,
        `        [/(?:연애|커플|사랑|보고 싶|심쿵|데이트)/, '연애·커플 계열은 설렘, 애정, 서운함, 기다림 등 관계 감정이 시선, 거리감, 손동작에서 자연스럽게 드러나게 하세요.'],`,
        `        [/(?:헬스|다이어트|운동|근육|단백질|러닝)/, '헬스·다이어트 계열은 힘쓰기, 지침, 성취감, 운동 루틴을 몸의 긴장과 운동 소품으로 직접 보여주세요.'],`,
        `      ];`,
        `      const hit = guides.find(([pattern]) => pattern.test(sourcePrompt));`,
        `      return hit ? \`[선택 테마 행동 보강]\\n- ${'${hit[1]}'}\` : \`[선택 테마 행동 보강]\\n- 현재 선택된 문구 테마와 각 문구의 의미를 스스로 해석해, 그 테마만의 감정·관계·상황·목적이 캐릭터 행동에서 즉시 읽히도록 연기하세요.\`;`,
        `    })();`,
        ``,
        `    const specificEn = \`[THEME-SPECIFIC ACTING CUE]`,
        `Infer the selected theme and each phrase from the prompt and choose the most semantically direct acting for each sticker. Sound effects should drive impact and motion; apology should look apologetic; refusal should look resistant or firm; cute talk should look playful and affectionate; villain talk should look smug or menacing; inner thoughts should look subtle and introspective; travel, office, gaming, romance, fitness, and other situational themes should use only the props and actions needed to make that specific situation instantly readable. For any theme not named here, infer its emotion, relationship, situation, and purpose and visualize them through acting rather than generic poses.\`;`,
        ``,
        `    const actingBlock = lang === 'ko'`,
        `      ? \`${'${commonKo}'}\\n\\n${'${specificKo}'}\``,
        `      : \`${'${commonEn}'}\\n\\n${'${specificEn}'}\`;`,
        `    return \`${'${prompt}'}\\n\\n${'${actingBlock}'}\`;`,
        `  };`,
        ``,
        helperMarker,
      ].join('\n');
      out = replaceOnce(out, helperMarker, helper, 'helper injection');

      const geminiMarker = `enhanceModelLetteringPrompt(generateGeminiPrompt(phraseOverride), 'gemini')`;
      const geminiReplacement = `enhanceThemeActingPrompt(enhanceModelLetteringPrompt(generateGeminiPrompt(phraseOverride), 'gemini'), 'gemini')`;
      out = replaceCount(out, geminiMarker, geminiReplacement, 3, 'Gemini acting enhancer');

      const grokMarker = `enhanceModelLetteringPrompt(generateGrokPrompt(phraseOverride), 'grok')`;
      const grokReplacement = `enhanceThemeActingPrompt(enhanceModelLetteringPrompt(generateGrokPrompt(phraseOverride), 'grok'), 'grok')`;
      out = replaceCount(out, grokMarker, grokReplacement, 3, 'Grok acting enhancer');

      if (!out.includes('[15개 문구 테마-행동 연결 — 매우 중요]')) {
        throw new Error('[theme-action-expression] Korean all-theme acting block missing');
      }
      if (!out.includes('[PHRASE THEME TO CHARACTER ACTING FOR ALL 15 STICKERS — CRITICAL]')) {
        throw new Error('[theme-action-expression] multilingual all-theme acting block missing');
      }
      if (!out.includes("enhanceThemeActingPrompt(enhanceModelLetteringPrompt(generateGeminiPrompt(phraseOverride), 'gemini'), 'gemini')")) {
        throw new Error('[theme-action-expression] Gemini acting enhancer not connected');
      }
      if (!out.includes("enhanceThemeActingPrompt(enhanceModelLetteringPrompt(generateGrokPrompt(phraseOverride), 'grok'), 'grok')")) {
        throw new Error('[theme-action-expression] Grok acting enhancer not connected');
      }

      return { code: out, map: null };
    },
  };
}
