/* 사례집 프리렌더 — cases-data.js + cases-render.js 로 cases.html 의 <!--cases:start-->…<!--cases:end--> 를 채운다.
 * 검색 · JS 없음에서도 본문이 보이고, 브라우저(cases.js)는 같은 함수로 시연만 다시 그린다.  npm run build 에 포함 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const R = require(path.join(ROOT, "cases-render.js"));
const file = path.join(ROOT, "cases.html");
const html = readFileSync(file, "utf8");
const body = '<nav class="cs-toc" aria-label="사례 목차">' + R.renderIndex() + "</nav>" + R.renderAll();
const out = html.replace(/<!--cases:start-->[\s\S]*?<!--cases:end-->/, "<!--cases:start-->" + body + "<!--cases:end-->");
if (out === html && !html.includes(body)) throw new Error("cases.html 에 프리렌더 표식이 없습니다");
writeFileSync(file, out);
console.log(`cases.html 프리렌더 ${(body.length / 1024).toFixed(1)} KB`);
