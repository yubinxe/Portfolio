/* 영문 사전 빌드 — i18n/en.json({ "한국어 원문": "English" }) → i18n-en.js(window.YK_EN). npm run build 가 함께 돌린다.
 * 원문 키는 화면에 보이는 글을 공백 하나로 줄인 그대로다 — 문장을 고치면 en.json 의 키도 같이 고쳐야 영문이 따라온다(test/i18n.test.mjs). */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const d = JSON.parse(readFileSync(path.join(ROOT, "i18n/en.json"), "utf8"));
const out = "/* 자동 생성 — scripts/build-i18n.mjs · 원천 i18n/en.json */\nwindow.YK_EN=" + JSON.stringify(d) + ";\n";
writeFileSync(path.join(ROOT, "i18n-en.js"), out);
console.log("i18n-en.js", Object.keys(d).length + "개", (out.length / 1024).toFixed(0) + " KB");
