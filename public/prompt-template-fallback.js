(() => {
  const LABELS = {
    ko: ['프롬프트 템플릿'],
    en: ['Prompt Template'],
    ja: ['プロンプト構造'],
    zh: ['提示词结构']
  };

  const COPY = {
    ko: {
      title: 'AI 이모티콘 프롬프트 4단계 템플릿',
      desc: '캐릭터 정체성을 유지하면서 15종 이모티콘을 안정적으로 만들기 위한 기본 구조입니다.',
      steps: [
        ['1', '캐릭터 기준 고정', '대상, 얼굴·털·헤어 특징, 비율, 성격처럼 반드시 유지할 정보를 먼저 적습니다.'],
        ['2', '화풍·의상·표현 설정', '원하는 화풍, 의상, 선 처리, 채색 방식, 표정 강도를 구체적으로 지정합니다.'],
        ['3', '15개 표정·동작·문구 구성', '같은 캐릭터로 서로 다른 감정과 동작 15개를 만들고 각 컷의 문구를 정확히 지정합니다.'],
        ['4', '출력 조건 고정', '5×3 시트, 동일 캐릭터 유지, 충분한 여백, 선명한 결과와 후처리에 적합한 배경 조건을 명시합니다.']
      ],
      tip: '한글 문구는 이미지 모델이 오타를 낼 수 있으므로, 최종 제출용은 캐릭터 이미지를 만든 뒤 실제 폰트로 별도 합성하는 방식이 가장 안정적입니다.'
    },
    en: {
      title: '4-Step AI Sticker Prompt Template',
      desc: 'A simple structure for producing a consistent 15-sticker set while keeping one character identity.',
      steps: [
        ['1', 'Lock the character identity', 'Define the subject, recognizable facial or fur traits, proportions, and personality that must stay consistent.'],
        ['2', 'Set style, outfit, and rendering', 'Specify the art style, outfit, line treatment, coloring, and expression intensity.'],
        ['3', 'Plan 15 expressions and phrases', 'Create 15 distinct emotions and poses with exact text or phrase instructions for each sticker.'],
        ['4', 'Lock the output format', 'Request a 5×3 sheet, consistent character design, safe spacing, crisp output, and a background suitable for post-processing.']
      ],
      tip: 'For production text, generate the character art first and add final lettering with a real font for the most reliable spelling.'
    },
    ja: {
      title: 'AIスタンプ用 4ステップ・プロンプトテンプレート',
      desc: '同じキャラクターの特徴を保ちながら15個のスタンプを安定して作るための基本構成です。',
      steps: [
        ['1', 'キャラクター基準を固定', '人物・顔・毛柄・髪型・比率・性格など、必ず維持する特徴を最初に指定します。'],
        ['2', '画風・衣装・表現を設定', '画風、衣装、線、塗り、表情の強さを具体的に指定します。'],
        ['3', '15個の表情・動作・文言を構成', '同じキャラクターで異なる感情とポーズを15種類作り、各カットの文言を明確にします。'],
        ['4', '出力条件を固定', '5×3シート、同一キャラクター、十分な余白、鮮明な画像、後処理しやすい背景条件を指定します。']
      ],
      tip: '日本語文字は画像生成で崩れることがあるため、完成用テキストは実フォントで後から合成する方法が安定します。'
    },
    zh: {
      title: 'AI表情包 4步提示词模板',
      desc: '用于保持同一角色特征并稳定生成15张表情包的基础结构。',
      steps: [
        ['1', '固定角色身份', '先写清人物、脸部或毛发特征、比例和性格等必须保持一致的信息。'],
        ['2', '设定画风、服装与表现', '明确画风、服装、线条、上色方式和表情夸张程度。'],
        ['3', '规划15种表情、动作与文案', '保持同一角色，制作15种不同情绪和动作，并明确每张图的文案。'],
        ['4', '固定输出格式', '指定5×3合集、角色一致、留白充足、画面清晰以及便于后期处理的背景条件。']
      ],
      tip: '中文文字在图片生成中可能出现错字，正式成品建议先生成角色图，再使用真实字体进行文字合成。'
    }
  };

  const getLang = () => {
    const htmlLang = (document.documentElement.lang || 'ko').toLowerCase();
    if (htmlLang.startsWith('ja')) return 'ja';
    if (htmlLang.startsWith('zh')) return 'zh';
    if (htmlLang.startsWith('en')) return 'en';
    return 'ko';
  };

  const isTemplateButton = (button) => {
    const text = (button?.textContent || '').trim();
    return Object.values(LABELS).flat().some((label) => text.includes(label));
  };

  const originalTemplateVisible = (section, lang) => {
    const needles = {
      ko: ['이모티콘 프롬프트 메이커란?', '필수 4단계 템플릿'],
      en: ['What is the Emoticon Prompt Maker?', '4-Step Essential Prompt Template'],
      ja: ['スタンププロンプトメーカー', '必須4ステップテンプレート'],
      zh: ['什么是表情包提示词生成器', '4步黄金模板']
    }[lang];
    const text = section?.innerText || '';
    return needles.some((needle) => text.includes(needle));
  };

  const buildFallback = (lang) => {
    const copy = COPY[lang];
    const wrapper = document.createElement('div');
    wrapper.className = 'prompt-template-fallback';
    wrapper.style.cssText = 'margin-top:14px;display:flex;flex-direction:column;gap:12px;';

    const intro = document.createElement('div');
    intro.style.cssText = 'border:1px solid #F0DFB7;background:#FFF9EE;border-radius:14px;padding:16px;';
    intro.innerHTML = `<div style="font-size:17px;font-weight:900;line-height:1.45;color:#3E382F;word-break:${lang === 'ko' ? 'keep-all' : 'normal'}">📌 ${copy.title}</div><p style="margin:7px 0 0;font-size:13px;line-height:1.7;color:#6F655A;font-weight:600;word-break:${lang === 'ko' ? 'keep-all' : 'normal'}">${copy.desc}</p>`;
    wrapper.appendChild(intro);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;';
    copy.steps.forEach(([num, title, desc]) => {
      const card = document.createElement('div');
      card.style.cssText = 'border:1px solid #E8E1D6;background:#FFFFFF;border-radius:14px;padding:14px;min-width:0;';
      card.innerHTML = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="display:inline-flex;width:25px;height:25px;align-items:center;justify-content:center;border-radius:50%;background:#DDF3EA;color:#315F54;font-size:12px;font-weight:900;flex:none">${num}</span><strong style="font-size:14px;line-height:1.45;color:#38332D;word-break:${lang === 'ko' ? 'keep-all' : 'normal'}">${title}</strong></div><p style="margin:0;font-size:12px;line-height:1.7;color:#71685E;font-weight:600;word-break:${lang === 'ko' ? 'keep-all' : 'normal'}">${desc}</p>`;
      grid.appendChild(card);
    });
    wrapper.appendChild(grid);

    const tip = document.createElement('div');
    tip.style.cssText = 'border:1px solid #CFE7DE;background:#F1FBF7;border-radius:14px;padding:13px 14px;font-size:12px;line-height:1.7;color:#45655C;font-weight:700;word-break:' + (lang === 'ko' ? 'keep-all' : 'normal');
    tip.textContent = `💡 ${copy.tip}`;
    wrapper.appendChild(tip);

    const style = document.createElement('style');
    style.textContent = '@media(max-width:639px){.prompt-template-fallback>div:nth-child(2){grid-template-columns:1fr!important}.prompt-template-fallback{margin-top:12px!important}}';
    wrapper.appendChild(style);
    return wrapper;
  };

  const ensureTemplate = (button) => {
    const section = button.closest('section');
    if (!section) return;
    const lang = getLang();
    section.querySelectorAll('.prompt-template-fallback').forEach((node) => node.remove());
    if (originalTemplateVisible(section, lang)) return;

    const tabBar = button.parentElement;
    const headerBlock = tabBar?.parentElement;
    const fallback = buildFallback(lang);
    if (headerBlock && headerBlock.parentElement === section) {
      headerBlock.insertAdjacentElement('afterend', fallback);
    } else {
      section.appendChild(fallback);
    }
  };

  document.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    if (isTemplateButton(button)) {
      window.setTimeout(() => ensureTemplate(button), 80);
      return;
    }

    const section = button.closest('section');
    if (section && section.querySelector('.prompt-template-fallback')) {
      const text = (button.textContent || '').trim();
      if (/AI 모델|AI Models|AIモデル|AI模型|배경|Remove BG|背景|去除背景|이모티콘 등록|How to Use|スタンプ登録|使用指南/.test(text)) {
        section.querySelectorAll('.prompt-template-fallback').forEach((node) => node.remove());
      }
    }
  }, true);
})();
