# Portfolio — 작업 규칙 (토큰 절약용 요약)

## 구조
- 정적 페이지: `index.html` · `gallery.html` · `lecture.html` · `career.html`
- React 18 UMD: `sections.jsx` → `npm run build` → `dist/sections.js` (dist 도 커밋)
- CSS: `styles.css`(예산 96KB) + `features.css`(V3 추가분, 예산 24KB). 새 스타일은 features.css 끝에.
- JS: `mnav.js`(모바일 메뉴) · `kb.js`(챗봇 지식) · `chatbot.js` · Vercel 함수 `api/chat.js` · `api/lead.js`
- 배포: main push → GitHub Pages(canonical https://yubinxe.github.io/Portfolio/) + Vercel `portfolio` 자동. `vercel.json` 의 buildCommand ""·outputDirectory "." 유지.

## 명령
- `npm run build` — JSX 변경 후
- `npm run seed:build` — kb.js 변경 후 필수
- `npm run build:images` — 사진 추가 시(AVIF/WebP → images/opt/, sections.jsx `OPT` 맵)
- `npm test` — 52건 모두 통과해야 커밋

## 캐시 버전 (파일 바꾸면 4페이지 모두 올리기)
`styles.css?v=41` · `features.css?v=3` · `dist/sections.js?v=9` · `chatbot.js?v=7` · `mnav.js?v=2` · `kb.js?v=20261008`

## 규칙
- 요청 = 바로 병합·배포. PR 만들고 대기 금지. 답변 짧게.
- API 키 커밋 금지. kb.js 는 사이트 본문에 있는 사실만.
- 실적·직함·수치 지어내지 않기. 강의는 "제안 커리큘럼"(출강 이력 없음).
- 강의 문의 = 개인 메일 yubin120866@gmail.com (회사 메일 아님).
- 작은 골드 글자는 `var(--gold-text)`(#735C30) 사용 — `--gold` 는 밝은 배경에서 WCAG AA 미달.
- `.story__line`·`.comp-row`(미활성) 흐림은 스크롤 연출 의도. 대비 경고 무시.
