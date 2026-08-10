import React, { useState, useEffect } from 'react';
import { Shuffle, CheckCircle2, Bot, Sparkles, HelpCircle, Globe, Trash2 } from 'lucide-react';

const THEMES_JA = {
  '日常/挨拶 ①': ['草www', 'ありがとう！', '今日も頑張ろう', 'いいね！', '感謝！', '大すき', '神！', 'やったー', 'ごめんね', 'お疲れ様', 'おめでとう', 'ヤバい', 'マジか', '感動！', 'おやすみ'],
  '日常/挨拶 ②': ['よろしくね', 'どうしたの？', 'ご飯食べた？', '会いたい', 'おはよう', '暇だなー', 'どこにいる？', '遊ぼう！', 'ファイト', '応援してる', '最高', '完璧！', '楽しみ！', '今日もお疲れ', 'またね！'],
  'オフィス/仕事 ①': ['承知いたしました', '了解です', '修正お願いします', 'ありがとうございます', '退勤します', '会議中です', 'ファイル添付しました', 'お昼行ってきます', 'ファイト！', '申し訳ありません', '予定確認します', 'お疲れ様です', 'お先に失礼します', '確認しました', 'レビューお願いします'],
  'オフィス/仕事 ②': ['有給とります', '休暇中', 'メール確認お願いします', 'ご参考まで', '日程調整可能？', '承認お願いします', '告知確認してね', '通勤ラッシュ惨敗', '残業確定', 'カフェイン補給', 'チームランチ', '定時退社祈願', '今週も生き抜く', '進捗共有', '修正完了しました'],
};

const THEMES_ZH = {
  '日常/问候 ①': ['哈哈哈', '你好！', '今天也要加油', '赞！', '谢谢你', '爱你', '太棒了！', '耶！', '对不起', '辛苦了', '恭喜', '哇', '我的天', '感动', '晚安'],
  '日常/问候 ②': ['很高兴认识你', '在干嘛？', '吃饭了吗？', '想你了', '早上好', '好无聊', '你在哪？', '一起玩吧！', '加油', '支持你', '太酷了', '完美！', '超期待', '今天辛苦了', '下次见！'],
  '职场/工作 ①': ['收到！', '好的', '请修改', '谢谢', '下班啦', '开会中', '已发送附件', '去吃午饭啦', '加油！', '非常抱歉', '确认日程', '辛苦了', '我先走啦', '明白了', '请查收'],
  '职场/工作 ②': ['休假中', '度假去啦', '请查收邮件', '供参考', '能调整时间吗', '请审批', '请看公告', '早高峰渡劫', '加班确定', '急需咖啡', '部门聚餐', '祈祷准时下班', '这周渡劫中', '进度同步', '已修改完成'],
};

const CHARACTER_TAGS_JA = {
  '🐱 動物': ['柴犬', '茶トラ猫', 'ポメラニアン', 'ペンギン', 'うさぎ', 'やんちゃな猿', 'ハムスター', 'リス', '小クマ', 'フェネック', 'クアッカワラビー', 'アヒル', 'パンダ', 'ハリネズミ', 'アルパカ', '子ブタ', 'ナマケモノ', '子ゾウ', 'カワウソ', 'アザラシ', 'コーギー', 'カピバラ', 'ひよこ', 'アライグマ', '子ライオン'],
  '👦 人物': ['ボブヘアの少女', 'メガネの優等生', 'ツーブロックの少年', 'パーマ髪の女性', 'ヒゲの男性', 'ポニーテール女子', 'ツインテール少女', 'ニット帽のヒップスター', 'スーツの紳士', '着物の子供', 'スーツのキャリアウーマン', '優しそうなおばあちゃん', '杖をついたおじいちゃん', '黄色い帽子の園児', 'サングラスのラッパー', 'エプロンのバリスタ', '坊主頭の兵士', 'ヘッドホンのゲーマー', 'マッチョな筋トレ男子', 'カメラを持つ旅人', '白衣の医師', '制服の警察官', 'ギターを弾くロックスター', 'スケボー少年', '華やかなK-POPアイドル', '親しみやすい近所の人', 'ヨガインストラクター', 'ヘルメットの建築家', '画家', 'ライダー', '花屋の店主', 'リュックの就活生', '疲れた会社員', 'パン屋の職人', 'メカニック', '和服の学者', 'カウボーイ', '海賊の船長', '手品師', 'バレリーナ', 'ジャージの無職', '科学者', 'ジーンズの爽やか男子', 'ドレスの姫君', '甲冑の騎士', '空手師範', 'CA（客室乗務員）', 'カメラマン', '登山家', 'アナウンサー', '裁判官', '消防士', 'シェフ', 'バイト生', '麦わら帽子の農家', '花かんむりの少女', '制服の学生', 'サーファー', 'カーラーをつけた就活生'],
  '🦄 ファンタジー/モノ': ['ユニコーン', '子ドラゴン', '魔法使い', '森の妖精', 'もちもちモッチ', 'マカロン', '苺ケーキ', '小籠包', '子バンパイア', '人魚姫', '騎士', '宇宙人', '九尾の狐', '小鬼', '天使', '小悪魔', 'しゃべる鯛焼き', '綿菓子雲', 'セイレーン', 'ペガサス', 'おしゃべりカボチャ', '宇宙飛行士', '魔法のほうき', 'ジェリーモンスター', '雪だるま'],
  '👀 外見/特徴': ['丸顔', '大きくてキラキラした目', 'ぷっくりしたほっぺ', '短い手足', '小さな丸い鼻', '赤らんだ頬', 'モフモフの毛', 'プルプルした体', 'ピンと立った耳', '小さな八重歯', 'そばかす', '片目を隠す前髪', '丸メガネ', 'ふさふさの尻尾', '小さな羽', '星型の瞳', 'ハートの頬模様', 'ミニSD体型'],
  '✨ 性格/感情': ['いたずら好き', 'ツンデレ', '素直で優しい', 'いつも疲れている', '甘えん坊', '怒りっぽい', 'のんびり', '泣き虫', '活発', '内気', '天然', '優しい', 'いつもお腹が空いている', '好奇心旺盛', '大真面目', '見栄っぱり', '恋に落ちた', '自信満々', 'ドジっ子', 'ゴロゴロ怠け者', '情熱的', '怖がり', 'すね屋', 'やる気ゼロ', 'お金大好き'],
  '🖌️ 画風': ['可愛い2Dアニメ風', '韓国ウェブトゥーン風', '手書き落書き風', '柔らかい水彩画風', '色鉛筆絵本風', 'レトロアニメ風', 'クリーンなミニマルベクトル', 'ポップアート風', 'アメコミ風', 'ドット絵ピクセル風', 'ペーパーコラージュ風', 'ヴィンテージ印刷風'],
  '👕 衣装': ['白衣', 'エプロン', 'スーツ', 'オーバーサイズパーカー', 'オーバーオール', '制服', 'ジャージ', 'レインコート', 'パジャマ', 'マント', 'ドレス', 'キャップ帽', 'ダウンジャケット', '革ジャン', 'シャツとネクタイ', '花柄ワンピース', 'ストリートファッション', '道着', 'ニットセーター', '着ぐるみパジャマ', '宇宙服', '探検家ベスト', '水着と浮き輪', 'トレンチコート', '妖精の羽', '王冠とマント', 'Tシャツとジーンズ', '探偵コート'],
  '🎒 小道具/動作': ['スマホを持つ', 'コーヒーカップを持つ', 'サングラス를 かける', 'ヘッドホンをつける', 'ノートPCをする', '本を読む', '風船を持つ', '花束を抱える', 'マイクで歌う', 'ゲームパッドを握る', 'フライパンを持つ', '虫眼鏡を持つ', 'スケッチブックに描く', '魔法の杖を振る', '買い物かごを持つ', '傘をさす', 'ポップコーンを食べる', '掃除機をかける', '双眼鏡で覗く', 'ヨガマットでストレッチ', 'スマートウォッチを見る', '札束を握る'],
  '🌈 エフェクト/背景': ['キラキラエフェクト', 'ハート飛ばし', '星空の輝き', 'ネオンサイン', '集中線', '桜吹雪', '炎のエフェクト', '飛び散る汗', 'どんより雨雲', '虹色のオーラ', 'ドカンと爆発', '暗い影', 'スポットライト', '吹雪', '雷電', 'ブクブク泡', '温かい日差し', '音符が浮かぶ', '風に舞う']
};

const CHARACTER_TAGS_ZH = {
  '🐱 动物': ['柴犬', '橘猫', '博美犬', '小企鹅', '胖软兔', '淘气猴子', '仓鼠', '松鼠', '小熊', '耳廓狐', '短尾矮袋鼠', '小鸭子', '熊猫', '刺猬', '羊驼', '小猪', '树懒', '小象', '水獭', '小海豹', '柯基犬', '卡皮巴拉（水豚）', '小鸡', '浣熊', '小狮子'],
  '👦 人物': ['波波头少女', '戴眼镜的学霸', '两侧铲短少年', '卷发阿姨', '大叔', '马尾运动少女', '双马尾少女', '戴毛线帽的潮人', '西装绅士', '汉服小孩', '职场干练女性', '慈祥的白发奶奶', '拄拐杖的爷爷', '小黄帽幼儿园生', '戴墨镜的说唱歌手', '围裙咖啡师', '寸头士兵', '戴耳机的职业选手', '肌肉健身男', '背相机的背包客', '白大褂医生', '制服警察', '弹吉他的摇滚明星', '滑板少年', '华丽K-POP偶像', '和蔼的邻居', '瑜伽教练', '戴安全帽的建筑师', '画家', '摩托车骑士', '花店老板', '背书包的求职者', '疲惫的社畜', '面包师', '机修工', '书生', '牛仔', '独眼海盗船长', '魔术师', '芭蕾舞者', '运动服游民', '科学家', '牛仔裤型男', '连衣裙公主', '铠甲骑士', '跆拳道教练', '空姐', '摄影师', '登山家', '主持人', '法官', '消防员', '大厨', '店员兼职生', '草帽农民', '花环少女', '吃辣条的学生', '冲浪手', '卷发筒求职者'],
  '🦄 幻想/物品': ['独角兽', '小龙', '小法师', '森林妖精', '糯米软糬', '马卡龙', '草莓蛋糕', '小笼包', '小吸血鬼', '美人鱼', '勇敢小骑士', '外星人', '九尾狐', '小鬼怪', '天使', '小恶魔', '会说话的鲷鱼烧', '棉花糖云朵', '赛琳', '佩格萨斯（飞马）', '会说话的南瓜', '宇航员', '扫帚', '果冻怪', '雪人妖精'],
  '👀 外貌/特征': ['圆脸', '大而闪亮的眼睛', '嘟嘟肉脸颊', '短粗四肢', '小圆鼻子', '红扑扑的脸蛋', '蓬松毛发', '果冻般软糯身体', '长尖耳朵', '小虎牙', '雀斑', '遮住一只眼的刘海', '圆框眼镜', '毛茸茸的尾巴', '小翅膀', '星形瞳孔', '心形脸颊纹路', '迷你SD体型'],
  '✨ 性格/情感': ['淘气', '傲娇高冷', '温顺善良', '总是疲惫', '满满撒娇', '易怒脾气暴', '悠闲自得', '爱哭鬼', '活泼开朗', '胆小害羞', '古灵精怪', '温柔体贴', '总是很饿', '充满好奇心', '十分认真实在', '爱吹牛', '陷入爱河', '自信满满', '毛手毛脚', '懒散打滚', '充满激情', '胆小怕事', '娇嗔娇气', '毫无干劲', '超喜欢钱'],
  '🖌️ 画风': ['可爱2D漫画风', '韩国条漫风', '手绘涂鸦风', '柔和水彩风', '色铅笔绘本风', '复古动画风', '极简矢量风', '波普艺术风', '美漫风', '像素风', '剪纸拼贴风', '复古印刷漫画风'],
  '👕 服装': ['白大褂', '厨师围裙', '职场西服', '宽松连帽衫', '背带裤', '校服', '运动服', '雨衣', '舒适睡衣', '魔法斗篷', '华丽礼服', '运动棒球帽', '厚羽绒服', '皮衣', '整洁衬衫领带', '碎花连衣裙', '街头潮牌', '道袍', '针织毛衣', '可爱动物连体睡衣', '宇航服', '探险家背心帽', '泳衣泳圈', '风衣', '天使翅膀', '皇冠斗篷', '牛仔裤白T恤', '侦探风衣'],
  '🎒 道具/动作': ['拿着手机', '拿着咖啡杯', '戴着墨镜', '戴着耳机', '使用笔记本电脑', '看书', '拿着气球', '抱着花束', '握着麦克风唱歌', '握着游戏手柄', '拿着平底锅', '拿着大放大镜', '在画板上画画', '挥舞魔法棒', '提着购物篮', '打着伞', '吃爆米花', '推着吸尘器', '用望远镜偷看', '在瑜伽垫上拉伸', '查看智能手表', '拿着一沓钞票'],
  '🌈 特效/背景': ['闪烁发光特效', '发射爱心', '星光洒落', '霓虹灯闪烁', '漫画集中线', '樱花飘落', '火焰燃烧特效', '挥洒汗水', '阴暗乌云', '彩虹光晕', '砰砰爆炸', '暗黑阴影', '聚光灯', '暴风雪', '雷电交加', '咕嘟咕嘟泡泡', '温暖阳光', '飘浮音符', '随风飘扬']
};

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
    geminiBackgroundMode: 'Gemini 배경',
    geminiTransparent: '투명 배경',
    geminiSolid: '단색 배경',
    geminiChroma: '크로마키',
    geminiStageMode: 'Gemini 작업 단계',
    geminiReferenceStage: '① 기준 캐릭터 만들기',
    geminiFinalStage: '② 기준 이미지로 생성',
    geminiReferenceTip: '먼저 문구 없는 기준 캐릭터를 만든 뒤, 마음에 드는 결과 이미지를 저장하세요.',
    geminiFinalTip: 'Gemini는 표정과 행동 중심 생성에 강합니다. 시트 초안을 만든 뒤 15종 개별 분할에서 한 장씩 생성해 보세요.',
    geminiRepairTitle: '결과 보정 프롬프트',
    repairHelp: '💡 사용법: AI가 만든 이미지에 결함이 생겼을 때 버튼을 눌러 복사한 뒤, AI 대화창에 그대로 붙여넣어(Ctrl+V) 전송하세요.',
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
    geminiBackgroundMode: 'Gemini background',
    geminiTransparent: 'Transparent',
    geminiSolid: 'Solid color',
    geminiChroma: 'Chroma key',
    geminiStageMode: 'Gemini workflow stage',
    geminiReferenceStage: '① Create base character',
    geminiFinalStage: '② Generate from reference',
    geminiReferenceTip: 'First create a text-free base character, then save the result you like.',
    geminiFinalTip: 'Gemini excels at expression and action generation. Use the sheet as a draft, then generate each sticker with Batch Split.',
    geminiRepairTitle: 'Result correction prompts',
    repairHelp: '💡 How to use: Click a button to copy the prompt, then paste (Ctrl+V) into the active AI chat to fix defects.',
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
  },
  ja: {
    title: 'Prompt Studio',
    step1: 'キャラクター設定',
    whatCharacter: 'キャラクター説明',
    clear: 'リセット',
    placeholder: '例：パンが大好きな丸い黄色い猫',
    characterSource: 'キャラクター基準',
    directSource: '✏️ 直接設定',
    photoSource: '📷 写真から作成',
    photoMethod: '写真参照スタイル',
    photoExact: '写真そのまま再現',
    photoFeatures: '特徴だけ抽出 (3D)',
    photoCharacterize: '可愛くSDキャラ化',
    photoAttachGuide: 'プロンプトコピー後、AIチャットにも写真を添付してください。',
    photoActive: '参照画像有効中',
    phrases: 'フレーズ選択 (15種)',
    themeSelect: 'テーマ選択',
    randomMix: 'ランダム',
    gptCopy: 'Copy for ChatGPT',
    geminiCopy: 'Copy for Gemini',
    previewTitle: 'プロンプトプレビュー',
    forGpt: 'ChatGPT用',
    forGemini: 'Gemini用',
    guideTitle: '使い方ガイド',
    guide1Q: '🤔 AIスタンププロンプトメーカーとは？',
    guide1A: 'スタンプのアイデアはあるけれど、AIへの指示出しが 難しいとお悩みですか？\n好きなキャラクターの特徴とフレーズを選ぶだけで、ChatGPTやGeminiで使えるスタンプ制作プロンプトを自動作成します。',
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
    geminiRepairTitle: '結果補正プロンプト',
    repairHelp: '💡 使い方: AIが生成した画像に問題がある場合、ボタンを押してコピーし、AIチャットに貼り付けて(Ctrl+V)送信してください。',
    geminiRepairIdentity: 'キャラが変わった',
    geminiRepairCrop: '体が切れた',
    geminiRepairText: '文字が違う',
    geminiWorkflowTip: 'Geminiヒント: シート全体は構図の試作として使い、最終画像は15종個別分割で1枚ずつ生成することをおすすめします。',
    emptyPhraseError: '空のフレーズがあります。すべてのフレーズを入力してください。',
    duplicatePhraseError: '重複したフレーズがあります。それぞれ異なるフレーズを入力してください。',
    guide3Q: '✂️ 背景（透過）の簡単な消し方は？',
    guide3A: 'remove.bgなどの無料Webツールを使うとワンクリックで背景を切り抜けます。スマホではギャラリーアプリで被写体を長押しして「コピー/保存」すると自動的に透過画像になります。',
    guide4Q: '💬 作ったスタンプはLINEでどう使う？',
    guide4A: 'LINE Creators Marketで申請して販売することも、透過PNGをギャラリーに保存してトーク画面で画像として送信して楽しむこともできます！',
  },
  zh: {
    title: 'Prompt Studio',
    step1: '角色设置',
    whatCharacter: '角色描述',
    clear: '重置',
    placeholder: '例：一只喜欢吃面包的圆滚滚黄色小猫',
    characterSource: '角色来源',
    directSource: '✏️ 手动描述',
    photoSource: '📷 上传照片',
    photoMethod: '照片参考风格',
    photoExact: '高还原度写真',
    photoFeatures: '提取特征 (3D)',
    photoCharacterize: 'Q版SD卡通化',
    photoAttachGuide: '复制提示词后，请在AI聊天框中同时发送参考照片。',
    photoActive: '参考图片已启用',
    phrases: '表情短语网格 (15种)',
    themeSelect: '主题选择',
    randomMix: '随机混合',
    gptCopy: 'Copy for ChatGPT',
    geminiCopy: 'Copy for Gemini',
    previewTitle: '提示词预览',
    forGpt: 'ChatGPT专用',
    forGemini: 'Gemini专用',
    guideTitle: '使用指南',
    guide1Q: '🤔 什么是AI表情包提示词生成器？',
    guide1A: '想制作表情包却不知道如何给AI写提示词？选择你喜欢的角色特征和常用短语，本工具将自动为你生成适用于ChatGPT和Gemini的表情包提示词。',
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
    geminiRepairTitle: '结果修正提示词',
    repairHelp: '💡 使用方法：若AI生成图出现瑕疵，点击复制修正提示词并粘贴发送至同一AI对话框(Ctrl+V)即可修复。',
    geminiRepairIdentity: '角色变形了',
    geminiRepairCrop: '身体被裁剪了',
    geminiRepairText: '文字出错了',
    geminiWorkflowTip: 'Gemini提示：建议将整页作为构图草稿，最终成品使用单张拆分模式逐一生成。',
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
    <div className="text-center mt-lg md:mt-xl p-4 md:p-md bg-surface-container-lowest rounded-md border border-outline-variant shadow-bubbly overflow-hidden">
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-container-lowest p-3 sm:p-4 rounded-md border border-outline-variant shadow-bubbly">
        <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 shrink-0">
          <span>❓</span> {t.guideHeader}
        </h2>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-mint-soft p-1.5 rounded-md border border-mint-border shadow-xs w-full lg:w-auto flex-nowrap shrink-0">
          <button
            onClick={() => setActiveTab('model')}
            className={`interactive-control whitespace-nowrap flex-none px-3.5 py-1.5 text-[13px] sm:text-[14px] font-bold rounded-md ${activeTab === 'model' ? 'bg-mint text-mint-strong shadow-xs border border-mint-border' : 'text-mint-strong hover:bg-mint-hover'}`}
          >
            🤖 ChatGPT vs Gemini
          </button>
          <button
            onClick={() => setActiveTab('bg')}
            className={`interactive-control whitespace-nowrap flex-none px-3.5 py-1.5 text-[13px] sm:text-[14px] font-bold rounded-md ${activeTab === 'bg' ? 'bg-mint text-mint-strong shadow-xs border border-mint-border' : 'text-mint-strong hover:bg-mint-hover'}`}
          >
            ✂️ {lang === 'ko' ? '배경 (누끼) 지우는 법' : lang === 'ja' ? '背景（透過）の消し方' : lang === 'zh' ? '抠图 (透明背景)' : 'Remove Background'}
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`interactive-control whitespace-nowrap flex-none px-3.5 py-1.5 text-[13px] sm:text-[14px] font-bold rounded-md ${activeTab === 'usage' ? 'bg-mint text-mint-strong shadow-xs border border-mint-border' : 'text-mint-strong hover:bg-mint-hover'}`}
          >
            💬 {lang === 'ko' ? '이모티콘 등록·사용법' : lang === 'ja' ? 'スタンプの登録・使用方法' : lang === 'zh' ? '表情包使用指南' : 'How to Use Emoticons'}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    ko: '사진을 첨부하면 인물이나 반려동물의 특징을 반영한 캐릭터를 만들 수 있습니다. ChatGPT는 문구가 필요한 이미지에 활용하고, Gemini는 마음에 드는 기준 캐릭터를 만든 뒤 그 이미지를 다시 첨부해 한 장씩 변형해 보세요.',
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

function App() {
  const [lang, setLang] = useState('ko');
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
  const [geminiBackgroundMode, setGeminiBackgroundMode] = useState('transparent');

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
        ko: '[최대한 실물 닮게 - High Fidelity Photo Caricature] 첨부한 인물 사진의 실물 이목구비(눈 모양, 무쌍/쌍꺼풀, 콧대, 입술, 턱선), 헤어스타일, 피부 톤과 의상을 100% 동일하게 유지한 실사 사진 기반 캐리커처 짤 스티커로 제작해주세요. 2D 캐릭터나 만화 그림체로 변형하지 말고, 실제 사진 속 인물의 실사 얼굴 이목구비와 피부 질감을 100% 그대로 보존하세요.',
        en: '[HIGH-FIDELITY REALISTIC PHOTO CARICATURE - EXACT FACE RETENTION] Create a photo-realistic caricature cutout sticker preserving 100% exact facial features, eye shape, nose bridge, lip shape, facial structure, skin texture, hairstyle, and outfit from the attached reference photo. Do NOT render as a 2D vector cartoon. Preserve authentic photographic facial likeness on every sticker.',
      },
      features: {
        ko: '[핵심 특징만 포인트 반영 - Soft 3D Stylized Avatar] 사진에서 실제 존재하는 시그니처 포인트(헤어스타일, 이목구비, 의상 등 사진에 실제로 있는 특징만)를 강렬하게 살린 소프트 3D 아바타 일러스트 캐릭터 짤 스티커로 제작해주세요. 원본 사진에 없는 안경이나 모자 등 가짜 악세사리를 절대 추가하지 마세요. 평면 2D 선화가 아닌, 3D 입체 헤어 결, 매끄러운 3D 피부 질감, 소프트 조명이 느껴지는 고급스러운 반실사 3D 캐릭터 스타일을 적용하세요.',
        en: '[SIGNATURE FEATURE EXTRACTION - SOFT 3D STYLIZED AVATAR] Create a soft 3D stylized digital avatar caricature sticker capturing only authentic traits visible in the reference photo (hairstyle, facial features, outfit). Do NOT invent or add unrequested accessories like glasses or hats if not present in the photo. Render with smooth 3D skin texture, realistic volumetric hair flow, soft studio 3D lighting, and a high-end semi-realistic 3D artwork finish.',
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
    if (selectedArtStyle) return `${selectedArtStyle}; treat this selected art style as the highest-priority visual direction`;
    if (characterSource === 'photo') {
      if (photoReferenceMode === 'exact') return 'High-fidelity realistic photo caricature sticker style preserving 100% exact facial identity, eye shape, nose structure, lip line, facial structure, skin texture, and hairstyle from the reference photo; do not alter facial features';
      if (photoReferenceMode === 'features') return 'Semi-realistic 3D character avatar sticker style capturing authentic signature facial features, hair, and outfit from the reference photo';
      return 'Cute 2.5-head Chibi SD mascot sticker style inspired by the reference photo';
    }
    return 'cute, approachable, high-quality 2D messenger sticker illustration with clean outlines and harmonious colors';
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
      exact: 'preserve exact high-fidelity resemblance (95%+ likeness) to the reference photo with realistic features; do not add unrequested glasses or hats',
      features: 'extract authentic signature features (hair, facial traits, outfit) visible in photo; do not add unrequested glasses or accessories',
      characterize: 'reinterpret into an ultra-cute 2D Chibi/SD mascot with a big head, chubby body, and huge expressive eyes',
    }[photoReferenceMode];

    const photoAppearanceKo = {
      exact: '참고 사진 속 대상과 95% 이상 극도로 닮게 이목구비와 비율을 사실적으로 재현 (사진에 없는 안경/모자 등 임의 추가 금지)',
      features: '참고 사진의 실제 시그니처 포인트(헤어, 이목구비, 의상)만 추출 (사진에 없는 안경/악세사리 임의 추가 금지)',
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
      exact: 'preserve exact high-fidelity resemblance (95%+ likeness) to the reference photo with realistic features; do not add unrequested glasses or hats',
      features: 'extract authentic signature features (hair, facial traits, outfit) visible in photo; do not add unrequested glasses or accessories',
      characterize: 'reinterpret into an ultra-cute 2D Chibi/SD mascot with a big head, chubby body, and huge expressive eyes',
    }[photoReferenceMode];

    const photoAppearanceKo = {
      exact: '참고 사진 속 대상과 95% 이상 극도로 닮게 이목구비와 비율을 사실적으로 재현 (사진에 없는 안경/모자 등 임의 추가 금지)',
      features: '참고 사진의 실제 시그니처 포인트(헤어, 이목구비, 의상)만 추출 (사진에 없는 안경/악세사리 임의 추가 금지)',
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

  const getGeminiBackgroundInstruction = () => {
    const instructions = {
      transparent: 'Clean solid white background with a subtle crisp sticker die-cut white outline.',
      solid: 'One clean solid background color with strong contrast against the character. No gradient, texture, or background objects.',
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

    const geminiProportions = characterSource === 'photo' ? {
      exact: 'High-fidelity photo-realistic caricature cutout sticker style matching the attached reference photo accurately, with real photographic face texture, hair, skin tone, and authentic outfit details. Do NOT render as 2D vector cartoon.',
      features: 'Soft 3D stylized digital avatar caricature sticker capturing signature traits (hair, glasses, outfit) with smooth 3D skin texture, volumetric hair flow, soft studio 3D lighting, and high-end semi-realistic 3D artwork finish. Do NOT use flat 2D line art.',
      characterize: 'Adorable 2.5-head Chibi SD manga/anime mascot proportion with a big round head, huge sparkling expressive eyes, chubby cheeks, and soft glossy hair highlights.',
    }[photoReferenceMode] : 'Adorable 2.5-head Chibi SD manga/anime mascot proportion with a big round head, huge sparkling expressive eyes, chubby cheeks, and soft glossy hair highlights.';

    if (generationMode === 'individual' || hasPhraseOverride) {
      const textPolicy = geminiTextMode === 'text'
        ? `Render the exact phrase "${targetPhrase}" once in playful, hand-drawn Korean calligraphy lettering beside the character. No parentheses (), brackets [], or rectangular text boxes.`
        : `Do not render text, letters, or numbers. Use "${targetPhrase}" only as visual context for expression and pose.`;
      const textExclusion = geminiTextMode === 'text'
        ? 'No extra words, altered spelling, random letters, numbers, parentheses, or text boxes.'
        : 'No text, letters, numbers, typography, or meaningless symbols.';

      return `[GOAL]
Create a high-end 2D messenger sticker (KakaoTalk / LINE style) featuring a consistent character.

[VISUAL REFERENCE & IDENTITY]
${referenceInstruction}
- Subject: ${character.subject}
- Appearance & Features: ${character.appearance}
- Outfit: ${character.outfit}

[ART DIRECTION & PROPORTIONS]
${character.artStyle}. ${geminiProportions} Clean crisp vector outlines, vibrant colors, and soft cell shading.

[SCENE, POSE & EXPRESSION]
- Target Phrase / Mood: "${targetPhrase}"
- Facial Expression: Highly expressive, unmistakable emotion matching "${targetPhrase}".
- Body Pose: Dynamic, energetic full-body posture (e.g. sitting, crouching, jumping, holding props, or waving). Never use a static half-body bust pose.
- Supporting Props & Sparkle Effects: ${character.props}, ${character.effects}, cute little accents.

[CANVAS & COMPOSITION]
Square 1:1 canvas. Exactly one complete centered full-body character visible from head to toe with 15% margin on all sides. ${getGeminiBackgroundInstruction()}

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
Create a master 15-sticker 2D messenger sheet (KakaoTalk / LINE style) featuring a consistent character across all stickers.

[VISUAL REFERENCE & IDENTITY]
${referenceInstruction}
- Subject: ${character.subject}
- Appearance & Features: ${character.appearance}
- Outfit: ${character.outfit}

[ART DIRECTION & PROPORTIONS]
${character.artStyle}. ${geminiProportions} Clean crisp vector outlines, vibrant colors, and soft cell shading. Maintain identical character proportions and style across all 15 stickers.

[15 DYNAMIC POSES & EXPRESSIONS]
For each sticker, infer a unique, highly expressive facial emotion and a DYNAMIC full-body pose (e.g. sitting, crouching, jumping, holding props, winking, eating, or cheering). Every sticker MUST show a complete full-body character visible head-to-toe:
${panelPlan}
Supporting props & sparkle effects: ${character.props}, ${character.effects}, cute accents.

[CANVAS & LAYOUT]
Arrange all 15 full-body stickers floating freely with generous spacing. Each character has a subtle crisp sticker die-cut white outline. ${getGeminiBackgroundInstruction()} Absolutely NO guide lines, NO grid lines, NO cell borders, NO table lines, NO dividing lines, NO crop marks, NO bounding boxes, NO sticker numbers.

[TEXT POLICY]
${textPolicy}

[DO NOT INCLUDE]
${textExclusion} No guide lines, no grid lines, no cell dividers, no border lines, no table lines, no crop marks, no panel boxes, no watermark, no outer frame, no duplicate character inside a single sticker, no extra limbs, no cropped body, no half-body bust shot, no dull background color, or photorealism.`;
  };

  const getRepairPrompt = (repairType, textMode) => {
    const targetPhrase = getSelectedPhrase();
    const repairPrompts = {
      identity: `Edit the most recent image only. Restore the character identity and face so it stays strictly consistent with the original character design. Preserve the current scene, pose, expression, composition, and text. Correct only the face, silhouette, body proportions, colors, outfit, linework, and texture. Return one corrected image.`,
      crop: `Edit the most recent image only. Keep the same character identity, expression, pose, colors, outfit, art style, and${textMode === 'text' ? ` exact phrase "${targetPhrase}"` : ' text-free design'}. Reframe the composition so the entire character and all effects are visible with at least 12% empty margin on every side. Do not change anything else. Return one corrected square image.`,
      text: `Edit the most recent image only. Keep the character, face, pose, expression, colors, outfit, art style, effects, composition, and background unchanged. Replace only the incorrect lettering with the exact phrase "${targetPhrase}" once. Verify every Korean character, spelling, and spacing before rendering. Add no other text. Return one corrected image.`,
    };
    return repairPrompts[repairType];
  };

  const copyRepairPrompt = (repairType, textMode, keyPrefix = 'repair') => {
    navigator.clipboard.writeText(getRepairPrompt(repairType, textMode));
    setCopiedType(`${keyPrefix}-${repairType}`);
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
    <div className={`font-body-md text-body-md antialiased pb-32 max-w-full w-full ${lang === 'ja' ? 'lang-ja' : lang === 'zh' ? 'lang-zh' : ''}`}>
      {/* TopAppBar */}
      <header className="w-full top-0 bg-background/95 backdrop-blur-md flex items-center justify-between px-3 sm:px-gutter min-h-14 py-2 max-w-7xl mx-auto z-50 sticky border-b border-outline-variant/30 shadow-xs overflow-hidden">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <h1 className="brand-logo text-[18px] sm:text-[22px] leading-none font-bold text-primary-strong tracking-tight whitespace-nowrap">
            Prompt Studio
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
            <span>{lang === 'ko' ? '활용 가이드' : lang === 'ja' ? 'ガイド' : lang === 'zh' ? '指南' : 'Guide'}</span>
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
                className={`interactive-control px-2 sm:px-3 py-1 text-[11px] sm:text-[12px] font-bold rounded-full transition-colors flex items-center gap-1 ${
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
      </header>

      <main className="max-w-3xl mx-auto px-container-margin mt-md md:mt-xl flex flex-col gap-lg md:gap-xl">
        {/* App Intro Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#FFD3B6] via-[#FFE8B6] to-[#FFC2C2] text-[#5C3A21] p-4 sm:p-6 md:p-xl rounded-md shadow-bubbly text-center flex flex-col items-center justify-center gap-3 sm:gap-4 md:gap-6 border-2 sm:border-4 border-white max-w-full w-full">
          {/* Decorative floating emojis */}
          <div className="absolute top-6 left-8 hidden sm:block text-[40px] transform -rotate-12 drop-shadow-md">✨</div>
          <div className="absolute bottom-8 left-12 hidden sm:block text-[48px] transform rotate-12 drop-shadow-md">🎨</div>
          <div className="absolute top-12 right-12 hidden sm:block text-[48px] transform rotate-12 drop-shadow-md">🚀</div>
          <div className="absolute bottom-10 right-10 hidden sm:block text-[40px] transform -rotate-12 drop-shadow-md">💖</div>
          
          <div className="z-10 flex flex-col gap-2 sm:gap-3 w-full max-w-full px-1">
            <span className="inline-block bg-white/60 text-[#5C3A21] font-black text-[11px] sm:text-[13px] tracking-wider px-3 sm:px-4 py-1 sm:py-1.5 rounded-full backdrop-blur-sm border border-white/80 mx-auto shadow-sm max-w-full text-ellipsis overflow-hidden">
              AI STICKER PROMPT MAKER
            </span>
            <h2 className="text-[18px] xs:text-[22px] sm:text-[28px] md:text-[38px] font-black tracking-tight leading-snug drop-shadow-sm w-full max-w-full px-1 [word-break:keep-all] [text-wrap:balance]">
              {t.guide1Q.replace('🤔 ', '')}
            </h2>
          </div>
          
          <p className="z-10 text-[13px] sm:text-[15px] md:text-[17px] leading-relaxed max-w-2xl mx-auto font-bold bg-white/40 p-3.5 sm:p-5 rounded-md backdrop-blur-md border border-white/60 shadow-sm whitespace-pre-wrap [word-break:keep-all] w-full">
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
          
          <div className="bg-surface-container-lowest rounded-md p-3.5 sm:p-md shadow-bubbly border border-outline-variant">
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
                <div className="rounded-lg border border-mint-border bg-mint-soft p-3 flex flex-col gap-3">
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
            
            <div className="mt-md bg-surface-container-highest rounded-md overflow-hidden">
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
                  <span className="text-[13px] font-bold text-[#795B16]">{t.geminiRepairTitle}</span>
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
                      onClick={() => copyRepairPrompt(repairType, gptTextMode, 'gpt-repair')}
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
                      onClick={() => copyRepairPrompt(repairType, geminiTextMode, 'gemini-repair')}
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
          <div className="bg-surface-container-lowest rounded-md p-3.5 sm:p-md shadow-bubbly border border-outline-variant">
            <textarea 
              className="w-full bg-white border-2 border-outline-variant rounded-md p-4 text-on-surface font-normal focus:outline-none resize-y min-h-[200px] shadow-sm" 
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
            className="interactive-control w-full min-h-[64px] flex-none sm:flex-1 rounded-md bg-[#FFE8B5] text-[#5A461B] border border-[#E8C66A] font-headline-sm flex items-center justify-center gap-2 hover:bg-[#FFDB80] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#FFE8B5]"
          >
            {copiedType === 'gpt' ? <CheckCircle2 size={24} className="text-[#2D7D64]" /> : <Bot size={24} className="text-[#2D7D64]" />}
            {t.gptCopy}
          </button>
          
          <button 
            onClick={() => copyToClipboard('gemini')}
            disabled={Boolean(visiblePromptValidationError)}
            className="interactive-control w-full min-h-[64px] flex-none sm:flex-1 rounded-md bg-[#FFE8B5] text-[#5A461B] border border-[#E8C66A] font-headline-sm flex items-center justify-center gap-2 hover:bg-[#FFDB80] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C66A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#FFE8B5]"
          >
            {copiedType === 'gemini' ? <CheckCircle2 size={24} className="text-[#D97706]" /> : <Sparkles size={24} className="text-[#D97706]" />}
            {t.geminiCopy}
          </button>
        </section>
        
        <AdBanner />

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
                ? '이 프롬프트를 복사해서 AI(ChatGPT, Gemini)에 붙여넣을 때, 본인이나 우리 아이, 반려동물의 사진을 함께 첨부해 보세요. 대상을 똑닮은 완벽한 커스텀 이모티콘 시트가 만들어집니다!' 
                : lang === 'ja'
                ? 'このプロンプトをコピーしてAI(ChatGPT, Gemini)に貼り付ける際、ご自身や子ども、ペットの写真も一緒に添付してみてください。そっくりなカスタムスタンプシートが作れます！'
                : lang === 'zh'
                ? '将此提示词复制粘贴给AI (ChatGPT, Gemini) 时，可以同时发送您自己、孩子或宠物的照片。AI将完美还原特征，生成独一无二的专属表情包！'
                : 'When pasting this prompt into AI (ChatGPT, Gemini), attach a photo of yourself, your child, or your pet. It will generate a custom emoji sheet!'}
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
