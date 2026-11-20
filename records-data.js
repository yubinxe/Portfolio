/* records-data.js — 게재 · 취재 기록 아카이브(gallery.html#seoripul-reporter)의 단일 데이터 원천.
 * 새 지면이 나오면 이 배열에 한 건만 더하고 `npm run build` → 갤러리에 최신순으로 프리렌더된다(scripts/build-records.mjs).
 * 규칙
 *  - kind 는 넷 중 하나 — official(공식 소식지 게재) · citizen(시민기자 취재) · press(외부 언론 실명 보도) · field(현장 활동 기록). 섞지 않는다.
 *  - 모르는 값(호수 · 날짜 · 원문 주소)은 null — 지어내지 않는다. 같은 기사의 지면이 여러 장이면 images 에 더한다(기록을 새로 만들지 않는다).
 *  - credit 은 지면 표기 그대로(공동 기명이면 공동 기명). 단독 집필 · 단독 취재로 쓰지 않는다. */
(function (root) {
  var KIND = {
    official: "공식 소식지 게재",
    citizen: "시민기자 취재",
    press: "외부 언론 실명 보도",
    field: "현장 활동 기록",
  };
  var RECORDS = [
    {
      id: "seoripul-2026-11",
      kind: "official",
      series: "서리풀기자단",
      cohort: 5,
      year: 2026,
      month: 11,
      title: "서리풀 아트테리어 · 루이스폴센 · 두성종이",
      summary: "지역 공간과 소상공인의 변화, 조명 · 종이를 주제로 한 서초의 공간을 소개한 소식지 지면입니다.",
      publisher: "서초구 소식지",
      issue: "2026년 11월호",
      publishedAt: "2026-11",
      credit: "공동 기명 — 지면 하단 ‘글 서리풀기자 김지은, 김유빈, 조윤예, 장소라’",
      role: "취재 · 기사 작성(제5기 서리풀기자단)",
      images: [
        { src: "images/seoripul-2026-11.jpg", thumb: "images/seoripul-2026-11-thumb.jpg", w: 908, h: 807, tw: 470, th: 300,
          alt: "서초구 소식지 2026년 11월호 지면 — 서리풀 아트테리어 · 루이스폴센 · 두성종이 소개, 하단에 서리풀기자 김유빈 기명" },
      ],
      sourceUrl: null,
      evidence: "provided-page",
      visibility: "public-excerpt",
    },
    {
      id: "hankyung-2026-11-11",
      kind: "press",
      series: "제11회 부동산산업의 날",
      year: 2026,
      month: 11,
      title: "‘부동산산업의 날’ 43명 표창…마케팅협회, AI 인재 양성 성과 공개",
      summary: "“매력일자리에 참여한 청년 김유빈 씨는 청약홈과 LH 청약플러스의 청약·공공임대 모집공고를 지도에 모아 보여주는 ‘집캐치’를 선보였다.” — 기사 본문 한 문장",
      publisher: "한국경제",
      issue: "2026. 11. 11",
      publishedAt: "2026-11-11",
      credit: "기사 본문 실명 언급(집캐치 개발자)",
      role: "KREMA 홍보부스 집캐치 발표 · 시연",
      images: [],
      sourceUrl: "https://www.hankyung.com/article/202611110211i",
      evidence: "press-article",
      visibility: "public-link",
    },
    {
      id: "joongang-2026-11-11",
      kind: "press",
      series: "제11회 부동산산업의 날",
      year: 2026,
      month: 11,
      title: "한국부동산마케팅협회 4명, ‘부동산산업의 날’ 국토부 장관 표창",
      summary: "“서울시 매력일자리 참여자 김유빈 씨가 개발한 ‘집캐치(ZIPCATCH)’도 소개됐다.” — 기사 본문 한 문장",
      publisher: "중앙일보",
      issue: "2026. 11. 11",
      publishedAt: "2026-11-11",
      credit: "기사 본문 실명 언급(집캐치 개발자)",
      role: "KREMA 홍보부스 집캐치 발표 · 시연",
      images: [],
      sourceUrl: "https://www.joongang.co.kr/article/25477695",
      evidence: "press-article",
      visibility: "public-link",
    },
  ];
  var api = { KIND: KIND, RECORDS: RECORDS };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.YK_RECORDS = api;
})(typeof window !== "undefined" ? window : globalThis);
