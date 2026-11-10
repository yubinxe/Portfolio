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
  "moef-group": [480, 800, 1200, 1600], "moef-nameplate": [480, 675], "moef-tour": [480, 800, 1200, 1600], "moef-talk": [480, 800, 1200, 1600],
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
    ["소개", "#about"], ["역량", "#composite"], ["경국 AX", "#ax-desk"], ["도구", "#artifacts"], ["정책", "#policy"], ["이력", "#trajectory"],
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

/* ============================================================ INTRO — ALPHA SHEEP · The First Move
 * 사진형 첫 화면(HeroClassic) 앞의 스크롤 오프닝 타이틀. 2027 → TREND KOREA 2027 → 키워드 → ALPHA SHEEP → 선언 → 김유빈.
 * 움직임은 cine.js 의 pin 진행도(--cp)를 intro.css 가 transform · opacity 로 계산한다 — 스크롤 중 React 재렌더 0회, 두 번째 스크롤 엔진 없음.
 * 켜짐/꺼짐은 index.html <head> 의 짧은 스크립트가 첫 그리기 전에 정한다(html.ix-on / ix-off) — 레이아웃 흔들림 없음.
 *   ix-on 이 없으면(JS 없음 · 움직임 줄이기 · 인트로 끄기 전 저장 불가) 고정 없이 여섯 문장을 짧은 정적 화면으로 보여 준다.
 * SKIP INTRO 는 #manifesto 로 가는 평범한 링크라 React 가 실패해도 동작한다. ‘인트로 끄기’는 이 브라우저(localStorage)에만 기억 — 쿠키 · 추적 없음.
 * 슬로건 ALPHA SHEEP 은 《트렌드 코리아 2027》(김난도 외)의 2027년 슬로건 — ‘무리에서 벗어난 양이 되다’는 개인적 재해석이며 도서와 제휴 관계가 없다. */
const IX_KEY = "yk.intro";
const ixSet = (on) => {
  try { if (on) localStorage.removeItem(IX_KEY); else localStorage.setItem(IX_KEY, "off"); } catch (e) {}
  const h = document.documentElement;
  const calm = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  h.classList.toggle("ix-off", !on);
  h.classList.toggle("ix-on", on && !calm);
  h.classList.toggle("ix-active", on && !calm);
  window.dispatchEvent(new Event("cine:scan"));
  window.scrollTo(0, 0);
  if (!on) { const t = document.getElementById("hero-title"); if (t) { t.setAttribute("tabindex", "-1"); t.focus({ preventScroll: true }); } }
};
/* 무리 — 같은 방향으로 흐르는 짧은 선들. 줄마다 하나의 묶음(g)만 움직여 그리기 비용을 줄인다(선 64개 · 변환 4개) */
const IX_ROWS = [0, 1, 2, 3].map((r) => {
  const y = 372 + r * 52, out = [];
  for (let k = 0; k < 16; k++) { const x = -260 + k * 132 + ((r * 47 + k * 29) % 41); out.push([x, y + ((k * 13 + r * 7) % 9) - 4, 34 + ((k * 7 + r * 5) % 26)]); }
  return out;
});
function IntroSequence() {
  const sec = React.useRef(null), stage = React.useRef(null), mark = React.useRef(null);
  React.useEffect(() => {
    const s = sec.current, st = stage.current, m = mark.current;
    if (!s || !st) return;
    /* 매치 컷 — 히어로 이름(YUBIN KIM)의 세로 중심과 고정 구간 길이를 재서 마지막 장면이 그 자리로 이어지게 한다 */
    const measure = () => {
      const hero = document.getElementById("manifesto"), name = hero && hero.querySelector(".hero-name");
      if (name) {
        const hr = hero.getBoundingClientRect(), nr = name.getBoundingClientRect();
        st.style.setProperty("--hy", Math.round(nr.top - hr.top + nr.height / 2) + "px");
      }
      st.style.setProperty("--span", Math.max(0, s.offsetHeight - window.innerHeight) + "px");
    };
    measure();
    let rt = 0;
    const onResize = () => { clearTimeout(rt); rt = setTimeout(measure, 120); };
    window.addEventListener("resize", onResize, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    /* 인트로가 화면을 차지하는 동안만 상단 메뉴를 숨긴다 — 스크롤 이벤트 없이 관찰자 두 개로 */
    let seen = false, passed = false;
    const h = document.documentElement;
    const sync = () => h.classList.toggle("ix-active", h.classList.contains("ix-on") && seen && !passed);
    const io1 = new IntersectionObserver((es) => { seen = es[0].isIntersecting; sync(); });
    const io2 = new IntersectionObserver((es) => { passed = es[0].boundingClientRect.top < 0; sync(); });
    io1.observe(s); if (m) io2.observe(m);
    return () => { io1.disconnect(); io2.disconnect(); window.removeEventListener("resize", onResize); };
  }, []);
  const word = "ALPHA SHEEP";
  return (
    <section id="intro" ref={sec} className="ix" aria-label="인트로 — ALPHA SHEEP, 무리에서 벗어난 양이 되다. 김유빈">
      <div ref={stage} className="ix__stage" data-cine="pin" data-cine-src="#intro" data-cine-rest="1">
        <div className="ix__bg" aria-hidden="true" />
        <div className="ix__light" aria-hidden="true" />
        <div className="ix__warm" aria-hidden="true" />
        <svg className="ix__flock" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          {IX_ROWS.map((row, r) => (
            <g key={r} className={"ix__row ix__row--" + r}>
              {row.map(([x, y, w], k) => <line key={k} x1={x} y1={y} x2={x + w} y2={y} />)}
            </g>
          ))}
          <path className="ix__alpha" pathLength="1" d="M 742 476 C 860 476 930 470 1010 430 S 1180 300 1330 260 C 1460 226 1560 236 1660 250" />
          <circle className="ix__alpha-dot" cx="742" cy="476" r="3.2" />
        </svg>

        <p className="ix__brand font-sans" aria-hidden="true">Yubin Kim<span>Portfolio 2026</span></p>

        <div className="ix__scene ix__s1"><p className="ix__year font-serif">2027</p></div>
        <div className="ix__scene ix__s2"><p className="ix__tk"><span className="font-sans">TREND KOREA</span> <b className="font-serif">2027</b></p></div>
        <div className="ix__scene ix__s3"><p className="ix__kw font-myeongjo">2027년을 관통하는 키워드</p></div>
        <div className="ix__scene ix__s4">
          <p className="ix__alpha-t font-serif" aria-label={word}>
            {word.split("").map((c, i) => <span key={i} aria-hidden="true" className={c === " " ? "ix__sp" : "ix__l"} style={{ "--i": i, "--d": (((i * 7) % 5) - 2) / 2, "--x": i - 5 }}>{c === " " ? " " : c}</span>)}
          </p>
        </div>
        <div className="ix__scene ix__s5">
          <p className="ix__mf font-myeongjo"><span>무리에서 벗어난</span> <span>양이 되다.</span></p>
          <p className="ix__mf-en font-sans" lang="en">FOLLOW LESS. CREATE FIRST.</p>
        </div>
        <div className="ix__scene ix__s6">
          <div className="ix__id">
            <p className="ix__ko font-ko">김유빈</p>
            <p className="ix__en font-serif" lang="en">KIM YUBIN</p>
            <i className="ix__rule" aria-hidden="true" />
            <p className="ix__tag font-ko">전략을 설계하고, 기술로 실행합니다.</p>
          </div>
        </div>

        <p className="ix__cue font-sans" aria-hidden="true"><span>SCROLL TO BEGIN</span><i /></p>
        <p className="ix__credit font-ko">ALPHA SHEEP — 《트렌드 코리아 2027》(김난도 외)의 2027년 슬로건을 인용했습니다. ‘무리에서 벗어난 양이 되다’는 개인적 재해석이며, 도서 · 저자와 제휴 관계가 없습니다.</p>
        <i className="ix__bar" aria-hidden="true" />

        <div className="ix__ctl font-sans">
          <button type="button" role="switch" aria-checked="true" className="ix__switch" onClick={() => ixSet(false)} aria-label="인트로 재생 — 끄면 이 브라우저에서는 다음 방문부터 바로 본문이 열립니다" title="끄면 다음 방문부터 바로 본문으로">
            <span className="font-ko">인트로</span><i aria-hidden="true" />
          </button>
          <a className="ix__skip" href="#manifesto" onClick={() => document.documentElement.classList.remove("ix-active")}>SKIP INTRO <span aria-hidden="true">→</span></a>
        </div>
      </div>
      <i ref={mark} className="ix__mark" aria-hidden="true" />
    </section>
  );
}

/* ============================================================ HERO — 사진 중심 첫 화면 (V6.1 복구)
 * 기준: 7bfd9a1e780 의 사진형 Hero(강남 사진 · 중앙 YUBIN KIM · 간결한 CTA). 스크롤 고정 · 카메라 연출 · 건축 모형은 넣지 않는다.
 * 첫 화면이 답할 것 — 누구인가(AI 전략·AX 실행) · 무엇을 하는가(구조화 · 실행) · 어디로 가면 근거가 있는가(CTA 셋) */
function HeroClassic() {
  const ref = useReveal();
  return (
    <section id="manifesto" ref={ref} className="hero-scene hero-classic" aria-labelledby="hero-title">
      <div className="hero-scene__sticky">
        <div className="hero-photo" aria-hidden="true">
          {/* 사진은 높이 기준으로 덮인다(원본 비율 2.47:1) — 폭 100vw 로 고르면 폰 · 태블릿에서 절반 해상도가 와 흐려진다 */}
          <Pic name="hero-gangnam" fallback="images/hero-gangnam-1000.jpg?v=1" sizes="(max-width: 700px) 130vh, (max-width: 1100px) 165vh, 100vw" fetchpriority="high" />
        </div>
        <div className="hero-photo__scrim" aria-hidden="true" />

        <div className="wrap reveal hero-copy">
          <div className="menu-rule hero-rule"><i /></div>
          <p className="font-sans hero-kicker">Seoul · Portfolio 2026</p>
          <p className="eyebrow hero-eyebrow">AI Strategy &amp; Consulting</p>
          <h1 id="hero-title" className="font-serif hero-name">
            <span className="sr-only">김유빈 Yubin Kim — AI 전략 · AX 실행 </span>
            <span aria-hidden="true" className="hero-name__rows">
              <span className="hero-row">{"YUBIN".split("").map((c, i) => <span key={i} className="h-ltr" style={{ animationDelay: `${120 + i * 55}ms` }}>{c}</span>)}</span>
              <span className="hero-row">{"KIM".split("").map((c, i) => <span key={"k" + i} className="h-ltr" style={{ animationDelay: `${120 + (i + 6) * 55}ms` }}>{c}</span>)}</span>
            </span>
          </h1>
          <div className="hero-sub">
            <p className="font-ko hero-role"><b>현업의 문제를 기술로 해결하는 AX·전략기획 실무자</b></p>
            <p className="font-ko hero-lead">복잡한 문제를 구조화하고,<br />기술로 실행합니다.</p>
            <p className="font-ko hero-proof">법률·부동산 분야의 실무 경험을 바탕으로 업무 프로세스를 분석하고, AI와 자동화를 활용한 개선 과제를 설계·구현합니다. 현장에서 확인한 문제를 실행 가능한 시스템으로 전환하는 데 집중합니다.</p>
          </div>
          <div className="hero-cta">
            <a href="#trial-brief" className="btn hero-main">대표 프로젝트 보기 <ArrowDown size={15} /></a>
            <a href="#ax-desk" className="btn btn--ghost">법률 AX 6대 시스템</a>
            <a href="#contact" className="btn btn--ghost">협업 문의</a>
          </div>
        </div>

        <button type="button" className="ix-replay font-ko" onClick={() => ixSet(true)}>▶ 인트로 다시 보기</button>
        <a href="#glance" className="scroll-cue" aria-label="다음 내용으로">
          <span className="font-sans">SCROLL</span>
          <i />
        </a>
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
/* 한눈에 — 숫자 대신 '무엇을 하는 사람인가' 세 문장. 문장마다 아래쪽의 실제 근거로 이어진다 */
const GLANCE = [
  { n: "01", ko: "문제를 정의합니다", en: "Problem Framing", href: "#ax-compensation",
    d: "업무 흐름 · 제약 · 제도 · 이해관계를 먼저 읽습니다.", ev: "광명시흥 3기 신도시 보상자료를 절차와 쟁점으로 구조화(발표자료 77장)" },
  { n: "02", ko: "실행 가능한 시스템을 만듭니다", en: "AX Implementation", href: "#ax-desk",
    d: "정의한 문제를 자동화와 제품으로 옮깁니다.", ev: "경국 AX 3종 · 급여명세서 자동 발송 · 고객 메일 자동 분류 · 직접 만든 도구 4가지" },
  { n: "03", ko: "판단과 제도로 연결합니다", en: "Human & Institutional Decisions", href: "#policy",
    d: "결과를 판단하는 사람이 이해하도록 만들고, 정책 논의의 자리에 나갑니다.", ev: "변호사 검토로 끝나는 AX 구조 · 국민 대토론회 정책 제안 발표 · 청년 정책 거버넌스" },
];
function Ledger() {
  const ref = useReveal();
  /* 작업 목록(EDITIONS)에서 바로 센다 — 항목을 더하거나 빼도 숫자가 어긋나지 않게 */
  const facts = [
    [String(EDITIONS.length), "결과물"], [String(EDITIONS.filter((e) => /배포 완료|사내 운영/.test(e.status)).length), "배포 · 사내 운영"],
    ["4", "AI · 데이터 전문교육"], ["3", "수상 · 표창"],
  ];
  return (
    <section id="glance" ref={ref} className="ledger glance" aria-labelledby="glance-title">
      <div className="wrap reveal">
        <h2 id="glance-title" className="glance__h"><span className="font-ko">이렇게 일합니다</span><span className="font-serif" lang="en">How I Work</span></h2>
        <ol className="glance__list">
          {GLANCE.map((g) => (
            <li key={g.n}>
              <a href={g.href} className="glance__item">
                <b className="font-serif">{g.n}</b>
                <h3><span className="font-ko">{g.ko}</span><em className="font-sans" lang="en">{g.en}</em></h3>
                <p className="glance__d font-ko">{g.d}</p>
                <p className="glance__ev font-ko"><span>근거</span>{g.ev}</p>
              </a>
            </li>
          ))}
        </ol>
        <p className="glance__facts font-ko">
          {facts.map(([n, k]) => <span key={k}><b className="font-serif" data-count={n}>{n}</b>{k}</span>)}
        </p>
      </div>
    </section>
  );
}

/* ============================================================ COMPOSITE — 융합 역량 */
/* 역량은 깊이가 다르다 — 줄기(실증된 깊이) · 적용 영역 · 넓어지는 영역. 숙련도 점수 · 퍼센트는 쓰지 않는다.
 * id(dom-NN)는 고정이고 화면 순서는 tier 순서다. 두 번째 깊이(법률·부동산·제도적 의사결정)는 '형성 중'으로만 적는다 */
const DOMAINS = [
  { n: "01", tier: "core", ko: "AI 전략", short: "AI 전략", en: "AI Strategy",
    desc: "무엇을 먼저 하고 무엇을 AI에 맡길지 정합니다. 광명시흥 3기 신도시 보상자료를 절차와 쟁점별로 구조화했고, 고객 메일 자동 분류에서는 무엇을 ‘급함’으로 볼지 기준을 세웠습니다.",
    tags: ["문제 정의 · 우선순위", "보상자료 77장 구조화"] },
  { n: "02", tier: "core", ko: "AX 실행 · 업무 자동화", short: "AX 실행", en: "AX Implementation",
    desc: "반복되는 판단의 앞단을 시스템으로 옮기고, 사람은 기준을 정하는 자리에 남깁니다. 경국 AX 3종 · 급여명세서 자동 발송 · 고객 메일 자동 분류를 만들었고, SSAFY 13기 · 서울대 AIED 4기에서 구조를 익혔습니다.",
    tags: ["경국 AX 3종", "SSAFY 13기 · 서울대 AIED 4기"] },
  { n: "03", tier: "core", ko: "데이터 기반 판단", short: "데이터", en: "Data-Based Reasoning",
    desc: "공공데이터 API와 Google Workspace를 의사결정 가능한 화면으로 번역하고 직접 배포합니다. 전략이 감이 아니라 근거 위에 서도록 데이터 구조를 먼저 설계합니다.",
    tags: ["공공데이터 API", "GWS 연동"] },
  { n: "06", tier: "applied", ko: "법률·부동산의 산업 이해", short: "법률·부동산", en: "Legal & Real Estate Intelligence",
    desc: "정비사업의 법률 위험, 토지보상 절차, 청약·공공임대 공고를 실무와 제품으로 다뤘습니다. 법무법인 경국의 송무·사무, 건국대 스마트건설 교육, KREMA 4기, 분양대행자 자격이 바탕입니다.",
    tags: ["법무법인 경국", "스마트건설 · KREMA 4기"] },
  { n: "05", tier: "wide", ko: "정책·공공 의사결정 참여", short: "정책·공공", en: "Policy & Public Decision-Making",
    desc: "국민 대토론회에서 정책을 제안·발표했고, 서초청년네트워크 9기 운영위원회 부위원장 · 청년정책 패널로 활동합니다. 참석과 제안은 정책 결정이 아니라 논의에 참여한 기록입니다.",
    tags: ["국민 대토론회 제안 발표", "서초청년네트워크 부위원장"] },
  { n: "04", tier: "wide", ko: "설명·교육·소통", short: "설명·소통", en: "Knowledge Translation & Communication",
    desc: "서울대 AIED 4기에서 교수법을 익혔고, 박람회 시연 · SSAFY 홍보 앰배서더 · 서울시민기자단으로 기술과 정책을 이해하기 쉬운 말로 옮겨 왔습니다. 강의는 제안 커리큘럼입니다.",
    tags: ["서울대 AIED 4기", "SSAFY 홍보 앰배서더"] },
];
const TIERS = [
  { key: "core", ko: "줄기 — 실증된 깊이", en: "Core Depth" },
  { key: "applied", ko: "적용 영역", en: "Applied Domain" },
  { key: "wide", ko: "넓어지는 영역", en: "Expanding Domains" },
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
  ["삼성청년SW·AI아카데미 13기", "소프트웨어 아키텍처와 AI 알고리즘을 실무 프로젝트로 학습. 홍보 앰배서더로 지원자 대상 커뮤니케이션도 수행했습니다."],
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

/* T/π 역량 구조 — 위 가로줄은 넓이(연결된 영역), 아래 굵은 줄기는 실증된 깊이(AI 전략·AX 실행).
 * 왼쪽의 점선 줄기는 형성 중인 두 번째 깊이(법률·부동산·제도적 의사결정) — 자격이나 완성된 전문성이 아니다 */
const TMAP = { "06": [5, 28], "01": [29, 58], "05": [58, 79], "04": [79, 100] }; /* 가로줄 칸 — 왼쪽 · 오른쪽 % */
function TShapeMap({ active, onPick }) {
  const cur = DOMAINS[active] || DOMAINS[0];
  const coreOn = cur.tier === "core";
  const seg = (n) => TMAP[n];
  const btn = (n, label, i) => {
    const [l, r] = seg(n);
    const on = n === "01" ? coreOn : cur.n === n;
    return (
      <button key={n} type="button" className={"tmap__seg" + (on ? " on" : "") + (n === "01" ? " tmap__seg--core" : "")} style={{ left: l + "%", width: (r - l) + "%" }}
        aria-pressed={on} onMouseEnter={() => onPick(i)} onFocus={() => onPick(i)} onClick={() => onPick(i)}>
        <span className="font-ko">{label}</span>
      </button>
    );
  };
  return (
    <div className="tmap" role="group" aria-label="T자 · π자 역량 구조 — 칸을 누르면 설명이 바뀝니다">
      <div className="tmap__bar">
        {btn("06", "법률·부동산", DOMAINS.findIndex((d) => d.n === "06"))}
        {btn("01", "AI 전략·AX 실행", coreOn ? active : 0)}
        {btn("05", "정책·공공", DOMAINS.findIndex((d) => d.n === "05"))}
        {btn("04", "설명·소통", DOMAINS.findIndex((d) => d.n === "04"))}
      </div>
      <div className="tmap__stem" style={{ left: TMAP["01"][0] + "%", width: (TMAP["01"][1] - TMAP["01"][0]) + "%" }}>
        {DOMAINS.filter((d) => d.tier === "core").map((d) => {
          const i = DOMAINS.indexOf(d);
          return (
            <button key={d.n} type="button" className={"tmap__lv" + (i === active ? " on" : "")} aria-pressed={i === active}
              onMouseEnter={() => onPick(i)} onFocus={() => onPick(i)} onClick={() => onPick(i)}>
              <b className="font-serif">{d.n}</b><span className="font-ko">{d.short}</span>
            </button>
          );
        })}
        <p className="tmap__cap font-ko">실증된 깊이<em className="font-sans" lang="en">Demonstrated</em></p>
      </div>
      <div className={"tmap__stem2" + (cur.n === "06" ? " on" : "")} style={{ left: (TMAP["06"][0] + 4) + "%", width: (TMAP["06"][1] - TMAP["06"][0] - 8) + "%" }}>
        <p className="font-ko">두 번째 깊이<br /><span>법률·부동산 ·<br />제도적 의사결정</span><em>형성 중</em></p>
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
        <SectionHead no="02 역량 구조" ko="AI 전략·AX 실행을 줄기로" en="AI Strategy & AX Implementation"
          lead="모든 역량의 깊이가 같지 않습니다. 실제 결과물로 증명한 줄기는 하나이고, 법률·부동산은 그 줄기가 쓰이는 영역, 정책·소통은 넓혀 가는 영역입니다." />

        <div className="comp-stage comp-stage--t">
          <div className="comp-stage__sticky">
            <TShapeMap active={active} onPick={setActive} />
            <div className="cmap__cap">
              <span className="font-sans">{TIERS.find((t) => t.key === DOMAINS[active].tier).ko}</span>
              <strong className="font-ko">{DOMAINS[active].ko}</strong>
              <em className="font-sans" lang="en">{DOMAINS[active].en}</em>
            </div>
          </div>

          <div className="comp-track">
            {TIERS.map((t) => (
              <React.Fragment key={t.key}>
                <p className={"comp-group font-ko" + (t.key !== "core" ? " comp-group--sub" : "")}>{t.ko} <em className="font-sans" lang="en">{t.en}</em></p>
                {DOMAINS.filter((d) => d.tier === t.key).map((d) => {
                  const i = DOMAINS.indexOf(d);
                  return (
                    <article key={d.n} data-i={i} id={"dom-" + d.n} ref={(el) => (rows.current[i] = el)}
                      className={"comp-row comp-row--" + t.key + (i === active ? " on" : "")} onMouseEnter={() => setActive(i)}>
                      <h3 className="comp-row__t"><span className="font-ko">{d.ko}</span><em className="font-sans" lang="en">{d.en}</em></h3>
                      <p className="font-ko">{d.desc}</p>
                      <div className="comp-row__tags font-ko">{d.tags.map((x) => <span key={x}>{x}</span>)}</div>
                    </article>
                  );
                })}
              </React.Fragment>
            ))}
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
        <p className="whyc__k font-ko reveal">전략 판단의 기록 <span className="font-sans" lang="en">Strategy Cases</span></p>

        <h2 className="whyc__lead font-myeongjo reveal">
          AI가 답을 만드는 시대,<br />
          <em>무엇을 물을지 결정하는 사람이 되겠습니다.</em>
        </h2>
        <p className="whyc__en font-serif reveal" lang="en">Technology for Execution. Judgment for Direction.</p>

        <p className="whyc__intro font-ko reveal">
          시스템은 분석과 실행을 돕습니다. 그러나 결과가 큰 결정 — 무엇을 문제로 삼을지, 이해관계가 부딪칠 때 무엇을 앞세울지,
          어떤 위험을 받아들일지 — 은 그 결정에 책임지는 사람이 내립니다. 직접 만든 두 시스템에서 그 경계가 어디인지 확인했습니다.
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

        <p className="whyc__closesub font-ko reveal">
          두 경우 모두 도구가 맡은 일은 빨라졌고, 기준을 정하는 일은 사람에게 남았습니다. 그 기준을 세우고 실행까지 옮기는 것이 제 일입니다.
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
  { id: "tl-moef-youth", group: "public", year: "2026", color: "var(--sky)", title: "재정경제부 제1차관 청년 현장방문 및 간담회 참석",
    desc: "권대영 재정경제부 제1차관이 서울 마포구 창업기업 지원시설 SVC Seoul에서 연 청년 현장방문 및 간담회(2026. 10. 27)에 법무법인 경국 소속으로 참석했습니다. 차관 취임 후 첫 현장 행보로 마련된 자리로, 대학생 · 창업가 · 직장인 청년들이 주거 · 일자리 · 서민금융 등 3대 사회정책에 대한 현장 의견을 전했습니다.", proof: "gallery.html#moef-youth", proofLabel: "간담회 현장 보기" },
  { id: "tl-gender-forum", group: "public", year: "2026", color: "var(--apple)", title: "성평등가족부 제2차 청년세대 성별균형 공개형 공론장 〈모두의 성평등〉 참석",
    desc: "‘청년이 생각하는 성평등정책, 어디까지?’를 주제로 연세대 백양누리 그랜드볼룸에서 열린 공개형 공론장(2026. 10. 25)에 참석해 청년 세대의 시각으로 정책 토론에 함께했고, 현장에서 성평등가족부 장관과 함께했습니다.", proof: "gallery.html#gender-forum", proofLabel: "공론장 현장 보기" },
  { id: "tl-dyl", group: "public", year: "2026", color: "var(--sky)", title: "2026 민주청년지도자 양성과정 입학 · 수강 중",
    desc: "민주연구원이 주최·주관하는 2026 민주청년지도자 양성과정에 입학(2026. 10. 24)해 12월 13일까지 정책·리더십 과정을 이어 가고 있습니다. 입학식에서 김민석 당대표·강득구 민주연구원장과 함께했고, 이광재 예산결산특별위원장의 특강에서 직접 질문했으며, 박홍근 기획예산처 장관과도 현장에서 함께했습니다.", proof: "gallery.html#dyl", proofLabel: "입학식 현장 보기" },
  { id: "tl-zipconomy", group: "public", year: "2026", color: "var(--butter)", title: "한경 집코노미 박람회 2026 — KREMA AI 전시관 서비스 시연·발표",
    desc: "코엑스 D홀 KREMA AI 전시관 C-10 부스에서 청약·공공임대 맞춤 추천 서비스 집캐치와 3D 감정평가 필드워크를 소개하고, 제작 배경과 작동 방식을 설명하며 관람객 질문에 답했습니다.", proof: "gallery.html#zipconomy", proofLabel: "박람회 현장 보기" },
  { id: "tl-national-debate", group: "public", year: "2026", color: "var(--apple)", title: "국민통합위원회 2026 국민 대토론회 — 정책 제안 발표",
    desc: "〈2026 세대·젠더 분야 현장형 국민대화 국민 대토론회〉(2026. 9. 29 · aT센터) 자산 분야 트랙에서 청년 미래배당펀드팀으로 ‘청년 초과세수 미래배당펀드’를 제안·발표. 일회성으로 소진되는 초과세수를 청년 세대가 함께 불리는 자산으로 전환하는 구조를 설계." },
  { id: "tl-youth-day", group: "public", year: "2026", color: "var(--sky)", title: "청와대 대통령 주관 청년의날 행사 참석",
    desc: "대통령이 주관한 청년의날 기념행사에 청년 대표로 초청되어 참석. 청년 정책의 방향과 현장의 과제를 국정 최고 의사결정 단위에서 직접 청취하고 교류.", proof: "gallery.html#youth-day", proofLabel: "대통령 주관 행사 현장 사진 보기" },
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
  { id: "tl-claude-rag", group: "edu", year: "2026", color: "var(--lilac)", title: "한국부동산마케팅협회(KREMA) — ‘클로드 코드로 완성하는 상담 RAG 챗봇 구축’ 실습 교육 이수 (2026. 7. 25 · 1일 6시간)",
    desc: "문서 검색 · 벡터 DB · 서버리스 RAG API · 상담 화면을 하나로 잇는 구축 실습입니다. 부동산 상담이라는 도메인에 검색증강생성(RAG)을 연결해 본 교육으로, KREMA AI 마케팅 기획자 양성 4기와는 별개입니다." },
  { id: "tl-konkuk", group: "edu", year: "2026", color: "var(--butter)", title: "건국대학교 × 한국건설기술인협회 — 2026 스마트건설기술교육 이수 (2026. 6. 29 – 7. 3 · 5일 35시간)",
    desc: "건국대학교 대학일자리플러스사업단과 한국건설기술인협회가 함께 연 프로그램에서 BIM · 스마트 건설안전 · 드론 · 건설로봇을 현업 전문가와 연구자에게 배웠습니다. 건설산업의 데이터와 현장 기술을 이해하기 위한 교육이며, 법정 건설기술인 의무교육이 아닙니다." },
  { id: "tl-seoul-press", group: "public", year: "2026", color: "var(--apple)", title: "서울시민기자단 취재기자 활동",
    desc: "공공 영역의 미디어 콘텐츠를 구성·편집하고 시정(市政) 현안을 분석하여 정책 제안 과정에 참여." },
  { id: "tl-fintech", group: "edu", year: "2026", color: "var(--lilac)", title: "서울 핀테크 아카데미 14기 수료 (2026. 11. 7)",
    desc: "서울특별시와 금융 교육기관이 협약해 운영하고 금융투자협회 금융투자교육원이 진행하는 핀테크 전문교육을 약 11주 동안 금 · 토요일에 이어 들었습니다. 금융 · 디지털 서비스의 구조와 산업을 이해하는 범위를 넓힌 과정입니다." },
  { id: "tl-krema", group: "edu", year: "2026", color: "var(--pink)", title: "한국부동산마케팅협회 (KREMA) AI 마케팅 기획자 양성 과정 4기 수료",
    desc: "인공지능 기반의 부동산 시장 데이터 분석과 표적 세그먼트 도출을 학습하고, 매체별 디지털 마케팅 전략 수립 및 자동화 설계 역량을 습득." },
  { id: "tl-snu-aied", group: "edu", year: "2026", color: "var(--sky)", title: "서울대학교 AI 교육 전문가 과정 (AIED) 4기 수료",
    desc: "인공지능 메커니즘의 비즈니스 도메인 최적화 적용, 구조화된 프롬프트 엔지니어링 아키텍처의 이해와 교수법 체화." },
  { id: "tl-ssafy", group: "edu", year: "2025", color: "var(--lilac)", title: "삼성청년SW·AI아카데미(SSAFY) 13기 이수",
    desc: "소프트웨어 아키텍처와 인공지능 알고리즘을 실무 프로젝트 중심으로 학습하여 엔지니어링 역량을 내재화." },
  { id: "tl-ssafy-ambassador", group: "public", year: "2024", color: "var(--apple)", title: "삼성청년SW·AI아카데미(SSAFY) 홍보 앰배서더 활동",
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
  { id: "moef-youth", date: "10.27", day: "TUE", tone: "sage", chip: "간담회 참석",
    eyebrow: "Field Diary — 2026. 10. 27", title: "재정경제부 제1차관 청년 현장방문 및 간담회",
    body: "권대영 재정경제부 제1차관의 취임 후 첫 현장 행보로 마련된 청년 간담회에 법무법인 경국 소속으로 참석했습니다. 간담회에 앞서 SVC Seoul 입주 청년 창업기업의 AI 기반 주거지 탐색 · 공공사업 검색·매칭 서비스 시연 참관이 있었고, 대학생 · 창업가 · 직장인 청년들이 주거 · 일자리 · 서민금융에 대한 현장 의견을 전했습니다.",
    facts: [["주최", "재정경제부"], ["장소", "SVC Seoul · 서울 마포구"], ["함께", "권대영 재정경제부 제1차관 · 조영학 재정경제부 청년보좌역"], ["주제", "주거 · 일자리 · 서민금융"]],
    main: { name: "moef-group", alt: "김유빈 활동 기록 — 권대영 재정경제부 제1차관 청년 현장방문 및 간담회 단체 사진(2026. 10. 27 · SVC Seoul)", pos: "50% 45%", w: 1600, h: 777 },
    thumbs: [
      { name: "moef-nameplate", href: "gallery.html#g-moef-nameplate", alt: "김유빈 활동 기록 — 간담회 좌석의 '법무법인 경국 김유빈' 명패", pos: "50% 80%" },
      { name: "moef-tour", href: "gallery.html#g-moef-tour", alt: "김유빈 활동 기록 — SVC Seoul 입주 기업의 서비스 시연을 살펴보는 권대영 재정경제부 제1차관", pos: "40% 35%" },
      { name: "moef-talk", href: "gallery.html#g-moef-talk", alt: "김유빈 활동 기록 — 시연 현장에서 권대영 재정경제부 제1차관과 청년들", pos: "55% 35%" },
    ],
    href: "gallery.html#moef-youth", cta: "간담회 사진 전체 보기" },
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
        <SectionHead no="06 성장 경로" ko="어디로 성장하고 있는가" en="Development Trajectory"
          lead="연대순 목록보다 먼저, 다루는 문제가 어떻게 커져 왔는지 봅니다. 시기는 서로 겹칩니다 — 아래 단계는 순서가 아니라 문제의 복잡도입니다." />
        <GrowthPath />

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
    group: "everyday-tools", origin: "independent", usage: "personal", point: "자격·예산·선호 적합도·마감 긴급도를 한 점수로 섞지 않도록 분리 설계 — 미확인 자격은 불충족으로 단정하지 않고, 당첨 확률은 산출하지 않는다." },
  { n: "10", color: "var(--apple)", Icon: MapPin, title: "감정평가사 필드워크\n3D 실지조사 시뮬레이터",
    desc: "광화문에서 잠실까지 서울을 직접 걸으며 의뢰를 수행하는 3D 학습 게임. 의뢰 수임 → 현장조사 → 지적측량 → 토지이동 → 등기촉탁의 5단계를 그대로 따라가고, 조문 카드 24장과 지목 도감 28종을 장소에서 수집한다. 감정평가에 관한 규칙·공간정보관리법·건축법·민법 조문을 현장 상황에 붙여 기억하도록 설계.",
    status: "Vercel 배포 완료", cta: "필드워크 체험", url: "https://appraiser-fieldwork.vercel.app/", tags: ["Three.js · WebGL", "실지조사 5단계", "조문 24 · 지목 28"],
    point: "법조문을 글이 아니라 장소로 기억하게 만드는 것이 설계의 목표 — 서울의 실제 시간과 햇빛 아래에서 조사 절차를 몸으로 익힌다." },
  { n: "17", color: "var(--apple)", Icon: Cpu, title: "AI 에이전트 인력 운영 관제\nAtelier AX",
    desc: "AI 직원에게 업무를 배정하고, 실행 과정을 실시간으로 관찰하고, 산출물을 검증·승인하는 관제 대시보드. 라이브·업무·승인·인력·성과 5개 화면에서 도구 호출(웹 검색·파일 수정·코드 실행)과 하위 에이전트 위임·업무 인계, 정책 차단, 결재 대기를 사람이 일하는 사무실처럼 보여 준다. 서버 없이 브라우저 안에서만 도는 공개 시연 모드를 함께 제공. 2.0에서는 아이디어를 설명하면 AI 팀(기획·디자인·개발·검수)이 6단계로 일하는 과정을 쉬운 말로 보여 주고 범위·설계·검토·공개 4곳에서 사용자 승인을 받는 ‘프로젝트 스튜디오’를 더했다.",
    status: "Vercel 배포 완료", cta: "관제 화면 보기", url: "https://atelier-ax.vercel.app/performance/", tags: ["AI Agent 관제", "프로젝트 스튜디오", "승인 워크플로"],
    group: "everyday-tools", origin: "independent", usage: "personal", point: "에이전트가 한 일을 사람이 검증·승인해야 끝나는 구조 — 시연 모드의 가상 활동은 실제 성과 지표에 합산하지 않는다." },
  { n: "12", color: "var(--sky)", Icon: LayoutGrid, title: "국민용 국정 상황판\n국정 한눈에",
    desc: "대통령 동정·대통령실·정부 정책·국무회의와 국회, 증시·환율·부동산·산업까지 국정과 경제를 한 화면에 모은 상황판. 공개 뉴스 RSS와 시세를 서버리스 함수가 모아 섹션별로 배정하고, 중복 기사를 걸러 언론사 원문 사진과 함께 보여준다. 섹션 필터·검색, 지수 추이 스파크라인, 라이트·다크 모드 지원.",
    status: "Vercel 배포 완료", cta: "상황판 보기", url: "https://gukjeong-hannune.vercel.app/", tags: ["공개 RSS · 시세 수집", "Vercel Serverless", "외부 라이브러리 0"],
    group: "everyday-tools", origin: "independent", usage: "personal", point: "수집이 실패해도 화면이 비지 않게 — CDN 20분 캐시와 stale-while-revalidate로 즉시 응답하고, 실패하면 저장된 스냅샷으로 대체. 포털은 기사를 옮겨 실을 뿐 매체가 아니므로 출처·언론사 수에서 뺐다." },
  { n: "11", color: "var(--pink)", Icon: Quote, title: "성경 말씀 × 인문학 서재\nSalvation",
    desc: "\"지금, 어떤 마음이신가요?\"에서 시작해 마음 상태·주제별로 성경 말씀과 인문학·철학의 문장을 이어 주는 서재형 PWA. 오늘의 말씀, 말씀·인문학 서재, 묵상 노트·기도 제목·말씀 암송·통독 진도를 쌓는 '나의 성소', 마스코트 등불이(시편 119:105)가 안내하는 상담 챗봇까지 설계·구현.",
    status: "Vercel 배포 완료", cta: "서재 둘러보기", url: "https://malsseum-guwon.vercel.app/", tags: ["PWA · 오프라인", "Supabase 동기화", "위기 신호 안전장치"],
    point: "챗봇이 위기 신호를 감지하면 해석·성찰 대화를 즉시 멈추고 109·1577-0199 등 24시간 상담 기관을 먼저 안내 — 입력 문장은 저장하지 않고 감지 사실만 남긴다." },
  { n: "16", color: "var(--lilac)", Icon: Scale, title: "법조 시장 상황판\n법조시장 한눈에",
    desc: "정비사업·사건 수요·변호사 공급·입법·규제·로펌 경쟁을 한 화면에 모아 로펌 전략팀이 바로 전략 판단으로 옮기도록 만든 법조 시장 상황판. 열린국회정보 발의 법률안, 국가법령정보센터 시행 예정 법령·판례, 대한변협 지방회별 회원현황을 하루 단위로 갱신하고, 민법 기간 계산 조문에 맞춘 기한 계산기를 함께 제공.",
    status: "Vercel 배포 완료", cta: "상황판 보기", url: "https://legal-pulse-pearl.vercel.app", tags: ["국회 · 법제처 · 대한변협", "Next.js · 일 단위 갱신", "기한 계산기"],
    group: "everyday-tools", origin: "independent", usage: "personal", point: "출처 없는 예시 수치는 넣지 않는다 — 인증키가 없거나 수집에 실패한 값은 '인증키 필요'·'불러오지 못함'과 이유를 그대로 보여 주고, 지방회 합계가 맞지 않으면 화면에 올리지 않는다." },
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
    work: [["문제", "담당자가 메일함을 직접 열어 보며 무엇부터 답할지 판단하던 업무"], ["바꾼 흐름", "메일이 들어오면 자동으로 모아 '지금 답할 것 · 오늘 안에 볼 것 · 넘겨도 되는 것'으로 1차 분류"],
      ["내 역할", "분류 기준 설계 · 시스템 구현"], ["상태", "Vercel 배포 — 업무 화면 공개"]],
    group: "enterprise-systems", origin: "organizational", usage: "professional", point: "무엇을 '급함'으로 볼지 기준은 사람이 정하고, 1차 분류만 컴퓨터에 맡겼습니다." },
  { n: "07", color: "var(--apple)", Icon: Mail, title: "네이버웍스 메일 연동\n급여명세서 자동 발송 프로그램",
    desc: "네이버웍스(NAVER WORKS) 메일 API와 연동하여 급여명세서의 생성과 발송을 자동화한 사내 업무 프로그램. 반복되던 급여 명세 발송 절차를 표준화하여 처리 시간을 단축하고 오류 가능성을 축소.",
    status: "사내 운영 적용", cta: "사내 운영 · 비공개", url: "", tags: ["NAVER WORKS", "메일 자동화", "업무 자동화"],
    work: [["문제", "급여명세서를 사람이 만들고 한 명씩 보내던 반복 절차"], ["바꾼 흐름", "네이버웍스 메일 API로 명세서 생성과 발송을 자동화하고 절차를 표준화"],
      ["내 역할", "API 연동 · 발송 자동화 구현"], ["상태", "사내 운영 적용"], ["공개 범위", "급여 정보를 다루어 화면과 코드는 비공개"]],
    group: "enterprise-systems", origin: "organizational", usage: "professional", point: "반복되던 발송 절차를 표준화해 처리 시간을 줄이고 오류 가능성을 축소." },
];

/* 어디에 보이는가 — 번호(n)가 곧 영구 id(#ed-NN)다. 화면 순서가 바뀌어도 링크는 그대로 이어진다.
 *   everyday-tools     The Artifacts — 직접 기획 · 개발 · 배포하고 일상에서 쓰는 개인 제품 4가지(origin independent · usage personal)
 *   enterprise-systems 경국 AX 지휘실 — 실무(07 네이버웍스 급여명세서) · 운영 흐름(06 고객 메일 자동 분류)
 *   supplementary      Research Archive — 학습용 시뮬레이터 · 개인 실험 · 제안서 · 생성형 AI 콘텐츠
 * 작업의 성격(누가 만들어 어디서 쓰는가)과 배포 상태는 따로 본다 — Vercel 배포는 회사 도입의 증거가 아니다. */
const TOOL_ORDER = ["09", "16", "17", "12"];
const ARCHIVE_ORDER = ["10", "14", "11", "15", "13", "05", "01", "02", "03", "04"];
const edOf = (n) => { const e = EDITIONS.find((x) => x.n === n); return { ...e, group: e.group || "supplementary" }; };
const pad2 = (i) => String(i).padStart(2, "0");
const TOOLS = TOOL_ORDER.map((n, i) => ({ ...edOf(n), no: pad2(i + 1) }));
const ARCHIVE = ARCHIVE_ORDER.map((n, i) => ({ ...edOf(n), no: pad2(i + 1) }));
/* 네 가지 도구 — 왜 만들었는지 · 어떻게 쓰는지(작업 카드의 사실에서만) · 실제 화면 · 그 제품만의 공간 */
const TOOL_META = {
  "09": { name: "ZipCatch · 집캐치", shot: "zc-home", env: "The Housing Landscape", envKo: "지도 위 필지에서 아파트 단지가 솟고, 위치 표시가 꽂힙니다",
    why: "청약홈 분양공고와 LH 임대공고가 따로 흩어져 있어, 내 조건에 맞는 공고를 한곳에서 찾기 어려웠습니다.", use: "내 조건으로 지금 지원할 수 있는 공고와 가까운 마감을 확인할 때 씁니다.",
    made: "두 공고를 공공데이터 API로 모아, 지역 · 주거비 · 가구 조건 3단계 입력으로 지금 지원할 수 있는 후보를 정리하는 서비스.",
    link: "흩어진 주거 정보를 사용자의 판단 기준으로 다시 묶기 — 부동산 영역의 의사결정 지원" },
  "16": { name: "법조시장 한눈에", shot: "lp-home", env: "The Regulatory Landscape", envKo: "개발 대상지 위로 법률안 · 법령 · 판례가 층으로 내려앉습니다",
    why: "발의 법률안 · 시행 예정 법령 · 판례 · 변호사 현황이 기관마다 흩어져 있어, 법조 시장의 흐름을 한 번에 보기 어려웠습니다.", use: "법률안 진행과 시행 예정 법령, 불변기간 만료일을 확인할 때 씁니다.",
    made: "국회 · 법제처 · 대한변협 공개 자료를 하루 단위로 갱신하는 상황판과, 민법 기간 계산 조문에 맞춘 기한 계산기.",
    link: "흩어진 법률 정보를 리서치 흐름으로 — 출처와 연결 상태를 함께 공개" },
  "17": { name: "Atelier AX", shot: "ax-live", env: "The Agent Workspace", envKo: "사무실 평면 위 네 역할 사이로 업무가 흐르고, 승인 책상에서 끝납니다",
    why: "AI 에이전트가 무엇을 하는지 보이지 않으면 결과를 믿고 맡기기 어려웠습니다.", use: "AI 팀에 일을 맡기고 진행 단계와 승인 대기를 확인할 때 씁니다.",
    made: "AI 직원에게 업무를 배정하고, 실행 과정을 관찰하고, 산출물을 사람이 검증 · 승인하는 관제 대시보드.",
    link: "배정 · 실행 가시성 · 사람의 승인 — AX 를 운영하는 원칙 그 자체" },
  "12": { name: "국정 한눈에", shot: "gk-home", env: "The National Information Landscape", envKo: "정책 · 국회 · 경제 · 시장 네 갈래가 한 판으로 모입니다",
    why: "국정 소식과 경제 지표를 여러 포털과 앱을 오가며 봐야 했습니다.", use: "국정 · 정책 · 증시 · 환율의 흐름을 한 번에 훑을 때 씁니다.",
    made: "공개 뉴스 RSS와 시세를 서버리스 함수로 모아 섹션별로 배정하고 중복 기사를 거른 국정 · 경제 상황판.",
    link: "정책과 시장 정보를 한 장의 개관으로 — 공공 영역의 흐름 읽기" },
};

/* ============================================================ 경국 AX — 법률 AX 6대 시스템 (V6.1)
 * GROUP A(01–03) 법무법인 경국 실무 기반 · 사내 구축(화면 비공개) — 정비사업 실무라서 건축 · 공간정보 · 문서로 보여 준다.
 * GROUP B(04–06) 개인 구현 공개 시연 — legal-ax.html 과 같은 가상 데이터(legal-ax-data.js)와 같은 규칙(legal-ax-domain.js)을 그대로 쓴다.
 * 두 그룹을 합쳐 '경국 도입 6종'이라 부르지 않는다. 소속 · 구축 주체 · 운영 상태를 항목마다 따로 적는다.
 * 건축 모형(city.js)은 01 · 03 과 실무(보상자료)에서만 그리고, 04–06 을 고르면 캔버스 장면을 내린다. */
const AX_SYSTEMS = [
  { id: "ax-reintel", number: "01", group: "A", koreanTitle: "정비사업 법령·규제 변화 관제", englishName: "RE:INTELLIGENCE",
    category: "firm-practice", ownership: "law-firm-work", implementationStatus: "internal-built",
    problem: "정비사업은 사업 단계 · 토지이용규제 · 조례 · 고시 · 행정절차의 변화에 영향을 받습니다. 서로 다른 출처를 손으로 확인하면 검토 누락이 생길 수 있습니다.",
    solution: "사업지를 기준으로 법령 · 고시 · 조례 · 행정 공고의 변화를 모으고, 그 사업의 어느 단계와 부지의 어느 요소에 관련되는지 정리해 변호사 검토로 올리는 구조를 설계했습니다.",
    built: "법무법인 경국 사내에서 구축했습니다. 실제 화면과 자료는 공개하지 않으며, 이 화면의 사업지 · 변경은 가상입니다.",
    human: "감지된 변경이 그 사업에 어떤 법적 효력을 갖는지는 변호사가 판단합니다. 시스템은 검토 대상을 드러낼 뿐입니다.",
    interaction: "사업지 A/B/C 를 고르면 필지 · 건물 배치 · 사업 단계가 함께 바뀌고, 규제 레이어를 고르면 그 레이어가 부지의 어느 부분에 걸리는지 보입니다.",
    demoPath: null, evidence: "career.html#practice-strategy" },
  { id: "ax-assembly", number: "02", group: "A", koreanTitle: "정비사업 총회결의 절차 검토", englishName: "Assembly Risk Engine",
    category: "firm-practice", ownership: "law-firm-work", implementationStatus: "internal-built",
    problem: "조합원 명부 · 의결권 · 위임장 · 소집 통지 · 정족수 · 안건별 결과 사이의 불일치를 사람이 반복해서 대조해야 합니다.",
    solution: "서류를 서로 맞대는 대조 규칙을 정하고, 맞지 않는 곳을 '확인 필요' 예외 목록으로 모으는 구조를 설계했습니다.",
    built: "법무법인 경국 사내에서 구축했습니다. 실제 명부 · 서류는 공개하지 않으며, 이 화면의 총회 · 조합원 · 수치는 가상입니다.",
    human: "총회결의의 효력이나 무효 여부는 시스템이 정하지 않습니다. 예외 목록을 보고 변호사가 판단합니다.",
    interaction: "안건을 고르면 의결권 · 정족수 대조가 바뀌고, 검토 규칙을 누르면 그 규칙이 보는 가상 서류와 해당 조합원 자리가 표시됩니다.",
    demoPath: null, evidence: "career.html#practice-strategy" },
  { id: "ax-contract", number: "03", group: "A", koreanTitle: "공사도급계약 변경사항 검토", englishName: "Contract Risk Intelligence",
    category: "firm-practice", ownership: "law-firm-work", implementationStatus: "internal-built",
    problem: "계약 변경에 따라 공사 범위 · 공사비 · 지급조건 · 책임 부담이 달라질 수 있고, 두 계약서를 눈으로 비교하면 바뀐 조항을 놓치기 쉽습니다.",
    solution: "변경 전 · 후 계약서를 조항 단위로 맞대고, 바뀐 조항을 대금 · 책임 · 손해배상 같은 검토 분류에 걸어 표시하는 구조를 설계했습니다.",
    built: "법무법인 경국 사내에서 구축했습니다. 실제 계약서는 공개하지 않으며, 이 화면의 건축물 · 계약 조항은 가상입니다.",
    human: "공사비 증액의 크기나 법적 책임의 유불리는 시스템이 계산하지 않습니다. 바뀐 곳만 보여 주고, 판단은 변호사가 내립니다.",
    interaction: "변경 전 · 후 손잡이를 움직이면 건축물의 층수가 바뀌고, 그 변경과 연결된 계약 조항과 검토 항목이 차례로 강조됩니다.",
    demoPath: "legal-ax.html#task=contract&field=realestate", evidence: "career.html#practice-strategy" },
  { id: "ax-evidence", number: "04", group: "B", koreanTitle: "송무기록·쟁점·증거 분석", englishName: "Litigation Evidence Intelligence",
    category: "personal-demo", ownership: "independent", implementationStatus: "public-demo",
    problem: "사건기록에 흩어진 주장 · 사실 · 증거 · 시간의 흐름을 한 번에 파악하기 어렵습니다.",
    solution: "주장마다 근거 자료를 잇고, 근거가 원문의 어느 문단에 있는지 기록하며, 주장과 자료의 기재가 다르면 규칙으로 표시하는 구조를 만들었습니다.",
    built: "개인 구현 공개 시연입니다. 민사 · 형사 · 가사 등 일곱 분야의 가상 사건으로 실제 작동합니다(모델 호출 없음 · 규칙 기반 · 문서 검색).",
    human: "자료가 다르다는 표시는 '추가 검토 필요'일 뿐, 사실인정이나 진술의 진위 판단이 아닙니다.",
    interaction: "주장을 누르면 관련 증거가 강조되고, 증거를 누르면 그 문서의 원문 문단이 열립니다.",
    demoPath: "legal-ax.html#task=evidence&field=civil", evidence: "legal-ax.html#task=evidence&field=civil" },
  { id: "ax-research", number: "05", group: "B", koreanTitle: "법령·문서 근거 탐색", englishName: "Legal Research Desk",
    category: "personal-demo", ownership: "independent", implementationStatus: "public-demo",
    problem: "법률정보의 정확성은 답변의 유창함이 아니라 근거와 기준일의 확인에서 출발합니다.",
    solution: "색인된 법령 조문과 사건 문서만 찾고, 요약과 원문을 나누어 보여 주며, 원문을 옮긴 시점과 출처 확인 상태를 함께 적었습니다.",
    built: "개인 구현 공개 시연입니다. 판례 원문은 연동하지 않았으므로 판례 검색 기능이라고 부르지 않습니다.",
    human: "조문의 현행 여부와 사안 적용은 국가법령정보센터 원문과 변호사의 검토로 확인합니다.",
    interaction: "검색어와 자료 종류에 따라 결과가 바뀌고, 결과를 고르면 원문 · 요약 · 기준일이 바뀝니다. 사건 문서는 해당 문단으로 이어집니다.",
    demoPath: "legal-ax.html#task=research&field=civil", evidence: "legal-ax.html#task=research&field=civil" },
  { id: "ax-matter", number: "06", group: "B", koreanTitle: "사건 접수·기한·검토 업무관리", englishName: "Matter Operations",
    category: "personal-demo", ownership: "independent", implementationStatus: "public-demo",
    problem: "상담부터 자료 수집 · 담당자 지정 · 기한 확인 · 검토 승인까지 진행 상태가 여러 경로에 흩어집니다.",
    solution: "사건 단계 · 담당자 · 필요 서류 · 기한 · 검토 상태를 한 화면에 두고, 바꾼 내용을 모두 가상 감사기록에 남기는 구조를 만들었습니다.",
    built: "개인 구현 공개 시연입니다. 외부 제출 · 발송 기능은 없고, 상태는 이 브라우저 탭에만 저장됩니다.",
    human: "법정기간은 자동으로 확정하지 않습니다. 송달일 · 기산점 · 공휴일 · 개별 절차를 변호사가 확인합니다.",
    interaction: "담당자 · 서류 보유 · 업무 단계 · 검토 상태를 바꾸면 화면과 감사기록에 바로 반영되고, 상세 시연과 같은 기록을 씁니다.",
    demoPath: "legal-ax.html#task=matter&field=civil", evidence: "legal-ax.html#task=matter&field=civil" },
];
const AX_STATUS_KO = { "internal-built": "경국 사내 구축 · 화면 비공개", "internal-applied": "경국 사내 적용", "public-demo": "개인 구현 · 공개 시연", planned: "향후 고도화" };
const AX_GROUPS = [
  { k: "A", ko: "법무법인 경국 실무 기반 전문 AX", sub: "정비사업 · 사내 구축 · 화면 비공개" },
  { k: "B", ko: "개인 구현 법률 AX 공개 시연", sub: "가상 사건 · 직접 작동 · 경국 도입 시스템 아님" },
];
/* 시스템 01 — 가상 사업지 세 곳. 단계 · 변경 감지는 가상이며 실제 고시 · 조례가 아니다 */
const RE_STAGES = ["정비구역 지정", "조합 설립", "사업시행계획", "관리처분계획", "착공 · 분양", "준공 · 이전"];
const RE_SITES = [
  { k: "A", type: "재개발 · 노후 저층 주거지(가상)", stage: 2, flag: 2, change: "가상 조례 개정안 — 건축물 높이 기준 관련 문구 변경 감지", rel: "사업시행계획 — 건축계획(높이) 검토" },
  { k: "B", type: "재건축 · 중층 아파트 단지(가상)", stage: 2, flag: 1, change: "가상 도시관리계획 결정 고시 — 용도지역 경계 조정 관련 고시 감지", rel: "사업시행계획 — 용적률 · 건축 규모의 전제 검토" },
  { k: "C", type: "소규모 블록 정비(가상)", stage: 2, flag: 3, change: "가상 행정 공고 — 접도 도로 확폭 계획 공고 감지", rel: "사업시행계획 — 대지 경계 · 기반시설 부담 검토" },
];
const RE_LAYERS = [
  { ko: "정비구역 경계", src: "정비계획 고시", where: "사업지 경계선 전체 — 금색 점선" },
  { ko: "용도지역 구분", src: "토지이용규제", where: "사업지를 나누는 두 구역 — 색으로 구분" },
  { ko: "높이 기준", src: "조례", where: "계획 매스 위의 기준면 — 남색 면" },
  { ko: "접도 도로 · 기반시설", src: "행정 공고", where: "사업지의 한 변과 확폭 예정 띠" },
];
/* 시스템 02 — 가상 총회. 수치는 시연용이며, 정족수 기준은 '가상 정관'의 시연 규칙이다(실제 요건은 법령 · 정관 확인) */
const ASM = {
  members: 120, direct: 26, proxy: 21, written: 41,
  agendas: [
    { id: "a1", ko: "제1호 안건 — 예산안 승인", rule: "half", yes: 58, no: 22, abst: 8 },
    { id: "a2", ko: "제2호 안건 — 정비사업비 변경", rule: "twothirds", yes: 81, no: 5, abst: 2 },
    { id: "a3", ko: "제3호 안건 — 임원 선임", rule: "direct", yes: 51, no: 30, abst: 7 },
  ],
  ruleKo: { half: "조합원 과반수 출석 · 출석 과반수 찬성", twothirds: "조합원 3분의 2 이상 찬성", direct: "과반수 출석 · 출석 과반수 찬성 · 조합원 20% 이상 직접 출석" },
  exc: [
    { id: "E1", ko: "위임장 2건 — 위임인 서명 대조 불일치", seats: [30, 41], dPresent: 2, dYes: 2, rule: "R3" },
    { id: "E2", ko: "명부 미등재 의결권 1건 — 권리 승계 신고 확인 필요", seats: [60], dPresent: 1, dYes: 1, rule: "R2" },
    { id: "E3", ko: "소집 통지 수령 확인 누락 3명", seats: [95, 101, 117], dPresent: 0, dYes: 0, rule: "R1" },
    { id: "E4", ko: "서면결의서 · 현장 출석 중복 1건", seats: [5], dPresent: 1, dYes: 1, rule: "R4" },
  ],
  rules: [
    { id: "R1", ko: "소집 통지 대조", docs: ["소집 공고문", "등기우편 발송 목록", "수령 확인 목록"], who: "absent" },
    { id: "R2", ko: "조합원 명부 대조", docs: ["조합원 명부(기준일)", "권리 승계 신고서"], who: "written" },
    { id: "R3", ko: "위임장 검토", docs: ["위임장 21건", "서명 대조표"], who: "proxy" },
    { id: "R4", ko: "서면결의 · 출석 중복", docs: ["서면결의서 접수대장", "현장 출석부"], who: "direct" },
    { id: "R5", ko: "정족수 · 의결 대조", docs: ["출석 집계표", "안건별 투표 결과표"], who: "all" },
  ],
};

/* 단계 자동 재생 — 화면에 처음 들어오면 한 번 끝까지, 이후로는 누른 단계로 (실무 카드) */
function useStepper(ctl, n, gap) {
  const [step, setStep] = React.useState(-1);
  const timer = React.useRef(0);
  const go = (i, ms) => { setStep(i); if (ctl.current) ctl.current.tween("k", i + 1, ms || 1100); };
  const play = () => {
    clearTimeout(timer.current);
    let i = 0;
    const tick = () => { go(i); i += 1; if (i < n) timer.current = setTimeout(tick, prefersCalm() ? 0 : gap || 1600); };
    tick();
  };
  const stop = () => clearTimeout(timer.current);
  React.useEffect(() => stop, []);
  return { step, go: (i) => { stop(); go(i); }, play, stop, reset: () => { stop(); setStep(-1); } };
}
function useOnce(ref, fn, thr) {
  React.useEffect(() => {
    const el = ref.current;
    if (!el || !window.IntersectionObserver) { fn(); return; }
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); fn(); } }, { threshold: thr || 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
}

/* ---------------------------------------------------------------- 지연 로드 — 건축 엔진 · 법률 AX 데이터는 경국 AX 섹션 가까이에서만 */
const AX_ASSETS = { city: "city.js?v=3", data: "legal-ax-data.js?v=1", domain: "legal-ax-domain.js?v=1" };
const axLoading = {};
function loadScript(src) {
  if (!axLoading[src]) axLoading[src] = new Promise((ok, no) => {
    const s = document.createElement("script"); s.src = src; s.async = true;
    s.onload = ok; s.onerror = () => { delete axLoading[src]; no(new Error(src)); };
    document.head.appendChild(s);
  });
  return axLoading[src];
}
const AXReady = React.createContext({ city: false, lax: false });
function useNear(ref, margin) {
  const [near, setNear] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || !window.IntersectionObserver) { setNear(true); return; }
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: margin || "900px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return near;
}
function useScripts(on, list) {
  const [ok, setOk] = React.useState(false);
  React.useEffect(() => {
    if (!on || ok) return;
    let live = true;
    Promise.all(list.map(loadScript)).then(() => { if (live) setOk(true); }, () => {});
    return () => { live = false; };
  }, [on]);
  return ok;
}
/* 캔버스 장면 — 엔진이 준비되면 붙이고, 컴포넌트가 내려가면 정리한다(타이머 · 관찰자 · rAF) */
function useScene(cv, name, state) {
  const ready = React.useContext(AXReady).city;
  const ctl = React.useRef(null), latest = React.useRef(state);
  latest.current = state; /* 엔진이 늦게 오면 그때의 화면 상태로 붙인다 */
  React.useEffect(() => {
    if (!ready || !window.City) return;
    ctl.current = window.City.mount(cv.current, name, { state: latest.current || {} });
    return () => { if (ctl.current) ctl.current.destroy(); ctl.current = null; };
  }, [ready]);
  return ctl;
}

/* ---------------------------------------------------------------- 법률 AX 상태 — 상세 시연(legal-ax.html)과 같은 탭 저장소를 쓴다 */
const LAX_KEY = "lax.state.v1";
function useLaxState() {
  const D = window.LAX_DATA, L = window.LAX;
  const [st, setSt] = React.useState(() => {
    const base = L.initial(D);
    try { const raw = sessionStorage.getItem(LAX_KEY); if (raw) { const s = JSON.parse(raw); if (s && s.v === base.v) return Object.assign(base, s); } } catch (e) {}
    return base;
  });
  React.useEffect(() => { try { sessionStorage.setItem(LAX_KEY, JSON.stringify(st)); } catch (e) {} }, [st]);
  return [st, (a) => setSt((s) => L.reduce(s, a))];
}
const laxCase = (fid) => { const D = window.LAX_DATA; return D.cases.find((c) => c.id === D.fields.find((f) => f.id === fid).caseId); };

function AXCommand() {
  const sec = React.useRef(null), stage = React.useRef(null);
  const near = useNear(sec);
  const city = useScripts(near, [AX_ASSETS.city]);
  const lax = useScripts(near, [AX_ASSETS.data, AX_ASSETS.domain]);
  const [sys, setSys] = React.useState(0);
  React.useEffect(() => {
    /* #ax-evidence 같은 깊은 링크로 들어오면 그 시스템을 고른다 */
    const pick = () => { const i = AX_SYSTEMS.findIndex((x) => "#" + x.id === location.hash); if (i > -1) setSys(i); };
    pick(); window.addEventListener("hashchange", pick);
    return () => window.removeEventListener("hashchange", pick);
  }, []);
  const cur = AX_SYSTEMS[sys];
  const Demo = [Sys01, Sys02, Sys03, Sys04, Sys05, Sys06][sys];
  return (
    <AXReady.Provider value={{ city, lax }}>
    <section id="ax-desk" ref={sec} className="axc" aria-labelledby="axc-title">
      <div className="wrap axc__wrap">
        <header className="axc__mast">
          <p className="axc__k font-ko">03 법무법인 경국 AX <span className="font-sans" lang="en">Gyunggook AX · Six Legal AX Systems</span></p>
          <h2 id="axc-title" className="axc__title"><span className="font-ko">법률 실무를 이해하고,<br />업무의 구조를 바꾸는 AX</span><span className="font-serif" lang="en">Legal Operations · Evidence Intelligence · Contract Review · Workflow Automation</span></h2>
          <div className="axc__lead font-ko">
            <p>정비사업 실무에서 출발한 AX 경험을 바탕으로, 송무기록 분석과 법률정보 탐색, 사건 관리까지 적용 범위를 확장하고 있습니다.</p>
            <p><b>기술은 정보를 정리하고 검토를 돕지만, 최종 법률 판단은 변호사가 내립니다.</b></p>
          </div>
          <ul className="axc__states font-ko" aria-label="실적 상태 구분">
            <li><b className="axc__st axc__st--a">A</b><span><strong>사내 실무 적용</strong> 정비사업 AX 3종(01–03 · 사내 구축 · 화면 비공개) · 급여명세서 자동 발송(사내 운영 적용) · 고객 메일 자동 분류(업무 화면 배포)</span></li>
            <li><b className="axc__st axc__st--b">B</b><span><strong>개인 구현 · 공개 시연</strong> 법률 AX 3종(04–06) — 가상 사건으로 직접 써 보는 시연. 경국에서 도입 · 운영한 시스템이 아닙니다</span></li>
            <li><b className="axc__st axc__st--c">C</b><span><strong>향후 고도화</strong> 송무기록 분석 · 계약 검토의 실제 사건 적용 — 검증 전이라 완료로 적지 않습니다</span></li>
          </ul>
        </header>

        <TrialBriefFeature />
        <p className="axc__count font-ko"><b>AX 시스템 6종</b> = 경국 실무 기반 3종 + 개인 공개 시연 3종 <span>‘16개 결과물’은 전체 작업 기록 수로, 이 6종과 따로 셉니다.</span></p>
        <div className="axc__console">
          <nav className="axc__nav" aria-label="AX 6대 시스템 고르기">
            {AX_GROUPS.map((g) => (
              <div key={g.k} className={"axc__grp axc__grp--" + g.k.toLowerCase()}>
                <p className="axc__gh font-ko"><b className={"axc__st axc__st--" + g.k.toLowerCase()}>{g.k}</b><span><strong>{g.ko}</strong><em>{g.sub}</em></span></p>
                <ol>
                  {AX_SYSTEMS.map((x, i) => x.group !== g.k ? null : (
                    <li key={x.id} id={x.id}>
                      <button type="button" aria-pressed={i === sys} onClick={() => setSys(i)}>
                        <b className="font-serif">{x.number}</b>
                        <span><strong className="font-ko">{x.koreanTitle}</strong><em className="font-sans" lang="en">{x.englishName}</em><i className="font-ko">{AX_STATUS_KO[x.implementationStatus]}</i></span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </nav>

          <div className="axc__main" ref={stage}>
            <header className="axc__mh">
              <p className="font-sans"><b>{cur.number}</b> {cur.englishName}<span className={"axc__tag axc__tag--" + cur.group.toLowerCase() + " font-ko"}>{AX_STATUS_KO[cur.implementationStatus]}</span></p>
              <h3 className="font-ko">{cur.koreanTitle}</h3>
              <p className="axc__how font-ko">{cur.interaction}</p>
            </header>
            <div className="axc__demo-box">
              <Demo key={cur.id} sys={cur} />
            </div>
            <ol className="axc__story font-ko" aria-label={cur.koreanTitle + " — 문제에서 판단까지"}>
              <li><b>01 발견한 문제</b>{cur.problem}</li>
              <li><b>02 설계한 구조</b>{cur.solution}</li>
              <li><b>03 실제 구현</b>{cur.built}</li>
              <li><b>04 사람에게 남는 판단</b>{cur.human}</li>
            </ol>
            <p className="axc__links font-ko">
              {cur.group === "B"
                ? <a className="axc__go" href={cur.demoPath}>상세 시연에서 직접 써 보기 <ArrowUpRight size={15} /></a>
                : cur.demoPath ? <a className="axc__go axc__go--ghost" href={cur.demoPath}>개인 공개 시연에서 같은 가상 계약을 조항별로 보기 <ArrowUpRight size={15} /></a> : null}
              <span>{cur.group === "A" ? "사내 구축 시스템 — 실제 화면 · 자료 비공개, 위 시연은 가상" : "모든 사건 · 문서는 가상 자료 — 실제 의뢰인 정보 없음"}</span>
            </p>
          </div>
        </div>

        <header className="axc__subhead">
          <h3 className="font-ko">법무법인 경국에서 맡은 실무 <span className="font-sans" lang="en">Practical Execution</span></h3>
        </header>
        <div className="axc__practice">
          <PracticeComp item={AX_SUPPORT[0]} />
          <PracticePayroll item={AX_SUPPORT[1]} ed={edOf("07")} />
        </div>
        <OpsMail e={edOf("06")} />
        <a className="axc__lax" href="legal-ax.html">
          <span className="axc__st axc__st--b font-sans">B</span>
          <span className="axc__lax-t"><small className="font-ko">개인 구현 공개 시연 · 모든 사건과 문서는 가상 자료</small><strong className="font-ko">법률 AX 업무체계 직접 살펴보기</strong>
            <em className="font-ko">송무기록 분석 · 계약 변경 비교 · 법령 · 문서 근거 탐색 · 사건 진행 관리 — 민사 · 형사 · 가사 · 기업 · 노동 · 행정 · 정비사업 일곱 분야</em></span>
          <ArrowUpRight size={20} />
        </a>
        <p className="axc__note font-ko">의뢰인 · 사건 정보와 사내 화면은 공개하지 않습니다.</p>
      </div>
    </section>
    </AXReady.Provider>
  );
}
/* 대표 프로젝트 — Gyunggook Trial Brief (개인 구현 시제품 · 경국 도입 아님). 성과 칸에는 테스트로 확인한 것만 */
const TB_CARD = {
  cat: "법률 AX · 업무혁신 · 제품기획",
  title: "재판 준비 업무를 한 장의 브리핑으로 구조화",
  desc: "사건기록과 기일 준비사항을 연결해 변호사가 핵심 쟁점 · 증거 · 미결 과제를 빠르게 확인할 수 있는 1페이지 브리핑 시스템을 설계 · 구현한 프로젝트",
  roles: ["법률 실무 프로세스 분석", "사건 데이터 · 정보구조 설계", "근거 기반 요약 · 정합성 검증", "사용자 중심 인터페이스 구현", "자동화 테스트 · 품질관리"],
  proof: ["가상 민사사건 3건 — 문서 등록부터 A4 1장 PDF 출력까지 브라우저 자동 테스트 통과(Chromium · WebKit)", "넣어 둔 문서 불일치 · 누락 15건 모두 검출, 그 밖의 항목 표시 0건(테스트 자료 기준)", "실무 도입 · 시간 단축 효과는 측정하지 않음(미도입)"],
};
function TrialBriefFeature() {
  return (
    <article id="trial-brief" className="axc__tb" aria-labelledby="tb-card-h">
      <a className="axc__tb-shot" href="trial-brief.html#case=TB-CV-01&view=brief" aria-label="Gyunggook Trial Brief 1페이지 브리핑 화면 열기">
        <picture>
          <source media="(max-width: 760px)" type="image/avif" srcSet="images/product/tb-brief-m600.avif" />
          <source media="(max-width: 760px)" type="image/webp" srcSet="images/product/tb-brief-m600.webp" />
          <source type="image/avif" srcSet="images/product/tb-brief-720.avif 720w, images/product/tb-brief-1280.avif 1280w" sizes="(max-width: 860px) 92vw, 40vw" />
          <img src="images/product/tb-brief-720.webp" srcSet="images/product/tb-brief-720.webp 720w, images/product/tb-brief-1280.webp 1280w" sizes="(max-width: 860px) 92vw, 40vw" alt="Gyunggook Trial Brief — 가상 누수 손해배상 사건의 A4 1장 브리핑: 기일 · 사건 요약 · 핵심 쟁점 · 증거 · 위험 · 검토 상태" width="1280" height="1818" loading="lazy" decoding="async" />
        </picture>
        <span className="font-ko">실제 시제품 화면 · 가상 사건</span>
      </a>
      <div className="axc__tb-txt font-ko">
        <p className="axc__tb-k"><b>대표 프로젝트</b>{TB_CARD.cat}<span className="axc__tag axc__tag--b">개인 구현 시제품 · 경국 도입 아님</span></p>
        <h3 id="tb-card-h"><span className="font-sans" lang="en">Gyunggook Trial Brief</span>{TB_CARD.title}</h3>
        <p className="axc__tb-d">{TB_CARD.desc}</p>
        <dl className="axc__tb-dl">
          <div><dt>담당</dt><dd>개인 프로젝트 · 기획부터 구현 · 테스트까지 단독 수행</dd></div>
          <div><dt>핵심 기여</dt><dd><ul>{TB_CARD.roles.map((r) => <li key={r}>{r}</li>)}</ul></dd></div>
          <div><dt>검증</dt><dd><ul>{TB_CARD.proof.map((r) => <li key={r}>{r}</li>)}</ul></dd></div>
          <div><dt>상태</dt><dd>공개 시제품 — 규칙 기반 · AI 모델 미사용 · 실제 사건자료 없음</dd></div>
        </dl>
        <p className="axc__tb-flow">사건 선택 → 자료 확인 → 불일치 탐지 → 담당자 검토 → 1페이지 브리핑 → PDF 출력</p>
        <p className="axc__links"><a className="axc__go" href="trial-brief.html">시제품 직접 써 보기 <ArrowUpRight size={15} /></a><a className="axc__go axc__go--ghost" href="trial-brief.html#tb-case">프로젝트 개요(문제 → 확장)</a></p>
      </div>
    </article>
  );
}
const AXWait = ({ t }) => <p className="axc__wait font-ko">{t || "시연을 불러오는 중입니다…"}</p>;

/* 01 — 가상 사업지 · 규제 레이어 (건축 · 공간정보) */
function Sys01() {
  const cv = React.useRef(null);
  const [site, setSite] = React.useState(0);
  const [lay, setLay] = React.useState(2);
  const [req, setReq] = React.useState({});
  const ctl = useScene(cv, "reg", { site, lay, la: 1, req: req[site] ? 1 : 0 });
  const S = RE_SITES[site];
  const pickSite = (i) => {
    if (i === site) return;
    setSite(i); const c = ctl.current;
    if (c) { c.set("site", i); c.set("req", req[i] ? 1 : 0); c.set("inn", 0); c.tween("inn", 1, 1100); }
  };
  const pickLay = (i) => { setLay(i); const c = ctl.current; if (c) { c.set("lay", i); c.set("la", 0); c.tween("la", 1, 750); } };
  const ask = () => { const n = Object.assign({}, req, { [site]: !req[site] }); setReq(n); if (ctl.current) ctl.current.set("req", n[site] ? 1 : 0); };
  const hot = lay === S.flag;
  return (
    <div className="ax1">
      <div className="ax1__left">
        <div className="ax1__board">
          <canvas ref={cv} aria-hidden="true" />
          <p className="ax-fic font-ko">가상 사업지 · 개념 모형 — 실제 지번 · 용도지역 · 도시계획이 아닙니다</p>
        </div>
        <div className="ax1__sites font-ko" role="group" aria-label="가상 사업지 고르기">
          {RE_SITES.map((x, i) => <button key={x.k} type="button" aria-pressed={i === site} onClick={() => pickSite(i)}><b>사업지 {x.k}</b><span>{x.type.replace("(가상)", "")}</span></button>)}
        </div>
      </div>
      <div className="ax1__side font-ko">
        <p className="ax1__site"><b>가상 사업지 {S.k}</b>{S.type}</p>
        <ol className="ax1__stages" aria-label="사업 단계(가상)">{RE_STAGES.map((t, i) => <li key={t} className={i < S.stage ? "is-done" : i === S.stage ? "is-now" : ""}>{t}</li>)}</ol>
        <p className="ax-h">규제 레이어 — 누르면 부지의 해당 부분이 표시됩니다</p>
        <div className="ax1__layers" role="group" aria-label="규제 레이어">
          {RE_LAYERS.map((Ly, i) => (
            <button key={Ly.ko} type="button" aria-pressed={i === lay} onClick={() => pickLay(i)}>
              <span><b>{Ly.ko}</b><em>{Ly.src}</em></span>{i === S.flag && <i>변경 감지</i>}
            </button>
          ))}
        </div>
        <p className="ax1__where"><b>{RE_LAYERS[lay].ko}</b> · {RE_LAYERS[lay].where}</p>
        <div className={"ax1__cand" + (hot ? " is-hot" : "")}>
          <p className="ax-h">변경 감지 후보 <span>검토 대상 표시 · 법적 효력 판단 아님</span></p>
          <p><b>{S.change}</b>관련 사업 단계 · {S.rel}</p>
          {!hot && <p className="ax-muted">이 후보는 ‘{RE_LAYERS[S.flag].ko}’ 레이어에 걸려 있습니다.</p>}
          <button type="button" className="ax-btn" aria-pressed={!!req[site]} onClick={ask}>{req[site] ? "변호사 검토 요청됨(시연) — 판단 대기" : "변호사 검토 요청"}</button>
        </div>
      </div>
    </div>
  );
}

/* 02 — 가상 총회장 평면 · 의결권 대조 (건물 없이 — 평면 · 도표 · 문서 관계) */
function asmCount(ag, excl) {
  const ex = excl ? ASM.exc : [];
  const dP = ex.reduce((a, e) => a + e.dPresent, 0), dY = ex.reduce((a, e) => a + e.dYes, 0);
  const present = ASM.direct + ASM.proxy + ASM.written - dP, yes = ag.yes - dY, half = Math.floor(ASM.members / 2) + 1;
  const checks = [["출석", present, half, present >= half, "조합원 과반수 " + half + "명 이상"]];
  if (ag.rule === "twothirds") { const t = Math.ceil((ASM.members * 2) / 3); checks.push(["찬성", yes, t, yes >= t, "조합원 3분의 2 " + t + "명 이상"]); }
  else checks.push(["찬성", yes, Math.floor(present / 2) + 1, yes > present / 2, "출석 과반수 " + (Math.floor(present / 2) + 1) + "명 이상"]);
  if (ag.rule === "direct") { const t = Math.ceil(ASM.members * 0.2), d = ASM.direct; checks.push(["직접 출석", d, t, d >= t, "조합원 20% " + t + "명 이상"]); }
  return { present, yes, checks };
}
function Sys02() {
  const [ag, setAg] = React.useState(1);
  const [rule, setRule] = React.useState("R3");
  const [excl, setExcl] = React.useState(false);
  const A = ASM.agendas[ag], raw = asmCount(A, false), adj = asmCount(A, true), now = excl ? adj : raw;
  const R = ASM.rules.find((x) => x.id === rule), hits = ASM.exc.filter((e) => e.rule === rule || rule === "R5");
  const flip = raw.checks.some((c, i) => c[3] !== adj.checks[i][3]);
  /* 좌석 — 앞줄부터 직접 출석 26 · 대리 21. 서면 41 · 미출석 32 는 옆 묶음 */
  const seats = [];
  for (let row = 0; row < 5; row++) { const n = 9 + row * 2, rad = 46 + row * 22; for (let k = 0; k < n; k++) { const a = (152 - (k / (n - 1)) * 124) * Math.PI / 180; seats.push([200 + Math.cos(a) * rad, 30 + Math.sin(a) * rad * 0.92]); } }
  const kind = (m) => (m < ASM.direct ? "direct" : m < ASM.direct + ASM.proxy ? "proxy" : m < ASM.direct + ASM.proxy + ASM.written ? "written" : "absent");
  const flagged = new Set(hits.flatMap((e) => e.seats));
  const lit = (m) => R.who === "all" || kind(m) === R.who;
  const pctW = (v) => Math.min(100, (v / ASM.members) * 100) + "%";
  return (
    <div className="ax2">
      <div className="ax2__agendas font-ko" role="group" aria-label="가상 안건">
        {ASM.agendas.map((x, i) => <button key={x.id} type="button" aria-pressed={i === ag} onClick={() => setAg(i)}><b>{x.ko}</b><em>시연 규칙 · {ASM.ruleKo[x.rule]}</em></button>)}
      </div>
      <div className="ax2__grid">
        <figure className="ax2__plan">
          <svg viewBox="0 0 400 262" role="img" aria-label={"가상 총회장 평면 — 조합원 " + ASM.members + "명 중 현장 " + (ASM.direct + ASM.proxy) + "석, 서면 " + ASM.written + ", 미출석 " + (ASM.members - ASM.direct - ASM.proxy - ASM.written)}>
            <rect x="8" y="8" width="384" height="246" fill="none" stroke="currentColor" strokeOpacity=".25" />
            <rect x="160" y="12" width="80" height="20" className="ax2__dais" /><text x="200" y="26" textAnchor="middle" className="ax2__t">단상 · 의장석</text>
            <rect x="24" y="16" width="70" height="22" className="ax2__desk" /><text x="59" y="31" textAnchor="middle" className="ax2__t">접수 · 대조</text>
            {seats.map((p, i) => { const m = i, inHall = m < ASM.direct + ASM.proxy; const k = inHall ? kind(m) : "empty"; return (
              <g key={i} className={"ax2__seat ax2__seat--" + k + (inHall && lit(m) ? " is-lit" : "") + (flagged.has(m) ? " is-flag" : "")}><circle cx={p[0].toFixed(1)} cy={p[1].toFixed(1)} r="5" /></g>
            ); })}
            <g className="ax2__tray"><rect x="318" y="176" width="66" height="70" /><text x="351" y="194" textAnchor="middle" className="ax2__t">서면결의</text><text x="351" y="216" textAnchor="middle" className="ax2__n">{ASM.written}</text>
              {hits.some((e) => e.id === "E2" || e.id === "E4") && <circle cx="376" cy="184" r="5" className="ax2__flagdot" />}</g>
            <g className="ax2__tray ax2__tray--abs"><rect x="16" y="176" width="66" height="70" /><text x="49" y="194" textAnchor="middle" className="ax2__t">미출석</text><text x="49" y="216" textAnchor="middle" className="ax2__n">{ASM.members - ASM.direct - ASM.proxy - ASM.written}</text>
              {hits.some((e) => e.id === "E3") && <circle cx="74" cy="184" r="5" className="ax2__flagdot" />}</g>
          </svg>
          <figcaption className="font-ko"><span className="k k--d">직접 출석 {ASM.direct}</span><span className="k k--p">대리(위임) {ASM.proxy}</span><span className="k k--w">서면 {ASM.written}</span><span className="k k--f">확인 필요 표시</span></figcaption>
        </figure>
        <div className="ax2__side font-ko">
          <p className="ax-h">검토 규칙 — 누르면 관련 서류 · 자리가 표시됩니다</p>
          <div className="ax2__rules" role="group" aria-label="검토 규칙">
            {ASM.rules.map((x) => <button key={x.id} type="button" aria-pressed={x.id === rule} onClick={() => setRule(x.id)}><code>{x.id}</code>{x.ko}</button>)}
          </div>
          <p className="ax2__docs"><b>살펴보는 가상 서류</b>{R.docs.map((d) => <span key={d}>{d}</span>)}</p>
          <ul className="ax2__exc" aria-label="예외 목록">
            {hits.length ? hits.map((e) => <li key={e.id}><code>{e.id}</code>{e.ko}<i>확인 필요</i></li>) : <li className="ax-muted">이 규칙에 걸린 예외 없음</li>}
          </ul>
        </div>
      </div>
      <div className="ax2__q font-ko">
        <div className="ax2__qh"><p className="ax-h">정족수 · 의결 대조 — {A.ko}</p>
          <label className="ax-switch"><input type="checkbox" checked={excl} onChange={(e) => setExcl(e.target.checked)} />예외 4건을 빼고 다시 대조</label></div>
        {now.checks.map(([k, v, t, ok, ko], i) => (
          <div key={k} className="ax2__bar">
            <span className="ax2__bl"><b>{k}</b>{v}명 <em>기준 {ko}</em></span>
            <span className="ax2__track"><i style={{ width: pctW(v) }} /><s style={{ left: pctW(t) }} /></span>
            <span className={"ax2__res" + (ok ? "" : " is-no")}>{ok ? "기준 충족(기계 대조)" : "기준 미달(기계 대조)"}{raw.checks[i][3] !== adj.checks[i][3] ? " · 예외에 따라 달라짐" : ""}</span>
          </div>
        ))}
        <p className={"ax2__verdict" + (flip ? " is-hot" : "")}>{flip ? "확인 필요 — 예외를 반영하는지에 따라 대조 결과가 달라집니다. 효력 판단은 변호사의 몫입니다." : "확인 필요 — 예외 목록(통지 · 명부 · 위임장 · 중복)을 사람이 확인해야 합니다. 시스템은 결의의 효력을 정하지 않습니다."}</p>
        <p className="ax-muted">정족수 기준은 시연용 가상 정관의 규칙입니다. 실제 의결 요건은 「도시 및 주거환경정비법」과 해당 조합 정관을 확인해야 합니다.</p>
      </div>
    </div>
  );
}

/* 03 — 12층 → 15층 설계 변경과 공사도급계약 조항(가상) — 가장 정교한 건축 모형 */
const AX03_STEP = { scope: 0.05, cost: 0.3, design: 0.55, delay: 0.8 };
function Sys03() {
  const { lax } = React.useContext(AXReady);
  const cv = React.useRef(null);
  const [v, setV] = React.useState(0);
  const [pick, setPick] = React.useState("");
  const rows = lax ? window.LAX.diffContract(window.LAX_DATA.contracts.find((k) => k.id === "construction")) : [];
  const on = (r) => r.op !== "same" && v / 100 >= (AX03_STEP[r.key] == null ? 2 : AX03_STEP[r.key]);
  const hl = pick; /* 손잡이로는 조항이 차례로 켜지고(is-on), 카메라는 늘어난 층을 본다. 조항을 누르면 그 조항이 걸리는 곳으로 */
  const ctl = useScene(cv, "build", { s: v / 100, hl });
  React.useEffect(() => { if (ctl.current) ctl.current.set("hl", hl); }, [hl]);
  const setS = (x) => { setV(x); if (ctl.current) ctl.current.set("s", x / 100); };
  const toEnd = (to) => { setPick(""); if (ctl.current) { ctl.current.tween("s", to / 100, 1100); } setV(to); };
  const after = v >= 50;
  return (
    <div className="ax3">
      <div className="ax3__board">
        <canvas ref={cv} aria-hidden="true" />
        <p className="ax-fic font-ko">가상 건축물 · 개념 모형 — 실제 설계 · 계약이 아닙니다</p>
      </div>
      <div className="ax3__ctl font-ko">
        <button type="button" aria-pressed={v === 0} onClick={() => toEnd(0)}>변경 전 · 12층</button>
        <input type="range" min="0" max="100" value={v} onChange={(e) => { setPick(""); setS(+e.target.value); }} aria-label="설계 변경 전 ↔ 변경 후" />
        <button type="button" aria-pressed={v === 100} onClick={() => toEnd(100)}>변경 후 · 15층</button>
      </div>
      <div className="ax3__clauses font-ko">
        <p className="ax-h">연결된 계약 조항 — {lax ? "공사도급계약(가상) 변경 전 · 후" : "불러오는 중"} <span>누르면 건물의 해당 부분을 비춥니다</span></p>
        {lax ? (
          <ol>
            {rows.map((r) => {
              const lit = on(r), t = r.after || r.before;
              return (
                <li key={r.key} className={(lit ? "is-on" : "") + (hl === r.key ? " is-sel" : "") + (r.op === "same" ? " is-same" : "")}>
                  <button type="button" aria-pressed={hl === r.key} onClick={() => setPick(pick === r.key ? "" : r.key)}>
                    <span className="ax3__no">{t.no} {t.title}<i>{r.op === "same" ? "변경 없음" : lit ? "변경 · 검토 필요" : "변경 예정"}</i></span>
                    <span className="ax3__tx">{r.op === "same" ? r.after.text : lit && after ? r.parts.filter((p) => p.op !== "del").map((p, j) => <span key={j} className={"lx-d--" + p.op}>{p.t}</span>) : (r.before || r.after).text}</span>
                    {lit && r.flags.length > 0 && <span className="ax3__fl">{r.flags.map((f) => f.ko).join(" · ")}</span>}
                  </button>
                </li>
              );
            })}
          </ol>
        ) : <AXWait />}
        <p className="ax-muted">공사비 증액률 · 책임의 크기는 계산하지 않습니다. 비교 규칙은 상세 시연의 계약 비교와 같습니다.</p>
      </div>
    </div>
  );
}

/* 04 — 주장 → 증거 → 원문 문단 (legal-ax 의 사건 데이터 그대로) */
const AX_FIELDS = [["civil", "민사"], ["criminal", "형사"], ["family", "가사"]];
function Sys04() {
  const { lax } = React.useContext(AXReady);
  if (!lax) return <AXWait />;
  return <Sys04In />;
}
function Sys04In() {
  const L = window.LAX;
  const [fid, setFid] = React.useState("civil");
  const c = laxCase(fid), con = L.consistency(c);
  const [claim, setClaim] = React.useState(c.claims[0].id);
  const [ev, setEv] = React.useState(c.claims[0].evidence[0]);
  const cl = c.claims.find((x) => x.id === claim) || c.claims[0];
  const E = c.evidence.find((x) => x.id === ev) || c.evidence[0], doc = c.documents.find((d) => d.id === E.doc);
  const pickField = (f) => { setFid(f); const cc = laxCase(f); setClaim(cc.claims[0].id); setEv(cc.claims[0].evidence[0]); };
  const pickClaim = (x) => { setClaim(x.id); if (x.evidence.length) setEv(x.evidence[0]); };
  const st = (id) => (con.find((k) => k.claim === id) || {});
  const party = (id) => (c.participants.find((p) => p.id === id) || {});
  return (
    <div className="ax4 font-ko">
      <div className="axb__bar">
        <div role="group" aria-label="가상 사건 분야">{AX_FIELDS.map(([f, t]) => <button key={f} type="button" aria-pressed={f === fid} onClick={() => pickField(f)}>{t}</button>)}</div>
        <p><b>{c.id}</b> {c.title}</p>
      </div>
      <div className="ax4__grid">
        <section aria-label="주장">
          <p className="ax-h">주장 <span>누르면 관련 증거 강조</span></p>
          <ul className="ax4__claims">
            {c.claims.map((x) => { const k = st(x.id); return (
              <li key={x.id}><button type="button" aria-pressed={x.id === claim} onClick={() => pickClaim(x)}>
                <small>{party(x.party).name}</small><span>“{x.text}”</span>
                <i className={"ax-chip ax-chip--" + k.state}>{k.state === "needs_check" ? "추가 검토 필요" : k.state === "matches" ? "자료 기재와 일치" : k.state === "no_rule" ? "대조할 기재 없음" : "—"}</i>
              </button></li>
            ); })}
          </ul>
        </section>
        <section aria-label="사건의 흐름과 증거">
          <p className="ax-h">사건의 흐름 · 증거 <span>누르면 원문 문단</span></p>
          <ol className="ax4__tl">
            {c.events.map((e) => (
              <li key={e.id}><time>{e.date}</time><b>{e.label}</b>
                <span>{e.evidence.map((id) => { const x = c.evidence.find((k) => k.id === id); if (!x) return null; const rel = cl.evidence.includes(id); return (
                  <button key={id} type="button" className={"ax4__ev" + (rel ? " is-rel" : "") + (id === ev ? " is-sel" : "")} aria-pressed={id === ev} onClick={() => setEv(id)}>{x.doc} ¶{x.loc.para}</button>
                ); })}</span>
              </li>
            ))}
          </ol>
          {cl.evidence.filter((id) => !c.events.some((e) => e.evidence.includes(id))).length > 0 && (
            <p className="ax4__more">이 주장의 다른 근거 {cl.evidence.filter((id) => !c.events.some((e) => e.evidence.includes(id))).map((id) => { const x = c.evidence.find((k) => k.id === id); return x ? <button key={id} type="button" className={"ax4__ev is-rel" + (id === ev ? " is-sel" : "")} onClick={() => setEv(id)}>{x.doc} ¶{x.loc.para}</button> : null; })}</p>
          )}
        </section>
        <section aria-label="원문 근거" className="ax4__src">
          <p className="ax-h">원문 근거 <span>{doc.id} · {doc.type}</span></p>
          <h4>{doc.title}</h4>
          <p className="ax-muted">{doc.date} · {party(doc.by).name || ""}</p>
          {doc.paras.map((p, i) => (i + 1 >= E.loc.para - 1 && i + 1 <= E.loc.para + 1) ? <p key={i} className={"ax4__para" + (i + 1 === E.loc.para ? " is-sel" : "")}><i>¶{i + 1}</i>{p}</p> : null)}
          <p className="ax4__sum"><b>{E.id}</b>{E.summary}</p>
        </section>
      </div>
      <p className="ax-method"><b>규칙 기반 분석</b><b>문서 검색 · 근거 탐색</b> 모델 호출 없음 · ‘추가 검토 필요’는 사실인정이 아닙니다 · <a href={"legal-ax.html#task=evidence&field=" + fid}>이 사건을 상세 시연에서 열기 →</a></p>
    </div>
  );
}

/* 05 — 법령 · 문서 근거 탐색 (색인된 자료만 · 요약과 원문 분리 · 기준일) */
function Sys05() {
  const { lax } = React.useContext(AXReady);
  if (!lax) return <AXWait />;
  return <Sys05In />;
}
function Sys05In() {
  const D = window.LAX_DATA, L = window.LAX, c = laxCase("civil");
  const [q, setQ] = React.useState("검수");
  const [type, setType] = React.useState("all");
  const res = L.search(D, q, type, c);
  const [sel, setSel] = React.useState(null);
  const cur = res.find((r) => r.id === sel) || res[0] || null;
  const TYPE = [["all", "전체"], ["law", "법령 조문"], ["doc", "사건 문서"], ["precedent", "판례 검색 안내"]];
  return (
    <div className="ax5 font-ko">
      <div className="axb__bar ax5__q">
        <label><span className="sr-only">검색어</span><input value={q} onChange={(e) => { setQ(e.target.value); setSel(null); }} placeholder="예: 검수 · 손해배상 · 행정심판" /></label>
        <label><span className="sr-only">자료 종류</span><select value={type} onChange={(e) => { setType(e.target.value); setSel(null); }}>{TYPE.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select></label>
        <div className="ax5__chips" role="group" aria-label="예시 검색어">{["검수", "손해배상", "행정심판", "재산분할"].map((w) => <button key={w} type="button" onClick={() => { setQ(w); setSel(null); }}>{w}</button>)}</div>
      </div>
      <div className="ax5__grid">
        <ul className="ax5__list" aria-label="검색 결과">
          {res.length ? res.slice(0, 8).map((r) => (
            <li key={r.id}><button type="button" aria-pressed={cur && cur.id === r.id} onClick={() => setSel(r.id)}>
              {r.kind === "doc" ? <React.Fragment><small>사건 문서 · {r.doc.id} ¶{r.para}</small><b>{r.doc.title}</b></React.Fragment>
                : <React.Fragment><small>{r.s.type === "law" ? "법령 조문" : "판례 검색 안내"}</small><b>{r.s.law} {r.s.article} {r.s.title}</b></React.Fragment>}
            </button></li>
          )) : <li className="ax5__none"><b>검색 결과 없음</b>색인된 예시자료에 맞는 항목이 없습니다. 없는 근거를 만들어 보여 주지 않습니다.</li>}
        </ul>
        <article className="ax5__detail" aria-live="polite">
          {!cur ? <p className="ax-muted">왼쪽에서 결과를 고르면 원문과 요약이 나뉘어 나옵니다.</p> : cur.kind === "doc" ? (
            <React.Fragment>
              <p className="ax-h">원문 — 가상 사건 문서 <span>{c.id}</span></p>
              <h4>{cur.doc.title}</h4>
              <p className="ax4__para is-sel"><i>¶{cur.para}</i>{cur.text}</p>
              <a className="ax5__go" href="legal-ax.html#task=evidence&field=civil">사건 기록에서 이 문서 열기 →</a>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <p className="ax-h">{cur.s.law} {cur.s.article} <i className={"ax-chip ax-chip--" + (cur.s.verbatim ? "matches" : "needs_check")}>{cur.s.verbatim ? "작성 시점 원문" : "출처 확인 필요"}</i></p>
              <h4>{cur.s.title}</h4>
              <div className="ax5__orig"><b>원문</b>{cur.s.text.map((t, i) => <p key={i}>{t}</p>)}</div>
              <p className="ax5__sum"><b>요약</b>{cur.s.summary}</p>
              <p className="ax-muted">기준일 · {cur.s.asOf}</p>
              <a className="ax5__go" href={cur.s.url} target="_blank" rel="noreferrer">{cur.s.org} 원문 확인 ↗</a>
            </React.Fragment>
          )}
        </article>
      </div>
      <p className="ax-method"><b>문서 검색 · 근거 탐색</b> 판례 원문은 연동하지 않았습니다 · 조문은 옮긴 시점의 텍스트입니다 · <a href="legal-ax.html#task=research&field=civil">상세 시연에서 열기 →</a></p>
    </div>
  );
}

/* 06 — 사건 접수 · 기한 · 검토 (상세 시연과 같은 상태 · 같은 감사기록) */
const AX_ASSIGNEES = ["담당 변호사 A(가상)", "담당 변호사 B(가상)", "담당 변호사 C(가상)", "미지정"];
function Sys06() {
  const { lax } = React.useContext(AXReady);
  if (!lax) return <AXWait />;
  return <Sys06In />;
}
function Sys06In() {
  const D = window.LAX_DATA, L = window.LAX, c = laxCase("civil");
  const [st, act0] = useLaxState();
  const act = (a) => act0(Object.assign({ case: c.id }, a));
  const m = st.matters[c.id], miss = m.docs.filter((x) => !x).length, dl = c.matter.deadlines[0], calc = L.deadline(dl.base, dl.days);
  const log = st.audit.filter((a) => a.case === c.id).slice(0, 4);
  const iss = c.issues[0], ik = c.id + "/" + iss.id, iv = st.issues[ik] || iss.status;
  return (
    <div className="ax6 font-ko">
      <div className="axb__bar"><p><b>{c.id}</b> {c.title}</p></div>
      <ol className="ax6__stages" aria-label="업무 단계">{D.stages.map((t, i) => <li key={t} className={i < m.stage ? "is-done" : i === m.stage ? "is-now" : ""}><b>{i + 1}</b>{t}</li>)}</ol>
      <div className="ax6__ctl">
        <button type="button" className="ax-btn ax-btn--ghost" disabled={m.stage <= 0} onClick={() => act({ type: "stage", key: c.id, value: m.stage - 1, stageName: D.stages[m.stage - 1] })}>← 이전 단계</button>
        <span>현재 <b>{D.stages[m.stage]}</b></span>
        <button type="button" className="ax-btn" disabled={m.stage >= 6} onClick={() => act({ type: "stage", key: c.id, value: m.stage + 1, stageName: D.stages[m.stage + 1] })}>다음 단계 →</button>
      </div>
      <div className="ax6__grid">
        <section>
          <p className="ax-h">담당자</p>
          <select value={m.assignee} onChange={(e) => act({ type: "assignee", key: c.id, value: e.target.value })} aria-label="담당자">{Array.from(new Set([m.assignee].concat(AX_ASSIGNEES))).map((a) => <option key={a}>{a}</option>)}</select>
          <p className="ax-h">검토 상태 · {iss.title}</p>
          <select value={iv} onChange={(e) => act({ type: "status", key: ik, value: e.target.value, label: iss.title })} aria-label={iss.title + " 검토 상태"}>{L.STATUS.map((s) => <option key={s.key} value={s.key}>{s.ko}</option>)}</select>
          <p className="ax-h">이해충돌 검토</p>
          <button type="button" className="ax-btn ax-btn--ghost" aria-pressed={m.conflict === "reviewed"} onClick={() => act({ type: "conflict", key: c.id, value: m.conflict === "reviewed" ? "needs_check" : "reviewed" })}>{m.conflict === "reviewed" ? "담당자 확인 표시됨" : "검토 필요 — 담당자 확인 표시"}</button>
          <p className="ax-muted">시스템은 이해충돌을 자동으로 판정하지 않습니다.</p>
        </section>
        <section>
          <p className="ax-h">필요 서류 <span className={miss ? "ax6__miss" : ""}>누락 {miss}건</span></p>
          <ul className="ax6__docs">{c.matter.docs.map(([name], i) => (
            <li key={name}><label><input type="checkbox" checked={!!m.docs[i]} onChange={(e) => act({ type: "doc", key: c.id, index: i, value: e.target.checked, label: name })} />{name}<i className={m.docs[i] ? "is-ok" : "is-no"}>{m.docs[i] ? "보유" : "누락"}</i></label></li>
          ))}</ul>
          <p className="ax-h">기한 · 마감</p>
          <div className="ax6__dl"><b>{dl.label}</b><span>{dl.base} 기준 {dl.days}일 → 단순 계산 {calc.date}</span>
            <label><input type="checkbox" checked={!!m.deadlineChecked[dl.id]} onChange={(e) => act({ type: "deadline", key: c.id, id: dl.id, value: e.target.checked, label: dl.label })} />기산점 · 기간을 담당 변호사가 확인(시연)</label>
            <em>{calc.ko}</em></div>
        </section>
        <section>
          <p className="ax-h">변경 이력 <span>가상 감사기록</span></p>
          <ol className="ax6__log">{log.length ? log.map((a, i) => <li key={i}><time>{a.t.slice(5, 16).replace("T", " ")}</time>{a.text}</li>) : <li className="ax-muted">아직 바꾼 내용이 없습니다. 담당자 · 서류 · 단계를 바꿔 보세요.</li>}</ol>
          <button type="button" className="ax-btn ax-btn--ghost" disabled title="공개 시연에서는 제공하지 않습니다">전자소송 제출 · 메일 발송 — 공개 시연 미제공</button>
        </section>
      </div>
      <p className="ax-method"><b>규칙 기반 분석</b> 상태는 이 브라우저 탭에만 저장되고, 상세 시연과 같은 기록을 씁니다 · <a href="legal-ax.html#task=matter&field=civil">상세 시연에서 이어 보기 →</a></p>
    </div>
  );
}

const AX_SUPPORT = [
  { id: "ax-compensation", tag: "실무 01 · Practice", title: "Compensation Analysis", ko: "광명시흥 3기 신도시 보상자료 분석", kind: "분석 · 발표 자료 77장 — 소프트웨어 시스템이 아닙니다",
    desc: "보상 관련 발표자료 77장을 만들며 감정평가 → 보상협의 → 재결로 이어지는 절차와 쟁점을 정리했습니다.",
    steps: [["필지 확인", "Parcel"], ["감정평가 자료", "Appraisal"], ["보상협의", "Consultation"], ["재결", "Adjudication"]] },
  { id: "ed-07", tag: "실무 02 · Practice", title: "NAVER WORKS Payroll", ko: "네이버웍스 급여명세서 자동 발송", kind: "사내 운영 · 급여 정보를 다루어 화면과 코드는 비공개",
    desc: "네이버웍스 메일 API로 급여명세서의 생성과 발송을 자동화해, 반복되던 발송 절차를 표준화했습니다.",
    steps: [["명세서 준비", "Prepare"], ["표준 양식", "Standardize"], ["메일 발송", "Send"], ["처리 완료", "Complete"]] },
];
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/* 실무 01 — 광명시흥 보상자료: 필지 → 감정평가 자료 → 보상협의 → 재결 (금액 · 보상액은 그리지 않는다) */
function PracticeComp({ item }) {
  const box = React.useRef(null), cv = React.useRef(null);
  const ctl = useScene(cv, "comp", {});
  const S = useStepper(ctl, 4, 1500);
  useOnce(box, () => S.play(), 0.5);
  return (
    <article id={item.id} className="axp axp--comp" ref={box}>
      <div className="axp__vis"><canvas ref={cv} aria-hidden="true" /><span className="axp__fic font-sans">개념도 · Concept</span></div>
      <PracticeText item={item} step={S.step} go={S.go} />
    </article>
  );
}
/* 실무 02 — 네이버웍스 급여명세서: 명세서 → 표준 양식 → 메일 → 완료 (건물이 아니라 문서와 메일로) */
function PracticePayroll({ item, ed }) {
  const box = React.useRef(null), ctl = React.useRef(null);
  const S = useStepper(ctl, 4, 1300);
  useOnce(box, () => S.play(), 0.5);
  return (
    <article id={item.id} className="axp axp--mail" ref={box}>
      <div className="axp__vis nw" data-step={S.step} aria-hidden="true">
        <div className="nw__docs">{[0, 1, 2, 3, 4].map((i) => <i key={i} style={{ "--i": i }}><b /><b /><b /></i>)}</div>
        <div className="nw__tpl"><span className="font-sans">TEMPLATE</span><i /><i /><i /></div>
        <div className="nw__mail">{[0, 1, 2].map((i) => <i key={i} style={{ "--i": i }} />)}</div>
        <div className="nw__done"><svg viewBox="0 0 24 24" width="30" height="30"><path d="M5 12.5 10 17 19 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg><span className="font-sans">SENT</span></div>
        <i className="nw__rail" />
        <span className="axp__fic font-sans">개념도 · 실제 명세서 아님</span>
      </div>
      <PracticeText item={item} step={S.step} go={S.go} extra={ed.work && ed.work.slice(0, 3)} />
    </article>
  );
}
function PracticeText({ item, step, go, extra }) {
  return (
    <div className="axp__txt">
      <p className="axp__tag font-sans">{item.tag}</p>
      <h4 className="axp__title"><span className="font-sans" lang="en">{item.title}</span><span className="font-ko">{item.ko}</span></h4>
      <p className="axp__kind font-ko">{item.kind}</p>
      <ol className="axp__steps font-ko">
        {item.steps.map(([ko, en], i) => (
          <li key={ko}><button type="button" aria-current={i === step ? "step" : undefined} className={i <= step ? "is-done" : ""} onClick={() => go(i)}><b className="font-sans">{pad2(i + 1)}</b>{ko}<em className="font-sans" lang="en">{en}</em></button></li>
        ))}
      </ol>
      <p className="axp__desc font-ko">{item.desc}</p>
      {extra && <dl className="axp__work font-ko">{extra.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}
    </div>
  );
}
/* 운영 흐름 — 고객 메일 자동 분류(공개 업무 화면). 개인 제품이 아니고, 급여명세서 실무와도 별개다 */
function OpsMail({ e }) {
  const box = React.useRef(null);
  const [on, setOn] = React.useState(false);
  useOnce(box, () => setOn(true), 0.4);
  const [t1, t2] = e.title.split("\n");
  return (
    <div id="work-systems" className={"axo" + (on ? " is-on" : "")} ref={box}>
      <article id={"ed-" + e.n} className="axo__card">
        <div className="axo__txt">
          <p className="axc__k font-ko">운영 흐름 <span className="font-sans" lang="en">Operational Workflow</span></p>
          <h4 className="font-ko">{t1}<small>{t2.replace(/^—\s*/, "")}</small></h4>
          <p className="axo__desc font-ko">{e.desc}</p>
          <dl className="axp__work font-ko">{e.work.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          <p className="axo__point font-ko"><b>설계 원칙</b>{e.point}</p>
          <a href={e.url} target="_blank" rel="noreferrer" className="btn btn--ghost axo__go">{e.cta} <ExternalLink size={15} /></a>
        </div>
        <div className="axo__lanes" aria-hidden="true">
          {["지금 답할 것", "오늘 안에 볼 것", "넘겨도 되는 것"].map((l, i) => (
            <div key={l} className="axo__lane" style={{ "--i": i }}><span className="font-ko">{l}</span>{[0, 1, 2].slice(0, 3 - i).map((k) => <i key={k} style={{ "--k": k }} />)}</div>
          ))}
          <span className="axp__fic font-sans">개념도 · 실제 메일 아님</span>
        </div>
      </article>
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
  "16": {
    name: "법조시장 한눈에", url: "https://legal-pulse-pearl.vercel.app", open: "상황판 열기",
    cap: "2026. 11. 5. 실제 서비스 화면 캡처 — 화면 속 법률안 · 법령 · 회원 수는 캡처 시점의 공개 데이터입니다.",
    ruleT: "데이터 원칙",
    rule: "출처 없는 예시 수치는 넣지 않습니다. 인증키가 없거나 수집에 실패한 값은 '인증키 필요' · '불러오지 못함'과 이유를 그대로 보여 주고, 지방회 합계가 맞지 않으면 화면에 올리지 않습니다.",
    layers: [
      { img: "lp-home", k: "요약", t: "법조 시장의 지금을 첫 화면에", d: "22대 국회 발의 법률안의 처리 현황, 개업 변호사 수, 다음 공휴일, 불변기간 만료일 계산기를 첫 화면에 모았습니다." },
      { img: "lp-redev", k: "정비사업", t: "재개발 · 재건축 법률안과 판례", d: "정비사업 법률의 국회 발의 현황과 최근 본회의 통과, 시행 예정 개정과 분쟁 판례를 함께 봅니다." },
      { img: "lp-family", k: "분야별", t: "분야마다 같은 틀로", d: "부동산 · 임대차, 가사, 상속, 형사, 노동, 기업까지 분야별로 발의 법률안 · 시행 예정 법령 · 공개 판례를 같은 틀로 보여 줍니다." },
      { img: "lp-sources", k: "출처", t: "모든 수치의 출처와 연결 상태", d: "화면의 수치를 어느 공식 출처에서 받았는지, 연결 상태와 마지막으로 받은 시각을 함께 공개합니다." },
    ],
  },
  "12": {
    name: "국정 한눈에", url: "https://gukjeong-hannune.vercel.app/", open: "상황판 열기",
    cap: "2026. 11. 5. 실제 서비스 화면 캡처 — 화면 속 기사와 지표는 캡처 시점의 공개 뉴스 · 시세입니다.",
    ruleT: "수집 원칙",
    rule: "수집이 실패해도 화면이 비지 않게 — CDN 20분 캐시와 stale-while-revalidate로 즉시 응답하고, 실패하면 저장된 스냅샷으로 대체합니다. 포털은 기사를 옮겨 실을 뿐 매체가 아니므로 출처 · 언론사 수에서 뺍니다.",
    layers: [
      { img: "gk-home", k: "오늘", t: "오늘의 국정을 첫 화면 한 장에", d: "날짜와 주요 지표, 분야별 소식을 첫 화면에 모읍니다. 섹션 필터 · 검색과 라이트 · 다크 모드를 지원합니다." },
      { img: "gk-markets", k: "시장", t: "증시 · 환율 · 원자재를 추이와 함께", d: "코스피 · 코스닥 · 환율 · 해외 지수를 등락과 함께 작은 추이 그래프(스파크라인)로 보여 줍니다." },
      { img: "gk-brief", k: "브리핑", t: "많이 다룬 소식을 세 줄로", d: "가장 많은 언론이 다룬 사안을 3줄 브리핑으로 정리하고, 24시간 보도 흐름과 분야별 보도량을 함께 보여 줍니다." },
      { img: "gk-top", k: "기사", t: "중복을 걸러 분야별로", d: "공개 뉴스 RSS를 분야별로 배정하고 중복 기사를 걸러, 언론사 원문 사진과 함께 보여 줍니다." },
    ],
  },
};

function TheaterShot({ name, alt }) {
  const set = (ext) => `images/product/${name}-720.${ext} 720w, images/product/${name}-1280.${ext} 1280w`;
  /* 폰에서는 실제 모바일 화면 캡처를 쓴다 — 데스크톱 화면을 작게 줄여 보이지 않게 */
  return (
    <picture>
      <source media="(max-width: 760px)" type="image/avif" srcSet={`images/product/${name}-m600.avif`} />
      <source media="(max-width: 760px)" type="image/webp" srcSet={`images/product/${name}-m600.webp`} />
      <source type="image/avif" srcSet={set("avif")} sizes="(max-width: 860px) 92vw, 62vw" />
      <source type="image/webp" srcSet={set("webp")} sizes="(max-width: 860px) 92vw, 62vw" />
      <img src={`images/product/${name}-1280.webp`} alt={alt} width="1280" height="800" decoding="async" draggable="false" />
    </picture>
  );
}

/* 펼침 --f(0 접힘 → 1 층층이 펼침)와 집중 --q(0 전체 → 1 한 층 정면)를 rAF 로 직접 쓴다 — 드래그는 곧바로 반영 */
/* 폰 극장 — 고른 화면이 카드(큐브 면)에서 떨어져 나와 화면 전체로 커진다(FLIP).
 * 화면은 원래 폭(1:1)으로 보여 글자가 그대로 읽히고, 아래로 스크롤해 화면 전체를 본다.
 * 옆으로 넘기면 다음 실제 화면, 두 번 누르면 2배 확대. 아래 썸네일 띠는 큰 화면에서 펼쳐져 나온다.
 * 닫으면 같은 길로 그 카드 자리에 돌아간다 */
function MobileTheater({ ed, card, onClose }) {
  const T = THEATERS[ed.n];
  const surf = React.useRef(null), track = React.useRef(null), closeBtn = React.useRef(null);
  const [i, setI] = React.useState(0);
  const [zoom, setZoom] = React.useState(-1);
  const closing = React.useRef(false);
  React.useEffect(() => {
    if (card) card.classList.add("is-staged");
    flipFrom(card, surf.current, false).then(() => closeBtn.current && closeBtn.current.focus({ preventScroll: true }));
    return () => { if (card) card.classList.remove("is-staged"); };
  }, []);
  const close = () => {
    if (closing.current) return;
    closing.current = true;
    if (track.current) track.current.scrollTo({ left: 0 });
    flipFrom(card, surf.current, true).then(onClose);
  };
  useStageDialog(true, surf, close);
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const k = Math.round(el.scrollLeft / el.clientWidth);
    if (k !== i) { setI(k); setZoom(-1); }
  };
  const go = (k) => { const el = track.current; if (el) el.scrollTo({ left: k * el.clientWidth, behavior: prefersCalm() ? "auto" : "smooth" }); };
  const L = T.layers[i];
  return ReactDOM.createPortal(
    <div className="pthm" role="dialog" aria-modal="true" aria-labelledby="pthm-title">
      <div className="pthm__surface" ref={surf}>
        <header className="pthm__head">
          <div>
            <p className="pthm__eyebrow font-sans">{T.name} · {String(i + 1).padStart(2, "0")} / {String(T.layers.length).padStart(2, "0")}</p>
            <h3 id="pthm-title" className="font-ko"><b>{L.k}</b> {L.t}</h3>
          </div>
          <button type="button" className="pthm__close font-sans" ref={closeBtn} onClick={close}>닫기 ✕</button>
        </header>
        <div className="pthm__track" ref={track} onScroll={onScroll}>
          {T.layers.map((l, k) => (
            <section key={l.img} className={"pthm__page" + (zoom === k ? " is-zoom" : "")} aria-label={`${l.k} — ${l.t}`}>
              <div className="pthm__shot" onDoubleClick={() => setZoom(zoom === k ? -1 : k)}>
                <TheaterShot name={l.img} alt={`${T.name} ${l.k} 화면 — ${l.t}`} />
              </div>
              <p className="pthm__desc font-ko">{l.d}</p>
            </section>
          ))}
        </div>
        <footer className="pthm__foot">
          <ol className="pthm__thumbs">
            {T.layers.map((l, k) => (
              <li key={l.img} style={{ "--k": k }}>
                <button type="button" aria-current={k === i ? "true" : undefined} onClick={() => go(k)} aria-label={`${l.k} 화면으로`}>
                  <img src={`images/product/${l.img}-m600.webp`} alt="" loading="lazy" decoding="async" />
                  <span className="font-sans">{l.k}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="pthm__bar">
            <button type="button" className="pthm__zoom font-sans" onClick={() => setZoom(zoom === i ? -1 : i)} aria-pressed={zoom === i}>{zoom === i ? "원래 크기" : "2배 확대"}</button>
            <a className="btn pthm__go" href={T.url} target="_blank" rel="noreferrer">{T.open} <ExternalLink size={14} /></a>
          </div>
          <p className="pthm__cap font-ko">{T.cap}</p>
        </footer>
      </div>
    </div>,
    document.body
  );
}

function ProductTheater(props) {
  const [mob] = React.useState(() => !!(window.matchMedia && window.matchMedia("(max-width: 760px)").matches));
  return mob ? <MobileTheater {...props} /> : <DesktopTheater {...props} />;
}

function DesktopTheater({ ed, card, onClose }) {
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
            {ed.origin === "independent" && <p className="pth__origin font-sans">직접 기획 · 개발 · 배포한 개인 제품 — 회사 도입 시스템 아님</p>}
            <p className="pth__desc font-ko">{ed.desc}</p>
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

/* ============================================================ THE ARTIFACTS — 직접 만든 네 가지 도구만 (V6.1: 제품 화면 중심으로 복구)
 * 건물 · 도시 장면을 쓰지 않는다. 각 제품의 실제 화면 캡처(images/product) 네 장을 넘겨 보고,
 * '실제 화면 펼쳐 보기'를 누르면 그 화면에서 제품 극장이 펼쳐진다(FLIP). 기능 설명은 작업 카드에 적힌 사실만 */
function FlagshipTool({ e, onOpen, flip }) {
  const frame = React.useRef(null);
  const M = TOOL_META[e.n], T = THEATERS[e.n];
  const [t1] = e.title.split("\n");
  const [shot, setShot] = React.useState(0);
  const open = () => onOpen(e, frame.current);
  const L = T.layers[shot];
  return (
    <article id={"ed-" + e.n} className={"fl" + (flip ? " fl--flip" : "")} style={{ "--accent-fill": e.color }} aria-labelledby={"fl-" + e.n}>
      <div className="fl__stage">
        <button type="button" ref={frame} className="fl__shot" onClick={open} aria-haspopup="dialog" aria-label={`${M.name} 실제 화면 펼쳐 보기 — ${L.k}`}>
          <span className="fl__chrome" aria-hidden="true"><i /><i /><i /><em className="font-sans">{T.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</em></span>
          <TheaterShot name={L.img} alt={`${M.name} — ${L.t}`} />
        </button>
        <div className="fl__thumbs" role="group" aria-label={`${M.name} 화면 고르기`}>
          {T.layers.map((x, i) => (
            <button key={x.img} type="button" aria-pressed={i === shot} onClick={() => setShot(i)} onMouseEnter={(ev) => { if (ev.nativeEvent && ev.nativeEvent.pointerType !== "touch") setShot(i); }}>
              <b className="font-sans">{pad2(i + 1)}</b><span className="font-ko">{x.k}</span>
            </button>
          ))}
        </div>
        <p className="fl__cap font-ko"><b>{L.t}</b>{L.d}</p>
      </div>
      <div className="fl__txt">
        <p className="fl__badge font-sans"><b>직접 만들어 사용</b><span>{e.status}</span><span>{e.no} / 04</span></p>
        <h3 id={"fl-" + e.n} className="fl__name"><small className="font-ko">{t1}</small><span className="font-serif">{M.name}</span></h3>
        <ol className="fl__story font-ko">
          <li><b>어떤 문제가 있었나</b>{M.why}</li>
          <li><b>무엇을 만들었나</b>{M.made}</li>
          <li><b>어떻게 쓰나</b>{M.use}</li>
        </ol>
        <p className="fl__link font-ko"><span>이어지는 역량</span>{M.link}</p>
        <p className="fl__point font-ko"><b>{T.ruleT}</b>{T.rule}</p>
        <div className="fl__acts">
          <button type="button" className="btn fl__open" aria-haspopup="dialog" onClick={open}>실제 화면 펼쳐 보기 <Layers size={16} /></button>
          <a href={e.url} target="_blank" rel="noreferrer" className="btn btn--ghost">{e.cta} <ExternalLink size={15} /></a>
        </div>
        <p className="fl__capnote font-ko">{T.cap}</p>
      </div>
    </article>
  );
}

function ArtifactsSection() {
  const ref = useReveal();
  const [staged, setStaged] = React.useState(null); /* { e, card } */
  const onOpen = (e, card) => setStaged({ e, card });
  const onClose = () => setStaged(null);
  return (
    <section id="artifacts" ref={ref} className="arts" aria-labelledby="arts-title">
      <div className="wrap">
        <SectionHead no="04 직접 만든 도구" ko="필요한 도구는 직접 만들고, 실제로 사용합니다" en="Four Independently Developed Products" />
        <div id="tools" className="arts__intro reveal">
          <p className="arts__lead font-ko" id="arts-title">문제를 발견하는 데서 끝내지 않고, 혼자 끝까지 만들어 배포한 <b>개인 제품</b> 네 가지입니다. 회사 시스템이 아닙니다.
            <span>제품마다 어떤 문제가 있었는지 → 무엇을 만들었는지 → 어떻게 쓰는지 순서로 적었습니다. 법무법인 경국의 AX 는 바로 위에 있습니다.</span></p>
          <ol className="arts__index">
            {TOOLS.map((e) => (
              <li key={e.n}><a href={"#ed-" + e.n}>
                <b className="font-serif">{e.no}</b>
                <span><strong className="font-ko">{TOOL_META[e.n].name}</strong><em className="font-sans" lang="en">{TOOL_META[e.n].env}</em></span>
                <ArrowDown size={15} />
              </a></li>
            ))}
          </ol>
        </div>
        {TOOLS.map((e, i) => <FlagshipTool key={e.n} e={e} flip={i % 2 === 1} onOpen={onOpen} />)}
      </div>
      {staged && <ProductTheater ed={staged.e} card={staged.card} onClose={onClose} />}
    </section>
  );
}

/* ============================================================ POLICY — 현장의 문제를 제도의 언어로
 * 같은 문제 해결 방식의 연장. 참석 · 제안 · 역할 · 수강을 섞지 않고 따로 적는다 — 제안은 채택이 아니고, 참석은 결정이 아니다.
 * 특정 정당 · 진영의 홍보가 아니라, 정책 논의에 참여한 기록이다. 날짜 · 기관 · 역할은 이력(TRAJECTORY)과 같은 원문 */
const POLICY = [
  { k: "propose", ko: "제안하다", en: "Propose", items: [
    { t: "국민통합위원회 2026 국민 대토론회 — ‘청년 초과세수 미래배당펀드’ 정책 제안 발표", d: "2026. 9. 29 · aT센터 · 자산 분야 트랙",
      what: "청년 미래배당펀드팀으로 제안 · 발표. 일회성으로 소진되는 초과세수를 청년 세대가 함께 불리는 자산으로 전환하는 구조를 설계했습니다.", kind: "팀 제안 · 발표", href: "gallery.html#national-debate" },
  ] },
  { k: "deliberate", ko: "듣고, 의견을 전하다", en: "Deliberate", items: [
    { t: "재정경제부 제1차관 청년 현장방문 및 간담회", d: "2026. 10. 27 · SVC Seoul", what: "법무법인 경국 소속으로 참석. 주거 · 일자리 · 서민금융에 대한 청년들의 현장 의견이 오간 자리입니다.", kind: "참석", href: "gallery.html#moef-youth" },
    { t: "성평등가족부 청년세대 성별균형 공개형 공론장 〈모두의 성평등〉", d: "2026. 10. 25 · 연세대", what: "청년 세대의 시각으로 정책 토론에 함께했습니다.", kind: "공론장 참여", href: "gallery.html#gender-forum" },
    { t: "청와대 대통령 주관 2026 청년의날 기념행사", d: "2026", what: "청년 대표로 초청되어 참석했습니다.", kind: "초청 참석", href: "gallery.html#youth-day" },
  ] },
  { k: "participate", ko: "운영에 참여하다", en: "Participate", items: [
    { t: "서초청년네트워크 9기 운영위원회 부위원장", d: "2026", what: "서초구 청년 정책 거버넌스에서 분과 의제 설정과 위원회 운영을 맡고 있습니다.", kind: "위원 · 부위원장", href: "#tl-seocho" },
    { t: "서초구 가치디자인단 · 국민권익위원회 청년정책 패널 · 국무조정실 온라인 청년참여단", d: "2026", what: "구정 현장 활동과 청년 정책 과제에 대한 의견 수렴 · 제안에 참여합니다.", kind: "위촉 · 패널 · 참여단", href: "#tl-acrc-panel" },
  ] },
  { k: "learn", ko: "배우다", en: "Learn", items: [
    { t: "2026 민주청년지도자 양성과정", d: "2026. 10. 24 – 12. 13 · 민주연구원", what: "정책 · 리더십 과정을 수강하고 있습니다.", kind: "수강 중", href: "gallery.html#dyl" },
  ] },
];
function PolicySection() {
  const ref = useReveal();
  return (
    <section id="policy" ref={ref} className="pol" aria-labelledby="pol-title">
      <div className="wrap">
        <header className="pol__head reveal">
          <p className="sh__no font-ko">05 정책 참여 <span className="font-sans" lang="en">Policy Participation & Public Deliberation</span></p>
          <h2 id="pol-title" className="pol__t font-ko">현장에서 발견한 문제를<br />제도의 언어로 옮깁니다</h2>
          <p className="pol__lead font-ko">법률 · 부동산 현장의 문제는 결국 제도와 이해관계의 문제로 이어집니다. 그래서 소프트웨어를 만드는 데서 멈추지 않고,
            정책 논의의 자리에 나가 듣고, 제안하고, 운영에 참여합니다.</p>
          <p className="pol__note font-ko">참석과 제안은 정책 결정이 아닙니다. 채택 여부는 적지 않습니다.</p>
        </header>
        <div className="pol__grid">
          {POLICY.map((g) => (
            <div key={g.k} className={"pol__col pol__col--" + g.k + " reveal"}>
              <h3 className="pol__h"><span className="font-ko">{g.ko}</span><em className="font-sans" lang="en">{g.en}</em></h3>
              <ul>
                {g.items.map((it) => (
                  <li key={it.t}>
                    <a href={it.href} className="pol__item">
                      <span className="pol__kind font-ko">{it.kind}</span>
                      <strong className="font-ko">{it.t}</strong>
                      <span className="pol__d font-sans">{it.d}</span>
                      <span className="pol__what font-ko">{it.what}</span>
                      <span className="pol__go font-sans">근거 보기 <ArrowUpRight size={13} /></span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 성장 경로 — 연대순 목록 위에, 다루는 문제의 복잡도로 본 다섯 단계. 마지막 단계는 '지향'으로 따로 표시 */
const GROWTH = [
  { ko: "기술을 학습하다", en: "Learn", ev: "삼성청년SW·AI아카데미(SSAFY) 13기 이수(2025) · 서울대 AIED 4기 수료 · KREMA 상담 RAG 실습 · 건국대 스마트건설기술교육 · 서울 핀테크 아카데미 14기 수료", href: "#tl-ssafy" },
  { ko: "조직의 문제를 해결하다", en: "Solve", ev: "법무법인 경국 — 정비사업 AX 3종 · 급여명세서 자동 발송 · 고객 메일 자동 분류 · 보상자료 77장", href: "#ax-desk" },
  { ko: "독립 제품으로 넓히다", en: "Build", ev: "집캐치 · 법조시장 한눈에 · Atelier AX · 국정 한눈에 — 직접 기획 · 개발 · 배포", href: "#tools" },
  { ko: "제도와 정책의 현장에 서다", en: "Engage", ev: "국민 대토론회 정책 제안 발표 · 서초청년네트워크 부위원장 · 정책 간담회 · 공론장", href: "#policy" },
  { ko: "더 무거운 결정의 영역으로", en: "Direction", ev: "기술 구현 · 법률 · 부동산의 산업 이해 · 제도에 대한 이해를 함께 갖추고, 결과에 책임지는 결정을 다루는 자리 — 앞으로의 방향입니다.", href: "#composite", aim: true },
];
function GrowthPath() {
  return (
    <ol className="grow reveal">
      {GROWTH.map((g, i) => (
        <li key={g.en} className={g.aim ? "grow__aim" : ""}>
          <a href={g.href}>
            <b className="font-serif">{pad2(i + 1)}</b>
            <h3><span className="font-ko">{g.ko}</span><em className="font-sans" lang="en">{g.en}</em></h3>
            <p className="font-ko">{g.ev}</p>
            {g.aim && <span className="grow__tag font-ko">지향 · 진행 중</span>}
          </a>
        </li>
      ))}
    </ol>
  );
}

/* ============================================================ RESEARCH ARCHIVE — 그 밖의 작업(조용한 목록)
 * 학습용 시뮬레이터 · 개인 실험 · 제안서 · 생성형 AI 콘텐츠. 네 가지 도구와 겨루지 않도록 카드가 아닌 색인으로 */
function ArchiveRow({ e, onPlay }) {
  const [open, setOpen] = React.useState(false);
  const [t1, t2] = e.title.split("\n");
  return (
    <li>
      <article id={"ed-" + e.n} className={"ra__row" + (open ? " is-open" : "")}>
        <span className="ra__no font-serif">{e.no}</span>
        <div className="ra__main">
          <h3 className="ra__t font-ko">{t1}{t2 && <small>{t2}</small>}</h3>
          <p className="ra__desc font-ko" id={"ra-d-" + e.n}>{e.desc}</p>
          {open && e.point && <p className="ra__point font-ko"><b>설계 포인트</b>{e.point}</p>}
          <button type="button" className="ra__more font-sans" aria-expanded={open} aria-controls={"ra-d-" + e.n} onClick={() => setOpen(!open)}>{open ? "접기" : "자세히"}</button>
        </div>
        <div className="ra__meta font-sans">
          <span className="ra__st">{e.status}</span>
          <span className="ra__tags">{e.tags.join(" · ")}</span>
        </div>
        <div className="ra__act">
          {e.video ? <button type="button" className="ra__go font-sans" onClick={() => onPlay(e)}>{e.cta} <PlayCircle size={14} /></button>
            : e.url ? <a className="ra__go font-sans" href={e.url} target="_blank" rel="noreferrer">{e.cta} <ExternalLink size={14} /></a>
            : <span className="ra__go ra__go--off font-sans">{e.cta}</span>}
        </div>
      </article>
    </li>
  );
}
function ResearchArchive() {
  const [playing, setPlaying] = React.useState(null);
  const vframe = React.useRef(null);
  useStageDialog(!!playing, vframe, () => setPlaying(null));
  return (
    <section id="research" className="ra" aria-labelledby="ra-title">
      <div className="wrap">
        <header className="ra__head">
          <p className="ra__k font-ko">연구 · 실험 기록 <span className="font-sans" lang="en">Research Archive</span></p>
          <h2 id="ra-title" className="font-ko">그 밖의 작업 <em className="font-serif">{ARCHIVE.length}</em></h2>
          <p className="ra__sub font-ko">학습용 시뮬레이터 · 개인 실험 · 제안서 · 생성형 AI 콘텐츠입니다. 네 가지 도구, 경국 AX 와는 성격이 다른 기록이라 따로 모았습니다.</p>
        </header>
        <ol className="ra__list">{ARCHIVE.map((e) => <ArchiveRow key={e.n} e={e} onPlay={setPlaying} />)}</ol>
      </div>
      {playing && ReactDOM.createPortal(
        <div className="vlightbox" onClick={() => setPlaying(null)} role="dialog" aria-modal="true" aria-label={playing.title.replace("\n", " · ")}>
          <div className="vlightbox__frame" ref={vframe} onClick={(ev) => ev.stopPropagation()}>
            <button type="button" className="vlightbox__close" onClick={() => setPlaying(null)} aria-label="닫기">✕</button>
            <div className="vlightbox__meta">
              <span className="font-sans">Archive {playing.no}</span>
              <h4 className="font-ko">{playing.title.replace("\n", " · ")}</h4>
            </div>
            <video className="vlightbox__video" src={playing.video} controls autoPlay playsInline preload="metadata" controlsList="nodownload">
              브라우저가 영상 재생을 지원하지 않습니다.
            </video>
            {playing.url ? <a className="vlightbox__fallback font-sans" href={playing.url} target="_blank" rel="noreferrer">영상이 보이지 않으면 원본 링크로 보기 →</a> : null}
          </div>
        </div>
      , document.body)}
    </section>
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
        <SectionHead no="강의 · 소통" ko="기술을 이해하는 것에서, 이해시키는 것으로" en="AI Education & Knowledge Translation"
          lead="쓸모 있는 시스템은 쓰는 사람이 이해해야 자리 잡습니다. 실무에서 만든 것을 가르칠 수 있는 단위로 옮긴 제안 커리큘럼입니다." />

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
const STORY_LINES = ["조직에서 반복되는 문제를 찾고,", "기술로 풀 수 있는 부분을", "시스템으로 옮깁니다."];
const STORY_SHOTS = [
  { name: "profile-yubin", src: "images/profile-yubin-450.jpg?v=1", srcSet: "images/profile-yubin-450.jpg?v=1 450w, images/profile-yubin.jpg?v=1 896w",
    alt: "김유빈 — 법무법인 경국 공식 프로필", chip: "Profile", cap: "김유빈 · Yubin Kim — 법무법인 경국" },
  { name: "ssafy-presentation", src: "images/ssafy-presentation-700.jpg", srcSet: "images/ssafy-presentation-500.jpg 500w, images/ssafy-presentation-700.jpg 700w, images/ssafy-presentation.jpg 1016w",
    alt: "김유빈 활동 기록 — 삼성청년SW·AI아카데미(SSAFY) 13기 프로젝트 발표", chip: "SSAFY 13기", cap: "프로젝트 아키텍처 발표" },
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
            <p className="sh__no font-ko">01 소개 <span className="font-sans" lang="en">Profile</span></p>
            <h3 className="story__lead font-myeongjo">
              {STORY_LINES.map((l, i) => <span key={l} className={"story__line" + (lineOn(i) ? " on" : "")}>{l}</span>)}
            </h3>
            <div className={"story__body" + (stage.body ? " on" : "")}>
              <p className="font-ko">
                법무법인 경국에서 정비사업 AX 와 전략기획을 맡아, 반복되는 업무를 시스템으로 옮겨 왔습니다.
                필요한 도구는 직접 만들어 씁니다. 동시에 법률 · 부동산 · 정책의 제약과 이해관계를 공부하며,
                기술의 결과가 실제 판단과 실행으로 이어지도록 하는 역량을 키우고 있습니다.
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
        <p className="contact-eyebrow font-ko">채용 · 협업 제안 <span className="font-sans" lang="en">Inquiries</span></p>
        <h2 className="contact-title contact-title--ko font-myeongjo">
          다음에 풀 문제를<br /><em>함께 정의하고 싶습니다.</em>
        </h2>
        <p className="font-ko" style={{ color: "rgba(249,246,240,.78)", maxWidth: 600, margin: "26px auto 40px", lineHeight: 1.75, fontSize: "1.05rem" }}>
          AI 전략 · 업무 자동화, 법률 · 부동산의 디지털 전환, 정책과 기술이 만나는 과제에 관해 함께 이야기하고 싶습니다.<br />개인 메일로 연락 주시면 성실히 회신드리겠습니다.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="mailto:yubin120866@gmail.com" className="btn" style={{ background: "var(--ecru)", color: "var(--ink)", borderColor: "var(--ecru)" }}>
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
/* 현장 기록(Visual Journal) — 포트폴리오에 실린 본인 사진. Instagram 게시물이라고 하지 않는다.
 * 들어올 때: 큰 사진이 시야로 커지고, 나머지는 서로 다른 거리(--dz)에서 다른 속도로 떠오른다(--cp, cine.js)
 * 누르면: 그 사진이 제자리에서 떨어져 화면 가득 커지고(FLIP), 맥락과 원래 출처 링크가 아래에서 올라온다. 닫으면 제자리로 */
const JOURNAL = [
  { name: "youth-day-selfie", src: "images/youth-day-selfie.jpg", t: "청와대 청년의날 — 대통령과 함께", when: "2026 청년의날 · 청와대", dz: 0.2, lead: true,
    d: "대통령이 주관한 청년의날 기념행사에 청년 대표로 초청되어 참석했습니다.",
    links: [{ l: "갤러리에서 보기", h: "gallery.html#youth-day" }, { l: "블로그 글", h: "https://blog.naver.com/yubinxe/224449296593" }] },
  { name: "moef-group", src: "images/moef-group.jpg", t: "재정경제부 제1차관 청년 간담회", when: "2026. 10. 27 · SVC Seoul", dz: 1,
    d: "권대영 재정경제부 제1차관의 청년 현장방문 및 간담회에 법무법인 경국 소속으로 참석했습니다.",
    links: [{ l: "갤러리에서 보기", h: "gallery.html#moef-youth" }, { l: "보도 · 노컷뉴스", h: "https://nocutnews.co.kr/news/6597825" }] },
  { name: "dyl-qa", src: "images/dyl-qa.jpg", t: "민주청년지도자 양성과정 — 특강 질의", when: "2026. 10. 24 · 민주연구원", dz: 0.6,
    d: "이광재 예산결산특별위원장의 특강에서 마이크를 잡고 직접 질문했습니다.",
    links: [{ l: "갤러리에서 보기", h: "gallery.html#dyl" }] },
  { img: "images/zipconomy-demo-600.jpg", src: "images/zipconomy-demo.jpg", t: "한경 집코노미 박람회 — 집캐치 시연", when: "2026. 9. 30 · 코엑스 D홀", dz: 1.3,
    d: "KREMA AI 전시관 부스에서 직접 만든 집캐치와 감정평가사 필드워크를 시연하고 질문을 받았습니다.",
    links: [{ l: "갤러리에서 보기", h: "gallery.html#zipconomy" }, { l: "블로그 글", h: "https://blog.naver.com/yubinxe/224446565096" }] },
  { name: "ssafy-presentation", src: "images/ssafy-presentation.jpg", t: "SSAFY 13기 — 프로젝트 아키텍처 발표", when: "삼성청년SW·AI아카데미", dz: 0.8,
    d: "삼성청년SW·AI아카데미 13기에서 프로젝트 아키텍처를 발표했습니다.",
    links: [{ l: "갤러리에서 보기", h: "gallery.html#g-ssafy-presentation" }] },
  { name: "fw-gwanghwamun", src: "images/fw-gwanghwamun.jpg", t: "감정평가사 필드워크 — 광화문에서 시작", when: "직접 만든 3D 실지조사 시뮬레이터", dz: 1.6,
    d: "서울을 직접 걸으며 의뢰 수임부터 등기촉탁까지 5단계를 수행하는 3D 학습 게임의 첫 장면입니다.",
    links: [{ l: "작업 카드", h: "#ed-10" }, { l: "필드워크 체험", h: "https://appraiser-fieldwork.vercel.app/" }] },
];
function PhotoJournal() {
  const [open, setOpen] = React.useState(-1);
  const thumbs = React.useRef([]), big = React.useRef(null), box = React.useRef(null), closing = React.useRef(false);
  React.useEffect(() => {
    if (open < 0) return;
    closing.current = false;
    flipFrom(thumbs.current[open], big.current, false);
  }, [open]);
  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const k = open;
    flipFrom(thumbs.current[k], big.current, true).then(() => setOpen(-1));
  };
  useStageDialog(open >= 0, box, close);
  const J = open >= 0 ? JOURNAL[open] : null;
  return (
    <div className="jr" data-cine="pass">
      <header className="jr__head reveal">
        <p className="eyebrow">Visual Journal — 현장 기록</p>
        <h3 className="font-myeongjo">현장에서 남긴 장면들</h3>
        <p className="jr__note font-ko">포트폴리오에 실린 본인 사진입니다. Instagram 게시물을 옮겨 온 것이 아니라, 각 사진의 원래 기록(갤러리 · 블로그 · 보도)으로 이어집니다.</p>
      </header>
      <ul className="jr__grid">
        {JOURNAL.map((j, i) => (
          <li key={j.t} className={"jr__item" + (j.lead ? " jr__item--lead" : "")} style={{ "--dz": j.dz, "--i": i }}>
            <button type="button" className="jr__btn" onClick={() => setOpen(i)} aria-haspopup="dialog" aria-label={j.t + " 크게 보기"}>
              <span className="jr__frame" ref={(n) => (thumbs.current[i] = n)}>
                {j.name ? <Pic name={j.name} fallback={j.src} sizes={j.lead ? "(max-width: 760px) 92vw, 52vw" : "(max-width: 760px) 46vw, 24vw"} alt="" loading="lazy" />
                  : <img src={j.img} alt="" loading="lazy" decoding="async" />}
              </span>
              <span className="jr__cap"><b className="font-ko">{j.t}</b><small className="font-sans">{j.when}</small></span>
            </button>
          </li>
        ))}
      </ul>
      {J && ReactDOM.createPortal(
        <div className="jrv" role="dialog" aria-modal="true" aria-label={J.t} ref={box} onClick={close}>
          <figure className="jrv__fig" ref={big} onClick={(ev) => ev.stopPropagation()}>
            <img src={J.src} alt={"김유빈 활동 기록 — " + J.t} decoding="async" />
          </figure>
          <div className="jrv__info" onClick={(ev) => ev.stopPropagation()}>
            <p className="jrv__when font-sans">{J.when}</p>
            <h4 className="font-ko">{J.t}</h4>
            <p className="font-ko">{J.d}</p>
            <div className="jrv__links">
              {J.links.map(({ l, h }) => <a key={h} href={h} className="font-sans" {...(/^https?:/.test(h) ? { target: "_blank", rel: "noreferrer" } : {})} onClick={() => { if (!/^https?:/.test(h)) setOpen(-1); }}>{l} <ArrowUpRight size={13} /></a>)}
              <button type="button" className="jrv__close font-sans" onClick={close}>닫기 ✕</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* Instagram 피드 미리보기 대신 — 채널 카드는 소개만, 사진은 아래 현장 기록으로 */
function Channels() {
  const ref = useReveal();
  return (
    <section id="channels" ref={ref} className="ch-sec" style={{ position: "relative", padding: "clamp(80px,12vw,150px) 0" }}>
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        <SectionHead no="기록" ko="일한 과정을 기록하는 채널" en="Channels & Journal" />
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
              <ol className="ch-posts" aria-label={c.name + " 최근 글"}>
                {c.posts.map(([t, d, u]) => (
                  <li key={t}><a href={u} {...(u.startsWith("#") ? {} : { target: "_blank", rel: "noopener" })} className="font-ko"><time className="font-sans">{d}</time><span>{t}</span></a></li>
                ))}
              </ol>
              <a className="lc-cta font-sans" href={c.url} target="_blank" rel="me noopener">{c.name} 방문 <ArrowUpRight size={15} /></a>
            </article>
          ))}
        </div>
        <PhotoJournal />
        <p className="lc-note font-sans reveal">최근 글은 각 채널 RSS 기준(2026.10.23) · 채널 이름을 누르면 새 창에서 열립니다.</p>
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
        <a href="mailto:yubin120866@gmail.com" style={{ marginLeft: "auto" }}>yubin120866@gmail.com</a>
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
/* 섹션 머리 — 한국어가 뜻을 맡고, 영어는 같은 묶음 안에서 전문 용어로 거든다(장식용 대문자 영어 제목 없음) */
function SectionHead({ no, ko, en, lead }) {
  return (
    <header className="sh reveal">
      <div className="menu-rule" style={{ marginBottom: 22 }}><i /></div>
      {no && <p className="sh__no font-ko">{no}</p>}
      <h2 className="sh__t"><span className="sh__ko font-ko">{ko}</span>{en && <span className="sh__en font-serif" lang="en">{en}</span>}</h2>
      {lead && <p className="sh__lead font-ko">{lead}</p>}
    </header>
  );
}

Object.assign(window, { Nav, IntroSequence, HeroClassic, AXCommand, ArtifactsSection, PolicySection, ResearchArchive, Marquee, Composite, Ledger, Trajectory, Lectures, Channels, About, Contact, Footer, SectionHead });
