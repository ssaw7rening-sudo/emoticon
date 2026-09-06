const TARGET = '/src/App.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[theme-lettering] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[theme-lettering] ${label} marker is not unique`);
  }
  return source.slice(0, first) + replacement + source.slice(first + marker.length);
};

const replaceCount = (source, marker, replacement, expected, label) => {
  const parts = source.split(marker);
  const count = parts.length - 1;
  if (count !== expected) {
    throw new Error(`[theme-lettering] ${label} expected ${expected}, found ${count}`);
  }
  return parts.join(replacement);
};

export function themeAwareLetteringPlugin() {
  return {
    name: 'theme-aware-lettering',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null;

      let out = code;
      const helperMarker = `  const getPreviewPrompt = () => {`;
      const helper = `  const enhanceThemeAwareLettering = (prompt, model) => {
    if (model !== 'gemini' && model !== 'grok') return prompt;
    const textEnabled = model === 'gemini' ? geminiTextMode === 'text' : grokTextMode === 'text';
    if (!textEnabled) return prompt;

    const sourcePrompt = String(prompt || '');

    const themeLetteringKo = (() => {
      const guides = [
        [/(?:분노|짜증|화났|극대노|악당|대결|경고|거절|단호|폭발|열받|선 넘|덤벼|각오)/, '강한 감정 테마: 메인 팔레트는 진한 빨강·검정·오프화이트 중심. 글자 형태는 각지고 압축된 붓글씨/마커 느낌, 일부 획은 날카로운 방향성과 충격감을 주세요. 번개·찢김·충격선은 최소한의 강조에만 사용하세요.'],
        [/(?:응원|화이팅|파이팅|동기|결의|도전|성공|합격|승리|축하|최고|해낸|포기 안|끝까지|믿어)/, '응원·성취 테마: 노랑·주황·빨강을 중심으로 밝고 강한 팔레트를 사용하고, 글자는 위로 치솟는 듯한 굵은 획과 전진감 있는 기울기를 주세요. 반짝임·상승선·작은 광선은 보조 요소로만 사용하세요.'],
        [/(?:사랑|연애|커플|애교|귀여|뿌잉|보고 싶|심쿵|좋아해|안아|하트)/, '애정·애교 테마: 분홍·코랄·라일락을 중심으로 하고 하늘색/민트를 소량 보조색으로 사용하세요. 글자는 둥글고 말랑한 손글씨 형태, 부드러운 곡선과 작은 하트·반짝이로 사랑스러운 인상을 주세요.'],
        [/(?:사과|미안|죄송|용서|슬픔|울음|눈물|후회|위로|서운|외로|힘들|피곤|아파)/, '사과·슬픔·위로 테마: 남색·파랑·회보라·차분한 보라 중심의 저채도 팔레트를 사용하세요. 글자는 너무 날카롭지 않은 부드러운 손글씨, 약간 처지는 리듬과 작은 물방울·한숨 효과를 제한적으로 사용하세요.'],
        [/(?:속마음|혼잣말|걱정|망설|민망|부끄|불안|긴장|생각|현타|멘탈|당황)/, '속마음·망설임 테마: 짙은 남색·회색·라벤더 중심의 차분한 팔레트를 사용하세요. 글자는 조용하고 정돈된 손글씨로, 크기 차이를 과장하지 말고 작은 생각선·점·물음표 정도로 내면 감정을 표현하세요.'],
        [/(?:일상|인사|안녕|고마|감사|부탁|확인|알겠|수고|정중|직장|회사|회의|출근|퇴근|학교|학생|공부|시험)/, '일상·업무·학습 테마: 짙은 남색·청색·주황 또는 노랑 포인트를 중심으로 깔끔하고 또렷하게 구성하세요. 글자는 읽기 쉬운 굵은 마커/손글씨 계열로 정돈감을 유지하고, 지나친 장식은 피하세요.'],
        [/(?:유머|밈|MZ|신조어|사투리|장난|ㅋㅋ|대박|헐|레전드|오메|아이가|당께)/i, '유머·밈·사투리 테마: 노랑·주황·빨강·파랑 중 2개 정도를 골라 장난스럽게 사용하세요. 글자는 통통하고 약간 불규칙한 만화 레터링으로, 작은 기울기·튀는 획·말풍선형 리듬을 허용하되 무지개색 남발은 금지합니다.'],
        [/(?:사극|고전|명대사|무협|황송|무엄|사옵|하옵|하오|중2병|세계관|각성|봉인|운명)/, '고전·명대사·세계관 테마: 먹색·짙은 남색을 중심으로 금색 또는 주홍색을 한 가지 포인트로 사용하세요. 글자는 현대적으로 읽기 쉬운 붓글씨/서예풍 만화 레터링으로 만들고, 번짐·먹선·도장 느낌은 소량만 사용하세요. 의상에는 이 고전 분위기를 적용하지 마세요.'],
        [/(?:로봇|AI 말투|AI|SF|게임|E스포츠|게이머|랭크|캐리|스캔|시스템|데이터)/i, 'AI·게임·SF 테마: 전기 파랑·시안·보라를 중심으로 검정/짙은 남색 키라인을 사용하세요. 글자는 각이 살아 있는 기하학적 손그림 만화 레터링으로, 디지털 패널 느낌은 장식에만 쓰고 UI 폰트처럼 만들지 마세요.'],
        [/(?:여행|힐링|자연|계절|봄|여름|가을|겨울|바다|캠핑|휴가|호텔|비행기)/, '여행·힐링·자연 테마: 청록·하늘색·연두·코랄 중 1~2개를 중심으로 산뜻한 팔레트를 사용하세요. 글자는 여유 있고 둥근 캐주얼 손글씨로, 햇살·구름·바람선·작은 별을 최소한의 포인트로 사용하세요.'],
        [/(?:헬스|다이어트|운동|근육|러닝|오운완|단백질|체력)/, '운동·헬스 테마: 선명한 파랑·초록·주황 중 1~2개를 중심으로 스포티한 대비를 주세요. 글자는 굵고 앞으로 밀어붙이는 마커형 레터링, 짧은 속도선이나 땀방울로 에너지를 보조하세요.'],
        [/(?:음식|먹방|맛있|배고파|카페|커피|디저트|치킨|고기|간식|점메추)/, '음식·먹방 테마: 따뜻한 주황·빨강·크림색·갈색 중 1~2개를 사용하세요. 글자는 통통하고 맛있어 보이는 둥근 손글씨로, 김·한입·반짝임 같은 작은 식욕 포인트만 사용하세요.'],
        [/(?:의성어|효과음|의태어|움직임|쿵|쾅|팡|펑|탁|톡|두근|벌벌|살금)/, '의성어·의태어 테마: 각 문구의 소리와 움직임 강도에 맞춰 글자 크기·기울기·획 압력을 바꾸세요. 단, 시트 전체는 2~3개의 연관 색 안에서 통일하고 각 스티커마다 무작위 색을 쓰지 마세요.'],
      ];
      const hit = guides.find(([pattern]) => pattern.test(sourcePrompt));
      return hit ? hit[1] : '현재 선택된 문구 테마의 감정·상황·말투를 해석해 하나의 통일된 레터링 아트디렉션을 정하세요. 메인 색 1개와 보조 강조색 1개를 중심으로 사용하고, 문구별 감정에 따라 크기·기울기·획 압력만 제한적으로 변주하세요. 각 스티커를 서로 무관한 색과 폰트로 꾸미지 마세요.';
    })();

    const commonKo = '[테마별 레터링 디자인 — 매우 중요]\\n- 문구 테마는 글자의 색상뿐 아니라 획의 성격, 둥글기/각짐, 기울기, 크기 리듬, 장식 효과까지 결정합니다.\\n- 15개 전체는 같은 레터링 패밀리와 같은 테마 팔레트를 공유하되, 각 문구의 감정 강도에 따라 크기·기울기·강조색을 제한적으로 바꾸세요.\\n- 무작위 무지개색, 스티커마다 서로 다른 폰트, 이유 없는 파스텔 색상 나열을 금지합니다. 한 스티커는 메인 색 1개 + 강조색 1개 정도를 기본으로 하세요.\\n- 문구 정확도·1회 출력·1~2줄 제한이 항상 디자인보다 우선입니다.\\n- 캐릭터 얼굴·의상·포즈는 레터링 때문에 변경하지 마세요.\\n- 선택 테마 레터링 가이드: ' + themeLetteringKo;

    const commonEn = '[THEME-AWARE LETTERING — CRITICAL] The phrase theme controls not only color but also stroke character, roundness/angularity, tilt, scale rhythm, and small graphic accents. Keep one coherent lettering family and one coherent theme palette across the 15-sticker sheet, with limited phrase-specific variation. Avoid random rainbow colors, unrelated type styles, and arbitrary pastel fills. Prefer one primary color plus one accent color per sticker. Text accuracy, one-time rendering, and the one-to-two-line rule outrank decoration. Never redesign the character, outfit, or pose to fit lettering.';

    const contrastKo = '[배경 대비 규칙]\\n- 흰색 또는 거의 흰색 배경에서는 연한 파스텔 글자만 단독으로 사용하지 마세요. 색상 본체 주변에 충분히 진한 검정/먹색/짙은 남색 키라인을 두어 즉시 읽히게 하세요.\\n- 투명 배경에서는 테마 색상 본체 + 진한 키라인 + 깨끗한 순백색 바깥 다이컷 외곽선 구조를 우선하세요.\\n- 흰 배경에서 순백색 바깥선이 사라져 보이면 얇은 진한 분리선 또는 짧은 그림자로 외곽을 다시 구분하세요.\\n- 저채도 색상끼리만 겹쳐 대비가 약해지는 조합은 피하세요.';

    const contrastEn = '[BACKGROUND CONTRAST] On white or near-white backgrounds, never rely on pale pastel lettering alone; use a sufficiently dark black/ink/navy keyline around the colored letterforms. On transparent backgrounds, prefer theme-colored letterforms plus a dark keyline plus a clean pure-white outer die-cut outline. If the white outer outline disappears against white, restore separation with a thin dark edge or short shadow. Avoid low-contrast pastel-on-pastel combinations.';

    const geminiKo = '[Gemini 테마 레터링 실행]\\n- 먼저 선택 테마에 맞는 하나의 주 팔레트와 하나의 글자 형태 계열을 결정한 뒤 15개 전체에 일관되게 적용하세요.\\n- 일반적인 둥근 제목 폰트를 모든 테마에 반복 사용하지 마세요. 강한 테마는 각진 붓/마커, 귀여운 테마는 둥글고 말랑한 획, 차분한 테마는 정돈된 손글씨, 고전 테마는 현대적으로 읽기 쉬운 붓글씨처럼 테마에 맞게 글자 구조를 바꾸세요.\\n- 문구마다 색을 임의로 바꾸지 말고, 같은 팔레트 안에서 메인/보조색의 역할만 교대하세요.\\n- 흰 배경에서도 글자가 캐릭터보다 가볍거나 장난감처럼 떠 보이지 않도록 진한 키라인과 안정적인 획 두께를 유지하세요.\\n- 정확한 한글 형태를 깨뜨리는 과장, 그림문자 치환, 장식용 중복 글자는 금지합니다.';

    const geminiEn = '[GEMINI THEME LETTERING EXECUTION] Choose one primary palette and one lettering-shape family for the selected theme, then apply them consistently across all 15. Do not reuse the same generic rounded headline style for every theme. Strong themes may use angular brush/marker forms; cute themes rounded soft forms; quiet themes orderly hand-lettering; historical themes readable modern brush-calligraphy. Do not assign random colors per sticker; rotate primary/accent roles only within the chosen palette. Maintain dark keylines and stable stroke weight on white backgrounds. Never distort glyphs, substitute icons for letters, or duplicate decorative text.';

    const grokKo = '[Grok 테마 레터링 실행]\\n- 선택 테마의 팔레트와 글자 형태를 유지하면서 Gemini보다 강한 붓 압력, 기울기, 크기 대비, 속도감 있는 획을 허용하세요.\\n- 다만 빨강+검정 강한 붓글씨를 모든 테마의 기본값으로 사용하지 마세요. 분노/대결일 때만 강하게 쓰고, 애정·힐링·속마음·업무·여행 등은 해당 테마 팔레트와 획 성격으로 분명히 달라져야 합니다.\\n- 효과선·오라·충격선은 글자 외부 그래픽으로 연결할 수 있지만 글자 자체를 복제하거나 읽기 어렵게 만들지 마세요.\\n- 15개 전체가 하나의 테마 세트처럼 보이면서도 문구별 감정 강도에 따라 획 압력과 크기만 역동적으로 변주하세요.';

    const grokEn = '[GROK THEME LETTERING EXECUTION] Keep the selected theme palette and lettering family while allowing stronger brush pressure, tilt, scale contrast, and kinetic strokes than Gemini. Do not default every theme to red-and-black aggressive brush lettering; reserve that for anger/confrontation. Romance, healing, inner-thought, office, travel, and other themes must visibly use their own palette and stroke character. Motion lines and aura may connect outside the text block but must never duplicate or obscure glyphs. Keep all 15 visually coherent as one themed set while varying stroke pressure and scale by phrase intensity.';

    const blocks = lang === 'ko'
      ? [commonKo, contrastKo, model === 'gemini' ? geminiKo : grokKo]
      : [commonEn, contrastEn, model === 'gemini' ? geminiEn : grokEn];

    return sourcePrompt + '\\n\\n' + blocks.join('\\n\\n');
  };

${helperMarker}`;

      out = replaceOnce(out, helperMarker, helper, 'helper injection');

      const geminiMarker = `enhanceModelSpecificPrompt(generateGeminiPrompt(phraseOverride), 'gemini')`;
      const geminiReplacement = `enhanceThemeAwareLettering(enhanceModelSpecificPrompt(generateGeminiPrompt(phraseOverride), 'gemini'), 'gemini')`;
      out = replaceCount(out, geminiMarker, geminiReplacement, 3, 'Gemini theme lettering wrapping');

      const grokMarker = `enhanceModelSpecificPrompt(generateGrokPrompt(phraseOverride), 'grok')`;
      const grokReplacement = `enhanceThemeAwareLettering(enhanceModelSpecificPrompt(generateGrokPrompt(phraseOverride), 'grok'), 'grok')`;
      out = replaceCount(out, grokMarker, grokReplacement, 3, 'Grok theme lettering wrapping');

      return { code: out, map: null };
    },
  };
}
