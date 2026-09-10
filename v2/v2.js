/* Версия 2: карусель, бегущая фотолента, появление секций, форма. Без зависимостей. */
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

  // header shadow + burger
  var hdr = document.querySelector('.hdr');
  window.addEventListener('scroll', function () { hdr.classList.toggle('scrolled', window.scrollY > 10); }, { passive: true });
  var burger = document.querySelector('.burger'), nav = document.querySelector('.hdr nav');
  if (burger) burger.addEventListener('click', function () { nav.classList.toggle('open'); });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); }); });

  // reveal on scroll (только заголовочные блоки секций)
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  // marquee: дублируем содержимое для бесшовной прокрутки
  document.querySelectorAll('.marquee .row').forEach(function (row) {
    row.innerHTML += row.innerHTML;
  });

  // products carousel
  var track = document.getElementById('track');
  if (track) {
    fetch('../data/products.json').then(function (r) { return r.json(); }).then(function (j) {
      var cats = {}; j.categories.forEach(function (c) { cats[c.id] = c; });
      function specs(p) {
        var s = [];
        if (p.abv !== null && p.abv !== undefined) s.push(['ALC', String(p.abv).replace('.', ',') + '%']);
        if (p.og) s.push(['OG', String(p.og).replace('.', ',') + '%']);
        if (p.ibu) s.push(['IBU', p.ibu]);
        return s;
      }
      function pack(p) {
        var parts = (p.packaging || []).map(function (k) { return j.packaging_all[k]; });
        if (p.packaging_note) parts.push(p.packaging_note);
        return parts.join(', ');
      }
      function render(cat) {
        var list = j.products.filter(function (p) { return p.image && (cat === 'all' || p.category === cat); });
        var html = list.map(function (p) {
          return '<article class="pcard">' +
            '<div class="pic"><img loading="lazy" src="../assets/img/products/' + p.image + '" alt="' + p.title + '"></div>' +
            '<div class="cat">' + cats[p.category].title + '</div>' +
            '<h3>' + p.name + '</h3><div class="style">' + p.style + '</div>' +
            '<div class="specs">' + specs(p).map(function (s) { return '<span><b>' + s[0] + '</b>' + s[1] + '</span>'; }).join('') + '</div>' +
            '<p>' + p.description + '</p>' +
            '<div class="pack">' + pack(p) + (p.shelf ? '. Хранение ' + j.storage + ', ' + p.shelf : '') + '</div>' +
            '</article>';
        }).join('');
        if (cat === 'all' || cat === 'schorle' || cat === 'national') {
          html += '<article class="pcard soon"><div><div class="cat">Скоро</div><h3>Шорли, квас, сбитень</h3><p>Безалкогольные и национальные напитки брожения. Уже сейчас варим под вашей маркой.</p><a class="textlink" href="#business">Обсудить</a></div></article>';
        }
        track.innerHTML = html;
        track.scrollTo({ left: 0, behavior: 'auto' });
      }
      render('all');
      document.querySelectorAll('.tab').forEach(function (t) {
        t.addEventListener('click', function () {
          document.querySelectorAll('.tab').forEach(function (x) { x.classList.remove('active'); });
          t.classList.add('active'); render(t.getAttribute('data-cat'));
        });
      });
    });
    // arrows
    document.querySelectorAll('.arrow').forEach(function (a) {
      a.addEventListener('click', function () {
        var card = track.querySelector('.pcard');
        var step = card ? card.getBoundingClientRect().width + 18 : 320;
        track.scrollBy({ left: a.dataset.dir === 'next' ? step : -step, behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    // drag to scroll
    var down = false, startX = 0, startL = 0;
    track.addEventListener('pointerdown', function (e) { down = true; startX = e.clientX; startL = track.scrollLeft; track.classList.add('dragging'); });
    window.addEventListener('pointerup', function () { down = false; track.classList.remove('dragging'); });
    track.addEventListener('pointermove', function (e) { if (down) track.scrollLeft = startL - (e.clientX - startX); });
  }

  // form (прототип: не отправляет)
  document.querySelectorAll('form.lead').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {}; new FormData(f).forEach(function (v, k) { data[k] = v; });
      var text = 'Заявка с сайта staryzavod (v2)\n' + Object.keys(data).map(function (k) { return k + ': ' + data[k]; }).join('\n');
      var ok = f.querySelector('.ok');
      ok.style.display = 'block';
      ok.innerHTML = 'Заявка принята, ответим в течение рабочего дня. <br><small>Прототип: письмо не отправлено. <a target="_blank" rel="noopener" href="https://t.me/share/url?url=&text=' + encodeURIComponent(text) + '">Продублировать в Telegram</a></small>';
      f.querySelectorAll('input,textarea,select,button').forEach(function (el) { el.disabled = true; });
    });
  });
})();
