/* 자동 생성 파일 — 수정하지 마세요. 원본: trial-brief.jsx · 갱신: npm run build */
/* trial-brief.jsx — Gyunggook Trial Brief · 기일 전 1페이지 사건 브리핑 (개인 구현 시제품)
 * 데이터: trial-brief-data.js(가상 사건 3건) · 규칙: trial-brief-domain.js(순수 함수) · 상태: 이 탭의 sessionStorage 에만.
 * AI 모델을 부르지 않는다 — 추출 · 검수는 규칙 기반, 쟁점 정리는 담당자 입력. 외부 전송 · 업로드 없음.
 * 화면 둘: A 사건 준비 작업화면(등록 → 추출 → 검수 → 쟁점 · 증거 → 기일 준비 → 검토 · 승인) · B 1페이지 브리핑(A4 인쇄 · PDF) */
const D = window.TB_DATA,T = window.TB;
const KEY = "tb.state.v1";
const STEPS = [
["docs", "문서 등록", "Documents"], ["facts", "정보 추출 · 구조화", "Extraction"], ["qa", "정합성 검수", "Document QA"],
["issues", "쟁점 · 증거 연결", "Issues & Evidence"], ["prep", "기일 준비", "Hearing Prep"], ["review", "검토 · 승인", "Review"]];

const FLOW = ["사건 선택", "자료 확인", "불일치 탐지", "담당자 검토", "1페이지 브리핑", "PDF 출력"];
const WD = ["일", "월", "화", "수", "목", "금", "토"];
const wday = (d) => WD[new Date(d + "T00:00:00Z").getUTCDay()];
const MARK = { confirmed: ["●", "담당자 확정"], auto: ["◇", "자동 추출 · 미확정"], check: ["▲", "확인 필요"] };
const EVST = { submitted: "제출", unsubmitted: "미제출", missing: "누락" };

function load() {
  try {const s = JSON.parse(sessionStorage.getItem(KEY) || "null");if (s && s.v === 1) return Object.assign(T.initial(), s);} catch (e) {}
  return T.initial();
}
function readHash() {
  const h = new URLSearchParams((location.hash || "").replace(/^#/, ""));
  const c = D.cases.some((x) => x.id === h.get("case")) ? h.get("case") : D.cases[0].id;
  return { c, view: h.get("view") === "brief" ? "brief" : "work", step: STEPS.some((s) => s[0] === h.get("step")) ? h.get("step") : "docs" };
}
const docOf = (c, st, id) => T.docsOf(c, st).find((d) => d.id === id);
const Mark = ({ s }) => /*#__PURE__*/React.createElement("span", { className: "tb-mk tb-mk--" + s, title: MARK[s][1] }, /*#__PURE__*/React.createElement("i", { "aria-hidden": "true" }, MARK[s][0]), MARK[s][1]);
const Sev = ({ s }) => /*#__PURE__*/React.createElement("span", { className: "tb-sev tb-sev--" + s }, s === "high" ? "중요" : "보통");

function App() {
  const [st, setSt] = React.useState(load);
  const [nav, setNav] = React.useState(readHash);
  const [role, setRole] = React.useState(() => {try {return sessionStorage.getItem("tb.role") || "staff";} catch (e) {return "staff";}});
  const [q, setQ] = React.useState("");
  const [src, setSrc] = React.useState(null); /* { doc, page, para } — 원문 보기 */
  const c = D.cases.find((x) => x.id === nav.c);
  React.useEffect(() => {try {sessionStorage.setItem(KEY, JSON.stringify(st));} catch (e) {}}, [st]);
  React.useEffect(() => {try {sessionStorage.setItem("tb.role", role);} catch (e) {}}, [role]);
  React.useEffect(() => {const u = "#case=" + nav.c + "&view=" + nav.view + (nav.view === "work" ? "&step=" + nav.step : "");if (location.hash !== u) history.replaceState(null, "", u);}, [nav]);
  React.useEffect(() => {const on = () => setNav(readHash());addEventListener("hashchange", on);return () => removeEventListener("hashchange", on);}, []);
  const act = (a) => setSt((s) => T.reduce(s, Object.assign({ role, case: c.id }, a), new Date().toISOString()));
  const approve = () => setSt((s) => T.approve(c, s, role, new Date().toISOString(), c.lawyer));
  const go = (o) => setNav((n) => Object.assign({}, n, o));
  const list = D.cases.filter((x) => !q.trim() || (x.no + x.title + x.type + x.parties.map((p) => p.name).join("")).includes(q.trim()));
  const status = T.status(c, st),open = T.open(c, st);
  const flowAt = status === "approved" ? 5 : status === "review" ? 4 : open.length < T.qa(c, st).length ? 3 : T.registered(c, st).length ? 2 : 1;
  const can = (x) => T.can(role, x);
  return (/*#__PURE__*/
    React.createElement("div", { className: "tb" }, /*#__PURE__*/
    React.createElement("header", { className: "tb-top" }, /*#__PURE__*/
    React.createElement("a", { className: "tb-back", href: "index.html#trial-brief" }, "\u2190 \uAE40\uC720\uBE48 \uD3EC\uD2B8\uD3F4\uB9AC\uC624 \xB7 \uACBD\uAD6D AX"), /*#__PURE__*/
    React.createElement("p", { className: "tb-brand" }, /*#__PURE__*/React.createElement("b", { lang: "en" }, "Gyunggook Trial Brief"), /*#__PURE__*/React.createElement("span", null, "\uAE30\uC77C \uC804 1\uD398\uC774\uC9C0 \uC0AC\uAC74 \uBE0C\uB9AC\uD551")), /*#__PURE__*/
    React.createElement("label", { className: "tb-role" }, "\uC5ED\uD560(\uC2DC\uC5F0)", /*#__PURE__*/
    React.createElement("select", { value: role, onChange: (e) => setRole(e.target.value) }, T.ROLES.map((r) => /*#__PURE__*/React.createElement("option", { key: r.key, value: r.key }, r.ko)))
    )
    ), /*#__PURE__*/
    React.createElement("p", { className: "tb-notice", role: "note" }, D.notice, " ", /*#__PURE__*/React.createElement("b", null, "\uC2E4\uC81C \uC0AC\uAC74\uC790\uB8CC \xB7 \uAC1C\uC778\uC815\uBCF4\uB97C \uC785\uB825\uD558\uC9C0 \uB9C8\uC2ED\uC2DC\uC624.")), /*#__PURE__*/

    React.createElement("section", { className: "tb-hero", "aria-labelledby": "tb-h1" }, /*#__PURE__*/
    React.createElement("p", { className: "tb-k" }, "\uBC95\uB960 AX \xB7 \uC5C5\uBB34\uD601\uC2E0 \xB7 \uC81C\uD488\uAE30\uD68D \u2014 \uAC1C\uC778 \uAD6C\uD604 \uC2DC\uC81C\uD488"), /*#__PURE__*/
    React.createElement("h1", { id: "tb-h1" }, "\uC7AC\uD310 \uC9C1\uC804, \uC0AC\uAC74\uC758 \uD575\uC2EC\uC744 \uD55C \uC7A5\uC73C\uB85C."), /*#__PURE__*/
    React.createElement("p", { className: "tb-q" }, /*#__PURE__*/React.createElement("b", null, "\uC124\uACC4 \uC9C8\uBB38"), " \uBCC0\uD638\uC0AC\uAC00 \uC7AC\uD310\uC5D0 \uB4E4\uC5B4\uAC00\uAE30 \uC9C1\uC804 60\uCD08 \uB3D9\uC548 \uD655\uC778\uD574\uC57C \uD560 \uC815\uBCF4\uB294 \uBB34\uC5C7\uC778\uAC00? ", /*#__PURE__*/React.createElement("small", null, "60\uCD08\uB294 \uC124\uACC4 \uBAA9\uD45C\uC774\uBA70, \uCE21\uC815\uD55C \uACB0\uACFC\uAC00 \uC544\uB2D9\uB2C8\uB2E4.")), /*#__PURE__*/
    React.createElement("p", { className: "tb-jump" }, /*#__PURE__*/React.createElement("a", { href: "#tb-case" }, "\uD504\uB85C\uC81D\uD2B8 \uAC1C\uC694 \u2014 \uBB38\uC81C \uC815\uC758\uBD80\uD130 \uD655\uC7A5 \uAC00\uB2A5\uC131\uAE4C\uC9C0 \u2193")), /*#__PURE__*/
    React.createElement("ol", { className: "tb-flow", "aria-label": "\uC0AC\uC6A9 \uD750\uB984" }, FLOW.map((t, i) => /*#__PURE__*/React.createElement("li", { key: t, className: i < flowAt ? "is-done" : i === flowAt ? "is-now" : "" }, /*#__PURE__*/React.createElement("b", null, i + 1), t)))
    ), /*#__PURE__*/

    React.createElement("section", { className: "tb-cases", "aria-label": "\uC0AC\uAC74 \uC120\uD0DD" }, /*#__PURE__*/
    React.createElement("label", { className: "tb-search" }, /*#__PURE__*/React.createElement("span", null, "\uC0AC\uAC74 \uAC80\uC0C9"), /*#__PURE__*/React.createElement("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "\uC0AC\uAC74\uBC88\uD638 \xB7 \uC0AC\uAC74\uBA85 \xB7 \uB2F9\uC0AC\uC790" })), /*#__PURE__*/
    React.createElement("ul", null,
    list.length ? list.map((x) => {
      const s = T.status(x, st);
      return (/*#__PURE__*/
        React.createElement("li", { key: x.id }, /*#__PURE__*/React.createElement("button", { type: "button", "aria-pressed": x.id === c.id, onClick: () => {go({ c: x.id, step: "docs" });setSrc(null);} }, /*#__PURE__*/
        React.createElement("small", null, x.no, " \xB7 ", x.type), /*#__PURE__*/React.createElement("b", null, x.title), /*#__PURE__*/
        React.createElement("span", null, T.ko(x.hearing.date), "(", wday(x.hearing.date), ") ", x.hearing.time, " \xB7 ", x.hearing.kind), /*#__PURE__*/
        React.createElement("i", { className: "tb-st tb-st--" + s }, T.BRIEF[s])
        )));

    }) : /*#__PURE__*/React.createElement("li", { className: "tb-empty" }, "\uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.")
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "tb-views", role: "tablist", "aria-label": "\uD654\uBA74 \uC804\uD658" }, /*#__PURE__*/
    React.createElement("button", { type: "button", role: "tab", "aria-selected": nav.view === "work", onClick: () => go({ view: "work" }) }, "A \xB7 \uC0AC\uAC74 \uC900\uBE44 \uC791\uC5C5\uD654\uBA74"), /*#__PURE__*/
    React.createElement("button", { type: "button", role: "tab", "aria-selected": nav.view === "brief", onClick: () => go({ view: "brief" }) }, "B \xB7 1\uD398\uC774\uC9C0 \uBE0C\uB9AC\uD551"), /*#__PURE__*/
    React.createElement("span", { className: "tb-st tb-st--" + status }, T.BRIEF[status]),
    !can("confirm") && /*#__PURE__*/React.createElement("span", { className: "tb-ro" }, "\uC5F4\uB78C\uC790 \u2014 \uC77D\uAE30 \uC804\uC6A9")
    ), /*#__PURE__*/

    React.createElement("main", { id: "tb-main", className: "tb-main tb-main--" + nav.view },
    nav.view === "work" ? /*#__PURE__*/
    React.createElement(Work, { c: c, st: st, act: act, approve: approve, can: can, step: nav.step, setStep: (s) => go({ step: s }), openSrc: setSrc, toBrief: () => go({ view: "brief" }) }) : /*#__PURE__*/
    React.createElement(Brief, { c: c, st: st, openSrc: setSrc }),
    src && /*#__PURE__*/React.createElement(SrcView, { c: c, st: st, src: src, close: () => setSrc(null) })
    ), /*#__PURE__*/

    React.createElement("details", { className: "tb-audit" }, /*#__PURE__*/
    React.createElement("summary", null, "\uAC10\uC0AC\uAE30\uB85D \u2014 ", st.audit.filter((a) => a.case === c.id).length, "\uAC74 (\uC774 \uD0ED\uC5D0\uB9CC \uC800\uC7A5)"), /*#__PURE__*/
    React.createElement("ol", null, st.audit.filter((a) => a.case === c.id).slice(0, 40).map((a, i) => /*#__PURE__*/React.createElement("li", { key: i }, /*#__PURE__*/React.createElement("time", null, T.kst(a.t)), /*#__PURE__*/React.createElement("b", null, (T.ROLES.find((r) => r.key === a.role) || {}).ko), a.text))), /*#__PURE__*/
    React.createElement("button", { type: "button", className: "tb-btn tb-btn--ghost", onClick: () => {if (confirm("이 탭의 시연 상태와 기록을 지울까요?")) {try {sessionStorage.removeItem(KEY);} catch (e) {}setSt(T.initial());}} }, "\uC2DC\uC5F0 \uCD08\uAE30\uD654")
    ), /*#__PURE__*/
    React.createElement(CaseStudy, null), /*#__PURE__*/
    React.createElement("footer", { className: "tb-foot" }, /*#__PURE__*/
    React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "\uCC98\uB9AC \uBC29\uC2DD"), " \uB0A0\uC9DC \xB7 \uAE08\uC561 \xB7 \uB2F9\uC0AC\uC790 \xB7 \uC99D\uAC70\uBC88\uD638 \uCD94\uCD9C\uACFC \uC815\uD569\uC131 \uAC80\uC218\uB294 ", /*#__PURE__*/React.createElement("b", null, "\uADDC\uCE59 \uAE30\uBC18"), "\uC785\uB2C8\uB2E4. \uC7C1\uC810 \uC694\uC9C0 \xB7 \uAE30\uC77C \uC900\uBE44\uC0AC\uD56D\uC740 \uB2F4\uB2F9\uC790\uAC00 \uC785\uB825 \xB7 \uD655\uC815\uD569\uB2C8\uB2E4. AI \uBAA8\uB378 \uD638\uCD9C \xB7 \uC678\uBD80 \uC804\uC1A1 \xB7 \uD30C\uC77C \uC5C5\uB85C\uB4DC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."), /*#__PURE__*/
    React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "\uD558\uC9C0 \uC54A\uB294 \uC77C"), " \uD310\uACB0 \uC608\uCE21 \xB7 \uBC95\uB960 \uACB0\uB860 \uD655\uC815. \uCD9C\uCC98\uAC00 \uC5C6\uB294 \uB0B4\uC6A9\uC740 \uD655\uC815\uC73C\uB85C \uD45C\uC2DC\uD558\uC9C0 \uC54A\uACE0, \uC2B9\uC778 \uB4A4 \uC790\uB8CC\uAC00 \uBC14\uB00C\uBA74 \uB2E4\uC2DC \uAC80\uD1A0\uD558\uB3C4\uB85D \uB418\uB3CC\uB9BD\uB2C8\uB2E4."), /*#__PURE__*/
    React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "\uD655\uC7A5 \uC124\uACC4"), " \uACF5\uD1B5 \uAD6C\uC870 + \uC0AC\uAC74 \uC720\uD615\uBCC4 \uD15C\uD50C\uB9BF \u2014 \uBBFC\uC0AC(\uAD6C\uD604) \xB7 \uD589\uC815 \xB7 \uAC00\uC0AC \xB7 \uD615\uC0AC(\uBBF8\uAD6C\uD604, \uC6A9\uC5B4 \xB7 \uCE78\uC744 \uB530\uB85C \uC815\uC758).")
    )
    ));

}

/* ================================================================ A — 사건 준비 작업화면 */
function Work({ c, st, act, approve, can, step, setStep, openSrc, toBrief }) {
  const Q = T.qa(c, st),open = Q.filter((x) => !T.resolved(c, st, x.id));
  const count = { docs: T.registered(c, st).length, facts: T.facts(c, st).length, qa: open.length, issues: c.issues.filter((i) => T.itemState(c, st, "issue/" + i.id, true) !== "confirmed").length, prep: T.actions(c, st).filter((a) => !a.done).length };
  return (/*#__PURE__*/
    React.createElement("div", { className: "tb-work" }, /*#__PURE__*/
    React.createElement("nav", { className: "tb-steps", "aria-label": "\uC791\uC5C5 \uB2E8\uACC4" }, /*#__PURE__*/
    React.createElement("ol", null, STEPS.map(([k, ko, en], i) => /*#__PURE__*/
    React.createElement("li", { key: k }, /*#__PURE__*/React.createElement("button", { type: "button", "aria-current": step === k ? "step" : undefined, onClick: () => setStep(k) }, /*#__PURE__*/
    React.createElement("b", null, i + 1), /*#__PURE__*/React.createElement("span", null, ko, /*#__PURE__*/React.createElement("em", { lang: "en" }, en)), count[k] != null && /*#__PURE__*/React.createElement("i", null, k === "qa" ? "미확인 " : k === "issues" ? "미확정 " : k === "prep" ? "남은 " : "", count[k])
    ))
    ))
    ), /*#__PURE__*/
    React.createElement("section", { className: "tb-panel", "aria-live": "polite" },
    step === "docs" && /*#__PURE__*/React.createElement(Docs, { c: c, st: st, act: act, can: can, openSrc: openSrc }),
    step === "facts" && /*#__PURE__*/React.createElement(Facts, { c: c, st: st, act: act, can: can, openSrc: openSrc }),
    step === "qa" && /*#__PURE__*/React.createElement(QA, { c: c, st: st, act: act, can: can, openSrc: openSrc, Q: Q }),
    step === "issues" && /*#__PURE__*/React.createElement(Issues, { c: c, st: st, act: act, can: can }),
    step === "prep" && /*#__PURE__*/React.createElement(Prep, { c: c, st: st, act: act, can: can }),
    step === "review" && /*#__PURE__*/React.createElement(Review, { c: c, st: st, act: act, approve: approve, can: can, toBrief: toBrief }), /*#__PURE__*/
    React.createElement("p", { className: "tb-next" }, STEPS.findIndex((s) => s[0] === step) < 5 ? /*#__PURE__*/
    React.createElement("button", { type: "button", className: "tb-btn tb-btn--ghost", onClick: () => setStep(STEPS[STEPS.findIndex((s) => s[0] === step) + 1][0]) }, "\uB2E4\uC74C \uB2E8\uACC4 \u2192 ", STEPS[STEPS.findIndex((s) => s[0] === step) + 1][1]) : /*#__PURE__*/
    React.createElement("button", { type: "button", className: "tb-btn", onClick: toBrief }, "1\uD398\uC774\uC9C0 \uBE0C\uB9AC\uD551 \uBCF4\uAE30 \u2192"))
    )
    ));

}

function Docs({ c, st, act, can, openSrc }) {
  const [t, setT] = React.useState(""),[x, setX] = React.useState("");
  const extra = st.extra && st.extra[c.id] || [];
  return (/*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h2", null, "1 \xB7 \uBB38\uC11C \uB4F1\uB85D ", /*#__PURE__*/React.createElement("small", null, "\uB4F1\uB85D\uD55C \uC11C\uBA74\uB9CC \uCD94\uCD9C \xB7 \uAC80\uC218 \xB7 \uBE0C\uB9AC\uD551\uC5D0 \uB4E4\uC5B4\uAC11\uB2C8\uB2E4")), /*#__PURE__*/
    React.createElement("table", { className: "tb-tbl" }, /*#__PURE__*/
    React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "\uB4F1\uB85D"), /*#__PURE__*/React.createElement("th", null, "\uC885\uB958"), /*#__PURE__*/React.createElement("th", null, "\uBB38\uC11C"), /*#__PURE__*/React.createElement("th", null, "\uC791\uC131\uC77C"), /*#__PURE__*/React.createElement("th", null, "\uC81C\uCD9C"), /*#__PURE__*/React.createElement("th", null, "\uC6D0\uBB38"))), /*#__PURE__*/
    React.createElement("tbody", null,
    c.documents.map((d) => {
      const on = T.isReg(c, st, d.id);
      return (/*#__PURE__*/
        React.createElement("tr", { key: d.id, className: d.pending && !on ? "is-pending" : "" }, /*#__PURE__*/
        React.createElement("td", null, /*#__PURE__*/React.createElement("input", { type: "checkbox", checked: on, disabled: !can("register"), onChange: (e) => act({ type: "register", doc: d.id, value: e.target.checked, label: d.title }), "aria-label": d.title + " 등록" })), /*#__PURE__*/
        React.createElement("td", null, d.kind), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, d.id), " ", d.title, d.pending && !on && /*#__PURE__*/React.createElement("em", { className: "tb-new" }, "\uAE30\uC77C \uC9C1\uC804 \uB3C4\uCC29 \xB7 \uBBF8\uB4F1\uB85D")), /*#__PURE__*/
        React.createElement("td", null, T.ko(d.date)), /*#__PURE__*/React.createElement("td", null, d.by), /*#__PURE__*/
        React.createElement("td", null, /*#__PURE__*/React.createElement("button", { type: "button", className: "tb-link", onClick: () => openSrc({ doc: d.id, page: 1, para: 0 }) }, "\uBCF4\uAE30"))
        ));

    }),
    extra.map((d) => /*#__PURE__*/React.createElement("tr", { key: d.id }, /*#__PURE__*/React.createElement("td", null, "\u2713"), /*#__PURE__*/React.createElement("td", null, d.kind), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, d.id), " ", d.title), /*#__PURE__*/React.createElement("td", null, T.ko(d.date)), /*#__PURE__*/React.createElement("td", null, d.by), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("button", { type: "button", className: "tb-link", onClick: () => openSrc({ doc: d.id, page: 1, para: 0 }) }, "\uBCF4\uAE30"))))
    )
    ), /*#__PURE__*/
    React.createElement("form", { className: "tb-add", onSubmit: (e) => {e.preventDefault();if (x.trim()) {act({ type: "addDoc", title: t || "시연 입력 문서", text: x, date: c.now.slice(0, 10) });setT("");setX("");}} }, /*#__PURE__*/
    React.createElement("p", { className: "tb-h" }, "\uC2DC\uC5F0 \uBB38\uC11C \uC9C1\uC811 \uC785\uB825 ", /*#__PURE__*/React.createElement("span", null, "\uC774 \uBE0C\uB77C\uC6B0\uC800 \uC548\uC5D0\uC11C\uB9CC \uCC98\uB9AC\uB429\uB2C8\uB2E4 \u2014 \uC2E4\uC81C \uC0AC\uAC74\uC790\uB8CC\uB97C \uC785\uB825\uD558\uC9C0 \uB9C8\uC2ED\uC2DC\uC624")), /*#__PURE__*/
    React.createElement("input", { value: t, onChange: (e) => setT(e.target.value), placeholder: "\uBB38\uC11C \uC81C\uBAA9(\uC608: \uC6D0\uACE0 \uC900\uBE44\uC11C\uBA74(2))", maxLength: 60, disabled: !can("register"), "aria-label": "\uBB38\uC11C \uC81C\uBAA9" }), /*#__PURE__*/
    React.createElement("textarea", { value: x, onChange: (e) => setX(e.target.value), rows: 3, maxLength: 4000, disabled: !can("register"), "aria-label": "\uBB38\uC11C \uBCF8\uBB38",
      placeholder: "예) 원고: " + c.parties[0].name + "\n수리비는 금 29,000,000원이다. 갑 제6호증을 제출한다." }), /*#__PURE__*/
    React.createElement("button", { type: "submit", className: "tb-btn", disabled: !can("register") || !x.trim() }, "\uBB38\uC11C \uCD94\uAC00 \xB7 \uB2E4\uC2DC \uAC80\uC218")
    )
    ));

}

function Cite({ s, openSrc }) {
  if (!s) return /*#__PURE__*/React.createElement("span", { className: "tb-cite tb-cite--none" }, "\uCD9C\uCC98 \uC5C6\uC74C");
  return /*#__PURE__*/React.createElement("button", { type: "button", className: "tb-cite", onClick: () => openSrc(s), "aria-label": `원문 보기 ${s.doc} ${s.page}쪽 ${s.para}문단` }, s.doc, " \xB7 ", s.page, "-", s.para);
}

function Facts({ c, st, act, can, openSrc }) {
  const F = T.facts(c, st),KO = { date: "날짜", amount: "금액", party: "당사자", evidence: "증거번호" };
  return (/*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h2", null, "2 \xB7 \uC815\uBCF4 \uCD94\uCD9C \xB7 \uAD6C\uC870\uD654 ", /*#__PURE__*/React.createElement("small", null, "\uADDC\uCE59 \uAE30\uBC18 \u2014 \uC6D0\uBB38\uC5D0 \uC788\uB294 \uBB38\uC7A5 \uC870\uAC01\uB9CC \uBF51\uACE0 \uC704\uCE58\uB97C \uB0A8\uAE41\uB2C8\uB2E4")), /*#__PURE__*/
    React.createElement("p", { className: "tb-h" }, "\uBE0C\uB9AC\uD551\uC5D0 \uB4E4\uC5B4\uAC08 \uC8FC\uC694 \uC0AC\uC2E4 ", /*#__PURE__*/React.createElement("span", null, "\uB2F4\uB2F9\uC790\uAC00 \uD655\uC815\uD574\uC57C \u2018\uD655\uC815\u2019\uC73C\uB85C \uD45C\uC2DC\uB429\uB2C8\uB2E4")), /*#__PURE__*/
    React.createElement("ul", { className: "tb-kf" }, c.keyFacts.map((k, i) => {
      const s = T.itemState(c, st, "fact/" + i, !!k.src);
      return (/*#__PURE__*/
        React.createElement("li", { key: i }, /*#__PURE__*/React.createElement(Mark, { s: s }), /*#__PURE__*/React.createElement("span", null, k.text), /*#__PURE__*/React.createElement(Cite, { s: k.src, openSrc: openSrc }),
        s !== "confirmed" ? /*#__PURE__*/
        React.createElement("button", { type: "button", className: "tb-btn tb-btn--sm", disabled: !can("confirm") || !k.src, onClick: () => act({ type: "confirm", key: "fact/" + i, label: k.text }) }, "\uD655\uC815") : /*#__PURE__*/
        React.createElement("button", { type: "button", className: "tb-btn tb-btn--sm tb-btn--ghost", disabled: !can("confirm"), onClick: () => act({ type: "unconfirm", key: "fact/" + i, label: k.text }) }, "\uD655\uC815 \uD574\uC81C")
        ));

    })), /*#__PURE__*/
    React.createElement("p", { className: "tb-h" }, "\uC790\uB3D9 \uCD94\uCD9C \uACB0\uACFC ", F.length, "\uAC74 ", /*#__PURE__*/React.createElement("span", null, "\uBAA8\uB450 \u2018\uC790\uB3D9 \uCD94\uCD9C \xB7 \uBBF8\uD655\uC815\u2019 \u2014 \uD310\uB2E8\uC740 \uAC80\uC218 \xB7 \uAC80\uD1A0 \uB2E8\uACC4\uC5D0\uC11C")), /*#__PURE__*/
    React.createElement("div", { className: "tb-scroll" }, /*#__PURE__*/React.createElement("table", { className: "tb-tbl" }, /*#__PURE__*/
    React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "\uAD6C\uBD84"), /*#__PURE__*/React.createElement("th", null, "\uC774\uB984\uD45C"), /*#__PURE__*/React.createElement("th", null, "\uAC12"), /*#__PURE__*/React.createElement("th", null, "\uC6D0\uBB38 \uC870\uAC01"), /*#__PURE__*/React.createElement("th", null, "\uCD9C\uCC98"))), /*#__PURE__*/
    React.createElement("tbody", null, F.map((f) => /*#__PURE__*/
    React.createElement("tr", { key: f.id }, /*#__PURE__*/React.createElement("td", null, KO[f.kind]), /*#__PURE__*/React.createElement("td", null, f.label), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, f.kind === "date" ? T.ko(f.value) : f.kind === "amount" ? T.won(f.value) : f.value)), /*#__PURE__*/React.createElement("td", { className: "tb-frag" }, f.text), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Cite, { s: f.src, openSrc: openSrc })))
    ))
    ))
    ));

}

function QA({ c, st, act, can, openSrc, Q }) {
  const [note, setNote] = React.useState({});
  const sorted = Q.slice().sort((a, b) => a.sev === b.sev ? 0 : a.sev === "high" ? -1 : 1);
  return (/*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h2", null, "3 \xB7 \uC815\uD569\uC131 \uAC80\uC218 ", /*#__PURE__*/React.createElement("small", { lang: "en" }, "Gyunggook Legal Document QA")), /*#__PURE__*/
    React.createElement("p", { className: "tb-rules" }, "\uADDC\uCE59 R1 \uB0A0\uC9DC \uBD88\uC77C\uCE58 \xB7 R2 \uAE08\uC561 \uBD88\uC77C\uCE58 \xB7 R3 \uB2F9\uC0AC\uC790 \uD45C\uC2DC \xB7 R4 \uC99D\uAC70 \uB204\uB77D \xB7 R5 \uC99D\uAC70 \uBBF8\uC81C\uCD9C \xB7 R6 \uADFC\uAC70 \uBBF8\uC5F0\uACB0 \xB7 R7 \uAE30\uD55C \xB7 R8 \uC2B9\uC778 \uD6C4 \uBCC0\uACBD. \u2018\uBD88\uC77C\uCE58\u2019\uB294 \uC5B4\uB290 \uCABD\uC774 \uC633\uC740\uC9C0 \uC815\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4 \u2014 \uC8FC\uC7A5 \uCC28\uC774\uC778\uC9C0 \uAE30\uC7AC \uC624\uB958\uC778\uC9C0\uB294 \uB2F4\uB2F9\uC790\uAC00 \uD655\uC778\uD569\uB2C8\uB2E4."),
    sorted.length === 0 && /*#__PURE__*/React.createElement("p", { className: "tb-empty" }, "\uAC80\uC218 \uD56D\uBAA9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."), /*#__PURE__*/
    React.createElement("ul", { className: "tb-qa" }, sorted.map((f) => {
      const r = T.resolved(c, st, f.id);
      return (/*#__PURE__*/
        React.createElement("li", { key: f.id, className: r ? "is-ok" : "is-open is-" + f.sev }, /*#__PURE__*/
        React.createElement("p", { className: "tb-qa__t" }, /*#__PURE__*/React.createElement(Sev, { s: f.sev }), /*#__PURE__*/React.createElement("code", null, f.rule), /*#__PURE__*/React.createElement("b", null, f.title)),
        f.values.length > 0 && /*#__PURE__*/React.createElement("ul", { className: "tb-qa__v" }, f.values.map((v, i) => /*#__PURE__*/React.createElement("li", { key: i }, /*#__PURE__*/React.createElement("b", null, v.show), /*#__PURE__*/React.createElement(Cite, { s: v.src, openSrc: openSrc }), /*#__PURE__*/React.createElement("span", null, docOf(c, st, v.src.doc) ? docOf(c, st, v.src.doc).title : "", " \xB7 ", T.ko(v.docDate)), v.latest && /*#__PURE__*/React.createElement("em", null, "\uCD5C\uC2E0 \uC11C\uBA74 \uAE30\uC900(\uD655\uC815 \uC544\uB2D8)")))),
        f.expect && /*#__PURE__*/React.createElement("p", { className: "tb-muted" }, "\uB2F9\uC0AC\uC790 \uBAA9\uB85D: ", f.expect),
        r ? /*#__PURE__*/
        React.createElement("p", { className: "tb-qa__r" }, "\uD655\uC778 \uCC98\uB9AC \u2014 ", r.note, " ", /*#__PURE__*/React.createElement("button", { type: "button", className: "tb-link", disabled: !can("resolve"), onClick: () => act({ type: "unresolve", id: f.id, label: f.label }) }, "\uCDE8\uC18C")) : /*#__PURE__*/

        React.createElement("form", { className: "tb-qa__f", onSubmit: (e) => {e.preventDefault();act({ type: "resolve", id: f.id, label: f.label, note: note[f.id] || "" });} }, /*#__PURE__*/
        React.createElement("input", { value: note[f.id] || "", onChange: (e) => setNote(Object.assign({}, note, { [f.id]: e.target.value })), placeholder: "\uD655\uC778 \uB0B4\uC6A9(4\uC790 \uC774\uC0C1) \u2014 \uC608: \uB2F5\uBCC0\uC11C \uAE30\uC7AC \uC624\uAE30\uB85C \uD655\uC778", disabled: !can("resolve"), "aria-label": f.title + " 확인 메모" }), /*#__PURE__*/
        React.createElement("button", { type: "submit", className: "tb-btn tb-btn--sm", disabled: !can("resolve") || (note[f.id] || "").trim().length < 4 }, "\uD655\uC778 \uCC98\uB9AC")
        )

        ));

    }))
    ));

}

function Issues({ c, st, act, can }) {
  const B = T.brief(c, st);
  return (/*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h2", null, "4 \xB7 \uC7C1\uC810 \xB7 \uC99D\uAC70 \uC5F0\uACB0 ", /*#__PURE__*/React.createElement("small", null, "\uD575\uC2EC \uC7C1\uC810 3\uAC1C \uC774\uB0B4 \xB7 \uC8FC\uC7A5\uB9C8\uB2E4 \uADFC\uAC70 \uC99D\uAC70\uB97C \uC787\uC2B5\uB2C8\uB2E4")),
    c.issues.map((i) => {
      const s = T.itemState(c, st, "issue/" + i.id, true);
      return (/*#__PURE__*/
        React.createElement("article", { key: i.id, className: "tb-iss" }, /*#__PURE__*/
        React.createElement("header", null, /*#__PURE__*/React.createElement("b", null, i.id), /*#__PURE__*/React.createElement("h3", null, i.title), /*#__PURE__*/React.createElement(Mark, { s: s }),
        s !== "confirmed" ? /*#__PURE__*/
        React.createElement("button", { type: "button", className: "tb-btn tb-btn--sm", disabled: !can("confirm"), onClick: () => act({ type: "confirm", key: "issue/" + i.id, label: i.title }) }, "\uC7C1\uC810 \uD655\uC815") : /*#__PURE__*/
        React.createElement("button", { type: "button", className: "tb-btn tb-btn--sm tb-btn--ghost", disabled: !can("confirm"), onClick: () => act({ type: "unconfirm", key: "issue/" + i.id, label: i.title }) }, "\uD655\uC815 \uD574\uC81C")
        ), /*#__PURE__*/
        React.createElement("div", { className: "tb-iss__g" },
        [["plaintiff", "원고"], ["defendant", "피고"]].map(([side, ko]) => {
          const L = T.linksOf(c, st, i.id, side);
          return (/*#__PURE__*/
            React.createElement("div", { key: side }, /*#__PURE__*/React.createElement("p", { className: "tb-h" }, ko, " \uC8FC\uC7A5"), /*#__PURE__*/React.createElement("p", null, i[side].text), /*#__PURE__*/
            React.createElement("fieldset", null, /*#__PURE__*/React.createElement("legend", null, "\uADFC\uAC70 \uC99D\uAC70"), c.evidence.map((e) => /*#__PURE__*/
            React.createElement("label", { key: e.no }, /*#__PURE__*/React.createElement("input", { type: "checkbox", disabled: !can("link"), checked: L.includes(e.no), onChange: (ev) => act({ type: "link", issue: i.id, side, label: i.id + " " + ko, value: ev.target.checked ? L.concat(e.no) : L.filter((x) => x !== e.no) }) }), e.label, /*#__PURE__*/React.createElement("small", null, EVST[e.status]))
            )),
            !L.length && /*#__PURE__*/React.createElement("p", { className: "tb-warn" }, "\u25B2 \uC5F0\uACB0\uB41C \uC99D\uAC70 \uC5C6\uC74C \u2014 \uBE0C\uB9AC\uD551\uC5D0 \u2018\uADFC\uAC70 \uBBF8\uC5F0\uACB0\u2019\uB85C \uD45C\uC2DC")
            ));

        })
        ),
        i.unknown && i.unknown.length > 0 && /*#__PURE__*/React.createElement("p", { className: "tb-unk" }, /*#__PURE__*/React.createElement("b", null, "\uD655\uC778\uB418\uC9C0 \uC54A\uC740 \uC0AC\uC2E4"), i.unknown.join(" · "))
        ));

    }), /*#__PURE__*/
    React.createElement("p", { className: "tb-h" }, "\uC99D\uAC70 \uBAA9\uB85D"), /*#__PURE__*/
    React.createElement("div", { className: "tb-scroll" }, /*#__PURE__*/React.createElement("table", { className: "tb-tbl" }, /*#__PURE__*/
    React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "\uBC88\uD638"), /*#__PURE__*/React.createElement("th", null, "\uD45C\uBAA9"), /*#__PURE__*/React.createElement("th", null, "\uC785\uC99D\uCDE8\uC9C0"), /*#__PURE__*/React.createElement("th", null, "\uC0C1\uD0DC"))), /*#__PURE__*/
    React.createElement("tbody", null, B.evidence.map((e) => /*#__PURE__*/React.createElement("tr", { key: e.no, className: e.status !== "submitted" ? "is-warn" : "" }, /*#__PURE__*/React.createElement("td", null, e.label), /*#__PURE__*/React.createElement("td", null, e.title || "—"), /*#__PURE__*/React.createElement("td", null, e.purpose), /*#__PURE__*/React.createElement("td", null, EVST[e.status]))))
    ))
    ));

}

function Prep({ c, st, act, can }) {
  const H = c.hearing,A = T.actions(c, st),hs = T.itemState(c, st, "hearing", true);
  const [t, setT] = React.useState(""),[due, setDue] = React.useState(H.date),[own, setOwn] = React.useState(c.lawyer);
  return (/*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h2", null, "5 \xB7 \uAE30\uC77C \uC900\uBE44 ", /*#__PURE__*/React.createElement("small", null, "\uAE30\uC900 \uC2DC\uAC01 ", T.kst(c.now), " (\uC2DC\uC5F0\uC6A9 \uACE0\uC815)")), /*#__PURE__*/
    React.createElement("div", { className: "tb-hear" }, /*#__PURE__*/
    React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, T.ko(H.date), "(", wday(H.date), ") ", H.time), " ", H.room, " \xB7 ", H.kind), /*#__PURE__*/React.createElement(Mark, { s: hs }),
    hs !== "confirmed" ? /*#__PURE__*/React.createElement("button", { type: "button", className: "tb-btn tb-btn--sm", disabled: !can("confirm"), onClick: () => act({ type: "confirm", key: "hearing", label: "기일 정보" }) }, "\uAE30\uC77C \uC815\uBCF4 \uD655\uC815") : /*#__PURE__*/
    React.createElement("button", { type: "button", className: "tb-btn tb-btn--sm tb-btn--ghost", disabled: !can("confirm"), onClick: () => act({ type: "unconfirm", key: "hearing", label: "기일 정보" }) }, "\uD655\uC815 \uD574\uC81C"), /*#__PURE__*/
    React.createElement("p", { className: "tb-muted" }, "\uAE30\uC77C \xB7 \uBC95\uC815\uC740 \uBC95\uC6D0 \uC0AC\uAC74 \uC9C4\uD589 \uC815\uBCF4\uC640 \uB300\uC870\uD55C \uB4A4 \uD655\uC815\uD569\uB2C8\uB2E4(\uC2DC\uC5F0\uC5D0\uC11C\uB294 \uB300\uC870 \uD654\uBA74 \uC5C6\uC74C).")
    ), /*#__PURE__*/
    React.createElement("div", { className: "tb-two" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("p", { className: "tb-h" }, "\uCD5C\uADFC \uC9C4\uD589 \uACBD\uACFC"), /*#__PURE__*/
    React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "\uC9C1\uC804 \uAE30\uC77C"), " ", c.recent.last), /*#__PURE__*/
    React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "\uCD5C\uADFC \uC11C\uBA74"), " ", c.recent.filings.map((f) => T.ko(f.date) + " " + f.title).join(" · ")), /*#__PURE__*/
    React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "\uC7AC\uD310\uBD80 \uBA85\uB839 \xB7 \uC11D\uBA85")), /*#__PURE__*/React.createElement("ul", null, c.recent.orders.map((o) => /*#__PURE__*/React.createElement("li", { key: o }, o)))
    ), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("p", { className: "tb-h" }, "\uAE30\uC77C \uC804 \uD560 \uC77C ", /*#__PURE__*/React.createElement("span", null, "\uC644\uB8CC\uD558\uBA74 \uAE30\uD55C \uC704\uD5D8\uC5D0\uC11C \uBE60\uC9D1\uB2C8\uB2E4")), /*#__PURE__*/
    React.createElement("ul", { className: "tb-todo" }, A.map((a) => {
      const left = T.days(c.now, a.due);
      return (/*#__PURE__*/
        React.createElement("li", { key: a.id, className: a.done ? "is-done" : left < 0 ? "is-late" : left <= 2 ? "is-soon" : "" }, /*#__PURE__*/
        React.createElement("label", null, /*#__PURE__*/React.createElement("input", { type: "checkbox", checked: !!a.done, disabled: !can("action"), onChange: (e) => act({ type: "action", id: a.id, label: a.text, patch: { done: e.target.checked } }) }), /*#__PURE__*/
        React.createElement("span", null, a.text, /*#__PURE__*/React.createElement("small", null, a.kind, " \xB7 ", a.owner, " \xB7 ", T.ko(a.due), " ", a.done ? "완료" : left < 0 ? "기한 경과" : "D-" + left)))
        ));

    })), /*#__PURE__*/
    React.createElement("form", { className: "tb-add tb-add--row", onSubmit: (e) => {e.preventDefault();if (t.trim()) {act({ type: "addAction", text: t, due, owner: own });setT("");}} }, /*#__PURE__*/
    React.createElement("input", { value: t, onChange: (e) => setT(e.target.value), placeholder: "\uD560 \uC77C \uCD94\uAC00", disabled: !can("action"), "aria-label": "\uD560 \uC77C", maxLength: 80 }), /*#__PURE__*/
    React.createElement("input", { type: "date", value: due, onChange: (e) => setDue(e.target.value), disabled: !can("action"), "aria-label": "\uAE30\uD55C" }), /*#__PURE__*/
    React.createElement("input", { value: own, onChange: (e) => setOwn(e.target.value), disabled: !can("action"), "aria-label": "\uB2F4\uB2F9", maxLength: 30 }), /*#__PURE__*/
    React.createElement("button", { type: "submit", className: "tb-btn tb-btn--sm", disabled: !can("action") || !t.trim() }, "\uCD94\uAC00")
    )
    )
    )
    ));

}

function Review({ c, st, act, approve, can, toBrief }) {
  const G = T.gates(c, st),ok = G.every((g) => g.ok),s = T.status(c, st),ap = st.approval[c.id];
  return (/*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h2", null, "6 \xB7 \uAC80\uD1A0 \xB7 \uC2B9\uC778 ", /*#__PURE__*/React.createElement("small", null, "\uC2B9\uC778\uC740 \uB2F4\uB2F9 \uBCC0\uD638\uC0AC\uB9CC \xB7 \uC2B9\uC778 \uB4A4 \uC11C\uBA74\uC774 \uBC14\uB00C\uBA74 \u2018\uC7AC\uAC80\uD1A0 \uD544\uC694\u2019")), /*#__PURE__*/
    React.createElement("p", { className: "tb-big tb-st tb-st--" + s }, T.BRIEF[s], ap && " — " + ap.by + " · " + T.kst(ap.at)), /*#__PURE__*/
    React.createElement("ul", { className: "tb-gates" }, G.map((g) => /*#__PURE__*/React.createElement("li", { key: g.k, className: g.ok ? "is-ok" : "" }, /*#__PURE__*/React.createElement("i", { "aria-hidden": "true" }, g.ok ? "✓" : "○"), g.ko))), /*#__PURE__*/
    React.createElement("div", { className: "tb-acts" }, /*#__PURE__*/
    React.createElement("button", { type: "button", className: "tb-btn tb-btn--ghost", disabled: !can("request") || s !== "draft", onClick: () => act({ type: "request" }) }, "\uBCC0\uD638\uC0AC \uAC80\uD1A0 \uC694\uCCAD"), /*#__PURE__*/
    React.createElement("button", { type: "button", className: "tb-btn", disabled: !can("approve") || !ok || s === "approved", onClick: approve }, s === "stale" ? "다시 검토하고 승인" : "브리핑 승인"),
    ap && /*#__PURE__*/React.createElement("button", { type: "button", className: "tb-btn tb-btn--ghost", disabled: !can("revoke"), onClick: () => act({ type: "revoke" }) }, "\uC2B9\uC778 \uCDE8\uC18C"), /*#__PURE__*/
    React.createElement("button", { type: "button", className: "tb-btn tb-btn--ghost", onClick: toBrief }, "\uBE0C\uB9AC\uD551 \uBCF4\uAE30 \u2192")
    ),
    !can("approve") && /*#__PURE__*/React.createElement("p", { className: "tb-muted" }, "\uD604\uC7AC \uC5ED\uD560\uB85C\uB294 \uC2B9\uC778\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC704 \u2018\uC5ED\uD560(\uC2DC\uC5F0)\u2019\uC5D0\uC11C \uB2F4\uB2F9 \uBCC0\uD638\uC0AC\uB97C \uACE0\uB974\uBA74 \uC2B9\uC778 \uBC84\uD2BC\uC774 \uC5F4\uB9BD\uB2C8\uB2E4."),
    s === "stale" && /*#__PURE__*/React.createElement("p", { className: "tb-warn" }, "\u25B2 \uC2B9\uC778 \uB4A4 \uC0C8 \uC11C\uBA74\uC774 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4. 3\uB2E8\uACC4\uC5D0\uC11C \u2018R8 \uC2B9\uC778 \uD6C4 \uBCC0\uACBD\u2019 \uD56D\uBAA9\uC744 \uD655\uC778 \uCC98\uB9AC\uD55C \uB4A4 \uB2E4\uC2DC \uC2B9\uC778\uD558\uC138\uC694.")
    ));

}

/* ================================================================ B — 1페이지 브리핑 (A4) */
function Brief({ c, st, openSrc }) {
  const B = T.brief(c, st),H = B.head.hearing,TP = D.templates[c.template];
  const risks = B.risks.slice().sort((a, b) => a.sev === b.sev ? 0 : a.sev === "high" ? -1 : 1);
  const shown = risks.slice(0, 6),todo = B.todo.filter((a) => !a.done);
  const docs = (id) => (docOf(c, st, id) || {}).title || id;
  const ev = (list) => list.length ? list.map((n) => (c.evidence.find((e) => e.no === n) || {}).label || n).join(", ") : /*#__PURE__*/React.createElement("span", { className: "tb-warn" }, "\u25B2 \uADFC\uAC70 \uBBF8\uC5F0\uACB0");
  return (/*#__PURE__*/
    React.createElement("div", { className: "tb-brief" }, /*#__PURE__*/
    React.createElement("div", { className: "tb-brief__bar no-print" }, /*#__PURE__*/
    React.createElement("p", null, "A4 \uD55C \uC7A5 \xB7 \uC778\uC1C4\uD558\uBA74 \uD654\uBA74 \uC7A5\uC2DD \uC5C6\uC774 \uC774 \uC885\uC774\uB9CC \uB098\uC635\uB2C8\uB2E4."), /*#__PURE__*/
    React.createElement("button", { type: "button", className: "tb-btn", onClick: () => window.print() }, "\uC778\uC1C4 \xB7 PDF \uC800\uC7A5")
    ), /*#__PURE__*/
    React.createElement("article", { className: "tb-sheet", "aria-label": "1\uD398\uC774\uC9C0 \uC0AC\uAC74 \uBE0C\uB9AC\uD551" }, /*#__PURE__*/
    React.createElement("header", { className: "sh-h" }, /*#__PURE__*/
    React.createElement("p", { className: "sh-brand" }, /*#__PURE__*/React.createElement("b", { lang: "en" }, "GYUNGGOOK TRIAL BRIEF"), " \uAE30\uC77C \uC804 \uC0AC\uAC74 \uBE0C\uB9AC\uD551 ", /*#__PURE__*/React.createElement("span", null, "\uAC00\uC0C1 \uC0AC\uAC74 \xB7 \uC2DC\uC5F0\uC6A9 \u2014 \uC2E4\uC81C \uC0AC\uAC74 \uC544\uB2D8")), /*#__PURE__*/
    React.createElement("p", { className: "sh-stamp sh-stamp--" + B.status }, T.BRIEF[B.status])
    ), /*#__PURE__*/

    React.createElement("section", { className: "sh-1" }, /*#__PURE__*/
    React.createElement("p", { className: "sh-when" }, /*#__PURE__*/React.createElement("b", null, T.ko(H.date), "(", wday(H.date), ") ", H.time), /*#__PURE__*/React.createElement("span", null, H.room, " \xB7 ", H.kind), /*#__PURE__*/React.createElement(Mark, { s: B.head.state })), /*#__PURE__*/
    React.createElement("dl", { className: "sh-dl" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "\uC0AC\uAC74"), /*#__PURE__*/React.createElement("dd", null, /*#__PURE__*/React.createElement("b", null, c.no), " ", c.title)), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "\uC720\uD615"), /*#__PURE__*/React.createElement("dd", null, c.type)), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "\uBC95\uC6D0"), /*#__PURE__*/React.createElement("dd", null, c.court, " ", c.division)), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "\uB2F4\uB2F9"), /*#__PURE__*/React.createElement("dd", null, c.lawyer)), /*#__PURE__*/
    React.createElement("div", { className: "sh-wide" }, /*#__PURE__*/React.createElement("dt", null, "\uB2F9\uC0AC\uC790"), /*#__PURE__*/React.createElement("dd", null, c.parties.map((p) => /*#__PURE__*/React.createElement("span", { key: p.side }, p.side, " ", p.name, /*#__PURE__*/React.createElement("small", null, " \u2014 ", p.role)))))
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "sh-grid" }, /*#__PURE__*/
    React.createElement("section", { className: "sh-2" }, /*#__PURE__*/React.createElement("h2", null, "\u2461 \uC0AC\uAC74 \uC694\uC57D"), /*#__PURE__*/
    React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, TP.claim), " ", c.claim, " ", B.summary.claimFact && /*#__PURE__*/React.createElement(Cite, { s: B.summary.claimFact.src, openSrc: openSrc })), /*#__PURE__*/
    React.createElement("p", null, c.overview), /*#__PURE__*/
    React.createElement("ul", null, B.summary.facts.map((f, i) => /*#__PURE__*/React.createElement("li", { key: i }, /*#__PURE__*/React.createElement(Mark, { s: f.state }), f.text, " ", /*#__PURE__*/React.createElement(Cite, { s: f.src, openSrc: openSrc })))), /*#__PURE__*/
    React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, TP.stage), " ", c.stage)
    ), /*#__PURE__*/
    React.createElement("section", { className: "sh-5" }, /*#__PURE__*/React.createElement("h2", null, "\u2464 \uCD5C\uADFC \uACBD\uACFC"), /*#__PURE__*/
    React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "\uC9C1\uC804 \uAE30\uC77C"), " ", c.recent.last), /*#__PURE__*/
    React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "\uCD5C\uADFC \uC11C\uBA74"), " ", c.recent.filings.map((f) => T.ko(f.date) + " " + f.title).join(" · ")), /*#__PURE__*/
    React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "\uC7AC\uD310\uBD80 \uBA85\uB839 \xB7 \uC11D\uBA85")), /*#__PURE__*/React.createElement("ul", null, c.recent.orders.map((o) => /*#__PURE__*/React.createElement("li", { key: o }, o))), /*#__PURE__*/
    React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "\uC81C\uCD9C\uAE30\uD55C"), " ", c.recent.deadlines.map((d) => d.label + " " + T.ko(d.date)).join(" · "))
    )
    ), /*#__PURE__*/
    React.createElement("section", { className: "sh-3" }, /*#__PURE__*/React.createElement("h2", null, "\u2462 \uD575\uC2EC \uC7C1\uC810 ", /*#__PURE__*/React.createElement("small", null, B.issues.length, "\uAC1C")), /*#__PURE__*/
    React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "\uC7C1\uC810"), /*#__PURE__*/React.createElement("th", null, TP.sideA), /*#__PURE__*/React.createElement("th", null, TP.sideB), /*#__PURE__*/React.createElement("th", null, "\uD655\uC778\uB418\uC9C0 \uC54A\uC740 \uC0AC\uC2E4"))), /*#__PURE__*/
    React.createElement("tbody", null, B.issues.map((i) => /*#__PURE__*/
    React.createElement("tr", { key: i.id }, /*#__PURE__*/React.createElement("th", { scope: "row" }, /*#__PURE__*/React.createElement(Mark, { s: i.state }), i.title), /*#__PURE__*/
    React.createElement("td", null, i.p.text, /*#__PURE__*/React.createElement("small", null, "\uADFC\uAC70 ", ev(i.p.ev))), /*#__PURE__*/React.createElement("td", null, i.d.text, /*#__PURE__*/React.createElement("small", null, "\uADFC\uAC70 ", ev(i.d.ev))), /*#__PURE__*/
    React.createElement("td", null, i.unknown.length ? i.unknown.join(" · ") : "—"))
    )))
    ), /*#__PURE__*/
    React.createElement("div", { className: "sh-grid" }, /*#__PURE__*/
    React.createElement("section", { className: "sh-4" }, /*#__PURE__*/React.createElement("h2", null, "\u2463 \uC99D\uAC70 \xB7 \uC785\uC99D"), /*#__PURE__*/
    React.createElement("table", null, /*#__PURE__*/React.createElement("tbody", null, B.evidence.map((e) => /*#__PURE__*/
    React.createElement("tr", { key: e.no, className: e.status !== "submitted" ? "is-warn" : "" }, /*#__PURE__*/React.createElement("th", { scope: "row" }, e.label), /*#__PURE__*/React.createElement("td", null, e.title ? e.title + " — " : "", e.purpose), /*#__PURE__*/React.createElement("td", null, e.status === "submitted" ? "제출" : "▲ " + EVST[e.status]))
    )))
    ), /*#__PURE__*/
    React.createElement("section", { className: "sh-6" }, /*#__PURE__*/React.createElement("h2", null, "\u2465 \uAE30\uC77C \uC804 \uD655\uC778\uC0AC\uD56D ", /*#__PURE__*/React.createElement("small", null, "\uB0A8\uC740 ", todo.length, "\uAC74")), /*#__PURE__*/
    React.createElement("ul", { className: "sh-todo" }, todo.map((a) => {const l = T.days(c.now, a.due);return /*#__PURE__*/React.createElement("li", { key: a.id, className: l < 0 ? "is-late" : l <= 2 ? "is-soon" : "" }, /*#__PURE__*/React.createElement("i", { "aria-hidden": "true" }, "\u25A1"), a.text, /*#__PURE__*/React.createElement("small", null, a.owner, " \xB7 ", T.ko(a.due), " ", l < 0 ? "기한 경과" : "D-" + l));}))
    )
    ), /*#__PURE__*/
    React.createElement("section", { className: "sh-7" }, /*#__PURE__*/React.createElement("h2", null, "\u2466 \uC704\uD5D8 \xB7 \uC720\uC758 ", /*#__PURE__*/React.createElement("small", null, "\uBBF8\uD655\uC778 ", risks.length, "\uAC74 \xB7 \uD655\uC778 \uCC98\uB9AC ", B.resolvedRisks.length, "\uAC74")), /*#__PURE__*/
    React.createElement("ul", null, shown.map((r) => /*#__PURE__*/React.createElement("li", { key: r.id, className: "is-" + r.sev }, /*#__PURE__*/React.createElement("b", null, r.sev === "high" ? "▲ 중요" : "▲"), r.title, r.values.length > 1 && /*#__PURE__*/React.createElement("small", null, r.values.map((v) => v.show + "(" + v.src.doc + ")").join(" / ")))),
    risks.length > shown.length && /*#__PURE__*/React.createElement("li", { className: "sh-more" }, "\uC678 ", risks.length - shown.length, "\uAC74 \u2014 \uC791\uC5C5\uD654\uBA74 3\uB2E8\uACC4\uC5D0\uC11C \uD655\uC778"),
    !risks.length && /*#__PURE__*/React.createElement("li", null, "\uBBF8\uD655\uC778 \uC704\uD5D8 \uC5C6\uC74C \u2014 \uD655\uC778 \uCC98\uB9AC \uB0B4\uC5ED\uC740 \uC791\uC5C5\uD654\uBA74\uC5D0 \uC788\uC2B5\uB2C8\uB2E4"))
    ), /*#__PURE__*/
    React.createElement("footer", { className: "sh-8" }, /*#__PURE__*/React.createElement("h2", null, "\u2467 \uAC80\uD1A0 \xB7 \uC2B9\uC778"), /*#__PURE__*/
    React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "\uCD5C\uC885 \uAC31\uC2E0"), " ", T.kst(B.review.at), " ", /*#__PURE__*/React.createElement("b", null, "\uC0C1\uD0DC"), " ", T.BRIEF[B.status], " ", /*#__PURE__*/React.createElement("b", null, "\uAC80\uD1A0\uC790"), " ", B.review.reviewer || "— (미승인)"), /*#__PURE__*/
    React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "\uCD9C\uCC98 \uBB38\uC11C"), " ", B.review.sources.map((id) => id + " " + docs(id)).join(" · ")), /*#__PURE__*/
    React.createElement("p", { className: "sh-legend" }, /*#__PURE__*/React.createElement(Mark, { s: "confirmed" }), /*#__PURE__*/React.createElement(Mark, { s: "auto" }), /*#__PURE__*/React.createElement(Mark, { s: "check" }), " \xB7 \uADDC\uCE59 \uAE30\uBC18 \uCD94\uCD9C \xB7 \uB2F4\uB2F9\uC790 \uC785\uB825 \u2014 AI \uBAA8\uB378 \uBBF8\uC0AC\uC6A9 \xB7 \uD310\uACB0 \uC608\uCE21 \xB7 \uBC95\uB960 \uACB0\uB860\uC744 \uB2F4\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.")
    )
    )
    ));

}

/* ================================================================ 프로젝트 개요 — 모든 프로젝트 공통 6항목 (두괄식 · 실제로 한 것만) */
const CASE = [
["01", "문제 정의", "변론기일 전에는 소장 · 답변서 · 준비서면 · 변론조서 · 증거를 다시 펼쳐 쟁점 · 증거 · 재판부 석명 · 제출기한을 확인해야 합니다. 정보가 여러 서면에 흩어져 있고, 서면마다 날짜 · 금액 · 당사자 표기가 어긋나거나 인용한 증거가 목록에 없는 경우를 사람이 직접 찾아야 합니다."],
["02", "개선 목표", "기일 전에 볼 정보를 A4 한 장에 우선순위대로 모으고, 문서 간 불일치 · 누락을 규칙으로 먼저 표시하며, 출처가 없는 내용은 확정하지 않고, 승인 뒤 자료가 바뀌면 다시 검토하게 하는 것."],
["03", "담당 역할", "개인 프로젝트로 단독 수행 — 업무 흐름 분석, 데이터 구조(사건 · 기일 · 당사자 · 쟁점 · 증거 · 문서 · 할 일 · 검토 상태 · 감사기록) 설계, 검수 규칙 8종 설계, 화면 구현, 가상 사건자료 작성, 자동화 테스트 작성. 법무법인 경국의 공식 프로젝트가 아니며 실제 사건자료를 쓰지 않았습니다."],
["04", "실행 내용", "문서 등록 → 날짜 · 금액 · 당사자 · 증거번호 추출(문서 · 쪽 · 문단 위치 기록) → 정합성 검수(R1–R8) → 쟁점별 증거 연결 · 확정 → 기일 준비 할 일 · 기한 관리 → 역할별 권한(작성 · 승인 · 열람)과 변호사 승인 → A4 1장 브리핑 · PDF 출력. 모든 변경은 감사기록에 남습니다."],
["05", "검증 및 성과", "시제품 검증 결과(실무 도입 효과 아님) — 가상 민사사건 3건에 넣어 둔 문서 불일치 · 누락 15건을 모두 검출하고 그 밖의 항목은 표시하지 않음(테스트 자료 기준), 세 사건 모두 A4 1장 PDF로 출력, 사건 선택부터 PDF 출력까지의 흐름을 Chromium · WebKit 자동 테스트로 확인. 작성 시간 단축 · 정확도 같은 실무 지표는 측정하지 않았습니다."],
["06", "확장 가능성", "사건 유형별 템플릿(행정 · 가사 · 형사)으로 칸과 용어를 바꿔 확장하고, 승인된 내부 환경에서는 사건관리 시스템 연동과 출처 연결을 전제로 한 선택적 요약(LLM)을 붙일 수 있습니다. 같은 구조는 여신 심사 서류 · 계약 검토 · 감사 대응처럼 여러 문서를 대조해 한 장으로 보고하는 업무에 쓸 수 있습니다."]];

function CaseStudy() {
  return (/*#__PURE__*/
    React.createElement("section", { id: "tb-case", className: "tb-case", "aria-labelledby": "tb-case-h" }, /*#__PURE__*/
    React.createElement("h2", { id: "tb-case-h" }, "\uD504\uB85C\uC81D\uD2B8 \uAC1C\uC694 ", /*#__PURE__*/React.createElement("small", null, "Gyunggook Trial Brief \xB7 \uBC95\uB960 AX \xB7 \uC5C5\uBB34\uD601\uC2E0 \xB7 \uC81C\uD488\uAE30\uD68D")), /*#__PURE__*/
    React.createElement("p", { className: "tb-case__lead" }, /*#__PURE__*/React.createElement("b", null, "\uC7AC\uD310 \uC900\uBE44 \uC5C5\uBB34\uB97C \uD55C \uC7A5\uC758 \uBE0C\uB9AC\uD551\uC73C\uB85C \uAD6C\uC870\uD654"), " \u2014 \uC0AC\uAC74\uAE30\uB85D\uACFC \uAE30\uC77C \uC900\uBE44\uC0AC\uD56D\uC744 \uC5F0\uACB0\uD574 \uBCC0\uD638\uC0AC\uAC00 \uD575\uC2EC \uC7C1\uC810 \xB7 \uC99D\uAC70 \xB7 \uBBF8\uACB0 \uACFC\uC81C\uB97C \uBE60\uB974\uAC8C \uD655\uC778\uD560 \uC218 \uC788\uB294 1\uD398\uC774\uC9C0 \uBE0C\uB9AC\uD551 \uC2DC\uC2A4\uD15C\uC744 \uC124\uACC4 \xB7 \uAD6C\uD604\uD55C \uAC1C\uC778 \uD504\uB85C\uC81D\uD2B8\uC785\uB2C8\uB2E4."), /*#__PURE__*/
    React.createElement("ol", null, CASE.map(([n, t, d]) => /*#__PURE__*/React.createElement("li", { key: n }, /*#__PURE__*/React.createElement("b", null, n, " ", t), /*#__PURE__*/React.createElement("p", null, d))))
    ));

}

/* 원문 보기 — 근거 문단을 강조 */
function SrcView({ c, st, src, close }) {
  const d = docOf(c, st, src.doc);
  const ref = React.useRef(null);
  React.useEffect(() => {if (ref.current) ref.current.focus();}, [src]);
  if (!d) return null;
  return (/*#__PURE__*/
    React.createElement("aside", { className: "tb-src no-print", role: "dialog", "aria-label": "원문 — " + d.title, tabIndex: -1, ref: ref, onKeyDown: (e) => {if (e.key === "Escape") close();} }, /*#__PURE__*/
    React.createElement("header", null, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, d.id), " ", d.title, /*#__PURE__*/React.createElement("small", null, d.kind, " \xB7 ", T.ko(d.date), " \xB7 ", d.by)), /*#__PURE__*/React.createElement("button", { type: "button", className: "tb-btn tb-btn--sm tb-btn--ghost", onClick: close }, "\uB2EB\uAE30")),
    d.pages.map((p) => /*#__PURE__*/
    React.createElement("section", { key: p.no }, /*#__PURE__*/React.createElement("p", { className: "tb-pg" }, p.no, "\uCABD"),
    p.paras.map((t, i) => /*#__PURE__*/React.createElement("p", { key: i, className: "tb-para" + (p.no === src.page && i + 1 === src.para ? " is-sel" : "") }, /*#__PURE__*/React.createElement("i", null, p.no, "-", i + 1), t))
    )
    )
    ));

}

ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
