# Portfolio — 작업 규칙 (토큰 절약용 요약)

## 구조
- 정적 페이지: `index.html` · `gallery.html` · `lecture.html` · `career.html` · `legal-ax.html`(법률 AX 공개 시연: `legal-ax-data.js` · `legal-ax-domain.js` · `legal-ax.jsx` → `dist/legal-ax.js` · `legal-ax.css`)
- React 18 UMD: `sections.jsx` → `npm run build` → `dist/sections.js` (dist 도 커밋)
- CSS: `styles.css`(예산 96KB) + `features.css`(V3 추가분, 예산 24KB). 새 스타일은 features.css 끝에.
- 순서: HeroClassic(사진형 첫 화면 · 7bfd9a1e780 기준) → Ledger → About → Composite(T/π) → AXCommand(법률 AX 6대 시스템) → ArtifactsSection(도구 4 · 제품 화면) → PolicySection → ResearchArchive → Trajectory. 문장 근거는 `docs/content-matrix.md`
- 건축 모형 `city.js`(Canvas 2D · 장면 reg · build · comp)는 **경국 AX 섹션에서만** — 히어로 · 제품 · 역량 · legal-ax 에 건물 금지. index 는 AX 섹션 근처에서 `city.js` · `legal-ax-data.js` · `legal-ax-domain.js` 를 지연 로드(sections.jsx `AX_ASSETS` — 버전 바꾸면 여기도)
- AX 6종 = A 경국 실무 01–03(사내 구축 · 비공개) + B 개인 공개 시연 04–06(legal-ax 와 같은 데이터 · 같은 탭 저장소). B 를 경국 도입으로 쓰지 않기. 16개 결과물 수와 따로 셈
- JS: `mnav.js`(모바일 메뉴) · `kb.js`(챗봇 지식) · `chatbot.js` · Vercel 함수 `api/chat.js` · `api/lead.js`
- 배포: main push → GitHub Pages(canonical https://yubinxe.github.io/Portfolio/) + Vercel `portfolio` 자동. `vercel.json` 의 buildCommand ""·outputDirectory "." 유지.

## 명령
- `npm run build` — JSX 변경 후
- `npm run seed:build` — kb.js 변경 후 필수
- `npm run build:images` — 사진 추가 시(AVIF/WebP → images/opt/, sections.jsx `OPT` 맵)
- `npm test` — 71건 모두 통과해야 커밋

## 캐시 버전 (파일 바꾸면 4페이지 모두 올리기)
`styles.css?v=42` · `features.css?v=17` · `dist/sections.js?v=46` · `dist/app.js?v=9` · `chatbot.js?v=17` · `mnav.js?v=7` · `cine.js?v=3` · `cine.css?v=4` · `city.js?v=3`(지연 로드 · AX_ASSETS) · `city.css?v=4`(index 전용) · `kb.js?v=20261108b` · legal-ax: `legal-ax.css?v=2` · `dist/legal-ax.js?v=2` · `legal-ax-data.js?v=1` · `legal-ax-domain.js?v=1`

## 규칙
- 요청 = 바로 병합·배포. PR 만들고 대기 금지. 답변 짧게.
- API 키 커밋 금지. kb.js 는 사이트 본문에 있는 사실만.
- 실적·직함·수치 지어내지 않기. 강의는 "제안 커리큘럼"(출강 이력 없음).
- 강의 문의 = 개인 메일 yubin120866@gmail.com (회사 메일 아님).
- 작은 골드 글자는 `var(--gold-text)`(#735C30) 사용 — `--gold` 는 밝은 배경에서 WCAG AA 미달.
- `.story__line`·`.comp-row`(미활성) 흐림은 스크롤 연출 의도. 대비 경고 무시.
