/* dist/*.js 가 원본 JSX 와 어긋나지 않는지 — 빌드를 잊고 커밋하면 사이트가 옛 코드로 뜹니다. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let builder = null;
try {
  builder = await import("../scripts/build-jsx.mjs");
} catch {
  /* @babel/core 미설치 — npm install 후 다시 실행하세요 */
}

test("dist/*.js 가 원본 JSX 로 다시 컴파일한 결과와 같다 (npm run build 누락 감지)", { skip: builder ? false : "npm install 필요 (@babel/core)" }, async () => {
  for (const src of builder.SOURCES) {
    const built = await compileSafe(builder, src);
    const onDisk = await readFile(path.join(ROOT, "dist", src.replace(/\.jsx$/, ".js")), "utf8");
    assert.equal(onDisk, built, `${src} 가 dist 에 반영되지 않았습니다 — npm run build 를 실행하세요`);
  }
});

async function compileSafe(b, src) { return b.compile(src); }

test("index.html 은 브라우저 Babel 을 쓰지 않는다", async () => {
  const html = await readFile(path.join(ROOT, "index.html"), "utf8");
  assert.ok(!/babel/i.test(html.split("<body")[0] + html), "text/babel · babel standalone 이 남아 있습니다");
  assert.ok(html.includes("react.production.min.js"), "React 는 프로덕션 빌드를 써야 합니다");
  for (const f of ["dist/tweaks-panel.js", "dist/icons.js", "dist/sections.js", "dist/app.js"]) {
    assert.ok(html.includes(f), `${f} 참조 누락`);
  }
});

/* 전송량 예산 — 폰트·JS 를 줄여 놓은 성과가 조용히 되돌아가지 않도록 상한을 둔다.
 * 숫자는 현재값에 여유를 얹은 것이며, 넘으면 "왜 커졌는지" 를 먼저 확인하라는 신호다. */
test("첫 화면 자산이 예산 안에 있다", async () => {
  const { statSync } = await import("node:fs");
  const kb = (p) => statSync(path.join(ROOT, p)).size / 1024;
  const budget = [
    ["dist/sections.js", 272], /* 2026-11 V7: 인트로 선호 · 재생 분리 · 상단 스위치 · 1페이지 이력 +4KB · 2026-11: 주요 실무 사례(CaseIndex) +3KB · 2026-11: ALPHA SHEEP 인트로(IntroSequence) +6KB · 2026-11 V6.1: 경국 AX 6대 시스템(01–03 건축 · 총회 평면 · 04–06 법률 AX 미리보기) +41KB(한글 본문), 히어로 · 네 제품 공간 장면 제거 · 2026-11 V5: 큐브 · AX 4막 · 카드 격자를 공간 장면(AX 지휘실 · 네 제품 · 연구 기록)으로 교체 · 2026-11 V4.1: 첫 장면 포털·큐브 갤러리·폰 극장·현장 기록(사진 FLIP) +18KB · 2026-11: 작업 분류·네 가지 도구 넘김·극장 2개 추가 +9KB · 2026-11 V2: 제품 극장(실제 화면 4층 × 2)·4막 AX·입체 역량 지도·소개 장면·대화상자 접근성 +18KB · 2026-11: AX 조립 장면·사례 무대·가상 시연 +8KB · 2026-11: 경국 AX 현황판 +5KB · 2026-10: 현장 일지(양성과정·공론장) 하이라이트 +5KB · 2026-10: 기록·홍보 채널 섹션(#channels) +5KB ·  2026-10: Edition 13–16 +3KB, 캘린더 이력 5건(집코노미·가치디자인단·KREMA 인턴·명지대·RAG) +1KB, 강의 Track C(부동산·자산관리) 4과정 +2.4KB — 상한 상향 */
    ["dist/tweaks-panel.js", 40],
    ["dist/icons.js", 12],
    ["dist/app.js", 8],
    ["styles.css", 96],   /* 2026-09: 필드워크 체험 스트립(.fw-*) 추가로 +1.4KB — 상한 상향 */
    ["kb.js", 120],
    ["chatbot.js", 86], /* 2026-11 V4.1: 첫 화면 시작 버튼 4개 · 키보드 위 시트 맞춤 · AI 표기 정직하게 +2KB */
    ["features.css", 46],  /* 2026-11 V7: 상단 인트로 스위치 · 1페이지 이력 · 상태 안내 +1.6KB · 2026-11: 주요 실무 사례(#cases) +2.7KB · Berlin 2022 +3.8KB · 2026-11: 장면 연출은 cine.css(index 전용)로 분리 · 2026-11: 경국 AX 현황판 +4.7KB · 2026-10: 현장 일지(양성과정·공론장) +2.6KB · 2026-10: 기록·홍보 채널 카드 +2.8KB ·  2026-10 V3: 강의 퍼널·대토론회 사례·수상 비교·모바일 메뉴 — styles.css 와 분리 */
    ["mnav.js", 7],  /* 2026-11: ‘실무 사례’ 링크 추가 */
    ["cine.js", 8],  /* 2026-11: 스크롤·포인터 장면 연출 엔진 */
    ["city.js", 48], /* 2026-11 V6.1: 경국 AX 전용(01 사업지 · 03 건축물 · 보상 실무) — 히어로 · 네 제품 장면 제거, 지연 로드 · V5: 건축 모형 렌더러(Canvas 2D) */
    ["intro.css", 16], /* 2026-11: ALPHA SHEEP 인트로 — 정적 구성 + 고정 장면(index 전용) */
    ["city.css", 64], /* 2026-11 V6.1: 사진형 히어로 · AX 6대 시스템 내비 · 시연 보드 6종 · 제품 화면 프레임 +27KB, 건축 히어로 · 캔버스 제품 공간 제거 · 2026-11 V5.1: 한국어 중심 섹션 머리 · 이렇게 일합니다 · T/π 역량 구조 · 정책 참여 · 성장 경로 +14KB · V5: 히어로 · AX 지휘실 · 네 가지 도구 · 연구 기록 */
    ["cine.css", 34], /* 2026-11 V5: 포털 · 큐브 · AX 4막 걷어 냄(62 → 24KB) ·  /* 2026-11 V4.1: 포털·큐브·폰 극장·AX 조리개/카메라·현장 기록 +18KB · 2026-11: 작업 분류(A·B·C·D)·네 가지 도구 넘김 +7KB · 다섯 장면(히어로·소개·역량 지도·AX 4막·제품 극장) — index.html 만 불러온다 */
  ];
  const over = budget.filter(([f, max]) => kb(f) > max)
    .map(([f, max]) => `${f} ${kb(f).toFixed(0)}KB > ${max}KB`);
  assert.deepEqual(over, [], "예산 초과\n" + over.join("\n"));
});
