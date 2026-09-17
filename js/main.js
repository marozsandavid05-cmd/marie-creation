/* MARIE CREATION v2 · közös motor (robusztus gerinc + GSAP extra) */
(function () {
  'use strict';
  try {
    if (/[?&]motion=1/.test(location.search)) sessionStorage.setItem('mc_force_motion', '1');
    if (/[?&]motion=0/.test(location.search)) sessionStorage.removeItem('mc_force_motion');
  } catch (e) {}
  var forceMotion = false;
  try { forceMotion = sessionStorage.getItem('mc_force_motion') === '1'; } catch (e) {}
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches && !forceMotion;
  window.__mcReduce = reduce;
  var hasGSAP = typeof gsap !== 'undefined';
  if (forceMotion) document.documentElement.classList.add('force-motion');

  /* reveal + clip-reveal: IntersectionObserver */
  var revealEls = [].slice.call(document.querySelectorAll('[data-reveal], .clipr'));
  var rio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -6% 0px' });
  revealEls.forEach(function (el) { rio.observe(el); });

  /* hero belépő */
  function heroIn() { var h = document.querySelector('.hero'); if (h) h.classList.add('is-in'); }
  addEventListener('load', heroIn);
  setTimeout(heroIn, 1500);

  /* nav */
  var nav = document.querySelector('.nav');
  var lastY = 0, acc = 0, DELTA = 90;
  var navTick = false;
  function onScroll() {
    var y = scrollY;
    if (nav) {
      nav.classList.toggle('nav--scrolled', y > 40);
      var d = y - lastY;
      if ((d > 0) !== (acc > 0)) acc = 0;
      acc += d;
      if (acc > DELTA && y > 300) { nav.classList.add('nav--hidden'); acc = 0; }
      else if (acc < -DELTA || y < 300) { nav.classList.remove('nav--hidden'); acc = 0; }
    }
    lastY = y; navTick = false;
  }
  addEventListener('scroll', function () { if (!navTick) { navTick = true; requestAnimationFrame(onScroll); } }, { passive: true });

  /* mobil menü */
  var burger = document.querySelector('.nav__burger'), mnav = document.querySelector('.mnav');
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      var open = !mnav.classList.contains('is-open');
      document.body.classList.toggle('menu-open', open);
      mnav.classList.toggle('is-open', open);
      if (window.__lenis) { if (open) window.__lenis.stop(); else window.__lenis.start(); }
    });
    mnav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('menu-open'); mnav.classList.remove('is-open');
        if (window.__lenis) window.__lenis.start();
      });
    });
  }

  /* Lenis */
  if (!reduce && typeof Lenis !== 'undefined') {
    var lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true, syncTouch: false });
    window.__lenis = lenis;
    (function lraf(t) { lenis.raf(t); requestAnimationFrame(lraf); })();
    lenis.on('scroll', function () { if (hasGSAP && window.ScrollTrigger) ScrollTrigger.update(); });
  }

  /* idle-guard refresh */
  var lastScrollT = 0, tries = 0;
  addEventListener('scroll', function () { lastScrollT = performance.now(); }, { passive: true });
  function queueIdleRefresh() {
    if (!hasGSAP || !window.ScrollTrigger || tries++ > 40) return;
    if (performance.now() - lastScrollT > 600) ScrollTrigger.refresh(); else setTimeout(queueIdleRefresh, 650);
  }
  addEventListener('load', function () { setTimeout(queueIdleRefresh, 500); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(queueIdleRefresh, 200); });

  if (hasGSAP && !reduce && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    /* nagy címek: soronkénti mask-reveal, fontok után */
    if (window.SplitText) {
      gsap.registerPlugin(SplitText);
      var targets = [].slice.call(document.querySelectorAll('[data-split]'));
      var runSplit = function () {
        targets.forEach(function (el) {
          if (el.__split) return; el.__split = true;
          try {
            var sp = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'sline' });
            gsap.from(sp.lines, { yPercent: 112, duration: 1.05, ease: 'power4.out', stagger: 0.1,
              scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
          } catch (e) {}
        });
        ScrollTrigger.refresh();
      };
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(runSplit); else runSplit();
    }

    /* jelenetek: az előző finoman hátralép, ahogy a következő rácsúszik */
    var scenes = gsap.utils.toArray('.scene');
    scenes.forEach(function (sc, i) {
      if (i === scenes.length - 1) return;
      gsap.to(sc, { scale: 0.94, ease: 'none',
        scrollTrigger: { trigger: scenes[i + 1], start: 'top bottom', end: 'top top', scrub: true } });
      var img = sc.querySelector('.scene__bg img');
      if (img) gsap.to(img, { yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: scenes[i + 1], start: 'top bottom', end: 'top top', scrub: true } });
    });

    /* képsávok parallax */
    gsap.utils.toArray('.band img').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -8 }, { yPercent: 2, ease: 'none',
        scrollTrigger: { trigger: img.closest('.band'), start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    /* hstrip: pinned horizontal pan (desktop) */
    var hstrip = document.querySelector('.hstrip');
    if (hstrip && innerWidth > 920) {
      var track = hstrip.querySelector('.hstrip__track');
      hstrip.style.overflow = 'hidden';
      gsap.to(track, { x: function () { return -(track.scrollWidth - innerWidth); }, ease: 'none',
        scrollTrigger: { trigger: hstrip, start: 'top top', end: function () { return '+=' + (track.scrollWidth - innerWidth); },
          pin: true, scrub: 1, invalidateOnRefresh: true } });
    }
  }

  window.mcToast = function (msg) {
    var t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    requestAnimationFrame(function () { t.classList.add('is-on'); });
    clearTimeout(t.__h); t.__h = setTimeout(function () { t.classList.remove('is-on'); }, 2600);
  };
})();
