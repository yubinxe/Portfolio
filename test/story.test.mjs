// V16 The Story(story.html) — 레퍼런스 장치만 빌린 장면형 이야기 페이지. 사실 · 영문 · 연결 · 개인정보 검사
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const html = readFileSync("story.html", "utf8");
const js = readFileSync("story.js", "utf8");
const en = JSON.parse(readFileSync("i18n/en.json", "utf8"));
const norm = (s) => s.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

test("i18n.js 가 head 맨 앞 · 자산 파일이 있다", () => {
  const head = html.slice(html.indexOf("<head>"), html.indexOf("</head>"));
  assert.match(head.replace(/<meta charset[^>]*>/, "").trim().slice(6).trim(), /^<script src="i18n\.js\?v=\d+"><\/script>/);
  for (const f of ["story.css", "story.js", "polish.js", "polish.css"]) assert.ok(existsSync(f) && html.includes(f + "?v="), f);
});

test("장면 8개 · 모양 8종 · 레일과 같은 순서", () => {
  const ids = [...html.matchAll(/<section class="st-scene[^"]*" id="([\w-]+)" data-shape="(\w+)"/g)];
  assert.deepEqual(ids.map((m) => m[1]), ["s-hello", "s-begin", "s-why", "s-zip", "s-field", "s-consult", "s-policy", "s-next"]);
  const rail = [...html.matchAll(/<a href="#([\w-]+)" data-i="\d">/g)].map((m) => m[1]);
  assert.deepEqual(rail, ids.map((m) => m[1]));
  for (const m of ids) assert.match(js, new RegExp("\\b" + m[2] + ": function"), "모양 " + m[2]);
});

test("생년 · 연락처 · 지어낸 수치 없음", () => {
  assert.doesNotMatch(html, /2004|010-|@gmail/);
  assert.match(html, /최종 법률 판단은 변호사가 내립니다/);
  assert.match(html, /채택 여부는 적지 않습니다/);
});

test("모든 한국어 문장이 영문 사전에 있다", () => {
  const body = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<!--[\s\S]*?-->/g, "");
  const texts = new Set();
  for (const m of body.matchAll(/>([^<>]+)</g)) { const s = norm(m[1]); if (/[가-힣]/.test(s)) texts.add(s); }
  for (const m of body.matchAll(/(?:aria-label|content|title)="([^"]+)"/g)) { const s = norm(m[1]); if (/[가-힣]/.test(s) && s !== "Yubin Kim 김유빈") texts.add(s); }
  texts.add("움직임 꺼짐");
  // 한 요소 안에서 태그로 끊긴 조각(예: ‘포트폴리오 ↗’)은 그 조각 그대로가 키
  const miss = [...texts].filter((k) => !(k in en));
  assert.deepEqual(miss, []);
});

test("메인 첫 화면 · 모바일 메뉴에서 연결", () => {
  assert.match(readFileSync("sections.jsx", "utf8"), /href="story\.html" className="hero-story/);
  assert.match(readFileSync("mnav.js", "utf8"), /"story\.html"/);
});
