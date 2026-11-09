/* trial-brief-domain.js — Gyunggook Trial Brief 규칙 엔진 (순수 함수 · 의존성 없음 · 브라우저와 Node 공용)
 *
 * 하는 일
 *  1) extract  — 등록된 서면의 문장에서 날짜 · 금액 · 당사자 · 증거번호를 규칙(정규식)으로 뽑고, 문서 · 쪽 · 문단 위치를 함께 남긴다
 *  2) qa       — 문서 간 날짜 · 금액 · 당사자 불일치, 증거 누락 · 미제출, 근거 없는 주장, 기한 위험, 승인 후 변경을 찾는다 (Legal Document QA)
 *  3) brief    — 위 결과와 담당자 입력으로 A4 1장 브리핑의 각 칸을 만든다. 자동 추출 · 확인 필요 · 담당자 확정을 끝까지 구분한다
 *  4) reduce   — 모든 변경을 역할 권한(can)으로 거르고 감사기록에 남긴다. 승인 뒤 자료가 바뀌면 승인을 '재검토 필요'로 되돌린다
 * 하지 않는 일 — 판결 예측 · 법률 결론 확정 · 외부 AI 호출 · 외부 전송. 출처 없는 내용을 확정으로 표시하지 않는다. */
(function (root) {
  "use strict";

  var ROLES = [
    { key: "staff", ko: "사무직원(작성)", can: ["register", "confirm", "resolve", "link", "action", "request", "note"] },
    { key: "lawyer", ko: "담당 변호사(검토 · 승인)", can: ["register", "confirm", "resolve", "link", "action", "request", "note", "approve", "revoke"] },
    { key: "viewer", ko: "열람자(읽기 전용)", can: [] },
  ];
  function can(role, act) { var r = ROLES.find(function (x) { return x.key === role; }); return !!r && r.can.indexOf(act) > -1; }

  var ITEM = { auto: "자동 추출 · 미확정", check: "확인 필요", confirmed: "담당자 확정" };
  var BRIEF = { draft: "작성 중", review: "검토 요청", approved: "변호사 승인", stale: "재검토 필요(승인 후 자료 변경)" };

  /* ---------------------------------------------------------------- 날짜 */
  function ymd(y, m, d) { return y + "-" + (m < 10 ? "0" : "") + m + "-" + (d < 10 ? "0" : "") + d; }
  function dkey(s) { return String(s).slice(0, 10); }
  function days(a, b) { return Math.round((Date.parse(dkey(b) + "T00:00:00Z") - Date.parse(dkey(a) + "T00:00:00Z")) / 86400000); }
  function ko(dateStr) { var p = dkey(dateStr).split("-"); return p[0] + ". " + (+p[1]) + ". " + (+p[2]) + "."; }
  /* 표시용 시각 — 한국 시간(KST) 'YYYY. M. D. HH:MM' */
  function kst(iso) { var d = new Date(iso); if (isNaN(d)) return String(iso); var k = new Date(d.getTime() + 9 * 3600000); return k.getUTCFullYear() + ". " + (k.getUTCMonth() + 1) + ". " + k.getUTCDate() + ". " + ("0" + k.getUTCHours()).slice(-2) + ":" + ("0" + k.getUTCMinutes()).slice(-2); }
  function won(n) { return "금 " + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "원"; }

  /* ---------------------------------------------------------------- 1. 추출 */
  var DATE_LABELS = ["누수 발견일", "사고일", "계약일", "해제 통지일", "잔금 지급일", "계약 종료일", "인도일", "보증금 반환 요구일"];
  var AMT_LABELS = ["청구금액", "수리비", "위자료", "계약금", "매매대금", "보증금", "원상복구비", "공제액"];
  var esc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); };
  var RE_DATE = new RegExp("(" + DATE_LABELS.map(esc).join("|") + ")\\s*(?:은|는|:)?\\s*(\\d{4})\\.\\s*(\\d{1,2})\\.\\s*(\\d{1,2})\\.", "g");
  var RE_AMT = new RegExp("(" + AMT_LABELS.map(esc).join("|") + ")\\s*(?:은|는|:)?\\s*금\\s*([\\d,]+)\\s*원", "g");
  var RE_PARTY = /^(원고|피고)\s*[:：]\s*(.+?)\s*$/;
  var RE_EV = /([갑을])\s*제\s*(\d+)\s*호증/g;

  function extract(doc) {
    var out = [];
    (doc.pages || []).forEach(function (pg) {
      (pg.paras || []).forEach(function (t, pi) {
        var src = { doc: doc.id, page: pg.no, para: pi + 1 }, m;
        RE_DATE.lastIndex = 0;
        while ((m = RE_DATE.exec(t))) out.push({ kind: "date", label: m[1], value: ymd(+m[2], +m[3], +m[4]), text: m[0], src: src });
        RE_AMT.lastIndex = 0;
        while ((m = RE_AMT.exec(t))) out.push({ kind: "amount", label: m[1], value: +m[2].replace(/,/g, ""), text: m[0], src: src });
        var pm = t.match(RE_PARTY);
        if (pm) out.push({ kind: "party", label: pm[1], value: pm[2], text: t, src: src });
        RE_EV.lastIndex = 0;
        while ((m = RE_EV.exec(t))) out.push({ kind: "evidence", label: m[1] + " 제" + m[2] + "호증", value: m[1] + m[2], text: m[0], src: src });
      });
    });
    out.forEach(function (f) { f.id = doc.id + "/" + f.src.page + "/" + f.src.para + "/" + f.kind + "/" + f.label + "/" + f.value; });
    return out;
  }
  function registered(c, st) { return c.documents.filter(function (d) { return isReg(c, st, d.id); }); }
  function isReg(c, st, id) { var r = st && st.reg && st.reg[c.id]; if (r && r[id] != null) return !!r[id]; var d = c.documents.find(function (x) { return x.id === id; }); return !!(d && !d.pending); }
  function docsOf(c, st) { return c.documents.concat(((st && st.extra && st.extra[c.id]) || [])); }
  function facts(c, st) {
    var all = [];
    docsOf(c, st).forEach(function (d) { if (d.extra || isReg(c, st, d.id)) all = all.concat(extract(d)); });
    return all;
  }

  /* ---------------------------------------------------------------- 2. 정합성 검수 (Legal Document QA) */
  function docById(c, st, id) { return docsOf(c, st).find(function (d) { return d.id === id; }); }
  function qa(c, st) {
    var F = facts(c, st), out = [], reg = docsOf(c, st).filter(function (d) { return d.extra || isReg(c, st, d.id); });
    var dateOf = function (f) { var d = docById(c, st, f.src.doc); return d ? d.date : ""; };
    /* 같은 이름표의 날짜 · 금액이 문서마다 다르면 — 가장 최근 서면의 값을 '최신 서면 기준'으로 따로 표시(확정은 아님) */
    ["date", "amount"].forEach(function (kind) {
      var by = {};
      F.filter(function (f) { return f.kind === kind; }).forEach(function (f) { (by[f.label] = by[f.label] || []).push(f); });
      Object.keys(by).forEach(function (label) {
        var list = by[label], vals = {};
        list.forEach(function (f) { vals[f.value] = true; });
        if (Object.keys(vals).length < 2) return;
        var latest = list.slice().sort(function (a, b) { return dateOf(b) < dateOf(a) ? -1 : dateOf(b) > dateOf(a) ? 1 : 0; })[0];
        out.push({ id: "QA-" + kind + "-" + label, rule: kind === "date" ? "R1 날짜 불일치" : "R2 금액 불일치", sev: "high", label: label,
          title: label + " — 문서마다 " + (kind === "date" ? "날짜가" : "금액이") + " 다릅니다",
          values: list.map(function (f) { return { value: f.value, show: kind === "date" ? ko(f.value) : won(f.value), src: f.src, docDate: dateOf(f), latest: f === latest }; }) });
      });
    });
    /* 당사자 표시가 사건 당사자 목록과 다르면 */
    F.filter(function (f) { return f.kind === "party"; }).forEach(function (f) {
      var ok = c.parties.some(function (p) { return p.side === f.label && p.name === f.value; });
      if (!ok) out.push({ id: "QA-party-" + f.src.doc + "-" + f.label, rule: "R3 당사자 표시 불일치", sev: "high", label: f.label,
        title: f.label + " 표시가 당사자 목록과 다릅니다", values: [{ value: f.value, show: f.value, src: f.src, docDate: dateOf(f) }],
        expect: (c.parties.find(function (p) { return p.side === f.label; }) || {}).name });
    });
    /* 증거번호 — 서면에서 인용했는데 증거 목록에 없거나, 목록에는 있으나 미제출 */
    var cited = {};
    F.filter(function (f) { return f.kind === "evidence"; }).forEach(function (f) { (cited[f.value] = cited[f.value] || []).push(f); });
    Object.keys(cited).forEach(function (no) {
      var ev = c.evidence.find(function (e) { return e.no === no; });
      var srcs = cited[no].map(function (f) { return { value: f.label, show: f.label, src: f.src, docDate: dateOf(f) }; });
      if (!ev) out.push({ id: "QA-ev-missing-" + no, rule: "R4 증거 누락", sev: "high", label: cited[no][0].label, title: cited[no][0].label + " — 서면에서 인용했지만 증거 목록에 없습니다", values: srcs });
      else if (ev.status === "unsubmitted") out.push({ id: "QA-ev-unsub-" + no, rule: "R5 증거 미제출", sev: "medium", label: ev.label, title: ev.label + " — 인용했지만 아직 제출되지 않았습니다", values: srcs });
    });
    /* 근거 없는 주장 — 쟁점의 주장에 연결된 증거가 없으면 확정하지 않는다 */
    c.issues.forEach(function (iss) {
      ["plaintiff", "defendant"].forEach(function (side) {
        var links = linksOf(c, st, iss.id, side);
        if (!links.length) out.push({ id: "QA-unsourced-" + iss.id + "-" + side, rule: "R6 근거 미연결", sev: "medium", label: iss.title,
          title: "쟁점 ‘" + iss.title + "’ — " + (side === "plaintiff" ? "원고" : "피고") + " 주장에 연결된 증거가 없습니다", values: [] });
      });
    });
    /* 기한 — 기일 전 할 일이 지났거나 2일 이내 */
    actions(c, st).forEach(function (a) {
      if (a.done) return;
      var left = days(c.now, a.due);
      if (left < 0) out.push({ id: "QA-due-" + a.id, rule: "R7 기한 경과", sev: "high", label: a.text, title: a.text + " — 기한(" + ko(a.due) + ")이 지났습니다", values: [] });
      else if (left <= 2) out.push({ id: "QA-due-" + a.id, rule: "R7 기한 임박", sev: "medium", label: a.text, title: a.text + " — 기한 " + ko(a.due) + "(D-" + left + ")", values: [] });
    });
    /* 승인 뒤 새 서면이 등록되면 */
    var ap = st && st.approval && st.approval[c.id];
    if (ap && ap.at) reg.forEach(function (d) {
      if (d.regAt && d.regAt > ap.at) out.push({ id: "QA-stale-" + d.id, rule: "R8 승인 후 변경", sev: "high", label: d.title, title: "승인 뒤 등록된 서면 — " + d.title, values: [] });
    });
    var stReg = st && st.regAt && st.regAt[c.id];
    if (ap && ap.at && stReg) Object.keys(stReg).forEach(function (id) {
      if (stReg[id] > ap.at && !out.some(function (x) { return x.id === "QA-stale-" + id; })) { var d = docById(c, st, id); out.push({ id: "QA-stale-" + id, rule: "R8 승인 후 변경", sev: "high", label: d ? d.title : id, title: "승인 뒤 등록된 서면 — " + (d ? d.title : id), values: [] }); }
    });
    return out;
  }
  function linksOf(c, st, issue, side) {
    var k = c.id + "/" + issue + "/" + side, L = st && st.links && st.links[k];
    if (L) return L;
    var iss = c.issues.find(function (x) { return x.id === issue; });
    return (iss && iss[side] && iss[side].evidence) || [];
  }
  function actions(c, st) {
    var ov = (st && st.actions && st.actions[c.id]) || {};
    var base = c.actions.map(function (a) { var o = ov[a.id] || {}; return Object.assign({}, a, o); });
    return base.concat(((st && st.newActions && st.newActions[c.id]) || []).map(function (a) { return Object.assign({}, a, ov[a.id] || {}); }));
  }

  /* ---------------------------------------------------------------- 검토 상태 */
  function resolved(c, st, fid) { var r = st && st.resolved && st.resolved[c.id + "/" + fid]; return r || null; }
  function itemState(c, st, key, hasSource) {
    var v = st && st.confirm && st.confirm[c.id + "/" + key];
    if (v) return "confirmed";
    return hasSource ? "auto" : "check";
  }
  function open(c, st) { return qa(c, st).filter(function (f) { return !resolved(c, st, f.id); }); }
  function gates(c, st) {
    var o = open(c, st), issuesOk = c.issues.every(function (i) { return itemState(c, st, "issue/" + i.id, true) === "confirmed"; });
    return [
      { k: "high", ko: "중요 검수 항목(불일치 · 누락 · 기한 경과 · 승인 후 변경)을 모두 확인 처리", ok: !o.some(function (f) { return f.sev === "high"; }) },
      { k: "issues", ko: "핵심 쟁점을 담당자가 확정", ok: issuesOk },
      { k: "hearing", ko: "기일 정보(일시 · 법정)를 담당자가 확정", ok: itemState(c, st, "hearing", true) === "confirmed" },
    ];
  }
  function status(c, st) {
    var ap = st && st.approval && st.approval[c.id];
    if (ap && ap.at) { var stale = qa(c, st).some(function (f) { return f.rule === "R8 승인 후 변경" && !resolvedAfter(c, st, f.id, ap.at); }); return stale ? "stale" : "approved"; }
    return (st && st.requested && st.requested[c.id]) ? "review" : "draft";
  }
  function resolvedAfter(c, st, fid, t) { var r = resolved(c, st, fid); return !!(r && r.at > t); }

  /* ---------------------------------------------------------------- 3. 브리핑 */
  function brief(c, st) {
    var F = facts(c, st), Q = qa(c, st), H = c.hearing;
    var amt = function (label) { var f = Q.find(function (q) { return q.label === label && q.rule === "R2 금액 불일치"; }); return f ? null : F.find(function (x) { return x.kind === "amount" && x.label === label; }); };
    var claimFact = amt("청구금액");
    return {
      status: status(c, st),
      head: { no: c.no, title: c.title, type: c.type, court: c.court, judge: c.division, hearing: H, lawyer: c.lawyer, parties: c.parties, state: itemState(c, st, "hearing", true) },
      summary: { claim: c.claim, claimFact: claimFact, overview: c.overview, facts: c.keyFacts.map(function (k, i) { return { text: k.text, src: k.src, state: itemState(c, st, "fact/" + i, !!k.src) }; }), stage: c.stage },
      issues: c.issues.slice(0, 3).map(function (i) {
        return { id: i.id, title: i.title, state: itemState(c, st, "issue/" + i.id, true),
          p: { text: i.plaintiff.text, ev: linksOf(c, st, i.id, "plaintiff") }, d: { text: i.defendant.text, ev: linksOf(c, st, i.id, "defendant") },
          unknown: i.unknown || [] };
      }),
      evidence: c.evidence.map(function (e) { return Object.assign({}, e, { flag: Q.find(function (q) { return q.id === "QA-ev-unsub-" + e.no; }) ? "미제출" : "" }); })
        .concat(Q.filter(function (q) { return q.rule === "R4 증거 누락"; }).map(function (q) { return { no: q.id.replace("QA-ev-missing-", ""), label: q.label, purpose: "서면에서 인용 — 증거 목록에 없음", status: "missing", flag: "누락" }; })),
      recent: c.recent,
      todo: actions(c, st),
      risks: Q.filter(function (q) { return !resolved(c, st, q.id); }).map(function (q) { return { id: q.id, rule: q.rule, sev: q.sev, title: q.title, values: q.values }; }),
      resolvedRisks: Q.filter(function (q) { return resolved(c, st, q.id); }).map(function (q) { return { id: q.id, rule: q.rule, title: q.title, note: resolved(c, st, q.id).note }; }),
      review: { at: (st && st.updatedAt && st.updatedAt[c.id]) || c.now, sources: registered(c, st).map(function (d) { return d.id; }).concat(((st && st.extra && st.extra[c.id]) || []).map(function (d) { return d.id; })),
        reviewer: (st && st.approval && st.approval[c.id] && st.approval[c.id].by) || "", approval: st && st.approval && st.approval[c.id] },
    };
  }

  /* ---------------------------------------------------------------- 4. 상태 변경 · 감사기록 */
  function initial() { return { v: 1, reg: {}, regAt: {}, extra: {}, confirm: {}, resolved: {}, links: {}, actions: {}, newActions: {}, requested: {}, approval: {}, updatedAt: {}, audit: [] }; }
  var ACT = { register: "register", confirm: "confirm", unconfirm: "confirm", resolve: "resolve", unresolve: "resolve", link: "link", action: "action", addAction: "action", addDoc: "register", request: "request", approve: "approve", revoke: "revoke" };
  function reduce(st0, a, now) {
    var need = ACT[a.type];
    if (!need || !can(a.role, need)) return st0; /* 권한 없는 변경은 무시 — 화면도 같은 규칙으로 버튼을 막는다 */
    var st = JSON.parse(JSON.stringify(st0)), t = now || new Date().toISOString(), c = a.case;
    var log = function (txt) { st.audit.unshift({ t: t, role: a.role, case: c, text: txt }); if (st.audit.length > 200) st.audit.length = 200; st.updatedAt[c] = t; };
    var sub = function (k) { return (st[k][c] = st[k][c] || {}); };
    switch (a.type) {
      case "register": sub("reg")[a.doc] = !!a.value; if (a.value) sub("regAt")[a.doc] = t; log("서면 " + (a.value ? "등록" : "등록 해제") + " — " + a.label); break;
      case "addDoc": (st.extra[c] = st.extra[c] || []).push({ id: "M" + ((st.extra[c].length || 0) + 1), extra: true, kind: "메모(시연 입력)", title: String(a.title || "시연 입력 문서").slice(0, 60), date: a.date || dkey(t), by: "시연 입력", regAt: t, pages: [{ no: 1, paras: String(a.text || "").slice(0, 4000).split(/\n+/).filter(Boolean) }] }); log("시연 입력 문서 추가 — " + String(a.title || "").slice(0, 40)); break;
      case "confirm": st.confirm[c + "/" + a.key] = true; log("담당자 확정 — " + a.label); break;
      case "unconfirm": delete st.confirm[c + "/" + a.key]; log("확정 해제 — " + a.label); break;
      case "resolve": if (!a.note || String(a.note).trim().length < 4) return st0; st.resolved[c + "/" + a.id] = { note: String(a.note).slice(0, 300), at: t, role: a.role }; log("검수 항목 확인 처리 — " + a.label + " · 메모: " + String(a.note).slice(0, 60)); break;
      case "unresolve": delete st.resolved[c + "/" + a.id]; log("검수 항목 확인 취소 — " + a.label); break;
      case "link": st.links[c + "/" + a.issue + "/" + a.side] = a.value.slice(); log("증거 연결 변경 — " + a.label + " → " + (a.value.join(", ") || "없음")); break;
      case "action": sub("actions")[a.id] = Object.assign({}, sub("actions")[a.id] || {}, a.patch); log("기일 준비 항목 — " + a.label + (a.patch.done != null ? (a.patch.done ? " 완료" : " 미완료") : " 수정")); break;
      case "addAction": (st.newActions[c] = st.newActions[c] || []).push({ id: "N" + ((st.newActions[c].length || 0) + 1), text: String(a.text).slice(0, 80), due: a.due, owner: a.owner || "담당자 미정", kind: "준비", done: false }); log("기일 준비 항목 추가 — " + String(a.text).slice(0, 40)); break;
      case "request": st.requested[c] = true; log("변호사 검토 요청"); break;
      case "approve": {
        if (!a.ok) return st0; /* 승인 조건(gates)을 화면과 같이 확인한 뒤에만 */
        st.approval[c] = { at: t, by: a.by || "담당 변호사(가상)" }; log("브리핑 승인 — " + (a.by || "담당 변호사(가상)")); break;
      }
      case "revoke": delete st.approval[c]; log("승인 취소"); break;
      default: return st0;
    }
    return st;
  }
  function approve(c, st, role, now, by) { return reduce(st, { type: "approve", role: role, case: c.id, ok: gates(c, st).every(function (g) { return g.ok; }) && status(c, st) !== "approved", by: by }, now); }

  /* ---------------------------------------------------------------- 데이터 불변 조건 */
  function validate(D) {
    var bad = [];
    D.cases.forEach(function (c) {
      ["no", "title", "court", "hearing", "parties", "documents", "issues", "evidence", "actions", "now"].forEach(function (k) { if (!c[k]) bad.push(c.id + " 누락 " + k); });
      if (c.issues.length > 3) bad.push(c.id + " 쟁점 3개 초과");
      if (!/가상/.test(c.no)) bad.push(c.id + " 사건번호에 '가상' 표시 없음");
      c.keyFacts.forEach(function (k) { if (k.src && !c.documents.some(function (d) { return d.id === k.src.doc && d.pages.some(function (p) { return p.no === k.src.page && p.paras.length >= k.src.para; }); })) bad.push(c.id + " 주요 사실 출처 없음 " + k.text); });
      c.issues.forEach(function (i) { ["plaintiff", "defendant"].forEach(function (s) { (i[s].evidence || []).forEach(function (no) { if (!c.evidence.some(function (e) { return e.no === no; })) bad.push(c.id + " " + i.id + " 없는 증거 " + no); }); }); });
      c.parties.forEach(function (p) { if (!/가상/.test(p.name + (p.note || ""))) bad.push(c.id + " 당사자 가상 표시 없음 " + p.name); });
    });
    return bad;
  }

  var API = { ROLES: ROLES, can: can, ITEM: ITEM, BRIEF: BRIEF, DATE_LABELS: DATE_LABELS, AMT_LABELS: AMT_LABELS, extract: extract, facts: facts, qa: qa, open: open, gates: gates, status: status, brief: brief,
    initial: initial, reduce: reduce, approve: approve, resolved: resolved, itemState: itemState, linksOf: linksOf, actions: actions, isReg: isReg, docsOf: docsOf, registered: registered, validate: validate, days: days, ko: ko, won: won, kst: kst };
  if (typeof module === "object" && module.exports) module.exports = API;
  else root.TB = API;
})(typeof window !== "undefined" ? window : this);
