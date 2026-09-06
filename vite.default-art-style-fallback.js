const TARGET = '/src/App.jsx';

export function defaultArtStyleFallbackPlugin() {
  return {
    name: 'default-art-style-fallback',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null;

      const marker = `    return artStyles
      .filter(style => selectedTagSet.has(style))
      .sort((a, b) => charManual.lastIndexOf(a) - charManual.lastIndexOf(b))
      .at(-1) || '';`;

      const replacement = `    return artStyles
      .filter(style => selectedTagSet.has(style))
      .sort((a, b) => charManual.lastIndexOf(a) - charManual.lastIndexOf(b))
      .at(-1) || (lang === 'en' ? 'Cute 2D cartoon' : '귀여운 2D 만화풍');`;

      const first = code.indexOf(marker);
      if (first < 0) throw new Error('[default-art-style-fallback] selected art style fallback marker not found');
      if (code.indexOf(marker, first + marker.length) >= 0) throw new Error('[default-art-style-fallback] selected art style fallback marker is not unique');

      return { code: code.slice(0, first) + replacement + code.slice(first + marker.length), map: null };
    },
  };
}
