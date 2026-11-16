/* 게재 · 취재 기록 프리렌더 — records-data.js 로 gallery.html 의 <!--records:start-->…<!--records:end--> 를 채운다(최신순).
 * 새 지면은 records-data.js 에 한 건 더하고 npm run build. JS 없이도 본문이 보인다. */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { KIND, RECORDS } = createRequire(import.meta.url)(path.join(ROOT, "records-data.js"));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function renderRecords(list = RECORDS) {
  const ids = new Set();
  for (const r of list) { if (ids.has(r.id)) throw new Error("중복 기록: " + r.id); ids.add(r.id); if (!KIND[r.kind]) throw new Error("분류 없음: " + r.id); }
  const sorted = [...list].sort((a, b) => (b.year * 100 + (b.month || 0)) - (a.year * 100 + (a.month || 0)));
  return sorted.map((r) => {
    const img = r.images[0];
    const when = r.issue ? `${esc(r.publisher)} · ${esc(r.issue)}` : `${esc(r.publisher)} · ${r.year}`;
    const more = r.images.slice(1).map((m, i) => ` · <a href="${esc(m.src)}" target="_blank" rel="noreferrer">지면 ${i + 2}</a>`).join("");
    const src = r.sourceUrl ? ` · <a href="${esc(r.sourceUrl)}" target="_blank" rel="noreferrer">원문 보기</a>` : "";
    return `<article class="rec reveal" id="rec-${esc(r.id)}">`
      + `<a class="rec__img" href="${esc(img.src)}" target="_blank" rel="noreferrer" aria-label="지면 전체 보기 — ${esc(r.title)}"><img src="${esc(img.thumb)}" alt="${esc(img.alt)}" width="${img.tw}" height="${img.th}" loading="lazy" /></a>`
      + `<div class="rec__body"><p class="rec__k font-sans"><span>${esc(KIND[r.kind])}</span>${when}</p>`
      + `<h3 class="font-ko">${esc(r.title)}</h3><p class="rec__sum font-ko">${esc(r.summary)}</p>`
      + `<dl class="rec__meta font-ko"><div><dt>역할</dt><dd>${esc(r.role)}</dd></div><div><dt>기명</dt><dd>${esc(r.credit)}</dd></div></dl>`
      + `<p class="rec__more font-sans"><a href="${esc(img.src)}" target="_blank" rel="noreferrer">지면 전체 보기</a>${more}${src}</p></div></article>`;
  }).join("");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const file = path.join(ROOT, "gallery.html");
  const html = readFileSync(file, "utf8");
  const body = renderRecords();
  const out = html.replace(/<!--records:start-->[\s\S]*?<!--records:end-->/, "<!--records:start-->" + body + "<!--records:end-->");
  if (!/<!--records:start-->/.test(html)) throw new Error("gallery.html 에 records 표식이 없습니다");
  writeFileSync(file, out);
  console.log(`gallery.html 게재 기록 ${RECORDS.length}건 프리렌더`);
}
