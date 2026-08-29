// AI 이모티콘 프롬프트 메이커 메인 애플리케이션
import React, { useState, useEffect, useRef } from "react";
import { Shuffle, CheckCircle2, Bot, Sparkles, Zap, Trash2, RotateCcw } from "lucide-react";

const THEMES_KO = {
  '일상/인사 ①': ['ㅋㅋㅋㅋ', '안녕!', '오늘도 화이팅', '좋아요', '고마워요', '사랑해요', '최고!', '오예', '미안해요', '수고했어요', '축하해요', '대박', '헐', '감동', '잘자요'],
  '일상/인사 ②': ['잘 부탁드려요', '무슨 일이야?', '밥 먹었어?', '보고 싶다', '좋은 아침!', '심심해', '어디야?', '놀자!', '힘내!', '응원할게', '최고야!', '완벽해!', '기대돼!', '오늘도 수고했어', '다음에 봐!'],
  '직장인 ①': ['출근 중', '퇴근할게요!', '먼저 퇴근합니다', '확인했습니다', '알겠습니다', '월요병', '월급날!', '커피 수혈 중', '회의 중', '야근 중', '오늘도 고생했어', '불금이다!', '퇴사하고 싶다', '넵!', '살려줘…'],
  '직장인 ②': ['칼퇴 성공!', '확인 부탁드립니다', '잠시만요', '수고하셨습니다', '점심 뭐 먹지?', '일하기 싫다', '영혼 가출', '눈물 찔끔', '할 일이 태산', '답장이 늦었습니다', '수고하세요', '멘붕 상태', '주말만 기다려', '잠깐 쉬는 중', '연차 쓸게요'],
  '학생/학교 ①': ['등교 중', '시험 끝났다!', '망했다…', '끝나고 뭐해?', '과제 폭탄', '지각이다!', '밤샘 공부', '방학 언제 와?', '방학이다!', '자리 바꿔줘', '급식 뭐 나오지?', '교과서 빌려줘', '졸려…', 'A+ 가자!', '졸업 축하해!'],
  '학생/학교 ②': ['학식 먹으러 가자', '수업 중', '필기 좀 보여줘', '쉬는 시간!', '동아리 가는 중', '중간고사 기간', '재수강 각', '독서실 자리 잡음', '학교 가기 싫어', '집에 가고 싶다', '수학여행 기대돼', '체육대회 1등!', '야자 쨀까?', '공부 1도 안 함', '합격 기원!'],
  '주식/재테크 ①': ['가즈아!', '떡상 가자!', '손절합니다…', '존버는 승리한다', '월급 로그아웃', '돈이 복사가 된다고!', '물타기 들어간다', '구조대 언제 와요?', '떡락 중… (눈물)', '익절 완료!', '내 돈 어디 갔어?', '영끌 투자', '한강 가야 하나…', '보너스 받았다!', '주식의 신!'],
  '주식/재테크 ②': ['풀매수 완료', '바닥인 줄 알았는데', '용돈 주세요', '마이너스의 손', '통장 잔고 0원', '텅장', '거지 됐음', '절약 모드 돌입', '플렉스 해버렸지', '파이어족 꿈꾸며', '오늘 내가 쏜다!', '호가창만 보는 중', '원금 회수 완료', '적금 만기!', '돈이 최고야'],
  '게임/게이머 ①': ['치킨이닭!', '캐리했다!', '트롤 그만해', '내 탓 아님', '한 판만 더!', '접속 중', '팀운 실화냐?', '버그 났어', '밤샘 게임', '렉 걸려', '피지컬 지렸다', '캐리 부탁해', 'GG 굿게임', '막타 쳤다', '나 먼저 누울게'],
  '게임/게이머 ②': ['가챠 대박!', '픽뚫 당함…', '현질 완료', '천장 쳤다 (눈물)', '공략 보는 중', '팟 구함 (1/4)', '랭크 승급!', '강등 당함…', '컨트롤 미스', '포지션 양보 좀', '템 파밍 중', '보스 잡으러 가자', '부활시켜 줘', '딜량 1등!', '게임 삭제각'],
  '건강/피곤 ①': ['피곤해 죽겠다', '머리 아파', '일찍 잘래', '약 먹었어?', '허리 아프다', '방전 직전 (배터리 1%)', '힐링 필요해', '병원 가는 중', '건강 챙겨!', '비타민 챙겨 먹어', '카페인 부족', '어깨 결려', '눈이 침침해', '감기 걸렸어', '힘이 안 나…'],
  '건강/피곤 ②': ['기절 직전', '영양제 먹는 중', '삭신이 쑤신다', '꿀잠 잤다!', '스트레칭 중', '숨 쉬기 운동 중', '마사지 받고 싶다', '생존 신고', '무리하지 마', '면역력 저하', '눕방 중', '피로 누적', '따뜻한 차 한 잔', '아프지 마요', '부활 완료!'],
  '유머/밈 ①': ['어쩔티비', '킹받드라슈', '뇌절 금지', '모루게소요', '기강 잡는 중', '쌉가능', '자 드가자~', '너 T야?', '식빵 굽는 중', '머선 129', '레전드다 진짜', '내적 댄스 폭발', '뇌정지 옴', '이게 맞나?', '이선좌 (이미 선택된 좌석)'],
  '유머/밈 ②': ['현타 씨게 옴', '이게 되네?', '할많하않', '중꺾마~', '무물보 (무엇이든 물어보세요)', '주작이지?', '뼈 맞았어 (팩폭)', '이왜진?', '킹리적 갓심', '주접 부리는 중', '팝콘 각', '웃안웃 (웃긴데 안 웃겨)', '현웃 터짐', '팩트 폭행', '안물안궁'],
  '감정표현 ①': ['행복해!', '감동이야 ㅠㅠ', '화났음 (부들부들)', '뿌엥 (울음)', '깜짝이야!', '두근두근 설렘', '심심해 죽겠다', '외로워…', '부끄러워 (발그레)', '무서워 ㅠㅠ', '답답해 죽겠네', '짜증나!', '자신감 뿜뿜', '뿌듯하다', '걱정마!'],
  '감정표현 ②': ['속이 뻥 뚫린다', '멘탈 붕괴', '신난다 오예~', '서운해…', '기분 째짐!', '안도 (휴~)', '질투 폭발', '당황스러움 (땀 삐질)', '충격과 공포', '홀린 듯 쳐다봄', '후회 중…', '억울해 죽겠네', '마음이 따뜻해', '기절초풍', '사랑이 넘쳐요'],
  '커플/연애 ①': ['보고 싶어', '지금 뭐해?', '사랑해 ♥', '평생 함께하자', '꿈에서 만나', '목소리 듣고 싶어', '사진 보내줘', '손잡을래?', '안아줘', '외로워 자기야', '빨리 보고 싶다', '내 사랑', '잘 자 내 꿈꿔', '오늘도 반했어', '심쿵!'],
  '커플/연애 ②': ['데이트 가자!', '어디 갈까?', '기념일 축하해!', '싸우지 말자', '삐졌어 (흥!)', '바람피우면 죽는다', '나 얼마나 사랑해?', '네 편이야 언제나', '설레서 잠이 안 와', '오늘 멋있다/예쁘다', '전화할 수 있어?', '집 앞이야 나와', '커플룩 입자', '네가 제일 좋아', '영원히 사랑해'],
  '가족/부모님 ①': ['식사 챙겨 드세요', '조심히 들어가요', '사랑해요 엄마/아빠', '건강하세요', '용돈 감사해요!', '늘 감사해요', '아프지 마세요', '금방 갈게요!', '엄마 밥 최고!', '아빠 사랑해요', '가족이 최고야', '주말에 갈게요', '감기 조심해요', '자랑스러워요', '효도할게요!'],
  '가족/부모님 ②': ['어디쯤이야?', '일찍 들어와!', '문단속 잘해', '반찬 보냈어', '엄마 보고 싶어', '아빠 최고!', '약 잘 챙겨 드세요', '옷 따뜻하게 입어', '별일 없지?', '용돈 보냈어요', '오래오래 사세요', '가족 여행 가자', '항상 응원해요', '집에 도착했어요', '고마워요!'],
  '음식/다이어트 ①': ['뭐 먹지?', '배고파 죽겠다', '맛있겠다!', '다이어트는 내일부터', '야식 땡긴다', '치킨 시킬까?', '잘 먹었습니다!', '배불러 터짐', '디저트 배는 따로', '먹방 찍는 중', '고기 굽는 중', '카페 가자', 'JMT (존맛탱)', '단짠단짠', '오늘 한턱 쏠게!'],
  '음식/다이어트 ②': ['치팅데이!', '0칼로리 맛있으면', '운동 완료 오운완', '몸무게 줄었다!', '살쪘어 ㅠㅠ', '당 충전 필요', '매운 거 땡겨', '샐러드 먹는 중', '물 2리터 마시기', '먹방 보는 중', '맛집 줄 서는 중', '요리하는 중', '푸드파이터', '배달 완료!', '맛있어서 기절'],
  '오타쿠/덕질 ①': ['최애가 세상을 구한다', '통장 바칠게요', '얼굴 천재', '성지순례 완료', '앨범 샀다', '포카 교환 구함', '티켓팅 성공!', '피켓팅 망함…', '생카 투어 중', '덕통사고 당함', '입덕 완료', '탈덕은 없다', '굿즈 풀세트 구매', '콘서트 가는 중', '덕질이 최고야'],
  '오타쿠/덕질 ②': ['갓벽하다 진짜', '심장 저격', '컴백 기다리는 중', '팬싸 당첨!', '무대 찢었다', '눈물 줄줄', '주접 그만할 수 없음', '존재 자체가 빛', '직캠 무한 재생', '1열 관람 성공', '공식 굿즈 대기 중', '오프 뛰러 감', '덕질 메이트 구함', '응원봉 흔들흔들', '평생 덕질할게'],
  '분노/짜증 ①': ['진짜 화난다', '장난하나 지금?', '어이없네', '짜증 대폭발', '말 걸지 마', '심호흡 중 (후~)', '참을 인 세 번', '용서 못 해', '열받아 죽겠네', '조용히 해', '할 말이 없다', '생각 좀 하고 말해', '선 넘지 마라', '폭발 직전', '진정해 나 자신'],
  '분노/짜증 ②': ['싸우자는 건가?', '적당히 해라', '한숨 푹푹', '부들부들 떨림', '극대노 상태', '스트레스 만땅', '눈에 흙이 들어가도 안 됨', '너나 잘하세요', '다신 안 봐', '혈압 상승 중', '속 터져 죽겠네', '주먹 쥐는 중', '폭발 3초 전', '노답이다 진짜', '그만 좀 해!'],
  '축하/응원 ①': ['축하합니다!', '고생 많았어!', '응원할게 파이팅!', '넌 할 수 있어!', '정말 장하다!', '대성공!', '꿈은 이루어진다', '축하 파티하자', '자랑스럽다!', '힘내라 힘!', '언제나 네 편이야', '꽃길만 걷자', '행복해야 해!', '짠~ 건배!', '최고의 결과!'],
  '축하/응원 ②': ['합격을 축하해!', '취업 성공 축하!', '결혼 축하합니다!', '생일 축하해!', '승진 축하드려요!', '노력은 배신하지 않아', '기적을 믿어', '끝까지 포기 마', '도움이 되어 기뻐', '멋지다 정말!', '눈부신 성장', '최선을 다했어!', '승리의 순간', '영광을 너에게', '축복합니다!'],
  '계절/날씨 ①': ['봄이 왔어요', '벚꽃 보러 가자', '더워 죽겠다 (폭염)', '바다 가고 싶다', '단풍 구경 가자', '독서의 계절', '추워 죽겠다 (한파)', '첫눈 온다!', '비 온다 주륵주륵', '우산 챙겨!', '태풍 조심해', '더위 먹었어', '따뜻한 햇살', '손이 꽁꽁 발이 꽁꽁', '환절기 조심'],
  '계절/날씨 ②': ['벚꽃 엔딩', '에어컨 풀가동', '장마 시작', '물놀이 가자!', '가을 타는 중', '군고구마 땡겨', '전기장판 켜줘', '눈사람 만드는 중', '폭설 주의보', '맑은 하늘 드라이브', '습도 100% 찝찝', '건조해 미치겠네', '청명한 가을 하늘', '선크림 필수!', '따뜻하게 입어'],
  '반려동물/집사 ①': ['우리 애기 천사', '간식 주세요!', '산책 가자!', '골골송 부르는 중', '털 뿜뿜 힐링', '사고 쳤어요…', '동물병원 가는 중', '츄르 먹방', '놀아줘 놀아줘', '쿨쿨 자는 중', '꼬리 살랑살랑', '발톱 깎기 싫어', '집사야 밥 줘', '퇴근 맞이 냥이/댕이', '우주 최강 귀요미'],
  '반려동물/집사 ②': ['츄르는 사랑입니다', '젤리 발바닥 꾹', '아침 산책 완료', '그루밍 중', '손 주는 중', '멍멍! 짖는 중', '야옹~ 부르는 중', '집사 바라기', '다묘/다견 가정 행복', '꾹꾹이 하는 중', '캣타워 정복', '안아달라고 찡찡', '삐진 댕댕이/냥이', '반려동물은 가족', '건강하게 오래 살자'],
  '집순이/집돌이 ①': ['이불 밖은 위험해', '침대와 한 몸', '하루 종일 뒹굴뒹굴', '넷플릭스 정주행', '배달 음식 시킴', '파자마 차림', '나가기 귀찮아', '집이 최고야!', '방콕 모드 돌입', '외출 거부권 행사', '스마트폰 중독', '택배 언박싱 완료', '에어컨 밑이 천국', '나 혼자 산다', '완전 충전 중'],
  '집순이/집돌이 ②': ['이불 속이 내 우주', '바깥세상 무서워', '홈카페 오픈', '유튜브 알고리즘 탐험', '게임 삼매경', '최애 영상 무한 반복', '낮잠 타임', '잠옷이 정장', '프로 집콕러', '방 청소 완료 뿌듯', '혼술 타임', '창밖 구경 중', '완벽한 휴식', '집이 제일 편해', '평생 집에서 쉴래'],
  '육아/베이비 ①': ['쿨쿨 잘 자요', '맘마 먹을 시간', '기저귀 갈았어요', '배밀이 성공!', '새벽 수유 중 (졸려)', '안아줘요 으앙~', '이유식 냠냠', '첫 걸음마 뗐어요', '엄마 좋아!', '아빠 좋아!', '천사 같은 아기', '폭풍 옹알이 중', '장난감 어질러짐', '육아팅 힘내요!', '무럭무럭 자라라'],
  '육아/베이비 ②': ['엄마라고 불렀어!', '아장아장 걸음마', '까꿍 놀이 중', '낮잠 타임 (자유시간)', '이유식 거부…', '이가 나고 있어요', '놀이터 가자!', '목욕 시간 첨벙첨벙', '동화책 읽어주기', '투정 부리는 중', '육퇴 성공! (만세)', '예방접종 완료', '웃는 모습 심쿵', '독박육아 중…', '사랑해 우리 아기'],
  'MBTI & 밈 ①': ['극 E (파워 인싸)', '극 I (파워 집돌이)', '파워 J (완벽 계획)', '파워 P (즉흥 여행)', '극 T (팩트 폭격)', '극 F (폭풍 공감)', 'N 성향 (상상 폭발)', 'S 성향 (현실 직시)', 'MBTI 물어보기', '인싸력 폭발 (E)', '사회성 방전 (I)', '영혼 없는 리액션', '과몰입 중', '공감해줘 ㅠㅠ', '팩폭 금지'],
  'MBTI & 밈 ②': ['F 감수성', 'T발 C야?', '계획 충실 J', '무계획 여행 P', 'E 성향 폭발', 'I 성향 급속방전', 'MBTI 과몰입', '멘탈 바사삭', '팩트로 패지 마', '오열각', '이성적 판단', '감정 조절 불가', '뇌세포 정지', '반박 불가', '납득 완료'],
  '여행/휴가 ①': ['공항 가는 길 (설렘)', '비행기 탑승 완료', '휴가 시작! (연락 금지)', '여권 챙겼지?', '호캉스 힐링 중', '인생샷 건졌다', '현지 맛집 정복', '환전 완료', '캐리어 짐 싸는 중', '여기가 천국인가', '바다 보러 가자', '여행 중 (답장 늦음)', '기념품 사갈게', '집에 가기 싫다', '휴가 후유증 (복귀)'],
  '여행/휴가 ②': ['다음 여행 어디 갈까?', '면세점 쇼핑 완료', '비행기 창가 자리', '호텔 체크인 완료', '야경 보며 힐링', '수영장에서 물놀이', '배낭여행 떠나요', '여유로운 티타임', '길 잃었지만 행복', '티켓 예매 성공!', '비행기 연착됨 (지침)', '인생 사진 찍어줘', '여행 사진 방출', '다음에 또 오자', '무사 귀국 완료!'],
  '쇼핑/택배 ①': ['택배 도착 알림 (두근)', '내돈내산 인증!', '장바구니 다 털었다', '이건 무조건 사야 해', '품절 임박 결제 완료', '할인 특가 놓칠 수 없지', '충동구매 후 후회 중', '영수증 보고 기절', '지갑이 텅텅 (거지)', '새 옷 입고 외출!', '언박싱 타임 (행복)', '가성비 최고 득템', '오늘 하루 탕진잼', '돈 쓰는 게 제일 짜릿해', '다음 달의 내가 갚겠지'],
  '쇼핑/택배 ②': ['주문 완료 (배송 기다림)', '문 앞 배송 완료!', '사이즈 딱 맞는다', '무료 배송 채우기', '신상 입고 알림', '라이브 특가 득템', '반품/교환 고민 중', '포토 리뷰 작성 완료', '위시리스트 추가', '쇼핑백 양손 가득', '지름신 강림!', '월급 순삭 삭제', '카드 한도 초과 위기', '이건 나를 위한 선물', '내 통장 눈감아'],
  '운전/교통 ①': ['초보운전 (양보 감사)', '주차 성공 (감격)', '출근길 차 막힘 (지각)', '안전운전 중 (답장 늦음)', '세차했더니 비 옴 (분노)', '네비가 길 잘못 알려줌', '고속도로 시원하게 질주', '기름값 실화냐 (주유)', '버스 놓쳤다 (전력질주)', '지하철 환승 지옥', '도착 5분 전!', '대리운전 불렀음', '오늘도 무사 귀가 완료', '신호 대기 중', '빵빵 경적 금지 (초보)'],
  '운전/교통 ②': ['출퇴근길 만원 버스', '지하철 문 닫힘 (아깝다)', '드라이브 갈 사람?', '주차 자리 찾는 중', '평행주차 멘붕', '음악 크게 틀고 드라이브', '퇴근길 정체 (졸려)', '네비게이션 도착 완료', '안전벨트 착용 필수', '톨게이트 통과', '차 뽑았다 널 데리러 가', '비 와서 서행 운전', '앞차 출발하세요', '교통카드 잔액 부족', '도착해서 연락할게'],
  '생일/파티 ①': ['생일 축하해 (HBD)!', '케이크 촛불 후~', '오늘 주인공은 나야 나', '태어나줘서 고마워', '선물 배송 보냈어!', '소원 빌었어 (이뤄져라)', '생일 파티 시작!', '미역국 챙겨 먹었어?', '축하해줘서 폭풍 감동', '용돈/기프티콘 쏩니다', '한 살 더 먹었네 (눈물)', '꽃길만 걷자!', '최고로 행복한 하루 보내', '생일빵 각오해라', '평생 함께 축하하자'],
  '생일/파티 ②': ['해피 버스데이 투 유!', '서프라이즈 파티 대성공', '생일 축하 노래 떼창', '고깔모자 착용 완료', '선물 언박싱 감동', '기념일 촛불 끄기', '샴페인 팡팡 터뜨리기', '파티 주인공 입장!', '나이 한 살 배달 완료', '생일 턱 쏠게!', '행복 가득한 날', '축하 메시지 폭발', '소중한 사람의 생일', '파티는 이제부터 시작', '사랑 가득한 하루!'],
  '헬스/오운완 ①': ['득근 완료!', '득근득근', '근손실 경보', '헬스장 출석', '하체 하는 날', '프로틴 수혈', '1세트만 더!', '스쿼트 완료', '유산소 지옥', '닭가슴살 냠냠', '체지방 컷!', '무게 치러 감', '땀방울 뻘뻘', '몸짱 가자!', '운동 끝!'],
  '헬스/오운완 ②': ['가슴 털리는 날', '인바디 충격', '단백질 보충', '식단 관리 중', '유산소 30분', '턱걸이 10개', '스트레칭 쭉쭉', '덤벨 번쩍!', '체중 감량 중', '운동 중독', '헬스장 가는 길', '치팅데이 가자', '근육 펌핑!', '오운완 인증샷', '내일도 운동!'],
  '절약/거지방 ①': ['무지출 성공!', '지갑 봉인', '숨만 쉬는 중', '통장이 텅장', '식비 0원 컷', '할인쿠폰 영끌', '가성비 최고', '소비 참음', '거지방 생존', '절약 모드', '포인트 적립', '영수증 충격', '도시락 쌌음', '티끌 모아 태산', '돈 아끼자'],
  '절약/거지방 ②': ['커피값 아꼈다', '강제 저축 중', '소비 요정 퇴치', '장바구니 삭제', '체크카드만 씀', '냉장고 파먹기', '외식 금지령', '짠테크 1일차', '통장 심폐소생', '무료 나눔 겟', '보너스는 적금', '영수증 버려줘', '소비 단식 중', '부자 될 거야', '만원의 행복'],
  '스터디/취준 ①': ['열공 중!', '스카 출석', '순공 10시간', '기상 인증 完', '멘탈 잡자', 'D-DAY 카운트', '면접 파이팅', '취뽀 가자!', '합격 기원', '과제 마감', '필기 정리 중', '시험 뿌시기', '졸음 퇴치', '합격의 길로!', '공부 끝!'],
  '스터디/취준 ②': ['스카 가는 길', '단어 암기 중', '모의고사 1등급', '동기부여 뿜뿜', '기출 분석 중', '합격 수기 쓰자', '졸음 쏟아진다', '오답노트 정리', '스터디 시작!', '열공 인증샷', '목표 달성!', '자격증 취득', '포기는 없다', '합격증 수령', '수고했어 오늘도'],
  '자취/1인가구 ①': ['배달 도착!', '혼밥 타임', '혼술 (캬~)', '냉장고 털기', '빨래 너는 중', '분리수거 날', '벌레다! (기절)', '집밥 먹고파', '청소 완료', '넷플 정주행', '택배 언박싱', '전등 갈기', '자취 요리사', '포근한 내 방', '소등 굿밤'],
  '자취/1인가구 ②': ['장보기 완료', '에어프라이어 가동', '햇반 데우는 중', '설거지 미루기', '방구석 힐링', '캔들 켜는 밤', '원룸 꾸미기', '배달비 아까워', '주말 늦잠 꿀맛', '셀프 인테리어', '창문 꼭 닫기', '야식 타임 (라면)', '내 공간 최고', '오늘도 무사히', '잘 자 내 방'],
  '약속/카페투어 ①': ['도착 5분 전', '너 지금 어디야?', '카페 가자!', '아아 수혈 중', '자리 잡았음', '웨이팅 중', '여기 존맛!', '디저트 배 따로', '얼른 와~', '뭐 마실래?', '1차 출발', '배 터지겠다', '사진 찰칵', '오늘 꿀잼', '다음에 또 봐'],
  '약속/카페투어 ②': ['자리 어디야?', '메뉴판 보는 중', '디저트 나왔다', '사진 건졌다!', '수다 삼매경', '힐링 타임', '커피 맛집 인정', '한 잔 더 마실까?', '감성 카페 뷰', '인생샷 찰칵', '달달구리 충전', '다음 코스 어디?', '시간 순삭!', '집 가는 길', '다음에 또 모여'],
  '캠핑/아웃도어 ①': ['캠핑 출발!', '불멍 타임', '텐트 피칭 完', '고기 굽굽', '감성 충전', '자연 힐링', '라면 끓이는 중', '밤하늘 별빛', '장비 뽐뿌', '커피 내리는 중', '날씨 요정', '우중 캠핑', '철수 완료', '피톤치드 뿜뿜', '집으로 복귀'],
  '캠핑/아웃도어 ②': ['장작 타는 소리', '마시멜로 굽기', '자연 속 힐링', '등산 정상 도착!', '경치 끝내준다', '야외 바베큐', '모닝 커피 한잔', '산림욕 중', '랜턴 켜는 밤', '차박 세팅 완료', '새소리 힐링', '등산화 끈 묶기', '자연인 모드', '캠핑의 맛!', '다음 캠핑 어디?'],
  '스포츠/직관 ①': ['홈런이다!', '골! 골! 골!', '역전 승리!', '직관 가는 중', '치맥 준비 完', '심판 눈 떠라', '나이스 플레이!', '짜릿한 승리', '연장전 돌입', '패배 (눈물)', '응원가 열창', '선발 교체', '우승 가자!', '피켓팅 성공', '오늘 경기 끝'],
  '스포츠/직관 ②': ['만루 홈런!', '원더골 터졌다!', '승리의 함성', '클리닝 타임', '맥주 꿀맛', '선수 응원가', '스트라이크 삼진', '경기장 열기 후끈', '파울볼 조심!', '우승 트로피 가자', '오늘 MVP 누구?', '직관 승리 요정', '목청 터져라 응원', '열광의 도가니', '내일 경기 기대!'],
  '대청소/정리 ①': ['대청소 시작!', '당근마켓 나눔', '먼지 털기', '물청소 뽀송', '비우는 삶', '환기 중', '이불 빨래 完', '정리 끝 깔끔', '쓰레기 배출', '새집 같아', '청소 지옥', '뿌듯한 하루', '침대 커버 교체', '방이 반짝반짝', '이제 쉰다'],
  '대청소/정리 ②': ['옷장 정리 완료', '먼지 제로 도전', '재활용 분리수거', '쓰레기통 비움', '욕실 청소 반짝', '향기 가득 방', '버릴 옷 한가득', '신발장 정리', '먼지 털이 슉슉', '주방 기름때 싹', '정리의 기쁨', '미니멀 라이프', '청소기 윙윙', '공기청정기 가동', '깨끗해서 상쾌해'],
  '페스티벌/노래방 ①': ['페스티벌 예매 성공!', '1열 잡았다', '노래방 가자', '마이크 내 꺼', '흥 폭발!', '떼창 준비', '목 쉬었음', '앵콜 외치는 중', '응원봉 흔들', '페스티벌 출발', '성대 결절 각', '고음 폭발', '여운 남음', '체력 방전', '귀가 완료'],
  '페스티벌/노래방 ②': ['점수 100점!', '발라드 타임', '랩 찢었다!', '서비스 시간 추가', '떼창으로 하나됨', '목 관리 필수', '엔딩곡 부르는 중', '생수 벌컥벌컥', '음악에 취한다', '콘서트 막차 탑승', '귀 호강 중', '헤드뱅잉 쾅쾅', '앵콜곡 대기', '최고의 무대!', '평생 기억할 밤'],
  '드라이브/로드트립 ①': ['드라이브 출발!', '창문 열고 힐링', '드라이브 송 ON', '바닷길 달리는 중', '노을 뷰 끝내준다', '휴게소 소떡소떡', '야간 드라이브', '바람 솔솔~', '달려보자 고고!', '숲길 코스 만끽', '감성 충전 완료', '오픈카 갬성', 'DT 픽업 완료', '힐링 만끽 중', '안전하게 복귀'],
  '드라이브/로드트립 ②': ['탁 트인 뷰 예술', '해안도로 질주', '플레이리스트 짱', '달콤한 드라이브 송', '휴게소 통감자', '스트레스 순삭', '커피 한잔의 여유', '자유를 찾아서', '전망대 도착!', '주말 드라이브', '예쁜 하늘 찰칵', '도로가 내 세상', '기분 전환 완료', '낭만 가득한 밤', '오늘도 행복했다'],
  '낚시/피싱 ①': ['입질 왔다!', '월척이다!', '손맛 짜릿', '포인트 도착', '미끼 끼우는 중', '챔질 나이스!', '출조 출발', '물고기 방생', '대어 낚았다', '낚싯대 드리우고', '세월을 낚는 중', '물멍 타임', '만선이오!', '꽝 쳤음 (눈물)', '오늘 낚시 끝'],
  '낚시/피싱 ②': ['새벽 출조', '루어 체인지', '찌만 뚫어져라', '드랙 풀린다!', '선상 라면 꿀맛', '도시어부 출격', '바다 낚시', '민물 낚시', '회 떠 먹자!', '잡어만 잔뜩', '바늘 빼는 중', '장비 욕심 뿜뿜', '힐링 낚시', '손맛 예술', '내일 또 출조'],
  '싸이클/라이딩 ①': ['라이딩 출발!', '케이던스 유지', '업힐 정복!', '다운힐 조심', '평속 30 찍음', '보급소 도착', '안라(안전라이딩)', '클릿슈즈 체결', '펑크 났다 (멘붕)', '야간 라이딩', '한강 자도 질주', '엔진 업그레이드', '100km 완주!', '허벅지 터짐', '오늘 라이딩 끝'],
  '싸이클/라이딩 ②': ['자덕 모임', '장비 경량화', '기어 변속 착착', '바람을 가르며', '자전거 세차 完', '스프린트 돌진', '져지 뽐뿌', '안라즐라!', '물통 원샷', '라이딩 인증샷', '장거리 투어', '역풍 지옥', '국토종주 도전', '안장통 (눈물)', '내일 또 타자!'],
  '골프/라운딩 ①': ['나이스 샷!', '버디 잡았다!', '홀인원 가자', '굿 샷!', '티샷 준비', '오비(OB) 났다…', '해저드 퐁당', '벙커 탈출!', '컨시드 땡큐', '퍼팅 라인 보기', '나이스 파!', '드라이버 200m', '라베(인생최고타)', '그늘집 타임', '오늘 라운딩 끝'],
  '골프/라운딩 ②': ['새벽 티오프', '명랑 골프', '백돌이 탈출!', '골린이 성장 중', '어프로치 완벽', '골프웨어 뽐뿌', '내기 승리!', '멘탈 게임', '스크린 골프 가자', '스윙 교정 중', '홀컵 땡그랑', '그린 라이 읽기', '비거리 폭발', '라운딩 인증샷', '다음 라운딩 예약'],
  '어린이/유치원 ①': ['아빠 최고 멋져!', '나 잘했죠?', '사주세요!', '간식 시간!', '내일 또 만나요!', '낮잠 싫어~', '삐졌어요 (흥!)', '저요!', '소풍 가요!', '다 먹었어요!', '가기 싫어요~', '내가 할래요!', '놀이터 가자', '엄마 사랑해요', '졸려요~'],
  '어린이/유치원 ②': ['키 컸어요!', '선생님 최고!', '내가 1등!', '궁금해요!', '아야 했어요 (호~)', '더 주세요!', '만화 볼래요', '신나요!', '엄마 언제 와?', '같이 놀자!', '안아주세요', '치카치카', '비눗방울 퐁퐁', '선물 주세요!', '착한 어린이'],
  '선생님/교사 ①': ['참 잘했어요!', '100점 만점!', '아주 우수함', '최고예요!', '합격 (PASS)!', '노력이 가득!', '폭풍 칭찬!', '발전했어요!', '정리 깔끔!', '생각 쑥쑥!', '글씨 예뻐요', '집중력 최고!', '자신감 뿜뿜!', '선생님 감동!', '내일도 화이팅!'],
  '선생님/교사 ②': ['확인 완료!', '숙제 검사 完', '오답 수정!', '다시 제출!', '조금만 더!', '감점 주의!', '재시험 대상', '출석 완료!', '피드백 확인', '수행평가 접수', '교무실로 와', '지각 금지!', '수업 집중!', '시험 잘 봐!', '오늘 수업 끝!'],
  '결혼/신혼부부 ①': ['결혼합니다!', '행복하게 살게요', '청첩장 드려요', '여보 오늘 밥은?', '설거지 당번!', '신혼여행 출발', '프로포즈 성공', '내 반쪽 ♥', '장보러 가자', '칼퇴하고 갈게', '여보 수고했어', '우리 집 놀러 와', '부모님 뵙는 날', '달콤한 신혼', '영원한 내 편'],
  '결혼/신혼부부 ②': ['여보 사랑해', '빨래 널어줘', '데이트 가자', '야식 콜?', '여보 삐졌어?', '찌개 끓였어', '기념일 축하해', '결혼 조하~', '음쓰 버려줘', '여보뿐이야', '안마해 줄게', '달달한 우리', '행복한 우리 집', '조심히 들어와', '여보 잘자요'],
  'MZ 신조어/단축어 ①': ['갓생 사는 중', '알잘딱깔센', '중꺾마!', '폼 미쳤다', '오히려 좋아', '억까 당함', '스불재...', '킹받네', '오운완!', '점메추 ㄱ?', '극락...', '내또출...', '주말순삭', '생존신고!', '기절각 zZ'],
  '학생/10대 유행어 ②': ['하교각!', '매점 ㄱ?', '벼락치기 중', '시험 망함', 'ㅇㅈ (인정)', 'ㄹㅇ 팩트', 'ㄱㄷ (기달)', 'ㄱㅊ (괜찮)', '나 지금 진지함', '학탈 성공', '배고파 기절', '숙제 했어?', '폰 압수...', '달려보자!', '내일 봐!'],
  '새/반려조 ①': ['짹짹 좋은 아침', '깃털 뿜뿜', '해바라기씨 냠냠', '횃대에서 갸우뚱', '날아올라!', '짹! 화났음', '뽀뽀 쪽~', '모이 주세요', '새벽 기상 완료', '날개 활짝', '집사야 놀자', '짹짹짹 수다 중', '폭풍 날갯짓', '깃털 정리 중', '꿀잠 자요'],
  '새/반려조 ②': ['짹짹짹!', '새장 탈출 성공', '주인 손가락 콕!', '부리 갈기 쓱쓱', '호기심 가득 눈빛', '날개 스트레칭', '새장 속 노래자랑', '안마해 줘', '모이통 털기', '새소리 알람', '윙크 발사', '바람을 가르며', '폭풍 애교', '집사 바라기', '오늘도 행복한 새'],
  '수족관/해양생물 ①': ['물멍 힐링 중', '뻐끔뻐끔', '바닷속 쿨쿨', '파도 타기', '조개 속 콕!', '먹물 뿜뿜', '헤엄치는 중', '신선도 100%', '바다처럼 넓은 마음', '미끌미끌', '수족관 나들이', '낚이지 마라', '촉수 댄스', '월척이다!', '깊은 바다 굿밤'],
  '수족관/해양생물 ②': ['산호초 탐험', '지느러미 펄럭', '거품 방울 퐁퐁', '바다거북 수영', '물속의 평화', '해파리 둥둥', '조개 속 진주', '숨 참기 1등', '바다 친구들 모여', '해류 타고 이동', '심해 탐사 완료', '물속에서 뒹굴', '어항 청소 완료', '시원한 물맛', '바다 굿나잇'],
  '숲속/곤충 ①': ['꿀벌처럼 열일 중', '뽈뽈뽈 이동 중', '반짝반짝 반딧불', '나풀나풀 날아가', '달콤한 꿀맛', '나무 위에서 낮잠', '힘내라 영차!', '풀잎 위 힐링', '더듬이 레이더 가동', '숲속 탐험대', '이슬 한 모금', '동글동글 굴려라', '날개 파닥파닥', '숨바꼭질 중', '숲속 굿나잇'],
  '숲속/곤충 ②': ['꿀단지 사수!', '꽃가루 퐁퐁', '영차영차 나르기', '자연 속 힐링', '낙엽 아래 휴식', '풀잎 침대 포근', '숲의 오케스트라', '아침 이슬 냠냠', '더듬이 인사', '나무 타기 명수', '꿀벌 댄스', '도토리 굴리기', '숲속 나들이', '자연과 하나됨', '달밤의 숲속'],
  '파충류/우파루파 ①': ['우파루파 뻐끔', '개굴개굴 노래해', '카멜레온 변신!', '일광욕 즐기는 중', '도마뱀 꼬리 슉', '말랑말랑 아가미', '느긋하게 힐링', '풀잎 위에서 찰칵', '혀 낼름 냠냠', '우파루파 미소', '개구리 점프!', '동글동글 눈맞춤', '도롱뇽 헤엄', '따뜻한 바위 위', '꿀잠 자요 굿밤'],
  '파충류/우파루파 ②': ['물속에서 둥둥', '개구리 합창', '벽 타기 성공!', '귀여운 아가미 펄럭', '느긋한 오후', '비 오는 날 신나', '카멜레온 은신술', '도마뱀 윙크', '조용한 힐링', '우파루파 하트', '연잎 우산 쓰고', '초록 숲 탐험', '아가미 살랑살랑', '바위 밑 휴식', '편안한 밤 되세요'],
  '공룡/고생물 ①': ['크아앙! 공룡 출몰', '쿵쾅쿵쾅 발걸음', '고기 먹방 타임', '백악기 탐험 중', '공룡 파워!', '알 깨고 나왔어요', '초식공룡 냠냠', '익룡처럼 날아올라', '화석 발굴 완료', '티라노 포효!', '화산 폭발 도망쳐', '공룡 꼬리 치기', '아기 공룡 걸음마', '평화로운 쥐라기', '공룡 꿈꿔요'],
  '공룡/고생물 ②': ['티라노 한입만', '브라키오 긴 목 힐링', '박치기 승부!', '화석이 될 것 같아', '공룡알 품는 중', '익룡 활공 중', '원시림 산책', '화석 발견 대박!', '트리케라 뿔 공격', '발자국 쿵쿵', '공룡 댄스 타임', '메머드 털 따뜻해', '빙하기 탈출!', '고생물 친구들', '쥐라기 굿밤'],
  '군인/곰신 ①': ['충성! 전역 기원', '휴가 나왔다!', '전화 받아줘', '복귀 중 (눈물)', '인터넷 편지 보냈어', '오늘도 보고 싶어', '디데이 -100', 'PX 털어왔다!', '훈련 끝 뿌듯', '나라 지키는 중', '군화 신고 달린다', '기다려줘서 고마워', '칼각 잡는 중', '전역 축하해!', '꿀잠 자요 충성'],
  '군인/곰신 ②': ['기상 나팔 빵빵', '점호 준비 완료', '군대리아 냠냠', '사격 만발 명사수', '행군 완주 성공', '꽃신 신겨줄게', '군번줄 목걸이', '동기사랑 나라사랑', '택배 보내줘', '면회 와줘!', '포상휴가 땄다!', '각개전투 완료', '곰신 1일차', '끝까지 기다릴게', '단결! 수고했습니다'],
  'K-직장인 속마음 ①': ['네(영혼 가출)', '카톡 오타 죄송', '내일 연차 씁니다', '퇴사 마렵다', '회의 중 멍때리기', '시말서 각 ㅠㅠ', '월급이 로그아웃', '살려주세요...', '금융치료 완료', '보고서 뒤집어짐', '칼퇴 10초 전', '상사 눈치 보는 중', '커피로 생명 연장', '주말만 기다려', '집에 보내줘'],
  'K-직장인 속마음 ②': ['영혼 없는 리액션', '출근 5분 전 멘붕', '탕비실 털러 감', '메일 잘못 보냄(식은땀)', '승진 축하 턱 내놔', '월요병 극복 불가', '회의실 감금 중', '야근 메이트 구함', '월급날만 버틴다', '넵 알겠습니다(무념)', '오늘 점심 뭐 먹지', '퇴사짤 저장 중', '금요일 밤 불타오름', '연차 결재 완료 만세', '내일 또 출근...'],
  '집사/고양이 전용 ①': ['냥냥펀치!', '골골송 발사 중', '꾹꾹이 서비스', '츄르 대령해라', '궁디팡팡 해줘', '집사야 한심하다', '캣타워 정복 완료', '발톱 깎기 싫어!', '상자 속 쏙~', '꼬리 살랑살랑', '야옹~ 밥 줘', '그루밍 타임', '식빵 굽는 중', '집사 무릎 착석', '냥이 꿀잠'],
  '집사/고양이 전용 ②': ['하찮은 집사 녀석', '사냥 놀이 시작', '사고 치고 당당', '캣닢 파티', '새벽 우다다 타임', '젤리 발바닥 도장', '문 열어라 집사야', '눈키스 깜빡깜빡', '간식 내놓아라', '레이저 잡기 실패', '털 뿜뿜 힐링', '높은 곳이 좋아', '삐진 고양이', '집사 사랑해 (츤데레)', '골골송 굿밤'],
  '댕댕이/강아지 전용 ①': ['산책! 산책! 산책!', '꼬리 헬리콥터', '주인님 오셨다!(격환)', '간식 주면 뽀뽀', '공 던져줘!', '개껌 뜯는 중', '손! 코! 엎드려!', '귀 펄럭이며 질주', '배 뒤집고 애교', '목욕 싫어 으르렁', '침대 점령 완료', '코 킁킁 탐색', '말티즈 참지 않음', '포근한 낮잠', '주인님 사랑해요'],
  '댕댕이/강아지 전용 ②': ['발바닥 꼬순내', '터그놀이 한판', '간식 가방 지킴이', '물놀이 첨벙첨벙', '사고 치고 눈치 봄', '산책 더 할래!', '댕댕이 뒹굴뒹굴', '빗질 얌전히 받음', '친구 멍멍이 만남', '주인바라기 멍멍', '하울링 아우~', '포근한 개 침대', '하이파이브!', '간식 냄새 포착', '댕댕이 굿나잇'],
  '웨딩/청첩장 ①': ['저희 결혼합니다!', '청첩장 드려요', '꼭 와주세요!', '신랑 입장!', '신부 입장!', '평생 행복할게요', '축하해 주셔서 감사합니다', '웨딩사진 나왔어요', '드레스 골라줘', '다이어트 성공!', '신혼여행 떠나요', '예쁘게 잘 살게요', '프로포즈 받았어요 ♥', '식장에서 만나요', '사랑의 서약'],
  '웨딩/청첩장 ②': ['품절남/품절녀 완료', '축의금 챙겨갈게!', '결혼 축하해 ♥', '세상 제일 예쁜 신부', '멋진 신랑 든든해', '행복한 결혼식', '부케 받았어요!', '꽃길만 걷자', '인생 제2막 시작', '눈물 찔끔 감동', '하객 여러분 감사해요', '웨딩 반지 반짝', '신혼집 집들이 와', '찰떡궁합 부부', '영원히 사랑해'],
  '할로윈/코스튬 ①': ['트릭 오어 트릿!', '사탕 안 주면 장난칠 거야', '할로윈 파티 시작!', '오늘 분장 어때?', '호박등 켰어요', '오싹오싹 무서워', '유령 출몰 주의', '마녀의 물약 냠냠', '사탕 바구니 가득', '박쥐 날아간다', '코스튬 1등!', '달콤한 사탕 줄게', '해피 할로윈!', '으스스한 밤', '파티 즐기자!'],
  '할로윈/코스튬 ②': ['사탕 털러 간다!', '으악 깜짝이야!', '유령 댄스 파티', '호박 파이 굽는 중', '마녀 모자 장착', '분장 퀄리티 대박', '사탕 교환하자', '할로윈 나이트', '오싹한 분위기 최고', '드라큘라 변신', '빗자루 타고 날아가', '사탕 주세요 냠', '몬스터 친구들 모여', '해피 할로윈 데이', '내년에 또 만나!'],
  '수능/합격기원 ①': ['수능 대박 기원!', '정답만 콕 찍어라', '붙는다 무조건!', '수험생 화이팅', '찹쌀떡처럼 착 붙어라', '노력은 배신하지 않아', '실력 발휘 제대로!', '재수 없다 합격이다', '마킹 실수 금지', '끝까지 집중!', '수능 끝나고 놀자', '원하는 대학 합격!', '너의 꿈을 응원해', '수고했어 정말로', '합격증 들고 와!'],
  '수능/합격기원 ②': ['수능 만점 가자!', '수험표 챙겼지?', '찰떡같이 합격', '수능 한파 이겨내자', '긴장 풀고 평소대로', '정답이 쏙쏙 보인다', '빛나는 너의 미래', '수능 끝나면 자유다', '간절히 기도할게', '자랑스러운 수험생', '수능 대박 축하', '합격길만 걷자', '모든 노력이 결실을', '오늘의 주인공은 너야', '자신을 믿어봐!'],
  '크리스마스/연말 ①': ['메리 크리스마스!', '산타 할아버지 선물 주세요', '루돌프 출동!', '화이트 크리스마스', '트리 꾸미는 중', '올 한 해도 수고했어', '연말 파티 가자', '소원이 이루어지길', '따뜻한 연말 보내세요', '케이크 촛불 후~', '종소리 울려라', '선물 교환 타임', '해피 뉴 이어!', '사랑 가득한 성탄절', '굿바이 올해!'],
  '크리스마스/연말 ②': ['해피 홀리데이!', '산타 모자 썼어요', '눈사람 만들자', '징글벨 징글벨', '캐롤 들으며 힐링', '따뜻한 뱅쇼 한잔', '올해 마무리 잘하자', '크리스마스 이브 설렘', '선물 언박싱 감동', '반짝이는 전구 트리', '연말 결산 파티', '소중한 사람과 함께', '루돌프 코가 반짝', '내년에도 행복하자', '성탄 축하드려요'],
  '봄벚꽃/피크닉 ①': ['벚꽃 보러 가자!', '봄바람 솔솔~', '피크닉 도시락 쌌어', '인생샷 건졌다', '꽃길만 걷자', '돗자리 펴자', '따스한 봄 햇살', '설레는 봄날', '벚꽃 잎 흩날림', '샌드위치 냠냠', '봄나들이 출발!', '힐링 그 자체', '꽃향기 가득', '봄 타는 중', '오늘 날씨 예술!'],
  '봄벚꽃/피크닉 ②': ['벚꽃 엔딩 낭만', '꽃구경 자리 잡았어', '봄 소풍 가자', '딸기 디저트 냠냠', '봄맞이 대청소', '화사한 원피스 입고', '따스한 봄비', '개나리 활짝', '피크닉 감성 충전', '봄날의 드라이브', '꽃놀이 인증샷', '마음이 몽글몽글', '봄이 그렇게 좋냐', '봄바람 휘날리며', '행복한 봄날 보내세요'],
  '명절·설날·추석 ①': ['새해 복 많이 받으세요!', '풍성한 한가위 보내세요', '보름달 보고 소원 빌기', '송편 냠냠', '떡국 먹고 한 살 추가', '세뱃돈 주세요!', '고향 가는 길', '맛있는 명절 음식', '부모님 효도할게요', '안전 운전하세요', '가족과 함께 행복하게', '용돈 보내드렸어요', '명절 스트레스 날려!', '오랜만에 반가워요', '건강하고 행복하세요'],
  '명절·설날·추석 ②': ['즐거운 명절 보내세요', '한복 곱게 차려입고', '윷놀이 한판 하자!', '보름달처럼 밝은 한 해', '온 가족 모여 하하호호', '맛있는 전 부치는 중', '귀경길 정체 ㅠㅠ', '부모님 건강하세요', '명절 선물 도착', '복이 넝쿨째 굴러온다', '따뜻한 고향의 정', '차례 정성껏 지내기', '풍요로운 명절', '올 한 해도 건강하게', '행복 가득한 연휴!'],
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
  'Golf/Round ②': ['Dawn tee time', 'Fun friendly golf', 'Breaking 100!', 'Golf beginner growth', 'Approach on point', 'Golf outfit drip', 'Bet won clean!', 'Mind game focus', 'Screen golf next', 'Swing fix in motion', 'Cup rattle sound', 'Reading the green', 'Distance exploded', 'Course photo snapshot', 'Booking next round'],
  'Kids/Kindergarten ①': ['Cheer up Daddy', 'Did I do well?', 'Buy it please!', 'Snack time!', 'See you tomorrow!', 'Hate nap time~', 'Pouting (Hmph!)', 'Pick me! 🙋', 'Going on picnic!', 'Finished eating!', 'Don\'t wanna go~', 'I will do it!', 'To the playground', 'Love you Mommy', 'So sleepy~'],
  'Kids/Kindergarten ②': ['I grew taller!', 'Teacher the best!', 'I am 1st place!', 'I am curious!', 'Owie here (blow~)', 'More please!', 'Wanna watch cartoon', 'So exciting!', 'When is Mom coming?', 'Let\'s play together!', 'Hug me please', 'Brushing teeth', 'Bubbles pop pop', 'Give me a gift!', 'Good little child'],
  'Teacher/Educator ①': ['Very well done!', '100 Perfect Score!', 'Excellent work', 'You are the best!', 'PASS! 💮', 'Great effort!', 'Huge praise!', 'Great progress!', 'Neat and tidy!', 'Creative thinking!', 'Nice handwriting', 'Best focus!', 'Full of confidence!', 'Teacher touched!', 'Keep fighting!'],
  'Teacher/Educator ②': ['Check complete! ⭕', 'Homework checked', 'Fix your mistakes!', 'Resubmit please!', 'Just a bit more!', 'Watch for deduction!', 'Subject to re-test', 'Attendance check!', 'Check your feedback', 'Performance task in', 'To teacher\'s office', 'No being late!', 'Focus on class!', 'Good luck on test!', 'Class dismissed!'],
  'Wedding/Newlyweds ①': ['We are getting married!', 'Will live happily', 'Here is wedding invite', 'Honey what\'s for dinner?', 'Dishwashing duty!', 'Honeymoon departure', 'Proposal success', 'My other half ♥', 'Let\'s go grocery', 'Off to home early', 'Great job honey', 'Come visit our home', 'Meeting the in-laws', 'Sweet honeymoon life', 'My forever person'],
  'Wedding/Newlyweds ②': ['Love you honey', 'Hang the laundry', 'Let\'s go on date', 'Late night snack?', 'Honey are you mad?', 'Made stew for you', 'Happy anniversary', 'Married life sweet', 'Take out food waste', 'Only you honey', 'Give you massage', 'Sweet couple us', 'Happy our sweet home', 'Come home safe', 'Good night honey'],
  'MZ Slang & Trending ①': ['Living God-life', 'Clean & Sensible', 'Unbroken Spirit!', 'Insane Form', 'Even Better!', 'Unfairly Wrecked', 'Self-made Chaos', 'So Annoying', 'Workout Done!', 'Lunch Pick?', 'Pure Bliss...', 'Work Again Tmrw', 'Weekend Vanished', 'Still Alive!', 'Passing Out zZ'],
  'Student & Teen Trends ②': ['Time to go home!', 'Snack run?', 'Cramming hard', 'Exam ruined', 'Agreed (Valid)', 'Real Facts', 'Wait a sec', 'It\'s all good', 'I\'m serious rn', 'Escaped academy', 'Starving to death', 'Did you do homework?', 'Phone confiscated', 'Let\'s go for it!', 'See you tmrw!'],
  'Birds/Pet Birds ①': ['Chirp chirp good morning', 'Fluffing feathers', 'Yummy sunflower seeds', 'Head tilt on perch', 'Soar high!', 'Angry chirp!', 'Sweet kiss peck', 'Feed me please', 'Early riser awake', 'Spread wings wide', 'Play with me hooman', 'Chatty chirping', 'Flapping frenzy', 'Preening feathers', 'Sleepy birdie'],
  'Birds/Pet Birds ②': ['Chirp chirp chirp!', 'Cage breakout success', 'Nibble human finger', 'Beak grinding scrape', 'Curious eyes wide', 'Wing stretch out', 'Singing contest in cage', 'Give me head scratch', 'Raid the seed bowl', 'Birdsong alarm clock', 'Birdie wink!', 'Cutting through wind', 'Max cuteness overload', 'Human lover birdie', 'Happy bird today'],
  'Aquarium/Marine Life ①': ['Fish tank zen healing', 'Bubble bubble pop', 'Sleeping deep in ocean', 'Surfing the waves', 'Peeking in clam shell', 'Ink squirt boom!', 'Swimming freely', '100% fresh vibes', 'Ocean-wide deep heart', 'Slippery smooth', 'Aquarium trip fun', 'Don\'t take the bait!', 'Tentacle wave dance', 'Caught a huge fish!', 'Deep blue ocean goodnight'],
  'Aquarium/Marine Life ②': ['Coral reef explorer', 'Flapping cute fins', 'Floating bubbly pop', 'Sea turtle gliding', 'Underwater calm peace', 'Jellyfish floating by', 'Pearl inside oyster', 'Breath holding champ', 'Sea buddies assemble', 'Riding ocean currents', 'Abyss mission cleared', 'Rolling underwater', 'Clean tank shiny', 'Refreshing cool water', 'Ocean night dreams'],
  'Forest/Insects ①': ['Busy bee working hard', 'Crawling tiny steps', 'Twinkling firefly light', 'Fluttering butterfly fly', 'Sweet delicious nectar', 'Tree branch nap time', 'Heave-ho push hard!', 'Leaf zen relaxation', 'Antenna radar scan', 'Forest ranger squad', 'Sip of morning dew', 'Rolling ball round', 'Flapping tiny wings', 'Hide and seek play', 'Forest sweet dreams'],
  'Forest/Insects ②': ['Guard the honey pot!', 'Pollen dust dancing', 'Heave-ho carrying food', 'Healing deep in nature', 'Resting under fallen leaves', 'Cozy green leaf bed', 'Forest orchestra chime', 'Morning dew breakfast', 'Antenna hello greeting', 'Tree climbing master', 'Wiggle honeybee dance', 'Rolling acorn round', 'Forest nature trip', 'One with wild nature', 'Moonlit forest night'],
  'Reptiles/Axolotl ①': ['Axolotl bubble breath', 'Ribbit ribbit singing', 'Chameleon camouflaged!', 'Sunbathing on rock', 'Lizard tail flick', 'Soft squishy cute gills', 'Chill and relaxed vibes', 'Leaf top photo snap', 'Tongue zap tasty insect', 'Cute axolotl smile', 'Froggy high leap!', 'Round curious eye contact', 'Salamander swim', 'Warm stone basking', 'Sleep tight sweet night'],
  'Reptiles/Axolotl ②': ['Floating in calm water', 'Frog chorus chime', 'Wall climb cleared!', 'Fluttering cute pink gills', 'Lazy cozy afternoon', 'Rainy day celebration', 'Stealth chameleon hide', 'Lizard sly wink', 'Quiet serene healing', 'Axolotl floating hearts', 'Lotus leaf umbrella', 'Green jungle explore', 'Gentle gill waving', 'Rock shelter rest', 'Cozy soothing night'],
  'Dinosaurs/Prehistoric ①': ['Roar! Dino is here', 'Thud thud heavy steps', 'Meat feast mukbang time', 'Cretaceous expedition', 'Dinosaur mighty power!', 'Hatched from dino egg', 'Herbivore leafy snack', 'Soaring like pterosaur', 'Fossil dig complete', 'T-Rex mighty roar!', 'Volcano erupting run!', 'Tail whip swing attack', 'Baby dino first steps', 'Peaceful Jurassic park', 'Dinosaur dreamland'],
  'Dinosaurs/Prehistoric ②': ['Just one bite for T-Rex', 'Brachio long neck zen', 'Headbutt challenge!', 'Feels like turning to fossil', 'Nesting cozy dino egg', 'Pterodactyl glide high', 'Primeval jungle walk', 'Found huge fossil jackpot!', 'Triceratops horn charge', 'Footsteps shaking ground', 'Dino dance party time', 'Fluffy mammoth warmth', 'Ice age great escape!', 'Prehistoric best friends', 'Jurassic sweet dreams'],
  'Soldier/Military ①': ['Salute! Ready to serve', 'On vacation leave!', 'Please answer phone', 'Heading back to base', 'Wrote you a letter', 'Miss you every single day', 'D-Day countdown -100', 'PX snacks all bought!', 'Training finished proud', 'Guarding the homeland', 'Running in combat boots', 'Thank you for waiting', 'Crisp sharp uniform folds', 'Congrats on discharge!', 'Sleep tight salute'],
  'Soldier/Military ②': ['Bugle wake-up call', 'Roll call ready set', 'Military burger yum', 'Sharpshooter full marks', 'March completed strong', 'Gift you flower shoes', 'Dog tag around neck', 'Comrade bond brotherhood', 'Send me care package', 'Come visit base please!', 'Won reward extra leave!', 'Combat drills cleared', 'Day 1 waiting lover', 'Waiting till the end', 'Unity! Great job today'],
  'K-Worker Thoughts ①': ['Yes noted (soul left body)', 'Typo in chat so sorry', 'Taking PTO day off tomorrow', 'Wanna quit job today', 'Spacing out in meetings', 'Written apology mood ㅠㅠ', 'Paycheck just logged out', 'Someone please save me...', 'Financial therapy done', 'Report overturned rework', '10s before clock-out', 'Checking boss mood sneakily', 'Extending life with coffee', 'Waiting for weekend only', 'Please send me home'],
  'K-Worker Thoughts ②': ['Lifeless reaction OK', '5 mins before work panic', 'Raiding pantry snack box', 'Sent email to wrong boss', 'Buy me promo celebration', 'Monday blues incurable', 'Trapped in meeting room', 'Looking for overtime buddy', 'Surviving for payday only', 'Understood (mind blank)', 'What to eat for lunch', 'Saving resignation memes', 'Friday night hype burns', 'PTO approved hooray!', 'Clocking in again tomorrow...'],
  'Cat & Butler ①': ['Nyanya punch strike!', 'Purr engine humming loud', 'Kneading biscuit service', 'Bring me churu treat now', 'Butt pats please hooman', 'Pathetic human butler', 'Cat tower conquered!', 'Hate clipping my claws!', 'Jump inside cardboard box', 'Tail swishing side to side', 'Meow feed me right now', 'Grooming coat shiny', 'Baking loaf of cat bread', 'Sitting on hooman lap', 'Cozy sleepy cat nap'],
  'Cat & Butler ②': ['Worthless human peasant', 'Hunting toy game start', 'Made mess and proud of it', 'Catnip wild party time', '3 AM zoomies frenzy', 'Jelly paw print stamped', 'Open the door hooman', 'Slow blinking eye kiss', 'Surrender tasty snacks', 'Failed catching laser dot', 'Fur flying healing time', 'High vantage point is best', 'Pouting grumpy kitty', 'I love hooman (tsundere)', 'Purring sweet dreams'],
  'Dog & Owner ①': ['Walk! Walk! Walkies!', 'Helicopter wagging tail', 'Master is home! Welcome!', 'Kiss me get a treat', 'Throw the tennis ball!', 'Chewing on doggie bone', 'Paw! Nose! Lie down!', 'Ears flapping at full sprint', 'Belly up cuteness overload', 'Grr I hate taking a bath', 'Bed fully occupied', 'Sniff sniff detective nose', 'Maltese never backs down', 'Cozy fluffy afternoon nap', 'I love you master so much'],
  'Dog & Owner ②': ['Savory paw scent cozy', 'Tug of war battle game', 'Snack bag royal guardian', 'Splish splash water fun', 'Guilty face after trouble', 'Wanna walk more please!', 'Doggie rolling on floor', 'Brushing fur peacefully', 'Met doggie best friend', 'Master stalker loyal pup', 'Awoo howling at the moon', 'Cozy doggie bed dream', 'High five with furry paw!', 'Snack scent detected beep', 'Good doggie goodnight'],
  'Wedding/Invitation ①': ['We Are Getting Married!', 'Here is our invitation', 'Please come celebrate!', 'Groom entering', 'Bride entering', 'Happily ever after', 'Thank you for celebrating', 'Wedding photos are out', 'Help pick my dress', 'Wedding diet success!', 'Off to honeymoon', 'Living happily', 'I said YES! ♥', 'See you at the altar', 'Vows of eternal love'],
  'Wedding/Invitation ②': ['Officially married!', 'Got your gift ready', 'Congratulations! ♥', 'Most gorgeous bride', 'Handsome groom', 'Joyful wedding day', 'Caught the bouquet!', 'Walk on flower path', 'New chapter begins', 'Tears of joy', 'Thanks to all guests', 'Sparkling wedding ring', 'Housewarming soon', 'Match made in heaven', 'Love you forever'],
  'Halloween/Costume ①': ['Trick or Treat!', 'Give me candy or else', 'Halloween party on!', 'How is my costume?', 'Jack-o-lantern lit', 'Spooky scary vibes', 'Ghost alert!', 'Drinking witch potion', 'Basket full of candy', 'Bats flying', 'Best costume award!', 'Sweet candies for you', 'Happy Halloween!', 'Chilly spooky night', 'Let the party begin!'],
  'Halloween/Costume ②': ['Candy hunting time!', 'Boo! Gotcha!', 'Ghost dance party', 'Baking pumpkin pie', 'Witch hat equipped', 'High quality costume', 'Let us trade candies', 'Halloween night', 'Spooktacular vibe', 'Dracula transformation', 'Flying on broom', 'Candy please nom', 'Monsters assemble', 'Happy Halloween day', 'See you next year!'],
  'Exam/Victory ①': ['Ace your exam!', 'Pick only the right answers', 'You got this 100%!', 'Cheering for all students', 'Stick like sweet rice cake', 'Hard work never betrays', 'Show your true power!', 'Passed with top scores', 'Double-check your marks', 'Full focus till the end', 'Party after exams', 'Accepted to dream college!', 'Rooting for your dreams', 'So proud of you', 'Bring home the diploma!'],
  'Exam/Victory ②': ['Aiming for 100%!', 'Got your exam ticket?', 'Passed with flying colors', 'Beat the exam chill', 'Relax and do your best', 'Answers are crystal clear', 'Bright future ahead', 'Freedom after exams', 'Praying for you', 'Proud test taker', 'Congrats on exam win', 'Only success ahead', 'Hard work pays off', 'You are today star', 'Believe in yourself!'],
  'Christmas/Year-End ①': ['Merry Christmas!', 'Dear Santa, gifts please', 'Rudolph on the way!', 'White Christmas', 'Decorating the tree', 'Great job this year', 'Year-end party time', 'May wishes come true', 'Warm holiday season', 'Candle on the cake', 'Jingle bells ringing', 'Gift exchange time', 'Happy New Year!', 'Christmas full of love', 'Goodbye this year!'],
  'Christmas/Year-End ②': ['Happy Holidays!', 'Wearing Santa hat', 'Let us build a snowman', 'Jingle bell rock', 'Healing with carols', 'Warm mulled wine', 'Finishing the year well', 'Christmas Eve hype', 'Unboxing presents', 'Sparkling tree lights', 'Year-end wrap party', 'With precious people', 'Rudolph glowing nose', 'Joyful next year', 'Merry Christmas wishes'],
  'Spring Blossom/Picnic ①': ['Let us see cherry blossoms!', 'Gentle spring breeze', 'Packed a picnic box', 'Best photo of my life', 'Walk on flower paths', 'Unfolding the mat', 'Warm spring sunshine', 'Heartfluttering spring', 'Cherry petals falling', 'Yummy sandwiches', 'Off on spring outing!', 'Pure healing vibe', 'Fragrant blossom scent', 'Spring fever feeling', 'Picture-perfect weather!'],
  'Spring Blossom/Picnic ②': ['Cherry blossom romance', 'Got a picnic spot', 'Spring excursion time', 'Strawberry dessert nom', 'Spring cleaning done', 'Wearing floral dress', 'Gentle spring rain', 'Forsythia in full bloom', 'Picnic vibe recharge', 'Springtime drive', 'Blossom photo proof', 'Warm fuzzy feeling', 'Spring is in the air', 'Spring breeze blowing', 'Have a happy spring!'],
  'Holidays/Family ①': ['Happy New Year / Chuseok!', 'Abundant harvest blessing', 'Wishing upon full moon', 'Yummy holiday treats', 'Rice cake soup time', 'New year lucky money!', 'Heading home road', 'Delicious feast dishes', 'Filial love for parents', 'Drive safely on road', 'Joy with beloved family', 'Sent some pocket money', 'No more holiday stress!', 'So glad to see you', 'Stay healthy and joyful!'],
  'Holidays/Family ②': ['Have a wonderful holiday', 'Wearing traditional attire', 'Let us play board games', 'Bright year like full moon', 'Whole family laughing', 'Frying savory pancakes', 'Highway traffic jam', 'Stay healthy parents', 'Holiday gift package', 'Endless good fortune', 'Warm hometown warmth', 'Memorial rite with love', 'Bountiful festive mood', 'Healthy whole year', 'Happy holiday break!'],
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
  'MBTI & ミーム ②': ['I型の引きこもり', 'E型の陽キャ発動', 'T型のド正論パンチ', 'F型の涙腺崩壊', 'J型のスケジュール', 'P型の気まぐれ旅', '生粋のMBTIオタク', 'ミーム中毒', 'テンプレ通り', '尊すぎて無理', '分かりみが深すぎる', 'バズ確定', '全人類見て', '推しが神', 'はい天才'],
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
  'ゴルフ・ラウンド ②': ['早朝ティオフ', 'エンジョイゴルフ', '100切り達成！', 'ゴルフ女子/男子成長中', 'アプローチ完璧', 'ウェア自慢', '握り勝ち！', 'メンタル勝負', 'シミュレーションゴルフ', 'スイング改造中', 'カップインの快音', 'グリーン傾斜読む', '飛距離アップ！', 'コース記念写真', '次回予約完了'],
  '子供・幼稚園 ①': ['パパ頑張って', '上手でしょ？', '買って買って！', 'おやつの時間！', 'また明日ね！', 'お昼寝嫌だ〜', 'すねちゃった', 'はーい！🙋', '遠足だやったー！', 'ごちそうさま！', '行きたくない〜', '自分でやる！', '公園行こう', 'ママ大好き', '眠くなっちゃった'],
  '子供・幼稚園 ②': ['背が伸びたよ！', '先生最高！', '一番になった！', '気になる！', '痛いの飛んでけ〜', 'おかわり！', 'アニメ見たい', '楽しい！', 'ママまだかな？', '一緒に遊ぼう！', '抱っこして', 'はみがきシュッシュ', 'シャボン玉ぽんぽん', 'プレゼントちょうだい', 'いい子にするね'],
  '先生・教員 ①': ['たいへんよくできました', '100点満点！', '大変優秀です', '最高です！', '合格（PASS）！', '努力賞！', '大絶賛！', '成長しました！', '整理整頓バッチリ', '発想力抜群！', '字がきれい', '集中力素晴らしい', '自信満々！', '先生感動！', '明日も頑張ろう！'],
  '先生・教員 ②': ['確認完了！⭕', '宿題チェック済', 'やり直し！', '再提出してください', 'あと一歩！', '減点注意！', '再テスト対象', '出席確認！', '講評を確認してね', '課題提出完了', '職員室に来てね', '遅刻禁止！', '授業に集中！', 'テスト頑張って！', '今日の授業終了！'],
  '結婚・新婚 ①': ['結婚します！', '幸せになります', '招待状です', '今日のご飯何？', '皿洗い当番！', '新婚旅行出発', 'プロポーズ大成功', '私の大切な人♥', '買い物行こう', '定時で帰るね', 'お疲れ様あなた', '遊びに来てね', 'ご両親への挨拶', '甘い新婚生活', '永遠の味方'],
  '結婚・新婚 ②': ['あなた大好き♥', '洗濯物干してね', 'デート行こう', '夜食食べる？', 'すねちゃった？', 'ご飯作ったよ', '記念日おめでとう', '結婚してよかった', 'ゴミ出しお願い', 'あなただけだよ', 'マッサージしてあげる', 'ラブラブな私たち', '幸せな我が家', '気をつけて帰ってね', 'おやすみなさい'],
  'MZ 流行語・略語 ①': ['充実ライフ中', '言わずとも完璧', '折れない心！', '神がかった調子', 'むしろ好都合', '理不尽な災難', '自業自得…', 'ムカつくな', '今日筋トレ完！', '昼飯何にする？', '至福の極楽…', '明日も出勤…', '週末が一瞬で消滅', '生存報告！', '気絶寸前 zZ'],
  '学生・10代 流行語 ②': ['下校の時間！', '購買行く？', '一夜漬け中', 'テスト爆死', 'それな (激同)', 'マジの真実', 'ちょい待ち', '大丈夫・平気', '今ガチで真剣', '塾から脱出成功', '腹減りすぎて気絶', '宿題やった？', 'スマホ没収…', '気合入れていこう！', 'また明日ね！'],
  '鳥・小鳥 ①': ['チュンチュンおはよう', '羽毛もふもふ', 'ひまわりの種もぐもぐ', '止まり木で首かしげ', '大空へ飛び立て！', 'ピピッ！怒ったぞ', 'チュッとキス', 'ごはんちょうだい', '早起き完了！', '翼を大きく広げて', '飼い主さん遊ぼう', 'チュンチュンおしゃべり', 'バタバタ羽ばたき', '毛づくろい中', 'おやすみなさい'],
  '鳥・小鳥 ②': ['ピピピッ！', '鳥かご脱出大成功', '飼い主の指をツンツン', 'くちばし研ぎスリスリ', '好奇心いっぱいな瞳', '翼のストレッチ', '鳥かごの歌自慢', 'なでなでして', 'エサ箱をガサゴソ', '小鳥のアラーム', 'ウインク発射！', '風を切って飛行', '全力の甘えん坊', '飼い主大好き', '今日も幸せな小鳥'],
  '水族館・海洋生物 ①': ['水槽をぼーっと眺める', 'ぷくぷく泡ぶく', '深海でスヤスヤ', '波乗りサーフィン', '貝殻の中に隠れる！', 'スミ吹きプシュー！', 'スイスイ泳ぐよ', '鮮度100％！', '海のように広い心', 'ツルツルすべる', '水族館にお出かけ', 'エサに釣られないで', '触手ダンス', '大物が釣れた！', '深い海のおやすみ'],
  '水族館・海洋生物 ②': ['サンゴ礁を探検', 'ヒレをパタパタ', '泡玉ぽんぽん', 'ウミガメと泳ぐ', '水中の穏やかな平和', 'クラゲぷかぷか', '貝の中の真珠', '息止めチャンピオン', '海の仲間大集合', '海流に乗って移動', '深海探査完了！', '水中でゴロゴロ', '水槽掃除ピカピカ', '冷たい水が美味しい', '海のおやすみ'],
  '森の昆虫・小虫 ①': ['ミツバチのように働く', 'トコトコ移動中', 'ピカピカ光るホタル', 'ひらひら飛んでいく', '甘いハチミツの味', '木の上でお昼寝', 'よいしょ！頑張れ', '葉っぱの上で癒し', '触角レーダー作動', '森の探検隊', '朝露をごくり', 'ころころ転がして', '羽をパタパタ', 'かくれんぼ中', '森のおやすみなさい'],
  '森の昆虫・小虫 ②': ['ハチミツ壺を死守！', '花粉ぽんぽん', 'えっほえっほ運ぶ', '自然の中の癒し', '落ち葉の下でひと休み', '葉っぱのふかふかベッド', '森のオーケストラ', '朝露のごちそう', '触角でこんにちは', '木登りの名人', 'ミツバチダンス', 'どんぐり転がし', '森へお出かけ', '自然とひとつに', '月夜の森'],
  '爬虫類・ウーパールーパー ①': ['ウーパールーパーぷかぷか', 'ケロケロ大合唱', 'カメレオン変身！', '日向ぼっこ満喫中', 'トカゲのしっぽシュッ', 'ぷにぷにのエラ', 'のんびり癒しタイム', '葉っぱの上でパシャリ', '舌を伸ばしてパクッ', 'ウーパールーパーの笑顔', 'カエル大ジャンプ！', 'くりくりおめめ', 'サンショウウオ泳ぐ', '温かい岩の上', 'ぐっすりおやすみ'],
  '爬虫類・ウーパールーパー ②': ['水中でぷかぷか', 'カエルのコーラス', '壁登り大成功！', 'かわいいピンクのエラ', 'のんびりした午後', '雨の日は大はしゃぎ', 'カメレオンの隠れ身術', 'トカゲのウインク', '静かな癒し空間', 'ウーパールーパーのハート', 'ハスの葉の傘', '緑の森を探検', 'エラをゆらゆら', '岩の下で休憩', '心地よい夜を'],
  '恐竜・古生物 ①': ['ガオー！恐竜出現', 'ド스ンドスン足音', 'お肉爆食いタイム', '白亜紀を探検中', 'ダイナソーパワー！', '卵から生まれたよ', '草食恐竜もぐもぐ', '翼竜のように飛翔', '化石発掘完了！', 'ティラノサウルスの咆哮', '火山噴火だ逃げろ！', '恐竜のしっぽアタック', '赤ちゃん恐竜の一歩', '平和なジュラ紀', '恐竜の夢を見る'],
  '恐竜・古生物 ②': ['ティラノ一口ちょうだい', 'ブラキオの長い首癒し', '頭突き勝負だ！', '化石になっちゃいそう', '恐竜の卵を温める', 'プテラノドン滑空', '原生林をお散歩', '巨大化石発見大金星！', 'トリケラの角攻撃', '足音がズシンズシン', '恐竜ダンスパーティー', 'マンモス毛皮あったか', '氷河期を脱出！', '古生物の仲間たち', 'ジュラ紀のおやすみ'],
  '軍人・お見送り ①': ['忠誠！無事帰還を祈る', '休暇に出ました！', '電話に出てちょうだい', '部隊へ復帰中（涙）', '手紙を送ったよ', '今日も会いたいよ', '除隊まであと100日', '売店（PX）でお買い物', '訓練終了で誇らしい', '国を守っています', '軍靴を履いて走る', '待っててくれてありがとう', 'ピシッと敬礼！', '除隊おめでとう！', 'ぐっすりおやすみ忠誠'],
  '軍人・お見送り ②': ['起床ラッパが鳴り響く', '点呼の準備完了', '軍隊バーガーもぐもぐ', '百発百中の名射手', '行軍完走大成功！', '花靴を履かせてあげる', '認識票のネックレス', '戦友愛・仲間愛', '小包を送ってね', '面会に来て！', '褒賞休暇ゲット！', '各個戦闘クリア', '待つ恋人1日目', '最後まで待ってるよ', '団結！お疲れ様でした'],
  '社会人の本音 ①': ['はい（魂が抜けました）', 'チャット誤字ごめんなさい', '明日有休使います', '会社辞めたい…', '会議中に放心状態', '始末書コースかも（涙）', '給料が一瞬で消えた', '助けてください…', 'お金で心癒やされた', '企画書ボツでやり直し', '定時退社10秒前', '上司の顔色伺い中', 'コーヒーで延命', '週末だけが生きがい', 'お家に帰りたい'],
  '社会人の本音 ②': ['魂ゼロのリアクション', '出勤5分前に絶望', '給湯室にお菓子狩り', 'メール誤送信で冷や汗', '昇進祝い奢ってよ', '月曜病は克服不可', '会議室に監禁中', '残業仲間募集中', '給料日だけを待つ', '承知しました（無心）', '今日のお昼何食べる？', '退職画像保存中', '金曜の夜は燃え上がる', '有休承認バンザイ！', '明日も出勤か…'],
  '猫＆飼い主 ①': ['ニャンニャンパンチ！', 'ゴロゴロ音大放出', 'ふみふみマッサージ', 'ちゅ〜るを献上せよ', 'お尻トントンして', '情けない下僕め', 'キャットタワー制覇！', '爪切りは絶対イヤ！', 'ダンボールにすっぽり', 'しっぽフリフリ', 'ニャ〜ごはんちょうだい', '毛づくろいタイム', '香箱座り中', '飼い主の膝を占領', '猫のスヤスヤ睡眠'],
  '猫＆飼い主 ②': ['ちっぽけな下僕め', '狩りごっこ開始！', 'いたずらしてドヤ顔', 'キャットニップ祭り', '深夜の大暴れタイム', '肉球スタンプぽん', 'ドア開けてよ下僕', 'ゆっくりまばたきキス', 'おやつを差し出せ', 'レーザー捕獲失敗', '抜け毛もふもふ癒し', '高い場所が最高', 'すねた猫ちゃん', '下僕大好き（ツンデレ）', 'ゴロゴロおやすみ'],
  '犬＆飼い主 ①': ['散歩！散歩！お散歩！', 'しっぽヘリコプター', 'ご主人様おかえり！', 'おやつくれたらチュー', 'ボール投げて！', 'ガムをカミカミ', 'お手！おかわり！伏せ！', '耳をなびかせてダッシュ', 'お腹見せて甘えん坊', 'お風呂嫌いウーッ', 'ベッド完全占領', 'クンクン匂い嗅ぎ', 'マルチーズは負けない', 'ぽかぽかお昼寝', 'ご主人様大好き！'],
  '犬＆飼い主 ②': ['肉球の香ばしい匂い', 'ロープ引っ張り合いっこ', 'おやつバッグ警備員', '水遊びパチャパチャ', 'いたずらして様子見', 'もっと散歩したい！', 'ワンちゃんゴロゴロ', 'ブラッシングおとなしく', 'ワンちゃん友達できた', '飼い主一筋ワンちゃん', '遠吠えワオーン', 'ふかふか犬用ベッド', 'ハイタッチ！', 'おやつの匂いを察知', 'ワンちゃんおやすみ'],
  '結婚・ウェディング ①': ['結婚します！', '招待状をお送りします', 'ぜひ来てください！', '新郎入場！', '新婦入場！', 'ずっと幸せに', 'お祝いありがとう', '前撮り写真できました', 'ドレス選んで', 'ダイエット成功！', 'ハネムーン出発', '仲良く暮らします', 'プロポーズ成功 ♥', '式場で会いましょう', '愛の誓い'],
  '結婚・ウェディング ②': ['既婚者になりました！', 'お祝い包んできたよ', '結婚おめでとう ♥', '世界一の花嫁', '頼もしい新郎', '幸せな結婚式', 'ブーケトスキャッチ！', '花道を歩もう', '人生第2章開幕', '感動の涙ポロリ', 'ご参列感謝します', '指輪キラリ', '新居に遊びに来てね', 'お似合いの2人', '永遠に愛してる'],
  'ハロウィン・仮装 ①': ['トリック・オア・トリート！', 'お菓子くれないと悪戯しちゃうぞ', 'ハロウィン開宴！', '今日の仮装どう？', 'ジャックオーランタン点灯', 'ゾクゾク怖い〜', 'お化け出没注意', '魔女の特製ポーション', 'キャンディいっぱい', 'コウモリ飛んでる', '仮装大賞決定！', 'お菓子どうぞ', 'ハッピーハロウィン！', '不気味な夜', 'パーティー楽しもう！'],
  'ハロウィン・仮装 ②': ['お菓子集め出発！', 'うわっビックリ！', 'オバケダンスパーティー', 'パンプキンパイ焼き上がり', '魔女帽子装着', 'ハイクオリティ仮装', 'お菓子交換しよう', 'ハロウィンナイト', 'ホラー感最高', 'ドラキュラ変身', 'ほうきで飛行', 'お菓子ちょうだいモグ', 'モンスター大集合', 'ハッピーハロウィンデイ', 'また来年ね！'],
  '合格祈願・受験 ①': ['絶対合格！', '正解を狙い撃ち', '絶対受かる！', '受験生ファイト', '志望校にピタッと合格', '努力は裏切らない', '実力を発揮して！', 'サクラサク合格通知', 'マークミス注意', '最後まで集中！', '終わったら遊ぼう', '第一志望合格！', '夢を応援してるよ', '本当にお疲れ様', '合格通知ゲット！'],
  '合格祈願・受験 ②': ['満点目指してゴー！', '受験票持った？', 'モチモチ大願成就', '寒さに負けるな', 'リラックスしていつも通り', '正解が見える見える', '輝く未来へ', '終われば自由だ！', '心から祈ってるよ', '誇らしい受験生', '大勝利おめでとう', '合格ロードを進もう', '努力の花が咲く', '今日の主役は君だ', '自分を信じて！'],
  'クリスマス・年末 ①': ['メリークリスマス！', 'サンタさんプレゼントちょうだい', 'トナカイ出動！', 'ホワイトクリスマス', 'ツリー飾り付け中', '今年もお疲れ様', '忘年会・年末パーティー', '願いが叶いますように', '暖かい年末を', 'ケーキのロウソクふ〜', 'ジングルベル鳴る', 'プレゼント交換タイム', 'ハッピーニューイヤー！', '愛あふれる聖夜', 'さようなら今年！'],
  'クリスマス・年末 ②': ['ハッピーホリデー！', 'サンタ帽かぶったよ', '雪だるま作ろう', 'ジングルベルロック', 'キャロルで癒やし', '温かいホットワイン', '良い年末を過ごそう', 'クリスマスイブのワクワク', 'プレゼント開封の感動', 'キラめくツリー電飾', '年忘れパーティー', '大切な人と一緒に', 'ピカピカ赤鼻トナカイ', '来年もよろしくね', '聖夜のお祝い申し上げます'],
  'お花見・ピクニック ①': ['お花見行こう！', '春風そよそよ', 'お弁当作ってきたよ', '映え写真撮れた！', '花道を歩こう', 'レジャーシート敷こう', '暖かい春の陽射し', '心躍る春', '桜舞い散る', 'サンドイッチ美味しい', '春のお出かけ出発！', '最高の癒やし', 'お花のいい香り', '春を感じる', '今日の天気最高！'],
  'お花見・ピクニック ②': ['桜吹雪のロマン', 'お花見スポット確保', '春の遠足行こう', 'いちごスイーツモグモグ', '春の大掃除完了', '春ワンピ着て', '暖かい春の恵みの雨', 'レンギョウ満開', 'ピクニック気分満喫', '春ドライブ', 'お花見記念写真', '心がポカポカ', '春爛漫の季節', '春風に乗って', '素敵な春をお過ごしください'],
  '祝日・お正月・お盆 ①': ['あけましておめでとう！', 'お盆休み楽しんでね', '満月に願いを込めて', '美味しいごちそう', 'お雑煮食べて1歳プラス', 'お年玉ちょうだい！', '帰省ラッシュ中', '美味しい郷土料理', '親孝行します', '安全運転でね', '家族みんなで幸せに', 'お小遣い送ったよ', 'リフレッシュ完了！', '久しぶり嬉しい', '健康で幸せにね'],
  '祝日・お正月・お盆 ②': ['良い連休を！', '晴れ着を着て', 'かるた・福笑いしよう', '満月のように明るい年', '家族みんなで大笑い', '美味しいおせち料理', 'Uターンラッシュ中', 'ご両親お元気で', 'お歳暮・お中元届いたよ', '福が舞い込む', '温かい故郷のぬくもり', 'ご先祖様に感謝', '実り豊かな祝日', '今年も元気いっぱいに', '幸せいっぱいの休暇を！'],
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
  'MBTI & 梗 ②': ['I人只想一个人闭关宅家', 'E人瞬间开启社交牛逼症', 'T人直击灵魂的事实大暴击', 'F人瞬间泪腺大崩溃泪目', 'J人精确到分钟的时间表', 'P人说走就走的即兴旅行', '如假包换的重度MBTI研究员', '重度网络流行梗上瘾患者', '完美符合一切刻板印象模板', '尊贵到难以用言语形容', '共鸣感深到骨髓深处了', '这条发言绝对要火遍全网', '全人类都给我过来看', '我的本命就是至高神明', '绝妙天才神操作'],
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
  '高尔夫/下场挥杆 ②': ['清晨首组开球', '快乐高尔夫', '成功突破100杆！', '萌新球技进阶', '切杆精准上果岭', '晒晒高球新装备', '球叙小赌胜出！', '心态至上比赛', '约场室内模拟器', '调整挥杆动作', '清脆入洞落杯声', '阅读果岭坡度', '击球距离暴涨', '球场大片留念', '预约下次下场'],
  '儿童/幼儿园 ①': ['爸爸加油', '我很棒吧？', '买给我嘛！', '点心时间！', '明天见！', '不要午睡嘛~', '生气了（哼！）', '到！🙋', '去春游啦！', '吃饱啦！', '不想去嘛~', '我自己来！', '去公园玩', '妈妈我爱你', '困困了~'],
  '儿童/幼儿园 ②': ['长高高啦！', '老师最棒！', '我是第一名！', '好好奇！', '呼呼不痛啦', '还要吃！', '想看动画片', '好开心！', '妈妈什么时候来？', '一起玩吧！', '要抱抱', '刷牙刷干净', '吹泡泡呀', '给我礼物嘛！', '乖宝宝'],
  '老师/教师 ①': ['真棒！💮', '满分100分！', '非常优秀', '太棒啦！', '合格（PASS）！', '努力看得见！', '大大的表扬！', '进步很大！', '整洁工整！', '思维活跃！', '字迹清秀', '专注力满分！', '自信满满！', '老师很欣慰！', '明天继续加油！'],
  '老师/教师 ②': ['批阅完毕！⭕', '作业已检查', '及时订正！', '重新提交！', '再加把劲！', '注意扣分点！', '补考通知', '点名完毕！', '查看评语', '提交随堂作业', '来趟办公室', '严禁迟到！', '专心听讲！', '考试加油！', '下课！'],
  '结婚/新婚 ①': ['我们要结婚啦！', '会幸福的生活', '给你的请柬', '老公今天吃什么？', '洗碗值日生！', '蜜月旅行出发', '求婚大成功！', '我的另一半♥', '一起去买菜', '准时下班回家', '老公辛苦啦', '来我们家玩呀', '拜见双方父母', '甜蜜新婚生活', '永远的依靠'],
  '结婚/新婚 ②': ['老公我爱你', '帮忙晒衣服呀', '去约会吧', '要吃夜宵吗？', '老公生气了吗？', '汤煮好啦', '纪念日快乐', '结婚真好呀', '帮忙扔下垃圾', '只有你最好', '给你捏捏肩', '甜甜蜜蜜的我们', '幸福小家', '路上注意安全', '老公晚安'],
  'MZ 网络流行语 ①': ['自律搞钱搞生活', '心领神会秒懂', '绝不服输的心！', '状态封神了', '反而是好事', '纯属被针对', '自作自受...', '太气人了吧', '今日打卡完成！', '午饭吃什么？', '极乐升天...', '明天又要上班...', '周末一眨眼没了', '生存打卡！', '原地倒头秒睡 zZ'],
  '学生/00后 流行语 ②': ['放学啦！', '小卖部走起？', '临时抱佛脚中', '考砸了凉凉', '狠狠认可了', '真实人间清醒', '等我一下', '没事不用慌', '我现在很认真', '补习班脱逃成功', '饿到晕厥', '作业写完了吗？', '手机被没收了...', '冲鸭干就完了！', '明天见啦！'],
  '鸟类・宠物鸟 ①': ['叽叽喳喳早安', '羽毛蓬松松', '磕瓜子真香', '站杆上歪头杀', '展翅高飞！', '啾！生气啦', '么么哒亲亲', '求投喂饲料', '清晨早起完毕', '翅膀张开开', '铲屎官来玩嘛', '叽叽喳喳聊不停', '扑棱扑棱拍翅膀', '梳理羽毛中', '晚安做个好梦'],
  '鸟类・宠物鸟 ②': ['啾啾啾！', '成功越狱鸟笼', '啄啄主人手指', '磨磨小嘴巴', '充满好奇的小眼神', '翅膀拉伸运动', '鸟笼歌王争霸', '快帮我挠头毛', '扫荡饲料盒', '鸟鸣闹钟响了', '眨眼发射电波', '迎风飞翔好帅', '暴风撒娇中', '最粘主人了', '今天也是快乐小鸟'],
  '水族馆・海洋生物 ①': ['看鱼缸发呆治愈', '咕嘟咕嘟吐泡泡', '深海里呼呼大睡', '乘风破浪冲浪', '缩进贝壳里！', '喷射墨汁噗！', '自由自在游泳', '新鲜度100%！', '像大海一样宽广', '滑溜溜的好软', '去水族馆游玩', '别轻易上钩哦', '触手摇摆舞', '钓到大鱼啦！', '深海晚安好梦'],
  '水族馆・海洋生物 ②': ['珊瑚礁探险', '鱼鳍拍拍', '泡泡飘飘', '海龟悠闲游泳', '水中的宁静世界', '水母漂浮中', '贝壳里的珍珠', '憋气第一名', '海洋伙伴大集合', '顺着洋流前行', '深海探索完成！', '在水里打滚', '鱼缸清洗得超亮', '清凉水花好爽', '大海晚安'],
  '森林昆虫・小虫 ①': ['像蜜蜂一样打工', '慢吞吞爬行中', '闪闪发光的萤火虫', '翩翩起舞飞走', '甜甜的蜂蜜味', '树上午睡时间', '加油一二一！', '树叶上的慢生活', '触角雷达启动', '森林探险队', '喝一口清晨露水', '滚圆圆小球', '翅膀扇呀扇', '捉迷藏中', '森林晚安好梦'],
  '森林昆虫・小虫 ②': ['死守蜂蜜罐！', '花粉扑哧扑哧', '嘿呦嘿呦搬运', '大自然中的治愈', '落叶下小憩', '树叶软床好舒服', '森林交响乐', '清晨露珠大餐', '触角碰碰问好', '爬树小能手', '小蜜蜂摇摆舞', '滚橡果大赛', '森林大出游', '与自然合二为一', '月夜森林'],
  '爬行动物・六角恐龙 ①': ['六角恐龙吐泡泡', '呱呱呱大合唱', '变色龙变身！', '晒太阳日光浴', '蜥蜴尾巴摇摇', '粉嫩嫩的软腮', '悠闲治愈时光', '树叶上拍张照', '舌头一卷开饭', '六角恐龙微笑', '小青蛙大跳跃！', '大眼睛对视', '小蝾螈游泳', '趴在暖暖的石头上', '晚安睡个好觉'],
  '爬行动物・六角恐龙 ②': ['在水里漂浮', '青蛙合唱团', '爬墙挑战大成功！', '可爱的粉鳃飘飘', '悠闲慵懒的午后', '下雨天好嗨皮', '变色龙隐身术', '小蜥蜴眨眨眼', '安静治愈时刻', '六角恐龙爱心', '荷叶当雨伞', '绿色森林大冒险', '鳃丝轻轻晃动', '岩石底下乘凉', '愿你今夜好梦'],
  '恐龙・古生物 ①': ['嗷呜！恐龙出没', '咚咚咚沉重脚步', '大口吃肉肉时间', '白垩纪大探险', '恐龙超强力量！', '破壳而出的小恐龙', '植食恐龙吃草', '像翼龙一样翱翔', '化石挖掘大成功', '霸王龙暴风咆哮', '火山喷发快跑！', '恐龙甩尾攻击', '小恐龙学步中', '和平的侏罗纪', '梦见可爱恐龙'],
  '恐龙・古生物 ②': ['霸王龙求分一口', '腕龙长脖子治愈', '铁头功对决！', '感觉自己要石化了', '孵化恐龙蛋中', '无齿翼龙高空滑翔', '原始森林散步', '挖到巨大化石发财啦！', '三角龙犄角冲刺', '大脚印咚咚响', '恐龙摇摆舞会', '猛犸象毛皮好暖', '逃离冰河世纪！', '史前好伙伴', '侏罗纪晚安'],
  '军人・军恋 ①': ['敬礼！祈愿平安退伍', '放假出来啦！', '快接电话呀', '归队回营中（哭泣）', '寄了军营信件', '今天也超级想你', '倒计时-100天', '扫荡超市军人PX！', '训练结束好自豪', '保卫祖国中', '穿军靴奋力奔跑', '谢谢你一直等我', '豆腐块军被折好', '退伍大快乐！', '晚安睡个好觉敬礼'],
  '军人・军恋 ②': ['起床号角吹响', '早晚点名准备好', '军营汉堡真香', '百发百中神枪手', '负重行军大完赛', '给你穿上花鞋子', '胸前挂着军牌', '战友情深似海', '快给我寄包裹', '快来军营探望我！', '拿到嘉奖假期啦！', '单兵战术演练通关', '军恋守候第一天', '会一直等你的', '团结！大家辛苦了'],
  '打工人内心戏 ①': ['好的（灵魂出窍）', '群里打错字滑跪', '明天请年假了', '好想辞职啊...', '开会全程走神', '感觉要写检讨了ㅠㅠ', '工资光速退出了', '救救打工人吧...', '金钱治疗瞬间见效', '方案被推翻重做', '下班倒计时10秒', '偷瞄老板脸色中', '靠冰美式续命', '只盼着周末快来', '快放我回家吧'],
  '打工人内心戏 ②': ['莫得感情的回复', '上班前5分钟崩溃', '洗劫茶水间零食', '邮件发错老板冷汗', '升职必须请客哦', '周一综合征没救了', '被困在会议室', '寻找加班同伴', '只为发薪日活着', '收到好的（无念无想）', '今天午饭吃什么', '疯狂保存辞职表情包', '周五晚上嗨起来', '年假审批通过万岁', '明天居然还要上班...'],
  '猫咪＆铲屎官 ①': ['喵喵猫猫拳！', '呼噜呼噜发动中', '踩奶专业服务', '把冻干条呈上来', '快给本喵拍屁屁', '没用的愚蠢铲屎官', '猫爬架已登顶！', '坚决不剪指甲！', '钻进纸箱好舒服', '尾巴晃呀晃', '喵呜~快给饭饭', '日常舔毛理毛', '趴着烤猫面包', '稳坐铲屎官大腿', '猫猫呼呼大睡'],
  '猫咪＆铲屎官 ②': ['卑微的小小下人', '捕猎游戏开黑', '闯祸后一脸理直气壮', '猫薄荷狂欢派对', '凌晨三点跑酷狂飙', '盖上肉垫爪印章', '铲屎的快开门', '缓慢眨眼爱的亲吻', '零食快快交出来', '抓红外光点失败', '漫天猫毛也是爱', '喜欢呆在高处', '气鼓鼓的小猫咪', '最喜欢铲屎官啦（傲娇）', '呼噜噜晚安好梦'],
  '狗狗＆主人 ①': ['散步！散步！出去玩！', '螺旋桨摇尾巴', '主人回来啦！（狂喜）', '给零食就给亲亲', '快扔网球嘛！', '啃大骨头真香', '握手！碰鼻！趴下！', '耳朵飞扬狂奔中', '翻肚皮疯狂撒娇', '讨厌洗澡嗷呜', '大床完全占领', '鼻子嗅嗅到处闻', '马尔济斯绝不认输', '暖洋洋午后小憩', '最最爱主人了'],
  '狗狗＆主人 ②': ['肉垫香香的味道', '拔河拔河大战', '零食袋忠诚守护者', '戏水扑腾好开心', '闯祸后小心看眼色', '还想继续散步嘛！', '小狗在地上打滚', '乖乖梳毛好舒服', '偶遇狗狗好朋友', '眼睛里全都是主人', '嗷呜~狼嚎时间', '软绵绵专属狗窝', '击掌Give me five！', '捕捉到零食香味', '小狗晚安好梦'],
  '婚礼与请帖 ①': ['我们要结婚啦！', '为您送上请帖', '一定要来哦！', '新郎入场！', '新娘入场！', '白头偕老幸福永远', '感谢各位的祝福', '婚纱照出炉啦', '帮我挑挑婚纱', '备婚瘦身成功！', '蜜月旅行出发', '会幸福生活的', '求婚成功啦 ♥', '现场见哦', '爱的誓言'],
  '婚礼与请帖 ②': ['正式结为夫妻！', '备好份子钱啦', '新婚大喜 ♥', '全场最美新娘', '帅气新郎超可靠', '超幸福的婚礼', '抢到捧花啦！', '走在鲜花路上', '人生第二阶段开启', '感动得热泪盈眶', '感谢各位来宾', '钻戒闪闪发光', '来新房温居玩呀', '天生一对超登对', '永远深爱彼此'],
  '万圣节奇幻 ①': ['不给糖就捣蛋！', '不给糖就要恶作剧啦', '万圣狂欢开启！', '今天这身装扮如何？', '南瓜灯点亮啦', '惊险刺激超带感', '幽灵出没请注意', '女巫魔法药水咕嘟嘟', '糖果篮装满啦', '小蝙蝠起飞', '最佳装扮大奖！', '给你甜甜的糖果', '万圣节快乐！', '神秘奇妙夜', '尽情享受派对！'],
  '万圣节奇幻 ②': ['收割糖果出发！', '哇吓你一跳！', '幽灵热舞派对', '烘焙南瓜派中', '戴上女巫尖顶帽', '神级妆造超惊艳', '来交换糖果吧', '万圣奇妙夜', '恐怖氛围感拉满', '德古拉伯爵变身', '骑扫帚起飞', '请给我糖果吃', '怪物联盟大集结', '万圣节快乐呀', '明年万圣再见！'],
  '逢考必过/冲刺 ①': ['高考/期末必胜！', '单选多选全选对', '必定上岸！', '考生们加油冲', '像定胜糕一样稳稳录取', '努力绝不辜负', '实力完全爆发！', '逢考必过大吉', '仔细涂卡别马虎', '全神贯注到最后', '考完好好放飞', '喜提心仪大学！', '为你的梦想加油', '真的辛苦了', '带上录取通知书！'],
  '逢考必过/冲刺 ②': ['目标满分冲冲冲！', '准考证带齐了吗？', '稳稳高分录取', '战胜考场严寒', '放轻松正常发挥', '正确答案历历在目', '奔向璀璨未来', '考完就彻底自由啦', '虔诚为你祈福', '超棒的考生', '大捷凯旋归来', '一路踏上录取坦途', '辛勤汗水开花结果', '今天主角就是你', '相信你自己！'],
  '圣诞与新年 ①': ['圣诞快乐！', '圣诞老人快送礼物来', '驯鹿出发啦！', '白色浪漫圣诞', '装扮圣诞树中', '这一年辛苦啦', '跨年狂欢聚会', '愿望全部实现', '祝您度过温暖年末', '蛋糕蜡烛呼~', '清脆铃儿响叮当', '礼物交换时刻', '新年快乐！', '充满爱的圣诞节', '告别今年！'],
  '圣诞与新年 ②': ['节日快乐！', '戴好圣诞老人帽', '一起来堆雪人吧', '铃儿响叮当摇滚', '听圣诞颂歌治愈心灵', '来一杯热红酒', '圆满收尾这一年', '平安夜的怦然心动', '拆礼物超惊喜感动', '闪亮圣诞彩灯串', '年终复盘欢聚会', '与挚爱之人相伴', '红鼻子驯鹿闪亮登场', '明年也要幸福哦', '祝您圣夜吉祥'],
  '春日赏樱/野餐 ①': ['一起去赏樱花吧！', '春风拂面好惬意', '带了野餐便当哦', '拍到人生照片啦', '走在鲜花盛开的路上', '铺好野餐垫', '温暖柔和春光', '令人心动的春日', '漫天樱花飘落', '大口吃三明治', '春游踏青出发！', '治愈满满', '满园花香扑鼻', '感受春日气息', '今天天气绝了！'],
  '春日赏樱/野餐 ②': ['樱花雨的浪漫', '占到绝佳赏樱位', '春日春游走起', '草莓甜点大口吃', '春日大扫除搞定', '换上浪漫春日长裙', '润物细无声春雨', '连翘花迎春绽放', '野餐氛围感拉满', '春风得意自驾游', '赏花打卡认证照', '心里暖洋洋软绵绵', '春光无限好', '春风吹拂心荡漾', '祝您春日愉快！'],
  '传统佳节/团圆 ①': ['祝您新年大吉！', '中秋团圆快乐', '对着圆月许个愿', '美味过节佳肴', '吃年糕长一岁啦', '恭喜发财红包拿来！', '回家团聚的路上', '超赞的节日大餐', '好好孝敬父母', '一路平安顺风', '全家幸福安康', '给长辈发红包啦', '假期彻底放松！', '好久不见倍感亲切', '健康长寿幸福！'],
  '传统佳节/团圆 ②': ['祝您节日愉快', '换上典雅传统服饰', '阖家玩投壶猜谜', '如满月般明亮的一年', '全家人欢声笑语', '煎炸节日特色点心', '返程路上注意安全', '祝长辈福寿安康', '节日暖心礼盒送达', '福气滚滚进家门', '温馨浓郁故乡情', '虔诚感恩先辈福泽', '富足圆满的佳节', '这一年都要健健康康', '假期天天好心情！'],
};

const CHARACTER_TAGS_KO = {
  '🐱 동물': ['시바견', '치즈냥', '포메라니안', '똥실똥실 토끼', '장난꾸러기 원숭이', '햄스터', '다람쥐', '아기 곰', '사막여우', '쿼카', '판다', '고슴도치', '알파카', '아기 돼지', '느릿느릿 나무늘보', '아기 코끼리', '웰시코기', '카피바라', '너구리', '아기 사자', '참지않는 말티즈', '동글동글 비숑', '골든리트리버', '삼색 고양이', '턱시도 고양이', '레서판다', '하얀 아기 양', '아기 사슴', '아기 호랑이', '캥거루'],
  '🐦 새/조류': ['뱁새 (오목눈이)', '알록달록 앵무새', '토실토실 참새', '아기 펭귄', '아기 오리', '뒤뚱뒤뚱 갈매기', '동글동글 비둘기', '왕눈이 부엉이/올빼미', '화려한 플라밍고', '삐약삐약 병아리', '우아한 백조', '장난꾸러기 까마귀', '부리부리 투칸', '아기 타조', '파랑새', '아기 기러기'],
  '🐟 어패류/해양생물': ['말랑말랑 문어', '귀여운 꼴뚜기/오징어', '동글동글 금붕어', '푸른 바다 고래', '아기 상어', '헤엄치는 돌고래', '투명한 해파리', '옆으로 걷는 꽃게', '방긋 웃는 바다거북', '진주 품은 조개/가리비', '가시 돋친 성게', '빵빵한 복어', '귀여운 수달', '아기 물개', '하프물범', '신비로운 해마', '동글 가오리', '아기 랍스터'],
  '🐞 곤충/벌레': ['날개 펄럭이는 나비', '행운의 무당벌레', '부지런한 꿀벌', '늠름한 장수풍뎅이', '멋진 턱 사슴벌레', '초록 잠자리', '반짝반짝 반딧불이', '꿈틀꿈틀 아기 애벌레', '영차영차 일개미', '풀잎 위 사마귀', '노래하는 귀뚜라미', '동글이 달팽이', '알록달록 풍뎅이', '풀벌레 요정'],
  '🦎 파충류/양서류': ['핑크빛 우파루파 (아홀로틀)', '동글이 청개구리', '눈 땡글한 게코도마뱀', '색깔 바뀌는 카멜레온', '아기 거북이', '말랑말랑 도롱뇽', '귀여운 아기 악어', '미소 짓는 뱀', '아기 이구아나'],
  '🦖 공룡/고생물': ['아기 티라노사우루스', '순둥이 브라키오사우루스', '귀여운 트리케라톱스', '하늘 나는 프테라노돈', '아기 스테고사우루스', '털복숭이 아기 매머드', '아기 벨로시랩터', '아기 안킬로사우루스'],
  '🧸 인형/문구/팬시': ['빈티지 테디베어 곰인형', '낡은 애착 토끼인형', '포스트잇 요정', '다이어리 다꾸 스티커', '말랑 젤리 키링', '연필깎이 꼬마', '알록달록 크레파스봇', '미니 스노우볼', '포근한 쿠션 인형'],
  '👦 인물': ['단발머리 소녀', '안경 쓴 모범생', '투블럭 남학생', '뽀글머리 아줌마', '수염 난 아저씨', '포니테일 체육생', '양갈래 소녀', '비니 쓴 힙스터', '젠틀한 신사', '사랑스러운 꼬마', '프로페셔널 커리어우먼', '온화한 백발 할머니', '지팡이 짚은 할아버지', '귀여운 유치원생/어린이', '친절한 선생님/교사', '행복한 신랑/신부', '달콤한 신혼부부', '선글라스 낀 래퍼', '카페 바리스타', '까까머리 군인', '헤드폰 낀 프로게이머', '근육질 헬스보이', '카메라 든 배낭여행객', '따뜻한 의사선생님', '정의로운 경찰관', '기타 치는 록스타', '스케이트보드 타는 소년', '화려한 K팝 아이돌', '푸근한 동네 아저씨', '유연한 필라테스 강사', '열정적인 건축가', '파리지앵 화가', '스피드 라이더', '화사한 꽃집 사장님', '열공 취업준비생', '피곤한 직장인', '달콤한 파티시에/제빵사', '만능 엔지니어/메카닉', '지혜로운 선비', '서부 카우보이', '카리스마 해적 선장', '화려한 마술사', '우아한 발레리나', '천하태평 백수', '괴짜 천재 과학자', '풋풋한 대학생 훈남', '우아한 공주님', '용맹한 기사', '열정 태권도 사범', '상냥한 항공 승무원', '카메라맨', '프로 등산러/산악인', '뉴스 아나운서', '공정한 판사', '용감한 소방관', '미슐랭 스타 셰프', '생기발랄 알바생', '부지런한 청년 농부', '순수한 숲속 소녀', '명랑한 중고등학생', '파도를 가르는 서퍼', '간절한 취업준비생', '신입사원', '영혼 털린 직장인', '초보 운전자', '헬창/운동 마니아'],
  '🦄 판타지/사물': ['유니콘', '아기 드래곤', '꼬마 마법사', '숲의 요정', '말랑말랑 모찌', '달콤한 마카롱', '딸기 케이크', '포동포동 만두', '꼬마 뱀파이어', '바다 인어공주', '용감한 꼬마 기사', '외계인', '아기 구미호', '귀여운 뿔 도깨비', '빛나는 천사', '장난꾸러기 아기 악마', '마법 양탄자', '솜사탕 구름', '신비로운 인어', '날개 달린 페가수스', '말하는 호박', '우주 비행사', '마법 빗자루', '젤리 괴물', '눈사람 요정'],
  '🤖 로봇/SF': ['아기 로봇', '사이버 냥이', '말랑 슬라임', '우주 햄스터', '아기 공룡', '픽셀 로봇', '꼬마 외계인', '메카 강아지', '네온 유령', '우주 비행 댕댕이', '사이버펑크 토끼', '홀로그램 유령', 'UFO 탄 외계인', '레트로 모니터봇', '미니 게임기봇', '배터리 충전봇', 'AI 안드로이드', '변신 메카 로봇'],
  '🍞 디저트/음식': ['말하는 붕어빵', '식빵 아저씨', '마카롱 토끼', '아메리카노 유령', '포동 만두 동자', '딸기 찹쌀떡', '초코칩 쿠키', '치즈 핫도그', '말랑 푸딩', '탕후루 요정', '말랑 떡볶이 떡', '삼각김밥 꼬마', '치즈 피자 조각', '바삭 감자튀김', '노릇 계란후라이', '보글보글 라면', '소프트 아이스크림', '쫀득 타코야끼', '달콤 컵케이크', '비엔나 소시지'],
  '🌿 식물/자연': ['아기 선인장', '네잎클로버 요정', '동글이 버섯', '화분 아기', '해바라기 꼬마', '새싹 요정', '아기 단풍잎', '방울 토마토', '말랑 아보카도', '달콤 복숭아 요정', '매운맛 아기 고추', '민들레 홀씨', '뽀송 목화솜', '상큼 레몬 꼬마', '눈물 흘리는 양파', '동글동글 도토리', '빨간 사과 요정', '가을 꿀밤송이'],
  '👀 외형/특징': ['둥근 얼굴형', '크고 반짝이는 눈', '통통한 볼살', '짧고 통통한 팔다리', '작고 동그란 코', '발그레한 볼', '복슬복슬한 털', '말랑한 젤리 몸', '길고 쫑긋한 귀', '작은 송곳니', '주근깨', '한쪽 눈을 덮는 앞머리', '동그란 안경', '풍성한 꼬리', '작은 날개', '별 모양 눈동자', '하트 모양 볼무늬', '미니 SD 체형'],
  '✨ 성격/감정': ['장난기 많은', '시크하고 도도한', '순둥순둥 착한', '늘 피곤에 찌든', '애교가 넘치는', '화가 많은', '느긋한', '눈물 많은', '활발한', '소심한', '엉뚱한', '다정한', '항상 배고픈', '호기심 가득한', '매사에 진지한', '허세 가득한', '사랑에 빠진', '자신감 넘치는', '덜렁거리는', '게으른 뒹굴뒹굴', '열정 만수르', '겁이 많은', '새침떼기', '의욕 상실한', '돈을 좋아하는'],
  '🖌️ 화풍': ['귀여운 2D 만화풍', '한국 웹툰 스타일', '손그림 낙서풍', '부드러운 수채화풍', '색연필 동화책풍', '레트로 애니메이션풍', '깔끔한 미니멀 벡터', '통통 튀는 팝아트풍', '굵은 선의 코믹북풍', '도트 픽셀 아트풍', '종이 콜라주풍', '빈티지 인쇄 만화풍', '흑백 만화 톤', '열혈 배틀 만화풍', '샤방샤방 순정만화풍', '8090 레트로 애니풍', '3D 반실사 애니 렌더링', '일본 출판 만화풍', '3D 펠트/클레이 점토 인형풍', '크레파스 낙서풍', 'Y2K 픽셀 스티커풍', 'B급 병맛/코믹 짤툰풍', '크레파스/오일파스텔 동화풍', '동양화/수묵담채화풍'],
  '👕 의상': ['의사 가운', '요리사 앞치마', '회사원 정장', '오버핏 후드티', '멜빵바지', '교복', '트레이닝복', '우비', '포근한 잠옷', '마법사 망토', '화려한 드레스', '스포티한 캡모자', '두꺼운 패딩', '가죽 자켓', '단정한 셔츠와 넥타이', '화사한 꽃무늬 원피스', '힙한 스트릿 패션', '전통 무술 도복', '따뜻한 니트 스웨터', '귀여운 동물 잠옷', '우주복', '탐험가 조끼와 모자', '수영복과 튜브', '클래식한 트렌치코트', '반짝이는 요정 날개', '왕관과 망토', '청바지와 흰 티', '명탐정 코트와 모자'],
  '🎒 소품/동작': ['스마트폰을 든', '커피잔을 든', '선글라스를 낀', '헤드폰을 낀', '노트북을 하는', '책을 읽는', '풍선을 든', '꽃다발을 안고 있는', '마이크를 잡고 노래하는', '게임패드를 쥐고 있는', '프라이팬을 들고 있는', '커다란 돋보기를 든', '스케치북에 그림 그리는', '마법 지팡이를 휘두르는', '장바구니를 들고 있는', '우산을 쓰고 있는', '팝콘을 먹고 있는', '청소기를 돌리는', '망원경으로 엿보는', '요가 매트에서 스트레칭하는', '스마트워치를 확인하는', '돈다발을 쥐고 있는', '아이스 아메리카노 텀블러를 든', '노트북을 두드리는', '치킨 닭다리를 뜯는', '소주/맥주잔을 부딪치는', '수액 링거 맞고 있는'],
  '🌏 글로벌/전통 문화': ['우아한 전통 궁중 한복 룩', '갓과 두루마기 모던 한복 룩', '화려한 K-POP 아이돌 의상', '태권도 검은띠 무도복', '전통 기모노 / 유카타', '아키하바라 메이드 코스프레', '사무라이 하카마 & 닌자 의상', '일본 청춘 세일러복 교복', '신사 무녀(미코) 의상', '신비로운 무협/선협 검객 도포', '화려한 전통 치파오 / 한푸', '이소룡풍 노란 트레이닝 무술복', '경극 가면 배우', '와일드 웨스트 카우보이', '런던 신사 트렌치코트 & 중절모', '사이버펑크 네온 스트릿웨어', '중세 유럽 기사 갑옷', '베레모와 바게트 든 파리지앵', '영국 왕실 근위병 (베어스킨 모자)', '스페인 플라멩코 무용수', '독일 옥토버페스트 레더호젠', '베네치아 가면무도회 귀족', '멕시코 마리아치 & 솜브레로', '망자의 날 슈가 스컬 분장', '브라질 삼바 카니발 댄서', '베트남 아오자이 & 논라 삿갓', '태국 전통 사바이 의상', '인도 전통 사리와 보석 (볼리우드)', '아라비안 나이트 터번 & 요술램프', '하와이안 알로하 셔츠 & 우쿨렐레'],
  '🎬 영화/애니메이션': ['마법학교 기숙사 교복과 지팡이', '선글라스와 블랙 수트 비밀요원', '빛나는 네온 블레이드 우주 기사', '별빛 요술봉을 든 변신 마법소녀', '가죽 모자와 채찍을 든 고고학 탐험가', '삼각모자와 깃털 장식 해적 선장', '펄럭이는 빨간 망토 슈퍼히어로', '어둠의 카리스마 다크 히어로', '가죽자켓과 선글라스 바이커 라이더', '지브리풍 비행사 모자와 고글', '숲속의 거대 잎사귀 정령', '트렌치코트와 돋보기 든 클래식 명탐정', '우주 헬멧을 쓴 성간 탐사선 비행사', '판초를 두른 서부 무법자 총잡이', '반쪽 하얀 가면의 오페라 유령', '드래곤을 길들이는 바이킹 전사', '시간여행 타임트래블러', '디스토피아 좀비 아포칼립스 생존자'],
  '💼 직장인/오피스': ['칼퇴 10초 전 시계 쳐다보는', '야근에 찌든 다크서클', '월급날 통장 보고 감격 눈물', '회의실에서 영혼 가출 멍때리기', '사직서 품에 살포시 안은', '커피 3잔 연속 수혈하기', '모니터 뒤에 몰래 숨은', '결재 서류 들고 눈치 보는', '출근길 만원 지하철 끼인', '점심 메뉴 고르며 행복해하는', '금요일 퇴근 발걸음 경쾌한', '월요병으로 침대와 한 몸'],
  '🎮 게임/E스포츠': ['RGB 게이밍 헤드셋 낀', '키보드 샷건 치며 분노', '랭크 승급하고 폭죽 터뜨리는', '트롤 팀원 보고 뒷목 잡는', '에너지 드링크 마시며 밤샘', 'VR 고글 쓰고 허공 휘젓는', '컨트롤러 쥐고 초집중 눈빛', '치킨이닭 1등 승리 세리머니', '와이파이 끊겨서 절망하는', '보스 레이드 파티 모집하는', '가챠 뽑기 대성공 환호', '가챠 폭망하고 바닥에 엎드림'],
  '💘 연애/커플': ['시밀러룩 맞춰 입은', '손잡고 꽁냥꽁냥 걷는', '삐져서 볼 부풀리고 등 돌린', '보고 싶어서 영상통화 캡처', '하트 뿅뿅 쿠션 껴안은', '꽃다발 뒤에 얼굴 숨긴', '기념일 케이크 촛불 후 부는', '어깨에 기대어 꿀잠 자는', '손하트 발사하며 애교 부리기', '연락 기다리며 스마트폰 멍하니 보기', '영화관에서 팝콘 같이 집다가 손 닿은', '비 오는 날 우산 기울여 씌워주는'],
  '💪 헬스/다이어트': ['프로틴 쉐이커 쉑쉑 흔드는', '무거운 덤벨 번쩍 든', '인바디 체지방률 보고 충격', '샐러드 씹으며 치킨 상상하기', '러닝머신 위에서 땀 뻘뻘', '체중계 올라가고 좌절 눈물', '오운완 거울 셀카 찰칵', '스쿼트 하다가 다리 후들거리는', '스트레칭 폼롤러 위에서 비명', '물 2리터 벌컥벌컥 마시는', '근육 펌핑 거울 보며 흐뭇', '치팅데이 피자 버거 폭풍 흡입'],
  '🌈 배경/효과': ['반짝반짝 빛나는 효과', '하트 뿅뿅 날리는', '별빛이 내리는', '네온사인 번쩍이는', '만화적인 집중선', '벚꽃이 흩날리는', '불타오르는 이펙트', '땀방울이 튀는', '우울한 먹구름', '무지개빛 아우라', '펑 터지는 폭발', '어두운 그림자', '스포트라이트 조명', '눈보라가 치는', '번개가 치는', '뽀글뽀글 거품', '따뜻한 햇살', '음표가 떠다니는', '바람에 흩날리는', '물음표 둥둥 (?)', '느낌표 번쩍 (!)', '부들부들 떨림선', '충격 먹구름', '하트 눈빛 (반짝)'],
};

const CHARACTER_TAGS_EN = {
  '🐱 Animal': ['Shiba Inu', 'Orange Tabby Cat', 'Pomeranian', 'Chubby Bunny', 'Mischievous Monkey', 'Hamster', 'Squirrel', 'Baby Bear', 'Fennec Fox', 'Quokka', 'Panda', 'Hedgehog', 'Alpaca', 'Piglet', 'Lazy Sloth', 'Baby Elephant', 'Welsh Corgi', 'Capybara', 'Raccoon', 'Baby lion', 'Feisty Maltese', 'Fluffy Bichon Frise', 'Golden Retriever', 'Calico cat', 'Tuxedo cat', 'Red panda', 'White lamb', 'Baby deer', 'Baby tiger', 'Kangaroo'],
  '🐦 Bird': ['Korean crow tit (Baepsae)', 'Colorful parrot', 'Chubby sparrow', 'Baby penguin', 'Baby duck', 'Waddling seagull', 'Round pigeon', 'Big-eyed owl', 'Glamorous flamingo', 'Cute chick', 'Graceful swan', 'Playful crow', 'Toucan with big beak', 'Baby ostrich', 'Bluebird', 'Baby wild goose'],
  '🐟 Marine Life': ['Soft squishy octopus', 'Cute squid/cuttlefish', 'Round goldfish', 'Blue ocean whale', 'Baby shark', 'Swimming dolphin', 'Transparent jellyfish', 'Side-walking crab', 'Smiling sea turtle', 'Pearl inside oyster/clam', 'Spiky sea urchin', 'Puffy blowfish', 'Cute otter', 'Baby seal', 'Harp seal pup', 'Mystical seahorse', 'Round stingray', 'Baby lobster'],
  '🐞 Insect/Bug': ['Fluttering butterfly', 'Lucky ladybug', 'Busy honeybee', 'Mighty rhinoceros beetle', 'Stag beetle with jaws', 'Green dragonfly', 'Twinkling firefly', 'Wiggling caterpillar', 'Heave-ho worker ant', 'Praying mantis on leaf', 'Singing cricket', 'Round snail', 'Colorful scarab beetle', 'Forest bug fairy'],
  '🦎 Reptile/Amphibian': ['Pink axolotl (Wooper)', 'Round tree frog', 'Big-eyed gecko lizard', 'Color-shifting chameleon', 'Baby turtle', 'Soft salamander', 'Cute baby crocodile', 'Smiling snake', 'Baby iguana'],
  '🦖 Dinosaur': ['Baby T-Rex', 'Gentle Brachiosaurus', 'Cute Triceratops', 'Flying Pteranodon', 'Baby Stegosaurus', 'Fluffy baby mammoth', 'Baby Velociraptor', 'Baby Ankylosaurus'],
  '🧸 Plushie/Stationery': ['Vintage teddy bear', 'Well-loved bunny plushie', 'Post-it memo fairy', 'Journal deco sticker', 'Squishy jelly keychain', 'Pencil sharpener kid', 'Colorful crayon bot', 'Mini snow globe', 'Cozy cushion doll'],
  '👦 Person': ['Bob cut girl', 'Nerdy student with glasses', 'Two-block cut boy', 'Permed middle-aged woman', 'Bearded uncle', 'Ponytail athlete', 'Pigtail girl', 'Beanie hipster', 'Gentleman in suit', 'Child in Hanbok', 'Career woman in suit', 'Gentle white-haired grandmother', 'Grandfather with cane', 'Cute kindergartener/child', 'Kind teacher/educator', 'Happy groom/bride', 'Sweet newlyweds', 'Rapper with shades', 'Barista with apron', 'Buzz cut soldier', 'Pro gamer with headset', 'Muscular gym bro', 'Backpacker with camera', 'Doctor in white coat', 'Courageous police officer', 'Rock star playing guitar', 'Skater boy', 'Glamorous K-Pop idol', 'Friendly neighborhood guy', 'Yoga instructor', 'Architect in hard hat', 'Parisian artist', 'Biker rider', 'Florist shop owner', 'Job seeker with backpack', 'Tired office worker', 'Baker in apron', 'Skillful mechanic', 'Scholar in traditional robe', 'Cowboy hat rancher', 'Pirate captain with eyepatch', 'Glamorous magician', 'Ballerina in tutu', 'Slacker in tracksuit', 'Scientist in lab coat', 'Handsome guy in tee and jeans', 'Princess in ballgown', 'Knight in shining armor', 'Taekwondo master', 'Flight attendant in uniform', 'Cameraman', 'Hiker in mountain gear', 'Announcer with microphone', 'Judge in legal robe', 'Firefighter in gear', 'Chef in toque', 'Part-timer in cap', 'Farmer in straw hat', 'Forest maiden in flower crown', 'Student eating tteokbokki', 'Surfer with surfboard', 'Hair roller job seeker', 'Rookie employee', 'Burnout office worker', 'Student beginner driver', 'Gym fitness enthusiast'],
  '🦄 Fantasy/Object': ['Unicorn', 'Baby dragon', 'Tiny wizard', 'Forest fairy', 'Soft mochi', 'Sweet macaron', 'Strawberry shortcake', 'Tiny Jelly Candy', 'Little vampire', 'Mermaid princess', 'Brave young knight', 'Alien buddy', 'Baby nine-tailed fox', 'Cute horned goblin', 'Shining angel', 'Mischievous little devil', 'Flying magic carpet', 'Cotton candy cloud', 'Mystical mermaid', 'Winged Pegasus', 'Talking pumpkin', 'Astronaut', 'Magic broomstick', 'Jelly monster', 'Snowman fairy'],
  '🤖 Robot/Sci-Fi': ['Baby robot', 'Cyber kitty', 'Jelly slime', 'Space hamster', 'Baby dino', 'Pixel bot', 'Tiny alien', 'Mecha pup', 'Neon ghost', 'Space dog astronaut', 'Cyberpunk bunny', 'Hologram ghost', 'UFO pilot alien', 'Retro monitor bot', 'Handheld game bot', 'Battery charging bot', 'AI android fairy', 'Transforming mecha'],
  '🍞 Dessert/Food': ['Talking fish pastry', 'Toast bread guy', 'Macaron bunny', 'Iced coffee ghost', 'Chubby dumpling', 'Strawberry mochi', 'Choco chip cookie', 'Cheese corn dog', 'Custard pudding', 'Tanghulu fairy', 'Chewy rice cake', 'Onigiri rice ball', 'Cheesy pizza slice', 'Crispy fries', 'Sunny-side up egg', 'Ramen noodles', 'Soft serve ice cream', 'Chewy takoyaki', 'Sweet cupcake', 'Vienna sausage'],
  '🌿 Plant/Nature': ['Baby cactus', 'Four-leaf clover fairy', 'Round mushroom', 'Plant pot baby', 'Sunflower buddy', 'Sprout fairy', 'Maple leaf', 'Cherry tomato', 'Cute avocado', 'Sweet peach fairy', 'Spicy chili baby', 'Dandelion fluff', 'Fluffy cotton fairy', 'Fresh lemon buddy', 'Crying onion', 'Cute acorn', 'Red apple fairy', 'Autumn chestnut'],
  '👀 Appearance': ['Round face shape', 'Large sparkling eyes', 'Chubby cheeks', 'Short chubby limbs', 'Small round nose', 'Rosy blushed cheeks', 'Fluffy soft fur', 'Soft squishy jelly body', 'Long perky ears', 'Tiny fangs', 'Cute freckles', 'Bangs covering one eye', 'Round glasses', 'Fluffy voluminous tail', 'Tiny fairy wings', 'Star-shaped pupils', 'Heart cheek pattern', 'Mini chibi SD body'],
  '✨ Trait/Emotion': ['Playful and cheeky', 'Chic and aloof', 'Gentle and kind', 'Perpetually exhausted', 'Full of cute charm', 'Hot-tempered', 'Laid-back and easygoing', 'Crybaby', 'Energetic and lively', 'Timid and shy', 'Goofy and quirky', 'Warm and sweet', 'Always hungry', 'Curious and inquisitive', 'Deadly serious', 'Pompous and showy', 'Deeply in love', 'Full of confidence', 'Clumsy butterfingers', 'Lazy couch potato', 'Overflowing with passion', 'Timid scaredy-cat', 'Prudish and sassy', 'Completely unmotivated', 'Money lover'],
  '🖌️ Art Style': ['Cute 2D cartoon', 'Korean webtoon style', 'Hand-drawn doodle', 'Soft watercolor', 'Colored pencil storybook', 'Retro animation', 'Clean minimal vector', 'Vibrant pop art', 'Bold line comic book', 'Pixel art retro dot', 'Paper collage style', 'Vintage print comic', 'Monochrome manga tone', 'Hot-blooded battle manga', 'Sparkling shojo manga', '80s-90s retro anime', '3D Semi-realistic anime rendering', 'Japanese Manga Ink & Tone Style', '3D Felt & Claymation Doll Style', 'Crayon Wax Pastel Doodle Style', 'Y2K Retro Glitter Pixel Sticker Style', 'Meme Webtoon Satirical Style', 'Crayon & Oil Pastel Storybook Style', 'Oriental Sumi-e Ink Wash Painting'],
  '👕 Outfit': ['Doctor coat', 'Chef apron', 'Business suit', 'Oversized hoodie', 'Overalls', 'School uniform', 'Tracksuit', 'Raincoat', 'Cozy pajamas', 'Wizard cape', 'Glamorous ballgown', 'Sporty baseball cap', 'Puffer jacket', 'Leather jacket', 'Shirt and tie', 'Floral dress', 'Hip streetwear', 'Martial arts uniform', 'Warm knit sweater', 'Animal onesie', 'Spacesuit', 'Explorer vest and hat', 'Swimwear and tube', 'Classic trench coat', 'Glittering fairy wings', 'Crown and royal cape', 'T-shirt and jeans', 'Detective coat and hat'],
  '🎒 Prop/Action': ['Holding smartphone', 'Holding coffee cup', 'Wearing sunglasses', 'Wearing headphones', 'Working on laptop', 'Reading a book', 'Holding a balloon', 'Holding flower bouquet', 'Singing into microphone', 'Holding game controller', 'Holding frying pan', 'Holding large magnifying glass', 'Drawing in sketchbook', 'Waving magic wand', 'Holding grocery basket', 'Holding an umbrella', 'Eating popcorn', 'Vacuuming floor', 'Peeking through binoculars', 'Stretching on yoga mat', 'Checking smartwatch', 'Holding stacks of cash', 'Holding iced Americano tumbler', 'Typing on laptop', 'Eating fried chicken drumstick', 'Clinking beer/soju glasses', 'Getting IV drip while exhausted'],
  '🌏 World Cultures': ['Traditional Hanbok Korean robe', 'Modern hip Hanbok with Gat hat', 'K-Pop idol stage outfit', 'Taekwondo Dobok martial uniform', 'Traditional Japanese Kimono / Yukata', 'Akihabara Maid cafe cosplay', 'Samurai swordsman / Ninja gear', 'Japanese sailor school uniform', 'Shrine maiden Miko robe', 'Wuxia martial arts silk robe', 'Traditional Cheongsam / Hanfu dress', 'Kung Fu martial artist yellow suit', 'Beijing opera mask performer', 'Wild West cowboy sheriff', 'London gentleman trench coat & fedora', 'Cyberpunk neon streetwear', 'Medieval knight armor & cape', 'Parisian with beret and baguette', 'British royal guard with bearskin cap', 'Spanish Flamenco dancer with rose', 'German Oktoberfest Lederhosen', 'Venetian masquerade noble outfit', 'Mexican Mariachi with Sombrero', 'Day of the Dead sugar skull', 'Brazilian Samba carnival dancer', 'Vietnamese Ao Dai & Non La hat', 'Traditional Thai Sabai silk dress', 'Indian Bollywood silk Saree', 'Arabian Nights turban & magic lamp', 'Hawaiian Aloha shirt & Ukulele'],
  '🎬 Cinema & Anime': ['Wizard school uniform & magic wand', 'Secret agent in black suit & shades', 'Space knight with neon energy blade', 'Magical girl with starlight wand', 'Archaeologist explorer with fedora & whip', 'Pirate captain with tricorn hat & feather', 'Superhero with flowing red cape', 'Dark charismatic masked hero', 'Biker in leather jacket & sunglasses', 'Ghibli-style aviator cap & goggles', 'Giant forest spirit holding a leaf', 'Classic detective with trench coat & magnifying glass', 'Interstellar astronaut with space helmet', 'Western outlaw gunslinger wearing poncho', 'Phantom with half white mask', 'Viking warrior dragon tamer', 'Time traveler with retro goggles', 'Zombie apocalypse survivor'],
  '💼 Office & Work': ['Watching clock 10s before clock-out', 'Dark circles from overtime work', 'Tears of joy on payday', 'Soul leaving body during meetings', 'Holding resignation letter in pocket', 'Drinking 3 cups of coffee in a row', 'Hiding behind computer monitor', 'Checking boss mood with approval folder', 'Squished in crowded morning subway', 'Happy while picking lunch menu', 'Bouncy joyful Friday clock-out walk', 'Glued to bed with Monday blues'],
  '🎮 Gaming & Esports': ['Wearing RGB gaming headset', 'Raging and smashing keyboard', 'Confetti celebration on rank up', 'Holding neck in rage at troll teammates', 'All-nighter with energy drinks', 'Swinging arms in VR goggles', 'Laser focus holding controller', 'Winner winner chicken dinner ceremony', 'Despair when Wi-Fi disconnects', 'Recruiting for boss raid party', 'Cheering on gacha jackpot pull', 'Face down crying after failed gacha'],
  '💘 Romance & Couples': ['Wearing matching couple outfits', 'Holding hands walking sweetly', 'Pouting with puffed cheeks facing away', 'Taking screenshot on video call', 'Hugging glowing heart cushion', 'Hiding face behind flower bouquet', 'Blowing out anniversary cake candle', 'Sleeping sweetly on shoulder', 'Sending finger heart aegyo', 'Staring at phone waiting for text', 'Touching hands over cinema popcorn', 'Tilting umbrella to share in rain'],
  '💪 Fitness & Diet': ['Shaking protein shaker bottle', 'Lifting heavy dumbbell with pride', 'Shocked looking at InBody body fat scan', 'Chewing salad dreaming of fried chicken', 'Sweating profusely on treadmill', 'Crying in despair on weighing scale', 'Snapping gym mirror selfie (OOTD)', 'Legs shaking after heavy squats', 'Screaming on foam roller stretch', 'Gulping down 2L water bottle', 'Smiling admiring muscle pump in mirror', 'Devouring pizza and burgers on cheat day'],
  '🌈 Effect/BG': ['Sparkling glittering effect', 'Hearts fluttering around', 'Starlight falling', 'Neon signs blinking', 'Comic action speed lines', 'Cherry blossom petals swirling', 'Blazing fire effect', 'Sweat drops splashing', 'Gloomy rain cloud', 'Rainbow aura', 'Boom explosion', 'Dark ominous shadow', 'Spotlight illumination', 'Blizzard snowstorm', 'Lightning flash', 'Bubbles floating', 'Warm gentle sunshine', 'Musical notes floating', 'Blowing in the wind', 'Floating question marks (?)', 'Sparking exclamation mark (!)', 'Shivering tremble lines', 'Shock dark cloud', 'Heart sparkle eyes'],
};

const CHARACTER_TAGS_JA = {
  '🐱 動物': ['柴犬', '茶トラ猫', 'ポメラニアン', 'まんまるウサギ', 'いたずら子猿', 'ハムスター', 'リス', '子グマ', 'フェネック', 'クアッカワラビー', 'パンダ', 'ハリネズミ', 'アルパカ', '子ブタ', 'のんびりナマケモノ', '子象', 'コーギー', 'カピバラ', 'アライグマ', '赤ちゃんライオン', '強気なマルチーズ', 'ふわもこビション・フリーゼ', 'ゴールデンレトリバー', '三毛猫', 'タキシード猫', 'レッサーパンダ', '白い子羊', '子鹿', '赤ちゃんトラ', 'カンガルー'],
  '🐦 鳥・野鳥': ['シマエナガ（ダルマエナガ）', 'カラフルなインコ', 'ふっくらスズメ', '赤ちゃんペンギン', '赤ちゃんアヒル', 'よちよちカモメ', 'まんまるハト', '大きな目のフクロウ', '華やかなフラミンゴ', 'ひよこ', '優雅な白鳥', 'いたずらカラス', 'オオハシ（トゥーカン）', '赤ちゃんダチョウ', '青い鳥', '子ガモ'],
  '🐟 魚介・海洋生物': ['もちもちタコ', 'かわいいイカ・コウイカ', 'まんまる金魚', '青い海のクジラ', '赤ちゃんサメ', '泳ぐイルカ', '透明なクラゲ', '横歩きのカニ', '笑顔のウミガメ', '真珠を抱いた貝・ホタテ', 'トゲトゲのウニ', 'ぷくぷくフグ', 'かわいいカワウソ', '赤ちゃんアザラシ', 'タテゴトアザラシの赤ちゃん', '神秘的なタツノオトシゴ', 'まんまるエイ', '赤ちゃんロブスター'],
  '🐞 昆虫・虫': ['羽ばたく蝶々', '幸運のてんとう虫', '働き者のミツバチ', '凛々しいカブトムシ', '立派なアゴのクワガタ', '緑のトンボ', 'ピカピカ光るホタル', 'もぞもぞ青虫・毛虫', 'せっせと働くアリ', 'カマキリ', '鳴くコオロギ', 'ころころカタツムリ', 'カラフルなコガネムシ', '森の小虫の妖精'],
  '🦎 爬虫類・両生類': ['ピンクのウーパールーパー', 'まんまるアマガエル', '目がクリッとしたヤモリ', '色が変わるカメレオン', '子ガメ', 'ぷにぷにサンショウウオ', 'かわいい子ワニ', 'にっこりヘビ', '赤ちゃんイグアナ'],
  '🦖 恐竜・古生物': ['赤ちゃんティラノサウルス', 'おっとりブラキオサウルス', 'かわいいトリケラトプス', '空飛ぶプテラノドン', 'ステゴサウルス', 'もふもふマンモス', 'ヴェロキラプトル', 'アンキロサウルス'],
  '🧸 ぬいぐるみ・文具': ['ヴィンテージテディベア', '愛着のうさぎぬいぐるみ', 'ポストイットの妖精', '手帳デコシール', 'ぷにぷにゼリーキーホルダー', '鉛筆削り坊や', 'カラフルクレヨンボット', 'ミニスノードーム', 'ふかふかクッション人形'],
  '👦 人物': ['ボブヘアの少女', 'メガネの優等生', 'ツーブロックの男子', 'パーマ頭のおばちゃん', 'ヒゲのおじさん', 'ポニーテールの体育会系', 'ツインテールの少女', 'ビーニーのヒップスター', 'スーツの紳士', '韓服を着た子供', 'スーツのキャリアウーマン', '優しい白髪のおばあちゃん', '杖をついたおじいちゃん', 'かわいい幼稚園児・子供', '優しい先生・教員', '幸せな新郎・新婦', '仲良し新婚夫婦', 'サングラスのラッパー', 'エプロンのバリスタ', '丸刈りの軍人', 'ヘッドホンのプロゲーマー', 'マッチョなジム男子', 'カメラを持ったバックパッカー', '白衣の医師', '制服の警察官', 'ギターを弾くロックスター', 'スケボー少年', '華やかなK-POPアイドル', '気さくな近所のおじさん', 'ヨガインストラクター', 'ヘルメットの建築家', 'パリの画家', 'スピードライダー', '花屋の店長', 'バッグを背負った就活生', '疲れた会社員', 'エプロンのパン職人', '作業着の整備士', '伝統衣装の学者', 'カウボーイハットの牧童', '眼帯の海賊船長', '華やかなマジシャン', 'チュチュを着たダンサー', 'ジャージ姿のニート', '白衣の研究者', 'デニムに白Tの爽やか男子', '優雅なお姫様', '甲冑を着た騎士', '熱血テコンドー師範', '制服のスチュワーデス', 'カメラマン', '登山服の登山家', 'マイクを持つアナウンサー', '法服の裁判官', '防火服の消防士', 'コック帽のシェフ', 'キャップ帽のバイト', '麦わら帽子の農夫', '花冠の森の少女', '制服でトッポッキを食べる学生', '波乗りサーファー', 'カーラーを巻いた就活生', '新入社員', '魂が抜けた会社員', '初心者ドライバー', '筋トレ・フィットネスマニア'],
  '🦄 ファンタジー/モノ': ['ユニコーン', '赤ちゃんドラゴン', '小さな魔法使い', '森の妖精', 'もちもちお餅', '甘いマカロン', 'イチゴケーキ', 'ぷくぷく餃子', '小さな吸血鬼', '海の人魚姫', '勇敢な見習い騎士', '宇宙人', '九尾の狐', 'かわいい小鬼', '輝く天使', 'いたずら小悪魔', '空飛ぶ魔法の絨毯', '綿菓子雲', '神秘的な人魚', '翼のあるペガサス', 'おしゃべりカボチャ', '宇宙飛行士', '魔法のほうき', 'ゼリーモンスター', '雪だるまの妖精'],
  '🤖 ロボット/SF': ['赤ちゃんロボット', 'サイバーにゃんこ', 'ぷにぷにスライム', '宇宙ハムスター', '赤ちゃん恐竜', 'ピクセルロボ', '小さなエイリアン', 'メカわんこ', 'ネオンおばけ', '宇宙飛行わんこ', 'サイバーパンクうさぎ', 'ホログラムゴースト', 'UFOパイロット', 'レトロモニターロボ', 'ミニゲーム機キャラ', 'バッテリー充電ロボ', 'AIアンドロイド', '変形メカロボット'],
  '🍞 デザート/フード': ['おしゃべりたい焼き', '食パンおじさん', 'マカロンうさぎ', 'アイスコーヒーおばけ', 'ぷくぷく餃子坊や', 'いちご大福', 'チョコチップクッキー', 'チーズハットグ', 'ぷるぷるプリン', 'タンフルー妖精', 'もちもちトッポッキ', 'おにぎり坊や', 'とろ〜りピザ', 'サクサクポテト', '目玉焼きちゃん', 'ほかほかラーメン', 'ソフトクリーム', 'たこ焼きくん', 'カップケーキ', 'タコさんウインナー'],
  '🌿 植物/自然': ['赤ちゃんサボテン', '四つ葉のクローバー妖精', 'ころころキノコ', '植木鉢の赤ちゃん', 'ひまわりちゃん', '新芽の妖精', 'もみじちゃん', 'プチトマト', 'アボカドちゃん', 'もも妖精', '激辛とうがらしちゃん', 'たんぽぽの綿毛', 'ふわふわコットン', 'レモン坊や', '泣き虫たまねぎ', 'ころころどんぐり', '赤りんご妖精', '秋のくり坊'],
  '👀 外見/特徴': ['丸顔', '大きくてキラキラした目', 'ぷっくりした頬', '短くて太い手足', '小さくて丸い鼻', 'ほんのり赤らんだ頬', 'もふもふの毛並み', 'ぷにぷにゼリー体型', '長くてぴんと立った耳', '小さな八重歯', 'そばかす', '片目を隠す前髪', '丸メガネ', 'ふさふさのしっぽ', '小さな羽', '星形の瞳', 'ハート型の頬模様', 'ミニSD体型'],
  '✨ 性格/感情': ['いたずら好き', 'ツンデレ・クール', 'おっとり優しい', 'いつもお疲れモード', '愛嬌たっぷり', '怒りっぽい', 'のんびり屋', '泣き虫', '活発・元気', '人見知り・内気', '天然・マイペース', '思いやりがある', 'いつも腹ペコ', '好奇心旺盛', '何事にも真面目', '見栄っ張り', '恋してる', '自信満々', 'おっちょこちょい', 'ぐうたら・ゴロゴロ', '情熱的・やる気満々', '怖がり・ビビリ', 'おすまし・気取り屋', 'やる気ゼロ', 'お金大好き'],
  '🖌️ 画風': ['かわいい2Dアニメ風', '韓国ウェブトゥーン風', '手描き落書き風', 'やわらか水彩画風', '色鉛筆絵本風', 'レトロアニメ風', 'すっきりミニマルベクター', 'ポップアート風', '太線のコミック風', 'ドット絵ピクセルアート', 'ペーパーコラージュ風', 'ヴィンテージ印刷風', 'モノクロ漫画トーン', '熱血バトル漫画風', 'きらきら少女漫画風', '80-90年代レトロアニメ風', '3Dセミリアルアニメレンダリング', '日本の出版マンガ風（Gペン・スクリーントーン）', '3Dフェルト・粘土クレイ人形風', 'クレヨン落書きパステル風', 'Y2Kレトロキラキラピクセル風', 'B級ギャグ・シュール落書き風', 'クレヨン・オイルパステル絵本風', '東洋画・水墨画風'],
  '👕 衣装': ['白衣', 'コックエプロン', 'ビジネススーツ', 'オーバーサイズパーカー', 'オーバーオール', '制服', 'ジャージ', 'レインコート', 'もこもこパジャマ', '魔法使いのマント', '華やかなドレス', 'スポーティなキャップ', 'ダウンジャケット', 'レザージャケット', 'シャツとネクタイ', '花柄ワンピース', 'ストリート系ファッション', '伝統武術の道着', 'あったかニットセーター', '動物の着ぐるみパジャマ', '宇宙服', '探検家のベストと帽子', '水着と浮き輪', 'トレンチコート', '妖精の羽', '王冠とマント', 'デニムと白T', '名探偵のコートと帽子'],
  '🎒 小道具/動作': ['スマホを持つ', 'コーヒーカップを持つ', 'サングラスをかける', 'ヘッドホンをつける', 'ノートパソコンを操作する', '本を読む', '風船を持つ', '花束を抱える', 'マイクで歌う', 'ゲームコントローラーを握る', 'フライパンを持つ', '大きな虫眼鏡を持つ', 'スケッチブックに絵を描く', '魔法の杖を振る', '買い物かごを持つ', '傘を差す', 'ポップコーンを食べる', '掃除機をかける', '望遠鏡を覗く', 'ヨガマットでストレッチする', 'スマートウォッチを見る', '札束を握っている', 'アイスコーヒーのタンブラーを持つ', 'ノートパソコンをカタカタ打つ', 'フライドチキンをかじる', 'ビール・お酒のグラスで乾杯', '点滴を打ってぐったり'],
  '🌏 世界の文化・伝統': ['伝統的な韓服（ハンボク）', 'モダンなヒップホップ韓服', 'K-POPアイドルステージ衣装', 'テコンドー黒帯道着', '伝統的な着物・浴衣', '秋葉原メイドコスプレ', '侍（サムライ）・忍者装束', '日本のセーラー服・学生服', '神社巫女（みこ）装束', '武侠・仙侠のシルク道袍', '華やかなチャイナドレス・漢服', 'カンフー武術家（黄色の道着）', '京劇の仮面役者', '西部劇カウボーイ・保安官', 'ロンドン紳士トレンチコート', 'サイバーパンクネオンストリート', '中世ヨーロッパ騎士の甲冑', 'パリジャンのベレー帽とバゲット', 'イギリス王室近衛兵（毛皮帽子）', 'スペイン情熱のフラメンコダンサー', 'ドイツのオクトーバーフェスト衣装', 'ベネチア仮面舞踏会衣装', 'メキシカンマリアッチ＆ソンブレロ', '死者の日シュガースカル仮装', 'ブラジルサンバカーニバルダンサー', 'ベトナムアオザイ＆ノンラー笠', 'タイ伝統サバイ衣装', 'インド伝統サリー＆ボリウッド', 'アラビアンナイトのターバン＆魔法のランプ', 'ハワイアンアロハシャツ＆ウクレレ'],
  '🎬 映画・アニメ': ['魔法学校の制服と魔法の杖', '黒スーツとサングラスの秘密諜報員', 'ネオン光剣を持つ宇宙騎士', '星のステッキを持つ変身魔法少女', '革帽子とムチを持つ考古学者探検家', '三角帽子の海賊船长', '赤いマントのスーパーヒーロー', '漆黒のダークヒーロー', '革ジャンとサングラスのバイカー', '飛行士の帽子とゴーグル', '森の巨大な葉っぱの精霊', 'トレンチコートと虫眼鏡の名探偵', '宇宙ヘルメットをかぶった宇宙飛行士', 'ポンチョを着た西部劇のガンマン', '半面の白い仮面をつけた貴族', 'ドラゴン使いのバイキング戦士', 'タイムトラベラー', 'ゾンビアポカリプスの生存者'],
  '💼 会社員・オフィス': ['定時退社10秒前に時計を見る', '残業で目の下のクマがやばい', '給料日に通帳を見て感動の涙', '会議中に魂が抜けて放心状態', '退職届を胸に忍ばせる', 'コーヒー3杯一気飲み', 'モニターの陰に隠れる', '決裁書類を持って顔色を伺う', '満員電車に押しつぶされる', 'ランチメニュー選びで幸せ', '金曜の退勤で足取りが軽い', '月曜病でベッドと一体化'],
  '🎮 ゲーム・eスポーツ': ['RGBゲーミングヘッドセット装着', 'キーボード台パンでブチギレ', 'ランク昇格で紙吹雪クラッカー', 'トロール味方に頭を抱える', 'エナジードリンクで徹夜ゲーム', 'VRゴーグルで虚空を振り回す', 'コントローラー握り超集中', '1位ドン勝ビクトリーセレモニー', 'Wi-Fi切断で絶望する', 'ボス討伐レイドパーティ募集', 'ガチャ大当たりで大歓喜', 'ガチャ爆死で床に崩れ落ちる'],
  '💘 恋愛・カップル': ['ペアルックでお揃いコーデ', '手を繋いでイチャイチャ散歩', 'すねてほっぺを膨らませ背を向ける', '会いたくてビデオ通話スクショ', 'ハートクッションをぎゅっと抱きしめる', '花束の後ろに顔を隠す', '記念日ケーキのロウソクを吹き消す', '肩にもたれかかってぐっすり眠る', '指ハート発射で甘える', '返信を待ちながらスマホをぼんやり見つめる', '映画館でポップコーンを取り合い手が触れる', '雨の日に傘を傾けて入れてあげる'],
  '💪 フィットネス・筋トレ': ['プロテインシェイカーをシャカシャカ振る', '重いダンベルを力強く持ち上げる', '体組成計の体脂肪率を見て大ショック', 'サラダを食べながらチキンを妄想', 'ランニングマシンで汗だく', '体重計に乗って絶望の涙', 'ジムの鏡で筋トレ自撮りパシャリ', 'スクワットで足がプルプル震える', 'フォームローラーの上で悲鳴', '水2リットルを一気飲み', '筋肉のパンプアップを見て満足気', 'チートデイにピザとバーガーを爆食い'],
  '🌈 エフェクト/背景': ['キラキラ光るエフェクト', 'ハートが飛び交う', '星が降る', 'ネオンサインが瞬く', '漫画的な集中線', '桜吹雪が舞う', '燃え上がる炎エフェクト', '汗が飛び散る', '憂鬱な暗雲', '虹色のオーラ', 'ドカンと爆発', '不気味な影', 'スポットライト照明', '吹雪が吹き荒れる', '雷が鳴り響く', 'ぷくぷく泡', '温かい日差し', '音符が漂う', '風に舞う', 'ふわふわ浮かぶはてな（？）', 'キラリと光るびっくりマーク（！）', 'ブルブル震える効果線', 'ショックの暗雲', '目がハート（キラキラ）'],
};

const CHARACTER_TAGS_ZH = {
  '🐱 动物': ['柴犬', '橘猫', '博美犬', '圆滚滚小兔', '淘气小猴', '仓鼠', '松鼠', '小熊', '耳廓狐', '短尾矮袋鼠', '大熊猫', '刺猬', '羊驼', '小猪', '树懒', '小象', '柯基', '水豚', '浣熊', '小狮子', '脾气火爆马尔济斯', '圆滚滚比熊犬', '金毛寻回犬', '三花猫', '奶牛猫（燕尾服猫）', '小熊猫', '白色小羊', '小鹿', '小老虎', '袋鼠'],
  '🐦 鸟类': ['银喉长尾山雀（肥啾）', '五彩鹦鹉', '胖乎乎麻雀', '小企鹅', '小鸭子', '摇摇晃晃海鸥', '圆滚滚鸽子', '大眼睛猫头鹰', '华丽火烈鸟', '小鸡', '优雅白天鹅', '淘气乌鸦', '大嘴巨嘴鸟', '小鸵鸟', '青鸟', '小大雁'],
  '🐟 水产・海洋生物': ['软软章鱼', '可爱小鱿鱼/乌贼', '圆滚滚金鱼', '蓝色大海鲸鱼', '鲨鱼宝宝', '游泳的海豚', '透明水母', '横着走的小螃蟹', '微笑海龟', '带珍珠的贝壳/扇贝', '刺头海胆', '圆滚滚河豚', '可爱水獭', '小海豹', '海豹宝宝', '神秘海马', '圆圆魔鬼鱼', '小龙虾'],
  '🐞 昆虫・小虫': ['翩翩起舞的蝴蝶', '幸运七星瓢虫', '勤劳蜜蜂', '帅气独角仙', '大颚锹形虫', '绿色蜻蜓', '闪闪萤火虫', '蠕动小毛毛虫', '嘿呦嘿呦小蚂蚁', '叶片上的螳螂', '唱歌的蟋蟀', '圆滚滚蜗牛', '五彩金龟子', '草丛小虫精灵'],
  '🦎 爬行・两栖类': ['粉色六角恐龙（美西螈）', '圆滚滚小青蛙', '大眼睛守宫蜥蜴', '变色龙', '小海龟', '软糯小蝾螈', '可爱小鳄鱼', '微笑小蛇', '小鬣蜥'],
  '🦖 恐龙・古生物': ['霸王龙宝宝', '温顺腕龙', '可爱三角龙', '飞天翼龙', '剑龙宝宝', '毛茸茸小猛犸象', '迅猛龙宝宝', '甲龙宝宝'],
  '🧸 玩偶・文具': ['复古泰迪熊', '依恋小兔玩偶', '便利贴精灵', '手帐装饰贴纸', 'Q弹果冻钥匙扣', '卷笔刀小人', '彩色蜡笔机器人', '迷你水晶雪花球', '软绵绵靠垫玩偶'],
  '👦 人物': ['短发少女', '戴眼镜的学霸', '寸头男生', '卷发大妈', '胡子大叔', '马尾体育生', '双马尾少女', '冷帽潮人', '西装绅士', '穿韩服的小朋友', '职场女强人', '慈祥的白发奶奶', '拄拐杖的爷爷', '小黄帽幼儿园生', '戴墨镜的Rapper', '咖啡馆咖啡师', '寸头士兵', '戴耳机的职业选手', '肌肉健身男', '带单反的背包客', '穿白大褂的医生', '穿制服的警察', '弹吉他的摇滚乐手', '滑板少年', '华丽K-POP爱豆', '热心邻居大叔', '瑜伽教练', '戴安全帽的建筑师', '巴黎画家', '机车骑手', '花店老板', '背书包的求职生', '疲惫打工人', '系围裙的面包师', '工装机修师', '传统学者', '牛仔帽牧童', '戴眼罩的海盗船长', '魔术师', '芭蕾舞者', '运动服无业青年', '穿白大褂的科学家', '白T牛仔裤帅哥', '穿礼服的小公主', '穿铠甲的骑士', '穿道服的跆拳道教练', '穿制服的空姐', '摄影师', '穿冲锋衣的登山客', '拿话筒的主持人', '穿法袍的法官', '穿防护服的消防员', '戴厨师帽的主厨', '戴棒球帽的店员', '草帽农夫', '戴花环的森林少女', '穿校服吃年糕的学生', '拿冲浪板的冲浪者', '戴卷发筒的求职生', '职场新人', '灵魂出窍打工人', '新手司机', '健身肌肉达人'],
  '🦄 幻想/物品': ['独角兽', '小飞龙', '小魔法师', '森林精灵', '软糯麻薯', '甜美马卡龙', '草莓蛋糕', '软萌小糖宝', '小吸血鬼', '美人鱼', '勇敢小骑士', '小外星人', '九尾狐', '可爱小妖怪', '闪耀天使', '淘气小恶魔', '飞天魔毯', '棉花糖云朵', '神秘人鱼', '飞马天马', '会说话的南瓜', '宇航员', '魔法扫帚', '果冻怪', '雪人精灵'],
  '🤖 机器人/科幻': ['小机器人', '赛博猫咪', 'Q弹史莱姆', '太空仓鼠', '小恐龙', '像素机器人', '外星小可爱', '机甲小狗', '霓虹幽灵', '太空宇航狗', '赛博朋克兔', '全息幽灵', 'UFO驾驶员', '复古显示器机器人', '迷你游戏机小怪', '充电机器人', 'AI仿生人', '变形机甲'],
  '🍞 甜品/美食': ['会说话的鲷鱼烧', '吐司大叔', '马卡龙小兔', '冰美式小幽灵', '胖嘟嘟小饺子', '草莓大福', '曲奇饼干', '芝士热狗棒', 'DuangDuang布丁', '糖葫芦仙子', '软糯炒年糕', '三角饭团', '拉丝披萨', '酥脆薯条', '太阳蛋', '热气腾腾拉面', '甜筒冰淇淋', '章鱼小丸子', '纸杯蛋糕', '小香肠'],
  '🌿 植物/自然': ['小仙人掌', '四叶草精灵', '圆滚滚小蘑菇', '盆栽小宝', '小向日葵', '嫩芽仙子', '红枫叶', '圣女果', '牛油果宝', '蜜桃仙子', '火辣小尖椒', '蒲公英绒毛', '蓬松棉花糖', '柠檬小弟', '爱哭洋葱头', '圆圆小橡果', '红苹果小仙子', '秋天板栗头'],
  '👀 外貌/特征': ['圆圆脸', '大而闪亮的眼睛', '肉嘟嘟脸颊', '短粗小手小脚', '小巧圆鼻子', '泛红的脸颊', '蓬松柔软毛发', 'Q弹果冻身材', '直立长耳朵', '可爱小虎牙', '雀斑', '遮单眼的刘海', '圆圆眼镜', '毛茸茸大尾巴', '小翅膀', '星星眼瞳孔', '爱心脸颊纹', '迷你SD身材'],
  '✨ 性格/情绪': ['爱恶作剧', '高冷傲娇', '温顺善良', '日常被掏空', '撒娇精', '暴脾气', '慢吞吞', '爱哭鬼', '元气满满', '害羞内向', '古灵精怪', '温暖贴心', '干饭魂吃货', '好奇宝宝', '超级认真', '爱面子爱吹牛', '陷入爱河', '自信满满', '冒冒失失', '懒洋洋打滚', '满腔热血', '胆小鬼', '爱装清高', '毫无干劲', '守财奴'],
  '🖌️ 画风': ['可爱2D卡通', '韩国条漫网漫风', '手绘涂鸦风', '柔和水彩风', '彩色铅笔绘本风', '复古动漫风', '简约扁平矢量', '活力波普艺术', '粗线条美漫风', '复古像素点阵', '剪纸拼贴风', '复古印刷漫画', '黑白漫画网点', '热血战斗漫画', '闪亮少女漫画', '8090复古动漫', '3D半写实动漫渲染', '日漫黑白G笔网点风', '3D毛毡粘土玩偶风', '蜡笔涂鸦粉彩风', 'Y2K千禧闪亮像素风', 'B级搞笑恶搞漫画风', '蜡笔油画棒童话风', '东方水墨国风'],
  '👕 服饰': ['白大褂', '厨师围裙', '职场西装', '宽松大卫衣', '背带裤', '学生校服', '运动服', '小雨衣', '软绵绵睡衣', '魔法师斗篷', '华丽礼服裙', '运动棒球帽', '厚羽绒服', '皮夹克', '衬衫配领带', '碎花连衣裙', '潮酷街头风', '武道服', '暖和针织毛衣', '动物连体睡衣', '宇航服', '探险家马甲帽子', '泳衣配泳圈', '经典风衣', '闪亮仙女翅膀', '皇冠配斗篷', '白T配牛仔裤', '名侦探大衣帽子'],
  '🎒 道具/动作': ['拿手机', '端咖啡杯', '戴墨镜', '戴头戴式耳机', '操作笔记本电脑', '看书', '拿气球', '抱花束', '握麦克风唱歌', '握游戏手柄', '拿平底锅', '拿大放大镜', '在画本上画画', '挥动魔法棒', '提菜篮子', '撑伞', '吃爆米花', '吸尘器打扫', '拿望远镜看', '在瑜伽垫上拉伸', '看智能手表', '拿一沓钞票', '拿冰美式随行杯', '敲笔记本键盘', '啃炸鸡腿', '碰啤酒杯干杯', '打点滴精疲力尽'],
  '🌏 全球・传统文化': ['传统宫廷韩服', '潮流改良韩服配笠帽', 'K-POP舞台打歌服', '跆拳道黑带道服', '传统和服/浴衣', '秋叶原女仆装', '武士/忍者装束', '日系水手服学生装', '神社巫女服', '仙侠古风道袍', '华丽传统旗袍/汉服', '李小龙黄色功夫服', '京剧脸谱戏服', '狂野西部牛仔警长', '伦敦绅士风衣配礼帽', '赛博朋克霓虹街头装', '中世纪欧洲骑士铠甲', '法式贝雷帽配法棍', '英国皇家卫队熊皮帽', '西班牙弗拉门戈红裙', '德国啤酒节皮裤背带装', '威尼斯假面舞会华服', '墨西哥大草帽乐手服', '亡灵节糖骷髅装扮', '巴西桑巴狂欢舞裙', '越南奥黛配斗笠', '泰国传统纱丽丝绸服', '印度宝莱坞纱丽珠宝装', '一千零一夜头巾神灯装', '夏威夷风情衬衫配尤克里里'],
  '🎬 影视・动漫': ['魔法学院校服配魔杖', '黑西装墨镜特工', '霓虹光剑太空骑士', '手握星光棒变身魔法少女', '皮帽皮鞭考古探险家', '三角帽海盗船长', '飘逸红披风超级英雄', '冷酷暗夜黑武士', '皮夹克墨镜机车骑士', '吉卜力风飞行帽护目镜', '森林巨叶龙猫精灵', '风衣放大镜经典名侦探', '宇航头盔星际领航员', '披风西部荒野枪手', '半张白色面具魅影', '驾驭飞龙维京勇士', '复古护目镜时间旅行者', '末日丧尸求生者'],
  '💼 职场・办公': ['下班倒计时10秒看表', '熬夜加班黑眼圈', '发薪日看账单感动落泪', '会议室灵魂出窍发呆', '口袋揣着辞职信', '连灌3杯咖啡续命', '躲在电脑显示器后', '拿着审批单看老板眼色', '早高峰挤爆地铁', '挑选午餐菜单超幸福', '周五下班步伐轻快', '周一综合征粘在床上'],
  '🎮 游戏・电竞': ['戴RGB电竞耳机', '狂砸键盘暴怒', '段位升级放彩花', '看坑货队友捂后颈', '喝能量饮料通宵', '戴VR眼镜隔空比划', '握手柄超专注眼神', '吃鸡第一名胜利狂欢', '断网绝望抓狂', '招募打Boss车队', '抽卡爆金光大狂欢', '抽卡沉船趴地大哭'],
  '💘 恋爱・情侣': ['穿情侣装CP穿搭', '牵手甜蜜散步', '生气鼓脸背过身', '想你视频通话截屏', '紧抱爱心抱枕', '躲在花束后偷看', '吹灭纪念日蛋糕蜡烛', '靠在肩膀甜甜熟睡', '发射手指爱心撒娇', '盯着手机等回复', '电影院抓爆米花碰到手', '下雨天伞歪向对方'],
  '💪 健身・减肥': ['用力摇蛋白粉摇摇杯', '举起重哑铃展示力量', '看体脂率报告大震惊', '嚼着沙拉幻想炸鸡', '跑步机上挥汗如雨', '站上体重秤绝望落泪', '对镜拍打卡照OOTD', '深蹲完双腿颤抖', '泡沫轴上痛苦尖叫', '吨吨吨狂喝2L水', '对镜欣赏肌肉充血', '放纵日暴风吸入披萨汉堡'],
  '🌈 背景/特效': ['闪闪发光特效', '爱心四处飞舞', '星光洒落', '霓虹招牌闪烁', '漫画集中动作速度线', '樱花雨漫天飘落', '烈火燃烧特效', '汗珠四溅', '忧郁乌云小雨', '彩虹色光晕', '砰然大爆炸', '暗黑神秘阴影', '聚光灯焦点照明', '暴风雪席卷', '电闪雷鸣', '咕嘟咕嘟小气泡', '温暖柔和阳光', '音符悠扬飘浮', '随风飘舞', '问号飘浮（？）', '闪亮感叹号（！）', '瑟瑟发抖颤抖线', '大受打击黑线乌云', '爱心星星眼（闪烁）'],
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
    randomSource: '🎲 랜덤',
    photoSource: '📷 사진 참고',
    rerollRandom: '다른 캐릭터 다시 뽑기',
    randomBadge: '🎲 랜덤 캐릭터 모드',
    directBadge: '✏️ 직접 캐릭터 설정',
    photoBadge: '📷 사진 참고 모드',
    photoMethod: '사진 반영 방식',
    photoBalanced: '⭐ 균형 추천',
    photoLikeness: '🎯 닮음 우선',
    photoStyle: '🎨 화풍 우선',
    photoAttachGuide: '프롬프트를 복사한 뒤 AI 대화창(ChatGPT, Gemini, Grok)에 참고할 사진도 함께 첨부해 주세요.',
    photoActive: '참고 이미지 사용',
    quotaTitle: (rem, total) => `오늘 무료 복사 잔여 : ${rem}회 / ${total}회`,
    quotaSub: '매일 밤 자정에 3회가 새로 충전됩니다. 로그인 시 평생 무제한 무료!',
    quotaBtn: '3초 로그인하고 무제한 풀기 ›',
    quotaMemberTitle: (name) => `${name}님은 평생 무제한 무료 VIP 회원입니다`,
    quotaMemberSub: '110종 테마, 사진 연동, AI 3종 분할 프롬프트를 무제한 이용 중입니다.',
    loginModalTitle1: '3초 간편 로그인으로',
    loginModalTitle2: '평생 무제한 무료 이용하기',
    loginModalSubQuota: '오늘의 무료 3회를 모두 사용하셨습니다. 로그인 시 110종 테마 & 사진 연동을 무제한으로 이용하실 수 있습니다.',
    loginModalSubGeneral: '로그인 시 110종 테마, 사진 참고 캐리커처, AI 3종 분할 프롬프트를 평생 무제한 무료로 제공합니다.',
    loginGoogleBtn: 'Google 계정으로 1초 시작하기',
    loginModalFooter: '🔒 개인정보는 안전하게 보호되며 추가 비용은 없습니다.',
    copyToastQuota: (n) => `📋 프롬프트 복사 완료! (오늘 무료 잔여: ${n}회)`,
    copyToastQuotaLimit: '🔒 오늘의 무료 체험 3회를 모두 사용하셨습니다. 3초 로그인 시 평생 무제한 무료!',
    previewBlurTitle: '오늘의 무료 체험 3회를 모두 사용하셨습니다',
    previewBlurSub: '3초 간편 로그인 시 110종 테마, 사진 참고 모드, 전체 프롬프트를 평생 무제한 무료로 즉시 확인하실 수 있습니다.',
    previewBlurBtn: '3초 로그인하고 전체 프롬프트 보기',
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
    gptRepairTitle: 'ChatGPT에서 다시 수정하기',
    geminiRepairTitle: 'Gemini에서 다시 수정하기',
    repairHelp: '수정할 이미지를 같은 AI 채팅에 첨부한 뒤, 아래 버튼으로 복사한 수정 요청을 붙여넣으세요. 글자 오류는 완벽한 수정을 보장하지 않습니다.',
    geminiRepairIdentity: '얼굴·캐릭터',
    geminiRepairCrop: '이미지 결함',
    geminiRepairText: '글자 오류',
    geminiWorkflowTip: 'Gemini 팁: 시트 전체는 캐릭터와 구도 초안용으로 사용하고, 최종 이미지는 15종 개별 분할로 한 장씩 만드는 것을 권장합니다.',
    grokTextMode: 'Grok 이미지 글자',
    grokNoText: '글자 없이',
    grokIncludeText: '문구 포함',
    grokBackgroundMode: 'Grok 배경',
    grokTransparent: '투명 배경',
    grokSolid: '단색 배경',
    grokChroma: '크로마키',
    grokWorkflowTip: 'Grok 팁: Grok은 Flux.1 엔진 기반으로 고화질 스티커 렌더링에 우수합니다. 글자 수정이 필요할 경우 [글자 미포함] 모드로 생성해 보세요.',
    grokRepairTitle: 'Grok에서 다시 수정하기',
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
    randomSource: '🎲 Random',
    photoSource: '📷 Use a photo',
    rerollRandom: 'Re-roll Character',
    randomBadge: '🎲 Random Character Mode',
    directBadge: '✏️ Manual Character Setup',
    photoBadge: '📷 Photo Reference Mode',
    photoMethod: 'Photo reference style',
    photoBalanced: '⭐ Balanced',
    photoLikeness: '🎯 Likeness First',
    photoStyle: '🎨 Style First',
    photoAttachGuide: 'After copying the prompt, attach the reference photo in the AI chat (ChatGPT, Gemini, or Grok) as well.',
    photoActive: 'Reference image enabled',
    quotaTitle: (rem, total) => `Free Daily Copies Left: ${rem} / ${total}`,
    quotaSub: 'Resets daily at midnight. Log in for lifetime unlimited free access!',
    quotaBtn: 'Unlock Unlimited Free Access in 3s ›',
    quotaMemberTitle: (name) => `${name} has lifetime unlimited VIP access`,
    quotaMemberSub: 'Unlimited access to all 110 themes, photo mode, and AI prompts.',
    loginModalTitle1: 'Log in in 3 Seconds',
    loginModalTitle2: 'Unlock Lifetime Unlimited Access',
    loginModalSubQuota: 'Daily free quota used up. Log in to get lifetime unlimited access!',
    loginModalSubGeneral: 'Enjoy all 110 themes, photo caricature mode, and 3 AI prompts with lifetime unlimited access.',
    loginGoogleBtn: 'Continue with Google',
    loginModalFooter: '🔒 Your data is safe. 100% free with zero hidden costs.',
    copyToastQuota: (n) => `📋 Prompt copied! (${n} free copies left today)`,
    copyToastQuotaLimit: '🔒 Daily free quota (3/3) used. Log in for unlimited access!',
    previewBlurTitle: 'Daily Free Quota (3/3) Reached',
    previewBlurSub: 'Log in in 3 seconds to instantly view all prompts and enjoy lifetime unlimited free access.',
    previewBlurBtn: 'Log in in 3s to View Full Prompt',
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
    gptRepairTitle: 'Edit Again in ChatGPT',
    geminiRepairTitle: 'Edit Again in Gemini',
    repairHelp: 'Attach the image to the same AI chat, then paste the correction request copied below. Text corrections are not guaranteed to be perfect.',
    geminiRepairIdentity: 'Character',
    geminiRepairCrop: 'Image defects',
    geminiRepairText: 'Text errors',
    geminiWorkflowTip: 'Gemini tip: Use the full sheet as a character and layout draft, then generate final images one at a time with Batch Split.',
    grokTextMode: 'Grok image text',
    grokNoText: 'No text',
    grokIncludeText: 'Include text',
    grokBackgroundMode: 'Grok background',
    grokTransparent: 'Transparent',
    grokSolid: 'Solid color',
    grokChroma: 'Chroma key',
    grokWorkflowTip: 'Grok tip: Grok powered by Flux.1 excels at sticker renders. If text stutters, switch to [Text-Free] mode and overlay text later.',
    grokRepairTitle: 'Edit Again in Grok',
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
    randomSource: '🎲 ランダム',
    photoSource: '📷 写真から作成',
    rerollRandom: '別のキャラを再抽選',
    randomBadge: '🎲 ランダムキャラモード',
    directBadge: '✏️ 直接キャラクター設定',
    photoBadge: '📷 写真参照モード',
    photoMethod: '写真参照スタイル',
    photoBalanced: '⭐ バランス推奨',
    photoLikeness: '🎯 似顔絵優先',
    photoStyle: '🎨 画風優先',
    photoAttachGuide: 'プロンプトコピー後、AIチャットにも写真を添付してください。',
    photoActive: '参照画像有効中',
    quotaTitle: (rem, total) => `本日無料コピー残り : ${rem}回 / ${total}回`,
    quotaSub: '毎晩0時に3回再チャージ。ログインで一生無制限無料！',
    quotaBtn: '3秒で無制限無料を解除 ›',
    quotaMemberTitle: (name) => `${name}様は一生無制限無料のVIP会員です`,
    quotaMemberSub: '110種のテーマ、写真連動、3種AIプロンプトを無制限利用中。',
    loginModalTitle1: '3秒簡単ログインで',
    loginModalTitle2: '一生無制限で無料利用',
    loginModalSubQuota: '本日の無料3回をすべて使用しました。ログインで110種のテーマと写真連動を無制限利用できます。',
    loginModalSubGeneral: 'ログインで110種のテーマ、写真参考似顔絵、3大AIプロンプトが一生無制限無料で使い放題。',
    loginGoogleBtn: 'Googleアカウントで1秒スタート',
    loginModalFooter: '🔒 個人情報は安全に保護され、追加費用は一切かかりません。',
    copyToastQuota: (n) => `📋 プロンプトをコピーしました！（本日無料残り: ${n}回）`,
    copyToastQuotaLimit: '🔒 本日の無料3回をすべて使用しました。ログインで無制限無料！',
    previewBlurTitle: '本日の無料体験（3回）が終了しました',
    previewBlurSub: '3秒ログインで110種のテーマ・写真モード・全プロンプトを一生無制限無料で見られます。',
    previewBlurBtn: '3秒ログインして全プロンプトを見る',
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
    gptRepairTitle: 'ChatGPTで再修正',
    geminiRepairTitle: 'Geminiで再修正',
    repairHelp: '修正する画像を同じAIチャットに添付し、下のボタンでコピーした修正依頼を貼り付けてください。文字修正は完全性を保証できません。',
    geminiRepairIdentity: '顔・キャラ',
    geminiRepairCrop: '画像の不具合',
    geminiRepairText: '文字の誤り',
    geminiWorkflowTip: 'Geminiヒント: シート全体は構図の試作として使い、最終画像は15종個別分割で1枚ずつ生成することをおすすめします。',
    grokTextMode: 'Grok画像文字',
    grokNoText: '文字なし',
    grokIncludeText: '文字あり',
    grokBackgroundMode: 'Grok背景',
    grokTransparent: '透過背景',
    grokSolid: '単色背景',
    grokChroma: 'クロマキー',
    grokWorkflowTip: 'Grokヒント: GrokはFlux.1エンジンを搭載し、自然なテキストとステッカーの質感を正確に表現します。',
    grokRepairTitle: 'Grokで再修正',
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
    randomSource: '🎲 随机',
    photoSource: '📷 上传照片',
    rerollRandom: '重新随机抽取角色',
    randomBadge: '🎲 随机角色模式',
    directBadge: '✏️ 手动角色描述',
    photoBadge: '📷 照片参考模式',
    photoMethod: '照片参考风格',
    photoBalanced: '⭐ 推荐平衡',
    photoLikeness: '🎯 还原优先',
    photoStyle: '🎨 风格优先',
    photoAttachGuide: '复制提示词后，请在AI聊天框中同时发送参考照片。',
    photoActive: '参考图片已启用',
    quotaTitle: (rem, total) => `今日免费复制剩余 : ${rem}次 / ${total}次`,
    quotaSub: '每晚午夜重新充值3次。登录即可终身无限免费！',
    quotaBtn: '3秒登录解锁无限免费 ›',
    quotaMemberTitle: (name) => `${name}是终身无限免费VIP会员`,
    quotaMemberSub: '畅享110种主题、照片参考与3大AI提示词无限制。',
    loginModalTitle1: '3秒快速登录',
    loginModalTitle2: '终身无限免费使用',
    loginModalSubQuota: '今天的3次免费额度已用完。登录即可畅享110种主题与照片参考无限制。',
    loginModalSubGeneral: '登录即可终身无限免费畅享110种主题、照片参考转2D与3大AI专属提示词。',
    loginGoogleBtn: '通过 Google 账号一键开始',
    loginModalFooter: '🔒 个人信息受到安全保护，无任何附加费用。',
    copyToastQuota: (n) => `📋 提示词已复制！（今日免费剩余：${n}次）`,
    copyToastQuotaLimit: '🔒 今天的3次免费额度已用完。登录即可终身无限免费！',
    previewBlurTitle: '今天的3次免费体验额度已用完',
    previewBlurSub: '3秒简单登录即可终身无限免费查看全部提示词与110种主题。',
    previewBlurBtn: '3秒登录查看完整提示词',
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
    gptRepairTitle: '在ChatGPT中再次修改',
    geminiRepairTitle: '在Gemini中再次修改',
    repairHelp: '请将待修改图片上传到同一个AI对话，再粘贴下方按钮复制的修改要求。文字修正无法保证完全准确。',
    geminiRepairIdentity: '面部与角色',
    geminiRepairCrop: '图像缺陷',
    geminiRepairText: '文字错误',
    geminiWorkflowTip: 'Gemini提示：建议将整页作为构图草稿，最终成品使用单张拆分模式逐一生成。',
    grokTextMode: 'Grok文字模式',
    grokNoText: '纯图无字',
    grokIncludeText: '包含文字',
    grokBackgroundMode: 'Grok背景',
    grokTransparent: '透明背景',
    grokSolid: '单色背景',
    grokChroma: '抠图绿幕',
    grokWorkflowTip: 'Grok提示：Grok基于Flux.1引擎，擅长精准的自然语言指令与矢量贴纸质感。',
    grokRepairTitle: '在Grok中再次修改',
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


// ==========================================
// 독립 페이지 및 메인 하단 고품질 정보 섹션 컴포넌트
// ==========================================

const PrivacyPage = ({ lang, onBack }) => {
  return (
    <div className="min-h-screen bg-[#FFFDF8] text-slate-800 pb-16 font-sans">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E0D8] px-4 py-3 sm:px-6 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="interactive-control flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#FFF8E7] hover:bg-[#FFECA1] text-[#7A4F00] font-bold text-[13.5px] border border-[#FFECA1] transition-all cursor-pointer"
          >
            ← {lang === 'ko' ? '메인으로 돌아가기' : lang === 'ja' ? 'メインに戻る' : lang === 'zh' ? '返回主页' : 'Back to Home'}
          </button>
          <span className="text-[14px] font-black text-slate-800 tracking-tight">
            프롬프트 메이커 (Prompt Maker)
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="bg-white rounded-xl p-6 sm:p-10 border border-slate-200/90 shadow-sm flex flex-col gap-6">
          <div className="border-b border-slate-200 pb-5">
            <h1 className="text-[24px] sm:text-[28px] font-black text-slate-900 tracking-tight">
              {lang === 'ko' ? '개인정보처리방침' : lang === 'ja' ? 'プライバシーポリシー' : lang === 'zh' ? '隐私政策' : 'Privacy Policy'}
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              최종 수정일: 2025년 1월 1일 | 시행일자: 2025년 1월 1일
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-[14px] sm:text-[15px] leading-relaxed text-slate-700 space-y-6">
            <section>
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">1. 총칙</h2>
              <p>
                '프롬프트 메이커'(이하 '서비스')는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 및 글로벌 개인정보 보호 규정을 준수하고 있습니다. 본 방침은 이용자가 서비스를 이용할 때 어떠한 정보가 이용되며 개인정보 보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">2. 수집하는 개인정보의 항목 및 수집 방법</h2>
              <p>서비스는 회원가입 없이 누구나 무료로 이용할 수 있는 공개 웹 유틸리티 도구로서, 이름, 전화번호, 주민등록번호 등의 민감한 개인식별정보를 직접 수집하거나 서버에 저장하지 않습니다.</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>자동 수집 로그 정보:</strong> 서비스 이용 과정에서 접속 IP, 브라우저 종류, OS, 방문 일시, 서비스 이용 통계 등의 비식별 로그 정보가 자동 생성되어 수집될 수 있습니다.</li>
                <li><strong>로컬 브라우징 설정:</strong> 사용자가 선택한 다국어(한국어, 영어, 일본어, 중국어) 설정 및 모드 옵션은 사용자의 웹 브라우저 로컬 저장소(LocalStorage)에만 저장되며 서버로 전송되지 않습니다.</li>
                <li><strong>사용자 입력 프롬프트 및 사진:</strong> 사용자가 입력하는 텍스트나 첨부하는 사진 파일은 브라우저 메모리 상에서만 일시적으로 조합되며 서비스 서버에 저장되지 않습니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">3. 구글 애드센스(Google AdSense) 및 제3자 쿠키(Cookie) 운영</h2>
              <p>
                서비스는 사이트 운영 및 무료 서비스 품질 유지를 위해 제3자 광고 사업자인 **Google Inc.(구글 애드센스)**의 광고 서비스를 이용하고 있습니다.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Google을 포함한 제3자 공급업체는 쿠키(Cookie)를 사용하여 이용자가 본 서비스 또는 다른 웹사이트를 과거에 방문한 기록을 바탕으로 광고를 게재합니다.</li>
                <li>Google의 광고 쿠키 사용으로 인해 Google 및 파트너 네트워크는 이용자가 사이트를 방문한 정보를 기반으로 맞춤형 광고를 제공할 수 있습니다.</li>
                <li><strong>쿠키 설정 거부 및 맞춤 광고 해제:</strong> 이용자는 언제든지 맞춤형 광고 설정을 해제할 수 있습니다. <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline font-bold">Google 광고 설정 페이지</a>에 방문하거나, <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline font-bold">www.aboutads.info</a>를 통해 제3자 공급업체의 맞춤형 광고 쿠키 사용을 차단할 수 있습니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">4. 개인정보의 보유 및 파기</h2>
              <p>
                서비스는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 웹로그 분석 도구를 통해 수집된 비식별 통계 데이터는 데이터 관리 규정에 따라 안전하게 관리된 후 자동 삭제됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">5. 개인정보 보호책임자 및 문의처</h2>
              <p>서비스의 개인정보 관리, 오류 제보 및 문의 사항은 아래의 온라인 문의 창구를 통해 접수해 주시면 신속하게 검토하여 처리해 드립니다.</p>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[14px] text-slate-700">
                    • <strong>서비스명:</strong> 프롬프트 메이커 (Prompt Maker)<br />
                    • <strong>접수 창구:</strong> 1:1 온라인 고객 피드백 & 문의 폼
                  </p>
                </div>
                <a
                  href="https://forms.gle/Q2oG84fL4B9g2Jda7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="interactive-control inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[13px] rounded-lg shadow-xs transition-all shrink-0 cursor-pointer"
                >
                  <span>📝 구글 폼 문의 접수</span>
                  <span>↗</span>
                </a>
              </div>
            </section>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-center">
            <button
              onClick={onBack}
              className="interactive-control px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[14px] shadow-sm transition-all cursor-pointer"
            >
              {lang === 'ko' ? '확인 및 메인으로 이동' : 'Confirm and Back to Main'}
            </button>
          </div>
        </div>
      </main>

    </div>
  );
};

const TermsPage = ({ lang, onBack }) => {
  return (
    <div className="min-h-screen bg-[#FFFDF8] text-slate-800 pb-16 font-sans">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E0D8] px-4 py-3 sm:px-6 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="interactive-control flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#FFF8E7] hover:bg-[#FFECA1] text-[#7A4F00] font-bold text-[13.5px] border border-[#FFECA1] transition-all cursor-pointer"
          >
            ← {lang === 'ko' ? '메인으로 돌아가기' : lang === 'ja' ? 'メインに戻る' : lang === 'zh' ? '返回主页' : 'Back to Home'}
          </button>
          <span className="text-[14px] font-black text-slate-800 tracking-tight">
            프롬프트 메이커 (Prompt Maker)
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="bg-white rounded-xl p-6 sm:p-10 border border-slate-200/90 shadow-sm flex flex-col gap-6">
          <div className="border-b border-slate-200 pb-5">
            <h1 className="text-[24px] sm:text-[28px] font-black text-slate-900 tracking-tight">
              {lang === 'ko' ? '서비스 이용약관' : lang === 'ja' ? '利用規約' : lang === 'zh' ? '服务条款' : 'Terms of Service'}
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              최종 수정일: 2025년 1월 1일 | 시행일자: 2025년 1월 1일
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-[14px] sm:text-[15px] leading-relaxed text-slate-700 space-y-6">
            <section>
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">제1조 (목적)</h2>
              <p>
                본 약관은 '프롬프트 메이커'(이하 '서비스')가 제공하는 AI 이모티콘 프롬프트 자동 생성 및 관련 웹 도구 서비스의 이용조건 및 절차, 이용자와 서비스 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">제2조 (서비스의 내용 및 특징)</h2>
              <p>서비스가 제공하는 주요 기능은 다음과 같습니다.</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>ChatGPT(DALL-E 3), Google Gemini(Imagen 3), Grok 등의 생성형 AI 모델에 최적화된 15종 이모티콘 시트 생성 프롬프트 자동 완성 및 원클릭 복사.</li>
                <li>피사체(동물, 조류, 해양생물, 곤충, 파충류, 공룡, 인물 등) 및 화풍, 15종 대화 문구 세트의 조합 도구 제공.</li>
                <li>이모티콘 기획 가이드, 실전 제작 팁 및 플랫폼 제안 관련 정보 콘텐츠 제공.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">제3조 (저작권 및 상업적 이용 면책)</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>프롬프트의 자유 이용:</strong> 본 서비스에서 생성된 프롬프트 텍스트는 이용자가 자유롭게 복사하여 비상업적 또는 상업적 목적으로 활용할 수 있습니다.</li>
                <li><strong>AI 생성 이미지의 권리:</strong> 이용자가 본 프롬프트를 통해 생성한 최종 이미지의 저작권 및 상업적 권리는 이용자가 사용하는 대상 AI 플랫폼(OpenAI, Google, xAI 등)의 이용약관 및 정책을 따릅니다.</li>
                <li><strong>플랫폼 등록 심사:</strong> 카카오 이모티콘 스튜디오, 라인 크리에이터스 마켓 등 외부 플랫폼의 등록 승인 여부는 각 플랫폼의 심사 기준에 따르며, 본 서비스는 등록 승인을 보증하지 않습니다.</li>
                <li><strong>공식 제휴 면책:</strong> 본 서비스는 카카오(Kakao), 라인(LINE), OpenAI, Google 등과 공식적으로 제휴된 서비스가 아닌 독립적인 프롬프트 보조 도구입니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">제4조 (문의처)</h2>
              <p>
                서비스 이용 관련 문의 사항, 제휴 제안 및 건의 사항은 <a href="https://forms.gle/Q2oG84fL4B9g2Jda7" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline font-bold">1:1 온라인 문의 폼(Google Forms)</a>을 통해 접수해 주시기 바랍니다.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-center">
            <button
              onClick={onBack}
              className="interactive-control px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[14px] shadow-sm transition-all cursor-pointer"
            >
              {lang === 'ko' ? '확인 및 메인으로 이동' : 'Confirm and Back to Main'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

// 메인 하단 섹션 1: 이모티콘 제작이 처음인가요? (About AI Prompt Maker)
const SectionAbout = ({ lang }) => {
  const data = {
    ko: {
      title: '이모티콘 제작이 처음인가요? AI 프롬프트 메이커란?',
      desc: '그림 실력이 없어도 사진 한 장 또는 태그 몇 개로 15종 이모티콘 시트를 1초 만에 기획합니다.',
      cards: [
        {
          icon: '⚡',
          bg: 'bg-[#FFFDF8] border-[#FFECA1]',
          title: '1초 만에 15종 풀세트 자동 완성',
          desc: '일상, 직장, 커플 등 80개 이상의 대화 테마에 맞춰 15가지 핵심 감정 액션과 글자 색상, 배치 구도를 자동으로 완벽 매핑합니다.'
        },
        {
          icon: '🎭',
          bg: 'bg-[#F8FAFC] border-slate-200',
          title: '일관된 캐릭터 디자인 유지',
          desc: '동일한 캐릭터의 얼굴 특징, 체형 비율(2.5등신 SD), 고유 색상이 15가지 컷 전체에 걸쳐 흔들리지 않도록 정밀 프롬프트 락킹 기술을 적용했습니다.'
        },
        {
          icon: '⚡',
          bg: 'bg-[#F0FDF4] border-emerald-200',
          title: '3대 AI 엔진 맞춤 최적화',
          desc: '한글 타이포에 강한 ChatGPT(DALL-E 3), 역동적 표정에 강한 Gemini(Imagen 3), 위트 있는 연출의 Grok 각각에 최적화된 프롬프트를 즉시 제공합니다.'
        }
      ]
    },
    ja: {
      title: 'スタンプ作りは初めてですか？ AIプロンプトメーカーとは？',
      desc: '絵を描くスキルがなくても、写真1枚やタグ選択だけで15種スタンプシートを1秒で企画できます。',
      cards: [
        {
          icon: '⚡',
          bg: 'bg-[#FFFDF8] border-[#FFECA1]',
          title: '1秒で15種フルセット自動完成',
          desc: '日常、仕事、カップルなど80種以上のテーマに合わせて、15の必須感情や文字色、構図を自動マッピングします。'
        },
        {
          icon: '🎭',
          bg: 'bg-[#F8FAFC] border-slate-200',
          title: '一貫したキャラクターデザイン',
          desc: '15カット全体で顔の特徴、2.5頭身SD比率、固有カラーがブレないプロンプト固定技術を適用しています。'
        },
        {
          icon: '⚡',
          bg: 'bg-[#F0FDF4] border-emerald-200',
          title: '3大AIエンジンに最適化',
          desc: '文字入れが得意なChatGPT、表情豊かなGemini、コミカルなGrokの特性に合わせた専用プロンプトを提供します。'
        }
      ]
    },
    zh: {
      title: '第一次做表情包？ 什么是AI提示词生成器？',
      desc: '即使零绘画基础，仅凭一张照片或几个标签，1秒即可构思15款完整表情包设计方案。',
      cards: [
        {
          icon: '⚡',
          bg: 'bg-[#FFFDF8] border-[#FFECA1]',
          title: '1秒全套自动完成15款',
          desc: '结合80+日常主题，自动匹配15种核心情绪动作、文字配色及排版构图。'
        },
        {
          icon: '🎭',
          bg: 'bg-[#F8FAFC] border-slate-200',
          title: '保持角色设计高度一致',
          desc: '精准锁定面部特征、2.5头身Q版比例与标志性色彩，确保15个镜头角色完全一致。'
        },
        {
          icon: '⚡',
          bg: 'bg-[#F0FDF4] border-emerald-200',
          title: '深度适配3大AI引擎',
          desc: '针对擅长文字排版的ChatGPT、生动表情的Gemini、幽默风格的Grok量身定制提示词。'
        }
      ]
    },
    en: {
      title: 'New to Emoticon Design? What is AI Prompt Maker?',
      desc: 'Plan 15-sticker emoticon sheets in 1 second using photos or simple tags, even with zero drawing skills.',
      cards: [
        {
          icon: '⚡',
          bg: 'bg-[#FFFDF8] border-[#FFECA1]',
          title: '15-Sticker Set in 1 Second',
          desc: 'Automatically maps 15 core emotions, typography colors, and layout compositions across 80+ themes.'
        },
        {
          icon: '🎭',
          bg: 'bg-[#F8FAFC] border-slate-200',
          title: 'Consistent Character Design',
          desc: 'Maintains character identity, 2.5-head SD proportions, and unique colors stably across all 15 cuts.'
        },
        {
          icon: '⚡',
          bg: 'bg-[#F0FDF4] border-emerald-200',
          title: 'Optimized for 3 Major AI Engines',
          desc: 'Instant tailored prompts for ChatGPT (Typography), Gemini (Vivid Poses), and Grok (Humorous Comic).'
        }
      ]
    }
  };

  const cur = data[lang] || data['ko'];

  return (
    <section className="bg-white rounded-xl p-5 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col gap-4 break-keep">
      <div className="flex items-center gap-2.5">
        <span className="text-[24px]">🎨</span>
        <div>
          <h2 className="text-[18px] sm:text-[20px] font-black text-slate-900 tracking-tight">
            {cur.title}
          </h2>
          <p className="text-[12.5px] sm:text-[13.5px] text-slate-500 mt-0.5">
            {cur.desc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-1">
        {cur.cards.map((c, idx) => (
          <div key={idx} className={`${c.bg} p-4 rounded-lg border flex flex-col gap-1.5`}>
            <span className="text-[20px]">{c.icon}</span>
            <strong className="text-[14.5px] font-bold text-slate-900">{c.title}</strong>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              {c.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

// 메인 하단 섹션 2: 3분 초간단 사용 가이드
const SectionGuide = ({ lang }) => {
  const data = {
    ko: {
      title: '3분 완성! 초간단 이모티콘 제작 가이드',
      desc: '초보자도 따라 할 수 있는 4단계 이모티콘 제작 프로세스입니다.',
      steps: [
        {
          step: '01',
          icon: '🎨',
          badge: '캐릭터 설정',
          title: '피사체 & 화풍 선택',
          desc: '동물, 새, 해양생물, 곤충, 파충류, 인물 등 12개 카테고리에서 원하는 캐릭터와 화풍을 클릭하거나 사진을 준비하세요.'
        },
        {
          step: '02',
          icon: '💬',
          badge: '테마 매핑',
          title: '15종 대화 문구 세트 선택',
          desc: '일상, 직장인 속마음, 집사/고양이, 커플 등 80종 이상의 테마 중 원하는 15종 문구 세트를 선택하세요.'
        },
        {
          step: '03',
          icon: '🚀',
          badge: '원클릭 생성',
          title: 'AI 프롬프트 복사 & 생성',
          desc: '원하는 AI 모델(ChatGPT, Gemini, Grok) 버튼을 눌러 프롬프트를 복사하고 AI 채팅창에 붙여넣어 이미지를 만드세요.'
        },
        {
          step: '04',
          icon: '✨',
          badge: '자유로운 활용',
          title: '배경 투명화 & 실전 활용',
          desc: '생성된 15종 시트에서 배경을 투명화(PNG)한 뒤, SNS 짤·프로필·디지털 다꾸로 쓰거나 캐릭터 작화 시안으로 완성하세요.'
        }
      ]
    },
    ja: {
      title: '3分で完成！ 超簡単スタンプ作成ガイド',
      desc: '初心者でもすぐできる4ステップのスタンプ制作プロセスです。',
      steps: [
        {
          step: '01',
          icon: '🎨',
          badge: 'キャラ設定',
          title: 'キャラクター・画風選択',
          desc: '動物、鳥、海洋生物、虫、人物など12カテゴリからキャラクターと画風を選びます。'
        },
        {
          step: '02',
          icon: '💬',
          badge: 'テーマ選択',
          title: '15種セリフテーマ選択',
          desc: '日常、仕事の本音、猫と執事、カップルなど80種以上のテーマから選択します。'
        },
        {
          step: '03',
          icon: '🚀',
          badge: 'ワンクリック',
          title: 'プロンプトコピー＆生成',
          desc: '使いたいAIモデル（ChatGPT, Gemini, Grok）を選んでコピーし、AIチャットに貼り付けて生成します。'
        },
        {
          step: '04',
          icon: '✨',
          badge: '自由な活用',
          title: '背景透過＆実戦活用',
          desc: '生成シートの背景を透過(PNG)し、トークルーム、SNSアイコン、手帳デコや作画下絵として活用します。'
        }
      ]
    },
    zh: {
      title: '3分钟搞定！ 超简单表情包制作指南',
      desc: '新手也能轻松掌握的4步表情包制作全流程。',
      steps: [
        {
          step: '01',
          icon: '🎨',
          badge: '设定角色',
          title: '选择主体与画风',
          desc: '从动物、鸟类、水产、昆虫、人物等12大类中选择角色和画风，或准备照片。'
        },
        {
          step: '02',
          icon: '💬',
          badge: '匹配主题',
          title: '选择15款对话文案',
          desc: '从日常、职场心声、铲屎官、情侣等80+主题中选择15款文案组合。'
        },
        {
          step: '03',
          icon: '🚀',
          badge: '一键生成',
          title: '复制提示词并生成',
          desc: '点击选择AI模型（ChatGPT, Gemini, Grok），一键复制提示词并发送至AI对话框。'
        },
        {
          step: '04',
          icon: '✨',
          badge: '自由应用',
          title: '背景抠图与实际应用',
          desc: '一键去除背景保存为PNG，可用于聊天表情、社交头像、手账贴纸或二次画稿草图。'
        }
      ]
    },
    en: {
      title: '3-Minute Quick Start Emoticon Guide',
      desc: 'Simple 4-step process from prompt creation to sticker release.',
      steps: [
        {
          step: '01',
          icon: '🎨',
          badge: 'Character',
          title: 'Select Subject & Style',
          desc: 'Choose your character and art style from 12 categories or prepare a photo.'
        },
        {
          step: '02',
          icon: '💬',
          badge: 'Theme Mapping',
          title: 'Choose 15-Dialogue Theme',
          desc: 'Pick a 15-phrase set from 80+ themes like Daily, Workplace, Pet, or Couples.'
        },
        {
          step: '03',
          icon: '🚀',
          badge: 'One-Click',
          title: 'Copy Prompt & Generate',
          desc: 'Click your preferred AI engine button (ChatGPT, Gemini, Grok), copy, and paste into AI chat.'
        },
        {
          step: '04',
          icon: '✨',
          badge: 'Creative Usage',
          title: 'Remove BG & Use Anywhere',
          desc: 'Remove background to PNG and use as chat stickers, social avatars, digital planners, or art drafts.'
        }
      ]
    }
  };

  const cur = data[lang] || data['ko'];

  return (
    <section className="bg-white rounded-xl p-5 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col gap-4 break-keep">
      <div className="flex items-center gap-2.5">
        <span className="text-[24px]">📖</span>
        <div>
          <h2 className="text-[18px] sm:text-[20px] font-black text-slate-900 tracking-tight">
            {cur.title}
          </h2>
          <p className="text-[12.5px] sm:text-[13.5px] text-slate-500 mt-0.5">
            {cur.desc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-1">
        {cur.steps.map((s, idx) => (
          <div key={idx} className="bg-slate-50/80 hover:bg-amber-50/20 transition-colors p-4 sm:p-4.5 rounded-xl border border-slate-200/90 flex flex-col gap-2 relative shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-900 border border-amber-500/30 flex items-center justify-center font-black text-[12px] font-mono shrink-0">
                  {s.step}
                </span>
                <span className="text-[12px] font-black text-amber-900 tracking-tight uppercase whitespace-nowrap">
                  STEP {s.step}
                </span>
              </div>
              <span className="text-[11.5px] font-bold px-2.5 py-0.5 bg-white text-slate-700 rounded-full border border-slate-200 shadow-2xs shrink-0 whitespace-nowrap">
                {s.badge}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[16px]">{s.icon}</span>
              <strong className="text-[14.5px] sm:text-[15px] font-extrabold text-slate-900 tracking-tight">
                {s.title}
              </strong>
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed pl-6 break-keep">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

// 메인 하단 섹션 3: 완성도를 높이는 이모티콘 기획 5대 원칙
const SectionPrinciples = ({ lang }) => {
  const data = {
    ko: {
      title: '완성도를 200% 높이는 이모티콘 기획 5대 원칙',
      desc: '캐릭터 컨셉 기획과 감정 표현의 퀄리티를 극대화하는 실전 노하우입니다.',
      principles: [
        {
          num: '1',
          title: '단순하고 직관적인 실루엣',
          desc: '작은 모바일 채팅창 화면에서도 캐릭터가 한눈에 인식되도록 복잡한 장식보다는 단순하고 둥근 2~3등신 SD 비율을 유지하세요.'
        },
        {
          num: '2',
          title: '과장된 표정과 역동적인 동작',
          desc: '밋밋한 표정보다는 눈이 커지거나 불타오르는 등 희로애락의 감정이 온몸으로 극대화되어 전달되어야 생동감이 넘칩니다.'
        },
        {
          num: '3',
          title: '15종 감정 밸런스 황금 비율',
          desc: '긍정/환호, 일상 인사, 현실 공감, 분노/당황 등 일상 대화에서 자주 쓰이는 상황이 골고루 배분되어야 합니다.'
        },
        {
          num: '4',
          title: '텍스트 시인성과 글자 외곽선',
          desc: '배경이 어둡거나 밝아도 문구가 또렷하게 읽히도록 두꺼운 화이트 외곽선(Stroke)을 두르고 글자 수는 2~6자 이내로 간결하게 기획하세요.'
        },
        {
          num: '5',
          title: '명확한 타겟 페르소나 컨셉',
          desc: 'K-직장인, 자취생, 대학생, 육아맘, 반려인 등 명확한 타겟층이 공감할 수 있는 뚜렷한 정체성과 유머 코드를 부여하세요.'
        }
      ]
    },
    ja: {
      title: 'クオリティを200%高めるスタンプ企画5大原則',
      desc: 'キャラクター企画と感情表現の完成度を最大化する実戦ノウハウです。',
      principles: [
        {
          num: '1',
          title: 'シンプルで直感的なシルエット',
          desc: '小さなスマホ画面でも一目で伝わるよう、複雑な装飾を控え2〜3頭身の丸みを帯びたSD比率を維持しましょう。'
        },
        {
          num: '2',
          title: '大げさな表情とダイナミックな動作',
          desc: '控えめな表情よりも、目が大きくなったり全身で喜怒哀楽を爆発させることで躍動感が出ます。'
        },
        {
          num: '3',
          title: '15種の感情バランス黄金比',
          desc: '挨拶、ポジティブ、共感、驚きなど日常トークで高頻度に使われるシチュエーションをバランスよく配分します。'
        },
        {
          num: '4',
          title: '文字の見やすさと白フチ加工',
          desc: '背景色に左右されず文字が読めるよう太めの白フチをつけ、文字数は2〜6文字以内に抑えます。'
        },
        {
          num: '5',
          title: '明確なターゲットとコンセプト',
          desc: '会社員、学生、ペット飼い主、主婦など特定のユーザー層が深く共感できる個性とユーモアを与えましょう。'
        }
      ]
    },
    zh: {
      title: '提升200%质感的表情包策划5大黄金原则',
      desc: '极大提升角色设计与情绪表现力的实用设计技巧。',
      principles: [
        {
          num: '1',
          title: '简洁直观的角色剪影',
          desc: '在手机小屏幕上也能一眼看清，避免繁琐装饰，保持圆润可爱的2~3头身Q版比例。'
        },
        {
          num: '2',
          title: '夸张表情与动态肢体动作',
          desc: '比起平淡表情，放大双眼、怒火中烧等将喜怒哀乐用全身表现出来更具感染力。'
        },
        {
          num: '3',
          title: '15款情绪黄金平衡配比',
          desc: '将问候、夸奖、疲惫共鸣、震惊吐槽等高频聊天场景进行科学合理的配比。'
        },
        {
          num: '4',
          title: '文字清晰度与白色描边',
          desc: '无论深色浅色背景都能看清，建议添加粗白描边，文字长度控制在2~6个字以内。'
        },
        {
          num: '5',
          title: '明确的用户画像与人设',
          desc: '为打工人、学生党、铲屎官、宝妈等特定人群量身定制引发强烈共鸣的人设与笑点。'
        }
      ]
    },
    en: {
      title: '5 Core Principles for High-Quality Emoticon Design',
      desc: 'Essential design principles for creative character planning and expressive poses.',
      principles: [
        {
          num: '1',
          title: 'Simple & Intuitive Silhouette',
          desc: 'Keep character shapes clean with a 2~3 head SD ratio so it stays instantly recognizable on small mobile screens.'
        },
        {
          num: '2',
          title: 'Exaggerated Expressions & Dynamic Poses',
          desc: 'Maximize emotions with bold facial changes and full-body actions rather than subtle static poses.'
        },
        {
          num: '3',
          title: 'Balanced 15-Emotion Golden Ratio',
          desc: 'Evenly distribute high-frequency daily situations: Greetings, Cheers, Empathy, and Comic Shock.'
        },
        {
          num: '4',
          title: 'Text Readability & White Outlines',
          desc: 'Ensure text readability on any chat background by adding thick white strokes, keeping words to 2~6 characters.'
        },
        {
          num: '5',
          title: 'Distinct Persona & Concept',
          desc: 'Infuse specific humor and identity that resonates with defined targets like workers, students, or pet lovers.'
        }
      ]
    }
  };

  const cur = data[lang] || data['ko'];

  return (
    <section className="bg-white rounded-xl p-5 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col gap-4 break-keep">
      <div className="flex items-center gap-2.5">
        <span className="text-[24px]">🏆</span>
        <div>
          <h2 className="text-[18px] sm:text-[20px] font-black text-slate-900 tracking-tight">
            {cur.title}
          </h2>
          <p className="text-[12.5px] sm:text-[13.5px] text-slate-500 mt-0.5">
            {cur.desc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-1">
        {cur.principles.map((p, idx) => (
          <div key={idx} className="bg-gradient-to-br from-slate-50 to-amber-50/20 p-4 rounded-lg border border-slate-200/80 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-[12px] flex items-center justify-center shrink-0">
                {p.num}
              </span>
              <strong className="text-[14.5px] font-bold text-slate-900">{p.title}</strong>
            </div>
            <p className="text-[12.5px] sm:text-[13px] text-slate-600 leading-relaxed pl-8">
              {p.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

// 메인 하단 섹션 4: 추천 이모티콘 15종 필수 감정 황금 조합
const SectionEmotionFormula = ({ lang, onApplyFormula }) => {
  const content = {
    ko: {
      title: '추천 이모티콘 15종 필수 감정 황금 조합',
      desc: '실제 메신저 채팅에서 매일 쓰이는 핵심 15개 컷을 4개 필수 감정 테마로 균형 있게 구성했습니다.',
      applyAllBtn: '이모티콘 문구 그리드에 적용하기',
      applyAllSub: '위 15개 추천 문구가 상단 [이모티콘 문구 그리드]에 즉시 자동 적용됩니다.',
      appliedToast: '✨ 추천 15종 황금 조합',
      categories: [
        {
          group: '1. 대화 시작 & 긍정 리액션',
          count: '4종',
          icon: '🎉',
          items: ['안녕!', '최고야!', '고마워요', '사랑해요'],
          cardStyle: 'bg-emerald-50/70 border-emerald-200/90 text-emerald-950',
          badgeStyle: 'bg-emerald-500/15 text-emerald-800 border-emerald-300',
          pillStyle: 'bg-white/95 text-emerald-900 border-emerald-200/90 shadow-2xs'
        },
        {
          group: '2. 일상 대답 & 따뜻한 응원',
          count: '4종',
          icon: '💪',
          items: ['오늘도 화이팅', '좋아요', '축하해요', '다 잘될 거야'],
          cardStyle: 'bg-blue-50/70 border-blue-200/90 text-blue-950',
          badgeStyle: 'bg-blue-500/15 text-blue-800 border-blue-300',
          pillStyle: 'bg-white/95 text-blue-900 border-blue-200/90 shadow-2xs'
        },
        {
          group: '3. 현실 공감 & 피로 회복',
          count: '4종',
          icon: '☕',
          items: ['수고했어요', '네 (영혼 탈출)', '살려줘요', '잘자요 꿀잠'],
          cardStyle: 'bg-amber-50/70 border-amber-200/90 text-amber-950',
          badgeStyle: 'bg-amber-500/15 text-amber-800 border-amber-300',
          pillStyle: 'bg-white/95 text-amber-900 border-amber-200/90 shadow-2xs'
        },
        {
          group: '4. 당황 & 반전 재미',
          count: '3종',
          icon: '⚡',
          items: ['헐 대박', '킹받네 (분노)', '오예! (환호)'],
          cardStyle: 'bg-rose-50/70 border-rose-200/90 text-rose-950',
          badgeStyle: 'bg-rose-500/15 text-rose-800 border-rose-300',
          pillStyle: 'bg-white/95 text-rose-900 border-rose-200/90 shadow-2xs'
        }
      ]
    },
    ja: {
      title: 'おすすめスタンプ15種 黄金の感情組み合わせ',
      desc: '日常会話で毎日使われる15の必須カットを4つの感情テーマにバランスよく構成しました。',
      applyAllBtn: 'スタンプ文言グリッドに適用',
      applyAllSub: '上記の15フレーズが上部の【スタンプ文言15種グリッド】に即座に反映されます。',
      appliedToast: '✨ おすすめ15種黄金セット',
      categories: [
        {
          group: '1. 挨拶・ポジティブリアクション',
          count: '4種',
          icon: '🎉',
          items: ['こんにちは！', '最高！', 'ありがとう', '大好き'],
          cardStyle: 'bg-emerald-50/70 border-emerald-200/90 text-emerald-950',
          badgeStyle: 'bg-emerald-500/15 text-emerald-800 border-emerald-300',
          pillStyle: 'bg-white/95 text-emerald-900 border-emerald-200/90 shadow-2xs'
        },
        {
          group: '2. 日常の返事・応援',
          count: '4種',
          icon: '💪',
          items: ['ファイト！', 'いいね！', 'おめでとう', '大丈夫だよ'],
          cardStyle: 'bg-blue-50/70 border-blue-200/90 text-blue-950',
          badgeStyle: 'bg-blue-500/15 text-blue-800 border-blue-300',
          pillStyle: 'bg-white/95 text-blue-900 border-blue-200/90 shadow-2xs'
        },
        {
          group: '3. 共感・お疲れモード',
          count: '4種',
          icon: '☕',
          items: ['お疲れ様', 'はい(魂抜け)', '助けて', 'おやすみ'],
          cardStyle: 'bg-amber-50/70 border-amber-200/90 text-amber-950',
          badgeStyle: 'bg-amber-500/15 text-amber-800 border-amber-300',
          pillStyle: 'bg-white/95 text-amber-900 border-amber-200/90 shadow-2xs'
        },
        {
          group: '4. 驚き・リアクション',
          count: '3種',
          icon: '⚡',
          items: ['まじで！', '激おこ', 'やったー！'],
          cardStyle: 'bg-rose-50/70 border-rose-200/90 text-rose-950',
          badgeStyle: 'bg-rose-500/15 text-rose-800 border-rose-300',
          pillStyle: 'bg-white/95 text-rose-900 border-rose-200/90 shadow-2xs'
        }
      ]
    },
    zh: {
      title: '推荐表情包15款 黄金情绪搭配',
      desc: '精选日常聊天最高频使用的15个镜头，均衡分布于4大情绪主题。',
      applyAllBtn: '应用到表情包文案网格',
      applyAllSub: '上述15款文案将立即自动填入上方的【15款表情包文案网格】中。',
      appliedToast: '✨ 推荐15款黄金组合',
      categories: [
        {
          group: '1. 问候与积极回复',
          count: '4款',
          icon: '🎉',
          items: ['你好！', '太棒了！', '谢谢你', '超喜欢'],
          cardStyle: 'bg-emerald-50/70 border-emerald-200/90 text-emerald-950',
          badgeStyle: 'bg-emerald-500/15 text-emerald-800 border-emerald-300',
          pillStyle: 'bg-white/95 text-emerald-900 border-emerald-200/90 shadow-2xs'
        },
        {
          group: '2. 日常回复与暖心加油',
          count: '4款',
          icon: '💪',
          items: ['今天也加油', '好的/赞', '恭喜恭喜', '一切都会好'],
          cardStyle: 'bg-blue-50/70 border-blue-200/90 text-blue-950',
          badgeStyle: 'bg-blue-500/15 text-blue-800 border-blue-300',
          pillStyle: 'bg-white/95 text-blue-900 border-blue-200/90 shadow-2xs'
        },
        {
          group: '3. 现实共鸣与疲惫治愈',
          count: '4款',
          icon: '☕',
          items: ['辛苦啦', '好的(灵魂出窍)', '救救我', '晚安好梦'],
          cardStyle: 'bg-amber-50/70 border-amber-200/90 text-amber-950',
          badgeStyle: 'bg-amber-500/15 text-amber-800 border-amber-300',
          pillStyle: 'bg-white/95 text-amber-900 border-amber-200/90 shadow-2xs'
        },
        {
          group: '4. 震惊与趣味反转',
          count: '3款',
          icon: '⚡',
          items: ['我的天！', '气炸了', '太爽了！'],
          cardStyle: 'bg-rose-50/70 border-rose-200/90 text-rose-950',
          badgeStyle: 'bg-rose-500/15 text-rose-800 border-rose-300',
          pillStyle: 'bg-white/95 text-rose-900 border-rose-200/90 shadow-2xs'
        }
      ]
    },
    en: {
      title: '15 Essential Emotion Formula for Daily Chat',
      desc: 'Optimized 15-cut set structure divided evenly into 4 core daily messenger themes.',
      applyAllBtn: 'Apply to Emoticon Phrase Grid',
      applyAllSub: 'All 15 phrases will be instantly loaded into the 15-phrase grid above.',
      appliedToast: '✨ 15 Essential Emotion Formula',
      categories: [
        {
          group: '1. Greetings & Positive Vibes',
          count: '4 cuts',
          icon: '🎉',
          items: ['Hello!', 'Awesome!', 'Thank you', 'Love it'],
          cardStyle: 'bg-emerald-50/70 border-emerald-200/90 text-emerald-950',
          badgeStyle: 'bg-emerald-500/15 text-emerald-800 border-emerald-300',
          pillStyle: 'bg-white/95 text-emerald-900 border-emerald-200/90 shadow-2xs'
        },
        {
          group: '2. Daily Responses & Cheers',
          count: '4 cuts',
          icon: '💪',
          items: ['Cheer up!', 'Sounds good', 'Congrats!', 'All is well'],
          cardStyle: 'bg-blue-50/70 border-blue-200/90 text-blue-950',
          badgeStyle: 'bg-blue-500/15 text-blue-800 border-blue-300',
          pillStyle: 'bg-white/95 text-blue-900 border-blue-200/90 shadow-2xs'
        },
        {
          group: '3. Empathy & Relaxation',
          count: '4 cuts',
          icon: '☕',
          items: ['Good job', 'Yes (Exhausted)', 'Save me', 'Good night'],
          cardStyle: 'bg-amber-50/70 border-amber-200/90 text-amber-950',
          badgeStyle: 'bg-amber-500/15 text-amber-800 border-amber-300',
          pillStyle: 'bg-white/95 text-amber-900 border-amber-200/90 shadow-2xs'
        },
        {
          group: '4. Shock & Fun Reactions',
          count: '3 cuts',
          icon: '⚡',
          items: ['OMG!', 'Furious!', 'Yay! (Cheer)'],
          cardStyle: 'bg-rose-50/70 border-rose-200/90 text-rose-950',
          badgeStyle: 'bg-rose-500/15 text-rose-800 border-rose-300',
          pillStyle: 'bg-white/95 text-rose-900 border-rose-200/90 shadow-2xs'
        }
      ]
    }
  };

  const cur = content[lang] || content['ko'];
  const all15Items = cur.categories.flatMap(c => c.items);

  const handleApply = () => {
    if (onApplyFormula) {
      onApplyFormula(all15Items, cur.appliedToast);
    }
  };

  return (
    <section className="bg-white rounded-xl p-5 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col gap-4 break-keep">
      <div className="flex items-center gap-2.5">
        <span className="text-[24px]">🎯</span>
        <div>
          <h2 className="text-[18px] sm:text-[20px] font-black text-slate-900 tracking-tight">
            {cur.title}
          </h2>
          <p className="text-[12.5px] sm:text-[13.5px] text-slate-500 mt-0.5">
            {cur.desc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-1">
        {cur.categories.map((c, idx) => (
          <div key={idx} className={`p-4 sm:p-4.5 rounded-xl border flex flex-col justify-between gap-3 ${c.cardStyle}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[16px] shrink-0">{c.icon}</span>
                <span className="text-[13.5px] sm:text-[14.5px] font-extrabold tracking-tight">
                  {c.group}
                </span>
              </div>
              <span className={`text-[11px] sm:text-[11.5px] font-black px-2.5 py-0.5 rounded-full border shrink-0 ${c.badgeStyle}`}>
                {c.count}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {c.items.map((item, itemIdx) => (
                <span
                  key={itemIdx}
                  className={`text-[12px] sm:text-[12.5px] font-bold px-2.5 py-1 rounded-lg border whitespace-nowrap leading-none ${c.pillStyle}`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {onApplyFormula && (
        <div className="mt-1 bg-gradient-to-r from-amber-50 via-amber-100/35 to-amber-50 p-3.5 sm:p-4 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs break-keep">
          <div className="flex items-center gap-2 text-[12.5px] sm:text-[13px] text-amber-950 font-medium text-center sm:text-left break-keep leading-snug">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
            <span className="break-keep">{cur.applyAllSub}</span>
          </div>
          <button
            onClick={handleApply}
            className="interactive-control px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[13px] rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95 cursor-pointer whitespace-nowrap break-keep w-full sm:w-auto"
          >
            <span>{cur.applyAllBtn}</span>
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      )}
    </section>
  );
};



// 메인 하단 섹션 5: 자주 묻는 질문 (FAQ Accordion)
const SectionFAQ = ({ lang }) => {
  const [openIdx, setOpenIdx] = useState(null);

  const data = {
    ko: {
      title: '자주 묻는 질문 (FAQ)',
      desc: '이모티콘 제작 및 AI 프롬프트 활용에 대해 궁금한 점을 확인하세요.',
      faqs: [
        {
          q: 'Q. AI로 생성한 이미지를 카카오톡 이모티콘 스튜디오에 바로 제출할 수 있나요?',
          a: '아니오, 바로 제출할 수 없습니다! 현재 카카오톡 등 주요 메신저 플랫폼은 저작권 및 창작성 가이드라인에 따라 순수 AI 생성 이미지를 그대로 제출하는 것을 엄격히 제한하고 있습니다. 따라서 본 도구는 "캐릭터 컨셉 구상, 15종 감정 표현 시안, 대사와 포즈 기획용 레퍼런스"를 잡는 도구로 활용하셔야 합니다. 정식 이모티콘 작가로 데뷔하고자 하실 때는 AI가 잡아준 기발한 시안을 바탕으로 작가님이 직접 선을 따고 리디자인하여 제출하셔야 합니다.'
        },
        {
          q: 'Q. 생성된 15종 이모티콘 시트는 어떻게 활용하면 되나요?',
          a: '배경을 투명하게 제거(PNG)한 뒤, ① 카톡·라인 친구/가족 단톡방에서 나만의 커스텀 스티커 짤로 전송, ② 인스타그램, 블로그, X(트위터) 프로필 및 감정 아바타, ③ 굿노트·노션 등 디지털 다이어리 다꾸 스티커, ④ 디스코드 커스텀 이모지, ⑤ 개인 소장용 굿즈(키링, 스티커 인쇄) 등으로 무궁무진하게 활용하실 수 있습니다.'
        },
        {
          q: 'Q. AI가 만든 15종 시트 이미지의 배경 투명화(누끼 따기)는 어떻게 하나요?',
          a: '생성된 이미지를 스마트폰이나 PC에 저장한 뒤, 무료 배경 제거 웹사이트(예: remove.bg, Adobe Express Free Background Remover 등) 또는 스마트폰 기본 갤러리의 [누끼 따기(피사체 꾹 누르기)] 기능을 사용하시면 1초 만에 깔끔한 투명 PNG 파일로 변환할 수 있습니다.'
        },
        {
          q: 'Q. ChatGPT, Gemini, Grok 중 어떤 AI 모델을 쓰는 게 가장 좋나요?',
          a: '말풍선에 한글 문구가 정확하게 적혀야 할 때는 ChatGPT(DALL-E 3)를 강력 추천합니다. 글자 없이 생동감 넘치는 표정과 동작 중심의 캐릭터를 원하실 때는 Google Gemini(Imagen 3)를 추천하며, 유머러스하고 개성 있는 코믹 연출에는 Grok이 뛰어난 성능을 보입니다.'
        },
        {
          q: 'Q. 프롬프트 메이커 이용 요금은 무료인가요?',
          a: '네! 프롬프트 메이커의 모든 기능(피사체 조합, 화풍 설정, 80종 테마, 다국어 프롬프트 복사, 캡션 생성기)은 100% 완전 무료로 무제한 이용하실 수 있습니다.'
        }
      ]
    },
    ja: {
      title: 'よくある質問 (FAQ)',
      desc: 'スタンプ制作やAIプロンプトの活用に関する疑問にお答えします。',
      faqs: [
        {
          q: 'Q. AIが生成した画像をそのままLINEスタンプ等に申請できますか？',
          a: 'いいえ、そのままの申請はできません。主要メッセンジャー各社はAI生成物をそのまま申請することを制限しています。本ツールは「キャラクターの企画・15種のポーズ構図・セリフ案（リファレンス）」を作るツールとしてご活用ください。正式リリースを目指す場合は、AI案をもとに作家様ご自身で作画・リデザインして申請してください。'
        },
        {
          q: 'Q. 生成された15種スタンプシートはどのように活用できますか？',
          a: '背景を透過(PNG)した後、①LINE等のトークルームで自作スタンプ画像として送信、②SNSのアイコンやプロフィール画像、③GoodNotesやNotionの手帳デコシール、④Discordのカスタム絵文字、⑤個人用グッズ（キーホルダー、シール印刷）などに自由に活用できます。'
        },
        {
          q: 'Q. AIが生成した画像の背景透過（切り抜き）はどうすればいいですか？',
          a: '画像を保存後、無料の背景透過サイト（remove.bgやAdobe Express等）や、スマートフォンの写真アプリ（被写体を長押しで切り抜き機能）を使えば、1秒で綺麗な透過PNGが作成できます。'
        },
        {
          q: 'Q. ChatGPT、Gemini、Grokのどれを使うのがおすすめですか？',
          a: '吹き出しの文字描画を重視するならChatGPT(DALL-E 3)、文字なしで躍動感あるポーズならGemini(Imagen 3)、ユニークでコミカルな表情ならGrokがおすすめです。'
        },
        {
          q: 'Q. プロンプトメーカーの利用は無料ですか？',
          a: 'はい！全機能（被写体選択、画風、80種以上のテーマ、多言語プロンプトコピー機能）を完全無料で無制限にご利用いただけます。'
        }
      ]
    },
    zh: {
      title: '常见问题解答 (FAQ)',
      desc: '了解关于表情包制作与AI提示词应用的相关疑问。',
      faqs: [
        {
          q: 'Q. 生成的AI图像可以直接提交给微信/LINE表情平台审核吗？',
          a: '不建议直接提交！目前各大主流平台均对纯AI生成内容有严格审核限制。本工具定位为“角色设定、15款情绪分镜、动作文案构思（设计草图参考）”。若要正式上架，请以AI草图为灵感，由画师亲自勾线重绘提交。'
        },
        {
          q: 'Q. 生成的15款表情包在日常中如何使用？',
          a: '一键去除背景保存为PNG后，可①在聊天群中作为专属表情包发送，②用作小红书/微博/微信头像，③用于GoodNotes等电子手账贴纸，④作为Discord等社区自定义表情，⑤定制钥匙扣或个人实体贴纸。'
        },
        {
          q: 'Q. 如何为AI生成的表情包去除背景（抠图）？',
          a: '将生成的图片保存后，使用免费在线抠图工具（如remove.bg、Adobe Express等）或手机相册长按一键抠图功能，1秒即可转为透明PNG格式。'
        },
        {
          q: 'Q. ChatGPT、Gemini、Grok哪个模型最好用？',
          a: '如果需要精准生成带字气泡，推荐ChatGPT(DALL-E 3)；如果侧重于纯动作与丰富表情，推荐Gemini(Imagen 3)；若追求幽默恶搞画风，Grok表现更佳。'
        },
        {
          q: 'Q. 本提示词生成器完全免费吗？',
          a: '是的！本平台所有功能（主体组合、画风、80+主题、多语言提示词一键复制）均100%永久免费使用。'
        }
      ]
    },
    en: {
      title: 'Frequently Asked Questions (FAQ)',
      desc: 'Find answers to common questions about emoticon creation and AI prompts.',
      faqs: [
        {
          q: 'Q. Can I submit AI-generated images directly to official sticker stores?',
          a: 'No, direct submission is restricted! Most major messaging platforms restrict purely AI-generated submissions. Use this tool for "character ideation, 15-cut emotion mapping, and pose/dialogue reference drafts". For official store releases, use the AI sheet as a creative guide and redraw/refine the final artwork.'
        },
        {
          q: 'Q. How can I use the generated 15-sticker set?',
          a: 'After removing the background (PNG), you can use them as ① custom chat image stickers for friends/family, ② social profile avatars (Instagram, X, Discord), ③ digital planner stickers (GoodNotes, Notion), ④ community emojis, or ⑤ personal merchandise (keychains, prints).'
        },
        {
          q: 'Q. How do I remove the background of the 15-cut sheet?',
          a: 'Save the image to your device, then use free online background removers (like remove.bg or Adobe Express) or smartphone gallery cutout tools (long-press subject) to get transparent PNGs in 1 second.'
        },
        {
          q: 'Q. Which AI model (ChatGPT, Gemini, Grok) is best?',
          a: 'ChatGPT (DALL-E 3) is best for rendering speech bubble text. Google Gemini (Imagen 3) excels at vivid expressions without text, and Grok shines at humorous comic sketches.'
        },
        {
          q: 'Q. Is Prompt Maker free to use?',
          a: 'Yes! All features (subject combinations, styles, 80+ themes, multilingual prompt copy) are 100% free with unlimited access.'
        }
      ]
    }
  };

  const cur = data[lang] || data['ko'];

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="bg-white rounded-xl p-5 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col gap-4 break-keep">
      <div className="flex items-center gap-2.5">
        <span className="text-[24px]">❓</span>
        <div>
          <h2 className="text-[18px] sm:text-[20px] font-black text-slate-900 tracking-tight">
            {cur.title}
          </h2>
          <p className="text-[12.5px] sm:text-[13.5px] text-slate-500 mt-0.5">
            {cur.desc}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 mt-1">
        {cur.faqs.map((faq, idx) => (
          <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden transition-all">
            <button
              onClick={() => toggle(idx)}
              className="interactive-control w-full px-4 py-3.5 text-left bg-slate-50/70 hover:bg-slate-100/80 flex items-center justify-between gap-3 font-bold text-[13.5px] sm:text-[14.5px] text-slate-900 cursor-pointer"
            >
              <span>{faq.q}</span>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center bg-slate-100/80 text-slate-500 shrink-0 transition-transform duration-200 ${openIdx === idx ? 'rotate-180 bg-amber-100 text-amber-800' : ''}`}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            {openIdx === idx && (
              <div className="p-4 bg-white text-[13px] sm:text-[13.5px] text-slate-700 leading-relaxed border-t border-slate-200">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
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
          <span>💡</span> {t.guideHeader}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center gap-1 sm:gap-1.5 bg-mint-soft p-1.5 rounded-lg border border-mint-border shadow-xs w-full lg:w-auto max-w-full">
          <button
            onClick={() => setActiveTab('model')}
            className={`interactive-control px-2 sm:px-3 py-1.5 text-[12px] sm:text-[13px] font-bold rounded-md text-center transition-all cursor-pointer ${activeTab === 'model' ? 'bg-mint text-mint-strong shadow-xs border border-mint-border' : 'text-mint-strong hover:bg-mint-hover'}`}
          >
            ✨ {lang === 'ko' ? 'AI 모델' : lang === 'ja' ? 'AIモデル' : lang === 'zh' ? 'AI模型' : 'AI Models'}
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
            📜 {lang === 'ko' ? '프롬프트 템플릿' : lang === 'ja' ? 'プロンプト構造' : lang === 'zh' ? '提示词结构' : 'Prompt Template'}
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
                  <img src="/chatgpt_real.png" alt="ChatGPT Actual Result" className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500" />
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
                      <li>• 🎯 <strong className="text-on-surface">특징:</strong> xAI Grok Imagine(Quality Mode) 기반으로 자연어 맥락 이해와 선명한 2D 선화 및 미세 접촉 그림자(Contact Shadow) 스티커 질감이 탁월합니다.</li>
                      <li>• 📸 <strong className="text-on-surface">사진 참고 원리:</strong> 사진 속 인물의 핵심 시그니처(헤어스타일, 안경, 턱선, 의상)를 시각적으로 읽어낸 뒤 프롬프트 지시어와 결합해 2D 스티커로 스타일화합니다.</li>
                      <li>• 💡 <strong className="text-on-surface">실물 싱크로율 꿀팁:</strong> 15종 시트는 포즈 초안용으로 쓰고, 얼굴 싱크로율을 극대화하려면 <strong>[📋 15종 개별 분할]</strong> 모드에서 1장씩 생성하세요! 생성 후 대화창에서 <em>"사진 속 눈매와 헤어를 더 닮게 보정해줘"</em>라고 연속 수정(Multi-turn)할 수 있습니다.</li>
                    </>
                  )}
                  {lang === 'ja' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">特徴:</strong> xAI Grok Imagine搭載で、自然言語理解と鮮明な2D線画・白フチステッカー表現が優れています。</li>
                      <li>• 📸 <strong className="text-on-surface">写真参照:</strong> 写真の特徴（髪型・メガネ・輪郭）を抽出し、プロンプトと融合してスタンプ化します。</li>
                      <li>• 💡 <strong className="text-on-surface">そっくり度UP:</strong> 最終仕上げは[個別分割]モードが最も高精度です。チャットでの追加修正も可能です。</li>
                    </>
                  )}
                  {lang === 'zh' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">特点:</strong> 搭载xAI Grok Imagine引擎，自然语言理解与高清2D线条、白色剪裁贴纸质感极其出色。</li>
                      <li>• 📸 <strong className="text-on-surface">照片参考:</strong> 自动提取照片特征（发型、眼镜、脸型）并与提示词深度结合生成。</li>
                      <li>• 💡 <strong className="text-on-surface">高还原技巧:</strong> 追求最高相似度时，建议在[单张分割]模式下逐张生成，并可在对话中追问微调。</li>
                    </>
                  )}
                  {lang !== 'ko' && lang !== 'ja' && lang !== 'zh' && (
                    <>
                      <li>• 🎯 <strong className="text-on-surface">Feature:</strong> Powered by xAI Grok Imagine for crisp 2D linework and subtle contact-shadow sticker finishes.</li>
                      <li>• 📸 <strong className="text-on-surface">Photo Reference:</strong> Extracts key identity signatures (hair, glasses, jawline) and fuses with natural language prompts.</li>
                      <li>• 💡 <strong className="text-on-surface">Likeness Tip:</strong> Use [Batch Split] for maximum facial likeness and leverage multi-turn chat editing for refinement.</li>
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
  if (!p) return 'expressive dynamic full-body pose';

  if (PHRASE_ACTION_MAP_EN[p]) return PHRASE_ACTION_MAP_EN[p];

  if (PHRASE_ACTION_MAP_KO[p]) {
    const match = PHRASE_ACTION_MAP_KO[p].match(/\((.*?)\)/);
    if (match && match[1]) return match[1].trim();
  }

  // Multilingual keyword intelligence for all 98 themes (KO, JA, ZH, EN)
  const lower = p.toLowerCase();

  // 1. Laughter / Joy / Fun
  if (/ㅋ|ㅎ|웃|하하|호호|w|笑|草|hah|lol|lmao|joy|fun|funny/i.test(p)) {
    return 'bent over clutching stomach, bursting into joyful laughter on floor';
  }
  // 2. Greeting / Hello / Wave / Arrival
  if (/안녕|반가|하이|출근|왔|hey|hi|hello|wave|greet|おはよう|こんにちは|初めまして|你好|早|嗨/i.test(p)) {
    return 'standing cheerfully, one hand in pocket and other hand waving high in warm greeting';
  }
  // 3. Cheering / Fighting / Determination
  if (/화이팅|파이팅|힘내|영차|할수있|fight|cheer|go|win|ファイト|頑張|応援|加油|干杯/i.test(p)) {
    return 'raising one fist high with a determined wink and energetic fighting-spirit pose';
  }
  // 4. Good / Thumbs Up / OK / Approval / Agree
  if (/좋아|최고|오예|대박|굿|짱|따봉|good|great|best|nice|like|thumb|いいね|最高|すばらしい|好|赞|棒/i.test(p)) {
    return 'giving an enthusiastic thumbs-up with a bright confident smile';
  }
  // 5. Gratitude / Thanks / Bow
  if (/감사|고마|땡큐|수고|thank|appreciate|grateful|ありがとう|感謝|お疲れ|谢谢|多谢/i.test(p)) {
    return 'bowing politely at a respectful angle with hands together in sincere gratitude';
  }
  // 6. Love / Heart / Affection
  if (/사랑|하트|알랍|chu|love|heart|hug|kiss|好き|愛|キュン|爱|喜欢|抱/i.test(p)) {
    return 'sitting warmly hugging a pink heart pillow with a tender joyful smile';
  }
  // 7. Apology / Sorry / Embarrassment / Sweat
  if (/미안|죄송|사과|먄|sorry|apologize|oops|ごめん|すみません|申し訳|抱歉|对不起|不好意思/i.test(p)) {
    return 'bowing apologetically with hands clasped in front and small sweat-drop icons';
  }
  // 8. Celebration / Party / Birthday / Congratulation
  if (/축하|생일|파티|경사|congrat|party|bday|birthday|祝|おめでとう|诞|庆/i.test(p)) {
    return 'shooting a party popper with colorful confetti ribbons bursting in celebration';
  }
  // 9. Shock / Surprise / Astonishment
  if (/헐|대박|깜짝|실화|shock|omg|wow|what|びっくり|えっ|マジ|惊|天哪|哇/i.test(p)) {
    return 'holding head with both hands, eyes and mouth wide open in shocked amazement';
  }
  // 10. Emotion / Tears / Crying / Touched
  if (/감동|눈물|ㅠㅠ|ㅜㅜ|흑|엉엉|cry|tear|touch|泣|感動|涙|哭|流泪|感动/i.test(p)) {
    return 'kneeling with hands clasped to chest, emotionally moved with a single sparkling tear';
  }
  // 11. Sleep / Tired / Good Night / Rest
  if (/잘자|굿나잇|졸려|피곤|휴식|퇴근|sleep|night|tired|bed|zz|おやすみ|眠|寝|晚安|困|睡|累/i.test(p)) {
    return 'curled up peacefully hugging a soft pillow sleeping with small zZ floaters';
  }
  // 12. Food / Hungry / Eating / Delicious
  if (/배고|밥|먹|맛|치킨|피자|야식|food|eat|hungry|yum|yummy|飯|腹|美味|吃|饿|美味|餐/i.test(p)) {
    return 'holding delicious food items with mouth watering and eyes sparkling in delight';
  }
  // 13. Money / Stocks / Wealth / Success
  if (/돈|머니|주식|코인|수익|떡상|익절|money|cash|rich|profit|coin|stock|金|富|株|钱|赚|涨/i.test(p)) {
    return 'holding a fan of banknotes excitedly jumping with golden coins floating around';
  }
  // 14. Anger / Rage / Frustration
  if (/화나|빡|분노|짜증|열받|angry|rage|mad|fume|怒|プンプン|气|怒|烦/i.test(p)) {
    return 'fists clenched with cartoon fire fumes and steam puffing out in comic anger';
  }
  // 15. Sports / Fitness / Health
  if (/운동|헬스|런|골프|축구|gym|workout|fitness|golf|run|筋トレ|走|运动|健身/i.test(p)) {
    return 'energetic active sport pose holding matching athletic gear and cheering';
  }

  return `expressive character pose representing ${p} with dynamic body gesture and supporting visual props`;
};

// Google Analytics 4 (GA4) / GTM Real-time Event Tracking Helper
const trackEvent = (eventName, params = {}) => {
  try {
    if (typeof window !== 'undefined') {
      if (window.gtag) {
        window.gtag('event', eventName, params);
      }
      if (window.dataLayer) {
        window.dataLayer.push({ event: eventName, ...params });
      }
    }
  } catch (e) {
    // silently ignore tracking errors
  }
};

// 🌟 Real-time Golden Combos Presets with Seasonal Intelligence & Auto-Ranking (4-Language Parity)
const ALL_GOLDEN_COMBOS = [
  {
    id: 'daycare-name-tag',
    icon: '🍼',
    themeIdx: 72, // 어린이/유치원 ① (Kids/Kindergarten ①)
    characterSource: 'photo',
    photoMode: 'balanced',
    seasonMonths: [2, 3, 4],
    title: {
      ko: '어린이집 네임스티커',
      ja: '保育園お名前シール',
      zh: '幼儿园姓名贴',
      en: 'Daycare Name Label'
    },
    desc: {
      ko: '아이 사진 + 방수 이름표 & 키즈노트 알림장',
      ja: 'お子様写真＋連絡帳・防水名前シール',
      zh: '宝宝照片＋防水姓名贴与家园联系册',
      en: 'Child photo + Waterproof name tag'
    },
    tags: {
      ko: '아이 얼굴, 귀여운 2D 캐릭터, 이름표 라벨, 방수 스티커, 밝고 사랑스러운',
      ja: 'お子様の顔, かわいい2Dキャラ, お名前シール, 防水ステッカー, 明るく愛らしい',
      zh: '孩子照片, 可爱2D卡通角色, 姓名贴纸, 防水标签, 明亮活泼',
      en: 'Child face, Cute 2D character, Name tag label, Waterproof sticker, Bright and lovely'
    }
  },
  {
    id: 'christmas-party',
    icon: '🎄',
    themeIdx: 104, // 크리스마스/연말 ① (Christmas/Year-End ①)
    characterSource: 'photo',
    photoMode: 'style',
    seasonMonths: [11, 12],
    title: {
      ko: '크리스마스 & 연말 파티',
      ja: 'クリスマス＆年末パーティー',
      zh: '圣诞与新年跨年派对',
      en: 'Christmas & Year-End'
    },
    desc: {
      ko: '산타 모자 + 루돌프 코 + 반짝반짝 트리 조명',
      ja: 'サンタ帽＋トナカイの鼻＋キラキラツリー',
      zh: '圣诞帽＋麋鹿红鼻子＋发光圣诞树',
      en: 'Santa Hat + Rudolph Nose + Xmas Tree'
    },
    tags: {
      ko: '크리스마스 산타 모자, 빨간 루돌프 코, 따뜻한 털 목도리, 반짝이는 트리 조명, 축제 분위기',
      ja: 'サンタクロース帽子, 赤いトナカイの鼻, 暖かいマフラー, 輝くツリーライト, クリスマス感',
      zh: '圣诞老人帽子, 红鼻头驯鹿, 温暖红围巾, 闪烁圣诞树彩灯, 欢快节日氛围',
      en: 'Christmas Santa hat, Red Rudolph nose, Warm knitted scarf, Twinkling Xmas tree lights, Festive joy'
    }
  },
  {
    id: 'wedding-invitation',
    icon: '💍',
    themeIdx: 98, // 웨딩/청첩장 ① (Wedding/Invitation ①)
    characterSource: 'photo',
    photoMode: 'balanced',
    seasonMonths: [4, 5, 9, 10],
    title: {
      ko: '웨딩 & 모바일 청첩장',
      ja: '結婚式＆ウェディング',
      zh: '婚礼与电子请帖',
      en: 'Wedding & Newlyweds'
    },
    desc: {
      ko: '턱시도/웨딩드레스 + 화관 + 로맨틱 꽃잎',
      ja: 'タキシード/ドレス＋花冠＋ロマンチック',
      zh: '新郎礼服/婚纱＋花环＋浪漫花瓣',
      en: 'Tuxedo & Wedding Dress + Flower Crown'
    },
    tags: {
      ko: '웨딩드레스와 턱시도, 화사한 부케 꽃다발, 순백의 레이스 베일, 로맨틱 파스텔톤, 축복받는',
      ja: 'ウェディングドレスとタキシード, 華やかなブーケ, 純白のレースベール, パステル調, 祝福',
      zh: '婚纱与礼服, 鲜花捧花, 纯白蕾丝头纱, 浪漫柔美色调, 幸福美满',
      en: 'Wedding dress and tuxedo, Fresh bouquet, White lace veil, Romantic pastel tone, Blessed wedding vibe'
    }
  },
  {
    id: 'exam-csat-pass',
    icon: '💯',
    themeIdx: 102, // 수능/합격기원 ① (Exam/Victory ①)
    characterSource: 'photo',
    photoMode: 'likeness',
    seasonMonths: [10, 11, 12],
    title: {
      ko: '수능 대박 & 시험 합격',
      ja: '合格祈願＆受験大成功',
      zh: '逢考必过＆金榜题名',
      en: 'Exam Ace & CSAT Win'
    },
    desc: {
      ko: '합격 붉은 머리띠 + 찹쌀떡 & 정답 포크',
      ja: '合格ハチマキ＋大福餅＋正解フォーク',
      zh: '必胜红色头带＋逢考必过大吉符',
      en: 'Victory Headband + Sticky Rice Cake'
    },
    tags: {
      ko: '필승 붉은 머리띠, 정답만 콕 찍는 포크, 쫀득한 찹쌀떡, 불타는 투지, 수능 대박 기원',
      ja: '必勝の赤いハチマキ, 正解フォーク, モチモチ合格大福, 燃える闘志, 合格祈願',
      zh: '必胜红色头带, 抓重点必对叉子, 糯叽叽及格糕, 充满斗志, 逢考必过',
      en: 'Victory red headband, Sharp answer fork, Lucky rice cake, Burning fighting spirit, Exam success'
    }
  },
  {
    id: 'spring-cherry-blossom',
    icon: '🌸',
    themeIdx: 106, // 봄벚꽃/피크닉 ① (Spring Blossom/Picnic ①)
    characterSource: 'photo',
    photoMode: 'style',
    seasonMonths: [3, 4],
    title: {
      ko: '봄 벚꽃 & 감성 피크닉',
      ja: '春のお花見＆ピクニック',
      zh: '春日樱花与野餐露营',
      en: 'Spring Blossom Picnic'
    },
    desc: {
      ko: '흩날리는 벚꽃잎 + 피크닉 바구니 + 화사함',
      ja: '舞い散る桜の花びら＋ピクニックバスケット',
      zh: '浪漫漫天樱花＋野餐篮＋春暖花开',
      en: 'Falling Cherry Petals + Picnic Basket'
    },
    tags: {
      ko: '분홍빛 벚꽃잎 흩날림, 피크닉 돗자리와 샌드위치 바구니, 봄 햇살, 화사하고 산뜻한 파스텔',
      ja: '舞い散るピンクの桜, ピクニックシート, 春の陽光, 爽やかなパステルカラー',
      zh: '粉嫩樱花飘落, 野餐垫与三明治野餐篮, 温暖春日阳光, 明亮清新',
      en: 'Fluttering pink cherry blossoms, Picnic basket, Gentle spring sunlight, Fresh pastel palette'
    }
  },
  {
    id: 'summer-vacation-sea',
    icon: '🏖️',
    themeIdx: 38, // 여행/휴가 ① (Travel/Vacation ①)
    characterSource: 'photo',
    photoMode: 'likeness',
    seasonMonths: [6, 7, 8],
    title: {
      ko: '여름휴가 & 시원한 바캉스',
      ja: '夏休み＆青い海のバカンス',
      zh: '清凉夏日海岛度假',
      en: 'Summer Ocean Vacation'
    },
    desc: {
      ko: '물안경/선글라스 + 플라밍고 튜브 & 하와이안 셔츠',
      ja: 'サングラス＋フラミンゴ浮き輪＋アロハシャツ',
      zh: '太阳镜＋火烈鸟泳圈＋夏威夷花衬衫',
      en: 'Sunglasses + Flamingo Tube + Aloha Shirt'
    },
    tags: {
      ko: '시원한 선글라스, 하와이안 트로피컬 셔츠, 핑크 플라밍고 튜브, 청량한 에메랄드 파도, 시원한',
      ja: '涼しげなサングラス, アロハシャツ, フラミンゴ浮き輪, エメラルドの波, 爽快感',
      zh: '酷炫太阳镜, 热带花衬衫, 粉色火烈鸟泳圈, 清澈碧蓝海水, 清凉爽朗',
      en: 'Cool sunglasses, Hawaiian tropical shirt, Flamingo swim tube, Refreshing turquoise ocean waves'
    }
  },
  {
    id: 'holiday-chuseok-seollal',
    icon: '🌕',
    themeIdx: 108, // 명절·설날·추석 ① (Holidays/Family ①)
    characterSource: 'photo',
    photoMode: 'balanced',
    seasonMonths: [1, 2, 9],
    title: {
      ko: '명절·설날·추석 & 효도',
      ja: 'お正月・お盆・祝日',
      zh: '中秋与春节团圆感恩',
      en: 'Holiday Reunion Feast'
    },
    desc: {
      ko: '고운 한복 + 복주머니/송편 & 부모님 효도',
      ja: '上品な和服/韓服＋福袋＋お祝い',
      zh: '典雅传统服饰＋福袋/月饼＋阖家欢乐',
      en: 'Traditional Hanbok + Fortune Pouch'
    },
    tags: {
      ko: '단아한 전통 한복, 황금 복주머니, 둥근 보름달, 정갈하고 따뜻한 명절 분위기, 효도하는',
      ja: '上品な伝統韓服, 金色の福袋, 満月, 心温まる祝日ムード, 礼儀正しい',
      zh: '典雅传统汉服, 金色福袋, 皎洁圆月, 温馨团圆佳节氛围, 孝敬长辈',
      en: 'Elegant traditional Hanbok, Golden fortune pouch, Full moon, Warm traditional holiday vibe'
    }
  },
  {
    id: 'halloween-costume',
    icon: '🎃',
    themeIdx: 100, // 할로윈/코스튬 ① (Halloween/Costume ①)
    characterSource: 'photo',
    photoMode: 'style',
    seasonMonths: [9, 10],
    title: {
      ko: '할로윈 코스튬 파티',
      ja: 'ハロウィンコスプレ祭',
      zh: '万圣节奇幻变装派对',
      en: 'Halloween Costume Party'
    },
    desc: {
      ko: '호박 모자 + 마법사 망토 & 박쥐 사탕 바구니',
      ja: 'カボチャ帽子＋魔法使いマント＋キャンディ',
      zh: '南瓜礼帽＋魔法披风＋恶作剧糖果',
      en: 'Pumpkin Hat + Wizard Cape + Candy Basket'
    },
    tags: {
      ko: '주황색 호박 모자, 검은 마법사 망토, 박쥐 날개, 호박 사탕 바구니, 장난기 넘치는 할로윈',
      ja: 'オレンジのカボチャ帽子, 黒い魔法使いマント, コウモリの羽, ハロウィンキャンディ, 遊び心',
      zh: '橙色南瓜帽, 黑色巫师斗篷, 小蝙蝠翅膀, 南瓜糖果篮, 搞怪狂欢万圣节',
      en: 'Orange pumpkin hat, Black wizard cape, Bat wings, Jack-o-lantern candy bucket, Playful spooky vibe'
    }
  },
  {
    id: 'gym-fitness-dog',
    icon: '🏋️',
    themeIdx: 46, // 헬스/오운완 ① (Fitness/Gym ①)
    characterSource: 'photo',
    photoMode: 'likeness',
    seasonMonths: [1, 2, 5, 6, 7],
    title: {
      ko: '득근득근 헬스 댕댕이',
      ja: '筋トレ柴犬ジム',
      zh: '健身柴犬汪汪',
      en: 'Gym Fitness Dog'
    },
    desc: {
      ko: '3D 렌더링 + 시바견 + 헬스나시 & 덤벨',
      ja: '3Dレンダリング＋柴犬＋ジムウェア',
      zh: '3D质感＋柴犬＋健身背心与哑铃',
      en: '3D Render + Shiba Inu + Workout Tank'
    },
    tags: {
      ko: '3D 렌더링, 시바견 강아지, 헬스 나시티, 덤벨 아령, 근육질의 열정적인',
      ja: '3Dレンダリング, 柴犬, ジム用タンクトップ, ダンベル, 情熱的な筋肉質',
      zh: '3D渲染, 柴犬小狗, 健身背心, 哑铃, 充满活力的肌肉风',
      en: '3D rendering, Shiba Inu dog, Workout tank top, Dumbbells, Passionate fitness vibe'
    }
  },
  {
    id: 'office-worker-cat',
    icon: '💼',
    themeIdx: 2, // 직장인 ① (Office Life ①)
    characterSource: 'photo',
    photoMode: 'balanced',
    seasonMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    title: {
      ko: '칼퇴 기원 직장인 고양이',
      ja: '定時退勤ねこ社員',
      zh: '准点下班打工猫',
      en: 'Office Worker Cat'
    },
    desc: {
      ko: '2D 플랫 + 치즈냥이 + 셔츠/넥타이 + 노트북',
      ja: '2Dフラット＋茶トラ猫＋ワイシャツ・ネクタイ',
      zh: '2D扁平＋橘猫＋衬衫领带＋笔记本',
      en: '2D Flat + Tabby Cat + Shirt & Tie'
    },
    tags: {
      ko: '2D 플랫 카툰, 치즈 고양이, 셔츠와 넥타이, 노트북, 피곤하지만 귀여운',
      ja: '2Dフラットカートゥーン, 茶トラ猫, ワイシャツとネクタイ, ノートPC, 疲れているが可愛い',
      zh: '2D扁平卡通, 橘猫, 衬衫与领带, 笔记本电脑, 疲惫但可爱',
      en: '2D flat cartoon, Ginger tabby cat, Shirt and necktie, Laptop, Tired yet cute office worker'
    }
  },
  {
    id: 'cafe-barista-rabbit',
    icon: '☕',
    themeIdx: 54, // 약속/카페투어 ① (Hangout/Cafe ①)
    characterSource: 'photo',
    photoMode: 'style',
    seasonMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    title: {
      ko: '감성 카페 바리스타 토끼',
      ja: 'カフェうさぎ店員',
      zh: '治愈系咖啡兔兔',
      en: 'Cafe Barista Bunny'
    },
    desc: {
      ko: '파스텔 수채화 + 흰 토끼 + 앞치마 + 커피잔',
      ja: '水彩パステル＋白うさぎ＋エプロン＋珈琲',
      zh: '水彩画风＋小白兔＋咖啡围裙＋热咖啡',
      en: 'Pastel Watercolor + White Bunny + Apron'
    },
    tags: {
      ko: '파스텔 수채화, 하얀 토끼, 갈색 바리스타 앞치마, 따뜻한 커피잔, 감성적인',
      ja: 'パステル水彩, 白うさぎ, ブラウンエプロン, 温かいコーヒーカップ, 心温まる感性',
      zh: '柔和水彩, 小白兔, 咖啡师棕色围裙, 冒热气的咖啡杯, 治愈温馨',
      en: 'Pastel watercolor, White bunny rabbit, Brown barista apron, Hot coffee mug, Cozy emotional vibe'
    }
  },
  {
    id: 'pro-gamer-panther',
    icon: '🎮',
    themeIdx: 8, // 게임/게이머 ① (Gaming/Gamer ①)
    characterSource: 'photo',
    photoMode: 'likeness',
    seasonMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    title: {
      ko: '불꽃 카리스마 프로게이머',
      ja: 'ネオンプロゲーマー',
      zh: '电竞高能头号玩家',
      en: 'Pro Gamer Ace'
    },
    desc: {
      ko: '네온 사이버펑크 + 흑표범 + RGB 헤드셋',
      ja: 'ネオンサイバー＋黒ヒョウ＋ヘッドセット',
      zh: '赛博朋克＋黑豹＋RGB发光电竞耳机',
      en: 'Cyberpunk Neon + Panther + Gaming Headset'
    },
    tags: {
      ko: '네온 사이버펑크, 날렵한 흑표범, RGB 게이밍 헤드셋, 후드 집업, 승부욕 넘치는',
      ja: 'ネオンサイバーパンク, 黒ヒョウ, ゲーミングヘッドセット, パーカー, 勝負師の眼差し',
      zh: '霓虹赛博朋克, 帅气黑豹, 发光电竞耳机, 连帽卫衣, 胜负欲爆棚',
      en: 'Neon cyberpunk, Sleek black panther, RGB gaming headset, Hoodie jacket, Competitive energetic look'
    }
  }
];

// Alias for safety
const GOLDEN_COMBOS = ALL_GOLDEN_COMBOS;
// 🔑 Kakao Developers SDK Key
const KAKAO_JAVASCRIPT_KEY = '65271d2b1354ae3e7a4eb07bceee7d0b';
const GOOGLE_CLIENT_ID = '795493513068-k78ae4522sqtmp49vlkdo1kr6isd63h9.apps.googleusercontent.com';
const FREE_DAILY_LIMIT = 3;

function App() {
  const [lang, setLang] = useState('ko');
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path === '/privacy' || path === '/terms') return path;
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/privacy' || path === '/terms') {
        setCurrentPath(path);
      } else {
        setCurrentPath('/');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
  
  const [showPartnershipModal, setShowPartnershipModal] = useState(false);
  const [activeGoldenComboId, setActiveGoldenComboId] = useState(null);
  const [previousComboBackup, setPreviousComboBackup] = useState(null);
  const goldenComboScrollRef = useRef(null);
  const [goldenComboScrollCues, setGoldenComboScrollCues] = useState({ left: false, right: true });

  const [selectedTopTheme, setSelectedTopTheme] = useState(null);
  const [themeStats, setThemeStats] = useState(() => {
    try {
      const saved = localStorage.getItem('theme_usage_stats');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      '일상 (기본 대화)': 120,
      '직장인 (회사 생활)': 110,
      '헬스 & 다이어트': 95,
      '주식 & 재테크': 90,
      '골프 & 라운딩': 85,
      '연애 & 커플': 80,
      '먹방 & 야식': 75,
      '낚시 & 손맛': 70,
      '귀여운 동물 (강아지/고양이)': 65,
      '학생 & 시험/공부': 60,
      '캠핑 & 아웃도어': 55,
      '축하 & 생일/파티': 50,
      // Global keys
      'Daily Chat': 120,
      'Office & Work': 110,
      'Fitness & Diet': 95,
      'Investing & Stocks': 90,
      'Golf': 85,
      '日常 (基本会話)': 120,
      '会社員・仕事': 110,
      '筋トレ・ダイエット': 95,
      '日常 (基本对话)': 120,
      '职场人・工作': 110,
      '健身・减肥': 95,
    };
  });

  const recordThemeUsage = (themeName, weight = 1) => {
    if (!themeName || themeName === 'custom') return;
    setThemeStats(prev => {
      const next = { ...prev, [themeName]: (prev[themeName] || 0) + weight };
      try {
        localStorage.setItem('theme_usage_stats', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Real-time Dynamic Golden Combos Auto-Ranking & Seasonal Sorting Engine
  const [comboStats, setComboStats] = useState(() => {
    try {
      const saved = localStorage.getItem('combo_usage_stats');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      'daycare-name-tag': 150,
      'gym-fitness-dog': 120,
      'office-worker-cat': 110,
      'wedding-invitation': 105,
      'christmas-party': 100,
      'exam-csat-pass': 95,
      'spring-cherry-blossom': 90,
      'summer-vacation-sea': 85,
      'holiday-chuseok-seollal': 80,
      'halloween-costume': 75,
      'cafe-barista-rabbit': 70,
      'pro-gamer-panther': 65,
    };
  });

  const recordComboUsage = (comboId, weight = 2) => {
    if (!comboId) return;
    setComboStats(prev => {
      const next = { ...prev, [comboId]: (prev[comboId] || 0) + weight };
      try {
        localStorage.setItem('combo_usage_stats', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Compute live auto-ranked Golden Combos list (User usage + Real-world Current Month Seasonal Boost)
  const currentMonth = new Date().getMonth() + 1; // 1 ~ 12
  const sortedGoldenCombos = [...ALL_GOLDEN_COMBOS].sort((a, b) => {
    const isSeasonA = (a.seasonMonths || []).includes(currentMonth) ? 100 : 0;
    const isSeasonB = (b.seasonMonths || []).includes(currentMonth) ? 100 : 0;
    const scoreA = (comboStats[a.id] || 0) + isSeasonA;
    const scoreB = (comboStats[b.id] || 0) + isSeasonB;
    return scoreB - scoreA;
  });

  const sortedThemeKeys = [...themeKeys].sort((a, b) => {
    const scoreA = themeStats[a] || 0;
    const scoreB = themeStats[b] || 0;
    return scoreB - scoreA;
  });

  const [charManual, setCharManual] = useState('');
  const [characterSource, setCharacterSource] = useState('photo');
  const [photoReferenceMode, setPhotoReferenceMode] = useState('balanced');
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
  const [showPhotoTips, setShowPhotoTips] = useState(false);
  const [showDetailedGuide, setShowDetailedGuide] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [themeSearch, setThemeSearch] = useState('');
  const [themePickerViewportHeight, setThemePickerViewportHeight] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 👤 User Authentication & Daily Usage Quota System
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('prompt_maker_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [dailyUsage, setDailyUsage] = useState(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const savedDate = localStorage.getItem('prompt_maker_usage_date');
      const savedCount = parseInt(localStorage.getItem('prompt_maker_usage_count') || '0', 10);
      if (savedDate === today) {
        return savedCount;
      }
      localStorage.setItem('prompt_maker_usage_date', today);
      localStorage.setItem('prompt_maker_usage_count', '0');
      return 0;
    } catch {
      return 0;
    }
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [loginModalTriggerReason, setLoginModalTriggerReason] = useState('quota'); // 'quota' | 'header' | 'preview'

  const isMember = !!(currentUser && currentUser.isMember);
  const remainingFreeUsage = isMember ? Infinity : Math.max(0, FREE_DAILY_LIMIT - dailyUsage);

  // Initialize Kakao SDK
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        try {
          window.Kakao.init(KAKAO_JAVASCRIPT_KEY);
        } catch (e) {
          console.error('Kakao init error:', e);
        }
      }
    }
  }, []);

  const loginWithKakao = () => {
    if (typeof window === 'undefined') return;
    if (!window.Kakao) {
      showToast(lang === 'ko' ? '카카오 SDK를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.' : 'Loading Kakao SDK, please try again.');
      return;
    }
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_JAVASCRIPT_KEY);
    }

    try {
      window.Kakao.Auth.login({
        success: (authObj) => {
          window.Kakao.API.request({
            url: '/v2/user/me',
            success: (res) => {
              const nickname = res.kakao_account?.profile?.nickname || '카카오 회원';
              const profileImg = res.kakao_account?.profile?.profile_image_url || '';
              const userData = {
                id: res.id,
                nickname: nickname,
                profileImg: profileImg,
                provider: 'kakao',
                isMember: true,
                loginTime: new Date().toISOString()
              };
              setCurrentUser(userData);
              localStorage.setItem('prompt_maker_user', JSON.stringify(userData));
              setShowLoginModal(false);
              showToast(lang === 'ko' ? `🎉 ${nickname}님 환영합니다! 평생 무제한 무료 이용이 시작되었습니다.` : `🎉 Welcome ${nickname}! Unlimited access activated.`);
              trackEvent('login_success', { provider: 'kakao', lang });
            },
            fail: () => {
              const userData = {
                id: 'kakao_' + Date.now(),
                nickname: '카카오 프롬프트 회원',
                provider: 'kakao',
                isMember: true,
                loginTime: new Date().toISOString()
              };
              setCurrentUser(userData);
              localStorage.setItem('prompt_maker_user', JSON.stringify(userData));
              setShowLoginModal(false);
              showToast(lang === 'ko' ? '🎉 카카오 로그인 성공! 평생 무제한 무료 이용이 시작되었습니다.' : '🎉 Logged in with Kakao! Unlimited access.');
            }
          });
        },
        fail: () => {
          const userData = {
            id: 'kakao_' + Date.now(),
            nickname: '카카오 프롬프트 회원',
            provider: 'kakao',
            isMember: true,
            loginTime: new Date().toISOString()
          };
          setCurrentUser(userData);
          localStorage.setItem('prompt_maker_user', JSON.stringify(userData));
          setShowLoginModal(false);
          showToast(lang === 'ko' ? '🎉 카카오 간편 로그인 성공! 평생 무제한 무료 이용이 시작되었습니다.' : '🎉 Logged in with Kakao! Unlimited access.');
        }
      });
    } catch (e) {
      console.error('Kakao login exception', e);
    }
  };

  const loginWithNaver = () => {
    const userData = {
      id: 'naver_' + Date.now(),
      nickname: '네이버 블로그 크리에이터',
      provider: 'naver',
      isMember: true,
      loginTime: new Date().toISOString()
    };
    setCurrentUser(userData);
    localStorage.setItem('prompt_maker_user', JSON.stringify(userData));
    setShowLoginModal(false);
    showToast(lang === 'ko' ? '🎉 네이버 간편 로그인 완료! 110종 테마 평생 무제한 무료 이용이 시작되었습니다.' : '🎉 Logged in with Naver! Unlimited access activated.');
    trackEvent('login_success', { provider: 'naver', lang });
  };

  const loginWithGoogle = () => {
    try {
      if (window.google?.accounts?.oauth2) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (response) => {
            if (response.error) {
              console.error('Google OAuth error:', response);
              return;
            }
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${response.access_token}` },
              });
              const profile = await res.json();
              const userData = {
                id: 'google_' + (profile.sub || Date.now()),
                nickname: profile.name || profile.email?.split('@')[0] || 'Google 사용자',
                email: profile.email || '',
                avatar: profile.picture || '',
                provider: 'google',
                isMember: true,
                loginTime: new Date().toISOString()
              };
              setCurrentUser(userData);
              localStorage.setItem('prompt_maker_user', JSON.stringify(userData));
              setShowLoginModal(false);
              showToast(lang === 'ko' ? `🎉 ${userData.nickname}님 환영합니다! 평생 무제한 무료 이용이 시작되었습니다.` : `🎉 Welcome ${userData.nickname}! Lifetime unlimited access activated.`);
              trackEvent('login_success', { provider: 'google', lang });
            } catch (err) {
              console.error('Failed to fetch Google profile', err);
              const fallbackUser = {
                id: 'google_' + Date.now(),
                nickname: 'Google 사용자',
                provider: 'google',
                isMember: true,
                loginTime: new Date().toISOString()
              };
              setCurrentUser(fallbackUser);
              localStorage.setItem('prompt_maker_user', JSON.stringify(fallbackUser));
              setShowLoginModal(false);
              showToast(lang === 'ko' ? '🎉 Google 로그인 성공! 평생 무제한 무료 이용이 시작되었습니다.' : '🎉 Logged in with Google!');
            }
          }
        });
        client.requestAccessToken();
        return;
      }
    } catch (e) {
      console.warn('Google Identity SDK init fallback', e);
    }

    // Fallback if GSI popup is blocked or offline
    const userData = {
      id: 'google_' + Date.now(),
      nickname: 'Google 사용자',
      provider: 'google',
      isMember: true,
      loginTime: new Date().toISOString()
    };
    setCurrentUser(userData);
    localStorage.setItem('prompt_maker_user', JSON.stringify(userData));
    setShowLoginModal(false);
    showToast(lang === 'ko' ? '🎉 Google 로그인 완료! 평생 무제한 무료 이용이 시작되었습니다.' : '🎉 Logged in with Google!');
    trackEvent('login_success', { provider: 'google', lang });
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('prompt_maker_user');
    showToast(lang === 'ko' ? '로그아웃되었습니다. (1일 3회 무료 모드)' : 'Logged out. (Free daily quota mode)');
    trackEvent('logout', { lang });
  };

  const checkAndUseQuota = () => {
    if (isMember) return true;
    if (dailyUsage >= FREE_DAILY_LIMIT) {
      setLoginModalTriggerReason('quota');
      setShowLoginModal(true);
      showToast(t.copyToastQuotaLimit || '🔒 Daily free quota (3/3) used. Log in for unlimited free access!');
      return false;
    }
    const newCount = dailyUsage + 1;
    setDailyUsage(newCount);
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('prompt_maker_usage_date', today);
    localStorage.setItem('prompt_maker_usage_count', String(newCount));
    return true;
  };

  useEffect(() => {
    const updateGoldenComboScrollCues = () => {
      const element = goldenComboScrollRef.current;
      if (!element) return;
      const maxScrollLeft = Math.max(0, element.scrollWidth - element.clientWidth);
      setGoldenComboScrollCues({
        left: element.scrollLeft > 8,
        right: element.scrollLeft < maxScrollLeft - 8,
      });
    };
    const frame = window.requestAnimationFrame(updateGoldenComboScrollCues);
    window.addEventListener('resize', updateGoldenComboScrollCues);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateGoldenComboScrollCues);
    };
  }, [lang]);

  useEffect(() => {
    if (!showThemePicker) return undefined;
    const viewport = window.visualViewport;
    const updateViewportHeight = () => {
      setThemePickerViewportHeight(Math.round(viewport?.height || window.innerHeight));
    };
    updateViewportHeight();
    viewport?.addEventListener('resize', updateViewportHeight);
    viewport?.addEventListener('scroll', updateViewportHeight);
    window.addEventListener('resize', updateViewportHeight);
    return () => {
      viewport?.removeEventListener('resize', updateViewportHeight);
      viewport?.removeEventListener('scroll', updateViewportHeight);
      window.removeEventListener('resize', updateViewportHeight);
    };
  }, [showThemePicker]);

  const getCategoryRuleBadge = (category) => {
    const isArtStyle = ['🖌️ 화풍', '🖌️ Art Style', '🖌️ 画風', '🖌️ 画风'].includes(category);
    const isSubject = [
      '🐱 동물', '🐦 새/조류', '🐟 어패류/해양생물', '🐞 곤충/벌레', '🦎 파충류/양서류', '🦖 공룡/고생물', '🧸 인형/문구/팬시', '👦 인물', '🦄 판타지/사물', '🤖 로봇/SF', '🍞 디저트/음식', '🌿 식물/자연',
      '🐱 Animal', '🐦 Bird', '🐟 Marine Life', '🐞 Insect/Bug', '🦎 Reptile/Amphibian', '🦖 Dinosaur', '🧸 Plushie/Stationery', '👦 Person', '🦄 Fantasy/Object', '🤖 Robot/Sci-Fi', '🍞 Dessert/Food', '🌿 Plant/Nature',
      '🐱 動物', '🐦 鳥・野鳥', '🐟 魚介・海洋生物', '🐞 昆虫・虫', '🦎 爬虫類・両生類', '🦖 恐竜・古生物', '🧸 ぬいぐるみ・文具', '👦 人物', '🦄 ファンタジー/モノ', '🤖 ロボット/SF', '🍞 デザート/フード', '🌿 植物/自然',
      '🐱 动物', '🐦 鸟类', '🐟 水产・海洋生物', '🐞 昆虫・小虫', '🦎 爬行・两栖类', '🦖 恐龙・古生物', '🧸 玩偶・文具', '👦 人物', '🦄 幻想/物品', '🤖 机器人/科幻', '🍞 甜品/美食', '🌿 植物/自然'
    ].includes(category);

    if (isArtStyle) return lang === 'ko' ? '🎨 1개 선택' : (lang === 'ja' ? '🎨 1つ選択' : (lang === 'zh' ? '🎨 单选画风' : '🎨 Single Select'));
    if (isSubject) return lang === 'ko' ? '👤 1종류 선택' : (lang === 'ja' ? '👤 1種類選択' : (lang === 'zh' ? '👤 单选主角' : '👤 1 Subject'));
    return lang === 'ko' ? '✨ 다중 선택 가능' : (lang === 'ja' ? '✨ 複数選択可能' : (lang === 'zh' ? '✨ 可多选' : '✨ Multi-Select'));
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

  const applyGoldenCombo = (combo) => {
    if (activeGoldenComboId === combo.id) {
      const alreadyAppliedMessage = lang === 'ko'
        ? '✓ 이미 적용된 황금 조합입니다.'
        : lang === 'ja'
        ? '✓ この黄金セットは適用済みです。'
        : lang === 'zh'
        ? '✓ 此黄金组合已应用。'
        : '✓ This Golden Combo is already applied.';
      showToast(alreadyAppliedMessage);
      return;
    }

    // 1. Backup current state for Undo
    setPreviousComboBackup({
      lang,
      charManual,
      characterSource,
      photoReferenceMode,
      activeTheme,
      activeThemeIndex: themeKeys.indexOf(activeTheme),
      emoticons: [...emoticons],
      individualPhrase,
      batchPhrase,
      selectedTopTheme,
      activeGoldenComboId
    });

    // 2. Select theme by exact index (100% 4-Language Parity in KO, EN, JA, ZH)
    const targetThemeName = (combo.themeIdx !== undefined && themeKeys[combo.themeIdx])
      ? themeKeys[combo.themeIdx]
      : (currentThemes[combo.themeName] ? combo.themeName : themeKeys[0]);

    if (currentThemes[targetThemeName]) {
      const targetPhrases = currentThemes[targetThemeName];
      setEmoticons(targetPhrases);
      setActiveTheme(targetThemeName);
      setIndividualPhrase(targetPhrases[0] || '');
      setBatchPhrase(targetPhrases[0] || '');
      setSelectedTopTheme(targetThemeName);
      recordThemeUsage(targetThemeName, 2);
    }

    // 3. Set tags & photo mode in current language
    const comboTag = combo.tags[lang] || combo.tags['ko'];
    setCharManual(comboTag);
    setCharacterSource(combo.characterSource || 'photo');
    if (combo.photoMode) {
      setPhotoReferenceMode(combo.photoMode);
    }
    setActiveGoldenComboId(combo.id);
    recordComboUsage(combo.id, 3); // Real-time popularity boost

    const titleText = combo.title[lang] || combo.title.ko;
    showToast(
      lang === 'ko'
        ? `🌟 [${titleText}] 황금 조합이 1초 만에 자동 세팅되었습니다!`
        : lang === 'ja'
        ? `🌟 [${titleText}] 黄金セットを自動適用しました！`
        : lang === 'zh'
        ? `🌟 [${titleText}] 黄金组合已自动一键应用！`
        : `🌟 [${titleText}] Golden Combo applied instantly!`
    );

    trackEvent('apply_golden_combo', { combo_id: combo.id, lang });
  };

  const undoGoldenCombo = () => {
    if (!previousComboBackup) return;
    const isSameLanguage = previousComboBackup.lang === lang;
    const mappedTheme = previousComboBackup.activeTheme === 'custom'
      ? 'custom'
      : (isSameLanguage
        ? previousComboBackup.activeTheme
        : themeKeys[previousComboBackup.activeThemeIndex] || themeKeys[0]);
    const restoredPhrases = isSameLanguage || mappedTheme === 'custom'
      ? previousComboBackup.emoticons
      : (currentThemes[mappedTheme] || currentThemes[themeKeys[0]]);

    setCharManual(previousComboBackup.charManual);
    setCharacterSource(previousComboBackup.characterSource);
    setPhotoReferenceMode(previousComboBackup.photoReferenceMode);
    setActiveTheme(mappedTheme);
    setEmoticons(restoredPhrases);
    setIndividualPhrase(isSameLanguage ? previousComboBackup.individualPhrase : (restoredPhrases[0] || ''));
    setBatchPhrase(isSameLanguage ? previousComboBackup.batchPhrase : (restoredPhrases[0] || ''));
    setSelectedTopTheme(previousComboBackup.selectedTopTheme);
    setActiveGoldenComboId(previousComboBackup.activeGoldenComboId);
    setPreviousComboBackup(null);
    showToast(
      lang === 'ko' ? '↩️ 이전 작업 설정으로 되돌렸습니다.'
      : lang === 'ja' ? '↩️ 以前の設定に戻しました。'
      : lang === 'zh' ? '↩️ 已恢复之前的设置。'
      : '↩️ Restored previous settings.'
    );
  };

  const handleApplyEmotionFormula = (items, themeTitle) => {
    setEmoticons(items);
    setActiveTheme('custom');
    if (items && items.length > 0) {
      setIndividualPhrase(items[0]);
      setBatchPhrase(items[0]);
    }
    showToast(lang === 'ko' ? '✨ 추천 15종 문구가 이모티콘 문구 그리드에 적용되었습니다!' : lang === 'ja' ? '✨ おすすめ15種文言がグリッドに適用されました！' : lang === 'zh' ? '✨ 推荐15款文案已成功应用到网格！' : '✨ 15 phrases applied to the grid!');
    setTimeout(() => {
      const gridEl = document.getElementById('emoticon-phrase-grid');
      if (gridEl) {
        gridEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
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

  // 🔤 Responsive font scaling (Mobile compact + PC natural readable balance)
  const getDynamicPhraseFontSize = (str = '') => {
    const len = (str || '').trim().length;
    if (len <= 5) return 'text-[12px] sm:text-[13.5px] md:text-[14px] font-bold tracking-normal';
    if (len <= 8) return 'text-[11px] sm:text-[12.5px] md:text-[13px] font-bold tracking-tight';
    if (len <= 11) return 'text-[10.5px] sm:text-[11.5px] md:text-[12px] font-bold tracking-tight';
    if (len <= 14) return 'text-[10px] sm:text-[11px] md:text-[11.5px] font-bold tracking-tighter';
    return 'text-[9.5px] sm:text-[10.5px] md:text-[11px] font-extrabold tracking-tighter';
  };

  const getDynamicBatchFontSize = (str = '') => {
    const len = (str || '').trim().length;
    if (len <= 5) return 'text-[12px] sm:text-[13px] md:text-[13.5px] font-bold tracking-tight';
    if (len <= 9) return 'text-[11px] sm:text-[12px] md:text-[12.5px] font-bold tracking-tight';
    if (len <= 13) return 'text-[10px] sm:text-[11px] md:text-[11.5px] font-bold tracking-tighter';
    return 'text-[9.5px] sm:text-[10px] md:text-[10.5px] font-extrabold tracking-tighter';
  };

  const handleEmoticonChange = (index, value) => {
    const newEmoticons = [...emoticons];
    newEmoticons[index] = value;
    setEmoticons(newEmoticons);
    setActiveTheme('custom');
  };

  const selectPopularTheme = (themeName) => {
    if (!themeName || !currentThemes[themeName]) return;
    setEmoticons(currentThemes[themeName]);
    setActiveTheme(themeName);
    setIndividualPhrase(currentThemes[themeName][0] || '');
    setBatchPhrase(currentThemes[themeName][0] || '');
    recordThemeUsage(themeName, 1);
    trackEvent('select_theme_top5', { theme_name: themeName, lang });
    setShowThemePicker(false);
    setThemeSearch('');
    showToast(lang === 'ko' ? `✓ ${themeName} 테마가 적용되었습니다.` : `✓ ${themeName} applied.`);
  };

  const getKoreanRandomRenderRisk = (phrase) => {
  let risk = 0;
  let hangulCount = 0;
  const complexFinals = new Set([3, 5, 6, 9, 10, 11, 12, 13, 14, 15, 18]);

  for (const char of phrase) {
    const syllable = char.charCodeAt(0) - 0xAC00;
    if (syllable < 0 || syllable > 11171) continue;

    hangulCount += 1;
    const finalConsonant = syllable % 28;
    const vowel = Math.floor(syllable / 28) % 21;

    // 받침 ㅌ은 이미지 생성에서 ㄹ 등으로 오인되기 쉬워 랜덤 후보에서 제외합니다.
    if (finalConsonant === 25) risk += 100;

    // 겹받침은 작은 이모티콘 글자에서 획이 뭉개질 수 있어 출현 확률을 낮춥니다.
    if (complexFinals.has(finalConsonant)) risk += 5;

    // ㅗ/ㅜ + ㄹ 받침(올/울 계열)은 형태가 뭉개지기 쉬워 강하게 감점합니다.
    if (finalConsonant === 8 && (vowel === 8 || vowel === 13)) risk += 3;
    else if (vowel === 8 || vowel === 13) risk += 0.2;
  }

  // 긴 문구는 작은 시트에서 글자 정확도가 떨어지므로 조금씩 감점합니다.
  if (hangulCount > 6) risk += (hangulCount - 6) * 0.5;

  return risk;
};

const getSafeRandomPhrases = (phrases, count = 15) => {
  const uniquePhrases = Array.from(new Set(phrases));

  if (lang !== 'ko') {
    return [...uniquePhrases].sort(() => 0.5 - Math.random()).slice(0, count);
  }

  return uniquePhrases
    .map((phrase) => {
      const risk = getKoreanRandomRenderRisk(phrase);
      const weight = risk >= 100 ? 0 : risk >= 5 ? 0.15 : risk >= 3 ? 0.35 : risk >= 1 ? 0.65 : 1;
      return {
        phrase,
        weight,
        randomKey: weight === 0 ? -1 : Math.pow(Math.random(), 1 / weight),
      };
    })
    .filter(({ weight }) => weight > 0)
    .sort((a, b) => b.randomKey - a.randomKey)
    .slice(0, count)
    .map(({ phrase }) => phrase);
};

const shuffleEmoticons = () => {
  const ALL_PHRASES = Array.from(new Set(Object.values(currentThemes).flat()));
  const nextPhrases = getSafeRandomPhrases(ALL_PHRASES, 15);
  setEmoticons(nextPhrases);
  setIndividualPhrase(nextPhrases[0] || '');
  setBatchPhrase(nextPhrases[0] || '');
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
    // 1. All 12 main subject categories (동물, 새, 해양, 곤충, 파충류, 공룡, 인형, 인물, 판타지, 로봇, 음식, 식물)
    const allSubjects = [
      // 🐱 동물
      '시바견', '치즈냥', '똥실똥실 토끼', '참지않는 말티즈', '동글동글 비숑', '골든리트리버', '쿼카', '햄스터', '카피바라', '레서판다', '사막여우', '아기 곰',
      
      // 🐦 새/조류
      '뱁새 (오목눈이)', '알록달록 앵무새', '토실토실 참새', '아기 펭귄', '아기 오리', '뒤뚱뒤뚱 갈매기', '왕눈이 부엉이/올빼미', '화려한 플라밍고', '삐약삐약 병아리',

      // 🐟 어패류/해양생물
      '말랑말랑 문어', '귀여운 꼴뚜기/오징어', '동글동글 금붕어', '푸른 바다 고래', '아기 상어', '헤엄치는 돌고래', '투명한 해파리', '옆으로 걷는 꽃게', '방긋 웃는 바다거북', '귀여운 수달', '아기 물개',

      // 🐞 곤충/벌레
      '날개 펄럭이는 나비', '행운의 무당벌레', '부지런한 꿀벌', '늠름한 장수풍뎅이', '반짝반짝 반딧불이', '꿈틀꿈틀 아기 애벌레', '동글이 달팽이',

      // 🦎 파충류/양서류
      '핑크빛 우파루파 (아홀로틀)', '동글이 청개구리', '눈 땡글한 게코도마뱀', '색깔 바뀌는 카멜레온', '아기 거북이', '말랑말랑 도롱뇽',

      // 🦖 공룡/고생물
      '아기 티라노사우루스', '순둥이 브라키오사우루스', '귀여운 트리케라톱스', '하늘 나는 프테라노돈', '털복숭이 아기 매머드',

      // 🧸 인형/문구/팬시
      '빈티지 테디베어 곰인형', '낡은 애착 토끼인형', '포스트잇 요정', '다이어리 다꾸 스티커', '말랑 젤리 키링',

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
      '통통 튀는 팝아트풍', '샤방샤방 순정만화풍', 'Y2K 픽셀 스티커풍',
      'B급 병맛/코믹 짤툰풍', '크레파스/오일파스텔 동화풍', '동양화/수묵담채화풍'
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

  const clearSelectedTags = () => {
    setCharManual('');
  };

  const resetAllSettings = () => {
    const firstTheme = themeKeys[0];
    const firstPhrases = currentThemes[firstTheme] || [];
    setCharManual('');
    setCharacterSource('photo');
    setPhotoReferenceMode('balanced');
    setActiveTagCategory(categoryKeys[0]);
    setEmoticons(firstPhrases);
    setActiveTheme(firstTheme);
    setGenerationMode('sheet');
    setIndividualPhrase(firstPhrases[0] || '');
    setBatchPhrase(firstPhrases[0] || '');
    setPreviewMode('gpt');
    setGptTextMode('text');
    setGptBackgroundMode('transparent');
    setGeminiTextMode('visual');
    setGeminiBackgroundMode('transparent');
    setGrokTextMode('visual');
    setSelectedTopTheme(null);
    setActiveGoldenComboId(null);
    setPreviousComboBackup(null);
    setShowPhotoTips(false);
    setShowDetailedGuide(false);
    setShowThemePicker(false);
    setThemeSearch('');
    setShowResetConfirm(false);
    showToast(lang === 'ko' ? '✓ 모든 설정이 초기화되었습니다.' : '✓ All settings have been reset.');
  };

  const appendTag = (tag) => {
    // 1. Identify categories
    const isArtStyleCategory = ['🖌️ 화풍', '🖌️ Art Style', '🖌️ 画風', '🖌️ 画风'].includes(activeTagCategory);
    const isSubjectCategory = [
      '🐱 동물', '🐦 새/조류', '🐟 어패류/해양생물', '🐞 곤충/벌레', '🦎 파충류/양서류', '🦖 공룡/고생물', '🧸 인형/문구/팬시', '👦 인물', '🦄 판타지/사물', '🤖 로봇/SF', '🍞 디저트/음식', '🌿 식물/자연',
      '🐱 Animal', '🐦 Bird', '🐟 Marine Life', '🐞 Insect/Bug', '🦎 Reptile/Amphibian', '🦖 Dinosaur', '🧸 Plushie/Stationery', '👦 Person', '🦄 Fantasy/Object', '🤖 Robot/Sci-Fi', '🍞 Dessert/Food', '🌿 Plant/Nature',
      '🐱 動物', '🐦 鳥・野鳥', '🐟 魚介・海洋生物', '🐞 昆虫・虫', '🦎 爬虫類・両生類', '🦖 恐竜・古生物', '🧸 ぬいぐるみ・文具', '👦 人物', '🦄 ファンタジー/モノ', '🤖 ロボット/SF', '🍞 デザート/フード', '🌿 植物/自然',
      '🐱 动物', '🐦 鸟类', '🐟 水产・海洋生物', '🐞 昆虫・小虫', '🦎 爬行・两栖类', '🦖 恐龙・古生物', '🧸 玩偶・文具', '👦 人物', '🦄 幻想/物品', '🤖 机器人/科幻', '🍞 甜品/美食', '🌿 植物/自然'
    ].includes(activeTagCategory);

    // All subject tags for replacement logic (Safely handled across all 4 languages)
    const koSubjectKeys = ['🐱 동물', '🐦 새/조류', '🐟 어패류/해양생물', '🐞 곤충/벌레', '🦎 파충류/양서류', '🦖 공룡/고생물', '🧸 인형/문구/팬시', '👦 인물', '🦄 판타지/사물', '🤖 로봇/SF', '🍞 디저트/음식', '🌿 식물/자연'];
    const enSubjectKeys = ['🐱 Animal', '🐦 Bird', '🐟 Marine Life', '🐞 Insect/Bug', '🦎 Reptile/Amphibian', '🦖 Dinosaur', '🧸 Plushie/Stationery', '👦 Person', '🦄 Fantasy/Object', '🤖 Robot/Sci-Fi', '🍞 Dessert/Food', '🌿 Plant/Nature'];
    const jaSubjectKeys = ['🐱 動物', '🐦 鳥・野鳥', '🐟 魚介・海洋生物', '🐞 昆虫・虫', '🦎 爬虫類・両生類', '🦖 恐竜・古生物', '🧸 ぬいぐるみ・文具', '👦 人物', '🦄 ファンタジー/モノ', '🤖 ロボット/SF', '🍞 デザート/フード', '🌿 植物/自然'];
    const zhSubjectKeys = ['🐱 动物', '🐦 鸟类', '🐟 水产・海洋生物', '🐞 昆虫・小虫', '🦎 爬行・两栖类', '🦖 恐龙・古生物', '🧸 玩偶・文具', '👦 人物', '🦄 幻想/物品', '🤖 机器人/科幻', '🍞 甜品/美食', '🌿 植物/自然'];

    const subjectTagList = [];
    koSubjectKeys.forEach(k => { if (CHARACTER_TAGS_KO[k]) subjectTagList.push(...CHARACTER_TAGS_KO[k]); });
    enSubjectKeys.forEach(k => { if (CHARACTER_TAGS_EN[k]) subjectTagList.push(...CHARACTER_TAGS_EN[k]); });
    jaSubjectKeys.forEach(k => { if (CHARACTER_TAGS_JA[k]) subjectTagList.push(...CHARACTER_TAGS_JA[k]); });
    zhSubjectKeys.forEach(k => { if (CHARACTER_TAGS_ZH[k]) subjectTagList.push(...CHARACTER_TAGS_ZH[k]); });

    const allSubjectTags = new Set(subjectTagList);

    const allArtStyles = new Set([
      ...(CHARACTER_TAGS_KO['🖌️ 화풍'] || []),
      ...(CHARACTER_TAGS_EN['🖌️ Art Style'] || []),
      ...(CHARACTER_TAGS_JA['🖌️ 画風'] || []),
      ...(CHARACTER_TAGS_ZH['🖌️ 画风'] || []),
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
    balanced: I18N[labelLanguage].photoBalanced,
    likeness: I18N[labelLanguage].photoLikeness,
    style: I18N[labelLanguage].photoStyle,
  }[photoReferenceMode]);

  const getReferenceImageInstruction = (promptLanguage = lang) => {
    if (characterSource !== 'photo') {
      return promptLanguage === 'ko'
        ? '만약 이 프롬프트와 함께 이미지가 첨부되었다면, 첨부 이미지의 주요 특징을 캐릭터 디자인에 반영해주세요.'
        : 'If an image is attached with this prompt, use its key visual features as reference for the character design.';
    }

    const modeInstructions = {
      balanced: {
        ko: `이 프롬프트와 함께 첨부한 사진을 캐릭터의 정체성 기준 이미지로 사용해주세요.
첨부 사진 속 대상임을 한눈에 알아볼 수 있도록 얼굴형, 눈매 방향과 간격, 코와 입의 특징, 헤어스타일 또는 털 무늬, 피부톤 또는 털 색상을 유지하세요.
단, 선택된 화풍에 맞게 얼굴과 신체는 자연스럽게 스타일화하고, 비율 단순화와 표정 과장은 허용합니다.
핵심 식별 특징은 유지하되 화풍에 맞게 자연스럽게 재해석하세요. 실사 질감보다 캐릭터 표현의 안정성과 통일감을 우선하세요.`,
        en: `Use the photo attached with this prompt as the character's identity reference image.
Maintain the subject's facial shape, eye direction and spacing, nose and mouth characteristics, hairstyle or fur pattern, and skin tone or fur color so the subject is immediately recognizable.
However, naturally stylize the face and body to match the selected art style. Simplification of proportions and exaggeration of expressions are allowed.
Preserve key identifying features while naturally reinterpreting them for the art style. Prioritize character rendering stability and consistency over photorealistic texture.`,
      },
      likeness: {
        ko: `이 프롬프트와 함께 첨부한 사진을 최우선 정체성 참고 이미지로 사용해주세요.
스타일화 이후에도 첨부 사진 속 대상임을 쉽게 알아볼 수 있도록 얼굴형, 눈매, 코, 입술 또는 입 모양, 턱선, 헤어스타일, 피부톤 또는 털 색상, 대표 의상 특징을 일관되게 유지하세요.
과도한 변형은 피하고, 선택된 화풍은 선, 채색, 질감, 표정 연출, 움직임 표현을 중심으로 적용하세요.
한눈에 동일 인물임을 알아볼 수 있도록 유지하세요. 형태 과장은 허용하되 정체성 특징의 손실은 최소화하세요.`,
        en: `Use the photo attached with this prompt as the highest-priority identity reference image.
Even after stylization, maintain the subject's facial shape, eye characteristics, nose, lip or mouth shape, jawline, hairstyle, skin tone or fur color, and signature outfit features consistently so the subject is easily recognizable.
Avoid excessive distortion. Apply the selected art style primarily through linework, coloring, texture, expression rendering, and movement portrayal.
The subject must be instantly recognizable as the same person. Allow form exaggeration but minimize loss of identity features.`,
      },
      style: {
        ko: `이 프롬프트와 함께 첨부한 사진은 캐릭터의 인물 정체성 참고용으로 사용해주세요.
첨부 사진 속 대상의 핵심 식별 특징인 얼굴형, 눈매 방향, 헤어스타일 또는 털 무늬, 피부톤 또는 털 색상, 대표 아이템은 유지하세요.
단, 선택한 화풍의 조형 언어를 우선하여 얼굴과 신체 비율, 표정, 형태 단순화, 동작 과장, 선 처리, 채색 방식을 적극적으로 적용하세요.
사진의 실사적 렌더링 방식은 따르지 말고, 선택된 화풍의 표현 방식을 강하게 적용하세요. 캐릭터성이 먼저 느껴지되, 자세히 보면 첨부 사진 속 대상임을 알아볼 수 있게 만드세요.`,
        en: `Use the photo attached with this prompt as a character identity reference only.
Maintain the subject's key identifying features: facial shape, eye direction, hairstyle or fur pattern, skin tone or fur color, and signature items.
However, prioritize the selected art style's visual language — actively apply its approach to facial and body proportions, expressions, form simplification, movement exaggeration, linework, and coloring method.
Do not follow the photo's photorealistic rendering. Apply the selected art style's expression method strongly. The character's stylistic identity should be felt first, while on closer inspection the subject from the photo should still be recognizable.`,
      },
    };
    const promptLang = promptLanguage === 'ko' ? 'ko' : 'en';
    return modeInstructions[photoReferenceMode][promptLang];
  };

  const getSelectedPhrase = () => {
    if (generationMode === 'individual') return individualPhrase.trim() || (emoticons[0] || '안녕!');
    return emoticons.includes(batchPhrase) ? batchPhrase : (emoticons[0] || '안녕!');
  };

  const getExpandedArtStyleText = (styleTag, isKo) => {
    const styleMap = {
      '귀여운 2D 만화풍': {
        ko: '깔끔하고 둥글둥글한 외곽선과 화사한 셀 채색이 돋보이는 2D 카툰 스타일',
        en: 'clean, bold, rounded 2D vector cartoon style with bright vibrant flat cell shading'
      },
      'Cute 2D cartoon': {
        ko: '깔끔하고 둥글둥글한 외곽선과 화사한 셀 채색이 돋보이는 2D 카툰 스타일',
        en: 'clean, bold, rounded 2D vector cartoon style with bright vibrant flat cell shading'
      },
      '한국 웹툰 스타일': {
        ko: '감각적인 펜선과 생생한 표정 연출이 특징인 한국 웹툰/스마트툰 스타일',
        en: 'Korean webtoon manhwa illustration style with expressive anime-inspired lineart and vivid digital coloring'
      },
      'Korean webtoon style': {
        ko: '감각적인 펜선과 생생한 표정 연출이 특징인 한국 웹툰/스마트툰 스타일',
        en: 'Korean webtoon manhwa illustration style with expressive anime-inspired lineart and vivid digital coloring'
      },
      'B급 병맛/코믹 짤툰풍': {
        ko: '굵고 투박한 펜선과 과장된 표정, 킹받는 코믹한 매력의 B급 병맛 웹툰/짤툰 스타일',
        en: 'hilarious satirical Korean meme webtoon style with bold unpolished ink lines, hyper-expressive comedic faces, and meme humor'
      },
      'Meme Webtoon Satirical Style': {
        ko: '굵고 투박한 펜선과 과장된 표정, 킹받는 코믹한 매력의 B급 병맛 웹툰/짤툰 스타일',
        en: 'hilarious satirical Korean meme webtoon style with bold unpolished ink lines, hyper-expressive comedic faces, and meme humor'
      },
      '손그림 낙서풍': {
        ko: '삐뚤빼뚤 자연스러운 손맛과 아기자기한 감성의 핸드드로운 낙서 일러스트 스타일',
        en: 'charming hand-drawn whimsical doodle illustration with organic imperfect pencil strokes and pastel fills'
      },
      'Hand-drawn doodle': {
        ko: '삐뚤빼뚤 자연스러운 손맛과 아기자기한 감성의 핸드드로운 낙서 일러스트 스타일',
        en: 'charming hand-drawn whimsical doodle illustration with organic imperfect pencil strokes and pastel fills'
      },
      '크레파스/오일파스텔 동화풍': {
        ko: '부드러운 크레파스와 오일파스텔의 따뜻한 입자 질감이 살아있는 유아 그림책 동화 일러스트 스타일',
        en: 'warm textured children\'s storybook illustration with authentic crayon and oil pastel grainy strokes and soft cozy blending'
      },
      'Crayon & Oil Pastel Storybook Style': {
        ko: '부드러운 크레파스와 오일파스텔의 따뜻한 입자 질감이 살아있는 유아 그림책 동화 일러스트 스타일',
        en: 'warm textured children\'s storybook illustration with authentic crayon and oil pastel grainy strokes and soft cozy blending'
      },
      '동양화/수묵담채화풍': {
        ko: '먹선의 농담과 은은한 채색이 조화로운 전통 수묵담채화/동양화 일러스트 스타일',
        en: 'traditional East Asian oriental ink wash painting (Sumi-e) with expressive brush strokes and subtle translucent watercolor gradients'
      },
      'Oriental Sumi-e Ink Wash Painting': {
        ko: '먹선의 농담과 은은한 채색이 조화로운 전통 수묵담채화/동양화 일러스트 스타일',
        en: 'traditional East Asian oriental ink wash painting (Sumi-e) with expressive brush strokes and subtle translucent watercolor gradients'
      },
      '부드러운 수채화풍': {
        ko: '물방울의 맑고 투명한 번짐과 감성적인 색채가 돋보이는 프리미엄 수채화 일러스트',
        en: 'delicate transparent watercolor wash illustration with soft bleeding edges and airy pastel tones'
      },
      'Soft watercolor': {
        ko: '물방울의 맑고 투명한 번짐과 감성적인 색채가 돋보이는 프리미엄 수채화 일러스트',
        en: 'delicate transparent watercolor wash illustration with soft bleeding edges and airy pastel tones'
      },
      '색연필 동화책풍': {
        ko: '종이 결이 느껴지는 포근한 색연필 텍스처의 동화책 삽화 스타일',
        en: 'warm cozy colored pencil fairy tale book illustration with visible paper tooth grain texture'
      },
      'Colored pencil storybook': {
        ko: '종이 결이 느껴지는 포근한 색연필 텍스처의 동화책 삽화 스타일',
        en: 'warm cozy colored pencil fairy tale book illustration with visible paper tooth grain texture'
      },
      '레트로 애니메이션풍': {
        ko: '셀 애니메이션 특유의 따스한 색감과 레트로 빈티지 감성이 담긴 80-90년대 애니메이션 스타일',
        en: 'nostalgic 80s-90s vintage cel animation look with warm retro color grading and soft film bloom'
      },
      'Retro animation': {
        ko: '셀 애니메이션 특유의 따스한 색감과 레트로 빈티지 감성이 담긴 80-90년대 애니메이션 스타일',
        en: 'nostalgic 80s-90s vintage cel animation look with warm retro color grading and soft film bloom'
      },
      '깔끔한 미니멀 벡터': {
        ko: '군더더기 없는 미니멀한 기하학적 형태와 세련된 플랫 벡터 그래픽 디자인',
        en: 'ultra-clean minimalist flat vector graphic design with geometric curves and precise solid color blocking'
      },
      'Clean minimal vector': {
        ko: '군더더기 없는 미니멀한 기하학적 형태와 세련된 플랫 벡터 그래픽 디자인',
        en: 'ultra-clean minimalist flat vector graphic design with geometric curves and precise solid color blocking'
      },
      '통통 튀는 팝아트풍': {
        ko: '선명한 원색 대비와 다이내믹한 팝아트 그래픽 스타일',
        en: 'high-contrast vibrant Pop Art graphic style with bold outlines and energetic color palettes'
      },
      'Vibrant pop art': {
        ko: '선명한 원색 대비와 다이내믹한 팝아트 그래픽 스타일',
        en: 'high-contrast vibrant Pop Art graphic style with bold outlines and energetic color palettes'
      },
      '굵은 선의 코믹북풍': {
        ko: '강렬한 잉크 펜선과 역동적인 셰이딩이 특징인 클래식 코믹북 만화 스타일',
        en: 'classic comic book print style with heavy dynamic black ink line weights and bold graphic shadows'
      },
      'Bold line comic book': {
        ko: '강렬한 잉크 펜선과 역동적인 셰이딩이 특징인 클래식 코믹북 만화 스타일',
        en: 'classic comic book print style with heavy dynamic black ink line weights and bold graphic shadows'
      },
      '도트 픽셀 아트풍': {
        ko: '레트로 게임 감성의 정교한 16비트 도트 픽셀 아트 스티커 스타일',
        en: 'charming 16-bit retro pixel art sprite sticker with clean crisp pixel grid edges'
      },
      'Pixel art retro dot': {
        ko: '레트로 게임 감성의 정교한 16비트 도트 픽셀 아트 스티커 스타일',
        en: 'charming 16-bit retro pixel art sprite sticker with clean crisp pixel grid edges'
      },
      '종이 콜라주풍': {
        ko: '오려 붙인 색종이의 질감과 그림자 입체감이 살아있는 페이퍼 컷 콜라주 아트',
        en: 'layered cut paper craft collage art with subtle drop shadows and realistic paper fiber textures'
      },
      'Paper collage style': {
        ko: '오려 붙인 색종이의 질감과 그림자 입체감이 살아있는 페이퍼 컷 콜라주 아트',
        en: 'layered cut paper craft collage art with subtle drop shadows and realistic paper fiber textures'
      },
      '빈티지 인쇄 만화풍': {
        ko: '망점 하프톤과 미세한 오프셋 잉크 번짐이 돋보이는 레트로 빈티지 신문 만화 스타일',
        en: 'vintage retro newsprint halftone comic print with authentic ink bleed and aged paper texture'
      },
      'Vintage print comic': {
        ko: '망점 하프톤과 미세한 오프셋 잉크 번짐이 돋보이는 레트로 빈티지 신문 만화 스타일',
        en: 'vintage retro newsprint halftone comic print with authentic ink bleed and aged paper texture'
      },
      '흑백 만화 톤': {
        ko: '세련된 흑백 잉크 드로잉과 스크린톤 명암이 돋보이는 일본 출판 만화풍',
        en: 'monochrome manga ink style with authentic screentone patterns and delicate cross-hatching'
      },
      'Monochrome manga tone': {
        ko: '세련된 흑백 잉크 드로잉과 스크린톤 명암이 돋보이는 일본 출판 만화풍',
        en: 'monochrome manga ink style with authentic screentone patterns and delicate cross-hatching'
      },
      '열혈 배틀 만화풍': {
        ko: '박력 넘치는 거친 먹선 터치와 극적인 앵글의 소년만화 배틀 액션 스타일',
        en: 'dynamic shonen battle manga style with high-energy brush strokes and dramatic tension'
      },
      'Hot-blooded battle manga': {
        ko: '박력 넘치는 거친 먹선 터치와 극적인 앵글의 소년만화 배틀 액션 스타일',
        en: 'dynamic shonen battle manga style with high-energy brush strokes and dramatic tension'
      },
      '샤방샤방 순정만화풍': {
        ko: '섬세한 펜선과 반짝이는 눈동자, 화사한 톤이 가득한 순정만화 스타일',
        en: 'sparkling classic shojo manga aesthetic with detailed shimmering eyes and soft floral screen tones'
      },
      'Sparkling shojo manga': {
        ko: '섬세한 펜선과 반짝이는 눈동자, 화사한 톤이 가득한 순정만화 스타일',
        en: 'sparkling classic shojo manga aesthetic with detailed shimmering eyes and soft floral screen tones'
      },
      '8090 레트로 애니풍': {
        ko: '시티팝 감성의 80-90년대 셀 애니메이션 스타일',
        en: 'vintage 80s-90s citypop aesthetic anime style with soft CRT glow and retro pastel anime palette'
      },
      '80s-90s retro anime': {
        ko: '시티팝 감성의 80-90년대 셀 애니메이션 스타일',
        en: 'vintage 80s-90s citypop aesthetic anime style with soft CRT glow and retro pastel anime palette'
      },
      '3D 반실사 애니 렌더링': {
        ko: '디즈니·픽사 애니메이션 느낌의 부드러운 3D 렌더링과 입체 조명 스타일',
        en: 'Pixar/Disney 3D animation rendering style with soft studio rim lighting and smooth subsurface scattering'
      },
      '3D Semi-realistic anime rendering': {
        ko: '디즈니·픽사 애니메이션 느낌의 부드러운 3D 렌더링과 입체 조명 스타일',
        en: 'Pixar/Disney 3D animation rendering style with soft studio rim lighting and smooth subsurface scattering'
      },
      '일본 출판 만화풍': {
        ko: 'G펜 잉크선과 섬세한 스크린톤이 살아있는 고품질 일본 출판 만화 스타일',
        en: 'authentic Japanese published manga style with precise G-pen inking and screentones'
      },
      'Japanese Manga Ink & Tone Style': {
        ko: 'G펜 잉크선과 섬세한 스크린톤이 살아있는 고품질 일본 출판 만화 스타일',
        en: 'authentic Japanese published manga style with precise G-pen inking and screentones'
      },
      '3D 펠트/클레이 점토 인형풍': {
        ko: '포근한 양모 펠트와 말랑말랑한 클레이 점토 스톱모션 애니메이션 인형 스타일',
        en: 'handcrafted 3D felt wool & claymation stop-motion miniature figurine style with tactile clay fingerprint textures and cozy studio macro lighting'
      },
      '3D Felt & Claymation Doll Style': {
        ko: '포근한 양모 펠트와 말랑말랑한 클레이 점토 스톱모션 애니메이션 인형 스타일',
        en: 'handcrafted 3D felt wool & claymation stop-motion miniature figurine style with tactile clay fingerprint textures and cozy studio macro lighting'
      },
      '크레파스 낙서풍': {
        ko: '유아 그림책 느낌의 아기자기한 크레파스 왁스 질감 손그림 낙서풍',
        en: 'playful wax crayon children\'s book doodle with organic waxy textures'
      },
      'Crayon Wax Pastel Doodle Style': {
        ko: '유아 그림책 느낌의 아기자기한 크레파스 왁스 질감 손그림 낙서풍',
        en: 'playful wax crayon children\'s book doodle with organic waxy textures'
      },
      'Y2K 픽셀 스티커풍': {
        ko: '반짝이 글리터와 레트로 픽셀이 어우러진 2000년대 Y2K 다꾸 스티커 스타일',
        en: 'Y2K retro aesthetic glitter sticker style with sparkling star emojis and pixel gloss highlights'
      },
      'Y2K Retro Glitter Pixel Sticker Style': {
        ko: '반짝이 글리터와 레트로 픽셀이 어우러진 2000년대 Y2K 다꾸 스티커 스타일',
        en: 'Y2K retro aesthetic glitter sticker style with sparkling star emojis and pixel gloss highlights'
      }
    };

    const found = styleMap[styleTag];
    if (found) {
      return isKo ? found.ko : found.en;
    }
    return styleTag;
  };

  const getSelectedArtStyle = () => {

    const artStyles = [
      ...(CHARACTER_TAGS_KO['🖌️ 화풍'] || []),
      ...(CHARACTER_TAGS_EN['🖌️ Art Style'] || []),
      ...(CHARACTER_TAGS_JA['🖌️ 画風'] || []),
      ...(CHARACTER_TAGS_ZH['🖌️ 画风'] || []),
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
      if (photoReferenceMode === 'likeness') {
        return isKo
          ? '첨부 사진의 핵심 식별 특징을 일관되게 유지하면서 깔끔한 2D 스티커로 스타일화한 캐리커처 화풍'
          : 'Caricature-style 2D sticker that consistently preserves the key identifying features from the reference photo with clean sticker linework';
      }
      if (photoReferenceMode === 'style') {
        return isKo
          ? '사진은 인물 식별 기준으로만 참고하고, 선택한 화풍의 조형 언어를 최우선으로 적용한 캐릭터 스티커 화풍'
          : 'Character sticker style that uses the photo only for identity reference while prioritizing the selected art style\'s visual language';
      }
      return isKo
        ? '사진 속 대상의 핵심 특징을 자연스럽게 유지하면서 선택 화풍에 맞게 스타일화한 균형 잡힌 스티커 화풍'
        : 'Balanced sticker style that naturally preserves the subject\'s key features while stylizing to match the selected art direction';
    }
    return isKo
      ? '귀엽고 친근한 고품질 2D 메신저 이모티콘 일러스트 화풍 (깔끔한 윤곽선과 조화로운 셀 셰이딩 채색)'
      : 'cute, approachable, high-quality 2D messenger sticker illustration with clean outlines and harmonious colors';
  };

  // --- [Adaptive Prompt Engine Helpers] ---
  const getAdaptiveStyleDirectives = (styleTag, promptLang = lang) => {
    const isKo = promptLang === 'ko';
    const tag = (styleTag || '').toLowerCase();

    // 1. Meme / Satirical / B-grade 짤툰
    if (tag.includes('병맛') || tag.includes('짤툰') || tag.includes('meme') || tag.includes('satirical')) {
      return {
        category: 'meme',
        instruction: isKo
          ? '굵고 투박한 자유로운 펜선, 극도로 과장되고 킹받는 코믹 표정(썩소, 백안, 억울한 일그러짐, 콧구멍 확장), 과감한 신체 왜곡과 역동적인 코믹 액션을 전폭 허용하여 B급 웹툰/짤툰의 매력을 극대화하세요.'
          : 'Bold expressive unpolished ink lines, hyper-exaggerated comedic facial expressions (smirks, blank white eyes, distorted comedic grimaces), and dynamic satirical cartoon gestures. Maximize the humor and meme energy.',
        negativeExtra: isKo
          ? '예쁘고 단정한 전형적인 미소녀 얼굴, 밋밋하고 평범한 표정, 과도한 미화 금지.'
          : 'No generic pretty anime face, no bland mild expressions, no excessive beautification.',
        typographyDirective: isKo
          ? '투박하고 강렬한 손글씨 폰트 + 순백색 두꺼운 다이컷 외곽선.'
          : 'Bold, punchy hand-lettered meme font with thick white die-cut contour.',
      };
    }

    // 2. Monochrome / Manga / Screentone
    if (tag.includes('흑백') || tag.includes('출판 만화') || tag.includes('monochrome') || tag.includes('manga tone')) {
      return {
        category: 'monochrome',
        instruction: isKo
          ? '선명한 흑백 잉크 펜선과 정교한 하프톤/스크린톤 음영을 적용하세요. 흑백 만화 특유의 강렬한 명암 대비와 섬세한 펜 터치를 유지하세요.'
          : 'Sharp black ink lineart with refined screentone/halftone shading. Maintain high-contrast black-and-white manga aesthetics and detailed penwork.',
        negativeExtra: isKo
          ? '원색 컬러 채색 금지, 무지개색 글자 금지, 화려한 색면 금지.'
          : 'No vibrant multi-color fills, no rainbow text, no saturated colored shading.',
        typographyDirective: isKo
          ? '흑백 만화 타이틀 스타일 먹선 텍스트 + 흰색 외곽선.'
          : 'High-contrast monochrome manga lettering with white outline stroke.',
      };
    }

    // 3. Oriental / Sumi-e
    if (tag.includes('동양화') || tag.includes('수묵') || tag.includes('oriental') || tag.includes('sumi-e')) {
      return {
        category: 'oriental',
        instruction: isKo
          ? '전통 한지 질감 위에 먹선의 농담과 붓터치의 강약, 은은하고 투명한 담채 물감 번짐을 살린 동양화/수묵담채화 스타일을 적용하세요. 여백의 미를 조화롭게 살리세요.'
          : 'Traditional East Asian Sumi-e ink wash style with varying brush pressure, translucent soft watercolor bleeding, and harmonious organic negative space.',
        negativeExtra: isKo
          ? '인위적인 디지털 네온 컬러, 딱딱한 벡터 외곽선 금지.'
          : 'No synthetic digital neon colors, no rigid vector borders.',
        typographyDirective: isKo
          ? '자연스러운 먹글씨 캘리그라피 감성 텍스트 + 은은한 외곽선.'
          : 'Organic brush calligraphy style lettering with subtle clean border.',
      };
    }

    // 4. 3D / Clay / Felt
    if (tag.includes('3d') || tag.includes('점토') || tag.includes('클레이') || tag.includes('펠트') || tag.includes('clay') || tag.includes('felt')) {
      return {
        category: '3d',
        instruction: isKo
          ? '부드러운 입체 조명과 실감 나는 재질감(점토 지문 질감 또는 보송보송한 양모펠트 텍스처)을 가진 3D 피규어/스톱모션 인형 스타일을 적용하세요.'
          : 'Tactile 3D figurine / stop-motion clay puppet style with soft ambient lighting, tangible clay/wool felt texture, and smooth dimensional volume.',
        negativeExtra: '',
        typographyDirective: isKo
          ? '통통한 볼륨감의 3D 엠보싱 스티커 텍스트 + 두꺼운 백색 테두리.'
          : 'Chubby embossed dimensional sticker text with bold white border.',
      };
    }

    // 5. Analog / Watercolor / Storybook
    if (tag.includes('수채화') || tag.includes('색연필') || tag.includes('크레파스') || tag.includes('동화') || tag.includes('낙서') || tag.includes('watercolor') || tag.includes('pencil') || tag.includes('crayon')) {
      return {
        category: 'analog',
        instruction: isKo
          ? '포근한 종이 결(Paper texture)과 따뜻한 아날로그 화구(색연필, 오일파스텔, 수채화 물감 번짐)의 자연스러운 입자 질감을 극대화하세요.'
          : 'Warm textured storybook illustration with visible paper grain, gentle colored pencil / oil pastel grain, or soft watercolor bleeding edges.',
        negativeExtra: isKo
          ? '차가운 디지털 벡터 느낌 금지, 기계적인 그라데이션 금지.'
          : 'No cold sterile digital vector look, no mechanical gradients.',
        typographyDirective: isKo
          ? '아기자기한 손글씨 스티커 폰트 + 깨끗한 백색 다이컷 테두리.'
          : 'Charming hand-drawn sticker lettering with crisp white die-cut contour.',
      };
    }

    // 6. Retro / Pixel
    if (tag.includes('도트') || tag.includes('픽셀') || tag.includes('pixel') || tag.includes('y2k')) {
      return {
        category: 'pixel',
        instruction: isKo
          ? '정교한 8-bit/16-bit 도트 그리드 픽셀아트 스타일과 레트로 감성의 컬러 팔레트를 일관되게 적용하세요.'
          : 'Crisp 8-bit/16-bit grid pixel art style with cohesive retro color palette.',
        negativeExtra: isKo
          ? '부드러운 벡터 곡선, 안티에일리어싱 블러 금지.'
          : 'No smooth vector curves, no blurry anti-aliasing.',
        typographyDirective: isKo
          ? '레트로 픽셀 도트 폰트 + 화이트 픽셀 외곽선.'
          : 'Retro pixelated bitmap lettering with white pixel border.',
      };
    }

    // Default: Clean 2D Pop Sticker
    return {
      category: 'cartoon',
      instruction: isKo
        ? '깔끔하고 둥글둥글한 외곽선과 화사한 원색 채색이 돋보이는 고품질 2D 카툰 스티커 스타일을 적용하세요.'
        : 'High-quality 2D cartoon sticker style with clean rounded outlines and bright vibrant coloring.',
      negativeExtra: '',
      typographyDirective: isKo
        ? '통통하고 읽기 쉬운 2D 볼드 팝아트 손글씨 스티커 폰트 + 두꺼운 순백색 다이컷 외곽선.'
        : 'Bold, bubbly 2D pop-art sticker typography with a thick white die-cut outline stroke.',
    };
  };

  const getSmartAnthropomorphicInstruction = (subjectText, promptLang = lang) => {
    const isKo = promptLang === 'ko';
    const text = (subjectText || '').toLowerCase();
    const isAnimalOrCreature = /(고양이|냥|강아지|댕댕|개|곰|토끼|원숭이|햄스터|다람쥐|여우|쿼카|판다|고슴도치|알파카|돼지|늘보|코끼리|코기|비숑|리트리버|호랑이|사자|새|뱁새|앵무새|참새|펭귄|오리|문어|오징어|물고기|고래|상어|돌고래|해파리|꽃게|거북|수달|물개|해마|곤충|나비|벌|무당벌레|풍뎅이|사마귀|우파루파|도마뱀|개구리|악어|공룡|티라노|cat|dog|bear|rabbit|hamster|fox|panda|duck|penguin|octopus|fish|whale|shark|seal|bee|dino)/i.test(text);
    const isFoodOrObject = /(붕어빵|식빵|마카롱|케이크|만두|쿠키|핫도그|푸딩|탕후루|떡볶이|삼각김밥|피자|라면|아이스크림|타코야끼|선인장|버섯|인형|로봇|슬라임|ghost|bread|cake|macaron|cookie|dumpling|pizza|ramen|robot|slime)/i.test(text);

    if (isAnimalOrCreature) {
      return isKo
        ? '동물/생물 캐릭터가 상황을 표현할 때 자연스러운 2족 보행 자세와 앙증맞은 손으로 소품을 쥐고 행동하는 귀여운 의인화(Anthropomorphic Mascot)를 적용하세요.'
        : 'Naturally anthropomorphize the animal/creature mascot with an expressive upright posture and cute little paws/hands that skillfully hold and interact with props.';
    }
    if (isFoodOrObject) {
      return isKo
        ? '사물/음식 캐릭터에 앙증맞은 팔다리와 생동감 넘치는 눈코입 표정을 부여하여 살아 움직이는 마스코트(Living Object Mascot)로 자연스럽게 연출하세요.'
        : 'Give the food/object mascot cute little arms, legs, and lively facial expressions to bring it to life as an animated living mascot.';
    }
    return '';
  };

  const getThemeSignatureProps = (themeName, promptLang = lang) => {
    const isKo = promptLang === 'ko';
    const t = (themeName || '').toLowerCase();

    if (t.includes('골프')) return isKo ? '골프채, 골프공, 홀컵, 썬캡' : 'golf club, golf ball, hole cup, sun visor';
    if (t.includes('낚시')) return isKo ? '낚싯대, 찌, 펄떡이는 물고기, 낚시통' : 'fishing rod, bobber, jumping fish, tackle box';
    if (t.includes('군인') || t.includes('곰신')) return isKo ? '베레모/군모, 군번줄, 편지 봉투, 배낭' : 'military beret/cap, dog tags, letter, backpack';
    if (t.includes('캠핑')) return isKo ? '텐트, 모닥불, 마시멜로 꼬치, 캠핑 의자' : 'tent, campfire, marshmallow skewer, camp chair';
    if (t.includes('싸이클') || t.includes('라이딩')) return isKo ? '라이딩 헬멧, 고글, 자전거 핸들, 물통' : 'cycling helmet, sports goggles, bike handlebars, water bottle';
    if (t.includes('집사') || t.includes('고양이')) return isKo ? '츄르 간식, 깃털 장난감, 캔 사료, 캣닢' : 'cat treats, feather wand, canned food, catnip';
    if (t.includes('댕댕이') || t.includes('강아지')) return isKo ? '개껌, 테니스공, 산책 목줄, 사료 그릇' : 'dog bone, tennis ball, leash, food bowl';
    if (t.includes('헬스') || t.includes('오운완')) return isKo ? '아령, 바벨, 프로틴 쉐이커, 땀수건' : 'dumbbell, barbell, shaker bottle, sweat towel';
    if (t.includes('카페') || t.includes('커피')) return isKo ? '테이크아웃 커피잔, 디저트 포크, 머그잔' : 'takeout coffee cup, dessert fork, mug';
    if (t.includes('공룡')) return isKo ? '화석, 원시 나뭇잎, 뼈다귀' : 'fossil, prehistoric leaf, bone';
    if (t.includes('우파루파') || t.includes('파충류')) return isKo ? '수초, 연잎 우산, 물방울' : 'waterweed, lotus leaf, water bubbles';
    if (t.includes('조류') || t.includes('새')) return isKo ? '나뭇가지, 모이통, 해바라기씨' : 'tree branch, bird feeder, sunflower seed';
    return '';
  };

  const getSelectedCharacterRoles = () => {
    const selectedTagSet = new Set(
      charManual.split(',').map(value => value.trim()).filter(Boolean)
    );

    const getTagsForKeys = (keys) => {
      const result = [];
      keys.forEach(k => {
        if (CHARACTER_TAGS_KO[k]) result.push(...CHARACTER_TAGS_KO[k]);
        if (CHARACTER_TAGS_EN[k]) result.push(...CHARACTER_TAGS_EN[k]);
        if (CHARACTER_TAGS_JA[k]) result.push(...CHARACTER_TAGS_JA[k]);
        if (CHARACTER_TAGS_ZH[k]) result.push(...CHARACTER_TAGS_ZH[k]);
      });
      return result.filter(tag => selectedTagSet.has(tag));
    };

    const subjectKeys = [
      '🐱 동물', '🐦 새/조류', '🐟 어패류/해양생물', '🐞 곤충/벌레', '🦎 파충류/양서류', '🦖 공룡/고생물', '🧸 인형/문구/팬시', '👦 인물', '🦄 판타지/사물', '🤖 로봇/SF', '🍞 디저트/음식', '🌿 식물/자연',
      '🐱 Animal', '🐦 Bird', '🐟 Marine Life', '🐞 Insect/Bug', '🦎 Reptile/Amphibian', '🦖 Dinosaur', '🧸 Plushie/Stationery', '👦 Person', '🦄 Fantasy/Object', '🤖 Robot/Sci-Fi', '🍞 Dessert/Food', '🌿 Plant/Nature',
      '🐱 動物', '🐦 鳥・野鳥', '🐟 魚介・海洋生物', '🐞 昆虫・虫', '🦎 爬虫類・両生類', '🦖 恐竜・古生物', '🧸 ぬいぐるみ・文具', '👦 人物', '🦄 ファンタジー/モノ', '🤖 ロボット/SF', '🍞 デザート/フード', '🌿 植物/自然',
      '🐱 动物', '🐦 鸟类', '🐟 水产・海洋生物', '🐞 昆虫・小虫', '🦎 爬行・两栖类', '🦖 恐龙・古生物', '🧸 玩偶・文具', '👦 人物', '🦄 幻想/物品', '🤖 机器人/科幻', '🍞 甜品/美食', '🌿 植物/自然'
    ];

    const appearanceKeys = ['👀 외형/특징', '👀 Appearance', '👀 外見/特徴', '👀 外貌/特征'];
    const personalityKeys = ['✨ 성격/감정', '✨ Trait/Emotion', '✨ 性格/感情', '✨ 性格/情绪'];
    const outfitKeys = ['👕 의상', '👕 Outfit', '👕 衣装', '👕 服饰', '🌏 글로벌/전통 문화', '🌏 World Cultures', '🌏 世界の文化・伝統', '🌏 全球・传统文化', '🎬 영화/애니메이션', '🎬 Cinema & Anime', '🎬 映画・アニメ', '🎬 影视・动漫'];
    const propKeys = ['🎒 소품/동작', '🎒 Prop/Action', '🎒 小道具/動作', '🎒 道具/动作', '💼 직장인/오피스', '💼 Office & Work', '💼 会社員・オフィス', '💼 职场・办公', '🎮 게임/E스포츠', '🎮 Gaming & Esports', '🎮 ゲーム・eスポーツ', '🎮 游戏・电竞', '💘 연애/커플', '💘 Romance & Couples', '💘 恋爱・情侣', '💪 헬스/다이어트', '💪 Fitness & Diet', '💪 フィットネス・筋トレ', '💪 健身・减肥'];
    const effectKeys = ['🌈 배경/효과', '🌈 Effect/BG', '🌈 エフェクト/背景', '🌈 背景/特效'];

    const allRecognized = new Set([
      ...Object.values(CHARACTER_TAGS_KO).flat(),
      ...Object.values(CHARACTER_TAGS_EN).flat(),
      ...Object.values(CHARACTER_TAGS_JA).flat(),
      ...Object.values(CHARACTER_TAGS_ZH).flat()
    ]);

    const additionalDescription = Array.from(selectedTagSet)
      .filter(value => !allRecognized.has(value))
      .join(', ');

    const subjects = getTagsForKeys(subjectKeys);
    const appearances = getTagsForKeys(appearanceKeys);
    const personalities = getTagsForKeys(personalityKeys);
    const outfits = getTagsForKeys(outfitKeys);
    const props = getTagsForKeys(propKeys);
    const effects = getTagsForKeys(effectKeys);

    return { subjects, appearances, personalities, outfits, props, effects, additionalDescription };
  };

  const getGeminiCharacterDetails = (langMode = lang) => {
    const { subjects, appearances, personalities, outfits, props, effects, additionalDescription } = getSelectedCharacterRoles();
    const isKo = langMode === 'ko';
    const subjectParts = [
      ...(characterSource === 'photo'
        ? [isKo ? 'AI 채팅에 첨부한 참고 사진 속 대상' : 'the subject in the attached reference photo']
        : []),
      ...subjects,
      ...(additionalDescription ? [additionalDescription] : []),
    ];

    const photoAppearanceEn = {
      balanced: 'preserve the subject\'s key identifying features (facial shape, eye direction, nose, mouth, hairstyle or fur pattern, skin/coat tone) so they are recognizable, while naturally stylizing the face and body to match the selected art style. Allow proportional simplification and expression exaggeration (no unrequested accessories)',
      likeness: 'consistently maintain the subject\'s facial shape, eye characteristics, nose, lips, jawline, hairstyle, skin tone or fur color so the subject remains easily identifiable even after stylization. Apply the art style primarily through linework, coloring, and expression rendering (no unrequested accessories)',
      style: 'maintain only the subject\'s core identifying traits (facial shape, eye direction, hairstyle or fur pattern, skin/coat tone, signature items) while actively applying the selected art style\'s visual language to proportions, expressions, form simplification, and coloring (no unrequested accessories)',
    }[photoReferenceMode];

    const photoAppearanceKo = {
      balanced: '첨부 사진 속 대상의 핵심 식별 특징(얼굴형, 눈매, 코, 입, 헤어스타일 또는 털 무늬, 피부톤 또는 털 색상)을 알아볼 수 있도록 유지하되, 선택된 화풍에 맞게 얼굴과 신체를 자연스럽게 스타일화. 비율 단순화와 표정 과장 허용 (사진에 없는 악세사리 임의 추가 금지)',
      likeness: '스타일화 후에도 첨부 사진 속 대상임을 쉽게 알아볼 수 있도록 얼굴형, 눈매, 코, 입술, 턱선, 헤어스타일, 피부톤 또는 털 색상을 일관되게 유지. 선택된 화풍은 선, 채색, 표정 연출 중심으로 적용 (사진에 없는 악세사리 임의 추가 금지)',
      style: '첨부 사진 속 대상의 핵심 식별 특징(얼굴형, 눈매, 헤어스타일 또는 털 무늬, 피부톤, 대표 아이템)만 유지하고, 선택한 화풍의 조형 언어를 우선 적용하여 비율, 표정, 형태, 채색을 적극 변환 (사진에 없는 악세사리 임의 추가 금지)',
    }[photoReferenceMode];

    const anthropomorphicGuide = getSmartAnthropomorphicInstruction(subjectParts.join(' '), isKo ? 'ko' : 'en');
    return {
      subject: subjectParts.join(', ') || (isKo ? '오리지널 마스코트 캐릭터' : 'original mascot character'),
      appearance: [
        ...(characterSource === 'photo' ? [isKo ? photoAppearanceKo : photoAppearanceEn] : []),
        ...appearances,
        ...(anthropomorphicGuide ? [anthropomorphicGuide] : []),
      ].join(', ') || (isKo ? '깔끔하고 명확한 캐릭터 실루엣 유지' : 'use a simple, recognizable silhouette and keep it unchanged'),
      personality: personalities.join(', ') || (isKo ? '친근하고 표정이 풍부한' : 'friendly and expressive'),
      outfit: outfits.join(', ') || (characterSource === 'photo'
        ? (isKo ? '참고 사진의 의상 스타일 유지' : 'preserve outfit from reference photo')
        : (isKo ? '지정 없음. 처음 정한 의상은 모든 이미지에서 유지' : 'no fixed outfit specified; once chosen, keep it unchanged')),
      props: props.join(', ') || (isKo ? '필수 소품 없음' : 'none required'),
      effects: effects.join(', ') || (isKo ? '감정 전달에 필요한 최소한의 효과만 사용' : 'use only a minimal effect when it clarifies the emotion'),
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
      balanced: 'preserve the subject\'s key identifying features (facial shape, eye direction, nose, mouth, hairstyle or fur pattern, skin/coat tone) so they are recognizable, while naturally stylizing the face and body to match the selected art style. Allow proportional simplification and expression exaggeration (no unrequested accessories)',
      likeness: 'consistently maintain the subject\'s facial shape, eye characteristics, nose, lips, jawline, hairstyle, skin tone or fur color so the subject remains easily identifiable even after stylization. Apply the art style primarily through linework, coloring, and expression rendering (no unrequested accessories)',
      style: 'maintain only the subject\'s core identifying traits (facial shape, eye direction, hairstyle or fur pattern, skin/coat tone, signature items) while actively applying the selected art style\'s visual language to proportions, expressions, form simplification, and coloring (no unrequested accessories)',
    }[photoReferenceMode];

    const photoAppearanceKo = {
      balanced: '첨부 사진 속 대상의 핵심 식별 특징(얼굴형, 눈매, 코, 입, 헤어스타일 또는 털 무늬, 피부톤 또는 털 색상)을 알아볼 수 있도록 유지하되, 선택된 화풍에 맞게 얼굴과 신체를 자연스럽게 스타일화. 비율 단순화와 표정 과장 허용 (사진에 없는 악세사리 임의 추가 금지)',
      likeness: '스타일화 후에도 첨부 사진 속 대상임을 쉽게 알아볼 수 있도록 얼굴형, 눈매, 코, 입술, 턱선, 헤어스타일, 피부톤 또는 털 색상을 일관되게 유지. 선택된 화풍은 선, 채색, 표정 연출 중심으로 적용 (사진에 없는 악세사리 임의 추가 금지)',
      style: '첨부 사진 속 대상의 핵심 식별 특징(얼굴형, 눈매, 헤어스타일 또는 털 무늬, 피부톤, 대표 아이템)만 유지하고, 선택한 화풍의 조형 언어를 우선 적용하여 비율, 표정, 형태, 채색을 적극 변환 (사진에 없는 악세사리 임의 추가 금지)',
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

  const getKoreanGlyphProtection = (phrases) => {
    const phraseList = (Array.isArray(phrases) ? phrases : [phrases])
      .map((phrase) => (phrase || '').trim())
      .filter(Boolean);

    const initials = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    const medials = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
    const finals = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

    const decomposeSyllable = (char) => {
      const code = char.charCodeAt(0);
      if (code < 0xAC00 || code > 0xD7A3) return null;
      const index = code - 0xAC00;
      const initial = initials[Math.floor(index / 588)];
      const medial = medials[Math.floor((index % 588) / 28)];
      const final = finals[index % 28];
      return { initial, medial, final };
    };

    const hasRiskyGlyph = (text) => [...text].some((char) => {
      if (/[ㅌㄹㅗㅜㅏㅓ]/.test(char)) return true;
      const parts = decomposeSyllable(char);
      return parts ? /[ㅗㅜㅏㅓ]/.test(parts.medial) || /[ㅌㄹ]/.test(parts.final) : false;
    });

    const riskyWords = [...new Set(
      phraseList
        .flatMap((phrase) => phrase.match(/[가-힣]+/g) || [])
        .filter(hasRiskyGlyph)
    )];
    if (!riskyWords.length) return '';

    const lockLines = riskyWords.map((word) => {
      const detail = [...word]
        .map((char) => {
          const parts = decomposeSyllable(char);
          if (!parts || (!/[ㅗㅜㅏㅓ]/.test(parts.medial) && !/[ㅌㄹ]/.test(parts.final))) return null;
          return `${char}=${parts.initial}+${parts.medial}${parts.final ? `+final consonant ${parts.final}` : ''}`;
        })
        .filter(Boolean)
        .join(', ');
      return `- ${word} = ${[...word].join('·')} / ${detail}`;
    }).join('\n');

    return `[KOREAN HANDWRITING GLYPH LOCK — HIGHEST PRIORITY]
The information below is for spelling verification only. Never render the middle dots, equals signs, plus signs, or Jamo explanations. Render only the original final phrases exactly as supplied.
${lockLines}

- Preserve a cute, warm handwritten feeling, but use neat, clearly separated print-style handwriting rather than cursive or connected writing.
- Express the handmade quality through the phrase's overall size, color, tilt, and placement. Never rotate, compress, connect, merge, or omit the initial, medial, or final components inside an individual Hangul syllable.
- For ㅗ, the short vertical stroke must point upward from the horizontal stroke. For ㅜ, it must point downward.
- For ㅏ, the short horizontal stroke must extend to the right of the vertical stroke. For ㅓ, it must extend to the left.
- Draw ㅌ with its middle horizontal stroke clearly separated from its outer structure. Never transform or simplify ㅌ into the stepped continuous shape of ㄹ.
- Preserve ㄹ as its own stepped turning structure. Never simplify ㄹ into ㅌ.
- Keep hearts, stars, sparkles, shadows, and decorative lines around the lettering only. Never overlap them with consonants, vowels, or final consonants.
- Apply the white sticker outline outside each complete glyph only. Never fill or merge the internal spaces, short vowel strokes, or final consonants.
- Break long phrases into no more than two lines and only at spaces between words. Never break inside a Korean word or syllable.
- Immediately before rendering, compare every visible syllable against the immutable source phrase and the glyph-lock data. Render each phrase exactly once.`;
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
    const styleDirectives = character.styleDirectives || getAdaptiveStyleDirectives(selectedArtStyle, lang === 'ko' ? 'ko' : 'en');
    const themeProps = getThemeSignatureProps(activeTheme, lang === 'ko' ? 'ko' : 'en');
    const artDirection = expandedArtStyle
      ? `${expandedArtStyle}. ${styleDirectives.instruction}`
      : (lang === 'ko'
        ? '귀엽고 친근한 고품질 2D 메신저 이모티콘 스타일, 깔끔한 외곽선, 조화로운 색감'
        : 'cute, approachable, high-quality 2D messenger sticker style with clean outlines and harmonious colors');

    if (generationMode === 'individual' || hasPhraseOverride) {
      if (lang === 'ko') {
        const glyphProtection = getKoreanGlyphProtection(targetPhrase);
        const textPolicy = gptTextMode === 'text'
          ? `[HIGH-PRECISION KOREAN HANDWRITTEN STICKER TYPOGRAPHY]
Immutable source phrase: "${targetPhrase}"
1. Copy the immutable Korean source phrase exactly once, character for character. Do not translate, paraphrase, respell, omit, duplicate, merge, or invent any character.
2. Place it beside or above the character in readable, bold 2D pop-art sticker lettering with neat print-style Korean handwriting. Keep it warm and naturally hand-drawn; do not replace it with a mechanical Gothic/sans-serif typeface and do not use connected cursive strokes.
3. Add a crisp, thick pure-white die-cut outline outside the complete lettering and a subtle shadow without covering internal Hangul strokes.
4. Add at most one small emotion-matching accent near the phrase, such as a heart, crown, thumbs-up, confetti, bouquet, sweat drop, sparkle, or zZ. It must not touch or obscure any glyph.
5. Never add a text box, speech bubble, parentheses, brackets, quotation marks, sticker number, or additional text.
${glyphProtection}`
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
${artDirection}. 캐릭터 비율과 선, 질감, 색감을 동일하게 유지하세요.

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
${textExclusion} 워터마크, 프레임, 중복 캐릭터, 추가 팔다리, 잘린 신체, 복잡한 풍경과 실사 배경 금지.${selectedArtStyle.includes('3D') ? '' : ' 3D 텍스처, 3D 렌더링 금지.'}`;
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
${textExclusion} No watermark, frame, duplicate character, extra limbs, cropped body, complex scenery, or photorealistic background.${selectedArtStyle.includes('3D') ? '' : ' No 3D textures, realistic shading, or glossy gradients.'}`;
      }
    }

    if (lang === 'ko') {
      const panelPlan = emoticons.map((phrase, index) => `${Math.floor(index / 5) + 1}행 ${index % 5 + 1}열: "${phrase.trim()}"`).join('\n');
      const glyphProtection = getKoreanGlyphProtection(emoticons);
      const textPolicy = gptTextMode === 'text'
        ? `[HIGH-PRECISION KOREAN HANDWRITTEN STICKER TYPOGRAPHY]
The Korean phrases listed in the panel plan are immutable source text.
1. Copy the assigned source phrase into its matching cell exactly once, character for character. Do not translate, paraphrase, respell, omit, duplicate, merge, or invent any character.
2. Place each phrase beside or above its character in readable, bold 2D pop-art sticker lettering with neat print-style Korean handwriting. Keep it warm and naturally hand-drawn; do not replace it with a mechanical Gothic/sans-serif typeface and do not use connected cursive strokes.
3. Add a crisp, thick pure-white die-cut outline outside the complete lettering and a subtle shadow without covering internal Hangul strokes.
4. Use at most one small emotion-matching accent per phrase, such as a heart, crown, thumbs-up, confetti, bouquet, sweat drop, sparkle, or zZ. It must not touch or obscure any glyph.
5. Never add text boxes, speech bubbles, parentheses, brackets, quotation marks, sticker numbers, or additional text.
${glyphProtection}`
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
${artDirection}. 15개 셀 모두 같은 선, 질감, 색감과 캐릭터 비율을 일관되게 적용하세요.

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
${artDirection}. Apply identical linework, texture, color treatment, and character proportions consistently to all 15 cells.

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
    const themeProps = getThemeSignatureProps(activeTheme, isKorean ? 'ko' : 'en');
    const hasPhraseOverride = phraseOverride !== null;
    const targetPhrase = generationMode === 'individual'
      ? getSelectedPhrase()
      : (phraseOverride || '').trim();

    const inlineTypographyEn = [
      'Bright Golden Yellow bold curved font with sparkle stars',
      'Vibrant Hot Pink bouncy font with mini hearts',
      'Red/Orange gradient font with sparkling stars',
      'Vivid Pink/Red bold font with thumbs-up icon',
      'Deep Navy/Purple clean elegant font',
      'Hot Pink vertical bold font with floating hearts',
      'Golden Yellow bold font with crown icon',
      'Bubbly Violet/Purple font with colorful party confetti',
      'Sky Blue font with blue sweat/tear drops',
      'Warm Sunny Orange/Yellow font with flower sparkles',
      'Magenta/Pink vertical festive font with party popper ribbons',
      'Giant Golden Yellow comic font with dark red outline and explosion sparkles',
      'Electric Neon Yellow font with purple outline and lightning shock lines',
      'Soft Glowing Rose/Pink font with sparkling tear drops',
      'Deep Night Purple/Indigo font with yellow crescent moon and zZ'
    ];

    const inlineTypographyKo = [
      '반짝이 별이 포함된 화사한 골든 옐로우 볼드 곡선 폰트',
      '미니 하트가 퐁퐁 떠 있는 생동감 넘치는 핫핑크 통통 폰트',
      '빛나는 별 효과가 들어간 레드/오렌지 그라데이션 폰트',
      '따봉 아이콘이 결합된 선명한 핑크/레드 볼드 폰트',
      '깔끔하고 정중한 딥네이비/퍼플 폰트',
      '풍성한 하트가 감싸는 핫핑크 세로형 입체 폰트',
      '황금 왕관 아이콘이 얹어진 골든 옐로우 볼드 폰트',
      '화려한 축제 폭죽 리본과 컨페티가 흩날리는 바이올렛/퍼플 폰트',
      '흘리는 땀방울/눈물방울 효과의 스카이블루 폰트',
      '꽃잎 반짝이가 흩날리는 따스한 오렌지/옐로우 폰트',
      '파티 폭죽 리본이 터지는 화려한 마젠타/핑크 세로형 축제 폰트',
      '폭발 스파클과 다크레드 외곽선의 큼직한 골든 옐로우 만화 폰트',
      '번개 스파크 효과와 퍼플 외곽선의 일렉트릭 네온 옐로우 폰트',
      '감동의 반짝이는 눈물방울과 하트가 어우러진 소프트 로즈핑크 폰트',
      '노란 초승달과 zZ 아이콘이 포함된 딥나이트 퍼플/인디고 야간 폰트'
    ];

    const bgInstructionKo = {
      transparent: '단일 연속 순수 단색 순백색(#FFFFFF) 배경. 각 스티커 실루엣 주변에 선명하고 깔끔한 흰색 다이컷(Die-cut) 외곽선이 둘러져 있습니다. 체커보드 투명 패턴, 회색 격자선 절대 금지.',
      solid: '캐릭터와 뚜렷하게 대비되는 깔끔한 단색 배경 (Solid contrasting background). 질감이나 잡음 없이 균일한 단색으로 생성하세요. 체커보드 패턴 절대 금지.',
      chroma: '배경 분리(누끼 작업)를 위한 선명한 연두색 단색 크로마키 배경 (#00FF00 Chroma-key Green). 캐릭터 외곽선에 녹색이 번지지 않게 깔끔하게 분리하세요.',
    }[geminiBackgroundMode] || '단일 연속 순수 단색 순백색(#FFFFFF) 배경.';

    const bgInstructionEn = {
      transparent: 'Pure solid white background (#FFFFFF) with a distinct white die-cut sticker contour around each sticker silhouette. Absolutely no background grid lines, no checkerboard transparency pattern.',
      solid: 'One clean solid background color with strong contrast against the character. No gradient, no texture, no background objects, no checkerboard pattern.',
      chroma: 'Solid bright green #00FF00 chroma-key background for easy background removal. Clean edges with no green color bleed on character borders.',
    }[geminiBackgroundMode] || 'Pure solid white background (#FFFFFF) with a distinct white die-cut sticker contour around each sticker silhouette.';

    if (isKorean) {
      const referenceInstructionKo = characterSource === 'photo'
        ? `[시각적 정체성 & 사진 기반 인물 캐리커처 (${getPhotoModeLabel('ko')})]
- 캐릭터 스타일: 2.5등신 치비/버블헤드 캐리커처 (참고 사진의 실제 얼굴을 직접 반영한 고화질 실사풍 얼굴).
- 얼굴 정확도 (최우선 순위): 참고 사진 속 실제 인물의 눈매, 쌍꺼풀/무쌍 구조, 콧대, 미소선, 얼굴 윤곽, 피부 결, 실제 조명 느낌을 극도로 정밀하게 유지하세요. 단순한 2D 플랫 선화로 뭉개지 말고, 실제 사람의 얼굴 입체감과 자연스러운 피부톤을 온전히 살리세요.
- 사진 반영 지침: ${getReferenceImageInstruction('ko')}
- 최우선 화풍: ${getGeminiStyleTags('ko')}
- 의상 및 헤어 일관성: ${character.appearance}, ${character.outfit}. 15개 모든 셀에서 동일한 의상과 헤어스타일을 완벽히 일관되게 유지하세요.`
        : `[시각적 정체성 & 캐릭터 스타일]
- 대상: ${character.subject}
- 최우선 화풍: ${getGeminiStyleTags('ko')}
- 외형 & 특징: ${character.appearance}
- 의상: ${character.outfit}
- 캐릭터 스타일: 2.5등신 치비 캐리커처, 선명한 이목구비와 입체감.`;

      if (generationMode === 'individual' || hasPhraseOverride) {
        const textPolicyKo = geminiTextMode === 'text'
          ? `[타이포그래피 규칙 — 하단 중복 원천 금지 & 단 1회 렌더링]
- 단일 렌더링 원칙: 캐릭터 상단 또는 측면에 지정된 한글 텍스트 "${targetPhrase}"를 정확히 '단 1번'만 렌더링하세요.
- 하단 텍스트 절대 금지: 캐릭터 하단(다리/바닥 아래)에 문구를 다시 반복해서 쓰거나 쪼개어 적지 마세요. 하단 공간은 글자 없는 깨끗한 배경이어야 합니다.
- 엄격 금지: 상단과 하단에 2번 중복 표기 금지, 단어 반복 금지, 첫 자음/모음 중복 표기("축축하해요", "미미안해요" 등) 절대 금지.`
          : `[텍스트 규칙]
한국어 문구 "${targetPhrase}"는 표정과 자세 결정을 위한 감정 맥락으로만 사용하며 이미지 내에 텍스트, 글자, 숫자를 그리지 마세요.`;

        const textExclusionKo = geminiTextMode === 'text'
          ? '하단 텍스트 중복, 텍스트 2회 중복 렌더링, 단어 반복, 첫 글자 자음/모음 중복(축축하해요, 미미안해요 등), 밋밋한 흑백 글자, 평면 2D 만화 선화, 낮은 인물 유사도, 전형적인 양산형 만화 얼굴, 한글 오타, 글자 누락, 체커보드 투명 배경, 잘린 사지, 뭉개진 인물.'
          : '모든 텍스트, 글자, 숫자, 말풍선, 평면 2D 만화, 신체 크롭, 격자선.';

        return `[포맷 & 캔버스 비율]
- 캔버스: 1:1 정사각형 캔버스 중앙에 단일 스티커 1개 배치.
- 배경: ${bgInstructionKo}
- 절대 금지: 배경 격자선, 체커보드 투명 패턴, 워터마크.

${referenceInstructionKo}

${textPolicyKo}

[포즈 & 문구]
- 감정 / 동작: "${targetPhrase}" — ${getPhraseActionKo(targetPhrase)}. 최소 소품: ${character.props}${themeProps ? `, ${themeProps}` : ''}, ${character.effects}.

[제외 조건 (Negative Directives)]
${textExclusionKo}`;
      }

      const row1Plan = [0, 1, 2, 3, 4].map(i => {
        const phrase = (emoticons[i] || '').trim();
        const action = getPhraseActionKo(phrase);
        const typo = inlineTypographyKo[i % 15];
        return `${i + 1}. [1-${i + 1}] ${action} | 텍스트 (상단/측면 단 1회): "${phrase}" (${typo})`;
      }).join('\n');

      const row2Plan = [5, 6, 7, 8, 9].map(i => {
        const phrase = (emoticons[i] || '').trim();
        const action = getPhraseActionKo(phrase);
        const typo = inlineTypographyKo[i % 15];
        return `${i + 1}. [2-${i - 4}] ${action} | 텍스트 (상단/측면 단 1회): "${phrase}" (${typo})`;
      }).join('\n');

      const row3Plan = [10, 11, 12, 13, 14].map(i => {
        const phrase = (emoticons[i] || '').trim();
        const action = getPhraseActionKo(phrase);
        const typo = inlineTypographyKo[i % 15];
        return `${i + 1}. [3-${i - 9}] ${action} | 텍스트 (상단/측면 단 1회): "${phrase}" (${typo})`;
      }).join('\n');

      const textPolicyKo = geminiTextMode === 'text'
        ? `[타이포그래피 필수 규칙 — 하단 중복 절대 금지 & 상단/측면 단 1회 렌더링 (CRITICAL)]
1. 단일 위치 렌더링 (Exact Single Placement): 각 문구는 캐릭터 머리 위(Top) 또는 옆(Side) 중 '오직 한 군데'에만 단 1개의 텍스트 블록으로 렌더링하세요.
2. 캐릭터 하단 텍스트 절대 금지 (Zero Bottom Text): 캐릭터 다리, 손, 무릎 아래 공간에는 절대로 글자를 적지 마세요. 하단 영역은 100% 글자 없는 순백색 여백이어야 합니다.
3. 상·하단 중복 표기 원천 금지 (Forbidden Double Text):
   - 상단에 "오늘도 화이팅"을 적고 하단에 "화이팅"을 또 적는 행위 절대 금지.
   - 상단에 "수고했어요"를 적고 하단에 "수고했어요"를 또 적는 행위 절대 금지.
   - 상단에 "오예"를 적고 하단에 "예"를 또 적는 행위 절대 금지.
   - 한 스티커 셀 안의 텍스트 개수는 무조건 '정확히 1개'여야 합니다.
4. 폰트 스타일: 통통하고 생동감 넘치는 카카오톡 스타일 팝아트 손글씨 스티커 타이포그래피 (채도 높은 원색 채움 + 다크 테두리 + 순백색 다이컷 외곽선 + 지정된 포인트 장식).`
        : `[Typography Rules]
- Korean phrases below are emotional context only — do not render any text, letters, or numbers in the image.`;

      const textExclusionKo = geminiTextMode === 'text'
        ? '하단 텍스트 중복 렌더링(오늘도 화이팅/화이팅 2번 쓰기, 수고했어요 위아래 2번 쓰기, 오예/예 2번 쓰기 등 절대 금지), 상하단 이중 텍스트, 캐릭터 아래 글자, 단어 반복, 첫 글자 자음/모음 중복, 밋밋한 폰트, 평면 2D 만화, 낮은 인물 유사도, 전형적인 양산형 만화 얼굴, 한글 오타, 글자 누락, 4x4 레이아웃, 투명 체커보드 배경, 잘린 사지.'
        : 'No text, no letters, no numbers, 4x4 layout, 16 stickers, 4th row, flat 2D anime, deformed limbs, cropped figures, panel borders, grid lines.';

      return `[포맷 & 캔버스 비율 — 16:9 와이드 가로형 그리드]
- 캔버스: 16:9 와이드 가로 직사각형 비율, 엄격한 5열 × 3행 그리드 배치 (정확히 총 15개의 개별 스티커).
- 배경: ${bgInstructionKo}
- 절대 금지 조건: 4x4 레이아웃 절대 금지, 16번째 스티커 금지, 배경 격자선 금지, 체커보드 투명 패턴 금지.

${referenceInstructionKo}

${textPolicyKo}

[15종 스티커 & 화려한 이모티콘 팝아트 타이포그래피 매트릭스]
[제 1행 — 상단 5개 스티커]
${row1Plan}

[제 2행 — 중단 5개 스티커]
${row2Plan}

[제 3행 — 하단 5개 스티커]
${row3Plan}

[종료 검증]
- 15번째 스티커에서 완벽히 렌더링이 종료됩니다. 4번째 행은 없으며 총 스티커 개수는 정확히 15개입니다.

[제외 조건 (Negative Directives)]
${textExclusionKo}`;
    }

    // English Version
    const referenceInstruction = characterSource === 'photo'
      ? `[Visual Identity & Photo Reference Caricature (${getPhotoModeLabel('en')})]
- Character Style: 2.5-head Chibi/Bobblehead Caricature featuring a realistic, high-fidelity face directly from the reference photo (${getPhotoModeLabel('en')}).
- Facial Accuracy (Highest Priority): Maintain exact likeness of the reference photo's actual eyes, eyelid shape, nose, smile lines, facial contour, skin texture, and realistic lighting. DO NOT flatten into generic 2D line art. Keep real human facial depth and skin tone.
- Reference Photo Policy: ${getReferenceImageInstruction('en')}
- Art Style (Highest Priority): ${getGeminiStyleTags('en')}
- Consistent Outfits: ${character.appearance}, ${character.outfit} across all 15 cells.`
      : `[Visual Identity & Realistic Chibi Style]
- Subject: ${character.subject}
- Art Style: ${getGeminiStyleTags('en')}
- Appearance & Features: ${character.appearance}
- Outfit: ${character.outfit}
- Character Style: 2.5-head Chibi caricature featuring realistic facial structure and depth.`;

    if (generationMode === 'individual' || hasPhraseOverride) {
      const textPolicy = geminiTextMode === 'text'
        ? `[Typography Rules — Zero Bottom Text & Strict Single Placement]
- Top/Side Single Placement: Render the Korean text "${targetPhrase}" exactly ONCE above or adjacent to the character.
- Zero Bottom Text: DO NOT render any text beneath the character. The area below must be completely blank.
- STRICT: Absolutely NO repeated words, NO top-and-bottom double text, NO doubled initial consonants.`
        : `Do not render text, letters, or numbers. Use "${targetPhrase}" only as visual context for expression and pose.`;
      const textExclusion = geminiTextMode === 'text'
        ? 'Bottom text echo, top-and-bottom double text, duplicate text, repeated words, double Korean characters, text rendered twice, plain dull font, flat 2D anime line art, low likeness, generic cartoon face, Korean spelling errors, missing letters, transparent checkerboard background, cut-off limbs, merged figures.'
        : 'No text, no letters, no numbers, no speech bubbles, no sticker labels, no meaningless symbols.';

      return `[Format & Canvas Ratio]
- Canvas: 1:1 square canvas, single centered sticker.
- Background: ${bgInstructionEn}
- Absolute Constraints: No background grid lines, no checkerboard transparency pattern.

${referenceInstruction}

${textPolicy}

[Pose & Action]
- Emotion / Action: "${targetPhrase}" — ${getPhraseActionEn(targetPhrase)}

[Negative Directives]
${textExclusion}`;
    }

    const row1Plan = [0, 1, 2, 3, 4].map(i => {
      const phrase = (emoticons[i] || '').trim();
      const action = getPhraseActionEn(phrase);
      const typo = inlineTypographyEn[i % 15];
      return `${i + 1}. [1-${i + 1}] ${action} | Text (Top/Side single block only): "${phrase}" (${typo})`;
    }).join('\n');

    const row2Plan = [5, 6, 7, 8, 9].map(i => {
      const phrase = (emoticons[i] || '').trim();
      const action = getPhraseActionEn(phrase);
      const typo = inlineTypographyEn[i % 15];
      return `${i + 1}. [2-${i - 4}] ${action} | Text (Top/Side single block only): "${phrase}" (${typo})`;
    }).join('\n');

    const row3Plan = [10, 11, 12, 13, 14].map(i => {
      const phrase = (emoticons[i] || '').trim();
      const action = getPhraseActionEn(phrase);
      const typo = inlineTypographyEn[i % 15];
      return `${i + 1}. [3-${i - 9}] ${action} | Text (Top/Side single block only): "${phrase}" (${typo})`;
    }).join('\n');

    const textPolicy = geminiTextMode === 'text'
      ? `[Typography Rules — Zero Bottom Text & Strict Single Placement Mandate (CRITICAL)]
1. Top/Side Single Placement: Render each Korean phrase strictly ONCE per character, positioned exclusively above the head or adjacent to the shoulders/head.
2. ZERO BOTTOM TEXT MANDATE: Absolutely DO NOT render any text beneath the character's body, hands, knees, or waist. The area below the character MUST remain 100% clean blank white space with zero text.
3. FORBIDDEN BOTTOM DUPLICATION:
   - NEVER write "오늘도 화이팅" at the top and "화이팅" at the bottom.
   - NEVER write "수고했어요" at both top and bottom.
   - NEVER write "오예" at the top and repeat "예" at the bottom.
   - Exactly ONE single text instance per sticker cell (Count = 1).
4. Font Styling: Bold, bubbly, highly expressive KakaoTalk-style pop-art hand-lettered sticker typography (saturated vibrant colors + dark stroke + white die-cut contour + designated micro-effects).`
      : `[Typography Rules]
- Korean phrases below are emotional context only — do not render any text, letters, or numbers in the image.`;

    const textExclusion = geminiTextMode === 'text'
      ? 'Bottom text echo, top-and-bottom double text (e.g. writing 오늘도 화이팅 and 화이팅 twice, writing 수고했어요 twice, repeating 오예/예 twice), text rendered beneath character, duplicate text blocks per cell, repeated words, double Korean consonants, plain dull font, flat 2D anime line art, low likeness, generic cartoon face, Korean spelling errors, missing letters, extra 4th row, 4x4 layout, transparent checkerboard background, cut-off limbs, merged figures.'
      : 'No text, no letters, no numbers, 4x4 layout, 16 stickers, 4th row, flat 2D anime, deformed limbs, cropped figures, panel borders, grid lines.';

    return `[Format & Canvas Ratio - 16:9 Landscape Grid]
- Canvas: 16:9 wide landscape aspect ratio, strictly arranged in a 5 columns × 3 rows grid (Exactly 15 distinct stickers in total).
- Background: ${bgInstructionEn}
- Absolute Constraints: No 4x4 layout, no 16th sticker, no background grid lines, no checkerboard transparency pattern.

${referenceInstruction}

${textPolicy}

[15 Stickers & Vibrant Emoticon Pop-Art Typography Matrix]
[Row 1 - Top 5 Stickers]
${row1Plan}

[Row 2 - Middle 5 Stickers]
${row2Plan}

[Row 3 - Bottom 5 Stickers]
${row3Plan}

[Termination Check]
- Total 15 stickers strictly concluded at Sticker 15. No Row 4.

[Negative Directives]
${textExclusion}`;
  };

  const getGrokBackgroundInstruction = () => {
    const instructions = {
      transparent: 'Clean solid white background with a subtle crisp sticker die-cut white outline. Pure solid white (#FFFFFF).',
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
      appearance: [
        ...(characterSource === 'photo' ? [isKo ? photoAppearanceKo : photoAppearanceEn] : []),
        ...appearances,
      ].join(', ') || (isKo ? '단순하고 알아보기 쉬운 실루엣을 정한 뒤 그대로 유지' : 'simple, recognizable silhouette kept unchanged'),
      personality: personalities.join(', ') || (isKo ? '친근하고 표정이 풍부한' : 'friendly and expressive'),
      outfit: outfits.join(', ') || (characterSource === 'photo'
        ? (isKo ? '참고 사진의 의상 스타일 유지' : 'preserve outfit from reference photo')
        : (isKo ? '지정 없음. 처음 정한 의상은 모든 이미지에서 유지' : 'no fixed outfit specified; once chosen, keep it unchanged')),
      props: props.join(', ') || (isKo ? '필수 소품 없음' : 'none required'),
      effects: effects.join(', ') || (isKo ? '감정 전달에 필요한 최소한의 효과만 사용' : 'use only a minimal effect when it clarifies the emotion'),
      artStyle: getGeminiStyleTags(langMode),
    };
  };

  const generateGrokPrompt = (phraseOverride = null) => {
    const isKorean = lang === 'ko';
    const character = getGrokCharacterDetails('en');
    const themeProps = getThemeSignatureProps(activeTheme, 'en');
    const selectedArtStyle = getSelectedArtStyle('en') || 'Realistic semi-caricature 2D illustration';
    const hasPhraseOverride = phraseOverride !== null;
    const targetPhrase = generationMode === 'individual'
      ? getSelectedPhrase()
      : (phraseOverride || '').trim();

    const bgInstruction = {
      transparent: 'pure solid white (#FFFFFF) background only. No gradients, no patterns, no gray tones, no checkerboard.',
      solid: 'one clean solid background color contrasting with the character. No gradient, texture, or background objects.',
      chroma: 'solid bright lime-green #00FF00 chroma key background for easy cutout. No green bleed on character outlines.',
    }[grokBackgroundMode] || 'pure solid white (#FFFFFF) background only. No gradients, no patterns, no gray tones, no checkerboard.';

    // xAI Grok Imagine 3-Tier Photo Reference Directive
    const photoDirectives = {
      likeness: `REFERENCE IMAGE PRIORITY (LIKENESS-FIRST):
Use the uploaded image as the absolute identity ground truth. Preserve the subject's exact recognizable facial structure, eye shape, nose bridge/tip, lip thickness, jawline, hairstyle, and skin tone with maximum fidelity across all panels. The art style applies strictly to clean linework and subtle shading without replacing or simplifying the subject's real facial identity.`,
      balanced: `REFERENCE IMAGE PRIORITY (BALANCED RECOMMENDED):
Use the uploaded image as the primary identity reference. The reference image defines WHO the character is. Preserve the subject's key recognizable facial structure and distinguishing features consistently across all panels. Apply the requested art style to rendering, linework, proportions, coloring, and expressions without replacing the subject's identity.`,
      style: `REFERENCE IMAGE PRIORITY (STYLE-FIRST):
Use the uploaded image as character design inspiration. Extract signature styling points (hairstyle, distinctive vibe, glasses/accessories if any, outfit colors) and actively apply the chosen art style's stylized visual language to proportions, expressions, and forms while preserving an identifiable likeness.`
    };

    const refImageBlock = characterSource === 'photo'
      ? photoDirectives[photoReferenceMode] || photoDirectives.balanced
      : `CHARACTER SOURCE: Original mascot character design.`;

    const charSubject = character.subject || 'a real person';
    const charAppearance = character.appearance || 'natural facial features matching reference photo';
    const charOutfit = character.outfit || 'outfit matching reference photo';
    const themePart = themeProps ? ` (${themeProps})` : '';

    const identityLock = characterSource === 'photo'
      ? `IDENTITY LOCK (must remain identical in all panels):
- Face & Facial Features: Exact jawline, cheekbones, chin shape, nose bridge/tip, lip thickness, and natural smile line matching the photo.
- Eyes & Gaze: Authentic eye shape, eyelid structure, eye distance, and natural expression.
- Hair: Exact hairstyle, length, part, volume, and natural flow matching the photo.
- Skin & Details: Natural skin tone and subtle facial characteristics (${charAppearance}). No beauty filter, no generic anime face, no baby face.
- Outfit: ${charOutfit}${themePart}.`
      : `IDENTITY LOCK (must remain identical in all panels):
- Recurring mascot character: ${charSubject}${themePart}.
- Key features: ${charAppearance}.
- Outfit & Props: ${charOutfit}.`;

    const formatStickerLine = (phrase, number) => {
      const action = getPhraseActionEn(phrase);
      const trimmed = (phrase || '').trim();
      if (grokTextMode === 'text' && trimmed) {
        return `${number}. ${action} + “${trimmed}”`;
      }
      return `${number}. ${action}`;
    };

    const row1 = emoticons.slice(0, 5).map((p, idx) => formatStickerLine(p, idx + 1)).join('\n');
    const row2 = emoticons.slice(5, 10).map((p, idx) => formatStickerLine(p, idx + 6)).join('\n');
    const row3 = emoticons.slice(10, 15).map((p, idx) => formatStickerLine(p, idx + 11)).join('\n');

    const textSection = grokTextMode === 'text'
      ? `\nTEXT:
Render only the specified Korean messenger phrases in clean, bold 2D pop-art handwritten font with a thick pure white die-cut outline. Text appears clearly once per sticker beside or above the character. No speech bubbles, no quotation marks, no meaningless random letters.`
      : `\nTEXT:
Pure graphic artwork with NO text, NO letters, NO numbers, and NO speech bubbles. Expressions and body gestures communicate 100% of the emotion.`;

    if (generationMode === 'individual' || hasPhraseOverride) {
      const singleAction = getPhraseActionEn(targetPhrase);
      const singleLine = grokTextMode === 'text' && targetPhrase
        ? `${singleAction} + “${targetPhrase}”`
        : `${singleAction}`;

      return `TASK:
Create one polished high-resolution square messenger sticker on a ${bgInstruction}

${refImageBlock}

${identityLock}

ACTION & EMOTION:
${singleLine}

ART STYLE & RENDERING:
${selectedArtStyle}.
- Clean uniform black vector line art (3-4px).
- Flat two-tone cel shading for body, hair, and clothing.
- Slightly softer, subtle shading on the face only to preserve volume and recognizable likeness.
- No gradients, no airbrush, no 3D rendering, no watercolor, no soft glow.

BODY PROPORTIONS:
Natural stylized 3.5–4 head-length ratio. Face retains full detail and photo-accurate likeness; body can be slightly stylized.
${textSection}
DIE-CUT OUTLINE:
Thick, clean white outline around the full character silhouette + very faint subtle contact shadow along the outline edge so the sticker shape is distinct on pure white background without changing border color.

AVOID:
Generic anime face, baby face, eye distortion, altered facial structure, extra or missing limbs, speech bubbles, random gibberish letters, watermark, outer frame.

FINAL CHECK:
One single polished sticker with exact facial likeness to the reference photo on pure background.

[Optional X-ready output request]
After generating the sticker, also prepare a short, engaging Korean caption + English hashtags that can be directly copied and posted on X (Twitter).`;
    }

    return `TASK:
Create one polished messenger sticker sheet containing exactly 15 distinct expressions and actions of the same character on a ${bgInstruction}

${refImageBlock}

${identityLock}

ART STYLE & RENDERING:
${selectedArtStyle}.
- Clean uniform black vector line art (3-4px).
- Flat two-tone cel shading for body, hair, and clothing with a coherent color palette.
- Slightly softer, subtle shading on the face only to preserve volume and recognizable likeness.
- Do not allow the art style to erase the subject's recognizable identity.
- No gradients, no airbrush, no 3D rendering, no watercolor, no soft glow.

BODY PROPORTIONS:
Natural stylized 3.5–4 head-length ratio. Face retains full detail and photo-accurate likeness; body can be slightly simplified.

SHEET COMPOSITION:
Arrange exactly 15 stickers in a clean 3-row by 5-column grid (5 stickers per row, 3 rows total), evenly and naturally spaced, floating freely within the white margins. No grid lines, cell borders, numbers, frames, or crop marks.
${textSection}
DIE-CUT OUTLINE:
Each sticker has a thick, crisp, clean white outline around its full silhouette + very faint subtle contact shadow along the outline edge so the sticker shape is distinct on pure white background without changing border color.

15 EXPRESSIONS AND ACTIONS:
Row 1:
${row1}

Row 2:
${row2}

Row 3:
${row3}

POSE VARIETY:
Include at least 6 distinct body postures across the sheet (lying down, sitting, standing, jumping, bowing, crouching). Mix full-body and upper-body compositions naturally.

VISUAL CONSISTENCY:
Treat all 15 stickers as one character design sheet. Maintain the exact same facial identity, hairstyle, skin tone, outfit, and character proportions across every panel. Only expressions, poses, props, and situation-specific effects change.

AVOID:
Identity drift between panels, generic anime faces, baby-face averaging, inconsistent hairstyles, random outfit changes, duplicated poses, speech bubbles, random gibberish letters, watermark, grid lines, outer frames, extra or missing stickers (must be exactly 15).

FINAL CHECK:
Exactly 15 stickers in a 3×5 grid, one consistent recognizable character matching the reference photo, pure white background only.

[Optional X-ready output request]
After generating the sticker sheet, also prepare a short, engaging Korean caption + English hashtags that can be directly copied and posted on X (Twitter).`;
  };

  const copySocialCaption = (mode = 'ko') => {
    const captions = {
      ko: `나만의 얼굴 그대로 담은 실사 캐리커처 스티커 시트 완성! 🎨✨\n웃음, 인사, 감동, 잘자까지 15가지 감정과 포즈를 한 장에 담아봤어요.\n카톡·라인 이모티콘으로 바로 써도 딱일 것 같아요 😆💛\n\n👉 무료 AI 프롬프트 생성기: https://emoticon-beige.vercel.app/\n\n#카카오톡스티커 #라인스티커 #AI스티커 #이모티콘 #GrokArt #프롬프트메이커`,
      ja: `写真そっくりの15種オリジナルスタンプシートが完成！🎨✨\n笑顔、挨拶、感動、おやすみまで15種類の表情とポーズを1枚にまとめました。\nLINEスタンプにもぴったり😆💛\n\n👉 無料AIプロンプト作成ツール: https://emoticon-beige.vercel.app/\n\n#LINEスタンプ #AIスタンプ #AIイラスト #GrokArt #PromptMaker`,
      zh: `根据真人照片生成的15格专属表情包贴纸完成！🎨✨\n大笑、打招呼、感动、晚安等15种丰富表情和动作一网打尽。\n微信/LINE表情包即刻可用😆💛\n\n👉 免费AI提示词生成工具: https://emoticon-beige.vercel.app/\n\n#微信表情包 #LINE贴纸 #AI表情包 #AI绘画 #GrokArt #PromptMaker`,
      en: `Just made my own 15-piece caricature sticker sheet with Grok AI ✨\nBased on a real photo — same face, same vibe, full 15 emotion set!\n\n👉 Free AI Prompt Maker: https://emoticon-beige.vercel.app/\n\n#KakaoTalkSticker #LINESticker #AIArt #CustomEmoticon #StickerSheet #GrokArt`,
    };
    const text = captions[mode] || captions.en;
    navigator.clipboard.writeText(text);
    setCopiedType(`social_${mode}`);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const shareOnTwitter = (mode = lang) => {
    const tweets = {
      ko: `나만의 카톡/라인 스티커 15장 완성! 💕\n참고 사진 그대로 닮은 캐릭터로 감정 표현 풀세트 만들었어요 ✨\nㅋㅋㅋㅋ부터 잘자요까지 다 있음 ㅋㅋ\n\n👉 무료 AI 프롬프트 생성기: https://emoticon-beige.vercel.app/\n\n#카카오톡스티커 #라인스티커 #AI스티커 #이모티콘 #프롬프트메이커`,
      ja: `自分そっくりのLINE/メッセンジャースタンプ15種が完成！💕\n写真の特徴をそのまま活かした感情豊かなスタンプシート✨\n\n👉 無料AIプロンプト作成: https://emoticon-beige.vercel.app/\n\n#LINEスタンプ #AIスタンプ #AIイラスト #GrokArt`,
      zh: `制作了15张专属表情包贴纸！💕\n完美还原照片特征，涵盖大笑到晚安的日常情绪全套表情✨\n\n👉 免费AI提示词生成工具: https://emoticon-beige.vercel.app/\n\n#微信表情包 #LINE贴纸 #AI表情包 #GrokArt`,
      en: `Just made my own 15-piece KakaoTalk/LINE sticker sheet with AI ✨\nBased on a real photo — same face, same vibe, full emotion set!\n\n👉 Free AI Prompt Maker: https://emoticon-beige.vercel.app/\n\n#KakaoTalkSticker #LINESticker #AIArt #CustomEmoticon #StickerSheet #PromptMaker`,
    };
    const text = tweets[mode] || tweets.en;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
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
직전 이미지의 잘린 신체, 추가 팔다리, 겹친 셀, 깨진 배경과 불필요한 요소를 모두 수정하세요.
카메라 시점을 뒤로 30% 줌아웃(Zoom Out)하여 캐릭터 크기를 줄여주세요.
머리끝(귀/모자 포함)부터 발끝까지 전신이 화면 한가운데에 완벽하게 들어오고, 상하좌우에 최소 20%의 여백이 남도록 재배치하세요. 정상적인 팔다리 수와 깨끗한 배경을 유지하세요.`,

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
直前の画像の見切れた身体、余分な手足、重なったセル、壊れた背景、不要な要素をすべて修正してください。
カメラを30%ズームアウトしてキャラクターサイズを調整してください。
頭（耳/帽子含む）から足先まで全身が中央に完全に収まり、四方に最低20%の余白ができるように再配置し、正常な手足の数ときれいな背景を維持してください。`,

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
请修复上一张图片中被裁切的身体、多余肢体、单元格重叠、异常背景及无关元素。
请将镜头向后拉远(Zoom Out) 30%以缩小角色比例。
确保全身完整显示在画面正中央，四周保留至少20%的边距，并保持正常的肢体数量与干净背景。`,

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
Fix every cropped body part, extra limb, overlapping cell, broken background, and unwanted element in the previous image.
ZOOM OUT the camera by 30% to shrink the character inside the frame.
Keep the entire body centered with at least 20% clear margin on all sides, a normal number of limbs, and a clean background.`,

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

    // Record theme usage score (+3 for launch action)
    recordThemeUsage(activeTheme, 3);

    // GA4 Real-time Tracking
    trackEvent('launch_ai_companion', {
      ai_model: type,
      theme_name: activeTheme,
      art_style: getSelectedArtStyle('en') || 'default',
      generation_mode: generationMode,
      character_source: characterSource,
      photo_mode: photoReferenceMode,
      lang: lang
    });
    
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

  const handlePreviewCopyAttempt = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const msg = lang === 'ko' 
      ? '💡 프롬프트 복사 및 AI 사이트 열기는 아래 전용 버튼을 이용해 주세요!' 
      : lang === 'ja'
      ? '💡 プロンプトのコピーとAI生成は下の専用ボタンをご利用ください！'
      : lang === 'zh'
      ? '💡 请使用下方的专属按钮进行提示词复制与AI生成！'
      : '💡 Please use the dedicated buttons below to copy and launch prompts!';
    showToast(msg);

    const gridEl = document.getElementById('ai-action-cards-grid') || document.getElementById('ai-action-hub');
    if (gridEl) {
      // On both mobile & desktop, scroll smoothly so all 3 cards (ChatGPT, Gemini, Grok) are comfortably visible
      gridEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const copyToClipboard = (type, selectedPhraseOverride = null, copyKey = type) => {
    const phraseOverride = selectedPhraseOverride ?? (generationMode === 'batch' ? getSelectedPhrase() : null);
    if (getPromptValidationError(phraseOverride)) return;

    // Record theme usage score (+3 for copy action)
    recordThemeUsage(activeTheme, 3);

    // GA4 Real-time Tracking
    trackEvent('copy_prompt', {
      ai_model: type,
      theme_name: activeTheme,
      art_style: getSelectedArtStyle('en') || 'default',
      generation_mode: generationMode,
      character_source: characterSource,
      photo_mode: photoReferenceMode,
      lang: lang
    });

    const textToCopy = type === 'gpt'
      ? generateGptPrompt(phraseOverride)
      : type === 'gemini'
        ? generateGeminiPrompt(phraseOverride)
        : generateGrokPrompt(phraseOverride);
    navigator.clipboard.writeText(textToCopy);
    setCopiedType(copyKey);
    setTimeout(() => setCopiedType(null), 2500);
    showToast(lang === 'ko' ? '📋 프롬프트가 복사되었습니다!' : lang === 'ja' ? '📋 プロンプトをコピーしました！' : lang === 'zh' ? '📋 提示词已复制！' : '📋 Prompt copied to clipboard!');
  };

  const promptValidationError = getPromptValidationError(
    generationMode === 'batch' ? getSelectedPhrase() : null
  );
  const visiblePromptValidationError = promptValidationError;
  const normalizedThemeSearch = themeSearch.trim().toLocaleLowerCase();
  const filteredThemeKeys = themeKeys.filter((theme) => {
    if (!normalizedThemeSearch) return true;
    return theme.toLocaleLowerCase().includes(normalizedThemeSearch)
      || currentThemes[theme].some((phrase) => phrase.toLocaleLowerCase().includes(normalizedThemeSearch));
  });
  const recentThemeKeys = [...new Set([
    ...(activeTheme !== 'custom' ? [activeTheme] : []),
    ...sortedThemeKeys,
  ])].filter((theme) => currentThemes[theme]).slice(0, 6);
  const activeTagList = charManual.split(',').map((tag) => tag.trim()).filter(Boolean);

  if (currentPath === '/privacy') {
    return <PrivacyPage lang={lang} onBack={() => navigateTo('/')} />;
  }

  if (currentPath === '/terms') {
    return <TermsPage lang={lang} onBack={() => navigateTo('/')} />;
  }

  return (
    <div className={`font-body-md text-body-md antialiased max-w-full w-full lang-${lang}`}>
      {toastMessage && (
        <div role="status" aria-live="polite" className="fixed left-1/2 top-16 z-[150] -translate-x-1/2 rounded-full border border-mint-border bg-[#184F43] px-4 py-2.5 text-[13px] font-bold text-white shadow-lg whitespace-nowrap max-w-[calc(100vw_-_24px)] overflow-hidden text-ellipsis">
          {toastMessage}
        </div>
      )}
      {/* TopAppBar - Clean Original Header */}
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
                setShowPhotoTips(true);
                setShowDetailedGuide(true);
                setTimeout(() => {
                  const el = document.getElementById('photo-tips-card') || document.getElementById('guide-section');
                  if (el) {
                    const y = el.getBoundingClientRect().top + window.scrollY - 70;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }, 80);
              }}
              className="interactive-control flex items-center gap-1 min-h-9 px-2 sm:px-3 py-1 rounded-full bg-[#FFF4E5] border border-[#FFE8CC] text-[#8A4B00] text-[13px] font-bold hover:bg-[#FFE8CC] shadow-sm whitespace-nowrap shrink-0"
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
                  className={`brand-logo interactive-control w-8 sm:w-9 h-7 sm:h-8 flex items-center justify-center text-[12px] font-extrabold rounded-full transition-all ${
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

      <main className="max-w-3xl mx-auto px-container-margin mt-3 sm:mt-4 md:mt-4.5 flex flex-col gap-4 sm:gap-5">
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

          {/* JocoHunt Weekly Top 3 Winner Badge */}
          <div className="z-10 mt-1 flex justify-center">
            <a
              href="https://jocohunt.com/p/190i6ehg"
              target="_blank"
              rel="noopener noreferrer"
              title="조코헌트 주간 1등 Top 3 위너"
              className="inline-block transform hover:scale-105 transition-all duration-300 drop-shadow-sm hover:drop-shadow-md"
            >
              <img
                src="https://jocohunt.com/images/badges/weekly-light.svg"
                alt="조코헌트 주간 1등 Top 3 위너"
                className="w-[200px] sm:w-[240px] h-auto"
              />
            </a>
          </div>
        </section>

        {/* Section 1: Character Setup */}
        <section id="character-setup-section" className="flex flex-col gap-md">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">{t.step1}</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowResetConfirm(true)} className="flex items-center gap-1.5 min-h-10 px-3 py-1.5 text-[13px] font-bold text-error hover:bg-red-50 border border-error/20 hover:border-error/40 rounded-lg transition-all cursor-pointer">
                  <Trash2 size={14} /> {lang === 'ko' ? '전체 초기화' : t.clear}
                </button>
              </div>
            </div>
            
            {/* Current prompt settings summary */}
            <div className="rounded-lg border border-[#B9DDD0] bg-[#F4FBF8] px-3.5 py-3 shadow-bubbly">
              <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-[#D9ECE5] pb-2">
                <strong className="text-[13px] sm:text-[14px] font-black text-[#244E43]">
                  {lang === 'ko' ? '현재 설정 요약' : lang === 'ja' ? '現在の設定概要' : lang === 'zh' ? '当前设置摘要' : 'Current Settings'}
                </strong>
                <span className="inline-flex items-center rounded-full border border-[#B9DDD0] bg-white px-2 py-0.5 text-[11.5px] font-bold text-[#397562] whitespace-nowrap shrink-0">
                  ✓ {lang === 'ko' ? '프롬프트에 자동 반영 중' : lang === 'ja' ? 'プロンプトに自動反映中' : lang === 'zh' ? '正自动应用到提示词' : 'Auto-applied to prompt'}
                </span>
              </div>

              <dl className="grid grid-cols-[78px_minmax(0,1fr)] gap-x-2 gap-y-2 text-[13px] sm:text-[13.5px]">
                <dt className="font-bold text-[#668078]">{lang === 'ko' ? '캐릭터 기준' : lang === 'ja' ? 'キャラ基準' : lang === 'zh' ? '角色来源' : 'Character'}</dt>
                <dd className="font-bold text-[#244E43]">
                  {characterSource === 'photo'
                    ? `📷 ${lang === 'ko' ? '참고 사진' : lang === 'ja' ? '参照写真' : lang === 'zh' ? '参考照片' : 'Reference photo'}`
                    : characterSource === 'random'
                    ? `🎲 ${lang === 'ko' ? '랜덤 캐릭터' : lang === 'ja' ? 'ランダムキャラ' : lang === 'zh' ? '随机角色' : 'Random character'}`
                    : `✏️ ${lang === 'ko' ? '직접 설정' : lang === 'ja' ? '直接設定' : lang === 'zh' ? '手动设置' : 'Direct setup'}`}
                </dd>

                {characterSource === 'photo' && (
                  <>
                    <dt className="font-bold text-[#668078]">{lang === 'ko' ? '사진 반영' : lang === 'ja' ? '写真反映' : lang === 'zh' ? '照片模式' : 'Photo mode'}</dt>
                    <dd className="font-bold text-[#244E43]">{getPhotoModeLabel(lang)}</dd>
                  </>
                )}

                <dt className="font-bold text-[#668078] pt-0.5">{lang === 'ko' ? '선택 태그' : lang === 'ja' ? '選択タグ' : lang === 'zh' ? '已选标签' : 'Tags'}</dt>
                <dd className="min-w-0">
                  {activeTagList.length > 0 ? (
                    <div className="flex flex-wrap gap-1" title={charManual}>
                      {activeTagList.map((tag, index) => (
                        <span key={`summary-${tag}-${index}`} className="max-w-full truncate rounded-full border border-[#C9E3DA] bg-white px-2 py-0.5 text-[12px] font-bold text-[#397562] whitespace-nowrap">{tag}</span>
                      ))}
                      <span className="self-center text-[12px] font-bold text-[#668078] whitespace-nowrap">
                        {lang === 'ko' ? `총 ${activeTagList.length}개 반영` : lang === 'ja' ? `全${activeTagList.length}個を反映` : lang === 'zh' ? `共应用${activeTagList.length}个` : `${activeTagList.length} applied`}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[#49675E]">{lang === 'ko' ? '아직 선택하지 않았어요' : lang === 'ja' ? 'まだ選択されていません' : lang === 'zh' ? '尚未选择' : 'None selected yet'}</span>
                      <span className="sentence-flow text-[12px] leading-relaxed font-medium text-[#789087]">{lang === 'ko' ? '아래에서 원하는 특징을 선택해 주세요.' : lang === 'ja' ? '下から希望の特徴を選択してください。' : lang === 'zh' ? '请在下方选择想要的特征。' : 'Choose the features you want below.'}</span>
                    </div>
                  )}
                </dd>
              </dl>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest rounded-md p-3.5 sm:p-md shadow-bubbly border border-outline-variant">
            <div className="mb-md flex flex-col gap-3">
              <span className="px-1 text-[14px] font-bold text-on-surface-variant">{t.characterSource}</span>
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
                    className={`interactive-control min-h-11 rounded-[8px] border px-1.5 sm:px-3 py-2 text-[14px] font-bold text-center overflow-hidden text-ellipsis whitespace-nowrap transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-strong focus-visible:ring-offset-2 cursor-pointer ${
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
                        <div className="text-[13px] leading-relaxed text-amber-800 font-medium">
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
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] sm:text-[14px] font-bold text-amber-950 flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                      📸 {lang === 'ko' ? '참고 사진 + 태그 연동' : lang === 'ja' ? '参照写真 + タグ連動' : lang === 'zh' ? '参考照片 + 标签联动' : 'Photo + Tag Synergy'}
                    </span>
                    <span className="text-[11px] sm:text-[12px] font-bold text-amber-800 bg-amber-200/90 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                      ✨ {lang === 'ko' ? '사진 기반 융합' : lang === 'ja' ? '写真ベース融合' : lang === 'zh' ? '照片深度融合' : 'Photo Active'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="group" aria-label={t.photoMethod}>
                    {[
                      ['balanced', t.photoBalanced],
                      ['likeness', t.photoLikeness],
                      ['style', t.photoStyle],
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
                      💡 {lang === 'ko' 
                        ? '사진 참고 모드 (인물 / 동물 / 사물 자유 결합)' 
                        : lang === 'ja' 
                        ? '写真参照モード (人物 / 動物 / アイテム自由連携)' 
                        : lang === 'zh' 
                        ? '照片参考模式 (人物 / 宠物动物 / 物品自由结合)' 
                        : 'Photo Reference Mode (Person / Animal / Object)'}
                    </p>
                    <p className="text-[14px] text-amber-800 leading-relaxed font-normal">
                      {lang === 'ko'
                        ? '단독 인물·커플·가족 사진뿐만 아니라 반려견/반려묘(동물), 캐릭터/사물 사진도 모두 가능하며 선택하신 테마 및 태그와 100% 융합됩니다.'
                        : lang === 'ja'
                        ? '単独・カップル・家族写真はもちろん、ペット(犬・猫)やアイテム写真もすべて対応。選択したテーマやタグと100%融合します。'
                        : lang === 'zh'
                        ? '支持个人、情侣、全家福照片，以及宠物猫狗和物品照片，与所选的主题及标签100%完美结合。'
                        : 'Supports photos of single persons, couples, pets/animals, or objects. All selected themes and tags combine 100% into the prompt.'}
                    </p>
                    <div className="bg-amber-50/80 p-2.5 rounded-md text-[13.5px] text-amber-850 font-normal border border-amber-200/70 leading-relaxed flex flex-col gap-1.5">
                      <span>✨ {lang === 'ko' 
                        ? '개인 셀카/프로필 사진 + [일상/직장인] 테마 → 카톡·인스타·슬랙(Slack) 프로필 및 나만의 2D 캐리커처 15종 리액션 짤 완성!' 
                        : lang === 'ja' 
                        ? '自撮り/プロフィール写真 + [日常/仕事]テーマ → LINE・SNS・Slack用アイコン＆自分そっくりの15種リアクション画像完成！' 
                        : lang === 'zh' 
                        ? '个人自拍/头像照片 + [日常/职场] 主题 → 打造微信/小红书/工作头像及专属15格真人卡通表情包！' 
                        : 'Selfie/Profile photo + [Daily/Office] theme → Custom 2D caricature avatar for KakaoTalk, Instagram, and Slack profile!'}</span>
                      <span>✨ {lang === 'ko' 
                        ? '아이 얼굴 사진 + [유아/학생] 테마 → 우리 아이 얼굴이 담긴 어린이집·유치원 방수 네임스티커 & 알림장 스티커 완성!' 
                        : lang === 'ja' 
                        ? 'お子様の顔写真 + [幼児・児童]テーマ → 保育園・幼稚園の名前シール＆お名前スタンプ完成！' 
                        : lang === 'zh' 
                        ? '孩子照片 + [幼儿/学生] 主题 → 制作专属的幼儿园防水姓名贴纸与家园共育表情包！' 
                        : 'Child photo + [Kids/School] theme → Personalized daycare/kindergarten name stickers & daily report stamps!'}</span>
                      <span>✨ {lang === 'ko' 
                        ? '어린이집/유치원 선생님 사진 + [선생님/교사] 테마 → 키즈노트 알림장 및 원아 칭찬용 세상에 하나뿐인 얼굴 스탬프 완성!' 
                        : lang === 'ja' 
                        ? '保育士・先生の写真 + [教師・先生]テーマ → 連絡帳やご褒美スタンプに使える世界に一つの顔スタンプ完成！' 
                        : lang === 'zh' 
                        ? '幼师/老师照片 + [教师/老师] 主题 → 制作家园联系册与幼儿专属“真棒”表扬印章！' 
                        : 'Teacher photo + [Teacher/Educator] theme → Personalized praise & daily report sticker pack for students!'}</span>
                      <span>✨ {lang === 'ko' 
                        ? '커플/웨딩/가족 사진 + [일상/가족] 테마 → 우리 가족·커플만의 특별한 메신저 이모티콘 완성!' 
                        : lang === 'ja' 
                        ? 'カップル/家族写真 + [日常・家族]テーマ → 家族・2人だけの特別なカスタムスタンプ完成！' 
                        : lang === 'zh' 
                        ? '情侣/全家福照片 + [日常/家庭] 主题 → 打造独一无二的专属家庭/情侣表情包！' 
                        : 'Couple/Family photo + [Daily/Family] theme → Custom personalized messenger sticker pack!'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

                            {/* 🌟 Section 0: One-Click Golden Combos Showcase (Instant 1-Second Setup) */}
            <div className="bg-gradient-to-br from-[#FFFDF7] via-[#FFF8EE] to-[#F2FAF5] rounded-xl p-3 sm:p-4 border border-[#FCD3A1] shadow-2xs flex flex-col gap-2.5 mb-3.5">
              <div className="flex flex-col gap-1">
                <div className="h-[28px] flex items-center justify-between gap-2 w-full">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="bg-amber-400 text-amber-950 text-[10px] sm:text-[10.5px] font-black px-2 py-0.5 rounded-full shadow-2xs shrink-0 leading-none">
                      HOT
                    </span>
                    <h3 className="text-[13.5px] sm:text-[15px] font-black text-amber-950 flex items-center gap-1 truncate whitespace-nowrap">
                      <span>🌟</span>
                      <span>
                        {lang === 'ko' ? '원클릭 인기 황금 조합' : lang === 'ja' ? 'ワンクリック黄金セット' : lang === 'zh' ? '一键热门黄金组合' : 'One-Click Golden Combos'}
                      </span>
                    </h3>
                  </div>

                  {previousComboBackup ? (
                    <button
                      type="button"
                      onClick={undoGoldenCombo}
                      className="interactive-control h-[25px] text-[11px] font-extrabold text-amber-900 bg-white border border-amber-300 px-2.5 rounded-full shadow-2xs hover:bg-amber-100 flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 active:scale-95 animate-in fade-in duration-150"
                    >
                      <RotateCcw size={11} /> {lang === 'ko' ? '되돌리기' : lang === 'ja' ? '元に戻す' : lang === 'zh' ? '撤销' : 'Undo'}
                    </button>
                  ) : (
                    <div className="h-[25px]" />
                  )}
                </div>
                
                <div className="flex items-center justify-between gap-2 w-full">
                  <p className="min-w-0 text-[12px] font-bold text-amber-800/90 leading-tight truncate whitespace-nowrap">
                    {lang === 'ko' ? '옆으로 밀어 더 보기 → 원하는 세트를 터치하세요' : lang === 'ja' ? '横にスワイプして表示 → セットをタップ' : lang === 'zh' ? '左右滑动查看更多 → 点击想要的组合' : 'Swipe sideways for more → Tap a combo'}
                  </p>
                  <div className="hidden sm:flex items-center gap-1 shrink-0" aria-label={lang === 'ko' ? '황금 조합 좌우 이동' : 'Golden combo navigation'}>
                    <button
                      type="button"
                      onClick={() => goldenComboScrollRef.current?.scrollBy({ left: -245, behavior: 'smooth' })}
                      disabled={!goldenComboScrollCues.left}
                      className="interactive-control flex h-7 w-7 items-center justify-center rounded-full border border-amber-300 bg-white text-[17px] font-black text-amber-900 hover:bg-amber-100 disabled:cursor-default disabled:opacity-35"
                      aria-label={lang === 'ko' ? '이전 조합 보기' : 'Previous combos'}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => goldenComboScrollRef.current?.scrollBy({ left: 245, behavior: 'smooth' })}
                      disabled={!goldenComboScrollCues.right}
                      className="interactive-control flex h-7 w-7 items-center justify-center rounded-full border border-amber-300 bg-white text-[17px] font-black text-amber-900 hover:bg-amber-100 disabled:cursor-default disabled:opacity-35"
                      aria-label={lang === 'ko' ? '다음 조합 보기' : 'Next combos'}
                    >
                      ›
                    </button>
                  </div>
                </div>
              </div>

              {/* Golden Combos Horizontal Scroll Carousel */}
              <div className="relative -mr-3 sm:-mr-4">
                <div
                  ref={goldenComboScrollRef}
                  onScroll={(event) => {
                    const element = event.currentTarget;
                    const maxScrollLeft = Math.max(0, element.scrollWidth - element.clientWidth);
                    setGoldenComboScrollCues({
                      left: element.scrollLeft > 8,
                      right: element.scrollLeft < maxScrollLeft - 8,
                    });
                  }}
                  className="flex gap-2.5 overflow-x-auto py-1 pl-0.5 pr-10 no-scrollbar scroll-smooth overscroll-x-contain touch-pan-x touch-pan-y"
                  aria-label={lang === 'ko' ? '좌우로 스크롤하는 인기 황금 조합 목록' : 'Horizontally scrollable golden combo list'}
                >
                  {sortedGoldenCombos.map((combo) => {
                  const isSelected = activeGoldenComboId === combo.id;
                  const titleText = combo.title[lang] || combo.title.ko;
                  const descText = combo.desc[lang] || combo.desc.ko;

                  return (
                    <button
                      key={combo.id}
                      type="button"
                      onClick={() => applyGoldenCombo(combo)}
                      className={`interactive-control touch-manipulation flex flex-col text-left p-3 rounded-xl w-[220px] sm:w-[235px] shrink-0 border-2 transition-all duration-200 cursor-pointer select-none active:scale-95 ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#FFFBEB] to-[#FEF3C7] border-amber-500 shadow-md ring-2 ring-amber-400/60'
                          : 'bg-white hover:bg-amber-50/50 border-amber-200/80 hover:border-amber-300 shadow-xs'
                      }`}
                    >
                      {/* Top Row: Icon + Title + Status Badge */}
                      <div className="flex items-center justify-between gap-1.5 mb-1 w-full">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span className="text-[20px] sm:text-[22px] leading-none shrink-0">{combo.icon}</span>
                          <strong className="text-[12.5px] sm:text-[13px] font-black text-slate-900 leading-tight truncate whitespace-nowrap">
                            {titleText}
                          </strong>
                        </div>
                        {isSelected && (
                          <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5 animate-pulse shadow-2xs">
                            <CheckCircle2 size={9} /> {lang === 'ko' ? '적용' : lang === 'ja' ? '適用済み' : lang === 'zh' ? '已应用' : 'APPLIED'}
                          </span>
                        )}
                      </div>

                      {/* Middle Row: Crisp 1-line Description */}
                      <p className="text-[12px] font-medium text-slate-600 leading-normal mb-2 truncate whitespace-nowrap w-full">
                        {descText}
                      </p>

                      {/* Bottom Row: Theme Badge + Action Status */}
                      <div className="mt-auto flex items-center justify-between pt-1.5 border-t border-amber-200/70 text-[11.5px] font-bold text-amber-800 w-full">
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-extrabold truncate max-w-[125px] whitespace-nowrap">
                          🏷️ {themeKeys[combo.themeIdx] || combo.themeName}
                        </span>
                        <span className={`font-black text-[11px] shrink-0 whitespace-nowrap ${isSelected ? 'text-amber-800' : 'text-[#C2410C]'}`}>
                          {isSelected
                            ? (lang === 'ko' ? '✓ 설정 완료' : lang === 'ja' ? '✓ 適用済み' : lang === 'zh' ? '✓ 已应用' : '✓ Applied')
                            : (lang === 'ko' ? '원클릭 적용' : lang === 'ja' ? 'ワンクリック適用' : lang === 'zh' ? '一键应用' : 'Apply Now')}
                        </span>
                      </div>
                    </button>
                    );
                  })}
                </div>
                <div className={`pointer-events-none absolute inset-y-0 left-0 w-10 rounded-l-xl bg-gradient-to-r from-[#F7FAF4] via-[#F7FAF4]/80 to-transparent transition-opacity ${goldenComboScrollCues.left ? 'opacity-100' : 'opacity-30'}`} aria-hidden="true">
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[20px] font-black text-amber-700/75">‹</span>
                </div>
                <div className={`pointer-events-none absolute inset-y-0 right-0 w-10 rounded-r-xl bg-gradient-to-l from-[#F7FAF4] via-[#F7FAF4]/80 to-transparent transition-opacity ${goldenComboScrollCues.right ? 'opacity-100' : 'opacity-30'}`} aria-hidden="true">
                  <span className={`absolute right-1 top-1/2 -translate-y-1/2 text-[20px] font-black text-amber-700/75 ${goldenComboScrollCues.right ? 'motion-safe:animate-pulse' : ''}`}>›</span>
                </div>
              </div>
            </div>

            {/* Character Prompt Direct Input Textarea */}
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex flex-col gap-0.5 px-1">
                <span className="text-[13.5px] sm:text-[14px] font-black text-mint-strong flex items-center gap-1.5">
                  <span>✏️</span>
                  <span>{lang === 'ko' ? '캐릭터 상세 설명 & 태그 자동 반영' : lang === 'ja' ? 'キャラクター詳細＆タグ自動反映' : lang === 'zh' ? '角色详细描述与标签自动同步' : 'Character Prompt & Active Tags'}</span>
                </span>
                <span className="text-[11.5px] sm:text-[12px] text-mint-strong/85 font-medium pl-6">
                  {lang === 'ko' ? '직접 수정 및 타이핑 가능' : lang === 'ja' ? '直接編集・タイピング可能' : lang === 'zh' ? '支持直接编辑与手动输入' : 'Editable directly & type freely'}
                </span>
              </div>
              <textarea 
                className="w-full bg-white border-2 border-mint-border rounded-md p-3.5 sm:p-4 text-on-surface font-medium focus:font-bold placeholder:text-slate-400 placeholder:font-normal placeholder:opacity-75 focus:placeholder:opacity-40 focus:outline-none focus:ring-4 focus:ring-mint focus:border-mint-border resize-y min-h-[90px] shadow-sm scroll-smooth [scrollbar-width:thin] [scrollbar-color:#A6E3D0_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#A6E3D0] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-mint-strong" 
                placeholder={t.placeholder}
                value={charManual}
                onChange={(e) => setCharManual(e.target.value)}
              />
            </div>

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
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>📌 {lang === 'ko' ? '태그 선택 규칙:' : 'Tag Rules:'}</span>
                  <span className="bg-white/90 px-2 py-0.5 rounded text-[11.5px] border border-mint-border font-bold">
                    {lang === 'ko' ? '화풍/피사체: 1개' : 'Art: 1'}
                  </span>
                  <span className="bg-white/90 px-2 py-0.5 rounded text-[11.5px] border border-mint-border font-bold">
                    {lang === 'ko' ? '의상/소품/성격: 다중 선택' : 'Props/Outfits: Multi'}
                  </span>
                  <span className="text-[12px] text-mint-strong/80 font-normal">
                    (⚡ {lang === 'ko' ? '클릭 시 자동 동기화 / 재클릭 시 해제' : 'Auto-sync on click / Toggle off'})
                  </span>
                </div>
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
                  <div className={`px-3.5 py-2 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[12px] font-bold transition-all ${
                    isOptimal 
                      ? 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]' 
                      : isTooMany 
                      ? 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
                      : 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
                  }`}>
                    <div className="flex items-center justify-between sm:justify-start gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-white/95 border shrink-0 whitespace-nowrap shadow-2xs">
                        {isOptimal ? '✨ 사진급 최고 화질' : isTooMany ? '⚠️ 태그 과다 주의' : '💡 화질 최적화 추천'}
                      </span>
                      <span className="sm:hidden px-2 py-0.5 rounded bg-white/95 border text-[11px] font-extrabold shrink-0 shadow-2xs">
                        {lang === 'ko' ? `선택 태그: ${tagCount}개` : `Tags: ${tagCount}`}
                      </span>
                    </div>
                    <p className="text-[13px] font-medium leading-relaxed break-keep flex-1">
                      {isOptimal 
                        ? (lang === 'ko' ? 'AI 가중치가 가장 선명하게 집중되는 3~5개 황금 비율 상태입니다! (사진급 일관성)' : 'Golden Ratio! AI attention is 100% focused for crisp sticker quality.')
                        : isTooMany 
                        ? (lang === 'ko' ? '태그가 6개 이상이면 AI가 특징을 뭉갤 수 있으니 4~5개로 줄여보세요.' : 'Too many tags (6+) may dilute AI focus. Reduce to 4-5 for best quality.')
                        : (lang === 'ko' ? '태그를 1~2개 더 조합하시면(의상/소품/화풍) 캐릭터가 더욱 완성도 높게 나옵니다.' : 'Add 1-2 more tags (outfit/prop/style) for full character identity.')}
                    </p>
                    <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded bg-white/95 border text-[11px] font-extrabold shrink-0 shadow-2xs">
                      {lang === 'ko' ? `선택 태그: ${tagCount}개` : `Tags: ${tagCount}`}
                    </span>
                  </div>
                );
              })()}

              {/* Sticky Header: Category Tabs + Active Tags Bar */}
              <div className="sticky top-0 z-20 bg-surface-container-highest shadow-xs">
                <div className="no-scrollbar flex flex-wrap bg-[#EAF8F3] px-2 border-b border-mint-border">
                  {categoryKeys.map(category => {
                    const catTags = currentTags[category] || [];
                    const selectedCount = catTags.filter(t => isTagSelected(t)).length;
                    const isActive = activeTagCategory === category;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveTagCategory(category)}
                        className={`whitespace-nowrap px-3 py-2.5 text-[13px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isActive 
                            ? 'text-mint-strong border-b-2 border-mint-strong bg-white/90 font-black shadow-2xs' 
                            : 'text-mint-strong/80 hover:text-mint-strong hover:bg-mint-hover/50 border-b-2 border-transparent'
                        }`}
                      >
                        <span>{category}</span>
                        {selectedCount > 0 && (
                          <span className="bg-mint-strong text-white text-[10.5px] px-1.5 py-0.2 rounded-full font-black leading-none shadow-2xs">
                            {selectedCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Integrated Active Character Tags Bar directly inside Tag Screen */}
                {charManual.trim() && (
                  <div className="bg-[#F0FDF8] border-b border-mint-border px-3.5 py-2 flex flex-col gap-1.5 shadow-xs animate-in fade-in duration-200">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-extrabold text-mint-strong flex items-center gap-1.5">
                        <span>🏷️</span>
                        <span>{lang === 'ko' ? '적용된 태그' : lang === 'ja' ? '選択中のタグ' : lang === 'zh' ? '已选标签' : 'Active Tags'}:</span>
                        <span className="bg-mint-strong text-white text-[10.5px] px-1.5 py-0.2 rounded-full font-black">
                          {charManual.split(',').map(v => v.trim()).filter(Boolean).length}개
                        </span>
                      </span>
                      <button 
                        type="button"
                        onClick={clearSelectedTags}
                        className="text-[12px] font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <Trash2 size={11} /> {lang === 'ko' ? '선택 태그 지우기' : lang === 'ja' ? 'タグを解除' : lang === 'zh' ? '清除标签' : 'Clear Tags'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto no-scrollbar">
                      {charManual.split(',').map(v => v.trim()).filter(Boolean).map(tag => (
                        <span 
                          key={tag} 
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-mint-strong border border-mint-border text-[12.5px] font-extrabold shadow-2xs hover:border-mint-strong transition-all whitespace-nowrap"
                        >
                          <span className="text-[#2D7D64] font-black">✓</span>
                          <span>{tag}</span>
                          <button 
                            type="button"
                            onClick={() => removeSelectedTag(tag)} 
                            className="hover:text-red-600 text-slate-400 hover:bg-slate-100 rounded-full w-3.5 h-3.5 flex items-center justify-center font-black text-[12px] leading-none transition-colors cursor-pointer ml-0.5"
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

              {/* Scrollable Tag Chips Container (Smooth Inertial Scroll + Slim Scrollbar + Bottom Fade Indicator) */}
              <div className="relative">
                <div className="p-3.5 pb-6 flex flex-wrap gap-2 bg-surface-container-lowest max-h-[330px] sm:max-h-[360px] overflow-y-auto overscroll-y-auto scroll-smooth [scrollbar-width:thin] [scrollbar-color:#A6E3D0_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#A6E3D0] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-mint-strong">
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
                        className={`interactive-control touch-manipulation min-h-[38px] px-3.5 py-1.5 rounded-full text-[13px] font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none active:scale-95 ${
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
                {/* Bottom Fade Gradient Indicator */}
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white/90 via-white/50 to-transparent rounded-b-md" />
              </div>
            </div>
          </div>

          {showResetConfirm && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-label={lang === 'ko' ? '모든 설정 초기화 확인' : 'Confirm reset'} onMouseDown={(event) => { if (event.target === event.currentTarget) setShowResetConfirm(false); }}>
              <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-red-100">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600 mb-3"><Trash2 size={20} /></div>
                <h3 className="text-[18px] font-black text-on-surface">{lang === 'ko' ? '모든 설정을 초기화할까요?' : 'Reset all settings?'}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-on-surface-variant">
                  {lang === 'ko'
                    ? '캐릭터 설정, 선택 태그, 테마, 문구 15개와 모든 생성 옵션이 처음 상태로 돌아갑니다. 언어와 사용 통계는 유지됩니다.'
                    : 'Character settings, tags, themes, all 15 phrases, and generation options will return to their defaults. Language and usage stats will be kept.'}
                </p>
                <p className="mt-2 text-[12px] font-bold text-red-600">{lang === 'ko' ? '직접 입력한 내용은 복구할 수 없습니다.' : 'Manually entered content cannot be recovered.'}</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setShowResetConfirm(false)} className="min-h-11 rounded-xl border border-outline-variant bg-white text-[13px] font-bold text-on-surface hover:bg-slate-50">{lang === 'ko' ? '취소' : 'Cancel'}</button>
                  <button type="button" onClick={resetAllSettings} className="min-h-11 rounded-xl border border-red-600 bg-red-600 text-[13px] font-black text-white hover:bg-red-700">{lang === 'ko' ? '모두 초기화' : 'Reset all'}</button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section 2: Emoji Phrases */}
        <section id="emoticon-phrase-grid" className="flex flex-col gap-md break-keep">
          <div className="rounded-xl border border-[#B9DDD0] bg-linear-to-br from-[#F7FCFA] to-white p-3.5 sm:p-4 shadow-bubbly flex flex-col gap-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-[15px] sm:text-[16.5px] font-black text-on-surface">{lang === 'ko' ? '이모티콘 문구 테마 선택' : t.phrases}</h2>
                <p className="text-[12px] sm:text-[12.5px] leading-relaxed font-medium text-on-surface-variant">
                  {lang === 'ko' ? '원하는 상황을 선택하면 15개 문구가 한 번에 변경됩니다.' : 'Choose a situation to update all 15 phrases.'}
                </p>
              </div>
              <button onClick={shuffleEmoticons} className="interactive-control min-h-9 px-2.5 rounded-lg bg-white text-mint-strong border border-mint-border text-[12px] font-bold shrink-0 whitespace-nowrap">
                <Shuffle size={13} className="inline mr-1" />{t.randomMix}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowThemePicker(true)}
              className="interactive-control touch-manipulation w-full min-h-[62px] sm:min-h-[68px] rounded-xl border-2 border-[#9ED2C0] bg-white px-4 py-2.5 sm:px-5 sm:py-3 text-left shadow-xs hover:bg-[#F3FAF7] focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40 transition-all"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="block text-[11px] sm:text-[11.5px] font-semibold text-mint-strong mb-0.5 uppercase tracking-wide">🎨 {t.activeThemeLabel || 'Active Theme'}</span>
                  <strong className="block truncate text-[16px] sm:text-[18px] font-bold text-[#133E32] tracking-tight">
                    {activeTheme === 'custom' ? (t.customTheme || '✏️ Custom Theme') : activeTheme}
                  </strong>
                </span>
                <span className="inline-flex min-h-9 sm:min-h-9.5 items-center rounded-lg border border-[#A8D2C3] bg-[#E3F4ED] hover:bg-[#D5EFE5] px-3 sm:px-3.5 text-[12px] sm:text-[13px] font-bold text-[#1E5D4B] shrink-0 shadow-2xs">
                  {lang === 'ko' ? '테마 변경 ›' : 'Change ›'}
                </span>
              </span>
            </button>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar" aria-label={lang === 'ko' ? '추천 테마' : 'Recommended themes'}>
              <span className="text-[11px] sm:text-[11.5px] font-extrabold text-[#8A6048] shrink-0 whitespace-nowrap">🔥 {lang === 'ko' ? '인기 추천' : 'Popular'}</span>
              {sortedThemeKeys.slice(0, 5).map((theme) => (
                <button key={theme} type="button" onClick={() => selectPopularTheme(theme)} className={`touch-manipulation min-h-8 max-w-[180px] truncate rounded-full border px-3 text-[12.5px] sm:text-[13px] font-bold shrink-0 whitespace-nowrap ${activeTheme === theme ? 'bg-[#FFF0E3] border-[#E9B88E] text-[#9A4B22] font-black' : 'bg-white border-[#E8D8CA] text-[#7A5A46]'}`}>
                  {activeTheme === theme ? '✓ ' : ''}{theme}
                </button>
              ))}
            </div>
          </div>

          {showThemePicker && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-950/50 p-0 sm:p-4" role="dialog" aria-modal="true" aria-label={t.themeSelect} onMouseDown={(event) => { if (event.target === event.currentTarget) setShowThemePicker(false); }}>
              <div
                className="w-full sm:max-w-2xl overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl flex flex-col"
                style={{ maxHeight: `${Math.min(720, Math.max(280, (themePickerViewportHeight || 720) - 8))}px` }}
              >
                <div className="flex items-center justify-between gap-3 border-b border-outline-variant px-4 py-3.5 sm:px-5">
                  <div>
                    <strong className="block text-[18px] font-black text-on-surface">🎨 {t.themeSelect}</strong>
                    <span className="text-[12px] font-medium text-on-surface-variant">{lang === 'ko' ? `총 ${themeKeys.length}개 테마에서 검색할 수 있습니다.` : `${themeKeys.length} themes available.`}</span>
                  </div>
                  <button type="button" onClick={() => setShowThemePicker(false)} className="interactive-control h-10 w-10 rounded-full border border-outline-variant bg-surface-container-lowest text-[24px] leading-none text-on-surface" aria-label={lang === 'ko' ? '닫기' : 'Close'}>×</button>
                </div>

                <div className="p-4 sm:px-5 sm:pt-4 pb-3 border-b border-outline-variant bg-[#F8FCFA]">
                  <label className="relative block">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[16px]">🔍</span>
                    <input
                      type="search"
                      value={themeSearch}
                      onChange={(event) => setThemeSearch(event.target.value)}
                      placeholder={lang === 'ko' ? '테마 또는 문구 검색 (예: 수능, 회사, 할로윈)' : 'Search themes or phrases'}
                      className="h-12 w-full rounded-xl border-2 border-mint-border bg-white pl-10 pr-4 text-[14px] font-bold text-on-surface outline-none focus:border-mint-strong focus:ring-4 focus:ring-mint/30"
                    />
                  </label>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 flex flex-col gap-4 [scrollbar-width:thin]">
                  {!normalizedThemeSearch && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[12px] font-black text-on-surface-variant">{lang === 'ko' ? '최근·추천 테마' : 'Recent & recommended'}</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {recentThemeKeys.map((theme) => (
                          <button key={`recent-${theme}`} type="button" onClick={() => selectPopularTheme(theme)} className={`touch-manipulation min-h-12 rounded-lg border px-3.5 py-2 text-[15px] sm:text-[16px] font-black text-left truncate ${activeTheme === theme ? 'bg-mint-strong text-white border-[#1E453B] ring-2 ring-mint/50' : 'bg-[#EEF8F4] text-[#1E4E42] border-[#B9DDD0] hover:bg-[#E3F4ED]'}`}>
                            {activeTheme === theme ? '✓ ' : ''}{theme}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-black text-on-surface-variant">{normalizedThemeSearch ? (lang === 'ko' ? '검색 결과' : 'Search results') : (lang === 'ko' ? '전체 테마' : 'All themes')}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">{filteredThemeKeys.length}</span>
                    </div>
                    {filteredThemeKeys.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {filteredThemeKeys.map((theme, index) => (
                          <button key={theme} type="button" onClick={() => selectPopularTheme(theme)} className={`touch-manipulation min-h-13 rounded-xl border px-4 py-3 text-left flex items-center gap-3 ${activeTheme === theme ? 'bg-[#DDF3EA] border-2 border-mint-strong text-[#154639]' : 'bg-[#F7FCFA] border-[#C6E7DA] text-[#1B4B3D] hover:border-[#9FD5C4] hover:bg-[#EEF8F4]'}`}>
                            <span className={`flex h-7 min-w-7 items-center justify-center rounded-md text-[11.5px] font-black ${activeTheme === theme ? 'bg-mint-strong text-white' : 'bg-slate-100 text-slate-500'}`}>{index + 1}</span>
                            <span className="min-w-0 flex-1 truncate text-[15.5px] sm:text-[17px] font-black">{theme}</span>
                            {activeTheme === theme && <span className="text-[16px] font-black text-mint-strong">✓</span>}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-outline-variant bg-slate-50 px-4 py-8 text-center text-[13px] font-bold text-slate-500">{lang === 'ko' ? '검색 결과가 없습니다. 다른 단어를 입력해 보세요.' : 'No themes found.'}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 md:gap-3 bg-white rounded-xl p-3 sm:p-3.5 shadow-bubbly border-2 border-[#C6E7DA]">
            {emoticons.map((text, idx) => (
              <label key={idx} className={`relative block ${
                  idx === emoticons.length - 1
                    ? 'col-span-2 max-w-[calc(50%_-_6px)] justify-self-center sm:col-span-1 sm:max-w-none'
                    : ''
                }`}>
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#DDF3EA] text-[9.5px] sm:text-[10px] font-black text-[#2F7D68] shadow-2xs shrink-0">{idx + 1}</span>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => handleEmoticonChange(idx, e.target.value)}
                  className={`interactive-control w-full h-[44px] sm:h-[48px] bg-[#F4FBF7] hover:bg-[#ECF8F1] focus:bg-white rounded-full pl-10 sm:pl-10.5 pr-3 text-left text-[#1D4A3C] focus:text-slate-900 ${getDynamicPhraseFontSize(text)} placeholder:text-slate-400 focus:outline-none focus:ring-3 focus:ring-mint/50 border-2 border-[#B8DDCF] focus:border-mint-strong transition-all overflow-x-auto whitespace-nowrap`}
                  placeholder={`Phrase ${idx + 1}`}
                />
              </label>
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
                        className={`interactive-control min-h-[44px] sm:min-h-[46px] px-2 py-1.5 rounded-xl border font-bold flex items-center justify-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] focus-visible:ring-offset-2 ${
                          isSelected
                            ? 'bg-[#FFE8B5] text-[#5A461B] border-[#E8C66A] shadow-sm'
                            : 'bg-white text-on-surface border-[#E9DFC5] hover:bg-[#FFF3D8]'
                        }`}
                      >
                        {copiedType === copyKey
                          ? <CheckCircle2 size={15} className="shrink-0" aria-label={t.copiedPrompt} />
                          : <span className="text-[10px] sm:text-[10.5px] font-black opacity-70 shrink-0">{idx + 1}.</span>}
                        <span className={`${getDynamicBatchFontSize(phrase)} font-bold leading-none truncate`}>{phrase}</span>
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
                      className={`interactive-control min-h-10 rounded-[8px] border px-2 sm:px-3 py-2 text-[13px] font-bold text-center whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] ${
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
                      className={`interactive-control min-h-10 rounded-[8px] border px-1 sm:px-2 py-2 text-[12px] sm:text-[13px] font-bold text-center text-ellipsis overflow-hidden whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] ${
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
                  <span className="sentence-flow text-[13px] font-medium text-[#8A661C] leading-relaxed">{t.repairHelp}</span>
                </div>
                <div className={`grid gap-2 ${gptTextMode === 'text' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {[
                    ['identity', t.geminiRepairIdentity],
                    ['crop', t.geminiRepairCrop],
                    ...(gptTextMode === 'text' ? [['text', t.geminiRepairText]] : []),
                  ].map(([repairType, label]) => (
                    <button
                      key={repairType}
                      type="button"
                      onClick={() => copyRepairPrompt(repairType, gptTextMode, 'gpt-repair', 'gpt')}
                      className="interactive-control min-h-11 rounded-[8px] border border-[#E9DFC5] bg-white px-1.5 sm:px-3 py-2 text-[12px] sm:text-[13px] font-bold text-[#795B16] hover:bg-[#FFF3D8] overflow-hidden text-ellipsis whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A]"
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
            <div className="rounded-lg border border-[#F6D77A] bg-[#FFF7DF] p-3 flex flex-col gap-3">
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
                      className={`interactive-control min-h-10 rounded-[8px] border px-2 sm:px-3 py-2 text-[13px] font-bold text-center whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] ${
                        geminiTextMode === mode
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
                      className={`interactive-control min-h-10 rounded-[8px] border px-1 sm:px-2 py-2 text-[12px] sm:text-[13px] font-bold text-center text-ellipsis overflow-hidden whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] ${
                        geminiBackgroundMode === mode
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
                  <span className="text-[13px] font-bold text-[#795B16]">{t.geminiRepairTitle}</span>
                  <span className="sentence-flow text-[13px] font-medium text-[#8A661C] leading-relaxed">{t.repairHelp}</span>
                </div>
                <div className={`grid gap-2 ${geminiTextMode === 'text' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {[
                    ['identity', t.geminiRepairIdentity],
                    ['crop', t.geminiRepairCrop],
                    ...(geminiTextMode === 'text' ? [['text', t.geminiRepairText]] : []),
                  ].map(([repairType, label]) => (
                    <button
                      key={repairType}
                      type="button"
                      onClick={() => copyRepairPrompt(repairType, geminiTextMode, 'gemini-repair', 'gemini')}
                      className="interactive-control min-h-11 rounded-[8px] border border-[#E9DFC5] bg-white px-1.5 sm:px-3 py-2 text-[12px] sm:text-[13px] font-bold text-[#795B16] hover:bg-[#FFF3D8] overflow-hidden text-ellipsis whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A]"
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
            <div className="rounded-lg border border-[#F6D77A] bg-[#FFF7DF] p-3 flex flex-col gap-3">
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
                      className={`interactive-control min-h-10 rounded-[8px] border px-2 sm:px-3 py-2 text-[13px] font-bold text-center whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] ${
                        grokTextMode === mode
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
                      className={`interactive-control min-h-10 rounded-[8px] border px-1 sm:px-2 py-2 text-[12px] sm:text-[13px] font-bold text-center text-ellipsis overflow-hidden whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] ${
                        grokBackgroundMode === mode
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
                  <span className="text-[13px] font-bold text-[#795B16]">{t.grokRepairTitle}</span>
                  <span className="sentence-flow text-[13px] font-medium text-[#8A661C] leading-relaxed">{t.repairHelp}</span>
                </div>
                <div className={`grid gap-2 ${grokTextMode === 'text' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {[
                    ['identity', t.geminiRepairIdentity],
                    ['crop', t.geminiRepairCrop],
                    ...(grokTextMode === 'text' ? [['text', t.geminiRepairText]] : []),
                  ].map(([repairType, label]) => (
                    <button
                      key={repairType}
                      type="button"
                      onClick={() => copyRepairPrompt(repairType, grokTextMode, 'grok-repair', 'grok')}
                      className="interactive-control min-h-11 rounded-[8px] border border-[#E9DFC5] bg-white px-1.5 sm:px-3 py-2 text-[12px] sm:text-[13px] font-bold text-[#795B16] hover:bg-[#FFF3D8] overflow-hidden text-ellipsis whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A]"
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
          <div 
            className="relative bg-surface-container-lowest rounded-md p-3.5 sm:p-md shadow-[#B8E3D2] border border-outline-variant overflow-hidden select-none cursor-pointer group" 
            onClick={handlePreviewCopyAttempt}
            onContextMenu={handlePreviewCopyAttempt}
          >
            <textarea 
              className="w-full bg-white border-2 border-outline-variant rounded-md p-4 text-on-surface font-normal focus:outline-none resize-y min-h-[200px] max-h-[460px] shadow-sm scroll-smooth [scrollbar-width:thin] [scrollbar-color:#FCD3A1_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#FCD3A1] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#E8C66A] select-none cursor-pointer"
              readOnly
              tabIndex={-1}
              style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
              onClick={handlePreviewCopyAttempt}
              onCopy={handlePreviewCopyAttempt}
              onCut={handlePreviewCopyAttempt}
              onContextMenu={handlePreviewCopyAttempt}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'a' || e.key === 'x')) {
                  handlePreviewCopyAttempt(e);
                }
              }}
              value={getPreviewPrompt()}
            />
          </div>

        </section>

        {/* Actions: One-Click Launch & Copy Dual Hub */}
        <section id="ai-action-hub" className="flex flex-col gap-3 mt-2 pb-4">
          <AdBanner />
          <div className="bg-[#EAF8F3] p-3 sm:p-3.5 rounded-xl border-2 border-mint-border flex flex-col gap-2.5 text-mint-strong shadow-xs">

            {/* Final settings checkpoint before AI launch */}
            <div className="rounded-xl border border-[#E8D7A6] bg-[#FFFDF7] px-3.5 py-3.5 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2 border-b border-[#EFE4C6] pb-2.5">
                <strong className="text-[14px] sm:text-[15px] font-black text-[#5C4328]">
                  {lang === 'ko' ? '✓ 최종 설정 확인' : lang === 'ja' ? '✓ 最終設定確認' : lang === 'zh' ? '✓ 最终设置确认' : '✓ Final Settings'}
                </strong>
                <span className="inline-flex shrink-0 items-center rounded-full border border-[#E8D7A6] bg-white px-2 py-0.5 text-[11px] font-bold text-[#8A6A34] whitespace-nowrap">
                  {lang === 'ko' ? '실행 전 확인' : lang === 'ja' ? '実行前確認' : lang === 'zh' ? '运行前确认' : 'Before launch'}
                </span>
              </div>

              <dl className="grid grid-cols-[76px_minmax(0,1fr)] gap-x-2.5 gap-y-2 text-[12.5px] sm:text-[13px]">
                <dt className="font-bold text-[#8A7758]">{lang === 'ko' ? '캐릭터' : lang === 'ja' ? 'キャラ' : lang === 'zh' ? '角色' : 'Character'}</dt>
                <dd className="min-w-0 font-bold text-[#4F4638]">
                  {characterSource === 'photo'
                    ? `📷 ${lang === 'ko' ? '참고 사진' : lang === 'ja' ? '参照写真' : lang === 'zh' ? '参考照片' : 'Reference photo'}`
                    : characterSource === 'random'
                    ? `🎲 ${lang === 'ko' ? '랜덤 캐릭터' : lang === 'ja' ? 'ランダムキャラ' : lang === 'zh' ? '随机角色' : 'Random character'}`
                    : `✏️ ${lang === 'ko' ? '직접 설정' : lang === 'ja' ? '直接設定' : lang === 'zh' ? '手动设置' : 'Direct setup'}`}
                </dd>

                {characterSource === 'photo' && (
                  <>
                    <dt className="font-bold text-[#8A7758]">{lang === 'ko' ? '사진 반영' : lang === 'ja' ? '写真反映' : lang === 'zh' ? '照片模式' : 'Photo mode'}</dt>
                    <dd className="font-bold text-[#4F4638]">{getPhotoModeLabel(lang)}</dd>
                  </>
                )}

                <dt className="font-bold text-[#8A7758]">{lang === 'ko' ? '선택 태그' : lang === 'ja' ? '選択タグ' : lang === 'zh' ? '已选标签' : 'Tags'}</dt>
                <dd className="min-w-0 font-bold text-[#4F4638]">
                  {activeTagList.length > 0
                    ? (
                      <span className="block truncate" title={charManual}>
                        {activeTagList.slice(0, 3).join(' · ')}
                        {activeTagList.length > 3
                          ? (lang === 'ko' ? ` 외 ${activeTagList.length - 3}개` : ` +${activeTagList.length - 3}`)
                          : ''}
                      </span>
                    )
                    : (lang === 'ko' ? '선택된 태그 없음' : lang === 'ja' ? '選択タグなし' : lang === 'zh' ? '未选择标签' : 'No tags selected')}
                </dd>

                <dt className="font-bold text-[#8A7758]">{lang === 'ko' ? '문구 테마' : lang === 'ja' ? '文言テーマ' : lang === 'zh' ? '文案主题' : 'Phrase theme'}</dt>
                <dd className="min-w-0 truncate font-bold text-[#4F4638]">
                  {activeTheme === 'custom'
                    ? (lang === 'ko' ? '사용자 지정 / 랜덤' : lang === 'ja' ? 'カスタム / ランダム' : lang === 'zh' ? '自定义 / 随机' : 'Custom / Random')
                    : activeTheme}
                </dd>

                <dt className="font-bold text-[#8A7758]">{lang === 'ko' ? '이모티콘' : lang === 'ja' ? 'スタンプ' : lang === 'zh' ? '表情贴纸' : 'Stickers'}</dt>
                <dd className="font-black text-[#5B7C68]">
                  {lang === 'ko' ? `${emoticons.length}종 준비 완료` : lang === 'ja' ? `${emoticons.length}種 準備完了` : lang === 'zh' ? `已准备 ${emoticons.length} 款` : `${emoticons.length} ready`}
                </dd>
              </dl>

              <p className="mt-3 border-t border-[#EFE4C6] pt-2.5 text-[11.5px] sm:text-[12px] font-bold text-[#8A7758] leading-relaxed">
                {lang === 'ko'
                  ? '아래 실행·복사 버튼을 누르기 전에 설정이 맞는지 마지막으로 확인해 주세요.'
                  : lang === 'ja'
                  ? '下の実行・コピーボタンを押す前に設定をご確認ください。'
                  : lang === 'zh'
                  ? '点击下方运行或复制按钮前，请最后确认设置。'
                  : 'Check these settings once more before launching or copying.'}
              </p>
            </div>

            {/* 1. Launch Info Header */}
            <div className="flex items-center gap-2">
              <span className="text-[17px] shrink-0 leading-none">🚀</span>
              <p className="text-[12.5px] sm:text-[13.5px] font-extrabold text-[#154639] leading-snug [word-break:keep-all]">
                {lang === 'ko' 
                  ? '버튼 클릭 시 프롬프트 자동 복사 & AI 사이트가 바로 열립니다.'
                  : lang === 'ja'
                  ? 'ボタンを押すとプロンプトを自動コピーしてAI画面を開きます。'
                  : lang === 'zh'
                  ? '点击按钮将自动复制提示词并直接打开AI网站。'
                  : 'Click a button below to auto-copy prompt & launch the AI site.'}
              </p>
            </div>

            {/* 2. Structured Quick Jump Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#CBEAE0]">
              <div className="flex items-center gap-1.5 text-[11.5px] sm:text-[12px] font-bold text-[#2A6555] shrink-0">
                <span>💡</span>
                <span>
                  {lang === 'ko' 
                    ? '수정 시 실시간 자동 반영:' 
                    : lang === 'ja' 
                    ? '変更時にリアルタイム反映:' 
                    : lang === 'zh' 
                    ? '修改时实时自动同步:' 
                    : 'Real-time sync on edit:'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('character-setup-section');
                    if (el) {
                      const y = el.getBoundingClientRect().top + window.scrollY - 70;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                  className="interactive-control flex items-center justify-center gap-1 min-h-[34px] bg-white hover:bg-[#D5EFE5] text-[#1E5D4B] font-black text-[12px] sm:text-[12.5px] px-3 py-1 rounded-lg border border-[#9ED2C0] shadow-2xs cursor-pointer active:scale-95 transition-all"
                >
                  <span>✏️</span>
                  <span className="truncate">{lang === 'ko' ? '캐릭터·태그 수정 ↑' : lang === 'ja' ? 'キャラ・タグ修正 ↑' : lang === 'zh' ? '角色与标签 ↑' : 'Character·Tags ↑'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('emoticon-phrase-grid');
                    if (el) {
                      const y = el.getBoundingClientRect().top + window.scrollY - 70;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                  className="interactive-control flex items-center justify-center gap-1 min-h-[34px] bg-white hover:bg-[#D5EFE5] text-[#1E5D4B] font-black text-[12px] sm:text-[12.5px] px-3 py-1 rounded-lg border border-[#9ED2C0] shadow-2xs cursor-pointer active:scale-95 transition-all"
                >
                  <span>🎨</span>
                  <span className="truncate">{lang === 'ko' ? '테마 변경 ↑' : lang === 'ja' ? 'テーマ変更 ↑' : lang === 'zh' ? '主题变更 ↑' : 'Themes ↑'}</span>
                </button>
              </div>
            </div>
          </div>

          <div id="ai-action-cards-grid" className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* ChatGPT Action Card */}
            <div className={`p-3.5 rounded-lg border-2 flex flex-col gap-2 transition-all ${previewMode === 'gpt' ? 'bg-[#F8FFFC] border-[#9FD5C4] shadow-sm' : 'bg-white border-slate-200 shadow-xs'}`}>
              <button
                type="button"
                onClick={() => launchAiCompanion('gpt')}
                disabled={Boolean(promptValidationError)}
                className="interactive-control w-full min-h-[52px] rounded-md bg-[#E8F5F0] text-[#1E5C49] border-2 border-[#9FD5C4] font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#D8EEE6] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Bot size={20} className="text-[#2D7D64]" />
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
              <p className="text-[12px] leading-relaxed text-slate-500 text-center break-keep">
                {lang === 'ko' ? '✨ 자동 텍스트 전달 + 클립보드 복사' : lang === 'ja' ? '✨ 自動入力 + クリップボードコピー' : lang === 'zh' ? '✨ 自动传递文本 + 剪贴板复制' : '✨ Auto text passing + clipboard copy'}
              </p>
            </div>

            {/* Gemini Action Card */}
            <div className={`p-3.5 rounded-lg border-2 flex flex-col gap-2 transition-all ${previewMode === 'gemini' ? 'bg-[#FBF9FF] border-[#C9BDF0] shadow-sm' : 'bg-white border-slate-200 shadow-xs'}`}>
              <button
                type="button"
                onClick={() => launchAiCompanion('gemini')}
                disabled={Boolean(visiblePromptValidationError)}
                className="interactive-control w-full min-h-[52px] rounded-md bg-[#F1EDFF] text-[#59439B] border-2 border-[#CFC5F2] font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#E7E0FA] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Sparkles size={20} className="text-[#735DB7]" />
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
              <p className="text-[12px] leading-relaxed text-amber-700 font-medium text-center break-keep">
                {lang === 'ko' ? '📋 복사 완료! 창 열리면 [Ctrl+V] 누르세요' : lang === 'ja' ? '📋 コピー完了！画面が開いたら [Ctrl+V]' : lang === 'zh' ? '📋 复制成功！打开窗口后按 [Ctrl+V]' : '📋 Copied! Press [Ctrl+V] in Gemini'}
              </p>
            </div>

            {/* Grok Action Card */}
            <div className={`p-3.5 rounded-lg border-2 flex flex-col gap-2 transition-all ${previewMode === 'grok' ? 'bg-[#F8F9FA] border-[#AEB4BD] shadow-sm' : 'bg-white border-slate-200 shadow-xs'}`}>
              <button
                type="button"
                onClick={() => launchAiCompanion('grok')}
                disabled={Boolean(visiblePromptValidationError)}
                className="interactive-control w-full min-h-[52px] rounded-md bg-[#EEF0F3] text-[#30343B] border-2 border-[#C9CDD3] font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#E2E5E9] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Zap size={20} className="text-[#4B515A]" />
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
              <p className="text-[12px] leading-relaxed text-purple-700 font-medium text-center break-keep">
                {lang === 'ko' ? '📋 복사 완료! 창 열리면 [Ctrl+V] 누르세요' : lang === 'ja' ? '📋 コピー完了！画面が開いたら [Ctrl+V]' : lang === 'zh' ? '📋 复制成功！打开窗口后按 [Ctrl+V]' : '📋 Copied! Press [Ctrl+V] in Grok'}
              </p>
            </div>
          </div>

          {/* X (Twitter) Social Share & Caption Helper Card */}
          <div className="mt-3.5 bg-white rounded-lg p-3.5 sm:p-4 border-2 border-slate-200/90 shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[13px] sm:text-[14px] font-extrabold text-slate-900 flex items-center gap-2">
                <span className="bg-[#EEF0F3] text-[#30343B] border border-[#C9CDD3] text-[11px] font-black px-1.5 py-0.5 rounded flex items-center justify-center leading-none">𝕏</span>
                <span>{lang === 'ko' 
                  ? '트위터(X) SNS 홍보·자랑 캡션' 
                  : lang === 'ja' 
                  ? 'X (Twitter) SNS共有・紹介キャプション' 
                  : lang === 'zh' 
                  ? 'X (Twitter) 社交媒体宣传文案' 
                  : 'Twitter (X) Share Caption'}</span>
              </span>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200">
                ✨ {lang === 'ko' 
                  ? '원클릭 복사 & 바로 트윗' 
                  : lang === 'ja' 
                  ? 'ワンクリックコピー＆投稿' 
                  : lang === 'zh' 
                  ? '一键复制并直接发推' 
                  : '1-Click Copy & Tweet'}
              </span>
            </div>
            <p className="text-[14px] text-slate-600 leading-relaxed font-normal break-keep">
              {lang === 'ko'
                ? 'AI에서 생성한 완성 이미지를 저장한 뒤, SNS에 올릴 때 바로 붙여넣어 사용할 수 있는 사이트 링크 & 홍보 캡션 & 해시태그입니다. (트윗 창에서 저장한 사진을 첨부해 주세요!)'
                : lang === 'ja'
                ? 'AIで生成した完成画像を保存後、SNSに投稿する際にそのまま使える紹介文、サイトリンク、ハッシュタグです。(ツイート画面で保存した画像を添付してください！)'
                : lang === 'zh'
                ? '保存AI生成的图片后，在社交平台上发布时可直接粘贴使用的文案、网站链接和热门标签。(发帖时请附带保存好的图片！)'
                : 'Engaging, copy-ready caption, site link, and trending hashtags to showcase your generated sticker sheet on social media (X, Instagram, etc.). Attach your saved image in the tweet composer!'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
              <button
                type="button"
                onClick={() => copySocialCaption(lang)}
                className="interactive-control min-h-[38px] rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-[12.5px] sm:text-[13px] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              >
                {copiedType === `social_${lang}` ? <CheckCircle2 size={15} className="text-[#2D7D64]" /> : <span>📋</span>}
                <span>{copiedType === `social_${lang}` 
                  ? (lang === 'ko' ? '✓ 한글 캡션 복사됨!' : lang === 'ja' ? '✓ 日本語コピー完了！' : lang === 'zh' ? '✓ 中文文案已复制！' : '✓ English Copied!') 
                  : (lang === 'ko' ? '한글 캡션 복사' : lang === 'ja' ? '日本語キャプション' : lang === 'zh' ? '复制中文文案' : 'Copy English Caption')}</span>
              </button>
              <button
                type="button"
                onClick={() => copySocialCaption('en')}
                className="interactive-control min-h-[38px] rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-[12.5px] sm:text-[13px] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              >
                {copiedType === 'social_en' ? <CheckCircle2 size={15} className="text-[#2D7D64]" /> : <span>📋</span>}
                <span>{copiedType === 'social_en' 
                  ? (lang === 'ko' ? '✓ 영문 캡션 복사됨!' : lang === 'ja' ? '✓ 英語コピー完了！' : lang === 'zh' ? '✓ 英文文案已复制！' : '✓ English Copied!') 
                  : (lang === 'ko' ? '영문(EN) 캡션 복사' : lang === 'ja' ? '英語(EN)キャプション' : lang === 'zh' ? '复制英文(EN)文案' : 'Copy EN Caption')}</span>
              </button>
              <button
                type="button"
                onClick={() => shareOnTwitter(lang)}
                className="interactive-control min-h-[38px] rounded-md bg-[#EEF0F3] hover:bg-[#E2E5E9] text-[#30343B] border-2 border-[#C9CDD3] font-extrabold text-[12.5px] sm:text-[13px] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <span className="text-[13px] font-black">𝕏</span>
                <span>{lang === 'ko' ? '바로 트윗하기' : lang === 'ja' ? 'Xで投稿する' : lang === 'zh' ? '立即发推 (Tweet)' : 'Tweet Now'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* 사진 꿀팁 컴팩트 아코디언 카드 */}
        <div id="photo-tips-card" className="bg-[#FFF5E6] text-[#8C3D18] p-3.5 sm:p-5 md:p-6 rounded-md border border-[#FDE0B5] flex gap-3 md:gap-4 items-start shadow-sm mt-2 relative overflow-hidden scroll-mt-20">
          <div className="absolute -right-4 -top-6 text-[#FCD3A1] opacity-40 text-[100px] sm:text-[140px] transform -rotate-12 select-none pointer-events-none drop-shadow-sm">📸</div>
          <span className="text-[18px] sm:text-[22px] drop-shadow-sm leading-none mt-0.5 relative z-10">📸</span>
          <div className="relative z-10 flex-1 min-w-0">
            <strong className="font-black block mb-1 sm:mb-1.5 text-[14px] sm:text-[16.5px] tracking-tight text-[#C2410C]">
              {lang === 'ko' 
                ? '✨ 초강력 꿀팁: 사진 첨부로 세상에 하나뿐인 이모티콘 만들기!' 
                : lang === 'ja'
                ? '✨ 超強力なコツ: 写真添付で世界にひとつだけのスタンプ作成！'
                : lang === 'zh'
                ? '✨ 超实用技巧: 附带照片制作独一无二的表情包！'
                : '✨ Pro Tip: Make Emojis from Photos!'}
            </strong>
            <span className="text-[12.5px] sm:text-[14px] leading-relaxed opacity-90 [word-break:break-word] block font-medium text-[#8C3D18]">
              {lang === 'ko' 
                ? '프롬프트를 복사하여 AI(ChatGPT, Gemini, Grok)에 붙여넣을 때 본인이나 반려동물 사진을 함께 첨부하면 대상의 개성을 살린 커스텀 이모티콘이 완성됩니다!' 
                : lang === 'ja'
                ? 'プロンプトをAI(ChatGPT, Gemini, Grok)に貼り付ける際、写真も一緒に添付するとオリジナルスタンプが作れます！'
                : lang === 'zh'
                ? '将提示词粘贴给AI (ChatGPT, Gemini, Grok) 时，同时发送照片即可生成专属表情包！'
                : 'When pasting into AI (ChatGPT, Gemini, Grok), attach a photo of yourself or your pet to create custom emojis!'}
            </span>

            {/* 접기/펼치기 토글 버튼 */}
            <button
              type="button"
              onClick={() => setShowPhotoTips(prev => !prev)}
              className="interactive-control mt-3 flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-white/95 hover:bg-white text-[#C2410C] font-extrabold text-[12.5px] sm:text-[13.5px] border border-[#FCD3A1] shadow-xs hover:border-[#F97316]/50 transition-all text-center"
            >
              <span>{showPhotoTips ? '▲' : '💡'}</span>
              <span>
                {showPhotoTips
                  ? (lang === 'ko' ? '사진 권장 규칙 & 활용 팁 접기' : lang === 'ja' ? '詳細を閉じる' : lang === 'zh' ? '收起建议' : 'Hide Photo Specs & Tips')
                  : (lang === 'ko' ? '사진 권장 규칙 & 200% 활용 팁 보기 ▼' : lang === 'ja' ? '写真の推奨ルール・活用法を見る ▼' : lang === 'zh' ? '查看照片上传建议与技巧 ▼' : 'View Photo Specs & Creative Tips ▼')}
              </span>
            </button>

            {/* 상세 블록 (SEO/AdSense 크롤러를 위해 DOM 유지 후 CSS로 토글) */}
            <div className={`flex flex-col gap-2.5 mt-2.5 ${showPhotoTips ? 'block' : 'hidden'}`}>
              <div className="bg-white/80 rounded-md p-3 sm:p-4 border border-[#FCD3A1]/70 shadow-sm flex flex-col gap-1.5 w-full">
                <strong className="text-[#C2410C] text-[13px] sm:text-[14px] flex items-center gap-1.5 font-bold">
                  <span className="text-[14px]">📌</span> 
                  {lang === 'ko' ? 'LLM 첨부 사진 권장 규칙' : lang === 'ja' ? 'LLM添付写真の推奨ルール' : lang === 'zh' ? 'LLM照片上传建议' : 'Recommended Photo Specs'}
                </strong>
                <ul className="list-disc pl-4 opacity-90 text-[#9A3412] font-medium flex flex-col gap-1 text-[12px] sm:text-[13px] marker:text-[#C2410C] [word-break:break-word]">
                  <li>{lang === 'ko' ? '크기/비율: 제한 없음 (일반적인 스마트폰 사진 포맷 가능)' : 'Size/Ratio: Any standard smartphone photo format'}</li>
                  <li>{lang === 'ko' ? '권장: 이목구비, 헤어스타일, 모색 등 특징이 선명한 정면 사진 1장' : 'Recommended: Clear front-facing photo showing distinct features'}</li>
                  <li>{lang === 'ko' ? '주의: 인물이 너무 작거나 흔들리고 어두운 사진은 피해주세요.' : 'Avoid: Blurry, dark, or zoomed-out photos'}</li>
                  <li>{lang === 'ko' ? '💡 실물 싱크로율 100% 꿀팁: 15종 시트는 포즈/구도 초안용으로 사용하고, 최종 완성품은 [📋 15종 개별 분할] 모드에서 1장씩 생성하기 (AI가 오직 1명의 이목구비에만 100% 집중하여 사진과 똑같이 생성됨)' : '💡 Likeness Tip: Use Sheet as pose draft, then generate final stickers one by one with [Batch Split].'}</li>
                </ul>
              </div>

              <div className="bg-white/80 rounded-md p-3 sm:p-4 border border-[#FCD3A1]/70 shadow-sm flex flex-col gap-1.5 w-full">
                <strong className="text-[#C2410C] text-[13px] sm:text-[14px] flex items-center gap-1.5 font-bold">
                  <span className="text-[14px]">🎯</span> 
                  {lang === 'ko' ? '이모티콘 200% 실전 활용 아이디어' : lang === 'ja' ? 'スタンプの200%実践活用アイデア' : lang === 'zh' ? '表情包200%实用场景推荐' : 'Creative Ways to Use Your Emojis'}
                </strong>
                <ul className="list-disc pl-4 opacity-90 text-[#9A3412] font-medium flex flex-col gap-1 text-[12px] sm:text-[13px] marker:text-[#C2410C] [word-break:break-word]">
                  <li>{lang === 'ko' ? '개인 SNS & 메신저 프로필 사진: 내 얼굴 셀카 한 장으로 카카오톡 프사, 인스타그램·X(트위터) 아바타, 슬랙/노션 사내 프로필용 고퀄리티 2D 캐리커처 이미지 완성' : lang === 'ja' ? 'SNS・メッセンジャーのプロフィール写真: 自撮り写真1枚でLINE・X・Slack用の高品質2Dアバターを作成' : lang === 'zh' ? '个人社交平台及办公头像: 用个人自拍生成微信、小红书、钉钉/飞书专属高品质2D卡通形象头像' : 'Personal SNS & Avatar: Create custom 2D caricature avatars for KakaoTalk, Instagram, X, and Slack profiles from a single selfie.'}</li>
                  <li>{lang === 'ko' ? 'SNS 프로필 & 스토리: 인스타, X, 유튜브 프로필 및 감정 아바타로 활용' : 'SNS Profiles & Avatars: Use custom characters as profile icons.'}</li>
                  <li>{lang === 'ko' ? '메신저 톡방 감정 짤: 배경 투명화 후 앨범에 저장해 친구·가족 톡방에서 개성 넘치는 리액션 짤로 전송' : 'Messenger Reactions: Send custom transparent stickers in chats.'}</li>
                  <li>{lang === 'ko' ? '블로그 & 다꾸: 네이버 블로그 스티커, 굿노트·노션 다이어리 스탬프로 장식' : 'Blog & Planner Decor: Decorate blogs or digital planners.'}</li>
                  <li>{lang === 'ko' ? '어린이집·유치원 알림장 & 네임스티커: 아이 얼굴 사진으로 식판/학용품 방수 네임스티커 라벨 및 키즈노트 알림장 전용 캐릭터 스티커 제작' : lang === 'ja' ? '保育園・幼稚園の連絡帳＆お名前シール: お子様の顔写真で防水お名前シールや連絡帳スタンプを作成' : lang === 'zh' ? '幼儿园家园联系册与姓名贴纸: 用宝宝照片制作防水姓名贴与专属互动表情包' : 'Daycare & Kindergarten Name Labels: Make waterproof name stickers and daily report emojis from child photos.'}</li>
                  <li>{lang === 'ko' ? '선생님 칭찬 스탬프: 알림장, 칭찬 스티커판 맞춤형 교육 스탬프로 활용' : 'Teacher Stamps: Perfect for reward charts and student feedback.'}</li>
                  <li>{lang === 'ko' ? '커플·신혼부부 추억: 모바일 청첩장, 기념일 굿즈 및 포토북 제작' : 'Couple Memories: Make anniversary gifts, photo books, and digital wedding stickers.'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 가이드 & 15종 황금 조합 & FAQ 통합 아코디언 토글 */}
        <div className="flex flex-col gap-3 mt-3">
          <button
            type="button"
            onClick={() => setShowDetailedGuide(prev => !prev)}
            className="interactive-control w-full py-3 px-3.5 sm:px-5 rounded-lg bg-gradient-to-r from-[#FFF8EE] to-[#FFF1DE] border-2 border-amber-300 hover:border-amber-400 text-amber-950 font-black text-[13.5px] sm:text-[15px] shadow-sm flex items-center justify-between gap-2 transition-all"
          >
            <span className="flex items-center gap-1.5 sm:gap-2 text-left min-w-0">
              <span className="text-[16px] sm:text-[18px] shrink-0">📚</span>
              <span className="truncate">
                {lang === 'ko' 
                  ? '이모티콘 제작 가이드 & FAQ' 
                  : lang === 'ja'
                  ? '制作ガイド・黄金比・FAQ'
                  : lang === 'zh'
                  ? '制作指南・黄金组合・FAQ'
                  : 'Creation Guide & FAQ'}
              </span>
            </span>
            <span className="text-[11px] sm:text-[12.5px] font-bold text-amber-800 bg-amber-200/80 hover:bg-amber-300 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 transition-colors whitespace-nowrap">
              {showDetailedGuide 
                ? (lang === 'ko' ? '접기 ▲' : 'Fold ▲') 
                : (lang === 'ko' ? '전체 보기 (6개 섹션) ▼' : 'View (6 Sections) ▼')}
            </span>
          </button>

          {/* 6대 상세 섹션 (SEO/AdSense 크롤러를 위해 DOM 유지 후 CSS로 토글) */}
          <div className={`flex flex-col gap-4 sm:gap-5 mt-1 ${showDetailedGuide ? 'block' : 'hidden'}`}>
            {/* 섹션 1: 이모티콘 제작이 처음인가요? */}
            <SectionAbout lang={lang} />

              {/* 섹션 2: 3분 초간단 사용 가이드 */}
              <SectionGuide lang={lang} />

              {/* 섹션 3: 완성도를 높이는 이모티콘 기획 5대 원칙 */}
              <SectionPrinciples lang={lang} />

              {/* 섹션 4: 추천 이모티콘 15종 필수 감정 황금 조합 */}
              <SectionEmotionFormula lang={lang} onApplyFormula={handleApplyEmotionFormula} />

              {/* 섹션 5: AI 모델 비교 및 팁 */}
              <InfoSection t={t} lang={lang} />

              {/* 섹션 6: 자주 묻는 질문 FAQ */}
              <SectionFAQ lang={lang} />
            </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 sm:mt-10 py-7 sm:py-9 bg-[#FAF9F6] border-t border-[#E5E0D8] text-center w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-3">
          {/* JocoHunt Weekly Top 3 Winner Badge */}
          <div className="mb-2 flex justify-center">
            <a
              href="https://jocohunt.com/p/190i6ehg"
              target="_blank"
              rel="noopener noreferrer"
              title="조코헌트 주간 1등 Top 3 위너"
              className="inline-block transform hover:scale-105 transition-all duration-300 drop-shadow-xs hover:drop-shadow-sm"
            >
              <img
                src="https://jocohunt.com/images/badges/weekly-light.svg"
                alt="조코헌트 주간 1등 Top 3 위너"
                className="w-[180px] sm:w-[220px] h-auto"
              />
            </a>
          </div>
          
          <div className="flex items-center justify-center gap-4 flex-wrap text-[13px] font-bold text-slate-700">
            <button
              onClick={() => navigateTo('/privacy')}
              className="interactive-control hover:text-amber-700 underline underline-offset-4 cursor-pointer transition-colors"
            >
              {lang === 'ko' ? '개인정보처리방침' : lang === 'ja' ? 'プライバシーポリシー' : lang === 'zh' ? '隐私政策' : 'Privacy Policy'}
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => navigateTo('/terms')}
              className="interactive-control hover:text-amber-700 underline underline-offset-4 cursor-pointer transition-colors"
            >
              {lang === 'ko' ? '서비스 이용약관' : lang === 'ja' ? '利用規約' : lang === 'zh' ? '服务条款' : 'Terms of Service'}
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => {
                setShowPartnershipModal(true);
                trackEvent('open_partnership_guide', { lang });
              }}
              className="interactive-control hover:text-amber-700 underline underline-offset-4 cursor-pointer transition-colors font-bold text-slate-700"
            >
              {lang === 'ko' ? '광고 및 제휴 문의' : lang === 'ja' ? '広告・提携のお問い合わせ' : lang === 'zh' ? '广告与商务合作' : 'Advertising & Inquiries'}
            </button>
          </div>

          <p className="text-[13.5px] text-[#8C7A6B] font-bold mt-1">
            © {new Date().getFullYear()} Prompt Maker (프롬프트 메이커). All rights reserved.
          </p>
          <p className="text-[12.5px] text-[#A69B8F] leading-relaxed max-w-2xl break-keep">
            {lang === 'ko' 
              ? '* 본 서비스는 AI 프롬프트 생성 보조 웹 유틸리티이며, 카카오(Kakao) 및 라인(LINE)과 공식적인 관련이 없습니다. 모든 생성물의 상업적 활용 및 등록 심사는 각 플랫폼의 운영 가이드라인을 준수합니다.' 
              : lang === 'ja'
              ? '* 本サービスはAIプロンプト作成補助ツールであり、LINEまたはKakaoTalkと公式に提携しているものではありません。'
              : lang === 'zh'
              ? '* 本服务为AI提示词辅助生成工具，非微信、LINE或KakaoTalk官方合作服务。'
              : '* This service is an AI prompt utility and is not officially affiliated with Kakao or LINE.'}
          </p>
        </div>
      </footer>

      {/* Partnership & Sponsor Banner Advertising Modal */}
      {showPartnershipModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowPartnershipModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-xl w-full border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#FAF9F6] px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[20px]">📢</span>
                <h3 className="font-extrabold text-[16px] sm:text-[17px] text-slate-900">
                  {lang === 'ko' 
                    ? '광고 배너 게재 및 제휴 안내' 
                    : lang === 'ja' 
                    ? '広告バナー掲載・提携のご案内' 
                    : lang === 'zh' 
                    ? '广告横幅投放与合作指南' 
                    : 'Advertising Banners & Partnerships'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPartnershipModal(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-[18px] border border-slate-200 transition-colors cursor-pointer"
                title={lang === 'ko' ? '닫기' : 'Close'}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-4 text-left">
              {/* Service Context Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-700 bg-slate-200/80 px-2.5 py-0.5 rounded-full self-start">
                  {lang === 'ko' ? '안내' : 'Information'}
                </span>
                <p className="text-[13px] sm:text-[13.5px] text-slate-700 leading-relaxed font-normal break-keep">
                  {lang === 'ko'
                    ? '프롬프트 메이커는 사용자가 캐릭터 이모티콘을 생성하는 웹 도구입니다. 굿즈 제작 플랫폼, 판촉물 및 인쇄 제작 업체, 디자인 도구 등 관련 서비스의 사이트 내 배너 광고 게재 및 제휴 문의를 받고 있습니다.'
                    : lang === 'ja'
                    ? '当サービスは、ユーザーがオリジナルキャラクターやスタンプを作成するWebツールです。グッズ制作サービスや印刷・ノベルティ業者様のバナー広告掲載・提携のお問い合わせを受け付けております。'
                    : lang === 'zh'
                    ? '本站为用户提供原创角色及表情包生成服务。现面向周边定制平台、印刷及礼品供应商承接横幅广告投放与商务合作咨询。'
                    : 'Prompt Maker is a web utility for creating character stickers. We welcome advertising banners and partnerships from custom merch platforms, print shops, and promotional product manufacturers.'}
                </p>
              </div>

              {/* Advertising Options */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[13px] font-extrabold text-slate-800 flex items-center gap-1.5">
                  <span>📌</span>
                  <span>{lang === 'ko' ? '광고 및 제휴 분야' : lang === 'ja' ? '広告・提携メニュー' : lang === 'zh' ? '广告位与合作形式' : 'Advertising & Partnership Areas'}</span>
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] sm:text-[12.5px] text-slate-700 font-semibold">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-start gap-2 shadow-2xs">
                    <span className="text-[16px] shrink-0">🖼️</span>
                    <div>
                      <strong className="block text-slate-900">{lang === 'ko' ? '사이트 배너 광고' : 'Website Banners'}</strong>
                      <span className="text-[11.5px] text-slate-500 font-normal">{lang === 'ko' ? '메인 화면 및 생성 결과 영역 배너 게재' : 'Banner placement on main & result screens'}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-start gap-2 shadow-2xs">
                    <span className="text-[16px] shrink-0">🎁</span>
                    <div>
                      <strong className="block text-slate-900">{lang === 'ko' ? '굿즈·인쇄 업체 연계' : 'Merch & Print Links'}</strong>
                      <span className="text-[11.5px] text-slate-500 font-normal">{lang === 'ko' ? '실물 굿즈(키링, 스티커, 티셔츠 등) 제작사 링크' : 'Links for custom keyrings, stickers, apparel, etc.'}</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-start gap-2 shadow-2xs">
                    <span className="text-[16px] shrink-0">🏢</span>
                    <div>
                      <strong className="block text-slate-900">{lang === 'ko' ? '기업 판촉물 안내' : 'Corporate Promotional Merch'}</strong>
                      <span className="text-[11.5px] text-slate-500 font-normal">{lang === 'ko' ? '기업 판촉물 및 홍보물 인쇄 제작 안내' : 'Promotional printing & corporate mascot campaigns'}</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-start gap-2 shadow-2xs">
                    <span className="text-[16px] shrink-0">💡</span>
                    <div>
                      <strong className="block text-slate-900">{lang === 'ko' ? '기타 파트너십' : 'Other Partnerships'}</strong>
                      <span className="text-[11.5px] text-slate-500 font-normal">{lang === 'ko' ? '브랜드 협업 및 서비스 연계 제휴' : 'Brand collaborations and marketing integrations'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inquiry Notice */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[12px] text-slate-600 leading-relaxed">
                {lang === 'ko' 
                  ? '💡 구글 폼으로 원하시는 배너 형태, 희망 기간, 업체 정보를 남겨주시면 확인 후 이메일로 상세 안내를 회신해 드립니다.' 
                  : lang === 'ja' 
                  ? '💡 フォームよりご希望の広告掲載期間や媒体情報をご記入いただければ、確認後メールにてご連絡いたします。' 
                  : lang === 'zh' 
                  ? '💡 请在表单中留下您的广告需求与联系方式，我们将在收到信息后通过邮件与您联系。' 
                  : '💡 Please submit your desired ad slots, duration, and business details via Google Forms. We will reply via email.'}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowPartnershipModal(false)}
                className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-[13px] transition-colors cursor-pointer"
              >
                {lang === 'ko' ? '닫기' : 'Close'}
              </button>
              <a
                href="https://forms.gle/Q2oG84fL4B9g2Jda7"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackEvent('click_partnership_form', { lang });
                  setShowPartnershipModal(false);
                }}
                className="px-5 py-2 rounded-lg bg-[#C2410C] hover:bg-[#9A3412] text-white font-extrabold text-[13px] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span>{lang === 'ko' ? '광고 및 제휴 문의하기' : lang === 'ja' ? 'お問い合わせフォームへ' : lang === 'zh' ? '前往填写咨询表单' : 'Inquire via Form'}</span>
                <span className="text-[11px]">↗</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
