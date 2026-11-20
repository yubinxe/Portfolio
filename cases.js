/* cases.js — 사례집 상호작용. 화면은 빌드가 미리 그렸고(cases.html), 여기서는 시연 상태만 바꿔 다시 그린다.
 * 상태는 메모리에만 둔다(저장소 · 쿠키 · 외부 전송 없음). 움직임 줄이기면 단계 진행 애니메이션을 생략한다. */
(function () {
  var R = window.CASES_RENDER; if (!R) return;
  var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var S = { bid: { type: "", service: "설계", pick: null }, comp: { step: 3 }, law: { id: "L1" }, quorum: Object.assign({}, R.QDEF, { have: R.QDEF.have.slice() }), contract: { k: 0, stage: 0, notes: [] }, batch: { done: 0 } };
  var DRAW = { bid: R.demoBid, comp: R.demoComp, law: R.demoLaw, quorum: R.demoQuorum, contract: R.demoContract, batch: R.demoBatch };
  /* 다시 그리는 동안 입력칸이 빠지면 blur → change 가 한 번 더 온다. 그리는 중에는 다시 들어오지 않는다 */
  var busy = false;
  function draw(k, focusSel) {
    if (busy) return;
    var el = document.querySelector('[data-demo="' + k + '"]'); if (!el || !el.parentNode) return;
    busy = true;
    try {
      var w = document.createElement("div"); w.innerHTML = DRAW[k](S[k]); var n = w.firstChild; el.parentNode.replaceChild(n, el);
      if (focusSel) { var f = n.querySelector(focusSel); if (f) f.focus(); }
    } finally { busy = false; }
  }
  document.documentElement.classList.add("cs-js");

  document.addEventListener("change", function (e) {
    var t = e.target; if (busy || !t.isConnected) return;
    if (t.matches("[data-bid]")) { S.bid[t.getAttribute("data-bid")] = t.value; S.bid.pick = null; draw("bid", '[data-bid="' + t.getAttribute("data-bid") + '"]'); }
    else if (t.matches("[data-q]")) { var k = t.getAttribute("data-q"); S.quorum[k] = k === "yesq" ? t.value : Math.max(0, Math.min(5000, parseInt(t.value, 10) || 0)); draw("quorum", '[data-q="' + k + '"]'); }
    else if (t.matches("[data-qdoc]")) { S.quorum.have[+t.getAttribute("data-qdoc")] = t.checked ? 1 : 0; draw("quorum", '[data-qdoc="' + t.getAttribute("data-qdoc") + '"]'); }
  });
  document.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.hasAttribute("data-bid-pick")) { S.bid.pick = b.getAttribute("data-bid-pick"); draw("bid", '[data-bid-pick="' + S.bid.pick + '"]'); }
    else if (b.hasAttribute("data-bid-print")) { document.body.classList.add("cs-print-bid"); window.print(); setTimeout(function () { document.body.classList.remove("cs-print-bid"); }, 400); }
    else if (b.hasAttribute("data-comp")) { S.comp.step = +b.getAttribute("data-comp"); draw("comp", '[data-comp="' + S.comp.step + '"]'); }
    else if (b.hasAttribute("data-law")) { S.law.id = b.getAttribute("data-law"); draw("law", '[data-law="' + S.law.id + '"]'); }
    else if (b.hasAttribute("data-ct")) { S.contract.k = +b.getAttribute("data-ct"); draw("contract", '[data-ct="' + S.contract.k + '"]'); }
    else if (b.hasAttribute("data-ct-add")) {
      var ta = document.querySelector("[data-ct-note]"), v = ta && ta.value.trim();
      if (!v) { if (ta) ta.focus(); return; }
      S.contract.notes.push("검토 의견 · " + v); S.contract.stage = 1; draw("contract", "[data-ct-ok]");
    } else if (b.hasAttribute("data-ct-ok")) { S.contract.notes.push("승인 · 시연 기록"); S.contract.stage = 2; draw("contract"); }
    else if (b.hasAttribute("data-batch-run")) {
      S.batch.done = 0; draw("batch", "[data-batch-run]");
      var step = function () { S.batch.done++; draw("batch", "[data-batch-run]"); if (S.batch.done < 8) setTimeout(step, calm ? 0 : 260); };
      if (calm) { S.batch.done = 8; draw("batch", "[data-batch-run]"); } else setTimeout(step, 200);
    } else if (b.hasAttribute("data-ba-k")) {
      var box = b.closest("[data-ba]"), k = b.getAttribute("data-ba-k");
      box.setAttribute("data-show", k);
      box.querySelectorAll("[data-ba-k]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    }
  });
  /* 비교 상자 — JS 가 있으면 한쪽씩(기본: 기존 업무), 없으면 둘 다 보인다 */
  document.querySelectorAll("[data-ba]").forEach(function (x) { x.setAttribute("data-show", "0"); });

  /* 스크롤 연동 — 지금 읽는 사례를 목차에 표시하고, AI 전환 단계를 차례로 밝힌다 */
  if ("IntersectionObserver" in window) {
    var links = {}; document.querySelectorAll(".cs-index a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { var a = links[en.target.id]; if (a && en.isIntersecting) { Object.keys(links).forEach(function (k) { links[k].removeAttribute("aria-current"); }); a.setAttribute("aria-current", "true"); } });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll(".cs-case").forEach(function (c) { io.observe(c); });
    var io2 = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) en.target.classList.add("is-on"); }); }, { rootMargin: "0px 0px -20% 0px" });
    document.querySelectorAll("[data-tl]").forEach(function (li) { if (calm) li.classList.add("is-on"); else io2.observe(li); });
  } else document.querySelectorAll("[data-tl]").forEach(function (li) { li.classList.add("is-on"); });
})();
