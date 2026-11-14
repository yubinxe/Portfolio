/* ALPHA SHEEP 인트로 — 장면 순서 · 건너뛰기 · 출처 표기 · 대체 경로(JS 없음 · 움직임 줄이기) · 가벼운 구현 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
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

test("건너뛰기 · 인트로 제어 — SKIP 은 선호를 바꾸지 않는 링크, 스위치는 실제 상태(aria-checked), 선호와 재생을 나눈다", () => {
  assert.ok(/<a className="ix__skip" href="#manifesto"/.test(block), "SKIP INTRO 링크");
  const skip = block.slice(block.indexOf('className="ix__skip"'), block.indexOf("SKIP INTRO"));
  assert.ok(!/setPref|localStorage/.test(skip), "SKIP 은 저장된 선호를 바꾸지 않는다");
  assert.ok(block.includes('<a className="ix__cv font-ko" href="resume.html" onClick={() => ykIntro.skipSession()}>1페이지 이력 보기</a>'), "인트로에서 바로 1페이지 이력");
  assert.ok(block.includes('<IxSwitch className="ix__switch" />'), "인트로 안 스위치");
  assert.ok(/role="switch" aria-checked=\{pref\}/.test(jsx), "aria-checked 는 실제 선호");
  assert.ok(jsx.includes('<IxSwitch className="hnav__ix" />') && jsx.includes('href="resume.html" className="hnav__cv'), "상단 메뉴에 스위치 · 1페이지 이력");
  assert.ok(jsx.includes('className="ix-replay font-ko" onClick={() => ykIntro.replay()}'), "다시 보기는 replay");
  const setPref = jsx.slice(jsx.indexOf("  setPref(on) {"), jsx.indexOf("  replay() {"));
  assert.ok(!/scrollTo\(/.test(setPref.replace(/ixHide\(\)/g, "")), "선호를 켜는 것만으로 맨 위로 이동하지 않는다");
  assert.ok(/replay\(\) \{[\s\S]*?scrollTo\(\{ top: 0/.test(jsx), "맨 위 이동은 replay 에서만");
  assert.ok(!/document\.cookie/.test(jsx), "쿠키 사용 금지");
  assert.ok(/localStorage\.(setItem|removeItem)\(IX_KEY/.test(jsx) && jsx.includes('IX_KEY = "yk.intro"'), "기존 저장 키 유지");
  assert.ok(jsx.includes('IX_SESSION = "yk.intro.s"') && /sessionStorage\.setItem\(IX_SESSION/.test(jsx), "이번 탭 건너뛰기는 sessionStorage");
  assert.ok(/role="status" aria-live="polite"/.test(jsx), "설정 결과만 알림");
});

test("첫 그리기 전 결정 — 움직임 줄이기 · 끄기 저장 · 깊은 링크(#)를 head 스크립트가 반영", () => {
  const head = html.slice(0, html.indexOf("</head>"));
  const s = head.match(/<script>([^<]*ix-on[^<]*)<\/script>/);
  assert.ok(s, "head 스크립트");
  assert.ok(s[1].includes("prefers-reduced-motion: reduce") && s[1].includes('"yk.intro"') && s[1].includes("location.hash"));
  assert.ok(s[1].includes('sessionStorage.getItem("yk.intro.s")') && s[1].includes("ix-pref-off"), "선호와 이번 탭 건너뛰기를 나눠 읽는다");
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

test("보조 문장 · 선 경로 — 문장을 가로지르지 않는 줄, 넓은/좁은 화면 경로 분리, 개념 문장 두 줄", () => {
  assert.ok(block.includes("시대가 바뀌는 순간") && block.includes("흐름을 따르는 사람이 아니라,") && block.includes("변화를 실행하는 사람."));
  assert.ok(block.indexOf("양이 되다.") < block.indexOf("변화를 실행하는 사람.") && block.indexOf("변화를 실행하는 사람.") < block.indexOf("FOLLOW LESS. CREATE FIRST."));
  assert.ok(/const y = \[300, 344, 566, 610\]\[r\]/.test(jsx), "무리의 줄은 가운데 글자 띠를 비운다");
  assert.ok(block.includes("ix__alpha--w") && block.includes("ix__alpha--n") && /html\.ix-on \.ix__alpha--n\{display:block\}/.test(css));
  assert.ok(!/\.ix__alpha\{[^}]*non-scaling-stroke/.test(css), "pathLength 점선에 non-scaling-stroke 금지(1920 에서 끝 조각 노출)");
});

test("상태 판정 · 건너뛰기 도착 — 한 번에 맨 위로 돌아와도 맞고, SKIP 은 히어로 맨 위에 선다", () => {
  assert.ok(block.includes('rootMargin: "0px 0px -99% 0px"') && !/passed\s*=/.test(block), "지나간 여부를 기억하지 않는 관찰자");
  assert.ok(/html\.ix-on \.ix__mark\{top:0;bottom:auto;height:calc\(\(100% - 100vh\) \* \.9\)\}/.test(css));
  assert.ok(/html\.ix-on #manifesto\{margin-top:-100vh;scroll-margin-top:-84px\}/.test(css) && /scroll-padding-top:\s*84px/.test(read("features.css")), "scroll-padding 상쇄");
  assert.ok(/@supports \(height:100svh\)\{html\.ix-on \.ix__stage\{--sh:100svh\}\}/.test(css), "폰 주소창(svh) 기준 글자 상자");
});

test("배포 — GitHub Pages 가 Jekyll 을 거치지 않는다(.nojekyll)", () => {
  assert.ok(existsSync(new URL("../.nojekyll", import.meta.url)));
});
