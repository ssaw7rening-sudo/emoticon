import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const appPath = path.join(rootDir, 'src', 'App.jsx');
const source = fs.readFileSync(appPath, 'utf8');

const startMarker = "  const changeLanguage = (newLang) => {";
const endMarker = "\n\n  // 🔤 Responsive font scaling";
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);

if (start === -1 || end === -1) {
  console.error('[global-parity] Could not locate changeLanguage block in src/App.jsx');
  process.exit(1);
}

const replacement = `  const changeLanguage = (newLang) => {
    if (newLang === lang) return;

    // GLOBAL PARITY RULE:
    // Korean is the canonical setup surface. Switching locale must localize labels/data only;
    // it must never reset or replace the user's selected character, art style, outfit, props,
    // effects, photo-reference mode, generation mode, AI options, background/text options, etc.
    const oldThemes = getThemesByLang(lang);
    const oldThemeKeys = Object.keys(oldThemes);
    const newThemes = getThemesByLang(newLang);
    const newThemeKeys = Object.keys(newThemes);
    const oldTags = getTagsByLang(lang);
    const newTags = getTagsByLang(newLang);
    const oldCategoryKeys = Object.keys(oldTags);
    const newCategoryKeys = Object.keys(newTags);

    // Translate a built-in tag by semantic position (category index + tag index).
    // Unknown/manual user text is intentionally preserved verbatim instead of being deleted.
    const mapTagToLocale = (token) => {
      const cleanToken = (token || '').trim();
      if (!cleanToken) return '';

      for (let categoryIndex = 0; categoryIndex < oldCategoryKeys.length; categoryIndex += 1) {
        const oldCategory = oldCategoryKeys[categoryIndex];
        const oldList = oldTags[oldCategory] || [];
        const tagIndex = oldList.indexOf(cleanToken);
        if (tagIndex === -1) continue;

        const newCategory = newCategoryKeys[categoryIndex];
        const newList = (newCategory && newTags[newCategory]) || [];
        return newList[tagIndex] || cleanToken;
      }

      return cleanToken;
    };

    const translatedCharManual = (charManual || '')
      .split(',')
      .map(mapTagToLocale)
      .filter(Boolean)
      .join(', ');

    // Translate a known built-in phrase by theme index + phrase index.
    // Custom/manual phrases stay exactly as the user wrote them.
    const mapPhraseToLocale = (phrase) => {
      const oldAllEntries = Object.entries(oldThemes);
      for (let themeIndex = 0; themeIndex < oldAllEntries.length; themeIndex += 1) {
        const [, oldList] = oldAllEntries[themeIndex];
        const phraseIndex = oldList.indexOf(phrase);
        if (phraseIndex === -1) continue;

        const newThemeKey = newThemeKeys[themeIndex];
        const newList = (newThemeKey && newThemes[newThemeKey]) || [];
        return newList[phraseIndex] || phrase;
      }
      return phrase;
    };

    if (typeof window !== 'undefined') {
      const currentPagePath = window.location.pathname.toLowerCase();
      const isPolicyPage = currentPagePath === '/privacy' || currentPagePath === '/terms';
      if (!isPolicyPage) {
        const nextPath = APP_LOCALE_PATHS[newLang] || '/';
        const currentUrl = new URL(window.location.href);
        if (currentUrl.pathname !== nextPath || currentUrl.search) {
          window.history.pushState({ lang: newLang }, '', nextPath);
        }
      }
    }

    setLang(newLang);

    let nextPhrases = emoticons;
    let nextThemeKey = activeTheme;

    if (activeTheme !== 'custom') {
      const themeIndex = oldThemeKeys.indexOf(activeTheme);
      nextThemeKey = newThemeKeys[themeIndex >= 0 ? themeIndex : 0] || newThemeKeys[0];
      nextPhrases = newThemes[nextThemeKey] || emoticons;
      setActiveTheme(nextThemeKey);
      setEmoticons(nextPhrases);
    } else {
      // Never randomize/reset custom grids during locale changes.
      // Translate only phrases that have a canonical counterpart; preserve the rest verbatim.
      nextPhrases = emoticons.map(mapPhraseToLocale);
      setEmoticons(nextPhrases);
    }

    // Keep individual/batch selection on the same semantic phrase instead of leaving stale locale text.
    setIndividualPhrase((previous) => mapPhraseToLocale(previous || nextPhrases[0] || ''));
    setBatchPhrase((previous) => mapPhraseToLocale(previous || nextPhrases[0] || ''));

    // Preserve the selected top theme by semantic index when it is a built-in theme.
    if (selectedTopTheme) {
      const selectedThemeIndex = oldThemeKeys.indexOf(selectedTopTheme);
      if (selectedThemeIndex >= 0 && newThemeKeys[selectedThemeIndex]) {
        setSelectedTopTheme(newThemeKeys[selectedThemeIndex]);
      }
    }

    // Preserve the currently opened tag category and all selected tags, including ART STYLE.
    const categoryIndex = oldCategoryKeys.indexOf(activeTagCategory);
    setActiveTagCategory(newCategoryKeys[categoryIndex >= 0 ? categoryIndex : 0] || newCategoryKeys[0]);
    setCharManual(translatedCharManual);
  };`;

const nextSource = source.slice(0, start) + replacement + source.slice(end);

if (nextSource === source) {
  console.log('[global-parity] No change required.');
  process.exit(0);
}

fs.writeFileSync(appPath, nextSource, 'utf8');
console.log('[global-parity] Locale switching now preserves the full Korean setup and localizes built-in data only.');
