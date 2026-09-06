const TARGET = '/src/App.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[gemini-layout-lock] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[gemini-layout-lock] ${label} marker is not unique`);
  }
  return source.slice(0, first) + replacement + source.slice(first + marker.length);
};

const replaceCount = (source, marker, replacement, expected, label) => {
  const parts = source.split(marker);
  const count = parts.length - 1;
  if (count !== expected) {
    throw new Error(`[gemini-layout-lock] ${label} expected ${expected} occurrence(s), found ${count}`);
  }
  return parts.join(replacement);
};

export function geminiLayoutInstanceLockPlugin() {
  return {
    name: 'gemini-layout-instance-lock',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null;

      let out = code;
      const helperMarker = `  const getPreviewPrompt = () => {`;
      const helper = `  const optimizeGeminiLayoutInstanceLock = (prompt) => {
    let base = String(prompt || '');

    base = base
      .replace(/^\\[LAYOUT & STRICT SPATIAL RULES — HIGHEST PRIORITY\\][\\s\\S]*?empty spacing\\.\\n\\n?/, '')
      .replace(/\\[모델 최적화 v\\d+(?:\\.\\d+)*\\]/g, '[모델 최적화]')
      .replace(/ — Gemini v\\d+(?:\\.\\d+)*/g, '')
      .replace(/ — GEMINI v\\d+(?:\\.\\d+)*/g, '')
      .replace(/ — v\\d+(?:\\.\\d+)*/g, '');

    const lock = \
\`[LANDSCAPE ORIENTATION — ABSOLUTE]
- Final canvas aspect ratio: 16:9 WIDE LANDSCAPE. Width MUST be significantly greater than height.
- Arrange strictly as exactly 5 ACROSS × 3 DOWN: 5 columns × 3 rows.
- NEVER arrange as 3 ACROSS × 5 DOWN. Do NOT create a tall, vertical, or portrait-oriented composition.
- There are exactly THREE horizontal row levels in total.
- Every row contains exactly FIVE stickers from left to right and spans the wide canvas.
- Row 1: Stickers 01–05. Row 2: Stickers 06–10. Row 3: Stickers 11–15.
- Sticker numbers are internal layout references only. Do NOT render numbers, row labels, grid labels, or guide text.

[STRICT SLOT OCCUPANCY & INSTANCE LOCK]
- ONE slot = ONE phrase = ONE primary character sticker.
- Exactly 15 slots and exactly 15 total primary character figures across the entire image.
- Each slot contains strictly ONE complete primary character figure.
- Do NOT create miniature duplicate characters beside or behind a main character.
- Do NOT merge two phrases, two emotions, or two characters into one slot.
- Do NOT generate secondary, background, supporting, decorative, or extra human figures.
- Props, hearts, sweat drops, motion lines, stars, symbols, and graphic effects are allowed, but they must NEVER resemble additional human bodies or mini figures.
- If space is tight, uniformly reduce the scale of all 15 primary stickers together. Never spawn smaller secondary characters and never reduce the count.
- Keep every primary character fully visible, separated, and uncropped.
- Use clean white die-cut margins around each sticker on a PURE WHITE background.
- Borderless canvas only: NO comic panels, NO framing boxes, NO rectangular card borders, NO grid lines, NO cell containers.

[FINAL STRUCTURE CHECK]
Wide 16:9 landscape → exactly 5 stickers across the top row → exactly 5 across the middle row → exactly 5 across the bottom row → exactly 15 primary character figures total.\`;

    return lock + '\\n\\n' + base;
  };

${helperMarker}`;

      out = replaceOnce(out, helperMarker, helper, 'helper injection');

      const marker = `optimizeGeminiIdentityStyleLock(optimizeModelPromptV4(generateGeminiPrompt(phraseOverride), 'gemini'))`;
      const replacement = `optimizeGeminiLayoutInstanceLock(optimizeGeminiIdentityStyleLock(optimizeModelPromptV4(generateGeminiPrompt(phraseOverride), 'gemini')))`;
      out = replaceCount(out, marker, replacement, 3, 'Gemini prompt wrapping');

      return { code: out, map: null };
    },
  };
}
