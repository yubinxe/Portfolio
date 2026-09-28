/* 자동 생성 파일 — 수정하지 마세요. 원본: sections.jsx · 갱신: npm run build */
/* sections.jsx — all portfolio sections → window */

/* ---------- scroll reveal hook ---------- */
function useReveal() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => {if (e.isIntersecting) {e.target.classList.add("in");io.unobserve(e.target);}}),
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
  ["강의", "#lectures"], ["갤러리", "gallery.html"], ["경력 상세", "career.html"]];

  return (/*#__PURE__*/
    React.createElement("header", { className: "hnav" + (solid ? " is-solid" : ""), style: {
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50
      } }, /*#__PURE__*/
    React.createElement("div", { className: "wrap", style: { display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 } }, /*#__PURE__*/
    React.createElement("a", { href: "#top", style: { textDecoration: "none", color: "var(--ink)", display: "flex", alignItems: "center", gap: 10 } }, /*#__PURE__*/
    React.createElement("img", { src: "images/favicon.svg?v=4", alt: "YK \u2014 \uAE40\uC720\uBE48 CI", width: "32", height: "32", style: { display: "block" } }), /*#__PURE__*/
    React.createElement("span", { className: "hnav__name" }, /*#__PURE__*/
    React.createElement("b", { className: "font-serif" }, "Yubin Kim"), /*#__PURE__*/
    React.createElement("small", null, "AI Strategy & Planning")
    )
    ), /*#__PURE__*/
    React.createElement("nav", { "aria-label": "\uC8FC\uC694 \uBA54\uB274", style: { display: "flex", alignItems: "center", gap: "clamp(14px,2.4vw,32px)" }, className: "font-sans" }, /*#__PURE__*/
    React.createElement("div", { className: "nav-desktop", style: { display: "flex", gap: "clamp(14px,2.4vw,32px)" } },
    links.map(([t, h]) => /*#__PURE__*/React.createElement("a", { key: t, className: "navlink", href: h }, t))
    ), /*#__PURE__*/
    React.createElement("a", { href: "#contact", className: "btn", style: { padding: ".55em 1.1em", fontSize: ".85rem" } }, "Contact ", /*#__PURE__*/
    React.createElement(ArrowUpRight, { size: 14 })
    )
    )
    )
    ));

}

/* ============================================================ HERO */
function Hero() {
  const ref = useReveal();
  return (/*#__PURE__*/
    React.createElement("section", { id: "manifesto", ref: ref, style: { position: "relative", minHeight: "100svh", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: 90, paddingBottom: 150 } }, /*#__PURE__*/
    React.createElement("div", { className: "hero-photo", "aria-hidden": "true" }, /*#__PURE__*/
    React.createElement("img", { src: "images/hero-gangnam-1000.jpg?v=1", srcSet: "images/hero-gangnam-1000.jpg?v=1 1000w, images/hero-gangnam.jpg?v=1 1978w", sizes: "100vw", alt: "", fetchpriority: "high", decoding: "async" })
    ), /*#__PURE__*/
    React.createElement("div", { className: "hero-photo__scrim", "aria-hidden": "true" }), /*#__PURE__*/

    React.createElement("div", { className: "wrap reveal", style: { position: "relative", zIndex: 2, textAlign: "center" } }, /*#__PURE__*/
    React.createElement("div", { className: "menu-rule", style: { maxWidth: 210, margin: "0 auto 18px" } }, /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/
    React.createElement("p", { className: "font-sans hero-kicker" }, "Seoul \xB7 Portfolio 2026"), /*#__PURE__*/
    React.createElement("p", { className: "eyebrow hero-eyebrow" }, "AI Strategy & Planning"), /*#__PURE__*/
    React.createElement("h1", { className: "font-serif", style: { fontWeight: 900, lineHeight: .84, letterSpacing: "-.03em", fontSize: "clamp(3.4rem, 12.5vw, 10.5rem)", margin: 0 } }, /*#__PURE__*/
    React.createElement("span", { className: "sr-only" }, "\uAE40\uC720\uBE48 Yubin Kim \u2014 AI \uC804\uB7B5\uAE30\uD68D"),
    "YUBIN".split("").map((c, i) => /*#__PURE__*/React.createElement("span", { key: i, className: "h-ltr", style: { animationDelay: `${120 + i * 55}ms` } }, c)), /*#__PURE__*/
    React.createElement("br", null),
    "KIM".split("").map((c, i) => /*#__PURE__*/React.createElement("span", { key: `k${i}`, className: "h-ltr", style: { animationDelay: `${120 + (i + 6) * 55}ms` } }, c))
    ), /*#__PURE__*/
    React.createElement("p", { className: "font-ko", style: { fontWeight: 600, letterSpacing: ".01em", fontSize: "clamp(.92rem, 1.6vw, 1.12rem)", color: "var(--ink)", marginTop: 26, marginBottom: 20 } },
    "AI 전략기획 · 법무법인 경국 — Strategy · Automation · Data"
    ), /*#__PURE__*/
    React.createElement("p", { className: "font-ko", style: { maxWidth: 620, margin: "0 auto", fontSize: "clamp(1rem, 1.7vw, 1.22rem)", lineHeight: 1.7, color: "var(--ink-soft)" } }, "\uB370\uC774\uD130\uB85C \uD310\uB2E8\uC758 \uADFC\uAC70\uB97C \uB9CC\uB4E4\uACE0,", /*#__PURE__*/
    React.createElement("br", null), "AI\uB85C \uC2E4\uD589\uC758 \uC18D\uB3C4\uB97C \uB9CC\uB4ED\uB2C8\uB2E4."
    ), /*#__PURE__*/
    React.createElement("p", { className: "font-ko hero-proof" }, "AI\uB85C \uD480 \uBB38\uC81C\uB97C \uC815\uC758\uD558\uACE0, \uC790\uB3D9\uD654 \uC2DC\uC2A4\uD15C\uC744 \uC9C1\uC811 \uAD6C\uD604\uD574 \uC2E4\uC81C \uC5C5\uBB34\uC5D0 \uC801\uC6A9\uD569\uB2C8\uB2E4."

    ), /*#__PURE__*/

    React.createElement("div", { style: { marginTop: 44, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" } }, /*#__PURE__*/
    React.createElement("a", { href: "#artifacts", className: "btn" }, "\uB300\uD45C \uD504\uB85C\uC81D\uD2B8 ", /*#__PURE__*/React.createElement(ArrowDown, { size: 15 })), /*#__PURE__*/
    React.createElement("a", { href: "#composite", className: "btn btn--ghost" }, "\uD575\uC2EC \uC5ED\uB7C9"), /*#__PURE__*/
    React.createElement("a", { href: "career.html", className: "btn btn--ghost" }, "\uACBD\uB825 \uC0C1\uC138 ", /*#__PURE__*/React.createElement(ArrowUpRight, { size: 15 }))
    )
    ), /*#__PURE__*/

    React.createElement("a", { href: "#trajectory", className: "scroll-cue", style: { position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", textDecoration: "none" } }, /*#__PURE__*/
    React.createElement("span", { className: "font-sans", style: { fontSize: ".64rem", letterSpacing: ".3em", fontWeight: 600 } }, "SCROLL"), /*#__PURE__*/
    React.createElement("i", null)
    )
    ));

}

function Sticker({ cls = "", style = {}, children }) {
  return /*#__PURE__*/React.createElement("div", { className: `sticker ${cls}`, style: { position: "absolute", zIndex: 4, ...style } }, children);
}

/* ============================================================ MARQUEE */
function Marquee() {
  const items = ["YUBIN KIM OFFICE", "전략기획 × AI", "STRATEGIC PLANNING", "PROCESS AUTOMATION", "DATA-DRIVEN DECISIONS", "AI 강의 · LECTURES", "김유빈 · ETHAN KIM"];
  const Row = () => /*#__PURE__*/
  React.createElement("span", null, items.map((t, i) => /*#__PURE__*/
  React.createElement("span", { key: i, style: { display: "inline-flex", alignItems: "center", gap: "2.5rem" } }, /*#__PURE__*/
  React.createElement("span", { className: "font-serif", style: { fontSize: "1.5rem", fontWeight: 700, letterSpacing: ".02em" } }, t), /*#__PURE__*/
  React.createElement(Sparkle, { size: 18 })
  )
  ));

  const RowOutline = () => /*#__PURE__*/
  React.createElement("span", null, items.map((t, i) => /*#__PURE__*/
  React.createElement("span", { key: i, style: { display: "inline-flex", alignItems: "center", gap: "2.5rem" } }, /*#__PURE__*/
  React.createElement("span", { className: "font-cond m-outline", style: { fontSize: "1.15rem" } }, t), /*#__PURE__*/
  React.createElement(Sparkle, { size: 14, style: { opacity: .55 } })
  )
  ));

  return (/*#__PURE__*/
    React.createElement("div", { className: "marquee", style: { flexDirection: "column" } }, /*#__PURE__*/
    React.createElement("div", { className: "marquee__line" }, /*#__PURE__*/React.createElement("div", { className: "marquee__track" }, /*#__PURE__*/React.createElement(Row, null), /*#__PURE__*/React.createElement(Row, null))), /*#__PURE__*/
    React.createElement("div", { className: "marquee__line marquee__line--rev" }, /*#__PURE__*/React.createElement("div", { className: "marquee__track marquee__track--rev" }, /*#__PURE__*/React.createElement(RowOutline, null), /*#__PURE__*/React.createElement(RowOutline, null)))
    ));

}

/* ============================================================ LEDGER — at a glance */
function Ledger() {
  const ref = useReveal();
  const ITEMS = [
  ["8", "AI · 자동화 결과물", "Projects"],
  ["4", "배포 · 사내 운영 시스템", "In Operation"],
  ["4", "AI · 데이터 전문교육", "Programs"],
  ["3", "수상 · 표창", "Awards"]];

  return (/*#__PURE__*/
    React.createElement("section", { ref: ref, className: "ledger", "aria-label": "\uD55C\uB208\uC5D0 \uBCF4\uB294 \uAE30\uB85D" }, /*#__PURE__*/
    React.createElement("div", { className: "wrap reveal" }, /*#__PURE__*/
    React.createElement("p", { className: "eyebrow ledger__eyebrow" }, "At a Glance \u2014 \uD55C\uB208\uC5D0 \uBCF4\uB294 \uAE30\uB85D"), /*#__PURE__*/
    React.createElement("div", { className: "ledger-grid" },
    ITEMS.map(([n, ko, en], i) => /*#__PURE__*/
    React.createElement("div", { key: i, className: "ledger-item", style: { transitionDelay: `${i * 70}ms` } }, /*#__PURE__*/
    React.createElement("div", { className: "ledger-num font-serif", "data-count": n }, n), /*#__PURE__*/
    React.createElement("div", { className: "ledger-ko font-ko" }, ko), /*#__PURE__*/
    React.createElement("div", { className: "ledger-en font-sans" }, en)
    )
    )
    )
    )
    ));

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
  tags: ["법무법인 경국", "스마트건설 · 청년정책"] }];


/* ============================================================ LECTURES — 강의 프로그램 */
const LECTURE_TRACKS = [
{ key: "foundation", label: "Track A — AI 파운데이션", ko: "도구를 쓰는 사람에서, 도구를 설계하는 사람으로",
  desc: "개념부터 에이전트 설계까지. SSAFY 13기의 엔지니어링 훈련과 서울대 AIED 4기의 프롬프트 아키텍처·교수법을 실무 언어로 옮긴 네 과정입니다." },
{ key: "domain", label: "Track B — 도메인 적용", ko: "만들어 본 사람만 가르칠 수 있는 것",
  desc: "직접 기획·배포해 운영 중인 시스템에서 나온 네 과정. KREMA 4기의 시장 데이터 전략과 현장 산출물을 사례로 다룹니다." }];


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
  proof: { label: "지방선거 카드뉴스", href: "#ed-01" } }];


const LECTURE_BASIS = [
["삼성청년SW아카데미 13기", "소프트웨어 아키텍처와 AI 알고리즘을 실무 프로젝트로 학습. 홍보 앰배서더로 지원자 대상 커뮤니케이션도 수행했습니다."],
["서울대학교 AIED 4기", "AI 교육 전문가 과정에서 구조화된 프롬프트 아키텍처와 교수법을 체화했습니다."],
["한국부동산마케팅협회 4기", "AI 기반 시장 데이터 분석과 세그먼트 도출, 매체별 전략 수립을 익혔습니다."],
["배포된 결과물 8건", "강의 사례는 전부 직접 만들어 운영 중인 산출물입니다. 시연 가능한 화면으로 수업합니다."]];


const ARSENAL = [
["생성형 AI", ["GPT Image-2", "Suno AI", "ElevenLabs", "Veo 3", "Google Vids", "Hyperframe"]],
["데이터 · 개발", ["공공데이터 API", "GWS API", "React", "Vercel", "Prompt Architecture"]],
["도메인", ["BIM · 드론 측량", "송무 프로세스", "청약 · 부동산 데이터"]]];


const CREDS = [
{ name: "TESAT", ko: "경제이해력검증시험", by: "한국경제신문 주관" },
{ name: "OPIc IH", ko: "영어 말하기 (Intermediate High)", by: "ACTFL 공인 등급" },
{ name: "전기기능사", ko: "국가기술자격", by: "한국산업인력공단" },
{ name: "분양대행자", ko: "부동산 분양 실무 자격", by: "주택·상가 분양 대행" }];


const THESIS = [
["교차점의 희소성", "법률의 엄밀함과 인공지능의 구현 역량을 함께 갖춘 인력은 많지 않다. 대체 불가능성은 한 분야의 깊이가 아니라 서로 다른 분야가 만나는 경계에서 형성."],
["실행을 통한 증명", "학습한 내용을 배포 가능한 결과물로 구현. 여섯 건의 프로젝트는 서술이 아니라 접근 가능한 산출물로 존재."],
["언어의 매개", "제도의 언어와 기술의 언어, 대중의 언어를 오가며 조직 내부에서 발생하는 소통의 간극을 조정."]];


const CASES = [
{ n: "01", title: "VOC 트리아지 시스템", tag: "GWS API · 분류 알고리즘",
  manual: "담당자가 메일함을 직접 확인하며 사안의 우선순위를 판단하던 업무.",
  auto: "Workspace API가 실시간으로 데이터를 수집하고, 분류 알고리즘이 1차 선별을 수행.",
  judge: "무엇을 리스크로 볼지 정하는 건 결국 사람 몫이고, 그 기준은 법무 감각에서 나옵니다." },
{ n: "02", title: "청약 인사이트 대시보드", tag: "공공데이터 API",
  manual: "분산된 공고를 수집하여 표로 정리하던 업무.",
  auto: "API가 데이터를 수집하고, 대시보드가 자동으로 갱신.",
  judge: "어떤 지표를 나란히 놓아야 의미가 생기는지는 시장을 알아야 보입니다." },
{ n: "03", title: "정비사업 용역비 자동 수집", tag: "누리장터 · 웹 크롤링",
  manual: "흩어진 용역 입찰 공고를 사이트마다 찾아 단가를 옮겨 적던 업무.",
  auto: "크롤러가 정기적으로 공고와 용역비를 수집·정형화해 비교 가능한 데이터셋으로 축적.",
  judge: "어떤 항목을 표준 필드로 삼아야 사업성 검토에 쓰이는지는 시장을 알아야 정할 수 있습니다." }];


const NODE = [[200, 68], [314, 134], [314, 266], [200, 332], [86, 266], [86, 134]];
const LABEL = [
{ x: 200, y: 46, a: "middle" }, { x: 334, y: 128, a: "start" }, { x: 334, y: 278, a: "start" },
{ x: 200, y: 360, a: "middle" }, { x: 66, y: 278, a: "end" }, { x: 66, y: 128, a: "end" }];


function ConvergenceMap({ active, onPick }) {
  return (/*#__PURE__*/
    React.createElement("svg", { className: "cmap", viewBox: "0 0 400 400", role: "img", "aria-label": "\uC5EC\uC12F \uB3C4\uBA54\uC778\uC774 \uD558\uB098\uB85C \uC218\uB834\uD558\uB294 \uC735\uD569 \uC5ED\uB7C9 \uB2E4\uC774\uC5B4\uADF8\uB7A8" }, /*#__PURE__*/
    React.createElement("polygon", { className: "cmap__ring", points: NODE.map((p) => p.join(",")).join(" ") }),
    NODE.map((p, i) => /*#__PURE__*/
    React.createElement("line", { key: "s" + i, className: "cmap__spoke" + (DOMAINS[i].core ? " core" : "") + (i === active ? " on" : ""), x1: "200", y1: "200", x2: p[0], y2: p[1] })
    ), /*#__PURE__*/
    React.createElement("circle", { className: "cmap__halo", cx: "200", cy: "200", r: "60" }), /*#__PURE__*/
    React.createElement("circle", { className: "cmap__core", cx: "200", cy: "200", r: "46" }), /*#__PURE__*/
    React.createElement("text", { className: "cmap__coreT font-serif", x: "200", y: "199", textAnchor: "middle" }, "AI"), /*#__PURE__*/
    React.createElement("text", { className: "cmap__coreS", x: "200", y: "215", textAnchor: "middle" }, "STRATEGY"),
    NODE.map((p, i) => /*#__PURE__*/
    React.createElement("circle", { key: "n" + i, className: "cmap__node" + (DOMAINS[i].core ? " core" : "") + (i === active ? " on" : ""),
      cx: p[0], cy: p[1], r: i === active ? 9.5 : DOMAINS[i].core ? 7 : 4.5,
      onMouseEnter: () => onPick(i) })
    ),
    DOMAINS.map((d, i) => /*#__PURE__*/
    React.createElement("text", { key: "t" + i, className: "cmap__label" + (d.core ? " core" : "") + (i === active ? " on" : ""),
      x: LABEL[i].x, y: LABEL[i].y, textAnchor: LABEL[i].a,
      onMouseEnter: () => onPick(i) }, d.short)
    )
    ));

}

function Composite() {
  const ref = useReveal();
  const bandRef = useReveal();
  const [active, setActive] = React.useState(0);
  const rows = React.useRef([]);

  React.useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => {if (e.isIntersecting) setActive(Number(e.target.getAttribute("data-i")));}),
      { rootMargin: "-42% 0px -46% 0px" }
    );
    rows.current.forEach((n) => n && io.observe(n));
    return () => io.disconnect();
  }, []);

  return (/*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("section", { id: "composite", ref: ref, style: { position: "relative", padding: "clamp(80px,12vw,150px) 0 clamp(80px,10vw,120px)" } }, /*#__PURE__*/
    React.createElement("div", { className: "speckle", style: { opacity: .2 } }), /*#__PURE__*/
    React.createElement("div", { className: "wrap", style: { position: "relative", zIndex: 1 } }, /*#__PURE__*/
    React.createElement(SectionHead, { eyebrow: "02 \u2014 Core Competencies", titleEn: "The Composite", titleKo: "AI \uC804\uB7B5\uAE30\uD68D\uC744 \uC911\uC2EC\uC5D0 \uB454 \uC5ED\uB7C9 \uAD6C\uC870" }), /*#__PURE__*/

    React.createElement("div", { className: "comp-thesis reveal" }, /*#__PURE__*/
    React.createElement("p", { className: "font-myeongjo" }, "\uC804\uB7B5\uC740 \uBB34\uC5C7\uC744 \uBA3C\uC800 \uD560\uC9C0 \uC815\uD558\uB294 \uC77C\uC774\uACE0, AI\uB294 \uADF8 \uACB0\uC815\uC744 \uBE68\uB9AC \uC2E4\uD589\uD558\uB294 \uB3C4\uAD6C\uC785\uB2C8\uB2E4."

    ), /*#__PURE__*/
    React.createElement("p", { className: "font-ko comp-thesis__sub" }, "\uC911\uC2EC\uCD95\uC740 ", /*#__PURE__*/
    React.createElement("strong", null, "AI \uC804\uB7B5\uAE30\uD68D \xB7 AI \uC790\uB3D9\uD654 \xB7 \uB370\uC774\uD130"), " \uC138 \uAC00\uC9C0\uC785\uB2C8\uB2E4. \uB9C8\uCF00\uD305\xB7\uAC15\uC758\xB7\uB3C4\uBA54\uC778 \uC9C0\uC2DD\uC740 \uADF8 \uD310\uB2E8\uC744 \uC815\uD655\uD558\uAC8C \uB9CC\uB4E4\uACE0 \uC870\uC9C1\uC5D0 \uC804\uB2EC\uD558\uB294 \uBCF4\uC870 \uC5ED\uB7C9\uC785\uB2C8\uB2E4."

    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "comp-stage" }, /*#__PURE__*/
    React.createElement("div", { className: "comp-stage__sticky" }, /*#__PURE__*/
    React.createElement(ConvergenceMap, { active: active, onPick: setActive }), /*#__PURE__*/
    React.createElement("div", { className: "cmap__cap" }, /*#__PURE__*/
    React.createElement("span", { className: "font-cond" }, DOMAINS[active].n), /*#__PURE__*/
    React.createElement("strong", { className: "font-ko" }, DOMAINS[active].ko), /*#__PURE__*/
    React.createElement("em", { className: "font-sans" }, DOMAINS[active].en)
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "comp-track" }, /*#__PURE__*/
    React.createElement("p", { className: "comp-group font-sans" }, "Core \u2014 \uD575\uC2EC \uC5ED\uB7C9"),
    DOMAINS.filter((d) => d.core).map((d) => {
      const i = DOMAINS.indexOf(d);
      return (/*#__PURE__*/
        React.createElement("article", {
          key: d.n,
          "data-i": i,
          id: "dom-" + d.n,
          ref: (el) => rows.current[i] = el,
          className: "comp-row comp-row--core" + (i === active ? " on" : ""),
          onMouseEnter: () => setActive(i) }, /*#__PURE__*/

        React.createElement("div", { className: "comp-row__head" }, /*#__PURE__*/
        React.createElement("span", { className: "comp-row__n font-cond" }, d.n), /*#__PURE__*/
        React.createElement("span", { className: "comp-row__rule" }), /*#__PURE__*/
        React.createElement("span", { className: "comp-row__en font-sans" }, d.en)
        ), /*#__PURE__*/
        React.createElement("h3", { className: "font-ko" }, d.ko), /*#__PURE__*/
        React.createElement("p", { className: "font-ko" }, d.desc), /*#__PURE__*/
        React.createElement("div", { className: "comp-row__tags font-ko" },
        d.tags.map((t) => /*#__PURE__*/React.createElement("span", { key: t }, t))
        )
        ));

    }), /*#__PURE__*/
    React.createElement("p", { className: "comp-group comp-group--sub font-sans" }, "Supporting \u2014 \uBCF4\uC870 \uC5ED\uB7C9 \xB7 \uB20C\uB7EC\uC11C \uBCF4\uAE30"),
    DOMAINS.filter((d) => !d.core).map((d) => {
      const i = DOMAINS.indexOf(d);
      return (/*#__PURE__*/
        React.createElement("details", {
          key: d.n,
          "data-i": i,
          id: "dom-" + d.n,
          ref: (el) => rows.current[i] = el,
          className: "comp-row comp-row--sub fold" + (i === active ? " on" : ""),
          onMouseEnter: () => setActive(i) }, /*#__PURE__*/

        React.createElement("summary", null, /*#__PURE__*/
        React.createElement("span", { className: "comp-row__n font-cond" }, d.n), /*#__PURE__*/
        React.createElement("span", { className: "fold__t" }, /*#__PURE__*/
        React.createElement("strong", { className: "font-ko" }, d.ko), /*#__PURE__*/
        React.createElement("em", { className: "font-sans" }, d.en)
        ), /*#__PURE__*/
        React.createElement("i", { className: "fold__icon", "aria-hidden": "true" })
        ), /*#__PURE__*/
        React.createElement("div", { className: "fold__body" }, /*#__PURE__*/
        React.createElement("p", { className: "font-ko" }, d.desc), /*#__PURE__*/
        React.createElement("div", { className: "comp-row__tags font-ko" },
        d.tags.map((t) => /*#__PURE__*/React.createElement("span", { key: t }, t))
        )
        )
        ));

    })
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "folds reveal" }, /*#__PURE__*/
    React.createElement("details", { className: "arsenal fold", id: "arsenal" }, /*#__PURE__*/
    React.createElement("summary", null, /*#__PURE__*/
    React.createElement("span", { className: "fold__t" }, /*#__PURE__*/
    React.createElement("span", { className: "eyebrow" }, "The Arsenal"), /*#__PURE__*/
    React.createElement("strong", { className: "font-ko" }, "\uC2E4\uBB34\uC5D0\uC11C \uB2E4\uB8E8\uB294 \uB3C4\uAD6C")
    ), /*#__PURE__*/
    React.createElement("i", { className: "fold__icon", "aria-hidden": "true" })
    ), /*#__PURE__*/
    React.createElement("div", { className: "fold__body" },
    ARSENAL.map(([label, tools]) => /*#__PURE__*/
    React.createElement("div", { key: label, className: "arsenal__row" }, /*#__PURE__*/
    React.createElement("span", { className: "arsenal__label font-ko" }, label), /*#__PURE__*/
    React.createElement("div", { className: "arsenal__chips font-sans" },
    tools.map((t) => /*#__PURE__*/React.createElement("span", { key: t }, t))
    )
    )
    )
    )
    ), /*#__PURE__*/

    React.createElement("details", { className: "creds fold", id: "credentials" }, /*#__PURE__*/
    React.createElement("summary", null, /*#__PURE__*/
    React.createElement("span", { className: "fold__t" }, /*#__PURE__*/
    React.createElement("span", { className: "eyebrow" }, "The Credentials"), /*#__PURE__*/
    React.createElement("strong", { className: "font-ko" }, "\uBCF4\uC720 \uC790\uACA9 ", /*#__PURE__*/React.createElement("em", null, CREDS.length, "\uAC74"))
    ), /*#__PURE__*/
    React.createElement("i", { className: "fold__icon", "aria-hidden": "true" })
    ), /*#__PURE__*/
    React.createElement("div", { className: "fold__body" }, /*#__PURE__*/
    React.createElement("div", { className: "creds__grid" },
    CREDS.map((c) => /*#__PURE__*/
    React.createElement("div", { key: c.name, id: "cred-" + c.name.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-"), className: "cred" }, /*#__PURE__*/
    React.createElement("span", { className: "cred__name font-serif" }, c.name), /*#__PURE__*/
    React.createElement("span", { className: "cred__ko font-ko" }, c.ko), /*#__PURE__*/
    React.createElement("span", { className: "cred__by font-sans" }, c.by)
    )
    )
    )
    )
    )
    )

    )
    ), /*#__PURE__*/

    React.createElement("section", { className: "whyc", ref: bandRef }, /*#__PURE__*/
    React.createElement("div", { className: "wrap" }, /*#__PURE__*/
    React.createElement("div", { className: "menu-rule reveal", style: { marginBottom: 26 } }, /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/
    React.createElement("p", { className: "eyebrow reveal" }, "Strategy Cases \u2014 \uAE30\uD68D \uD310\uB2E8\uC758 \uAE30\uB85D"), /*#__PURE__*/

    React.createElement("h2", { className: "whyc__lead font-myeongjo reveal" }, "\uB3C4\uAD6C\uB294 \uBE68\uB77C\uC84C\uC2B5\uB2C8\uB2E4.", /*#__PURE__*/
    React.createElement("br", null), /*#__PURE__*/
    React.createElement("em", null, "\uBB34\uC5C7\uC744 \uBA3C\uC800 \uD560\uC9C0\uB294 \uC5EC\uC804\uD788 \uC0AC\uB78C\uC774 \uC815\uD569\uB2C8\uB2E4.")
    ), /*#__PURE__*/

    React.createElement("p", { className: "whyc__intro font-ko reveal" }, "\uC9C1\uC811 \uB9CC\uB4E4\uC5B4 \uC6B4\uC601\uD55C \uC138 \uAC1C\uC758 \uC2DC\uC2A4\uD15C\uC5D0\uC11C \uAC19\uC740 \uC77C\uC774 \uBC18\uBCF5\uB410\uC2B5\uB2C8\uB2E4. \uC0AC\uB78C\uC774 \uD558\uB358 \uC77C\uC774 \uB3C4\uAD6C\uB85C \uB118\uC5B4\uAC14\uACE0, \uADF8\uB54C\uB9C8\uB2E4 \uC0AC\uB78C\uC774 \uB0A8\uC544\uC57C \uD560 \uC790\uB9AC\uAC00 \uD558\uB098\uC529 \uB610\uB837\uD574\uC84C\uC2B5\uB2C8\uB2E4. \uADF8 \uC790\uB9AC\uAC00 \uC804\uB7B5\uAE30\uD68D\uC785\uB2C8\uB2E4."


    ), /*#__PURE__*/

    React.createElement("div", { className: "wcases" },
    CASES.map((c, i) => /*#__PURE__*/
    React.createElement("article", { key: c.n, className: "wcase reveal", style: { transitionDelay: `${i * 80}ms` } }, /*#__PURE__*/
    React.createElement("div", { className: "wcase__head" }, /*#__PURE__*/
    React.createElement("span", { className: "wcase__n font-serif" }, "Case ", c.n), /*#__PURE__*/
    React.createElement("h3", { className: "wcase__t font-ko" }, c.title), /*#__PURE__*/
    React.createElement("span", { className: "wcase__tag font-sans" }, c.tag)
    ), /*#__PURE__*/
    React.createElement("div", { className: "wcase__flow" }, /*#__PURE__*/
    React.createElement("div", { className: "wcase__cell" }, /*#__PURE__*/
    React.createElement("span", { className: "wcase__lbl font-sans" }, "As-Is \xB7 \uAE30\uC874 \uBC29\uC2DD"), /*#__PURE__*/
    React.createElement("p", { className: "font-ko" }, c.manual)
    ), /*#__PURE__*/
    React.createElement("div", { className: "wcase__cell wcase__cell--auto" }, /*#__PURE__*/
    React.createElement("span", { className: "wcase__lbl font-sans" }, "To-Be \xB7 AI \uC801\uC6A9"), /*#__PURE__*/
    React.createElement("p", { className: "font-ko" }, c.auto)
    ), /*#__PURE__*/
    React.createElement("div", { className: "wcase__cell wcase__cell--judge" }, /*#__PURE__*/
    React.createElement("span", { className: "wcase__lbl font-sans" }, "Judgment \xB7 \uAE30\uD68D \uD310\uB2E8"), /*#__PURE__*/
    React.createElement("p", { className: "font-ko" }, c.judge)
    )
    )
    )
    )
    ), /*#__PURE__*/

    React.createElement("p", { className: "whyc__close font-myeongjo reveal" }, "\uC138 \uBC88 \uB2E4 \uC0AC\uB78C\uC774 \uD558\uB294 \uC77C\uC740 \uAC19\uC558\uC2B5\uB2C8\uB2E4 \u2014", /*#__PURE__*/
    React.createElement("br", null), /*#__PURE__*/
    React.createElement("em", null, "\uB3C4\uAD6C\uC5D0 \uBB34\uC5C7\uC744 \uC2DC\uD0AC\uC9C0 \uC815\uD558\uB294 \uC77C.")
    ), /*#__PURE__*/
    React.createElement("p", { className: "whyc__closesub font-ko reveal" }, "\uAE30\uC900\uC744 \uC138\uC6B0\uB294 \uC0AC\uB78C\uACFC \uADF8\uAC83\uC744 \uC2E4\uD589\uAE4C\uC9C0 \uC62E\uAE30\uB294 \uC0AC\uB78C\uC774 \uB2E4\uB974\uBA74 \uC18D\uB3C4\uAC00 \uC8FD\uC2B5\uB2C8\uB2E4. \uB458\uC744 \uD55C \uC0AC\uB78C\uC774 \uD558\uB3C4\uB85D \uC900\uBE44\uD574 \uC654\uC2B5\uB2C8\uB2E4."


    )
    )
    )
    ));

}

/* ============================================================ TRAJECTORY */
const TRAJECTORY = [
{ id: "tl-gyunggook", group: "work", year: "Now", tag: "PRESENT", color: "var(--sky)", title: "법무법인 경국 — 사원 (Staff)",
  desc: "송무·사무 실무를 담당하며 반복 업무를 진단하고, 급여명세서 자동 발송과 정비사업 용역비 자동 수집 프로그램을 기획·구현해 사내 운영에 적용." },
{ id: "tl-seocho", group: "public", year: "2026", color: "var(--apple)", title: "서초청년네트워크 9기 운영위원회 부위원장",
  desc: "서초구 청년 정책 거버넌스의 운영위원회 부위원장으로서 분과 의제 설정과 위원회 운영을 총괄하고, 현장의 목소리를 제도로 잇는 민관 협력을 주도." },
{ id: "tl-youth-day", group: "public", year: "2026", color: "var(--sky)", title: "청와대 대통령 주관 청년의날 행사 참석",
  desc: "대통령이 주관한 청년의날 기념행사에 청년 대표로 초청되어 참석. 청년 정책의 방향과 현장의 과제를 국정 최고 의사결정 단위에서 직접 청취하고 교류." },
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
{ id: "tl-army-startup", group: "honor", year: "2023", color: "var(--pink)", title: "육군창업경진대회 · 강원열린군대 창업프로그램 2군단장상 수상",
  desc: "軍·官·學 주관 2023 강원열린군대 스타트업 프로그램 성취도평가에서 팀 Home_Ally로 2위 입상(2023. 12. 31). HVAC 기술에 기반한 리스크 관리 아이디어를 제안하고, 비즈니스 모델의 타당성을 공식 심사에서 검증." },
{ id: "tl-army-training", group: "honor", year: "2023", color: "var(--sky)", title: "육군훈련소 최우수 분대 선정 · 훈련소장 상장 수상",
  desc: "기초군사훈련 과정에서 분대의 통솔과 임무 수행 성과를 인정받아 최우수 분대로 선정되었으며, 육군훈련소장(소장)의 상장을 수상." },
{ id: "tl-army-signal", group: "honor", year: "2022", color: "var(--lilac)", title: "육군정보통신학교장 상장 수상",
  desc: "軍 특성화고 현장실습 기간 중 희생정신과 학업성적 우수로 타의 모범이 되어 육군정보통신학교장(준장)으로부터 상장을 수상(2022. 7. 1, 제183호)." },
{ id: "tl-vattenfall", group: "public", year: "2022", color: "var(--butter)", title: "대구광역시교육청 · 독일 Vattenfall Berlin 해외 연수",
  desc: "독일 베를린에서 유럽 선진 기업의 에너지·인프라 운영 체계와 국제 실무 표준을 조기에 접한 경험." }];


/* 이력 그룹 — 핵심(실무·AI 교육)은 펼쳐 두고, 대외활동·수상은 눌러서 본다 */
const TRAJ_GROUPS = [
{ key: "work", en: "Professional", ko: "실무 경력", open: true },
{ key: "edu", en: "AI · Data Education", ko: "AI · 데이터 전문교육", open: true,
  order: ["tl-snu-aied", "tl-ssafy", "tl-krema", "tl-fintech", "tl-konkuk"] },
{ key: "public", en: "Leadership & Public", ko: "리더십 · 대외활동", open: false },
{ key: "honor", en: "Honors", ko: "수상 · 표창", open: false }];


function TlRows({ rows }) {
  return (/*#__PURE__*/
    React.createElement("div", { className: "tl-list" },
    rows.map((e) => /*#__PURE__*/
    React.createElement("div", { key: e.id, id: e.id, className: "tl-row" }, /*#__PURE__*/
    React.createElement("span", { className: "tl-year font-serif" }, e.year), /*#__PURE__*/
    React.createElement("div", { className: "tl-body" }, /*#__PURE__*/
    React.createElement("h3", { className: "font-ko" },
    e.title,
    e.tag && /*#__PURE__*/React.createElement("span", { className: "tl-tag font-sans" }, e.tag)
    ), /*#__PURE__*/
    React.createElement("p", { className: "font-ko" }, e.desc)
    )
    )
    )
    ));

}

function Trajectory() {
  const ref = useReveal();
  return (/*#__PURE__*/
    React.createElement("section", { id: "trajectory", ref: ref, style: { position: "relative", padding: "clamp(80px,12vw,150px) 0" } }, /*#__PURE__*/
    React.createElement("div", { className: "wrap" }, /*#__PURE__*/
    React.createElement(SectionHead, { eyebrow: "04 \u2014 Experience", titleEn: "The Trajectory", titleKo: "\uC774\uB825 \u2014 \uC2E4\uBB34\uC640 \uC804\uBB38\uAD50\uC721" }), /*#__PURE__*/

    React.createElement("figure", { className: "tl-feature reveal" }, /*#__PURE__*/
    React.createElement("a", { className: "tl-feature__main", href: "gallery.html#youth-day" }, /*#__PURE__*/
    React.createElement("img", { src: "images/youth-day-yonhap.jpg", srcSet: "images/youth-day-yonhap-600.jpg 600w, images/youth-day-yonhap.jpg 860w",
      sizes: "(max-width: 900px) 92vw, 52vw", alt: "\uAE40\uC720\uBE48 \uD65C\uB3D9 \uAE30\uB85D \u2014 2026 \uCCAD\uB144\uC758\uB0A0 \uAE30\uB150\uD589\uC0AC \uD604\uC7A5 (\uC5F0\uD569\uB274\uC2A4 \uBCF4\uB3C4\uC0AC\uC9C4)", loading: "lazy", width: "860", height: "592" })
    ), /*#__PURE__*/
    React.createElement("figcaption", { className: "tl-feature__body" }, /*#__PURE__*/
    React.createElement("p", { className: "eyebrow" }, "Highlight \u2014 2026"), /*#__PURE__*/
    React.createElement("h3", { className: "font-ko" }, "\uCCAD\uC640\uB300 \xB7 \uB300\uD1B5\uB839 \uC8FC\uAD00 2026 \uCCAD\uB144\uC758\uB0A0 \uAE30\uB150\uD589\uC0AC \uCC38\uC11D"), /*#__PURE__*/
    React.createElement("p", { className: "font-ko" }, "\uCCAD\uB144 \uB300\uD45C\uB85C \uCD08\uCCAD\uB418\uC5B4 \u20182026 \uCCAD\uB144\uC758 \uB0A0 \uC624\uD508\uB9C8\uC774\uD06C\u2019 \uD604\uC7A5\uC5D0 \uCC38\uC11D\uD588\uC2B5\uB2C8\uB2E4. \uCCAD\uB144 \uC815\uCC45\uC758 \uBC29\uD5A5\uACFC \uD604\uC7A5\uC758 \uACFC\uC81C\uB97C \uAD6D\uC815 \uCD5C\uACE0 \uC758\uC0AC\uACB0\uC815 \uB2E8\uC704\uC5D0\uC11C \uC9C1\uC811 \uB4E3\uACE0 \uAD50\uB958\uD55C \uAE30\uB85D\uC785\uB2C8\uB2E4."


    ), /*#__PURE__*/
    React.createElement("div", { className: "tl-feature__thumbs" }, /*#__PURE__*/
    React.createElement("a", { href: "gallery.html#g-youth-day-selfie" }, /*#__PURE__*/React.createElement("img", { src: "images/youth-day-selfie-600.jpg", alt: "\uAE40\uC720\uBE48 \uD65C\uB3D9 \uAE30\uB85D \u2014 2026 \uCCAD\uB144\uC758\uB0A0 \uAE30\uB150\uD589\uC0AC \uD604\uC7A5 \uC140\uD504 \uCD2C\uC601", loading: "lazy", width: "600", height: "450" })), /*#__PURE__*/
    React.createElement("a", { href: "gallery.html#g-youth-day-mbc-02" }, /*#__PURE__*/React.createElement("img", { src: "images/youth-day-mbc-02-600.jpg", alt: "\uAE40\uC720\uBE48 \uD65C\uB3D9 \uAE30\uB85D \u2014 2026 \uCCAD\uB144\uC758 \uB0A0 \uC624\uD508\uB9C8\uC774\uD06C \uC0DD\uC911\uACC4 \uD654\uBA74", loading: "lazy", width: "600", height: "338" }))
    ), /*#__PURE__*/
    React.createElement("p", { className: "tl-feature__credit font-sans" }, "\uC0AC\uC9C4 \u24D2\uC5F0\uD569\uB274\uC2A4 \xB7 \uBC29\uC1A1 \uD654\uBA74 \u24D2\uC804\uC8FCMBC"), /*#__PURE__*/
    React.createElement("a", { href: "gallery.html#youth-day", className: "btn btn--ghost" }, "\uD604\uC7A5 \uC0AC\uC9C4 \uC804\uCCB4 \uBCF4\uAE30 ", /*#__PURE__*/React.createElement(ArrowUpRight, { size: 14 }))
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "tl-groups" },
    TRAJ_GROUPS.map((g) => {
      const rows = g.order ?
      g.order.map((id) => TRAJECTORY.find((e) => e.id === id)) :
      TRAJECTORY.filter((e) => e.group === g.key);
      return (/*#__PURE__*/
        React.createElement("div", { key: g.key, className: "tl-group reveal" }, /*#__PURE__*/
        React.createElement("div", { className: "tl-group__label" }, /*#__PURE__*/
        React.createElement("p", { className: "eyebrow" }, g.en), /*#__PURE__*/
        React.createElement("h3", { className: "font-ko" }, g.ko)
        ),
        g.open ? /*#__PURE__*/React.createElement(TlRows, { rows: rows }) : /*#__PURE__*/
        React.createElement("details", { className: "fold tl-fold" }, /*#__PURE__*/
        React.createElement("summary", null, /*#__PURE__*/
        React.createElement("span", { className: "fold__t" }, /*#__PURE__*/
        React.createElement("strong", { className: "font-ko" }, rows.length, "\uAC74 \uD3BC\uCCD0 \uBCF4\uAE30"), /*#__PURE__*/
        React.createElement("span", { className: "fold__line font-ko" }, rows.slice(0, 3).map((e) => e.title.split(" ")[0]).join(" · "), " \uC678")
        ), /*#__PURE__*/
        React.createElement("i", { className: "fold__icon", "aria-hidden": "true" })
        ), /*#__PURE__*/
        React.createElement(TlRows, { rows: rows })
        )

        ));

    })
    )
    )
    ));

}

/* ============================================================ ARTIFACTS */
const EDITIONS = [
{ n: "09", color: "var(--sky)", Icon: Home, title: "청약·공공임대 맞춤 추천 서비스\n집캐치(ZipCatch)",
  desc: "청약홈 분양공고와 LH 임대공고를 공공데이터 API로 수집해, 지역·주거비·가구 조건을 3단계로 입력하면 지금 지원할 수 있는 후보를 정리해 주는 소비자 서비스. 관심공고 저장·마감 알림과 운영용 CRM(매칭·고객·물건 관리)까지 설계·구현.",
  status: "Vercel 배포 완료", cta: "서비스 바로가기", url: "https://zipcatch.vercel.app", tags: ["청약홈 · LH API", "맞춤 추천", "Supabase · CRM"],
  core: true, point: "자격·예산·선호 적합도·마감 긴급도를 한 점수로 섞지 않도록 분리 설계 — 미확인 자격은 불충족으로 단정하지 않고, 당첨 확률은 산출하지 않는다." },
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
  core: true, point: "시장 단가 비교와 사업성 검토에 바로 쓰이는 필드 구조로 데이터셋을 설계." }];


/* 화면에 보이는 순서와 번호 — 01 집캐치 · 02 VOC · 03 급여명세 · 04 누리장터, 이어서 아래 작업 */
const EDITION_ORDER = ["09", "06", "07", "08", "05", "01", "02", "03", "04"];
const EDITIONS_SHOWN = EDITION_ORDER.map((n, i) => ({ ...EDITIONS.find((e) => e.n === n), no: String(i + 1).padStart(2, "0") }));

function EditionCard({ e, i, onPlay }) {
  return (/*#__PURE__*/
    React.createElement("article", { id: "ed-" + e.n, className: "edition reveal" + (e.core ? " edition--core" : ""), style: { "--accent-fill": e.color, transitionDelay: `${i * 90}ms` } }, /*#__PURE__*/
    React.createElement("div", { className: "edition__chip" }, e.status), /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 } }, /*#__PURE__*/
    React.createElement("span", { className: "edition__num" }, e.no), /*#__PURE__*/
    React.createElement("span", { style: { width: 52, height: 52, borderRadius: 16, background: e.color, display: "grid", placeItems: "center", color: "var(--ink)" } }, /*#__PURE__*/
    React.createElement(e.Icon, { size: 24 })
    )
    ), /*#__PURE__*/
    React.createElement("span", { className: "edition__index-band" }), /*#__PURE__*/
    React.createElement("p", { className: "font-play", style: { fontSize: ".78rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-soft)", margin: "16px 0 6px" } }, "Edition ", e.no), /*#__PURE__*/
    React.createElement("h3", { className: "font-ko", style: { fontWeight: 800, fontSize: "clamp(1.3rem,2vw,1.55rem)", lineHeight: 1.28, margin: "0 0 14px", whiteSpace: "pre-line", letterSpacing: "-.01em" } }, e.title), /*#__PURE__*/
    React.createElement("p", { className: "font-ko", style: { color: "var(--ink-soft)", lineHeight: 1.72, fontSize: ".96rem", flexGrow: 1 } }, e.desc),
    e.point && /*#__PURE__*/React.createElement("p", { className: "edition__point font-ko" }, /*#__PURE__*/React.createElement("b", null, "\uAE30\uD68D \uD3EC\uC778\uD2B8"), e.point), /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 7, margin: "18px 0 22px" } },
    e.tags.map((t) => /*#__PURE__*/React.createElement("span", { key: t, className: "font-sans", style: { fontSize: ".72rem", fontWeight: 600, padding: ".32em .7em", borderRadius: 999, border: "1.5px solid var(--ink)", color: "var(--ink)" } }, t))
    ),
    e.video ? /*#__PURE__*/
    React.createElement("button", { type: "button", className: "btn", style: { alignSelf: "flex-start" }, onClick: () => onPlay(e) },
    e.cta, " ", /*#__PURE__*/React.createElement(PlayCircle, { size: 16 })
    ) :
    e.url ? /*#__PURE__*/
    React.createElement("a", { href: e.url, target: "_blank", rel: "noreferrer", className: "btn", style: { alignSelf: "flex-start" } },
    e.cta, " ", /*#__PURE__*/React.createElement(ExternalLink, { size: 16 })
    ) : /*#__PURE__*/

    React.createElement("span", { className: "btn btn--ghost", style: { alignSelf: "flex-start", cursor: "default", pointerEvents: "none" } }, e.cta)

    ));

}

function Artifacts() {
  const ref = useReveal();
  const [playing, setPlaying] = React.useState(null);
  React.useEffect(() => {
    if (!playing) return;
    const onKey = (ev) => {if (ev.key === "Escape") setPlaying(null);};
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {window.removeEventListener("keydown", onKey);document.body.style.overflow = "";};
  }, [playing]);
  return (/*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("section", { id: "artifacts", ref: ref, style: { position: "relative", padding: "clamp(80px,12vw,150px) 0", background: "var(--ecru-deep)" } }, /*#__PURE__*/
    React.createElement("div", { className: "wrap" }, /*#__PURE__*/
    React.createElement(SectionHead, { eyebrow: "03 \u2014 Selected Works", titleEn: "The Artifacts", titleKo: "AI \uC804\uB7B5 \xB7 \uC790\uB3D9\uD654 \uD504\uB85C\uC81D\uD2B8" }), /*#__PURE__*/
    React.createElement("p", { className: "works-lead font-ko reveal" }, "\uC9C1\uC811 \uBB38\uC81C\uB97C \uC815\uC758\uD558\uACE0 \uAD6C\uD604\uD574 ", /*#__PURE__*/
    React.createElement("strong", null, "\uBC30\uD3EC\uD558\uAC70\uB098 \uC0AC\uB0B4 \uC5C5\uBB34\uC5D0 \uC801\uC6A9\uD55C \uC2DC\uC2A4\uD15C 4\uAC74"), "\uC785\uB2C8\uB2E4. \uB370\uC774\uD130 \uB300\uC2DC\uBCF4\uB4DC\uC640 \uC0DD\uC131\uD615 AI \uCF58\uD150\uCE20 \uC791\uC5C5\uC740 \uC544\uB798\uC5D0\uC11C \uB530\uB85C \uD3BC\uCCD0 \uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4."

    ), /*#__PURE__*/
    React.createElement("div", { className: "works-grid" },
    EDITIONS_SHOWN.filter((e) => e.core).map((e, i) => /*#__PURE__*/
    React.createElement(EditionCard, { key: e.n, e: e, i: i, onPlay: setPlaying })
    )
    ), /*#__PURE__*/
    React.createElement("details", { className: "fold works-more reveal" }, /*#__PURE__*/
    React.createElement("summary", null, /*#__PURE__*/
    React.createElement("span", { className: "fold__t" }, /*#__PURE__*/
    React.createElement("span", { className: "eyebrow" }, "Supplementary"), /*#__PURE__*/
    React.createElement("strong", { className: "font-ko" }, "\uADF8 \uBC16\uC758 \uC791\uC5C5 ", /*#__PURE__*/React.createElement("em", null, EDITIONS.filter((e) => !e.core).length, "\uAC74")), /*#__PURE__*/
    React.createElement("span", { className: "fold__line font-ko" }, "\uCCAD\uC57D \uC778\uC0AC\uC774\uD2B8 \uB300\uC2DC\uBCF4\uB4DC \xB7 \uBE0C\uB79C\uB4DC \uD544\uB984 \xB7 \uCE74\uB4DC\uB274\uC2A4 \xB7 \uBA40\uD2F0\uBBF8\uB514\uC5B4 \uD504\uB85C\uBAA8\uC158")
    ), /*#__PURE__*/
    React.createElement("i", { className: "fold__icon", "aria-hidden": "true" })
    ), /*#__PURE__*/
    React.createElement("div", { className: "works-grid works-grid--sub" },
    EDITIONS_SHOWN.filter((e) => !e.core).map((e, i) => /*#__PURE__*/
    React.createElement(EditionCard, { key: e.n, e: e, i: i, onPlay: setPlaying })
    )
    )
    )
    )
    ),

    playing && /*#__PURE__*/
    React.createElement("div", { className: "vlightbox", onClick: () => setPlaying(null), role: "dialog", "aria-modal": "true" }, /*#__PURE__*/
    React.createElement("div", { className: "vlightbox__frame", onClick: (ev) => ev.stopPropagation() }, /*#__PURE__*/
    React.createElement("button", { type: "button", className: "vlightbox__close", onClick: () => setPlaying(null), "aria-label": "\uB2EB\uAE30" }, "\u2715"), /*#__PURE__*/
    React.createElement("div", { className: "vlightbox__meta" }, /*#__PURE__*/
    React.createElement("span", { className: "font-play" }, "Edition ", playing.no), /*#__PURE__*/
    React.createElement("h4", { className: "font-ko" }, playing.title.replace("\n", " · "))
    ), /*#__PURE__*/
    React.createElement("video", { className: "vlightbox__video", src: playing.video, controls: true, autoPlay: true, playsInline: true, preload: "metadata", controlsList: "nodownload" }, "\uBE0C\uB77C\uC6B0\uC800\uAC00 \uC601\uC0C1 \uC7AC\uC0DD\uC744 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."

    ),
    playing.url ? /*#__PURE__*/
    React.createElement("a", { className: "vlightbox__fallback font-sans", href: playing.url, target: "_blank", rel: "noreferrer" }, "\uC601\uC0C1\uC774 \uBCF4\uC774\uC9C0 \uC54A\uC73C\uBA74 \uC6D0\uBCF8 \uB9C1\uD06C\uB85C \uBCF4\uAE30 \u2192") :
    null
    )
    )

    ));

}

/* ============================================================ LECTURES */
function Lectures() {
  const ref = useReveal();
  return (/*#__PURE__*/
    React.createElement("section", { id: "lectures", ref: ref, className: "side-practice", style: { position: "relative", padding: "clamp(80px,12vw,150px) 0" } }, /*#__PURE__*/
    React.createElement("div", { className: "speckle", style: { opacity: .22 } }), /*#__PURE__*/
    React.createElement("div", { className: "wrap", style: { position: "relative", zIndex: 1 } }, /*#__PURE__*/
    React.createElement(SectionHead, { eyebrow: "Side Practice \u2014 Lectures", titleEn: "The Lectures", titleKo: "AI \uAC15\uC758 \uD504\uB85C\uADF8\uB7A8" }), /*#__PURE__*/

    React.createElement("div", { className: "side-note reveal" }, /*#__PURE__*/
    React.createElement("span", { className: "side-note__badge font-sans" }, "In Preparation"), /*#__PURE__*/
    React.createElement("p", { className: "font-ko" }, "\uBCF8\uC5C5\uC740 ", /*#__PURE__*/
    React.createElement("strong", null, "AI \uC804\uB7B5\uAE30\uD68D"), "\uC785\uB2C8\uB2E4. \uAC15\uC758\uB294 \uC2E4\uBB34\uC5D0\uC11C \uC9C1\uC811 \uB9CC\uB4E4\uACE0 \uC6B4\uC601\uD55C \uACBD\uD5D8\uC744 \uB098\uB204\uAE30 \uC704\uD574", /*#__PURE__*/
    React.createElement("strong", null, " \uBCC4\uB3C4\uB85C \uC124\uACC4\uD55C \uD504\uB85C\uADF8\uB7A8"), "\uC73C\uB85C, \uC544\uC9C1 \uCD9C\uAC15 \uC774\uB825\uC740 \uC5C6\uC2B5\uB2C8\uB2E4. \uCEE4\uB9AC\uD058\uB7FC\uACFC \uADFC\uAC70\uB97C \uBA3C\uC800 \uACF5\uAC1C\uD574 \uB450\uACE0, \uCCAB \uAC15\uC758\uAC00 \uC9C4\uD589\uB418\uBA74 \uC774\uB825\uC5D0 \uC5F0\uB3C4\uC640 \uD568\uAED8 \uCD94\uAC00\uD558\uACA0\uC2B5\uB2C8\uB2E4."

    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "lec-intro reveal" }, /*#__PURE__*/
    React.createElement("p", { className: "font-myeongjo" }, "\uB9CC\uB4E4\uC5B4 \uBCF8 \uC0AC\uB78C\uB9CC \uAC00\uB974\uCE60 \uC218 \uC788\uB294 \uAC83\uC774 \uC788\uC2B5\uB2C8\uB2E4."

    ), /*#__PURE__*/
    React.createElement("p", { className: "font-ko lec-intro__sub" }, "SSAFY 13\uAE30\uC758 \uC5D4\uC9C0\uB2C8\uC5B4\uB9C1 \uD6C8\uB828, \uC11C\uC6B8\uB300 AIED 4\uAE30\uC758 \uD504\uB86C\uD504\uD2B8 \uC544\uD0A4\uD14D\uCC98\uC640 \uAD50\uC218\uBC95, KREMA 4\uAE30\uC758 \uC2DC\uC7A5 \uB370\uC774\uD130 \uC804\uB7B5 \u2014 \uBC30\uC6B4 \uAC83\uC744 \uC2E4\uC81C\uB85C \uB9CC\uB4E4\uC5B4 \uC6B4\uC601\uD574 \uBCF8 \uB4A4\uC5D0 \uAC15\uC758 \uBAA8\uB4C8\uB85C \uC62E\uACBC\uC2B5\uB2C8\uB2E4. \uD604\uC7AC \uB450 \uD2B8\uB799, \uC5EC\uB35F \uACFC\uC815\uC758 \uCEE4\uB9AC\uD058\uB7FC\uC744 \uC124\uACC4\uD574 \uB450\uC5C8\uC2B5\uB2C8\uB2E4."



    )
    ),

    LECTURE_TRACKS.map((tr) => /*#__PURE__*/
    React.createElement("div", { key: tr.key, className: "lec-track" }, /*#__PURE__*/
    React.createElement("div", { className: "lec-track__head reveal" }, /*#__PURE__*/
    React.createElement("span", { className: "lec-track__label font-sans" }, tr.label), /*#__PURE__*/
    React.createElement("h3", { className: "font-ko" }, tr.ko), /*#__PURE__*/
    React.createElement("p", { className: "font-ko" }, tr.desc)
    ), /*#__PURE__*/
    React.createElement("details", { className: "fold lec-fold" }, /*#__PURE__*/
    React.createElement("summary", null, /*#__PURE__*/
    React.createElement("span", { className: "fold__t" }, /*#__PURE__*/
    React.createElement("strong", { className: "font-ko" }, "\uACFC\uC815 ", LECTURES.filter((l) => l.track === tr.key).length, "\uAC1C \uBCF4\uAE30"), /*#__PURE__*/
    React.createElement("span", { className: "fold__line font-ko" }, LECTURES.filter((l) => l.track === tr.key).map((l) => l.title.split(" — ")[0]).join(" · "))
    ), /*#__PURE__*/
    React.createElement("i", { className: "fold__icon", "aria-hidden": "true" })
    ), /*#__PURE__*/
    React.createElement("div", { className: "lec-grid" },
    LECTURES.filter((l) => l.track === tr.key).map((l, i) => /*#__PURE__*/
    React.createElement("article", { key: l.id, id: l.id, className: "lec-card reveal", style: { "--accent-fill": l.color, transitionDelay: `${i * 70}ms` } }, /*#__PURE__*/
    React.createElement("div", { className: "lec-card__head" }, /*#__PURE__*/
    React.createElement("span", { className: "lec-card__n font-cond" }, l.n), /*#__PURE__*/
    React.createElement("span", { className: "lec-card__icon", style: { background: l.color } }, /*#__PURE__*/React.createElement(l.Icon, { size: 20 }))
    ), /*#__PURE__*/
    React.createElement("h3", { className: "font-ko" }, l.title), /*#__PURE__*/
    React.createElement("p", { className: "lec-card__lead font-ko" }, l.lead), /*#__PURE__*/
    React.createElement("dl", { className: "lec-card__meta font-ko" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "\uB300\uC0C1"), /*#__PURE__*/React.createElement("dd", null, l.who)), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "\uAD6C\uC131"), /*#__PURE__*/React.createElement("dd", null, l.hours))
    ), /*#__PURE__*/
    React.createElement("ul", { className: "lec-card__mods font-ko" },
    l.modules.map((m) => /*#__PURE__*/React.createElement("li", { key: m }, m))
    ), /*#__PURE__*/
    React.createElement("p", { className: "lec-card__basis font-ko" }, /*#__PURE__*/React.createElement(GraduationCap, { size: 14 }), " ", l.basis), /*#__PURE__*/
    React.createElement("div", { className: "lec-card__links" }, /*#__PURE__*/
    React.createElement("a", { href: l.proof.href, className: "lec-card__proof font-sans" },
    l.proof.label, " ", /*#__PURE__*/React.createElement(ArrowUpRight, { size: 14 })
    ), /*#__PURE__*/
    React.createElement("a", { href: "lecture.html#" + l.id, className: "lec-card__proof font-sans" }, "\uACFC\uC815 \uC0C1\uC138 ", /*#__PURE__*/
    React.createElement(ArrowUpRight, { size: 14 })
    )
    )
    )
    )
    )
    )
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "lec-basis reveal" }, /*#__PURE__*/
    React.createElement("div", { className: "menu-rule", style: { marginBottom: 22 } }, /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/
    React.createElement("p", { className: "eyebrow", style: { color: "var(--ink-soft)", marginBottom: 22 } }, "\uBB34\uC5C7\uC744 \uADFC\uAC70\uB85C \uAC00\uB974\uCE58\uB294\uAC00"), /*#__PURE__*/
    React.createElement("div", { className: "lec-basis__grid" },
    LECTURE_BASIS.map(([t, d]) => /*#__PURE__*/
    React.createElement("div", { key: t, className: "lec-basis__item" }, /*#__PURE__*/
    React.createElement("strong", { className: "font-ko" }, t), /*#__PURE__*/
    React.createElement("span", { className: "font-ko" }, d)
    )
    )
    ), /*#__PURE__*/
    React.createElement("div", { style: { marginTop: 30, display: "flex", gap: 12, flexWrap: "wrap" } }, /*#__PURE__*/
    React.createElement("a", { href: "mailto:ybkim@gyunggook.com?subject=%5B%EA%B0%95%EC%9D%98%20%EB%AC%B8%EC%9D%98%5D", className: "btn btn--ghost" }, /*#__PURE__*/React.createElement(Mail, { size: 16 }), " \uAC15\uC758 \uAD00\uB828 \uBB38\uC758"), /*#__PURE__*/
    React.createElement("a", { href: "lecture.html", className: "btn btn--ghost" }, "\uACFC\uC815\uBCC4 \uC0C1\uC138 \uBCF4\uAE30 ", /*#__PURE__*/React.createElement(ArrowUpRight, { size: 15 })), /*#__PURE__*/
    React.createElement("a", { href: "career.html#lectures", className: "btn btn--ghost" }, "\uAC15\uC758 \uC5ED\uB7C9 \uC0C1\uC138 ", /*#__PURE__*/React.createElement(ArrowUpRight, { size: 15 }))
    )
    )
    )
    ));

}

/* ============================================================ ABOUT — 스크롤 스토리
 * 섹션이 화면에 고정된 동안 스크롤 진행도(0→1)에 따라 문장이 한 줄씩 켜지고,
 * 오른쪽 사진이 프로필 → 발표 → 인터뷰 순으로 바뀐다. 좁은 화면·모션 최소화 환경에서는 일반 배치. */
const STORY_LINES = ["판단의 근거를 만들고,", "실행까지 책임지는", "자리에서 일합니다."];
const STORY_SHOTS = [
{ src: "images/profile-yubin-450.jpg?v=1", srcSet: "images/profile-yubin-450.jpg?v=1 450w, images/profile-yubin.jpg?v=1 896w",
  alt: "김유빈 — 법무법인 경국 공식 프로필", chip: "Profile", cap: "김유빈 · Yubin Kim — 법무법인 경국" },
{ src: "images/ssafy-presentation-700.jpg", srcSet: "images/ssafy-presentation-500.jpg 500w, images/ssafy-presentation-700.jpg 700w, images/ssafy-presentation.jpg 1016w",
  alt: "김유빈 활동 기록 — 삼성청년SW아카데미(SSAFY) 13기 프로젝트 발표", chip: "SSAFY 13기", cap: "프로젝트 아키텍처 발표" },
{ src: "images/press-yonhap-700.jpg", srcSet: "images/press-yonhap-500.jpg 500w, images/press-yonhap-700.jpg 700w, images/press-yonhap.jpg 1600w",
  alt: "김유빈 연합뉴스TV 인터뷰 — 강남1인가구센터 취재", chip: "On Air", cap: "연합뉴스TV 인터뷰" }];


function About() {
  const ref = React.useRef(null);
  const [p, setP] = React.useState(0);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const span = r.height - window.innerHeight;
        setP(span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1);
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {window.removeEventListener("scroll", on);window.removeEventListener("resize", on);cancelAnimationFrame(raf);};
  }, []);
  const shot = Math.min(STORY_SHOTS.length - 1, Math.floor(p * STORY_SHOTS.length * 0.999));
  const lineOn = (i) => p >= 0.06 + i * 0.16;
  const bodyOn = p >= 0.5;

  return (/*#__PURE__*/
    React.createElement("section", { id: "about", ref: ref, className: "story", style: { "--p": p.toFixed(3) } }, /*#__PURE__*/
    React.createElement("div", { className: "story__sticky" }, /*#__PURE__*/
    React.createElement("div", { className: "wrap story__grid" }, /*#__PURE__*/
    React.createElement("div", { className: "story__copy" }, /*#__PURE__*/
    React.createElement("p", { className: "eyebrow" }, "01 \u2014 Profile"), /*#__PURE__*/
    React.createElement("h3", { className: "story__lead font-myeongjo" },
    STORY_LINES.map((l, i) => /*#__PURE__*/React.createElement("span", { key: l, className: "story__line" + (lineOn(i) ? " on" : "") }, l))
    ), /*#__PURE__*/
    React.createElement("div", { className: "story__body" + (bodyOn ? " on" : "") }, /*#__PURE__*/
    React.createElement("p", { className: "font-ko" }, "\uD769\uC5B4\uC9C4 \uC2DC\uC7A5\xB7\uC5C5\uBB34 \uB370\uC774\uD130\uB97C \uBAA8\uC544 \uBB34\uC5C7\uC744 \uBA3C\uC800 \uD560\uC9C0 \uC815\uD558\uACE0, \uADF8 \uACB0\uC815\uC744 \uC790\uB3D9\uD654\uC640 \uCF58\uD150\uCE20\uB85C \uC2E4\uD589\uC5D0 \uC62E\uAE41\uB2C8\uB2E4. \uBC95\uB960\uACFC \uB370\uC774\uD130\uB97C \uB300\uC911\uC774 \uC774\uD574\uD558\uB294 \uC5B8\uC5B4\uB85C \uC62E\uAE30\uB294 \uC77C\uB3C4 \uAC19\uC740 \uC790\uB9AC\uC5D0\uC11C \uD569\uB2C8\uB2E4."


    ), /*#__PURE__*/
    React.createElement("p", { className: "signature font-script", "aria-hidden": "true" }, "Yubin Kim"), /*#__PURE__*/
    React.createElement("p", { className: "story__addr font-ko" }, /*#__PURE__*/React.createElement(MapPin, { size: 15 }), " \uC11C\uC6B8 \uC11C\uCD08\uAD6C \uC11C\uCD08\uB300\uB85C 264 \uBC95\uC870\uD0C0\uC6CC 15F \u2014 \uBC95\uBB34\uBC95\uC778 \uACBD\uAD6D"), /*#__PURE__*/
    React.createElement("div", { className: "story__links" }, /*#__PURE__*/
    React.createElement("a", { href: "career.html", className: "btn" }, "\uACBD\uB825 \uC0C1\uC138 ", /*#__PURE__*/React.createElement(ArrowUpRight, { size: 15 })), /*#__PURE__*/
    React.createElement("a", { href: "gallery.html", className: "btn btn--ghost" }, "\uD65C\uB3D9 \uAC24\uB7EC\uB9AC ", /*#__PURE__*/React.createElement(ArrowUpRight, { size: 15 }))
    )
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "story__media" }, /*#__PURE__*/
    React.createElement("div", { className: "story__frame" },
    STORY_SHOTS.map((m, i) => /*#__PURE__*/
    React.createElement("img", { key: m.src, className: "story__img" + (i === shot ? " on" : ""), src: m.src, srcSet: m.srcSet,
      sizes: "(max-width: 900px) 80vw, 34vw", alt: m.alt, loading: "lazy" })
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "story__caps" },
    STORY_SHOTS.map((m, i) => /*#__PURE__*/
    React.createElement("p", { key: m.chip, className: "story__cap" + (i === shot ? " on" : "") }, /*#__PURE__*/
    React.createElement("span", { className: "font-sans" }, String(i + 1).padStart(2, "0"), " \xB7 ", m.chip), /*#__PURE__*/
    React.createElement("em", { className: "font-ko" }, m.cap)
    )
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "story__prog", "aria-hidden": "true" }, /*#__PURE__*/React.createElement("i", { style: { transform: `scaleX(${p.toFixed(3)})` } }))
    )
    )
    )
    ));

}

/* ============================================================ CONTACT + FOOTER */
function Contact() {
  const ref = useReveal();
  return (/*#__PURE__*/
    React.createElement("section", { id: "contact", ref: ref, style: { position: "relative", background: "var(--ink)", color: "var(--ecru)", padding: "clamp(40px,7vw,84px) 0 0", overflow: "hidden" } }, /*#__PURE__*/
    React.createElement("div", { className: "contact-photo", "aria-hidden": "true" }, /*#__PURE__*/React.createElement("img", { src: "images/footer-seoul-1000.jpg?v=2", srcSet: "images/footer-seoul-1000.jpg?v=2 1000w, images/footer-seoul.jpg?v=2 1920w", sizes: "100vw", alt: "", loading: "lazy" })), /*#__PURE__*/
    React.createElement("div", { className: "contact-photo__scrim", "aria-hidden": "true" }), /*#__PURE__*/
    React.createElement("div", { className: "seal", "aria-hidden": "true" }, /*#__PURE__*/
    React.createElement("svg", { viewBox: "0 0 120 120" }, /*#__PURE__*/
    React.createElement("defs", null, /*#__PURE__*/
    React.createElement("path", { id: "sealArc", d: "M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0", fill: "none" })
    ), /*#__PURE__*/
    React.createElement("circle", { cx: "60", cy: "60", r: "57", fill: "none", stroke: "currentColor", strokeWidth: "1.3" }), /*#__PURE__*/
    React.createElement("circle", { cx: "60", cy: "60", r: "32", fill: "none", stroke: "currentColor", strokeWidth: "0.9" }), /*#__PURE__*/
    React.createElement("text", { fontSize: "9.2", letterSpacing: "2.2", fill: "currentColor", fontFamily: "Inter, Pretendard, sans-serif", fontWeight: "600" }, /*#__PURE__*/
    React.createElement("textPath", { href: "#sealArc" }, "AI STRATEGY \xB7 PLANNING \xB7 SEOUL \xB7 YUBIN KIM \xB7")
    ), /*#__PURE__*/
    React.createElement("text", { x: "60", y: "68.5", textAnchor: "middle", fontFamily: "Cormorant Garamond, serif", fontWeight: "600", fontSize: "26", fill: "currentColor" }, "YK")
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "wrap reveal", style: { position: "relative", zIndex: 2, textAlign: "center", paddingBottom: "clamp(70px,10vw,120px)" } }, /*#__PURE__*/
    React.createElement("p", { className: "signature signature--light font-script", "aria-hidden": "true" }, "Yubin Kim"), /*#__PURE__*/
    React.createElement("p", { className: "eyebrow contact-eyebrow" }, "Inquiries \u2014 \uCC44\uC6A9 \uBC0F \uD611\uC5C5 \uC81C\uC548"), /*#__PURE__*/
    React.createElement("h2", { className: "font-serif contact-title" }, "Let\u2019s define", /*#__PURE__*/
    React.createElement("br", null), /*#__PURE__*/React.createElement("em", null, "the next problem.")
    ), /*#__PURE__*/
    React.createElement("p", { className: "font-ko", style: { color: "rgba(249,246,240,.7)", maxWidth: 560, margin: "26px auto 40px", lineHeight: 1.7, fontSize: "1.05rem" } }, "AI \uC804\uB7B5\uAE30\uD68D \xB7 \uC5C5\uBB34 \uC790\uB3D9\uD654 \xB7 \uB370\uC774\uD130 \uAE30\uBC18 \uC11C\uBE44\uC2A4 \uAE30\uD68D \uD3EC\uC9C0\uC158\uC758 \uC81C\uC548\uC744 \uAE30\uB2E4\uB9BD\uB2C8\uB2E4.", /*#__PURE__*/
    React.createElement("br", null), "\uC774\uBA54\uC77C\uB85C \uC5F0\uB77D \uC8FC\uC2DC\uBA74 \uC131\uC2E4\uD788 \uD68C\uC2E0\uB4DC\uB9AC\uACA0\uC2B5\uB2C8\uB2E4."
    ), /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" } }, /*#__PURE__*/
    React.createElement("a", { href: "mailto:ybkim@gyunggook.com", className: "btn", style: { background: "var(--ecru)", color: "var(--ink)", borderColor: "var(--ecru)" } }, /*#__PURE__*/
    React.createElement(Mail, { size: 16 }), " \uC774\uBA54\uC77C \uBCF4\uB0B4\uAE30"
    ), /*#__PURE__*/
    React.createElement("a", { href: "career.html", className: "btn btn--ghost", style: { color: "var(--ecru)", borderColor: "var(--ecru)", boxShadow: "none" } }, "\uACBD\uB825 \uC0C1\uC138 ", /*#__PURE__*/
    React.createElement(ArrowUpRight, { size: 14 })
    ), /*#__PURE__*/
    React.createElement("button", { type: "button", id: "copyMail", className: "btn btn--ghost", style: { color: "var(--ecru)", borderColor: "var(--ecru)", boxShadow: "none" } }, "\uC774\uBA54\uC77C \uC8FC\uC18C \uBCF5\uC0AC"

    )
    )
    ), /*#__PURE__*/
    React.createElement(Footer, null)
    ));

}

function Footer() {
  return (/*#__PURE__*/
    React.createElement("footer", { style: { borderTop: "1px solid rgba(249,246,240,.18)", position: "relative", zIndex: 2 } }, /*#__PURE__*/
    React.createElement("div", { className: "wrap f-links font-sans", style: { display: "flex", flexWrap: "wrap", gap: "10px 26px", padding: "22px 0 0" } },
    [["소개", "#about"], ["역량", "#composite"], ["프로젝트", "#artifacts"], ["이력", "#trajectory"], ["강의", "#lectures"], ["갤러리", "gallery.html"], ["경력 상세", "career.html"]].map(([t, h]) => /*#__PURE__*/
    React.createElement("a", { key: t, href: h }, t)
    ), /*#__PURE__*/
    React.createElement("a", { href: "https://github.com/yubinxe", rel: "me noopener", target: "_blank" }, "GitHub"), /*#__PURE__*/
    React.createElement("a", { href: "mailto:ybkim@gyunggook.com", style: { marginLeft: "auto" } }, "ybkim@gyunggook.com")
    ), /*#__PURE__*/
    React.createElement("div", { className: "wrap footer-grid", style: { padding: "26px 0" } }, /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, justifySelf: "start" }, className: "font-serif" }, /*#__PURE__*/
    React.createElement("span", { style: { fontWeight: 900, fontSize: 22 } }, "YK"), /*#__PURE__*/
    React.createElement("span", { className: "font-ko", style: { fontSize: ".82rem", color: "rgba(249,246,240,.6)", fontFamily: '"Pretendard", sans-serif', fontWeight: 400 } }, "\uAE40\uC720\uBE48 \xB7 Yubin Kim \u2014 AI Strategy & Planning")
    ), /*#__PURE__*/
    React.createElement("div", { className: "font-sans", style: { fontSize: ".78rem", color: "rgba(249,246,240,.5)", justifySelf: "center", textAlign: "center" } }, "\xA9 2026 Yubin Kim. All rights reserved."), /*#__PURE__*/
    React.createElement("a", { href: "#top", className: "font-sans", style: { fontSize: ".8rem", color: "var(--ecru)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, justifySelf: "end" } }, "\uB9E8 \uC704\uB85C ", /*#__PURE__*/
    React.createElement("span", { style: { display: "inline-block", transform: "rotate(-45deg)" } }, /*#__PURE__*/React.createElement(ArrowUpRight, { size: 15 }))
    )
    )
    ));

}

/* ---------- shared section header ---------- */
/* 'The Composite' → 관사만 가는 이탤릭으로 — 클래식 표제의 리듬 */
function splitTitle(t) {
  const m = /^(The|At a)\s+(.+)$/.exec(t);
  return m ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("em", { className: "sh-art" }, m[1]), m[2]) : t;
}
function SectionHead({ eyebrow, titleEn, titleKo }) {
  return (/*#__PURE__*/
    React.createElement("div", { className: "reveal" }, /*#__PURE__*/
    React.createElement("div", { className: "menu-rule", style: { marginBottom: 26 } }, /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/
    React.createElement("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 } }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("p", { className: "eyebrow", style: { color: "var(--ink-soft)", marginBottom: 14 } }, eyebrow), /*#__PURE__*/
    React.createElement("h2", { className: "font-serif", style: { fontWeight: 900, fontSize: "clamp(2.4rem,6vw,5rem)", lineHeight: .95, letterSpacing: "-.03em", margin: 0 } }, splitTitle(titleEn))
    ), /*#__PURE__*/
    React.createElement("p", { className: "font-ko", style: { fontWeight: 600, fontSize: "clamp(1rem,1.6vw,1.2rem)", color: "var(--ink-soft)", whiteSpace: "nowrap", flexShrink: 0, paddingBottom: ".4em" } }, titleKo)
    )
    ));

}

Object.assign(window, { Nav, Hero, Marquee, Composite, Ledger, Trajectory, Artifacts, EditionCard, Lectures, About, Contact, Footer, SectionHead });
