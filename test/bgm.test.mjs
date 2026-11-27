// V17 배경음악 — 음원 파일 없이 Web Audio 생성 · 기본 꺼짐 · 공통 페이지에 연결
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const js = readFileSync("bgm.js", "utf8");
test("외부 음원 · 자동 재생 없음", () => {
  assert.doesNotMatch(js, /\.(mp3|wav|ogg|m4a)\b|new Audio\(|<audio|https?:\/\//);
  assert.match(js, /localStorage\.getItem\(KEY\) === "on"/, "켠 적이 있을 때만 이어 재생");
});
test("공통 페이지에 연결", () => {
  for (const p of ["index", "gallery", "career", "lecture", "cases", "resume", "story"]) assert.match(readFileSync(p + ".html", "utf8"), /<script src="bgm\.js\?v=\d+" defer><\/script>/, p);
});
test("단추 문구 영문 사전", () => {
  const en = JSON.parse(readFileSync("i18n/en.json", "utf8"));
  for (const k of ["배경음악 켜기", "배경음악 끄기", "배경음악 — 브라우저가 직접 만드는 앰비언트(외부 음원 없음)", "달라진 일하는 방식"]) assert.ok(en[k], k);
});
