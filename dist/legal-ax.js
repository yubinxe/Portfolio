/* 자동 생성 파일 — 수정하지 마세요. 원본: legal-ax.jsx · 갱신: npm run build */
/* legal-ax.jsx — 법률 AX 업무체계 (Legal AX Workspace) · 개인 구현 공개 시연
 * 데이터: legal-ax-data.js(허구 사례) · 규칙: legal-ax-domain.js(순수 함수) · 상태: 이 탭의 sessionStorage 에만 — 탭을 닫으면 사라진다.
 * AI 모델을 부르지 않는다. 화면의 모든 분석은 '규칙 기반' 또는 '문서 검색 · 근거 탐색'으로 표시한다.
 * 외부 제출 · 발송 · 업로드 없음. */
const D = window.LAX_DATA,L = window.LAX;
const TASKS = [
{ k: "evidence", ko: "소송기록 분석해 보기", en: "Litigation Evidence Intelligence", m: ["RULE", "RETRIEVAL"] },
{ k: "contract", ko: "계약 변경사항 비교하기", en: "Contract Comparison", m: ["RULE"] },
{ k: "research", ko: "법령·문서 근거 탐색하기", en: "Legal Research Desk", m: ["RETRIEVAL"] },
{ k: "matter", ko: "사건 진행 현황 살펴보기", en: "Matter Operations", m: ["RULE"] }];

const ASSIGNEES = ["담당 변호사 A(가상)", "담당 변호사 B(가상)", "담당 변호사 C(가상)", "담당 변호사 D(가상)", "담당 변호사 E(가상)", "담당 변호사 F(가상)", "담당 변호사 G(가상)", "미지정"];
const KEY = "lax.state.v1";
const caseOf = (fid) => D.cases.find((c) => c.id === D.fields.find((f) => f.id === fid).caseId);
const partyOf = (c, id) => c.participants.find((p) => p.id === id) || {};
const docOf = (c, id) => c.documents.find((d) => d.id === id);
const evOf = (c, id) => c.evidence.find((e) => e.id === id);

function Method({ m }) {
  return /*#__PURE__*/React.createElement("span", { className: "lx-method" }, m.map((k) => /*#__PURE__*/React.createElement("b", { key: k, className: "lx-method__" + L.METHOD[k].key }, L.METHOD[k].ko, " ", /*#__PURE__*/React.createElement("i", { lang: "en" }, L.METHOD[k].en))));
}
function StatusSelect({ value, onChange, label, id }) {
  return (/*#__PURE__*/
    React.createElement("label", { className: "lx-st lx-st--" + value }, /*#__PURE__*/
    React.createElement("span", { className: "sr-only" }, label, " \uAC80\uD1A0 \uC0C1\uD0DC"), /*#__PURE__*/
    React.createElement("select", { id: id, value: value, onChange: (e) => onChange(e.target.value) },
    L.STATUS.map((s) => /*#__PURE__*/React.createElement("option", { key: s.key, value: s.key }, s.ko))
    )
    ));

}
function Chip({ kind, children }) {return /*#__PURE__*/React.createElement("span", { className: "lx-chip lx-chip--" + kind }, children);}

/* ---------------------------------------------------------------- 저장 — 이 탭에서만 */
function loadState() {
  const base = L.initial(D);
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) {const s = JSON.parse(raw);if (s && s.v === base.v) return Object.assign(base, s);}
  } catch (e) {}
  return base;
}
function readHash() {
  const h = new URLSearchParams((location.hash || "").replace(/^#/, ""));
  const task = TASKS.some((t) => t.k === h.get("task")) ? h.get("task") : "evidence";
  const field = D.fields.some((f) => f.id === h.get("field")) ? h.get("field") : "civil";
  return { task, field };
}

function App() {
  const [st, setSt] = React.useState(loadState);
  const [{ task, field }, setNav] = React.useState(readHash);
  const [focus, setFocus] = React.useState(null); /* { doc, para } — 다른 화면에서 원문으로 넘어올 때 */
  const c = caseOf(field),f = D.fields.find((x) => x.id === field);
  React.useEffect(() => {try {sessionStorage.setItem(KEY, JSON.stringify(st));} catch (e) {}}, [st]);
  React.useEffect(() => {
    const url = "#task=" + task + "&field=" + field;
    if (location.hash !== url) history.replaceState(null, "", url);
  }, [task, field]);
  React.useEffect(() => {const on = () => setNav(readHash());window.addEventListener("hashchange", on);return () => window.removeEventListener("hashchange", on);}, []);
  const act = (a) => setSt((s) => L.reduce(s, Object.assign({ case: c.id }, a)));
  const go = (t, extra) => {setNav((n) => Object.assign({}, n, { task: t }));if (extra) setFocus(extra);const el = document.getElementById("lx-main");if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });};
  const reset = () => {if (window.confirm("이 탭의 시연 상태와 기록을 모두 지울까요?")) {try {sessionStorage.removeItem(KEY);} catch (e) {}setSt(L.initial(D));}};
  const T = TASKS.find((t) => t.k === task);
  return (/*#__PURE__*/
    React.createElement("div", { className: "lx" }, /*#__PURE__*/
    React.createElement("header", { className: "lx-top" }, /*#__PURE__*/
    React.createElement("a", { className: "lx-back", href: "index.html#ax-desk" }, "\u2190 \uAE40\uC720\uBE48 \uD3EC\uD2B8\uD3F4\uB9AC\uC624 \xB7 \uACBD\uAD6D AX"), /*#__PURE__*/
    React.createElement("p", { className: "lx-top__state" }, /*#__PURE__*/React.createElement("b", null, "B"), " \uAC1C\uC778 \uAD6C\uD604 \xB7 \uACF5\uAC1C \uC2DC\uC5F0")
    ), /*#__PURE__*/
    React.createElement("p", { className: "lx-notice", role: "note" }, D.notice, " \uC2E4\uC81C \uC758\uB8B0\uC778 \uC815\uBCF4\uB97C \uC785\uB825\uD558\uC9C0 \uB9C8\uC138\uC694."), /*#__PURE__*/

    React.createElement("section", { className: "lx-hero", "aria-labelledby": "lx-title" }, /*#__PURE__*/
    React.createElement("p", { className: "lx-kicker" }, "\uBC95\uB960 AX \uC5C5\uBB34\uCCB4\uACC4 ", /*#__PURE__*/React.createElement("span", { lang: "en" }, "Legal AX Workspace")), /*#__PURE__*/
    React.createElement("h1", { id: "lx-title" }, "\uAE30\uB85D\uC744 \uC815\uB9AC\uD558\uACE0, \uC7C1\uC810\uC744 \uC5F0\uACB0\uD558\uBA70,", /*#__PURE__*/React.createElement("br", null), "\uD310\uB2E8\uC758 \uADFC\uAC70\uB97C \uD655\uC778\uD569\uB2C8\uB2E4."), /*#__PURE__*/
    React.createElement("p", { className: "lx-lead" }, "\uAC00\uC0C1 \uC0AC\uAC74\uC744 \uD1B5\uD574 \uBCC0\uD638\uC0AC\uC758 \uAC80\uD1A0 \uC5C5\uBB34\uAC00 \uC5B4\uB5BB\uAC8C \uAD6C\uC870\uD654\uB418\uB294\uC9C0 \uC9C1\uC811 \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC2DC\uC2A4\uD15C\uC740 \uC815\uB9AC \xB7 \uB300\uC870 \xB7 \uAC80\uC0C9\uC744 \uB3D5\uACE0, \uC0AC\uC2E4\uC778\uC815\uACFC \uBC95\uB960 \uD310\uB2E8\uC740 \uB2F4\uB2F9 \uBCC0\uD638\uC0AC\uAC00 \uD569\uB2C8\uB2E4.")
    ), /*#__PURE__*/

    React.createElement("nav", { className: "lx-tasks", "aria-label": "\uB300\uD45C \uC5C5\uBB34" },
    TASKS.map((t, i) => /*#__PURE__*/
    React.createElement("button", { key: t.k, type: "button", "aria-pressed": t.k === task, onClick: () => go(t.k) }, /*#__PURE__*/
    React.createElement("b", null, String(i + 1).padStart(2, "0")), /*#__PURE__*/React.createElement("span", null, t.ko), /*#__PURE__*/React.createElement("em", { lang: "en" }, t.en)
    )
    )
    ), /*#__PURE__*/

    React.createElement("section", { className: "lx-field", "aria-label": "\uBD84\uC57C\uC640 \uAC00\uC0C1 \uC0AC\uAC74" }, /*#__PURE__*/
    React.createElement("div", { className: "lx-field__bar", role: "group", "aria-label": "\uBD84\uC57C \uC120\uD0DD" },
    D.fields.map((x) => /*#__PURE__*/React.createElement("button", { key: x.id, type: "button", "aria-pressed": x.id === field, onClick: () => {setNav({ task, field: x.id });setFocus(null);} }, x.ko))
    ), /*#__PURE__*/
    React.createElement("div", { className: "lx-case" }, /*#__PURE__*/
    React.createElement("p", { className: "lx-case__id" }, c.id, " \xB7 ", f.ko, " ", /*#__PURE__*/React.createElement("span", { lang: "en" }, f.en), " \xB7 ", /*#__PURE__*/React.createElement("em", null, f.work)), /*#__PURE__*/
    React.createElement("h2", null, c.title), /*#__PURE__*/
    React.createElement("p", null, c.summary), /*#__PURE__*/
    React.createElement("ul", { className: "lx-case__p" }, c.participants.map((p) => /*#__PURE__*/React.createElement("li", { key: p.id }, /*#__PURE__*/React.createElement("b", null, p.role), p.name)))
    )
    ), /*#__PURE__*/

    React.createElement("main", { id: "lx-main", className: "lx-main", tabIndex: -1 }, /*#__PURE__*/
    React.createElement("div", { className: "lx-main__head" }, /*#__PURE__*/
    React.createElement("h2", null, T.ko, " ", /*#__PURE__*/React.createElement("span", { lang: "en" }, T.en)), /*#__PURE__*/
    React.createElement(Method, { m: T.m })
    ),
    task === "evidence" && /*#__PURE__*/React.createElement(EvidenceView, { key: c.id, c: c, st: st, act: act, focus: focus, clearFocus: () => setFocus(null), go: go }),
    task === "contract" && /*#__PURE__*/React.createElement(ContractView, { key: field, f: f, st: st, act: act }),
    task === "research" && /*#__PURE__*/React.createElement(ResearchView, { key: c.id, c: c, f: f, go: go }),
    task === "matter" && /*#__PURE__*/React.createElement(MatterView, { key: c.id, c: c, st: st, act: act, go: go })
    ), /*#__PURE__*/

    React.createElement("details", { className: "lx-audit" }, /*#__PURE__*/
    React.createElement("summary", null, "\uC2DC\uC5F0 \uAE30\uB85D ", /*#__PURE__*/React.createElement("b", null, st.audit.length), "\uAC74 \u2014 \uB204\uAC00 \uBB34\uC5C7\uC744 \uBC14\uAFE8\uB294\uC9C0 ", /*#__PURE__*/React.createElement("span", null, "(\uC774 \uD0ED\uC5D0\uC11C\uB9CC \xB7 \uAC00\uC0C1 \uC5ED\uD560\uC758 \uC870\uC791 \uAE30\uB85D\uC774\uBA70 \uC2E4\uC81C \uB85C\uD38C \uAC10\uC0AC\uAE30\uB85D\uC774 \uC544\uB2D9\uB2C8\uB2E4)")),
    st.audit.length ? /*#__PURE__*/
    React.createElement("ol", null, st.audit.map((a, i) => /*#__PURE__*/React.createElement("li", { key: i }, /*#__PURE__*/React.createElement("time", null, a.t.replace("T", " ").slice(0, 19)), /*#__PURE__*/React.createElement("b", null, a.actor), /*#__PURE__*/React.createElement("span", null, a.case), a.text))) : /*#__PURE__*/
    React.createElement("p", null, "\uC544\uC9C1 \uBC14\uAFBC \uAC83\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uAC80\uD1A0 \uC0C1\uD0DC\uB97C \uBC14\uAFB8\uBA74 \uC5EC\uAE30\uC5D0 \uB0A8\uC2B5\uB2C8\uB2E4."), /*#__PURE__*/
    React.createElement("button", { type: "button", className: "lx-btn lx-btn--ghost", onClick: reset }, "\uC2DC\uC5F0 \uC0C1\uD0DC \uCD08\uAE30\uD654")
    ), /*#__PURE__*/

    React.createElement("footer", { className: "lx-foot" }, /*#__PURE__*/
    React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "\uCC98\uB9AC \uBC29\uC2DD"), " \uC774 \uC2DC\uC5F0\uC5D0\uB294 AI \uBAA8\uB378 \uD638\uCD9C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. ", /*#__PURE__*/React.createElement("b", { className: "lx-method__rule" }, "\uADDC\uCE59 \uAE30\uBC18 \uBD84\uC11D"), "\uC740 \uC815\uB82C \xB7 \uD0C0\uC784\uB77C\uC778 \xB7 \uBB38\uC790 \uBE44\uAD50 \xB7 \uC815\uD574\uC9C4 \uADDC\uCE59\uC758 \uCDA9\uC871 \uC5EC\uBD80\uB9CC, ", /*#__PURE__*/React.createElement("b", { className: "lx-method__retrieval" }, "\uBB38\uC11C \uAC80\uC0C9 \xB7 \uADFC\uAC70 \uD0D0\uC0C9"), "\uC740 \uC774 \uD654\uBA74\uC5D0 \uC0C9\uC778\uB41C \uC608\uC2DC\uC790\uB8CC\uB9CC \uB2E4\uB8F9\uB2C8\uB2E4."), /*#__PURE__*/
    React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "\uC800\uC7A5"), " \uAC80\uD1A0 \uC0C1\uD0DC\uC640 \uBA54\uBAA8\uB294 \uC774 \uBE0C\uB77C\uC6B0\uC800 \uD0ED(sessionStorage)\uC5D0\uB9CC \uB0A8\uACE0 \uD0ED\uC744 \uB2EB\uC73C\uBA74 \uC0AD\uC81C\uB429\uB2C8\uB2E4. \uC11C\uBC84\uB85C \uBCF4\uB0B4\uC9C0 \uC54A\uC73C\uBA70, \uD30C\uC77C \uC5C5\uB85C\uB4DC \xB7 \uC678\uBD80 \uC81C\uCD9C \xB7 \uBA54\uC77C \uBC1C\uC1A1 \uAE30\uB2A5\uC740 \uC5C6\uC2B5\uB2C8\uB2E4."), /*#__PURE__*/
    React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "\uBC95\uB839"), " \uC608\uC2DC \uC6D0\uBB38\uC740 \uC791\uC131 \uC2DC\uC810 \uD14D\uC2A4\uD2B8\uC785\uB2C8\uB2E4. \uC778\uC6A9 \uC804\uC5D0\uB294 \uBC18\uB4DC\uC2DC \uAD6D\uAC00\uBC95\uB839\uC815\uBCF4\uC13C\uD130 \uC6D0\uBB38\uC744 \uD655\uC778\uD558\uC138\uC694. \uD310\uB840 \uBC88\uD638\uC640 \uD310\uC2DC\uC0AC\uD56D\uC740 \uB9CC\uB4E4\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."), /*#__PURE__*/
    React.createElement("p", { className: "lx-foot__by" }, "\uC124\uACC4 \xB7 \uAD6C\uD604 \uAE40\uC720\uBE48 \u2014 \uBC95\uBB34\uBC95\uC778 \uACBD\uAD6D\uC758 \uC0AC\uB0B4 \uC2DC\uC2A4\uD15C\uC744 \uACF5\uAC1C\uD55C \uAC83\uC774 \uC544\uB2D9\uB2C8\uB2E4. ", /*#__PURE__*/React.createElement("a", { href: "index.html#ax-desk" }, "\uD3EC\uD2B8\uD3F4\uB9AC\uC624\uB85C \uB3CC\uC544\uAC00\uAE30"))
    )
    ));

}

/* ================================================================ A — 송무기록 · 증거 분석 */
function EvidenceView({ c, st, act, focus, clearFocus, go }) {
  const [type, setType] = React.useState("all");
  const [q, setQ] = React.useState("");
  const [sel, setSel] = React.useState(() => ({ doc: focus && focus.doc || c.documents[0].id, para: focus && focus.para || 0 }));
  const [claim, setClaim] = React.useState(null);
  const [step, setStep] = React.useState(0);
  const [graph, setGraph] = React.useState(false);
  const viewer = React.useRef(null);
  React.useEffect(() => {if (focus) {setSel({ doc: focus.doc, para: focus.para });setStep(2);clearFocus();}}, []);
  React.useEffect(() => {
    if (!sel.para || !viewer.current) return;
    const p = viewer.current.querySelector('[data-para="' + sel.para + '"]');
    if (p) p.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [sel]);
  const checks = L.consistency(c);
  const checkOf = (id) => checks.find((x) => x.claim === id);
  const types = ["all"].concat(Array.from(new Set(c.documents.map((d) => d.type))));
  const docs = L.docFilter(c, q, type);
  const doc = docOf(c, sel.doc);
  const hotEv = new Set(claim ? c.claims.find((x) => x.id === claim).evidence : []);
  const open = (evId) => {const e = evOf(c, evId);setSel({ doc: e.doc, para: e.loc.para });setStep(2);};
  const k = (x) => c.id + "/" + x;
  const docStatus = (d) => st.evidence[k("doc/" + d.id)] || "unreviewed";
  const evCited = (d) => c.evidence.filter((e) => e.doc === d.id);
  const final = !!st.finals[c.id],canFinal = L.canFinalize(c, st.issues ? st : st);

  const Docs = /*#__PURE__*/
  React.createElement("div", { className: "lx-col lx-col--docs" }, /*#__PURE__*/
  React.createElement("h3", null, "\uC0AC\uAC74 \uBB38\uC11C ", /*#__PURE__*/React.createElement("span", null, docs.length, " / ", c.documents.length)), /*#__PURE__*/
  React.createElement("div", { className: "lx-filter" }, /*#__PURE__*/
  React.createElement("label", null, /*#__PURE__*/React.createElement("span", { className: "sr-only" }, "\uBB38\uC11C \uC885\uB958"), /*#__PURE__*/React.createElement("select", { value: type, onChange: (e) => setType(e.target.value) }, types.map((t) => /*#__PURE__*/React.createElement("option", { key: t, value: t }, t === "all" ? "모든 종류" : t)))), /*#__PURE__*/
  React.createElement("label", null, /*#__PURE__*/React.createElement("span", { className: "sr-only" }, "\uBB38\uC11C \uAC80\uC0C9"), /*#__PURE__*/React.createElement("input", { type: "search", value: q, placeholder: "\uBB38\uC11C \uAC80\uC0C9", onChange: (e) => setQ(e.target.value) }))
  ),
  docs.length ? /*#__PURE__*/
  React.createElement("ul", { className: "lx-docs" },
  docs.map((d) => /*#__PURE__*/
  React.createElement("li", { key: d.id }, /*#__PURE__*/
  React.createElement("button", { type: "button", "aria-current": d.id === sel.doc ? "true" : undefined, onClick: () => {setSel({ doc: d.id, para: 0 });setStep(2);} }, /*#__PURE__*/
  React.createElement("span", { className: "lx-docs__t" }, /*#__PURE__*/React.createElement("b", null, d.id), d.title), /*#__PURE__*/
  React.createElement("span", { className: "lx-docs__m" }, d.type, " \xB7 ", d.date, " \xB7 ", partyOf(c, d.by).role), /*#__PURE__*/
  React.createElement(Chip, { kind: docStatus(d) }, L.label(docStatus(d)))
  )
  )
  )
  ) : /*#__PURE__*/
  React.createElement("p", { className: "lx-empty" }, "\uC870\uAC74\uC5D0 \uB9DE\uB294 \uBB38\uC11C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.")
  );


  const Facts = /*#__PURE__*/
  React.createElement("div", { className: "lx-col lx-col--facts" }, /*#__PURE__*/
  React.createElement("h3", null, "\uC0AC\uAC74\uC758 \uD750\uB984 ", /*#__PURE__*/React.createElement("span", null, "\uC2DC\uAC04\uC21C \xB7 ", /*#__PURE__*/React.createElement(Method, { m: ["RULE"] }))), /*#__PURE__*/
  React.createElement("ol", { className: "lx-tl" },
  L.timeline(c).map((e) => {
    const on = e.evidence.some((x) => hotEv.has(x));
    return (/*#__PURE__*/
      React.createElement("li", { key: e.id, className: on ? "is-hot" : "" }, /*#__PURE__*/
      React.createElement("time", null, e.date), /*#__PURE__*/
      React.createElement("span", null, e.label),
      e.evidence.map((x) => /*#__PURE__*/React.createElement("button", { key: x, type: "button", className: "lx-src", onClick: () => open(x) }, "\uC6D0\uBB38 ", evOf(c, x).doc, " \xB6", evOf(c, x).loc.para))
      ));

  })
  ), /*#__PURE__*/

  React.createElement("h3", null, "\uC7C1\uC810\uBCC4 \uC8FC\uC7A5\uACFC \uC99D\uAC70 ", /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Method, { m: ["RULE", "RETRIEVAL"] }))),
  c.issues.map((iss) => /*#__PURE__*/
  React.createElement("div", { key: iss.id, className: "lx-issue" }, /*#__PURE__*/
  React.createElement("h4", null, iss.id, " \xB7 ", iss.title),
  c.claims.filter((cl) => cl.issue === iss.id).map((cl) => {
    const ck = checkOf(cl.id);
    return (/*#__PURE__*/
      React.createElement("article", { key: cl.id, className: "lx-claim" + (claim === cl.id ? " is-on" : ""), onMouseEnter: () => setClaim(cl.id) }, /*#__PURE__*/
      React.createElement("button", { type: "button", className: "lx-claim__head", "aria-pressed": claim === cl.id, onClick: () => setClaim(claim === cl.id ? null : cl.id) }, /*#__PURE__*/
      React.createElement("b", null, partyOf(c, cl.party).role), /*#__PURE__*/React.createElement("span", null, "\u201C", cl.text, "\u201D")
      ), /*#__PURE__*/
      React.createElement("p", { className: "lx-claim__chips" }, /*#__PURE__*/React.createElement(Chip, { kind: "v-" + cl.verification }, L.VERIFY[cl.verification]), ck && /*#__PURE__*/React.createElement(Chip, { kind: "c-" + ck.state }, ck.ko)),
      ck && ck.hits && /*#__PURE__*/React.createElement("ul", { className: "lx-hits" }, ck.hits.map((h, i) => /*#__PURE__*/React.createElement("li", { key: i }, "\uC8FC\uC7A5: ", /*#__PURE__*/React.createElement("b", null, String(h.claimed)), " \xB7 \uC790\uB8CC(", evOf(c, h.evidence).doc, "): ", /*#__PURE__*/React.createElement("b", null, String(h.recorded)), " ", /*#__PURE__*/React.createElement("button", { type: "button", className: "lx-src", onClick: () => open(h.evidence) }, "\uC6D0\uBB38 \uBCF4\uAE30")))), /*#__PURE__*/
      React.createElement("ul", { className: "lx-evs" },
      cl.evidence.map((x) => {const e = evOf(c, x);return /*#__PURE__*/React.createElement("li", { key: x }, /*#__PURE__*/React.createElement("button", { type: "button", className: "lx-src", onClick: () => open(x) }, e.doc, " \xB6", e.loc.para), e.summary);})
      )
      ));

  })
  )
  ), /*#__PURE__*/
  React.createElement("p", { className: "lx-rule" }, "\uB300\uC870 \uADDC\uCE59: \uAC19\uC740 \uC7C1\uC810\uC5D0 \uBB36\uC778 \uC790\uB8CC\uC5D0 \uC801\uD78C \uC0AC\uC2E4(\uB0A0\uC9DC \xB7 \uC0C1\uD0DC \uB4F1)\uACFC \uC8FC\uC7A5\uD55C \uC0AC\uC2E4\uC774 \uB2E4\uB974\uBA74 \u2018\uCD94\uAC00 \uAC80\uD1A0 \uD544\uC694\u2019\uB85C \uD45C\uC2DC\uD569\uB2C8\uB2E4. \uC9C4\uC220\uC758 \uC9C4\uC704\uB098 \uC0AC\uC2E4\uC778\uC815\uC740 \uD310\uB2E8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."), /*#__PURE__*/
  React.createElement("button", { type: "button", className: "lx-btn lx-btn--ghost", "aria-expanded": graph, onClick: () => setGraph(!graph) }, graph ? "관계 그래프 닫기" : "증거 관계 그래프 열기"),
  graph && /*#__PURE__*/React.createElement(EvidenceGraph, { c: c, claim: claim, setClaim: setClaim, open: open, sel: sel, openDoc: (d) => {setSel({ doc: d, para: 0 });setStep(2);} })
  );


  const Review = /*#__PURE__*/
  React.createElement("div", { className: "lx-col lx-col--review" }, /*#__PURE__*/
  React.createElement("div", { className: "lx-viewer", ref: viewer, "aria-live": "polite" }, /*#__PURE__*/
  React.createElement("h3", null, "\uC6D0\uBB38 \uADFC\uAC70 ", /*#__PURE__*/React.createElement("span", null, doc.id, " \xB7 ", doc.type)), /*#__PURE__*/
  React.createElement("p", { className: "lx-viewer__t" }, doc.title, /*#__PURE__*/React.createElement("small", null, doc.date, " \xB7 \uC791\uC131 ", partyOf(c, doc.by).role, " \xB7 \uC778\uC6A9 \uC99D\uAC70 ", evCited(doc).length, "\uAC74")), /*#__PURE__*/
  React.createElement("div", { className: "lx-viewer__body" },
  doc.paras.map((p, i) => {
    const n = i + 1,cited = c.evidence.filter((e) => e.doc === doc.id && e.loc.para === n);
    return (/*#__PURE__*/
      React.createElement("p", { key: n, "data-para": n, className: (sel.para === n ? "is-sel " : "") + (cited.some((e) => hotEv.has(e.id)) ? "is-hot" : "") }, /*#__PURE__*/
      React.createElement("b", null, "\xB6", n), p, cited.length > 0 && /*#__PURE__*/React.createElement("em", null, cited.map((e) => e.id).join(" · "))
      ));

  })
  ), /*#__PURE__*/
  React.createElement("div", { className: "lx-viewer__st" }, /*#__PURE__*/React.createElement("span", null, "\uBB38\uC11C \uAC80\uD1A0 \uC0C1\uD0DC"), /*#__PURE__*/React.createElement(StatusSelect, { value: docStatus(doc), label: doc.title, onChange: (v) => act({ type: "evidence", key: k("doc/" + doc.id), value: v, label: doc.id + " " + doc.title }) }))
  ), /*#__PURE__*/

  React.createElement("div", { className: "lx-review" }, /*#__PURE__*/
  React.createElement("h3", null, "\uBCC0\uD638\uC0AC \uAC80\uD1A0 ", /*#__PURE__*/React.createElement("span", null, "\uC2DC\uC5F0 \u2014 \uAC00\uC0C1 \uC5ED\uD560")), /*#__PURE__*/
  React.createElement("ul", { className: "lx-review__list" },
  c.issues.map((i) => /*#__PURE__*/
  React.createElement("li", { key: i.id }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, i.id), i.title), /*#__PURE__*/React.createElement(StatusSelect, { value: st.issues[k(i.id)], label: i.title, onChange: (v) => act({ type: "status", key: k(i.id), value: v, label: "쟁점 " + i.id }) }))
  )
  ), /*#__PURE__*/
  React.createElement("h4", null, "\uCD94\uAC00 \uD655\uC778 \uD544\uC694 \uD56D\uBAA9"), /*#__PURE__*/
  React.createElement("ul", { className: "lx-review__list lx-review__list--tasks" },
  c.tasks.map((t) => /*#__PURE__*/
  React.createElement("li", { key: t.id }, /*#__PURE__*/React.createElement("span", null, t.text), /*#__PURE__*/React.createElement(StatusSelect, { value: st.issues[k(t.id)], label: t.text, onChange: (v) => act({ type: "status", key: k(t.id), value: v, label: "확인 과제 " + t.id }) }))
  )
  ), /*#__PURE__*/
  React.createElement(NoteBox, { k: k("note"), st: st, act: act, label: "\uAC80\uD1A0 \uBA54\uBAA8" }), /*#__PURE__*/
  React.createElement("h4", null, "\uADFC\uAC70 \uBB38\uC11C \uBAA9\uB85D"), /*#__PURE__*/
  React.createElement("ul", { className: "lx-review__docs" }, c.documents.map((d) => /*#__PURE__*/React.createElement("li", { key: d.id }, /*#__PURE__*/React.createElement("button", { type: "button", className: "lx-src", onClick: () => setSel({ doc: d.id, para: 0 }) }, d.id), d.title, /*#__PURE__*/React.createElement(Chip, { kind: docStatus(d) }, L.label(docStatus(d)))))), /*#__PURE__*/
  React.createElement("label", { className: "lx-final" + (canFinal ? "" : " is-off") }, /*#__PURE__*/
  React.createElement("input", { type: "checkbox", checked: final, disabled: !canFinal && !final, onChange: (e) => act({ type: "final", key: c.id, value: e.target.checked, label: c.id }) }), /*#__PURE__*/
  React.createElement("span", null, "\uCD5C\uC885 \uD655\uC778(\uC2DC\uC5F0) \u2014 \uBAA8\uB4E0 \uC7C1\uC810\uC774 \u2018\uAC80\uD1A0 \uC644\uB8CC\u2019 \uC774\uC0C1\uC77C \uB54C \uD45C\uC2DC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.", !canFinal && " 아직 검토 중인 쟁점이 있습니다.")
  )
  )
  );


  return (/*#__PURE__*/
    React.createElement("div", { className: "lx-ev", "data-step": step }, /*#__PURE__*/
    React.createElement("ol", { className: "lx-steps", "aria-label": "\uB2E8\uACC4" },
    ["사건 개요", "사건의 흐름", "원문 근거", "검토 패널"].map((s, i) => /*#__PURE__*/React.createElement("li", { key: s }, /*#__PURE__*/React.createElement("button", { type: "button", "aria-pressed": step === i, onClick: () => setStep(i) }, /*#__PURE__*/React.createElement("b", null, i + 1), s)))
    ), /*#__PURE__*/
    React.createElement("div", { className: "lx-ev__grid" }, /*#__PURE__*/
    React.createElement("div", { className: "lx-ev__s lx-ev__s--0" }, Docs), /*#__PURE__*/
    React.createElement("div", { className: "lx-ev__s lx-ev__s--1" }, Facts), /*#__PURE__*/
    React.createElement("div", { className: "lx-ev__s lx-ev__s--2" }, Review)
    )
    ));

}

function NoteBox({ k, st, act, label }) {
  const [v, setV] = React.useState(st.notes[k] || "");
  const saved = (st.notes[k] || "") === v;
  return (/*#__PURE__*/
    React.createElement("div", { className: "lx-note" }, /*#__PURE__*/
    React.createElement("label", { htmlFor: "n-" + k }, label, " ", /*#__PURE__*/React.createElement("small", null, "\uC2E4\uC81C \uC758\uB8B0\uC778 \uC815\uBCF4\uB97C \uC801\uC9C0 \uB9C8\uC138\uC694 \xB7 600\uC790")), /*#__PURE__*/
    React.createElement("textarea", { id: "n-" + k, value: v, maxLength: 600, rows: 3, onChange: (e) => setV(e.target.value) }), /*#__PURE__*/
    React.createElement("button", { type: "button", className: "lx-btn", disabled: saved, onClick: () => act({ type: "note", key: k, value: v, label }) }, saved ? "저장됨" : "메모 저장")
    ));

}

/* 증거 관계 그래프 — 주장 · 증거 · 문서를 세 줄로 놓고 선으로 잇는다. 노드를 누르면 그 원문으로 */
function EvidenceGraph({ c, claim, setClaim, open, openDoc, sel }) {
  const W = 640,rowH = 46,cols = [92, 320, 548];
  const n = Math.max(c.claims.length, c.evidence.length, c.documents.length);
  const H = n * rowH + 40;
  const y = (i, len) => 30 + (i + 0.5) * ((H - 40) / len);
  const cy = {},ey = {},dy = {};
  c.claims.forEach((x, i) => cy[x.id] = y(i, c.claims.length));
  c.evidence.forEach((x, i) => ey[x.id] = y(i, c.evidence.length));
  c.documents.forEach((x, i) => dy[x.id] = y(i, c.documents.length));
  const hot = claim ? new Set(c.claims.find((x) => x.id === claim).evidence) : null;
  const node = (x, yy, label, cls, onAct, title) => /*#__PURE__*/
  React.createElement("g", { className: "lx-g__n " + cls, transform: `translate(${x},${yy})`, role: "button", tabIndex: 0, "aria-label": title,
    onClick: onAct, onKeyDown: (e) => {if (e.key === "Enter" || e.key === " ") {e.preventDefault();onAct();}} }, /*#__PURE__*/
  React.createElement("rect", { x: "-84", y: "-15", width: "168", height: "30", rx: "2" }), /*#__PURE__*/React.createElement("text", { textAnchor: "middle", dy: "4" }, label)
  );

  const short = (s, m) => s.length > m ? s.slice(0, m - 1) + "…" : s;
  return (/*#__PURE__*/
    React.createElement("figure", { className: "lx-graph" }, /*#__PURE__*/
    React.createElement("svg", { viewBox: `0 0 ${W} ${H}`, role: "group", "aria-label": "\uC8FC\uC7A5 \xB7 \uC99D\uAC70 \xB7 \uBB38\uC11C \uAD00\uACC4 \uADF8\uB798\uD504" }, /*#__PURE__*/
    React.createElement("text", { x: cols[0], y: "14", textAnchor: "middle", className: "lx-g__h" }, "\uC8FC\uC7A5"), /*#__PURE__*/
    React.createElement("text", { x: cols[1], y: "14", textAnchor: "middle", className: "lx-g__h" }, "\uC99D\uAC70"), /*#__PURE__*/
    React.createElement("text", { x: cols[2], y: "14", textAnchor: "middle", className: "lx-g__h" }, "\uBB38\uC11C"),
    c.claims.map((cl) => cl.evidence.map((x) => /*#__PURE__*/React.createElement("line", { key: cl.id + x, x1: cols[0] + 84, y1: cy[cl.id], x2: cols[1] - 84, y2: ey[x], className: claim === cl.id ? "is-hot" : "" }))),
    c.evidence.map((e) => /*#__PURE__*/React.createElement("line", { key: e.id + "d", x1: cols[1] + 84, y1: ey[e.id], x2: cols[2] - 84, y2: dy[e.doc], className: hot && hot.has(e.id) ? "is-hot" : "" })),
    c.claims.map((cl) => node(cols[0], cy[cl.id], short(partyOf(c, cl.party).role.split(" ")[0] + " · " + cl.text, 13), "lx-g__c" + (claim === cl.id ? " is-on" : ""), () => setClaim(claim === cl.id ? null : cl.id), "주장 " + cl.text)),
    c.evidence.map((e) => node(cols[1], ey[e.id], short(e.id + " · " + e.summary, 14), "lx-g__e" + (hot && hot.has(e.id) ? " is-on" : ""), () => open(e.id), "증거 " + e.summary + " — 원문으로 이동")),
    c.documents.map((d) => node(cols[2], dy[d.id], short(d.id + " · " + d.title, 13), "lx-g__d" + (sel.doc === d.id ? " is-on" : ""), () => openDoc(d.id), "문서 " + d.title + " 열기"))
    ), /*#__PURE__*/
    React.createElement("figcaption", null, "\uB178\uB4DC\uB97C \uB204\uB974\uBA74 \uD574\uB2F9 \uC8FC\uC7A5 \xB7 \uC99D\uAC70\uC758 \uC6D0\uBB38\uC73C\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4. \uC120\uC740 \uB370\uC774\uD130\uC5D0 \uAE30\uB85D\uB41C \uC5F0\uACB0\uB9CC \uADF8\uB9BD\uB2C8\uB2E4.")
    ));

}

/* ================================================================ B — 계약서 변경 비교 */
function ContractView({ f, st, act }) {
  const opts = D.contracts;
  const [cid, setCid] = React.useState(f.contract || "nda");
  const [show, setShow] = React.useState("changed");
  const [ops, setOps] = React.useState({ added: true, removed: true, modified: true });
  const [sel, setSel] = React.useState(null);
  const K = D.contracts.find((x) => x.id === cid);
  const rows = L.diffContract(K);
  const list = rows.filter((r) => (show === "all" || r.op !== "same") && (show !== "important" || r.important) && (r.op === "same" || ops[r.op]));
  const cur = rows.find((r) => r.key === sel) || null;
  const counts = { added: rows.filter((r) => r.op === "added").length, removed: rows.filter((r) => r.op === "removed").length, modified: rows.filter((r) => r.op === "modified").length };
  const ck = (key) => "contract/" + cid + "/" + key;
  const OPK = { added: "추가", removed: "삭제", modified: "수정", same: "같음" };
  const jump = (key) => {setSel(key);const el = document.getElementById("cl-" + key);if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });};
  return (/*#__PURE__*/
    React.createElement("div", { className: "lx-ct" }, /*#__PURE__*/
    React.createElement("div", { className: "lx-ct__bar" }, /*#__PURE__*/
    React.createElement("label", null, "\uACC4\uC57D \uC720\uD615", /*#__PURE__*/
    React.createElement("select", { value: cid, onChange: (e) => {setCid(e.target.value);setSel(null);} }, opts.map((o) => /*#__PURE__*/React.createElement("option", { key: o.id, value: o.id }, o.ko, " (", o.en, ")")))
    ), /*#__PURE__*/
    React.createElement("p", { className: "lx-ct__v" }, /*#__PURE__*/React.createElement("span", null, "\uBCC0\uACBD \uC804 ", /*#__PURE__*/React.createElement("b", null, K.v1)), /*#__PURE__*/React.createElement("span", null, "\uBCC0\uACBD \uD6C4 ", /*#__PURE__*/React.createElement("b", null, K.v2)), /*#__PURE__*/React.createElement("span", null, "\uB2F9\uC0AC\uC790 ", K.parties))
    ), /*#__PURE__*/
    React.createElement("div", { className: "lx-ct__filters", role: "group", "aria-label": "\uBCF4\uAE30 \uD544\uD130" },
    [["changed", "바뀐 조항"], ["important", "중요 조항만"], ["all", "전체 조항"]].map(([k2, t]) => /*#__PURE__*/React.createElement("button", { key: k2, type: "button", "aria-pressed": show === k2, onClick: () => setShow(k2) }, t)), /*#__PURE__*/
    React.createElement("span", { className: "lx-ct__sep" }),
    Object.keys(counts).map((o) => /*#__PURE__*/
    React.createElement("label", { key: o, className: "lx-op lx-op--" + o }, /*#__PURE__*/React.createElement("input", { type: "checkbox", checked: ops[o], onChange: (e) => setOps(Object.assign({}, ops, { [o]: e.target.checked })) }), OPK[o], " ", counts[o])
    )
    ), /*#__PURE__*/
    React.createElement("p", { className: "lx-rule" }, "\uBE44\uAD50 \uBC29\uC2DD: \uC870\uD56D(\uBC88\uD638 \xB7 \uC81C\uBAA9)\uC73C\uB85C \uB450 \uBC84\uC804\uC744 \uB9DE\uCD94\uACE0 \uB0B1\uB9D0 \uB2E8\uC704\uB85C \uBE44\uAD50\uD569\uB2C8\uB2E4. \u2018\uC911\uC694 \uC870\uD56D\u2019\uC740 \uC870\uD56D \uBD84\uB958(\uB300\uAE08 \xB7 \uAE30\uAC04 \xB7 \uD574\uC9C0 \xB7 \uC190\uD574\uBC30\uC0C1 \xB7 \uCC45\uC784 \xB7 \uBE44\uBC00\uC720\uC9C0 \xB7 \uAD00\uD560)\uC640 \uC22B\uC790 \xB7 \uBD80\uB2F4 \uC8FC\uCCB4 \uBCC0\uACBD \uADDC\uCE59\uC5D0 \uAC78\uB838\uB2E4\uB294 \uB73B\uC774\uBA70, \uBC95\uC801 \uC704\uD5D8\uB3C4\uB098 \uC720\uBD88\uB9AC\uB97C \uACC4\uC0B0\uD55C \uACB0\uACFC\uAC00 \uC544\uB2D9\uB2C8\uB2E4."), /*#__PURE__*/
    React.createElement(ChangeSummary, { rows: rows, jump: jump, OPK: OPK }), /*#__PURE__*/
    React.createElement("div", { className: "lx-ct__grid" }, /*#__PURE__*/
    React.createElement("nav", { className: "lx-ct__nav", "aria-label": "\uC870\uD56D \uC774\uB3D9" },
    rows.map((r) => /*#__PURE__*/React.createElement("button", { key: r.key, type: "button", className: "lx-op--" + r.op, "aria-current": sel === r.key ? "true" : undefined, onClick: () => jump(r.key) }, (r.after || r.before).no, " ", (r.after || r.before).title, /*#__PURE__*/React.createElement("i", null, OPK[r.op])))
    ), /*#__PURE__*/
    React.createElement("div", { className: "lx-ct__rows" }, /*#__PURE__*/
    React.createElement("div", { className: "lx-ct__head", "aria-hidden": "true" }, /*#__PURE__*/React.createElement("span", null, "\uBCC0\uACBD \uC804"), /*#__PURE__*/React.createElement("span", null, "\uBCC0\uACBD \uD6C4")),
    list.length ? list.map((r) => /*#__PURE__*/
    React.createElement("article", { key: r.key, id: "cl-" + r.key, className: "lx-cl lx-cl--" + r.op + (sel === r.key ? " is-on" : "") }, /*#__PURE__*/
    React.createElement("button", { type: "button", className: "lx-cl__hit", onClick: () => setSel(r.key), "aria-pressed": sel === r.key }, /*#__PURE__*/
    React.createElement("span", { className: "lx-cl__t" }, (r.after || r.before).no, " ", (r.after || r.before).title, " ", /*#__PURE__*/React.createElement(Chip, { kind: "op-" + r.op }, OPK[r.op]), r.important && /*#__PURE__*/React.createElement(Chip, { kind: "imp" }, "\uD2B9\uBCC4 \uAC80\uD1A0 \uD56D\uBAA9"), /*#__PURE__*/React.createElement(Chip, { kind: st.clauses[ck(r.key)] || "unreviewed" }, L.label(st.clauses[ck(r.key)] || "unreviewed"))), /*#__PURE__*/
    React.createElement("span", { className: "lx-cl__a" }, r.before ? r.parts.filter((p) => p.op !== "add").map((p, i) => /*#__PURE__*/React.createElement("span", { key: i, className: "lx-d--" + p.op }, p.t)) : /*#__PURE__*/React.createElement("i", null, "\u2014 \uC5C6\uC74C")), /*#__PURE__*/
    React.createElement("span", { className: "lx-cl__b" }, r.after ? r.parts.filter((p) => p.op !== "del").map((p, i) => /*#__PURE__*/React.createElement("span", { key: i, className: "lx-d--" + p.op }, p.t)) : /*#__PURE__*/React.createElement("i", null, "\u2014 \uC0AD\uC81C\uB428"))
    )
    )
    ) : /*#__PURE__*/React.createElement("p", { className: "lx-empty" }, "\uD544\uD130\uC5D0 \uB9DE\uB294 \uC870\uD56D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.")
    ), /*#__PURE__*/
    React.createElement("aside", { className: "lx-ct__side", "aria-live": "polite" },
    cur ? /*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("h3", null, (cur.after || cur.before).no, " ", (cur.after || cur.before).title), /*#__PURE__*/
    React.createElement("h4", null, "\uBCC0\uACBD \uADFC\uAC70 \u2014 \uAC78\uB9B0 \uADDC\uCE59"),
    cur.flags.length ? /*#__PURE__*/React.createElement("ul", { className: "lx-flags" }, cur.flags.map((x) => /*#__PURE__*/React.createElement("li", { key: x.rule }, /*#__PURE__*/React.createElement("code", null, x.rule), x.ko))) : /*#__PURE__*/React.createElement("p", { className: "lx-empty" }, "\uAC78\uB9B0 \uADDC\uCE59 \uC5C6\uC74C"), /*#__PURE__*/
    React.createElement("h4", null, "\uC6D0\uBB38"), /*#__PURE__*/
    React.createElement("p", { className: "lx-ct__orig" }, /*#__PURE__*/React.createElement("b", null, "\uBCC0\uACBD \uC804"), cur.before ? cur.before.text : "— 없음"), /*#__PURE__*/
    React.createElement("p", { className: "lx-ct__orig" }, /*#__PURE__*/React.createElement("b", null, "\uBCC0\uACBD \uD6C4"), cur.after ? cur.after.text : "— 삭제됨"), /*#__PURE__*/
    React.createElement("div", { className: "lx-viewer__st" }, /*#__PURE__*/React.createElement("span", null, "\uAC80\uD1A0 \uC0C1\uD0DC"), /*#__PURE__*/React.createElement(StatusSelect, { value: st.clauses[ck(cur.key)] || "unreviewed", label: (cur.after || cur.before).title,
      onChange: (v) => act({ type: "clause", key: ck(cur.key), value: v, label: K.ko + " " + (cur.after || cur.before).no }) })), /*#__PURE__*/
    React.createElement(ClauseNote, { k: ck(cur.key), st: st, act: act, label: K.ko + " " + (cur.after || cur.before).no }), /*#__PURE__*/
    React.createElement("p", { className: "lx-note-sm" }, "\uACC4\uC57D\uC0C1 \uC720\uBD88\uB9AC\uC640 \uBC95\uC801 \uC704\uD5D8\uC740 \uB2E4\uB978 \uAC1C\uB150\uC785\uB2C8\uB2E4. \uC774 \uBE44\uAD50\uB294 \uC5B4\uB514\uAC00 \uBC14\uB00C\uC5C8\uB294\uC9C0\uB9CC \uBCF4\uC5EC \uC90D\uB2C8\uB2E4.")
    ) : /*#__PURE__*/
    React.createElement("p", { className: "lx-empty" }, "\uC870\uD56D\uC744 \uB204\uB974\uBA74 \uBC14\uB010 \uBD80\uBD84 \xB7 \uAC78\uB9B0 \uADDC\uCE59 \xB7 \uC6D0\uBB38 \xB7 \uAC80\uD1A0 \uC0C1\uD0DC\uAC00 \uC5EC\uAE30\uC5D0 \uB098\uC635\uB2C8\uB2E4.")
    )
    )
    ));

}
function ClauseNote({ k, st, act, label }) {
  const [v, setV] = React.useState(st.clauseNotes[k] || "");
  React.useEffect(() => setV(st.clauseNotes[k] || ""), [k]);
  const saved = (st.clauseNotes[k] || "") === v;
  return (/*#__PURE__*/
    React.createElement("div", { className: "lx-note" }, /*#__PURE__*/
    React.createElement("label", { htmlFor: "cn-" + k }, "\uAC80\uD1A0 \uBA54\uBAA8"), /*#__PURE__*/
    React.createElement("textarea", { id: "cn-" + k, value: v, maxLength: 600, rows: 3, onChange: (e) => setV(e.target.value) }), /*#__PURE__*/
    React.createElement("button", { type: "button", className: "lx-btn", disabled: saved, onClick: () => act({ type: "clauseNote", key: k, value: v, label }) }, saved ? "저장됨" : "메모 저장")
    ));

}
/* 변경 요약 — 두 버전 문서의 바뀐 조항만 한 줄씩(건물 그림 대신 문서 비교가 중심). 누르면 그 조항으로 */
function ChangeSummary({ rows, jump, OPK }) {
  const ch = rows.filter((r) => r.op !== "same");
  return (/*#__PURE__*/
    React.createElement("section", { className: "lx-sum", "aria-label": "\uBCC0\uACBD \uC694\uC57D" }, /*#__PURE__*/
    React.createElement("h3", null, "\uBCC0\uACBD \uC694\uC57D ", /*#__PURE__*/React.createElement("span", null, "\uBC14\uB010 \uC870\uD56D ", ch.length, "\uAC74 \xB7 \uD2B9\uBCC4 \uAC80\uD1A0 \uD56D\uBAA9 ", ch.filter((r) => r.important).length, "\uAC74 \xB7 \uAC19\uC740 \uC870\uD56D ", rows.length - ch.length, "\uAC74")), /*#__PURE__*/
    React.createElement("ol", null,
    ch.map((r) => {
      const t = r.after || r.before;
      return (/*#__PURE__*/
        React.createElement("li", { key: r.key }, /*#__PURE__*/React.createElement("button", { type: "button", onClick: () => jump(r.key) }, /*#__PURE__*/
        React.createElement("b", null, t.no, " ", t.title), /*#__PURE__*/React.createElement(Chip, { kind: "op-" + r.op }, OPK[r.op]), /*#__PURE__*/
        React.createElement("span", { className: "lx-sum__ba" }, /*#__PURE__*/React.createElement("s", null, r.before ? r.before.text : "— 없음"), /*#__PURE__*/React.createElement("i", { "aria-hidden": "true" }, "\u2192"), /*#__PURE__*/React.createElement("em", null, r.after ? r.after.text : "— 삭제됨")),
        r.flags.length > 0 && /*#__PURE__*/React.createElement("small", null, r.flags.map((f) => f.ko).join(" · "))
        )));

    })
    )
    ));

}

/* ================================================================ C — 법률 리서치 · 근거 확인 */
function ResearchView({ c, f, go }) {
  const [q, setQ] = React.useState("");
  const [type, setType] = React.useState("all");
  const [pick, setPick] = React.useState(c.research[0] ? "source:" + c.research[0] : null);
  const res = q ? L.search(D, q, type, c) : c.research.map((id) => ({ kind: "source", id, s: D.sources.find((s) => s.id === id) })).filter((r) => type === "all" || r.s.type === type);
  const cur = pick && pick.startsWith("source:") ? D.sources.find((s) => s.id === pick.slice(7)) : null;
  const curDoc = pick && pick.startsWith("doc:") ? res.find((r) => r.kind === "doc" && "doc:" + r.id === pick) : null;
  return (/*#__PURE__*/
    React.createElement("div", { className: "lx-rs" }, /*#__PURE__*/
    React.createElement("div", { className: "lx-rs__bar" }, /*#__PURE__*/
    React.createElement("label", { className: "lx-rs__q" }, /*#__PURE__*/React.createElement("span", { className: "sr-only" }, "\uAC80\uC0C9\uC5B4"), /*#__PURE__*/React.createElement("input", { type: "search", value: q, placeholder: "\uC608: \uAE30\uAC04 \xB7 \uB3C4\uAE09 \xB7 \uD589\uC815\uC2EC\uD310 \xB7 \uC7AC\uC0B0\uBD84\uD560", onChange: (e) => setQ(e.target.value) })), /*#__PURE__*/
    React.createElement("label", null, /*#__PURE__*/React.createElement("span", { className: "sr-only" }, "\uC790\uB8CC \uC720\uD615"), /*#__PURE__*/React.createElement("select", { value: type, onChange: (e) => setType(e.target.value) }, /*#__PURE__*/
    React.createElement("option", { value: "all" }, "\uBAA8\uB4E0 \uC790\uB8CC"), /*#__PURE__*/React.createElement("option", { value: "law" }, "\uBC95\uB839"), /*#__PURE__*/React.createElement("option", { value: "precedent" }, "\uD310\uB840(\uC548\uB0B4)"), /*#__PURE__*/React.createElement("option", { value: "doc" }, "\uC774 \uC0AC\uAC74 \uBB38\uC11C")
    )), /*#__PURE__*/
    React.createElement(Chip, { kind: "demo" }, "\uC608\uC2DC\uC790\uB8CC \uAC80\uC0C9 \u2014 \uC2E4\uC2DC\uAC04 \uBC95\uB960 \uAC80\uC0C9 \uC544\uB2D8")
    ), /*#__PURE__*/
    React.createElement("div", { className: "lx-rs__grid" }, /*#__PURE__*/
    React.createElement("div", { className: "lx-rs__list" }, /*#__PURE__*/
    React.createElement("h3", null, q ? "검색 결과" : "이 사건과 관련된 자료", " ", /*#__PURE__*/React.createElement("span", null, res.length, "\uAC74")),
    res.length ? /*#__PURE__*/
    React.createElement("ul", null,
    res.map((r) => r.kind === "source" ? /*#__PURE__*/
    React.createElement("li", { key: r.id }, /*#__PURE__*/React.createElement("button", { type: "button", "aria-current": pick === "source:" + r.id ? "true" : undefined, onClick: () => setPick("source:" + r.id) }, /*#__PURE__*/
    React.createElement("b", null, r.s.law, " ", r.s.article), /*#__PURE__*/React.createElement("span", null, r.s.title), /*#__PURE__*/
    React.createElement(Chip, { kind: r.s.verbatim ? "verb" : "unk" }, r.s.verbatim ? "원문 수록 · 대조 필요" : "출처 확인 필요")
    )) : /*#__PURE__*/

    React.createElement("li", { key: r.id }, /*#__PURE__*/React.createElement("button", { type: "button", "aria-current": pick === "doc:" + r.id ? "true" : undefined, onClick: () => setPick("doc:" + r.id) }, /*#__PURE__*/
    React.createElement("b", null, "\uC0AC\uAC74 \uBB38\uC11C ", r.doc.id, " \xB6", r.para), /*#__PURE__*/React.createElement("span", null, r.doc.title), /*#__PURE__*/React.createElement(Chip, { kind: "demo" }, "\uAC00\uC0C1 \uC790\uB8CC")
    ))
    )
    ) : /*#__PURE__*/
    React.createElement("p", { className: "lx-empty" }, "\uAC80\uC0C9 \uACB0\uACFC \uC5C6\uC74C \u2014 \uC774 \uC2DC\uC5F0\uC5D0 \uC0C9\uC778\uB41C \uC608\uC2DC\uC790\uB8CC\uC5D0\uC11C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.")
    ), /*#__PURE__*/
    React.createElement("article", { className: "lx-rs__detail", "aria-live": "polite" },
    cur ? /*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("p", { className: "lx-rs__org" }, cur.org, " \xB7 ", /*#__PURE__*/React.createElement(Chip, { kind: cur.verbatim ? "verb" : "unk" }, cur.verbatim ? "작성 시점 원문" : "원문 미수록")), /*#__PURE__*/
    React.createElement("h3", null, cur.law, " ", cur.article, " ", /*#__PURE__*/React.createElement("span", null, cur.title)), /*#__PURE__*/
    React.createElement("p", { className: "lx-rs__asof" }, cur.asOf), /*#__PURE__*/
    React.createElement("h4", null, "\uC6D0\uBB38 ", /*#__PURE__*/React.createElement("small", null, "\uADFC\uAC70")),
    cur.text.length ? /*#__PURE__*/React.createElement("div", { className: "lx-rs__text" }, cur.text.map((t, i) => /*#__PURE__*/React.createElement("p", { key: i, id: "src-" + cur.id + "-" + (i + 1) }, /*#__PURE__*/React.createElement("b", null, "\xB6", i + 1), t))) : /*#__PURE__*/
    React.createElement("p", { className: "lx-empty" }, "\uC774 \uC2DC\uC5F0\uC5D0\uB294 \uC6D0\uBB38\uC744 \uC2E3\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4 \u2014 \uCD9C\uCC98 \uD655\uC778 \uD544\uC694. \uC544\uB798 \uACF5\uC2DD \uB9C1\uD06C\uC5D0\uC11C \uC6D0\uBB38\uC744 \uD655\uC778\uD558\uC138\uC694."), /*#__PURE__*/
    React.createElement("h4", null, "\uC694\uC57D ", /*#__PURE__*/React.createElement("small", null, "\uC791\uC131\uC790 \uC815\uB9AC \xB7 \uC6D0\uBB38 \uC544\uB2D8")), /*#__PURE__*/
    React.createElement("p", { className: "lx-rs__sum" }, cur.summary), /*#__PURE__*/
    React.createElement("a", { className: "lx-btn", href: cur.url, target: "_blank", rel: "noreferrer" }, cur.type === "precedent" ? "대법원 종합법률정보에서 검색" : "국가법령정보센터 원문 열기", " \u2197")
    ) :
    curDoc ? /*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("p", { className: "lx-rs__org" }, "\uAC00\uC0C1 \uC0AC\uAC74 \uBB38\uC11C \xB7 ", c.id), /*#__PURE__*/
    React.createElement("h3", null, curDoc.doc.title, " ", /*#__PURE__*/React.createElement("span", null, "\xB6", curDoc.para)), /*#__PURE__*/
    React.createElement("div", { className: "lx-rs__text" }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "\xB6", curDoc.para), curDoc.text)), /*#__PURE__*/
    React.createElement("button", { type: "button", className: "lx-btn", onClick: () => go("evidence", { doc: curDoc.doc.id, para: curDoc.para }) }, "\uC0AC\uAC74 \uAE30\uB85D\uC5D0\uC11C \uC774 \uBB38\uB2E8 \uC5F4\uAE30")
    ) : /*#__PURE__*/
    React.createElement("p", { className: "lx-empty" }, "\uC67C\uCABD\uC5D0\uC11C \uC790\uB8CC\uB97C \uACE0\uB974\uBA74 \uC6D0\uBB38 \xB7 \uAE30\uC900 \xB7 \uCD9C\uCC98\uAC00 \uC5EC\uAE30\uC5D0 \uB098\uC635\uB2C8\uB2E4.")
    )
    ), /*#__PURE__*/
    React.createElement("section", { className: "lx-mk", "aria-labelledby": "lx-mk-t" }, /*#__PURE__*/
    React.createElement("h3", { id: "lx-mk-t" }, "\uAD00\uB828 \uBC95\uB960\uC2DC\uC7A5 \uC815\uBCF4 ", /*#__PURE__*/React.createElement("span", { lang: "en" }, "Legal Market")), /*#__PURE__*/
    React.createElement("ol", { className: "lx-mk__flow" }, D.market.flow.map((x, i) => /*#__PURE__*/React.createElement("li", { key: x }, /*#__PURE__*/React.createElement("b", null, i + 1), x))), /*#__PURE__*/
    React.createElement("p", null, f.ko, " \uBD84\uC57C\uC640 \uC774\uC5B4\uC9C0\uB294 \uD750\uB984: ", /*#__PURE__*/React.createElement("b", null, (D.market.areas.find((a) => a[0] === f.id) || [])[1])), /*#__PURE__*/
    React.createElement("p", { className: "lx-note-sm" }, D.market.cadence, " \uC6D0\uBB38\uC73C\uB85C \uD655\uC778\uB418\uC9C0 \uC54A\uC740 \uC2DC\uC7A5 \uADDC\uBAA8 \xB7 \uC131\uC7A5\uB960\uC740 \uC2E3\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."), /*#__PURE__*/
    React.createElement("a", { className: "lx-btn lx-btn--ghost", href: D.market.url, target: "_blank", rel: "noreferrer" }, "\uAD00\uB828 \uBC95\uB960\uC2DC\uC7A5 \uC815\uBCF4 \uC0B4\uD3B4\uBCF4\uAE30 \u2014 ", D.market.service, " \u2197")
    )
    ));

}

/* ================================================================ D — 사건 접수 · 진행 관리 */
function MatterView({ c, st, act, go }) {
  const m = st.matters[c.id];
  const stages = D.stages;
  const missing = c.matter.docs.filter((d, i) => !m.docs[i]).length;
  const k = (x) => c.id + "/" + x;
  const cnt = (v) => c.issues.filter((i) => st.issues[k(i.id)] === v).length;
  const hist = st.audit.filter((a) => a.case === c.id);
  return (/*#__PURE__*/
    React.createElement("div", { className: "lx-mt" }, /*#__PURE__*/
    React.createElement("ol", { className: "lx-mt__stages", "aria-label": "\uC0AC\uAC74 \uB2E8\uACC4" },
    stages.map((s, i) => /*#__PURE__*/React.createElement("li", { key: s, className: i < m.stage ? "is-done" : i === m.stage ? "is-cur" : "" }, /*#__PURE__*/React.createElement("b", null, i + 1), s))
    ), /*#__PURE__*/
    React.createElement("div", { className: "lx-mt__ctl" }, /*#__PURE__*/
    React.createElement("button", { type: "button", className: "lx-btn lx-btn--ghost", disabled: m.stage === 0, onClick: () => act({ type: "stage", key: c.id, value: m.stage - 1, stageName: stages[m.stage - 1] }) }, "\u2190 \uC774\uC804 \uB2E8\uACC4"), /*#__PURE__*/
    React.createElement("span", null, "\uD604\uC7AC ", /*#__PURE__*/React.createElement("b", null, stages[m.stage])), /*#__PURE__*/
    React.createElement("button", { type: "button", className: "lx-btn", disabled: m.stage === 6, onClick: () => act({ type: "stage", key: c.id, value: m.stage + 1, stageName: stages[m.stage + 1] }) }, "\uB2E4\uC74C \uB2E8\uACC4 \u2192")
    ), /*#__PURE__*/
    React.createElement("div", { className: "lx-mt__grid" }, /*#__PURE__*/
    React.createElement("section", { className: "lx-card" }, /*#__PURE__*/
    React.createElement("h3", null, "\uC0C1\uB2F4 \uC694\uC9C0 ", /*#__PURE__*/React.createElement("span", null, "\uAC00\uC0C1")), /*#__PURE__*/
    React.createElement("p", null, c.summary), /*#__PURE__*/
    React.createElement("label", { className: "lx-mt__as" }, "\uB2F4\uB2F9\uC790", /*#__PURE__*/
    React.createElement("select", { value: m.assignee, onChange: (e) => act({ type: "assignee", key: c.id, value: e.target.value }) }, ASSIGNEES.map((a) => /*#__PURE__*/React.createElement("option", { key: a }, a)))
    ), /*#__PURE__*/
    React.createElement("div", { className: "lx-mt__conf" }, /*#__PURE__*/
    React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "\uC774\uD574\uCDA9\uB3CC \uAC80\uD1A0"), " \uC2DC\uC2A4\uD15C\uC740 \uC790\uB3D9\uC73C\uB85C \uD310\uC815\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uB2F4\uB2F9\uC790\uAC00 \uD655\uC778\uD55C \uB4A4\uC5D0\uB9CC \uD45C\uC2DC\uD569\uB2C8\uB2E4."), /*#__PURE__*/
    React.createElement("button", { type: "button", className: "lx-btn" + (m.conflict === "reviewed" ? " lx-btn--ghost" : ""), onClick: () => act({ type: "conflict", key: c.id, value: m.conflict === "reviewed" ? "needs_check" : "reviewed" }) },
    m.conflict === "reviewed" ? "담당자 확인 표시됨 — 되돌리기" : "검토 필요 — 담당자 확인 표시")
    )
    ), /*#__PURE__*/
    React.createElement("section", { className: "lx-card" }, /*#__PURE__*/
    React.createElement("h3", null, "\uD544\uC694 \uC11C\uB958 ", /*#__PURE__*/React.createElement("span", null, missing ? "누락 " + missing + "건" : "모두 보유")), /*#__PURE__*/
    React.createElement("ul", { className: "lx-mt__docs" },
    c.matter.docs.map((d, i) => /*#__PURE__*/
    React.createElement("li", { key: d[0] }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("input", { type: "checkbox", checked: m.docs[i], onChange: (e) => act({ type: "doc", key: c.id, index: i, value: e.target.checked, label: d[0] }) }), d[0], /*#__PURE__*/React.createElement(Chip, { kind: m.docs[i] ? "reviewed" : "needs_check" }, m.docs[i] ? "보유" : "누락")))
    )
    )
    ), /*#__PURE__*/
    React.createElement("section", { className: "lx-card lx-card--wide" }, /*#__PURE__*/
    React.createElement("h3", null, "\uAE30\uC77C \xB7 \uB9C8\uAC10 ", /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Method, { m: ["RULE"] }))), /*#__PURE__*/
    React.createElement("p", { className: "lx-warn" }, "\uC2DC\uC5F0\uC6A9 \uC77C\uC815 \u2014 \uBC95\uC815\uAE30\uAC04\uC740 \uB2F4\uB2F9 \uBCC0\uD638\uC0AC\uC758 \uBCC4\uB3C4 \uD655\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4."),
    c.matter.deadlines.length ? /*#__PURE__*/
    React.createElement("ul", { className: "lx-dl" },
    c.matter.deadlines.map((dl) => {
      const r = L.deadline(dl.base, dl.days),ok = !!m.deadlineChecked[dl.id];
      return (/*#__PURE__*/
        React.createElement("li", { key: dl.id }, /*#__PURE__*/
        React.createElement("p", { className: "lx-dl__t" }, /*#__PURE__*/React.createElement("b", null, dl.label), /*#__PURE__*/React.createElement(Chip, { kind: "unk" }, dl.kind)), /*#__PURE__*/
        React.createElement("p", { className: "lx-dl__d" }, "\uAE30\uC0B0\uC810 \uD6C4\uBCF4 ", /*#__PURE__*/React.createElement("b", null, dl.base), " + ", dl.days, "\uC77C \u2192 \uB2E8\uC21C \uACC4\uC0B0 ", /*#__PURE__*/React.createElement("b", null, r.date)), /*#__PURE__*/
        React.createElement("ul", { className: "lx-dl__n" }, r.notes.map((n) => /*#__PURE__*/React.createElement("li", { key: n }, n)), /*#__PURE__*/React.createElement("li", null, dl.note)), /*#__PURE__*/
        React.createElement("p", { className: "lx-dl__b" }, "\uCC38\uACE0 \uADDC\uC815 ", dl.basis.map((b) => {const s = D.sources.find((x) => x.id === b);return /*#__PURE__*/React.createElement("button", { key: b, type: "button", className: "lx-src", onClick: () => go("research") }, s.law, " ", s.article);})), /*#__PURE__*/
        React.createElement("label", { className: "lx-dl__ok" }, /*#__PURE__*/React.createElement("input", { type: "checkbox", checked: ok, onChange: (e) => act({ type: "deadline", key: c.id, id: dl.id, value: e.target.checked, label: dl.label }) }), "\uAE30\uC0B0\uC810 \xB7 \uAE30\uAC04\uC758 \uC885\uB958 \xB7 \uD734\uC77C\uC744 \uB2F4\uB2F9 \uBCC0\uD638\uC0AC\uAC00 \uD655\uC778\uD568(\uC2DC\uC5F0)")
        ));

    })
    ) : /*#__PURE__*/
    React.createElement("p", { className: "lx-empty" }, "\uC774 \uAC00\uC0C1 \uC0AC\uAC74\uC5D0\uB294 \uACC4\uC0B0\uD560 \uAE30\uD55C \uD6C4\uBCF4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.")
    ), /*#__PURE__*/
    React.createElement("section", { className: "lx-card" }, /*#__PURE__*/
    React.createElement("h3", null, "\uAC80\uD1A0 \uD604\uD669 ", /*#__PURE__*/React.createElement("span", null, "\uC18C\uC1A1\uAE30\uB85D \uBD84\uC11D\uACFC \uC5F0\uACB0")), /*#__PURE__*/
    React.createElement("ul", { className: "lx-mt__sum" },
    L.STATUS.map((s) => /*#__PURE__*/React.createElement("li", { key: s.key }, /*#__PURE__*/React.createElement(Chip, { kind: s.key }, s.ko), /*#__PURE__*/React.createElement("b", null, cnt(s.key)), "\uAC74"))
    ), /*#__PURE__*/
    React.createElement("p", null, "\uCD5C\uC885 \uD655\uC778(\uC2DC\uC5F0): ", /*#__PURE__*/React.createElement("b", null, st.finals[c.id] ? "표시됨" : "아직")), /*#__PURE__*/
    React.createElement("button", { type: "button", className: "lx-btn lx-btn--ghost", onClick: () => go("evidence") }, "\uC7C1\uC810 \uAC80\uD1A0\uD558\uB7EC \uAC00\uAE30")
    ), /*#__PURE__*/
    React.createElement("section", { className: "lx-card" }, /*#__PURE__*/
    React.createElement("h3", null, "\uC678\uBD80 \uC81C\uCD9C ", /*#__PURE__*/React.createElement("span", null, "\uCC28\uB2E8\uB428")), /*#__PURE__*/
    React.createElement("button", { type: "button", className: "lx-btn", disabled: true, "aria-disabled": "true" }, "\uC804\uC790\uC18C\uC1A1 \uC81C\uCD9C \xB7 \uBA54\uC77C \uBC1C\uC1A1"), /*#__PURE__*/
    React.createElement("p", { className: "lx-note-sm" }, "\uACF5\uAC1C \uC2DC\uC5F0\uC5D0\uC11C\uB294 \uC2E4\uC81C \uBC95\uC6D0 \uC81C\uCD9C \xB7 \uC804\uC790\uC18C\uC1A1 \xB7 \uBA54\uC77C \xB7 \uC54C\uB9BC \uBC1C\uC1A1 \uAE30\uB2A5\uC744 \uAD6C\uD604\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.")
    ), /*#__PURE__*/
    React.createElement("section", { className: "lx-card lx-card--wide" }, /*#__PURE__*/
    React.createElement("h3", null, "\uC9C4\uD589 \uC774\uB825 ", /*#__PURE__*/React.createElement("span", null, hist.length, "\uAC74 \xB7 \uC774 \uD0ED\uC5D0\uC11C\uB9CC")),
    hist.length ? /*#__PURE__*/React.createElement("ol", { className: "lx-mt__hist" }, hist.map((a, i) => /*#__PURE__*/React.createElement("li", { key: i }, /*#__PURE__*/React.createElement("time", null, a.t.slice(11, 19)), a.text))) : /*#__PURE__*/React.createElement("p", { className: "lx-empty" }, "\uC544\uC9C1 \uC774 \uC0AC\uAC74\uC5D0\uC11C \uBC14\uAFBC \uAC83\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.")
    )
    )
    ));

}

const rootEl = document.getElementById("lx-root");
ReactDOM.createRoot(rootEl).render(/*#__PURE__*/React.createElement(App, null));
