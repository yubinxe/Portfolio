/* ============================================================================
 * chatbot.js — 유빈 AI · Yubin Kim Office 포트폴리오 컨시어지 위젯
 * ----------------------------------------------------------------------------
 * · 순수 JavaScript, 의존성 0. <script src="kb.js" defer></script>
 *   <script src="chatbot.js" defer></script> 두 줄로 탑재. (kb.js 는 지식카드 원장)
 * · 사이트 디자인 시스템(navy #1F2D6B · ink · ecru · Pretendard/Playfair · bounce)에
 *   맞춰 자체 스타일을 주입합니다. --accent 등 사이트 CSS 변수를 그대로 상속합니다.
 * · 백엔드 /api/chat 스트리밍을 실시간 수신. 백엔드가 없으면(예: GitHub Pages)
 *   내장 지식카드로 자동 폴백해 언제나 답변합니다.
 * · 딥링크 엔진: 답변의 CTA/링크가 사이트 내부(페이지#앵커)를 가리키면
 *   같은 페이지 → 스크롤 + 스포트라이트, 다른 페이지 → 이동 후 자동 하이라이트.
 * · 무료 상담(리드) 흐름: 상담 내용을 정리해 /api/lead 로 전송. 서버 실패 시
 *   상담 내용이 그대로 채워진 문의 폼(mailto)으로 이어져 리드가 유실되지 않습니다.
 *
 * 선택적 설정:
 *   window.YUBIN_CHAT_CONFIG = { endpoint:"/api/chat", leadEndpoint:"/api/lead", accent:"#1F2D6B" }
 *   또는 <script src="chatbot.js" data-endpoint="/api/chat" data-accent="#1F2D6B">
 * ========================================================================== */
(function () {
  "use strict";
  if (window.__YUBIN_CHAT__) return; // 중복 로드 방지
  window.__YUBIN_CHAT__ = true;

  /* ---------------------------------------------------------------- config */
  var scriptEl =
    document.currentScript ||
    document.querySelector('script[src*="chatbot.js"]');
  var ds = (scriptEl && scriptEl.dataset) || {};
  var CFG = Object.assign(
    {
      endpoint: "/api/chat",
      leadEndpoint: "/api/lead",
      accent: "", // 비우면 사이트의 --accent 상속
      brandKo: "유빈 AI",
      brandEn: "Yubin Kim Office",
      title: "무엇이든 물어보세요",
      subtitle: "김유빈 님의 역량 · 프로젝트 · 경력을 안내합니다",
      greeting:
        "안녕하세요. **김유빈 님의 포트폴리오**를 안내하는 컨시어지 **유빈 AI**입니다.\n핵심 역량, 대표 프로젝트, 경력, 자격, 협업 방법까지 무엇이든 물어보세요. 답변의 버튼을 누르면 해당 위치로 바로 안내합니다.",
      teaser: "궁금한 점이 있으신가요?",
      email: "yubin120866@gmail.com",
      model: "gpt-4o-mini",
      // ⚠️ openaiKey는 커밋되는 코드에 넣지 마세요 — 공개 레포에 올리면 키가 노출됩니다.
      //    브라우저 콘솔에서 YubinChat.setKey('sk-...') 로 이 브라우저(localStorage)에만 저장하세요.
      openaiKey: "",
    },
    window.YUBIN_CHAT_CONFIG || {},
    ds.endpoint ? { endpoint: ds.endpoint } : {},
    ds.leadEndpoint ? { leadEndpoint: ds.leadEndpoint } : {},
    ds.accent ? { accent: ds.accent } : {},
    ds.model ? { model: ds.model } : {}
  );

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STORE_KEY = "yk_chat_history_v2";
  var DEEPLINK_KEY = "yk_deeplink";

  /* ------------------------------------------------ 지식 원장 (kb.js 우선) */
  var EXT = window.YUBIN_KB || null;
  var PROFILE = {
    nameKo: "김유빈",
    email: (EXT && EXT.email) || CFG.email,
    site: (EXT && EXT.site) || "https://yubinxe.github.io/Portfolio/",
  };
  var SUGGESTIONS = (EXT && EXT.suggestions) || [
    { label: "핵심 역량 요약", query: "김유빈 님의 핵심 역량을 한눈에 요약해 주세요." },
    { label: "대표 프로젝트 3선", query: "가장 대표적인 프로젝트 3가지를 링크와 함께 소개해 주세요." },
    { label: "경력·이력 타임라인", query: "지금까지의 경력과 교육 이력을 최신순으로 정리해 주세요." },
    { label: "무료 상담 신청", query: "__consult__" },
  ];
  /* kb.js 가 없을 때의 최소 폴백 카드 (kb.js 가 정본) */
  var KB = (EXT && EXT.cards) || [
    { id: "profile", tags: ["소개", "누구", "김유빈", "about"], title: "인물 개요",
      body: "김유빈(Yubin Kim) · 2004년생. 법무법인 경국 사원으로 대외협력 · 마케팅 · 개발을 맡아 AI Process Innovation을 담당합니다.",
      primary: { label: "선언 보기", href: "index.html#manifesto" }, secondary: null },
    { id: "contact", tags: ["연락", "이메일", "협업", "채용", "문의"], title: "연락·협업",
      body: "협업·채용·프로젝트 문의: [" + PROFILE.email + "](mailto:" + PROFILE.email + ")",
      primary: { label: "연락 섹션", href: "index.html#contact" }, secondary: null },
  ];
  var CONSULT = (EXT && EXT.consult) || {
    trigger: ["상담", "견적", "의뢰", "제안", "채용", "협업", "문의"],
    steps: [
      { key: "need", ask: "어떤 과제를 함께 풀고 싶으신가요?" },
      { key: "context", ask: "조직과 현재 상황을 한 줄로 알려주세요." },
      { key: "contact", ask: "회신받으실 이메일(또는 연락처)을 남겨주세요." },
    ],
    closing: "정리한 내용을 김유빈 님께 전달했습니다.",
    fallbackClosing: "서버 전송이 어려워 이메일 작성 화면으로 연결했습니다. 정리된 상담 내용이 그대로 담겨 있으니 '보내기'만 누르시면 됩니다.",
  };

  /* --------------------------------------------------------------- helpers */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function isExternal(href) { return /^(https?:|mailto:|tel:)/i.test(href || ""); }
  /* 현재 페이지 파일명. 확장자 없는 clean URL(/gallery)도 gallery.html 로 해석 */
  function pageOf(pathname) {
    var f = (pathname || "").split("/").pop();
    if (!f) return "index.html";
    if (/\.html$/i.test(f)) return f.toLowerCase();
    if (/\.[a-z0-9]+$/i.test(f)) return "index.html"; // 다른 확장자 → 기준은 index
    return f.toLowerCase() + ".html";
  }
  /* "career.html#cv-ssafy" → { page, hash } · "#trajectory" → 현재 페이지 */
  function parseInternal(href) {
    var m = /^(?:([\w.-]+\.html))?(?:#([\w-]+))?$/.exec(href || "");
    if (!m || (!m[1] && !m[2])) return null;
    return { page: (m[1] || pageOf(location.pathname)).toLowerCase(), hash: m[2] || "" };
  }
  function absUrl(href) {
    if (isExternal(href)) return href;
    var p = parseInternal(href);
    if (!p) return href;
    var base = location.pathname.replace(/[^/]*$/, "");
    return base + (p.page === "index.html" && /\/$/.test(location.pathname) ? "" : p.page) + (p.hash ? "#" + p.hash : "");
  }

  /* 안전한 마크다운-라이트 렌더: 링크 · 굵게 · 불릿 · 자동링크 */
  function mdLite(text) {
    var safe = escapeHtml(text);
    var lines = safe.split("\n").map(function (line) {
      var bullet = /^\s*[-·•*]\s+/.test(line);
      var body = line.replace(/^\s*[-·•*]\s+/, "");
      // [text](url)
      body = body.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, t, u) {
        var safeUrl = /^(https?:|mailto:|#|\/|[\w.-]+\.html)/.test(u) ? u : "#";
        var internal = !isExternal(safeUrl) && parseInternal(safeUrl);
        if (internal) return '<a href="' + escapeHtml(absUrl(safeUrl)) + '" data-yk-go="' + escapeHtml(safeUrl) + '">' + t + "</a>";
        return '<a href="' + safeUrl + '" target="_blank" rel="noopener noreferrer">' + t + "</a>";
      });
      // 남은 순수 URL 자동 링크 (href 내부 제외)
      body = body.replace(/(^|[^"'>=\]])(https?:\/\/[^\s<)]+)(?![^<]*<\/a>)/g, function (m, pre, url) {
        var clean = url.replace(/[.,;)]+$/, "");
        var tail = url.slice(clean.length);
        var site = PROFILE.site.replace(/\/$/, "");
        if (clean.indexOf(site) === 0) { // 사이트 내부 절대 URL → 딥링크
          var rel = clean.slice(site.length).replace(/^\//, "") || "index.html";
          return pre + '<a href="' + clean + '" data-yk-go="' + escapeHtml(rel) + '">' + clean + "</a>" + tail;
        }
        return pre + '<a href="' + clean + '" target="_blank" rel="noopener noreferrer">' + clean + "</a>" + tail;
      });
      // **bold**
      body = body.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      return bullet ? '<span class="yk-li">' + body + "</span>" : body;
    });
    return lines.join("<br>");
  }

  /* ------------------------------------------------------------ 딥링크 엔진 */
  var SPOT_MS = 2600;
  function spotlight(target) {
    if (!target) return;
    target.classList.add("in"); // reveal 블러 즉시 해제
    target.classList.add("yk-spotlight");
    setTimeout(function () { target.classList.remove("yk-spotlight"); }, SPOT_MS);
  }
  function scrollToHash(hash, tries) {
    var t = hash && document.getElementById(hash);
    if (!t) {
      // React(index.html) 마운트 대기 — 최대 ~4초
      if ((tries || 0) < 40) return setTimeout(function () { scrollToHash(hash, (tries || 0) + 1); }, 100);
      return false;
    }
    var header = document.querySelector("header");
    var offset = (header ? header.offsetHeight : 72) + 18;
    var y = t.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, y), behavior: REDUCED ? "auto" : "smooth" });
    setTimeout(function () { spotlight(t); }, REDUCED ? 0 : 420);
    return true;
  }
  /* 내부 링크 이동: 같은 페이지면 스크롤+스포트라이트, 아니면 페이지 이동(플래그 저장) */
  function goTo(href) {
    if (isExternal(href)) { window.open(href, "_blank", "noopener"); return; }
    var p = parseInternal(href);
    if (!p) return;
    var here = pageOf(location.pathname);
    if (p.page === here) {
      if (p.hash) scrollToHash(p.hash);
      else window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" });
      if (window.innerWidth <= 480) close(); // 모바일: 패널이 화면을 가리므로 닫음
      return;
    }
    try { sessionStorage.setItem(DEEPLINK_KEY, p.hash || ""); } catch (e) {}
    document.body.classList.add("page-out");
    setTimeout(function () { location.href = p.page + (p.hash ? "#" + p.hash : ""); }, 220);
  }
  /* 페이지 진입 시: 딥링크 플래그 또는 해시가 있으면 자동 하이라이트 */
  function resumeDeepLink() {
    var flagged = null;
    try { flagged = sessionStorage.getItem(DEEPLINK_KEY); sessionStorage.removeItem(DEEPLINK_KEY); } catch (e) {}
    var hash = (location.hash || "").replace(/^#/, "");
    if (flagged !== null || hash) {
      var h = hash || flagged;
      if (h) setTimeout(function () { scrollToHash(h); }, 260);
    }
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-yk-go]");
    if (!a || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    goTo(a.getAttribute("data-yk-go"));
  });

  /* ---------------------------------------------------- 로컬 폴백 답변 엔진 */
  /* 랭킹은 kb.js 한 곳에서만 정의합니다(test/kb-rank.test.mjs 가 품질을 고정).
   * kb.js 로드 실패로 내장 축약본을 쓰는 경우에만 아래 단순 점수식으로 내려갑니다. */
  function scoreCards(query) {
    var q = (query || "").toLowerCase();
    if (EXT && typeof EXT.rank === "function") return EXT.rank(q, KB);
    return KB.map(function (c) {
      var s = 0;
      (c.tags || []).forEach(function (t) { if (q.indexOf(String(t).toLowerCase()) > -1) s += 2 + Math.min(String(t).length, 12); });
      if (c.title && q.indexOf(c.title.toLowerCase()) > -1) s += 6;
      return { c: c, s: s };
    }).sort(function (a, b) { return b.s - a.s; });
  }
  /* → { text, ctas:[{label,href}] } */
  function localAnswer(query) {
    var q = (query || "").toLowerCase();
    if (/(안녕|하이|hello|hi|반가|누구|소개)/.test(q) && q.length < 12) {
      return { text: "안녕하세요. 김유빈 님의 포트폴리오를 안내하는 **유빈 AI**입니다. 핵심 역량, 프로젝트, 경력, 자격, 협업 방법 중 무엇이 궁금하신가요?", ctas: [] };
    }
    var scored = scoreCards(q);
    if (!scored.length || scored[0].s === 0) {
      return {
        text: "그 내용은 포트폴리오에 담겨 있지 않습니다. **[" + PROFILE.email + "](mailto:" + PROFILE.email + ")** 로 문의하시면 김유빈 님이 직접 답변드립니다. 그 밖에 역량·프로젝트·경력·자격은 얼마든지 안내해 드릴게요.",
        ctas: [{ label: "무료 상담 신청", href: "__consult__" }],
      };
    }
    var top = scored.filter(function (x) { return x.s > 0; }).slice(0, 2);
    var ctas = [];
    top.forEach(function (x) {
      [x.c.primary, x.c.secondary].forEach(function (cta) {
        if (!cta || !cta.href) return;
        if (ctas.some(function (y) { return y.href === cta.href; })) return;
        ctas.push(cta);
      });
    });
    return { text: top.map(function (x) { return "**" + x.c.title + "**\n" + x.c.body; }).join("\n\n"), ctas: ctas.slice(0, 3) };
  }

  /* ------------------------------------------------------ session storage */
  function loadHistory() {
    try { return JSON.parse(sessionStorage.getItem(STORE_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveHistory(h) {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(h.slice(-20))); }
    catch (e) { /* private mode 등 무시 */ }
  }

  /* ------------------------------------------------------------- 스타일 주입 */
  function injectStyles() {
    if (document.getElementById("yk-chat-style")) return;
    var accentRule = CFG.accent ? "--yk-accent:" + CFG.accent + ";" : "";
    var css = `
.yk-chat, .yk-chat *{ box-sizing:border-box; }
.yk-chat{
  --yk-accent: var(--accent, #1F2D6B);
  --yk-ink: var(--ink, #10131C);
  --yk-ink-soft: var(--ink-soft, #3C4354);
  --yk-ecru: var(--ecru, #F4F5F8);
  --yk-ecru-deep: var(--ecru-deep, #E9EBF0);
  --yk-paper: var(--paper, #FFFFFF);
  --yk-bounce: cubic-bezier(.34,1.56,.64,1);
  ${accentRule}
  font-family:"Pretendard","Inter",system-ui,-apple-system,sans-serif;
}
/* ---- 딥링크 스포트라이트 (페이지 요소에 부여) ---- */
.yk-spotlight{
  animation:yk-spot 2.6s ease-out both;
  border-radius:16px;
}
@keyframes yk-spot{
  0%{ box-shadow:0 0 0 0 rgba(31,45,107,.0), 0 0 0 9999px rgba(16,19,28,0); }
  12%{ box-shadow:0 0 0 6px rgba(31,45,107,.55), 0 0 0 9999px rgba(16,19,28,.22); }
  70%{ box-shadow:0 0 0 6px rgba(31,45,107,.35), 0 0 0 9999px rgba(16,19,28,.10); }
  100%{ box-shadow:0 0 0 0 rgba(31,45,107,0), 0 0 0 9999px rgba(16,19,28,0); }
}
/* ---- FAB ---- */
.yk-fab{
  position:fixed; right:24px; bottom:24px; z-index:120;
  width:60px; height:60px; border-radius:50%;
  background:var(--yk-accent); color:#fff; border:none; cursor:pointer;
  display:grid; place-items:center;
  box-shadow:0 10px 30px -8px rgba(31,45,107,.55), 0 2px 8px rgba(16,19,28,.2);
  transition:transform .4s var(--yk-bounce), box-shadow .4s var(--yk-bounce);
}
.yk-fab:hover{ transform:translateY(-3px) scale(1.05); box-shadow:0 16px 36px -10px rgba(31,45,107,.6); }
.yk-fab:active{ transform:translateY(-1px) scale(.98); }
.yk-fab svg{ width:26px; height:26px; transition:transform .45s var(--yk-bounce); }
.yk-fab .yk-x{ position:absolute; opacity:0; transform:rotate(-90deg) scale(.6); }
.yk-chat.open .yk-fab .yk-bubble-i{ opacity:0; transform:rotate(90deg) scale(.6); }
.yk-chat.open .yk-fab .yk-x{ opacity:1; transform:rotate(0) scale(1); }
.yk-fab__ping{
  position:absolute; top:11px; right:11px; width:11px; height:11px; border-radius:50%;
  background:#7C8AC4; border:2px solid var(--yk-accent);
}
.yk-fab__ping::after{
  content:""; position:absolute; inset:-2px; border-radius:50%;
  box-shadow:0 0 0 0 rgba(124,138,196,.6); animation:yk-ping 2.4s ease-out infinite;
}
@keyframes yk-ping{ 0%{box-shadow:0 0 0 0 rgba(124,138,196,.55);} 70%,100%{box-shadow:0 0 0 12px rgba(124,138,196,0);} }
/* ---- teaser ---- */
.yk-teaser{
  position:fixed; right:96px; bottom:34px; z-index:119; max-width:230px;
  background:var(--yk-ink); color:var(--yk-ecru);
  font-size:13.5px; line-height:1.5; font-weight:500;
  padding:11px 14px; border-radius:14px 14px 4px 14px;
  box-shadow:0 14px 34px -14px rgba(16,19,28,.5);
  opacity:0; transform:translateY(8px) scale(.96); transform-origin:bottom right;
  transition:opacity .4s ease, transform .4s var(--yk-bounce); pointer-events:none;
}
.yk-teaser.show{ opacity:1; transform:none; pointer-events:auto; }
.yk-teaser__close{ position:absolute; top:-7px; right:-7px; width:20px; height:20px; border-radius:50%;
  background:var(--yk-ecru); color:var(--yk-ink); border:none; font-size:12px; cursor:pointer; line-height:1; }
/* ---- panel ---- */
.yk-panel{
  position:fixed; right:24px; bottom:96px; z-index:121;
  width:390px; max-width:calc(100vw - 32px); height:610px; max-height:calc(100vh - 128px);
  background:var(--yk-paper); border:1.5px solid var(--yk-ink); border-radius:22px;
  display:flex; flex-direction:column; overflow:hidden;
  box-shadow:0 30px 70px -24px rgba(16,19,28,.5), 0 4px 14px -6px rgba(16,19,28,.28);
  opacity:0; transform:translateY(16px) scale(.97); transform-origin:bottom right;
  pointer-events:none;
  transition:opacity .34s ease, transform .34s var(--yk-bounce);
}
.yk-chat.open .yk-panel{ opacity:1; transform:none; pointer-events:auto; }
/* ---- header ---- */
.yk-head{ background:var(--yk-ink); color:var(--yk-ecru); padding:16px 18px 15px; position:relative; }
.yk-head__rule{ display:flex; align-items:center; color:rgba(244,245,248,.4); margin-bottom:11px; }
.yk-head__rule::before,.yk-head__rule::after{ content:""; width:5px; height:5px; background:currentColor; transform:rotate(45deg); }
.yk-head__rule i{ flex:1; height:1px; background:currentColor; margin:0 8px; }
.yk-head__row{ display:flex; align-items:center; gap:11px; }
.yk-mark{ width:38px; height:38px; border-radius:11px; background:var(--yk-accent);
  display:grid; place-items:center; font-family:"Playfair Display",serif; font-weight:900; font-size:16px; color:#fff; flex:none;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.16); }
.yk-head__meta{ min-width:0; flex:1; }
.yk-head__name{ font-weight:700; font-size:15px; letter-spacing:-.01em; display:flex; align-items:center; gap:7px; }
.yk-dot{ width:7px; height:7px; border-radius:50%; background:#8FE3B0; box-shadow:0 0 0 0 rgba(143,227,176,.6); animation:yk-live 2.2s ease-in-out infinite; }
@keyframes yk-live{ 0%,100%{box-shadow:0 0 0 0 rgba(143,227,176,.5);} 50%{box-shadow:0 0 0 5px rgba(143,227,176,0);} }
.yk-head__sub{ font-size:11.5px; color:rgba(244,245,248,.62); margin-top:2px; letter-spacing:.01em;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.yk-head__close{ background:transparent; border:none; color:rgba(244,245,248,.7); cursor:pointer;
  width:30px; height:30px; border-radius:8px; display:grid; place-items:center; transition:background .2s,color .2s; flex:none; }
.yk-head__close:hover{ background:rgba(244,245,248,.12); color:#fff; }
/* ---- body ---- */
.yk-body{ flex:1; overflow-y:auto; padding:18px; background:var(--yk-ecru);
  display:flex; flex-direction:column; gap:12px; scroll-behavior:smooth; }
.yk-body::-webkit-scrollbar{ width:8px; }
.yk-body::-webkit-scrollbar-thumb{ background:rgba(16,19,28,.16); border-radius:8px; border:2px solid var(--yk-ecru); }
.yk-msg{ display:flex; gap:9px; max-width:90%; animation:yk-in .4s var(--yk-bounce) both; }
@keyframes yk-in{ from{opacity:0; transform:translateY(8px);} to{opacity:1; transform:none;} }
.yk-msg__ava{ width:27px; height:27px; border-radius:8px; background:var(--yk-accent); color:#fff; flex:none;
  display:grid; place-items:center; font-family:"Playfair Display",serif; font-weight:900; font-size:11px; margin-top:2px; }
.yk-msg__col{ min-width:0; display:flex; flex-direction:column; gap:7px; }
.yk-msg__bubble{ padding:11px 13px; border-radius:14px; font-size:14px; line-height:1.66; letter-spacing:-.006em; word-break:break-word; }
.yk-msg.bot .yk-msg__bubble{ background:var(--yk-paper); color:var(--yk-ink); border:1px solid rgba(16,19,28,.12); border-top-left-radius:5px;
  box-shadow:0 2px 10px rgba(16,19,28,.05); }
.yk-msg.me{ align-self:flex-end; flex-direction:row-reverse; }
.yk-msg.me .yk-msg__bubble{ background:var(--yk-accent); color:#fff; border-top-right-radius:5px; }
.yk-msg.me .yk-msg__ava{ background:var(--yk-ink); }
.yk-msg__bubble a{ color:inherit; text-decoration:underline; text-underline-offset:2px; font-weight:600; }
.yk-msg.bot .yk-msg__bubble a{ color:var(--yk-accent); }
.yk-li{ display:block; padding-left:14px; position:relative; }
.yk-li::before{ content:"·"; position:absolute; left:3px; color:var(--yk-accent); font-weight:900; }
.yk-msg.me .yk-li::before{ color:rgba(255,255,255,.7); }
/* ---- CTA (딥링크 버튼) ---- */
.yk-cta{ display:flex; flex-wrap:wrap; gap:6px; }
.yk-cta__btn{ font:inherit; font-size:12.5px; font-weight:700; color:#fff; background:var(--yk-accent);
  border:1.3px solid var(--yk-accent); border-radius:999px; padding:6px 12px; cursor:pointer;
  display:inline-flex; align-items:center; gap:5px; transition:transform .3s var(--yk-bounce), background .2s; }
.yk-cta__btn:hover{ transform:translateY(-2px); }
.yk-cta__btn--ghost{ background:var(--yk-paper); color:var(--yk-accent); }
.yk-cta__btn svg{ width:13px; height:13px; }
/* ---- 리드 폼 ---- */
.yk-form{ background:var(--yk-paper); border:1px solid rgba(16,19,28,.12); border-radius:14px; padding:12px; display:flex; flex-direction:column; gap:8px; }
.yk-form label{ font-size:11.5px; font-weight:700; color:var(--yk-ink-soft); letter-spacing:.02em; }
.yk-form input,.yk-form textarea{ width:100%; font:inherit; font-size:13.5px; border:1.3px solid rgba(16,19,28,.16); border-radius:10px;
  padding:8px 10px; background:var(--yk-ecru); color:var(--yk-ink); outline:none; cursor:auto !important; }
.yk-form input:focus,.yk-form textarea:focus{ border-color:var(--yk-accent); }
.yk-form textarea{ resize:vertical; min-height:74px; }
.yk-form__row{ display:flex; gap:8px; justify-content:flex-end; margin-top:2px; }
.yk-form__err{ font-size:12px; color:#A02B23; font-weight:600; }
/* typing */
.yk-typing{ display:inline-flex; gap:4px; padding:3px 0; }
.yk-typing span{ width:7px; height:7px; border-radius:50%; background:var(--yk-accent); opacity:.4; animation:yk-bounce2 1.2s infinite; }
.yk-typing span:nth-child(2){ animation-delay:.15s; } .yk-typing span:nth-child(3){ animation-delay:.3s; }
@keyframes yk-bounce2{ 0%,60%,100%{transform:translateY(0);opacity:.35;} 30%{transform:translateY(-5px);opacity:.9;} }
/* ---- quick chips ---- */
.yk-quick{ display:flex; flex-wrap:wrap; gap:7px; padding:0 18px 4px; }
.yk-chip{ font-size:12.5px; font-weight:600; color:var(--yk-ink); background:var(--yk-paper);
  border:1.3px solid var(--yk-ink); border-radius:999px; padding:6px 12px; cursor:pointer;
  transition:background .22s,color .22s,transform .3s var(--yk-bounce); }
.yk-chip:hover{ background:var(--yk-accent); border-color:var(--yk-accent); color:#fff; transform:translateY(-2px); }
.yk-chip--accent{ background:var(--yk-accent); border-color:var(--yk-accent); color:#fff; }
/* ---- input ---- */
.yk-input{ border-top:1px solid rgba(16,19,28,.1); background:var(--yk-paper); padding:11px 12px 12px;
  display:flex; align-items:flex-end; gap:8px; }
.yk-input textarea{ flex:1; resize:none; border:1.4px solid rgba(16,19,28,.16); border-radius:14px;
  padding:10px 12px; font:inherit; font-size:14px; line-height:1.5; max-height:104px; color:var(--yk-ink);
  background:var(--yk-ecru); outline:none; cursor:auto !important; transition:border-color .2s; }
.yk-input textarea:focus{ border-color:var(--yk-accent); }
.yk-send{ width:40px; height:40px; border-radius:12px; border:none; background:var(--yk-accent); color:#fff;
  cursor:pointer; flex:none; display:grid; place-items:center; transition:transform .3s var(--yk-bounce), opacity .2s; }
.yk-send:hover{ transform:translateY(-2px) scale(1.05); } .yk-send:disabled{ opacity:.4; cursor:default; transform:none; }
.yk-foot{ text-align:center; font-size:10.5px; color:var(--yk-ink-soft); opacity:.6; padding:0 0 9px; background:var(--yk-paper); letter-spacing:.02em; }
.yk-foot b{ font-weight:700; }
/* ---- mobile ---- */
@media (max-width:480px){
  .yk-panel{ right:0; bottom:0; width:100vw; max-width:100vw; height:88vh; max-height:88vh; border-radius:20px 20px 0 0; border-width:1.5px 0 0; }
  .yk-fab{ right:16px; bottom:16px; } .yk-teaser{ display:none; }
}
@media (prefers-reduced-motion:reduce){
  .yk-fab,.yk-panel,.yk-msg,.yk-chip,.yk-send,.yk-teaser,.yk-cta__btn{ transition:none !important; animation:none !important; }
  .yk-fab__ping::after,.yk-dot,.yk-typing span{ animation:none !important; }
  .yk-spotlight{ animation:none; box-shadow:0 0 0 4px rgba(31,45,107,.5); }
}
`;
    var style = el("style");
    style.id = "yk-chat-style";
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ---------------------------------------------------------------- icons */
  var ICON_BUBBLE =
    '<svg class="yk-bubble-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.9-.9L3 21l1.9-5.6A8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/><path d="M8.5 12h7M8.5 9h4"/></svg>';
  var ICON_X =
    '<svg class="yk-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  var ICON_SEND =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
  var ICON_ARROW =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>';
  var ICON_PIN =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.6"/></svg>';

  /* ----------------------------------------------------------- build DOM */
  var history = loadHistory();
  var root, panel, body, quick, textarea, sendBtn, teaser, busy = false, localMode = false, greeted = false;
  var consult = null; // { step, data:{} } — 진행 중 상담 흐름

  function build() {
    injectStyles();
    root = el("div", "yk-chat");
    root.setAttribute("data-yk", "");
    // 랜드마크 안에 두어 스크린리더가 위젯 전체를 하나의 영역으로 인식하게 한다
    root.setAttribute("role", "complementary");
    root.setAttribute("aria-label", CFG.brandKo + " 포트폴리오 안내 챗봇");

    // FAB
    var fab = el("button", "yk-fab");
    fab.type = "button";
    fab.setAttribute("aria-label", "챗봇 열기");
    fab.setAttribute("aria-expanded", "false");
    fab.innerHTML = ICON_BUBBLE + ICON_X + '<span class="yk-fab__ping"></span>';
    fab.addEventListener("click", toggle);

    // teaser
    teaser = el("div", "yk-teaser");
    teaser.setAttribute("role", "status");
    teaser.innerHTML =
      '<button class="yk-teaser__close" aria-label="닫기">&times;</button>' +
      escapeHtml(CFG.teaser);
    teaser.addEventListener("click", function (e) {
      if (e.target.classList.contains("yk-teaser__close")) { hideTeaser(true); e.stopPropagation(); return; }
      open();
    });

    // panel
    panel = el("div", "yk-panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-label", CFG.brandKo + " 챗봇");

    var head = el("div", "yk-head");
    head.innerHTML =
      '<div class="yk-head__rule"><i></i></div>' +
      '<div class="yk-head__row">' +
        '<div class="yk-mark">YK</div>' +
        '<div class="yk-head__meta">' +
          '<div class="yk-head__name"><span class="yk-dot"></span>' + escapeHtml(CFG.brandKo) +
            ' <span style="font-weight:500;font-size:11px;opacity:.6;letter-spacing:.06em">· ' + escapeHtml(CFG.brandEn) + "</span></div>" +
          '<div class="yk-head__sub">' + escapeHtml(CFG.subtitle) + "</div>" +
        "</div>" +
        '<button class="yk-head__close" aria-label="닫기">' + ICON_X.replace("yk-x", "") + "</button>" +
      "</div>";
    head.querySelector(".yk-head__close").addEventListener("click", close);

    body = el("div", "yk-body");

    quick = el("div", "yk-quick");
    SUGGESTIONS.forEach(function (s) {
      var isConsult = s.query === "__consult__";
      var chip = el("button", "yk-chip" + (isConsult ? " yk-chip--accent" : ""), escapeHtml(s.label));
      chip.type = "button";
      chip.addEventListener("click", function () { isConsult ? startConsult() : send(s.query); });
      quick.appendChild(chip);
    });

    var inputBar = el("div", "yk-input");
    textarea = el("textarea");
    textarea.rows = 1;
    textarea.placeholder = "메시지를 입력하세요…";
    textarea.setAttribute("aria-label", "메시지 입력");
    textarea.addEventListener("input", autosize);
    textarea.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
    });
    sendBtn = el("button", "yk-send", ICON_SEND);
    sendBtn.type = "button";
    sendBtn.setAttribute("aria-label", "전송");
    sendBtn.addEventListener("click", function () { send(); });
    inputBar.appendChild(textarea);
    inputBar.appendChild(sendBtn);

    var foot = el("div", "yk-foot", '<b>' + escapeHtml(CFG.brandKo) + '</b> · 답변은 포트폴리오 근거로 생성됩니다');

    panel.appendChild(head);
    panel.appendChild(body);
    panel.appendChild(quick);
    panel.appendChild(inputBar);
    panel.appendChild(foot);

    root.appendChild(teaser);
    root.appendChild(panel);
    root.appendChild(fab);
    document.body.appendChild(root);

    // 저장된 대화 복원
    if (history.length) {
      greeted = true;
      history.forEach(function (m) { renderMessage(m.role === "user" ? "me" : "bot", m.content, m.ctas); });
      hideQuick();
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("open")) close();
    });

    // 첫 방문 티저
    if (!REDUCED && !history.length) {
      setTimeout(function () { if (!root.classList.contains("open")) showTeaser(); }, 2600);
    }

    resumeDeepLink();
  }

  /* ------------------------------------------------------------ behaviors */
  function autosize() {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 104) + "px";
  }
  function showTeaser() { teaser.classList.add("show"); }
  function hideTeaser() { teaser && teaser.classList.remove("show"); }
  function hideQuick() { if (quick) quick.style.display = "none"; }

  function toggle() { root.classList.contains("open") ? close() : open(); }
  function open() {
    root.classList.add("open");
    root.querySelector(".yk-fab").setAttribute("aria-expanded", "true");
    hideTeaser();
    if (!greeted) { greeted = true; renderMessage("bot", CFG.greeting); }
    setTimeout(function () { textarea && textarea.focus(); }, 340);
    scrollBottom();
  }
  function close() {
    root.classList.remove("open");
    root.querySelector(".yk-fab").setAttribute("aria-expanded", "false");
  }

  function scrollBottom() { if (body) body.scrollTop = body.scrollHeight; }

  function renderCtas(col, ctas) {
    if (!ctas || !ctas.length) return;
    var row = el("div", "yk-cta");
    ctas.forEach(function (c, i) {
      var b = el("button", "yk-cta__btn" + (i ? " yk-cta__btn--ghost" : ""));
      b.type = "button";
      b.innerHTML = escapeHtml(c.label) + (c.href === "__consult__" ? "" : (isExternal(c.href) ? ICON_ARROW : ICON_PIN));
      b.addEventListener("click", function () {
        if (c.href === "__consult__") startConsult();
        else goTo(c.href);
      });
      row.appendChild(b);
    });
    col.appendChild(row);
  }

  function renderMessage(kind, text, ctas) {
    var msg = el("div", "yk-msg " + kind);
    var ava = el("div", "yk-msg__ava", kind === "me" ? "나" : "YK");
    var col = el("div", "yk-msg__col");
    var bubble = el("div", "yk-msg__bubble");
    bubble.innerHTML = mdLite(text);
    col.appendChild(bubble);
    renderCtas(col, ctas);
    msg.appendChild(ava);
    msg.appendChild(col);
    body.appendChild(msg);
    scrollBottom();
    bubble.__col = col;
    return bubble;
  }

  function renderTyping() {
    var msg = el("div", "yk-msg bot");
    msg.appendChild(el("div", "yk-msg__ava", "YK"));
    var bubble = el("div", "yk-msg__bubble");
    bubble.innerHTML = '<span class="yk-typing"><span></span><span></span><span></span></span>';
    msg.appendChild(bubble);
    body.appendChild(msg);
    scrollBottom();
    return { msg: msg, bubble: bubble };
  }

  function pushBot(text, ctas) {
    history.push({ role: "assistant", content: text, ctas: ctas || [] });
    saveHistory(history);
  }

  /* --------------------------------------------------------------- send */
  function send(preset) {
    if (busy) return;
    var text = (preset != null ? preset : textarea.value).trim();
    if (!text) return;
    if (text === "__consult__") { startConsult(); return; }

    hideTeaser(); hideQuick();
    renderMessage("me", text);
    history.push({ role: "user", content: text });
    saveHistory(history);
    textarea.value = ""; autosize();

    if (consult) { consultStep(text); return; }
    if (isConsultIntent(text)) { startConsult(text); return; }

    busy = true; sendBtn.disabled = true;
    var typing = renderTyping();
    respond(text, typing);
  }

  function respond(text, typing) {
    var acc = "";
    var started = false;
    var bubble = null;

    function ensureBubble() {
      if (!started) {
        started = true;
        typing.msg.remove();
        bubble = renderMessage("bot", "");
      }
    }
    function onToken(tok) {
      acc += tok;
      ensureBubble();
      bubble.innerHTML = mdLite(acc);
      scrollBottom();
    }
    function finish() {
      if (!started) { // 토큰이 하나도 안 온 경우 → 로컬 답변
        typing.msg.remove();
        var la = localAnswer(text);
        bubble = renderMessage("bot", la.text, la.ctas);
        acc = la.text;
        pushBot(acc, la.ctas);
      } else {
        // 서버 답변에도 관련 카드의 딥링크 CTA 를 덧붙임 (근거 위치 안내)
        var ctas = localAnswer(text).ctas.filter(function (c) { return c.href !== "__consult__"; }).slice(0, 2);
        renderCtas(bubble.__col, ctas);
        pushBot(acc, ctas);
      }
      busy = false; sendBtn.disabled = false;
      textarea.focus();
    }
    function fallback() {
      // 서버 실패 → 로컬 지식으로 타이핑 효과
      localMode = true;
      var la = localAnswer(text);
      ensureBubble();
      typeOut(bubble, la.text, function () {
        acc = la.text;
        renderCtas(bubble.__col, la.ctas);
        pushBot(acc, la.ctas);
        busy = false; sendBtn.disabled = false;
      });
    }

    // 전송 경로 선택:
    //  · 서버(/api/chat)가 있으면 우선 (키가 서버에만 있어 가장 안전 — Vercel 등)
    //  · 정적 호스팅(GitHub Pages)이고 브라우저에 키가 있으면 OpenAI 직접 호출
    //  · 둘 다 아니면 내장 지식 폴백
    var transport = chooseTransport();
    if (transport === "local") { fallback(); return; }
    if (transport === "direct") { streamOpenAIDirect(history, onToken, finish, fallback); return; }
    streamServer(history, onToken, finish, function () {
      if (getKey()) streamOpenAIDirect(history, onToken, finish, fallback);
      else fallback();
    });
  }

  function chooseTransport() {
    if (localMode) return "local";
    if (getKey()) return "direct";       // 브라우저에 키가 있으면 직접 호출
    if (isStaticHost()) return "local";  // GitHub Pages + 키 없음 → 폴백
    return "server";
  }

  function getKey() {
    if (CFG.openaiKey) return CFG.openaiKey;
    try { return localStorage.getItem("YUBIN_OPENAI_KEY") || ""; } catch (e) { return ""; }
  }
  function isStaticHost() {
    try { return (/(^|\.)github\.io$/.test(location.hostname) || location.protocol === "file:") && CFG.endpoint === "/api/chat"; }
    catch (e) { return false; }
  }

  /* ------------------------------------------------------- 무료 상담 흐름 */
  function isConsultIntent(text) {
    var q = (text || "").toLowerCase();
    return (CONSULT.trigger || []).some(function (t) { return q.indexOf(String(t).toLowerCase()) > -1; }) &&
      /(신청|하고 싶|원해|가능|할 수|받고|부탁|드리|주세요|요청|want|request|book)/.test(q);
  }
  function startConsult(firstText) {
    hideTeaser(); hideQuick();
    open();
    consult = { step: 0, data: {}, page: pageOf(location.pathname) };
    if (firstText) consult.data.opening = firstText;
    var intro = "**무료 상담 신청**을 도와드리겠습니다. 세 가지만 여쭙겠습니다.\n" + CONSULT.steps[0].ask;
    renderMessage("bot", intro);
    pushBot(intro);
    setTimeout(function () { textarea && textarea.focus(); }, 200);
  }
  function consultStep(answer) {
    var step = CONSULT.steps[consult.step];
    consult.data[step.key] = answer;
    consult.step += 1;
    if (consult.step < CONSULT.steps.length) {
      var ask = CONSULT.steps[consult.step].ask;
      renderMessage("bot", ask);
      pushBot(ask);
      return;
    }
    // 모든 단계 완료 → 확인 폼 (수정 가능) 표시
    var data = consult.data; consult = null;
    renderLeadForm(data);
  }
  function summarize(data) {
    return [
      data.opening ? "첫 메시지: " + data.opening : "",
      "과제: " + (data.need || ""),
      "상황: " + (data.context || ""),
      "연락처: " + (data.contact || ""),
    ].filter(Boolean).join("\n");
  }
  function renderLeadForm(data) {
    var msg = el("div", "yk-msg bot");
    msg.appendChild(el("div", "yk-msg__ava", "YK"));
    var col = el("div", "yk-msg__col");
    var bubble = el("div", "yk-msg__bubble", mdLite("아래 내용으로 김유빈 님께 전달하겠습니다. 수정 후 **보내기**를 눌러주세요."));
    col.appendChild(bubble);
    var form = el("form", "yk-form");
    form.innerHTML =
      '<label>성함 / 소속</label><input name="name" placeholder="홍길동 · ○○법무법인" required />' +
      '<label>회신 이메일 또는 연락처</label><input name="contact" value="' + escapeHtml(data.contact || "") + '" required />' +
      '<label>상담 내용</label><textarea name="message">' + escapeHtml(summarize(data)) + "</textarea>" +
      '<div class="yk-form__err" hidden></div>' +
      '<div class="yk-form__row"><button type="button" class="yk-cta__btn yk-cta__btn--ghost" data-cancel>취소</button><button type="submit" class="yk-cta__btn">보내기</button></div>';
    col.appendChild(form);
    msg.appendChild(col);
    body.appendChild(msg);
    scrollBottom();
    form.querySelector("[data-cancel]").addEventListener("click", function () {
      form.remove();
      var t = "상담 신청을 취소했습니다. 언제든 다시 요청하실 수 있습니다.";
      renderMessage("bot", t); pushBot(t);
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var lead = {
        name: form.name.value.trim(),
        contact: form.contact.value.trim(),
        message: form.message.value.trim(),
        need: data.need || "", context: data.context || "",
        page: location.href,
        history: history.slice(-10).map(function (m) { return { role: m.role, content: m.content }; }),
        ua: navigator.userAgent,
      };
      var err = form.querySelector(".yk-form__err");
      if (!lead.name || !lead.contact) { err.hidden = false; err.textContent = "성함과 연락처는 필수입니다."; return; }
      err.hidden = true;
      var btn = form.querySelector('[type="submit"]');
      btn.disabled = true; btn.textContent = "전송 중…";
      submitLead(lead).then(function (res) {
        form.remove();
        var t = CONSULT.closing + (res && res.notified === false ? "\n(알림 발송은 지연될 수 있으나 접수는 완료되었습니다.)" : "");
        renderMessage("bot", t, [{ label: "연락 섹션", href: "index.html#contact" }]);
        pushBot(t, [{ label: "연락 섹션", href: "index.html#contact" }]);
      }).catch(function () {
        // ★ 폴백: 서버 실패 → 상담 내용이 그대로 채워진 mailto 문의 폼으로 (리드 유실 방지)
        form.remove();
        var subject = "[포트폴리오 상담] " + lead.name;
        var bodyTxt = "성함/소속: " + lead.name + "\n연락처: " + lead.contact + "\n\n" + lead.message + "\n\n(페이지: " + lead.page + ")";
        var mailto = "mailto:" + PROFILE.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(bodyTxt);
        var t = CONSULT.fallbackClosing;
        renderMessage("bot", t, [{ label: "이메일로 보내기", href: mailto }]);
        pushBot(t, [{ label: "이메일로 보내기", href: mailto }]);
        try { location.href = mailto; } catch (e2) {}
      });
    });
  }
  function submitLead(lead) {
    if (isStaticHost() || !CFG.leadEndpoint) return Promise.reject(new Error("no_lead_endpoint"));
    var controller = new AbortController();
    var killed = setTimeout(function () { controller.abort(); }, 12000);
    return fetch(CFG.leadEndpoint, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead), signal: controller.signal,
    }).then(function (res) {
      clearTimeout(killed);
      if (!res.ok) throw new Error("lead_" + res.status);
      return res.json().catch(function () { return { ok: true }; });
    }).then(function (j) {
      if (!j || j.ok === false) throw new Error("lead_rejected");
      return j;
    }).catch(function (e) { clearTimeout(killed); throw e; });
  }

  /* 프론트에서 직접 쓰는 시스템 프롬프트 (백엔드 규칙과 동일) */
  function frontSystemPrompt() {
    var knowledge = EXT && EXT.toKnowledge ? EXT.toKnowledge() : KB.map(function (c) { return "### " + c.title + "\n" + c.body; }).join("\n\n");
    return [
      "당신은 '유빈 AI'입니다 — 김유빈(Yubin Kim)의 포트폴리오를 방문객(주로 채용·협업 담당자)에게 안내하는 격조 있는 컨시어지입니다. 김유빈 님을 3인칭으로 소개합니다.",
      "[규칙] 1) 아래 <지식> 안의 사실만 근거로 답하고 없는 사실·수치·URL은 지어내지 않습니다. 2) 지식에 없으면 '그 내용은 포트폴리오에 담겨 있지 않습니다. " + PROFILE.email + " 로 문의하시면 김유빈 님이 직접 답변드립니다.' 라고 안내합니다. 3) 링크는 <지식>의 URL만 사용, 법률·세무 판단은 '전문가 상담이 필요합니다'로 안내, 공개 이메일 외 개인정보는 제공하지 않습니다. 4) 무관한 잡담은 정중히 포트폴리오 주제로 유도합니다. 5) 절제되고 품격 있게, 과장 없이. 기본 한국어(영어로 물으면 영어), 3~6문장, 필요시 짧은 불릿, 프로젝트는 [이름](URL) 링크로, 이모지 금지. 6) 사이트 내부 위치를 안내할 때는 [라벨](페이지.html#앵커) 형식의 링크를 사용합니다.",
      "<지식>",
      knowledge,
      "</지식>",
    ].join("\n");
  }

  /* OpenAI 직접 스트리밍 (정적 호스팅용 — 키는 이 브라우저 localStorage에만 존재) */
  function streamOpenAIDirect(hist, onToken, onDone, onError) {
    var key = getKey();
    if (!key) { onError(); return; }
    var controller = new AbortController();
    var killed = setTimeout(function () { controller.abort(); }, 40000);
    var msgs = [{ role: "system", content: frontSystemPrompt() }].concat(hist.slice(-12).map(function (m) { return { role: m.role, content: m.content }; }));
    fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify({ model: CFG.model || "gpt-4o-mini", messages: msgs, temperature: 0.4, max_tokens: 700, stream: true }),
      signal: controller.signal,
    })
      .then(function (res) {
        if (!res.ok || !res.body) throw new Error("openai_" + res.status);
        var reader = res.body.getReader();
        var decoder = new TextDecoder();
        var buf = "";
        (function pump() {
          return reader.read().then(function (r) {
            if (r.done) { clearTimeout(killed); onDone(); return; }
            buf += decoder.decode(r.value, { stream: true });
            var lines = buf.split("\n");
            buf = lines.pop() || "";
            for (var i = 0; i < lines.length; i++) {
              var ln = lines[i].trim();
              if (ln.indexOf("data:") !== 0) continue;
              var data = ln.slice(5).trim();
              if (data === "[DONE]") continue;
              try {
                var j = JSON.parse(data);
                var d = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content;
                if (d) onToken(d);
              } catch (e) { /* 부분 JSON — 다음 청크에서 이어짐 */ }
            }
            return pump();
          });
        })().catch(function () { clearTimeout(killed); onError(); });
      })
      .catch(function () { clearTimeout(killed); onError(); });
  }

  /* 서버 스트리밍 수신 */
  function streamServer(hist, onToken, onDone, onError) {
    var controller = new AbortController();
    var killed = setTimeout(function () { controller.abort(); }, 32000);

    fetch(CFG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: hist.slice(-12).map(function (m) { return { role: m.role, content: m.content }; }), stream: true }),
      signal: controller.signal,
    })
      .then(function (res) {
        if (!res.ok || !res.body) throw new Error("bad_response_" + res.status);
        var reader = res.body.getReader();
        var decoder = new TextDecoder();
        (function pump() {
          return reader.read().then(function (r) {
            if (r.done) { clearTimeout(killed); onDone(); return; }
            onToken(decoder.decode(r.value, { stream: true }));
            return pump();
          });
        })().catch(function () { clearTimeout(killed); onError(); });
      })
      .catch(function () { clearTimeout(killed); onError(); });
  }

  /* 로컬 폴백용 타이핑 애니메이션 */
  function typeOut(bubble, text, done) {
    if (REDUCED) { bubble.innerHTML = mdLite(text); scrollBottom(); done(); return; }
    var i = 0, step = Math.max(1, Math.round(text.length / 90));
    (function tick() {
      i += step;
      bubble.innerHTML = mdLite(text.slice(0, i));
      scrollBottom();
      if (i < text.length) setTimeout(tick, 16);
      else { bubble.innerHTML = mdLite(text); done(); }
    })();
  }

  /* ------------------------------------------------------------- init */
  function init() { build(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  // 외부 제어 API
  window.YubinChat = {
    open: function () { open(); },
    close: function () { close(); },
    send: function (t) { open(); send(t); },
    goTo: goTo,                 // 딥링크: YubinChat.goTo("career.html#cv-ssafy")
    consult: function () { startConsult(); },
    answer: localAnswer,        // 로컬 엔진 디버그
    kb: KB,
    // 이 브라우저(localStorage)에만 키 저장 — 레포/깃엔 절대 올라가지 않습니다.
    setKey: function (k) {
      try { localStorage.setItem("YUBIN_OPENAI_KEY", String(k || "").trim()); localMode = false; } catch (e) {}
      return "✓ 키가 이 브라우저에만 저장되었습니다. 이제 챗봇이 GPT로 답합니다. (레포에는 저장되지 않음)";
    },
    clearKey: function () { try { localStorage.removeItem("YUBIN_OPENAI_KEY"); } catch (e) {} return "키를 삭제했습니다."; },
    hasKey: function () { return !!getKey(); },
  };
})();
