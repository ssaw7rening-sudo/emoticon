import React from 'react';

export default function PartnershipModal({ lang, onClose, onInquire }) {
  return (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onClose}
        >
          <div 
            className="bg-white rounded-2xl max-w-xl w-full border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#FAF9F6] px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[20px]">📢</span>
                <h3 className="font-extrabold text-[16px] sm:text-[17px] text-slate-900">
                  {lang === 'ko' 
                    ? '광고 배너 게재 및 제휴 안내' 
                    : lang === 'ja' 
                    ? '広告バナー掲載・提携のご案内' 
                    : lang === 'zh' 
                    ? '广告横幅投放与合作指南' 
                    : 'Advertising Banners & Partnerships'}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-[18px] border border-slate-200 transition-colors cursor-pointer"
                title={lang === 'ko' ? '닫기' : 'Close'}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-4 text-left">
              {/* Service Context Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-700 bg-slate-200/80 px-2.5 py-0.5 rounded-full self-start">
                  {lang === 'ko' ? '안내' : 'Information'}
                </span>
                <p className="text-[13px] sm:text-[13.5px] text-slate-700 leading-relaxed font-normal break-keep">
                  {lang === 'ko'
                    ? '프롬프트 메이커는 사용자가 캐릭터 이모티콘을 생성하는 웹 도구입니다. 굿즈 제작 플랫폼, 판촉물 및 인쇄 제작 업체, 디자인 도구 등 관련 서비스의 사이트 내 배너 광고 게재 및 제휴 문의를 받고 있습니다.'
                    : lang === 'ja'
                    ? '当サービスは、ユーザーがオリジナルキャラクターやスタンプを作成するWebツールです。グッズ制作サービスや印刷・ノベルティ業者様のバナー広告掲載・提携のお問い合わせを受け付けております。'
                    : lang === 'zh'
                    ? '本站为用户提供原创角色及表情包生成服务。现面向周边定制平台、印刷及礼品供应商承接横幅广告投放与商务合作咨询。'
                    : 'Prompt Maker is a web utility for creating character stickers. We welcome advertising banners and partnerships from custom merch platforms, print shops, and promotional product manufacturers.'}
                </p>
              </div>

              {/* Advertising Options */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[13px] font-extrabold text-slate-800 flex items-center gap-1.5">
                  <span>📌</span>
                  <span>{lang === 'ko' ? '광고 및 제휴 분야' : lang === 'ja' ? '広告・提携メニュー' : lang === 'zh' ? '广告位与合作形式' : 'Advertising & Partnership Areas'}</span>
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] sm:text-[12.5px] text-slate-700 font-semibold">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-start gap-2">
                    <span className="text-[16px] shrink-0">🖼️</span>
                    <div>
                      <strong className="block text-slate-900">{lang === 'ko' ? '사이트 배너 광고' : 'Website Banners'}</strong>
                      <span className="text-[11.5px] text-slate-500 font-normal">{lang === 'ko' ? '메인 화면 및 생성 결과 영역 배너 게재' : 'Banner placement on main & result screens'}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-start gap-2">
                    <span className="text-[16px] shrink-0">🎁</span>
                    <div>
                      <strong className="block text-slate-900">{lang === 'ko' ? '굿즈·인쇄 업체 연계' : 'Merch & Print Links'}</strong>
                      <span className="text-[11.5px] text-slate-500 font-normal">{lang === 'ko' ? '실물 굿즈(키링, 스티커, 티셔츠 등) 제작사 링크' : 'Links for custom keyrings, stickers, apparel, etc.'}</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-start gap-2">
                    <span className="text-[16px] shrink-0">🏢</span>
                    <div>
                      <strong className="block text-slate-900">{lang === 'ko' ? '기업 판촉물 안내' : 'Corporate Promotional Merch'}</strong>
                      <span className="text-[11.5px] text-slate-500 font-normal">{lang === 'ko' ? '기업 판촉물 및 홍보물 인쇄 제작 안내' : 'Promotional printing & corporate mascot campaigns'}</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-start gap-2">
                    <span className="text-[16px] shrink-0">💡</span>
                    <div>
                      <strong className="block text-slate-900">{lang === 'ko' ? '기타 파트너십' : 'Other Partnerships'}</strong>
                      <span className="text-[11.5px] text-slate-500 font-normal">{lang === 'ko' ? '브랜드 협업 및 서비스 연계 제휴' : 'Brand collaborations and marketing integrations'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inquiry Notice */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[12px] text-slate-600 leading-relaxed">
                {lang === 'ko' 
                  ? '💡 구글 폼으로 원하시는 배너 형태, 희망 기간, 업체 정보를 남겨주시면 확인 후 이메일로 상세 안내를 회신해 드립니다.' 
                  : lang === 'ja' 
                  ? '💡 フォームよりご希望の広告掲載期間や媒体情報をご記入いただければ、確認後メールにてご連絡いたします。' 
                  : lang === 'zh' 
                  ? '💡 请在表单中留下您的广告需求与联系方式，我们将在收到信息后通过邮件与您联系。' 
                  : '💡 Please submit your desired ad slots, duration, and business details via Google Forms. We will reply via email.'}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-[13px] transition-colors cursor-pointer"
              >
                {lang === 'ko' ? '닫기' : 'Close'}
              </button>
              <a
                href="https://forms.gle/Q2oG84fL4B9g2Jda7"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onInquire}
                className="px-5 py-2 rounded-lg bg-[#C2410C] hover:bg-[#9A3412] text-white font-extrabold text-[13px] flex items-center gap-1.5 shadow-sm transition-[color,background-color,border-color,box-shadow,opacity,transform,filter] cursor-pointer"
              >
                <span>{lang === 'ko' ? '광고 및 제휴 문의하기' : lang === 'ja' ? 'お問い合わせフォームへ' : lang === 'zh' ? '前往填写咨询表单' : 'Inquire via Form'}</span>
                <span className="text-[11px]">↗</span>
              </a>
            </div>
          </div>
        </div>
  );
}
