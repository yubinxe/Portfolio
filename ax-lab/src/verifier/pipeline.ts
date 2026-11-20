/* 2단계 파이프라인.
 * Stage 1(초안) — 원천 토큰을 템플릿에 채워 1페이지 브리핑을 만든다(공개 시연은 결정론적 생성기, LLM 생성기는 같은 자리에 끼울 수 있음).
 * Stage 2(독립 검증) — 생성기가 무엇이었든 초안 '글자'만 다시 읽어, 문장마다 숫자 · 날짜 · 고유명사를 인용한 원문 줄과 1:1 대조한다 */
import { CAUSAL_RE, type Role, type Tok, roleOf, sameVal, tokens } from "./claims";
import { SOURCES, lineTokens, sourceById } from "./sources";

export type Section = "결론" | "지표" | "리스크" | "권고";
export interface Sentence { id: string; section: Section; text: string }
export interface Memo { title: string; sentences: Sentence[] }

/* ---------- Stage 1 ---------- */
const PLAN: [string, Section, string][] = [
  ["C1", "결론", "3분기 매출은 {S1:2:당기}으로 전년 동기({S1:2:전년}) 대비 {S1:2:증감} 증가했다. [S1:2]"],
  ["C2", "결론", "영업이익은 {S1:3:당기}으로 전년 동기 대비 {S1:3:증감} 증가했다. [S1:3]"],
  ["C3", "지표", "3분기 신규 계약은 {S1:4:당기}으로 전년 동기({S1:4:전년}) 대비 {S1:4:증감} 늘었다. [S1:4]"],
  ["C4", "지표", "고객 해지율은 {S1:5:당기}로 전년 동기 {S1:5:전년}에서 {S1:5:증감|abs} 낮아졌다. [S1:5]"],
  ["C5", "지표", "중소 화주 대상 물류 SaaS 시장은 {S2:2:year} {S2:2:money} 규모, 연평균 성장률 {S2:3:%}로 추정된다. [S2:2][S2:3]"],
  ["C6", "리스크", "화물 운송 실적 전자신고 의무화가 {S3:2:date}부터 연 매출 {S3:3:money} 이상 화주에 시행된다. [S3:2][S3:3]"],
  ["C7", "리스크", "인터뷰한 고객사 {S4:2:곳#1} 중 {S4:2:곳#2}이 전자신고 대응 기능을 우선 요구했다. [S4:2]"],
  ["C8", "리스크", "경쟁사 {S2:4:entity}은 {S2:4:ym} 가격을 {S2:4:%} 인상했다. [S2:4]"],
  ["C9", "리스크", "해지 고객 인터뷰 {S4:4:건#1} 중 {S4:4:건#2}은 기능 부족을 해지 이유로 들었다. [S4:4]"],
  ["C10", "권고", "{S3:2:date} 시행 전 전자신고 대응 기능을 우선 출시할 것을 권고한다. [S3:2][S4:2]"],
];

export interface DraftGenerator { readonly name: string; generate(): Memo }
export const TemplateGenerator: DraftGenerator = {
  name: "템플릿 생성기(공개 시연 · 결정론)",
  generate() {
    const fill = (tpl: string) => tpl.replace(/\{(S\d):(\d+):([^}#|]+)(?:#(\d))?(\|abs)?\}/g, (_, sid: string, ln: string, sel: string, nth?: string, abs?: string) => {
      const toks = lineTokens(sourceById(sid)!, +ln).filter((t) => (t.role ? t.role === sel : t.unit === sel));
      const t = toks[nth ? +nth - 1 : 0];
      if (!t) throw new Error(`Stage 1: ${sid}:${ln} 에서 ${sel} 를 찾지 못함`);
      return abs ? t.raw.replace(/^-/, "") : t.raw;
    });
    return { title: "3분기 경영 브리핑 — 전자신고 의무화 대응(가상 기업)", sentences: PLAN.map(([id, section, tpl]) => ({ id, section, text: fill(tpl) })) };
  },
};

/* ---------- Stage 2 ---------- */
export type Verdict = "VERIFIED" | "MISMATCH" | "UNVERIFIED" | "NO_CLAIM";
export interface Issue { kind: "value" | "unit" | "period" | "entity" | "causal" | "nosource" | "elsewhere" | "nocite"; verdict: "MISMATCH" | "UNVERIFIED"; draft?: Tok; source?: Tok; at?: string; note: string }
export interface Check { tok: Tok; ok: boolean; at?: string; source?: Tok }
export interface SentenceResult { s: Sentence; verdict: Verdict; cites: { sid: string; line: number }[]; checks: Check[]; issues: Issue[]; body: string }

const CITE_RE = /\[(S\d):(\d+)\]/g;
const where = (sid: string, line: number) => `${sid}:${line}`;

export function verifySentence(s: Sentence): SentenceResult {
  const cites = [...s.text.matchAll(CITE_RE)].map((m) => ({ sid: m[1], line: +m[2] }));
  const body = s.text.replace(CITE_RE, "").trim();
  const draft = tokens(body);
  let prev = 0;
  draft.forEach((t) => { if (t.unit !== "entity") { t.role = roleOf(body, t, prev); prev = t.end; } });
  const issues: Issue[] = [], checks: Check[] = [];
  if (!draft.length) return { s, verdict: "NO_CLAIM", cites, checks, issues, body };
  if (!cites.length) {
    issues.push({ kind: "nocite", verdict: "UNVERIFIED", note: "출처 표기가 없습니다" });
    return { s, verdict: "UNVERIFIED", cites, checks, issues, body };
  }
  const pool = cites.flatMap((c) => { const src = sourceById(c.sid); return src ? lineTokens(src, c.line).map((t) => ({ t, at: where(c.sid, c.line) })) : []; });
  const badCite = cites.filter((c) => !sourceById(c.sid)?.lines[c.line - 1]);
  badCite.forEach((c) => issues.push({ kind: "nosource", verdict: "UNVERIFIED", at: where(c.sid, c.line), note: `${where(c.sid, c.line)} 은(는) 없는 원문 줄입니다` }));

  for (const d of draft) {
    const same = pool.filter((p) => sameVal(p.t, d));
    if (same.length) {
      const roleClash = d.unit !== "entity" && same.every((p) => p.t.role && d.role && p.t.role !== d.role);
      if (roleClash) {
        const p = same[0];
        issues.push({ kind: "period", verdict: "MISMATCH", draft: d, source: p.t, at: p.at, note: `기간 · 지표 혼동 — 원문에서 ${p.t.raw}는 ‘${p.t.role}’ 값인데 초안은 ‘${d.role}’로 썼습니다` });
        checks.push({ tok: d, ok: false, at: p.at, source: p.t });
      } else checks.push({ tok: d, ok: true, at: same[0].at, source: same[0].t });
      continue;
    }
    /* 숫자는 같은데 단위만 다름(%p ↔ %, 억원 ↔ 백만원 표기) */
    const mant = (t: Tok) => t.raw.replace(/[^\d.]/g, "");
    const unitSwap = pool.find((p) => p.t.unit !== d.unit && p.t.unit !== "entity" && mant(p.t) === mant(d) && mant(d) !== "")
      || pool.find((p) => p.t.unit === d.unit && d.unit === "money" && mant(p.t) === mant(d));
    if (unitSwap) {
      issues.push({ kind: "unit", verdict: "MISMATCH", draft: d, source: unitSwap.t, at: unitSwap.at, note: `단위 변형 — 원문 ${unitSwap.t.raw} vs 초안 ${d.raw}` });
      checks.push({ tok: d, ok: false, at: unitSwap.at, source: unitSwap.t }); continue;
    }
    /* 같은 단위 · 같은 역할의 다른 값 → 수치 불일치(가장 가까운 값) */
    const cand = pool.filter((p) => p.t.unit === d.unit && (!p.t.role || !d.role || p.t.role === d.role));
    if (cand.length) {
      const near = d.unit === "entity" || typeof d.value !== "number" ? cand[0]
        : cand.slice().sort((a, b) => Math.abs((a.t.value as number) - (d.value as number)) - Math.abs((b.t.value as number) - (d.value as number)))[0];
      const kind = d.unit === "entity" ? "entity" : "value";
      issues.push({ kind, verdict: "MISMATCH", draft: d, source: near.t, at: near.at, note: `${kind === "entity" ? "고유명사" : d.unit === "date" || d.unit === "ym" || d.unit === "year" ? "날짜" : "수치"} 불일치 — 원문 ${near.t.raw} vs 초안 ${d.raw}` });
      checks.push({ tok: d, ok: false, at: near.at, source: near.t }); continue;
    }
    /* 인용한 줄에는 없고 다른 원천에 있으면 — 출처 혼동 */
    let elsewhere: string | undefined;
    for (const src of SOURCES) src.lines.forEach((_, i) => { if (!elsewhere && lineTokens(src, i + 1).some((t) => sameVal(t, d))) elsewhere = where(src.id, i + 1); });
    issues.push(elsewhere
      ? { kind: "elsewhere", verdict: "UNVERIFIED", draft: d, at: elsewhere, note: `출처 혼동 — ${d.raw}는 인용한 줄이 아니라 ${elsewhere}에 있습니다` }
      : { kind: "nosource", verdict: "UNVERIFIED", draft: d, note: `원문 근거 없음 — ${d.raw}` });
    checks.push({ tok: d, ok: false, at: elsewhere });
  }
  /* 인과 표현 — 초안에 있으면 인용한 원문 줄에도 있어야 한다 */
  const cm = body.match(CAUSAL_RE);
  if (cm && !cites.some((c) => CAUSAL_RE.test(sourceById(c.sid)?.lines[c.line - 1] || "")))
    issues.push({ kind: "causal", verdict: "UNVERIFIED", note: `원문에 없는 인과관계 — ‘${cm[0].trim()}’` });

  const verdict: Verdict = issues.some((i) => i.verdict === "MISMATCH") ? "MISMATCH" : issues.length ? "UNVERIFIED" : "VERIFIED";
  return { s, verdict, cites, checks, issues, body };
}

export const verifyMemo = (m: Memo) => m.sentences.map(verifySentence);

/* ---------- 승인 게이트 · 내보내기 ---------- */
export interface Resolution { kind: "fix" | "delete" | "waive"; note?: string; by?: string }
export function gate(results: SentenceResult[], res: Record<string, Resolution>) {
  const open = results.filter((r) => (r.verdict === "MISMATCH" || r.verdict === "UNVERIFIED") && !res[r.s.id]);
  const waived = results.filter((r) => res[r.s.id]?.kind === "waive");
  return { open, waived, canExport: open.length === 0 };
}

/** 원문 값으로 교정 — 불일치 토큰을 원문 표기로 바꾼다(고유명사 · 날짜 · 수치 · 단위). 근거 없음은 교정할 수 없다 */
export function autoFix(r: SentenceResult): string | null {
  const fixes = r.issues.filter((i) => i.verdict === "MISMATCH" && i.draft && i.source);
  /* 근거 없음 · 기간 혼동은 문장 구조를 사람이 고쳐야 하므로 자동 교정하지 않는다 */
  if (!fixes.length || r.issues.some((i) => i.verdict === "UNVERIFIED") || fixes.some((i) => i.kind === "period")) return null;
  let body = r.body;
  for (const i of fixes.slice().sort((a, b) => b.draft!.start - a.draft!.start))
    body = body.slice(0, i.draft!.start) + i.source!.raw.replace(/^-/, "") + body.slice(i.draft!.end);
  return body + " " + r.cites.map((c) => `[${c.sid}:${c.line}]`).join("");
}

export function exportMemo(m: Memo, results: SentenceResult[], res: Record<string, Resolution>): string {
  const g = gate(results, res);
  if (!g.canExport) throw new Error("미해결 MISMATCH · UNVERIFIED 가 남아 있어 내보낼 수 없습니다");
  const secs: Section[] = ["결론", "지표", "리스크", "권고"];
  const lines = [`# ${m.title}`, ""];
  if (g.waived.length) lines.push(`> ⚠ 검증 예외 ${g.waived.length}건 포함 — ${g.waived.map((w) => `${w.s.id}(${res[w.s.id].by}: ${res[w.s.id].note})`).join(", ")}`, "");
  for (const sec of secs) {
    const rows = results.filter((r) => r.s.section === sec && res[r.s.id]?.kind !== "delete");
    if (!rows.length) continue;
    lines.push(`## ${sec === "지표" ? "주요 지표" : sec === "권고" ? "권고안" : sec === "결론" ? "핵심 결론" : "리스크"}`);
    rows.forEach((r) => lines.push(`- ${r.s.text}${res[r.s.id]?.kind === "waive" ? " ⟨검증 예외⟩" : ""}`));
    lines.push("");
  }
  lines.push("---", "Claim-to-Source Verifier · 개인 구현 · 공개 시연(가상 원천) · 모든 수치는 인용 원문 줄과 대조됨");
  return lines.join("\n") + "\n";
}
export type { Role };
