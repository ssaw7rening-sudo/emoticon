const TARGET = '/src/App.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[style-five-axis-presets-v2] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[style-five-axis-presets-v2] ${label} marker is not unique`);
  }
  return source.slice(0, first) + replacement + source.slice(first + marker.length);
};

export function styleFiveAxisPresetsV2Plugin() {
  return {
    name: 'style-five-axis-presets-v2',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith(TARGET)) return null;

      let out = code;
      const marker = `  const getExpandedArtStyleText = (styleTag, isKo) => {`;
      const helper = `  const getFiveAxisStylePreset = (styleTag, isKo) => {
    const groups = [
      CHARACTER_TAGS_KO['🖌️ 화풍'] || [],
      CHARACTER_TAGS_EN['🖌️ Art Style'] || [],
      CHARACTER_TAGS_JA['🖌️ 画風'] || [],
      CHARACTER_TAGS_ZH['🖌️ 画风'] || [],
    ];
    let idx = -1;
    for (const group of groups) {
      const i = group.indexOf(styleTag);
      if (i >= 0) { idx = i; break; }
    }
    if (idx < 0) idx = 0;

    const ko = [
      ['둥근 2D 라인·밝은 플랫컬러·셀 셰이딩','탄력 있고 명확한 카툰 제스처','정면·3/4·가벼운 로우/하이앵글 혼합','손그림 하트·별·땀·동세선','둥글고 생동감 있는 손글씨, 감정별 크기·기울기 변화','명랑한 2D 애니 컷'],
      ['깔끔한 디지털 라인·현대 색감·절제된 셀 셰이딩','웹툰 컷처럼 시선·손·몸 방향을 선명하게 연기','근접·반신·전신, 사선·오버숄더·로우앵글','웹툰 집중선·속도선·감정 배경·빛','웹툰 효과문자/손글씨, 감정별 굵기·크기 변화','현대 한국 웹툰 한 컷'],
      ['거친 펜·마커·낙서선과 종이 손맛','즉흥적이고 장난스러운 과장 제스처','평면 중심, 삐뚤어진 시점과 자유로운 크롭','화살표·별·구름·휘갈김 낙서','삐뚤빼뚤 손글씨가 몸짓처럼 흔들림','살아 움직이는 스케치북 낙서'],
      ['투명 수채 워시·물 번짐·종이결·파스텔','유연하고 섬세한 몸짓과 표정','여백 중심의 부드러운 근·중경 구성','물감 번짐·꽃잎·빛 얼룩·붓물결','물붓 레터링, 번짐·농담·여백 변화','젖은 종이와 수채의 호흡'],
      ['색연필 겹침·종이결·따뜻한 선','동화책처럼 순하고 명확한 손·표정 연기','아이 눈높이의 안정된 전신·반신','색연필 별·꽃·구름·작은 소품','색연필 손글씨, 압력·색 겹침·크기 변화','따뜻한 그림책 삽화'],
      ['셀 애니 선·제한 팔레트·빈티지 셀/필름 질감','고전 애니식 명확한 키포즈와 큰 표정','정면·측면·로우앵글·강한 크롭 교차','스미어·속도선·반짝임·필름 플레어','수작업 타이틀 카드형 레터링','빈티지 셀 애니 프레임'],
      ['매끈한 벡터 윤곽·기하 형태·제한 플랫컬러','최소 형태 변화로 명확한 아이콘성 제스처','정돈된 정면·3/4와 균형 여백','선·점·기하 도형의 플랫 효과','깨끗한 벡터 레터링, 감정별 크기·배치 변화','미니멀 브랜드 캐릭터 시스템'],
      ['원색 대비·굵은 외곽·컬러 블록·인쇄 패턴','표정·팔다리·포즈를 크게 과장','대담한 클로즈업·사선·극단 크롭','벤데이 도트·스타버스트·컬러 버스트','크고 대담한 팝아트/코믹 SFX 레터링','강한 팝아트 포스터'],
      ['굵은 검정 잉크·극적 그림자·해칭','영웅적 실루엣과 강한 체중 이동','로우앵글·극단 원근·포어쇼트닝','충격선·방사선·폭발·잉크 파편','굵은 잉크 SFX, 압축·확장·강한 경사','클래식 코믹북 액션 패널'],
      ['픽셀 형태·제한 팔레트·도트 명암','스프라이트 키프레임 같은 단순 명확한 동작','2D 게임식 정면/측면 시점','픽셀 파티클·하트·별·충격 프레임','픽셀 폰트/도트 레터링','게임 스프라이트 시트'],
      ['찢은 종이·색지·인쇄물·접착 흔적','종이 조각을 접고 배치한 듯한 그래픽 몸짓','평면 레이어·겹침·비스듬한 배치','종이 별·테이프·스탬프·찢김','오려 붙인 글자·잡지 타이포·손글씨','실물 종이 콜라주'],
      ['거친 인쇄잉크·망점·색 어긋남·빈티지 종이','옛 인쇄만화식 명확한 과장 제스처','평면 패널·강한 크롭·제한 원근','잉크 번짐·버스트·해칭·망점','옛 만화 제목/효과문자식 번진 레터링','낡은 인쇄 만화의 물성'],
      ['흑백 잉크·스크린톤·해칭·검정 면','톤과 선으로 긴장·시선·감정 강화','클로즈업·사선·로우앵글·전신 교차','집중선·속도선·검은 오라·스크린톤','흑백 잉크 효과문자/손글씨','출판 흑백 만화 장면'],
      ['거친 먹선·강한 필압·검은 면','질주·타격·방어·포효의 극단 키포즈','로우앵글·사선·극단 원근·손발 단축','속도선·충격파·에너지 폭발·먼지·잔상','공격적 붓/잉크 SFX, 폭발적 크기와 파열','열혈 소년 배틀 클라이맥스'],
      ['섬세한 펜선·반짝이는 눈·화사한 톤','시선·손끝·머리카락의 감정적 제스처','부드러운 클로즈업·3/4·측면','꽃잎·반짝임·빛무리·리본·장미','우아한 손글씨와 장식 곡선','순정만화 감정 클라이맥스'],
      ['80~90년대 셀선·제한색·아날로그 필름/CRT','시대 특유의 큰 키포즈와 표정','레트로 TV 애니식 줌·팬·로우앵글','글로우·속도선·별빛·필름 노이즈·CRT 잔상','레트로 타이틀/비디오 자막풍 손글씨','8090 방송 셀 프레임'],
      ['반실사 3D 형태·영화적 조명·깊이','애니 영화식 자연스러운 체중 이동과 실루엣','렌즈감 있는 전신·반신·근접, 얕은 심도','볼류메트릭 빛·입자·글로우·3D 파티클','장면 조명과 깊이를 공유하는 입체 레터링','고품질 3D 애니 영화 프레임'],
      ['G펜·필압·스크린톤·정교한 해칭','출판만화 연속 컷처럼 시선·손·몸을 세밀하게 연기','근접·반신·전신, 사선·오버숄더·극단원근','스크린톤 배경·속도선·집중선·검정 번짐','출판만화 효과문자/손글씨','일본 출판 만화 원고 컷'],
      ['펠트 섬유·점토 손자국·말랑한 입체','스톱모션 인형처럼 물성이 느껴지는 관절 포즈','미니어처 매크로·낮은 시점·얕은 심도','점토/펠트 하트·별·땀·먼지·충격','점토 성형/천 패치 입체 글자','수공예 스톱모션 세트'],
      ['왁스 입자·거친 크레파스 선·눌러 그은 흔적','아이 낙서처럼 자유롭고 과감한 몸짓','평면적 자유 배치·삐뚤어진 구도','크레파스 별·구름·화살표·휘갈김','크레파스로 직접 쓴 삐뚤한 글씨','종이에 세게 그린 크레파스 낙서'],
      ['레트로 픽셀·글리터·메탈/젤리 하이라이트','셀카·댄스·브이 등 통통 튀는 Y2K 포즈','스티커북식 비스듬한 크롭·근접·겹침','픽셀 하트·별·글리터·체인·크롬','버블/픽셀/크롬 Y2K 레터링','2000년대 디지털 다이어리'],
      ['거칠고 단순한 선·일부러 어색한 비례','망가진 자세·뜬금 정지·과장표정의 병맛 타이밍','정면 클로즈업·급줌·과도한 크롭','땀·충격선·물음표·저예산 폭발·왜곡','급히 쓴 굵은 밈 자막, 찌그러진 배치','의도적으로 웃긴 짤툰/밈'],
      ['두꺼운 오일파스텔 입자·문지른 가장자리·종이결','포근한 동화식 제스처와 큰 감정','여백 있는 안정적 전신·반신·부드러운 근접','파스텔 별·꽃·구름·빛 번짐·색가루','오일파스텔 손글씨, 두께·번짐·색겹침','따뜻한 오일파스텔 그림책'],
      ['거친 먹선·강한 필압·갈필·고대비','보법·장세·포권·회피·기세 실린 몸축, 현대복도 옷자락과 머리카락이 무협식으로 흐름','로우앵글·사선·극단원근·전경 손발·전신동세','장풍·검기·기류·바람·먹비산·잔상·속도선·먼지','붓·먹·검획 레터링, 장풍과 몸의 동세 방향 공유','문구 전에 옷자락·기세·장풍·먹선만으로 정통 무협임이 보여야 함'],
      ['민화/동양화 평면선·전통 안료색·한지','전통 회화 인물처럼 절제된 상징 제스처','평면 시점·여백·상징적 균형 배치','구름문·연꽃·학·바람결·전통문양','붓글씨/민화 문자, 여백과 획 균형','전통 병풍·민화 한 폭'],
      ['먹 농담·발묵·담채번짐·한지여백','적은 선으로 무게중심과 감정 암시','넓은 여백·비대칭·원근보다 호흡','먹번짐·바람·물결·안개·옅은 기운','담묵 붓글씨, 농담·속도·여백 변화','먹과 여백의 수묵 호흡'],
      ['니트짜임·자수실밥·펠트패치·스티치','천 인형/와펜 같은 포근한 제스처','패브릭 보드식 평면~약입체 배치','수놓은 하트·별·땀·움직임선','실밥 자수/천 패치 레터링','실제 자수 패치 작품의 촉감'],
      ['목판/실크스크린 잉크·제한색·찍힘과 번짐','강한 실루엣·단순화된 판화식 제스처','포스터식 정면·사선·큰 면 분할','잉크번짐·롤러자국·판화파편·방사선','새기거나 인쇄한 굵은 레터링','손으로 찍은 목판/실크스크린 포스터'],
      ['반투명 젤리·유리·내부반사·굴절','눌리고 튀는 탄성 있는 3D 포즈','매크로 제품촬영식 근접·낮은시점·얕은심도','젤리방울·유리파편·굴절·글로우·투명입자','젤리/유리 성형 입체글자, 반사·굴절 공유','투명 3D 오브젝트 촬영 세트'],
      ['얇은 단색 볼펜선·연속 컨투어·넓은여백','최소선으로 자세와 감정을 포착','단순 정면·측면·3/4, 원근 절제','짧은선·작은별·화살표·진동선 최소효과','같은 볼펜으로 쓴 자연스러운 손글씨','선 리듬만으로 보이는 원라인 드로잉'],
      ['둥근 덩어리·플랫컬러·말랑한 모찌실루엣','눌리고 늘어나고 튀는 찹쌀떡 탄성','정면·3/4 중심, 몸변형이 보이는 전신','말랑한 하트·별·땀·탄성선·눌림','통통한 플랫 손글씨도 살짝 눌리고 늘어남','실루엣만으로 모찌/찹쌀떡 세계'],
      ['하이틴 컬러·스티커테두리·글리터·체크·하트','셀카·댄스·브이·도도한 키치 포즈','폴라로이드/다이어리식 비스듬한 크롭과 겹침','글리터·체커·하트·별·리본·크롬','버블·낙서·크롬·스티커 레터링','하이틴 Y2K 다이어리/스티커북'],
      ['단순 밈 드로잉·맑고 어색한 눈의 강한 대비','정지시선·뜬금 제스처·갑작스런 과장','정면클로즈업·과도한줌·갑작스런전신','침묵선·땀·물음표·정적배경·충격선','큰 짤방자막도 표정 타이밍에 맞춰 위치·기울기 변화','문구 없이도 맑눈광 개그 짤방'],
      ['연필·흑연선·문지른 그라파이트·종이결','크로키식 자연스러운 체중이동과 섬세한 표정','여백 있는 반신·전신·근접 스케치','흑연가루·스머지·짧은동세선·지우개빛','연필 손글씨, 압력·진하기·번짐 변화','흑연과 종이만으로 보이는 감성 드로잉'],
    ];

    const en = [
      ['rounded 2D lines, bright flat color, cel shading','elastic clear cartoon gestures','front/three-quarter with mild high/low angles','drawn hearts, stars, sweat and motion marks','lively rounded hand lettering with emotional scale/tilt','cheerful 2D animation frame'],
      ['crisp digital line art, modern color, restrained cel shading','clear webtoon gaze, hand and body-direction acting','close/medium/full with diagonal, over-shoulder and low angles','webtoon focus lines, speed lines, emotion fields and light','webtoon SFX/handwriting with weight and scale shifts','modern Korean webtoon panel'],
      ['rough pen, marker and doodle line on paper','improvised playful exaggeration','flat framing with crooked angles and loose crops','arrows, stars, clouds and scribbles','wobbly handwritten doodle lettering','living sketchbook doodle'],
      ['transparent watercolor wash, wet bleed, paper grain','soft flexible nuanced gesture','breathing negative-space close/medium framing','water blooms, petals, light stains and brush ripples','watery brush lettering with bleed/value variation','wet-paper watercolor breathing'],
      ['layered colored pencil and warm paper tooth','storybook-readable face and hand gesture','stable child-eye-level full/medium shots','colored-pencil stars, flowers, clouds and props','colored-pencil handwriting with pressure changes','warm picture-book illustration'],
      ['cel-animation line, limited palette, vintage film texture','classic key poses and large readable expressions','front/profile/low-angle with bold crops','smear motion, speed lines, sparkles and film flare','hand-painted title-card lettering','vintage cel-animation frame'],
      ['smooth vector contours, simple geometry, limited flat palette','minimal icon-like gesture','clean front/three-quarter balanced framing','simple lines, dots and geometric effects','clean vector lettering with scale/placement shifts','minimal brand-character system'],
      ['primary-color contrast, thick graphic outlines, color blocks','large exaggerated acting','bold close-up, diagonal and extreme crop','Ben-Day dots, starbursts and graphic impact lines','large pop-art/comic SFX lettering','strong pop-art poster'],
      ['heavy black ink, dramatic shadow and hatching','heroic silhouette with strong weight transfer','low angle, extreme perspective and foreshortening','impact lines, bursts, explosions and ink debris','heavy ink SFX with compressed/expanded forms','classic comic-book action panel'],
      ['pixel forms, limited palette, dot shading','sprite-like keyframe motion','2D game front/profile views','pixel particles, hearts, stars and impact frames','pixel/dot lettering','game sprite sheet'],
      ['torn paper, colored stock, print and adhesive traces','cut-and-folded graphic posing','flat scrapbook layers, overlaps and tilts','paper stars, tape, stamps and tears','cutout/magazine/handwritten lettering','physical paper collage'],
      ['rough print ink, halftone, registration offset, aged paper','clear vintage-comic exaggeration','flat panels, bold crops, limited perspective','ink bleed, bursts, hatching and halftone','old-comic printed SFX lettering','aged printed-comic materiality'],
      ['black ink, screentone, hatching and solid blacks','tone/line-driven tension and gaze','close, diagonal, low-angle and full-body rhythm','focus lines, speed lines, dark aura, screentone','black-ink SFX/handwriting','published monochrome manga'],
      ['forceful rough ink and black masses','extreme sprint/strike/block/shout key poses','low angle, diagonal, extreme perspective and foreshortening','speed lines, shockwaves, energy bursts, dust, afterimages','aggressive brush/ink SFX','shonen battle climax'],
      ['delicate pen, sparkling eyes and luminous decoration','gaze, fingertip and hair-flow emotional acting','soft close, three-quarter and profile framing','petals, sparkles, halos, ribbons and roses','elegant handwritten decorative lettering','shojo emotional climax'],
      ['80s–90s cel line, limited color, analog film/CRT','era-specific large key poses','retro TV zoom, pan and low-angle staging','glow, speed lines, star light, film noise, CRT trails','retro title/video-caption lettering','80s–90s broadcast cel frame'],
      ['semi-realistic 3D, cinematic lighting and depth','animated-feature natural weight transfer','lens-aware full/medium/close with shallow depth','volumetric light, particles, glow and 3D FX','dimensional lettering sharing scene light/depth','premium 3D animated-film frame'],
      ['G-pen, pressure variation, screentone and refined hatching','detailed sequential-manga face/gaze/hand/body acting','close/medium/full, diagonal, over-shoulder, extreme perspective','screentone fields, speed/focus lines and black accents','published-manga SFX/handwriting','Japanese printed-manga manuscript panel'],
      ['felt fiber, clay fingerprints and soft dimensional form','tactile stop-motion joint posing','macro miniature camera, low view, shallow depth','physical clay/felt hearts, stars, sweat and dust','sculpted clay/cut-fabric lettering','handcrafted stop-motion set'],
      ['wax grain, rough crayon line and pressed marks','free childlike gesture','flat loose crooked composition','crayon stars, clouds, arrows and scribbles','crooked crayon handwriting','hard-pressed crayon on paper'],
      ['retro pixels, glitter, chrome/jelly highlights','bouncy selfie/dance/peace Y2K poses','tilted sticker-book crops and overlaps','pixel hearts, stars, glitter, chain and chrome','bubble/pixel/chrome Y2K lettering','2000s digital diary'],
      ['rough simple drawing and intentionally awkward proportion','broken poses and absurd meme timing','front close-up, sudden zoom and excessive crop','sweat, shock, question marks, cheap explosions','thick hastily handwritten meme captions','intentionally ridiculous reaction meme'],
      ['thick oil-pastel grain, rubbed edges and warm paper','soft storybook gesture','airy stable full/medium with gentle close views','pastel stars, flowers, clouds and pigment dust','oil-pastel handwriting with smudge/layering','warm oil-pastel storybook'],
      ['rugged dry-brush ink, pressure change and stark contrast','martial footwork, palm forms, salutes and evasions; modern clothes and hair still whip with wuxia force','low angle, diagonal, extreme perspective, foreground hands/feet, full-body motion','qi blasts, sword-like energy, wind, ink spray, afterimages, speed lines and dust','brush/ink/sword-stroke lettering aligned with qi and body motion','garment flow, qi and ink energy must read as wuxia before the phrase'],
      ['flat traditional East Asian line, mineral-like color and hanji','restrained symbolic traditional gesture','flat perspective with balanced negative space','cloud motifs, lotus, cranes, wind curls and patterns','brush-calligraphic folk-art lettering','traditional folding-screen/minhwa composition'],
      ['ink value, bloom, light color and hanji negative space','restrained few-mark gesture','wide asymmetrical breathing composition','ink bloom, wash wind, ripples, mist and pale energy','light-ink brush lettering with value/speed variation','ink-and-negative-space breathing'],
      ['knit weave, embroidery thread, felt patch and stitching','cozy sewn-doll gestures','textile-board flat to mild depth staging','embroidered hearts, stars, sweat and motion lines','thread-embroidered/cut-fabric lettering','tactile embroidered patchwork'],
      ['rough woodcut/silkscreen ink, limited color and stamping','large simplified carved silhouette gesture','poster-like frontal/diagonal flat divisions','ink bleed, roller marks, chips and radiating carved lines','heavy carved/screen-printed lettering','hand-pressed woodcut/silkscreen poster'],
      ['translucent jelly/glass, reflection and refraction','elastic squash/stretch 3D posing','macro product-photo close/low views with shallow depth','jelly drops, glass shards, refraction, glow, transparent particles','3D jelly/glass lettering sharing reflections and shadows','photographed transparent 3D object set'],
      ['thin monochrome ballpoint, continuous contour, whitespace','minimal gesture-sketch acting','simple front/profile/three-quarter restrained perspective','tiny lines, stars, arrows and vibration marks','same-pen natural handwriting','one-line drawing visible through line rhythm'],
      ['rounded masses, flat color and soft mochi silhouette','squash/stretch/bounce like rice dough','simple front/three-quarter with full-body deformation','soft hearts, stars, sweat and elasticity marks','plump flat handwriting that also squashes slightly','soft mochi world from silhouette alone'],
      ['teen color, sticker outlines, glitter, checks and hearts','kitsch selfie/dance/peace/aloof posing','tilted Polaroid/diary crops and overlaps','glitter, checker, heart, star, ribbon and chrome','bubble/doodle/chrome/sticker lettering','teen Y2K diary/sticker-book'],
      ['simple meme drawing with clear awkward eyes','frozen stare, odd gesture and sudden exaggeration','front close-up, excessive zoom, sudden full-body cut','silence lines, sweat, question marks and sudden impact','large reaction-caption lettering serving facial timing','clear-eyed reaction meme even without text'],
      ['pencil/graphite, rubbed graphite, paper grain','natural sketchbook weight shift and subtle expression','airy medium/full/close sketch framing','graphite dust, smudge, short motion strokes and eraser light','pencil handwriting with pressure/darkness changes','graphite-on-paper emotional drawing'],
    ];

    const p = (isKo ? ko : en)[Math.min(idx, 33)];
    if (!p) return '';
    const heading = isKo ? '[화풍 전용 5축 연출 프리셋]' : '[STYLE-SPECIFIC FIVE-AXIS DIRECTION PRESET]';
    const signalLabel = isKo ? '즉시 인지 신호' : 'Instant recognition signal';
    const guard = isKo
      ? '이 프리셋은 문구 의미보다 우선합니다. 문구는 이 화풍의 몸짓·카메라·효과·문자 언어 안에서만 연기하며 일반 스티커 포즈나 범용 폰트로 되돌아가지 마세요.'
      : 'This preset outranks phrase semantics. Perform the phrase only through this style’s gesture, camera, effects and lettering language; never fall back to generic sticker posing or stock typography.';
    return heading + '\\n- Rendering: ' + p[0] + '\\n- Acting: ' + p[1] + '\\n- Camera: ' + p[2] + '\\n- Effects: ' + p[3] + '\\n- Typography: ' + p[4] + '\\n- ' + signalLabel + ': ' + p[5] + '\\n- ' + guard;
  };

${marker}`;

      out = replaceOnce(out, marker, helper, 'preset helper injection');

      const foundReturn = "      return `${base} ${isKo ? stickerFinishKo : stickerFinishEn}`;";
      const foundReplacement = "      return `${base} ${getFiveAxisStylePreset(styleTag, isKo)} ${isKo ? stickerFinishKo : stickerFinishEn}`;";
      out = replaceOnce(out, foundReturn, foundReplacement, 'mapped style return');

      const fallbackReturn = "    return `${styleTag}. ${isKo ? stickerFinishKo : stickerFinishEn}`;";
      const fallbackReplacement = "    return `${styleTag}. ${getFiveAxisStylePreset(styleTag, isKo)} ${isKo ? stickerFinishKo : stickerFinishEn}`;";
      out = replaceOnce(out, fallbackReturn, fallbackReplacement, 'fallback style return');

      return { code: out, map: null };
    },
  };
}
