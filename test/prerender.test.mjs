/* 메인 프리렌더 — JS 를 실행하지 않는 수집기가 본문을 읽을 수 있는지, 그리고 원본과 어긋나지 않았는지. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = await readFile(path.join(ROOT, "index.html"), "utf8");

let pre = null;
try {
  pre = await import("../scripts/prerender.mjs");
  await import("react-dom/server");
} catch {
  pre = null; /* react 미설치 — npm install 후 다시 실행 */
}

const block = () => {
  const s = html.indexOf("<!--prerender:start-->");
  const e = html.indexOf("<!--prerender:end-->");
  assert.ok(s > -1 && e > s, "index.html #root 에 프리렌더 블록이 없습니다 — npm run build");
  return html.slice(s + "<!--prerender:start-->".length, e);
};

test("#root 안에 이력·프로젝트·강의 본문이 HTML 로 들어 있다", () => {
  const text = block().replace(/<[^>]+>/g, " ");
  assert.ok((text.match(/[가-힣]/g) || []).length > 3000, "한글 본문이 너무 적습니다");
  for (const kw of ["김유빈", "법무법인 경국", "서초청년네트워크", "감정평가사 필드워크", "국민 대토론회"]) {
    assert.ok(text.includes(kw), "프리렌더 본문에 " + kw + " 누락");
  }
  assert.ok(/<h1[\s>]/.test(block()), "프리렌더에 h1 이 없습니다");
});

test("프리렌더가 현재 dist 로 렌더한 결과와 같다 (npm run build 누락 감지)", { skip: pre ? false : "npm install 필요 (react)" }, async () => {
  assert.equal(block(), await pre.renderApp(html), "index.html 프리렌더가 낡았습니다 — npm run build 를 실행하세요");
});

test("app.jsx 는 프리렌더 DOM 을 hydrate 로 이어받는다", async () => {
  const app = await readFile(path.join(ROOT, "app.jsx"), "utf8");
  assert.ok(app.includes("hydrateRoot"), "hydrateRoot 누락 — createRoot 만 쓰면 프리렌더 DOM 을 지우고 다시 그립니다");
  assert.ok(html.includes('getAttribute("data-app") !== "ready"'), "인라인 인터랙션이 hydrate 완료를 기다리지 않습니다");
});
