const TARGET = '/src/App.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[text-character-invariance] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[text-character-invariance] ${label} marker is not unique`);
  }
  return source.replace(marker, replacement);
};

export function textCharacterInvariancePlugin() {
  return {
    name: 'text-character-invariance',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/');
      if (!normalizedId.endsWith(TARGET)) return null;

      const marker = `    return \`${'${prompt}'}\\n\\n${'${exactBlock}'}\\n\\n${'${duplicateBlock}'}\\n\\n${'${modelBlock}'}\`;`;
      const replacement = [
        `    const characterInvariantBlock = lang === 'ko'`,
        `      ? \`[문구-캐릭터 분리 원칙 — 최우선]`,
        `- 문구 포함 여부는 캐릭터의 얼굴, 체형, 신체 비율, 의상, 포즈, 화풍, 정체성을 바꾸는 이유가 되어서는 안 됩니다.`,
        `- 먼저 캐릭터의 얼굴·표정·체형·포즈·의상·소품·효과·화풍을 글자 없는 결과와 동일한 기준으로 완성한 뒤, 레터링만 독립적인 그래픽 레이어처럼 추가하세요.`,
        `- 문구 공간을 확보하려고 캐릭터를 축소·확대·이동·재포즈하거나 얼굴형, 신체 비율, 의상, 핵심 소품을 변경하지 마세요.`,
        `- 문구는 이미 정해진 캐릭터 구성의 자연스러운 여백에만 배치하고, 캐릭터 구성 자체를 다시 설계하지 마세요.`,
        `- 동일한 입력 설정에서는 문구 포함/미포함의 차이가 오직 레터링 유무가 되도록 최대한 유지하세요.\``,
        `      : \`[TEXT / CHARACTER SEPARATION — HIGHEST PRIORITY]`,
        `Text inclusion must not change the character's face, expression, body shape, body proportions, outfit, pose, art style, identity, key props, or effects. First construct the character exactly as you would in the no-text version, then add lettering only as an independent graphic layer. Do not resize, reposition, re-pose, restyle, or redesign the character merely to make room for text. Place lettering only in existing negative space around the already-defined character composition. With the same input settings, keep text-on and text-off results as visually identical as possible except for the presence of lettering.\`;`,
        ``,
        `    return \`${'${prompt}'}\\n\\n${'${characterInvariantBlock}'}\\n\\n${'${exactBlock}'}\\n\\n${'${duplicateBlock}'}\\n\\n${'${modelBlock}'}\`;`,
      ].join('\n');

      const out = replaceOnce(code, marker, replacement, 'enhanced prompt return');
      if (!out.includes('[문구-캐릭터 분리 원칙 — 최우선]')) {
        throw new Error('[text-character-invariance] Korean character invariance block missing');
      }
      if (!out.includes('[TEXT / CHARACTER SEPARATION — HIGHEST PRIORITY]')) {
        throw new Error('[text-character-invariance] English character invariance block missing');
      }
      if (!out.includes('${duplicateBlock}')) {
        throw new Error('[text-character-invariance] duplicate text block was dropped');
      }
      return { code: out, map: null };
    },
  };
}
