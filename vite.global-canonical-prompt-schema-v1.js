const TARGET = '/src/App.jsx';

const replaceOnceAfter = (source, startMarker, target, replacement, label) => {
  const start = source.indexOf(startMarker);
  if (start < 0) throw new Error(`[global-canonical-prompt-schema-v1] ${label} start marker not found`);
  const index = source.indexOf(target, start + startMarker.length);
  if (index < 0) throw new Error(`[global-canonical-prompt-schema-v1] ${label} target marker not found`);
  return source.slice(0, index) + replacement + source.slice(index + target.length);
};

export function globalCanonicalPromptSchemaV1Plugin() {
  return {
    name: 'global-canonical-prompt-schema-v1',
    enforce: 'post',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null;
      let out = code.replace(/\r\n/g, '\n');

      const enhanceMarker = `  const enhanceSceneTypographyV5 = (prompt, model) => {`;
      if (!out.includes(enhanceMarker)) {
        throw new Error('[global-canonical-prompt-schema-v1] enhanceSceneTypographyV5 marker not found');
      }

      const helper = `  const resolveCanonicalPromptLocale = (prompt = '') => {
    const text = String(prompt || '');
    const uiLang = typeof lang !== 'undefined' ? String(lang || '').toLowerCase() : '';
    if (uiLang === 'ko' || uiLang.startsWith('ko-')) return 'ko-KR';
    if (uiLang === 'ja' || uiLang.startsWith('ja-')) return 'ja-JP';
    if (uiLang === 'zh' || uiLang.startsWith('zh-')) return 'zh-CN';
    if (uiLang === 'en' || uiLang.startsWith('en-')) return 'en-US';

    if (/\\[(?:화풍 =|목표|패널 계획|구도 및 배경|시트 구성 및 배경)/.test(text)) return 'ko-KR';
    if (/\\[(?:画風|目標|パネル計画|構図|背景)/.test(text) || /[ぁ-んァ-ヶ]/.test(text)) return 'ja-JP';
    if (/\\[(?:画风|目标|面板计划|构图|背景)/.test(text)) return 'zh-CN';
    return 'en-US';
  };

  const stripCanonicalSupplementBlock = (source, headerPrefix) => {
    let result = String(source || '');
    const token = '[' + headerPrefix;
    let start = result.indexOf(token);
    while (start >= 0) {
      const next = result.indexOf('\\n\\n[', start + token.length);
      const end = next >= 0 ? next : result.length;
      const before = result.slice(0, start).replace(/\\s+$/, '');
      const after = result.slice(end).replace(/^\\s+/, '');
      result = before + (before && after ? '\\n\\n' : '') + after;
      start = result.indexOf(token);
    }
    return result;
  };

  const normalizeLegacyLocaleTypography = (source, localeCode) => {
    let result = String(source || '');
    const heading = localeCode === 'en-US'
      ? '[HIGH-PRECISION ENGLISH TYPOGRAPHY DIRECTIVE]'
      : localeCode === 'ja-JP'
        ? '[高精度日本語タイポグラフィ指示]'
        : localeCode === 'zh-CN'
          ? '[高精度简体中文文字指令]'
          : '[고정밀 한글 타이포그래피 지침]';
    result = result
      .replaceAll('[HIGH-PRECISION KOREAN TYPOGRAPHY DIRECTIVE]', heading)
      .replaceAll('[HIGH-PRECISION KOREAN HANDWRITTEN STICKER TYPOGRAPHY]', heading)
      .replaceAll('[HIGH-PRECISION KOREAN TEXT ACCURACY — TYPOGRAPHY SUBORDINATE TO SELECTED STYLE]', heading);

    if (localeCode === 'en-US') {
      result = result.replaceAll(
        'Keep Korean lettering to 4–7 characters per line when possible. Wrap longer phrases naturally into no more than two compact lines without changing the source text.',
        'Wrap English by natural word groups rather than character count. Keep short phrases on one line when possible and longer phrases to no more than two compact lines without changing the source text.'
      );
    } else if (localeCode === 'ja-JP') {
      result = result.replaceAll(
        'Keep Korean lettering to 4–7 characters per line when possible. Wrap longer phrases naturally into no more than two compact lines without changing the source text.',
        '日本語は文字数を機械的に固定せず、読みやすい語句・文節単位で配置してください。長い文は原文を変えず最大2行まで自然に改行してください。'
      );
    } else if (localeCode === 'zh-CN') {
      result = result.replaceAll(
        'Keep Korean lettering to 4–7 characters per line when possible. Wrap longer phrases naturally into no more than two compact lines without changing the source text.',
        '简体中文不要套用韩文字符数规则，应按自然语义单元排版；较长短语在不改写原文的前提下最多分成两行。'
      );
    }
    return result;
  };

  const getCanonicalLocaleSupplement = (localeCode, model, textEnabled) => {
    const modelName = model === 'gemini' ? 'Gemini' : model === 'grok' ? 'Grok' : 'GPT';

    if (localeCode === 'ko-KR') return '';

    if (localeCode === 'ja-JP') return [
      '[フレーズ/テーマ = 意味データ — 演出権限なし]',
      '- フレーズとテーマは「何を伝えるか」だけを提供します。意味、感情の方向、行動目的、状況、意味上必要な小物の存在のみを指定します。',
      '- 具体的なポーズ、表情の描き方、視線、重心、カメラ距離・角度・遠近・短縮、効果素材、色処理、文字スタイルは指定しません。すべてのHOWは選択画風の Rendering + Acting + Camera + Effects + Typography が決定します。',
      '',
      '[優先順位]',
      '- 不変レイヤー: キャラクターの同一性 + 固定衣装。演出レイヤー: 選択画風 > フレーズの意味 > レイアウト/技術制約。フレーズやテーマが画風の演出方法を変更してはいけません。',
      '',
      '[タイポグラフィ = 画風演出]',
      '- 正確な原文と瞬間可読性は守りますが、字形、線材、太さ、傾き、字間、ベースライン、サイズ差、色、縁取り、影、配置、動きは選択画風の Typography が決定します。汎用スタンプフォントへ戻さないでください。',
      '',
      '[共通スタンプ構図ディレクター — 全画風共通 HARD CONSTRAINT]',
      '- 各セルは複雑な漫画コマやポスターではなく、1つの感情と1つの主要動作が即座に読める独立スタンプです。15枚シートでは全身または3/4全身を基本とし、キャラクター約55〜70%、文字と呼吸空間約25〜35%を目安にします。',
      '- 動きが片側へ向く場合、文字は反対側・上部・側面の Negative Space を優先し、顔や文字を効果で覆わないでください。',
      '',
      '[セル完全分離 + Safe Frame — HARD CONSTRAINT]',
      '- 見えない5列×3行を15個の独立クリッピングキャンバスとして扱い、各セル外周の少なくとも8%、できれば10%を完全な空白ガターとして残してください。髪、手足、衣装、小物、文字、影、速度線、粒子、発光など一切を隣セルへ侵入・接触させないでください。',
      '- 境界衝突の可能性がある場合は文字だけを縮小したり切り取ったりせず、キャラクター+文字+効果を1つの Scene Group として90%→85%→80%へ均等縮小し、セル内で再配置してください。',
      '',
      ...(textEnabled ? ['[文字可読性 LOCK — 画風維持型 HARD CONSTRAINT]', '- 文字位置・行数・大きさ・Text Safe Zoneを先に確定してからキャラクター、Camera、Acting、Effectsを設計してください。透明背景では外部UI色に依存せず、画風固有の中間色・下塗り・縁処理などで明暗どちらの画面でも読める局所コントラストを完成させてください。', '- 日本語は自然な語句・文節単位で配置し、長文は原文を変えず最大2行まで。かな・カナ・漢字・長音・小書き文字・句読点を正確に保ちます。', ''] : []),
      '[手・指の安定性 — HARD CONSTRAINT]',
      '- カメラ正面への指差し、大きく開いた手のひら、指を強く重ねる極端な短縮を自動既定値にしないでください。同じ感情を視線、頭の向き、身体軸、腕や袖の流れで表せるなら、より安定した画風固有の演技を優先します。必要な手は小さく明瞭に、5本指の接続を自然に描きます。',
      '',
      '[グローバル共通プロンプト構造 — CANONICAL LOCK]',
      '- 韓国語版で確立した構造を意味上の原本とし、日本語版は同じブロック順序・同じ優先順位・同じ制約強度を保ったローカライズです。別の日本向け演出システムを作らないでください。',
      '- 共通順序: 画風ディレクター → フレーズ/テーマ意味データ → 優先順位 → Typography → 目標 → 参照画像 → キャラクター同一性 → 選択画風+5軸 → 共通構図 → セル分離/Safe Frame → 文字可読性 → 手指安定性 → パネル計画 → 構図/背景 → 一貫性 → 言語別文字政策 → 除外 → Final Style Test。',
      '',
      '[FINAL STYLE TEST]',
      '- フレーズが変わっても Rendering, Acting, Camera, Effects, Typography は同じ画風DNAを維持してください。文字を隠しても演技とカメラで画風が分かり、キャラクターを隠しても文字だけで同じ画風が分かること。',
      '- 実行モデル: ' + modelName
    ].join('\\n');

    if (localeCode === 'zh-CN') return [
      '[短语/主题 = 语义数据 — 无导演权限]',
      '- 短语与主题只决定“表达什么”：语言含义、情绪方向、行动目的、情境，以及语义上确有必要时的道具存在。',
      '- 它们不得规定具体姿势、表情画法、视线、重心、镜头距离/角度/透视/缩短、特效材质、色彩处理或文字风格。所有HOW均由所选画风的 Rendering + Acting + Camera + Effects + Typography 决定。',
      '',
      '[优先级]',
      '- 不可变层：角色身份 + 固定服装。导演层：所选画风 > 短语含义 > 布局/技术约束。短语或主题不得改变画风的导演方法。',
      '',
      '[Typography = 画风导演]',
      '- 必须保持原文准确和瞬时可读，但字形、笔触材质、粗细、倾斜、字距、基线、字号对比、颜色、描边、阴影、位置与动态都由所选画风的 Typography 决定，不得退回通用聊天贴纸字体。',
      '',
      '[通用贴纸构图导演 — 所有画风共用 HARD CONSTRAINT]',
      '- 每个单元都是独立贴纸场景，只表现一个立即可读的情绪和一个主要动作，不要做成复杂漫画格或海报。15张合集以全身或3/4全身为默认，角色约占55〜70%，文字与呼吸空间约占25〜35%。',
      '- 当角色动作朝向一侧时，文字优先放在反方向、上方或侧面的 Negative Space。画风特效不得遮挡脸部或文字。',
      '',
      '[单元完全隔离 + Safe Frame — HARD CONSTRAINT]',
      '- 将不可见的5列×3行视为15个完全独立的裁切画布。每个单元四周至少8%、最好10%必须保持绝对空白。头发、四肢、衣物、道具、文字、阴影、速度线、粒子、发光等任何元素都不得进入、接触或连接相邻单元。',
      '- 若存在碰撞边界风险，不得只缩小文字或裁切角色；应把角色+文字+特效作为一个 Scene Group，按90%→85%→80%整体等比缩小并重新排布。',
      '',
      ...(textEnabled ? ['[文字可读性 LOCK — 保持画风 HARD CONSTRAINT]', '- 先确定短语位置、行数、尺寸和 Text Safe Zone，再设计角色占比、Camera、Acting 与 Effects。透明背景不能依赖聊天软件外部底色，应使用画风原生的中间色衬底、底绘、边缘处理等，让文字在浅色和深色界面都保持清晰。', '- 简体中文按自然语义单元排版，不套用韩文字符数规则；长短语在不改写原文的前提下最多两行。汉字、数字和标点必须准确。', ''] : []),
      '[手与手指稳定性 — HARD CONSTRAINT]',
      '- 不要把正对镜头的指点、大幅张开的手掌或手指严重重叠的极端透视设为默认表达。若视线、头部方向、身体轴线、手臂位置或衣袖流动即可表达同一情绪，应优先采用更稳定且符合画风的表演。必须出现的手要小而清晰，并保持五指连接自然。',
      '',
      '[全球统一提示词结构 — CANONICAL LOCK]',
      '- 以韩文版已经确立的提示词结构作为语义母版，中文版必须保持相同的区块顺序、优先级和约束强度，只进行本地化翻译，不建立另一套“中国版导演系统”。',
      '- 统一顺序：画风总导演 → 短语/主题语义数据 → 优先级 → Typography → 目标 → 参考图像 → 角色身份 → 所选画风+五轴 → 通用构图 → 单元隔离/Safe Frame → 文字可读性 → 手指稳定性 → 面板计划 → 构图/背景 → 一致性 → 语言文字政策 → 排除项 → Final Style Test。',
      '',
      '[FINAL STYLE TEST]',
      '- 无论短语如何变化，Rendering、Acting、Camera、Effects、Typography 都必须维持同一画风DNA。隐藏文字后仍应从动作和镜头看出画风；隐藏角色后也应只凭文字识别同一画风。',
      '- 执行模型：' + modelName
    ].join('\\n');

    return [
      '[PHRASE/THEME = SEMANTIC DATA — NO DIRECTING AUTHORITY]',
      '- Phrase/theme controls WHAT only: verbal meaning, emotional direction, action purpose, situational context and only semantically necessary prop existence. It does not prescribe pose, facial rendering, gaze, weight, camera, effect material, color treatment or typography style. Every HOW decision belongs to the selected art style’s Rendering + Acting + Camera + Effects + Typography.',
      '',
      '[PRIORITY]',
      '- Immutable layer: character identity + fixed outfit. Direction layer: selected art style > phrase meaning > layout/technical constraints. Phrase/theme must never replace the selected style’s directing method.',
      '',
      '[TYPOGRAPHY = STYLE DIRECTION]',
      '- Preserve exact source text and instant readability, while letterform, stroke material, weight, tilt, spacing, baseline, scale contrast, color, outline, shadow, placement and motion inherit the selected art style. Never fall back to a generic messenger-sticker font.',
      '',
      '[GLOBAL STICKER COMPOSITION DIRECTOR — ALL ART STYLES HARD CONSTRAINT]',
      '- Each cell is one independent sticker scene with one immediately readable emotion and one primary action, not a dense comic panel or poster. On a 15-sticker sheet prefer full-body or three-quarter-body framing; keep character occupancy roughly 55–70% and reserve roughly 25–35% for phrase/breathing space.',
      '- When motion leans one way, place lettering primarily in opposite-side, upper or side Negative Space. Keep style-native effects around/behind the character without covering the face or text.',
      '',
      '[COMPLETE SLOT ISOLATION + SAFE FRAME — HARD CONSTRAINT]',
      '- Treat the invisible 5-column × 3-row sheet as 15 completely independent clipping canvases. Keep at least 8%, preferably 10%, of every slot edge as an absolute empty gutter. No hair, limb, clothing, prop, lettering, shadow, speed line, particle, glow or trail may touch, enter or visually connect to a neighboring slot.',
      '- If anything risks a boundary collision, scale character + lettering + effects together as one Scene Group 90% → 85% → 80% and restage it. Never fix crowding by cropping or shrinking text alone.',
      '',
      ...(textEnabled ? ['[TYPOGRAPHY LEGIBILITY LOCK — STYLE-PRESERVING HARD CONSTRAINT]', '- Establish phrase position, line count, scale and Text Safe Zone before designing character occupancy, Camera, Acting and Effects. On transparent output, do not depend on the messenger UI background; complete style-native local contrast so lettering remains readable on both light and dark interfaces.', '- Wrap English by natural word groups, not Korean character counts. Keep short phrases on one line when possible and longer phrases to no more than two compact lines without rewriting the source.', ''] : []),
      '[HAND/FINGER STABILITY — HARD CONSTRAINT]',
      '- Do not auto-select direct-to-camera pointing, a large open palm or severe foreshortening with overlapping fingers. When gaze, head direction, body axis, arm placement or clothing flow can express the same emotion, prefer the safer style-native acting choice. When a hand is necessary, keep it small, clear and anatomically coherent with five distinct fingers.',
      '',
      '[CANONICAL GLOBAL PROMPT SCHEMA — HARD CONSTRAINT]',
      '- The Korean prompt architecture is the canonical semantic source. en-US must keep the same block order, priority and constraint strength and localize language only; it is not a separate Western directing system.',
      '- Canonical order: Art Style Director → Phrase/Theme Semantic Data → Priority → Typography → Goal → Reference Image → Character Identity → Selected Art Style + Five-Axis Preset → Global Composition → Slot Isolation/Safe Frame → Typography Legibility → Hand/Finger Stability → Panel Plan → Composition/Background → Consistency → Locale Text Policy → Exclude → Final Style Test.',
      '',
      '[FINAL STYLE TEST]',
      '- Across phrase changes, Rendering, Acting, Camera, Effects and Typography must preserve one style DNA. With text hidden the acting/camera must still reveal the style; with the character hidden the lettering alone must still reveal the same style.',
      '- Execution model: ' + modelName
    ].join('\\n');
  };

  const normalizeGlobalCanonicalPrompt = (prompt, model) => {
    const localeCode = resolveCanonicalPromptLocale(prompt);
    let base = normalizeLegacyLocaleTypography(prompt, localeCode);
    if (localeCode === 'ko-KR') return base;

    const stalePrefixes = [
      'PHRASE/THEME = SEMANTIC DATA',
      'TEXT ACCURACY',
      'NO-TEXT MODE',
      'IDENTITY & OUTFIT',
      'FRAMING',
      '15-STICKER SHEET',
      'STYLE-DIRECTED ACTING',
      'STYLE-SUBORDINATE LETTERING',
      'GEMINI EXECUTION',
      'GROK EXECUTION',
      'GLOBAL STICKER COMPOSITION DIRECTOR',
      'TYPOGRAPHY LEGIBILITY LOCK',
      'STYLE-NATIVE SEMANTIC TRANSLATION',
      'CANONICAL GLOBAL PROMPT SCHEMA'
    ];
    for (const prefix of stalePrefixes) base = stripCanonicalSupplementBlock(base, prefix);

    const textEnabled = model === 'gpt'
      ? gptTextMode === 'text'
      : model === 'gemini'
        ? geminiTextMode === 'text'
        : grokTextMode === 'text';
    const supplement = getCanonicalLocaleSupplement(localeCode, model, textEnabled);
    return base.replace(/\\s+$/, '') + '\\n\\n' + supplement;
  };

`;

      out = out.replace(enhanceMarker, helper + enhanceMarker);

      out = replaceOnceAfter(
        out,
        enhanceMarker,
        `    return base;\n  };`,
        `    return normalizeGlobalCanonicalPrompt(base, model);\n  };`,
        'enhanceSceneTypographyV5 return normalization'
      );

      return { code: out, map: null };
    },
  };
}
