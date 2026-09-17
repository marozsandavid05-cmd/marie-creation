/* =====================================================================
   MARIE CREATION · webshop motor (kosár localStorage, file:// kompatibilis)
   ===================================================================== */
(function () {
  'use strict';
  var P = window.MC_PRODUCTS || [];
  var KEY = 'mc_cart_v1';

  function ft(n) { return n.toLocaleString('hu-HU') + ' Ft'; }
  function getCart() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function setCart(c) {
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    renderBadge(); renderPanel();
  }
  function prod(id) { return P.find(function (p) { return p.id === id; }); }
  function cartTotal(c) {
    return c.reduce(function (s, it) { var p = prod(it.id); return p ? s + p.price * it.q : s; }, 0);
  }

  window.mcCart = {
    add: function (id, q) {
      var c = getCart();
      var row = c.find(function (it) { return it.id === id; });
      if (row) row.q += (q || 1); else c.push({ id: id, q: q || 1 });
      setCart(c);
      var p = prod(id);
      if (window.mcToast && p) mcToast(p.name + ' a kosárba került');
      openPanel();
    },
    setQ: function (id, q) {
      var c = getCart();
      var row = c.find(function (it) { return it.id === id; });
      if (!row) return;
      row.q = Math.max(0, q);
      setCart(c.filter(function (it) { return it.q > 0; }));
    },
    remove: function (id) {
      setCart(getCart().filter(function (it) { return it.id !== id; }));
    },
    clear: function () { setCart([]); },
    items: getCart,
    total: function () { return cartTotal(getCart()); }
  };

  /* ---------- badge ---------- */
  function renderBadge() {
    var n = getCart().reduce(function (s, it) { return s + it.q; }, 0);
    document.querySelectorAll('.nav__cart-badge').forEach(function (b) {
      b.textContent = n > 0 ? n : '';
    });
  }

  /* ---------- kosár-panel ---------- */
  function openPanel() {
    var p = document.querySelector('.cartp'), v = document.querySelector('.cart-veil');
    if (!p) return;
    p.classList.add('is-open'); if (v) v.classList.add('is-open');
    if (window.__lenis) window.__lenis.stop();
  }
  function closePanel() {
    var p = document.querySelector('.cartp'), v = document.querySelector('.cart-veil');
    if (!p) return;
    p.classList.remove('is-open'); if (v) v.classList.remove('is-open');
    if (window.__lenis) window.__lenis.start();
  }
  window.mcOpenCart = openPanel;

  function renderPanel() {
    var wrap = document.querySelector('.cartp__items');
    if (!wrap) return;
    var c = getCart();
    if (!c.length) {
      wrap.innerHTML = '<p class="cartp__empty">A kosár még üres.<br>Nézzen körül a kollekcióban.</p>';
    } else {
      wrap.innerHTML = c.map(function (it) {
        var p = prod(it.id); if (!p) return '';
        return '<div class="citem">' +
          '<img src="' + p.img + '" alt="' + p.name + '">' +
          '<div><div class="citem__name">' + p.name + '</div>' +
          '<div class="citem__price">' + ft(p.price) + '</div>' +
          '<div class="citem__qty">' +
          '<button aria-label="Kevesebb" onclick="mcCart.setQ(\'' + p.id + '\',' + (it.q - 1) + ')">-</button>' +
          '<span>' + it.q + '</span>' +
          '<button aria-label="Több" onclick="mcCart.setQ(\'' + p.id + '\',' + (it.q + 1) + ')">+</button>' +
          '</div></div>' +
          '<button class="citem__rm" onclick="mcCart.remove(\'' + p.id + '\')">Törlés</button>' +
          '</div>';
      }).join('');
    }
    var tot = document.querySelector('.cartp__sum');
    if (tot) tot.textContent = ft(cartTotal(c));
    var go = document.querySelector('.cartp__go');
    if (go) go.style.display = c.length ? '' : 'none';
  }

  /* ---------- shop lista ---------- */
  function renderList(cat) {
    var list = document.querySelector('.plist');
    if (!list) return;
    /* egyszer renderelünk mindent, a szűrés hidden-nel (Flip-kompatibilis) */
    if (list.children.length) {
      var apply = function () {
        list.querySelectorAll('.pcard').forEach(function (el) {
          el.hidden = !(cat === 'mind' || !cat || el.dataset.cat === cat);
        });
      };
      if (window.mcFlipList) window.mcFlipList(apply); else apply();
      return;
    }
    var items = P;
    list.innerHTML = items.map(function (p) {
      var catName = (window.MC_CATS.find(function (c) { return c.id === p.cat; }) || {}).name || '';
      return '<a class="pcard" data-cat="' + p.cat + '" href="termek.html?id=' + p.id + '">' +
        '<figure><img src="' + p.img + '" alt="' + p.name + '" loading="lazy"></figure>' +
        '<div class="pcard__meta"><span class="pcard__name">' + p.name + '</span>' +
        '<span class="pcard__price">' + ft(p.price) + '</span></div>' +
        '<div class="pcard__cat">' + catName + '</div></a>';
    }).join('');
  }

  /* filter gombok */
  var filterWrap = document.querySelector('.shop-filter');
  if (filterWrap) {
    filterWrap.innerHTML = window.MC_CATS.map(function (c, i) {
      return '<button data-cat="' + c.id + '" class="' + (i === 0 ? 'is-on' : '') + '">' + c.name + '</button>';
    }).join('');
    filterWrap.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      filterWrap.querySelectorAll('button').forEach(function (x) { x.classList.remove('is-on'); });
      b.classList.add('is-on');
      renderList(b.dataset.cat);
    });
    renderList('mind');
  }

  /* ---------- termékoldal ---------- */
  var det = document.querySelector('.pdet');
  if (det) {
    var id = new URLSearchParams(location.search).get('id') || (P[0] && P[0].id);
    var p = prod(id) || P[0];
    if (p) {
      document.title = p.name + ' · Marie Creation';
      det.querySelector('.pdet__img').src = p.img;
      det.querySelector('.pdet__img').alt = p.name;
      det.querySelector('.pdet__name').textContent = p.name;
      det.querySelector('.pdet__price').textContent = ft(p.price);
      det.querySelector('.pdet__desc').textContent = p.desc;
      det.querySelector('.pdet__note').textContent = p.note;
      var qtyIn = det.querySelector('.qty input');
      det.querySelector('.qty__minus').addEventListener('click', function () {
        qtyIn.value = Math.max(1, +qtyIn.value - 1);
      });
      det.querySelector('.qty__plus').addEventListener('click', function () {
        qtyIn.value = +qtyIn.value + 1;
      });
      det.querySelector('.pdet__add').addEventListener('click', function () {
        mcCart.add(p.id, Math.max(1, +qtyIn.value || 1));
      });
      /* kapcsolódó termékek */
      var rel = document.querySelector('.plist--rel');
      if (rel) {
        var others = P.filter(function (x) { return x.id !== p.id && x.cat === p.cat; });
        if (others.length < 3) {
          others = others.concat(P.filter(function (x) { return x.id !== p.id && x.cat !== p.cat; }));
        }
        rel.innerHTML = others.slice(0, 3).map(function (r) {
          return '<a class="pcard" href="termek.html?id=' + r.id + '">' +
            '<figure><img src="' + r.img + '" alt="' + r.name + '" loading="lazy"></figure>' +
            '<div class="pcard__meta"><span class="pcard__name">' + r.name + '</span>' +
            '<span class="pcard__price">' + ft(r.price) + '</span></div></a>';
        }).join('');
      }
    }
  }

  /* ---------- pénztár (kosar.html) ---------- */
  var co = document.querySelector('.checkout');
  if (co) {
    var listEl = co.querySelector('.co-items');
    var sumEl = co.querySelector('.co-sum');
    function renderCo() {
      var c = getCart();
      if (!c.length) {
        co.querySelector('.co-full').style.display = 'none';
        co.querySelector('.co-empty').style.display = '';
        return;
      }
      listEl.innerHTML = c.map(function (it) {
        var p = prod(it.id); if (!p) return '';
        return '<div class="citem"><img src="' + p.img + '" alt="' + p.name + '">' +
          '<div><div class="citem__name">' + p.name + '</div>' +
          '<div class="citem__price">' + it.q + ' × ' + ft(p.price) + '</div></div>' +
          '<strong>' + ft(p.price * it.q) + '</strong></div>';
      }).join('');
      sumEl.textContent = ft(cartTotal(c));
    }
    renderCo();

    var form = co.querySelector('form');
    /* Web3Forms kulcs: élesítéskor Mariann email-címére generálva ide kerül.
       Amíg üres, a megrendelés MINTA módban fut (nem megy ki email). */
    var W3F_KEY = '';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var c = getCart();
      if (!c.length) return;
      var data = new FormData(form);
      var lines = c.map(function (it) {
        var p = prod(it.id);
        return p ? (p.name + ' | ' + it.q + ' db | ' + ft(p.price * it.q)) : '';
      }).join('\n');
      var msg = 'MEGRENDELÉS\n\n' + lines + '\n\nÖsszesen: ' + ft(cartTotal(c)) +
        '\n\nNév: ' + data.get('nev') + '\nEmail: ' + data.get('email') +
        '\nTelefon: ' + data.get('telefon') + '\nCím: ' + data.get('cim') +
        '\nMegjegyzés: ' + (data.get('uzenet') || '');
      var done = function () {
        mcCart.clear();
        co.querySelector('.co-full').style.display = 'none';
        co.querySelector('.co-done').style.display = '';
        window.scrollTo(0, 0);
      };
      if (!W3F_KEY) {
        console.log('[MINTA MÓD] Megrendelés:', msg);
        done();
        return;
      }
      var btn = form.querySelector('button[type=submit]');
      btn.disabled = true; btn.textContent = 'Küldés folyamatban';
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: W3F_KEY,
          subject: 'Új megrendelés a mariecreation.hu oldalról',
          from_name: data.get('nev'),
          email: data.get('email'),
          message: msg
        })
      }).then(function (r) { return r.json(); }).then(function (r) {
        if (r.success) done();
        else { mcToast('A küldés nem sikerült, próbálja újra'); btn.disabled = false; btn.textContent = 'Megrendelés elküldése'; }
      }).catch(function () {
        mcToast('A küldés nem sikerült, próbálja újra');
        btn.disabled = false; btn.textContent = 'Megrendelés elküldése';
      });
    });
  }

  /* ---------- panel gombok bekötése ---------- */
  document.querySelectorAll('.nav__cart').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); openPanel(); });
  });
  var closeBtn = document.querySelector('.cartp__close');
  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  var veil = document.querySelector('.cart-veil');
  if (veil) veil.addEventListener('click', closePanel);

  renderBadge(); renderPanel();
})();
