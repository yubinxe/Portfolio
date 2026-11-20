/* admin-vault.js — WebCrypto AES-256-GCM Portfolio Admin Vault (ID/PW + 4-Digit Quick PIN) */
(function () {
  "use strict";
  if (window.ykAdmin) return;

  var SESS_KEY = "yk.admin.s";
  var VAULT_URL = "vault-data.enc.json?v=3";
  var CSS_URL = "admin-vault.css?v=3";
  var unlockedData = null;
  var encBundle = null;
  var rootEl = null;
  var cssLoaded = false;

  function ensureCss() {
    if (cssLoaded) return;
    cssLoaded = true;
    var lk = document.createElement("link");
    lk.rel = "stylesheet";
    lk.href = CSS_URL;
    document.head.appendChild(lk);
  }

  function b64ToBytes(b64) {
    var bin = atob(b64);
    var arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  }

  async function deriveKek(passphrase, saltB64, iterations) {
    var enc = new TextEncoder();
    var baseKey = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: b64ToBytes(saltB64), iterations: iterations, hash: "SHA-256" },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
  }

  async function unwrapAndDecrypt(wrapObj, passphrase, bundle) {
    var kek = await deriveKek(passphrase, wrapObj.salt, wrapObj.iterations);
    var dekRaw = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: b64ToBytes(wrapObj.iv) },
      kek,
      b64ToBytes(wrapObj.wrapped)
    );
    var dek = await crypto.subtle.importKey("raw", dekRaw, { name: "AES-GCM" }, false, ["decrypt"]);
    var plainBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: b64ToBytes(bundle.iv) },
      dek,
      b64ToBytes(bundle.ciphertext)
    );
    return JSON.parse(new TextDecoder().decode(plainBuf));
  }

  async function loadBundle() {
    if (encBundle) return encBundle;
    var res = await fetch(VAULT_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("금고 데이터를 불러오지 못했습니다.");
    encBundle = await res.json();
    return encBundle;
  }

  function emitChange() {
    window.dispatchEvent(new CustomEvent("yk:admin-change", {
      detail: { unlocked: !!unlockedData, data: unlockedData }
    }));
  }

  function animateNumber(el, target, isFloat) {
    if (!el) return;
    var fmt = function (v) {
      return isFloat
        ? v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : Math.round(v).toLocaleString("en-US");
    };
    var start = performance.now();
    var dur = 760;
    var done = false;
    function frame(now) {
      if (done) return;
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(frame);
      else done = true;
    }
    requestAnimationFrame(frame);
    setTimeout(function () { if (!done) { done = true; el.textContent = fmt(target); } }, dur + 120);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function buildUi() {
    if (rootEl) return rootEl;
    ensureCss();
    var bd = document.createElement("div");
    bd.className = "ykv-backdrop";
    bd.id = "ykv-vault";
    bd.setAttribute("role", "dialog");
    bd.setAttribute("aria-modal", "true");
    bd.setAttribute("aria-label", "Admin 실무 데이터 금고");
    bd.innerHTML =
      '<div class="ykv-dialog" id="ykv-dlg">' +
        '<div class="ykv-top">' +
          '<div class="ykv-top__brand">' +
            '<span class="ykv-badge" id="ykv-badge"><i></i><span id="ykv-badge-txt">LOCKED · AES-256-GCM</span></span>' +
            '<span class="ykv-top__title">Galerie Privée · Law Firm Gyunggook Archive</span>' +
          '</div>' +
          '<div class="ykv-top__acts">' +
            '<button type="button" class="ykv-btn-sm ykv-btn-sm--lock" id="ykv-lock-btn" hidden>즉시 잠금 (공개 모드)</button>' +
            '<button type="button" class="ykv-btn-sm" id="ykv-close-btn">닫기</button>' +
          '</div>' +
        '</div>' +
        '<div id="ykv-stage"></div>' +
      '</div>';
    document.body.appendChild(bd);
    bd.addEventListener("click", function (e) { if (e.target === bd) close(); });
    bd.querySelector("#ykv-close-btn").addEventListener("click", close);
    bd.querySelector("#ykv-lock-btn").addEventListener("click", lock);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && bd.classList.contains("is-open")) close();
    });
    rootEl = bd;
    return bd;
  }

  function renderAuth() {
    var bd = buildUi();
    var dlg = bd.querySelector("#ykv-dlg");
    var stage = bd.querySelector("#ykv-stage");
    dlg.classList.remove("is-unlocked");
    bd.querySelector("#ykv-badge").classList.remove("is-live");
    bd.querySelector("#ykv-badge-txt").textContent = "LOCKED · AES-256-GCM";
    bd.querySelector("#ykv-lock-btn").hidden = true;

    var mode = "pin";
    var pin = "";
    var busy = false;

    stage.innerHTML =
      '<div class="ykv-auth">' +
        '<div class="ykv-curtain" id="ykv-curtain">' +
          '<div class="ykv-ring is-unlocking"><svg viewBox="0 0 68 68"><circle class="ykv-ring__track" cx="34" cy="34" r="30"/><circle class="ykv-ring__prog" cx="34" cy="34" r="30"/></svg><span class="ykv-ring__icon">✓</span></div>' +
          '<div style="font-size:15px;font-weight:700;letter-spacing:.12em;color:#E8CA82">GALERIE PRIVÉE · GYUNGGOOK</div>' +
          '<div style="font-size:13px;opacity:.88">전시관 아카이브로 입장합니다...</div>' +
          '<div class="ykv-curtain__bar"><div class="ykv-curtain__fill"></div></div>' +
        '</div>' +
        '<div class="ykv-auth__head">' +
          '<div class="ykv-ring" id="ykv-ring"><svg viewBox="0 0 68 68"><circle class="ykv-ring__track" cx="34" cy="34" r="30"/><circle class="ykv-ring__prog" cx="34" cy="34" r="30"/></svg>' +
            '<svg class="ykv-ring__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
          '</div>' +
          '<h2 class="ykv-auth__h">Galerie Privée · Admin 입장</h2>' +
          '<p class="ykv-auth__sub">대외 공개 화면에서는 Gyunggook 사내 구축 상세가 숨겨집니다.<br/>PIN 4자리 또는 ID/PW를 입력하면 전용 실무 전시관 페이지가 열립니다.</p>' +
        '</div>' +
        '<div class="ykv-mode-tabs">' +
          '<button type="button" class="ykv-mode-tab is-on" data-m="pin">간편 PIN (4자리)</button>' +
          '<button type="button" class="ykv-mode-tab" data-m="pw">ID / PW 로그인</button>' +
        '</div>' +
        '<div id="ykv-pane-pin" class="ykv-pin-wrap">' +
          '<div class="ykv-pin-dots" id="ykv-dots">' +
            '<div class="ykv-pin-dot is-active"></div><div class="ykv-pin-dot"></div><div class="ykv-pin-dot"></div><div class="ykv-pin-dot"></div>' +
          '</div>' +
          '<div class="ykv-keypad">' +
            [1,2,3,4,5,6,7,8,9,"초기화",0,"⌫"].map(function (k) {
              var util = typeof k === "string" ? " ykv-key--util" : "";
              return '<button type="button" class="ykv-key' + util + '" data-k="' + k + '">' + k + '</button>';
            }).join("") +
          '</div>' +
          '<div class="ykv-pin-hint">키보드 숫자 입력 또는 터치 · 4번째 숫자 입력 시 즉시 해금됩니다.</div>' +
        '</div>' +
        '<form id="ykv-pane-pw" class="ykv-form" hidden>' +
          '<div class="ykv-field"><label for="ykv-id">관리자 ID</label><input id="ykv-id" type="text" autocomplete="username" placeholder="Admin ID" /></div>' +
          '<div class="ykv-field"><label for="ykv-pw">비밀번호</label><input id="ykv-pw" type="password" autocomplete="current-password" placeholder="Password" /></div>' +
          '<button type="submit" class="ykv-submit">AES-256-GCM 금고 해금</button>' +
        '</form>' +
        '<div class="ykv-err" id="ykv-err"></div>' +
      '</div>';

    var dots = stage.querySelectorAll(".ykv-pin-dot");
    var errEl = stage.querySelector("#ykv-err");
    var ring = stage.querySelector("#ykv-ring");
    var curtain = stage.querySelector("#ykv-curtain");

    function updateDots() {
      dots.forEach(function (d, idx) {
        d.textContent = idx < pin.length ? "●" : "";
        d.classList.toggle("is-filled", idx < pin.length);
        d.classList.toggle("is-active", idx === pin.length && pin.length < 4);
      });
    }

    async function attemptUnlock(method, creds) {
      if (busy) return;
      busy = true;
      errEl.textContent = "";
      try {
        if (!window.crypto || !crypto.subtle) {
          throw new Error("HTTPS 또는 localhost 환경에서만 WebCrypto 복호화가 동작합니다.");
        }
        var bundle = await loadBundle();
        var data = method === "pin"
          ? await unwrapAndDecrypt(bundle.pinWrap, "PIN::" + creds.pin, bundle)
          : await unwrapAndDecrypt(bundle.pwWrap, creds.id + "::" + creds.pw, bundle);

        unlockedData = data;
        try { sessionStorage.setItem(SESS_KEY, JSON.stringify({ t: Date.now(), d: data })); } catch (e) {}

        ring.classList.add("is-unlocking");
        setTimeout(function () { curtain.classList.add("is-show"); }, 120);
        setTimeout(function () {
          emitChange();
          window.location.href = "vault.html";
        }, 720);
      } catch (e) {
        busy = false;
        errEl.textContent = e && e.message && e.message.indexOf("HTTPS") > -1
          ? e.message
          : (method === "pin" ? "PIN 번호가 일치하지 않습니다." : "ID 또는 비밀번호가 올바르지 않습니다.");
        if (method === "pin") {
          var pw = stage.querySelector("#ykv-pane-pin");
          pw.classList.add("is-shake");
          setTimeout(function () { pw.classList.remove("is-shake"); pin = ""; updateDots(); }, 420);
        }
      }
    }

    stage.querySelectorAll(".ykv-mode-tab").forEach(function (t) {
      t.addEventListener("click", function () {
        mode = t.dataset.m;
        errEl.textContent = "";
        stage.querySelectorAll(".ykv-mode-tab").forEach(function (x) { x.classList.toggle("is-on", x === t); });
        stage.querySelector("#ykv-pane-pin").hidden = mode !== "pin";
        stage.querySelector("#ykv-pane-pw").hidden = mode !== "pw";
        if (mode === "pw") setTimeout(function () { stage.querySelector("#ykv-id").focus(); }, 40);
      });
    });

    function pushDigit(d) {
      if (busy || mode !== "pin" || pin.length >= 4) return;
      pin += d;
      updateDots();
      if (pin.length === 4) attemptUnlock("pin", { pin: pin });
    }

    stage.querySelectorAll(".ykv-key").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var k = btn.dataset.k;
        if (k === "초기화") { pin = ""; errEl.textContent = ""; updateDots(); }
        else if (k === "⌫") { pin = pin.slice(0, -1); errEl.textContent = ""; updateDots(); }
        else pushDigit(k);
      });
    });

    function onKey(e) {
      if (!bd.classList.contains("is-open") || unlockedData || mode !== "pin") return;
      if (/^[0-9]$/.test(e.key)) { e.preventDefault(); pushDigit(e.key); }
      else if (e.key === "Backspace") { e.preventDefault(); pin = pin.slice(0, -1); updateDots(); }
    }
    document.addEventListener("keydown", onKey);

    stage.querySelector("#ykv-pane-pw").addEventListener("submit", function (e) {
      e.preventDefault();
      var id = stage.querySelector("#ykv-id").value.trim();
      var pw = stage.querySelector("#ykv-pw").value;
      attemptUnlock("pw", { id: id, pw: pw });
    });
  }

  function renderWorkspace() {
    var bd = buildUi();
    var dlg = bd.querySelector("#ykv-dlg");
    var stage = bd.querySelector("#ykv-stage");
    var data = unlockedData;
    if (!data) { renderAuth(); return; }

    dlg.classList.add("is-unlocked");
    bd.querySelector("#ykv-badge").classList.add("is-live");
    bd.querySelector("#ykv-badge-txt").textContent = "UNLOCKED · GYUNGGOOK ARCHIVE";
    bd.querySelector("#ykv-lock-btn").hidden = false;

    var tab = "backbone";
    var fmtIdx = 0;
    var wfIdx = 0;
    var sysIdx = 0;
    var stepIdx = 0;
    var domFilter = "ALL";
    var qText = "";

    stage.innerHTML =
      '<div class="ykv-ws">' +
        '<nav class="ykv-tabs" aria-label="관리자 워크스페이스 탭">' +
          '<button type="button" class="ykv-tab is-on" data-t="backbone">01 경국 데이터 백본 (SERVER)</button>' +
          '<button type="button" class="ykv-tab" data-t="systems">02 비공개 AX 시스템 심층</button>' +
          '<button type="button" class="ykv-tab" data-t="cases">03 실제 수행 산출물 · 공유폴더</button>' +
          '<button type="button" class="ykv-tab" data-t="commercial">04 상업화 코퍼스 · 집캐치</button>' +
        '</nav>' +
        '<div class="ykv-body" id="ykv-body"></div>' +
      '</div>';

    var bodyEl = stage.querySelector("#ykv-body");

    function renderTab() {
      if (tab === "backbone") {
        var k = data.kpis;
        var fmt = data.formatBottlenecks[fmtIdx];
        var maxWf = Math.max.apply(null, data.workflowSignals.map(function (w) { return w.hits; }));
        var wf = data.workflowSignals[wfIdx];
        bodyEl.innerHTML =
          '<div class="ykv-kpis">' +
            '<div class="ykv-kpi"><div class="ykv-kpi__n" data-cnt="' + k.totalFiles + '">0</div><div class="ykv-kpi__l">사내 NAS 인덱싱 파일</div><div class="ykv-kpi__s">' + k.totalGb + ' GB Zero-Copy</div></div>' +
            '<div class="ykv-kpi ykv-kpi--gold"><div class="ykv-kpi__n" data-cnt="' + k.totalChunks + '">0</div><div class="ykv-kpi__l">FTS5 Trigram 청크</div><div class="ykv-kpi__s">외부 API 전송 0건</div></div>' +
            '<div class="ykv-kpi"><div class="ykv-kpi__n" data-cnt="' + k.extractedFiles + '">0</div><div class="ykv-kpi__l">본문 파싱 완료 문서</div><div class="ykv-kpi__s">HWP · PDF · XLSX · DOCX</div></div>' +
            '<div class="ykv-kpi ykv-kpi--gold"><div class="ykv-kpi__n" data-cnt="' + k.corpusDocs + '">0</div><div class="ykv-kpi__l">상업화 RAG 코퍼스</div><div class="ykv-kpi__s">' + k.corpusChunks + ' 청크 · ' + k.corpusChars.toLocaleString() + '자</div></div>' +
          '</div>' +
          '<div class="ykv-grid2">' +
            '<div class="ykv-card">' +
              '<div class="ykv-card__h"><h3>문서 포맷별 추출 현황 &amp; 스캔 병목</h3><span>클릭해 아키텍처 해법 확인</span></div>' +
              data.formatBottlenecks.map(function (f, i) {
                var wPct = Math.max(4, f.coveragePct);
                return '<div class="ykv-fmt-row' + (i === fmtIdx ? " is-on" : "") + '" data-f="' + i + '">' +
                  '<span class="ykv-fmt-ext">' + esc(f.ext) + ' <small style="color:#6E7381;font-weight:500">(' + f.total.toLocaleString() + ')</small></span>' +
                  '<div class="ykv-bar-bg"><div class="ykv-bar-fill" style="width:' + wPct + '%"></div>' + (f.gap > 0 && f.coveragePct > 0 ? '<div class="ykv-bar-fill--gap" style="width:' + (100 - f.coveragePct) + '%"></div>' : '') + '</div>' +
                  '<span class="ykv-fmt-pct">' + f.coveragePct + '%</span>' +
                '</div>';
              }).join("") +
              '<div class="ykv-insight-box"><strong>' + esc(fmt.label) + ' (' + fmt.total.toLocaleString() + '건 · ' + fmt.gb + ' GB)</strong><br/>' + esc(fmt.insight) + '</div>' +
            '</div>' +
            '<div class="ykv-card">' +
              '<div class="ykv-card__h"><h3>법률·정비사업 워크플로 수요 분포</h3><span>FTS5 실측 빈도 기준</span></div>' +
              data.workflowSignals.map(function (w, i) {
                var pct = Math.round((w.hits / maxWf) * 100);
                return '<button type="button" class="ykv-wf-btn' + (i === wfIdx ? " is-on" : "") + '" data-w="' + i + '">' +
                  '<span><strong>' + esc(w.label) + '</strong></span>' +
                  '<span style="font-weight:800;color:#1F2D6B;font-variant-numeric:tabular-nums">' + w.hits.toLocaleString() + '건</span>' +
                  '<div class="ykv-wf-bar"><i style="width:' + pct + '%"></i></div>' +
                '</button>';
              }).join("") +
              '<div class="ykv-insight-box"><strong>' + esc(wf.label) + ' — 실무 인사이트</strong><br/>' + esc(wf.engineeringNote) + '</div>' +
            '</div>' +
          '</div>';

        bodyEl.querySelectorAll("[data-cnt]").forEach(function (el) {
          animateNumber(el, Number(el.dataset.cnt), false);
        });
        bodyEl.querySelectorAll("[data-f]").forEach(function (el) {
          el.addEventListener("click", function () { fmtIdx = Number(el.dataset.f); renderTab(); });
        });
        bodyEl.querySelectorAll("[data-w]").forEach(function (el) {
          el.addEventListener("click", function () { wfIdx = Number(el.dataset.w); renderTab(); });
        });
      } else if (tab === "systems") {
        var sys = data.internalSystems[sysIdx];
        bodyEl.innerHTML =
          '<div class="ykv-sys-nav">' +
            data.internalSystems.map(function (s, i) {
              return '<button type="button" class="ykv-sys-pill' + (i === sysIdx ? " is-on" : "") + '" data-s="' + i + '">' +
                '<small>' + esc(s.code) + ' · ' + esc(s.status) + '</small><b>' + esc(s.title) + '</b></button>';
            }).join("") +
          '</div>' +
          '<div class="ykv-card">' +
            '<div class="ykv-card__h"><h3>' + esc(sys.title) + ' (' + esc(sys.en) + ')</h3><span>ADMIN VERIFIED SPEC</span></div>' +
            '<p style="margin:0;font-size:13.5px;line-height:1.7;color:#2E3442">' + esc(sys.summary) + '</p>' +
            '<div class="ykv-chips">' + sys.metrics.map(function (m) { return '<span class="ykv-chip is-on">' + esc(m) + '</span>'; }).join("") + '</div>' +
            '<div class="ykv-steps">' +
              sys.pipeline.map(function (st, i) {
                return '<div class="ykv-step' + (i === stepIdx ? " is-on" : "") + '" data-st="' + i + '">' + esc(st) + '</div>';
              }).join("") +
            '</div>' +
          '</div>';
        bodyEl.querySelectorAll("[data-s]").forEach(function (el) {
          el.addEventListener("click", function () { sysIdx = Number(el.dataset.s); stepIdx = 0; renderTab(); });
        });
        bodyEl.querySelectorAll("[data-st]").forEach(function (el) {
          el.addEventListener("click", function () { stepIdx = Number(el.dataset.st); renderTab(); });
        });
      } else if (tab === "cases") {
        bodyEl.innerHTML =
          '<div class="ykv-card">' +
            '<div class="ykv-card__h"><h3>법무법인 경국 핵심 수행 실적 상세</h3><span>공개 화면 비식별 요약본 해제</span></div>' +
            data.actualDeliverables.map(function (d) {
              return '<div class="ykv-insight-box" style="margin-top:0;margin-bottom:10px">' +
                '<strong>' + esc(d.title) + '</strong> <span style="color:#1F2D6B;font-size:11.5px;font-weight:700">[' + esc(d.domain) + ']</span><br/>' +
                esc(d.outcome) + '</div>';
            }).join("") +
          '</div>' +
          '<div class="ykv-card">' +
            '<div class="ykv-card__h"><h3>사내 NAS 공유폴더 도메인별 인덱싱 분포</h3><span>경국 \\\\SERVER 실측</span></div>' +
            '<table class="ykv-tbl"><thead><tr><th>도메인</th><th>전체 파일</th><th>용량(GB)</th><th>본문 추출 완료</th><th>미추출(OCR 대기)</th><th>청크 수</th></tr></thead><tbody>' +
            data.shares.map(function (sh) {
              return '<tr><td><strong>' + esc(sh.domain) + '</strong></td><td>' + sh.totalFiles.toLocaleString() + '</td><td>' + sh.totalGb + '</td><td>' + sh.extractedFiles.toLocaleString() + '</td><td>' + sh.pendingFiles.toLocaleString() + '</td><td>' + sh.chunks.toLocaleString() + '</td></tr>';
            }).join("") +
            '</tbody></table>' +
          '</div>';
      } else if (tab === "commercial") {
        var doms = ["ALL", "LegalAX", "RealEstate_Supply", "Youth_Governance", "Quant_Fintech", "AI_Engineering"];
        var filtered = (data.ragSeed || []).filter(function (item) {
          var domOk = domFilter === "ALL" || item.domain === domFilter;
          var qOk = !qText || (item.title + " " + item.excerpt + " " + (item.tags || []).join(" ")).toLowerCase().indexOf(qText.toLowerCase()) > -1;
          return domOk && qOk;
        });
        bodyEl.innerHTML =
          '<div class="ykv-card">' +
            '<div class="ykv-card__h"><h3>데이터·제품 상업화 3대 수익 트랙</h3><span>kyungguk-server-brain × 집캐치 × Blog-PR-HQ</span></div>' +
            data.commercialTracks.map(function (tr) {
              return '<div class="ykv-insight-box" style="margin-top:0;margin-bottom:10px">' +
                '<strong>' + esc(tr.track) + '</strong> · <span style="color:#1F2D6B;font-weight:700">' + esc(tr.target_buyers) + '</span><br/>' +
                '핵심 자산: ' + esc(tr.core_asset) + '<br/>수익 훅: ' + esc(tr.hook) + '</div>';
            }).join("") +
          '</div>' +
          '<div class="ykv-card">' +
            '<div class="ykv-card__h"><h3>통합 RAG 코퍼스 실시간 탐색 (' + filtered.length + '건)</h3><span>portfolio_rag_seed.json 연동</span></div>' +
            '<input class="ykv-search" id="ykv-q" type="search" placeholder="키워드 검색 (예: 신통기획, 기본법, 집캐치, 퀀트, 서초)..." value="' + esc(qText) + '" />' +
            '<div class="ykv-chips">' +
              doms.map(function (dm) {
                return '<button type="button" class="ykv-chip' + (dm === domFilter ? " is-on" : "") + '" data-dm="' + dm + '">' + dm + '</button>';
              }).join("") +
            '</div>' +
            '<div>' +
              filtered.slice(0, 12).map(function (it) {
                return '<div class="ykv-rag-item"><h4>[' + esc(it.domain) + '] ' + esc(it.title) + ' <small style="color:#735C30">(' + esc(it.platform) + ')</small></h4><p>' + esc(it.excerpt) + '…</p></div>';
              }).join("") +
            '</div>' +
          '</div>';
        bodyEl.querySelector("#ykv-q").addEventListener("input", function (e) { qText = e.target.value; renderTab(); setTimeout(function(){ var inp = bodyEl.querySelector("#ykv-q"); if(inp){ inp.focus(); inp.setSelectionRange(qText.length, qText.length); } }, 0); });
        bodyEl.querySelectorAll("[data-dm]").forEach(function (el) {
          el.addEventListener("click", function () { domFilter = el.dataset.dm; renderTab(); });
        });
      }
    }

    stage.querySelectorAll(".ykv-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        tab = btn.dataset.t;
        stage.querySelectorAll(".ykv-tab").forEach(function (x) { x.classList.toggle("is-on", x === btn); });
        renderTab();
      });
    });

    renderTab();
  }

  function open(preferredTab) {
    if (unlockedData) {
      window.location.href = "vault.html" + (preferredTab ? "#" + preferredTab : "");
      return;
    }
    buildUi();
    renderAuth();
    requestAnimationFrame(function () { rootEl.classList.add("is-open"); });
  }

  function close() {
    if (!rootEl) return;
    rootEl.classList.remove("is-open");
  }

  function lock() {
    unlockedData = null;
    try { sessionStorage.removeItem(SESS_KEY); } catch (e) {}
    emitChange();
    close();
  }

  // Restore within current browser tab session if already unlocked
  try {
    var saved = sessionStorage.getItem(SESS_KEY);
    if (saved) {
      var parsed = JSON.parse(saved);
      if (parsed && parsed.d && Date.now() - parsed.t < 1000 * 60 * 60 * 6) {
        unlockedData = parsed.d;
        setTimeout(emitChange, 50);
      }
    }
  } catch (e) {}

  // Attach mobile drawer button lazily if mnav exists
  setTimeout(function () {
    var row = document.querySelector("#mnav .mnav__row");
    if (row && !row.querySelector(".mnav__admin")) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mnav__ix mnav__admin";
      btn.textContent = unlockedData ? "Admin · 해금" : "Admin 금고";
      btn.addEventListener("click", function () {
        var cl = document.querySelector("#mnav .mnav__close");
        if (cl) cl.click();
        open();
      });
      row.appendChild(btn);
      window.addEventListener("yk:admin-change", function (e) {
        btn.textContent = e && e.detail && e.detail.unlocked ? "Admin · 해금" : "Admin 금고";
      });
    }
  }, 80);

  window.ykAdmin = {
    open: open,
    close: close,
    lock: lock,
    isUnlocked: function () { return !!unlockedData; },
    getData: function () { return unlockedData; }
  };
})();
