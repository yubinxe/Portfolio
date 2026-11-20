import { useMemo, useState } from "react";
import { Shell, Tabs, download } from "../shared/Shell";
import type { Format, SourceDoc } from "./adapter";
import { ACTION_KO, type Action, type Decision, type Finding, type Status, auditTrail, cleanCsv, reconcile, validateDecision } from "./engine";
import { runBenchmark } from "./eval";
import { SCENARIOS } from "./scenarios";
import { fmt } from "./units";

const ST_CLS: Record<Status | "ONLY", string> = { MATCH: "st--ok", MISMATCH: "st--bad", MISSING: "st--warn", DUP: "st--dup", ANOMALY: "st--bad", ONLY: "st--muted" };
const ST_KO: Record<Status, string> = { MATCH: "일치", MISMATCH: "불일치", MISSING: "누락", DUP: "중복", ANOMALY: "이상치" };
const Badge = ({ s }: { s: Status }) => <span className={"st " + ST_CLS[s]}>{s}<span className="sr"> {ST_KO[s]}</span></span>;

export default function App() {
  const [tab, setTab] = useState<"work" | "report">(() => (location.hash === "#report" ? "report" : "work"));
  const [sid, setSid] = useState(SCENARIOS[0].id);
  const sc = SCENARIOS.find((s) => s.id === sid)!;
  const [docs, setDocs] = useState<Record<string, { A: SourceDoc; B: SourceDoc }>>({});
  const cur = docs[sid] || { A: sc.A, B: sc.B };
  const res = useMemo(() => reconcile(cur.A, cur.B, sc.schema), [cur.A, cur.B, sc.schema]);
  const [sel, setSel] = useState<string | null>(null);
  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const [decisions, setDecisions] = useState<Record<string, Decision[]>>({});
  const decs = decisions[sid] || [];
  const [reviewer, setReviewer] = useState("검토자(가상)");
  const selF = res.findings.find((f) => f.id === sel) || null;

  const pickScenario = (id: string) => { setSid(id); setSel(null); setFilter("ALL"); };
  const upload = (side: "A" | "B", file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const format: Format = ext === "json" ? "json" : ext === "csv" ? "csv" : "text";
    file.text().then((body) => {
      setDocs((d) => ({ ...d, [sid]: { ...cur, [side]: { ...cur[side], name: `업로드: ${file.name}`, kind: `직접 올린 ${format.toUpperCase()}`, format, body } } }));
      setDecisions((x) => ({ ...x, [sid]: [] })); setSel(null);
    });
  };
  const reset = () => { setDocs((d) => { const n = { ...d }; delete n[sid]; return n; }); setDecisions((x) => ({ ...x, [sid]: [] })); setSel(null); };
  const decide = (d: Decision) => setDecisions((x) => ({ ...x, [sid]: [...(x[sid] || []).filter((y) => y.findingId !== d.findingId), d] }));
  const open = res.findings.filter((f) => !decs.some((d) => d.findingId === f.id)).length;

  return (
    <Shell app="reconcile-gate" title="서로 다른 양식의 숫자를 눈으로 대조하지 않는 검수 게이트"
      question="원천 대장 CSV · 요약 텍스트 · API 스냅샷을 같은 기준 단위로 바꾼 뒤, 일치하지 않는 칸만 골라 사람에게 넘깁니다. 계산 · 환산 · 판정은 모두 결정론적 코드입니다."
      right={<BenchBadges />}>
      <Tabs label="ReconcileGate 화면" value={tab} onChange={setTab} tabs={[["work", "검수 워크벤치"], ["report", "자동 검증 리포트"]]} />
      {tab === "report" ? <Report /> : (
        <>
          <div className="rg-scen" role="group" aria-label="벤치마크 시나리오">
            {SCENARIOS.map((s) => (
              <button key={s.id} type="button" aria-pressed={s.id === sid} onClick={() => pickScenario(s.id)}>
                <b>{s.no} {s.domain}</b><span>{s.ko}</span>
              </button>
            ))}
          </div>
          <div className="rg">
            <section className="pn rg-src" aria-label="입력 소스">
              <h2 className="pn__h">입력 소스 <small>{docs[sid] ? <button type="button" className="btn btn--sm" onClick={reset}>가상 데이터로 되돌리기</button> : "가상 데이터"}</small></h2>
              {(["A", "B"] as const).map((side) => {
                const P = res[side];
                const hl = selF ? selF.lines[side] : undefined;
                return (
                  <div key={side} className="rg-doc">
                    <p className="rg-doc__h"><b className="rg-side">{side}</b><span><strong>{P.name}</strong><em>{cur[side].kind} · {P.rows.length}행</em></span></p>
                    {(P.warnings.length > 0 || P.unknown.length > 0) && (
                      <p className="rg-warn">{P.warnings.slice(0, 3).join(" · ")}{P.unknown.length > 0 && <> 인식하지 못한 항목: {P.unknown.slice(0, 4).join(", ")}</>}</p>
                    )}
                    <pre className="rg-raw" tabIndex={0} aria-label={`원천 ${side} 원문`}>
                      {cur[side].body.split(/\r?\n/).map((l, i) => <span key={i} className={hl === i + 1 ? "is-hl" : undefined} ref={hl === i + 1 ? (el) => el?.scrollIntoView({ block: "nearest" }) : undefined}><i>{i + 1}</i>{l || " "}{"\n"}</span>)}
                    </pre>
                    <label className="rg-up"><span>CSV · JSON · TXT 올리기</span><input type="file" accept=".csv,.json,.txt,text/plain,text/csv,application/json" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(side, f); e.target.value = ""; }} /></label>
                  </div>
                );
              })}
              <p className="note">올린 파일은 이 브라우저 안에서만 읽습니다(서버 전송 없음). 머리글은 동의어 사전으로 표준 필드에 연결합니다 — 키 열: {sc.schema.keySynonyms.join(" · ")}</p>
            </section>

            <section className="pn rg-diff" aria-label="교차검증 결과">
              <h2 className="pn__h">교차검증 Diff <small>허용 오차 = 두 원문 중 거친 눈금의 절반</small></h2>
              <div className="rg-counts" role="group" aria-label="상태로 거르기">
                <button type="button" aria-pressed={filter === "ALL"} onClick={() => setFilter("ALL")}>전체 {res.grid.length}행</button>
                {(["MATCH", "MISMATCH", "MISSING", "DUP", "ANOMALY"] as Status[]).map((s) => (
                  <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)}><Badge s={s} /> <span className="num">{res.counts[s]}</span>{s === "MATCH" ? "칸" : "건"}</button>
                ))}
              </div>
              <div className="scroll rg-tablewrap">
                <table className="tbl rg-tbl">
                  <thead><tr><th>상태</th><th>{sc.schema.keyKo}</th>{res.grid.find((g) => g.cells.length)?.cells.map((c) => <th key={c.field}>{sc.schema.fields.find((f) => f.id === c.field)?.ko}<br /><small>A / B</small></th>)}</tr></thead>
                  <tbody>
                    {res.grid.filter((g) => filter === "ALL" || (filter === "MATCH" ? g.cells.some((c) => c.status === "MATCH") : res.findings.some((f) => f.key === g.key && f.status === filter))).map((g) => {
                      const rowF = res.findings.filter((f) => f.key === g.key);
                      return (
                        <tr key={g.key} className={rowF.some((f) => f.id === sel) ? "is-sel" : undefined}>
                          <td>{rowF.length ? rowF.map((f) => <button key={f.id} type="button" className="rg-fbtn" onClick={() => setSel(f.id)} aria-label={`${f.id} ${ST_KO[f.status]} 열기`}><Badge s={f.status} /></button>) : <Badge s="MATCH" />}</td>
                          <th scope="row">{g.label}<small>{g.lineA ? `A:${g.lineA}` : ""}{g.lineB ? ` B:${g.lineB}` : ""}</small></th>
                          {g.cells.length === 0 ? <td colSpan={99} className="rg-meta">{rowF.map((f) => f.message).join(" · ")}</td> : g.cells.map((c) => (
                            <td key={c.field} className={"rg-cell rg-cell--" + c.status}>
                              {c.finding ? <button type="button" className="rg-cbtn" onClick={() => setSel(c.finding!)}><Cell a={c.a} b={c.b} /></button> : <Cell a={c.a} b={c.b} />}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="pn rg-q" aria-label="사람 승인 큐">
              <h2 className="pn__h">승인 큐 <small>미결 <span className="num">{open}</span> / {res.findings.length}</small></h2>
              <ol className="rg-qlist">
                {res.findings.map((f) => {
                  const d = decs.find((x) => x.findingId === f.id);
                  return (
                    <li key={f.id}>
                      <button type="button" aria-pressed={f.id === sel} onClick={() => setSel(f.id)}>
                        <span className="num">{f.id}</span><Badge s={f.status} /><span className="rg-ql">{f.label}{f.fieldKo ? " · " + f.fieldKo : ""}</span>
                        <em className={d ? "is-done" : ""}>{d ? ACTION_KO[d.action] : "미결"}</em>
                      </button>
                    </li>
                  );
                })}
              </ol>
              {selF ? <Decide key={selF.id + sid} f={selF} current={decs.find((d) => d.findingId === selF.id)} reviewer={reviewer} setReviewer={setReviewer} onDecide={decide} /> : <p className="empty">왼쪽 표나 목록에서 신호를 고르면 원문 줄이 강조되고 여기서 처리합니다.</p>}
              <div className="rg-export">
                <button type="button" className="btn btn--solid" onClick={() => download(`reconcile-${sid}-clean.csv`, "﻿" + cleanCsv(res, decs), "text/csv")}>정제 CSV 내보내기</button>
                <button type="button" className="btn" onClick={() => download(`reconcile-${sid}-audit.json`, JSON.stringify(auditTrail(res, decs, sid), null, 2), "application/json")}>감사기록 JSON</button>
              </div>
              <p className="note">{open > 0 ? `미결 ${open}건은 정제 CSV 에 ‘미결’로 남고 값이 비워집니다.` : "모든 신호가 처리되었습니다."} 결정 · 사유 · 검토자 · 시각이 감사기록에 그대로 남습니다.</p>
            </section>
          </div>
        </>
      )}
    </Shell>
  );
}

function Cell({ a, b }: { a?: Finding["a"]; b?: Finding["b"] }) {
  return <span className="rg-v"><span title={a?.raw}>{a ? fmt(a) : "—"}</span><span title={b?.raw}>{b ? fmt(b) : "—"}</span></span>;
}

function Decide({ f, current, reviewer, setReviewer, onDecide }: { f: Finding; current?: Decision; reviewer: string; setReviewer: (s: string) => void; onDecide: (d: Decision) => void }) {
  const [action, setAction] = useState<Action | undefined>(current?.action);
  const [value, setValue] = useState(current?.value || "");
  const [reason, setReason] = useState(current?.reason || "");
  const [err, setErr] = useState<string | null>(null);
  const canAB = !!(f.a && f.b) && f.status === "MISMATCH";
  const acts: Action[] = canAB ? ["TAKE_A", "TAKE_B", "EDIT", "HOLD"] : ["EDIT", "HOLD"];
  const submit = () => {
    const d = { findingId: f.id, action, value, reason, reviewer, at: new Date().toISOString() };
    const e = validateDecision(d);
    setErr(e);
    if (!e) onDecide(d as Decision);
  };
  return (
    <div className="rg-dec">
      <p className="rg-dec__k"><span className="num">{f.id}</span> <Badge s={f.status} /> <b>{f.label}{f.fieldKo ? " · " + f.fieldKo : ""}</b></p>
      <p className="rg-dec__m">{f.message}</p>
      {f.hint && <p className="rg-dec__hint">원인 힌트 — {f.hint} <small>(판정이 아닌 참고)</small></p>}
      <dl className="rg-dec__src">
        {f.a && <div><dt>A{f.lines.A ? `:${f.lines.A}행` : ""}</dt><dd><code>{f.a.raw}</code> → {fmt(f.a)}</dd></div>}
        {f.b && <div><dt>B{f.lines.B ? `:${f.lines.B}행` : ""}</dt><dd><code>{f.b.raw}</code> → {fmt(f.b)}</dd></div>}
      </dl>
      <fieldset className="rg-acts"><legend>처리</legend>
        {acts.map((a) => <label key={a}><input type="radio" name={"act-" + f.id} checked={action === a} onChange={() => setAction(a)} />{ACTION_KO[a]}</label>)}
      </fieldset>
      {action === "EDIT" && <label className="field">수정 값(기준 단위)<input value={value} onChange={(e) => setValue(e.target.value)} placeholder="예: 12500000" /></label>}
      <label className="field">사유<textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="예: 계약서 원본 2쪽 확인 — 대장 값이 맞음" /></label>
      <label className="field">검토자<input value={reviewer} onChange={(e) => setReviewer(e.target.value)} /></label>
      {err && <p className="rg-err" role="alert">{err}</p>}
      <button type="button" className="btn btn--solid" onClick={submit}>{current ? "결정 고치기" : "확정"}</button>
      {current && <p className="note">확정됨 · {ACTION_KO[current.action]} · {current.reviewer}</p>}
    </div>
  );
}

function BenchBadges() {
  const b = useMemo(() => runBenchmark(), []);
  return (
    <div className="badges" aria-label="이 페이지에서 지금 실행한 자동 검증 결과">
      <span className={"badge " + (b.detected === b.planted ? "badge--ok" : "badge--bad")}><b className="num">{b.detected}/{b.planted}</b><span>심은 결함 검출</span></span>
      <span className={"badge " + (b.falsePositives === 0 ? "badge--ok" : "badge--bad")}><b className="num">{b.falsePositives}건</b><span>오탐</span></span>
    </div>
  );
}

function Report() {
  const [run, setRun] = useState(() => ({ b: runBenchmark(), at: new Date(), ms: 0 }));
  const again = () => { const t = performance.now(); const b = runBenchmark(); setRun({ b, at: new Date(), ms: performance.now() - t }); };
  const { b } = run;
  return (
    <div className="rg-rep">
      <div className="rg-rep__top">
        <div className="badges">
          <span className={"badge " + (b.detected === b.planted ? "badge--ok" : "badge--bad")}><b className="num">{b.detected}/{b.planted}</b><span>심은 결함 검출</span></span>
          <span className={"badge " + (b.falsePositives === 0 ? "badge--ok" : "badge--bad")}><b className="num">{b.falsePositives}건</b><span>오탐(기대 밖 신호)</span></span>
          <span className="badge"><b className="num">{b.signals}</b><span>엔진이 낸 신호 수</span></span>
          <span className="badge"><b className="num">{b.scenarios.length}</b><span>도메인 시나리오</span></span>
        </div>
        <p className="note">이 표는 지금 브라우저에서 엔진을 다시 돌린 결과입니다 · {run.at.toLocaleTimeString("ko-KR")}{run.ms ? ` · ${run.ms.toFixed(1)}ms` : ""} <button type="button" className="btn btn--sm" onClick={again}>다시 실행</button></p>
      </div>
      {b.scenarios.map((s) => (
        <section key={s.scenario.id} className="pn rg-rep__s">
          <h2 className="pn__h">{s.scenario.no} {s.scenario.ko} <small>{s.scenario.domain}</small></h2>
          <div className="scroll">
            <table className="tbl">
              <thead><tr><th>결함</th><th>심은 내용</th><th>유형</th><th>기대 신호</th><th>결과</th></tr></thead>
              <tbody>
                {s.defects.map((d) => (
                  <tr key={d.defect.id}>
                    <td className="num">{d.defect.id}</td><td>{d.defect.ko}</td><td>{d.defect.kind}</td>
                    <td>{d.defect.expect.map((e, i) => <span key={i} className="rg-exp"><Badge s={e.status} /> {e.key}{e.field ? "." + e.field : ""}</span>)}</td>
                    <td>{d.detected ? <span className="st st--ok">검출 {d.matched.join(" · ")}</span> : <span className="st st--bad">미검출</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="note"><b>오탐 함정</b> — {s.scenario.traps.join(" · ")} · 기대 밖 신호 <span className="num">{s.falsePositives.length}</span>건{s.falsePositives.length ? ": " + s.falsePositives.map((f) => f.message).join(" / ") : ""}</p>
        </section>
      ))}
      <p className="note">같은 검증이 <span className="kbd">npm test</span>(Vitest)로도 돌아갑니다. 결함 · 함정 데이터는 모두 가상이며, 실제 업무 데이터에서의 검출률을 뜻하지 않습니다.</p>
    </div>
  );
}
