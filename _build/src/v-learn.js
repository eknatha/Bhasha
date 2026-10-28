/* Home dashboard, Scripts (charts, quiz, tracing) and Phrases. */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set, W = U.words;
  B.views = B.views || {};

  B.views.home = function (app) {
    app.textContent = '';
    var due = W.due(null).length, saved = W.list.length;
    app.appendChild(h('section', { class: 'hero' }, [h('h1', { text: t('homeH') }), h('p', { class: 'lede', text: t('homeSub') }),
      h('div', { class: 'tools' }, [h('div', { class: 'tf' }, [h('label', { for: 'hm-focus', text: t('focusLang') }), (function () { var s = h('select', { id: 'hm-focus' }, B.INDIC.map(function (l) { return h('option', { value: l, text: U.langNative(l) + ' · ' + U.langName(l) }); })); s.value = set.focus; s.addEventListener('change', function () { set.focus = s.value; U.saveSet(); B.views.home(app); }); return s; })()])])]));
    var stats = h('div', { class: 'stats' }, [stat(saved, t('statWords')), stat(due, t('statDue')), stat(U.streak(), t('statStreak'))]);
    app.appendChild(stats);
    var cards = [['/watch/', '🎬', 'nav_watch', 'cWatch'], ['/read/', '📖', 'nav_read', 'cRead'], ['/review/', '🧠', 'nav_review', 'cReview'], ['/words/', '🗂', 'nav_words', 'cWords'], ['/scripts/', 'अ', 'nav_scripts', 'cScripts'], ['/phrases/', '💬', 'nav_phrases', 'cPhrases']];
    var grid = h('div', { class: 'cards' });
    cards.forEach(function (c) { grid.appendChild(h('a', { class: 'card', href: B.base + c[0].slice(1), onclick: function (e) { if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) return; e.preventDefault(); U.go(c[0]); } }, [h('span', { class: 'ci', 'aria-hidden': 'true', text: c[1] }), h('h2', { text: t(c[2]) }), h('p', { text: t(c[3]) }), c[0] === '/review/' && due ? h('span', { class: 'chip lr', text: t('dueCount', { n: due }) }) : null])); });
    app.appendChild(grid);
    app.appendChild(h('section', { class: 'panel' }, [h('h2', { text: t('howH') }), h('ol', { class: 'steps' }, ['how1', 'how2', 'how3', 'how4'].map(function (k) { return h('li', { text: t(k) }); }))]));
    app.appendChild(h('p', { class: 'note', text: t('homeNote') }));
  };
  function stat(n, l) { return h('div', { class: 'stat' }, [h('b', { text: String(n) }), h('span', { text: l })]); }

  // ---------------- Scripts
  var SC = { lang: null, quiz: null, trace: null };
  B.views.scripts = function (app) {
    app.textContent = ''; SC.lang = SC.lang || set.focus;
    app.appendChild(h('h1', { text: t('nav_scripts') })); app.appendChild(h('p', { class: 'lede', text: t('scLede') }));
    var ls = h('select', { id: 'sc-lang', 'aria-label': t('language') }, B.INDIC.map(function (l) { return h('option', { value: l, text: U.langNative(l) + ' · ' + U.langName(l) }); })); ls.value = SC.lang;
    ls.addEventListener('change', function () { SC.lang = ls.value; SC.quiz = null; draw(); });
    var body = h('div'); app.appendChild(h('div', { class: 'tools' }, [h('div', { class: 'tf' }, [h('label', { for: 'sc-lang', text: t('language') }), ls])])); app.appendChild(body);
    function cell(g, rom, extra) {
      return h('button', { type: 'button', class: 'gl', 'aria-label': g + ' ' + rom, onclick: function () { U.speak(g, SC.lang, null, 0.7); SC.trace = g; drawTrace(); } }, [h('span', { class: 'g', lang: SC.lang, text: g }), h('span', { class: 'r', text: rom })]);
    }
    function grid(title, arr, mk) { return h('section', { class: 'panel' }, [h('h2', { text: title }), h('div', { class: 'glyphs' }, arr.map(mk))]); }
    var traceBox = h('section', { class: 'panel' });
    function drawTrace() {
      traceBox.textContent = ''; traceBox.appendChild(h('h2', { text: t('scTrace') }));
      var g = SC.trace; if (!g) { traceBox.appendChild(h('p', { class: 'note', text: t('scTraceHint') })); return; }
      var cv = h('canvas', { width: 320, height: 240, class: 'trace', role: 'img', 'aria-label': t('scTraceHint') }), ctx = cv.getContext('2d');
      function bg() { var dk = document.documentElement.getAttribute('data-theme') !== 'light'; ctx.clearRect(0, 0, 320, 240); ctx.fillStyle = dk ? 'rgba(255,255,255,.14)' : 'rgba(28,27,75,.14)'; ctx.font = '170px "Noto Sans Indic","Noto Sans",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(g, 160, 125); ctx.strokeStyle = dk ? '#ffd24a' : '#1c1b4b'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; }
      bg(); var down = false, lx = 0, ly = 0;
      function pos(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 320 / r.width, (e.clientY - r.top) * 240 / r.height]; }
      cv.addEventListener('pointerdown', function (e) { down = true; var p = pos(e); lx = p[0]; ly = p[1]; cv.setPointerCapture(e.pointerId); ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + .1, ly + .1); ctx.stroke(); });
      cv.addEventListener('pointermove', function (e) { if (!down) return; var p = pos(e); ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(p[0], p[1]); ctx.stroke(); lx = p[0]; ly = p[1]; });
      ['pointerup', 'pointercancel'].forEach(function (ev) { cv.addEventListener(ev, function () { down = false; }); });
      traceBox.appendChild(cv); traceBox.appendChild(h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn', text: t('clear'), onclick: bg }), h('button', { type: 'button', class: 'abtn', text: '🔊', 'aria-label': t('speak'), onclick: function () { U.speak(g, SC.lang, null, 0.7); } })]));
    }
    function quiz() {
      var S = B.SCRIPTS[SC.lang], pool = S.vowels.concat(S.cons), box = h('section', { class: 'panel' });
      function q() {
        box.textContent = ''; box.appendChild(h('h2', { text: t('scQuiz') }));
        var ans = pool[Math.floor(Math.random() * pool.length)], rom = function (g) { return B.translit(g, 'simple') || g; }, opts = [ans];
        var guard = 0; while (opts.length < 4 && guard++ < 100) { var x = pool[Math.floor(Math.random() * pool.length)]; if (opts.indexOf(x) < 0 && rom(x) !== rom(ans) && opts.every(function (o) { return rom(o) !== rom(x); })) opts.push(x); }
        opts.sort(function () { return Math.random() - .5; });
        box.appendChild(h('div', { class: 'qz-g', lang: SC.lang, text: ans })); box.appendChild(h('p', { class: 'note', text: t('scQuizQ') }));
        var res = h('p', { class: 'qz-res', 'aria-live': 'polite' }), done = false;
        box.appendChild(h('div', { class: 'qz-opts' }, opts.map(function (o) { return h('button', { type: 'button', class: 'abtn', text: rom(o), onclick: function (ev) { if (done) return; done = true; var ok = o === ans; ev.target.classList.add(ok ? 'right' : 'wrong'); res.textContent = ok ? t('correct') : t('wrongIs', { a: rom(ans) }); U.speak(ans, SC.lang, null, .7); SC.score = (SC.score || 0) + (ok ? 1 : 0); SC.tries = (SC.tries || 0) + 1; sc.textContent = SC.score + ' / ' + SC.tries; nb.hidden = false; nb.focus(); } }); })));
        box.appendChild(res); var nb = h('button', { type: 'button', class: 'abtn gold', text: t('next'), hidden: true, onclick: q }); var sc = h('span', { class: 'chip', text: (SC.score || 0) + ' / ' + (SC.tries || 0) }); box.appendChild(h('div', { class: 'acts' }, [nb, sc]));
      }
      q(); return box;
    }
    function draw() {
      body.textContent = ''; var S = B.SCRIPTS[SC.lang], rom = function (g) { return B.translit(g, set.scheme) || g; };
      body.appendChild(grid(t('scVowels'), S.vowels, function (g) { return cell(g, rom(g)); }));
      body.appendChild(grid(t('scCons'), S.cons, function (g) { return cell(g, rom(g)); }));
      body.appendChild(h('section', { class: 'panel' }, [h('h2', { text: t('scSigns') }), h('p', { class: 'note', text: t('scSignsNote', { b: S.base }) }), h('div', { class: 'glyphs' }, S.signs.map(function (s) { var g = S.base + s; return cell(g, rom(g)); }))]));
      body.appendChild(grid(t('scDigits'), S.digits, function (g, i) { return cell(g, String(i)); }));
      body.appendChild(quiz()); drawTrace(); body.appendChild(traceBox);
    }
    draw();
  };

  // ---------------- Phrases
  var PH = { cat: 'greet', lang: null };
  B.views.phrases = function (app) {
    app.textContent = ''; PH.lang = PH.lang || set.focus;
    app.appendChild(h('h1', { text: t('nav_phrases') })); app.appendChild(h('p', { class: 'lede', text: t('phLede') }));
    var ls = h('select', { id: 'ph-lang', 'aria-label': t('language') }, B.INDIC.map(function (l) { return h('option', { value: l, text: U.langNative(l) + ' · ' + U.langName(l) }); })); ls.value = PH.lang;
    ls.addEventListener('change', function () { PH.lang = ls.value; draw(); });
    var tabs = h('div', { class: 'tabs', role: 'tablist' }), list = h('div', { class: 'ph-list' });
    B.PHRASE_CATS.forEach(function (c) { tabs.appendChild(h('button', { type: 'button', role: 'tab', class: 'tab', 'data-c': c, text: t('cat_' + c), onclick: function () { PH.cat = c; draw(); } })); });
    app.appendChild(h('div', { class: 'tools' }, [h('div', { class: 'tf' }, [h('label', { for: 'ph-lang', text: t('language') }), ls])])); app.appendChild(tabs); app.appendChild(list);
    app.appendChild(h('p', { class: 'note', text: t('phNote') }));
    function draw() {
      [].forEach.call(tabs.children, function (b) { var on = b.getAttribute('data-c') === PH.cat; b.setAttribute('aria-selected', String(on)); b.classList.toggle('on', on); }); list.textContent = '';
      B.PHRASES.filter(function (p) { return p.cat === PH.cat; }).forEach(function (p) {
        var txt = p[PH.lang], tgt = h('div', { class: 'ph-t', lang: PH.lang }); tgt.appendChild(U.renderText(txt, PH.lang, { roman: false }));
        U.bindWords(tgt, function () { return PH.lang; }, function () { return txt; }, function () { draw(); });
        list.appendChild(h('div', { class: 'ph' }, [h('div', { class: 'ph-main' }, [tgt, h('div', { class: 'ph-r', text: B.translit(txt, set.scheme) }), h('div', { class: 'ph-n', text: p.en })]), h('div', { class: 'ph-a' }, [h('button', { type: 'button', class: 'abtn', 'aria-label': t('speak') + ': ' + p.en, text: '🔊', onclick: function () { U.speak(txt, PH.lang, null, set.rate); } }), h('button', { type: 'button', class: 'abtn', 'aria-label': t('slow') + ': ' + p.en, text: '🐢', onclick: function () { U.speak(txt, PH.lang, null, 0.55); } })])]));
      });
    }
    draw();
  };
})(window.B);
