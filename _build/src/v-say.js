/* Say it: type English, get the sentence in another language with romanization and voice.
   Order of attempts: exact phrasebook match, on-device translator (if the browser has one), closest phrasebook entries. */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set;
  var Y = { to: null, text: '' };
  B.views = B.views || {};
  function norm(s) { return s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9'… ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  function toks(s) { return norm(s).replace(/…/g, ' ').split(' ').filter(Boolean); }
  // best phrasebook matches for an English sentence
  B.sayMatch = function (text, lang) {
    var q = norm(text), qt = toks(text), out = [];
    if (!qt.length) return out;
    B.PHRASES.forEach(function (p) {
      var pn = norm(p.en), pt = toks(p.en), score;
      if (pn === q) score = 1;
      else {
        var inter = pt.filter(function (w) { return qt.indexOf(w) >= 0; }).length, uni = pt.length + qt.length - inter;
        score = uni ? inter / uni : 0;
      }
      var tpl = null;
      if (p.en.indexOf('…') >= 0) { var pre = norm(p.en.split('…')[0]); if (pre && q.indexOf(pre) === 0 && q.length > pre.length) { tpl = text.trim().slice(pre.length).trim().replace(/[.!?]+$/, ''); score = Math.max(score, 0.95); } }
      if (score > 0) out.push({ p: p, score: score, tpl: tpl, text: tpl ? p[lang].replace('…', tpl) : p[lang] });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out;
  };
  B.views.say = function (app) {
    app.textContent = ''; U.stopSpeak(); Y.to = Y.to || set.focus;
    app.appendChild(h('h1', { text: t('nav_say') })); app.appendChild(h('p', { class: 'lede', text: t('sayLede') }));
    var ta = h('textarea', { id: 'sy-text', rows: 3, maxlength: 600, placeholder: t('sayPlaceholder'), 'aria-label': t('sayInput'), spellcheck: 'true', lang: 'en' }); ta.value = Y.text;
    var sel = h('select', { id: 'sy-to', 'aria-label': t('sayTo') }, B.LEARN.map(function (l) { return h('option', { value: l, text: U.langNative(l) + ' · ' + U.langName(l) }); })); sel.value = Y.to;
    var out = h('div', { class: 'say-out', 'aria-live': 'polite' }), status = h('p', { class: 'note', hidden: true });
    sel.addEventListener('change', function () { Y.to = sel.value; if (Y.text) go(false); });
    ta.addEventListener('input', function () { Y.text = ta.value; });
    ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); go(true); } });
    var goBtn = h('button', { type: 'button', class: 'abtn gold', text: '🔊 ' + t('sayGo'), onclick: function () { go(true); } });
    app.appendChild(h('section', { class: 'panel' }, [h('div', { class: 'tools' }, [h('div', { class: 'tf grow' }, [h('label', { for: 'sy-text', text: t('sayInput') }), ta]), h('div', { class: 'tf' }, [h('label', { for: 'sy-to', text: t('sayTo') }), sel])]),
      h('div', { class: 'acts' }, [goBtn, h('button', { type: 'button', class: 'abtn', text: '🔊 ' + t('sayEnglish'), onclick: function () { if (ta.value.trim()) U.speak(ta.value.trim(), 'en', null, set.rate); } }), h('button', { type: 'button', class: 'abtn', text: t('clear'), onclick: function () { ta.value = ''; Y.text = ''; out.textContent = ''; status.hidden = true; ta.focus(); } })]), status]));
    app.appendChild(out);
    app.appendChild(h('p', { class: 'note', text: t('sayNote') }));
    var seq = 0;
    function row(text, lang, label, speakNow) {
      var main = h('div', { class: 'ph-t', lang: lang }); main.appendChild(U.renderText(text, lang, { roman: false }));
      U.bindWords(main, function () { return lang; }, function () { return text; }, function () { });
      var rom = B.isBrahmic(text) ? B.translit(text, set.scheme, lang) : '';
      var el = h('div', { class: 'ph say-row' }, [h('div', { class: 'ph-main' }, [main, rom ? h('div', { class: 'ph-r', text: rom }) : null, label ? h('div', { class: 'ph-n', text: label }) : null]),
        h('div', { class: 'ph-a' }, [h('button', { type: 'button', class: 'abtn', 'aria-label': t('speak'), text: '🔊', onclick: function () { U.speak(text, lang, null, set.rate); } }), h('button', { type: 'button', class: 'abtn', 'aria-label': t('slow'), text: '🐢', onclick: function () { U.speak(text, lang, null, 0.55); } }), h('button', { type: 'button', class: 'abtn', 'aria-label': t('copy'), text: '⧉', onclick: function () { try { navigator.clipboard.writeText(text); U.toast(t('copied')); } catch (e) { } } })])]);
      return el;
    }
    function show(list, title, speakFirst) {
      out.textContent = ''; if (title) out.appendChild(h('h2', { text: title }));
      list.forEach(function (x, i) { out.appendChild(row(x.text, Y.to, x.label)); });
      if (speakFirst && list.length) U.speak(list[0].text, Y.to, null, set.rate);
    }
    function go(speak) {
      var text = ta.value.trim(); Y.text = ta.value; status.hidden = true; if (!text) { ta.focus(); return; }
      var my = ++seq, lang = Y.to, m = B.sayMatch(text, lang), best = m[0];
      if (best && best.score >= 0.95) { show([{ text: best.text, label: t('sayMatch') + ': ' + best.p.en }], t('sayResult'), speak); return; }
      var near = m.filter(function (x) { return x.score >= 0.2; }).slice(0, 4).map(function (x) { return { text: x.text, label: x.p.en }; });
      function fallback(msg) { if (my !== seq) return; status.hidden = false; status.textContent = msg; if (near.length) show(near, t('sayClosest'), false); else out.textContent = ''; }
      if (!U.canTranslate()) { fallback(t('sayNone')); return; }
      out.textContent = ''; status.hidden = false; status.textContent = t('sayWorking');
      U.translate(text, 'en', lang).then(function (r) {
        if (my !== seq) return; status.hidden = true; r = String(r || '').trim(); if (!r) { fallback(t('trFail')); return; }
        show([{ text: r, label: t('sayDevice') }], t('sayResult'), speak);
      }, function () { fallback(t('sayFail')); });
    }
    if (Y.text) go(false);
  };
})(window.B);
