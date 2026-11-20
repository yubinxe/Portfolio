/* 가상 벤치마크 — 범용 도메인 3종 × 의도적으로 심은 결함 5건 = 15건.
 * 결함마다 '기대 신호'를 적어 두고, 엔진이 낸 신호 중 기대에 없는 것은 모두 오탐으로 센다.
 * 함정(오탐 유도): 평 ↔ ㎡ 정상 환산, 원 · 만원 · 천원 · 백만원 · 억원 반올림, 키 표기 차이(B-101호/B103, 띄어쓰기), 날짜 형식 차이 */
import type { Schema, SourceDoc } from "./adapter";
import type { Status } from "./engine";

export interface Expect { status: Exclude<Status, "MATCH">; key: string; field?: string }
export interface Defect { id: string; ko: string; kind: string; expect: Expect[] }
export interface Scenario { id: string; no: string; ko: string; domain: string; schema: Schema; A: SourceDoc; B: SourceDoc; defects: Defect[]; traps: string[] }

const lease: Schema = {
  id: "lease", keyKo: "호실", keySynonyms: ["호실", "unit", "unit_id"], coverage: "both",
  fields: [
    { id: "area", ko: "전용면적", type: "area", compare: true, synonyms: ["전용면적", "전용", "면적", "area"] },
    { id: "rent", ko: "월 임대료", type: "money", compare: true, synonyms: ["월 임대료", "임대료", "rent"] },
    { id: "fee", ko: "관리비", type: "money", compare: true, synonyms: ["관리비", "maintenance"] },
    { id: "start", ko: "계약 시작일", type: "date", compare: true, synonyms: ["계약시작일", "시작일", "start"] },
    { id: "end", ko: "계약 종료일", type: "date", compare: true, synonyms: ["계약종료일", "종료일", "end"] },
  ],
  rules: [{ kind: "dateOrder", start: "start", end: "end", ko: "계약기간" }],
};

const supply: Schema = {
  id: "supply", keyKo: "SKU", keySynonyms: ["sku", "품번"], coverage: "BinA",
  fields: [
    { id: "item", ko: "품목", type: "text", compare: false, synonyms: ["품목", "item"] },
    { id: "spec", ko: "규격", type: "text", compare: false, synonyms: ["규격", "spec"] },
    { id: "price", ko: "단가", type: "money", compare: true, synonyms: ["단가", "unit price", "price"] },
    { id: "qty", ko: "수량", type: "int", compare: false, synonyms: ["수량", "qty"] },
    { id: "amount", ko: "정산금액", type: "money", compare: false, synonyms: ["정산금액", "amount"] },
    { id: "date", ko: "청구일", type: "date", compare: false, synonyms: ["청구일", "invoice date"] },
    { id: "line", ko: "라인", type: "text", compare: false, synonyms: ["line id"] },
  ],
  rules: [{ kind: "product", qty: "qty", price: "price", total: "amount", ko: "정산금액 계산" }],
  jsonUnitProps: { unit_price: "price_unit" },
};

const revenue: Schema = {
  id: "revenue", keyKo: "사업부", keySynonyms: ["사업부", "division"], coverage: "both",
  fields: [
    { id: "rev", ko: "매출액", type: "money", compare: true, synonyms: ["매출액", "매출", "revenue"] },
    { id: "op", ko: "영업이익", type: "money", compare: true, synonyms: ["영업이익", "operating profit"] },
    { id: "hc", ko: "인원", type: "int", compare: true, synonyms: ["인원", "headcount"] },
  ],
  rules: [{ kind: "totalRow", totalKey: "합계", fields: ["rev", "op"], ko: "합계 검산" }, { kind: "metaRange", meta: "period", ko: "집계 기간" }],
  meta: [{ id: "period", ko: "집계 기간", synonyms: ["집계 기간", "집계기간", "기간"] }],
};

export const SCENARIOS: Scenario[] = [
  {
    id: "lease", no: "①", ko: "상업용 부동산 임대 · 관리비 대장 vs 계약 요약", domain: "부동산 · 자산관리",
    schema: lease,
    A: { id: "A", name: "임대 대장(CSV)", kind: "자산관리 시스템 내보내기 · ㎡ · 원", format: "csv", body:
`호실,전용면적(㎡),월 임대료(원),관리비(원),계약시작일,계약종료일
B-101,278.35,"12,500,000","1,800,000",2026-01-01,2027-12-31
B-102,165.29,"7,400,000","1,070,000",2025-07-01,2027-06-30
B-102,165.29,"7,400,000","1,070,000",2025-07-01,2027-06-30
B-103,99.17,"4,300,000","640,000",2026-03-01,2028-02-29
B-201,330.58,"14,800,000","2,140,000",2026-05-01,2028-04-30
B-202,198.35,"8,900,000","1,280,000",2025-11-01,2027-10-31
B-203,132.23,"5,950,000","860,000",2027-03-31,2026-04-01
B-305,247.93,"10,600,000","1,600,000",2026-02-01,2028-01-31` },
    B: { id: "B", name: "계약 요약(텍스트)", kind: "임대차 계약 요약 메모 · 평 · 만원", format: "text", body:
`# 2026년 하반기 임대차 계약 요약 — 가상 오피스 빌딩
B-101호 — 전용 84.2평, 월 임대료 1,520만원, 관리비 180만원, 시작일 2026.1.1
B-102호 — 전용 50.0평, 월 임대료 740만원, 관리비 107만원, 시작일 2025.7.1
B103 — 전용 30평, 월 임대료 430만원, 관리비 64만원, 시작일 2026.3.1
B-201호 — 전용 330.58평, 월 임대료 1,480만원, 관리비 214만원, 시작일 2026.5.1
B-202호 — 전용 60평, 월 임대료 890만원, 관리비 128만원, 시작일 2025.11.1
B-203호 — 전용 40평, 월 임대료 595만원, 관리비 86만원, 시작일 2027.3.31` },
    defects: [
      { id: "D01", ko: "월 임대료 숫자 자리 바뀜(1,250만 → 1,520만)", kind: "오타", expect: [{ status: "MISMATCH", key: "B101", field: "rent" }] },
      { id: "D02", ko: "㎡ 숫자에 평 단위 표기(330.58평)", kind: "평/㎡ 혼용", expect: [{ status: "MISMATCH", key: "B201", field: "area" }] },
      { id: "D03", ko: "B-305호 계약 요약 누락", kind: "행 누락", expect: [{ status: "MISSING", key: "B305" }] },
      { id: "D04", ko: "대장에 B-102호 중복 행", kind: "중복 ID", expect: [{ status: "DUP", key: "B102" }] },
      { id: "D05", ko: "B-203호 계약 시작 · 종료일 역전", kind: "날짜 역전", expect: [{ status: "ANOMALY", key: "B203" }] },
    ],
    traps: ["84.2평 = 278.35㎡ 등 평 · ㎡ 환산(반올림 범위 안)", "원 ↔ 만원 환산", "B103 · B-101호 키 표기 차이", "2026.1.1 ↔ 2026-01-01 날짜 형식"],
  },
  {
    id: "supply", no: "②", ko: "B2B 공급단가표 vs 월말 정산 내역", domain: "구매 · 정산 · 커머스",
    schema: supply,
    A: { id: "A", name: "공급단가표(CSV)", kind: "계약 단가표 · 원", format: "csv", body:
`SKU,품목,규격,단가(원)
SKU-1001,A4 복사용지,박스(2500매),"32,000"
SKU-1002,토너 카트리지 BK,정품,"84,500"
SKU-1003,사무용 의자,메쉬,"189,000"
SKU-1004,모니터암 듀얼,가스식,"56,000"
SKU-1005,무선 키보드 세트,한글,"42,000"
SKU-1006,문서 파쇄기,A4 세단,"315,000"
SKU-1007,케이블 정리함,대형,"9,800"` },
    B: { id: "B", name: "월말 정산(API 스냅샷)", kind: "ERP 정산 API · 행마다 단가 단위", format: "json", body:
`[
  { "line_id": "L-01", "sku": "SKU-1001", "qty": 40, "unit_price": 32, "price_unit": "천원", "amount": 1280000, "invoice_date": "2026-10-31" },
  { "line_id": "L-02", "sku": "SKU-1002", "qty": 12, "unit_price": 85400, "price_unit": "원", "amount": 1024800, "invoice_date": "2026-10-31" },
  { "line_id": "L-03", "sku": "sku1003", "qty": 6, "unit_price": 189000, "price_unit": "원", "amount": 1134000, "invoice_date": "2026/10/31" },
  { "line_id": "L-04", "sku": "SKU-1004", "qty": 10, "unit_price": 56000, "price_unit": "천원", "amount": 560000, "invoice_date": "2026-10-31" },
  { "line_id": "L-05", "sku": "SKU-1005", "qty": 25, "unit_price": 42000, "price_unit": "원", "amount": 1150000, "invoice_date": "2026-10-31" },
  { "line_id": "L-06", "sku": "SKU-1006", "qty": 1, "unit_price": 315000, "price_unit": "원", "amount": 315000, "invoice_date": "2026-10-31" },
  { "line_id": "L-07", "sku": "SKU-1006", "qty": 1, "unit_price": 315000, "price_unit": "원", "amount": 315000, "invoice_date": "2026-10-31" },
  { "line_id": "L-08", "sku": "SKU-1009", "qty": 3, "unit_price": 27000, "price_unit": "원", "amount": 81000, "invoice_date": "2026-10-31" }
]` },
    defects: [
      { id: "D06", ko: "토너 단가 자리 바뀜(84,500 → 85,400)", kind: "오타", expect: [{ status: "MISMATCH", key: "SKU1002", field: "price" }] },
      { id: "D07", ko: "원 단위 단가에 천원 표기(모니터암)", kind: "단위 자릿수 혼용", expect: [{ status: "MISMATCH", key: "SKU1004", field: "price" }, { status: "ANOMALY", key: "SKU1004" }] },
      { id: "D08", ko: "키보드 정산금액 계산 오류(25×42,000 ≠ 1,150,000)", kind: "허용 오차 초과", expect: [{ status: "ANOMALY", key: "SKU1005" }] },
      { id: "D09", ko: "단가표에 없는 SKU-1009 정산", kind: "행 누락", expect: [{ status: "MISSING", key: "SKU1009" }] },
      { id: "D10", ko: "파쇄기 정산 라인 중복(L-06 · L-07)", kind: "중복 ID", expect: [{ status: "DUP", key: "SKU1006" }] },
    ],
    traps: ["32천원 = 32,000원 행별 단위 환산", "sku1003 키 표기 차이", "SKU-1007 은 이번 달 미구매(누락 아님 — B ⊆ A 규칙)", "2026/10/31 날짜 형식"],
  },
  {
    id: "revenue", no: "③", ko: "사업부별 매출 집계 CSV vs 경영보고서 요약", domain: "경영기획 · 재무",
    schema: revenue,
    A: { id: "A", name: "매출 집계(CSV)", kind: "ERP 집계 · 백만원", format: "csv", body:
`사업부,매출액(백만원),영업이익(백만원),인원(명)
리테일사업부,"128,437","9,612",412
B2B솔루션사업부,"96,210","11,048",238
물류사업부,"141,905","6,220",655
플랫폼사업부,"54,388","4,812",171
신사업부,"8,120","-1,340",46
합계,"429,600","30,352","1,522"` },
    B: { id: "B", name: "경영보고서 요약(텍스트)", kind: "3분기 경영보고 요약 · 억원", format: "text", body:
`# 3분기 경영보고 요약(가상 기업)
집계 기간: 2026.09.30 ~ 2026.07.01
리테일 사업부 — 매출 1,284억원, 영업이익 96억원, 인원 412명
B2B솔루션사업부 — 매출 962억원, 영업이익 110억원, 인원 238명
물류사업부 — 매출 141,905억원, 영업이익 62억원, 인원 655명
플랫폼사업부 — 매출 544억원, 영업이익 84억원, 인원 171명` },
    defects: [
      { id: "D11", ko: "백만원 숫자에 억원 표기(물류 매출)", kind: "단위 자릿수 혼용", expect: [{ status: "MISMATCH", key: "물류사업부", field: "rev" }] },
      { id: "D12", ko: "플랫폼 영업이익 자리 바뀜(48억 → 84억)", kind: "오타", expect: [{ status: "MISMATCH", key: "플랫폼사업부", field: "op" }] },
      { id: "D13", ko: "보고서에서 신사업부 누락", kind: "행 누락", expect: [{ status: "MISSING", key: "신사업부" }] },
      { id: "D14", ko: "집계 합계 행 오기(429,060 → 429,600)", kind: "허용 오차 초과", expect: [{ status: "ANOMALY", key: "합계", field: "rev" }] },
      { id: "D15", ko: "집계 기간 시작 · 종료 역전", kind: "날짜 역전", expect: [{ status: "ANOMALY", key: "집계기간" }] },
    ],
    traps: ["128,437백만원 ≈ 1,284억원(억 단위 반올림 범위 안)", "영업이익 합계 30,352 = 행 합계(정상)", "‘리테일 사업부’ 띄어쓰기", "음수 영업이익(-1,340)"],
  },
];
