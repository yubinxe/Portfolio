/* 영문 전환(i18n.js · i18n/en.json · i18n-en.js) — 연결 · 사전 동기화 · 정직성 문구 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const PAGES = ["index.html", "gallery.html", "career.html", "lecture.html", "cases.html", "resume.html", "trial-brief.html", "legal-ax.html", "vault.html"];
const AX = ["ax/reconcile-gate/index.html", "ax/ops-triage/index.html", "ax/claim-verifier/index.html"];
const dict = JSON.parse(read("i18n/en.json"));

test("모든 페이지 · ax 앱이 head 맨 앞에서 i18n.js 를 부른다", () => {
  for (const p of PAGES) {
    const h = read(p);
    const i = h.indexOf('<script src="i18n.js?v=');
    assert.ok(i > 0 && i < h.indexOf("</head>"), p + " — i18n.js 없음");
    const firstOther = h.search(/<script(?![^>]*i18n\.js)[^>]*\ssrc=/);
    assert.ok(firstOther === -1 || i < firstOther, p + " — i18n.js 가 다른 스크립트보다 먼저여야 한다");
  }
  for (const p of AX) assert.ok(read(p).includes('src="../../i18n.js?v='), p);
});

test("i18n-en.js 는 i18n/en.json 과 같다(npm run build)", () => {
  const js = read("i18n-en.js");
  const m = /window\.YK_EN=(\{[\s\S]*\});\s*$/.exec(js);
  assert.ok(m, "형식");
  assert.deepEqual(JSON.parse(m[1]), dict);
});

test("사전 — 영문 값에 한글이 남지 않고, 회사명은 Gyunggook", () => {
  const keys = Object.keys(dict);
  assert.ok(keys.length > 3000, "사전이 비었다: " + keys.length);
  for (const [k, v] of Object.entries(dict)) {
    assert.ok(!/[가-힣]/.test(v), "한글이 남은 값: " + k);
    if (/경국/.test(k)) assert.ok(/Gyunggook/.test(v), "회사명 표기: " + k);
  }
});

test("사전 — 메뉴 · 정직성 문구가 빠지지 않는다", () => {
  for (const k of ["소개", "역량", "실무 사례", "법률 AI 전환", "개인 구현 · 공개 시연 (가상 벤치마크 검증)", "개인 구현 시제품 · 경국 도입 아님", "제안 커리큘럼", "더 보기", "접기"]) {
    assert.ok(k in dict, "사전에 없음: " + k);
  }
  assert.match(dict["개인 구현 · 공개 시연 (가상 벤치마크 검증)"], /synthetic benchmarks/);
  assert.match(dict["개인 구현 시제품 · 경국 도입 아님"], /not adopted by Gyunggook/);
});

test("i18n.js — 기본은 한국어, EN 일 때만 사전을 불러 index 는 hydrate 뒤에 바꾼다", () => {
  const s = read("i18n.js");
  assert.ok(existsSync(new URL("../i18n-en.js", import.meta.url)));
  assert.match(s, /localStorage\.getItem\(KEY\) === "en" \? "en" : "ko"/);
  assert.match(s, /data-app/);
  assert.match(s, /TEXTAREA/);
  assert.match(s, /KEEP = \{ "주요 메뉴": 1 \}/);
  assert.ok(read("polish.js").includes("W.ykI18n && W.ykI18n.ready"), "polish 는 번역 뒤에 쪼갠다");
});
