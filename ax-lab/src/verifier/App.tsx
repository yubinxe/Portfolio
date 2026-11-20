import { useEffect, useMemo, useRef, useState } from "react";
import { Shell, Tabs, download } from "../shared/Shell";
import { DISTORTIONS, applyDistortion } from "./cases";
import { runVerifierBench } from "./eval";
import { type Memo, type Resolution, type Section, type SentenceResult, TemplateGenerator, autoFix, exportMemo, gate, verifySentence } from "./pipeline";
import { SOURCES } from "./sources";

const SEC_KO: Record<Section, string> = { "결론": "핵심 결론", "지표": "주요 지표", "리스크": "리스크", "권고": "권고안" };
const base = () => TemplateGenerator.generate();

function VBadge({ r }: { r: SentenceResult }) {
  if (r.verdict === "VERIFIED") return <span className="st st--ok">VERIFIED · {r.cites.map((c) => `${c.sid}:${c.line}`).join(" ")}</span>;
  if (r.verdict === "NO_CLAIM") return <span className="st st--muted">검증할 주장 없음</span>;
  const mm = r.issues.find((i) => i.verdict === "MISMATCH" && i.draft && i.source);
  if (r.verdict === "MISMATCH") return <span className="st st--bad">MISMATCH{mm ? `: 원문 ${mm.source!.raw} vs 초안 ${mm.draft!.raw}` : ""}</span>;
  return <span className="st st--warn">UNVERIFIED</span>;
}

export default function App() {
  const [tab, setTab] = useState<"memo" | "bench">(() => (location.hash === "#bench" ? "bench" : "memo"));
  const [memo, setMemo] = useState<Memo>(base);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [res, setRes] = useState<Record<string, Resolution>>({});
  const [sel, setSel] = useState<string>("C1");
  const results = useMemo(() => memo.sentences.map(verifySentence), [memo]);
  const g = gate(results, res);
  const cur = results.find((r) => r.s.id === sel) || results[0];
  const active = results.filter((r) => res[r.s.id]?.kind !== "delete");

  const load = (id: string | null) => {
    const d = DISTORTIONS.find((x) => x.id === id);
    setMemo(d ? applyDistortion(base(), d) : base());
    setCaseId(id); setRes({});
    setSel(d ? d.sentence : "C1"); setTab("memo");
  };
  const edit = (id: string, text: string) => { setMemo((m) => ({ ...m, sentences: m.sentences.map((s) => (s.id === id ? { ...s, text } : s)) })); setRes((r) => { const n = { ...r }; delete n[id]; return n; }); };
  const resolve = (id: string, r: Resolution | null) => setRes((x) => { const n = { ...x }; if (r) n[id] = r; else delete n[id]; return n; });

  return (
    <Shell app="claim-verifier" title="요약문의 모든 숫자를 원문 줄과 1:1 대조하는 2단계 검증"
      question="Stage 1 이 여러 원천을 합쳐 1페이지 임원 브리핑 초안을 만들면, Stage 2 의 독립 검증기가 초안의 글자만 다시 읽어 숫자 · 날짜 · 고유명사 · 인과 표현을 인용 원문과 대조합니다. 미해결 문장이 남으면 내보내기가 잠깁니다."
      right={<BenchBadges />}>
      <Tabs label="Claim-to-Source Verifier 화면" value={tab} onChange={setTab} tabs={[["memo", "브리핑 검증"], ["bench", "Verification Benchmark"]]} />
      {tab === "bench" ? <Bench onLoad={load} /> : (
        <>
          <ol className="cv-pipe" aria-label="파이프라인">
            <li><b>Stage 1</b>브리핑 초안<em>{TemplateGenerator.name}</em></li>
            <li><b>Stage 2</b>독립 검증<em>문장 {results.length} · VERIFIED {results.filter((r) => r.verdict === "VERIFIED").length}</em></li>
            <li className={g.open.length ? "is-bad" : "is-ok"}><b>승인 게이트</b>{g.open.length ? `미해결 ${g.open.length}건` : "통과"}<em>예외 승인 {g.waived.length}건</em></li>
            <li><b>내보내기</b>{g.canExport ? "가능" : "잠김"}<em>Markdown</em></li>
          </ol>
          <div className="cv-case" role="group" aria-label="초안 고르기">
            <button type="button" aria-pressed={caseId === null} onClick={() => load(null)}>깨끗한 초안</button>
            {DISTORTIONS.map((d) => <button key={d.id} type="button" aria-pressed={caseId === d.id} onClick={() => load(d.id)} title={d.ko}>{d.id}</button>)}
            {caseId && <span className="cv-case__t">{DISTORTIONS.find((d) => d.id === caseId)!.ko} — {DISTORTIONS.find((d) => d.id === caseId)!.sentence} 문장에 심음</span>}
          </div>
          <div className="cv">
            <Sources cur={cur} />
            <section className="pn cv-memo" aria-label="임원 브리핑 메모">
              <h2 className="pn__h">{memo.title} <small>문장을 고치면 바로 다시 검증</small></h2>
              <div className="pn__b">
                {(["결론", "지표", "리스크", "권고"] as Section[]).map((sec) => (
                  <div key={sec} className="cv-sec">
                    <h3>{SEC_KO[sec]}</h3>
                    {results.filter((r) => r.s.section === sec).map((r) => {
                      const rs = res[r.s.id];
                      return (
                        <div key={r.s.id} className={"cv-s cv-s--" + r.verdict + (sel === r.s.id ? " is-sel" : "") + (rs?.kind === "delete" ? " is-del" : "")} onClick={() => setSel(r.s.id)}>
                          <div className="cv-s__top"><span className="num">{r.s.id}</span><VBadge r={r} />{rs && <span className="st st--info">{rs.kind === "delete" ? "삭제" : rs.kind === "waive" ? "예외 승인" : "교정"}</span>}</div>
                          <textarea value={r.s.text} rows={2} onFocus={() => setSel(r.s.id)} onChange={(e) => edit(r.s.id, e.target.value)} aria-label={`${r.s.id} 문장`} readOnly={rs?.kind === "delete"} />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>
            <Inspector key={cur.s.id} r={cur} rs={res[cur.s.id]} onFix={(t) => edit(cur.s.id, t)} onResolve={(x) => resolve(cur.s.id, x)} />
          </div>
          <div className="cv-export">
            <button type="button" className="btn btn--solid" disabled={!g.canExport} onClick={() => download("decision-memo.md", exportMemo(memo, results, res), "text/markdown")}>최종 임원 메모 내보내기</button>
            <p className="note">{g.canExport ? (g.waived.length ? `예외 승인 ${g.waived.length}건 — 내보낸 문서 맨 위에 경고 표시가 붙습니다.` : "모든 주장이 원문과 일치합니다.") : `미해결 ${g.open.length}건(${g.open.map((o) => o.s.id).join(", ")}) — 교정 · 삭제 · 예외 승인 중 하나로 처리해야 내보낼 수 있습니다.`} 내보낸 문서 수 {active.length}문장.</p>
          </div>
        </>
      )}
    </Shell>
  );
}

function Sources({ cur }: { cur: SentenceResult }) {
  const box = useRef<HTMLDivElement>(null);
  const first = cur.cites[0];
  useEffect(() => {
    const el = box.current?.querySelector<HTMLElement>(`[data-at="${first ? first.sid + ":" + first.line : ""}"]`);
    if (el && box.current) box.current.scrollTo({ top: el.offsetTop - box.current.offsetTop - 40, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [cur.s.id, first?.sid, first?.line]);
  const cited = new Set(cur.cites.map((c) => c.sid + ":" + c.line));
  const bad = new Set(cur.issues.map((i) => i.at).filter(Boolean) as string[]);
  return (
    <section className="pn cv-src" aria-label="원천 문서">
      <h2 className="pn__h">원천 문서 <small>번호 = 인용 주소</small></h2>
      <div className="cv-src__box" ref={box}>
        {SOURCES.map((s) => (
          <div key={s.id} className="cv-doc">
            <p className="cv-doc__h"><b>{s.id}</b><span><strong>{s.ko}</strong><em>{s.kind}</em></span></p>
            <ol className="cv-lines">
              {s.lines.map((l, i) => {
                const at = s.id + ":" + (i + 1);
                return <li key={i} data-at={at} className={(cited.has(at) ? "is-cited" : "") + (bad.has(at) ? " is-bad" : "")}><i>{i + 1}</i><span>{l}</span></li>;
              })}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}

function Inspector({ r, rs, onFix, onResolve }: { r: SentenceResult; rs?: Resolution; onFix: (t: string) => void; onResolve: (x: Resolution | null) => void }) {
  const [note, setNote] = useState("");
  const [by, setBy] = useState("검토자(가상)");
  const fix = autoFix(r);
  const flagged = r.verdict === "MISMATCH" || r.verdict === "UNVERIFIED";
  return (
    <section className="pn cv-ins" aria-label="불일치 상세">
      <h2 className="pn__h">검증 인스펙터 <small>{r.s.id}</small></h2>
      <div className="pn__b">
        <p><VBadge r={r} /></p>
        <h3>대조한 주장 <small>{r.checks.length}개</small></h3>
        {r.checks.length ? (
          <table className="tbl cv-tbl">
            <thead><tr><th>초안</th><th>원문</th><th>위치</th><th /></tr></thead>
            <tbody>{r.checks.map((c, i) => <tr key={i}><td className="num">{c.tok.raw}{c.source?.role && c.tok.role ? <small> · {c.tok.role}</small> : null}</td><td className="num">{c.source?.raw || "—"}{c.source?.role ? <small> · {c.source.role}</small> : null}</td><td className="num">{c.at || "—"}</td><td>{c.ok ? <span className="st st--ok">일치</span> : <span className="st st--bad">X</span>}</td></tr>)}</tbody>
          </table>
        ) : <p className="note">숫자 · 날짜 · 고유명사가 없는 문장입니다.</p>}
        {r.issues.length > 0 && (
          <>
            <h3>문제</h3>
            <ul className="cv-iss">{r.issues.map((i, k) => <li key={k} className={"is-" + i.verdict}><b>{i.verdict}</b> {i.note}</li>)}</ul>
          </>
        )}
        {flagged && !rs && (
          <div className="cv-act">
            <button type="button" className="btn btn--solid" disabled={!fix} onClick={() => fix && onFix(fix)} title={fix ? "" : "근거 없음 · 기간 혼동은 사람이 문장을 고쳐야 합니다"}>원문 값으로 교정</button>
            <button type="button" className="btn" onClick={() => onResolve({ kind: "delete" })}>문장 삭제</button>
            <label className="field">예외 승인 사유<textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="예: 리서치팀 수정본 확인 전 — 보고 후 정정" /></label>
            <label className="field">검토자<input value={by} onChange={(e) => setBy(e.target.value)} /></label>
            <button type="button" className="btn" disabled={note.trim().length < 4 || !by.trim()} onClick={() => onResolve({ kind: "waive", note, by })}>예외 승인(경고 표시)</button>
          </div>
        )}
        {rs && <p className="note">처리: {rs.kind === "delete" ? "문장 삭제" : `예외 승인 — ${rs.by}: ${rs.note}`} <button type="button" className="btn btn--sm" onClick={() => onResolve(null)}>되돌리기</button></p>}
      </div>
    </section>
  );
}

function BenchBadges() {
  const b = useMemo(() => runVerifierBench(), []);
  return (
    <div className="badges" aria-label="이 페이지에서 지금 실행한 벤치마크 결과">
      <span className={"badge " + (b.detected === b.cases.length ? "badge--ok" : "badge--bad")}><b className="num">{b.detected}/{b.cases.length}</b><span>고의 왜곡 탐지</span></span>
      <span className={"badge " + (b.falsePositives === 0 ? "badge--ok" : "badge--bad")}><b className="num">{b.falsePositives}건</b><span>오탐</span></span>
    </div>
  );
}

function Bench({ onLoad }: { onLoad: (id: string) => void }) {
  const [run, setRun] = useState(() => ({ b: runVerifierBench(), at: new Date() }));
  const { b } = run;
  return (
    <div className="cv-bench">
      <div className="badges">
        <span className={"badge " + (b.detected === b.cases.length ? "badge--ok" : "badge--bad")}><b className="num">{b.detected}/{b.cases.length}</b><span>기대 판정으로 탐지</span></span>
        <span className="badge"><b className="num">{b.located}/{b.cases.length}</b><span>오차 지점(토큰) 특정</span></span>
        <span className={"badge " + (b.falsePositives === 0 ? "badge--ok" : "badge--bad")}><b className="num">{b.falsePositives}건</b><span>오탐(깨끗한 초안 · 다른 문장)</span></span>
        <span className="badge"><b className="num">{b.clean.verified}/{b.clean.sentences}</b><span>깨끗한 초안 VERIFIED</span></span>
      </div>
      <p className="note">지금 브라우저에서 다시 돌린 결과 · {run.at.toLocaleTimeString("ko-KR")} <button type="button" className="btn btn--sm" onClick={() => setRun({ b: runVerifierBench(), at: new Date() })}>다시 실행</button></p>
      <div className="pn scroll">
        <table className="tbl">
          <thead><tr><th>케이스</th><th>왜곡</th><th>유형</th><th>문장</th><th>바꾼 부분</th><th>판정</th><th>오차 지점</th><th /></tr></thead>
          <tbody>
            {b.cases.map((c) => {
              const iss = c.target?.issues.find((i) => i.kind === c.d.expect.issue);
              return (
                <tr key={c.d.id}>
                  <td className="num">{c.d.id}</td><td>{c.d.ko}</td><td>{c.d.kind}</td><td className="num">{c.d.sentence}</td>
                  <td className="cv-small"><del>{c.d.from.length > 28 ? c.d.from.slice(0, 28) + "…" : c.d.from}</del> → <ins>{c.d.to.length > 28 ? c.d.to.slice(0, 28) + "…" : c.d.to}</ins></td>
                  <td>{c.target && <VBadge r={c.target} />} {c.detected ? "✓" : "✗"}</td>
                  <td className="cv-small">{iss ? iss.note : "—"} {c.located ? "✓" : ""}</td>
                  <td><button type="button" className="btn btn--sm" onClick={() => onLoad(c.d.id)}>편집기에서 보기</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="note">같은 벤치마크가 <span className="kbd">npm test</span>(Vitest)로 돌아갑니다. 원천 · 초안은 가상이며, 실제 보고서에서의 탐지율을 뜻하지 않습니다. 검증기는 초안을 만든 생성기의 내부 정보를 쓰지 않고 글자만 다시 읽습니다.</p>
    </div>
  );
}
