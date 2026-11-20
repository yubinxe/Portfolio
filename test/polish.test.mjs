/* 손길 층(polish.css · polish.js) — 6쪽에 연결, 움직임 줄이기 · 인쇄 · 정적 화면 안전장치 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (f) => readFileSync(new URL("../" + f, import.meta.url), "utf8");

test("6쪽 모두 polish.css(head) · polish.js(defer) · 전환 막 head 스크립트", () => {
  for (const f of ["index.html", "gallery.html", "career.html", "lecture.html", "cases.html", "resume.html"]) {
    const h = read(f), head = h.slice(0, h.indexOf("</head>"));
    assert.ok(head.includes('href="polish.css?v='), f + " css");
    assert.ok(/sessionStorage\.getItem\("yk\.pl\.t"\)/.test(head) && head.includes("prefers-reduced-motion"), f + " 막");
    assert.ok(/<script src="polish\.js\?v=\d+" defer><\/script>/.test(h), f + " js");
  }
});

test("움직임 줄이기면 손길 층을 켜지 않고, 숨김은 html.pl 아래에서만", () => {
  const js = read("polish.js"), css = read("polish.css");
  assert.ok(/if \(calm\) return;\s*H\.classList\.add\("pl"\)/.test(js), "calm 이면 pl 없음");
  assert.ok(js.includes('data-app") !== "ready"'), "hydrate 끝난 뒤에 DOM 수정");
  assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon|localStorage/.test(js), "외부 전송 · 저장 없음");
  for (const m of css.matchAll(/^([^@{}\n]+)\{[^}]*(clip-path:inset\(0 0 100% 0\)|translateY\(105%\))/gm)) assert.ok(/html\.pl /.test(m[1]), "숨김은 html.pl 아래: " + m[1]);
  assert.ok(/@media \(prefers-reduced-motion:reduce\)\{[^}]*\.pl-curtain/.test(css) && /@media print\{[^}]*\.pl-grain/.test(css));
  assert.ok(js.includes("catchUp"), "빨리 내려도 사진이 가려진 채 남지 않게");
});
