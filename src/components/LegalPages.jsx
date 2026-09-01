import React from 'react';

const PrivacyPage = ({ lang, onBack }) => {
  return (
    <div className="min-h-screen bg-[#FFFDF8] text-slate-800 pb-16 font-sans">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E0D8] px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="interactive-control flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#FFF8E7] hover:bg-[#FFECA1] text-[#7A4F00] font-bold text-[13.5px] border border-[#FFECA1] transition-[color,background-color,border-color,box-shadow,opacity,transform,filter] cursor-pointer"
          >
            ← {lang === 'ko' ? '메인으로 돌아가기' : lang === 'ja' ? 'メインに戻る' : lang === 'zh' ? '返回主页' : 'Back to Home'}
          </button>
          <span className="text-[14px] font-black text-slate-800 tracking-tight">
            프롬프트 메이커 (Prompt Maker)
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="bg-white rounded-xl p-6 sm:p-10 border border-slate-200/90 shadow-sm flex flex-col gap-6">
          <div className="border-b border-slate-200 pb-5">
            <h1 className="text-[24px] sm:text-[28px] font-black text-slate-900 tracking-tight">
              {lang === 'ko' ? '개인정보처리방침' : lang === 'ja' ? 'プライバシーポリシー' : lang === 'zh' ? '隐私政策' : 'Privacy Policy'}
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              최종 수정일: 2025년 1월 1일 | 시행일자: 2025년 1월 1일
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-[14px] sm:text-[15px] leading-relaxed text-slate-700 space-y-6">
            <section>
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">1. 총칙</h2>
              <p>
                '프롬프트 메이커'(이하 '서비스')는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 및 글로벌 개인정보 보호 규정을 준수하고 있습니다. 본 방침은 이용자가 서비스를 이용할 때 어떠한 정보가 이용되며 개인정보 보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">2. 수집하는 개인정보의 항목 및 수집 방법</h2>
              <p>서비스는 회원가입 없이 누구나 무료로 이용할 수 있는 공개 웹 유틸리티 도구로서, 이름, 전화번호, 주민등록번호 등의 민감한 개인식별정보를 직접 수집하거나 서버에 저장하지 않습니다.</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>자동 수집 로그 정보:</strong> 서비스 이용 과정에서 접속 IP, 브라우저 종류, OS, 방문 일시, 서비스 이용 통계 등의 비식별 로그 정보가 자동 생성되어 수집될 수 있습니다.</li>
                <li><strong>로컬 브라우징 설정:</strong> 사용자가 선택한 다국어(한국어, 영어, 일본어, 중국어) 설정 및 모드 옵션은 사용자의 웹 브라우저 로컬 저장소(LocalStorage)에만 저장되며 서버로 전송되지 않습니다.</li>
                <li><strong>사용자 입력 프롬프트 및 사진:</strong> 사용자가 입력하는 텍스트나 첨부하는 사진 파일은 브라우저 메모리 상에서만 일시적으로 조합되며 서비스 서버에 저장되지 않습니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">3. 구글 애드센스(Google AdSense) 및 제3자 쿠키(Cookie) 운영</h2>
              <p>
                서비스는 사이트 운영 및 무료 서비스 품질 유지를 위해 제3자 광고 사업자인 **Google Inc.(구글 애드센스)**의 광고 서비스를 이용하고 있습니다.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Google을 포함한 제3자 공급업체는 쿠키(Cookie)를 사용하여 이용자가 본 서비스 또는 다른 웹사이트를 과거에 방문한 기록을 바탕으로 광고를 게재합니다.</li>
                <li>Google의 광고 쿠키 사용으로 인해 Google 및 파트너 네트워크는 이용자가 사이트를 방문한 정보를 기반으로 맞춤형 광고를 제공할 수 있습니다.</li>
                <li><strong>쿠키 설정 거부 및 맞춤 광고 해제:</strong> 이용자는 언제든지 맞춤형 광고 설정을 해제할 수 있습니다. <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline font-bold">Google 광고 설정 페이지</a>에 방문하거나, <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline font-bold">www.aboutads.info</a>를 통해 제3자 공급업체의 맞춤형 광고 쿠키 사용을 차단할 수 있습니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">4. 개인정보의 보유 및 파기</h2>
              <p>
                서비스는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 웹로그 분석 도구를 통해 수집된 비식별 통계 데이터는 데이터 관리 규정에 따라 안전하게 관리된 후 자동 삭제됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">5. 개인정보 보호책임자 및 문의처</h2>
              <p>서비스의 개인정보 관리, 오류 제보 및 문의 사항은 아래의 온라인 문의 창구를 통해 접수해 주시면 신속하게 검토하여 처리해 드립니다.</p>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[14px] text-slate-700">
                    • <strong>서비스명:</strong> 프롬프트 메이커 (Prompt Maker)<br />
                    • <strong>접수 창구:</strong> 1:1 온라인 고객 피드백 & 문의 폼
                  </p>
                </div>
                <a
                  href="https://forms.gle/Q2oG84fL4B9g2Jda7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="interactive-control inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[13px] rounded-lg transition-[color,background-color,border-color,box-shadow,opacity,transform,filter] shrink-0 cursor-pointer"
                >
                  <span>📝 구글 폼 문의 접수</span>
                  <span>↗</span>
                </a>
              </div>
            </section>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-center">
            <button
              onClick={onBack}
              className="interactive-control px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[14px] shadow-sm transition-[color,background-color,border-color,box-shadow,opacity,transform,filter] cursor-pointer"
            >
              {lang === 'ko' ? '확인 및 메인으로 이동' : 'Confirm and Back to Main'}
            </button>
          </div>
        </div>
      </main>

    </div>
  );
};

const TermsPage = ({ lang, onBack }) => {
  return (
    <div className="min-h-screen bg-[#FFFDF8] text-slate-800 pb-16 font-sans">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E0D8] px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="interactive-control flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#FFF8E7] hover:bg-[#FFECA1] text-[#7A4F00] font-bold text-[13.5px] border border-[#FFECA1] transition-[color,background-color,border-color,box-shadow,opacity,transform,filter] cursor-pointer"
          >
            ← {lang === 'ko' ? '메인으로 돌아가기' : lang === 'ja' ? 'メインに戻る' : lang === 'zh' ? '返回主页' : 'Back to Home'}
          </button>
          <span className="text-[14px] font-black text-slate-800 tracking-tight">
            프롬프트 메이커 (Prompt Maker)
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="bg-white rounded-xl p-6 sm:p-10 border border-slate-200/90 shadow-sm flex flex-col gap-6">
          <div className="border-b border-slate-200 pb-5">
            <h1 className="text-[24px] sm:text-[28px] font-black text-slate-900 tracking-tight">
              {lang === 'ko' ? '서비스 이용약관' : lang === 'ja' ? '利用規約' : lang === 'zh' ? '服务条款' : 'Terms of Service'}
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              최종 수정일: 2025년 1월 1일 | 시행일자: 2025년 1월 1일
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-[14px] sm:text-[15px] leading-relaxed text-slate-700 space-y-6">
            <section>
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">제1조 (목적)</h2>
              <p>
                본 약관은 '프롬프트 메이커'(이하 '서비스')가 제공하는 AI 이모티콘 프롬프트 자동 생성 및 관련 웹 도구 서비스의 이용조건 및 절차, 이용자와 서비스 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">제2조 (서비스의 내용 및 특징)</h2>
              <p>서비스가 제공하는 주요 기능은 다음과 같습니다.</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>ChatGPT(DALL-E 3), Google Gemini(Imagen 3), Grok 등의 생성형 AI 모델에 최적화된 15종 이모티콘 시트 생성 프롬프트 자동 완성 및 원클릭 복사.</li>
                <li>피사체(동물, 조류, 해양생물, 곤충, 파충류, 공룡, 인물 등) 및 화풍, 15종 대화 문구 세트의 조합 도구 제공.</li>
                <li>이모티콘 기획 가이드, 실전 제작 팁 및 플랫폼 제안 관련 정보 콘텐츠 제공.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">제3조 (저작권 및 상업적 이용 면책)</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>프롬프트의 자유 이용:</strong> 본 서비스에서 생성된 프롬프트 텍스트는 이용자가 자유롭게 복사하여 비상업적 또는 상업적 목적으로 활용할 수 있습니다.</li>
                <li><strong>AI 생성 이미지의 권리:</strong> 이용자가 본 프롬프트를 통해 생성한 최종 이미지의 저작권 및 상업적 권리는 이용자가 사용하는 대상 AI 플랫폼(OpenAI, Google, xAI 등)의 이용약관 및 정책을 따릅니다.</li>
                <li><strong>플랫폼 등록 심사:</strong> 카카오 이모티콘 스튜디오, 라인 크리에이터스 마켓 등 외부 플랫폼의 등록 승인 여부는 각 플랫폼의 심사 기준에 따르며, 본 서비스는 등록 승인을 보증하지 않습니다.</li>
                <li><strong>공식 제휴 면책:</strong> 본 서비스는 카카오(Kakao), 라인(LINE), OpenAI, Google 등과 공식적으로 제휴된 서비스가 아닌 독립적인 프롬프트 보조 도구입니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">제4조 (문의처)</h2>
              <p>
                서비스 이용 관련 문의 사항, 제휴 제안 및 건의 사항은 <a href="https://forms.gle/Q2oG84fL4B9g2Jda7" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline font-bold">1:1 온라인 문의 폼(Google Forms)</a>을 통해 접수해 주시기 바랍니다.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-center">
            <button
              onClick={onBack}
              className="interactive-control px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[14px] shadow-sm transition-[color,background-color,border-color,box-shadow,opacity,transform,filter] cursor-pointer"
            >
              {lang === 'ko' ? '확인 및 메인으로 이동' : 'Confirm and Back to Main'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default function LegalPages({ page, lang, onBack }) {
  return page === 'terms'
    ? <TermsPage lang={lang} onBack={onBack} />
    : <PrivacyPage lang={lang} onBack={onBack} />;
}
