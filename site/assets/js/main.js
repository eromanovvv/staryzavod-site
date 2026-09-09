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
  // В прототипе заявка не отправляется на сервер. Варианты подключения см. README.
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
        okBox.innerHTML = 'Спасибо! Заявка принята. Ответим в течение рабочего дня.' +
          ' <br><small>Прототип: письмо не отправлено. Дублировать в Telegram: <a target="_blank" rel="noopener" href="https://t.me/share/url?url=&text=' +
          encodeURIComponent(text) + '">открыть Telegram</a></small>';
      }
      f.querySelectorAll('input,textarea,select,button').forEach(function (el) { el.disabled = true; });
    });
  });

  // ---------- каталог ----------
  function specsOf(p) {
    var s = [];
    if (p.abv !== null && p.abv !== undefined) s.push('ALC ' + String(p.abv).replace('.', ',') + '%');
    if (p.og) s.push('OG ' + String(p.og).replace('.', ',') + '%');
    if (p.ibu) s.push('IBU ' + p.ibu);
    return s;
  }
  function packOf(p, all) {
    var parts = (p.packaging || []).map(function (k) { return all[k]; });
    if (p.packaging_note) parts.push(p.packaging_note);
    return parts.join(', ');
  }
  function card(p, j, cat) {
    return '<article class="product">' +
      (p.image ? '<div class="pic"><img loading="lazy" src="assets/img/products/' + p.image + '" alt="' + p.title + '"></div>'
               : '<div class="pic empty">Фото появится</div>') +
      '<div class="body">' +
      '<span class="kicker">' + (cat ? cat.title : '') + (p.on_request ? ', под заказ' : '') + '</span>' +
      '<h3>' + p.title + '</h3><div class="style">' + p.style + '</div>' +
      '<div class="specs">' + specsOf(p).map(function (s) { return '<span class="spec">' + s + '</span>'; }).join('') + '</div>' +
      '<p>' + p.description + '</p>' +
      '<div class="pack">' + packOf(p, j.packaging_all) + (p.shelf ? '<br>Хранение ' + j.storage + ', ' + p.shelf : '') + '</div>' +
      '</div></article>';
  }

  var catalog = document.getElementById('catalog');           // плоский список (главная)
  var grouped = document.getElementById('catalog-grouped');   // по категориям (страница «Продукция»)
  if (catalog || grouped) {
    fetch('data/products.json').then(function (r) { return r.json(); }).then(function (j) {
      var cats = {}; j.categories.forEach(function (c) { cats[c.id] = c; });
      if (catalog) {
        var limit = parseInt(catalog.getAttribute('data-limit') || '0', 10);
        var list = j.products.filter(function (p) { return p.image; });
        if (limit) list = list.slice(0, limit);
        catalog.innerHTML = list.map(function (p) { return card(p, j, cats[p.category]); }).join('');
      }
      if (grouped) {
        grouped.innerHTML = j.categories.map(function (c, i) {
          var items = j.products.filter(function (p) { return p.category === c.id; });
          var body = c.soon
            ? '<div class="card soon"><span class="tag tag-soft">Скоро</span><p style="margin:12px 0 0">' + c.intro + ' <a href="business.html#stm">Обсудить выпуск под вашей маркой</a></p></div>'
            : '<div class="products">' + items.map(function (p) { return card(p, j, c); }).join('') + '</div>';
          var photo = c.photo ? '<img class="cat-photo" loading="lazy" src="assets/img/photos/' + c.photo + '" alt="' + (c.photo_alt || c.title) + '">' : '';
          return '<section class="cat-block" id="cat-' + c.id + '"><div class="head"><div class="n">0' + (i + 1) + '</div><div><h2 style="margin:0">' + c.title + '</h2><p>' + c.intro + '</p></div></div>' + photo + body + '</section>';
        }).join('');
        if (location.hash) {
          var target = document.getElementById(location.hash.slice(1));
          if (target) setTimeout(function () { window.scrollTo({ top: target.offsetTop - 96, behavior: 'instant' }); }, 50);
        }
      }
    });
  }

  // ---------- розница: сеть «Дом пива» ----------
  var retail = document.getElementById('retail-list');
  if (retail) {
    fetch('data/retail.json').then(function (r) { return r.json(); }).then(function (j) {
      retail.innerHTML = j.addresses.map(function (a) { return '<li>Рязань, ' + a + '</li>'; }).join('');
      var c = document.getElementById('retail-count'); if (c) c.textContent = j.branches_total_2gis;
    });
  }
})();
