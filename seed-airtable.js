#!/usr/bin/env node
/* ============================================================================
 * seed-airtable.js — seed/seed.json → Airtable 적재 (upsert by Id)
 * ----------------------------------------------------------------------------
 * 사용: AIRTABLE_PAT=pat... AIRTABLE_BASE_ID=app... node seed-airtable.js [--dry-run] [--table=KnowledgeCards]
 *  · 10건 배치 · performUpsert(fieldsToMergeOn: ["Id"]) · typecast
 *  · --dry-run: 요청 본문만 출력, 네트워크 호출 없음
 *  · 403 이면 PAT 스코프(data.records:write · schema.bases:read) 와 베이스 접근 권한 안내
 * 테이블 스키마(필드는 최초 1회 수동 생성 또는 typecast 로 자동 생성):
 *  KnowledgeCards: Id, Category, Title, Body, Tags, PrimaryLabel, PrimaryHref, SecondaryLabel, SecondaryHref, SecondaryInferred, Anchor, Source, Verified
 *  Projects:       Id, Edition, Title, Summary, Url, Anchor, Public, Tags
 *  Services:       Id, Plan, Name, Tagline, For, Deliverables, Proof, CtaLabel, CtaHref
 *  Scripts:        Id, Type, Order, Text, Key
 *  Leads(런타임):  Name, Contact, Message, Need, Context, Page, UserAgent, Status, History, ReceivedAt
 * ========================================================================== */
"use strict";
const fs = require("node:fs");

const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const ONLY = (args.find((a) => a.startsWith("--table=")) || "").split("=")[1];
const PAT = process.env.AIRTABLE_PAT;
const BASE = process.env.AIRTABLE_BASE_ID;

if (!fs.existsSync("seed/seed.json")) { console.error("seed/seed.json 이 없습니다. 먼저 `npm run seed:build`"); process.exit(1); }
const seed = JSON.parse(fs.readFileSync("seed/seed.json", "utf8"));

if (!DRY && (!PAT || !BASE)) {
  console.error("AIRTABLE_PAT / AIRTABLE_BASE_ID 환경변수가 필요합니다. (--dry-run 으로 본문만 확인 가능)");
  process.exit(1);
}

const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function upsert(table, records) {
  const url = `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}`;
  let done = 0;
  for (const batch of chunk(records, 10)) {
    const body = { performUpsert: { fieldsToMergeOn: ["Id"] }, typecast: true, records: batch.map((fields) => ({ fields })) };
    if (DRY) { console.log(`[dry] PATCH ${table} ×${batch.length}`); console.log(JSON.stringify(body).slice(0, 400) + "…"); done += batch.length; continue; }
    const res = await fetch(url, { method: "PATCH", headers: { Authorization: `Bearer ${PAT}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.status === 429) { await sleep(1200); return upsert(table, records.slice(done)); }
    if (!res.ok) {
      const txt = await res.text();
      if (res.status === 403) {
        console.error(`\n403 Forbidden — ${table}\n  · PAT 스코프에 data.records:write 가 있는지\n  · PAT 의 접근 베이스에 ${BASE} 가 포함됐는지\n  · 테이블명 "${table}" 이 정확한지 확인하세요.\n  응답: ${txt.slice(0, 300)}`);
      } else if (res.status === 422) {
        console.error(`\n422 — 필드 불일치. 테이블 "${table}" 에 위 스키마 필드가 있는지 확인하세요 (typecast 로도 생성되지 않는 필드 타입일 수 있음).\n  응답: ${txt.slice(0, 300)}`);
      } else {
        console.error(`\n${res.status} — ${txt.slice(0, 300)}`);
      }
      process.exit(2);
    }
    done += batch.length;
    process.stdout.write(`  ${table}: ${done}/${records.length}\r`);
    await sleep(220); // 5 req/s 제한
  }
  console.log(`  ${table}: ${done}/${records.length} 완료`);
}

(async () => {
  console.log(`seed v${seed.version} (hash ${seed.hash}) → base ${BASE || "(dry)"}${DRY ? " [DRY-RUN]" : ""}`);
  for (const [table, records] of Object.entries(seed.tables)) {
    if (ONLY && ONLY !== table) continue;
    await upsert(table, records);
  }
  console.log("완료.");
})().catch((e) => { console.error(e); process.exit(1); });
