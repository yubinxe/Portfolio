/* sections.jsx — all portfolio sections → window */

/* ---------- scroll reveal hook ---------- */
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
    ["선언", "#manifesto"], ["역량", "#composite"], ["궤적", "#trajectory"],
    ["작업", "#artifacts"], ["갤러리", "gallery.html"], ["경력", "career.html"],
  ];
  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      transition: "all .4s ease",
      background: solid ? "rgba(249,246,240,.82)" : "transparent",
      backdropFilter: solid ? "saturate(180%) blur(12px)" : "none",
      borderBottom: solid ? "1px solid rgba(17,17,17,.10)" : "1px solid transparent",
    }}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
        <a href="#top" style={{ textDecoration: "none", color: "var(--ink)", display: "flex", alignItems: "center", gap: 10 }}>
          <img src="images/favicon.svg?v=3" alt="YK — 김유빈 CI" width="34" height="34" style={{ display: "block", borderRadius: 9 }} />
          <span className="sticker sticker--butter font-ko" style={{ padding: ".25em .6em", fontSize: 11, boxShadow: "0 3px 0 rgba(17,17,17,.12)" }}>포트폴리오 ’26</span>
        </a>
        <nav style={{ display: "flex", alignItems: "center", gap: "clamp(14px,2.4vw,32px)" }} className="font-sans">
          <div className="nav-desktop" style={{ display: "flex", gap: "clamp(14px,2.4vw,32px)" }}>
            {links.map(([t, h]) => <a key={t} className="navlink" href={h}>{t}</a>)}
          </div>
          <a href="#contact" className="btn" style={{ padding: ".55em 1.1em", fontSize: ".85rem" }}>
            연락하기 <ArrowUpRight size={16} />
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
      <div className="speckle" />
      <div className="blob-field">
        <div className="blob" style={{ width: 480, height: 420, top: "-8%", left: "-6%" }} />
        <div className="blob" style={{ width: 380, height: 360, bottom: "-10%", right: "-4%" }} />
      </div>
      <span className="watermark font-myeongjo" aria-hidden="true">法</span>

      {/* floating stickers — corners, above the name */}
      <Sticker cls="sticker--apple float"   style={{ top: "15%", left: "5%", "--rot": "-5deg" }}>AI × LAW</Sticker>
      <Sticker cls="sticker--sky float-2"    style={{ top: "19%", right: "5%", "--rot": "4deg" }}>EST. 2004</Sticker>
      <Sticker cls="sticker--lilac float-3"  style={{ bottom: "15%", left: "5%", "--rot": "6deg" }}>서울대 AIED 4기</Sticker>
      <Sticker cls="sticker--pink float"     style={{ bottom: "18%", right: "5%", "--rot": "-6deg" }}>SSAFY 13기</Sticker>

      {/* squiggle accents */}
      <svg width="110" height="54" viewBox="0 0 120 60" style={{ position: "absolute", top: "30%", left: "11%", opacity: .7, zIndex: 3 }} className="float-2">
        <path className="squiggle" d="M5 40 C 25 5, 45 5, 60 30 S 100 55, 115 18" />
      </svg>

      <div className="wrap reveal" style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
        <div className="menu-rule" style={{ maxWidth: 210, margin: "0 auto 22px" }}><i /></div>
        <p className="eyebrow" style={{ color: "var(--ink-soft)", marginBottom: 22 }}>Yubin Kim Office — The Manifesto ’26</p>
        <h1 className="font-serif" style={{ fontWeight: 900, lineHeight: .84, letterSpacing: "-.03em", fontSize: "clamp(3.4rem, 12.5vw, 10.5rem)", margin: 0 }}>
          {"YUBIN".split("").map((c, i) => <span key={i} className="h-ltr" style={{ animationDelay: `${120 + i * 55}ms` }}>{c}</span>)}
          <br />
          {"KIM".split("").map((c, i) => <span key={`k${i}`} className="h-ltr" style={{ animationDelay: `${120 + (i + 6) * 55}ms` }}>{c}</span>)}
        </h1>
        <p className="font-sans" style={{ fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", fontSize: "clamp(.8rem, 2vw, 1.25rem)", marginTop: 28, marginBottom: 22 }}>
          Technical Precision Meets Legal Dignity.
        </p>
        <p className="font-ko" style={{ maxWidth: 620, margin: "0 auto", fontSize: "clamp(1rem, 1.7vw, 1.22rem)", lineHeight: 1.7, color: "var(--ink-soft)" }}>
          기술의 정교함과 제도의 품격을 결합하여,<br />디지털 세계의 새로운 질서를 디자인합니다.
        </p>

        <div className="letterhead font-ko" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 34px", marginTop: 40 }}>
          {[
            ["김유빈", "Yubin Kim · 2004"],
            ["법무법인 경국", "Legal Firm Kyung-guk · 사원"],
            ["AI Process Innovation", "법무 · 법률 송무 & AI · 마케팅 기획"],
          ].map(([a, b], i) => (
            <div key={i} style={{ textAlign: "left", padding: "0 4px" }}>
              <div style={{ fontWeight: 700, fontSize: ".98rem" }}>{a}</div>
              <div style={{ fontSize: ".82rem", color: "var(--ink-soft)", opacity: .85 }}>{b}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 44, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#artifacts" className="btn"><Sparkle size={17} /> 프로젝트 보기</a>
          <a href="#trajectory" className="btn btn--ghost">걸어온 궤적 <ArrowDown size={16} /></a>
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
  const items = ["YUBIN KIM OFFICE", "LEGAL × AI × MARKETING", "TECHNICAL PRECISION", "LEGAL DIGNITY", "COMPOSITE TALENT", "DATA INFRASTRUCTURE", "김유빈 · ETHAN KIM"];
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
    ["6", "수행 프로젝트", "Editions"],
    ["4", "전문 교육 이수", "Programs"],
    ["1", "창업경진 수상", "Award"],
    ["1", "방송 인터뷰", "On Air"],
  ];
  return (
    <section ref={ref} style={{ position: "relative", background: "var(--ink)", color: "var(--ecru)", padding: "clamp(54px,7vw,84px) 0" }}>
      <div className="wrap reveal">
        <div className="menu-rule" style={{ color: "rgba(244,245,248,.45)", marginBottom: 8 }}><i /></div>
        <p className="eyebrow" style={{ color: "rgba(244,245,248,.55)", margin: "18px 0 30px" }}>05 — The Ledger · 한눈에 보는 기록</p>
        <div className="ledger-grid">
          {ITEMS.map(([n, ko, en], i) => (
            <div key={i} className="ledger-item" style={{ transitionDelay: `${i * 70}ms` }}>
              <div className="ledger-num font-serif" data-count={n}>0</div>
              <div className="font-ko" style={{ fontWeight: 700, fontSize: ".95rem", marginTop: 10 }}>{ko}</div>
              <div className="font-sans" style={{ fontSize: ".72rem", letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(244,245,248,.5)", marginTop: 4 }}>{en}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ COMPOSITE — 융합 역량 */
const DOMAINS = [
  { n: "01", ko: "법무 · 송무", short: "법무", en: "Legal Affairs",
    desc: "법무법인 경국에서 송무·사무 실무를 수행하며 제도의 문법과 리스크 감각을 체득했습니다. 규범을 읽어내는 눈은 어떤 기술을 얹어도 흔들리지 않는 기준선이 됩니다.",
    tags: ["법무법인 경국", "송무·사무 실무"] },
  { n: "02", ko: "AI 엔지니어링", short: "AI", en: "AI Engineering",
    desc: "SSAFY 13기와 서울대 AIED 4기를 거쳐 모델의 작동 원리와 프롬프트 아키텍처를 구현 수준에서 다룹니다. 도구를 쓰는 사람이 아니라 설계하는 사람의 자리에 섭니다.",
    tags: ["SSAFY 13기", "서울대 AIED 4기"] },
  { n: "03", ko: "마케팅 기획", short: "마케팅", en: "Marketing Strategy",
    desc: "KREMA 4기에서 데이터 기반 세그먼트 도출과 매체별 전략을 훈련하고, 실제 캠페인 산출물로 검증했습니다. 기획은 취향이 아니라 근거로 증명되어야 합니다.",
    tags: ["KREMA 4기", "브랜드 캠페인"] },
  { n: "04", ko: "데이터 · 인프라", short: "데이터", en: "Data Infrastructure",
    desc: "공공데이터 API와 Google Workspace를 연동해 의사결정 가능한 대시보드를 직접 설계하고 배포합니다. 숫자는 화면 위에 놓일 때 비로소 판단이 됩니다.",
    tags: ["공공데이터 API", "GWS 연동"] },
  { n: "05", ko: "공간 · 건설", short: "건설", en: "Built Environment",
    desc: "건국대 스마트건설기술교육에서 BIM 데이터와 드론 측량을 다루며 부동산과 건설을 데이터의 언어로 읽습니다. 물리적 자산도 결국 하나의 데이터 구조입니다.",
    tags: ["건국대 스마트건설", "BIM · 드론 측량"] },
  { n: "06", ko: "미디어 · 커뮤니케이션", short: "미디어", en: "Media & Comms",
    desc: "서울시민기자단 활동과 방송 인터뷰, 생성형 AI 영상 제작으로 메시지를 대중의 언어로 옮깁니다. 전달되지 않은 성과는 존재하지 않은 것과 같습니다.",
    tags: ["서울시민기자단", "연합뉴스TV"] },
];

const ARSENAL = [
  ["생성형 AI", ["GPT Image-2", "Suno AI", "ElevenLabs", "Veo 3", "Google Vids", "Hyperframe"]],
  ["데이터 · 개발", ["공공데이터 API", "GWS API", "React", "Vercel", "Prompt Architecture"]],
  ["도메인", ["BIM · 드론 측량", "송무 프로세스", "청약 · 부동산 데이터"]],
];

const THESIS = [
  ["교차점의 희소성", "법률의 엄밀함과 AI의 속도를 동시에 구사하는 사람은 드뭅니다. 대체 불가능성은 한 우물의 깊이가 아니라 우물과 우물 사이에서 만들어집니다."],
  ["실행으로 증명", "배운 것을 배포된 결과물로 옮겼습니다. 여섯 개의 프로젝트는 설명이 아니라 열리는 링크로 존재합니다."],
  ["번역의 기술", "제도의 언어, 기술의 언어, 대중의 언어를 오가며 조직 안에서 벌어지는 간극을 메웁니다."],
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
        <line key={"s" + i} className={"cmap__spoke" + (i === active ? " on" : "")} x1="200" y1="200" x2={p[0]} y2={p[1]} />
      ))}
      <circle className="cmap__halo" cx="200" cy="200" r="60" />
      <circle className="cmap__core" cx="200" cy="200" r="46" />
      <text className="cmap__coreT font-serif" x="200" y="197" textAnchor="middle">YK</text>
      <text className="cmap__coreS" x="200" y="215" textAnchor="middle">COMPOSITE</text>
      {NODE.map((p, i) => (
        <circle key={"n" + i} className={"cmap__node" + (i === active ? " on" : "")}
          cx={p[0]} cy={p[1]} r={i === active ? 9.5 : 5.5}
          onMouseEnter={() => onPick(i)} />
      ))}
      {DOMAINS.map((d, i) => (
        <text key={"t" + i} className={"cmap__label" + (i === active ? " on" : "")}
          x={LABEL[i].x} y={LABEL[i].y} textAnchor={LABEL[i].a}
          onMouseEnter={() => onPick(i)}>{d.short}</text>
      ))}
    </svg>
  );
}

function Composite() {
  const ref = useReveal();
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
    <section id="composite" ref={ref} style={{ position: "relative", padding: "clamp(80px,12vw,150px) 0 clamp(90px,13vw,170px)" }}>
      <div className="speckle" style={{ opacity: .2 }} />
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        <SectionHead eyebrow="02 — The Composite" titleEn="The Composite" titleKo="AI 시대의 융합 역량" />

        <div className="comp-thesis reveal">
          <p className="font-myeongjo">
            AI는 도구를 대체하지, 맥락을 대체하지 않습니다.
          </p>
          <p className="font-ko comp-thesis__sub">
            제도를 읽는 눈과 기술을 다루는 손을 함께 가진 사람이 다음 질서를 씁니다.
            여섯 개의 도메인은 각각의 이력이 아니라, 하나의 판단력으로 수렴합니다.
          </p>
        </div>

        <div className="comp-stage">
          <div className="comp-stage__sticky reveal">
            <ConvergenceMap active={active} onPick={setActive} />
            <div className="cmap__cap">
              <span className="font-cond">{DOMAINS[active].n}</span>
              <strong className="font-ko">{DOMAINS[active].ko}</strong>
              <em className="font-sans">{DOMAINS[active].en}</em>
            </div>
          </div>

          <div className="comp-track">
            {DOMAINS.map((d, i) => (
              <article
                key={d.n}
                data-i={i}
                ref={(el) => (rows.current[i] = el)}
                className={"comp-row reveal" + (i === active ? " on" : "")}
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
            ))}
          </div>
        </div>

        <div className="arsenal reveal">
          <div className="menu-rule" style={{ marginBottom: 24 }}><i /></div>
          <p className="eyebrow" style={{ color: "var(--ink-soft)", marginBottom: 26 }}>The Arsenal — 실무에서 다루는 도구</p>
          {ARSENAL.map(([label, tools]) => (
            <div key={label} className="arsenal__row">
              <span className="arsenal__label font-ko">{label}</span>
              <div className="arsenal__chips font-sans">
                {tools.map((t) => <span key={t}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>

        <div className="thesis reveal">
          <div className="menu-rule" style={{ marginBottom: 26 }}><i /></div>
          <p className="eyebrow" style={{ color: "var(--ink-soft)", marginBottom: 34 }}>Why Composite — 왜 융합인가</p>
          <div className="thesis__grid">
            {THESIS.map(([t, b], i) => (
              <div key={t} className="thesis__item">
                <span className="thesis__idx font-serif">{String(i + 1).padStart(2, "0")}</span>
                <h4 className="font-ko">{t}</h4>
                <p className="font-ko">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ TRAJECTORY */
const TRAJECTORY = [
  { year: "2026", tag: "PRESENT", color: "var(--butter)", title: "건국대학교 스마트건설기술교육 프로그램 이수",
    desc: "BIM 설계 데이터 해석과 드론 측량, 건설 자동화 워크플로우를 실습 중심으로 다루며 부동산·건설 도메인을 데이터의 언어로 읽어내는 융합적 관점을 정립." },
  { year: "2026", color: "var(--apple)", title: "서울시민기자단 & 서울청년파트너스 위원 활동",
    desc: "공공 레벨의 미디어 에디팅과 거시적 시정(市政) 트렌드 분석, 트렌디한 정책 제안 프로세스를 주도합니다." },
  { year: "2026", color: "var(--pink)", title: "한국부동산마케팅협회 (KREMA) AI 활용 마케팅 기획자 양성 과정 4기 수료",
    desc: "AI 기술을 활용한 부동산 시장 데이터 분석 및 타겟 세그먼트 도출 프로세스를 이해 및 매체별 디지털 마케팅 전략 수립 및 자동화 솔루션 기획 역량을 종합적으로 체화." },
  { year: "2026", color: "var(--sky)", title: "서울대학교 AI 교육 전문가 과정 (AIED) 4기 수료",
    desc: "인공지능 메커니즘의 비즈니스 도메인 최적화 적용, 구조화된 프롬프트 엔지니어링 아키텍처의 이해와 교수법 체화." },
  { year: "2025", color: "var(--lilac)", title: "삼성청년SW아카데미 (SSAFY) 13기 이수",
    desc: "최신 소프트웨어 아키텍처와 하이테크 AI 융합 알고리즘 실무 프로젝트로 엔지니어링 역량을 내재화." },
  { year: "2023", color: "var(--pink)", title: "육군창업경진대회 · 강원열린군대 창업프로그램 2군단장상 수상",
    desc: "HVAC 기술 기반 리스크 관리 혁신 아이디어 제안 및 구조화된 비즈니스 모델(BM) 유효성의 공식 검증." },
  { year: "2022", color: "var(--butter)", title: "대구광역시교육청 · 독일 Vattenfall 해외 연수",
    desc: "유럽 선진 기업의 인프라 시스템과 글로벌 비즈니스 스탠다드를 조기에 체득한 글로벌 역량의 시초." },
];

function Trajectory() {
  const ref = useReveal();
  return (
    <section id="trajectory" ref={ref} style={{ position: "relative", padding: "clamp(80px,12vw,150px) 0" }}>
      <div className="wrap">
        <SectionHead eyebrow="03 — Archive" titleEn="The Trajectory" titleKo="걸어온 궤적" />
        <div className="timeline" style={{ marginTop: 64 }}>
          <div className="timeline__spine" />
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(36px,5vw,58px)" }}>
            {TRAJECTORY.map((e, i) => (
              <div key={i} className="tl-row reveal" style={{ "--accent-fill": e.color, transitionDelay: `${i * 60}ms` }}>
                <span className="tl-node" />
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "8px 18px" }}>
                  <span className="tl-year" style={{ fontSize: "clamp(2rem,5vw,3.4rem)" }}>{e.year}</span>
                  {e.tag && <span className="sticker sticker--apple" style={{ fontSize: ".72rem", padding: ".3em .7em", boxShadow: "0 3px 0 rgba(17,17,17,.12)" }}>{e.tag}</span>}
                  <span className="tl-idx font-cond">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="font-ko" style={{ fontWeight: 800, fontSize: "clamp(1.15rem,2.2vw,1.6rem)", margin: "10px 0 8px", letterSpacing: "-.01em" }}>{e.title}</h3>
                <p className="font-ko" style={{ maxWidth: 720, color: "var(--ink-soft)", lineHeight: 1.75, fontSize: "clamp(.95rem,1.4vw,1.05rem)" }}>{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ ARTIFACTS */
const EDITIONS = [
  { n: "01", color: "var(--sky)", Icon: BarChart, title: "공공데이터 API 활용\n청약 인사이트 대시보드",
    desc: "대한민국 부동산 청약 시장의 거시 데이터와 트렌드를 직관적으로 시각화한 데이터 인프라 솔루션. 시장의 자본 흐름을 분석해 명료하고 정교한 대시보드로 구현했습니다.",
    status: "Vercel 배포 완료", cta: "대시보드 바로가기", url: "https://cheongak-dashboard-opal.vercel.app", tags: ["Public Data API", "Dashboard", "Data Viz"] },
  { n: "02", color: "var(--apple)", Icon: Cpu, title: "GWS 연동 VOC 분석\n트리아지(Triage) 시스템",
    desc: "Google Workspace(GWS) API를 연동해 고객 피드백을 실시간 어그리게이션하고, 자체 AI 분류 알고리즘으로 리스크 업무 우선순위를 자동화한 백오피스 혁신 대시보드.",
    status: "Vercel 배포 완료", cta: "시스템 바로가기", url: "https://mail-dashboard-blue-six.vercel.app", tags: ["GWS API", "AI Triage", "Back-office"] },
  { n: "03", color: "var(--pink)", Icon: PlayCircle, title: "Hyperframe × ElevenLabs\n멀티미디어 프로모션",
    desc: "다양한 생성형 AI 툴을 고도로 복합 활용해 복잡한 부동산 청약 데이터와 플랫폼 활용성을 대중이 직관적으로 이해하도록 설계한 고품질 영상·시네마틱 오디오 브랜딩 프로젝트.",
    status: "Google Drive 스트리밍 자산 구축 완료", cta: "프로모션 영상 보기", url: "https://drive.google.com/file/d/1F3PssuwdFkcWaiT6fZHgQlz44As0I2nq/view?usp=sharing", tags: ["Generative AI", "Video", "Audio Branding"] },
  { n: "04", color: "var(--butter)", Icon: Newspaper, title: "6·3 지방선거\nAI 카드뉴스 & 시네마틱 영상",
    desc: "GPT Image-2·Suno AI·ElevenLabs를 수직 통합해 2026 전국동시지방선거 결과를 분석·시각화한 인스타그램 카드뉴스 6종과 나레이션 영상을 제작. 사회학적 인사이트를 2030 세대가 소비하는 포맷으로 번역한 생성형 AI 풀스택 미디어 프로젝트.",
    status: "Google Drive 스트리밍 자산 구축 완료", cta: "영상 바로 보기", url: "https://drive.google.com/file/d/1k4BcuFz671SajLydfRs5gMRFG2Hu3RWj/view?usp=sharing", tags: ["GPT Image-2", "Suno AI", "ElevenLabs"] },
  { n: "05", color: "var(--lilac)", Icon: Sparkle, title: "Veo 3 × Google Vids\n르엘 성수 브랜드 필름",
    desc: "Google Vids에 탑재된 Veo 3 모델을 활용해 프리미엄 주거 브랜드 '르엘 성수'의 공간 가치와 무드를 시네마틱 영상 언어로 번역한 브랜드 홍보 필름. 텍스트 프롬프트만으로 고품질 무빙 이미지를 생성·편집하며 부동산 영상 제작 워크플로우를 재정의한 생성형 AI 프로젝트.",
    status: "Google Drive 스트리밍 자산 구축 완료", cta: "홍보 영상 보기", url: "https://drive.google.com/file/d/1NQRlbAKrxlap8Nfdec3hAdx0pN3ewDhN/view?usp=sharing", tags: ["Veo 3", "Google Vids", "Brand Film"] },
  { n: "06", color: "var(--sky)", Icon: Award, title: "루이비통\nVeo 3 시네마틱 캠페인 필름",
    desc: "동일한 Veo 3 파이프라인으로 메종 '루이비통'의 헤리티지와 장인정신을 무드 중심의 시네마틱 광고로 재해석한 럭셔리 브랜드 캠페인 필름. 생성형 AI만으로 하이엔드 패션 광고 특유의 질감과 톤을 구현해 브랜디드 콘텐츠 제작의 새로운 방식을 제안한 프로젝트.",
    status: "Google Drive 스트리밍 자산 구축 완료", cta: "캠페인 영상 보기", url: "https://drive.google.com/file/d/1mIEmvwjPfZwuXYZRkWW9FzZU3uvCUq69/view?usp=sharing", tags: ["Veo 3", "Google Vids", "Luxury Film"] },
];

function Artifacts() {
  const ref = useReveal();
  return (
    <section id="artifacts" ref={ref} style={{ position: "relative", padding: "clamp(80px,12vw,150px) 0", background: "var(--ecru-deep)" }}>
      <div className="wrap">
        <SectionHead eyebrow="04 — Limited Editions" titleEn="The Artifacts" titleKo="KREMA AI 교육 과정 6개의 결과물" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "clamp(22px,3vw,34px)", marginTop: 64 }}>
          {EDITIONS.map((e, i) => (
            <article key={i} className="edition reveal" style={{ "--accent-fill": e.color, transitionDelay: `${i * 90}ms` }}>
              <div className="edition__chip">{e.status}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <span className="edition__num">{e.n}</span>
                <span style={{ width: 52, height: 52, borderRadius: 16, background: e.color, display: "grid", placeItems: "center", color: "var(--ink)" }}>
                  <e.Icon size={24} />
                </span>
              </div>
              <span className="edition__index-band" />
              <p className="font-play" style={{ fontSize: ".78rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-soft)", margin: "16px 0 6px" }}>Edition {e.n}</p>
              <h3 className="font-ko" style={{ fontWeight: 800, fontSize: "clamp(1.3rem,2vw,1.55rem)", lineHeight: 1.28, margin: "0 0 14px", whiteSpace: "pre-line", letterSpacing: "-.01em" }}>{e.title}</h3>
              <p className="font-ko" style={{ color: "var(--ink-soft)", lineHeight: 1.72, fontSize: ".96rem", flexGrow: 1 }}>{e.desc}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, margin: "18px 0 22px" }}>
                {e.tags.map((t) => <span key={t} className="font-sans" style={{ fontSize: ".72rem", fontWeight: 600, padding: ".32em .7em", borderRadius: 999, border: "1.5px solid var(--ink)", color: "var(--ink)" }}>{t}</span>)}
              </div>
              <a href={e.url} target="_blank" rel="noreferrer" className="btn" style={{ alignSelf: "flex-start" }}>
                {e.cta} <ExternalLink size={16} />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ ABOUT */
function About() {
  const ref = useReveal();
  return (
    <section id="about" ref={ref} style={{ position: "relative", padding: "clamp(80px,12vw,150px) 0", overflow: "hidden" }}>
      <div className="speckle" style={{ opacity: .35 }} />
      <div className="wrap reveal" style={{ position: "relative", zIndex: 1 }}>
        <div className="about-grid">
          <div>
            <Quote size={46} style={{ color: "var(--ink)" }} />
            <h3 className="font-myeongjo" style={{ fontWeight: 800, fontSize: "clamp(1.45rem,2.6vw,2.1rem)", lineHeight: 1.42, letterSpacing: "-.01em", margin: "20px 0 0", textWrap: "balance" }}>
              법(法)의 품격과 코드의 정교함,<br />그 경계에서 일합니다.
            </h3>
            <p className="font-ko" style={{ margin: "18px 0 0", maxWidth: 520, fontSize: "clamp(.98rem,1.4vw,1.08rem)", lineHeight: 1.8, color: "var(--ink-soft)" }}>
              송무·사무 프로세스를 AI로 다시 설계하고, 복잡한 제도를 누구나 이해할 수 있는 디지털 경험으로 번역합니다.
            </p>
            <p className="font-ko" style={{ margin: "12px 0 0", maxWidth: 520, fontSize: "clamp(.98rem,1.4vw,1.08rem)", lineHeight: 1.8, color: "var(--ink-soft)" }}>
              강의실과 사무실, 카메라 앞을 오가며 쌓아온 시간을 기록으로 남깁니다. 말보다 결과물이 먼저 증명하도록.
            </p>

            <div className="font-ko" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 26 }}>
              {["품격", "정교함", "질서"].map((k) => (
                <span key={k} style={{ fontSize: ".8rem", fontWeight: 600, padding: ".38em .95em", borderRadius: 999, border: "1.5px solid var(--ink)", color: "var(--ink)" }}>{k}</span>
              ))}
            </div>

            <div className="font-ko" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 20, fontSize: ".9rem", color: "var(--ink-soft)" }}>
              <MapPin size={15} /> 서울 서초구 — 법무법인 경국
            </div>

            <div style={{ marginTop: 30, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="gallery.html" className="btn btn--ghost" style={{ fontSize: ".88rem" }}>활동 갤러리 <ArrowUpRight size={15} /></a>
              <a href="career.html" className="btn btn--ghost" style={{ fontSize: ".88rem" }}>경력 상세 <ArrowUpRight size={15} /></a>
            </div>
          </div>

          <div className="about-gallery">
            <figure className="photo-card photo-card--tall reveal">
              <img src="images/profile-formal.jpg" alt="김유빈 공식 프로필" loading="lazy" />
              <figcaption className="font-ko"><span className="photo-card__chip">PROFILE</span>김유빈 · Yubin Kim</figcaption>
            </figure>
            <figure className="photo-card reveal" style={{ transitionDelay: "90ms" }}>
              <img src="images/press-yonhap.jpg" alt="연합뉴스TV 인터뷰 — 강남1인가구센터" loading="lazy" />
              <figcaption className="font-ko"><span className="photo-card__chip photo-card__chip--red">ON AIR</span>연합뉴스TV 인터뷰</figcaption>
            </figure>
            <figure className="photo-card reveal" style={{ transitionDelay: "180ms" }}>
              <img src="images/ssafy-presentation.jpg" alt="SSAFY 13기 프로젝트 발표" loading="lazy" />
              <figcaption className="font-ko"><span className="photo-card__chip">SSAFY 13기</span>프로젝트 발표</figcaption>
            </figure>
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
    <section id="contact" ref={ref} style={{ position: "relative", background: "var(--ink)", color: "var(--ecru)", padding: "clamp(80px,12vw,150px) 0 0", overflow: "hidden" }}>
      <Sticker cls="sticker--butter float" style={{ top: "12%", right: "8%", "--rot": "6deg" }}>같이 작업해요 ✦</Sticker>
      <div className="seal" aria-hidden="true">
        <svg viewBox="0 0 120 120">
          <defs>
            <path id="sealArc" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" fill="none" />
          </defs>
          <circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="60" cy="60" r="32" fill="none" stroke="currentColor" strokeWidth="0.9" />
          <text fontSize="9.2" letterSpacing="2.2" fill="currentColor" fontFamily="Inter, Pretendard, sans-serif" fontWeight="600">
            <textPath href="#sealArc">YUBIN KIM OFFICE · LEGAL DIGNITY · TECHNICAL PRECISION ·</textPath>
          </text>
          <text x="60" y="68.5" textAnchor="middle" fontFamily="Playfair Display, serif" fontWeight="900" fontSize="25" fill="currentColor">YK</text>
        </svg>
      </div>
      <div className="wrap reveal" style={{ position: "relative", zIndex: 2, textAlign: "center", paddingBottom: "clamp(70px,10vw,120px)" }}>
        <p className="eyebrow" style={{ color: "rgba(249,246,240,.6)", marginBottom: 24 }}>06 — Consultation</p>
        <h2 className="font-serif" style={{ fontWeight: 900, fontSize: "clamp(2.6rem,9vw,7rem)", lineHeight: .92, letterSpacing: "-.03em", margin: 0 }}>
          Let’s design<br />the next order.
        </h2>
        <p className="font-ko" style={{ color: "rgba(249,246,240,.7)", maxWidth: 560, margin: "26px auto 40px", lineHeight: 1.7, fontSize: "1.05rem" }}>
          새로운 협업과 프로젝트 또는 간단한 인사도 환영합니다.<br />함께 일하고 싶은 분들은 언제든 Contact 해주세요.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="mailto:yubin120866@gmail.com" className="btn" style={{ background: "var(--ecru)", color: "var(--ink)", borderColor: "var(--ecru)" }}>
            <Mail size={18} /> 인사 건네기
          </a>
          <a href="#artifacts" className="btn btn--ghost" style={{ color: "var(--ecru)", borderColor: "var(--ecru)", boxShadow: "none" }}>
            작업 보기 <ArrowUpRight size={16} />
          </a>
          <button type="button" id="copyMail" className="btn btn--ghost" style={{ color: "var(--ecru)", borderColor: "var(--ecru)", boxShadow: "none" }}>
            이메일 복사
          </button>
        </div>
      </div>
      <Footer />
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(249,246,240,.18)", position: "relative", zIndex: 2 }}>
      <div className="wrap f-links font-sans" style={{ display: "flex", flexWrap: "wrap", gap: "10px 26px", padding: "22px 0 0" }}>
        {[["선언", "#manifesto"], ["궤적", "#trajectory"], ["작업", "#artifacts"], ["갤러리", "gallery.html"], ["경력", "career.html"]].map(([t, h]) => (
          <a key={t} href={h}>{t}</a>
        ))}
        <a href="mailto:yubin120866@gmail.com" style={{ marginLeft: "auto" }}>yubin120866@gmail.com</a>
      </div>
      <div className="wrap footer-grid" style={{ padding: "26px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifySelf: "start" }} className="font-serif">
          <span style={{ fontWeight: 900, fontSize: 22 }}>YK</span>
          <span className="font-ko" style={{ fontSize: ".82rem", color: "rgba(249,246,240,.6)", fontFamily: '"Pretendard", sans-serif', fontWeight: 400 }}>YubinKim · 김유빈 — 법무법인 경국</span>
        </div>
        <div className="font-sans" style={{ fontSize: ".78rem", color: "rgba(249,246,240,.5)", justifySelf: "center", textAlign: "center" }}>© 2026 Yubin Kim. Crafted with technical precision.</div>
        <a href="#top" className="font-sans" style={{ fontSize: ".8rem", color: "var(--ecru)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, justifySelf: "end" }}>
          맨 위로 <span style={{ display: "inline-block", transform: "rotate(-45deg)" }}><ArrowUpRight size={15} /></span>
        </a>
      </div>
    </footer>
  );
}

/* ---------- shared section header ---------- */
function SectionHead({ eyebrow, titleEn, titleKo }) {
  return (
    <div className="reveal">
      <div className="menu-rule" style={{ marginBottom: 26 }}><i /></div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <p className="eyebrow" style={{ color: "var(--ink-soft)", marginBottom: 14 }}>{eyebrow}</p>
          <h2 className="font-serif" style={{ fontWeight: 900, fontSize: "clamp(2.4rem,6vw,5rem)", lineHeight: .95, letterSpacing: "-.03em", margin: 0 }}>{titleEn}</h2>
        </div>
        <p className="font-ko" style={{ fontWeight: 600, fontSize: "clamp(1rem,1.6vw,1.2rem)", color: "var(--ink-soft)", whiteSpace: "nowrap", flexShrink: 0, paddingBottom: ".4em" }}>{titleKo}</p>
      </div>
    </div>
  );
}

Object.assign(window, { Nav, Hero, Marquee, Composite, Ledger, Trajectory, Artifacts, About, Contact, Footer, SectionHead });
