import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const sourcePath = path.join(distDir, 'index.html');
const sitemapPath = path.join(distDir, 'sitemap.xml');
if (!fs.existsSync(sourcePath)) throw new Error('dist/index.html not found');

const source = fs.readFileSync(sourcePath, 'utf8');
const origin = 'https://emoticonpromptmaker.com';

const localeMeta = {
  ko: { htmlLang: 'ko', prefix: '', ogLocale: 'ko_KR', home: '/', tool: '/background-remover/', ctaMain: 'AI 이모티콘 만들기', ctaTool: '배경 제거 도구 열기', related: '다른 무료 도구도 살펴보세요' },
  en: { htmlLang: 'en', prefix: 'en', ogLocale: 'en_US', home: '/en/', tool: '/en/background-remover/', ctaMain: 'Open AI Sticker Maker', ctaTool: 'Open Background Tool', related: 'Explore more free tools' },
  ja: { htmlLang: 'ja', prefix: 'ja', ogLocale: 'ja_JP', home: '/ja/', tool: '/ja/background-remover/', ctaMain: 'AIスタンプを作る', ctaTool: '背景削除ツールを開く', related: 'ほかの無料ツールも見る' },
  zh: { htmlLang: 'zh-CN', prefix: 'zh', ogLocale: 'zh_CN', home: '/zh/', tool: '/zh/background-remover/', ctaMain: '开始制作AI表情包', ctaTool: '打开背景移除工具', related: '查看更多免费工具' }
};

const featureData = {
  'ai-sticker-maker': {
    target: 'main',
    ko: {
      title: '무료 AI 스티커 메이커 | 사진·캐릭터로 이모티콘 만들기',
      description: 'ChatGPT, Gemini, Grok용 AI 이모티콘·스티커 프롬프트를 무료로 만들고 15종 시트 제작, 배경 제거, PNG 저장까지 한 번에 진행하세요.',
      keywords: 'AI 스티커 메이커, AI 이모티콘 만들기, 이모티콘 제작, 카카오톡 이모티콘 만들기, AI 캐릭터 만들기, 스티커 생성기',
      h1: '무료 AI 스티커·이모티콘 메이커',
      intro: '캐릭터 종류, 성격, 의상, 화풍, 문구를 선택하면 ChatGPT·Gemini·Grok에 바로 붙여 넣을 수 있는 15종 이모티콘 프롬프트를 자동으로 만듭니다.',
      bullets: ['사진 또는 캐릭터 설정으로 맞춤 프롬프트 생성', '15가지 서로 다른 표정·동작·문구 구성', 'ChatGPT·Gemini·Grok별 프롬프트 최적화', '완성 이미지의 배경 제거·분리·PNG 저장까지 연결'],
      steps: ['캐릭터와 화풍을 선택합니다.', '원하는 이모티콘 문구 테마를 고릅니다.', 'AI 모델에 맞는 프롬프트를 복사해 이미지를 생성합니다.', '필요하면 배경 제거와 15개 자동 분리로 마무리합니다.'],
      faqQ: 'AI 스티커 메이커는 무료인가요?',
      faqA: 'Prompt Maker의 기본 프롬프트 생성과 배경 제거·시트 분리 도구는 웹에서 바로 사용할 수 있습니다.'
    },
    en: {
      title: 'Free AI Sticker Maker | Create Custom Emoticons from Photos',
      description: 'Create AI sticker and emoticon prompts for ChatGPT, Gemini and Grok, generate 15-expression sheets, remove backgrounds and export transparent PNGs.',
      keywords: 'AI sticker maker, AI emoji maker, custom sticker generator, emoticon maker, photo to sticker, sticker sheet maker, AI character sticker',
      h1: 'Free AI Sticker & Emoticon Maker',
      intro: 'Choose a character, personality, outfit, art style and phrases to build ready-to-use 15-sticker prompts for ChatGPT, Gemini and Grok.',
      bullets: ['Create prompts from a photo or character settings', 'Build 15 distinct expressions, poses and phrases', 'Model-specific prompts for ChatGPT, Gemini and Grok', 'Continue with background removal, splitting and PNG export'],
      steps: ['Choose your character and art style.', 'Pick a sticker phrase theme.', 'Copy the model-ready prompt and generate your image.', 'Finish with transparent background removal and 15-sticker splitting if needed.'],
      faqQ: 'Is the AI sticker maker free?',
      faqA: 'Prompt Maker provides web-based prompt creation plus background removal and sticker-sheet tools that can be used directly in the browser.'
    },
    ja: {
      title: '無料AIスタンプメーカー | 写真・キャラからスタンプ作成',
      description: 'ChatGPT・Gemini・Grok向けのAIスタンププロンプトを作成し、15個シート、背景透過、PNG保存まで一つの流れで利用できます。',
      keywords: 'AIスタンプメーカー, AIスタンプ作成, LINEスタンプ作成, 写真からスタンプ, AIキャラクター, スタンプ生成, 絵文字メーカー',
      h1: '無料AIスタンプ・絵文字メーカー',
      intro: 'キャラクター、性格、衣装、画風、セリフを選ぶだけで、ChatGPT・Gemini・Grokに使える15種類のスタンププロンプトを作成できます。',
      bullets: ['写真またはキャラクター設定からプロンプト作成', '15種類の表情・ポーズ・セリフを構成', 'ChatGPT・Gemini・Grok別に最適化', '背景透過・15個分割・PNG保存まで連携'],
      steps: ['キャラクターと画風を選びます。', 'スタンプのセリフテーマを選びます。', 'AI別プロンプトをコピーして画像を生成します。', '必要に応じて背景透過と15個自動分割で仕上げます。'],
      faqQ: 'AIスタンプメーカーは無料ですか？',
      faqA: 'Prompt Makerではプロンプト作成、背景透過、スタンプシート分割などのWebツールをブラウザから利用できます。'
    },
    zh: {
      title: '免费AI表情包生成器 | 照片与角色制作贴纸',
      description: '为ChatGPT、Gemini和Grok生成AI表情包提示词，制作15张表情套图，并继续完成去背景、透明PNG和批量分割。',
      keywords: 'AI表情包生成器, AI贴纸生成器, 表情包制作, 照片转贴纸, AI角色, 表情包提示词, 贴纸制作',
      h1: '免费AI表情包与贴纸生成器',
      intro: '选择角色、性格、服装、画风和文案，即可生成适用于ChatGPT、Gemini和Grok的15张表情包提示词。',
      bullets: ['根据照片或角色设置生成提示词', '一次规划15种表情、动作和文案', '针对ChatGPT、Gemini、Grok分别优化', '继续完成去背景、自动分割和透明PNG导出'],
      steps: ['选择角色和画风。', '选择表情包文案主题。', '复制对应AI模型的提示词并生成图片。', '需要时继续进行背景移除和15张自动分割。'],
      faqQ: 'AI表情包生成器免费吗？',
      faqA: 'Prompt Maker提供可直接在浏览器中使用的提示词生成、背景移除和表情包分割工具。'
    }
  },
  'photo-to-sticker': {
    target: 'main',
    ko: {
      title: '사진으로 이모티콘 만들기 | AI 사진 캐릭터·스티커 변환',
      description: '인물이나 반려동물 사진의 특징을 살린 AI 이모티콘 프롬프트를 만들고 15가지 표정 스티커 시트로 확장해 보세요.',
      keywords: '사진으로 이모티콘 만들기, 사진 스티커 만들기, 사진 캐릭터 변환, AI 사진 이모티콘, 반려동물 이모티콘, 얼굴 캐릭터 만들기',
      h1: '사진 한 장으로 나만의 AI 이모티콘 만들기',
      intro: '본인·가족·친구·반려동물 사진을 참고 이미지로 사용해 얼굴형, 헤어스타일, 털 무늬 같은 식별 특징을 살린 캐릭터 프롬프트를 만들 수 있습니다.',
      bullets: ['닮음 우선·균형 추천·화풍 우선 모드 지원', '사람과 반려동물의 핵심 특징을 프롬프트에 반영', '동일 캐릭터로 15가지 감정과 포즈 확장', '완성 시트는 배경 제거 후 개별 PNG로 분리 가능'],
      steps: ['참고 사진을 준비합니다.', '사진 반영 강도를 선택합니다.', '캐릭터·의상·화풍과 문구를 설정합니다.', 'AI에서 생성 후 배경 제거와 시트 분리를 진행합니다.'],
      faqQ: '사진은 서버에 저장되나요?',
      faqA: '배경 제거 도구의 이미지 처리는 브라우저에서 진행됩니다. AI 이미지 생성 서비스에 사진을 첨부할 경우 해당 서비스의 처리 정책은 별도로 확인해야 합니다.'
    },
    en: {
      title: 'Photo to Sticker | Turn a Photo into AI Emoticons',
      description: 'Create character prompts from a person or pet photo and expand recognizable features into a 15-expression AI sticker sheet.',
      keywords: 'photo to sticker, photo to emoji, photo to cartoon sticker, AI photo sticker, pet sticker maker, face sticker generator, custom emoticon from photo',
      h1: 'Turn One Photo into a Custom AI Sticker Set',
      intro: 'Use a photo of yourself, a friend, family member or pet as the identity reference and preserve recognizable features while changing expressions and poses.',
      bullets: ['Choose likeness-first, balanced or style-first reference strength', 'Preserve key face, hair, fur and outfit traits', 'Expand one identity into 15 expressions and poses', 'Remove backgrounds and split the final sheet into individual PNGs'],
      steps: ['Prepare a clear reference photo.', 'Choose how strongly the photo should guide the character.', 'Set the outfit, style and sticker phrases.', 'Generate with AI, then remove the background and split the sheet.'],
      faqQ: 'Is my photo stored by Prompt Maker?',
      faqA: 'The background-removal tool processes images in the browser. If you upload a photo to an external AI image service, review that service’s own data policy separately.'
    },
    ja: {
      title: '写真からAIスタンプ作成 | 顔・ペットをキャラクター化',
      description: '人物やペットの写真の特徴を残したAIスタンプ用プロンプトを作り、15種類の表情スタンプへ展開できます。',
      keywords: '写真からスタンプ, 写真をイラスト化, AI写真スタンプ, 顔スタンプ作成, ペットスタンプ, LINEスタンプ写真, AIキャラクター化',
      h1: '写真1枚からオリジナルAIスタンプを作成',
      intro: '自分、家族、友人、ペットの写真を基準に、顔立ち・髪型・毛色などの識別特徴を残しながらスタンプ用キャラクターに展開できます。',
      bullets: ['似顔絵優先・バランス・画風優先を選択', '顔・髪・毛柄・衣装などの特徴を維持', '同じキャラクターで15種類の表情とポーズ', '背景透過後に個別PNGへ自動分割可能'],
      steps: ['見やすい参考写真を用意します。', '写真反映の強さを選びます。', '衣装・画風・セリフを設定します。', 'AI生成後に背景透過とシート分割を行います。'],
      faqQ: '写真はPrompt Makerに保存されますか？',
      faqA: '背景削除ツールの画像処理はブラウザ内で行われます。外部AIサービスへ写真を添付する場合は、そのサービスのデータ方針をご確認ください。'
    },
    zh: {
      title: '照片转表情包 | AI人物与宠物贴纸生成',
      description: '保留人物或宠物照片的识别特征，生成AI表情包提示词，并扩展为15种表情与动作的贴纸套图。',
      keywords: '照片转表情包, 照片转贴纸, AI照片贴纸, 人像表情包, 宠物表情包, 照片卡通化, AI角色生成',
      h1: '用一张照片制作专属AI表情包',
      intro: '以本人、家人、朋友或宠物照片作为身份参考，在保留脸型、发型、毛色等特征的同时制作多表情角色。',
      bullets: ['支持相似度优先、平衡、画风优先', '保留脸部、发型、毛色和代表性服装', '同一角色扩展15种表情和动作', '去背景后可自动分割为独立透明PNG'],
      steps: ['准备清晰的参考照片。', '选择照片特征保留强度。', '设置服装、画风和表情文案。', 'AI生成后继续去背景并分割套图。'],
      faqQ: '照片会保存在Prompt Maker服务器吗？',
      faqA: '背景移除工具在浏览器中处理图片。如将照片上传到外部AI图片服务，请另外查看该服务的数据政策。'
    }
  },
  'sticker-sheet-splitter': {
    target: 'tool',
    ko: {
      title: '이모티콘 시트 자동 분리 | 15개 PNG 일괄 저장',
      description: '한 장에 들어 있는 15개 이모티콘을 자동 감지해 개별 이미지로 분리하고 수정, 360·720·1440px 변환과 ZIP 일괄 저장까지 진행하세요.',
      keywords: '이모티콘 분리, 스티커 시트 분리, 15개 이모티콘 분리, PNG 분리, 이미지 자동 분할, 스티커 분할, ZIP 일괄 저장',
      h1: '15개 이모티콘 시트를 자동으로 개별 분리',
      intro: '고정 격자만 자르는 방식이 아니라 실제 캐릭터·문구 덩어리를 감지해 15개 이모티콘을 각각 분리하고 결과를 개별 수정할 수 있습니다.',
      bullets: ['15개 캐릭터·문구 영역 스마트 감지', '인접 칸의 손·글자·효과가 섞이지 않도록 경계 보정', '분리 결과별 개별 수정 및 PNG 저장', '360·720·1440px 변환 후 ZIP 일괄 저장'],
      steps: ['배경을 먼저 투명하게 제거합니다.', '15개 시트 자동 분리를 실행합니다.', '각 결과를 확인하고 필요한 이미지만 수정합니다.', '원하는 출력 크기를 선택해 개별 또는 ZIP으로 저장합니다.'],
      faqQ: '항상 정확히 15개를 자동 감지하나요?',
      faqA: '배치가 크게 불규칙하거나 캐릭터와 문구가 서로 붙어 있으면 감지가 어려울 수 있습니다. 이 경우 직접 시트 분리를 실행하고 개별 수정 기능으로 보정할 수 있습니다.'
    },
    en: {
      title: 'Sticker Sheet Splitter | Auto-Split 15 Stickers to PNG',
      description: 'Detect and split a 15-sticker sheet into individual images, edit each result, export at 360, 720 or 1440px and download everything as ZIP.',
      keywords: 'sticker sheet splitter, split sticker sheet, auto crop stickers, 15 sticker splitter, PNG splitter, batch sticker export, ZIP sticker download',
      h1: 'Automatically Split a 15-Sticker Sheet',
      intro: 'Instead of blindly cutting a fixed grid, the tool detects actual character and text regions, separates 15 stickers and lets you adjust each result.',
      bullets: ['Smart detection of 15 character and text groups', 'Cell-boundary correction to reduce neighboring sticker leakage', 'Edit and save each split image separately', 'Export at 360, 720 or 1440px and batch-download as ZIP'],
      steps: ['Remove the sheet background first.', 'Run automatic 15-sticker splitting.', 'Review each result and edit only the ones that need adjustment.', 'Choose an output size and save individually or as a ZIP.'],
      faqQ: 'Will it always detect exactly 15 stickers?',
      faqA: 'Very irregular layouts or overlapping characters and text can be harder to detect. You can manually trigger splitting and then fine-tune individual results.'
    },
    ja: {
      title: 'スタンプシート自動分割 | 15個を個別PNG・ZIP保存',
      description: '1枚の15個スタンプシートを自動検出して個別画像に分割し、修正、360・720・1440px変換、ZIP一括保存まで行えます。',
      keywords: 'スタンプ分割, スタンプシート分割, 15個スタンプ, PNG分割, 画像自動分割, LINEスタンプ分割, ZIP一括保存',
      h1: '15個スタンプシートを自動で個別分割',
      intro: '固定グリッドを単純に切るのではなく、キャラクターや文字の領域を検出して15個へ分割し、各結果を個別に調整できます。',
      bullets: ['15個のキャラクター・文字領域をスマート検出', '隣の手・文字・効果が混ざりにくい境界補正', '分割後の個別修正とPNG保存', '360・720・1440px変換とZIP一括保存'],
      steps: ['先に背景を透過します。', '15個スタンプ自動分割を実行します。', '各結果を確認して必要な画像だけ修正します。', '出力サイズを選び個別またはZIPで保存します。'],
      faqQ: '必ず15個を正確に検出できますか？',
      faqA: '配置が大きく崩れていたり、キャラクターと文字が重なっている場合は検出が難しいことがあります。その場合は分割実行後に個別修正で調整できます。'
    },
    zh: {
      title: '表情包套图自动分割 | 15张PNG与ZIP批量导出',
      description: '自动检测一张图中的15个表情并分别裁切，可逐张编辑、导出360/720/1440px PNG并打包ZIP下载。',
      keywords: '表情包分割, 贴纸套图分割, 15张表情分割, PNG分割, 图片自动裁切, 贴纸分割, ZIP批量下载',
      h1: '自动分割15张表情包套图',
      intro: '工具不是简单按固定网格裁切，而是识别角色与文字区域，将15个表情分别分离，并支持逐张调整。',
      bullets: ['智能检测15个角色与文字区域', '通过单元边界减少相邻手部、文字和特效串入', '分割结果可逐张编辑并保存PNG', '支持360/720/1440px输出和ZIP批量下载'],
      steps: ['先将整张图片背景移除。', '执行15张表情自动分割。', '检查结果并只修改需要调整的图片。', '选择输出尺寸后逐张保存或ZIP批量下载。'],
      faqQ: '一定能准确识别15张吗？',
      faqA: '如果布局非常不规则，或角色与文字大面积重叠，识别会更困难。此时可手动执行分割后再逐张调整。'
    }
  },
  'transparent-png-maker': {
    target: 'tool',
    ko: {
      title: '투명 PNG 만들기 | 무료 배경 제거·정밀 누끼',
      description: '이미지 배경을 제거해 투명 PNG로 저장하고, 복잡한 외곽선은 정밀 재처리로 보정하세요. 원본 RGB를 유지해 색상 탁해짐을 줄입니다.',
      keywords: '투명 PNG 만들기, 배경 투명하게, PNG 배경 제거, 정밀 누끼, 이미지 투명 배경, 무료 배경 제거, 알파 채널',
      h1: '배경을 지우고 투명 PNG로 바로 저장',
      intro: '균일한 배경은 빠르게 제거하고 복잡한 배경은 AI 기반 정밀 처리로 분리합니다. 정밀 후처리는 원본 RGB 색상을 유지하고 알파 마스크를 중심으로 다듬도록 설계되어 있습니다.',
      bullets: ['단색 배경 빠른 제거와 복잡한 배경 AI 처리', '정밀 재처리로 머리카락·외곽선 보정', '원본 RGB 유지로 색상 탁해짐 최소화', '체커보드 미리보기와 투명 PNG 저장'],
      steps: ['PNG·JPG·WEBP 이미지를 선택합니다.', '자동 배경 제거 결과를 확인합니다.', '경계가 복잡하면 정밀 재처리를 실행합니다.', '원본과 결과를 비교한 뒤 투명 PNG로 저장합니다.'],
      faqQ: '배경 제거 후 색이 탁해질 수 있나요?',
      faqA: '정밀 처리에서는 원본 RGB 색상을 유지하고 투명도 중심으로 후처리하도록 구성해 불필요한 색 혼합을 줄였습니다.'
    },
    en: {
      title: 'Transparent PNG Maker | Free Background Removal & Precision Cutout',
      description: 'Remove image backgrounds, refine difficult edges and export transparent PNGs while preserving original RGB colors during precision post-processing.',
      keywords: 'transparent PNG maker, make background transparent, PNG background remover, precision background removal, alpha mask, free transparent background',
      h1: 'Remove the Background and Export a Transparent PNG',
      intro: 'Fast removal handles uniform backgrounds while AI precision processing tackles complex scenes. Precision post-processing focuses on alpha while preserving the original RGB colors.',
      bullets: ['Fast solid-background removal plus AI for complex backgrounds', 'Precision reprocessing for hair and difficult edges', 'Original RGB preservation to reduce dull color shifts', 'Checkerboard preview and transparent PNG export'],
      steps: ['Choose a PNG, JPG or WEBP image.', 'Review the automatic background-removal result.', 'Run precision reprocessing for difficult edges.', 'Compare before and after, then save the transparent PNG.'],
      faqQ: 'Can background removal make colors look dull?',
      faqA: 'Precision processing is designed to preserve the original RGB colors and refine transparency separately, reducing unnecessary color blending.'
    },
    ja: {
      title: '透過PNG作成 | 無料背景削除・精密切り抜き',
      description: '画像背景を削除して透過PNGとして保存。複雑な輪郭は精密再処理で整え、元のRGB色を保持して色のくすみを抑えます。',
      keywords: '透過PNG作成, 背景透過, PNG背景削除, 精密切り抜き, 無料背景削除, 透明背景, アルファマスク',
      h1: '背景を削除して透過PNGですぐ保存',
      intro: '単色背景は高速処理し、複雑な背景はAI精密処理を利用します。精密後処理では元画像のRGB色を保持し、主にアルファを整えます。',
      bullets: ['単色背景の高速削除と複雑背景のAI処理', '髪や輪郭を整える精密再処理', '元のRGB保持で色のくすみを軽減', '市松模様プレビューと透過PNG保存'],
      steps: ['PNG・JPG・WEBP画像を選びます。', '自動背景削除の結果を確認します。', '輪郭が難しい場合は精密再処理を行います。', '元画像と比較して透過PNGを保存します。'],
      faqQ: '背景削除後に色がくすむことはありますか？',
      faqA: '精密処理では元のRGB色を保持し、透明度を中心に後処理することで不要な色混合を抑えています。'
    },
    zh: {
      title: '透明PNG制作 | 免费去背景与精细抠图',
      description: '移除图片背景并导出透明PNG，复杂边缘可进行精细再处理，同时保留原始RGB颜色以减少发灰和变暗。',
      keywords: '透明PNG制作, 背景透明, PNG去背景, 精细抠图, 免费去背景, 透明背景, Alpha蒙版',
      h1: '去除背景并直接导出透明PNG',
      intro: '纯色背景可快速处理，复杂背景使用AI精细分离。精细后处理以透明度蒙版为主，并尽量保留原始RGB颜色。',
      bullets: ['纯色背景快速移除与复杂背景AI处理', '针对头发和复杂边缘的精细再处理', '保留原始RGB以减少颜色发灰', '棋盘格透明预览与PNG导出'],
      steps: ['选择PNG、JPG或WEBP图片。', '查看自动去背景结果。', '复杂边缘可运行精细再处理。', '对比原图与结果后保存透明PNG。'],
      faqQ: '去背景后颜色会变灰吗？',
      faqA: '精细处理会尽量保留原始RGB颜色，并将后处理重点放在透明度上，从而减少不必要的颜色混合。'
    }
  },
  'image-upscaler': {
    target: 'tool',
    ko: {
      title: '이모티콘 이미지 업스케일 | 360·720·1440px 고화질 변환',
      description: '분리한 이모티콘 PNG를 360px, 720px(2×), 1440px(4×)로 변환하고 선명도 보정 후 개별 또는 ZIP으로 저장하세요.',
      keywords: '이미지 업스케일, 이모티콘 1440, PNG 확대, 이미지 고화질 변환, 2배 업스케일, 4배 업스케일, 스티커 이미지 확대',
      h1: '이모티콘을 360·720·1440px로 고화질 변환',
      intro: '배경 제거와 시트 분리가 끝난 이미지를 원하는 출력 크기로 변환할 수 있습니다. 720px와 1440px는 확대와 가벼운 선명도 보정을 함께 적용합니다.',
      bullets: ['360px 기본 출력', '720px 2× 고품질 확대', '1440px 4× 고품질 확대', '15개 전체 변환과 ZIP 일괄 저장'],
      steps: ['배경 제거 및 분리 결과를 준비합니다.', '360·720·1440px 중 원하는 크기를 선택합니다.', '필요하면 개별 이미지를 수정합니다.', '개별 PNG 또는 ZIP 일괄 저장을 실행합니다.'],
      faqQ: '업스케일하면 원본에 없던 디테일이 생기나요?',
      faqA: '현재 기능은 크기 확대와 가벼운 선명도 보정을 중심으로 하며, 새로운 세부 묘사를 생성하는 생성형 업스케일과는 다릅니다.'
    },
    en: {
      title: 'Sticker Image Upscaler | Export 360, 720 & 1440px PNG',
      description: 'Resize split sticker PNGs to 360px, 720px (2x) or 1440px (4x), apply light sharpening and save individually or as a ZIP batch.',
      keywords: 'image upscaler, sticker upscaler, upscale PNG, 1440 sticker image, 2x upscale, 4x upscale, batch image resize',
      h1: 'Upscale Stickers to 360, 720 or 1440px',
      intro: 'After background removal and sheet splitting, export each sticker at the size you need. The 720px and 1440px modes combine scaling with light sharpening.',
      bullets: ['360px standard export', '720px 2x high-quality scaling', '1440px 4x high-quality scaling', 'Convert all 15 stickers and batch-download as ZIP'],
      steps: ['Prepare your background-removed and split stickers.', 'Choose 360, 720 or 1440px output.', 'Edit individual images if needed.', 'Save individual PNGs or download the full ZIP.'],
      faqQ: 'Does upscaling invent new image detail?',
      faqA: 'The current feature focuses on resizing and light sharpening rather than generative reconstruction of details that were not present in the source.'
    },
    ja: {
      title: 'スタンプ画像アップスケール | 360・720・1440px高画質変換',
      description: '分割したスタンプPNGを360px、720px（2倍）、1440px（4倍）へ変換し、軽いシャープ処理後に個別またはZIPで保存できます。',
      keywords: '画像アップスケール, スタンプ高画質化, PNG拡大, 1440pxスタンプ, 2倍拡大, 4倍拡大, 画像一括変換',
      h1: 'スタンプを360・720・1440pxへ高画質変換',
      intro: '背景透過とシート分割が終わったスタンプを用途に合わせたサイズへ変換できます。720pxと1440pxでは拡大と軽いシャープ処理を行います。',
      bullets: ['360px標準出力', '720px 2倍高品質拡大', '1440px 4倍高品質拡大', '15個一括変換とZIP保存'],
      steps: ['背景透過・分割済み画像を用意します。', '360・720・1440pxから選びます。', '必要に応じて個別画像を修正します。', '個別PNGまたはZIPで一括保存します。'],
      faqQ: 'アップスケールで新しいディテールが追加されますか？',
      faqA: '現在の機能はサイズ拡大と軽いシャープ処理が中心で、元画像にない細部を生成する生成AI型アップスケールとは異なります。'
    },
    zh: {
      title: '表情包图片放大 | 360·720·1440px高清PNG',
      description: '将分割后的表情PNG转换为360px、720px（2倍）或1440px（4倍），轻度锐化后可逐张或ZIP批量保存。',
      keywords: '图片放大, 表情包高清化, PNG放大, 1440px表情包, 2倍放大, 4倍放大, 批量图片缩放',
      h1: '将表情包转换为360、720或1440px',
      intro: '完成去背景和套图分割后，可按用途选择输出尺寸。720px与1440px模式会进行缩放并配合轻度锐化。',
      bullets: ['360px标准输出', '720px 2倍高质量放大', '1440px 4倍高质量放大', '15张批量转换与ZIP下载'],
      steps: ['准备已去背景并分割的图片。', '选择360、720或1440px。', '需要时逐张调整。', '导出单张PNG或ZIP批量下载。'],
      faqQ: '放大会自动生成新的细节吗？',
      faqA: '当前功能以尺寸放大和轻度锐化为主，并不是生成式重建，因此不会凭空生成原图不存在的细节。'
    }
  }
};

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const pageUrl = (lang, slug) => `${origin}${localeMeta[lang].prefix ? `/${localeMeta[lang].prefix}` : ''}/${slug}/`;

const alternatesFor = (slug) => ({
  ko: pageUrl('ko', slug),
  en: pageUrl('en', slug),
  ja: pageUrl('ja', slug),
  zh: pageUrl('zh', slug),
  default: pageUrl('en', slug)
});

const stripExistingJsonLd = (html) =>
  html.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, '\n');

function replaceMeta(html, regex, replacement, label) {
  if (!regex.test(html)) throw new Error(`Missing ${label}`);
  return html.replace(regex, replacement);
}

function featureBody(slug, lang, data, targetHref) {
  const meta = localeMeta[lang];
  const relatedLinks = Object.entries(featureData)
    .filter(([otherSlug]) => otherSlug !== slug)
    .map(([otherSlug, other]) => `<a href="${pageUrl(lang, otherSlug)}">${escapeHtml(other[lang].h1)}</a>`)
    .join('');

  return `
  <main class="seo-feature-shell">
    <nav class="seo-nav">
      <a class="seo-brand" href="${meta.home}">Prompt Maker</a>
      <a class="seo-home-link" href="${meta.home}">${lang === 'ko' ? '홈' : lang === 'ja' ? 'ホーム' : lang === 'zh' ? '首页' : 'Home'}</a>
    </nav>

    <section class="seo-hero">
      <span class="seo-kicker">Prompt Maker · Free Web Tool</span>
      <h1>${escapeHtml(data.h1)}</h1>
      <p>${escapeHtml(data.intro)}</p>
      <a class="seo-primary-cta" href="${targetHref}">${escapeHtml(featureData[slug].target === 'tool' ? meta.ctaTool : meta.ctaMain)} →</a>
    </section>

    <section class="seo-card">
      <h2>${lang === 'ko' ? '주요 기능' : lang === 'ja' ? '主な機能' : lang === 'zh' ? '主要功能' : 'Key features'}</h2>
      <div class="seo-feature-grid">
        ${data.bullets.map((item, i) => `<div class="seo-mini-card"><span>${String(i + 1).padStart(2, '0')}</span><p>${escapeHtml(item)}</p></div>`).join('')}
      </div>
    </section>

    <section class="seo-card">
      <h2>${lang === 'ko' ? '사용 방법' : lang === 'ja' ? '使い方' : lang === 'zh' ? '使用方法' : 'How to use it'}</h2>
      <ol class="seo-steps">${data.steps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
    </section>

    <section class="seo-card seo-faq">
      <h2>FAQ</h2>
      <h3>${escapeHtml(data.faqQ)}</h3>
      <p>${escapeHtml(data.faqA)}</p>
    </section>

    <section class="seo-related">
      <h2>${escapeHtml(meta.related)}</h2>
      <div>${relatedLinks}</div>
    </section>

    <section class="seo-final-cta">
      <a class="seo-primary-cta" href="${targetHref}">${escapeHtml(featureData[slug].target === 'tool' ? meta.ctaTool : meta.ctaMain)} →</a>
    </section>
  </main>`;
}

function buildFeatureHtml(slug, lang, data) {
  const meta = localeMeta[lang];
  const canonical = pageUrl(lang, slug);
  const alternates = alternatesFor(slug);
  const targetHref = featureData[slug].target === 'tool' ? meta.tool : meta.home;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: data.title,
        description: data.description,
        inLanguage: meta.htmlLang,
        isPartOf: { '@id': `${origin}/#website` }
      },
      {
        '@type': 'SoftwareApplication',
        name: data.h1,
        applicationCategory: featureData[slug].target === 'tool' ? 'UtilitiesApplication' : 'DesignApplication',
        operatingSystem: 'Web',
        isAccessibleForFree: true,
        url: canonical,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'FAQPage',
        mainEntity: [{
          '@type': 'Question',
          name: data.faqQ,
          acceptedAnswer: { '@type': 'Answer', text: data.faqA }
        }]
      }
    ]
  };

  let html = stripExistingJsonLd(source);
  html = replaceMeta(html, /<html lang="[^"]+">/, `<html lang="${meta.htmlLang}">`, 'html lang');
  html = replaceMeta(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(data.title)}</title>`, 'title');
  html = replaceMeta(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeHtml(data.description)}" />`, 'description');
  html = replaceMeta(html, /<meta name="keywords" content="[^"]*" \/>/, `<meta name="keywords" content="${escapeHtml(data.keywords)}" />`, 'keywords');
  html = replaceMeta(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonical}" />`, 'canonical');
  html = replaceMeta(html, /<link rel="alternate" hreflang="ko" href="[^"]*" \/>/, `<link rel="alternate" hreflang="ko" href="${alternates.ko}" />`, 'hreflang ko');
  html = replaceMeta(html, /<link rel="alternate" hreflang="en" href="[^"]*" \/>/, `<link rel="alternate" hreflang="en" href="${alternates.en}" />`, 'hreflang en');
  html = replaceMeta(html, /<link rel="alternate" hreflang="ja" href="[^"]*" \/>/, `<link rel="alternate" hreflang="ja" href="${alternates.ja}" />`, 'hreflang ja');
  html = replaceMeta(html, /<link rel="alternate" hreflang="zh(?:-CN)?" href="[^"]*" \/>/, `<link rel="alternate" hreflang="zh-CN" href="${alternates.zh}" />`, 'hreflang zh');
  html = replaceMeta(html, /<link rel="alternate" hreflang="x-default" href="[^"]*" \/>/, `<link rel="alternate" hreflang="x-default" href="${alternates.default}" />`, 'hreflang default');
  html = replaceMeta(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonical}" />`, 'og:url');
  html = replaceMeta(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeHtml(data.title)}" />`, 'og:title');
  html = replaceMeta(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeHtml(data.description)}" />`, 'og:description');
  html = replaceMeta(html, /<meta property="og:locale" content="[^"]*" \/>/, `<meta property="og:locale" content="${meta.ogLocale}" />`, 'og:locale');
  html = replaceMeta(html, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapeHtml(data.title)}" />`, 'twitter:title');
  html = replaceMeta(html, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${escapeHtml(data.description)}" />`, 'twitter:description');

  html = html.replace(/<script type="module"[^>]*src="\/assets\/[^"]+"[^>]*><\/script>/g, '');
  html = html.replace(/<link rel="modulepreload"[^>]*>/g, '');
  html = html.replace(
    '</head>',
    `<style>
      :root{font-family:Arial,"Noto Sans KR","Noto Sans",sans-serif;color:#2f2a24;background:#fffaf0}
      body{margin:0;background:linear-gradient(180deg,#fff9e9 0,#fffdf8 55%,#fff 100%);color:#2f2a24}
      *{box-sizing:border-box}.seo-feature-shell{max-width:920px;margin:0 auto;padding:18px 18px 70px}
      .seo-nav{display:flex;justify-content:space-between;align-items:center;padding:14px 0 28px}
      .seo-brand{font-size:24px;font-weight:900;color:#6b4300;text-decoration:none}.seo-home-link{color:#755f43;text-decoration:none;font-weight:700}
      .seo-hero{padding:50px 36px;border:1px solid #f1d58b;border-radius:28px;background:rgba(255,255,255,.82);box-shadow:0 18px 50px rgba(92,62,20,.08);text-align:center}
      .seo-kicker{display:inline-block;padding:7px 12px;border-radius:999px;background:#fff1bd;color:#7d5710;font-size:13px;font-weight:800}
      .seo-hero h1{font-size:clamp(32px,6vw,58px);line-height:1.08;margin:20px 0 18px;letter-spacing:-.04em}
      .seo-hero p{max-width:720px;margin:0 auto 28px;font-size:18px;line-height:1.75;color:#655b50}
      .seo-primary-cta{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:0 22px;border-radius:15px;background:#fff0b8;border:1px solid #e8c45c;color:#684310;text-decoration:none;font-weight:900;box-shadow:0 8px 20px rgba(140,95,20,.12)}
      .seo-card{margin-top:24px;padding:28px;border:1px solid #eee4d3;border-radius:22px;background:#fff}.seo-card h2,.seo-related h2{margin:0 0 18px;font-size:24px}
      .seo-feature-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.seo-mini-card{display:flex;gap:12px;padding:18px;border-radius:16px;background:#fffaf0;border:1px solid #f1e4c8}
      .seo-mini-card span{font-weight:900;color:#b28320}.seo-mini-card p{margin:0;line-height:1.55;color:#5f5549}
      .seo-steps{margin:0;padding-left:24px}.seo-steps li{padding:9px 0;line-height:1.6;color:#5f5549}
      .seo-faq h3{margin:0 0 10px;font-size:18px}.seo-faq p{margin:0;line-height:1.7;color:#5f5549}
      .seo-related{margin-top:28px;padding:24px 0}.seo-related div{display:flex;flex-wrap:wrap;gap:10px}.seo-related a{padding:10px 13px;border-radius:12px;background:#fff;border:1px solid #e8dcc8;color:#695a47;text-decoration:none;font-weight:700}
      .seo-final-cta{text-align:center;padding:18px 0 0}
      @media(max-width:640px){.seo-feature-shell{padding:12px 14px 50px}.seo-hero{padding:34px 20px;border-radius:22px}.seo-hero p{font-size:16px}.seo-card{padding:22px 18px}.seo-feature-grid{grid-template-columns:1fr}.seo-primary-cta{width:100%}}
    </style>
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
    </head>`
  );

  const body = featureBody(slug, lang, data, targetHref);
  html = html.replace(/<div id="root"><\/div>/, `<div id="root">${body}</div>`);
  return html;
}

for (const [slug, localized] of Object.entries(featureData)) {
  for (const lang of Object.keys(localeMeta)) {
    const data = localized[lang];
    const prefix = localeMeta[lang].prefix;
    const outDir = path.join(distDir, ...(prefix ? [prefix] : []), slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), buildFeatureHtml(slug, lang, data), 'utf8');
  }
}

if (fs.existsSync(sitemapPath)) {
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  if (!sitemap.includes('/ai-sticker-maker/')) {
    const entries = Object.keys(featureData).map((slug) => {
      const alts = alternatesFor(slug);
      return Object.keys(localeMeta).map((lang) => {
        const loc = pageUrl(lang, slug);
        return `  <url>
    <loc>${loc}</loc>
    <lastmod>2026-08-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="ko" href="${alts.ko}" />
    <xhtml:link rel="alternate" hreflang="en" href="${alts.en}" />
    <xhtml:link rel="alternate" hreflang="ja" href="${alts.ja}" />
    <xhtml:link rel="alternate" hreflang="zh-CN" href="${alts.zh}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${alts.default}" />
  </url>`;
      }).join('\n');
    }).join('\n');

    sitemap = sitemap.replace('</urlset>', `${entries}\n</urlset>`);
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
  }
}

console.log(`Feature SEO pages generated: ${Object.keys(featureData).length * Object.keys(localeMeta).length} localized pages`);
