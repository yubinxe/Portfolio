/* mnav.js — 모바일 전체 메뉴 (760px 이하에서 헤더의 '메뉴' 버튼이 연다)
 * 버튼은 각 페이지 헤더에 [data-mnav-toggle] 로 들어 있고(메인은 React Nav), 패널은 이 스크립트가 body 끝에 만든다.
 * 접근성: aria-expanded/aria-controls · Esc·바깥·링크 클릭 시 닫기 · 초점 가두기와 복귀 · 열린 동안 스크롤 잠금 */
(function () {
  "use strict";
  if (window.__YK_MNAV__) return;
  window.__YK_MNAV__ = true;

  // Vercel cleanUrls(/gallery)와 GitHub Pages(/Portfolio/gallery.html)를 모두 같은 이름으로 본다
  var path = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "") + ".html";
  var onIndex = path === "index.html";
  var base = onIndex ? "" : "index.html";
  var LINKS = [
    ["소개", base + "#about"], ["역량", base + "#composite"], ["프로젝트", base + "#artifacts"], ["이력", base + "#trajectory"],
    ["강의", onIndex ? "#lectures" : "lecture.html"], ["갤러리", "gallery.html"], ["경력 상세", "career.html"], ["연락", base + "#contact"],
  ];
  var current = { "gallery.html": "갤러리", "lecture.html": "강의", "career.html": "경력 상세" }[path];

  var panel = document.createElement("div");
  panel.id = "mnav";
  panel.className = "mnav";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "전체 메뉴");
  panel.innerHTML =
    '<div class="mnav__sheet">' +
      '<div class="mnav__top"><span class="mnav__brand font-serif">Yubin Kim</span><button type="button" class="mnav__close" aria-label="메뉴 닫기">닫기</button></div>' +
      '<nav aria-label="전체 메뉴"><ol class="mnav__list">' +
        LINKS.map(function (l, i) {
          return '<li><a href="' + l[1] + '"' + (current === l[0] ? ' aria-current="page"' : "") + '><span class="mnav__n font-sans">' +
            (i < 9 ? "0" : "") + (i + 1) + "</span>" + l[0] + "</a></li>";
        }).join("") +
      "</ol></nav>" +
      '<a class="mnav__cta" href="mailto:yubin120866@gmail.com?subject=%5B%EA%B0%95%EC%9D%98%20%EC%9D%98%EB%A2%B0%5D" data-lecture-consult="">강의 의뢰하기</a>' +
    "</div>";
  document.body.appendChild(panel);

  var lastBtn = null;
  function btns() { return document.querySelectorAll("[data-mnav-toggle]"); }
  function setExpanded(v) { btns().forEach(function (b) { b.setAttribute("aria-expanded", v ? "true" : "false"); }); }
  function focusables() { return panel.querySelectorAll("a[href], button"); }

  function open(btn) {
    lastBtn = btn || null;
    panel.hidden = false;
    // 다음 프레임에 클래스를 붙여야 전환이 보인다
    requestAnimationFrame(function () { panel.classList.add("on"); });
    document.documentElement.classList.add("mnav-lock");
    setExpanded(true);
    var first = panel.querySelector(".mnav__list a");
    first && first.focus();
  }
  function close(restore) {
    if (panel.hidden) return;
    panel.classList.remove("on");
    panel.hidden = true;
    document.documentElement.classList.remove("mnav-lock");
    setExpanded(false);
    if (restore !== false && lastBtn) lastBtn.focus();
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-mnav-toggle]");
    if (t) { e.preventDefault(); panel.hidden ? open(t) : close(); return; }
    if (panel.hidden) return;
    if (e.target === panel) { close(); return; }
    var a = e.target.closest && e.target.closest(".mnav a, .mnav__close");
    if (!a) return;
    if (a.classList.contains("mnav__close")) { close(); return; }
    // 링크: 같은 페이지 앵커는 스크롤만, 다른 페이지는 이동. 어느 쪽이든 패널을 먼저 닫는다
    close(false);
  });
  document.addEventListener("keydown", function (e) {
    if (panel.hidden) return;
    if (e.key === "Escape") { close(); return; }
    if (e.key !== "Tab") return;
    var f = focusables(), first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  // 화면이 넓어지면(회전 등) 패널을 닫는다 — 데스크톱 메뉴와 겹치지 않게
  var mq = window.matchMedia("(min-width: 761px)");
  (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(function (m) { if (m.matches) close(false); });
})();
