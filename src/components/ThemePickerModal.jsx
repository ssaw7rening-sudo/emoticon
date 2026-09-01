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
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-950/45 backdrop-blur-[1px] p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.themeSelect}
      onMouseDown={(event) => { if (event.target === event.currentTarget) setShowThemePicker(false); }}
    >
      <div
        className="w-full sm:max-w-2xl overflow-hidden rounded-t-2xl sm:rounded-2xl bg-[#FFFDF8] shadow-2xl flex flex-col border border-[#E8E0D6]"
        style={{ maxHeight: `${Math.min(720, Math.max(280, (themePickerViewportHeight || 720) - 8))}px` }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#EDE3D7] bg-[#FFF9F1] px-4 py-3.5 sm:px-5 sm:py-4">
          <div>
            <strong className="block text-[17px] sm:text-[18px] font-extrabold text-[#2F302E] tracking-tight">🎨 {t.themeSelect}</strong>
            <span className="text-[13px] sm:text-[13.5px] font-medium text-[#766E65]">{lang === 'ko' ? `총 ${themeKeys.length}개 테마에서 검색할 수 있습니다.` : `${themeKeys.length} themes available.`}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowThemePicker(false)}
            className="interactive-control h-10 w-10 rounded-full border border-[#E4D6C5] bg-[#FFFEFB] text-[22px] font-medium leading-none text-[#45423E] hover:bg-[#FFF4E7]"
            aria-label={lang === 'ko' ? '닫기' : 'Close'}
          >
            ×
          </button>
        </div>

        <div className="p-4 sm:px-5 sm:pt-4 pb-3 border-b border-[#DDEBE5] bg-[#F4FAF7]">
          <label className="relative block">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[16px]">🔍</span>
            <input
              type="search"
              value={themeSearch}
              onChange={(event) => setThemeSearch(event.target.value)}
              placeholder={lang === 'ko' ? '테마 또는 문구 검색 (예: 수능, 회사, 할로윈)' : 'Search themes or phrases'}
              className="h-12 w-full rounded-xl border-2 border-[#ACD7C8] bg-[#FFFEFB] pl-10 pr-4 text-[14.5px] sm:text-[15px] font-semibold text-[#294A40] placeholder:text-[#8B9490] placeholder:font-medium outline-none focus:border-[#5FA88E] focus:ring-4 focus:ring-[#CDEBE0]/60"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#FFFDF8] p-4 sm:p-5 flex flex-col gap-4 [scrollbar-width:thin]">
          {!normalizedThemeSearch && (
            <div className="flex flex-col gap-2">
              <span className="text-[13px] sm:text-[13.5px] font-bold text-[#595C58]">{lang === 'ko' ? '최근·추천 테마' : 'Recent & recommended'}</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {recentThemeKeys.map((theme) => (
                  <button
                    key={`recent-${theme}`}
                    type="button"
                    onClick={() => selectPopularTheme(theme)}
                    className={`touch-manipulation min-h-12 rounded-lg border px-3.5 py-2 text-[14.5px] sm:text-[15.5px] font-semibold text-left truncate transition-colors ${activeTheme === theme ? 'bg-[#E1F3EC] text-[#184F43] border-[#6FB7A2] ring-1 ring-[#A8D8C7]' : 'bg-[#F8FCFA] text-[#285B4C] border-[#CAE4DA] hover:bg-[#EEF8F4]'}`}
                  >
                    {activeTheme === theme ? '✓ ' : ''}{theme}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] sm:text-[13.5px] font-bold text-[#595C58]">{normalizedThemeSearch ? (lang === 'ko' ? '검색 결과' : 'Search results') : (lang === 'ko' ? '전체 테마' : 'All themes')}</span>
              <span className="rounded-full bg-[#F1F0EC] px-2.5 py-0.5 text-[12px] sm:text-[12.5px] font-semibold text-[#6B6862]">{filteredThemeKeys.length}</span>
            </div>
            {filteredThemeKeys.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredThemeKeys.map((theme, index) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => selectPopularTheme(theme)}
                    className={`touch-manipulation min-h-13 rounded-xl border px-4 py-3 text-left flex items-center gap-3 transition-colors ${activeTheme === theme ? 'bg-[#E8F6F0] border-2 border-[#6FB7A2] text-[#184F43]' : 'bg-[#FFFEFB] border-[#D5E9E1] text-[#285B4C] hover:border-[#A9D4C5] hover:bg-[#F4FAF7]'}`}
                  >
                    <span className={`flex h-7 min-w-7 items-center justify-center rounded-md text-[12px] sm:text-[12.5px] font-bold ${activeTheme === theme ? 'bg-[#2F7D68] text-white' : 'bg-[#F1F0EC] text-[#74716B]'}`}>{index + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-[15px] sm:text-[16px] font-semibold">{theme}</span>
                    {activeTheme === theme && <span className="text-[15px] font-bold text-[#2F7D68]">✓</span>}
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#D8DDD9] bg-[#FAFAF7] px-4 py-8 text-center text-[13.5px] sm:text-[14px] font-medium text-[#777B77]">{lang === 'ko' ? '검색 결과가 없습니다. 다른 단어를 입력해 보세요.' : 'No themes found.'}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
