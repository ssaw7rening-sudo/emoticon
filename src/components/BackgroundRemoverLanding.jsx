import React from 'react';
import BackgroundRemover from './BackgroundRemover.jsx';

const COPY = {
  ko: {
    brand: '프롬프트 메이커',
    home: '이모티콘 프롬프트 만들기',
    eyebrow: '무료 이미지 도구',
    title: '무료 이미지 배경 제거 · 누끼 따기',
    lead: '사진이나 이미지의 배경을 브라우저에서 바로 제거하고 투명 PNG로 저장하세요. 균일한 단색 배경은 빠르게 처리하고, 복잡한 배경은 AI로 자동 처리합니다.',
    privacy: '이미지는 서버에 업로드하지 않고 사용 중인 기기에서 처리됩니다.',
    feature1: '무료 배경 제거',
    feature1Desc: 'JPG·PNG·WEBP 이미지를 올려 배경을 투명하게 만듭니다.',
    feature2: '투명 PNG 저장',
    feature2Desc: '제거 결과를 원본과 비교한 뒤 투명 PNG로 저장할 수 있습니다.',
    feature3: '이모티콘 후처리',
    feature3Desc: '15개 자동 분리, 360×360 규격화, 개별 수정과 ZIP 저장까지 이어집니다.',
    howTitle: '이미지 배경 제거 사용 방법',
    steps: ['배경이 있는 PNG·JPG·WEBP 이미지를 선택합니다.', '배경 제거하기를 눌러 결과를 확인합니다.', '좌우 비교 슬라이더로 원본과 결과를 비교합니다.', '투명 PNG로 저장하거나 이모티콘 자동 분리를 진행합니다.'],
    faqTitle: '배경 제거 FAQ',
    faq1: '흰색 배경만 제거되나요?',
    faq1a: '아니요. 흰색뿐 아니라 검정, 파랑, 초록 등 균일한 단색 배경도 빠르게 감지해 제거합니다. 복잡한 사진 배경은 AI 방식으로 전환합니다.',
    faq2: '이미지가 서버로 전송되나요?',
    faq2a: '배경 제거 처리는 브라우저에서 진행되며 이미지 파일 자체는 이 사이트의 서버에 업로드하지 않습니다.',
    faq3: '이미 투명한 PNG도 사용할 수 있나요?',
    faq3a: '이미 투명 영역이 있는 PNG는 다시 배경 제거하지 않고 안내합니다. 배경이 있는 원본 이미지를 사용하는 것이 좋습니다.'
  },
  en: {
    brand: 'Prompt Maker', home: 'Create Emoticon Prompts', eyebrow: 'Free Image Tool',
    title: 'Free Image Background Remover',
    lead: 'Remove photo and image backgrounds directly in your browser and save transparent PNG files. Uniform solid backgrounds are handled quickly, while complex scenes use AI.',
    privacy: 'Images are processed on your device and are not uploaded to our server.',
    feature1: 'Free background removal', feature1Desc: 'Upload JPG, PNG, or WEBP images and make the background transparent.',
    feature2: 'Transparent PNG export', feature2Desc: 'Compare before and after, then save the result as a transparent PNG.',
    feature3: 'Emoticon finishing tools', feature3Desc: 'Auto-split 15 stickers, resize to 360×360, fine-tune, and download as ZIP.',
    howTitle: 'How to remove an image background',
    steps: ['Choose a PNG, JPG, or WEBP image with a background.', 'Select Remove Background and wait for the result.', 'Drag the comparison slider to check the original and transparent result.', 'Save as transparent PNG or continue to auto-split emoticons.'],
    faqTitle: 'Background remover FAQ',
    faq1: 'Does it only remove white backgrounds?', faq1a: 'No. Uniform solid backgrounds such as black, blue, green, and other colors are detected quickly. Complex photo backgrounds fall back to AI processing.',
    faq2: 'Is my image uploaded to a server?', faq2a: 'Background removal runs in your browser. The image file itself is not uploaded to this site’s server.',
    faq3: 'Can I upload an already transparent PNG?', faq3a: 'PNG files that already contain transparency are detected and are not processed again. Use the original image with a background instead.'
  },
  ja: {
    brand: 'プロンプトメーカー', home: '絵文字プロンプトを作る', eyebrow: '無料画像ツール',
    title: '無料の画像背景削除・透過PNG作成',
    lead: '写真や画像の背景をブラウザ上で削除し、透過PNGとして保存できます。均一な単色背景は高速処理し、複雑な背景はAIで自動処理します。',
    privacy: '画像はサーバーへアップロードせず、使用中の端末内で処理します。',
    feature1: '無料で背景削除', feature1Desc: 'JPG・PNG・WEBP画像をアップロードして背景を透明にします。',
    feature2: '透過PNG保存', feature2Desc: '元画像と結果を比較してから透過PNGで保存できます。',
    feature3: '絵文字の仕上げ', feature3Desc: '15個の自動分割、360×360変換、微調整、ZIP保存まで利用できます。',
    howTitle: '画像背景削除の使い方',
    steps: ['背景のあるPNG・JPG・WEBP画像を選びます。', '背景を削除するボタンを押します。', '比較スライダーで元画像と結果を確認します。', '透過PNGで保存するか、絵文字の自動分割へ進みます。'],
    faqTitle: '背景削除 FAQ',
    faq1: '白背景だけ削除できますか？', faq1a: 'いいえ。黒・青・緑など均一な単色背景も高速で検出して削除します。複雑な写真背景はAI処理へ切り替わります。',
    faq2: '画像はサーバーへ送信されますか？', faq2a: '背景削除はブラウザ内で処理され、画像ファイル自体はこのサイトのサーバーへアップロードされません。',
    faq3: 'すでに透過済みのPNGも使えますか？', faq3a: 'すでに透明部分があるPNGは再処理せず案内します。背景のある元画像をご利用ください。'
  },
  zh: {
    brand: '提示词生成器', home: '制作表情包提示词', eyebrow: '免费图片工具',
    title: '免费图片背景移除 · 透明PNG制作',
    lead: '直接在浏览器中移除照片或图片背景，并保存为透明PNG。均匀纯色背景会快速处理，复杂背景则自动使用AI。',
    privacy: '图片不会上传到服务器，而是在当前设备中处理。',
    feature1: '免费移除背景', feature1Desc: '上传JPG、PNG或WEBP图片并将背景变透明。',
    feature2: '保存透明PNG', feature2Desc: '对比原图和结果后，可直接保存透明PNG。',
    feature3: '表情包后期处理', feature3Desc: '支持15张自动分割、360×360规格化、单张微调和ZIP批量保存。',
    howTitle: '图片背景移除使用方法',
    steps: ['选择带背景的PNG、JPG或WEBP图片。', '点击移除背景并等待处理完成。', '拖动对比滑块查看原图与透明结果。', '保存透明PNG，或继续进行表情包自动分割。'],
    faqTitle: '背景移除 FAQ',
    faq1: '只能移除白色背景吗？', faq1a: '不是。黑色、蓝色、绿色等均匀纯色背景也可快速识别并移除；复杂照片背景会自动切换到AI处理。',
    faq2: '图片会上传到服务器吗？', faq2a: '背景移除在浏览器中完成，图片文件本身不会上传到本站服务器。',
    faq3: '已经透明的PNG还能处理吗？', faq3a: '系统会检测已有透明区域的PNG并避免重复处理。建议使用带背景的原始图片。'
  }
};

const PATHS = {
  ko: '/background-remover/',
  en: '/en/background-remover/',
  ja: '/ja/background-remover/',
  zh: '/zh/background-remover/'
};

const HOME_PATHS = { ko: '/', en: '/en/', ja: '/ja/', zh: '/zh/' };

export default function BackgroundRemoverLanding({ lang = 'ko' }) {
  const t = COPY[lang] || COPY.ko;

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#35312C]">
      <header className="sticky top-0 z-30 border-b border-[#E8E1D8] bg-white/95 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <a href={HOME_PATHS[lang] || '/'} className="font-extrabold tracking-tight text-[#3D3933]">{t.brand}</a>
          <div className="flex items-center gap-1.5">
            {Object.entries(PATHS).map(([code, href]) => (
              <a key={code} href={href} aria-current={code === lang ? 'page' : undefined} className={`rounded-lg px-2 py-1.5 text-[11px] font-extrabold ${code === lang ? 'bg-[#3E6B4B] text-white' : 'bg-[#F4F1EB] text-[#665F56]'}`}>
                {code === 'ko' ? '한국어' : code === 'en' ? 'EN' : code === 'ja' ? '日本語' : '中文'}
              </a>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-14 pt-8 sm:px-6 sm:pt-12">
        <section className="mx-auto max-w-3xl text-center">
          <div className="inline-flex rounded-full bg-[#EEF5EA] px-3 py-1 text-xs font-extrabold text-[#4E6748]">✨ {t.eyebrow}</div>
          <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-[#2F2B27] sm:text-4xl">{t.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-7 text-[#6D665E] sm:text-base">{t.lead}</p>
          <p className="mx-auto mt-3 max-w-2xl text-xs font-bold leading-5 text-[#4F6B4A]">🔒 {t.privacy}</p>
        </section>

        <section className="mt-7 grid gap-2.5 sm:grid-cols-3">
          {[[t.feature1, t.feature1Desc], [t.feature2, t.feature2Desc], [t.feature3, t.feature3Desc]].map(([title, desc]) => (
            <div key={title} className="rounded-2xl border border-[#E8E1D8] bg-white p-4 shadow-sm">
              <h2 className="text-sm font-extrabold text-[#403B35]">{title}</h2>
              <p className="mt-1.5 text-xs font-medium leading-5 text-[#746D64]">{desc}</p>
            </div>
          ))}
        </section>

        <BackgroundRemover lang={lang} />

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#E8E1D8] bg-white p-5 sm:p-6">
            <h2 className="text-lg font-black text-[#37322D]">{t.howTitle}</h2>
            <ol className="mt-4 space-y-3">
              {t.steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm font-medium leading-6 text-[#655E56]"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEF5EA] text-xs font-black text-[#4E6748]">{index + 1}</span><span>{step}</span></li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-[#E8E1D8] bg-white p-5 sm:p-6">
            <h2 className="text-lg font-black text-[#37322D]">{t.faqTitle}</h2>
            <div className="mt-4 space-y-4">
              {[[t.faq1, t.faq1a], [t.faq2, t.faq2a], [t.faq3, t.faq3a]].map(([q, a]) => (
                <div key={q}><h3 className="text-sm font-extrabold text-[#49433D]">{q}</h3><p className="mt-1 text-xs font-medium leading-5 text-[#746D64]">{a}</p></div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-8 text-center">
          <a href={HOME_PATHS[lang] || '/'} className="inline-flex rounded-xl border border-[#D7D0C6] bg-white px-4 py-2.5 text-sm font-extrabold text-[#5C554D] shadow-sm">← {t.home}</a>
        </div>
      </main>
    </div>
  );
}
