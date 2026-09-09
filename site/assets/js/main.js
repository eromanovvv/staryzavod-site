/* Прототип сайта пивоварни «Старый завод». Ванильный JS, без сборки. */
(function () {
  // ---------- возрастное подтверждение (18+) ----------
  var gate = document.getElementById('agegate');
  if (gate) {
    var ok = false;
    try { ok = localStorage.getItem('sz_age_ok') === '1'; } catch (e) {}
    if (ok) gate.hidden = true;
    var yes = gate.querySelector('[data-age-yes]');
    var no = gate.querySelector('[data-age-no]');
    if (yes) yes.addEventListener('click', function () {
      try { localStorage.setItem('sz_age_ok', '1'); } catch (e) {}
      gate.hidden = true;
    });
    if (no) no.addEventListener('click', function () { location.href = 'https://yandex.ru'; });
  }

  // ---------- мобильное меню ----------
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('nav.main');
  if (toggle && nav) toggle.addEventListener('click', function () { nav.classList.toggle('open'); });

  // ---------- подсветка активного пункта ----------
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.main a').forEach(function (a) {
    if (a.getAttribute('href') === here) a.classList.add('active');
  });

  // ---------- форма заявки ----------
  // В прототипе заявка не отправляется на сервер. Варианты подключения см. README:
  // Telegram-бот (fetch на api.telegram.org через свой прокси), Formspree, Yandex Forms, почта через хостинг.
  document.querySelectorAll('form.lead').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {};
      new FormData(f).forEach(function (v, k) { data[k] = v; });
      var text = 'Заявка с сайта staryzavod\n' + Object.keys(data).map(function (k) { return k + ': ' + data[k]; }).join('\n');
      console.log(text);
      var okBox = f.querySelector('.ok');
      if (okBox) {
        okBox.style.display = 'block';
        okBox.innerHTML = 'Спасибо! Заявка принята. Менеджер свяжется с вами в течение рабочего дня.' +
          ' <br><small>Прототип: письмо не отправлено. Дублировать в Telegram: <a target="_blank" rel="noopener" href="https://t.me/share/url?url=&text=' +
          encodeURIComponent(text) + '">открыть Telegram</a></small>';
      }
      f.querySelectorAll('input,textarea,select,button').forEach(function (el) { el.disabled = true; });
    });
  });

  // ---------- каталог ----------
  var catalog = document.getElementById('catalog');
  if (catalog) {
    var limit = parseInt(catalog.getAttribute('data-limit') || '0', 10);
    fetch('data/products.json').then(function (r) { return r.json(); }).then(function (j) {
      var items = j.products;
      var onTap = (j.on_tap || []);
      function render(cat) {
        var list = items.filter(function (p) { return cat === 'all' || p.category === cat || (p.tags || []).indexOf(cat) >= 0; });
        if (limit) list = list.slice(0, limit);
        catalog.innerHTML = list.map(function (p) {
          var specs = [];
          if (p.abv !== null && p.abv !== undefined) specs.push('Alc ' + String(p.abv).replace('.', ',') + '%');
          if (p.og) specs.push('OG ' + String(p.og).replace('.', ',') + '%');
          if (p.ibu) specs.push('IBU ' + p.ibu);
          return '<article class="product">' +
            '<div class="pic"><img loading="lazy" src="assets/img/products/' + p.image + '" alt="' + p.name + '"></div>' +
            '<div class="body">' +
            (onTap.indexOf(p.id) >= 0 ? '<span class="badge badge-tap">На кране в баре</span>' : '') +
            '<h3>' + p.name + '</h3><div class="style">' + p.style + '</div>' +
            '<div class="specs">' + specs.map(function (s) { return '<span class="spec">' + s + '</span>'; }).join('') + '</div>' +
            '<p>' + p.description + '</p>' +
            (p.pairing ? '<p class="muted" style="font-size:.82rem">К столу: ' + p.pairing + '</p>' : '') +
            '<p class="muted" style="font-size:.82rem;margin-top:auto">Тара: ' + (p.packaging || 'кег, бутылка 0,5 л') + '</p>' +
            '</div></article>';
        }).join('');
      }
      render('all');
      document.querySelectorAll('.filters .chip').forEach(function (c) {
        c.addEventListener('click', function () {
          document.querySelectorAll('.filters .chip').forEach(function (x) { x.classList.remove('active'); });
          c.classList.add('active');
          render(c.getAttribute('data-cat'));
        });
      });
    });
  }

  // ---------- точки продаж ----------
  var points = document.getElementById('points');
  if (points) {
    fetch('data/points.json').then(function (r) { return r.json(); }).then(function (j) {
      var q = document.getElementById('points-q');
      var city = document.getElementById('points-city');
      var count = document.getElementById('points-count');
      function cityOf(addr) {
        if (/^Москва/.test(addr)) return 'Москва';
        if (/^Московск/.test(addr)) return 'Московская область';
        if (/^Рязань/.test(addr)) return 'Рязань';
        return 'Рязанская область';
      }
      function render() {
        var qq = (q.value || '').toLowerCase();
        var cc = city.value;
        var total = 0;
        var html = j.groups.map(function (g) {
          var pts = g.points.filter(function (a) {
            return (cc === 'all' || cityOf(a) === cc) && (!qq || a.toLowerCase().indexOf(qq) >= 0 || g.chain.toLowerCase().indexOf(qq) >= 0);
          });
          if (!pts.length) return '';
          total += pts.length;
          return '<div class="chain"><h3>' + g.chain + ' <small>' + pts.length + '</small></h3><ul>' +
            pts.map(function (a) { return '<li>' + a + '</li>'; }).join('') + '</ul></div>';
        }).join('');
        points.innerHTML = html || '<p class="muted">Ничего не найдено.</p>';
        if (count) count.textContent = total;
      }
      q.addEventListener('input', render);
      city.addEventListener('change', render);
      render();
    });
  }
})();
