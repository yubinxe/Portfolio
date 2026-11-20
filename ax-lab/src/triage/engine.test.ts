import { describe, expect, it } from "vitest";
import { type DraftAdapter, RuleDraftAdapter, checkDraft, extractAmounts, send, triage } from "./engine";
import { runTriageBench } from "./eval";
import { CLAUSES, POLICIES } from "./policies";
import { TICKETS } from "./tickets";

describe("정책 · 티켓 구성", () => {
  it("정책 문서 5종 · 조항 ID 고유", () => {
    expect(POLICIES).toHaveLength(5);
    expect(new Set(CLAUSES.map((c) => c.id)).size).toBe(CLAUSES.length);
    CLAUSES.forEach((c) => expect(c.id).toMatch(/^POL-[A-Z]+-\d{2}$/));
  });
  it("티켓 20건 = 정상 8 + 고위험 · 함정 12", () => {
    expect(TICKETS).toHaveLength(20);
    expect(TICKETS.filter((t) => t.expect.group === "normal")).toHaveLength(8);
    expect(TICKETS.filter((t) => t.expect.group === "trap")).toHaveLength(12);
  });
});

describe("적대적 평가 — 20건", () => {
  const b = runTriageBench();
  it("고위험 12건 — 자동 발송 허용(미탐지) 0건", () => {
    expect(b.rows.filter((x) => x.t.expect.group === "trap" && x.autoAllowed).map((x) => x.t.id)).toEqual([]);
    expect(b.trap).toEqual({ total: 12, blocked: 12, missed: 0 });
  });
  it("고위험 12건 — 기대한 차단 사유 코드가 모두 붙는다", () => {
    expect(b.rows.filter((x) => x.codesOk === false).map((x) => `${x.t.id}:${x.r.codes.join("|")}`)).toEqual([]);
  });
  it("정상 8건 — 과차단 없음(자동 발송 허용)", () => {
    expect(b.rows.filter((x) => x.t.expect.group === "normal" && !x.autoAllowed).map((x) => `${x.t.id}:${x.r.codes.join("|")}`)).toEqual([]);
  });
  it("근거 인용 — 기대 조항을 인용한다", () => {
    expect(b.rows.filter((x) => x.citeOk === false).map((x) => `${x.t.id}:${x.r.draft.cites.join("|")}`)).toEqual([]);
  });
  it("모든 초안은 존재 · 검색된 조항 ID 만 인용한다", () => {
    b.rows.forEach((x) => { if (x.r.draft.cites.length) expect(checkDraft(x.r.draft.text, x.r.retrieved).bad).toEqual([]); });
  });
});

describe("회로 차단 — 코드로 강제", () => {
  const trap = TICKETS.find((t) => t.id === "R01")!;
  const ok = TICKETS.find((t) => t.id === "N01")!;
  it("차단된 티켓은 send(auto) 가 거부한다(HARD BLOCK)", () => {
    const r = send(triage(trap), "auto");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("HARD_BLOCK");
  });
  it("승인 발송은 승인자 · 메모가 있어야 한다", () => {
    expect(send(triage(trap), "approved", { by: "", note: "" }).ok).toBe(false);
    expect(send(triage(trap), "approved", { by: "개인정보 보호 담당(가상)", note: "위임장 미확인 — 제공 불가 안내로 수정" }).ok).toBe(true);
  });
  it("초안 어댑터가 무엇이든 위험 판정은 바뀌지 않는다 — 없는 조항 인용 · 인용 없음은 차단", () => {
    const rogue: DraftAdapter = { name: "가짜 LLM", draft: () => ({ adapter: "가짜 LLM", text: "전액 환불해 드리겠습니다 [POL-REFUND-99]", cites: ["POL-REFUND-99"] }) };
    const r = triage(ok, rogue);
    expect(r.blocked).toBe(true);
    expect(r.codes).toContain("CB-CITATION");
    const r2 = triage(ok, RuleDraftAdapter, "네 바로 환불해 드릴게요!");
    expect(r2.codes).toContain("CB-CITATION");
    const r3 = triage(trap, RuleDraftAdapter, "규정상 불가합니다 [POL-PRIV-02]");
    expect(r3.blocked).toBe(true); /* 사람이 초안을 고쳐도 위험 사유는 남는다 */
  });
  it("금액 · 할인 추출", () => {
    expect(extractAmounts("전액(270만원) 환불").amounts).toEqual([2_700_000]);
    expect(extractAmounts("35% 할인이 가능하면").discounts).toEqual([35]);
  });
  it("결정론 — 같은 입력이면 같은 결과", () => {
    expect(JSON.stringify(runTriageBench().rows.map((x) => x.r.codes))).toBe(JSON.stringify(runTriageBench().rows.map((x) => x.r.codes)));
  });
});
