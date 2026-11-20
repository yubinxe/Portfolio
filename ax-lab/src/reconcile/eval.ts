/* 자동 검증 — 심은 결함 15건을 모두 잡았는지(검출), 심지 않은 곳에서 신호를 냈는지(오탐)를 센다.
 * 화면의 '자동 검증 리포트'와 vitest · 빌드 리포트(ax/eval-report.json)가 모두 이 함수 하나를 쓴다 */
import { type Finding, reconcile } from "./engine";
import { SCENARIOS, type Defect, type Expect, type Scenario } from "./scenarios";
import { normKey } from "./units";

export interface DefectResult { defect: Defect; detected: boolean; matched: string[] }
export interface ScenarioResult { scenario: Scenario; defects: DefectResult[]; falsePositives: Finding[]; findings: number }
export interface Bench { scenarios: ScenarioResult[]; planted: number; detected: number; falsePositives: number; signals: number }

const hit = (f: Finding, e: Expect) => f.status === e.status && f.key === normKey(e.key) && (!e.field || f.field === e.field);

export function runScenario(s: Scenario): ScenarioResult {
  const r = reconcile(s.A, s.B, s.schema);
  const used = new Set<string>();
  const defects = s.defects.map((d) => {
    const matched: string[] = [];
    const ok = d.expect.every((e) => { const f = r.findings.find((x) => hit(x, e)); if (f) { matched.push(f.id); used.add(f.id); } return !!f; });
    return { defect: d, detected: ok, matched };
  });
  return { scenario: s, defects, falsePositives: r.findings.filter((f) => !used.has(f.id)), findings: r.findings.length };
}

export function runBenchmark(list: Scenario[] = SCENARIOS): Bench {
  const scenarios = list.map(runScenario);
  return {
    scenarios,
    planted: scenarios.reduce((s, x) => s + x.defects.length, 0),
    detected: scenarios.reduce((s, x) => s + x.defects.filter((d) => d.detected).length, 0),
    falsePositives: scenarios.reduce((s, x) => s + x.falsePositives.length, 0),
    signals: scenarios.reduce((s, x) => s + x.findings, 0),
  };
}
