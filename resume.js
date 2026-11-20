/* resume.js — Résumé 를 ‘살아 움직이는 지면’으로. html.rv-live(움직임 허용 · JS 있음)일 때만 동작하고,
 * 없으면 resume.html 은 그대로 다 보이는 정지 화면이다. 인쇄 버튼 · 보도 문장 낱말 잉크 · 숫자 차오름 · 등장 · 초상 기울기 */
(function () {
  var doc = document.documentElement;
  var pr = document.querySelector("[data-print]");
  if (pr) pr.addEventListener("click", function () { window.print(); });
  if (!doc.classList.contains("rv-live")) return;

  /* 인쇄 직전에는 모두 보이게(브라우저 인쇄 미리보기에서도 1쪽 그대로) */
  window.addEventListener("beforeprint", function () { doc.classList.remove("rv-live"); });
  window.addEventListener("afterprint", function () { doc.classList.add("rv-live"); });

  requestAnimationFrame(function () { requestAnimationFrame(function () { doc.classList.add("rv-ready"); }); });

  /* 초상 — 깜빡이는 빛 한 겹 + 포인터를 따라 아주 조금 기울기(데스크톱만) */
  var por = document.querySelector(".rv-portrait");
  if (por) {
    var glint = document.createElement("span");
    glint.className = "rv-glint"; glint.setAttribute("aria-hidden", "true");
    por.appendChild(glint);
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      var raf = 0;
      window.addEventListener("pointermove", function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0;
          var r = por.getBoundingClientRect();
          var dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth, dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
          por.style.translate = (dx * 6).toFixed(2) + "px " + (dy * 6).toFixed(2) + "px";
          por.style.rotate = (dx * 3).toFixed(2) + "deg";
        });
      }, { passive: true });
    }
  }

  /* 보도 문장 — 낱말 단위로 잉크가 번지듯 */
  var q = document.querySelector("[data-words]");
  if (q) {
    var words = q.textContent.split(/(\s+)/);
    q.setAttribute("aria-label", q.textContent);
    q.textContent = "";
    var n = 0;
    words.forEach(function (w) {
      if (/^\s+$/.test(w)) { q.appendChild(document.createTextNode(w)); return; }
      var s = document.createElement("span");
      s.className = "w"; s.setAttribute("aria-hidden", "true");
      s.style.transitionDelay = (0.25 + n++ * 0.07).toFixed(2) + "s";
      s.textContent = w; q.appendChild(s);
    });
  }

  /* 숫자 — 화면에 들어오면 0 에서 실제 값까지(값은 HTML 에 이미 적혀 있다) */
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = 0, dur = 900 + end * 8;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = String(Math.max(end === 1 ? 1 : 0, Math.round(end * e)));
      if (k < 1) requestAnimationFrame(step); else el.textContent = String(end);
    }
    requestAnimationFrame(step);
  }

  var targets = [].slice.call(document.querySelectorAll("[data-reveal],[data-stagger],.rv-sec h2,[data-words]"));
  [].slice.call(document.querySelectorAll("[data-stagger]")).forEach(function (ul) {
    [].slice.call(ul.children).forEach(function (li, i) { li.style.transitionDelay = (i * 0.08).toFixed(2) + "s"; });
  });
  function show(el) {
    el.classList.add("is-in");
    [].slice.call(el.querySelectorAll("[data-count]")).forEach(count);
  }
  if (!("IntersectionObserver" in window)) { targets.forEach(show); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  targets.forEach(function (el) { io.observe(el); });
  /* 안전장치 — 어떤 이유로든 4초 뒤에도 안 보이는 것은 그냥 보이게 */
  setTimeout(function () { targets.forEach(function (el) { if (!el.classList.contains("is-in") && el.getBoundingClientRect().top < window.innerHeight) show(el); }); }, 4000);
})();
