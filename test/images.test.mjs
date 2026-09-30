/* 반응형 이미지 — sections.jsx 의 OPT 목록과 scripts/build-images.mjs 산출물이 어긋나지 않는지.
 * 어긋나면 <picture> 가 없는 파일을 가리켜, 브라우저가 조용히 원본 JPEG 로 떨어지거나 깨진다. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(ROOT, "sections.jsx"), "utf8");
const block = /const OPT = \{([\s\S]*?)\};/.exec(src);
const OPT = {};
for (const m of block[1].matchAll(/"([\w-]+)":\s*\[([\d,\s]+)\]/g)) OPT[m[1]] = m[2].split(",").map((x) => +x.trim());

test("OPT 에 적힌 모든 폭의 AVIF · WebP 파일이 존재한다", () => {
  assert.ok(Object.keys(OPT).length >= 10, "OPT 파싱 실패");
  const missing = [];
  for (const [name, ws] of Object.entries(OPT)) for (const w of ws) for (const ext of ["avif", "webp"]) {
    const f = join(ROOT, "images/opt", `${name}-${w}.${ext}`);
    if (!existsSync(f)) missing.push(`${name}-${w}.${ext}`);
  }
  assert.deepEqual(missing, [], "npm run build:images 를 실행하세요");
});

test("AVIF 가 같은 폭의 WebP 보다 무겁지 않다 (인코딩 설정 회귀 감지)", () => {
  const worse = [];
  for (const [name, ws] of Object.entries(OPT)) {
    const w = ws[ws.length - 1];
    const a = statSync(join(ROOT, "images/opt", `${name}-${w}.avif`)).size;
    const b = statSync(join(ROOT, "images/opt", `${name}-${w}.webp`)).size;
    if (a > b * 1.15) worse.push(`${name}@${w}: avif ${Math.round(a / 1024)}KB > webp ${Math.round(b / 1024)}KB`);
  }
  assert.deepEqual(worse, []);
});

test("<Pic> 이 쓰는 이름은 전부 OPT 에 등록돼 있다", () => {
  const used = [...src.matchAll(/<Pic name="([\w-]+)"/g)].map((m) => m[1]);
  const missing = used.filter((n) => !OPT[n]);
  assert.deepEqual(missing, []);
  for (const n of ["fw-gwanghwamun", "fw-street", "fw-map", "fw-phone", "profile-yubin", "ssafy-presentation", "press-yonhap"]) {
    assert.ok(OPT[n], n + " 가 OPT 에 없다 (필드워크 스트립·스크롤 스토리는 이름을 변수로 넘긴다)");
  }
});
