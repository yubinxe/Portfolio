/* sections.jsx — all portfolio sections → window */

/* ---------- scroll reveal hook ---------- */
/* ============================================================ 반응형 이미지
 * AVIF → WebP → 원본 JPEG 순으로 브라우저가 고른다. 3배율 폰에서도 원본 대신 AVIF 가 선택된다.
 * 폭 목록은 scripts/build-images.mjs 산출물과 일치해야 한다(test/images.test.mjs 가 검증). */
const OPT = {
  "hero-gangnam": [480, 800, 1200, 1600], "footer-seoul": [480, 800, 1200, 1600],
  "profile-yubin": [480, 800, 896], "ssafy-presentation": [480, 800, 1016],
  "youth-day-yonhap": [480, 800, 860], "youth-day-selfie": [480, 800, 1200], "youth-day-mbc-02": [480, 800, 1200],
  "youth-day-venue": [480, 800, 1200], "youth-day-dialogue": [480, 800, 900],
  "dyl-assembly": [480, 800, 1200], "dyl-entrance": [480, 675], "dyl-library": [480, 800, 1200], "dyl-lecture": [480, 800, 1200], "dyl-qa": [480, 800, 1200],
  "fw-gwanghwamun": [480, 800, 1200, 1280], "fw-street": [480, 800, 1200, 1280], "fw-map": [480, 800, 1200, 1280], "fw-phone": [480, 800, 1200, 1280],
};
function Pic({ name, fallback, sizes, alt = "", className, ...img }) {
  const set = (ext) => OPT[name].map((w) => `images/opt/${name}-${w}.${ext} ${w}w`).join(", ");
  return (
    <picture className="pic">
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      <img src={fallback} sizes={sizes} alt={alt} className={className} decoding="async" {...img} />
    </picture>
  );
}

function useReveal() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    el.querySelectorAll(".reveal").forEach((n) => io.observe(el === n ? n : n));
    if (el.classList.contains("reveal")) io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ============================================================ NAV */
function Nav() {
  const [solid, setSolid] = React.useState(false);
  React.useEffect(() => {
    const on = () => setSolid(window.scrollY > 40);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const links = [
    ["소개", "#about"], ["역량", "#composite"], ["프로젝트", "#artifacts"], ["이력", "#trajectory"],
    ["강의", "#lectures"], ["채널", "#channels"], ["갤러리", "gallery.html"], ["경력 상세", "career.html"],
  ];
  return (
    <header className={"hnav" + (solid ? " is-solid" : "")} style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
    }}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
        <a href="#top" style={{ textDecoration: "none", color: "var(--ink)", display: "flex", alignItems: "center", gap: 10 }}>
          <img src="images/favicon.svg?v=4" alt="YK — 김유빈 CI" width="32" height="32" style={{ display: "block" }} />
          <span className="hnav__name">
            <b className="font-serif">Yubin Kim</b>
            <small>AI Strategy &amp; Consulting</small>
          </span>
        </a>
        <nav aria-label="주요 메뉴" style={{ display: "flex", alignItems: "center", gap: "clamp(14px,2.4vw,32px)" }} className="font-sans">
          <div className="nav-desktop" style={{ display: "flex", gap: "clamp(14px,2.4vw,32px)" }}>
            {links.map(([t, h]) => <a key={t} className="navlink" href={h}>{t}</a>)}
          </div>
          <button type="button" className="mnav-btn" data-mnav-toggle="" aria-expanded="false" aria-controls="mnav">
            <span className="mnav-btn__bars" aria-hidden="true" />메뉴
          </button>
          <a href="#contact" className="btn" style={{ padding: ".55em 1.1em", fontSize: ".85rem" }}>
            Contact <ArrowUpRight size={14} />
          </a>
        </nav>
      </div>
    </header>
  );
}

/* ============================================================ HERO */
/* 히어로 — 고정된 한 화면 안에서 카메라가 도시로 들어간다(진행도 --cp 는 cine.js).
 *  0–15%  정지 화면 · 이름이 원근을 두고 차례로 선다
 * 15–50%  사진이 앞으로 오고, YUBIN / KIM 은 서로 다른 깊이로 갈라진다
 * 50–85%  카메라가 더 밀고 들어가며 이름이 카메라를 지나쳐 사라진다
 * 85–100% 아이보리 막이 올라와 소개 장면으로 이어진다 */
function Hero() {
  const ref = useReveal();
  return (
    <section id="manifesto" ref={ref} className="hero-scene" data-cine="pin" data-cine-rest="0">
      <div className="hero-scene__sticky" style={{ position: "relative", minHeight: "100svh", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: 90, paddingBottom: 150 }}>
      <div className="hero-photo" aria-hidden="true">
        {/* 사진은 높이 기준으로 덮인다(원본 비율 2.47:1) — 폭 100vw 로 고르면 폰·태블릿에서 절반 해상도가 와 흐려진다 */}
        <Pic name="hero-gangnam" fallback="images/hero-gangnam-1000.jpg?v=1" sizes="(max-width: 700px) 130vh, (max-width: 1100px) 165vh, 100vw" fetchpriority="high" />
      </div>
      <div className="hero-photo__scrim" aria-hidden="true" />

      <div className="wrap reveal hero-copy" style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
        <div className="menu-rule" style={{ maxWidth: 210, margin: "0 auto 18px" }}><i /></div>
        <p className="font-sans hero-kicker">Seoul · Portfolio 2026</p>
        <p className="eyebrow hero-eyebrow">AI Strategy &amp; Consulting</p>
        <h1 className="font-serif hero-name" style={{ fontWeight: 900, lineHeight: .84, letterSpacing: "-.03em", fontSize: "clamp(3.4rem, 12.5vw, 10.5rem)", margin: 0 }}>
          <span className="sr-only">김유빈 Yubin Kim — AI 전략 컨설팅 </span>
          <span aria-hidden="true" className="hero-name__rows">
            <span className="hero-row hero-row--1">{"YUBIN".split("").map((c, i) => <span key={i} className="h-ltr" style={{ animationDelay: `${120 + i * 55}ms` }}>{c}</span>)}</span>
            <span className="hero-row hero-row--2">{"KIM".split("").map((c, i) => <span key={`k${i}`} className="h-ltr" style={{ animationDelay: `${120 + (i + 6) * 55}ms` }}>{c}</span>)}</span>
          </span>
        </h1>
        <div className="hero-sub">
          <p className="font-ko" style={{ fontWeight: 600, letterSpacing: ".01em", fontSize: "clamp(.92rem, 1.6vw, 1.12rem)", color: "var(--ink)", marginTop: 26, marginBottom: 20 }}>
            {"AI 전략 컨설팅 · 법무법인 경국 — Strategy · Automation · Data"}
          </p>
          <p className="font-ko" style={{ maxWidth: 620, margin: "0 auto", fontSize: "clamp(1rem, 1.7vw, 1.22rem)", lineHeight: 1.7, color: "var(--ink-soft)" }}>
            데이터로 판단의 근거를 만들고,<br />AI로 실행의 속도를 만듭니다.
          </p>
          <p className="font-ko hero-proof">
            AI로 풀 문제를 정의하고, 자동화 시스템을 직접 구현해 실제 업무에 적용합니다.
          </p>
        </div>

        <div className="hero-cta" style={{ marginTop: 44, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#artifacts" className="btn hero-main">대표 프로젝트 <ArrowDown size={15} /></a>
          <a href="#composite" className="btn btn--ghost">핵심 역량</a>
          <a href="career.html" className="btn btn--ghost">경력 상세 <ArrowUpRight size={15} /></a>
        </div>
      </div>

      <a href="#trajectory" className="scroll-cue" style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", textDecoration: "none" }}>
        <span className="font-sans" style={{ fontSize: ".64rem", letterSpacing: ".3em", fontWeight: 600 }}>SCROLL</span>
        <i />
      </a>
      <div className="hero-veil" aria-hidden="true" />
      </div>
    </section>
  );
}

function Sticker({ cls = "", style = {}, children }) {
  return <div className={`sticker ${cls}`} style={{ position: "absolute", zIndex: 4, ...style }}>{children}</div>;
}

/* ============================================================ MARQUEE */
function Marquee() {
  const items = ["YUBIN KIM OFFICE", "전략 컨설팅 × AI", "STRATEGY CONSULTING", "PROCESS AUTOMATION", "DATA-DRIVEN DECISIONS", "AI 강의 · LECTURES", "김유빈 · ETHAN KIM"];
  const Row = () => (
    <span>{items.map((t, i) => (
      <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "2.5rem" }}>
        <span className="font-serif" style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: ".02em" }}>{t}</span>
        <Sparkle size={18} />
      </span>
    ))}</span>
  );
  const RowOutline = () => (
    <span>{items.map((t, i) => (
      <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "2.5rem" }}>
        <span className="font-cond m-outline" style={{ fontSize: "1.15rem" }}>{t}</span>
        <Sparkle size={14} style={{ opacity: .55 }} />
      </span>
    ))}</span>
  );
  return (
    <div className="marquee" style={{ flexDirection: "column" }}>
      <div className="marquee__line"><div className="marquee__track"><Row /><Row /></div></div>
      <div className="marquee__line marquee__line--rev"><div className="marquee__track marquee__track--rev"><RowOutline /><RowOutline /></div></div>
    </div>
  );
}

/* ============================================================ LEDGER — at a glance */
function Ledger() {
  const ref = useReveal();
  const ITEMS = [
    /* 작업 목록(EDITIONS)에서 바로 센다 — 항목을 더하거나 빼도 숫자가 어긋나지 않게 */
    [String(EDITIONS.length), "AI · 자동화 결과물", "Projects"],
    [String(EDITIONS.filter((e) => /배포 완료|사내 운영/.test(e.status)).length), "배포 · 사내 운영 시스템", "In Operation"],
    ["4", "AI · 데이터 전문교육", "Programs"],
    ["3", "수상 · 표창", "Awards"],
  ];
  return (
    <section ref={ref} className="ledger" aria-label="한눈에 보는 기록">
      <div className="wrap reveal">
        <p className="eyebrow ledger__eyebrow">At a Glance — 한눈에 보는 기록</p>
        <div className="ledger-grid">
          {ITEMS.map(([n, ko, en], i) => (
            <div key={i} className="ledger-item" style={{ transitionDelay: `${i * 70}ms` }}>
              <div className="ledger-num font-serif" data-count={n}>{n}</div>
              <div className="ledger-ko font-ko">{ko}</div>
              <div className="ledger-en font-sans">{en}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ COMPOSITE — 융합 역량 */
const DOMAINS = [
  { n: "01", core: true, ko: "AI 전략 컨설팅", short: "전략", en: "AI Strategy & Consulting",
    desc: "흩어진 시장·업무 데이터를 모아 무엇을 먼저 할지, 무엇을 AI에 맡길지 정하는 일. 광명시흥 3기 신도시 보상자료를 절차와 쟁점별로 구조화했고, 고객 메일 자동 분류에서는 무엇을 위험 신호로 볼지 판단 기준을 세웠습니다.",
    tags: ["문제 정의 · 우선순위 설계", "사업성 검토"] },
  { n: "02", core: true, ko: "AI 프로세스 자동화", short: "AI", en: "AI Automation",
    desc: "사람이 반복하던 판단의 앞단을 AI에 맡기고, 사람은 기준을 정하는 자리에 남깁니다. SSAFY·서울대 AIED에서 구조를 익혔습니다.",
    tags: ["SSAFY 13기", "서울대 AIED 4기"] },
  { n: "03", core: true, ko: "데이터 · 인프라", short: "데이터", en: "Data Infrastructure",
    desc: "공공데이터 API와 Google Workspace를 의사결정 가능한 화면으로 번역하고 직접 배포합니다. 전략이 감이 아니라 근거 위에 서도록 데이터 구조를 먼저 설계합니다.",
    tags: ["공공데이터 API", "GWS 연동"] },
  { n: "04", ko: "마케팅 · 커뮤니케이션", short: "마케팅", en: "Marketing & Comms",
    desc: "KREMA 4기의 세그먼트 전략과 생성형 AI 제작 역량으로 전략을 시장에 닿는 언어로 옮깁니다.",
    tags: ["KREMA 4기", "연합뉴스TV · 서울시민기자단"] },
  { n: "05", ko: "교육 · 강의", short: "강의", en: "Teaching",
    desc: "서울대 AIED 4기에서 교수법을 체화하고, 실무에서 만든 시스템을 강의 모듈로 옮깁니다.",
    tags: ["서울대 AIED 4기", "SSAFY 홍보 앰배서더"] },
  { n: "06", ko: "도메인 — 법무 · 부동산 · 공공", short: "도메인", en: "Domain Expertise",
    desc: "법무법인 경국의 송무·사무, 건국대 스마트건설의 부동산 이해, 청년 정책 거버넌스의 공공 감각이 판단의 바탕입니다.",
    tags: ["법무법인 경국", "스마트건설 · 청년정책"] },
];

/* ============================================================ LECTURES — 강의 프로그램 */
const LECTURE_TRACKS = [
  { key: "foundation", label: "Track A — AI 파운데이션", ko: "도구를 쓰는 사람에서, 도구를 설계하는 사람으로",
    desc: "개념부터 에이전트 설계까지. SSAFY 13기의 엔지니어링 훈련과 서울대 AIED 4기의 프롬프트 아키텍처·교수법을 실무 언어로 옮긴 네 과정입니다." },
  { key: "domain", label: "Track B — 도메인 적용", ko: "만들어 본 사람만 가르칠 수 있는 것",
    desc: "직접 설계·배포해 운영 중인 시스템에서 나온 네 과정. KREMA 4기의 시장 데이터 전략과 현장 산출물을 사례로 다룹니다." },
  { key: "realestate", label: "Track C — 부동산 · 자산관리", ko: "자산은 숫자로, 계약은 근거로",
    desc: "AI와 나란히 서는 두 번째 전문 영역. 분양대행자 자격과 KREMA 4기, 법무법인 경국의 송무 실무, 정비사업 데이터 자동화와 부동산 직무 체험관 설계에서 나온 네 과정입니다." },
];

const LECTURES = [
  /* ---- Track A — AI 파운데이션 ---- */
  { id: "lec-01", n: "01", track: "foundation", color: "var(--sky)", Icon: Cpu,
    title: "AI 기초 개념 — 무엇이 되고 무엇이 안 되는가",
    lead: "모델이 어떻게 답을 만드는지 알면, 어디까지 맡길지 판단할 수 있습니다.",
    who: "전 직군 입문자 · 도입을 검토하는 관리자",
    hours: "2시간",
    modules: ["토큰·맥락창·환각이 생기는 자리", "생성형 AI가 잘하는 일과 못하는 일의 경계", "업무에 붙일 때의 검수 기준"],
    basis: "서울대 AIED 4기 — AI 교육 전문가 과정",
    proof: { label: "교육 이수 기록", href: "career.html#cv-snu-aied" } },
  { id: "lec-02", n: "02", track: "foundation", color: "var(--lilac)", Icon: Sparkle,
    title: "프롬프트 엔지니어링 — 문장이 아니라 구조로",
    lead: "좋은 프롬프트는 잘 쓴 문장이 아니라 잘 설계된 구조입니다.",
    who: "전략 · 마케팅 · 사무 실무자",
    hours: "3시간(실습 포함)",
    modules: ["역할·제약·예시·출력형식의 네 기둥", "재사용 가능한 프롬프트 템플릿 설계", "평가와 개선 루프 만들기"],
    basis: "서울대 AIED 4기 — 구조화된 프롬프트 아키텍처",
    proof: { label: "브랜드 필름 적용 사례", href: "#ed-02" } },
  { id: "lec-03", n: "03", track: "foundation", color: "var(--apple)", Icon: Code,
    title: "바이브 코딩 — 코드를 몰라도 만들고 배포하기",
    lead: "아이디어에서 배포까지, AI와 대화하며 실제 도구를 완성하는 과정입니다.",
    who: "비개발 직군 · 사내 도구를 직접 만들고 싶은 실무자",
    hours: "4시간(제작 실습)",
    modules: ["요구사항을 AI가 이해하는 단위로 쪼개기", "고쳐가며 만드는 반복 루프와 검증", "Vercel 배포와 운영 감각"],
    basis: "SSAFY 13기 — 소프트웨어 아키텍처 실무 프로젝트",
    proof: { label: "직접 배포한 대시보드", href: "#ed-05" } },
  { id: "lec-04", n: "04", track: "foundation", color: "var(--pink)", Icon: Cpu,
    title: "하네스 엔지니어링 — 에이전트에 손과 발을 달기",
    lead: "모델 자체보다, 모델에 무엇을 쥐여주느냐가 결과를 가릅니다.",
    who: "사내 자동화를 설계하는 실무자 · 개발 인접 직군",
    hours: "4시간",
    modules: ["도구 연결과 권한 경계 설계", "맥락 주입과 실패 시 폴백 설계", "사람이 승인해야 할 지점 정하기"],
    basis: "GWS · NAVER WORKS API 연동 경험",
    proof: { label: "고객 메일 자동 분류 시스템", href: "#ed-06" } },

  /* ---- Track B — 도메인 적용 ---- */
  { id: "lec-05", n: "05", track: "domain", color: "var(--sky)", Icon: BarChart,
    title: "실무자를 위한 전략 컨설팅 AI",
    lead: "반복 업무를 진단하고, 무엇을 자동화할지 정하는 기준을 세웁니다.",
    who: "백오피스 · 전략 · 전문직 사무소 실무자",
    hours: "3시간 / 6시간(실습 포함)",
    modules: ["업무 흐름 진단과 병목 찾기", "자동화 우선순위 매트릭스", "사람이 남아야 할 판단의 자리"],
    basis: "법무법인 경국 — 송무·사무 프로세스 혁신 실무",
    proof: { label: "고객 메일 자동 분류 사례", href: "#ed-06" } },
  { id: "lec-06", n: "06", track: "domain", color: "var(--apple)", Icon: BarChart,
    title: "공공데이터로 시장을 읽는 법",
    lead: "공개된 데이터를 의사결정이 가능한 화면으로 바꾸는 과정을 처음부터 끝까지 다룹니다.",
    who: "부동산 · 마케팅 · 정비사업 데이터 담당자",
    hours: "4시간(대시보드 실습)",
    modules: ["공공데이터 API 수집 설계", "나란히 놓아야 의미가 생기는 지표", "배포와 갱신 자동화"],
    basis: "KREMA 4기 — AI 기반 부동산 시장 데이터 분석",
    proof: { label: "청약 인사이트 대시보드", href: "#ed-05" } },
  { id: "lec-07", n: "07", track: "domain", color: "var(--lilac)", Icon: Sparkle,
    title: "생성형 AI 브랜드 필름 제작",
    lead: "프롬프트 구조로 영상을 만들고, 톤을 지키는 판단은 사람이 합니다.",
    who: "마케팅 · 홍보 · 브랜드 담당자",
    hours: "3시간(제작 실습)",
    modules: ["영상 프롬프트 아키텍처", "영상·내레이션·사운드 결합", "브랜드 톤 검수 기준"],
    basis: "KREMA 4기 — 매체별 디지털 마케팅 전략",
    proof: { label: "르엘 성수 브랜드 필름", href: "#ed-02" } },
  { id: "lec-08", n: "08", track: "domain", color: "var(--pink)", Icon: Newspaper,
    title: "제도의 언어를 대중의 언어로",
    lead: "전문적인 내용이 닿지 않으면 없는 것과 같습니다. 전달의 문법을 다룹니다.",
    who: "공공기관 · 청년 조직 · 협회",
    hours: "2시간",
    modules: ["대상에 맞춘 메시지 재구성", "카드뉴스·영상 포맷 설계", "정책 제안으로 잇는 커뮤니케이션"],
    basis: "서울시민기자단 · 연합뉴스TV · 청년 정책 거버넌스",
    proof: { label: "지방선거 카드뉴스", href: "#ed-01" } },

  /* ---- Track C — 부동산 · 자산관리 ---- */
  { id: "lec-09", n: "09", track: "realestate", color: "var(--apple)", Icon: Home,
    title: "부동산 자산관리 입문 — 임대수익을 숫자로 읽기",
    lead: "월세 합계가 아니라 순영업소득(NOI)으로 자산을 봅니다. 공실·경비·환원율 세 숫자로 설명하는 법을 익힙니다.",
    who: "임대인 · 자산관리 입문자 · 중개·분양 실무자",
    hours: "3시간(계산 실습)",
    modules: ["가능총수익 → 공실·대손 → 유효총수익", "운영경비와 NOI — 이자·감가상각을 빼지 않는 이유", "환원율 1%p가 자산가치를 바꾸는 폭"],
    basis: "감정평가사 필드워크 — 자산관리·리츠 직무 체험 설계",
    proof: { label: "부동산 직무 체험관", href: "#ed-10" } },
  { id: "lec-10", n: "10", track: "realestate", color: "var(--butter)", Icon: BarChart,
    title: "분양 마케팅과 광고 윤리 — 판매보다 신뢰",
    lead: "근거 없는 '확정'·'보장' 문구가 계약 분쟁이 되는 지점을 미리 막고, 상담을 데이터로 설계합니다.",
    who: "분양대행 · 시행사 마케팅 · 상담 실무자",
    hours: "3시간",
    modules: ["관찰과 주장 구분 — 입지·조망 문구 검수", "청약 가점·자격을 상담에서 다시 계산하는 법", "채널별 예산과 상담 전환 설계"],
    basis: "분양대행자 자격 · KREMA 4기 부동산 마케팅 기획자 과정",
    proof: { label: "집캐치 청약 추천 서비스", href: "#ed-09" } },
  { id: "lec-11", n: "11", track: "realestate", color: "var(--sky)", Icon: Scale,
    title: "전세·임대차 안전 점검 — 계약 전에 확인할 것",
    lead: "대항력·확정일자·등기부를 잔금일 기준으로 다시 확인하는 절차를 익힙니다. 법률 자문이 아닌 점검 교육입니다.",
    who: "사회초년생 · 청년 임차인 · 중개 보조 실무자",
    hours: "2시간",
    modules: ["대항력과 우선변제권이 생기는 시점", "등기사항증명서 갑구·을구 읽기", "잔금일 위험과 특약 문구"],
    basis: "법무법인 경국 송무 실무 · 필드워크 공인중개사 트랙 설계",
    proof: { label: "전세 안전 점검 체험", href: "https://appraiser-fieldwork.vercel.app/" } },
  { id: "lec-12", n: "12", track: "realestate", color: "var(--pink)", Icon: MapPin,
    title: "개발·정비사업을 데이터로 읽기",
    lead: "용적률·사업수지를 공공데이터로 확인하고 보상 절차의 쟁점을 짚어, 사업성을 감이 아니라 숫자로 판단합니다.",
    who: "시행 · 정비사업 조합 실무 · 부동산 전략 담당자",
    hours: "4시간(데이터 실습)",
    modules: ["용적률·건폐율로 사업 규모 잡기", "분양가·공사비 민감도 분석", "보상 절차 읽기 — 감정평가 → 보상협의 → 재결"],
    basis: "광명시흥 3기 신도시 보상자료 분석(발표자료 77장) · 건국대 스마트건설",
    proof: { label: "광명시흥 보상자료 분석", href: "#ax-desk" } },
];

const LECTURE_BASIS = [
  ["삼성청년SW아카데미 13기", "소프트웨어 아키텍처와 AI 알고리즘을 실무 프로젝트로 학습. 홍보 앰배서더로 지원자 대상 커뮤니케이션도 수행했습니다."],
  ["서울대학교 AIED 4기", "AI 교육 전문가 과정에서 구조화된 프롬프트 아키텍처와 교수법을 체화했습니다."],
  ["한국부동산마케팅협회 4기", "AI 기반 시장 데이터 분석과 세그먼트 도출, 매체별 전략 수립을 익혔습니다."],
  ["배포된 결과물 8건", "강의 사례는 전부 직접 만들어 운영 중인 산출물입니다. 시연 가능한 화면으로 수업합니다."],
];

const ARSENAL = [
  ["생성형 AI", ["GPT Image-2", "Suno AI", "ElevenLabs", "Veo 3", "Google Vids", "Hyperframe"]],
  ["데이터 · 개발", ["공공데이터 API", "GWS API", "React", "Vercel", "Prompt Architecture"]],
  ["도메인", ["BIM · 드론 측량", "송무 프로세스", "청약 · 부동산 데이터"]],
];

const CREDS = [
  { name: "TESAT", ko: "경제이해력검증시험", by: "한국경제신문 주관" },
  { name: "OPIc IH", ko: "영어 말하기 (Intermediate High)", by: "ACTFL 공인 등급" },
  { name: "전기기능사", ko: "국가기술자격", by: "한국산업인력공단" },
  { name: "분양대행자", ko: "부동산 분양 실무 자격", by: "주택·상가 분양 대행" },
];

const THESIS = [
  ["교차점의 희소성", "법률의 엄밀함과 인공지능의 구현 역량을 함께 갖춘 인력은 많지 않다. 대체 불가능성은 한 분야의 깊이가 아니라 서로 다른 분야가 만나는 경계에서 형성."],
  ["실행을 통한 증명", "학습한 내용을 배포 가능한 결과물로 구현. 여섯 건의 프로젝트는 서술이 아니라 접근 가능한 산출물로 존재."],
  ["언어의 매개", "제도의 언어와 기술의 언어, 대중의 언어를 오가며 조직 내부에서 발생하는 소통의 간극을 조정."],
];

const CASES = [
  { n: "01", title: "감정평가사 필드워크", tag: "Three.js · 실지조사 시뮬레이션", feature: true,
    manual: "실지조사 절차와 감정평가·공간정보 관련 조문, 지목 28종을 교재로 읽고 외우던 학습.",
    auto: "3D로 옮긴 서울을 걸으며 의뢰 수임부터 등기촉탁까지 5단계를 직접 수행하고, 조문 카드와 지목을 장소에서 수집.",
    judge: "어떤 절차를 어떤 순서로 밟아야 평가가 성립하는지, 어느 조문을 어느 현장에 붙여야 기억되는지는 감정평가 실무를 알아야 설계할 수 있습니다." },
  { n: "02", title: "고객 메일 자동 분류 시스템", tag: "구글 업무도구 연동 · 자동 분류",
    manual: "담당자가 메일함을 직접 확인하며 사안의 우선순위를 판단하던 업무.",
    auto: "메일이 들어오면 자동으로 모아 급한 순서대로 1차 분류.",
    judge: "무엇을 리스크로 볼지 정하는 건 결국 사람 몫이고, 그 기준은 법무 감각에서 나옵니다." },
];

const NODE = [[200, 68], [314, 134], [314, 266], [200, 332], [86, 266], [86, 134]];

/* 역량 지도 — 판(뒤) · 선(가운데) · 핵심(앞)이 서로 다른 깊이에 놓인 입체 지도.
 * 스크롤하면 눕혀진 판이 관람자 쪽으로 서고(--k), 선이 이어지고, 핵심 역량이 앞으로 나온다.
 * 포인터·손가락 위치는 카메라(--rx --ry), 고른 역량은 가장 앞으로 나오고 나머지는 물러난다. */
function ConvergenceMap({ active, onPick }) {
  return (
    <div className="cmap3d" data-cine="pass" data-cine-src="#composite" role="group" aria-label="여섯 도메인이 하나로 수렴하는 융합 역량 지도 — 역량을 누르면 설명이 바뀝니다">
      <div className="cmap3d__rig">
        <div className="cmap3d__plate" aria-hidden="true" />
        <svg className="cmap" viewBox="0 0 400 400" aria-hidden="true">
          <polygon className="cmap__ring" points={NODE.map((p) => p.join(",")).join(" ")} />
          {NODE.map((p, i) => (
            <line key={"s" + i} pathLength="1" style={{ "--d": i }} className={"cmap__spoke" + (DOMAINS[i].core ? " core" : "") + (i === active ? " on" : "")} x1="200" y1="200" x2={p[0]} y2={p[1]} />
          ))}
          <circle className="cmap__halo" cx="200" cy="200" r="60" />
        </svg>
        <div className="cmap3d__core" aria-hidden="true"><b className="font-serif">AI</b><span>STRATEGY</span></div>
        {DOMAINS.map((d, i) => (
          <button key={d.n} type="button" aria-pressed={i === active}
            className={"cmap3d__n" + (d.core ? " core" : "") + (i === active ? " on" : "") + " p-" + "trrbll"[i]}
            style={{ left: NODE[i][0] / 4 + "%", top: NODE[i][1] / 4 + "%", "--d": i }}
            onMouseEnter={() => onPick(i)} onFocus={() => onPick(i)} onClick={() => onPick(i)}>
            <i aria-hidden="true" /><span className="font-ko">{d.short}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Composite() {
  const ref = useReveal();
  const bandRef = useReveal();
  const [active, setActive] = React.useState(0);
  const rows = React.useRef([]);

  React.useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) setActive(Number(e.target.getAttribute("data-i"))); }),
      { rootMargin: "-42% 0px -46% 0px" }
    );
    rows.current.forEach((n) => n && io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <React.Fragment>
    <section id="composite" ref={ref} style={{ position: "relative", padding: "clamp(80px,12vw,150px) 0 clamp(80px,10vw,120px)" }}>
      <div className="speckle" style={{ opacity: .2 }} />
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        <SectionHead eyebrow="02 — Core Competencies" titleEn="The Composite" titleKo="AI 전략 컨설팅을 중심에 둔 역량 구조" />

        <div className="comp-thesis reveal">
          <p className="font-myeongjo">
            전략은 무엇을 먼저 할지 정하는 일이고, AI는 그 결정을 빨리 실행하는 도구입니다.
          </p>
          <p className="font-ko comp-thesis__sub">
            중심축은 <strong>AI 전략 컨설팅 · AI 자동화 · 데이터</strong> 세 가지입니다.
            마케팅·강의·도메인 지식은 그 판단을 정확하게 만들고 조직에 전달하는 보조 역량입니다.
          </p>
        </div>

        <div className="comp-stage">
          <div className="comp-stage__sticky" data-tilt="">
            <ConvergenceMap active={active} onPick={setActive} />
            <div className="cmap__cap">
              <span className="font-cond">{DOMAINS[active].n}</span>
              <strong className="font-ko">{DOMAINS[active].ko}</strong>
              <em className="font-sans">{DOMAINS[active].en}</em>
            </div>
          </div>

          <div className="comp-track">
            <p className="comp-group font-sans">Core — 핵심 역량</p>
            {DOMAINS.filter((d) => d.core).map((d) => {
              const i = DOMAINS.indexOf(d);
              return (
                <article
                  key={d.n}
                  data-i={i}
                  id={"dom-" + d.n}
                  ref={(el) => (rows.current[i] = el)}
                  className={"comp-row comp-row--core" + (i === active ? " on" : "")}
                  onMouseEnter={() => setActive(i)}
                >
                  <div className="comp-row__head">
                    <span className="comp-row__n font-cond">{d.n}</span>
                    <span className="comp-row__rule" />
                    <span className="comp-row__en font-sans">{d.en}</span>
                  </div>
                  <h3 className="font-ko">{d.ko}</h3>
                  <p className="font-ko">{d.desc}</p>
                  <div className="comp-row__tags font-ko">
                    {d.tags.map((t) => <span key={t}>{t}</span>)}
                  </div>
                </article>
              );
            })}
            <p className="comp-group comp-group--sub font-sans">Supporting — 보조 역량 · 눌러서 보기</p>
            {DOMAINS.filter((d) => !d.core).map((d) => {
              const i = DOMAINS.indexOf(d);
              return (
                <details
                  key={d.n}
                  data-i={i}
                  id={"dom-" + d.n}
                  ref={(el) => (rows.current[i] = el)}
                  className={"comp-row comp-row--sub fold" + (i === active ? " on" : "")}
                  onMouseEnter={() => setActive(i)}
                >
                  <summary>
                    <span className="comp-row__n font-cond">{d.n}</span>
                    <span className="fold__t">
                      <strong className="font-ko">{d.ko}</strong>
                      <em className="font-sans">{d.en}</em>
                    </span>
                    <i className="fold__icon" aria-hidden="true" />
                  </summary>
                  <div className="fold__body">
                    <p className="font-ko">{d.desc}</p>
                    <div className="comp-row__tags font-ko">
                      {d.tags.map((t) => <span key={t}>{t}</span>)}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </div>

        <div className="folds reveal">
        <details className="arsenal fold" id="arsenal">
          <summary>
            <span className="fold__t">
              <span className="eyebrow">The Arsenal</span>
              <strong className="font-ko">실무에서 다루는 도구</strong>
            </span>
            <i className="fold__icon" aria-hidden="true" />
          </summary>
          <div className="fold__body">
          {ARSENAL.map(([label, tools]) => (
            <div key={label} className="arsenal__row">
              <span className="arsenal__label font-ko">{label}</span>
              <div className="arsenal__chips font-sans">
                {tools.map((t) => <span key={t}>{t}</span>)}
              </div>
            </div>
          ))}
          </div>
        </details>

        <details className="creds fold" id="credentials">
          <summary>
            <span className="fold__t">
              <span className="eyebrow">The Credentials</span>
              <strong className="font-ko">보유 자격 <em>{CREDS.length}건</em></strong>
            </span>
            <i className="fold__icon" aria-hidden="true" />
          </summary>
          <div className="fold__body">
          <div className="creds__grid">
            {CREDS.map((c) => (
              <div key={c.name} id={"cred-" + c.name.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-")} className="cred">
                <span className="cred__name font-serif">{c.name}</span>
                <span className="cred__ko font-ko">{c.ko}</span>
                <span className="cred__by font-sans">{c.by}</span>
              </div>
            ))}
          </div>
          </div>
        </details>
        </div>

      </div>
    </section>

    <section className="whyc" ref={bandRef}>
      <div className="wrap">
        <div className="menu-rule reveal" style={{ marginBottom: 26 }}><i /></div>
        <p className="eyebrow reveal">Strategy Cases — 전략 판단의 기록</p>

        <h2 className="whyc__lead font-myeongjo reveal">
          도구는 빨라졌습니다.<br />
          <em>무엇을 먼저 할지는 여전히 사람이 정합니다.</em>
        </h2>

        <p className="whyc__intro font-ko reveal">
          직접 만든 두 개의 시스템에서 같은 일이 반복됐습니다. 사람이 하던 일이 도구로 넘어갔고,
          그때마다 사람이 남아야 할 자리가 하나씩 또렷해졌습니다. 그 자리가 전략 컨설팅입니다.
        </p>

        <div className="wcases">
          {CASES.map((c, i) => (
            <article key={c.n} className={"wcase reveal" + (c.feature ? " wcase--feature" : "")} style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="wcase__head">
                <span className="wcase__n font-serif">Case {c.n}</span>
                <h3 className="wcase__t font-ko">{c.title}</h3>
                {c.feature && <span className="wcase__badge font-sans">Featured · 감정평가</span>}
                <span className="wcase__tag font-sans">{c.tag}</span>
              </div>
              <div className="wcase__flow">
                <div className="wcase__cell">
                  <span className="wcase__lbl font-sans">As-Is · 기존 방식</span>
                  <p className="font-ko">{c.manual}</p>
                </div>
                <div className="wcase__cell wcase__cell--auto">
                  <span className="wcase__lbl font-sans">To-Be · AI 적용</span>
                  <p className="font-ko">{c.auto}</p>
                </div>
                <div className="wcase__cell wcase__cell--judge">
                  <span className="wcase__lbl font-sans">Judgment · 전략 판단</span>
                  <p className="font-ko">{c.judge}</p>
                </div>
              </div>
              {c.feature && <FieldworkStrip />}
            </article>
          ))}
        </div>

        <p className="whyc__close font-myeongjo reveal">
          세 번 다 사람이 하는 일은 같았습니다 —<br />
          <em>도구에 무엇을 시킬지 정하는 일.</em>
        </p>
        <p className="whyc__closesub font-ko reveal">
          기준을 세우는 사람과 그것을 실행까지 옮기는 사람이 다르면 속도가 죽습니다.
          둘을 한 사람이 하도록 준비해 왔습니다.
        </p>
      </div>
    </section>
  </React.Fragment>
  );
}

/* ---- 필드워크 체험 스트립 (게임 인게임 화면) ---- */
const FIELDWORK_SHOTS = [
  { img: "fw-gwanghwamun", label: "실지조사", cap: "광화문·세종대로를 직접 걷는다" },
  { img: "fw-street", label: "서울 실측 공간", cap: "종로에서 강남까지, 실제 시간과 햇빛" },
  { img: "fw-map", label: "사건 지도", cap: "의뢰·업무 장소·수집 대상을 한 화면에" },
  { img: "fw-phone", label: "업무용 단말", cap: "내 의뢰 · 사건 파일 · 법령 검색" },
];
const FIELDWORK_ITEMS = ["실지조사 5단계", "조문 카드 24장", "지목 도감 28종", "실무 퀴즈 · 기출"];

function FieldworkStrip() {
  return (
    <div className="fw reveal">
      <div className="fw__head">
        <div>
          <p className="eyebrow fw__eyebrow">Playable — 직접 만든 것을 직접 해보기</p>
          <h3 className="fw__title font-ko">읽는 대신 걸어서 익히는 감정평가 필드워크</h3>
          <p className="fw__sub font-ko">
            감정평가 실무를 그대로 옮겼습니다. 절차를 설명하는 대신 절차를 걷게 만들었습니다.
          </p>
        </div>
        <a className="fw__cta font-sans" href="https://appraiser-fieldwork.vercel.app/" target="_blank" rel="noopener noreferrer">
          지금 체험하기 <ArrowUpRight size={16} />
        </a>
      </div>

      <div className="fw__items font-sans">
        {FIELDWORK_ITEMS.map((t) => <span key={t}>{t}</span>)}
      </div>

      <div className="fw__grid">
        {FIELDWORK_SHOTS.map((s) => (
          <a key={s.img} className="fw__shot" href="https://appraiser-fieldwork.vercel.app/" target="_blank" rel="noopener noreferrer">
            <Pic name={s.img} fallback={`images/${s.img}-700.jpg`}
              sizes="(max-width: 560px) 88vw, (max-width: 980px) 44vw, 24vw"
              alt={`감정평가사 필드워크 인게임 화면 — ${s.label}: ${s.cap}`}
              width="700" height="359" loading="lazy" />
            <span className="fw__label font-ko">{s.label}</span>
            <span className="fw__cap font-ko">{s.cap}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ============================================================ TRAJECTORY */
const TRAJECTORY = [
  { id: "tl-gyunggook", group: "work", year: "Now", tag: "PRESENT", color: "var(--sky)", title: "법무법인 경국 — 사원 (Staff)",
    desc: "정비사업의 법률·경제 위험을 다루는 AX를 기획·구축 — 정비사업 법률 리스크 관제(RE:INTELLIGENCE), 조합 총회결의 하자 사전검증, 계약변경 AI Redline. 광명시흥 3기 신도시 보상자료 분석·구조화(발표자료 77장)를 함께 수행.", proof: "#ax-desk", proofLabel: "AX 현황판 보기" },
  { id: "tl-krema-intern", group: "work", year: "2026", color: "var(--pink)", title: "한국부동산마케팅협회 (KREMA) — 인턴 (2026. 4 ~ 2026. 6)",
    desc: "한국부동산마케팅협회 인턴으로 근무했습니다(2026. 4 ~ 2026. 6)." },
  { id: "tl-gender-forum", group: "public", year: "2026", color: "var(--apple)", title: "성평등가족부 제2차 청년세대 성별균형 공개형 공론장 〈모두의 성평등〉 참석",
    desc: "‘청년이 생각하는 성평등정책, 어디까지?’를 주제로 연세대 백양누리 그랜드볼룸에서 열린 공개형 공론장(2026. 10. 25)에 참석해 청년 세대의 시각으로 정책 토론에 함께했고, 현장에서 성평등가족부 장관과 함께했습니다.", proof: "gallery.html#gender-forum", proofLabel: "공론장 현장 보기" },
  { id: "tl-dyl", group: "public", year: "2026", color: "var(--sky)", title: "2026 민주청년지도자 양성과정 입학 · 수강 중",
    desc: "민주연구원이 주최·주관하는 2026 민주청년지도자 양성과정에 입학(2026. 10. 24)해 12월 13일까지 정책·리더십 과정을 이어 가고 있습니다. 입학식에서 김민석 당대표·강득구 민주연구원장과 함께했고, 이광재 예산결산특별위원장의 특강에서 직접 질문했으며, 박홍근 기획예산처 장관과도 현장에서 함께했습니다.", proof: "gallery.html#dyl", proofLabel: "입학식 현장 보기" },
  { id: "tl-zipconomy", group: "public", year: "2026", color: "var(--butter)", title: "한경 집코노미 박람회 2026 — KREMA AI 전시관 서비스 시연·발표",
    desc: "코엑스 D홀 KREMA AI 전시관 C-10 부스에서 청약·공공임대 맞춤 추천 서비스 집캐치와 3D 감정평가 필드워크를 소개하고, 제작 배경과 작동 방식을 설명하며 관람객 질문에 답했습니다.", proof: "gallery.html#zipconomy", proofLabel: "박람회 현장 보기" },
  { id: "tl-national-debate", group: "public", year: "2026", color: "var(--apple)", title: "국민통합위원회 2026 국민 대토론회 — 정책 제안 발표",
    desc: "〈2026 세대·젠더 분야 현장형 국민대화 국민 대토론회〉(2026. 9. 29 · aT센터) 자산 분야 트랙에서 청년 미래배당펀드팀으로 ‘청년 초과세수 미래배당펀드’를 제안·발표. 일회성으로 소진되는 초과세수를 청년 세대가 함께 불리는 자산으로 전환하는 구조를 설계." },
  { id: "tl-youth-day", group: "public", year: "2026", color: "var(--sky)", title: "청와대 대통령 주관 청년의날 행사 참석",
    desc: "대통령이 주관한 청년의날 기념행사에 청년 대표로 초청되어 참석. 청년 정책의 방향과 현장의 과제를 국정 최고 의사결정 단위에서 직접 청취하고 교류." },
  { id: "tl-value-design", group: "public", year: "2026", color: "var(--sky)", title: "서초구 가치디자인단 위촉",
    desc: "서초구청 위촉식(2026. 9. 18)을 거쳐 가치디자인단으로 위촉되어 구정 현장 활동에 참여하고 있습니다." },
  { id: "tl-seocho", group: "public", year: "2026", color: "var(--apple)", title: "서초청년네트워크 9기 운영위원회 부위원장",
    desc: "서초구 청년 정책 거버넌스의 운영위원회 부위원장으로서 분과 의제 설정과 위원회 운영을 총괄하고, 현장의 목소리를 제도로 잇는 민관 협력을 주도." },
  { id: "tl-acrc-panel", group: "public", year: "2026", color: "var(--sky)", title: "국민권익위원회 청년정책 패널 활동",
    desc: "국민권익위원회 청년정책 패널로 활동하며, 청년의 시각에서 정책 과제에 의견을 내고 있습니다." },
  { id: "tl-youth-panel", group: "public", year: "2026", color: "var(--pink)", title: "국무조정실 온라인 청년참여단 활동",
    desc: "국무조정실 온라인 청년참여단으로서 청년 정책 과제에 대한 의견 수렴과 정책 제안에 참여하며, 온라인 공론장을 통해 청년 세대의 목소리를 정부 정책 과정에 전달." },
  { id: "tl-myongji", group: "edu", year: "2026", color: "var(--apple)", title: "명지대학교 AI 데이터 매니지먼트 과정 — 트랙3 수료 · 트랙1·2·4 수강",
    desc: "AI 데이터 매니지먼트 과정 네 개 트랙 중 트랙3을 수료했고, 트랙1·2·4를 수강 중이거나 수강할 예정입니다." },
  { id: "tl-claude-rag", group: "edu", year: "2026", color: "var(--lilac)", title: "‘클로드 코드로 완성하는 상담 RAG 챗봇’ 교육 이수",
    desc: "Claude Code로 문서 검색 기반(RAG) 상담 챗봇을 직접 구현하는 실습 교육(2026. 7. 25)." },
  { id: "tl-konkuk", group: "edu", year: "2026", color: "var(--butter)", title: "건국대학교 스마트건설기술교육 프로그램 이수",
    desc: "BIM 설계 데이터 해석과 드론 측량, 건설 자동화 워크플로우를 실습 중심으로 다루며 부동산·건설 도메인을 데이터의 언어로 읽어내는 융합적 관점을 정립." },
  { id: "tl-seoul-press", group: "public", year: "2026", color: "var(--apple)", title: "서울시민기자단 취재기자 활동",
    desc: "공공 영역의 미디어 콘텐츠를 구성·편집하고 시정(市政) 현안을 분석하여 정책 제안 과정에 참여." },
  { id: "tl-fintech", group: "edu", year: "2026", color: "var(--lilac)", title: "서울특별시 핀테크 아카데미 14기 수강 중",
    desc: "금융과 기술이 접합하는 지점에서 핀테크 산업 구조와 디지털 금융 서비스 설계 원리를 학습하고, 데이터 기반 금융 도메인으로 역량의 범위를 확장." },
  { id: "tl-krema", group: "edu", year: "2026", color: "var(--pink)", title: "한국부동산마케팅협회 (KREMA) AI 마케팅 기획자 양성 과정 4기 수료",
    desc: "인공지능 기반의 부동산 시장 데이터 분석과 표적 세그먼트 도출을 학습하고, 매체별 디지털 마케팅 전략 수립 및 자동화 설계 역량을 습득." },
  { id: "tl-snu-aied", group: "edu", year: "2026", color: "var(--sky)", title: "서울대학교 AI 교육 전문가 과정 (AIED) 4기 수료",
    desc: "인공지능 메커니즘의 비즈니스 도메인 최적화 적용, 구조화된 프롬프트 엔지니어링 아키텍처의 이해와 교수법 체화." },
  { id: "tl-ssafy", group: "edu", year: "2025", color: "var(--lilac)", title: "삼성청년SW아카데미 (SSAFY) 13기 이수",
    desc: "소프트웨어 아키텍처와 인공지능 알고리즘을 실무 프로젝트 중심으로 학습하여 엔지니어링 역량을 내재화." },
  { id: "tl-ssafy-ambassador", group: "public", year: "2024", color: "var(--apple)", title: "삼성청년SW아카데미 (SSAFY) 홍보 앰배서더 활동",
    desc: "SSAFY 공식 홍보 앰배서더로 교육 과정과 성과를 콘텐츠로 알리고, 지원자 대상 커뮤니케이션과 대외 홍보 활동을 수행." },
  { id: "tl-army-startup", group: "honor", year: "2023", color: "var(--pink)", title: "육군창업경진대회 · 강원열린군대 창업프로그램 2군단장상 수상", proof: "gallery.html#cred-award-2023",
    desc: "軍·官·學 주관 2023 강원열린군대 스타트업 프로그램 성취도평가에서 팀 Home_Ally로 2위 입상(2023. 12. 31). HVAC 기술에 기반한 리스크 관리 아이디어를 제안하고, 비즈니스 모델의 타당성을 공식 심사에서 검증." },
  { id: "tl-army-training", group: "honor", year: "2023", color: "var(--sky)", title: "육군훈련소 최우수 분대 선정 · 훈련소장 상장 수상", proof: "gallery.html#cred-army-training-2023",
    desc: "기초군사훈련 과정에서 분대의 통솔과 임무 수행 성과를 인정받아 최우수 분대로 선정되었으며, 육군훈련소장(소장)의 상장을 수상." },
  { id: "tl-army-signal", group: "honor", year: "2022", color: "var(--lilac)", title: "육군정보통신학교장 상장 수상",
    desc: "軍 특성화고 현장실습 기간 중 희생정신과 학업성적 우수로 타의 모범이 되어 육군정보통신학교장(준장)으로부터 상장을 수상(2022. 7. 1, 제183호)." },
  { id: "tl-vattenfall", group: "public", year: "2022", color: "var(--butter)", title: "대구광역시교육청 · 독일 Vattenfall Berlin 해외 연수",
    desc: "독일 베를린에서 유럽 선진 기업의 에너지·인프라 운영 체계와 국제 실무 표준을 조기에 접한 경험." },
];

/* 현장 일지 — 청와대 청년의날 다음 장. 날짜 도장으로 잇는다 (성평등 공론장은 대외활동 목록에만) */
const DIARY = [
  { id: "dyl", date: "10.24", day: "SAT", tone: "navy", chip: "입학 · 진행 중",
    eyebrow: "Field Diary — 2026. 10. 24", title: "2026 민주청년지도자 양성과정 입학",
    body: "민주연구원이 주최·주관하는 ‘2026 민주청년지도자 양성과정’에 입학했습니다. 입학식에서 김민석 당대표·강득구 민주연구원장과 함께했고, 이광재 예산결산특별위원장의 특강에서 직접 질문했으며, 박홍근 기획예산처 장관과도 현장에서 함께했습니다. 청년의날에 들었던 정책의 언어를 이번에는 직접 배우고 토론하는 자리입니다.",
    facts: [["주최·주관", "민주연구원"], ["기간", "2026. 10. 24 – 12. 13"], ["함께", "김민석 당대표 · 강득구 민주연구원장 · 이광재 예산결산특별위원장 · 박홍근 기획예산처 장관"], ["상태", "수강 중"]],
    main: { name: "dyl-entrance", alt: "김유빈 활동 기록 — 2026 민주청년지도자 양성과정 입학식 현수막 앞에서 김민석 당대표와 함께", pos: "50% 33%", w: 675, h: 1200 },
    thumbs: [
      { name: "dyl-qa", href: "gallery.html#g-dyl-qa", alt: "김유빈 활동 기록 — 이광재 예산결산특별위원장의 특강에서 마이크를 잡고 질문하는 모습", pos: "38% 45%" },
      { name: "dyl-library", href: "gallery.html#g-dyl-library", alt: "김유빈 활동 기록 — 민주연구원 서가 앞에서 강득구 민주연구원장과 함께", pos: "50% 40%" },
      { name: "dyl-lecture", href: "gallery.html#g-dyl-lecture", alt: "김유빈 활동 기록 — 이광재 예산결산특별위원장의 특강을 마친 뒤 함께", pos: "45% 40%" },
    ],
    href: "gallery.html#dyl", cta: "입학식 사진 전체 보기" },
];

function FieldDiary() {
  return (
    <div className="diary">
      <p className="diary__lead font-ko"><span className="diary__pulse" aria-hidden="true" />청와대 청년의날, 그다음 장 — 현장 일지</p>
      {DIARY.map((d, i) => (
        <figure key={d.id} data-cine="pass" className={"tl-feature diary__item reveal diary--" + d.tone + (i % 2 ? " diary__item--rev" : "")}>
          <a className="tl-feature__main diary__main" href={d.href}>
            <Pic name={d.main.name} fallback={"images/" + d.main.name + ".jpg"} sizes="(max-width: 900px) 92vw, 52vw" alt={d.main.alt} loading="lazy" width={d.main.w || 1200} height={d.main.h || 675} style={{ objectPosition: d.main.pos }} />
            <span className="diary__stamp" aria-hidden="true"><b className="font-serif">{d.date}</b><i className="font-sans">{d.day} · 2026</i></span>
          </a>
          <figcaption className="tl-feature__body">
            <p className="eyebrow">{d.eyebrow} <span className="diary__chip font-sans">{d.chip}</span></p>
            <h3 className="font-ko">{d.title}</h3>
            <p className="font-ko">{d.body}</p>
            <dl className="diary__facts font-ko">
              {d.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
            <div className={"tl-feature__thumbs" + (d.thumbs.length === 2 ? " diary__thumbs--2" : "")}>
              {d.thumbs.map((t) => (
                <a key={t.name} href={t.href}><Pic name={t.name} fallback={"images/" + t.name + "-600.jpg"} sizes="(max-width: 900px) 30vw, 16vw" alt={t.alt} loading="lazy" width="600" height="338" style={{ objectPosition: t.pos }} /></a>
              ))}
            </div>
            <p className="tl-feature__credit font-sans">현장 사진</p>
            <a href={d.href} className="btn btn--ghost">{d.cta} <ArrowUpRight size={14} /></a>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/* 이력 그룹 — 핵심(실무·AI 교육)은 펼쳐 두고, 대외활동·수상은 눌러서 본다 */
const TRAJ_GROUPS = [
  { key: "work", en: "Professional", ko: "실무 경력", open: true },
  { key: "edu", en: "AI · Data Education", ko: "AI · 데이터 전문교육", open: true,
    order: ["tl-myongji", "tl-fintech", "tl-claude-rag", "tl-snu-aied", "tl-krema", "tl-konkuk", "tl-ssafy"] },
  { key: "public", en: "Leadership & Public", ko: "리더십 · 대외활동", open: false },
  { key: "honor", en: "Honors", ko: "수상 · 표창", open: false },
];

/* 연혁은 항상 최신순 — "Now" 가 맨 위 */
const tlYear = (e) => (e.year === "Now" ? 9999 : Number(e.year) || 0);

function TlRows({ rows }) {
  return (
    <div className="tl-list">
      {rows.map((e) => (
        <div key={e.id} id={e.id} className="tl-row">
          <span className="tl-year font-serif">{e.year}</span>
          <div className="tl-body">
            <h3 className="font-ko">
              {e.title}
              {e.tag && <span className="tl-tag font-sans">{e.tag}</span>}
            </h3>
            <p className="font-ko">{e.desc}</p>
            {e.proof && <a href={e.proof} className="tl-proof font-sans">{e.proofLabel || "상장 원본 보기"} <ArrowUpRight size={13} /></a>}
          </div>
        </div>
      ))}
    </div>
  );
}

function Trajectory() {
  const ref = useReveal();
  return (
    <section id="trajectory" ref={ref} style={{ position: "relative", padding: "clamp(80px,12vw,150px) 0" }}>
      <div className="wrap">
        <SectionHead eyebrow="04 — Experience" titleEn="The Trajectory" titleKo="이력 — 실무와 전문교육" />

        <figure className="tl-feature reveal" data-cine="pass">
          <a className="tl-feature__main" href="gallery.html#youth-day">
            <Pic name="youth-day-yonhap" fallback="images/youth-day-yonhap.jpg"
              sizes="(max-width: 900px) 92vw, 52vw" alt="김유빈 활동 기록 — 2026 청년의날 기념행사 현장 (연합뉴스 보도사진)" loading="lazy" width="860" height="592" />
          </a>
          <figcaption className="tl-feature__body">
            <p className="eyebrow">Highlight — 2026</p>
            <h3 className="font-ko">청와대 · 대통령 주관 2026 청년의날 기념행사 참석</h3>
            <p className="font-ko">
              청년 대표로 초청되어 ‘2026 청년의 날 오픈마이크’ 현장에 참석했습니다. 청년 정책의 방향과 현장의 과제를
              국정 최고 의사결정 단위에서 직접 듣고 교류한 기록입니다.
            </p>
            <div className="tl-feature__thumbs">
              <a href="gallery.html#g-youth-day-dialogue"><Pic name="youth-day-dialogue" fallback="images/youth-day-dialogue-600.jpg" sizes="(max-width: 900px) 30vw, 16vw" alt="김유빈 활동 기록 — 2026 청년의날 기념행사, 청년들 사이에서 마이크를 잡고 이야기하는 대통령" loading="lazy" width="600" height="800" style={{ objectPosition: "50% 42%" }} /></a>
              <a href="gallery.html#g-youth-day-venue"><Pic name="youth-day-venue" fallback="images/youth-day-venue-600.jpg" sizes="(max-width: 900px) 30vw, 16vw" alt="김유빈 활동 기록 — 2026 청년의날 기념행사, 청와대 행사장 전경" loading="lazy" width="600" height="450" /></a>
              <a href="gallery.html#g-youth-day-mbc-02"><Pic name="youth-day-mbc-02" fallback="images/youth-day-mbc-02-600.jpg" sizes="(max-width: 900px) 30vw, 16vw" alt="김유빈 활동 기록 — 2026 청년의 날 오픈마이크 생중계 화면" loading="lazy" width="600" height="338" /></a>
            </div>
            <p className="tl-feature__credit font-sans">사진 ⓒ연합뉴스 · 방송 화면 ⓒ전주MBC · 현장 사진 직접 촬영</p>
            <a href="gallery.html#youth-day" className="btn btn--ghost">현장 사진 전체 보기 <ArrowUpRight size={14} /></a>
          </figcaption>
        </figure>
        <FieldDiary />
        <div className="tl-groups">
          {TRAJ_GROUPS.map((g) => {
            const rows = (g.order
              ? g.order.map((id) => TRAJECTORY.find((e) => e.id === id))
              : TRAJECTORY.filter((e) => e.group === g.key)
            ).slice().sort((x, y) => tlYear(y) - tlYear(x));
            return (
              <div key={g.key} className="tl-group reveal">
                <div className="tl-group__label">
                  <p className="eyebrow">{g.en}</p>
                  <h3 className="font-ko">{g.ko}</h3>
                </div>
                {g.open ? <TlRows rows={rows} /> : (
                  <details className="fold tl-fold">
                    <summary>
                      <span className="fold__t">
                        <strong className="font-ko">{rows.length}건 펼쳐 보기</strong>
                        <span className="fold__line font-ko">{rows.slice(0, 3).map((e) => e.title.split(" ")[0]).join(" · ")} 외</span>
                      </span>
                      <i className="fold__icon" aria-hidden="true" />
                    </summary>
                    <TlRows rows={rows} />
                  </details>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ ARTIFACTS */
const EDITIONS = [
  { n: "09", color: "var(--sky)", Icon: Home, title: "청약·공공임대 맞춤 추천 서비스\n집캐치(ZipCatch)",
    desc: "청약홈 분양공고와 LH 임대공고를 공공데이터 API로 수집해, 지역·주거비·가구 조건을 3단계로 입력하면 지금 지원할 수 있는 후보를 정리해 주는 소비자 서비스. 관심공고 저장·마감 알림과 운영용 CRM(매칭·고객·물건 관리)까지 설계·구현.",
    status: "Vercel 배포 완료", cta: "서비스 바로가기", url: "https://zipcatch.vercel.app", tags: ["청약홈 · LH API", "맞춤 추천", "Supabase · CRM"],
    core: true, point: "자격·예산·선호 적합도·마감 긴급도를 한 점수로 섞지 않도록 분리 설계 — 미확인 자격은 불충족으로 단정하지 않고, 당첨 확률은 산출하지 않는다." },
  { n: "10", color: "var(--apple)", Icon: MapPin, title: "감정평가사 필드워크\n3D 실지조사 시뮬레이터",
    desc: "광화문에서 잠실까지 서울을 직접 걸으며 의뢰를 수행하는 3D 학습 게임. 의뢰 수임 → 현장조사 → 지적측량 → 토지이동 → 등기촉탁의 5단계를 그대로 따라가고, 조문 카드 24장과 지목 도감 28종을 장소에서 수집한다. 감정평가에 관한 규칙·공간정보관리법·건축법·민법 조문을 현장 상황에 붙여 기억하도록 설계.",
    status: "Vercel 배포 완료", cta: "필드워크 체험", url: "https://appraiser-fieldwork.vercel.app/", tags: ["Three.js · WebGL", "실지조사 5단계", "조문 24 · 지목 28"],
    point: "법조문을 글이 아니라 장소로 기억하게 만드는 것이 설계의 목표 — 서울의 실제 시간과 햇빛 아래에서 조사 절차를 몸으로 익힌다." },
  { n: "17", color: "var(--apple)", Icon: Cpu, title: "AI 에이전트 인력 운영 관제\nAtelier AX",
    desc: "AI 직원에게 업무를 배정하고, 실행 과정을 실시간으로 관찰하고, 산출물을 검증·승인하는 관제 대시보드. 라이브·업무·승인·인력·성과 5개 화면에서 도구 호출(웹 검색·파일 수정·코드 실행)과 하위 에이전트 위임·업무 인계, 정책 차단, 결재 대기를 사람이 일하는 사무실처럼 보여 준다. 서버 없이 브라우저 안에서만 도는 공개 시연 모드를 함께 제공. 2.0에서는 아이디어를 설명하면 AI 팀(기획·디자인·개발·검수)이 6단계로 일하는 과정을 쉬운 말로 보여 주고 범위·설계·검토·공개 4곳에서 사용자 승인을 받는 ‘프로젝트 스튜디오’를 더했다.",
    status: "Vercel 배포 완료", cta: "관제 화면 보기", url: "https://atelier-ax.vercel.app/performance/", tags: ["AI Agent 관제", "프로젝트 스튜디오", "승인 워크플로"],
    core: true, point: "에이전트가 한 일을 사람이 검증·승인해야 끝나는 구조 — 시연 모드의 가상 활동은 실제 성과 지표에 합산하지 않는다." },
  { n: "12", color: "var(--sky)", Icon: LayoutGrid, title: "국민용 국정 상황판\n국정 한눈에",
    desc: "대통령 동정·대통령실·정부 정책·국무회의와 국회, 증시·환율·부동산·산업까지 국정과 경제를 한 화면에 모은 상황판. 공개 뉴스 RSS와 시세를 서버리스 함수가 모아 섹션별로 배정하고, 중복 기사를 걸러 언론사 원문 사진과 함께 보여준다. 섹션 필터·검색, 지수 추이 스파크라인, 라이트·다크 모드 지원.",
    status: "Vercel 배포 완료", cta: "상황판 보기", url: "https://gukjeong-hannune.vercel.app/", tags: ["공개 RSS · 시세 수집", "Vercel Serverless", "외부 라이브러리 0"],
    core: true, point: "수집이 실패해도 화면이 비지 않게 — CDN 20분 캐시와 stale-while-revalidate로 즉시 응답하고, 실패하면 저장된 스냅샷으로 대체. 포털은 기사를 옮겨 실을 뿐 매체가 아니므로 출처·언론사 수에서 뺐다." },
  { n: "11", color: "var(--pink)", Icon: Quote, title: "성경 말씀 × 인문학 서재\nSalvation",
    desc: "\"지금, 어떤 마음이신가요?\"에서 시작해 마음 상태·주제별로 성경 말씀과 인문학·철학의 문장을 이어 주는 서재형 PWA. 오늘의 말씀, 말씀·인문학 서재, 묵상 노트·기도 제목·말씀 암송·통독 진도를 쌓는 '나의 성소', 마스코트 등불이(시편 119:105)가 안내하는 상담 챗봇까지 설계·구현.",
    status: "Vercel 배포 완료", cta: "서재 둘러보기", url: "https://malsseum-guwon.vercel.app/", tags: ["PWA · 오프라인", "Supabase 동기화", "위기 신호 안전장치"],
    point: "챗봇이 위기 신호를 감지하면 해석·성찰 대화를 즉시 멈추고 109·1577-0199 등 24시간 상담 기관을 먼저 안내 — 입력 문장은 저장하지 않고 감지 사실만 남긴다." },
  { n: "16", color: "var(--lilac)", Icon: Scale, title: "법조 시장 상황판\n법조시장 한눈에",
    desc: "정비사업·사건 수요·변호사 공급·입법·규제·로펌 경쟁을 한 화면에 모아 로펌 전략팀이 바로 전략 판단으로 옮기도록 만든 법조 시장 상황판. 열린국회정보 발의 법률안, 국가법령정보센터 시행 예정 법령·판례, 대한변협 지방회별 회원현황을 하루 단위로 갱신하고, 민법 기간 계산 조문에 맞춘 기한 계산기를 함께 제공.",
    status: "Vercel 배포 완료", cta: "상황판 보기", url: "https://legal-pulse-pearl.vercel.app", tags: ["국회 · 법제처 · 대한변협", "Next.js · 일 단위 갱신", "기한 계산기"],
    core: true, point: "출처 없는 예시 수치는 넣지 않는다 — 인증키가 없거나 수집에 실패한 값은 '인증키 필요'·'불러오지 못함'과 이유를 그대로 보여 주고, 지방회 합계가 맞지 않으면 화면에 올리지 않는다." },
  { n: "13", color: "var(--butter)", Icon: LayoutGrid, title: "식재료·생활용품 살림 기록 서비스\n곳간(Gotgan)",
    desc: "주문 화면이나 영수증을 찍으면 식재료 보관 기한과 생활용품 재구매 시점을 셈해 알려 주는 자취생·주부용 살림 기록 서비스. 구역별 곳간, 자동 장보기, 월별 가계, 달력 알림까지 설계·구현.",
    status: "Vercel 배포 완료", cta: "서비스 바로가기", url: "https://gotgan-three.vercel.app", tags: ["사진 판독 · Claude API", "PWA · 오프라인", "서버리스 보안 설계"],
    point: "구매자용 주문 API가 없어 사진을 입력으로 택하고, 판독은 Claude API → 브라우저 OCR → 붙여넣기로 폴백 — 살림 기록은 서버에 남기지 않는다." },
  { n: "14", color: "var(--pink)", Icon: Sparkle, title: "K-뷰티 성분 처방 서비스\n성분관(Seongbun)",
    desc: "6문항 피부 진단으로 성분 18종을 점수화해 서울·도쿄·뉴욕의 루틴 철학별로 3–5종을 처방하는 웹 서비스. 루틴 체크, 2주 간격 도입 플랜, 레이어링 궁합표, 성분 사전을 KO / EN으로 제공.",
    status: "Vercel 배포 완료", cta: "진단 시작하기", url: "https://seongbun.vercel.app", tags: ["피부 진단 · 성분 18종", "KO / EN", "프레임워크 0"],
    point: "자극 조합과 한꺼번에 시작하는 습관이 문제 — 하나씩 들이는 일정과 궁합표로 원인을 추적하게 했다." },
  { n: "15", color: "var(--lilac)", Icon: Newspaper, title: "YouTube 커뮤니티 기능 제안서\nProject Plaza",
    desc: "Google Korea(YouTube)를 독자로 쓴 PRD 형식의 외부 기능 제안서. 댓글을 관계의 입구로 바꾸는 4개 기능, 한국 우선 파일럿, Premium·Lite 패키징, HEART 지표와 실험 설계를 담았다.",
    status: "Vercel 배포 완료", cta: "제안서 읽기", url: "https://yubin-project-plaza.vercel.app", tags: ["PRD · CUJ · HEART", "실험 설계", "1분 요약 모드"],
    point: "DM이 앱 밖 초대 링크로만 시작된다는 점에서 출발 — 기능보다 ‘대화를 시작할 이유’를 제안했다." },
  { n: "01", color: "var(--butter)", Icon: Newspaper, title: "6·3 지방선거\nAI 카드뉴스 & 시네마틱 영상",
    desc: "GPT Image-2, Suno AI, ElevenLabs를 결합하여 2026 전국동시지방선거 결과를 분석·시각화한 인스타그램 카드뉴스 6종과 내레이션 영상. 사회학적 분석을 2030 세대의 소비 포맷으로 옮긴 생성형 AI 미디어 작업.",
    status: "Google Drive 스트리밍 자산 구축 완료", cta: "영상 바로 보기", url: "https://drive.google.com/file/d/1k4BcuFz671SajLydfRs5gMRFG2Hu3RWj/view?usp=sharing", video: "video/edition-04.mp4", tags: ["GPT Image-2", "Suno AI", "ElevenLabs"] },
  { n: "02", color: "var(--lilac)", Icon: Sparkle, title: "Veo 3 × Google Vids\n르엘 성수 브랜드 필름",
    desc: "Google Vids의 Veo 3 모델을 활용하여 주거 브랜드 '르엘 성수'의 공간 가치를 영상 언어로 구성한 브랜드 필름. 텍스트 프롬프트만으로 영상을 생성·편집하여 부동산 영상 제작 과정을 간소화.",
    status: "Google Drive 스트리밍 자산 구축 완료", cta: "홍보 영상 보기", url: "https://drive.google.com/file/d/1NQRlbAKrxlap8Nfdec3hAdx0pN3ewDhN/view?usp=sharing", video: "video/edition-05.mp4", tags: ["Veo 3", "Google Vids", "Brand Film"] },
  { n: "03", color: "var(--sky)", Icon: Award, title: "Louis Vuitton & 시네마틱 캠페인 필름",
    desc: "메종 루이비통의 헤리티지와 장인정신을 절제된 무드의 시네마틱 광고로 재해석한 브랜드 캠페인 필름. 텍스트 프롬프트 기반의 생성형 AI만으로 럭셔리 광고 특유의 질감과 격조를 구현.",
    status: "Google Drive 스트리밍 자산 구축 완료", cta: "캠페인 영상 보기", url: "https://drive.google.com/file/d/1mIEmvwjPfZwuXYZRkWW9FzZU3uvCUq69/view?usp=sharing", video: "video/edition-06.mp4", tags: ["Veo 3", "Google Vids", "Luxury Film"] },
  { n: "04", color: "var(--pink)", Icon: PlayCircle, title: "Hyperframe × ElevenLabs\n멀티미디어 프로모션",
    desc: "복수의 생성형 AI 도구를 활용하여 부동산 청약 데이터와 플랫폼 사용성을 대중이 이해하기 쉽도록 구성한 영상·오디오 브랜딩 프로젝트.",
    status: "Google Drive 스트리밍 자산 구축 완료", cta: "프로모션 영상 보기", url: "https://drive.google.com/file/d/1F3PssuwdFkcWaiT6fZHgQlz44As0I2nq/view?usp=sharing", video: "video/edition-03.mp4", tags: ["Generative AI", "Video", "Audio Branding"] },
  { n: "05", color: "var(--sky)", Icon: BarChart, title: "공공데이터 API 활용\n청약 인사이트 대시보드",
    desc: "청약홈 OpenAPI로 분양정보·지역별 경쟁률·당첨자 가점 통계를 모으고, AI 당첨 확률 계산기와 청약 핫플레이스 지도를 더한 시장 대시보드.",
    status: "Vercel 배포 · 데모 종료", cta: "공개 데모 종료", url: "", tags: ["청약홈 OpenAPI", "Dashboard", "Data Viz"],
    point: "시장 판단에 필요한 지표만 골라 나란히 배치 — 무엇을 병렬할지가 곧 분석의 설계." },
  { n: "06", color: "var(--apple)", Icon: Cpu, title: "고객 메일 자동 분류 시스템\n— 급한 메일부터 알려 줍니다",
    desc: "회사로 들어오는 고객 메일을 자동으로 모아 '지금 답할 것 · 오늘 안에 볼 것 · 광고처럼 넘겨도 되는 것'으로 나눠 보여 주는 업무 화면. 담당자는 위에서부터 차례로 처리하면 됩니다.",
    status: "Vercel 배포 완료", cta: "시스템 바로가기", url: "https://mail-dashboard-blue-six.vercel.app", tags: ["구글 업무도구 연동", "자동 분류", "업무 화면"],
    core: true, point: "무엇을 '급함'으로 볼지 기준은 사람이 정하고, 1차 분류만 컴퓨터에 맡겼습니다." },
  { n: "07", color: "var(--apple)", Icon: Mail, title: "네이버웍스 메일 연동\n급여명세서 자동 발송 프로그램",
    desc: "네이버웍스(NAVER WORKS) 메일 API와 연동하여 급여명세서의 생성과 발송을 자동화한 사내 업무 프로그램. 반복되던 급여 명세 발송 절차를 표준화하여 처리 시간을 단축하고 오류 가능성을 축소.",
    status: "사내 운영 적용", cta: "사내 운영 · 비공개", url: "", tags: ["NAVER WORKS", "메일 자동화", "업무 자동화"],
    core: true, point: "반복되던 발송 절차를 표준화해 처리 시간을 줄이고 오류 가능성을 축소." },
];

/* 화면에 보이는 순서와 번호 — 실생활·실무 시스템 7건을 먼저, 학습·콘텐츠·제안 작업은 "그 밖의 작업"에 */
const EDITION_ORDER = ["09", "16", "17", "12", "06", "07", "10", "14", "11", "15", "13", "05", "01", "02", "03", "04"];
const EDITIONS_SHOWN = EDITION_ORDER.map((n, i) => ({ ...EDITIONS.find((e) => e.n === n), no: String(i + 1).padStart(2, "0") }));

function EditionCard({ e, i, onPlay, onStage }) {
  const [more, setMore] = React.useState(false); /* 폰에서 설명 4줄만 보이고 펼친다 */
  return (
            <article id={"ed-" + e.n} data-tilt={e.core ? "" : undefined} className={"edition reveal" + (e.core ? " edition--core" : "")} style={{ "--accent-fill": e.color, transitionDelay: `${i * 90}ms` }}>
              <div className="edition__chip">{e.status}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <span className="edition__num">{e.no}</span>
                <span style={{ width: 52, height: 52, borderRadius: 16, background: e.color, display: "grid", placeItems: "center", color: "var(--ink)" }}>
                  <e.Icon size={24} />
                </span>
              </div>
              <span className="edition__index-band" />
              <p className="font-play" style={{ fontSize: ".78rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-soft)", margin: "16px 0 6px" }}>Edition {e.no}</p>
              <h3 className="font-ko" style={{ fontWeight: 800, fontSize: "clamp(1.3rem,2vw,1.55rem)", lineHeight: 1.28, margin: "0 0 14px", whiteSpace: "pre-line", letterSpacing: "-.01em" }}>{e.title}</h3>
              <p className={"font-ko edition__desc" + (more ? " is-open" : "")} style={{ color: "var(--ink-soft)", lineHeight: 1.72, fontSize: ".96rem", flexGrow: 1 }}>{e.desc}</p>
              <button type="button" className="edition__more font-sans" aria-expanded={more} onClick={() => setMore(!more)}>{more ? "접기" : "더 보기"}</button>
              {e.point && <p className="edition__point font-ko"><b>컨설팅 포인트</b>{e.point}</p>}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, margin: "18px 0 22px" }}>
                {e.tags.map((t) => <span key={t} className="font-sans" style={{ fontSize: ".72rem", fontWeight: 600, padding: ".32em .7em", borderRadius: 999, border: "1.5px solid var(--ink)", color: "var(--ink)" }}>{t}</span>)}
              </div>
              <div className="edition__acts">
              {THEATERS[e.n] && onStage && (
                <button type="button" className="btn edition__stage" aria-haspopup="dialog"
                  onClick={(ev) => onStage(e, ev.currentTarget.closest("article"))}>
                  작동 원리 펼쳐 보기 <Layers size={16} />
                </button>
              )}
              {e.video ? (
                <button type="button" className="btn" style={{ alignSelf: "flex-start" }} onClick={() => onPlay(e)}>
                  {e.cta} <PlayCircle size={16} />
                </button>
              ) : e.url ? (
                <a href={e.url} target="_blank" rel="noreferrer" className="btn" style={{ alignSelf: "flex-start" }}>
                  {e.cta} <ExternalLink size={16} />
                </a>
              ) : (
                <span className="btn btn--ghost" style={{ alignSelf: "flex-start", cursor: "default", pointerEvents: "none" }}>{e.cta}</span>
              )}
              </div>
            </article>
  );
}

/* ============================================================ AX DESK — 법무법인 경국 */
/* 정비사업의 법률·경제 위험을 다루는 사내 AX. 의뢰인·사건 정보와 사내 화면은 공개하지 않고 문제 정의와 구조만 보인다 */
const AX_CASES = [
  { id: "ax-reintel", no: "01", icon: "§", title: "법이 바뀌면 바로 알려 주는 시스템", en: "RE:INTELLIGENCE · 정비사업 법률 리스크 관제",
    problem: "법령·고시가 바뀐 걸 늦게 알면 분쟁과 사업 지연으로 이어집니다.",
    solve: "사업지 주소를 기준으로 법령·고시·행정 공고의 변화를 모아, 그 사업의 어느 단계에 영향이 있는지 정리해 변호사에게 올립니다.",
    effect: "변호사가 먼저 검토할 변경사항을 바로 고릅니다.",
    before: "담당자가 사이트를 하나씩 찾아봄", after: "자동 수집 → 단계별 정리 → 변호사 검토" },
  { id: "ax-assembly", no: "02", icon: "✓", title: "총회 전에 ‘무효 위험’을 찾는 시스템", en: "ASSEMBLY RISK ENGINE · 조합 총회결의 하자 검증",
    problem: "소집 통지·정족수·의결권 중 하나만 틀려도 총회 결의가 효력 다툼에 휘말립니다.",
    solve: "통지, 조합원 명부, 의결권, 정족수, 안건별 결과를 서로 맞대어 보고 틀린 곳을 표시합니다.",
    effect: "총회 전에 다시 확인할 안건과 명부를 특정합니다.",
    before: "서류를 사람이 한 장씩 대조", after: "규칙으로 자동 대조 → 위험 지점 표시" },
  { id: "ax-contract", no: "03", icon: "⇄", title: "계약서에서 바뀐 조항만 짚어 주는 시스템", en: "CONTRACT RISK INTELLIGENCE · 계약변경 AI Redline",
    problem: "공사비 증액과 계약 조항 변경은 곧바로 조합원이 낼 돈의 문제가 됩니다.",
    solve: "바뀌기 전·후 공사도급계약서를 나란히 비교해 공사비, 지급조건, 책임 조항의 변화와 분쟁 소지를 표시합니다.",
    effect: "협상 전에 불리하게 바뀐 조항을 특정합니다.",
    before: "두 계약서를 눈으로 비교", after: "조항별 자동 비교 → 비용·책임 영향 표시" },
];
const AX_SUPPORT = [
  { id: "ax-compensation", tag: "실무", title: "광명시흥 3기 신도시 보상자료 분석", desc: "보상 관련 발표자료 77장을 만들며 감정평가 → 보상협의 → 재결로 이어지는 절차와 쟁점을 정리했습니다." },
];

/* AX 조립 장면 — 흩어진 법령·서류·계약서가 스크롤에 따라 세 갈래 체계로 모인다. 진행도(--cp)는 cine.js 가 쓴다 */
const AXA_COLS = [
  { x: 18, k: "§", t: "법령 · 고시 감시", items: ["법령 개정", "고시 변경", "행정 공고", "조례 개정"], node: "사업 단계 매핑", out: "변호사 검토" },
  { x: 50, k: "✓", t: "총회 하자 검증", items: ["소집 통지", "조합원 명부", "의결권", "정족수"], node: "규칙 대조", out: "하자 위험 표시" },
  { x: 82, k: "⇄", t: "계약변경 비교", items: ["계약서 v1", "계약서 v2", "공사비 조항", "지급 조건"], node: "조항 대조", out: "비용 · 책임 영향" },
];
/* 시작 위치는 고정된 의사난수 — 프리렌더와 브라우저가 같은 값을 그려야 한다 */
const axaSeed = (n) => { const x = Math.sin(n * 91.7) * 43758.5453; return x - Math.floor(x); };

/* 4막 — I 흩어짐: 서로 다른 깊이에 떠 있는 자료 · II 모임: 곡선을 그리며 세 갈래로 정렬
 *       III 처리: 선이 이어지고 단계마다 확인 표시 · IV 사람의 판단: 자동 처리와 변호사 판단의 경계 */
const AXA_ACTS = ["흩어짐", "모임", "처리", "사람의 판단"];
/* 깊은 곳에 떠 있는 빈 서류 — 1막의 공간감을 만들고, 모일 때 더 깊이 물러나 사라진다 */
const AXA_GHOSTS = Array.from({ length: 7 }, (_, i) => ({
  "--gx": (axaSeed(i + 300) * 96 + 2).toFixed(1), "--gy": (axaSeed(i + 340) * 74 + 8).toFixed(1),
  "--gz": (-(axaSeed(i + 380) * 700 + 200)).toFixed(0), "--gr": ((axaSeed(i + 420) - 0.5) * 80).toFixed(0),
}));
function AxAssembly() {
  let n = 0;
  return (
    <div className="axa" data-cine="pin">
      <p className="sr-only">흩어진 법령·총회 서류·계약서를 규칙으로 모아 세 갈래(법령 감시 · 총회 하자 검증 · 계약변경 비교)로 처리하고, 마지막 판단은 변호사가 내리는 구조를 보여 주는 장면입니다.</p>
      <div className="axa__sticky" aria-hidden="true">
        <div className="axa__stage">
          <i className="axa__light" />
          <div className="axa__frame">
          <p className="axa__cap axa__cap--1 font-ko">법령 · 총회 서류 · 계약서가 흩어져 있습니다</p>
          <p className="axa__cap axa__cap--2 font-ko">규칙에 따라 세 갈래로 모이고</p>
          <p className="axa__cap axa__cap--3 font-ko">단계마다 기준과 대조합니다</p>
          <p className="axa__cap axa__cap--4 font-ko">마지막 판단은 변호사가 내립니다</p>
          <div className="axa__world">
            {AXA_GHOSTS.map((g, gi) => <i key={"g" + gi} className="axa__ghost" style={g} />)}
            {AXA_COLS.map((c, ci) => (
              <React.Fragment key={c.t}>
                <span className="axa__head font-ko" style={{ "--x": c.x, "--ci": ci }}><b>{c.k}</b>{c.t}</span>
                {c.items.map((it, ii) => {
                  n += 1;
                  const sz = (axaSeed(n + 120) - 0.6) * 520;
                  const st = { "--sx": (axaSeed(n) * 90 + 5).toFixed(1), "--sy": (axaSeed(n + 40) * 66 + 10).toFixed(1),
                    "--sr": ((axaSeed(n + 80) - 0.5) * 70).toFixed(0), "--sz": sz.toFixed(0), "--far": Math.max(0, -sz / 320).toFixed(2),
                    "--ar": ((axaSeed(n + 160) - 0.5) * 24).toFixed(1), "--ex": c.x, "--ey": 20 + ii * 7.6, "--ii": ii, "--ci": ci };
                  return <span key={it} className={"axa__doc font-ko axa__doc--" + ci} style={st}><small className="font-serif">{c.k}</small>{it}</span>;
                })}
                <i className="axa__w axa__w--1" style={{ "--x": c.x, "--ci": ci }}><b /></i>
                <span className="axa__node font-ko" style={{ "--x": c.x, "--ci": ci }}>{c.node}</span>
                <i className="axa__w axa__w--2" style={{ "--x": c.x, "--ci": ci }} />
                <span className="axa__out font-ko" style={{ "--x": c.x, "--ci": ci }}>{c.out}</span>
                <i className="axa__w axa__w--3" style={{ "--x": c.x, "--ci": ci }} />
              </React.Fragment>
            ))}
            <div className="axa__line font-sans"><span>자동 처리 ▲</span><span>▼ 사람의 판단</span></div>
            <div className="axa__judge font-ko"><b>최종 판단</b> 변호사가 검토하고 확정합니다</div>
          </div>
          <ol className="axa__acts font-sans">
            {AXA_ACTS.map((a, i) => <li key={a}><b>{["I", "II", "III", "IV"][i]}</b>{a}</li>)}
          </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 사례 무대 안의 가상 시연 — 실제 사업지·의뢰인·계약 자료가 아니다 */
function AxDemo({ id }) {
  const [split, setSplit] = React.useState(50);
  const [run, setRun] = React.useState(0);
  if (id === "ax-reintel") {
    const src = ["국가법령정보", "지자체 고시", "행정 공고", "조합 공개자료"];
    const alerts = [["조례 개정", "사업시행계획 단계", "검토 필요"], ["고시 변경", "관리처분 단계", "영향 확인"], ["행정 공고", "조합설립 단계", "참고"]];
    return (
      <div className="axdemo axdemo--a">
        <div className="axdemo__src">{src.map((s, i) => <span key={s} style={{ "--i": i }}>{s}</span>)}</div>
        <div className="axdemo__core font-sans">사업지 주소 기준 · 단계 매핑</div>
        <ul className="axdemo__alerts font-ko">
          {alerts.map((a, i) => <li key={a[0]} style={{ "--i": i }}><b>{a[0]}</b><span>{a[1]}</span><em>{a[2]}</em></li>)}
        </ul>
      </div>
    );
  }
  if (id === "ax-assembly") {
    const cols = ["소집 통지", "의사정족수", "의결정족수", "의결권 확인"];
    const rows = [["안건 1 · 정관 변경", [1, 1, 1, 1]], ["안건 2 · 예산안", [1, 1, 0, 1]], ["안건 3 · 임원 선임", [1, 1, 1, 0]], ["안건 4 · 용역 계약", [1, 1, 1, 1]]];
    return (
      <div className="axdemo axdemo--b" key={run}>
        <table className="axdemo__mx font-ko">
          <thead><tr><th>안건</th>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>{rows.map(([r, v], ri) => (
            <tr key={r}><th>{r}</th>{v.map((ok, ci) => <td key={ci} className={ok ? "ok" : "ng"} style={{ "--i": ri * 4 + ci }}>{ok ? "✓" : "확인 필요"}</td>)}</tr>
          ))}</tbody>
        </table>
        <button type="button" className="btn btn--ghost axdemo__run" onClick={() => setRun(run + 1)}>검증 다시 실행</button>
      </div>
    );
  }
  const v1 = [["제○조 공사비", "도급금액은 계약 시 확정한다."], ["제○조 지급 조건", "기성은 매월 정산해 지급한다."], ["제○조 책임", "설계 변경 비용은 수급인이 부담한다."]];
  const v2 = [["제○조 공사비", "물가 변동 시 도급금액을 조정할 수 있다.", "비용 증가 가능"], ["제○조 지급 조건", "기성은 매월 정산해 지급한다."], ["제○조 책임", "설계 변경 비용은 도급인이 부담한다.", "부담 주체 이전"]];
  const drag = (ev) => {
    const r = ev.currentTarget.getBoundingClientRect();
    setSplit(Math.round(Math.max(0, Math.min(100, ((ev.clientX - r.left) / r.width) * 100))));
  };
  const col = (rows, tag) => (
    <div className="axdemo__doc font-ko"><span className="axdemo__ver font-sans">{tag}</span>
      {rows.map((r) => <p key={r[0]} className={r[2] ? "chg" : ""}><b>{r[0]}{r[2] && <i className="font-sans">{r[2]}</i>}</b>{r[1]}</p>)}</div>
  );
  return (
    <div className="axdemo axdemo--c">
      <div className="axdemo__cmp" style={{ "--split": split + "%" }}
        onPointerDown={(ev) => { ev.currentTarget.setPointerCapture(ev.pointerId); drag(ev); }}
        onPointerMove={(ev) => { if (ev.buttons || ev.pointerType === "touch") drag(ev); }}>
        {col(v1, "변경 전")}
        <div className="axdemo__over">{col(v2, "변경 후")}</div>
        <i className="axdemo__handle" aria-hidden="true" />
      </div>
      <p className="axdemo__sum font-ko" aria-live="polite">{split < 50 ? <span>바뀐 조항 <b>2곳</b> — 공사비 조정 · 설계 변경 비용 부담</span> : <span>손잡이를 왼쪽으로 끌면 바뀐 계약서가 덮입니다</span>}</p>
      <label className="axdemo__range font-sans">← 변경 전 · 변경 후 →
        <input type="range" min="0" max="100" value={split} onChange={(ev) => setSplit(+ev.target.value)} aria-label="변경 전후 비교 위치" />
      </label>
    </div>
  );
}

function AxDesk() {
  const [open, setOpen] = React.useState(null);
  const cards = React.useRef({});
  const panel = React.useRef(null);
  const closeBtn = React.useRef(null);
  const closing = React.useRef(false);
  /* FLIP — 누른 카드의 자리에서 무대가 펼쳐진다 */
  React.useEffect(() => {
    if (!open) return;
    closing.current = false;
    flipFrom(cards.current[open], panel.current, false).then(() => closeBtn.current && closeBtn.current.focus({ preventScroll: true }));
  }, [open]);
  const close = () => {
    if (closing.current) return;
    closing.current = true;
    flipFrom(cards.current[open], panel.current, true).then(() => setOpen(null));
  };
  useStageDialog(!!open, panel, close);
  const cur = AX_CASES.find((c) => c.id === open);
  return (
    <div className="axd reveal" id="ax-desk" aria-labelledby="ax-desk-title">
      <div className="axd__head">
        <p className="axd__eyebrow font-sans"><i aria-hidden="true" />법무법인 경국 · AX 프로젝트</p>
        <h3 id="ax-desk-title" className="font-ko">재개발·재건축 사업이 <em>법 · 총회 · 계약</em> 문제로 멈추지 않게</h3>
        <p className="axd__lead font-ko">위험은 시스템이 먼저 찾고, 판단은 변호사가 내립니다. 사내에 직접 구축한 세 가지입니다.</p>
      </div>
      <AxAssembly />
      <div className="axd__grid">
        {AX_CASES.map((c) => (
          <article key={c.id} id={c.id} className="axd__case" data-tilt="" ref={(n) => { cards.current[c.id] = n; }} tabIndex={-1}>
            <div className="axd__top"><span className="axd__icon font-serif" aria-hidden="true">{c.icon}</span><span className="axd__no font-serif">{c.no}</span></div>
            <h4 className="axd__title font-ko">{c.title}</h4>
            <p className="axd__en font-sans">{c.en}</p>
            <dl className="axd__rows font-ko">
              <div><dt>문제</dt><dd>{c.problem}</dd></div>
              <div><dt>해결</dt><dd>{c.solve}</dd></div>
              <div className="axd__eff"><dt>효과</dt><dd>{c.effect}</dd></div>
            </dl>
            <div className="axd__ba font-ko">
              <span><b>전</b>{c.before}</span>
              <span><b>후</b>{c.after}</span>
            </div>
            <div className="axd__foot">
              <p className="axd__state font-sans">사내 구축 · 화면 비공개</p>
              <button type="button" className="axd__open font-sans" onClick={() => setOpen(c.id)} aria-haspopup="dialog">작동 방식 펼쳐 보기 <ArrowUpRight size={13} /></button>
            </div>
          </article>
        ))}
      </div>
      <div className="axd__sub">
        {AX_SUPPORT.map((c) => {
          const Tag = c.href ? "a" : "div";
          return (
            <Tag key={c.id} id={c.id} className="axd__mini" {...(c.href ? { href: c.href } : {})}>
              <span className="axd__mtag font-sans">{c.tag}</span>
              <strong className="font-ko">{c.title}</strong>
              <span className="axd__mdesc font-ko">{c.desc}</span>
            </Tag>
          );
        })}
      </div>
      <p className="axd__note font-ko">의뢰인·사건 정보와 사내 화면은 공개하지 않습니다.</p>
      {cur && ReactDOM.createPortal(
        <div className="axs" role="dialog" aria-modal="true" aria-labelledby="axs-title" onClick={close}>
          <div className="axs__panel" ref={panel} onClick={(ev) => ev.stopPropagation()}>
            <button type="button" className="axs__close font-sans" ref={closeBtn} onClick={close} aria-label="닫기">닫기 ✕</button>
            <p className="axs__eyebrow font-sans">AX {cur.no} · {cur.en}</p>
            <h3 id="axs-title" className="font-ko">{cur.title}</h3>
            <div className="axs__body">
              <div className="axs__demo">
                <AxDemo id={cur.id} />
                <p className="axs__fic font-ko">위 화면은 구조를 보여 주는 <b>가상 시연</b>입니다. 실제 사업지·의뢰인·계약 자료가 아닙니다.</p>
              </div>
              <dl className="axs__facts font-ko">
                <div><dt>문제</dt><dd>{cur.problem}</dd></div>
                <div><dt>내 역할</dt><dd>문제 정의 · 검토 규칙 설계 · 시스템 구축</dd></div>
                <div><dt>방식</dt><dd>{cur.solve}</dd></div>
                <div><dt>효과</dt><dd>{cur.effect}</dd></div>
                <div><dt>상태</dt><dd>법무법인 경국 사내 구축 · 실제 화면과 자료는 비공개</dd></div>
              </dl>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* 무대(대화상자) 공통 — 스크롤 잠금 · 뒤 화면 inert · 초점 가두기 · Esc 닫기 · 닫으면 연 자리로 초점 복귀.
 * 무대는 document.body 에 붙으므로(portal) #root 전체를 inert 로 만들어도 무대는 살아 있다. */
function useStageDialog(open, panelRef, onClose) {
  const closeRef = React.useRef(onClose);
  closeRef.current = onClose;
  React.useEffect(() => {
    if (!open) return;
    const opener = document.activeElement;
    const root = document.getElementById("root");
    const html = document.documentElement;
    html.classList.add("axs-lock");
    if (root) root.inert = true;
    const onKey = (ev) => {
      if (ev.key === "Escape") { ev.preventDefault(); closeRef.current(); return; }
      const box = panelRef.current;
      if (ev.key !== "Tab" || !box) return;
      const f = Array.prototype.filter.call(
        box.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'),
        (n) => n.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1], cur = document.activeElement;
      if (!box.contains(cur)) { ev.preventDefault(); first.focus(); }
      else if (ev.shiftKey && cur === first) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && cur === last) { ev.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      html.classList.remove("axs-lock");
      if (root) root.inert = false;
      if (opener && opener.focus && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [open]);
}
const prefersCalm = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
/* FLIP — a(원래 자리)에서 b(무대)로. reverse 면 무대가 원래 자리로 돌아간다 */
function flipFrom(card, el, reverse) {
  if (!card || !el || !el.animate || prefersCalm()) { if (el) el.style.opacity = "1"; return Promise.resolve(); }
  const a = card.getBoundingClientRect(), b = el.getBoundingClientRect();
  const from = `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`;
  const kf = [{ transform: from, opacity: .7 }, { transform: "none", opacity: 1 }];
  return el.animate(reverse ? kf.slice().reverse() : kf, { duration: reverse ? 420 : 680, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" }).finished.catch(() => {});
}

/* ============================================================ 제품 극장 — 카드가 무대로 펼쳐지고, 실제 화면이 층층이 열린다
 * 화면은 2026. 11. 4. 각 서비스의 공개 화면을 그대로 캡처한 것(images/product). 기능 설명은 작업 카드에 적힌 사실만. */
const THEATERS = {
  "09": {
    name: "ZipCatch", url: "https://zipcatch.vercel.app", open: "집캐치 열기",
    cap: "2026. 11. 4. 실제 서비스 화면 캡처 — 화면 속 공고와 숫자는 캡처 시점의 공개 데이터입니다.",
    ruleT: "추천 원칙",
    rule: "자격 · 예산 · 선호 적합도 · 마감 긴급도를 한 점수로 섞지 않고 따로 보여 줍니다. 확인되지 않은 자격은 불충족으로 단정하지 않고, 당첨 확률은 계산하지 않습니다.",
    layers: [
      { img: "zc-home", k: "첫 화면", t: "지금 열려 있는 공고를 지도와 숫자로", d: "청약홈 분양공고와 LH 임대공고를 공공데이터 API로 모아, 지역별로 열려 있는 공고 수와 가장 가까운 마감을 먼저 보여 줍니다." },
      { img: "zc-analyze", k: "조건 입력", t: "지역 · 주거비 · 가구 조건을 차례로", d: "가입 없이 조건을 단계별로 고르면, 그 조건으로 지금 지원할 수 있는 후보를 추립니다." },
      { img: "zc-map", k: "지도 탐색", t: "보이는 범위의 공고를 바로 옆 목록으로", d: "범위(서울 · 수도권 · 전국)를 고르면 지도에 공고가 표시되고, 보이는 범위의 공고가 목록으로 정리됩니다." },
      { img: "zc-notices", k: "후보 정리", t: "마감이 가까운 순으로, 조건별로 걸러서", d: "지역 · 유형 필터로 후보를 좁히고, 관심공고 저장과 마감 알림으로 이어집니다." },
    ],
  },
  "17": {
    name: "Atelier AX", url: "https://atelier-ax.vercel.app/", open: "관제 화면 열기",
    cap: "2026. 11. 4. 공개 시연 모드 화면 캡처 — 화면 속 직원과 업무는 시연용 가상 데이터입니다.",
    ruleT: "운영 원칙",
    rule: "에이전트가 한 일은 사람이 검증 · 승인해야 끝납니다. 시연 모드의 가상 활동은 실제 성과 지표에 합산하지 않습니다.",
    layers: [
      { img: "ax-live", k: "라이브", t: "AI 직원이 일하는 모습을 사무실처럼", d: "출근 · 작업 · 대기 상태와 진행 단계를 한 화면에서 봅니다. 공개 시연 모드는 서버 없이 이 브라우저 안에서만 돕니다." },
      { img: "ax-missions", k: "업무", t: "지시한 업무가 단계별로 넘어가는 과정", d: "업무를 지시하면 담당 직원 사이로 단계가 넘어가고, 도구 호출(웹 검색 · 파일 수정 · 코드 실행)과 인계가 실행 기록으로 남습니다." },
      { img: "ax-approvals", k: "승인", t: "사람이 승인해야 끝나는 지점", d: "정책에 걸린 작업과 결재가 필요한 산출물은 승인 센터에서 사람이 검증 · 승인합니다." },
      { img: "ax-performance", k: "성과", t: "처리 · 승인 · 반려를 직원별로", d: "종료된 업무와 최종 승인 · 반려를 직원별로 집계합니다." },
    ],
  },
};

function TheaterShot({ name, alt }) {
  const set = (ext) => `images/product/${name}-720.${ext} 720w, images/product/${name}-1280.${ext} 1280w`;
  return (
    <picture>
      <source type="image/avif" srcSet={set("avif")} sizes="(max-width: 860px) 92vw, 62vw" />
      <source type="image/webp" srcSet={set("webp")} sizes="(max-width: 860px) 92vw, 62vw" />
      <img src={`images/product/${name}-1280.webp`} alt={alt} width="1280" height="800" decoding="async" draggable="false" />
    </picture>
  );
}

/* 펼침 --f(0 접힘 → 1 층층이 펼침)와 집중 --q(0 전체 → 1 한 층 정면)를 rAF 로 직접 쓴다 — 드래그는 곧바로 반영 */
function ProductTheater({ ed, card, onClose }) {
  const T = THEATERS[ed.n];
  const surf = React.useRef(null), stage = React.useRef(null), range = React.useRef(null), closeBtn = React.useRef(null);
  const v = React.useRef({ f: 0, q: 0 }), anim = React.useRef({});
  const [sel, setSel] = React.useState(-1);
  const busy = React.useRef(false);
  const put = (k, x) => {
    v.current[k] = x;
    if (stage.current) stage.current.style.setProperty("--" + k, x.toFixed(3));
    if (k === "f" && range.current) range.current.value = String(Math.round(x * 100));
  };
  const tween = (k, to, ms) => new Promise((done) => {
    cancelAnimationFrame(anim.current[k]);
    if (prefersCalm()) { put(k, to); done(); return; }
    const a = v.current[k], t0 = performance.now();
    const step = (t) => {
      const u = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - u, 3);
      put(k, a + (to - a) * e);
      if (u < 1) anim.current[k] = requestAnimationFrame(step); else done();
    };
    anim.current[k] = requestAnimationFrame(step);
  });
  React.useEffect(() => {
    if (card) card.classList.add("is-staged");
    put("f", 0); put("q", 0);
    flipFrom(card, surf.current, false).then(() => {
      if (closeBtn.current) closeBtn.current.focus({ preventScroll: true });
      return tween("f", 1, 1200);
    });
    return () => { Object.values(anim.current).forEach(cancelAnimationFrame); if (card) card.classList.remove("is-staged"); };
  }, []);
  const pick = async (i) => {
    if (busy.current) return;
    busy.current = true;
    if (v.current.q > 0) await tween("q", 0, 380);
    setSel(i);
    if (i >= 0) { if (v.current.f < 1) await tween("f", 1, 420); await tween("q", 1, 620); }
    busy.current = false;
  };
  const close = async () => {
    if (busy.current === "closing") return;
    busy.current = "closing";
    if (v.current.q > 0) await tween("q", 0, 260);
    await tween("f", 0, 420);
    await flipFrom(card, surf.current, true);
    onClose();
  };
  useStageDialog(true, surf, close);
  /* 직접 조작 — 무대를 옆으로 끌면 접고 편다. 끌지 않고 놓으면 그 층을 정면으로 */
  const drag = React.useRef(null);
  const down = (ev) => {
    if (ev.button > 0) return;
    drag.current = { x: ev.clientX, f: v.current.f, moved: false, w: ev.currentTarget.clientWidth };
    ev.currentTarget.setPointerCapture(ev.pointerId);
  };
  const move = (ev) => {
    const d = drag.current;
    if (!d) return;
    if (Math.abs(ev.clientX - d.x) > 6) {
      if (!d.moved) { d.moved = true; cancelAnimationFrame(anim.current.f); if (v.current.q > 0) pick(-1); }
      put("f", Math.max(0, Math.min(1, d.f + (ev.clientX - d.x) / (d.w * 0.55))));
    }
  };
  const up = (ev) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.moved) return;
    const hit = document.elementFromPoint(ev.clientX, ev.clientY);
    const layer = hit && hit.closest && hit.closest("[data-layer]");
    if (layer) { const i = +layer.getAttribute("data-layer"); pick(sel === i ? -1 : i); }
  };
  const cur = sel >= 0 ? T.layers[sel] : null;
  const order = T.layers.map((l, i) => i).reverse(); /* 접혔을 때 첫 화면이 맨 위에 오도록 뒤에서부터 그린다 */
  return ReactDOM.createPortal(
    <div className="pth" role="dialog" aria-modal="true" aria-labelledby="pth-title" onClick={close}>
      <div className="pth__surface" ref={surf} onClick={(ev) => ev.stopPropagation()}>
        <div className="pth__in">
          <div className="pth__stage" ref={stage} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { drag.current = null; }}>
            <div className={"pth__stack" + (sel >= 0 ? " has-sel" : "")}>
              {order.map((i) => {
                const L = T.layers[i];
                return (
                  <div key={L.img} data-layer={i} className={"pth__layer" + (i === sel ? " is-sel" : "")} style={{ "--i": i }}>
                    <TheaterShot name={L.img} alt={`${T.name} ${L.k} 화면 — ${L.t}`} />
                    <span className="pth__tag font-sans"><b>{String(i + 1).padStart(2, "0")}</b>{L.k}</span>
                  </div>
                );
              })}
            </div>
            <p className="pth__hint font-sans" aria-hidden="true">← 끌어서 접고 펴기 · 화면을 누르면 정면으로 →</p>
          </div>

          <aside className="pth__side">
            <button type="button" className="pth__close font-sans" ref={closeBtn} onClick={close}>닫기 ✕</button>
            <p className="pth__eyebrow font-sans">Edition {ed.no} · {T.name}</p>
            <h3 id="pth-title" className="font-ko">{ed.title.split("\n")[0]}</h3>
            <ol className="pth__list">
              {T.layers.map((L, i) => (
                <li key={L.img}>
                  <button type="button" aria-pressed={i === sel} onClick={() => pick(sel === i ? -1 : i)}>
                    <b className="font-serif">{String(i + 1).padStart(2, "0")}</b>
                    <span className="font-ko"><em>{L.k}</em>{L.t}</span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="pth__detail font-ko" aria-live="polite">
              {cur ? <p><b>{cur.k}</b>{cur.d}</p> : <p><b>{T.ruleT}</b>{T.rule}</p>}
            </div>
            <label className="pth__fold font-sans">접기 ↔ 펼치기
              <input ref={range} type="range" min="0" max="100" defaultValue="0" aria-label="화면 층 펼치기"
                onChange={(ev) => { cancelAnimationFrame(anim.current.f); put("f", +ev.target.value / 100); }} />
            </label>
            <div className="pth__foot">
              <a className="btn" href={T.url} target="_blank" rel="noreferrer">{T.open} <ExternalLink size={15} /></a>
              <p className="pth__cap font-ko">{T.cap}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Artifacts() {
  const ref = useReveal();
  const [playing, setPlaying] = React.useState(null);
  const [staged, setStaged] = React.useState(null); /* { e, card } — 제품 극장 */
  const vframe = React.useRef(null);
  useStageDialog(!!playing, vframe, () => setPlaying(null));
  return (
    <React.Fragment>
    <section id="artifacts" ref={ref} style={{ position: "relative", padding: "clamp(80px,12vw,150px) 0", background: "var(--ecru-deep)" }}>
      <div className="wrap">
        <SectionHead eyebrow="03 — Selected Works" titleEn="The Artifacts" titleKo="AI 전략 · 자동화 프로젝트" />
        <p className="works-lead font-ko reveal">
          맨 위는 법무법인 경국에서 정비사업의 법률·경제 위험을 다루는 <strong>AX 현황판</strong>, 그 아래는 직접 정의하고 구현해 <strong>배포하거나 사내 업무에 적용한 시스템 {EDITIONS.filter((e) => e.core).length}건</strong>입니다.
          학습용 시뮬레이터, 개인 프로젝트, 제안서와 생성형 AI 콘텐츠는 아래에서 따로 펼쳐 볼 수 있습니다.
        </p>
        <AxDesk />
        <div className="works-grid">
          {EDITIONS_SHOWN.filter((e) => e.core).map((e, i) => (
            <EditionCard key={e.n} e={e} i={i} onPlay={setPlaying} onStage={(ed, card) => setStaged({ e: ed, card })} />
          ))}
        </div>
        {staged && <ProductTheater ed={staged.e} card={staged.card} onClose={() => setStaged(null)} />}
        <details className="fold works-more reveal">
          <summary>
            <span className="fold__t">
              <span className="eyebrow">Supplementary</span>
              <strong className="font-ko">그 밖의 작업 <em>{EDITIONS.filter((e) => !e.core).length}건</em></strong>
              <span className="fold__line font-ko">감정평가사 필드워크 · 성분관 · Salvation · Project Plaza · 청약 대시보드 · 생성형 AI 영상</span>
            </span>
            <i className="fold__icon" aria-hidden="true" />
          </summary>
          <div className="works-grid works-grid--sub">
            {EDITIONS_SHOWN.filter((e) => !e.core).map((e, i) => (
              <EditionCard key={e.n} e={e} i={i} onPlay={setPlaying} />
            ))}
          </div>
        </details>
      </div>
    </section>

    {playing && ReactDOM.createPortal(
      <div className="vlightbox" onClick={() => setPlaying(null)} role="dialog" aria-modal="true" aria-label={playing.title.replace("\n", " · ")}>
        <div className="vlightbox__frame" ref={vframe} onClick={(ev) => ev.stopPropagation()}>
          <button type="button" className="vlightbox__close" onClick={() => setPlaying(null)} aria-label="닫기">✕</button>
          <div className="vlightbox__meta">
            <span className="font-play">Edition {playing.no}</span>
            <h4 className="font-ko">{playing.title.replace("\n", " · ")}</h4>
          </div>
          <video className="vlightbox__video" src={playing.video} controls autoPlay playsInline preload="metadata" controlsList="nodownload">
            브라우저가 영상 재생을 지원하지 않습니다.
          </video>
          {playing.url ? (
            <a className="vlightbox__fallback font-sans" href={playing.url} target="_blank" rel="noreferrer">영상이 보이지 않으면 원본 링크로 보기 →</a>
          ) : null}
        </div>
      </div>
    , document.body)}
    </React.Fragment>
  );
}

/* ============================================================ LECTURES */
/* 강의 의뢰는 챗봇 신청서(chatbot.js · data-lecture-consult)로 연다. 스크립트가 없을 때만 개인 메일로 열린다 */
const LECTURE_MAILTO = "mailto:yubin120866@gmail.com?subject=";
function Lectures() {
  const ref = useReveal();
  return (
    <section id="lectures" ref={ref} className="side-practice" style={{ position: "relative", padding: "clamp(80px,12vw,150px) 0" }}>
      <div className="speckle" style={{ opacity: .22 }} />
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        <SectionHead eyebrow="Side Practice — Lectures" titleEn="The Lectures" titleKo="AI · 부동산 강의 프로그램" />

        <div className="side-note reveal">
          <span className="side-note__badge font-sans">In Preparation</span>
          <p className="font-ko">
            본업은 <strong>AI 전략 컨설팅</strong>입니다. 강의는 실무에서 직접 만들고 운영한 경험을 나누기 위해
            <strong> 별도로 설계한 프로그램</strong>으로, 아직 출강 이력은 없습니다.
            커리큘럼과 근거를 먼저 공개해 두고, 첫 강의가 진행되면 이력에 연도와 함께 추가하겠습니다. <strong>강의 의뢰는 언제든 받습니다.</strong>
          </p>
        </div>

        <div className="lec-intro reveal">
          <p className="font-myeongjo">
            만들어 본 사람만 가르칠 수 있는 것이 있습니다.
          </p>
          <p className="font-ko lec-intro__sub">
            SSAFY 13기의 엔지니어링 훈련, 서울대 AIED 4기의 프롬프트 아키텍처와 교수법,
            KREMA 4기의 시장 데이터 전략 — 배운 것을 실제로 만들어 운영해 본 뒤에 강의 모듈로 옮겼습니다.
            현재 AI 두 트랙과 부동산·자산관리 한 트랙, 열두 과정의 커리큘럼을 설계해 두었습니다.
          </p>
        </div>

        {LECTURE_TRACKS.map((tr) => (
          <div key={tr.key} className="lec-track">
            <div className="lec-track__head reveal">
              <span className="lec-track__label font-sans">{tr.label}</span>
              <h3 className="font-ko">{tr.ko}</h3>
              <p className="font-ko">{tr.desc}</p>
            </div>
            <details className="fold lec-fold">
              <summary>
                <span className="fold__t">
                  <strong className="font-ko">과정 {LECTURES.filter((l) => l.track === tr.key).length}개 보기</strong>
                  <span className="fold__line font-ko">{LECTURES.filter((l) => l.track === tr.key).map((l) => l.title.split(" — ")[0]).join(" · ")}</span>
                </span>
                <i className="fold__icon" aria-hidden="true" />
              </summary>
            <div className="lec-grid">
              {LECTURES.filter((l) => l.track === tr.key).map((l, i) => (
                <article key={l.id} id={l.id} className="lec-card reveal" style={{ "--accent-fill": l.color, transitionDelay: `${i * 70}ms` }}>
                  <div className="lec-card__head">
                    <span className="lec-card__n font-cond">{l.n}</span>
                    <span className="lec-card__icon" style={{ background: l.color }}><l.Icon size={20} /></span>
                  </div>
                  <h3 className="font-ko">{l.title}</h3>
                  <p className="lec-card__lead font-ko">{l.lead}</p>
                  <dl className="lec-card__meta font-ko">
                    <div><dt>대상</dt><dd>{l.who}</dd></div>
                    <div><dt>구성</dt><dd>{l.hours}</dd></div>
                  </dl>
                  <ul className="lec-card__mods font-ko">
                    {l.modules.map((m) => <li key={m}>{m}</li>)}
                  </ul>
                  <p className="lec-card__basis font-ko"><GraduationCap size={14} /> {l.basis}</p>
                  <div className="lec-card__links">
                    <a href={l.proof.href} className="lec-card__proof font-sans">
                      {l.proof.label} <ArrowUpRight size={14} />
                    </a>
                    <a href={"lecture.html#" + l.id} className="lec-card__proof font-sans">
                      과정 상세 <ArrowUpRight size={14} />
                    </a>
                  </div>
                  <a href={LECTURE_MAILTO + encodeURIComponent("[강의 의뢰] " + l.n + " " + l.title.split(" — ")[0])}
                    className="lec-card__ask font-sans" data-lecture-consult={l.id}>이 과정 의뢰하기 <span aria-hidden="true">→</span></a>
                </article>
              ))}
            </div>
            </details>
          </div>
        ))}

        <div className="lec-basis reveal">
          <div className="menu-rule" style={{ marginBottom: 22 }}><i /></div>
          <p className="eyebrow" style={{ color: "var(--ink-soft)", marginBottom: 22 }}>무엇을 근거로 가르치는가</p>
          <div className="lec-basis__grid">
            {LECTURE_BASIS.map(([t, d]) => (
              <div key={t} className="lec-basis__item">
                <strong className="font-ko">{t}</strong>
                <span className="font-ko">{d}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 30, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href={LECTURE_MAILTO + encodeURIComponent("[강의 의뢰]")} className="btn" data-lecture-consult=""><Mail size={16} /> 강의 의뢰하기</a>
            <a href="lecture.html" className="btn btn--ghost">과정별 상세 보기 <ArrowUpRight size={15} /></a>
            <a href="career.html#lectures" className="btn btn--ghost">강의 역량 상세 <ArrowUpRight size={15} /></a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ ABOUT — 스크롤 스토리
 * 섹션이 화면에 고정된 동안 스크롤 진행도(0→1)에 따라 문장이 한 줄씩 켜지고,
 * 오른쪽 사진이 프로필 → 발표 → 청년의날 순으로 바뀐다. 좁은 화면·모션 최소화 환경에서는 일반 배치. */
const STORY_LINES = ["판단의 근거를 만들고,", "실행까지 책임지는", "자리에서 일합니다."];
const STORY_SHOTS = [
  { name: "profile-yubin", src: "images/profile-yubin-450.jpg?v=1", srcSet: "images/profile-yubin-450.jpg?v=1 450w, images/profile-yubin.jpg?v=1 896w",
    alt: "김유빈 — 법무법인 경국 공식 프로필", chip: "Profile", cap: "김유빈 · Yubin Kim — 법무법인 경국" },
  { name: "ssafy-presentation", src: "images/ssafy-presentation-700.jpg", srcSet: "images/ssafy-presentation-500.jpg 500w, images/ssafy-presentation-700.jpg 700w, images/ssafy-presentation.jpg 1016w",
    alt: "김유빈 활동 기록 — 삼성청년SW아카데미(SSAFY) 13기 프로젝트 발표", chip: "SSAFY 13기", cap: "프로젝트 아키텍처 발표" },
  { name: "youth-day-selfie", src: "images/youth-day-selfie-600.jpg", pos: "30% 50%",
    alt: "김유빈 — 2026 청년의날 기념행사에서 대통령과 함께한 셀프 촬영", chip: "Youth Day 2026", cap: "청와대 청년의날 — 대통령과 함께" },
];

/* 소개 — 한 편의 다큐멘터리처럼. 진행도 --p(0~1) 하나로 세 장면이 이어진다.
 * 다음 사진은 액자 안에서 옆으로 열리며(가면을 transform 으로 — clip-path 없음) 들어오고,
 * 앞 사진은 카메라가 지나가듯 커지며 반대쪽으로 밀려난다. 글은 같은 진행도로 함께 움직인다.
 * 넓은 화면: 섹션이 고정된 동안 진행 · 좁은 화면: 액자가 화면을 지나가는 동안 진행 */
function About() {
  const ref = React.useRef(null);
  const frameRef = React.useRef(null);
  const mediaRef = React.useRef(null);
  const [stage, setStage] = React.useState({ lines: 0, body: false });
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const wide = window.matchMedia("(min-width: 901px)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    const on = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        let p = 1;
        if (!calm.matches) {
          const vh = window.innerHeight;
          if (wide.matches) {
            const r = el.getBoundingClientRect(), span = r.height - vh;
            p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1;
          } else if (frameRef.current) {
            const f = frameRef.current.getBoundingClientRect();
            p = Math.min(1, Math.max(0, (vh * 0.9 - f.top) / (vh * 0.9)));
          }
        }
        if (mediaRef.current) mediaRef.current.style.setProperty("--p", p.toFixed(4)); /* 사진 쪽에만 — 섹션 전체 재계산을 피한다 */
        let lines = 0;
        for (let i = 0; i < STORY_LINES.length; i++) if (p >= 0.04 + i * 0.12) lines = i + 1;
        const body = p >= 0.42;
        setStage((st) => (st.lines === lines && st.body === body ? st : { lines, body }));
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, []);
  const lineOn = (i) => i < stage.lines;
  /* 장면 i 의 들어옴(--in)·나감(--out) — 앞 장면의 나감이 곧 다음 장면의 들어옴 */
  const io = (i) => ({ "--in": i === 0 ? "1" : `var(--u${i})`, "--out": i === STORY_SHOTS.length - 1 ? "0" : `var(--u${i + 1})` });

  return (
    <section id="about" ref={ref} className="story">
      <div className="story__sticky">
        <div className="wrap story__grid">
          <div className="story__copy">
            <p className="eyebrow">01 — Profile</p>
            <h3 className="story__lead font-myeongjo">
              {STORY_LINES.map((l, i) => <span key={l} className={"story__line" + (lineOn(i) ? " on" : "")}>{l}</span>)}
            </h3>
            <div className={"story__body" + (stage.body ? " on" : "")}>
              <p className="font-ko">
                흩어진 시장·업무 데이터를 모아 무엇을 먼저 할지 정하고, 그 결정을 자동화와 콘텐츠로 실행에 옮깁니다.
                법률과 데이터를 대중이 이해하는 언어로 옮기는 일도 같은 자리에서 합니다.
              </p>
              <p className="signature font-script" aria-hidden="true">Yubin Kim</p>
              <p className="story__addr font-ko"><MapPin size={15} /> 서울 서초구 서초대로 264 법조타워 15F — 법무법인 경국</p>
              <div className="story__links">
                <a href="career.html" className="btn">경력 상세 <ArrowUpRight size={15} /></a>
                <a href="gallery.html" className="btn btn--ghost">활동 갤러리 <ArrowUpRight size={15} /></a>
              </div>
            </div>
          </div>

          <div className="story__media" ref={mediaRef}>
            <div className="story__frame" ref={frameRef}>
              {STORY_SHOTS.map((m, i) => (
                <div key={m.name} className="story__shot" style={io(i)}>
                  <div className="story__shot-in">
                    <Pic name={m.name} fallback={m.src} className="story__img"
                      sizes="(max-width: 900px) 88vw, 34vw" alt={m.alt} loading="lazy" style={m.pos ? { objectPosition: m.pos } : undefined} />
                  </div>
                </div>
              ))}
              <span className="story__count font-sans" aria-hidden="true"><b>01</b><b>02</b><b>03</b><i>/ 03</i></span>
            </div>
            <div className="story__caps">
              {STORY_SHOTS.map((m, i) => (
                <p key={m.chip} className="story__cap" style={io(i)}>
                  <span className="font-sans">{String(i + 1).padStart(2, "0")} · {m.chip}</span>
                  <em className="font-ko">{m.cap}</em>
                </p>
              ))}
            </div>
            <div className="story__prog" aria-hidden="true"><i /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ CONTACT + FOOTER */
function Contact() {
  const ref = useReveal();
  return (
    <section id="contact" ref={ref} style={{ position: "relative", background: "var(--ink)", color: "var(--ecru)", padding: "clamp(40px,7vw,84px) 0 0", overflow: "hidden" }}>
      <div className="contact-photo" aria-hidden="true"><Pic name="footer-seoul" fallback="images/footer-seoul-1000.jpg?v=2" sizes="100vw" loading="lazy" /></div>
      <div className="contact-photo__scrim" aria-hidden="true" />
      <div className="seal" aria-hidden="true">
        <svg viewBox="0 0 120 120">
          <defs>
            <path id="sealArc" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" fill="none" />
          </defs>
          <circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="60" cy="60" r="32" fill="none" stroke="currentColor" strokeWidth="0.9" />
          <text fontSize="9.2" letterSpacing="2.2" fill="currentColor" fontFamily="Inter, Pretendard, sans-serif" fontWeight="600">
            <textPath href="#sealArc">AI STRATEGY · CONSULTING · SEOUL · YUBIN KIM ·</textPath>
          </text>
          <text x="60" y="68.5" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontWeight="600" fontSize="26" fill="currentColor">YK</text>
        </svg>
      </div>
      <div className="wrap reveal" style={{ position: "relative", zIndex: 2, textAlign: "center", paddingBottom: "clamp(70px,10vw,120px)" }}>
        <p className="signature signature--light font-script" aria-hidden="true">Yubin Kim</p>
        <p className="eyebrow contact-eyebrow">Inquiries — 채용 및 협업 제안</p>
        <h2 className="font-serif contact-title">
          Let’s define<br /><em>the next problem.</em>
        </h2>
        <p className="font-ko" style={{ color: "rgba(249,246,240,.7)", maxWidth: 560, margin: "26px auto 40px", lineHeight: 1.7, fontSize: "1.05rem" }}>
          AI 전략 컨설팅 · 업무 자동화 · 데이터 기반 서비스 컨설팅 포지션의 제안을 기다립니다.<br />이메일로 연락 주시면 성실히 회신드리겠습니다.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="mailto:ybkim@gyunggook.com" className="btn" style={{ background: "var(--ecru)", color: "var(--ink)", borderColor: "var(--ecru)" }}>
            <Mail size={16} /> 이메일 보내기
          </a>
          <a href="career.html" className="btn btn--ghost" style={{ color: "var(--ecru)", borderColor: "var(--ecru)", boxShadow: "none" }}>
            경력 상세 <ArrowUpRight size={14} />
          </a>
          <button type="button" id="copyMail" className="btn btn--ghost" style={{ color: "var(--ecru)", borderColor: "var(--ecru)", boxShadow: "none" }}>
            이메일 주소 복사
          </button>
          <a href="yubin-kim.vcf" download="yubin-kim.vcf" className="btn btn--ghost" style={{ color: "var(--ecru)", borderColor: "var(--ecru)", boxShadow: "none" }}>
            연락처 저장
          </a>
          <button type="button" id="shareSite" className="btn btn--ghost" style={{ color: "var(--ecru)", borderColor: "var(--ecru)", boxShadow: "none" }}>
            포트폴리오 공유
          </button>
        </div>
      </div>
      <Footer />
    </section>
  );
}

/* ============================================================ CHANNELS — 기록·홍보 채널(PR) */
/* 최근 글은 각 채널 공식 RSS 에서 2026-10-23 에 옮겨 적은 것(제목·날짜·주소 원문 그대로). 팔로워 수 등 확인하지 않은 수치는 쓰지 않는다. */
const CH_ICON = {
  ig: <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>,
  nb: <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor"><path d="M4 4h4.6l6.8 9.6V4H20v16h-4.6L8.6 10.4V20H4z" /></svg>,
  ts: <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor"><circle cx="6" cy="6" r="2.6" /><circle cx="12" cy="6" r="2.6" /><circle cx="18" cy="6" r="2.6" /><circle cx="12" cy="12" r="2.6" /><circle cx="12" cy="18" r="2.6" /></svg>,
};
const CHANNELS = [
  { k: "nb", name: "네이버 블로그", handle: "blog.naver.com/yubinxe", url: "https://blog.naver.com/yubinxe", tone: "#03A94D", label: "현장과 사유",
    pitch: "AI 전략기획 · 청년정책. 법무법인에서 AI로 업무를 자동화하며, 부동산·정책 현장의 질문과 독서·예술의 사유를 기록합니다.",
    tags: ["현장과 사유", "정책·도시 분석", "전시와 예술", "영화와 시선"],
    posts: [["청와대에서 보낸 청년의날 행사, 한 달 뒤 다시 생각하는 청년정책과 기억들", "2026.10.21", "https://blog.naver.com/yubinxe/224449296593"],
      ["한경 집코노미 2026 부스 참여 후기 — 직접 개발한 부동산 관련 서비스를 코엑스 현장에서 선보이다", "2026.10.19", "https://blog.naver.com/yubinxe/224446565096"],
      ["트렌드 코리아 2027 발표회 후기 — AI를 활용하여 무엇을 위해 어떻게 만들어낼 것인가", "2026.10.12", "https://blog.naver.com/yubinxe/224439232761"]] },
  { k: "ts", name: "티스토리", handle: "yubinxe.tistory.com", url: "https://yubinxe.tistory.com/", tone: "#E8501E", label: "대외 활동",
    pitch: "현장에서 보고 들은 것을 적고, 판단의 근거로 다시 접목합니다. AI 전략 기획 · 청년 정책 · 재테크 및 부동산.",
    tags: ["대외 활동", "청년 활동", "SSAFY"],
    posts: [["트렌드 코리아 2027 김난도 교수 키워드 발표회 후기 — ALPHA SHEEP과 10대 키워드", "2026.10.11", "https://yubinxe.tistory.com/4"],
      ["국민통합위원회 국민 대토론회 후기 — 단 2시간 만에 AI로 청년 자산 정책 설계 및 제안서 작성, PPT 제작 후 발표까지", "2026.10.02", "https://yubinxe.tistory.com/3"]] },
  { k: "ig", name: "Instagram", handle: "@yubinxe", url: "https://www.instagram.com/yubinxe/", tone: "#C13584", label: "AI 비주얼",
    pitch: "생성형 AI로 만든 카드뉴스와 시네마틱 영상을 올립니다. 분석을 2030 세대가 실제로 보는 형식으로 옮기는 채널입니다.",
    tags: ["AI 카드뉴스", "시네마틱 영상", "브랜드 필름"],
    posts: [["6·3 지방선거 AI 카드뉴스 6종 & 내레이션 영상 — GPT Image-2 · Suno AI · ElevenLabs", "작업물", "#ed-01"]] },
];
function Channels() {
  const ref = useReveal();
  return (
    <section id="channels" ref={ref} className="ch-sec" style={{ position: "relative", padding: "clamp(80px,12vw,150px) 0" }}>
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        <SectionHead eyebrow="Media & PR — Channels" titleEn="The Channels" titleKo="기록 · 홍보 채널" />
        <p className="ch-lede font-myeongjo reveal">현장에서 보고, 만들고, 기록합니다. <span>일한 과정과 생각은 세 채널에 먼저 올라옵니다.</span></p>
        <div className="ch-grid">
          {CHANNELS.map((c, i) => (
            <article key={c.k} className={"ch-card reveal" + (i === 0 ? " ch-card--lead" : "")} style={{ "--ch": c.tone, transitionDelay: `${i * 90}ms` }}>
              <header className="ch-head">
                <span className="ch-ico">{CH_ICON[c.k]}</span>
                <div><b className="font-ko">{c.name}</b><small className="font-sans">{c.handle}</small></div>
                <span className="ch-label font-sans">{c.label}</span>
              </header>
              <p className="ch-pitch font-ko">{c.pitch}</p>
              <ul className="ch-tags font-sans" aria-label={c.name + " 분류"}>{c.tags.map((t) => <li key={t}>{t}</li>)}</ul>
              {c.k === "ig" && <a className="ch-mosaic" href="#ed-01" aria-label="6·3 지방선거 AI 카드뉴스 6종 — 작업 카드로 이동">{[1, 2, 3, 4, 5, 6].map((j) => <span key={j} className="font-sans"><b>CARD</b>0{j}</span>)}</a>}
              <ol className="ch-posts" aria-label={c.name + " 최근 글"}>
                {c.posts.map(([t, d, u]) => (
                  <li key={t}><a href={u} {...(u.startsWith("#") ? {} : { target: "_blank", rel: "noopener" })} className="font-ko"><time className="font-sans">{d}</time><span>{t}</span></a></li>
                ))}
              </ol>
              <a className="ch-cta font-sans" href={c.url} target="_blank" rel="me noopener">{c.name} 방문 <ArrowUpRight size={15} /></a>
            </article>
          ))}
        </div>
        <p className="ch-note font-sans reveal">최근 글은 각 채널 RSS 기준(2026.10.23) · 채널 이름을 누르면 새 창에서 열립니다.</p>
      </div>
    </section>
  );
}

/* 본인이 운영하는 공개 채널 — index.html Person.sameAs 와 같은 목록을 유지한다(test/seo.test.mjs). */
const OFFICIAL_CHANNELS = [
  ["GitHub", "https://github.com/yubinxe"],
  ["Instagram", "https://www.instagram.com/yubinxe/"],
  ["티스토리", "https://yubinxe.tistory.com/"],
  ["네이버 블로그", "https://blog.naver.com/yubinxe"],
];

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(249,246,240,.18)", position: "relative", zIndex: 2 }}>
      <div className="wrap f-links font-sans" style={{ display: "flex", flexWrap: "wrap", gap: "10px 26px", paddingTop: 22 }}>
        {[["소개", "#about"], ["역량", "#composite"], ["프로젝트", "#artifacts"], ["이력", "#trajectory"], ["강의", "#lectures"], ["채널", "#channels"], ["갤러리", "gallery.html"], ["경력 상세", "career.html"]].map(([t, h]) => (
          <a key={t} href={h}>{t}</a>
        ))}
        {OFFICIAL_CHANNELS.map(([t, h]) => (
          <a key={h} href={h} rel="me noopener" target="_blank">{t}</a>
        ))}
        <a href="mailto:ybkim@gyunggook.com" style={{ marginLeft: "auto" }}>ybkim@gyunggook.com</a>
      </div>
      <div className="wrap footer-grid" style={{ paddingTop: 26, paddingBottom: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifySelf: "start" }} className="font-serif">
          <span style={{ fontWeight: 900, fontSize: 22 }}>YK</span>
          <span className="font-ko" style={{ fontSize: ".82rem", color: "rgba(249,246,240,.6)", fontFamily: '"Pretendard", sans-serif', fontWeight: 400 }}>김유빈 · Yubin Kim — AI Strategy &amp; Consulting</span>
        </div>
        <div className="font-sans" style={{ fontSize: ".78rem", color: "rgba(249,246,240,.5)", justifySelf: "center", textAlign: "center" }}>© 2026 Yubin Kim. All rights reserved.</div>
        <a href="#top" className="font-sans" style={{ fontSize: ".8rem", color: "var(--ecru)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, justifySelf: "end" }}>
          맨 위로 <span style={{ display: "inline-block", transform: "rotate(-45deg)" }}><ArrowUpRight size={15} /></span>
        </a>
      </div>
    </footer>
  );
}

/* ---------- shared section header ---------- */
/* 'The Composite' → 관사만 가는 이탤릭으로 — 클래식 표제의 리듬 */
function splitTitle(t) {
  const m = /^(The|At a)\s+(.+)$/.exec(t);
  return m ? <React.Fragment><em className="sh-art">{m[1]}</em>{m[2]}</React.Fragment> : t;
}
function SectionHead({ eyebrow, titleEn, titleKo }) {
  return (
    <div className="reveal">
      <div className="menu-rule" style={{ marginBottom: 26 }}><i /></div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <p className="eyebrow" style={{ color: "var(--ink-soft)", marginBottom: 14 }}>{eyebrow}</p>
          <h2 className="font-serif" style={{ fontWeight: 900, fontSize: "clamp(2.4rem,6vw,5rem)", lineHeight: .95, letterSpacing: "-.03em", margin: 0 }}>{splitTitle(titleEn)}</h2>
        </div>
        <p className="font-ko" style={{ fontWeight: 600, fontSize: "clamp(1rem,1.6vw,1.2rem)", color: "var(--ink-soft)", whiteSpace: "nowrap", flexShrink: 0, paddingBottom: ".4em" }}>{titleKo}</p>
      </div>
    </div>
  );
}

Object.assign(window, { Nav, Hero, Marquee, Composite, Ledger, Trajectory, Artifacts, EditionCard, Lectures, Channels, About, Contact, Footer, SectionHead });
