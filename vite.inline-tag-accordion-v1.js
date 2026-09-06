const TARGET = '/src/App.jsx'

const replaceBetween = (source, startMarker, endMarker, replacement, label) => {
  const start = source.indexOf(startMarker)
  if (start < 0) throw new Error(`[inline-tag-accordion-v1] ${label} start marker not found`)
  const end = source.indexOf(endMarker, start + startMarker.length)
  if (end < 0) throw new Error(`[inline-tag-accordion-v1] ${label} end marker not found`)
  return source.slice(0, start) + replacement + source.slice(end)
}

export function inlineTagAccordionV1Plugin() {
  return {
    name: 'inline-tag-accordion-v1',
    enforce: 'post',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null

      let out = code.replace(/\r\n/g, '\n')

      // The old category header was sticky on mobile, so a tall category block could cover
      // the tag list underneath. Keep all existing data/selection logic but render categories
      // as 3-column rows and expand the active category directly below its own row.
      out = out.replace(
        '              <div className="sticky top-0 z-20 bg-surface-container-highest">',
        '              <div className="relative z-0 bg-surface-container-highest">'
      )

      const categoryStart = '                <div className="no-scrollbar flex flex-wrap bg-[#EAF8F3] px-2 border-b border-mint-border">'
      const categoryEnd = '\n\n                {/* Integrated Active Character Tags Bar directly inside Tag Screen */}'

      const categoryReplacement = `                <div className="bg-[#EAF8F3] border-b border-mint-border">
                  <div className="flex flex-col">
                    {Array.from({ length: Math.ceil(categoryKeys.length / 3) }, (_, rowIndex) => {
                      const rowCategories = categoryKeys.slice(rowIndex * 3, rowIndex * 3 + 3);
                      const activeInRow = rowCategories.includes(activeTagCategory);

                      return (
                        <div key={\`tag-category-row-\${rowIndex}\`} className="border-b border-mint-border/70 last:border-b-0">
                          <div className="grid grid-cols-3 px-1.5">
                            {rowCategories.map(category => {
                              const catTags = currentTags[category] || [];
                              const selectedCount = catTags.filter(t => isTagSelected(t)).length;
                              const isActive = activeTagCategory === category;

                              return (
                                <button
                                  key={category}
                                  type="button"
                                  onClick={() => setActiveTagCategory(category)}
                                  aria-expanded={isActive}
                                  className={\`interactive-control touch-manipulation min-w-0 px-1.5 sm:px-2 py-2.5 text-[12px] sm:text-[13px] font-bold transition-[color,background-color,border-color,box-shadow,opacity,transform,filter] flex items-center justify-center gap-1 cursor-pointer border-b-2 \${
                                    isActive
                                      ? 'text-mint-strong border-mint-strong bg-white font-black'
                                      : 'text-mint-strong/80 hover:text-mint-strong hover:bg-mint-hover/50 border-transparent'
                                  }\`}
                                >
                                  <span className="truncate text-center">{category}</span>
                                  {selectedCount > 0 && (
                                    <span className="bg-mint-strong text-white text-[9.5px] sm:text-[10.5px] px-1.5 py-0.5 rounded-full font-black leading-none shrink-0">
                                      {selectedCount}
                                    </span>
                                  )}
                                  <span className={\`text-[10px] shrink-0 transition-transform \${isActive ? 'rotate-180' : ''}\`} aria-hidden="true">⌄</span>
                                </button>
                              );
                            })}
                          </div>

                          {activeInRow && (
                            <div className="bg-white border-t border-mint-border px-3 py-3 animate-in fade-in slide-in-from-top-1 duration-150">
                              <div className="mb-2.5 flex items-center justify-between gap-2">
                                <strong className="min-w-0 truncate text-[12.5px] sm:text-[13px] font-black text-mint-strong">
                                  {activeTagCategory}
                                </strong>
                                <span className="shrink-0 rounded-full border border-mint-border bg-[#F0FDF8] px-2 py-0.5 text-[10.5px] sm:text-[11px] font-extrabold text-mint-strong">
                                  {lang === 'ko' ? '아래에서 선택' : lang === 'ja' ? '下から選択' : lang === 'zh' ? '下方选择' : 'Choose below'}
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-2 max-h-[270px] sm:max-h-[300px] overflow-y-auto overscroll-y-contain scroll-smooth pr-1 pb-1 [scrollbar-width:thin] [scrollbar-color:#A6E3D0_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#A6E3D0] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-mint-strong">
                                {currentTags[activeTagCategory]?.map(tag => {
                                  const selected = isTagSelected(tag);
                                  return (
                                    <button
                                      key={tag}
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        appendTag(tag);
                                      }}
                                      aria-pressed={selected}
                                      className={\`interactive-control touch-manipulation min-h-[38px] px-3.5 py-1.5 rounded-full text-[13px] font-bold transition-[color,background-color,border-color,box-shadow,opacity,transform,filter] flex items-center gap-1.5 cursor-pointer select-none active:scale-95 \${
                                        selected
                                          ? 'bg-mint-strong text-white border-2 border-[#1E453B] shadow-md ring-2 ring-mint-strong/30 font-black'
                                          : 'bg-white text-on-surface hover:bg-mint-soft hover:text-mint-strong border border-outline-variant hover:border-mint-border'
                                      }\`}
                                    >
                                      {selected ? (
                                        <>
                                          <span className="bg-white text-mint-strong text-[10px] px-1.5 py-0.5 rounded-full font-extrabold shrink-0">✓ ON</span>
                                          <span className="font-extrabold">{tag}</span>
                                        </>
                                      ) : (
                                        <>
                                          <span className="text-on-surface-variant text-[11px] font-bold shrink-0">+</span>
                                          <span>{tag}</span>
                                        </>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>`

      out = replaceBetween(out, categoryStart, categoryEnd, categoryReplacement, 'category accordion')

      const oldListStart = '              {/* Scrollable Tag Chips Container (Smooth Inertial Scroll + Slim Scrollbar + Bottom Fade Indicator) */}'
      const oldListEnd = '\n            </div>\n          </div>\n\n          {showResetConfirm && ('
      out = replaceBetween(out, oldListStart, oldListEnd, '', 'legacy tag list')

      return { code: out, map: null }
    },
  }
}
