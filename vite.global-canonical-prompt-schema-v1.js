const TARGET = '/src/App.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[global-canonical-prompt-schema-v1] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[global-canonical-prompt-schema-v1] ${label} marker is not unique`);
  }
  return source.slice(0, first) + replacement + source.slice(first + marker.length);
};

export function globalCanonicalPromptSchemaV1Plugin() {
  return {
    name: 'global-canonical-prompt-schema-v1',
    enforce: 'post',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null;
      let out = code;

      const helperMarker = `  const getPreviewPrompt = () => {`;
      const helper = `  const resolveCanonicalPromptLocale = (prompt = '') => {
    const text = String(prompt || '');
    const uiLocale = String(language || locale || currentLanguage || '').toLowerCase();
    if (uiLocale.startsWith('ko') || /\\[화풍 =|\\[목표\\]|\\[패널 계획\\]|\\[구도 및 배경\\]|\\[시트 구성 및 배경\\]/.test(text)) return 'ko-KR';
    if (uiLocale.startsWith('ja') || /[ぁ-んァ-ヶ一-龯]/.test(text) && /\\[(?:画風|目標|パネル|構図|背景)/.test(text)) return 'ja-JP';
    if (uiLocale.startsWith('zh') || /\\[(?:画风|目标|面板|构图|背景)/.test(text)) return 'zh-CN';
    return 'en-US';
  };

  const getCanonicalLocaleTypographyPolicy = (prompt = '') => {
    const localeCode = resolveCanonicalPromptLocale(prompt);
    if (localeCode === 'ko-KR') return \
\`[언어별 문자 정책 — ko-KR]
- 원문 한글 문구와 띄어쓰기·문장부호를 정확히 유지하고 각 문구는 정확히 한 번만 렌더링하세요.
- 한 줄은 가능하면 한글 4~7자 정도로 읽히게 구성하고 긴 문구는 원문을 바꾸지 않은 채 최대 두 줄로 자연스럽게 나누세요.
- 한글 자모·받침·복합모음이 배경이나 효과와 합쳐지지 않게 작은 화면 가독성을 우선하세요.\`;
    if (localeCode === 'ja-JP') return \
\`[言語別テキストポリシー — ja-JP]
- 元の日本語フレーズ、空白、句読点を正確に保ち、各フレーズは必ず1回だけ描画してください。
- 1行は読みやすい短い語句単位を優先し、長い文は原文を変更せず最大2行まで自然に改行してください。英語向けの単語数ルールや韓国語向けの文字数ルールを流用しないでください。
- かな・カナ・漢字・長音・小書き文字・句読点が効果線や背景と融合しないよう、小さなメッセンジャー画面での瞬間可読性を優先してください。\`;
    if (localeCode === 'zh-CN') return \
\`[语言专用文字政策 — zh-CN]
- 精确保留原始简体中文短语、空格与标点，每条短语只能绘制一次。
- 每行优先使用简短、自然、易读的语义单元；较长短语在不改写原文的前提下最多分成两行。不要套用韩文字符数规则或英文单词换行规则。
- 汉字、数字和标点不得与背景、描边或特效粘连，优先保证在小尺寸聊天界面中的瞬时可读性。\`;
    return \
\`[LOCALE-SPECIFIC TEXT POLICY — en-US]
- Preserve the exact source English phrase, spacing and punctuation, and render each phrase exactly once.
- Wrap by natural word groups rather than character count. Keep short phrases on one line when possible and longer phrases to no more than two compact lines without rewriting the source text. Never apply Korean character-count rules to English.
- Keep letters, apostrophes, punctuation and word spacing instantly readable at small messenger size and separated from effects/background detail.\`;
  };

  const getCanonicalSchemaLock = (prompt = '') => {
    const localeCode = resolveCanonicalPromptLocale(prompt);
    const headers = localeCode === 'ko-KR'
      ? ['화풍 전체 연출 감독', '문구/테마 = 의미 데이터', '우선순위', 'Typography = 화풍 연출', '목표', '참고 이미지', '캐릭터 정체성 LOCK', '선택 화풍 + 5축 프리셋', '공통 이모티콘 구도 감독', '셀 완전 격리 + Safe Frame', '문자 가독성 LOCK', '손·손가락 안정성', '패널 계획', '구도 및 배경', '일관성', '언어별 Text Policy', '제외 항목', 'Final Style Test']
      : localeCode === 'ja-JP'
        ? ['画風ディレクター', 'フレーズ/テーマ = 意味データ', '優先順位', 'タイポグラフィ = 画風演出', '目標', '参照画像', 'キャラクター同一性 LOCK', '選択画風 + 5軸プリセット', '共通スタンプ構図ディレクター', 'セル完全分離 + Safe Frame', '文字可読性 LOCK', '手・指の安定性', 'パネル計画', '構図と背景', '一貫性', '言語別 Text Policy', '除外項目', 'Final Style Test']
        : localeCode === 'zh-CN'
          ? ['画风总导演', '短语/主题 = 语义数据', '优先级', 'Typography = 画风演出', '目标', '参考图像', '角色身份 LOCK', '所选画风 + 五轴预设', '通用贴纸构图导演', '单元完全隔离 + Safe Frame', '文字可读性 LOCK', '手与手指稳定性', '面板计划', '构图与背景', '一致性', '语言专用 Text Policy', '排除项', 'Final Style Test']
          : ['Art Style Director', 'Phrase/Theme = Semantic Data', 'Priority', 'Typography = Style Direction', 'Goal', 'Reference Image', 'Character Identity LOCK', 'Selected Art Style + Five-Axis Preset', 'Global Sticker Composition Director', 'Complete Slot Isolation + Safe Frame', 'Typography Legibility LOCK', 'Hand/Finger Stability', 'Panel Plan', 'Composition and Background', 'Consistency', 'Locale-Specific Text Policy', 'Exclude', 'Final Style Test'];
    const localePolicy = getCanonicalLocaleTypographyPolicy(prompt);
    return \
\`[CANONICAL GLOBAL PROMPT SCHEMA — HARD CONSTRAINT]
- ko-KR, en-US, ja-JP and zh-CN must use one identical logical prompt architecture. Locale changes language only; it must not create a different directing system.
- Preserve this canonical block order and priority: \\${headers.map((h, i) => \\`\\\${i + 1}. \\\${h}\\\`).join('\\n')}
- The Korean prompt architecture is the canonical semantic source. English, Japanese and Simplified Chinese must be faithful locale translations of the same constraints, not separate prompt families.
- Rendering + Acting + Camera + Effects + Typography, slot isolation, safe frame, typography legibility, hand/finger stability, panel planning and final style test must have equal authority in every locale.
- Never inject a Korean-only typography heading/rule into en-US, ja-JP or zh-CN. Never apply English word-wrapping rules to Korean/Japanese/Chinese, and never apply Korean character-count rules to English/Japanese/Chinese.
- Locale-specific phrase sets and cultural wording may differ, but they may change WHAT only. They may not change HOW, priority, composition, style authority or technical locks.
- If an older locale-specific block conflicts with this schema, this canonical schema wins.\n\n\\${localePolicy}\`;
  };

${helperMarker}`;
      out = replaceOnce(out, helperMarker, helper, 'canonical helper injection');

      // Apply the same canonical schema to every model preview path after all older prompt decorators.
      const previewReturn = `    return enhanceSceneTypographyV5(basePrompt, previewModel);`;
      if (out.includes(previewReturn)) {
        out = out.replace(previewReturn, `    const canonicalBase = enhanceSceneTypographyV5(basePrompt, previewModel);\n    return canonicalBase + '\\n\\n' + getCanonicalSchemaLock(canonicalBase);`);
      }

      // Fallback: append the canonical schema at getPreviewPrompt's final return if the v5 marker changes.
      if (!out.includes('getCanonicalSchemaLock(canonicalBase)')) {
        const commonReturns = [
          `    return prompt;`,
          `    return basePrompt;`,
          `    return finalPrompt;`,
        ];
        let patched = false;
        for (const marker of commonReturns) {
          if (out.includes(marker)) {
            out = out.replace(marker, `    const canonicalPrompt = ${marker.includes('basePrompt') ? 'basePrompt' : marker.includes('finalPrompt') ? 'finalPrompt' : 'prompt'};\n    return canonicalPrompt + '\\n\\n' + getCanonicalSchemaLock(canonicalPrompt);`);
            patched = true;
            break;
          }
        }
        if (!patched) throw new Error('[global-canonical-prompt-schema-v1] preview return marker not found');
      }

      // Explicitly neutralize the known global leak when it survives older decorators.
      out = out.split('[HIGH-PRECISION KOREAN TYPOGRAPHY DIRECTIVE]').join('[LOCALE-SPECIFIC TYPOGRAPHY DIRECTIVE]');
      out = out.split('Keep Korean lettering to 4–7 characters per line when possible.').join('Use the locale-specific wrapping policy defined by the canonical schema; do not reuse Korean character-count rules for other languages.');

      return { code: out, map: null };
    },
  };
}
