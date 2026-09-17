/* MARIE CREATION · hímzett embléma v3
   A lótusz öltéspontjai előre kiszámolva (lotus-points.js), nincs canvas-visszaolvasás
   (Brave/fingerprint-védelem alatt is megy). Belépés: valódi hímzés-sorrendben varródik ki
   balról jobbra; nyugalomban lélegzik; egérre elhajlik; görgetésre lassan felúszik. */
(function () {
  'use strict';
  var host = document.querySelector('[data-stitch-img]');
  var data = window.MC_LOTUS_PTS;
  if (!host || !data) return;
  var reduce = window.__mcReduce !== undefined ? window.__mcReduce : matchMedia('(prefers-reduced-motion:reduce)').matches;
  var touch = matchMedia('(hover:none)').matches;
  var canvas = document.createElement('canvas'); canvas.className = 'stitch-canvas'; canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  var NAVY = '56,64,99', COPPER = '176,122,78';
  var W = 0, H = 0, dpr = 1, pts = [], t0 = performance.now(), mouse = { x: -1e4, y: -1e4 }, scrollY0 = 0;
  var SEW = 2.6; /* másodperc, ennyi alatt hímződik ki */

  function build() {
    var r = host.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var tw = Math.min(W * 0.7, 1100), th = tw / data.ar;
    if (th > H * 0.54) { th = H * 0.54; tw = th * data.ar; }
    var x0 = (W - tw) / 2, y0 = H * 0.40 - th / 2;
    var arr = data.p, n = arr.length / 2;
    pts = new Array(n);
    for (var i = 0; i < n; i++) {
      var tx = x0 + arr[i * 2] / 10000 * tw, ty = y0 + arr[i * 2 + 1] / 10000 * th;
      var seed = ((i * 9301 + 49297) % 233280) / 233280;
      var a = (seed < 0.5 ? -1 : 1) * (0.5 + ((i * 7919) % 1000) / 1000 * 0.4);
      pts[i] = { tx: tx, ty: ty, cx: tx, cy: ty, vx: 0, vy: 0, a: a, len: 2.4 + seed * 2.2,
        c: ((i * 31) % 100) < 14 ? COPPER : NAVY, al: 0.72 + seed * 0.28, ord: i / n, ph: seed * 6.283 };
    }
  }
  function drawAll(prog, t, physics) {
    ctx.clearRect(0, 0, W, H);
    var lift = scrollY0 * 0.25;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      /* hímzés-sorrend: a pont csak akkor jelenik meg, ha a tű odaért */
      var e = Math.min(1, Math.max(0, (prog - p.ord) / 0.12));
      if (e <= 0) continue;
      var ee = 1 - Math.pow(1 - e, 3);
      /* lélegzés */
      var bx = p.tx + Math.sin(t * 0.8 + p.ph) * 0.6, by = p.ty + Math.cos(t * 0.7 + p.ph) * 0.6 - lift;
      if (physics) {
        var dx = p.cx - mouse.x, dy = p.cy - mouse.y, d2 = dx * dx + dy * dy;
        var ax = (bx - p.cx) * 0.07, ay = (by - p.cy) * 0.07;
        if (d2 < 14000) { var d = Math.sqrt(d2) || 1, f = (1 - d / 118) * 6.5; ax += (dx / d) * f; ay += (dy / d) * f; }
        p.vx = (p.vx + ax) * 0.8; p.vy = (p.vy + ay) * 0.8; p.cx += p.vx; p.cy += p.vy;
      } else { p.cx = bx; p.cy = by; }
      /* belépéskor a tű felől érkezik: kis eltolás + fényesebb réz villanás */
      var ox = (1 - ee) * -18, oy = (1 - ee) * 10;
      var ca = Math.cos(p.a) * p.len, sa = Math.sin(p.a) * p.len;
      ctx.strokeStyle = 'rgba(' + (ee < 1 ? COPPER : p.c) + ',' + (p.al * (0.4 + 0.6 * ee)) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(p.cx + ox - ca, p.cy + oy - sa); ctx.lineTo(p.cx + ox + ca, p.cy + oy + sa); ctx.stroke();
    }
    /* a "tű": a hímzés frontján egy réz pont */
    if (prog > 0 && prog < 1) {
      var idx = Math.min(pts.length - 1, Math.floor(prog * pts.length)), q = pts[idx];
      ctx.fillStyle = 'rgba(' + COPPER + ',.9)'; ctx.beginPath(); ctx.arc(q.tx, q.ty - lift, 2.4, 0, 6.283); ctx.fill();
    }
  }
  var visible = true;
  new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(host);
  addEventListener('scroll', function () { scrollY0 = Math.min(600, Math.max(0, scrollY)); }, { passive: true });
  if (!touch) {
    addEventListener('mousemove', function (e) { var r = host.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; }, { passive: true });
    host.addEventListener('mouseleave', function () { mouse.x = -1e4; mouse.y = -1e4; });
  }
  build();
  host.classList.add('stitch-on');
  if (reduce) { drawAll(1, 0, false); }
  else {
    t0 = performance.now();
    (function loop(now) {
      if (visible) { var t = (now - t0) / 1000; var prog = Math.min(1, Math.max(0, (t - 0.3) / SEW)); drawAll(prog, t, prog >= 1); }
      requestAnimationFrame(loop);
    })(t0);
  }
  var rT; addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { build(); if (reduce) drawAll(1, 0, false); }, 250); }, { passive: true });
})();
