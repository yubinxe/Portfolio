import { describe, expect, it } from "vitest";
import { DeterministicAdapter } from "./adapter";
import { auditTrail, cleanCsv, reconcile, validateDecision } from "./engine";
import { runBenchmark } from "./eval";
import { SCENARIOS } from "./scenarios";
import { PYEONG_M2, diagnose, normKey, parseArea, parseDate, parseMoney } from "./units";

describe("단위 · 정규화", () => {
  it("금액 — 원 · 만원 · 억원 · 혼합 표기와 눈금", () => {
    expect(parseMoney("1,250만원")!.base).toBe(12_500_000);
    expect(parseMoney("1억 2,500만원")!.base).toBe(125_000_000);
    expect(parseMoney("1,284억원")!.step).toBe(1e8);
    expect(parseMoney("12.84억원")!.step).toBe(1e6);
    expect(parseMoney("-1,340", "백만원")!.base).toBe(-1_340_000_000);
    expect(parseMoney("32", "천원")!.base).toBe(32_000);
  });
  it("면적 — 1평 = 400/121㎡, 표기 정밀도로 눈금", () => {
    expect(parseArea("84.2평")!.base).toBeCloseTo(84.2 * PYEONG_M2, 9);
    expect(parseArea("278.35㎡")!.step).toBeCloseTo(0.01, 12);
  });
  it("날짜 — 형식이 달라도 같은 날, 없는 날짜는 거부", () => {
    expect(parseDate("2026.1.5")!.base).toBe(parseDate("2026-01-05")!.base);
    expect(parseDate("2026년 1월 5일")!.base).toBe(parseDate("2026/01/05")!.base);
    expect(parseDate("2026-02-30")).toBeNull();
  });
  it("키 — 호 · 하이픈 · 띄어쓰기 · 대소문자", () => {
    expect(normKey("B-101호")).toBe(normKey("b101"));
    expect(normKey("리테일 사업부")).toBe(normKey("리테일사업부"));
  });
  it("원인 힌트 — 평/㎡ · 자릿수 · 전치", () => {
    expect(diagnose(parseArea("330.58㎡")!, parseArea("330.58평")!)).toMatch(/평 · ㎡/);
    expect(diagnose(parseMoney("141,905", "백만원")!, parseMoney("141,905억원")!)).toMatch(/×10\^2/);
    expect(diagnose(parseMoney("84,500")!, parseMoney("85,400")!)).toMatch(/전치/);
  });
});

describe("가상 벤치마크 — 결함 15건", () => {
  const b = runBenchmark();
  it("심은 결함은 15건(시나리오마다 5건)", () => {
    expect(b.planted).toBe(15);
    b.scenarios.forEach((s) => expect(s.defects).toHaveLength(5));
  });
  it("15건 모두 검출", () => {
    const miss = b.scenarios.flatMap((s) => s.defects.filter((d) => !d.detected).map((d) => d.defect.id));
    expect(miss).toEqual([]);
    expect(b.detected).toBe(15);
  });
  it("오탐 0건 — 정상 환산 · 반올림 · 키 표기 차이에서 신호를 내지 않는다", () => {
    expect(b.scenarios.flatMap((s) => s.falsePositives.map((f) => `${s.scenario.id}:${f.status}:${f.label}:${f.field ?? ""}`))).toEqual([]);
    expect(b.falsePositives).toBe(0);
  });
  it("결정론 — 두 번 돌려도 같은 결과", () => {
    expect(JSON.stringify(runBenchmark().scenarios.map((s) => s.findings))).toBe(JSON.stringify(b.scenarios.map((s) => s.findings)));
  });
});

describe("사람 승인 · 내보내기", () => {
  const s = SCENARIOS[0];
  const r = reconcile(s.A, s.B, s.schema);
  it("사유 · 검토자 없이는 확정 불가", () => {
    expect(validateDecision({ action: "TAKE_A", reason: "", reviewer: "검토자" })).toMatch(/사유/);
    expect(validateDecision({ action: "EDIT", reason: "계약서 원본 확인", reviewer: "검토자" })).toMatch(/수정 값/);
    expect(validateDecision({ action: "TAKE_A", reason: "계약서 원본 확인", reviewer: "검토자" })).toBeNull();
  });
  it("정제 CSV — 미결은 '미결', 결정은 근거 열에 남는다", () => {
    const f = r.findings.find((x) => x.status === "MISMATCH" && x.field === "rent")!;
    const csv0 = cleanCsv(r, []);
    expect(csv0).toMatch(/B-101,.*미결/);
    const csv1 = cleanCsv(r, [{ findingId: f.id, action: "TAKE_A", reason: "계약서 원본 확인", reviewer: "검토자(가상)", at: "2026-11-20T00:00:00Z" }]);
    expect(csv1).toMatch(/B-101,[^\n]*12500000[^\n]*확정[^\n]*원천 A 채택/);
  });
  it("감사기록 — 모든 신호 · 원문 · 결정 사유", () => {
    const a = auditTrail(r, [], s.id);
    expect(a.items).toHaveLength(r.findings.length);
    expect(a.summary.open).toBe(r.findings.length);
    expect(a.engine.deterministic).toBe(true);
  });
  it("인식하지 못한 열 · 형식 오류를 숨기지 않는다", () => {
    const p = DeterministicAdapter.parse({ id: "A", name: "업로드", kind: "", format: "csv", body: "코드,값\n1,2" }, s.schema);
    expect(p.warnings.join()).toMatch(/키 열/);
    const j = DeterministicAdapter.parse({ id: "B", name: "업로드", kind: "", format: "json", body: "{oops" }, s.schema);
    expect(j.warnings.join()).toMatch(/JSON/);
  });
});
