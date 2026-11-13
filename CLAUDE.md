# Portfolio — 작업 규칙 (토큰 절약용 요약)

## 구조
- 정적 페이지: `index.html` · `gallery.html` · `lecture.html` · `career.html` · `legal-ax.html`(법률 AX 공개 시연: `legal-ax-data.js` · `legal-ax-domain.js` · `legal-ax.jsx` → `dist/legal-ax.js` · `legal-ax.css`) · `trial-brief.html`(대표 프로젝트 Gyunggook Trial Brief · 개인 시제품: `trial-brief-data.js` · `trial-brief-domain.js` · `trial-brief.jsx` → `dist/trial-brief.js` · `trial-brief.css` · 문서 `docs/trial-brief.md`)
- React 18 UMD: `sections.jsx` → `npm run build` → `dist/sections.js` (dist 도 커밋)
- CSS: `styles.css`(예산 96KB) + `features.css`(V3 추가분, 예산 24KB). 새 스타일은 features.css 끝에.
- 순서: IntroSequence(ALPHA SHEEP 스크롤 인트로 · `intro.css`) → HeroClassic(사진형 첫 화면 · 7bfd9a1e780 기준) → Ledger → CaseIndex(#cases 주요 실무 사례 → cases.html) → About → Composite(T/π) → AXCommand(법률 AX 6대 시스템) → ArtifactsSection(도구 4 · 제품 화면) → PolicySection → ResearchArchive → Trajectory. 문장 근거는 `docs/content-matrix.md`
- 건축 모형 `city.js`(Canvas 2D · 장면 reg · build · comp)는 **경국 AX 섹션에서만** — 히어로 · 제품 · 역량 · legal-ax 에 건물 금지. index 는 AX 섹션 근처에서 `city.js` · `legal-ax-data.js` · `legal-ax-domain.js` 를 지연 로드(sections.jsx `AX_ASSETS` — 버전 바꾸면 여기도)
- 경국 AX 섹션 맨 위 `#trial-brief` 대표 프로젝트 카드(TB_CARD — 성과 칸은 테스트로 확인한 것만). 히어로 ‘대표 프로젝트 보기’ → `#trial-brief`
- 인트로: cine.js pin 진행도(--cp) + intro.css(transform · opacity만). 켜짐은 index.html <head> 스크립트가 첫 그리기 전에 결정(html.ix-on · ix-off · ix-active). 움직임 줄이기 · JS 없음 → 정적 구성. SKIP INTRO = #manifesto 링크, ‘인트로’ 스위치 = localStorage `yk.intro`(쿠키 없음), 히어로의 ‘인트로 다시 보기’로 복구. 히어로는 ix-on 일 때 margin-top:-100vh(인트로 마지막 화면과 겹쳐 매치 컷). 슬로건 출처 표기(《트렌드 코리아 2027》 · 개인적 재해석 · 제휴 없음) 유지. ix-active 는 관찰자 하나(.ix__mark = 고정 구간 앞 90%, rootMargin 맨 윗줄)로 판정. 무리의 줄은 가운데 글자 띠를 비우고(y 300 · 344 · 566 · 610), 벗어나는 선은 넓은 화면(--w) · 좁은 화면(--n) 경로가 따로다 — 문장을 가로지르게 두지 않기. 글자 상자 높이 --sh(svh). 검증 기록 `work/quality/2026-11-10-alpha-sheep-refine/`
- 사례집 `cases.html`: 단일 원천 `cases-data.js`(8편) → `cases-render.js`(문자열 렌더 · 계산) → `scripts/build-cases.mjs`(npm run build 가 프리렌더) · `cases.js`(시연 상호작용만, 상태는 메모리). 범주는 실제 수행(actual) · 공개 시연(demo) · 향후 확장(future)만 — 섞지 않기. 결과는 측정 · 시뮬레이션 · 정성으로만. index `CASE_INDEX`(sections.jsx)는 cases-data 와 같은 id · 이름 · 범주(test/cases.test.mjs)
- 국문 대표 명칭: 법령·규제 변화 관제 시스템(RE:INTELLIGENCE) · 정비사업 총회결의 위험 검토 시스템(Assembly Risk Engine) · 공사도급계약 변경 위험 분석 시스템(Contract Risk Intelligence) · 내비 ‘실무 사례’ · ‘법률 AI 전환’. 영어는 작은 보조 표기
- 영문 회사명은 Gyunggook(다른 표기 금지). 회사명을 쓴다고 회사 승인 · 도입이 아님 — ‘개인 구현 · 경국 도입 아님’ 병기
- AX 6종 = A 경국 실무 01–03(사내 구축 · 비공개) + B 개인 공개 시연 04–06(legal-ax 와 같은 데이터 · 같은 탭 저장소). B 를 경국 도입으로 쓰지 않기. 16개 결과물 수와 따로 셈
- JS: `mnav.js`(모바일 메뉴) · `kb.js`(챗봇 지식) · `chatbot.js` · Vercel 함수 `api/chat.js` · `api/lead.js`
- 배포: main push → GitHub Pages(canonical https://yubinxe.github.io/Portfolio/) + Vercel `portfolio` 자동. `vercel.json` 의 buildCommand ""·outputDirectory "." 유지.

## 명령
- `npm run build` — JSX 변경 후
- `npm run seed:build` — kb.js 변경 후 필수
- `npm run build:images` — 사진 추가 시(AVIF/WebP → images/opt/, sections.jsx `OPT` 맵)
- `npm test` — 100건 모두 통과해야 커밋

## 캐시 버전 (파일 바꾸면 4페이지 모두 올리기)
`styles.css?v=42` · `features.css?v=20` · `dist/sections.js?v=52` · `dist/app.js?v=11` · `chatbot.js?v=17` · `mnav.js?v=8` · `cine.js?v=3` · `cine.css?v=4` · `city.js?v=3`(지연 로드 · AX_ASSETS) · `city.css?v=5`(index 전용) · `intro.css?v=2`(index 전용) · `kb.js?v=20261113a` · cases: `cases.css?v=1` · `cases-data.js?v=1` · `cases-render.js?v=1` · `cases.js?v=1` · legal-ax: `legal-ax.css?v=2` · `dist/legal-ax.js?v=2` · `legal-ax-data.js?v=1` · `legal-ax-domain.js?v=1` · trial-brief: `trial-brief.css?v=1` · `dist/trial-brief.js?v=1` · `trial-brief-data.js?v=1` · `trial-brief-domain.js?v=1`

## 규칙
- 요청 = 바로 병합·배포. PR 만들고 대기 금지. 답변 짧게.
- API 키 커밋 금지. kb.js 는 사이트 본문에 있는 사실만.
- 실적·직함·수치 지어내지 않기. 강의는 "제안 커리큘럼"(출강 이력 없음).
- 강의 문의 = 개인 메일 yubin120866@gmail.com (회사 메일 아님).
- 작은 골드 글자는 `var(--gold-text)`(#735C30) 사용 — `--gold` 는 밝은 배경에서 WCAG AA 미달.
- `.story__line`·`.comp-row`(미활성) 흐림은 스크롤 연출 의도. 대비 경고 무시.
- GitHub Pages 는 `.nojekyll` 로 Jekyll 을 건너뛴다(2026-11-10 Jekyll 빌드 실패로 인트로가 canonical 에 안 올라갔던 일) — 지우지 말 것.
- Berlin 2022(OSZ TIEM 교육 · Vattenfall Wärme Berlin AG 인턴십): Vattenfall 추천서는 회사 내부 등급 문서 — 원문 · 사본 · 변형본을 저장소에 넣지 않는다(test/germany.test.mjs 가 검사). 사진은 참가자 얼굴 비식별, OSZ 증명서는 교장 서명 가림. 학위 · 자격 · 정규직으로 쓰지 않기
