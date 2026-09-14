/* ============================================================================
 * api/lead.js — 무료상담 리드 접수 (Vercel Serverless · Node 18+)
 * ----------------------------------------------------------------------------
 * POST /api/lead  { name, contact, message, need?, context?, page?, history? }
 *   → 200 { ok:true, id, notified:boolean }
 *
 * 핵심 계약: "알림 실패가 리드 저장을 막지 않는다"
 *   1) Airtable(Leads) 저장 — 실패하면 500 (리드 유실 → 프론트가 mailto 폴백)
 *   2) 알림(Slack Webhook · Resend 이메일) — 5초 타임아웃(AbortSignal), 실패해도 200 + notified:false
 *
 * 환경변수
 *   AIRTABLE_PAT, AIRTABLE_BASE_ID, AIRTABLE_LEADS_TABLE(기본 Leads)
 *   SLACK_WEBHOOK_URL (선택) · RESEND_API_KEY + LEAD_NOTIFY_TO (선택)
 * ========================================================================== */
"use strict";

var NOTIFY_TIMEOUT_MS = 5000;

function clean(s, max) { return String(s == null ? "" : s).trim().slice(0, max || 2000); }

function validate(body) {
  var b = body || {};
  var lead = {
    name: clean(b.name, 120),
    contact: clean(b.contact, 200),
    message: clean(b.message, 4000),
    need: clean(b.need, 500),
    context: clean(b.context, 1000),
    page: clean(b.page, 500),
    ua: clean(b.ua, 300),
    history: Array.isArray(b.history)
      ? b.history.slice(-10).map(function (m) { return { role: clean(m && m.role, 12), content: clean(m && m.content, 1500) }; })
      : [],
  };
  var errors = [];
  if (!lead.name) errors.push("name");
  if (!lead.contact) errors.push("contact");
  if (!lead.message && !lead.need) errors.push("message");
  return { lead: lead, errors: errors };
}

/* ---- Airtable 저장 (실제 구현) ---- */
function makeAirtableSaver(env, fetchFn) {
  var f = fetchFn || fetch;
  return function saveLead(lead) {
    if (!env.AIRTABLE_PAT || !env.AIRTABLE_BASE_ID) return Promise.reject(new Error("airtable_not_configured"));
    var table = encodeURIComponent(env.AIRTABLE_LEADS_TABLE || "Leads");
    var url = "https://api.airtable.com/v0/" + env.AIRTABLE_BASE_ID + "/" + table;
    return f(url, {
      method: "POST",
      headers: { Authorization: "Bearer " + env.AIRTABLE_PAT, "Content-Type": "application/json" },
      body: JSON.stringify({ records: [{ fields: {
        Name: lead.name, Contact: lead.contact, Message: lead.message, Need: lead.need, Context: lead.context,
        Page: lead.page, UserAgent: lead.ua, Status: "New",
        History: JSON.stringify(lead.history), ReceivedAt: new Date().toISOString(),
      } }], typecast: true }),
    }).then(function (res) {
      if (!res.ok) return res.text().then(function (t) { throw new Error("airtable_" + res.status + ": " + t.slice(0, 200)); });
      return res.json();
    }).then(function (j) { return (j.records && j.records[0] && j.records[0].id) || "unknown"; });
  };
}

/* ---- 알림 (Slack → Resend 순서로 시도, 각각 signal 존중) ---- */
function makeNotifier(env, fetchFn) {
  var f = fetchFn || fetch;
  return function notify(lead, opts) {
    var signal = opts && opts.signal;
    var text = "[포트폴리오 상담] " + lead.name + " · " + lead.contact + "\n" + (lead.message || lead.need) + "\n" + lead.page;
    if (env.SLACK_WEBHOOK_URL) {
      return f(env.SLACK_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: text }), signal: signal })
        .then(function (r) { if (!r.ok) throw new Error("slack_" + r.status); return true; });
    }
    if (env.RESEND_API_KEY && env.LEAD_NOTIFY_TO) {
      return f("https://api.resend.com/emails", {
        method: "POST", signal: signal,
        headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ from: env.LEAD_NOTIFY_FROM || "Yubin AI <onboarding@resend.dev>", to: [env.LEAD_NOTIFY_TO], subject: "[포트폴리오 상담] " + lead.name, text: text }),
      }).then(function (r) { if (!r.ok) throw new Error("resend_" + r.status); return true; });
    }
    return Promise.resolve(false); // 알림 채널 미설정 → 조용히 건너뜀
  };
}

/* 타임아웃 래퍼 — 알림이 signal 을 무시하더라도 timer 로 반드시 끊는다 */
function withTimeout(promiseFactory, ms) {
  var controller = new AbortController();
  var timer;
  var timeout = new Promise(function (_, reject) {
    timer = setTimeout(function () { controller.abort(); reject(new Error("notify_timeout")); }, ms);
  });
  var run = Promise.resolve().then(function () { return promiseFactory(controller.signal); });
  return Promise.race([run, timeout]).finally(function () { clearTimeout(timer); });
}

/* ---- 순수 핸들러 (테스트 가능) ---- */
function handleLead(body, deps) {
  deps = deps || {};
  var v = validate(body);
  if (v.errors.length) return Promise.resolve({ status: 400, json: { ok: false, error: "invalid", fields: v.errors } });
  var save = deps.saveLead;
  var notify = deps.notify;
  var timeoutMs = deps.notifyTimeoutMs || NOTIFY_TIMEOUT_MS;
  return save(v.lead).then(function (id) {
    return withTimeout(function (signal) { return notify(v.lead, { signal: signal }); }, timeoutMs)
      .then(function (r) { return { status: 200, json: { ok: true, id: id, notified: r !== false } }; },
            function (e) { return { status: 200, json: { ok: true, id: id, notified: false, notifyError: String(e && e.message || e) } }; });
  }, function (e) {
    return { status: 500, json: { ok: false, error: "save_failed", detail: String(e && e.message || e) } };
  });
}

/* ---- Vercel 엔트리 ---- */
function readJson(req) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  return new Promise(function (resolve) {
    var data = "";
    req.on("data", function (c) { data += c; });
    req.on("end", function () { try { resolve(JSON.parse(data || "{}")); } catch (e) { resolve({}); } });
  });
}
function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.statusCode = 204; return res.end(); }
  if (req.method !== "POST") { res.statusCode = 405; return res.end(JSON.stringify({ ok: false, error: "method" })); }
  return readJson(req).then(function (body) {
    return handleLead(body, { saveLead: makeAirtableSaver(process.env), notify: makeNotifier(process.env) });
  }).then(function (out) {
    res.statusCode = out.status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(out.json));
  }).catch(function (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: "unexpected", detail: String(e && e.message || e) }));
  });
}

module.exports = handler;
module.exports.handleLead = handleLead;
module.exports.validate = validate;
module.exports.withTimeout = withTimeout;
module.exports.makeAirtableSaver = makeAirtableSaver;
module.exports.makeNotifier = makeNotifier;
