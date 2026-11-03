/* cine.js — 스크롤·포인터에 직접 반응하는 장면 연출 (index.html 전용, 의존성 없음)
 *
 * 원리: 각 장면의 진행도(0~1)만 계산해 CSS 변수 --cp 로 쓰고, 실제 움직임은 features.css 의
 * transform/opacity 가 계산한다. 그래서 스크롤을 되돌리면 장면도 그대로 되돌아가고,
 * React 는 다시 그리지 않는다(매 프레임 setState 없음).
 *
 *   data-cine="exit"  화면을 떠나는 동안 0 → 1   (히어로 카메라)
 *   data-cine="pass"  화면을 지나가는 동안 0 → 1 (역량 지도·이력 사진)
 *   data-cine="pin"   고정 장면 안에서 0 → 1     (AX 조립 장면)
 *   data-tilt         포인터·손가락 위치로 기울어짐 --rx --ry (-1 ~ 1)
 */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var scenes = [], raf = 0, vh = window.innerHeight;
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };

  function scan() {
    scenes = Array.prototype.slice.call(document.querySelectorAll("[data-cine]"));
    document.querySelectorAll("[data-tilt]").forEach(bindTilt);
    frame();
  }

  function frame() {
    raf = 0;
    if (reduce && reduce.matches) {
      /* 움직임 줄이기: 장면마다 '완성된 정지 화면'에 해당하는 값으로 고정 */
      for (var j = 0; j < scenes.length; j++) {
        var m = scenes[j].getAttribute("data-cine");
        scenes[j].style.setProperty("--cp", m === "exit" ? "0" : m === "pin" ? "1" : ".5");
      }
      return;
    }
    /* 측정을 먼저 모두 끝내고 쓰기는 나중에 — 레이아웃을 한 번만 계산하게 */
    var out = [];
    for (var i = 0; i < scenes.length; i++) {
      var el = scenes[i], r = el.getBoundingClientRect(), mode = el.getAttribute("data-cine"), p;
      if (r.bottom < -vh || r.top > vh * 2) continue;
      if (mode === "exit") p = clamp(-r.top / (r.height * 0.85));
      else if (mode === "pin") { var span = r.height - vh; p = span > 0 ? clamp(-r.top / span) : 1; }
      else p = clamp((vh - r.top) / (vh + r.height));
      out.push([el, p.toFixed(4)]);
    }
    for (var k = 0; k < out.length; k++) out[k][0].style.setProperty("--cp", out[k][1]);
  }
  function req() { if (!raf) raf = requestAnimationFrame(frame); }

  function bindTilt(el) {
    if (el.__tilt) return;
    el.__tilt = 1;
    var tr = 0;
    var move = function (ev) {
      if (reduce && reduce.matches) return;
      if (ev.pointerType === "touch" && !el.__down) return;
      var r = el.getBoundingClientRect();
      var x = ((ev.clientX - r.left) / r.width) * 2 - 1, y = ((ev.clientY - r.top) / r.height) * 2 - 1;
      if (tr) cancelAnimationFrame(tr);
      tr = requestAnimationFrame(function () {
        el.style.setProperty("--rx", Math.max(-1, Math.min(1, x)).toFixed(3));
        el.style.setProperty("--ry", Math.max(-1, Math.min(1, y)).toFixed(3));
        el.classList.add("is-tilt");
      });
    };
    var reset = function () {
      el.__down = 0;
      el.style.setProperty("--rx", "0");
      el.style.setProperty("--ry", "0");
      el.classList.remove("is-tilt");
    };
    el.addEventListener("pointerdown", function (ev) { if (ev.pointerType === "touch") { el.__down = 1; move(ev); } });
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", reset);
    el.addEventListener("pointerup", function (ev) { if (ev.pointerType === "touch") reset(); });
    el.addEventListener("pointercancel", reset);
  }

  window.addEventListener("scroll", req, { passive: true });
  window.addEventListener("resize", function () { vh = window.innerHeight; req(); }, { passive: true });
  if (reduce && reduce.addEventListener) reduce.addEventListener("change", req);

  /* React 가 화면을 이어받은 뒤(하이드레이션)와 섹션이 다시 그려질 때 다시 찾는다 */
  var t = 0;
  var later = function () { clearTimeout(t); t = setTimeout(scan, 120); };
  var root = document.getElementById("root");
  if (root && window.MutationObserver) new MutationObserver(later).observe(root, { childList: true, subtree: true });
  document.documentElement.classList.add("cine-on");
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", scan);
  else scan();
  window.addEventListener("load", scan);
})();
