import { defineConfig } from 'vite'
import baseConfig from './vite.pixel-owner-split.config.js'

function socialShareTabs() {
  return {
    name: 'social-share-tabs-instagram-v1',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/App.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      const replaceOnce = (from, to, label) => {
        if (!transformed.includes(from)) {
          throw new Error(`[social-share] ${label} anchor was not found`)
        }
        transformed = transformed.replace(from, to)
      }

      replaceOnce(
        "<span className=\"bg-[#EEF0F3] text-[#30343B] border border-[#C9CDD3] text-[11px] font-black px-1.5 py-0.5 rounded flex items-center justify-center leading-none\">𝕏</span>",
        "<span className=\"bg-[#F4F1FA] text-[#5D4B7C] border border-[#D7CEE8] text-[10px] font-black px-1.5 py-0.5 rounded flex items-center justify-center leading-none\">SNS</span>",
        'section icon'
      )

      const copyReplacements = [
        ["'트위터(X) SNS 홍보·자랑 캡션'", "'SNS 공유·홍보 캡션'"],
        ["'X (Twitter) SNS共有・紹介キャプション'", "'SNS共有・紹介キャプション'"],
        ["'X (Twitter) 社交媒体宣传文案'", "'社交媒体分享·宣传文案'"],
        ["'Twitter (X) Share Caption'", "'Social Share Caption'"],
        ["'원클릭 복사 & 바로 트윗'", "'SNS용 캡션 바로 복사'"],
        ["'ワンクリックコピー＆投稿'", "'SNS用キャプションをコピー'"],
        ["'一键复制并直接发推'", "'一键复制社交平台文案'"],
        ["'1-Click Copy & Tweet'", "'Copy-ready for X & Instagram'"],
        ["'AI에서 생성한 완성 이미지를 저장한 뒤, SNS에 올릴 때 바로 붙여넣어 사용할 수 있는 사이트 링크 & 홍보 캡션 & 해시태그입니다. (트윗 창에서 저장한 사진을 첨부해 주세요!)'", "'AI에서 생성한 완성 이미지를 저장한 뒤 X나 Instagram에 바로 붙여넣어 사용할 수 있는 홍보 캡션과 해시태그입니다. 저장한 이미지를 게시물에 함께 첨부해 주세요.'"],
        ["'AIで生成した完成画像を保存後、SNSに投稿する際にそのまま使える紹介文、サイトリンク、ハッシュタグです。(ツイート画面で保存した画像を添付してください！)'", "'AIで生成した画像を保存したあと、XやInstagramにそのまま使える紹介文とハッシュタグをコピーできます。保存した画像を投稿に添付してください。'"],
        ["'保存AI生成的图片后，在社交平台上发布时可直接粘贴使用的文案、网站链接和热门标签。(发帖时请附带保存好的图片！)'", "'保存AI生成的图片后，可直接复制适用于X或Instagram的宣传文案与热门标签。发布时请同时附上保存好的图片。'"],
        ["'Engaging, copy-ready caption, site link, and trending hashtags to showcase your generated sticker sheet on social media (X, Instagram, etc.). Attach your saved image in the tweet composer!'", "'Copy-ready captions and hashtags tailored for X and Instagram. Attach your saved sticker image when you publish.'"]
      ]

      for (const [from, to] of copyReplacements) {
        if (!transformed.includes(from)) {
          throw new Error(`[social-share] Copy anchor was not found: ${from}`)
        }
        transformed = transformed.replace(from, to)
      }

      const shareAnchor = "  const shareOnTwitter = (mode = lang) => {"
      if (!transformed.includes(shareAnchor)) {
        throw new Error('[social-share] shareOnTwitter anchor was not found')
      }

      const instagramFunction = `  const copyInstagramCaption = (mode = lang) => {
    const captions = {
      ko: \`AI로 만든 나만의 이모티콘 15종 완성 ✨\\
표정부터 포즈, 말풍선까지 한 장에 담아봤어요.\\
마음에 드는 컷은 투명 PNG로 분리해서 바로 활용할 수 있어요 💛\\
\\
프로필 링크에서 나만의 이모티콘 프롬프트를 만들어보세요.\\
https://emoticonpromptmaker.com/\\
\\
#AI이모티콘 #이모티콘만들기 #AI캐릭터 #캐릭터디자인 #스티커 #카톡이모티콘 #라인스티커 #AI아트 #프롬프트 #PromptMaker #StickerDesign #DigitalArt\`,
      en: \`My 15-piece AI sticker set is done ✨\\
Expressions, poses, captions, and transparent PNG-ready artwork — all in one sheet.\\
Create your own sticker prompt from the link below.\\
\\
https://emoticonpromptmaker.com/\\
\\
#AISticker #StickerDesign #AIArt #CharacterDesign #DigitalArt #Emoticon #CustomSticker #PromptMaker #CreativeAI #StickerSheet\`,
      ja: \`AIで作った15種類のオリジナルスタンプが完成しました ✨\\
表情・ポーズ・メッセージまで1枚にまとめて、透過PNGとして分割して使えます。\\
自分だけのスタンプ用プロンプトはプロフィールのリンクから。\\
\\
https://emoticonpromptmaker.com/\\
\\
#AIスタンプ #スタンプ作り #AIイラスト #キャラクターデザイン #デジタルアート #オリジナルスタンプ #PromptMaker #StickerDesign\`,
      zh: \`我的15张AI表情贴纸完成啦 ✨\\
表情、动作、文案一次生成，还可以拆分为透明PNG继续使用。\\
通过下面的链接制作属于自己的表情包提示词。\\
\\
https://emoticonpromptmaker.com/\\
\\
#AI表情包 #AI贴纸 #角色设计 #数字艺术 #原创贴纸 #AI绘画 #PromptMaker #StickerDesign\`
    };
    const text = captions[mode] || captions.en;
    navigator.clipboard.writeText(text);
    setCopiedType(\`instagram_\${mode}\`);
    setTimeout(() => setCopiedType(null), 2500);
  };

`

      transformed = transformed.replace(shareAnchor, instagramFunction + shareAnchor)

      replaceOnce(
        'className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1"',
        'className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1"',
        'social button grid'
      )

      const twitterButtonAnchor = `              <button
                type="button"
                onClick={() => shareOnTwitter(lang)}`

      if (!transformed.includes(twitterButtonAnchor)) {
        throw new Error('[social-share] Twitter button anchor was not found')
      }

      const instagramButton = `              <button
                type="button"
                onClick={() => copyInstagramCaption(lang)}
                className="interactive-control min-h-[38px] rounded-md border-2 border-[#D9CBEA] bg-[#FAF7FF] hover:bg-[#F4EEFF] text-[#624D82] font-extrabold text-[12.5px] sm:text-[13px] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <span className="text-[15px] font-black">◎</span>
                <span>{copiedType === \`instagram_\${lang}\`
                  ? (lang === 'ko' ? '✓ Instagram 캡션 복사됨!' : lang === 'ja' ? '✓ Instagram用コピー完了！' : lang === 'zh' ? '✓ Instagram文案已复制！' : '✓ Instagram Caption Copied!')
                  : (lang === 'ko' ? 'Instagram 캡션 복사' : lang === 'ja' ? 'Instagram用キャプション' : lang === 'zh' ? '复制Instagram文案' : 'Copy Instagram Caption')}</span>
              </button>
`

      transformed = transformed.replace(twitterButtonAnchor, instagramButton + twitterButtonAnchor)

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), socialShareTabs()],
})
