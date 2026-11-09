/* Gyunggook Trial Brief — 추출 · 정합성 검수 · 상태 · 권한 · 브리핑의 정확성 (가상 사건 3건) */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const D = require("../trial-brief-data.js");
const T = require("../trial-brief-domain.js");
const read = (f) => readFileSync(new URL("../" + f, import.meta.url), "utf8");
const C = (id) => D.cases.find((c) => c.id === id);
const T0 = "2026-11-17T01:00:00.000Z";

test("데이터 불변 조건 — 가상 표시 · 출처가 있는 주요 사실 · 쟁점 3개 이내 · 없는 증거 연결 없음", () => {
  assert.deepEqual(T.validate(D), []);
  assert.equal(D.cases.length, 3);
  assert.deepEqual(D.cases.map((c) => c.template), ["civil", "civil", "civil"]);
  assert.ok(D.templates.civil.active && !D.templates.criminal.active, "MVP 는 민사만");
});

test("추출 — 날짜 · 금액 · 당사자 · 증거번호를 문서 · 쪽 · 문단 위치와 함께", () => {
  const d1 = C("TB-CV-01").documents.find((d) => d.id === "D1");
  const F = T.extract(d1);
  const amt = F.find((f) => f.kind === "amount" && f.label === "청구금액");
  assert.equal(amt.value, 36400000);
  assert.deepEqual(amt.src, { doc: "D1", page: 1, para: 3 });
  const dt = F.find((f) => f.kind === "date" && f.label === "누수 발견일");
  assert.equal(dt.value, "2026-03-14");
  assert.deepEqual(dt.src, { doc: "D1", page: 2, para: 1 });
  assert.ok(F.some((f) => f.kind === "party" && f.label === "피고" && f.value === "나은솔(가상)"));
  assert.deepEqual(F.filter((f) => f.kind === "evidence").map((f) => f.value), ["갑1", "갑2", "갑3", "갑4"]);
  /* 원문에 없는 값은 만들지 않는다 — 모든 추출값의 원문 조각이 실제 문단에 있다 */
  for (const c of D.cases) for (const d of c.documents) for (const f of T.extract(d)) {
    const para = d.pages.find((p) => p.no === f.src.page).paras[f.src.para - 1];
    assert.ok(para.includes(f.text), f.id);
  }
});

test("정합성 검수 — 심어 둔 불일치 · 누락을 정확히 찾고, 없는 것은 만들지 않는다", () => {
  const rules = (c, st) => T.qa(c, st || T.initial()).map((q) => q.rule + "|" + q.label).sort();
  const q1 = rules(C("TB-CV-01"));
  assert.ok(q1.includes("R1 날짜 불일치|누수 발견일"));
  assert.ok(q1.includes("R2 금액 불일치|수리비"));
  assert.ok(q1.includes("R4 증거 누락|갑 제5호증"));
  assert.ok(q1.includes("R5 증거 미제출|을 제2호증"));
  assert.ok(!q1.some((r) => r.startsWith("R2 금액 불일치|청구금액")), "일치하는 금액을 불일치로 표시");
  assert.ok(!q1.some((r) => r.startsWith("R3")), "등록 전 서면의 당사자 오기를 미리 표시");
  const q2 = rules(C("TB-CV-02"));
  assert.ok(q2.includes("R1 날짜 불일치|계약일") && q2.includes("R3 당사자 표시 불일치|피고"));
  const q3 = rules(C("TB-CV-03"));
  assert.ok(q3.includes("R2 금액 불일치|원상복구비") && q3.includes("R1 날짜 불일치|인도일") && q3.includes("R4 증거 누락|을 제2호증"));
  /* 날짜 불일치에서 가장 최근 서면의 값을 '최신 서면 기준'으로 표시 — 확정은 아니다 */
  const f = T.qa(C("TB-CV-01"), T.initial()).find((q) => q.rule === "R1 날짜 불일치");
  assert.equal(f.values.find((v) => v.latest).src.doc, "D6");
  /* 기한 — 기준 시각(now) 대비 경과 · 임박 */
  assert.ok(T.qa(C("TB-CV-01"), T.initial()).some((q) => q.rule === "R7 기한 경과" && q.label.includes("석명 사항")));
});

test("검출 범위 — 가상 사건 3건에 심어 둔 문서 불일치 · 누락 15건을 모두 찾고, 그 밖의 것은 표시하지 않는다(테스트 자료 기준)", () => {
  const PLANTED = {
    "TB-CV-01": ["R1|누수 발견일", "R2|수리비", "R2|위자료", "R3|피고", "R4|갑 제5호증", "R5|을 제2호증"],
    "TB-CV-02": ["R1|계약일", "R2|계약금", "R3|피고", "R4|을 제2호증", "R5|갑 제3호증"],
    "TB-CV-03": ["R1|인도일", "R2|원상복구비", "R4|을 제2호증", "R4|을 제3호증"],
  };
  let n = 0;
  for (const c of D.cases) {
    let st = T.initial();
    for (const d of c.documents.filter((x) => x.pending)) st = T.reduce(st, { type: "register", role: "staff", case: c.id, doc: d.id, value: true, label: d.title }, T0);
    const got = T.qa(c, st).filter((q) => /^R[1-5] /.test(q.rule)).map((q) => q.rule.slice(0, 2) + "|" + q.label).sort();
    assert.deepEqual(got, PLANTED[c.id].slice().sort(), c.id);
    n += got.length;
  }
  assert.equal(n, 15);
});

test("새 서면 등록 —그 서면에서 생긴 불일치만 더해지고, 승인 뒤라면 승인이 '재검토 필요'로 바뀐다", () => {
  const c = C("TB-CV-02");
  let st = T.initial();
  const before = T.qa(c, st).length;
  /* 승인 조건을 채운다 — 중요 항목 확인 처리 · 쟁점 확정 · 기일 확정 */
  for (const q of T.qa(c, st).filter((x) => x.sev === "high")) st = T.reduce(st, { type: "resolve", role: "staff", case: c.id, id: q.id, label: q.label, note: "담당자 확인 — 시연" }, T0);
  for (const i of c.issues) st = T.reduce(st, { type: "confirm", role: "staff", case: c.id, key: "issue/" + i.id, label: i.title }, T0);
  st = T.reduce(st, { type: "confirm", role: "staff", case: c.id, key: "hearing", label: "기일" }, T0);
  assert.ok(T.gates(c, st).every((g) => g.ok));
  assert.equal(T.status(c, st), "draft");
  assert.equal(T.approve(c, st, "staff", T0), st, "사무직원은 승인할 수 없다");
  st = T.approve(c, st, "lawyer", T0);
  assert.equal(T.status(c, st), "approved");
  st = T.reduce(st, { type: "register", role: "staff", case: c.id, doc: "D7", value: true, label: "피고 준비서면(1)" }, "2026-11-17T02:00:00.000Z");
  const after = T.qa(c, st);
  assert.ok(after.some((q) => q.rule === "R2 금액 불일치" && q.label === "계약금"), "새 서면의 계약금 불일치");
  assert.ok(after.some((q) => q.rule === "R8 승인 후 변경"));
  assert.equal(T.status(c, st), "stale", "승인 뒤 바뀐 자료가 승인된 것처럼 보이면 안 된다");
  assert.ok(after.length > before - 3);
});

test("검토 상태 — 확인 처리는 메모가 있어야 하고, 확정하지 않은 쟁점은 '자동 추출 · 미확정'으로 남는다", () => {
  const c = C("TB-CV-01");
  let st = T.initial();
  const q = T.qa(c, st)[0];
  assert.equal(T.reduce(st, { type: "resolve", role: "staff", case: c.id, id: q.id, label: q.label, note: "" }, T0), st, "메모 없는 확인 처리");
  const b = T.brief(c, st);
  assert.ok(b.issues.every((i) => i.state === "auto"));
  assert.equal(b.status, "draft");
  assert.ok(b.risks.length > 0 && b.resolvedRisks.length === 0);
  /* 출처 없는 주요 사실은 '확인 필요' */
  const c2 = JSON.parse(JSON.stringify(c)); c2.keyFacts.push({ text: "출처 없는 사실" });
  assert.equal(T.brief(c2, st).summary.facts.at(-1).state, "check");
  /* 금액이 서로 다르면 청구금액을 확정 값으로 쓰지 않는다 — 여기서는 청구금액은 일치하므로 쓴다 */
  assert.equal(b.summary.claimFact.value, 36400000);
});

test("권한 — 열람자는 아무것도 바꾸지 못하고, 승인은 담당 변호사만", () => {
  const c = C("TB-CV-03"), st = T.initial();
  for (const type of ["register", "confirm", "resolve", "link", "action", "request", "approve"]) {
    assert.equal(T.reduce(st, { type, role: "viewer", case: c.id, doc: "D7", value: true, key: "hearing", id: "x", note: "메모 메모", issue: "I1", side: "plaintiff", patch: { done: true }, ok: true }, T0), st, type);
  }
  assert.ok(T.can("lawyer", "approve") && !T.can("staff", "approve") && !T.can("viewer", "confirm"));
  const s2 = T.reduce(st, { type: "action", role: "staff", case: c.id, id: "A1", label: "A1", patch: { done: true } }, T0);
  assert.equal(s2.audit.length, 1);
  assert.ok(!T.qa(c, s2).some((q) => q.id === "QA-due-A1"), "완료한 할 일은 기한 위험에서 빠진다");
});

test("보안 — 실제 식별정보 · 외부 전송 · 업로드 · 비밀키 · 판결 예측 표현이 없다", () => {
  const all = read("trial-brief-data.js") + read("trial-brief-domain.js") + read("trial-brief.jsx") + read("trial-brief.html");
  assert.ok(!/\d{6}-[1-4]\d{6}/.test(all), "주민등록번호 형식");
  assert.ok(!/01[016789]-?\d{3,4}-?\d{4}/.test(read("trial-brief-data.js")), "전화번호 형식");
  assert.ok(!/\b20\d{2}(가합|가단|가소|나|다)\d{2,6}\b/.test(read("trial-brief-data.js")), "실제 형식의 사건번호");
  assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon|navigator\.share|mailto:|type="file"/.test(read("trial-brief.jsx") + read("trial-brief-domain.js")), "외부 전송 · 업로드");
  assert.ok(!/sk-[A-Za-z0-9]{20,}|OPENAI_API_KEY|ANTHROPIC_API_KEY|SUPABASE_SERVICE/.test(all), "비밀키");
  for (const w of ["승소 가능성", "승소 확률", "예상 판결", "패소 확정", "승소 확정", "AI가 판단", "AI 분석 결과"]) assert.ok(!all.includes(w), w);
  /* '판결 예측'은 하지 않는다는 고지로만 쓴다 */
  for (const m of all.matchAll(/판결 예측/g)) assert.ok(/않|하지 않는 일|제외/.test(all.slice(m.index - 20, m.index + 40)), "판결 예측 표현: " + all.slice(m.index - 20, m.index + 30));
  assert.ok(D.notice.includes("승인 · 도입한 서비스가 아닙니다") && D.notice.includes("가상"));
});

test("페이지 — trial-brief.html 이 데이터 · 규칙 · 빌드 결과 · 인쇄 스타일을 불러온다", () => {
  const html = read("trial-brief.html");
  for (const f of ["trial-brief-data.js", "trial-brief-domain.js", "dist/trial-brief.js", "trial-brief.css", "react.production.min.js"]) assert.ok(html.includes(f), f);
  assert.ok(/@page\s*\{[^}]*A4/.test(read("trial-brief.css")), "A4 인쇄 설정");
  assert.ok(read("sections.jsx").includes('href="trial-brief.html"'), "포트폴리오에서 연결");
});
