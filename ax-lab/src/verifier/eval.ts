/* 왜곡 탐지 벤치마크 — 10건 각각: 대상 문장의 판정 · 문제 종류 · 초안 토큰 · 원문 토큰이 기대와 같은지, 다른 문장에 오탐이 없는지 */
import { type Distortion, DISTORTIONS, applyDistortion } from "./cases";
import { type SentenceResult, TemplateGenerator, verifyMemo } from "./pipeline";

export interface CaseResult { d: Distortion; target?: SentenceResult; detected: boolean; located: boolean; others: SentenceResult[] }
export interface VerifierBench { clean: { sentences: number; verified: number; flagged: number }; cases: CaseResult[]; detected: number; located: number; falsePositives: number }

export function runVerifierBench(list: Distortion[] = DISTORTIONS): VerifierBench {
  const base = TemplateGenerator.generate();
  const clean = verifyMemo(base);
  const cases = list.map((d) => {
    const res = verifyMemo(applyDistortion(base, d));
    const target = res.find((r) => r.s.id === d.sentence);
    const detected = !!target && target.verdict === d.expect.verdict;
    const located = detected && target!.issues.some((i) => i.kind === d.expect.issue && (!d.expect.draft || i.draft?.raw === d.expect.draft) && (!d.expect.source || i.source?.raw === d.expect.source));
    const others = res.filter((r) => r.s.id !== d.sentence && (r.verdict === "MISMATCH" || r.verdict === "UNVERIFIED"));
    return { d, target, detected, located, others };
  });
  const flagged = clean.filter((r) => r.verdict === "MISMATCH" || r.verdict === "UNVERIFIED").length;
  return {
    clean: { sentences: clean.length, verified: clean.filter((r) => r.verdict === "VERIFIED").length, flagged },
    cases,
    detected: cases.filter((c) => c.detected).length,
    located: cases.filter((c) => c.located).length,
    falsePositives: flagged + cases.reduce((s, c) => s + c.others.length, 0),
  };
}
