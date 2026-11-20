/* 교차검증 엔진 — 순수 함수. 같은 입력이면 언제나 같은 결과(시간 · 난수 · 외부 호출 없음).
 * MATCH(일치) · MISMATCH(값 · 단위 불일치) · MISSING(한쪽 누락) · DUP(중복 키) · ANOMALY(규칙 · 허용 오차 위반) */
import { DeterministicAdapter, type Parsed, type Row, type Schema, type SchemaAdapter, type SourceDoc } from "./adapter";
import { type Val, diagnose, fmt, isoDate, normKey, tolerance } from "./units";

export type Status = "MATCH" | "MISMATCH" | "MISSING" | "DUP" | "ANOMALY";
export interface Finding {
  id: string;
  status: Exclude<Status, "MATCH">;
  key: string;          /* 정규화 키 */
  label: string;        /* 사람이 읽는 키 */
  field?: string;
  fieldKo?: string;
  source: "A" | "B" | "AB";
  a?: Val; b?: Val;
  lines: { A?: number; B?: number };
  message: string;
  hint?: string;
}
export interface Cell { field: string; status: Status | "ONLY"; a?: Val; b?: Val; finding?: string }
export interface GridRow { key: string; label: string; lineA?: number; lineB?: number; status: Status; cells: Cell[] }
export interface Result { schema: Schema; A: Parsed; B: Parsed; findings: Finding[]; grid: GridRow[]; counts: Record<Status, number> }

const firstByKey = (rows: Row[]) => { const m = new Map<string, Row>(); rows.forEach((r) => { if (!m.has(r.key)) m.set(r.key, r); }); return m; };

export function reconcile(docA: SourceDoc, docB: SourceDoc, schema: Schema, adapter: SchemaAdapter = DeterministicAdapter): Result {
  const A = adapter.parse(docA, schema), B = adapter.parse(docB, schema);
  const findings: Finding[] = [];
  let n = 0;
  const add = (f: Omit<Finding, "id">) => { const id = "F" + String(++n).padStart(2, "0"); findings.push({ id, ...f }); return id; };
  const fieldKo = (id: string) => schema.fields.find((f) => f.id === id)?.ko || id;
  const totalKeys = new Set(schema.rules.filter((r): r is Extract<typeof r, { kind: "totalRow" }> => r.kind === "totalRow").map((r) => normKey(r.totalKey)));

  /* 1) 중복 키 — 원천 안에서 */
  for (const P of [A, B]) {
    const seen = new Map<string, Row>();
    for (const r of P.rows) {
      const prev = seen.get(r.key);
      if (prev) add({ status: "DUP", key: r.key, label: r.rawKey, source: P.id, lines: { [P.id]: r.line }, message: `${P.name}에 같은 ${schema.keyKo}가 두 번 있습니다(${prev.line}행 · ${r.line}행) — 첫 행으로 대조하고, 중복 행은 확정 전까지 보류합니다` });
      else seen.set(r.key, r);
    }
  }
  const mA = firstByKey(A.rows.filter((r) => !totalKeys.has(r.key)));
  const mB = firstByKey(B.rows.filter((r) => !totalKeys.has(r.key)));

  /* 2) 행 누락 */
  for (const [k, r] of mA) if (!mB.has(k) && schema.coverage === "both")
    add({ status: "MISSING", key: k, label: r.rawKey, source: "B", lines: { A: r.line }, message: `${A.name}의 ${r.rawKey}가 ${B.name}에 없습니다` });
  for (const [k, r] of mB) if (!mA.has(k))
    add({ status: "MISSING", key: k, label: r.rawKey, source: "A", lines: { B: r.line }, message: `${B.name}의 ${r.rawKey}가 ${A.name}에 없습니다` });

  /* 3) 셀 대조 — 두 원천 모두 그 열을 가진 필드만 */
  const cmpFields = schema.fields.filter((f) => f.compare && A.columns.includes(f.id) && B.columns.includes(f.id));
  const cellFinding = new Map<string, string>();
  for (const [k, ra] of mA) {
    const rb = mB.get(k);
    if (!rb) continue;
    for (const f of cmpFields) {
      const a = ra.values[f.id], b = rb.values[f.id];
      if (!a || !b) {
        const id = add({ status: "MISSING", key: k, label: ra.rawKey, field: f.id, fieldKo: f.ko, source: !a ? "A" : "B", a, b, lines: { A: ra.line, B: rb.line }, message: `${f.ko} 값이 ${!a ? A.name : B.name}에 비어 있습니다` });
        cellFinding.set(k + "|" + f.id, id); continue;
      }
      let same: boolean;
      if (f.type === "text") same = a.base === b.base;
      else if (f.type === "date") same = a.base === b.base;
      else same = Math.abs((a.base as number) - (b.base as number)) <= tolerance(a, b);
      if (!same) {
        const id = add({ status: "MISMATCH", key: k, label: ra.rawKey, field: f.id, fieldKo: f.ko, source: "AB", a, b, lines: { A: ra.line, B: rb.line },
          message: `${f.ko}: ${A.name} ${a.raw} (${fmt(a)}) ↔ ${B.name} ${b.raw} (${fmt(b)})`, hint: diagnose(a, b) });
        cellFinding.set(k + "|" + f.id, id);
      }
    }
  }

  /* 4) 규칙 — 원천 안의 날짜 순서 · 수량×단가=금액 · 합계 행 · 기간 메타 */
  const ruleHits = new Map<string, string>();
  for (const P of [A, B]) {
    const rows = [...firstByKey(P.rows).values()];
    for (const rule of schema.rules) {
      if (rule.kind === "dateOrder") {
        for (const r of rows) {
          const s = r.values[rule.start], e = r.values[rule.end];
          if (s && e && (s.base as number) > (e.base as number)) {
            const id = add({ status: "ANOMALY", key: r.key, label: r.rawKey, field: rule.end, fieldKo: rule.ko, source: P.id, a: s, b: e, lines: { [P.id]: r.line }, message: `${rule.ko} 역전 — 시작 ${isoDate(s.base as number)} 가 종료 ${isoDate(e.base as number)} 보다 늦습니다` });
            ruleHits.set(P.id + "|" + r.key, id);
          }
        }
      } else if (rule.kind === "product") {
        for (const r of rows) {
          const q = r.values[rule.qty], p = r.values[rule.price], t = r.values[rule.total];
          if (!q || !p || !t) continue;
          const calc = (q.base as number) * (p.base as number);
          const tol = Math.abs(q.base as number) * p.step / 2 + t.step / 2 + 1e-9 * Math.abs(calc);
          if (Math.abs(calc - (t.base as number)) > tol) {
            const id = add({ status: "ANOMALY", key: r.key, label: r.rawKey, field: rule.total, fieldKo: rule.ko, source: P.id, a: { ...t, base: calc, raw: `${q.raw} × ${p.raw}${p.unit !== "원" ? p.unit : ""}` }, b: t, lines: { [P.id]: r.line },
              message: `${rule.ko} — 수량×단가 ${Math.round(calc).toLocaleString("ko-KR")}원 ↔ 기재 ${fmt(t)} (허용 오차 ${Math.round(tol).toLocaleString("ko-KR")}원 초과)` });
            ruleHits.set(P.id + "|" + r.key, id);
          }
        }
      } else if (rule.kind === "totalRow") {
        const tot = P.rows.find((r) => r.key === normKey(rule.totalKey));
        if (!tot) continue;
        const parts = rows.filter((r) => r.key !== tot.key);
        for (const fid of rule.fields) {
          const t = tot.values[fid];
          if (!t) continue;
          const vals = parts.map((r) => r.values[fid]).filter(Boolean) as Val[];
          const sum = vals.reduce((s, v) => s + (v.base as number), 0);
          const tol = t.step / 2 + vals.reduce((s, v) => s + v.step / 2, 0);
          if (Math.abs(sum - (t.base as number)) > tol) {
            add({ status: "ANOMALY", key: tot.key, label: tot.rawKey, field: fid, fieldKo: fieldKo(fid), source: P.id, a: { ...t, base: sum, raw: `${parts.length}개 행 합계` }, b: t, lines: { [P.id]: tot.line },
              message: `${rule.ko} — ${fieldKo(fid)} 행 합계 ${fmt({ ...t, base: sum })} ↔ 합계 행 ${t.raw} (${fmt(t)})`, hint: diagnose({ ...t, base: sum }, t) });
          }
        }
      } else if (rule.kind === "metaRange") {
        for (const m of P.meta.filter((x) => x.id === rule.meta)) {
          if (m.start && m.end && (m.start.base as number) > (m.end.base as number))
            add({ status: "ANOMALY", key: normKey(m.ko), label: m.ko, source: P.id, a: m.start, b: m.end, lines: { [P.id]: m.line }, message: `${rule.ko} 역전 — ${m.raw}` });
        }
      }
    }
  }

  /* 5) 화면용 격자 — 키 하나에 한 줄, 셀마다 상태 */
  const keys = [...new Set([...A.rows.map((r) => r.key), ...B.rows.map((r) => r.key)])];
  const shown = schema.fields.filter((f) => A.columns.includes(f.id) || B.columns.includes(f.id));
  const grid: GridRow[] = keys.map((k) => {
    const ra = mA.get(k) || A.rows.find((r) => r.key === k), rb = mB.get(k) || B.rows.find((r) => r.key === k);
    const cells: Cell[] = shown.map((f) => {
      const a = ra?.values[f.id], b = rb?.values[f.id];
      const fid = cellFinding.get(k + "|" + f.id);
      const fd = fid ? findings.find((x) => x.id === fid) : undefined;
      const st: Cell["status"] = fd ? fd.status : a && b ? "MATCH" : "ONLY";
      return { field: f.id, status: st, a, b, finding: fid };
    });
    const rowF = findings.filter((x) => x.key === k);
    const order: Status[] = ["MISSING", "DUP", "ANOMALY", "MISMATCH"];
    const status = order.find((s) => rowF.some((x) => x.status === s)) || "MATCH";
    return { key: k, label: ra?.rawKey || rb?.rawKey || k, lineA: ra?.line, lineB: rb?.line, status, cells };
  });
  /* 기간 메타 이상은 행이 아니므로 격자 맨 아래 줄로 */
  for (const f of findings) if (!keys.includes(f.key)) grid.push({ key: f.key, label: f.label, lineA: f.lines.A, lineB: f.lines.B, status: f.status, cells: [] });

  const counts = { MATCH: 0, MISMATCH: 0, MISSING: 0, DUP: 0, ANOMALY: 0 } as Record<Status, number>;
  grid.forEach((g) => g.cells.forEach((c) => { if (c.status === "MATCH") counts.MATCH++; }));
  findings.forEach((f) => counts[f.status]++);
  void ruleHits;
  return { schema, A, B, findings, grid, counts };
}

/* ---------- 사람 승인(HITL) · 정제 CSV · 감사기록 ---------- */
export type Action = "TAKE_A" | "TAKE_B" | "EDIT" | "HOLD";
export const ACTION_KO: Record<Action, string> = { TAKE_A: "원천 A 채택", TAKE_B: "원천 B 채택", EDIT: "직접 수정", HOLD: "보류" };
export interface Decision { findingId: string; action: Action; value?: string; reason: string; reviewer: string; at: string }

/** 확정 가능 여부 — 사유가 없으면 확정할 수 없다(감사기록의 핵심) */
export function validateDecision(d: Partial<Decision>): string | null {
  if (!d.action) return "처리 방법을 고르세요";
  if (!d.reason || d.reason.trim().length < 4) return "사유를 4자 이상 적어야 확정됩니다";
  if (!d.reviewer || !d.reviewer.trim()) return "검토자 이름이 필요합니다";
  if (d.action === "EDIT" && !(d.value && d.value.trim())) return "직접 수정 값을 입력하세요";
  return null;
}

const csvCell = (s: string) => (/[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s);

/** 정제 CSV — 원천 A 를 바탕으로, 결정된 셀은 결정 값으로, 보류 · 미결은 상태 열에 남긴다 */
export function cleanCsv(res: Result, decisions: Decision[]): string {
  const dec = new Map(decisions.map((d) => [d.findingId, d]));
  const fields = res.schema.fields.filter((f) => res.A.columns.includes(f.id) || res.B.columns.includes(f.id));
  const head = [res.schema.keyKo, ...fields.map((f) => f.ko + (f.type === "money" ? "(원)" : f.type === "area" ? "(㎡)" : "")), "검수상태", "근거"];
  const out = [head.map(csvCell).join(",")];
  for (const g of res.grid) {
    if (!g.cells.length) continue;
    const rowF = res.findings.filter((f) => f.key === g.key);
    const notes: string[] = [];
    let state = rowF.length ? "확정" : "일치";
    const vals = g.cells.map((c) => {
      const f = c.finding ? res.findings.find((x) => x.id === c.finding) : undefined;
      const base = c.a || c.b;
      if (!f) return base ? fmt(base).replace(/[원㎡]$/, "").replace(/,/g, "") : "";
      const d = dec.get(f.id);
      if (!d) { state = "미결"; return ""; }
      notes.push(`${f.id}:${ACTION_KO[d.action]}`);
      if (d.action === "HOLD") { state = "보류"; return ""; }
      const v = d.action === "TAKE_A" ? c.a : d.action === "TAKE_B" ? c.b : undefined;
      return d.action === "EDIT" ? (d.value || "") : v ? fmt(v).replace(/[원㎡]$/, "").replace(/,/g, "") : "";
    });
    for (const f of rowF.filter((x) => !x.field || !g.cells.some((c) => c.finding === x.id))) {
      const d = dec.get(f.id);
      if (!d) state = "미결"; else { notes.push(`${f.id}:${ACTION_KO[d.action]}`); if (d.action === "HOLD") state = "보류"; }
    }
    out.push([g.label, ...vals, state, notes.join(" ")].map(csvCell).join(","));
  }
  return out.join("\n") + "\n";
}

export function auditTrail(res: Result, decisions: Decision[], scenarioId: string) {
  const dec = new Map(decisions.map((d) => [d.findingId, d]));
  return {
    kind: "ReconcileGate audit trail",
    label: "개인 구현 · 공개 시연 (가상 벤치마크 데이터)",
    scenario: scenarioId,
    engine: { adapter: DeterministicAdapter.name, deterministic: true, tolerance: "두 원문 중 거친 눈금의 절반" },
    sources: [res.A, res.B].map((p) => ({ id: p.id, name: p.name, format: p.format, rows: p.rows.length, unknownColumns: p.unknown })),
    summary: { ...res.counts, decided: decisions.length, open: res.findings.filter((f) => !dec.has(f.id)).length },
    items: res.findings.map((f) => ({
      finding: f.id, status: f.status, key: f.label, field: f.fieldKo || null,
      sourceA: f.a ? { raw: f.a.raw, normalized: fmt(f.a), line: f.lines.A ?? null } : null,
      sourceB: f.b ? { raw: f.b.raw, normalized: fmt(f.b), line: f.lines.B ?? null } : null,
      message: f.message, hint: f.hint || null,
      decision: dec.has(f.id) ? { ...dec.get(f.id)!, actionKo: ACTION_KO[dec.get(f.id)!.action] } : null,
    })),
  };
}
