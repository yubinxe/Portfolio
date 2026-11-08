/* city.js — 경국 AX 건축 · 공간정보 모형 (Canvas 2D · 의존성 없음)
 *
 * V6.1 범위: 건축 모형은 법무법인 경국 정비사업 AX(#ax-desk)에서만 쓴다.
 *   랜딩 · 개인 프로젝트 · 역량 구조 · 법률 AX 상세 페이지에는 건물을 그리지 않는다.
 * 장면
 *   reg   — 01 정비사업 법령 · 규제 변화 관제: 가상 사업지 A/B/C(필지 · 건물 배치가 서로 다름) 위에 규제 레이어 한 겹씩
 *   build — 03 공사도급계약 변경: 12층 → 15층 설계 변경과 계약 조항(공사 범위 · 공사비 · 지급 · 책임)의 연결
 *   comp  — 실무: 광명시흥 보상자료(필지 확인 → 감정평가 자료 → 보상협의 → 재결) 개념도
 * 왜 Canvas 2D 인가 — 필지는 불규칙 다각형이고 그림은 평면 다각형 · 도면 선이 중심이다. 작은 투영기와 화가 알고리즘으로
 * 충분하며, 폰에서 WebGL 컨텍스트를 여러 개 띄우는 위험이 없다.
 * 움직임 — 상시 애니메이션 없음. 사용자가 무언가를 고를 때만 짧게 전환하고, 같은 상태는 다시 그리지 않는다.
 * 화면 밖에서는 그리지 않고, 움직임 줄이기에서는 전환 없이 완성된 정지 화면만 그린다.
 * 그림 속 필지 · 건물 · 규제 · 조항은 모두 가상이다 — 실제 지번 · 용도지역 · 도시계획 · 계약이 아니다. */
(function () {
  "use strict";
  var D2R = Math.PI / 180;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function sm(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function seg(p, a, b) { return sm((p - a) / (b - a)); }
  function rng(seed) { var s = seed >>> 0 || 1; return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
  function calm() { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function mix(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
  function rgba(c, a) { return "rgba(" + (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0) + "," + (a == null ? 1 : +(+a).toFixed(3)) + ")"; }

  /* ---------------------------------------------------------------- 평면 기하 */
  function area(P) { var a = 0; for (var i = 0, n = P.length; i < n; i++) { var p = P[i], q = P[(i + 1) % n]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; }
  function ccw(P) { return area(P) < 0 ? P.slice().reverse() : P; }
  function cen(P) { var x = 0, y = 0; for (var i = 0; i < P.length; i++) { x += P[i][0]; y += P[i][1]; } return [x / P.length, y / P.length]; }
  function inset(P, k) { var c = cen(P); return P.map(function (p) { return [c[0] + (p[0] - c[0]) * k, c[1] + (p[1] - c[1]) * k]; }); }
  /* 바깥으로 m 만큼 — 꼭짓점을 중심에서 멀리(볼록 다각형 근사) */
  function grow(P, m) { var c = cen(P); return P.map(function (p) { var dx = p[0] - c[0], dy = p[1] - c[1], l = Math.hypot(dx, dy) || 1; return [p[0] + (dx / l) * m, p[1] + (dy / l) * m]; }); }
  /* 반평면 nx·x + ny·y <= d 로 자르기 (볼록 다각형은 볼록으로 남는다) */
  function clipHalf(P, nx, ny, d) {
    var out = [], n = P.length;
    for (var i = 0; i < n; i++) {
      var a = P[i], b = P[(i + 1) % n], da = nx * a[0] + ny * a[1] - d, db = nx * b[0] + ny * b[1] - d;
      if (da <= 0) out.push(a);
      if ((da < 0) !== (db < 0)) { var t = da / (da - db); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    return out;
  }
  function hull(pts) {
    pts = pts.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    var cr = function (o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); };
    var lo = [], up = [], i;
    for (i = 0; i < pts.length; i++) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], pts[i]) <= 0) lo.pop(); lo.push(pts[i]); }
    for (i = pts.length - 1; i >= 0; i--) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], pts[i]) <= 0) up.pop(); up.push(pts[i]); }
    up.pop(); lo.pop();
    return lo.concat(up);
  }
  function rect(cx, cy, w, h, a) {
    var c = Math.cos(a || 0), s = Math.sin(a || 0);
    return ccw([[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (k) { var x = k[0] * w / 2, y = k[1] * h / 2; return [cx + x * c - y * s, cy + x * s + y * c]; }));
  }
  function ngon(cx, cy, r, n, rot) { var out = []; for (var i = 0; i < n; i++) { var a = rot + (i / n) * Math.PI * 2; out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return out; }
  function inside(P, x, y) {
    var c = false;
    for (var i = 0, j = P.length - 1; i < P.length; j = i++) { var a = P[i], b = P[j]; if ((a[1] > y) !== (b[1] > y) && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) c = !c; }
    return c;
  }
  /* 다각형을 긴 변에 수직으로 차례로 잘라 필지로 나눈다(불규칙하되 같은 씨앗이면 늘 같은 모양) */
  function subdivide(P, g, minA, maxDepth) {
    var A = Math.abs(area(P));
    if (A < minA || maxDepth <= 0) return [P];
    var bi = 0, bl = 0;
    for (var e = 0; e < P.length; e++) { var a = P[e], b = P[(e + 1) % P.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (l > bl) { bl = l; bi = e; } }
    var a2 = P[bi], b2 = P[(bi + 1) % P.length], ang = Math.atan2(b2[1] - a2[1], b2[0] - a2[0]) + (g() - 0.5) * 0.35;
    var nx = Math.cos(ang), ny = Math.sin(ang), c = cen(P), d = nx * c[0] + ny * c[1] + (g() - 0.5) * 0.28 * bl;
    var L = clipHalf(P, nx, ny, d), R = clipHalf(P, -nx, -ny, -d);
    if (L.length < 3 || R.length < 3 || Math.abs(area(L)) < minA * 0.4 || Math.abs(area(R)) < minA * 0.4) return [P];
    return subdivide(ccw(L), g, minA, maxDepth - 1).concat(subdivide(ccw(R), g, minA, maxDepth - 1));
  }

  /* ---------------------------------------------------------------- 색
   * ivory — 설계 프레젠테이션 보드: 아이보리 바탕 · 남색/차콜 구조 · 금색은 바뀐 것에만 · 검토 표시는 별도 의미색
   * dark  — 실무 카드(보상자료) */
  var LX = -0.58, LY = 0.46; /* 빛이 오는 방향(왼쪽 뒤 위) — 그림자는 오른쪽 앞으로. 모든 면 · 그림자가 이 한 방향을 따른다 */
  var THEME = {
    ivory: {
      ground: [240, 235, 225], parcel: [250, 247, 240], pLine: "rgba(19,40,75,.34)", road: [224, 218, 206], roadMark: "rgba(255,255,255,.85)", curb: "rgba(19,40,75,.20)",
      wall: [212, 206, 195], wallLit: [242, 238, 230], roof: [248, 245, 239], edge: "rgba(19,40,75,.30)",
      navy: [27, 44, 76], navyLit: [70, 90, 128], glass: [33, 50, 80], glassLit: [128, 150, 182], mull: "rgba(238,232,220,.55)",
      shadow: [92, 84, 70], gold: [170, 132, 66], gLine: "rgba(150,112,52,.95)", text: "rgba(14,26,46,.94)", soft: "rgba(14,26,46,.62)",
      alert: [168, 72, 48], plane: [27, 44, 76], labelBg: "rgba(250,247,240,.92)", zoneA: [214, 226, 214], zoneB: [236, 222, 200], tree: [120, 138, 108], treeLit: [168, 182, 148],
    },
    dark: {
      ground: [16, 26, 56], parcel: [28, 42, 86], pLine: "rgba(233,220,192,.30)", road: [22, 34, 70], roadMark: "rgba(233,220,192,.2)", curb: "rgba(233,220,192,.10)",
      wall: [46, 62, 110], wallLit: [82, 100, 152], roof: [92, 110, 160], edge: "rgba(233,220,192,.20)",
      navy: [233, 220, 192], navyLit: [233, 220, 192], glass: [40, 56, 100], glassLit: [90, 110, 160], mull: "rgba(233,220,192,.3)",
      shadow: [6, 12, 34], gold: [206, 172, 108], gLine: "rgba(222,188,120,.96)", text: "rgba(246,241,231,.95)", soft: "rgba(246,241,231,.62)",
      alert: [226, 128, 92], plane: [233, 220, 192], labelBg: "rgba(10,21,48,.8)", zoneA: [40, 60, 90], zoneB: [60, 56, 80], tree: [60, 80, 70], treeLit: [90, 110, 90],
    },
  };
  var FONT = "'Pretendard Variable', Pretendard, Inter, system-ui, sans-serif";

  /* ---------------------------------------------------------------- 렌더러 */
  function Rd(canvas, theme) { this.c = canvas; this.x = canvas.getContext("2d"); this.T = theme; this.w = 1; this.h = 1; this.d = 1; }
  Rd.prototype.size = function (maxDpr) {
    var r = this.c.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
    var d = Math.min(window.devicePixelRatio || 1, maxDpr), W = Math.round(w * d), H = Math.round(h * d);
    if (this.c.width !== W || this.c.height !== H) { this.c.width = W; this.c.height = H; }
    this.w = w; this.h = h; this.d = d;
  };
  /* 카메라 — 목표점 · 방위각(yaw) · 앙각(pitch) · 거리 · 초점거리 · 화면 중심 */
  Rd.prototype.cam = function (tx, ty, tz, yaw, pitch, dist, F, ox, oy) {
    var c = Math.cos(yaw * D2R), s = Math.sin(yaw * D2R), cp = Math.cos(pitch * D2R), sp = Math.sin(pitch * D2R);
    this.k = [tx, ty, tz, c, s, cp, sp, dist, F, ox, oy];
    this.eye = [tx + dist * cp * s, ty - dist * cp * c, tz + dist * sp];
  };
  Rd.prototype.p = function (x, y, z) {
    var k = this.k, dx = x - k[0], dy = y - k[1], dz = z - k[2];
    var X = dx * k[3] + dy * k[4], Y = -dx * k[4] + dy * k[3];
    var ey = Y + k[7] * k[5], ez = dz - k[7] * k[6];
    var up = ey * k[6] + ez * k[5], fw = ey * k[5] - ez * k[6];
    if (fw < k[7] * 0.05) fw = k[7] * 0.05;
    var f = k[8] / fw;
    return [k[9] + X * f, k[10] - up * f, fw];
  };
  Rd.prototype.depth = function (x, y, z) { var e = this.eye; return Math.hypot(x - e[0], y - e[1], (z || 0) - e[2]); };
  Rd.prototype.begin = function (bg) {
    var x = this.x;
    x.setTransform(this.d, 0, 0, this.d, 0, 0);
    x.clearRect(0, 0, this.w, this.h);
    if (bg) { x.fillStyle = bg; x.fillRect(0, 0, this.w, this.h); }
    x.lineJoin = "round"; x.lineCap = "round";
  };
  Rd.prototype.path = function (P, z) {
    var x = this.x, q = this.p(P[0][0], P[0][1], z);
    x.beginPath(); x.moveTo(q[0], q[1]);
    for (var i = 1; i < P.length; i++) { q = this.p(P[i][0], P[i][1], z); x.lineTo(q[0], q[1]); }
    x.closePath();
  };
  Rd.prototype.flat = function (P, z, fill, stroke, lw, dash) {
    var x = this.x;
    this.path(P, z);
    if (fill) { x.fillStyle = fill; x.fill(); }
    if (stroke) { x.strokeStyle = stroke; x.lineWidth = lw || 1; if (dash) x.setLineDash(dash); x.stroke(); if (dash) x.setLineDash([]); }
  };
  Rd.prototype.line = function (pts, stroke, lw, dash) {
    if (pts.length < 2) return;
    var x = this.x, q = this.p(pts[0][0], pts[0][1], pts[0][2] || 0);
    x.beginPath(); x.moveTo(q[0], q[1]);
    for (var i = 1; i < pts.length; i++) { q = this.p(pts[i][0], pts[i][1], pts[i][2] || 0); x.lineTo(q[0], q[1]); }
    x.strokeStyle = stroke; x.lineWidth = lw || 1;
    if (dash) x.setLineDash(dash);
    x.stroke(); if (dash) x.setLineDash([]);
  };
  /* 면 하나의 밝기(램버트) — 빛 방향 한 개로 모든 면이 일관된다 */
  function lam(p, q) { var nx = q[1] - p[1], ny = -(q[0] - p[0]), L = Math.hypot(nx, ny) || 1; return clamp(((nx * LX + ny * LY) / L) * 0.5 + 0.5, 0, 1); }
  /* 볼 수 있는 벽(뒷면 제거) — 볼록 바닥 다각형 기준 */
  Rd.prototype.faces = function (F) {
    var out = [], eye = this.eye, n = F.length;
    for (var i = 0; i < n; i++) {
      var p = F[i], q = F[(i + 1) % n], nx = q[1] - p[1], ny = -(q[0] - p[0]);
      if (nx * ((p[0] + q[0]) / 2 - eye[0]) + ny * ((p[1] + q[1]) / 2 - eye[1]) < 0) out.push(i);
    }
    return out;
  };
  Rd.prototype.quad = function (a, b, c, d, fill, stroke, lw) {
    var x = this.x;
    x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.lineTo(c[0], c[1]); x.lineTo(d[0], d[1]); x.closePath();
    if (fill) { x.fillStyle = fill; x.fill(); }
    if (stroke) { x.strokeStyle = stroke; x.lineWidth = lw || 0.6; x.stroke(); }
  };
  /* 매스(바닥 다각형을 z0 → z1 로) — 벽 음영 · 바닥 접지 어둠(AO) · 지붕 */
  Rd.prototype.prism = function (F, z0, z1, o) {
    o = o || {};
    var T = this.T, n = F.length, a = o.a == null ? 1 : o.a, i, self = this;
    if (a <= 0.004) return;
    var wc = o.wall || T.wall, wl = o.wallLit || T.wallLit, edge = o.edge === false ? null : (o.line || T.edge);
    if (z1 - z0 > 0.01) {
      this.faces(F).forEach(function (i2) {
        var p = F[i2], q = F[(i2 + 1) % n];
        var B0 = self.p(p[0], p[1], z0), B1 = self.p(q[0], q[1], z0), U1 = self.p(q[0], q[1], z1), U0 = self.p(p[0], p[1], z1);
        self.quad(B0, B1, U1, U0, rgba(mix(wc, wl, lam(p, q)), a), edge, o.lw || 0.6);
        if (o.ao !== false && z0 < 0.05) { /* 접지 어둠 — 벽 아래 0.9 만큼 */
          var t = Math.min(1, 0.9 / (z1 - z0)), M1 = [lerp(B1[0], U1[0], t), lerp(B1[1], U1[1], t)], M0 = [lerp(B0[0], U0[0], t), lerp(B0[1], U0[1], t)];
          var gr = self.x.createLinearGradient((B0[0] + B1[0]) / 2, (B0[1] + B1[1]) / 2, (M0[0] + M1[0]) / 2, (M0[1] + M1[1]) / 2);
          gr.addColorStop(0, rgba(T.shadow, 0.22 * a)); gr.addColorStop(1, rgba(T.shadow, 0));
          self.quad(B0, B1, M1, M0, gr);
        }
        if (o.floors && o.floors > 1) { /* 층 선 */
          for (var f = 1; f < o.floors; f++) { var z = lerp(z0, z1, f / o.floors); self.line([[p[0], p[1], z], [q[0], q[1], z]], o.floorC || "rgba(19,40,75,.14)", 0.6); }
        }
      });
    }
    if (o.roof !== false) this.flat(F, z1, rgba(o.roofC || T.roof, a), edge, o.lw || 0.7);
  };
  /* 커튼월 입면 — 층마다 유리 띠 · 수직 멀리언 · 층 선. hl(f) 가 참인 층은 금색(변경분) */
  Rd.prototype.facade = function (F, z0, nFl, fh, o) {
    o = o || {};
    var T = this.T, n = F.length, self = this, x = this.x, top = z0 + nFl * fh, full = Math.ceil(nFl);
    var span = o.span || 2.1, glazeB = o.glazeB == null ? 0.2 : o.glazeB, glazeT = o.glazeT == null ? 0.1 : o.glazeT;
    this.faces(F).forEach(function (i) {
      var p = F[i], q = F[(i + 1) % n], L = Math.hypot(q[0] - p[0], q[1] - p[1]), l = lam(p, q);
      var B0 = self.p(p[0], p[1], z0), B1 = self.p(q[0], q[1], z0), U1 = self.p(q[0], q[1], top), U0 = self.p(p[0], p[1], top);
      self.quad(B0, B1, U1, U0, rgba(mix(o.wall || T.navy, o.wallLit || T.navyLit, l), 1));
      var m = Math.min(0.6, L * 0.06), t0 = m / L, t1 = 1 - m / L;
      var P0 = [lerp(p[0], q[0], t0), lerp(p[1], q[1], t0)], P1 = [lerp(p[0], q[0], t1), lerp(p[1], q[1], t1)];
      for (var f = 0; f < full; f++) {
        var part = clamp(nFl - f, 0, 1); if (part <= 0) break;
        var zb = z0 + f * fh, zg0 = zb + fh * glazeB, zg1 = zb + fh * (1 - glazeT) * part;
        if (zg1 <= zg0) continue;
        var hot = o.hl && o.hl(f), gl = hot ? mix(T.gold, [252, 238, 206], l * 0.55) : mix(o.glass || T.glass, o.glassLit || T.glassLit, l * 0.85);
        var a0 = self.p(P0[0], P0[1], zg0), a1 = self.p(P1[0], P1[1], zg0), b1 = self.p(P1[0], P1[1], zg1), b0 = self.p(P0[0], P0[1], zg1);
        var gr = x.createLinearGradient(a0[0], a0[1], b0[0], b0[1]); /* 유리 — 아래가 조금 더 어둡다(하늘 반사) */
        gr.addColorStop(0, rgba(mix(gl, [10, 18, 34], 0.18), 1)); gr.addColorStop(1, rgba(gl, 1));
        self.quad(a0, a1, b1, b0, gr);
        if (hot) self.quad(a0, a1, b1, b0, null, T.gLine, 0.9);
      }
      /* 수직 멀리언 · 층 선 */
      var bays = Math.max(1, Math.round((L * (t1 - t0)) / span));
      for (var k = 1; k < bays; k++) { var t = lerp(t0, t1, k / bays), mx = lerp(p[0], q[0], t), my = lerp(p[1], q[1], t); self.line([[mx, my, z0], [mx, my, top]], T.mull, 0.7); }
      for (var f2 = 1; f2 < nFl; f2++) { var zf = z0 + f2 * fh; self.line([[p[0], p[1], zf], [q[0], q[1], zf]], o.slab || "rgba(14,26,46,.55)", 0.7); }
      self.quad(B0, B1, U1, U0, null, o.line || "rgba(14,26,46,.6)", 0.8);
    });
    this.flat(F, top, rgba(o.roofC || mix(T.navy, T.roof, 0.72), 1), o.line || "rgba(14,26,46,.55)", 0.8);
    this.flat(inset(F, 0.92), top + 0.02, null, "rgba(14,26,46,.28)", 0.6); /* 난간(파라펫) 안쪽 선 */
  };
  /* 박공지붕 집(노후 저층 주거) — 벽 + 지붕 두 면 + 박공 삼각형 */
  Rd.prototype.house = function (hs, a) {
    var T = this.T, c = hs.c, w = hs.w, d = hs.d, ang = hs.ang, h = hs.h * a, rh = hs.rh * a, self = this;
    if (a <= 0.01) return;
    var F = rect(c[0], c[1], w, d, ang);
    this.prism(F, 0, h, { roof: false, a: 1 });
    var ca = Math.cos(ang), sa = Math.sin(ang), r0 = [c[0] - (w / 2) * ca, c[1] - (w / 2) * sa], r1 = [c[0] + (w / 2) * ca, c[1] + (w / 2) * sa];
    var R = [[F[0], F[1], r1, r0], [F[2], F[3], r0, r1]], tri = [[F[1], F[2], r1], [F[3], F[0], r0]];
    var items = [];
    R.forEach(function (s2) { var m = cen([s2[0], s2[1], s2[2], s2[3]]); items.push({ k: "r", s: s2, d: self.depth(m[0], m[1], h + rh / 2) }); });
    tri.forEach(function (t2) { var m = cen(t2); items.push({ k: "t", s: t2, d: self.depth(m[0], m[1], h) }); });
    items.sort(function (A, B) { return B.d - A.d; });
    var roofC = hs.roofC || [150, 112, 92], roofL = mix(roofC, [236, 214, 196], 0.45);
    items.forEach(function (it) {
      var s2 = it.s;
      if (it.k === "r") {
        var P = [self.p(s2[0][0], s2[0][1], h), self.p(s2[1][0], s2[1][1], h), self.p(s2[2][0], s2[2][1], h + rh), self.p(s2[3][0], s2[3][1], h + rh)];
        var e = s2[0], f = s2[1], nx = f[1] - e[1], ny = -(f[0] - e[0]), L = Math.hypot(nx, ny) || 1, li = clamp(((nx * LX + ny * LY) / L) * 0.5 + 0.55, 0, 1);
        self.quad(P[0], P[1], P[2], P[3], rgba(mix(roofC, roofL, li), 1), "rgba(60,40,30,.35)", 0.5);
      } else {
        var Q = [self.p(s2[0][0], s2[0][1], h), self.p(s2[1][0], s2[1][1], h), self.p(s2[2][0], s2[2][1], h + rh)], x = self.x;
        x.beginPath(); x.moveTo(Q[0][0], Q[0][1]); x.lineTo(Q[1][0], Q[1][1]); x.lineTo(Q[2][0], Q[2][1]); x.closePath();
        x.fillStyle = rgba(mix(T.wall, T.wallLit, lam(s2[0], s2[1])), 1); x.fill(); x.strokeStyle = T.edge; x.lineWidth = 0.5; x.stroke();
      }
    });
  };
  /* 그림자 — 빛 방향으로 바닥에 투영한 볼록 껍질(부드러운 두 겹) */
  Rd.prototype.shadow = function (F, h, a) {
    if (h < 0.05) return;
    var k = h * 0.55, sh = F.map(function (p) { return [p[0] - LX * k, p[1] - LY * k]; }), H = hull(F.concat(sh));
    this.flat(H, 0.01, rgba(this.T.shadow, 0.1 * (a == null ? 1 : a)));
    this.flat(hull(F.concat(F.map(function (p) { return [p[0] - LX * k * 0.55, p[1] - LY * k * 0.55]; }))), 0.012, rgba(this.T.shadow, 0.07 * (a == null ? 1 : a)));
  };
  Rd.prototype.tree = function (x0, y0, r, a) {
    if (a <= 0.01) return;
    var T = this.T, b = this.p(x0, y0, 0), c = this.p(x0, y0, r * 1.6), x = this.x, rad = Math.abs(this.p(x0 + r, y0, r * 1.6)[0] - c[0]) + 1.5;
    this.shadow(ngon(x0, y0, r * 0.8, 8, 0), r * 1.6, a * 0.8);
    x.globalAlpha = a;
    x.beginPath(); x.moveTo(b[0], b[1]); x.lineTo(c[0], c[1]); x.strokeStyle = "rgba(90,74,56,.7)"; x.lineWidth = 1; x.stroke();
    var g = x.createRadialGradient(c[0] - rad * 0.35, c[1] - rad * 0.45, rad * 0.1, c[0], c[1], rad);
    g.addColorStop(0, rgba(T.treeLit, 1)); g.addColorStop(1, rgba(T.tree, 1));
    x.beginPath(); x.ellipse(c[0], c[1], rad, rad * 0.9, 0, 0, 6.283); x.fillStyle = g; x.fill();
    x.globalAlpha = 1;
  };
  /* 글자 — 모형의 한 점에서 지시선을 끌어 적는다 */
  Rd.prototype.label = function (wx, wy, wz, txt, o) {
    o = o || {};
    var x = this.x, q = this.p(wx, wy, wz), dx = o.dx || 0, dy = o.dy == null ? -26 : o.dy, a = o.a == null ? 1 : o.a;
    if (a <= 0.01) return;
    x.globalAlpha = a;
    if (dx || dy) {
      x.beginPath(); x.moveTo(q[0], q[1]); x.lineTo(q[0] + dx, q[1] + dy);
      x.strokeStyle = o.lc || this.T.soft; x.lineWidth = 0.9; x.stroke();
      x.beginPath(); x.arc(q[0], q[1], 2.2, 0, 6.283); x.fillStyle = o.lc || this.T.soft; x.fill();
    }
    var fs = o.size || 12, tx = q[0] + dx + (o.align === "right" ? -5 : o.align === "center" ? 0 : 5), ty = q[1] + dy;
    x.textAlign = o.align || "left"; x.textBaseline = "middle";
    x.font = (o.w || 650) + " " + fs + "px " + FONT;
    var wT = x.measureText(txt).width;
    if (o.k) { x.font = "600 " + (o.ks || 10) + "px " + FONT; wT = Math.max(wT, x.measureText(o.k).width); }
    /* 캔버스 밖으로 나가는 글자는 안쪽으로 밀어 넣는다(지시선 끝은 그대로) */
    var bx0 = o.align === "right" ? tx - wT - 5 : o.align === "center" ? tx - wT / 2 - 5 : tx - 5, sh = 0;
    if (bx0 < 6) sh = 6 - bx0; else if (bx0 + wT + 10 > this.w - 6) sh = this.w - 6 - (bx0 + wT + 10);
    tx += sh;
    if (o.bg !== false) {
      var bx = bx0 + sh, top = ty - fs * 0.78 - (o.k ? fs * 1.05 : 0);
      x.fillStyle = o.bgC || this.T.labelBg; x.fillRect(bx, top, wT + 10, (o.k ? fs * 1.05 : 0) + fs * 1.56);
      if (o.bd) { x.strokeStyle = o.bd; x.lineWidth = 1; x.strokeRect(bx + 0.5, top + 0.5, wT + 9, (o.k ? fs * 1.05 : 0) + fs * 1.56 - 1); }
    }
    if (o.k) { x.font = "600 " + (o.ks || 10) + "px " + FONT; x.fillStyle = o.kc || this.T.soft; x.fillText(o.k, tx, ty - fs * 1.02); }
    x.font = (o.w || 650) + " " + fs + "px " + FONT; x.fillStyle = o.col || this.T.text; x.fillText(txt, tx, ty);
    x.globalAlpha = 1;
  };
  Rd.prototype.pin = function (wx, wy, wz, h, col, a) {
    if (a <= 0.01) return;
    var x = this.x, b = this.p(wx, wy, wz), t = this.p(wx, wy, wz + h);
    x.globalAlpha = a;
    x.beginPath(); x.moveTo(b[0], b[1]); x.lineTo(t[0], t[1]); x.strokeStyle = rgba(col, 1); x.lineWidth = 1.3; x.stroke();
    x.beginPath(); x.arc(t[0], t[1], 5, 0, 6.283); x.fillStyle = rgba(col, 1); x.fill();
    x.beginPath(); x.arc(t[0], t[1], 1.9, 0, 6.283); x.fillStyle = "#fff"; x.fill();
    x.globalAlpha = 1;
  };
  /* 대지 · 도로 — 바깥 띠(도로)와 안쪽(대지). 도로 가운데 점선 */
  Rd.prototype.ground = function (outer, innerP, o) {
    var T = this.T;
    this.flat(outer, 0, rgba(T.road, 1));
    this.flat(grow(innerP, 2.6), 0.003, null, T.roadMark, 1, [6, 7]);
    this.flat(innerP, 0.005, rgba(T.ground, 1), T.curb, 1);
  };
  function fitDist(ext, F, px) { return (ext * 1.35 * F) / px; }

  var SCENES = {};

  /* ================================================================ reg — 01 정비사업 법령 · 규제 변화 관제
   * 사업지 A/B/C 는 서로 다른 모양 · 필지 · 건물(노후 저층 주거 / 중층 아파트 단지 / 소규모 블록)이다.
   * 규제 레이어 네 겹은 각각 그 사업지의 '어느 부분'에 걸리는지를 그린다 — 구역 경계 · 용도지역 구분선 · 높이 기준면 · 접도 도로.
   * '검토 후보' 표시는 법적 효력을 확정하지 않는다. 변경이 감지된 레이어를 변호사 검토 대상으로 드러낼 뿐이다 */
  var SITES = [
    { key: "A", bound: [[-19, -11], [-5, -15], [14, -13], [19.5, -2], [15, 11], [0, 14.5], [-16, 9]], seed: 11, kind: "houses", H: 13, cut: [0.9, 0.44, 2], road: 1, planned: [[-8, -3, 6, 6], [6, -5, 6, 6], [2, 7, 6, 5.5]], flag: 2 },
    { key: "B", bound: [[-21, -9], [17, -14], [20.5, 8], [-17, 12.5]], seed: 23, kind: "slabs", H: 17, cut: [1, -0.15, -3], road: 2, planned: [[-11, -3, 6, 6], [1, -6, 6, 6], [12, -3, 6, 6], [-4, 6, 6, 6]], flag: 1 },
    { key: "C", bound: [[-14, -8], [11, -11.5], [15.5, -1], [9.5, 9.5], [-12, 7.5]], seed: 37, kind: "mixed", H: 9, cut: [0.3, 1, 0.5], road: 3, planned: [[-5, 0, 9, 6.5], [7, -2, 6, 7]], flag: 3 },
  ];
  function buildSite(S, mob) {
    var g = rng(S.seed), B = ccw(S.bound), out = grow(B, 6.5), inner = grow(B, 1.4);
    var parcels = subdivide(B, g, S.kind === "slabs" ? 260 : S.kind === "mixed" ? 60 : 34, S.kind === "slabs" ? 2 : 4);
    var bld = [], houses = [], trees = [];
    if (S.kind === "houses") {
      parcels.forEach(function (P) {
        if (g() < 0.12) return;
        var c = cen(P), e0 = P[0], e1 = P[1], ang = Math.atan2(e1[1] - e0[1], e1[0] - e0[0]), A = Math.abs(area(P)), s = Math.sqrt(A) * 0.62;
        houses.push({ c: c, w: s * (0.9 + g() * 0.3), d: s * (0.7 + g() * 0.2), ang: ang, h: 0.9 + g() * 0.9, rh: 0.7 + g() * 0.3, roofC: g() < 0.55 ? [172, 132, 108] : [150, 152, 158] });
      });
    } else if (S.kind === "slabs") {
      var ang = Math.atan2(B[1][1] - B[0][1], B[1][0] - B[0][0]);
      [[-9, -4], [6, -6.5], [-6, 5.5], [9, 3]].forEach(function (c2, i) { bld.push({ F: rect(c2[0], c2[1], 14, 3.6, ang), fl: 5, fh: 0.95, c: c2, d: i * 0.08 }); });
      bld.push({ F: rect(15, -10, 4, 3, ang), fl: 1, fh: 1.2, c: [15, -10], d: 0.35 });
      for (var t = 0; t < 7; t++) trees.push([lerp(-14, 14, t / 6), lerp(0.6, -1.8, t / 6) + (g() - 0.5)]);
    } else {
      parcels.forEach(function (P, i) {
        var c = cen(P), e0 = P[0], e1 = P[1], ang = Math.atan2(e1[1] - e0[1], e1[0] - e0[0]), s = Math.sqrt(Math.abs(area(P))) * 0.66;
        bld.push({ F: rect(c[0], c[1], s, s * 0.8, ang), fl: 2 + Math.floor(g() * 3), fh: 1, c: c, d: i * 0.06 });
      });
    }
    /* 주변 맥락 — 도로 바깥의 낮은 블록(흰 모형) */
    var ctx = [], gg = rng(S.seed * 7 + 3);
    for (var i = -3; i <= 3; i++) for (var j = -3; j <= 3; j++) {
      var cx = i * 12 + (gg() - 0.5) * 3, cy = j * 11 + (gg() - 0.5) * 3, F = rect(cx, cy, 4.2 + gg() * 3, 3.6 + gg() * 3, (gg() - 0.5) * 0.3);
      if (F.some(function (p) { return inside(grow(out, 1.5), p[0], p[1]); }) || inside(grow(out, 1.5), cx, cy)) continue;
      if (Math.hypot(cx, cy) > (mob ? 32 : 38) || gg() < 0.22) continue;
      ctx.push({ F: F, h: 1 + gg() * 2.6 * (gg() < 0.18 ? 1.8 : 1), c: [cx, cy] });
    }
    /* 용도지역 구분 — 사업지를 한 직선으로 둘로(가상) */
    var zA = ccw(clipHalf(B, S.cut[0], S.cut[1], S.cut[2])), zB = ccw(clipHalf(B, -S.cut[0], -S.cut[1], -S.cut[2]));
    /* 접도 도로 — 사업지의 한 변을 따라 바깥 띠, 그 안쪽은 확폭 예정 띠(가상) */
    var e = S.road % B.length, p = B[e], q = B[(e + 1) % B.length], nx = q[1] - p[1], ny = -(q[0] - p[0]), L = Math.hypot(nx, ny);
    nx /= L; ny /= L;
    var roadSeg = [p, q, [q[0] + nx * 5, q[1] + ny * 5], [p[0] + nx * 5, p[1] + ny * 5]];
    var widen = ccw(clipHalf(B, -nx, -ny, -(nx * p[0] + ny * p[1]) + 2.2));
    var planned = S.planned.map(function (r) { return rect(r[0], r[1], r[2], r[3], 0); });
    return { S: S, B: B, out: out, inner: inner, parcels: parcels, houses: houses, bld: bld, trees: trees, ctx: ctx, zA: zA, zB: zB, roadSeg: ccw(roadSeg), widen: widen, planned: planned, c: cen(B), edgeMid: [(p[0] + q[0]) / 2 + nx * 2.5, (p[1] + q[1]) / 2 + ny * 2.5] };
  }
  var LAYER_KO = ["정비구역 경계", "용도지역 구분", "높이 기준", "접도 도로 · 기반시설"];
  SCENES.reg = {
    theme: "ivory",
    build: function (mob) { return { mob: mob, sites: SITES.map(function (S) { return buildSite(S, mob); }) }; },
    /* 상태: site(0–2) · lay(-1 없음 · 0–3) · la(레이어 등장 0→1) · inn(사업지 등장 0→1) · req(검토 요청 0/1) */
    draw: function (r, M, s) {
      var T = r.T, W = r.w, H = r.h, mob = M.mob, X = M.sites[s.site || 0], inn = s.inn == null ? 1 : s.inn, lay = s.lay == null ? -1 : s.lay, la = s.la == null ? 1 : s.la;
      var F = Math.max(W, H) * 1.2, px = Math.min(W * (mob ? 1.0 : 0.8), H * 1.35);
      var pitch = lay === 2 ? lerp(44, mob ? 38 : 32, la) : 44, yaw = -34 + (lay === 3 ? 8 * la : 0);
      var foc = lay === 3 ? X.edgeMid : X.c, fz = lay === 2 ? 4 * la : 0;
      r.cam(lerp(X.c[0], foc[0], 0.35 * la), lerp(X.c[1], foc[1], 0.35 * la), fz, yaw, pitch, fitDist(mob ? 33 : 36, F, px), F, W * 0.5, H * (mob ? 0.55 : 0.53));
      r.begin();
      var ext = grow(X.out, 26);
      r.flat(ext, -0.01, rgba(T.ground, 1));
      r.ground(X.out, X.inner);
      /* 맥락 블록 — 흰 모형 */
      var items = [];
      X.ctx.forEach(function (b) { items.push({ d: r.depth(b.c[0], b.c[1], b.h / 2), f: function () { r.shadow(b.F, b.h, 0.8); r.prism(b.F, 0, b.h, { floors: Math.round(b.h / 1), floorC: "rgba(19,40,75,.08)" }); } }); });
      items.sort(function (a, b) { return b.d - a.d; }).forEach(function (it) { it.f(); });
      /* 사업지 — 필지 */
      X.parcels.forEach(function (P) { r.flat(P, 0.02, rgba(T.parcel, 1), T.pLine, 0.7); });
      /* 용도지역 레이어 — 필지 위에 두 구역 색 */
      var A1 = lay === 1 ? la : 0;
      if (A1 > 0) { r.flat(X.zA, 0.03, rgba(T.zoneA, 0.85 * A1), null); r.flat(X.zB, 0.03, rgba(T.zoneB, 0.85 * A1), null); X.parcels.forEach(function (P) { r.flat(P, 0.035, null, rgba(T.navy, 0.18 * A1), 0.6); }); }
      /* 도로 레이어 — 접도 도로 띠 · 확폭 예정 띠 */
      var A3 = lay === 3 ? la : 0;
      if (A3 > 0) { r.flat(X.roadSeg, 0.02, rgba(T.gold, 0.32 * A3), T.gLine, 1.2); r.flat(X.widen, 0.04, rgba(T.alert, 0.12 * A3), rgba(T.alert, 0.8 * A3), 1, [5, 4]); }
      /* 건물 — 등장(inn)에 맞춰 솟는다 */
      var objs = [];
      X.houses.forEach(function (hs, i) { objs.push({ d: r.depth(hs.c[0], hs.c[1], 1), f: function () { var a = seg(inn, (i % 9) * 0.05, 0.45 + (i % 9) * 0.05); r.shadow(rect(hs.c[0], hs.c[1], hs.w, hs.d, hs.ang), (hs.h + hs.rh) * a, a); r.house(hs, a); } }); });
      X.bld.forEach(function (b) {
        objs.push({ d: r.depth(b.c[0], b.c[1], 2), f: function () {
          var a = seg(inn, b.d, b.d + 0.55), h = b.fl * b.fh * a;
          r.shadow(b.F, h, a);
          if (h > 0.02) r.prism(b.F, 0, h, { floors: Math.max(1, Math.round(b.fl * a)), floorC: "rgba(19,40,75,.22)", wall: [200, 194, 184], wallLit: [238, 234, 226] });
        } });
      });
      X.trees.forEach(function (t2) { objs.push({ d: r.depth(t2[0], t2[1], 1), f: function () { r.tree(t2[0], t2[1], 0.9, inn); } }); });
      objs.sort(function (a, b) { return b.d - a.d; }).forEach(function (o) { o.f(); });
      /* 구역 경계 레이어 */
      var A0 = lay === 0 ? la : 0;
      r.flat(X.B, 0.06, A0 > 0 ? rgba(T.gold, 0.08 * A0) : null, A0 > 0 ? rgba(T.gold, 0.6 + 0.4 * A0) : "rgba(19,40,75,.55)", A0 > 0 ? 2.4 : 1.4, A0 > 0 ? [9, 5] : null);
      /* 높이 기준 레이어 — 기준면 + 계획 매스의 범위(점선) */
      var A2 = lay === 2 ? la : 0;
      if (A2 > 0) {
        var Hh = X.S.H * A2;
        X.planned.forEach(function (P) { r.flat(P, 0.05, null, rgba(T.navy, 0.5 * A2), 1, [4, 4]); P.forEach(function (pt) { r.line([[pt[0], pt[1], 0], [pt[0], pt[1], Hh]], rgba(T.navy, 0.35 * A2), 0.8, [3, 4]); }); r.flat(P, Hh, rgba(T.navy, 0.04 * A2), rgba(T.navy, 0.45 * A2), 0.8, [4, 4]); });
        r.flat(X.B, Hh, rgba(T.plane, 0.1 * A2), rgba(T.plane, 0.6 * A2), 1.2);
        X.B.forEach(function (pt) { r.line([[pt[0], pt[1], 0.06], [pt[0], pt[1], Hh]], rgba(T.plane, 0.3 * A2), 0.8); });
      }
      /* 레이어 이름 · 검토 후보 */
      var flag = X.S.flag, P0 = X.B[1], tip;
      if (lay === 0) tip = [X.B[X.B.length - 1][0], X.B[X.B.length - 1][1], 0.1];
      else if (lay === 1) tip = (function () { var c2 = cen(X.zB); return [c2[0], c2[1], 0.1]; })();
      else if (lay === 2) tip = [P0[0], P0[1], X.S.H];
      else if (lay === 3) tip = [X.edgeMid[0], X.edgeMid[1], 0.1];
      if (tip) {
        var hot = lay === flag;
        r.label(tip[0], tip[1], tip[2], LAYER_KO[lay] + (lay === 2 ? " — 기준면(가상)" : lay === 1 ? " — 두 구역(가상)" : lay === 3 ? " — 확폭 예정 띠(가상)" : " — 고시 범위(가상)"),
          { k: hot ? "변경 감지 · 검토 후보" : "변경 감지 없음", kc: hot ? rgba(T.alert, 1) : T.soft, dx: mob ? -8 : -20, dy: mob ? -40 : -54, align: "right", a: la, size: mob ? 11 : 12.5, bd: hot ? rgba(T.alert, 0.7) : null });
        if (hot) r.pin(tip[0], tip[1], tip[2], 2.6, s.req ? T.gold : T.alert, la);
      }
      r.label(X.B[0][0], X.B[0][1], 0.1, "가상 사업지 " + X.S.key, { dx: mob ? 4 : -6, dy: mob ? 32 : 40, align: mob ? "left" : "right", a: 1, size: mob ? 11.5 : 13, w: 750 });
    },
  };

  /* ================================================================ build — 03 공사도급계약 변경(12층 → 15층)
   * s: 변경 전(0) ↔ 변경 후(1). 층이 늘면 늘어난 층(13–15층)은 금색 유리, 변경 후 범위는 점선 외곽으로 미리 보인다.
   * hl: 지금 보는 조항 — scope(공사 범위) · cost(공사비) · progress(기성 지급 — 바뀌지 않음) · design(설계 변경 비용 부담) · delay(지체상금)
   * 금액 · 증액률 · 책임 크기는 그리지 않는다(계산하지 않는다) */
  SCENES.build = {
    theme: "ivory",
    build: function (mob) {
      var site = ccw([[-17, -13], [18.5, -13], [18.5, 4], [12, 12.5], [-14, 11], [-17.5, 2]]);
      var g = rng(91), ctx = [];
      [[-6, 24, 12, 9, 6], [10, 23, 9, 10, 9], [-31, 4, 12, 10, 4], [-31, -9, 10, 7, 7], [-20, -31, 14, 9, 3], [1, -32, 12, 10, 10], [17, -30, 8, 9, 5], [35, -6, 10, 14, 8], [35, 12, 10, 9, 4], [34, -30, 9, 9, 6], [-31, 22, 11, 9, 5], [30, 28, 10, 9, 7]].forEach(function (b) {
        if (mob && Math.abs(b[0]) > 32) return;
        ctx.push({ F: rect(b[0], b[1], b[2], b[3], (g() - 0.5) * 0.06), h: b[4], c: [b[0], b[1]] });
      });
      var trees = [];
      for (var i = 0; i < 7; i++) trees.push([-14 + i * 4.6, -11.2]);
      for (var j = 0; j < 4; j++) trees.push([16.6, -7 + j * 3.6]);
      return {
        mob: mob, site: site, ctx: ctx, trees: trees,
        roads: [ccw([[-48, -21], [48, -21], [48, -14.6], [-48, -14.6]]), ccw([[20.2, -48], [26.4, -48], [26.4, 48], [20.2, 48]])],
        podium: rect(0, -2, 24, 14, 0), tower: rect(2, -1, 12, 9, 0), canopy: rect(-2, -10.1, 9, 2.4, 0),
        ph: rect(3.4, -0.6, 5, 3.6, 0), units: [rect(-1.8, 1.6, 1.4, 1.1, 0), rect(-1.8, -2.6, 1.4, 1.1, 0), rect(6.6, 2.2, 1.2, 1.2, 0)],
        flag: [-2, -10.4],
      };
    },
    draw: function (r, M, s) {
      var T = r.T, W = r.w, H = r.h, mob = M.mob, sv = clamp(s.s || 0, 0, 1), hl = s.hl || "", inn = s.inn == null ? 1 : s.inn;
      var floors = 12 + 3 * sv, PZ = 4.5, fh = 1, topZ = PZ + floors * fh;
      var F = Math.max(W, H) * 1.25, px = Math.min(W * (mob ? 1.0 : 0.82), H * 1.35);
      /* 폰은 카메라를 고정한다(좁은 화면에서 시점이 흔들리면 오히려 읽기 어렵다) */
      var foc = mob ? [2, -1, 8.5 + 1.5 * sv] : hl === "delay" ? [-2, -9, 2] : hl === "progress" ? [0, -2, 3] : [2, -1, 8 + 2.4 * sv];
      r.cam(foc[0], foc[1], foc[2], -36 + 7 * sv + (hl === "delay" && !mob ? -6 : 0), mob ? 27 : 26, fitDist(mob ? 37.5 : 35, F, px), F, W * (mob ? 0.5 : 0.48), H * (mob ? 0.56 : 0.58));
      r.begin();
      r.flat(rect(0, 0, 140, 140, 0), -0.01, rgba(T.ground, 1));
      M.roads.forEach(function (R) { r.flat(R, 0, rgba(T.road, 1), T.curb, 1); });
      r.line([[-48, -17.8], [19, -17.8]], T.roadMark, 1, [7, 8]); r.line([[23.3, -48], [23.3, 48]], T.roadMark, 1, [7, 8]);
      for (var zc = 0; zc < 6; zc++) { var zx = 21 + zc * 1; r.flat(rect(zx, -12.2, 0.5, 2.4, 0), 0.004, "rgba(255,255,255,.75)"); } /* 횡단보도 */
      var dly = hl === "delay";
      r.flat(M.site, 0.01, rgba(T.parcel, 1), dly ? T.gLine : T.pLine, dly ? 2 : 1, dly ? [8, 5] : null);
      /* 포장 격자 — 대지 안만 */
      var x = r.x; x.save(); r.path(M.site, 0.012); x.clip();
      for (var gx = -18; gx <= 19; gx += 2.2) r.line([[gx, -14], [gx, 13]], "rgba(19,40,75,.05)", 0.6);
      for (var gy = -14; gy <= 13; gy += 2.2) r.line([[-18, gy], [19, gy]], "rgba(19,40,75,.05)", 0.6);
      x.restore();
      /* 맥락 · 나무 · 본 건물을 깊이순으로 */
      var objs = [];
      M.ctx.forEach(function (b) { objs.push({ d: r.depth(b.c[0], b.c[1], b.h / 2), f: function () { r.shadow(b.F, b.h, 0.9); r.prism(b.F, 0, b.h, { floors: b.h, floorC: "rgba(19,40,75,.07)" }); } }); });
      M.trees.forEach(function (t) { objs.push({ d: r.depth(t[0], t[1], 1), f: function () { r.tree(t[0], t[1], 0.95, 1); } }); });
      objs.push({ d: r.depth(1, -2, 6) + 0.001, main: true, f: function () {
        r.shadow(M.podium, PZ, 1.1); r.shadow(M.tower, topZ, 1.1);
        /* 포디움 — 상가 3개 층(높은 유리) */
        r.facade(M.podium, 0, 3, 1.5, { span: 3, glazeB: 0.08, glazeT: 0.16, wall: [52, 58, 68], wallLit: [96, 102, 112], glass: [40, 56, 82], glassLit: [150, 168, 192], hl: hl === "progress" ? function () { return false; } : null });
        if (hl === "cost") r.flat(M.podium, PZ + 0.03, null, T.gLine, 1.6, [6, 4]);
        /* 캐노피 */
        r.prism(M.canopy, 1.55, 1.75, { roofC: [236, 232, 224], wall: [180, 176, 168], wallLit: [220, 216, 208], ao: false, line: "rgba(14,26,46,.4)" });
        /* 타워 — 늘어난 층(12층 이후)은 금색 */
        r.facade(M.tower, PZ, floors * inn, fh, { span: 2, hl: function (f) { return f >= 12 && (hl !== "progress"); } });
        /* 옥탑 · 설비 */
        r.prism(M.ph, topZ, topZ + 1.6, { wall: [70, 78, 92], wallLit: [130, 138, 150], roofC: [196, 196, 196], ao: false, line: "rgba(14,26,46,.45)" });
        M.units.forEach(function (U) { r.prism(U, topZ, topZ + 0.7, { wall: [150, 152, 156], wallLit: [214, 216, 218], roofC: [228, 229, 230], ao: false }); });
        /* 변경 후 범위 — 아직 올라가지 않은 층을 점선 외곽으로 */
        if (sv < 0.999) {
          var Z15 = PZ + 15 * fh, ga = 0.85 * (1 - sv * 0.6);
          M.tower.forEach(function (p) { r.line([[p[0], p[1], topZ], [p[0], p[1], Z15]], rgba(T.gold, ga), 1.1, [4, 4]); });
          r.flat(M.tower, Z15, rgba(T.gold, 0.05), rgba(T.gold, ga), 1.1, [4, 4]);
        }
        if (hl === "cost") { r.flat(M.tower, topZ + 0.02, null, T.gLine, 1.6, [6, 4]); M.tower.forEach(function (p) { r.line([[p[0], p[1], PZ], [p[0], p[1], topZ]], T.gLine, 1.2, [6, 4]); }); }
      } });
      objs.sort(function (a, b) { return b.d - a.d; }).forEach(function (o) { o.f(); });
      /* 지시선 — 지금 보는 조항이 건물의 어디에 걸리는지 */
      var T0 = M.tower[1], T2 = M.tower[2], mobS = mob ? 10.5 : 12;
      r.label(T2[0], T2[1], topZ, sv > 0.5 ? "변경 후 · 지상 15층 (가상)" : "변경 전 · 지상 12층 (가상)", { k: "VERSION · 층수", dx: mob ? 14 : 30, dy: mob ? -26 : -34, size: mob ? 11 : 12.5, w: 750 });
      if ((hl === "scope" || hl === "design" || !hl) && sv > 0.02) {
        var zm = PZ + 12 + (floors - 12) / 2;
        r.label(T0[0], T0[1], zm, hl === "design" ? "설계 변경분 — 비용 부담 주체 변경" : "증가 범위 — 13~15층", { k: hl === "design" ? "제8조 책임" : "제2조 공사 범위", kc: rgba(T.gold, 1), dx: mob ? -12 : -40, dy: mob ? -6 : -8, align: "right", size: mobS, col: "rgba(120,86,30,1)", lc: T.gLine, bd: "rgba(150,112,52,.5)" });
      }
      if (hl === "cost") r.label(M.podium[0][0], M.podium[0][1], PZ, "건물 전체 — 도급금액 조정 가능 조항", { k: "제4조 공사비 · 금액 산정 안 함", kc: rgba(T.gold, 1), dx: mob ? -6 : -30, dy: mob ? 34 : 44, align: "right", size: mobS, lc: T.gLine, bd: "rgba(150,112,52,.5)" });
      if (hl === "progress") r.label(M.podium[0][0], M.podium[0][1], 1.5, "기성 지급 — 변경 없음(매월 정산)", { k: "제6조 기성 지급", dx: mob ? -6 : -30, dy: mob ? 30 : 40, align: "right", size: mobS });
      if (dly) { r.pin(M.flag[0], M.flag[1], 0.1, 3.4, T.gold, 1); r.label(M.flag[0], M.flag[1], 3.5, "준공기한 — 지체상금 요율 · 상한 변경", { k: "제10조 지체상금", kc: rgba(T.gold, 1), dx: mob ? -10 : -36, dy: -20, align: "right", size: mobS, lc: T.gLine, bd: "rgba(150,112,52,.5)" }); }
    },
  };

  /* ================================================================ comp — 광명시흥 보상자료: 필지 확인 → 감정평가 자료 → 보상협의 → 재결 (금액 없음 · 개념도) */
  SCENES.comp = {
    theme: "dark",
    build: function (mob) {
      var g = rng(3307), base = ccw([[-19, -14], [17, -16], [21, 3], [14, 15], [-12, 16], [-21, 4]]);
      var parcels = subdivide(base, g, 28, 4).map(function (P) { return { P: P, c: cen(P), h: g() < 0.4 ? 0 : 0.4 + g() * 1.6, foot: inset(P, 0.62) }; });
      var tg = parcels.filter(function (q, i) { return i % 3 === 1; }).slice(0, 5);
      tg.forEach(function (q) { q.tg = true; });
      return { mob: mob, base: base, parcels: parcels, tg: tg, table: rect(27, 2, 6, 3.4, -0.3), dais: rect(29, -9, 5.4, 4, -0.3) };
    },
    draw: function (r, M, s) {
      var T = r.T, W = r.w, H = r.h, k = s.k, F = Math.max(W, H) * 1.3, px = Math.min(W * 0.95, H * 1.35);
      r.cam(W < 520 ? 6 : 6, -1, 1, -30 + 8 * seg(k, 2, 4), 48, fitDist(32, F, px) / 1.05, F, W * 0.5, H * 0.52);
      r.begin();
      r.prism(grow(M.base, 3), -2, 0, { wall: T.ground, wallLit: mix(T.ground, T.parcel, 0.4), roofC: [22, 34, 72], line: "rgba(233,220,192,.10)", ao: false });
      M.parcels.forEach(function (q, i) {
        var on = q.tg ? seg(k, (i % 5) * 0.12, 0.5 + (i % 5) * 0.12) : 0;
        r.flat(q.P, 0.02, rgba(mix(T.parcel, T.gold, on * 0.45), 1), on > 0.3 ? T.gLine : T.pLine, on > 0.3 ? 1.4 : 0.6);
        if (q.h && !q.tg) r.prism(q.foot, 0, q.h, { a: 0.9, ao: false });
      });
      var docA = seg(k, 1, 1.8), mv = seg(k, 2, 2.8), up = seg(k, 3, 3.8), tc = cen(M.table), dc = cen(M.dais);
      r.prism(M.table, 0, 1.2, { roofC: mix(T.roof, T.gold, 0.4 * mv), line: mv > 0.2 ? T.gLine : T.edge, ao: false });
      r.prism(M.dais, 0, 1.2 + 2.4 * up, { roofC: mix(T.roof, T.gold, 0.5 * up), line: up > 0.2 ? T.gLine : T.edge, ao: false });
      M.tg.forEach(function (q, i) {
        var a = seg(docA, i * 0.1, 0.5 + i * 0.1);
        var X = lerp(q.c[0], i === 0 ? dc[0] : tc[0], i === 0 ? up : mv), Y = lerp(q.c[1], i === 0 ? dc[1] : tc[1], i === 0 ? up : mv);
        var Z = lerp(3 + i * 0.4, i === 0 ? 4.2 : 1.5 + i * 0.3, i === 0 ? up : mv);
        r.flat(rect(X, Y, 2.4, 3, 0.4), Z, "rgba(250,247,240," + (0.95 * a).toFixed(2) + ")", "rgba(222,188,120," + a.toFixed(2) + ")", 0.8);
      });
      r.label(M.tg[0].c[0], M.tg[0].c[1], 0.1, "대상 필지 확인", { k: "PARCEL", dx: -10, dy: -36, align: "right", a: seg(k, 0.2, 0.8), size: 11 });
      r.label(tc[0], tc[1], 1.2, "보상협의", { k: "CONSULTATION", dx: M.mob ? -6 : 6, dy: 30, align: M.mob ? "right" : "left", a: seg(k, 2, 2.6), size: 11 });
      r.label(dc[0], dc[1], 3.6, "재결", { k: "ADJUDICATION", dx: M.mob ? -6 : 6, dy: -34, align: M.mob ? "right" : "left", a: seg(k, 3, 3.6), size: 11 });
      r.label(M.tg[1].c[0], M.tg[1].c[1], 3.4, "감정평가 자료", { k: "APPRAISAL", dx: 18, dy: -30, a: docA * (1 - mv), size: 11 });
    },
  };

  /* ---------------------------------------------------------------- 장착
   * 화면에 처음 들어올 때 버퍼를 만들고, 상태가 바뀔 때만 그린다. 전환(tween)이 끝나면 그리기 0회 */
  function mount(canvas, name, opt) {
    opt = opt || {};
    var S = SCENES[name];
    if (!S || !canvas || !canvas.getContext) return null;
    var r = new Rd(canvas, THEME[S.theme || "ivory"]);
    var mob = !!(window.matchMedia && window.matchMedia("(max-width: 760px)").matches);
    var M = S.build(mob, opt);
    var st = { k: 0, s: 0, site: 0, lay: -1, la: 1, inn: 1, hl: "", req: 0 };
    for (var key in (opt.state || {})) st[key] = opt.state[key];
    var tw = {}, raf = 0, vis = false, dead = false, dirty = true, sized = false;
    function measure() {
      if (!vis && !sized) return; /* 화면에 들어오기 전에는 캔버스 버퍼를 만들지 않는다 */
      r.size(mob ? 1.6 : 2); sized = true; dirty = true; req(true);
    }
    function frame(now) {
      raf = 0;
      if (dead) return;
      var busy = false, quiet = calm();
      for (var k in tw) {
        var t = tw[k], u = quiet ? 1 : clamp((now - t.t0) / t.ms, 0, 1);
        st[k] = t.a + (t.b - t.a) * (1 - Math.pow(1 - u, 3));
        if (u >= 1) { delete tw[k]; t.done(); } else busy = true;
      }
      if (!busy && !dirty) return;
      dirty = false;
      if (!sized) return;
      S.draw(r, M, st, now);
      if (busy) req(true);
    }
    function req(force) { if (!raf && !dead && (vis || force)) raf = requestAnimationFrame(frame); }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis = e.isIntersecting; if (vis) { if (!sized) measure(); else if (dirty) req(); } });
    }, { rootMargin: "160px 0px" });
    io.observe(canvas);
    var ro = window.ResizeObserver ? new ResizeObserver(function () { if (sized) measure(); }) : null;
    if (ro) ro.observe(canvas); else window.addEventListener("resize", measure);
    var api = {
      set: function (k, v) { delete tw[k]; st[k] = v; dirty = true; req(true); },
      get: function (k) { return st[k]; },
      tween: function (k, to, ms) {
        return new Promise(function (done) {
          if (tw[k]) tw[k].done();
          if (!vis || calm()) { delete tw[k]; st[k] = to; dirty = true; req(true); done(); return; }
          tw[k] = { a: st[k], b: to, t0: performance.now(), ms: ms || 600, done: done };
          req(true);
        });
      },
      redraw: function () { dirty = true; req(true); },
      destroy: function () { dead = true; io.disconnect(); if (ro) ro.disconnect(); else window.removeEventListener("resize", measure); cancelAnimationFrame(raf); },
    };
    return api;
  }

  window.City = { mount: mount, scenes: SCENES };
})();
