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
