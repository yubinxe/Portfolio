/* JSX 사전 컴파일 — 브라우저에서 Babel standalone(1.4MB)을 내려받아 런타임에
 * 변환하던 것을 빌드 시점으로 옮긴다. 결과물은 dist/*.js 로 커밋되며,
 * test/dist.test.mjs 가 원본과 어긋난 상태(미빌드)를 잡아낸다.
 *
 *   npm run build   → dist 갱신
 *   npm test        → dist 가 최신인지 검증 */
import { transformAsync } from "@babel/core";
import presetReact from "@babel/preset-react";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const SOURCES = ["tweaks-panel.jsx", "icons.jsx", "sections.jsx", "app.jsx"];

export async function compile(file) {
  const code = await readFile(path.join(ROOT, file), "utf8");
  const out = await transformAsync(code, {
    filename: file,
    babelrc: false,
    configFile: false,
    compact: false,
    retainLines: true,
    presets: [[presetReact, { runtime: "classic" }]],
  });
  return `/* 자동 생성 파일 — 수정하지 마세요. 원본: ${file} · 갱신: npm run build */\n${out.code}\n`;
}

if (process.argv[1] && process.argv[1].endsWith("build-jsx.mjs")) {
  await mkdir(path.join(ROOT, "dist"), { recursive: true });
  for (const f of SOURCES) {
    const js = await compile(f);
    const dest = path.join(ROOT, "dist", f.replace(/\.jsx$/, ".js"));
    await writeFile(dest, js, "utf8");
    console.log(`${f} → dist/${path.basename(dest)} (${(js.length / 1024).toFixed(1)} KB)`);
  }
}
