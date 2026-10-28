/* Read view: paste or import text, click words, romanisation, read aloud. */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set;
  var R = { lang: 'auto', text: '', color: true, size: 22, editing: true, speaking: false, sIdx: -1 };
  B.views = B.views || {};
  B.views.read = function (app) {
    app.textContent = ''; U.stopSpeak(); R.speaking = false;
    if (!R.text) { try { R.text = U.store.get('bh-readtext') || ''; } catch (e) { } }
    var ta = h('textarea', { id: 'rd-text', rows: 7, placeholder: t('rdPlaceholder'), 'aria-label': t('rdText'), spellcheck: 'false' }); ta.value = R.text;
    var out = h('div', { class: 'rd-out', id: 'rd-out', 'aria-live': 'off' });
    var langSel = U.langSelect('rd-lang', R.lang, function (v) { R.lang = v; draw(); }, true);
    function curLang() { return R.lang === 'auto' ? (B.detectLang(R.text) || (set.focus)) : R.lang; }
    var romanCb = h('input', { type: 'checkbox', id: 'rd-rom' }); romanCb.checked = set.roman; romanCb.addEventListener('change', function () { set.roman = romanCb.checked; U.saveSet(); draw(); });
    var colorCb = h('input', { type: 'checkbox', id: 'rd-col' }); colorCb.checked = R.color; colorCb.addEventListener('change', function () { R.color = colorCb.checked; out.classList.toggle('nocolor', !R.color); });
    var scheme = h('select', { id: 'rd-sch' }, [h('option', { value: 'simple', text: t('schSimple') }), h('option', { value: 'iast', text: t('schIast') })]); scheme.value = set.scheme; scheme.addEventListener('change', function () { set.scheme = scheme.value; U.saveSet(); draw(); });
    var size = h('input', { type: 'range', id: 'rd-size', min: 16, max: 44, value: R.size, 'aria-label': t('fontSize') }); size.addEventListener('input', function () { R.size = +size.value; out.style.fontSize = R.size + 'px'; });
    function sentences() { return B.sentences(R.text, curLang()); }
    function draw() {
      R.text = ta.value; U.store.set('bh-readtext', R.text.slice(0, 200000));
      out.textContent = ''; out.style.fontSize = R.size + 'px'; out.classList.toggle('nocolor', !R.color);
      var lang = curLang(), sens = sentences();
      if (!R.text.trim()) { out.appendChild(h('p', { class: 'empty', text: t('rdEmpty') })); stats.textContent = ''; return; }
      sens.forEach(function (s, i) { var sp = h('span', { class: 'sen', 'data-i': i, 'data-s': s }); sp.appendChild(U.renderText(s, lang, { roman: set.roman })); out.appendChild(sp); });
      updateStats(lang);
    }
    var stats = h('div', { class: 'rd-stats', 'aria-live': 'polite' });
    function updateStats(lang) { var tk = B.tokenize(R.text, lang).filter(function (x) { return x.w; }), uniq = {}; tk.forEach(function (x) { uniq[B.normWord(x.t)] = 1; }); var u = Object.keys(uniq), kn = u.filter(function (w) { var s = U.words.get(lang, w); return s && s.st >= 2; }).length, ln = u.filter(function (w) { var s = U.words.get(lang, w); return s && s.st < 2; }).length; stats.textContent = t('rdStats', { n: tk.length, u: u.length, k: kn, l: ln, lang: U.langName(lang) }); }
    U.bindWords(out, curLang, function (el) { var s = el.closest('.sen'); return s ? (s.getAttribute('data-s') || '').replace(/\s+/g, ' ').trim() : ''; }, function () { var sc = out.parentNode.scrollTop; draw(); });
    ta.addEventListener('input', function () { clearTimeout(ta._t); ta._t = setTimeout(draw, 250); });
    function readAloud() {
      if (R.speaking) { R.speaking = false; U.stopSpeak(); mark(-1); btnRead.textContent = '▶ ' + t('readAloud'); return; }
      var sens = out.querySelectorAll('.sen'), lang = curLang(), i = Math.max(0, R.sIdx < 0 ? 0 : R.sIdx);
      if (!sens.length) return; R.speaking = true; btnRead.textContent = '■ ' + t('stop');
      (function next() { if (!R.speaking || i >= sens.length) { R.speaking = false; mark(-1); btnRead.textContent = '▶ ' + t('readAloud'); return; } mark(i); var txt = sens[i].textContent.trim(); i++; if (!txt) return next(); U.speak(txt, lang, next); })();
    }
    function mark(i) { R.sIdx = i; out.querySelectorAll('.sen.speaking').forEach(function (x) { x.classList.remove('speaking'); }); if (i >= 0) { var s = out.querySelectorAll('.sen')[i]; if (s) { s.classList.add('speaking'); s.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } } }
    var btnRead = h('button', { type: 'button', class: 'abtn gold', text: '▶ ' + t('readAloud'), onclick: readAloud });
    var tools = h('div', { class: 'tools' }, [
      h('div', { class: 'tf' }, [h('label', { for: 'rd-lang', text: t('textLang') }), langSel]),
      h('div', { class: 'tf chk' }, [romanCb, h('label', { for: 'rd-rom', text: t('showRoman') })]),
      h('div', { class: 'tf' }, [h('label', { for: 'rd-sch', text: t('scheme') }), scheme]),
      h('div', { class: 'tf chk' }, [colorCb, h('label', { for: 'rd-col', text: t('colorWords') })]),
      h('div', { class: 'tf' }, [h('label', { for: 'rd-size', text: t('fontSize') }), size])
    ]);
    var actions = h('div', { class: 'acts' }, [btnRead,
      h('button', { type: 'button', class: 'abtn', text: t('sample'), onclick: function () { var l = B.INDIC.indexOf(R.lang) >= 0 ? R.lang : set.focus; R.lang = l; langSel.value = l; ta.value = B.sampleText(l); draw(); } }),
      h('button', { type: 'button', class: 'abtn', text: t('importTxt'), onclick: function () { U.file('.txt,.md,.srt,.vtt,text/plain', function (txt, f) { if (/\.(srt|vtt)$/i.test(f.name)) txt = B.parseSubs(txt).map(function (x) { return x.t; }).join('\n'); ta.value = txt; draw(); }); } }),
      h('button', { type: 'button', class: 'abtn', text: t('clear'), onclick: function () { ta.value = ''; draw(); } })]);
    app.appendChild(h('h1', { text: t('nav_read') })); app.appendChild(h('p', { class: 'lede', text: t('rdLede') }));
    app.appendChild(h('section', { class: 'panel' }, [h('h2', { text: t('rdText') }), ta, actions, tools]));
    app.appendChild(h('section', { class: 'panel rd-panel' }, [h('div', { class: 'legend2' }, [h('span', { class: 'tk new', text: t('st0') }), h('span', { class: 'tk learn', text: t('st1') }), h('span', { class: 'tk known', text: t('st2') }), h('span', { class: 'hint', text: t('clickWord') })]), out, stats]));
    draw();
  };
})(window.B);
