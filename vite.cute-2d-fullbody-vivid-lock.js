const TARGET = '/src/App.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[cute-2d-fullbody-vivid-lock] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[cute-2d-fullbody-vivid-lock] ${label} marker is not unique`);
  }
  return source.slice(0, first) + replacement + source.slice(first + marker.length);
};

export function cute2DFullBodyVividLockPlugin() {
  return {
    name: 'cute-2d-fullbody-vivid-lock',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null;

      let out = code;

      // Cute/default 2D is intentionally full-body-first and visually bright.
      // Photo-reference mode preserves identity, but must not inherit the source photo's
      // crop, lens, realistic body proportion, ambient color cast or photographic lighting.
      const koOld = `['둥근 2D 라인·밝은 플랫컬러·셀 셰이딩','탄력 있고 명확한 카툰 제스처','정면·3/4·가벼운 로우/하이앵글 혼합','손그림 하트·별·땀·동세선','둥글고 생동감 있는 손글씨, 감정별 크기·기울기 변화','명랑한 2D 애니 컷']`;
      const koNew = `['깨끗하고 둥근 2D 외곽선·단순화된 카툰 비율(머리 1:몸 1.5~2.5)·높은 명도의 맑고 선명한 플랫컬러·1~2단계 셀 셰이딩. 실사 피부질감·사진 주변광·갈색/회색 컬러캐스트·에어브러시 그라데이션·광택성 2.5D 렌더링 금지','얼굴 표정만 확대하지 말고 팔·손·다리·몸통의 축과 무게중심까지 사용해 몸 전체가 감정을 연기하는 탄력 있고 명확한 카툰 제스처','전신 우선. 15개 기준 9~11개는 머리부터 발끝까지 읽히는 전신으로 구성하고 나머지만 행동상 필요한 반신·근접 사용. 정면·3/4·사선·가벼운 로우/하이앵글을 섞되 사진의 원래 클로즈업 구도·렌즈감은 복제하지 않음','단순하고 선명한 2D 손그림 하트·별·땀·동세선. 네온 블룸·입체 파티클·3D 광택 효과 금지','둥글고 생동감 있는 2D 손글씨, 감정별 크기·기울기·간격 변화. 캐릭터와 같은 맑은 플랫컬러·선명한 대비를 사용하고 두꺼운 3D 베벨·젤리 광택·과도한 입체 그림자 금지','밝고 선명한 전신형 2D 캐릭터 애니메이션 컷. 사진 참고는 얼굴 정체성만 유지하며 촬영 구도·실사 신체비율·조명·색보정은 화풍이 새로 설계']`;

      const enOld = `['rounded 2D lines, bright flat color, cel shading','elastic clear cartoon gestures','front/three-quarter with mild high/low angles','drawn hearts, stars, sweat and motion marks','lively rounded hand lettering with emotional scale/tilt','cheerful 2D animation frame']`;
      const enNew = `['clean rounded 2D outlines, simplified cartoon proportion (head 1 : body 1.5–2.5), high-value clear vivid flat colors and only 1–2 cel-shading steps; forbid realistic skin texture, photographic ambient color cast, muddy brown/gray grading, airbrushed gradients and glossy 2.5D rendering','use arms, hands, legs, torso axis and weight shift so the whole body performs the emotion instead of enlarging only the face; elastic clear cartoon gestures','full-body first: for a 15-expression sheet keep roughly 9–11 scenes readable from head to toe and use medium/close framing only when the action truly needs it; mix front, three-quarter, diagonal and mild high/low angles, but never copy the reference photo crop or lens feel','simple crisp hand-drawn 2D hearts, stars, sweat and motion marks; no neon bloom, dimensional particles or glossy 3D effects','lively rounded 2D hand lettering with emotional scale, tilt and spacing; use the same clear flat-color contrast as the character and forbid heavy 3D bevel, jelly gloss or excessive dimensional shadow','bright vivid full-body 2D character animation frame; a photo reference preserves identity only, while crop, realistic body proportion, lighting and color grade are redesigned by the selected style']`;

      out = replaceOnce(out, koOld, koNew, 'Korean cute 2D preset');
      out = replaceOnce(out, enOld, enNew, 'English cute 2D preset');

      return { code: out, map: null };
    },
  };
}
