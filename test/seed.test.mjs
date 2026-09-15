/* seed/seed.json 이 kb.js 와 어긋나지 않는지.
 * 어긋난 채로 `npm run seed` 를 돌리면 Airtable 에 옛 CTA·옛 태그가 올라간다.
 * (실제로 강의 CTA 를 lecture.html 로 옮긴 뒤 시드가 index.html#lec-01 을 가리키고 있었다) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, rmSync, cpSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

test("seed/seed.json 이 kb.js 로 다시 빌드한 결과와 같다 (빌드 누락 감지)", () => {
  const committed = readFileSync(join(ROOT, "seed/seed.json"), "utf8");
  /* 원본을 건드리지 않도록 임시 사본에서 빌드한다 */
  const tmp = mkdtempSync(join(tmpdir(), "seedchk-"));
  try {
    for (const f of ["build-seed.mjs", "kb.js"]) cpSync(join(ROOT, f), join(tmp, f));
    execFileSync(process.execPath, ["build-seed.mjs"], { cwd: tmp, stdio: "pipe" });
    const rebuilt = readFileSync(join(tmp, "seed/seed.json"), "utf8");
    assert.equal(committed, rebuilt, "kb.js 를 고치고 `npm run seed:build` 를 실행하지 않았습니다");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("시드가 kb.js 의 현재 버전과 카드 수를 담는다", async () => {
  const seed = JSON.parse(readFileSync(join(ROOT, "seed/seed.json"), "utf8"));
  const { createRequire } = await import("node:module");
  const KB = createRequire(import.meta.url)("../kb.js");
  assert.equal(seed.version, KB.version);
  assert.equal(seed.tables.KnowledgeCards.length, KB.cards.length);
  for (const row of seed.tables.KnowledgeCards) {
    assert.ok(row.PrimaryHref, row.Id + " 주 CTA 누락");
    assert.notEqual(row.SecondaryHref, row.PrimaryHref, row.Id + " 보조 CTA 가 주 CTA 와 같다");
  }
});
