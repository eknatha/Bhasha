/* Fun and family: Proverbs and idioms, Tongue twisters, Kids corner (picture games). */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set;
  B.views = B.views || {};
  function alive() { return !!document.getElementById('kd-back'); }
  function shuffle(a) { return a.slice().sort(function () { return Math.random() - 0.5; }); }
  function rom(txt, lang) { return B.isBrahmic(txt) ? B.translit(txt, set.scheme, lang) : ''; }
  function dayNo() { var d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }
  function langSel(id, cur, fn) {
    var s = h('select', { id: id, 'aria-label': t('language') }, B.LEARN.map(function (l) { return h('option', { value: l, text: U.langNative(l) + ' · ' + U.langName(l) }); })); s.value = cur;
    s.addEventListener('change', function () { fn(s.value); });
    return h('div', { class: 'tools' }, [h('div', { class: 'tf' }, [h('label', { for: id, text: t('language') }), s])]);
  }
  function audioBtns(txt, lang, label) {
    return h('div', { class: 'ph-a' }, [
      h('button', { type: 'button', class: 'abtn', 'aria-label': t('speak') + ': ' + label, text: '🔊', onclick: function () { U.speak(txt, lang, null, set.rate); } }),
      h('button', { type: 'button', class: 'abtn', 'aria-label': t('slow') + ': ' + label, text: '🐢', onclick: function () { U.speak(txt, lang, null, 0.55, true); } })]);
  }

  // ---------------- Proverbs and idioms
  var PR = { lang: null, i: 0, all: false };
  B.views.proverbs = function (app) {
    app.textContent = ''; PR.lang = PR.lang || set.focus; var lang = PR.lang, list = B.PROVERBS[lang] || [];
    app.appendChild(h('h1', { text: t('prH') })); app.appendChild(h('p', { class: 'lede', text: t('prLede') }));
    app.appendChild(langSel('pr-lang', lang, function (v) { PR.lang = v; PR.i = 0; B.views.proverbs(app); }));
    var today = (dayNo() + PR.i) % list.length, it = list[today], r = rom(it[0], lang);
    var card = h('section', { class: 'panel saying', id: 'pr-today' }, [
      h('h2', { text: t('prToday') }), h('span', { class: 'chip', text: t(it[2] === 'i' ? 'prI' : 'prP') }),
      h('p', { class: 'ph-t big', lang: lang, text: it[0] }), r ? h('p', { class: 'ph-r', text: r }) : null,
      h('p', { class: 'ph-n' }, [h('b', { text: t('prMeaning') + ': ' }), it[1]]), audioBtns(it[0], lang, it[1]),
      h('div', { class: 'acts', id: 'pr-acts' }, [h('button', { type: 'button', class: 'abtn gold', id: 'pr-next', text: t('prAnother'), onclick: function () { PR.i++; B.views.proverbs(app); var n = document.getElementById('pr-next'); if (n) n.focus(); } })])]);
    app.appendChild(card); if (B.fx) B.fx.enter(card);
    card.querySelector('#pr-acts').appendChild(U.pronToggle(card, it[0], lang));
    var all = h('section', { class: 'panel' }, [h('h2', { text: t('prAll') })]);
    list.forEach(function (x) {
      var rr = rom(x[0], lang), row = h('div', { class: 'ph', 'data-saying': '1' }, [h('div', { class: 'ph-main' }, [h('div', { class: 'ph-t', lang: lang, text: x[0] }), rr ? h('div', { class: 'ph-r', text: rr }) : null, h('div', { class: 'ph-n', text: x[1] })])]);
      var a = audioBtns(x[0], lang, x[1]); a.appendChild(h('span', { class: 'chip', text: t(x[2] === 'i' ? 'prI' : 'prP') })); row.appendChild(a); all.appendChild(row);
    });
    app.appendChild(all);
  };

  // ---------------- Tongue twisters
  var TW = { lang: null };
  B.views.twisters = function (app) {
    app.textContent = ''; TW.lang = TW.lang || set.focus; var lang = TW.lang, list = B.TWISTERS[lang] || [];
    app.appendChild(h('h1', { text: t('twH') })); app.appendChild(h('p', { class: 'lede', text: t('twLede') }));
    app.appendChild(langSel('tw-lang', lang, function (v) { TW.lang = v; B.views.twisters(app); }));
    list.forEach(function (x) {
      var r = rom(x[0], lang), card = h('section', { class: 'panel twister', 'data-twister': '1' }, [
        h('p', { class: 'ph-t big', lang: lang, text: x[0] }), r ? h('p', { class: 'ph-r', text: r }) : null, h('p', { class: 'ph-n', text: x[1] })]);
      var row = h('div', { class: 'acts' });
      [['twSlow', 0.55, '🐢'], ['twNormal', 0.9, '🔊'], ['twFast', 1.2, '⚡']].forEach(function (sp) {
        row.appendChild(h('button', { type: 'button', class: 'abtn', 'data-speed': String(sp[1]), text: sp[2] + ' ' + t(sp[0]), onclick: function () { U.speak(x[0], lang, null, sp[1], true); } }));
      });
      row.appendChild(U.pronToggle(card, x[0], lang)); card.appendChild(row); app.appendChild(card);
    });
  };

  // ---------------- Kids corner
  var KD = { lang: null, cat: 'all', game: null, stars: 0, round: 0, seq: [], busy: false, first: true, pairs: null, flipped: [], matched: 0 };
  function pool() { var w = B.KIDS.words; return KD.cat === 'all' ? w : w.filter(function (x) { return x.cat === KD.cat; }); }
  function wordRom(w) { return rom(w[KD.lang], KD.lang); }
  B.views.kids = function (app) {
    app.textContent = ''; KD.lang = KD.lang || set.focus; clearTimeout(KD.tm);
    if (!KD.game) return menu(app);
    if (KD.game === 'match') return match(app);
    return quiz(app);
  };
  function menu(app) {
    app.appendChild(h('h1', { text: '🧒 ' + t('kdH') })); app.appendChild(h('p', { class: 'lede', text: t('kdLede') }));
    app.appendChild(langSel('kd-lang', KD.lang, function (v) { KD.lang = v; B.views.kids(app); }));
    app.appendChild(h('div', { class: 'stats' }, [h('div', { class: 'stat' }, [h('b', { id: 'kd-stars', text: '⭐ ' + KD.stars }), h('span', { text: t('kdStars', { n: KD.stars }) })])]));
    var tabs = h('div', { class: 'tabs', role: 'group', 'aria-label': t('kdAll') });
    ['all'].concat(B.KIDS.cats).forEach(function (c) {
      tabs.appendChild(h('button', { type: 'button', class: 'tab' + (KD.cat === c ? ' on' : ''), 'data-cat': c, 'aria-pressed': String(KD.cat === c), text: c === 'all' ? t('kdAll') : t('kdC_' + c), onclick: function () { KD.cat = c; B.views.kids(app); var b = app.querySelector('.tab.on'); if (b) b.focus(); } }));
    });
    app.appendChild(tabs);
    var grid = h('div', { class: 'cards' });
    [['tap', '👆', 'kdG1', 'kdListen'], ['what', '❓', 'kdG2', 'kdWhat'], ['match', '🃏', 'kdG3', 'kdMatch']].forEach(function (g) {
      grid.appendChild(h('button', { type: 'button', class: 'card kdcard', 'data-game': g[0], onclick: function () { KD.game = g[0]; KD.round = 0; KD.busy = false; KD.first = true; KD.seq = shuffle(pool()).slice(0, 8); KD.pairs = null; B.views.kids(app); } }, [h('span', { class: 'ci', 'aria-hidden': 'true', text: g[1] }), h('h2', { text: t(g[2]) }), h('p', { text: t(g[3]) })]));
    });
    app.appendChild(grid);
  }
  function head(app, title) {
    app.appendChild(h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn', id: 'kd-back', text: '← ' + t('kdBack'), onclick: function () { KD.game = null; B.views.kids(app); } }), h('span', { class: 'chip', id: 'kd-stars', text: '⭐ ' + KD.stars })]));
    app.appendChild(h('h1', { text: title }));
  }
  function finish(app) {
    app.textContent = ''; if (B.fx) B.fx.celebrate(app);
    app.appendChild(h('h1', { id: 'kd-done', text: '🎉 ' + t('kdWell') })); app.appendChild(h('p', { class: 'lede', text: t('kdStars', { n: KD.stars }) }));
    app.appendChild(h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn gold big', text: t('kdAgain'), onclick: function () { var g = KD.game; KD.game = null; B.views.kids(app); app.querySelector('[data-game="' + g + '"]').click(); } }), h('button', { type: 'button', class: 'abtn', text: t('kdBack'), onclick: function () { KD.game = null; B.views.kids(app); } })]));
  }
  function distract(target, n) {
    var seen = {}; seen[target[KD.lang]] = 1;
    var from = shuffle(B.KIDS.words.filter(function (w) { return w.id !== target.id && w.cat === target.cat; })).concat(shuffle(B.KIDS.words.filter(function (w) { return w.id !== target.id && w.cat !== target.cat; }))), out = [];
    from.forEach(function (w) { if (out.length < n && !seen[w[KD.lang]]) { seen[w[KD.lang]] = 1; out.push(w); } });
    return out;
  }
  function quiz(app) {
    var w = KD.seq[KD.round]; if (!w) return finish(app);
    app.textContent = ''; KD.first = true; KD.busy = false; var lang = KD.lang, tap = KD.game === 'tap';
    head(app, t(tap ? 'kdG1' : 'kdG2') + ' · ' + (KD.round + 1) + '/' + KD.seq.length);
    var panel = h('section', { class: 'panel kdpanel' }); app.appendChild(panel);
    var opts = shuffle([w].concat(distract(w, tap ? 3 : 2)));
    if (tap) {
      var r = wordRom(w);
      panel.appendChild(h('p', { class: 'ph-t big kdword', lang: lang, text: w[lang] })); if (r) panel.appendChild(h('p', { class: 'ph-r', text: r }));
      panel.appendChild(h('button', { type: 'button', class: 'abtn', id: 'kd-hear', 'aria-label': t('speak') + ': ' + w.en, text: '🔊 ' + t('speak'), onclick: function () { U.speak(w[lang], lang, null, set.rate); } }));
      setTimeout(function () { U.speak(w[lang], lang, null, set.rate); }, 200);
    } else {
      panel.appendChild(h('div', { class: 'kdemoji', role: 'img', 'aria-label': w.en, text: w.e }));
    }
    var res = h('p', { class: 'qz-res', 'aria-live': 'polite' }), box = h('div', { class: 'kdopts' + (tap ? ' pics' : '') });
    opts.forEach(function (o) {
      var rr = tap ? '' : wordRom(o), b = h('button', { type: 'button', class: 'abtn kdopt', 'data-id': o.id, 'aria-label': tap ? o.en : null, onclick: function () {
        if (KD.busy) return;
        if (o.id === w.id) {
          KD.busy = true; b.classList.add('right'); res.textContent = t('kdWell'); if (B.fx) B.fx.good(); if (KD.first) { KD.stars++; var s = document.getElementById('kd-stars'); if (s) s.textContent = '⭐ ' + KD.stars; }
          U.speak(w[lang], lang, null, set.rate); U.logReview && U.logReview();
          KD.tm = setTimeout(function () { if (alive()) { KD.round++; quiz(app); } }, 1100);
        } else { KD.first = false; b.classList.add('wrong'); b.disabled = true; if (B.fx) B.fx.bad(); }
      } }, tap ? [h('span', { class: 'kdpic', 'aria-hidden': 'true', text: o.e })] : [h('span', { lang: lang, text: o[lang] }), rr ? h('span', { class: 'r', text: rr }) : null]);
      box.appendChild(b);
    });
    panel.appendChild(box); panel.appendChild(res);
  }
  function match(app) {
    app.textContent = ''; var lang = KD.lang; head(app, t('kdG3'));
    if (!KD.pairs) { KD.busy = false; KD.flipped = []; KD.matched = 0; var chosen = shuffle(pool()), seen = {}, pick = []; chosen.forEach(function (w) { if (pick.length < 6 && !seen[w[lang]]) { seen[w[lang]] = 1; pick.push(w); } }); KD.pairs = shuffle(pick.map(function (w) { return { w: w, k: 'e' }; }).concat(pick.map(function (w) { return { w: w, k: 'w' }; }))); KD.need = pick.length; }
    var grid = h('div', { class: 'kdgrid' }), res = h('p', { class: 'qz-res', 'aria-live': 'polite' });
    KD.pairs.forEach(function (c, i) {
      var b = h('button', { type: 'button', class: 'kdcell', 'data-id': c.w.id, 'data-kind': c.k, 'aria-label': '?', text: '❔' });
      function show() { b.classList.add('up'); b.textContent = c.k === 'e' ? c.w.e : c.w[lang]; b.setAttribute('aria-label', c.w.en); if (c.k === 'w') b.setAttribute('lang', lang); }
      function hide() { b.classList.remove('up'); b.textContent = '❔'; b.setAttribute('aria-label', '?'); b.removeAttribute('lang'); }
      b.addEventListener('click', function () {
        if (KD.busy || b.classList.contains('up') || b.classList.contains('done')) return;
        show(); if (B.fx) B.fx.tap(); if (c.k === 'w') U.speak(c.w[lang], lang, null, set.rate);
        KD.flipped.push({ b: b, c: c, hide: hide });
        if (KD.flipped.length < 2) return;
        var a = KD.flipped[0], z = KD.flipped[1]; KD.flipped = [];
        if (a.c.w.id === z.c.w.id && a.c.k !== z.c.k) {
          a.b.classList.add('done'); z.b.classList.add('done'); KD.matched++; if (B.fx) B.fx.good(); KD.stars++; var s = document.getElementById('kd-stars'); if (s) s.textContent = '⭐ ' + KD.stars;
          if (KD.matched >= KD.need) { KD.busy = true; KD.tm = setTimeout(function () { if (alive()) finish(app); }, 900); }
        } else { KD.busy = true; if (B.fx) B.fx.bad(); KD.tm = setTimeout(function () { a.hide(); z.hide(); KD.busy = false; }, 1000); }
      });
      grid.appendChild(b);
    });
    app.appendChild(grid); app.appendChild(res);
  }
})(window.B);
