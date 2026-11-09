# Gyunggook Trial Brief — 제품 · 설계 · 검증 문서

> 기일 전 1페이지 사건 브리핑 시스템 · **개인 구현 시제품**
> 법무법인 경국(Gyunggook)이 승인 · 도입한 서비스가 아닙니다. 모든 사건 · 인물 · 문서는 가상이며, 실제 사건자료 · 의뢰인 정보 · 사내 문서를 사용하지 않았습니다.
> 데모: `trial-brief.html` · 코드: `trial-brief-data.js` · `trial-brief-domain.js` · `trial-brief.jsx` · `trial-brief.css` · 테스트: `test/trial-brief.test.mjs`

## 1. 문제와 목표

| 구분 | 내용 |
|---|---|
| 설계 질문 | 변호사가 재판에 들어가기 직전 60초 동안 확인해야 할 정보는 무엇인가? (60초는 **설계 목표**이며 측정한 결과가 아님) |
| 문제 | 기일 전 소장 · 답변서 · 준비서면 · 변론조서 · 증거를 다시 펼쳐 쟁점 · 증거 · 석명사항 · 기한을 확인해야 한다. 서면마다 날짜 · 금액 · 당사자 표기가 어긋나거나, 인용한 증거가 목록에 없는 경우를 사람이 찾아야 한다. |
| 목표 | ① 기일 전 정보를 A4 1장에 우선순위대로 ② 문서 간 불일치 · 누락을 규칙으로 먼저 표시 ③ 출처 없는 내용은 확정하지 않음 ④ 승인 뒤 자료가 바뀌면 재검토 |
| 범위 밖 | 판결 예측 · 법률 결론 확정 · 외부 AI 호출 · 외부 제출 · 실제 사건자료 처리 |

## 2. 사용 흐름

사건 선택 → 자료 확인(문서 등록) → 불일치 탐지(정합성 검수) → 담당자 검토(확인 처리 · 쟁점 확정 · 증거 연결) → 1페이지 브리핑 → PDF 출력

화면은 둘입니다.

- **A. 사건 준비 작업화면** — 1 문서 등록 · 2 정보 추출 · 구조화 · 3 정합성 검수 · 4 쟁점 · 증거 연결 · 5 기일 준비 · 6 검토 · 승인
- **B. 1페이지 브리핑** — A4 인쇄 설계(`@page A4`), 인쇄하면 화면 장식 없이 종이만 출력, 화면에서는 출처 칩을 눌러 원문 문단으로 이동

## 3. A4 한 장의 정보 위계

| 칸 | 내용 | 비고 |
|---|---|---|
| ① 기본정보 | 기일 · 시간 · 법정(맨 앞, 가장 큰 글자) · 사건번호 · 사건명 · 유형 · 법원 · 재판부 · 담당 변호사 · 당사자 | 기일 정보는 담당자 확정 표시 |
| ② 사건 요약 | 청구취지 요지 · 개요 · 주요 사실(출처 · 상태 표시) · 절차 단계 | 출처 없는 사실은 ‘확인 필요’ |
| ③ 핵심 쟁점 | 3개 이내 · 양측 주장 요지 · 근거 증거 · 확인되지 않은 사실 | 근거 없는 주장은 ‘근거 미연결’ |
| ④ 증거 · 입증 | 증거번호 · 표목 · 입증취지 · 제출 상태(제출 · 미제출 · 누락) | 누락은 서면 인용으로부터 자동 추가 |
| ⑤ 최근 경과 | 직전 기일 · 최근 서면 · 재판부 명령 · 석명 · 제출기한 | |
| ⑥ 기일 전 확인사항 | 남은 할 일 · 담당 · 기한 · D-day(경과 · 임박 강조) | |
| ⑦ 위험 · 유의 | 미확인 검수 항목(중요 우선, 최대 6건 + ‘외 n건’) | 한 장을 넘기지 않게 상세는 작업화면으로 |
| ⑧ 검토 · 승인 | 최종 갱신 · 상태 · 검토자 · 출처 문서 목록 · 표시 범례 | |

표시 상태 세 가지 — `● 담당자 확정` · `◇ 자동 추출 · 미확정` · `▲ 확인 필요`. 브리핑 상태 — 작성 중 · 검토 요청 · 변호사 승인 · **재검토 필요(승인 후 자료 변경)**.

사건 유형별 템플릿(`TB_DATA.templates`) — 공통 구조는 같고 용어 · 칸만 다르게: **민사(구현)** · 행정 · 가사 · 형사(설계만, 미구현).

## 4. 데이터 구조

시제품은 정적 사이트(React 18 UMD · 빌드 없는 정적 배포)라 데이터는 `trial-brief-data.js` 의 객체입니다. 운영 환경에서는 아래처럼 정규화합니다.

| 개체 | 시제품 위치 | 핵심 필드 |
|---|---|---|
| Case | `cases[]` | id · no(가상) · title · type · court · division · lawyer · claim · stage · template |
| Hearing | `case.hearing` | date · time · room · kind |
| Party | `case.parties[]` | side(원고 · 피고) · name · role |
| Document | `case.documents[]` | id · kind · title · date · by · pages[{no, paras[]}] · pending |
| Evidence | `case.evidence[]` | no(갑1 …) · label · title · purpose · status(submitted · unsubmitted) · src(문서) |
| Issue | `case.issues[]` | id · title · plaintiff{text, evidence[]} · defendant{…} · unknown[] |
| ActionItem | `case.actions[]` + 상태 | id · text · due · owner · kind · done |
| ReviewStatus | 상태 `confirm` · `resolved` · `approval` · `requested` | 항목 확정 · 검수 확인(메모 필수) · 승인(시각 · 승인자) |
| AuditLog | 상태 `audit[]` | t · role · case · text |

운영용 스키마 초안(PostgreSQL) — 사건 · 기일 · 문서 · 증거 사이의 관계와 원문 근거 연결을 유지합니다.

```sql
create table cases (id uuid primary key, case_no text not null, title text, case_type text, court text, division text, template text default 'civil');
create table hearings (id uuid primary key, case_id uuid references cases, starts_at timestamptz, room text, kind text);
create table parties (id uuid primary key, case_id uuid references cases, side text check (side in ('원고','피고')), name text, role text);
create table documents (id uuid primary key, case_id uuid references cases, kind text, title text, doc_date date, submitted_by text, version int default 1, registered_at timestamptz);
create table doc_paragraphs (document_id uuid references documents, page int, para int, body text, primary key (document_id, page, para));
create table evidence (id uuid primary key, case_id uuid references cases, ev_no text, title text, purpose text, status text, source_document uuid references documents);
create table issues (id uuid primary key, case_id uuid references cases, title text, ord int);
create table issue_claims (issue_id uuid references issues, side text, summary text, primary key (issue_id, side));
create table claim_evidence (issue_id uuid, side text, evidence_id uuid references evidence, primary key (issue_id, side, evidence_id));
create table extracted_facts (id uuid primary key, document_id uuid, page int, para int, kind text, label text, value text, fragment text);
create table action_items (id uuid primary key, case_id uuid references cases, body text, due date, owner text, kind text, done boolean default false);
create table reviews (case_id uuid references cases, item_key text, state text, note text, actor uuid, at timestamptz, primary key (case_id, item_key));
create table approvals (case_id uuid references cases, approved_by uuid, approved_at timestamptz, revoked_at timestamptz);
create table audit_log (id bigserial primary key, case_id uuid, actor uuid, role text, action text, detail text, at timestamptz default now());
```

## 5. 정합성 검수 규칙 (Gyunggook Legal Document QA)

Trial Brief 와 문서 검수는 **같은 엔진**(`trial-brief-domain.js`)을 씁니다 — 별도 제품으로 중복 개발하지 않았습니다.

| 규칙 | 찾는 것 | 중요도 | 어떻게 |
|---|---|---|---|
| R1 날짜 불일치 | 같은 이름표(누수 발견일 · 계약일 · 인도일 …)의 날짜가 문서마다 다름 | 중요 | 정규식 추출 후 값 비교, 가장 최근 서면 값을 ‘최신 서면 기준(확정 아님)’으로 표시 |
| R2 금액 불일치 | 같은 이름표(청구금액 · 수리비 · 계약금 · 원상복구비 …)의 금액이 다름 | 중요 | 〃 |
| R3 당사자 표시 불일치 | 서면 머리의 ‘원고: · 피고:’ 표시가 당사자 목록과 다름 | 중요 | 문자열 대조 |
| R4 증거 누락 | 서면에서 인용한 증거번호가 증거 목록에 없음 | 중요 | ‘갑 제N호증’ 추출 후 목록 대조 |
| R5 증거 미제출 | 인용했으나 목록상 미제출 | 보통 | 〃 |
| R6 근거 미연결 | 쟁점의 주장에 연결된 증거가 없음 | 보통 | 연결 상태 확인 |
| R7 기한 경과 · 임박 | 기일 전 할 일의 기한이 지났거나 2일 이내 | 중요 · 보통 | 기준 시각 대비 일수 |
| R8 승인 후 변경 | 승인 뒤 새 서면이 등록됨 | 중요 | 등록 시각 > 승인 시각 → 브리핑 상태 ‘재검토 필요’ |

원칙 — ‘불일치’는 어느 쪽이 옳은지 정하지 않는다(주장 차이인지 기재 오류인지는 담당자가 판단). 확인 처리는 **메모 4자 이상**이 있어야 한다. 원문에 없는 값은 만들지 않는다(모든 추출값의 원문 조각이 실제 문단에 있는지 테스트).

## 6. 권한 · 보안

| 역할 | 할 수 있는 일 |
|---|---|
| 사무직원(작성) | 문서 등록 · 항목 확정 · 검수 확인 처리 · 증거 연결 · 할 일 관리 · 검토 요청 |
| 담당 변호사(검토 · 승인) | 위 전부 + 승인 · 승인 취소 |
| 열람자 | 읽기만 |

- 권한은 화면 버튼과 상태 변경 함수(`reduce`) 양쪽에서 같은 규칙(`can`)으로 막습니다. 공개 시제품은 로그인이 없으므로 역할 선택은 **시연용**이며, 운영 환경에서는 사내 인증(SSO)과 서버 측 권한 검사가 필요합니다.
- 외부 전송 없음 — `fetch` · `XMLHttpRequest` · `sendBeacon` · 메일 연결 · 파일 업로드가 없음을 테스트로 확인합니다. 페이지가 불러오는 외부 주소는 React · 글꼴 CDN 뿐입니다(브라우저 테스트로 확인).
- 상태는 그 브라우저 탭의 `sessionStorage` 에만 저장되고 탭을 닫으면 사라집니다.
- 시연 문서 직접 입력은 브라우저 안에서만 처리되며, 화면에 ‘실제 사건자료를 입력하지 마십시오’를 표시합니다.
- 가상 데이터 점검 — 사건번호에 ‘가상’ 표시, 당사자 이름에 ‘(가상)’ 표시, 주민등록번호 · 전화번호 · 실제 형식 사건번호가 없음을 테스트합니다.

### 선택적 LLM 연동(설계만 · 미구현)

모델이 없는 환경에서도 핵심 기능(추출 · 검수 · 브리핑)은 규칙과 담당자 입력만으로 동작합니다. 승인된 내부 환경에서 요약을 붙일 경우 — ① 사내 승인 모델 · 사내망만 ② 입력은 등록된 문단 단위, 출력 문장마다 근거 문단 ID 필수 ③ 근거 없는 문장은 ‘확인 필요’로만 표시 ④ 모델 출력은 ‘자동 생성 · 미확정’ 상태로 시작해 담당자 확정 전에는 브리핑에 확정으로 오르지 않음 ⑤ 프롬프트 · 응답 로그의 개인정보 마스킹.

## 7. 검증 결과 (2026-11-09 · 시제품 검증 — 실무 도입 효과 아님)

| 항목 | 방법 | 결과 |
|---|---|---|
| 단위 테스트 | `node --test test/trial-brief.test.mjs` | 9건 통과 — 데이터 불변 조건 · 추출 위치 · 검수 정확도 · 승인 후 변경 · 확인 메모 · 권한 · 보안 · 페이지 연결 |
| 검출 범위 | 가상 사건 3건, 기일 직전 도착 서면까지 등록 | 넣어 둔 불일치 · 누락 **15건 모두 검출**, 그 밖의 R1–R5 항목 0건(테스트 자료 기준) |
| 핵심 시나리오 | Playwright — 사건 검색 → 등록 → 추출 → 검수 확인 → 쟁점 확정 · 증거 연결 → 기일 확정 · 할 일 → 사무직원 승인 차단 → 변호사 승인 → 새 서면 → 재검토 필요 → 열람자 읽기 전용 → 브리핑 → 출처 이동 | Chromium 360 · 390 · 430 · 768 · 1440px, WebKit 390 · 1440px 모두 통과 · 콘솔 오류 0 · 가로 넘침 0 |
| A4 1장 | Chromium PDF(A4) 출력 후 쪽 수 확인 | 세 사건 모두 **1쪽** |
| 외부 요청 | 테스트 중 발생한 요청 주소 검사 | React · 글꼴 CDN 외 0건 |

측정하지 않은 것 — 실제 사건에서의 작성 시간 · 확인 시간 · 누락 탐지율 · 사용자 수정 요청 · 승인 소요 시간. 실제 아이폰 기기 시험은 하지 않았습니다(WebKit 엔진 시험만).

### KPI 설계 (실무 시범 적용이 승인될 경우)

| 지표 | 정의 | 측정 방법 | 현재 |
|---|---|---|---|
| 기일 브리핑 작성 시간 | 사건 선택부터 승인까지 | 같은 사건 n건을 기존 방식 · 시스템으로 각각 작성, 평균 · 건수 함께 보고 | 미측정 |
| 기일 전 필수 정보 확인 시간 | 브리핑만 보고 체크리스트 8개 항목에 답하는 시간 | 변호사 n명 · 사건 n건, 기존 서면 묶음과 비교 | 미측정 |
| 준비사항 누락 탐지율 | 사후 확인된 누락 중 시스템이 미리 표시한 비율 | 기일 후 회고 기록과 대조 | 미측정 |
| 불일치 검출 정확도 | 표시한 항목 중 실제 확인이 필요했던 비율 · 놓친 항목 수 | 담당자 확인 메모 분류 | 테스트 자료에서만 15/15 |
| 브리핑 생성 성공률 | A4 1장 출력에 성공한 사건 비율 | 출력 로그 | 테스트 자료 3/3 |
| 수정 요청 건수 · 승인 소요 시간 | 승인 전 되돌림 횟수 · 요청 → 승인 시간 | 감사기록 | 미측정 |

‘성능 목표’와 ‘측정 결과’를 섞지 않습니다. 합성 데이터 결과는 ‘시제품 검증 결과’로만 표기합니다.

## 8. 남은 과제 · 위험

- 운영 전환에는 사내 승인, 사건관리 시스템 연동, 인증 · 서버 측 권한, 문서 원본(PDF · HWP) 텍스트 추출 파이프라인이 필요합니다(Python 문서 처리 설계 대상).
- 정규식 추출은 정해진 표현(‘누수 발견일은 …’)에 맞춰져 있어 실제 서면의 다양한 문장에는 추출 누락이 생길 수 있습니다 — 실무 문서로 규칙을 보강하고 누락률을 측정해야 합니다.
- 행정 · 가사 · 형사 템플릿은 설계만 되어 있습니다.
- 기한 계산은 단순 일수이며 법정기간 계산(초일 불산입 · 공휴일 · 송달)은 하지 않습니다 — 담당 변호사 확인 대상입니다.

## 9. 일정 (근무 종료 2026. 11. 30. · 핵심 목표 11. 27. · 11. 16–18. 예비군 동원훈련 제외)

| 단계 | 기간 | 내용 | 상태 |
|---|---|---|---|
| 1 포트폴리오 · 자산 감사 | 11. 9. | 저장소 · 배포 · 기존 AX 자산 조사(`docs/ax-asset-audit.md`) | 완료 |
| 2 설계 · 구현 | 11. 9. | 데이터 모델 · 검수 규칙 · 작업화면 · A4 브리핑 · PDF | 완료(시제품) |
| 3 통합 · 검증 | 11. 9. | 단위 · 브라우저 테스트, 보안 점검 | 완료(합성 데이터) |
| 4 포트폴리오 반영 | 11. 9. | 대표 프로젝트 카드 · 상세 개요 · 경력기술 문안 | 완료 |
| 5 실무 보강 | 11. 10–15 · 11. 19–27 | 사내 승인 시 시범 적용 · KPI 측정 · 인수인계 문서 정리 | 미착수 — 사내 승인 필요 |

## 10. 인수인계 메모

- 구조: 데이터(`trial-brief-data.js`) · 규칙(`trial-brief-domain.js`, 순수 함수 · Node 에서 테스트 가능) · 화면(`trial-brief.jsx` → `npm run build` → `dist/trial-brief.js`) · 스타일(`trial-brief.css`, 인쇄 규칙 포함).
- 새 검수 규칙은 `qa()` 에 추가하고, `test/trial-brief.test.mjs` 의 ‘검출 범위’ 테스트에 기대값을 같이 넣습니다.
- 새 사건 유형은 `templates` 에 용어를 정의하고 `active: true` 로 켠 뒤, 그 유형의 가상 사건을 추가합니다.
- 회사 반출 금지 — 이 저장소는 공개 저장소입니다. 실제 사건 · 의뢰인 · 사내 문서를 넣지 않습니다.
