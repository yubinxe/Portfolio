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
    ["강의", "#lectures"], ["갤러리", "gallery.html"], ["경력 상세", "career.html"],
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
            <small>AI Strategy &amp; Planning</small>
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
function Hero() {
  const ref = useReveal();
  return (
    <section id="manifesto" ref={ref} style={{ position: "relative", minHeight: "100svh", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: 90, paddingBottom: 150 }}>
      <div className="hero-photo" aria-hidden="true">
        <Pic name="hero-gangnam" fallback="images/hero-gangnam-1000.jpg?v=1" sizes="100vw" fetchpriority="high" />
      </div>
      <div className="hero-photo__scrim" aria-hidden="true" />

      <div className="wrap reveal" style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
        <div className="menu-rule" style={{ maxWidth: 210, margin: "0 auto 18px" }}><i /></div>
        <p className="font-sans hero-kicker">Seoul · Portfolio 2026</p>
        <p className="eyebrow hero-eyebrow">AI Strategy &amp; Planning</p>
        <h1 className="font-serif" style={{ fontWeight: 900, lineHeight: .84, letterSpacing: "-.03em", fontSize: "clamp(3.4rem, 12.5vw, 10.5rem)", margin: 0 }}>
          <span className="sr-only">김유빈 Yubin Kim — AI 전략기획</span>
          {"YUBIN".split("").map((c, i) => <span key={i} className="h-ltr" style={{ animationDelay: `${120 + i * 55}ms` }}>{c}</span>)}
          <br />
          {"KIM".split("").map((c, i) => <span key={`k${i}`} className="h-ltr" style={{ animationDelay: `${120 + (i + 6) * 55}ms` }}>{c}</span>)}
        </h1>
        <p className="font-ko" style={{ fontWeight: 600, letterSpacing: ".01em", fontSize: "clamp(.92rem, 1.6vw, 1.12rem)", color: "var(--ink)", marginTop: 26, marginBottom: 20 }}>
          {"AI 전략기획 · 법무법인 경국 — Strategy · Automation · Data"}
        </p>
        <p className="font-ko" style={{ maxWidth: 620, margin: "0 auto", fontSize: "clamp(1rem, 1.7vw, 1.22rem)", lineHeight: 1.7, color: "var(--ink-soft)" }}>
          데이터로 판단의 근거를 만들고,<br />AI로 실행의 속도를 만듭니다.
        </p>
        <p className="font-ko hero-proof">
          AI로 풀 문제를 정의하고, 자동화 시스템을 직접 구현해 실제 업무에 적용합니다.
        </p>

        <div style={{ marginTop: 44, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#artifacts" className="btn">대표 프로젝트 <ArrowDown size={15} /></a>
          <a href="#composite" className="btn btn--ghost">핵심 역량</a>
          <a href="career.html" className="btn btn--ghost">경력 상세 <ArrowUpRight size={15} /></a>
        </div>
      </div>

      <a href="#trajectory" className="scroll-cue" style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", textDecoration: "none" }}>
        <span className="font-sans" style={{ fontSize: ".64rem", letterSpacing: ".3em", fontWeight: 600 }}>SCROLL</span>
        <i />
      </a>
    </section>
  );
}

function Sticker({ cls = "", style = {}, children }) {
  return <div className={`sticker ${cls}`} style={{ position: "absolute", zIndex: 4, ...style }}>{children}</div>;
}

/* ============================================================ MARQUEE */
function Marquee() {
  const items = ["YUBIN KIM OFFICE", "전략기획 × AI", "STRATEGIC PLANNING", "PROCESS AUTOMATION", "DATA-DRIVEN DECISIONS", "AI 강의 · LECTURES", "김유빈 · ETHAN KIM"];
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
    ["8", "AI · 자동화 결과물", "Projects"],
    ["4", "배포 · 사내 운영 시스템", "In Operation"],
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
  { n: "01", core: true, ko: "AI 전략기획", short: "전략", en: "AI Strategy & Planning",
    desc: "흩어진 시장·업무 데이터를 모아 무엇을 먼저 할지, 무엇을 AI에 맡길지 정하는 일. 정비사업 용역비 수집으로 시장 단가 비교와 사업성 검토의 기준선을 만들었고, VOC 트리아지에서는 무엇을 리스크로 볼지의 판단 기준을 설계했습니다.",
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
    desc: "직접 기획·배포해 운영 중인 시스템에서 나온 네 과정. KREMA 4기의 시장 데이터 전략과 현장 산출물을 사례로 다룹니다." },
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
    who: "기획 · 마케팅 · 사무 실무자",
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
    basis: "GWS · NAVER WORKS API 연동과 크롤링 파이프라인 구축 경험",
    proof: { label: "VOC 트리아지 시스템", href: "#ed-06" } },

  /* ---- Track B — 도메인 적용 ---- */
  { id: "lec-05", n: "05", track: "domain", color: "var(--sky)", Icon: BarChart,
    title: "실무자를 위한 전략기획 AI",
    lead: "반복 업무를 진단하고, 무엇을 자동화할지 정하는 기준을 세웁니다.",
    who: "백오피스 · 기획 · 전문직 사무소 실무자",
    hours: "3시간 / 6시간(실습 포함)",
    modules: ["업무 흐름 진단과 병목 찾기", "자동화 우선순위 매트릭스", "사람이 남아야 할 판단의 자리"],
    basis: "법무법인 경국 — 송무·사무 프로세스 혁신 실무",
    proof: { label: "VOC 트리아지 사례", href: "#ed-06" } },
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
  { n: "02", title: "VOC 트리아지 시스템", tag: "GWS API · 분류 알고리즘",
    manual: "담당자가 메일함을 직접 확인하며 사안의 우선순위를 판단하던 업무.",
    auto: "Workspace API가 실시간으로 데이터를 수집하고, 분류 알고리즘이 1차 선별을 수행.",
    judge: "무엇을 리스크로 볼지 정하는 건 결국 사람 몫이고, 그 기준은 법무 감각에서 나옵니다." },
  { n: "03", title: "정비사업 용역비 자동 수집", tag: "누리장터 · 웹 크롤링",
    manual: "흩어진 용역 입찰 공고를 사이트마다 찾아 단가를 옮겨 적던 업무.",
    auto: "크롤러가 정기적으로 공고와 용역비를 수집·정형화해 비교 가능한 데이터셋으로 축적.",
    judge: "어떤 항목을 표준 필드로 삼아야 사업성 검토에 쓰이는지는 시장을 알아야 정할 수 있습니다." },
];

const NODE = [[200, 68], [314, 134], [314, 266], [200, 332], [86, 266], [86, 134]];
const LABEL = [
  { x: 200, y: 46, a: "middle" }, { x: 334, y: 128, a: "start" }, { x: 334, y: 278, a: "start" },
  { x: 200, y: 360, a: "middle" }, { x: 66, y: 278, a: "end" }, { x: 66, y: 128, a: "end" },
];

function ConvergenceMap({ active, onPick }) {
  return (
    <svg className="cmap" viewBox="0 0 400 400" role="img" aria-label="여섯 도메인이 하나로 수렴하는 융합 역량 다이어그램">
      <polygon className="cmap__ring" points={NODE.map((p) => p.join(",")).join(" ")} />
      {NODE.map((p, i) => (
        <line key={"s" + i} className={"cmap__spoke" + (DOMAINS[i].core ? " core" : "") + (i === active ? " on" : "")} x1="200" y1="200" x2={p[0]} y2={p[1]} />
      ))}
      <circle className="cmap__halo" cx="200" cy="200" r="60" />
      <circle className="cmap__core" cx="200" cy="200" r="46" />
      <text className="cmap__coreT font-serif" x="200" y="199" textAnchor="middle">AI</text>
      <text className="cmap__coreS" x="200" y="215" textAnchor="middle">STRATEGY</text>
      {NODE.map((p, i) => (
        <circle key={"n" + i} className={"cmap__node" + (DOMAINS[i].core ? " core" : "") + (i === active ? " on" : "")}
          cx={p[0]} cy={p[1]} r={i === active ? 9.5 : DOMAINS[i].core ? 7 : 4.5}
          onMouseEnter={() => onPick(i)} />
      ))}
      {DOMAINS.map((d, i) => (
        <text key={"t" + i} className={"cmap__label" + (d.core ? " core" : "") + (i === active ? " on" : "")}
          x={LABEL[i].x} y={LABEL[i].y} textAnchor={LABEL[i].a}
          onMouseEnter={() => onPick(i)}>{d.short}</text>
      ))}
    </svg>
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
        <SectionHead eyebrow="02 — Core Competencies" titleEn="The Composite" titleKo="AI 전략기획을 중심에 둔 역량 구조" />

        <div className="comp-thesis reveal">
          <p className="font-myeongjo">
            전략은 무엇을 먼저 할지 정하는 일이고, AI는 그 결정을 빨리 실행하는 도구입니다.
          </p>
          <p className="font-ko comp-thesis__sub">
            중심축은 <strong>AI 전략기획 · AI 자동화 · 데이터</strong> 세 가지입니다.
            마케팅·강의·도메인 지식은 그 판단을 정확하게 만들고 조직에 전달하는 보조 역량입니다.
          </p>
        </div>

        <div className="comp-stage">
          <div className="comp-stage__sticky">
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
        <p className="eyebrow reveal">Strategy Cases — 기획 판단의 기록</p>

        <h2 className="whyc__lead font-myeongjo reveal">
          도구는 빨라졌습니다.<br />
          <em>무엇을 먼저 할지는 여전히 사람이 정합니다.</em>
        </h2>

        <p className="whyc__intro font-ko reveal">
          직접 만든 세 개의 시스템에서 같은 일이 반복됐습니다. 사람이 하던 일이 도구로 넘어갔고,
          그때마다 사람이 남아야 할 자리가 하나씩 또렷해졌습니다. 그 자리가 전략기획입니다.
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
                  <span className="wcase__lbl font-sans">Judgment · 기획 판단</span>
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
    desc: "송무·사무 실무를 담당하며 반복 업무를 진단하고, 급여명세서 자동 발송과 정비사업 용역비 자동 수집 프로그램을 기획·구현해 사내 운영에 적용." },
  { id: "tl-seocho", group: "public", year: "2026", color: "var(--apple)", title: "서초청년네트워크 9기 운영위원회 부위원장",
    desc: "서초구 청년 정책 거버넌스의 운영위원회 부위원장으로서 분과 의제 설정과 위원회 운영을 총괄하고, 현장의 목소리를 제도로 잇는 민관 협력을 주도." },
  { id: "tl-youth-day", group: "public", year: "2026", color: "var(--sky)", title: "청와대 대통령 주관 청년의날 행사 참석",
    desc: "대통령이 주관한 청년의날 기념행사에 청년 대표로 초청되어 참석. 청년 정책의 방향과 현장의 과제를 국정 최고 의사결정 단위에서 직접 청취하고 교류." },
  { id: "tl-national-debate", group: "public", year: "2026", color: "var(--apple)", title: "국민통합위원회 2026 국민 대토론회 — 정책 제안 발표",
    desc: "〈2026 세대·젠더 분야 현장형 국민대화 국민 대토론회〉(2026. 9. 29 · aT센터) 자산 분야 트랙에서 청년 미래배당펀드팀으로 ‘청년 초과세수 미래배당펀드’를 제안·발표. 일회성으로 소진되는 초과세수를 청년 세대가 함께 불리는 자산으로 전환하는 구조를 설계." },
  { id: "tl-youth-panel", group: "public", year: "2026", color: "var(--pink)", title: "국무조정실 온라인 청년참여단 활동",
    desc: "국무조정실 온라인 청년참여단으로서 청년 정책 과제에 대한 의견 수렴과 정책 제안에 참여하며, 온라인 공론장을 통해 청년 세대의 목소리를 정부 정책 과정에 전달." },
  { id: "tl-konkuk", group: "edu", year: "2026", color: "var(--butter)", title: "건국대학교 스마트건설기술교육 프로그램 이수",
    desc: "BIM 설계 데이터 해석과 드론 측량, 건설 자동화 워크플로우를 실습 중심으로 다루며 부동산·건설 도메인을 데이터의 언어로 읽어내는 융합적 관점을 정립." },
  { id: "tl-seoul-press", group: "public", year: "2026", color: "var(--apple)", title: "서울시민기자단 취재기자 활동",
    desc: "공공 영역의 미디어 콘텐츠를 기획·편집하고 시정(市政) 현안을 분석하여 정책 제안 과정에 참여." },
  { id: "tl-fintech", group: "edu", year: "2026", color: "var(--lilac)", title: "서울특별시 핀테크 아카데미 14기 수료",
    desc: "금융과 기술이 접합하는 지점에서 핀테크 산업 구조와 디지털 금융 서비스 설계 원리를 학습하고, 데이터 기반 금융 도메인으로 역량의 범위를 확장." },
  { id: "tl-krema", group: "edu", year: "2026", color: "var(--pink)", title: "한국부동산마케팅협회 (KREMA) AI 마케팅 기획자 양성 과정 4기 수료",
    desc: "인공지능 기반의 부동산 시장 데이터 분석과 표적 세그먼트 도출을 학습하고, 매체별 디지털 마케팅 전략 수립 및 자동화 기획 역량을 습득." },
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

/* 이력 그룹 — 핵심(실무·AI 교육)은 펼쳐 두고, 대외활동·수상은 눌러서 본다 */
const TRAJ_GROUPS = [
  { key: "work", en: "Professional", ko: "실무 경력", open: true },
  { key: "edu", en: "AI · Data Education", ko: "AI · 데이터 전문교육", open: true,
    order: ["tl-snu-aied", "tl-ssafy", "tl-krema", "tl-fintech", "tl-konkuk"] },
  { key: "public", en: "Leadership & Public", ko: "리더십 · 대외활동", open: false },
  { key: "honor", en: "Honors", ko: "수상 · 표창", open: false },
];

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
            {e.proof && <a href={e.proof} className="tl-proof font-sans">상장 원본 보기 <ArrowUpRight size={13} /></a>}
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

        <figure className="tl-feature reveal">
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
        <div className="tl-groups">
          {TRAJ_GROUPS.map((g) => {
            const rows = g.order
              ? g.order.map((id) => TRAJECTORY.find((e) => e.id === id))
              : TRAJECTORY.filter((e) => e.group === g.key);
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
    core: true, point: "법조문을 글이 아니라 장소로 기억하게 만드는 것이 설계의 목표 — 서울의 실제 시간과 햇빛 아래에서 조사 절차를 몸으로 익힌다." },
  { n: "12", color: "var(--sky)", Icon: LayoutGrid, title: "국민용 국정 상황판\n국정 한눈에",
    desc: "대통령 동정·대통령실·정부 정책·국무회의와 국회, 증시·환율·부동산·산업까지 국정과 경제를 한 화면에 모은 상황판. 공개 뉴스 RSS와 시세를 서버리스 함수가 모아 섹션별로 배정하고, 중복 기사를 걸러 언론사 원문 사진과 함께 보여준다. 섹션 필터·검색, 지수 추이 스파크라인, 라이트·다크 모드 지원.",
    status: "Vercel 배포 완료", cta: "상황판 보기", url: "https://gukjeong-hannune.vercel.app/", tags: ["공개 RSS · 시세 수집", "Vercel Serverless", "외부 라이브러리 0"],
    core: true, point: "수집이 실패해도 화면이 비지 않게 — CDN 20분 캐시와 stale-while-revalidate로 즉시 응답하고, 실패하면 저장된 스냅샷으로 대체. 포털은 기사를 옮겨 실을 뿐 매체가 아니므로 출처·언론사 수에서 뺐다." },
  { n: "11", color: "var(--pink)", Icon: Quote, title: "성경 말씀 × 인문학 서재\nSalvation",
    desc: "\"지금, 어떤 마음이신가요?\"에서 시작해 마음 상태·주제별로 성경 말씀과 인문학·철학의 문장을 이어 주는 서재형 PWA. 오늘의 말씀, 말씀·인문학 서재, 묵상 노트·기도 제목·말씀 암송·통독 진도를 쌓는 '나의 성소', 마스코트 등불이(시편 119:105)가 안내하는 상담 챗봇까지 설계·구현.",
    status: "Vercel 배포 완료", cta: "서재 둘러보기", url: "https://malsseum-guwon.vercel.app/", tags: ["PWA · 오프라인", "Supabase 동기화", "위기 신호 안전장치"],
    core: true, point: "챗봇이 위기 신호를 감지하면 해석·성찰 대화를 즉시 멈추고 109·1577-0199 등 24시간 상담 기관을 먼저 안내 — 입력 문장은 저장하지 않고 감지 사실만 남긴다." },
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
    status: "Vercel 배포 완료", cta: "대시보드 바로가기", url: "https://cheongak-dashboard-di9e6muep-yubin-ki-m-s-projects.vercel.app", tags: ["청약홈 OpenAPI", "Dashboard", "Data Viz"],
    point: "시장 판단에 필요한 지표만 골라 나란히 배치 — 무엇을 병렬할지가 곧 분석의 설계." },
  { n: "06", color: "var(--apple)", Icon: Cpu, title: "GWS 연동 VOC 분석\n트리아지(Triage) 시스템",
    desc: "Google Workspace API를 연동하여 고객 피드백을 실시간으로 집계하고, 자체 분류 알고리즘으로 업무 우선순위를 자동화한 백오피스 대시보드.",
    status: "Vercel 배포 완료", cta: "시스템 바로가기", url: "https://mail-dashboard-blue-six.vercel.app", tags: ["GWS API", "AI Triage", "Back-office"],
    core: true, point: "무엇을 리스크로 볼지 분류 기준을 먼저 정의하고, 1차 선별만 알고리즘에 위임." },
  { n: "07", color: "var(--apple)", Icon: Mail, title: "네이버웍스 메일 연동\n급여명세서 자동 발송 프로그램",
    desc: "네이버웍스(NAVER WORKS) 메일 API와 연동하여 급여명세서의 생성과 발송을 자동화한 사내 업무 프로그램. 반복되던 급여 명세 발송 절차를 표준화하여 처리 시간을 단축하고 오류 가능성을 축소.",
    status: "사내 운영 적용", cta: "사내 운영 · 비공개", url: "", tags: ["NAVER WORKS", "메일 자동화", "업무 자동화"],
    core: true, point: "반복되던 발송 절차를 표준화해 처리 시간을 줄이고 오류 가능성을 축소." },
  { n: "08", color: "var(--sky)", Icon: Cpu, title: "누리장터 크롤링 연동\n정비사업 용역비 자동 수집 프로그램",
    desc: "정비사업 정보 플랫폼 '누리장터'에서 조합 대상 용역 입찰과 용역비 데이터를 자동으로 수집하는 크롤링 프로그램. 흩어진 공고를 정기적으로 수집·정형화하여 시장 단가 비교와 사업성 검토를 위한 데이터셋을 구축.",
    status: "사내 운영 적용", cta: "사내 운영 · 비공개", url: "", tags: ["웹 크롤링", "정비사업 데이터", "업무 자동화"],
    core: true, point: "시장 단가 비교와 사업성 검토에 바로 쓰이는 필드 구조로 데이터셋을 설계." },
];

/* 화면에 보이는 순서와 번호 — 01 집캐치 · 02 VOC · 03 급여명세 · 04 누리장터, 이어서 아래 작업 */
const EDITION_ORDER = ["10", "09", "12", "11", "06", "07", "08", "05", "01", "02", "03", "04"];
const EDITIONS_SHOWN = EDITION_ORDER.map((n, i) => ({ ...EDITIONS.find((e) => e.n === n), no: String(i + 1).padStart(2, "0") }));

function EditionCard({ e, i, onPlay }) {
  return (
            <article id={"ed-" + e.n} className={"edition reveal" + (e.core ? " edition--core" : "")} style={{ "--accent-fill": e.color, transitionDelay: `${i * 90}ms` }}>
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
              <p className="font-ko" style={{ color: "var(--ink-soft)", lineHeight: 1.72, fontSize: ".96rem", flexGrow: 1 }}>{e.desc}</p>
              {e.point && <p className="edition__point font-ko"><b>기획 포인트</b>{e.point}</p>}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, margin: "18px 0 22px" }}>
                {e.tags.map((t) => <span key={t} className="font-sans" style={{ fontSize: ".72rem", fontWeight: 600, padding: ".32em .7em", borderRadius: 999, border: "1.5px solid var(--ink)", color: "var(--ink)" }}>{t}</span>)}
              </div>
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
            </article>
  );
}

function Artifacts() {
  const ref = useReveal();
  const [playing, setPlaying] = React.useState(null);
  React.useEffect(() => {
    if (!playing) return;
    const onKey = (ev) => { if (ev.key === "Escape") setPlaying(null); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [playing]);
  return (
    <React.Fragment>
    <section id="artifacts" ref={ref} style={{ position: "relative", padding: "clamp(80px,12vw,150px) 0", background: "var(--ecru-deep)" }}>
      <div className="wrap">
        <SectionHead eyebrow="03 — Selected Works" titleEn="The Artifacts" titleKo="AI 전략 · 자동화 프로젝트" />
        <p className="works-lead font-ko reveal">
          직접 문제를 정의하고 구현해 <strong>배포하거나 사내 업무에 적용한 시스템 4건</strong>입니다.
          데이터 대시보드와 생성형 AI 콘텐츠 작업은 아래에서 따로 펼쳐 볼 수 있습니다.
        </p>
        <div className="works-grid">
          {EDITIONS_SHOWN.filter((e) => e.core).map((e, i) => (
            <EditionCard key={e.n} e={e} i={i} onPlay={setPlaying} />
          ))}
        </div>
        <details className="fold works-more reveal">
          <summary>
            <span className="fold__t">
              <span className="eyebrow">Supplementary</span>
              <strong className="font-ko">그 밖의 작업 <em>{EDITIONS.filter((e) => !e.core).length}건</em></strong>
              <span className="fold__line font-ko">청약 인사이트 대시보드 · 브랜드 필름 · 카드뉴스 · 멀티미디어 프로모션</span>
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

    {playing && (
      <div className="vlightbox" onClick={() => setPlaying(null)} role="dialog" aria-modal="true">
        <div className="vlightbox__frame" onClick={(ev) => ev.stopPropagation()}>
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
    )}
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
        <SectionHead eyebrow="Side Practice — Lectures" titleEn="The Lectures" titleKo="AI 강의 프로그램" />

        <div className="side-note reveal">
          <span className="side-note__badge font-sans">In Preparation</span>
          <p className="font-ko">
            본업은 <strong>AI 전략기획</strong>입니다. 강의는 실무에서 직접 만들고 운영한 경험을 나누기 위해
            <strong> 별도로 설계한 프로그램</strong>으로, 아직 출강 이력은 없습니다.
            커리큘럼과 근거를 먼저 공개해 두고, 첫 강의가 진행되면 이력에 연도와 함께 추가하겠습니다.
          </p>
        </div>

        <div className="lec-intro reveal">
          <p className="font-myeongjo">
            만들어 본 사람만 가르칠 수 있는 것이 있습니다.
          </p>
          <p className="font-ko lec-intro__sub">
            SSAFY 13기의 엔지니어링 훈련, 서울대 AIED 4기의 프롬프트 아키텍처와 교수법,
            KREMA 4기의 시장 데이터 전략 — 배운 것을 실제로 만들어 운영해 본 뒤에 강의 모듈로 옮겼습니다.
            현재 두 트랙, 여덟 과정의 커리큘럼을 설계해 두었습니다.
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

function About() {
  const ref = React.useRef(null);
  const barRef = React.useRef(null);
  /* 연속값(진행도)은 DOM 에 직접 쓰고, React 는 사진·문장이 실제로 바뀌는 순간에만 다시 그린다.
     예전엔 스크롤 매 프레임 setState → 섹션 전체 재렌더 → 저사양 폰에서 70ms 대 끊김. */
  const [stage, setStage] = React.useState({ shot: 0, lines: 0, body: false });
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const on = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const span = r.height - window.innerHeight;
        const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1;
        el.style.setProperty("--p", p.toFixed(3));
        if (barRef.current) barRef.current.style.transform = "scaleX(" + p.toFixed(3) + ")";
        const shot = Math.min(STORY_SHOTS.length - 1, Math.floor(p * STORY_SHOTS.length * 0.999));
        let lines = 0;
        for (let i = 0; i < STORY_LINES.length; i++) if (p >= 0.06 + i * 0.16) lines = i + 1;
        const body = p >= 0.5;
        setStage((s) => (s.shot === shot && s.lines === lines && s.body === body ? s : { shot, lines, body }));
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, []);
  const { shot } = stage;
  const lineOn = (i) => i < stage.lines;
  const bodyOn = stage.body;

  return (
    <section id="about" ref={ref} className="story">
      <div className="story__sticky">
        <div className="wrap story__grid">
          <div className="story__copy">
            <p className="eyebrow">01 — Profile</p>
            <h3 className="story__lead font-myeongjo">
              {STORY_LINES.map((l, i) => <span key={l} className={"story__line" + (lineOn(i) ? " on" : "")}>{l}</span>)}
            </h3>
            <div className={"story__body" + (bodyOn ? " on" : "")}>
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

          <div className="story__media">
            <div className="story__frame">
              {STORY_SHOTS.map((m, i) => (
                <Pic key={m.name} name={m.name} fallback={m.src} className={"story__img" + (i === shot ? " on" : "")}
                  sizes="(max-width: 900px) 88vw, 34vw" alt={m.alt} loading="lazy" style={m.pos ? { objectPosition: m.pos } : undefined} />
              ))}
            </div>
            <div className="story__caps">
              {STORY_SHOTS.map((m, i) => (
                <p key={m.chip} className={"story__cap" + (i === shot ? " on" : "")}>
                  <span className="font-sans">{String(i + 1).padStart(2, "0")} · {m.chip}</span>
                  <em className="font-ko">{m.cap}</em>
                </p>
              ))}
            </div>
            <div className="story__prog" aria-hidden="true"><i ref={barRef} /></div>
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
            <textPath href="#sealArc">AI STRATEGY · PLANNING · SEOUL · YUBIN KIM ·</textPath>
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
          AI 전략기획 · 업무 자동화 · 데이터 기반 서비스 기획 포지션의 제안을 기다립니다.<br />이메일로 연락 주시면 성실히 회신드리겠습니다.
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
        </div>
      </div>
      <Footer />
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
        {[["소개", "#about"], ["역량", "#composite"], ["프로젝트", "#artifacts"], ["이력", "#trajectory"], ["강의", "#lectures"], ["갤러리", "gallery.html"], ["경력 상세", "career.html"]].map(([t, h]) => (
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
          <span className="font-ko" style={{ fontSize: ".82rem", color: "rgba(249,246,240,.6)", fontFamily: '"Pretendard", sans-serif', fontWeight: 400 }}>김유빈 · Yubin Kim — AI Strategy &amp; Planning</span>
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

Object.assign(window, { Nav, Hero, Marquee, Composite, Ledger, Trajectory, Artifacts, EditionCard, Lectures, About, Contact, Footer, SectionHead });
