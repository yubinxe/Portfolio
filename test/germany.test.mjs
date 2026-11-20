/* Berlin 2022 — OSZ TIEM 교육 참여 · Vattenfall Wärme Berlin AG 인턴십
 * 사실(기간 · 기관명 · 부서)은 공식 증빙 그대로, 과장(학위 · 자격 · 정규직)은 없게,
 * 회사 내부 등급 문서(추천서)와 담당자 연락처는 저장소 어디에도 없게. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(ROOT, f), "utf8");
const jsx = read("sections.jsx"), career = read("career.html"), gallery = read("gallery.html"), kb = read("kb.js");
const entry = (id) => { const i = jsx.indexOf(`{ id: "${id}"`); return jsx.slice(i, jsx.indexOf("\n  {", i + 5)); };

test("기간 · 기관명 · 부서가 증빙과 같다", () => {
  const v = entry("tl-vattenfall"), o = entry("tl-osz-tiem");
  assert.ok(/group: "work"/.test(v) && v.includes("Vattenfall Wärme Berlin AG") && v.includes("2022. 10. 4 ~ 11. 21") && v.includes("Technical Training Department"));
  assert.ok(v.includes("인턴십") && v.includes("정규직 재직이 아닌"));
  assert.ok(/group: "edu"/.test(o) && o.includes("2022. 9. 6 ~ 9. 30") && o.includes("Technische Informatik, Industrieelektronik und Energiemanagement"));
  assert.ok(/order: \[[^\]]*"tl-osz-tiem"/.test(jsx), "교육 그룹 order 에 OSZ 포함");
  for (const t of [career, gallery, kb]) {
    assert.ok(t.includes("Vattenfall Wärme Berlin AG") && t.includes("OSZ TIEM"));
  }
  assert.ok(career.includes('id="cv-vattenfall"') && career.includes('id="cv-osz-tiem"'));
  assert.ok(gallery.includes('id="germany-2022"'));
});

test("과장하지 않는다 — 학위 · 국가자격 · 면허 · 정규직 · 인증 취득으로 쓰지 않는다", () => {
  const pub = [career, gallery, kb, entry("tl-vattenfall"), entry("tl-osz-tiem")].join("\n");
  for (const bad of [/독일[^.\n]{0,20}(대학|학위)[^.\n]{0,6}(졸업|취득)/, /독일[^.\n]{0,20}(국가기술자격|면허)[^.\n]{0,4}취득/, /VDE[^.\n]{0,12}(인증|자격)[^.\n]{0,4}(취득|보유)/, /Vattenfall[^.\n]{0,30}정규직[^.\n]{0,4}(근무|재직)(했|하)/]) {
    assert.ok(!bad.test(pub), "과장 표현: " + bad);
  }
  assert.ok(!/대구광역시교육청 · 독일 Vattenfall/.test(pub), "주관 범위 미확인 표기 제거");
});

test("추천서 원문 · 담당자 연락처 · 회사 식별정보가 저장소에 없다", () => {
  /* 실제 값은 적지 않는다 — 형식으로만 찾는다(전화 · IBAN · 상업등기 · 부가세번호 · 회사 메일 · 내부 등급 표기) */
  const banned = [/\b01[5-7]\d[ -]?\d{3}[ -]?\d{2}[ -]?\d{2}\b/, /\bDE\d{2}(?: ?\d{4}){4}/, /\bHRB ?\d{5,}/, /\bDE\d{9}\b/, /@vattenfall\.(de|com)/i, /\bC2 - Internal\b/i];
  const skip = new Set(["node_modules", ".git"]);
  const hits = [];
  const walk = (d) => {
    for (const n of readdirSync(d)) {
      if (skip.has(n)) continue;
      const p = join(d, n), st = statSync(p);
      if (st.isDirectory()) { walk(p); continue; }
      if (/(letter|recommend|empfehlung|vattenfall)/i.test(n)) hits.push("파일명: " + p);
      if (/\.(html|js|jsx|mjs|json|md|css|txt)$/.test(n) && st.size < 4e6) {
        const t = readFileSync(p, "utf8");
        for (const b of banned) if (b.test(t)) hits.push(`${b} in ${p}`);
      }
    }
  };
  walk(ROOT);
  assert.deepEqual(hits, []);
  assert.ok(gallery.includes("원문 비공개") && !/<img[^>]*(letter|recommend|vattenfall)/i.test(gallery + career));
});

test("공개 이미지는 메타데이터(EXIF) 없이 올린다", () => {
  for (const f of ["berlin-lab", "berlin-lab-600", "berlin-lab2", "berlin-lab2-600", "osz-cert", "osz-cert-600"]) {
    const b = readFileSync(join(ROOT, "images", f + ".jpg"));
    assert.ok(!b.includes(Buffer.from("Exif\0\0")), f + " 에 EXIF 가 남아 있다");
  }
  assert.ok(gallery.includes("비식별 처리") && gallery.includes("서명"));
});
