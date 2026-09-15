#!/usr/bin/env node
/* ============================================================================
 * build-seed.mjs — kb.js → seed/seed.json 결정론적 병합 빌드
 * ----------------------------------------------------------------------------
 * · 합성(LLM) 단계에 의존하지 않고 코드로 재현 가능하게 시드를 만든다.
 * · 테이블: KnowledgeCards · Services · Projects · Scripts
 * · 보조 CTA 가 비어 있으면 라벨/카테고리에서 목적지를 추론해 되살리고,
 *   주 CTA 와 중복이면 제거(경고 출력).
 * · 출력은 id 정렬 + 안정 직렬화 → 동일 입력이면 동일 파일(해시 동일).
 * ========================================================================== */
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const require = createRequire(import.meta.url);
const KB = require("./kb.js");

const CAT_FALLBACK = {
  "인물": "index.html#about", "역량": "index.html#composite", "자격": "gallery.html#credentials",
  "프로젝트": "index.html#artifacts", "궤적": "index.html#trajectory", "미디어": "gallery.html#archive", "연락": "index.html#contact",
};
const LABEL_HINTS = [
  [/갤러리|사진|상장|원본/, "gallery.html#credentials"],
  [/경력 상세|이력|cv/i, "career.html#experience"],
  [/궤적|타임라인/, "index.html#trajectory"],
  [/작업|프로젝트|edition/i, "index.html#artifacts"],
  [/연락|이메일|문의/, "index.html#contact"],
  [/역량|도구/, "index.html#composite"],
];

const warnings = [];
function inferSecondary(card) {
  if (card.secondary && card.secondary.href) return card.secondary;
  const label = (card.secondary && card.secondary.label) || "";
  let href = null;
  for (const [re, h] of LABEL_HINTS) if (label && re.test(label)) { href = h; break; }
  if (!href) href = CAT_FALLBACK[card.cat] || null;
  if (!href) return null;
  const sec = { label: label || ({ "index.html#trajectory": "궤적 보기", "index.html#artifacts": "작업 보기", "index.html#contact": "연락하기", "gallery.html#credentials": "자격 · 상훈", "career.html#experience": "경력 상세", "index.html#composite": "역량 보기", "index.html#about": "소개", "gallery.html#archive": "갤러리" }[href] || "더 보기"), href, inferred: true };
  if (card.primary && card.primary.href === sec.href) { warnings.push(`[dup] ${card.id}: 보조 CTA(${sec.href})가 주 CTA 와 동일 → 제거`); return null; }
  return sec;
}

const cards = [...KB.cards].sort((a, b) => a.id.localeCompare(b.id)).map((c) => {
  const secondary = inferSecondary(c);
  return {
    Id: c.id, Category: c.cat, Title: c.title, Body: c.body, Tags: [...c.tags].sort().join(", "),
    PrimaryLabel: c.primary.label, PrimaryHref: c.primary.href,
    SecondaryLabel: secondary ? secondary.label : "", SecondaryHref: secondary ? secondary.href : "",
    SecondaryInferred: !!(secondary && secondary.inferred),
    Anchor: /\.html#([\w-]+)$/.test(c.primary.href) ? c.primary.href.split("#")[1] : "",
    Source: "kb.js@" + KB.version, Verified: true,
  };
});

const projects = KB.cards.filter((c) => /^ed-\d\d$/.test(c.id)).sort((a, b) => a.id.localeCompare(b.id)).map((c) => ({
  Id: c.id, Edition: c.id.slice(3), Title: c.title.replace(/^Edition \d\d — /, ""), Summary: c.body,
  Url: /^https?:/.test(c.primary.href) ? c.primary.href : "", Anchor: "ed-" + c.id.slice(3),
  Public: /^https?:/.test(c.primary.href), Tags: c.tags.join(", "),
}));

const services = KB.services.map((s) => ({
  Id: s.id, Plan: s.n, Name: s.name, Tagline: s.tagline, For: s.for,
  Deliverables: s.deliverables.join(" · "), Proof: s.proof.join(", "), CtaLabel: s.cta.label, CtaHref: s.cta.href,
}));

const scripts = [
  { Id: "consult-intro", Type: "consult", Order: 0, Text: "무료 상담 신청을 도와드리겠습니다. 세 가지만 여쭙겠습니다." },
  ...KB.consult.steps.map((s, i) => ({ Id: "consult-" + s.key, Type: "consult", Order: i + 1, Text: s.ask, Key: s.key })),
  { Id: "consult-closing", Type: "consult", Order: 90, Text: KB.consult.closing },
  { Id: "consult-fallback", Type: "consult", Order: 91, Text: KB.consult.fallbackClosing },
  { Id: "consult-triggers", Type: "consult", Order: 99, Text: KB.consult.trigger.join(", "), Key: "trigger" },
  ...KB.suggestions.map((s, i) => ({ Id: "chip-" + (i + 1), Type: "chip", Order: i + 1, Text: s.label, Key: s.query })),
];

const seed = { version: KB.version, tables: { KnowledgeCards: cards, Projects: projects, Services: services, Scripts: scripts } };
const json = JSON.stringify(seed, null, 2) + "\n";
seed.hash = createHash("sha256").update(json).digest("hex").slice(0, 16);
mkdirSync("seed", { recursive: true });
writeFileSync("seed/seed.json", JSON.stringify(seed, null, 2) + "\n");

const n = Object.entries(seed.tables).map(([k, v]) => `${k}=${v.length}`).join(" · ");
console.log(`seed/seed.json 생성 — ${n} · hash ${seed.hash}`);
if (warnings.length) { console.log(`경고 ${warnings.length}건`); warnings.forEach((w) => console.log("  " + w)); }
const inferred = cards.filter((c) => c.SecondaryInferred).length;
console.log(`보조 CTA: 명시 ${cards.filter((c) => c.SecondaryHref && !c.SecondaryInferred).length} · 추론 ${inferred} · 없음 ${cards.filter((c) => !c.SecondaryHref).length}`);
