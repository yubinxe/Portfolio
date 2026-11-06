/* city.js — THE LIVING CITY · 건축 모형 렌더러 (Canvas 2D · 의존성 없음 · index.html 전용)
 *
 * 왜 Canvas 2D 인가 (V5 평가 기록)
 *  · 필지는 불규칙 다각형이다. CSS 3D 는 직사각형 면만 다뤄 필지 · 건물 단면을 그대로 그릴 수 없다.
 *  · Three.js 는 조명 품질이 좋지만 이 장면들은 수백 개의 평면 다각형과 도면 선이 중심이다.
 *    작은 투영기 + 화가 알고리즘으로 같은 그림을 수십 분의 일 크기로 그리고, 폰에서 WebGL 컨텍스트를
 *    여러 개 띄우는 위험(컨텍스트 유실 · 메모리)도 없다.
 *  · 매 프레임 CSS 변수를 쓰지 않는다 — 스타일 재계산 0회, 그리기는 캔버스 한 장.
 * 장면 상태는 숫자 몇 개(p 진행도 · o 펼침 · k 단계 · s 비교 · inn 등장)뿐이고 같은 상태는 늘 같은 그림이다
 * (스크롤을 되감으면 그대로 역재생). 화면 밖에서는 그리지 않고, 움직임 줄이기에서는 완성된 정지 화면 한 장만 그린다.
 *
 * 그림 속 필지 · 건물 · 조항은 모두 개념 모형이다 — 실제 지번 · 용도지역 · 보상액 · 계약이 아니다. */
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
  function rgba(c, a) { return "rgba(" + (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0) + "," + (a == null ? 1 : +a.toFixed(3)) + ")"; }

  /* ---------------------------------------------------------------- 다각형 */
  function area(P) { var a = 0; for (var i = 0, n = P.length; i < n; i++) { var p = P[i], q = P[(i + 1) % n]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; }
  function ccw(P) { return area(P) < 0 ? P.slice().reverse() : P; }
  function cen(P) { var x = 0, y = 0; for (var i = 0; i < P.length; i++) { x += P[i][0]; y += P[i][1]; } return [x / P.length, y / P.length]; }
  function inset(P, k) { var c = cen(P); return P.map(function (p) { return [c[0] + (p[0] - c[0]) * k, c[1] + (p[1] - c[1]) * k]; }); }
  function move(P, dx, dy) { return P.map(function (p) { return [p[0] + dx, p[1] + dy]; }); }
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
    return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (k) { var x = k[0] * w / 2, y = k[1] * h / 2; return [cx + x * c - y * s, cy + x * s + y * c]; });
  }
  function ngon(cx, cy, r, n, rot, jit, g) {
    var out = [];
    for (var i = 0; i < n; i++) { var a = rot + (i / n) * Math.PI * 2, rr = r * (1 + (g ? (g() - 0.5) * jit : 0)); out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    return out;
  }
  /* 화면 다각형을 둘레를 따라 n 점으로 — 필지가 화면 사각형으로 바뀌는 변형(morph)에 쓴다 */
  function resample(S, n) {
    var L = [0], i, tot = 0;
    for (i = 0; i < S.length; i++) { var a = S[i], b = S[(i + 1) % S.length]; tot += Math.hypot(b[0] - a[0], b[1] - a[1]); L.push(tot); }
    var out = [], j = 0;
    for (i = 0; i < n; i++) {
      var d = (i / n) * tot;
      while (L[j + 1] < d) j++;
      var a2 = S[j], b2 = S[(j + 1) % S.length], t = (d - L[j]) / ((L[j + 1] - L[j]) || 1);
      out.push([a2[0] + (b2[0] - a2[0]) * t, a2[1] + (b2[1] - a2[1]) * t]);
    }
    return out;
  }
  /* 왼쪽 위 꼭짓점부터 화면 시계 방향으로 맞춘다(사각형과 같은 출발점 · 방향) */
  function orient(S) {
    if (area(S) < 0) S = S.slice().reverse();
    var k = 0, best = Infinity;
    for (var i = 0; i < S.length; i++) { var v = S[i][0] + S[i][1]; if (v < best) { best = v; k = i; } }
    return S.slice(k).concat(S.slice(0, k));
  }

  /* ---------------------------------------------------------------- 색 */
  var THEME = {
    ivory: {
      plTop: [236, 229, 214], plWall: [212, 201, 180], parcel: [248, 244, 236], pLine: "rgba(19,40,75,.42)", road: "rgba(19,40,75,.12)",
      contour: "rgba(115,92,48,.30)", wall: [205, 198, 186], wallLit: [232, 227, 218], roof: [245, 241, 233], edge: "rgba(19,40,75,.30)",
      shadow: [222, 213, 196], gold: [184, 149, 90], gLine: "rgba(150,112,52,.95)", navy: [19, 40, 75], text: "rgba(19,30,62,.92)", soft: "rgba(19,30,62,.58)",
      alert: [180, 84, 58], plane: [19, 40, 75], labelBg: "rgba(247,244,238,.86)",
    },
    dark: {
      plTop: [22, 34, 72], plWall: [11, 18, 42], parcel: [28, 42, 86], pLine: "rgba(233,220,192,.30)", road: "rgba(233,220,192,.10)",
      contour: "rgba(201,168,106,.22)", wall: [46, 62, 110], wallLit: [82, 100, 152], roof: [92, 110, 160], edge: "rgba(233,220,192,.20)",
      shadow: [15, 24, 56], gold: [206, 172, 108], gLine: "rgba(222,188,120,.96)", navy: [233, 220, 192], text: "rgba(246,241,231,.95)", soft: "rgba(246,241,231,.62)",
      alert: [226, 128, 92], plane: [233, 220, 192], labelBg: "rgba(10,21,48,.78)",
    },
  };
  var LX = 0.62, LY = 0.42; /* 빛이 오는 방향(수평) — 그림자는 반대쪽으로 */
  var FONT = "'Pretendard Variable', Pretendard, Inter, system-ui, sans-serif";

  /* ---------------------------------------------------------------- 렌더러 */
  function Rd(canvas, theme) { this.c = canvas; this.x = canvas.getContext("2d"); this.T = theme; this.w = 1; this.h = 1; this.d = 1; this.fade = 1; }
  Rd.prototype.size = function (maxDpr) {
    var r = this.c.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
    var d = Math.min(window.devicePixelRatio || 1, maxDpr), W = Math.round(w * d), H = Math.round(h * d);
    if (this.c.width !== W || this.c.height !== H) { this.c.width = W; this.c.height = H; }
    this.w = w; this.h = h; this.d = d;
  };
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
  Rd.prototype.begin = function () {
    var x = this.x;
    x.setTransform(this.d, 0, 0, this.d, 0, 0);
    x.clearRect(0, 0, this.w, this.h);
    x.lineJoin = "round"; x.lineCap = "round";
  };
  Rd.prototype.path = function (P, z) {
    var x = this.x, q = this.p(P[0][0], P[0][1], z);
    x.beginPath(); x.moveTo(q[0], q[1]);
    for (var i = 1; i < P.length; i++) { q = this.p(P[i][0], P[i][1], z); x.lineTo(q[0], q[1]); }
    x.closePath();
  };
  Rd.prototype.flat = function (P, z, fill, stroke, lw, frac) {
    var x = this.x;
    this.path(P, z);
    if (fill) { x.fillStyle = fill; x.fill(); }
    if (stroke && frac !== 0) {
      x.strokeStyle = stroke; x.lineWidth = lw || 1;
      if (frac != null && frac < 1) { var L = this.perim(P, z); x.setLineDash([L * frac, L + 10]); x.stroke(); x.setLineDash([]); }
      else x.stroke();
    }
  };
  Rd.prototype.perim = function (P, z) {
    var L = 0, a = this.p(P[0][0], P[0][1], z), f = a;
    for (var i = 1; i <= P.length; i++) { var q = i < P.length ? this.p(P[i][0], P[i][1], z) : f; L += Math.hypot(q[0] - a[0], q[1] - a[1]); a = q; }
    return L;
  };
  Rd.prototype.line = function (pts, stroke, lw, frac, dash, off) {
    if (pts.length < 2 || frac === 0) return;
    var x = this.x, S = pts.map(function (p) { return this.p(p[0], p[1], p[2] || 0); }, this), L = 0, i;
    for (i = 1; i < S.length; i++) L += Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]);
    x.beginPath(); x.moveTo(S[0][0], S[0][1]);
    for (i = 1; i < S.length; i++) x.lineTo(S[i][0], S[i][1]);
    x.strokeStyle = stroke; x.lineWidth = lw || 1;
    if (dash) { x.setLineDash(dash); x.lineDashOffset = off || 0; }
    else if (frac != null && frac < 1) x.setLineDash([L * frac, L + 10]);
    x.stroke(); x.setLineDash([]); x.lineDashOffset = 0;
  };
  /* 입체(바닥 다각형을 z0 → z1 로 밀어 올린 것). 뒤쪽 벽은 그리지 않는다(볼록 다각형) */
  Rd.prototype.prism = function (F, z0, z1, o) {
    var x = this.x, T = this.T, n = F.length, i, eye = this.eye, a = o.a == null ? 1 : o.a;
    if (a <= 0.004 || z1 - z0 < 0.01) { if (o.roof !== false && a > 0.004) this.flat(F, z1, rgba(o.roofC || T.roof, a), o.edge === false ? null : (o.line || T.edge), o.lw || 0.7); return; }
    var B = [], U = [];
    for (i = 0; i < n; i++) { B.push(this.p(F[i][0], F[i][1], z0)); U.push(this.p(F[i][0], F[i][1], z1)); }
    var wc = o.wall || T.wall, wl = o.wallLit || T.wallLit;
    for (i = 0; i < n; i++) {
      var p = F[i], q = F[(i + 1) % n], nx = q[1] - p[1], ny = -(q[0] - p[0]);
      if (nx * ((p[0] + q[0]) / 2 - eye[0]) + ny * ((p[1] + q[1]) / 2 - eye[1]) >= 0) continue;
      var L = Math.hypot(nx, ny) || 1, lam = clamp(((nx * LX + ny * LY) / L) * 0.5 + 0.5, 0, 1);
      var j = (i + 1) % n;
      x.beginPath(); x.moveTo(B[i][0], B[i][1]); x.lineTo(B[j][0], B[j][1]); x.lineTo(U[j][0], U[j][1]); x.lineTo(U[i][0], U[i][1]); x.closePath();
      x.fillStyle = rgba(mix(wc, wl, lam), a); x.fill();
      if (o.edge !== false) { x.strokeStyle = o.line || T.edge; x.lineWidth = o.lw || 0.6; x.stroke(); }
    }
    if (o.roof !== false) {
      x.beginPath(); x.moveTo(U[0][0], U[0][1]);
      for (i = 1; i < n; i++) x.lineTo(U[i][0], U[i][1]);
      x.closePath(); x.fillStyle = rgba(o.roofC || T.roof, a); x.fill();
      if (o.edge !== false) { x.strokeStyle = o.line || T.edge; x.lineWidth = o.lw || 0.7; x.stroke(); }
    }
  };
  Rd.prototype.shadow = function (F, h, col) {
    if (h < 0.05) return;
    var k = h * 0.62, sh = F.map(function (p) { return [p[0] - LX * k, p[1] - LY * k]; });
    this.flat(hull(F.concat(sh)), 0.01, col);
  };
  /* 글자 — 모형의 한 점에서 지시선을 끌어 적는다 */
  Rd.prototype.label = function (wx, wy, wz, txt, o) {
    o = o || {};
    var x = this.x, q = this.p(wx, wy, wz), dx = o.dx || 0, dy = o.dy == null ? -26 : o.dy, a = o.a == null ? 1 : o.a;
    if (a <= 0.01) return;
    x.globalAlpha = a;
    if (dx || dy) {
      x.beginPath(); x.moveTo(q[0], q[1]); x.lineTo(q[0] + dx, q[1] + dy);
      x.strokeStyle = o.lc || this.T.soft; x.lineWidth = 0.8; x.stroke();
      x.beginPath(); x.arc(q[0], q[1], 2, 0, 6.283); x.fillStyle = o.lc || this.T.soft; x.fill();
    }
    var tx = q[0] + dx + (o.align === "right" ? -4 : o.align === "center" ? 0 : 4), ty = q[1] + dy;
    x.textAlign = o.align || "left"; x.textBaseline = "middle";
    /* 받침 — 선 · 벽 위에서도 글자가 읽히게(글자 폭만큼만) */
    if (o.bg !== false) {
      var fs = o.size || 12, wT = 0;
      x.font = (o.w || 600) + " " + fs + "px " + FONT; wT = x.measureText(txt).width;
      if (o.k) { x.font = "600 " + (o.ks || 9.5) + "px Inter, " + FONT; wT = Math.max(wT, x.measureText(o.k).width); }
      var bx = o.align === "right" ? tx - wT - 4 : o.align === "center" ? tx - wT / 2 - 4 : tx - 4, top = ty - fs * 0.75 - (o.k ? fs * 0.95 : 0);
      x.fillStyle = this.T.labelBg; x.fillRect(bx, top, wT + 8, (o.k ? fs * 0.95 : 0) + fs * 1.5);
    }
    if (o.k) { x.font = "600 " + (o.ks || 9.5) + "px Inter, " + FONT; x.fillStyle = o.kc || this.T.soft; x.fillText(o.k, tx, ty - (o.size || 12) * 0.95); }
    x.font = (o.w || 600) + " " + (o.size || 12) + "px " + FONT; x.fillStyle = o.col || this.T.text; x.fillText(txt, tx, ty);
    x.globalAlpha = 1;
  };
  Rd.prototype.pin = function (wx, wy, wz, h, col, a) {
    if (a <= 0.01) return;
    var x = this.x, b = this.p(wx, wy, wz), t = this.p(wx, wy, wz + h);
    x.globalAlpha = a;
    x.beginPath(); x.moveTo(b[0], b[1]); x.lineTo(t[0], t[1]); x.strokeStyle = rgba(col, 1); x.lineWidth = 1.2; x.stroke();
    x.beginPath(); x.arc(t[0], t[1], 4.2, 0, 6.283); x.fillStyle = rgba(col, 1); x.fill();
    x.beginPath(); x.arc(t[0], t[1], 1.6, 0, 6.283); x.fillStyle = "#fff"; x.fill();
    x.globalAlpha = 1;
  };

  /* ---------------------------------------------------------------- 도시 생성(필지 → 건물) */
  function district(seed, o) {
    var g = rng(seed), N = o.n, cell = o.cell, road = o.road || 3.2, half = (N * cell) / 2, rot = o.rot || 0;
    var cr = Math.cos(rot), sr = Math.sin(rot);
    var tf = function (p) { return [p[0] * cr - p[1] * sr + (o.ox || 0), p[0] * sr + p[1] * cr + (o.oy || 0)]; };
    var parcels = [], i, j;
    function split(P, depth) {
      var A = Math.abs(area(P));
      if (A < o.minA || depth >= 3) return [P];
      var bi = 0, bl = 0;
      for (var e = 0; e < P.length; e++) { var a = P[e], b = P[(e + 1) % P.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (l > bl) { bl = l; bi = e; } }
      var a2 = P[bi], b2 = P[(bi + 1) % P.length], ang = Math.atan2(b2[1] - a2[1], b2[0] - a2[0]) + (g() - 0.5) * 0.5;
      var nx = Math.cos(ang), ny = Math.sin(ang), c = cen(P), d = nx * c[0] + ny * c[1] + (g() - 0.5) * 0.3 * bl;
      var L = clipHalf(P, nx, ny, d), R = clipHalf(P, -nx, -ny, -d);
      if (L.length < 3 || R.length < 3 || Math.abs(area(L)) < o.minA * 0.35 || Math.abs(area(R)) < o.minA * 0.35) return [P];
      return split(L, depth + 1).concat(split(R, depth + 1));
    }
    for (i = 0; i < N; i++) for (j = 0; j < N; j++) {
      var x0 = -half + i * cell + road / 2, x1 = x0 + cell - road, y0 = -half + j * cell + road / 2, y1 = y0 + cell - road;
      var mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dd = Math.hypot(mx, my) / half;
      if (o.round && dd > o.round + (g() - 0.5) * 0.36) continue;
      var J = o.jit == null ? 1.4 : o.jit, jt = function () { return (g() - 0.5) * J; };
      var blk = ccw([[x0 + jt(), y0 + jt()], [x1 + jt(), y0 + jt()], [x1 + jt(), y1 + jt()], [x0 + jt(), y1 + jt()]].map(tf));
      split(blk, 0).forEach(function (P) {
        P = ccw(P);
        var c = cen(P), dist = clamp(Math.hypot(c[0] - (o.ox || 0), c[1] - (o.oy || 0)) / half, 0, 1.2);
        var open = g() < (o.open || 0.07);
        var h = (o.hMin || 2.6) + (o.hMax || 22) * Math.pow(clamp(1 - dist, 0, 1), 1.35) * (0.45 + g() * 0.8);
        if (g() < 0.07) h *= 1.55;
        parcels.push({ P: P, c: c, dist: dist, open: open, h: open ? 0 : h, foot: inset(P, 0.6 + g() * 0.22), dl: clamp(dist * 0.55 + g() * 0.16, 0, 0.72) });
      });
    }
    return { parcels: parcels, half: half, g: g, cell: cell, N: N, tf: tf };
  }
  function plinthOf(parcels, m) {
    var pts = [];
    parcels.forEach(function (q) { pts.push.apply(pts, q.P); });
    var H = hull(pts), c = cen(H);
    return ccw(H.map(function (p) { var dx = p[0] - c[0], dy = p[1] - c[1], l = Math.hypot(dx, dy) || 1; return [p[0] + (dx / l) * m, p[1] + (dy / l) * m]; }));
  }
  function contours(g, cx, cy, rings, r0, step) {
    var out = [];
    for (var k = 0; k < rings; k++) {
      var s1 = g() * 6, s2 = g() * 6, r = r0 + k * step, ring = [];
      for (var i = 0; i < 44; i++) { var a = (i / 44) * Math.PI * 2, rr = r * (1 + 0.13 * Math.sin(3 * a + s1) + 0.07 * Math.sin(5 * a + s2)); ring.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.8]); }
      out.push(ring);
    }
    return out;
  }
  function sortFar(r, list, zf) { return list.map(function (b) { var c = b.c || (b.c = cen(b.foot)); return [r.p(c[0], c[1], zf(b)), b]; }).sort(function (a, b) { return b[0][2] - a[0][2]; }).map(function (x) { return x[1]; }); }
  function fitDist(ext, F, px) { return (ext * 1.35 * F) / px; }

  var SCENES = {};

  /* ================================================================ HERO — The Living City
   * p 0–.18 땅: 필지 선이 그려지고 채워진다 · .16–.40 도시가 솟는다(안쪽부터) · .38–.62 한 건물을 층으로 연다
   * .58–.84 토지 · 법령 · 계약 · 가치가 필지 모양의 층으로 겹친다 · .82–1 카메라가 위로 올라 다시 도면이 된다 */
  SCENES.hero = {
    theme: "ivory", rest: 0.3, dpr: 1.75,
    build: function (mob) {
      var D = district(20261106, { n: mob ? 5 : 7, cell: 16, road: 3.4, rot: -0.14, minA: mob ? 64 : 58, round: 1.12, hMax: 21 });
      var ps = D.parcels, feat = null, best = Infinity;
      ps.forEach(function (q) { var d = Math.hypot(q.c[0], q.c[1]) - Math.abs(area(q.P)) * 0.02; if (!q.open && d < best && Math.abs(area(q.P)) > 34) { best = d; feat = q; } });
      feat.feat = true; feat.h = 27; feat.foot = inset(feat.P, 0.72); feat.dl = 0;
      var pl = plinthOf(ps, 6), g = D.g, ext = D.half * 2;
      var net = ps.filter(function (q) { return q !== feat && !q.open && q.dist > 0.35 && q.dist < 0.95; }).filter(function (q, i) { return i % 3 === 0; }).slice(0, mob ? 7 : 11);
      return {
        mob: mob, D: D, ps: ps, feat: feat, pl: pl, ext: ext, net: net,
        cont: contours(g, -D.half * 0.78, D.half * 0.8, 6, 3, 2.6).concat(contours(g, D.half * 0.92, -D.half * 0.55, 5, 2.4, 2.4)),
        layers: [["토지", "Land"], ["법령", "Law"], ["계약", "Contract"], ["가치", "Value"]],
      };
    },
    phase: function (s) { var p = s.p; return p < 0.16 ? 0 : p < 0.38 ? 1 : p < 0.6 ? 2 : p < 0.82 ? 3 : 4; },
    draw: function (r, M, s) {
      var T = r.T, x = r.x, p = s.p, W = r.w, H = r.h, mob = M.mob, f = M.feat;
      var A = seg(p, 0, 0.18), B = seg(p, 0.16, 0.4), C = seg(p, 0.38, 0.62), Dd = seg(p, 0.58, 0.84), E = seg(p, 0.82, 1);
      var tr = s.intro;
      var pitch = lerp(lerp(lerp(lerp(lerp(76, 62, A), 38, B), 24, C), 30, Dd), 86, E);
      var yaw = lerp(-18 - 20 * B - 16 * C - 12 * Dd, -84, E);
      var zoom = lerp(lerp(lerp(1, mob ? 1.32 : 1.42, C), mob ? 1.22 : 1.3, Dd), 0.95, E);
      var fh = lerp(5, f.h, B) * (1 - E) + 0.2, top = fh + 9 * 2.6 * C * (1 - E);
      var fz = (top * 0.42 + 6 * Dd) * C * (1 - E);
      var tx = lerp(0, f.c[0], C * (1 - E)), ty = lerp(0, f.c[1], C * (1 - E));
      var F = mob ? W * 2.3 : H * 1.15, px = mob ? W * 1.06 : Math.min(W * 0.6, H * 1.06);
      var ox = mob ? W * 0.5 : W * lerp(0.66, 0.66, C), oy = mob ? H * lerp(0.6, 0.56, C) : H * lerp(0.54, 0.5, C);
      r.cam(tx, ty, fz, yaw, pitch, fitDist(M.ext, F, px) / zoom, F, ox, oy);
      r.begin();
      var appear = sm(tr * 2.2);
      /* 모형 받침 */
      r.prism(M.pl, -2.8, 0, { wall: T.plWall, wallLit: mix(T.plWall, T.plTop, 0.5), roofC: T.plTop, a: appear, line: "rgba(19,40,75,.18)" });
      x.save(); r.path(M.pl, 0); x.clip();
      for (var c = 0; c < M.cont.length; c++) r.flat(M.cont[c], 0, null, T.contour, 0.8, seg(tr, 0.1 + c * 0.03, 0.6 + c * 0.03));
      x.restore();
      /* 필지 — 선이 먼저 그려지고(첫 방문 1.8초) 스크롤로 채워진다 */
      var fillA = 0.35 + 0.65 * A;
      for (var i = 0; i < M.ps.length; i++) {
        var q = M.ps[i], t = seg(tr, q.dl * 0.6, q.dl * 0.6 + 0.4);
        if (q.feat) continue;
        r.flat(q.P, 0, q.open ? rgba(mix(T.parcel, [214, 222, 196], 0.5), fillA * t) : rgba(T.parcel, fillA * t), T.pLine, 0.7, t);
      }
      /* 그림자 → 건물(먼 것부터) */
      var hf = function (q) { return q.h * seg(B, q.dl, q.dl + 0.5) * (1 - E); };
      var sh = rgba(T.shadow, 0.9 * (1 - Dd * 0.6));
      for (i = 0; i < M.ps.length; i++) { var qq = M.ps[i]; if (!qq.feat && !qq.open) r.shadow(qq.foot, hf(qq), sh); }
      r.shadow(f.foot, fh, sh);
      /* 대상 필지 — 금색 경계 */
      r.flat(f.P, 0.02, rgba(mix(T.parcel, T.gold, 0.16), 0.4 + 0.6 * A), T.gLine, 1.7, seg(tr, 0, 0.4));
      var wire = 1 - 0.78 * Dd;
      var order = sortFar(r, M.ps.filter(function (q) { return !q.open; }), function (q) { return hf(q) / 2; });
      for (i = 0; i < order.length; i++) {
        var b = order[i];
        if (b.feat) {
          /* 층 — 한 덩어리가 층판으로 갈라진다(분해도) */
          var nF = 9, fl = fh / nF, gap = 2.6 * C * (1 - E), th = fl * (1 - 0.3 * C);
          if (C < 0.01) r.prism(f.foot, 0, fh, { roofC: mix(T.roof, T.gold, 0.22), a: appear });
          else for (var k = 0; k < nF; k++) {
            var z0 = k * (fl + gap), hot = k === 6 ? Dd : 0;
            r.prism(f.foot, z0, z0 + th, { roofC: mix(mix(T.roof, T.gold, 0.18 + 0.05 * k), T.gold, hot * 0.6), wall: mix(T.wall, T.gold, 0.12), a: 1, line: k === 6 && C > 0.5 ? T.gLine : T.edge, lw: k === 6 ? 1.1 : 0.6 });
          }
          continue;
        }
        var hh = hf(b);
        if (hh < 0.06) { r.flat(b.foot, 0.02, rgba(T.roof, 0.85 * sm(tr * 1.5)), T.edge, 0.6); continue; }
        r.prism(b.foot, 0, hh, { a: wire, line: Dd > 0.3 ? "rgba(19,40,75," + (0.3 + 0.25 * Dd).toFixed(2) + ")" : T.edge });
      }
      /* 층 · 필지 주석 */
      if (C > 0.02 && Dd < 0.98) {
        var ca = C * (1 - Dd);
        r.label(f.P[0][0], f.P[0][1], 0, "필지 · 불규칙 경계", { k: "PARCEL", dx: mob ? -8 : -36, dy: 34, align: "right", a: ca });
        r.label(f.foot[1][0], f.foot[1][1], top * 0.55, "층판 9장으로 분해", { k: "FLOOR PLATES", dx: mob ? 18 : 46, dy: -18, a: ca });
        r.label(f.foot[2][0], f.foot[2][1], top, "건축물 매스", { k: "MASSING", dx: mob ? 14 : 40, dy: -30, a: ca });
      }
      /* 정보 층 — 필지 모양 그대로 위로 쌓인다 */
      if (Dd > 0.01) {
        for (var L = 0; L < 4; L++) {
          var la = seg(Dd, L * 0.14, L * 0.14 + 0.45), z = lerp(top + 22, top + 3 + L * 4.4, la) * (1 - E) + 0.05;
          var P2 = inset(f.P, 1.18 + L * 0.06);
          r.flat(P2, z, rgba(L === 3 ? T.gold : T.plane, (0.06 + 0.05 * L) * la * (1 - E)), L === 3 ? T.gLine : "rgba(19,40,75,.55)", L === 3 ? 1.4 : 0.9, la);
          r.label(P2[1][0], P2[1][1], z, M.layers[L][0], { k: M.layers[L][1].toUpperCase(), dx: mob ? 10 : 22, dy: -6, a: la * (1 - E) * (mob && L % 2 ? 0 : 1), size: 12 });
        }
        /* 대상 필지와 이웃 필지를 잇는 관계선 */
        for (var nI = 0; nI < M.net.length; nI++) {
          var nq = M.net[nI], na = seg(Dd, 0.2 + nI * 0.04, 0.6 + nI * 0.04) * (1 - E * 0.6);
          var mid = [(nq.c[0] + f.c[0]) / 2, (nq.c[1] + f.c[1]) / 2, 10 + 6 * (nI % 3)];
          r.line([[nq.c[0], nq.c[1], hf(nq)], mid, [f.c[0], f.c[1], top * 0.5]], rgba(T.gold, 0.85), 1, na);
          r.pin(nq.c[0], nq.c[1], hf(nq), 2.5, T.gold, na);
        }
      }
      /* 마지막 — 다시 도면: 금색 경계만 남는다 */
      if (E > 0.01) {
        r.flat(inset(f.P, 1.4), 0.04, null, T.gLine, 2, E);
        for (var e2 = 0; e2 < M.net.length; e2++) r.flat(M.net[e2].P, 0.03, rgba(T.gold, 0.12 * E), T.gLine, 1, E);
      }
    },
  };

  /* ================================================================ 네 가지 제품 — 제품마다 다른 공간
   * 공통: p(화면에 들어오며 0→1)로 솟고, o(0→1)로 '건축 → 소프트웨어' 전환 — 주변이 깊이별로 흩어지고
   * 핵심 면(초점)이 떠올라 실제 화면 사각형으로 바뀐다. 마지막 순간 캔버스 속 사각형 = 극장이 시작하는 자리 */
  function toolBase(seed, o) {
    var g = rng(seed), pl = ccw(ngon(0, 0, o.R, 10, 0.2, 0.16, g).map(function (p) { return [p[0] * 1.25, p[1] * 0.9]; }));
    return { g: g, pl: pl, ext: o.R * 2.4 };
  }
  function toolCam(r, M, s, cfg) {
    var W = r.w, H = r.h, mob = W < 520;
    var lift = sm(s.o);
    var pitch = lerp(lerp(cfg.p0, cfg.p1, s.p), 58, lift * 0.6), yaw = lerp(cfg.y0, cfg.y1, s.p) + (s.hx || 0) * 6;
    var F = Math.max(W, H) * 1.3, px = Math.min(W * 0.92, H * 1.25) * (cfg.fit || 1.22);
    r.cam(0, 0, cfg.tz || 3, yaw, pitch, fitDist(M.ext, F, px) / (1 + lift * 0.12), F, W * 0.5, H * (mob ? 0.55 : 0.54));
  }
  /* 초점 면 → 화면 사각형 */
  function stageRect(r, aspect) {
    var W = r.w, H = r.h, w = W * 0.86, h = w / aspect;
    if (h > H * 0.88) { h = H * 0.88; w = h * aspect; }
    return { x: (W - w) / 2, y: (H - h) / 2, w: w, h: h };
  }
  function morphFocus(r, M, s, F, z) {
    var o = s.o, x = r.x;
    if (o <= 0.001) return;
    var S = F.map(function (p) { return r.p(p[0], p[1], z); }).map(function (q) { return [q[0], q[1]]; });
    var R = stageRect(r, M.aspect), Tq = [[R.x, R.y], [R.x + R.w, R.y], [R.x + R.w, R.y + R.h], [R.x, R.y + R.h]];
    var m = seg(o, 0.25, 1), a = resample(orient(S), 40), b = resample(Tq, 40), i;
    x.beginPath();
    var minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    for (i = 0; i < 40; i++) {
      var X = lerp(a[i][0], b[i][0], m), Y = lerp(a[i][1], b[i][1], m);
      if (i) x.lineTo(X, Y); else x.moveTo(X, Y);
      if (X < minX) minX = X; if (Y < minY) minY = Y; if (X > maxX) maxX = X; if (Y > maxY) maxY = Y;
    }
    x.closePath();
    x.save();
    x.shadowColor = "rgba(10,20,45," + (0.28 * m).toFixed(2) + ")"; x.shadowBlur = 30 * m; x.shadowOffsetY = 14 * m;
    x.fillStyle = rgba(mix(r.T.roof, [255, 255, 255], m), 0.5 + 0.5 * seg(o, 0, 0.3)); x.fill();
    x.restore();
    var img = M.img;
    if (img && img.complete && img.naturalWidth) {
      x.save(); x.clip();
      x.globalAlpha = seg(o, 0.42, 0.95);
      var bw = maxX - minX, bh = maxY - minY, ir = img.naturalWidth / img.naturalHeight, dw = bw, dh = bw / ir;
      if (dh < bh) { dh = bh; dw = bh * ir; }
      x.drawImage(img, minX + (bw - dw) / 2, minY, dw, dh);
      x.restore(); x.globalAlpha = 1;
    }
    x.strokeStyle = r.T.gLine; x.lineWidth = lerp(1.6, 1, m); x.stroke();
  }
  function sink(s, i) { var o = sm(s.o); return { dz: -o * (4 + (i % 4) * 2.5), a: 1 - 0.82 * o }; }

  /* 집캐치 — 지도 위 필지에서 아파트 단지가 솟고, 위치 표시가 꽂힌다 */
  SCENES["tool-09"] = {
    theme: "ivory",
    build: function (mob) {
      var B = toolBase(909, { R: 22 }), g = B.g, slabs = [], i, j;
      var site = ccw([[-15, -9], [3, -12], [16, -6], [14, 9], [-2, 12], [-16, 6]]);
      for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) slabs.push({ foot: rect(-8.5 + i * 8.6 + j * 0.9, -6 + j * 6.4 - i * 0.8, 6.6, 1.9, 0.24), h: 9 + g() * 9, d: (i + j) * 0.08 });
      var ctx = [];
      for (i = 0; i < 9; i++) { var a = (i / 9) * Math.PI * 2 + 0.3, rr = 21 + g() * 3; ctx.push({ foot: ccw(rect(Math.cos(a) * rr * 1.1, Math.sin(a) * rr * 0.72, 3 + g() * 2, 3 + g() * 2, a)), h: 1.5 + g() * 3, d: 0.3 + g() * 0.2 }); }
      var roads = [[[-28, -2], [-10, -15], [10, -16], [29, -4]], [[-26, 13], [-6, 16], [12, 15], [28, 8]], [[-4, -19], [-1, 0], [2, 19]]];
      return { pl: B.pl, ext: B.ext, site: site, slabs: slabs, ctx: ctx, roads: roads, pins: [0, 4, 5, 8], aspect: mob ? 600 / 1298 : 1.6 };
    },
    focus: function (M) { return M.site; },
    draw: function (r, M, s) {
      var T = r.T, rise = seg(s.p, 0.05, 0.62), o = sm(s.o), i;
      toolCam(r, M, s, { p0: 64, p1: 40, y0: -18, y1: -42 });
      r.begin();
      r.prism(M.pl, -2.2, 0, { wall: T.plWall, wallLit: mix(T.plWall, T.plTop, 0.5), roofC: T.plTop, a: 1 - 0.5 * o, line: "rgba(19,40,75,.14)" });
      M.roads.forEach(function (rd) { r.line(rd.map(function (p) { return [p[0], p[1], 0.02]; }), "rgba(19,40,75," + (0.3 * (1 - o)).toFixed(2) + ")", 3.2); });
      r.flat(M.site, 0.03, rgba(mix(T.parcel, T.gold, 0.12), 0.9 * (1 - o)), T.gLine, 1.6, seg(s.p, 0, 0.3));
      M.ctx.forEach(function (b, k) { var S = sink(s, k), h = b.h * seg(rise, b.d, b.d + 0.4); r.shadow(b.foot, h, rgba(T.shadow, 0.8 * S.a)); r.prism(b.foot, S.dz, S.dz + h, { a: S.a }); });
      var list = M.slabs.map(function (b, k) { return { b: b, k: k, c: cen(b.foot) }; });
      list = sortFar(r, list, function () { return 6; });
      list.forEach(function (it) { var b = it.b, S = sink(s, it.k), h = b.h * seg(rise, b.d, b.d + 0.55); r.shadow(b.foot, h, rgba(T.shadow, 0.8 * S.a)); r.prism(b.foot, S.dz, S.dz + h, { a: S.a, roofC: mix(T.roof, T.gold, 0.08) }); });
      M.pins.forEach(function (k, j) { var c = cen(M.slabs[k].foot), h = M.slabs[k].h * rise; r.pin(c[0], c[1], h + 0.2, 4, j === 0 ? T.gold : T.navy, seg(s.p, 0.5 + j * 0.07, 0.7 + j * 0.07) * (1 - o)); });
      morphFocus(r, M, s, M.site, 1 + o * 8);
    },
  };

  /* 법조시장 한눈에 — 개발 대상지 위로 입법 · 규제 정보가 필지 모양 층으로 내려앉고, 문서가 흘러든다 */
  SCENES["tool-16"] = {
    theme: "ivory", live: true,
    build: function (mob) {
      var D = district(1616, { n: 3, cell: 13, road: 3, rot: 0.32, minA: 38, hMax: 9, hMin: 2, jit: 1.2 });
      var site = null, best = 1e9;
      D.parcels.forEach(function (q) { var d = Math.hypot(q.c[0], q.c[1]); if (d < best) { best = d; site = q; } });
      site.open = true; site.h = 0;
      return { D: D, pl: plinthOf(D.parcels, 4), ext: D.half * 2.6, site: site, aspect: mob ? 600 / 1298 : 1.6,
        layers: ["발의 법률안", "시행 예정 법령", "판례", "변호사 현황"], src: [[-30, -6], [-22, -10], [-12, -6], [-5, -2]] };
    },
    focus: function (M) { return inset(M.site.P, 1.2); },
    draw: function (r, M, s, now) {
      var T = r.T, rise = seg(s.p, 0.05, 0.55), o = sm(s.o), i;
      toolCam(r, M, s, { p0: 60, p1: 38, y0: 26, y1: 6 });
      r.begin();
      r.prism(M.pl, -2.2, 0, { wall: T.plWall, wallLit: mix(T.plWall, T.plTop, 0.5), roofC: T.plTop, a: 1 - 0.5 * o, line: "rgba(19,40,75,.14)" });
      M.D.parcels.forEach(function (q) { r.flat(q.P, 0.01, rgba(T.parcel, 0.95 * (1 - o)), T.pLine, 0.6); });
      var bs = sortFar(r, M.D.parcels.filter(function (q) { return !q.open; }), function (q) { return q.h / 2; });
      bs.forEach(function (q, k) { var S = sink(s, k), h = q.h * seg(rise, q.dl, q.dl + 0.5); r.shadow(q.foot, h, rgba(T.shadow, 0.8 * S.a)); r.prism(q.foot, S.dz, S.dz + h, { a: S.a }); });
      r.flat(M.site.P, 0.03, rgba(mix(T.parcel, T.gold, 0.15), 1 - o), T.gLine, 1.6);
      for (i = 0; i < 4; i++) {
        var la = seg(s.p, 0.3 + i * 0.1, 0.62 + i * 0.1), z = lerp(30, 3 + i * 5.2, la) + o * (2 + i * 3), P = inset(M.site.P, 1.2);
        if (i === 3) continue;
        r.flat(P, z, rgba(T.plane, (0.05 + 0.04 * i) * la * (1 - o)), "rgba(19,40,75," + (0.5 * la * (1 - o)).toFixed(2) + ")", 0.9);
        r.label(P[i % 2 ? 3 : 1][0], P[i % 2 ? 3 : 1][1], z, M.layers[i], { dx: i % 2 ? -16 : 16, dy: -4, align: i % 2 ? "right" : "left", a: la * (1 - o), size: 11 });
      }
      /* 기관에서 흘러드는 문서 — 보일 때만 움직인다 */
      var t = (now || 0) / 2600;
      for (i = 0; i < 6; i++) {
        var u = (t + i / 6) % 1, a = seg(s.p, 0.35, 0.6) * (1 - o) * Math.sin(u * Math.PI);
        var px = lerp(-30, 0, u), py = lerp(-10 + (i % 3) * 7, 0, u), pz = 4 + 10 * Math.sin(u * Math.PI) * 0.6 + (1 - u) * 6;
        r.flat(rect(px, py, 2.2, 2.9, 0.3 + i), pz, rgba([255, 255, 255], a), "rgba(19,40,75," + (0.5 * a).toFixed(2) + ")", 0.7);
      }
      var top = inset(M.site.P, 1.2), zt = 3 + 3 * 5.2 + o * 8, la3 = seg(s.p, 0.6, 0.92);
      if (o < 0.01) { r.flat(top, zt, rgba(T.gold, 0.12 * la3), T.gLine, 1.3, la3); r.label(top[1][0], top[1][1], zt, M.layers[3], { dx: 16, dy: -4, a: la3, size: 11, col: "rgba(115,92,48,1)" }); }
      morphFocus(r, M, s, top, zt);
    },
  };

  /* Atelier AX — 사무실 평면 위 네 역할(기획 · 디자인 · 개발 · 검수)과 승인 책상, 그 사이를 흐르는 업무 */
  SCENES["tool-17"] = {
    theme: "ivory", live: true,
    build: function (mob) {
      var g = rng(1717), plate = ccw([[-20, -12], [10, -15], [21, -6], [19, 11], [-4, 14], [-21, 8]]);
      var zones = [[-12, -5, "기획"], [-11, 6, "디자인"], [3, 8, "개발"], [6, -7, "검수"]], desks = [];
      zones.forEach(function (z, zi) { for (var k = 0; k < 3; k++) desks.push({ foot: rect(z[0] + (k - 1) * 3.4, z[1] + (k % 2) * 1.6, 2.4, 1.3, 0.12), h: 1.1, z: zi }); });
      var walls = [rect(-4, 0, 0.5, 20, 0.12), rect(-8, 0.6, 22, 0.5, 0.06), rect(10, 1, 0.5, 14, 0.12)];
      return { plate: plate, zones: zones, desks: desks, walls: walls, appr: rect(15, 2, 4.2, 2.6, 0.12), ext: 50, aspect: mob ? 600 / 1298 : 1.6,
        pl: ccw(inset(plate, 1.18)) };
    },
    focus: function (M) { return M.plate; },
    draw: function (r, M, s, now) {
      var T = r.T, rise = seg(s.p, 0.05, 0.6), o = sm(s.o), i, S;
      toolCam(r, M, s, { p0: 66, p1: 46, y0: -30, y1: -14, tz: 1 });
      r.begin();
      r.prism(M.pl, -2.2, 0, { wall: T.plWall, wallLit: mix(T.plWall, T.plTop, 0.5), roofC: T.plTop, a: 1 - 0.5 * o, line: "rgba(19,40,75,.14)" });
      var pz = 1.2 * rise;
      r.shadow(M.plate, pz + 0.6, rgba(T.shadow, 0.9 * (1 - o)));
      r.prism(M.plate, 0, pz, { roofC: T.parcel, a: 1 - o * 0.2 });
      M.walls.forEach(function (w, k) { S = sink(s, k); r.prism(w, pz + S.dz, pz + S.dz + 2 * seg(rise, 0.3, 0.8), { a: S.a, roofC: T.wall }); });
      var dl = sortFar(r, M.desks, function () { return 1; });
      dl.forEach(function (d, k) { S = sink(s, k); var h = d.h * seg(rise, 0.25 + d.z * 0.08, 0.6 + d.z * 0.08); r.prism(d.foot, pz + S.dz, pz + S.dz + h, { a: S.a, roofC: [255, 255, 255] }); });
      S = sink(s, 2);
      r.prism(M.appr, pz + S.dz, pz + S.dz + 1.6 * seg(rise, 0.5, 0.9), { a: S.a, roofC: mix(T.roof, T.gold, 0.5), wall: mix(T.wall, T.gold, 0.3), line: T.gLine });
      var fa = seg(s.p, 0.45, 0.8) * (1 - o);
      var path = M.zones.map(function (z) { return [z[0], z[1], pz + 2.4]; }).concat([[15, 2, pz + 2.6]]);
      r.line(path, rgba(T.gold, 0.35 * fa), 2);
      r.line(path, rgba(T.gold, fa), 2, null, [6, 10], -((now || 0) / 40) % 16);
      M.zones.forEach(function (z, k) { r.label(z[0], z[1], pz + 2.2, z[2], { dx: 0, dy: k === 3 ? 34 : -22, align: "center", a: fa, size: 11.5, k: ["PLAN", "DESIGN", "BUILD", "REVIEW"][k] }); });
      r.label(15, 2, pz + 1.8, "승인 · 사람이 확정", { k: "APPROVAL", dx: 0, dy: -36, align: "center", a: fa, size: 11.5, col: "rgba(115,92,48,1)" });
      morphFocus(r, M, s, M.plate, pz + o * 7);
    },
  };

  /* 국정 한눈에 — 낮은 정보 지형 위에서 정책 · 국회 · 경제 · 시장 네 갈래가 한 판으로 모인다 */
  SCENES["tool-12"] = {
    theme: "ivory",
    build: function (mob) {
      var g = rng(1212), tiles = [], nx = mob ? 7 : 9, ny = mob ? 5 : 6, i, j, sz = 4.6;
      for (i = 0; i < nx; i++) for (j = 0; j < ny; j++) {
        var cx = (i - (nx - 1) / 2) * sz, cy = (j - (ny - 1) / 2) * sz, d = Math.hypot(cx / (nx * sz / 2), cy / (ny * sz / 2));
        if (d > 1.08 + (g() - 0.5) * 0.3) continue;
        tiles.push({ foot: ccw(rect(cx + (g() - 0.5) * 0.4, cy + (g() - 0.5) * 0.4, sz * 0.82, sz * 0.82, (g() - 0.5) * 0.08)), h: 0.3 + g() * 1.5, d: d * 0.5, c: [cx, cy] });
      }
      var tw = [[-12, -7, "정책", "POLICY"], [-10, 7, "국회", "ASSEMBLY"], [11, -6, "경제", "ECONOMY"], [12, 7, "시장", "MARKETS"]];
      if (mob) tw = tw.map(function (t) { return [t[0] * 0.8, t[1] * 0.85, t[2], t[3]]; });
      return { tiles: tiles, tw: tw, hub: ccw(ngon(0, 0, 5.4, 12, 0, 0)), ext: nx * sz * 1.1, aspect: mob ? 600 / 1298 : 1.6,
        pl: ccw(ngon(0, 0, nx * sz * 0.62, 14, 0.1, 0.06, g).map(function (p) { return [p[0], p[1] * (ny / nx) * 1.15]; })) };
    },
    focus: function (M) { return M.hub; },
    draw: function (r, M, s) {
      var T = r.T, rise = seg(s.p, 0.05, 0.55), o = sm(s.o), i;
      toolCam(r, M, s, { p0: 58, p1: 40, y0: 12, y1: -10, tz: 2 });
      r.begin();
      r.prism(M.pl, -2, 0, { wall: T.plWall, wallLit: mix(T.plWall, T.plTop, 0.5), roofC: T.plTop, a: 1 - 0.5 * o, line: "rgba(19,40,75,.14)" });
      var tl = sortFar(r, M.tiles, function (q) { return q.h; });
      tl.forEach(function (q, k) { var S = sink(s, k), h = q.h * seg(rise, q.d, q.d + 0.5); r.prism(q.foot, S.dz, S.dz + h, { a: S.a, roofC: mix(T.parcel, T.plTop, (k % 5) / 5) }); });
      var ca = seg(s.p, 0.4, 0.85) * (1 - o);
      M.tw.forEach(function (t, k) {
        var h = (7 + k * 1.6) * seg(rise, 0.25 + k * 0.08, 0.7 + k * 0.08), S = sink(s, k + 1), f = rect(t[0], t[1], 2.6, 2.6, 0.2);
        r.shadow(f, h, rgba(T.shadow, 0.8 * S.a));
        r.prism(f, 1.5 + S.dz, 1.5 + S.dz + h, { a: S.a, roofC: mix(T.roof, T.gold, 0.25), wall: mix(T.wall, T.navy, 0.18) });
        r.line([[t[0], t[1], 1.5 + h], [t[0] * 0.5, t[1] * 0.5, 9], [0, 0, 6]], rgba(T.gold, 0.9), 1.2, ca);
        r.label(t[0], t[1], 1.5 + h, t[2], { k: t[3], dx: t[0] < 0 ? -10 : 10, dy: -14, align: t[0] < 0 ? "right" : "left", a: seg(s.p, 0.45, 0.8) * (1 - o), size: 11.5 });
      });
      var hz = 6 + o * 6;
      if (o < 0.01) r.flat(M.hub, hz, rgba(T.gold, 0.16 * ca), T.gLine, 1.4, ca);
      morphFocus(r, M, s, M.hub, hz);
    },
  };

  /* ================================================================ AX INTELLIGENCE COMMAND (어두운 판)
   * sys 0 RE:INTELLIGENCE · 1 Assembly Risk Engine · 2 Contract Risk Intelligence — k(0→4) 단계, s(0→1) 계약 비교
   * 모든 사업지 · 조합원 · 조항은 가상 시연이다 */
  SCENES.ax = {
    theme: "dark",
    build: function (mob) {
      var D = district(4242, { n: mob ? 3 : 4, cell: 13, road: 3, rot: 0.2, minA: 40, hMax: 10, hMin: 2, jit: 1.1, ox: -3 });
      var cand = D.parcels.filter(function (q) { return !q.open && q.dist < 0.75; });
      var sites = [cand[1], cand[Math.floor(cand.length / 2)], cand[cand.length - 2]].filter(Boolean);
      sites.forEach(function (q) { q.site = true; q.h = 0; });
      var g = rng(77), seats = [], rows = mob ? 3 : 4;
      for (var rI = 0; rI < rows; rI++) {
        var rad = 8 + rI * 3.2, n = 9 + rI * 3;
        for (var k = 0; k < n; k++) { var a = (200 + (k / (n - 1)) * 140) * D2R; seats.push({ foot: rect(Math.cos(a) * rad, Math.sin(a) * rad + 6, 1.3, 1.3, a), h: 0.7 + rI * 0.35, flag: rI === 1 && (k === 3 || k === 4) || rI === 2 && k === 9 }); }
      }
      var docs = ["소집 통지", "조합원 명부", "의결권 · 위임장", "정족수"].map(function (t, i) { return { t: t, sx: (g() - 0.5) * 30, sy: (g() - 0.5) * 18 - 4, sz: 10 + g() * 9, sr: (g() - 0.5) * 2, ex: -10.5 + i * 7, ey: -10 }; });
      var desk = ccw(rect(D.half * (mob ? 0.1 : 0.5), -D.half - 3.5, 7, 3.4, 0.2));
      return { mob: mob, D: D, pl: plinthOf(D.parcels.concat([{ P: desk }]), 5), ext: D.half * 2.2, sites: sites, desk: desk,
        seats: seats, docs: docs, podium: rect(0, 0.5, 8, 2.6, 0), hall: ccw(ngon(0, 2, 22, 16, 0, 0)), verify: rect(mob ? 11 : 17, mob ? -14 : -12, 7, 3.2, 0),
        layers: ["법령 개정", "고시 변경", "행정 공고", "조례 개정"] };
    },
    draw: function (r, M, s) {
      var T = r.T, W = r.w, H = r.h, mob = M.mob, inn = s.inn == null ? 1 : s.inn, k = s.k, x = r.x;
      var F = Math.max(W, H) * 1.25, px = Math.min(W * (mob ? 1.02 : 0.84), H * 1.3);
      if (s.sys === 0) {
        var site = M.sites[s.site || 0] || M.sites[0], foc = seg(k, 0, 1);
        r.cam(lerp(0, site.c[0], foc * 0.6), lerp(0, site.c[1], foc * 0.6), 2, lerp(-24, -38, foc) + 6 * seg(k, 3, 4), lerp(52, 44, foc), fitDist(M.ext, F, px) / lerp(1.12, 1.3, foc), F, W * 0.5, H * 0.54);
        r.begin();
        r.prism(M.pl, -2.4, 0, { wall: T.plWall, wallLit: mix(T.plWall, T.plTop, 0.4), roofC: T.plTop, a: inn, line: "rgba(233,220,192,.10)" });
        M.D.parcels.forEach(function (q) { r.flat(q.P, 0.01, rgba(T.parcel, inn), T.pLine, 0.6); });
        var bs = sortFar(r, M.D.parcels.filter(function (q) { return !q.open && !q.site; }), function (q) { return q.h / 2; });
        bs.forEach(function (q) { var h = q.h * seg(inn, q.dl * 0.6, q.dl * 0.6 + 0.4); r.shadow(q.foot, h, rgba(T.shadow, 0.9)); r.prism(q.foot, 0, h, { a: 1 - 0.35 * seg(k, 1, 1.6) }); });
        M.sites.forEach(function (q, i) {
          var on = q === site;
          r.flat(q.P, 0.04, rgba(T.gold, on ? 0.22 + 0.1 * foc : 0.06), on ? T.gLine : "rgba(222,188,120,.45)", on ? 1.8 : 1);
          r.label(q.c[0], q.c[1], 0.1, "가상 사업지 " + "ABC"[i], { dx: 0, dy: on ? -40 : -24, align: "center", a: inn * (on ? 1 - 0.7 * seg(k, 1, 1.4) : 0.7 * (1 - seg(k, 1, 1.4))), size: on ? 12 : 10.5, col: on ? "rgba(236,206,146,1)" : T.soft });
        });
        var P0 = inset(site.P, 1.05);
        for (var L = 0; L < 4; L++) {
          var la = seg(k, 1 + L * 0.16, 1.45 + L * 0.16), z = lerp(40, 3 + L * 4.6, la);
          var rel = L === 0 || L === 3, dim = rel ? 1 : 1 - 0.6 * seg(k, 2, 2.5);
          r.flat(P0, z, rgba(T.plane, 0.07 * la * dim), "rgba(233,220,192," + (0.6 * la * dim).toFixed(2) + ")", 1);
          r.label(P0[L % 2 ? 3 : 1][0], P0[L % 2 ? 3 : 1][1], z, M.layers[L], { dx: L % 2 ? -18 : 18, dy: -4, align: L % 2 ? "right" : "left", a: la * dim, size: 11 });
          if (rel) { var pa = seg(k, 2.1 + L * 0.06, 2.6 + L * 0.06); r.pin(P0[2][0], P0[2][1], z, 3.2, T.gold, pa); r.label(P0[2][0], P0[2][1], z + 3.2, "검토 후보", { dx: 10, dy: -10, align: "left", a: pa, size: 10.5, col: "rgba(236,206,146,1)" }); }
        }
        var ra = seg(k, 3, 3.9), dc = cen(M.desk);
        r.prism(M.desk, 0, 1.6 * inn, { roofC: mix(T.roof, T.gold, 0.35 * ra), wall: T.wall, line: ra > 0.1 ? T.gLine : T.edge });
        r.label(dc[0], dc[1], 1.6, "변호사 검토", { k: "LAWYER REVIEW", dx: mob ? -6 : 0, dy: -30, align: mob ? "right" : "center", a: inn, size: 12, col: ra > 0.5 ? "rgba(236,206,146,1)" : T.text });
        var route = [[site.c[0], site.c[1], 2], [(site.c[0] + dc[0]) / 2, (site.c[1] + dc[1]) / 2, 7], [dc[0], dc[1], 1.8]];
        r.line(route, rgba(T.gold, 0.95), 1.6, ra);
        if (ra > 0 && ra < 1) { var u = ra, qx = lerp(lerp(route[0][0], route[1][0], u), lerp(route[1][0], route[2][0], u), u), qy = lerp(lerp(route[0][1], route[1][1], u), lerp(route[1][1], route[2][1], u), u), qz = lerp(lerp(2, 7, u), lerp(7, 1.8, u), u); r.flat(rect(qx, qy, 1.8, 2.4, 0.4), qz, "rgba(255,255,255,.95)", T.gLine, 0.8); }
        return;
      }
      if (s.sys === 1) {
        r.cam(2, 0, 3, lerp(-8, -18, seg(k, 1, 3)), lerp(56, 50, seg(k, 0, 2)), fitDist(mob ? 31 : 38, F, px), F, W * 0.5, H * (mob ? 0.6 : 0.56));
        r.begin();
        r.prism(M.hall, -2.4, 0, { wall: T.plWall, wallLit: mix(T.plWall, T.plTop, 0.4), roofC: T.plTop, a: inn, line: "rgba(233,220,192,.10)" });
        r.flat(ccw(ngon(0, 6, 18, 24, 0, 0)), 0.02, null, "rgba(233,220,192,.12)", 0.8);
        r.prism(M.podium, 0, 1.4 * inn, { roofC: T.roof });
        var flagA = seg(k, 2.4, 2.9);
        var ss = sortFar(r, M.seats, function () { return 0.5; });
        ss.forEach(function (st, i) { var h = st.h * seg(inn, (i % 9) * 0.04, 0.5 + (i % 9) * 0.04), fl = st.flag ? flagA : 0; r.prism(st.foot, 0, h, { roofC: mix(T.roof, T.alert, fl), wall: mix(T.wall, T.alert, fl * 0.6) }); });
        M.docs.forEach(function (d, i) {
          var a = seg(k, 0.8 + i * 0.08, 1.7 + i * 0.08), bad = i === 2, ver = bad ? seg(k, 3, 3.8) : 0;
          var vx = cen(M.verify);
          var X = lerp(lerp(d.sx, d.ex, a), vx[0], ver), Y = lerp(lerp(d.sy, d.ey, a), vx[1], ver), Z = lerp(lerp(d.sz, 6, a), 3.4, ver);
          var R0 = rect(X, Y, 5.2, 3.4, lerp(d.sr, 0, a));
          var chk = seg(k, 2 + i * 0.12, 2.3 + i * 0.12);
          r.flat(R0, Z, "rgba(250,247,240," + (0.95 * inn).toFixed(2) + ")", bad && chk > 0.5 ? rgba(T.alert, 1) : chk > 0.5 ? T.gLine : "rgba(19,40,75,.45)", bad && chk > 0.5 ? 1.8 : 1);
          var q = r.p(X, Y, Z);
          x.globalAlpha = inn; x.textAlign = "center"; x.textBaseline = "middle"; x.font = "600 " + (mob ? 10 : 11) + "px " + FONT; x.fillStyle = "#13284B"; x.fillText(d.t, q[0], q[1]);
          if (chk > 0.02) { x.globalAlpha = chk; x.font = "700 " + (mob ? 10 : 11) + "px " + FONT; x.fillStyle = bad ? rgba(T.alert, 1) : "rgba(236,206,146,1)"; x.fillText(bad ? "확인 필요" : "✓ 일치", q[0], q[1] - (mob ? 22 : 26)); }
          x.globalAlpha = 1;
        });
        var vc = cen(M.verify), va = seg(k, 3, 3.9);
        r.prism(M.verify, 0, 1.5 * inn, { roofC: mix(T.roof, T.gold, 0.4 * va), line: va > 0.1 ? T.gLine : T.edge });
        r.label(vc[0], vc[1], 1.5, "사람의 확인", { k: "HUMAN VERIFICATION", dx: 0, dy: -30, align: mob ? "right" : "center", a: inn, size: 12 });
        r.label(-14, 10, 1, "조합원석 — 명부 · 의결권 대조", { dx: -4, dy: 26, align: "right", a: flagA, size: 10.5, col: rgba(T.alert, 1) });
        return;
      }
      /* 계약 — 손잡이 s 로 변경 전(0) ↔ 변경 후(1) */
      var sv = s.s, floors = 12 + 3 * sv;
      r.cam(0, 0, 14, -30 + 10 * sv, 30, fitDist(44, F, px * 0.9), F, W * 0.5, H * 0.6);
      r.begin();
      var base = ccw(ngon(0, 0, 21, 12, 0.2, 0));
      r.prism(base, -2.4, 0, { wall: T.plWall, wallLit: mix(T.plWall, T.plTop, 0.4), roofC: T.plTop, a: inn, line: "rgba(233,220,192,.10)" });
      var pod = ccw(rect(0, 0, lerp(16, 18, sv), lerp(12, 13, sv), 0.2)), tw = ccw(rect(0.5, 0, 8, 6.4, 0.2));
      r.shadow(pod, 4, rgba(T.shadow, 1)); r.shadow(tw, floors * 2.2, rgba(T.shadow, 1));
      r.prism(pod, 0, 4 * inn, { roofC: T.roof });
      var fh = 2.2;
      for (var fI = 0; fI < Math.ceil(floors); fI++) {
        var part = clamp(floors - fI, 0, 1), nu = fI >= 12, z0 = 4 + fI * fh;
        r.prism(tw, z0, z0 + fh * part * 0.92 * seg(inn, fI * 0.03, fI * 0.03 + 0.5), { roofC: nu ? mix(T.roof, T.gold, 0.7) : T.roof, wall: nu ? mix(T.wall, T.gold, 0.55) : T.wall, wallLit: nu ? mix(T.wallLit, T.gold, 0.6) : T.wallLit, line: nu ? T.gLine : T.edge });
      }
      /* 비용 기둥 · 부담 주체 표시 — 숫자 없이 방향만 */
      var col = rect(13, -11, 2, 2, 0.2), ch = 4 + 9 * sv;
      r.prism(col, 0, ch * inn, { roofC: mix(T.roof, T.gold, sv), wall: mix(T.wall, T.gold, sv * 0.6), line: sv > 0.5 ? T.gLine : T.edge });
      r.label(13, -11, ch, sv > 0.5 ? "공사비 — 조정 가능" : "공사비 — 계약 시 확정", { k: "COST CLAUSE", dx: 10, dy: -16, align: "left", a: inn, size: 11, col: sv > 0.5 ? "rgba(236,206,146,1)" : T.text });
      var who = rect(lerp(13, -12, sv), lerp(8, 9, sv), 2.4, 2.4, 0.2);
      r.prism(rect(13, 8, 4, 3, 0.2), 0, 1.2, { roofC: T.roof }); r.prism(rect(-12, 9, 4, 3, 0.2), 0, 1.2, { roofC: T.roof });
      r.label(13, 8, 1.2, "수급인", { dx: 0, dy: 18, align: "center", size: 10.5, col: T.soft });
      r.label(-12, 9, 1.2, "도급인", { dx: 0, dy: 18, align: "center", size: 10.5, col: T.soft });
      r.flat(who, 3.2, rgba(T.gold, 0.9), T.gLine, 1);
      var wc = cen(who);
      r.label(wc[0], wc[1], 3.2, "설계 변경 비용 부담", { k: "RESPONSIBILITY", dx: 0, dy: 34, align: "center", size: 10.5, col: "rgba(236,206,146,1)" });
      r.label(0.5, 0, 4 + floors * fh, sv > 0.5 ? "변경 후 · 층수 증가 (가상)" : "변경 전 (가상)", { k: "VERSION", dx: 26, dy: -18, size: 11.5 });
    },
  };

  /* 광명시흥 보상자료 — 필지 확인 → 감정평가 자료 → 보상협의 → 재결 (금액 없음 · 개념도) */
  SCENES.comp = {
    theme: "dark",
    build: function (mob) {
      var D = district(3307, { n: 3, cell: 12, road: 2.4, rot: -0.3, minA: 30, hMax: 2.4, hMin: 0.4, jit: 1.6, open: 0.4 });
      var tg = D.parcels.filter(function (q, i) { return i % 3 === 1; }).slice(0, 5);
      tg.forEach(function (q) { q.tg = true; });
      return { mob: mob, D: D, pl: plinthOf(D.parcels, 4), tg: tg, ext: D.half * 2.6, table: rect(D.half + 4, 2, 6, 3.4, -0.3), dais: rect(D.half + 6, -9, 5.4, 4, -0.3) };
    },
    draw: function (r, M, s) {
      var T = r.T, W = r.w, H = r.h, k = s.k, F = Math.max(W, H) * 1.3, px = Math.min(W * 0.95, H * 1.35);
      r.cam(W < 520 ? 2 : 4, -1, 1, -30 + 8 * seg(k, 2, 4), 48, fitDist(M.ext, F, px) / 1.15, F, W * 0.5, H * 0.52);
      r.begin();
      r.prism(M.pl, -2, 0, { wall: T.plWall, wallLit: mix(T.plWall, T.plTop, 0.4), roofC: T.plTop, line: "rgba(233,220,192,.10)" });
      M.D.parcels.forEach(function (q, i) {
        var on = q.tg ? seg(k, (i % 5) * 0.12, 0.5 + (i % 5) * 0.12) : 0;
        r.flat(q.P, 0.02, rgba(mix(T.parcel, T.gold, on * 0.45), 1), on > 0.3 ? T.gLine : T.pLine, on > 0.3 ? 1.4 : 0.6);
        if (!q.open && !q.tg) r.prism(q.foot, 0, q.h, { a: 0.9 });
      });
      var docA = seg(k, 1, 1.8), mv = seg(k, 2, 2.8), up = seg(k, 3, 3.8), tc = cen(M.table), dc = cen(M.dais);
      r.prism(M.table, 0, 1.2, { roofC: mix(T.roof, T.gold, 0.4 * mv), line: mv > 0.2 ? T.gLine : T.edge });
      r.prism(M.dais, 0, 1.2 + 2.4 * up, { roofC: mix(T.roof, T.gold, 0.5 * up), line: up > 0.2 ? T.gLine : T.edge });
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

  /* ---------------------------------------------------------------- 장착 */
  function mount(canvas, name, opt) {
    opt = opt || {};
    var S = SCENES[name];
    if (!S || !canvas || !canvas.getContext) return null;
    var r = new Rd(canvas, THEME[S.theme || "ivory"]);
    var mob = !!(window.matchMedia && window.matchMedia("(max-width: 760px)").matches);
    var M = S.build(mob, opt);
    var st = { p: 0, o: 0, k: 0, s: 0, sys: 0, site: 0, inn: 1, hx: 0, intro: calm() ? 1 : 0, t0: performance.now() };
    for (var key in (opt.state || {})) st[key] = opt.state[key];
    var loadImg = function () { if (opt.img && !M.img) { M.img = new Image(); M.img.decoding = "async"; M.img.onload = function () { dirty = true; req(true); }; M.img.src = mob ? opt.img.m : opt.img.d; } };
    var sec = opt.scroll ? canvas.closest(opt.scroll) : null, geo = { top: 0, h: 1 }, tw = {}, raf = 0, vis = false, act = false, dead = false, last = 0, ph = -1, dirty = true, lastP = -1;
    var phaseEl = opt.phaseEl ? canvas.closest(opt.phaseEl) : null;
    function measure() {
      r.size(mob ? (S.dpr || 1.35) : 1.5); /* 폰 — 선명도와 그리기 비용의 균형(첫 장면만 1.75) */
      if (sec) { var b = sec.getBoundingClientRect(); geo.top = b.top + (window.scrollY || 0); geo.h = b.height; }
      dirty = true; req(true);
    }
    function prog() {
      var y = window.scrollY || 0, vh = window.innerHeight;
      if (opt.mode === "pin") { var span = geo.h - vh; return span > 0 ? clamp((y - geo.top) / span, 0, 1) : 1; }
      return clamp((vh - (geo.top - y)) / (vh * 0.85), 0, 1); /* 위 끝이 화면 아래에 닿을 때 0 → 화면 위 15% 에 올 때 1 */
    }
    function frame(now) {
      raf = 0;
      if (dead) return;
      var busy = false, quiet = calm();
      for (var k in tw) {
        var t = tw[k], u = quiet ? 1 : clamp((now - t.t0) / t.ms, 0, 1);
        st[k] = t.a + (t.b - t.a) * (t.lin ? u : 1 - Math.pow(1 - u, 3));
        if (u >= 1) { delete tw[k]; t.done(); } else busy = true;
      }
      if (sec) st.p = quiet ? (S.rest != null ? S.rest : 1) : prog();
      if (st.intro < 1) { st.intro = clamp((now - st.t0) / 1800, 0, 1); busy = true; }
      /* 상시 움직임(문서 흐름 · 업무 흐름)은 스크롤하는 동안 쉬었다가 멈추면 이어 간다 */
      var live = S.live && act && !quiet && st.o < 0.01;
      if (live && now - scrolled < 260) { if (!busy && Math.round(st.p * 2000) === lastP && !dirty) { setTimeout(req, 280); return; } live = false; }
      if (live && !busy && now - last < 32) { req(); return; }
      /* 같은 상태면 다시 그리지 않는다 — 다 솟은 뒤의 스크롤은 그리기 0회 */
      var pk = Math.round(st.p * 2000);
      if (!busy && !live && !dirty && pk === lastP) return;
      dirty = false; lastP = pk;
      last = now;
      S.draw(r, M, st, now);
      if (phaseEl && S.phase) { var np = S.phase(st); if (np !== ph) { ph = np; phaseEl.setAttribute("data-phase", String(np)); } }
      if (busy) req(true); /* 진행 중인 전환은 화면 밖으로 밀려나도 끝까지 */
      else if (live && vis) req();
    }
    function req(force) { if (!raf && !dead && (vis || force)) raf = requestAnimationFrame(frame); }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis = e.isIntersecting; act = e.intersectionRatio >= 0.35; if (vis) { loadImg(); req(); } });
    }, { threshold: [0, 0.35], rootMargin: "120px 0px" });
    io.observe(canvas);
    var scrolled = 0;
    var onScroll = function () { scrolled = performance.now(); if (vis) req(); };
    if (sec || S.live) window.addEventListener("scroll", onScroll, { passive: true });
    var ro = window.ResizeObserver ? new ResizeObserver(function () { measure(); }) : null;
    if (ro) { ro.observe(canvas); if (sec) ro.observe(sec); } else window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    measure();
    var api = {
      set: function (k, v) { delete tw[k]; st[k] = v; dirty = true; req(true); },
      get: function (k) { return st[k]; },
      tween: function (k, to, ms, lin) {
        return new Promise(function (done) {
          if (tw[k]) tw[k].done();
          tw[k] = { a: st[k], b: to, t0: performance.now(), ms: ms || 600, lin: lin, done: done };
          if (!vis) { st[k] = to; delete tw[k]; done(); }
          req(true);
        });
      },
      /* '건축 → 소프트웨어' 전환이 끝나는 자리(뷰포트 좌표) — 극장 FLIP 의 출발점 */
      stageRect: function () { var b = canvas.getBoundingClientRect(), R = stageRect(r, M.aspect || 1.6); return { left: b.left + R.x, top: b.top + R.y, width: R.w, height: R.h }; },
      redraw: function () { dirty = true; req(true); },
      destroy: function () { dead = true; io.disconnect(); if (ro) ro.disconnect(); window.removeEventListener("scroll", onScroll); window.removeEventListener("load", measure); cancelAnimationFrame(raf); },
    };
    return api;
  }

  window.City = { mount: mount, scenes: SCENES };
})();
