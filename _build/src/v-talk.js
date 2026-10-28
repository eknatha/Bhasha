/* Conversation drills: hear what the other person says, then choose your reply. Lines come from the phrasebook. */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set;
  B.views = B.views || {};
  var DR = { lang: null, sc: null, turn: 0, ok: 0, first: true, hide: false };

  B.views.talk = function (app) {
    app.textContent = ''; DR.lang = DR.lang || set.focus; var lang = DR.lang, LS = B.lesson;
    function rom(txt) { return B.isBrahmic(txt) ? B.translit(txt, set.scheme, lang) : ''; }
    function line(p, who) {
      var txt = p[lang], r = rom(txt);
      return h('div', { class: 'bubble ' + who }, [h('div', { class: 'bub-t' }, [h('div', { class: 'ph-t', lang: lang, text: txt }), r ? h('div', { class: 'ph-r', text: r }) : null, h('div', { class: 'ph-n', text: p.en })]),
        h('div', { class: 'ph-a' }, [h('button', { type: 'button', class: 'abtn', 'aria-label': t('speak') + ': ' + p.en, text: '🔊', onclick: function () { U.speak(txt, lang, null, set.rate); } }), h('button', { type: 'button', class: 'abtn', 'aria-label': t('slow') + ': ' + p.en, text: '🐢', onclick: function () { U.speak(txt, lang, null, 0.55); } })])]);
    }
    function list() {
      DR.sc = null; app.textContent = '';
      app.appendChild(h('h1', { text: t('nav_talk') })); app.appendChild(h('p', { class: 'lede', text: t('drLede') }));
      var ls = h('select', { id: 'dr-lang', 'aria-label': t('language') }, B.INDIC.map(function (l) { return h('option', { value: l, text: U.langNative(l) + ' · ' + U.langName(l) }); })); ls.value = lang;
      ls.addEventListener('change', function () { DR.lang = ls.value; B.views.talk(app); });
      var hide = h('input', { type: 'checkbox', id: 'dr-hide' }); hide.checked = DR.hide; hide.addEventListener('change', function () { DR.hide = hide.checked; });
      app.appendChild(h('div', { class: 'tools' }, [h('div', { class: 'tf' }, [h('label', { for: 'dr-lang', text: t('language') }), ls]), h('label', { class: 'tf chk', for: 'dr-hide' }, [hide, h('span', { text: t('drHide') })])]));
      var grid = h('div', { class: 'cards' });
      B.DRILLS.forEach(function (d) { grid.appendChild(h('button', { type: 'button', class: 'card', onclick: function () { DR.sc = d; DR.turn = 0; DR.ok = 0; run(); } }, [h('span', { class: 'ci', 'aria-hidden': 'true', text: d.icon }), h('h2', { text: t('d_' + d.id) }), h('p', { text: t('drTurns', { n: d.turns.length }) })])); });
      app.appendChild(grid);
    }
    function run() {
      app.textContent = ''; var d = DR.sc, tr = d.turns[DR.turn];
      if (!tr) return done();
      var them = LS.P(tr[0]), you = LS.P(tr[1]); DR.first = true;
      app.appendChild(h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn', text: '← ' + t('drPick'), onclick: list }), h('span', { class: 'chip', text: (DR.turn + 1) + ' / ' + d.turns.length })]));
      app.appendChild(h('h1', { text: d.icon + ' ' + t('d_' + d.id) }));
      var panel = h('section', { class: 'panel' }); app.appendChild(panel);
      panel.appendChild(h('h2', { text: t('drThem') }));
      var tb = line(them, 'them'); panel.appendChild(tb);
      if (DR.hide) { tb.classList.add('veil'); tb.querySelector('.bub-t').hidden = true; panel.appendChild(h('button', { type: 'button', class: 'abtn', id: 'dr-show', text: '👁 ' + t('drThem'), onclick: function (e) { tb.querySelector('.bub-t').hidden = false; e.currentTarget.remove(); } })); }
      setTimeout(function () { U.speak(them[lang], lang, null, set.rate); }, 200);
      panel.appendChild(h('h2', { class: 'yt', text: t('drYou') })); panel.appendChild(h('p', { class: 'ph-n big', text: you.en }));
      var others = []; d.turns.forEach(function (x) { if (x[1] !== tr[1] && others.indexOf(x[1]) < 0 && LS.P(x[1])[lang] !== you[lang]) others.push(x[1]); });
      var picks = LS.shuffle(others).slice(0, 2).map(LS.P); if (picks.length < 2) picks = picks.concat(LS.distract(tr[1], 2 - picks.length, function (q) { return q[lang]; }));
      var opts = LS.shuffle([you].concat(picks)), res = h('p', { class: 'qz-res', 'aria-live': 'polite' }), last = DR.turn + 1 >= d.turns.length, solved = false;
      var nb = h('button', { type: 'button', class: 'abtn gold', text: last ? t('tdFinish') : t('tdNext'), hidden: true, onclick: function () { DR.turn++; run(); } });
      panel.appendChild(h('div', { class: 'opts' }, opts.map(function (o) {
        var r = rom(o[lang]);
        return h('button', { type: 'button', class: 'abtn opt', onclick: function (ev) {
          if (solved) return; var b = ev.currentTarget;
          if (o.id === you.id) { solved = true; b.classList.add('right'); res.textContent = t('correct'); U.speak(o[lang], lang, null, set.rate); if (DR.first) DR.ok++; U.logReview(); nb.hidden = false; nb.focus(); var sh = document.getElementById('dr-show'); if (sh) sh.click(); }
          else { DR.first = false; b.classList.add('wrong'); b.disabled = true; res.textContent = t('drTry'); }
        } }, [h('span', { lang: lang, text: o[lang] }), r ? h('span', { class: 'r', text: r }) : null]);
      })));
      panel.appendChild(res); panel.appendChild(h('div', { class: 'acts' }, [nb]));
    }
    function done() {
      app.textContent = ''; var d = DR.sc;
      app.appendChild(h('h1', { text: d.icon + ' ' + t('drDone') })); app.appendChild(h('p', { class: 'lede', text: t('drScore', { n: DR.ok, m: d.turns.length }) }));
      var panel = h('section', { class: 'panel' }, [h('h2', { text: t('drTranscript') })]);
      d.turns.forEach(function (x) { panel.appendChild(line(LS.P(x[0]), 'them')); panel.appendChild(line(LS.P(x[1]), 'you')); });
      app.appendChild(panel);
      app.appendChild(h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn gold', text: t('drReplay'), onclick: function () { DR.turn = 0; DR.ok = 0; run(); } }), h('button', { type: 'button', class: 'abtn', text: t('drAnother'), onclick: list })]));
    }
    list();
  };
})(window.B);
