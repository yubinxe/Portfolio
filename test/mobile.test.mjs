// V19 폰 = 사진 · 자료 위주 + PC 화면 전환
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const i18n = readFileSync("i18n.js", "utf8"), jsx = readFileSync("sections.jsx", "utf8"), app = readFileSync("app.jsx", "utf8"), css = readFileSync("features.css", "utf8");
test("PC 화면 전환 — 폰에서만, 선택은 yk.view, 화면 폭 1280 · 돌아오기 단추", () => {
  assert.match(i18n, /VKEY = "yk\.view"/);
  assert.match(i18n, /width=1280/);
  assert.match(i18n, /yk-view-back/);
  assert.match(i18n, /pointer: coarse/);
});
test("폰 사진 릴은 현장 기록(JOURNAL)과 같은 사진 · 캡션, 첫 화면 다음", () => {
  assert.match(jsx, /function MobileReel\(\)[\s\S]*JOURNAL\.map/);
  assert.match(app, /<Signature \/>\s*<MobileReel \/>/);
});
test("폰 머리띠에 이름 글자 없음 · 사진 연출(흐림) 끔", () => {
  assert.match(css, /@media \(max-width:760px\)\{\s*\.hnav__name\{display:none!important\}/);
  assert.match(css, /\.tl-feature__main img\{filter:none!important\}/);
});
