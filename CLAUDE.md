# Portfolio — 작업 규칙 (토큰 절약용 요약)

## 구조
- 정적 페이지: `index.html` · `gallery.html` · `lecture.html` · `career.html` · `legal-ax.html`(법률 AX 공개 시연: `legal-ax-data.js` · `legal-ax-domain.js` · `legal-ax.jsx` → `dist/legal-ax.js` · `legal-ax.css`) · `trial-brief.html`(대표 프로젝트 Gyunggook Trial Brief · 개인 시제품: `trial-brief-data.js` · `trial-brief-domain.js` · `trial-brief.jsx` → `dist/trial-brief.js` · `trial-brief.css` · 문서 `docs/trial-brief.md`)
- React 18 UMD: `sections.jsx` → `npm run build` → `dist/sections.js` (dist 도 커밋)
- CSS: `styles.css`(예산 96KB) + `features.css`(V3 추가분, 예산 24KB). 새 스타일은 features.css 끝에.
- 범용 AX 확장 3종(C) `ax-lab/`(Vite · React · TS · Vitest, 별도 package.json) → `cd ax-lab && npm run build` → `ax/`(커밋 · base ./) + `ax/eval-report.json`(실제 Vitest · 벤치마크 값). index `#ax-c`(AXCExpansion · sections.jsx `AX_C`) 수치는 리포트와 같아야 함(test/ax-c.test.mjs). 라벨 ‘개인 구현 · 공개 시연 (가상 벤치마크 검증)’ · 경국 도입 아님 · 가짜 수치 · 미구현 URL 금지(값 없으면 null → 준비 중)
- 스캔 구조(V8): 카드 첫 화면 = [문제 → 설계] 한 줄(45자 이하 · 테스트) + 실적 배지 + 구분 라벨(실제 수행 · 개인 공개 시연 · 향후 확장). 서술은 접기(details) · cases.html
- 순서: IntroSequence(ALPHA SHEEP 스크롤 인트로 · `intro.css`) → HeroClassic(사진형 첫 화면 · 7bfd9a1e780 기준) → Ledger → CaseIndex(#cases 주요 실무 사례 → cases.html) → About → Composite(6축 역량 지도 HexMap · HEX — dom-NN id 고정, dom-04 는 별칭) → AXCommand(법률 AX 6대 시스템) → ArtifactsSection(도구 4 · 제품 화면) → PolicySection → ResearchArchive → Trajectory. 문장 근거는 `docs/content-matrix.md`
- 건축 모형 `city.js`(Canvas 2D · 장면 reg · build · comp)는 **경국 AX 섹션에서만** — 히어로 · 제품 · 역량 · legal-ax 에 건물 금지. index 는 AX 섹션 근처에서 `city.js` · `legal-ax-data.js` · `legal-ax-domain.js` 를 지연 로드(sections.jsx `AX_ASSETS` — 버전 바꾸면 여기도)
- 경국 AX 섹션 맨 위 `#trial-brief` 대표 프로젝트 카드(TB_CARD — 성과 칸은 테스트로 확인한 것만). 히어로 ‘대표 프로젝트 보기’ → `#trial-brief`
- 인트로(V7.1): 스크롤과 분리된 시간 기반 재생 — sections.jsx IntroSequence 의 rAF 재생기 하나가 .ix__stage 에 --t(초)를 쓰고 intro.css 가 장면 창을 계산(transform · opacity). 시간표 IX_T(end 11.7 · 1.25배속) · 정지 구간 IX_HOLD 는 intro.css 숫자와 같게. 입력은 delta 크기 무관 가속만(정지 구간 · 이름 장면 가속 없음). 막은 position:fixed, 재생 중에만 html.ix-lock · 인트로 밖 inert — 끝 · 바로 본문 · Esc · 끄기 · pagehide · error · 안전 시간에서 해제. head 스크립트: 끄기 · 이번 탭 건너뛰기 · 깊은 링크(#) → ix-off, 6초 안에 재생 안 하면 막 걷기. 움직임 줄이기 · JS 없음 → 정적 구성. 슬로건 출처 표기 유지. 무리의 줄은 가운데 글자 띠를 비우고(y 300 · 344 · 566 · 610), 벗어나는 선은 넓은(--w) · 좁은(--n) 경로가 따로 — 문장을 가로지르게 두지 않기. 검증 기록 `work/quality/2026-11-16-intro-v71/`
- 사례집 `cases.html`: 단일 원천 `cases-data.js`(8편) → `cases-render.js`(문자열 렌더 · 계산) → `scripts/build-cases.mjs`(npm run build 가 프리렌더) · `cases.js`(시연 상호작용만, 상태는 메모리). 범주는 실제 수행(actual) · 공개 시연(demo) · 향후 확장(future)만 — 섞지 않기. 결과는 측정 · 시뮬레이션 · 정성으로만. index `CASE_INDEX`(sections.jsx)는 cases-data 와 같은 id · 이름 · 범주(test/cases.test.mjs)
- 국문 대표 명칭: 법령·규제 변화 관제 시스템(RE:INTELLIGENCE) · 정비사업 총회결의 위험 검토 시스템(Assembly Risk Engine) · 공사도급계약 변경 위험 분석 시스템(Contract Risk Intelligence) · 내비 ‘실무 사례’ · ‘법률 AI 전환’. 영어는 작은 보조 표기
- 인트로 제어(V7): 선호 = localStorage `yk.intro`(다음 방문 재생 여부) · 재생 = html.ix-off 유무 · 이번 탭 건너뛰기 = sessionStorage `yk.intro.s`. `window.ykIntro.setPref/replay/skipSession`(sections.jsx) — 선호를 켜도 스크롤하지 않음, 맨 위 이동은 replay 뿐. 스위치는 인트로 안 · 상단 메뉴(.hnav__ix) · 모바일 메뉴(.mnav__ix) 세 곳, 같은 상태(ix:change). SKIP 은 선호를 바꾸지 않음
- 게재 · 취재 기록 `records-data.js`(단일 원천 · kind = official/citizen/press/field) → `scripts/build-records.mjs`(npm run build) → gallery `#seoripul-reporter`. 새 지면은 배열에 한 건 + build. 서리풀기자단(제5기, 2026. 9–)은 서울시민기자단과 별개 · 공동 기명 · 단독 집필로 쓰지 않기 · 모르는 호수/날짜는 null
- 1페이지 이력 `resume.html`(+`resume.css`, 인쇄 = A4 1쪽 → `resume.pdf`). 상단 메뉴 · 인트로 · 모바일 메뉴에서 연결. 의견 · 협업은 mailto(제목 자동) — 보냈다고 표시하지 않음. 폼 · 저장 백엔드 없음. 전화번호 · 생년 비공개. 사실 근거는 본인 이력서/경력기술서(2026. 11)와 content-matrix
- 영문 회사명은 Gyunggook(다른 표기 금지). 회사명을 쓴다고 회사 승인 · 도입이 아님 — ‘개인 구현 · 경국 도입 아님’ 병기
- AX 6종 = A 경국 실무 01–03(사내 구축 · 비공개) + B 개인 공개 시연 04–06(legal-ax 와 같은 데이터 · 같은 탭 저장소). B 를 경국 도입으로 쓰지 않기. 16개 결과물 수와 따로 셈
- JS: `mnav.js`(모바일 메뉴) · `kb.js`(챗봇 지식) · `chatbot.js` · Vercel 함수 `api/chat.js` · `api/lead.js`
- 배포: main push → GitHub Pages(canonical https://yubinxe.github.io/Portfolio/) + Vercel `portfolio` 자동. `vercel.json` 의 buildCommand ""·outputDirectory "." 유지.

## 명령
- `npm run build` — JSX 변경 후
- `npm run seed:build` — kb.js 변경 후 필수
- `npm run build:images` — 사진 추가 시(AVIF/WebP → images/opt/, sections.jsx `OPT` 맵)
- `npm run build:resume-pdf` — resume.html · resume.css 를 고친 뒤 필수(로컬은 NODE_PATH=gamgak/node_modules CHROME_PATH=설치된 chrome.exe)(A4 1쪽 resume.pdf · 지문 docs/resume-pdf.json, 테스트가 대조)
- `npm test` — 119건 모두 통과해야 커밋(ax-lab 은 `cd ax-lab && npm test` 36건 별도)

## 캐시 버전 (파일 바꾸면 4페이지 모두 올리기)
`styles.css?v=42` · `features.css?v=27` · `dist/sections.js?v=61` · `dist/app.js?v=11` · `chatbot.js?v=17` · `mnav.js?v=9` · `cine.js?v=3` · `cine.css?v=4` · `city.js?v=3`(지연 로드 · AX_ASSETS) · `city.css?v=6`(index 전용) · `intro.css?v=4`(index 전용) · `kb.js?v=20261120b` · resume: `resume.css?v=2` · cases: `cases.css?v=1` · `cases-data.js?v=1` · `cases-render.js?v=1` · `cases.js?v=1` · legal-ax: `legal-ax.css?v=2` · `dist/legal-ax.js?v=2` · `legal-ax-data.js?v=1` · `legal-ax-domain.js?v=1` · trial-brief: `trial-brief.css?v=1` · `dist/trial-brief.js?v=1` · `trial-brief-data.js?v=1` · `trial-brief-domain.js?v=1`

## 규칙
- 요청 = 바로 병합·배포. PR 만들고 대기 금지. 답변 짧게.
- API 키 커밋 금지. kb.js 는 사이트 본문에 있는 사실만.
- 실적·직함·수치 지어내지 않기. 강의는 "제안 커리큘럼"(출강 이력 없음).
- 강의 문의 = 개인 메일 yubin120866@gmail.com (회사 메일 아님).
- 작은 골드 글자는 `var(--gold-text)`(#735C30) 사용 — `--gold` 는 밝은 배경에서 WCAG AA 미달.
- `.story__line`·`.comp-row`(미활성) 흐림은 스크롤 연출 의도. 대비 경고 무시.
- GitHub Pages 는 `.nojekyll` 로 Jekyll 을 건너뛴다(2026-11-10 Jekyll 빌드 실패로 인트로가 canonical 에 안 올라갔던 일) — 지우지 말 것.
- Berlin 2022(OSZ TIEM 교육 · Vattenfall Wärme Berlin AG 인턴십): Vattenfall 추천서는 회사 내부 등급 문서 — 원문 · 사본 · 변형본을 저장소에 넣지 않는다(test/germany.test.mjs 가 검사). 사진은 참가자 얼굴 비식별, OSZ 증명서는 교장 서명 가림. 학위 · 자격 · 정규직으로 쓰지 않기
- 증빙 PDF `assets/evidence/`(gallery #evidence-pdf): 공개본은 생년월일만 가림(성명 · 직인 · 발급번호 원본). 주민등록번호 · 주소가 있는 재직증명서 · 건강보험 확인서는 저장소에 넣지 않는다 — 제출용 원본은 로컬 `Documents/# 김유빈/증빙/` 에만. test/evidence.test.mjs 가 생년월일 · 주민번호 형식을 검사
