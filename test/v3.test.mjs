/* V3 고도화 계약 — 강의 의뢰 퍼널 · 대토론회 문서 · 수상자료 원본/보정 비교 · 모바일 메뉴 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(path.join(ROOT, f), "utf8");

test("강의 페이지: 8개 과정마다 해당 courseId 로 챗봇 신청서를 연다", () => {
  const h = read("lecture.html");
  for (let i = 1; i <= 8; i++) {
    const id = "lec-0" + i;
    assert.ok(h.includes(`id="${id}"`), id + " 앵커");
    assert.ok(h.includes(`data-lecture-consult="${id}"`), id + " 의뢰 CTA");
  }
});

test("개인 강의 문의가 회사 메일로 자동 연결되지 않는다", () => {
  for (const f of ["lecture.html", "career.html", "sections.jsx"]) {
    const h = read(f);
    assert.ok(!/mailto:ybkim@gyunggook\.com\?subject=%5B%EA%B0%95%EC%9D%98/.test(h), f + " 에 회사 메일 강의 문의 링크");
  }
});

test("챗봇: 기존 consult() 호환 + 강의 퍼널 API · 동의 · 실패 시 메일 안내", () => {
  const c = read("chatbot.js");
  assert.match(c, /consult: function \(opts\)/);
  assert.match(c, /consultLecture: function \(courseId\)/);
  assert.match(c, /\[강의 의뢰\]/);
  assert.match(c, /개인정보 수집·이용에 동의합니다/);
  assert.match(c, /메일 앱에서 직접 보내기를 눌러야 접수됩니다/);
  assert.match(c, /\[data-lecture-consult\]/);
});

test("대토론회: 문서 미리보기 파일과 페이지 이미지가 모두 존재한다", () => {
  const g = read("gallery.html");
  for (const m of g.matchAll(/<template id="doc-(\w+)"[^>]*data-pdf="([^"]+)"[^>]*data-pages="([^"]+)"/g)) {
    assert.ok(existsSync(path.join(ROOT, m[2])), m[2]);
    for (const p of m[3].split(",")) assert.ok(existsSync(path.join(ROOT, p)), p);
  }
  assert.ok(g.includes('href="lecture.html#lec-04"') && g.includes('href="lecture.html#lec-08"'));
  const pub = read("assets/debate/proposal-public.pdf");
  for (const n of ["박장현", "한도연", "유경현", "나인채", "구고은"]) assert.ok(!pub.includes(n), "공개 사본에 팀원 성명: " + n);
});

test("수상자료: 원본이 기본 선택이고 AI 보정본은 라벨로 구분된다", () => {
  const g = read("gallery.html");
  for (const id of ["cred-army-training-2023", "cred-award-2023"]) {
    const i = g.indexOf(`id="${id}"`);
    assert.ok(i > 0, id);
    const block = g.slice(i, g.indexOf("</article>", i));
    assert.match(block, /aria-selected="true"[^>]*data-state="orig"/);
    assert.match(block, /AI 보정 참고/);
    const img = block.match(/<img src="([^"]+)"/)[1];
    assert.ok(!/-ai/.test(img), "기본 이미지는 원본이어야 함: " + img);
  }
  assert.match(g, /내용 확인은 원본을 기준으로 합니다/);
  assert.ok(!existsSync(path.join(ROOT, "images/award-2023.jpg")), "가림 처리 전 원본 공개본은 제거");
});

test("모바일 메뉴: 네 페이지 모두 메뉴 버튼과 스크립트가 있다", () => {
  assert.match(read("sections.jsx"), /data-mnav-toggle/);
  for (const f of ["index.html", "gallery.html", "lecture.html", "career.html"]) {
    const h = read(f);
    assert.ok(h.includes("mnav.js"), f + " mnav.js");
    assert.ok(h.includes("features.css"), f + " features.css");
    if (f !== "index.html") assert.match(h, /data-mnav-toggle[^>]*aria-controls="mnav"/, f + " 메뉴 버튼");
  }
});
