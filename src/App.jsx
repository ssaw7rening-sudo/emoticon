// AI 이모티콘 프롬프트 메이커 메인 애플리케이션
import React, { useState, useEffect } from "react";
import { Shuffle, CheckCircle2, Bot, Sparkles, Zap, Trash2, RotateCcw } from "lucide-react";

const THEMES_KO = {
  '일상/인사 ①': ['ㅋㅋㅋㅋ', '안녕!', '오늘도 화이팅', '좋아요', '고마워요', '사랑해요', '최고!', '오예', '미안해요', '수고했어요', '축하해요', '대박', '헐', '감동', '잘자요'],
  '일상/인사 ②': ['잘 부탁드려요', '무슨 일이야?', '밥 먹었어?', '보고 싶다', '좋은 아침!', '심심해', '어디야?', '놀자!', '힘내!', '응원할게', '최고야!', '완벽해!', '기대돼!', '오늘도 수고했어', '다음에 봐!'],
  '직장인 ①': ['출근 중', '퇴근할게요!', '먼저 퇴근합니다', '확인했습니다', '네, 알겠습니다', '월요병', '월급날!', '커피 수혈 중', '회의 중', '야근 중', '오늘도 고생했어', '불금이다!', '퇴사하고 싶다', '넵!', '살려줘…'],
  '직장인 ②': ['칼퇴 성공!', '확인 부탁드립니다', '잠시만요', '수고하셨습니다', '점심 뭐 먹지?', '일하기 싫다', '영혼 가출', '눈물 찔끔', '할 일이 태산', '답장이 늦었습니다', '수고하세요', '멘붕 상태', '주말만 기다려', '잠깐 쉬는 중', '연차 쓸게요'],
  '학생/학교 ①': ['등교 중', '시험 끝났다!', '망했다…', '끝나고 뭐해?', '과제 폭탄', '지각이다!', '밤샘 공부', '방학 언제 와?', '방학이다!', '자리 바꿔줘', '배고파 죽겠다', '교과서 빌려줘', '졸려…', 'A+ 가자!', '졸업 축하해!'],
  '학생/학교 ②': ['학식 먹으러 가자', '수업 중', '필기 좀 보여줘', '쉬는 시간!', '동아리 가는 중', '중간고사 기간', '재수강 각', '독서실 자리 잡음', '학교 가기 싫어', '집에 가고 싶다', '수학여행 기대돼', '체육대회 1등!', '야자 쨀까?', '공부 1도 안 함', '합격 기원!'],
  '주식/재테크 ①': ['가즈아!', '떡상 가자!', '손절합니다…', '존버는 승리한다', '월급 로그아웃', '돈이 복사가 된다고!', '물타기 들어간다', '구조대 언제 와요?', '떡락 중… (눈물)', '익절 완료!', '내 돈 어디 갔어?', '영끌 투자', '한강 가야 하나…', '보너스 받았다!', '주식의 신!'],
  '주식/재테크 ②': ['풀매수 완료', '바닥인 줄 알았는데', '용돈 주세요', '마이너스의 손', '통장 잔고 0원', '텅장', '거지 됐음', '절약 모드 돌입', '플렉스 해버렸지', '파이어족 꿈꾸며', '오늘 내가 쏜다!', '호가창만 보는 중', '원금 회수 완료', '적금 만기!', '돈이 최고야'],
  '게임/게이머 ①': ['치킨이닭!', '캐리했다!', '트롤 그만해', '내 탓 아님', '한 판만 더!', '접속 중', '팀운 실화냐?', '버그 났어', '밤샘 게임', '렉 걸려', '피지컬 지렸다', '캐리 부탁해', 'GG 굿게임', '막타 쳤다', '나 먼저 누울게'],
  '게임/게이머 ②': ['가챠 대박!', '픽뚫 당함…', '현질 완료', '천장 쳤다 (눈물)', '공략 보는 중', '팟 구함 (1/4)', '랭크 승급!', '강등 당함…', '컨트롤 미스', '포지션 양보 좀', '템 파밍 중', '보스 잡으러 가자', '부활시켜 줘', '딜량 1등!', '게임 삭제각'],
  '건강/피곤 ①': ['피곤해 죽겠다', '머리 아파', '일찍 잘래', '약 먹었어?', '허리 아프다', '방전 직전 (배터리 1%)', '힐링 필요해', '병원 가는 중', '건강 챙겨!', '비타민 챙겨 먹어', '카페인 부족', '어깨 결려', '눈이 침침해', '감기 걸렸어', '힘이 안 나…'],
  '건강/피곤 ②': ['기절 직전', '영양제 먹는 중', '삭신이 쑤신다', '꿀잠 잤다!', '스트레칭 중', '숨 쉬기 운동 중', '마사지 받고 싶다', '생존 신고', '무리하지 마', '면역력 저하', '눕방 중', '피로 누적', '따뜻한 차 한 잔', '아프지 마요', '부활 완료!'],
  '유머/밈 ①': ['어쩔티비', '킹받네', '알잘딱깔센', '억까 당함', '폼 미쳤다', '오히려 좋아', '중꺾마 (중요한 건 꺾이지 않는 마음)', '자 드가자~', '너 T야?', '식빵 굽는 중', '머선 129', '레전드다 진짜', '내적 댄스 폭발', '뇌정지 옴', '이게 맞나?'],
  '유머/밈 ②': ['극락 가는 중', '이게 되네?', '할많하않', '갓생 사는 중', '무물보 (무엇이든 물어보세요)', '주작이지?', '뼈 맞았어 (팩폭)', '이왜진?', '킹리적 갓심', '멘탈 바사삭', '주접 부리는 중', '팝콘 각', '웃안웃 (웃긴데 안 웃겨)', '현웃 터짐', '팩트 폭행'],
  '감정표현 ①': ['행복해!', '감동이야 ㅠㅠ', '화났음 (부들부들)', '뿌엥 (울음)', '깜짝이야!', '두근두근 설렘', '심심해 죽겠다', '외로워…', '부끄러워 (발그레)', '무서워 ㅠㅠ', '답답해 죽겠네', '짜증나!', '자신감 뿜뿜', '뿌듯하다', '걱정마!'],
  '감정표현 ②': ['속이 뻥 뚫린다', '멘탈 붕괴', '신난다 오예~', '서운해…', '기분 째짐!', '안도 (휴~)', '질투 폭발', '당황스러움 (땀 삐질)', '충격과 공포', '홀린 듯 쳐다봄', '후회 중…', '억울해 죽겠네', '마음이 따뜻해', '기절초풍', '사랑이 넘쳐요'],
  '커플/연애 ①': ['보고 싶어', '지금 뭐해?', '사랑해 ♥', '평생 함께하자', '꿈에서 만나', '목소리 듣고 싶어', '사진 보내줘', '손잡을래?', '안아줘', '외로워 자기야', '빨리 보고 싶다', '내 사랑', '잘 자 내 꿈꿔', '오늘도 반했어', '심쿵!'],
  '커플/연애 ②': ['데이트 가자!', '어디 갈까?', '기념일 축하해!', '싸우지 말자', '삐졌어 (흥!)', '바람피우면 죽는다', '나 얼마나 사랑해?', '네 편이야 언제나', '설레서 잠이 안 와', '오늘 멋있다/예쁘다', '전화할 수 있어?', '집 앞이야 나와', '커플룩 입자', '네가 제일 좋아', '영원히 사랑해'],
  '가족/부모님 ①': ['밥 먹었어?', '조심히 들어가요', '사랑해요 엄마/아빠', '건강하세요', '용돈 감사해요!', '늘 감사해요', '아프지 마세요', '금방 갈게요!', '엄마 밥 최고!', '아빠 힘내세요', '가족이 최고야', '주말에 갈게요', '감기 조심해요', '자랑스러워요', '효도할게요!'],
  '가족/부모님 ②': ['어디쯤이야?', '일찍 들어와!', '문단속 잘해', '반찬 보냈어', '엄마 보고 싶어', '아빠 최고!', '약 잘 챙겨 드세요', '옷 따뜻하게 입어', '별일 없지?', '용돈 보냈어요', '오래오래 사세요', '가족 여행 가자', '항상 응원해요', '집에 도착했어요', '고마워요!'],
  '음식/다이어트 ①': ['뭐 먹지?', '배고파 죽겠다', '맛있겠다!', '다이어트는 내일부터', '야식 땡긴다', '치킨 시킬까?', '잘 먹었습니다!', '배불러 터짐', '디저트 배는 따로', '먹방 찍는 중', '고기 굽는 중', '카페 가자', 'JMT (존맛탱)', '단짠단짠', '오늘 한턱 쏠게!'],
  '음식/다이어트 ②': ['치팅데이!', '0칼로리 맛있으면', '운동 완료 오운완', '몸무게 줄었다!', '살쪘어 ㅠㅠ', '당 충전 필요', '매운 거 땡겨', '샐러드 먹는 중', '물 2리터 마시기', '먹방 보는 중', '맛집 줄 서는 중', '요리하는 중', '푸드파이터', '배달 완료!', '맛있어서 기절'],
  '오타쿠/덕질 ①': ['최애가 세상을 구한다', '통장 바칠게요', '얼굴 천재', '성지순례 완료', '앨범 샀다', '포카 교환 구함', '티켓팅 성공!', '피켓팅 망함…', '생카 투어 중', '덕통사고 당함', '입덕 완료', '탈덕은 없다', '굿즈 풀세트 구매', '콘서트 가는 중', '덕질이 최고야'],
  '오타쿠/덕질 ②': ['갓벽하다 진짜', '심장 저격', '컴백 기다리는 중', '팬싸 당첨!', '무대 찢었다', '눈물 줄줄', '주접 그만할 수 없음', '존재 자체가 빛', '직캠 무한 재생', '1열 관람 성공', '공식 굿즈 대기 중', '오프 뛰러 감', '덕질 메이트 구함', '응원봉 흔들흔들', '평생 덕질할게'],
  '분노/짜증 ①': ['진짜 화난다', '장난하나 지금?', '어이없네', '짜증 대폭발', '말 걸지 마', '심호흡 중 (후~)', '참을 인 세 번', '용서 못 해', '열받아 죽겠네', '조용히 해', '할 말이 없다', '생각 좀 하고 말해', '선 넘지 마라', '폭발 직전', '진정해 나 자신'],
  '분노/짜증 ②': ['싸우자는 건가?', '적당히 해라', '한숨 푹푹', '부들부들 떨림', '극대노 상태', '스트레스 만땅', '눈에 흙이 들어가도 안 됨', '너나 잘하세요', '다신 안 봐', '혈압 상승 중', '속 터져 죽겠네', '주먹 쥐는 중', '폭발 3초 전', '노답이다 진짜', '그만 좀 해!'],
  '축하/응원 ①': ['축하합니다!', '고생 많았어!', '응원할게 파이팅!', '넌 할 수 있어!', '수고하셨습니다', '대성공!', '꿈은 이루어진다', '축하 파티하자', '자랑스럽다!', '힘내라 힘!', '언제나 네 편이야', '꽃길만 걷자', '행복해야 해!', '짠~ 건배!', '최고의 결과!'],
  '축하/응원 ②': ['합격을 축하해!', '취업 성공 축하!', '결혼 축하합니다!', '생일 축하해!', '승진 축하드려요!', '노력은 배신하지 않아', '기적을 믿어', '끝까지 포기 마', '도움이 되어 기뻐', '멋지다 정말!', '눈부신 성장', '최선을 다했어!', '승리의 순간', '영광을 너에게', '축복합니다!'],
  '계절/날씨 ①': ['봄이 왔어요', '벚꽃 보러 가자', '더워 죽겠다 (폭염)', '바다 가고 싶다', '단풍 구경 가자', '독서의 계절', '추워 죽겠다 (한파)', '첫눈 온다!', '비 온다 주륵주륵', '우산 챙겨!', '태풍 조심해', '더위 먹었어', '따뜻한 햇살', '손이 꽁꽁 발이 꽁꽁', '환절기 조심'],
  '계절/날씨 ②': ['벚꽃 엔딩', '에어컨 풀가동', '장마 시작', '물놀이 가자!', '가을 타는 중', '군고구마 땡겨', '이불 밖은 위험해', '눈사람 만드는 중', '폭설 주의보', '맑은 하늘 드라이브', '습도 100% 찝찝', '건조해 미치겠네', '청명한 가을 하늘', '선크림 필수!', '따뜻하게 입어'],
  '반려동물/집사 ①': ['우리 애기 천사', '간식 주세요!', '산책 가자!', '골골송 부르는 중', '털 뿜뿜 힐링', '사고 쳤어요…', '동물병원 가는 중', '츄르 먹방', '놀아줘 놀아줘', '쿨쿨 자는 중', '꼬리 살랑살랑', '발톱 깎기 싫어', '집사야 밥 줘', '퇴근 맞이 냥이/댕이', '우주 최강 귀요미'],
  '반려동물/집사 ②': ['츄르는 사랑입니다', '젤리 발바닥 꾹', '아침 산책 완료', '그루밍 중', '손 주는 중', '멍멍! 짖는 중', '야옹~ 부르는 중', '집사 바라기', '다묘/다견 가정 행복', '꾹꾹이 하는 중', '캣타워 정복', '안아달라고 찡찡', '삐진 댕댕이/냥이', '반려동물은 가족', '건강하게 오래 살자'],
  '집순이/집돌이 ①': ['이불 밖은 위험해', '침대와 한 몸', '하루 종일 뒹굴뒹굴', '넷플릭스 정주행', '배달 음식 시킴', '파자마 차림', '나가기 귀찮아', '집이 최고야!', '방콕 모드 돌입', '외출 거부권 행사', '스마트폰 중독', '택배 언박싱 완료', '에어컨 밑이 천국', '나 혼자 산다', '완전 충전 중'],
  '집순이/집돌이 ②': ['이불 속이 내 우주', '바깥세상 무서워', '홈카페 오픈', '유튜브 알고리즘 탐험', '게임 삼매경', '최애 영상 무한 반복', '낮잠 타임', '잠옷이 정장', '프로 집콕러', '방 청소 완료 뿌듯', '혼술 타임', '창밖 구경 중', '완벽한 휴식', '집이 제일 편해', '평생 집에서 쉴래'],
  '육아/베이비 ①': ['쿨쿨 잘 자요', '맘마 먹을 시간', '기저귀 갈았어요', '배밀이 성공!', '새벽 수유 중 (졸려)', '안아줘요 으앙~', '이유식 냠냠', '첫 걸음마 뗐어요', '엄마 좋아!', '아빠 좋아!', '천사 같은 아기', '폭풍 옹알이 중', '장난감 어질러짐', '육아팅 힘내요!', '무럭무럭 자라라'],
  '육아/베이비 ②': ['엄마라고 불렀어!', '아장아장 걸음마', '까꿍 놀이 중', '낮잠 타임 (자유시간)', '이유식 거부…', '이가 나고 있어요', '놀이터 가자!', '목욕 시간 첨벙첨벙', '동화책 읽어주기', '투정 부리는 중', '육퇴 성공! (만세)', '예방접종 완료', '웃는 모습 심쿵', '독박육아 중…', '사랑해 우리 아기'],
  'MBTI & 밈 ①': ['극 E (파워 인싸)', '극 I (파워 집돌이)', '파워 J (완벽 계획)', '파워 P (즉흥 여행)', '극 T (팩트 폭격)', '극 F (폭풍 공감)', 'N 성향 (상상 폭발)', 'S 성향 (현실 직시)', 'MBTI 물어보기', '인싸력 폭발 (E)', '사회성 방전 (I)', '영혼 없는 리액션', '과몰입 중', '공감해줘 ㅠㅠ', '팩폭 금지'],
  'MBTI & 밈 ②': ['F 감수성', 'T발 C야?', '계획 충실 J', '무계획 여행 P', 'E 성향 폭발', 'I 성향 급속방전', 'MBTI 과몰입', '영혼 가출', '팩트로 패지 마', '오열각', '이성적 판단', '감정 조절 불가', '뇌세포 정지', '반박 불가', '납득 완료'],
  '여행/휴가 ①': ['공항 가는 길 (설렘)', '비행기 탑승 완료', '휴가 시작! (연락 금지)', '여권 챙겼지?', '호캉스 힐링 중', '인생샷 건졌다', '현지 맛집 정복', '환전 완료', '캐리어 짐 싸는 중', '여기가 천국인가', '바다 보러 가자', '여행 중 (답장 늦음)', '기념품 사갈게', '집에 가기 싫다', '휴가 후유증 (복귀)'],
  '여행/휴가 ②': ['다음 여행 어디 갈까?', '면세점 쇼핑 완료', '비행기 창가 자리', '호텔 체크인 완료', '야경 보며 힐링', '수영장에서 물놀이', '배낭여행 떠나요', '여유로운 티타임', '길 잃었지만 행복', '티켓 예매 성공!', '비행기 연착됨 (지침)', '인생 사진 찍어줘', '여행 사진 방출', '다음에 또 오자', '무사 귀국 완료!'],
  '쇼핑/택배 ①': ['택배 도착 알림 (두근)', '내돈내산 인증!', '장바구니 다 털었다', '이건 무조건 사야 해', '품절 임박 결제 완료', '할인 특가 놓칠 수 없지', '충동구매 후 후회 중', '영수증 보고 기절', '지갑이 텅텅 (거지)', '새 옷 입고 외출!', '언박싱 타임 (행복)', '가성비 최고 득템', '오늘 하루 탕진잼', '돈 쓰는 게 제일 짜릿해', '다음 달의 내가 갚겠지'],
  '쇼핑/택배 ②': ['주문 완료 (배송 기다림)', '문 앞 배송 완료!', '사이즈 딱 맞는다', '무료 배송 채우기', '신상 입고 알림', '라이브 특가 득템', '반품/교환 고민 중', '포토 리뷰 작성 완료', '위시리스트 추가', '쇼핑백 양손 가득', '지름신 강림!', '월급 순삭 삭제', '카드 한도 초과 위기', '이건 나를 위한 선물', '내 통장 눈감아'],
  '운전/교통 ①': ['초보운전 (양보 감사)', '주차 성공 (감격)', '출근길 차 막힘 (지각)', '안전운전 중 (답장 늦음)', '세차했더니 비 옴 (분노)', '네비가 길 잘못 알려줌', '고속도로 시원하게 질주', '기름값 실화냐 (주유)', '버스 놓쳤다 (전력질주)', '지하철 환승 지옥', '도착 5분 전!', '대리운전 불렀음', '오늘도 무사 귀가 완료', '신호 대기 중', '빵빵 경적 금지 (초보)'],
  '운전/교통 ②': ['출퇴근길 만원 버스', '지하철 문 닫힘 (아깝다)', '드라이브 갈 사람?', '주차 자리 찾는 중', '평행주차 멘붕', '음악 크게 틀고 드라이브', '퇴근길 정체 (졸려)', '네비게이션 도착 완료', '안전벨트 착용 필수', '톨게이트 통과', '차 뽑았다 널 데리러 가', '비 와서 서행 운전', '앞차 출발하세요', '교통카드 잔액 부족', '도착해서 연락할게'],
  '생일/파티 ①': ['생일 축하해 (HBD)!', '케이크 촛불 후~', '오늘 주인공은 나야 나', '태어나줘서 고마워', '선물 배송 보냈어!', '소원 빌었어 (이뤄져라)', '생일 파티 시작!', '미역국 챙겨 먹었어?', '축하해줘서 폭풍 감동', '용돈/기프티콘 쏩니다', '한 살 더 먹었네 (눈물)', '꽃길만 걷자!', '최고로 행복한 하루 보내', '생일빵 각오해라', '평생 함께 축하하자'],
  '생일/파티 ②': ['해피 버스데이 투 유!', '서프라이즈 파티 대성공', '생일 축하 노래 떼창', '고깔모자 착용 완료', '선물 언박싱 감동', '기념일 촛불 끄기', '샴페인 팡팡 터뜨리기', '파티 주인공 입장!', '나이 한 살 배달 완료', '생일 턱 쏠게!', '행복 가득한 날', '축하 메시지 폭발', '소중한 사람의 생일', '파티는 이제부터 시작', '사랑 가득한 하루!'],
  '헬스/오운완 ①': ['오운완!', '득근득근', '근손실 경보', '헬스장 출석', '하체 하는 날', '프로틴 수혈', '1세트만 더!', '스쿼트 완료', '유산소 지옥', '닭가슴살 냠냠', '체지방 컷!', '무게 치러 감', '땀방울 뻘뻘', '몸짱 가자!', '운동 끝!'],
  '헬스/오운완 ②': ['가슴 털리는 날', '인바디 충격', '단백질 보충', '식단 관리 중', '유산소 30분', '턱걸이 10개', '스트레칭 쭉쭉', '덤벨 번쩍!', '체중 감량 중', '운동 중독', '헬스장 가는 길', '치팅데이 가자', '근육 펌핑!', '오운완 인증샷', '내일도 운동!'],
  '절약/거지방 ①': ['무지출 성공!', '지갑 봉인', '숨만 쉬는 중', '통장이 텅장', '식비 0원 컷', '할인쿠폰 영끌', '가성비 최고', '소비 참음', '거지방 생존', '절약 모드', '포인트 적립', '영수증 충격', '도시락 쌌음', '티끌 모아 태산', '돈 아끼자'],
  '절약/거지방 ②': ['커피값 아꼈다', '강제 저축 중', '소비 요정 퇴치', '장바구니 삭제', '체크카드만 씀', '냉장고 파먹기', '외식 금지령', '짠테크 1일차', '통장 심폐소생', '무료 나눔 겟', '보너스는 적금', '영수증 버려줘', '소비 단식 중', '부자 될 거야', '만원의 행복'],
  '스터디/취준 ①': ['열공 중!', '스카 출석', '순공 10시간', '기상 인증 完', '멘탈 잡자', 'D-DAY 카운트', '면접 파이팅', '취뽀 가자!', '합격 기원', '과제 마감', '필기 정리 중', '시험 뿌시기', '졸음 퇴치', '꽃길만 걷자', '공부 끝!'],
  '스터디/취준 ②': ['스카 가는 길', '단어 암기 중', '모의고사 1등급', '동기부여 뿜뿜', '기출 분석 중', '합격 수기 쓰자', '졸음 쏟아진다', '오답노트 정리', '스터디 시작!', '열공 인증샷', '목표 달성!', '자격증 취득', '포기는 없다', '합격증 수령', '수고했어 오늘도'],
  '자취/1인가구 ①': ['배달 도착!', '혼밥 타임', '혼술 (캬~)', '냉장고 털기', '빨래 너는 중', '분리수거 날', '벌레다! (기절)', '집밥 먹고파', '청소 완료', '넷플 정주행', '택배 언박싱', '전등 갈기', '자취 요리사', '포근한 내 방', '소등 굿밤'],
  '자취/1인가구 ②': ['장보기 완료', '에어프라이어 가동', '햇반 데우는 중', '설거지 미루기', '방구석 힐링', '캔들 켜는 밤', '홈카페 오픈', '배달비 아까워', '주말 늦잠 꿀맛', '셀프 인테리어', '창문 꼭 닫기', '야식 타임 (라면)', '내 공간 최고', '오늘도 무사히', '잘 자 내 방'],
  '약속/카페투어 ①': ['도착 5분 전', '어디쯤이야?', '카페 가자!', '아아 수혈 중', '자리 잡았음', '웨이팅 중', '여기 존맛!', '디저트 배 따로', '얼른 와~', '뭐 마실래?', '1차 출발', '배 터지겠다', '사진 찰칵', '오늘 꿀잼', '다음에 또 봐'],
  '약속/카페투어 ②': ['자리 어디야?', '메뉴판 보는 중', '디저트 나왔다', '사진 건졌다!', '수다 삼매경', '힐링 타임', '커피 맛집 인정', '한 잔 더 마실까?', '감성 카페 뷰', '인생샷 찰칵', '달달구리 충전', '다음 코스 어디?', '시간 순삭!', '집 가는 길', '다음에 또 모여'],
  '캠핑/아웃도어 ①': ['캠핑 출발!', '불멍 타임', '텐트 피칭 完', '고기 굽굽', '감성 충전', '자연 힐링', '라면 끓이는 중', '밤하늘 별빛', '장비 뽐뿌', '커피 내리는 중', '날씨 요정', '우중 캠핑', '철수 완료', '피톤치드 뿜뿜', '집으로 복귀'],
  '캠핑/아웃도어 ②': ['장작 타는 소리', '마시멜로 굽기', '자연 속 힐링', '등산 정상 도착!', '경치 끝내준다', '야외 바베큐', '모닝 커피 한잔', '산림욕 중', '랜턴 켜는 밤', '차박 세팅 완료', '새소리 힐링', '등산화 끈 묶기', '자연인 모드', '캠핑의 맛!', '다음 캠핑 어디?'],
  '스포츠/직관 ①': ['홈런이다!', '골! 골! 골!', '역전 승리!', '직관 가는 중', '치맥 준비 完', '심판 눈 떠라', '나이스 샷!', '짜릿한 승리', '연장전 돌입', '패배 (눈물)', '응원가 열창', '선발 교체', '우승 가자!', '피켓팅 성공', '오늘 경기 끝'],
  '스포츠/직관 ②': ['만루 홈런!', '원더골 터졌다!', '승리의 함성', '클리닝 타임', '맥주 꿀맛', '선수 응원가', '스트라이크 삼진', '경기장 열기 후끈', '파울볼 조심!', '우승 트로피 가자', '오늘 MVP 누구?', '직관 승리 요정', '목청 터져라 응원', '열광의 도가니', '내일 경기 기대!'],
  '대청소/정리 ①': ['대청소 시작!', '당근마켓 나눔', '먼지 털기', '물청소 뽀송', '비우는 삶', '환기 중', '이불 빨래 完', '정리 끝 깔끔', '쓰레기 배출', '새집 같아', '청소 지옥', '뿌듯한 하루', '침대 커버 교체', '방이 반짝반짝', '이제 쉰다'],
  '대청소/정리 ②': ['옷장 정리 완료', '먼지 제로 도전', '재활용 분리수거', '쓰레기통 비움', '욕실 청소 반짝', '향기 가득 방', '버릴 옷 한가득', '신발장 정리', '먼지 털이 슉슉', '주방 기름때 싹', '정리의 기쁨', '미니멀 라이프', '청소기 윙윙', '공기청정기 가동', '깨끗해서 상쾌해'],
  '페스티벌/노래방 ①': ['티켓팅 성공!', '1열 잡았다', '노래방 가자', '마이크 내 꺼', '흥 폭발!', '떼창 준비', '목 쉬었음', '앵콜 외치는 중', '응원봉 흔들', '페스티벌 출발', '성대 결절 각', '고음 폭발', '여운 남음', '체력 방전', '귀가 완료'],
  '페스티벌/노래방 ②': ['점수 100점!', '발라드 타임', '랩 찢었다!', '서비스 시간 추가', '떼창으로 하나됨', '목 관리 필수', '엔딩곡 부르는 중', '생수 벌컥벌컥', '음악에 취한다', '콘서트 막차 탑승', '귀 호강 중', '헤드뱅잉 쾅쾅', '앵콜곡 대기', '최고의 무대!', '평생 기억할 밤'],
  '드라이브/로드트립 ①': ['드라이브 출발!', '창문 열고 힐링', '드라이브 송 ON', '바닷길 달리는 중', '노을 뷰 끝내준다', '휴게소 소떡소떡', '야간 드라이브', '바람 솔솔~', '달려보자 고고!', '숲길 코스 만끽', '감성 충전 완료', '오픈카 갬성', 'DT 픽업 완료', '힐링 만끽 중', '안전하게 복귀'],
  '드라이브/로드트립 ②': ['탁 트인 뷰 예술', '해안도로 질주', '플레이리스트 짱', '음악에 취한다', '휴게소 통감자', '스트레스 순삭', '커피 한잔의 여유', '자유를 찾아서', '전망대 도착!', '주말 드라이브', '예쁜 하늘 찰칵', '도로가 내 세상', '기분 전환 완료', '낭만 가득한 밤', '오늘도 행복했다'],
  '낚시/피싱 ①': ['입질 왔다!', '월척이다!', '손맛 짜릿', '포인트 도착', '미끼 끼우는 중', '챔질 나이스!', '출조 출발', '물고기 방생', '대어 낚았다', '낚싯대 드리우고', '세월을 낚는 중', '물멍 타임', '만선이오!', '꽝 쳤음 (눈물)', '오늘 낚시 끝'],
  '낚시/피싱 ②': ['새벽 출조', '루어 체인지', '찌만 뚫어져라', '드랙 풀린다!', '선상 라면 꿀맛', '도시어부 출격', '바다 낚시', '민물 낚시', '회 떠 먹자!', '잡어만 잔뜩', '바늘 빼는 중', '장비 욕심 뿜뿜', '힐링 낚시', '손맛 예술', '내일 또 출조'],
  '싸이클/라이딩 ①': ['라이딩 출발!', '케이던스 유지', '업힐 정복!', '다운힐 조심', '평속 30 찍음', '보급소 도착', '안라(안전라이딩)', '클릿슈즈 체결', '펑크 났다 (멘붕)', '야간 라이딩', '한강 자도 질주', '엔진 업그레이드', '100km 완주!', '허벅지 터짐', '오늘 라이딩 끝'],
  '싸이클/라이딩 ②': ['자덕 모임', '장비 경량화', '기어 변속 착착', '바람을 가르며', '자전거 세차 完', '스프린트 돌진', '져지 뽐뿌', '안라즐라!', '물통 원샷', '라이딩 인증샷', '장거리 투어', '역풍 지옥', '국토종주 도전', '안장통 (눈물)', '내일 또 타자!'],
  '골프/라운딩 ①': ['나이스 샷!', '버디 잡았다!', '홀인원 가자', '굿 샷!', '티샷 준비', '오비(OB) 났다…', '해저드 퐁당', '벙커 탈출!', '컨시드 땡큐', '퍼팅 라인 보기', '나이스 파!', '드라이버 200m', '라베(인생최고타)', '그늘집 타임', '오늘 라운딩 끝'],
  '골프/라운딩 ②': ['새벽 티오프', '명랑 골프', '백돌이 탈출!', '골린이 성장 중', '어프로치 완벽', '골프웨어 뽐뿌', '내기 승리!', '멘탈 게임', '스크린 골프 가자', '스윙 교정 중', '홀컵 땡그랑', '그린 라이 읽기', '비거리 폭발', '라운딩 인증샷', '다음 라운딩 예약']
};

const THEMES_EN = {
  'Daily/Greetings ①': ['LOL', 'Thank you!', 'You got this today', 'Nice!', 'Thanks a lot', 'Love you', 'Awesome!', 'Yay~', 'Sorry about that', 'Great job today', 'Congrats!', 'OMG', 'Really?', 'So touched ㅠㅠ', 'Good night'],
  'Daily/Greetings ②': ['Nice to meet you', 'What\'s up?', 'Did you eat?', 'Miss you', 'Good morning!', 'Bored', 'Where are you?', 'Let\'s hang out!', 'Cheer up!', 'Rooting for you', 'You\'re the best!', 'Perfect!', 'Excited!', 'Good work today', 'See you later!'],
  'Office Life ①': ['On my way to work', 'Leaving work now!', 'Heading out first', 'Noted with thanks', 'Understood', 'Monday blues', 'Payday!', 'Caffeine recharge', 'In a meeting', 'Working late', 'Great job today', 'TGIF!', 'Wanna quit', 'Got it!', 'Save me…'],
  'Office Life ②': ['On-time clock out!', 'Please check this', 'One moment please', 'Good work everyone', 'What\'s for lunch?', 'Don\'t wanna work', 'Soul left body', 'Tearing up', 'Tons of work', 'Sorry for late reply', 'Have a good one', 'Mental breakdown', 'Waiting for weekend', 'Taking a short break', 'Taking PTO'],
  'Students/School ①': ['Going to school', 'Exams are over!', 'I\'m doomed…', 'What after school?', 'Homework bomb', 'I\'m late!', 'All-nighter study', 'When is break?', 'It\'s vacation!', 'Switch seats please', 'Starving to death', 'Lend me textbook', 'So sleepy…', 'Aiming for A+!', 'Happy graduation!'],
  'Students/School ②': ['Let\'s go to cafeteria', 'In class right now', 'Show me your notes', 'Recess time!', 'Going to club room', 'Midterm season', 'Gotta retake class', 'Got seat in library', 'Hate going to school', 'Wanna go home', 'Excited for field trip', 'Took 1st in sports day', 'Should we ditch?', 'Studied zero percent', 'Wish me luck!'],
  'Stock/Investment ①': ['To the moon!', 'Rocket surge!', 'Cutting losses…', 'HODL to victory', 'Paycheck logged out', 'Money printer go brrr', 'Averaging down', 'Rescue team when?', 'Plunging hard (crying)', 'Took profits!', 'Where\'s my money?', 'All-in YOLO', 'Going bankrupt…', 'Got my bonus!', 'Stock god!'],
  'Stock/Investment ②': ['Full buy executed', 'Thought it was dip', 'Give me allowance', 'Midas in reverse', 'Account balance 0', 'Empty wallet', 'Went broke', 'Saving mode ON', 'Just flexed it', 'Dreaming of FIRE', 'My treat today!', 'Staring at chart', 'Broke even finally', 'Savings matured!', 'Cash is king'],
  'Gaming/Gamer ①': ['Winner winner!', 'Hard carried!', 'Stop trolling', 'Not my fault', 'Just one more game', 'Logging in', 'Team luck is unreal', 'Found a bug', 'All-night gaming', 'Lagging so bad', 'Insane micro plays', 'Carry me please', 'GG good game', 'Got the last hit', 'Going down first'],
  'Gaming/Gamer ②': ['Gacha jackpot!', 'Lost 50/50…', 'Bought in-game cash', 'Hit the pity (tears)', 'Reading guide', 'Looking for party', 'Rank promoted!', 'Demoted…', 'Control miss', 'Can I have role?', 'Farming gear', 'Let\'s slay boss', 'Revive me please', 'Top DPS dealer!', 'Gonna uninstall'],
  'Health/Fatigue ①': ['Exhausted to death', 'Headache', 'Gonna sleep early', 'Did you take meds?', 'Back hurts', 'Battery at 1%', 'Need healing', 'Going to clinic', 'Stay healthy!', 'Take vitamins', 'Need more coffee', 'Stiff shoulders', 'Blurry eyes', 'Caught a cold', 'No energy left…'],
  'Health/Fatigue ②': ['Fainting soon', 'Taking supplements', 'Whole body aches', 'Slept so well!', 'Stretching out', 'Breathing exercise', 'Want a massage', 'Proof of life', 'Don\'t push too hard', 'Immunity drop', 'Lying in bed', 'Built up fatigue', 'Warm cup of tea', 'Get well soon', 'Revived completely!'],
  'Humor/Memes ①': ['Whatever', 'So triggered', 'Clean & tidy', 'Got unfairly wrecked', 'Form is crazy', 'Actually better', 'Unbroken heart', 'Let\'s gooo~', 'Are you a T?', 'Baking bread', 'What in the world', 'Absolute legend', 'Inner dance party', 'Brain freeze', 'Is this right?'],
  'Humor/Memes ②': ['Ascending to heaven', 'Wait, this works?', 'Too much to say', 'Living god life', 'Ask me anything', 'Fake news right?', 'Got fact checked', 'Why is this real?', 'Logical suspicion', 'Mental shattered', 'Fangirling hard', 'Grabbing popcorn', 'Funny but sad', 'Burst out laughing', 'Fact violence'],
  'Emotions ①': ['So happy!', 'Touched to tears', 'So angry (fuming)', 'Waaaah (crying)', 'Surprise jump scare', 'Heart fluttering', 'Bored to death', 'Lonely…', 'Blushing (shy)', 'Scared to death', 'So frustrating', 'Annoyed!', 'Super confident', 'Feeling proud', 'Don\'t worry!'],
  'Emotions ②': ['Feeling so refreshed', 'Mental collapse', 'So hyped up yay~', 'Feeling hurt…', 'Feeling fantastic!', 'Relief (phew~)', 'Jealous explosion', 'Flustered (sweat drop)', 'Shock and horror', 'Mesmerized gaze', 'Deep in regret…', 'So unfair!', 'Heartwarming', 'Shocked out of mind', 'Overflowing with love'],
  'Couples/Romance ①': ['I miss you', 'What are you doing?', 'I love you ♥', 'Together forever', 'See you in dreams', 'Wanna hear your voice', 'Send me a selfie', 'Hold my hand?', 'Give me a hug', 'Lonely babe', 'Wanna see you soon', 'My darling', 'Good night sweet dreams', 'Fell for you again', 'Heart thump!'],
  'Couples/Romance ②': ['Let\'s go on a date!', 'Where should we go?', 'Happy anniversary!', 'Let\'s not fight', 'Pouting (hmph!)', 'Don\'t you cheat', 'How much you love me?', 'Always by your side', 'Too excited to sleep', 'Looking gorgeous today', 'Can we talk on phone?', 'Outside your door', 'Matching outfit time', 'You\'re my favorite', 'Love you endlessly'],
  'Family/Parents ①': ['Did you eat?', 'Get home safe', 'Love you mom/dad', 'Stay healthy', 'Thanks for allowance!', 'Always grateful', 'Don\'t get sick', 'I\'ll be home soon!', 'Mom\'s cooking is best', 'Dad cheer up', 'Family comes first', 'Visiting this weekend', 'Watch out for cold', 'Proud of you', 'I\'ll treat you well!'],
  'Family/Parents ②': ['Where are you now?', 'Come home early!', 'Lock the doors', 'Sent side dishes', 'Miss you mom', 'Dad you\'re the best!', 'Take your medicine', 'Dress warmly', 'Everything alright?', 'Sent some pocket money', 'Live long and healthy', 'Family trip time', 'Always cheering you on', 'Arrived safely', 'Thank you!'],
  'Food/Diet ①': ['What to eat?', 'Starving to death', 'Looks delicious!', 'Diet starts tomorrow', 'Craving late snack', 'Order chicken?', 'Thanks for the meal!', 'Stuffed full', 'Dessert stomach separate', 'Mukbang time', 'Grilling meat', 'Let\'s hit a cafe', 'Super delicious', 'Sweet and salty', 'My treat today!'],
  'Food/Diet ②': ['Cheat day!', '0 calories if yummy', 'Workout finished', 'Lost weight!', 'Gained weight ㅠㅠ', 'Need sugar rush', 'Craving spicy food', 'Eating salad', 'Drinking 2L water', 'Watching food videos', 'Waiting in restaurant line', 'Cooking right now', 'Food fighter mode', 'Delivered!', 'Fainting from deliciousness'],
  'Otaku/Fandom ①': ['My bias saves world', 'Take my wallet', 'Face genius', 'Pilgrimage completed', 'Bought album', 'Trading photocards', 'Ticket secured!', 'Ticketing failed…', 'Birthday cafe tour', 'Struck by bias', 'Fully joined fandom', 'No exit from here', 'Bought full merch set', 'Going to concert', 'Fangirling is life'],
  'Otaku/Fandom ②': ['God-tier visuals', 'Hit right in heart', 'Waiting for comeback', 'Won fansign event!', 'Tore up the stage', 'Crying tears of joy', 'Can\'t stop fangirling', 'Pure shining existence', 'Looping fancam 24/7', 'Secured 1st row view', 'Waiting for official merch', 'Going to offline event', 'Looking for fandom buddy', 'Waving lightstick', 'Fan for life'],
  'Anger/Frustration ①': ['Seriously mad', 'Are you kidding me?', 'Unbelievable', 'Rage explosion', 'Don\'t talk to me', 'Deep breathing (inhale)', 'Patience running out', 'Cannot forgive this', 'Boiling with rage', 'Be quiet', 'Speechless', 'Think before you speak', 'Don\'t cross the line', 'About to burst', 'Calm down self'],
  'Anger/Frustration ②': ['Wanna fight?', 'Cut it out', 'Deep heavy sigh', 'Trembling with anger', 'Maximum fury mode', 'Full of stress', 'Over my dead body', 'Mind your own business', 'Never seeing you again', 'Blood pressure rising', 'So frustrating inside', 'Clenching my fist', '3 seconds before blast', 'Totally hopeless', 'Just stop it!'],
  'Cheers/Celebration ①': ['Congratulations!', 'Great job everyone!', 'Rooting for you!', 'You can do it!', 'Thank you for hard work', 'Huge success!', 'Dreams come true', 'Let\'s have party', 'So proud of you!', 'Go for it!', 'Always on your side', 'Walk on flower path', 'Be happy always!', 'Cheers clink!', 'Best outcome ever!'],
  'Cheers/Celebration ②': ['Congrats on passing!', 'Congrats on new job!', 'Happy wedding!', 'Happy birthday!', 'Congrats on promotion!', 'Effort never betrays', 'Believe in miracles', 'Never give up', 'Glad to be of help', 'Simply awesome!', 'Dazzling growth', 'Did your best!', 'Moment of victory', 'Glory to you', 'Blessings to you!'],
  'Season/Weather ①': ['Spring is here', 'Let\'s see cherry blossoms', 'Sweltering hot heat', 'Wanna go to beach', 'Autumn foliage trip', 'Season for reading', 'Freezing cold winter', 'First snow is falling!', 'Pouring rain outside', 'Grab your umbrella!', 'Watch out for typhoon', 'Heat stroke alert', 'Warm sunshine', 'Frozen hands & feet', 'Beware change of seasons'],
  'Season/Weather ②': ['Cherry blossom ending', 'AC on full blast', 'Monsoon season started', 'Let\'s go swimming!', 'Catching autumn vibes', 'Craving roasted sweet potato', 'Outside blanket is dangerous', 'Building a snowman', 'Heavy snow warning', 'Clear sky road trip', '100% humidity sticky', 'So dry and thirsty', 'Crisp autumn sky', 'Sunscreen is a must!', 'Dress warm today'],
  'Pets/Owners ①': ['My baby angel', 'Give me treats!', 'Let\'s go for a walk!', 'Purring engine running', 'Fluffy shedding healing', 'Made a mess…', 'On way to vet', 'Churu feast time', 'Play with me now', 'Sleeping soundly', 'Tail wagging fast', 'Hate trimming claws', 'Feed me hooman', 'Welcoming home greeting', 'Cutest in universe'],
  'Pets/Owners ②': ['Churu is pure love', 'Paw jelly bean squeeze', 'Morning walk done', 'Grooming right now', 'Giving high paw', 'Bark bark barking', 'Meow meow calling', 'Obsessed with my pet', 'Happy multi-pet home', 'Making biscuits (kneading)', 'Conquered cat tower', 'Whining for cuddles', 'Pouting pet mode', 'Pets are family', 'Stay healthy forever'],
  'Homebody/Stay Home ①': ['Outside blanket is danger', 'Merged with my bed', 'Rolling around all day', 'Binging Netflix show', 'Ordered takeout food', 'Pajama lifestyle', 'Too lazy to go out', 'Home is the best!', 'Entering bunker mode', 'Exercising stay-home right', 'Smartphone addiction', 'Package unboxing done', 'Under AC is paradise', 'I live alone bliss', 'Recharging to 100%'],
  'Homebody/Stay Home ②': ['Under covers is my universe', 'Outside world is scary', 'Home cafe is open', 'YouTube rabbit hole', 'Lost in video games', 'Looping favorite clips', 'Afternoon nap time', 'Pajamas are my suit', 'Pro homebody master', 'Cleaned room feeling proud', 'Solo drinking night', 'Staring out window', 'Perfect rest day', 'Comfiest at home', 'Wanna rest forever'],
  'Parenting/Baby ①': ['Sleeping like an angel', 'Baby feeding time', 'Diaper changed clean', 'Crawling mastered!', 'Midnight feeding shift', 'Hold me waaaah~', 'Baby food yum yum', 'Took first tiny steps', 'I love mommy!', 'I love daddy!', 'Angelic baby face', 'Babbling thunderstorm', 'Toys scattered around', 'Parenting cheer up!', 'Grow up strong and well'],
  'Parenting/Baby ②': ['Said mommy first!', 'Toddling tiny steps', 'Peek-a-boo game', 'Nap time (free time!)', 'Refusing baby food…', 'First tiny tooth out', 'Let\'s go to playground!', 'Splash splash bath time', 'Reading bedtime story', 'Fussy cranky mood', 'Baby sleep shift success!', 'Vaccination completed', 'Melting at that smile', 'Solo parenting today…', 'Love you my precious'],
  'MBTI & Memes ①': ['Ultra E (Social King)', 'Ultra I (Homebody Master)', 'Power J (Master Plan)', 'Power P (Spontaneous Trip)', 'Ultra T (Truth Bomber)', 'Ultra F (Empathy Machine)', 'N Trait (Wild Imaginations)', 'S Trait (Grounded Reality)', 'What is your MBTI?', 'Extrovert energy peak', 'Social battery drained', 'Soulless reaction', 'Overthinking it all', 'Comfort me please ㅠㅠ', 'No truth bombs allowed'],
  'MBTI & Memes ②': ['F Sensitivity', 'Are you a T?', 'Planned everything J', 'No plan travel P', 'E energy explosion', 'I battery rapidly drained', 'MBTI over-immersion', 'Soul leaving body', 'Don\'t hit with facts', 'Crying rivers', 'Logical judgment', 'Uncontrollable emotions', 'Brain cell shutdown', 'Cannot refute this', 'Fully convinced'],
  'Travel/Vacation ①': ['On My Way to Airport!', 'Boarding Completed', 'Vacation Mode: ON (DND)', 'Got Your Passport?', 'Hotel Staycation Healing', 'Got the Perfect Shot!', 'Conquering Local Food', 'Currency Exchange Done', 'Packing My Suitcase', 'Is This Paradise?', 'Let\'s Go to the Beach', 'Traveling (Slow Reply)', 'Buying You Souvenirs', 'I Never Wanna Leave', 'Post-Vacation Blues'],
  'Travel/Vacation ②': ['Where Next?', 'Duty-Free Shopping Spree', 'Window Seat View', 'Hotel Checked In', 'Night View Healing', 'Poolside Splash', 'Backpacking Adventure', 'Relaxing Teatime', 'Lost but Happy', 'Booked the Tickets!', 'Flight Delayed (Tired)', 'Take My Photo Please', 'Dumping Travel Pics', 'Let\'s Come Again', 'Safely Back Home!'],
  'Shopping/Delivery ①': ['Package Arrived! (Excited)', 'Bought with My Own Money', 'Cleared My Entire Cart', 'Must-Have Item!', 'Ordered Before Sold Out', 'Can\'t Miss This Deal!', 'Regretting Impulsive Buy', 'Fainting at the Receipt', 'Wallet is Empty (Broke)', 'Wearing New Clothes Out!', 'Unboxing Time (Bliss)', 'Best Value Deal Ever', 'Retail Therapy Done', 'Spending Money is Fun', 'Future Me Will Pay for It'],
  'Shopping/Delivery ②': ['Order Placed (Waiting)', 'Left at Front Door!', 'Fits Perfectly', 'Adding for Free Shipping', 'New Arrival Alert', 'Live Deal Snagged', 'Should I Return or Keep?', 'Left a 5-Star Photo Review', 'Added to Wishlist', 'Bags in Both Hands', 'Shopping Spree Mode', 'Paycheck Disappeared', 'Card Limit Alert', 'A Gift to Myself', 'Bank Account Don\'t Look'],
  'Driving/Commute ①': ['Student Driver (Thanks!)', 'Parked Perfectly (Joy)', 'Stuck in Traffic (Late)', 'Driving (Will Reply Later)', 'Rained After Car Wash', 'GPS Gave Wrong Turn', 'Cruising Highway', 'Gas Prices Are Crazy', 'Missed the Bus (Sprinting)', 'Subway Transfer Hell', '5 Mins Away!', 'Called a Designated Driver', 'Made it Home Safely', 'Waiting at Red Light', 'Please Don\'t Honk!'],
  'Driving/Commute ②': ['Crowded Commute Bus', 'Doors Closed (So Close!)', 'Who Wants a Drive?', 'Hunting for Parking Spot', 'Parallel Parking Panic', 'Blasting Music on Drive', 'Stuck on Way Home (Sleepy)', 'Arrived at Destination', 'Fasten Seatbelt Always', 'Passing Tollgate', 'Got a New Car!', 'Slow Driving in Rain', 'Green Light Go Please', 'Insufficient Transit Card', 'Will Text When I Arrive'],
  'Birthday/Party ①': ['Happy Birthday (HBD)! 🎂', 'Blowing Out Candles', 'Birthday King/Queen Today!', 'Thank You for Being Born', 'Sent You a Gift!', 'Made a Wish (Come True)', 'Party Time Begins!', 'Did You Eat Soup?', 'Touched by Your Wishes', 'Sending You a Treat/Card', 'One Year Older (Tears)', 'Wishing You Blossom Days', 'Have the Best Day Ever', 'Ready for Birthday Pranks', 'Celebrating Forever Together'],
  'Birthday/Party ②': ['Happy Birthday to You!', 'Surprise Party Success!', 'Singing Birthday Song', 'Party Hat On!', 'Gift Unboxing Tears', 'Anniversary Candle Lit', 'Popping Champagne!', 'VIP of the Party Enters', 'Delivered +1 Year to Age', 'Treating You Today!', 'A Day Full of Joy', 'Message Inbox Exploding', 'Special Someone\'s B-Day', 'Party is Just Starting', 'Sending Tons of Love!'],
  'Fitness/Gym ①': ['Workout Done!', 'Muscle gain', 'Gym time', 'Leg day tears', '1 more set!', 'Protein refill', 'Squat complete', 'Cardio burn', 'Chicken breast', 'Sweat & grind', 'Heavy lifting', 'Cut that fat!', 'Fit & strong', 'Post-workout', 'Workout finish'],
  'Fitness/Gym ②': ['Chest day grind', 'InBody shock', 'Protein boost', 'Meal prep life', '30m cardio done', '10 pull-ups', 'Full stretch', 'Heavy dumbbells', 'Losing weight', 'Gym addicted', 'Heading to gym', 'Cheat day feast', 'Muscle pump!', 'Gym mirror selfie', 'Gym tomorrow!'],
  'Frugal/No Spend ①': ['$0 Spend Day!', 'Wallet sealed', 'Saving mode', 'Empty account', '$0 meal cut', 'Coupon hunt', 'Best value', 'Resisted urge', 'Budget survival', 'Frugal life', 'Earn points', 'Receipt shock', 'Packed lunch', 'Every penny counts', 'Save money'],
  'Frugal/No Spend ②': ['Saved coffee money', 'Forced savings', 'Temptation resisted', 'Cart cleared', 'Debit card only', 'Raid the fridge', 'Dining out ban', 'Frugal Day 1', 'Account revived', 'Got freebies', 'Bonus to savings', 'Trash receipt', 'Spending fast', 'Future rich', 'Budget joy'],
  'Study/Career ①': ['Studying hard!', 'Library check-in', '10hr study', 'Wake up check', 'Stay focused', 'D-Day countdown', 'Ace the interview', 'Get hired!', 'Pass the exam', 'Due today', 'Taking notes', 'Crush tests', 'Beat sleepiness', 'Bright future', 'Study done!'],
  'Study/Career ②': ['Off to study cafe', 'Memorizing vocab', 'Top exam grade', 'Super motivated', 'Analyzing exams', 'Success story', 'Falling asleep', 'Reviewing mistakes', 'Study session on', 'Proof of study', 'Goal achieved!', 'Certificate earned', 'Never give up', 'Offer received', 'Good job today'],
  'Solo Life/Home ①': ['Delivery arrived!', 'Solo dining', 'Solo drink (Cheers)', 'Empty fridge', 'Hanging laundry', 'Trash day', 'Bug alert! (Scream)', 'Craving home food', 'Clean room', 'Binge watching', 'Unboxing parcel', 'Lightbulb fixed', 'Home chef', 'Cozy sweet room', 'Lights out, gn'],
  'Solo Life/Home ②': ['Grocery haul done', 'Air fryer cooking', 'Microwave meal', 'Dishes for later', 'Cozy home chill', 'Scented candle', 'Home cafe vibes', 'Delivery fee ouch', 'Weekend sleep-in', 'DIY interior', 'Windows locked', 'Late night ramen', 'My space is best', 'Safe and sound', 'Goodnight sweet room'],
  'Hangout/Cafe ①': ['5 mins away', 'Where are you?', 'Cafe time!', 'Iced coffee refill', 'Got a table', 'In line waiting', 'So delicious!', 'Room for dessert', 'Hurry over!', 'What to drink?', 'Let\'s head out', 'So full!', 'Photo time 📸', 'So much fun', 'See you soon'],
  'Hangout/Cafe ②': ['Where is our seat?', 'Browsing menu', 'Dessert is served', 'Great photo taken!', 'Endless chatting', 'Healing moment', 'Best coffee spot', 'One more cup?', 'Aesthetic cafe view', 'Snapshot time', 'Sugar rush boost', 'Next stop where?', 'Time flew by!', 'Heading home', 'Let\'s meet again'],
  'Camping/Outdoor ①': ['Camping trip!', 'Campfire chill', 'Tent pitched', 'BBQ grilling', 'Cozy vibes', 'Nature healing', 'Ramen boiling', 'Starry night', 'Gear envy', 'Drip coffee', 'Sunny weather', 'Rainy camping', 'Camp packed up', 'Fresh forest air', 'Heading home'],
  'Camping/Outdoor ②': ['Crackling campfire', 'Roasting mallows', 'Peace in nature', 'Reached the peak!', 'Stunning view', 'Outdoor cookout', 'Morning brew', 'Forest bathing', 'Lantern lit night', 'Car camping ready', 'Birdsong healing', 'Lacing boots', 'Wilderness mode', 'Joy of camping', 'Next trip where?'],
  'Sports/Stadium ①': ['Home run!', 'Goal Goal Goal!', 'Comeback win!', 'Headed to stadium', 'Beer & snacks ready', 'Open your eyes ref', 'Nice shot!', 'Thrilling victory', 'Overtime thriller', 'Heartbreaking loss', 'Singing chants', 'Pitcher sub', 'Championship bound!', 'Got tickets!', 'Game over'],
  'Sports/Stadium ②': ['Grand slam!', 'Wonder goal!', 'Roar of victory', 'Halftime break', 'Crisp cold beer', 'Player anthem', 'Strikeout 3!', 'Stadium is fired up', 'Watch for foul balls!', 'Trophy is ours', 'Who is today\'s MVP?', 'Lucky charm fan', 'Loud loud cheering', 'Stadium madness', 'Hyped for next game!'],
  'Deep Clean/Organize ①': ['Deep clean starts!', 'Giving away items', 'Dusting off', 'Mopping fresh', 'Minimalist life', 'Airing out', 'Bedding washed', 'All neat & clean', 'Trash taken out', 'Looks brand new', 'Cleaning grind', 'Proud productive day', 'Fresh bed sheets', 'Sparkling clean', 'Rest time now'],
  'Deep Clean/Organize ②': ['Closet organized', 'Zero dust goal', 'Recycling sorting', 'Trash bins emptied', 'Bathroom sparkling', 'Fragrant room', 'Clothes to donate', 'Shoe rack tidy', 'Duster working', 'Kitchen grease gone', 'Joy of tidying', 'Minimalist living', 'Vacuum humming', 'Air purifier on', 'Fresh and clean'],
  'Festival/Karaoke ①': ['Got the ticket!', 'Front row seat', 'Karaoke time!', 'Mic is mine', 'Hype overload!', 'Ready to sing along', 'Voice is gone', 'Chanting encore', 'Wave lightsticks', 'Festival bound!', 'Vocal cords fried', 'High note burst', 'Post-concert high', 'Total burnout', 'Safe at home'],
  'Festival/Karaoke ②': ['Scored 100 points!', 'Ballad mood', 'Rap flow killed it', 'Bonus time added', 'United in singing', 'Save my throat', 'Ending theme song', 'Chugging water', 'Lost in music', 'Caught the last train', 'Ear candy heaven', 'Headbanging hard', 'Waiting for encore', 'Unreal performance!', 'Night to remember'],
  'Drive/Road Trip ①': ['Road trip begins!', 'Windows down fresh', 'Drive playlist ON', 'Ocean road cruising', 'Sunset view gold', 'Rest stop snacks', 'Night drive vibes', 'Gentle cool breeze', 'Let\'s ride!', 'Scenic forest trail', 'Recharged & happy', 'Convertible mood', 'Drive-thru pickup', 'Pure road healing', 'Safe return home'],
  'Drive/Road Trip ②': ['Breathtaking view', 'Coastal highway', 'Top playlist track', 'Lost in melodies', 'Rest stop potato', 'Stress evaporated', 'Sip coffee relax', 'Chasing freedom', 'Lookout point hit', 'Weekend cruise', 'Sky photo snap', 'Highway is mine', 'Mood refreshed', 'Romantic night sky', 'Pure bliss today'],
  'Fishing/Angling ①': ['Got a bite!', 'Huge catch!', 'Thrilling fight', 'Hit the sweet spot', 'Baiting the hook', 'Hookset success!', 'Boat setting out', 'Catch & release', 'Trophy fish caught', 'Casting the line', 'Patience & time', 'Water watching chill', 'Bountiful catch!', 'Zero catch (tears)', 'Fishing done today'],
  'Fishing/Angling ②': ['Early dawn fishing', 'Lure switched', 'Eyes on the float', 'Drag is screaming!', 'Boat ramen delicious', 'Urban fisherman', 'Deep sea angling', 'Freshwater river', 'Sashimi feast time!', 'Small baitfish only', 'Unlocking the hook', 'Gear collection itch', 'Peaceful angling', 'Pure hand feel', 'Next trip tomorrow'],
  'Cycling/Riding ①': ['Riding starts!', 'Keep cadence steady', 'Uphill conquered!', 'Watch the downhill', 'Avg speed 30km/h', 'Pitstop refueling', 'Ride safe!', 'Clipping shoes in', 'Flat tire crisis', 'Night ride blast', 'Riverside trail ride', 'Upgraded legs', '100km done!', 'Thighs on fire', 'Ride finished!'],
  'Cycling/Riding ②': ['Bike club meetup', 'Lightweight gear', 'Shifting gears smooth', 'Slicing wind', 'Bike wash complete', 'Sprint finish!', 'New jersey hype', 'Safe & fun ride!', 'Water bottle chug', 'Ride proof photo', 'Long distance tour', 'Headwind torture', 'Cross-country trail', 'Saddle sore tears', 'Ride again tomorrow!'],
  'Golf/Round ①': ['Nice shot!', 'Birdie bagged!', 'Hole in one go!', 'Good shot!', 'Tee shot ready', 'Out of bounds (OB)', 'Water hazard splash', 'Bunker escape!', 'Gimme thank you', 'Reading putt line', 'Nice par!', 'Driver 200m bomb', 'Personal best score', 'Clubhouse snack', 'Round finished!'],
  'Golf/Round ②': ['Dawn tee time', 'Fun friendly golf', 'Breaking 100!', 'Golf beginner growth', 'Approach on point', 'Golf outfit drip', 'Bet won clean!', 'Mind game focus', 'Screen golf next', 'Swing fix in motion', 'Cup rattle sound', 'Reading the green', 'Distance exploded', 'Course photo snapshot', 'Booking next round']
};

const THEMES_JA = {
  '日常/挨拶 ①': ['草www', 'ありがとう！', '今日も頑張ろう', 'いいね！', '感謝！', '大すき', '神！', 'やったー', 'ごめんね', 'お疲れ様', 'おめでとう', 'ヤバい', 'マジか', '感動！', 'おやすみ'],
  '日常/挨拶 ②': ['よろしくね', 'どうしたの？', 'ご飯食べた？', '会いたい', 'おはよう', '暇だなー', 'どこにいる？', '遊ぼう！', 'ファイト', '応援してる', '最高', '完璧！', '楽しみ！', '今日もお疲れ', 'またね！'],
  '会社員 ①': ['出勤中', '退勤します', 'お先に失礼します', '承知いたしました', '確認しました', '月曜病', 'お給料日！', 'コーヒー注入中', '会議中', '残業中', '今日もお疲れ様', '金曜最高！', '無理〜', '了解です', '助けて…'],
  '会社員 ②': ['定時退社！', '確認お願いします', '少々お待ちください', 'お疲れ様でした', 'ランチ行こう', 'やる気出ない', '魂抜けた', '目が死んでる', '仕事終わらない', '返信遅れました', 'お世話になっております', 'もう限界', '週末バンザイ', '休憩中', '有休使います'],
  '学生/学校 ①': ['学校行きたくない', 'テスト終わった！', '赤点かも', '放課後遊ぼう', '課題多すぎ', '遅刻しそう', '徹夜勉強', '冬休み最高', '夏休みまだ？', '席替えしたい', 'お腹すいた', '教科書忘れた', '眠い…', '単位取れた！', '卒業おめでとう'],
  '学生/学校 ②': ['学食行こう', '授業中', 'ノート見せて', '休み時間！', '部活行ってきます', '試験期間中', '補習決定', '自習室なう', '登校中', '下校中', '修学旅行楽しみ', '体育祭優勝！', '早く帰りたい', '勉強したくない', '合格した！'],
  '投資/マネー ①': ['月まで飛べ！', '爆上げ中！', '損切りした…', 'ガチホ一択', '給料日即消滅', 'お金がない', '押し目買い！', '神投資', '暴落した…', '億り人になる', '利確完了', 'チャート見つめ中', '破産寸前', 'ボーナス出た！', '株神様頼む'],
  '投資/マネー ②': ['全財産投資', '底値で拾った', 'お小遣いください', '含み損やばい', '口座残高ゼロ', '財布がすっからかん', '金欠警報', '節約生活', 'フレックス！', 'FIRE目指す', 'おごって！', '株価チェック中', '救われた…', 'コツコツ積立', '儲かった！'],
  'ゲーム/オタク ①': ['神引き！', '天井叩いた', '爆死した…', '推しが尊い', 'ログイン中', '沼にハマった', '連勝中！', 'キャリーして', 'トロールやめて', '徹夜ゲーム', 'グッズ買った', '聖地巡礼', '布教中', '課金は正義', '最高かよ'],
  'ゲーム/オタク ②': ['ガチャ引くぞ', 'すり抜けた…', '限界オタク', '尊死…', 'あと1回だけ', '回線落ちた', 'フレンド募集', 'イベント走る', 'リアイベ参戦', '公式ありがとう', '推し変無理', '神運営', 'フルコンボ！', 'VCできる？', 'GG！対あり'],
  '健康/疲労 ①': ['疲れた…', '頭痛い', '早く寝よう', '薬飲んだ？', '腰が痛い', '体力ゼロ', '癒やされたい', '病院行ってきた', '体調気をつけて', 'カフェイン必須', '肩こりやばい', '目が疲れた', '風邪ひいた', '栄養補給', '元気出して！'],
  '健康/疲労 ②': ['ぐったり', '栄養ドリンク飲んだ', '全身筋肉痛', 'よく寝た！', '息抜きしよう', '健康第一', 'マッサージ行きたい', '生き返った', '無理しないで', 'サプリ飲む', '倒れそう', '睡眠不足', '湯船入ろう', 'お大事に', '復活！'],
  'ユーモア/ミーム ①': ['それな', '知らんけど', '草不可避', 'ワロタ', '尊い…', '優勝！', '語彙力喪失', '分かりみが深い', 'ぴえん', 'あざとい', '優勝', '神', 'それなすぎる', '天才かよ', '解釈一致'],
  'ユーモア/ミーム ②': ['草生える', '異議あり！', '詰んだ', '大草原', 'エモい', 'バズった', '優勝', 'オワタ', '無理しんどい', 'お前がナンバーワン', '天才現る', '全米が泣いた', 'それなオブザイヤー', '圧倒的感謝', 'はい論破'],
  '感情表現 ①': ['幸せ〜', '感動した', '怒ったぞ', '泣いちゃう', 'びっくり！', 'わくわく', '退屈だな', '寂しい', '恥ずかしい', '怖かった', 'スッキリ！', 'もやもや', '誇らしい', '心配だな', '愛してる'],
  '感情表現 ②': ['大満足！', 'メンタル崩壊', '超嬉しい！', '悲しい…', 'イライラする', 'ドキドキ', 'ホッとした', '嫉妬しちゃう', 'パニック！', 'ショック…', 'うっとり', '後悔してる', '悔しい！', '温かい気持ち', '感謝でいっぱい'],
  'カップル/恋愛 ①': ['会いたいな', '今何してる？', '大好きだよ', 'ずっと一緒', '夢で会おうね', '声が聞きたい', '写真送って', '手をつなごう', 'ぎゅーして', '寂しいよ', '早く会いたい', '愛してる', 'おやすみチュッ', '今日も好き', '照れるな〜'],
  'カップル/恋愛 ②': ['デートしよう', 'どこ行く？', '記念日おめでとう', '喧嘩はやめよう', 'すねちゃうぞ', '浮気ダメ！', '私のこと好き？', 'いつでも味方だよ', 'キュンとした', 'かっこいい！', 'かわいいね', '電話できる？', '迎えに行くね', 'お揃いにしよう', '一生愛す'],
  '家族/親 ①': ['ご飯食べた？', '気をつけて帰ってね', '愛してるよ', '体調どう？', '小遣いありがとう', 'いつも感謝', '元気でいてね', 'すぐ帰るよ', '母さんのご飯最高', '父さんファイト', '家族が一番', '週末行くね', '風邪ひかないで', '誇らしいよ', '親孝行するね'],
  '家族/親 ②': ['今どこ？', '早く帰っておいで', '戸締まり確認！', 'お弁当ありがとう', 'お母さん大好き', 'お父さんありがとう', 'お薬飲んだ？', '寒くない？', '困ったことない？', '仕送り送ったよ', '長生きしてね', '家族旅行行こう', 'いつも応援してる', '無事着いた？', 'ありがとう'],
  'フード/ダイエット ①': ['何食べよう？', 'お腹すいた〜', '美味しい！', 'ダイエットは明日から', '夜食食べたい', 'チキン頼もう', 'ごちそうさま', '満腹！', 'スイーツ別腹', '飯テロやめて', '肉食べたい', 'カフェ行こう', 'これ激ウマ', '罪深い味', 'ごちそうするね'],
  'フード/ダイエット ②': ['チートデイ！', 'カロリーゼロ', '運動してきた', '体重減った！', 'リバウンドした…', '甘いもの食べたい', '辛いもの食べたい', 'サラダ生活', '水分補給！', 'モッパン中', '行列並んでる', '自炊したよ', 'おすすめグルメ', '配達頼んだ', 'うますぎる！'],
  'オタク/推し活 ①': ['推しが尊い', '全財産捧げる', '神ビジュ！', '現場参戦！', '円盤買った', 'トレカ交換', '当選した！', '落選した…', '聖地巡礼なう', '推しが生きてる', '布教活動中', '同担歓迎', '他担歓迎', 'グッズ全種類購入', 'オタ活最高'],
  'オタク/推し活 ②': ['推し変無理', '供給過多で死ぬ', 'カムバ楽しみ！', 'ペンサ当たった', '痛バ完成', '生誕祭開催！', '布教させて', '推しと目が合った', '銀テ取れた', '最前列神席', '公式に感謝', '現場最高', '概念コーデ', '推ししか勝たん', 'オタク辞められない'],
  '怒り/イライラ ①': ['マジでキレそう', 'ふざけるな', 'ありえない', 'イライラする', '話しかけないで', '深呼吸しよう', '我慢の限界', '許せない', '頭にきた', '静かにして', '呆れた', '何考えてるの？', 'もう知らない', '爆発寸前', '落ち着け私'],
  '怒り/イライラ ②': ['文句ある？', '勘弁してよ', 'ため息出る', '理不尽すぎる', '怒髪天', 'ストレスMAX', 'ムカつく〜', '勝手にすれば', '二度とごめん', '血圧上がる', 'イライラ爆発', '怒りの鉄拳', 'ブチギレ寸前', '納得いかない', 'もう限界！'],
  'お祝い/応援 ①': ['おめでとう！', 'よく頑張ったね', '応援してるよ！', '君ならできる', 'お疲れ様でした', '大成功！', '夢が叶ったね', 'お祝いしよう', '誇らしいよ', 'ファイト！', 'いつも味方だよ', '感動した！', '幸せになってね', '乾杯しよう！', '最高の結果！'],
  'お祝い/応援 ②': ['合格おめでとう！', '就職おめでとう！', '結婚おめでとう！', '誕生日おめでとう！', '昇進おめでとう！', '努力は裏切らない', '奇跡を起こそう', '最後まで諦めないで', '力になれて嬉しい', '素晴らしい！', '花道だけを歩こう', '全力を尽くした！', '勝利の瞬間', '栄光あれ', '祝福を！'],
  '季節/天気 ①': ['春が来た！', '花見行こう', '暑すぎる〜', '海行きたい！', '紅葉きれい', '読書の秋', '寒すぎる！', '初雪降った', '雨降ってる', '傘持った？', '台風気をつけて', '熱中症注意', 'ポカポカ日和', '凍えそう', '季節の変わり目'],
  '季節/天気 ②': ['桜吹雪きれい', 'エアコン必須', 'ゲリラ豪雨やばい', 'プール行こう', '食欲の秋', '焼き芋食べたい', 'こたつでみかん', '雪だるま作ろう', '大雪注意', '晴天ドライブ', '湿気すごい', '乾燥注意', '秋晴れ最高', '日焼け止め塗った？', 'あったかくしてね'],
  'ペット/飼い主 ①': ['うちの子天使', 'おやつちょうだい', '散歩行こう！', 'ゴロゴロ甘えん坊', 'モフモフ癒やし', 'いたずらっ子', '動物病院なう', 'チュールタイム', '遊んでアピール', 'すやすや夢の中', 'しっぽフリフリ', '爪切り嫌い', 'お留守番よろしく', 'おかえりニャン', '世界一かわいい'],
  'ペット/飼い主 ②': ['チュールしか勝たん', '肉球ぷにぷに', '朝の散歩完了', '毛づくろい中', 'おすわり上手', 'ワンワン吠える', 'ニャーと鳴く', '飼い主バカです', '多頭飼い幸せ', 'ふみふみタイム', 'キャットタワー登頂', '抱っこして', 'ご機嫌ななめ', 'ペットファースト', 'ずっと元気でいてね'],
  'インドア派 ①': ['おうち最高！', 'ベッドから出られない', '一日中ゴロゴロ', 'Netflix鑑賞中', '出前頼んだ', 'パジャマ生活', '外出めんどくさい', '布団が恋しい', '引きこもり中', '家から一歩も出ない', 'スマホ依存症', '宅急便受取完了', 'エアコン完備', '一人時間最高', '充電完了'],
  'インドア派 ②': ['布団の中が宇宙', '外の世界怖い', 'おうちカフェ開店', 'YouTube見放題', 'ゲーム三昧', '推しの動画鑑賞', 'お昼寝タイム', 'パジャマが正装', '引きこもりマスター', '掃除完了スッキリ', 'おうち居酒屋', '窓の外を眺める', '完全休養日', 'おうち大好き', '永遠に寝ていたい'],
  '子育て/ベビー ①': ['すやすや睡眠中', 'ミルクタイム', 'オムツ替え完了', 'ハイハイできた！', '夜泣き対応中', '抱っこして〜', '離乳食モグモグ', '初めてのあんよ', 'ママ大好き', 'パパ大好き', '天使の寝顔', 'イヤイヤ期突入', 'おもちゃ散乱', '子育てファイト', 'すくすく育ってね'],
  '子育て/ベビー ②': ['ママって言った！', 'よちよち歩き', 'いないいないばあ', 'お昼寝チャンス！', '離乳食拒否…', '歯が生えてきた', '公園で遊ぼう', 'お風呂タイム', '絵本読み聞かせ', 'ぐずぐず期', '寝かしつけ成功！', '予防接種完了', '笑顔にキュン', '今日もワンオペ', '愛してるよ宝物'],
  'MBTI & ミーム ①': ['完全なるE型', '圧倒的I型', '計画通りのJ型', '即興アドリブP型', '論理的なT型', '共感のF型', '直感派N型', '現実派S型', 'MBTI教えて', 'それな〜！', '解釈一致すぎ', '脳内お花畑', 'メンタル無敵', '語彙力消失', '大優勝！'],
  'MBTI & ミーム ②': ['I型の引きこもり', 'E型の陽キャ発動', 'T型のド正論パンチ', 'F型の涙腺崩壊', 'J型のスケジュール', 'P型の気まぐれ旅', '生粋のMBTIオタク', 'ミーム中毒', 'テンプレ通り', '尊すぎて無理', '分かりみが深すぎる', 'バズ確定', '全人類見て', '推しが神', 'はい天才']
,
  '旅行/休暇 ①': ['空港へ向かう道（ワクワク）', '搭乗完了！', '休暇スタート！（連絡NG）', 'パスポート持った？', 'ホカンスで癒やされ中', '映え写真撮れた！', 'ご当地グルメ制覇', '両替完了！', 'パッキング中', 'ここは天国かな？', '海見に行こう！', '旅行中（返信遅れます）', 'お土産買っていくね', '帰りたくない…', '休暇ロス（現実に復帰）'],
  '旅行/休暇 ②': ['次どこ行く？', '免税店で爆買い', '飛行機の窓際席', 'ホテルチェックイン完了', '夜景見てリラックス', 'プールで水遊び', 'バックパックの旅へ', 'のんびりティータイム', '道に迷ったけど楽しい', 'チケット予約成功！', '飛行機遅延（ぐったり）', '写真撮って〜', '旅行写真連投中', 'また来ようね', '無事帰国完了！'],
  'お買い物/宅配 ①': ['置き配届いた（ワクワク）', '自腹購入レビュー！', 'カート内全品爆買い', 'これ絶対買うべき！', '売り切れ直前に購入完了', 'セールは見逃せない！', '衝動買いして後悔中', 'レシート見て気絶', '財布がすっからかん', '新しい服でお出かけ！', '開封の儀（至福）', 'コスパ最高すぎ', '散財してスッキリ', '買い物最高に楽しい', '来月の自分が払うはず'],
  'お買い物/宅配 ②': ['注文完了（届くの待ち）', '玄関前に配達完了！', 'サイズぴったり！', '送料無料まであと少し', '新作入荷通知！', 'ライブ配信で安くゲット', '返品するか迷い中', '写真付きレビュー投稿', '欲しいものリスト追加', '両手いっぱいの紙袋', '物欲センサー爆発', '給料が秒で消滅', 'カード限度額ピンチ', '自分へのご褒美', '口座残高見ないでおこう'],
  '運転/交通 ①': ['初心者マーク（譲ってくれて感謝）', '駐車成功！（感動）', '通勤ラッシュ渋滞（遅刻ピンチ）', '運転中（返信遅れます）', '洗車したら雨降った（怒）', 'ナビに騙された…', '高速道路を快適ドライブ', 'ガソリン高すぎ！', 'バス乗り遅れた（猛ダッシュ）', '地下鉄乗り換え地獄', 'あと5分で着く！', '代行運転呼びました', '今日も無事帰宅完了', '信号待ち中', 'クラクション鳴らさないで（初心者）'],
  '運転/交通 ②': ['通勤満員バス', '電車のドア閉まった（悔しい）', 'ドライブ行く人？', '駐車場探し中', '縦列駐車でパニック', '音楽爆音でドライブ', '帰り道の大渋滞（眠い）', '目的地に到着しました', 'シートベルト必須！', '料金所通過', '車買ったよ！迎えに行くね', '雨だから安全運転', '前の車進んで〜', 'ICカード残高不足', '着いたら連絡するね'],
  '誕生日/パーティー ①': ['お誕生日おめでとう（おたおめ）！🎂', 'ろうそくをふーっ！', '今日の主役は私！', '生まれてきてくれてありがとう', 'プレゼント送ったよ！', '願い事した（叶いますように）', 'パーティーの始まり！', 'お祝いしてくれて感動', 'ギフトカード奢るね！', 'また一つ歳をとった（涙）', '花道だけを歩こう！', '最高に幸せな一日を', '誕生日プレゼント期待してね', 'ずっと一緒にお祝いしよう', 'いつもありがとう！'],
  '誕生日/パーティー ②': ['ハッピーバースデートゥーユー！', 'サプライズ大成功！', 'バースデーソング合唱', '三角帽子かぶったよ', 'プレゼント開封で涙', '記念日のロウソク消し', 'シャンパンで乾杯！', 'パーティーの主役登場！', '年齢＋1歳をお届け', '今日は奢っちゃう！', '幸せいっぱいの記念日', 'お祝いメッセージ殺到', '大切な人の特別な日', 'パーティーはこれから！', '愛を込めておめでとう！'],
  'フィットネス・筋トレ ①': ['筋トレ完了！', 'パンプアップ', 'ジム到着', '脚トレの日', 'あと1セット！', 'プロテイン補給', 'スクワット完', '有酸素地獄', 'チキン胸肉', '汗だく', '重量更新', '脂肪燃焼', 'マッチョ化', '筋肉痛…', '運動終了！'],
  'フィットネス・筋トレ ②': ['胸トレ追い込み', 'インボディの衝撃', 'タンパク質補給', '食事管理中', '有酸素30分完', '懸垂10回', 'しっかりストレッチ', 'ダンベル持ち上げ！', '減量中', '筋トレ中毒', 'ジムに向かう道', 'チートデイ決定', 'パンプ感最高！', 'ジム自撮り', '明日も筋トレ！'],
  '節約・無支出 ①': ['ノーマネーデー成功！', '財布封印', '節約モード', '口座すっからかん', '食費0円カット', 'クーポン活用', 'コスパ最強', '衝動買い我慢', '節約生活', 'ポイント貯金', 'レシートの悲劇', 'お弁当持参', '塵も積もれば', 'コツコツ貯金', '無駄遣いゼロ'],
  '節約・無支出 ②': ['コーヒー代節約', '先取り貯金', '物欲撃退', 'カート削除', 'デビットカード生活', '冷蔵庫一掃', '外食禁止令', 'ポイ活・節約1日目', '口座息を吹き返す', '無料タダ活ゲット', 'ボーナスは全額貯金', 'レシートいりません', 'お金使わない週間', '将来お金持ち', '1日1000円生活'],
  '勉強・就活 ①': ['猛勉強中！', '自習室到着', '集中10時間', '起床確認！', 'メンタル維持', 'D-Dayカウント', '面接ファイト', '内定ゲット！', '合格祈願', '課題締切', 'ノート整理中', 'テスト満点', '眠気撃退', 'サクラ咲け', '今日の勉強完！'],
  '勉強・就活 ②': ['自習カフェへ', '英単語暗記中', '模試A判定！', 'モチベ爆上がり', '過去問分析中', '合格体験記書くぞ', '睡魔と格闘中', '間違い直しノート', '勉強会スタート', '勉強記録アップ', '目標達成！', '資格取得完了', '諦めない心', '内定通知届いた', '今日も一日お疲れ様'],
  '一人暮らし・自炊 ①': ['出前到着！', 'ひとり飯', '晩酌タイム（乾杯）', '冷蔵庫整理', '洗濯干し中', 'ゴミ出し日', '虫出た！（悲鳴）', 'お袋の味恋しい', '掃除完了', '動画一気見', '荷物開封', '電球交換完了', '自炊マスター', '落ち着く我が家', '消灯おやすみ'],
  '一人暮らし・自炊 ②': ['買い出し完了', 'ノンフライヤー稼働', 'レンチンご飯', '皿洗いは後で', 'お部屋でまったり', 'アロマキャンドル', 'おうちカフェ開店', '配送料が痛い', '週末の二度寝最高', 'プチDIY模様替え', '戸締まり確認', '夜食のラーメン', '自分の空間最高', '今日も無事終了', 'おやすみマイホーム'],
  'カフェ巡り・約束 ①': ['あと5分で到着', '今どこ？', 'カフェ行こう！', 'アイスコーヒー補給', '席取ったよ', '行列待ち中', 'めっちゃ美味しい！', '別腹スイーツ', '早く来て～', '何飲む？', '1次会出発', 'お腹いっぱい', '写真パシャリ', '今日楽しかった', 'また会おうね'],
  'カフェ巡り・約束 ②': ['どの席にする？', 'メニュー迷い中', 'スイーツ到着！', '映え写真撮れた！', 'おしゃべり止まらん', '癒しのカフェタイム', '名店コーヒー認定', 'もう1杯飲む？', 'エモいカフェの眺め', '記念ショット', '糖分チャージ完了', '次どこ行く？', 'あっという間！', '帰り道なう', 'また集まろう！'],
  'キャンプ・アウトドア ①': ['キャンプ出発！', '焚き火タイム', 'テント設営完了', 'お肉ジュージュー', 'エモい雰囲気', '自然で癒し', 'ラーメン調理中', '満天の星空', 'ギア自慢', 'ドリップコーヒー', '晴れ男/晴れ女', '雨中キャンプ', '撤収完了', '森林浴最高', '帰路へ'],
  'キャンプ・アウトドア ②': ['薪のパチパチ音', 'マシュマロ焼き', '自然の中でリセット', '山頂登頂成功！', '絶景かな絶景かな', '青空バーベキュー', '目覚めの朝コーヒー', 'マイナスイオン満喫', 'ランタンの明かり', '車中泊セット完了', '小鳥のさえずり', 'トレッキング靴紐', '大自然満喫モード', 'キャンプの醍醐味', '次回のキャンプ地へ'],
  'スポーツ・現地観戦 ①': ['ホームラン！', 'ゴーーール！', '逆転勝利！', 'スタジアム現地観戦', 'チキン＆ビール完', '審判どこ見てる', 'ナイスショット！', '劇的勝利', '延長戦突入', '悔し涙…', '応援歌大合唱', '選手交代', '優勝目指せ！', 'チケット争奪戦勝利', '試合終了！'],
  'スポーツ・現地観戦 ②': ['満塁ホームラン！', 'スーパーゴール！', '勝利の雄叫び', 'ハーフタイム休憩', '球場ビール最高', '選手チャント熱唱', '三振バッターアウト', 'スタジアム熱気最高潮', 'ファウルボール注意！', 'トロフィー掲げよう', '今日のMVPは誰？', '勝利の女神降臨', '喉ちぎれる大声援', '歓喜の渦！', '次の試合も楽しみ！'],
  '大掃除・断捨離 ①': ['大掃除スタート！', 'フリマ断捨離', 'ホコリ払い', '水拭きピカピカ', 'ミニマリスト', '換気中', '布団丸洗い完了', '片付け完了綺麗', 'ゴミ捨て完了', '新築みたい', '掃除地獄', '充実した一日', 'シーツ交換', '部屋ピカピカ', 'やっとひと息'],
  '大掃除・断捨離 ②': ['クローゼット整理完', 'ホコリゼロ生活', '分別リサイクル', 'ゴミ箱スッキリ', 'お風呂掃除ピカピカ', 'いい匂いの部屋', '手放す服たくさん', '靴箱スッキリ', 'ハタキでパタパタ', 'キッチンの油汚れ撃退', '片付けの快感', '持たない暮らし', '掃除機ガーガー', '空気清浄機フル稼働', 'スッキリ爽快！'],
  'フェス・カラオケ ①': ['チケ発大勝利！', '最前列ゲット', 'カラオケ行こう', 'マイク独占', 'テンション爆発！', '大合唱の準備', '喉ガラガラ', 'アンコール叫ぶ', 'ペンライト振る', 'フェス出発！', '声帯崩壊寸前', '高音シャウト', '余韻ひたひた', '体力ゼロ', '無事帰宅'],
  'フェス・カラオケ ②': ['採点100点出た！', 'バラード熱唱', 'ラップ完璧にキメた', 'サービス延長キタ！', '合唱で一体感', '喉のケア必須', 'ラストソング熱唱中', 'ミネラルウォーター補給', '音楽に酔いしれる', '終電ギリギリ滑り込み', '耳が幸せすぎる', '全力ヘドバン', 'アンコール待ちわび', '最高のステージ！', '一生忘れられない夜'],
  'ドライブ・旅行 ①': ['ドライブ出発！', '窓全開で爽快', 'ドライブソングON', '海岸線を疾走中', '絶景の夕焼け', 'PAソトクソトク', 'ナイトドライブ', '風が心地いい', 'ぶっ飛ばそう！', '森林浴コース満喫', 'エナジーチャージ完了', 'オープンカー気分', 'ドライブスルー寄る', '癒しのドライブ旅', '無事に帰宅完了'],
  'ドライブ・旅行 ②': ['絶景パノラマビュー', '海沿いドライブ', '最強プレイリスト', '音楽に浸る時間', 'PAじゃがバター', 'ストレス解消！', 'コーヒーでひと息', '自由を求めて', '展望台到着！', '週末ドライブ日和', '青空パシャリ', '道路を独り占め', '気分転換完了', 'ロマンチックな夜', '最高の一日だった'],
  '釣り・フィッシング ①': ['アタリが来た！', '大物ヒット！', '引きがたまらん', '絶好ポイント到着', 'エサ付け中', 'ナイスアワセ！', 'いざ出航！', 'キャッチ＆リリース', '大魚釣り上げた！', '竿を垂らして', 'のんびり待つ時間', '水面チルタイム', '大漁だ！', 'ボウズだった（涙）', '今日の釣り終了'],
  '釣り・フィッシング ②': ['早朝出港', 'ルアーチェンジ', 'ウキを凝視中', 'ドラグが鳴る！', '船上ラーメン絶品', '釣り人モード突入', '海釣り最高', '渓流釣り', '刺身で乾杯！', '外道ばっかり…', '針外し中', '釣り具沼にハマる', '癒しの釣り旅', '最高の引き味', '明日も釣り行くぞ'],
  'サイクリング・ライド ①': ['ライド出発！', 'ケイデンス維持', 'ヒルクライム制覇！', '下り坂気をつけて', 'アベレージ30km', '補給ポイント到着', 'ご安全にライド！', 'ビンディング装着', 'パンクした…（涙）', 'ナイトライド', 'サイクリングロード快走', '脚力強化完了', '100km完走！', '太ももパンパン', 'ライド終了！'],
  'サイクリング・ライド ②': ['自転車オフ会', '軽量化カスタム', '小気味よい変速', '風を切って走る', '洗車ピカピカ', 'スプリント勝負', 'サイクルジャージ新調', '楽しく安全に！', 'ボトル一気飲み', 'ライド記念写真', 'ロングライド旅', '向かい風地獄', 'ロングツーリング挑戦', 'お尻が痛い…', '明日も走るぞ！'],
  'ゴルフ・ラウンド ①': ['ナイスショット！', 'バーディー奪取！', 'ホールインワン狙い', 'グッドショット！', 'ティーショット準備', 'OB出ちゃった…', '池ポチャ（涙）', 'バンカー脱出！', 'OKパットありがとう', 'ライン読み中', 'ナイスパー！', 'ドライバー200m超', 'ベストスコア更新！', '茶屋でひと息', 'ラウンド終了！'],
  'ゴルフ・ラウンド ②': ['早朝ティオフ', 'エンジョイゴルフ', '100切り達成！', 'ゴルフ女子/男子成長中', 'アプローチ完璧', 'ウェア自慢', '握り勝ち！', 'メンタル勝負', 'シミュレーションゴルフ', 'スイング改造中', 'カップインの快音', 'グリーン傾斜読む', '飛距離アップ！', 'コース記念写真', '次回予約完了']
};

const THEMES_ZH = {
  '日常/问候 ①': ['哈哈哈哈', '谢谢你！', '今天也要加油', '太赞了！', '万分感谢！', '超喜欢你', '封神！', '太好啦', '不好意思', '辛苦啦', '恭喜恭喜', '绝了', '真的假的', '感动！', '晚安好梦'],
  '日常/问候 ②': ['请多关照', '怎么啦？', '吃饭了吗？', '好想你', '早上好', '好无聊啊', '你在哪呢？', '出来玩呀！', '冲鸭！', '为你打call', '太棒了', '完美！', '超期待！', '今天也辛苦了', '回头见！'],
  '打工人 ①': ['上班搬砖中', '下班啦！', '我先撤啦', '收到明白', '已确认', '周一综合症', '发工资啦！', '咖啡续命', '开会中', '加班中', '今天也辛苦了', '周五万岁！', '撑不住了', '收到收到', '救命啊…'],
  '打工人 ②': ['准时准点下班！', '请查收确认', '请稍等片刻', '大家辛苦了', '一起吃午饭吧', '毫无干劲', '灵魂出窍', '眼神空洞', '活干不完了', '抱歉回复晚了', '祝商祺', '我快到极限了', '周末万岁', '摸鱼休息中', '我要休年假'],
  '学生/校园 ①': ['不想上学', '考完试啦！', '可能要挂科', '放学去哪玩', '作业超级多', '要迟到啦', '熬夜通宵刷题', '寒假万岁', '暑假还没到吗', '想换座位', '肚子好饿', '忘带课本了', '好困…', '学分到手！', '毕业快乐'],
  '学生/校园 ②': ['去食堂干饭', '上课中', '作业借我抄抄', '下课休息！', '去社团活动啦', '考试周地狱', '要补课了', '在自习室刷题', '上学路上', '放学回家路上', '期待修学旅行', '运动会夺冠！', '想赶紧回家', '不想学习', '成功上岸！'],
  '投资/理财 ①': ['起飞冲上月球！', '暴涨大红盘！', '含泪割肉…', '死拿到底不卖', '工资秒光', '穷到吃土', '逢低加仓！', '神级操作', '暴跌暴击…', '财富自由', '止盈落袋为安', '紧盯K线图', '快要破产了', '发年终奖啦！', '股神保佑发财'],
  '投资/理财 ②': ['全仓梭哈！', '抄底成功', '给点零花钱吧', '亏成大冤种', '账户余额归零', '钱包比脸还干净', '吃土预警', '省吃俭用', '大肆消费挥霍！', '向往提前退休', '这顿你请客！', '正在盯盘中', '解套上岸了…', '定投长期持有', '大赚特赚！'],
  '游戏/电竞 ①': ['欧气大爆发！', '吃保底吃满', '抽卡沉船…', '我的本命太神了', '正在登录游戏', '彻底入坑', '连胜大吉！', '求大佬带飞', '求你别送了', '通宵肝游戏', '周边到手！', '圣地巡礼打卡', '疯狂安利中', '氪金改变命运', '这也太爽了吧'],
  '游戏/电竞 ②': ['来一发单抽', '抽卡歪了…', '极限死忠粉', '被帅到晕厥…', '再打最后一局', '网络掉线了', '加个游戏好友', '狂肝游戏活动', '参加线下活动', '感谢官方爸爸', '此生不换本命', '良心好运营', '全连完美通关！', '能开语音吗？', 'GG！承让承让'],
  '健康/疲劳 ①': ['累瘫了…', '头痛欲裂', '赶紧睡觉去', '吃药了吗？', '腰酸背痛', '体力彻底见底', '需要被治愈', '刚从医院回来', '注意身体健康', '必须来杯咖啡', '肩膀酸痛僵硬', '眼睛快瞎了', '感冒了难受', '补充点营养', '打起精神来！'],
  '健康/疲劳 ②': ['整个人筋疲力尽', '喝了瓶功能饮料', '全身肌肉酸痛', '睡了个饱觉！', '喘口气放松下', '身体健康第一', '好想去按摩', '终于活过来了', '千万别硬撑', '吃点维生素', '累得快倒下了', '严重睡眠不足', '泡个热水澡吧', '好好保重身体', '满血复活！'],
  '幽默/梗 ①': ['绝了', '谁懂啊家人们', '笑出猪叫', '笑死我了', '太尊了…', '全场最佳！', '直接词穷', '懂的都懂', '嘤嘤嘤太难了', '绿茶心机', '神仙', '确实如此', '简直是天才', '过于真实', '破防了'],
  '幽默/梗 ②': ['笑到头掉', '我有异议！', '彻底完蛋', '笑飞了', '太戳我了', '直接火出圈', '全场最佳', '完结撒花', '我不理解但我大受震撼', '你就是第一名', '天才神回复', '全网泪目', '年度最佳发言', '万分感恩', '反驳无效！'],
  '情感表达 ①': ['超级幸福〜', '太感动了', '我生气了哦', '快要哭了', '吓我一跳！', '超期待好兴奋', '好无聊啊', '感到好孤单', '害羞不好意思', '吓死宝宝了', '神清气爽！', '心里堵得慌', '为你感到骄傲', '好担心你', '好爱你'],
  '情感表达 ②': ['超满足！', '心态大崩溃', '高兴到起飞！', '难过心碎…', '烦躁抓狂', '扑通扑通心跳', '总算松了口气', '我吃醋了', '大慌乱大恐慌！', '大受打击…', '如痴如醉', '后悔莫及', '太不甘心了！', '心里暖洋洋的', '心里满是感谢'],
  '情侣/恋爱 ①': ['好想见到你', '在干嘛呢？', '超喜欢你', '永远在一起', '梦里见哦', '想听听你的声音', '发张照片看看', '牵牵小手', '要抱抱', '好孤单想你', '想马上见到你', '我爱你', '晚安么么哒', '今天也超喜欢你', '哎呀好害羞〜'],
  '情侣/恋爱 ②': ['去约会吧', '去哪里玩呢？', '纪念日快乐', '我们不吵架好不好', '要噘嘴生气了', '不许出轨！', '你爱不爱我？', '永远站在你这边', '心动小鹿乱撞', '你好帅气！', '你好可爱呀', '能通电话吗？', '我去接你回家', '穿情侣同款吧', '爱一辈子'],
  '家庭/亲情 ①': ['吃饭了吗？', '路上注意安全', '我爱你们', '身体感觉怎么样？', '谢谢零花钱', '时刻心存感激', '要健健康康的哦', '马上就回家', '妈妈做的饭天下第一', '爸爸加油冲', '家人是最棒的', '周末回家看你们', '千万别着凉', '为你感到骄傲', '一定会好好孝顺'],
  '家庭/亲情 ②': ['现在在哪呢？', '早点回家哦', '出门锁好门窗！', '谢谢准备的便当', '最爱妈妈了', '谢谢爸爸', '吃药了吗？', '冷不冷呀？', '有没有遇到困难？', '生活费转过去啦', '要长命百岁哦', '全家一起去旅游吧', '永远支持你', '平安到了吗？', '谢谢家人'],
  '美食/减脂 ①': ['吃点什么好呢？', '肚子咕咕叫了〜', '好好吃啊！', '减肥永远是从明天开始', '想吃夜宵了', '点份炸鸡外卖吧', '多谢款待', '吃得好饱！', '甜品是装在另一个胃里的', '深夜报复社会放毒', '想大口吃肉', '去咖啡馆打卡', '这个绝顶美味', '罪恶但美味的卡路里', '今天我请客！'],
  '美食/减脂 ②': ['今天是放纵日！', '好吃就是零卡路里', '刚运动打卡完', '体重减轻掉秤啦！', '反弹复胖了…', '好想吃甜食', '想吃重辣重口味', '今天吃减脂沙拉', '吨吨补充水分！', '大胃王吃播中', '在排网红长队', '今天自己下厨啦', '私藏美食推荐', '外卖已经下单', '好吃到哭！'],
  '追星/饭圈 ①': ['我的爱豆就是神', '砸锅卖铁也要支持', '神仙颜值神颜！', '奔赴现场打卡！', '专辑已经下单', '小卡互换互撕', '中签门票啦！', '没抢到票痛哭…', '圣地巡礼进行时', '只要爱豆呼吸我就快乐', '疯狂安利给全世界', '欢迎唯粉', '欢迎博爱多担', '全套周边全部拿下', '追星就是最快乐的'],
  '追星/饭圈 ②': ['这辈子都不脱粉', '物料太多快乐升天', '期待这次回归大爆！', '抽中签售会名额', '痛包制作完成', '生日应援大狂欢！', '让我给你安利一下', '和爱豆对视了救命', '抓到现场彩带啦', '第一排神仙神位', '感谢官方爸爸赏饭', '现场演出现场感太绝了', '概念神级穿搭', '唯我爱豆天下第一', '这辈子都戒不掉追星'],
  '愤怒/暴躁 ①': ['真的要气炸了', '少给我装蒜', '简直不可理喻', '烦死我了', '别跟我说话', '深呼吸冷静一下', '忍耐已经到了极限', '绝对无法原谅', '火冒三丈', '给我安静点', '直接无语呆住', '脑子到底在想什么？', '不管你了随便吧', '即将暴走爆炸', '我一定要冷静'],
  '愤怒/暴躁 ②': ['你有意见吗？', '放过我吧求你了', '忍不住叹气叹息', '太不讲道理了', '怒发冲冠', '压力彻底爆表', '真让人火大〜', '爱咋咋地随便你', '绝对不会有下次', '血压一路飙升', '愤怒彻底爆发', '吃我一记愤怒铁拳', '临界点彻底破防', '我完全不接受', '受够了到极限了！'],
  '庆祝/应援 ①': ['恭喜恭喜大祝贺！', '你真的做得太棒了', '全力为你应援打call！', '你一定可以做到的', '大家辛苦啦', '大获全胜大成功！', '梦想终于成真了', '好好庆祝一下吧', '为你感到无比骄傲', '加油冲鸭！', '永远站在你身后', '真的太感动了！', '一定要幸福哦', '举杯干杯庆祝！', '最完美最好的结果！'],
  '庆祝/应援 ②': ['金榜题名考研成功！', '顺利入职恭喜恭喜！', '新婚大喜百年好合！', '生日快乐万事如意！', '升职加薪步步高升！', '努力付出绝不辜负', '一起创造奇迹吧', '坚持到底千万别放弃', '能帮上忙真的太开心了', '简直太精彩出色了！', '愿你未来一路繁花似锦', '已经拼尽全力无怨无悔！', '迎接胜利的荣耀时刻', '愿一切荣耀归你', '送上最真挚的祝福！'],
  '季节/天气 ①': ['春天来啦！', '一起去看樱花吧', '天气热到融化〜', '好想去海边度假！', '秋天枫叶太美了', '适合阅读的秋天', '冷到瑟瑟发抖！', '下初雪啦好浪漫', '外面正在下雨', '带雨伞了吗？', '注意防范台风天气', '小心防暑降温', '暖洋洋的好天气', '快要冻成冰块了', '换季时节注意保暖'],
  '季节/天气 ②': ['漫天落樱美如画卷', '必须开空调救命', '突降暴雨淋成落汤鸡', '一起去游泳池吧', '胃口大开的贴秋膘时节', '好想吃热腾腾的烤红薯', '躲在暖炉被窝吃橘子', '一起堆雪人打雪仗吧', '大雪暴雪注意安全', '晴空万里适合兜风', '空气湿度爆表潮湿', '天气干燥注意补水保湿', '秋高气爽万里无云', '涂好防晒霜了吗？', '多穿点衣服千万别着凉'],
  '宠物/铲屎官 ①': ['我家小主就是小天使', '快把零食交出来', '出门散步遛弯啦！', '呼噜呼噜撒娇小能手', '毛茸茸太治愈身心了', '调皮捣蛋小坏蛋', '正在宠物医院看病', '开吃猫条猫罐头时间', '疯狂暗示想要一起玩', '睡得香甜打小呼噜', '摇尾巴摇成小螺旋桨', '最讨厌剪指甲了', '在家乖乖看家哦', '欢迎铲屎官回家喵', '世界上最可爱的小可爱'],
  '宠物/铲屎官 ②': ['只要有零食万事大吉', '粉嫩肉垫软软糯糯', '早晨遛狗散步打卡', '正在认真梳毛洗脸中', '坐下握手超级听话', '汪汪汪欢快大叫', '喵喵喵娇滴滴叫', '无可救药的重度宠溺主', '多宠家庭超级幸福', '踩奶揉揉小爪爪', '成功登顶猫爬架最高处', '求抱抱求抚摸', '现在心情有点小不爽', '宠物永远排在第一位', '要一直健康快乐陪着我哦'],
  '宅家派 ①': ['宅在家里天下第一！', '死活都不想离开被窝', '整整一天躺平滚来滚去', '正在刷奈飞追剧煲剧', '外卖已经送到门口', '穿着睡衣过一天', '出门社交好麻烦啊', '无比留恋温暖的被窝', '闭门不出闭关中', '一步都不想踏出家门', '重度手机依赖症患者', '快递拆箱大功告成', '空调房里四季如春', '一个人的独处时光最爽', '电量彻底充盈满格'],
  '宅家派 ②': ['被窝里就是我的整个宇宙', '外面的世界太险恶可怕了', '家庭自制咖啡馆开张', '刷视频根本停不下来', '沉浸在游戏世界狂欢', '反复刷本命爱豆的视频', '惬意午睡小憩时间', '睡衣就是我的最高正装', '顶级资深宅家大师', '把家里打扫得干干净净', '温馨的家庭小酒馆', '呆呆望着窗外的风景', '彻底身心休整的一天', '打心底里深爱我的家', '好想永远这么睡下去'],
  '育儿/萌宝 ①': ['香香甜甜睡觉中', '到喝奶喂奶时间啦', '换好干爽纸尿裤啦', '学会四脚爬行啦！', '半夜狂哭紧急哄娃', '伸出双手求抱抱〜', '辅食吃得津津有味', '迈出人生的第一步路', '最喜欢最爱妈妈了', '最喜欢最爱爸爸了', '像小天使一样的可爱睡颜', '正式进入叛逆小烦恼期', '满地都是扔乱的玩具', '今天也要育儿加油鸭', '健健康康快快长大哦'],
  '育儿/萌宝 ②': ['第一次开口叫妈妈了！', '摇摇晃晃蹒跚学步', '躲猫猫捉迷藏哇', '趁娃睡着偷得半日闲！', '把辅食推开拒绝吃…', '开始冒出第一颗小乳牙啦', '去小公园晒太阳玩耍', '舒服泡澡洗香香时间', '讲睡前童话绘本故事', '哼哼唧唧闹脾气小情绪', '成功把小神兽哄睡着了！', '预防针疫苗顺利接种完毕', '被天真无邪的笑容瞬间击中', '今天也是一个人独自带娃的一天', '深深爱着你我的无价之宝'],
  'MBTI & 梗 ①': ['纯正E人社交天花板', '资深I人社恐本恐', '万事按计划来的强迫症J人', '随性即兴发挥的自由P人', '逻辑严密莫得感情的理智T人', '共情能力爆棚的感性F人', '天马行空直觉流N人', '脚踏实地注重现实的S人', '报上你的MBTI暗号', '就是说啊太真实了〜！', '解读简直和我一模一样', '脑子装满了浪漫幻想花海', '内心强大精神状态极度稳定', '瞬间失去一切语言组织能力', '赢麻了直接封神！'],
  'MBTI & 梗 ②': ['I人只想一个人闭关宅家', 'E人瞬间开启社交牛逼症', 'T人直击灵魂的事实大暴击', 'F人瞬间泪腺大崩溃泪目', 'J人精确到分钟的时间表', 'P人说走就走的即兴旅行', '如假包换的重度MBTI研究员', '重度网络流行梗上瘾患者', '完美符合一切刻板印象模板', '尊贵到难以用言语形容', '共鸣感深到骨髓深处了', '这条发言绝对要火遍全网', '全人类都给我过来看', '我的本命就是至高神明', '绝妙天才神操作']
,
  '旅行/度假 ①': ['奔向机场（超期待）', '登机完毕起飞！', '开启休假模式（请勿打扰）', '护照带齐了吗？', '在酒店躺平度假中', '拍到人生照片啦！', '打卡当地美食天堂', '换汇搞定！', '正在收拾行李箱', '这里简直是天堂吧', '一起去看海吧！', '旅行中（回复较慢）', '会给你带伴手礼的', '完全不想回家…', '假期综合症（回工位）'],
  '旅行/度假 ②': ['下一站去哪玩？', '免税店大扫货完毕', '飞机靠窗绝美景观', '酒店办理入住搞定', '看绝美夜景治愈中', '在游泳池欢快戏水', '背上行囊出发探险', '惬意悠闲下午茶', '迷路了但也超开心', '抢票成功万岁！', '航班延误（累瘫了）', '快帮我拍张大片', '疯狂连发旅行美照', '下次还要再来！', '平安落地回家啦！'],
  '购物/快递 ①': ['快递已送达通知（激动）', '纯自费入手测评！', '清空购物车大扫荡', '这个必须狠狠拿下', '库存告急火速下单', '折扣特惠绝不能错过', '冲动消费后开始后悔', '看到账单倒吸一口气', '钱包彻底空空（吃土）', '穿上新衣服出门！', '拆箱开箱时刻（超治愈）', '性价比爆棚神仙好物', '今天尽情买买买剁手', '花钱的感觉最爽快', '下个月的我自会偿还'],
  '购物/快递 ②': ['下单成功（坐等收货）', '放在家门口签收啦！', '尺码刚刚好超级合身', '凑单包邮中', '新品上架通知！', '直播间抢到神价', '纠结要不要退换货', '带图好评已发布', '加入心愿心动单', '两手提满大购物袋', '购物欲彻底大爆发', '工资瞬间秒没', '信用卡额度亮红灯', '这是给自己的犒赏', '我的银行卡闭上眼睛'],
  '驾驶/交通 ①': ['新手上路（感谢让行）', '一把入库倒车入库成功', '早高峰大堵车（要迟到）', '正在安全驾驶中（稍后回复）', '刚洗完车就下雨（抓狂）', '导航带我走错路了', '在高速上畅快飞驰', '油价真的太贵了（加油）', '没赶上公交（狂奔中）', '地铁换乘修罗场', '还有5分钟到达！', '叫了代驾回家', '今天也平安顺利到家', '正在红灯等待中', '请勿催促按喇叭（新手）'],
  '驾驶/交通 ②': ['早晚高峰挤爆公交', '地铁门关上了（差一秒）', '有谁想一起去兜风？', '到处找停车位中', '侧方停车心态大崩', '音量拉满开着音乐兜风', '下班路上一路大堵（好困）', '导航提示已到达目的地', '务必系好安全带', '通过高速收费站', '喜提新车来接你啦', '下雨路滑减速慢行', '前车师傅快起步呀', '交通卡余额不足', '到了给你发微信'],
  '生日/派对 ①': ['祝你生日大快乐（HBD）！🎂', '吹灭生日蛋糕蜡烛〜', '今天的主角就是我啦！', '感谢你的降临来到世界', '生日礼物已发货！', '许了个美好的愿望（一定要实现）', '生日派对正式开场！', '吃长寿面了吗？', '收到你的祝福超感动', '发个大红包/请你喝奶茶', '又长了一岁（假装抹泪）', '愿你一路繁花似锦！', '度过最幸福最棒的一天', '准备接受生日惊喜吧', '每年都要一起过生日哦'],
  '生日/派对 ②': ['祝你生日快乐歌！', '惊喜派对圆满大成功', '全场齐唱生日歌', '戴上可爱的生日尖尖帽', '拆礼物拆到手软感动', '吹熄纪念日蜡烛', '香槟喷涌欢呼庆祝！', '派对全场焦点隆重登场', '您的年龄已自动+1', '今天全部由我买单！', '充满幸福的美好一天', '祝福消息疯狂刷屏', '最最珍贵之人的生日', '派对狂欢现在才刚开始', '把满满的爱都送给你！'],
  '健身/今日运动打卡 ①': ['今日运动打卡！', '增肌中', '健身房报道', '痛苦练腿日', '再来一组！', '蛋白粉补充', '深蹲完成', '疯狂有氧', '鸡胸肉干饭', '挥洒汗水', '加重量！', '减脂冲刺', '身材管理', '肌肉酸痛', '运动结束！'],
  '健身/今日运动打卡 ②': ['练胸力竭日', '体测InBody冲击', '补充优质蛋白', '控糖减脂餐', '有氧30分钟打卡', '引体向上10个', '全身深度拉伸', '举铁狂魔！', '体重持续下降', '运动上瘾', '去健身房路上', '放纵日狂吃', '肌肉充血泵感！', '更衣室对镜自拍', '明天继续开练！'],
  '节约/无消费日 ①': ['无消费日打卡！', '封印钱包', '省钱模式', '钱包比脸干净', '伙食费0元', '优惠券叠满', '性价比王者', '忍住不买', '贫穷苟住', '省吃俭用', '积分兑换', '看账单心梗', '自带便当', '积少成多', '攒钱暴富'],
  '节约/无消费日 ②': ['省下一杯咖啡钱', '强制储蓄中', '战胜消费主义', '清空购物车', '只用储蓄卡', '清空冰箱库存', '禁止一切外食', '极简攒钱第1天', '钱包回血中', '薅到免费羊毛', '奖金全存定期', '收据直接扔掉', '消费断食挑战', '早日财务自由', '百元周挑战'],
  '学习/求职备考 ①': ['沉迷学习！', '自习室报道', '专注10小时', '早起打卡', '稳住心态', '考试倒计时', '面试冲刺', '顺利上岸！', '逢考必过', '作业截止', '笔记整理中', '拿下考试', '赶走瞌睡', '前程似锦', '今日学完！'],
  '学习/求职备考 ②': ['自习咖啡馆路上', '疯狂背单词中', '模考全A拿下', '动力瞬间拉满', '真题全面剖析', '写上岸经验贴', '困意排山倒海', '整理错题本', '学习小组开动', '今日打卡打卡', '目标圆满达成！', '证书顺利到手', '绝不轻言放弃', '收到了录用Offer', '今天辛苦啦自己'],
  '独居/一人生活 ①': ['外卖到了！', '一人食时间', '小酌一杯（爽）', '清理冰箱', '晾晒衣服', '扔垃圾日', '有虫！（尖叫）', '想吃家常菜', '大扫除完成', '疯狂刷剧', '快乐拆快递', '换灯泡成功', '独居小厨神', '温馨小窝', '关灯晚安'],
  '独居/一人生活 ②': ['超市大采购完', '空气炸锅启动', '微波炉热米饭', '碗留着待会洗', '窝在家里充电', '点燃香薰蜡烛', '家庭咖啡馆营业', '配送费好心疼', '周末睡到自然醒', '改造小窝软装', '出门锁紧门窗', '深夜来碗泡面', '独处时光最惬意', '今天也平安度过', '晚安我的小天地'],
  '约会/探店喝咖啡 ①': ['还有5分钟到', '你到哪啦？', '去咖啡馆吧！', '冰美式续命', '占到位置了', '排队中', '绝绝子超好吃！', '甜品第二个胃', '快来呀～', '喝点什么？', '第一轮出发', '撑到爆炸', '拍照打卡 📸', '今天超开心', '下次再聚'],
  '约会/探店喝咖啡 ②': ['我们在哪个桌？', '研究菜单中', '甜点上桌啦！', '拍到人生照片！', '八卦聊天停不下', '治愈咖啡时光', '神仙宝藏咖啡馆', '再点一杯喝吗？', '氛围感窗景', '合照来一张', '糖分全面充盈', '下一站去哪里？', '时间过太快啦！', '在回家路上啦', '下次一定再聚！'],
  '露营/户外治愈 ①': ['露营出发！', '篝火发呆时刻', '帐篷搭建完毕', '烤肉滋滋香', '氛围感拉满', '大自然治愈', '煮泡面中', '漫天繁星', '装备大赏', '手冲咖啡', '晴天好天气', '雨中露营', '撤营完毕', '吸氧森林浴', '平安到家'],
  '露营/户外治愈 ②': ['听柴火劈啪声', '烤棉花糖软糯', '在大自然中重启', '成功登顶山峰！', '绝美风景尽收眼底', '户外露天烧烤', '清晨第一杯咖啡', '享受森林负氧离子', '点亮露营小灯', '车泊宿营就绪', '清脆鸟鸣治愈', '系紧登山鞋带', '回归荒野模式', '露营的真正魅力', '计划下一次露营'],
  '体育/球赛现场 ①': ['全垒打！', '进球啦！！！', '绝地大逆转！', '现场观赛中', '炸鸡啤酒就位', '裁判睁开眼', '漂亮一击！', '燃炸绝杀', '进入加时赛', '惜败泪目…', '高唱助威歌', '换人调整', '冲向冠军！', '抢票大成功', '比赛结束！'],
  '体育/球赛现场 ②': ['满贯全垒打！', '世界波破门！', '胜利的咆哮', '中场休息时间', '冰镇啤酒超爽', '全场高唱战歌', '三振强力出局', '球场气氛嗨翻天', '小心界外飞球！', '捧起冠军奖杯', '今天的MVP是谁？', '自带胜利Buff', '喊破嗓子的助威', '狂欢的海洋', '期待下一场大战！'],
  '大扫除/极简收纳 ①': ['大扫除开始！', '断舍离送闲置', '掸灰除尘', '拖地干干净净', '极简生活', '开窗通风', '洗晒被褥完毕', '收纳整整齐齐', '垃圾分类清运', '焕然一新', '保洁地狱', '充实的一天', '换新床单', '屋子亮闪闪', '终于能歇了'],
  '大扫除/极简收纳 ②': ['衣柜全面整理完', '向无尘目标冲刺', '分类回收处理', '垃圾桶清空啦', '浴室瓷砖亮晶晶', '满屋子都是清香', '打包闲置旧衣物', '鞋柜整齐划一', '鸡毛掸子扫扫灰', '厨房重油污去无踪', '整理带来的快乐', '不持有物品生活', '吸尘器轰鸣中', '空气净化器全力开启', '一尘不染真痛快'],
  '音乐节/K歌嗨唱 ①': ['抢票成功！', '抢到前排C位', '去KTV飙歌', '话筒是我的', '嗨翻全场！', '全场大合唱', '嗓子喊哑了', '大喊安可中', '挥舞荧光棒', '音乐节出发！', '声带升华', '高音轰炸', '余音绕梁', '电量耗尽', '安全到家'],
  '音乐节/K歌嗨唱 ②': ['K歌评分100分！', '深情抒情慢歌', 'Rap说唱杀疯了', '老板送了加钟！', '万人合唱起鸡皮疙瘩', '得好好保护嗓子', '唱响最后一首歌', '大口咕咚灌水', '完全沉浸在音乐里', '踩着末班车回家', '耳朵怀上了双胞胎', '疯狂甩头Pogo', '静候压轴安可曲', '神仙现场绝了！', '值得铭记一生的夜晚'],
  '自驾兜风/公路旅行 ①': ['自驾兜风出发！', '摇下车窗吹风', '车载音乐开大', '沿着海边飞驰', '夕阳落日美炸了', '服务区烤肠走起', '夜间兜风模式', '微风徐徐吹来', '向前冲冲冲！', '沉浸式穿梭林道', '电量瞬间充满', '敞篷车既视感', '顺路买个麦当劳', '治愈兜风时刻', '平安顺利归家'],
  '自驾兜风/公路旅行 ②': ['开阔绝美全景', '滨海公路狂飙', '神仙歌单循环', '沉浸在旋律里', '服务区大土豆', '烦恼一扫而空', '悠闲喝杯咖啡', '奔向自由旅途', '到达观景台！', '周末自驾游', '拍下绝美天空', '公路尽在脚下', '心情彻底转晴', '浪漫公路之夜', '今天无比幸福'],
  '钓鱼/户外垂钓 ①': ['咬钩了咬钩了！', '中大鱼啦！', '手感绝了过瘾', '到达黄金钓点', '挂鱼饵中', '漂亮扬竿刺鱼！', '整装出海钓鱼', '放生积德归水', '钓到巨型大物', '静静抛竿入水', '愿者上钩发呆', '水边治愈时光', '满载而归大丰收！', '今天空军了（泪）', '今日钓鱼收竿'],
  '钓鱼/户外垂钓 ②': ['清晨开拔出发', '换个亮片拟饵', '死死盯住浮漂', '泄力疯狂作响！', '船上海鲜面巨香', '都市捕鱼达人', '海钓吹海风', '淡水溪流野钓', '今晚吃刺身！', '全都是小杂鱼', '小心摘鱼钩', '买渔具停不下', '悠闲垂钓治愈', '溜鱼手感无敌', '明天继续出钓'],
  '骑行/公路自行车 ①': ['破风骑行出发！', '保持稳定踏频', '成功征服爬坡！', '下坡注意安全', '巡航均速30+', '补给点便利店到', '安全骑行平安到', '上锁鞋就绪', '扎胎爆胎（崩溃）', '夜骑吹吹晚风', '绿道畅快骑行', '腿部引擎升级', '百公里骑行圆满！', '大腿酸爽炸裂', '今日骑行结束！'],
  '骑行/公路自行车 ②': ['骑友周末约车', '碳纤维轻量化', '换挡顺滑如丝', '御风前行穿梭', '洗车保养亮晶晶', '终点冲刺破风', '新骑行服帅气', '安全快乐骑车！', '水壶大口畅饮', '骑行打卡合影', '长途自驾骑行', '逆风骑行地狱', '挑战骑行路线', '铁屁股修炼中', '明天继续开踩！'],
  '高尔夫/下场挥杆 ①': ['好球漂亮！', '抓下一只小鸟！', '直奔一杆进洞', '完美击球！', '开球台准备', '出界OB了…', '不幸下水罚杆', '完美救出沙坑！', '感谢OK免推', '蹲下看推杆线', '保帕成功！', '一号木轰出200米', '刷新个人最好杆数', '会所中场休息', '今日下场结束！'],
  '高尔夫/下场挥杆 ②': ['清晨首组开球', '快乐高尔夫', '成功突破100杆！', '萌新球技进阶', '切杆精准上果岭', '晒晒高球新装备', '球叙小赌胜出！', '心态至上比赛', '约场室内模拟器', '调整挥杆动作', '清脆入洞落杯声', '阅读果岭坡度', '击球距离暴涨', '球场大片留念', '预约下次下场']
};

const ART_STYLE_PROMPT_MAP_KO = {
  '귀여운 2D 만화풍': '얇고 균일한 검정 외곽선, 플랫 컬러 채색에 부드러운 그라데이션 하이라이트, 둥글둥글한 형태 단순화',
  '한국 웹툰 스타일': '깔끔한 벡터 라인, 인물 위주의 셀셰이딩, 파스텔 계열 배색과 부드러운 그림자 처리',
  '손그림 낙서풍': '볼펜/색연필로 슥슥 그린 듯한 불규칙한 손떨림 선, 삐뚤빼뚤한 외곽선, 낙서장 여백에 그린 듯한 러프한 채색',
  '부드러운 수채화풍': '외곽선 최소화, 물감이 번진 듯한 그라데이션 채색, 종이 질감이 살짝 비치는 파스텔 톤',
  '색연필 동화책풍': '색연필 특유의 결이 보이는 채색, 부드러운 외곽선, 동화책 삽화 느낌의 따뜻한 색감',
  '레트로 애니메이션풍': '90년대 셀 애니메이션 느낌의 두꺼운 외곽선, 채도 높은 플랫 컬러, 살짝 거친 셀 텍스처',
  '깔끔한 미니멀 벡터': '극도로 단순화된 형태, 균일한 두께의 벡터 라인, 그림자 없는 플랫 컬러 2~3톤 배색',
  '통통 튀는 팝아트풍': '굵고 대담한 외곽선, 원색 위주의 고채도 배색, 망점(halftone) 패턴 강조',
  '굵은 선의 코믹북풍': '두꺼운 검정 잉크 외곽선, 강한 명암 대비, 망점 패턴 채색, 액션감 있는 선 표현',
  '도트 픽셀 아트풍': '정사각형 픽셀 단위 각진 형태, 안티에일리어싱 없는 계단 현상 윤곽선, 제한된 색상 팔레트(8~16색)',
  '종이 콜라주풍': '오려 붙인 종이 질감의 레이어드 형태, 살짝 어긋난 그림자, 손으로 자른 듯한 불규칙한 가장자리',
  '빈티지 인쇄 만화풍': '살짝 바랜 색감, 인쇄 도트 패턴, 종이 질감의 미세한 노이즈, 얇고 거친 외곽선',
  '흑백 만화 톤': '순수 흑백 잉크 드로잉, 스크린톤(회색 망점) 음영 처리, 외곽선 강조',
  '일본 출판 만화풍': '정교한 G펜 흑백 잉크선, 만화 컷 스크린톤 음영, 섬세한 해칭 음영, 흑백 출판 만화책 펜화 질감 (exquisite G-pen black ink manga lineart, screentone shading, monochrome comic panel style)',
  '3D 펠트/클레이 점토 인형풍': '부드러운 양모 펠트와 클레이 점토 질감, 스톱모션 애니메이션 입체 조형 (3D felt clay doll texture, stop-motion claymation aesthetic)',
  '크레파스 낙서풍': '따뜻하고 거친 크레용/크레파스 손그림 텍스처, 아기자기한 동화책 낙서 감성 (crayon wax pastel doodle texture, playful storybook sketch)',
  'Y2K 픽셀 스티커풍': '90년대 레트로 다이어리 꾸미기 스티커, 반짝이 글리터와 선명한 픽셀 그래픽 (Y2K retro glitter pixel art sticker)',
  '열혈 배틀 만화풍': '두껍고 역동적인 외곽선, 강한 속도선/집중선 배경 효과, 고대비 명암과 진한 그림자',
  '샤방샤방 순정만화풍': '가늘고 화려한 외곽선, 큰 눈과 반짝이는 하이라이트, 꽃/반짝임 배경 요소, 파스텔 그라데이션 채색',
  '8090 레트로 애니풍': '80~90년대 일본 애니 셀화 느낌, 채도 높은 플랫 컬러, 두꺼운 외곽선과 단순한 그림자 블록',
  '3D 반실사 애니 렌더링': '부드러운 3D 클레이/픽사풍 라이팅, 은은한 그림자와 하이라이트, 통통한 입체감 있는 형태',
};

const ART_STYLE_PROMPT_MAP_EN = {
  'Cute 2D cartoon': 'Thin uniform black outline, flat color with soft gradient highlights, rounded form simplification',
  'Korean webtoon style': 'Clean vector lines, character-focused cel shading, pastel color scheme with soft shadows',
  'Hand-drawn doodle': 'Irregular hand-drawn lines like ballpoint or colored pencil, shaky outlines, rough color fill like margin doodles',
  'Soft watercolor': 'Minimal outlines, water-bleed gradient coloring, pastel tones showing subtle paper texture',
  'Colored-pencil storybook': 'Visible colored-pencil stroke texture, soft outlines, warm tones like a storybook illustration',
  'Retro animation': 'Thick outlines like 90s cel animation, high-saturation flat colors, slightly grainy cel texture',
  'Clean minimal vector': 'Extremely simplified shapes, uniform vector lines, shadowless flat colors with 2-3 tone palette',
  'Vibrant pop art': 'Bold thick outlines, high-saturation primary colors, halftone dot pattern accents',
  'Bold comic-book style': 'Thick black ink outlines, strong contrast shading, halftone dot coloring, energetic action linework',
  'Pixel art': 'Blocky square pixel grid shapes, non-antialiased stepped outlines, limited 8-16 color palette',
  'Paper collage': 'Layered cut-paper texture, slightly offset drop shadows, irregular hand-cut edges',
  'Vintage print cartoon': 'Faded vintage colors, print dot matrix pattern, subtle paper noise texture, thin rough outlines',
  '📖 Monochrome Manga Screentone': 'Pure monochrome black ink drawing, screentone halftone shading, emphasized outlines',
  '💥 Shonen Battle Manga': 'Thick dynamic outlines, intense speed line & focus line background effects, high contrast with deep shadows',
  '🌸 Shojo Romance Manga': 'Delicate decorative outlines, big sparkling eyes with highlights, flower & sparkle background accents, pastel gradient coloring',
  '👾 Classic 80s Anime': '80s-90s Japanese anime cel aesthetic, high-saturation flat colors, thick outlines with simple shadow blocks',
  '🎨 3D Semi-realistic Animated Film': 'Soft 3D clay/Pixar-style studio lighting, subtle soft shadows and highlights, plump 3D volumetric forms',
};

const getExpandedArtStyleText = (selectedArtStyle, isKo = false) => {
  if (!selectedArtStyle) return '';
  const map = isKo ? ART_STYLE_PROMPT_MAP_KO : ART_STYLE_PROMPT_MAP_EN;
  const detail = map[selectedArtStyle];
  if (detail) {
    return `${selectedArtStyle} (${detail})`;
  }
  return selectedArtStyle;
};

const CHARACTER_TAGS_KO = {
  '🐱 동물': ['시바견', '치즈냥', '포메라니안', '아기 펭귄', '똥실똥실 토끼', '장난꾸러기 원숭이', '햄스터', '다람쥐', '아기 곰', '사막여우', '쿼카', '아기 오리', '판다', '고슴도치', '알파카', '아기 돼지', '느릿느릿 나무늘보', '아기 코끼리', '귀여운 수달', '아기 물개', '웰시코기', '카피바라', '삐약삐약 병아리', '너구리', '아기 사자', '뱁새 (오목눈이)', '참지않는 말티즈', '동글동글 비숑', '골든리트리버', '삼색 고양이', '턱시도 고양이', '하프물범', '레서판다'],
  '👦 인물': ['단발머리 소녀', '안경 쓴 모범생', '투블럭 남학생', '뽀글머리 아줌마', '수염 난 아저씨', '포니테일 체육생', '양갈래 소녀', '비니 쓴 힙스터', '젠틀한 신사', '사랑스러운 꼬마', '프로페셔널 커리어우먼', '온화한 백발 할머니', '지팡이 짚은 할아버지', '귀여운 유치원생', '선글라스 낀 래퍼', '카페 바리스타', '까까머리 군인', '헤드폰 낀 프로게이머', '근육질 헬스보이', '카메라 든 배낭여행객', '따뜻한 의사선생님', '정의로운 경찰관', '기타 치는 록스타', '스케이트보드 타는 소년', '화려한 K팝 아이돌', '푸근한 동네 아저씨', '유연한 필라테스 강사', '열정적인 건축가', '파리지앵 화가', '스피드 라이더', '화사한 꽃집 사장님', '열공 취업준비생', '피곤한 직장인', '달콤한 파티시에/제빵사', '만능 엔지니어/메카닉', '지혜로운 선비', '서부 카우보이', '카리스마 해적 선장', '화려한 마술사', '우아한 발레리나', '천하태평 백수', '괴짜 천재 과학자', '풋풋한 대학생 훈남', '우아한 공주님', '용맹한 기사', '열정 태권도 사범', '상냥한 항공 승무원', '카메라맨', '프로 등산러/산악인', '뉴스 아나운서', '공정한 판사', '용감한 소방관', '미슐랭 스타 셰프', '생기발랄 알바생', '부지런한 청년 농부', '순수한 숲속 소녀', '명랑한 중고등학생', '파도를 가르는 서퍼', '간절한 취업준비생', '신입사원', '영혼 털린 직장인', '초보 운전자', '헬창/운동 마니아'],
  '🦄 판타지/사물': ['유니콘', '아기 드래곤', '꼬마 마법사', '숲의 요정', '말랑말랑 모찌', '달콤한 마카롱', '딸기 케이크', '포동포동 만두', '꼬마 뱀파이어', '바다 인어공주', '용감한 꼬마 기사', '외계인', '아기 구미호', '귀여운 뿔 도깨비', '빛나는 천사', '장난꾸러기 아기 악마', '마법 양탄자', '솜사탕 구름', '신비로운 인어', '날개 달린 페가수스', '말하는 호박', '우주 비행사', '마법 빗자루', '젤리 괴물', '눈사람 요정'],
  '🤖 로봇/SF': ['아기 로봇', '사이버 냥이', '말랑 슬라임', '우주 햄스터', '아기 공룡', '픽셀 로봇', '꼬마 외계인', '메카 강아지', '네온 유령', '우주 비행 댕댕이', '사이버펑크 토끼', '홀로그램 유령', 'UFO 탄 외계인', '레트로 모니터봇', '미니 게임기봇', '배터리 충전봇', 'AI 안드로이드', '변신 메카 로봇'],
  '🍞 디저트/음식': ['말하는 붕어빵', '식빵 아저씨', '마카롱 토끼', '아메리카노 유령', '포동 만두 동자', '딸기 찹쌀떡', '초코칩 쿠키', '치즈 핫도그', '말랑 푸딩', '탕후루 요정', '말랑 떡볶이 떡', '삼각김밥 꼬마', '치즈 피자 조각', '바삭 감자튀김', '노릇 계란후라이', '보글보글 라면', '소프트 아이스크림', '쫀득 타코야끼', '달콤 컵케이크', '비엔나 소시지'],
  '🌿 식물/자연': ['아기 선인장', '네잎클로버 요정', '동글이 버섯', '화분 아기', '해바라기 꼬마', '새싹 요정', '아기 단풍잎', '방울 토마토', '말랑 아보카도', '달콤 복숭아 요정', '매운맛 아기 고추', '민들레 홀씨', '뽀송 목화솜', '상큼 레몬 꼬마', '눈물 흘리는 양파', '동글동글 도토리', '빨간 사과 요정', '가을 꿀밤송이'],
  '👀 외형/특징': ['둥근 얼굴형', '크고 반짝이는 눈', '통통한 볼살', '짧고 통통한 팔다리', '작고 동그란 코', '발그레한 볼', '복슬복슬한 털', '말랑한 젤리 몸', '길고 쫑긋한 귀', '작은 송곳니', '주근깨', '한쪽 눈을 덮는 앞머리', '동그란 안경', '풍성한 꼬리', '작은 날개', '별 모양 눈동자', '하트 모양 볼무늬', '미니 SD 체형'],
  '✨ 성격/감정': ['장난기 많은', '시크하고 도도한', '순둥순둥 착한', '늘 피곤에 찌든', '애교가 넘치는', '화가 많은', '느긋한', '눈물 많은', '활발한', '소심한', '엉뚱한', '다정한', '항상 배고픈', '호기심 가득한', '매사에 진지한', '허세 가득한', '사랑에 빠진', '자신감 넘치는', '덜렁거리는', '게으른 뒹굴뒹굴', '열정 만수르', '겁이 많은', '새침떼기', '의욕 상실한', '돈을 좋아하는'],
  '🖌️ 화풍': ['귀여운 2D 만화풍', '한국 웹툰 스타일', '손그림 낙서풍', '부드러운 수채화풍', '색연필 동화책풍', '레트로 애니메이션풍', '깔끔한 미니멀 벡터', '통통 튀는 팝아트풍', '굵은 선의 코믹북풍', '도트 픽셀 아트풍', '종이 콜라주풍', '빈티지 인쇄 만화풍', '흑백 만화 톤', '열혈 배틀 만화풍', '샤방샤방 순정만화풍', '8090 레트로 애니풍', '3D 반실사 애니 렌더링', '일본 출판 만화풍', '3D 펠트/클레이 점토 인형풍', '크레파스 낙서풍', 'Y2K 픽셀 스티커풍'],
  '👕 의상': ['의사 가운', '요리사 앞치마', '회사원 정장', '오버핏 후드티', '멜빵바지', '교복', '트레이닝복', '우비', '포근한 잠옷', '마법사 망토', '화려한 드레스', '스포티한 캡모자', '두꺼운 패딩', '가죽 자켓', '단정한 셔츠와 넥타이', '화사한 꽃무늬 원피스', '힙한 스트릿 패션', '전통 무술 도복', '따뜻한 니트 스웨터', '귀여운 동물 잠옷', '우주복', '탐험가 조끼와 모자', '수영복과 튜브', '클래식한 트렌치코트', '반짝이는 요정 날개', '왕관과 망토', '청바지와 흰 티', '명탐정 코트와 모자'],
  '🎒 소품/동작': ['스마트폰을 든', '커피잔을 든', '선글라스를 낀', '헤드폰을 낀', '노트북을 하는', '책을 읽는', '풍선을 든', '꽃다발을 안고 있는', '마이크를 잡고 노래하는', '게임패드를 쥐고 있는', '프라이팬을 들고 있는', '커다란 돋보기를 든', '스케치북에 그림 그리는', '마법 지팡이를 휘두르는', '장바구니를 들고 있는', '우산을 쓰고 있는', '팝콘을 먹고 있는', '청소기를 돌리는', '망원경으로 엿보는', '요가 매트에서 스트레칭하는', '스마트워치를 확인하는', '돈다발을 쥐고 있는', '아이스 아메리카노 텀블러를 든', '노트북을 두드리는', '치킨 닭다리를 뜯는', '소주/맥주잔을 부딪치는', '수액 링거 맞고 있는'],
  '🌏 글로벌/전통 문화': ['우아한 전통 궁중 한복 룩', '갓과 두루마기 모던 한복 룩', '화려한 K-POP 아이돌 의상', '태권도 검은띠 무도복', '전통 기모노 / 유카타', '아키하바라 메이드 코스프레', '사무라이 하카마 & 닌자 의상', '일본 청춘 세일러복 교복', '신사 무녀(미코) 의상', '신비로운 무협/선협 검객 도포', '화려한 전통 치파오 / 한푸', '이소룡풍 노란 트레이닝 무술복', '경극 가면 배우', '와일드 웨스트 카우보이', '런던 신사 트렌치코트 & 중절모', '사이버펑크 네온 스트릿웨어', '중세 유럽 기사 갑옷', '베레모와 바게트 든 파리지앵', '영국 왕실 근위병 (베어스킨 모자)', '스페인 플라멩코 무용수', '독일 옥토버페스트 레더호젠', '베네치아 가면무도회 귀족', '멕시코 마리아치 & 솜브레로', '망자의 날 슈가 스컬 분장', '브라질 삼바 카니발 댄서', '베트남 아오자이 & 논라 삿갓', '태국 전통 사바이 의상', '인도 전통 사리와 보석 (볼리우드)', '아라비안 나이트 터번 & 요술램프', '하와이안 알로하 셔츠 & 우쿨렐레'],
  '🎬 영화/애니메이션': ['마법학교 기숙사 교복과 지팡이', '선글라스와 블랙 수트 비밀요원', '빛나는 네온 블레이드 우주 기사', '별빛 요술봉을 든 변신 마법소녀', '가죽 모자와 채찍을 든 고고학 탐험가', '삼각모자와 깃털 장식 해적 선장', '펄럭이는 빨간 망토 슈퍼히어로', '어둠의 카리스마 다크 히어로', '가죽자켓과 선글라스 바이커 라이더', '지브리풍 비행사 모자와 고글', '숲속의 거대 잎사귀 정령', '트렌치코트와 돋보기 든 클래식 명탐정', '우주 헬멧을 쓴 성간 탐사선 비행사', '판초를 두른 서부 무법자 총잡이', '반쪽 하얀 가면의 오페라 유령', '드래곤을 길들이는 바이킹 전사', '시간여행 타임트래블러', '디스토피아 좀비 아포칼립스 생존자'],
  '💼 직장인/오피스': ['칼퇴 10초 전 시계 쳐다보는', '야근에 찌든 다크서클', '월급날 통장 보고 감격 눈물', '회의실에서 영혼 가출 멍때리기', '사직서 품에 살포시 안은', '커피 3잔 연속 수혈하기', '모니터 뒤에 몰래 숨은', '결재 서류 들고 눈치 보는', '출근길 만원 지하철 끼인', '점심 메뉴 고르며 행복해하는', '금요일 퇴근 발걸음 경쾌한', '월요병으로 침대와 한 몸'],
  '🎮 게임/E스포츠': ['RGB 게이밍 헤드셋 낀', '키보드 샷건 치며 분노', '랭크 승급하고 폭죽 터뜨리는', '트롤 팀원 보고 뒷목 잡는', '에너지 드링크 마시며 밤샘', 'VR 고글 쓰고 허공 휘젓는', '컨트롤러 쥐고 초집중 눈빛', '치킨이닭 1등 승리 세리머니', '와이파이 끊겨서 절망하는', '보스 레이드 파티 모집하는', '가챠 뽑기 대성공 환호', '가챠 폭망하고 바닥에 엎드림'],
  '💘 연애/커플': ['시밀러룩 맞춰 입은', '손잡고 꽁냥꽁냥 걷는', '삐져서 볼 부풀리고 등 돌린', '보고 싶어서 영상통화 캡처', '하트 뿅뿅 쿠션 껴안은', '꽃다발 뒤에 얼굴 숨긴', '기념일 케이크 촛불 후 부는', '어깨에 기대어 꿀잠 자는', '손하트 발사하며 애교 부리기', '연락 기다리며 스마트폰 멍하니 보기', '영화관에서 팝콘 같이 집다가 손 닿은', '비 오는 날 우산 기울여 씌워주는'],
  '💪 헬스/다이어트': ['프로틴 쉐이커 쉑쉑 흔드는', '무거운 덤벨 번쩍 든', '인바디 체지방률 보고 충격', '샐러드 씹으며 치킨 상상하기', '러닝머신 위에서 땀 뻘뻘', '체중계 올라가고 좌절 눈물', '오운완 거울 셀카 찰칵', '스쿼트 하다가 다리 후들거리는', '스트레칭 폼롤러 위에서 비명', '물 2리터 벌컥벌컥 마시는', '근육 펌핑 거울 보며 흐뭇', '치팅데이 피자 버거 폭풍 흡입'],
  '🌈 배경/효과': ['반짝반짝 빛나는 효과', '하트 뿅뿅 날리는', '별빛이 내리는', '네온사인 번쩍이는', '만화적인 집중선', '벚꽃이 흩날리는', '불타오르는 이펙트', '땀방울이 튀는', '우울한 먹구름', '무지개빛 아우라', '펑 터지는 폭발', '어두운 그림자', '스포트라이트 조명', '눈보라가 치는', '번개가 치는', '뽀글뽀글 거품', '따뜻한 햇살', '음표가 떠다니는', '바람에 흩날리는', '물음표 둥둥 (?)', '느낌표 번쩍 (!)', '부들부들 떨림선', '충격 먹구름', '하트 눈빛 (반짝)']
};

const CHARACTER_TAGS_EN = {
  '🐱 Animal': ['Shiba Inu', 'Orange Tabby Cat', 'Pomeranian', 'Baby Penguin', 'Chubby Bunny', 'Mischievous Monkey', 'Hamster', 'Squirrel', 'Baby Bear', 'Fennec Fox', 'Quokka', 'Baby Duck', 'Panda', 'Hedgehog', 'Alpaca', 'Piglet', 'Lazy Sloth', 'Baby Elephant', 'Cute Otter', 'Baby Seal', 'Welsh Corgi', 'Capybara', 'Baby Chick', 'Raccoon', 'Baby lion', 'Korean crow tit (Baepsae)', 'Feisty Maltese', 'Fluffy Bichon Frise', 'Golden Retriever', 'Calico cat', 'Tuxedo cat', 'Harp seal pup', 'Red panda'],
  '👦 Person': ['Bob cut girl', 'Nerdy student with glasses', 'Two-block cut boy', 'Permed middle-aged woman', 'Bearded uncle', 'Ponytail athlete', 'Pigtail girl', 'Beanie hipster', 'Gentleman in suit', 'Child in Hanbok', 'Career woman in suit', 'Gentle white-haired grandmother', 'Grandfather with cane', 'Yellow hat preschooler', 'Rapper with shades', 'Barista with apron', 'Buzz cut soldier', 'Pro gamer with headset', 'Muscular gym bro', 'Backpacker with camera', 'Doctor in white coat', 'Courageous police officer', 'Rock star playing guitar', 'Skater boy', 'Glamorous K-Pop idol', 'Friendly neighborhood guy', 'Yoga instructor', 'Architect in hard hat', 'Parisian artist', 'Biker rider', 'Florist shop owner', 'Job seeker with backpack', 'Tired office worker', 'Baker in apron', 'Skillful mechanic', 'Scholar in traditional robe', 'Cowboy hat rancher', 'Pirate captain with eyepatch', 'Glamorous magician', 'Ballerina in tutu', 'Slacker in tracksuit', 'Scientist in lab coat', 'Handsome guy in tee and jeans', 'Princess in ballgown', 'Knight in shining armor', 'Taekwondo master', 'Flight attendant in uniform', 'Cameraman', 'Hiker in mountain gear', 'Announcer with microphone', 'Judge in legal robe', 'Firefighter in gear', 'Chef in toque', 'Part-timer in cap', 'Farmer in straw hat', 'Forest maiden in flower crown', 'Student eating tteokbokki', 'Surfer with surfboard', 'Hair roller job seeker', 'Rookie employee', 'Burnout office worker', 'Student beginner driver', 'Gym fitness enthusiast'],
  '🦄 Fantasy/Object': ['Unicorn', 'Baby dragon', 'Tiny wizard', 'Forest fairy', 'Soft mochi', 'Sweet macaron', 'Strawberry shortcake', 'Tiny Jelly Candy', 'Little vampire', 'Mermaid princess', 'Brave young knight', 'Alien buddy', 'Baby nine-tailed fox', 'Cute horned goblin', 'Shining angel', 'Mischievous little devil', 'Flying magic carpet', 'Cotton candy cloud', 'Mystical mermaid', 'Winged Pegasus', 'Talking pumpkin', 'Astronaut', 'Magic broomstick', 'Jelly monster', 'Snowman fairy'],
  '🤖 Robot/Sci-Fi': ['Baby robot', 'Cyber kitty', 'Jelly slime', 'Space hamster', 'Baby dino', 'Pixel bot', 'Tiny alien', 'Mecha pup', 'Neon ghost', 'Space dog astronaut', 'Cyberpunk bunny', 'Hologram ghost', 'UFO pilot alien', 'Retro monitor bot', 'Handheld game bot', 'Battery charging bot', 'AI android fairy', 'Transforming mecha'],
  '🍞 Dessert/Food': ['Talking fish pastry', 'Toast bread guy', 'Macaron bunny', 'Iced coffee ghost', 'Chubby dumpling', 'Strawberry mochi', 'Choco chip cookie', 'Cheese corn dog', 'Custard pudding', 'Tanghulu fairy', 'Chewy rice cake', 'Onigiri rice ball', 'Cheesy pizza slice', 'Crispy fries', 'Sunny-side up egg', 'Ramen noodles', 'Soft serve ice cream', 'Chewy takoyaki', 'Sweet cupcake', 'Vienna sausage'],
  '🌿 Plant/Nature': ['Baby cactus', 'Four-leaf clover fairy', 'Round mushroom', 'Plant pot baby', 'Sunflower buddy', 'Sprout fairy', 'Maple leaf', 'Cherry tomato', 'Cute avocado', 'Sweet peach fairy', 'Spicy chili baby', 'Dandelion fluff', 'Fluffy cotton fairy', 'Fresh lemon buddy', 'Crying onion', 'Cute acorn', 'Red apple fairy', 'Autumn chestnut'],
  '👀 Appearance': ['Round face shape', 'Large sparkling eyes', 'Chubby cheeks', 'Short chubby limbs', 'Small round nose', 'Rosy blushed cheeks', 'Fluffy soft fur', 'Soft squishy jelly body', 'Long perky ears', 'Tiny fangs', 'Cute freckles', 'Bangs covering one eye', 'Round glasses', 'Fluffy voluminous tail', 'Tiny fairy wings', 'Star-shaped pupils', 'Heart cheek pattern', 'Mini chibi SD body'],
  '✨ Trait/Emotion': ['Playful and cheeky', 'Chic and aloof', 'Gentle and kind', 'Perpetually exhausted', 'Full of cute charm', 'Hot-tempered', 'Laid-back and easygoing', 'Crybaby', 'Energetic and lively', 'Timid and shy', 'Goofy and quirky', 'Warm and sweet', 'Always hungry', 'Curious and inquisitive', 'Deadly serious', 'Pompous and showy', 'Deeply in love', 'Full of confidence', 'Clumsy butterfingers', 'Lazy couch potato', 'Overflowing with passion', 'Timid scaredy-cat', 'Prudish and sassy', 'Completely unmotivated', 'Money lover'],
  '🖌️ Art Style': ['Cute 2D cartoon', 'Korean webtoon style', 'Hand-drawn doodle', 'Soft watercolor', 'Colored pencil storybook', 'Retro animation', 'Clean minimal vector', 'Vibrant pop art', 'Bold line comic book', 'Pixel art retro dot', 'Paper collage style', 'Vintage print comic', 'Monochrome manga tone', 'Hot-blooded battle manga', 'Sparkling shojo manga', '80s-90s retro anime', '3D Semi-realistic anime rendering', 'Japanese Manga Ink & Tone Style', '3D Felt & Claymation Doll Style', 'Crayon Wax Pastel Doodle Style', 'Y2K Retro Glitter Pixel Sticker Style'],
  '👕 Outfit': ['Doctor coat', 'Chef apron', 'Business suit', 'Oversized hoodie', 'Overalls', 'School uniform', 'Tracksuit', 'Raincoat', 'Cozy pajamas', 'Wizard cape', 'Glamorous ballgown', 'Sporty baseball cap', 'Puffer jacket', 'Leather jacket', 'Shirt and tie', 'Floral dress', 'Hip streetwear', 'Martial arts uniform', 'Warm knit sweater', 'Animal onesie', 'Spacesuit', 'Explorer vest and hat', 'Swimwear and tube', 'Classic trench coat', 'Glittering fairy wings', 'Crown and royal cape', 'T-shirt and jeans', 'Detective coat and hat'],
  '🎒 Prop/Action': ['Holding smartphone', 'Holding coffee cup', 'Wearing sunglasses', 'Wearing headphones', 'Working on laptop', 'Reading a book', 'Holding a balloon', 'Holding flower bouquet', 'Singing into microphone', 'Holding game controller', 'Holding frying pan', 'Holding large magnifying glass', 'Drawing in sketchbook', 'Waving magic wand', 'Holding grocery basket', 'Holding an umbrella', 'Eating popcorn', 'Vacuuming floor', 'Peeking through binoculars', 'Stretching on yoga mat', 'Checking smartwatch', 'Holding stacks of cash', 'Holding iced Americano tumbler', 'Typing on laptop', 'Eating fried chicken drumstick', 'Clinking beer/soju glasses', 'Getting IV drip while exhausted'],
  '🌏 World Cultures': ['Traditional Hanbok Korean robe', 'Modern hip Hanbok with Gat hat', 'K-Pop idol stage outfit', 'Taekwondo Dobok martial uniform', 'Traditional Japanese Kimono / Yukata', 'Akihabara Maid cafe cosplay', 'Samurai swordsman / Ninja gear', 'Japanese sailor school uniform', 'Shrine maiden Miko robe', 'Wuxia martial arts silk robe', 'Traditional Cheongsam / Hanfu dress', 'Kung Fu martial artist yellow suit', 'Beijing opera mask performer', 'Wild West cowboy sheriff', 'London gentleman trench coat & fedora', 'Cyberpunk neon streetwear', 'Medieval knight armor & cape', 'Parisian with beret and baguette', 'British royal guard with bearskin cap', 'Spanish Flamenco dancer with rose', 'German Oktoberfest Lederhosen', 'Venetian masquerade noble outfit', 'Mexican Mariachi with Sombrero', 'Day of the Dead sugar skull', 'Brazilian Samba carnival dancer', 'Vietnamese Ao Dai & Non La hat', 'Traditional Thai Sabai silk dress', 'Indian Bollywood silk Saree', 'Arabian Nights turban & magic lamp', 'Hawaiian Aloha shirt & Ukulele'],
  '🎬 Cinema & Anime': ['Wizard school uniform & magic wand', 'Secret agent in black suit & shades', 'Space knight with neon energy blade', 'Magical girl with starlight wand', 'Archaeologist explorer with fedora & whip', 'Pirate captain with tricorn hat & feather', 'Superhero with flowing red cape', 'Dark charismatic masked hero', 'Biker in leather jacket & sunglasses', 'Ghibli-style aviator cap & goggles', 'Giant forest spirit holding a leaf', 'Classic detective with trench coat & magnifying glass', 'Interstellar astronaut with space helmet', 'Western outlaw gunslinger wearing poncho', 'Phantom with half white mask', 'Viking warrior dragon tamer', 'Time traveler with retro goggles', 'Zombie apocalypse survivor'],
  '💼 Office & Work': ['Watching clock 10s before clock-out', 'Dark circles from overtime work', 'Tears of joy on payday', 'Soul leaving body during meetings', 'Holding resignation letter in pocket', 'Drinking 3 cups of coffee in a row', 'Hiding behind computer monitor', 'Checking boss mood with approval folder', 'Squished in crowded morning subway', 'Happy while picking lunch menu', 'Bouncy joyful Friday clock-out walk', 'Glued to bed with Monday blues'],
  '🎮 Gaming & Esports': ['Wearing RGB gaming headset', 'Raging and smashing keyboard', 'Confetti celebration on rank up', 'Holding neck in rage at troll teammates', 'All-nighter with energy drinks', 'Swinging arms in VR goggles', 'Laser focus holding controller', 'Winner winner chicken dinner ceremony', 'Despair when Wi-Fi disconnects', 'Recruiting for boss raid party', 'Cheering on gacha jackpot pull', 'Face down crying after failed gacha'],
  '💘 Romance & Couples': ['Wearing matching couple outfits', 'Holding hands walking sweetly', 'Pouting with puffed cheeks facing away', 'Taking screenshot on video call', 'Hugging glowing heart cushion', 'Hiding face behind flower bouquet', 'Blowing out anniversary cake candle', 'Sleeping sweetly on shoulder', 'Sending finger heart aegyo', 'Staring at phone waiting for text', 'Touching hands over cinema popcorn', 'Tilting umbrella to share in rain'],
  '💪 Fitness & Diet': ['Shaking protein shaker bottle', 'Lifting heavy dumbbell with pride', 'Shocked looking at InBody body fat scan', 'Chewing salad dreaming of fried chicken', 'Sweating profusely on treadmill', 'Crying in despair on weighing scale', 'Snapping gym mirror selfie (OOTD)', 'Legs shaking after heavy squats', 'Screaming on foam roller stretch', 'Gulping down 2L water bottle', 'Smiling admiring muscle pump in mirror', 'Devouring pizza and burgers on cheat day'],
  '🌈 Effect/BG': ['Sparkling glittering effect', 'Hearts fluttering around', 'Starlight falling', 'Neon signs blinking', 'Comic action speed lines', 'Cherry blossom petals swirling', 'Blazing fire effect', 'Sweat drops splashing', 'Gloomy rain cloud', 'Rainbow aura', 'Boom explosion', 'Dark ominous shadow', 'Spotlight illumination', 'Blizzard snowstorm', 'Lightning flash', 'Bubbles floating', 'Warm gentle sunshine', 'Musical notes floating', 'Blowing in the wind', 'Floating question marks (?)', 'Sparking exclamation mark (!)', 'Shivering tremble lines', 'Shock dark cloud', 'Heart sparkle eyes']
};

const CHARACTER_TAGS_JA = {
  '🐱 動物': ['柴犬', '茶トラ猫', 'ポメラニアン', '赤ちゃんペンギン', 'まんまるウサギ', 'いたずら子猿', 'ハムスター', 'リス', '子グマ', 'フェネック', 'クアッカワラビー', '赤ちゃんアヒル', 'パンダ', 'ハリネズミ', 'アルパカ', '子ブタ', 'のんびりナマケモノ', '子象', 'かわいいカワウソ', '赤ちゃんアザラシ', 'コーギー', 'カピバラ', 'ひよこ', 'アライグマ', '赤ちゃんライオン', 'シマエナガ（ダルマエナガ）', '強気なマルチーズ', 'ふわもこビション・フリーゼ', 'ゴールデンレトリバー', '三毛猫', 'タキシード猫', 'タテゴトアザラシの赤ちゃん', 'レッサーパンダ'],
  '👦 人物': ['ボブヘアの少女', 'メガネの優等生', 'ツーブロックの男子', 'パーマ頭のおばちゃん', 'ヒゲのおじさん', 'ポニーテールの体育会系', 'ツインテールの少女', 'ビーニーのヒップスター', 'スーツの紳士', '韓服を着た子供', 'スーツのキャリアウーマン', '優しい白髪のおばあちゃん', '杖をついたおじいちゃん', 'かわいい幼稚園児', 'サングラスのラッパー', 'エプロンのバリスタ', '丸刈りの軍人', 'ヘッドホンのプロゲーマー', 'マッチョなジム男子', 'カメラを持ったバックパッカー', '白衣の医師', '制服の警察官', 'ギターを弾くロックスター', 'スケボー少年', '華やかなK-POPアイドル', '気さくな近所のおじさん', 'ヨガインストラクター', 'ヘルメットの建築家', 'パリの画家', 'スピードライダー', '花屋の店長', 'バッグを背負った就活生', '疲れた会社員', 'エプロンのパン職人', '作業着の整備士', '伝統衣装の学者', 'カウボーイハットの牧童', '眼帯の海賊船長', '華やかなマジシャン', 'チュチュを着たダンサー', 'ジャージ姿のニート', '白衣の研究者', 'デニムに白Tの爽やか男子', '優雅なお姫様', '甲冑を着た騎士', '熱血テコンドー師範', '制服のスチュワーデス', 'カメラマン', '登山服の登山家', 'マイクを持つアナウンサー', '法服の裁判官', '防火服の消防士', 'コック帽のシェフ', 'キャップ帽のバイト', '麦わら帽子の農夫', '花冠の森の少女', '制服でトッポッキを食べる学生', '波乗りサーファー', 'カーラーを巻いた就活生', '新入社員', '魂が抜けた会社員', '初心者ドライバー', '筋トレ・フィットネスマニア'],
  '🦄 ファンタジー/モノ': ['ユニコーン', '赤ちゃんドラゴン', '小さな魔法使い', '森の妖精', 'もちもちお餅', '甘いマカロン', 'イチゴケーキ', 'ぷくぷく餃子', '小さな吸血鬼', '海の人魚姫', '勇敢な見習い騎士', '宇宙人', '九尾の狐', 'かわいい小鬼', '輝く天使', 'いたずら小悪魔', '空飛ぶ魔法の絨毯', '綿菓子雲', '神秘的な人魚', '翼のあるペガサス', 'おしゃべりカボチャ', '宇宙飛行士', '魔法のほうき', 'ゼリーモンスター', '雪だるまの妖精'],
  '🤖 ロボット/SF': ['赤ちゃんロボット', 'サイバーにゃんこ', 'ぷにぷにスライム', '宇宙ハムスター', '赤ちゃん恐竜', 'ピクセルロボ', '小さなエイリアン', 'メカわんこ', 'ネオンおばけ', '宇宙飛行わんこ', 'サイバーパンクうさぎ', 'ホログラムゴースト', 'UFOパイロット', 'レトロモニターロボ', 'ミニゲーム機キャラ', 'バッテリー充電ロボ', 'AIアンドロイド', '変形メカロボット'],
  '🍞 デザート/フード': ['おしゃべりたい焼き', '食パンおじさん', 'マカロンうさぎ', 'アイスコーヒーおばけ', 'ぷくぷく餃子坊や', 'いちご大福', 'チョコチップクッキー', 'チーズハットグ', 'ぷるぷるプリン', 'タンフルー妖精', 'もちもちトッポッキ', 'おにぎり坊や', 'とろ〜りピザ', 'サクサクポテト', '目玉焼きちゃん', 'ほかほかラーメン', 'ソフトクリーム', 'たこ焼きくん', 'カップケーキ', 'タコさんウインナー'],
  '🌿 植物/自然': ['赤ちゃんサボテン', '四つ葉のクローバー妖精', 'ころころキノコ', '植木鉢の赤ちゃん', 'ひまわりちゃん', '新芽の妖精', 'もみじちゃん', 'プチトマト', 'アボカドちゃん', 'もも妖精', '激辛とうがらしちゃん', 'たんぽぽの綿毛', 'ふわふわコットン', 'レモン坊や', '泣き虫たまねぎ', 'ころころどんぐり', '赤りんご妖精', '秋のくり坊'],
  '👀 外見/特徴': ['丸顔', '大きくてキラキラした目', 'ぷっくりした頬', '短くて太い手足', '小さくて丸い鼻', 'ほんのり赤らんだ頬', 'もふもふの毛並み', 'ぷにぷにゼリー体型', '長くてぴんと立った耳', '小さな八重歯', 'そばかす', '片目を隠す前髪', '丸メガネ', 'ふさふさのしっぽ', '小さな羽', '星形の瞳', 'ハート型の頬模様', 'ミニSD体型'],
  '✨ 性格/感情': ['いたずら好き', 'ツンデレ・クール', 'おっとり優しい', 'いつもお疲れモード', '愛嬌たっぷり', '怒りっぽい', 'のんびり屋', '泣き虫', '活発・元気', '人見知り・内気', '天然・マイペース', '思いやりがある', 'いつも腹ペコ', '好奇心旺盛', '何事にも真面目', '見栄っ張り', '恋してる', '自信満々', 'おっちょこちょい', 'ぐうたら・ゴロゴロ', '情熱的・やる気満々', '怖がり・ビビリ', 'おすまし・気取り屋', 'やる気ゼロ', 'お金大好き'],
  '🖌️ 画風': ['かわいい2Dアニメ風', '韓国ウェブトゥーン風', '手描き落書き風', 'やわらか水彩画風', '色鉛筆絵本風', 'レトロアニメ風', 'すっきりミニマルベクター', 'ポップアート風', '太線のコミック風', 'ドット絵ピクセルアート', 'ペーパーコラージュ風', 'ヴィンテージ印刷風', 'モノクロ漫画トーン', '熱血バトル漫画風', 'きらきら少女漫画風', '80-90年代レトロアニメ風', '3Dセミリアルアニメレンダリング', '日本の出版マンガ風（Gペン・スクリーントーン）', '3Dフェルト・粘土クレイ人形風', 'クレヨン落書きパステル風', 'Y2Kレトロキラキラピクセル風'],
  '👕 衣装': ['白衣', 'コックエプロン', 'ビジネススーツ', 'オーバーサイズパーカー', 'オーバーオール', '制服', 'ジャージ', 'レインコート', 'もこもこパジャマ', '魔法使いのマント', '華やかなドレス', 'スポーティなキャップ', 'ダウンジャケット', 'レザージャケット', 'シャツとネクタイ', '花柄ワンピース', 'ストリート系ファッション', '伝統武術の道着', 'あったかニットセーター', '動物の着ぐるみパジャマ', '宇宙服', '探検家のベストと帽子', '水着と浮き輪', 'トレンチコート', '妖精の羽', '王冠とマント', 'デニムと白T', '名探偵のコートと帽子'],
  '🎒 小道具/動作': ['スマホを持つ', 'コーヒーカップを持つ', 'サングラスをかける', 'ヘッドホンをつける', 'ノートパソコンを操作する', '本を読む', '風船を持つ', '花束を抱える', 'マイクで歌う', 'ゲームコントローラーを握る', 'フライパンを持つ', '大きな虫眼鏡を持つ', 'スケッチブックに絵を描く', '魔法の杖を振る', '買い物かごを持つ', '傘を差す', 'ポップコーンを食べる', '掃除機をかける', '望遠鏡を覗く', 'ヨガマットでストレッチする', 'スマートウォッチを見る', '札束を握っている', 'アイスコーヒーのタンブラーを持つ', 'ノートパソコンをカタカタ打つ', 'フライドチキンをかじる', 'ビール・お酒のグラスで乾杯', '点滴を打ってぐったり'],
  '🌏 世界の文化・伝統': ['伝統的な韓服（ハンボク）', 'モダンなヒップホップ韓服', 'K-POPアイドルステージ衣装', 'テコンドー黒帯道着', '伝統的な着物・浴衣', '秋葉原メイドコスプレ', '侍（サムライ）・忍者装束', '日本のセーラー服・学生服', '神社巫女（みこ）装束', '武侠・仙侠のシルク道袍', '華やかなチャイナドレス・漢服', 'カンフー武術家（黄色の道着）', '京劇の仮面役者', '西部劇カウボーイ・保安官', 'ロンドン紳士トレンチコート', 'サイバーパンクネオンストリート', '中世ヨーロッパ騎士の甲冑', 'パリジャンのベレー帽とバゲット', 'イギリス王室近衛兵（毛皮帽子）', 'スペイン情熱のフラメンコダンサー', 'ドイツのオクトーバーフェスト衣装', 'ベネチア仮面舞踏会衣装', 'メキシカンマリアッチ＆ソンブレロ', '死者の日シュガースカル仮装', 'ブラジルサンバカーニバルダンサー', 'ベトナムアオザイ＆ノンラー笠', 'タイ伝統サバイ衣装', 'インド伝統サリー＆ボリウッド', 'アラビアンナイトのターバン＆魔法のランプ', 'ハワイアンアロハシャツ＆ウクレレ'],
  '🎬 映画・アニメ': ['魔法学校の制服と魔法の杖', '黒スーツとサングラスの秘密諜報員', 'ネオン光剣を持つ宇宙騎士', '星のステッキを持つ変身魔法少女', '革帽子とムチを持つ考古学者探検家', '三角帽子の海賊船長', '赤いマントのスーパーヒーロー', '漆黒のダークヒーロー', '革ジャンとサングラスのバイカー', '飛行士の帽子とゴーグル', '森の巨大な葉っぱの精霊', 'トレンチコートと虫眼鏡の名探偵', '宇宙ヘルメットをかぶった宇宙飛行士', 'ポンチョを着た西部劇のガンマン', '半面の白い仮面をつけた貴族', 'ドラゴン使いのバイキング戦士', 'タイムトラベラー', 'ゾンビアポカリプスの生存者'],
  '💼 会社員・オフィス': ['定時退社10秒前に時計を見る', '残業で目の下のクマがやばい', '給料日に通帳を見て感動の涙', '会議中に魂が抜けて放心状態', '退職届を胸に忍ばせる', 'コーヒー3杯一気飲み', 'モニターの陰に隠れる', '決裁書類を持って顔色を伺う', '満員電車に押しつぶされる', 'ランチメニュー選びで幸せ', '金曜の退勤で足取りが軽い', '月曜病でベッドと一体化'],
  '🎮 ゲーム・eスポーツ': ['RGBゲーミングヘッドセット装着', 'キーボード台パンでブチギレ', 'ランク昇格で紙吹雪クラッカー', 'トロール味方に頭を抱える', 'エナジードリンクで徹夜ゲーム', 'VRゴーグルで虚空を振り回す', 'コントローラー握り超集中', '1位ドン勝ビクトリーセレモニー', 'Wi-Fi切断で絶望する', 'ボス討伐レイドパーティ募集', 'ガチャ大当たりで大歓喜', 'ガチャ爆死で床に崩れ落ちる'],
  '💘 恋愛・カップル': ['ペアルックでお揃いコーデ', '手を繋いでイチャイチャ散歩', 'すねてほっぺを膨らませ背を向ける', '会いたくてビデオ通話スクショ', 'ハートクッションをぎゅっと抱きしめる', '花束の後ろに顔を隠す', '記念日ケーキのロウソクを吹き消す', '肩にもたれかかってぐっすり眠る', '指ハート発射で甘える', '返信を待ちながらスマホをぼんやり見つめる', '映画館でポップコーンを取り合い手が触れる', '雨の日に傘を傾けて入れてあげる'],
  '💪 フィットネス・筋トレ': ['プロテインシェイカーをシャカシャカ振る', '重いダンベルを力強く持ち上げる', '体組成計の体脂肪率を見て大ショック', 'サラダを食べながらチキンを妄想', 'ランニングマシンで汗だく', '体重計に乗って絶望の涙', 'ジムの鏡で筋トレ自撮りパシャリ', 'スクワットで足がプルプル震える', 'フォームローラーの上で悲鳴', '水2リットルを一気飲み', '筋肉のパンプアップを見て満足気', 'チートデイにピザとバーガーを爆食い'],
  '🌈 エフェクト/背景': ['キラキラ光るエフェクト', 'ハートが飛び交う', '星が降る', 'ネオンサインが瞬く', '漫画的な集中線', '桜吹雪が舞う', '燃え上がる炎エフェクト', '汗が飛び散る', '憂鬱な暗雲', '虹色のオーラ', 'ドカンと爆発', '不気味な影', 'スポットライト照明', '吹雪が吹き荒れる', '雷が鳴り響く', 'ぷくぷく泡', '温かい日差し', '音符が漂う', '風に舞う', 'ふわふわ浮かぶはてな（？）', 'キラリと光るびっくりマーク（！）', 'ブルブル震える効果線', 'ショックの暗雲', '目がハート（キラキラ）']
};

const CHARACTER_TAGS_ZH = {
  '🐱 动物': ['柴犬', '橘猫', '博美犬', '小企鹅', '圆滚滚小兔', '淘气小猴', '仓鼠', '松鼠', '小熊', '耳廓狐', '短尾矮袋鼠', '小鸭子', '大熊猫', '刺猬', '羊驼', '小猪', '树懒', '小象', '水獭', '海豹', '柯基', '水豚', '小鸡', '浣熊', '小狮子', '银喉长尾山雀（肥啾）', '脾气火爆马尔济斯', '圆滚滚比熊犬', '金毛寻回犬', '三花猫', '奶牛猫（燕尾服猫）', '海豹宝宝', '小熊猫'],
  '👦 人物': ['短发少女', '戴眼镜的学霸', '寸头男生', '卷发大妈', '胡子大叔', '马尾体育生', '双马尾少女', '冷帽潮人', '西装绅士', '穿韩服的小朋友', '职场女强人', '慈祥的白发奶奶', '拄拐杖的爷爷', '小黄帽幼儿园生', '戴墨镜的Rapper', '咖啡馆咖啡师', '寸头士兵', '戴耳机的职业选手', '肌肉健身男', '带单反的背包客', '穿白大褂的医生', '穿制服的警察', '弹吉他的摇滚乐手', '滑板少年', '华丽K-POP爱豆', '热心邻居大叔', '瑜伽教练', '戴安全帽的建筑师', '巴黎画家', '机车骑手', '花店老板', '背书包的求职生', '疲惫打工人', '系围裙的面包师', '工装机修师', '传统学者', '牛仔帽牧童', '戴眼罩的海盗船长', '魔术师', '芭蕾舞者', '运动服无业青年', '穿白大褂的科学家', '白T牛仔裤帅哥', '穿礼服的小公主', '穿铠甲的骑士', '穿道服的跆拳道教练', '穿制服的空姐', '摄影师', '穿冲锋衣的登山客', '拿话筒的主持人', '穿法袍的法官', '穿防护服的消防员', '戴厨师帽的主厨', '戴棒球帽的店员', '草帽农夫', '戴花环的森林少女', '穿校服吃年糕的学生', '拿冲浪板的冲浪者', '戴卷发筒的求职生', '职场新人', '灵魂出窍打工人', '新手司机', '健身肌肉达人'],
  '🦄 幻想/物品': ['独角兽', '小飞龙', '小魔法师', '森林精灵', '软糯麻薯', '甜美马卡龙', '草莓蛋糕', '软萌小糖宝', '小吸血鬼', '美人鱼', '勇敢小骑士', '小外星人', '九尾狐', '可爱小妖怪', '闪耀天使', '淘气小恶魔', '飞天魔毯', '棉花糖云朵', '神秘人鱼', '飞马天马', '会说话的南瓜', '宇航员', '魔法扫帚', '果冻怪', '雪人精灵'],
  '🤖 机器人/科幻': ['小机器人', '赛博猫咪', 'Q弹史莱姆', '太空仓鼠', '小恐龙', '像素机器人', '外星小可爱', '机甲小狗', '霓虹幽灵', '太空宇航狗', '赛博朋克兔', '全息幽灵', 'UFO驾驶员', '复古显示器机器人', '迷你游戏机小怪', '充电机器人', 'AI仿生人', '变形机甲'],
  '🍞 甜品/美食': ['会说话的鲷鱼烧', '吐司大叔', '马卡龙兔', '冰美式小幽灵', '胖嘟嘟小饺子', '草莓大福', '巧克力曲奇', '芝士热狗', 'Q弹布丁', '糖葫芦小精灵', '软糯辣炒年糕', '三角饭团', '拉丝披萨', '酥脆薯条', '溏心荷包蛋', '热气腾腾拉面', '甜筒冰淇淋', '章鱼小丸子', '甜心纸杯蛋糕', '小香肠人'],
  '🌿 植物/自然': ['仙人掌宝宝', '四叶草精灵', '圆滚滚小蘑菇', '花盆小宝贝', '向日葵娃娃', '嫩芽小仙子', '红枫叶', '圣女果', '牛油果宝贝', '蜜桃小仙子', '爆辣小辣椒', '蒲公英绒毛', '蓬松棉花糖精灵', '柠檬小可爱', '流泪洋葱', '圆溜溜橡果', '红苹果小精灵', '秋日小栗子'],
  '👀 外貌/特征': ['圆圆脸型', '大而闪亮的大眼睛', '肉嘟嘟脸颊', '短短胖胖的四肢', '小巧圆鼻子', '泛红的脸颊', '毛茸茸的毛发', 'Q弹果冻身材', '长长竖起的耳朵', '小虎牙', '雀斑', '遮住单眼的刘海', '圆圆眼镜', '蓬松大尾巴', '小翅膀', '星形瞳孔', '心形脸颊花纹', '迷你Q版SD体型'],
  '✨ 性格/情感': ['爱恶作剧', '高冷傲娇', '温顺善良', '日常疲惫不堪', '撒娇精', '容易暴躁', '慢吞吞从容', '爱哭鬼', '活泼好动', '害羞胆小', '天然呆脱线', '温柔体贴', '总是很饿', '好奇心爆棚', '凡事极度认真', '爱面子装酷', '陷入热恋', '自信满满', '毛手毛脚', '懒散躺平', '热情爆棚', '胆小怕生', '小傲娇', '毫无干劲', '财迷爱钱'],
  '🖌️ 画风': ['可爱2D动漫风', '韩国条漫Webtoon风', '手绘涂鸦风', '温柔水彩风', '彩铅童话绘本风', '复古动画风', '简约极简矢量风', '波普艺术风', '粗线条美漫风', '像素艺术风', '纸张拼贴风', '复古印刷风', '黑白漫画网点风', '热血战斗漫画风', '少女漫画闪亮风', '8090年代复古动画风', '3D半写实动漫渲染', '日系出版黑白漫画风（G笔网点纸）', '3D羊毛毡与黏土定格动画风', '蜡笔涂鸦童话绘本风', 'Y2K复古闪光像素贴纸风'],
  '👕 服装': ['医生白大褂', '厨师围裙', '职场正装', '宽松连帽衫卫衣', '背带裤', '校服制服', '运动服', '雨衣', '毛茸茸睡衣', '魔法师斗篷', '华丽礼服裙', '运动鸭舌帽', '厚羽绒服', '皮夹克外套', '衬衫配领带', '碎花连衣裙', '街头潮牌穿搭', '传统武术道服', '温暖针织毛衣', '动物连体睡衣', '宇航服', '探险家马甲与帽子', '泳装与救生圈', '经典风衣', '闪亮精灵翅膀', '皇冠与披风', '白T配牛仔裤', '名侦探大衣与帽子'],
  '🎒 道具/动作': ['拿着智能手机', '端着咖啡杯', '戴着墨镜', '戴着耳机', '敲笔记本电脑', '看书', '拿着气球', '抱着花束', '握着麦克风唱歌', '握着游戏手柄', '拿着平底锅', '拿着大放大镜', '在画板上画画', '挥动魔法棒', '提着购物篮', '打着雨伞', '吃爆米花', '吸尘器打扫', '用望远镜偷看', '瑜伽垫上拉伸', '看智能手表', '手握大把钞票', '手拿冰美式随行杯', '噼里啪啦敲笔记本电脑', '大口啃炸鸡腿', '举着啤酒杯干杯', '挂着吊瓶输液续命'],
  '🌏 世界文化与传统': ['传统韩服与礼帽', '新潮改良韩服', 'K-POP偶像舞台华服', '跆拳道道服', '传统日式和服/浴衣', '秋叶原女仆Cosplay', '日本武士/忍者装束', '日系水手服校服', '神社巫女装束', '飘逸武侠/仙侠道袍', '华丽传统旗袍/汉服', '李小龙经典黄色功夫服', '京剧脸谱戏剧演员', '美国西部牛仔与警长', '伦敦绅士风衣与礼帽', '赛博朋克霓虹街头潮服', '中世纪欧洲骑士铠甲', '法式贝雷帽与法棍', '英国皇家卫队红制服与熊皮帽', '西班牙弗拉门戈红裙舞者', '德国慕尼黑啤酒节背带裤', '威尼斯面具舞会贵族服', '墨西哥大草帽流浪乐手', '亡灵节糖骷髅装扮', '巴西狂欢节羽毛桑巴舞者', '越南奥黛与斗笠', '泰国传统金丝纱笼', '印度宝莱坞华丽莎丽', '天方夜谭一千零一夜阿拉伯神灯', '夏威夷阿罗哈花衬衫与尤克里里'],
  '🎬 电影与动漫': ['魔法学院制服与魔杖', '黑西装与墨镜特工', '手持霓虹光刃的宇宙骑士', '手握星光法杖的变身魔法少女', '头戴皮帽手持皮鞭的探险考古学家', '三角帽羽毛海盗船长', '红披风超级英雄', '漆黑面具暗夜英雄', '皮夹克与墨镜机车骑手', '飞行员皮帽与防风护目镜', '举着大树叶的森林巨兽精灵', '风衣与放大镜经典大侦探', '佩戴宇航头盔的星际宇航员', '披斗篷的西部荒野枪手', '佩戴半面白色面具的歌剧幽灵', '驯龙维京战士', '复古护目镜时空穿越者', '末日丧尸幸存者'],
  '💼 打工人与职场': ['下班倒计时10秒盯钟表', '加班熬出浓浓黑眼圈', '发工资日看存折感动落泪', '开会时灵魂出窍发呆', '怀揣辞职信暗中观察', '连喝三杯咖啡续命', '偷偷躲在电脑显示器后', '拿着审批文件察言观色', '早高峰挤在满员地铁里', '挑选午餐菜单时满脸幸福', '周五下班步伐轻快如飞', '周一综合症与被窝合为一体'],
  '🎮 游戏与电竞': ['戴着RGB电竞发光耳机', '愤怒怒砸键盘破防', '排位段位晋级放礼花', '遇到坑队友狂捏后颈破防', '狂灌能量饮料通宵开黑', '戴VR眼镜手舞足蹈', '握紧手柄眼神极度专注', '大吉大利今晚吃鸡胜利动作', '网络掉线断网瞬间绝望', '招募世界Boss开荒野队', '抽卡出金光欧皇大狂喜', '抽卡沉船大保底倒地不起'],
  '💘 恋爱与情侣': ['穿着情侣同款穿搭', '牵着小手甜甜蜜蜜散步', '吃醋鼓起腮帮子背过身', '想你时视频通话截屏留念', '紧紧抱着爱心抱枕', '害羞躲在鲜花束后', '吹灭纪念日蛋糕蜡烛', '靠在肩膀上甜甜入睡', '比手指爱心撒娇卖萌', '傻傻盯着手机等信息', '电影院抓爆米花不小心触碰到手', '雨天撑伞把伞偏向对方'],
  '💪 健身与塑形': ['疯狂摇晃蛋白粉摇摇杯', '霸气举起重沉沉的哑铃', '看到体脂率报告震惊石化', '嚼着减脂沙拉幻想着炸鸡', '在跑步机上大汗淋漓', '站上体重秤绝望流泪', '今日健身打卡对着镜子自拍', '深蹲到底双腿疯狂颤抖', '在泡沫轴拉伸痛到尖叫', '吨吨吨狂喝2升大水壶', '对着镜子欣赏肌肉充血满脸得意', '放纵日暴风吸入披萨汉堡炸鸡'],
  '🌈 特效/背景': ['闪闪发光特效', '爱心四处飞散', '星光飘落', '霓虹灯闪烁', '漫画式集中线', '樱花瓣飘舞', '燃起火焰特效', '汗珠飞溅', '忧郁暗云', '彩虹色光晕', '砰然爆炸', '阴森黑影', '聚光灯照明', '暴风雪席卷', '电闪雷鸣', '啵啵冒气泡', '温暖阳光', '音符飘荡', '在风中飞舞', '飘浮问号（？）', '闪烁感叹号（！）', '瑟瑟发抖颤抖线', '大受打击雷雨乌云', '双眼冒爱心（闪亮）']
};

const I18N = {
  ko: {
    title: 'Prompt Maker',
    step1: '캐릭터 설정',
    whatCharacter: '캐릭터 묘사',
    clear: '초기화',
    placeholder: '예: 동글동글 귀여운 노란 고양이',
    characterSource: '캐릭터 기준',
    directSource: '✏️ 직접 설정',
    randomSource: '🎲 랜덤 캐릭터',
    photoSource: '📷 사진 참고',
    rerollRandom: '다른 캐릭터 다시 뽑기',
    randomBadge: '🎲 랜덤 캐릭터 모드',
    directBadge: '✏️ 직접 캐릭터 설정',
    photoBadge: '📷 사진 참고 모드',
    photoMethod: '사진 반영 방식',
    photoExact: '최대한 닮게',
    photoFeatures: '특징만 반영',
    photoCharacterize: '귀엽게 캐릭터화',
    photoAttachGuide: '프롬프트를 복사한 뒤 AI 대화창(ChatGPT, Gemini, Grok)에 참고할 사진도 함께 첨부해 주세요.',
    photoActive: '참고 이미지 사용',
    phrases: '이모티콘 문구 그리드',
    themeSelect: '테마 선택',
    randomMix: '랜덤', 
    activeThemeLabel: '현재 활성화된 테마',
    customTheme: '✏️ 사용자 지정 (커스텀 문구)',
    gptCopy: 'Copy for ChatGPT',
    geminiCopy: 'Copy for Gemini',
    grokCopy: 'Copy for Grok',
    previewTitle: '프롬프트 미리보기',
    forGpt: 'ChatGPT',
    forGemini: 'Gemini',
    forGrok: 'Grok',
    guideTitle: '활용 가이드',
    guide1Q: '🤔 AI 이모티콘 프롬프트 메이커란?',
    guide1A: '키워드만 찍으면 15종 이모티콘 프롬프트 1초 완성!\n카톡 톡방 짤, SNS 프로필, 블로그 스티커로 나만의 감정을 자유롭게 표현해 보세요.\n원하는 캐릭터와 상황을 고르면 ChatGPT·Gemini·Grok 맞춤형 프롬프트가 즉시 생성됩니다.',
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
    geminiBackgroundMode: 'Gemini 배경',
    geminiTransparent: '투명 배경',
    geminiSolid: '단색 배경',
    geminiChroma: '크로마키',
    geminiStageMode: 'Gemini 작업 단계',
    geminiReferenceStage: '① 기준 캐릭터 만들기',
    geminiFinalStage: '② 기준 이미지로 생성',
    geminiReferenceTip: '먼저 문구 없는 기준 캐릭터를 만든 뒤, 마음에 드는 결과 이미지를 저장하세요.',
    geminiFinalTip: 'Gemini는 표정과 행동 중심 생성에 강합니다. 텍스트가 깨질 경우 [글자 미포함] 모드로 생성 후 편집 앱에서 글자를 추가하시면 더욱 깔끔합니다.',
    gptRepairTitle: 'ChatGPT 이미지 결과 보정',
    geminiRepairTitle: 'Gemini 이미지 결과 보정',
    repairHelp: '💡 사용법: AI가 만든 이미지에 결함이 생겼을 때 버튼을 눌러 복사한 뒤, AI 대화창에 그대로 붙여넣어(Ctrl+V) 전송하세요.',
    geminiRepairIdentity: '캐릭터가 달라졌어요',
    geminiRepairCrop: '몸이 잘렸어요',
    geminiRepairText: '문구가 틀렸어요',
    geminiWorkflowTip: 'Gemini 팁: 시트 전체는 캐릭터와 구도 초안용으로 사용하고, 최종 이미지는 15종 개별 분할로 한 장씩 만드는 것을 권장합니다.',
    grokTextMode: 'Grok 이미지 글자',
    grokNoText: '글자 없이',
    grokIncludeText: '문구 포함',
    grokBackgroundMode: 'Grok 배경',
    grokTransparent: '투명 배경',
    grokSolid: '단색 배경',
    grokChroma: '크로마키',
    grokWorkflowTip: 'Grok 팁: Grok은 Flux.1 엔진 기반으로 고화질 스티커 렌더링에 우수합니다. 글자 수정이 필요할 경우 [글자 미포함] 모드로 생성해 보세요.',
    grokRepairTitle: 'Grok 이미지 결과 보정',
    emptyPhraseError: '비어 있는 문구가 있습니다. 모든 문구를 입력해 주세요.',
    duplicatePhraseError: '중복된 문구가 있습니다. 서로 다른 문구로 수정해 주세요.',
    guide3Q: '✂️ 배경(누끼)은 어떻게 쉽게 지우나요?',
    guide3A: 'PC에서는 무료 웹사이트(remove.bg)나 국민 뷰어 알씨(ALSee)의 "이미지 편집 - AI 배경 제거" 기능을 이용하면 클릭 한 번에 누끼를 딸 수 있습니다. 스마트폰은 갤러리/사진 앱에서 피사체를 꾹 눌러 "복사/저장"하면 배경이 자동으로 투명해집니다.',
    guide4Q: '💬 만든 이모티콘을 카톡에 어떻게 쓰나요?',
    guide4A: '두 가지 방법이 있습니다. 목적에 따라 선택해 보세요!\n\n💰 1. 정식 출시 및 판매를 원할 때\n• "카카오 이모티콘 스튜디오" 사이트에서 제안을 신청해야 합니다.\n• 360x360px 규격의 투명 PNG 이미지 32종을 준비해 제출합니다.\n• 카카오의 공식 스토어 등록 규정(AI 생성물 제한 등)을 확인 후 제출하거나, 개인 소장 및 톡방 전송용 짤로 활용합니다.\n\n✨ 2. 지인들과 가볍게 무료로 쓸 때 (개인 소장용)\n• 배경을 투명하게 지운 PNG 파일을 스마트폰 갤러리에 저장합니다.\n• 카톡 채팅방에서 [+] 버튼 > [앨범]을 눌러 이미지를 전송합니다.\n• 배경이 투명해서 네모난 사진 테두리가 보이지 않고, 진짜 판매용 스티커처럼 대화창에 아주 깔끔하게 올라갑니다!',
  },
  en: {
    title: 'Prompt Maker',
    step1: 'Character Description',
    whatCharacter: 'Description',
    clear: 'Clear',
    placeholder: 'e.g., A round, yellow cat who loves bread',
    characterSource: 'Character source',
    directSource: '✏️ Build manually',
    randomSource: '🎲 Random Character',
    photoSource: '📷 Use a photo',
    rerollRandom: 'Re-roll Character',
    randomBadge: '🎲 Random Character Mode',
    directBadge: '✏️ Manual Character Setup',
    photoBadge: '📷 Photo Reference Mode',
    photoMethod: 'Photo reference style',
    photoExact: 'Match closely',
    photoFeatures: 'Keep key features',
    photoCharacterize: 'Cute character version',
    photoAttachGuide: 'After copying the prompt, attach the reference photo in the AI chat (ChatGPT, Gemini, or Grok) as well.',
    photoActive: 'Reference image enabled',
    phrases: 'Phrase Grid',
    themeSelect: 'Select Theme',
    randomMix: 'Random Mix',
    gptCopy: 'Copy for ChatGPT',
    geminiCopy: 'Copy for Gemini',
    grokCopy: 'Copy for Grok',
    previewTitle: 'Prompt Preview',
    forGpt: 'ChatGPT',
    forGemini: 'Gemini',
    forGrok: 'Grok',
    guideTitle: 'User Guide',
    guide1Q: '🤔 What is AI Emoji Prompt Maker?',
    guide1A: 'Have a sticker idea but are not sure how to describe it to AI?\nChoose a character concept and phrases, and this utility will automatically build ready-to-use sticker prompts for ChatGPT, Gemini, and Grok.',
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
    geminiBackgroundMode: 'Gemini background',
    geminiTransparent: 'Transparent',
    geminiSolid: 'Solid color',
    geminiChroma: 'Chroma key',
    geminiStageMode: 'Gemini workflow stage',
    geminiReferenceStage: '① Create base character',
    geminiFinalStage: '② Generate from reference',
    geminiReferenceTip: 'First create a text-free base character, then save the result you like.',
    geminiFinalTip: 'Gemini excels at expression and pose generation. If text breaks, try generating in [Text-Free] mode and add lettering with an editing tool for cleaner results.',
    gptRepairTitle: 'ChatGPT Image Repair Prompts',
    geminiRepairTitle: 'Gemini Image Repair Prompts',
    repairHelp: '💡 How to use: Click a button to copy the prompt, then paste (Ctrl+V) into the active AI chat to fix defects.',
    geminiRepairIdentity: 'Character changed',
    geminiRepairCrop: 'Body was cropped',
    geminiRepairText: 'Phrase is wrong',
    geminiWorkflowTip: 'Gemini tip: Use the full sheet as a character and layout draft, then generate final images one at a time with Batch Split.',
    grokTextMode: 'Grok image text',
    grokNoText: 'No text',
    grokIncludeText: 'Include text',
    grokBackgroundMode: 'Grok background',
    grokTransparent: 'Transparent',
    grokSolid: 'Solid color',
    grokChroma: 'Chroma key',
    grokWorkflowTip: 'Grok tip: Grok powered by Flux.1 excels at sticker renders. If text stutters, switch to [Text-Free] mode and overlay text later.',
    grokRepairTitle: 'Grok image repair prompts',
    emptyPhraseError: 'One or more phrases are empty. Please fill in every phrase.',
    duplicatePhraseError: 'Duplicate phrases found. Please use a different phrase for each sticker.',
    guide3Q: '✂️ How do I remove the background?',
    guide3A: 'On PC, you can use free tools like remove.bg or ALSee (AI Background Removal) to extract the character in 1 click. On smartphones, long-press the subject in your default Gallery/Photos app and select "Copy/Save" to extract it with a transparent background.',
    guide4Q: '💬 How do I use them in messenger apps?',
    guide4A: 'For official sales, you must submit them to platforms like LINE Creators Market. For personal use, simply save the transparent PNG to your gallery and send it as a regular photo in the chat. It will display cleanly like a sticker.',
  },
  ja: {
    title: 'Prompt Maker',
    step1: 'キャラクター設定',
    whatCharacter: 'キャラクター説明',
    clear: 'リセット',
    placeholder: '例：パンが大好きな丸い黄色い猫',
    characterSource: 'キャラクター基準',
    directSource: '✏️ 直接設定',
    randomSource: '🎲 ランダムキャラ',
    photoSource: '📷 写真から作成',
    rerollRandom: '別のキャラを再抽選',
    randomBadge: '🎲 ランダムキャラモード',
    directBadge: '✏️ 直接キャラクター設定',
    photoBadge: '📷 写真参照モード',
    photoMethod: '写真参照スタイル',
    photoExact: '写真そのまま再現',
    photoFeatures: '特徴だけ抽出 (3D)',
    photoCharacterize: '可愛くSDキャラ化',
    photoAttachGuide: 'プロンプトコピー後、AIチャットにも写真を添付してください。',
    photoActive: '参照画像有効中',
    phrases: 'フレーズ選択 (15種)',
    themeSelect: 'テーマ選択',
    randomMix: 'ランダム',
    activeThemeLabel: '現在のテーマ',
    customTheme: '✏️ カスタム（自由入力/ランダム）',
    gptCopy: 'Copy for ChatGPT',
    geminiCopy: 'Copy for Gemini',
    grokCopy: 'Copy for Grok',
    previewTitle: 'プロンプトプレビュー',
    forGpt: 'ChatGPT',
    forGemini: 'Gemini',
    forGrok: 'Grok',
    guideTitle: '使い方ガイド',
    guide1Q: '🤔 AIスタンププロンプトメーカーとは？',
    guide1A: 'スタンプのアイデアはあるけれど、AIへの指示出しが 難しいとお悩みですか？\n好きなキャラクターの特徴とフレーズを選ぶだけで、ChatGPT、Gemini、Grokで使えるスタンプ制作プロンプトを自動作成します。',
    guide2Q: '💡 ChatGPT vs Gemini どちらを使うべき？',
    guide2A: '文字入れ重視ならChatGPT、表情・ポーズ重視ならGeminiがおすすめです。シート全体で試作し、個別生成で1枚ずつ作成すると品質が安定します。',
    modeSheet: '📱 シート全体 (15種)',
    modeIndividual: '🖼️ 自由個別 (1種)',
    modeBatch: '📋 15種個別分割',
    individualTip: '💡 ヒント: 一貫性を保つため、まず全体シートを生成し、同じチャットで個別プロンプトを入力してください。',
    batchTip: 'フレーズを押すと、現在選択されているAIの1枚用プロンプトがコピーされます。',
    individualInput: '表現したいフレーズや状況を入力',
    individualPlaceholder: '例：涙を流して悲しむ姿',
    batchSelect: 'プレビューするフレーズを選択',
    selectedPhrase: '選択中のフレーズ',
    copiedPrompt: 'プロンプトをコピーしました',
    gptTextMode: 'ChatGPT画像文字',
    gptIncludeText: '文字あり',
    gptNoText: '文字なし',
    gptBackgroundMode: 'ChatGPT背景',
    gptTransparent: '透過背景',
    gptSolid: '単色背景',
    gptChroma: 'クロマキー',
    gptWorkflowTip: 'ChatGPTヒント: 文字の精度が重要な場合、シート全体で試作後、15種個別分割で1枚ずつ確認してください。',
    geminiTextMode: 'Gemini画像文字',
    geminiNoText: '文字なし',
    geminiIncludeText: '文字あり',
    geminiBackgroundMode: 'Gemini背景',
    geminiTransparent: '透過背景',
    geminiSolid: '単色背景',
    geminiChroma: 'クロマキー',
    geminiStageMode: 'Gemini作業段階',
    geminiReferenceStage: '① 基準キャラクター作成',
    geminiFinalStage: '② 基準画像から生成',
    geminiReferenceTip: 'まず文字なしの基準キャラクターを作成し、お気に入りの結果を保存してください。',
    geminiFinalTip: 'Geminiは表情やポーズの表現が得意です。シート全体で試作後、15種個別分割で1枚ずつ生成するのがおすすめです。',
    gptRepairTitle: 'ChatGPT 画像結果補正',
    geminiRepairTitle: 'Gemini 画像結果補正',
    repairHelp: '💡 使い方: AIが生成した画像に問題がある場合、ボタンを押してコピーし、AIチャットに貼り付けて(Ctrl+V)送信してください。',
    geminiRepairIdentity: 'キャラが変わった',
    geminiRepairCrop: '体が切れた',
    geminiRepairText: '文字が違う',
    geminiWorkflowTip: 'Geminiヒント: シート全体は構図の試作として使い、最終画像は15종個別分割で1枚ずつ生成することをおすすめします。',
    grokTextMode: 'Grok画像文字',
    grokNoText: '文字なし',
    grokIncludeText: '文字あり',
    grokBackgroundMode: 'Grok背景',
    grokTransparent: '透過背景',
    grokSolid: '単色背景',
    grokChroma: 'クロマキー',
    grokWorkflowTip: 'Grokヒント: GrokはFlux.1エンジンを搭載し、自然なテキストとステッカーの質感を正確に表現します。',
    grokRepairTitle: 'Grok 画像結果補正',
    emptyPhraseError: '空のフレーズがあります。すべてのフレーズを入力してください。',
    duplicatePhraseError: '重複したフレーズがあります。それぞれ異なるフレーズを入力してください。',
    guide3Q: '✂️ 背景（透過）の簡単な消し方は？',
    guide3A: 'remove.bgなどの無料Webツールを使うとワンクリックで背景を切り抜けます。スマホではギャラリーアプリで被写体を長押しして「コピー/保存」すると自動的に透過画像になります。',
    guide4Q: '💬 作ったスタンプはLINEでどう使う？',
    guide4A: 'LINE Creators Marketで申請して販売することも、透過PNGをギャラリーに保存してトーク画面で画像として送信して楽しむこともできます！',
  },
  zh: {
    title: 'Prompt Maker',
    step1: '角色设置',
    whatCharacter: '角色描述',
    clear: '重置',
    placeholder: '例：一只喜欢吃面包的圆滚滚黄色小猫',
    characterSource: '角色来源',
    directSource: '✏️ 手动描述',
    randomSource: '🎲 随机角色',
    photoSource: '📷 上传照片',
    rerollRandom: '重新随机抽取角色',
    randomBadge: '🎲 随机角色模式',
    directBadge: '✏️ 手动角色描述',
    photoBadge: '📷 照片参考模式',
    photoMethod: '照片参考风格',
    photoExact: '高还原度写真',
    photoFeatures: '提取特征 (3D)',
    photoCharacterize: 'Q版SD卡通化',
    photoAttachGuide: '复制提示词后，请在AI聊天框中同时发送参考照片。',
    photoActive: '参考图片已启用',
    phrases: '表情短语网格 (15种)',
    themeSelect: '主题选择',
    randomMix: '随机混合',
    activeThemeLabel: '当前主题',
    customTheme: '✏️ 自定义短语（手动/随机）',
    gptCopy: 'Copy for ChatGPT',
    geminiCopy: 'Copy for Gemini',
    grokCopy: 'Copy for Grok',
    previewTitle: '提示词预览',
    forGpt: 'ChatGPT',
    forGemini: 'Gemini',
    forGrok: 'Grok',
    guideTitle: '使用指南',
    guide1Q: '🤔 什么是AI表情包提示词生成器？',
    guide1A: '想制作表情包却不知道如何给AI写提示词？选择你喜欢的角色特征和常用短语，本工具将自动为你生成适用于ChatGPT、Gemini和Grok的表情包提示词。',
    guide2Q: '💡 ChatGPT vs Gemini 应该选哪一个？',
    guide2A: '如果表情包中必须包含精准文字，推荐使用ChatGPT；如果更看重动作和神态，推荐使用Gemini。',
    modeSheet: '📱 完整整页 (15种)',
    modeIndividual: '🖼️ 自由单张 (1种)',
    modeBatch: '📋 15种单张拆分',
    individualTip: '💡 提示：为保持一致性，建议先生成整张表情包，再在同一个对话框中使用单张提示词。',
    batchTip: '点击短语即可直接复制当前AI的单张表情包提示词。',
    individualInput: '输入想表达的短语或情境',
    individualPlaceholder: '例：流着眼泪非常难过的样子',
    batchSelect: '选择预览短语',
    selectedPhrase: '已选短语',
    copiedPrompt: '提示词已复制',
    gptTextMode: 'ChatGPT文字模式',
    gptIncludeText: '包含文字',
    gptNoText: '纯图无字',
    gptBackgroundMode: 'ChatGPT背景',
    gptTransparent: '透明背景',
    gptSolid: '单色背景',
    gptChroma: '抠图绿幕',
    gptWorkflowTip: 'ChatGPT提示：如果文字精准度很重要，建议先生成整页草图，再用拆分模式逐张生成校验。',
    geminiTextMode: 'Gemini文字模式',
    geminiNoText: '纯图无字',
    geminiIncludeText: '包含文字',
    geminiBackgroundMode: 'Gemini背景',
    geminiTransparent: '透明背景',
    geminiSolid: '单色背景',
    geminiChroma: '绿幕抠图',
    geminiStageMode: 'Gemini制作阶段',
    geminiReferenceStage: '① 制作基准角色',
    geminiFinalStage: '② 基于基准图生成',
    geminiReferenceTip: '请先制作不带文字的基准角色，并保存满意的图片。',
    geminiFinalTip: 'Gemini擅长生成丰富的表情与动作。建议将整页作为草稿，再使用单张拆分逐张生成。',
    gptRepairTitle: 'ChatGPT 图像结果修正',
    geminiRepairTitle: 'Gemini 图像结果修正',
    repairHelp: '💡 使用方法：若AI生成图出现瑕疵，点击复制修正提示词并粘贴发送至同一AI对话框(Ctrl+V)即可修复。',
    geminiRepairIdentity: '角色变形了',
    geminiRepairCrop: '身体被裁剪了',
    geminiRepairText: '文字出错了',
    geminiWorkflowTip: 'Gemini提示：建议将整页作为构图草稿，最终成品使用单张拆分模式逐一生成。',
    grokTextMode: 'Grok文字模式',
    grokNoText: '纯图无字',
    grokIncludeText: '包含文字',
    grokBackgroundMode: 'Grok背景',
    grokTransparent: '透明背景',
    grokSolid: '单色背景',
    grokChroma: '抠图绿幕',
    grokWorkflowTip: 'Grok提示：Grok基于Flux.1引擎，擅长精准的自然语言指令与矢量贴纸质感。',
    grokRepairTitle: 'Grok 图像结果修正',
    emptyPhraseError: '存在空白短语，请填写所有短语。',
    duplicatePhraseError: '存在重复短语，请修改为不同的短语。',
    guide3Q: '✂️ 如何轻松去除背景（抠图）？',
    guide3A: '使用remove.bg等免费在线工具可一键抠图。手机端长按相册中的主体即可直接提取透明PNG。',
    guide4Q: '💬 制作好的表情包如何在微信中使用？',
    guide4A: '保存透明PNG到手机相册，在微信聊天框中以图片形式发送，或导入微信表情包自定义收藏即可！',
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
    <div className="w-full text-center my-1.5 p-2 sm:p-2.5 bg-surface-container-lowest rounded-lg border border-outline-variant/60 shadow-2xs overflow-hidden max-h-[120px]">
      <p className="text-[10px] font-semibold text-neutral-400 mb-0.5 text-left tracking-wider uppercase">Advertisement</p>
      <ins className="adsbygoogle"
           style={{display: 'inline-block', width: '100%', height: '90px', maxHeight: '90px'}}
           data-ad-client={ADSENSE_CLIENT_ID}
           data-ad-slot="1234567890"
           data-ad-format="horizontal"
           data-full-width-responsive="true"></ins>
    </div>
  );
};

const GUIDE_TEXTS = {
  ko: {
    tabBg: '✂️ 배경(누끼) 제거',
    tabUsage: '💬 메신저 스티커 등록',
    modelDesc: '각 AI 모델의 강력한 장점이 다르므로 목적에 맞게 골라 쓰세요!',
    chatgptTitle: 'ChatGPT 이미지 생성 추천',
    chatgptSub: '"대사가 꼭 필요한 이모티콘"',
    userCreation: '실제 유저 생성본 ✨',
    chatgptBullets: [
      '• 🎯 특징: 한글 및 다국어 타이포그래피(글씨 쓰기) 능력이 압도적으로 뛰어납니다.',
      '• 💬 예시: 캐릭터가 "고마워!" 라고 외치는 말풍선 텍스트가 시트에 꼭 들어가야 할 때 필수입니다.',
      '• 🎨 화풍: 부드럽고 몽글몽글한 3D 렌더링, 파스텔톤 수채화 느낌을 내는 데 아주 강합니다.'
    ],
    geminiTitle: 'Gemini 이미지 생성 추천',
    geminiSub: '"표정과 행동으로 말하는 이모티콘"',
    geminiBullets: [
      '• 🎯 특징: 채택한 기준 이미지를 다시 첨부해 한 장씩 변형할 때 캐릭터 특징을 안정적으로 이어가기 좋습니다.',
      '• 💬 예시: 기준 캐릭터를 먼저 만든 뒤, 글씨 없이 표정과 몸짓 중심의 개별 이미지를 만들 때 활용하기 좋습니다.',
      '• 🎨 권장: 15컷 시트는 구도 초안으로 사용하고 최종 이미지는 15종 개별 분할에서 생성하세요.'
    ],
    proTipTitle: '공용 활용 꿀팁!',
    proTipDesc: '사진을 첨부하면 인물이나 반려동물의 특징을 반영한 캐릭터를 만들 수 있습니다. ChatGPT는 문구가 필요한 이미지에 활용하고, Gemini는 마음에 드는 기준 캐릭터를 만든 뒤 그 이미지를 다시 첨부해 한 장씩 변형해 보세요.',
    bgSub: '가장 쉽고 빠르게 이모티콘 배경을 투명하게(누끼) 만드는 방법을 소개합니다!',
    pcTitle: '💻 PC에서 작업할 때',
    pcMethod1: '방법 1: remove.bg 웹사이트',
    pcMethod1Bullets: [
      'remove.bg 사이트에 접속합니다.',
      '생성된 이모티콘 이미지를 드래그 앤 드롭합니다.',
      '1초 만에 자동으로 배경이 제거된 PNG를 다운로드합니다.'
    ],
    removeBgLink: '👉 remove.bg 바로가기',
    pcMethod2: '방법 2: 알씨(ALSee) 프로그램',
    pcMethod2Bullets: [
      '알씨 실행 후 [도구] ➔ [AI 배경 제거(누끼)] 선택.',
      '이미지 드래그 후 마우스 클릭으로 간편하게 누끼 작업.'
    ],
    alSeeLink: '👉 알씨 다운로드',
    mobileTitle: '📱 스마트폰에서 작업할 때',
    galaxyTitle: '🤖 갤럭시 (Galaxy)',
    galaxyBullets: [
      '[갤러리] 앱에서 이모티콘 이미지를 엽니다.',
      '캐릭터 부분을 1초 동안 꾹 누릅니다.',
      '[스티커로 저장] 또는 [이미지로 저장]을 누르면 배경 투명 PNG 완성!'
    ],
    iphoneTitle: '🍎 아이폰 (iPhone)',
    iphoneBullets: [
      '[사진] 앱에서 이모티콘 이미지를 엽니다.',
      '캐릭터 인물을 꾹 누르면 반짝이는 누끼 효과가 나타납니다.',
      '[복사] 후 메신저에 바로 붙여넣거나 [스티커 추가]를 누르세요!'
    ],
    chroma1: '1. 연두색 배경 AI 이미지',
    chroma2: '2. 클릭 한 번으로 누끼!',
    chroma3: '3. 완벽한 투명 PNG 완성',
    usageSub: '만드신 이미지를 실제 메신저(카카오톡, 라인, 위챗)에서 사용하는 두 가지 방법을 소개합니다!',
    usageOfficialTitle: '1. 정식 출시 및 판매를 원할 때',
    usageOfficialCard: '이모티콘 스튜디오 제안',
    warningTag: '⚠️ 주의',
    warningHeading: 'AI 이미지는 그대로 등록 불가!',
    warningBody: '현재 플랫폼 정책상 저작권 문제로 인해 AI가 생성한 이미지를 \'그대로\' 제출하는 것은 엄격히 금지되어 있습니다. AI는 기발한 대사와 포즈를 뽑는 최고의 \'참고용 시안\'으로 활용하시고, 정식 제출은 그 시안을 바탕으로 직접 선을 따서 다시 그려서(리디자인) 제출하셔야 합니다.',
    usageOfficialBullets: [
      '이미지 준비: 직접 리디자인한 투명 배경 PNG 이미지 준비',
      '제안하기: 스튜디오 사이트에 접속하여 준비한 이미지를 업로드',
      '심사 대기: 내부 심사 통과 시 정식 상품으로 출시되어 수익 창출 가능!'
    ],
    kakaoStudioLink: '👉 이모티콘 스튜디오 바로가기',
    usageCasualTitle: '2. 지인들과 가볍게 무료로 쓸 때',
    usageCasualCard: '개인 소장용 (채팅방 전송)',
    exampleBadge: '📸 전송 예시',
    usageCasualBullets: [
      '위의 [배경(누끼) 제거] 가이드에 따라 투명 배경으로 만든 PNG 파일을 스마트폰 갤러리에 저장합니다.',
      '채팅방에서 입력창 옆의 [+] 버튼 ➔ [앨범/사진]을 누릅니다.',
      '갤러리에서 투명하게 만든 캐릭터 이미지를 선택하여 전송합니다.'
    ],
    usageCasualTip: '배경이 투명하기 때문에 하얀색 네모 테두리가 보이지 않아, 진짜로 구매한 스티커처럼 대화창에 아주 깔끔하게 올라갑니다!'
  },
  en: {
    tabBg: '✂️ Remove Background',
    tabUsage: '💬 Use in Messengers',
    modelDesc: 'Choose the right AI model for your specific needs!',
    chatgptTitle: 'ChatGPT Image Generation',
    chatgptSub: '"Emoticons with essential text"',
    userCreation: 'Actual user creation ✨',
    chatgptBullets: [
      '• 🎯 Feature: Unmatched typography and text rendering.',
      '• 💬 Usage: Essential when speech bubbles or text like "Thanks!" must be included.',
      '• 🎨 Style: Very strong at soft 3D rendering and pastel watercolor styles.'
    ],
    geminiTitle: 'Gemini Image Generation',
    geminiSub: '"Emoticons speaking through expressions"',
    geminiBullets: [
      '• 🎯 Feature: Works best when an accepted base image is attached again for one-at-a-time variations.',
      '• 💬 Usage: Create the base character first, then generate individual expression- and action-focused images.',
      '• 🎨 Recommended: Use the 15-panel sheet as a draft and Batch Split for final assets.'
    ],
    proTipTitle: 'Pro Tip!',
    proTipDesc: 'Attach a photo to reflect recognizable features. Use ChatGPT when text matters, and with Gemini create a base character first, then attach that accepted result again for one-at-a-time variations.',
    bgSub: 'How to easily and quickly remove backgrounds from your emoticons!',
    pcTitle: '💻 Working on PC',
    pcMethod1: 'Method 1: remove.bg website',
    pcMethod1Bullets: [
      'Visit the remove.bg website.',
      'Drag and drop your generated emoticon image.',
      'Download the transparent PNG automatically extracted in 1 sec.'
    ],
    removeBgLink: '👉 Go to remove.bg',
    pcMethod2: 'Method 2: ALSee Program',
    pcMethod2Bullets: [
      'Run ALSee and select [Tools] ➔ [AI Background Removal].',
      'Drag the image and click to clean up background easily.'
    ],
    alSeeLink: '👉 Download ALSee',
    mobileTitle: '📱 Working on Smartphone',
    galaxyTitle: '🤖 Galaxy (Android)',
    galaxyBullets: [
      'Open the image in your [Gallery] app.',
      'Press and hold the character subject for 1 second.',
      'Tap [Save as sticker] or [Save as image] for a transparent PNG!'
    ],
    iphoneTitle: '🍎 iPhone (iOS)',
    iphoneBullets: [
      'Open the image in your [Photos] app.',
      'Press and hold the character until a shiny outline appears.',
      'Tap [Copy] to paste in chat or tap [Add Sticker]!'
    ],
    chroma1: '1. Green BG AI Image',
    chroma2: '2. 1-Click Removal!',
    chroma3: '3. Perfect Transparent PNG',
    usageSub: 'Two ways to actually use your created images in KakaoTalk & LINE & WeChat!',
    usageOfficialTitle: '1. Official Release and Sale',
    usageOfficialCard: 'Studio Submission',
    warningTag: '⚠️ Warning',
    warningHeading: 'Cannot Submit AI Images As-Is!',
    warningBody: 'Due to platform copyright policies, submitting AI-generated images "as-is" is strictly prohibited. Use AI as an excellent "reference draft", and for official submission, you must trace and redraw (redesign) them yourself based on the draft.',
    usageOfficialBullets: [
      'Prepare Images: Prepare transparent PNG images redrawn by yourself.',
      'Submit: Upload your prepared images to the Studio website.',
      'Wait for Review: If approved, it becomes an official product for monetization!'
    ],
    kakaoStudioLink: '👉 Emoticon Studio Submission',
    usageCasualTitle: '2. Casual Free Use with Friends',
    usageCasualCard: 'Personal Use (Chatroom Trick)',
    exampleBadge: '📸 Example',
    usageCasualBullets: [
      'Save the transparent background PNG file to your smartphone gallery using the guide above.',
      'In your chatroom, tap the [+] button ➔ [Album/Photo] next to the input field.',
      'Select and send the transparent character image from your gallery.'
    ],
    usageCasualTip: 'Because the background is transparent, the white rectangular border is invisible, making it look exactly like a real purchased sticker in the chat window!'
  },
  ja: {
    tabBg: '✂️ 背景（透過）の消し方',
    tabUsage: '💬 スタンプの登録・使用方法',
    modelDesc: '各AIモデルにはそれぞれ強みがあります。目的に合わせて使い分けましょう！',
    chatgptTitle: 'ChatGPT画像生成おすすめ',
    chatgptSub: '「文字入れが必須のスタンプ」',
    userCreation: 'ユーザーの実際の生成例 ✨',
    chatgptBullets: [
      '• 🎯 特徴: 文字（タイポグラフィ）描画能力が非常に優れています。',
      '• 💬 用途: 「ありがとう！」などの文字や吹き出しをスタンプ内に入れたい時に最適です。',
      '• 🎨 画風: ふんわりとした3Dレンダリングやパステル調の水彩画風が得意です。'
    ],
    geminiTitle: 'Gemini画像生成おすすめ',
    geminiSub: '「表情やポーズで魅せるスタンプ」',
    geminiBullets: [
      '• 🎯 特徴: 基準画像を再添付して1枚ずつ生成する際、キャラクターの一貫性を維持するのに長けています。',
      '• 💬 用途: まず文字なしの基準キャラを作成し、ポーズや表情メインのスタンプを作るのに向いています。',
      '• 🎨 推奨: 15コマシートは構図の試作として使い、最終画像は15種個別分割で1枚ずつ生成してください。'
    ],
    proTipTitle: '共通活用のコツ！',
    proTipDesc: '写真を添付すると人物やペットの特徴を反映したキャラを作成できます。文字が必要なスタンプはChatGPTで、表情やポーズ重視ならGeminiで基準キャラを作ってから画像を再添付して1枚ずつ作成するのがコツです。',
    bgSub: 'スタンプの背景を簡単に透明（透過）にする方法をご紹介します！',
    pcTitle: '💻 PCで作業する場合',
    pcMethod1: '方法 1: remove.bg Webサイト',
    pcMethod1Bullets: [
      'remove.bg サイトにアクセスします。',
      '生成されたスタンプ画像をドラッグ＆ドロップします。',
      '1秒で自動的に背景が透過されたPNGをダウンロードします。'
    ],
    removeBgLink: '👉 remove.bg へ移動',
    pcMethod2: '方法 2: 画像編集ソフト',
    pcMethod2Bullets: [
      '画像編集ソフトで「背景透過/切り抜き」を選択。',
      '画像を読み込んでワンクリックで透過保存。'
    ],
    alSeeLink: '👉 編集ソフトを開く',
    mobileTitle: '📱 スマホで作業する場合',
    galaxyTitle: '🤖 Galaxy (Android)',
    galaxyBullets: [
      '「ギャラリー」アプリでスタンプ画像を開きます。',
      'キャラクター部分を1秒間長押しします。',
      '「ステッカーとして保存」または「画像として保存」をタップ！'
    ],
    iphoneTitle: '🍎 iPhone (iOS)',
    iphoneBullets: [
      '「写真」アプリでスタンプ画像を開きます。',
      'キャラを長押しすると光る輪郭が表示されます。',
      '「コピー」してトークに貼り付けるか「ステッカーに追加」をタップ！'
    ],
    chroma1: '1. グリーン背景のAI画像',
    chroma2: '2. ワンクリックで透過！',
    chroma3: '3. 完璧な透明PNG完成',
    usageSub: '作成した画像をLINEやメッセージアプリで使う2つの方法！',
    usageOfficialTitle: '1. 公式スタンプとして販売したい場合',
    usageOfficialCard: 'LINE Creators Market 申請',
    warningTag: '⚠️ 注意',
    warningHeading: 'AI画像のままでは申請不可！',
    warningBody: '現在プラットフォームの規約上、AI生成画像を「そのまま」提出することは禁止されています。AI画像をアイデアやポーズの「参考案」として使い、申請時はそれを元に自分で描き直して（リデザイン）提出してください。',
    usageOfficialBullets: [
      '画像準備: 自分で描き直した 370x320px 透明背景PNG画像を用意',
      '申請: LINE Creators Market サイトで画像をアップロード',
      '審査待ち: 審査通過でスタンプとして販売・収益化が可能！'
    ],
    kakaoStudioLink: '👉 LINE Creators Market へ',
    usageCasualTitle: '2. 友達と無料で気軽に使う場合',
    usageCasualCard: '個人利用（トーク画面で画像送信）',
    exampleBadge: '📸 送信例',
    usageCasualBullets: [
      '上記の透過ガイドに従い、透明背景PNG画像をスマホのギャラリーに保存します。',
      'トーク画面の [+] ボタン ➔ 「写真」を選択します。',
      '透明背景のキャラ画像を選んで送信すると、スタンプのように表示されます！'
    ],
    usageCasualTip: '背景が透明なため白い枠線が見えず、まるで購入した本物のスタンプ<ctrl42>のようにトーク画面に綺麗に表示されます！'
  },
  zh: {
    tabBg: '✂️ 抠图（透明背景）',
    tabUsage: '💬 表情包使用指南',
    modelDesc: '各个AI模型各有强项，请根据具体需求选择最适合的模型！',
    chatgptTitle: '推荐使用ChatGPT',
    chatgptSub: '“必须带有文字的表情包”',
    userCreation: '用户真实生成示例 ✨',
    chatgptBullets: [
      '• 🎯 特色: 文字与排版渲染能力极其优秀。',
      '• 💬 用途: 当表情包中必须包含“谢谢！”等文字对话框时非常推荐。',
      '• 🎨 画风: 非常擅长表现柔和的3D渲染和粉彩水彩风格。'
    ],
    geminiTitle: '推荐使用Gemini',
    geminiSub: '“通过表情与动作传达的表情包”',
    geminiBullets: [
      '• 🎯 特色: 再次附上已选定的基准图片进行单张生成时，能非常稳定地保持角色特征一致。',
      '• 💬 用途: 适合先生成基准角色，再制作以表情和肢体动作为主的单张无字表情包。',
      '• 🎨 建议: 15宫格草图作为构图参考，最终高清图片建议通过15种单张拆分逐一生成。'
    ],
    proTipTitle: '通用实用技巧！',
    proTipDesc: '上传照片可以生成融入人物或宠物特征的角色。需要文字说明时使用ChatGPT；想要多变表情和动作时，建议先用Gemini生成满意的基准角色，再重新上传该图片逐一衍生单张表情包。',
    bgSub: '介绍几种最简单快速的表情包抠图（透明背景）方法！',
    pcTitle: '💻 在电脑上操作',
    pcMethod1: '方法 1: remove.bg 网页版',
    pcMethod1Bullets: [
      '访问 remove.bg 网站。',
      '拖拽上传生成的表情包图片。',
      '一秒内自动生成并下载透明背景PNG。'
    ],
    removeBgLink: '👉 前往 remove.bg',
    pcMethod2: '方法 2: 图像编辑软件',
    pcMethod2Bullets: [
      '打开图像软件并选择“AI抠图/透明背景”。',
      '拖入图片并一键删除背景色。'
    ],
    alSeeLink: '👉 打开图像软件',
    mobileTitle: '📱 在手机上操作',
    galaxyTitle: '🤖 三星/安卓手机',
    galaxyBullets: [
      '在“相册”App中打开表情包图片。',
      '长按主体角色约1秒。',
      '点击“保存为贴纸”或“保存为透明图片”即可！'
    ],
    iphoneTitle: '🍎 苹果 iPhone',
    iphoneBullets: [
      '在“照片”App中打开图片。',
      '长按角色主体，直到出现轮廓光效。',
      '点击“复制”直接发送，或点击“添加贴图”！'
    ],
    chroma1: '1. 绿色背景AI图片',
    chroma2: '2. 一键快速抠图！',
    chroma3: '3. 完美透明PNG完成',
    usageSub: '在微信、QQ、LINE或KakaoTalk中使用图片的两种方法！',
    usageOfficialTitle: '1. 上架为官方表情包出售',
    usageOfficialCard: '微信表情开放平台 / 官方平台提交',
    warningTag: '⚠️ 注意',
    warningHeading: '不能直接提交AI原始图片！',
    warningBody: '目前各平台政策规定，严禁直接上传AI生成的原始图片。请将AI图片作为获取表情动作与构图的“参考草图”，正式提交前需根据草图自行重新绘制（重构）后再上传。',
    usageOfficialBullets: [
      '准备图片: 准备由自己重新绘制的透明背景PNG图片',
      '提交审核: 登录平台上传准备好的表情包图片',
      '等待审核: 审核通过后即可正式上架并获得收益！'
    ],
    kakaoStudioLink: '👉 前往表情开放平台',
    usageCasualTitle: '2. 与朋友免费聊天发送',
    usageCasualCard: '个人收藏（聊天发送技巧）',
    exampleBadge: '📸 发送示例',
    usageCasualBullets: [
      '按照上方抠图指南，将生成的透明背景PNG图片保存至手机相册。',
      '在聊天界面中点击输入框旁边的 [+] ➔ 【相册/图片】。',
      '选择保存的透明背景角色图片直接发送，即可像真正买的表情包一样展示！'
    ],
    usageCasualTip: '由于背景是透明的，因此不会显示白色方框外框，在聊天框中发送效果与购买的正式表情包完全一样干净漂亮！'
  }
};

const InfoSection = ({ t, lang }) => {
  const [activeTab, setActiveTab] = useState('model');

  const getText = (key, customDict = {}) => {
    if (customDict[lang]) return customDict[lang];
    if (customDict['en']) return customDict['en'];
    return customDict['ko'] || '';
  };

  return (
    <div id="guide-section" className="scroll-mt-24 flex flex-col gap-4">
      {/* 탭 헤더 */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-surface-container-lowest p-3 sm:p-4 rounded-md border border-outline-variant shadow-bubbly overflow-hidden">
        <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 shrink-0">
          <span>❓</span> {t.guideHeader}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center gap-1 sm:gap-1.5 bg-mint-soft p-1.5 rounded-lg border border-mint-border shadow-xs w-full lg:w-auto max-w-full">
          <button
            onClick={() => setActiveTab('model')}
            className={`interactive-control px-2 sm:px-3 py-1.5 text-[12px] sm:text-[13px] font-bold rounded-md text-center transition-all cursor-pointer ${activeTab === 'model' ? 'bg-mint text-mint-strong shadow-xs border border-mint-border' : 'text-mint-strong hover:bg-mint-hover'}`}
          >
            🤖 {lang === 'ko' ? 'AI 모델' : lang === 'ja' ? 'AIモデル' : lang === 'zh' ? 'AI模型' : 'AI Models'}
          </button>
          <button
            onClick={() => setActiveTab('bg')}
            className={`interactive-control px-2 sm:px-3 py-1.5 text-[12px] sm:text-[13px] font-bold rounded-md text-center transition-all cursor-pointer ${activeTab === 'bg' ? 'bg-mint text-mint-strong shadow-xs border border-mint-border' : 'text-mint-strong hover:bg-mint-hover'}`}
          >
            ✂️ {lang === 'ko' ? '배경(누끼) 제거' : lang === 'ja' ? '背景(透過)の消し方' : lang === 'zh' ? '一键去除背景' : 'Remove BG'}
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`interactive-control px-2 sm:px-3 py-1.5 text-[12px] sm:text-[13px] font-bold rounded-md text-center transition-all cursor-pointer ${activeTab === 'usage' ? 'bg-mint text-mint-strong shadow-xs border border-mint-border' : 'text-mint-strong hover:bg-mint-hover'}`}
          >
            💬 {lang === 'ko' ? '이모티콘 등록·사용법' : lang === 'ja' ? 'スタンプ登録・使い方' : lang === 'zh' ? '表情包使用指南' : 'How to Use'}
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`interactive-control px-2 sm:px-3 py-1.5 text-[12px] sm:text-[13px] font-bold rounded-md text-center transition-all cursor-pointer ${activeTab === 'template' ? 'bg-mint text-mint-strong shadow-xs border border-mint-border' : 'text-mint-strong hover:bg-mint-hover'}`}
          >
            💡 {lang === 'ko' ? '프롬프트 템플릿' : lang === 'ja' ? 'プロンプト構造' : lang === 'zh' ? '提示词结构' : 'Prompt Template'}
          </button>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="bg-surface-container-lowest rounded-md p-3.5 sm:p-md shadow-bubbly border border-outline-variant">
        <div className="min-h-[250px]">
        {activeTab === 'model' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-4 mt-2">
            <p className="text-[15px] font-bold text-on-surface px-2">
              {getText('modelSub', {
                ko: '각 AI 모델의 강력한 장점이 다르므로 목적에 맞게 골라 쓰세요!',
                ja: 'AIモデルごとに得意分野が異なります。目的に合わせて選んでください！',
                zh: '各AI模型的强项有所不同，请根据您的需求选择！',
                en: 'Choose the right AI model for your specific needs!',
              })}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* ChatGPT Card */}
              <div className="bg-surface-variant/30 p-4 sm:p-5 rounded-md border border-outline-variant flex flex-col gap-4 hover:shadow-md transition-shadow group relative">
                <div className="font-bold text-[16px] text-on-surface group-hover:text-primary-strong transition-colors">
                  🟢 {getText('gptTitle', {
                    ko: 'ChatGPT 이미지 생성 추천',
                    ja: 'ChatGPT 画像生成のおすすめ',
                    zh: 'ChatGPT 图像生成推荐',
                    en: 'ChatGPT Image Generation',
                  })}
                </div>
                <div className="font-black text-[18px] text-primary-strong -mt-3">
                  {getText('gptSub', {
                    ko: '"대사가 꼭 필요한 이모티콘"',
                    ja: '"セリフ・文字入れ가 必須のスタンプ"',
                    zh: '"包含文字台词的表情包"',
                    en: '"Emoticons with essential text"',
                  })}
                </div>
                
                <div className="w-full h-56 rounded-md bg-white border border-outline-variant shadow-sm relative overflow-hidden group">
                  <img src="/chatgpt_real.jpg" alt="ChatGPT Actual Result" className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-1 rounded-md">
                    {getText('actualBadge', {
                      ko: '실제 유저 생성본 ✨',
                      ja: '実際のユーザー作成例 ✨',
                      zh: '真实用户生成范例 ✨',
                      en: 'Actual user creation ✨',
                    })}
                  </div>
                </div>

                <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-2 mt-2 break-keep">
                  {lang === 'ko' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">특징:</strong> 한글 타이포그래피(글씨 쓰기) 능력이 압도적으로 뛰어납니다.</li>
                      <li>• 💬 <strong className="text-on-surface">예시:</strong> 캐릭터가 "고마워!" 라고 외치는 말풍선 텍스트가 시트에 꼭 들어가야 할 때 필수입니다.</li>
                      <li>• 🎨 <strong className="text-on-surface">화풍:</strong> 부드럽고 몽글몽글한 3D 렌더링, 파스텔톤 수채화 느낌을 내는 데 아주 강합니다.</li>
                    </>
                  )}
                  {lang === 'ja' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">特徴:</strong> 文字や台詞の描画能力が圧倒的に優れています。</li>
                      <li>• 💬 <strong className="text-on-surface">例:</strong> 「ありがとう！」などの文字が入った吹き出し付きスタンプを作りたい時に最適です。</li>
                      <li>• 🎨 <strong className="text-on-surface">画風:</strong> 柔らかい3Dレンダリングやパステル調の水彩画スタイルが得意です。</li>
                    </>
                  )}
                  {lang === 'zh' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">特点:</strong> 文字与台词排版能力极其优秀。</li>
                      <li>• 💬 <strong className="text-on-surface">示例:</strong> 当表情包必须包含“谢谢！”等气泡文字台词时是首选。</li>
                      <li>• 🎨 <strong className="text-on-surface">画风:</strong> 擅长柔和立体3D渲染和马卡龙/水彩粉彩画风。</li>
                    </>
                  )}
                  {lang !== 'ko' && lang !== 'ja' && lang !== 'zh' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">Feature:</strong> Unmatched Korean typography and text rendering.</li>
                      <li>• 💬 <strong className="text-on-surface">Usage:</strong> Essential when speech bubbles or text like "Thanks!" must be included.</li>
                      <li>• 🎨 <strong className="text-on-surface">Style:</strong> Very strong at soft 3D rendering and pastel watercolor styles.</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Gemini Card */}
              <div className="bg-surface-variant/30 p-4 sm:p-5 rounded-md border border-outline-variant flex flex-col gap-4 hover:shadow-md transition-shadow group relative">
                <div className="font-bold text-[16px] text-on-surface group-hover:text-primary-strong transition-colors">
                  🔵 {getText('geminiTitle', {
                    ko: 'Gemini 이미지 생성 추천',
                    ja: 'Gemini 画像生成のおすすめ',
                    zh: 'Gemini 图像生成推荐',
                    en: 'Gemini Image Generation',
                  })}
                </div>
                <div className="font-black text-[18px] text-primary-strong -mt-3">
                  {getText('geminiSub', {
                    ko: '"표정과 행동으로 말하는 이모티콘"',
                    ja: '"表情やポーズで表現するスタンプ"',
                    zh: '"用表情和肢体动作表达的表情包"',
                    en: '"Emoticons speaking through expressions"',
                  })}
                </div>
                
                <div className="w-full h-56 rounded-md bg-white border border-outline-variant shadow-sm relative overflow-hidden group">
                  <img src="/gemini_real.png" alt="Gemini Actual Result" className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-1 rounded-md">
                    {getText('actualBadge', {
                      ko: '실제 유저 생성본 ✨',
                      ja: '実際のユーザー作成例 ✨',
                      zh: '真实用户生成范例 ✨',
                      en: 'Actual user creation ✨',
                    })}
                  </div>
                </div>

                <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-2 mt-2 break-keep">
                  {lang === 'ko' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">특징:</strong> 채택한 기준 이미지를 다시 첨부해 한 장씩 변형할 때 캐릭터 특징을 안정적으로 이어가기 좋습니다.</li>
                      <li>• 💬 <strong className="text-on-surface">예시:</strong> 기준 캐릭터를 먼저 만든 뒤, 글씨 없이 표정과 몸짓 중심의 개별 이미지를 만들 때 활용하기 좋습니다.</li>
                      <li>• 🎨 <strong className="text-on-surface">권장:</strong> 15컷 시트는 구도 초안으로 사용하고 최종 이미지는 15종 개별 분할에서 생성하세요.</li>
                    </>
                  )}
                  {lang === 'ja' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">特徴:</strong> ベース画像を再添付して1枚ずつ変形する際、キャラの特徴を安定して維持できます。</li>
                      <li>• 💬 <strong className="text-on-surface">例:</strong> ベースキャラを先に作成し、文字なしで表情やポーズ中心の個別画像を作るのに最適です。</li>
                      <li>• 🎨 <strong className="text-on-surface">推奨:</strong> 15コマシートは下書きとして使い、最終画像は個別分割で生成してください。</li>
                    </>
                  )}
                  {lang === 'zh' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">特点:</strong> 将满意的基准角色图重新附带并逐张生成变体时，能稳定保持角色特征的一致性。</li>
                      <li>• 💬 <strong className="text-on-surface">示例:</strong> 先生成基准角色，再制作无文字、专注于丰富表情与动作的单张表情包。</li>
                      <li>• 🎨 <strong className="text-on-surface">建议:</strong> 15格图作为构图草稿，最终成品在15种单张分割中生成。</li>
                    </>
                  )}
                  {lang !== 'ko' && lang !== 'ja' && lang !== 'zh' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">Feature:</strong> Works best when an accepted base image is attached again for one-at-a-time variations.</li>
                      <li>• 💬 <strong className="text-on-surface">Usage:</strong> Create the base character first, then generate individual expression- and action-focused images.</li>
                      <li>• 🎨 <strong className="text-on-surface">Recommended:</strong> Use the 15-panel sheet as a draft and Batch Split for final assets.</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Grok Card */}
              <div className="bg-surface-variant/30 p-4 sm:p-5 rounded-md border border-outline-variant flex flex-col gap-4 hover:shadow-md transition-shadow group relative">
                <div className="font-bold text-[16px] text-on-surface group-hover:text-primary-strong transition-colors">
                  🟣 {getText('grokTitle', {
                    ko: 'Grok (xAI) 이미지 생성 추천',
                    ja: 'Grok (xAI) 画像生成のおすすめ',
                    zh: 'Grok (xAI) 图像生成推荐',
                    en: 'Grok (xAI) Image Generation',
                  })}
                </div>
                <div className="font-black text-[17px] sm:text-[18px] text-primary-strong -mt-3">
                  {getText('grokSub', {
                    ko: '"선명한 2D 벡터와 스티커 질감"',
                    ja: '"鮮明な2Dベクターとステッカー質感"',
                    zh: '"清晰的2D矢量与贴纸质感"',
                    en: '"Crisp 2D vector & sticker texture"',
                  })}
                </div>
                
                <div className="w-full h-48 sm:h-52 rounded-md bg-white border border-outline-variant shadow-sm relative overflow-hidden group">
                  <img src="/grok_real.jpg" alt="Grok Actual Result" className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-1 rounded-md">
                    {getText('actualBadge', {
                      ko: '실제 유저 생성본 ✨',
                      ja: '実際のユーザー作成例 ✨',
                      zh: '真实用户生成范例 ✨',
                      en: 'Actual user creation ✨',
                    })}
                  </div>
                </div>

                <ul className="text-[13px] sm:text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-2 mt-1 break-keep">
                  {lang === 'ko' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">특징:</strong> Flux.1 엔진 기반으로 자연어 지시 이해 및 2D 선화(Linework) 표현력이 우수합니다.</li>
                      <li>• 💬 <strong className="text-on-surface">예시:</strong> 흰색 스티커 테두리(Die-cut)와 깔끔한 메신저 스티커 느낌을 연출하고 싶을 때 적합합니다.</li>
                      <li>• 🎨 <strong className="text-on-surface">장점:</strong> 이미지 글자 표현 및 3x5 그리드 레이아웃 배치를 유연하게 반영합니다.</li>
                    </>
                  )}
                  {lang === 'ja' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">特徴:</strong> Flux.1エンジン搭載で、自然言語理解と鮮明な2D線画表現が優れています。</li>
                      <li>• 💬 <strong className="text-on-surface">例:</strong> 白フチのステッカー加工やメッセンジャースタンプ風の仕上げに最適です。</li>
                      <li>• 🎨 <strong className="text-on-surface">長所:</strong> テキスト描画と3x5グリッドレイアウトの配置に柔軟に対応します。</li>
                    </>
                  )}
                  {lang === 'zh' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">特点:</strong> 基于Flux.1引擎，自然语言理解与2D线条表现极其出色。</li>
                      <li>• 💬 <strong className="text-on-surface">示例:</strong> 强烈推荐制作带白色剪裁边框的高清矢量贴纸。</li>
                      <li>• 🎨 <strong className="text-on-surface">优势:</strong> 灵活支持文字渲染与3x5网格布局排布。</li>
                    </>
                  )}
                  {lang !== 'ko' && lang !== 'ja' && lang !== 'zh' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">Feature:</strong> Powered by Flux.1 for crisp 2D linework and strong prompt fidelity.</li>
                      <li>• 💬 <strong className="text-on-surface">Usage:</strong> Perfect for clean stickers with die-cut white outlines.</li>
                      <li>• 🎨 <strong className="text-on-surface">Strength:</strong> Excellent control over text rendering and 3x5 layout structure.</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Unified Tip Box */}
            <div className="bg-primary/10 text-primary-strong p-3.5 sm:p-4 rounded-md border border-primary/20 mt-2 flex gap-3 items-start shadow-sm overflow-hidden">
              <span className="text-[20px] drop-shadow-sm leading-none mt-0.5 shrink-0">📸</span>
              <div className="min-w-0 flex-1">
                <strong className="font-bold block mb-1 text-[15px]">
                  {getText('tipTitle', {
                    ko: '공용 활용 꿀팁!',
                    ja: '共通活用テクニック！',
                    zh: '通用实用技巧！',
                    en: 'Pro Tip!',
                  })}
                </strong>
                <span className="text-[13px] sm:text-[14px] leading-relaxed opacity-90 break-words block">
                  {getText('tipContent', {
                    ko: '사진을 첨부하면 인물이나 반려동물의 특징을 반영한 캐릭터를 만들 수 있습니다. ChatGPT는 문구가 필요한 이미지에, Gemini는 기준 캐릭터 기반 변형에, Grok은 선명한 2D 스티커 질감 연출에 활용해 보세요.',
                    ja: '写真を添付すると人物やペットの特徴を反映したキャラが作れます。文字が必要な場合はChatGPTを使い、Geminiでは気に入ったベースキャラを作成後、その画像を再添付して1枚ずつバリエーションを生成するのがおすすめです。',
                    zh: '附带照片可为您、孩子或宠物量身定制角色。包含台词时建议使用ChatGPT；使用Gemini时可先生成满意的基准角色，再重新附带该图片逐张生成表情变体。',
                    en: 'Attach a photo to reflect recognizable features. Use ChatGPT when text matters, and with Gemini create a base character first, then attach that accepted result again for one-at-a-time variations.',
                  })}
                </span>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'bg' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col gap-5 mb-6">
              <p className="text-[16px] font-black text-on-surface px-2 tracking-tight">
                {getText('bgSub', {
                  ko: '가장 쉽고 빠르게 이모티콘 배경을 투명하게(누끼) 만드는 방법을 소개합니다!',
                  ja: 'スタンプの背景を簡単に透明化（透過）するおすすめの方法をご紹介します！',
                  zh: '为您介绍最简单快捷的表情包透明背景（抠图）制作方法！',
                  en: 'How to easily and quickly remove backgrounds from your emoticons!',
                })}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PC Guide */}
                <div className="bg-[#FAF9F6] p-4 sm:p-5 rounded-md border border-[#E5E0D8] flex flex-col gap-4">
                  <div className="flex items-center gap-2 font-bold text-[#5C3A21] text-[16px] ml-2">
                    <span className="text-[18px]">💻</span>
                    {getText('pcTitle', {
                      ko: 'PC에서 작업할 때',
                      ja: 'PCで作業する場合',
                      zh: '在电脑 (PC) 上操作',
                      en: 'Working on PC',
                    })}
                  </div>
                  <div className="flex flex-col gap-3 h-full">
                    <div className="bg-white p-4 sm:p-5 rounded-md md:rounded-md border border-[#E5E0D8] shadow-sm flex-1 flex flex-col">
                      <strong className="text-on-surface block mb-2 text-[15px]">
                        {getText('m1Title', {
                          ko: '방법 1: remove.bg 웹사이트',
                          ja: '方法 1: remove.bg ウェブサイト',
                          zh: '方法 1: remove.bg 网站',
                          en: 'Method 1: remove.bg website',
                        })}
                      </strong>
                      <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-1.5 break-keep list-decimal pl-4 mb-3">
                        {lang === 'ko' && (
                          <>
                            <li>인터넷 창을 열고 <strong>remove.bg</strong> 사이트에 접속합니다.</li>
                            <li>AI로 만든 이미지를 화면에 <strong>드래그 앤 드롭</strong> 합니다.</li>
                            <li>약 3초 뒤, AI가 자동으로 배경을 투명하게 날려줍니다.</li>
                            <li>결과물을 확인하고 파란색 <strong>[다운로드]</strong> 버튼을 누릅니다.</li>
                            <li>PC에 투명한 배경의 PNG 캐릭터가 따로 저장됩니다!</li>
                          </>
                        )}
                        {lang === 'ja' && (
                          <>
                            <li>ブラウザを開き、<strong>remove.bg</strong> サイトにアクセスします。</li>
                            <li>AIで作成した画像を画面に<strong>ドラッグ＆ドロップ</strong>します。</li>
                            <li>約3秒でAIが自動的に背景を透明化します。</li>
                            <li>結果を確認し、青い <strong>[ダウンロード]</strong> ボタンを押します。</li>
                            <li>PCに透明背景のPNGキャラクターが保存されます！</li>
                          </>
                        )}
                        {lang === 'zh' && (
                          <>
                            <li>打开浏览器并访问 <strong>remove.bg</strong> 网站。</li>
                            <li>将AI生成的表情包图片<strong>拖拽</strong>到网页中。</li>
                            <li>约3秒后，AI会自动完成透明抠图。</li>
                            <li>确认效果后点击蓝色的 <strong>[下载]</strong> 按钮。</li>
                            <li>电脑上即刻保存透明背景的PNG角色图片！</li>
                          </>
                        )}
                        {lang !== 'ko' && lang !== 'ja' && lang !== 'zh' && (
                          <>
                            <li>Open a browser and visit <strong>remove.bg</strong>.</li>
                            <li><strong>Drag and drop</strong> your AI image onto the screen.</li>
                            <li>After 3 seconds, AI removes the background automatically.</li>
                            <li>Check the result and click the blue <strong>[Download]</strong> button.</li>
                            <li>A transparent PNG is saved on your PC!</li>
                          </>
                        )}
                      </ul>
                      <a href="https://www.remove.bg/" target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 hover:underline font-bold text-[14px] transition-colors inline-flex items-center gap-1 mt-auto">
                        <span>👉</span> {getText('goRemoveBg', { ko: 'remove.bg 바로가기', ja: 'remove.bg へ移動', zh: '前往 remove.bg', en: 'Go to remove.bg' })}
                      </a>
                    </div>
                    <div className="bg-white p-4 sm:p-5 rounded-md md:rounded-md border border-[#E5E0D8] shadow-sm flex-1 flex flex-col">
                      <strong className="text-on-surface block mb-2 text-[15px]">
                        {getText('m2Title', {
                          ko: '방법 2: 이미지 편집 프로그램',
                          ja: '方法 2: 画像編集ソフト',
                          zh: '方法 2: 图片编辑工具',
                          en: 'Method 2: Image Editor Program',
                        })}
                      </strong>
                      <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-1.5 break-keep list-decimal pl-4 mb-3">
                        {lang === 'ko' && (
                          <>
                            <li>무료 이미지 뷰어 <strong>알씨(ALSee)</strong>를 설치하고 엽니다.</li>
                            <li>알씨에서 다운로드 받은 이모티콘 이미지를 엽니다.</li>
                            <li>상단 메뉴에서 <strong>"이미지 편집 ➔ AI 배경 제거"</strong>를 누릅니다.</li>
                            <li>AI가 잠시 분석한 뒤, 배경을 아주 깔끔하게 지워줍니다.</li>
                            <li><strong>[저장]</strong> 버튼을 눌러 PNG 형식으로 저장하면 끝입니다!</li>
                          </>
                        )}
                        {lang === 'ja' && (
                          <>
                            <li>無料の画像編集ソフトまたはペイントツールを開きます。</li>
                            <li>ダウンロードしたスタンプ画像を開きます。</li>
                            <li>メニューから<strong>「背景自動消去」</strong>を選択します。</li>
                            <li>AIが背景を綺麗に削除します。</li>
                            <li><strong>[保存]</strong> を押してPNG形式で保存すれば完了です！</li>
                          </>
                        )}
                        {lang === 'zh' && (
                          <>
                            <li>打开常用免费图片编辑软件。</li>
                            <li>在软件中打开下载好的表情包图片。</li>
                            <li>点击菜单中的 <strong>“AI背景消除”</strong>。</li>
                            <li>AI自动精准识别并清除背景。</li>
                            <li>点击 <strong>[保存]</strong> 为PNG格式即可！</li>
                          </>
                        )}
                        {lang !== 'ko' && lang !== 'ja' && lang !== 'zh' && (
                          <>
                            <li>Install and open an image editor program.</li>
                            <li>Open the downloaded emoticon image.</li>
                            <li>Click <strong>"Image Edit ➔ AI Background Removal"</strong> in the menu.</li>
                            <li>AI analyzes and cleanly removes the background.</li>
                            <li>Click <strong>[Save]</strong> to save as a transparent PNG!</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Mobile Guide */}
                <div className="bg-[#FAF9F6] p-4 sm:p-5 rounded-md border border-[#E5E0D8] flex flex-col gap-4">
                  <div className="flex items-center gap-2 font-bold text-[#5C3A21] text-[16px] ml-2">
                    <span className="text-[18px]">📱</span>
                    {getText('mobileTitle', {
                      ko: '스마트폰에서 작업할 때',
                      ja: 'スマホで作業する場合',
                      zh: '在智能手机上操作',
                      en: 'Working on Smartphone',
                    })}
                  </div>
                  <div className="flex flex-col gap-3 h-full">
                    <div className="bg-white p-4 sm:p-5 rounded-md md:rounded-md border border-[#E5E0D8] shadow-sm flex-1 flex flex-col">
                      <strong className="text-on-surface block mb-2 text-[15px] flex items-center gap-1.5"><span className="text-[16px]">🤖</span> Galaxy</strong>
                      <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-1.5 break-keep list-decimal pl-4">
                        {lang === 'ko' && (
                          <>
                            <li>AI로 만든 이미지를 <strong>기본 갤러리 앱</strong>에서 엽니다.</li>
                            <li>원하는 캐릭터를 손가락으로 <strong>1초 이상 꾹~ 누릅니다.</strong></li>
                            <li>캐릭터 주변만 반짝거리며 배경과 분리됩니다.</li>
                            <li>이때 손을 떼면 나타나는 팝업 메뉴에서 <strong>"이미지로 저장"</strong>을 누릅니다.</li>
                            <li>갤러리에 투명한 배경의 캐릭터가 새롭게 저장됩니다!</li>
                          </>
                        )}
                        {lang === 'ja' && (
                          <>
                            <li>AIで作成した画像を<strong>標準ギャラリーアプリ</strong>で開きます。</li>
                            <li>対象のキャラクターを指で<strong>1秒以上長押し</strong>します。</li>
                            <li>キャラの周りが光り、背景から分離されます。</li>
                            <li>「<strong>画像として保存</strong>」をタップします。</li>
                            <li>ギャラリーに透過PNGとして新しく保存されます！</li>
                          </>
                        )}
                        {lang === 'zh' && (
                          <>
                            <li>在系统自带<strong>相册APP</strong>中打开AI生成的图片。</li>
                            <li>用手指<strong>长按</strong>想要提取的角色1秒以上。</li>
                            <li>主体角色边缘高亮并与背景分离。</li>
                            <li>松开手指在弹出的菜单中点击“<strong>保存为图片</strong>”。</li>
                            <li>相册中即刻生成一张透明背景的PNG文件！</li>
                          </>
                        )}
                        {lang !== 'ko' && lang !== 'ja' && lang !== 'zh' && (
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
                    <div className="bg-white p-4 sm:p-5 rounded-md md:rounded-md border border-[#E5E0D8] shadow-sm flex-1 flex flex-col">
                      <strong className="text-on-surface block mb-2 text-[15px] flex items-center gap-1.5"><span className="text-[16px]">🍎</span> iPhone</strong>
                      <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-1.5 break-keep list-decimal pl-4">
                        {lang === 'ko' && (
                          <>
                            <li>AI로 만든 이미지를 <strong>기본 사진 앱</strong>에서 엽니다.</li>
                            <li>원하는 캐릭터를 손가락으로 <strong>1초 이상 꾹~ 누릅니다.</strong></li>
                            <li>빛이 한 바퀴 돌면서 피사체가 배경과 분리됩니다.</li>
                            <li>손을 떼고 나타나는 메뉴에서 <strong>"공유" ➔ "이미지 저장"</strong>을 누릅니다.</li>
                            <li>사진첩에 배경이 투명한 PNG 파일로 깔끔하게 저장됩니다!</li>
                          </>
                        )}
                        {lang === 'ja' && (
                          <>
                            <li>AI画像を<strong>標準の写真アプリ</strong>で開きます。</li>
                            <li>キャラクターを指で<strong>1秒以上長押し</strong>します。</li>
                            <li>光が走り、対象が背景から切り抜かれます。</li>
                            <li>「<strong>共有</strong>」➔「<strong>画像を保存</strong>」をタップします。</li>
                            <li>写真アプリに透明PNGとして保存されます！</li>
                          </>
                        )}
                        {lang === 'zh' && (
                          <>
                            <li>在系统自带“<strong>照片</strong>”APP中打开AI生成的图片。</li>
                            <li>用手指<strong>长按</strong>目标角色1秒以上。</li>
                            <li>主体四周闪烁光芒并完成自动抠图。</li>
                            <li>松手并在出现的菜单中选择“<strong>分享</strong>”➔“<strong>保存图像</strong>”。</li>
                            <li>相册中即自动存入干净的透明PNG文件！</li>
                          </>
                        )}
                        {lang !== 'ko' && lang !== 'ja' && lang !== 'zh' && (
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
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 bg-[#F4F4F4] p-8 rounded-md border border-[#E5E5E5]">
              
              {/* Step 1 */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-28 h-28 rounded-md bg-[#00FF00] flex items-center justify-center border-4 border-dashed border-primary shadow-sm relative overflow-hidden group hover:scale-105 transition-transform">
                  <span className="text-[56px] relative z-10 drop-shadow-md">🐱</span>
                </div>
                <span className="text-[13px] font-bold text-secondary-strong">
                  {getText('step1Text', {
                    ko: '1. 연두색 배경 AI 이미지',
                    ja: '1. 黄緑色背景のAI画像',
                    zh: '1. 绿色背景AI生成图',
                    en: '1. Green BG AI Image',
                  })}
                </span>
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
                <div className="w-28 h-28 rounded-md bg-white flex flex-col items-center justify-center border-2 border-outline-variant shadow-bubbly relative group hover:scale-105 transition-transform">
                  <div className="absolute -top-3 -right-3 bg-error text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md animate-bounce">{lang === 'ko' ? 'AI 툴' : 'AI Tool'}</div>
                  <span className="font-black text-[16px] text-primary-strong">remove.bg</span>
                  <span className="text-[12px] text-secondary-strong font-bold mt-1">or Mobile APP</span>
                </div>
                <span className="text-[13px] font-bold text-secondary-strong">
                  {getText('step2Text', {
                    ko: '2. 클릭 한 번으로 누끼!',
                    ja: '2. ワンクリックで透過！',
                    zh: '2. 一键轻松抠图！',
                    en: '2. 1-Click Removal!',
                  })}
                </span>
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
                <div className="w-28 h-28 rounded-md flex items-center justify-center border-2 border-outline-variant shadow-sm relative group hover:scale-105 transition-transform" style={{ backgroundImage: 'conic-gradient(#e5e7eb 25%, white 25%, white 50%, #e5e7eb 50%, #e5e7eb 75%, white 75%, white)', backgroundSize: '16px 16px' }}>
                  <span className="text-[64px] drop-shadow-xl z-10">🐱</span>
                </div>
                <span className="text-[13px] font-bold text-secondary-strong">
                  {getText('step3Text', {
                    ko: '3. 완벽한 투명 PNG 완성',
                    ja: '3. 完璧な透明PNGの完成',
                    zh: '3. 完美生成透明PNG',
                    en: '3. Perfect Transparent PNG',
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'template' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-5 mt-2">
            <div className="bg-[#FFF9EE] p-4 sm:p-5 rounded-lg border border-[#FFECA1] flex flex-col gap-2">
              <h3 className="font-headline-sm text-headline-sm text-primary-strong flex items-center gap-2">
                <span>📌</span> {getText('whatIsTitle', {
                  ko: '이모티콘 프롬프트 메이커란?',
                  ja: 'スタンププロンプトメーカーとは？',
                  zh: '什么是表情包提示词生成器？',
                  en: 'What is the Emoticon Prompt Maker?'
                })}
              </h3>
              <p className="text-[14px] sm:text-[15px] leading-relaxed text-on-surface font-medium">
                {getText('whatIsDesc', {
                  ko: '이모티콘 프롬프트 메이커는 사용자의 키워드 선택이나 사진을 바탕으로 ChatGPT(DALL-E 3), Google Gemini(Imagen 3), xAI Grok(Flux.1)에 즉시 사용 가능한 15종 카카오톡·라인 이모티콘 프롬프트를 1초 만에 자동 생성해 주는 무료 웹 도구입니다.',
                  ja: 'スタンププロンプトメーカーは、キーワード選択や写真をもとに、ChatGPT (DALL-E 3)、Google Gemini (Imagen 3)、xAI Grok (Flux.1) で使える15種LINE・KakaoTalkスタンププロンプトを1秒で自動生成する無料Webツールです。',
                  zh: '表情包提示词生成器是一款免费在线工具，根据您选择的关键词或上传的照片，1秒内自动生成适用于 ChatGPT (DALL-E 3)、Google Gemini (Imagen 3) 和 xAI Grok (Flux.1) 的15格全套表情包提示词。',
                  en: 'Emoticon Prompt Maker is a free web tool that instantly generates 15-sticker emoticon prompts for ChatGPT (DALL-E 3), Google Gemini (Imagen 3), and xAI Grok (Flux.1) in 1 second based on your keywords or photos.'
                })}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-[16px] text-on-surface flex items-center gap-2">
                <span>💡</span> {getText('templateHeader', {
                  ko: 'AI 이모티콘 프롬프트 작성을 위한 필수 4단계 템플릿',
                  ja: 'AIスタンププロンプト作成のための必須4ステップテンプレート',
                  zh: 'AI表情包提示词编写必备的4步黄金模板',
                  en: '4-Step Essential Prompt Template for AI Emoticons'
                })}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px] sm:text-[14px]">
                <div className="bg-white p-4 rounded-md border border-outline-variant flex flex-col gap-1.5 shadow-2xs">
                  <span className="font-bold text-emerald-800">
                    {getText('tplStep1Title', {
                      ko: '1. 핵심 스타일 (Core Style)',
                      ja: '1. コアスタイル (Core Style)',
                      zh: '1. 核心画风 (Core Style)',
                      en: '1. Core Style'
                    })}
                  </span>
                  <p className="text-on-surface-variant font-mono text-[12px] bg-slate-50 p-2 rounded border border-slate-200">
                    Cute vector emoticon, kawaii 2D sticker, clean bold outline, flat color
                  </p>
                  <span className="text-[12px] text-slate-600">
                    {getText('tplStep1Desc', {
                      ko: '이모티콘 특유의 깔끔한 2D 그래픽 질감을 선언합니다.',
                      ja: 'スタンプ特有のクッキリとした2Dグラフィックスタイルを宣言します。',
                      zh: '确立表情包特有的清晰2D矢量贴纸图形质感。',
                      en: 'Declares the clean, vibrant 2D graphic sticker texture.'
                    })}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-md border border-outline-variant flex flex-col gap-1.5 shadow-2xs">
                  <span className="font-bold text-emerald-800">
                    {getText('tplStep2Title', {
                      ko: '2. 캐릭터 묘사 (Subject & Trait)',
                      ja: '2. キャラクター描写 (Subject & Trait)',
                      zh: '2. 角色特征描述 (Subject & Trait)',
                      en: '2. Character Description (Subject & Trait)'
                    })}
                  </span>
                  <p className="text-on-surface-variant font-mono text-[12px] bg-slate-50 p-2 rounded border border-slate-200">
                    A chubby cute yellow cat, expressive eyes, wearing casual hoodie
                  </p>
                  <span className="text-[12px] text-slate-600">
                    {getText('tplStep2Desc', {
                      ko: '외형, 성격, 의상, 소품 등 고유 특징을 구체화합니다.',
                      ja: '外見、性格、服装、小道具などの固有の特徴を具体化します。',
                      zh: '具体化外观、性格、服装、配饰等独特特征。',
                      en: 'Specifies key details like appearance, personality, outfit, and props.'
                    })}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-md border border-outline-variant flex flex-col gap-1.5 shadow-2xs">
                  <span className="font-bold text-emerald-800">
                    {getText('tplStep3Title', {
                      ko: '3. 15종 감정 및 포즈 그리드 (15 Grid Matrix)',
                      ja: '3. 15種感情・ポーズグリッド (15 Grid Matrix)',
                      zh: '3. 15格表情与动作矩阵 (15 Grid Matrix)',
                      en: '3. 15-Emotion & Pose Grid (15 Grid Matrix)'
                    })}
                  </span>
                  <p className="text-on-surface-variant font-mono text-[12px] bg-slate-50 p-2 rounded border border-slate-200">
                    5x3 grid sheet: 1. happy thumbs up, 2. crying tears, 3. laughing loud...
                  </p>
                  <span className="text-[12px] text-slate-600">
                    {getText('tplStep3Desc', {
                      ko: '인기 대화 상황별 15개 감정을 5x3 행렬로 배치합니다.',
                      ja: '日常会話でよく使われる15種類の感情を5×3のシート行列で配置します。',
                      zh: '按5x3矩阵整齐排列日常聊天中最常用的15种核心情绪动作。',
                      en: 'Arranges 15 daily chat emotions into a cohesive 5x3 sheet matrix.'
                    })}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-md border border-outline-variant flex flex-col gap-1.5 shadow-2xs">
                  <span className="font-bold text-emerald-800">
                    {getText('tplStep4Title', {
                      ko: '4. 배경 및 다이컷 분리 (Isolation & Die-cut)',
                      ja: '4. 背景＆ダイカット分離 (Isolation & Die-cut)',
                      zh: '4. 背景与白边裁切 (Isolation & Die-cut)',
                      en: '4. Background & Die-cut Border (Isolation & Die-cut)'
                    })}
                  </span>
                  <p className="text-on-surface-variant font-mono text-[12px] bg-slate-50 p-2 rounded border border-slate-200">
                    Solid white background, isolated stickers, white die-cut border, no overlap
                  </p>
                  <span className="text-[12px] text-slate-600">
                    {getText('tplStep4Desc', {
                      ko: '누끼(배경 투명화) 제거가 가장 쉬운 단색 배경을 잠급니다.',
                      ja: '背景透過（切り抜き）が最も簡単な単色背景と白フチを指定します。',
                      zh: '锁定便于一键抠图透明化的纯白单色背景与白色剪裁外边框。',
                      en: 'Locks a solid background with white die-cut borders for easy background removal.'
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-mint-soft/80 p-4 rounded-lg border border-mint-border text-[13px] text-mint-strong font-medium leading-relaxed">
              <strong className="font-bold text-mint-strong block mb-1">
                {getText('optStandardTitle', {
                  ko: '🚀 AI 엔진별 특화 & 메신저 스티커 최적화:',
                  ja: '🚀 AIエンジン特性＆メッセンジャースタンプ最適化:',
                  zh: '🚀 AI引擎特性与聊天表情贴纸深度优化:',
                  en: '🚀 AI Engines & Messenger Sticker Optimization:'
                })}
              </strong>
              {getText('optStandardDesc', {
                ko: '본 사이트는 ChatGPT(DALL-E 3), Google Gemini(Imagen 3), xAI Grok(Flux.1) 각 엔진의 특화 파라미터와 메신저 대화 및 개인용 커스텀 스티커, 캐릭터 창작 시트에 최적화된 고품질 프롬프트를 자동으로 조립하여 제공합니다.',
                ja: '当サイトは ChatGPT (DALL-E 3)、Google Gemini (Imagen 3)、xAI Grok (Flux.1) の各エンジン特性と、メッセンジャー会話や個人用カスタムスタンプ、キャラクター創作シートに最適なプロンプトを自動生成して提供します。',
                zh: '本网站自动生成完全适配 ChatGPT (DALL-E 3)、Google Gemini (Imagen 3) 和 xAI Grok (Flux.1) 各引擎特性，适用于日常聊天、专属个人贴纸以及角色创意设计的专业提示词。',
                en: 'This service automatically generates high-quality prompts optimized for the specialized parameters of ChatGPT (DALL-E 3), Google Gemini (Imagen 3), and xAI Grok (Flux.1), perfect for messenger chats, personal custom stickers, and creative character design.'
              })}
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col gap-5 mb-6">
              <p className="text-[16px] font-black text-on-surface px-2 tracking-tight">
                {getText('usageSub', {
                  ko: '만드신 이미지를 실제 카카오톡에서 사용하는 두 가지 방법을 소개합니다!',
                  ja: '作成した画像を実際のメッセンジャー（LINE・KakaoTalk等）で使う2つの方法をご紹介します！',
                  zh: '为您介绍将生成的图片用于微信/QQ/Line/KakaoTalk的两种使用方式！',
                  en: 'Two ways to actually use your created images in KakaoTalk!',
                })}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Method 1: Official */}
                <div className="bg-[#FAF9F6] p-4 sm:p-5 rounded-md border border-[#E5E0D8] flex flex-col gap-4">
                  <div className="flex items-center gap-2 font-bold text-[#5C3A21] text-[16px] ml-2">
                    <span className="text-[18px]">💰</span>
                    {getText('officialTitle', {
                      ko: '1. 정식 출시 및 판매를 원할 때',
                      ja: '1. 公式スタンプとして販売・出品したい場合',
                      zh: '1. 作为官方表情包上架与销售',
                      en: '1. Official Release and Sale',
                    })}
                  </div>
                  <div className="bg-white p-4 sm:p-5 rounded-md md:rounded-md border border-[#E5E0D8] shadow-sm flex-1 flex flex-col gap-3">
                    <strong className="text-on-surface block text-[15px]">
                      {getText('studioTitle', {
                        ko: '카카오 이모티콘 스튜디오 제안',
                        ja: 'クリエイターズマーケットへの申請',
                        zh: '开放平台/创作平台提交',
                        en: 'Kakao Emoticon Studio Submission',
                      })}
                    </strong>
                    
                    {/* AI Policy Warning Box */}
                    <div className="bg-[#FFF5F5] text-[#D32F2F] p-3.5 sm:p-4 rounded-md border border-[#FFCDD2] my-1">
                      <div className="mb-2">
                        <span className="inline-flex items-center gap-1 bg-[#D32F2F] text-white text-[12px] font-bold px-2 py-0.5 rounded-md mb-1.5">
                          <span className="text-[12px] leading-none">⚠️</span>
                          {getText('warnBadge', { ko: '주의', ja: 'ご注意', zh: '注意事项', en: 'Warning' })}
                        </span>
                        <strong className="block text-[15px] font-black tracking-tight">
                          {getText('warnTitle', {
                            ko: 'AI 이미지는 그대로 등록 불가!',
                            ja: 'AI画像のそのままの申請は不可！',
                            zh: 'AI生成原图不可直接提交！',
                            en: 'Cannot Submit AI Images As-Is!',
                          })}
                        </strong>
                      </div>
                      <p className="text-[13px] leading-[1.6] break-keep opacity-90">
                        {lang === 'ko' && (
                          <>
                            현재 카카오 정책상 저작권 문제로 인해 <strong>AI가 생성한 이미지를 '그대로' 제출하는 것은 엄격히 금지</strong>되어 있습니다.<br/>
                            AI는 기발한 대사와 포즈를 뽑는 <strong>최고의 '참고용 시안'</strong>으로 활용하시고, 정식 제출은 그 시안을 바탕으로 <strong>직접 선을 따서 다시 그려서(리디자인)</strong> 제출하셔야 합니다.
                          </>
                        )}
                        {lang === 'ja' && (
                          <>
                            現在の各プラットフォームのポリシー上、<strong>AI生成画像を「そのまま」提出することは禁止</strong>されています。<br/>
                            AIは構図やポーズを得る<strong>「下書きデザイン」</strong>として活用し、申請時はそれを元に<strong>自分でトレース・描き直して（リデザイン）</strong>ご提出ください。
                          </>
                        )}
                        {lang === 'zh' && (
                          <>
                            根据目前各大平台规定，<strong>禁止直接提交未经修改的AI原图</strong>。<br/>
                            请将AI作为获取台词与姿势的<strong>“优质设计草稿”</strong>，正式提交时需根据草稿由人工<strong>重新描线绘制 (重新设计)</strong> 后提交。
                          </>
                        )}
                        {lang !== 'ko' && lang !== 'ja' && lang !== 'zh' && (
                          <>
                            Due to copyright policy, <strong>submitting AI-generated images "as-is" is strictly prohibited.</strong><br/>
                            Use AI as an excellent <strong>"reference draft"</strong>, and for official submission, you must <strong>trace and redraw (redesign) them yourself</strong>.
                          </>
                        )}
                      </p>
                    </div>

                    <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-2 break-keep list-disc pl-5 mb-2">
                      {lang === 'ko' && (
                        <>
                          <li><strong>이미지 준비:</strong> '직접 리디자인한' 360x360px 투명 배경 PNG 이미지 32종 준비</li>
                          <li><strong>제안하기:</strong> 스튜디오 사이트에 접속하여 준비한 이미지를 업로드</li>
                          <li><strong>심사 대기:</strong> 내부 심사 통과 시 정식 상품으로 출시되어 수익 창출 가능!</li>
                        </>
                      )}
                      {lang === 'ja' && (
                        <>
                          <li><strong>画像準備:</strong> 「自分で描き直した」透明背景PNGを用意</li>
                          <li><strong>申請:</strong> クリエイターズサイトにアクセスして画像をアップロード</li>
                          <li><strong>審査待ち:</strong> 審査通過後、公式スタンプとして販売され収益化が可能！</li>
                        </>
                      )}
                      {lang === 'zh' && (
                        <>
                          <li><strong>准备图片:</strong> 准备好“人工重新绘制”的透明背景PNG格式图片</li>
                          <li><strong>提交审核:</strong> 登录开放平台/创作平台上传准备好的表情包</li>
                          <li><strong>等待审核:</strong> 审核通过后即可成为官方表情包并获得收益！</li>
                        </>
                      )}
                      {lang !== 'ko' && lang !== 'ja' && lang !== 'zh' && (
                        <>
                          <li><strong>Prepare Images:</strong> Prepare 32 'redrawn' transparent PNG images.</li>
                          <li><strong>Submit:</strong> Upload your prepared images to the Studio website.</li>
                          <li><strong>Wait for Review:</strong> If approved, it becomes an official product!</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Method 2: Personal */}
                <div className="bg-[#FAF9F6] p-4 sm:p-5 rounded-md border border-[#E5E0D8] flex flex-col gap-4">
                  <div className="flex items-center gap-2 font-bold text-[#5C3A21] text-[16px] ml-2">
                    <span className="text-[18px]">✨</span>
                    {getText('personalTitle', {
                      ko: '2. 지인들과 가볍게 무료로 쓸 때',
                      ja: '2. 友達とチャットで無料・気軽に使う場合',
                      zh: '2. 与亲友免费在聊天中随心使用',
                      en: '2. Casual Free Use with Friends',
                    })}
                  </div>
                  <div className="bg-white p-4 sm:p-5 rounded-md md:rounded-md border border-[#E5E0D8] shadow-sm flex-1 flex flex-col gap-3">
                    <strong className="text-on-surface block mb-1 text-[15px]">
                      {getText('chatTrickTitle', {
                        ko: '개인 소장용 (채팅방 활용법)',
                        ja: '個人使用（トーク画面での活用法）',
                        zh: '个人收藏 (聊天界面使用技巧)',
                        en: 'Personal Use (Chatroom Trick)',
                      })}
                    </strong>
                    
                    {/* Visual Example Image */}
                    <div className="w-full h-40 rounded-md overflow-hidden border border-[#E5E0D8] my-1 shadow-sm relative group">
                      <img src="/chat_trick.jpg" alt="채팅방 전송 예시" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[#5C3A21] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <span>📸</span> {getText('exBadge', { ko: '전송 예시', ja: '送信例', zh: '发送示例', en: 'Example' })}
                      </div>
                    </div>

                    <ul className="text-[14px] leading-relaxed text-secondary-strong flex flex-col gap-2 break-keep list-decimal pl-5">
                      {lang === 'ko' && (
                        <>
                          <li>위의 [배경(누끼) 제거] 가이드에 따라 <strong>투명 배경으로 만든 PNG 파일</strong>을 스마트폰 갤러리에 저장합니다.</li>
                          <li>카카오톡 채팅방에서 입력창 옆의 <strong>[+] 버튼 ➔ [앨범]</strong>을 누릅니다.</li>
                          <li>갤러리에서 투명하게 만든 캐릭터 이미지를 선택하여 전송합니다.</li>
                        </>
                      )}
                      {lang === 'ja' && (
                        <>
                          <li>上の [背景の消し方] ガイドに従い、<strong>透過背景にしたPNGファイル</strong>をスマホのアルバムに保存します。</li>
                          <li>トーク画面の入力欄横の <strong>[+] ボタン ➔ [写真/アルバム]</strong> をタップします。</li>
                          <li>アルバムから透明背景のキャラ画像を選択して送信します。</li>
                        </>
                      )}
                      {lang === 'zh' && (
                        <>
                          <li>根据上方抠图指南，将<strong>透明背景PNG图片</strong>保存至手机相册。</li>
                          <li>在聊天界面点击输入框旁边的 <strong>[+] 按钮 ➔ [相册/图片]</strong>。</li>
                          <li>选择相册中透明背景的角色图片直接发送。</li>
                        </>
                      )}
                      {lang !== 'ko' && lang !== 'ja' && lang !== 'zh' && (
                        <>
                          <li>Save the <strong>transparent background PNG file</strong> to your smartphone gallery using the background removal guide above.</li>
                          <li>In a chatroom, tap the <strong>[+] button ➔ [Album]</strong> next to the input field.</li>
                          <li>Select and send the transparent character image from your gallery.</li>
                        </>
                      )}
                    </ul>
                    <div className="mt-auto bg-primary/10 text-primary-strong font-bold text-[13px] p-3 rounded-md flex items-start gap-2 leading-relaxed">
                      <span className="text-[16px] leading-none mt-0.5">💡</span>
                      {getText('chatTip', {
                        ko: '배경이 투명하기 때문에 하얀색 네모 테두리가 보이지 않아, 진짜로 구매한 스티커처럼 대화창에 아주 깔끔하게 올라갑니다!',
                        ja: '背景が透明なので白い枠が表示されず、まるで本物のスタンプのようにチャット画面にとても綺麗に送信されます！',
                        zh: '由于背景透明无白边，发在聊天界面效果非常干净自然，就像购买的官方表情包一样！',
                        en: 'Because the background is transparent, the white rectangular border is invisible, making it look exactly like a real purchased sticker in the chat window!',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

const PHRASE_ACTION_MAP_KO = {
  // 일상 / 인사
  'ㅋㅋㅋㅋ': '바닥에 비스듬히 누워 배를 잡고 빵 터져 웃는 모습 (bent over laughing hard on floor)',
  '안녕!': '한 손은 주머니에 넣고 다른 한 손을 들어 인사하는 모습 (one hand in pocket waving other hand)',
  '오늘도 화이팅': '한쪽 주먹을 위로 쥐며 윙크하고 파이팅을 외치는 포즈 (one fist up winking determined)',
  '좋아요': '밝게 미소지으며 엄지척을 하는 포즈와 따봉 아이콘 (thumbs up with smile)',
  '고마워요': '정중하게 90도로 고개 숙여 깊이 감사 인사하는 모습 (polite 90-degree bow of gratitude)',
  '사랑해요': '바닥에 앉아 분홍색 하트 쿠션을 품에 꼭 끌어안고 미소짓는 모습 (sitting hugging pink heart pillow)',
  '최고!': '팔짱을 끼고 당당하고 멋지게 미소짓는 포즈와 황금 왕관 (arms crossed confident with golden crown)',
  '오예': '한쪽 주먹을 번쩍 들고 신나게 점프하며 환호하는 포즈 (jumping celebrating with raised fist)',
  '미안해요': '두 손을 모으고 고개 숙여 진심으로 사과하는 모습과 땀방울 (bowing apologetic with sweat drops)',
  '수고했어요': '풍성한 노란 꽃다발을 들고 따뜻하게 건네는 모습 (holding flower bouquet)',
  '축하해요': '파티 폭죽을 쏘며 꽃가루와 리본이 화려하게 날리는 환호 포즈 (shooting party popper with confetti ribbons)',
  '대박': '양손으로 볼을 감싸며 크게 입을 벌리고 감탄하는 포즈와 반짝이 (hands on cheeks amazed with sparkles)',
  '헐': '양손으로 머리를 감싸쥐고 눈과 입이 떡 벌어져 충격받은 표정과 식은땀 (holding head shocked with sweat drops)',
  '감동': '무릎을 꿇고 두 손 모아 기도하듯 감격하여 눈물 한 줄기를 흘리는 표정 (kneeling hands together touched with tear stream)',
  '잘자요': '하얀 베개를 품에 껴안고 웅크려 곤히 잠든 모습과 zZ 기호 (sleeping hugging white pillow with zZ)',

  // 직장인
  '네!': '차렷 자세로 또렷하게 대답하는 직장인 포즈 (standing straight acknowledging)',
  '알겠습니다': '고개를 끄덕이며 서류판에 메모하는 포즈 (nodding while taking notes)',
  '수정 부탁드립니다': '모니터를 가리키며 진지하게 요청하는 포즈 (pointing to screen requesting edit)',
  '감사합니다': '고개 숙여 깍듯하게 인사하는 직장인 (polite bow of gratitude)',
  '퇴근!': '가방을 챙겨 신나게 가벼운 발걸음으로 달려 나가는 포즈 (running out joyful after work)',
  '회의 중': '입에 손가락을 대고 슉 安静히 회의하는 모습 (finger on lips in meeting)',
  '파일 첨부합니다': '이메일 수신 아이콘을 내미는 포즈 (presenting email attachment)',
  '맛점하세요': '숟가락과 젓가락을 들고 식사 준비하는 모습 (holding spoon and chopsticks excited for lunch)',
  '화이팅!': '커피 잔을 들고 피로를 이겨내며 에너지를 내는 포즈 (holding coffee cup cheering)',
  '죄송합니다': '식은땀을 흘리며 두 손 모아 진심으로 사과하는 모습 (sweating and bowing in apology)',
  '일정 확인해주세요': '달력을 가리키며 검토를 요청하는 포즈 (pointing to calendar)',
  '수고하셨습니다': '따뜻한 음료를 내밀며 격려하는 모습 (offering warm drink)',
  '먼저 퇴근하겠습니다': '살금살금 가방 들고 퇴근길에 오르는 모습 (sneaking out happily)',
  '확인했습니다': 'OK 손가락 포즈를 취하며 미소짓는 모습 (OK hand sign with confident smile)',
  '검토 부탁드립니다': '서류 봉투를 양 손으로 정중히 건네는 모습 (handing over documents for review)',
  '연차 씁니다': '선글라스를 끼고 튜브를 든 휴가 모드 (wearing sunglasses with swim ring)',
  '휴가 다녀오겠습니다': '캐리어를 끌고 신나게 손을 흔드는 포즈 (pulling suitcase waving goodbye)',
  '메일 확인 부탁드립니다': '편지 봉투를 가리키며 밝게 웃는 모습 (pointing to email envelope)',
  '참고 부탁드립니다': '메모지 포스트잇을 붙이는 모습 (sticking reference sticky note)',
  '일정 변경 가능할까요?': '달력 시계를 가리키며 미안한 표정 (pointing to clock calendar apologetically)',
  '결재 부탁드립니다': '결재 서류판을 펜과 함께 정중히 올리는 포즈 (offering approval board with pen)',
  '공지 확인해주세요': '확성기를 들고 크게 알리는 포즈 (holding megaphone announcing)',
  '지옥철 탑승': '사람들에 끼여 지친 표정으로 손잡이를 잡은 포즈 (squeezed in crowded subway holding handle)',
  '야근 확정': '다크서클 짙게 모니터 불빛 앞에 앉은 포즈 (sitting in dark with dark circles at monitor)',
  '커피 시급': '빈 커피 컵을 들고 영혼이 나간 표정 (holding empty coffee cup soul leaving body)',
  '팀회식': '건배 잔을 들고 신나게 웃는 포즈 (raising toast glass at team dinner)',
  '칼퇴 기원': '시계를 간절하게 바라보며 기도하는 포즈 (praying eagerly looking at clock)',
  '버티는 중': '머리에 띠를 두르고 꿋꿋하게 견디는 포즈 (headband on standing tough)',
  '공유합니다': '차트를 가리키며 브리핑하는 포즈 (pointing to presentation chart)',
  '수정 완료했습니다': '완료 체크표시 피켓을 들고 자랑스러워하는 포즈 (holding completion check sign)',

  // 주식 / 재테크
  '떡상!': '양 손을 들고 녹색/빨간 상승 화살표를 타며 점프하는 포즈 (riding green rocket chart up)',
  '구조대 언제 옴?': '망원경을 들고 먼 곳을 바라보며 기다리는 모습 (looking through binoculars waiting)',
  '익절!': '돈다발을 들고 행복하게 미소짓는 포즈 (holding cash fan smiling happily)',
  '손절': '눈물을 흘리며 빨간 하트를 반으로 쪼개는 모습 (tears dropping with broken heart)',
  '월급 증발': '지갑을 탈탈 털어 먼지만 날리는 포즈 (shaking empty wallet dust flying)',
  '영끌 투입': '모든 자산을 기운 차게 쏟아붓는 포즈 (throwing all in enthusiastically)',
  '존버는 승리한다': '돌처럼 튼튼하게 땅에 굳건히 서서 견디는 포즈 (standing firm like stone endurance)',
  '원금 회복': '만세를 부르며 감격의 눈물을 흘리는 포즈 (cheering with emotional tears of relief)',
  '물렸다': '밧줄에 꽁꽁 묶여 억울한 표정을 짓는 포즈 (tied with rope trapped look)',
  '매수 완료': '장바구니에 주식을 담고 클릭하는 포즈 (clicking buy order button proudly)',
  '양봉이다!': '빨간 촛불 캔들을 들고 춤추는 포즈 (dancing holding red candlestick chart)',
  '음봉 눈물': '파란 촛불 캔들 아래 웅크려 울고 있는 포즈 (crouching under blue candlestick crying)',
  '상한가 릴레이': '트로피를 들고 신나게 달리는 포즈 (running joyfully holding trophy)',
  '폭락장 경악': '머리를 감싸쥐고 그래프 하락에 놀라는 포즈 (holding head shocked at falling line)',
  '계좌 녹는 중': '얼음처럼 스르륵 녹아내리는 계좌 캐릭터 (character melting like ice)',

  // 음식 / 다이어트
  '배고파': '배를 움켜쥐고 꼬르륵 소리가 나는 포즈 (holding tummy with hungry sound effect)',
  '오늘 뭐 먹지?': '턱을 괴고 음식 메뉴판을 고민하는 모습 (chin on hand pondering food menu)',
  '치킨?': '튀긴 닭다리를 들고 입을 쩍 벌린 모습 (holding fried chicken drumstick mouth open)',
  '다이어트는 내일부터': '햄버거와 피자를 양손에 들고 행복해하는 모습 (holding burger and pizza happily)',
  '당 충전': '마카롱과 케이크를 먹으며 눈이 반짝이는 포즈 (eating macaron cake eyes sparkling)',
  '야식 타임': '야식 족발/라면 그릇을 들고 밤에 웃는 모습 (holding night snack noodles smiling at night)',
  '맛집 발견!': '입에 침을 흘리며 검지 손가락을 세운 포즈 (drooling holding fork enthusiast)',
  '배부르다': '배가 빵빵해져서 배를 두드리며 누운 모습 (pattin big full belly lying down)',
  '잘 먹겠습니다': '식사 도구를 들고 모자/턱받이 쓴 모습 (holding fork knife ready to eat)',
  '소화불량': '배를 문지르며 사이다 캔을 든 모습 (rubbing stomach holding soda can)',
  '물 섭취 중': '물병을 마시며 수분 충전하는 모습 (drinking from water bottle)',
  '오운완': '운동복 차림으로 아령을 들고 근육을 자랑하는 포즈 (holding dumbbell showing muscle in gym wear)',
  '샐러드 냠냠': '풀을 먹으며 살짝 씁쓸하게 웃는 모습 (eating salad smiling faintly)',
  '먹방 스타트': '방송 카메라 앞에서 먹을 준비 완료한 포즈 (setting up food mukbang camera)',
  '탄수화물 최고': '갓 구운 빵을 안고 감동받은 모습 (hugging fresh warm bread teary eyed)',

  // 분노 / 짜증
  '아 진짜': '이마를 짚고 깊은 한숨을 쉬는 포즈 (hand on forehead deep sigh)',
  '선 넘네': '레드카드를 들어 올리며 정색하는 모습 (holding up red card serious face)',
  '말이야 방구야': '귀를 막고 어이없다는 표정을 짓는 포즈 (covering ears dumbfounded expression)',
  '어이없음': '팔짱을 끼고 고개를 갸웃거리는 포즈 (arms crossed tilting head in disbelief)',
  '빡침': '머리 위에서 불꽃 폭발 연기가 피어오르는 모습 (fire fumes exploding from head)',
  '극발노': '얼굴이 붉어지며 주먹을 떨고 있는 모습 (face turning red shaking fists in anger)',
  '참을 인 100개': '참을 인(忍) 자 피켓을 들고 이 악물고 버티는 포즈 (holding patience sign gritting teeth)',
  '혈압 상승': '목을 잡고 뒷목 당겨하는 모습 (holding back of neck high blood pressure)',
  '스트레스': '머리를 쥐어뜯으며 괴로워하는 포즈 (pulling hair distressed)',
  '진정하자': '심호흡하며 손을 내리누르는 모습 (taking deep breath pressing hands down)',
  '건들지 마라': '접근 금지 표지판을 내미는 포즈 (holding keep out warning sign)',
  '떽!': '검지 손가락을 휘두르며 호통치는 포즈 (shaking index finger sternly)',

  // 축하 / 응원
  '생일 축하해': '생일 케이크를 들고 고깔모자 쓰고 웃는 모습 (holding birthday cake wearing party hat)',
  '꽃길만 걷자': '꽃가루가 휘날리는 꽃길을 걸어가는 모습 (walking on flower path with petals falling)',
  '잘했어!': '어깨를 톡톡 두드려주며 칭찬하는 포즈 (patting shoulder praising warmly)',
  '다 잘될 거야': '따뜻하게 감싸 안아주며 미소짓는 모습 (warm hug smiling reassuringly)',
  '대박나세요': '복주머니와 황금 동전을 뿌리는 포즈 (throwing fortune pouch and gold coins)',
  '응원할게': '응원 수술 파폼을 들고 신나게 춤추는 포즈 (shaking cheer pom-poms dancing)',
  '최고의 날': '트로피와 면류관을 쓰고 환호하는 포즈 (wearing crown holding trophy cheering)',
  '자랑스러워': '엄지 두 개를 동시에 세우며 감격해하는 포즈 (double thumbs up proud face)',
  '파티 타임': '샴페인 폭죽을 터뜨리며 즐거워하는 모습 (popping champagne bottle partying)',
};

const PHRASE_ACTION_MAP_EN = {
  // English mappings correspond to Korean actions
  'ㅋㅋㅋㅋ': 'bent over laughing hard',
  '안녕!': 'waving one arm high',
  '오늘도 화이팅': 'fists clenched, determined',
  '좋아요': 'thumbs up',
  '고마워요': 'hands together bowing',
  '사랑해요': 'heart hands + small heart',
  '최고!': 'jumping both arms up',
  '오예': 'jumping one fist up',
  '미안해요': 'apologetic bow',
  '수고했어요': 'sitting tired + star bubble',
  '축하해요': 'clapping + confetti',
  '대박': 'hands on cheeks shocked',
  '헐': 'hand over mouth surprised',
  '감동': 'hands on chest teary + hearts',
  '잘자요': 'lying on pillow sleeping + Zzz',
  'Yes sir!': 'standing straight acknowledging boss',
  'Understood': 'nodding taking notes',
  'Leaving work': 'running out joyful after work',
  'In a meeting': 'finger on lips in meeting',
  'Fighting!': 'holding coffee cup cheering',
  'To the moon!': 'riding green rocket chart up',
  'Hungry': 'holding tummy with hungry sound effect',
  'Chicken?': 'holding fried chicken drumstick mouth open',
  'Angry': 'fire fumes exploding from head',
  'Happy Birthday': 'holding birthday cake wearing party hat',
  'Cheer up': 'shaking cheer pom-poms dancing',
};

const getEmotionTextColorGuideKo = (phrases) => {
  const palette = [
    '노란색', '분홍색', '빨간색', '핑크색', '민트색',
    '빨간색', '주황색', '보라색', '하늘색', '노란색',
    '분홍색', '빨간색', '보라색', '분홍색', '남색'
  ];
  const items = (phrases || []).map((p, i) => `${(p || '').trim()}→${palette[i % palette.length]}`).join(', ');
  return `각 문구의 글자 색상을 감정에 맞춰 다르게 지정하세요: ${items}. 모든 글자에 흰색 외곽선(stroke)을 두껍게 넣어 깔끔한 2D 스티커 텍스트로 또렷하게 표현하세요.`;
};

const getEmotionTextColorGuideEn = (phrases) => {
  const palette = [
    'Bright Yellow', 'Soft Pink', 'Vibrant Red', 'Cute Pink', 'Fresh Mint',
    'Passion Red', 'Energetic Orange', 'Vivid Purple', 'Sky Blue', 'Bright Yellow',
    'Warm Pink', 'Crimson Red', 'Deep Purple', 'Soft Pink', 'Deep Navy'
  ];
  const items = (phrases || []).map((p, i) => `"${(p || '').trim()}" -> ${palette[i % palette.length]}`).join(', ');
  return `Vary text color per phrase according to emotion: ${items}. Add a thick white outline stroke around every text to create a clean, bold 2D sticker lettering appearance.`;
};

const getPhraseActionKo = (phrase) => {
  const p = (phrase || '').trim();
  return PHRASE_ACTION_MAP_KO[p] || `${p} 맥락에 맞는 독창적인 전신 동작`;
};

const getPhraseActionEn = (phrase) => {
  const p = (phrase || '').trim();
  return PHRASE_ACTION_MAP_EN[p] || `unique expressive full-body posture matching ${p}`;
};

function App() {
  const [lang, setLang] = useState('ko');

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang === 'ja' ? 'ja' : lang === 'ko' ? 'ko' : 'en';
    if (lang === 'zh') {
      document.body.classList.add('lang-zh');
    } else {
      document.body.classList.remove('lang-zh');
    }
  }, [lang]);
  const t = I18N[lang] || I18N.ko;
  
  const getThemesByLang = (l) => {
    if (l === 'ja') return THEMES_JA;
    if (l === 'zh') return THEMES_ZH;
    if (l === 'en') return THEMES_EN;
    return THEMES_KO;
  };

  const getTagsByLang = (l) => {
    if (l === 'ja') return CHARACTER_TAGS_JA;
    if (l === 'zh') return CHARACTER_TAGS_ZH;
    if (l === 'en') return CHARACTER_TAGS_EN;
    return CHARACTER_TAGS_KO;
  };

  const currentThemes = getThemesByLang(lang);
  const currentTags = getTagsByLang(lang);
  const themeKeys = Object.keys(currentThemes);
  const categoryKeys = Object.keys(currentTags);
  
  const [charManual, setCharManual] = useState('');
  const [characterSource, setCharacterSource] = useState('direct');
  const [photoReferenceMode, setPhotoReferenceMode] = useState('exact');
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
  const [geminiBackgroundMode, setGeminiBackgroundMode] = useState('transparent');
  const [grokTextMode, setGrokTextMode] = useState('visual');
  const [toastMessage, setToastMessage] = useState('');

  const getCategoryRuleBadge = (category) => {
    const isArtStyle = category === '🖌️ 화풍' || category === '🖌️ Art Style';
    const isSubject = [
      '🐱 동물', '👦 인물', '🦄 판타지/사물', '🤖 로봇/SF', '🍞 디저트/음식', '🌿 식물/자연',
      '🐱 Animal', '👦 Person', '🦄 Fantasy/Object', '🤖 Robot/Sci-Fi', '🍞 Dessert/Food', '🌿 Plant/Nature'
    ].includes(category);

    if (isArtStyle) return lang === 'ko' ? '🎨 1개 선택' : '🎨 Single Select';
    if (isSubject) return lang === 'ko' ? '👤 1종류 선택' : '👤 1 Subject';
    return lang === 'ko' ? '✨ 다중 선택 가능' : '✨ Multi-Select';
  };

  const isTagSelected = (tag) => {
    if (!charManual || !tag) return false;
    const target = tag.trim().toLowerCase();
    const currentList = charManual.split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
    return currentList.includes(target);
  };

  const removeSelectedTag = (tagToRemove) => {
    setCharManual(prev => {
      const currentTags = prev.split(',').map(v => v.trim()).filter(Boolean);
      return currentTags.filter(t => t !== tagToRemove).join(', ');
    });
    showToast(lang === 'ko' ? `태그 삭제됨: [${tagToRemove}]` : `Tag removed: [${tagToRemove}]`);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? '' : prev);
    }, 3000);
  };
  const [grokBackgroundMode, setGrokBackgroundMode] = useState('transparent');

  const changeLanguage = (newLang) => {
    if (newLang === lang) return;
    const oldThemes = getThemesByLang(lang);
    const oldThemeKeys = Object.keys(oldThemes);
    const newThemes = getThemesByLang(newLang);
    const newThemeKeys = Object.keys(newThemes);
    const oldTags = getTagsByLang(lang);
    const newTags = getTagsByLang(newLang);
    const oldCategoryKeys = Object.keys(oldTags);
    const newCategoryKeys = Object.keys(newTags);
    
    setLang(newLang);

    if (activeTheme !== 'custom') {
      const themeIndex = oldThemeKeys.indexOf(activeTheme);
      const nextThemeKey = newThemeKeys[themeIndex >= 0 ? themeIndex : 0] || newThemeKeys[0];
      setActiveTheme(nextThemeKey);
      setEmoticons(newThemes[nextThemeKey]);
    } else {
      // Map custom phrases to target language if they match old themes, otherwise pick 15 fresh from target language
      const oldAllEntries = Object.entries(oldThemes);
      const translated = emoticons.map(phrase => {
        for (let tIdx = 0; tIdx < oldAllEntries.length; tIdx++) {
          const [oldThemeK, oldList] = oldAllEntries[tIdx];
          const pIdx = oldList.indexOf(phrase);
          if (pIdx !== -1) {
            const newThemeK = newThemeKeys[tIdx];
            if (newThemes[newThemeK] && newThemes[newThemeK][pIdx]) {
              return newThemes[newThemeK][pIdx];
            }
          }
        }
        return null;
      });

      if (translated.every(p => p !== null)) {
        setEmoticons(translated);
      } else {
        const allNew = Array.from(new Set(Object.values(newThemes).flat()));
        const shuffled = [...allNew].sort(() => 0.5 - Math.random());
        setEmoticons(shuffled.slice(0, 15));
      }
    }

    const categoryIndex = oldCategoryKeys.indexOf(activeTagCategory);
    setActiveTagCategory(newCategoryKeys[categoryIndex >= 0 ? categoryIndex : 0] || newCategoryKeys[0]);
    
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

  const generateRandomCharacter = () => {
    // 1. All 6 main subject categories (동물, 인물, 판타지, 로봇/SF, 디저트/음식, 식물/자연)
    const allSubjects = [
      // 🐱 동물
      '뱁새 (오목눈이)', '참지않는 말티즈', '치즈냥', '똥실똥실 토끼', '동글동글 비숑', 
      '골든리트리버', '쿼카', '시바견', '아기 펭귄', '햄스터', '카피바라', '레서판다',
      '삼색 고양이', '하프물범', '사막여우', '아기 곰',
      
      // 👦 인물 / 직업
      '단발머리 소녀', '신입사원', '영혼 털린 직장인', '화려한 K팝 아이돌', '헤드폰 낀 프로게이머', 
      '초보 운전자', '안경 쓴 모범생', '투블럭 남학생', '귀여운 유치원생', '카페 바리스타',
      '헬창/운동 마니아', '열공 취업준비생', '피곤한 직장인', '달콤한 파티시에/제빵사',

      // 🦄 판타지 / 사물
      '유니콘', '아기 드래곤', '꼬마 마법사', '숲의 요정', '말랑말랑 모찌', '빛나는 천사', 
      '장난꾸러기 아기 악마', '꼬마 뱀파이어', '솜사탕 구름', '신비로운 인어', '눈사람 요정',

      // 🤖 로봇 / SF
      '아기 로봇', '사이버 냥이', '우주 비행 댕댕이', '사이버펑크 토끼', '홀로그램 유령', 
      'UFO 탄 외계인', '레트로 모니터봇', '미니 게임기봇', 'AI 안드로이드', '말랑 슬라임',

      // 🍞 디저트 / 음식
      '탕후루 요정', '말랑 떡볶이 떡', '모락모락 삼각김밥', '치즈 피자 조각', '바삭 감자튀김', 
      '노릇 계란후라이', '보글보글 라면', '소프트 아이스크림', '쫀득 타코야끼', '식빵 아저씨', '마카롱 토끼',

      // 🌿 식물 / 자연
      '아기 선인장', '네잎클로버 요정', '동글이 버섯', '달콤 복숭아 요정', '말랑 아보카도', 
      '매운맛 아기 고추', '민들레 홀씨', '뽀송 목화솜', '상큼 레몬 꼬마', '빨간 사과 요정'
    ];

    // 2. 의상 / 패션
    const outfits = [
      '오버핏 후드티', '포근한 잠옷', '회사원 정장', '트레이닝복', '멜빵바지', 
      '단정한 셔츠와 넥타이', '귀여운 동물 잠옷', '스포티한 캡모자', '두꺼운 패딩',
      '화사한 꽃무늬 원피스', '힙한 스트릿 패션', '따뜻한 니트 스웨터'
    ];

    // 3. 소품 / 동작
    const props = [
      '아이스 아메리카노 텀블러를 든', '스마트폰을 든', '노트북을 두드리는', 
      '치킨 닭다리를 뜯는', '돈다발을 쥐고 있는', '헤드폰을 낀', '커피잔을 든',
      '꽃다발을 안고 있는', '마이크를 잡고 노래하는', '게임패드를 쥐고 있는',
      '소주/맥주잔을 부딪치는', '선글라스를 낀'
    ];

    // 4. 화풍
    const styles = [
      '귀여운 2D 만화풍', '일본 출판 만화풍', '3D 펠트/클레이 점토 인형풍', 
      '한국 웹툰 스타일', '크레파스 낙서풍', '흑백 만화 톤', '깔끔한 미니멀 벡터',
      '통통 튀는 팝아트풍', '샤방샤방 순정만화풍', 'Y2K 픽셀 스티커풍'
    ];

    // 5. 배경 / 효과
    const effects = [
      '반짝반짝 빛나는 효과', '하트 뿅뿅 날리는', '만화적인 집중선', 
      '물음표 둥둥 (?)', '불타오르는 이펙트', '느낌표 번쩍 (!)', '부들부들 떨림선',
      '별빛이 내리는', '벚꽃이 흩날리는', '따뜻한 햇살'
    ];

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const combo = `${pick(allSubjects)}, ${pick(outfits)}, ${pick(props)}, ${pick(styles)}, ${pick(effects)}`;
    
    setCharManual(combo);
    setCharacterSource('random');
    showToast(lang === 'ko' 
      ? `🎲 [${combo.split(',')[0].trim()}] 전 카테고리 랜덤 조합 완료!` 
      : `🎲 Random character generated: ${combo.split(',')[0].trim()}`);
  };

  const clearTags = () => {
    setCharacterSource('direct');
    setPhotoReferenceMode('characterize');
    setCharManual('');
  };

  const appendTag = (tag) => {
    // 1. Identify categories
    const isArtStyleCategory = activeTagCategory === '🖌️ 화풍' || activeTagCategory === '🖌️ Art Style';
    const isSubjectCategory = [
      '🐱 동물', '👦 인물', '🦄 판타지/사물', '🤖 로봇/SF', '🍞 디저트/음식', '🌿 식물/자연',
      '🐱 Animal', '👦 Human', '🦄 Fantasy/Object', '🤖 Robot/SF', '🍞 Dessert/Food', '🌿 Plant/Nature'
    ].includes(activeTagCategory);

    // All subject tags for replacement logic (Safely handled)
    const koSubjectKeys = ['🐱 동물', '👦 인물', '🦄 판타지/사물', '🤖 로봇/SF', '🍞 디저트/음식', '🌿 식물/자연'];
    const enSubjectKeys = ['🐱 Animal', '👦 Person', '🦄 Fantasy/Object', '🤖 Robot/Sci-Fi', '🍞 Dessert/Food', '🌿 Plant/Nature'];

    const subjectTagList = [];
    koSubjectKeys.forEach(k => { if (CHARACTER_TAGS_KO[k]) subjectTagList.push(...CHARACTER_TAGS_KO[k]); });
    enSubjectKeys.forEach(k => { if (CHARACTER_TAGS_EN[k]) subjectTagList.push(...CHARACTER_TAGS_EN[k]); });

    const allSubjectTags = new Set(subjectTagList);

    const allArtStyles = new Set([
      ...CHARACTER_TAGS_KO['🖌️ 화풍'],
      ...CHARACTER_TAGS_EN['🖌️ Art Style'],
    ]);

    setCharManual(prev => {
      const currentTags = prev.split(',').map(v => v.trim()).filter(Boolean);
      const hasTag = currentTags.includes(tag);

      // Toggle off if already selected
      if (hasTag) {
        showToast(lang === 'ko' ? `선택 해제됨: [${tag}]` : `Unselected: [${tag}]`);
        return currentTags.filter(t => t !== tag).join(', ');
      }

      // Rule 1: Single Art Style replacement
      if (isArtStyleCategory) {
        const prevStyle = currentTags.find(t => allArtStyles.has(t));
        const withoutStyles = currentTags.filter(t => !allArtStyles.has(t));
        if (prevStyle && prevStyle !== tag) {
          showToast(lang === 'ko' 
            ? `🎨 화풍은 1개만 적용됩니다: [${prevStyle}] → [${tag}](으)로 변경` 
            : `🎨 Only 1 Art Style applied: [${prevStyle}] → [${tag}]`);
        } else {
          showToast(lang === 'ko' ? `🎨 화풍 적용: [${tag}]` : `🎨 Art Style applied: [${tag}]`);
        }
        return [...withoutStyles, tag].join(', ');
      }

      // Rule 2: Single Subject replacement (Prevents Cat + Rabbit + Robot collision)
      if (isSubjectCategory) {
        const prevSubject = currentTags.find(t => allSubjectTags.has(t));
        const withoutSubjects = currentTags.filter(t => !allSubjectTags.has(t));
        if (prevSubject && prevSubject !== tag) {
          showToast(lang === 'ko' 
            ? `👤 캐릭터 종류는 1개만 선택 가능합니다: [${prevSubject}] → [${tag}](으)로 변경` 
            : `👤 Single character type allowed: [${prevSubject}] → [${tag}]`);
        } else {
          showToast(lang === 'ko' ? `👤 캐릭터 종류 적용: [${tag}]` : `👤 Character type applied: [${tag}]`);
        }
        return [...withoutSubjects, tag].join(', ');
      }

      // Default: Append new tag
      showToast(lang === 'ko' ? `✨ 태그 추가됨: [${tag}]` : `✨ Tag added: [${tag}]`);
      return [...currentTags, tag].join(', ');
    });


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
        ko: '이 프롬프트를 사용할 때 AI 채팅에 함께 첨부한 사진을 최우선 참고 이미지로 사용해주세요.\n사진 속 대상의 실제 얼굴 비율, 이목구비(눈 크기·모양, 코, 입술, 턱선), 헤어스타일, 피부톤을 사실적으로 재현한 캐리커처 스타일 2D 스티커로 그려주세요. 한눈에 "이 사람이다"라고 알아볼 수 있을 정도로 얼굴 유사도를 높게 유지하되, 외곽선과 채색은 깔끔한 2D 스티커로 마무리하세요.',
        en: 'When using this prompt, treat the attached photo in the AI chat as the highest priority reference image.\nDraw a caricature-style 2D sticker that realistically reproduces the subject\'s actual face proportions, facial features (eye size and shape, nose, lips, jawline), hairstyle, and skin tone. The face must be recognizable enough that viewers can immediately identify the person, while the linework and coloring should have a clean 2D sticker finish.',
      },
      features: {
        ko: '사진 속 대상의 얼굴 자체를 닮게 그릴 필요는 없습니다. 대신 헤어스타일, 안경 유무, 의상, 체형, 전체적인 분위기 등 시그니처 포인트만 추출하여 스타일리시한 2D 캐릭터 아바타로 새롭게 디자인해주세요.',
        en: 'You do NOT need to match the subject\'s actual face. Instead, extract only their signature points — hairstyle, glasses (if any), outfit, body type, and overall vibe — and design a stylish 2D character avatar around those key traits.',
      },
      characterize: {
        ko: '사진 속 대상의 전체적인 인상(헤어 색상, 분위기)만 살짝 참고하고, 나머지는 2.5등신의 커다란 머리, 동글동글한 몸, 반짝이는 큰 눈을 가진 극도로 귀여운 SD/Chibi 마스코트 캐릭터로 완전히 새롭게 변환해주세요.',
        en: 'Use only the subject\'s general impression (hair color, overall vibe) as a loose reference. Transform everything else into an ultra-cute SD/Chibi mascot with a 2.5-head ratio, big round head, chubby body, and huge sparkling eyes.',
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
    const selectedTagSet = new Set(
      charManual.split(',').map(value => value.trim()).filter(Boolean)
    );
    return artStyles
      .filter(style => selectedTagSet.has(style))
      .sort((a, b) => charManual.lastIndexOf(a) - charManual.lastIndexOf(b))
      .at(-1) || '';
  };

  const getGeminiStyleTags = (promptLang = lang) => {
    const selectedArtStyle = getSelectedArtStyle();
    const isKo = promptLang === 'ko';
    if (selectedArtStyle) {
      const expanded = getExpandedArtStyleText(selectedArtStyle, isKo);
      return isKo
        ? `${expanded} (최우선 화풍 지침: 선 굵기, 채색 기법, 질감을 이 화풍 지시문대로 100% 엄격하게 적용하세요)`
        : `${expanded}; treat this selected art style as the highest-priority visual direction for linework, coloring, and texture`;
    }
    if (characterSource === 'photo') {
      if (photoReferenceMode === 'exact') {
        return isKo
          ? '참고 사진의 실제 이목구비와 비율을 정밀하게 반영한 사실적 캐리커처 2D 스티커 화풍'
          : 'Caricature-style 2D sticker with realistic facial proportions and features closely matching the reference photo, finished with clean 2D sticker outlines and coloring';
      }
      if (photoReferenceMode === 'features') {
        return isKo
          ? '참고 사진의 대표 시그니처 특징(헤어, 안경, 의상)만 추출한 세련된 2D 벡터 캐릭터 화풍'
          : 'Stylish 2D character avatar sticker built around the signature points (hairstyle, glasses, outfit, vibe) from the reference photo; the face itself is a new generic cute design';
      }
      return isKo
        ? '2.5등신 커다란 머리와 동글동글한 몸체를 가진 극도로 귀여운 SD/Chibi 마스코트 스티커 화풍'
        : 'Ultra-cute 2.5-head SD/Chibi mascot sticker only loosely inspired by the reference photo\'s general impression';
    }
    return isKo
      ? '귀엽고 친근한 고품질 2D 메신저 이모티콘 일러스트 화풍 (깔끔한 윤곽선과 조화로운 셀 셰이딩 채색)'
      : 'cute, approachable, high-quality 2D messenger sticker illustration with clean outlines and harmonious colors';
  };

  const getSelectedCharacterRoles = () => {
    const koCategories = Object.values(CHARACTER_TAGS_KO);
    const enCategories = Object.values(CHARACTER_TAGS_EN);
    const selectedTagSet = new Set(
      charManual.split(',').map(value => value.trim()).filter(Boolean)
    );
    const roleTags = index => [...koCategories[index], ...enCategories[index]];
    const findSelected = indexes => indexes
      .flatMap(index => roleTags(index))
      .filter(tag => selectedTagSet.has(tag));
    const recognizedTags = new Set([...koCategories.flat(), ...enCategories.flat()]);
    const additionalDescription = Array.from(selectedTagSet)
      .filter(value => !recognizedTags.has(value))
      .join(', ');
    const subjects = findSelected([0, 1, 2, 3, 4, 5]);
    const appearances = findSelected([6]);
    const personalities = findSelected([7]);
    // index 8 = 화풍 → getSelectedArtStyle()에서 별도 처리
    const outfits = findSelected([9]);
    const props = findSelected([10]);
    const effects = findSelected([11]);

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
      exact: 'precisely preserve the subject\'s (person or pet) actual eye angle, eye size, nose/snout, mouth, jawline/face contours, hairstyle or fur patterns/spots, and skin/coat colors with 95%+ high resemblance so they are instantly recognized, stylized in a cute 2.5-head SD/Chibi caricature mascot body without generic template blurring (no unrequested accessories)',
      features: 'do NOT match the exact face; extract signature traits (hairstyle or breed silhouette, glasses/collar/scarf if any, outfit or fur tones, body type, signature vibe) and build a stylish 2D SD/Chibi mascot character (no unrequested accessories)',
      characterize: 'use only the general impression (hair or fur color, vibe) as a loose reference and transform into an ultra-cute 2.5-head SD/Chibi mascot with a big round head, chubby body, and sparkling eyes',
    }[photoReferenceMode];

    const photoAppearanceKo = {
      exact: '스타일화하더라도 참고 사진 인물의 실제 눈매 각도, 눈 크기 비율, 콧대, 입술 두께, 턱선, 헤어스타일, 피부톤을 절대 변형하지 말고 95% 이상 동일하게 유지 (사진에 없는 악세사리 임의 추가 금지)',
      features: '이목구비 자체를 닮게 그릴 필요 없이, 사진에서 상징적인 특징(헤어스타일/품종 실루엣, 안경/목줄/스카프, 의상/털 배색, 분위기)만 추출하여 머리가 크고 앙증맞은 2D SD/Chibi 마스코트 캐릭터로 디자인 (사진에 없는 악세사리 임의 추가 금지)',
      characterize: '전체적인 인상(헤어/털 색상, 분위기)만 가볍게 참고하고, 큰 동그란 머리와 앙증맞고 통통한 몸체, 반짝이는 눈을 가진 극도로 귀여운 2.5등신 SD/Chibi 마스코트 캐릭터로 완전 변환',
    }[photoReferenceMode];

    return {
      subject: subjectParts.join(', ') || 'a cute original character',
      appearance: [
        ...(characterSource === 'photo' ? [isKo ? photoAppearanceKo : photoAppearanceEn] : []),
        ...appearances,
      ].join(', ') || (isKo ? '깔끔하고 명확한 캐릭터 실루엣 유지' : 'use a simple, recognizable silhouette and keep it unchanged'),
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
      exact: 'precisely preserve the subject\'s (person or pet) actual eye angle, eye size, nose/snout, mouth, jawline/face contours, hairstyle or fur patterns/spots, and skin/coat colors with 95%+ high resemblance so they are instantly recognized, stylized in a cute 2.5-head SD/Chibi caricature mascot body without generic template blurring (no unrequested accessories)',
      features: 'do NOT match the exact face; extract signature traits (hairstyle or breed silhouette, glasses/collar/scarf if any, outfit or fur tones, body type, signature vibe) and build a stylish 2D SD/Chibi mascot character (no unrequested accessories)',
      characterize: 'use only the general impression (hair or fur color, vibe) as a loose reference and transform into an ultra-cute 2.5-head SD/Chibi mascot with a big round head, chubby body, and sparkling eyes',
    }[photoReferenceMode];

    const photoAppearanceKo = {
      exact: '스타일화하더라도 참고 사진 인물의 실제 눈매 각도, 눈 크기 비율, 콧대, 입술 두께, 턱선, 헤어스타일, 피부톤을 절대 변형하지 말고 95% 이상 동일하게 유지 (사진에 없는 악세사리 임의 추가 금지)',
      features: '이목구비 자체를 닮게 그릴 필요 없이, 사진에서 상징적인 특징(헤어스타일/품종 실루엣, 안경/목줄/스카프, 의상/털 배색, 분위기)만 추출하여 머리가 크고 앙증맞은 2D SD/Chibi 마스코트 캐릭터로 디자인 (사진에 없는 악세사리 임의 추가 금지)',
      characterize: '전체적인 인상(헤어/털 색상, 분위기)만 가볍게 참고하고, 큰 동그란 머리와 앙증맞고 통통한 몸체, 반짝이는 눈을 가진 극도로 귀여운 2.5등신 SD/Chibi 마스코트 캐릭터로 완전 변환',
    }[photoReferenceMode];

    return {
      subject: subjectParts.join(', ') || (isKo ? '귀여운 오리지널 캐릭터' : 'a cute original character'),
      appearance: [
        ...(characterSource === 'photo'
          ? [isKo ? photoAppearanceKo : photoAppearanceEn]
          : [isKo
              ? '큰 동그란 머리와 앙증맞고 통통한 몸체를 가진 사랑스러운 2.5등신 대두 SD/Chibi 마스코트 캐릭터 비율, 크고 생생한 눈동자와 또렷한 캐릭터 실루엣'
              : 'adorable 2.5-head SD/Chibi mascot proportions with a big round head, chubby compact body, sparkling expressive eyes, and crisp character silhouette']),
        ...appearances,
      ].join(', ') || (isKo ? '깔끔하고 명확한 2.5등신 SD 캐릭터 실루엣 유지' : 'use a clean recognizable 2.5-head SD character silhouette and keep it unchanged'),
      personality: personalities.join(', ') || (isKo ? '친근하고 표정이 풍부한' : 'friendly and expressive'),
      outfit: outfits.join(', ') || (characterSource === 'photo'
        ? (isKo ? '참고 사진의 의상 스타일 유지' : 'preserve outfit from reference photo')
        : (isKo ? '지정 없음. 처음 정한 의상은 모든 이미지에서 유지' : 'not specified; once chosen, keep it unchanged')),
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

  const getGeminiBackgroundInstruction = () => {
    const instructions = {
      transparent: 'Clean solid pure white background with a crisp white sticker die-cut outline around each character. Absolutely DO NOT draw any gray-and-white checkerboard pattern, transparency grid tiles, or fake PNG checkerboard texture.',
      solid: 'One clean solid background color with strong contrast against the character. No gradient, texture, or background objects. No checkerboard tiles.',
      chroma: 'Solid bright green #00FF00 chroma-key background for easy background removal. No green spill on the character outline.',
    };
    return instructions[geminiBackgroundMode] || instructions.transparent;
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
    const expandedArtStyle = getExpandedArtStyleText(selectedArtStyle, lang === 'ko');
    const artDirection = expandedArtStyle || (lang === 'ko'
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
          ? `[VIBRANT POP-ART STICKER TYPOGRAPHY DIRECTIVE]
Render the exact phrase "${targetPhrase}" once in bold, bubbly comic sticker typography with a thick crisp white die-cut sticker outline, subtle drop shadow, and vibrant pop colors (yellow, pink, cyan, orange). Decoratively integrate matching cute mini comic icons/effects (e.g. mini hearts ❤️, sparkles ✨, crown 👑, sweat drops 💦, thumbs up 👍, confetti 🎉, zZ) beside the text. No rectangular text boxes.`
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
${textExclusion} No watermark, frame, duplicate character, extra limbs, cropped body, 3D textures, realistic shading, glossy gradients, complex scenery, or photorealistic background.`;
      }
    }

    if (lang === 'ko') {
      const panelPlan = emoticons.map((phrase, index) => `${Math.floor(index / 5) + 1}행 ${index % 5 + 1}열: "${phrase.trim()}"`).join('\n');
      const textPolicy = gptTextMode === 'text'
        ? '각 셀에 지정된 문구를 캐릭터 옆이나 위에 정확히 한 번만 적으세요. 생성 전에 15개 문구의 철자와 띄어쓰기를 확인하고, 일관되고 읽기 쉬운 손글씨를 사용하세요. 다른 글자는 넣지 마세요.'
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
      const panelPlan = emoticons.map((phrase, index) => `Sticker ${index + 1}: "${phrase.trim()}" – ${getPhraseActionEn(phrase)}`).join('\n');
      const textPolicy = gptTextMode === 'text'
        ? `[HIGH-PRECISION KOREAN TYPOGRAPHY DIRECTIVE] ${getEmotionTextColorGuideEn(emoticons)}
1. Render each text in a clean 2D commercial messenger pop sticker font.
2. Text Style: Bold handwritten font filled with vibrant color (yellow, pink, red, mint, orange, purple, sky blue) + crisp inner stroke + heavy white die-cut sticker outline around the entire text.
3. Cute Accent Icons: Decoratively integrate matching cute mini comic icons/effects (e.g. mini hearts ❤️, sparkles ✨, crown 👑, sweat drops 💦, thumbs up 👍, confetti 🎉, flower bouquet 💐, zZ) around the lettering matching each emotion.
4. No text boxes, no speech bubbles, no parentheses, no quotes, no sticker numbers.`
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
For every phrase, render an exaggerated, highly expressive comic facial expression (wide joyous open-mouth laugh, dramatic anime tear streams, jaw-dropped shock, sparkling cute eyes, determined fist pump) with dynamic changes in eyes, eyebrows, and mouth.
Incorporate varied full-body poses (standing, sitting, jumping, kneeling, leaning, crouching) across all 15 cells without repeating posture, paired with cute minimal supporting props and comic effects.
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
    const isKorean = lang === 'ko';
    const character = getGeminiCharacterDetails(isKorean ? 'ko' : 'en');
    const hasPhraseOverride = phraseOverride !== null;
    const targetPhrase = generationMode === 'individual'
      ? getSelectedPhrase()
      : (phraseOverride || '').trim();

    if (isKorean) {
      const referenceInstructionKo = characterSource === 'photo' ? {
        exact: '[귀엽고 사랑스러운 2.5등신 SD 캐리커처 스티커] 참고 사진 속 인물의 헤어스타일, 눈매, 얼굴 특징 및 분위기를 찰떡같이 반영하되, 머리가 크고 앙증맞은 2.5등신 SD/Chibi 대두 캐릭터 비율로 사랑스럽게 캐리커처화하세요.',
        features: '[시그니처 포인트 추출 2.5등신 SD] 참고 사진에서 인물의 상징적인 특징(헤어스타일, 안경, 분위기, 의상)을 추출하여 감각적이고 귀여운 2.5등신 SD 캐릭터로 제작하세요.',
        characterize: '[극도로 귀여운 2.5등신 SD 캐릭터화] 큰 동그란 머리, 반짝이는 눈, 통통하고 앙증맞은 몸체를 가진 사랑스러운 2.5등신 SD Chibi 마스코트로 만드세요.',
      }[photoReferenceMode] : '동일한 캐릭터의 정체성과 외형 특징을 엄격하게 유지하세요.';

      const geminiProportionsKo = characterSource === 'photo' ? {
        exact: '참고 사진의 얼굴 비율과 특징을 정확하게 반영한 고품질 2D 스티커 일러스트.',
        features: '시그니처 특징(헤어, 안경, 주요 특징)을 추출한 세련된 2D 그래픽 벡터 일러스트.',
        characterize: '큰 동그란 얼굴, 반짝이는 눈, 통통한 볼을 가진 귀여운 2.5등신 SD/Chibi 캐릭터 마스코트.',
      }[photoReferenceMode] : '귀엽고 친근한 2.5등신 SD/Chibi 마스코트 비율.';

      const bgInstructionKo = {
        transparent: '단일 연계형 순백색 배경 시트(Single continuous pure white background sheet). 15개 전신 스티커가 여백을 두고 자유롭게 배치되며, 각 캐릭터 주변에 선명한 흰색 스티커 테두리(Die-cut white outline)가 감싸진 형태. 전체 캔버스에 깔끔한 순백색 바탕만 존재하며 회색·흰색 체크무늬(체커보드 격자, 모자이크 패턴, PNG 투명 그리드 타일)는 절대로 그리지 마세요.',
        solid: '캐릭터와 선명하게 대비되는 깔끔한 단색 배경. 격자 패턴이나 체크무늬 타일 절대 금지.',
        chroma: '배경 분리(누끼)용 선명한 연두색 #00FF00 크로마키 배경. 캐릭터 외곽선에 녹색 번짐 없음.',
      }[geminiBackgroundMode] || '단일 연계형 순백색 배경 시트.';

      if (generationMode === 'individual' || hasPhraseOverride) {
        const textPolicyKo = geminiTextMode === 'text'
          ? `[고품질 한글 타이포그래피 정밀 지침] 정확한 한글 철자 "${targetPhrase}"를 오탈자 없이 명확하게 그리세요. 캐릭터 옆이나 위에 읽기 편하고 깔끔한 귀여운 손글씨 캘리그라피 타이포그래피 스타일로 자연스럽게 배치하세요. 글자 외곽선이 또렷하고 배경과 대비되는 높은 가독성의 색상을 사용하세요. 텍스트 상자(박스), 괄호 (), 따옴표 "", 말풍선은 절대 그리지 마세요.`
          : `한국어 문구 "${targetPhrase}"는 표정과 자세를 정하기 위한 맥락으로만 사용하고, 이미지 안에 절대로 텍스트, 글자, 숫자로 그리지 마세요.`;
        const textExclusionKo = geminiTextMode === 'text'
          ? '글자/단어/음절 중복 반복(예: 화이팅 화이팅, 미안해요 미안해요, 최 최고), 불필요한 일본어/가타카나/한자/외국어, 철자 변형, 폰트 뭉개짐, 스티커 번호, 괄호, 따옴표, 텍스트 상자 절대 금지.'
          : '텍스트, 글자, 숫자, 말풍선, 스티커 라벨, 의미 없는 기호 절대 금지.';

        return `[목표]
일관된 캐릭터가 담긴 고품질 2D 메신저 스티커 (카카오톡/라인 스타일) 1장을 그려주세요.

[시각적 참고 & 정체성]
사진 참고 스타일: ${getPhotoModeLabel('ko')}. 첨부된 사진을 최우선 참고 이미지로 사용하세요.
${referenceInstructionKo}
- 대상: ${character.subject}
- 외형 및 특징: ${character.appearance}
- 의상: ${character.outfit}

[화풍 및 비율]
지정 화풍: ${character.artStyle}. ${geminiProportionsKo} 깔끔하고 선명한 벡터 외곽선, 부드러운 셀 셰이딩, 조화로운 색감. 머리부터 발끝까지 전신이 잘리지 않게 표현하세요.

[포즈 및 표정]
- 감정/상황 맥락: "${targetPhrase}"
- 표정: "${targetPhrase}"에 꼭 맞는 풍부하고 명확한 표정.
- 자세: 머리부터 발끝까지 완전한 전신을 보여주는 역동적인 포즈 (앉기, 웅크리기, 점프, 소품 들기, 윙크 등).
- 보조 소품 및 효과: ${character.props}, ${character.effects}, 귀여운 포인트 효과.

[캔버스 및 배치]
1:1 정사각형 캔버스. 전신 캐릭터 한 명을 중앙에 배치하고 여백을 넉넉히 주세요. ${bgInstructionKo}

[일관성 규칙]
기존 캐릭터의 얼굴, 체형, 색상, 의상, 화풍을 동일하게 유지하고 표정과 자세만 변경하세요.

[글자 정책]
${textPolicyKo}

[제외 조건]
${textExclusionKo} 격자선, 셀 경계선, 구별선, 테두리선, 표 선, 크롭 마크, 바운딩 박스, 워터마크, 전체 프레임, 캐릭터 중복, 팔다리 누락/추가, 반신·흉상 컷, 회색·흰색 체크무늬 패턴, 실사 느낌.`;
      }

      const panelPlanKo = [
        `1행 (스티커 1~5): 1. "${(emoticons[0]||'ㅋㅋㅋㅋ').trim()}" | 2. "${(emoticons[1]||'안녕!').trim()}" | 3. "${(emoticons[2]||'오늘도 화이팅').trim()}" | 4. "${(emoticons[3]||'좋아요').trim()}" | 5. "${(emoticons[4]||'고마워요').trim()}"`,
        `2행 (스티커 6~10): 6. "${(emoticons[5]||'사랑해요').trim()}" | 7. "${(emoticons[6]||'최고!').trim()}" | 8. "${(emoticons[7]||'오예').trim()}" | 9. "${(emoticons[8]||'미안해요').trim()}" | 10. "${(emoticons[9]||'수고했어요').trim()}"`,
        `3행 (스티커 11~15): 11. "${(emoticons[10]||'축하해요').trim()}" | 12. "${(emoticons[11]||'대박').trim()}" | 13. "${(emoticons[12]||'헐').trim()}" | 14. "${(emoticons[13]||'감동').trim()}" | 15. "${(emoticons[14]||'잘자요').trim()}"`
      ].join('\n');

      const textPolicyKo = geminiTextMode === 'text'
        ? `[한글 타이포그래피 — 3D 입체 팝아트 스티커 글자 최고도화 지침] ${getEmotionTextColorGuideKo(emoticons)}
1. 글자를 단순 텍스트가 아닌 '상업용 카카오톡 이모티콘 3D 입체 스티커 배지(Sticker Graphic Badge)'로 렌더링하세요.
2. 글자 스타일: 검은색 또는 고채도 원색의 두꺼운 볼드 손글씨 폰트 채움 + 글자 자모 자체에 선명한 2~3px 검은색 윤곽선 + 겉면에 매우 두꺼운 순백색 스티커 테두리(Heavy White Die-Cut Outline).
3. 절대적 단일 출력 규칙: 각 스티커 셀당 지정된 한글 문구를 '오직 단 한 번(EXACTLY ONCE)'만 완벽한 한글로 그리세요.
4. 중복 및 표기 오류 엄격 금지: 단어나 글자를 두 번 반복하여 그리는 행위(예: "오늘도 화이팅 화이팅", "미안해요 미안해요", "최 최고!" 등 중복 표기) 및 일본어/가타카나/한자/외국어 기호 섞임은 100% 엄격히 금지합니다.`
        : '한국어 문구는 표정과 자세를 정하기 위한 맥락으로만 사용하고, 이미지 안에 절대로 텍스트, 글자, 숫자로 그리지 마세요.';
      const textExclusionKo = geminiTextMode === 'text'
        ? '불필요한 단어, 철자 변경, 임의의 글자, 스티커 번호, 괄호, 따옴표, 텍스트 상자 금지.'
        : '텍스트, 글자, 숫자, 말풍선, 스티커 라벨, 의미 없는 기호 절대 금지.';

      return `[목표]
전체 스티커에 걸쳐 일관된 캐릭터가 등장하는 15종 2D 메신저 스티커 시트 (카카오톡 / 라인 스타일) 한 장을 생성해 주세요.

[시각적 참고 & 정체성]
사진 참고 스타일: ${getPhotoModeLabel('ko')}. 첨부된 사진을 최우선 참고 이미지로 사용하세요.
${referenceInstructionKo}
- 대상: ${character.subject}
- 외형 및 특징: ${character.appearance}
- 의상: ${character.outfit}
- 구도 조화: 전신 컷을 기본(70% 이상)으로 하되, 감정 표현이 강조되는 문구는 상반신/바스트 컷을 자연스럽게 섞어 GPT 스타일의 생동감 넘치는 이모티콘 시트로 구성하세요.

[화풍 및 비율]
지정 화풍: ${character.artStyle}. ${geminiProportionsKo} 깔끔하고 선명한 벡터 외곽선, 부드러운 셀 셰이딩, 조화로운 색감. 15개 스티커 전체에서 지정된 최우선 화풍의 선, 채색, 질감 및 캐릭터 비율을 100% 엄격히 유지하세요. 15개 셀의 얼굴은 마치 같은 사진에서 포즈만 바꾼 것처럼 눈 크기, 눈매, 얼굴 폭, 턱선이 픽셀 단위로 동일해야 합니다. 셀마다 다른 사람처럼 보이지 않도록 각별히 주의하세요.

[15종 역동적인 포즈 & 표정]
각 스티커마다 독창적이고 표정이 살아있는 얼굴 감정과 역동적인 전신 자세를 구성하세요 (앉기, 웅크리기, 점프, 소품 들기, 윙크, 먹기, 응원하기 등). 각 문구의 감정에 맞춰 전신 포즈, 상반신 컷, 상체 컷을 다채롭게 배정하세요:
${panelPlanKo}
보조 소품 & 반짝이 효과: ${character.props}, ${character.effects}, 최소한의 포인트 효과.

[캔버스 레이아웃 — 절대적 5열 × 3행 15셀 그리드 고정]
반드시 정확히 가로 5개 × 세로 3행 구조로만 총 15개 스티커를 일정 간격으로 깨끗하게 배치하세요. 4행 구조, 세로 배치, 비대칭 삐뚤어진 배열은 엄격히 금지됩니다.
1행에 스티커 5개, 2행에 스티커 5개, 3행에 스티커 5개가 완벽한 수평 수직 열에 맞춰 배치되어야 합니다. ${bgInstructionKo} 격자선, 구별선, 크롭 마크, 바운딩 박스, 스티커 번호 절대 금지.

[글자 정책]
${textPolicyKo}

[제외 조건]
${textExclusionKo} 가이드선, 격자선, 셀 구별선, 테두리선, 표 선, 크롭 마크, 패널 상자, 워터마크, 외곽 프레임, 한 스티커 안의 캐릭터 중복, 팔다리 누락/추가, 크롭된 신체, 반신·흉상 컷, 탁한 배경색, 회색·흰색 체크무늬/체커보드 패치.`;
    }

    // English Version (Matches User Best Template Exactly)
    const photoModeBlockEn = characterSource === 'photo' ? {
      exact: '[HIGH-FIDELITY REALISTIC PHOTO CARICATURE] Create a photo-realistic caricature cutout sticker preserving 95%+ exact visual resemblance to the attached person photo. Do NOT render as a 2D vector cartoon. Preserve real photographic face texture, skin tone, hairstyle, and authentic outfit texture, stylized into a high-end photo cutout sticker.',
      features: '[SIGNATURE FEATURE EXTRACTION] Extract only the iconic signature elements (e.g., glasses, unique haircut, facial mark, distinct expression/outfit) from the reference photo. Render in a clean, stylish 2D vector illustration while accentuating those key signature traits.',
      characterize: '[CUTE SD CHIBI MASCOT] Transform the reference photo into an adorable 2.5-head Chibi SD mascot with a big round head, large expressive eyes, chubby cheeks, and clean 2D vector sticker styling.',
    }[photoReferenceMode] : 'Preserve the same character identity and key visual features strictly across all stickers.';

    const proportionStyleEn = characterSource === 'photo' ? {
      exact: 'High-fidelity photo-realistic caricature cutout sticker style matching the attached reference photo accurately, with real photographic face texture, hair, skin tone, and authentic outfit details.',
      features: 'Stylish 2D graphic vector illustration with clean stylized proportions, extracting iconic signature features (hair, glasses, distinct traits).',
      characterize: 'Adorable 2.5-head Chibi SD mascot proportion with a big round head, sparkling expressive eyes, and chubby cheeks.',
    }[photoReferenceMode] : 'Adorable 2.5-head Chibi SD mascot proportion with a big round head, sparkling expressive eyes, and chubby cheeks.';

    const bgInstructionEn = {
      transparent: 'Single continuous pure white background sheet. Arrange all 15 full-body stickers floating freely with generous spacing. Each character has a subtle crisp sticker die-cut white outline. Pure blank white background across the entire canvas. Absolutely DO NOT draw any gray-and-white checkerboard pattern, transparency tiles, or fake PNG grid texture.',
      solid: 'Clean, continuous solid background color with strong contrast against the character. No checkerboard tiles.',
      chroma: 'Solid bright green #00FF00 chroma-key background for easy background removal. No green spill on character edges.',
    }[geminiBackgroundMode] || 'Single continuous pure white background sheet.';

    if (generationMode === 'individual' || hasPhraseOverride) {
      const textPolicy = geminiTextMode === 'text'
        ? `[HIGH-PRECISION KOREAN TYPOGRAPHY DIRECTIVE] Render the exact Korean phrase "${targetPhrase}" with 100% correct Hangul spelling and zero typos. Position the text naturally beside or floating near the character in playful, highly legible hand-drawn calligraphy typography. Ensure sharp vector text outlines and strong color contrast against the background. Do NOT draw rectangular text boxes, background boxes, speech bubbles, parentheses (), or quotation marks "".`
        : `Do not render text, letters, or numbers. Use "${targetPhrase}" only as visual context for expression and pose.`;
      const textExclusion = geminiTextMode === 'text'
        ? 'No extra words, altered spelling, random letters, numbers, parentheses, or text boxes.'
        : 'No text, letters, numbers, typography, or meaningless symbols.';

      return `[GOAL]
Create a master 2D messenger sticker (KakaoTalk / LINE style) featuring a consistent character.

[VISUAL REFERENCE & IDENTITY]
Photo reference style: ${getPhotoModeLabel('en')}. Use the photo attached in the AI chat as the primary visual reference.
${photoModeBlockEn}
- Subject: ${character.subject}
- Appearance & Features: ${character.appearance}
- Outfit: ${character.outfit}

[ART DIRECTION & PROPORTIONS]
cute, approachable, high-quality 2D messenger sticker illustration with clean outlines and harmonious colors. ${proportionStyleEn} Clean crisp vector outlines, vibrant colors, and soft cell shading. Maintain identical character proportions and style.

[SCENE, POSE & EXPRESSION]
- Target Phrase / Mood: "${targetPhrase}"
- Facial Expression: Highly expressive, unmistakable emotion matching "${targetPhrase}".
- Body Pose: Dynamic, energetic full-body posture (e.g. sitting, crouching, jumping, holding props, or waving). Every character must be full-body, head-to-toe, uncropped.
- Supporting Props & Sparkle Effects: ${character.props}, ${character.effects}, cute accents.

[CANVAS & COMPOSITION]
Square 1:1 canvas. Exactly one complete centered full-body character visible from head to toe with generous spacing. ${bgInstructionEn}

[CONSISTENCY RULE]
If a previous sticker sheet or character image exists in this chat, preserve its face, body proportions, colors, outfit, and art style identically. Change only the expression, pose, supporting prop, and effect required for this scene.

[TEXT POLICY]
${textPolicy}

[DO NOT INCLUDE]
${textExclusion} No guide lines, no grid lines, no cell dividers, no border lines, no table lines, no crop marks, no panel boxes, no watermark, no outer frame, no duplicate character inside a single sticker, no extra limbs, no cropped body, no half-body bust shot, no dull background color, or photorealism.`;
    }

    const panelPlan = [
      `Row 1 (Stickers 1-5): 1. "${(emoticons[0]||'ㅋㅋㅋㅋ').trim()}" | 2. "${(emoticons[1]||'안녕!').trim()}" | 3. "${(emoticons[2]||'오늘도 화이팅').trim()}" | 4. "${(emoticons[3]||'좋아요').trim()}" | 5. "${(emoticons[4]||'고마워요').trim()}"`,
      `Row 2 (Stickers 6-10): 6. "${(emoticons[5]||'사랑해요').trim()}" | 7. "${(emoticons[6]||'최고!').trim()}" | 8. "${(emoticons[7]||'오예').trim()}" | 9. "${(emoticons[8]||'미안해요').trim()}" | 10. "${(emoticons[9]||'수고했어요').trim()}"`,
      `Row 3 (Stickers 11-15): 11. "${(emoticons[10]||'축하해요').trim()}" | 12. "${(emoticons[11]||'대박').trim()}" | 13. "${(emoticons[12]||'헐').trim()}" | 14. "${(emoticons[13]||'감동').trim()}" | 15. "${(emoticons[14]||'잘자요').trim()}"`
    ].join('\n');
    const textPolicy = geminiTextMode === 'text'
      ? `[HIGH-IMPACT KOREAN STICKER TYPOGRAPHY — GPT STYLE 3D BADGE DIRECTIVE] ${getEmotionTextColorGuideEn(emoticons)}
1. Treat text not as flat overlay, but as a commercial KakaoTalk/LINE 3D Sticker Graphic Badge element.
2. Letter Fill & Line: Bold solid black or high-saturation vivid color fill with a crisp black inner outline.
3. Double Die-Cut Stroke: Enclose the entire lettering in a thick, heavy continuous white die-cut border to create 3D pop depth.
4. Arrangement: Tilt lettering slightly for a dynamic, energetic 2D messenger sticker graphic aesthetic. Never use thin, faint body fonts.
5. Single Precision Rendering: Render each phrase EXACTLY ONCE per cell. Strictly prohibit repeating words/letters twice or including foreign/Japanese symbols.`
      : 'The Korean phrases are context for determining expression and pose only — never render them as text, letters, or numbers in the image.';
    const textExclusion = geminiTextMode === 'text'
      ? 'No extra words, altered spelling, random letters, sticker numbers, parentheses, quotation marks, or text boxes.'
      : 'No text, no letters, no numbers, no speech bubbles, no sticker labels, no meaningless symbols.';

    return `[GOAL]
Create a master 15-sticker 2D messenger sheet (KakaoTalk / LINE style) featuring a consistent character across all stickers.

[VISUAL REFERENCE & IDENTITY]
Photo reference style: ${getPhotoModeLabel('en')}. Use the photo attached in the AI chat as the primary visual reference.
${photoModeBlockEn}
- Subject: ${character.subject}
- Appearance & Features: ${character.appearance}
- Outfit: ${character.outfit}
- COMPOSITION HARMONY: Use full-body poses as the primary baseline (70%+), but naturally incorporate 3/4 upper-body shots and expressive close-ups where the emotion calls for it, creating a lively KakaoTalk/LINE sticker sheet like GPT.

[ART DIRECTION & PROPORTIONS]
cute, approachable, high-quality 2D messenger sticker illustration with clean outlines and harmonious colors. ${proportionStyleEn} Clean crisp vector outlines, vibrant colors, and soft cell shading. Maintain identical character proportions, facial details, eye shape, and jawline identically across all 15 stickers as if from the same photo session.

[15 DYNAMIC POSES & EXPRESSIONS]
For each sticker, infer a unique, highly expressive facial emotion and a DYNAMIC full-body pose (e.g. sitting, crouching, jumping, holding props, winking, eating, or cheering). Every sticker MUST show a complete full-body character visible head-to-toe:
${panelPlan}
Supporting props & sparkle effects: ${character.props}, ${character.effects}, cute accents.

[CANVAS & GRID ALIGNMENT — STRICT 5 COLUMNS x 3 ROWS]
MUST arrange all 15 stickers in a wide horizontal canvas with an exact 5-column by 3-row uniform grid layout (5 stickers per row across 3 rows). 4-row or irregular arrangements are strictly forbidden. This 5x3 grid rule takes highest precedence over all other directives. ${bgInstructionEn} Absolutely NO guide lines, NO grid lines, NO cell borders, NO table lines, NO dividing lines, NO crop marks, NO bounding boxes, NO sticker numbers.

[TEXT POLICY]
${textPolicy}

[DO NOT INCLUDE]
${textExclusion} No guide lines, no grid lines, no cell dividers, no border lines, no table lines, no crop marks, no panel boxes, no watermark, no outer frame, no duplicate character inside a single sticker, no extra limbs, no cropped body, no half-body bust shot, no dull background color, or photorealism.`;
  };

  const getGrokBackgroundInstruction = () => {
    const instructions = {
      transparent: 'Clean solid white background with a subtle crisp sticker die-cut white outline.',
      solid: 'One clean solid background color with strong contrast against the character. No gradient, texture, or background objects.',
      chroma: 'Solid bright green #00FF00 chroma-key background for easy background removal. No green spill on the character outline.',
    };
    return instructions[grokBackgroundMode] || instructions.transparent;
  };

  const getGrokCharacterDetails = (langMode = lang) => {
    const { subjects, appearances, personalities, outfits, props, effects, additionalDescription } = getSelectedCharacterRoles();
    const isKo = langMode === 'ko';
    const subjectParts = [
      ...(characterSource === 'photo' 
        ? [isKo ? 'AI 채팅에 첨부한 참고 사진 속 대상' : 'the subject in the reference photo attached in the AI chat'] 
        : []),
      ...subjects,
      ...(additionalDescription ? [additionalDescription] : []),
    ];

    const photoAppearanceEn = {
      exact: 'realistically reproduce actual face proportions, facial structure, eye shape, nose, lips, jawline, hairstyle, and skin tone matching reference photo so the person is immediately recognizable; do not add unrequested accessories',
      features: 'do NOT match actual face; instead extract signature points (hairstyle, glasses if any, outfit, body type, vibe) and design a stylish new 2D character avatar; do not add unrequested accessories',
      characterize: 'use general impression as loose reference and transform into an ultra-cute 2.5-head SD/Chibi mascot with big round head, chubby body, and huge sparkling eyes',
    }[photoReferenceMode];

    const photoAppearanceKo = {
      exact: '참고 사진 인물의 실제 얼굴 비율, 이목구비 구조, 눈매, 코, 입술, 턱선, 헤어스타일, 피부톤을 95% 이상 리얼하게 재현하여 본인임을 즉시 알아볼 수 있게 함 (사진에 없는 악세사리 임의 추가 금지)',
      features: '얼굴 자체를 닮게 그릴 필요 없음; 헤어스타일, 안경 유무, 의상, 체형, 전체 분위기 등 시그니처 포인트만 추출하여 스타일리시한 새 캐릭터로 디자인 (사진에 없는 악세사리 임의 추가 금지)',
      characterize: '전체적인 인상(헤어 색상, 분위기)만 살짝 참고하고 2.5등신 커다란 머리와 동글동글한 몸체의 극도로 귀여운 SD/Chibi 마스코트로 완전 변환',
    }[photoReferenceMode];

    return {
      subject: subjectParts.join(', ') || (isKo ? '귀여운 오리지널 캐릭터' : 'a cute original character'),
      appearance: appearances.join(', ') || (characterSource === 'photo'
        ? (isKo ? photoAppearanceKo : photoAppearanceEn)
        : (isKo ? '단순하고 알아보기 쉬운 실루엣을 정한 뒤 그대로 유지' : 'simple, recognizable silhouette kept unchanged')),
      personality: personalities.join(', ') || (isKo ? '친근하고 표정이 풍부한' : 'friendly and expressive'),
      outfit: outfits.join(', ') || (isKo ? '지정 없음. 처음 정한 의상은 모든 이미지에서 유지' : 'no fixed outfit specified; once chosen, keep it unchanged'),
      props: props.join(', ') || (isKo ? '필수 소품 없음' : 'none required'),
      effects: effects.join(', ') || (isKo ? '감정 전달에 필요한 최소한의 효과만 사용' : 'use only a minimal effect when it clarifies the emotion'),
      artStyle: getGeminiStyleTags(langMode),
    };
  };

  const generateGrokPrompt = (phraseOverride = null) => {
    const isKorean = lang === 'ko';
    const character = getGrokCharacterDetails(isKorean ? 'ko' : 'en');
    const hasPhraseOverride = phraseOverride !== null;
    const targetPhrase = generationMode === 'individual'
      ? getSelectedPhrase()
      : (phraseOverride || '').trim();

    if (isKorean) {
      const referenceInstructionKo = characterSource === 'photo'
        ? `첨부한 사진을 참고하여 대상의 키 비주얼 특징을 캐릭터 디자인의 참고 자료로 사용하세요 (${getPhotoModeLabel('ko')}).`
        : '동일한 캐릭터의 정체성과 외형 특징을 엄격하게 유지하세요.';

      const grokProportionsKo = characterSource === 'photo' ? {
        exact: '실제 얼굴 비율과 이목구비, 헤어스타일, 피부톤을 사실적으로 재현한 캐리커처 2D 스티커 마감.',
        features: '시그니처 특징(헤어, 안경, 의상, 체형, 분위기)만 반영한 2D 캐릭터 아바타 일러스트 마감.',
        characterize: '큰 동그란 얼굴, 반짝이는 눈, 통통한 볼을 가진 귀여운 2.5등신 SD/Chibi 캐릭터 마감.',
      }[photoReferenceMode] : '귀엽고 친근한 2.5등신 SD/Chibi 마스코트 비율.';

      const bgInstructionKo = {
        transparent: '깨끗하고 선명한 단색 흰색 배경에 캐릭터 주변에 선명한 흰색 스티커 테두리(Die-cut white outline)가 감싸진 형태. 회색·흰색 체크무늬 패턴은 절대로 그리지 마세요.',
        solid: '캐릭터와 대비되는 단색 배경으로 생성하세요.',
        chroma: '배경 분리(누끼)용 선명한 연두색 #00FF00 크로마키 배경으로 생성하세요.',
      }[grokBackgroundMode] || '깨끗하고 선명한 단색 흰색 배경에 흰색 스티커 테두리가 감싸진 형태.';

      if (generationMode === 'individual' || hasPhraseOverride) {
        const textPolicyKo = grokTextMode === 'text'
          ? `캐릭터 옆에 한글 문구 "${targetPhrase}"를 손글씨 타이포그래피 스타일로 정갈하게 배치하세요. 괄호 (), 상자는 그리지 마세요.`
          : `한국어 문구 "${targetPhrase}"는 표정과 자세를 정하기 위한 맥락으로만 사용하고, 이미지 안에 절대로 텍스트, 글자, 숫자로 그리지 마세요.`;
        const textExclusionKo = grokTextMode === 'text'
          ? '불필요한 글자, 괄호, 텍스트 상자 금지.'
          : '텍스트, 글자, 숫자, 말풍선, 스티커 라벨, 의미 없는 기호 절대 금지.';

        return `동일한 캐릭터가 등장하는 고품질 2D 메신저 스티커 (카카오톡 / 라인 스타일) 한 장을 그려주세요. 정사각형 캔버스, 고해상도.

[CRITICAL IDENTITY LOCK — 자연스러운 얼굴 닮은꼴 보존 (왜곡 방지)]
참고 사진 인물의 눈매 각도, 콧대, 입술 모양, 턱선, 헤어스타일의 특징을 90% 이상 자연스럽게 반영하세요.
[얼굴 찌그러짐 엄격 방지]: 이목구비를 억지로 구겨 넣거나 기괴하게 왜곡시키지 말고, 깔끔하고 균형 잡힌 2D 이목구비 윤곽선으로 자연스럽게 그리세요.
${referenceInstructionKo}
- 대상: ${character.subject}
- 외형 및 특징: ${character.appearance}
- 의상: ${character.outfit}
- 화풍 상세 스펙 (반드시 엄격히 준수):
  * 주요 화풍: ${character.artStyle} (${grokProportionsKo})
  * 외곽선: 두께 3~4px 균일한 검정 벡터 라인, 끊김 없이 선명하게 연결
  * 채색: 각 색상 영역을 2단계 명암(기본색 + 그림자색 1단)으로만 구분하는 정교한 셀 셰이딩, 부드러운 그라데이션 사용 엄격 금지
  * 색상: 채도 높은 플랫 컬러 5~6가지 깔끔한 팔레트로 제한 (피부색, 머리색, 상의색, 하의색, 포인트색)
  * 형태 비율: 얼굴과 손을 제외한 신체 비율은 2.5등신~3등신 SD(Super Deformed) 캐릭터 비율
  * 렌더링 스타일 키워드: 인기 카카오톡 이모티콘 및 라인 스티커 스타일, 프로 일러스트레이터 수준의 선/채색 마감
  * 금지 사항: 이 화풍 스펙과 다른 방식(3D 렌더링, 반실사 렌더링, 사실적 음영, 과도한 그라데이션, 수채화 느낌)으로 그리지 마세요. 임의의 액세서리 추가 금지.

[품질 규칙]
캐릭터의 얼굴 디테일, 선화 선명도, 색상 채도를 높은 수준으로 렌더링하세요. 머리부터 발끝까지 전신이 잘리지 않고 보여야 합니다.

[장면, 표정 & 포즈]
- 감정/상황 맥락: "${targetPhrase}"
- 표정과 자세: "${targetPhrase}"에 맞춘 유일하고 표현력 풍부한 얼굴 감정과 역동적인 전신 자세 (앉기, 웅크리기, 점프, 소품 들기, 윙크 등).
- 최소한의 보조 소품 및 효과: ${character.props}, ${character.effects}.

[배경 & 흰색 스티커 테두리]
캐릭터 실루엣 주변에 선명한 흰색 스티커 테두리(Die-cut white outline)가 감싸진 형태. ${bgInstructionKo}

[캐릭터 일관성]
기존 캐릭터의 얼굴, 체형, 색상, 의상, 화풍을 동일하게 유지하세요.

[글자 정책]
${textPolicyKo}

[제외 조건]
${textExclusionKo} 워터마크, 외곽 프레임, 바운딩 박스, 캐릭터 중복, 팔다리 누락/추가, 반신·흉상 컷, 실사 느낌, 반실사 렌더링, 3D 텍스처, 그라데이션 음영, 애니메이션풍 광택 하이라이트, 과도하게 큰 눈, 얼굴 왜곡 절대 금지.`;
      }

      const panelPlanKo = emoticons.map((phrase, index) => `${index + 1}. "${phrase.trim()}" – ${getPhraseActionKo(phrase)}`).join('\n');
      const textPolicyKo = grokTextMode === 'text'
        ? `[고품질 한글 타이포그래피 정밀 지침] ${getEmotionTextColorGuideKo(emoticons)} 각 한글 문구를 해당 캐릭터 옆이나 위에 오탈자 없이 손글씨 캘리그라피 스타일로 자연스럽게 배치하세요. 딱딱한 고딕체 금지. 괄호 (), 텍스트 상자는 절대로 그리지 마세요.`
        : '한국어 문구는 표정과 자세를 정하기 위한 맥락으로만 사용하고, 이미지 안에 절대로 텍스트, 글자, 숫자로 그리지 마세요.';
      const textExclusionKo = grokTextMode === 'text'
        ? '불필요한 글자, 괄호, 스티커 번호, 텍스트 상자 금지.'
        : '텍스트, 글자, 숫자, 말풍선, 스티커 라벨, 의미 없는 기호 절대 금지.';

      return `동일한 캐릭터가 3행 × 5열 격자 구조로 배치된 완성도 높은 15셀 카카오톡/라인 스티커 시트 한 장을 생성해 주세요. 정사각형 캔버스, 고해상도. 격자선, 셀 테두리, 숫자 없음.

[캐릭터 고정 — 15개 셀 전체 동일 적용]
${referenceInstructionKo}
Subject: ${character.subject}
Appearance & Features: ${character.appearance}
Outfit: ${character.outfit}
Art Style Mechanical Spec (Strict Compliance):
  * Main Style: ${character.artStyle} (${grokProportionsKo})
  * Linework: Uniform 3-4px crisp black vector line art with continuous edges
  * Coloring: 2-tone cell shading only (flat base color + 1 shade layer), no soft gradients
  * Palette: Vivid flat colors limited to 5-6 palette colors (skin, hair, top, bottom, accent)
  * Proportions: 2.5 to 3-head SD (Super Deformed) character ratio
  * Benchmark: KakaoTalk Emoticon Studio approved quality, LINE Friends character rendering finish
  * Prohibitions: No 3D rendering, realistic shading, glossy highlights, or soft watercolor gradients.

[품질 & 일관성 규칙]
15개 셀 캐릭터 모두 동일하게 높은 수준의 얼굴 디테일, 선명한 선화, 색상 채도를 유지하세요. 전신 컷과 상반신 컷을 감정에 맞춰 다채롭게 구성하고, 피사체가 답답하게 눌리지 않도록 자연스럽게 표현하세요.

[15 스티커 포즈]
각 셀은 서 있는 자세를 반복하지 말고, 앉기·점프·웅크리기·눕기·엎드리기 등 최소 6가지 이상 서로 다른 신체 자세를 사용하세요. 단순히 팔 위치만 바꾸는 것을 엄격히 금지합니다. 각 문구의 감정 맥락에 맞춰 독창적이고 표정이 살아있는 얼굴 감정과 역동적인 전신 자세를 구성하세요:
${panelPlanKo}
감정 전달에 최소한으로 필요한 보조 소품이나 반짝이 효과만 사용하세요 (${character.props}, ${character.effects}).

[배경 & 흰색 스티커 테두리]
각 캐릭터마다 실루엣 주변에 선명한 흰색 스티커 테두리(Die-cut outline)가 깔끔하게 감싸져 있어야 합니다. 15개 스티커는 3행 × 5열 배치 안에서 여백을 두고 자유롭게 떠 있습니다. ${bgInstructionKo} 격자선, 셀 테두리, 구분선, 크롭 마크, 바운딩 박스, 스티커 번호 절대 금지.

[캐릭터 일관성]
15개 스티커 모두 얼굴, 체형, 색상, 의상, 화풍을 엄격하게 동일하게 유지하세요. 각 감정에 필요한 표정, 자세, 최소 소품만 변경하세요.

[글자 정책]
${textPolicyKo}

[제외 조건]
${textExclusionKo} 문구 뒤에 쉼표(,), 마침표(.), 느낌표 중복 등 원래 문구에 없는 불필요한 문장부호를 절대 추가하지 마세요. 워터마크, 격자선, 셀 테두리, 구분선, 크롭 마크, 외곽 프레임, 바운딩 박스, 한 셀 안의 캐릭터 중복, 팔다리 누락/추가, 반신·흉상 컷, 실사 느낌, 얼굴 왜곡, 15개 셀 간 얼굴·체형·의상 불일치 절대 금지.`;
    }

    // English Version (Matches User Preferred Exact Template)
    const referenceInstruction = characterSource === 'photo'
      ? `If an image is attached with this prompt, use its key visual features as reference for the character design (${getPhotoModeLabel('en')}).`
      : 'Preserve the same character identity and key visual features strictly across all stickers.';

    const grokProportions = characterSource === 'photo' ? {
      exact: "Caricature-style 2D sticker that realistically reproduces the subject's actual face proportions, facial structure, eye shape, nose, lips, jawline, hairstyle, and skin tone matching photo.",
      features: "Stylish 2D character avatar sticker designed around signature points (hairstyle, glasses if any, outfit, body type, overall vibe).",
      characterize: "Adorable 2.5-head Chibi SD manga/anime mascot proportion with a big round head, huge sparkling expressive eyes, chubby cheeks, and cute sticker styling.",
    }[photoReferenceMode] : 'Adorable 2.5-head Chibi SD manga/anime mascot proportion with a big round head, huge sparkling expressive eyes, chubby cheeks, and cute sticker styling.';

    if (generationMode === 'individual' || hasPhraseOverride) {
      const textPolicy = grokTextMode === 'text'
        ? `Render the exact phrase "${targetPhrase}" once in playful hand-drawn typography beside the character. No parentheses (), brackets [], or rectangular text boxes.`
        : `Do not render text, letters, or numbers. Use "${targetPhrase}" only as visual context for expression and pose.`;
      const textExclusion = grokTextMode === 'text'
        ? 'No extra words, altered spelling, random letters, numbers, parentheses, or text boxes.'
        : 'No text, letters, numbers, typography, or meaningless symbols.';

      return `Create a high-end 2D messenger sticker (KakaoTalk / LINE style) featuring one consistent character. Square canvas, high resolution.

[CRITICAL IDENTITY LOCK — NATURAL FACIAL RESEMBLANCE (NO DISTORTION)]
Replicate the key facial identity from reference photo (eye angle, nose bridge, lips, jawline, hairstyle) preserving 90%+ natural likeness.
[STRICT DISTORTION PREVENTION]: Do NOT warp, distort, or contort facial features. Maintain balanced, clean 2D facial anatomy with harmonious proportions.
${referenceInstruction}
Subject: ${character.subject}
Appearance & Features: ${character.appearance}
Outfit: ${character.outfit}
Art Style Mechanical Specifications (Strict Compliance Required):
  * Main Style: ${character.artStyle} (${grokProportions})
  * Linework: Uniform 3-4px crisp black vector line art with continuous unbroken edges.
  * Coloring: Precision 2-tone cell shading only (base color + 1 shade level), absolutely NO soft gradients or airbrush washes.
  * Palette: High-saturation flat color palette limited to 5-6 clean colors (skin, hair, top, bottom, accent color).
  * Proportions: 2.5 to 3-head SD (Super Deformed) character body ratio.
  * Benchmark Quality: KakaoTalk Emoticon Studio approved quality, LINE Friends character rendering style.
  * Strict Prohibitions: Do NOT use 3D rendering, semi-realistic shading, realistic texture, or glossy gradient highlights.

[QUALITY & UNIFORMITY RULE]
Render the character at a high level of facial detail, linework sharpness, and color saturation. Primarily full-body with a natural mix of expressive upper-body shots matching the emotion.

[SCENE, EXPRESSION & POSE]
Emotional Context / Mood: "${targetPhrase}"
Infer a unique, highly expressive facial emotion and dynamic full-body posture matching "${targetPhrase}".
Minimal supporting props or sparkle effects only when they clarify the emotion — keep accents small and simple (${character.props}, ${character.effects}).

[BACKGROUND & DIE-CUT LAYOUT]
Each character has a crisp white sticker die-cut outline clearly visible around its silhouette. ${getGrokBackgroundInstruction()}

[CHARACTER CONSISTENCY]
If a previous sticker image exists in this chat, maintain identical face, body proportions, color palette, outfit, and art style. Vary only pose, facial expression, and the minimal prop/effect needed for this emotion.

[TEXT POLICY]
${textPolicy}

[NEGATIVE PROMPT]
${textExclusion} No watermark, no outer frame, no bounding boxes, no duplicate character, no missing or extra limbs, no half-body/bust-only shots, no photorealism, no facial distortion.`;
    }

    const panelPlan = emoticons.map((phrase, index) => `${index + 1}. "${phrase.trim()}" – ${getPhraseActionEn(phrase)}`).join('\n');
    const textPolicy = grokTextMode === 'text'
      ? `[HIGH-PRECISION KOREAN TYPOGRAPHY DIRECTIVE] ${getEmotionTextColorGuideEn(emoticons)} Render each quoted Korean phrase beside or above its corresponding character in playful hand-drawn calligraphy typography. No parentheses (), brackets [], or rectangular text boxes.`
      : 'Korean phrases above are emotional context only — do not render any text, letters, or numbers in the image.';
    const textExclusion = grokTextMode === 'text'
      ? 'No extra words, altered spelling, random letters, sticker numbers, parentheses, quotation marks, or text boxes.'
      : 'No text, no letters, no numbers, no speech bubbles, no sticker labels, no meaningless symbols.';

    return `Create a master 15-cell KakaoTalk/LINE sticker sheet featuring one consistent character arranged in a 3-row × 5-column grid layout with generous spacing between characters. Square canvas, high resolution. No grid lines, no cell borders, no numbers.

[CHARACTER LOCK — IDENTICAL ACROSS ALL 15 CELLS]
${referenceInstruction}
Subject: ${character.subject}
Appearance & Features: ${character.appearance}
Outfit: ${character.outfit}
Art Style Mechanical Specifications (Strict Compliance Required):
  * Main Style: ${character.artStyle} (${grokProportions})
  * Linework: Uniform 3-4px crisp black vector line art with continuous unbroken edges.
  * Coloring: Precision 2-tone cell shading only (base color + 1 shade level), absolutely NO soft gradients or airbrush washes.
  * Palette: High-saturation flat color palette limited to 5-6 clean colors (skin, hair, top, bottom, accent color).
  * Proportions: 2.5 to 3-head SD (Super Deformed) character body ratio.
  * Benchmark Quality: KakaoTalk Emoticon Studio approved quality, LINE Friends character rendering style.
  * Strict Prohibitions: Do NOT use 3D rendering, semi-realistic shading, realistic texture, or glossy gradient highlights.

[QUALITY & UNIFORMITY RULE]
Render all 15 characters at the exact same level of facial detail, linework sharpness, and color saturation across the entire sheet — no degradation toward edges or bottom rows. Primarily full-body with a natural mix of expressive upper-body shots matching the emotion.

[15 STICKER POSES]
Do NOT repeat standing postures across cells. Incorporate at least 6 or more distinctly different body postures (such as sitting, jumping, crouching, lying down, kneeling, leaning). Simply tweaking arm positions while standing is strictly forbidden. Infer a unique, highly expressive facial emotion and dynamic full-body posture for each cell, based on the following emotional context:
${panelPlan}
Minimal supporting props or sparkle effects only when they clarify the emotion — keep accents small and simple (${character.props}, ${character.effects}).

[BACKGROUND & DIE-CUT LAYOUT]
Each character has a crisp white sticker die-cut outline clearly visible around its silhouette. All 15 stickers float freely in the 3-row × 5-column arrangement. ${getGrokBackgroundInstruction()} Absolutely no grid lines, no cell borders, no table dividers, no crop marks, no bounding boxes, no sticker numbers.

[CHARACTER CONSISTENCY]
All 15 stickers must strictly share the same face, body proportions, color palette, outfit, and art style. Vary only pose, facial expression, and the minimal prop/effect needed for each emotion.

[TEXT POLICY]
${textPolicy}

[NEGATIVE PROMPT]
${textExclusion} Do NOT add any unrequested trailing punctuation marks at the end of phrases such as trailing commas (,), periods (.), or duplicate exclamation marks. No watermark, no grid lines, no cell borders, no table dividers, no crop marks, no outer frame, no bounding boxes, no duplicate character within a single cell, no missing or extra limbs, no half-body/bust-only shots, no photorealism, no facial distortion, no inconsistent face/body/outfit across the 15 cells.`;
  };

  const getRepairPrompt = (repairType, textMode, model = 'gpt') => {
    const targetPhrase = getSelectedPhrase();

    const modelTag = {
      gpt: lang === 'ko' ? '[대상 AI: ChatGPT (OpenAI / DALL-E 3 엔진)]' : lang === 'ja' ? '[対象AI: ChatGPT (OpenAI / DALL-E 3)]' : lang === 'zh' ? '[目标AI: ChatGPT (OpenAI / DALL-E 3)]' : '[TARGET AI: ChatGPT (OpenAI / DALL-E 3 Engine)]',
      gemini: lang === 'ko' ? '[대상 AI: Gemini (Google / Imagen 3 엔진)]' : lang === 'ja' ? '[対象AI: Gemini (Google / Imagen 3)]' : lang === 'zh' ? '[目标AI: Gemini (Google / Imagen 3)]' : '[TARGET AI: Gemini (Google / Imagen 3 Engine)]',
      grok: lang === 'ko' ? '[대상 AI: Grok (xAI / Flux.1 엔진)]' : lang === 'ja' ? '[対象AI: Grok (xAI / Flux.1)]' : lang === 'zh' ? '[目标AI: Grok (xAI / Flux.1)]' : '[TARGET AI: Grok (xAI / Flux.1 Engine)]',
    }[model] || '';

    const defaultTrait = {
      ko: '동글동글 귀여운 마스코트',
      ja: 'まん丸でかわいいマスコット',
      zh: '圆滚滚可爱的吉祥物',
      en: 'Cute round mascot character',
    }[lang] || 'Cute mascot';

    const currentCharTrait = charManual.trim() || defaultTrait;

    // 1. Korean Repair Prompts
    if (lang === 'ko') {
      const repairPromptsKo = {
        identity: `${modelTag}
[긴급 시각 수정: 캐릭터 얼굴 및 외형 재작업]
직전 생성된 이미지에서 캐릭터의 얼굴과 이목구비가 변형되었습니다. 기존의 포즈와 배경은 유지하되, 캐릭터의 얼굴, 헤어/귀, 눈매, 체형을 다음 정의에 맞춰 눈에 띄게 다시 그려주세요:
👉 캐릭터 원본 정의: "${currentCharTrait}"
얼굴 왜곡을 완벽히 바로잡고, 해당 캐릭터의 고유 외형이 100% 확실하게 반영된 새로운 보정본 1장을 즉시 생성하세요.`,

        crop: `${modelTag}
[긴급 구도 수정: 카메라 줌아웃 및 전신 여백 확보]
직전 이미지에서 캐릭터의 머리나 발끝이 프레임에 잘렸습니다!
카메라 시점을 뒤로 30% 줌아웃(Zoom Out)하여 캐릭터 크기를 줄여주세요.
머리끝(귀/모자 포함)부터 발끝까지 전신이 화면 한가운데에 완벽하게 쏙 들어오고, 상하좌우에 최소 20%의 여백이 남도록 구도를 완전히 재배치해서 다시 그려주세요.`,

        text: `${modelTag}
[긴급 텍스트 수정: 기존 오타 지우고 한글 재인쇄]
직전 이미지의 글자가 뭉개졌거나 오탈자가 있습니다.
기존에 적힌 이상한 글자를 완전히 지우고, 캐릭터 옆에 오직 한글 "${targetPhrase}"라는 단어만 크고 선명한 스티커 폰트로 정확하게 인쇄해 주세요. (추가 오타 절대 금지)`,
      };
      return repairPromptsKo[repairType];
    }

    // 2. Japanese Repair Prompts
    if (lang === 'ja') {
      const repairPromptsJa = {
        identity: `${modelTag}
[緊急修正: キャラクターの顔と外見の再描画]
直前の画像でキャラクターの顔や特徴が崩れてしまいました。ポーズと背景は維持したまま、顔、目、耳/髪型、体型を以下の定義に合わせて明確に描き直してください:
👉 キャラクターの元デザイン: "${currentCharTrait}"
顔の歪みを修正し、キャラクターの個性が100%反映された新しい修正版を1枚生成してください。`,

        crop: `${modelTag}
[緊急修正: カメラのズームアウトと全身の余白確保]
直前の画像でキャラクターの頭や足先が見切れてしまいました！
カメラを30%ズームアウトしてキャラクターサイズを調整してください。
頭（耳/帽子含む）から足先まで全身が中央に完全に収まり、四方に最低20%の余白ができるように構図を再配置して描き直してください。`,

        text: `${modelTag}
[緊急修正: 誤字を消去してテキストを正確に再印字]
直前の画像の文字が崩れているか誤字があります。
不正確な文字を完全に消去し、キャラクターの横に日本語で「${targetPhrase}」というフレーズのみを、くっきりと読みやすいステッカーフォントで正確に描いてください。`,
      };
      return repairPromptsJa[repairType];
    }

    // 3. Chinese Repair Prompts
    if (lang === 'zh') {
      const repairPromptsZh = {
        identity: `${modelTag}
[紧急修正: 重新绘制角色面部与特征]
上一张图片中的角色面部特征发生了变形。请保持当前的姿势和背景，并严格按照以下定义明显重绘面部、五官、发型/耳朵及体型:
👉 角色原始设定: "${currentCharTrait}"
彻底修复面部扭曲，生成一张100%还原该角色外观的全新修正图。`,

        crop: `${modelTag}
[紧急修正: 镜头拉远并确保全身完整及边距]
上一张图片中角色的头部或脚部被边缘裁剪了！
请将镜头向后拉远(Zoom Out) 30%以缩小角色比例。
确保从头顶（包括耳朵/帽子）到脚尖的全身完整显示在画面正中央，且四周保留至少20%的充足白色边距。`,

        text: `${modelTag}
[紧急修正: 清除错别字并准确重印文本]
上一张图片中的文字模糊或出现了错别字。
请彻底清除错误的文字，仅在角色身旁用清晰醒目的贴纸字体准确印上中文“${targetPhrase}”。（严禁出现多余错字）`,
      };
      return repairPromptsZh[repairType];
    }

    // 4. English / Global Default Repair Prompts
    const repairPromptsEn = {
      identity: `${modelTag}
[URGENT VISUAL CORRECTION — REDRAW CHARACTER FACE & IDENTITY]
In the previous image, the character's facial features and silhouette were distorted. Keep the current pose and background, but visibly REDRAW the face, ears/hair, eyes, and body proportions to strictly match:
👉 Target Character Blueprint: "${currentCharTrait}"
Fix any facial distortion and return one crisp, corrected image with distinct character fidelity.`,

      crop: `${modelTag}
[URGENT COMPOSITION FIX — ZOOM OUT & FULL BODY MARGINS]
In the previous image, parts of the character (head/feet) were cropped or touching the edges!
ZOOM OUT the camera by 30% to shrink the character inside the frame.
Ensure the ENTIRE full body from head to toe is 100% visible inside the canvas with at least 20% clear margin on all four sides. No clipping allowed!`,

      text: `${modelTag}
[URGENT TEXT FIX — ERASE & REPRINT EXACT TEXT]
The text in the previous image was blurry or misspelled.
Completely ERASE the incorrect lettering and reprint ONLY the exact clean text "${targetPhrase}" in a bold, highly legible sticker typography without any spelling errors.`,
    };
    return repairPromptsEn[repairType];
  };

  const copyRepairPrompt = (repairType, textMode, keyPrefix = 'repair', model = 'gpt') => {
    navigator.clipboard.writeText(getRepairPrompt(repairType, textMode, model));
    setCopiedType(`${keyPrefix}-${repairType}`);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const getPreviewPrompt = () => {
    const phraseOverride = generationMode === 'batch' ? getSelectedPhrase() : null;
    const error = getPromptValidationError(phraseOverride);
    if (error) return error;
    if (previewMode === 'gpt') return generateGptPrompt(phraseOverride);
    if (previewMode === 'gemini') return generateGeminiPrompt(phraseOverride);
    return generateGrokPrompt(phraseOverride);
  };

  const launchAiCompanion = (type, selectedPhraseOverride = null) => {
    const phraseOverride = selectedPhraseOverride ?? (generationMode === 'batch' ? getSelectedPhrase() : null);
    if (getPromptValidationError(phraseOverride)) return;
    
    const textToCopy = type === 'gpt'
      ? generateGptPrompt(phraseOverride)
      : type === 'gemini'
        ? generateGeminiPrompt(phraseOverride)
        : generateGrokPrompt(phraseOverride);

    // 1. Copy to clipboard
    navigator.clipboard.writeText(textToCopy);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 3000);

    // 2. Determine target URL
    let targetUrl = 'https://chatgpt.com/';
    let toastName = 'ChatGPT';

    if (type === 'gpt') {
      targetUrl = `https://chatgpt.com/?q=${encodeURIComponent(textToCopy)}`;
      toastName = 'ChatGPT';
    } else if (type === 'gemini') {
      targetUrl = 'https://gemini.google.com/app';
      toastName = 'Google Gemini';
    } else if (type === 'grok') {
      targetUrl = 'https://grok.com/';
      toastName = 'xAI Grok';
    }

    // 3. Open side-by-side companion split window on desktop
    const width = Math.min(880, Math.floor(window.screen.availWidth * 0.52));
    const height = window.screen.availHeight || 900;
    const left = Math.max(0, window.screen.availWidth - width);
    const top = 0;

    const popupFeatures = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`;
    
    const popup = window.open(targetUrl, `AI_Companion_${type}`, popupFeatures);
    if (popup) {
      showToast(lang === 'ko' 
        ? `📋 프롬프트 자동 복사 완료! 우측 ${toastName} 창에서 [Ctrl + V]로 붙여넣으세요.` 
        : `📋 Prompt auto-copied! Press [Ctrl + V] in the ${toastName} side window.`);
    } else {
      window.open(targetUrl, '_blank');
      showToast(lang === 'ko' 
        ? `📋 프롬프트 자동 복사 완료! 새 창에서 [Ctrl + V]로 붙여넣으세요.` 
        : `📋 Prompt auto-copied! Press [Ctrl + V] in the new tab.`);
    }
  };

  const copyToClipboard = (type, selectedPhraseOverride = null, copyKey = type) => {
    const phraseOverride = selectedPhraseOverride ?? (generationMode === 'batch' ? getSelectedPhrase() : null);
    if (getPromptValidationError(phraseOverride)) return;
    const textToCopy = type === 'gpt'
      ? generateGptPrompt(phraseOverride)
      : type === 'gemini'
        ? generateGeminiPrompt(phraseOverride)
        : generateGrokPrompt(phraseOverride);
    navigator.clipboard.writeText(textToCopy);
    setCopiedType(copyKey);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const promptValidationError = getPromptValidationError(
    generationMode === 'batch' ? getSelectedPhrase() : null
  );
  const visiblePromptValidationError = promptValidationError;

  return (
    <div className={`font-body-md text-body-md antialiased pb-32 max-w-full w-full ${lang === 'zh' ? 'lang-zh' : ''}`}>
      {/* TopAppBar */}
      <header className="w-full top-0 bg-background/95 backdrop-blur-md z-50 sticky border-b border-outline-variant/30 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-container-margin min-h-14 py-2 w-full">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <h1 className="brand-logo text-[18px] sm:text-[22px] leading-none font-extrabold text-primary-strong tracking-tight whitespace-nowrap flex items-center gap-1.5">
              <span>Prompt Maker</span>
            </h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button 
              onClick={() => {
                const el = document.getElementById('guide-section');
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 80;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }}
              className="interactive-control flex items-center gap-1 min-h-9 px-2 sm:px-3 py-1 rounded-full bg-[#FFF4E5] border border-[#FFE8CC] text-[#8A4B00] text-[12px] sm:text-[13px] font-bold hover:bg-[#FFE8CC] shadow-sm whitespace-nowrap shrink-0"
            >
              <span className="text-[13px] sm:text-[14px]">💡</span>
              <span>{lang === 'ko' ? '꿀팁' : lang === 'ja' ? 'ガイド' : lang === 'zh' ? '指南' : 'Guide'}</span>
            </button>
            <div className="flex items-center gap-0.5 sm:gap-1 bg-surface-container-lowest p-0.5 sm:p-1 rounded-full border border-outline-variant shadow-sm shrink-0" role="group" aria-label="Language Selector">
              {[
                ['ko', 'KO', '한국어'],
                ['en', 'EN', 'English'],
                ['ja', 'JA', '日本語'],
                ['zh', 'ZH', '中文'],
              ].map(([code, shortLabel, fullLabel]) => (
                <button
                  key={code}
                  type="button"
                  aria-pressed={lang === code}
                  onClick={() => changeLanguage(code)}
                  className={`brand-logo interactive-control w-8 sm:w-9 h-7 sm:h-8 flex items-center justify-center text-[11px] sm:text-[12px] font-extrabold rounded-full transition-all ${
                    lang === code
                      ? 'bg-mint text-mint-strong shadow-xs border border-mint-border'
                      : 'text-on-surface-variant hover:bg-mint-soft'
                  }`}
                  title={fullLabel}
                >
                  <span>{shortLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-container-margin mt-md md:mt-lg flex flex-col gap-4 sm:gap-5">
        {/* App Intro Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#FFD3B6] via-[#FFE8B6] to-[#FFC2C2] text-[#5C3A21] p-4 sm:p-6 md:p-xl rounded-md shadow-bubbly text-center flex flex-col items-center justify-center gap-3 sm:gap-4 md:gap-6 border-2 sm:border-4 border-white max-w-full w-full">
          {/* Decorative floating emojis */}
          <div className="absolute top-6 left-8 hidden sm:block text-[40px] transform -rotate-12 drop-shadow-md">✨</div>
          <div className="absolute bottom-8 left-12 hidden sm:block text-[48px] transform rotate-12 drop-shadow-md">🎨</div>
          <div className="absolute top-12 right-12 hidden sm:block text-[48px] transform rotate-12 drop-shadow-md">🚀</div>
          <div className="absolute bottom-10 right-10 hidden sm:block text-[40px] transform -rotate-12 drop-shadow-md">💖</div>
          
          <div className="z-10 flex flex-col gap-2 sm:gap-3 w-full max-w-full px-1">
            <span className="brand-logo inline-block bg-white/70 text-[#5C3A21] font-black text-[12px] sm:text-[14px] tracking-wider px-3.5 sm:px-4.5 py-1.5 rounded-full backdrop-blur-sm border border-white/90 mx-auto shadow-sm max-w-full text-ellipsis overflow-hidden">
              {lang === 'ko' 
                ? '✨ AI 이모티콘 프롬프트 메이커' 
                : lang === 'ja' 
                ? '✨ AIスタンププロンプトメーカー' 
                : lang === 'zh' 
                ? '✨ AI表情包提示词生成器' 
                : '✨ AI Emoticon Prompt Maker'}
            </span>
            <h2 className="text-[18px] xs:text-[22px] sm:text-[28px] md:text-[38px] font-black tracking-tight leading-snug drop-shadow-sm w-full max-w-full px-1 [word-break:keep-all] [text-wrap:balance]">
              {(() => {
                const text = t.guide1Q.replace('🤔 ', '');
                const match = text.match(/^(.*?)(\S{2,}[\?？!！]?)$/);
                if (match) {
                  return (
                    <>
                      {match[1]}
                      <span className="inline-block whitespace-nowrap">{match[2]}</span>
                    </>
                  );
                }
                return text;
              })()}
            </h2>
          </div>
          
          <p className="z-10 text-[13px] sm:text-[15px] md:text-[17px] leading-relaxed max-w-2xl mx-auto font-bold bg-white/40 p-3.5 sm:p-5 rounded-md backdrop-blur-md border border-white/60 shadow-sm whitespace-pre-wrap [word-break:keep-all] w-full">
            {t.guide1A}
          </p>
        </section>

        {/* Section 1: Character Setup */}
        <section className="flex flex-col gap-md">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">{t.step1}</h2>
              <div className="flex items-center gap-2">
                <button onClick={clearTags} className="flex items-center gap-1.5 min-h-10 px-3 py-1.5 text-[13px] font-bold text-error hover:bg-red-50 border border-error/20 hover:border-error/40 rounded-lg transition-all cursor-pointer">
                  <Trash2 size={14} /> {t.clear}
                </button>
              </div>
            </div>
            
            {/* Live Active Settings Status Banner (Strict 1-Line Clean Header) */}
            <div className="bg-[#EAF8F3] text-mint-strong rounded-lg px-3.5 py-2.5 shadow-bubbly flex items-center justify-between gap-3 border border-mint-border overflow-hidden">
              <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
                <span className="bg-[#C5F2E3] text-[#184F43] border border-[#A6E3D0] text-[11px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wide shadow-xs">
                  ⚡ {lang === 'ko' ? '실시간 프롬프트 적용 중' : 'Live Prompt Active'}
                </span>
                <span className="text-[13px] font-bold text-mint-strong whitespace-nowrap">
                  {characterSource === 'photo' 
                    ? `📸 ${lang === 'ko' ? '참고 사진' : 'Photo Reference'} (${getPhotoModeLabel(lang)})`
                    : characterSource === 'random'
                    ? `🎲 ${lang === 'ko' ? '랜덤 캐릭터 모드' : 'Random Character'}`
                    : `✏️ ${lang === 'ko' ? '직접 캐릭터 설정' : 'Direct Character Setup'}`}
                </span>
              </div>
              <div 
                className="min-w-0 flex-1 text-right text-[12px] font-bold text-mint-strong/90 truncate cursor-default whitespace-nowrap" 
                title={charManual.trim() ? `${lang === 'ko' ? '적용된 태그:' : 'Active Tags:'} ${charManual}` : ''}
              >
                {charManual.trim() 
                  ? `${lang === 'ko' ? '적용된 태그:' : 'Active Tags:'} ${charManual}` 
                  : (lang === 'ko' ? '태그 미선택 (기본 2D 캐릭터 자동 적용)' : 'No tags (Default 2D character active)')}
              </div>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest rounded-md p-3.5 sm:p-md shadow-bubbly border border-outline-variant">
            <div className="mb-md flex flex-col gap-3">
              <span className="px-1 text-[13px] font-bold text-on-surface-variant">{t.characterSource}</span>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label={t.characterSource}>
                {[
                  ['direct', t.directSource],
                  ['random', t.randomSource],
                  ['photo', t.photoSource],
                ].map(([source, label]) => (
                  <button
                    key={source}
                    type="button"
                    aria-pressed={characterSource === source}
                    onClick={() => {
                      if (source !== characterSource) {
                        setCharacterSource(source);
                        if (source === 'random') {
                          generateRandomCharacter();
                        }
                      }
                    }}
                    className={`interactive-control min-h-11 rounded-[8px] border px-2 sm:px-3 py-2 text-[13px] sm:text-[14px] font-bold text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-strong focus-visible:ring-offset-2 cursor-pointer ${
                      characterSource === source
                        ? 'bg-mint text-mint-strong border-mint-border shadow-sm ring-1 ring-mint-border'
                        : 'bg-white text-on-surface border-outline-variant hover:bg-mint-soft'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {characterSource === 'random' && (
                <div className="rounded-xl border-2 border-amber-300 bg-linear-to-r from-amber-50 via-[#FFF8E7] to-orange-50/80 p-4 flex flex-col gap-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[26px]">🎲</span>
                      <div>
                        <div className="text-[14px] font-extrabold text-amber-950">
                          {lang === 'ko' ? 'AI 추천 황금 조합 캐릭터' : lang === 'ja' ? 'AIおすすめ黄金組み合わせ' : lang === 'zh' ? 'AI推荐黄金组合角色' : 'AI-Curated Golden Combination'}
                        </div>
                        <div className="text-[12px] text-amber-800 font-medium">
                          {lang === 'ko' ? '버튼을 누를 때마다 개성 넘치는 완성형 캐릭터 조합이 즉시 자동 세팅됩니다.' : lang === 'ja' ? 'ボタンを押すたびにユニークな組み合わせが即座に自動生成されます。' : lang === 'zh' ? '每次点击都会立即自动生成充满个性的完整角色组合。' : 'A complete unique character combo is generated instantly with each roll.'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={generateRandomCharacter}
                      className="interactive-control flex items-center justify-center gap-2 min-h-11 px-5 py-2 text-[14px] font-extrabold text-[#5C3B00] bg-linear-to-r from-[#FFE58F] to-[#FFD666] hover:from-[#FFD666] hover:to-[#FFC069] border border-[#E8B339] rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer w-full sm:w-auto shrink-0 active:scale-95"
                    >
                      <span className="text-[17px]">🎲</span>
                      <span>{t.rerollRandom || (lang === 'ko' ? '다른 캐릭터 다시 뽑기' : 'Re-roll Character')}</span>
                    </button>
                  </div>
                </div>
              )}

              {characterSource === 'photo' && (
                <div className="rounded-lg border-2 border-amber-300 bg-amber-50/90 p-4 flex flex-col gap-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-amber-900 flex items-center gap-1.5">
                      📸 {lang === 'ko' ? '참고 사진 + 캐릭터 태그 융합 중' : 'Photo Reference + Character Tags Active'}
                    </span>
                    <span className="text-[12px] font-bold text-amber-700 bg-amber-200/80 px-2 py-0.5 rounded-full">
                      {lang === 'ko' ? '사진 정체성 기반 적용' : 'Photo Identity Applied'}
                    </span>
                  </div>
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
                  <div className="text-[14px] leading-relaxed text-amber-900 bg-white/90 p-3.5 rounded-lg border border-amber-200 flex flex-col gap-2 shadow-2xs font-normal">
                    <p className="font-bold flex items-center gap-1.5 text-[14px] text-amber-900">
                      💡 {lang === 'ko' ? '사진 참고 모드 (인물 / 동물 / 사물 자유 결합)' : 'Photo Reference Mode (Person / Animal / Object)'}
                    </p>
                    <p className="text-[13px] text-amber-800 leading-normal font-normal">
                      {lang === 'ko'
                        ? '사람 사진뿐만 아니라 반려견/반려묘(동물), 캐릭터/인형/사물 사진도 모두 가능하며 선택하신 태그와 100% 융합됩니다.'
                        : 'Supports photos of people, pets/animals, or objects/characters. All selected tags combine 100% into the prompt.'}
                    </p>
                    <div className="bg-amber-50/80 p-2.5 rounded-md text-[12.5px] text-amber-850 font-normal border border-amber-200/70 leading-normal">
                      <span>✨ {lang === 'ko' ? '예시: 사람 사진을 올리고 [시바견] 태그 선택 시 → [최대한 닮게]: 사진 속 인물이 시바견 인형옷/귀를 쓴 캐릭터 | [귀여운 SD 캐릭터화]: 인상의 분위기를 닮은 2.5등신 시바견 마스코트로 멋지게 융합됩니다!' : 'Example: Person photo + [Shiba Inu] tag → [Exact]: Person wearing Shiba Inu costume | [Chibi]: Cute 2.5-head Shiba Inu mascot matching the person\'s vibe!'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

                        {/* Selected Tags Summary Bar & Real-time Sync Indicator */}
            <div className="mb-3 flex flex-col gap-2">
              <div className="flex items-center justify-between bg-mint-soft/80 border border-mint-border rounded-lg px-3 py-2 text-[12px] font-bold text-mint-strong">
                <span className="flex items-center gap-1.5">
                  ⚡ {lang === 'ko' ? '버튼 클릭 시 입력 상자 & AI 프롬프트 100% 실시간 자동 동기화' : 'Real-time auto-sync to Textbox & Prompts'}
                </span>
                <span className="text-[11px] text-mint-strong/80">
                  {lang === 'ko' ? '태그 재클릭 시 ON/OFF 토글' : 'Click again to toggle ON/OFF'}
                </span>
              </div>

              {charManual.trim() && (
                <div className="bg-[#EAF8F3] border border-mint-border rounded-lg p-3 flex flex-col gap-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-mint-strong flex items-center gap-1.5">
                      🏷️ {lang === 'ko' ? '현재 적용된 캐릭터 태그' : 'Active Character Tags'}
                      <span className="bg-mint-strong text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
                        {charManual.split(',').map(v => v.trim()).filter(Boolean).length}개
                      </span>
                    </span>
                    <button 
                      type="button"
                      onClick={clearTags} 
                      className="text-[12px] font-bold text-error hover:underline flex items-center gap-0.5"
                    >
                      <Trash2 size={12} /> {lang === 'ko' ? '전체 초기화' : 'Clear All'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {charManual.split(',').map(v => v.trim()).filter(Boolean).map(tag => (
                      <span 
                        key={tag} 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-mint-strong border border-mint-border text-[12px] font-bold shadow-xs"
                      >
                        ✓ {tag}
                        <button 
                          type="button"
                          onClick={() => removeSelectedTag(tag)} 
                          className="hover:text-error text-slate-400 font-bold text-[14px] leading-none"
                          title={lang === 'ko' ? '삭제' : 'Remove'}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <textarea 
              className="w-full bg-white border-2 border-mint-border rounded-md p-3.5 sm:p-4 text-on-surface font-bold placeholder:text-on-surface-variant focus:outline-none focus:ring-4 focus:ring-mint focus:border-mint-border resize-y min-h-[100px] shadow-sm" 
              placeholder={t.placeholder}
              value={charManual}
              onChange={(e) => setCharManual(e.target.value)}
            />

            {!charManual.trim() && (
              <div className="mt-3 bg-mint-soft border border-mint-border rounded-md p-3 sm:p-3.5 flex items-start gap-2.5 text-[13px] text-mint-strong">
                <span className="text-[16px] leading-none shrink-0 mt-0.5">💡</span>
                <div className="leading-relaxed">
                  <strong className="font-bold">
                    {lang === 'ko' ? '캐릭터 미설정 시 기본 동작' : lang === 'ja' ? 'キャラクター未設定時のデフォルト動作' : lang === 'zh' ? '未设置角色时的默认选项' : 'Default Character Setting'}
                  </strong>
                  <p className="mt-0.5 opacity-95">
                    {lang === 'ko' 
                      ? '설정을 비워두셔도 AI가 가장 귀엽고 표정이 풍부한 2D 오리지널 캐릭터(기본 의상/화풍)를 자동으로 완성해 드립니다.' 
                      : lang === 'ja'
                      ? '入力欄を空欄のままにしておくと、AIが自動的に可愛く個性豊かな2Dオリジナルキャラクターを設定します。'
                      : lang === 'zh'
                      ? '若留空，AI将默认自动为您生成可爱且表情丰富的2D原创角色。'
                      : 'Leaving this empty automatically generates a cute, highly expressive 2D original character by default.'}
                  </p>
                </div>
              </div>
            )}
            
            {/* Tag Category Selection Rules Info Card & Real-time AI Quality Gauge */}
            <div className="mt-md bg-surface-container-highest rounded-md overflow-hidden border border-mint-border">
              <div className="bg-[#E2F5EE] px-3.5 py-2.5 border-b border-mint-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[13px] font-bold text-mint-strong">
                <span className="flex items-center gap-1.5 flex-wrap">
                  📌 {lang === 'ko' ? '태그 선택 규칙:' : 'Tag Rules:'}
                  <span className="bg-white/90 px-2.5 py-0.5 rounded text-[12px] border border-mint-border">
                    {lang === 'ko' ? '화풍/피사체: 대표 1개 선택' : 'Art/Subject: 1 Main Select'}
                  </span>
                  <span className="bg-white/90 px-2.5 py-0.5 rounded text-[12px] border border-mint-border">
                    {lang === 'ko' ? '의상/소품/성격/효과: 여러 개 다중 선택 가능' : 'Outfit/Props/Effects: Multi-Select'}
                  </span>
                </span>
                <span className="bg-[#C5F2E3] text-[#184F43] border border-[#A6E3D0] px-3 py-0.5 rounded-full text-[12px] font-extrabold shadow-xs shrink-0 self-start sm:self-auto">
                  {getCategoryRuleBadge(activeTagCategory)}
                </span>
              </div>

              {/* Real-time AI Quality Gauge Bar */}
              {(() => {
                const tagCount = charManual.split(',').filter(s => s.trim().length > 0).length;
                if (tagCount === 0) return null;
                const isOptimal = tagCount >= 3 && tagCount <= 5;
                const isTooMany = tagCount > 5;

                return (
                  <div className={`px-3.5 py-2 border-b flex items-center justify-between text-[12px] font-bold transition-all ${
                    isOptimal 
                      ? 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]' 
                      : isTooMany 
                      ? 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
                      : 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      {isOptimal ? '✨ [사진급 최고 화질]' : isTooMany ? '⚠️ [태그 과다 - 퀄리티 저하 주의]' : '💡 [화질 최적화 추천]'}
                      <span>
                        {isOptimal 
                          ? (lang === 'ko' ? 'AI 가중치가 가장 선명하게 집중되는 3~5개 황금 비율 상태입니다! (사진급 일관성)' : 'Golden Ratio! AI attention is 100% focused for crisp sticker quality.')
                          : isTooMany 
                          ? (lang === 'ko' ? '태그가 6개 이상이면 AI가 특징을 뭉갤 수 있으니 4~5개로 줄여보세요.' : 'Too many tags (6+) may dilute AI focus. Reduce to 4-5 for best quality.')
                          : (lang === 'ko' ? '태그를 1~2개 더 조합하시면(의상/소품/화풍) 캐릭터가 더욱 완성도 높게 나옵니다.' : 'Add 1-2 more tags (outfit/prop/style) for full character identity.')}
                      </span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/90 border text-[11px] shrink-0 font-extrabold shadow-2xs">
                      {lang === 'ko' ? `선택 태그: ${tagCount}개` : `Tags: ${tagCount}`}
                    </span>
                  </div>
                );
              })()}

              <div className="no-scrollbar flex flex-wrap bg-[#EAF8F3] px-2 border-b border-mint-border">
                {categoryKeys.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveTagCategory(category)}
                    className={`whitespace-nowrap px-3 py-2 text-[13px] font-bold transition-colors flex items-center gap-1 ${
                      activeTagCategory === category 
                        ? 'text-mint-strong border-b-2 border-mint-strong bg-white/50' 
                        : 'text-mint-strong hover:bg-mint-hover border-b-2 border-transparent'
                    }`}
                  >
                    <span>{category}</span>
                  </button>
                ))}
              </div>
              <div className="p-3 flex flex-wrap gap-2 bg-surface-container-lowest min-h-[80px]">
                {currentTags[activeTagCategory]?.map(tag => {
                  const selected = isTagSelected(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        appendTag(tag);
                      }}
                      aria-pressed={selected}
                      className={`interactive-control min-h-[38px] px-3.5 py-1.5 rounded-full text-[13px] font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                        selected
                          ? 'bg-mint-strong text-white border-2 border-[#1E453B] shadow-md scale-105 ring-2 ring-mint-strong/40 font-black'
                          : 'bg-white text-on-surface hover:bg-mint-soft hover:text-mint-strong border border-outline-variant hover:border-mint-border shadow-xs'
                      }`}
                    >
                      {selected ? (
                        <>
                          <span className="bg-white text-mint-strong text-[10px] px-1.5 py-0.5 rounded-full font-extrabold shrink-0 shadow-xs">✓ ON</span>
                          <span className="font-extrabold">{tag}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-on-surface-variant text-[11px] font-bold shrink-0">+</span>
                          <span>{tag}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Emoji Phrases */}
        <section className="flex flex-col gap-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">{t.phrases}</h2>
              <span className="text-[12px] font-bold text-mint-strong flex items-center gap-1">
                📌 {t.activeThemeLabel || 'Active Theme'}: 
                <span className="bg-mint-soft text-mint-strong border border-mint-border px-2 py-0.5 rounded-full">
                  {activeTheme === 'custom' 
                    ? (t.customTheme || '✏️ Custom Theme')
                    : activeTheme}
                </span>
              </span>
            </div>
            <div className="flex gap-2">
              <select 
                value={currentThemes[activeTheme] ? activeTheme : ''} 
                onChange={handleThemeSelect}
                className="px-3 py-1.5 text-[14px] font-bold rounded-full border border-mint-border bg-surface-container-lowest text-on-surface cursor-pointer focus:outline-none focus:ring-2 focus:ring-mint"
              >
                <option value="" disabled>{t.themeSelect}</option>
                {themeKeys.map((theme, idx) => (
                  <option key={theme} value={theme}>{`${idx + 1}. ${theme}`}</option>
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

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-sm md:gap-md bg-surface-container-lowest rounded-md p-3.5 sm:p-md shadow-bubbly border border-outline-variant">
            {emoticons.map((text, idx) => (
              <input 
                key={idx}
                type="text" 
                value={text}
                onChange={(e) => handleEmoticonChange(idx, e.target.value)}
                className={`interactive-control w-full h-[48px] bg-mint-soft rounded-full px-1.5 sm:px-3 text-center text-mint-strong text-[12px] sm:text-[14px] font-bold tracking-tight placeholder:text-on-secondary-container focus:outline-none focus:ring-2 focus:ring-mint-strong border border-mint-border text-ellipsis overflow-hidden whitespace-nowrap ${
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
          <div className="bg-[#FFF7DF] rounded-md p-3 md:p-4 border border-[#F6D77A] shadow-sm flex flex-col gap-3">
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
                  className={`interactive-control min-h-12 px-3 py-2 rounded-md text-[14px] font-bold border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] focus-visible:ring-offset-2 ${
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
                  className="w-full min-h-12 rounded-md bg-white px-4 text-on-surface font-bold border border-[#E8C66A] focus:outline-none focus:ring-2 focus:ring-[#E8C66A]"
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
                        className={`interactive-control min-h-11 px-3 py-2 rounded-md border font-bold flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] focus-visible:ring-offset-2 ${
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
            <p role="alert" className="rounded-md border border-error/30 bg-[#FFF0F0] px-4 py-3 text-[13px] font-bold text-error">
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
            <h2 className="font-headline-sm text-headline-sm text-on-surface [word-break:break-word]">{t.previewTitle}</h2>
            <div className="flex w-full sm:w-auto bg-mint-soft rounded-full p-1 border border-mint-border shadow-sm">
              <button 
                onClick={() => setPreviewMode('gpt')}
                className={`interactive-control flex-1 sm:flex-none min-h-11 px-3 sm:px-4 py-1.5 text-[13px] sm:text-[14px] font-bold rounded-full ${
                  previewMode === 'gpt' 
                  ? 'bg-mint text-mint-strong shadow-sm border border-mint-border' 
                  : 'text-mint-strong hover:bg-mint-hover'
                }`}
              >
                {t.forGpt}
              </button>
              <button 
                onClick={() => setPreviewMode('gemini')}
                className={`interactive-control flex-1 sm:flex-none min-h-11 px-3 sm:px-4 py-1.5 text-[13px] sm:text-[14px] font-bold rounded-full ${
                  previewMode === 'gemini' 
                  ? 'bg-mint text-mint-strong shadow-sm border border-mint-border' 
                  : 'text-mint-strong hover:bg-mint-hover'
                }`}
              >
                {t.forGemini}
              </button>
              <button 
                onClick={() => setPreviewMode('grok')}
                className={`interactive-control flex-1 sm:flex-none min-h-11 px-3 sm:px-4 py-1.5 text-[13px] sm:text-[14px] font-bold rounded-full ${
                  previewMode === 'grok' 
                  ? 'bg-mint text-mint-strong shadow-sm border border-mint-border' 
                  : 'text-mint-strong hover:bg-mint-hover'
                }`}
              >
                {t.forGrok}
              </button>
            </div>
          </div>
          {previewMode === 'gpt' && (
            <div className="rounded-lg border border-[#F6D77A] bg-[#FFF7DF] p-3 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-[13px] font-bold text-[#795B16]">{t.gptTextMode}</span>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 w-full sm:w-auto" role="group" aria-label={t.gptTextMode}>
                  {[
                    ['text', t.gptIncludeText],
                    ['visual', t.gptNoText],
                  ].map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={gptTextMode === mode}
                      onClick={() => setGptTextMode(mode)}
                      className={`interactive-control min-h-10 rounded-[8px] border px-2 sm:px-3 py-2 text-[12px] sm:text-[13px] font-bold text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] ${
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
                <div className="grid grid-cols-3 gap-1 sm:gap-2 w-full sm:w-auto" role="group" aria-label={t.gptBackgroundMode}>
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
                      className={`interactive-control min-h-10 rounded-[8px] border px-1 sm:px-2 py-2 text-[11px] xs:text-[12px] sm:text-[13px] font-bold text-center text-ellipsis overflow-hidden whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] ${
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
              <div className="flex flex-col gap-2 border-t border-[#E9DFC5] pt-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-bold text-[#795B16]">{t.gptRepairTitle}</span>
                  <span className="text-[12px] font-medium text-[#8A661C] leading-snug">{t.repairHelp}</span>
                </div>
                <div className="grid grid-cols-1 min-[430px]:grid-cols-3 gap-2">
                  {[
                    ['identity', t.geminiRepairIdentity],
                    ['crop', t.geminiRepairCrop],
                    ...(gptTextMode === 'text' ? [['text', t.geminiRepairText]] : []),
                  ].map(([repairType, label]) => (
                    <button
                      key={repairType}
                      type="button"
                      onClick={() => copyRepairPrompt(repairType, gptTextMode, 'gpt-repair', 'gpt')}
                      className="interactive-control min-h-10 rounded-[8px] border border-[#E9DFC5] bg-white px-3 py-2 text-[13px] font-bold text-[#795B16] hover:bg-[#FFF3D8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A]"
                    >
                      {copiedType === `gpt-repair-${repairType}` ? '✓ ' : ''}{label}
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
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 w-full sm:w-auto" role="group" aria-label={t.geminiTextMode}>
                  {[
                    ['text', t.geminiIncludeText],
                    ['visual', t.geminiNoText],
                  ].map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={geminiTextMode === mode}
                      onClick={() => setGeminiTextMode(mode)}
                      className={`interactive-control min-h-10 rounded-[8px] border px-2 sm:px-3 py-2 text-[12px] sm:text-[13px] font-bold text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] ${
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-[13px] font-bold text-[#795B16]">{t.geminiBackgroundMode}</span>
                <div className="grid grid-cols-3 gap-1 sm:gap-2 w-full sm:w-auto" role="group" aria-label={t.geminiBackgroundMode}>
                  {[
                    ['transparent', t.geminiTransparent],
                    ['solid', t.geminiSolid],
                    ['chroma', t.geminiChroma],
                  ].map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={geminiBackgroundMode === mode}
                      onClick={() => setGeminiBackgroundMode(mode)}
                      className={`interactive-control min-h-10 rounded-[8px] border px-1 sm:px-2 py-2 text-[11px] xs:text-[12px] sm:text-[13px] font-bold text-center text-ellipsis overflow-hidden whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] ${
                        geminiBackgroundMode === mode
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
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-bold text-[#795B16]">{t.geminiRepairTitle}</span>
                  <span className="text-[12px] font-medium text-[#8A661C] leading-snug">{t.repairHelp}</span>
                </div>
                <div className="grid grid-cols-1 min-[430px]:grid-cols-3 gap-2">
                  {[
                    ['identity', t.geminiRepairIdentity],
                    ['crop', t.geminiRepairCrop],
                    ...(geminiTextMode === 'text' ? [['text', t.geminiRepairText]] : []),
                  ].map(([repairType, label]) => (
                    <button
                      key={repairType}
                      type="button"
                      onClick={() => copyRepairPrompt(repairType, geminiTextMode, 'gemini-repair', 'gemini')}
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
          {previewMode === 'grok' && (
            <div className="rounded-[8px] border border-[#E8C66A] bg-[#FFF8E8] p-3 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-[13px] font-bold text-[#795B16]">{t.grokTextMode}</span>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 w-full sm:w-auto" role="group" aria-label={t.grokTextMode}>
                  {[
                    ['text', t.grokIncludeText],
                    ['visual', t.grokNoText],
                  ].map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={grokTextMode === mode}
                      onClick={() => setGrokTextMode(mode)}
                      className={`interactive-control min-h-10 rounded-[8px] border px-2 sm:px-3 py-2 text-[12px] sm:text-[13px] font-bold text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] ${
                        grokTextMode === mode
                          ? 'bg-[#FFE8B5] text-[#5A461B] border-[#E8C66A] shadow-sm'
                          : 'bg-white text-[#795B16] border-[#E9DFC5] hover:bg-[#FFF3D8]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-[13px] font-bold text-[#795B16]">{t.grokBackgroundMode}</span>
                <div className="grid grid-cols-3 gap-1 sm:gap-2 w-full sm:w-auto" role="group" aria-label={t.grokBackgroundMode}>
                  {[
                    ['transparent', t.grokTransparent],
                    ['solid', t.grokSolid],
                    ['chroma', t.grokChroma],
                  ].map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={grokBackgroundMode === mode}
                      onClick={() => setGrokBackgroundMode(mode)}
                      className={`interactive-control min-h-10 rounded-[8px] border px-1 sm:px-2 py-2 text-[11px] xs:text-[12px] sm:text-[13px] font-bold text-center text-ellipsis overflow-hidden whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] ${
                        grokBackgroundMode === mode
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
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-bold text-[#795B16]">{t.grokRepairTitle}</span>
                  <span className="text-[12px] font-medium text-[#8A661C] leading-snug">{t.repairHelp}</span>
                </div>
                <div className="grid grid-cols-1 min-[430px]:grid-cols-3 gap-2">
                  {[
                    ['identity', t.geminiRepairIdentity],
                    ['crop', t.geminiRepairCrop],
                    ...(grokTextMode === 'text' ? [['text', t.geminiRepairText]] : []),
                  ].map(([repairType, label]) => (
                    <button
                      key={repairType}
                      type="button"
                      onClick={() => copyRepairPrompt(repairType, grokTextMode, 'grok-repair', 'grok')}
                      className="interactive-control min-h-10 rounded-[8px] border border-[#E9DFC5] bg-white px-3 py-2 text-[13px] font-bold text-[#795B16] hover:bg-[#FFF3D8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A]"
                    >
                      {copiedType === `grok-repair-${repairType}` ? '✓ ' : ''}{label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[13px] leading-relaxed text-[#795B16]">💡 {t.grokWorkflowTip}</p>
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
          <div className="bg-surface-container-lowest rounded-md p-3.5 sm:p-md shadow-[#B8E3D2] border border-outline-variant">
            <textarea 
              className="w-full bg-white border-2 border-outline-variant rounded-md p-4 text-on-surface font-normal focus:outline-none resize-y min-h-[200px] shadow-sm" 
              readOnly
              value={getPreviewPrompt()}
            />
          </div>

        </section>

        {/* Actions: One-Click Launch & Copy Dual Hub */}
        <section className="flex flex-col gap-3 mt-2 pb-4">
          <AdBanner />
          <div className="bg-[#EAF8F3] p-3 rounded-lg border border-mint-border flex items-center justify-between text-[12.5px] font-bold text-mint-strong">
            <span className="flex items-center gap-1.5">
              🚀 {lang === 'ko' 
                ? '원클릭 1초 실행: 버튼 클릭 시 클립보드 자동 복사 + AI 사이트가 즉시 열립니다!' 
                : lang === 'ja'
                ? 'ワンクリック分割起動: プロンプトが自動コピーされ、右側にAI画面が開きます！'
                : lang === 'zh'
                ? '一键分屏启动: 点击后自动复制提示词，并在右侧直接打开AI网站！'
                : 'One-Click Split Launch: Auto-copies prompt & opens AI site in side split window!'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* ChatGPT Action Card */}
            <div className="bg-white p-3.5 rounded-lg border-2 border-[#E8C66A]/60 flex flex-col gap-2 shadow-xs hover:border-[#E8C66A] transition-all">
              <button
                type="button"
                onClick={() => launchAiCompanion('gpt')}
                disabled={Boolean(promptValidationError)}
                className="interactive-control w-full min-h-[52px] rounded-md bg-gradient-to-r from-[#2D7D64] to-[#1E5C49] text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Bot size={20} className="text-[#A6E3D0]" />
                <span>{lang === 'ko' ? '🚀 ChatGPT 실행' : lang === 'ja' ? '🚀 ChatGPT 起動' : lang === 'zh' ? '🚀 ChatGPT 启动' : '🚀 Launch ChatGPT'}</span>
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard('gpt')}
                disabled={Boolean(promptValidationError)}
                className="interactive-control w-full min-h-[38px] rounded-md bg-[#FFF9EE] text-[#7A4F00] border border-[#FFECA1] font-bold text-[13px] flex items-center justify-center gap-1.5 hover:bg-[#FFECA1] cursor-pointer"
              >
                {copiedType === 'gpt' ? <CheckCircle2 size={16} className="text-[#2D7D64]" /> : <CheckCircle2 size={16} className="text-[#7A4F00]" />}
                <span>{copiedType === 'gpt' ? (lang === 'ko' ? '✓ 복사 완료!' : lang === 'ja' ? '✓ コピー完了！' : lang === 'zh' ? '✓ 复制成功！' : '✓ Copied!') : (lang === 'ko' ? '📋 프롬프트만 복사' : lang === 'ja' ? '📋 プロンプトのみコピー' : lang === 'zh' ? '📋 仅复制提示词' : '📋 Copy Prompt')}</span>
              </button>
              <p className="text-[11px] text-slate-500 text-center">
                {lang === 'ko' ? '✨ 자동 텍스트 전달 + 클립보드 복사' : lang === 'ja' ? '✨ 自動入力 + クリップボードコピー' : lang === 'zh' ? '✨ 自动传递文本 + 剪贴板复制' : '✨ Auto text passing + clipboard copy'}
              </p>
            </div>

            {/* Gemini Action Card */}
            <div className="bg-white p-3.5 rounded-lg border-2 border-[#E8C66A]/60 flex flex-col gap-2 shadow-xs hover:border-[#E8C66A] transition-all">
              <button
                type="button"
                onClick={() => launchAiCompanion('gemini')}
                disabled={Boolean(visiblePromptValidationError)}
                className="interactive-control w-full min-h-[52px] rounded-md bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Sparkles size={20} className="text-[#FFECA1]" />
                <span>{lang === 'ko' ? '🚀 Gemini 실행' : lang === 'ja' ? '🚀 Gemini 起動' : lang === 'zh' ? '🚀 Gemini 启动' : '🚀 Launch Gemini'}</span>
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard('gemini')}
                disabled={Boolean(visiblePromptValidationError)}
                className="interactive-control w-full min-h-[38px] rounded-md bg-[#FFF9EE] text-[#7A4F00] border border-[#FFECA1] font-bold text-[13px] flex items-center justify-center gap-1.5 hover:bg-[#FFECA1] cursor-pointer"
              >
                {copiedType === 'gemini' ? <CheckCircle2 size={16} className="text-[#D97706]" /> : <CheckCircle2 size={16} className="text-[#7A4F00]" />}
                <span>{copiedType === 'gemini' ? (lang === 'ko' ? '✓ 복사 완료!' : lang === 'ja' ? '✓ コピー完了！' : lang === 'zh' ? '✓ 复制成功！' : '✓ Copied!') : (lang === 'ko' ? '📋 프롬프트만 복사' : lang === 'ja' ? '📋 プロンプトのみコピー' : lang === 'zh' ? '📋 仅复制提示词' : '📋 Copy Prompt')}</span>
              </button>
              <p className="text-[11px] text-amber-700 font-medium text-center">
                {lang === 'ko' ? '📋 복사 완료! 창 열리면 [Ctrl+V] 누르세요' : lang === 'ja' ? '📋 コピー完了！画面が開いたら [Ctrl+V]' : lang === 'zh' ? '📋 复制成功！打开窗口后按 [Ctrl+V]' : '📋 Copied! Press [Ctrl+V] in Gemini'}
              </p>
            </div>

            {/* Grok Action Card */}
            <div className="bg-white p-3.5 rounded-lg border-2 border-[#E8C66A]/60 flex flex-col gap-2 shadow-xs hover:border-[#E8C66A] transition-all">
              <button
                type="button"
                onClick={() => launchAiCompanion('grok')}
                disabled={Boolean(visiblePromptValidationError)}
                className="interactive-control w-full min-h-[52px] rounded-md bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Zap size={20} className="text-[#DDD6FE]" />
                <span>{lang === 'ko' ? '🚀 Grok 실행' : lang === 'ja' ? '🚀 Grok 起動' : lang === 'zh' ? '🚀 Grok 启动' : '🚀 Launch Grok'}</span>
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard('grok')}
                disabled={Boolean(visiblePromptValidationError)}
                className="interactive-control w-full min-h-[38px] rounded-md bg-[#FFF9EE] text-[#7A4F00] border border-[#FFECA1] font-bold text-[13px] flex items-center justify-center gap-1.5 hover:bg-[#FFECA1] cursor-pointer"
              >
                {copiedType === 'grok' ? <CheckCircle2 size={16} className="text-[#7C3AED]" /> : <CheckCircle2 size={16} className="text-[#7A4F00]" />}
                <span>{copiedType === 'grok' ? (lang === 'ko' ? '✓ 복사 완료!' : lang === 'ja' ? '✓ コピー完了！' : lang === 'zh' ? '✓ 复制成功！' : '✓ Copied!') : (lang === 'ko' ? '📋 프롬프트만 복사' : lang === 'ja' ? '📋 プロンプトのみコピー' : lang === 'zh' ? '📋 仅复制提示词' : '📋 Copy Prompt')}</span>
              </button>
              <p className="text-[11px] text-purple-700 font-medium text-center">
                {lang === 'ko' ? '📋 복사 완료! 창 열리면 [Ctrl+V] 누르세요' : lang === 'ja' ? '📋 コピー完了！画面が開いたら [Ctrl+V]' : lang === 'zh' ? '📋 复制成功！打开窗口后按 [Ctrl+V]' : '📋 Copied! Press [Ctrl+V] in Grok'}
              </p>
            </div>
          </div>
        </section>

        <div className="bg-[#FFF5E6] text-[#8C3D18] p-4 sm:p-5 md:p-6 rounded-md border border-[#FDE0B5] flex gap-3 md:gap-4 items-start shadow-sm mt-2 relative overflow-hidden">
          <div className="absolute -right-4 -top-6 text-[#FCD3A1] opacity-40 text-[120px] sm:text-[140px] transform -rotate-12 select-none pointer-events-none drop-shadow-sm">📸</div>
          <span className="text-[20px] sm:text-[22px] drop-shadow-sm leading-none mt-0.5 relative z-10">📸</span>
          <div className="relative z-10 flex-1 min-w-0">
            <strong className="font-black block mb-1.5 sm:mb-2 text-[15px] sm:text-[17px] tracking-tight text-[#C2410C]">
              {lang === 'ko' 
                ? '✨ 초강력 꿀팁: 사진 첨부로 세상에 하나뿐인 이모티콘 만들기!' 
                : lang === 'ja'
                ? '✨ 超強力なコツ: 写真添付で世界にひとつだけのスタンプ作成！'
                : lang === 'zh'
                ? '✨ 超实用技巧: 附带照片制作独一无二的表情包！'
                : '✨ Pro Tip: Make Emojis from Photos!'}
            </strong>
            <span className="text-[13px] sm:text-[14.5px] leading-relaxed opacity-90 [word-break:break-word] block font-medium mb-3 sm:mb-4 pr-4 sm:pr-16 text-[#8C3D18]">
              {lang === 'ko' 
                ? '이 프롬프트를 복사해서 AI(ChatGPT, Gemini, Grok)에 붙여넣을 때, 본인이나 우리 아이, 반려동물의 사진을 함께 첨부해 보세요. 대상을 똑닮은 완벽한 커스텀 이모티콘 시트가 만들어집니다!' 
                : lang === 'ja'
                ? 'このプロンプトをコピーしてAI(ChatGPT, Gemini, Grok)に貼り付ける際、ご自身や子ども、ペットの写真も一緒に添付してみてください。そっくりなカスタムスタンプシートが作れます！'
                : lang === 'zh'
                ? '将此提示词复制粘贴给AI (ChatGPT, Gemini, Grok) 时，可以同时发送您自己、孩子或宠物的照片。AI将完美还原特征，生成独一无二的专属表情包！'
                : 'When pasting this prompt into AI (ChatGPT, Gemini, or Grok), attach a photo of yourself, your child, or your pet. It will generate a custom emoji sheet!'}
            </span>
            <div className="bg-white/60 rounded-md p-3 sm:p-4 border border-[#FCD3A1]/60 shadow-sm flex flex-col gap-1.5 sm:gap-2 w-full">
              <strong className="text-[#C2410C] text-[13.5px] sm:text-[14.5px] flex items-center gap-1.5 font-bold">
                <span className="text-[15px] sm:text-[16px]">📌</span> 
                {lang === 'ko' 
                  ? 'LLM 첨부 사진 권장 규칙' 
                  : lang === 'ja'
                  ? 'LLM添付写真の推奨ルール'
                  : lang === 'zh'
                  ? 'LLM照片上传建议'
                  : 'Recommended Photo Specs'}
              </strong>
              <ul className="list-disc pl-4 sm:pl-5 opacity-90 text-[#9A3412] font-medium flex flex-col gap-1 sm:gap-1.5 mt-0.5 sm:mt-1 text-[12.5px] sm:text-[13.5px] marker:text-[#C2410C] [word-break:break-word]">
                <li>
                  {lang === 'ko' 
                    ? '크기/비율: 제한 없음 (일반적인 스마트폰 사진 포맷 가능)' 
                    : lang === 'ja'
                    ? 'サイズ/比率: 制限なし (標準的なスマホ写真フォーマット可能)'
                    : lang === 'zh'
                    ? '尺寸/比例: 不限（标准手机照片格式均可）'
                    : 'Size/Ratio: Any standard photo format'}
                </li>
                <li>
                  {lang === 'ko' 
                    ? '권장: 이목구비, 헤어스타일, 모색 등 특징이 선명한 정면 사진 1장' 
                    : lang === 'ja'
                    ? '推奨: 目鼻立ち、ヘアスタイル、毛色などの特徴が鮮明な正面写真1枚'
                    : lang === 'zh'
                    ? '建议: 正面清晰照片1张（五官、发型、毛色等特征明显）'
                    : 'Recommended: Clear front-facing photo showing distinct features'}
                </li>
                <li>
                  {lang === 'ko' 
                    ? '주의: 인물이 너무 작거나 흔들리고 어두운 사진은 피해주세요.' 
                    : lang === 'ja'
                    ? '注意: 人物が小さすぎる、ブレている、暗すぎる写真は避けてください。'
                    : lang === 'zh'
                    ? '注意: 请避免人物太小、模糊或过暗的照片。'
                    : 'Avoid: Blurry, dark, or zoomed-out photos'}
                </li>
                <li>
                  {lang === 'ko' 
                    ? '💡 실물 싱크로율 100% 꿀팁: 15종 시트는 포즈/구도 초안용으로 사용하고, 최종 완성품은 [📋 15종 개별 분할] 모드에서 1장씩 생성하기 (AI가 오직 1명의 이목구비에만 100% 집중하여 사진과 똑같이 생성됨)' 
                    : lang === 'ja'
                    ? '💡 再現度100%のコツ: 全体シートは構図案として使い、仕上げは[15種個別分割]で1枚ずつ生成（AIが1人の顔に100%集中して写真そっくりに生成）'
                    : lang === 'zh'
                    ? '💡 100%还原技巧: 整页作为姿态草稿，最终成品使用[15种单张拆分]模式逐张生成（AI将100%专注于单张面部，精准还原特征）'
                    : '💡 100% Likeness Tip: Use Full Sheet as a pose draft, then generate final stickers one by one with [Batch Split] (AI focuses 100% on a single face for accurate likeness).'}
                </li>
              </ul>
            </div>

            <div className="bg-white/60 rounded-md p-3 sm:p-4 border border-[#FCD3A1]/60 shadow-sm flex flex-col gap-1.5 sm:gap-2 w-full mt-2 sm:mt-3">
              <strong className="text-[#C2410C] text-[13.5px] sm:text-[14.5px] flex items-center gap-1.5 font-bold">
                <span className="text-[15px] sm:text-[16px]">🎯</span> 
                {lang === 'ko' 
                  ? '이모티콘 200% 실전 활용 아이디어' 
                  : lang === 'ja'
                  ? 'スタンプの200%実践活用アイデア'
                  : lang === 'zh'
                  ? '表情包200%实用场景推荐'
                  : 'Creative Ways to Use Your Emojis'}
              </strong>
              <ul className="list-disc pl-4 sm:pl-5 opacity-90 text-[#9A3412] font-medium flex flex-col gap-1 sm:gap-1.5 mt-0.5 sm:mt-1 text-[12.5px] sm:text-[13.5px] marker:text-[#C2410C] [word-break:break-word]">
                <li>
                  {lang === 'ko' 
                    ? 'SNS 프로필 & 스토리: 내 얼굴이나 반려동물 캐릭터로 인스타, X, 유튜브 프로필 및 감정 아바타로 활용' 
                    : lang === 'ja'
                    ? 'SNSアイコン＆ストーリー: 自分やペットのキャラでInstagram、X、LINEのアイコンやリアクションに'
                    : lang === 'zh'
                    ? '社交头像与动态贴纸: 将自己或宠物的卡通形象用于微信、小红书、微博头像及动态表情'
                    : 'SNS Profiles & Avatars: Use custom characters as profile icons or story stickers on Instagram, X, or YouTube.'}
                </li>
                <li>
                  {lang === 'ko' 
                    ? '메신저 톡방 감정 짤: 배경 투명화 후 스마트폰 앨범에 저장해 친구·가족 톡방에서 개성 넘치는 리액션 짤로 전송' 
                    : lang === 'ja'
                    ? 'メッセンジャートークのリアクション: 背景透過してスマホに保存し、LINE等のトークルームで特製スタンプとして送信'
                    : lang === 'zh'
                    ? '群聊斗图专属表情: 抠图透明化后保存至手机相册，在聊天群中一键发送专属趣味表情'
                    : 'Messenger Chat Reactions: Save transparent PNGs to your phone gallery and send unique personalized reaction stickers in chats.'}
                </li>
                <li>
                  {lang === 'ko' 
                    ? '블로그 포스팅 & 디지털 다꾸: 네이버 블로그 글 중간 포인트 스티커, 굿노트·노션 다이어리 스탬프로 장식' 
                    : lang === 'ja'
                    ? 'ブログ＆デジタル手帳の装飾: ブログ記事のアクセントやGoodNotes・Notionの手帳デコレーションスタンプに'
                    : lang === 'zh'
                    ? '博客插图与电子手帐: 用于博客文章点缀、GoodNotes、Notion 电子手帐及日程标记'
                    : 'Blog & Digital Planner Decor: Decorate blog posts, GoodNotes journals, or Notion pages with custom sticker stamps.'}
                </li>
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
            © {new Date().getFullYear()} Prompt Maker. All rights reserved.
          </p>
          <p className="text-[12px] text-[#A69B8F]">
            {lang === 'ko' 
              ? '* 본 서비스는 카카오(Kakao) 및 라인(LINE)과 공식적인 관련이 없습니다.' 
              : lang === 'ja'
              ? '* 本サービスはLINEまたはKakaoTalkと公式に提携しているものではありません。'
              : lang === 'zh'
              ? '* 本服务非微信、LINE或KakaoTalk官方合作服务。'
              : '* This service is not officially affiliated with Kakao or LINE.'}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
