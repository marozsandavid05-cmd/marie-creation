/* =====================================================================
   MARIE CREATION v2 · hímzett hero: az "otthon" szó öltés-szemcsékből
   Offscreen canvas szövegmintavétel → részecskék (rövid öltés-vonalkák).
   Belépéskor szétszórtból beöltődnek, egér elől szétszaladnak és
   visszaöltődnek, görgetésre szétszóródnak. Reduced motion: statikus kép.
   ===================================================================== */
(function () {
  'use strict';
  var host = document.querySelector('[data-stitch]');
  if (!host) return;
  var reduce = window.__mcReduce !== undefined ? window.__mcReduce : matchMedia('(prefers-reduced-motion:reduce)').matches;
  var touch = matchMedia('(hover:none)').matches;
  var WORD = host.getAttribute('data-stitch') || 'otthon';
  var canvas = document.createElement('canvas');
  canvas.className = 'stitch-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  var NAVY = '56,64,99', COPPER = '176,122,78';
  var W = 0, H = 0, dpr = 1, pts = [], t0 = performance.now();
  var mouse = { x: -1e4, y: -1e4 };
  var scrollF = 0;

  function sample() {
    var r = host.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var off = document.createElement('canvas');
    off.width = W; off.height = H;
    var oc = off.getContext('2d');
    var fontSize = Math.min(W * 0.26, H * 0.62);
    oc.font = '500 ' + fontSize + 'px "Cormorant Garamond", Georgia, serif';
    oc.textBaseline = 'middle';
    oc.textAlign = 'left';
    var tw = oc.measureText(WORD).width;
    var x0 = Math.max(W * 0.04, (W - tw) * 0.5), y0 = H * 0.5;
    oc.fillStyle = '#000'; oc.fillText(WORD, x0, y0);
    oc.lineWidth = Math.max(1.6, fontSize * 0.012); oc.strokeStyle = '#000'; oc.strokeText(WORD, x0, y0);
    var data = oc.getImageData(0, 0, W, H).data;
    var gap = W < 760 ? 3 : (W < 1200 ? 3.4 : 3.8);
    pts = [];
    for (var y = 0; y < H; y += gap) {
      for (var x = 0; x < W; x += gap) {
        var i = ((y | 0) * W + (x | 0)) * 4 + 3;
        if (data[i] > 60) {
          var copper = Math.random() < 0.13;
          var ang = (Math.random() < 0.5 ? -1 : 1) * (0.55 + Math.random() * 0.35);
          var sx = x + (Math.random() - 0.5) * W * 0.9, sy = y + (Math.random() - 0.5) * H * 1.2;
          pts.push({ tx: x, ty: y, x: sx, y: sy, vx: 0, vy: 0, a: ang, len: 2.6 + Math.random() * 2.2,
            c: copper ? COPPER : NAVY, al: 0.72 + Math.random() * 0.28, d: Math.random() });
        }
      }
    }
  }

  function draw(now) {
    var t = (now - t0) / 1000;
    var enter = Math.min(1, Math.max(0, (t - 0.25) / 1.7));
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      var e = Math.min(1, Math.max(0, (enter - p.d * 0.45) / 0.55));
      var ee = 1 - Math.pow(1 - e, 3);
      var tx = p.tx + (p.x - p.tx) * 0, ty = p.ty;
      /* cél: belépés közben a szétszórt kezdőpont felől, utána a betű; görgetéskor szétszóródás */
      var gx = p.tx + (Math.sin(p.d * 12.9) * 140 + Math.cos(p.d * 7.1) * 80) * scrollF;
      var gy = p.ty + (Math.cos(p.d * 9.3) * 160 + Math.sin(p.d * 5.7) * 60) * scrollF + scrollF * 120;
      if (e < 1) { gx = p.x + (gx - p.x) * ee; gy = p.y + (gy - p.y) * ee; p.cx = gx; p.cy = gy; }
      else {
        if (p.cx === undefined) { p.cx = p.tx; p.cy = p.ty; }
        /* egér-repel + rugó */
        var dx = p.cx - mouse.x, dy = p.cy - mouse.y, d2 = dx * dx + dy * dy;
        var ax = (gx - p.cx) * 0.06, ay = (gy - p.cy) * 0.06;
        if (d2 < 9000) {
          var d = Math.sqrt(d2) || 1, f = (1 - d / 95) * 5.5;
          ax += (dx / d) * f; ay += (dy / d) * f;
        }
        p.vx = (p.vx + ax) * 0.82; p.vy = (p.vy + ay) * 0.82;
        p.cx += p.vx; p.cy += p.vy;
      }
      var ca = Math.cos(p.a) * p.len, sa = Math.sin(p.a) * p.len;
      ctx.strokeStyle = 'rgba(' + p.c + ',' + (p.al * (0.35 + 0.65 * ee)) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(p.cx - ca, p.cy - sa); ctx.lineTo(p.cx + ca, p.cy + sa); ctx.stroke();
    }
  }
  function drawStatic() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i], ca = Math.cos(p.a) * p.len, sa = Math.sin(p.a) * p.len;
      ctx.strokeStyle = 'rgba(' + p.c + ',' + p.al + ')'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(p.tx - ca, p.ty - sa); ctx.lineTo(p.tx + ca, p.ty + sa); ctx.stroke();
    }
  }

  var visible = true;
  new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(host);
  addEventListener('scroll', function () {
    var r = host.getBoundingClientRect();
    scrollF = Math.min(1, Math.max(0, -r.top / (r.height * 0.8)));
  }, { passive: true });
  if (!touch) {
    addEventListener('mousemove', function (e) {
      var r = host.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    }, { passive: true });
    host.addEventListener('mouseleave', function () { mouse.x = -1e4; mouse.y = -1e4; });
  }

  function start() {
    sample();
    host.classList.add('stitch-on');
    if (reduce) { drawStatic(); return; }
    t0 = performance.now();
    (function loop(now) { if (visible) draw(now); requestAnimationFrame(loop); })(t0);
  }
  if (document.fonts && document.fonts.load) {
    document.fonts.load('500 80px "Cormorant Garamond"').then(start, start);
  } else start();
  var rT;
  addEventListener('resize', function () {
    clearTimeout(rT);
    rT = setTimeout(function () { sample(); if (reduce) drawStatic(); }, 250);
  }, { passive: true });
})();
