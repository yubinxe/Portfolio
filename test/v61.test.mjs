/* V6.1 — 사진형 첫 화면 복구 · 건축 모형은 경국 AX 섹션에서만 · 법률 AX 6대 시스템(경국 실무 3 + 개인 공개 시연 3) */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (f) => readFileSync(new URL("../" + f, import.meta.url), "utf8");
const jsx = read("sections.jsx"), city = read("city.js"), index = read("index.html");

test("첫 화면은 사진형 Hero — 건축 캔버스 없음, CTA 세 개가 실제 앵커로", () => {
  assert.ok(/function HeroClassic\(/.test(jsx) && read("app.jsx").includes("<HeroClassic />"));
  assert.ok(!/HeroCity|city-hero/.test(jsx + read("app.jsx")), "건물형 랜딩이 남아 있음");
  const hero = jsx.slice(jsx.indexOf("function HeroClassic("), jsx.indexOf("function Sticker("));
  assert.ok(hero.includes('name="hero-gangnam"') && hero.includes("YUBIN") && hero.includes("KIM"));
  assert.ok(!/canvas|City\./.test(hero), "첫 화면에 캔버스 · 건축 엔진");
  for (const [href, label] of [["#trial-brief", "대표 프로젝트 보기"], ["#ax-desk", "법률 AX 6대 시스템"], ["#contact", "협업 문의"]]) {
    assert.ok(hero.includes(`href="${href}"`) && hero.includes(label), label);
  }
  for (const id of ["trial-brief", "tools", "ax-desk", "contact"]) assert.ok(new RegExp(`id="${id}"`).test(jsx), "앵커 없음 " + id);
});

test("건축 모형은 경국 AX 장면(reg · build · comp)만 — 히어로 · 네 제품 · 법률 AX 상세에는 없다", () => {
  const scenes = [...city.matchAll(/SCENES(?:\.(\w+)|\["([\w-]+)"\])\s*=/g)].map((m) => m[1] || m[2]).sort();
  assert.deepEqual(scenes, ["build", "comp", "reg"]);
  assert.ok(!/City\.mount/.test(jsx.replace(/function useScene[\s\S]*?\n}\n/, "")), "useScene 밖에서 City.mount");
  const uses = [...jsx.matchAll(/useScene\(cv, "(\w+)"/g)].map((m) => m[1]).sort();
  assert.deepEqual(uses, ["build", "comp", "reg"]);
  const tools = jsx.slice(jsx.indexOf("function FlagshipTool("), jsx.indexOf("function ArtifactsSection("));
  assert.ok(!/canvas|City|useScene/.test(tools), "제품 카드에 건축 장면");
  assert.ok(!/<script src="city\.js/.test(index), "index 가 건축 엔진을 즉시 불러옴(지연 로드여야 함)");
  assert.ok(!/city\.js|City\./.test(read("legal-ax.html") + read("legal-ax.jsx")), "법률 AX 상세에 건물 애니메이션");
});

test("AX 6대 시스템 — A(경국 실무 · 사내 구축) 3 + B(개인 공개 시연) 3, 소속과 상태를 섞지 않는다", () => {
  const block = jsx.slice(jsx.indexOf("const AX_SYSTEMS = ["), jsx.indexOf("const AX_STATUS_KO"));
  const items = block.split(/\n  \{ id: /).slice(1);
  assert.equal(items.length, 6);
  const A = items.filter((s) => s.includes('group: "A"')), B = items.filter((s) => s.includes('group: "B"'));
  assert.equal(A.length, 3); assert.equal(B.length, 3);
  for (const s of A) assert.ok(s.includes('category: "firm-practice"') && s.includes('ownership: "law-firm-work"') && s.includes('implementationStatus: "internal-built"'));
  for (const s of B) {
    assert.ok(s.includes('category: "personal-demo"') && s.includes('ownership: "independent"') && s.includes('implementationStatus: "public-demo"'));
    const m = s.match(/demoPath: "legal-ax\.html#task=(\w+)&field=(\w+)"/);
    assert.ok(m && ["evidence", "research", "matter"].includes(m[1]) && m[2] === "civil", "깊은 링크 " + s.slice(0, 20));
  }
  for (const k of ["koreanTitle", "englishName", "problem", "solution", "interaction", "evidence", "number"]) assert.equal((block.match(new RegExp(k + ":", "g")) || []).length, 6, k);
  assert.ok(!/경국 전사 도입|경국 도입 AX 6종/.test(jsx), "B 를 경국 도입으로 표현");
  assert.ok(jsx.includes("경국에서 도입 · 운영한 시스템이 아닙니다"));
  /* 상세 시연의 해시 규칙(task · field)과 맞는지 */
  const lax = read("legal-ax.jsx");
  for (const t of ["evidence", "research", "matter", "contract"]) assert.ok(lax.includes(`k: "${t}"`), t);
});

test("05 는 '법령·문서 근거 탐색' — 판례 원문 검색을 구현한 것처럼 부르지 않는다", () => {
  const lax = read("legal-ax.jsx");
  assert.ok(lax.includes('ko: "법령·문서 근거 탐색하기"') && !lax.includes("법령·판례 근거 확인하기"));
  assert.ok(jsx.includes('koreanTitle: "법령·문서 근거 탐색"') && jsx.includes("판례 원문은 연동하지 않았습니다"));
});
