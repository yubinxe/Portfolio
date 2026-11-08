/* legal-ax.jsx — 법률 AX 업무체계 (Legal AX Workspace) · 개인 구현 공개 시연
 * 데이터: legal-ax-data.js(허구 사례) · 규칙: legal-ax-domain.js(순수 함수) · 상태: 이 탭의 sessionStorage 에만 — 탭을 닫으면 사라진다.
 * AI 모델을 부르지 않는다. 화면의 모든 분석은 '규칙 기반' 또는 '문서 검색 · 근거 탐색'으로 표시한다.
 * 외부 제출 · 발송 · 업로드 없음. */
const D = window.LAX_DATA, L = window.LAX;
const TASKS = [
  { k: "evidence", ko: "소송기록 분석해 보기", en: "Litigation Evidence Intelligence", m: ["RULE", "RETRIEVAL"] },
  { k: "contract", ko: "계약 변경사항 비교하기", en: "Contract Comparison", m: ["RULE"] },
  { k: "research", ko: "법령·문서 근거 탐색하기", en: "Legal Research Desk", m: ["RETRIEVAL"] },
  { k: "matter", ko: "사건 진행 현황 살펴보기", en: "Matter Operations", m: ["RULE"] },
];
const ASSIGNEES = ["담당 변호사 A(가상)", "담당 변호사 B(가상)", "담당 변호사 C(가상)", "담당 변호사 D(가상)", "담당 변호사 E(가상)", "담당 변호사 F(가상)", "담당 변호사 G(가상)", "미지정"];
const KEY = "lax.state.v1";
const caseOf = (fid) => D.cases.find((c) => c.id === D.fields.find((f) => f.id === fid).caseId);
const partyOf = (c, id) => (c.participants.find((p) => p.id === id) || {});
const docOf = (c, id) => c.documents.find((d) => d.id === id);
const evOf = (c, id) => c.evidence.find((e) => e.id === id);

function Method({ m }) {
  return <span className="lx-method">{m.map((k) => <b key={k} className={"lx-method__" + L.METHOD[k].key}>{L.METHOD[k].ko} <i lang="en">{L.METHOD[k].en}</i></b>)}</span>;
}
function StatusSelect({ value, onChange, label, id }) {
  return (
    <label className={"lx-st lx-st--" + value}>
      <span className="sr-only">{label} 검토 상태</span>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {L.STATUS.map((s) => <option key={s.key} value={s.key}>{s.ko}</option>)}
      </select>
    </label>
  );
}
function Chip({ kind, children }) { return <span className={"lx-chip lx-chip--" + kind}>{children}</span>; }

/* ---------------------------------------------------------------- 저장 — 이 탭에서만 */
function loadState() {
  const base = L.initial(D);
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) { const s = JSON.parse(raw); if (s && s.v === base.v) return Object.assign(base, s); }
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
  const c = caseOf(field), f = D.fields.find((x) => x.id === field);
  React.useEffect(() => { try { sessionStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }, [st]);
  React.useEffect(() => {
    const url = "#task=" + task + "&field=" + field;
    if (location.hash !== url) history.replaceState(null, "", url);
  }, [task, field]);
  React.useEffect(() => { const on = () => setNav(readHash()); window.addEventListener("hashchange", on); return () => window.removeEventListener("hashchange", on); }, []);
  const act = (a) => setSt((s) => L.reduce(s, Object.assign({ case: c.id }, a)));
  const go = (t, extra) => { setNav((n) => Object.assign({}, n, { task: t })); if (extra) setFocus(extra); const el = document.getElementById("lx-main"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const reset = () => { if (window.confirm("이 탭의 시연 상태와 기록을 모두 지울까요?")) { try { sessionStorage.removeItem(KEY); } catch (e) {} setSt(L.initial(D)); } };
  const T = TASKS.find((t) => t.k === task);
  return (
    <div className="lx">
      <header className="lx-top">
        <a className="lx-back" href="index.html#ax-desk">← 김유빈 포트폴리오 · 경국 AX</a>
        <p className="lx-top__state"><b>B</b> 개인 구현 · 공개 시연</p>
      </header>
      <p className="lx-notice" role="note">{D.notice} 실제 의뢰인 정보를 입력하지 마세요.</p>

      <section className="lx-hero" aria-labelledby="lx-title">
        <p className="lx-kicker">법률 AX 업무체계 <span lang="en">Legal AX Workspace</span></p>
        <h1 id="lx-title">기록을 정리하고, 쟁점을 연결하며,<br />판단의 근거를 확인합니다.</h1>
        <p className="lx-lead">가상 사건을 통해 변호사의 검토 업무가 어떻게 구조화되는지 직접 확인할 수 있습니다. 시스템은 정리 · 대조 · 검색을 돕고, 사실인정과 법률 판단은 담당 변호사가 합니다.</p>
      </section>

      <nav className="lx-tasks" aria-label="대표 업무">
        {TASKS.map((t, i) => (
          <button key={t.k} type="button" aria-pressed={t.k === task} onClick={() => go(t.k)}>
            <b>{String(i + 1).padStart(2, "0")}</b><span>{t.ko}</span><em lang="en">{t.en}</em>
          </button>
        ))}
      </nav>

      <section className="lx-field" aria-label="분야와 가상 사건">
        <div className="lx-field__bar" role="group" aria-label="분야 선택">
          {D.fields.map((x) => <button key={x.id} type="button" aria-pressed={x.id === field} onClick={() => { setNav({ task, field: x.id }); setFocus(null); }}>{x.ko}</button>)}
        </div>
        <div className="lx-case">
          <p className="lx-case__id">{c.id} · {f.ko} <span lang="en">{f.en}</span> · <em>{f.work}</em></p>
          <h2>{c.title}</h2>
          <p>{c.summary}</p>
          <ul className="lx-case__p">{c.participants.map((p) => <li key={p.id}><b>{p.role}</b>{p.name}</li>)}</ul>
        </div>
      </section>

      <main id="lx-main" className="lx-main" tabIndex={-1}>
        <div className="lx-main__head">
          <h2>{T.ko} <span lang="en">{T.en}</span></h2>
          <Method m={T.m} />
        </div>
        {task === "evidence" && <EvidenceView key={c.id} c={c} st={st} act={act} focus={focus} clearFocus={() => setFocus(null)} go={go} />}
        {task === "contract" && <ContractView key={field} f={f} st={st} act={act} />}
        {task === "research" && <ResearchView key={c.id} c={c} f={f} go={go} />}
        {task === "matter" && <MatterView key={c.id} c={c} st={st} act={act} go={go} />}
      </main>

      <details className="lx-audit">
        <summary>시연 기록 <b>{st.audit.length}</b>건 — 누가 무엇을 바꿨는지 <span>(이 탭에서만 · 가상 역할의 조작 기록이며 실제 로펌 감사기록이 아닙니다)</span></summary>
        {st.audit.length ? (
          <ol>{st.audit.map((a, i) => <li key={i}><time>{a.t.replace("T", " ").slice(0, 19)}</time><b>{a.actor}</b><span>{a.case}</span>{a.text}</li>)}</ol>
        ) : <p>아직 바꾼 것이 없습니다. 검토 상태를 바꾸면 여기에 남습니다.</p>}
        <button type="button" className="lx-btn lx-btn--ghost" onClick={reset}>시연 상태 초기화</button>
      </details>

      <footer className="lx-foot">
        <p><b>처리 방식</b> 이 시연에는 AI 모델 호출이 없습니다. <b className="lx-method__rule">규칙 기반 분석</b>은 정렬 · 타임라인 · 문자 비교 · 정해진 규칙의 충족 여부만, <b className="lx-method__retrieval">문서 검색 · 근거 탐색</b>은 이 화면에 색인된 예시자료만 다룹니다.</p>
        <p><b>저장</b> 검토 상태와 메모는 이 브라우저 탭(sessionStorage)에만 남고 탭을 닫으면 삭제됩니다. 서버로 보내지 않으며, 파일 업로드 · 외부 제출 · 메일 발송 기능은 없습니다.</p>
        <p><b>법령</b> 예시 원문은 작성 시점 텍스트입니다. 인용 전에는 반드시 국가법령정보센터 원문을 확인하세요. 판례 번호와 판시사항은 만들지 않았습니다.</p>
        <p className="lx-foot__by">설계 · 구현 김유빈 — 법무법인 경국의 사내 시스템을 공개한 것이 아닙니다. <a href="index.html#ax-desk">포트폴리오로 돌아가기</a></p>
      </footer>
    </div>
  );
}

/* ================================================================ A — 송무기록 · 증거 분석 */
function EvidenceView({ c, st, act, focus, clearFocus, go }) {
  const [type, setType] = React.useState("all");
  const [q, setQ] = React.useState("");
  const [sel, setSel] = React.useState(() => ({ doc: (focus && focus.doc) || c.documents[0].id, para: (focus && focus.para) || 0 }));
  const [claim, setClaim] = React.useState(null);
  const [step, setStep] = React.useState(0);
  const [graph, setGraph] = React.useState(false);
  const viewer = React.useRef(null);
  React.useEffect(() => { if (focus) { setSel({ doc: focus.doc, para: focus.para }); setStep(2); clearFocus(); } }, []);
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
  const hotEv = new Set(claim ? (c.claims.find((x) => x.id === claim).evidence) : []);
  const open = (evId) => { const e = evOf(c, evId); setSel({ doc: e.doc, para: e.loc.para }); setStep(2); };
  const k = (x) => c.id + "/" + x;
  const docStatus = (d) => st.evidence[k("doc/" + d.id)] || "unreviewed";
  const evCited = (d) => c.evidence.filter((e) => e.doc === d.id);
  const final = !!st.finals[c.id], canFinal = L.canFinalize(c, st.issues ? st : st);

  const Docs = (
    <div className="lx-col lx-col--docs">
      <h3>사건 문서 <span>{docs.length} / {c.documents.length}</span></h3>
      <div className="lx-filter">
        <label><span className="sr-only">문서 종류</span><select value={type} onChange={(e) => setType(e.target.value)}>{types.map((t) => <option key={t} value={t}>{t === "all" ? "모든 종류" : t}</option>)}</select></label>
        <label><span className="sr-only">문서 검색</span><input type="search" value={q} placeholder="문서 검색" onChange={(e) => setQ(e.target.value)} /></label>
      </div>
      {docs.length ? (
        <ul className="lx-docs">
          {docs.map((d) => (
            <li key={d.id}>
              <button type="button" aria-current={d.id === sel.doc ? "true" : undefined} onClick={() => { setSel({ doc: d.id, para: 0 }); setStep(2); }}>
                <span className="lx-docs__t"><b>{d.id}</b>{d.title}</span>
                <span className="lx-docs__m">{d.type} · {d.date} · {partyOf(c, d.by).role}</span>
                <Chip kind={docStatus(d)}>{L.label(docStatus(d))}</Chip>
              </button>
            </li>
          ))}
        </ul>
      ) : <p className="lx-empty">조건에 맞는 문서가 없습니다.</p>}
    </div>
  );

  const Facts = (
    <div className="lx-col lx-col--facts">
      <h3>사건의 흐름 <span>시간순 · <Method m={["RULE"]} /></span></h3>
      <ol className="lx-tl">
        {L.timeline(c).map((e) => {
          const on = e.evidence.some((x) => hotEv.has(x));
          return (
            <li key={e.id} className={on ? "is-hot" : ""}>
              <time>{e.date}</time>
              <span>{e.label}</span>
              {e.evidence.map((x) => <button key={x} type="button" className="lx-src" onClick={() => open(x)}>원문 {evOf(c, x).doc} ¶{evOf(c, x).loc.para}</button>)}
            </li>
          );
        })}
      </ol>

      <h3>쟁점별 주장과 증거 <span><Method m={["RULE", "RETRIEVAL"]} /></span></h3>
      {c.issues.map((iss) => (
        <div key={iss.id} className="lx-issue">
          <h4>{iss.id} · {iss.title}</h4>
          {c.claims.filter((cl) => cl.issue === iss.id).map((cl) => {
            const ck = checkOf(cl.id);
            return (
              <article key={cl.id} className={"lx-claim" + (claim === cl.id ? " is-on" : "")} onMouseEnter={() => setClaim(cl.id)}>
                <button type="button" className="lx-claim__head" aria-pressed={claim === cl.id} onClick={() => setClaim(claim === cl.id ? null : cl.id)}>
                  <b>{partyOf(c, cl.party).role}</b><span>“{cl.text}”</span>
                </button>
                <p className="lx-claim__chips"><Chip kind={"v-" + cl.verification}>{L.VERIFY[cl.verification]}</Chip>{ck && <Chip kind={"c-" + ck.state}>{ck.ko}</Chip>}</p>
                {ck && ck.hits && <ul className="lx-hits">{ck.hits.map((h, i) => <li key={i}>주장: <b>{String(h.claimed)}</b> · 자료({evOf(c, h.evidence).doc}): <b>{String(h.recorded)}</b> <button type="button" className="lx-src" onClick={() => open(h.evidence)}>원문 보기</button></li>)}</ul>}
                <ul className="lx-evs">
                  {cl.evidence.map((x) => { const e = evOf(c, x); return <li key={x}><button type="button" className="lx-src" onClick={() => open(x)}>{e.doc} ¶{e.loc.para}</button>{e.summary}</li>; })}
                </ul>
              </article>
            );
          })}
        </div>
      ))}
      <p className="lx-rule">대조 규칙: 같은 쟁점에 묶인 자료에 적힌 사실(날짜 · 상태 등)과 주장한 사실이 다르면 ‘추가 검토 필요’로 표시합니다. 진술의 진위나 사실인정은 판단하지 않습니다.</p>
      <button type="button" className="lx-btn lx-btn--ghost" aria-expanded={graph} onClick={() => setGraph(!graph)}>{graph ? "관계 그래프 닫기" : "증거 관계 그래프 열기"}</button>
      {graph && <EvidenceGraph c={c} claim={claim} setClaim={setClaim} open={open} sel={sel} openDoc={(d) => { setSel({ doc: d, para: 0 }); setStep(2); }} />}
    </div>
  );

  const Review = (
    <div className="lx-col lx-col--review">
      <div className="lx-viewer" ref={viewer} aria-live="polite">
        <h3>원문 근거 <span>{doc.id} · {doc.type}</span></h3>
        <p className="lx-viewer__t">{doc.title}<small>{doc.date} · 작성 {partyOf(c, doc.by).role} · 인용 증거 {evCited(doc).length}건</small></p>
        <div className="lx-viewer__body">
          {doc.paras.map((p, i) => {
            const n = i + 1, cited = c.evidence.filter((e) => e.doc === doc.id && e.loc.para === n);
            return (
              <p key={n} data-para={n} className={(sel.para === n ? "is-sel " : "") + (cited.some((e) => hotEv.has(e.id)) ? "is-hot" : "")}>
                <b>¶{n}</b>{p}{cited.length > 0 && <em>{cited.map((e) => e.id).join(" · ")}</em>}
              </p>
            );
          })}
        </div>
        <div className="lx-viewer__st"><span>문서 검토 상태</span><StatusSelect value={docStatus(doc)} label={doc.title} onChange={(v) => act({ type: "evidence", key: k("doc/" + doc.id), value: v, label: doc.id + " " + doc.title })} /></div>
      </div>

      <div className="lx-review">
        <h3>변호사 검토 <span>시연 — 가상 역할</span></h3>
        <ul className="lx-review__list">
          {c.issues.map((i) => (
            <li key={i.id}><span><b>{i.id}</b>{i.title}</span><StatusSelect value={st.issues[k(i.id)]} label={i.title} onChange={(v) => act({ type: "status", key: k(i.id), value: v, label: "쟁점 " + i.id })} /></li>
          ))}
        </ul>
        <h4>추가 확인 필요 항목</h4>
        <ul className="lx-review__list lx-review__list--tasks">
          {c.tasks.map((t) => (
            <li key={t.id}><span>{t.text}</span><StatusSelect value={st.issues[k(t.id)]} label={t.text} onChange={(v) => act({ type: "status", key: k(t.id), value: v, label: "확인 과제 " + t.id })} /></li>
          ))}
        </ul>
        <NoteBox k={k("note")} st={st} act={act} label="검토 메모" />
        <h4>근거 문서 목록</h4>
        <ul className="lx-review__docs">{c.documents.map((d) => <li key={d.id}><button type="button" className="lx-src" onClick={() => setSel({ doc: d.id, para: 0 })}>{d.id}</button>{d.title}<Chip kind={docStatus(d)}>{L.label(docStatus(d))}</Chip></li>)}</ul>
        <label className={"lx-final" + (canFinal ? "" : " is-off")}>
          <input type="checkbox" checked={final} disabled={!canFinal && !final} onChange={(e) => act({ type: "final", key: c.id, value: e.target.checked, label: c.id })} />
          <span>최종 확인(시연) — 모든 쟁점이 ‘검토 완료’ 이상일 때 표시할 수 있습니다.{!canFinal && " 아직 검토 중인 쟁점이 있습니다."}</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="lx-ev" data-step={step}>
      <ol className="lx-steps" aria-label="단계">
        {["사건 개요", "사건의 흐름", "원문 근거", "검토 패널"].map((s, i) => <li key={s}><button type="button" aria-pressed={step === i} onClick={() => setStep(i)}><b>{i + 1}</b>{s}</button></li>)}
      </ol>
      <div className="lx-ev__grid">
        <div className="lx-ev__s lx-ev__s--0">{Docs}</div>
        <div className="lx-ev__s lx-ev__s--1">{Facts}</div>
        <div className="lx-ev__s lx-ev__s--2">{Review}</div>
      </div>
    </div>
  );
}

function NoteBox({ k, st, act, label }) {
  const [v, setV] = React.useState(st.notes[k] || "");
  const saved = (st.notes[k] || "") === v;
  return (
    <div className="lx-note">
      <label htmlFor={"n-" + k}>{label} <small>실제 의뢰인 정보를 적지 마세요 · 600자</small></label>
      <textarea id={"n-" + k} value={v} maxLength={600} rows={3} onChange={(e) => setV(e.target.value)} />
      <button type="button" className="lx-btn" disabled={saved} onClick={() => act({ type: "note", key: k, value: v, label })}>{saved ? "저장됨" : "메모 저장"}</button>
    </div>
  );
}

/* 증거 관계 그래프 — 주장 · 증거 · 문서를 세 줄로 놓고 선으로 잇는다. 노드를 누르면 그 원문으로 */
function EvidenceGraph({ c, claim, setClaim, open, openDoc, sel }) {
  const W = 640, rowH = 46, cols = [92, 320, 548];
  const n = Math.max(c.claims.length, c.evidence.length, c.documents.length);
  const H = n * rowH + 40;
  const y = (i, len) => 30 + (i + 0.5) * ((H - 40) / len);
  const cy = {}, ey = {}, dy = {};
  c.claims.forEach((x, i) => (cy[x.id] = y(i, c.claims.length)));
  c.evidence.forEach((x, i) => (ey[x.id] = y(i, c.evidence.length)));
  c.documents.forEach((x, i) => (dy[x.id] = y(i, c.documents.length)));
  const hot = claim ? new Set(c.claims.find((x) => x.id === claim).evidence) : null;
  const node = (x, yy, label, cls, onAct, title) => (
    <g className={"lx-g__n " + cls} transform={`translate(${x},${yy})`} role="button" tabIndex={0} aria-label={title}
      onClick={onAct} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onAct(); } }}>
      <rect x="-84" y="-15" width="168" height="30" rx="2" /><text textAnchor="middle" dy="4">{label}</text>
    </g>
  );
  const short = (s, m) => (s.length > m ? s.slice(0, m - 1) + "…" : s);
  return (
    <figure className="lx-graph">
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label="주장 · 증거 · 문서 관계 그래프">
        <text x={cols[0]} y="14" textAnchor="middle" className="lx-g__h">주장</text>
        <text x={cols[1]} y="14" textAnchor="middle" className="lx-g__h">증거</text>
        <text x={cols[2]} y="14" textAnchor="middle" className="lx-g__h">문서</text>
        {c.claims.map((cl) => cl.evidence.map((x) => <line key={cl.id + x} x1={cols[0] + 84} y1={cy[cl.id]} x2={cols[1] - 84} y2={ey[x]} className={claim === cl.id ? "is-hot" : ""} />))}
        {c.evidence.map((e) => <line key={e.id + "d"} x1={cols[1] + 84} y1={ey[e.id]} x2={cols[2] - 84} y2={dy[e.doc]} className={hot && hot.has(e.id) ? "is-hot" : ""} />)}
        {c.claims.map((cl) => node(cols[0], cy[cl.id], short(partyOf(c, cl.party).role.split(" ")[0] + " · " + cl.text, 13), "lx-g__c" + (claim === cl.id ? " is-on" : ""), () => setClaim(claim === cl.id ? null : cl.id), "주장 " + cl.text))}
        {c.evidence.map((e) => node(cols[1], ey[e.id], short(e.id + " · " + e.summary, 14), "lx-g__e" + (hot && hot.has(e.id) ? " is-on" : ""), () => open(e.id), "증거 " + e.summary + " — 원문으로 이동"))}
        {c.documents.map((d) => node(cols[2], dy[d.id], short(d.id + " · " + d.title, 13), "lx-g__d" + (sel.doc === d.id ? " is-on" : ""), () => openDoc(d.id), "문서 " + d.title + " 열기"))}
      </svg>
      <figcaption>노드를 누르면 해당 주장 · 증거의 원문으로 이동합니다. 선은 데이터에 기록된 연결만 그립니다.</figcaption>
    </figure>
  );
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
  const jump = (key) => { setSel(key); const el = document.getElementById("cl-" + key); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); };
  return (
    <div className="lx-ct">
      <div className="lx-ct__bar">
        <label>계약 유형
          <select value={cid} onChange={(e) => { setCid(e.target.value); setSel(null); }}>{opts.map((o) => <option key={o.id} value={o.id}>{o.ko} ({o.en})</option>)}</select>
        </label>
        <p className="lx-ct__v"><span>변경 전 <b>{K.v1}</b></span><span>변경 후 <b>{K.v2}</b></span><span>당사자 {K.parties}</span></p>
      </div>
      <div className="lx-ct__filters" role="group" aria-label="보기 필터">
        {[["changed", "바뀐 조항"], ["important", "중요 조항만"], ["all", "전체 조항"]].map(([k2, t]) => <button key={k2} type="button" aria-pressed={show === k2} onClick={() => setShow(k2)}>{t}</button>)}
        <span className="lx-ct__sep" />
        {Object.keys(counts).map((o) => (
          <label key={o} className={"lx-op lx-op--" + o}><input type="checkbox" checked={ops[o]} onChange={(e) => setOps(Object.assign({}, ops, { [o]: e.target.checked }))} />{OPK[o]} {counts[o]}</label>
        ))}
      </div>
      <p className="lx-rule">비교 방식: 조항(번호 · 제목)으로 두 버전을 맞추고 낱말 단위로 비교합니다. ‘중요 조항’은 조항 분류(대금 · 기간 · 해지 · 손해배상 · 책임 · 비밀유지 · 관할)와 숫자 · 부담 주체 변경 규칙에 걸렸다는 뜻이며, 법적 위험도나 유불리를 계산한 결과가 아닙니다.</p>
      <ChangeSummary rows={rows} jump={jump} OPK={OPK} />
      <div className="lx-ct__grid">
        <nav className="lx-ct__nav" aria-label="조항 이동">
          {rows.map((r) => <button key={r.key} type="button" className={"lx-op--" + r.op} aria-current={sel === r.key ? "true" : undefined} onClick={() => jump(r.key)}>{(r.after || r.before).no} {(r.after || r.before).title}<i>{OPK[r.op]}</i></button>)}
        </nav>
        <div className="lx-ct__rows">
          <div className="lx-ct__head" aria-hidden="true"><span>변경 전</span><span>변경 후</span></div>
          {list.length ? list.map((r) => (
            <article key={r.key} id={"cl-" + r.key} className={"lx-cl lx-cl--" + r.op + (sel === r.key ? " is-on" : "")}>
              <button type="button" className="lx-cl__hit" onClick={() => setSel(r.key)} aria-pressed={sel === r.key}>
                <span className="lx-cl__t">{(r.after || r.before).no} {(r.after || r.before).title} <Chip kind={"op-" + r.op}>{OPK[r.op]}</Chip>{r.important && <Chip kind="imp">특별 검토 항목</Chip>}<Chip kind={st.clauses[ck(r.key)] || "unreviewed"}>{L.label(st.clauses[ck(r.key)] || "unreviewed")}</Chip></span>
                <span className="lx-cl__a">{r.before ? r.parts.filter((p) => p.op !== "add").map((p, i) => <span key={i} className={"lx-d--" + p.op}>{p.t}</span>) : <i>— 없음</i>}</span>
                <span className="lx-cl__b">{r.after ? r.parts.filter((p) => p.op !== "del").map((p, i) => <span key={i} className={"lx-d--" + p.op}>{p.t}</span>) : <i>— 삭제됨</i>}</span>
              </button>
            </article>
          )) : <p className="lx-empty">필터에 맞는 조항이 없습니다.</p>}
        </div>
        <aside className="lx-ct__side" aria-live="polite">
          {cur ? (
            <React.Fragment>
              <h3>{(cur.after || cur.before).no} {(cur.after || cur.before).title}</h3>
              <h4>변경 근거 — 걸린 규칙</h4>
              {cur.flags.length ? <ul className="lx-flags">{cur.flags.map((x) => <li key={x.rule}><code>{x.rule}</code>{x.ko}</li>)}</ul> : <p className="lx-empty">걸린 규칙 없음</p>}
              <h4>원문</h4>
              <p className="lx-ct__orig"><b>변경 전</b>{cur.before ? cur.before.text : "— 없음"}</p>
              <p className="lx-ct__orig"><b>변경 후</b>{cur.after ? cur.after.text : "— 삭제됨"}</p>
              <div className="lx-viewer__st"><span>검토 상태</span><StatusSelect value={st.clauses[ck(cur.key)] || "unreviewed"} label={(cur.after || cur.before).title}
                onChange={(v) => act({ type: "clause", key: ck(cur.key), value: v, label: K.ko + " " + (cur.after || cur.before).no })} /></div>
              <ClauseNote k={ck(cur.key)} st={st} act={act} label={K.ko + " " + (cur.after || cur.before).no} />
              <p className="lx-note-sm">계약상 유불리와 법적 위험은 다른 개념입니다. 이 비교는 어디가 바뀌었는지만 보여 줍니다.</p>
            </React.Fragment>
          ) : <p className="lx-empty">조항을 누르면 바뀐 부분 · 걸린 규칙 · 원문 · 검토 상태가 여기에 나옵니다.</p>}
        </aside>
      </div>
    </div>
  );
}
function ClauseNote({ k, st, act, label }) {
  const [v, setV] = React.useState(st.clauseNotes[k] || "");
  React.useEffect(() => setV(st.clauseNotes[k] || ""), [k]);
  const saved = (st.clauseNotes[k] || "") === v;
  return (
    <div className="lx-note">
      <label htmlFor={"cn-" + k}>검토 메모</label>
      <textarea id={"cn-" + k} value={v} maxLength={600} rows={3} onChange={(e) => setV(e.target.value)} />
      <button type="button" className="lx-btn" disabled={saved} onClick={() => act({ type: "clauseNote", key: k, value: v, label })}>{saved ? "저장됨" : "메모 저장"}</button>
    </div>
  );
}
/* 변경 요약 — 두 버전 문서의 바뀐 조항만 한 줄씩(건물 그림 대신 문서 비교가 중심). 누르면 그 조항으로 */
function ChangeSummary({ rows, jump, OPK }) {
  const ch = rows.filter((r) => r.op !== "same");
  return (
    <section className="lx-sum" aria-label="변경 요약">
      <h3>변경 요약 <span>바뀐 조항 {ch.length}건 · 특별 검토 항목 {ch.filter((r) => r.important).length}건 · 같은 조항 {rows.length - ch.length}건</span></h3>
      <ol>
        {ch.map((r) => {
          const t = r.after || r.before;
          return (
            <li key={r.key}><button type="button" onClick={() => jump(r.key)}>
              <b>{t.no} {t.title}</b><Chip kind={"op-" + r.op}>{OPK[r.op]}</Chip>
              <span className="lx-sum__ba"><s>{r.before ? r.before.text : "— 없음"}</s><i aria-hidden="true">→</i><em>{r.after ? r.after.text : "— 삭제됨"}</em></span>
              {r.flags.length > 0 && <small>{r.flags.map((f) => f.ko).join(" · ")}</small>}
            </button></li>
          );
        })}
      </ol>
    </section>
  );
}

/* ================================================================ C — 법률 리서치 · 근거 확인 */
function ResearchView({ c, f, go }) {
  const [q, setQ] = React.useState("");
  const [type, setType] = React.useState("all");
  const [pick, setPick] = React.useState(c.research[0] ? "source:" + c.research[0] : null);
  const res = q ? L.search(D, q, type, c) : (c.research.map((id) => ({ kind: "source", id, s: D.sources.find((s) => s.id === id) })).filter((r) => type === "all" || r.s.type === type));
  const cur = pick && pick.startsWith("source:") ? D.sources.find((s) => s.id === pick.slice(7)) : null;
  const curDoc = pick && pick.startsWith("doc:") ? res.find((r) => r.kind === "doc" && "doc:" + r.id === pick) : null;
  return (
    <div className="lx-rs">
      <div className="lx-rs__bar">
        <label className="lx-rs__q"><span className="sr-only">검색어</span><input type="search" value={q} placeholder="예: 기간 · 도급 · 행정심판 · 재산분할" onChange={(e) => setQ(e.target.value)} /></label>
        <label><span className="sr-only">자료 유형</span><select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">모든 자료</option><option value="law">법령</option><option value="precedent">판례(안내)</option><option value="doc">이 사건 문서</option>
        </select></label>
        <Chip kind="demo">예시자료 검색 — 실시간 법률 검색 아님</Chip>
      </div>
      <div className="lx-rs__grid">
        <div className="lx-rs__list">
          <h3>{q ? "검색 결과" : "이 사건과 관련된 자료"} <span>{res.length}건</span></h3>
          {res.length ? (
            <ul>
              {res.map((r) => r.kind === "source" ? (
                <li key={r.id}><button type="button" aria-current={pick === "source:" + r.id ? "true" : undefined} onClick={() => setPick("source:" + r.id)}>
                  <b>{r.s.law} {r.s.article}</b><span>{r.s.title}</span>
                  <Chip kind={r.s.verbatim ? "verb" : "unk"}>{r.s.verbatim ? "원문 수록 · 대조 필요" : "출처 확인 필요"}</Chip>
                </button></li>
              ) : (
                <li key={r.id}><button type="button" aria-current={pick === "doc:" + r.id ? "true" : undefined} onClick={() => setPick("doc:" + r.id)}>
                  <b>사건 문서 {r.doc.id} ¶{r.para}</b><span>{r.doc.title}</span><Chip kind="demo">가상 자료</Chip>
                </button></li>
              ))}
            </ul>
          ) : <p className="lx-empty">검색 결과 없음 — 이 시연에 색인된 예시자료에서 찾지 못했습니다.</p>}
        </div>
        <article className="lx-rs__detail" aria-live="polite">
          {cur ? (
            <React.Fragment>
              <p className="lx-rs__org">{cur.org} · <Chip kind={cur.verbatim ? "verb" : "unk"}>{cur.verbatim ? "작성 시점 원문" : "원문 미수록"}</Chip></p>
              <h3>{cur.law} {cur.article} <span>{cur.title}</span></h3>
              <p className="lx-rs__asof">{cur.asOf}</p>
              <h4>원문 <small>근거</small></h4>
              {cur.text.length ? <div className="lx-rs__text">{cur.text.map((t, i) => <p key={i} id={"src-" + cur.id + "-" + (i + 1)}><b>¶{i + 1}</b>{t}</p>)}</div>
                : <p className="lx-empty">이 시연에는 원문을 싣지 않았습니다 — 출처 확인 필요. 아래 공식 링크에서 원문을 확인하세요.</p>}
              <h4>요약 <small>작성자 정리 · 원문 아님</small></h4>
              <p className="lx-rs__sum">{cur.summary}</p>
              <a className="lx-btn" href={cur.url} target="_blank" rel="noreferrer">{cur.type === "precedent" ? "대법원 종합법률정보에서 검색" : "국가법령정보센터 원문 열기"} ↗</a>
            </React.Fragment>
          ) : curDoc ? (
            <React.Fragment>
              <p className="lx-rs__org">가상 사건 문서 · {c.id}</p>
              <h3>{curDoc.doc.title} <span>¶{curDoc.para}</span></h3>
              <div className="lx-rs__text"><p><b>¶{curDoc.para}</b>{curDoc.text}</p></div>
              <button type="button" className="lx-btn" onClick={() => go("evidence", { doc: curDoc.doc.id, para: curDoc.para })}>사건 기록에서 이 문단 열기</button>
            </React.Fragment>
          ) : <p className="lx-empty">왼쪽에서 자료를 고르면 원문 · 기준 · 출처가 여기에 나옵니다.</p>}
        </article>
      </div>
      <section className="lx-mk" aria-labelledby="lx-mk-t">
        <h3 id="lx-mk-t">관련 법률시장 정보 <span lang="en">Legal Market</span></h3>
        <ol className="lx-mk__flow">{D.market.flow.map((x, i) => <li key={x}><b>{i + 1}</b>{x}</li>)}</ol>
        <p>{f.ko} 분야와 이어지는 흐름: <b>{(D.market.areas.find((a) => a[0] === f.id) || [])[1]}</b></p>
        <p className="lx-note-sm">{D.market.cadence} 원문으로 확인되지 않은 시장 규모 · 성장률은 싣지 않습니다.</p>
        <a className="lx-btn lx-btn--ghost" href={D.market.url} target="_blank" rel="noreferrer">관련 법률시장 정보 살펴보기 — {D.market.service} ↗</a>
      </section>
    </div>
  );
}

/* ================================================================ D — 사건 접수 · 진행 관리 */
function MatterView({ c, st, act, go }) {
  const m = st.matters[c.id];
  const stages = D.stages;
  const missing = c.matter.docs.filter((d, i) => !m.docs[i]).length;
  const k = (x) => c.id + "/" + x;
  const cnt = (v) => c.issues.filter((i) => st.issues[k(i.id)] === v).length;
  const hist = st.audit.filter((a) => a.case === c.id);
  return (
    <div className="lx-mt">
      <ol className="lx-mt__stages" aria-label="사건 단계">
        {stages.map((s, i) => <li key={s} className={i < m.stage ? "is-done" : i === m.stage ? "is-cur" : ""}><b>{i + 1}</b>{s}</li>)}
      </ol>
      <div className="lx-mt__ctl">
        <button type="button" className="lx-btn lx-btn--ghost" disabled={m.stage === 0} onClick={() => act({ type: "stage", key: c.id, value: m.stage - 1, stageName: stages[m.stage - 1] })}>← 이전 단계</button>
        <span>현재 <b>{stages[m.stage]}</b></span>
        <button type="button" className="lx-btn" disabled={m.stage === 6} onClick={() => act({ type: "stage", key: c.id, value: m.stage + 1, stageName: stages[m.stage + 1] })}>다음 단계 →</button>
      </div>
      <div className="lx-mt__grid">
        <section className="lx-card">
          <h3>상담 요지 <span>가상</span></h3>
          <p>{c.summary}</p>
          <label className="lx-mt__as">담당자
            <select value={m.assignee} onChange={(e) => act({ type: "assignee", key: c.id, value: e.target.value })}>{ASSIGNEES.map((a) => <option key={a}>{a}</option>)}</select>
          </label>
          <div className="lx-mt__conf">
            <p><b>이해충돌 검토</b> 시스템은 자동으로 판정하지 않습니다. 담당자가 확인한 뒤에만 표시합니다.</p>
            <button type="button" className={"lx-btn" + (m.conflict === "reviewed" ? " lx-btn--ghost" : "")} onClick={() => act({ type: "conflict", key: c.id, value: m.conflict === "reviewed" ? "needs_check" : "reviewed" })}>
              {m.conflict === "reviewed" ? "담당자 확인 표시됨 — 되돌리기" : "검토 필요 — 담당자 확인 표시"}</button>
          </div>
        </section>
        <section className="lx-card">
          <h3>필요 서류 <span>{missing ? "누락 " + missing + "건" : "모두 보유"}</span></h3>
          <ul className="lx-mt__docs">
            {c.matter.docs.map((d, i) => (
              <li key={d[0]}><label><input type="checkbox" checked={m.docs[i]} onChange={(e) => act({ type: "doc", key: c.id, index: i, value: e.target.checked, label: d[0] })} />{d[0]}<Chip kind={m.docs[i] ? "reviewed" : "needs_check"}>{m.docs[i] ? "보유" : "누락"}</Chip></label></li>
            ))}
          </ul>
        </section>
        <section className="lx-card lx-card--wide">
          <h3>기일 · 마감 <span><Method m={["RULE"]} /></span></h3>
          <p className="lx-warn">시연용 일정 — 법정기간은 담당 변호사의 별도 확인이 필요합니다.</p>
          {c.matter.deadlines.length ? (
            <ul className="lx-dl">
              {c.matter.deadlines.map((dl) => {
                const r = L.deadline(dl.base, dl.days), ok = !!m.deadlineChecked[dl.id];
                return (
                  <li key={dl.id}>
                    <p className="lx-dl__t"><b>{dl.label}</b><Chip kind="unk">{dl.kind}</Chip></p>
                    <p className="lx-dl__d">기산점 후보 <b>{dl.base}</b> + {dl.days}일 → 단순 계산 <b>{r.date}</b></p>
                    <ul className="lx-dl__n">{r.notes.map((n) => <li key={n}>{n}</li>)}<li>{dl.note}</li></ul>
                    <p className="lx-dl__b">참고 규정 {dl.basis.map((b) => { const s = D.sources.find((x) => x.id === b); return <button key={b} type="button" className="lx-src" onClick={() => go("research")}>{s.law} {s.article}</button>; })}</p>
                    <label className="lx-dl__ok"><input type="checkbox" checked={ok} onChange={(e) => act({ type: "deadline", key: c.id, id: dl.id, value: e.target.checked, label: dl.label })} />기산점 · 기간의 종류 · 휴일을 담당 변호사가 확인함(시연)</label>
                  </li>
                );
              })}
            </ul>
          ) : <p className="lx-empty">이 가상 사건에는 계산할 기한 후보가 없습니다.</p>}
        </section>
        <section className="lx-card">
          <h3>검토 현황 <span>소송기록 분석과 연결</span></h3>
          <ul className="lx-mt__sum">
            {L.STATUS.map((s) => <li key={s.key}><Chip kind={s.key}>{s.ko}</Chip><b>{cnt(s.key)}</b>건</li>)}
          </ul>
          <p>최종 확인(시연): <b>{st.finals[c.id] ? "표시됨" : "아직"}</b></p>
          <button type="button" className="lx-btn lx-btn--ghost" onClick={() => go("evidence")}>쟁점 검토하러 가기</button>
        </section>
        <section className="lx-card">
          <h3>외부 제출 <span>차단됨</span></h3>
          <button type="button" className="lx-btn" disabled aria-disabled="true">전자소송 제출 · 메일 발송</button>
          <p className="lx-note-sm">공개 시연에서는 실제 법원 제출 · 전자소송 · 메일 · 알림 발송 기능을 구현하지 않았습니다.</p>
        </section>
        <section className="lx-card lx-card--wide">
          <h3>진행 이력 <span>{hist.length}건 · 이 탭에서만</span></h3>
          {hist.length ? <ol className="lx-mt__hist">{hist.map((a, i) => <li key={i}><time>{a.t.slice(11, 19)}</time>{a.text}</li>)}</ol> : <p className="lx-empty">아직 이 사건에서 바꾼 것이 없습니다.</p>}
        </section>
      </div>
    </div>
  );
}

const rootEl = document.getElementById("lx-root");
ReactDOM.createRoot(rootEl).render(<App />);
