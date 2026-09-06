const TARGET = '/src/components/EmoticonPostProcessor.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[bulk-save-layout] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[bulk-save-layout] ${label} marker is not unique`);
  }
  return source.replace(marker, replacement);
};

export function bulkSaveLayoutPlugin() {
  return {
    name: 'bulk-save-layout',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/');
      if (!normalizedId.endsWith(TARGET)) return null;

      let out = code;

      const translationMarker = `  const t = COPY[lang] || COPY.ko;\n  const [processed, setProcessed] = useState([]);`;
      const translationReplacement = `  const t = COPY[lang] || COPY.ko;\n  const allSaveLabel = ({ ko: '모두 저장', en: 'Save all', ja: 'すべて保存', zh: '全部保存' })[lang] || 'Save all';\n  const [processed, setProcessed] = useState([]);`;
      out = replaceOnce(out, translationMarker, translationReplacement, 'translation');

      const downloadZipMarker = `  const downloadZip = async () => {`;
      const downloadAllFunction = `  const downloadAll = async () => {\n    if (working || !processed.length) return;\n    setWorking(true);\n    setError('');\n    try {\n      const replacements = [];\n      for (const item of processed) {\n        let blob = item.finalBlob;\n        let finalUrl = item.finalUrl;\n        if (!blob) {\n          blob = await makeOutputForItem(item, item.transform || { zoom: 1, x: 0, y: 0 }, outputScale);\n          finalUrl = URL.createObjectURL(blob);\n        }\n        replacements.push({ ...item, finalBlob: blob, finalUrl });\n      }\n      setProcessed((old) => {\n        old.forEach((item) => {\n          const replacement = replacements.find((next) => next.index === item.index);\n          if (item.finalUrl && replacement?.finalUrl !== item.finalUrl) URL.revokeObjectURL(item.finalUrl);\n        });\n        return replacements;\n      });\n      for (const item of replacements) {\n        downloadBlob(item.finalBlob, \`${'${base}'}-${'${String(item.index).padStart(2, \'0\')}'}-${'${outputSize}'}.png\`);\n        await new Promise((resolve) => window.setTimeout(resolve, 120));\n      }\n    } catch (e) {\n      console.error('Download all emoticons failed:', e);\n      setError(t.failed);\n    } finally {\n      setWorking(false);\n    }\n  };\n\n  const downloadZip = async () => {`;
      out = replaceOnce(out, downloadZipMarker, downloadAllFunction, 'download all function');

      const titleMarker = `          {engineLabel && (\n            <span className=\"rounded-full bg-[#EEF4EA] px-2 py-1 text-[10px] font-extrabold leading-none text-[#587052]\">\n              {engineLabel}\n            </span>\n          )}\n        </div>`;
      const titleReplacement = `          {engineLabel && (\n            <span className=\"rounded-full bg-[#EEF4EA] px-2 py-1 text-[10px] font-extrabold leading-none text-[#587052]\">\n              {engineLabel}\n            </span>\n          )}\n          <button\n            type=\"button\"\n            disabled={working}\n            onClick={downloadAll}\n            className=\"ml-auto hidden min-h-10 items-center justify-center rounded-xl bg-[#3E6B4B] px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#345B40] disabled:opacity-50 sm:inline-flex\"\n          >\n            ↓ {working ? t.working : allSaveLabel}\n          </button>\n        </div>`;
      out = replaceOnce(out, titleMarker, titleReplacement, 'desktop all-save');

      const gridTailMarker = `            <div className=\"grid grid-cols-2 border-t border-[#EEEAE3] bg-white\">\n              <button type=\"button\" onClick={() => openEditor(item)} className=\"min-h-10 touch-manipulation whitespace-nowrap border-r border-[#EEEAE3] px-1.5 py-2 text-xs font-extrabold leading-5 text-[#6A5A46] hover:bg-[#FFF9F0]\">✏️ {t.edit}</button>\n              <button type=\"button\" onClick={() => downloadItem(item)} className=\"min-h-10 touch-manipulation whitespace-nowrap px-1.5 py-2 text-xs font-extrabold leading-5 text-[#4E664A] hover:bg-[#F8FBF6]\">↓ {t.save}</button>\n            </div>\n          </div>\n        ))}\n      </div>`;
      const gridTailReplacement = `            <div className=\"grid grid-cols-2 border-t border-[#EEEAE3] bg-white\">\n              <button type=\"button\" onClick={() => openEditor(item)} className=\"min-h-10 touch-manipulation whitespace-nowrap border-r border-[#EEEAE3] px-1.5 py-2 text-xs font-extrabold leading-5 text-[#6A5A46] hover:bg-[#FFF9F0]\">✏️ {t.edit}</button>\n              <button type=\"button\" onClick={() => downloadItem(item)} className=\"min-h-10 touch-manipulation whitespace-nowrap px-1.5 py-2 text-xs font-extrabold leading-5 text-[#4E664A] hover:bg-[#F8FBF6]\">↓ {t.save}</button>\n            </div>\n          </div>\n        ))}\n        {processed.length % 2 === 1 && (\n          <button\n            type=\"button\"\n            disabled={working}\n            onClick={downloadAll}\n            className=\"flex min-w-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#AFC4A8] bg-[#F4F9F1] p-4 text-center text-[#466141] shadow-sm transition active:scale-[0.99] disabled:opacity-50 sm:hidden\"\n            aria-label={allSaveLabel}\n          >\n            <span className=\"flex h-12 w-12 items-center justify-center rounded-full bg-[#3E6B4B] text-2xl font-black text-white shadow-sm\">↓</span>\n            <span className=\"text-sm font-black\">{working ? t.working : allSaveLabel}</span>\n            <span className=\"text-[10px] font-bold text-[#70806C]\">{processed.length} PNG</span>\n          </button>\n        )}\n      </div>`;
      out = replaceOnce(out, gridTailMarker, gridTailReplacement, 'mobile all-save cell');

      if (!out.includes('const downloadAll = async () =>')) throw new Error('[bulk-save-layout] individual download-all function missing');
      if (!out.includes('const downloadZip = async () =>')) throw new Error('[bulk-save-layout] ZIP function must remain');
      if (!out.includes('onClick={downloadZip}')) throw new Error('[bulk-save-layout] ZIP button must remain in UI');
      if (!out.includes("ko: '모두 저장'")) throw new Error('[bulk-save-layout] localized save label missing');
      if (!out.includes('processed.length % 2 === 1')) throw new Error('[bulk-save-layout] mobile save cell missing');
      if (!out.includes('sm:inline-flex')) throw new Error('[bulk-save-layout] desktop save button missing');
      if (out.includes('PNG · ZIP')) throw new Error('[bulk-save-layout] mobile all-save must not imply ZIP');

      return { code: out, map: null };
    },
  };
}
