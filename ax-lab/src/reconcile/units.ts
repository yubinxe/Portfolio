/* 단위 · 숫자 · 날짜 정규화 — 100% 결정론적. 모든 값은 기준 단위(원 · ㎡ · 일 · 개)로 바꾸고,
 * 원문 표기가 가진 정밀도(step)를 함께 남긴다. 허용 오차는 이 step 에서만 나온다(임의 상수 없음). */

export type FieldType = "money" | "area" | "date" | "int" | "text";

export interface Val {
  type: FieldType;
  base: number | string; /* money=원, area=㎡, date=1970-01-01 기준 일수, int=개, text=정규화 문자열 */
  step: number;          /* 원문 표기의 최소 눈금(기준 단위) — "1,284억원" → 1억 */
  raw: string;           /* 원문 그대로 */
  unit: string;          /* 원문에서 읽은 단위 */
}

export const PYEONG_M2 = 400 / 121; /* 1평 = 400/121 ㎡ (≈3.3058) — 계량법 환산 */

export const MONEY_UNITS: Record<string, number> = { "조": 1e12, "억": 1e8, "천만": 1e7, "백만": 1e6, "십만": 1e5, "만": 1e4, "천": 1e3, "원": 1 };
const MONEY_ALIAS: Record<string, string> = { "천원": "천", "만원": "만", "백만원": "백만", "억원": "억", "조원": "조", "krw": "원", "krw_thousand": "천", "krw_million": "백만" };

/** "1,284.5" → { n: 1284.5, decimals: 1 } · 음수 · 괄호 음수 · 전각 숫자 허용 */
export function parseNum(s: string): { n: number; decimals: number } | null {
  const t = s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/\s/g, "");
  const m = t.match(/^\(?([-−–]?)(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?\)?$/);
  if (!m) return null;
  const neg = m[1] !== "" || (t.startsWith("(") && t.endsWith(")"));
  const n = Number(m[2].replace(/,/g, "") + (m[3] ? "." + m[3] : ""));
  return { n: neg ? -n : n, decimals: m[3] ? m[3].length : 0 };
}

export function normUnit(u: string): string {
  const k = u.trim().toLowerCase().replace(/\s/g, "");
  return MONEY_ALIAS[k] || k;
}

/** 금액 — "1,250만원", "1억 2,500만원", "12,500,000", "-1,340"(열 단위 백만원) */
export function parseMoney(raw: string, defaultUnit = "원"): Val | null {
  const s = raw.replace(/\s+/g, " ").trim();
  if (!s) return null;
  const re = /([-−–(]?\d[\d,]*(?:\.\d+)?\)?)\s*(조|억|천만|백만|십만|만|천)?\s*(원)?/g;
  let total = 0, step = 0, any = false, unit = "";
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const p = parseNum(m[1]);
    if (!p) continue;
    const u = m[2] || (m[3] ? "원" : normUnit(defaultUnit));
    const mul = MONEY_UNITS[u];
    if (mul === undefined) return null;
    total += p.n * mul;
    step = mul / Math.pow(10, p.decimals); /* 가장 마지막(가장 작은) 토큰의 눈금 */
    unit = unit ? unit + "+" + u : u;
    any = true;
  }
  if (!any) return null;
  return { type: "money", base: total, step, raw, unit };
}

/** 면적 — "84.2평", "278.35㎡", "278.35 m2", 열 단위 기본값 */
export function parseArea(raw: string, defaultUnit = "㎡"): Val | null {
  const m = raw.trim().match(/([-−]?\d[\d,]*(?:\.\d+)?)\s*(평|㎡|m2|m²|제곱미터)?/i);
  if (!m) return null;
  const p = parseNum(m[1]);
  if (!p) return null;
  const u0 = (m[2] || defaultUnit).toLowerCase();
  const u = u0 === "평" ? "평" : "㎡";
  const mul = u === "평" ? PYEONG_M2 : 1;
  return { type: "area", base: p.n * mul, step: mul / Math.pow(10, p.decimals), raw, unit: u };
}

/** 날짜 — 2026-01-05 · 2026.1.5 · 2026/01/05 · 2026년 1월 5일 → 1970-01-01 기준 일수 */
export function parseDate(raw: string): Val | null {
  const m = raw.trim().match(/(\d{4})\s*[.\-/년]\s*(\d{1,2})\s*[.\-/월]\s*(\d{1,2})\s*일?/);
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  const t = Date.UTC(y, mo - 1, d);
  const dt = new Date(t);
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null; /* 2월 30일 같은 날짜 거부 */
  return { type: "date", base: Math.round(t / 864e5), step: 1, raw, unit: "day" };
}

export function parseInt0(raw: string): Val | null {
  const m = raw.trim().match(/([-−]?\d[\d,]*)/);
  if (!m) return null;
  const p = parseNum(m[1]);
  return p ? { type: "int", base: p.n, step: 1, raw, unit: "개" } : null;
}

export function parseVal(type: FieldType, raw: string, unitHint?: string): Val | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  switch (type) {
    case "money": return parseMoney(s, unitHint || "원");
    case "area": return parseArea(s, unitHint || "㎡");
    case "date": return parseDate(s);
    case "int": return parseInt0(s);
    default: return { type: "text", base: normText(s), step: 0, raw: s, unit: "" };
  }
}

export const normText = (s: string) => s.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();

/** 키 정규화 — "B-101호" = "B101" = "b 101", "리테일 사업부" = "리테일사업부", "SKU-1001" = "sku1001" */
export const normKey = (s: string) => s.normalize("NFKC").toUpperCase().replace(/호$/, "").replace(/[^0-9A-Z가-힣]/g, "");

export const isoDate = (days: number) => new Date(days * 864e5).toISOString().slice(0, 10);

/** 사람이 읽는 값 */
export function fmt(v: Val | undefined): string {
  if (!v) return "—";
  if (v.type === "money") return Math.round(v.base as number).toLocaleString("ko-KR") + "원";
  if (v.type === "area") return (Math.round((v.base as number) * 100) / 100).toLocaleString("ko-KR") + "㎡";
  if (v.type === "date") return isoDate(v.base as number);
  if (v.type === "int") return (v.base as number).toLocaleString("ko-KR");
  return String(v.raw);
}

/** 허용 오차 — 두 원문 중 더 거친 눈금의 절반(반올림 범위) */
export const tolerance = (a: Val, b: Val) => Math.max(a.step, b.step) / 2 + 1e-9 * Math.max(Math.abs(a.base as number), Math.abs(b.base as number));

/** 불일치 원인 추정 — 비율로 단위 혼용 · 자릿수 오타를 가려 사람에게 힌트만 준다(판정은 하지 않음) */
export function diagnose(a: Val, b: Val): string | undefined {
  if (typeof a.base !== "number" || typeof b.base !== "number" || !a.base || !b.base) return undefined;
  const r = (b.base as number) / (a.base as number);
  const near = (x: number, y: number) => Math.abs(x - y) / y < 0.004;
  if (a.type === "area" && (near(r, PYEONG_M2) || near(1 / r, PYEONG_M2))) return "평 · ㎡ 혼용 의심 — 원문 숫자는 같은데 단위 표기만 다릅니다";
  for (const k of [1, 2, 3, 4, 5, 6, 8]) {
    if (near(r, Math.pow(10, k)) || near(1 / r, Math.pow(10, k))) return `단위 자릿수 혼용 의심(×10^${k}) — 원 · 천원 · 백만원 · 억원 표기 확인`;
  }
  const da = String(Math.abs(Math.round(a.base as number))), db = String(Math.abs(Math.round(b.base as number)));
  if (da.length === db.length) {
    const diff = [...da].filter((c, i) => c !== db[i]).length;
    if (diff <= 2) return diff === 2 && [...da].sort().join() === [...db].sort().join() ? "숫자 자리 바뀜(전치) 의심" : "한두 자리 오타 의심";
  }
  return undefined;
}
