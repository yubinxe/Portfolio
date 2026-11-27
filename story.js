/* story.js v1 — The Story 의 밤하늘. 의존성 없음 · defer.
 * 금빛 입자 하나의 무리가 장면(data-shape)마다 양 → 번개 → 집 → 지도 핀 → 광화문 → 저울 → 의사당 → YK 로 모양을 바꾼다.
 * 모양은 화면 밖 작은 캔버스에 Canvas 2D 로 그린 뒤 칠해진 픽셀을 표본으로 뽑아 목표점으로 쓴다(이미지 · 외부 자산 없음).
 * 마우스 근처 입자는 밀려났다 돌아온다. 움직임 끄기 · 움직임 줄이기 · 탭 숨김이면 정지 화면 한 장만 그린다. */
(function () {
  var D = document, H = D.documentElement, W = window;
  var cv = D.getElementById("st-sky");
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext("2d");
  var scenes = [].slice.call(D.querySelectorAll(".st-scene"));
  var rail = [].slice.call(D.querySelectorAll(".st-rail a"));
  var bar = D.querySelector(".st-bar i");
  var btn = D.querySelector("[data-motion]");
  var calm = W.matchMedia && W.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t = function (s) { return W.ykI18n && W.ykI18n.t ? W.ykI18n.t(s) : s; };
  var live = H.classList.contains("st-live");

  /* ---------- 모양: 200×200 화면 밖 캔버스에 그린다 ---------- */
  var S = 200, off = D.createElement("canvas"); off.width = off.height = S;
  var o = off.getContext("2d");
  function circ(x, y, r) { o.beginPath(); o.arc(x, y, r, 0, Math.PI * 2); o.fill(); }
  function poly(pts) { o.beginPath(); o.moveTo(pts[0], pts[1]); for (var i = 2; i < pts.length; i += 2) o.lineTo(pts[i], pts[i + 1]); o.closePath(); o.fill(); }
  function cut(fn) { o.globalCompositeOperation = "destination-out"; fn(); o.globalCompositeOperation = "source-over"; }
  var DRAW = {
    sheep: function () {
      [[80, 92, 24], [104, 82, 26], [130, 88, 24], [146, 106, 20], [124, 118, 26], [96, 120, 24], [72, 112, 20]].forEach(function (c) { circ(c[0], c[1], c[2]); });
      o.beginPath(); o.ellipse(50, 92, 15, 19, -0.35, 0, Math.PI * 2); o.fill();
      o.beginPath(); o.ellipse(38, 80, 9, 4, -0.6, 0, Math.PI * 2); o.fill();
      [[80, 132], [96, 134], [120, 134], [136, 130]].forEach(function (l) { o.fillRect(l[0], l[1], 7, 30); });
      cut(function () { circ(46, 88, 3); });
    },
    bolt: function () { poly([118, 22, 58, 112, 96, 112, 80, 178, 146, 82, 106, 82, 124, 22]); },
    house: function () {
      poly([100, 30, 168, 92, 154, 92, 154, 170, 46, 170, 46, 92, 32, 92]);
      o.fillRect(128, 42, 14, 34);
      cut(function () { o.fillRect(88, 120, 26, 50); o.fillRect(60, 104, 20, 18); o.fillRect(124, 104, 20, 18); });
    },
    pins: function () {
      function pin(x, y, r) { circ(x, y, r); poly([x - r * 0.86, y + r * 0.5, x + r * 0.86, y + r * 0.5, x, y + r * 2.3]); cut(function () { circ(x, y, r * 0.42); }); }
      pin(64, 70, 22); pin(132, 54, 28); pin(98, 128, 15);
      o.globalAlpha = 1; o.lineWidth = 3; o.strokeStyle = "#000";
      o.beginPath(); o.ellipse(100, 172, 80, 14, 0, 0, Math.PI * 2); o.stroke();
    },
    gate: function () {
      o.fillRect(26, 112, 148, 58);
      cut(function () { [60, 100, 140].forEach(function (x) { o.fillRect(x - 12, 136, 24, 34); circ(x, 136, 12); }); });
      o.fillRect(44, 90, 112, 18);
      poly([14, 92, 186, 92, 160, 74, 40, 74]);
      o.fillRect(60, 56, 80, 16);
      poly([34, 58, 166, 58, 142, 38, 58, 38]);
      o.fillRect(96, 28, 8, 10);
    },
    scales: function () {
      o.fillRect(96, 40, 8, 120); poly([66, 172, 134, 172, 116, 156, 84, 156]); circ(100, 36, 9);
      o.fillRect(30, 52, 140, 6);
      o.lineWidth = 2.5; o.strokeStyle = "#000";
      [[44, 58], [156, 58]].forEach(function (p) { o.beginPath(); o.moveTo(p[0], p[1]); o.lineTo(p[0] - 22, p[1] + 58); o.moveTo(p[0], p[1]); o.lineTo(p[0] + 22, p[1] + 58); o.stroke(); });
      [44, 156].forEach(function (x) { o.beginPath(); o.ellipse(x, 116, 28, 12, 0, 0, Math.PI); o.fill(); });
    },
    dome: function () {
      o.beginPath(); o.arc(100, 92, 40, Math.PI, 0); o.fill();
      o.fillRect(54, 90, 92, 10);
      o.fillRect(97, 34, 6, 20); circ(100, 32, 6);
      for (var x = 34; x <= 160; x += 18) o.fillRect(x, 108, 8, 46);
      o.fillRect(24, 100, 152, 8); o.fillRect(18, 154, 164, 8); o.fillRect(10, 162, 180, 10);
    },
    yk: function () {
      o.font = "600 118px 'Cormorant Garamond', Georgia, 'Times New Roman', serif";
      o.textAlign = "center"; o.textBaseline = "middle"; o.fillText("YK", 100, 104);
      o.fillRect(40, 168, 120, 3);
    }
  };
  var cache = {};
  function sample(name) {
    if (cache[name]) return cache[name];
    o.clearRect(0, 0, S, S); o.fillStyle = "#000"; o.globalAlpha = 1;
    (DRAW[name] || DRAW.sheep)();
    var px = o.getImageData(0, 0, S, S).data, pts = [];
    for (var y = 0; y < S; y += 2) for (var x = 0; x < S; x += 2) if (px[(y * S + x) * 4 + 3] > 128) pts.push((x - S / 2) / S, (y - S / 2) / S);
    return (cache[name] = pts);
  }

  /* ---------- 입자 · 별 ---------- */
  var w = 0, h = 0, dpr = 1, small = false, N = 0, P = [], stars = [];
  var cx = 0, cy = 0, size = 0, alphaK = 1, shape = "", mouse = { x: -9999, y: -9999 };
  function layout() {
    dpr = Math.min(2, W.devicePixelRatio || 1);
    w = innerWidth; h = innerHeight; small = w <= 760;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    cv.style.width = w + "px"; cv.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (small) { cx = w * 0.5; cy = h * 0.3; size = Math.min(w * 0.86, h * 0.5); alphaK = 0.55; }
    else { cx = w * 0.7; cy = h * 0.5; size = Math.min(w * 0.4, h * 0.72); alphaK = 1; }
    var want = small ? 900 : 1600;
    if (want !== N) {
      N = want; P = [];
      for (var i = 0; i < N; i++) P.push({ x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, tx: 0, ty: 0, r: Math.random() < 0.12 ? 1.6 : 1, gold: Math.random() < 0.72, ph: Math.random() * 6.28 });
      stars = [];
      for (var k = 0; k < (small ? 90 : 200); k++) stars.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.1 + 0.2, ph: Math.random() * 6.28 });
    }
    if (shape) target(shape, true);
  }
  function target(name, keep) {
    shape = name;
    var pts = sample(name), n = pts.length / 2;
    for (var i = 0; i < N; i++) {
      var j = (Math.random() * n | 0) * 2, p = P[i];
      p.ox = pts[j] + (Math.random() - 0.5) * 0.012; p.oy = pts[j + 1] + (Math.random() - 0.5) * 0.012;
      p.tx = cx + p.ox * size; p.ty = cy + p.oy * size;
      if (!keep) { p.vx += (Math.random() - 0.5) * 6; p.vy += (Math.random() - 0.5) * 6; }
    }
  }

  /* ---------- 그리기 ---------- */
  var running = false, raf = 0, last = 0;
  function frame(now, still) {
    var dt = Math.min(2, last ? (now - last) / 16.7 : 1); last = now;
    var sec = now / 1000;
    ctx.clearRect(0, 0, w, h);
    for (var k = 0; k < stars.length; k++) {
      var s = stars[k];
      ctx.globalAlpha = 0.18 + 0.3 * (still ? 0.5 : (0.5 + 0.5 * Math.sin(sec * 1.3 + s.ph)));
      ctx.fillStyle = "#F4EEE2"; ctx.fillRect(s.x * w, s.y * h, s.r, s.r);
    }
    var mx = mouse.x, my = mouse.y, R = 90, R2 = R * R;
    for (var i = 0; i < N; i++) {
      var p = P[i];
      if (still) { p.x = p.tx; p.y = p.ty; }
      else {
        var ax = (p.tx - p.x) * 0.012, ay = (p.ty - p.y) * 0.012;
        ax += Math.sin(sec * 0.9 + p.ph) * 0.05; ay += Math.cos(sec * 0.8 + p.ph * 1.3) * 0.05;
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < R2 && d2 > 0.01) { var f = (1 - d2 / R2) * 2.2 / Math.sqrt(d2); ax += dx * f; ay += dy * f; }
        p.vx = (p.vx + ax * dt) * 0.9; p.vy = (p.vy + ay * dt) * 0.9;
        p.x += p.vx * dt; p.y += p.vy * dt;
      }
      var tw = still ? 0.8 : 0.62 + 0.38 * Math.sin(sec * 2 + p.ph);
      ctx.globalAlpha = tw * alphaK * (p.gold ? 0.95 : 0.7);
      ctx.fillStyle = p.gold ? "#D9C08E" : "#F4EEE2";
      ctx.fillRect(p.x, p.y, p.r * 1.4, p.r * 1.4);
    }
    ctx.globalAlpha = 1;
  }
  function loop(now) { if (!running) return; frame(now, false); raf = requestAnimationFrame(loop); }
  function start() { if (running || !live || D.hidden) return; running = true; last = 0; raf = requestAnimationFrame(loop); }
  function stop() { running = false; cancelAnimationFrame(raf); }
  function still() { stop(); frame(performance.now(), true); }

  /* ---------- 장면 감지 · 레일 · 진행 막대 ---------- */
  var active = -1;
  function setActive(i) {
    if (i === active || i < 0) return;
    active = i;
    rail.forEach(function (a, k) { a.classList.toggle("is-on", k === i); if (k === i) a.setAttribute("aria-current", "step"); else a.removeAttribute("aria-current"); });
    target(scenes[i].getAttribute("data-shape") || "sheep", false);
    if (!live) still();
  }
  if ("IntersectionObserver" in W) {
    var ioIn = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); ioIn.unobserve(e.target); } }); }, { threshold: 0.18 });
    var ioOn = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) setActive(scenes.indexOf(e.target)); }); }, { rootMargin: "-45% 0px -45% 0px" });
    scenes.forEach(function (s) { ioIn.observe(s); ioOn.observe(s); });
  } else scenes.forEach(function (s) { s.classList.add("is-in"); });
  var tick = 0;
  function progress() {
    tick = 0;
    var max = D.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.setProperty("--p", max > 0 ? Math.min(1, Math.max(0, scrollY / max)).toFixed(4) : "0");
  }
  W.addEventListener("scroll", function () { if (!tick) tick = requestAnimationFrame(progress); }, { passive: true });

  /* ---------- 입력 ---------- */
  W.addEventListener("pointermove", function (e) { if (e.pointerType !== "touch") { mouse.x = e.clientX; mouse.y = e.clientY; } }, { passive: true });
  D.addEventListener("pointerleave", function () { mouse.x = mouse.y = -9999; });
  var rz = 0;
  W.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(function () { layout(); if (!running) still(); }, 150); });
  D.addEventListener("visibilitychange", function () { if (D.hidden) stop(); else start(); });

  /* ---------- 움직임 켜기/끄기 ---------- */
  function label() {
    if (!btn) return;
    btn.setAttribute("aria-pressed", live ? "true" : "false");
    btn.textContent = t(live ? "움직임 켜짐" : "움직임 꺼짐");
  }
  if (btn) {
    if (calm) btn.hidden = true;
    btn.addEventListener("click", function () {
      live = !live;
      try { localStorage.setItem("yk.story.motion", live ? "on" : "off"); } catch (e) {}
      H.classList.toggle("st-live", live);
      if (!live) scenes.forEach(function (s) { s.classList.add("is-in"); });
      label();
      if (live) start(); else still();
    });
  }

  layout();
  setActive(0);
  progress();
  var ready = (W.ykI18n && W.ykI18n.ready) || Promise.resolve();
  ready.then(label);
  if (!live) { scenes.forEach(function (s) { s.classList.add("is-in"); }); still(); }
  else start();
  /* 글꼴(Cormorant)이 늦게 오면 YK 모양을 다시 뽑는다 */
  if (D.fonts && D.fonts.ready) D.fonts.ready.then(function () { delete cache.yk; if (shape === "yk") { target("yk", true); if (!running) still(); } });
})();
