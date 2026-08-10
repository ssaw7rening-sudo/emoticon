import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const newInfoSectionCode = `const InfoSection = ({ t, lang }) => {
  const [activeTab, setActiveTab] = useState('model');

  const getText = (key, customDict = {}) => {
    if (customDict[lang]) return customDict[lang];
    if (customDict['en']) return customDict['en'];
    return customDict['ko'] || '';
  };

  return (
    <div id="guide-section" className="scroll-mt-24 flex flex-col gap-4">
      {/* 탭 헤더 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-container-lowest p-3 sm:p-4 rounded-md border border-outline-variant shadow-bubbly">
        <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 shrink-0">
          <span>❓</span> {t.guideHeader}
        </h2>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-mint-soft p-1.5 rounded-md border border-mint-border shadow-xs w-full lg:w-auto flex-nowrap shrink-0">
          <button
            onClick={() => setActiveTab('model')}
            className={\`interactive-control whitespace-nowrap flex-none px-3.5 py-1.5 text-[13px] sm:text-[14px] font-bold rounded-md \${activeTab === 'model' ? 'bg-mint text-mint-strong shadow-xs border border-mint-border' : 'text-mint-strong hover:bg-mint-hover'}\`}
          >
            🤖 ChatGPT vs Gemini
          </button>
          <button
            onClick={() => setActiveTab('bg')}
            className={\`interactive-control whitespace-nowrap flex-none px-3.5 py-1.5 text-[13px] sm:text-[14px] font-bold rounded-md \${activeTab === 'bg' ? 'bg-mint text-mint-strong shadow-xs border border-mint-border' : 'text-mint-strong hover:bg-mint-hover'}\`}
          >
            ✂️ {lang === 'ko' ? '배경 (누끼) 지우는 법' : lang === 'ja' ? '背景（透過）の消し方' : lang === 'zh' ? '抠图 (透明背景)' : 'Remove Background'}
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={\`interactive-control whitespace-nowrap flex-none px-3.5 py-1.5 text-[13px] sm:text-[14px] font-bold rounded-md \${activeTab === 'usage' ? 'bg-mint text-mint-strong shadow-xs border border-mint-border' : 'text-mint-strong hover:bg-mint-hover'}\`}
          >
            💬 {lang === 'ko' ? '이모티콘 등록·사용법' : lang === 'ja' ? 'スタンプの登録・使用方法' : lang === 'zh' ? '表情包使用指南' : 'How to Use Emoticons'}
          </button>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="bg-surface-container-lowest rounded-md p-3.5 sm:p-md shadow-bubbly border border-outline-variant">
        <div className="min-h-[250px]">
        {activeTab === 'model' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-4 mt-2">
            <p className="text-[15px] font-bold text-on-surface px-2">
              {getText('modelSub', {
                ko: '각 AI 모델의 강력한 장점이 다르므로 목적에 맞게 골라 쓰세요!',
                ja: 'AIモデルごとに得意分野が異なります。目的に合わせて選んでください！',
                zh: '各AI模型的强项有所不同，请根据您的需求选择！',
                en: 'Choose the right AI model for your specific needs!',
              })}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ChatGPT Card */}
              <div className="bg-surface-variant/30 p-4 sm:p-5 rounded-md border border-outline-variant flex flex-col gap-4 hover:shadow-md transition-shadow group relative">
                <div className="font-bold text-[16px] text-on-surface group-hover:text-primary-strong transition-colors">
                  🟢 {getText('gptTitle', {
                    ko: 'ChatGPT 이미지 생성 추천',
                    ja: 'ChatGPT 画像生成のおすすめ',
                    zh: 'ChatGPT 图像生成推荐',
                    en: 'ChatGPT Image Generation',
                  })}
                </div>
                <div className="font-black text-[18px] text-primary-strong -mt-3">
                  {getText('gptSub', {
                    ko: '"대사가 꼭 필요한 이모티콘"',
                    ja: '"セリフ・文字入れ가 必須のスタンプ"',
                    zh: '"包含文字台词的表情包"',
                    en: '"Emoticons with essential text"',
                  })}
                </div>
                
                <div className="w-full h-56 rounded-md bg-white border border-outline-variant shadow-sm relative overflow-hidden group">
                  <img src="/chatgpt_real.jpg" alt="ChatGPT Actual Result" className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-1 rounded-md">
                    {getText('actualBadge', {
                      ko: '실제 유저 생성본 ✨',
                      ja: '実際のユーザー作成例 ✨',
                      zh: '真实用户生成范例 ✨',
                      en: 'Actual user creation ✨',
                    })}
                  </div>
                </div>

                <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-2 mt-2 break-keep">
                  {lang === 'ko' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">특징:</strong> 한글 타이포그래피(글씨 쓰기) 능력이 압도적으로 뛰어납니다.</li>
                      <li>• 💬 <strong className="text-on-surface">예시:</strong> 캐릭터가 "고마워!" 라고 외치는 말풍선 텍스트가 시트에 꼭 들어가야 할 때 필수입니다.</li>
                      <li>• 🎨 <strong className="text-on-surface">화풍:</strong> 부드럽고 몽글몽글한 3D 렌더링, 파스텔톤 수채화 느낌을 내는 데 아주 강합니다.</li>
                    </>
                  )}
                  {lang === 'ja' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">特徴:</strong> 文字や台詞の描画能力が圧倒的に優れています。</li>
                      <li>• 💬 <strong className="text-on-surface">例:</strong> 「ありがとう！」などの文字が入った吹き出し付きスタンプを作りたい時に最適です。</li>
                      <li>• 🎨 <strong className="text-on-surface">画風:</strong> 柔らかい3Dレンダリングやパステル調の水彩画スタイルが得意です。</li>
                    </>
                  )}
                  {lang === 'zh' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">特点:</strong> 文字与台词排版能力极其优秀。</li>
                      <li>• 💬 <strong className="text-on-surface">示例:</strong> 当表情包必须包含“谢谢！”等气泡文字台词时是首选。</li>
                      <li>• 🎨 <strong className="text-on-surface">画风:</strong> 擅长柔和立体3D渲染和马卡龙/水彩粉彩画风。</li>
                    </>
                  )}
                  {lang !== 'ko' && lang !== 'ja' && lang !== 'zh' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">Feature:</strong> Unmatched Korean typography and text rendering.</li>
                      <li>• 💬 <strong className="text-on-surface">Usage:</strong> Essential when speech bubbles or text like "Thanks!" must be included.</li>
                      <li>• 🎨 <strong className="text-on-surface">Style:</strong> Very strong at soft 3D rendering and pastel watercolor styles.</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Gemini Card */}
              <div className="bg-surface-variant/30 p-4 sm:p-5 rounded-md border border-outline-variant flex flex-col gap-4 hover:shadow-md transition-shadow group relative">
                <div className="font-bold text-[16px] text-on-surface group-hover:text-primary-strong transition-colors">
                  🔵 {getText('geminiTitle', {
                    ko: 'Gemini 이미지 생성 추천',
                    ja: 'Gemini 画像生成のおすすめ',
                    zh: 'Gemini 图像生成推荐',
                    en: 'Gemini Image Generation',
                  })}
                </div>
                <div className="font-black text-[18px] text-primary-strong -mt-3">
                  {getText('geminiSub', {
                    ko: '"표정과 행동으로 말하는 이모티콘"',
                    ja: '"表情やポーズで表現するスタンプ"',
                    zh: '"用表情和肢体动作表达的表情包"',
                    en: '"Emoticons speaking through expressions"',
                  })}
                </div>
                
                <div className="w-full h-56 rounded-md bg-white border border-outline-variant shadow-sm relative overflow-hidden group">
                  <img src="/gemini_real.png" alt="Gemini Actual Result" className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-1 rounded-md">
                    {getText('actualBadge', {
                      ko: '실제 유저 생성본 ✨',
                      ja: '実際のユーザー作成例 ✨',
                      zh: '真实用户生成范例 ✨',
                      en: 'Actual user creation ✨',
                    })}
                  </div>
                </div>

                <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-2 mt-2 break-keep">
                  {lang === 'ko' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">특징:</strong> 채택한 기준 이미지를 다시 첨부해 한 장씩 변형할 때 캐릭터 특징을 안정적으로 이어가기 좋습니다.</li>
                      <li>• 💬 <strong className="text-on-surface">예시:</strong> 기준 캐릭터를 먼저 만든 뒤, 글씨 없이 표정과 몸짓 중심의 개별 이미지를 만들 때 활용하기 좋습니다.</li>
                      <li>• 🎨 <strong className="text-on-surface">권장:</strong> 15컷 시트는 구도 초안으로 사용하고 최종 이미지는 15종 개별 분할에서 생성하세요.</li>
                    </>
                  )}
                  {lang === 'ja' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">特徴:</strong> ベース画像を再添付して1枚ずつ変形する際、キャラの特徴を安定して維持できます。</li>
                      <li>• 💬 <strong className="text-on-surface">例:</strong> ベースキャラを先に作成し、文字なしで表情やポーズ中心の個別画像を作るのに最適です。</li>
                      <li>• 🎨 <strong className="text-on-surface">推奨:</strong> 15コマシートは下書きとして使い、最終画像は個別分割で生成してください。</li>
                    </>
                  )}
                  {lang === 'zh' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">特点:</strong> 将满意的基准角色图重新附带并逐张生成变体时，能稳定保持角色特征的一致性。</li>
                      <li>• 💬 <strong className="text-on-surface">示例:</strong> 先生成基准角色，再制作无文字、专注于丰富表情与动作的单张表情包。</li>
                      <li>• 🎨 <strong className="text-on-surface">建议:</strong> 15格图作为构图草稿，最终成品在15种单张分割中生成。</li>
                    </>
                  )}
                  {lang !== 'ko' && lang !== 'ja' && lang !== 'zh' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">Feature:</strong> Works best when an accepted base image is attached again for one-at-a-time variations.</li>
                      <li>• 💬 <strong className="text-on-surface">Usage:</strong> Create the base character first, then generate individual expression- and action-focused images.</li>
                      <li>• 🎨 <strong className="text-on-surface">Recommended:</strong> Use the 15-panel sheet as a draft and Batch Split for final assets.</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Unified Tip Box */}
            <div className="bg-primary/10 text-primary-strong p-3.5 sm:p-4 rounded-md border border-primary/20 mt-2 flex gap-3 items-start shadow-sm">
              <span className="text-[20px] drop-shadow-sm leading-none mt-0.5">📸</span>
              <div>
                <strong className="font-bold block mb-1 text-[15px]">
                  {getText('tipTitle', {
                    ko: '공용 활용 꿀팁!',
                    ja: '共通活用テクニック！',
                    zh: '通用实用技巧！',
                    en: 'Pro Tip!',
                  })}
                </strong>
                <span className="text-[14px] leading-relaxed opacity-90 break-keep block">
                  {getText('tipContent', {
                    ko: '사진을 첨부하면 인물이나 반려동물의 특징을 반영한 캐릭터를 만들 수 있습니다. ChatGPT는 문구가 필요한 이미지에 활용하고, Gemini는 마음에 드는 기준 캐릭터를 만든 뒤 그 이미지를 다시 첨부해 한 장씩 변형해 보세요.',
                    ja: '写真を添付すると人物やペットの特徴を反映したキャラが作れます。文字が必要な場合はChatGPTを使い、Geminiでは気に入ったベースキャラを作成後、その画像を再添付して1枚ずつバリエーションを生成するのがおすすめです。',
                    zh: '附带照片可为您、孩子或宠物量身定制角色。包含台词时建议使用ChatGPT；使用Gemini时可先生成满意的基准角色，再重新附带该图片逐张生成表情变体。',
                    en: 'Attach a photo to reflect recognizable features. Use ChatGPT when text matters, and with Gemini create a base character first, then attach that accepted result again for one-at-a-time variations.',
                  })}
                </span>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'bg' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col gap-5 mb-6">
              <p className="text-[16px] font-black text-on-surface px-2 tracking-tight">
                {getText('bgSub', {
                  ko: '가장 쉽고 빠르게 이모티콘 배경을 투명하게(누끼) 만드는 방법을 소개합니다!',
                  ja: 'スタンプの背景を簡単に透明化（透過）するおすすめの方法をご紹介します！',
                  zh: '为您介绍最简单快捷的表情包透明背景（抠图）制作方法！',
                  en: 'How to easily and quickly remove backgrounds from your emoticons!',
                })}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PC Guide */}
                <div className="bg-[#FAF9F6] p-4 sm:p-5 rounded-md border border-[#E5E0D8] flex flex-col gap-4">
                  <div className="flex items-center gap-2 font-bold text-[#5C3A21] text-[16px] ml-2">
                    <span className="text-[18px]">💻</span>
                    {getText('pcTitle', {
                      ko: 'PC에서 작업할 때',
                      ja: 'PCで作業する場合',
                      zh: '在电脑 (PC) 上操作',
                      en: 'Working on PC',
                    })}
                  </div>
                  <div className="flex flex-col gap-3 h-full">
                    <div className="bg-white p-4 sm:p-5 rounded-md md:rounded-md border border-[#E5E0D8] shadow-sm flex-1 flex flex-col">
                      <strong className="text-on-surface block mb-2 text-[15px]">
                        {getText('m1Title', {
                          ko: '방법 1: remove.bg 웹사이트',
                          ja: '方法 1: remove.bg ウェブサイト',
                          zh: '方法 1: remove.bg 网站',
                          en: 'Method 1: remove.bg website',
                        })}
                      </strong>
                      <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-1.5 break-keep list-decimal pl-4 mb-3">
                        {lang === 'ko' && (
                          <>
                            <li>인터넷 창을 열고 <strong>remove.bg</strong> 사이트에 접속합니다.</li>
                            <li>AI로 만든 이미지를 화면에 <strong>드래그 앤 드롭</strong> 합니다.</li>
                            <li>약 3초 뒤, AI가 자동으로 배경을 투명하게 날려줍니다.</li>
                            <li>결과물을 확인하고 파란색 <strong>[다운로드]</strong> 버튼을 누릅니다.</li>
                            <li>PC에 투명한 배경의 PNG 캐릭터가 따로 저장됩니다!</li>
                          </>
                        )}
                        {lang === 'ja' && (
                          <>
                            <li>ブラウザを開き、<strong>remove.bg</strong> サイトにアクセスします。</li>
                            <li>AIで作成した画像を画面に<strong>ドラッグ＆ドロップ</strong>します。</li>
                            <li>約3秒でAIが自動的に背景を透明化します。</li>
                            <li>結果を確認し、青い <strong>[ダウンロード]</strong> ボタンを押します。</li>
                            <li>PCに透明背景のPNGキャラクターが保存されます！</li>
                          </>
                        )}
                        {lang === 'zh' && (
                          <>
                            <li>打开浏览器并访问 <strong>remove.bg</strong> 网站。</li>
                            <li>将AI生成的表情包图片<strong>拖拽</strong>到网页中。</li>
                            <li>约3秒后，AI会自动完成透明抠图。</li>
                            <li>确认效果后点击蓝色的 <strong>[下载]</strong> 按钮。</li>
                            <li>电脑上即刻保存透明背景的PNG角色图片！</li>
                          </>
                        )}
                        {lang !== 'ko' && lang !== 'ja' && lang !== 'zh' && (
                          <>
                            <li>Open a browser and visit <strong>remove.bg</strong>.</li>
                            <li><strong>Drag and drop</strong> your AI image onto the screen.</li>
                            <li>After 3 seconds, AI removes the background automatically.</li>
                            <li>Check the result and click the blue <strong>[Download]</strong> button.</li>
                            <li>A transparent PNG is saved on your PC!</li>
                          </>
                        )}
                      </ul>
                      <a href="https://www.remove.bg/" target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 hover:underline font-bold text-[14px] transition-colors inline-flex items-center gap-1 mt-auto">
                        <span>👉</span> {getText('goRemoveBg', { ko: 'remove.bg 바로가기', ja: 'remove.bg へ移動', zh: '前往 remove.bg', en: 'Go to remove.bg' })}
                      </a>
                    </div>
                    <div className="bg-white p-4 sm:p-5 rounded-md md:rounded-md border border-[#E5E0D8] shadow-sm flex-1 flex flex-col">
                      <strong className="text-on-surface block mb-2 text-[15px]">
                        {getText('m2Title', {
                          ko: '방법 2: 이미지 편집 프로그램',
                          ja: '方法 2: 画像編集ソフト',
                          zh: '方法 2: 图片编辑工具',
                          en: 'Method 2: Image Editor Program',
                        })}
                      </strong>
                      <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-1.5 break-keep list-decimal pl-4 mb-3">
                        {lang === 'ko' && (
                          <>
                            <li>무료 이미지 뷰어 <strong>알씨(ALSee)</strong>를 설치하고 엽니다.</li>
                            <li>알씨에서 다운로드 받은 이모티콘 이미지를 엽니다.</li>
                            <li>상단 메뉴에서 <strong>"이미지 편집 ➔ AI 배경 제거"</strong>를 누릅니다.</li>
                            <li>AI가 잠시 분석한 뒤, 배경을 아주 깔끔하게 지워줍니다.</li>
                            <li><strong>[저장]</strong> 버튼을 눌러 PNG 형식으로 저장하면 끝입니다!</li>
                          </>
                        )}
                        {lang === 'ja' && (
                          <>
                            <li>無料の画像編集ソフトまたはペイントツールを開きます。</li>
                            <li>ダウンロードしたスタンプ画像を開きます。</li>
                            <li>メニューから<strong>「背景自動消去」</strong>を選択します。</li>
                            <li>AIが背景を綺麗に削除します。</li>
                            <li><strong>[保存]</strong> を押してPNG形式で保存すれば完了です！</li>
                          </>
                        )}
                        {lang === 'zh' && (
                          <>
                            <li>打开常用免费图片编辑软件。</li>
                            <li>在软件中打开下载好的表情包图片。</li>
                            <li>点击菜单中的 <strong>“AI背景消除”</strong>。</li>
                            <li>AI自动精准识别并清除背景。</li>
                            <li>点击 <strong>[保存]</strong> 为PNG格式即可！</li>
                          </>
                        )}
                        {lang !== 'ko' && lang !== 'ja' && lang !== 'zh' && (
                          <>
                            <li>Install and open an image editor program.</li>
                            <li>Open the downloaded emoticon image.</li>
                            <li>Click <strong>"Image Edit ➔ AI Background Removal"</strong> in the menu.</li>
                            <li>AI analyzes and cleanly removes the background.</li>
                            <li>Click <strong>[Save]</strong> to save as a transparent PNG!</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Mobile Guide */}
                <div className="bg-[#FAF9F6] p-4 sm:p-5 rounded-md border border-[#E5E0D8] flex flex-col gap-4">
                  <div className="flex items-center gap-2 font-bold text-[#5C3A21] text-[16px] ml-2">
                    <span className="text-[18px]">📱</span>
                    {getText('mobileTitle', {
                      ko: '스마트폰에서 작업할 때',
                      ja: 'スマホで作業する場合',
                      zh: '在智能手机上操作',
                      en: 'Working on Smartphone',
                    })}
                  </div>
                  <div className="flex flex-col gap-3 h-full">
                    <div className="bg-white p-4 sm:p-5 rounded-md md:rounded-md border border-[#E5E0D8] shadow-sm flex-1 flex flex-col">
                      <strong className="text-on-surface block mb-2 text-[15px] flex items-center gap-1.5"><span className="text-[16px]">🤖</span> Galaxy</strong>
                      <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-1.5 break-keep list-decimal pl-4">
                        {lang === 'ko' && (
                          <>
                            <li>AI로 만든 이미지를 <strong>기본 갤러리 앱</strong>에서 엽니다.</li>
                            <li>원하는 캐릭터를 손가락으로 <strong>1초 이상 꾹~ 누릅니다.</strong></li>
                            <li>캐릭터 주변만 반짝거리며 배경과 분리됩니다.</li>
                            <li>이때 손을 떼면 나타나는 팝업 메뉴에서 <strong>"이미지로 저장"</strong>을 누릅니다.</li>
                            <li>갤러리에 투명한 배경의 캐릭터가 새롭게 저장됩니다!</li>
                          </>
                        )}
                        {lang === 'ja' && (
                          <>
                            <li>AIで作成した画像を<strong>標準ギャラリーアプリ</strong>で開きます。</li>
                            <li>対象のキャラクターを指で<strong>1秒以上長押し</strong>します。</li>
                            <li>キャラの周りが光り、背景から分離されます。</li>
                            <li>「<strong>画像として保存</strong>」をタップします。</li>
                            <li>ギャラリーに透過PNGとして新しく保存されます！</li>
                          </>
                        )}
                        {lang === 'zh' && (
                          <>
                            <li>在系统自带<strong>相册APP</strong>中打开AI生成的图片。</li>
                            <li>用手指<strong>长按</strong>想要提取的角色1秒以上。</li>
                            <li>主体角色边缘高亮并与背景分离。</li>
                            <li>松开手指在弹出的菜单中点击“<strong>保存为图片</strong>”。</li>
                            <li>相册中即刻生成一张透明背景的PNG文件！</li>
                          </>
                        )}
                        {lang !== 'ko' && lang !== 'ja' && lang !== 'zh' && (
                          <>
                            <li>Open the AI image in the <strong>default Gallery app</strong>.</li>
                            <li><strong>Long press</strong> the character for at least 1 second.</li>
                            <li>The subject separates from the background.</li>
                            <li>Release and tap <strong>"Save as image"</strong> from the popup.</li>
                            <li>A transparent PNG is saved in your gallery!</li>
                          </>
                        )}
                      </ul>
                    </div>
                    <div className="bg-white p-4 sm:p-5 rounded-md md:rounded-md border border-[#E5E0D8] shadow-sm flex-1 flex flex-col">
                      <strong className="text-on-surface block mb-2 text-[15px] flex items-center gap-1.5"><span className="text-[16px]">🍎</span> iPhone</strong>
                      <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-1.5 break-keep list-decimal pl-4">
                        {lang === 'ko' && (
                          <>
                            <li>AI로 만든 이미지를 <strong>기본 사진 앱</strong>에서 엽니다.</li>
                            <li>원하는 캐릭터를 손가락으로 <strong>1초 이상 꾹~ 누릅니다.</strong></li>
                            <li>빛이 한 바퀴 돌면서 피사체가 배경과 분리됩니다.</li>
                            <li>손을 떼고 나타나는 메뉴에서 <strong>"공유" ➔ "이미지 저장"</strong>을 누릅니다.</li>
                            <li>사진첩에 배경이 투명한 PNG 파일로 깔끔하게 저장됩니다!</li>
                          </>
                        )}
                        {lang === 'ja' && (
                          <>
                            <li>AI画像を<strong>標準の写真アプリ</strong>で開きます。</li>
                            <li>キャラクターを指で<strong>1秒以上長押し</strong>します。</li>
                            <li>光が走り、対象が背景から切り抜かれます。</li>
                            <li>「<strong>共有</strong>」➔「<strong>画像を保存</strong>」をタップします。</li>
                            <li>写真アプリに透明PNGとして保存されます！</li>
                          </>
                        )}
                        {lang === 'zh' && (
                          <>
                            <li>在系统自带“<strong>照片</strong>”APP中打开AI生成的图片。</li>
                            <li>用手指<strong>长按</strong>目标角色1秒以上。</li>
                            <li>主体四周闪烁光芒并完成自动抠图。</li>
                            <li>松手并在出现的菜单中选择“<strong>分享</strong>”➔“<strong>保存图像</strong>”。</li>
                            <li>相册中即自动存入干净的透明PNG文件！</li>
                          </>
                        )}
                        {lang !== 'ko' && lang !== 'ja' && lang !== 'zh' && (
                          <>
                            <li>Open the AI image in the <strong>Photos app</strong>.</li>
                            <li><strong>Long press</strong> the character for at least 1 second.</li>
                            <li>The subject highlights and separates from the background.</li>
                            <li>Release and tap <strong>"Share" ➔ "Save Image"</strong>.</li>
                            <li>A transparent PNG is saved in your photos!</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Visual Tutorial for Background Removal */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 bg-[#F4F4F4] p-8 rounded-md border border-[#E5E5E5]">
              
              {/* Step 1 */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-28 h-28 rounded-md bg-[#00FF00] flex items-center justify-center border-4 border-dashed border-primary shadow-sm relative overflow-hidden group hover:scale-105 transition-transform">
                  <span className="text-[56px] relative z-10 drop-shadow-md">🐱</span>
                </div>
                <span className="text-[13px] font-bold text-secondary-strong">
                  {getText('step1Text', {
                    ko: '1. 연두색 배경 AI 이미지',
                    ja: '1. 黄緑色背景のAI画像',
                    zh: '1. 绿色背景AI生成图',
                    en: '1. Green BG AI Image',
                  })}
                </span>
              </div>

              {/* Arrow */}
              <div className="text-primary-strong hidden md:block">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
              <div className="text-primary-strong md:hidden rotate-90 my-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-28 h-28 rounded-md bg-white flex flex-col items-center justify-center border-2 border-outline-variant shadow-bubbly relative group hover:scale-105 transition-transform">
                  <div className="absolute -top-3 -right-3 bg-error text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md animate-bounce">{lang === 'ko' ? 'AI 툴' : 'AI Tool'}</div>
                  <span className="font-black text-[16px] text-primary-strong">remove.bg</span>
                  <span className="text-[12px] text-secondary-strong font-bold mt-1">or Mobile APP</span>
                </div>
                <span className="text-[13px] font-bold text-secondary-strong">
                  {getText('step2Text', {
                    ko: '2. 클릭 한 번으로 누끼!',
                    ja: '2. ワンクリックで透過！',
                    zh: '2. 一键轻松抠图！',
                    en: '2. 1-Click Removal!',
                  })}
                </span>
              </div>

              {/* Arrow */}
              <div className="text-primary-strong hidden md:block">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
              <div className="text-primary-strong md:hidden rotate-90 my-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-28 h-28 rounded-md flex items-center justify-center border-2 border-outline-variant shadow-sm relative group hover:scale-105 transition-transform" style={{ backgroundImage: 'conic-gradient(#e5e7eb 25%, white 25%, white 50%, #e5e7eb 50%, #e5e7eb 75%, white 75%, white)', backgroundSize: '16px 16px' }}>
                  <span className="text-[64px] drop-shadow-xl z-10">🐱</span>
                </div>
                <span className="text-[13px] font-bold text-secondary-strong">
                  {getText('step3Text', {
                    ko: '3. 완벽한 투명 PNG 완성',
                    ja: '3. 完璧な透明PNGの完成',
                    zh: '3. 完美生成透明PNG',
                    en: '3. Perfect Transparent PNG',
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col gap-5 mb-6">
              <p className="text-[16px] font-black text-on-surface px-2 tracking-tight">
                {getText('usageSub', {
                  ko: '만드신 이미지를 실제 카카오톡에서 사용하는 두 가지 방법을 소개합니다!',
                  ja: '作成した画像を実際のメッセンジャー（LINE・KakaoTalk等）で使う2つの方法をご紹介します！',
                  zh: '为您介绍将生成的图片用于微信/QQ/Line/KakaoTalk的两种使用方式！',
                  en: 'Two ways to actually use your created images in KakaoTalk!',
                })}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Method 1: Official */}
                <div className="bg-[#FAF9F6] p-4 sm:p-5 rounded-md border border-[#E5E0D8] flex flex-col gap-4">
                  <div className="flex items-center gap-2 font-bold text-[#5C3A21] text-[16px] ml-2">
                    <span className="text-[18px]">💰</span>
                    {getText('officialTitle', {
                      ko: '1. 정식 출시 및 판매를 원할 때',
                      ja: '1. 公式スタンプとして販売・出品したい場合',
                      zh: '1. 作为官方表情包上架与销售',
                      en: '1. Official Release and Sale',
                    })}
                  </div>
                  <div className="bg-white p-4 sm:p-5 rounded-md md:rounded-md border border-[#E5E0D8] shadow-sm flex-1 flex flex-col gap-3">
                    <strong className="text-on-surface block text-[15px]">
                      {getText('studioTitle', {
                        ko: '카카오 이모티콘 스튜디오 제안',
                        ja: 'クリエイターズマーケットへの申請',
                        zh: '开放平台/创作平台提交',
                        en: 'Kakao Emoticon Studio Submission',
                      })}
                    </strong>
                    
                    {/* AI Policy Warning Box */}
                    <div className="bg-[#FFF5F5] text-[#D32F2F] p-3.5 sm:p-4 rounded-md border border-[#FFCDD2] my-1">
                      <div className="mb-2">
                        <span className="inline-flex items-center gap-1 bg-[#D32F2F] text-white text-[12px] font-bold px-2 py-0.5 rounded-md mb-1.5">
                          <span className="text-[12px] leading-none">⚠️</span>
                          {getText('warnBadge', { ko: '주의', ja: 'ご注意', zh: '注意事项', en: 'Warning' })}
                        </span>
                        <strong className="block text-[15px] font-black tracking-tight">
                          {getText('warnTitle', {
                            ko: 'AI 이미지는 그대로 등록 불가!',
                            ja: 'AI画像のそのままの申請は不可！',
                            zh: 'AI生成原图不可直接提交！',
                            en: 'Cannot Submit AI Images As-Is!',
                          })}
                        </strong>
                      </div>
                      <p className="text-[13px] leading-[1.6] break-keep opacity-90">
                        {lang === 'ko' && (
                          <>
                            현재 카카오 정책상 저작권 문제로 인해 <strong>AI가 생성한 이미지를 '그대로' 제출하는 것은 엄격히 금지</strong>되어 있습니다.<br/>
                            AI는 기발한 대사와 포즈를 뽑는 <strong>최고의 '참고용 시안'</strong>으로 활용하시고, 정식 제출은 그 시안을 바탕으로 <strong>직접 선을 따서 다시 그려서(리디자인)</strong> 제출하셔야 합니다.
                          </>
                        )}
                        {lang === 'ja' && (
                          <>
                            現在の各プラットフォームのポリシー上、<strong>AI生成画像を「そのまま」提出することは禁止</strong>されています。<br/>
                            AIは構図やポーズを得る<strong>「下書きデザイン」</strong>として活用し、申請時はそれを元に<strong>自分でトレース・描き直して（リデザイン）</strong>ご提出ください。
                          </>
                        )}
                        {lang === 'zh' && (
                          <>
                            根据目前各大平台规定，<strong>禁止直接提交未经修改的AI原图</strong>。<br/>
                            请将AI作为获取台词与姿势的<strong>“优质设计草稿”</strong>，正式提交时需根据草稿由人工<strong>重新描线绘制 (重新设计)</strong> 后提交。
                          </>
                        )}
                        {lang !== 'ko' && lang !== 'ja' && lang !== 'zh' && (
                          <>
                            Due to copyright policy, <strong>submitting AI-generated images "as-is" is strictly prohibited.</strong><br/>
                            Use AI as an excellent <strong>"reference draft"</strong>, and for official submission, you must <strong>trace and redraw (redesign) them yourself</strong>.
                          </>
                        )}
                      </p>
                    </div>

                    <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-2 break-keep list-disc pl-5 mb-2">
                      {lang === 'ko' && (
                        <>
                          <li><strong>이미지 준비:</strong> '직접 리디자인한' 360x360px 투명 배경 PNG 이미지 32종 준비</li>
                          <li><strong>제안하기:</strong> 스튜디오 사이트에 접속하여 준비한 이미지를 업로드</li>
                          <li><strong>심사 대기:</strong> 내부 심사 통과 시 정식 상품으로 출시되어 수익 창출 가능!</li>
                        </>
                      )}
                      {lang === 'ja' && (
                        <>
                          <li><strong>画像準備:</strong> 「自分で描き直した」透明背景PNGを用意</li>
                          <li><strong>申請:</strong> クリエイターズサイトにアクセスして画像をアップロード</li>
                          <li><strong>審査待ち:</strong> 審査通過後、公式スタンプとして販売され収益化が可能！</li>
                        </>
                      )}
                      {lang === 'zh' && (
                        <>
                          <li><strong>准备图片:</strong> 准备好“人工重新绘制”的透明背景PNG格式图片</li>
                          <li><strong>提交审核:</strong> 登录开放平台/创作平台上传准备好的表情包</li>
                          <li><strong>等待审核:</strong> 审核通过后即可成为官方表情包并获得收益！</li>
                        </>
                      )}
                      {lang !== 'ko' && lang !== 'ja' && lang !== 'zh' && (
                        <>
                          <li><strong>Prepare Images:</strong> Prepare 32 'redrawn' transparent PNG images.</li>
                          <li><strong>Submit:</strong> Upload your prepared images to the Studio website.</li>
                          <li><strong>Wait for Review:</strong> If approved, it becomes an official product!</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Method 2: Personal */}
                <div className="bg-[#FAF9F6] p-4 sm:p-5 rounded-md border border-[#E5E0D8] flex flex-col gap-4">
                  <div className="flex items-center gap-2 font-bold text-[#5C3A21] text-[16px] ml-2">
                    <span className="text-[18px]">✨</span>
                    {getText('personalTitle', {
                      ko: '2. 지인들과 가볍게 무료로 쓸 때',
                      ja: '2. 友達とチャットで無料・気軽に使う場合',
                      zh: '2. 与亲友免费在聊天中随心使用',
                      en: '2. Casual Free Use with Friends',
                    })}
                  </div>
                  <div className="bg-white p-4 sm:p-5 rounded-md md:rounded-md border border-[#E5E0D8] shadow-sm flex-1 flex flex-col gap-3">
                    <strong className="text-on-surface block mb-1 text-[15px]">
                      {getText('chatTrickTitle', {
                        ko: '개인 소장용 (채팅방 활용법)',
                        ja: '個人使用（トーク画面での活用法）',
                        zh: '个人收藏 (聊天界面使用技巧)',
                        en: 'Personal Use (Chatroom Trick)',
                      })}
                    </strong>
                    
                    {/* Visual Example Image */}
                    <div className="w-full h-40 rounded-md overflow-hidden border border-[#E5E0D8] my-1 shadow-sm relative group">
                      <img src="/chat_trick.jpg" alt="채팅방 전송 예시" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[#5C3A21] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <span>📸</span> {getText('exBadge', { ko: '전송 예시', ja: '送信例', zh: '发送示例', en: 'Example' })}
                      </div>
                    </div>

                    <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-2 break-keep list-decimal pl-5">
                      {lang === 'ko' && (
                        <>
                          <li>위의 [배경(누끼) 제거] 가이드에 따라 <strong>투명 배경으로 만든 PNG 파일</strong>을 스마트폰 갤러리에 저장합니다.</li>
                          <li>카카오톡 채팅방에서 입력창 옆의 <strong>[+] 버튼 ➔ [앨범]</strong>을 누릅니다.</li>
                          <li>갤러리에서 투명하게 만든 캐릭터 이미지를 선택하여 전송합니다.</li>
                        </>
                      )}
                      {lang === 'ja' && (
                        <>
                          <li>上の [背景の消し方] ガイドに従い、<strong>透過背景にしたPNGファイル</strong>をスマホのアルバムに保存します。</li>
                          <li>トーク画面の入力欄横の <strong>[+] ボタン ➔ [写真/アルバム]</strong> をタップします。</li>
                          <li>アルバムから透明背景のキャラ画像を選択して送信します。</li>
                        </>
                      )}
                      {lang === 'zh' && (
                        <>
                          <li>根据上方抠图指南，将<strong>透明背景PNG图片</strong>保存至手机相册。</li>
                          <li>在聊天界面点击输入框旁边的 <strong>[+] 按钮 ➔ [相册/图片]</strong>。</li>
                          <li>选择相册中透明背景的角色图片直接发送。</li>
                        </>
                      )}
                      {lang !== 'ko' && lang !== 'ja' && lang !== 'zh' && (
                        <>
                          <li>Save the <strong>transparent background PNG file</strong> to your smartphone gallery using the background removal guide above.</li>
                          <li>In a chatroom, tap the <strong>[+] button ➔ [Album]</strong> next to the input field.</li>
                          <li>Select and send the transparent character image from your gallery.</li>
                        </>
                      )}
                    </ul>
                    <div className="mt-auto bg-primary/10 text-primary-strong font-bold text-[13px] p-3 rounded-md flex items-start gap-2 leading-relaxed">
                      <span className="text-[16px] leading-none mt-0.5">💡</span>
                      {getText('chatTip', {
                        ko: '배경이 투명하기 때문에 하얀색 네모 테두리가 보이지 않아, 진짜로 구매한 스티커처럼 대화창에 아주 깔끔하게 올라갑니다!',
                        ja: '背景が透明なので白い枠が表示されず、まるで本物のスタンプのようにチャット画面にとても綺麗に送信されます！',
                        zh: '由于背景透明无白边，发在聊天界面效果非常干净自然，就像购买的官方表情包一样！',
                        en: 'Because the background is transparent, the white rectangular border is invisible, making it look exactly like a real purchased sticker in the chat window!',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};`;

const startMarker = 'const InfoSection = ({ t, lang }) => {';
const endMarker = 'function App() {';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  content = content.slice(0, startIdx) + newInfoSectionCode + '\n\n' + content.slice(endIdx);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Safely updated InfoSection while preserving function App()!');
} else {
  console.error('Could not find startMarker or endMarker');
}
