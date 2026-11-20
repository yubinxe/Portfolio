/* 빌드 리포트 — Vitest 실행 결과(.vitest.json)와 세 벤치마크를 다시 돌린 값을 ../ax/eval-report.json 에 남긴다.
 * 포트폴리오(sections.jsx AX_C)의 수치는 이 파일과 같아야 하고, 포트폴리오 테스트(test/ax-c.test.mjs)가 대조한다 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { runBenchmark } from "../src/reconcile/eval";
import { runTriageBench } from "../src/triage/eval";
import { runVerifierBench } from "../src/verifier/eval";

const root = resolve(__dirname, "..");
const vt = JSON.parse(readFileSync(resolve(root, ".vitest.json"), "utf8"));
const files: Record<string, { tests: number; passed: number }> = {};
for (const f of vt.testResults) {
  const id = String(f.name).includes("/reconcile/") ? "C-1" : String(f.name).includes("/triage/") ? "C-2" : "C-3";
  const t = f.assertionResults.length, p = f.assertionResults.filter((a: { status: string }) => a.status === "passed").length;
  files[id] = { tests: (files[id]?.tests || 0) + t, passed: (files[id]?.passed || 0) + p };
}
const r = runBenchmark(), t = runTriageBench(), v = runVerifierBench();
const report = {
  label: "개인 구현 · 공개 시연 (가상 벤치마크 검증)",
  generated: "npm run build (ax-lab) — vitest run 결과와 벤치마크 재실행 값",
  vitest: { total: vt.numTotalTests, passed: vt.numPassedTests, failed: vt.numFailedTests, success: vt.success },
  apps: {
    "C-1": { id: "reconcile-gate", tests: files["C-1"], planted: r.planted, detected: r.detected, falsePositives: r.falsePositives, scenarios: r.scenarios.length },
    "C-2": { id: "ops-triage", tests: files["C-2"], tickets: t.rows.length, trap: t.trap, normal: t.normal, cite: t.cite, codes: t.codes },
    "C-3": { id: "claim-verifier", tests: files["C-3"], cases: v.cases.length, detected: v.detected, located: v.located, falsePositives: v.falsePositives, clean: v.clean },
  },
};
writeFileSync(resolve(root, "../ax/eval-report.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report.apps));
if (!vt.success) { console.error("Vitest 실패 — 리포트는 남겼지만 빌드를 실패로 끝냅니다"); process.exit(1); }
