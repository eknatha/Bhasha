/* Daily lesson: five new phrases a day, a listening quiz, and recall of older phrases (spaced repetition on phrases).
   Progress is stored in this browser only (localStorage "bh-lesson"). */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set;
  B.views = B.views || {};
  var ORDER = ['greet', 'intro', 'talk', 'daily', 'food', 'travel', 'shop', 'health', 'people', 'feel', 'work', 'home', 'time', 'num'];
  var MAP = null, CUR = null;
  function P(id) { if (!MAP) { MAP = {}; B.PHRASES.forEach(function (p) { MAP[p.id] = p; }); } return MAP[id]; }
  function curriculum() { if (!CUR) { CUR = []; ORDER.forEach(function (c) { B.PHRASES.forEach(function (p) { if (p.cat === c) CUR.push(p.id); }); }); } return CUR; }
  function shuffle(a) { return a.slice().sort(function () { return Math.random() - 0.5; }); }
  B.lesson = {
    load: function () { try { return JSON.parse(U.store.get('bh-lesson')) || {}; } catch (e) { return {}; } },
    save: function (s) { U.store.set('bh-lesson', JSON.stringify(s)); },
    // other phrases to use as wrong answers: same category first, no duplicate text
    distract: function (id, n, key) {
      var p = P(id), seen = {}, out = []; seen[key(p)] = 1;
      var pool = shuffle(B.PHRASES.filter(function (q) { return q.id !== id; })), same = pool.filter(function (q) { return q.cat === p.cat; }), rest = pool.filter(function (q) { return q.cat !== p.cat; });
      same.concat(rest).forEach(function (q) { var k = key(q); if (out.length < n && !seen[k]) { seen[k] = 1; out.push(q); } });
      return out;
    },
    shuffle: shuffle, P: P,
    plan: function (st, force) {
      var d = U.today(), L = st.days[d];
      if (L && !force) return L;
      var fresh = curriculum().filter(function (id) { return !st.cards[id]; }).slice(0, 5), now = Date.now();
      var due = Object.keys(st.cards).filter(function (id) { return st.cards[id].due <= now; }).sort(function (a, b) { return st.cards[a].due - st.cards[b].due; }).slice(0, 5);
      L = { ids: fresh, recall: due, done: false, score: [0, 0] }; st.days[d] = L; return L;
    }
  };
  var TD = { lang: null, step: 'intro', i: 0, right: 0, total: 0, res: {} };

  B.views.today = function (app) {
    app.textContent = ''; TD.lang = TD.lang || set.focus; var lang = TD.lang;
    var all = B.lesson.load(); all[lang] = all[lang] || { cards: {}, days: {} }; var st = all[lang]; var L = B.lesson.plan(st); B.lesson.save(all);
    app.appendChild(h('h1', { text: t('nav_today') })); app.appendChild(h('p', { class: 'lede', text: t('tdLede') }));
    var ls = h('select', { id: 'td-lang', 'aria-label': t('language') }, B.INDIC.map(function (l) { return h('option', { value: l, text: U.langNative(l) + ' · ' + U.langName(l) }); })); ls.value = lang;
    ls.addEventListener('change', function () { TD.lang = ls.value; TD.step = 'intro'; B.views.today(app); });
    app.appendChild(h('div', { class: 'tools' }, [h('div', { class: 'tf' }, [h('label', { for: 'td-lang', text: t('language') }), ls]), h('span', { class: 'chip ok', text: t('tdProgress', { n: Object.keys(st.cards).length, m: B.PHRASES.length }) }), h('span', { class: 'chip lr', text: t('statStreak') + ': ' + U.streak() })]));
    var box = h('section', { class: 'panel lesson' }); app.appendChild(box);
    function save() { B.lesson.save(all); }
    function rom(txt) { return B.isBrahmic(txt) ? B.translit(txt, set.scheme, lang) : ''; }
    function steps(cur) {
      var names = [['learn', t('tdLearn')], ['listen', t('tdListen')]]; if (L.recall.length) names.push(['recall', t('tdRecall')]);
      return h('ol', { class: 'stepbar', 'aria-label': t('nav_today') }, names.map(function (n) { return h('li', { class: n[0] === cur ? 'on' : '', 'aria-current': n[0] === cur ? 'step' : null, text: n[1] }); }));
    }
    function draw() {
      box.textContent = ''; if (B.fx) B.fx.enter(box);
      if (TD.step === 'intro') return intro();
      if (TD.step === 'learn') return learn();
      if (TD.step === 'listen') return quiz('listen');
      if (TD.step === 'recall') return quiz('recall');
      return finish();
    }
    function intro() {
      if (L.done) {
        box.appendChild(h('h2', { text: t('tdDone') })); box.appendChild(h('p', { class: 'lede', text: t('tdScore', { n: L.score[0], m: L.score[1] }) }));
        box.appendChild(h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn gold big', text: t('tdBonus'), onclick: function () { L = B.lesson.plan(st, true); save(); TD.step = 'learn'; draw(); } }), h('a', { class: 'abtn', href: '/talk/', 'data-nav': '1', text: '💬 ' + t('nav_talk') })]));
        return;
      }
      if (!L.ids.length && !L.recall.length) { box.appendChild(h('p', { text: t('tdDone') })); return; }
      box.appendChild(h('h2', { text: t('tdLearn') + ': ' + L.ids.length }));
      box.appendChild(h('ul', { class: 'plain' }, L.ids.map(function (id) { return h('li', { lang: lang, text: B.lesson.P(id).en }); })));
      if (L.recall.length) box.appendChild(h('p', { class: 'note', text: t('tdRecallN', { n: L.recall.length }) }));
      box.appendChild(h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn gold big', text: t('tdStart'), onclick: function () { TD.step = L.ids.length ? 'learn' : 'recall'; TD.i = 0; TD.right = 0; TD.total = 0; draw(); } })]));
    }
    function learn() {
      box.appendChild(steps('learn'));
      var list = h('div', { class: 'ph-list' });
      L.ids.forEach(function (id) {
        var p = B.lesson.P(id), txt = p[lang], tgt = h('div', { class: 'ph-t', lang: lang }); tgt.appendChild(U.renderText(txt, lang, { roman: false }));
        U.bindWords(tgt, function () { return lang; }, function () { return txt; }, function () { });
        var row = h('div', { class: 'ph' }, [h('div', { class: 'ph-main' }, [tgt, rom(txt) ? h('div', { class: 'ph-r', text: rom(txt) }) : null, h('div', { class: 'ph-n', text: p.en })]),
          h('div', { class: 'ph-a' }, [h('button', { type: 'button', class: 'abtn', 'aria-label': t('speak') + ': ' + p.en, text: '🔊', onclick: function () { U.speak(txt, lang, null, set.rate); } }), h('button', { type: 'button', class: 'abtn', 'aria-label': t('slow') + ': ' + p.en, text: '🐢', onclick: function () { U.speak(txt, lang, null, 0.55); } })])]);
        row.querySelector('.ph-a').appendChild(U.pronToggle(row, txt, lang)); list.appendChild(row);
      });
      box.appendChild(list);
      box.appendChild(h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn gold big', text: t('tdNext'), onclick: function () { TD.step = 'listen'; TD.i = 0; draw(); } })]));
    }
    function quiz(kind) {
      var ids = kind === 'listen' ? L.ids : L.recall;
      if (TD.i >= ids.length) { if (kind === 'listen' && L.recall.length) { TD.step = 'recall'; TD.i = 0; return draw(); } TD.step = 'done'; return draw(); }
      var id = ids[TD.i], p = B.lesson.P(id), txt = p[lang];
      box.appendChild(steps(kind)); box.appendChild(h('p', { class: 'note', text: (TD.i + 1) + ' / ' + ids.length }));
      var keyOf = kind === 'listen' ? function (q) { return q.en; } : function (q) { return q[lang]; };
      var opts = B.lesson.shuffle([p].concat(B.lesson.distract(id, 2, keyOf)));
      if (kind === 'listen') {
        box.appendChild(h('h2', { text: t('tdListenQ') }));
        box.appendChild(h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn big', text: '🔊', 'aria-label': t('speak'), onclick: function () { U.speak(txt, lang, null, set.rate); } }), h('button', { type: 'button', class: 'abtn', text: '🐢', 'aria-label': t('slow'), onclick: function () { U.speak(txt, lang, null, 0.55); } })]));
        setTimeout(function () { U.speak(txt, lang, null, set.rate); }, 150);
      } else {
        box.appendChild(h('h2', { text: t('tdRecallQ') })); box.appendChild(h('p', { class: 'ph-n big', text: p.en }));
      }
      var res = h('p', { class: 'qz-res', 'aria-live': 'polite' }), done = false, nb = h('button', { type: 'button', class: 'abtn gold', text: t('tdNext'), hidden: true, onclick: function () { TD.i++; draw(); } });
      var wrap = h('div', { class: 'opts' }, opts.map(function (o) {
        var kids = kind === 'listen' ? [h('span', { text: o.en })] : [h('span', { lang: lang, text: o[lang] }), rom(o[lang]) ? h('span', { class: 'r', text: rom(o[lang]) }) : null];
        return h('button', { type: 'button', class: 'abtn opt', onclick: function (ev) {
          if (done) return; done = true; var ok = o.id === id, b = ev.currentTarget; b.classList.add(ok ? 'right' : 'wrong');
          if (!ok) [].forEach.call(wrap.children, function (x, i) { if (opts[i].id === id) x.classList.add('right'); });
          res.textContent = ok ? t('correct') : t('wrongIs', { a: kind === 'listen' ? p.en : txt }); U.speak(txt, lang, null, set.rate);
          TD.total++; if (ok) TD.right++; U.logReview(); if (B.fx) { if (ok) B.fx.good(); else B.fx.bad(); }
          var c = st.cards[id] || B.srsNew(Date.now()); st.cards[id] = B.srsNext(c, ok ? 2 : 0, Date.now());
          if (kind === 'recall' || !ok) save(); else save();
          if (TD.i + 1 >= ids.length && !(kind === 'listen' && L.recall.length)) nb.textContent = t('tdFinish');
          nb.hidden = false; nb.focus();
        } }, kids);
      }));
      box.appendChild(wrap); box.appendChild(res); box.appendChild(h('div', { class: 'acts' }, [nb]));
    }
    function finish() {
      L.done = true; L.score = [TD.right, TD.total]; save(); if (B.fx) B.fx.celebrate(box);
      box.appendChild(h('h2', { text: t('tdDone') })); box.appendChild(h('p', { class: 'lede', text: t('tdScore', { n: TD.right, m: TD.total }) }));
      box.appendChild(h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn gold big', text: t('tdBonus'), onclick: function () { L = B.lesson.plan(st, true); save(); TD.step = 'learn'; draw(); } }), h('a', { class: 'abtn', href: '/talk/', 'data-nav': '1', text: '💬 ' + t('nav_talk') })]));
      var chip = document.querySelector('.tools .chip.ok'); if (chip) chip.textContent = t('tdProgress', { n: Object.keys(st.cards).length, m: B.PHRASES.length });
    }
    if (L.done) TD.step = 'intro'; draw();
  };
})(window.B);
