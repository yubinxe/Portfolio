/* ALPHA SHEEP 인트로 — 장면 순서 · 건너뛰기 · 출처 표기 · 대체 경로(JS 없음 · 움직임 줄이기) · 가벼운 구현 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (f) => readFileSync(new URL("../" + f, import.meta.url), "utf8");
const jsx = read("sections.jsx"), css = read("intro.css"), html = read("index.html");
const block = jsx.slice(jsx.indexOf("function IntroSequence("), jsx.indexOf("/* ============================================================ HERO — 사진 중심"));

test("장면 순서 — 2027 → TREND KOREA 2027 → 키워드 → ALPHA SHEEP → 선언 → 김유빈 · KIM YUBIN", () => {
  const seq = [">2027<", "TREND KOREA", "2027년을 관통하는 키워드", 'const word = "ALPHA SHEEP"', "무리에서 벗어난", "양이 되다.", "FOLLOW LESS. CREATE FIRST.", "김유빈", "KIM YUBIN", "전략을 설계하고, 기술로 실행합니다."];
  const src = jsx.slice(jsx.indexOf("function IntroSequence(") - 0);
  let at = -1;
  for (const s of seq) {
    const i = (s.startsWith("const word") ? jsx : src).indexOf(s, s.startsWith("const word") ? 0 : at + 1);
    assert.ok(i > -1, "없음: " + s);
    if (!s.startsWith("const word")) { assert.ok(i > at, "순서: " + s); at = i; }
  }
  assert.ok(read("app.jsx").indexOf("<IntroSequence />") < read("app.jsx").indexOf("<HeroClassic />"), "인트로는 히어로 앞");
});

test("건너뛰기 — SKIP INTRO 는 JS 없이도 동작하는 링크, 인트로 끄기는 스위치 · 히어로에서 다시 켤 수 있다", () => {
  assert.ok(/<a className="ix__skip" href="#manifesto"/.test(block), "SKIP INTRO 링크");
  assert.ok(block.includes('role="switch"') && block.includes("ixSet(false)"), "인트로 끄기 스위치");
  assert.ok(jsx.includes('className="ix-replay font-ko" onClick={() => ixSet(true)}'), "다시 보기");
  assert.ok(!/document\.cookie/.test(jsx), "쿠키 사용 금지");
  assert.ok(/localStorage\.(setItem|removeItem)\(IX_KEY/.test(jsx));
});

test("첫 그리기 전 결정 — 움직임 줄이기 · 끄기 저장 · 깊은 링크(#)를 head 스크립트가 반영", () => {
  const head = html.slice(0, html.indexOf("</head>"));
  const s = head.match(/<script>([^<]*ix-on[^<]*)<\/script>/);
  assert.ok(s, "head 스크립트");
  assert.ok(s[1].includes("prefers-reduced-motion: reduce") && s[1].includes('"yk.intro"') && s[1].includes("location.hash"));
  assert.ok(head.indexOf("ix-on") < head.indexOf('rel="stylesheet"'), "스타일보다 먼저");
  assert.ok(head.includes('href="intro.css?v='));
});

test("출처 표기 — 공식 슬로건과 개인적 재해석을 구분하고 제휴가 없음을 밝힌다(표지 · 로고 없음)", () => {
  assert.ok(block.includes("《트렌드 코리아 2027》(김난도 외)") && block.includes("개인적 재해석") && block.includes("제휴 관계가 없습니다"));
  assert.ok(!/<img[^>]*(trend|cover|표지)/i.test(block), "도서 표지 이미지 없음");
});

test("가벼운 구현 — 외부 애니메이션 라이브러리 · 큰 블러 · 동영상 없이 transform · opacity", () => {
  const srcs = [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map((m) => m[1]).join(" ");
  assert.ok(!/gsap|ScrollTrigger|lenis|three/i.test(srcs), "외부 애니메이션 라이브러리: " + srcs);
  assert.ok(!/\b(gsap|ScrollTrigger|Lenis)\b/.test(block), "인트로 코드의 외부 라이브러리");
  assert.ok(!/filter\s*:\s*blur|backdrop-filter/.test(css), "블러");
  assert.ok(!/<video/.test(block), "동영상");
  assert.ok(block.includes('data-cine="pin"'), "기존 cine.js 진행도 재사용");
  assert.ok(/@media \(prefers-reduced-motion:no-preference\)\{\s*html\.ix-on \.ix\{height:/.test(css), "고정 장면은 움직임 허용 + ix-on 일 때만");
  assert.ok(/html\.ix-off \.ix\{display:none\}/.test(css) && /@media print\{\.ix\{display:none/.test(css));
  /* 장면 움직임에 쓰는 속성은 transform · opacity 뿐 — width · height · top · left · letter-spacing 을 진행도로 바꾸지 않는다 */
  for (const m of css.matchAll(/[{;]\s*([a-z-]+):[^;{}]*var\(--(p|cp|y1|t[0-9][io]?|t4o|t6t|m|fo|e|al|alo|fl|warm)\)/g)) {
    assert.ok(/^(transform|opacity|stroke-dashoffset|text-shadow|--[a-z0-9]+)$/.test(m[1]), "진행도로 바꾸는 속성: " + m[1]);
  }
});

test("검색 · 접근성 — 프리렌더에 인트로 문장과 히어로 h1 이 함께 있고, 장식은 숨긴다", () => {
  const pre = html.slice(html.indexOf("<!--prerender:start-->"), html.indexOf("<!--prerender:end-->"));
  assert.ok(pre.includes('id="intro"') && pre.includes("ALPHA SHEEP") || pre.includes("aria-label=\"ALPHA SHEEP\""));
  assert.ok(pre.includes("무리에서 벗어난") && pre.includes("김유빈") && /<h1[\s>]/.test(pre));
  assert.ok(pre.indexOf('id="intro"') < pre.indexOf('id="manifesto"'));
  assert.ok(/class="ix__flock"[^>]*aria-hidden="true"/.test(pre), "장식 그래픽 숨김");
});
