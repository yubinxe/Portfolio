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

  /* 다크 모드 — 선호(localStorage yk.theme = "dark")를 첫 그리기 전에 반영(html.yk-dark). 고르지 않았으면 밝은 화면.
   * 색은 dark.css 한 곳에 모은다 — 여기서 바로 붙이고, 다크일 때는 그 파일이 올 때까지 첫 그리기를 기다린다(번쩍임 없음) */
  var TKEY = "yk.theme", dark = false;
  try { dark = localStorage.getItem(TKEY) === "dark"; localStorage.removeItem("yk.contrast"); } catch (e) {}
  /* ax 앱(빌드된 독립 시연 · /ax/* · /ax-lab/web/*)은 밝은 화면 전용 — 선호는 남기고 이 페이지에만 적용하지 않는다 */
  if (/\/ax(-lab\/web)?\/[^\/]+\/(index\.html)?$/.test(location.pathname)) dark = false;
  if (dark) H.classList.add("yk-dark");
  (function () {
    var lk = D.createElement("link"); lk.rel = "stylesheet"; lk.href = base + "dark.css?v=2"; lk.setAttribute("data-yk-dark", "");
    if (dark) lk.setAttribute("blocking", "render");
    (D.head || H).appendChild(lk);
  })();

  /* PC 화면 보기(V19) — 폰에서 ‘PC’를 누르면 화면 폭(viewport)을 1280 으로 바꿔 데스크톱 배치를 그대로(포멀하게) 보여 준다.
   * 선택은 localStorage "yk.view" = "pc". 폰(짧은 변 ≤ 820 · 터치)에서만 쓰고, 돌아오기 단추는 화면 아래 가운데 */
  var VKEY = "yk.view", phone = false, pc = false;
  try { phone = Math.min(screen.width, screen.height) <= 820 && W.matchMedia("(pointer: coarse)").matches; pc = phone && localStorage.getItem(VKEY) === "pc"; } catch (e) {}
  if (phone) H.classList.add("yk-phone");
  if (pc) {
    H.classList.add("yk-pc");
    var setVp = function () { [].forEach.call(D.querySelectorAll('meta[name="viewport"]'), function (m) { if (m.getAttribute("content") !== "width=1280") m.setAttribute("content", "width=1280"); }); };
    if ("MutationObserver" in W) {
      var vmo = new MutationObserver(function () { if (D.querySelector('meta[name="viewport"]')) setVp(); });
      vmo.observe(H, { childList: true, subtree: true });
      D.addEventListener("DOMContentLoaded", function () { setVp(); vmo.disconnect(); });
    } else D.addEventListener("DOMContentLoaded", setVp);
  }
  function setView(v) { try { if (v === "pc") localStorage.setItem(VKEY, "pc"); else localStorage.removeItem(VKEY); } catch (e) {} location.reload(); }

  /* 스위치 · 대기 화면 스타일 — 페이지 CSS 를 고치지 않고 여기서 */
  var css = D.createElement("style");
  css.textContent =
    "html.yk-en:not(.yk-en-done) body{opacity:0}html.yk-en.yk-en-done body{transition:opacity .35s ease}" +
    ".yk-lang{display:inline-flex;align-items:center;flex:none;height:28px;padding:2px;margin:0 2px;border:1px solid rgba(19,40,75,.28);border-radius:999px;background:rgba(255,255,255,.7);cursor:pointer;font:600 11px/1 Inter,'Pretendard Variable',system-ui,sans-serif;letter-spacing:.08em;color:#13284B;vertical-align:middle}" +
    ".yk-lang span{display:grid;place-items:center;min-width:24px;height:22px;padding:0 5px;border-radius:999px;transition:background .3s,color .3s}" +
    ".yk-lang span.is-on{background:#13284B;color:#F7F4EE}.yk-lang:hover{border-color:#13284B}.yk-lang:focus-visible{outline:3px solid #8FB8F2;outline-offset:2px}" +
    ".yk-lang--float{position:fixed;top:12px;right:12px;z-index:9000}" +
    /* PC 화면 단추(폰 · 좁은 화면에서만) · PC 화면일 때 돌아오기 단추(축소된 화면에서도 손가락 크기) */
    ".yk-view,.yk-view-back{display:none}" +
    "@media (max-width:760px){html.yk-phone:not(.yk-pc) .yk-view{display:inline-flex;align-items:center;gap:4px;flex:none;height:28px;padding:0 9px;margin:0 2px;border:1px solid rgba(19,40,75,.28);border-radius:999px;background:rgba(255,255,255,.7);color:#13284B;font:700 10px/1 Inter,'Pretendard Variable',system-ui,sans-serif;letter-spacing:.1em;cursor:pointer;vertical-align:middle;position:relative}html.yk-phone:not(.yk-pc) .yk-view svg{width:13px;height:13px}html.yk-phone:not(.yk-pc) .yk-view::after{content:'';position:absolute;inset:-8px -2px}}" +
    "html.yk-pc .yk-view-back{display:inline-flex;align-items:center;gap:14px;position:fixed;left:50%;bottom:28px;z-index:9500;transform:translateX(-50%);padding:22px 40px;border:0;border-radius:999px;background:#13284B;color:#F7F4EE;font:700 34px/1 'Pretendard Variable',system-ui,sans-serif;box-shadow:0 18px 44px -14px rgba(11,26,51,.6);cursor:pointer}html.yk-pc .yk-view-back svg{width:36px;height:36px}" +
    "html.yk-dark .yk-view{background:rgba(255,255,255,.06)!important;border-color:rgba(236,230,218,.24)!important;color:#ECE6DA!important}.st-top .yk-view{background:rgba(244,238,226,.06)!important;border-color:rgba(201,174,122,.28)!important;color:#E9DCC0!important}" +
    ".mnav__view{display:inline-flex;align-items:center;gap:8px;min-height:46px;padding:0 16px;font:inherit;font-size:.9rem;font-weight:700;border:1px solid #13284B;color:#13284B;background:transparent;cursor:pointer}.mnav__view svg{width:15px;height:15px}" +
    "@media print{.yk-view,.yk-view-back{display:none!important}}" +
    /* 폰: 떠 있는 KO/EN 이 표 · 제목 위를 덮지 않게 왼쪽 아래로 · 28px 알약은 보이는 크기 그대로 두고 누르는 범위만 44px 로 */
    "@media (max-width:760px){.yk-lang--float{top:auto;right:auto;left:max(12px,env(safe-area-inset-left));bottom:calc(12px + env(safe-area-inset-bottom));background:rgba(255,255,255,.94);box-shadow:0 6px 18px -8px rgba(19,40,75,.45)}}" +
    "@media (pointer:coarse){.yk-lang,.yk-bgm{position:relative}.yk-lang::after,.yk-bgm::after{content:'';position:absolute;inset:-8px -2px}.yk-lang--float{position:fixed}}" +
    /* 영문은 메뉴 글이 길다 — 이름 밑줄 문구를 접고 간격을 줄여 한 줄에 맞춘다 */
    "@media (min-width:1181px){html.yk-en .hnav__name small{display:none}html.yk-en header .nav-desktop{gap:clamp(8px,.95vw,16px)!important;font-size:.82rem!important}}" +
    "@media (min-width:1181px) and (max-width:1500px){header.hnav .nav-desktop{gap:clamp(8px,1.05vw,20px)!important}}" +
    "@media (max-width:1366px){html.yk-en .hnav__admin{display:none}}" +
    "@media (min-width:1181px) and (max-width:1300px){.hnav__name small{display:none}}" +
    "@media (max-width:560px){body > header .sticker{display:none!important}html.yk-en body > header nav > .btn{letter-spacing:.04em!important;padding:0 .7em!important;font-size:.72rem!important}}@media (max-width:430px){html.yk-en body > header nav > .btn{display:none!important}}" +
    ".yk-theme span{min-width:26px}.yk-theme svg{display:block;width:12px;height:12px}" +
    /* dark.css 가 오기 전 한순간도 흰 바탕이 보이지 않게 — 바탕 · 글자만 먼저 */
    "html.yk-dark,html.yk-dark body{background:#0A0F1A;color:#E8E2D6;color-scheme:dark}" +
    ".mnav__theme{display:inline-flex;align-items:center;gap:8px;min-height:46px;padding:0 16px;font:inherit;font-size:.9rem;font-weight:700;border:1px solid #13284B;color:#13284B;background:transparent;cursor:pointer}.mnav__theme svg{width:14px;height:14px}.mnav__theme[aria-pressed=true]{background:#13284B;color:#F7F4EE}" +
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
      s.src = base + "i18n-en.js?v=6";
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
    var t = setTimeout(go, 8000), done = false; /* 안전장치 — React 가 끝내 준비되지 않아도 스위치는 나온다 */
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
  var SUN = '<svg viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="2.6" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M6 .6v1.4M6 10v1.4M.6 6H2M10 6h1.4M2.2 2.2l1 1M8.8 8.8l1 1M2.2 9.8l1-1M8.8 3.2l1-1" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>';
  var MOON = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M10.2 7.6A4.6 4.6 0 0 1 4.4 1.8a4.6 4.6 0 1 0 5.8 5.8z" fill="currentColor"/></svg>';
  function paintT(b) {
    [].forEach.call(b.querySelectorAll("span[data-t]"), function (x) { x.classList.toggle("is-on", (x.getAttribute("data-t") === "dark") === dark); });
    b.setAttribute("aria-pressed", dark ? "true" : "false");
    b.setAttribute("aria-label", lang === "en" ? (dark ? "Dark mode on — switch to light" : "Switch to dark mode") : (dark ? "다크 모드 켜짐 — 누르면 밝은 화면" : "다크 모드로 보기"));
    b.title = lang === "en" ? "Dark mode" : "다크 모드";
  }
  function makeT() {
    var b = D.createElement("button");
    b.type = "button"; b.className = "yk-lang yk-theme"; b.setAttribute("data-theme-toggle", "");
    b.innerHTML = '<span data-t="light">' + SUN + '</span><span data-t="dark">' + MOON + "</span>";
    return b;
  }
  function setT(on) {
    dark = on;
    H.classList.add("yk-theme-swap");
    H.classList.toggle("yk-dark", dark);
    try { if (dark) localStorage.setItem(TKEY, "dark"); else localStorage.removeItem(TKEY); } catch (e) {}
    [].forEach.call(D.querySelectorAll("[data-theme-toggle]"), function (b) { b.classList.contains("mnav__theme") ? paintMT(b) : paintT(b); });
    setTimeout(function () { H.classList.remove("yk-theme-swap"); }, 600);
    try { W.dispatchEvent(new CustomEvent("yk:theme", { detail: { dark: dark } })); } catch (e) {}
  }
  function paintMT(b) { b.setAttribute("aria-pressed", dark ? "true" : "false"); b.innerHTML = (dark ? MOON : SUN) + (lang === "en" ? " Dark mode " : " 다크 모드 ") + "<b>" + (dark ? (lang === "en" ? "On" : "켜짐") : (lang === "en" ? "Off" : "꺼짐")) + "</b>"; }
  var MON = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="8.5" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 14h5M8 11v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
  var PHN = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="4" y="1.5" width="8" height="13" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M7 12.4h2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
  function mountV() {
    if (!phone) return;
    if (pc) {
      if (!D.querySelector(".yk-view-back")) { var r = D.createElement("button"); r.type = "button"; r.className = "yk-view-back"; r.setAttribute("data-view-toggle", "m"); r.innerHTML = PHN + (lang === "en" ? "Mobile view" : "모바일 화면으로"); D.body.appendChild(r); }
      return;
    }
    [].forEach.call(D.querySelectorAll("[data-lang-toggle]"), function (lb) {
      if (lb.classList.contains("yk-lang--float") || (lb.nextElementSibling && lb.nextElementSibling.classList.contains("yk-view"))) return;
      var v = D.createElement("button"); v.type = "button"; v.className = "yk-view"; v.setAttribute("data-view-toggle", "pc");
      v.setAttribute("aria-label", lang === "en" ? "Show the desktop (PC) layout" : "PC 화면(데스크톱 배치)으로 보기"); v.innerHTML = MON + "PC";
      lb.parentNode.insertBefore(v, lb.nextSibling);
    });
    var row = D.querySelector(".mnav__row");
    if (row && !row.querySelector(".mnav__view")) { var m = D.createElement("button"); m.type = "button"; m.className = "mnav__view"; m.setAttribute("data-view-toggle", "pc"); m.innerHTML = MON + (lang === "en" ? " Desktop view" : " PC 화면으로 보기"); row.appendChild(m); }
  }
  /* KO/EN 왼쪽에 같은 모양으로(메인은 한 캡슐 .hnav__util 안), 모바일 메뉴에는 넓은 버튼으로 */
  function mountT() {
    mountV();
    [].forEach.call(D.querySelectorAll("[data-lang-toggle]"), function (lb) {
      if (lb.classList.contains("yk-lang--float")) return;
      var prev = lb.previousElementSibling;
      if (prev && prev.hasAttribute("data-theme-toggle")) return;
      var c = makeT(); lb.parentNode.insertBefore(c, lb); paintT(c);
    });
    var row = D.querySelector(".mnav__row");
    if (row && !row.querySelector("[data-theme-toggle]")) {
      var m = D.createElement("button"); m.type = "button"; m.className = "mnav__theme"; m.setAttribute("data-theme-toggle", ""); row.appendChild(m); paintMT(m);
    }
  }
  var SLOTS = [".hnav__util", ".hnav__actions", ".cs-top .cs-nav", ".rv-tools", ".tb-top", ".lx-top", ".ax-top", "body > header .wrap > nav", "body > header nav"];
  function mount() {
    var have = D.querySelectorAll("[data-lang-toggle]");
    if (!have.length) {
      var slot = null;
      for (var i = 0; i < SLOTS.length && !slot; i++) slot = D.querySelector(SLOTS[i]);
      var b = make();
      if (slot) { if (slot.classList.contains("hnav__util")) slot.appendChild(b); else if (slot.classList.contains("hnav__actions") || slot.classList.contains("rv-tools")) slot.insertBefore(b, slot.firstChild); else slot.appendChild(b); }
      else { b.classList.add("yk-lang--float"); D.body.appendChild(b); }
      have = [b];
    }
    [].forEach.call(have, function (b) {
      if (!b.querySelector("span[data-l]")) b.innerHTML = '<span data-l="ko">KO</span><span data-l="en">EN</span>';
      paint(b);
    });
    mountT();
  }
  D.addEventListener("click", function (e) {
    var vt = e.target.closest && e.target.closest("[data-view-toggle]");
    if (vt) { e.preventDefault(); e.stopPropagation(); setView(vt.getAttribute("data-view-toggle") === "pc" ? "pc" : "m"); return; }
    var tb = e.target.closest && e.target.closest("[data-theme-toggle]");
    if (tb) { e.preventDefault(); setT(!dark); return; }
    if (e.target.closest && e.target.closest("[data-mnav-toggle]")) setTimeout(mountT, 0);
    var b = e.target.closest && e.target.closest("[data-lang-toggle]");
    if (!b) return;
    e.preventDefault();
    setLang(lang === "en" ? "ko" : "en");
  });
  /* index 는 React 가 헤더를 그린 뒤에 꽂는다 */
  whenDom(function () { whenApp(mount); });
  /* load 가 React 이어받기(hydrate)보다 먼저 올 수 있다(아이폰 · 느린 폰) — 이어받기 전에 머리띠에 끼우면 React 가 불일치로 다시 그려 스위치가 사라진다. 항상 준비 뒤에 */
  W.addEventListener("load", function () { whenApp(function () { setTimeout(mount, 200); }); });

  W.ykTheme = { get: function () { return dark; }, set: setT };
  W.ykView = { phone: phone, pc: pc, set: setView };
  W.ykI18n = { lang: lang, ready: ready, set: setLang, t: function (s) { return lang === "en" ? tr(s) : s; } };
})();
