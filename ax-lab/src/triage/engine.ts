/* 트리아지 · 회로 차단 — 순수 함수. ① 의도 ② 긴급도(SLA) ③ 위험 등급 ④ 정책 조항 검색 ⑤ 회신 초안 ⑥ 차단 판정.
 * 핵심: 초안을 누가 쓰든(규칙 · 선택형 LLM) ⑥은 이 파일의 코드가 다시 계산하고, send() 는 차단된 티켓을 끝내 보내지 않는다 */
import { CLAUSES, type Clause, LIMITS, type PolicyId, clauseById } from "./policies";
import type { Ticket } from "./tickets";

export type Intent = "REFUND" | "PRIVACY" | "OUTAGE" | "CONTRACT" | "QUOTE";
export type Risk = "LOW" | "MED" | "HIGH";
export type Code = "CB-RISK-HIGH" | "CB-PII" | "CB-LEGAL" | "CB-PRESS" | "CB-REGULATOR" | "CB-EXCEPTION" | "CB-AMOUNT" | "CB-COMPOUND" | "CB-UNGROUNDED" | "CB-CITATION";

export const INTENT_KO: Record<Intent, string> = { REFUND: "환불", PRIVACY: "개인정보", OUTAGE: "장애 · 보상", CONTRACT: "계약 해지 · 갱신", QUOTE: "견적 · 할인" };
const INTENT_POLICY: Record<Intent, PolicyId> = { REFUND: "REFUND", PRIVACY: "PRIV", OUTAGE: "SLA", CONTRACT: "CONTRACT", QUOTE: "QUOTE" };
const INTENT_WORDS: Record<Intent, string[]> = {
  REFUND: ["환불", "결제 취소", "청약철회", "중복 결제"],
  PRIVACY: ["개인정보", "탈퇴", "연락처", "명의", "계정 결제", "해킹", "유출", "털렸", "마케팅 문자"],
  OUTAGE: ["장애", "접속이 안", "오류", "다운", "보상"],
  CONTRACT: ["계약", "갱신", "해지", "위약금"],
  QUOTE: ["견적", "할인", "좌석", "가격", "단가"],
};

/* 차단 규칙 사전 — 단어가 아니라 '이 단어가 있으면 사람이 본다'는 운영 규칙. 사유 코드와 담당 승인자를 함께 둔다 */
export const CODE_INFO: Record<Code, { ko: string; approver: string }> = {
  "CB-RISK-HIGH": { ko: "위험 등급 HIGH", approver: "상급 상담원" },
  "CB-PII": { ko: "개인정보 · 타인 정보 · 유출 의심", approver: "개인정보 보호 담당" },
  "CB-LEGAL": { ko: "법적 조치 · 분쟁 예고", approver: "법무 담당" },
  "CB-PRESS": { ko: "언론 · 취재 대응", approver: "대외협력 담당" },
  "CB-REGULATOR": { ko: "규제기관 · 분쟁조정 기관 언급", approver: "법무 담당" },
  "CB-EXCEPTION": { ko: "규정 예외 요구 · 지침 무시 유도", approver: "운영 책임자" },
  "CB-AMOUNT": { ko: `금액 · 할인 권한 초과(환불 ${LIMITS.refundAuto / 10000}만원 · 할인 ${LIMITS.discountAgent}%)`, approver: "팀장" },
  "CB-COMPOUND": { ko: "모호한 복합 요구(의도 3개 이상)", approver: "상급 상담원" },
  "CB-UNGROUNDED": { ko: "정책 근거 매칭 점수 미달", approver: "상급 상담원" },
  "CB-CITATION": { ko: "초안 인용이 정책 조항과 맞지 않음", approver: "상급 상담원" },
};
const LEX: [Exclude<Code, "CB-RISK-HIGH" | "CB-AMOUNT" | "CB-COMPOUND" | "CB-UNGROUNDED" | "CB-CITATION" | "CB-PII">, string[]][] = [
  ["CB-LEGAL", ["소송", "법적", "변호사", "내용증명", "고소", "법원", "손해배상 청구"]],
  ["CB-PRESS", ["기자", "언론", "보도", "취재", "기사에"]],
  ["CB-REGULATOR", ["소비자원", "공정위", "공정거래위원회", "개인정보보호위원회", "금감원", "분쟁조정", "신고하"]],
  ["CB-EXCEPTION", ["예외로", "이번만", "특별히", "규정과 달리", "지침은 무시", "무시하고", "자동으로 승인"]],
];
const PII_THIRD = ["남편", "아내", "가족", "명의", "다른 사람", "고객사 담당자", "연락처 목록", "담당자 연락처"];
const PII_ACTION = ["삭제해", "보내주", "보내 주", "알려주", "목록으로", "확인 부탁", "제공했"];
const PII_BREACH = ["해킹", "유출", "털렸", "침해"];

export const GROUND_MIN = 3; /* 조항 검색 점수 하한 — 이보다 낮으면 근거 없음(UNGROUNDED) */
export const SLA_HOURS = { P1: 2, P2: 8, P3: 24 } as const;
export const DEMO_NOW = "2026-11-20T10:00"; /* 시연 기준 시각(고정) — 같은 입력 · 같은 결과 */

const norm = (s: string) => s.normalize("NFKC").replace(/\s+/g, " ");
const has = (t: string, w: string) => t.includes(w);
const found = (t: string, ws: string[]) => ws.filter((w) => has(t, w));

export interface Hit { word: string; kind: "intent" | "risk" }
export interface ScoredClause { clause: Clause; score: number; terms: string[] }
export interface Draft { adapter: string; text: string; cites: string[] }
export interface Triage {
  ticket: Ticket; intents: Intent[]; urgency: keyof typeof SLA_HOURS; dueAt: string; minutesLeft: number;
  risk: Risk; codes: Code[]; evidence: Partial<Record<Code, string[]>>; hits: Hit[];
  amounts: number[]; discounts: number[]; retrieved: ScoredClause[]; grounding: number;
  draft: Draft; blocked: boolean; approver: string | null;
}

/** 금액(원) · 할인율(%) 추출 — "270만원", "2,400,000원", "35% 할인" */
export function extractAmounts(t: string) {
  const amounts: number[] = [], discounts: number[] = [];
  for (const m of t.matchAll(/(\d[\d,]*(?:\.\d+)?)\s*(억|만|천)?\s*원/g)) {
    const n = Number(m[1].replace(/,/g, "")) * (m[2] === "억" ? 1e8 : m[2] === "만" ? 1e4 : m[2] === "천" ? 1e3 : 1);
    amounts.push(n);
  }
  for (const m of t.matchAll(/(\d+(?:\.\d+)?)\s*%\s*(?:할인|디스카운트|DC)/gi)) discounts.push(Number(m[1]));
  return { amounts, discounts };
}

export function retrieve(text: string, intents: Intent[]): ScoredClause[] {
  const pool = intents.length ? CLAUSES.filter((c) => intents.some((i) => INTENT_POLICY[i] === c.policy)) : CLAUSES;
  return pool
    .map((clause) => { const terms = found(text, clause.terms); return { clause, terms, score: terms.reduce((s, w) => s + (w.length >= 3 ? 2 : 1), 0) }; })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.clause.id.localeCompare(b.clause.id));
}

/* ---------- 초안 어댑터 — 규칙 기반이 기본, LLM 은 같은 자리에 끼우는 선택지 ---------- */
export interface DraftContext { intents: Intent[]; retrieved: ScoredClause[] }
export interface DraftAdapter { readonly name: string; draft(t: Ticket, ctx: DraftContext): Draft }

export const RuleDraftAdapter: DraftAdapter = {
  name: "규칙 기반 초안(공개 시연 기본)",
  draft(t, ctx) {
    /* 의도마다 가장 높은 조항 하나 — 조항 회신 문장을 그대로 쓰고 ID 를 붙인다(지어낸 약속 없음) */
    const picked: Clause[] = [];
    for (const i of ctx.intents) {
      const top = ctx.retrieved.find((r) => r.clause.policy === INTENT_POLICY[i]);
      if (top && !picked.includes(top.clause)) picked.push(top.clause);
    }
    const lines = picked.map((c) => `${c.reply} [${c.id}]`);
    const text = [`안녕하세요, 문의 주셔서 감사합니다.`, ...(lines.length ? lines : ["문의하신 내용은 담당자가 확인한 뒤 회신드리겠습니다."]), `추가로 확인이 필요하시면 이 메일에 회신해 주세요.`].join("\n");
    void t;
    return { adapter: this.name, text, cites: picked.map((c) => c.id) };
  },
};

/** 선택형 LLM 어댑터 자리 — 문장만 다듬게 하고, 인용 · 차단 판정은 checkDraft() 가 다시 계산한다. 공개 시연에는 연결하지 않았다 */
export interface LLMDraftAdapter extends DraftAdapter { readonly model: string }

export const citesIn = (text: string) => [...new Set([...text.matchAll(/\[(POL-[A-Z]+-\d{2})\]/g)].map((m) => m[1]))];

/** 초안 검사 — 존재하지 않는 조항 · 검색되지 않은 조항 인용, 인용 없음 → 차단 */
export function checkDraft(text: string, retrieved: ScoredClause[]): { ok: boolean; cites: string[]; bad: string[] } {
  const cites = citesIn(text);
  const allowed = new Set(retrieved.map((r) => r.clause.id));
  const bad = cites.filter((id) => !clauseById(id) || !allowed.has(id));
  return { ok: cites.length > 0 && bad.length === 0, cites, bad };
}

export function triage(t: Ticket, adapter: DraftAdapter = RuleDraftAdapter, draftOverride?: string): Triage {
  const text = norm(t.subject + " " + t.body);
  const hits: Hit[] = [];
  const intents = (Object.keys(INTENT_WORDS) as Intent[]).filter((i) => { const w = found(text, INTENT_WORDS[i]); w.forEach((word) => hits.push({ word, kind: "intent" })); return w.length > 0; });
  const evidence: Triage["evidence"] = {};
  const codes = new Set<Code>();
  const flag = (c: Code, words: string[]) => { if (!words.length) return; codes.add(c); evidence[c] = [...(evidence[c] || []), ...words]; words.forEach((word) => hits.push({ word, kind: "risk" })); };

  for (const [code, words] of LEX) flag(code, found(text, words));
  const third = found(text, PII_THIRD), breach = found(text, PII_BREACH), act = found(text, PII_ACTION);
  if (third.length || breach.length) flag("CB-PII", [...third, ...breach]);
  else if (intents.includes("PRIVACY") && act.length) flag("CB-PII", act);

  const { amounts, discounts } = extractAmounts(text);
  const bigMoney = amounts.filter((a) => a > LIMITS.refundAuto && (intents.includes("REFUND") || intents.includes("OUTAGE")));
  const bigDisc = discounts.filter((d) => d > LIMITS.discountAgent);
  if (bigMoney.length || bigDisc.length) flag("CB-AMOUNT", [...bigMoney.map((a) => a.toLocaleString("ko-KR") + "원"), ...bigDisc.map((d) => d + "% 할인")]);
  if (intents.length >= 3) { codes.add("CB-COMPOUND"); evidence["CB-COMPOUND"] = intents.map((i) => INTENT_KO[i]); }

  const retrieved = retrieve(text, intents);
  const grounding = retrieved[0]?.score || 0;
  if (grounding < GROUND_MIN) { codes.add("CB-UNGROUNDED"); evidence["CB-UNGROUNDED"] = [`최고 점수 ${grounding} < ${GROUND_MIN}`]; }

  const auto = adapter.draft(t, { intents, retrieved });
  const draft: Draft = draftOverride != null ? { adapter: "사람이 고친 초안", text: draftOverride, cites: citesIn(draftOverride) } : auto;
  const chk = checkDraft(draft.text, retrieved);
  if (!chk.ok) { codes.add("CB-CITATION"); evidence["CB-CITATION"] = chk.bad.length ? chk.bad.map((b) => b + " 은(는) 근거로 검색되지 않은 조항") : ["초안에 조항 ID 인용 없음"]; }

  const severe: Code[] = ["CB-PII", "CB-LEGAL", "CB-PRESS", "CB-REGULATOR", "CB-EXCEPTION", "CB-AMOUNT"];
  const risk: Risk = severe.some((c) => codes.has(c)) ? "HIGH" : codes.size || intents.some((i) => i === "REFUND" || i === "CONTRACT" || i === "QUOTE") ? "MED" : "LOW";
  if (risk === "HIGH") codes.add("CB-RISK-HIGH");

  const urgency = codes.has("CB-LEGAL") || codes.has("CB-PRESS") || codes.has("CB-REGULATOR") || has(text, "지금") || has(text, "급") ? "P1" : risk === "HIGH" || intents.includes("REFUND") || intents.includes("PRIVACY") ? "P2" : "P3";
  const due = new Date(t.received + ":00Z").getTime() + SLA_HOURS[urgency] * 36e5;
  const minutesLeft = Math.round((due - new Date(DEMO_NOW + ":00Z").getTime()) / 6e4);

  const order: Code[] = ["CB-RISK-HIGH", "CB-PII", "CB-LEGAL", "CB-REGULATOR", "CB-PRESS", "CB-EXCEPTION", "CB-AMOUNT", "CB-COMPOUND", "CB-UNGROUNDED", "CB-CITATION"];
  const list = order.filter((c) => codes.has(c));
  const blocked = risk === "HIGH" || list.length > 0;
  const approver = blocked ? CODE_INFO[list.find((c) => c !== "CB-RISK-HIGH") || "CB-RISK-HIGH"].approver : null;
  return { ticket: t, intents, urgency, dueAt: new Date(due).toISOString().slice(0, 16), minutesLeft, risk, codes: list, evidence, hits, amounts, discounts, retrieved, grounding, draft: { ...draft, cites: chk.cites }, blocked, approver };
}

/** 발송 — 화면 버튼과 별개로 여기서 한 번 더 막는다(HARD BLOCK). 실제 메일 전송은 없다(시뮬레이션) */
export function send(tr: Triage, mode: "auto" | "approved", approval?: { by: string; note: string }): { ok: true; log: string } | { ok: false; code: string; reason: string } {
  if (mode === "auto" && tr.blocked) return { ok: false, code: "HARD_BLOCK", reason: `자동 발송 차단 — ${tr.codes.join(", ")}` };
  if (mode === "approved" && (!approval || !approval.by.trim() || approval.note.trim().length < 4)) return { ok: false, code: "NEED_APPROVAL", reason: "승인자 · 승인 메모(4자 이상)가 필요합니다" };
  return { ok: true, log: `${tr.ticket.id} ${mode === "auto" ? "자동 발송" : `승인 발송(${approval!.by})`} — 시뮬레이션, 실제 전송 없음` };
}
