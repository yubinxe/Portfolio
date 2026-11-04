/* cine.js v2 — 스크롤·포인터에 직접 반응하는 장면 연출 (index.html 전용, 의존성 없음)
 *
 * 원리: 장면마다 진행도(0~1)만 계산해 CSS 변수 --cp 로 쓰고, 실제 움직임(카메라·깊이·글자)은
 * cine.css 가 transform/opacity 로 계산한다. 스크롤을 되돌리면 장면도 그대로 되돌아가고,
 * React 는 다시 그리지 않는다(스크롤 중 setState 없음).
 *
 * 성능: 장면의 문서 위치(top·height)는 크기가 바뀔 때만 잰다(ResizeObserver).
 *       스크롤 프레임에서는 scrollY 하나만 읽고 변수만 쓴다 — 레이아웃 읽기 0회.
 *       화면 근처 장면에만 .is-live 를 붙여 will-change 를 그때만 건다.
 *
 *   data-cine="exit"  화면을 떠나는 동안 0 → 1
 *   data-cine="pass"  화면을 지나가는 동안 0 → 1
 *   data-cine="pin"   고정(sticky) 장면 안에서 0 → 1
 *   data-cine-rest    움직임 줄이기일 때 고정할 값(기본: exit 0 · pin 1 · pass .5)
 *   data-cine-src     진행도는 이 조상(선택자) 기준으로 재고, 변수는 자기에게만 쓴다.
 *                     큰 섹션에 변수를 쓰면 그 안 모든 요소가 매 프레임 스타일을 다시 계산한다
 *                     (실측: 역량 섹션 4배 감속 폰에서 긴 프레임 40% → 1%)
 *   data-tilt         포인터·손가락 위치로 기울어짐 --rx --ry (-1 ~ 1)
 */
(function () {
  var mq = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = function () { return !!(mq && mq.matches); };
  var scenes = [], raf = 0, vh = window.innerHeight;
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };

  /* 위치 재기 — 레이아웃을 읽는 유일한 곳 */
  function measure() {
    var y = window.scrollY || window.pageYOffset;
    vh = window.innerHeight;
    for (var i = 0; i < scenes.length; i++) {
      var s = scenes[i], r = s.src.getBoundingClientRect();
      s.top = r.top + y; s.h = r.height;
    }
    req();
  }

  function scan() {
    var els = document.querySelectorAll("[data-cine]");
    scenes = [];
    for (var i = 0; i < els.length; i++) {
      var src = els[i].getAttribute("data-cine-src");
      scenes.push({ el: els[i], src: (src && els[i].closest(src)) || els[i], mode: els[i].getAttribute("data-cine"), rest: els[i].getAttribute("data-cine-rest"), top: 0, h: 0, last: "", live: false });
    }
    document.querySelectorAll("[data-tilt]").forEach(bindTilt);
    measure();
  }

  function frame() {
    raf = 0;
    var calm = reduced();
    var y = window.scrollY || window.pageYOffset;
    for (var i = 0; i < scenes.length; i++) {
      var s = scenes[i], p, top = s.top - y;
      if (calm) {
        p = s.rest != null ? +s.rest : s.mode === "exit" ? 0 : s.mode === "pin" ? 1 : 0.5;
      } else {
        var live = top + s.h > -vh * 0.5 && top < vh * 1.5;
        if (live !== s.live) { s.live = live; s.el.classList.toggle("is-live", live); }
        if (top + s.h < -vh || top > vh * 2) continue;
        if (s.mode === "exit") p = clamp(-top / (s.h * 0.85));
        else if (s.mode === "pin") { var span = s.h - vh; p = span > 0 ? clamp(-top / span) : 1; }
        else p = clamp((vh - top) / (vh + s.h));
      }
      var v = p.toFixed(4);
      if (v !== s.last) { s.last = v; s.el.style.setProperty("--cp", v); }
    }
  }
  function req() { if (!raf) raf = requestAnimationFrame(frame); }

  /* 포인터 카메라 — 들어올 때 한 번만 재고, 움직일 때는 계산만 */
  function bindTilt(el) {
    if (el.__tilt) return;
    el.__tilt = 1;
    var tr = 0, box = null, x = 0, y = 0;
    var write = function () {
      tr = 0;
      el.style.setProperty("--rx", x.toFixed(3));
      el.style.setProperty("--ry", y.toFixed(3));
    };
    var move = function (ev) {
      if (reduced()) return;
      if (ev.pointerType === "touch" && !el.__down) return;
      if (!box) { box = el.getBoundingClientRect(); el.classList.add("is-tilt"); }
      x = Math.max(-1, Math.min(1, ((ev.clientX - box.left) / box.width) * 2 - 1));
      y = Math.max(-1, Math.min(1, ((ev.clientY - box.top) / box.height) * 2 - 1));
      if (!tr) tr = requestAnimationFrame(write);
    };
    var reset = function () {
      el.__down = 0; box = null; x = 0; y = 0;
      if (tr) { cancelAnimationFrame(tr); tr = 0; }
      write();
      el.classList.remove("is-tilt");
    };
    el.addEventListener("pointerdown", function (ev) { if (ev.pointerType === "touch") { el.__down = 1; box = null; move(ev); } });
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", reset);
    el.addEventListener("pointerup", function (ev) { if (ev.pointerType === "touch") reset(); });
    el.addEventListener("pointercancel", reset);
    window.addEventListener("scroll", function () { box = null; }, { passive: true });
  }

  window.addEventListener("scroll", req, { passive: true });
  /* 폰 주소창이 접히고 펴질 때도 resize 가 온다 — 위치를 다시 잰다 */
  var rt = 0;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(measure, 80); }, { passive: true });
  if (mq && mq.addEventListener) mq.addEventListener("change", function () {
    for (var i = 0; i < scenes.length; i++) { scenes[i].last = ""; scenes[i].live = false; scenes[i].el.classList.remove("is-live"); }
    measure();
  });
  /* 문서 높이가 바뀌면(이미지 로드·접이식 펼침) 위치만 다시 잰다 */
  if (window.ResizeObserver) {
    var mt = 0;
    new ResizeObserver(function () { clearTimeout(mt); mt = setTimeout(measure, 60); }).observe(document.body);
  }
  /* React 가 화면을 이어받은 뒤(하이드레이션) 한 번 — app.jsx 가 cine:scan 을 보낸다 */
  window.addEventListener("cine:scan", scan);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", scan);
  else scan();
  window.addEventListener("load", measure);
})();
