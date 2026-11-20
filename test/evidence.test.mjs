/* 증빙 PDF(assets/evidence) — 공개본에 생년월일 · 주민등록번호 · 주소가 새지 않는지, 갤러리 링크가 실제 파일을 가리키는지 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { spawnSync } from "node:child_process";

const DIR = "assets/evidence";
const pdfs = readdirSync(DIR).filter((f) => f.endsWith(".pdf"));

/* PDF 안의 압축 스트림을 풀어 글자를 꺼낸다(글꼴 · 이미지 스트림은 깨진 바이트로 섞여도 무방) */
function pdfText(buf) {
  const s = buf.toString("latin1");
  let out = s;
  const re = /stream\r?\n/g;
  let m;
  while ((m = re.exec(s))) {
    const start = m.index + m[0].length;
    const end = s.indexOf("endstream", start);
    if (end < 0) break;
    try { out += inflateSync(buf.subarray(start, end)).toString("latin1"); } catch {}
    re.lastIndex = end;
  }
  return out;
}

test("증빙 PDF 8개 · 각 3MB 이하", () => {
  assert.equal(pdfs.length, 8, pdfs.join(","));
  for (const f of pdfs) assert.ok(statSync(`${DIR}/${f}`).size < 3 * 1024 * 1024, f);
});

test("공개본에 생년월일 · 주민등록번호 · 집 주소 없음", () => {
  for (const f of pdfs) {
    const t = pdfText(readFileSync(`${DIR}/${f}`));
    assert.ok(!/20040518|040518|2004\s*년\s*5\s*월\s*18/.test(t), `${f} 생년월일`);
    assert.ok(!/\d{6}\s*-\s*[1-4]\d{6}/.test(t), `${f} 주민등록번호 형식`);
    assert.ok(!/사임당로|SUITE HILL/i.test(t), `${f} 주소`);
  }
});

/* 글자가 글리프 번호로 들어간 PDF 는 위 방식으로 못 읽는다 — PyMuPDF 가 있으면 실제 추출 글자로 다시 검사 */
test("PyMuPDF 추출 글자 기준 생년월일 · 주민번호 없음", (t) => {
  const py = `import fitz,sys,json,re
bad=[]
for f in sys.argv[1:]:
  s=''.join(p.get_text() for p in fitz.open(f))
  if re.search(r'20040518|2004\s*년\s*5\s*월\s*18|\d{6}\s*-\s*[1-4]\d{6}',s): bad.append(f)
print(json.dumps(bad))`;
  const r = spawnSync("python", ["-c", py, ...pdfs.map((f) => `${DIR}/${f}`)], { encoding: "utf8", env: { ...process.env, PYTHONUTF8: "1" } });
  if (r.status !== 0) return t.skip("PyMuPDF 없음 — 추출 검사 건너뜀");
  assert.deepEqual(JSON.parse(r.stdout.trim()), []);
});

test("재직증명서 · 건강보험 확인서는 저장소에 없음", () => {
  for (const f of pdfs) assert.ok(!/employ|nhis|health|재직|건강보험/i.test(f), f);
});

test("갤러리 내려받기 링크가 모두 실제 파일", () => {
  const g = readFileSync("gallery.html", "utf8");
  const hrefs = [...g.matchAll(/href="(assets\/evidence\/[^"]+\.pdf)"/g)].map((m) => m[1]);
  assert.ok(hrefs.length >= 8, "링크 수 " + hrefs.length);
  for (const h of hrefs) assert.ok(existsSync(h), h);
  assert.ok(g.includes('id="evidence-pdf"'));
});
