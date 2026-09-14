/* ============================================================================
 * kb.js — 유빈 AI 지식카드 · 서비스 카탈로그 · 무료상담 스크립트 (단일 진실 원천)
 * ----------------------------------------------------------------------------
 * · 브라우저: <script src="kb.js" defer></script> → window.YUBIN_KB
 * · Node:     const KB = require("./kb.js")  (api/chat.js · build-seed.mjs 에서 사용)
 * · 모든 사실은 index.html(sections.jsx) · career.html · gallery.html 본문과 대조된 것만 수록.
 *   포트폴리오 본문에 없는 수치·URL·직함은 절대 추가하지 않습니다.
 *
 * 카드 스키마
 *   { id, cat, tags[], title, body,
 *     primary:   { label, href },      // 주 CTA — 딥링크(페이지#앵커) 또는 외부 URL
 *     secondary: { label, href } | null // 보조 CTA — 없으면 null (build-seed 가 라벨로 추론)
 *   }
 * 딥링크 href 규칙: "index.html#trajectory" · "career.html#cv-ssafy" · "gallery.html#credentials"
 * ========================================================================== */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.YUBIN_KB = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var SITE = "https://yubinxe.github.io/Portfolio/";
  var EMAIL = "yubin120866@gmail.com";
  var EMAIL_OFFICE = "ybkim@gyunggook.com";

  /* ------------------------------------------------------------ 지식카드 */
  var CARDS = [
    /* ---- 인물 ---- */
    { id: "profile", cat: "인물", tags: ["소개", "누구", "김유빈", "yubin", "ethan", "about", "이름", "나이", "출생", "2004"],
      title: "인물 개요",
      body: "김유빈(Yubin Kim, 별칭 Ethan Kim) · 2004년생. 법무법인 경국 사원(Staff)으로 대외협력 · 마케팅 · 개발을 함께 맡아 'AI Process Innovation'을 담당합니다. 근무지는 서울 서초구 서초대로 264 법조타워 15F. 슬로건은 'Technical Precision Meets Legal Dignity' — 법률의 언어를 대중의 언어로 옮기고, 신뢰를 쌓는 대외협력과 홍보를 설계합니다.",
      primary: { label: "선언 보기", href: "index.html#manifesto" },
      secondary: { label: "경력 상세", href: "career.html#experience" } },
    { id: "thesis", cat: "인물", tags: ["철학", "명제", "왜", "전달", "전문성", "자리", "가치관"],
      title: "일의 명제 — 전문성보다 전달",
      body: "\"아무리 좋은 전문성도, 전해지지 않으면 없는 것과 같습니다.\" 세 개의 시스템(VOC 트리아지 · 청약 대시보드 · 브랜드 캠페인 필름)에서 사람이 하던 일이 도구로 넘어갈 때마다 사람이 남아야 할 자리가 또렷해졌고, 그 자리는 언제나 '도구에 무엇을 시킬지 정하는 일'이었습니다. 그래서 전문성과 전달력을 함께 갖춘 사람이 필요하다는 것이 그의 명제입니다.",
      primary: { label: "Why It Matters", href: "index.html#composite" },
      secondary: null },
    { id: "office", cat: "인물", tags: ["법무법인", "경국", "직장", "회사", "소속", "근무", "위치", "서초", "주소"],
      title: "소속 — 법무법인 경국",
      body: "법무법인 경국(서울 서초구 서초대로 264 법조타워 15F) 사원. 송무·사무 워크플로우를 진단하고 AI 자동화로 다시 설계하는 'AI 프로세스 혁신'과, 법률 조직의 대외협력·홍보 콘텐츠 기획을 맡고 있습니다.",
      primary: { label: "소개 섹션", href: "index.html#about" },
      secondary: { label: "업무 영역", href: "career.html#practice" } },

    /* ---- 융합 역량 ---- */
    { id: "composite", cat: "역량", tags: ["역량", "강점", "융합", "핵심", "composite", "무엇", "잘", "여섯", "도메인"],
      title: "융합 역량 — 여섯 도메인",
      body: "여섯 도메인이 하나의 판단력으로 수렴합니다.\n- 01 마케팅 기획 — KREMA 4기, 브랜드 캠페인\n- 02 미디어 · 커뮤니케이션 — 서울시민기자단, 연합뉴스TV\n- 03 법무 · 송무 — 법무법인 경국 실무\n- 04 AI 엔지니어링 — SSAFY 13기, 서울대 AIED 4기\n- 05 데이터 · 인프라 — 공공데이터 API, GWS 연동\n- 06 공간 · 건설 — 건국대 스마트건설, BIM · 드론 측량\n대외협력과 마케팅을 중심에 두고 나머지 전문성이 그 전달을 뒷받침합니다.",
      primary: { label: "융합 역량 보기", href: "index.html#composite" },
      secondary: { label: "실무 도구", href: "index.html#arsenal" } },
    { id: "dom-marketing", cat: "역량", tags: ["마케팅", "기획", "세그먼트", "캠페인", "매체"],
      title: "01 마케팅 기획",
      body: "KREMA(한국부동산마케팅협회) 4기에서 데이터 기반 타깃 세그먼트 도출과 매체별 전략 수립을 익히고, 르엘 성수 · 루이비통 캠페인 필름 등 실제 산출물로 검증했습니다.",
      primary: { label: "역량 01", href: "index.html#dom-01" },
      secondary: { label: "브랜드 필름 보기", href: "index.html#ed-02" } },
    { id: "dom-media", cat: "역량", tags: ["미디어", "커뮤니케이션", "기자", "취재", "콘텐츠", "홍보"],
      title: "02 미디어 · 커뮤니케이션",
      body: "서울시민기자단 취재기자 활동과 연합뉴스TV 인터뷰, 생성형 AI 영상 제작으로 전문적 내용을 대중의 언어로 전달합니다.",
      primary: { label: "역량 02", href: "index.html#dom-02" },
      secondary: { label: "인터뷰 보기", href: "gallery.html#g-yonhap" } },
    { id: "dom-legal", cat: "역량", tags: ["법무", "송무", "법률", "소송", "사무", "리걸"],
      title: "03 법무 · 송무",
      body: "법무법인 경국 송무·사무 실무로 다진 신뢰와 정확성의 기반. 무엇을 리스크로 볼지 정하는 기준은 법무 감각에서 나온다는 것이 그의 원칙입니다. 법률·세무 판단 자체는 전문가 상담이 필요합니다.",
      primary: { label: "역량 03", href: "index.html#dom-03" },
      secondary: { label: "AI 프로세스 혁신", href: "career.html#practice-ai" } },
    { id: "dom-ai", cat: "역량", tags: ["ai", "인공지능", "엔지니어링", "생성형", "프롬프트", "개발"],
      title: "04 AI 엔지니어링",
      body: "삼성청년SW아카데미(SSAFY) 13기와 서울대 AI 교육 전문가 과정(AIED) 4기에서 익힌 생성형 AI 콘텐츠 제작 · 프롬프트 아키텍처 역량. React · Vercel 배포까지 직접 수행합니다.",
      primary: { label: "역량 04", href: "index.html#dom-04" },
      secondary: { label: "SSAFY 기록", href: "career.html#cv-ssafy" } },
    { id: "dom-data", cat: "역량", tags: ["데이터", "인프라", "대시보드", "공공데이터", "api", "gws"],
      title: "05 데이터 · 인프라",
      body: "공공데이터 API와 Google Workspace API를 의사결정 가능한 화면으로 번역합니다. 청약 인사이트 대시보드와 VOC 트리아지 시스템을 직접 구축·배포했습니다.",
      primary: { label: "역량 05", href: "index.html#dom-05" },
      secondary: { label: "대시보드 열기", href: "https://cheongak-dashboard-opal.vercel.app" } },
    { id: "dom-built", cat: "역량", tags: ["건설", "공간", "부동산", "bim", "드론", "측량", "스마트건설"],
      title: "06 공간 · 건설",
      body: "건국대학교 스마트건설기술교육 프로그램에서 BIM 설계 데이터 해석과 드론 측량, 건설 자동화 워크플로우를 실습하며 부동산·건설 도메인을 데이터의 언어로 읽는 관점을 정립했습니다.",
      primary: { label: "역량 06", href: "index.html#dom-06" },
      secondary: { label: "건국대 과정", href: "career.html#cv-konkuk" } },
    { id: "arsenal", cat: "역량", tags: ["도구", "스택", "기술", "arsenal", "툴", "프로그램", "소프트웨어"],
      title: "실무 도구 (The Arsenal)",
      body: "- 생성형 AI: GPT Image-2, Suno AI, ElevenLabs, Veo 3, Google Vids, Hyperframe\n- 데이터 · 개발: 공공데이터 API, GWS API, React, Vercel, Prompt Architecture\n- 도메인: BIM · 드론 측량, 송무 프로세스, 청약 · 부동산 데이터",
      primary: { label: "도구 목록", href: "index.html#arsenal" },
      secondary: null },
    { id: "creds", cat: "자격", tags: ["자격", "자격증", "증명", "credential", "tesat", "opic", "전기기능사", "분양대행자", "영어", "경제"],
      title: "보유 자격 (The Credentials)",
      body: "- TESAT — 경제이해력검증시험 (한국경제신문 주관)\n- OPIc IH — 영어 말하기 Intermediate High (ACTFL 공인 등급)\n- 전기기능사 — 국가기술자격 (한국산업인력공단)\n- 분양대행자 — 부동산 분양 실무 자격 (주택·상가 분양 대행)\n상장·교육 기록 원본은 갤러리의 자격 섹션에서 확인할 수 있습니다.",
      primary: { label: "자격 · 상훈 갤러리", href: "gallery.html#credentials" },
      secondary: { label: "메인 자격 카드", href: "index.html#credentials" } },

    /* ---- 프로젝트 ---- */
    { id: "projects", cat: "프로젝트", tags: ["프로젝트", "작업", "artifact", "포트폴리오", "대표", "만든", "결과물", "산출물"],
      title: "대표 프로젝트 — 8 Editions",
      body: "직접 기획·제작한 콘텐츠와 시스템 8건입니다.\n- 01 6·3 지방선거 AI 카드뉴스 & 시네마틱 영상\n- 02 Veo 3 × Google Vids 르엘 성수 브랜드 필름\n- 03 Louis Vuitton 시네마틱 캠페인 필름\n- 04 Hyperframe × ElevenLabs 멀티미디어 프로모션\n- 05 [청약 인사이트 대시보드](https://cheongak-dashboard-opal.vercel.app) — Vercel 배포\n- 06 [VOC 트리아지 시스템](https://mail-dashboard-blue-six.vercel.app) — Vercel 배포\n- 07 네이버웍스 메일 연동 급여명세서 자동 발송 (사내 운영 · 비공개)\n- 08 누리장터 크롤링 정비사업 용역비 자동 수집 (사내 운영 · 비공개)",
      primary: { label: "작업 전체 보기", href: "index.html#artifacts" },
      secondary: { label: "대시보드 열기", href: "https://cheongak-dashboard-opal.vercel.app" } },
    { id: "ed-01", cat: "프로젝트", tags: ["지방선거", "카드뉴스", "선거", "인스타그램", "suno", "gpt image"],
      title: "Edition 01 — 6·3 지방선거 AI 카드뉴스 & 시네마틱 영상",
      body: "GPT Image-2, Suno AI, ElevenLabs를 결합해 2026 전국동시지방선거 결과를 분석·시각화한 인스타그램 카드뉴스 6종과 내레이션 영상. 사회학적 분석을 2030 세대의 소비 포맷으로 옮긴 생성형 AI 미디어 작업입니다.",
      primary: { label: "영상 바로 보기", href: "https://drive.google.com/file/d/1k4BcuFz671SajLydfRs5gMRFG2Hu3RWj/view?usp=sharing" },
      secondary: { label: "작업 카드", href: "index.html#ed-01" } },
    { id: "ed-02", cat: "프로젝트", tags: ["르엘", "성수", "브랜드 필름", "veo", "google vids", "주거"],
      title: "Edition 02 — Veo 3 × Google Vids 르엘 성수 브랜드 필름",
      body: "Google Vids의 Veo 3 모델로 주거 브랜드 '르엘 성수'의 공간 가치를 영상 언어로 구성한 브랜드 필름. 텍스트 프롬프트만으로 영상을 생성·편집해 부동산 영상 제작 과정을 간소화했습니다.",
      primary: { label: "홍보 영상 보기", href: "https://drive.google.com/file/d/1NQRlbAKrxlap8Nfdec3hAdx0pN3ewDhN/view?usp=sharing" },
      secondary: { label: "작업 카드", href: "index.html#ed-02" } },
    { id: "ed-03", cat: "프로젝트", tags: ["루이비통", "louis vuitton", "럭셔리", "캠페인", "시네마틱"],
      title: "Edition 03 — Louis Vuitton 시네마틱 캠페인 필름",
      body: "메종 루이비통의 헤리티지와 장인정신을 절제된 무드의 시네마틱 광고로 재해석한 브랜드 캠페인 필름. 텍스트 프롬프트 기반 생성형 AI만으로 럭셔리 광고 특유의 질감과 격조를 구현했습니다.",
      primary: { label: "캠페인 영상 보기", href: "https://drive.google.com/file/d/1mIEmvwjPfZwuXYZRkWW9FzZU3uvCUq69/view?usp=sharing" },
      secondary: { label: "작업 카드", href: "index.html#ed-03" } },
    { id: "ed-04", cat: "프로젝트", tags: ["hyperframe", "elevenlabs", "프로모션", "오디오", "멀티미디어"],
      title: "Edition 04 — Hyperframe × ElevenLabs 멀티미디어 프로모션",
      body: "복수의 생성형 AI 도구로 부동산 청약 데이터와 플랫폼 사용성을 대중이 이해하기 쉽게 구성한 영상·오디오 브랜딩 프로젝트입니다.",
      primary: { label: "프로모션 영상 보기", href: "https://drive.google.com/file/d/1F3PssuwdFkcWaiT6fZHgQlz44As0I2nq/view?usp=sharing" },
      secondary: { label: "작업 카드", href: "index.html#ed-04" } },
    { id: "ed-05", cat: "프로젝트", tags: ["청약", "대시보드", "공공데이터", "부동산", "시각화", "vercel"],
      title: "Edition 05 — 공공데이터 API 청약 인사이트 대시보드",
      body: "대한민국 부동산 청약 시장의 거시 데이터를 수집·시각화한 데이터 대시보드. 시장의 자금 흐름을 분석해 지표 중심의 화면으로 구성했으며 Vercel에 배포되어 있습니다. 분산된 공고를 표로 정리하던 일을 API 수집과 자동 갱신으로 바꾸었고, '어떤 지표를 나란히 놓아야 의미가 생기는지'는 사람이 정합니다.",
      primary: { label: "대시보드 바로가기", href: "https://cheongak-dashboard-opal.vercel.app" },
      secondary: { label: "작업 카드", href: "index.html#ed-05" } },
    { id: "ed-06", cat: "프로젝트", tags: ["voc", "트리아지", "triage", "gws", "workspace", "백오피스", "메일", "분류"],
      title: "Edition 06 — GWS 연동 VOC 트리아지 시스템",
      body: "Google Workspace API를 연동해 고객 피드백을 실시간 집계하고, 자체 분류 알고리즘으로 업무 우선순위를 자동화한 백오피스 대시보드. 담당자가 메일함을 직접 확인하던 일을 API 수집과 1차 선별로 대체했고, 무엇을 리스크로 볼지는 법무 감각으로 사람이 정합니다. Vercel 배포.",
      primary: { label: "시스템 바로가기", href: "https://mail-dashboard-blue-six.vercel.app" },
      secondary: { label: "작업 카드", href: "index.html#ed-06" } },
    { id: "ed-07", cat: "프로젝트", tags: ["네이버웍스", "naver works", "급여", "명세서", "자동 발송", "사내"],
      title: "Edition 07 — 네이버웍스 메일 연동 급여명세서 자동 발송",
      body: "네이버웍스(NAVER WORKS) 메일 API와 연동해 급여명세서의 생성과 발송을 자동화한 사내 업무 프로그램. 반복되던 발송 절차를 표준화해 처리 시간을 단축하고 오류 가능성을 줄였습니다. 사내 운영 · 비공개.",
      primary: { label: "작업 카드", href: "index.html#ed-07" },
      secondary: null },
    { id: "ed-08", cat: "프로젝트", tags: ["누리장터", "크롤링", "정비사업", "용역비", "입찰", "조합"],
      title: "Edition 08 — 누리장터 크롤링 정비사업 용역비 자동 수집",
      body: "정비사업 정보 플랫폼 '누리장터'에서 조합 대상 용역 입찰과 용역비 데이터를 자동 수집하는 크롤링 프로그램. 흩어진 공고를 정기 수집·정형화해 시장 단가 비교와 사업성 검토용 데이터셋을 구축했습니다. 사내 운영 · 비공개.",
      primary: { label: "작업 카드", href: "index.html#ed-08" },
      secondary: null },

    /* ---- 궤적 (최신순) ---- */
    { id: "trajectory", cat: "궤적", tags: ["경력", "이력", "타임라인", "교육", "궤적", "수상", "career", "연혁", "history", "최신순"],
      title: "걸어온 궤적 — 최신순",
      body: "- 2026 서초청년네트워크 9기 운영위원회 부위원장 (PRESENT)\n- 2026 청와대 대통령 주관 청년의날 행사 참석\n- 2026 국무조정실 온라인 청년참여단 활동\n- 2026 건국대학교 스마트건설기술교육 프로그램 이수\n- 2026 서울시민기자단 취재기자 · 서울청년파트너스 위원\n- 2026 서울특별시 핀테크 아카데미 14기\n- 2026 서울광역청년센터 나눔서포터즈 · CJ제일제당 나눔냉장고 운영\n- 2026 한국부동산마케팅협회(KREMA) AI 마케팅 기획자 양성 과정 4기 수료\n- 2026 서울대학교 AI 교육 전문가 과정(AIED) 4기 수료\n- 2025 삼성청년SW아카데미(SSAFY) 13기 이수\n- 2024 SSAFY 홍보 앰배서더\n- 2023 강원열린군대 스타트업 프로그램 2군단장상(2위)\n- 2023 육군정보통신학교장 상장 · 육군훈련소 최우수 분대\n- 2022 대구광역시교육청 · 독일 Vattenfall Berlin 해외 연수",
      primary: { label: "궤적 보기", href: "index.html#trajectory" },
      secondary: { label: "경력 상세", href: "career.html#experience" } },
    { id: "tl-seocho", cat: "궤적", tags: ["서초", "청년네트워크", "운영위원회", "부위원장", "거버넌스", "현재"],
      title: "2026 — 서초청년네트워크 9기 운영위원회 부위원장 (현재)",
      body: "서초구 청년 정책 거버넌스의 운영위원회 부위원장으로서 분과 의제 설정과 위원회 운영을 총괄하고, 현장의 목소리를 제도로 잇는 민관 협력을 주도하고 있습니다.",
      primary: { label: "궤적에서 보기", href: "index.html#tl-seocho" },
      secondary: null },
    { id: "tl-youth-day", cat: "궤적", tags: ["청와대", "대통령", "청년의날", "행사", "참석", "초청"],
      title: "2026 — 청와대 대통령 주관 청년의날 행사 참석",
      body: "대통령이 주관한 청년의날 기념행사에 청년 대표로 초청되어 참석했습니다. 청년 정책의 방향과 현장의 과제를 국정 최고 의사결정 단위에서 직접 청취하고 교류한 기록입니다.",
      primary: { label: "궤적에서 보기", href: "index.html#tl-youth-day" },
      secondary: { label: "경력 상세", href: "career.html#cv-youth-day" } },
    { id: "tl-youth-panel", cat: "궤적", tags: ["국무조정실", "청년참여단", "온라인", "정책 제안", "공론장"],
      title: "2026 — 국무조정실 온라인 청년참여단 활동",
      body: "국무조정실 온라인 청년참여단으로서 청년 정책 과제에 대한 의견 수렴과 정책 제안에 참여하며, 온라인 공론장을 통해 청년 세대의 목소리를 정부 정책 과정에 전달합니다.",
      primary: { label: "궤적에서 보기", href: "index.html#tl-youth-panel" },
      secondary: { label: "경력 상세", href: "career.html#cv-youth-panel" } },
    { id: "tl-konkuk", cat: "궤적", tags: ["건국대", "스마트건설", "bim", "드론", "건설"],
      title: "2026 — 건국대학교 스마트건설기술교육 프로그램 이수",
      body: "BIM 설계 데이터 해석과 드론 측량, 건설 자동화 워크플로우를 실습 중심으로 다루며 부동산·건설 도메인을 데이터의 언어로 읽어내는 융합적 관점을 정립했습니다.",
      primary: { label: "궤적에서 보기", href: "index.html#tl-konkuk" },
      secondary: { label: "경력 상세", href: "career.html#cv-konkuk" } },
    { id: "tl-press", cat: "궤적", tags: ["서울시민기자단", "취재기자", "서울청년파트너스", "시정", "기자"],
      title: "2026 — 서울시민기자단 취재기자 · 서울청년파트너스 위원",
      body: "공공 영역의 미디어 콘텐츠를 기획·편집하고 시정(市政) 현안을 분석해 정책 제안 과정에 참여합니다. 서울청년파트너스 위원으로 정책 제안 프로세스에도 참여했습니다.",
      primary: { label: "궤적에서 보기", href: "index.html#tl-seoul-press" },
      secondary: { label: "경력 상세", href: "career.html#cv-seoul-press" } },
    { id: "tl-fintech", cat: "궤적", tags: ["핀테크", "아카데미", "금융", "디지털 금융"],
      title: "2026 — 서울특별시 핀테크 아카데미 14기",
      body: "금융과 기술이 접합하는 지점에서 핀테크 산업 구조와 디지털 금융 서비스 설계 원리를 학습하고, 데이터 기반 금융 도메인으로 역량의 범위를 확장했습니다.",
      primary: { label: "궤적에서 보기", href: "index.html#tl-fintech" },
      secondary: null },
    { id: "tl-sharing", cat: "궤적", tags: ["나눔서포터즈", "나눔냉장고", "cj제일제당", "서울광역청년센터", "사회공헌", "봉사"],
      title: "2026 — 서울광역청년센터 나눔서포터즈 · CJ제일제당 나눔냉장고 운영",
      body: "CJ제일제당과 서울광역청년센터가 연계한 나눔냉장고 프로그램에서 월간 식품 나눔·제로웨이스트 캠페인을 현장 운영하며, 청년의 가치소비 실천을 지원하는 사회공헌 활동을 수행했습니다.",
      primary: { label: "경력 상세", href: "career.html#cv-sharing" },
      secondary: null },
    { id: "tl-krema", cat: "궤적", tags: ["krema", "한국부동산마케팅협회", "마케팅 기획자", "4기"],
      title: "2026 — KREMA AI 활용 마케팅 기획자 양성 과정 4기 수료",
      body: "AI 기반 부동산 시장 데이터 분석과 타겟 세그먼트 도출, 매체별 디지털 마케팅 전략 수립 및 자동화 솔루션 기획 역량을 체화했습니다.",
      primary: { label: "궤적에서 보기", href: "index.html#tl-krema" },
      secondary: { label: "경력 상세", href: "career.html#cv-krema" } },
    { id: "tl-aied", cat: "궤적", tags: ["서울대", "aied", "ai 교육 전문가", "프롬프트"],
      title: "2026 — 서울대학교 AI 교육 전문가 과정(AIED) 4기 수료",
      body: "인공지능 메커니즘의 비즈니스 도메인 최적화 적용, 구조화된 프롬프트 엔지니어링 아키텍처의 이해와 교수법을 체화했습니다.",
      primary: { label: "궤적에서 보기", href: "index.html#tl-snu-aied" },
      secondary: { label: "경력 상세", href: "career.html#cv-snu-aied" } },
    { id: "tl-ssafy", cat: "궤적", tags: ["ssafy", "삼성청년sw아카데미", "13기", "삼성", "앰배서더"],
      title: "2025 — 삼성청년SW아카데미(SSAFY) 13기 이수 · 2024 홍보 앰배서더",
      body: "소프트웨어 아키텍처와 인공지능 알고리즘을 실무 프로젝트 중심으로 학습해 엔지니어링 역량을 내재화했습니다(13기 이수). 2024년에는 SSAFY 공식 홍보 앰배서더로 교육 과정과 성과를 콘텐츠로 알렸습니다. 프로젝트 발표·코드 리뷰·기업탐방 사진이 갤러리에 있습니다.",
      primary: { label: "SSAFY 갤러리", href: "gallery.html#g-ssafy-presentation" },
      secondary: { label: "궤적에서 보기", href: "index.html#tl-ssafy" } },
    { id: "tl-army-startup", cat: "궤적", tags: ["육군창업경진대회", "강원열린군대", "스타트업", "2군단장", "hvac", "창업", "home_ally"],
      title: "2023 — 강원열린군대 스타트업 프로그램 2군단장상 (2위)",
      body: "軍·官·學이 주관한 2023년 강원열린군대 스타트업 프로그램 성취도평가에서 팀 Home_Ally로 2위에 입상해 제2군단장(중장) 상장을 받았습니다. HVAC 기술 기반 리스크 관리 아이디어와 비즈니스 모델의 타당성을 공식 심사에서 검증한 기록입니다.",
      primary: { label: "상장 원본 보기", href: "gallery.html#cred-award-2023" },
      secondary: { label: "궤적에서 보기", href: "index.html#tl-army-startup" } },
    { id: "tl-army", cat: "궤적", tags: ["육군", "군 복무", "정보통신학교", "훈련소", "최우수 분대", "상장", "군대"],
      title: "2022–2023 — 육군 표창 기록",
      body: "- 육군정보통신학교장(준장) 상장 — 軍 특성화고 현장실습 기간 학업성적 우수 · 희생정신 (2022. 7. 1, 제183호)\n- 육군훈련소 최우수 분대 선정 · 훈련소장(소장) 상장 (2023)\n상장 원본은 갤러리 자격 섹션에 있습니다.",
      primary: { label: "상장 원본 보기", href: "gallery.html#cred-award-2022" },
      secondary: { label: "궤적에서 보기", href: "index.html#tl-army-signal" } },
    { id: "tl-vattenfall", cat: "궤적", tags: ["vattenfall", "독일", "베를린", "해외 연수", "대구광역시교육청", "일마이스터고"],
      title: "2022 — 대구광역시교육청 · 독일 Vattenfall Berlin 해외 연수",
      body: "대구일마이스터고등학교 재학 중 대구광역시교육청 해외 연수로 독일 베를린 Vattenfall을 방문해 유럽 선진 기업의 에너지·인프라 운영 체계와 국제 실무 표준을 조기에 접했습니다.",
      primary: { label: "궤적에서 보기", href: "index.html#tl-vattenfall" },
      secondary: { label: "경력 상세", href: "career.html#cv-vattenfall" } },

    /* ---- 미디어 · 갤러리 ---- */
    { id: "media", cat: "미디어", tags: ["미디어", "방송", "인터뷰", "연합뉴스", "언론", "tv", "강남1인가구센터"],
      title: "미디어 — 연합뉴스TV 인터뷰",
      body: "연합뉴스TV 〈함께 빚어낸 특별한 밥상〉에 강남1인가구센터 관련 인터뷰로 출연했습니다.",
      primary: { label: "인터뷰 장면 보기", href: "gallery.html#g-yonhap" },
      secondary: { label: "미디어 섹션", href: "career.html#media" } },
    { id: "gallery", cat: "미디어", tags: ["갤러리", "사진", "아카이브", "활동", "기록", "프로필 사진"],
      title: "활동 갤러리",
      body: "연합뉴스TV 인터뷰, SSAFY 13기 프로젝트 발표·코드 리뷰·세미나·단체 사진, 공식 프로필과 포트레이트, 그리고 자격·교육·상훈 섹션(상장 원본 · SSAFY 기업탐방 · 멘토 특강)을 갤러리에 정리했습니다.",
      primary: { label: "갤러리 열기", href: "gallery.html#archive" },
      secondary: { label: "자격 · 상훈", href: "gallery.html#credentials" } },

    /* ---- 연락 · 협업 ---- */
    { id: "contact", cat: "연락", tags: ["연락", "이메일", "협업", "채용", "contact", "제안", "문의", "메일", "recruiter", "연락처"],
      title: "연락 · 협업",
      body: "협업 · 채용 · 프로젝트 문의는 이메일로 받습니다.\n- 개인: [" + EMAIL + "](mailto:" + EMAIL + ")\n- 사무실: [" + EMAIL_OFFICE + "](mailto:" + EMAIL_OFFICE + ")\n새로운 협업과 프로젝트, Recruiter 분들을 환영합니다. 챗봇에서 '무료 상담 신청'을 누르면 상담 내용을 정리해 바로 전달할 수 있습니다.",
      primary: { label: "연락 섹션", href: "index.html#contact" },
      secondary: { label: "이메일 보내기", href: "mailto:" + EMAIL } },
    { id: "ledger", cat: "인물", tags: ["숫자", "한눈에", "몇", "개수", "통계", "ledger"],
      title: "한눈에 보는 기록 (The Ledger)",
      body: "- 수행 프로젝트 8\n- 전문 교육 이수 4\n- 수상 · 표창 3\n- 방송 인터뷰 1",
      primary: { label: "작업 보기", href: "index.html#artifacts" },
      secondary: null },
  ];

  /* ------------------------------------------------- 서비스 카탈로그 (3안) */
  var SERVICES = [
    { id: "svc-ai-process", n: "A", name: "AI 프로세스 혁신 진단", tagline: "송무·사무 워크플로우를 진단하고 AI 자동화로 다시 설계",
      for: "법무법인 · 전문직 사무소 · 백오피스 팀",
      deliverables: ["업무 흐름 진단 리포트", "자동화 우선순위 맵", "파일럿(예: VOC 트리아지 · 메일 자동 발송) 설계"],
      proof: ["ed-06", "ed-07", "ed-08"],
      cta: { label: "관련 업무 영역", href: "career.html#practice-ai" } },
    { id: "svc-brand-film", n: "B", name: "AI 브랜드 필름 · 캠페인 콘텐츠", tagline: "Veo 3 · ElevenLabs · Suno 기반 시네마틱 필름과 카드뉴스",
      for: "부동산 · 럭셔리 · 공공 캠페인 담당자",
      deliverables: ["브랜드 필름 1편(프롬프트 아키텍처 포함)", "카드뉴스 세트", "내레이션·사운드 브랜딩"],
      proof: ["ed-01", "ed-02", "ed-03", "ed-04"],
      cta: { label: "브랜드 필름 보기", href: "index.html#ed-02" } },
    { id: "svc-dashboard", n: "C", name: "데이터 대시보드 구축", tagline: "공공데이터·업무 데이터를 의사결정 가능한 화면으로",
      for: "부동산 · 정비사업 · 마케팅 데이터 팀",
      deliverables: ["데이터 수집 파이프라인(API · 크롤링)", "지표 설계", "Vercel 배포 대시보드"],
      proof: ["ed-05", "ed-08"],
      cta: { label: "대시보드 사례", href: "https://cheongak-dashboard-opal.vercel.app" } },
  ];

  /* --------------------------------------------- 무료상담 스크립트 (단계) */
  var CONSULT = {
    trigger: ["상담", "견적", "의뢰", "제안", "채용", "협업", "문의", "미팅", "연락", "함께", "가능한가요", "consult", "hire"],
    steps: [
      { key: "need", ask: "어떤 과제를 함께 풀고 싶으신가요? (예: 업무 자동화 · 브랜드 필름 · 데이터 대시보드 · 채용 제안)" },
      { key: "context", ask: "조직과 현재 상황을 한 줄로 알려주시면 더 정확히 안내드릴 수 있습니다." },
      { key: "contact", ask: "회신받으실 이메일(또는 연락처)을 남겨주세요. 김유빈 님이 직접 답변드립니다." },
    ],
    closing: "정리한 내용을 김유빈 님께 전달했습니다. 보통 영업일 기준 1–2일 내 회신드립니다.",
    fallbackClosing: "서버 전송이 어려워 이메일 작성 화면으로 연결했습니다. 정리된 상담 내용이 그대로 담겨 있으니 '보내기'만 누르시면 됩니다.",
  };

  var SUGGESTIONS = [
    { label: "핵심 역량 요약", query: "김유빈 님의 핵심 역량을 한눈에 요약해 주세요." },
    { label: "대표 프로젝트 3선", query: "가장 대표적인 프로젝트 3가지를 링크와 함께 소개해 주세요." },
    { label: "경력·이력 타임라인", query: "지금까지의 경력과 교육 이력을 최신순으로 정리해 주세요." },
    { label: "자격 · 상훈", query: "보유 자격과 수상 기록을 알려 주세요." },
    { label: "무료 상담 신청", query: "__consult__" },
  ];

  return {
    version: "2026.09.14",
    site: SITE, email: EMAIL, emailOffice: EMAIL_OFFICE,
    cards: CARDS, services: SERVICES, consult: CONSULT, suggestions: SUGGESTIONS,
    /* 시스템 프롬프트용 지식 직렬화 (서버·프론트 공용) */
    toKnowledge: function () {
      var k = CARDS.map(function (c) {
        var links = [];
        if (c.primary) links.push(c.primary.label + " → " + (/^https?:|^mailto:/.test(c.primary.href) ? c.primary.href : SITE + c.primary.href));
        if (c.secondary) links.push(c.secondary.label + " → " + (/^https?:|^mailto:/.test(c.secondary.href) ? c.secondary.href : SITE + c.secondary.href));
        return "### " + c.title + " [" + c.cat + "]\n" + c.body + (links.length ? "\n(링크: " + links.join(" · ") + ")" : "");
      });
      k.push("### 서비스 카탈로그\n" + SERVICES.map(function (s) {
        return "- " + s.n + ". " + s.name + " — " + s.tagline + " (대상: " + s.for + "; 산출물: " + s.deliverables.join(", ") + ")";
      }).join("\n"));
      return k.join("\n\n");
    },
  };
});
