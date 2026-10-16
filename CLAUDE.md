# Portfolio — 작업 규칙 (토큰 절약용 요약)

## 세션 시작 시 (PC·클라우드·아이폰 공통)
1. `docs/WORKLOG.md` 를 먼저 읽고 "진행 중"·"다음 행동"부터 이어간다.
2. `git fetch` 후 열린 PR(`gh pr list`)과 원격 브랜치를 확인해 중복 작업을 피한다.
3. 작업이 끝나면 WORKLOG 의 완료·진행 중·다음 행동을 갱신해 같은 PR 에 커밋한다(컨텍스트가 압축·초기화돼도 상태가 Git 에 남도록).

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
- `npm test` — 57건 모두 통과해야 커밋

## 캐시 버전 (파일 바꾸면 4페이지 모두 올리기)
`styles.css?v=41` · `features.css?v=6` · `dist/sections.js?v=14` · `chatbot.js?v=7` · `mnav.js?v=2` · `kb.js?v=20261016b`

## 규칙
- 변경은 항상 브랜치 → PR. main 병합 = 운영 배포(Pages·Vercel)이므로 사용자 승인("배포해"/"병합해"/"반영해" 등) 후에만. 승인된 요청은 PR 생성 직후 squash 병합하고 라이브 반영까지 확인. 답변 짧게.
- API 키 커밋 금지. kb.js 는 사이트 본문에 있는 사실만.
- 실적·직함·수치 지어내지 않기. 강의는 "제안 커리큘럼"(출강 이력 없음).
- 강의 문의 = 개인 메일 yubin120866@gmail.com (회사 메일 아님).
- 작은 골드 글자는 `var(--gold-text)`(#735C30) 사용 — `--gold` 는 밝은 배경에서 WCAG AA 미달.
- `.story__line`·`.comp-row`(미활성) 흐림은 스크롤 연출 의도. 대비 경고 무시.

## 관련 저장소
- `yubinxe/yubinxe.github.io` — 루트 도메인(https://yubinxe.github.io). 포트폴리오로 이동 + 검색엔진 소유 확인 파일(구글·네이버). 이 저장소와 별개라 파일은 그쪽에 커밋.
- 작업물 카드가 가리키는 서비스 저장소: `appraiser-fieldwork`(필드워크), `zipcatch`·`ch_insight`(집캐치), `Gukjeong`(국정 한눈에), `salvation`, `lawfirm-dashboard`(비공개). 카드 문구는 각 서비스의 실제 기능과 맞출 것.

