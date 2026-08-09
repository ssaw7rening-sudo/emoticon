import React, { useState, useEffect } from 'react';
import { Shuffle, CheckCircle2, Bot, Sparkles, HelpCircle, Globe, Trash2 } from 'lucide-react';

const THEMES_KO = {
  '일상/인사 ①': ['ㅋㅋㅋㅋ', '안녕!', '오늘도 화이팅', '좋아요', '고마워요', '사랑해요', '최고!', '오예', '미안해요', '수고했어요', '축하해요', '대박', '헐', '감동', '잘자요'],
  '일상/인사 ②': ['반가워요', '뭐해?', '밥 먹었어?', '보고싶어', '굿모닝', '심심해', '어디야?', '놀자!', '화이팅', '응원할게', '멋져요', '완벽해', '기대돼', '수고했어 오늘도', '다음에 봐!'],
  '직장인 ①': ['넵!', '확인했습니다', '수정 부탁드립니다', '감사합니다', '퇴근하겠습니다', '회의 중입니다', '파일 첨부했습니다', '점심 맛있게 드세요', '화이팅!', '죄송합니다', '일정 확인', '수고하셨습니다', '먼저 들어가보겠습니다', '네 알겠습니다', '검토 부탁드립니다'],
  '직장인 ②': ['휴가 다녀오겠습니다', '연차 쓸게요', '메일 확인 부탁드립니다', '참고 부탁드립니다', '일정 조율 가능할까요?', '결재 부탁드립니다', '공지사항 확인', '출근길 지옥', '야근 확정', '커피 수혈 시급', '점심 회식', '칼퇴 기원', '이번 주도 무사히', '업무 공유드립니다', '수정 완료했습니다'],
  '학생/학교 ①': ['과제 지옥', '시험 끝!', '살려주세요', '교수님...', '밤샘각', '종강 마렵다', '출튀', '휴강', 'A+ 가즈아', '조별과제 ㅠㅠ', '점심 뭐먹지?', '지각이다', '도서관', '공부 시러', '졸려'],
  '학생/학교 ②': ['수강신청 망함', '우주공강', '학식', '동아리', 'MT 가자', '과제 다 했어?', '벼락치기', '시험기간', '성적 확인', '졸업작품', '재수강', '레포트', '팀플 빌런', '수업 집중 안됨', '방학 언제 와'],
  '유머/밈 ①': ['현기증 나요', '아아악', '퇴사 마렵다', '집에 갈래', '격렬하게 쉬고싶다', '오히려 좋아', '가보자고', '어림없지', '응 아니야', '킹받네', '폼 미쳤다', '이게 맞나', '머쓱', '야근 당첨', '입틀막'],
  '유머/밈 ②': ['중요한 건 꺾이지 않는 마음', '너 T야?', '알빠노', '오운완', '폼 미쳤다이', '무야호', '오히려 안 좋아', '어쩔티비', '쉽지않네', '이왜진', '뇌정지', '안물안궁', '할말하않', '억텐', '웃안웃'],
  '감정표현 ①': ['행복해', '슬퍼요', '화가 난다', '우울해', '신난다', '짜증나', '부끄러워', '깜짝이야', '심심해', '외로워', '불안해', '답답해', '기대돼', '뿌듯해', '어휴'],
  '감정표현 ②': ['감동이야', '설레요', '놀라워라', '기가 막혀', '황당해', '억울해', '후회돼', '미치겠네', '답답하다', '속상해', '기운 빠져', '평온해', '신경 쓰여', '짜릿해', '지루해'],
  '커플/연애 ①': ['보고싶어', '사랑해', '뭐해?', '밥 먹었어?', '빨리 와', '삐졌어', '우앙', '최고야', '알라뷰', '뽀뽀', '데이트 가자', '기다릴게', '행복해', '내꺼', '자기야'],
  '커플/연애 ②': ['안아줘', '손잡자', '내꿈꿔', '보고만 있어도 좋아', '오늘 뭐입지?', '영화 볼래?', '집 앞이야', '통화할까?', '늦어서 미안해', '네 생각 중', '너뿐이야', '심쿵', '꽃 사왔어', '여행 갈까?', '평생 함께해'],
  '가족/부모님 ①': ['엄마 사랑해', '아빠 최고', '집에 언제 와?', '밥은 먹었어?', '건강 조심해', '용돈 주세요', '효도할게요', '우리 가족 사랑해', '조심해서 와', '보고 싶어', '생일 축하해', '아프지 마', '항상 고마워', '주말에 봐요', '내 맘 알지?'],
  '가족/부모님 ②': ['조심해서 들어가', '가족 단톡방입니다', '엄마 아빠 짱', '다같이 밥 먹자', '명절 잘 보내세요', '할머니 할아버지 건강하세요', '용돈 감사해요', '사랑으로 키워주셔서', '우리 가족 화목하게', '잔소리 금지', '집밥 최고', '일찍 일찍 다녀라', '보일러 켜', '오늘 뭐 먹지?', '가족여행 가자'],
  '음식/다이어트 ①': ['배고파', '오늘 뭐 먹지?', '치킨 고?', '다이어트는 내일부터', '당 떨어져', '야식의 유혹', '맛집 발견!', '배불러', '잘 먹겠습니다', '소화불량', '물 마셔라', '오운완', '샐러드 먹는 중', '먹방 타임', '탄수화물 최고'],
  '음식/다이어트 ②': ['맛있게 먹으면 0칼로리', '디저트 배는 따로', '식단 조절 중', '살찌는 소리', '오늘은 치팅데이', '빵순이', '마라탕 수혈', '커피는 생명수', '단짠단짠', '야식 참자', '또 먹어?', '다이어트 포기', '맵찔이', '아아 필수', '배터지겠다'],
  '오타쿠/덕질 ①': ['내 통장을 바칠게', '존잘', '너무 귀여워', '숨 멎을 듯', '이건 사야해', '광광 우럭따', '덕질 최고', '티켓팅 성공기원', '피의 연회', '입틀막', '앓다 죽을', '현망진창', '내 최애', '행복 회로', '어덕행덕'],
  '오타쿠/덕질 ②': ['최애만 보여', '스밍 돌리자', '굿즈 양도 구함', '투표 잊지마', '컴백 언제해', '밤샘 스밍', '실물 영접', '포카 교환', '콘서트 가고싶다', '입덕 부정기', '덕업일치', '텅장', '어차피 덕질할거', '회전문', '평생 덕질'],
  '분노/짜증 ①': ['아놔', '선 넘네', '할많하않', '어쩌라고', '열받아', '딥빡', '참을 인 세 번', '혈압 상승', '스트레스', '진정해', '건들지 마', '뒷목 잡음', '짜증나', '부들부들', '어이없음'],
  '분노/짜증 ②': ['아 진짜', '왜 저래', '할 말 잃음', '극대노', '이마 짚음', '킹받아', '뒷골 땡겨', '혈압주의', '참자 참아', '한숨 푹', '노답', '눈으로 욕하는 중', '기가 막혀서', '선 세게 넘네', '마상'],
  '축하/응원 ①': ['생일 축하해', '꽃길만 걷자', '수고했어', '잘될 거야', '대박 나세요', '항상 응원해', '최고의 하루', '기특해', '축하파티', '빛나는 너의 앞날', '행복하자', '고생 많았어', '자랑스러워', '힘내', '널 믿어'],
  '축하/응원 ②': ['합격 기원', '취뽀 축하해', '승진 축하', '늘 곁에 있을게', '토닥토닥', '넌 할 수 있어', '포기하지 마', '오늘도 수고했어', '무조건 네 편', '앞으로도 잘 부탁해', '결혼 축하해', '새출발 응원해', '건승을 빕니다', '잘 해낼 거야', '꽃길 예약'],
  '계절/날씨 ①': ['너무 더워', '얼어 죽음', '비 온다', '눈 내린다', '벚꽃 엔딩', '에어컨 틀자', '이불 밖은 위험해', '날씨 좋다', '미세먼지 나쁨', '우산 챙겨', '봄 타나 봐', '가을 타나 봐', '패딩 필수', '모기 조심', '폭염 주의'],
  '계절/날씨 ②': ['감기 조심', '꽃가루 주의', '장마철 극혐', '햇살 맛집', '눈사람 만들자', '붕어빵의 계절', '손발이 꽁꽁', '찜통 더위', '선풍기 앞', '비 오는 날엔 파전', '미끄럼 주의', '가을 타는 중', '단풍놀이 가자', '봄바람 살랑살랑', '집콕이 최고']
};

const THEMES_EN = {
  'Daily/Greeting ①': ['LMAO', 'Hello!', 'Cheer up today', 'Sounds good', 'Thank you', 'Love you', 'Awesome!', 'Oh yeah', 'Sorry', 'Good job', 'Congrats', 'Wow', 'OMG', 'Touched', 'Good night'],
  'Daily/Greeting ②': ['Nice to meet you', 'What\'s up?', 'Had lunch?', 'Miss you', 'Good morning', 'I\'m bored', 'Where are you?', 'Let\'s hang out!', 'Fighting', 'I support you', 'Cool', 'Perfect', 'Looking forward to it', 'Great work today', 'See you next time!'],
  'Office ①': ['Yes sir!', 'Understood', 'Please revise', 'Thank you', 'Leaving work', 'In a meeting', 'File attached', 'Enjoy your lunch', 'Fighting!', 'My apologies', 'Check schedule', 'Great work', 'I\'ll head out first', 'Got it', 'Please review'],
  'Office ②': ['Taking PTO', 'Going on vacation', 'Please check email', 'For your reference', 'Can we reschedule?', 'Please approve', 'Check announcement', 'Commute hell', 'Overtime confirmed', 'Need coffee ASAP', 'Team lunch', 'Praying to leave on time', 'Surviving this week', 'Sharing updates', 'Revision completed'],
  'Student/School ①': ['Assignment hell', 'Exams over!', 'Save me', 'Professor...', 'All-nighter', 'Need vacation', 'Skipping class', 'Class canceled', 'Let\'s get A+', 'Group project T.T', 'What\'s for lunch?', 'I\'m late', 'Library', 'Hate studying', 'Sleepy'],
  'Student/School ②': ['Failed course registration', 'Huge gap between classes', 'Cafeteria', 'Club', 'Let\'s go to MT', 'Finished homework?', 'Cramming', 'Exam week', 'Checking grades', 'Graduation project', 'Retaking class', 'Report', 'Team project villain', 'Can\'t focus in class', 'When is break'],
  'Meme/Humor ①': ['Dizzy', 'Aaahhh', 'Wanna quit', 'Wanna go home', 'Need rest badly', 'Actually good', 'Let\'s go', 'No way', 'Nope', 'So annoying', 'Crazy form', 'Is this right?', 'Awkward', 'Night shift', 'Speechless'],
  'Meme/Humor ②': ['Unbreakable spirit', 'Are you T?', 'Who cares', 'Workout done', 'Insane form', 'Muyaho', 'Actually bad', 'Whatever TV', 'Not easy', 'Is this real?', 'Brain freeze', 'Didn\'t ask', 'No words', 'Fake hype', 'Funny but sad'],
  'Emotions ①': ['Happy', 'Sad', 'Angry', 'Depressed', 'Excited', 'Annoyed', 'Shy', 'Surprised', 'Bored', 'Lonely', 'Anxious', 'Frustrated', 'Looking forward', 'Proud', 'Phew'],
  'Emotions ②': ['Touched', 'Fluttering', 'Amazing', 'Unbelievable', 'Absurd', 'Unfair', 'Regretful', 'Going crazy', 'Stifling', 'Upset', 'Drained', 'Peaceful', 'Bothered', 'Thrilling', 'Boring'],
  'Couple/Love ①': ['Miss you', 'Love you', 'Whatcha doing?', 'Ate yet?', 'Come quick', 'I\'m mad', 'Wow', 'You\'re the best', 'I love u', 'Kiss', 'Let\'s date', 'I\'ll wait', 'Happy', 'Mine', 'Babe'],
  'Couple/Love ②': ['Hug me', 'Hold hands', 'Dream of me', 'Just looking at you is nice', 'What to wear?', 'Wanna watch a movie?', 'I\'m in front of your house', 'Wanna call?', 'Sorry I\'m late', 'Thinking of you', 'Only you', 'Heart flutter', 'Bought flowers', 'Wanna go on a trip?', 'Together forever'],
  'Family/Parents ①': ['Love you mom', 'Dad is the best', 'When coming home?', 'Did you eat?', 'Take care', 'Need allowance', 'I will be good', 'Love our family', 'Come safe', 'Miss you', 'Happy Birthday', 'Stay healthy', 'Always thankful', 'See you weekend', 'You know my heart?'],
  'Family/Parents ②': ['Get home safe', 'Family group chat', 'Mom and Dad are the best', 'Let\'s eat together', 'Happy holidays', 'Stay healthy grandparents', 'Thanks for the allowance', 'Thanks for raising me with love', 'Happy family', 'No nagging', 'Home cooked meal is best', 'Come home early', 'Turn on the heater', 'What to eat today?', 'Let\'s go on a family trip'],
  'Food/Diet ①': ['Hungry', 'What to eat?', 'Chicken?', 'Diet starts tomorrow', 'Need sugar', 'Late night snack', 'Found a good place!', 'Full', 'Bon appetit', 'Indigestion', 'Drink water', 'Workout done', 'Eating salad', 'Mukbang time', 'Carbs are the best'],
  'Food/Diet ②': ['0 calories if it\'s delicious', 'Separate stomach for dessert', 'On a diet', 'Sound of gaining weight', 'Today is cheat day', 'Bread lover', 'Need Malatang', 'Coffee is life', 'Sweet and salty', 'Resist late night snack', 'Eating again?', 'Giving up diet', 'Can\'t eat spicy', 'Iced Americano is a must', 'Stomach is exploding'],
  'Fandom/Fangirl ①': ['Take my money', 'So handsome', 'Too cute', 'Breathtaking', 'Must buy', 'Crying out loud', 'Stan life', 'Ticketing success', 'Bloody banquet', 'Speechless', 'Dying of love', 'Real life ruined', 'My bias', 'Happy circuit', 'Happy fangirling'],
  'Fandom/Fangirl ②': ['Only see my bias', 'Keep streaming', 'Looking for merch transfer', 'Don\'t forget to vote', 'When is the comeback', 'All night streaming', 'Seeing in person', 'Photocard exchange', 'Wanna go to concert', 'Denial phase of stanning', 'Hobby becomes job', 'Empty bank account', 'Gonna stan anyway', 'Revolving door', 'Stan for life'],
  'Angry/Annoyed ①': ['Oh come on', 'Crossing the line', 'No words', 'Whatever', 'Pissed off', 'Deeply angry', 'Patience', 'Blood pressure rising', 'Stress', 'Calm down', 'Don\'t touch me', 'Grabbing my neck', 'Annoying', 'Trembling', 'Absurd'],
  'Angry/Annoyed ②': ['Oh seriously', 'What\'s wrong with them', 'Speechless', 'Extreme rage', 'Facepalm', 'So annoying', 'Neck pain', 'Blood pressure warning', 'Hold it in', 'Deep sigh', 'No answer', 'Cursing with eyes', 'Dumbfounded', 'Crossing the line hard', 'Heartbroken'],
  'Celebrate/Cheer ①': ['Happy Birthday', 'Only flower paths', 'Good job', 'Everything will be fine', 'Hit the jackpot', 'Always cheering for you', 'Best day ever', 'Proud of you', 'Party time', 'Shining future', 'Let\'s be happy', 'You worked hard', 'So proud', 'Cheer up', 'I believe in you'],
  'Celebrate/Cheer ②': ['Praying for admission', 'Congrats on getting a job', 'Congrats on promotion', 'Always by your side', 'Pat pat', 'You can do it', 'Don\'t give up', 'Good job today too', 'Always on your side', 'Looking forward to working with you', 'Happy wedding', 'Cheering for your new start', 'Wishing you success', 'You will do great', 'Flower path reserved'],
  'Season/Weather ①': ['Too hot', 'Freezing to death', 'It\'s raining', 'It\'s snowing', 'Cherry blossoms', 'Turn on the AC', 'Dangerous outside bed', 'Nice weather', 'Bad air quality', 'Take an umbrella', 'Spring fever', 'Autumn vibes', 'Puffer jacket needed', 'Watch out for mosquitoes', 'Heatwave warning'],
  'Season/Weather ②': ['Catch a cold', 'Pollen warning', 'Hate rainy season', 'Sunshine spot', 'Let\'s make a snowman', 'Season for Taiyaki', 'Freezing hands and feet', 'Sweltering heat', 'In front of a fan', 'Pajeon on a rainy day', 'Slippery warning', 'Feeling autumn vibes', 'Let\'s go see autumn leaves', 'Soft spring breeze', 'Staying home is best']
};

const CHARACTER_TAGS_KO = {
  '🐱 동물': ['시바견', '치즈냥', '포메라니안', '아기 펭귄', '똥실똥실 토끼', '장난꾸러기 원숭이', '햄스터', '다람쥐', '아기 곰', '사막여우', '쿼카', '아기 오리', '판다', '고슴도치', '알파카', '아기 돼지', '느릿느릿 나무늘보', '아기 코끼리', '귀여운 수달', '아기 물개', '웰시코기', '카피바라', '삐약삐약 병아리', '너구리', '아기 사자'],
  '👦 인물': ['단발머리 소녀', '안경 쓴 모범생', '투블럭 남학생', '뽀글머리 아줌마', '수염 난 아저씨', '포니테일 체육생', '양갈래 소녀', '비니 쓴 힙스터', '정장 입은 신사', '한복 입은 꼬마', '정장 입은 커리어우먼', '온화한 백발 할머니', '지팡이 짚은 할아버지', '노란 모자 유치원생', '선글라스 낀 래퍼', '앞치마 두른 바리스타', '까까머리 군인', '헤드폰 낀 프로게이머', '근육질 헬스보이', '카메라 든 배낭여행객', '가운 입은 의사선생님', '제복 입은 경찰관', '기타 치는 록스타', '스케이트보드 타는 소년', '화려한 K팝 아이돌', '푸근한 동네 아저씨', '요가복 입은 강사', '안전모 쓴 건축가', '파리지앵 화가', '오토바이 타는 라이더', '화사한 꽃집 사장님', '가방 멘 취준생', '피곤한 직장인', '에이프런을 두른 제빵사', '정비복 입은 메카닉', '한복 입은 선비', '카우보이 모자 쓴 목동', '해적 안대 쓴 선장', '화려한 마술사', '발레복 입은 무용수', '트레이닝복 입은 백수', '연구원 가운 입은 과학자', '청바지에 흰티 입은 훈남', '드레스 입은 공주님', '갑옷 입은 기사', '도복 입은 태권도 사범', '승무원 유니폼 입은 스튜어디스', '카메라맨', '등산복 입은 산악인', '마이크 든 아나운서', '법복 입은 판사', '소방복 입은 소방관', '요리사 모자 쓴 셰프', '캡모자 쓴 알바생', '밀짚모자 쓴 농부', '화관 쓴 숲속 소녀', '교복 입고 떡볶이 먹는 학생', '서핑보드 든 서퍼', '헤어롤 만 취업준비생'],
  '🦄 판타지/사물': ['유니콘', '아기 드래곤', '꼬마 마법사', '숲의 요정', '말랑말랑 모찌', '달콤한 마카롱', '딸기 케이크', '포동포동 만두', '꼬마 뱀파이어', '바다 인어공주', '용감한 꼬마 기사', '외계인', '아기 구미호', '귀여운 뿔 도깨비', '빛나는 천사', '장난꾸러기 아기 악마', '말하는 붕어빵', '솜사탕 구름', '신비로운 인어', '날개 달린 페가수스', '말하는 호박', '우주 비행사', '마법 빗자루', '젤리 괴물', '눈사람 요정'],
  '👀 외형/특징': ['둥근 얼굴형', '크고 반짝이는 눈', '통통한 볼살', '짧고 통통한 팔다리', '작고 동그란 코', '발그레한 볼', '복슬복슬한 털', '말랑한 젤리 몸', '길고 쫑긋한 귀', '작은 송곳니', '주근깨', '한쪽 눈을 덮는 앞머리', '동그란 안경', '풍성한 꼬리', '작은 날개', '별 모양 눈동자', '하트 모양 볼무늬', '미니 SD 체형'],
  '✨ 성격/감정': ['장난기 많은', '시크하고 도도한', '순둥순둥 착한', '늘 피곤에 찌든', '애교가 넘치는', '화가 많은', '느긋한', '눈물 많은', '활발한', '소심한', '엉뚱한', '다정한', '항상 배고픈', '호기심 가득한', '매사에 진지한', '허세 가득한', '사랑에 빠진', '자신감 넘치는', '덜렁거리는', '게으른 뒹굴뒹굴', '열정 만수르', '겁이 많은', '새침떼기', '의욕 상실한', '돈을 좋아하는'],
  '🖌️ 화풍': ['귀여운 2D 만화풍', '한국 웹툰 스타일', '손그림 낙서풍', '부드러운 수채화풍', '색연필 동화책풍', '레트로 애니메이션풍', '깔끔한 미니멀 벡터', '통통 튀는 팝아트풍', '굵은 선의 코믹북풍', '도트 픽셀 아트풍', '종이 콜라주풍', '빈티지 인쇄 만화풍'],
  '👕 의상': ['의사 가운', '요리사 앞치마', '회사원 정장', '오버핏 후드티', '멜빵바지', '교복', '트레이닝복', '우비', '포근한 잠옷', '마법사 망토', '화려한 드레스', '스포티한 캡모자', '두꺼운 패딩', '가죽 자켓', '단정한 셔츠와 넥타이', '화사한 꽃무늬 원피스', '힙한 스트릿 패션', '전통 무술 도복', '따뜻한 니트 스웨터', '귀여운 동물 잠옷', '우주복', '탐험가 조끼와 모자', '수영복과 튜브', '클래식한 트렌치코트', '반짝이는 요정 날개', '왕관과 망토', '청바지와 흰 티', '명탐정 코트와 모자'],
  '🎒 소품/동작': ['스마트폰을 든', '커피잔을 든', '선글라스를 낀', '헤드폰을 낀', '노트북을 하는', '책을 읽는', '풍선을 든', '꽃다발을 안고 있는', '마이크를 잡고 노래하는', '게임패드를 쥐고 있는', '프라이팬을 들고 있는', '커다란 돋보기를 든', '스케치북에 그림 그리는', '마법 지팡이를 휘두르는', '장바구니를 들고 있는', '우산을 쓰고 있는', '팝콘을 먹고 있는', '청소기를 돌리는', '망원경으로 엿보는', '요가 매트에서 스트레칭하는', '스마트워치를 확인하는', '돈다발을 쥐고 있는'],
  '🌈 배경/효과': ['반짝반짝 빛나는 효과', '하트 뿅뿅 날리는', '별빛이 내리는', '네온사인 번쩍이는', '만화적인 집중선', '벚꽃이 흩날리는', '불타오르는 이펙트', '땀방울이 튀는', '우울한 먹구름', '무지개빛 아우라', '펑 터지는 폭발', '어두운 그림자', '스포트라이트 조명', '눈보라가 치는', '번개가 치는', '뽀글뽀글 거품', '따뜻한 햇살', '음표가 떠다니는', '바람에 흩날리는']
};

const CHARACTER_TAGS_EN = {
  '🐱 Animal': ['Shiba Inu', 'Orange Cat', 'Pomeranian', 'Baby Penguin', 'Chubby Bunny', 'Playful Monkey', 'Hamster', 'Squirrel', 'Baby Bear', 'Fennec Fox', 'Quokka', 'Baby Duck', 'Panda', 'Hedgehog', 'Alpaca', 'Baby Pig', 'Slow Sloth', 'Baby Elephant', 'Cute Otter', 'Baby Seal', 'Welsh Corgi', 'Capybara', 'Little Chick', 'Raccoon', 'Baby Lion'],
  '👦 Person': ['Bob hair girl', 'Nerd with glasses', 'Two-block boy', 'Curly hair lady', 'Bearded man', 'Ponytail athlete', 'Pigtail girl', 'Hipster with beanie', 'Gentleman in suit', 'Kid in Hanbok', 'Career woman in suit', 'Gentle white-haired grandma', 'Grandpa with cane', 'Kindergartener in yellow hat', 'Rapper with sunglasses', 'Barista with apron', 'Buzz-cut soldier', 'Pro gamer with headphones', 'Muscular gym bro', 'Backpacker with camera', 'Doctor in gown', 'Police officer in uniform', 'Rockstar playing guitar', 'Skateboarder boy', 'Glamorous K-pop idol', 'Friendly neighborhood guy', 'Yoga instructor', 'Architect with hard hat', 'Parisian painter', 'Motorcycle rider', 'Florist', 'Job seeker with backpack', 'Tired office worker', 'Baker in apron', 'Mechanic in coveralls', 'Scholar in Hanbok', 'Cowboy with hat', 'Pirate captain with eyepatch', 'Flashy magician', 'Ballet dancer', 'Jobless person in tracksuit', 'Scientist in lab coat', 'Handsome guy in jeans', 'Princess in a dress', 'Knight in armor', 'Taekwondo master', 'Flight attendant', 'Cameraman', 'Mountaineer', 'Announcer with microphone', 'Judge in robes', 'Firefighter', 'Chef with toque', 'Part-timer in a cap', 'Farmer in straw hat', 'Forest girl with flower crown', 'Student eating snacks', 'Surfer with board', 'Job seeker with hair roll'],
  '🦄 Fantasy/Object': ['Unicorn', 'Baby Dragon', 'Little Wizard', 'Forest Fairy', 'Soft Mochi', 'Sweet Macaron', 'Strawberry Cake', 'Chubby Dumpling', 'Little Vampire', 'Little Mermaid', 'Brave Little Knight', 'Alien', 'Baby Nine-tailed Fox', 'Cute Goblin', 'Shining Angel', 'Playful Baby Devil', 'Talking Fish Pastry', 'Cotton Candy Cloud', 'Mysterious Mermaid', 'Winged Pegasus', 'Talking Pumpkin', 'Astronaut', 'Magic Broom', 'Jelly Monster', 'Snowman Fairy'],
  '👀 Appearance': ['Round face', 'Large sparkling eyes', 'Chubby cheeks', 'Short chubby limbs', 'Small round nose', 'Rosy cheeks', 'Fluffy fur', 'Soft jelly-like body', 'Long pointy ears', 'Tiny fangs', 'Freckles', 'Side bangs covering one eye', 'Round glasses', 'Fluffy tail', 'Small wings', 'Star-shaped pupils', 'Heart-shaped cheek mark', 'Mini chibi proportions'],
  '✨ Trait/Emotion': ['Playful', 'Chic and haughty', 'Gentle and kind', 'Always tired', 'Full of aegyo', 'Angry', 'Laid-back', 'Tearful', 'Active', 'Timid', 'Quirky', 'Sweet', 'Always hungry', 'Full of curiosity', 'Always serious', 'Full of bluff', 'In love', 'Brimming with confidence', 'Clumsy', 'Lazy and rolling around', 'Overly passionate', 'Easily scared', 'Coy', 'Lost motivation', 'Money-loving'],
  '🖌️ Art Style': ['Cute 2D cartoon', 'Korean webtoon style', 'Hand-drawn doodle', 'Soft watercolor', 'Colored-pencil storybook', 'Retro animation', 'Clean minimal vector', 'Vibrant pop art', 'Bold comic-book style', 'Pixel art', 'Paper collage', 'Vintage print cartoon'],
  '👕 Outfit': ['Doctor coat', 'Chef apron', 'Office suit', 'Oversized hoodie', 'Overalls', 'School uniform', 'Tracksuit', 'Raincoat', 'Cozy pajamas', 'Wizard cloak', 'Fancy dress', 'Sporty cap', 'Thick puffer jacket', 'Leather jacket', 'Neat shirt and tie', 'Bright floral dress', 'Hip street fashion', 'Traditional martial arts uniform', 'Warm knit sweater', 'Cute animal onesie', 'Spacesuit', 'Explorer vest and hat', 'Swimsuit and tube', 'Classic trench coat', 'Sparkling fairy wings', 'Crown and cape', 'Jeans and white tee', 'Detective coat and hat'],
  '🎒 Prop/Action': ['Holding a smartphone', 'Holding a coffee cup', 'Wearing sunglasses', 'Wearing headphones', 'Using a laptop', 'Reading a book', 'Holding a balloon', 'Hugging a bouquet', 'Singing with a microphone', 'Holding a gamepad', 'Holding a frying pan', 'Holding a large magnifying glass', 'Drawing on a sketchbook', 'Swinging a magic wand', 'Holding a shopping basket', 'Holding an umbrella', 'Eating popcorn', 'Using a vacuum cleaner', 'Peeking through binoculars', 'Stretching on a yoga mat', 'Checking a smartwatch', 'Holding a wad of cash'],
  '🌈 Effect/BG': ['Sparkling effect', 'Floating hearts', 'Falling starlight', 'Flashing neon signs', 'Comic focus lines', 'Falling cherry blossoms', 'Flaming effect', 'Splashing sweat drops', 'Gloomy dark clouds', 'Rainbow aura', 'Explosion popping', 'Dark shadow', 'Spotlight illumination', 'Blizzard blowing', 'Lightning striking', 'Bubbling foam', 'Warm sunshine', 'Floating music notes', 'Blowing in the wind']
};

const I18N = {
  ko: {
    title: 'Prompt Studio',
    step1: '캐릭터 설정',
    whatCharacter: '캐릭터 묘사',
    clear: '초기화',
    placeholder: '예: 동글동글 귀여운 노란 고양이',
    characterSource: '캐릭터 기준',
    directSource: '✏️ 직접 설정',
    photoSource: '📷 사진 참고',
    photoMethod: '사진 반영 방식',
    photoExact: '최대한 닮게',
    photoFeatures: '특징만 반영',
    photoCharacterize: '귀엽게 캐릭터화',
    photoAttachGuide: '프롬프트를 복사한 뒤 ChatGPT 또는 Gemini에 참고할 사진도 함께 첨부해 주세요.',
    photoActive: '참고 이미지 사용',
    phrases: '이모티콘 문구 그리드',
    themeSelect: '테마 선택',
    randomMix: '랜덤',
    gptCopy: 'Copy for ChatGPT',
    geminiCopy: 'Copy for Gemini',
    previewTitle: '프롬프트 미리보기',
    forGpt: 'ChatGPT용',
    forGemini: 'Gemini용',
    guideTitle: '활용 가이드',
    guide1Q: '🤔 AI 이모티콘 프롬프트 메이커란?',
    guide1A: '캐릭터와 문구는 떠오르는데 AI에게 어떻게 요청해야 할지 막막하셨나요?\n원하는 캐릭터 특징과 상황을 고르면\nChatGPT와 Gemini에서 바로 활용할 수 있는 이모티콘 제작 프롬프트를\n자동으로 조합해 주는 웹 유틸리티입니다.',
    guide2Q: '💡 ChatGPT vs Gemini 어떤 것을 써야 할까요?',
    guide2A: '각 AI 이미지 생성 기능의 장점이 다르므로 목적에 맞게 골라 쓰세요!\n\n🟢 ChatGPT 추천: "이미지 안에 정확한 대사가 필요한 경우"\n• 문구를 포함한 이모티콘 시안을 만들 때 활용하기 좋습니다.\n• 문구가 길거나 중요한 경우 생성 후 철자를 꼭 확인하세요.\n\n🔵 Gemini 이미지 생성 추천: "표정과 행동 중심의 이모티콘"\n• 캐릭터의 표정, 몸짓과 시각 효과로 상황을 표현할 때 활용하기 좋습니다.\n• 시트 전체는 초안으로 만들고, 최종 결과는 15종 개별 분할에서 한 장씩 생성하면 캐릭터 일관성을 관리하기 쉽습니다.\n• 필요하면 Gemini용 글자 설정에서 문구 포함을 선택할 수 있습니다.',
    modeSheet: '📱 시트 전체 (15종)',
    modeIndividual: '🖼️ 자유 개별 (1종)',
    modeBatch: '📋 15종 개별 분할',
    individualTip: '💡 일관성 팁: 전체 시트(15종)를 먼저 생성한 후, 동일한 채팅창에서 개별 모드 프롬프트를 이어서 입력하세요.',
    batchTip: '문구를 누르면 현재 선택된 AI의 1개 이미지용 프롬프트가 바로 복사됩니다.',
    individualInput: '표현할 문구나 상황 직접 입력',
    individualPlaceholder: '예: 눈물을 흘리며 슬퍼하는 모습',
    batchSelect: '미리볼 문구 선택',
    selectedPhrase: '선택 문구',
    copiedPrompt: '프롬프트 복사 완료',
    gptTextMode: 'ChatGPT 이미지 글자',
    gptIncludeText: '문구 포함',
    gptNoText: '글자 없이',
    gptBackgroundMode: 'ChatGPT 배경',
    gptTransparent: '투명 배경',
    gptSolid: '단색 배경',
    gptChroma: '크로마키',
    gptWorkflowTip: 'ChatGPT 팁: 문구 정확도가 중요하면 시트 전체로 초안을 만든 뒤 15종 개별 분할에서 한 장씩 생성해 확인하세요.',
    geminiTextMode: 'Gemini 이미지 글자',
    geminiNoText: '글자 없이',
    geminiIncludeText: '문구 포함',
    geminiStageMode: 'Gemini 작업 단계',
    geminiReferenceStage: '① 기준 캐릭터 만들기',
    geminiFinalStage: '② 기준 이미지로 생성',
    geminiReferenceTip: '먼저 문구 없는 기준 캐릭터를 만든 뒤, 마음에 드는 결과 이미지를 저장하세요.',
    geminiFinalTip: '저장한 기준 캐릭터 이미지를 Gemini에 다시 첨부하고 15종 개별 분할에서 한 장씩 생성하세요.',
    geminiRepairTitle: '결과 보정 프롬프트',
    geminiRepairIdentity: '캐릭터가 달라졌어요',
    geminiRepairCrop: '몸이 잘렸어요',
    geminiRepairText: '문구가 틀렸어요',
    geminiWorkflowTip: 'Gemini 팁: 시트 전체는 캐릭터와 구도 초안용으로 사용하고, 최종 이미지는 15종 개별 분할로 한 장씩 만드는 것을 권장합니다.',
    emptyPhraseError: '비어 있는 문구가 있습니다. 모든 문구를 입력해 주세요.',
    duplicatePhraseError: '중복된 문구가 있습니다. 서로 다른 문구로 수정해 주세요.',
    guide3Q: '✂️ 배경(누끼)은 어떻게 쉽게 지우나요?',
    guide3A: 'PC에서는 무료 웹사이트(remove.bg)나 국민 뷰어 알씨(ALSee)의 "이미지 편집 - AI 배경 제거" 기능을 이용하면 클릭 한 번에 누끼를 딸 수 있습니다. 스마트폰은 갤러리/사진 앱에서 피사체를 꾹 눌러 "복사/저장"하면 배경이 자동으로 투명해집니다.',
    guide4Q: '💬 만든 이모티콘을 카톡에 어떻게 쓰나요?',
    guide4A: '두 가지 방법이 있습니다. 목적에 따라 선택해 보세요!\n\n💰 1. 정식 출시 및 판매를 원할 때\n• "카카오 이모티콘 스튜디오" 사이트에서 제안을 신청해야 합니다.\n• 360x360px 규격의 투명 PNG 이미지 32종을 준비해 제출합니다.\n• 카카오의 내부 심사를 통과하면 공식 스토어에 출시됩니다.\n\n✨ 2. 지인들과 가볍게 무료로 쓸 때 (개인 소장용)\n• 배경을 투명하게 지운 PNG 파일을 스마트폰 갤러리에 저장합니다.\n• 카톡 채팅방에서 [+] 버튼 > [앨범]을 눌러 이미지를 전송합니다.\n• 배경이 투명해서 네모난 사진 테두리가 보이지 않고, 진짜 판매용 스티커처럼 대화창에 아주 깔끔하게 올라갑니다!',
  },
  en: {
    title: 'Prompt Studio',
    step1: 'Character Description',
    whatCharacter: 'Description',
    clear: 'Clear',
    placeholder: 'e.g., A round, yellow cat who loves bread',
    characterSource: 'Character source',
    directSource: '✏️ Build manually',
    photoSource: '📷 Use a photo',
    photoMethod: 'Photo reference style',
    photoExact: 'Match closely',
    photoFeatures: 'Keep key features',
    photoCharacterize: 'Cute character version',
    photoAttachGuide: 'After copying the prompt, attach the reference photo in ChatGPT or Gemini as well.',
    photoActive: 'Reference image enabled',
    phrases: 'Phrase Grid',
    themeSelect: 'Select Theme',
    randomMix: 'Random Mix',
    gptCopy: 'Copy for ChatGPT',
    geminiCopy: 'Copy for Gemini',
    previewTitle: 'Prompt Preview',
    forGpt: 'For ChatGPT',
    forGemini: 'For Gemini',
    guideTitle: 'User Guide',
    guide1Q: '🤔 What is AI Emoji Prompt Maker?',
    guide1A: 'Have a sticker idea but are not sure how to describe it to AI?\nChoose a character concept and phrases, and this utility will automatically build ready-to-use sticker prompts for ChatGPT and Gemini.',
    guide2Q: '💡 ChatGPT vs Gemini: Which one to use?',
    guide2A: 'Use ChatGPT when text inside the image is important. Use Gemini image generation for expression- and action-focused stickers. Treat a full sheet as a draft, then generate final stickers one at a time with Batch Split for easier consistency control.',
    modeSheet: '📱 Full Sheet (15x)',
    modeIndividual: '🖼️ Single Free (1x)',
    modeBatch: '📋 Batch Split (15x)',
    individualTip: '💡 Tip: For consistency, generate a Full Sheet first, then use this prompt in the SAME chat.',
    batchTip: 'Select a phrase to instantly copy its single-sticker prompt for the active AI.',
    individualInput: 'Enter a phrase or situation',
    individualPlaceholder: 'e.g., crying sadly with big tears',
    batchSelect: 'Select a phrase to preview',
    selectedPhrase: 'Selected phrase',
    copiedPrompt: 'Prompt copied',
    gptTextMode: 'Text in ChatGPT image',
    gptIncludeText: 'Include phrase',
    gptNoText: 'No text',
    gptBackgroundMode: 'ChatGPT background',
    gptTransparent: 'Transparent',
    gptSolid: 'Solid color',
    gptChroma: 'Chroma key',
    gptWorkflowTip: 'ChatGPT tip: If exact text matters, use the full sheet as a draft, then generate and verify each final sticker with Batch Split.',
    geminiTextMode: 'Text in Gemini image',
    geminiNoText: 'No text',
    geminiIncludeText: 'Include phrase',
    geminiStageMode: 'Gemini workflow stage',
    geminiReferenceStage: '① Create base character',
    geminiFinalStage: '② Generate from reference',
    geminiReferenceTip: 'First create a text-free base character, then save the result you like.',
    geminiFinalTip: 'Attach the saved base character image again and generate each final sticker with Batch Split.',
    geminiRepairTitle: 'Result correction prompts',
    geminiRepairIdentity: 'Character changed',
    geminiRepairCrop: 'Body was cropped',
    geminiRepairText: 'Phrase is wrong',
    geminiWorkflowTip: 'Gemini tip: Use the full sheet as a character and layout draft, then generate final images one at a time with Batch Split.',
    emptyPhraseError: 'One or more phrases are empty. Please fill in every phrase.',
    duplicatePhraseError: 'Duplicate phrases found. Please use a different phrase for each sticker.',
    guide3Q: '✂️ How do I remove the background?',
    guide3A: 'On PC, you can use free tools like remove.bg or ALSee (AI Background Removal) to extract the character in 1 click. On smartphones, long-press the subject in your default Gallery/Photos app and select "Copy/Save" to extract it with a transparent background.',
    guide4Q: '💬 How do I use them in messenger apps?',
    guide4A: 'For official sales, you must submit them to platforms like LINE Creators Market. For personal use, simply save the transparent PNG to your gallery and send it as a regular photo in the chat. It will display cleanly like a sticker.',
  }
};

const ADSENSE_CLIENT_ID = 'ca-pub-2418297087346563';
const IS_AD_CONFIGURED = ADSENSE_CLIENT_ID !== 'ca-pub-0000000000000000';

const AdBanner = () => {
  useEffect(() => {
    if (!IS_AD_CONFIGURED) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);

  if (!IS_AD_CONFIGURED) return null;

  return (
    <div className="text-center mt-lg md:mt-xl p-4 md:p-md bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-bubbly overflow-hidden">
      <p className="text-[12px] text-neutral-500 mb-2 text-left">Advertisement</p>
      <ins className="adsbygoogle"
           style={{display: 'block', minHeight: '90px'}}
           data-ad-client={ADSENSE_CLIENT_ID}
           data-ad-slot="1234567890"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
};

const InfoSection = ({ t, lang }) => {
  const [activeTab, setActiveTab] = useState('model'); // 'model' | 'bg' | 'usage'

  return (
    <section id="guide-section" className="flex flex-col gap-sm mt-xl mb-xl">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
        <h2 className="flex items-center gap-2 text-headline-sm font-bold text-on-surface whitespace-nowrap">
          <HelpCircle size={24} className="text-primary-strong" />
          {t.guideTitle}
        </h2>
        
        {/* 탭 헤더 */}
        <div className="flex flex-wrap gap-2 bg-mint-soft p-1.5 rounded-2xl border border-mint-border shadow-sm w-full lg:w-auto">
          <button 
            onClick={() => setActiveTab('model')}
            className={`interactive-control whitespace-nowrap flex-shrink-0 px-4 py-1.5 text-[14px] font-bold rounded-full ${activeTab === 'model' ? 'bg-mint text-mint-strong shadow-sm border border-mint-border' : 'text-mint-strong hover:bg-mint-hover'}`}
          >
            🤖 ChatGPT vs Gemini
          </button>
          <button 
            onClick={() => setActiveTab('bg')}
            className={`interactive-control whitespace-nowrap flex-shrink-0 px-4 py-1.5 text-[14px] font-bold rounded-full ${activeTab === 'bg' ? 'bg-mint text-mint-strong shadow-sm border border-mint-border' : 'text-mint-strong hover:bg-mint-hover'}`}
          >
            ✂️ {lang === 'ko' ? '배경(누끼) 제거' : 'Remove Background'}
          </button>
          <button 
            onClick={() => setActiveTab('usage')}
            className={`interactive-control whitespace-nowrap flex-shrink-0 px-4 py-1.5 text-[14px] font-bold rounded-full ${activeTab === 'usage' ? 'bg-mint text-mint-strong shadow-sm border border-mint-border' : 'text-mint-strong hover:bg-mint-hover'}`}
          >
            💬 {lang === 'ko' ? '메신저 스티커 등록' : 'Use in Messengers'}
          </button>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="bg-surface-container-lowest rounded-3xl p-md shadow-bubbly border border-outline-variant">
        <div className="min-h-[250px]">
        {activeTab === 'model' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-4 mt-2">
            <p className="text-[15px] font-bold text-on-surface px-2">
              {lang === 'ko' ? '각 AI 모델의 강력한 장점이 다르므로 목적에 맞게 골라 쓰세요!' : 'Choose the right AI model for your specific needs!'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ChatGPT Card */}
              <div className="bg-surface-variant/30 p-5 rounded-3xl border border-outline-variant flex flex-col gap-4 hover:shadow-md transition-shadow group relative">
                <div className="font-bold text-[16px] text-on-surface group-hover:text-primary-strong transition-colors">🟢 {lang === 'ko' ? 'ChatGPT 이미지 생성 추천' : 'ChatGPT Image Generation'}</div>
                <div className="font-black text-[18px] text-primary-strong -mt-3">{lang === 'ko' ? '"대사가 꼭 필요한 이모티콘"' : '"Emoticons with essential text"'}</div>
                
                <div className="w-full h-56 rounded-2xl bg-white border border-outline-variant shadow-sm relative overflow-hidden group">
                  <img src="/chatgpt_real.jpg" alt="ChatGPT Actual Result" className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-1 rounded-md">
                    {lang === 'ko' ? '실제 유저 생성본 ✨' : 'Actual user creation ✨'}
                  </div>
                </div>

                <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-2 mt-2 break-keep">
                  {lang === 'ko' ? (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">특징:</strong> 한글 타이포그래피(글씨 쓰기) 능력이 압도적으로 뛰어납니다.</li>
                      <li>• 💬 <strong className="text-on-surface">예시:</strong> 캐릭터가 "고마워!" 라고 외치는 말풍선 텍스트가 시트에 꼭 들어가야 할 때 필수입니다.</li>
                      <li>• 🎨 <strong className="text-on-surface">화풍:</strong> 부드럽고 몽글몽글한 3D 렌더링, 파스텔톤 수채화 느낌을 내는 데 아주 강합니다.</li>
                    </>
                  ) : (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">Feature:</strong> Unmatched Korean typography and text rendering.</li>
                      <li>• 💬 <strong className="text-on-surface">Usage:</strong> Essential when speech bubbles or text like "Thanks!" must be included.</li>
                      <li>• 🎨 <strong className="text-on-surface">Style:</strong> Very strong at soft 3D rendering and pastel watercolor styles.</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Gemini Card */}
              <div className="bg-surface-variant/30 p-5 rounded-3xl border border-outline-variant flex flex-col gap-4 hover:shadow-md transition-shadow group relative">
                <div className="font-bold text-[16px] text-on-surface group-hover:text-primary-strong transition-colors">🔵 {lang === 'ko' ? 'Gemini 이미지 생성 추천' : 'Gemini Image Generation'}</div>
                <div className="font-black text-[18px] text-primary-strong -mt-3">{lang === 'ko' ? '"표정과 행동으로 말하는 이모티콘"' : '"Emoticons speaking through expressions"'}</div>
                
                <div className="w-full h-56 rounded-2xl bg-white border border-outline-variant shadow-sm relative overflow-hidden group">
                  <img src="/gemini_real.png" alt="Gemini Actual Result" className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-1 rounded-md">
                    {lang === 'ko' ? '실제 유저 생성본 ✨' : 'Actual user creation ✨'}
                  </div>
                </div>

                <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-2 mt-2 break-keep">
                  {lang === 'ko' ? (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">특징:</strong> 채택한 기준 이미지를 다시 첨부해 한 장씩 변형할 때 캐릭터 특징을 안정적으로 이어가기 좋습니다.</li>
                      <li>• 💬 <strong className="text-on-surface">예시:</strong> 기준 캐릭터를 먼저 만든 뒤, 글씨 없이 표정과 몸짓 중심의 개별 이미지를 만들 때 활용하기 좋습니다.</li>
                      <li>• 🎨 <strong className="text-on-surface">권장:</strong> 15컷 시트는 구도 초안으로 사용하고 최종 이미지는 15종 개별 분할에서 생성하세요.</li>
                    </>
                  ) : (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">Feature:</strong> Works best when an accepted base image is attached again for one-at-a-time variations.</li>
                      <li>• 💬 <strong className="text-on-surface">Usage:</strong> Create the base character first, then generate individual expression- and action-focused images.</li>
                      <li>• 🎨 <strong className="text-on-surface">Recommended:</strong> Use the 15-panel sheet as a draft and Batch Split for final assets.</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Unified Tip Box */}
            <div className="bg-primary/10 text-primary-strong p-4 rounded-3xl border border-primary/20 mt-2 flex gap-3 items-start shadow-sm">
              <span className="text-[20px] drop-shadow-sm leading-none mt-0.5">📸</span>
              <div>
                <strong className="font-bold block mb-1 text-[15px]">{lang === 'ko' ? '공용 활용 꿀팁!' : 'Pro Tip!'}</strong>
                <span className="text-[14px] leading-relaxed opacity-90 break-keep block">
                  {lang === 'ko' ? 
                    '사진을 첨부하면 인물이나 반려동물의 특징을 반영한 캐릭터를 만들 수 있습니다. ChatGPT는 문구가 필요한 이미지에 활용하고, Gemini는 마음에 드는 기준 캐릭터를 만든 뒤 그 이미지를 다시 첨부해 한 장씩 변형해 보세요.' : 
                    'Attach a photo to reflect recognizable features. Use ChatGPT when text matters, and with Gemini create a base character first, then attach that accepted result again for one-at-a-time variations.'
                  }
                </span>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'bg' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col gap-5 mb-6">
              <p className="text-[16px] font-black text-on-surface px-2 tracking-tight">
                {lang === 'ko' ? '가장 쉽고 빠르게 이모티콘 배경을 투명하게(누끼) 만드는 방법을 소개합니다!' : 'How to easily and quickly remove backgrounds from your emoticons!'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PC Guide */}
                <div className="bg-[#FAF9F6] p-5 rounded-[32px] border border-[#E5E0D8] flex flex-col gap-4">
                  <div className="flex items-center gap-2 font-bold text-[#5C3A21] text-[16px] ml-2">
                    <span className="text-[18px]">💻</span> {lang === 'ko' ? 'PC에서 작업할 때' : 'Working on PC'}
                  </div>
                  <div className="flex flex-col gap-3 h-full">
                    <div className="bg-white p-5 rounded-[28px] border border-[#E5E0D8] shadow-sm flex-1 flex flex-col">
                      <strong className="text-on-surface block mb-2 text-[15px]">{lang === 'ko' ? '방법 1: remove.bg 웹사이트' : 'Method 1: remove.bg website'}</strong>
                      <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-1.5 break-keep list-decimal pl-4 mb-3">
                        {lang === 'ko' ? (
                          <>
                            <li>인터넷 창을 열고 <strong>remove.bg</strong> 사이트에 접속합니다.</li>
                            <li>AI로 만든 이미지를 화면에 <strong>드래그 앤 드롭</strong> 합니다.</li>
                            <li>약 3초 뒤, AI가 자동으로 배경을 투명하게 날려줍니다.</li>
                            <li>결과물을 확인하고 파란색 <strong>[다운로드]</strong> 버튼을 누릅니다.</li>
                            <li>PC에 투명한 배경의 PNG 캐릭터가 따로 저장됩니다!</li>
                          </>
                        ) : (
                          <>
                            <li>Open a browser and visit <strong>remove.bg</strong>.</li>
                            <li><strong>Drag and drop</strong> your AI image onto the screen.</li>
                            <li>After 3 seconds, AI removes the background automatically.</li>
                            <li>Check the result and click the blue <strong>[Download]</strong> button.</li>
                            <li>A transparent PNG is saved on your PC!</li>
                          </>
                        )}
                      </ul>
                      <a href="https://www.remove.bg/ko" target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 hover:underline font-bold text-[14px] transition-colors inline-flex items-center gap-1 mt-auto">
                        <span>👉</span> {lang === 'ko' ? 'remove.bg 바로가기' : 'Go to remove.bg'}
                      </a>
                    </div>
                    <div className="bg-white p-5 rounded-[28px] border border-[#E5E0D8] shadow-sm flex-1 flex flex-col">
                      <strong className="text-on-surface block mb-2 text-[15px]">{lang === 'ko' ? '방법 2: 알씨(ALSee) 프로그램' : 'Method 2: ALSee Program'}</strong>
                      <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-1.5 break-keep list-decimal pl-4 mb-3">
                        {lang === 'ko' ? (
                          <>
                            <li>무료 이미지 뷰어 <strong>알씨(ALSee)</strong>를 설치하고 엽니다.</li>
                            <li>알씨에서 다운로드 받은 이모티콘 이미지를 엽니다.</li>
                            <li>상단 메뉴에서 <strong>"이미지 편집 ➔ AI 배경 제거"</strong>를 누릅니다.</li>
                            <li>AI가 잠시 분석한 뒤, 배경을 아주 깔끔하게 지워줍니다.</li>
                            <li><strong>[저장]</strong> 버튼을 눌러 PNG 형식으로 저장하면 끝입니다!</li>
                          </>
                        ) : (
                          <>
                            <li>Install and open the free viewer <strong>ALSee</strong>.</li>
                            <li>Open the downloaded emoticon image in ALSee.</li>
                            <li>Click <strong>"Image Edit ➔ AI Background Removal"</strong> in the top menu.</li>
                            <li>AI analyzes and cleanly removes the background.</li>
                            <li>Click <strong>[Save]</strong> to save as a transparent PNG!</li>
                          </>
                        )}
                      </ul>
                      <a href="https://www.altools.co.kr/download/alsee.aspx" target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 hover:underline font-bold text-[14px] transition-colors inline-flex items-center gap-1 mt-auto">
                        <span>👉</span> {lang === 'ko' ? '알씨 다운로드' : 'Download ALSee'}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Mobile Guide */}
                <div className="bg-[#FAF9F6] p-5 rounded-[32px] border border-[#E5E0D8] flex flex-col gap-4">
                  <div className="flex items-center gap-2 font-bold text-[#5C3A21] text-[16px] ml-2">
                    <span className="text-[18px]">📱</span> {lang === 'ko' ? '스마트폰에서 작업할 때' : 'Working on Smartphone'}
                  </div>
                  <div className="flex flex-col gap-3 h-full">
                    <div className="bg-white p-5 rounded-[28px] border border-[#E5E0D8] shadow-sm flex-1 flex flex-col">
                      <strong className="text-on-surface block mb-2 text-[15px] flex items-center gap-1.5"><span className="text-[16px]">🤖</span> {lang === 'ko' ? '갤럭시 (Galaxy)' : 'Galaxy'}</strong>
                      <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-1.5 break-keep list-decimal pl-4">
                        {lang === 'ko' ? (
                          <>
                            <li>AI로 만든 이미지를 <strong>기본 갤러리 앱</strong>에서 엽니다.</li>
                            <li>원하는 캐릭터를 손가락으로 <strong>1초 이상 꾹~ 누릅니다.</strong></li>
                            <li>캐릭터 주변만 반짝거리며 배경과 분리됩니다.</li>
                            <li>이때 손을 떼면 나타나는 팝업 메뉴에서 <strong>"이미지로 저장"</strong>을 누릅니다.</li>
                            <li>갤러리에 투명한 배경의 캐릭터가 새롭게 저장됩니다!</li>
                          </>
                        ) : (
                          <>
                            <li>Open the AI image in the <strong>default Gallery app</strong>.</li>
                            <li><strong>Long press</strong> the character for at least 1 second.</li>
                            <li>The subject separates from the background.</li>
                            <li>Release and tap <strong>"Save as image"</strong> from the popup.</li>
                            <li>A transparent PNG is saved in your gallery!</li>
                          </>
                        )}
                      </ul>
                    </div>
                    <div className="bg-white p-5 rounded-[28px] border border-[#E5E0D8] shadow-sm flex-1 flex flex-col">
                      <strong className="text-on-surface block mb-2 text-[15px] flex items-center gap-1.5"><span className="text-[16px]">🍎</span> {lang === 'ko' ? '아이폰 (iPhone)' : 'iPhone'}</strong>
                      <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-1.5 break-keep list-decimal pl-4">
                        {lang === 'ko' ? (
                          <>
                            <li>AI로 만든 이미지를 <strong>기본 사진 앱</strong>에서 엽니다.</li>
                            <li>원하는 캐릭터를 손가락으로 <strong>1초 이상 꾹~ 누릅니다.</strong></li>
                            <li>빛이 한 바퀴 돌면서 피사체가 배경과 분리됩니다.</li>
                            <li>손을 떼고 나타나는 메뉴에서 <strong>"공유" ➔ "이미지 저장"</strong>을 누릅니다.</li>
                            <li>사진첩에 배경이 투명한 PNG 파일로 깔끔하게 저장됩니다!</li>
                          </>
                        ) : (
                          <>
                            <li>Open the AI image in the <strong>Photos app</strong>.</li>
                            <li><strong>Long press</strong> the character for at least 1 second.</li>
                            <li>The subject highlights and separates from the background.</li>
                            <li>Release and tap <strong>"Share" ➔ "Save Image"</strong>.</li>
                            <li>A transparent PNG is saved in your photos!</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Visual Tutorial for Background Removal */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 bg-[#F4F4F4] p-8 rounded-[32px] border border-[#E5E5E5]">
              
              {/* Step 1 */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-28 h-28 rounded-2xl bg-[#00FF00] flex items-center justify-center border-4 border-dashed border-primary shadow-sm relative overflow-hidden group hover:scale-105 transition-transform">
                  <span className="text-[56px] relative z-10 drop-shadow-md">🐱</span>
                </div>
                <span className="text-[13px] font-bold text-secondary-strong">{lang === 'ko' ? '1. 연두색 배경 AI 이미지' : '1. Green BG AI Image'}</span>
              </div>

              {/* Arrow */}
              <div className="text-primary-strong hidden md:block">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
              <div className="text-primary-strong md:hidden rotate-90 my-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-28 h-28 rounded-2xl bg-white flex flex-col items-center justify-center border-2 border-outline-variant shadow-bubbly relative group hover:scale-105 transition-transform">
                  <div className="absolute -top-3 -right-3 bg-error text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md animate-bounce">{lang === 'ko' ? 'AI 툴' : 'AI Tool'}</div>
                  <span className="font-black text-[16px] text-primary-strong">remove.bg</span>
                  <span className="text-[12px] text-secondary-strong font-bold mt-1">or 알씨(ALSee)</span>
                </div>
                <span className="text-[13px] font-bold text-secondary-strong">{lang === 'ko' ? '2. 클릭 한 번으로 누끼!' : '2. 1-Click Removal!'}</span>
              </div>

              {/* Arrow */}
              <div className="text-primary-strong hidden md:block">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
              <div className="text-primary-strong md:hidden rotate-90 my-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-28 h-28 rounded-2xl flex items-center justify-center border-2 border-outline-variant shadow-sm relative group hover:scale-105 transition-transform" style={{ backgroundImage: 'conic-gradient(#e5e7eb 25%, white 25%, white 50%, #e5e7eb 50%, #e5e7eb 75%, white 75%, white)', backgroundSize: '16px 16px' }}>
                  <span className="text-[64px] drop-shadow-xl z-10">🐱</span>
                </div>
                <span className="text-[13px] font-bold text-secondary-strong">{lang === 'ko' ? '3. 완벽한 투명 PNG 완성' : '3. Perfect Transparent PNG'}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col gap-5 mb-6">
              <p className="text-[16px] font-black text-on-surface px-2 tracking-tight">
                {lang === 'ko' ? '만드신 이미지를 실제 카카오톡에서 사용하는 두 가지 방법을 소개합니다!' : 'Two ways to actually use your created images in KakaoTalk!'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Method 1: Official */}
                <div className="bg-[#FAF9F6] p-5 rounded-[32px] border border-[#E5E0D8] flex flex-col gap-4">
                  <div className="flex items-center gap-2 font-bold text-[#5C3A21] text-[16px] ml-2">
                    <span className="text-[18px]">💰</span> {lang === 'ko' ? '1. 정식 출시 및 판매를 원할 때' : '1. Official Release and Sale'}
                  </div>
                  <div className="bg-white p-5 rounded-[28px] border border-[#E5E0D8] shadow-sm flex-1 flex flex-col gap-3">
                    <strong className="text-on-surface block text-[15px]">{lang === 'ko' ? '카카오 이모티콘 스튜디오 제안' : 'Kakao Emoticon Studio Submission'}</strong>
                    
                    {/* AI Policy Warning Box */}
                    <div className="bg-[#FFF5F5] text-[#D32F2F] p-4 rounded-[20px] border border-[#FFCDD2] my-1">
                      <div className="mb-2">
                        <span className="inline-flex items-center gap-1 bg-[#D32F2F] text-white text-[12px] font-bold px-2 py-0.5 rounded-md mb-1.5">
                          <span className="text-[12px] leading-none">⚠️</span> {lang === 'ko' ? '주의' : 'Warning'}
                        </span>
                        <strong className="block text-[15px] font-black tracking-tight">{lang === 'ko' ? 'AI 이미지는 그대로 등록 불가!' : 'Cannot Submit AI Images As-Is!'}</strong>
                      </div>
                      <p className="text-[13px] leading-[1.6] break-keep opacity-90">
                        {lang === 'ko' ? (
                          <>
                            현재 카카오 정책상 저작권 문제로 인해 <strong>AI가 생성한 이미지를 '그대로' 제출하는 것은 엄격히 금지</strong>되어 있습니다.<br/>
                            AI는 기발한 대사와 포즈를 뽑는 <strong>최고의 '참고용 시안'</strong>으로 활용하시고, 정식 제출은 그 시안을 바탕으로 <strong>직접 선을 따서 다시 그려서(리디자인)</strong> 제출하셔야 합니다.
                          </>
                        ) : (
                          <>
                            Due to Kakao's copyright policy, <strong>submitting AI-generated images "as-is" is strictly prohibited.</strong><br/>
                            Use AI as an excellent <strong>"reference draft"</strong>, and for official submission, you must <strong>trace and redraw (redesign) them yourself</strong> based on the draft.
                          </>
                        )}
                      </p>
                    </div>

                    <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-2 break-keep list-disc pl-5 mb-2">
                      {lang === 'ko' ? (
                        <>
                          <li><strong>이미지 준비:</strong> '직접 리디자인한' 360x360px 투명 배경 PNG 이미지 32종 준비</li>
                          <li><strong>제안하기:</strong> 스튜디오 사이트에 접속하여 준비한 이미지를 업로드</li>
                          <li><strong>심사 대기:</strong> 내부 심사 통과 시 정식 상품으로 출시되어 수익 창출 가능!</li>
                        </>
                      ) : (
                        <>
                          <li><strong>Prepare Images:</strong> Prepare 32 'redrawn' 360x360px transparent PNG images.</li>
                          <li><strong>Submit:</strong> Upload your prepared images to the Studio website.</li>
                          <li><strong>Wait for Review:</strong> If approved, it becomes an official product!</li>
                        </>
                      )}
                    </ul>
                    <a href="https://emoticonstudio.kakao.com/" target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 hover:underline font-bold text-[14px] transition-colors inline-flex items-center gap-1 mt-auto">
                      <span>👉</span> {lang === 'ko' ? '카카오 이모티콘 스튜디오 바로가기' : 'Kakao Emoticon Studio'}
                    </a>
                  </div>
                </div>

                {/* Method 2: Personal */}
                <div className="bg-[#FAF9F6] p-5 rounded-[32px] border border-[#E5E0D8] flex flex-col gap-4">
                  <div className="flex items-center gap-2 font-bold text-[#5C3A21] text-[16px] ml-2">
                    <span className="text-[18px]">✨</span> {lang === 'ko' ? '2. 지인들과 가볍게 무료로 쓸 때' : '2. Casual Free Use with Friends'}
                  </div>
                  <div className="bg-white p-5 rounded-[28px] border border-[#E5E0D8] shadow-sm flex-1 flex flex-col gap-3">
                    <strong className="text-on-surface block mb-1 text-[15px]">{lang === 'ko' ? '개인 소장용 (채팅방 꼼수)' : 'Personal Use (Chatroom Trick)'}</strong>
                    
                    {/* Visual Example Image */}
                    <div className="w-full h-40 rounded-[20px] overflow-hidden border border-[#E5E0D8] my-1 shadow-sm relative group">
                      <img src="/chat_trick.jpg" alt="채팅방 전송 예시" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[#5C3A21] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <span>📸</span> {lang === 'ko' ? '전송 예시' : 'Example'}
                      </div>
                    </div>

                    <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-2 break-keep list-decimal pl-5">
                      {lang === 'ko' ? (
                        <>
                          <li>위의 [배경(누끼) 제거] 가이드에 따라 <strong>투명 배경으로 만든 PNG 파일</strong>을 스마트폰 갤러리에 저장합니다.</li>
                          <li>카카오톡 채팅방에서 입력창 옆의 <strong>[+] 버튼 ➔ [앨범]</strong>을 누릅니다.</li>
                          <li>갤러리에서 투명하게 만든 캐릭터 이미지를 선택하여 전송합니다.</li>
                        </>
                      ) : (
                        <>
                          <li>Save the <strong>transparent background PNG file</strong> to your smartphone gallery using the background removal guide above.</li>
                          <li>In a KakaoTalk chatroom, tap the <strong>[+] button ➔ [Album]</strong> next to the input field.</li>
                          <li>Select and send the transparent character image from your gallery.</li>
                        </>
                      )}
                    </ul>
                    <div className="mt-auto bg-primary/10 text-primary-strong font-bold text-[13px] p-3 rounded-2xl flex items-start gap-2 leading-relaxed">
                      <span className="text-[16px] leading-none mt-0.5">💡</span>
                      {lang === 'ko' ? 
                        '배경이 투명하기 때문에 하얀색 네모 테두리가 보이지 않아, 진짜로 구매한 스티커처럼 대화창에 아주 깔끔하게 올라갑니다!' : 
                        'Because the background is transparent, the white rectangular border is invisible, making it look exactly like a real purchased sticker in the chat window!'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </section>
  );
};

function App() {
  const [lang, setLang] = useState('ko');
  const t = I18N[lang];
  
  const currentThemes = lang === 'ko' ? THEMES_KO : THEMES_EN;
  const currentTags = lang === 'ko' ? CHARACTER_TAGS_KO : CHARACTER_TAGS_EN;
  const themeKeys = Object.keys(currentThemes);
  const categoryKeys = Object.keys(currentTags);
  
  const [charManual, setCharManual] = useState('');
  const [characterSource, setCharacterSource] = useState('direct');
  const [photoReferenceMode, setPhotoReferenceMode] = useState('characterize');
  const [activeTagCategory, setActiveTagCategory] = useState(categoryKeys[0]);
  
  const [emoticons, setEmoticons] = useState(currentThemes[themeKeys[0]]);
  const [activeTheme, setActiveTheme] = useState(themeKeys[0]);
  
  const [generationMode, setGenerationMode] = useState('sheet'); // 'sheet' | 'individual' | 'batch'
  const [individualPhrase, setIndividualPhrase] = useState('');
  const [batchPhrase, setBatchPhrase] = useState('');

  const [copiedType, setCopiedType] = useState(null);
  const [previewMode, setPreviewMode] = useState('gpt');
  const [gptTextMode, setGptTextMode] = useState('text');
  const [gptBackgroundMode, setGptBackgroundMode] = useState('transparent');
  const [geminiTextMode, setGeminiTextMode] = useState('visual');

  const toggleLanguage = () => {
    const newLang = lang === 'ko' ? 'en' : 'ko';
    setLang(newLang);
    const oldThemes = lang === 'ko' ? THEMES_KO : THEMES_EN;
    const oldThemeKeys = Object.keys(oldThemes);
    const newThemes = newLang === 'ko' ? THEMES_KO : THEMES_EN;
    const newThemeKeys = Object.keys(newThemes);
    const oldTags = lang === 'ko' ? CHARACTER_TAGS_KO : CHARACTER_TAGS_EN;
    const newTags = newLang === 'ko' ? CHARACTER_TAGS_KO : CHARACTER_TAGS_EN;
    const oldCategoryKeys = Object.keys(oldTags);
    const newCategoryKeys = Object.keys(newTags);
    
    if (activeTheme !== 'custom') {
      const themeIndex = oldThemeKeys.indexOf(activeTheme);
      if (themeIndex !== -1) {
        setActiveTheme(newThemeKeys[themeIndex]);
        setEmoticons(newThemes[newThemeKeys[themeIndex]]);
      } else {
        setActiveTheme(newThemeKeys[0]);
        setEmoticons(newThemes[newThemeKeys[0]]);
      }
    }

    const categoryIndex = oldCategoryKeys.indexOf(activeTagCategory);
    setActiveTagCategory(newCategoryKeys[categoryIndex] || newCategoryKeys[0]);
    
    setCharManual('');
  };

  const handleEmoticonChange = (index, value) => {
    const newEmoticons = [...emoticons];
    newEmoticons[index] = value;
    setEmoticons(newEmoticons);
    setActiveTheme('custom');
  };

  const handleThemeSelect = (e) => {
    const themeName = e.target.value;
    if (currentThemes[themeName]) {
      setEmoticons(currentThemes[themeName]);
      setActiveTheme(themeName);
    }
  };

  const shuffleEmoticons = () => {
    const ALL_PHRASES = Array.from(new Set(Object.values(currentThemes).flat()));
    const shuffled = [...ALL_PHRASES].sort(() => 0.5 - Math.random());
    setEmoticons(shuffled.slice(0, 15));
    setActiveTheme('custom');
  };

  const handleGenerationModeChange = (mode) => {
    setGenerationMode(mode);
    if (mode === 'individual' && !individualPhrase.trim()) {
      setIndividualPhrase(emoticons[0] || '');
    }
    if (mode === 'batch' && !emoticons.includes(batchPhrase)) {
      setBatchPhrase(emoticons[0] || '');
    }
  };

  const clearTags = () => {
    setCharacterSource('direct');
    setPhotoReferenceMode('characterize');
    setCharManual('');
  };

  const appendTag = (tag) => {
    const isArtStyleCategory = activeTagCategory === '🖌️ 화풍' || activeTagCategory === '🖌️ Art Style';
    if (isArtStyleCategory) {
      const artStyles = new Set([
        ...CHARACTER_TAGS_KO['🖌️ 화풍'],
        ...CHARACTER_TAGS_EN['🖌️ Art Style'],
      ]);
      setCharManual(prev => {
        const otherTags = prev.split(',').map(value => value.trim()).filter(value => value && !artStyles.has(value));
        return [...otherTags, tag].join(', ');
      });
      return;
    }
    setCharManual(prev => prev ? `${prev}, ${tag}` : tag);
  };

  const getPhotoModeLabel = (labelLanguage = lang) => ({
    exact: I18N[labelLanguage].photoExact,
    features: I18N[labelLanguage].photoFeatures,
    characterize: I18N[labelLanguage].photoCharacterize,
  }[photoReferenceMode]);

  const getReferenceImageInstruction = (promptLanguage = lang) => {
    if (characterSource !== 'photo') {
      return promptLanguage === 'ko'
        ? '만약 이 프롬프트와 함께 이미지가 첨부되었다면, 첨부 이미지의 주요 특징을 캐릭터 디자인에 반영해주세요.'
        : 'If an image is attached with this prompt, use its key visual features as reference for the character design.';
    }

    const modeInstructions = {
      exact: {
        ko: '[최대한 실물 닮게 - High Fidelity] 사진 속 대상의 실제 얼굴 비율, 눈·코·입 생김새, 헤어스타일, 털색/무늬, 실물 인상을 95% 이상 극도로 사실적이고 정교하게 그대로 유지해주세요. 과도한 만화적 변형(데포르메)을 피하고 실물과 거의 동일한 이목구비와 인상을 재현하세요.',
        en: '[HIGH LIKENESS FIDELITY] Preserve the subject\'s exact facial structure, eye/nose/mouth shapes, hairstyle, skin/fur tone, and real-life features with 95%+ visual similarity. Avoid heavy cartoonization or chibi proportions. Maintain strong realistic resemblance.',
      },
      features: {
        ko: '[핵심 특징만 포인트 반영 - Signature Feature Extraction] 사진에서 가장 대표적인 아이코닉 요소(안경, 특이한 헤어스타일, 점, 고유 표정, 의상 포인트)만 뚜렷하게 추출하여 캐릭터에 합성해주세요. 전체 조형은 감각적이고 깔끔한 2D 벡터 일러스트 스타일로 정돈하되 핵심 포인트만 강렬하게 살려주세요.',
        en: '[SIGNATURE FEATURE EXTRACTION] Extract only the iconic signature elements (e.g., glasses, unique haircut, facial mark, distinct expression/outfit) from the reference photo. Render in a clean, stylish 2D vector illustration while accentuating those key signature traits.',
      },
      characterize: {
        ko: '[극도로 귀여운 SD/Chibi 이모티콘 캐릭터화 - Cute Chibi Mascot] 2.5등신의 커다란 머리, 동글동글한 몸통, 초롱초롱한 눈망울, 과장되고 사랑스러운 이모티콘 마스코트로 파격 재해석해주세요. 원본 사진의 느낌만 살짝 남기고 극강의 귀여운 2D 마스코트 캐릭터로 변환해주세요.',
        en: '[ULTRA-CUTE CHIBI SD MASCOT] Reinterpret the subject into an extremely cute 2D Chibi SD mascot with a big head, small chubby body, huge sparkling expressive eyes, and exaggerated adorable emoji proportions. Maximize cuteness.',
      },
    };
    const promptLang = promptLanguage === 'ko' ? 'ko' : 'en';
    const intro = promptLang === 'ko'
      ? '이 프롬프트를 사용할 때 AI 채팅에 함께 첨부한 사진을 최우선 참고 이미지로 사용해주세요.'
      : 'Use the photo attached in the AI chat as the primary visual reference.';
    return `${intro}\n${modeInstructions[photoReferenceMode][promptLang]}`;
  };

  const getSelectedPhrase = () => {
    if (generationMode === 'individual') return individualPhrase.trim() || (emoticons[0] || '안녕!');
    return emoticons.includes(batchPhrase) ? batchPhrase : (emoticons[0] || '안녕!');
  };

  const getSelectedArtStyle = () => {
    const artStyles = [
      ...CHARACTER_TAGS_KO['🖌️ 화풍'],
      ...CHARACTER_TAGS_EN['🖌️ Art Style'],
    ];
    return artStyles
      .filter(style => charManual.includes(style))
      .sort((a, b) => charManual.lastIndexOf(a) - charManual.lastIndexOf(b))
      .at(-1) || '';
  };

  const getGeminiStyleTags = () => {
    const selectedArtStyle = getSelectedArtStyle();
    return selectedArtStyle
      ? `${selectedArtStyle}; treat this selected art style as the highest-priority visual direction`
      : 'cute, approachable, high-quality 2D messenger sticker illustration with clean outlines and harmonious colors';
  };

  const getSelectedCharacterRoles = () => {
    const koCategories = Object.values(CHARACTER_TAGS_KO);
    const enCategories = Object.values(CHARACTER_TAGS_EN);
    const roleTags = index => [...koCategories[index], ...enCategories[index]];
    const findSelected = indexes => indexes
      .flatMap(index => roleTags(index))
      .filter(tag => charManual.includes(tag));
    const recognizedTags = new Set([...koCategories.flat(), ...enCategories.flat()]);
    const additionalDescription = charManual
      .split(',')
      .map(value => value.trim())
      .filter(value => value && !recognizedTags.has(value))
      .join(', ');
    const subjects = findSelected([0, 1, 2]);
    const appearances = findSelected([3]);
    const personalities = findSelected([4]);
    const outfits = findSelected([6]);
    const props = findSelected([7]);
    const effects = findSelected([8]);

    return { subjects, appearances, personalities, outfits, props, effects, additionalDescription };
  };

  const getGeminiCharacterDetails = () => {
    const { subjects, appearances, personalities, outfits, props, effects, additionalDescription } = getSelectedCharacterRoles();
    const subjectParts = [
      ...(characterSource === 'photo' ? ['the subject in the attached reference photo'] : []),
      ...subjects,
      ...(additionalDescription ? [additionalDescription] : []),
    ];

    const photoAppearanceEn = {
      exact: 'preserve exact high-fidelity resemblance (95%+ likeness) to the reference photo with realistic proportions',
      features: 'extract signature iconic features (hair, glasses, distinct traits) and stylize into a clean 2D vector graphic',
      characterize: 'reinterpret into an ultra-cute 2D Chibi/SD mascot with a big head, chubby body, and huge expressive eyes',
    }[photoReferenceMode];

    const photoAppearanceKo = {
      exact: '참고 사진 속 대상과 95% 이상 극도로 닮게 이목구비와 비율을 사실적으로 재현',
      features: '참고 사진의 핵심 시그니처 포인트(안경, 헤어, 특이점)만 강렬하게 추출하여 2D 벡터 아트 스타일로 정돈',
      characterize: '2.5등신 커다란 머리와 동통한 몸체의 극도로 귀여운 SD/Chibi 이모티콘 마스코트로 파격 변환',
    }[photoReferenceMode];

    return {
      subject: subjectParts.join(', ') || 'a cute original character',
      appearance: appearances.join(', ') || (characterSource === 'photo'
        ? photoAppearanceEn
        : 'use a simple, recognizable silhouette and keep it unchanged'),
      personality: personalities.join(', ') || 'friendly and expressive',
      outfit: outfits.join(', ') || 'no fixed outfit specified; once chosen, keep it unchanged',
      props: props.join(', ') || 'none required',
      effects: effects.join(', ') || 'use only a minimal effect when it clarifies the emotion',
      artStyle: getGeminiStyleTags(),
    };
  };

  const getGptCharacterDetails = () => {
    const { subjects, appearances, personalities, outfits, props, effects, additionalDescription } = getSelectedCharacterRoles();
    const isKo = lang === 'ko';
    const subjectParts = [
      ...(characterSource === 'photo'
        ? [isKo ? 'AI 채팅에 첨부한 참고 사진 속 대상' : 'the subject in the reference photo attached in the AI chat']
        : []),
      ...subjects,
      ...(additionalDescription ? [additionalDescription] : []),
    ];

    const photoAppearanceEn = {
      exact: 'preserve exact high-fidelity resemblance (95%+ likeness) to the reference photo with realistic proportions',
      features: 'extract signature iconic features (hair, glasses, distinct traits) and stylize into a clean 2D vector graphic',
      characterize: 'reinterpret into an ultra-cute 2D Chibi/SD mascot with a big head, chubby body, and huge expressive eyes',
    }[photoReferenceMode];

    const photoAppearanceKo = {
      exact: '참고 사진 속 대상과 95% 이상 극도로 닮게 이목구비와 비율을 사실적으로 재현',
      features: '참고 사진의 핵심 시그니처 포인트(안경, 헤어, 특이점)만 강렬하게 추출하여 2D 벡터 아트 스타일로 정돈',
      characterize: '2.5등신 커다란 머리와 동통한 몸체의 극도로 귀여운 SD/Chibi 이모티콘 마스코트로 파격 변환',
    }[photoReferenceMode];

    return {
      subject: subjectParts.join(', ') || (isKo ? '귀여운 오리지널 캐릭터' : 'a cute original character'),
      appearance: appearances.join(', ') || (characterSource === 'photo'
        ? (isKo ? photoAppearanceKo : photoAppearanceEn)
        : (isKo ? '단순하고 알아보기 쉬운 실루엣을 정한 뒤 그대로 유지' : 'use a simple recognizable silhouette and keep it unchanged')),
      personality: personalities.join(', ') || (isKo ? '친근하고 표정이 풍부한' : 'friendly and expressive'),
      outfit: outfits.join(', ') || (isKo ? '지정 없음. 처음 정한 의상은 모든 이미지에서 유지' : 'not specified; once chosen, keep it unchanged'),
      props: props.join(', ') || (isKo ? '필수 소품 없음' : 'no prop required'),
      effects: effects.join(', ') || (isKo ? '감정 전달에 필요한 최소한의 효과만 사용' : 'use only a minimal effect when it clarifies the emotion'),
    };
  };

  const getGptBackgroundInstruction = () => {
    const instructions = {
      transparent: {
        ko: '진짜 알파 투명도가 적용된 투명 배경으로 생성해주세요. 투명도를 흉내 낸 체크무늬나 흰색 바탕을 그리지 마세요.',
        en: 'Generate a genuinely transparent background with alpha transparency. Do not draw a checkerboard pattern or fake transparency with a white background.',
      },
      solid: {
        ko: '캐릭터와 충분히 대비되는 하나의 깨끗한 단색 배경을 사용해주세요. 그라데이션, 질감과 배경 사물은 넣지 마세요.',
        en: 'Use one clean solid background color with strong contrast against the character. No gradient, texture, or background objects.',
      },
      chroma: {
        ko: '배경 제거가 쉽도록 캐릭터 색상과 겹치지 않는 밝은 연두색 #00FF00 단색 크로마키 배경을 사용해주세요. 배경색이 캐릭터 테두리에 묻어나면 안 됩니다.',
        en: 'Use a solid bright green #00FF00 chroma-key background that does not overlap the character colors. No green spill may appear on the character outline.',
      },
    };
    return instructions[gptBackgroundMode][lang === 'ko' ? 'ko' : 'en'];
  };

  const getPromptValidationError = (phraseOverride = null) => {
    if (generationMode === 'individual' || phraseOverride !== null) {
      const targetPhrase = generationMode === 'individual' ? individualPhrase.trim() : phraseOverride.trim();
      return targetPhrase ? '' : t.emptyPhraseError;
    }

    const normalizedPhrases = emoticons.map(phrase => phrase.trim());
    if (normalizedPhrases.some(phrase => !phrase)) return t.emptyPhraseError;
    if (new Set(normalizedPhrases).size !== normalizedPhrases.length) return t.duplicatePhraseError;
    return '';
  };

  const generateGptPrompt = (phraseOverride = null) => {
    const character = getGptCharacterDetails();
    const hasPhraseOverride = phraseOverride !== null;
    const targetPhrase = generationMode === 'individual'
      ? getSelectedPhrase()
      : (phraseOverride || '').trim();
    const referenceInstruction = `${characterSource === 'photo'
      ? `${lang === 'ko' ? `사진 반영 방식: ${getPhotoModeLabel('ko')}` : `Photo reference style: ${getPhotoModeLabel('en')}`}\n`
      : ''}${getReferenceImageInstruction(lang)}`;
    const selectedArtStyle = getSelectedArtStyle();
    const artDirection = selectedArtStyle || (lang === 'ko'
      ? '귀엽고 친근한 고품질 2D 메신저 이모티콘 스타일, 깔끔한 외곽선, 조화로운 색감'
      : 'cute, approachable, high-quality 2D messenger sticker style with clean outlines and harmonious colors');

    if (generationMode === 'individual' || hasPhraseOverride) {
      if (lang === 'ko') {
        const textPolicy = gptTextMode === 'text'
          ? `정확한 문구 "${targetPhrase}"를 이미지에 한 번만 적어주세요. 생성 전에 철자와 띄어쓰기를 확인하고, 텍스트 박스 없이 읽기 쉬운 손글씨로 표현하세요. 다른 글자는 넣지 마세요.`
          : `문구 "${targetPhrase}"는 장면을 정하는 참고 맥락으로만 사용하세요. 이미지에는 글자, 숫자, 타이포그래피를 그리지 마세요.`;
        const textExclusion = gptTextMode === 'text'
          ? '추가 문구, 틀린 철자, 임의의 글자, 숫자, 따옴표와 텍스트 박스 금지.'
          : '글자, 숫자, 타이포그래피와 의미 없는 기호 금지.';

        return `[목표]
상황을 즉시 이해할 수 있는 완성도 높은 개인용 메신저 이모티콘 1개를 그려주세요.

[참고 이미지]
${referenceInstruction}

[캐릭터 고정 정보 — 변경 금지]
대상: ${character.subject}
외형: ${character.appearance}
성격: ${character.personality}
의상: ${character.outfit}

[최우선 화풍]
${artDirection}. 선, 질감, 색감과 캐릭터 비율을 동일하게 유지해주세요.

[장면]
문구 맥락: "${targetPhrase}"
이 문구에서 바로 이해할 수 있는 표정 하나와 명확한 전신 자세 하나를 구성하세요. 보조 소품과 만화 효과는 각각 최대 하나만 사용하세요.
설정에서 선택한 소품 또는 행동: ${character.props}.
설정에서 선택한 시각 효과: ${character.effects}.

[구도 및 배경]
1:1 정사각형 캔버스. 완전한 캐릭터 한 명만 중앙에 배치하고, 전신이 잘리지 않도록 사방에 최소 12% 여백을 남겨주세요.
${getGptBackgroundInstruction()}

[일관성]
같은 채팅에 이전 시트나 캐릭터 이미지가 있다면 얼굴, 체형, 색상, 의상과 화풍을 그대로 유지하세요. 이번 장면에 필요한 표정, 자세, 보조 소품과 효과만 변경하세요.

[글자 정책]
${textPolicy}

[제외 조건]
${textExclusion} 워터마크, 프레임, 중복 캐릭터, 추가 팔다리, 잘린 신체, 복잡한 풍경과 실사 배경 금지.`;
      } else {
        const textPolicy = gptTextMode === 'text'
          ? `Render the exact phrase "${targetPhrase}" once. Verify spelling and spacing before rendering it, and use legible hand-drawn lettering without a text box. Do not add any other text.`
          : `Use "${targetPhrase}" only as visual context. Do not render text, letters, numbers, or typography.`;
        const textExclusion = gptTextMode === 'text'
          ? 'No extra words, altered spelling, random letters, numbers, quotation marks, or text box.'
          : 'No text, letters, numbers, typography, or meaningless symbols.';

        return `[GOAL]
Create one high-quality personal messenger sticker that communicates the situation immediately.

[REFERENCE IMAGE]
${referenceInstruction}

[CHARACTER IDENTITY — LOCKED]
Subject: ${character.subject}
Appearance: ${character.appearance}
Personality: ${character.personality}
Outfit: ${character.outfit}

[ART DIRECTION — HIGHEST PRIORITY]
${artDirection}. Keep the same linework, texture, color treatment, and character proportions.

[SCENE]
Phrase context: "${targetPhrase}"
Create one unmistakable facial expression and one clear full-body pose. Use at most one supporting prop and one simple comic effect.
Preferred prop or action from the setup: ${character.props}.
Preferred visual effect from the setup: ${character.effects}.

[COMPOSITION AND BACKGROUND]
Square 1:1 canvas. Exactly one complete centered character with at least 12% empty margin on every side.
${getGptBackgroundInstruction()}

[CONSISTENCY]
If a previous sheet or character image exists in this chat, preserve its face, body proportions, colors, outfit, and art style. Change only the expression, pose, supporting prop, and effect required for this scene.

[TEXT POLICY]
${textPolicy}

[EXCLUDE]
${textExclusion} No watermark, frame, duplicate character, extra limbs, cropped body, complex scenery, or photorealistic background.`;
      }
    }

    if (lang === 'ko') {
      const panelPlan = emoticons.map((phrase, index) => `${Math.floor(index / 5) + 1}행 ${index % 5 + 1}열: "${phrase.trim()}"`).join('\n');
      const textPolicy = gptTextMode === 'text'
        ? '각 셀에 지정된 문구를 정확히 한 번만 적으세요. 생성 전에 15개 문구의 철자와 띄어쓰기를 확인하고, 일관되고 읽기 쉬운 손글씨를 사용하세요. 다른 글자는 넣지 마세요.'
        : '각 문구는 해당 셀의 표정, 자세와 행동을 정하는 맥락으로만 사용하세요. 이미지에는 문구나 다른 글자를 그리지 마세요.';
      const textExclusion = gptTextMode === 'text'
        ? '추가 문구, 틀린 철자, 임의의 글자, 셀 번호, 따옴표와 텍스트 박스 금지.'
        : '글자, 숫자, 타이포그래피, 셀 번호와 의미 없는 기호 금지.';

      return `[목표]
동일한 캐릭터의 서로 다른 표현 15개가 담긴 완성도 높은 개인용 메신저 이모티콘 시트 한 장을 그려주세요.

[참고 이미지]
${referenceInstruction}

[캐릭터 고정 정보 — 변경 금지]
대상: ${character.subject}
외형: ${character.appearance}
성격: ${character.personality}
의상: ${character.outfit}

[최우선 화풍]
${artDirection}. 15개 셀 모두 같은 선, 질감, 색감과 캐릭터 비율을 적용하세요.

[패널 계획]
각 문구에서 바로 이해할 수 있는 표정 하나와 서로 다른 전신 자세 하나를 구성하세요. 셀마다 보조 소품과 만화 효과는 각각 최대 하나만 사용하고 자세를 반복하지 마세요.
설정에서 선택한 소품 또는 행동: ${character.props}.
설정에서 선택한 시각 효과: ${character.effects}.
${panelPlan}

[구도 및 배경]
가로형 캔버스에 정확히 5열 3행으로 배치하세요. 동일한 크기의 셀 15개에 완전한 캐릭터 한 명씩 배치하고, 캐릭터·소품·효과·글자가 다른 셀을 침범하지 않게 하세요. 셀 경계선, 구별선, 격자선(grid lines), 테두리선과 셀 번호는 이미지에 절대 그리지 마세요.
${getGptBackgroundInstruction()}

[일관성]
15개 셀 모두 얼굴, 체형, 색상, 의상과 화풍을 동일하게 유지하세요. 문구에 필요한 표정, 자세, 보조 소품과 효과만 변경하세요.

[글자 정책]
${textPolicy}

[제외 조건]
${textExclusion} 격자선, 셀 경계선, 구별선, 테두리선, 워터마크, 전체 프레임, 셀 안의 중복 캐릭터, 추가 팔다리, 잘린 신체, 복잡한 풍경과 실사 배경 금지.`;
    } else {
      const panelPlan = emoticons.map((phrase, index) => `Row ${Math.floor(index / 5) + 1}, Column ${index % 5 + 1}: "${phrase.trim()}"`).join('\n');
      const textPolicy = gptTextMode === 'text'
        ? 'Render each assigned phrase exactly once in its corresponding cell. Verify spelling and spacing for all 15 phrases before rendering them. Use consistent, legible hand-drawn lettering and add no other text.'
        : 'Use each phrase only as context for its cell\'s expression, pose, and action. Do not render any phrase or other text.';
      const textExclusion = gptTextMode === 'text'
        ? 'No extra words, altered spelling, random letters, cell numbers, quotation marks, or text boxes.'
        : 'No text, letters, numbers, typography, cell labels, or meaningless symbols.';

      return `[GOAL]
Create one high-quality personal messenger sticker sheet containing 15 distinct variations of the same character.

[REFERENCE IMAGE]
${referenceInstruction}

[CHARACTER IDENTITY — LOCKED]
Subject: ${character.subject}
Appearance: ${character.appearance}
Personality: ${character.personality}
Outfit: ${character.outfit}

[ART DIRECTION — HIGHEST PRIORITY]
${artDirection}. Apply identical linework, texture, color treatment, and character proportions to all 15 cells.

[PANEL PLAN]
For every phrase, create one unmistakable facial expression and one distinct full-body pose. Use at most one supporting prop and one simple comic effect per cell. Do not repeat a pose.
Preferred props or actions from the setup: ${character.props}.
Preferred visual effects from the setup: ${character.effects}.
${panelPlan}

[COMPOSITION AND BACKGROUND]
Use one wide landscape canvas with exactly 5 columns and 3 rows. Create 15 equally sized cells and place exactly one complete character inside each cell. No character, prop, effect, or text may cross into another cell. Absolutely NO grid lines, NO cell division lines, NO border lines between cells, NO cell numbers.
${getGptBackgroundInstruction()}

[CONSISTENCY]
All 15 cells must preserve the same face, body proportions, colors, outfit, and art style. Change only the expression, pose, supporting prop, and effect required by each phrase.

[TEXT POLICY]
${textPolicy}

[EXCLUDE]
${textExclusion} No grid lines, no cell division lines, no border lines between cells, no cell frames, no watermark, no full-sheet frame, no duplicate character inside a cell, no extra limbs, no cropped body, no complex scenery, or photorealistic background.`;
    }
  };

  const generateGeminiPrompt = (phraseOverride = null) => {
    const character = getGeminiCharacterDetails();
    const hasPhraseOverride = phraseOverride !== null;
    const targetPhrase = generationMode === 'individual'
      ? getSelectedPhrase()
      : (phraseOverride || '').trim();
    const referenceInstruction = `${characterSource === 'photo' ? `Photo reference style: ${getPhotoModeLabel('en')}. ` : ''}${getReferenceImageInstruction('en')}`;

    if (generationMode === 'individual' || hasPhraseOverride) {
      const textPolicy = geminiTextMode === 'text'
        ? `Render the exact phrase "${targetPhrase}" once in playful, hand-drawn Korean calligraphy lettering beside the character. No parentheses (), brackets [], or rectangular text boxes.`
        : `Do not render text, letters, or numbers. Use "${targetPhrase}" only as visual context for expression and pose.`;
      const textExclusion = geminiTextMode === 'text'
        ? 'No extra words, altered spelling, random letters, numbers, parentheses, or text boxes.'
        : 'No text, letters, numbers, typography, or meaningless symbols.';

      return `[GOAL]
Create a high-end 2D messenger sticker (KakaoTalk / LINE style) with an ultra-cute Chibi SD mascot character.

[VISUAL REFERENCE & IDENTITY]
${referenceInstruction}
- Subject: ${character.subject}
- Appearance & Features: ${character.appearance}
- Outfit: ${character.outfit}

[ART DIRECTION & PROPORTIONS]
${character.artStyle}. Adorable 2.5-head Chibi SD manga/anime mascot proportion with a big round head, huge sparkling expressive eyes, chubby cheeks, soft glossy hair highlights, clean crisp vector outlines, vibrant colors, and soft cell shading.

[SCENE, POSE & EXPRESSION]
- Target Phrase / Mood: "${targetPhrase}"
- Facial Expression: Highly expressive, cute, unmistakable emotion matching "${targetPhrase}".
- Body Pose: Dynamic, energetic full-body posture (e.g. sitting, crouching, jumping, holding props, or waving). Never use a static half-body bust pose.
- Supporting Props & Sparkle Effects: ${character.props}, ${character.effects}, cute little heart/star accents.

[CANVAS & COMPOSITION]
Square 1:1 canvas. Exactly one complete centered full-body character visible from head to toe with 15% margin on all sides. Clean solid white background with a subtle crisp sticker die-cut white outline.

[TEXT POLICY]
${textPolicy}

[DO NOT INCLUDE]
${textExclusion} No watermark, outer frame, duplicate character, extra limbs, cropped body, half-body bust shot, dull background, or photorealism.`;
    }

    const panelPlan = emoticons.map((phrase, index) => `Sticker ${index + 1}: "${phrase.trim()}"`).join('\n');
    const textPolicy = geminiTextMode === 'text'
      ? 'Render each quoted Korean phrase naturally beside or above its corresponding character in playful hand-drawn calligraphy. Do NOT use parentheses (), brackets [], quotation marks, or rectangular text boxes.'
      : 'Do not render any text, letters, or numbers. Use each phrase only as visual context for its sticker\'s emotion and posture.';
    const textExclusion = geminiTextMode === 'text'
      ? 'No extra words, altered spelling, random letters, sticker numbers, parentheses, quotation marks, or text boxes.'
      : 'No text, letters, numbers, typography, sticker labels, or meaningless symbols.';

    return `[GOAL]
Create a master 15-sticker 2D messenger sheet (KakaoTalk / LINE style) featuring an ultra-cute Chibi SD mascot character across all stickers.

[VISUAL REFERENCE & IDENTITY]
${referenceInstruction}
- Subject: ${character.subject}
- Appearance & Features: ${character.appearance}
- Outfit: ${character.outfit}

[ART DIRECTION & PROPORTIONS]
${character.artStyle}. Adorable 2.5-head Chibi SD manga/anime mascot proportion with a big round head, huge sparkling expressive eyes, chubby cheeks, soft glossy hair highlights, clean crisp vector outlines, vibrant colors, and soft cell shading. Maintain identical character proportions and style across all 15 stickers.

[15 DYNAMIC POSES & EXPRESSIONS]
For each sticker, infer a unique, highly expressive cute facial emotion and a DYNAMIC full-body pose (e.g. sitting, crouching, jumping, holding props, winking, eating, or cheering). Every sticker MUST show a complete full-body character visible head-to-toe:
${panelPlan}
Supporting props & sparkle effects: ${character.props}, ${character.effects}, cute heart/star accents.

[CANVAS & LAYOUT — SEAMLESS WHITE SHEET]
Single continuous pure white background sheet. Arrange all 15 full-body stickers floating freely with generous spacing. Each character has a subtle crisp sticker die-cut white outline. Pure blank white background across the entire canvas. Absolutely NO guide lines, NO grid lines, NO cell borders, NO table lines, NO dividing lines, NO crop marks, NO bounding boxes, NO sticker numbers.

[TEXT POLICY]
${textPolicy}

[DO NOT INCLUDE]
${textExclusion} No guide lines, no grid lines, no cell dividers, no border lines, no table lines, no crop marks, no panel boxes, no watermark, no outer frame, no duplicate character inside a single sticker, no extra limbs, no cropped body, no half-body bust shot, no dull background color, or photorealism.`;
  };

  const getGeminiRepairPrompt = (repairType) => {
    const targetPhrase = getSelectedPhrase();
    const repairPrompts = {
      identity: `Edit the most recent image only. Restore the character so it matches the attached accepted base character image exactly. Preserve the current scene, pose, expression, composition, and text. Correct only the face, silhouette, body proportions, colors, outfit, linework, and texture. Do not redesign or add details. Return one corrected image.`,
      crop: `Edit the most recent image only. Keep the same character identity, expression, pose, colors, outfit, art style, and${geminiTextMode === 'text' ? ` exact phrase "${targetPhrase}"` : ' text-free design'}. Reframe the composition so the entire character and all effects are visible with at least 12% empty margin on every side. Do not change anything else. Return one corrected square image.`,
      text: `Edit the most recent image only. Keep the character, face, pose, expression, colors, outfit, art style, effects, composition, and background unchanged. Replace only the incorrect lettering with the exact phrase "${targetPhrase}" once. Verify every Korean character, spelling, and spacing before rendering. Add no other text. Return one corrected image.`,
    };
    return repairPrompts[repairType];
  };

  const copyGeminiRepairPrompt = (repairType) => {
    navigator.clipboard.writeText(getGeminiRepairPrompt(repairType));
    setCopiedType(`gemini-repair-${repairType}`);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const getPreviewPrompt = () => {
    const phraseOverride = generationMode === 'batch' ? getSelectedPhrase() : null;
    const error = getPromptValidationError(phraseOverride);
    if (error) return error;
    return previewMode === 'gpt'
      ? generateGptPrompt(phraseOverride)
      : generateGeminiPrompt(phraseOverride);
  };

  const copyToClipboard = (type, selectedPhraseOverride = null, copyKey = type) => {
    const phraseOverride = selectedPhraseOverride ?? (generationMode === 'batch' ? getSelectedPhrase() : null);
    if (getPromptValidationError(phraseOverride)) return;
    const textToCopy = type === 'gpt'
      ? generateGptPrompt(phraseOverride)
      : generateGeminiPrompt(phraseOverride);
    navigator.clipboard.writeText(textToCopy);
    setCopiedType(copyKey);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const promptValidationError = getPromptValidationError(
    generationMode === 'batch' ? getSelectedPhrase() : null
  );
  const visiblePromptValidationError = promptValidationError;

  return (
    <div className="font-body-md text-body-md antialiased pb-32">
      {/* TopAppBar */}
      <header className="w-full top-0 bg-background flex items-center justify-between px-3 sm:px-gutter min-h-14 py-2 max-w-7xl mx-auto z-40 sticky shadow-sm md:shadow-none">
        <div className="flex items-center gap-2 shrink-0">
          <h1 className="font-headline-md text-[18px] sm:text-[22px] leading-none font-bold text-primary-strong tracking-tight whitespace-nowrap">{t.title}</h1>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button 
            onClick={() => {
              const el = document.getElementById('guide-section');
              if (el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }}
            className="interactive-control flex items-center gap-1.5 min-h-10 px-3 py-1.5 rounded-full bg-[#FFF4E5] border border-[#FFE8CC] text-[#8A4B00] text-[13px] font-bold hover:bg-[#FFE8CC] shadow-sm whitespace-nowrap"
          >
            <span className="text-[14px]">💡</span>
            <span className="sm:hidden">{lang === 'ko' ? '활용' : 'Guide'}</span>
            <span className="hidden sm:inline">{lang === 'ko' ? '활용 가이드' : 'Guide'}</span>
          </button>
          <button 
            onClick={toggleLanguage}
            className="interactive-control flex items-center gap-1.5 min-h-10 px-3 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant text-[13px] font-bold text-on-surface hover:bg-surface-variant shadow-sm"
          >
            <Globe size={16} />
            {lang === 'ko' ? 'EN' : 'KO'}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-container-margin mt-md md:mt-xl flex flex-col gap-lg md:gap-xl">
        {/* App Intro Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#FFD3B6] via-[#FFE8B6] to-[#FFC2C2] text-[#5C3A21] p-6 md:p-xl rounded-[32px] md:rounded-[40px] shadow-bubbly text-center flex flex-col items-center justify-center gap-4 md:gap-6 border-4 border-white">
          {/* Decorative floating emojis */}
          <div className="absolute top-6 left-8 hidden sm:block text-[40px] transform -rotate-12 drop-shadow-md">✨</div>
          <div className="absolute bottom-8 left-12 hidden sm:block text-[48px] transform rotate-12 drop-shadow-md">🎨</div>
          <div className="absolute top-12 right-12 hidden sm:block text-[48px] transform rotate-12 drop-shadow-md">🚀</div>
          <div className="absolute bottom-10 right-10 hidden sm:block text-[40px] transform -rotate-12 drop-shadow-md">💖</div>
          
          <div className="z-10 flex flex-col gap-3">
            <span className="inline-block bg-white/60 text-[#5C3A21] font-black text-[13px] tracking-wider px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/80 mx-auto shadow-sm">
              AI STICKER PROMPT MAKER
            </span>
            <h2 className="text-[28px] md:text-[42px] font-black tracking-tight leading-tight drop-shadow-sm break-keep">
              {t.guide1Q.replace('🤔 ', '')}
            </h2>
          </div>
          
          <p className="z-10 text-[14px] md:text-[17px] leading-relaxed max-w-2xl mx-auto font-bold bg-white/40 p-4 md:p-5 rounded-3xl backdrop-blur-md border border-white/60 shadow-sm whitespace-pre-wrap break-keep">
            {t.guide1A}
          </p>
        </section>

        {/* Section 1: Character Setup */}
        <section className="flex flex-col gap-md">
          <div className="flex justify-between items-center">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">{t.step1}</h2>
            <button onClick={clearTags} className="flex items-center gap-1 min-h-10 px-2 text-[13px] font-bold text-error">
              <Trash2 size={14} /> {t.clear}
            </button>
          </div>
          
          <div className="bg-surface-container-lowest rounded-3xl p-md shadow-bubbly border border-outline-variant">
            <div className="mb-md flex flex-col gap-3">
              <span className="px-1 text-[13px] font-bold text-on-surface-variant">{t.characterSource}</span>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label={t.characterSource}>
                {[
                  ['direct', t.directSource],
                  ['photo', t.photoSource],
                ].map(([source, label]) => (
                  <button
                    key={source}
                    type="button"
                    aria-pressed={characterSource === source}
                    onClick={() => setCharacterSource(source)}
                    className={`interactive-control min-h-11 rounded-[8px] border px-3 py-2 text-[14px] font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-strong focus-visible:ring-offset-2 ${
                      characterSource === source
                        ? 'bg-mint text-mint-strong border-mint-border shadow-sm'
                        : 'bg-white text-on-surface border-outline-variant hover:bg-mint-soft'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {characterSource === 'photo' && (
                <div className="rounded-[8px] border border-mint-border bg-mint-soft p-3 flex flex-col gap-3">
                  <span className="text-[13px] font-bold text-mint-strong">{t.photoMethod}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="group" aria-label={t.photoMethod}>
                    {[
                      ['exact', t.photoExact],
                      ['features', t.photoFeatures],
                      ['characterize', t.photoCharacterize],
                    ].map(([mode, label]) => (
                      <button
                        key={mode}
                        type="button"
                        aria-pressed={photoReferenceMode === mode}
                        onClick={() => setPhotoReferenceMode(mode)}
                        className={`interactive-control min-h-10 rounded-[8px] border px-2 py-2 text-[13px] font-bold flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] ${
                          photoReferenceMode === mode
                            ? 'bg-[#FFE8B5] text-[#5A461B] border-[#E8C66A] shadow-sm ring-1 ring-[#E8C66A]/30'
                            : 'bg-white text-on-surface border-[#E9DFC5] hover:bg-[#FFF3D8]'
                        }`}
                      >
                        {photoReferenceMode === mode && <CheckCircle2 size={16} aria-hidden="true" />}
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[13px] leading-relaxed text-mint-strong">📎 {t.photoAttachGuide}</p>
                </div>
              )}
            </div>

            <textarea 
              className="w-full bg-white border-2 border-mint-border rounded-3xl p-4 text-on-surface font-bold placeholder:text-on-surface-variant focus:outline-none focus:ring-4 focus:ring-mint focus:border-mint-strong resize-y min-h-[100px] shadow-sm" 
              placeholder={t.placeholder}
              value={charManual}
              onChange={(e) => setCharManual(e.target.value)}
            />

            {!charManual.trim() && (
              <div className="mt-3 bg-mint-soft border border-mint-border rounded-2xl p-3.5 flex items-start gap-2.5 text-[13px] text-mint-strong">
                <span className="text-[16px] leading-none shrink-0 mt-0.5">💡</span>
                <div className="leading-relaxed">
                  <strong className="font-bold">{lang === 'ko' ? '캐릭터 미설정 시 기본 동작' : 'Default Character Setting'}</strong>
                  <p className="mt-0.5 opacity-95">
                    {lang === 'ko' 
                      ? '설정을 비워두셔도 AI가 가장 귀엽고 표정이 풍부한 2D 오리지널 캐릭터(기본 의상/화풍)를 자동으로 완성해 드립니다.' 
                      : 'Leaving this empty automatically generates a cute, highly expressive 2D original character by default.'}
                  </p>
                </div>
              </div>
            )}
            
            <div className="mt-md bg-surface-container-highest rounded-[24px] overflow-hidden">
              <div className="no-scrollbar flex flex-wrap bg-[#EAF8F3] px-2 border-b border-mint-border">
                {categoryKeys.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveTagCategory(category)}
                    className={`whitespace-nowrap px-3 py-2 text-[13px] font-bold transition-colors ${
                      activeTagCategory === category 
                        ? 'text-mint-strong border-b-2 border-mint-strong' 
                        : 'text-mint-strong hover:bg-mint-hover border-b-2 border-transparent'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="p-3 flex flex-wrap gap-2 bg-surface-container-lowest min-h-[80px]">
                {currentTags[activeTagCategory]?.map(tag => (
                  <button
                    key={tag}
                    onClick={() => appendTag(tag)}
                    className="interactive-control px-3 py-1.5 rounded-full bg-mint-soft text-[13px] text-mint-strong font-label-md hover:bg-mint-hover border border-mint-border"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Emoji Phrases */}
        <section className="flex flex-col gap-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">{t.phrases}</h2>
            <div className="flex gap-2">
              <select 
                value={currentThemes[activeTheme] ? activeTheme : ''} 
                onChange={handleThemeSelect}
                className="px-3 py-1.5 text-[14px] font-bold rounded-full border border-mint-border bg-surface-container-lowest text-on-surface cursor-pointer focus:outline-none focus:ring-2 focus:ring-mint"
              >
                <option value="" disabled>{t.themeSelect}</option>
                {themeKeys.map(theme => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
              
              <button 
                onClick={shuffleEmoticons}
                className="interactive-control flex items-center gap-1 min-h-10 px-3 py-1.5 text-[14px] font-bold rounded-full bg-mint text-mint-strong hover:bg-mint-hover border border-mint-border"
              >
                <Shuffle size={14} /> {t.randomMix}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-sm md:gap-md bg-surface-container-lowest rounded-3xl p-md shadow-bubbly border border-outline-variant">
            {emoticons.map((text, idx) => (
              <input 
                key={idx}
                type="text" 
                value={text}
                onChange={(e) => handleEmoticonChange(idx, e.target.value)}
                className={`interactive-control w-full h-[48px] bg-mint-soft rounded-full px-2 text-center text-mint-strong font-label-md placeholder:text-on-secondary-container focus:outline-none focus:ring-2 focus:ring-mint-strong border border-mint-border ${
                  idx === emoticons.length - 1
                    ? 'col-span-2 max-w-[calc(50%_-_6px)] justify-self-center sm:col-span-1 sm:max-w-none'
                    : ''
                }`}
                placeholder={`Phrase ${idx+1}`}
              />
            ))}
          </div>

        </section>

        {/* Section 3: Prompt Preview */}
        <section className="flex flex-col gap-md">
          <div className="bg-[#FFF7DF] rounded-3xl p-3 md:p-4 border border-[#F6D77A] shadow-sm flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="group" aria-label={lang === 'ko' ? '프롬프트 생성 방식' : 'Prompt generation mode'}>
              {[
                ['sheet', t.modeSheet],
                ['individual', t.modeIndividual],
                ['batch', t.modeBatch],
              ].map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={generationMode === mode}
                  onClick={() => handleGenerationModeChange(mode)}
                  className={`interactive-control min-h-12 px-3 py-2 rounded-2xl text-[14px] font-bold border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] focus-visible:ring-offset-2 ${
                    generationMode === mode
                      ? 'bg-[#FFE8B5] text-[#5A461B] border-[#E8C66A] shadow-sm'
                      : 'bg-white text-on-surface border-[#E9DFC5] hover:bg-[#FFF3D8]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {generationMode === 'individual' && (
              <div className="flex flex-col gap-2">
                <label htmlFor="individual-phrase" className="px-1 text-[13px] font-bold text-[#795B16]">
                  {t.individualInput}
                </label>
                <input
                  id="individual-phrase"
                  type="text"
                  value={individualPhrase}
                  onChange={(e) => setIndividualPhrase(e.target.value)}
                  className="w-full min-h-12 rounded-2xl bg-white px-4 text-on-surface font-bold border border-[#E8C66A] focus:outline-none focus:ring-2 focus:ring-[#E8C66A]"
                  placeholder={t.individualPlaceholder}
                />
                <p className="px-1 text-[13px] leading-relaxed text-[#795B16]">{t.individualTip}</p>
              </div>
            )}

            {generationMode === 'batch' && (
              <div className="flex flex-col gap-2">
                <span className="px-1 text-[13px] font-bold text-[#795B16]">{t.batchSelect}</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {emoticons.map((phrase, idx) => {
                    const isSelected = getSelectedPhrase() === phrase;
                    const copyKey = `batch-${previewMode}-${idx}`;
                    return (
                      <button
                        key={`${idx}-${phrase}`}
                        type="button"
                        aria-pressed={isSelected}
                        aria-label={`${idx + 1}. ${phrase} ${previewMode === 'gpt' ? t.gptCopy : t.geminiCopy}`}
                        onClick={() => {
                          setBatchPhrase(phrase);
                          copyToClipboard(previewMode, phrase, copyKey);
                        }}
                        className={`interactive-control min-h-11 px-3 py-2 rounded-2xl border font-bold flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] focus-visible:ring-offset-2 ${
                          isSelected
                            ? 'bg-[#FFE8B5] text-[#5A461B] border-[#E8C66A] shadow-sm'
                            : 'bg-white text-on-surface border-[#E9DFC5] hover:bg-[#FFF3D8]'
                        }`}
                      >
                        {copiedType === copyKey
                          ? <CheckCircle2 size={17} aria-label={t.copiedPrompt} />
                          : <span className="text-[12px] font-black opacity-70">{idx + 1}</span>}
                        <span className="truncate">{phrase}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="px-1 text-[13px] leading-relaxed text-[#795B16]">{t.batchTip}</p>
              </div>
            )}
          </div>

          {visiblePromptValidationError && (
            <p role="alert" className="rounded-2xl border border-error/30 bg-[#FFF0F0] px-4 py-3 text-[13px] font-bold text-error">
              {visiblePromptValidationError}
            </p>
          )}

          {characterSource === 'photo' && (
            <div className="flex flex-wrap items-center gap-2 px-1" aria-live="polite">
              <span className="inline-flex min-h-9 items-center rounded-full bg-mint-soft px-4 py-1.5 text-[13px] font-bold text-mint-strong border border-mint-border">
                📷 {t.photoActive}
              </span>
              <strong className="text-[13px] text-on-surface-variant">{getPhotoModeLabel()}</strong>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
            <h2 className="font-headline-sm text-headline-sm text-on-surface break-keep">{t.previewTitle}</h2>
            <div className="flex w-full sm:w-auto bg-mint-soft rounded-full p-1 border border-mint-border shadow-sm">
              <button 
                onClick={() => setPreviewMode('gpt')}
                className={`interactive-control flex-1 sm:flex-none min-h-11 px-4 py-1.5 text-[14px] font-bold rounded-full ${
                  previewMode === 'gpt' 
                  ? 'bg-mint text-mint-strong shadow-sm border border-mint-border' 
                  : 'text-mint-strong hover:bg-mint-hover'
                }`}
              >
                {t.forGpt}
              </button>
              <button 
                onClick={() => setPreviewMode('gemini')}
                className={`interactive-control flex-1 sm:flex-none min-h-11 px-4 py-1.5 text-[14px] font-bold rounded-full ${
                  previewMode === 'gemini' 
                  ? 'bg-mint text-mint-strong shadow-sm border border-mint-border' 
                  : 'text-mint-strong hover:bg-mint-hover'
                }`}
              >
                {t.forGemini}
              </button>
            </div>
          </div>
          {previewMode === 'gpt' && (
            <div className="rounded-[8px] border border-[#F6D77A] bg-[#FFF7DF] p-3 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-[13px] font-bold text-[#795B16]">{t.gptTextMode}</span>
                <div className="grid grid-cols-2 gap-2 sm:min-w-[280px]" role="group" aria-label={t.gptTextMode}>
                  {[
                    ['text', t.gptIncludeText],
                    ['visual', t.gptNoText],
                  ].map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={gptTextMode === mode}
                      onClick={() => setGptTextMode(mode)}
                      className={`interactive-control min-h-10 rounded-[8px] border px-3 py-2 text-[13px] font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] ${
                        gptTextMode === mode
                          ? 'bg-[#FFE8B5] text-[#5A461B] border-[#E8C66A] shadow-sm'
                          : 'bg-white text-on-surface border-[#E9DFC5] hover:bg-[#FFF3D8]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-[13px] font-bold text-[#795B16]">{t.gptBackgroundMode}</span>
                <div className="grid grid-cols-3 gap-2 sm:min-w-[420px]" role="group" aria-label={t.gptBackgroundMode}>
                  {[
                    ['transparent', t.gptTransparent],
                    ['solid', t.gptSolid],
                    ['chroma', t.gptChroma],
                  ].map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={gptBackgroundMode === mode}
                      onClick={() => setGptBackgroundMode(mode)}
                      className={`interactive-control min-h-10 rounded-[8px] border px-2 py-2 text-[13px] font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] ${
                        gptBackgroundMode === mode
                          ? 'bg-[#FFE8B5] text-[#5A461B] border-[#E8C66A] shadow-sm'
                          : 'bg-white text-on-surface border-[#E9DFC5] hover:bg-[#FFF3D8]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[13px] leading-relaxed text-[#795B16]">💡 {t.gptWorkflowTip}</p>
            </div>
          )}
          {previewMode === 'gemini' && (
            <div className="rounded-[8px] border border-[#E8C66A] bg-[#FFF8E8] p-3 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-[13px] font-bold text-[#795B16]">{t.geminiTextMode}</span>
                <div className="grid grid-cols-2 gap-2 sm:min-w-[280px]" role="group" aria-label={t.geminiTextMode}>
                  {[
                    ['visual', t.geminiNoText],
                    ['text', t.geminiIncludeText],
                  ].map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={geminiTextMode === mode}
                      onClick={() => setGeminiTextMode(mode)}
                      className={`interactive-control min-h-10 rounded-[8px] border px-3 py-2 text-[13px] font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] ${
                        geminiTextMode === mode
                          ? 'bg-[#FFE8B5] text-[#5A461B] border-[#E8C66A] shadow-sm'
                          : 'bg-white text-[#795B16] border-[#E9DFC5] hover:bg-[#FFF3D8]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 border-t border-[#E9DFC5] pt-3">
                <span className="text-[13px] font-bold text-[#795B16]">{t.geminiRepairTitle}</span>
                <div className="grid grid-cols-1 min-[430px]:grid-cols-3 gap-2">
                  {[
                    ['identity', t.geminiRepairIdentity],
                    ['crop', t.geminiRepairCrop],
                    ...(geminiTextMode === 'text' ? [['text', t.geminiRepairText]] : []),
                  ].map(([repairType, label]) => (
                    <button
                      key={repairType}
                      type="button"
                      onClick={() => copyGeminiRepairPrompt(repairType)}
                      className="interactive-control min-h-10 rounded-[8px] border border-[#E9DFC5] bg-white px-3 py-2 text-[13px] font-bold text-[#795B16] hover:bg-[#FFF3D8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A]"
                    >
                      {copiedType === `gemini-repair-${repairType}` ? '✓ ' : ''}{label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[13px] leading-relaxed text-[#795B16]">💡 {t.geminiFinalTip}</p>
            </div>
          )}
          {generationMode !== 'sheet' && (
            <div className="flex flex-wrap items-center gap-2 px-1" aria-live="polite">
              <span className="text-[13px] font-bold text-on-surface-variant">{t.selectedPhrase}</span>
              <strong className="inline-flex min-h-9 items-center rounded-full bg-[#FFE8B5] px-4 py-1.5 text-[14px] text-[#5A461B] border border-[#E8C66A] shadow-sm">
                {getSelectedPhrase()}
              </strong>
            </div>
          )}
          <div className="bg-surface-container-lowest rounded-3xl p-md shadow-bubbly border border-outline-variant">
            <textarea 
              className="w-full bg-white border-2 border-outline-variant rounded-3xl p-4 text-on-surface font-normal focus:outline-none resize-y min-h-[200px] shadow-sm" 
              readOnly
              value={getPreviewPrompt()}
            />
          </div>

        </section>

        {/* Actions */}
        <section className="flex flex-col sm:flex-row gap-4 mt-sm pb-xl">
          <button 
            onClick={() => copyToClipboard('gpt')}
            disabled={Boolean(promptValidationError)}
            className="interactive-control w-full min-h-[64px] flex-none sm:flex-1 rounded-3xl bg-[#FFE8B5] text-[#5A461B] border border-[#E8C66A] font-headline-sm flex items-center justify-center gap-2 hover:bg-[#FFDB80] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#FFE8B5]"
          >
            {copiedType === 'gpt' ? <CheckCircle2 size={24} className="text-[#2D7D64]" /> : <Bot size={24} className="text-[#2D7D64]" />}
            {t.gptCopy}
          </button>
          
          <button 
            onClick={() => copyToClipboard('gemini')}
            disabled={Boolean(visiblePromptValidationError)}
            className="interactive-control w-full min-h-[64px] flex-none sm:flex-1 rounded-3xl bg-[#FFE8B5] text-[#5A461B] border border-[#E8C66A] font-headline-sm flex items-center justify-center gap-2 hover:bg-[#FFDB80] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#FFE8B5]"
          >
            {copiedType === 'gemini' ? <CheckCircle2 size={24} className="text-[#D97706]" /> : <Sparkles size={24} className="text-[#D97706]" />}
            {t.geminiCopy}
          </button>
        </section>
        
        <AdBanner />

        <div className="bg-[#FFF5E6] text-[#8C3D18] p-5 md:p-6 rounded-[24px] border border-[#FDE0B5] flex gap-3 md:gap-4 items-start shadow-sm mt-2 relative overflow-hidden">
          <div className="absolute -right-4 -top-6 text-[#FCD3A1] opacity-40 text-[140px] transform -rotate-12 select-none pointer-events-none drop-shadow-sm">📸</div>
          <span className="text-[22px] drop-shadow-sm leading-none mt-0.5 relative z-10">📸</span>
          <div className="relative z-10 flex-1">
            <strong className="font-black block mb-2 text-[16px] md:text-[17px] tracking-tight text-[#C2410C]">
              {lang === 'ko' ? '✨ 초강력 꿀팁: 사진 첨부로 세상에 하나뿐인 이모티콘 만들기!' : '✨ Pro Tip: Make Emojis from Photos!'}
            </strong>
            <span className="text-[14.5px] leading-relaxed opacity-90 break-keep block font-medium mb-4 pr-8 md:pr-16 text-[#8C3D18]">
              {lang === 'ko' 
                ? '이 프롬프트를 복사해서 AI(ChatGPT, Gemini)에 붙여넣을 때, 본인이나 우리 아이, 반려동물의 사진을 함께 첨부해 보세요. 대상을 똑닮은 완벽한 커스텀 이모티콘 시트가 만들어집니다!' 
                : 'When pasting this prompt into AI (ChatGPT, Gemini), attach a photo of yourself, your child, or your pet. It will generate a custom emoji sheet!'}
            </span>
            <div className="bg-white/60 rounded-[18px] p-4 border border-[#FCD3A1]/60 shadow-sm flex flex-col gap-2 w-full">
              <strong className="text-[#C2410C] text-[14.5px] flex items-center gap-1.5 font-bold">
                <span className="text-[16px]">📌</span> {lang === 'ko' ? 'LLM 첨부 사진 권장 규칙' : 'Recommended Photo Specs'}
              </strong>
              <ul className="list-disc pl-5 opacity-90 text-[#9A3412] font-medium flex flex-col gap-1.5 mt-1 text-[13.5px] marker:text-[#C2410C]">
                <li>{lang === 'ko' ? '크기/비율: 제한 없음 (일반적인 스마트폰 사진 포맷 가능)' : 'Size/Ratio: Any standard photo format'}</li>
                <li>{lang === 'ko' ? '권장: 이목구비, 헤어스타일, 모색 등 특징이 선명한 정면 사진 1장' : 'Recommended: Clear front-facing photo showing distinct features'}</li>
                <li>{lang === 'ko' ? '주의: 인물이 너무 작거나 흔들리고 어두운 사진은 피해주세요.' : 'Avoid: Blurry, dark, or zoomed-out photos'}</li>
              </ul>
            </div>
          </div>
        </div>

        <InfoSection t={t} lang={lang} />
      </main>

      {/* Footer */}
      <footer className="mt-12 py-10 bg-[#FAF9F6] border-t border-[#E5E0D8] text-center w-full">
        <div className="max-w-3xl mx-auto px-6 flex flex-col gap-2">
          <p className="text-[14px] text-[#8C7A6B] font-bold">
            © {new Date().getFullYear()} Prompt Studio. All rights reserved.
          </p>
          <p className="text-[12px] text-[#A69B8F]">
            {lang === 'ko' 
              ? '* 본 서비스는 카카오(Kakao) 및 라인(LINE)과 공식적인 관련이 없습니다.' 
              : '* This service is not officially affiliated with Kakao or LINE.'}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
