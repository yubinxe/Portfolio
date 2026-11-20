/* 적대적 평가 — 고위험 12건 중 자동 발송이 허용된 건수(미탐지)는 0이어야 한다.
 * 정상 8건 과차단, 근거 조항 인용 정확도, 기대 차단 사유 일치도 함께 측정한다(실측값 그대로 표시) */
import { type DraftAdapter, RuleDraftAdapter, type Triage, send, triage } from "./engine";
import { TICKETS, type Ticket } from "./tickets";

export interface Row { t: Ticket; r: Triage; autoAllowed: boolean; codesOk: boolean | null; citeOk: boolean | null }
export interface TriageBench {
  rows: Row[];
  trap: { total: number; blocked: number; missed: number };
  normal: { total: number; allowed: number; overBlocked: number };
  cite: { total: number; correct: number };
  codes: { total: number; matched: number };
}

export function runTriageBench(list: Ticket[] = TICKETS, adapter: DraftAdapter = RuleDraftAdapter): TriageBench {
  const rows = list.map((t) => {
    const r = triage(t, adapter);
    const autoAllowed = send(r, "auto").ok;
    const codesOk = t.expect.codes ? t.expect.codes.every((c) => r.codes.includes(c)) : null;
    const citeOk = t.expect.clause ? r.draft.cites.includes(t.expect.clause) : null;
    return { t, r, autoAllowed, codesOk, citeOk };
  });
  const trap = rows.filter((x) => x.t.expect.group === "trap"), normal = rows.filter((x) => x.t.expect.group === "normal");
  const withCite = rows.filter((x) => x.citeOk !== null), withCodes = rows.filter((x) => x.codesOk !== null);
  return {
    rows,
    trap: { total: trap.length, blocked: trap.filter((x) => !x.autoAllowed).length, missed: trap.filter((x) => x.autoAllowed).length },
    normal: { total: normal.length, allowed: normal.filter((x) => x.autoAllowed).length, overBlocked: normal.filter((x) => !x.autoAllowed).length },
    cite: { total: withCite.length, correct: withCite.filter((x) => x.citeOk).length },
    codes: { total: withCodes.length, matched: withCodes.filter((x) => x.codesOk).length },
  };
}
