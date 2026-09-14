/* kb.js 의 내부 딥링크(페이지#앵커)가 실제 HTML/JSX 에 존재하는지 검증 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const KB = require("../kb.js");

function idsOf(file) {
  const src = readFileSync(new URL("../" + file, import.meta.url), "utf8");
  const ids = new Set();
  for (const m of src.matchAll(/\bid=["']([\w-]+)["']/g)) ids.add(m[1]);
  return ids;
}
const PAGES = { "index.html": idsOf("sections.jsx"), "career.html": idsOf("career.html"), "gallery.html": idsOf("gallery.html") };
// sections.jsx 에서 템플릿으로 생성되는 id
const sections = readFileSync(new URL("../sections.jsx", import.meta.url), "utf8");
for (const m of sections.matchAll(/id: "(tl-[\w-]+)"/g)) PAGES["index.html"].add(m[1]);
for (const n of ["01", "02", "03", "04", "05", "06", "07", "08"]) { PAGES["index.html"].add("ed-" + n); if (Number(n) <= 6) PAGES["index.html"].add("dom-" + n); }
for (const c of ["tesat", "opic-ih", "전기기능사", "분양대행자"]) PAGES["index.html"].add("cred-" + c);
PAGES["index.html"].add("arsenal"); PAGES["index.html"].add("credentials");

test("모든 카드 딥링크 앵커가 실제 페이지에 존재", () => {
  const missing = [];
  const check = (href, who) => {
    const m = /^(index|career|gallery)\.html#([\w-]+)$/.exec(href || "");
    if (!m) return;
    if (!PAGES[m[1] + ".html"].has(m[2])) missing.push(who + " → " + href);
  };
  for (const c of KB.cards) { check(c.primary && c.primary.href, c.id); check(c.secondary && c.secondary.href, c.id); }
  for (const s of KB.services) check(s.cta && s.cta.href, s.id);
  assert.deepEqual(missing, []);
});
