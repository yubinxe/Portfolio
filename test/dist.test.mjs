/* dist/*.js 가 원본 JSX 와 어긋나지 않는지 — 빌드를 잊고 커밋하면 사이트가 옛 코드로 뜹니다. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let builder = null;
try {
  builder = await import("../scripts/build-jsx.mjs");
} catch {
  /* @babel/core 미설치 — npm install 후 다시 실행하세요 */
}

test("dist/*.js 가 원본 JSX 로 다시 컴파일한 결과와 같다 (npm run build 누락 감지)", { skip: builder ? false : "npm install 필요 (@babel/core)" }, async () => {
  for (const src of builder.SOURCES) {
    const built = await compileSafe(builder, src);
    const onDisk = await readFile(path.join(ROOT, "dist", src.replace(/\.jsx$/, ".js")), "utf8");
    assert.equal(onDisk, built, `${src} 가 dist 에 반영되지 않았습니다 — npm run build 를 실행하세요`);
  }
});

async function compileSafe(b, src) { return b.compile(src); }

test("index.html 은 브라우저 Babel 을 쓰지 않는다", async () => {
  const html = await readFile(path.join(ROOT, "index.html"), "utf8");
  assert.ok(!/babel/i.test(html.split("<body")[0] + html), "text/babel · babel standalone 이 남아 있습니다");
  assert.ok(html.includes("react.production.min.js"), "React 는 프로덕션 빌드를 써야 합니다");
  for (const f of ["dist/tweaks-panel.js", "dist/icons.js", "dist/sections.js", "dist/app.js"]) {
    assert.ok(html.includes(f), `${f} 참조 누락`);
  }
});

/* 전송량 예산 — 폰트·JS 를 줄여 놓은 성과가 조용히 되돌아가지 않도록 상한을 둔다.
 * 숫자는 현재값에 여유를 얹은 것이며, 넘으면 "왜 커졌는지" 를 먼저 확인하라는 신호다. */
test("첫 화면 자산이 예산 안에 있다", async () => {
  const { statSync } = await import("node:fs");
  const kb = (p) => statSync(path.join(ROOT, p)).size / 1024;
  const budget = [
    ["dist/sections.js", 90],
    ["dist/tweaks-panel.js", 40],
    ["dist/icons.js", 12],
    ["dist/app.js", 8],
    ["styles.css", 90],
    ["kb.js", 120],
    ["chatbot.js", 80],
  ];
  const over = budget.filter(([f, max]) => kb(f) > max)
    .map(([f, max]) => `${f} ${kb(f).toFixed(0)}KB > ${max}KB`);
  assert.deepEqual(over, [], "예산 초과\n" + over.join("\n"));
});
