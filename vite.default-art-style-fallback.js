const TARGET = '/src/App.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[default-art-style-fallback] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[default-art-style-fallback] ${label} marker is not unique`);
  }
  return source.slice(0, first) + replacement + source.slice(first + marker.length);
};

export function defaultArtStyleFallbackPlugin() {
  return {
    name: 'default-art-style-fallback',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null;

      let out = code;

      // No explicit art-style selection => use the project's canonical cute SD/Chibi default.
      // Explicit user selections remain untouched and continue to override this fallback.
      const fallbackMarker = `    return artStyles
      .filter(style => selectedTagSet.has(style))
      .sort((a, b) => charManual.lastIndexOf(a) - charManual.lastIndexOf(b))
      .at(-1) || '';`;

      const fallbackReplacement = `    return artStyles
      .filter(style => selectedTagSet.has(style))
      .sort((a, b) => charManual.lastIndexOf(a) - charManual.lastIndexOf(b))
      .at(-1) || (lang === 'en' ? 'Cute SD/Chibi cartoon' : '귀여운 SD/Chibi 카툰');`;

      out = replaceOnce(out, fallbackMarker, fallbackReplacement, 'selected art style fallback');

      // Register the fallback labels in the expanded-style map without renaming the existing
      // selectable "귀여운 2D 만화풍 / Cute 2D cartoon" option. This keeps old saved/manual
      // selections compatible while making the no-selection default explicitly SD/Chibi.
      const styleMapMarker = `    const styleMap = {`;
      const styleMapReplacement = `    const styleMap = {
      '귀여운 SD/Chibi 카툰': {
        ko: '큰 머리와 작은 몸의 귀여운 SD/Chibi 비율, 둥글고 명확한 실루엣, 밝고 선명한 플랫컬러와 부드러운 셀 셰이딩이 중심인 고품질 2D 카툰 스타일. 표정은 풍부하게, 감정은 얼굴뿐 아니라 팔·손·다리·몸통의 전신 제스처로 생동감 있게 표현하고, 작은 화면에서도 캐릭터와 문자가 즉시 읽히도록 정리하세요. 실사 피부질감, 탁한 갈색·회색 컬러캐스트, 과도한 입체 명암과 광택성 2.5D 렌더링은 피하세요.',
        en: 'high-quality cute SD/Chibi 2D cartoon style with a large head, small body, rounded readable silhouette, bright vivid flat colors and soft cel shading. Use rich expressions and lively full-body acting through the arms, hands, legs and torso, keeping both character and lettering instantly readable at small size. Avoid photorealistic skin texture, muddy brown/gray color casts, overly volumetric shading and glossy 2.5D rendering.'
      },
      'Cute SD/Chibi cartoon': {
        ko: '큰 머리와 작은 몸의 귀여운 SD/Chibi 비율, 둥글고 명확한 실루엣, 밝고 선명한 플랫컬러와 부드러운 셀 셰이딩이 중심인 고품질 2D 카툰 스타일. 표정은 풍부하게, 감정은 얼굴뿐 아니라 팔·손·다리·몸통의 전신 제스처로 생동감 있게 표현하고, 작은 화면에서도 캐릭터와 문자가 즉시 읽히도록 정리하세요. 실사 피부질감, 탁한 갈색·회색 컬러캐스트, 과도한 입체 명암과 광택성 2.5D 렌더링은 피하세요.',
        en: 'high-quality cute SD/Chibi 2D cartoon style with a large head, small body, rounded readable silhouette, bright vivid flat colors and soft cel shading. Use rich expressions and lively full-body acting through the arms, hands, legs and torso, keeping both character and lettering instantly readable at small size. Avoid photorealistic skin texture, muddy brown/gray color casts, overly volumetric shading and glossy 2.5D rendering.'
      },`;

      out = replaceOnce(out, styleMapMarker, styleMapReplacement, 'expanded art style map');

      return { code: out, map: null };
    },
  };
}
