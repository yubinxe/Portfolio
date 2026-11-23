/* i18n.js — 한국어 / English 전환 (모든 페이지 · ax 앱 공통, head 에서 바로 실행)
 *
 * · 선택은 localStorage "yk.lang"(ko | en) — 주소의 ?lang=en|ko 가 있으면 그것을 따른다.
 * · EN 이면 영문 사전(i18n-en.js · window.YK_EN = { "한국어 원문": "English" })을 그때만 불러,
 *   화면의 텍스트 노드와 속성(aria-label · alt · title · placeholder · meta content)을 원문 그대로 맞춰 바꾼다.
 *   React 가 나중에 그리는 글자도 MutationObserver 로 따라가 바꾼다(사전에 없는 글은 한국어로 남는다).
 * · index 는 React 가 미리 그린 DOM 을 이어받은(hydrate) 뒤에만 바꾼다 — html[data-app="ready"].
 * · polish.js 의 단어 쪼개기 · 롤링 효과는 window.ykI18n.ready 뒤에 시작한다(번역 전에 쪼개면 맞출 수 없다).
 * · KO 로 돌아갈 때는 새로고침 — 바꾼 글자를 되돌리느라 React 와 다투지 않는다.
 * · 입력칸 값 · contenteditable · 코드는 건드리지 않는다.
 * 사전 원천: i18n/en.json → scripts/build-i18n.mjs → i18n-en.js */
(function () {
  "use strict";
  var W = window, D = document, H = D.documentElement, KEY = "yk.lang";
  var me = D.currentScript;
  var base = me && me.src ? me.src.replace(/i18n\.js(\?.*)?$/, "") : "";
  var lang = "ko";
  try { lang = localStorage.getItem(KEY) === "en" ? "en" : "ko"; } catch (e) {}
  var q = /[?&]lang=(en|ko)\b/.exec(location.search);
  if (q) { lang = q[1]; try { localStorage.setItem(KEY, lang); } catch (e) {} }

  /* 스위치 · 대기 화면 스타일 — 페이지 CSS 를 고치지 않고 여기서 */
  var css = D.createElement("style");
  css.textContent =
    "html.yk-en:not(.yk-en-done) body{opacity:0}html.yk-en.yk-en-done body{transition:opacity .35s ease}" +
    ".yk-lang{display:inline-flex;align-items:center;flex:none;height:28px;padding:2px;margin:0 2px;border:1px solid rgba(19,40,75,.28);border-radius:999px;background:rgba(255,255,255,.7);cursor:pointer;font:600 11px/1 Inter,'Pretendard Variable',system-ui,sans-serif;letter-spacing:.08em;color:#13284B;vertical-align:middle}" +
    ".yk-lang span{display:grid;place-items:center;min-width:24px;height:22px;padding:0 5px;border-radius:999px;transition:background .3s,color .3s}" +
    ".yk-lang span.is-on{background:#13284B;color:#F7F4EE}.yk-lang:hover{border-color:#13284B}.yk-lang:focus-visible{outline:3px solid #8FB8F2;outline-offset:2px}" +
    ".yk-lang--float{position:fixed;top:12px;right:12px;z-index:9000}" +
    /* 영문은 메뉴 글이 길다 — 이름 밑줄 문구를 접고 간격을 줄여 한 줄에 맞춘다 */
    "@media (min-width:1181px){html.yk-en .hnav__name small{display:none}html.yk-en header .nav-desktop{gap:clamp(8px,.95vw,16px)!important;font-size:.82rem!important}}" +
    "@media (min-width:1181px) and (max-width:1500px){header.hnav .nav-desktop{gap:clamp(8px,1.05vw,20px)!important}}" +
    "@media (max-width:1366px){html.yk-en .hnav__admin{display:none}}" +
    "@media (min-width:1181px) and (max-width:1300px){.hnav__name small{display:none}}" +
    "@media (max-width:560px){body > header .sticker{display:none!important}html.yk-en body > header nav > .btn{letter-spacing:.04em!important;padding:0 .7em!important;font-size:.72rem!important}}" +
    "@media print{.yk-lang{display:none!important}}";
  (D.head || H).appendChild(css);

  var DICT = null;
  var ready;
  if (lang !== "en") ready = Promise.resolve();
  else {
    H.classList.add("yk-en");
    H.setAttribute("lang", "en");
    ready = new Promise(function (res) {
      var done = false;
      function fin() { if (done) return; done = true; H.classList.add("yk-en-done"); res(); }
      setTimeout(fin, 4000); /* 안전장치 — 사전이 늦어도 화면은 보인다 */
      var s = D.createElement("script");
      s.src = base + "i18n-en.js?v=1";
      s.onload = function () { DICT = W.YK_EN || null; whenDom(function () { whenApp(function () { if (DICT) { run(D); watch(); } fin(); }); }); };
      s.onerror = fin;
      (D.head || H).appendChild(s);
    });
  }

  function whenDom(fn) { if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", fn, { once: true }); else fn(); }
  function whenApp(fn) {
    var r = D.getElementById("root");
    var react = D.querySelector('script[src*="dist/sections.js"]');
    if (!r || !react || H.getAttribute("data-app") === "ready") return fn();
    var t = setTimeout(go, 3000), done = false;
    function go() { if (done) return; done = true; clearTimeout(t); mo.disconnect(); fn(); }
    var mo = new MutationObserver(function () { if (H.getAttribute("data-app") === "ready") go(); });
    mo.observe(H, { attributes: true, attributeFilter: ["data-app"] });
  }

  /* ---------- 바꾸기 ---------- */
  var HAN = /[가-힣]/;
  var RULES = [
    [/^(.+) — 사이트 안 창$/, function (m) { return tr(m[1]) + " — in-site window"; }],
    [/^([\d,.]+)\s*건$/, function (m) { return m[1]; }],
    [/^([\d,.]+)\s*개$/, function (m) { return m[1]; }],
  ];
  function tr(t) {
    if (!DICT) return t;
    var v = DICT[t];
    if (v !== undefined) return v;
    for (var i = 0; i < RULES.length; i++) { var m = RULES[i][0].exec(t); if (m) return RULES[i][1](m); }
    return t;
  }
  function skip(el) {
    if (!el) return true;
    var tag = el.tagName;
    return tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT" || tag === "TEXTAREA" || tag === "CODE" || tag === "PRE" || (el.isContentEditable === true);
  }
  function textNode(n) {
    var v = n.nodeValue;
    if (!v || !HAN.test(v) || skip(n.parentElement)) return;
    var t = v.replace(/\s+/g, " ").trim();
    var out = tr(t);
    if (out === t) return;
    var pe = n.parentElement;
    if (pe && pe.tagName === "OPTION" && !pe.hasAttribute("value")) pe.setAttribute("value", pe.textContent);
    var lead = /^\s/.test(v) ? " " : "", trail = /\s$/.test(v) ? " " : "";
    n.nodeValue = lead + out + trail;
  }
  var ATTRS = ["aria-label", "alt", "title", "placeholder"];
  var KEEP = { "주요 메뉴": 1 }; /* CSS 선택자로 쓰는 값 — 바꾸면 모바일 머리띠 스타일이 풀린다 */
  function attrs(el) {
    if (!el || el.nodeType !== 1) return;
    for (var i = 0; i < ATTRS.length; i++) {
      var a = el.getAttribute(ATTRS[i]);
      if (a && HAN.test(a) && !KEEP[a.trim()]) { var o = tr(a.replace(/\s+/g, " ").trim()); if (o !== a) el.setAttribute(ATTRS[i], o); }
    }
  }
  function run(root) {
    if (root === D) {
      var tt = D.querySelector("title"); if (tt) [].forEach.call(tt.childNodes, textNode);
      [].forEach.call(D.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"],meta[name="twitter:title"],meta[name="twitter:description"]'), function (m) {
        var c = m.getAttribute("content"); if (c && HAN.test(c)) m.setAttribute("content", tr(c.trim()));
      });
      root = D.body;
    }
    if (!root) return;
    if (root.nodeType === 3) return textNode(root);
    if (root.nodeType !== 1 || skip(root)) return;
    attrs(root);
    var w = D.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null);
    var n, list = [];
    while ((n = w.nextNode())) list.push(n);
    for (var i = 0; i < list.length; i++) { if (list[i].nodeType === 3) textNode(list[i]); else attrs(list[i]); }
  }
  function watch() {
    if (!("MutationObserver" in W)) return;
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) {
        var m = ms[i];
        if (m.type === "characterData") textNode(m.target);
        else if (m.type === "attributes") attrs(m.target);
        else for (var j = 0; j < m.addedNodes.length; j++) run(m.addedNodes[j]);
      }
    }).observe(D.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  /* ---------- 스위치 ---------- */
  function setLang(l) {
    try { localStorage.setItem(KEY, l); } catch (e) {}
    var u = new URL(location.href); u.searchParams.delete("lang");
    if (u.href !== location.href) location.replace(u.href); else location.reload();
  }
  function paint(b) {
    [].forEach.call(b.querySelectorAll("span[data-l]"), function (s) { s.classList.toggle("is-on", s.getAttribute("data-l") === lang); });
    b.setAttribute("aria-label", lang === "en" ? "한국어로 보기 (Switch to Korean)" : "View in English (영문 보기)");
    b.setAttribute("lang", "en");
  }
  function make() {
    var b = D.createElement("button");
    b.type = "button"; b.className = "yk-lang"; b.setAttribute("data-lang-toggle", "");
    b.innerHTML = '<span data-l="ko">KO</span><span data-l="en">EN</span>';
    return b;
  }
  var SLOTS = [".hnav__actions", ".cs-top .cs-nav", ".rv-tools", ".tb-top", ".lx-top", ".ax-top", "body > header .wrap > nav", "body > header nav"];
  function mount() {
    var have = D.querySelectorAll("[data-lang-toggle]");
    if (!have.length) {
      var slot = null;
      for (var i = 0; i < SLOTS.length && !slot; i++) slot = D.querySelector(SLOTS[i]);
      var b = make();
      if (slot) { if (slot.classList.contains("hnav__actions") || slot.classList.contains("rv-tools")) slot.insertBefore(b, slot.firstChild); else slot.appendChild(b); }
      else { b.classList.add("yk-lang--float"); D.body.appendChild(b); }
      have = [b];
    }
    [].forEach.call(have, function (b) {
      if (!b.querySelector("span[data-l]")) b.innerHTML = '<span data-l="ko">KO</span><span data-l="en">EN</span>';
      paint(b);
    });
  }
  D.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-lang-toggle]");
    if (!b) return;
    e.preventDefault();
    setLang(lang === "en" ? "ko" : "en");
  });
  /* index 는 React 가 헤더를 그린 뒤에 꽂는다 */
  whenDom(function () { whenApp(mount); });
  W.addEventListener("load", function () { setTimeout(mount, 200); });

  W.ykI18n = { lang: lang, ready: ready, set: setLang, t: function (s) { return lang === "en" ? tr(s) : s; } };
})();
