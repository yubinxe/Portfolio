/* V8 — 범용 AX 확장 3종(C) · 6축 역량 지도 · 스캔 구조 압축.
 * 포트폴리오에 적힌 테스트 · 검증 수치는 ax/eval-report.json(ax-lab 빌드 때 Vitest 와 벤치마크를 실제로 실행한 값)과 같아야 한다 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const read = (f) => readFileSync(new URL("../" + f, import.meta.url), "utf8");
const jsx = read("sections.jsx");
const block = (start) => { const i = jsx.indexOf(start); assert.ok(i > -1, start); return jsx.slice(i, jsx.indexOf("\n];", i) + 3); };
const evalConst = (start) => new Function(block(start).replace(/^const \w+ = /, "return ").replace(/;$/, ""))();

const report = JSON.parse(read("ax/eval-report.json"));
const AX_C = evalConst("const AX_C = [");

test("ax-lab 빌드 리포트 — Vitest 전부 통과", () => {
  assert.equal(report.vitest.success, true);
  assert.equal(report.vitest.failed, 0);
  assert.equal(report.vitest.passed, report.vitest.total);
  assert.equal(report.label, "개인 구현 · 공개 시연 (가상 벤치마크 검증)");
});

test("C 3종 — 포트폴리오 수치 = 실제 실행 결과(가짜 수치 금지)", () => {
  assert.equal(AX_C.length, 3);
  const [c1, c2, c3] = AX_C, r = report.apps;
  assert.deepEqual(c1.tests, { passed: r["C-1"].tests.passed, total: r["C-1"].tests.tests });
  assert.deepEqual(c2.tests, { passed: r["C-2"].tests.passed, total: r["C-2"].tests.tests });
  assert.deepEqual(c3.tests, { passed: r["C-3"].tests.passed, total: r["C-3"].tests.tests });
  assert.deepEqual(c1.m, { planted: r["C-1"].planted, detected: r["C-1"].detected, falsePositives: r["C-1"].falsePositives });
  assert.deepEqual(c2.m, { trapTotal: r["C-2"].trap.total, trapBlocked: r["C-2"].trap.blocked, missed: r["C-2"].trap.missed, normalTotal: r["C-2"].normal.total, normalAllowed: r["C-2"].normal.allowed, citeCorrect: r["C-2"].cite.correct, citeTotal: r["C-2"].cite.total });
  assert.deepEqual(c3.m, { cases: r["C-3"].cases, detected: r["C-3"].detected, located: r["C-3"].located, falsePositives: r["C-3"].falsePositives });
  assert.equal(r["C-2"].trap.missed, 0, "고위험 미탐지 0");
});

test("C 3종 — 배포 URL 은 실제 빌드 파일, 정직성 라벨 · 슬롯 구조", () => {
  for (const c of AX_C) {
    for (const k of ["code", "ko", "en", "domains", "line", "mechanism", "url", "tests", "m"]) assert.ok(k in c, c.code + " " + k);
    if (c.url) assert.ok(existsSync(new URL("../" + c.url + "index.html", import.meta.url)), c.url);
  }
  assert.ok(jsx.includes('const AX_C_LABEL = "개인 구현 · 공개 시연 (가상 벤치마크 검증)"'));
  assert.ok(jsx.includes('id="ax-c"'), "C 섹션 앵커(앱의 돌아가기 링크)");
  assert.ok(!jsx.includes("<strong>향후 고도화</strong>"), "C 는 더 이상 '향후 고도화' 가 아님");
  for (const id of ["reconcile-gate", "ops-triage", "claim-verifier"]) {
    const html = read(`ax/${id}/index.html`);
    assert.ok(/src="\.\.\/assets\/[^"]+\.js"/.test(html), id + " 상대 경로 자산(Pages · Vercel 공통)");
  }
});

test("앱 원본 — 정직성 라벨 · 결정론(외부 호출 없음)", () => {
  assert.ok(read("ax-lab/src/shared/Shell.tsx").includes('"개인 구현 · 공개 시연 (가상 벤치마크 검증)"'));
  for (const f of ["reconcile/engine.ts", "reconcile/adapter.ts", "triage/engine.ts", "verifier/pipeline.ts", "verifier/claims.ts"]) {
    const src = read("ax-lab/src/" + f);
    assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon|Math\.random|Date\.now\(/.test(src), f + " — 외부 호출 · 난수 · 현재 시각 없음");
  }
});

test("6축 역량 지도 — 축 6개 · 실적 2개씩 · 깊은 링크 id 유지", () => {
  const ids = [...block("const HEX = [").matchAll(/id: "(dom-\d\d)"/g)].map((m) => m[1]);
  assert.equal(ids.length, 6);
  for (const id of ["dom-01", "dom-02", "dom-03", "dom-05", "dom-06"]) assert.ok(ids.includes(id), id);
  assert.ok(block("const HEX = [").includes('alias: ["dom-04"]'), "kb.js 의 #dom-04 링크");
  const wins = [...block("const HEX = [").matchAll(/wins: \[(.*)\],\n/g)];
  assert.equal(wins.length, 6);
  wins.forEach((w) => assert.equal((w[1].match(/"(actual|demo)"\]/g) || []).length, 2, "대표 실적 2개 + 구분"));
  assert.ok(!/TShapeMap|comp-stage--t/.test(jsx), "T자형 제거");
  assert.ok(!/숙련도\s*\d|\d+\s*%\s*숙련/.test(block("const HEX = [")), "점수 · 퍼센트 없음");
});

test("스캔 구조 — [문제 → 설계] 한 줄은 45자 이하", () => {
  const lines = [
    ...[...block("const CASE_INDEX = [").matchAll(/line: "([^"]+)"/g)],
    ...[...block("const HEX = [").matchAll(/line: "([^"]+)"/g)],
    ...[...block("const AX_SYSTEMS = [").matchAll(/line: "([^"]+)"/g)],
    ...[...block("const AX_C = [").matchAll(/line: "([^"]+)"/g)],
    ...[...block("const ABOUT_SCAN = [").matchAll(/\["([^"]+)", "/g)],
  ].map((m) => m[1]);
  assert.ok(lines.length >= 8 + 6 + 6 + 3 + 3, "줄 수 " + lines.length);
  for (const l of lines) assert.ok([...l].length <= 45, `${[...l].length}자: ${l}`);
  assert.equal((block("const CASE_INDEX = [").match(/badge: "/g) || []).length, 8, "사례마다 실적 배지");
  assert.equal((block("const AX_SYSTEMS = [").match(/badges: \[/g) || []).length, 6, "시스템마다 배지");
  assert.ok(!/\bd: "/.test(block("const CASE_INDEX = [")), "긴 설명 d 제거");
});
