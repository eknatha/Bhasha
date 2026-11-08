/* Numbers, money, time and dates drills; Tone variants; Songs and verses; "Why this way?" notes; night reading. */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set;
  B.views = B.views || {};
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function rom(txt, lang) { return (B.isBrahmic(txt) || lang === 'ja' || lang === 'ko') ? B.translit(txt, set.scheme, lang) : ''; }
  function langSel(id, lang, fn) {
    var s = h('select', { id: id, 'aria-label': t('language') }, B.LEARN.map(function (l) { return h('option', { value: l, text: U.langNative(l) + ' · ' + U.langName(l) }); })); s.value = lang;
    s.addEventListener('change', function () { fn(s.value); });
    return h('div', { class: 'tools' }, [h('div', { class: 'tf' }, [h('label', { for: id, text: t('language') }), s])]);
  }
  function line(txt, lang) { // tappable target text with romanization
    var d = h('div', { class: 'ph-t', lang: lang }); d.appendChild(U.renderText(txt, lang, { roman: false }));
    U.bindWords(d, function () { return lang; }, function () { return txt; }, function () { });
    var r = rom(txt, lang), w = h('div', { class: 'ph-main' }, [d]); if (r) w.appendChild(h('div', { class: 'ph-r', text: r })); return w;
  }
  function spk(txt, lang, label) { return h('button', { type: 'button', class: 'abtn', 'aria-label': t('speak') + ': ' + (label || txt), text: '🔊', onclick: function () { U.speak(txt, lang, null, set.rate); } }); }

  // ---------- "Why this way?" under a phrase
  U.addWhy = function (row, id) {
    var w = B.WHY && B.WHY[id]; if (!w) return;
    var main = row.querySelector('.ph-main'); if (!main) return;
    main.appendChild(h('details', { class: 'why' }, [h('summary', { text: '💡 ' + t('why_show') }), h('p', { lang: set.ui, text: w[set.ui] || w.en })]));
  };

  // ---------- Night reading: off, on, or automatic in the evening
  U.applyNight = function () {
    var m = set.night || 'off', hr = new Date().getHours(), on = m === 'on' || (m === 'auto' && (hr >= 19 || hr < 6));
    if (on) document.documentElement.setAttribute('data-night', '1'); else document.documentElement.removeAttribute('data-night');
  };
  U.nightButton = function () {
    var b = h('button', { type: 'button', class: 'abtn', 'aria-pressed': String(!!document.documentElement.getAttribute('data-night')), text: '🌙 ' + t('set_night') });
    b.addEventListener('click', function () { var on = !document.documentElement.getAttribute('data-night'); set.night = on ? 'on' : 'off'; U.saveSet(); U.applyNight(); b.setAttribute('aria-pressed', String(on)); });
    return b;
  };

  // ---------- Numbers, money, time, dates
  var NR = { lang: null, mode: 'n', range: 100, score: 0, n: 0, streak: 0, last: '' };
  var DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], DAYEN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], MONEN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function dayWord(i, lang) { var p = B.PHRASES.filter(function (x) { return x.id === DAYS[i]; })[0]; return p ? p[lang] : DAYEN[i]; }
  function make(mode, lang, range) { // returns { say, show, say2 } for one item
    var cur = B.CUR[lang] || ['$', 'dollars'], v, c;
    if (mode === 'n') { v = ri(range > 20 ? 1 : 0, range); return { key: 'n' + v, say: String(v), show: String(v) }; }
    if (mode === 'm') { var step = range <= 100 ? 5 : range <= 1000 ? 10 : 50; v = Math.max(step, Math.round(ri(1, range) / step) * step); c = lang === 'ko' || lang === 'ja' ? String(v) + cur[1] : v + ' ' + cur[1]; return { key: 'm' + v, say: c, show: cur[0] + v }; }
    if (mode === 't') { var hh = ri(1, 12), mm = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]), s = hh + ':' + (mm < 10 ? '0' : '') + mm; return { key: 't' + s, say: s, show: s }; }
    var d = ri(0, 6), dd = ri(1, 28), mo = ri(0, 11); return { key: 'd' + d + '-' + dd + '-' + mo, say: dayWord(d, lang) + ' ' + dd + ' ' + B.MONTHS[lang][mo], show: DAYEN[d] + ' ' + dd + ' ' + MONEN[mo], parts: [d, dd, mo] };
  }
  function distract(item, mode, lang, range) {
    var out = {}, tries = 0; out[item.show] = 1; var list = [];
    while (list.length < 2 && tries++ < 60) {
      var o = make(mode, lang, range);
      if (mode === 'n' && Math.random() < 0.7) { var v = +item.show, cand = [v + 1, v - 1, v + 10, v - 10, v * 10, Math.floor(v / 10), +String(v).split('').reverse().join('')].filter(function (x) { return x >= 0 && x <= Math.max(range, 20) && x !== v; }); if (cand.length) { var x = pick(cand); o = { show: String(x), say: String(x) }; } }
      if (mode === 'm' && Math.random() < 0.6) { var m = +item.show.replace(/[^\d]/g, ''), c2 = [m * 10, Math.max(5, m / 10), m + 10, m + 50, m - 10].filter(function (z) { return z > 0 && z !== m; }); if (c2.length) { var z = Math.round(pick(c2)); o = { show: (B.CUR[lang] || ['$'])[0] + z, say: '' }; } }
      if (mode === 't' && Math.random() < 0.6) { var p = item.show.split(':'); o = { show: (Math.random() < 0.5 ? ((+p[0]) % 12 + 1) + ':' + p[1] : p[0] + ':' + (p[1] === '30' ? '00' : '30')), say: '' }; }
      if (mode === 'd' && Math.random() < 0.6) { var q = item.parts.slice(), k = ri(0, 2); q[k] = k === 0 ? (q[0] + 1) % 7 : k === 1 ? q[1] % 28 + 1 : (q[2] + 1) % 12; o = { show: DAYEN[q[0]] + ' ' + q[1] + ' ' + MONEN[q[2]], say: '' }; }
      if (!out[o.show]) { out[o.show] = 1; list.push(o.show); }
    }
    return list;
  }
  B.views.numbers = function (app) {
    app.textContent = ''; U.stopSpeak(); NR.lang = NR.lang || set.focus; var lang = NR.lang;
    app.appendChild(h('h1', { text: t('nav_numbers') })); app.appendChild(h('p', { class: 'lede', text: t('numLede') }));
    app.appendChild(langSel('nm-lang', lang, function (v) { NR.lang = v; NR.score = NR.n = NR.streak = 0; B.views.numbers(app); }));
    var seg = h('div', { class: 'seg', role: 'group', 'aria-label': t('numRange') });
    [['n', 'numMode_n'], ['m', 'numMode_m'], ['t', 'numMode_t'], ['d', 'numMode_d']].forEach(function (m) { seg.appendChild(h('button', { type: 'button', class: 'abtn', 'data-m': m[0], 'aria-pressed': String(NR.mode === m[0]), text: t(m[1]), onclick: function () { NR.mode = m[0]; NR.score = NR.n = NR.streak = 0; B.views.numbers(app); } })); });
    app.appendChild(seg);
    if (NR.mode === 'n' || NR.mode === 'm') {
      var rs = h('select', { id: 'nm-range', 'aria-label': t('numRange') }, [20, 100, 1000, 10000, 100000].map(function (x) { return h('option', { value: x, text: '≤ ' + x }); })); rs.value = NR.range;
      rs.addEventListener('change', function () { NR.range = +rs.value; round(); });
      app.appendChild(h('div', { class: 'tools' }, [h('div', { class: 'tf' }, [h('label', { for: 'nm-range', text: t('numRange') }), rs])]));
    }
    var box = h('section', { class: 'panel pairs', id: 'nm-box' }); app.appendChild(box);
    app.appendChild(h('p', { class: 'note', text: t('numNote') }));
    function round() {
      var item, guard = 0; do { item = make(NR.mode, lang, NR.range); } while (item.key === NR.last && guard++ < 20); NR.last = item.key;
      var opts = distract(item, NR.mode, lang, NR.range).concat([item.show]).sort(function () { return Math.random() - 0.5; }), done = false;
      box.textContent = '';
      box.appendChild(h('div', { class: 'pa-score' }, [h('span', { class: 'chip', text: t('pairsScore', { a: NR.score, n: NR.n }) }), h('span', { class: 'chip', text: t('pairsStreak', { n: NR.streak }) })]));
      box.appendChild(h('h2', { text: t('numQ') }));
      box.appendChild(h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn gold big', id: 'nm-play', text: '🔊 ' + t('numPlay'), onclick: function () { U.speak(item.say, lang, null, set.rate); } }), h('button', { type: 'button', class: 'abtn', 'aria-label': t('slow'), text: '🐢', onclick: function () { U.speak(item.say, lang, null, 0.55); } })]));
      var res = h('p', { class: 'qz-res', 'aria-live': 'polite' }), nextBtn = h('button', { type: 'button', class: 'abtn gold', id: 'nm-next', hidden: true, text: t('next'), onclick: round }), wrap = h('div', { class: 'pa-opts' });
      opts.forEach(function (o) {
        wrap.appendChild(h('button', { type: 'button', class: 'abtn pa-opt nm-opt', 'data-v': o, onclick: function (ev) {
          if (done) return; done = true; NR.n++; var ok = o === item.show;
          if (ok) { NR.score++; NR.streak++; if (B.fx) B.fx.good(); } else { NR.streak = 0; if (B.fx) B.fx.bad(); }
          ev.currentTarget.classList.add(ok ? 'right' : 'wrong'); [].forEach.call(wrap.children, function (b) { if (b.getAttribute('data-v') === item.show) b.classList.add('right'); });
          res.textContent = ok ? t('correct') : t('wrongIs', { a: item.show });
          box.appendChild(h('div', { class: 'pa-mean' }, [h('div', null, [h('span', { lang: lang, class: 'pa-w', text: item.say }), h('span', { class: 'pa-r', text: rom(item.say, lang) }), spk(item.say, lang)])]));
          box.querySelector('.pa-score').firstChild.textContent = t('pairsScore', { a: NR.score, n: NR.n }); box.querySelector('.pa-score').lastChild.textContent = t('pairsStreak', { n: NR.streak });
          if (U.logReview) U.logReview(); nextBtn.hidden = false; nextBtn.focus();
        } }, [h('span', { class: 'pa-w', text: o })]));
      });
      box.appendChild(wrap); box.appendChild(res); box.appendChild(h('div', { class: 'acts' }, [nextBtn]));
      setTimeout(function () { if (box.isConnected && !done) U.speak(item.say, lang, null, set.rate); }, 250);
    }
    round();
  };

  // ---------- Tone variants
  var TN = { lang: null };
  B.views.tone = function (app) {
    app.textContent = ''; U.stopSpeak(); TN.lang = TN.lang || set.focus; var lang = TN.lang;
    app.appendChild(h('h1', { text: t('nav_tone') })); app.appendChild(h('p', { class: 'lede', text: t('toneLede') }));
    app.appendChild(langSel('tn-lang', lang, function (v) { TN.lang = v; B.views.tone(app); }));
    var grid = h('div', { class: 'tone-list' });
    B.TONE.order.forEach(function (id) {
      var pair = B.TONE.rows[id][lang]; if (!pair) return;
      var col = function (label, txt, cls) { return h('div', { class: 'tone-col ' + cls }, [h('div', { class: 'tone-h', text: label }), line(txt, lang), h('div', { class: 'ph-a' }, [spk(txt, lang), h('button', { type: 'button', class: 'abtn', 'aria-label': t('slow') + ': ' + txt, text: '🐢', onclick: function () { U.speak(txt, lang, null, 0.55); } })])]); };
      grid.appendChild(h('article', { class: 'panel tone-card' }, [h('h2', { class: 'tone-t', text: B.TONE.titles[id] }), h('div', { class: 'tone-cols' }, [col(t('toneFormal'), pair[0], 'f'), col(t('toneCasual'), pair[1], 'c')])]));
    });
    app.appendChild(grid); app.appendChild(h('p', { class: 'note', text: t('toneNote') }));
  };

  // ---------- Songs and verses
  var SG = { lang: null, theme: 'morning', playing: false };
  B.views.songs = function (app) {
    app.textContent = ''; U.stopSpeak(); SG.playing = false; SG.lang = SG.lang || set.focus; var lang = SG.lang, S = B.SONGS;
    app.appendChild(h('h1', { text: t('nav_songs') })); app.appendChild(h('p', { class: 'lede', text: t('songsLede') }));
    app.appendChild(langSel('sg-lang', lang, function (v) { SG.lang = v; B.views.songs(app); }));
    var tabs = h('div', { class: 'seg', role: 'group', 'aria-label': t('nav_songs') });
    S.themes.forEach(function (k) { tabs.appendChild(h('button', { type: 'button', class: 'abtn', 'aria-pressed': String(SG.theme === k), text: t('song_' + k), onclick: function () { SG.theme = k; B.views.songs(app); } })); });
    app.appendChild(tabs);
    var lines = (S.text[lang] || {})[SG.theme] || [], en = S.en[SG.theme], box = h('section', { class: 'panel verse' }), rows = [];
    var showEn = h('input', { type: 'checkbox', id: 'sg-en' }); showEn.checked = lang !== 'en';
    var playAll = h('button', { type: 'button', class: 'abtn gold', id: 'sg-all', text: '▶ ' + t('songPlayAll') });
    function mark(i) { rows.forEach(function (r, k) { r.classList.toggle('playing', k === i); }); }
    function stop() { SG.playing = false; U.stopSpeak(); mark(-1); playAll.textContent = '▶ ' + t('songPlayAll'); }
    playAll.addEventListener('click', function () {
      if (SG.playing) return stop(); SG.playing = true; playAll.textContent = '■ ' + t('songPlayAll');
      (function next(i) { if (!SG.playing || i >= lines.length) { stop(); return; } mark(i); U.speak(lines[i], lang, function () { setTimeout(function () { next(i + 1); }, 250); }, set.rate); })(0);
    });
    box.appendChild(h('div', { class: 'acts' }, [playAll, h('div', { class: 'tf chk' }, [showEn, h('label', { for: 'sg-en', text: t('songEn') })])]));
    lines.forEach(function (txt, i) {
      var meaning = h('div', { class: 'ph-n', text: en[i] }); meaning.hidden = !showEn.checked;
      var row = h('div', { class: 'ph vs-line' }, [h('div', { class: 'ph-main' }, [line(txt, lang).firstChild, rom(txt, lang) ? h('div', { class: 'ph-r', text: rom(txt, lang) }) : null, meaning]), h('div', { class: 'ph-a' }, [spk(txt, lang), h('button', { type: 'button', class: 'abtn', 'aria-label': t('slow'), text: '🐢', onclick: function () { U.speak(txt, lang, null, 0.55); } })])]);
      rows.push(row); box.appendChild(row);
    });
    showEn.addEventListener('change', function () { [].forEach.call(box.querySelectorAll('.ph-n'), function (n) { n.hidden = !showEn.checked; }); });
    app.appendChild(box); app.appendChild(h('p', { class: 'note', text: t('songNote') }));
  };
})(window.B);
