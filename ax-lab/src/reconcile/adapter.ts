/* Schema Adapter — 서로 다른 양식(CSV · 요약 텍스트 · API JSON)을 같은 표준 레코드로 옮기는 단계.
 * 이 단계만 '구조화 추출 레이어'로 분리한다. 공개 시연은 결정론적 파서(DeterministicAdapter)로 즉시 동작하고,
 * 선택적으로 LLM 어댑터를 같은 인터페이스로 끼울 수 있다. 어떤 어댑터를 쓰든 계산 · 비교 · 판정은 engine.ts 의 순수 코드가 한다. */
import { type FieldType, type Val, normKey, normText, parseVal } from "./units";

export interface FieldSpec { id: string; ko: string; type: FieldType; compare: boolean; synonyms: string[] }
export type Rule =
  | { kind: "dateOrder"; start: string; end: string; ko: string }
  | { kind: "product"; qty: string; price: string; total: string; ko: string }
  | { kind: "totalRow"; totalKey: string; fields: string[]; ko: string }
  | { kind: "metaRange"; meta: string; ko: string };
export interface Schema {
  id: string;
  keyKo: string;
  keySynonyms: string[];
  fields: FieldSpec[];
  rules: Rule[];
  /** both = 양쪽 모두 있어야 함 · BinA = B 의 키는 A 에 있어야 함(A 의 나머지는 정상) */
  coverage: "both" | "BinA";
  meta?: { id: string; ko: string; synonyms: string[] }[];
  /** JSON 행마다 단위를 따로 적는 필드 — { unit_price: "price_unit" } */
  jsonUnitProps?: Record<string, string>;
}

export type Format = "csv" | "text" | "json";
export interface SourceDoc { id: "A" | "B"; name: string; kind: string; format: Format; body: string }
export interface Row { key: string; rawKey: string; line: number; values: Record<string, Val | undefined> }
export interface MetaVal { id: string; ko: string; raw: string; line: number; start?: Val; end?: Val }
export interface Parsed { id: "A" | "B"; name: string; format: Format; rows: Row[]; meta: MetaVal[]; columns: string[]; unknown: string[]; warnings: string[] }

export interface SchemaAdapter {
  readonly name: string;
  readonly deterministic: boolean;
  parse(doc: SourceDoc, schema: Schema): Parsed;
}

const unitOf = (h: string) => { const m = h.match(/\(([^)]+)\)/); return m ? m[1].trim() : undefined; };
const matchField = (label: string, schema: Schema) => {
  const l = normText(label).replace(/\(.*?\)/g, "");
  let best: FieldSpec | undefined, len = 0;
  for (const f of schema.fields) for (const s of f.synonyms) { const t = normText(s); if (l.includes(t) && t.length > len) { best = f; len = t.length; } }
  return best;
};
const isKeyLabel = (label: string, schema: Schema) => schema.keySynonyms.some((s) => normText(label).replace(/\(.*?\)/g, "").trim() === normText(s));

/** CSV 한 줄 — 따옴표 안의 쉼표 허용 */
export function splitCsv(line: string): string[] {
  const out: string[] = []; let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
    else if (c === "," && !q) { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function parseCsv(doc: SourceDoc, schema: Schema): Parsed {
  const lines = doc.body.split(/\r?\n/);
  const res: Parsed = { id: doc.id, name: doc.name, format: "csv", rows: [], meta: [], columns: [], unknown: [], warnings: [] };
  const hi = lines.findIndex((l) => l.trim() && !l.trim().startsWith("#"));
  if (hi < 0) { res.warnings.push("머리글 행이 없습니다"); return res; }
  const head = splitCsv(lines[hi]);
  const map: ({ f: FieldSpec; unit?: string } | "key" | null)[] = head.map((h) => {
    if (isKeyLabel(h, schema)) return "key";
    const f = matchField(h, schema);
    if (!f) { res.unknown.push(h); return null; }
    return { f, unit: unitOf(h) };
  });
  if (!map.includes("key")) { res.warnings.push(`키 열(${schema.keyKo})을 찾지 못했습니다 — 머리글: ${head.join(", ")}`); return res; }
  res.columns = map.filter((m): m is { f: FieldSpec } => !!m && m !== "key").map((m) => m.f.id);
  for (let i = hi + 1; i < lines.length; i++) {
    const l = lines[i];
    if (!l.trim() || l.trim().startsWith("#")) continue;
    const cells = splitCsv(l);
    const row: Row = { key: "", rawKey: "", line: i + 1, values: {} };
    cells.forEach((c, j) => {
      const m = map[j];
      if (m === "key") { row.rawKey = c; row.key = normKey(c); }
      else if (m) {
        const v = parseVal(m.f.type, c, m.unit);
        if (c && !v) res.warnings.push(`${i + 1}행 ${m.f.ko}: 값을 읽지 못함(${c})`);
        row.values[m.f.id] = v || undefined;
      }
    });
    if (row.key) res.rows.push(row); else res.warnings.push(`${i + 1}행: 키 없음`);
  }
  return res;
}

/** 요약 텍스트 — "B-101호 — 전용 84.2평, 월 임대료 1,250만원" · "집계 기간: 2026.07.01 ~ 2026.09.30" */
function parseText(doc: SourceDoc, schema: Schema): Parsed {
  const res: Parsed = { id: doc.id, name: doc.name, format: "text", rows: [], meta: [], columns: [], unknown: [], warnings: [] };
  const cols = new Set<string>();
  doc.body.split(/\r?\n/).forEach((l, idx) => {
    const line = l.trim();
    if (!line || line.startsWith("#")) return;
    const meta = schema.meta?.find((m) => m.synonyms.some((s) => line.startsWith(s)));
    if (meta) {
      const rest = line.replace(/^[^:：]*[:：]\s*/, "");
      const [a, b] = rest.split(/\s*[~～–]\s*/);
      res.meta.push({ id: meta.id, ko: meta.ko, raw: rest, line: idx + 1, start: parseVal("date", a || "") || undefined, end: parseVal("date", b || "") || undefined });
      return;
    }
    const m = line.match(/^([^\s—–:|]+(?:\s[^\s—–:|]+)?)\s*[—–:|-]\s+(.*)$/);
    if (!m) { res.warnings.push(`${idx + 1}행: 형식을 읽지 못함`); return; }
    const row: Row = { key: normKey(m[1]), rawKey: m[1], line: idx + 1, values: {} };
    for (const seg of m[2].split(/\s*(?:,(?!\d{3})|，|\||·)\s*/)) { /* 1,520만원 의 천 단위 쉼표는 나누지 않는다 */
      if (!seg) continue;
      const f = matchField(seg, schema);
      if (!f) { res.unknown.push(seg); continue; }
      let rest = seg;
      for (const s of [...f.synonyms].sort((x, y) => y.length - x.length)) { if (rest.includes(s)) { rest = rest.replace(s, ""); break; } }
      const v = parseVal(f.type, rest.trim());
      if (!v) res.warnings.push(`${idx + 1}행 ${f.ko}: 값을 읽지 못함(${seg})`);
      row.values[f.id] = v || undefined;
      cols.add(f.id);
    }
    res.rows.push(row);
  });
  res.columns = [...cols];
  return res;
}

function parseJson(doc: SourceDoc, schema: Schema): Parsed {
  const res: Parsed = { id: doc.id, name: doc.name, format: "json", rows: [], meta: [], columns: [], unknown: [], warnings: [] };
  let data: unknown;
  try { data = JSON.parse(doc.body); } catch (e) { res.warnings.push("JSON 형식 오류 — " + (e as Error).message); return res; }
  const arr = Array.isArray(data) ? data : Array.isArray((data as { items?: unknown[] })?.items) ? (data as { items: unknown[] }).items : null;
  if (!arr) { res.warnings.push("배열(또는 items 배열)이 아닙니다"); return res; }
  const cols = new Set<string>();
  const unitProps = new Set(Object.values(schema.jsonUnitProps || {}));
  const lines = doc.body.split(/\r?\n/);
  let cursor = 0;
  arr.forEach((o, i) => {
    if (!o || typeof o !== "object") return;
    const rec = o as Record<string, unknown>;
    /* 원문 줄 번호 — 이 객체가 시작하는 줄(사람이 원문을 찾아가도록) */
    const line = lines.findIndex((l, j) => j >= cursor && l.includes("{"));
    cursor = line + 1;
    const row: Row = { key: "", rawKey: "", line: line + 1 || i + 1, values: {} };
    for (const [k, v] of Object.entries(rec)) {
      if (unitProps.has(k)) continue;
      if (isKeyLabel(k, schema)) { row.rawKey = String(v); row.key = normKey(String(v)); continue; }
      const f = matchField(k.replace(/_/g, " "), schema);
      if (!f) { if (i === 0) res.unknown.push(k); continue; }
      const unitProp = schema.jsonUnitProps?.[k];
      const unit = unitProp ? String(rec[unitProp] ?? "") || undefined : undefined;
      const val = parseVal(f.type, String(v ?? ""), unit);
      row.values[f.id] = val || undefined;
      cols.add(f.id);
    }
    if (row.key) res.rows.push(row); else res.warnings.push(`${i + 1}번째 항목: 키 없음`);
  });
  res.columns = [...cols];
  return res;
}

export const DeterministicAdapter: SchemaAdapter = {
  name: "결정론적 파서(공개 시연 기본)",
  deterministic: true,
  parse(doc, schema) {
    if (doc.format === "csv") return parseCsv(doc, schema);
    if (doc.format === "json") return parseJson(doc, schema);
    return parseText(doc, schema);
  },
};

/** 선택형 LLM 어댑터 자리 — 구현체는 비정형 원문을 이 함수가 받는 표준 CSV 로만 바꿔 돌려준다.
 *  돌려받은 CSV 도 결국 DeterministicAdapter 가 다시 읽으므로, LLM 은 숫자를 계산 · 판정하지 않는다. 공개 시연에는 연결하지 않았다 */
export interface LLMSchemaMapper { toCanonicalCsv(doc: SourceDoc, schema: Schema): Promise<string> }
export function withMapper(mapper: LLMSchemaMapper): { parse(doc: SourceDoc, schema: Schema): Promise<Parsed> } {
  return {
    async parse(doc, schema) {
      const csv = await mapper.toCanonicalCsv(doc, schema);
      return DeterministicAdapter.parse({ ...doc, format: "csv", body: csv }, schema);
    },
  };
}
