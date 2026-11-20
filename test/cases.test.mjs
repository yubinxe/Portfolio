/* 법률 실무 사례집(cases.html) — 범주 분리(실제 수행 · 공개 시연 · 향후 확장), 공통 구조, 시연 계산, 첫 화면 목록과의 일치 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const D = require("../cases-data.js"), R = require("../cases-render.js");
const read = (f) => readFileSync(new URL("../" + f, import.meta.url), "utf8");
const KINDS = ["actual", "demo", "future"];

test("모든 사례가 공통 구조(배경 · 역할 · 기존/개선 · 기능 · 결과 · 한계 · 향후)를 갖고, 항목마다 범주가 붙는다", () => {
  assert.equal(D.CASES.length, 8);
  for (const c of D.CASES) {
    for (const k of ["ko", "en", "summary", "scope", "background", "role", "before", "after", "features", "results", "limits", "next"]) assert.ok(c[k] && c[k].length, `${c.id}.${k}`);
    assert.ok(["actual", "demo"].includes(c.kind), c.id + " 사례 범주");
    for (const [k] of [...c.role, ...c.features]) assert.ok(KINDS.includes(k), `${c.id} 항목 범주 ${k}`);
    for (const [t] of c.results) assert.ok(["measured", "simulated", "qualitative"].includes(t), `${c.id} 결과 유형 ${t}`);
    /* 측정하지 않은 절감률 · 정확도 · 시간 단축 수치를 쓰지 않는다 */
    assert.ok(!/\d+\s*%|\d+\s*배\s*(빨라|단축)|정확도\s*\d/.test(c.results.map((r) => r[1]).join(" ")), c.id + " 결과에 측정 안 된 수치");
    assert.ok(/[가-힣]/.test(c.ko) && c.ko.length >= 8, c.id + " 국문 대표 명칭");
  }
});

test("향후 확장은 결과 · 실제 수행으로 섞이지 않고, 시연 상자에는 가상 · 공개 법령 표기가 있다", () => {
  for (const c of D.CASES) {
    assert.ok(c.next.length > 0);
    if (c.kind === "demo") assert.ok(!c.role.some(([k]) => k === "actual"), c.id + " 공개 시연 사례에 실제 수행 역할");
  }
  const html = read("cases.html");
  const demos = [...html.matchAll(/<div class="cs-demo[^"]*" data-demo="(\w+)">([\s\S]*?)<\/p>/g)];
  assert.equal(demos.length, 7);
  for (const [, k, head] of demos) {
    if (k === "timeline") continue;
    assert.ok(/가상|공개 법령/.test(head), k + " 시연 표기");
  }
  for (const c of D.CASES) assert.ok(html.includes(`id="${c.id}"`), c.id + " 프리렌더");
  assert.ok(html.includes("실제 수행") && html.includes("공개 시연") && html.includes("향후 확장"));
});

test("입찰 · 용역비 분석 — 같은 용역 중앙값 대비 1.8배 초과 · 0.55배 미만만 검토 필요로 표시", () => {
  const all = R.bidAnalyze(D.BIDS, {});
  assert.deepEqual(all.flagged.map((r) => r.id).sort(), ["B04", "B13", "B20"]);
  const des = R.bidAnalyze(D.BIDS, { service: "설계" });
  assert.equal(des.list.length, 9);
  assert.ok(des.list.every((r) => r.service === "설계"));
  assert.deepEqual(des.flagged.map((r) => r.flag), ["low"]);
  const jaegeon = R.bidAnalyze(D.BIDS, { type: "재건축", service: "설계" });
  assert.ok(jaegeon.list.every((r) => r.type === "재건축"));
  assert.ok(D.BIDS.every((r) => r.site.startsWith("가상")), "사업지는 모두 가상");
});

test("정족수 시뮬레이션 — 입력 요건으로 계산하고, 유효 · 무효를 판정하는 말을 쓰지 않는다", () => {
  const ok = R.quorum(R.QDEF);
  assert.equal(ok.attend, 88); assert.ok(ok.ok);
  assert.equal(R.quorum({ ...R.QDEF, yes: 44 }).ok, false, "과반수는 절반 초과");
  assert.equal(R.quorum({ ...R.QDEF, yes: 45 }).ok, true);
  assert.equal(R.quorum({ ...R.QDEF, yesq: "two3", yes: 58 }).ok, false);
  assert.equal(R.quorum({ ...R.QDEF, yesq: "two3", yes: 59 }).ok, true, "3분의 2 이상");
  assert.equal(R.quorum({ ...R.QDEF, direct: 11 }).ok, false, "직접 출석 10%");
  const h = R.demoQuorum();
  assert.ok(h.includes("유효 · 무효 판단이 아닙니다") && !/결의는 (유효|무효)합니다/.test(h));
});

test("자동화 배치 — 결과 문장이 시연 계산과 같다(정상 3 · 검토 3 · 차단 1 · 재처리 1)", () => {
  const r = R.batchRun(D.BATCH), n = (s) => r.filter((x) => x.status === s).length;
  assert.equal(n("sent"), 4); assert.equal(n("review"), 3); assert.equal(n("blocked"), 1); assert.equal(r.filter((x) => x.retried).length, 1);
  assert.ok(D.BATCH.every((b) => !b.email || /@example(\.test)?$/.test(b.email)), "예시 도메인만");
});

test("첫 화면 ‘주요 실무 사례’ 목록이 사례집 데이터와 같고, 첫 화면 다음에 온다", () => {
  const jsx = read("sections.jsx");
  const block = jsx.slice(jsx.indexOf("const CASE_INDEX = ["), jsx.indexOf("const CASE_CAPS"));
  const rows = [...block.matchAll(/\{ id: "([\w-]+)", ko: "([^"]+)", en: "[^"]+", kind: "(\w+)"/g)].map((m) => [m[1], m[2], m[3]]);
  const data = D.CASES.slice().sort((a, b) => a.order - b.order).map((c) => [c.id, c.ko, c.kind]);
  assert.deepEqual(rows, data);
  const app = read("app.jsx");
  assert.ok(app.indexOf("<Ledger />") < app.indexOf("<CaseIndex />") && app.indexOf("<CaseIndex />") < app.indexOf("<About />"));
  const pre = read("index.html");
  assert.ok(pre.includes('id="cases"') && pre.includes("법률 실무를 이해하고,") && pre.includes('href="cases.html#bid"'));
});

test("국문 대표 명칭 — 법률 AX 01–03 · 내비게이션", () => {
  const jsx = read("sections.jsx");
  for (const t of ["법령·규제 변화 관제 시스템", "정비사업 총회결의 위험 검토 시스템", "공사도급계약 변경 위험 분석 시스템"]) assert.ok(jsx.includes(`koreanTitle: "${t}"`), t);
  assert.ok(jsx.includes('["법률 AI 전환", "#ax-desk"]') && jsx.includes('["실무 사례", "#cases"]'));
  assert.ok(!jsx.includes("Gyunggook AX"), "AX 머리글의 영문 법인명 병기 제거");
});
