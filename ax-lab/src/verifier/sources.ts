/* 가상 원천 4종 — 분기 실적 CSV · 시장 리서치 메모 · 정책 변경 공지 · 현장 인터뷰 노트(가상 물류 SaaS 기업).
 * 줄 번호가 곧 인용 주소다: [S1:2] = S1 원천의 2번째 줄 */
import { type Role, type Tok, tokens } from "./claims";

export interface Source { id: string; ko: string; kind: string; format: "csv" | "text"; lines: string[]; roles?: (Role | undefined)[] }

export const SOURCES: Source[] = [
  { id: "S1", ko: "분기 실적 CSV", kind: "ERP 집계 · 가상 기업", format: "csv", roles: [undefined, "당기", "전년", "증감"], lines: [
    "지표,2026 3분기,2025 3분기,증감률",
    "매출,412.6억원,368.0억원,12.1%",
    "영업이익,38.4억원,29.7억원,29.3%",
    "신규 계약,128건,104건,23.1%",
    "고객 해지율,2.4%,3.1%,-0.7%p",
  ] },
  { id: "S2", ko: "시장 리서치 메모", kind: "리서치팀 · 2026. 10. 12", format: "text", lines: [
    "# 시장 리서치 메모 — 중소 화주 물류 SaaS(가상)",
    "국내 중소 화주 대상 물류 SaaS 시장은 2026년 1조 1,800억원 규모로 추정된다.",
    "2024–2026 연평균 성장률은 14.2%로 추정된다.",
    "경쟁사 누리솔루션은 2026년 6월 가격을 8% 인상했다.",
    "당사의 시장 점유율은 3.5%로 추정된다.",
  ] },
  { id: "S3", ko: "정책 변경 공지", kind: "물류정책 변경 요약(가상)", format: "text", lines: [
    "# 물류정책 변경 공지 요약(가상)",
    "화물 운송 실적 전자신고 의무화가 2027. 1. 1부터 시행된다.",
    "대상은 연 매출 100억원 이상 화주 기업이다.",
    "미신고 시 과태료는 최대 500만원이다.",
  ] },
  { id: "S4", ko: "현장 인터뷰 노트", kind: "영업본부 · 2026. 10. 28", format: "text", lines: [
    "# 고객 인터뷰 노트(가상)",
    "인터뷰한 고객사 12곳 중 9곳이 전자신고 대응 기능을 우선 요구했다.",
    "고객사 다수는 누리솔루션의 가격 인상을 언급했다.",
    "해지 고객 인터뷰 5건 중 3건은 기능 부족을 해지 이유로 들었다.",
  ] },
];

export const sourceById = (id: string) => SOURCES.find((s) => s.id === id);

/** 원천 한 줄의 주장 토큰 — CSV 는 열 역할(당기 · 전년 · 증감)을 붙인다 */
export function lineTokens(src: Source, line: number): Tok[] {
  const text = src.lines[line - 1];
  if (text == null) return [];
  if (src.format !== "csv") return tokens(text);
  const out: Tok[] = [];
  let off = 0;
  text.split(",").forEach((cell, i) => {
    tokens(cell).forEach((t) => out.push({ ...t, start: t.start + off, end: t.end + off, role: src.roles?.[i] }));
    off += cell.length + 1;
  });
  return out;
}
