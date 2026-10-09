/* 메인 페이지 프리렌더 — dist/*.js 로 <App /> 을 HTML 문자열로 렌더해 index.html 의 #root 에 넣는다.
 * 네이버 Yeti 등 JS 실행이 제한적인 수집기도 본문(이력·프로젝트·강의)을 읽을 수 있게 하기 위함이다.
 * 브라우저에서는 app.jsx 가 같은 DOM 을 hydrateRoot 로 이어받으므로 화면은 달라지지 않는다.
 *
 *   npm run build   → dist 갱신 후 프리렌더까지 수행
 *   npm test        → index.html 의 프리렌더가 최신인지 검증 (test/prerender.test.mjs) */
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
export const START = "<!--prerender:start-->";
export const END = "<!--prerender:end-->";
const BUNDLE = ["tweaks-panel", "icons", "sections"];

export async function renderApp(html) {
  const React = require("react");
  const { renderToString } = require("react-dom/server");
  const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((s) => s.includes("TWEAK_DEFAULTS"));
  if (!inline) throw new Error("index.html 에서 TWEAK_DEFAULTS 블록을 찾지 못했습니다");

  /* 렌더 단계에서는 브라우저 API 를 쓰지 않는다(effect 안에서만 사용). 진입점 호출만 막아 둔다. */
  const ctx = {
    React,
    ReactDOM: { createRoot: () => ({ render() {} }), hydrateRoot() {} },
    document: { getElementById: () => ({ firstElementChild: null }), documentElement: { setAttribute() {} } },
    console,
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  let code = "";
  for (const f of BUNDLE) code += (await readFile(path.join(ROOT, "dist", f + ".js"), "utf8")) + "\n";
  code += inline.replace(/\bconst (TWEAK_DEFAULTS|PALETTES)\b/g, "var $1") + "\n";
  code += (await readFile(path.join(ROOT, "dist/app.js"), "utf8")) + "\n;globalThis.__App = App;";
  vm.runInContext(code, ctx, { filename: "prerender-bundle.js" });
  return renderToString(React.createElement(ctx.__App));
}

export function inject(html, markup) {
  const open = '<div id="root">';
  const i = html.indexOf(open);
  const j = html.indexOf("</div>", i);
  if (i < 0) throw new Error('index.html 에 <div id="root"> 가 없습니다');
  const s = html.indexOf(START, i);
  const e = html.indexOf(END, i);
  const before = html.slice(0, i + open.length);
  const after = s > -1 && e > s ? html.slice(e + END.length) : html.slice(j);
  return before + START + markup + END + after;
}

if (process.argv[1] && process.argv[1].endsWith("prerender.mjs")) {
  const file = path.join(ROOT, "index.html");
  const html = await readFile(file, "utf8");
  const markup = await renderApp(html);
  await writeFile(file, inject(html, markup), "utf8");
  const text = markup.replace(/<[^>]+>/g, " ");
  console.log(`index.html #root 프리렌더 ${(markup.length / 1024).toFixed(1)} KB · 한글 ${(text.match(/[가-힣]/g) || []).length}자`);
}
