# WORKLOG — Portfolio

새 세션은 이 파일부터 읽는다. 작업이 끝나면 아래 네 칸을 갱신해 같은 PR 에 커밋한다.

## 현재 상태 (2026-10-16)
- 기본 브랜치 `main` = 운영(GitHub Pages https://yubinxe.github.io/Portfolio/ · Vercel `portfolio`)
- 테스트 `npm test` 57/57 통과
- 캐시 버전: `styles.css?v=41` · `features.css?v=6` · `dist/sections.js?v=14` · `chatbot.js?v=7` · `mnav.js?v=2` · `kb.js?v=20261016b`

## 완료 (최신순)
- #49 KREMA 인턴 기간(2026.4~6)·명지대 AI 데이터 매니지먼트 트랙3 수료/1·2·4 수강 반영
- #48 캘린더 기반 이력 5건(집코노미 박람회 시연·발표, KREMA 인턴, 서초구 가치디자인단, 명지대, Claude Code RAG 교육) · 핀테크 14기 '수강 중' 정정 · 갤러리 ZIPCONOMY EXPO 2026 특집(사진 8장)
- #47 네이버 서치어드바이저 소유 확인 메타 태그 (루트 저장소에도 확인 파일 업로드)
- #46 작업물: 법조시장 한눈에 2번째, 곳간은 '그 밖의 작업'
- #44·#45 상장 3장(2군단장·훈련소장·준장) 같은 카드 형식, 원본만, AI 보정본 제거
- #42 작업물 재분류(실무·실생활 시스템만 메인) · 모든 연혁 최신순
- #39·#38 검색 노출(프리렌더 · 구조화 데이터 · sameAs) / #41 vCard·공유 버튼

## 진행 중
- 없음

## 미해결 문제
- 훈련소장(최우수 분대) 상장: 분대원 성명이 가려진 스캔만 있음 → 가림 없는 원본 스캔을 사용자에게 받아 `images/award-training-2023*.jpg` 교체
- 핀테크 아카데미 14기: 최종 평가 2026-11-07 이후 '수강 중' → '수료' (sections.jsx · career.html · kb.js)
- 검색엔진: 구글·네이버 사이트맵 제출은 사용자 콘솔 작업(`https://yubinxe.github.io/Portfolio/sitemap.xml`)
- 사용자 확인 대기: 개인정보 보유기간 문구, 운영 `/api/lead` Airtable 환경 변수 설정 여부

## 열린 PR
- 이 문서를 추가한 PR(chore/cloud-continuity) 외 없음

## 다음 행동 (일정이 지나면 이력에 추가 — 사용자 지시)
- 10.21 서울시 매력일자리 담당 공무원 인터뷰(KREMA) · 10.23 KDI 시민패널 'AI 이후의 미래' 포럼 · 10.25 성평등가족부 청년세대 공론장 · 10.27 재정경제부 제1차관 청년 간담회 · 10.29 파리 15구 대학생×서초청년 교류 · 11.2~11.30 서울시 시민공약평가단 · 11.11 부동산산업의 날 · 11.16~ KOSA AI·Python 교육
- 제외 확정: 독학사·공인중개사 응시, 정당 관련 프로그램, 개인 성장 프로그램

## 운영 메모
- 사진 추가: 원본 → `images/<name>.jpg`(긴 변 1600) + `-600.jpg`. 메인(sections.jsx `<Pic>`)에 쓰면 `scripts/build-images.mjs` 목록에 추가 후 `npm run build:images`
- 용량 상한(test/dist.test.mjs): dist/sections.js 98KB · styles.css 96KB · features.css 24KB
- 로컬 PC 정본 클론: `C:\경국_김유빈\## 개인\# Side Project\My PortFolio\Portfolio`. 상위 `My PortFolio`, `Documents\GitHub\My Portfolio`·`Portfolio-current` 는 오래된 사본 — 수정 금지
