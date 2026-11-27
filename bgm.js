/* bgm.js v1 — 배경음악. 음원 파일 없이 브라우저(Web Audio)가 그 자리에서 만들어 내는 잔잔한 앰비언트(외부 음원 · 저작권 자료 없음).
 * D장조 4화음(Dmaj9 → Bm9 → Gmaj9 → A6sus) 패드 · 낮은 베이스 · 5음 음계 아르페지오 · 잔향. 매번 조금씩 다르게 흐른다.
 * 기본은 꺼짐 — 누르면 켜지고, 켠 상태(localStorage yk.bgm)는 다른 페이지로 이어진다(브라우저 정책상 다음 페이지는 첫 클릭 · 키 입력에서 다시 시작).
 * 단추: 설정 캡슐(.hnav__util) · KO/EN 알약 옆 · story 머리띠. 첫 화면(.hero-classic)에는 소리에 맞춰 움직이는 금빛 파형. 탭이 숨으면 쉰다. */
(function () {
  var D = document, H = D.documentElement, W = window;
  var AC = W.AudioContext || W.webkitAudioContext;
  if (!AC) return;
  var KEY = "yk.bgm";
  var t = function (s) { return W.ykI18n && W.ykI18n.t ? W.ykI18n.t(s) : s; };
  var want = false; try { want = localStorage.getItem(KEY) === "on"; } catch (e) {}
  var ctx = null, master = null, bus = null, delay = null, an = null, timer = 0, playing = false, nextBar = 0, bar = 0, step = 0, nextStep = 0, last = 9;
  var BPM = 68, BEAT = 60 / BPM, BAR = BEAT * 4;
  var f = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };
  /* 화음(미디 번호) — 한 화음이 두 마디 */
  var CHORDS = [[50, 57, 61, 64, 66], [47, 54, 57, 61, 62], [43, 50, 54, 57, 61], [45, 52, 54, 59, 62]];
  var PENTA = [62, 64, 66, 69, 71, 74, 76, 78, 81];

  function impulse(sec) {
    var len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) { var d = b.getChannelData(c); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    return b;
  }
  function build() {
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3;
    var tone = ctx.createBiquadFilter(); tone.type = "lowpass"; tone.frequency.value = 3200;
    an = ctx.createAnalyser(); an.fftSize = 1024; an.smoothingTimeConstant = 0.85;
    master.connect(tone); tone.connect(comp); comp.connect(an); an.connect(ctx.destination);
    bus = ctx.createGain(); bus.gain.value = 1; bus.connect(master);
    var rev = ctx.createConvolver(); rev.buffer = impulse(3.6);
    var wet = ctx.createGain(); wet.gain.value = 0.5; bus.connect(rev); rev.connect(wet); wet.connect(master);
    delay = ctx.createDelay(1); delay.delayTime.value = BEAT * 0.75;
    var fb = ctx.createGain(); fb.gain.value = 0.32; var dl = ctx.createGain(); dl.gain.value = 0.3;
    delay.connect(fb); fb.connect(delay); delay.connect(dl); dl.connect(bus);
  }
  function voice(freq, at, dur, opt) {
    var o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = opt.type; o.frequency.value = freq; o.detune.value = opt.detune || 0;
    lp.type = "lowpass"; lp.frequency.value = opt.cut || 1400; lp.Q.value = 0.4;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(opt.vol, at + opt.a);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(lp); lp.connect(g); g.connect(bus); if (opt.echo) g.connect(delay);
    o.start(at); o.stop(at + dur + 0.05);
  }
  function scheduleBar(at) {
    var ch = CHORDS[(bar >> 1) % CHORDS.length], first = bar % 2 === 0, len = BAR * 2 + 1.6;
    if (first) {
      ch.forEach(function (m, i) {
        if (i === 0) return;
        voice(f(m), at, len, { type: "triangle", vol: 0.028, a: 1.8, cut: 900 + Math.random() * 300 });
        voice(f(m), at, len, { type: "sine", vol: 0.03, a: 2.2, detune: i % 2 ? 7 : -7 });
      });
      voice(f(ch[0] - 12), at, len, { type: "sine", vol: 0.09, a: 0.9, cut: 400 });
    }
    bar++;
  }
  function scheduleStep(at) {
    /* 8분음표 아르페지오 — 이웃 음으로 걷고, 가끔 쉰다 */
    if (Math.random() < (step % 2 ? 0.4 : 0.68)) {
      last = Math.max(0, Math.min(PENTA.length - 1, last + [-2, -1, -1, 1, 1, 2][Math.random() * 6 | 0]));
      voice(f(PENTA[last]), at, 1.6, { type: "sine", vol: 0.045 + Math.random() * 0.02, a: 0.012, cut: 2600, echo: true });
    }
    step++;
  }
  function pump() {
    var ahead = ctx.currentTime + 0.4;
    while (nextBar < ahead) { scheduleBar(nextBar); nextBar += BAR; }
    while (nextStep < ahead) { scheduleStep(nextStep); nextStep += BEAT / 2; }
  }
  function start() {
    if (!ctx) build();
    var go = function () {
      if (ctx.state !== "running") return false;
      if (!playing) {
        playing = true;
        nextBar = nextStep = ctx.currentTime + 0.1;
        timer = setInterval(pump, 120); pump();
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
        master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 2.5);
        wave();
      }
      paint(); return true;
    };
    var r = ctx.resume(); if (r && r.then) r.then(go, function () {});
    var ok = go(); paint(); return ok;
  }
  function stop(keepWant) {
    if (!ctx || !playing) { paint(); return; }
    playing = false; clearInterval(timer);
    var now = ctx.currentTime;
    master.gain.cancelScheduledValues(now); master.gain.setValueAtTime(master.gain.value, now); master.gain.linearRampToValueAtTime(0, now + 0.8);
    setTimeout(function () { if (!playing && ctx) ctx.suspend(); }, 900);
    paint();
  }
  function setWant(on) {
    want = on;
    try { if (on) localStorage.setItem(KEY, "on"); else localStorage.removeItem(KEY); } catch (e) {}
    if (on) start(); else stop();
  }

  /* ---------- 모양(페이지마다 CSS 를 따로 두지 않도록 여기서) ---------- */
  var st = D.createElement("style");
  st.textContent = ".yk-bgm{display:inline-flex;align-items:center;gap:5px;flex:none;height:28px;padding:0 10px 0 8px;margin:0 2px;border:1px solid rgba(19,40,75,.28);border-radius:999px;background:rgba(255,255,255,.7);color:#735C30;font:700 10px/1 Inter,'Pretendard Variable',system-ui,sans-serif;letter-spacing:.14em;cursor:pointer;vertical-align:middle;transition:border-color .3s,background .3s}" +
    ".yk-bgm:hover{border-color:#9C7E48}.yk-bgm svg{width:12px;height:12px;fill:currentColor;transform-box:fill-box}.yk-bgm__q{display:none}" +
    ".yk-bgm.is-on .yk-bgm__p{display:none}.yk-bgm.is-on .yk-bgm__q{display:block}.yk-bgm.is-on{border-color:#9C7E48;background:rgba(201,174,122,.16)}" +
    ".yk-bgm.is-on rect{transform-origin:center;transform-box:fill-box;animation:ykEq .9s ease-in-out infinite}.yk-bgm.is-on rect:nth-child(2){animation-delay:.2s}.yk-bgm.is-on rect:nth-child(3){animation-delay:.45s}" +
    ".yk-bgm.is-wait{animation:ykWait 1.6s ease-in-out infinite}" +
    "@keyframes ykEq{0%,100%{transform:scaleY(.45)}50%{transform:scaleY(1)}}@keyframes ykWait{50%{border-color:#C9AE7A}}" +
    ".yk-bgm--float{position:fixed;left:16px;bottom:16px;z-index:60}" +
    "html.yk-dark .yk-bgm{background:rgba(255,255,255,.06);border-color:rgba(236,230,218,.24);color:#D9C08F}" +
    ".st-top .yk-bgm{background:rgba(244,238,226,.06);border-color:rgba(201,174,122,.28);color:#E9DCC0}" +
    ".yk-wave{position:absolute;left:0;right:0;bottom:8px;width:100%;height:72px;pointer-events:none;z-index:1;opacity:.85}" +
    "@media (max-width:760px){.yk-bgm__t{display:none}.yk-bgm{padding:0 8px}.yk-wave{bottom:4px;height:56px}}" +
    "@media (prefers-reduced-motion:reduce){.yk-bgm.is-on rect,.yk-bgm.is-wait{animation:none}}@media print{.yk-bgm,.yk-wave{display:none!important}}";
  (D.head || H).appendChild(st);

  /* ---------- 단추 ---------- */
  var ICON = '<svg class="yk-bgm__p" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.4v11.2l9-5.6z"/></svg><svg class="yk-bgm__q" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.6" y="4.5" width="2.4" height="7" rx="1.2"/><rect x="6.8" y="2.5" width="2.4" height="11" rx="1.2"/><rect x="12" y="5.5" width="2.4" height="5" rx="1.2"/></svg><span class="yk-bgm__t">BGM</span>';
  function paint() {
    [].forEach.call(D.querySelectorAll("[data-bgm]"), function (b) {
      b.classList.toggle("is-on", playing);
      b.classList.toggle("is-wait", want && !playing);
      b.setAttribute("aria-pressed", playing ? "true" : "false");
      b.setAttribute("aria-label", t(playing ? "배경음악 끄기" : "배경음악 켜기"));
      b.title = t("배경음악 — 브라우저가 직접 만드는 앰비언트(외부 음원 없음)");
    });
    H.classList.toggle("yk-bgm-on", playing);
  }
  function make() {
    var b = D.createElement("button");
    b.type = "button"; b.className = "yk-bgm"; b.setAttribute("data-bgm", ""); b.innerHTML = ICON;
    return b;
  }
  function mount() {
    if (D.querySelector("[data-bgm]")) return;
    var slot = D.querySelector(".hnav__util"), b = make();
    if (slot) slot.insertBefore(b, slot.firstChild);
    else {
      var lb = D.querySelector("[data-lang-toggle]:not(.yk-lang--float)");
      if (lb) { var th = lb.previousElementSibling && lb.previousElementSibling.hasAttribute("data-theme-toggle") ? lb.previousElementSibling : lb; th.parentNode.insertBefore(b, th); }
      else if (!mount.waited) { mount.waited = 1; var later = function () { setTimeout(mount, 400); }; if (D.readyState === "complete") later(); else W.addEventListener("load", later); return; }
      else { b.classList.add("yk-bgm--float"); D.body.appendChild(b); }
    }
    paint();
  }
  D.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-bgm]");
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    setWant(!playing);
  }, true);
  /* 켜 둔 채 넘어온 페이지 — 첫 상호작용에서 이어 재생 */
  ["pointerdown", "keydown"].forEach(function (ev) {
    D.addEventListener(ev, function (e) { if (want && !playing && !(e.target.closest && e.target.closest("[data-bgm]"))) start(); }, true);
  });
  D.addEventListener("visibilitychange", function () {
    if (!ctx) return;
    if (D.hidden) { if (playing) { clearInterval(timer); ctx.suspend(); } }
    else if (playing) { ctx.resume().then(function () { nextBar = Math.max(nextBar, ctx.currentTime + 0.1); nextStep = Math.max(nextStep, ctx.currentTime + 0.1); clearInterval(timer); timer = setInterval(pump, 120); }); }
  });

  /* ---------- 첫 화면 파형 ---------- */
  var cv = null, cx2 = null, raf = 0, buf = null;
  function wave() {
    var host = D.querySelector(".hero-classic .hero-scene__sticky");
    if (!host || (W.matchMedia && W.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    if (!cv) { cv = D.createElement("canvas"); cv.className = "yk-wave"; cv.setAttribute("aria-hidden", "true"); host.appendChild(cv); cx2 = cv.getContext("2d"); buf = new Uint8Array(an.fftSize); }
    cancelAnimationFrame(raf);
    (function draw() {
      if (!playing) { cx2.clearRect(0, 0, cv.width, cv.height); return; }
      raf = requestAnimationFrame(draw);
      var r = cv.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      var dpr = Math.min(2, W.devicePixelRatio || 1), w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      an.getByteTimeDomainData(buf);
      cx2.clearRect(0, 0, w, h);
      cx2.lineWidth = 1.5 * dpr; cx2.strokeStyle = "rgba(156,126,72,.75)";
      cx2.beginPath();
      var n = buf.length, mid = h / 2;
      for (var i = 0; i < n; i += 4) {
        var x = (i / (n - 1)) * w, edge = Math.sin(Math.PI * i / (n - 1));
        var y = mid + ((buf[i] - 128) / 128) * h * 2.2 * edge;
        if (i) cx2.lineTo(x, y); else cx2.moveTo(x, y);
      }
      cx2.stroke();
    })();
  }

  /* index 는 React 가 머리띠를 그린 뒤(data-app=ready) — 다시 그려 단추가 빠지면 다시 끼운다 */
  function boot() {
    mount();
    if (D.getElementById("root") && "MutationObserver" in W) {
      var hd = D.body; var mt = 0;
      new MutationObserver(function () { if (mt) return; mt = setTimeout(function () { mt = 0; if (!D.querySelector("[data-bgm]")) mount(); }, 200); }).observe(hd, { childList: true, subtree: true });
    }
    if (want) start();
  }
  var ready = (W.ykI18n && W.ykI18n.ready) || Promise.resolve();
  ready.then(function () {
    var r = D.getElementById("root");
    if (r && H.getAttribute("data-app") !== "ready") {
      var n = 0, iv = setInterval(function () { if (H.getAttribute("data-app") === "ready" || ++n > 50) { clearInterval(iv); setTimeout(boot, 250); } }, 100);
    } else boot();
  });
  W.ykBgm = { on: function () { setWant(true); }, off: function () { setWant(false); }, playing: function () { return playing; } };
})();
