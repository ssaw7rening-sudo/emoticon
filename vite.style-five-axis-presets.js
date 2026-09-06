const TARGET = '/src/App.jsx';

const replaceOnce = (source, marker, replacement, label) => {
  const first = source.indexOf(marker);
  if (first < 0) throw new Error(`[style-five-axis-presets] ${label} marker not found`);
  if (source.indexOf(marker, first + marker.length) >= 0) {
    throw new Error(`[style-five-axis-presets] ${label} marker is not unique`);
  }
  return source.slice(0, first) + replacement + source.slice(first + marker.length);
};

export function styleFiveAxisPresetsPlugin() {
  return {
    name: 'style-five-axis-presets',
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
    let styleIndex = -1;
    for (const group of groups) {
      const foundIndex = group.indexOf(styleTag);
      if (foundIndex >= 0) {
        styleIndex = foundIndex;
        break;
      }
    }
    if (styleIndex < 0) styleIndex = 0;

    const koPresets = [
      ['둥글고 또렷한 2D 라인, 밝은 플랫컬러, 부드러운 셀 셰이딩', '작고 명확한 몸짓과 표정 과장, 탄력 있는 포즈', '정면·3/4·가벼운 로우/하이앵글을 섞되 작은 화면 가독성 우선', '손그림 하트·별·땀·움직임선 등 2D 카툰 기호', '둥글고 생동감 있는 손글씨형 레터링, 감정별 크기·기울기·baseline 변화', '한눈에 명랑한 2D 캐릭터 애니메이션 컷처럼 보여야 함'],
      ['깔끔한 디지털 라인아트, 현대적 색감, 절제된 셀 셰이딩', '웹툰 컷처럼 시선·손·몸의 방향을 분명히 하고 감정을 선명하게 연기', '세로 스크롤 웹툰의 컷 감각을 가져온 근접·반신·전신, 사선·오버숄더·로우앵글', '속도선·집중선·빛·감정 배경을 정돈된 웹툰 그래픽 언어로 사용', '웹툰 효과문자와 손글씨 말맛, 감정에 따라 굵기·크기·기울기 변화', '문구를 가려도 현대 한국 웹툰의 한 컷처럼 보여야 함'],
      ['거칠고 자유로운 펜·마커·낙서선, 종이 위 즉흥 손맛', '정교한 해부보다 즉흥적이고 장난스러운 제스처와 과장', '평면적 구도를 기본으로 필요할 때 삐뚤어진 시점과 자유로운 크롭', '화살표·별·구름·휘갈김·낙서 아이콘을 같은 손그림 선으로 추가', '삐뚤빼뚤 손으로 쓴 낙서 글씨, 글자가 몸짓처럼 흔들리고 튐', '완성된 디지털 스티커보다 스케치북 낙서가 살아 움직이는 느낌'],
      ['투명한 워시, 물 번짐, 종이결, 공기감 있는 파스텔', '힘을 과도하게 주지 않은 유연한 몸짓과 섬세한 표정 변화', '여백을 살린 부드러운 근·중경 구성, 과격한 원근보다 흐르는 시선', '물감 번짐·색 번짐·옅은 꽃잎·빛 얼룩·붓물결로 감정 표현', '물붓으로 쓴 듯한 투명한 레터링, 번짐·농담·여백을 감정에 맞게 조절', '문구보다 먼저 젖은 종이와 수채의 호흡이 느껴져야 함'],
      ['색연필 겹침, 종이결, 부드러운 채색 흔적과 따뜻한 선', '동화책 등장인물처럼 순하고 읽기 쉬운 제스처, 감정은 표정과 손동작으로 명확히', '아이 눈높이의 안정된 시점, 전신과 반신을 포근하게 배치', '손으로 그린 별·꽃·구름·선·작은 소품을 색연필 질감으로 표현', '색연필로 눌러 쓴 손글씨, 압력·색 겹침·크기를 감정에 맞게 변화', '한 장면만 봐도 따뜻한 그림책 삽화로 인식되어야 함'],
      ['셀 애니메이션 선, 제한 팔레트, 빈티지 필름/셀 질감', '고전 애니 특유의 명확한 키포즈와 큰 표정, 실루엣이 읽히는 동작', '고전 TV 애니의 컷처럼 정면·측면·로우앵글과 강한 크롭을 교차', '스미어 프레임·속도선·반짝임·필름 플레어를 레트로 셀 방식으로', '수작업 타이틀 카드 같은 레터링, 시대감 있는 굵기와 기울기', '현대 벡터가 아니라 셀 애니 한 프레임 같은 시대감이 먼저 보여야 함'],
      ['매끈한 벡터 윤곽, 단순 기하 형태, 제한된 플랫컬러', '최소한의 형태 변화로 감정을 명확히 전달하는 아이콘성 제스처', '정돈된 정면·3/4와 균형 잡힌 여백, 과한 원근은 절제', '단순 선·점·기하 도형·플랫 아이콘으로만 효과 구성', '깨끗한 벡터 레터링이되 감정별 크기·배치·각도 변화, 장식 과밀 금지', '한눈에 브랜드 아이콘/미니멀 캐릭터 시스템처럼 정돈되어야 함'],
      ['강한 원색 대비, 굵은 그래픽 외곽선, 컬러 블록과 인쇄 패턴', '과장된 표정·팔다리·포즈로 에너지를 크게 밀어붙임', '대담한 클로즈업·사선·극단적 크롭과 포스터식 구도', '벤데이 도트·폭발형 별·컬러 버스트·그래픽 충격선', '팝아트 헤드라인/코믹 SFX처럼 크고 대담한 레터링', '문구를 읽기 전부터 팝아트 포스터의 강한 그래픽 충격이 보여야 함'],
      ['굵은 검정 잉크선, 극적인 그림자 면, 해칭과 강한 대비', '영웅적 실루엣, 강한 체중 이동, 주먹·손·몸을 과장한 코믹 액션', '로우앵글·극단적 원근·포어쇼트닝·표지 일러스트 구도', '충격선·방사선·폭발 버스트·잉크 파편을 고전 코믹 문법으로', '굵은 잉크 효과문자, 압축/확장된 자형과 강한 경사', '그림만 봐도 미국 코믹북 표지나 액션 패널처럼 보여야 함'],
      ['픽셀 단위 형태, 제한 팔레트, 계단형 윤곽과 도트 명암', '스프라이트 애니메이션의 키프레임처럼 단순하지만 명확한 동작', '2D 게임 화면식 정면/측면 시점과 제한된 원근', '픽셀 파티클·별·하트·충격 프레임·8비트 이펙트', '픽셀 폰트/도트 레터링, 감정별 크기와 흔들림도 픽셀 단위로', '고해상도 일러스트가 아니라 게임 스프라이트 세트처럼 보여야 함'],
      ['찢은 종이, 인쇄물, 색지, 접착 흔적의 레이어드 콜라주', '종이 조각을 배치·접은 듯한 단순하고 그래픽한 몸짓', '스크랩북처럼 평면 레이어와 겹침, 일부 요소는 비스듬히 배치', '종이 별·테이프·스탬프·찢김·컷아웃 파편', '오려 붙인 글자·손글씨·잡지 타이포 조각을 한 재료 세계로 통일', '실제 종이 조각을 붙여 만든 한 장의 콜라주처럼 보여야 함'],
      ['거친 인쇄 잉크, 망점, 색 어긋남, 빈티지 종이 질감', '옛 인쇄 만화 특유의 명확하고 약간 과장된 제스처', '평면 패널 구도와 강한 크롭, 제한된 원근', '인쇄 번짐·별모양 버스트·해칭·망점 효과', '옛 만화 제목/효과문자처럼 인쇄 잉크가 번진 레터링', '현대 디지털 선명함보다 낡은 인쇄 만화의 물성이 먼저 느껴져야 함'],
      ['정교한 흑백 잉크, 스크린톤, 해칭, 검정 면의 대비', '톤과 선으로 감정·근육 긴장·시선 변화를 강하게 표현', '만화 패널식 클로즈업·사선·로우앵글·전신을 리듬 있게 교차', '집중선·속도선·검은 오라·스크린톤 패턴', '검정 잉크 효과문자와 손글씨, 흑백 명암 안에서 감정별 강약 변화', '컬러 없이도 출판 흑백 만화의 한 장면으로 즉시 읽혀야 함'],
      ['거친 먹선, 강한 필압, 검은 면과 속도선', '전력 질주·타격·방어·포효 등 극단적 키포즈와 강한 체중 이동', '로우앵글·사선·극단적 원근·손발 포어쇼트닝을 적극 사용', '속도선·충격파·에너지 폭발·먼지·잔상', '공격적인 붓/잉크 효과문자, 크기 폭발·기울기·파열감', '문구를 가려도 열혈 소년 배틀 장면의 긴장과 폭발력이 보여야 함'],
      ['섬세한 펜선, 반짝이는 눈, 화사한 톤과 장식적 하이라이트', '섬세한 시선·손끝·머리카락 흐름, 로맨틱하고 감정적인 제스처', '부드러운 클로즈업·3/4·측면, 얼굴과 손을 감정 중심으로 배치', '꽃잎·반짝임·빛무리·리본·장미·감정 배경을 순정만화식으로', '우아한 손글씨와 장식적 곡선, 감정에 따라 흐름·간격·크기 변화', '한눈에 순정만화의 감정 클라이맥스 컷처럼 보여야 함'],
      ['80~90년대 셀 애니 선, 제한 색감, 아날로그 필름/CRT 감성', '시대 특유의 크게 끊기는 키포즈와 표정, 실루엣 중심 동작', '레트로 TV 애니의 줌·팬·로우앵글·정면 구도를 재현', '아날로그 글로우·속도선·별빛·필름 노이즈·CRT 잔상', '레트로 타이틀/비디오 자막 감성의 손그림 레터링', '현대 애니보다 80~90년대 방송 셀 프레임의 시대감이 먼저 보여야 함'],
      ['반실사 3D 형태, 부드러운 피부/재질, 영화적 조명과 깊이', '애니메이션 영화처럼 명확한 실루엣과 자연스러운 체중 이동', '렌즈감 있는 전신·반신·클로즈업, 얕은 심도와 시네마틱 앵글', '볼류메트릭 빛·입자·글로우·3D 파티클을 장면에 자연스럽게 통합', '3D 장면 안에 실제 입체 그래픽처럼 존재하는 레터링, 조명과 깊이를 공유', '평면 스티커보다 고품질 3D 애니메이션의 한 프레임처럼 보여야 함'],
      ['G펜 잉크, 필압 변화, 스크린톤, 정교한 해칭과 검정 면', '출판 만화의 연속 컷처럼 표정·시선·손·몸의 동작을 세밀하게 연기', '패널 컷 감각의 근접·반신·전신, 사선·오버숄더·극단적 원근', '스크린톤 감정 배경·속도선·집중선·검정 번짐', '출판 만화 효과문자/손글씨처럼 잉크와 톤 세계에 통합', '한 컷만 봐도 일본 출판 만화 원고처럼 느껴져야 함'],
      ['펠트 섬유, 점토 손자국, 말랑한 입체, 매크로 스튜디오 조명', '스톱모션 인형처럼 관절이 약간 끊기고 물성이 느껴지는 과장 포즈', '미니어처 세트를 촬영한 듯한 매크로 렌즈·낮은 시점·얕은 심도', '점토/펠트로 만든 하트·별·땀·먼지·충격 소품', '실제 점토를 빚거나 천을 오려 붙인 입체 글자, 같은 조명과 그림자 공유', '디지털 그림이 아니라 손으로 만든 스톱모션 세트처럼 보여야 함'],
      ['왁스 입자, 거친 크레파스 선, 종이에 눌러 그은 흔적', '어린아이 낙서처럼 자유롭고 과감한 몸짓, 비례보다 감정 우선', '평면적이고 자유로운 배치, 일부러 삐뚤어진 구도 허용', '크레파스 별·구름·화살표·휘갈김·색 덩어리', '크레파스로 직접 쓴 삐뚤한 글씨, 압력·색·크기 변화를 크게', '디지털 선이 아니라 종이에 세게 그린 크레파스 낙서가 먼저 보여야 함'],
      ['레트로 픽셀, 글리터, 메탈/젤리 하이라이트와 Y2K 장식', '통통 튀는 셀카·댄스·브이·과장 포즈를 Y2K 감성으로 재해석', '하이틴 스티커북처럼 비스듬한 크롭·근접·겹침을 적극 사용', '픽셀 하트·별·글리터·체인·크롬·스파클 효과', '버블/픽셀/크롬 계열의 Y2K 레터링, 글리터와 하이라이트 통합', '2000년대 디지털 다이어리/스티커북 감성이 즉시 보여야 함'],
      ['거칠고 단순한 선, 일부러 어색한 비례와 저예산 밈 질감', '과장된 표정·망가진 자세·뜬금없는 정지 포즈 등 병맛 타이밍', '정면 클로즈업·급작스런 줌·과도한 크롭 등 짤방식 카메라', '땀·충격선·물음표·저예산 폭발·왜곡을 의도적으로 과장', '손으로 급히 쓴 듯한 굵은 밈 자막, 감정 타이밍에 맞춰 찌그러짐', '잘 그린 일반 카툰보다 의도적으로 웃긴 짤방의 타이밍이 먼저 보여야 함'],
      ['오일파스텔의 두꺼운 입자, 문지른 가장자리, 따뜻한 종이결', '동화 속 인물처럼 부드럽고 포근한 제스처, 감정은 크게 읽히되 공격적이지 않게', '여백을 살린 안정적 전신·반신, 낮은 시점과 부드러운 근접을 섞음', '파스텔 별·꽃·구름·빛 번짐·색가루', '오일파스텔로 눌러 쓴 손글씨, 두께·번짐·색 겹침으로 감정 표현', '한눈에 따뜻한 오일파스텔 그림책의 한 장면처럼 보여야 함'],
      ['거친 먹선, 강한 필압 변화, 갈필과 강한 흑백 대비', '보법·장세·포권·회피·기세를 싣는 몸의 축, 현대복도 무협식으로 휘날리고 긴장', '로우앵글·사선·극단적 원근·전경 손발·전신 동세를 적극 사용', '장풍·검기·기류·바람·먹 비산·잔상·속도선·먼지', '붓·먹·검획 계열 레터링, 글자의 획과 배치가 장풍/몸의 동세와 같은 방향을 공유', '문구를 읽기 전에 옷자락·기세·장풍·먹선만으로 정통 무협 장면임이 보여야 함'],
      ['민화/동양화의 평면적 선, 전통 안료색, 한지 질감과 장식 문양', '전통 회화 속 인물처럼 절제되고 상징적인 손짓과 자세', '평면적 시점과 여백, 화면 안의 균형과 상징적 배치를 중시', '구름문·연꽃·학·바람결·전통 문양을 그림의 일부로 활용', '붓글씨/민화 문자 느낌, 여백과 획의 균형을 살린 배치', '현대 카툰보다 전통 병풍·민화 한 폭의 조형감이 먼저 보여야 함'],
      ['먹의 농담, 발묵, 담채 번짐, 한지 여백', '적은 선으로 무게중심과 감정을 암시하는 절제된 몸짓', '넓은 여백과 비대칭 구성, 먼 시점과 가까운 붓선의 대비', '먹 번짐·수묵 바람·물결·안개·옅은 기운', '담묵 붓글씨, 획의 농담·속도·여백으로 감정 표현', '문구를 가려도 먹과 여백의 호흡만으로 수묵담채화임이 보여야 함'],
      ['니트 짜임, 자수 실밥, 펠트 패치, 가장자리 스티치', '천 인형/와펜처럼 단순하고 포근한 제스처, 접힘과 봉제 구조가 느껴지는 포즈', '패브릭 보드 위에 배치한 듯한 평면·약간의 입체 시점', '실로 수놓은 하트·별·땀·움직임선, 패치 장식', '실밥으로 수놓거나 천 조각을 붙인 레터링, 스티치 방향과 감정을 연동', '디지털 선보다 실제 자수 패치 작품의 촉감이 먼저 보여야 함'],
      ['거친 목판/실크스크린 잉크, 제한 색, 찍힘과 번짐', '강한 실루엣과 단순화된 제스처, 판화처럼 형태를 크게 끊음', '포스터식 정면·사선과 큰 면 분할, 평면적 원근', '잉크 번짐·롤러 자국·판화 파편·방사형 선', '목판으로 새기거나 실크스크린 인쇄한 듯한 굵은 레터링', '현대 매끈함보다 손으로 찍은 포스터/판화의 압력이 느껴져야 함'],
      ['반투명 젤리·유리 재질, 내부 반사·굴절·클리어 하이라이트', '말랑하게 눌리고 튀어 오르는 탄성 있는 3D 몸짓', '매크로/제품 촬영 같은 근접·낮은 시점·얕은 심도와 반사 활용', '젤리 방울·유리 파편·빛 굴절·글로우·투명 파티클', '투명 젤리/유리로 성형된 입체 글자, 굴절·반사·그림자를 장면과 공유', '평면 그림이 아니라 투명한 3D 오브젝트 세트를 촬영한 느낌이어야 함'],
      ['얇은 단색 볼펜선, 연속 컨투어, 넓은 여백', '최소 선으로 자세와 감정을 포착하는 즉흥 제스처 드로잉', '여백 중심의 단순 정면·측면·3/4, 과도한 원근 금지', '짧은 선·작은 별·화살표·진동선 등 최소 표시만 사용', '같은 볼펜 한 자루로 쓴 자연스러운 손글씨, 선의 속도와 압력 공유', '색과 장식 없이 선의 리듬만으로 원라인 드로잉임이 보여야 함'],
      ['둥근 덩어리, 단순 플랫컬러, 말랑한 모찌 실루엣', '눌리고 늘어나고 튀는 찹쌀떡 같은 탄성 제스처', '정면·3/4 중심의 단순 구도, 몸 변형이 잘 보이는 전신 비중 확대', '말랑한 하트·별·땀·탄성선·눌림 자국', '통통한 플랫 손글씨, 글자도 살짝 눌리고 늘어나는 리듬', '형태만 봐도 모찌/찹쌀떡처럼 말랑하고 통통한 세계로 보여야 함'],
      ['하이틴 컬러, 스티커 테두리, 글리터·체크·하트·별 장식', '셀카·댄스·브이·도도한 포즈를 키치하게 과장', '폴라로이드/다이어리처럼 비스듬한 크롭과 레이어 겹침', '글리터·체커·하트·별·리본·크롬 아이콘을 하이틴 그래픽으로', '버블·낙서·크롬·스티커 레터링을 감정에 따라 섞되 같은 Y2K 세계 유지', '한눈에 하이틴 다이어리/키치 스티커북 감성이 보여야 함'],
      ['단순하지만 표정이 강한 밈 드로잉, 일부러 맑고 어색한 눈과 대비', '정지된 시선·뜬금없는 제스처·갑작스러운 과장으로 개그 타이밍 형성', '정면 클로즈업·과도한 줌·갑작스런 전신 등 짤방 컷 리듬', '침묵선·땀·물음표·정적 배경·갑작스런 충격선', '짤방 자막처럼 크고 직관적이되 표정 타이밍에 맞춰 위치·크기·기울기 변화', '문구 없이도 맑은 눈과 어색한 타이밍만으로 밈 이미지처럼 보여야 함'],
      ['연필·흑연 선, 문지른 그라파이트, 종이결과 지우개 흔적', '크로키처럼 자연스러운 체중 이동과 섬세한 표정, 선의 강약으로 감정 표현', '스케치북 인물 드로잉처럼 여백 있는 반신·전신·근접을 교차', '흑연 가루·스머지·짧은 동세선·지우개 빛 효과', '연필로 직접 쓴 손글씨, 압력·진하기·번짐으로 감정 변화', '컬러 장식 없이 흑연과 종이의 감성만으로 드로잉 세계가 보여야 함'],
    ];

    const enPresets = [
      ['clean rounded 2D linework, bright flat color, soft cel shading', 'small clear gestures with elastic expressive posing', 'mix front, three-quarter and mild high/low angles while preserving small-screen clarity', 'hand-drawn hearts, stars, sweat and motion marks in the same 2D cartoon language', 'rounded lively hand-lettering with emotional changes in scale, tilt and baseline', 'read instantly as a cheerful 2D character-animation frame'],
      ['crisp digital line art, modern color, restrained cel shading', 'clear webtoon acting through gaze, hands, body direction and readable facial beats', 'use webtoon-like close, medium and full shots with diagonal, over-shoulder and low angles', 'clean speed lines, focus lines, light and emotion backgrounds in webtoon grammar', 'webtoon SFX and handwritten lettering with emotional weight, scale and tilt shifts', 'read as a modern Korean webtoon panel before the phrase is read'],
      ['rough spontaneous pen, marker and doodle lines on paper', 'improvised playful gesture and exaggeration over anatomical precision', 'mostly flat composition with intentionally crooked angles and loose crops', 'arrows, stars, clouds, scribbles and doodle icons in the same hand-drawn line', 'wobbly handwritten doodle lettering that physically bounces with the gesture', 'feel like a sketchbook doodle coming alive, not a polished digital sticker'],
      ['transparent watercolor washes, wet bleeding, paper grain and airy pastel', 'soft flexible gesture and nuanced facial acting without excessive tension', 'breathing negative space with gentle close and medium compositions rather than aggressive perspective', 'water blooms, pigment bleeds, pale petals, light stains and brush ripples', 'watery brush lettering with controlled bleeding, value and negative space', 'make wet paper and watercolor breathing visible before the text'],
      ['layered colored pencil, paper tooth, warm visible strokes', 'storybook-friendly readable gesture with emotion carried by face and hands', 'stable child-eye-level framing with cozy full and medium shots', 'hand-drawn stars, flowers, clouds, lines and props in colored-pencil texture', 'colored-pencil handwriting with pressure, layering and scale tied to emotion', 'read immediately as a warm illustrated storybook scene'],
      ['cel-animation linework, limited palette, vintage film/cel texture', 'clear classic-animation key poses and large silhouette-readable expressions', 'alternate front, profile, low angle and bold crops like vintage TV animation', 'smear-frame motion, speed lines, sparkles and film flare in retro cel language', 'hand-painted title-card lettering with era-specific weight and tilt', 'feel like an actual vintage cel frame rather than modern vector art'],
      ['smooth vector contours, simple geometry, limited flat palette', 'minimal shape changes that communicate emotion through icon-like gesture', 'clean front/three-quarter framing with balanced whitespace and restrained perspective', 'simple lines, dots and geometric flat symbols only', 'clean vector lettering with emotional scale, placement and angle variation without clutter', 'read like a coherent minimal brand-character system'],
      ['strong primary-color contrast, thick graphic outlines, color blocks and print patterns', 'push exaggerated facial acting, limbs and posing for large graphic energy', 'bold close-ups, diagonals, extreme crops and poster-like composition', 'Ben-Day dots, starbursts, color bursts and graphic impact lines', 'large pop-art headline/comic-SFX lettering', 'deliver a pop-art poster hit before the words are read'],
      ['heavy black ink, dramatic shadow shapes, hatching and bold contrast', 'heroic silhouette, strong weight shift and exaggerated fists, hands and body action', 'low angles, extreme perspective, foreshortening and cover-art composition', 'impact lines, radiating bursts, explosions and ink debris', 'heavy ink SFX with compressed/expanded forms and aggressive slant', 'read like a classic comic-book cover or action panel at first glance'],
      ['pixel-built forms, limited palette, stepped edges and dot shading', 'simple but clear sprite-animation keyframes', '2D game-like front/profile views with limited perspective', 'pixel particles, stars, hearts, impact frames and 8-bit effects', 'pixel-font/dot lettering with emotion expressed at pixel scale', 'look like a game sprite sheet rather than high-resolution illustration'],
      ['layered torn paper, print fragments, colored stock and adhesive traces', 'graphic poses that feel cut, folded and assembled from paper pieces', 'flat scrapbook layering with overlaps and deliberately tilted elements', 'paper stars, tape, stamps, tears and cutout fragments', 'cutout letters, handwriting and magazine-type scraps unified in one material world', 'feel physically assembled from paper collage pieces'],
      ['rough print ink, halftone, registration offset and aged paper', 'clear slightly exaggerated gestures from vintage printed comics', 'flat-panel composition, bold crop and limited perspective', 'ink bleed, starbursts, hatching and halftone effects', 'old-comic title/SFX lettering with printed ink bleed', 'prioritize the material feel of aged printed comics over digital crispness'],
      ['precise black ink, screentone, hatching and solid-black contrast', 'use tone and line to intensify emotion, tension and gaze', 'rhythmic close, diagonal, low-angle and full-body manga framing', 'focus lines, speed lines, black aura and screentone patterns', 'black-ink SFX and handwriting with emotional value changes', 'read unmistakably as published monochrome manga even without color'],
      ['forceful rough ink, black masses and speed lines', 'extreme key poses for sprinting, striking, blocking and shouting with strong weight transfer', 'aggressive low angle, diagonal, extreme perspective and hand/foot foreshortening', 'speed lines, shockwaves, energy bursts, dust and afterimages', 'attack-like brush/ink SFX with explosive scale, tilt and fracture', 'show shonen battle tension and impact even with the text hidden'],
      ['delicate pen lines, sparkling eyes, luminous tone and decorative highlights', 'subtle gaze, fingertips, flowing hair and emotionally romantic gesture', 'soft close-up, three-quarter and profile framing centered on face and hands', 'petals, sparkles, halos, ribbons, roses and emotional backgrounds', 'elegant handwritten decorative lettering with emotional flow and spacing changes', 'read like the emotional climax of a shojo manga panel'],
      ['80s–90s cel lines, limited color, analog film/CRT atmosphere', 'era-specific strongly keyed poses and silhouette-first facial acting', 'recreate retro TV-animation zoom, pan, low angle and frontal staging', 'analog glow, speed lines, star light, film noise and CRT trails', 'retro title/video-caption inspired hand lettering', 'make the 80s–90s broadcast-cel era visible before modern anime cues'],
      ['semi-realistic 3D form, soft materials, cinematic lighting and depth', 'animated-feature acting with clear silhouette and natural weight transfer', 'lens-aware full, medium and close shots with shallow depth and cinematic angles', 'volumetric light, particles, glow and 3D effects integrated into space', 'lettering that exists as a lit 3D graphic sharing depth and shadows', 'feel like a premium 3D animated-film frame rather than flat sticker art'],
      ['G-pen ink, pressure variation, screentone, refined hatching and black shapes', 'detailed sequential-manga acting through face, gaze, hands and body movement', 'panel-like close, medium and full shots with diagonal, over-shoulder and extreme perspective', 'screentone emotion fields, speed lines, focus lines and black ink accents', 'published-manga SFX/handwriting integrated into ink and tone', 'read as an actual Japanese printed-manga manuscript panel'],
      ['felt fibers, clay fingerprints, soft dimensional forms and macro studio light', 'stop-motion-doll posing with slightly stepped joints and tactile weight', 'macro miniature-set camera, low viewpoints and shallow depth of field', 'hearts, stars, sweat, dust and impacts physically made from clay/felt', 'letters physically sculpted from clay or cut from fabric sharing scene light and shadow', 'feel like a handcrafted stop-motion miniature set'],
      ['wax grain, rough crayon line and pressed paper marks', 'free childlike gesture with emotion prioritized over proportion', 'flat loose placement with intentionally crooked composition allowed', 'crayon stars, clouds, arrows, scribbles and color masses', 'crooked crayon handwriting with large pressure, color and scale changes', 'show hard-pressed crayon on paper before any digital polish'],
      ['retro pixels, glitter, metallic/jelly highlights and Y2K decoration', 'bouncy selfie, dance, peace-sign and attitude poses reinterpreted through Y2K energy', 'teen sticker-book crops, tilts, close-ups and overlaps', 'pixel hearts, stars, glitter, chains, chrome and sparkle effects', 'bubble/pixel/chrome Y2K lettering integrated with glitter highlights', 'read instantly as a 2000s digital-diary/sticker-book aesthetic'],
      ['rough simplified drawing, intentionally awkward proportion and low-budget meme texture', 'broken poses, exaggerated faces and awkward pauses for absurd comic timing', 'front close-up, sudden zoom and excessive crop like reaction memes', 'sweat, shock lines, question marks, cheap explosions and distortion', 'thick hastily handwritten meme captions distorted to match comic timing', 'prioritize intentionally ridiculous meme timing over polished cartoon beauty'],
      ['thick oil-pastel grain, rubbed edges and warm paper texture', 'soft storybook gesture with large readable emotion but low aggression', 'breathing stable full/medium shots mixed with gentle low views and close-ups', 'pastel stars, flowers, clouds, light smears and pigment dust', 'oil-pastel handwriting using thickness, smudge and color layering for emotion', 'read immediately as a warm oil-pastel storybook scene'],
      ['rugged dry-brush ink, forceful pressure change, broken brush texture and stark contrast', 'martial footwork, palm forms, salutes, evasions and weight-bearing stances; even modern clothing must whip and tense like wuxia action', 'use low angle, diagonal, extreme perspective, foreground hands/feet and full-body motion', 'qi blasts, sword-like energy, wind flow, ink spray, afterimages, speed lines and dust', 'brush/ink/sword-stroke lettering whose direction follows the qi and body motion', 'before reading the phrase, garment flow, qi, ink energy and stance must already scream authentic wuxia'],
      ['flat traditional East Asian line, mineral-like color, hanji texture and decorative motifs', 'restrained symbolic gestures like figures in folk/traditional painting', 'flat perspective, breathing space, balanced and symbolic placement', 'cloud motifs, lotus, cranes, wind curls and traditional patterns', 'brush-calligraphic/folk-art lettering balanced with negative space', 'prioritize the composition of a traditional folding-screen or minhwa painting over modern cartoon cues'],
      ['ink value, ink bloom, transparent light color and hanji negative space', 'restrained gesture that implies weight and emotion with few marks', 'wide asymmetrical negative space contrasting distant view and close brush mark', 'ink bloom, wash wind, water ripples, mist and pale energy', 'light-ink brush calligraphy using value, speed and empty space emotionally', 'make ink and negative-space breathing identify the style before the phrase'],
      ['knit weave, embroidery thread, felt patch and visible edge stitching', 'simple cozy patch-doll gestures with folds and sewn structure visible', 'flat to mildly dimensional staging like pieces arranged on a textile board', 'embroidered hearts, stars, sweat, motion lines and patch ornaments', 'lettering embroidered with thread or cut from fabric, stitch direction tied to emotion', 'make tactile textile craft visible before any digital line quality'],
      ['rough woodcut/silkscreen ink, limited color, stamping and bleed', 'large simplified silhouette and gesture carved into bold shape masses', 'poster-like frontal/diagonal staging with large flat divisions', 'ink bleed, roller marks, print chips and radiating carved lines', 'heavy lettering carved or screen-printed into the same surface', 'feel hand-pressed like a woodcut/silkscreen poster rather than digitally smooth'],
      ['translucent jelly/glass material, internal reflection, refraction and clear highlights', 'elastic 3D posing that squashes, stretches and rebounds', 'macro/product-photography close and low views with shallow depth and reflections', 'jelly droplets, glass shards, refraction, glow and transparent particles', '3D translucent jelly/glass lettering sharing refraction, reflections and shadows', 'look like a photographed set of transparent 3D objects rather than flat art'],
      ['thin monochrome ballpoint line, continuous contour and generous negative space', 'gesture-sketch acting that captures pose and emotion with minimal marks', 'simple front/profile/three-quarter staging with whitespace and restrained perspective', 'minimal short lines, tiny stars, arrows and vibration marks', 'natural handwriting from the same ballpoint pen sharing speed and pressure', 'identify as one-line drawing through line rhythm alone without color decoration'],
      ['rounded masses, simple flat color and soft mochi silhouette', 'squash, stretch and bounce like sticky rice dough', 'simple front/three-quarter framing with more full-body views to show deformation', 'soft hearts, stars, sweat, elasticity lines and squash marks', 'plump flat handwriting whose forms also squash and stretch slightly', 'make the whole world visibly soft, round and mochi-like from silhouette alone'],
      ['teen color, sticker outlines, glitter, checks, hearts and star decoration', 'kitsch selfie, dance, peace-sign and aloof poses', 'tilted crops and layered overlaps like Polaroid/diary pages', 'glitter, checker, heart, star, ribbon and chrome teen graphics', 'bubble, doodle, chrome and sticker lettering mixed inside one Y2K world', 'read instantly as a kitsch teen diary/sticker-book aesthetic'],
      ['simple meme drawing with unusually clear awkward eyes and strong facial contrast', 'frozen stare, odd gesture and sudden exaggeration for reaction-image timing', 'front close-up, excessive zoom and sudden full-body cuts like meme panels', 'silence lines, sweat, question marks, dead-air backgrounds and sudden impact lines', 'large direct reaction-caption lettering whose placement and tilt serve the facial beat', 'look meme-ready from the clear-eyed awkward timing even without text'],
      ['pencil/graphite lines, rubbed graphite, paper grain and eraser traces', 'natural sketchbook weight shift and subtle expression drawn through pressure', 'alternate airy medium, full and close portrait-sketch framing', 'graphite dust, smudges, short motion strokes and erased-light accents', 'pencil handwriting using pressure, darkness and smudge for emotional variation', 'identify as graphite-on-paper drawing without relying on color decoration'],
    ];

    const preset = (isKo ? koPresets : enPresets)[Math.min(styleIndex, 33)];
    if (!preset) return '';
    const [rendering, acting, camera, effects, typography, signal] = preset;
    if (isKo) {
      return \
\`[화풍 전용 5축 연출 프리셋]
- Rendering: \${rendering}
- Acting: \${acting}
- Camera: \${camera}
- Effects: \${effects}
- Typography: \${typography}
- 즉시 인지 신호: \${signal}
- 이 프리셋은 문구의 의미보다 우선합니다. 문구는 이 화풍의 몸짓·카메라·효과·문자 언어 안에서만 연기하며, 일반 메신저 스티커 포즈나 범용 폰트로 되돌아가지 마세요.\`;
    }
    return \
\`[STYLE-SPECIFIC FIVE-AXIS DIRECTION PRESET]
- Rendering: \${rendering}
- Acting: \${acting}
- Camera: \${camera}
- Effects: \${effects}
- Typography: \${typography}
- Instant recognition signal: \${signal}
- This preset outranks phrase semantics. Perform the phrase only through this style's gesture, camera, effects and lettering language; never fall back to generic messenger-sticker poses or stock typography.\`;
  };

${marker}`;

      out = replaceOnce(out, marker, helper, 'preset helper injection');

      const foundReturn = `      return \\`${'${base}'} ${'${isKo ? stickerFinishKo : stickerFinishEn}'}\\`;`;
      const foundReplacement = `      return \\`${'${base}'} ${'${getFiveAxisStylePreset(styleTag, isKo)}'} ${'${isKo ? stickerFinishKo : stickerFinishEn}'}\\`;`;
      out = replaceOnce(out, foundReturn, foundReplacement, 'mapped style return');

      const fallbackReturn = `    return \\`${'${styleTag}'}. ${'${isKo ? stickerFinishKo : stickerFinishEn}'}\\`;`;
      const fallbackReplacement = `    return \\`${'${styleTag}'}. ${'${getFiveAxisStylePreset(styleTag, isKo)}'} ${'${isKo ? stickerFinishKo : stickerFinishEn}'}\\`;`;
      out = replaceOnce(out, fallbackReturn, fallbackReplacement, 'fallback style return');

      return { code: out, map: null };
    },
  };
}
