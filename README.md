# 김유빈 포트폴리오 — 인수인계 문서

정적 사이트(GitHub Pages) + **유빈 AI** 컨시어지(지식카드 · 딥링크 · 무료상담 리드) + 선택형 서버리스 백엔드(Vercel).

## 구조

| 파일 | 역할 |
|---|---|
| `index.html` + `sections.jsx` | 메인. React(Babel standalone). 궤적 `TRAJECTORY`, 작업 `EDITIONS`, 자격 `CREDS` 데이터가 여기 있음 |
| `career.html` | 경력 상세. 모든 행·섹션에 `id` 앵커 (`#cv-ssafy`, `#experience` …) |
| `gallery.html` | 활동 갤러리 + **`#credentials` 자격·교육·상훈 섹션**(상장 원본 · SSAFY 기업탐방 · 멘토 특강) |
| `kb.js` | **지식 원장(단일 진실 원천)** — 지식카드 · 서비스 카탈로그 3안 · 무료상담 스크립트 · 추천 칩. 브라우저(`window.YUBIN_KB`)와 Node(`require`) 공용 |
| `chatbot.js` | 위젯. `/api/chat` 스트리밍 → 브라우저 키 직접 호출 → 내장 지식 폴백. 딥링크 엔진 · 상담 폼 · mailto 폴백 |
| `api/chat.js` | OpenAI 스트리밍 프록시(키는 서버에만). 지식은 `kb.js`에서 직렬화 |
| `api/lead.js` | 리드 접수. **알림 실패가 저장을 막지 않는다**(5초 타임아웃) |
| `admin.html` | 리드 인박스(상태 변경 · CSV) + 지식카드 검수. PAT 는 브라우저 localStorage 에만 |
| `build-seed.mjs` → `seed/seed.json` → `seed-airtable.js` | Airtable 시드(결정론적 빌드 → upsert) |
| `test/` | `npm test` — 리드 계약 · 카드 무결성 · 딥링크 앵커 존재 검증 |

## 지식카드 스키마 (`kb.js`)

```js
{ id, cat, tags: [], title, body,
  primary:   { label, href },   // 딥링크 "career.html#cv-ssafy" 또는 외부 URL
  secondary: { label, href } | null }
```
- 본문에 없는 사실·수치·URL 은 넣지 않는다. 카드 추가 시 `npm test` 로 앵커 존재 여부가 검증된다.
- 딥링크 규칙: 같은 페이지 → 스크롤 + 스포트라이트, 다른 페이지 → 이동 후 자동 하이라이트(`sessionStorage yk_deeplink`).
- 앵커 목록: index `#manifesto #composite #dom-01~06 #arsenal #credentials #cred-* #trajectory #tl-* #artifacts #ed-01~08 #about #contact` · career `#practice(-ai/-marketing/-data) #composite #experience #cv-* #media #media-yonhap` · gallery `#archive #g-* #credentials #cred-*`.

## 무료상담(리드) 흐름

1. 칩 **무료 상담 신청** 또는 상담 의도 문장 → 3단계 질문(과제 · 상황 · 연락처)
2. 확인 폼(성함/소속 · 연락처 · 내용) → `POST /api/lead`
3. 서버 성공 → 접수 완료 메시지 (`notified:false` 면 "알림 지연" 안내)
4. **서버 실패/정적 호스팅 → 상담 내용이 그대로 채워진 `mailto:` 로 연결** (리드 유실 없음)

## 배포

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
npm test          # node --test test/
node -e "require('./kb.js')" && node --check chatbot.js
```

## 콘텐츠 갱신 체크리스트
- 궤적 항목 추가: `sections.jsx TRAJECTORY`(id 부여) → `career.html cv-row`(id) → `kb.js` 카드/`trajectory` 요약 → `npm test`
- 사진 추가: `images/` 에 넣고 `gallery.html` figure(`g-card`, 문서형은 `g-card--doc`) + `id`
- 자격 추가: `sections.jsx CREDS` + `gallery.html #credentials` 카드 + `kb.js creds`

## 사실 정정 이력 (상장 원본 대조)
- 육군정보통신학교장 상장: **2022. 7. 1**(제183호, 軍 특성화고 현장실습) — 궤적 연도 2023→2022 정정
- 강원열린군대 스타트업 프로그램 2군단장상: **2023. 12. 31**, 2위, 팀 Home_Ally — 궤적 연도 2024→2023 정정
