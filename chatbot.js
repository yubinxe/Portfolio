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
        "안녕하세요, 반갑습니다 👋\n**김유빈 님의 포트폴리오 컨시어지, 유빈 AI**입니다.\n- 🧩 핵심 역량과 일하는 방식\n- 🗂️ 대표 프로젝트와 기획 판단\n- 🧭 경력 · 교육 · 수상 이력\n궁금한 것을 편하게 물어보세요. 답변 속 버튼을 누르면 해당 위치로 바로 모셔다 드릴게요 ✨",
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
      body: "김유빈(Yubin Kim) · 2004년생. 법무법인 경국에서 전략기획과 AI 프로세스 혁신을 담당합니다.",
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
      /* 이모지로 시작하는 항목은 이모지가 표지 역할 — 점 표지를 생략 */
      return bullet ? '<span class="yk-li' + (/^\p{Extended_Pictographic}/u.test(body) ? " yk-li--e" : "") + '">' + body + "</span>" : body;
    });
    /* 불릿(블록)과 문장 사이에는 <br>을 넣지 않고, 빈 줄은 문단 간격으로 */
    var raw = safe.split("\n");
    var out = "";
    lines.forEach(function (h, i) {
      var isBlock = h.indexOf('<span class="yk-li') === 0;
      if (raw[i].trim() === "") { out += '<span class="yk-gap"></span>'; return; }
      var prev = i > 0 ? lines[i - 1] : null;
      var prevBlock = prev == null || prev.indexOf('<span class="yk-li') === 0 || raw[i - 1].trim() === "";
      if (i > 0 && !isBlock && !prevBlock) out += "<br>";
      out += h;
    });
    return out;
  }

  /* ------------------------------------------------------------ 딥링크 엔진 */
  var SPOT_MS = 2600;
  function spotlight(target) {
    if (!target) return;
    target.classList.add("in"); // reveal 블러 즉시 해제
    target.classList.add("yk-spotlight");
    setTimeout(function () { target.classList.remove("yk-spotlight"); }, SPOT_MS);
  }
  /* 접이식(<details>) 안의 앵커로 가면 감싼 항목을 먼저 펼친다 — 닫힌 칸으로 스크롤되지 않게 */
  function openFolds(t) {
    if (t.tagName === "DETAILS") t.open = true;
    var d = t.parentElement && t.parentElement.closest("details");
    while (d) { d.open = true; d = d.parentElement && d.parentElement.closest("details"); }
  }
  window.ykOpenFolds = openFolds;
  function scrollToHash(hash, tries) {
    var t = hash && document.getElementById(hash);
    if (!t) {
      // React(index.html) 마운트 대기 — 최대 ~4초
      if ((tries || 0) < 40) return setTimeout(function () { scrollToHash(hash, (tries || 0) + 1); }, 100);
      return false;
    }
    openFolds(t);
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
  /* 분류별 첫 줄과 '이어서 물어보기' — 질문은 kb-rank 테스트로 검증된 문장만 쓴다 */
  var TONE = {
    "프로젝트": { e: "🗂️", lead: "관련 프로젝트를 정리해 드릴게요.", next: ["ed-09", "ed-06", "thesis", "trajectory", "composite"] },
    "역량": { e: "🧩", lead: "김유빈 님의 역량을 짚어 드릴게요.", next: ["projects", "ed-09", "thesis", "trajectory"] },
    "궤적": { e: "🧭", lead: "이력을 정리해 드릴게요.", next: ["projects", "creds", "tl-youth-day", "tl-national-debate"] },
    "자격": { e: "🎖️", lead: "자격과 수상 기록입니다.", next: ["trajectory", "tl-youth-day", "projects"] },
    "강의": { e: "🎓", lead: "강의 프로그램을 소개해 드릴게요.", next: ["projects", "composite", "contact"] },
    "연락": { e: "✉️", lead: "연락 방법을 안내해 드릴게요.", next: ["projects", "composite", "trajectory"] },
    "미디어": { e: "📰", lead: "미디어 기록을 모아 보았습니다.", next: ["tl-youth-day", "projects", "trajectory"] },
    "인물": { e: "🙂", lead: "김유빈 님을 소개해 드릴게요.", next: ["composite", "projects", "trajectory"] },
  };
  var ASK = {
    "composite": ["🧩 핵심 역량 요약", "핵심 역량을 한눈에 요약해 주세요"],
    "projects": ["🗂️ 전체 프로젝트", "어떤 프로젝트를 만들었나요?"],
    "ed-09": ["🏠 집캐치 서비스", "집캐치가 뭔가요"],
    "ed-06": ["📨 VOC 트리아지", "VOC 트리아지가 뭔가요"],
    "trajectory": ["🧭 경력 타임라인", "경력 타임라인 정리해 주세요"],
    "creds": ["🎖️ 자격 · 수상", "자격증 뭐 있으세요?"],
    "tl-youth-day": ["🇰🇷 청년의날 참석", "청와대 청년의날 갔다면서요"],
    "tl-national-debate": ["🗣️ 국민 대토론회 발표", "국민 대토론회에서 뭘 발표했어요?"],
    "thesis": ["💡 일하는 철학", "일하는 철학이 궁금해요"],
    "contact": ["✉️ 연락 방법", "연락은 어떻게 하나요?"],
  };
  function followUps(cat, exclude) {
    var ids = ((TONE[cat] || TONE["인물"]).next).filter(function (id) { return exclude.indexOf(id) < 0 && ASK[id]; });
    return ids.slice(0, 3).map(function (id) { return { label: ASK[id][0], ask: ASK[id][1] }; });
  }
  /* 긴 문단은 문장 단위 불릿으로 — 한눈에 읽히게 */
  function tidyBody(body) {
    var b = String(body || "").trim();
    if (/\n\s*-\s/.test(b) || b.length < 90) return b;
    var parts = b.replace(/([다요음])\.\s+/g, "$1.\n").split("\n").filter(Boolean);
    if (parts.length < 2) return b;
    return parts.slice(0, 5).map(function (x) { return "- " + x.trim(); }).join("\n");
  }
  /* → { text, ctas:[{label,href} | {label,ask}] } */
  function localAnswer(query) {
    var q = (query || "").toLowerCase();
    if (/(안녕|하이|hello|hi|반가)/.test(q) && q.length < 12) {
      return {
        text: "반갑습니다 👋 **유빈 AI가 김유빈 님을 안내해 드릴게요.**\n- 🧩 무엇을 잘하는지 — 역량\n- 🗂️ 무엇을 만들었는지 — 프로젝트\n- 🧭 어떤 길을 걸어왔는지 — 이력\n✨ 아래에서 골라 보시거나 편하게 질문해 주세요.",
        ctas: followUps("인물", []),
      };
    }
    var scored = scoreCards(q);
    if (!scored.length || scored[0].s === 0) {
      return {
        text: "🙏 **아쉽게도 그 내용은 포트폴리오에 담겨 있지 않아요.**\n- ✉️ **[" + PROFILE.email + "](mailto:" + PROFILE.email + ")** 로 문의하시면 김유빈 님이 직접 답변드립니다.\n- 💬 아래 '무료 상담 신청'으로 내용을 정리해 바로 전달하실 수도 있어요.\n✨ 역량 · 프로젝트 · 경력은 언제든 자세히 안내해 드릴게요.",
        ctas: [{ label: "무료 상담 신청", href: "__consult__" }].concat(followUps("인물", [])),
      };
    }
    var best = scored[0].s;
    var top = scored.filter(function (x, i) { return x.s > 0 && (i === 0 || x.s >= best * 0.5); }).slice(0, 2);
    var cat = top[0].c.cat || "인물";
    var tone = TONE[cat] || TONE["인물"];
    var links = [];
    top.forEach(function (x) {
      [x.c.primary, x.c.secondary].forEach(function (cta) {
        if (!cta || !cta.href) return;
        if (links.some(function (y) { return y.href === cta.href; })) return;
        links.push(cta);
      });
    });
    var text = tone.e + " **" + tone.lead + "**\n\n" +
      top.map(function (x) { return "📌 **" + x.c.title + "**\n" + tidyBody(x.c.body); }).join("\n\n") +
      "\n\n✨ 더 궁금하신 점은 아래에서 이어서 물어보세요.";
    var exclude = top.map(function (x) { return x.c.id; });
    return { text: text, ctas: links.slice(0, 3).concat(followUps(cat, exclude)) };
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
  --yk-accent:#13284B; --yk-navy:#13284B; --yk-navy-deep:#0B1A33;
  --yk-gold:#9C7E48; --yk-gold-lt:#C9AE7A; --yk-gold-grad:linear-gradient(145deg,#D9BF8A 0%,#B08E52 55%,#8C6D38 100%);
  --yk-ink:#0E1A2E; --yk-ink-soft:#4A5365; --yk-ivory:#F7F4EE; --yk-paper:#FFFDF9;
  --yk-ecru:#F7F4EE; --yk-ecru-deep:#EFE9DE;
  --yk-ease:cubic-bezier(.22,.61,.36,1); --yk-spring:cubic-bezier(.32,1.28,.54,1);
  ${accentRule}
  font-family:-apple-system,"SF Pro Text","Pretendard Variable","Pretendard","Inter",system-ui,sans-serif;
  -webkit-font-smoothing:antialiased;
}
/* ---- 딥링크 스포트라이트 (페이지 요소에 부여) ---- */
.yk-spotlight{ animation:yk-spot 2.6s ease-out both; }
@keyframes yk-spot{
  0%{ box-shadow:0 0 0 0 rgba(156,126,72,0), 0 0 0 9999px rgba(14,26,46,0); }
  12%{ box-shadow:0 0 0 4px rgba(156,126,72,.75), 0 0 0 9999px rgba(14,26,46,.2); }
  70%{ box-shadow:0 0 0 4px rgba(156,126,72,.5), 0 0 0 9999px rgba(14,26,46,.08); }
  100%{ box-shadow:0 0 0 0 rgba(156,126,72,0), 0 0 0 9999px rgba(14,26,46,0); }
}
/* ---- FAB — 네이비 원 + 골드 링 ---- */
.yk-fab{
  position:fixed; right:24px; bottom:24px; z-index:120; width:62px; height:62px; border-radius:50%;
  background:radial-gradient(120% 120% at 30% 20%,#1D3761 0%,var(--yk-navy) 55%,var(--yk-navy-deep) 100%);
  color:#F7EBD2; border:none; cursor:pointer; display:grid; place-items:center;
  box-shadow:0 0 0 1.5px var(--yk-gold-lt), 0 0 0 5px rgba(201,174,122,.18), 0 16px 34px -12px rgba(11,26,51,.65);
  transition:transform .45s var(--yk-spring), box-shadow .4s var(--yk-ease);
}
.yk-fab:hover{ transform:translateY(-3px); box-shadow:0 0 0 1.5px var(--yk-gold-lt), 0 0 0 7px rgba(201,174,122,.22), 0 22px 40px -14px rgba(11,26,51,.7); }
.yk-fab:active{ transform:scale(.96); }
.yk-fab svg{ width:25px; height:25px; transition:transform .45s var(--yk-spring), opacity .3s; }
.yk-fab .yk-x{ position:absolute; opacity:0; transform:rotate(-90deg) scale(.6); }
.yk-chat.open .yk-fab .yk-bubble-i{ opacity:0; transform:rotate(90deg) scale(.6); }
.yk-chat.open .yk-fab .yk-x{ opacity:1; transform:none; }
.yk-fab__ping{ position:absolute; top:9px; right:9px; width:12px; height:12px; border-radius:50%; background:var(--yk-gold-grad); border:2px solid var(--yk-navy); }
.yk-fab__ping::after{ content:""; position:absolute; inset:-2px; border-radius:50%; border:2px solid rgba(201,174,122,.6); animation:yk-ping 2.6s ease-out infinite; will-change:transform,opacity; }
/* box-shadow 를 키우면 매 프레임 리페인트 — transform·opacity 만 쓰면 합성 스레드에서 끝난다 */
@keyframes yk-ping{ 0%{transform:scale(1);opacity:1;} 70%,100%{transform:scale(2.4);opacity:0;} }
.yk-chat.open .yk-fab__ping{ display:none; }
/* ---- teaser — iOS 알림 배너 ---- */
.yk-teaser{
  position:fixed; right:24px; bottom:100px; z-index:119; width:300px;
  background:rgba(250,248,243,.86); -webkit-backdrop-filter:blur(22px) saturate(180%); backdrop-filter:blur(22px) saturate(180%);
  color:var(--yk-ink); padding:12px 14px 12px 12px; border-radius:20px; display:flex; gap:11px; align-items:center;
  box-shadow:0 18px 40px -18px rgba(11,26,51,.45), 0 0 0 .5px rgba(14,26,46,.12);
  opacity:0; transform:translateY(-10px) scale(.96); transform-origin:top right; pointer-events:none; cursor:pointer;
  transition:opacity .4s var(--yk-ease), transform .5s var(--yk-spring);
}
.yk-teaser.show{ opacity:1; transform:none; pointer-events:auto; }
.yk-teaser__app{ width:38px; height:38px; border-radius:10px; flex:none; display:grid; place-items:center;
  background:linear-gradient(160deg,#1D3761,var(--yk-navy-deep)); color:var(--yk-gold-lt);
  font-family:"Cormorant Garamond",Georgia,serif; font-weight:600; font-size:17px; box-shadow:inset 0 0 0 1px rgba(201,174,122,.4); }
.yk-teaser__txt{ min-width:0; flex:1; font-size:13.5px; line-height:1.4; }
.yk-teaser__txt b{ display:flex; justify-content:space-between; font-size:13px; font-weight:650; margin-bottom:1px; }
.yk-teaser__txt b small{ font-weight:400; font-size:12px; color:var(--yk-ink-soft); }
.yk-teaser__close{ position:absolute; top:-7px; left:-7px; width:22px; height:22px; border-radius:50%;
  background:rgba(120,120,128,.9); color:#fff; border:none; font-size:13px; cursor:pointer; line-height:1; opacity:0; transition:opacity .2s; }
.yk-teaser:hover .yk-teaser__close{ opacity:1; }
/* ---- 기기 프레임 (iPhone) ---- */
.yk-panel{
  position:fixed; right:24px; bottom:100px; z-index:121;
  width:382px; height:760px; max-height:calc(100vh - 124px); max-width:calc(100vw - 32px);
  border-radius:58px; padding:11px;
  background:linear-gradient(145deg,#2A2C31 0%,#0D0E11 45%,#23252A 100%);
  box-shadow:0 0 0 1.5px #3A3C42, 0 0 0 3px rgba(201,174,122,.55), 0 40px 90px -30px rgba(11,26,51,.75), 0 12px 30px -12px rgba(0,0,0,.5);
  display:flex; opacity:0; transform:translateY(60px) scale(.94); transform-origin:bottom right; pointer-events:none;
  transition:opacity .38s var(--yk-ease), transform .6s var(--yk-spring);
}
.yk-panel::before, .yk-panel::after{ /* 측면 버튼 */
  content:""; position:absolute; width:3px; border-radius:2px; background:linear-gradient(#3B3D43,#1C1D21);
}
.yk-panel::before{ left:-4px; top:150px; height:64px; box-shadow:0 84px 0 0 #2A2C31; }
.yk-panel::after{ right:-4px; top:190px; height:96px; }
.yk-chat.open .yk-panel{ opacity:1; transform:none; pointer-events:auto; }
.yk-screen{ position:relative; flex:1; min-width:0; display:flex; flex-direction:column; overflow:hidden;
  border-radius:48px; background:var(--yk-ivory); }
.yk-island{ position:absolute; top:11px; left:50%; translate:-50% 0; width:112px; height:32px; border-radius:20px; background:#000; z-index:5; }
.yk-island::after{ content:""; position:absolute; right:14px; top:50%; translate:0 -50%; width:9px; height:9px; border-radius:50%;
  background:radial-gradient(circle at 35% 35%,#2B3B63,#0A0E18 70%); }
.yk-status{ height:52px; flex:none; display:flex; align-items:center; justify-content:space-between; padding:6px 30px 0 34px;
  font-size:15px; font-weight:650; color:var(--yk-ink); letter-spacing:-.01em; background:rgba(247,244,238,.92); }
.yk-status__icons{ display:flex; gap:6px; align-items:center; }
.yk-status__icons svg{ height:12px; width:auto; }
.yk-home{ position:absolute; bottom:8px; left:50%; translate:-50% 0; width:124px; height:5px; border-radius:3px; background:rgba(14,26,46,.85); z-index:5; }
/* ---- iOS 내비 헤더 ---- */
.yk-head{ position:relative; flex:none; padding:4px 14px 12px; background:rgba(247,244,238,.92);
  -webkit-backdrop-filter:blur(20px); backdrop-filter:blur(20px); border-bottom:.5px solid rgba(14,26,46,.14); text-align:center; }
.yk-head__close{ position:absolute; left:10px; top:6px; background:transparent; border:none; color:var(--yk-gold); cursor:pointer;
  display:flex; align-items:center; gap:1px; font:inherit; font-size:16px; padding:4px 6px; border-radius:8px; }
.yk-head__close svg{ width:22px; height:22px; }
.yk-head__close:hover{ background:rgba(156,126,72,.1); }
.yk-ava{ width:52px; height:52px; margin:0 auto 5px; border-radius:50%; display:grid; place-items:center; position:relative;
  background:linear-gradient(160deg,#1D3761,var(--yk-navy-deep)); color:#F2E4C4;
  font-family:"Cormorant Garamond",Georgia,serif; font-weight:600; font-size:21px; letter-spacing:.02em;
  box-shadow:0 0 0 2px var(--yk-ivory), 0 0 0 3.5px var(--yk-gold-lt); }
.yk-ava i{ position:absolute; right:1px; bottom:1px; width:12px; height:12px; border-radius:50%; background:#34C759; border:2px solid var(--yk-ivory); }
.yk-head__name{ font-size:15.5px; font-weight:650; color:var(--yk-ink); letter-spacing:-.015em; }
.yk-head__name small{ font-size:11px; font-weight:500; color:var(--yk-gold); letter-spacing:.14em; text-transform:uppercase; margin-left:4px; }
.yk-head__sub{ font-size:11.5px; color:var(--yk-ink-soft); margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
/* ---- 대화 ---- */
.yk-body{ flex:1; overflow-y:auto; padding:14px 14px 10px; background:var(--yk-ivory); display:flex; flex-direction:column; gap:6px; scroll-behavior:smooth; }
.yk-body::-webkit-scrollbar{ width:0; }
.yk-stamp{ align-self:center; font-size:11px; font-weight:600; color:rgba(74,83,101,.75); margin:4px 0 8px; letter-spacing:.02em; }
.yk-msg{ display:flex; gap:7px; max-width:84%; animation:yk-in .45s var(--yk-spring) both; margin-top:4px; }
@keyframes yk-in{ from{opacity:0; transform:translateY(10px) scale(.97);} to{opacity:1; transform:none;} }
.yk-msg__ava{ display:none; }
.yk-msg__col{ min-width:0; display:flex; flex-direction:column; gap:6px; }
.yk-msg__bubble{ padding:9px 13px 10px; border-radius:20px; font-size:14.5px; line-height:1.55; letter-spacing:-.012em; word-break:break-word; position:relative; }
.yk-msg.bot .yk-msg__bubble{ background:#FFFFFF; color:var(--yk-ink); border-bottom-left-radius:6px; box-shadow:0 1px 1px rgba(14,26,46,.06), 0 0 0 .5px rgba(14,26,46,.08); }
.yk-msg.me{ align-self:flex-end; flex-direction:row-reverse; }
.yk-msg.me .yk-msg__bubble{ background:linear-gradient(160deg,#1D3761,var(--yk-navy)); color:#FBF6EA; border-bottom-right-radius:6px; }
.yk-msg__bubble a{ color:inherit; text-decoration:underline; text-underline-offset:2px; font-weight:600; }
.yk-msg.bot .yk-msg__bubble a{ color:var(--yk-gold); text-decoration-color:rgba(156,126,72,.4); }
.yk-msg__bubble strong{ font-weight:650; }
.yk-li{ display:block; padding-left:13px; position:relative; }
.yk-li::before{ content:""; position:absolute; left:2px; top:.72em; width:4px; height:4px; border-radius:50%; background:var(--yk-gold); }
.yk-msg.me .yk-li::before{ background:var(--yk-gold-lt); }
/* ---- 딥링크 버튼 ---- */
.yk-cta{ display:flex; flex-wrap:wrap; gap:6px; }
.yk-cta__btn{ font:inherit; font-size:12.5px; font-weight:600; color:#FBF6EA; background:var(--yk-navy); border:none;
  border-radius:999px; padding:7px 13px; cursor:pointer; display:inline-flex; align-items:center; gap:5px;
  transition:transform .35s var(--yk-spring), background .25s; }
.yk-cta__btn:hover{ transform:translateY(-1px); background:var(--yk-navy-deep); }
.yk-cta__btn--ghost{ background:#FFFFFF; color:var(--yk-navy); box-shadow:inset 0 0 0 1px rgba(156,126,72,.55); }
.yk-cta__btn--ghost:hover{ background:#FFFBF2; }
.yk-cta__btn svg{ width:12px; height:12px; }
/* ---- 리드 폼 ---- */
.yk-form{ background:#FFFFFF; border-radius:18px; padding:13px; display:flex; flex-direction:column; gap:8px; box-shadow:0 0 0 .5px rgba(14,26,46,.12); }
.yk-form label{ font-size:11.5px; font-weight:650; color:var(--yk-ink-soft); letter-spacing:.02em; }
.yk-form input,.yk-form textarea{ width:100%; font:inherit; font-size:14px; border:none; border-radius:12px; padding:9px 11px;
  background:#F1EEE7; color:var(--yk-ink); outline:none; cursor:auto !important; box-shadow:inset 0 0 0 1px transparent; transition:box-shadow .2s; }
.yk-form input:focus,.yk-form textarea:focus{ box-shadow:inset 0 0 0 1.5px var(--yk-gold); }
.yk-form textarea{ resize:vertical; min-height:74px; }
.yk-form__row{ display:flex; gap:8px; justify-content:flex-end; margin-top:2px; }
.yk-form__err{ font-size:12px; color:#A02B23; font-weight:600; }
/* typing — iMessage 점 3개 */
.yk-typing{ display:inline-flex; gap:4px; padding:4px 2px; }
.yk-typing span{ width:7px; height:7px; border-radius:50%; background:#9AA0AB; animation:yk-dots 1.3s infinite; }
.yk-typing span:nth-child(2){ animation-delay:.18s; } .yk-typing span:nth-child(3){ animation-delay:.36s; }
@keyframes yk-dots{ 0%,60%,100%{opacity:.35; transform:none;} 30%{opacity:1; transform:translateY(-3px);} }
/* ---- 추천 칩 ---- */
.yk-quick{ display:flex; gap:7px; padding:8px 12px 6px; overflow-x:auto; flex:none; background:var(--yk-ivory); scrollbar-width:none; }
.yk-quick::-webkit-scrollbar{ display:none; }
.yk-chip{ flex:none; font:inherit; font-size:13px; font-weight:560; color:var(--yk-navy); background:#FFFFFF; border:none;
  border-radius:999px; padding:8px 14px; cursor:pointer; box-shadow:inset 0 0 0 1px rgba(14,26,46,.14);
  transition:background .25s, color .25s, box-shadow .25s, transform .35s var(--yk-spring); }
.yk-chip:hover{ box-shadow:inset 0 0 0 1px var(--yk-gold); transform:translateY(-1px); }
.yk-chip--accent{ background:var(--yk-gold-grad); color:#1B1204; box-shadow:none; font-weight:650; }
.yk-chip--accent:hover{ box-shadow:0 6px 14px -8px rgba(140,109,56,.8); }
/* ---- 입력 — iMessage 캡슐 + 골드 전송 ---- */
.yk-input{ flex:none; padding:8px 12px 26px; display:flex; align-items:flex-end; gap:8px; background:rgba(247,244,238,.95); border-top:.5px solid rgba(14,26,46,.1); }
.yk-input textarea{ flex:1; resize:none; border:none; border-radius:20px; padding:9px 14px; font:inherit; font-size:15px; line-height:1.4;
  max-height:104px; color:var(--yk-ink); background:#FFFFFF; outline:none; cursor:auto !important;
  box-shadow:inset 0 0 0 1px rgba(14,26,46,.16); transition:box-shadow .2s; }
.yk-input textarea:focus{ box-shadow:inset 0 0 0 1.5px var(--yk-gold-lt); }
.yk-input textarea::placeholder{ color:#9AA0AB; }
.yk-send{ width:36px; height:36px; border-radius:50%; border:none; background:var(--yk-gold-grad); color:#fff; cursor:pointer; flex:none;
  display:grid; place-items:center; margin-bottom:2px; box-shadow:0 6px 14px -6px rgba(140,109,56,.85), inset 0 1px 0 rgba(255,255,255,.35);
  transition:transform .35s var(--yk-spring), opacity .2s, filter .2s; }
.yk-send svg{ width:18px; height:18px; }
.yk-send:hover{ transform:scale(1.07); filter:brightness(1.05); }
.yk-send:active{ transform:scale(.94); }
.yk-send:disabled{ opacity:.45; cursor:default; transform:none; box-shadow:none; }
.yk-foot{ display:none; }
/* ---- 좁은 화면: 프레임 없이 전체 화면 시트 ---- */
@media (max-width:520px), (max-height:700px){
  .yk-panel{ right:0; bottom:0; left:0; top:auto; width:100vw; max-width:100vw; height:92vh; height:92dvh; max-height:none;
    border-radius:26px 26px 0 0; padding:0; background:var(--yk-ivory); box-shadow:0 -20px 50px -20px rgba(11,26,51,.45), 0 0 0 1px rgba(201,174,122,.5); }
  .yk-panel::before, .yk-panel::after, .yk-island, .yk-status{ display:none; }
  .yk-screen{ border-radius:26px 26px 0 0; }
  .yk-head{ padding-top:14px; }
  .yk-head::before{ content:""; display:block; width:38px; height:5px; border-radius:3px; background:rgba(14,26,46,.2); margin:0 auto 10px; }
  .yk-head__close{ top:20px; }
  .yk-fab{ right:16px; bottom:16px; } .yk-teaser{ right:12px; left:12px; width:auto; bottom:auto; top:12px; transform-origin:top center; }
  .yk-chat.open .yk-fab{ opacity:0; pointer-events:none; }
}

/* ---- v2 · 상태바 실제 배치 — 섬 좌우 귀 영역 중앙, 섬 중심선에 맞춤 ---- */
.yk-status{ display:grid !important; grid-template-columns:1fr 126px 1fr; align-items:start; padding:17px 14px 0 !important; height:50px;
  font-family:-apple-system,"SF Pro Display","SF Pro Text","Pretendard Variable",system-ui,sans-serif; font-size:16.5px; font-weight:600; letter-spacing:-.025em; }
.yk-status__time{ grid-column:1; justify-self:center; line-height:20px; font-variant-numeric:tabular-nums; padding-left:6px; }
.yk-status__icons{ grid-column:3; justify-self:center; display:flex; align-items:center; gap:5.5px; height:20px; padding-right:4px; }
.yk-cell{ width:17px; height:11px; } .yk-wifi{ width:15.5px; height:11.5px; }
.yk-bat{ position:relative; width:26px; height:12.5px; border-radius:4.2px; box-shadow:inset 0 0 0 1px rgba(14,26,46,.36); margin-right:2px; }
.yk-bat::after{ content:""; position:absolute; right:-2.6px; top:4px; width:1.6px; height:4.5px; border-radius:0 1.5px 1.5px 0; background:rgba(14,26,46,.4); }
.yk-bat i{ position:absolute; left:2px; top:2px; bottom:2px; width:calc(100% - 4px); border-radius:2.4px; background:var(--yk-ink); }
.yk-bat b{ position:absolute; inset:0; display:grid; place-items:center; font-size:8.6px; font-weight:800; color:#fff; letter-spacing:-.04em; }
.yk-bat.low i{ background:#E0443A; }
/* 섬 — 렌즈 반사 · 응답 중 라이브 액티비티(좌: 컨시어지 · 우: 파형) */
.yk-island{ transition:width .55s var(--yk-spring), height .55s var(--yk-spring); box-shadow:0 0 0 .5px rgba(255,255,255,.04); }
.yk-island::after{ background:radial-gradient(circle at 32% 30%,#5C6F9C 0 12%,#1B2744 30%,#05070C 72%) !important; box-shadow:0 0 0 1.5px #0B0D12; }
.yk-island__l, .yk-island__r{ position:absolute; top:50%; translate:0 -50%; opacity:0; transition:opacity .25s ease; }
.yk-island__l{ left:9px; width:20px; height:20px; border-radius:50%; display:grid; place-items:center; font-style:normal;
  font:600 9px/1 "Cormorant Garamond",Georgia,serif; color:#1B1204; background:var(--yk-gold-grad); }
.yk-island__r{ right:34px; display:flex; gap:2px; align-items:center; height:14px; }
.yk-island__r b{ width:2.5px; height:5px; border-radius:2px; background:var(--yk-gold-lt); animation:yk-wave 1s ease-in-out infinite; }
.yk-island__r b:nth-child(2){ animation-delay:.15s; } .yk-island__r b:nth-child(3){ animation-delay:.3s; } .yk-island__r b:nth-child(4){ animation-delay:.45s; }
@keyframes yk-wave{ 0%,100%{ height:4px; } 50%{ height:13px; } }
.yk-busy .yk-island{ width:150px; }
.yk-busy .yk-island__l, .yk-busy .yk-island__r{ opacity:1; transition-delay:.18s; }
/* ---- 답변 가독성 ---- */
.yk-msg.bot .yk-msg__bubble{ line-height:1.62; }
.yk-msg.bot .yk-msg__bubble strong{ color:var(--yk-navy); font-weight:680; }
.yk-li{ margin-top:4px; }
.yk-gap{ display:block; height:9px; }
.yk-li--e{ padding-left:0; }
.yk-li--e::before{ display:none; }
/* 이어서 물어보기 */
.yk-follow{ display:flex; flex-direction:column; gap:6px; margin-top:2px; animation:yk-in .5s var(--yk-spring) both; }
.yk-follow__lbl{ font-size:10.5px; font-weight:700; letter-spacing:.14em; color:var(--yk-gold); padding-left:4px; }
.yk-follow__row{ display:flex; flex-wrap:wrap; gap:6px; }
.yk-ask{ font:inherit; font-size:12.8px; font-weight:560; color:var(--yk-navy); background:rgba(255,255,255,.75); border:none; border-radius:999px;
  padding:7px 12px; cursor:pointer; box-shadow:inset 0 0 0 1px rgba(156,126,72,.45); transition:background .25s, box-shadow .25s, transform .35s var(--yk-spring); }
.yk-ask:hover{ background:#fff; box-shadow:inset 0 0 0 1.3px var(--yk-gold); transform:translateY(-1px); }
.yk-ask:active{ transform:scale(.97); }
@media (prefers-reduced-motion:reduce){ .yk-island__r b{ animation:none; } .yk-island{ transition:none; } }
@media (prefers-reduced-motion:reduce){
  .yk-fab,.yk-panel,.yk-msg,.yk-chip,.yk-send,.yk-teaser,.yk-cta__btn{ transition:none !important; animation:none !important; }
  .yk-fab__ping::after,.yk-typing span{ animation:none !important; }
  .yk-spotlight{ animation:none; box-shadow:0 0 0 3px rgba(156,126,72,.7); }
}
/* 터치 기기 — 기본 규칙 뒤에 둬야 덮어쓴다 (44px 권장 터치 타깃) */
@media (pointer: coarse){
  .yk-teaser__close::before{ content:""; position:absolute; inset:-11px; }
  .yk-head__close{ min-width:44px; min-height:44px; }
  .yk-chip{ min-height:44px; }
  .yk-send{ width:44px; height:44px; }
  .yk-teaser{ -webkit-backdrop-filter:none; backdrop-filter:none; background:rgba(250,248,243,.97); }
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
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg>';
  var ICON_BACK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  var ICON_STATUS =
    '<svg class="yk-cell" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="7.4" width="3.2" height="4.6" rx="1.1"/><rect x="4.9" y="5.2" width="3.2" height="6.8" rx="1.1"/><rect x="9.8" y="2.8" width="3.2" height="9.2" rx="1.1"/><rect x="14.7" y="0" width="3.2" height="12" rx="1.1"/></svg>' +
    '<svg class="yk-wifi" viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M1.6 4.4a9.2 9.2 0 0 1 12.8 0"/><path d="M4.2 7.1a5.5 5.5 0 0 1 7.6 0"/><path d="M8 11.3 6.1 9.4a2.7 2.7 0 0 1 3.8 0z" fill="currentColor" stroke="none"/></svg>' +
    '<span class="yk-bat"><i></i><b>100</b></span>';
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
      '<span class="yk-teaser__app" aria-hidden="true">YK</span>' +
      '<span class="yk-teaser__txt"><b>' + escapeHtml(CFG.brandKo) + ' <small>지금</small></b>' + escapeHtml(CFG.teaser) + '</span>';
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
      '<button class="yk-head__close" aria-label="닫기">' + ICON_BACK + '<span>닫기</span></button>' +
      '<div class="yk-ava" aria-hidden="true">YK<i></i></div>' +
      '<div class="yk-head__name">' + escapeHtml(CFG.brandKo) + '<small>Concierge</small></div>' +
      '<div class="yk-head__sub">' + escapeHtml(CFG.subtitle) + "</div>";
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
    textarea.placeholder = "iMessage처럼 편하게 물어보세요";
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

    var screen = el("div", "yk-screen");
    screen.appendChild(el("div", "yk-island", '<i class="yk-island__l">YK</i><i class="yk-island__r"><b></b><b></b><b></b><b></b></i>'));
    var status = el("div", "yk-status", '<span class="yk-status__time">9:41</span><span class="yk-status__icons" aria-hidden="true">' + ICON_STATUS + "</span>");
    status.setAttribute("aria-hidden", "true");
    screen.appendChild(status);
    screen.appendChild(head);
    screen.appendChild(body);
    screen.appendChild(quick);
    screen.appendChild(inputBar);
    screen.appendChild(foot);
    screen.appendChild(el("div", "yk-home"));
    panel.appendChild(screen);
    tickClock();
    setInterval(tickClock, 20000);
    /* 실제 배터리 잔량(지원 브라우저) — 없으면 100 */
    try {
      if (navigator.getBattery) navigator.getBattery().then(function (bt) {
        function upd() {
          var pct = Math.round(bt.level * 100);
          var bat = root.querySelector(".yk-bat");
          if (!bat) return;
          bat.querySelector("b").textContent = pct;
          bat.querySelector("i").style.width = "calc((100% - 4px) * " + bt.level + ")";
          bat.classList.toggle("low", pct <= 20);
        }
        upd(); bt.addEventListener("levelchange", upd);
      });
    } catch (e) {}

    root.appendChild(teaser);
    root.appendChild(panel);
    root.appendChild(fab);
    document.body.appendChild(root);

    // 저장된 대화 복원
    if (history.length) {
      greeted = true;
      body.appendChild(el("div", "yk-stamp", "이전 대화"));
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
  function setBusy(v) {
    busy = v;
    if (sendBtn) sendBtn.disabled = v;
    if (root) root.classList.toggle("yk-busy", v);
  }
  function hhmm() {
    var d = new Date();
    var h = d.getHours() % 12 || 12; /* iOS 상태바는 오전/오후 없이 12시간제 */
    return h + ":" + String(d.getMinutes()).padStart(2, "0");
  }
  function tickClock() {
    var t = root && root.querySelector(".yk-status__time");
    if (t) t.textContent = hhmm();
  }
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
    tickClock();
    if (!greeted) {
      greeted = true;
      var d0 = new Date();
      body.appendChild(el("div", "yk-stamp", "오늘 " + (d0.getHours() < 12 ? "오전 " : "오후 ") + hhmm()));
      renderMessage("bot", CFG.greeting);
    }
    setTimeout(function () { textarea && textarea.focus(); }, 340);
    scrollBottom();
  }
  function close() {
    var fab = root.querySelector(".yk-fab");
    /* 패널 안에 초점이 있었다면 여는 버튼으로 돌려준다 — 키보드 사용자가 제자리를 잃지 않도록 */
    var inside = root.contains(document.activeElement) && document.activeElement !== fab;
    root.classList.remove("open");
    fab.setAttribute("aria-expanded", "false");
    if (inside) fab.focus();
  }

  function scrollBottom() { if (body) body.scrollTop = body.scrollHeight; }

  function renderCtas(col, ctas) {
    if (!ctas || !ctas.length) return;
    var asks = ctas.filter(function (c) { return c.ask; });
    ctas = ctas.filter(function (c) { return !c.ask; });
    if (asks.length) {
      var fol = el("div", "yk-follow", '<span class="yk-follow__lbl">이어서 물어보기</span>');
      var frow = el("div", "yk-follow__row");
      asks.forEach(function (c) {
        var b = el("button", "yk-ask", escapeHtml(c.label));
        b.type = "button";
        b.addEventListener("click", function () { if (!busy) send(c.ask); });
        frow.appendChild(b);
      });
      fol.appendChild(frow);
      setTimeout(function () { col.appendChild(fol); scrollBottom(); }, 0);
    }
    if (!ctas.length) return;
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

    setBusy(true);
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
        var all = localAnswer(text).ctas;
        var ctas = all.filter(function (c) { return c.href && c.href !== "__consult__"; }).slice(0, 2)
          .concat(all.filter(function (c) { return c.ask; }));
        renderCtas(bubble.__col, ctas);
        pushBot(acc, ctas);
      }
      setBusy(false);
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
        setBusy(false);
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
    var intro = "📝 **무료 상담 신청을 도와드릴게요.**\n세 가지만 여쭙겠습니다.\n" + CONSULT.steps[0].ask;
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
    /* 접수 서버가 없는 정적 호스팅(GitHub Pages)에서는 어차피 메일 폴백으로 간다.
       "전송 중…" 을 보여줬다가 메일 앱으로 튀는 대신, 처음부터 그렇게 말한다. */
    var viaMail = isStaticHost() || !CFG.leadEndpoint;
    var bubble = el("div", "yk-msg__bubble", mdLite(viaMail
      ? "아래 내용으로 김유빈 님께 전달하겠습니다. 수정 후 **이메일로 보내기**를 누르시면 내용이 그대로 담긴 메일 작성 화면이 열립니다."
      : "아래 내용으로 김유빈 님께 전달하겠습니다. 수정 후 **보내기**를 눌러주세요."));
    col.appendChild(bubble);
    var form = el("form", "yk-form");
    form.innerHTML =
      '<label>성함 / 소속</label><input name="name" placeholder="홍길동 · ○○법무법인" required />' +
      '<label>회신 이메일 또는 연락처</label><input name="contact" value="' + escapeHtml(data.contact || "") + '" required />' +
      '<label>상담 내용</label><textarea name="message">' + escapeHtml(summarize(data)) + "</textarea>" +
      '<div class="yk-form__err" hidden></div>' +
      '<div class="yk-form__row"><button type="button" class="yk-cta__btn yk-cta__btn--ghost" data-cancel>취소</button><button type="submit" class="yk-cta__btn">' + (viaMail ? "이메일로 보내기" : "보내기") + '</button></div>';
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
      btn.disabled = true; btn.textContent = viaMail ? "메일 작성 화면 여는 중…" : "전송 중…";
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
      "[규칙] 1) 아래 <지식> 안의 사실만 근거로 답하고 없는 사실·수치·URL은 지어내지 않습니다. 2) 지식에 없으면 '그 내용은 포트폴리오에 담겨 있지 않습니다. " + PROFILE.email + " 로 문의하시면 김유빈 님이 직접 답변드립니다.' 라고 안내합니다. 3) 링크는 <지식>의 URL만 사용, 법률·세무 판단은 '전문가 상담이 필요합니다'로 안내, 공개 이메일 외 개인정보는 제공하지 않습니다. 4) 무관한 잡담은 정중히 포트폴리오 주제로 유도합니다. 5) 품격 있고 따뜻한 컨시어지 어조로, 과장 없이. 기본 한국어(영어로 물으면 영어). 형식: 첫 줄은 이모지 1개로 시작하는 굵은 한 문장 요약, 이어서 핵심을 '- ' 불릿 2~4개로(각 불릿 앞에 항목을 구분하는 이모지 1개 — 예: 📌 🗂️ 🧭 🎓 ✅), 프로젝트는 [이름](URL) 링크로, 마지막 줄은 '✨ '로 시작해 이어서 물어볼 만한 질문 하나를 제안합니다. 이모지는 한 답변에 5개 이내, 장식이 아니라 항목 구분용으로만 씁니다. 6) 사이트 내부 위치를 안내할 때는 [라벨](페이지.html#앵커) 형식의 링크를 사용합니다.",
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
