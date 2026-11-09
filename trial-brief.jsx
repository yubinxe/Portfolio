/* trial-brief.jsx — Gyunggook Trial Brief · 기일 전 1페이지 사건 브리핑 (개인 구현 시제품)
 * 데이터: trial-brief-data.js(가상 사건 3건) · 규칙: trial-brief-domain.js(순수 함수) · 상태: 이 탭의 sessionStorage 에만.
 * AI 모델을 부르지 않는다 — 추출 · 검수는 규칙 기반, 쟁점 정리는 담당자 입력. 외부 전송 · 업로드 없음.
 * 화면 둘: A 사건 준비 작업화면(등록 → 추출 → 검수 → 쟁점 · 증거 → 기일 준비 → 검토 · 승인) · B 1페이지 브리핑(A4 인쇄 · PDF) */
const D = window.TB_DATA, T = window.TB;
const KEY = "tb.state.v1";
const STEPS = [
  ["docs", "문서 등록", "Documents"], ["facts", "정보 추출 · 구조화", "Extraction"], ["qa", "정합성 검수", "Document QA"],
  ["issues", "쟁점 · 증거 연결", "Issues & Evidence"], ["prep", "기일 준비", "Hearing Prep"], ["review", "검토 · 승인", "Review"],
];
const FLOW = ["사건 선택", "자료 확인", "불일치 탐지", "담당자 검토", "1페이지 브리핑", "PDF 출력"];
const WD = ["일", "월", "화", "수", "목", "금", "토"];
const wday = (d) => WD[new Date(d + "T00:00:00Z").getUTCDay()];
const MARK = { confirmed: ["●", "담당자 확정"], auto: ["◇", "자동 추출 · 미확정"], check: ["▲", "확인 필요"] };
const EVST = { submitted: "제출", unsubmitted: "미제출", missing: "누락" };

function load() {
  try { const s = JSON.parse(sessionStorage.getItem(KEY) || "null"); if (s && s.v === 1) return Object.assign(T.initial(), s); } catch (e) {}
  return T.initial();
}
function readHash() {
  const h = new URLSearchParams((location.hash || "").replace(/^#/, ""));
  const c = D.cases.some((x) => x.id === h.get("case")) ? h.get("case") : D.cases[0].id;
  return { c, view: h.get("view") === "brief" ? "brief" : "work", step: STEPS.some((s) => s[0] === h.get("step")) ? h.get("step") : "docs" };
}
const docOf = (c, st, id) => T.docsOf(c, st).find((d) => d.id === id);
const Mark = ({ s }) => <span className={"tb-mk tb-mk--" + s} title={MARK[s][1]}><i aria-hidden="true">{MARK[s][0]}</i>{MARK[s][1]}</span>;
const Sev = ({ s }) => <span className={"tb-sev tb-sev--" + s}>{s === "high" ? "중요" : "보통"}</span>;

function App() {
  const [st, setSt] = React.useState(load);
  const [nav, setNav] = React.useState(readHash);
  const [role, setRole] = React.useState(() => { try { return sessionStorage.getItem("tb.role") || "staff"; } catch (e) { return "staff"; } });
  const [q, setQ] = React.useState("");
  const [src, setSrc] = React.useState(null); /* { doc, page, para } — 원문 보기 */
  const c = D.cases.find((x) => x.id === nav.c);
  React.useEffect(() => { try { sessionStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }, [st]);
  React.useEffect(() => { try { sessionStorage.setItem("tb.role", role); } catch (e) {} }, [role]);
  React.useEffect(() => { const u = "#case=" + nav.c + "&view=" + nav.view + (nav.view === "work" ? "&step=" + nav.step : ""); if (location.hash !== u) history.replaceState(null, "", u); }, [nav]);
  React.useEffect(() => { const on = () => setNav(readHash()); addEventListener("hashchange", on); return () => removeEventListener("hashchange", on); }, []);
  const act = (a) => setSt((s) => T.reduce(s, Object.assign({ role, case: c.id }, a), new Date().toISOString()));
  const approve = () => setSt((s) => T.approve(c, s, role, new Date().toISOString(), c.lawyer));
  const go = (o) => setNav((n) => Object.assign({}, n, o));
  const list = D.cases.filter((x) => !q.trim() || (x.no + x.title + x.type + x.parties.map((p) => p.name).join("")).includes(q.trim()));
  const status = T.status(c, st), open = T.open(c, st);
  const flowAt = status === "approved" ? 5 : status === "review" ? 4 : open.length < T.qa(c, st).length ? 3 : T.registered(c, st).length ? 2 : 1;
  const can = (x) => T.can(role, x);
  return (
    <div className="tb">
      <header className="tb-top">
        <a className="tb-back" href="index.html#trial-brief">← 김유빈 포트폴리오 · 경국 AX</a>
        <p className="tb-brand"><b lang="en">Gyunggook Trial Brief</b><span>기일 전 1페이지 사건 브리핑</span></p>
        <label className="tb-role">역할(시연)
          <select value={role} onChange={(e) => setRole(e.target.value)}>{T.ROLES.map((r) => <option key={r.key} value={r.key}>{r.ko}</option>)}</select>
        </label>
      </header>
      <p className="tb-notice" role="note">{D.notice} <b>실제 사건자료 · 개인정보를 입력하지 마십시오.</b></p>

      <section className="tb-hero" aria-labelledby="tb-h1">
        <p className="tb-k">법률 AX · 업무혁신 · 제품기획 — 개인 구현 시제품</p>
        <h1 id="tb-h1">재판 직전, 사건의 핵심을 한 장으로.</h1>
        <p className="tb-q"><b>설계 질문</b> 변호사가 재판에 들어가기 직전 60초 동안 확인해야 할 정보는 무엇인가? <small>60초는 설계 목표이며, 측정한 결과가 아닙니다.</small></p>
        <p className="tb-jump"><a href="#tb-case">프로젝트 개요 — 문제 정의부터 확장 가능성까지 ↓</a></p>
        <ol className="tb-flow" aria-label="사용 흐름">{FLOW.map((t, i) => <li key={t} className={i < flowAt ? "is-done" : i === flowAt ? "is-now" : ""}><b>{i + 1}</b>{t}</li>)}</ol>
      </section>

      <section className="tb-cases" aria-label="사건 선택">
        <label className="tb-search"><span>사건 검색</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="사건번호 · 사건명 · 당사자" /></label>
        <ul>
          {list.length ? list.map((x) => {
            const s = T.status(x, st);
            return (
              <li key={x.id}><button type="button" aria-pressed={x.id === c.id} onClick={() => { go({ c: x.id, step: "docs" }); setSrc(null); }}>
                <small>{x.no} · {x.type}</small><b>{x.title}</b>
                <span>{T.ko(x.hearing.date)}({wday(x.hearing.date)}) {x.hearing.time} · {x.hearing.kind}</span>
                <i className={"tb-st tb-st--" + s}>{T.BRIEF[s]}</i>
              </button></li>
            );
          }) : <li className="tb-empty">검색 결과가 없습니다.</li>}
        </ul>
      </section>

      <div className="tb-views" role="tablist" aria-label="화면 전환">
        <button type="button" role="tab" aria-selected={nav.view === "work"} onClick={() => go({ view: "work" })}>A · 사건 준비 작업화면</button>
        <button type="button" role="tab" aria-selected={nav.view === "brief"} onClick={() => go({ view: "brief" })}>B · 1페이지 브리핑</button>
        <span className={"tb-st tb-st--" + status}>{T.BRIEF[status]}</span>
        {!can("confirm") && <span className="tb-ro">열람자 — 읽기 전용</span>}
      </div>

      <main id="tb-main" className={"tb-main tb-main--" + nav.view}>
        {nav.view === "work"
          ? <Work c={c} st={st} act={act} approve={approve} can={can} step={nav.step} setStep={(s) => go({ step: s })} openSrc={setSrc} toBrief={() => go({ view: "brief" })} />
          : <Brief c={c} st={st} openSrc={setSrc} />}
        {src && <SrcView c={c} st={st} src={src} close={() => setSrc(null)} />}
      </main>

      <details className="tb-audit">
        <summary>감사기록 — {st.audit.filter((a) => a.case === c.id).length}건 (이 탭에만 저장)</summary>
        <ol>{st.audit.filter((a) => a.case === c.id).slice(0, 40).map((a, i) => <li key={i}><time>{T.kst(a.t)}</time><b>{(T.ROLES.find((r) => r.key === a.role) || {}).ko}</b>{a.text}</li>)}</ol>
        <button type="button" className="tb-btn tb-btn--ghost" onClick={() => { if (confirm("이 탭의 시연 상태와 기록을 지울까요?")) { try { sessionStorage.removeItem(KEY); } catch (e) {} setSt(T.initial()); } }}>시연 초기화</button>
      </details>
      <CaseStudy />
      <footer className="tb-foot">
        <p><b>처리 방식</b> 날짜 · 금액 · 당사자 · 증거번호 추출과 정합성 검수는 <b>규칙 기반</b>입니다. 쟁점 요지 · 기일 준비사항은 담당자가 입력 · 확정합니다. AI 모델 호출 · 외부 전송 · 파일 업로드가 없습니다.</p>
        <p><b>하지 않는 일</b> 판결 예측 · 법률 결론 확정. 출처가 없는 내용은 확정으로 표시하지 않고, 승인 뒤 자료가 바뀌면 다시 검토하도록 되돌립니다.</p>
        <p><b>확장 설계</b> 공통 구조 + 사건 유형별 템플릿 — 민사(구현) · 행정 · 가사 · 형사(미구현, 용어 · 칸을 따로 정의).</p>
      </footer>
    </div>
  );
}

/* ================================================================ A — 사건 준비 작업화면 */
function Work({ c, st, act, approve, can, step, setStep, openSrc, toBrief }) {
  const Q = T.qa(c, st), open = Q.filter((x) => !T.resolved(c, st, x.id));
  const count = { docs: T.registered(c, st).length, facts: T.facts(c, st).length, qa: open.length, issues: c.issues.filter((i) => T.itemState(c, st, "issue/" + i.id, true) !== "confirmed").length, prep: T.actions(c, st).filter((a) => !a.done).length };
  return (
    <div className="tb-work">
      <nav className="tb-steps" aria-label="작업 단계">
        <ol>{STEPS.map(([k, ko, en], i) => (
          <li key={k}><button type="button" aria-current={step === k ? "step" : undefined} onClick={() => setStep(k)}>
            <b>{i + 1}</b><span>{ko}<em lang="en">{en}</em></span>{count[k] != null && <i>{k === "qa" ? "미확인 " : k === "issues" ? "미확정 " : k === "prep" ? "남은 " : ""}{count[k]}</i>}
          </button></li>
        ))}</ol>
      </nav>
      <section className="tb-panel" aria-live="polite">
        {step === "docs" && <Docs c={c} st={st} act={act} can={can} openSrc={openSrc} />}
        {step === "facts" && <Facts c={c} st={st} act={act} can={can} openSrc={openSrc} />}
        {step === "qa" && <QA c={c} st={st} act={act} can={can} openSrc={openSrc} Q={Q} />}
        {step === "issues" && <Issues c={c} st={st} act={act} can={can} />}
        {step === "prep" && <Prep c={c} st={st} act={act} can={can} />}
        {step === "review" && <Review c={c} st={st} act={act} approve={approve} can={can} toBrief={toBrief} />}
        <p className="tb-next">{STEPS.findIndex((s) => s[0] === step) < 5
          ? <button type="button" className="tb-btn tb-btn--ghost" onClick={() => setStep(STEPS[STEPS.findIndex((s) => s[0] === step) + 1][0])}>다음 단계 → {STEPS[STEPS.findIndex((s) => s[0] === step) + 1][1]}</button>
          : <button type="button" className="tb-btn" onClick={toBrief}>1페이지 브리핑 보기 →</button>}</p>
      </section>
    </div>
  );
}

function Docs({ c, st, act, can, openSrc }) {
  const [t, setT] = React.useState(""), [x, setX] = React.useState("");
  const extra = (st.extra && st.extra[c.id]) || [];
  return (
    <div>
      <h2>1 · 문서 등록 <small>등록한 서면만 추출 · 검수 · 브리핑에 들어갑니다</small></h2>
      <table className="tb-tbl">
        <thead><tr><th>등록</th><th>종류</th><th>문서</th><th>작성일</th><th>제출</th><th>원문</th></tr></thead>
        <tbody>
          {c.documents.map((d) => {
            const on = T.isReg(c, st, d.id);
            return (
              <tr key={d.id} className={d.pending && !on ? "is-pending" : ""}>
                <td><input type="checkbox" checked={on} disabled={!can("register")} onChange={(e) => act({ type: "register", doc: d.id, value: e.target.checked, label: d.title })} aria-label={d.title + " 등록"} /></td>
                <td>{d.kind}</td><td><b>{d.id}</b> {d.title}{d.pending && !on && <em className="tb-new">기일 직전 도착 · 미등록</em>}</td>
                <td>{T.ko(d.date)}</td><td>{d.by}</td>
                <td><button type="button" className="tb-link" onClick={() => openSrc({ doc: d.id, page: 1, para: 0 })}>보기</button></td>
              </tr>
            );
          })}
          {extra.map((d) => <tr key={d.id}><td>✓</td><td>{d.kind}</td><td><b>{d.id}</b> {d.title}</td><td>{T.ko(d.date)}</td><td>{d.by}</td><td><button type="button" className="tb-link" onClick={() => openSrc({ doc: d.id, page: 1, para: 0 })}>보기</button></td></tr>)}
        </tbody>
      </table>
      <form className="tb-add" onSubmit={(e) => { e.preventDefault(); if (x.trim()) { act({ type: "addDoc", title: t || "시연 입력 문서", text: x, date: c.now.slice(0, 10) }); setT(""); setX(""); } }}>
        <p className="tb-h">시연 문서 직접 입력 <span>이 브라우저 안에서만 처리됩니다 — 실제 사건자료를 입력하지 마십시오</span></p>
        <input value={t} onChange={(e) => setT(e.target.value)} placeholder="문서 제목(예: 원고 준비서면(2))" maxLength={60} disabled={!can("register")} aria-label="문서 제목" />
        <textarea value={x} onChange={(e) => setX(e.target.value)} rows={3} maxLength={4000} disabled={!can("register")} aria-label="문서 본문"
          placeholder={"예) 원고: " + c.parties[0].name + "\n수리비는 금 29,000,000원이다. 갑 제6호증을 제출한다."} />
        <button type="submit" className="tb-btn" disabled={!can("register") || !x.trim()}>문서 추가 · 다시 검수</button>
      </form>
    </div>
  );
}

function Cite({ s, openSrc }) {
  if (!s) return <span className="tb-cite tb-cite--none">출처 없음</span>;
  return <button type="button" className="tb-cite" onClick={() => openSrc(s)} aria-label={`원문 보기 ${s.doc} ${s.page}쪽 ${s.para}문단`}>{s.doc} · {s.page}-{s.para}</button>;
}

function Facts({ c, st, act, can, openSrc }) {
  const F = T.facts(c, st), KO = { date: "날짜", amount: "금액", party: "당사자", evidence: "증거번호" };
  return (
    <div>
      <h2>2 · 정보 추출 · 구조화 <small>규칙 기반 — 원문에 있는 문장 조각만 뽑고 위치를 남깁니다</small></h2>
      <p className="tb-h">브리핑에 들어갈 주요 사실 <span>담당자가 확정해야 ‘확정’으로 표시됩니다</span></p>
      <ul className="tb-kf">{c.keyFacts.map((k, i) => {
        const s = T.itemState(c, st, "fact/" + i, !!k.src);
        return (
          <li key={i}><Mark s={s} /><span>{k.text}</span><Cite s={k.src} openSrc={openSrc} />
            {s !== "confirmed"
              ? <button type="button" className="tb-btn tb-btn--sm" disabled={!can("confirm") || !k.src} onClick={() => act({ type: "confirm", key: "fact/" + i, label: k.text })}>확정</button>
              : <button type="button" className="tb-btn tb-btn--sm tb-btn--ghost" disabled={!can("confirm")} onClick={() => act({ type: "unconfirm", key: "fact/" + i, label: k.text })}>확정 해제</button>}
          </li>
        );
      })}</ul>
      <p className="tb-h">자동 추출 결과 {F.length}건 <span>모두 ‘자동 추출 · 미확정’ — 판단은 검수 · 검토 단계에서</span></p>
      <div className="tb-scroll"><table className="tb-tbl">
        <thead><tr><th>구분</th><th>이름표</th><th>값</th><th>원문 조각</th><th>출처</th></tr></thead>
        <tbody>{F.map((f) => (
          <tr key={f.id}><td>{KO[f.kind]}</td><td>{f.label}</td><td><b>{f.kind === "date" ? T.ko(f.value) : f.kind === "amount" ? T.won(f.value) : f.value}</b></td><td className="tb-frag">{f.text}</td><td><Cite s={f.src} openSrc={openSrc} /></td></tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}

function QA({ c, st, act, can, openSrc, Q }) {
  const [note, setNote] = React.useState({});
  const sorted = Q.slice().sort((a, b) => (a.sev === b.sev ? 0 : a.sev === "high" ? -1 : 1));
  return (
    <div>
      <h2>3 · 정합성 검수 <small lang="en">Gyunggook Legal Document QA</small></h2>
      <p className="tb-rules">규칙 R1 날짜 불일치 · R2 금액 불일치 · R3 당사자 표시 · R4 증거 누락 · R5 증거 미제출 · R6 근거 미연결 · R7 기한 · R8 승인 후 변경. ‘불일치’는 어느 쪽이 옳은지 정하지 않습니다 — 주장 차이인지 기재 오류인지는 담당자가 확인합니다.</p>
      {sorted.length === 0 && <p className="tb-empty">검수 항목이 없습니다.</p>}
      <ul className="tb-qa">{sorted.map((f) => {
        const r = T.resolved(c, st, f.id);
        return (
          <li key={f.id} className={r ? "is-ok" : "is-open is-" + f.sev}>
            <p className="tb-qa__t"><Sev s={f.sev} /><code>{f.rule}</code><b>{f.title}</b></p>
            {f.values.length > 0 && <ul className="tb-qa__v">{f.values.map((v, i) => <li key={i}><b>{v.show}</b><Cite s={v.src} openSrc={openSrc} /><span>{docOf(c, st, v.src.doc) ? docOf(c, st, v.src.doc).title : ""} · {T.ko(v.docDate)}</span>{v.latest && <em>최신 서면 기준(확정 아님)</em>}</li>)}</ul>}
            {f.expect && <p className="tb-muted">당사자 목록: {f.expect}</p>}
            {r ? (
              <p className="tb-qa__r">확인 처리 — {r.note} <button type="button" className="tb-link" disabled={!can("resolve")} onClick={() => act({ type: "unresolve", id: f.id, label: f.label })}>취소</button></p>
            ) : (
              <form className="tb-qa__f" onSubmit={(e) => { e.preventDefault(); act({ type: "resolve", id: f.id, label: f.label, note: note[f.id] || "" }); }}>
                <input value={note[f.id] || ""} onChange={(e) => setNote(Object.assign({}, note, { [f.id]: e.target.value }))} placeholder="확인 내용(4자 이상) — 예: 답변서 기재 오기로 확인" disabled={!can("resolve")} aria-label={f.title + " 확인 메모"} />
                <button type="submit" className="tb-btn tb-btn--sm" disabled={!can("resolve") || (note[f.id] || "").trim().length < 4}>확인 처리</button>
              </form>
            )}
          </li>
        );
      })}</ul>
    </div>
  );
}

function Issues({ c, st, act, can }) {
  const B = T.brief(c, st);
  return (
    <div>
      <h2>4 · 쟁점 · 증거 연결 <small>핵심 쟁점 3개 이내 · 주장마다 근거 증거를 잇습니다</small></h2>
      {c.issues.map((i) => {
        const s = T.itemState(c, st, "issue/" + i.id, true);
        return (
          <article key={i.id} className="tb-iss">
            <header><b>{i.id}</b><h3>{i.title}</h3><Mark s={s} />
              {s !== "confirmed"
                ? <button type="button" className="tb-btn tb-btn--sm" disabled={!can("confirm")} onClick={() => act({ type: "confirm", key: "issue/" + i.id, label: i.title })}>쟁점 확정</button>
                : <button type="button" className="tb-btn tb-btn--sm tb-btn--ghost" disabled={!can("confirm")} onClick={() => act({ type: "unconfirm", key: "issue/" + i.id, label: i.title })}>확정 해제</button>}
            </header>
            <div className="tb-iss__g">
              {[["plaintiff", "원고"], ["defendant", "피고"]].map(([side, ko]) => {
                const L = T.linksOf(c, st, i.id, side);
                return (
                  <div key={side}><p className="tb-h">{ko} 주장</p><p>{i[side].text}</p>
                    <fieldset><legend>근거 증거</legend>{c.evidence.map((e) => (
                      <label key={e.no}><input type="checkbox" disabled={!can("link")} checked={L.includes(e.no)} onChange={(ev) => act({ type: "link", issue: i.id, side, label: i.id + " " + ko, value: ev.target.checked ? L.concat(e.no) : L.filter((x) => x !== e.no) })} />{e.label}<small>{EVST[e.status]}</small></label>
                    ))}</fieldset>
                    {!L.length && <p className="tb-warn">▲ 연결된 증거 없음 — 브리핑에 ‘근거 미연결’로 표시</p>}
                  </div>
                );
              })}
            </div>
            {i.unknown && i.unknown.length > 0 && <p className="tb-unk"><b>확인되지 않은 사실</b>{i.unknown.join(" · ")}</p>}
          </article>
        );
      })}
      <p className="tb-h">증거 목록</p>
      <div className="tb-scroll"><table className="tb-tbl">
        <thead><tr><th>번호</th><th>표목</th><th>입증취지</th><th>상태</th></tr></thead>
        <tbody>{B.evidence.map((e) => <tr key={e.no} className={e.status !== "submitted" ? "is-warn" : ""}><td>{e.label}</td><td>{e.title || "—"}</td><td>{e.purpose}</td><td>{EVST[e.status]}</td></tr>)}</tbody>
      </table></div>
    </div>
  );
}

function Prep({ c, st, act, can }) {
  const H = c.hearing, A = T.actions(c, st), hs = T.itemState(c, st, "hearing", true);
  const [t, setT] = React.useState(""), [due, setDue] = React.useState(H.date), [own, setOwn] = React.useState(c.lawyer);
  return (
    <div>
      <h2>5 · 기일 준비 <small>기준 시각 {T.kst(c.now)} (시연용 고정)</small></h2>
      <div className="tb-hear">
        <p><b>{T.ko(H.date)}({wday(H.date)}) {H.time}</b> {H.room} · {H.kind}</p><Mark s={hs} />
        {hs !== "confirmed" ? <button type="button" className="tb-btn tb-btn--sm" disabled={!can("confirm")} onClick={() => act({ type: "confirm", key: "hearing", label: "기일 정보" })}>기일 정보 확정</button>
          : <button type="button" className="tb-btn tb-btn--sm tb-btn--ghost" disabled={!can("confirm")} onClick={() => act({ type: "unconfirm", key: "hearing", label: "기일 정보" })}>확정 해제</button>}
        <p className="tb-muted">기일 · 법정은 법원 사건 진행 정보와 대조한 뒤 확정합니다(시연에서는 대조 화면 없음).</p>
      </div>
      <div className="tb-two">
        <div><p className="tb-h">최근 진행 경과</p>
          <p><b>직전 기일</b> {c.recent.last}</p>
          <p><b>최근 서면</b> {c.recent.filings.map((f) => T.ko(f.date) + " " + f.title).join(" · ")}</p>
          <p><b>재판부 명령 · 석명</b></p><ul>{c.recent.orders.map((o) => <li key={o}>{o}</li>)}</ul>
        </div>
        <div><p className="tb-h">기일 전 할 일 <span>완료하면 기한 위험에서 빠집니다</span></p>
          <ul className="tb-todo">{A.map((a) => {
            const left = T.days(c.now, a.due);
            return (
              <li key={a.id} className={a.done ? "is-done" : left < 0 ? "is-late" : left <= 2 ? "is-soon" : ""}>
                <label><input type="checkbox" checked={!!a.done} disabled={!can("action")} onChange={(e) => act({ type: "action", id: a.id, label: a.text, patch: { done: e.target.checked } })} />
                  <span>{a.text}<small>{a.kind} · {a.owner} · {T.ko(a.due)} {a.done ? "완료" : left < 0 ? "기한 경과" : "D-" + left}</small></span></label>
              </li>
            );
          })}</ul>
          <form className="tb-add tb-add--row" onSubmit={(e) => { e.preventDefault(); if (t.trim()) { act({ type: "addAction", text: t, due, owner: own }); setT(""); } }}>
            <input value={t} onChange={(e) => setT(e.target.value)} placeholder="할 일 추가" disabled={!can("action")} aria-label="할 일" maxLength={80} />
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} disabled={!can("action")} aria-label="기한" />
            <input value={own} onChange={(e) => setOwn(e.target.value)} disabled={!can("action")} aria-label="담당" maxLength={30} />
            <button type="submit" className="tb-btn tb-btn--sm" disabled={!can("action") || !t.trim()}>추가</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Review({ c, st, act, approve, can, toBrief }) {
  const G = T.gates(c, st), ok = G.every((g) => g.ok), s = T.status(c, st), ap = st.approval[c.id];
  return (
    <div>
      <h2>6 · 검토 · 승인 <small>승인은 담당 변호사만 · 승인 뒤 서면이 바뀌면 ‘재검토 필요’</small></h2>
      <p className={"tb-big tb-st tb-st--" + s}>{T.BRIEF[s]}{ap && " — " + ap.by + " · " + T.kst(ap.at)}</p>
      <ul className="tb-gates">{G.map((g) => <li key={g.k} className={g.ok ? "is-ok" : ""}><i aria-hidden="true">{g.ok ? "✓" : "○"}</i>{g.ko}</li>)}</ul>
      <div className="tb-acts">
        <button type="button" className="tb-btn tb-btn--ghost" disabled={!can("request") || s !== "draft"} onClick={() => act({ type: "request" })}>변호사 검토 요청</button>
        <button type="button" className="tb-btn" disabled={!can("approve") || !ok || s === "approved"} onClick={approve}>{s === "stale" ? "다시 검토하고 승인" : "브리핑 승인"}</button>
        {ap && <button type="button" className="tb-btn tb-btn--ghost" disabled={!can("revoke")} onClick={() => act({ type: "revoke" })}>승인 취소</button>}
        <button type="button" className="tb-btn tb-btn--ghost" onClick={toBrief}>브리핑 보기 →</button>
      </div>
      {!can("approve") && <p className="tb-muted">현재 역할로는 승인할 수 없습니다. 위 ‘역할(시연)’에서 담당 변호사를 고르면 승인 버튼이 열립니다.</p>}
      {s === "stale" && <p className="tb-warn">▲ 승인 뒤 새 서면이 등록되었습니다. 3단계에서 ‘R8 승인 후 변경’ 항목을 확인 처리한 뒤 다시 승인하세요.</p>}
    </div>
  );
}

/* ================================================================ B — 1페이지 브리핑 (A4) */
function Brief({ c, st, openSrc }) {
  const B = T.brief(c, st), H = B.head.hearing, TP = D.templates[c.template];
  const risks = B.risks.slice().sort((a, b) => (a.sev === b.sev ? 0 : a.sev === "high" ? -1 : 1));
  const shown = risks.slice(0, 6), todo = B.todo.filter((a) => !a.done);
  const docs = (id) => (docOf(c, st, id) || {}).title || id;
  const ev = (list) => list.length ? list.map((n) => (c.evidence.find((e) => e.no === n) || {}).label || n).join(", ") : <span className="tb-warn">▲ 근거 미연결</span>;
  return (
    <div className="tb-brief">
      <div className="tb-brief__bar no-print">
        <p>A4 한 장 · 인쇄하면 화면 장식 없이 이 종이만 나옵니다.</p>
        <button type="button" className="tb-btn" onClick={() => window.print()}>인쇄 · PDF 저장</button>
      </div>
      <article className="tb-sheet" aria-label="1페이지 사건 브리핑">
        <header className="sh-h">
          <p className="sh-brand"><b lang="en">GYUNGGOOK TRIAL BRIEF</b> 기일 전 사건 브리핑 <span>가상 사건 · 시연용 — 실제 사건 아님</span></p>
          <p className={"sh-stamp sh-stamp--" + B.status}>{T.BRIEF[B.status]}</p>
        </header>
        {/* ① 기본정보 — 기일 · 시간 · 법정을 맨 앞에 */}
        <section className="sh-1">
          <p className="sh-when"><b>{T.ko(H.date)}({wday(H.date)}) {H.time}</b><span>{H.room} · {H.kind}</span><Mark s={B.head.state} /></p>
          <dl className="sh-dl">
            <div><dt>사건</dt><dd><b>{c.no}</b> {c.title}</dd></div>
            <div><dt>유형</dt><dd>{c.type}</dd></div>
            <div><dt>법원</dt><dd>{c.court} {c.division}</dd></div>
            <div><dt>담당</dt><dd>{c.lawyer}</dd></div>
            <div className="sh-wide"><dt>당사자</dt><dd>{c.parties.map((p) => <span key={p.side}>{p.side} {p.name}<small> — {p.role}</small></span>)}</dd></div>
          </dl>
        </section>
        <div className="sh-grid">
          <section className="sh-2"><h2>② 사건 요약</h2>
            <p><b>{TP.claim}</b> {c.claim} {B.summary.claimFact && <Cite s={B.summary.claimFact.src} openSrc={openSrc} />}</p>
            <p>{c.overview}</p>
            <ul>{B.summary.facts.map((f, i) => <li key={i}><Mark s={f.state} />{f.text} <Cite s={f.src} openSrc={openSrc} /></li>)}</ul>
            <p><b>{TP.stage}</b> {c.stage}</p>
          </section>
          <section className="sh-5"><h2>⑤ 최근 경과</h2>
            <p><b>직전 기일</b> {c.recent.last}</p>
            <p><b>최근 서면</b> {c.recent.filings.map((f) => T.ko(f.date) + " " + f.title).join(" · ")}</p>
            <p><b>재판부 명령 · 석명</b></p><ul>{c.recent.orders.map((o) => <li key={o}>{o}</li>)}</ul>
            <p><b>제출기한</b> {c.recent.deadlines.map((d) => d.label + " " + T.ko(d.date)).join(" · ")}</p>
          </section>
        </div>
        <section className="sh-3"><h2>③ 핵심 쟁점 <small>{B.issues.length}개</small></h2>
          <table><thead><tr><th>쟁점</th><th>{TP.sideA}</th><th>{TP.sideB}</th><th>확인되지 않은 사실</th></tr></thead>
            <tbody>{B.issues.map((i) => (
              <tr key={i.id}><th scope="row"><Mark s={i.state} />{i.title}</th>
                <td>{i.p.text}<small>근거 {ev(i.p.ev)}</small></td><td>{i.d.text}<small>근거 {ev(i.d.ev)}</small></td>
                <td>{i.unknown.length ? i.unknown.join(" · ") : "—"}</td></tr>
            ))}</tbody></table>
        </section>
        <div className="sh-grid">
          <section className="sh-4"><h2>④ 증거 · 입증</h2>
            <table><tbody>{B.evidence.map((e) => (
              <tr key={e.no} className={e.status !== "submitted" ? "is-warn" : ""}><th scope="row">{e.label}</th><td>{e.title ? e.title + " — " : ""}{e.purpose}</td><td>{e.status === "submitted" ? "제출" : "▲ " + EVST[e.status]}</td></tr>
            ))}</tbody></table>
          </section>
          <section className="sh-6"><h2>⑥ 기일 전 확인사항 <small>남은 {todo.length}건</small></h2>
            <ul className="sh-todo">{todo.map((a) => { const l = T.days(c.now, a.due); return <li key={a.id} className={l < 0 ? "is-late" : l <= 2 ? "is-soon" : ""}><i aria-hidden="true">□</i>{a.text}<small>{a.owner} · {T.ko(a.due)} {l < 0 ? "기한 경과" : "D-" + l}</small></li>; })}</ul>
          </section>
        </div>
        <section className="sh-7"><h2>⑦ 위험 · 유의 <small>미확인 {risks.length}건 · 확인 처리 {B.resolvedRisks.length}건</small></h2>
          <ul>{shown.map((r) => <li key={r.id} className={"is-" + r.sev}><b>{r.sev === "high" ? "▲ 중요" : "▲"}</b>{r.title}{r.values.length > 1 && <small>{r.values.map((v) => v.show + "(" + v.src.doc + ")").join(" / ")}</small>}</li>)}
            {risks.length > shown.length && <li className="sh-more">외 {risks.length - shown.length}건 — 작업화면 3단계에서 확인</li>}
            {!risks.length && <li>미확인 위험 없음 — 확인 처리 내역은 작업화면에 있습니다</li>}</ul>
        </section>
        <footer className="sh-8"><h2>⑧ 검토 · 승인</h2>
          <p><b>최종 갱신</b> {T.kst(B.review.at)} <b>상태</b> {T.BRIEF[B.status]} <b>검토자</b> {B.review.reviewer || "— (미승인)"}</p>
          <p><b>출처 문서</b> {B.review.sources.map((id) => id + " " + docs(id)).join(" · ")}</p>
          <p className="sh-legend"><Mark s="confirmed" /><Mark s="auto" /><Mark s="check" /> · 규칙 기반 추출 · 담당자 입력 — AI 모델 미사용 · 판결 예측 · 법률 결론을 담지 않습니다.</p>
        </footer>
      </article>
    </div>
  );
}

/* ================================================================ 프로젝트 개요 — 모든 프로젝트 공통 6항목 (두괄식 · 실제로 한 것만) */
const CASE = [
  ["01", "문제 정의", "변론기일 전에는 소장 · 답변서 · 준비서면 · 변론조서 · 증거를 다시 펼쳐 쟁점 · 증거 · 재판부 석명 · 제출기한을 확인해야 합니다. 정보가 여러 서면에 흩어져 있고, 서면마다 날짜 · 금액 · 당사자 표기가 어긋나거나 인용한 증거가 목록에 없는 경우를 사람이 직접 찾아야 합니다."],
  ["02", "개선 목표", "기일 전에 볼 정보를 A4 한 장에 우선순위대로 모으고, 문서 간 불일치 · 누락을 규칙으로 먼저 표시하며, 출처가 없는 내용은 확정하지 않고, 승인 뒤 자료가 바뀌면 다시 검토하게 하는 것."],
  ["03", "담당 역할", "개인 프로젝트로 단독 수행 — 업무 흐름 분석, 데이터 구조(사건 · 기일 · 당사자 · 쟁점 · 증거 · 문서 · 할 일 · 검토 상태 · 감사기록) 설계, 검수 규칙 8종 설계, 화면 구현, 가상 사건자료 작성, 자동화 테스트 작성. 법무법인 경국의 공식 프로젝트가 아니며 실제 사건자료를 쓰지 않았습니다."],
  ["04", "실행 내용", "문서 등록 → 날짜 · 금액 · 당사자 · 증거번호 추출(문서 · 쪽 · 문단 위치 기록) → 정합성 검수(R1–R8) → 쟁점별 증거 연결 · 확정 → 기일 준비 할 일 · 기한 관리 → 역할별 권한(작성 · 승인 · 열람)과 변호사 승인 → A4 1장 브리핑 · PDF 출력. 모든 변경은 감사기록에 남습니다."],
  ["05", "검증 및 성과", "시제품 검증 결과(실무 도입 효과 아님) — 가상 민사사건 3건에 넣어 둔 문서 불일치 · 누락 15건을 모두 검출하고 그 밖의 항목은 표시하지 않음(테스트 자료 기준), 세 사건 모두 A4 1장 PDF로 출력, 사건 선택부터 PDF 출력까지의 흐름을 Chromium · WebKit 자동 테스트로 확인. 작성 시간 단축 · 정확도 같은 실무 지표는 측정하지 않았습니다."],
  ["06", "확장 가능성", "사건 유형별 템플릿(행정 · 가사 · 형사)으로 칸과 용어를 바꿔 확장하고, 승인된 내부 환경에서는 사건관리 시스템 연동과 출처 연결을 전제로 한 선택적 요약(LLM)을 붙일 수 있습니다. 같은 구조는 여신 심사 서류 · 계약 검토 · 감사 대응처럼 여러 문서를 대조해 한 장으로 보고하는 업무에 쓸 수 있습니다."],
];
function CaseStudy() {
  return (
    <section id="tb-case" className="tb-case" aria-labelledby="tb-case-h">
      <h2 id="tb-case-h">프로젝트 개요 <small>Gyunggook Trial Brief · 법률 AX · 업무혁신 · 제품기획</small></h2>
      <p className="tb-case__lead"><b>재판 준비 업무를 한 장의 브리핑으로 구조화</b> — 사건기록과 기일 준비사항을 연결해 변호사가 핵심 쟁점 · 증거 · 미결 과제를 빠르게 확인할 수 있는 1페이지 브리핑 시스템을 설계 · 구현한 개인 프로젝트입니다.</p>
      <ol>{CASE.map(([n, t, d]) => <li key={n}><b>{n} {t}</b><p>{d}</p></li>)}</ol>
    </section>
  );
}

/* 원문 보기 — 근거 문단을 강조 */
function SrcView({ c, st, src, close }) {
  const d = docOf(c, st, src.doc);
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) ref.current.focus(); }, [src]);
  if (!d) return null;
  return (
    <aside className="tb-src no-print" role="dialog" aria-label={"원문 — " + d.title} tabIndex={-1} ref={ref} onKeyDown={(e) => { if (e.key === "Escape") close(); }}>
      <header><p><b>{d.id}</b> {d.title}<small>{d.kind} · {T.ko(d.date)} · {d.by}</small></p><button type="button" className="tb-btn tb-btn--sm tb-btn--ghost" onClick={close}>닫기</button></header>
      {d.pages.map((p) => (
        <section key={p.no}><p className="tb-pg">{p.no}쪽</p>
          {p.paras.map((t, i) => <p key={i} className={"tb-para" + (p.no === src.page && i + 1 === src.para ? " is-sel" : "")}><i>{p.no}-{i + 1}</i>{t}</p>)}
        </section>
      ))}
    </aside>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
