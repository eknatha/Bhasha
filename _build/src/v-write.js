/* Output practice: type the translation, type what you hear, or type the missing word. Script, romanization and polite/casual alternatives all count. */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set;
  B.views = B.views || {};
  var W = { lang: null, mode: 'translate', cat: 'all', score: 0, n: 0, streak: 0, last: null };
  var BR = /[ऀ-෿぀-ヿ一-鿿가-힯ᄀ-ᇿㄱ-ㅣ]/;
  function nat(s) { return String(s).normalize('NFC').toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, ''); }
  function lat(s, lang) { // Latin comparison: no accents, no spaces, no punctuation; Japanese ignores vowel length
    var x = String(s).normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase().replace(/ß/g, 'ss').replace(/œ/g, 'oe').replace(/æ/g, 'ae').replace(/[^a-z0-9]+/g, '');
    if (lang === 'ja') x = x.replace(/ou/g, 'o').replace(/oo/g, 'o').replace(/uu/g, 'u').replace(/aa/g, 'a').replace(/ii/g, 'i').replace(/ee/g, 'e');
    return x;
  }
  function lev(a, b) { var m = a.length, n = b.length, d = [], i, j; for (i = 0; i <= m; i++) { d[i] = [i]; } for (j = 1; j <= n; j++) d[0][j] = j; for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; }
  // targets: list of native strings that count as right (the phrase and, in Translate mode, its polite/casual alternatives)
  // returns 'right', 'close' or 'wrong'
  B.checkTyped = function (answer, targets, lang) {
    var a = String(answer).trim(); if (!a) return 'wrong';
    var native = BR.test(a) || (['en', 'es', 'de', 'fr'].indexOf(lang) >= 0), best = 99, i, rom;
    if (BR.test(a)) { var na = nat(a); for (i = 0; i < targets.length; i++) { var d = lev(na, nat(targets[i])); best = Math.min(best, d); } return best === 0 ? 'right' : (best <= 1 && na.length > 3 ? 'close' : 'wrong'); }
    var la = lat(a, lang);
    for (i = 0; i < targets.length; i++) {
      var tg = targets[i], forms = [];
      if (['en', 'es', 'de', 'fr'].indexOf(lang) >= 0) forms.push(lat(tg, lang));
      else { forms.push(lat(B.translit(tg, 'simple', lang), lang)); forms.push(lat(B.translit(tg, 'iast', lang), lang)); }
      forms.forEach(function (f) { if (f) best = Math.min(best, lev(la, f) / Math.max(1, f.length)); });
    }
    if (best === 0) return 'right';
    if (['en', 'es', 'de', 'fr'].indexOf(lang) >= 0) return best <= 0.1 && la.length > 4 ? 'close' : 'wrong';
    return best <= 0.12 ? 'right' : (best <= 0.25 ? 'close' : 'wrong'); // romanization spelling varies (aa/a, ee/i, v/w)
  };
  function pool() {
    return B.PHRASES.filter(function (p) { return p[W.lang] && p[W.lang].indexOf('…') < 0 && (W.cat === 'all' || p.cat === W.cat); });
  }
  function alts(p) { var a = (B.ALTS && B.ALTS[p.id] && B.ALTS[p.id][W.lang]) || []; return a; }

  B.views.write = function (app) {
    app.textContent = ''; U.stopSpeak(); W.lang = W.lang || set.focus; var lang = W.lang;
    app.appendChild(h('h1', { text: t('nav_write') })); app.appendChild(h('p', { class: 'lede', text: t('wrLede') }));
    var ls = h('select', { id: 'wr-lang', 'aria-label': t('language') }, B.LEARN.map(function (l) { return h('option', { value: l, text: U.langNative(l) + ' · ' + U.langName(l) }); })); ls.value = lang;
    ls.addEventListener('change', function () { W.lang = ls.value; W.score = W.n = W.streak = 0; B.views.write(app); });
    var cs = h('select', { id: 'wr-cat', 'aria-label': t('wrTopic') }, [h('option', { value: 'all', text: t('wrAllTopics') })].concat(B.PHRASE_CATS.map(function (c) { return h('option', { value: c, text: t('cat_' + c) }); }))); cs.value = W.cat;
    cs.addEventListener('change', function () { W.cat = cs.value; round(); });
    app.appendChild(h('div', { class: 'tools' }, [h('div', { class: 'tf' }, [h('label', { for: 'wr-lang', text: t('language') }), ls]), h('div', { class: 'tf' }, [h('label', { for: 'wr-cat', text: t('wrTopic') }), cs])]));
    var tabs = h('div', { class: 'tabs', role: 'group', 'aria-label': t('wrMode') });
    [['translate', 'wrModeT'], ['dictation', 'wrModeD'], ['cloze', 'wrModeC']].forEach(function (m) {
      tabs.appendChild(h('button', { type: 'button', class: 'tab' + (W.mode === m[0] ? ' on' : ''), 'data-mode': m[0], 'aria-pressed': String(W.mode === m[0]), text: t(m[1]), onclick: function () { W.mode = m[0]; [].forEach.call(tabs.children, function (b) { var on = b.getAttribute('data-mode') === W.mode; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }); round(); } }));
    });
    app.appendChild(tabs);
    var box = h('section', { class: 'panel wr', id: 'wr-box' }); app.appendChild(box);
    app.appendChild(h('p', { class: 'note', text: t('wrAccept') }));
    function round() {
      U.stopSpeak(); var P = pool(), p, guard = 0;
      if (W.mode === 'cloze') P = P.filter(function (x) { return blankWord(x) !== null; });
      if (!P.length) { box.textContent = ''; box.appendChild(h('p', { class: 'empty', text: t('wrNone') })); return; }
      do { p = P[Math.floor(Math.random() * P.length)]; } while (P.length > 1 && p === W.last && guard++ < 20);
      W.last = p; box.textContent = '';
      var txt = p[lang], targets = [txt], blank = null, prompt, done = false;
      if (W.mode === 'translate') { alts(p).forEach(function (a) { targets.push(a); }); prompt = [h('p', { class: 'wr-q', text: t('wrQ1', { lang: U.langName(lang) }) }), h('p', { class: 'ph-n big', text: U.mn(p, lang) })]; }
      else if (W.mode === 'dictation') {
        prompt = [h('p', { class: 'wr-q', text: t('wrQ2') }), h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn gold big', id: 'wr-play', text: '🔊 ' + t('speak'), onclick: function () { U.speak(txt, lang, null, set.rate); } }), h('button', { type: 'button', class: 'abtn', id: 'wr-slow', text: '🐢 ' + t('slow'), onclick: function () { U.speak(txt, lang, null, 0.55, true); } })])];
        setTimeout(function () { if (box.isConnected && !done) U.speak(txt, lang, null, set.rate); }, 250);
      } else {
        blank = blankWord(p); targets = [blank.word];
        prompt = [h('p', { class: 'wr-q', text: t('wrQ3') }), h('p', { class: 'ph-t', lang: lang, text: blank.before + '＿＿＿' + blank.after }), h('p', { class: 'ph-n', text: U.mn(p, lang) })];
      }
      prompt.forEach(function (n) { box.appendChild(n); });
      var input = h('input', { type: 'text', id: 'wr-in', class: 'wr-in', lang: BR.test(txt) ? lang : 'en', placeholder: t('wrPlaceholder'), 'aria-label': t('wrPlaceholder'), autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false' });
      var res = h('div', { class: 'wr-res', 'aria-live': 'polite' }), checkBtn = h('button', { type: 'submit', class: 'abtn gold', id: 'wr-check', text: t('wrCheck') });
      var hintBtn = h('button', { type: 'button', class: 'abtn', id: 'wr-hint', text: '💡 ' + t('wrHint'), onclick: function () { var target = targets[0], r = BR.test(target) && ['en', 'es', 'de', 'fr'].indexOf(lang) < 0 ? B.translit(target, set.scheme, lang) : target; res.textContent = t('wrHintIs', { h: r.slice(0, Math.max(2, Math.ceil(r.length / 4))) + '…' }); } });
      var skip = h('button', { type: 'button', class: 'abtn', id: 'wr-skip', text: t('wrSkip'), onclick: function () { if (!done) { W.streak = 0; reveal('skip'); } else round(); } });
      var nextBtn = h('button', { type: 'button', class: 'abtn gold', id: 'wr-next', hidden: true, text: t('next'), onclick: round });
      var form = h('form', { class: 'wr-form', onsubmit: function (e) { e.preventDefault(); if (done) { round(); return; } submit(); } }, [input, h('div', { class: 'acts' }, [checkBtn, hintBtn, skip, nextBtn])]);
      box.appendChild(form); box.appendChild(res);
      box.insertBefore(h('div', { class: 'pa-score' }, [h('span', { class: 'chip', id: 'wr-score', text: t('pairsScore', { a: W.score, n: W.n }) }), h('span', { class: 'chip', id: 'wr-streak', text: t('pairsStreak', { n: W.streak }) })]), box.firstChild);
      if (W.mode !== 'dictation') input.focus();
      function reveal(kind) {
        done = true; input.readOnly = true; checkBtn.hidden = true; hintBtn.hidden = true; skip.hidden = true; nextBtn.hidden = false;
        var shown = blank ? blank.word : txt, r = BR.test(shown) && ['en', 'es', 'de', 'fr'].indexOf(lang) < 0 ? B.translit(shown, set.scheme, lang) : '';
        res.textContent = ''; var cls = kind === 'right' ? 'right' : kind === 'close' ? 'close' : 'wrong';
        res.appendChild(h('p', { class: 'wr-v ' + cls, text: kind === 'right' ? t('wrRight') : kind === 'close' ? t('wrAlmost') : t('wrWrong') }));
        res.appendChild(h('div', { class: 'wr-ans' }, [h('div', { class: 'ph-t', lang: lang, text: shown }), r ? h('div', { class: 'ph-r', text: r }) : null, W.mode === 'dictation' ? h('div', { class: 'ph-n', text: U.mn(p, lang) }) : null]));
        if (W.mode === 'translate' && alts(p).length) res.appendChild(h('p', { class: 'note', text: t('wrAlso', { a: alts(p).join(' · ') }) }));
        res.appendChild(h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn', 'aria-label': t('speak') + ': ' + shown, text: '🔊', onclick: function () { U.speak(shown, lang, null, set.rate); } })]));
        document.getElementById('wr-score').textContent = t('pairsScore', { a: W.score, n: W.n }); document.getElementById('wr-streak').textContent = t('pairsStreak', { n: W.streak });
        nextBtn.focus();
      }
      function submit() {
        var v = B.checkTyped(input.value, targets, lang); if (!input.value.trim()) { input.focus(); return; }
        W.n++; if (v === 'right' || v === 'close') { W.score++; W.streak++; if (B.fx) B.fx.good(); } else { W.streak = 0; if (B.fx) B.fx.bad(); }
        reveal(v);
      }
    }
    // pick one word of a phrase to blank out: the longest word (needs a sentence of at least three words)
    function blankWord(p) {
      var txt = p[lang], tk = B.tokenize(txt, lang), words = tk.filter(function (x) { return x.w; });
      if (words.length < 3) return null;
      var best = null; words.forEach(function (x) { if (!best || x.t.length > best.t.length) best = x; });
      var i = tk.indexOf(best); return { word: best.t, before: tk.slice(0, i).map(function (x) { return x.t; }).join(''), after: tk.slice(i + 1).map(function (x) { return x.t; }).join('') };
    }
    round();
  };
})(window.B);
