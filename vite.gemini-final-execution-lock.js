const TARGET = '/src/App.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[gemini-final-lock] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) throw new Error(`[gemini-final-lock] ${label} marker is not unique`);
  return source.slice(0, first) + replacement + source.slice(first + marker.length);
};

const replaceCount = (source, marker, replacement, expected, label) => {
  const parts = source.split(marker);
  const count = parts.length - 1;
  if (count !== expected) throw new Error(`[gemini-final-lock] ${label} expected ${expected}, found ${count}`);
  return parts.join(replacement);
};

export function geminiFinalExecutionLockPlugin() {
  return {
    name: 'gemini-final-execution-lock',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null;

      let out = code;
      const helperMarker = `  const getPreviewPrompt = () => {`;
      const helper = `  const optimizeGeminiFinalExecutionLock = (prompt) => {
    const base = String(prompt || '');

    const ko = \
\`[최종 실행 계약 — 절대 준수]
1. 최종 캔버스는 반드시 16:9 가로형입니다. 세로형·정사각형으로 만들지 마세요.
2. 반드시 5열 × 3행, 정확히 15개만 생성하세요. 4×4, 16개, 3×5, 12개는 전부 실패입니다. 15번째에서 즉시 종료하고 16번째 스티커를 절대 만들지 마세요.
3. 각 슬롯은 지정 문구 1개 + 주인공 1명만 포함합니다. 추가 인물, 미니 인물, 배경 인물, 복제 인물을 만들지 마세요.
4. [최우선 화풍]은 15개 전체에서 절대 유지됩니다. 문구가 달라도 일반 메신저 카툰, 귀여운 스티커풍, 포스터풍, 아동 일러스트풍 등 다른 시각 언어로 후퇴하지 마세요.
5. 문구의 감정·행동·소품은 반드시 선택 화풍 안에서 연출하세요. 화풍 밖의 전형적인 엄지척, 손하트, 만세, 스톡 이모지 포즈로 대체하지 마세요.
6. 문자도 선택 화풍의 연출입니다. 글자 형태·획·재질·기울기·크기·자간·배치·효과가 같은 화풍 DNA를 유지해야 합니다. 일반 둥근 디지털 스티커 폰트로 전환하지 마세요.
7. 선택 화풍이 전통 무협 만화풍이라면 모든 슬롯에서 무협 만화의 동세·카메라·먹선·기세·여백·레터링이 눈에 띄게 보여야 합니다. 현대 의상은 그대로 유지하되 연출은 무협지의 한 장면처럼 만드세요.
8. 사각형·둥근 사각형 카드, 패널, 라벨판, 격자선은 만들지 말고 순수 흰 배경 위 비정형 다이컷 스티커로 유지하세요.
9. 각 지정 한글 문구는 해당 슬롯에 정확히 1회만 출력하세요. 중복·상하 반복·추가 문구를 만들지 마세요.
10. 렌더링 직전 최종 확인: WIDE 16:9 → 5 + 5 + 5 → 정확히 15명 → 같은 선택 화풍 → 같은 고정 의상 → 문자도 같은 화풍. 하나라도 어긋나면 수정한 뒤 렌더링하세요.\`;

    const en = \
\`[FINAL EXECUTION CONTRACT — ABSOLUTE]
1. Final canvas MUST be 16:9 wide landscape. Never portrait or square.
2. Create EXACTLY 5 columns × 3 rows = exactly 15 stickers. 4×4, 16 stickers, 3×5, or 12 stickers are failures. STOP after sticker 15. Never create sticker 16.
3. Each slot contains one assigned phrase and one primary character only. No extra, miniature, background, supporting, or duplicate people.
4. Keep [HIGHEST PRIORITY ART STYLE] visibly dominant across all 15 stickers. Never fall back to generic messenger cartoon, cute sticker, poster, or children's illustration language because the phrase changes.
5. Phrase meaning, emotion, action and props must be staged only inside the selected style's visual grammar. Do not substitute generic thumbs-up, hand-heart, stock-emoji or standard sticker poses.
6. Typography is part of the selected style direction. Letterform, stroke material, tilt, scale, spacing, placement and effects must preserve the same style DNA. Never switch to a generic rounded digital sticker font.
7. If the selected style is traditional wuxia comic style, every slot must visibly show wuxia acting, camera, ink energy, negative space and lettering while keeping the modern fixed outfit unchanged.
8. No rectangular or rounded cards, panels, labels, grid lines or cell containers. Use organic die-cut stickers on pure white.
9. Render each assigned Korean phrase exactly once in its slot. No duplicate top/bottom copies or extra wording.
10. Final check before rendering: WIDE 16:9 → 5 + 5 + 5 → exactly 15 people → one selected style world → fixed outfit → typography in the same style. Correct any violation before rendering.\`;

    return base + '\\n\\n' + (lang === 'ko' ? ko : en);
  };

${helperMarker}`;

      out = replaceOnce(out, helperMarker, helper, 'helper injection');
      const marker = `optimizeGeminiStyleSceneLock(optimizeGeminiLayoutInstanceLock(optimizeGeminiIdentityStyleLock(optimizeModelPromptV4(generateGeminiPrompt(phraseOverride), 'gemini'))))`;
      const replacement = `optimizeGeminiFinalExecutionLock(optimizeGeminiStyleSceneLock(optimizeGeminiLayoutInstanceLock(optimizeGeminiIdentityStyleLock(optimizeModelPromptV4(generateGeminiPrompt(phraseOverride), 'gemini')))))`;
      out = replaceCount(out, marker, replacement, 3, 'Gemini prompt wrapping');

      return { code: out, map: null };
    },
  };
}
