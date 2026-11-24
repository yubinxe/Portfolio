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
  assert.ok(/<a className="ix__skip font-ko" href="#manifesto"/.test(block), "바로 본문 보기 링크(JS 없이도 동작)");
  const skip = block.slice(block.indexOf('className="ix__skip'), block.indexOf("바로 본문 보기 <span"));
  assert.ok(!/setPref|localStorage/.test(skip), "SKIP 은 저장된 선호를 바꾸지 않는다");
  assert.ok(block.includes('<a className="ix__cv font-ko" href="resume.html" onClick={() => ykIntro.skipSession()}><span lang="fr">Résumé</span> 보기</a>'), "인트로에서 바로 Résumé");
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

test("V7.2 — ALPHA SHEEP 다음 ‘2004년생의 선두에 서다’ · 영화 장치는 transform · opacity 만", () => {
  assert.ok(block.indexOf("ALPHA SHEEP") < block.indexOf("2004년생의") && block.indexOf("선두에 서다") < block.indexOf("무리에서 벗어난"), "장면 순서");
  for (const k of ["ix__lb ix__lb--t", "ix__door ix__door--l", "ix__flash", "ix__axis"]) assert.ok(block.includes(k), k);
  for (const m of css.matchAll(/[{;]\s*([a-z-]+):[^;{}]*var\(--(lb|dr|fx|ax|g4i|g4n|g4o)\)/g)) assert.ok(/^(transform|opacity|--[a-z0-9]+)$/.test(m[1]), "장치 속성: " + m[1]);
  assert.ok(/opacity:calc\(var\(--fx\) \* \.18\)/.test(css), "섬광은 한 번 · 최대 18%");
  assert.ok(read("i18n/en.json").includes('"2004년생의"'), "영문 사전");
});

test("밝기 대비 — KO/EN 왼쪽 같은 모양 · 선호 저장 · 뿌리(html) filter", () => {
  const i = read("i18n.js");
  assert.ok(i.includes('className = "yk-lang yk-ctr"') && i.includes('setAttribute("data-contrast-toggle"'), "같은 알약 모양");
  assert.ok(/lb\.parentNode\.insertBefore\(c, lb\)/.test(i), "KO/EN 바로 왼쪽");
  assert.ok(i.includes('"yk.contrast"') && /if \(hc\) H\.classList\.add\("yk-hc"\)/.test(i), "첫 그리기 전 적용");
  assert.ok(/html\.yk-hc\{filter:contrast/.test(i), "뿌리에 거는 filter(고정 요소 기준 유지)");
  assert.ok(i.includes('setAttribute("aria-pressed"'), "상태 알림");
});

test("가벼운 구현 — 외부 애니메이션 라이브러리 · 큰 블러 · 동영상 없이 transform · opacity", () => {
  const srcs = [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map((m) => m[1]).join(" ");
  assert.ok(!/gsap|ScrollTrigger|lenis|three/i.test(srcs), "외부 애니메이션 라이브러리: " + srcs);
  assert.ok(!/\b(gsap|ScrollTrigger|Lenis)\b/.test(block), "인트로 코드의 외부 라이브러리");
  assert.ok(!/filter\s*:\s*blur|backdrop-filter/.test(css), "블러");
  assert.ok(!/<video/.test(block), "동영상");
  assert.ok(!block.includes("data-cine"), "인트로는 스크롤 진행도(cine.js)에 묶지 않는다");
  assert.ok(/@media \(prefers-reduced-motion:no-preference\)\{\s*html\.ix-on \.ix\{position:fixed/.test(css), "고정 막은 움직임 허용 + ix-on 일 때만");
  assert.ok(/html\.ix-off \.ix\{display:none\}/.test(css) && /@media print\{\.ix\{display:none/.test(css));
  /* 장면 움직임에 쓰는 속성은 transform · opacity 뿐 — width · height · top · left · letter-spacing 을 진행도로 바꾸지 않는다 */
  for (const m of css.matchAll(/[{;]\s*([a-z-]+):[^;{}]*var\(--(t|a1s?|y1|sw|t[2-6][iort]|g2|k5|en5|tg|m|fo|e|al|alo|fl|rec|warm|dim)[,)]/g)) {
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

test("시간 기반 재생 — 스크롤 속도와 분리, 정지 구간 · 이름 장면은 가속하지 않는다", () => {
  assert.ok(/const IX_T = \{ end: 13\.3, name: 10\.6, rate: 1\.25, boost: [\d.]+, hold: \d+ \}/.test(jsx), "시간표");
  assert.ok(/const IX_HOLD = \[\[/.test(jsx) && /t >= IX_T\.name \|\| IX_HOLD\.some/.test(jsx), "정지 구간 · 이름 장면 가속 없음");
  assert.ok(/now < fastUntil && !ixHeld\(t\) \? IX_T\.boost : 1/.test(block), "입력은 가속만");
  assert.ok(/e\.deltaY > 0 \|\| e\.deltaX > 0\) fast\(\)/.test(block) && !/deltaY\s*[*/]/.test(block), "delta 크기를 장면 이동량으로 쓰지 않는다");
  assert.ok(/Math\.min\(0\.05, \(now - last\) \/ 1000\)/.test(block), "탭 복귀 때 한 번에 건너뛰지 않게 dt 상한");
  assert.ok(/st\.style\.setProperty\("--t"/.test(block) && !/--cp/.test(css.replace(/\/\*[\s\S]*?\*\//g, "")), "진행 원천은 --t 하나");
  for (const k of ["--a1:", "--t2i:", "--t3i:", "--t4i:", "--t5i:", "--t6i:", "--m:", "--fo:"]) assert.ok(css.includes(k), k);
});

test("잠금은 재생 중에만 — 끝 · 건너뛰기 · Esc · 페이지 이탈 · 오류 · 안전 시간 · 스크립트 실패에서 해제", () => {
  assert.ok(/html\.ix-lock,html\.ix-lock body\{overflow:hidden!important/.test(css), "배경 스크롤 잠금은 ix-lock 일 때만");
  assert.ok(/h\.classList\.remove\("ix-on", "ix-active", "ix-lock"\)/.test(block), "멈추면 잠금 해제");
  assert.ok(/e\.key === "Escape"\) \{ stop\(true\)/.test(block), "Esc 건너뛰기");
  assert.ok(block.includes('addEventListener("pagehide", onHide)') && block.includes('addEventListener("error", onErr)'), "이탈 · 오류 정리");
  assert.ok(/safety = setTimeout\(\(\) => stop\(false\)/.test(block), "안전 시간 초과");
  assert.ok(/inertize\(true\)/.test(block) && /inertize\(false\)/.test(block), "재생 중에만 인트로 밖 inert");
  const head = html.slice(0, html.indexOf("</head>"));
  assert.ok(/setTimeout\(function\(\)\{if\(!window\.__ixRun\)\{h\.classList\.remove\("ix-on","ix-active","ix-lock"\)/.test(head), "스크립트 실패 시 막 걷기");
  assert.ok(/off\|\|skip\|\|location\.hash\)h\.classList\.add\("ix-off"\)/.test(head), "깊은 링크는 바로 본문");
  assert.ok(/@supports \(height:100svh\)\{html\.ix-on \.ix__stage\{--sh:100svh\}\}/.test(css), "폰 주소창(svh) 기준 글자 상자");
  assert.ok(!/html\.ix-on #manifesto\{margin-top/.test(css), "히어로를 인트로 아래로 끌어올리지 않는다(고정 막 방식)");
});

test("배포 — GitHub Pages 가 Jekyll 을 거치지 않는다(.nojekyll)", () => {
  assert.ok(existsSync(new URL("../.nojekyll", import.meta.url)));
});
