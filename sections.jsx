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
    ["선언", "#manifesto"], ["궤적", "#trajectory"], ["작업", "#artifacts"],
    ["갤러리", "gallery.html"], ["경력", "career.html"], ["연락", "#contact"],
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
          <img src="images/favicon.svg" alt="YK — 김유빈 CI" width="34" height="34" style={{ display: "block", borderRadius: 9 }} />
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
    <section id="manifesto" ref={ref} style={{ position: "relative", minHeight: "100svh", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: 90, paddingBottom: 60 }}>
      <div className="speckle" />
      <div className="blob-field">
        <div className="blob" style={{ width: 480, height: 420, top: "-8%", left: "-6%" }} />
        <div className="blob" style={{ width: 380, height: 360, bottom: "-10%", right: "-4%" }} />
      </div>

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
          YUBIN<br />KIM
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
            ["법무법인 경국", "Legal Firm Kyung-guk · 인턴"],
            ["AI Process Innovation", "송무·사무 PI & 디지털 마케팅 전략"],
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

      <a href="#trajectory" style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)", color: "var(--ink-soft)", textDecoration: "none" }} className="float">
        <ArrowDown size={24} />
      </a>
    </section>
  );
}

function Sticker({ cls = "", style = {}, children }) {
  return <div className={`sticker ${cls}`} style={{ position: "absolute", zIndex: 4, ...style }}>{children}</div>;
}

/* ============================================================ MARQUEE */
function Marquee() {
  const items = ["YUBIN KIM OFFICE", "TECHNICAL PRECISION", "LEGAL DIGNITY", "AI PROCESS INNOVATION", "DIGITAL MARKETING", "DATA INFRASTRUCTURE", "김유빈 · ETHAN KIM"];
  const Row = () => (
    <span>{items.map((t, i) => (
      <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "2.5rem" }}>
        <span className="font-serif" style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: ".02em" }}>{t}</span>
        <Sparkle size={18} />
      </span>
    ))}</span>
  );
  return (
    <div className="marquee">
      <div className="marquee__track"><Row /><Row /></div>
    </div>
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
        <SectionHead eyebrow="02 — Archive" titleEn="The Trajectory" titleKo="걸어온 궤적" />
        <div className="timeline" style={{ marginTop: 64 }}>
          <div className="timeline__spine" />
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(36px,5vw,58px)" }}>
            {TRAJECTORY.map((e, i) => (
              <div key={i} className="tl-row reveal" style={{ "--accent-fill": e.color, transitionDelay: `${i * 60}ms` }}>
                <span className="tl-node" />
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "8px 18px" }}>
                  <span className="tl-year" style={{ fontSize: "clamp(2rem,5vw,3.4rem)" }}>{e.year}</span>
                  {e.tag && <span className="sticker sticker--apple" style={{ fontSize: ".72rem", padding: ".3em .7em", boxShadow: "0 3px 0 rgba(17,17,17,.12)" }}>{e.tag}</span>}
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
        <SectionHead eyebrow="03 — Limited Editions" titleEn="The Artifacts" titleKo="KREMA AI 교육 과정 6개의 결과물" />
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
        <p className="eyebrow" style={{ color: "rgba(249,246,240,.6)", marginBottom: 24 }}>05 — Consultation</p>
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
          <a href="#artifacts" className="btn btn--ghost" style={{ color: "var(--ecru)", borderColor: "var(--ecru)", boxShadow: "0 5px 0 rgba(249,246,240,.18)" }}>
            작업 보기 <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
      <Footer />
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(249,246,240,.18)", position: "relative", zIndex: 2 }}>
      <div className="wrap" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "26px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="font-serif">
          <span style={{ fontWeight: 900, fontSize: 22 }}>YK</span>
          <span className="font-ko" style={{ fontSize: ".82rem", color: "rgba(249,246,240,.6)", fontFamily: '"Pretendard", sans-serif', fontWeight: 400 }}>YubinKim · 김유빈 — 법무법인 경국</span>
        </div>
        <div className="font-sans" style={{ fontSize: ".78rem", color: "rgba(249,246,240,.5)" }}>© 2026 Yubin Kim. Crafted with technical precision.</div>
        <a href="#top" className="font-sans" style={{ fontSize: ".8rem", color: "var(--ecru)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
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

Object.assign(window, { Nav, Hero, Marquee, Trajectory, Artifacts, About, Contact, Footer, SectionHead });
