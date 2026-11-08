/* legal-ax-domain.js — 법률 AX 업무체계의 규칙 (순수 함수 · 브라우저와 node 테스트가 같은 코드를 쓴다)
 * 처리 방식은 세 가지뿐이다 — 이 시연에는 AI 모델 호출이 없다.
 *   RULE      규칙 기반 분석 (Rule-based)        정렬 · 타임라인 · 문자 비교 · 정해진 규칙의 충족 여부
 *   RETRIEVAL 문서 검색 · 근거 탐색 (Evidence Retrieval)  색인된 예시자료에서 찾아 원문 위치로 연결
 * 법적 판단(사실인정 · 위법성 · 승패)은 계산하지 않는다. '추가 검토 필요'는 사람이 다시 보라는 표시다. */
(function (root) {
  "use strict";
  var METHOD = {
    RULE: { key: "rule", ko: "규칙 기반 분석", en: "Rule-based" },
    RETRIEVAL: { key: "retrieval", ko: "문서 검색 · 근거 탐색", en: "Evidence Retrieval" },
  };
  var STATUS = [
    { key: "unreviewed", ko: "미검토" },
    { key: "needs_check", ko: "검토 필요" },
    { key: "reviewed", ko: "검토 완료" },
    { key: "approved", ko: "변호사 승인(시연)" },
  ];
  var VERIFY = { asserted: "주장만 있음", supported: "자료와 일치", disputed: "다툼 있음" };

  /* ------------------------------------------------------------ 불변 조건 — 깨지면 목록을 돌려준다 */
  function validate(D) {
    var bad = [], fieldIds = {}, contractIds = {}, sourceIds = {};
    D.fields.forEach(function (f) { fieldIds[f.id] = 1; });
    D.contracts.forEach(function (c) { contractIds[c.id] = 1; });
    D.sources.forEach(function (s) { sourceIds[s.id] = 1; if (!/^https:\/\//.test(s.url)) bad.push("source url " + s.id); if (s.verbatim && !s.text.length) bad.push("verbatim without text " + s.id); });
    D.fields.forEach(function (f) {
      if (!D.cases.some(function (c) { return c.id === f.caseId && c.field === f.id; })) bad.push("field without case " + f.id);
      [f.contract, f.contract2].forEach(function (k) { if (k && !contractIds[k]) bad.push("field contract " + f.id + "→" + k); });
    });
    var seenCase = {};
    D.cases.forEach(function (c) {
      if (seenCase[c.id]) bad.push("dup case " + c.id); seenCase[c.id] = 1;
      if (!fieldIds[c.field]) bad.push("case field " + c.id);
      var doc = {}, ev = {}, iss = {}, party = {};
      c.participants.forEach(function (p) { party[p.id] = 1; });
      c.documents.forEach(function (d) { doc[d.id] = d; if (!d.paras.length) bad.push("empty doc " + c.id + "/" + d.id); if (!party[d.by]) bad.push("doc author " + c.id + "/" + d.id); });
      c.issues.forEach(function (i) { iss[i.id] = 1; if (!statusKey(i.status)) bad.push("issue status " + c.id + "/" + i.id); });
      c.evidence.forEach(function (e) {
        ev[e.id] = 1;
        var d = doc[e.doc];
        if (!d) bad.push("evidence → missing doc " + c.id + "/" + e.id);
        else if (!(e.loc && e.loc.para >= 1 && e.loc.para <= d.paras.length)) bad.push("evidence → missing paragraph " + c.id + "/" + e.id);
      });
      c.claims.forEach(function (cl) {
        if (!iss[cl.issue]) bad.push("claim issue " + c.id + "/" + cl.id);
        if (!party[cl.party]) bad.push("claim party " + c.id + "/" + cl.id);
        if (!VERIFY[cl.verification]) bad.push("claim verification " + c.id + "/" + cl.id);
        cl.evidence.forEach(function (x) { if (!ev[x]) bad.push("claim → missing evidence " + c.id + "/" + cl.id + "→" + x); });
      });
      c.events.forEach(function (e) { e.evidence.forEach(function (x) { if (!ev[x]) bad.push("event evidence " + c.id + "/" + e.id); }); });
      c.tasks.forEach(function (t) { if (!iss[t.issue]) bad.push("task issue " + c.id + "/" + t.id); });
      (c.research || []).forEach(function (r) { if (!sourceIds[r]) bad.push("research source " + c.id + "→" + r); });
      (c.matter.deadlines || []).forEach(function (dl) { (dl.basis || []).forEach(function (b) { if (!sourceIds[b]) bad.push("deadline basis " + c.id + "→" + b); }); });
      if (!c.evidence.length || !c.documents.length) bad.push("case without navigable source " + c.id);
    });
    D.contracts.forEach(function (k) {
      [k.a, k.b].forEach(function (v) { var seen = {}; v.forEach(function (cl) { if (seen[cl.key]) bad.push("dup clause " + k.id + "/" + cl.key); seen[cl.key] = 1; }); });
    });
    return bad;
  }
  function statusKey(k) { return STATUS.some(function (s) { return s.key === k; }); }

  /* ------------------------------------------------------------ 주장 · 자료 대조 — 같은 쟁점에 묶인 자료의 기재(record)와 주장한 사실(facts)을 맞대어 본다 */
  function consistency(c) {
    var byId = {}; c.evidence.forEach(function (e) { byId[e.id] = e; });
    var out = [];
    c.claims.forEach(function (cl) {
      var keys = Object.keys(cl.facts || {});
      if (!keys.length) { out.push({ claim: cl.id, state: "no_rule", ko: "대조할 기재 없음 — 주장만 있음", evidence: [] }); return; }
      var pool = {};
      c.claims.filter(function (o) { return o.issue === cl.issue; }).forEach(function (o) { o.evidence.forEach(function (x) { pool[x] = 1; }); });
      var hits = [], same = [];
      Object.keys(pool).forEach(function (x) {
        var e = byId[x]; if (!e || !e.record) return;
        keys.forEach(function (k) {
          if (!(k in e.record)) return;
          if (String(e.record[k]) !== String(cl.facts[k])) hits.push({ evidence: x, key: k, claimed: cl.facts[k], recorded: e.record[k] });
          else same.push({ evidence: x, key: k });
        });
      });
      if (hits.length) out.push({ claim: cl.id, state: "needs_check", ko: "추가 검토 필요 — 주장과 자료의 기재가 다릅니다", hits: hits, evidence: hits.map(function (h) { return h.evidence; }) });
      else if (same.length) out.push({ claim: cl.id, state: "matches", ko: "자료 기재와 일치 — 사실인정은 별도", evidence: same.map(function (h) { return h.evidence; }) });
      else out.push({ claim: cl.id, state: "no_record", ko: "대조할 자료 기재 없음", evidence: [] });
    });
    return out;
  }

  /* 시간순 — '2026-05-01 22:35' · '2020-10' 같은 서로 다른 정밀도를 문자열로 정렬해도 어긋나지 않게 맞춘다 */
  function timeline(c) {
    return c.events.slice().sort(function (a, b) { return pad(a.date) < pad(b.date) ? -1 : pad(a.date) > pad(b.date) ? 1 : 0; });
  }
  function pad(d) { var s = String(d); if (/^\d{4}$/.test(s)) s += "-00"; if (/^\d{4}-\d{2}$/.test(s)) s += "-00"; if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += " 00:00"; return s; }

  function docFilter(c, q, type) {
    q = (q || "").trim().toLowerCase();
    return c.documents.filter(function (d) {
      if (type && type !== "all" && d.type !== type) return false;
      if (!q) return true;
      return (d.title + " " + d.paras.join(" ")).toLowerCase().indexOf(q) > -1;
    });
  }

  /* ------------------------------------------------------------ 계약 비교 — 조항 key 로 맞추고, 바뀐 조항은 낱말 단위 LCS 로 표시 */
  var CATS = {
    payment: "대금 · 지급조건", term: "계약기간 · 기한", termination: "해제 · 해지 · 종료", damages: "손해배상",
    liability: "책임 제한 · 부담", confidentiality: "비밀유지", jurisdiction: "관할 · 분쟁해결",
  };
  function tokens(s) { return String(s).split(/(\s+)/).filter(function (t) { return t.length; }); }
  function wordDiff(a, b) {
    var A = tokens(a), B = tokens(b), n = A.length, m = B.length, i, j;
    var L = []; for (i = 0; i <= n; i++) { L.push(new Array(m + 1).fill(0)); }
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    var out = []; i = 0; j = 0;
    while (i < n && j < m) {
      if (A[i] === B[j]) { out.push({ op: "same", t: A[i] }); i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) { out.push({ op: "del", t: A[i] }); i++; }
      else { out.push({ op: "add", t: B[j] }); j++; }
    }
    while (i < n) out.push({ op: "del", t: A[i++] });
    while (j < m) out.push({ op: "add", t: B[j++] });
    /* 이웃한 같은 종류를 묶는다 */
    var merged = [];
    out.forEach(function (o) { var last = merged[merged.length - 1]; if (last && last.op === o.op) last.t += o.t; else merged.push({ op: o.op, t: o.t }); });
    return merged;
  }
  function diffContract(k) {
    var bm = {}; k.b.forEach(function (c) { bm[c.key] = c; });
    var am = {}; k.a.forEach(function (c) { am[c.key] = c; });
    var rows = [];
    k.a.forEach(function (c) {
      var nb = bm[c.key];
      if (!nb) rows.push({ key: c.key, op: "removed", before: c, after: null, parts: [{ op: "del", t: c.text }] });
      else if (nb.text === c.text) rows.push({ key: c.key, op: "same", before: c, after: nb, parts: [{ op: "same", t: c.text }] });
      else rows.push({ key: c.key, op: "modified", before: c, after: nb, parts: wordDiff(c.text, nb.text) });
    });
    k.b.forEach(function (c, idx) {
      if (am[c.key]) return;
      /* 새 조항은 바로 앞 조항 뒤에 끼운다 */
      var prev = idx > 0 ? k.b[idx - 1].key : null, at = prev ? rows.findIndex(function (r) { return r.key === prev; }) + 1 : 0;
      rows.splice(at, 0, { key: c.key, op: "added", before: null, after: c, parts: [{ op: "add", t: c.text }] });
    });
    rows.forEach(function (r) { r.flags = flagRow(r); r.important = r.op !== "same" && r.flags.length > 0; });
    return rows;
  }
  /* '중요 조항' 규칙 — 어느 규칙이 걸렸는지 그대로 보여 준다(점수 · 위험도 없음) */
  function flagRow(r) {
    var c = r.after || r.before, tags = (c.tags || []).slice(), flags = [];
    tags.forEach(function (t) { if (CATS[t]) flags.push({ rule: "cat:" + t, ko: "특별 검토 항목 — " + CATS[t] }); });
    var txt = (r.before ? r.before.text : "") + " " + (r.after ? r.after.text : "");
    var nums = function (s) { return (String(s || "").match(/\d[\d,.]*/g) || []).join("|"); };
    if (r.op === "modified" && nums(r.before.text) !== nums(r.after.text)) flags.push({ rule: "num", ko: "숫자(금액 · 기간 · 비율)가 바뀜" });
    if (r.op === "modified" && r.before && r.after && /수급인|도급인|갑|을|임|신/.test(txt)) {
      var who = function (s) { return (String(s).match(/(수급인|도급인)/g) || []).join("|"); };
      if (who(r.before.text) !== who(r.after.text)) flags.push({ rule: "party", ko: "부담 · 의무 주체 표기가 바뀜" });
    }
    if (r.op === "added") flags.push({ rule: "added", ko: "새로 생긴 조항" });
    if (r.op === "removed") flags.push({ rule: "removed", ko: "삭제된 조항" });
    return flags;
  }

  /* ------------------------------------------------------------ 리서치 — 색인된 예시자료만 찾는다(실시간 법률 검색 아님) */
  function search(D, q, type, caseObj) {
    q = (q || "").trim().toLowerCase();
    var res = [];
    D.sources.forEach(function (s) {
      if (type && type !== "all" && s.type !== type) return;
      var hay = (s.law + " " + s.article + " " + s.title + " " + s.summary + " " + s.text.join(" ") + " " + s.tags.join(" ")).toLowerCase();
      if (!q || hay.indexOf(q) > -1) res.push({ kind: "source", id: s.id, s: s });
    });
    if (caseObj && (!type || type === "all" || type === "doc")) caseObj.documents.forEach(function (d) {
      d.paras.forEach(function (p, i) {
        if (q && (d.title + " " + p).toLowerCase().indexOf(q) > -1) res.push({ kind: "doc", id: caseObj.id + "/" + d.id + "/" + (i + 1), doc: d, para: i + 1, text: p });
      });
    });
    return res;
  }

  /* ------------------------------------------------------------ 기한 — 단순 달력 계산(초일 불산입 · 말일 토/일 → 다음 평일)만 한다.
   * 공휴일 · 송달 효력 · 기간의 성격은 계산하지 않는다 — 결과는 언제나 '확인 필요' */
  function addDays(iso, n) { var d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d; }
  function fmt(d) { return d.toISOString().slice(0, 10); }
  function deadline(base, days) {
    var end = addDays(base, days), notes = ["초일 불산입(민법 제157조)으로 단순 계산"];
    var dow = end.getUTCDay();
    if (dow === 6 || dow === 0) { var shifted = addDays(fmt(end), dow === 6 ? 2 : 1); notes.push("말일이 " + (dow === 6 ? "토" : "일") + "요일 → " + fmt(shifted) + "로 순연(민법 제161조)"); end = shifted; }
    notes.push("공휴일 · 송달 시점 · 기간의 종류는 반영하지 않음");
    return { date: fmt(end), notes: notes, needsReview: true, ko: "시연용 일정 — 법정기간은 담당 변호사의 별도 확인이 필요합니다." };
  }

  /* ------------------------------------------------------------ 상태 — 모든 변경은 시연 기록(audit)에 남는다 */
  var ACTOR = "시연 사용자 · 가상 역할(담당 변호사)";
  function initial(D) {
    var st = { v: 1, issues: {}, evidence: {}, notes: {}, clauses: {}, clauseNotes: {}, matters: {}, finals: {}, audit: [] };
    D.cases.forEach(function (c) {
      c.issues.forEach(function (i) { st.issues[c.id + "/" + i.id] = i.status; });
      c.tasks.forEach(function (t) { st.issues[c.id + "/" + t.id] = t.status; });
      st.matters[c.id] = { stage: c.matter.stage, assignee: c.matter.assignee, docs: c.matter.docs.map(function (d) { return !!d[1]; }), deadlineChecked: {}, conflict: "needs_check" };
    });
    return st;
  }
  function reduce(st, a, now) {
    var s = JSON.parse(JSON.stringify(st)), t = now || new Date().toISOString(), log = function (txt) { s.audit.unshift({ t: t, actor: ACTOR, case: a.case || "", text: txt }); if (s.audit.length > 120) s.audit.length = 120; };
    switch (a.type) {
      case "status": if (!statusKey(a.value)) return st; s.issues[a.key] = a.value; log(a.label + " → " + label(a.value)); break;
      case "evidence": if (!statusKey(a.value)) return st; s.evidence[a.key] = a.value; log("증거 " + a.label + " → " + label(a.value)); break;
      case "note": s.notes[a.key] = String(a.value).slice(0, 600); log("검토 메모 저장 — " + a.label); break;
      case "clause": if (!statusKey(a.value)) return st; s.clauses[a.key] = a.value; log("계약 " + a.label + " → " + label(a.value)); break;
      case "clauseNote": s.clauseNotes[a.key] = String(a.value).slice(0, 600); log("계약 메모 저장 — " + a.label); break;
      case "stage": s.matters[a.key].stage = Math.max(0, Math.min(6, a.value)); log("사건 단계 → " + a.stageName); break;
      case "assignee": s.matters[a.key].assignee = a.value; log("담당자 지정 → " + a.value); break;
      case "doc": s.matters[a.key].docs[a.index] = !!a.value; log("서류 " + a.label + " → " + (a.value ? "보유" : "누락")); break;
      case "deadline": s.matters[a.key].deadlineChecked[a.id] = !!a.value; log("기한 " + a.label + (a.value ? " — 기산점 확인 표시" : " — 확인 표시 해제")); break;
      case "conflict": s.matters[a.key].conflict = a.value; log("이해충돌 검토 → " + (a.value === "reviewed" ? "담당자 확인 표시" : "검토 필요")); break;
      case "final": s.finals[a.key] = !!a.value; log("최종 확인(시연) " + (a.value ? "표시" : "해제") + " — " + a.label); break;
      default: return st;
    }
    return s;
  }
  function label(k) { var x = STATUS.find(function (s) { return s.key === k; }); return x ? x.ko : k; }
  /* 최종 확인은 모든 쟁점이 '검토 완료' 이상일 때만 */
  function canFinalize(c, st) { return c.issues.every(function (i) { var v = st.issues[c.id + "/" + i.id]; return v === "reviewed" || v === "approved"; }); }

  var API = { METHOD: METHOD, STATUS: STATUS, VERIFY: VERIFY, CATS: CATS, validate: validate, consistency: consistency, timeline: timeline, docFilter: docFilter,
    wordDiff: wordDiff, diffContract: diffContract, search: search, deadline: deadline, initial: initial, reduce: reduce, label: label, canFinalize: canFinalize, ACTOR: ACTOR };
  if (typeof module === "object" && module.exports) module.exports = API;
  else root.LAX = API;
})(typeof window !== "undefined" ? window : this);
