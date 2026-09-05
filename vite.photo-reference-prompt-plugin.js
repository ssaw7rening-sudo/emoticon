const APP_SUFFIX = '/src/App.jsx'

export function photoReferencePromptStructure() {
  return {
    name: 'photo-reference-prompt-structure',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(APP_SUFFIX)) return null

      let out = code.replace(/\r\n/g, '\n')

      const generalReferenceText = "만약 이 프롬프트와 함께 이미지가 첨부되었다면, 첨부 이미지의 주요 특징을 캐릭터 디자인에 반영해주세요."
      if (!out.includes(generalReferenceText)) {
        throw new Error('[photo-reference-prompt] general character conditional reference instruction not found')
      }

      const modeAnchor = '    const modeInstructions = {'
      if (!out.includes(modeAnchor)) {
        throw new Error('[photo-reference-prompt] photo mode instruction anchor not found')
      }

      const noticeMarker = '    const photoRequiredNotice = {'
      if (!out.includes(noticeMarker)) {
        const noticeBlock = `    const photoRequiredNotice = {\n      ko: \`이 모드는 참고 사진이 함께 첨부된 경우에만 사용하세요.\n참고 사진이 없다면 이 사진참고 지침을 적용하지 말고 일반 캐릭터 모드 기준으로 생성하세요.\`,\n      en: \`Use this photo-reference mode only when a reference photo is attached with the prompt.\nIf no reference photo is attached, do not apply these photo-reference instructions; generate using the general character-mode instructions instead.\`,\n    };\n\n`
        out = out.replace(modeAnchor, `${noticeBlock}${modeAnchor}`)
      }

      const oldReturn = '    return modeInstructions[photoReferenceMode][promptLang];'
      const newReturn = '    return `${photoRequiredNotice[promptLang]}\\n\\n${modeInstructions[photoReferenceMode][promptLang]}`;'
      if (out.includes(oldReturn)) {
        out = out.replace(oldReturn, newReturn)
      } else if (!out.includes(newReturn)) {
        throw new Error('[photo-reference-prompt] photo instruction return statement not found')
      }

      const requiredPhotoModes = [
        '사진 반영 방식: ${getPhotoModeLabel(\'ko\')}',
        'balanced:',
        'likeness:',
        'style:',
      ]
      for (const marker of requiredPhotoModes) {
        if (!out.includes(marker)) {
          throw new Error(`[photo-reference-prompt] required marker missing: ${marker}`)
        }
      }

      if (!out.includes('참고 사진이 없다면 이 사진참고 지침을 적용하지 말고 일반 캐릭터 모드 기준으로 생성하세요.')) {
        throw new Error('[photo-reference-prompt] Korean photo-required notice was not injected')
      }

      return { code: out, map: null }
    },
  }
}
