/* 법률 AX 업무체계(공개 시연) — 데이터 불변 조건 · 규칙의 정직성 · 금지 표현 · 페이지 연결 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const D = require("../legal-ax-data.js");
const L = require("../legal-ax-domain.js");
const read = (f) => readFileSync(new URL("../" + f, import.meta.url), "utf8");

test("데이터 불변 조건 — 증거는 있는 문서 · 문단에, 검토 항목은 있는 사건 · 쟁점에, 출처는 실제 링크에", () => {
  assert.deepEqual(L.validate(D), []);
});

test("일곱 분야가 서로 다른 사건 · 문서 · 쟁점을 갖는다(탭 이름만 바뀌는 구현 금지)", () => {
  assert.equal(D.fields.length, 7);
  const ids = new Set(D.fields.map((f) => f.caseId));
  assert.equal(ids.size, 7);
  const docSig = new Set(D.cases.map((c) => c.documents.map((d) => d.paras.join("")).join("|")));
  assert.equal(docSig.size, 7, "사건마다 문서 원문이 달라야 합니다");
  for (const c of D.cases) {
    assert.ok(c.participants.length >= 2, c.id + " 당사자");
    assert.ok(c.events.length >= 2, c.id + " 날짜");
    assert.ok(c.issues.length >= 2, c.id + " 쟁점");
    assert.ok(c.evidence.some((e) => e.loc.para >= 1), c.id + " 탐색 가능한 원문 근거");
  }
});

test("주장 · 자료 대조 — 기재가 다르면 '추가 검토 필요', 같으면 '일치'(사실인정은 별도)", () => {
  const cv = L.consistency(D.cases.find((c) => c.id === "LAX-CV-01"));
  assert.equal(cv.find((x) => x.claim === "C1").state, "needs_check");
  assert.equal(cv.find((x) => x.claim === "C3").state, "matches");
  assert.equal(cv.find((x) => x.claim === "C4").state, "no_rule");
  for (const c of D.cases) assert.ok(L.consistency(c).some((x) => x.state === "needs_check"), c.id + " 에 대조 시연이 하나 이상");
});

test("계약 비교 — 추가 · 삭제 · 수정 · 같음을 구별하고, 낱말 비교는 원문을 그대로 복원한다", () => {
  for (const k of D.contracts) {
    const rows = L.diffContract(k);
    assert.ok(rows.some((r) => r.op === "modified"), k.id + " 수정 조항");
    for (const r of rows) {
      if (r.op === "modified") {
        assert.equal(r.parts.filter((p) => p.op !== "add").map((p) => p.t).join(""), r.before.text);
        assert.equal(r.parts.filter((p) => p.op !== "del").map((p) => p.t).join(""), r.after.text);
      }
      if (r.important) assert.ok(r.flags.length > 0, "중요 표시는 걸린 규칙이 있어야 합니다");
    }
  }
  const nda = L.diffContract(D.contracts.find((k) => k.id === "nda"));
  assert.equal(nda.find((r) => r.key === "nonsolicit").op, "added");
  const emp = L.diffContract(D.contracts.find((k) => k.id === "employment"));
  assert.equal(emp.find((r) => r.key === "probation").op, "removed");
});

test("기한 — 단순 계산(초일 불산입 · 주말 순연)만 하고 언제나 '확인 필요'", () => {
  const r = L.deadline("2026-09-04", 90);
  assert.equal(r.date, "2026-12-03");
  assert.equal(r.needsReview, true);
  assert.match(r.ko, /담당 변호사의 별도 확인/);
  const sat = L.deadline("2026-10-31", 7); /* 11. 7 토요일 → 11. 9 월요일 */
  assert.equal(sat.date, "2026-11-09");
});

test("리서치 — 색인된 예시자료만 찾고, 없으면 빈 결과", () => {
  assert.ok(L.search(D, "행정심판", "all").some((r) => r.id === "행정심판법-27"));
  assert.equal(L.search(D, "존재하지않는검색어xyz", "all").length, 0);
  const c = D.cases.find((x) => x.id === "LAX-CV-01");
  assert.ok(L.search(D, "검수", "doc", c).every((r) => r.kind === "doc"));
});

test("상태 — 모든 변경이 시연 기록에 남고, 최종 확인은 모든 쟁점 검토 후에만", () => {
  const c = D.cases[0];
  let s = L.initial(D);
  assert.equal(L.canFinalize(c, s), false);
  for (const i of c.issues) s = L.reduce(s, { type: "status", key: c.id + "/" + i.id, value: "reviewed", label: i.id, case: c.id }, "2026-11-07T00:00:00Z");
  assert.equal(L.canFinalize(c, s), true);
  assert.equal(s.audit.length, c.issues.length);
  assert.ok(s.audit.every((a) => a.actor.includes("가상 역할") && a.case === c.id));
  assert.strictEqual(L.reduce(s, { type: "status", key: "x", value: "fake" }), s, "없는 상태값은 무시");
});

test("금지 표현 · 식별정보 · 판례 번호 · 외부 전송이 없다", () => {
  const all = read("legal-ax-data.js") + read("legal-ax-domain.js") + read("legal-ax.jsx") + read("legal-ax.html");
  for (const w of ["허위 진술 확정", "위증 확정", "기망 확정", "승소 확정", "채무불이행 확정", "이해충돌 없음", "AI가 분석", "AI 분석 결과"]) assert.ok(!all.includes(w), "금지 표현: " + w);
  assert.ok(!/\d{6}-[1-4]\d{6}/.test(all), "주민등록번호 형식");
  assert.ok(!/\b(19|20)\d{2}\s?(다|나|가합|가단|두|누|도|노|고합|고단|헌마|헌바)\s?\d{2,6}\b/.test(read("legal-ax-data.js")), "판례 · 사건번호 형식");
  assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon|navigator\.share|mailto:/.test(read("legal-ax.jsx")), "외부 전송");
  assert.ok(!/type="file"/.test(read("legal-ax.jsx")), "파일 업로드");
  assert.ok(!/sk-[A-Za-z0-9]{20,}|OPENAI_API_KEY|SUPABASE_SERVICE/.test(all), "비밀키");
});

test("처리 방식 표시 — 규칙 기반 · 검색 기반만, AI 보조 표시는 없다(모델 호출이 없으므로)", () => {
  const jsx = read("legal-ax.jsx");
  assert.ok(jsx.includes('m: ["RULE"') && jsx.includes('"RETRIEVAL"'));
  assert.ok(!/AI-assisted|AI 보조 분석/.test(jsx));
  assert.ok(D.notice.includes("가상 자료") && D.notice.includes("사내 비공개 자료를 포함하지 않습니다"));
});

test("페이지 — legal-ax.html 이 데이터 · 규칙 · 빌드 결과를 불러오고, 포트폴리오 AX 지휘실에서 들어온다", () => {
  const html = read("legal-ax.html");
  for (const f of ["legal-ax-data.js", "legal-ax-domain.js", "dist/legal-ax.js", "legal-ax.css", "react.production.min.js"]) assert.ok(html.includes(f), f);
  assert.ok(read("sections.jsx").includes('href="legal-ax.html"'));
  assert.ok(read("sections.jsx").includes("법률 AX 업무체계 직접 살펴보기"));
});
