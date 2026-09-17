/* MARIE CREATION v2 · aloldal-motor: cover-parallax, sticky lépések hátralépése, Flip-szűrő a shopban */
(function () {
  'use strict';
  var reduce = window.__mcReduce !== undefined ? window.__mcReduce : matchMedia('(prefers-reduced-motion:reduce)').matches;
  var hasGSAP = typeof gsap !== 'undefined';
  if (!hasGSAP || reduce || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  /* full-bleed fejléc-kép: lassú parallax */
  document.querySelectorAll('[data-cover]').forEach(function (img) {
    var host = img.closest('.cover, figure') || img;
    gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none',
      scrollTrigger: { trigger: host, start: 'top top', end: 'bottom top', scrub: true } });
  });

  /* sticky lépések: az előző finoman hátralép, ahogy a következő rácsúszik */
  var steps = gsap.utils.toArray('.step');
  steps.forEach(function (s, i) {
    if (i === steps.length - 1) return;
    gsap.to(s.querySelector('.step__in'), { scale: 0.96, opacity: 0.55, ease: 'none',
      scrollTrigger: { trigger: steps[i + 1], start: 'top bottom', end: 'top top', scrub: true } });
  });

  /* sticky-split: a jobb oldali nagy kép a bal oszlop aktív blokkjához vált */
  var ss = document.querySelector('.ss');
  if (ss) {
    var pins = [].slice.call(ss.querySelectorAll('.ss__pin img'));
    var blocks = [].slice.call(ss.querySelectorAll('.ss__block'));
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = blocks.indexOf(e.target);
        pins.forEach(function (im, j) { im.classList.toggle('is-on', j === i); });
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    blocks.forEach(function (b) { io.observe(b); });
    /* a bal oszlop kis képei enyhén lassabban úsznak (parallax) */
    gsap.utils.toArray('.ss__block figure').forEach(function (f) {
      gsap.fromTo(f, { y: 30 }, { y: -30, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* zoom-galéria: közép → körülötte bejönnek → közép megnő, a többi eltűnik */
  var zg = document.querySelector('.zoomg');
  if (zg && innerWidth > 820) {
    var sats = gsap.utils.toArray('.zoomg__s'), c = zg.querySelector('.zoomg__c'), cap = zg.querySelector('.zoomg__cap');
    /* a közép a végén a teljes képernyőt fedi: a szükséges nagyítás a viewportból számolva */
    function fillScale() { var r = c.getBoundingClientRect(); var s = gsap.getProperty(c, 'scale') || 1; return Math.max(innerWidth / (r.width / s), innerHeight / (r.height / s)) * 1.04; }
    /* a szatellitek a középtől kifelé, a saját irányukból érkeznek, nem egy oszlopban */
    sats.forEach(function (s) { var r = s.getBoundingClientRect(); var dx = (r.left + r.width / 2) / innerWidth - 0.5, dy = (r.top + r.height / 2) / innerHeight - 0.5; s._ox = -dx * 36; s._oy = -dy * 36; });
    var tl = gsap.timeline({ scrollTrigger: { trigger: zg, start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true } });
    /* 1. a közép kicsiről nő, közben a részletek beúsznak köré */
    tl.fromTo(c, { scale: 0.42 }, { scale: 0.62, duration: 0.42, ease: 'power1.inOut' }, 0);
    sats.forEach(function (s, i) { tl.fromTo(s, { opacity: 0, x: s._ox, y: s._oy, scale: 0.9 }, { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.22, ease: 'power2.out' }, 0.06 + i * 0.035); });
    /* 2. rövid megállás */
    tl.to({}, { duration: 0.14 });
    /* 3. a részletek kifelé eltűnnek, a közép betölti a képernyőt, a felirat elhalványul */
    sats.forEach(function (s, i) { tl.to(s, { opacity: 0, x: s._ox * -2.2, y: s._oy * -2.2, scale: 0.92, duration: 0.2, ease: 'power2.in' }, 0.62 + i * 0.015); });
    
    tl.to(c, { scale: 1, duration: 0.36, ease: 'power2.inOut' }, 0.64);
  } else if (zg) { zg.classList.add('is-static'); }

  /* shop: szűrés és rács-sűrűség váltás. NEM Flip: a kártyák sosem esnek ki a folyamból,
     a lista magassága animálódik, így a következő szekció nem tud rácsúszni a rácsra. */
  var list = document.querySelector('.plist');
  if (list) {
    window.mcFlipList = function (apply) {
      var cards = [].slice.call(list.querySelectorAll('.pcard'));
      if (list.__busy) { list.__busy.kill(); list.__busy = null; }
      gsap.killTweensOf(cards); gsap.killTweensOf(list);
      gsap.set(cards, { clearProps: 'opacity,transform' });
      list.style.height = ''; list.style.overflow = '';
      var h0 = list.offsetHeight;
      var before = cards.filter(function (c) { return !c.hidden; });
      function done() {
        list.style.height = ''; list.style.overflow = ''; list.__busy = null;
        gsap.set(cards, { clearProps: 'opacity,transform' });
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      }
      var tl = gsap.timeline({ onComplete: done, onInterrupt: done });
      list.__busy = tl;
      tl.to(before, { opacity: 0, duration: 0.2, ease: 'power1.out', stagger: 0.012 });
      tl.call(function () {
        apply();
        var h1 = list.offsetHeight;
        var after = cards.filter(function (c) { return !c.hidden; });
        gsap.set(after, { opacity: 0, y: 12 });
        gsap.set(list, { height: h0, overflow: 'hidden' });
        tl.to(list, { height: h1, duration: 0.45, ease: 'power2.inOut' }, '>');
        tl.to(after, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.04 }, '<0.1');
      });
    };
  }
})();
