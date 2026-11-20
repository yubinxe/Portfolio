import { describe, expect, it } from "vitest";
import { DISTORTIONS, applyDistortion } from "./cases";
import { tokens } from "./claims";
import { runVerifierBench } from "./eval";
import { TemplateGenerator, autoFix, exportMemo, gate, verifyMemo, verifySentence } from "./pipeline";

describe("토큰 · Stage 1", () => {
  it("금액 · 비율 · 날짜 · 고유명사를 읽는다", () => {
    const t = tokens("2026년 1조 1,800억원, 14.2%, -0.7%p, 2027. 1. 1, 12곳, 누리솔루션, 3분기");
    expect(t.map((x) => x.unit)).toEqual(["year", "money", "%", "%p", "date", "곳", "entity"]);
    expect(t[1].value).toBe(1.18e12);
  });
  it("Stage 1 초안 — 10문장, 모든 문장에 출처 표기", () => {
    const m = TemplateGenerator.generate();
    expect(m.sentences).toHaveLength(10);
    m.sentences.forEach((s) => expect(s.text).toMatch(/\[S\d:\d+\]/));
  });
  it("깨끗한 초안은 모두 VERIFIED(오탐 0)", () => {
    const r = verifyMemo(TemplateGenerator.generate());
    expect(r.filter((x) => x.verdict !== "VERIFIED").map((x) => x.s.id + ":" + x.issues.map((i) => i.note).join("|"))).toEqual([]);
  });
});

describe("고의 왜곡 10건 벤치마크", () => {
  const b = runVerifierBench();
  it("10건", () => expect(DISTORTIONS).toHaveLength(10));
  it("10건 모두 탐지 — 기대 판정", () => {
    expect(b.cases.filter((c) => !c.detected).map((c) => `${c.d.id}:${c.target?.verdict}`)).toEqual([]);
    expect(b.detected).toBe(10);
  });
  it("10건 모두 위치 특정 — 문제 종류 · 초안 토큰 · 원문 토큰", () => {
    expect(b.cases.filter((c) => !c.located).map((c) => `${c.d.id}:${c.target?.issues.map((i) => i.kind + "/" + i.draft?.raw + "/" + i.source?.raw).join(",")}`)).toEqual([]);
  });
  it("다른 문장 오탐 0", () => {
    expect(b.falsePositives).toBe(0);
  });
});

describe("승인 게이트 · 교정 · 내보내기", () => {
  const base = TemplateGenerator.generate();
  const bad = applyDistortion(base, DISTORTIONS[0]);
  const r = verifyMemo(bad);
  it("미해결 MISMATCH 가 있으면 내보내기 차단", () => {
    expect(gate(r, {}).canExport).toBe(false);
    expect(() => exportMemo(bad, r, {})).toThrow(/내보낼 수 없/);
  });
  it("원문 값으로 교정하면 VERIFIED", () => {
    const t = r.find((x) => x.s.id === "C5")!;
    const fixed = autoFix(t)!;
    expect(fixed).toContain("14.2%");
    expect(verifySentence({ ...t.s, text: fixed }).verdict).toBe("VERIFIED");
  });
  it("근거 없음 · 기간 혼동은 자동 교정하지 않는다", () => {
    const v9 = verifyMemo(applyDistortion(base, DISTORTIONS[8])).find((x) => x.s.id === "C9")!;
    expect(autoFix(v9)).toBeNull();
    const v2 = verifyMemo(applyDistortion(base, DISTORTIONS[1])).find((x) => x.s.id === "C1")!;
    expect(autoFix(v2)).toBeNull();
  });
  it("예외 승인은 워터마크를 남긴다", () => {
    const md = exportMemo(bad, r, { C5: { kind: "waive", note: "리서치팀 수정본 확인 예정", by: "검토자(가상)" } });
    expect(md).toMatch(/검증 예외 1건 포함/);
    expect(md).toMatch(/⟨검증 예외⟩/);
  });
});
