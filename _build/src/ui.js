/* Bhasha UI foundation: helpers, settings, storage, speech, saved words, word popup. */
(function (B) {
  'use strict';
  var U = B.ui = {};
  var $ = U.$ = function (s, r) { return (r || document).querySelector(s); };
  var h = U.h = function (tag, a, kids) {
    var e = document.createElement(tag);
    if (a) for (var k in a) { var v = a[k]; if (v == null || v === false) continue; if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v); }
    (kids || []).forEach(function (c) { if (c == null || c === false) return; e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  };
  var store = U.store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } } };
  function jget(k, d) { try { var v = JSON.parse(store.get(k)); return v == null ? d : v; } catch (e) { return d; } }

  // ---------- settings
  var UILANGS = ['en', 'hi', 'te', 'kn', 'ta', 'ml', 'bn', 'mr', 'ko', 'es', 'de', 'fr', 'gu', 'as'], MAINSITE = ['en', 'hi', 'te', 'kn', 'ta', 'ml'];
  U.UILANGS = UILANGS; U.MAINSITE = MAINSITE;
  var set = U.set = (function () {
    var s = jget('bh-set', {}), nl = (navigator.language || 'en').toLowerCase().slice(0, 2), sl = store.get('el-lang');
    if (UILANGS.indexOf(s.ui) < 0) s.ui = UILANGS.indexOf(sl) >= 0 ? sl : (UILANGS.indexOf(nl) >= 0 ? nl : 'en');
    if (B.INDIC.indexOf(s.focus) < 0) s.focus = 'te';
    if (s.scheme !== 'iast') s.scheme = 'simple';
    if (s.roman == null) s.roman = true;
    if (!(s.perDay >= 0)) s.perDay = 10;
    if (!(s.rate > 0)) s.rate = 0.9;
    if (['ask', 'yes', 'no'].indexOf(s.ov) < 0) s.ov = 'ask';
    if (s.sound == null) s.sound = true;
    if (s.haptic == null) s.haptic = true;
    s.theme = document.documentElement.getAttribute('data-theme') || 'light';
    return s;
  })();
  U.saveSet = function () { store.set('bh-set', JSON.stringify({ ui: set.ui, focus: set.focus, scheme: set.scheme, roman: set.roman, perDay: set.perDay, rate: set.rate, ov: set.ov, sound: set.sound, haptic: set.haptic })); if (MAINSITE.indexOf(set.ui) >= 0) store.set('el-lang', set.ui); store.set('el-theme', set.theme); };
  U.t = function (k, v) { var d = B.I18N[set.ui] || B.I18N.en, s = d[k]; if (s == null) s = B.I18N.en[k]; if (s == null) s = k; if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]); return s; };
  var t = U.t;
  U.applyTheme = function () { document.documentElement.setAttribute('data-theme', set.theme); var m = $('meta[name=theme-color]'); if (m) m.setAttribute('content', { light: '#1c1b4b', dark: '#1c1b4b', new: '#0b3d3a' }[set.theme]); };
  U.applyLang = function () { document.documentElement.lang = set.ui; };
  var toastT; U.toast = function (m) { var e = $('#toast'); if (!e) return; e.textContent = m; e.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { e.hidden = true; }, 2200); };
  U.langName = function (c) { var a = B.allLangs().filter(function (x) { return x[0] === c; })[0]; return a ? a[1] : c; };
  U.langNative = function (c) { var a = B.allLangs().filter(function (x) { return x[0] === c; })[0]; return a ? a[2] : c; };
  U.roman = function (w, lang) { return B.isBrahmic(w) ? B.translit(w, set.scheme, lang) : ''; };
  U.today = function () { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

  // ---------- speech lives in speech.js (device voices with an offline fallback)

  // ---------- saved words
  var W = U.words = { list: [] };
  W.load = function () { W.list = jget('bh-words', []).filter(function (x) { return x && x.w && x.lang; }); };
  W.save = function () { if (!store.set('bh-words', JSON.stringify(W.list))) U.toast(t('storageFull')); };
  W.id = function (lang, w) { return lang + ':' + B.normWord(w); };
  W.get = function (lang, w) { var id = W.id(lang, w), i; for (i = 0; i < W.list.length; i++) if (W.list[i].id === id) return W.list[i]; return null; };
  W.put = function (e) { var old = W.get(e.lang, e.w); if (old) { Object.keys(e).forEach(function (k) { if (e[k] !== undefined) old[k] = e[k]; }); } else { var n = Object.assign({ m: '', c: '', n: '', st: 1, added: Date.now() }, B.srsNew(), e); n.w = B.normWord(e.w); n.id = W.id(e.lang, e.w); W.list.push(n); old = n; } W.save(); return old; };
  W.del = function (id) { W.list = W.list.filter(function (x) { return x.id !== id; }); W.save(); };
  W.due = function (lang) { var now = Date.now(); return W.list.filter(function (x) { return x.st < 2 && x.due <= now && (!lang || x.lang === lang); }); };
  W.load();
  var ST = U.stats = jget('bh-stats', {});
  U.logReview = function () { var d = U.today(); ST[d] = (ST[d] || 0) + 1; store.set('bh-stats', JSON.stringify(ST)); };
  U.streak = function () { var n = 0, d = new Date(); function key(x) { return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); } if (!ST[key(d)]) d.setDate(d.getDate() - 1); while (ST[key(d)]) { n++; d.setDate(d.getDate() - 1); } return n; };

  // phrase lookup: word -> English meaning of a phrase that contains it
  var phraseMap = null;
  U.phraseHint = function (lang, w) {
    if (!B.LANGS[lang]) return null;
    if (!phraseMap) { phraseMap = {}; B.INDIC.forEach(function (l) { phraseMap[l] = {}; B.PHRASES.forEach(function (p) { B.tokenize(p[l], l).forEach(function (x) { if (x.w) { var k = B.normWord(x.t); if (!phraseMap[l][k] || p.cat === 'num' || p.en.length < phraseMap[l][k].length) phraseMap[l][k] = p.en; } }); }); }); }
    return phraseMap[lang][B.normWord(w)] || null;
  };

  // optional on-device translation (Chrome Translator API) when present
  U.canTranslate = function () { return typeof self !== 'undefined' && 'Translator' in self; };
  var trCache = {};
  U.translate = function (text, from, to) {
    if (!U.canTranslate()) return Promise.reject(new Error('unsupported'));
    var key = from + '>' + to;
    var p = trCache[key] || (trCache[key] = Translator.availability({ sourceLanguage: from, targetLanguage: to }).then(function (a) { if (a === 'unavailable') throw new Error('unavailable'); return Translator.create({ sourceLanguage: from, targetLanguage: to }); }));
    return p.then(function (tr) { return tr.translate(text); });
  };

  // ---------- word popup (bottom sheet)
  var pop = null, popCtx = null;
  U.closePopup = function () { if (pop) { pop.remove(); pop = null; } document.querySelectorAll('.tk.sel').forEach(function (x) { x.classList.remove('sel'); }); };
  U.openPopup = function (o) { // {word, lang, context, onChange, anchor}
    U.closePopup(); popCtx = o;
    var w = o.word, lang = o.lang, saved = W.get(lang, w), rom = U.roman(w, lang), hint = U.phraseHint(lang, w);
    var meaning = h('input', { type: 'text', id: 'pw-m', value: saved ? saved.m : (hint && U.isNum(w, lang) ? hint : ''), placeholder: t('meaning'), 'aria-label': t('meaning') });
    var status = h('div', { class: 'seg', role: 'group', 'aria-label': t('status') });
    var st = saved ? saved.st : 1;
    [[1, t('st1')], [2, t('st2')]].forEach(function (x) { status.appendChild(h('button', { type: 'button', 'aria-pressed': String(st === x[0]), text: x[1], onclick: function () { st = x[0]; [].forEach.call(status.children, function (b, i) { b.setAttribute('aria-pressed', String([1, 2][i] === st)); }); } })); });
    var tr = h('div', { class: 'pw-tr', 'aria-live': 'polite' });
    var body = h('div', { class: 'pw' }, [
      h('div', { class: 'pw-head' }, [h('div', null, [h('div', { class: 'pw-word', lang: lang, text: w }), rom ? h('div', { class: 'pw-rom', text: rom }) : null]), h('button', { type: 'button', class: 'abtn', 'aria-label': t('speak'), text: '🔊', onclick: function () { U.speak(w, lang); } }), h('button', { type: 'button', class: 'abtn', 'aria-label': t('close'), text: '✕', onclick: U.closePopup })]),
      hint && !saved ? h('div', { class: 'pw-hint', text: t('seenIn') + ': ' + hint }) : null,
      o.context ? h('div', { class: 'pw-ctx', lang: lang, text: o.context }) : null,
      h('label', { for: 'pw-m', class: 'sr', text: t('meaning') }), meaning, tr,
      h('div', { class: 'pw-row' }, [status]),
      h('div', { class: 'pw-row' }, [
        h('button', { type: 'button', class: 'abtn gold', text: saved ? t('update') : t('save'), onclick: function () { var e = W.put({ w: w, lang: lang, m: meaning.value.trim(), c: o.context || (saved && saved.c) || '', st: st }); U.toast(t('saved')); if (st === 2) { } if (o.onChange) o.onChange(e); U.closePopup(); } }),
        saved ? h('button', { type: 'button', class: 'abtn', text: t('remove'), onclick: function () { W.del(saved.id); if (o.onChange) o.onChange(null); U.closePopup(); } }) : null,
        o.context ? h('button', { type: 'button', class: 'abtn', text: t('speakSentence'), onclick: function () { U.speak(o.context, lang); } }) : null,
        U.canTranslate() ? h('button', { type: 'button', class: 'abtn', text: t('translateDevice'), onclick: function () { tr.textContent = '…'; U.translate(o.context && o.sentence ? o.context : w, lang, 'en').then(function (r) { tr.textContent = r; if (!meaning.value && !o.sentence) meaning.value = r; }, function () { tr.textContent = t('trFail'); }); } }) : null
      ]),
      h('div', { class: 'pw-links' }, [t('lookup') + ': ', h('a', { href: 'https://en.wiktionary.org/wiki/' + encodeURIComponent(w), target: '_blank', rel: 'noopener noreferrer', text: 'Wiktionary' }), ' · ', h('a', { href: 'https://translate.google.com/?sl=' + lang + '&tl=en&op=translate&text=' + encodeURIComponent(w), target: '_blank', rel: 'noopener noreferrer', text: 'Google Translate' }), h('span', { class: 'pw-ext', text: ' ' + t('opensTab') })])
    ]);
    pop = h('div', { class: 'popup', role: 'dialog', 'aria-label': t('wordDetails') }, [body]);
    document.body.appendChild(pop); setTimeout(function () { meaning.focus(); }, 30);
  };
  U.isNum = function (w, lang) { return B.PHRASES.some(function (p) { return p.cat === 'num' && B.LANGS[lang] && p[lang] === w; }); };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && pop) { U.closePopup(); } });

  // ---------- tokenised text rendering with clickable words
  // Returns a DOM fragment for `text`; words are buttons-like spans. opts: {lang, roman, color, onWord(wordEl, word, sentence)}
  U.renderText = function (text, lang, opts) {
    var frag = document.createDocumentFragment();
    B.tokenize(text, lang).forEach(function (tk) {
      if (!tk.w) { frag.appendChild(document.createTextNode(tk.t)); return; }
      var w = tk.t, nw = B.normWord(w), sv = W.get(lang, nw), cls = 'tk' + (sv ? (sv.st >= 2 ? ' known' : ' learn') : ' new');
      var el = h('span', { class: cls, role: 'button', tabindex: '0', 'data-w': w });
      if (opts && opts.roman && B.isBrahmic(w)) { var ru = h('ruby', null, [document.createTextNode(w), h('rt', { text: B.translit(w, set.scheme, lang) })]); el.appendChild(ru); } else el.textContent = w;
      frag.appendChild(el);
    });
    return frag;
  };
  U.bindWords = function (root, lang, getSentence, onChange) {
    function act(el) { if (!el || !el.classList.contains('tk')) return; document.querySelectorAll('.tk.sel').forEach(function (x) { x.classList.remove('sel'); }); el.classList.add('sel'); U.openPopup({ word: B.normWord(el.getAttribute('data-w')), lang: lang(), context: getSentence(el), onChange: onChange, anchor: el }); }
    root.addEventListener('click', function (e) { var el = e.target.closest ? e.target.closest('.tk') : null; if (el && root.contains(el)) act(el); });
    root.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('tk')) { e.preventDefault(); act(e.target); } });
  };
  U.langSelect = function (id, val, fn, withAuto, indicFirst) {
    var s = h('select', { id: id }); if (withAuto) s.appendChild(h('option', { value: 'auto', text: t('auto') }));
    var g1 = h('optgroup', { label: t('indianLangs') }), g2 = h('optgroup', { label: t('otherLangs') });
    B.allLangs().forEach(function (l) { (B.LANGS[l[0]] ? g1 : g2).appendChild(h('option', { value: l[0], text: l[2] + (l[1] !== l[2] ? ' · ' + l[1] : '') })); });
    s.appendChild(g1); s.appendChild(g2); s.value = val; s.addEventListener('change', function () { fn(s.value); }); return s;
  };
  U.file = function (accept, cb, asText) { var i = h('input', { type: 'file', accept: accept, class: 'sr' }); i.addEventListener('change', function () { var f = i.files[0]; if (!f) return; if (asText === false) cb(f); else { var r = new FileReader(); r.onload = function () { cb(String(r.result), f); }; r.readAsText(f); } }); document.body.appendChild(i); i.click(); setTimeout(function () { i.remove(); }, 60000); };
  U.download = function (name, text, type) { var a = h('a', { href: URL.createObjectURL(new Blob([text], { type: type || 'text/plain;charset=utf-8' })), download: name }); document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500); };
})(window.B);
