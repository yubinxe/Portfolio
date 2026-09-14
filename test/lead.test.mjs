/* 백엔드 핵심 계약 테스트 — `npm test`
 * 1) 알림 실패가 리드 저장을 막지 않는다 (200 + notified:false)
 * 2) 알림이 5초 안에 끝나지 않으면 AbortSignal 로 끊고 접수는 성공 처리
 *    (스텁은 반드시 signal 을 존중해야 타임아웃 검증이 의미 있음)
 * 3) 저장 실패는 500 (프론트 mailto 폴백 트리거)
 * 4) 필수 필드 검증 400
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const lead = require("../api/lead.js");
const KB = require("../kb.js");

const GOOD = { name: "홍길동", contact: "hong@example.com", message: "대시보드 구축 상담" };

test("알림 실패해도 리드 저장은 성공(200, notified:false)", async () => {
  const out = await lead.handleLead(GOOD, {
    saveLead: async () => "rec123",
    notify: async () => { throw new Error("slack_500"); },
  });
  assert.equal(out.status, 200);
  assert.equal(out.json.ok, true);
  assert.equal(out.json.id, "rec123");
  assert.equal(out.json.notified, false);
});

test("알림 타임아웃: signal 을 존중하는 스텁이 abort 되고 접수는 성공", async () => {
  let aborted = false;
  const out = await lead.handleLead(GOOD, {
    notifyTimeoutMs: 60,
    saveLead: async () => "rec1",
    notify: (l, { signal }) => new Promise((_, reject) => {
      const t = setTimeout(() => reject(new Error("should_not_finish")), 5000);
      signal.addEventListener("abort", () => { aborted = true; clearTimeout(t); reject(new Error("aborted")); });
    }),
  });
  assert.equal(out.status, 200);
  assert.equal(out.json.notified, false);
  assert.equal(aborted, true, "스텁이 AbortSignal 로 실제 중단되어야 함");
});

test("알림이 signal 을 무시해도 타이머가 반드시 끊는다", async () => {
  const t0 = Date.now();
  const out = await lead.handleLead(GOOD, {
    notifyTimeoutMs: 50,
    saveLead: async () => "rec2",
    notify: () => new Promise(() => {}), // 영원히 대기 · signal 무시
  });
  assert.equal(out.json.ok, true);
  assert.equal(out.json.notified, false);
  assert.ok(Date.now() - t0 < 1000);
});

test("저장 실패는 500 (프론트가 mailto 폴백)", async () => {
  const out = await lead.handleLead(GOOD, {
    saveLead: async () => { throw new Error("airtable_403"); },
    notify: async () => true,
  });
  assert.equal(out.status, 500);
  assert.equal(out.json.ok, false);
});

test("필수 필드 누락은 400", async () => {
  const out = await lead.handleLead({ name: "", contact: "" }, { saveLead: async () => "x", notify: async () => true });
  assert.equal(out.status, 400);
  assert.deepEqual(out.json.fields, ["name", "contact", "message"]);
});

test("kb.js 카드 무결성: id 유일 · CTA href 형식 · 보조 CTA 가 주 CTA 와 중복되지 않음", () => {
  const ids = new Set();
  const HREF = /^(https?:\/\/|mailto:|(index|career|gallery)\.html#[\w-]+$)/;
  for (const c of KB.cards) {
    assert.ok(!ids.has(c.id), "dup id " + c.id); ids.add(c.id);
    assert.ok(c.primary && HREF.test(c.primary.href), "bad primary " + c.id + " " + (c.primary && c.primary.href));
    if (c.secondary) {
      assert.ok(HREF.test(c.secondary.href), "bad secondary " + c.id);
      assert.notEqual(c.secondary.href, c.primary.href, "secondary == primary " + c.id);
    }
    assert.ok(c.tags.length >= 3, "tags " + c.id);
  }
  assert.ok(KB.toKnowledge().length > 2000);
});
