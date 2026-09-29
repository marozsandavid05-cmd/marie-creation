/* MARIE CREATION v2 · főoldal-motor: húzható képsor, hover-preview lista, fény-szekció scroll */
(function () {
  'use strict';
  var reduce = window.__mcReduce !== undefined ? window.__mcReduce : matchMedia('(prefers-reduced-motion:reduce)').matches;
  var hasGSAP = typeof gsap !== 'undefined';

  /* ---------- HERO wordmark: fény ébred, betűk beúsznak, egér-parallax, görgetésre a menübe zsugorodik ---------- */
  var hw = document.getElementById('hero');
  if (hw && hw.classList.contains('hero-w')) {
    var pinEl = hw.querySelector('.hero-w__pin'), center = hw.querySelector('.hero-w__center');
    var imgs = hw.querySelectorAll('.hero-w__img');
    hw.querySelectorAll('.hero-w__mark .w').forEach(function (w) { w.innerHTML = '<span>' + w.innerHTML + '</span>'; });
    if (reduce || !hasGSAP || !window.ScrollTrigger || innerWidth <= 920) {
      hw.classList.add('is-static', 'is-in');
    } else {
      setTimeout(function () { hw.classList.add('is-in'); }, 350);
      var o = { r: 0 };
      gsap.to(o, { r: 3200, duration: 2.6, ease: 'power2.inOut', delay: 0.5, onUpdate: function () { pinEl.style.setProperty('--r', o.r + 'px'); } });
      gsap.fromTo(imgs, { scale: 1.08 }, { scale: 1, duration: 9, ease: 'power1.out' });
      var px = gsap.quickTo(imgs, 'x', { duration: 1.2, ease: 'power3.out' }), py = gsap.quickTo(imgs, 'y', { duration: 1.2, ease: 'power3.out' });
      if (!matchMedia('(hover:none)').matches) hw.addEventListener('pointermove', function (e) { px((e.clientX / innerWidth - .5) * -18); py((e.clientY / innerHeight - .5) * -12); }, { passive: true });
      /* görgetésre a név a menü felé zsugorodik, a lábjegyzet elúszik */
      gsap.timeline({ scrollTrigger: { trigger: hw, start: 'top top', end: 'bottom bottom', scrub: 0.6 } })
        .to(center, { yPercent: -160, scale: 0.42, opacity: 0, ease: 'power2.in', duration: 1 }, 0)
        .to(hw.querySelector('.hero-w__foot'), { opacity: 0, y: 30, duration: 0.5 }, 0);
      /* a kép scale-jét CSAK a belépő tween írja, a scrub nem: két író ugyanarra a tulajdonságra visszagörgetéskor ugrást okozott */
    }
  }

  /* ---------- húzható képsor (GSAP Draggable + Inertia, natív scroll fallback) ---------- */
  var strip = document.querySelector('.dragstrip');
  var track = strip && strip.querySelector('.dragstrip__track');
  if (strip && track) {
    if (hasGSAP && window.Draggable) {
      try {
        gsap.registerPlugin(Draggable);
        if (window.InertiaPlugin) gsap.registerPlugin(InertiaPlugin);
        function bounds() { return { minX: Math.min(0, strip.clientWidth - track.scrollWidth), maxX: 0 }; }
        Draggable.create(track, {
          type: 'x', bounds: bounds(), inertia: !!window.InertiaPlugin, edgeResistance: 0.82,
          dragResistance: 0.08, allowNativeTouchScrolling: true
        });
        addEventListener('resize', function () { var d = Draggable.get(track); if (d) d.applyBounds(bounds()); }, { passive: true });
      } catch (e) { strip.style.overflowX = 'auto'; }
    } else { strip.style.overflowX = 'auto'; }
  }

  /* ---------- hover-preview lista: a kép a kurzor mellett úszik ---------- */
  /* a kép a jobb oszlopban, fix helyen jelenik meg (nem takarja a címeket); a kurzor csak finoman mozgatja */
  var svc = document.querySelector('.svc');
  var preview = document.querySelector('.svc__preview');
  if (svc && preview && !matchMedia('(hover:none)').matches && innerWidth > 820) {
    var imgs = preview.querySelectorAll('img');
    var setX = hasGSAP ? gsap.quickTo(preview, 'x', { duration: 0.8, ease: 'power3.out' }) : function () {};
    var setY = hasGSAP ? gsap.quickTo(preview, 'y', { duration: 0.8, ease: 'power3.out' }) : function () {};
    svc.addEventListener('pointermove', function (e) {
      setX((e.clientX / innerWidth - 0.5) * 24); setY((e.clientY / innerHeight - 0.5) * 24);
    }, { passive: true });
    svc.querySelectorAll('.svc__row').forEach(function (row, i) {
      row.addEventListener('mouseenter', function () {
        imgs.forEach(function (im, j) { im.classList.toggle('is-on', i === j); });
        preview.classList.add('is-on');
      });
    });
    svc.addEventListener('mouseleave', function () { preview.classList.remove('is-on'); });
  }

  /* ---------- SPOT: auto-rotálás, egérre az egérrel jelölt aktív, egér nélkül megy magától ---------- */
  var spot = document.getElementById('spot');
  if (spot) {
    var items = [].slice.call(spot.querySelectorAll('.spot__item'));
    var bar = spot.querySelector('.spot__bar'), count = spot.querySelector('.spot__count');
    var idx = 0, timer = null, paused = false, PERIOD = 6000;
    function activate(i) {
      idx = i;
      items.forEach(function (it, j) { it.classList.toggle('is-on', j === i); });
      if (bar) { bar.style.left = (i * 100 / items.length) + '%'; bar.style.width = (100 / items.length) + '%'; }
      if (count) count.textContent = (i + 1) + ' : ' + items.length;
    }
    /* tartalomváltás, nem animáció: reduced-motion alatt is lép */
    function tick() { if (!paused && !document.hidden) activate((idx + 1) % items.length); }
    function start() { clearInterval(timer); timer = setInterval(tick, PERIOD); }
    items.forEach(function (it, i) {
      it.addEventListener('mouseenter', function () { paused = true; clearInterval(timer); activate(i); });
      it.addEventListener('mouseleave', function () { paused = false; start(); });
    });
    new IntersectionObserver(function (en) { if (en[0].isIntersecting) start(); else clearInterval(timer); }, { threshold: 0.2 }).observe(spot);
    activate(0);
  }

  /* ---------- fény-szekció: két fél összevarródik, a fény belép, a cím fölé úszik, végül full-bleed ---------- */
  var light = document.querySelector('.light');
  if (light) {
    var pin = light.querySelector('.light__pin');
    if (reduce || !hasGSAP || !window.ScrollTrigger || innerWidth <= 920) { light.classList.add('is-static'); }
    else {
      var L = light.querySelector('.light__half--l'), R = light.querySelector('.light__half--r');
      var T = light.querySelector('.light__title'), B = light.querySelector('.light__band');
      var o = { r: 0 };
      var v = { scrim: 0, tsa: 0 };
      gsap.timeline({ scrollTrigger: { trigger: light, start: 'top top', end: 'bottom bottom', scrub: 0.7 } })
        /* 1. a két fél összeér és egy vonalba kerül */
        .to(L, { x: '-100%', y: '-50%', duration: 0.3, ease: 'power2.inOut' }, 0)
        .to(R, { x: '0%', y: '-50%', duration: 0.3, ease: 'power2.inOut' }, 0)
        /* 2. a fény belép (duotone → szín) */
        .to(o, { r: 2200, duration: 0.3, ease: 'power1.inOut', onUpdate: function () { pin.style.setProperty('--r', o.r + 'px'); } }, 0.15)
        /* 3. a cím fölé úszik */
        .fromTo(T, { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 0.32)
        /* 4. teljes képernyős: a két fél a viewportra nő */
        .to([L, R], { top: 0, height: '100svh', width: '50vw', duration: 0.3, ease: 'power2.inOut' }, 0.5)
        .to(L, { x: '-100%', y: '0%', duration: 0.3, ease: 'power2.inOut' }, 0.5)
        .to(R, { x: '0%', y: '0%', duration: 0.3, ease: 'power2.inOut' }, 0.5)
        .to(T, { top: '22%', duration: 0.3, ease: 'power2.inOut' }, 0.5)
        /* 5. a fátyol alulról fokozatosan erősödik, a cím lassan átfehéredik (nem küszöb-ugrás) */
        .to(v, { scrim: 1, tsa: 0.6, duration: 0.28, ease: 'power1.inOut', onUpdate: function () { pin.style.setProperty('--scrim', v.scrim); pin.style.setProperty('--tsa', v.tsa); } }, 0.58)
        .to(T, { color: '#F2EEE1', duration: 0.28, ease: 'power1.inOut' }, 0.58)
        .to(T.querySelector('em'), { color: '#F6F0E4', duration: 0.28, ease: 'power1.inOut' }, 0.58)
        .to(B, { opacity: 1, duration: 0.15 }, 0.72);
    }
  }
})();
