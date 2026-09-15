/* 내부 링크 무결성 — 페이지끼리 주고받는 앵커가 실제로 존재하는지.
 * 섹션 id 를 바꾸거나 페이지를 옮기면 링크가 조용히 죽는다. 배포는 초록인데
 * 방문자만 빈 화면 위쪽으로 떨어진다. 그걸 여기서 잡는다. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(ROOT, f), "utf8");
const PAGES = ["index.html", "career.html", "gallery.html", "lecture.html"];

/* 메인은 React 로 그려지므로 id 의 출처가 sections.jsx 다 */
function idsOf(file) {
  const src = read(file === "index.html" ? "sections.jsx" : file);
  const ids = new Set([...src.matchAll(/\bid=["'{]?["']?([\w-]+)["']?[}"']?/g)].map((m) => m[1]));
  if (file === "index.html") {
    for (const m of src.matchAll(/id: "([\w-]+)"/g)) ids.add(m[1]);
    /* 템플릿으로 만들어지는 id */
    for (const n of ["01", "02", "03", "04", "05", "06", "07", "08"]) ids.add("ed-" + n);
    for (const d of ["strategy", "ai", "data", "marketing", "teaching", "domain"]) ids.add("dom-" + d);
    for (const c of ["tesat", "opic-ih", "전기기능사", "분양대행자"]) ids.add("cred-" + c);
    /* index.html 자체에 있는 정적 id(챗봇 루트 등) */
    for (const m of read("index.html").matchAll(/\bid="([\w-]+)"/g)) ids.add(m[1]);
  }
  return ids;
}
const IDS = Object.fromEntries(PAGES.map((p) => [p, idsOf(p)]));

test("페이지 간 링크가 실제 파일과 앵커를 가리킨다", () => {
  const dead = [];
  for (const from of PAGES) {
    const html = read(from);
    for (const m of html.matchAll(/href="([^"#:][^":]*?)?(#[\w가-힣-]+)?"/g)) {
      const file = m[1];
      const hash = m[2] ? m[2].slice(1) : "";
      if (!file && !hash) continue;
      if (file && !file.endsWith(".html")) continue;          // 자산·외부는 대상 아님
      const target = file || from;
      if (file && !existsSync(join(ROOT, file))) { dead.push(`${from} → ${file} (파일 없음)`); continue; }
      if (!hash) continue;
      if (!PAGES.includes(target)) continue;                   // 검사 대상 페이지만
      if (!IDS[target].has(hash)) dead.push(`${from} → ${target}#${hash} (앵커 없음)`);
    }
  }
  assert.deepEqual(dead, [], "끊긴 링크\n" + dead.join("\n"));
});

test("JSON-LD 의 @id 참조가 그래프 안이나 index 의 정의로 이어진다", () => {
  const defined = [];
  const referenced = [];
  for (const f of PAGES) {
    for (const m of read(f).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      const doc = JSON.parse(m[1]);
      /* @type 이 함께 있으면 정의, @id 만 있으면 참조 */
      const walk = (n) => {
        if (Array.isArray(n)) return n.forEach(walk);
        if (!n || typeof n !== "object") return;
        if (n["@id"]) (n["@type"] ? defined : referenced).push(n["@id"]);
        for (const [k, v] of Object.entries(n)) if (k !== "@id") walk(v);
      };
      for (const node of doc["@graph"] || [doc]) walk(node);
    }
  }
  const defs = new Set(defined);
  const missing = [...new Set(referenced)].filter((id) => !defs.has(id));
  assert.deepEqual(missing, [], "정의가 없는 @id 참조: " + missing.join(", "));
});
