# 김유빈 포트폴리오 — 인수인계 문서

**포지셔닝: 전략기획 × AI.** 데이터로 판단의 근거를 만들고, AI로 실행의 속도를 만듭니다.
정적 사이트(GitHub Pages / Vercel) + **유빈 AI** 컨시어지(지식카드 · 딥링크 · 무료상담 리드) + 선택형 서버리스 백엔드.

## 구조

| 파일 | 역할 |
|---|---|
| `index.html` + `sections.jsx` · `app.jsx` | 메인. React 18(UMD 프로덕션 빌드). **JSX 는 빌드 시점에 컴파일**해 `dist/*.js` 로 커밋합니다 — 브라우저는 Babel 을 내려받지 않습니다. 궤적 `TRAJECTORY`, 작업 `EDITIONS`, 역량 `DOMAINS`, 자격 `CREDS`, **강의 `LECTURE_TRACKS`/`LECTURES`/`LECTURE_BASIS`** 데이터가 여기 있음 |
| `career.html` | 경력 상세 + **`#lectures` 강의 역량**. 모든 행·섹션에 `id` 앵커 (`#cv-ssafy`, `#experience`, `#lec-vibe` …) |
| `lecture.html` | **강의 랜딩(정본 상세)**. 8과정 카드 + 가르치는 근거 + 섭외 CTA. 각 과정 앵커 `#lec-01`~`#lec-08`, Course 구조화 데이터의 `@id` 가 여기를 가리킴 |
| `gallery.html` | 활동 갤러리 + **`#credentials` 자격·교육·상훈 섹션**(상장 원본 · SSAFY 기업탐방 · 멘토 특강) |
| `kb.js` | **지식 원장(단일 진실 원천)** — 지식카드 · 서비스 카탈로그 3안 · 무료상담 스크립트 · 추천 칩. 브라우저(`window.YUBIN_KB`)와 Node(`require`) 공용 |
| `chatbot.js` | 위젯. `/api/chat` 스트리밍 → 브라우저 키 직접 호출 → 내장 지식 폴백. 딥링크 엔진 · 상담 폼 · mailto 폴백 |
| `api/chat.js` | OpenAI 스트리밍 프록시(키는 서버에만). 지식은 `kb.js`에서 직렬화 |
| `api/lead.js` | 리드 접수. **알림 실패가 저장을 막지 않는다**(5초 타임아웃) |
| `admin.html` | 리드 인박스(상태 변경 · CSV) + 지식카드 검수. PAT 는 브라우저 localStorage 에만 |
| `build-seed.mjs` → `seed/seed.json` → `seed-airtable.js` | Airtable 시드(결정론적 빌드 → upsert) |
| `scripts/build-jsx.mjs` → `dist/` | `npm run build`. `*.jsx` 를 컴파일해 `dist/*.js` 생성. **JSX 를 고쳤으면 반드시 실행**(빌드를 잊으면 `npm test` 가 잡아냄) |
| `test/` | `npm test` (29건). `lead.test.mjs` 리드 계약·카드 무결성, `anchors.test.mjs` 딥링크 앵커, `seo.test.mjs` 구조화 데이터·canonical·폰트·CSS 캐시 버전·alt·Vercel 계약, `kb-rank.test.mjs` 챗봇 답변 품질(질문 40개), `links.test.mjs` 내부 링크·`@id` 참조, `dist.test.mjs` 빌드 최신 여부 |

## 지식카드 스키마 (`kb.js`)

```js
{ id, cat, tags: [], title, body,
  primary:   { label, href },   // 딥링크 "career.html#cv-ssafy" 또는 외부 URL
  secondary: { label, href } | null }
```
- 본문에 없는 사실·수치·URL 은 넣지 않는다. 카드 추가 시 `npm test` 로 앵커 존재 여부가 검증된다.

### 답변 랭킹 (`KB.rank(query)`)
챗봇이 어떤 카드로 답할지 고르는 점수식은 **`kb.js` 한 곳에만** 있습니다(`chatbot.js` 는 이를 호출).

| 규칙 | 이유 |
|---|---|
| 태그 점수 = `2 + min(태그 길이, 12)` | `"교육"`(2자)과 `"바이브 코딩"`(6자)이 같은 무게면 구체적인 질문이 일반 카드로 샌다 |
| 질문 의도와 카드 분류가 맞으면 +4 | 강의·자격·경력·연락·미디어·프로젝트·역량 |
| 동점이면 더 긴 태그가 맞은 카드 우선 | 배열 순서로 갈리면 결과가 자의적이다 |

새 카드를 넣었으면 `test/kb-rank.test.mjs` 의 질문 목록에 대표 질문 하나를 추가하세요. 태그만 늘리고 확인하지 않으면 다른 카드를 밀어냅니다.
- 딥링크 규칙: 같은 페이지 → 스크롤 + 스포트라이트, 다른 페이지 → 이동 후 자동 하이라이트(`sessionStorage yk_deeplink`).
- 앵커 목록: index `#manifesto #composite #dom-01~06 #arsenal #credentials #cred-* #trajectory #tl-* #artifacts #ed-01~08 #lectures #lec-01~08 #about #contact` · career `#practice(-strategy/-ai/-marketing/-data) #composite #experience #cv-* #lectures #lec-* #media #media-yonhap` · gallery `#archive #g-* #credentials #cred-*`.

## 무료상담(리드) 흐름

1. 칩 **무료 상담 신청** 또는 상담 의도 문장 → 3단계 질문(과제 · 상황 · 연락처)
2. 확인 폼(성함/소속 · 연락처 · 내용) → `POST /api/lead`
3. 서버 성공 → 접수 완료 메시지 (`notified:false` 면 "알림 지연" 안내)
4. **서버 실패/정적 호스팅 → 상담 내용이 그대로 채워진 `mailto:` 로 연결** (리드 유실 없음)

## 배포

| 대상 | 방식 | 주의 |
|---|---|---|
| GitHub Pages | `main` 푸시 시 자동(`pages build and deployment`) | 저장소 루트를 그대로 서빙 |
| Vercel | `main`·PR 브랜치 자동 | `vercel.json` 의 `buildCommand: ""` · `outputDirectory: "."` 로 **빌드를 건너뛰고** 루트를 서빙. 이 두 줄을 지우면 Vercel 이 `package.json` 의 `build` 를 실행한 뒤 `public/` 을 찾다가 배포 실패한다(테스트가 막아 둠) |

`dist/*.js` 를 커밋하는 이유가 여기 있습니다 — 두 호스팅 모두 빌드 단계 없이 정적 파일만 서빙합니다.
Pages 만 초록이고 Vercel 이 조용히 깨진 적이 있으므로, 배포 관련 변경 뒤에는 **두 곳을 다 확인**하세요.

### GitHub Pages(현재)
그대로 push. 챗봇은 내장 지식으로 동작하고, 상담은 mailto 폴백으로 접수된다.

### Vercel(서버 기능 활성화)
저장소를 Vercel 에 연결하면 `api/*.js` 가 서버리스 함수로 배포된다(`vercel.json`). 환경변수:

| 변수 | 용도 |
|---|---|
| `OPENAI_API_KEY` | `/api/chat` (필수) · `CHAT_MODEL` 기본 `gpt-4o-mini` |
| `AIRTABLE_PAT`, `AIRTABLE_BASE_ID`, `AIRTABLE_LEADS_TABLE`(기본 `Leads`) | 리드 저장 |
| `SLACK_WEBHOOK_URL` 또는 `RESEND_API_KEY` + `LEAD_NOTIFY_TO` | 알림(선택) |
| `CORS_ORIGIN` | 기본 `*`. GitHub Pages 에서 Vercel API 를 부를 때 `https://yubinxe.github.io` |

GitHub Pages 에서 Vercel API 를 쓰려면 각 HTML 의 `chatbot.js` 로드 전에:
```html
<script>window.YUBIN_CHAT_CONFIG = { endpoint: "https://<vercel-app>.vercel.app/api/chat", leadEndpoint: "https://<vercel-app>.vercel.app/api/lead" };</script>
```

## Airtable 시드

```bash
npm run seed:dry                                   # 본문만 확인 (네트워크 없음)
AIRTABLE_PAT=pat… AIRTABLE_BASE_ID=app… npm run seed   # KnowledgeCards · Projects · Services · Scripts upsert(Id 기준)
```
- PAT 스코프: `data.records:read`, `data.records:write`. 403 이면 스코프/베이스 접근 권한 문제(스크립트가 안내 출력).
- `Leads` 테이블 필드: `Name, Contact, Message, Need, Context, Page, UserAgent, Status(New/Contacted/Closed), History, ReceivedAt`.

## 검증

```bash
npm install       # 최초 1회 (빌드·테스트용 devDependencies)
npm run build     # *.jsx → dist/*.js — JSX 를 고쳤다면 필수
npm test          # node --test test/ (dist 최신 여부까지 검증)
node -e "require('./kb.js')" && node --check chatbot.js
```

> `dist/*.js` 는 자동 생성물입니다. 직접 고치지 말고 `*.jsx` 를 고친 뒤 `npm run build` 를 실행하세요.

## 강의 프로그램 (2 트랙 8과정)

`sections.jsx`의 `LECTURES` 가 정본이고, `lecture.html` · `career.html#lectures` · `kb.js` 의 `lec-*` 카드가 같은 내용을 반복합니다. 넷을 함께 고치세요. `lecture.html` 은 `/tmp` 스크립트가 아니라 직접 편집합니다(정적 파일).

| 트랙 | 과정 | 근거 |
|---|---|---|
| A 파운데이션 | 01 AI 기초 개념 · 02 프롬프트 엔지니어링 | 서울대 AIED 4기 |
| A 파운데이션 | 03 바이브 코딩 | SSAFY 13기 |
| A 파운데이션 | 04 하네스 엔지니어링 | GWS · NAVER WORKS API 연동, 크롤링 |
| B 도메인 적용 | 05 전략기획 AI | 법무법인 경국 실무 |
| B 도메인 적용 | 06 공공데이터 · 07 브랜드 필름 | KREMA 4기 |
| B 도메인 적용 | 08 커뮤니케이션 | 서울시민기자단 · 연합뉴스TV |

각 카드의 `basis` 는 실제 이수·수행 기록만 적습니다. 강의 이력(출강 실적)은 아직 사이트에 없으며, 생기면 `career.html#lectures` 에 연도와 함께 추가하세요.

## 콘텐츠 갱신 체크리스트

> 사진을 추가하면 `alt` 에 **이름 맥락**을 넣으세요(`김유빈 활동 기록 — …`). 인물 이미지 검색 노출 경로이며 테스트가 강제합니다. 사진에 누가 찍혀 있는지 단정하는 표현은 쓰지 않습니다.
- 궤적 항목 추가: `sections.jsx TRAJECTORY`(id 부여) → `career.html cv-row`(id) → `kb.js` 카드/`trajectory` 요약 → `npm test`
- 사진 추가: `images/` 에 넣고 `gallery.html` figure(`g-card`, 문서형은 `g-card--doc`) + `id`
- 자격 추가: `sections.jsx CREDS` + `gallery.html #credentials` 카드 + `kb.js creds`
- 강의 추가: `sections.jsx LECTURES`(id `lec-NN`) → `lecture.html` 카드와 JSON-LD → `career.html#lectures` 행 → `kb.js` `lec-NN` 카드 → `npm run build` → `npm test`

## 검색 노출 (SEO)

사이트에서 할 수 있는 기술적 조치는 끝냈습니다. 파일과 역할은 아래와 같습니다.

| 파일 | 역할 |
|---|---|
| `robots.txt` | 전체 허용 + 네이버 `Yeti`·다음 `Daumoa` 명시 허용 + `sitemap.xml` 위치 안내. `admin.html`·레거시 페이지·`uploads/`·`screenshots/` 는 색인 제외 |
| `sitemap.xml` | 공개 4개 페이지(메인·경력·**강의**·갤러리) + 대표 이미지(`image:image`) |
| `index.html` JSON-LD | `ProfilePage` · `WebSite` · **`Person`(정본)** · 강의 `ItemList`(Course 8, `@id` 는 `lecture.html#lec-NN`) |
| `lecture.html` JSON-LD | **`Course` 8건의 정본**(`teaches`·`audience`·`timeRequired`·`hasCourseInstance`) + `WebPage`·`BreadcrumbList`·`ImageObject`(전용 공유 카드) |
| `career.html` / `gallery.html` JSON-LD | `ProfilePage`/`CollectionPage` + `BreadcrumbList`. Person 은 `@id` 로만 참조 |
| `index.html` `<noscript>` | 자바스크립트 없이도 이름·역량·프로젝트·강의·교육과 내부 링크가 읽히는 폴백 |
| `.sr-only` | 라틴 로고타입 `h1` 에 한글 이름 맥락을 더해 스크린리더와 크롤러가 "김유빈"을 읽도록 |
| 이미지 `alt` | 갤러리·경력 사진에 이름 맥락(`김유빈 활동 기록 — …`). 인물 이미지 검색 노출 경로 |
| `images/og-lecture.png` | 강의 페이지 전용 공유 카드(1200×630). 링크 미리보기에서 8과정이 보이도록 |

`Person` 은 **`index.html` 에서만 정의**하고 다른 페이지는 `@id`(`…/#person`)로 참조합니다. 같은 원칙을 `Course` 에도 적용해 **정본은 `lecture.html`**, 메인의 `ItemList` 는 같은 `@id` 를 가리킵니다. 엔티티가 쪼개지지 않도록 하기 위한 것이며 `npm test` 가 이 규칙을 강제합니다(`@id` 참조가 정의 없는 곳을 가리키면 실패).

### 사람이 직접 해야 하는 일 (이게 실제로 순위를 만듭니다)

"김유빈"은 동명이인이 많은 흔한 이름이라, 사이트 내부 조치만으로는 상위 노출이 되지 않습니다. 아래는 코드로 할 수 없는 항목입니다.

1. **Google Search Console 등록** — `https://search.google.com/search-console` 에서 `https://yubinxe.github.io/Portfolio/` 를 URL 접두어로 추가하고, HTML 태그 방식 인증 시 발급된 `<meta name="google-site-verification" ...>` 를 `index.html` 의 `<head>` 에 넣으십시오. 등록 후 `sitemap.xml` 제출과 주요 URL "색인 생성 요청".
2. **네이버 서치어드바이저** — 국내 검색에서는 네이버 비중이 큽니다. `https://searchadvisor.naver.com` 에 동일하게 사이트 등록 및 사이트맵 제출.
3. **외부 신호(백링크)** — 검색엔진이 "이 김유빈"을 식별하려면 같은 이름을 쓰는 다른 프로필이 이 사이트를 가리켜야 합니다. LinkedIn, GitHub 프로필 소개란, 브런치·티스토리, 발표·기고 이력에 포트폴리오 URL을 넣으십시오. 넣은 프로필 URL 은 `kb.js` 가 아니라 `index.html` 의 `Person.sameAs` 배열에 추가해야 구조화 데이터로 연결됩니다.
4. **커스텀 도메인** — `yubinxe.github.io/Portfolio/` 는 하위 경로라 도메인 권위가 잡히지 않습니다. `yubinkim.kr` 같은 개인 도메인을 붙이면 이름 검색에서 유리합니다. 도메인을 바꾸면 `robots.txt`·`sitemap.xml`·모든 `canonical`·JSON-LD 의 절대 URL을 함께 바꿔야 하며, `test/seo.test.mjs` 의 `SITE` 상수도 수정 대상입니다.
5. **연합뉴스TV 인터뷰 원본 링크** — 언론 보도 URL 이 있으면 `Person.subjectOf` 에 `NewsArticle` 로 추가하십시오. 이름 검색에서 가장 강한 신호 중 하나입니다.

### 확인 방법

- 구조화 데이터: https://search.google.com/test/rich-results 에 URL 입력
- 색인 여부: 구글에 `site:yubinxe.github.io/Portfolio` 검색
- 반영까지는 보통 며칠에서 2주가 걸립니다. 색인 생성 요청으로 앞당길 수 있습니다.

## 사실 정정 이력 (상장 원본 대조)
- 육군정보통신학교장 상장: **2022. 7. 1**(제183호, 軍 특성화고 현장실습) — 궤적 연도 2023→2022 정정
- 강원열린군대 스타트업 프로그램 2군단장상: **2023. 12. 31**, 2위, 팀 Home_Ally — 궤적 연도 2024→2023 정정
