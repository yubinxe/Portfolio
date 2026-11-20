import { useMemo, useState } from "react";
import { Shell, Tabs } from "../shared/Shell";
import { CODE_INFO, DEMO_NOW, GROUND_MIN, INTENT_KO, type Hit, type Risk, type Triage, send, triage } from "./engine";
import { runTriageBench } from "./eval";
import { POLICIES } from "./policies";
import { TICKETS } from "./tickets";

const RISK_CLS: Record<Risk, string> = { LOW: "st--ok", MED: "st--warn", HIGH: "st--bad" };
const RiskB = ({ r }: { r: Risk }) => <span className={"st " + RISK_CLS[r]}>{r}</span>;
const hhmm = (m: number) => (m < 0 ? "-" : "") + `${Math.floor(Math.abs(m) / 60)}:${String(Math.abs(m) % 60).padStart(2, "0")}`;

function Marked({ text, hits }: { text: string; hits: Hit[] }) {
  const words = [...new Set(hits.map((h) => h.word))].sort((a, b) => b.length - a.length);
  if (!words.length) return <>{text}</>;
  const re = new RegExp("(" + words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")", "g");
  return <>{text.split(re).map((p, i) => { const h = hits.find((x) => x.word === p && x.kind === "risk") || hits.find((x) => x.word === p); return h ? <mark key={i} className={"ot-m ot-m--" + h.kind}>{p}</mark> : <span key={i}>{p}</span>; })}</>;
}

type State = { kind: "sent"; log: string } | { kind: "pending" } | undefined;

export default function App() {
  const [tab, setTab] = useState<"console" | "eval" | "policy">(() => (location.hash === "#eval" ? "eval" : "console"));
  const [sel, setSel] = useState(TICKETS[8].id);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [states, setStates] = useState<Record<string, State>>({});
  const [riskF, setRiskF] = useState<Risk | "ALL">("ALL");
  const all = useMemo(() => TICKETS.map((t) => triage(t, undefined, drafts[t.id])), [drafts]);
  const cur = all.find((x) => x.ticket.id === sel)!;
  const counts = { LOW: 0, MED: 0, HIGH: 0 } as Record<Risk, number>;
  all.forEach((x) => counts[x.risk]++);

  return (
    <Shell app="ops-triage" title="언제 AI 의 자동 발송을 멈추고 사람에게 넘기는가"
      question="인바운드 요청을 의도 · 긴급도 · 위험 등급으로 나누고, 사내 정책 조항 ID 를 인용한 회신 초안을 만듭니다. 고위험 · 근거 미달이면 자동 발송 단추가 코드로 잠기고 승인 대기로 격리됩니다."
      right={<EvalBadges />}>
      <Tabs label="Ops Triage 화면" value={tab} onChange={setTab} tabs={[["console", "트리아지 콘솔"], ["eval", "Policy & Guardrail Eval"], ["policy", "정책 문서 5종"]]} />
      {tab === "eval" ? <Eval onOpen={(id) => { setSel(id); setTab("console"); }} /> : tab === "policy" ? <Policies cites={cur.draft.cites} /> : (
        <div className="ot">
          <section className="pn ot-q" aria-label="인바운드 큐">
            <h2 className="pn__h">인바운드 큐 <small>시연 기준 {DEMO_NOW.replace("T", " ")}</small></h2>
            <div className="ot-f" role="group" aria-label="위험 등급으로 거르기">
              {(["ALL", "HIGH", "MED", "LOW"] as const).map((r) => <button key={r} type="button" aria-pressed={riskF === r} onClick={() => setRiskF(r)}>{r === "ALL" ? `전체 ${all.length}` : <><RiskB r={r} /> {counts[r]}</>}</button>)}
            </div>
            <ol className="ot-list">
              {all.filter((x) => riskF === "ALL" || x.risk === riskF).sort((a, b) => a.minutesLeft - b.minutesLeft).map((x) => {
                const st = states[x.ticket.id];
                return (
                  <li key={x.ticket.id}>
                    <button type="button" aria-pressed={x.ticket.id === sel} onClick={() => setSel(x.ticket.id)}>
                      <span className="ot-l1"><b className="num">{x.ticket.id}</b><RiskB r={x.risk} /><span className="st st--muted">{x.urgency}</span><span className={"ot-sla num" + (x.minutesLeft < 60 ? " is-late" : "")} title="SLA 남은 시간">{hhmm(x.minutesLeft)}</span></span>
                      <span className="ot-l2">{x.ticket.subject}</span>
                      <span className="ot-l3">{x.ticket.channel} · {x.ticket.from} · {st?.kind === "sent" ? "발송됨(시뮬레이션)" : st?.kind === "pending" || x.blocked ? "승인 대기" : "자동 발송 가능"}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
          <Work key={cur.ticket.id} r={cur} draft={drafts[cur.ticket.id]} setDraft={(v) => setDrafts((d) => { const n = { ...d }; if (v == null) delete n[cur.ticket.id]; else n[cur.ticket.id] = v; return n; })} />
          <Gate key={"g" + cur.ticket.id} r={cur} state={states[cur.ticket.id]} setState={(s) => setStates((x) => ({ ...x, [cur.ticket.id]: s }))} />
        </div>
      )}
    </Shell>
  );
}

function Work({ r, draft, setDraft }: { r: Triage; draft?: string; setDraft: (v: string | undefined) => void }) {
  const t = r.ticket;
  return (
    <section className="pn ot-w" aria-label="원문 · 정책 근거 · 초안">
      <h2 className="pn__h">{t.id} · {t.subject} <small>{t.tier} · {t.received.replace("T", " ")}</small></h2>
      <div className="pn__b">
        <p className="ot-int">의도 {r.intents.length ? r.intents.map((i) => <span key={i} className="st st--info">{INTENT_KO[i]}</span>) : <span className="st st--muted">판별 안 됨</span>}</p>
        <blockquote className="ot-body"><Marked text={t.body} hits={r.hits} /></blockquote>
        <p className="note"><mark className="ot-m ot-m--risk">빨간 표시</mark> 차단 규칙에 걸린 표현 · <mark className="ot-m ot-m--intent">파란 표시</mark> 의도 판별에 쓴 표현</p>
        <h3 className="ot-h3">정책 근거 — 검색 점수 순 <small>근거 하한 {GROUND_MIN}점</small></h3>
        {r.retrieved.length ? (
          <ol className="ot-cl">
            {r.retrieved.slice(0, 3).map((x) => (
              <li key={x.clause.id} className={r.draft.cites.includes(x.clause.id) ? "is-cited" : ""}>
                <p><b className="num">{x.clause.id}</b> {x.clause.title} <span className="num ot-score">{x.score}점</span>{r.draft.cites.includes(x.clause.id) && <span className="st st--info">인용</span>}</p>
                <p className="ot-clt">{x.clause.text}</p>
                <p className="ot-terms">일치 표현: {x.terms.join(" · ")}</p>
              </li>
            ))}
          </ol>
        ) : <p className="empty">일치하는 정책 조항이 없습니다 — 근거 없는 답변은 자동 발송하지 않습니다.</p>}
        <h3 className="ot-h3">회신 초안 <small>{r.draft.adapter}</small></h3>
        <textarea className="ot-draft" value={draft ?? r.draft.text} onChange={(e) => setDraft(e.target.value)} aria-label="회신 초안 편집" rows={7} />
        <p className="note">초안을 고치면 인용 검사와 차단 판정을 바로 다시 계산합니다. 없는 조항 ID · 인용 없는 문장은 차단되고, 문장을 고쳐도 위험 사유(개인정보 · 법적 분쟁 등)는 풀리지 않습니다.
          {draft != null && <> <button type="button" className="btn btn--sm" onClick={() => setDraft(undefined)}>규칙 초안으로 되돌리기</button></>}</p>
      </div>
    </section>
  );
}

function Gate({ r, state, setState }: { r: Triage; state: State; setState: (s: State) => void }) {
  const [by, setBy] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const auto = () => { const res = send(r, "auto"); if (res.ok) setState({ kind: "sent", log: res.log }); else setMsg(res.reason); };
  const approve = () => { const res = send(r, "approved", { by, note }); if (res.ok) { setState({ kind: "sent", log: res.log + ` · 메모: ${note}` }); setMsg(null); } else setMsg(res.reason); };
  return (
    <section className="pn ot-g" aria-label="리스크 게이트">
      <h2 className="pn__h">리스크 게이트 · Circuit Breaker</h2>
      <div className={"ot-cb " + (r.blocked ? "is-open" : "is-closed")} role="status">
        <b>{r.blocked ? "HARD BLOCK — 자동 발송 차단" : "통과 — 자동 발송 가능"}</b>
        <span>{r.blocked ? `승인 대기 · 담당: ${r.approver}` : "차단 사유 없음 · 근거 조항 인용 확인"}</span>
      </div>
      <dl className="ot-kv">
        <div><dt>위험 등급</dt><dd><RiskB r={r.risk} /></dd></div>
        <div><dt>긴급도 · SLA</dt><dd><span className="st st--muted">{r.urgency}</span> 마감 {r.dueAt.replace("T", " ")} · 남은 <span className="num">{hhmm(r.minutesLeft)}</span></dd></div>
        <div><dt>근거 점수</dt><dd><span className="num">{r.grounding}</span> / 하한 {GROUND_MIN} {r.grounding < GROUND_MIN ? <span className="st st--bad">UNGROUNDED</span> : <span className="st st--ok">GROUNDED</span>}</dd></div>
        <div><dt>인용 조항</dt><dd>{r.draft.cites.length ? r.draft.cites.map((c) => <span key={c} className="kbd">{c}</span>) : "없음"}</dd></div>
      </dl>
      <h3 className="ot-h3">차단 사유 코드</h3>
      {r.codes.length ? (
        <ul className="ot-codes">
          {r.codes.map((c) => <li key={c}><b className="num">{c}</b><span>{CODE_INFO[c].ko}</span>{r.evidence[c] && <em>근거: {r.evidence[c]!.join(", ")}</em>}</li>)}
        </ul>
      ) : <p className="note">없음</p>}
      <div className="ot-act">
        <button type="button" className="btn btn--solid" disabled={r.blocked || state?.kind === "sent"} aria-disabled={r.blocked} onClick={auto} title={r.blocked ? "코드로 잠긴 단추입니다" : undefined}>자동 발송</button>
        {r.blocked && state?.kind !== "sent" && <button type="button" className="btn" onClick={() => setState({ kind: "pending" })} disabled={state?.kind === "pending"}>{state?.kind === "pending" ? "승인 요청됨" : "상급자 승인 요청"}</button>}
      </div>
      {r.blocked && state?.kind === "pending" && (
        <div className="ot-appr">
          <label className="field">승인자({r.approver}){" "}<input value={by} onChange={(e) => setBy(e.target.value)} placeholder="예: 김 팀장(가상)" /></label>
          <label className="field">승인 메모<textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="예: 위임장 미확인 — 제공 불가 안내로 초안 수정 후 발송" /></label>
          <button type="button" className="btn btn--solid" onClick={approve}>승인 후 발송(시뮬레이션)</button>
        </div>
      )}
      {msg && <p className="ot-err" role="alert">{msg}</p>}
      {state?.kind === "sent" && <p className="ot-log" role="status">{state.log}</p>}
      <p className="note">발송은 시뮬레이션입니다 — 실제 메일 · 메시지가 나가지 않습니다. 단추를 우회해도 <span className="kbd">send()</span> 함수가 차단된 티켓의 자동 발송을 다시 거부합니다.</p>
    </section>
  );
}

function EvalBadges() {
  const b = useMemo(() => runTriageBench(), []);
  return (
    <div className="badges" aria-label="이 페이지에서 지금 실행한 평가 결과">
      <span className={"badge " + (b.trap.missed === 0 ? "badge--ok" : "badge--bad")}><b className="num">{b.trap.blocked}/{b.trap.total}</b><span>고위험 차단 · 미탐지 {b.trap.missed}</span></span>
      <span className="badge"><b className="num">{b.cite.correct}/{b.cite.total}</b><span>근거 조항 인용 일치</span></span>
    </div>
  );
}

function Eval({ onOpen }: { onOpen: (id: string) => void }) {
  const [run, setRun] = useState(() => ({ b: runTriageBench(), at: new Date() }));
  const { b } = run;
  return (
    <div className="ot-ev">
      <div className="badges">
        <span className={"badge " + (b.trap.missed === 0 ? "badge--ok" : "badge--bad")}><b className="num">{b.trap.missed}건</b><span>고위험 자동 발송 허용(미탐지)</span></span>
        <span className="badge"><b className="num">{b.trap.blocked}/{b.trap.total}</b><span>고위험 · 함정 차단</span></span>
        <span className={"badge " + (b.normal.overBlocked === 0 ? "badge--ok" : "")}><b className="num">{b.normal.allowed}/{b.normal.total}</b><span>정상 문의 자동 발송 허용</span></span>
        <span className="badge"><b className="num">{b.cite.correct}/{b.cite.total}</b><span>기대 조항 인용</span></span>
        <span className="badge"><b className="num">{b.codes.matched}/{b.codes.total}</b><span>기대 차단 사유 일치</span></span>
      </div>
      <p className="note">지금 브라우저에서 20건을 다시 돌린 결과 · {run.at.toLocaleTimeString("ko-KR")} <button type="button" className="btn btn--sm" onClick={() => setRun({ b: runTriageBench(), at: new Date() })}>다시 실행</button></p>
      <div className="pn scroll">
        <table className="tbl">
          <thead><tr><th>티켓</th><th>구분</th><th>요지</th><th>위험</th><th>자동 발송</th><th>차단 사유</th><th>기대 사유</th><th>인용</th><th>기대 조항</th></tr></thead>
          <tbody>
            {b.rows.map((x) => (
              <tr key={x.t.id}>
                <td><button type="button" className="ot-link num" onClick={() => onOpen(x.t.id)}>{x.t.id}</button></td>
                <td>{x.t.expect.group === "trap" ? <span className="st st--bad">고위험</span> : <span className="st st--ok">정상</span>}</td>
                <td>{x.t.expect.why}</td>
                <td><RiskB r={x.r.risk} /></td>
                <td>{x.autoAllowed ? <span className={"st " + (x.t.expect.group === "trap" ? "st--bad" : "st--ok")}>허용</span> : <span className={"st " + (x.t.expect.group === "trap" ? "st--ok" : "st--bad")}>차단</span>}</td>
                <td className="num ot-small">{x.r.codes.filter((c) => c !== "CB-RISK-HIGH").join(" ") || "—"}</td>
                <td className="num ot-small">{x.t.expect.codes?.join(" ") || "—"} {x.codesOk === true && "✓"}{x.codesOk === false && "✗"}</td>
                <td className="num ot-small">{x.r.draft.cites.join(" ") || "—"}</td>
                <td className="num ot-small">{x.t.expect.clause || "—"} {x.citeOk === true && "✓"}{x.citeOk === false && "✗"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="note">같은 평가가 <span className="kbd">npm test</span>(Vitest)로 돌아갑니다. 티켓 · 정책은 모두 가상이며, 실제 운영 데이터에서의 차단율을 뜻하지 않습니다. 정상 문의 차단(과차단)도 함께 세서 ‘전부 막으면 0건’이 되는 착시를 피합니다.</p>
    </div>
  );
}

function Policies({ cites }: { cites: string[] }) {
  return (
    <div className="ot-pol">
      {POLICIES.map((p) => (
        <section key={p.id} className="pn">
          <h2 className="pn__h">{p.no} {p.ko} <small>{p.clauses.length}개 조항</small></h2>
          <ol className="ot-cl">
            {p.clauses.map((c) => <li key={c.id} id={c.id} className={cites.includes(c.id) ? "is-cited" : ""}><p><b className="num">{c.id}</b> {c.title}</p><p className="ot-clt">{c.text}</p></li>)}
          </ol>
        </section>
      ))}
      <p className="note">가상 회사의 예시 규정입니다. 실제 기업의 환불 · 개인정보 · SLA 정책이 아니며 법률 자문이 아닙니다.</p>
    </div>
  );
}
