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
      body: "김유빈(Yubin Kim, 별칭 Ethan Kim) · 2004년생. 법무법인 경국에서 전략기획과 AI 프로세스 혁신을 담당합니다. 근무지는 서울 서초구 서초대로 264 법조타워 15F.\n일의 방식은 한 문장입니다 — **데이터로 판단의 근거를 만들고, AI로 실행의 속도를 만듭니다.** 흩어진 시장·업무 데이터를 모아 무엇을 먼저 할지 정하고, 그 결정을 자동화와 콘텐츠로 실행에 옮기며, 실무에서 만든 시스템을 강의 모듈로도 옮깁니다.",
      primary: { label: "선언 보기", href: "index.html#manifesto" },
      secondary: { label: "경력 상세", href: "career.html#experience" } },
    { id: "thesis", cat: "인물", tags: ["철학", "명제", "왜", "전달", "전문성", "자리", "가치관"],
      title: "일의 명제 — 전략은 우선순위, AI는 속도",
      body: "\"전략은 무엇을 먼저 할지 정하는 일이고, AI는 그 결정을 빨리 실행하는 도구입니다.\" 세 개의 시스템(VOC 트리아지 · 청약 대시보드 · 브랜드 캠페인 필름)에서 사람이 하던 일이 도구로 넘어갈 때마다 사람이 남아야 할 자리가 또렷해졌고, 그 자리는 언제나 '도구에 무엇을 시킬지 정하는 일' — 곧 전략기획이었습니다.",
      primary: { label: "Why It Matters", href: "index.html#composite" },
      secondary: { label: "강의 프로그램", href: "index.html#lectures" } },
    { id: "office", cat: "인물", tags: ["법무법인", "경국", "직장", "회사", "소속", "근무", "근무지", "어디", "사무실", "위치", "서초", "주소"],
      title: "소속 — 법무법인 경국",
      body: "법무법인 경국(서울 서초구 서초대로 264 법조타워 15F) 사원. 업무 영역은 네 가지입니다.\n- 전략기획 · 사업성 검토 — 시장 단가 비교와 우선순위 설계\n- AI 프로세스 혁신 — 송무·사무 워크플로우 자동화\n- 마케팅 기획 · 브랜드 필름\n- 데이터 인프라 · 대시보드",
      primary: { label: "업무 영역", href: "career.html#practice" },
      secondary: { label: "소개 섹션", href: "index.html#about" } },

    /* ---- 융합 역량 ---- */
    { id: "composite", cat: "역량", tags: ["역량", "강점", "융합", "핵심", "composite", "무엇", "잘", "여섯", "도메인"],
      title: "융합 역량 — 전략기획을 중심에 둔 여섯 도메인",
      body: "전략기획을 축에 두고 나머지가 실행과 전달을 맡습니다.\n- 01 전략기획 — 사업성 검토, 우선순위 설계\n- 02 AI 프로세스 자동화 — SSAFY 13기, 서울대 AIED 4기\n- 03 데이터 · 인프라 — 공공데이터 API, GWS 연동\n- 04 마케팅 · 커뮤니케이션 — KREMA 4기, 연합뉴스TV, 서울시민기자단\n- 05 교육 · 강의 — 서울대 AIED 교수법, SSAFY 홍보 앰배서더\n- 06 도메인 — 법무법인 경국, 스마트건설, 청년 정책 거버넌스",
      primary: { label: "융합 역량 보기", href: "index.html#composite" },
      secondary: { label: "실무 도구", href: "index.html#arsenal" } },
    { id: "dom-strategy", cat: "역량", tags: ["전략", "전략기획", "기획", "사업성", "우선순위", "의사결정", "strategy", "planning"],
      title: "01 전략기획",
      body: "흩어진 시장·업무 데이터를 모아 무엇을 먼저 할지 정하는 일입니다. 누리장터에서 정비사업 용역 입찰과 용역비를 자동 수집해 시장 단가 비교와 사업성 검토의 기준선을 만들었고, VOC 트리아지에서는 무엇을 리스크로 볼지의 판단 기준을 설계했습니다. 도구가 아니라 우선순위가 결과를 바꾼다는 것이 그의 전제입니다.",
      primary: { label: "역량 01", href: "index.html#dom-01" },
      secondary: { label: "전략기획 업무 영역", href: "career.html#practice-strategy" } },
    { id: "dom-ai", cat: "역량", tags: ["ai", "인공지능", "자동화", "생성형", "프롬프트", "개발", "엔지니어링"],
      title: "02 AI 프로세스 자동화",
      body: "사람이 반복하던 판단의 앞단을 AI에 맡기고, 사람은 기준을 정하는 자리에 남깁니다. 삼성청년SW아카데미(SSAFY) 13기와 서울대 AI 교육 전문가 과정(AIED) 4기에서 구조를 익혔고, React · Vercel 배포까지 직접 수행합니다.",
      primary: { label: "역량 02", href: "index.html#dom-02" },
      secondary: { label: "AI 프로세스 혁신", href: "career.html#practice-ai" } },
    { id: "dom-data", cat: "역량", tags: ["데이터", "인프라", "대시보드", "공공데이터", "api", "gws", "시각화"],
      title: "03 데이터 · 인프라",
      body: "공공데이터 API와 Google Workspace API를 의사결정 가능한 화면으로 번역합니다. 청약 인사이트 대시보드와 VOC 트리아지 시스템을 직접 구축·배포했습니다.",
      primary: { label: "역량 03", href: "index.html#dom-03" },
      secondary: { label: "대시보드 열기", href: "https://cheongak-dashboard-opal.vercel.app" } },
    { id: "dom-marketing", cat: "역량", tags: ["마케팅", "커뮤니케이션", "세그먼트", "캠페인", "매체", "미디어", "홍보", "기자"],
      title: "04 마케팅 · 커뮤니케이션",
      body: "KREMA(한국부동산마케팅협회) 4기의 데이터 기반 세그먼트 전략과 생성형 AI 제작 역량으로 전략을 시장에 닿는 언어로 옮깁니다. 서울시민기자단 취재기자 활동과 연합뉴스TV 인터뷰로 공공 영역의 전달 경험도 쌓았습니다.",
      primary: { label: "역량 04", href: "index.html#dom-04" },
      secondary: { label: "브랜드 필름 보기", href: "index.html#ed-02" } },
    { id: "dom-teaching", cat: "역량", tags: ["교육", "강의", "강사", "교수법", "워크숍", "teaching", "lecture", "수업"],
      title: "05 교육 · 강의",
      body: "서울대 AIED 4기에서 프롬프트 아키텍처와 교수법을 체화하고, 실무에서 만든 시스템을 강의 모듈로 옮깁니다. SSAFY 13기 이수와 공식 홍보 앰배서더 활동으로 지원자 대상 커뮤니케이션도 수행했습니다. 2개 트랙 8과정을 운영합니다 — AI 기초 개념, 프롬프트 엔지니어링, 바이브 코딩, 하네스 엔지니어링, 그리고 도메인 적용 네 과정.",
      primary: { label: "강의 프로그램", href: "index.html#lectures" },
      secondary: { label: "강의 역량 상세", href: "career.html#lectures" } },
    { id: "dom-domain", cat: "역량", tags: ["도메인", "법무", "송무", "법률", "부동산", "공공", "건설", "bim", "정책"],
      title: "06 도메인 — 법무 · 부동산 · 공공",
      body: "판단의 바탕이 되는 세 영역입니다.\n- 법무 — 법무법인 경국 송무·사무 실무의 정확성\n- 부동산 · 건설 — 건국대 스마트건설(BIM · 드론 측량), 분양대행자 자격\n- 공공 — 서초청년네트워크 운영위 부위원장, 국무조정실 온라인 청년참여단\n법률·세무 판단 자체는 전문가 상담이 필요합니다.",
      primary: { label: "역량 06", href: "index.html#dom-06" },
      secondary: { label: "궤적 보기", href: "index.html#trajectory" } },
    { id: "arsenal", cat: "역량", tags: ["도구", "스택", "기술", "arsenal", "툴", "프로그램", "소프트웨어"],
      title: "실무 도구 (The Arsenal)",
      body: "- 생성형 AI: GPT Image-2, Suno AI, ElevenLabs, Veo 3, Google Vids, Hyperframe\n- 데이터 · 개발: 공공데이터 API, GWS API, React, Vercel, Prompt Architecture\n- 도메인: BIM · 드론 측량, 송무 프로세스, 청약 · 부동산 데이터",
      primary: { label: "도구 목록", href: "index.html#arsenal" },
      secondary: null },
    { id: "creds", cat: "자격", tags: ["자격", "자격증", "증명", "credential", "tesat", "opic", "전기기능사", "분양대행자", "영어", "경제", "수상", "상훈", "수상 경력", "보유 자격"],
      title: "보유 자격 (The Credentials)",
      body: "- TESAT — 경제이해력검증시험 (한국경제신문 주관)\n- OPIc IH — 영어 말하기 Intermediate High (ACTFL 공인 등급)\n- 전기기능사 — 국가기술자격 (한국산업인력공단)\n- 분양대행자 — 부동산 분양 실무 자격 (주택·상가 분양 대행)\n상장·교육 기록 원본은 갤러리의 자격 섹션에서 확인할 수 있습니다.",
      primary: { label: "자격 · 상훈 갤러리", href: "gallery.html#credentials" },
      secondary: { label: "메인 자격 카드", href: "index.html#credentials" } },

    /* ---- 강의 ---- */
    { id: "lectures", cat: "강의", tags: ["강의", "강사", "교육", "워크숍", "세미나", "특강", "수업", "커리큘럼", "출강", "lecture", "teaching", "training"],
      title: "강의 프로그램 — 2개 트랙 8과정",
      body: "\"만들어 본 사람만 가르칠 수 있는 것이 있습니다.\" SSAFY 13기의 엔지니어링 훈련, 서울대 AIED 4기의 프롬프트 아키텍처·교수법, KREMA 4기의 시장 데이터 전략을 실제로 만들어 운영한 뒤 강의 모듈로 옮겼습니다.\n**Track A — AI 파운데이션**\n- 01 AI 기초 개념 — 무엇이 되고 무엇이 안 되는가 (2시간)\n- 02 프롬프트 엔지니어링 — 문장이 아니라 구조로 (3시간)\n- 03 바이브 코딩 — 코드를 몰라도 만들고 배포하기 (4시간)\n- 04 하네스 엔지니어링 — 에이전트에 손과 발을 달기 (4시간)\n**Track B — 도메인 적용**\n- 05 실무자를 위한 전략기획 AI (3–6시간)\n- 06 공공데이터로 시장을 읽는 법 (4시간)\n- 07 생성형 AI 브랜드 필름 제작 (3시간)\n- 08 제도의 언어를 대중의 언어로 (2시간)\n강의 문의는 [" + EMAIL_OFFICE + "](mailto:" + EMAIL_OFFICE + ") 로 받습니다.",
      primary: { label: "강의 프로그램 보기", href: "index.html#lectures" },
      secondary: { label: "과정별 상세 페이지", href: "lecture.html" } },
    { id: "lec-01", cat: "강의", tags: ["ai 기초", "ai 기초 개념", "기초 개념", "입문", "환각", "맥락창", "토큰", "도입 검토"],
      title: "강의 01 — AI 기초 개념: 무엇이 되고 무엇이 안 되는가",
      body: "모델이 어떻게 답을 만드는지 알면 어디까지 맡길지 판단할 수 있습니다.\n- 토큰·맥락창·환각이 생기는 자리\n- 생성형 AI가 잘하는 일과 못하는 일의 경계\n- 업무에 붙일 때의 검수 기준\n대상은 전 직군 입문자와 도입을 검토하는 관리자, 2시간 구성입니다. 근거는 서울대 AI 교육 전문가 과정(AIED) 4기입니다.",
      primary: { label: "과정 상세", href: "lecture.html#lec-01" },
      secondary: { label: "서울대 AIED 기록", href: "career.html#cv-snu-aied" } },
    { id: "lec-02", cat: "강의", tags: ["프롬프트", "프롬프트 엔지니어링", "prompt engineering", "prompt", "템플릿", "구조화", "프롬프트 아키텍처"],
      title: "강의 02 — 프롬프트 엔지니어링: 문장이 아니라 구조로",
      body: "좋은 프롬프트는 잘 쓴 문장이 아니라 잘 설계된 구조입니다.\n- 역할·제약·예시·출력형식의 네 기둥\n- 재사용 가능한 프롬프트 템플릿 설계\n- 평가와 개선 루프 만들기\n대상은 기획·마케팅·사무 실무자, 3시간 실습 포함입니다. 근거는 서울대 AIED 4기의 구조화된 프롬프트 아키텍처입니다.",
      primary: { label: "과정 상세", href: "lecture.html#lec-02" },
      secondary: { label: "브랜드 필름 적용 사례", href: "index.html#ed-02" } },
    { id: "lec-03", cat: "강의", tags: ["바이브 코딩", "바이브코딩", "vibe coding", "비개발", "노코드", "사내 도구", "직접 만들", "배포", "vercel"],
      title: "강의 03 — 바이브 코딩: 코드를 몰라도 만들고 배포하기",
      body: "아이디어에서 배포까지, AI와 대화하며 실제 도구를 완성하는 과정입니다.\n- 요구사항을 AI가 이해하는 단위로 쪼개기\n- 고쳐가며 만드는 반복 루프와 검증\n- Vercel 배포와 운영 감각\n대상은 비개발 직군과 사내 도구를 직접 만들고 싶은 실무자, 4시간 제작 실습입니다. 근거는 SSAFY 13기의 소프트웨어 아키텍처 실무 프로젝트입니다.",
      primary: { label: "과정 상세", href: "lecture.html#lec-03" },
      secondary: { label: "직접 배포한 대시보드", href: "index.html#ed-05" } },
    { id: "lec-04", cat: "강의", tags: ["하네스", "하네스 엔지니어링", "harness", "에이전트", "agent", "도구 연결", "권한 경계", "자동화 설계", "폴백"],
      title: "강의 04 — 하네스 엔지니어링: 에이전트에 손과 발을 달기",
      body: "모델 자체보다, 모델에 무엇을 쥐여주느냐가 결과를 가릅니다.\n- 도구 연결과 권한 경계 설계\n- 맥락 주입과 실패 시 폴백 설계\n- 사람이 승인해야 할 지점 정하기\n대상은 사내 자동화를 설계하는 실무자와 개발 인접 직군, 4시간 구성입니다. 근거는 GWS·NAVER WORKS API 연동과 크롤링 파이프라인 구축 경험입니다.",
      primary: { label: "과정 상세", href: "lecture.html#lec-04" },
      secondary: { label: "VOC 트리아지 시스템", href: "index.html#ed-06" } },
    { id: "lec-05", cat: "강의", tags: ["전략기획 강의", "자동화 강의", "업무 진단", "우선순위", "백오피스", "실무자"],
      title: "강의 05 — 실무자를 위한 전략기획 AI",
      body: "반복 업무를 진단하고 무엇을 자동화할지 정하는 기준을 세웁니다.\n- 업무 흐름 진단과 병목 찾기\n- 자동화 우선순위 매트릭스\n- 사람이 남아야 할 판단의 자리\n대상은 백오피스·기획·전문직 사무소 실무자이고 3시간 또는 실습 포함 6시간입니다. 근거는 법무법인 경국의 송무·사무 프로세스 혁신 실무입니다.",
      primary: { label: "과정 상세", href: "lecture.html#lec-05" },
      secondary: { label: "VOC 트리아지 사례", href: "index.html#ed-06" } },
    { id: "lec-06", cat: "강의", tags: ["공공데이터로 시장", "데이터 강의", "공공데이터 강의", "대시보드 실습", "지표 설계", "부동산 데이터"],
      title: "강의 06 — 공공데이터로 시장을 읽는 법",
      body: "공개된 데이터를 의사결정이 가능한 화면으로 바꾸는 과정을 처음부터 끝까지 다룹니다.\n- 공공데이터 API 수집 설계\n- 나란히 놓아야 의미가 생기는 지표\n- 배포와 갱신 자동화\n대상은 부동산·마케팅·정비사업 데이터 담당자, 4시간 대시보드 실습입니다. 근거는 KREMA 4기의 AI 기반 부동산 시장 데이터 분석입니다.",
      primary: { label: "과정 상세", href: "lecture.html#lec-06" },
      secondary: { label: "청약 대시보드 사례", href: "index.html#ed-05" } },
    { id: "lec-07", cat: "강의", tags: ["브랜드 필름 제작", "브랜드 필름 강의", "생성형 ai 강의", "veo", "영상 제작", "마케팅 강의"],
      title: "강의 07 — 생성형 AI 브랜드 필름 제작",
      body: "프롬프트 구조로 영상을 만들고, 톤을 지키는 판단은 사람이 합니다.\n- 영상 프롬프트 아키텍처\n- 영상·내레이션·사운드 결합\n- 브랜드 톤 검수 기준\n대상은 마케팅·홍보·브랜드 담당자, 3시간 제작 실습입니다. 근거는 KREMA 4기의 매체별 디지털 마케팅 전략입니다.",
      primary: { label: "과정 상세", href: "lecture.html#lec-07" },
      secondary: { label: "르엘 성수 필름", href: "index.html#ed-02" } },
    { id: "lec-08", cat: "강의", tags: ["커뮤니케이션 강의", "공공 강의", "정책", "카드뉴스", "청년", "협회"],
      title: "강의 08 — 제도의 언어를 대중의 언어로",
      body: "전문적인 내용이 닿지 않으면 없는 것과 같습니다. 전달의 문법을 다룹니다.\n- 대상에 맞춘 메시지 재구성\n- 카드뉴스·영상 포맷 설계\n- 정책 제안으로 잇는 커뮤니케이션\n대상은 공공기관·청년 조직·협회, 2시간 구성입니다. 근거는 서울시민기자단과 연합뉴스TV, 청년 정책 거버넌스 경험입니다.",
      primary: { label: "과정 상세", href: "lecture.html#lec-08" },
      secondary: { label: "지방선거 카드뉴스", href: "index.html#ed-01" } },
    { id: "lec-basis", cat: "강의", tags: ["강의 자격", "강사 자격", "무엇을 근거로", "근거", "교수법", "왜 강의", "자격이 있"],
      title: "무엇을 근거로 가르치는가",
      body: "- 삼성청년SW아카데미 13기 — 소프트웨어 아키텍처와 AI 알고리즘을 실무 프로젝트로 학습. 공식 홍보 앰배서더로 지원자 대상 커뮤니케이션도 수행\n- 서울대학교 AIED 4기 — AI 교육 전문가 과정에서 구조화된 프롬프트 아키텍처와 교수법을 체화\n- 한국부동산마케팅협회 4기 — AI 기반 시장 데이터 분석과 세그먼트 도출, 매체별 전략 수립\n- 배포된 결과물 8건 — 강의 사례는 전부 직접 만들어 운영 중인 산출물이며 시연 가능한 화면으로 수업합니다",
      primary: { label: "가르치는 근거", href: "lecture.html#basis" },
      secondary: { label: "서울대 AIED 기록", href: "career.html#cv-snu-aied" } },

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
    { id: "tl-army-startup", cat: "궤적", tags: ["육군창업경진대회", "강원열린군대", "스타트업", "2군단장", "수상", "상장", "입상", "hvac", "창업", "home_ally"],
      title: "2023 — 강원열린군대 스타트업 프로그램 2군단장상 (2위)",
      body: "軍·官·學이 주관한 2023년 강원열린군대 스타트업 프로그램 성취도평가에서 팀 Home_Ally로 2위에 입상해 제2군단장(중장) 상장을 받았습니다. HVAC 기술 기반 리스크 관리 아이디어와 비즈니스 모델의 타당성을 공식 심사에서 검증한 기록입니다.",
      primary: { label: "상장 원본 보기", href: "gallery.html#cred-award-2023" },
      secondary: { label: "궤적에서 보기", href: "index.html#tl-army-startup" } },
    { id: "tl-army", cat: "궤적", tags: ["육군", "군 복무", "정보통신학교", "훈련소", "최우수 분대", "수상", "상장", "표창", "군대"],
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
    { id: "svc-strategy", n: "A", name: "전략기획 · AI 프로세스 진단", tagline: "업무와 시장 데이터를 근거로 무엇을 먼저 할지 정하고 자동화로 설계",
      for: "법무법인 · 전문직 사무소 · 백오피스 · 기획 팀",
      deliverables: ["업무 흐름 진단 리포트", "자동화 우선순위 매트릭스", "파일럿(예: VOC 트리아지 · 메일 자동 발송) 설계"],
      proof: ["ed-06", "ed-07", "ed-08"],
      cta: { label: "전략기획 업무 영역", href: "career.html#practice-strategy" } },
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
    { id: "svc-lecture", n: "D", name: "전략기획 AI 강의 · 워크숍", tagline: "AI 기초·프롬프트·바이브 코딩·하네스부터 도메인 적용까지 8과정",
      for: "기업 교육 담당자 · 공공기관 · 협회 · 청년 조직",
      deliverables: ["2–6시간 커리큘럼 설계(트랙 A 파운데이션 · 트랙 B 도메인 적용)", "실습 자료와 시연 가능한 사례 화면", "조직 맞춤 사후 과제"],
      proof: ["lec-01", "lec-02", "lec-03", "lec-04", "lec-05", "lec-06", "lec-07", "lec-08"],
      cta: { label: "강의 프로그램", href: "index.html#lectures" } },
  ];

  /* ------------------------------------------------- 로컬 검색(랭킹) 엔진 */
  /* 챗봇 폴백 답변과 서버 답변이 같은 기준으로 카드를 고르도록 여기 한 곳에만 둡니다.
   * 원칙 1. 긴 태그 = 구체적인 태그 → 가중치를 더 준다 ("바이브 코딩" > "교육")
   * 원칙 2. 질문의 의도(강의를 찾는지, 경력을 찾는지)와 카드 분류가 맞으면 가산점
   * 원칙 3. 동점이면 더 긴 태그가 맞은 카드를 앞에 둔다 */
  var INTENTS = [
    { cat: "강의", re: /(강의|특강|워크숍|워크샵|커리큘럼|수업|출강|강사|세미나|교육|클래스|수강|배우)/ },
    { cat: "프로젝트", re: /(프로젝트|사례|포트폴리오|만든|만들|제작|구축|결과물|산출물)/ },
    { cat: "자격", re: /(자격증|자격|수상|상훈|표창|인증|어워드)/ },
    { cat: "궤적", re: /(경력|이력|타임라인|연혁|커리어|수료|이수|재직|학력)/ },
    { cat: "연락", re: /(연락|문의|이메일|메일|컨택|채용|협업|상담|견적)/ },
    { cat: "미디어", re: /(방송|언론|보도|인터뷰|뉴스|출연|사진|갤러리)/ },
    { cat: "역량", re: /(역량|강점|잘하|전문성|스킬|능력)/ },
  ];

  function rank(query, cards) {
    var q = String(query || "").toLowerCase();
    var list = (cards && cards.length) ? cards : CARDS;
    var bonus = {};
    INTENTS.forEach(function (it) { if (it.re.test(q)) bonus[it.cat] = 4; });

    return list.map(function (c, idx) {
      var s = 0, longest = 0;
      (c.tags || []).forEach(function (t) {
        t = String(t).toLowerCase();
        if (!t || q.indexOf(t) === -1) return;
        s += 2 + Math.min(t.length, 12);
        if (t.length > longest) longest = t.length;
      });
      var title = String(c.title || "").toLowerCase();
      if (title && q.indexOf(title) > -1) s += 6;
      else {
        var tok = 0;
        title.split(/[^0-9a-z가-힣]+/).forEach(function (w) {
          if (w.length >= 2 && q.indexOf(w) > -1) tok += 2;
        });
        s += Math.min(tok, 6);
      }
      if (s > 0 && bonus[c.cat]) s += bonus[c.cat];
      return { c: c, s: s, l: longest, i: idx };
    }).sort(function (a, b) { return (b.s - a.s) || (b.l - a.l) || (a.i - b.i); });
  }

  /* --------------------------------------------- 무료상담 스크립트 (단계) */
  var CONSULT = {
    trigger: ["상담", "견적", "의뢰", "제안", "채용", "협업", "문의", "미팅", "연락", "함께", "가능한가요", "강의", "특강", "워크숍", "출강", "consult", "hire"],
    steps: [
      { key: "need", ask: "어떤 과제를 함께 풀고 싶으신가요? (예: 전략기획·업무 자동화 · 데이터 대시보드 · 브랜드 필름 · 강의/특강 · 채용 제안)" },
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
    { label: "강의 프로그램", query: "어떤 강의를 하실 수 있나요? 커리큘럼과 대상을 알려 주세요." },
    { label: "자격 · 상훈", query: "보유 자격과 수상 기록을 알려 주세요." },
    { label: "무료 상담 신청", query: "__consult__" },
  ];

  return {
    version: "2026.09.15d",
    site: SITE, email: EMAIL, emailOffice: EMAIL_OFFICE,
    cards: CARDS, services: SERVICES, consult: CONSULT, suggestions: SUGGESTIONS,
    rank: rank,
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
