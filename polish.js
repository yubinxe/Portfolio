/* polish.js v1 — 영화 같은 포트폴리오의 ‘손길’ 층(사이트 공통, 의존성 없음, defer).
 * 장면 전환 막 · 필름 낟알 · 단어 제목 등장 · 사진 걷힘 · 커서 말풍선 · 자석 단추 · 장 표시 · 큰 장 번호 흐름 · 사진 기울기 · 내비 글자 섞임.
 * 움직임 줄이기면 전환 막만 빼고 아무것도 하지 않는다. React 가 그린 뒤(#root 채워진 뒤)에도 다시 훑는다. 스크롤 중 레이아웃 읽기는 화면 근처 요소만 */
(function () {
  var D = document, H = D.documentElement, W = window;
  var calm = W.matchMedia && W.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = W.matchMedia && W.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var KEY = "yk.pl.t";

  /* ---------- 1) 장면 전환 막 ---------- */
  var cur = D.createElement("div");
  cur.className = "pl-curtain"; cur.setAttribute("aria-hidden", "true");
  cur.innerHTML = "<b>Yubin Kim</b><i></i>";
  D.body.appendChild(cur);
  function lift() {
    if (!H.classList.contains("pl-enter")) return;
    cur.classList.add("is-out");
    H.classList.remove("pl-enter");
    setTimeout(function () { cur.classList.remove("is-out"); }, 900);
  }
  try { sessionStorage.removeItem(KEY); } catch (e) {}
  if (D.readyState === "complete") setTimeout(lift, 120); else W.addEventListener("load", function () { setTimeout(lift, 120); });
  setTimeout(lift, 1800); /* 안전장치 — 이미지가 늦어도 막은 걷힌다 */
  W.addEventListener("pageshow", function (e) { if (e.persisted) { cur.classList.remove("is-in"); H.classList.remove("pl-enter"); } });
  if (!calm) {
    /* 다른 페이지(.html)로 가는 일반 클릭만 — 새 창 · 수정키 · 같은 페이지 앵커 · 다운로드 · 메일은 그대로 */
    D.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      var href = a.getAttribute("href");
      if (!/\.html(\?[^#]*)?(#.*)?$/.test(href) || /^(https?:)?\/\//.test(href)) return;
      var url = new URL(href, location.href);
      if (url.pathname === location.pathname) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      try { sessionStorage.setItem(KEY, "1"); } catch (err) {}
      cur.classList.add("is-in");
      setTimeout(function () { location.href = url.href; }, 520);
    }, true);
  }
  if (calm) return;
  H.classList.add("pl");

  /* ---------- 2) 필름 낟알 ---------- */
  if (fine) { var g = D.createElement("div"); g.className = "pl-grain"; g.setAttribute("aria-hidden", "true"); D.body.appendChild(g); }

  /* ---------- 3) 등장 관찰(제목 단어 · 사진 걷힘) ---------- */
  var io = "IntersectionObserver" in W ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("pl-in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.15 }) : null;
  var pending = [];
  function observe(el) { if (io) { io.observe(el); pending.push(el); } else el.classList.add("pl-in"); }
  /* 빠르게 휙 내리면 관찰기가 건너뛰는 요소가 생긴다 — 이미 화면 위로 지나간 것은 바로 보이게 */
  function catchUp() {
    if (!pending.length) return;
    var vh = innerHeight, keep = [];
    for (var i = 0; i < pending.length; i++) {
      var el = pending[i];
      if (el.classList.contains("pl-in")) continue;
      if (el.getBoundingClientRect().top < vh * 0.9) { el.classList.add("pl-in"); if (io) io.unobserve(el); } else keep.push(el);
    }
    pending = keep;
  }

  /* 제목을 단어 단위로 — 글자는 그대로 두고 감싸기만(화면 낭독기는 같은 문장을 읽는다) */
  var SPLIT = ".sh__ko, .cx__t, .pol__t, .contact-title, .g-sec h2.font-serif, .cases-hero h1, .cv-hero h1, .lec-hero h1";
  function split(el) {
    if (el.classList.contains("pl-split") || el.closest(".ix")) return;
    var n = 0;
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var parts = c.textContent.split(/(\s+)/);
          if (!c.textContent.trim()) return;
          var frag = D.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(D.createTextNode(p)); return; }
            var w = D.createElement("span"); w.className = "pl-w";
            var i = D.createElement("span"); i.className = "pl-wi"; i.style.setProperty("--w", n++); i.textContent = p;
            w.appendChild(i); frag.appendChild(w);
          });
          c.parentNode.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName !== "BR" && !c.classList.contains("pl-w")) walk(c);
      });
    })(el);
    el.classList.add("pl-split");
    observe(el);
  }
  var UNVEIL = ".g-card > a, .photo-card, .tl-feature__thumbs > a, .clipset__photo > a, .clipset__tall > a, .dyl-day figure > a";
  function unveil(el) {
    if (el.classList.contains("pl-unveil") || el.closest("[data-tlx]")) return;
    var r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.9 && r.bottom > 0) return; /* 이미 보이는 사진은 건드리지 않는다 */
    el.classList.add("pl-unveil"); observe(el);
  }

  /* ---------- 4) 자석 단추 · 사진 기울기(데스크톱) ---------- */
  function magnet(el) {
    if (el.__plm) return; el.__plm = 1; el.classList.add("pl-mag");
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width / 2) / r.width, y = (e.clientY - r.top - r.height / 2) / r.height;
      el.style.translate = (x * 10).toFixed(1) + "px " + (y * 8).toFixed(1) + "px";
    });
    el.addEventListener("pointerleave", function () { el.style.translate = ""; });
  }
  function tilt(el) {
    if (el.__plt) return; el.__plt = 1; el.classList.add("pl-tilt");
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--tx", ((x - 0.5) * 6).toFixed(2)); el.style.setProperty("--ty", ((0.5 - y) * 5).toFixed(2));
      el.style.setProperty("--gx", (x * 100).toFixed(1) + "%"); el.style.setProperty("--gy", (y * 100).toFixed(1) + "%");
    });
    el.addEventListener("pointerleave", function () { el.style.setProperty("--tx", 0); el.style.setProperty("--ty", 0); });
  }

  /* ---------- 5) 내비 글자 섞임 — 올리면 잠깐 흩어졌다 제자리 ---------- */
  var GLY = "가나다라마바사아자차카타파하ABCDEFGHJKLMNPRSTUVWXYZ0123456789";
  function scramble(a) {
    if (a.__pls || a.children.length) return; a.__pls = 1;
    var text = a.textContent, busy = false;
    a.addEventListener("pointerenter", function () {
      if (busy) return; busy = true;
      a.style.minWidth = a.offsetWidth + "px";
      var t0 = performance.now(), dur = 420;
      (function step(t) {
        var k = Math.min(1, (t - t0) / dur), keep = Math.floor(text.length * k), out = "";
        for (var i = 0; i < text.length; i++) out += i < keep || text[i] === " " ? text[i] : GLY[(Math.random() * GLY.length) | 0];
        a.textContent = out;
        if (k < 1) requestAnimationFrame(step); else { a.textContent = text; a.style.minWidth = ""; busy = false; }
      })(t0);
    });
  }

  /* ---------- 6) 커서 말풍선 ---------- */
  var ring = null, lab = null;
  function labelFor(t) {
    if (!t) return "";
    if (t.closest("video, [data-play], .arch__play, .ed-play")) return "재생";
    var a = t.closest("a[href]");
    if (a) {
      if (a.closest(".g-card, .photo-card, .tl-feature__main, .tl-feature__thumbs, .clipset, .dyl-day, .fl__shot, .axc__tb-shot")) return "보기";
      var h = a.getAttribute("href") || "";
      if (/^https?:/.test(h) && a.host !== location.host) return "↗";
      if (/\.pdf$/.test(h)) return "PDF";
      return "";
    }
    if (t.closest(".fl__shot, .g-card, .photo-card")) return "보기";
    return "";
  }
  function setupRing() {
    ring = D.querySelector(".cursor-ring");
    if (!ring || ring.querySelector(".pl-lab")) return;
    lab = D.createElement("span"); lab.className = "pl-lab"; ring.appendChild(lab);
    D.addEventListener("mouseover", function (e) {
      var l = labelFor(e.target);
      lab.textContent = l;
      ring.classList.toggle("pl-has-lab", !!l);
    }, { passive: true });
  }

  /* ---------- 7) 장 표시 · 큰 장 번호 흐름(index) ---------- */
  var CH = { cases: "실무 사례", about: "소개", composite: "역량 지도", "ax-desk": "법률 AI 전환", "ax-c": "범용 AX 3종", artifacts: "직접 만든 도구", policy: "정책 참여", research: "연구 기록", archive: "작업 기록", trajectory: "성장 경로 · 이력", lectures: "강의", channels: "기록 · 채널", contact: "연락" };
  var hud = null, hudN = null, hudT = null, chapters = [], lastCh = "";
  function setupHud() {
    if (!fine || hud || !D.getElementById("cases")) return;
    chapters = Object.keys(CH).map(function (id) { return D.getElementById(id); }).filter(Boolean);
    if (chapters.length < 4) return;
    hud = D.createElement("div"); hud.className = "pl-hud"; hud.setAttribute("aria-hidden", "true");
    hud.innerHTML = "<b>01</b><em>/ " + String(chapters.length).padStart(2, "0") + "</em><span></span><i class=\"pl-hud__bar\"></i>";
    D.body.appendChild(hud);
    hudN = hud.querySelector("b"); hudT = hud.querySelector("span");
  }
  var shs = [], raf = 0;
  function frame() {
    raf = 0;
    catchUp();
    var vh = innerHeight;
    if (hud) {
      var idx = -1;
      for (var i = 0; i < chapters.length; i++) { var r = chapters[i].getBoundingClientRect(); if (r.top < vh * 0.5) idx = i; }
      var on = idx >= 0 && !H.classList.contains("ix-lock") && !D.querySelector(".mnav.is-open");
      hud.classList.toggle("is-on", on);
      if (idx >= 0) {
        var c = chapters[idx], id = c.id, rr = c.getBoundingClientRect();
        hud.style.setProperty("--pl-p", Math.min(1, Math.max(0, (vh * 0.5 - rr.top) / Math.max(1, rr.height))).toFixed(3));
        if (id !== lastCh) {
          lastCh = id; hudN.textContent = String(idx + 1).padStart(2, "0"); hudT.textContent = CH[id];
          hudN.classList.remove("pl-flip"); hudT.classList.remove("pl-flip"); void hudN.offsetWidth; hudN.classList.add("pl-flip"); hudT.classList.add("pl-flip");
        }
      }
    }
    for (var k = 0; k < shs.length; k++) {
      var rs = shs[k].getBoundingClientRect();
      if (rs.bottom < -200 || rs.top > vh + 200) continue;
      shs[k].style.setProperty("--pl-y", ((rs.top + rs.height / 2 - vh / 2) * -0.12).toFixed(1));
    }
  }
  function onScroll() { if (!raf) raf = requestAnimationFrame(frame); }
  W.addEventListener("scroll", onScroll, { passive: true });
  W.addEventListener("resize", onScroll, { passive: true });

  /* ---------- 훑기 — 처음 · React 가 그린 뒤 · 새 요소가 생길 때 ---------- */
  function sweep() {
    [].slice.call(D.querySelectorAll(SPLIT)).forEach(split);
    [].slice.call(D.querySelectorAll(UNVEIL)).forEach(unveil);
    if (fine) {
      [].slice.call(D.querySelectorAll(".btn, .hnav__contact, .axc__go, .rv-btn, .tl-ribbon a, .hnav__cv")).forEach(magnet);
      [].slice.call(D.querySelectorAll(".g-card > a, .tl-feature__main")).forEach(tilt);
      [].slice.call(D.querySelectorAll("header.hnav nav a, .hnav__links a, .g-nav a")).forEach(scramble);
      setupRing(); setupHud();
    }
    shs = [].slice.call(D.querySelectorAll(".sh[data-no]"));
    onScroll();
  }
  /* index 는 React 가 미리 렌더된 DOM 을 이어받는(hydrate) 동안 DOM 을 건드리면 안 된다 — data-app="ready" 뒤에 시작 */
  var root = D.getElementById("root"), started = false;
  function start() {
    if (started) return; started = true;
    sweep();
    if (root && "MutationObserver" in W) {
      var mt = 0;
      new MutationObserver(function () { if (mt) return; mt = setTimeout(function () { mt = 0; sweep(); }, 250); }).observe(root, { childList: true, subtree: true });
    }
    W.addEventListener("load", function () { setTimeout(sweep, 300); });
  }
  if (root && root.firstElementChild && H.getAttribute("data-app") !== "ready") {
    W.addEventListener("cine:scan", function () { setTimeout(start, 60); }, { once: true });
    setTimeout(start, 5000);
  } else start();
})();
