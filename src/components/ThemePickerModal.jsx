import React from 'react';

export default function ThemePickerModal({
  t,
  lang,
  themeKeys,
  themePickerViewportHeight,
  themeSearch,
  setThemeSearch,
  normalizedThemeSearch,
  recentThemeKeys,
  selectPopularTheme,
  activeTheme,
  filteredThemeKeys,
  setShowThemePicker,
}) {
  return (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-950/50 p-0 sm:p-4" role="dialog" aria-modal="true" aria-label={t.themeSelect} onMouseDown={(event) => { if (event.target === event.currentTarget) setShowThemePicker(false); }}>
              <div
                className="w-full sm:max-w-2xl overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl flex flex-col"
                style={{ maxHeight: `${Math.min(720, Math.max(280, (themePickerViewportHeight || 720) - 8))}px` }}
              >
                <div className="flex items-center justify-between gap-3 border-b border-outline-variant px-4 py-3.5 sm:px-5">
                  <div>
                    <strong className="block text-[18px] font-black text-on-surface">🎨 {t.themeSelect}</strong>
                    <span className="text-[12px] font-medium text-on-surface-variant">{lang === 'ko' ? `총 ${themeKeys.length}개 테마에서 검색할 수 있습니다.` : `${themeKeys.length} themes available.`}</span>
                  </div>
                  <button type="button" onClick={() => setShowThemePicker(false)} className="interactive-control h-10 w-10 rounded-full border border-outline-variant bg-surface-container-lowest text-[24px] leading-none text-on-surface" aria-label={lang === 'ko' ? '닫기' : 'Close'}>×</button>
                </div>

                <div className="p-4 sm:px-5 sm:pt-4 pb-3 border-b border-outline-variant bg-[#F8FCFA]">
                  <label className="relative block">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[16px]">🔍</span>
                    <input
                      type="search"
                      value={themeSearch}
                      onChange={(event) => setThemeSearch(event.target.value)}
                      placeholder={lang === 'ko' ? '테마 또는 문구 검색 (예: 수능, 회사, 할로윈)' : 'Search themes or phrases'}
                      className="h-12 w-full rounded-xl border-2 border-mint-border bg-white pl-10 pr-4 text-[14px] font-bold text-on-surface outline-none focus:border-mint-strong focus:ring-4 focus:ring-mint/30"
                    />
                  </label>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 flex flex-col gap-4 [scrollbar-width:thin]">
                  {!normalizedThemeSearch && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[12px] font-black text-on-surface-variant">{lang === 'ko' ? '최근·추천 테마' : 'Recent & recommended'}</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {recentThemeKeys.map((theme) => (
                          <button key={`recent-${theme}`} type="button" onClick={() => selectPopularTheme(theme)} className={`touch-manipulation min-h-12 rounded-lg border px-3.5 py-2 text-[15px] sm:text-[16px] font-black text-left truncate ${activeTheme === theme ? 'bg-mint-strong text-white border-[#1E453B] ring-2 ring-mint/50' : 'bg-[#EEF8F4] text-[#1E4E42] border-[#B9DDD0] hover:bg-[#E3F4ED]'}`}>
                            {activeTheme === theme ? '✓ ' : ''}{theme}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-black text-on-surface-variant">{normalizedThemeSearch ? (lang === 'ko' ? '검색 결과' : 'Search results') : (lang === 'ko' ? '전체 테마' : 'All themes')}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">{filteredThemeKeys.length}</span>
                    </div>
                    {filteredThemeKeys.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {filteredThemeKeys.map((theme, index) => (
                          <button key={theme} type="button" onClick={() => selectPopularTheme(theme)} className={`touch-manipulation min-h-13 rounded-xl border px-4 py-3 text-left flex items-center gap-3 ${activeTheme === theme ? 'bg-[#DDF3EA] border-2 border-mint-strong text-[#154639]' : 'bg-[#F7FCFA] border-[#C6E7DA] text-[#1B4B3D] hover:border-[#9FD5C4] hover:bg-[#EEF8F4]'}`}>
                            <span className={`flex h-7 min-w-7 items-center justify-center rounded-md text-[11.5px] font-black ${activeTheme === theme ? 'bg-mint-strong text-white' : 'bg-slate-100 text-slate-500'}`}>{index + 1}</span>
                            <span className="min-w-0 flex-1 truncate text-[15.5px] sm:text-[17px] font-black">{theme}</span>
                            {activeTheme === theme && <span className="text-[16px] font-black text-mint-strong">✓</span>}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-outline-variant bg-slate-50 px-4 py-8 text-center text-[13px] font-bold text-slate-500">{lang === 'ko' ? '검색 결과가 없습니다. 다른 단어를 입력해 보세요.' : 'No themes found.'}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
  );
}
