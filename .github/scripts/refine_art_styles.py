from pathlib import Path
import re

APP = Path('src/App.jsx')
text = APP.read_text(encoding='utf-8')
original = text

# Each matcher identifies an existing style family by the Korean expanded prompt.
# This updates every alias (KO/EN/JA/ZH) that shares the same underlying style text.
STYLE_RULES = [
    ('2D 카툰 스타일',
     '깔끔하고 둥글둥글한 외곽선과 단순하지만 생동감 있는 형태가 돋보이는 고품질 2D 카툰 스타일. 밝은 플랫컬러와 부드러운 셀 셰이딩을 사용하고, 작은 화면에서도 표정과 실루엣이 즉시 읽히도록 명확하게 정리하며 실사 질감과 과도한 입체 명암은 피하세요.',
     'high-quality cute 2D cartoon style with clean rounded outlines and simple lively shapes. Use bright flat colors with soft cel shading, keep expressions and silhouettes instantly readable at small size, and avoid photorealistic texture or overly volumetric rendering.'),
    ('웹툰/스마트툰',
     '깔끔한 디지털 라인아트와 또렷한 외곽선, 현대적인 색감과 선명한 표정 연출이 특징인 한국 웹툰 스타일. 부드러운 셀 셰이딩과 절제된 그라데이션을 사용해 감정을 한눈에 전달하고, 복잡한 브러시 질감보다 정돈된 형태와 색 분리를 우선하세요.',
     'clean Korean webtoon style with crisp digital line art, modern color treatment, and highly readable facial acting. Combine soft cel shading with restrained gradients, prioritize clear shape separation, and avoid overly painterly brush texture.'),
    ('B급 병맛',
     '굵고 투박한 자유로운 펜선과 일부러 어설픈 듯한 형태, 극도로 과장된 표정과 황당한 상황 연출이 살아있는 B급 병맛 웹툰/짤툰 스타일. 예쁘게 다듬기보다 웃음과 임팩트를 우선하고, 단순한 실루엣 안에서 개그 타이밍과 감정 왜곡을 과감하게 표현하세요.',
     'satirical B-grade meme-webtoon style with bold rough linework, intentionally awkward forms, hyper-expressive faces, and absurd comic staging. Prioritize humor and impact over prettification while keeping the silhouette simple and readable.'),
    ('핸드드로운 낙서',
     '삐뚤빼뚤한 손맛과 자연스러운 선 떨림이 살아있는 핸드드로운 낙서 일러스트 스타일. 선을 지나치게 정제하지 말고 유기적으로 흐르게 하며, 가벼운 연필 또는 파스텔 채색과 여백을 활용해 소박하고 따뜻한 아날로그 감성을 유지하세요.',
     'charming hand-drawn doodle style with organic imperfect strokes and natural line wobble. Keep the drawing intentionally unpolished, use light pencil or pastel fills with breathing room, and preserve a warm handmade analog feeling.'),
    ('크레파스와 오일파스텔',
     '포근한 종이결 위에 크레파스와 오일파스텔을 겹겹이 문질러 올린 듯한 따뜻한 동화책 일러스트 스타일. 부드러운 파스텔 색과 입자감, 손으로 문지른 가장자리와 자연스러운 색 겹침을 살리고, 매끈한 디지털 벡터나 플라스틱 광택은 피하세요.',
     'warm storybook illustration with layered crayon and oil-pastel pigment over soft paper grain. Preserve tactile grain, softly smudged edges, and natural color layering, while avoiding sterile vector smoothness or plastic gloss.'),
    ('갈필(마른 붓 터치)',
     '거친 먹선과 강한 필압 변화, 마른 붓의 갈필, 역동적인 동세와 기운의 흐름이 살아있는 정통 무협 만화 스타일. 옷자락과 머리카락, 검기와 속도선을 박력 있게 살리고 강한 흑백 대비로 비장한 카리스마를 표현하되 귀여운 일반 카툰 톤으로 평균화하지 마세요.',
     'authentic martial-arts wuxia comic style with rugged dry-brush ink, forceful pressure variation, dramatic motion, and flowing energy. Emphasize garments, hair, speed lines, and high-contrast heroic tension without averaging the result into a generic cute cartoon.'),
    ('전통 닥종이(한지)',
     '전통 한지의 섬유결과 또렷한 먹선 윤곽, 오방색과 광물 안료를 연상시키는 풍성한 전통 채색이 어우러진 고전 동양화·민화 스타일. 평면적이면서 장식적인 구성, 해학적인 표정과 상징성을 살리고 현대적인 셀 셰이딩이나 플라스틱 광택은 줄이세요.',
     'traditional Korean Minhwa and classical East Asian painting style with fibrous hanji texture, crisp ink contours, and rich mineral-pigment-inspired color. Favor decorative flat composition, symbolic humor, and handcrafted charm over modern cel shading or plastic gloss.'),
    ('먹물의 섬세한 농담',
     '먹의 섬세한 농담과 살아있는 붓압, 촉촉한 발묵과 투명한 담채 번짐, 넉넉한 여백이 조화를 이루는 서정적인 수묵담채화 스타일. 선과 색을 절제하면서도 생동감을 유지하고, 네온 컬러·딱딱한 벡터 윤곽·강한 디지털 광택은 피하세요.',
     'poetic East Asian sumi-e ink-wash style with nuanced ink gradation, expressive brush pressure, wet blooming, translucent light color washes, and generous negative space. Keep it restrained yet alive, avoiding neon color, rigid vector edges, or strong digital gloss.'),
    ('자수 실밥의 엠보싱',
     '도톰한 자수 실밥의 엠보싱과 실의 방향, 포근한 펠트·패브릭 섬유결, 가장자리 오버록 스티치가 실제로 만져질 듯한 핸드메이드 와펜 스타일. 평면 프린트처럼 보이지 않도록 실의 높낮이와 소재의 폭신함을 살리되 과도한 플라스틱 광택은 피하세요.',
     'handcrafted embroidered patch style with raised thread relief, visible stitch direction, soft felt and fabric fibers, and tactile overlock edging. Preserve plush material depth rather than flat print appearance, and avoid excessive plastic gloss.'),
    ('나무 판화의 요철',
     '나무판을 새겨 찍은 듯한 요철감과 거친 종이결, 제한된 레트로 색상, 살짝 어긋난 잉크 레이어가 살아있는 빈티지 목판화·실크스크린 스타일. 인쇄 오차와 잉크 번짐을 자연스럽게 남겨 아날로그 깊이를 만들고 지나치게 깨끗한 벡터 마감은 피하세요.',
     'vintage woodblock and silkscreen print style with carved relief texture, grainy paper, a limited retro palette, and subtly misregistered ink layers. Preserve natural print imperfections and ink bleed, avoiding an overly clean digital-vector finish.'),
    ('푸딩 젤리와 유리구슬',
     '말랑한 젤리와 유리구슬 같은 반투명 재질, 내부 반사와 빛 굴절, 맑은 클리어 코팅 하이라이트가 돋보이는 모던 3D 글래스모피즘 스타일. 탱글한 볼륨과 부드러운 스튜디오 조명을 유지하고, 평면 셀 채색이나 탁한 무광 재질로 바꾸지 마세요.',
     'modern glossy 3D jelly and glassmorphism style with translucent gummy material, internal reflections, luminous refraction, and clear coated highlights. Keep the volume squishy under soft studio lighting, avoiding flat cel shading or dull matte surfaces.'),
    ('단색 잉크 볼펜 한 줄',
     '최소한의 단색 볼펜 선과 연속적인 컨투어로 형태를 잡는 심플 원라인 드로잉 스타일. 얇고 자연스러운 선의 리듬과 여백으로 표정과 동작을 전달하고, 과도한 채색·굵은 카툰 외곽선·입체 음영을 배제해 세련된 스케치 감성을 유지하세요.',
     'minimal single-line ballpoint drawing style built from thin natural continuous contours and expressive negative space. Convey pose and emotion through line rhythm, avoiding heavy coloring, thick cartoon borders, or volumetric shading.'),
    ('찹쌀떡 질감',
     '쫀득한 찹쌀떡처럼 둥글고 통통한 실루엣과 극도로 단순한 얼굴 요소가 중심인 모찌 플랫 스타일. 따뜻한 파스텔 플랫컬러와 최소한의 음영으로 말랑함을 표현하고, 복잡한 디테일이나 사실적인 재질 표현은 줄이세요.',
     'ultra-simple mochi flat style with plump rounded silhouettes and minimal facial features. Use warm pastel flat color with only subtle shading to suggest softness, avoiding busy detail or realistic material rendering.'),
    ('비비드 네온 컬러와 키치한',
     '하이틴 다꾸 감성과 키치한 비비드 컬러, 하트·리본·별·글리터 같은 장식이 어우러진 Y2K 스티커 스타일. 꾸민 느낌은 분명하게 살리되 캐릭터 실루엣과 얼굴은 선명하게 유지하고, 장식이 표정이나 주요 형태를 가리지 않게 하세요.',
     'kitsch high-teen Y2K sticker style with vivid color, scrapbook energy, hearts, ribbons, stars, and glitter accents. Keep the decoration bold while preserving a clear character silhouette and unobstructed facial expression.'),
    ('광기의 표정',
     '해맑고 멍한 눈빛과 묘하게 진지한 표정, 황당한 상황의 대비가 웃음을 만드는 개그 짤방 스타일. 살짝 거친 손그림 선과 단순한 형태를 유지하면서 눈·입·자세의 미세한 어긋남을 과장해 기억에 남는 병맛 포인트를 만드세요.',
     'comedic derp-meme style with innocent blank eyes, oddly serious facial acting, and absurd situational contrast. Use slightly rough handmade lines and simple forms, exaggerating subtle misalignment in eyes, mouth, and pose for memorable humor.'),
    ('흑연 질감',
     '종이 위에 흑연 연필로 천천히 스케치한 듯한 감성 드로잉 스타일. 부드러운 선, 해칭과 문질러진 명암, 종이결과 연필가루의 미세한 질감을 살려 조용하고 서정적인 분위기를 만들고, 강한 채도나 유광 디지털 마감은 피하세요.',
     'emotional graphite-pencil drawing style with soft sketch lines, hatching, gently smudged shading, visible paper tooth, and subtle graphite dust. Keep the mood quiet and lyrical, avoiding saturated color or glossy digital finishing.'),
    ('수묵담채화/동양화',
     '전통 한지의 여백 위에 먹선의 농담과 붓터치 강약, 은은한 담채 물감의 투명한 번짐을 살린 수묵담채·동양화 스타일. 절제된 색과 자연스러운 발묵을 유지하고 딱딱한 벡터선이나 현대적인 플라스틱 광택은 피하세요.',
     'traditional East Asian ink-wash painting with nuanced brush pressure, transparent light watercolor bleeding, and harmonious negative space on paper. Preserve restrained color and organic ink bloom, avoiding rigid vector edges or modern plastic gloss.'),
    ('물방울의 맑고 투명한',
     '맑고 투명한 수채 워시와 자연스러운 물 번짐, 종이에 스며든 안료의 부드러운 경계가 돋보이는 프리미엄 수채화 스타일. 공기감 있는 파스텔 색과 여백을 살리고, 불투명한 셀 채색이나 날카로운 벡터 윤곽은 피하세요.',
     'premium transparent watercolor style with natural wet washes, softly bleeding pigment edges, and paper-absorbed color. Preserve airy pastel atmosphere and breathing room, avoiding opaque cel fills or rigid vector contours.'),
    ('색연필 텍스처',
     '종이결 위에 색연필을 여러 방향으로 겹쳐 칠한 듯한 따뜻한 동화책 삽화 스타일. 연필 결, 미세한 빈 종이 틈과 부드러운 색 겹침을 살려 포근한 아날로그 감성을 만들고, 매끈한 디지털 그라데이션은 피하세요.',
     'warm colored-pencil storybook style with layered directional strokes over visible paper tooth. Preserve tiny paper gaps and soft color buildup for a cozy analog feel, avoiding perfectly smooth digital gradients.'),
    ('셀 애니메이션 특유의 따스한',
     '80~90년대 셀 애니메이션의 또렷한 외곽선과 단순한 명암 단계, 따뜻하고 살짝 바랜 복고 색감이 살아있는 레트로 애니메이션 스타일. 필름의 은은한 색 번짐과 향수를 살리되 현대적인 3D 볼륨 렌더링은 피하세요.',
     'retro 80s-90s cel-animation style with crisp outlines, simple stepped shading, warm slightly faded color, and subtle film-like bloom. Preserve nostalgic flat animation character and avoid modern volumetric 3D rendering.'),
    ('미니멀한 기하학적 형태',
     '군더더기 없는 기하학적 형태와 매끈한 곡선, 제한된 색 팔레트와 정확한 플랫컬러 면 분할이 특징인 미니멀 벡터 스타일. 아이콘처럼 명확한 실루엣과 균형을 우선하고 종이 질감·거친 붓질·복잡한 입체 음영은 제외하세요.',
     'ultra-clean minimal vector style with simple geometry, smooth curves, restrained palette, and precise flat color blocking. Prioritize icon-like silhouette clarity and balance, avoiding paper grain, rough brushwork, or complex volumetric shading.'),
    ('선명한 원색 대비',
     '강렬한 원색 대비와 굵은 그래픽 외곽선, 대담한 컬러 블록과 인쇄 패턴이 돋보이는 팝아트 스타일. 표정과 동작을 과장해 경쾌한 에너지를 만들고, 자연주의적 색감이나 부드러운 회화 번짐은 피하세요.',
     'vibrant pop-art style with strong primary-color contrast, bold graphic outlines, large color blocks, and print-inspired patterning. Exaggerate expression and gesture for energetic impact, avoiding naturalistic color or soft painterly blending.'),
    ('클래식 코믹북 만화 스타일',
     '굵고 강한 검정 잉크선과 극적인 그림자 면, 역동적인 해칭과 그래픽 대비가 특징인 클래식 코믹북 스타일. 캐릭터를 표지 일러스트처럼 강하게 세우고, 부드러운 수채 번짐이나 가벼운 파스텔 톤은 피하세요.',
     'classic comic-book style with heavy black ink line weight, dramatic shadow shapes, dynamic hatching, and bold graphic contrast. Give the character cover-like presence and avoid soft watercolor bleeding or delicate pastel treatment.'),
    ('16비트 도트 픽셀',
     '픽셀 그리드가 선명하게 보이는 16비트 레트로 게임 픽셀 아트 스타일. 제한된 팔레트와 계단식 윤곽, 도트 단위 명암으로 형태를 구성하고, 안티에일리어싱 블러나 매끈한 벡터 곡선은 사용하지 마세요.',
     'crisp 16-bit retro pixel-art style with visible pixel grid, limited palette, stepped contours, and pixel-level shading. Do not use anti-aliased blur or smooth vector curves.'),
    ('오려 붙인 색종이',
     '질감 있는 색종이를 손으로 오려 겹쳐 붙인 듯한 페이퍼 컷 콜라주 스타일. 불규칙한 절단 가장자리, 종이 섬유결과 층 사이의 얕은 그림자를 살려 수공예 입체감을 만들고, 플라스틱 재질이나 매끈한 벡터 표면은 피하세요.',
     'hand-cut paper collage style with layered textured paper, slightly irregular cut edges, visible fibers, and shallow shadows between layers. Preserve handmade depth while avoiding plastic material or overly smooth vector surfaces.'),
    ('빈티지 신문 만화 스타일',
     '오래된 신문과 잡지 인쇄를 연상시키는 하프톤 망점, 거친 잉크 번짐, 살짝 어긋난 오프셋 색과 바랜 종이 질감이 살아있는 빈티지 인쇄 만화 스타일. 디지털적으로 완벽한 정렬과 깨끗한 표면은 의도적으로 피하세요.',
     'vintage newsprint comic style with halftone dots, rough ink bleed, slightly misregistered offset color, and aged paper texture. Intentionally avoid perfect digital registration and overly pristine surfaces.'),
    ('흑백 잉크 드로잉',
     '정교한 흑백 잉크선과 스크린톤, 해칭으로 볼륨과 감정을 표현하는 출판 만화 톤 스타일. 컬러 없이도 얼굴과 포즈가 명확히 읽히도록 강한 명암 구조를 유지하고 원색 컬러 채색은 사용하지 마세요.',
     'refined monochrome manga style using crisp black ink, screentones, and hatching to describe volume and emotion. Maintain strong tonal structure for readability without color and avoid saturated color fills.'),
    ('소년만화 배틀 액션',
     '거칠고 에너지 넘치는 먹선, 극적인 앵글과 속도선, 강한 동세와 긴장감이 중심인 열혈 소년만화 배틀 스타일. 표정과 자세를 과감하게 밀어붙이고 정적인 포즈나 부드러운 로맨스 연출은 피하세요.',
     'high-energy shonen battle style with forceful ink strokes, dramatic camera angles, speed lines, and intense motion. Push facial acting and pose boldly, avoiding static staging or soft romantic treatment.'),
    ('섬세한 펜선과 반짝이는 눈동자',
     '섬세한 펜선과 반짝이는 눈동자, 부드러운 홍조와 화사한 하이라이트가 돋보이는 순정만화 스타일. 로맨틱한 꽃·별·반짝이 장식을 은은하게 사용해 설렘을 만들되 얼굴을 과도하게 평균화하거나 정체성을 잃지 않게 하세요.',
     'sparkling shojo-manga style with delicate linework, luminous eyes, soft blush, and bright highlights. Use subtle floral, star, and sparkle accents for romantic charm while avoiding generic face averaging or identity loss.'),
    ('시티팝 감성의 80-90년대',
     '80~90년대 시티팝 애니메이션의 선명한 셀 라인과 제한된 명암, 레트로 파스텔·네온 포인트와 은은한 CRT/필름 감성이 어우러진 스타일. 복고적인 평면 애니 질감을 유지하고 현대적인 풀 3D 렌더링은 피하세요.',
     '80s-90s city-pop anime style with crisp cel lines, limited shading steps, retro pastel color with selective neon accents, and subtle CRT/film atmosphere. Preserve flat nostalgic animation character rather than modern full 3D rendering.'),
    ('디즈니·픽사',
     '극장용 애니메이션처럼 매끈하게 정리된 형태와 부드러운 반실사 3D 볼륨, 자연스러운 재질 반응과 영화적인 스튜디오 조명이 어우러진 고품질 3D 캐릭터 렌더링 스타일. 실제 사람처럼 과도하게 사실화하지 말고 친근한 애니메이션 조형을 유지하세요.',
     'high-quality cinematic 3D character-animation style with polished shapes, soft semi-realistic volume, believable material response, and studio-quality lighting. Keep the character warmly stylized rather than pushing into full human photorealism.'),
    ('G펜 잉크선',
     '정교한 G펜 잉크선과 필압 변화, 촘촘한 스크린톤과 해칭이 살아있는 고품질 일본 출판 만화 스타일. 선의 밀도와 검정 면을 세심하게 조절해 인쇄 만화의 완성도를 유지하고, 디지털 컬러 페인팅으로 덮지 마세요.',
     'authentic Japanese published-manga style with precise G-pen inking, controlled pressure variation, refined screentones, and detailed hatching. Carefully balance line density and solid blacks, avoiding painted digital color that obscures the print-manga character.'),
    ('양모 펠트와 말랑말랑한 클레이',
     '포근한 양모 펠트와 말랑한 클레이를 손으로 빚은 듯한 스톱모션 미니어처 인형 스타일. 펠트 섬유결, 미세한 눌림과 손자국, 부드러운 매크로 스튜디오 조명을 살려 수공예 입체감을 강조하고, 평면 벡터나 지나치게 매끈한 플라스틱 표면은 피하세요.',
     'handcrafted 3D felt-and-claymation miniature style with visible felt fibers, subtle dents and handmade impressions, and soft macro studio lighting. Emphasize tactile stop-motion dimensionality while avoiding flat vector treatment or overly smooth plastic surfaces.'),
    ('크레파스 왁스 질감',
     '유아 그림책처럼 자유로운 크레파스 선과 왁스 입자, 종이 위에 덧칠한 흔적이 살아있는 손그림 낙서 스타일. 따뜻하고 밝은 색을 사용하고 가장자리의 거친 손맛을 남기며, 매끈한 디지털 벡터나 기계적인 그라데이션은 피하세요.',
     'playful children’s-book crayon doodle style with waxy pigment grain, freehand strokes, and visible layered marks on paper. Use warm bright color, preserve rough handmade edges, and avoid sterile vector smoothness or mechanical gradients.'),
    ('반짝이 글리터와 레트로 픽셀',
     '2000년대 Y2K 다꾸 감성의 레트로 픽셀, 글리터, 하트와 별, 메탈릭·젤리 하이라이트가 어우러진 스티커 스타일. 장식은 화려하게 사용하되 캐릭터 실루엣과 표정은 선명하게 남기고, 완전한 실사 재질로 변하지 않게 하세요.',
     'Y2K scrapbook sticker style combining retro pixels, glitter, hearts, stars, and metallic or jelly-like highlights. Keep decoration flashy while preserving a crisp character silhouette and readable expression, without turning the whole image photorealistic.'),
]

ENTRY_RE = re.compile(
    r"(?P<head>\s*'(?P<key>(?:\\.|[^'])+)': \{\n\s*ko:\s*)'(?P<ko>(?:\\.|[^'\\])*)'(?P<mid>,\n\s*en:\s*)'(?P<en>(?:\\.|[^'\\])*)'(?P<tail>\n\s*\})"
)

def js_quote(value: str) -> str:
    return "'" + value.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n') + "'"

updated_entries = []

def refine_entry(match):
    old_ko = match.group('ko')
    for marker, new_ko, new_en in STYLE_RULES:
        if marker in old_ko:
            updated_entries.append(match.group('key'))
            return match.group('head') + js_quote(new_ko) + match.group('mid') + js_quote(new_en) + match.group('tail')
    return match.group(0)

text = ENTRY_RE.sub(refine_entry, text)
if len(updated_entries) < 30:
    raise SystemExit(f'Expected to refine at least 30 style-map entries, refined only {len(updated_entries)}: {updated_entries}')

# Add one shared sticker-readability and style-fidelity finish to every expanded style.
old_found = """    const found = styleMap[styleTag];
    if (found) {
      return isKo ? found.ko : found.en;
    }
    return styleTag;
  };"""
new_found = """    const found = styleMap[styleTag];
    const stickerFinishKo = '메신저 이모티콘에 적합하도록 작은 화면에서도 식별 가능한 명확한 실루엣과 즉시 읽히는 표정·포즈를 유지하고, 선택 화풍의 고유한 선·채색·질감·재질·조명·마감을 끝까지 일관되게 적용하세요. 선택 화풍과 충돌하는 일반적인 2D 카툰 또는 3D 렌더링으로 임의 평균화하지 마세요.';
    const stickerFinishEn = 'For messenger-sticker use, keep a clear small-screen silhouette and instantly readable expression and pose. Preserve the selected style’s distinctive linework, coloring, texture, material, lighting, and finish throughout; do not average it into a conflicting generic 2D cartoon or 3D render.';
    if (found) {
      const base = isKo ? found.ko : found.en;
      return `${base} ${isKo ? stickerFinishKo : stickerFinishEn}`;
    }
    if (!styleTag) return '';
    return `${styleTag}. ${isKo ? stickerFinishKo : stickerFinishEn}`;
  };"""
if old_found not in text:
    raise SystemExit('Could not find getExpandedArtStyleText return block')
text = text.replace(old_found, new_found, 1)

# Stronger priority wording for selected styles.
text = text.replace(
    "${expanded} (최우선 화풍 지침: 선 굵기, 채색 기법, 질감을 이 화풍 지시문대로 100% 엄격하게 적용하세요)",
    "${expanded} (최우선 화풍 지침: 선 굵기, 형태와 비율, 채색 기법, 질감, 재질, 조명과 마감을 이 화풍 지시문대로 엄격하게 적용하세요)",
)
text = text.replace(
    "${expanded}; treat this selected art style as the highest-priority visual direction for linework, coloring, and texture",
    "${expanded}; treat this selected art style as the highest-priority visual direction for linework, form and proportions, coloring, texture, materials, lighting, and finish",
)

# Photo mode without an explicit art style must no longer force 2D or refer to a nonexistent selected style.
old_photo_fallback = """    if (characterSource === 'photo') {
      if (photoReferenceMode === 'likeness') {
        return isKo
          ? '첨부 사진의 핵심 식별 특징을 일관되게 유지하면서 깔끔한 2D 스티커로 스타일화한 캐리커처 화풍'
          : 'Caricature-style 2D sticker that consistently preserves the key identifying features from the reference photo with clean sticker linework';
      }
      if (photoReferenceMode === 'style') {
        return isKo
          ? '사진은 인물 식별 기준으로만 참고하고, 선택한 화풍의 조형 언어를 최우선으로 적용한 캐릭터 스티커 화풍'
          : 'Character sticker style that uses the photo only for identity reference while prioritizing the selected art style\\'s visual language';
      }
      return isKo
        ? '사진 속 대상의 핵심 특징을 자연스럽게 유지하면서 선택 화풍에 맞게 스타일화한 균형 잡힌 스티커 화풍'
        : 'Balanced sticker style that naturally preserves the subject\\'s key features while stylizing to match the selected art direction';
    }"""
new_photo_fallback = """    if (characterSource === 'photo') {
      if (photoReferenceMode === 'likeness') {
        return isKo
          ? '첨부 사진 속 대상의 얼굴형, 눈매, 코, 입, 턱선, 헤어스타일 또는 털 무늬와 피부톤/털 색상 등 핵심 식별 특징을 최우선으로 유지하는 고품질 캐릭터 스티커 스타일. 별도 화풍이 선택되지 않았으므로 2D나 3D를 강제하지 말고, 사진의 정체성을 가장 잘 보존하는 자연스러운 표현 매체를 선택하세요.'
          : 'High-quality character sticker treatment that prioritizes the reference subject’s recognizable identity anchors such as facial shape, eyes, nose, mouth, jawline, hair or fur pattern, and skin or coat tone. Because no art style is explicitly selected, do not force 2D or 3D; choose the visual medium that best preserves the reference identity.';
      }
      if (photoReferenceMode === 'style') {
        return isKo
          ? '첨부 사진은 동일 대상의 정체성 기준으로 유지하되, 별도 화풍이 선택되지 않았으므로 현재 선택된 캐릭터·의상·소품·효과 태그와 가장 잘 어울리는 시각 매체와 렌더링 방식을 자유롭게 선택하는 캐릭터 스티커 스타일. 사진 속 대상을 다른 존재로 교체하지 마세요.'
          : 'Character sticker treatment that keeps the uploaded photo as the same-subject identity reference while freely choosing the visual medium and rendering approach that best fits the selected character, outfit, prop, and effect tags because no explicit art style was chosen. Never replace the photographed subject with a different identity.';
      }
      return isKo
        ? '첨부 사진 속 대상의 핵심 특징과 자연스러운 캐릭터화를 균형 있게 유지하는 고품질 스티커 스타일. 별도 화풍이 선택되지 않았으므로 특정 2D/3D 방식을 강제하지 말고, 사진 정체성과 선택 태그가 가장 자연스럽게 조화되는 표현 방식을 사용하세요.'
        : 'Balanced high-quality sticker treatment that preserves the reference subject’s key identity features while allowing natural character stylization. With no explicit art style selected, do not force a specific 2D or 3D medium; use the rendering approach that best balances identity and the selected tags.';
    }"""
if old_photo_fallback not in text:
    raise SystemExit('Could not find photo fallback style block')
text = text.replace(old_photo_fallback, new_photo_fallback, 1)

# GPT should reuse the same source-aware fallback instead of always falling back to 2D.
old_gpt_fallback = """      : (lang === 'ko'
        ? '귀엽고 친근한 고품질 2D 메신저 이모티콘 스타일, 깔끔한 외곽선, 조화로운 색감'
        : 'cute, approachable, high-quality 2D messenger sticker style with clean outlines and harmonious colors');"""
new_gpt_fallback = """      : getGeminiStyleTags(lang === 'ko' ? 'ko' : 'en');"""
if old_gpt_fallback not in text:
    raise SystemExit('Could not find GPT art-direction fallback')
text = text.replace(old_gpt_fallback, new_gpt_fallback, 1)

# Grok: direct/no-style keeps the 2D default, but photo/no-style becomes medium-neutral.
old_grok = "const selectedArtStyle = getExpandedArtStyleText(selectedArtStyleTag, false) || selectedArtStyleTag || 'Realistic semi-caricature 2D illustration';"
new_grok = "const selectedArtStyle = getExpandedArtStyleText(selectedArtStyleTag, false) || selectedArtStyleTag || (characterSource === 'photo' ? 'high-quality character sticker rendering chosen to preserve the uploaded reference identity; do not force 2D or 3D when no art style is selected' : 'Realistic semi-caricature 2D illustration');"
if old_grok not in text:
    raise SystemExit('Could not find Grok style fallback')
text = text.replace(old_grok, new_grok, 1)

# Do not let unclassified selected media be overwritten by the generic 2D adaptive fallback.
old_default_directive = """    // Default: Clean 2D Pop Sticker
    return {
      category: 'cartoon',
      instruction: isKo
        ? '깔끔하고 둥글둥글한 외곽선과 화사한 원색 채색이 돋보이는 고품질 2D 카툰 스티커 스타일을 적용하세요.'
        : 'High-quality 2D cartoon sticker style with clean rounded outlines and bright vibrant coloring.',
      negativeExtra: '',
      typographyDirective: isKo
        ? '통통하고 읽기 쉬운 2D 볼드 팝아트 손글씨 스티커 폰트 + 두꺼운 순백색 다이컷 외곽선.'
        : 'Bold, bubbly 2D pop-art sticker typography with a thick white die-cut outline stroke.',
    };"""
new_default_directive = """    // Selected but otherwise unclassified style: stay medium-neutral and obey the expanded style.
    if (styleTag) {
      return {
        category: 'selected-style',
        instruction: isKo
          ? '선택한 화풍의 고유한 선, 형태, 비율, 채색, 질감, 재질, 조명과 마감을 그대로 따르세요. 일반적인 2D 카툰 또는 3D 렌더링 문법을 임의로 덧씌우지 마세요.'
          : 'Follow the selected style’s own linework, form, proportions, coloring, texture, materials, lighting, and finish. Do not overlay a generic 2D cartoon or 3D rendering language that conflicts with it.',
        negativeExtra: isKo
          ? '선택 화풍과 충돌하는 일반화된 렌더링, 매체 혼합, 불필요한 실사화 금지.'
          : 'No generic rendering that conflicts with the selected medium, no unnecessary style mixing, and no unrequested photorealism.',
        typographyDirective: isKo
          ? '선택 화풍과 조화되는 읽기 쉬운 스티커 레터링 + 깨끗한 백색 다이컷 외곽선.'
          : 'Readable sticker lettering harmonized with the selected art style, with a clean white die-cut contour.',
      };
    }

    // True no-style default for direct setup: clean 2D messenger sticker.
    return {
      category: 'cartoon',
      instruction: isKo
        ? '깔끔하고 둥글둥글한 외곽선과 화사한 원색 채색이 돋보이는 고품질 2D 카툰 스티커 스타일을 적용하세요.'
        : 'High-quality 2D cartoon sticker style with clean rounded outlines and bright vibrant coloring.',
      negativeExtra: '',
      typographyDirective: isKo
        ? '통통하고 읽기 쉬운 2D 볼드 팝아트 손글씨 스티커 폰트 + 두꺼운 순백색 다이컷 외곽선.'
        : 'Bold, bubbly 2D pop-art sticker typography with a thick white die-cut outline stroke.',
    };"""
if old_default_directive not in text:
    raise SystemExit('Could not find adaptive default directive')
text = text.replace(old_default_directive, new_default_directive, 1)

# GPT character defaults: body proportions are decided by the selected art style/tags, not universally forced to 2.5-head chibi.
replacements = {
    '큰 동그란 머리와 앙증맞고 통통한 몸체를 가진 사랑스러운 2.5등신 대두 SD/Chibi 마스코트 캐릭터 비율, 크고 생생한 눈동자와 또렷한 캐릭터 실루엣': '큰 머리와 간결하고 친근한 마스코트 실루엣을 기본으로 하되, 최종 신체 비율과 형태는 선택 화풍 및 선택 태그가 우선 결정',
    'adorable 2.5-head SD/Chibi mascot proportions with a big round head, chubby compact body, sparkling expressive eyes, and crisp character silhouette': 'start from a friendly mascot silhouette, while final body proportions and form are determined by the selected art style and selected tags',
    '깔끔하고 명확한 2.5등신 SD 캐릭터 실루엣 유지': '선택 화풍에 맞는 명확하고 일관된 캐릭터 실루엣 유지',
    'use a clean recognizable 2.5-head SD character silhouette and keep it unchanged': 'maintain a clear and consistent character silhouette appropriate to the selected art style',
}
for old, new in replacements.items():
    text = text.replace(old, new)

# In photo/no-style mode, GPT must not silently append a 3D ban. Keep direct/no-style as the default 2D path.
def replace_3d_ban(match):
    ban = match.group(1)
    return "${selectedArtStyle ? (selectedArtStyle.includes('3D') ? '' : '" + ban + "') : (characterSource === 'photo' ? '' : '" + ban + "')}"
text = re.sub(r"\$\{selectedArtStyle\.includes\('3D'\) \? '' : '([^']*3D[^']*)'\}", replace_3d_ban, text)

# Clarify the direct-setup empty-state UI copy in all supported locales.
copy_replacements = {
    '설정을 비워두셔도 AI가 가장 귀엽고 표정이 풍부한 2D 오리지널 캐릭터(기본 의상/화풍)를 자동으로 완성해 드립니다.': '설정을 비워두면 AI가 기본 오리지널 캐릭터를 자동으로 구성합니다. 선택한 화풍이 우선 적용되며, 화풍을 선택하지 않은 경우에만 기본 2D 스타일로 생성됩니다.',
    '入力欄を空欄のままにしておくと、AIが自動的に可愛く個性豊かな2Dオリジナルキャラクターを設定します。': '設定を空欄にするとAIが基本のオリジナルキャラクターを自動構成します。選択した画風を優先し、画風を選択していない場合のみ基本2Dスタイルを使用します。',
    '若留空，AI将默认自动为您生成可爱且表情丰富的2D原创角色。': '若留空，AI会自动构建默认原创角色。已选择的画风优先；仅在未选择画风时使用默认2D风格。',
    'Leaving this empty automatically generates a cute, highly expressive 2D original character by default.': 'Leaving this empty lets AI build a default original character. Your selected art style takes priority; the default 2D style is used only when no art style is selected.',
}
for old, new in copy_replacements.items():
    text = text.replace(old, new)

if text == original:
    raise SystemExit('No changes were produced')

APP.write_text(text, encoding='utf-8')
print(f'Refined {len(updated_entries)} style-map entries across aliases.')
print('Applied source-aware photo/direct style fallbacks, adaptive style neutrality, GPT/Grok alignment, and UI copy updates.')
