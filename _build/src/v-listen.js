/* Minimal-pair listening and Story mode. Pairs come from B.PAIRS, stories are lists of phrasebook lines (B.STORIES). */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set;
  B.views = B.views || {};
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function rom(txt, lang) {
    if (!(B.isBrahmic(txt) || lang === 'ja')) return '';
    return B.translit(txt, set.scheme, lang);
  }
  // romanization that tells the two words of a pair apart (falls back to the scholarly style, which keeps long vowels)
  function pairRom(p, i, lang) {
    var a = B.translit(p[0], set.scheme, lang), b = B.translit(p[1], set.scheme, lang);
    if (!(B.isBrahmic(p[i]) || lang === 'ja')) return '';
    if (a === b || lang === 'ja') return B.translit(p[i], 'iast', lang);
    return i ? b : a;
  }

  // ---------------- Minimal pairs
  var PR = { lang: null, score: 0, n: 0, streak: 0, best: 0, last: -1 };
  B.views.pairs = function (app) {
    app.textContent = ''; U.stopSpeak(); PR.lang = PR.lang || set.focus; var lang = PR.lang;
    if (!B.PAIRS[lang]) lang = PR.lang = 'hi';
    app.appendChild(h('h1', { text: t('nav_pairs') })); app.appendChild(h('p', { class: 'lede', text: t('pairsLede') }));
    var ls = h('select', { id: 'pa-lang', 'aria-label': t('language') }, B.LEARN.filter(function (l) { return B.PAIRS[l]; }).map(function (l) { return h('option', { value: l, text: U.langNative(l) + ' · ' + U.langName(l) }); })); ls.value = lang;
    ls.addEventListener('change', function () { PR.lang = ls.value; PR.score = PR.n = PR.streak = 0; PR.last = -1; B.views.pairs(app); });
    app.appendChild(h('div', { class: 'tools' }, [h('div', { class: 'tf' }, [h('label', { for: 'pa-lang', text: t('language') }), ls])]));
    var box = h('section', { class: 'panel pairs', id: 'pa-box' }); app.appendChild(box);
    app.appendChild(h('p', { class: 'note', text: t('pairsNote') }));
    function round() {
      var list = B.PAIRS[lang], idx, guard = 0; do { idx = Math.floor(Math.random() * list.length); } while (idx === PR.last && list.length > 1 && guard++ < 20); PR.last = idx;
      var p = list[idx], target = Math.random() < 0.5 ? 0 : 1, done = false;
      box.textContent = '';
      box.appendChild(h('div', { class: 'pa-score' }, [h('span', { class: 'chip', text: t('pairsScore', { a: PR.score, n: PR.n }) }), h('span', { class: 'chip', text: t('pairsStreak', { n: PR.streak }) })]));
      box.appendChild(h('h2', { text: t('pairsQ') }));
      var play = h('button', { type: 'button', class: 'abtn gold big', id: 'pa-play', text: '🔊 ' + t('pairsPlay'), onclick: function () { U.speak(p[target], lang, null, set.rate); } });
      box.appendChild(h('div', { class: 'acts' }, [play]));
      var res = h('p', { class: 'qz-res', 'aria-live': 'polite' }), nextBtn = h('button', { type: 'button', class: 'abtn gold', id: 'pa-next', hidden: true, text: t('next'), onclick: round });
      var opts = h('div', { class: 'pa-opts' });
      [0, 1].forEach(function (i) {
        var r = pairRom(p, i, lang);
        opts.appendChild(h('button', { type: 'button', class: 'abtn pa-opt', 'data-i': i, onclick: function (ev) {
          if (done) return; done = true; PR.n++; var ok = i === target;
          if (ok) { PR.score++; PR.streak++; PR.best = Math.max(PR.best, PR.streak); if (B.fx) B.fx.good(); } else { PR.streak = 0; if (B.fx) B.fx.bad(); }
          ev.currentTarget.classList.add(ok ? 'right' : 'wrong');
          var opt = opts.children[target]; opt.classList.add('right');
          res.textContent = ok ? t('correct') : t('wrongIs', { a: p[target] });
          var mean = h('div', { class: 'pa-mean' }, [0, 1].map(function (j) { return h('div', null, [h('span', { lang: lang, class: 'pa-w', text: p[j] }), h('span', { class: 'pa-r', text: pairRom(p, j, lang) }), h('span', { text: ' = ' + p[2 + j] }), h('button', { type: 'button', class: 'abtn', 'aria-label': t('speak') + ': ' + p[j], text: '🔊', onclick: function () { U.speak(p[j], lang, null, set.rate); } })]); }));
          box.appendChild(mean); nextBtn.hidden = false; nextBtn.focus();
          box.querySelector('.pa-score').firstChild.textContent = t('pairsScore', { a: PR.score, n: PR.n }); box.querySelector('.pa-score').lastChild.textContent = t('pairsStreak', { n: PR.streak });
        } }, [h('span', { lang: lang, class: 'pa-w', text: p[i] }), r ? h('small', { class: 'pa-r', text: r }) : null]));
      });
      box.appendChild(opts); box.appendChild(res);
      box.appendChild(h('div', { class: 'acts' }, [nextBtn]));
      setTimeout(function () { if (box.isConnected && !done) U.speak(p[target], lang, null, set.rate); }, 250);
    }
    round();
  };

  // ---------------- Story mode
  var ST = { lang: null, story: null, speaking: false, all: false };
  B.views.stories = function (app) {
    app.textContent = ''; U.stopSpeak(); ST.speaking = false; ST.lang = ST.lang || set.focus; var lang = ST.lang;
    function head() {
      app.appendChild(h('h1', { text: t('nav_stories') })); app.appendChild(h('p', { class: 'lede', text: t('stLede') }));
      var ls = h('select', { id: 'st-lang', 'aria-label': t('language') }, B.LEARN.map(function (l) { return h('option', { value: l, text: U.langNative(l) + ' · ' + U.langName(l) }); })); ls.value = lang;
      ls.addEventListener('change', function () { var cur = ST.story; ST.lang = ls.value; B.views.stories(app); if (cur) open(cur); });
      app.appendChild(h('div', { class: 'tools' }, [h('div', { class: 'tf' }, [h('label', { for: 'st-lang', text: t('language') }), ls])]));
    }
    function list() {
      ST.story = null; app.textContent = ''; head();
      var grid = h('div', { class: 'cards' });
      B.STORIES.forEach(function (s) { grid.appendChild(h('button', { type: 'button', class: 'card', 'data-story': s.id, onclick: function () { open(s); } }, [h('span', { class: 'ci', 'aria-hidden': 'true', text: s.icon }), h('h2', { text: t('s_' + s.id) }), h('p', { text: t('stLines', { n: s.lines.length }) })])); });
      app.appendChild(grid);
    }
    function open(s) {
      ST.story = s; U.stopSpeak(); ST.speaking = false; app.textContent = ''; head();
      var P = s.lines.map(function (id) { return B.PHRASES.filter(function (p) { return p.id === id; })[0]; });
      app.appendChild(h('button', { type: 'button', class: 'abtn', id: 'st-back', text: '← ' + t('stBack'), onclick: list }));
      app.appendChild(h('h2', { class: 'st-title', text: s.icon + ' ' + t('s_' + s.id) }));
      var all = h('input', { type: 'checkbox', id: 'st-all' }); all.checked = ST.all;
      var play = h('button', { type: 'button', class: 'abtn gold', id: 'st-play', text: '▶ ' + t('stPlay'), onclick: playAll });
      app.appendChild(h('div', { class: 'tools' }, [play, h('label', { class: 'tf chk', for: 'st-all' }, [all, h('span', { text: t('stMeanings') })])]));
      app.appendChild(h('p', { class: 'note', text: t('stTapHint') }));
      var story = h('div', { class: 'story', id: 'st-lines' }); app.appendChild(story);
      var rows = P.map(function (p, i) {
        var txt = p[lang], r = rom(txt, lang), who = i % 2 ? 'you' : 'them';
        var mean = h('div', { class: 'ph-n', text: U.mn(p, lang), hidden: !ST.all });
        var row = h('div', { class: 'bubble ' + who, 'data-i': i }, [h('div', { class: 'bub-t' }, [h('button', { type: 'button', class: 'st-tap', 'aria-expanded': String(ST.all), onclick: function () { mean.hidden = !mean.hidden; this.setAttribute('aria-expanded', String(!mean.hidden)); } }, [h('div', { class: 'ph-t', lang: lang, text: txt }), r && set.roman ? h('div', { class: 'ph-r', text: r }) : null]), mean]),
          h('div', { class: 'ph-a' }, [h('button', { type: 'button', class: 'abtn', 'aria-label': t('speak') + ': ' + U.mn(p, lang), text: '🔊', onclick: function () { U.speak(txt, lang, null, set.rate); } }), h('button', { type: 'button', class: 'abtn', 'aria-label': t('slow') + ': ' + U.mn(p, lang), text: '🐢', onclick: function () { U.speak(txt, lang, null, 0.55, true); } })])]);
        story.appendChild(row); return { row: row, mean: mean, tap: row.querySelector('.st-tap') };
      });
      all.addEventListener('change', function () { ST.all = all.checked; rows.forEach(function (x) { x.mean.hidden = !ST.all; x.tap.setAttribute('aria-expanded', String(ST.all)); }); });
      function mark(i) { rows.forEach(function (x, j) { x.row.classList.toggle('speaking', j === i); }); if (i >= 0 && rows[i]) rows[i].row.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
      function playAll() {
        if (ST.speaking) { ST.speaking = false; U.stopSpeak(); mark(-1); play.textContent = '▶ ' + t('stPlay'); return; }
        ST.speaking = true; play.textContent = '■ ' + t('stop'); var i = 0;
        (function next() { if (!ST.speaking || !app.contains(play) || i >= P.length) { ST.speaking = false; mark(-1); if (app.contains(play)) play.textContent = '▶ ' + t('stPlay'); return; } mark(i); var txt = P[i][lang]; i++; U.speak(txt, lang, next, set.rate); })();
      }
      quiz(P);
    }
    function quiz(P) {
      var box = h('section', { class: 'panel', id: 'st-quiz' }); app.appendChild(box);
      var order = P.slice().sort(function () { return Math.random() - .5; }).slice(0, Math.min(4, P.length)), qi = 0, ok = 0;
      function q() {
        box.textContent = '';
        if (qi >= order.length) {
          box.appendChild(h('h2', { text: t('stDoneH') })); box.appendChild(h('p', { class: 'qz-res', text: t('stScore', { n: ok, t: order.length }) }));
          if (B.fx && ok === order.length) B.fx.celebrate(box); else if (B.fx) B.fx.done();
          box.appendChild(h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn gold', id: 'st-again', text: t('stAgain'), onclick: function () { open(ST.story); } }), h('button', { type: 'button', class: 'abtn', text: t('stBack'), onclick: list })])); return;
        }
        var p = order[qi], done = false, opts = [p];
        P.slice().sort(function () { return Math.random() - .5; }).forEach(function (x) { if (opts.length < 4 && x !== p && x[lang] !== p[lang]) opts.push(x); });
        opts.sort(function () { return Math.random() - .5; });
        box.appendChild(h('h2', { text: t('stQuizH') + ' · ' + (qi + 1) + '/' + order.length }));
        box.appendChild(h('p', { class: 'ph-n big', text: t('stQ', { m: U.mn(p, lang) }) }));
        var res = h('p', { class: 'qz-res', 'aria-live': 'polite' }), nb = h('button', { type: 'button', class: 'abtn gold', id: 'st-qnext', hidden: true, text: t('next'), onclick: function () { qi++; q(); } });
        box.appendChild(h('div', { class: 'qz-opts st-opts' }, opts.map(function (o) { return h('button', { type: 'button', class: 'abtn', 'data-ok': o === p ? '1' : '0', lang: lang, text: o[lang], onclick: function (ev) { if (done) return; done = true; var good = o === p; if (good) ok++; if (B.fx) (good ? B.fx.good : B.fx.bad)(); ev.currentTarget.classList.add(good ? 'right' : 'wrong'); [].forEach.call(box.querySelectorAll('[data-ok="1"]'), function (b) { b.classList.add('right'); }); res.textContent = good ? t('correct') : t('wrongIs', { a: p[lang] }); U.speak(p[lang], lang, null, set.rate); nb.hidden = false; nb.focus(); } }); })));
        box.appendChild(res); box.appendChild(h('div', { class: 'acts' }, [nb]));
      }
      q();
    }
    list();
  };
})(window.B);
