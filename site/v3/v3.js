/* Версия 3: развороты напитков из data/products.json, появление глав, форма. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 18+
  var gate = document.getElementById('agegate');
  if (gate) {
    try { if (localStorage.getItem('sz_age_ok') === '1') gate.hidden = true; } catch (e) {}
    gate.querySelector('[data-yes]').addEventListener('click', function () {
      try { localStorage.setItem('sz_age_ok', '1'); } catch (e) {}
      gate.hidden = true;
    });
    gate.querySelector('[data-no]').addEventListener('click', function () { location.href = 'https://yandex.ru'; });
  }

  // header: прозрачная над обложкой, плотная дальше
  var hdr = document.querySelector('.hdr'), hero = document.querySelector('.hero');
  function onScroll() {
    if (!hero) return;
    var past = window.scrollY > 40;
    hdr.classList.toggle('solid', past); hdr.classList.toggle('over', !past);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var burger = document.querySelector('.burger'), nav = document.querySelector('.hdr nav');
  burger.addEventListener('click', function () { nav.classList.toggle('open'); });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); }); });

  // reveal
  var io = ('IntersectionObserver' in window && !reduce) ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' }) : null;
  function watch(el) { if (io && !document.hidden) io.observe(el); else el.classList.add('in'); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) document.querySelectorAll('.reveal, .place, .spread').forEach(function (el) { el.classList.add('in'); }); });
  document.querySelectorAll('.reveal, .place, .spread').forEach(watch);

  // развороты напитков: цвет фона из этикетки
  var palette = {
    lager:     { bg: '#d6ddd0', ink: '#151b17', note: 'Светлое, лёгкое, с цветочной ноткой в аромате. То пиво, которое заказывают вторым.' },
    weizen:    { bg: '#e6d39a', ink: '#2a2413', note: 'Банан и гвоздика в носу, как положено немецкому пшеничному. Питкое до последнего глотка.' },
    ryazmarin: { bg: '#b3c6a8', ink: '#15201a', note: 'Отвар розмарина и сухое охмеление. Наш самый узнаваемый сорт: пахнет садом и хвоей.' },
    gulyaka:   { bg: '#c4622f', ink: '#fbf3e6', note: 'Пэйл-эль с травянистыми и фруктовыми нотами. На этикетке портрет рязанского поэта.' },
    stout:     { bg: '#221e1b', ink: '#efe9df', note: 'Сухой ирландский стаут: кофе и шоколад, плотная пена, никакой сладости.' },
    cider:     { bg: '#d7c093', ink: '#2a2413', note: 'Сок прямого отжима из яблок с рязанской земли, без сахара и концентратов. Сухой.' },
    mead:      { bg: '#dfa63d', ink: '#2a1e0a', note: 'Полусухая, на цветочном мёде рязанских пасек. Начинается с запаха яблока с мёдом.' },
    schorle:   { bg: '#cfe0d6', ink: '#15201a', note: 'Минеральная вода с натуральным соком, без алкоголя. На кране в баре, для партнёров под заказ.' },
    kvas:      { bg: '#8a5a34', ink: '#fbf3e6', note: 'Традиционный квас брожения. Готовим к выпуску, под вашей маркой сварим уже сейчас.' },
    sbiten:    { bg: '#b8733a', ink: '#fbf3e6', note: 'Мёд и пряности, горячий зимой и холодный летом. Готовим к выпуску.' }
  };
  var roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  // виды для карусели на главной
  var kinds = {
    beer:      { title: 'Пиво и пивные напитки', cats: ['beer'] },
    cidermead: { title: 'Сидры и миды', cats: ['cider', 'mead'] },
    soft:      { title: 'Безалкогольные напитки', cats: ['schorle', 'national'] }
  };
  var host = document.getElementById('spreads');
  var car = document.getElementById('carousel');
  var data = (host || car) ? fetch('../data/products.json').then(function (r) { return r.json(); }) : null;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  // якорь из адреса ведёт на элемент, которого в момент загрузки ещё нет (развороты рисуются после fetch):
  // после отрисовки прокручиваем сами, с поправкой на липкую шапку
  function jumpToHash() {
    var id = decodeURIComponent((location.hash || '').slice(1));
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.scrollY - (hdr ? hdr.offsetHeight : 0);
    window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
  }
  function fmt(n) { return String(n).replace('.', ','); }

  if (car) {
    data.then(function (j) {
      var cats = {}; j.categories.forEach(function (c) { cats[c.id] = c; });
      var track = car.querySelector('.track');
      function card(p, i) {
        var c = palette[p.id] || { bg: '#dde3d9', ink: '#151b17', note: p.description };
        var meta = [];
        if (p.abv) meta.push(fmt(p.abv) + ' %'); else if (p.abv === 0) meta.push('без алкоголя');
        if (p.ibu) meta.push('IBU ' + p.ibu);
        var tag = p.soon ? '<span class="tag">Скоро</span>' : (p.on_request ? '<span class="tag">Под заказ</span>' : '');
        var pic = p.image
          ? '<img loading="lazy" src="../assets/img/products/' + p.image + '" alt="' + esc(p.title) + '">'
          : '<div class="noimg" aria-hidden="true"><span>' + esc(p.name.charAt(0)) + '</span></div>';
        var href = p.image ? 'products.html#p-' + p.id : (p.soon || p.on_request ? 'contract.html' : 'products.html');
        return '<a class="card" href="' + href + '" style="--s-bg:' + c.bg + ';--s-ink:' + c.ink + '" data-n="' + roman[i] + '">' +
          '<div class="pic">' + pic + '</div>' +
          '<div class="body"><div class="kind">' + esc(cats[p.category].title) + tag + '</div><h3>' + esc(p.name) + '</h3>' +
          '<div class="style">' + esc(p.style) + '</div><p>' + esc(c.note) + '</p>' +
          (meta.length ? '<div class="meta">' + meta.join(' · ') + '</div>' : '') + '</div></a>';
      }
      function show(kind) {
        var list = j.products.filter(function (p) { return kinds[kind].cats.indexOf(p.category) >= 0; });
        track.innerHTML = list.map(card).join('');
        track.scrollTo({ left: 0 });
        car.setAttribute('data-kind', kind);
        document.querySelectorAll('.kind-tab').forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-kind') === kind ? 'true' : 'false'); });
        update();
      }
      function update() {
        var max = track.scrollWidth - track.clientWidth - 2;
        car.querySelector('.prev').disabled = track.scrollLeft <= 2;
        car.querySelector('.next').disabled = track.scrollLeft >= max;
      }
      function step() { var c = track.querySelector('.card'); return c ? c.getBoundingClientRect().width + 16 : 320; }
      car.querySelector('.prev').addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
      car.querySelector('.next').addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
      track.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      document.querySelectorAll('.kind-tab').forEach(function (b) { b.addEventListener('click', function () { show(b.getAttribute('data-kind')); }); });
      var start = (location.hash || '').replace('#kind-', '');
      show(kinds[start] ? start : 'beer');
    });
  }

  if (host) {
    data.then(function (j) {
      var cats = {}; j.categories.forEach(function (c) { cats[c.id] = c; });
      var list = j.products.filter(function (p) { return p.image && palette[p.id]; });
      var limit = parseInt(host.getAttribute('data-limit') || '0', 10); if (limit) list = list.slice(0, limit);
      host.innerHTML = list.map(function (p, i) {
        var c = palette[p.id];
        var rows = [];
        if (p.abv !== null) rows.push(['Алк.', String(p.abv).replace('.', ',') + ' %']);
        if (p.og) rows.push(['Плотность', String(p.og).replace('.', ',') + ' %']);
        if (p.ibu) rows.push(['Горечь', 'IBU ' + p.ibu]);
        if (p.shelf) rows.push(['Хранение', j.storage + ', ' + p.shelf]);
        var pack = (p.packaging || []).map(function (k) { return j.packaging_all[k]; });
        if (p.packaging_note) pack.push(p.packaging_note);
        return '<section class="spread' + (i % 2 ? ' rev' : '') + '" id="p-' + p.id + '" style="--s-bg:' + c.bg + ';--s-ink:' + c.ink + '">' +
          '<div class="wrap">' +
          '<div class="bottle" data-n="' + roman[i] + '"><img loading="lazy" src="../assets/img/products/' + p.image + '" alt="' + p.title + '"></div>' +
          '<div><div class="kind">' + cats[p.category].title + '</div><h2>' + p.name + '</h2><div class="style">' + p.style + '</div>' +
          '<p class="note">' + c.note + '</p>' +
          '<table>' + rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('') + '</table>' +
          '<p class="pack">Фасовка: ' + pack.join(', ') + '.</p>' +
          '</div></div></section>';
      }).join('');
      host.querySelectorAll('.spread').forEach(watch);
      jumpToHash();
      window.addEventListener('hashchange', jumpToHash);
    });
  }

  // форма: заявка уходит готовым сообщением в WhatsApp отдела продаж или письмом
  var SALES_WA = '79105686802', SALES_MAIL = 'prussakov10@gmail.com';
  function collect(f) {
    var lines = [];
    new FormData(f).forEach(function (v, k) { if (String(v).trim()) lines.push(k + ': ' + v); });
    return 'Заявка с сайта «Старый завод»\n' + lines.join('\n');
  }
  document.querySelectorAll('form.lead').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = collect(f);
      window.open('https://wa.me/' + SALES_WA + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      var ok = f.querySelector('.ok'); ok.style.display = 'block';
      ok.innerHTML = 'Открыли WhatsApp с текстом заявки. Если окно не появилось, <a style="color:#fff" target="_blank" rel="noopener" href="https://wa.me/' + SALES_WA + '?text=' + encodeURIComponent(text) + '">нажмите сюда</a> или <a style="color:#fff" href="mailto:' + SALES_MAIL + '?subject=' + encodeURIComponent('Заявка с сайта') + '&body=' + encodeURIComponent(text) + '">отправьте на почту</a>.';
    });
    var mail = f.querySelector('[data-mail]');
    if (mail) mail.addEventListener('click', function () {
      if (!f.reportValidity()) return;
      var text = collect(f);
      location.href = 'mailto:' + SALES_MAIL + '?subject=' + encodeURIComponent('Заявка с сайта «Старый завод»') + '&body=' + encodeURIComponent(text);
    });
  });

  // розница: сеть «Дом пива»
  var retail = document.getElementById('retail-list');
  if (retail) {
    fetch('../data/retail.json').then(function (r) { return r.json(); }).then(function (j) {
      retail.innerHTML = j.addresses.map(function (a) { return '<li>Рязань, ' + a + '</li>'; }).join('');
      var c = document.getElementById('retail-count'); if (c) c.textContent = j.branches_total_2gis;
    });
  }

  // цели для Метрики: data-goal="tel|messenger|pdf" (подключить после установки счётчика)
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-goal]');
    if (a && window.ym && window.YM_ID) ym(window.YM_ID, 'reachGoal', a.getAttribute('data-goal'));
  });
})();
