import { defineConfig } from 'vite'
import baseConfig from './vite.transparent-split.config.js'

function addThirdPartyNoticesToTerms() {
  return {
    name: 'add-third-party-notices-to-terms',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/components/LegalPages.jsx')) return null

      let transformed = code.replace(/\r\n/g, '\n')

      const oldDate = '최종 수정일: 2025년 1월 1일 | 시행일자: 2025년 1월 1일'
      const newDate = '최종 수정일: 2026년 8월 31일 | 시행일자: 2025년 1월 1일'
      if (transformed.includes(oldDate)) {
        transformed = transformed.split(oldDate).join(newDate)
      }

      const inquirySection = `<section>
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">제4조 (문의처)</h2>`

      if (!transformed.includes(inquirySection)) {
        throw new Error('[legal-notices] Terms inquiry section was not found')
      }

      const openSourceSection = `<section>
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">제4조 (제3자 오픈소스 소프트웨어)</h2>
              <div className="space-y-2">
                <p>본 서비스는 기능 제공을 위해 제3자 오픈소스 소프트웨어 및 공개 모델을 사용할 수 있으며, 각 구성요소는 해당 라이선스 조건에 따라 이용됩니다.</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>BEN2 / BEN2-ONNX:</strong> Prama LLC의 BEN2 및 이를 기반으로 제공되는 ONNX 모델은 MIT License 조건에 따라 이용됩니다.</li>
                  <li><strong>Transformers.js (@huggingface/transformers):</strong> Hugging Face의 Transformers.js는 Apache License 2.0 조건에 따라 이용됩니다.</li>
                  <li>각 프로젝트명과 상표의 권리는 해당 권리자에게 있으며, 본 서비스에서의 사용은 공식 제휴·후원 또는 보증을 의미하지 않습니다.</li>
                </ul>
                <p className="text-[13px] text-slate-500">
                  관련 저작권 고지와 라이선스 원문은 <a href="/third-party-licenses.txt" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline font-bold">제3자 라이선스 고지</a>에서 확인할 수 있습니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">제5조 (문의처)</h2>`

      transformed = transformed.split(inquirySection).join(openSourceSection)
      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), addThirdPartyNoticesToTerms()],
})
