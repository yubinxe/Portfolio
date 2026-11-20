/* 주장(claim) 토큰 추출 — 금액 · 비율(% · %p) · 건수 · 날짜 · 연도 · 고유명사. 원문과 초안 모두 같은 규칙으로 읽는다.
 * 분기 표기(3분기)와 단위 없는 숫자는 주장으로 세지 않는다 */
export type Unit = "money" | "%" | "%p" | "건" | "곳" | "명" | "점" | "개월" | "배" | "date" | "ym" | "year" | "entity";
export type Role = "당기" | "전년" | "증감";
export interface Tok { unit: Unit; value: number | string; raw: string; start: number; end: number; role?: Role }

const N = String.raw`-?\d[\d,]*(?:\.\d+)?`;
const RE = new RegExp(
  [
    String.raw`(\d{4})\s*[.년]\s*(\d{1,2})\s*[.월]\s*(\d{1,2})\s*[.일]?`,      /* 1-3 날짜 */
    String.raw`(\d{4})년\s*(\d{1,2})월`,                                       /* 4-5 연월 */
    String.raw`(${N})\s*조(?:\s*(${N})\s*억)?\s*원`,                           /* 6-7 조 단위 금액 */
    String.raw`(${N})\s*(억|백만|천만|만|천)?\s*원`,                            /* 8-9 금액 */
    String.raw`(${N})\s*(%p|%|건|곳|명|점|개월|배)`,                            /* 10-11 비율 · 수량 */
    String.raw`(\d{4})년`,                                                     /* 12 연도 */
    String.raw`(\d)\s*분기`,                                                   /* 13 분기(주장 아님) */
  ].join("|"), "g");
const MUL: Record<string, number> = { "억": 1e8, "백만": 1e6, "천만": 1e7, "만": 1e4, "천": 1e3 };
const num = (s: string) => Number(s.replace(/,/g, ""));
const pad = (n: string) => n.padStart(2, "0");

export const ENTITY_RE = /[가-힣A-Za-z]{2,}(?:솔루션|로지텍|테크|시스템즈)/g;

export function tokens(text: string): Tok[] {
  const out: Tok[] = [];
  for (const m of text.matchAll(RE)) {
    const start = m.index!, end = start + m[0].length, raw = m[0].trim();
    if (m[1]) out.push({ unit: "date", value: `${m[1]}-${pad(m[2])}-${pad(m[3])}`, raw, start, end });
    else if (m[4]) out.push({ unit: "ym", value: `${m[4]}-${pad(m[5])}`, raw, start, end });
    else if (m[6]) out.push({ unit: "money", value: num(m[6]) * 1e12 + (m[7] ? num(m[7]) * 1e8 : 0), raw, start, end });
    else if (m[8]) out.push({ unit: "money", value: num(m[8]) * (m[9] ? MUL[m[9]] : 1), raw, start, end });
    else if (m[10]) out.push({ unit: m[11] as Unit, value: num(m[10]), raw, start, end });
    else if (m[12]) out.push({ unit: "year", value: m[12], raw, start, end });
  }
  for (const m of text.matchAll(ENTITY_RE)) out.push({ unit: "entity", value: m[0], raw: m[0], start: m.index!, end: m.index! + m[0].length });
  return out.sort((a, b) => a.start - b.start);
}

/** 초안 숫자의 역할 — 앞말에 ‘대비’가 있거나 바로 뒤에 증감 동사가 오면 증감, ‘전년’이 있으면 전년, 아니면 당기 */
export function roleOf(text: string, t: Tok, prevEnd: number): Role {
  const before = text.slice(prevEnd, t.start);
  const after = text.slice(t.end, t.end + 8);
  if (/대비/.test(before) || /^\s*(증가|감소|늘|줄|낮아|높아|상승|하락|개선|악화)/.test(after)) return "증감";
  if (/전년/.test(before)) return "전년";
  return "당기";
}

/* 원문에 없는 인과 표현 — 원문 줄에도 인과 표현이 있어야 통과 */
export const CAUSAL_RE = /(때문|덕분|로 인해|으로 인해|영향으로|결과로|탓에|(?:인상|인하|하락|상승|도입|출시)(?:으)?로\s)/;
export const sameVal = (a: Tok, b: Tok) =>
  a.unit === b.unit && (typeof a.value === "number" && typeof b.value === "number"
    ? (a.unit === "%" || a.unit === "%p" ? Math.abs(Math.abs(a.value) - Math.abs(b.value)) < 1e-9 : Math.abs(a.value - b.value) < 1e-6 * Math.max(1, Math.abs(b.value)))
    : a.value === b.value);
