/* cases-render.js — 사례집 화면을 문자열 HTML 로 그린다. 같은 함수를
 *  - 빌드(scripts/build-cases.mjs)가 cases.html 에 미리 그려 넣고(검색 · JS 없음 대비)
 *  - 브라우저(cases.js)가 시연 상태가 바뀔 때 다시 그린다.
 * 계산(입찰 분석 · 정족수)도 여기 두어 테스트가 같은 코드를 검증한다. */
(function (root) {
  var D = (typeof module !== "undefined" && module.exports) ? require("./cases-data.js") : root.CASES_DATA;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function badge(kind) {
    var k = kind === "actual-partial" ? "actual" : kind, m = D.KIND[k];
    return '<span class="cs-badge cs-badge--' + k + '">' + esc(kind === "actual-partial" ? "일부 수행" : m.ko) + "</span>";
  }
  function segs(a) { return a.map(function (s) { return s[0] ? "<" + s[0] + ">" + esc(s[1]) + "</" + s[0] + ">" : esc(s[1]); }).join(""); }
  var LV = { high: "높음", mid: "보통", low: "낮음" };
  var fmt = function (n) { return Number(n).toLocaleString("ko-KR"); };

  /* ---------------------------------------------------------------- 입찰 · 용역비 분석 */
  var BID_TYPES = ["재개발", "재건축", "가로주택정비", "소규모재건축"], BID_SERVICES = ["정비사업전문관리", "설계", "감정평가", "측량"];
  var HI = 1.8, LO = 0.55;
  function median(xs) { var a = xs.slice().sort(function (x, y) { return x - y; }), n = a.length; return n ? (n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2) : 0; }
  /* 비교군 = 같은 용역 종류(사업 유형 필터와 무관하게 전체 표본에서 중앙값). 표본이 작아 유형까지 나누면 중앙값이 흔들린다 */
  function bidAnalyze(rows, f) {
    var med = {};
    BID_SERVICES.forEach(function (s) { med[s] = median(rows.filter(function (r) { return r.service === s; }).map(function (r) { return r.amount / r.units; })); });
    var list = rows.filter(function (r) { return (!f.type || r.type === f.type) && (!f.service || r.service === f.service); }).map(function (r) {
      var pu = r.amount / r.units, ratio = pu / med[r.service];
      return Object.assign({}, r, { perUnit: pu, ratio: ratio, flag: ratio > HI ? "high" : ratio < LO ? "low" : null });
    }).sort(function (a, b) { return a.units - b.units; });
    return { list: list, median: med, flagged: list.filter(function (r) { return r.flag; }) };
  }
  function bidSimilar(rows, r) { return rows.filter(function (x) { return x.id !== r.id && x.service === r.service && Math.abs(x.units - r.units) <= r.units * 0.4; }); }

  function bidChart(an, f) {
    var W = 640, H = 300, P = { l: 56, r: 16, t: 16, b: 40 }, list = an.list;
    if (!list.length) return '<p class="cs-empty">조건에 맞는 가상 사례가 없습니다.</p>';
    var xmax = 2500, ys = list.map(function (r) { return r.perUnit; }), ymax = Math.max.apply(null, ys) * 1.15;
    var X = function (v) { return P.l + (v / xmax) * (W - P.l - P.r); }, Y = function (v) { return H - P.b - (v / ymax) * (H - P.t - P.b); };
    var g = "";
    for (var i = 0; i <= 5; i++) { var xv = i * 500; g += '<line x1="' + X(xv) + '" y1="' + (H - P.b) + '" x2="' + X(xv) + '" y2="' + (H - P.b + 4) + '" class="ax"/><text x="' + X(xv) + '" y="' + (H - P.b + 18) + '" text-anchor="middle" class="tk">' + fmt(xv) + "</text>"; }
    for (var j = 0; j <= 4; j++) { var yv = (ymax / 4) * j; g += '<line x1="' + P.l + '" y1="' + Y(yv) + '" x2="' + (W - P.r) + '" y2="' + Y(yv) + '" class="gr"/><text x="' + (P.l - 8) + '" y="' + (Y(yv) + 4) + '" text-anchor="end" class="tk">' + yv.toFixed(yv < 2 ? 2 : 1) + "</text>"; }
    var band = "";
    if (f.service) {
      var m = an.median[f.service];
      band = '<rect x="' + P.l + '" y="' + Y(Math.min(m * HI, ymax)) + '" width="' + (W - P.l - P.r) + '" height="' + (Y(m * LO) - Y(Math.min(m * HI, ymax))) + '" class="band"/>' +
        '<line x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + Y(m) + '" y2="' + Y(m) + '" class="med"/><text x="' + (W - P.r - 4) + '" y="' + (Y(m) - 6) + '" text-anchor="end" class="ml">중앙값 ' + m.toFixed(2) + "</text>";
    }
    var dots = list.map(function (r) {
      return '<circle cx="' + X(r.units) + '" cy="' + Y(r.perUnit) + '" r="' + (r.flag ? 7 : 5) + '" class="pt pt--' + BID_SERVICES.indexOf(r.service) + (r.flag ? " is-flag" : "") + '"><title>' + esc(r.site + " · " + r.type + " · " + r.service + " · " + fmt(r.units) + "세대 · " + fmt(r.amount) + "백만 원" + (r.flag ? " · 검토 필요" : "")) + "</title></circle>";
    }).join("");
    return '<svg class="cs-chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="세대수 대비 세대당 계약금액 분포(가상 데이터) — ' + list.length + "건, 검토 필요 " + an.flagged.length + '건">' + g + band + dots +
      '<text x="' + ((W + P.l) / 2) + '" y="' + (H - 4) + '" text-anchor="middle" class="al">세대수</text><text x="14" y="' + (H / 2) + '" text-anchor="middle" transform="rotate(-90 14 ' + (H / 2) + ')" class="al">세대당 금액(백만 원)</text></svg>';
  }
  function demoBid(st) {
    st = st || { type: "", service: "설계", pick: null };
    var an = bidAnalyze(D.BIDS, st), pick = st.pick && an.list.find(function (r) { return r.id === st.pick; }) || an.flagged[0] || an.list[0];
    var opt = function (arr, cur, name, all) { return '<label class="cs-f"><span>' + name + '</span><select data-bid="' + (name === "사업 유형" ? "type" : "service") + '"><option value="">' + all + "</option>" + arr.map(function (v) { return '<option' + (v === cur ? " selected" : "") + ">" + v + "</option>"; }).join("") + "</select></label>"; };
    var cards = '<div class="cs-kpis"><div><b>' + an.list.length + "</b><span>비교 사례</span></div>" +
      (st.service ? "<div><b>" + an.median[st.service].toFixed(2) + "</b><span>세대당 중앙값(백만 원) · " + esc(st.service) + "</span></div>" : "<div><b>" + BID_SERVICES.length + "</b><span>용역 종류</span></div>") +
      '<div class="is-warn"><b>' + an.flagged.length + "</b><span>검토 필요(중앙값의 " + HI + "배 초과 · " + LO + "배 미만)</span></div></div>";
    var rows = an.list.map(function (r) {
      return '<tr class="' + (r.flag ? "is-flag" : "") + (pick && r.id === pick.id ? " is-pick" : "") + '"><td><button type="button" data-bid-pick="' + r.id + '">' + esc(r.site) + "</button></td><td>" + esc(r.type) + "</td><td>" + esc(r.service) + '</td><td class="n">' + fmt(r.units) + '</td><td class="n">' + fmt(r.amount) + '</td><td class="n">' + r.perUnit.toFixed(2) + '</td><td class="n">' + r.ratio.toFixed(2) + "배</td><td>" + (r.flag ? '<span class="cs-flag">검토 필요 · ' + (r.flag === "high" ? "높음" : "낮음") + "</span>" : "—") + "</td></tr>";
    }).join("");
    var sim = pick ? bidSimilar(D.BIDS, pick) : [];
    var note = pick ? '<div class="cs-pick"><p class="cs-pick__k">선택한 사례 · ' + esc(pick.site) + "</p><p>" + esc(pick.type + " · " + pick.service + " · " + fmt(pick.units) + "세대 · " + fmt(pick.amount) + "백만 원") + " → 세대당 " + pick.perUnit.toFixed(2) + "백만 원, 같은 용역 중앙값의 <b>" + pick.ratio.toFixed(2) + "배</b>" + (pick.flag ? " — 규칙상 검토 필요" : " — 범위 안") + "</p><p>유사 사례(같은 용역 · 세대수 ±40%): " + (sim.length ? sim.map(function (x) { return esc(x.site) + " " + (x.amount / x.units).toFixed(2); }).join(" · ") : "없음") + "</p></div>" : "";
    return '<div class="cs-demo cs-bid" data-demo="bid">' +
      '<p class="cs-demo__tag">' + badge("demo") + " 가상 데이터 28건 · 실제 입찰 · 계약 금액이 아닙니다 · 기준일 " + D.ASOF + "</p>" +
      '<div class="cs-filters">' + opt(BID_TYPES, st.type, "사업 유형", "전체 유형") + opt(BID_SERVICES, st.service, "용역 종류", "전체 용역") + '<button type="button" class="cs-btn" data-bid-print>보고서 인쇄</button></div>' +
      cards + bidChart(an, st) + note +
      '<div class="cs-tablewrap"><table class="cs-table"><caption>비교표 — 세대수 오름차순 · 금액 단위 백만 원 · 가상</caption><thead><tr><th>사업지</th><th>유형</th><th>용역</th><th class="n">세대수</th><th class="n">계약금액</th><th class="n">세대당</th><th class="n">중앙값 대비</th><th>표시</th></tr></thead><tbody>' + rows + "</tbody></table></div>" +
      '<p class="cs-rule">규칙 — 비교군: 같은 용역 종류 전체 표본의 세대당 금액 중앙값. 표시: 중앙값의 ' + HI + "배 초과 또는 " + LO + "배 미만. 금액의 적정 · 부당을 판단하지 않습니다.</p></div>";
  }

  /* ---------------------------------------------------------------- 보상 절차도(공개 법령 기반 설명 화면) */
  var LAW_URL = "https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EA%B3%B5%EC%9D%B5%EC%82%AC%EC%97%85%EC%9D%84%EC%9C%84%ED%95%9C%ED%86%A0%EC%A7%80%EB%93%B1%EC%9D%98%EC%B7%A8%EB%93%9D%EB%B0%8F%EB%B3%B4%EC%83%81%EC%97%90%EA%B4%80%ED%95%9C%EB%B2%95%EB%A5%A0";
  var COMP = [
    ["사업인정", "제20조", "공익성 판단의 출발점. 공공주택지구처럼 개별 법률이 사업인정을 의제하는 경우가 있어, 의제 시점은 해당 법률로 확인합니다.", "가격시점 · 개발이익 배제의 기준이 되는 시점 판단과 연결"],
    ["토지 · 물건조서 작성", "제14조", "조서 기재 누락 · 면적 · 권리관계 표시가 이후 협의와 재결의 바탕이 됩니다.", "평가 대상 물건의 범위 확정"],
    ["보상계획 공고 · 열람", "제15조", "보상계획을 공고 · 통지하고 14일 이상 열람하게 하며, 이 기간에 조서 내용에 이의를 제기할 수 있습니다.", "조서 이의가 평가 대상에 반영되는지 확인"],
    ["감정평가", "제68조 · 제70조", "감정평가법인등이 평가합니다(시 · 도지사와 토지소유자가 각 1인 추천 가능). 토지는 공시지가를 기준으로 하고 해당 공익사업으로 인한 개발이익은 배제합니다(제67조).", "적용 공시지가 · 비교표준지 선정 · 개발이익 배제가 핵심 쟁점"],
    ["보상협의", "제16조", "평가 결과를 바탕으로 협의합니다. 산정 근거를 소유자가 이해할 수 있게 설명하는 일이 분쟁을 줄입니다.", "협의 단계 평가와 재결 단계 평가는 가격시점이 다를 수 있음"],
    ["재결 신청 · 청구", "제28조 · 제30조", "협의가 성립하지 않으면 사업시행자가 재결을 신청하고, 토지소유자는 재결 신청을 청구할 수 있습니다.", "재결 단계에서 다시 감정평가"],
    ["수용재결", "제34조", "토지수용위원회가 수용과 보상액을 재결합니다.", "재결 감정평가액과 협의 평가액의 차이 분석"],
    ["이의신청", "제83조", "재결서 정본을 받은 날부터 30일 이내에 이의를 신청할 수 있습니다.", "이의재결 감정평가"],
    ["행정소송", "제85조", "재결서를 받은 날부터 90일, 이의신청을 거친 경우 이의재결서를 받은 날부터 60일 이내에 제기할 수 있습니다.", "법원 감정"],
  ];
  var COMP_ISSUES = [["토지", "공시지가 기준 · 개발이익 배제"], ["지장물(건축물 등)", "제75조 — 이전비 원칙"], ["영업손실 · 농업손실", "제77조"], ["이주대책 · 주거이전비", "제78조"]];
  function demoComp(st) {
    var k = st && st.step != null ? st.step : 3, s = COMP[k];
    return '<div class="cs-demo cs-comp" data-demo="comp"><p class="cs-demo__tag">' + badge("demo") + " 공개 법령(공익사업을 위한 토지 등의 취득 및 보상에 관한 법률) 기반으로 새로 만든 설명 화면 · 원본 발표자료가 아닙니다 · 개별 사업의 실제 진행과 다를 수 있습니다</p>" +
      '<ol class="cs-steps">' + COMP.map(function (c, i) { return '<li><button type="button" data-comp="' + i + '" aria-pressed="' + (i === k) + '"><b>' + (i + 1) + "</b>" + esc(c[0]) + "</button></li>"; }).join("") + "</ol>" +
      '<div class="cs-stepcard" aria-live="polite"><p class="cs-stepcard__k">' + (k + 1) + " · " + esc(s[0]) + ' <span>토지보상법 ' + esc(s[1]) + "</span></p><p>" + esc(s[2]) + '</p><p class="cs-stepcard__ap"><b>감정평가와의 연결</b> ' + esc(s[3]) + '</p><p><a href="' + LAW_URL + '" target="_blank" rel="noreferrer">국가법령정보센터 원문 확인 →</a></p></div>' +
      '<div class="cs-issues"><p>보상 쟁점 분류</p><ul>' + COMP_ISSUES.map(function (x) { return "<li><b>" + esc(x[0]) + "</b>" + esc(x[1]) + "</li>"; }).join("") + "</ul></div></div>";
  }

  /* ---------------------------------------------------------------- AI 전환 타임라인 */
  function demoTimeline(c) {
    return '<div class="cs-demo cs-tl" data-demo="timeline"><ol class="cs-tl__list">' + c.timeline.map(function (t, i) {
      return '<li class="cs-tl__i cs-tl__i--' + (t[2] === "future" ? "future" : "actual") + '" data-tl><span class="cs-tl__n">' + (i + 1) + "</span><div><p class=\"cs-tl__t\">" + esc(t[0]) + " " + badge(t[2]) + "</p><p>" + esc(t[1]) + "</p></div></li>";
    }).join("") + "</ol></div>";
  }

  /* ---------------------------------------------------------------- 자동화 배치 */
  var ISSUE = { nomail: ["review", "수신 메일 없음 → 담당자 검토"], badmail: ["review", "메일 형식 오류 → 담당자 검토"], noamount: ["review", "명세 금액 없음 → 발송 보류 · 담당자 검토"], dup: ["blocked", "같은 대상 중복 → 발송 차단"], sendfail: ["sent", "1차 발송 실패 → 재처리 후 발송"] };
  function batchRun(rows) { return rows.map(function (r) { var x = r.issue ? ISSUE[r.issue] : ["sent", "검사 통과 → 발송 완료"]; return { id: r.id, who: r.who, status: x[0], note: x[1], retried: r.issue === "sendfail" }; }); }
  function demoBatch(st) {
    var done = st && st.done || 0, res = batchRun(D.BATCH), S = { sent: "발송", blocked: "차단", review: "검토 대기" };
    var steps = ["원본 입력", "유효성 검사", "수신 대상 매칭", "중복 발송 차단", "발송 · 결과 확인", "실패 재처리", "담당자 검토"];
    var cnt = { sent: 0, blocked: 0, review: 0 }; res.slice(0, done).forEach(function (r) { cnt[r.status]++; });
    return '<div class="cs-demo cs-batch" data-demo="batch"><p class="cs-demo__tag">' + badge("demo") + " 가상 배치 8건 · 실제 임직원 · 고객 정보가 아닙니다 · 메일은 보내지 않습니다</p>" +
      '<ol class="cs-flow">' + steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" +
      '<div class="cs-filters"><button type="button" class="cs-btn" data-batch-run>' + (done ? "다시 실행" : "처리 실행") + '</button><p class="cs-count" aria-live="polite">처리 ' + done + " / " + res.length + " · 발송 " + cnt.sent + " · 차단 " + cnt.blocked + " · 검토 대기 " + cnt.review + "</p></div>" +
      '<div class="cs-tablewrap"><table class="cs-table"><thead><tr><th>번호</th><th>대상(가상)</th><th>결과</th><th>처리 내용</th></tr></thead><tbody>' + res.map(function (r, i) {
        return '<tr class="' + (i < done ? "is-" + r.status : "is-wait") + '"><td>' + r.id + "</td><td>" + esc(r.who) + "</td><td>" + (i < done ? '<span class="cs-st cs-st--' + r.status + '">' + S[r.status] + (r.retried ? " · 재처리" : "") + "</span>" : "대기") + "</td><td>" + (i < done ? esc(r.note) : "—") + "</td></tr>";
      }).join("") + "</tbody></table></div></div>";
  }

  /* ---------------------------------------------------------------- 법령 변화 관제 */
  function demoLaw(st) {
    var id = st && st.id || "L1", x = D.LAW_CHANGES.find(function (l) { return l.id === id; });
    return '<div class="cs-demo cs-law" data-demo="law"><p class="cs-demo__tag">' + badge("demo") + " 가상 조문 · 실제 법령 개정이 아닙니다 · 실제 확인은 국가법령정보센터 원문</p>" +
      '<ul class="cs-tabs" role="list">' + D.LAW_CHANGES.map(function (l) { return '<li><button type="button" data-law="' + l.id + '" aria-pressed="' + (l.id === id) + '"><span class="cs-lv cs-lv--' + l.level + '">' + LV[l.level] + "</span>" + esc(l.title) + "</button></li>"; }).join("") + "</ul>" +
      '<dl class="cs-meta"><div><dt>공포일</dt><dd>' + x.promulgated + "</dd></div><div><dt>시행일</dt><dd>" + x.effective + "</dd></div><div><dt>중요도</dt><dd>" + LV[x.level] + "</dd></div><div><dt>업무 분야</dt><dd>" + x.fields.join(" · ") + "</dd></div></dl>" +
      '<div class="cs-diff"><div><p>개정 전</p><p class="cs-diff__t">' + segs(x.before) + '</p></div><div><p>개정 후</p><p class="cs-diff__t">' + segs(x.after) + "</p></div></div>" +
      '<p class="cs-review"><b>검토 필요</b> ' + esc(x.review) + '</p><p><a href="https://www.law.go.kr/" target="_blank" rel="noreferrer">국가법령정보센터에서 원문 확인 →</a></p></div>';
  }

  /* ---------------------------------------------------------------- 정족수 시뮬레이션 — 요건은 입력값(기본값은 예시) */
  var DOCS = ["총회 소집 통지 발송 기록", "안건 · 설명 자료", "조합원 명부(기준일 표기)", "위임장 접수 대장", "서면결의서 접수 대장", "현장 출석부", "의사록 초안"];
  var QDEF = { members: 120, direct: 26, proxy: 21, written: 41, yes: 61, att: 50, yesq: "half", directMin: 10, have: [1, 1, 1, 1, 1, 1, 0] };
  function quorum(q) {
    var attend = q.direct + q.proxy + q.written, needAtt = q.members * q.att / 100;
    var yesOk = q.yesq === "two3" ? q.yes * 3 >= attend * 2 : q.yes * 2 > attend;
    var checks = [
      ["출석", attend + "명 / 기준 " + (q.att) + "%(" + Math.ceil(needAtt) + "명)", attend >= needAtt],
      ["찬성", q.yes + "명 / 출석의 " + (q.yesq === "two3" ? "3분의 2 이상" : "과반수"), yesOk && q.yes <= attend],
      ["직접 출석", q.direct + "명 / 조합원의 " + q.directMin + "% 이상(" + Math.ceil(q.members * q.directMin / 100) + "명)", q.direct >= q.members * q.directMin / 100],
    ];
    return { attend: attend, checks: checks, ok: checks.every(function (c) { return c[2]; }), missing: DOCS.filter(function (_, i) { return !q.have[i]; }) };
  }
  function demoQuorum(q) {
    q = Object.assign({}, QDEF, q || {}); var r = quorum(q);
    var num = function (k, l) { return '<label class="cs-f"><span>' + l + '</span><input type="number" min="0" max="5000" inputmode="numeric" data-q="' + k + '" value="' + q[k] + '"></label>'; };
    return '<div class="cs-demo cs-q" data-demo="quorum"><p class="cs-demo__tag">' + badge("demo") + " 가상 총회 · 요건 기본값은 예시입니다 — 실제 요건은 법령 · 정관 · 안건에 따라 다릅니다</p>" +
      '<div class="cs-qgrid">' + num("members", "조합원 수") + num("direct", "직접 출석") + num("proxy", "대리 출석") + num("written", "서면결의") + num("yes", "찬성") + num("att", "출석 기준(%)") + num("directMin", "직접 출석 기준(%)") +
      '<label class="cs-f"><span>찬성 요건</span><select data-q="yesq"><option value="half"' + (q.yesq === "half" ? " selected" : "") + '>출석 과반수(예시)</option><option value="two3"' + (q.yesq === "two3" ? " selected" : "") + ">출석 3분의 2 이상(예시)</option></select></label></div>" +
      '<ul class="cs-checks" aria-live="polite">' + r.checks.map(function (c) { return '<li class="' + (c[2] ? "is-ok" : "is-no") + '"><b>' + c[0] + "</b>" + esc(c[1]) + "<span>" + (c[2] ? "충족" : "미충족") + "</span></li>"; }).join("") + "</ul>" +
      '<p class="cs-verdict ' + (r.ok ? "is-ok" : "is-no") + '">입력 요건 기준 ' + (r.ok ? "충족" : "미충족") + " — 시뮬레이션이며 결의의 유효 · 무효 판단이 아닙니다</p>" +
      '<fieldset class="cs-docs"><legend>소집 · 통지 서류 점검(누락 ' + r.missing.length + "건)</legend>" + DOCS.map(function (d, i) { return '<label><input type="checkbox" data-qdoc="' + i + '"' + (q.have[i] ? " checked" : "") + "> " + esc(d) + "</label>"; }).join("") + "</fieldset>" +
      '<div class="cs-issues"><p>법률 전문가 추가 검토가 필요한 쟁점</p><ul><li><b>서면결의</b>철회 · 현장 출석과의 중복 처리</li><li><b>위임장</b>대리권 증명 · 진정성</li><li><b>명부</b>기준일 이후 자격 변동</li><li><b>안건</b>안건 유형별 특별 의결 요건</li></ul></div>' +
      '<p><a href="https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EB%8F%84%EC%8B%9C%EB%B0%8F%EC%A3%BC%EA%B1%B0%ED%99%98%EA%B2%BD%EC%A0%95%EB%B9%84%EB%B2%95" target="_blank" rel="noreferrer">도시 및 주거환경정비법 원문 확인 →</a></p></div>';
  }

  /* ---------------------------------------------------------------- 계약 변경 */
  var FLOW = ["초안", "검토 의견", "승인"];
  function demoContract(st) {
    st = st || {}; var k = st.k || 0, c = D.CONTRACT.clauses[k], stage = st.stage || 0, notes = st.notes || [];
    var tot0 = 0, tot1 = 0;
    var cost = D.CONTRACT.costs.map(function (r) { tot0 += r[1]; tot1 += r[2]; var d = r[2] - r[1]; return "<tr><td>" + esc(r[0]) + '</td><td class="n">' + fmt(r[1]) + '</td><td class="n">' + fmt(r[2]) + '</td><td class="n is-up">+' + fmt(d) + '</td><td class="n">' + (d / r[1] * 100).toFixed(1) + "%</td></tr>"; }).join("");
    var cats = {}; D.CONTRACT.clauses.forEach(function (x) { cats[x.cat] = (cats[x.cat] || 0) + 1; });
    return '<div class="cs-demo cs-ct" data-demo="contract"><p class="cs-demo__tag">' + badge("demo") + " 가상 계약 · 실제 계약서가 아닙니다 · 금액 단위 억 원</p>" +
      '<ul class="cs-tabs" role="list">' + D.CONTRACT.clauses.map(function (x, i) { return '<li><button type="button" data-ct="' + i + '" aria-pressed="' + (i === k) + '"><span class="cs-lv cs-lv--' + x.level + '">' + esc(x.cat) + "</span>" + esc(x.no + " " + x.name) + "</button></li>"; }).join("") + "</ul>" +
      '<div class="cs-diff"><div><p>변경 전</p><p class="cs-diff__t">' + segs(c.before) + '</p></div><div><p>변경 후</p><p class="cs-diff__t">' + segs(c.after) + "</p></div></div>" +
      '<p class="cs-review"><b>위험 분류</b> ' + esc(c.cat) + " · 검토 우선순위 " + LV[c.level] + ' · <span class="cs-basis">근거: ' + esc(c.basis) + "</span></p>" +
      '<p class="cs-sub">분류별 변경 조항 — ' + Object.keys(cats).map(function (x) { return esc(x) + " " + cats[x]; }).join(" · ") + "</p>" +
      '<div class="cs-tablewrap"><table class="cs-table"><caption>공사비 항목별 증감(가상)</caption><thead><tr><th>항목</th><th class="n">변경 전</th><th class="n">변경 후</th><th class="n">증감</th><th class="n">증감률</th></tr></thead><tbody>' + cost + '<tr class="is-total"><td>합계</td><td class="n">' + fmt(tot0) + '</td><td class="n">' + fmt(tot1) + '</td><td class="n is-up">+' + fmt(tot1 - tot0) + '</td><td class="n">' + ((tot1 - tot0) / tot0 * 100).toFixed(1) + "%</td></tr></tbody></table></div>" +
      '<div class="cs-approve"><ol class="cs-flow cs-flow--state">' + FLOW.map(function (f, i) { return '<li class="' + (i < stage ? "is-done" : i === stage ? "is-now" : "") + '">' + f + "</li>"; }).join("") + "</ol>" +
      (stage < 2 ? '<label class="cs-f cs-f--wide"><span>검토 의견(이 탭에만 남습니다)</span><textarea data-ct-note rows="2" maxlength="300" placeholder="예: 제14조 물가변동 조정 제한 — 책임배분 변경, 변호사 검토 필요"></textarea></label><div class="cs-filters"><button type="button" class="cs-btn" data-ct-add>의견 남기기</button><button type="button" class="cs-btn cs-btn--solid" data-ct-ok' + (notes.length ? "" : " disabled") + ">승인</button></div>" : '<p class="cs-verdict is-ok">승인됨 — 시연 기록이며 실제 승인이 아닙니다</p>') +
      (notes.length ? '<ul class="cs-log">' + notes.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") + "</ul>" : "") + "</div></div>";
  }

  /* ---------------------------------------------------------------- 사례 한 편 */
  function demoFor(c) {
    var M = { bid: demoBid, comp: demoComp, law: demoLaw, quorum: demoQuorum, contract: demoContract, batch: demoBatch };
    return M[c.demo] ? M[c.demo]() : c.demo === "timeline" ? demoTimeline(c) : "";
  }
  var DEMO_T = { bid: "작동 시연 — 가상 데이터 분석", comp: "보상 절차도 — 공개 법령 기반 설명 화면", timeline: "수행 단계 — 실제 수행과 제안 구분", batch: "처리 흐름 시연 — 가상 배치", law: "작동 시연 — 가상 조문 비교", quorum: "작동 시연 — 정족수 시뮬레이션", contract: "작동 시연 — 가상 계약 비교 · 승인" };
  function list(items) { return "<ul class=\"cs-list\">" + items.map(function (x) { return Array.isArray(x) ? "<li>" + badge(x[0]) + " " + esc(x[1]) + "</li>" : "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; }
  function block(n, t, body) { return '<div class="cs-b"><p class="cs-b__n"><span>' + String(n).padStart(2, "0") + "</span>" + t + "</p>" + body + "</div>"; }
  function renderCase(c) {
    var demo = demoFor(c);
    return '<article class="cs-case reveal-x" id="' + c.id + '" aria-labelledby="' + c.id + '-t">' +
      '<header class="cs-case__h"><p class="cs-case__k">' + badge(c.kind) + (c.system ? ' <span class="cs-tag">법률 AX 01–03 · 사내 구축</span>' : "") + "</p>" +
      '<h2 id="' + c.id + '-t">' + esc(c.ko) + '</h2><p class="cs-case__en" lang="en">' + esc(c.en) + '</p><p class="cs-case__s">' + esc(c.summary) + '</p><p class="cs-scope">' + esc(c.scope) + "</p></header>" +
      '<div class="cs-case__body">' +
      block(2, "수행 배경 · 실무 문제", "<p>" + esc(c.background) + "</p>") +
      block(3, "본인의 실제 담당 역할", list(c.role)) +
      block(4, "기존 업무 흐름 → 새로운 프로세스", '<div class="cs-ba" data-ba><div class="cs-ba__sw" role="group" aria-label="기존 · 개선 비교"><button type="button" data-ba-k="0" aria-pressed="true">기존 업무</button><button type="button" data-ba-k="1" aria-pressed="false">개선 이후</button></div><div class="cs-ba__p is-b"><p class="cs-ba__l">기존 업무 · Before</p>' + list(c.before) + '</div><div class="cs-ba__p is-a"><p class="cs-ba__l">개선 이후 · After</p>' + list(c.after) + "</div></div>" +
        (c.pipeline ? '<ol class="cs-pipe">' + c.pipeline.map(function (p) { return "<li><b>" + esc(p[0]) + "</b><span>" + esc(p[1]) + "</span>" + badge(p[2]) + "</li>"; }).join("") + "</ol>" : "")) +
      block(5, "구현한 기능", list(c.features)) +
      (demo ? block(6, DEMO_T[c.demo], demo) : "") +
      block(demo ? 7 : 6, "검증 가능한 결과", "<ul class=\"cs-list\">" + c.results.map(function (r) { return '<li><span class="cs-rt cs-rt--' + r[0] + '">' + D.RESULT[r[0]] + "</span> " + esc(r[1]) + "</li>"; }).join("") + "</ul>") +
      block(demo ? 8 : 7, "기술적 · 법률적 한계", list(c.limits)) +
      block(demo ? 9 : 8, "향후 개선 방향", list(c.next.map(function (x) { return ["future", x]; }))) +
      (c.links ? '<p class="cs-links">' + c.links.map(function (l) { return '<a class="cs-btn" href="' + l[1] + '">' + esc(l[0]) + " →</a>"; }).join(" ") + "</p>" : "") +
      "</div></article>";
  }
  function renderIndex() {
    return '<ol class="cs-index">' + D.CASES.slice().sort(function (a, b) { return a.order - b.order; }).map(function (c) {
      return '<li><a href="#' + c.id + '"><span class="cs-index__n">' + String(c.order).padStart(2, "0") + "</span><span class=\"cs-index__t\"><b>" + esc(c.ko) + '</b><i lang="en">' + esc(c.en) + "</i></span>" + badge(c.kind) + "</a></li>";
    }).join("") + "</ol>";
  }
  function renderAll() { return D.CASES.slice().sort(function (a, b) { return a.order - b.order; }).map(renderCase).join(""); }

  var api = { esc: esc, badge: badge, bidAnalyze: bidAnalyze, bidSimilar: bidSimilar, quorum: quorum, batchRun: batchRun, QDEF: QDEF, demoBid: demoBid, demoComp: demoComp, demoLaw: demoLaw, demoQuorum: demoQuorum, demoContract: demoContract, demoBatch: demoBatch, renderCase: renderCase, renderIndex: renderIndex, renderAll: renderAll, COMP: COMP };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CASES_RENDER = api;
})(typeof window !== "undefined" ? window : globalThis);
