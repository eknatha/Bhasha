/* Speech: device voices first, then an optional offline voice (eSpeak NG, GPL-3.0) if the device has none for a language. */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set;
  var sessionNo = false, voices = [], ready = null, tok = 0, dead = {}, engine = null, engineP = null, cache = {}, cacheKeys = [], audioEl = null;
  function load() { try { voices = window.speechSynthesis ? speechSynthesis.getVoices() || [] : []; } catch (e) { voices = []; } }
  U.canSpeak = function () { return 'speechSynthesis' in window; };
  if (U.canSpeak()) { load(); try { speechSynthesis.addEventListener('voiceschanged', load); } catch (e) { } }
  function whenVoices() {
    if (ready) return ready;
    ready = new Promise(function (res) {
      load(); if (voices.length || !U.canSpeak()) return res();
      var done = false; function fin() { if (done) return; done = true; load(); res(); }
      try { speechSynthesis.addEventListener('voiceschanged', fin); } catch (e) { } setTimeout(fin, 1500);
    });
    return ready;
  }
  // best device voice for a language: exact tag first, then same primary language; offline (local) voices win ties
  U.voiceFor = function (lang) {
    var code = B.bcp(lang).toLowerCase().replace('_', '-'), pre = code.split('-')[0], best = null, bs = -1, i, v, tag, sc;
    for (i = 0; i < voices.length; i++) {
      v = voices[i]; tag = (v.lang || '').toLowerCase().replace('_', '-'); if (tag.split('-')[0] !== pre) continue;
      sc = (tag === code ? 2 : 1) + (v.localService ? 0.5 : 0) + (v['default'] ? 0.1 : 0);
      if (sc > bs) { bs = sc; best = v; }
    }
    var want = set.voices && set.voices[lang];
    if (want && !dead[lang]) for (i = 0; i < voices.length; i++) if (voices[i].voiceURI === want && (voices[i].lang || '').toLowerCase().split(/[-_]/)[0] === pre) return voices[i];
    return dead[lang] ? null : best;
  };
  // speed: a language's own speed, unless a caller asks for a fixed slow speed
  U.rateFor = function (lang) { var r = set.rates && set.rates[lang]; return r > 0 ? r : set.rate; };
  U.voicesFor = function (lang) { load(); var pre = B.bcp(lang).toLowerCase().split(/[-_]/)[0]; return voices.filter(function (v) { return (v.lang || '').toLowerCase().split(/[-_]/)[0] === pre; }); };
  // ---- offline engine
  var ESP = { en: 'en-us', zh: 'cmn', pt: 'pt-pt', no: 'nb', iw: 'he' };
  function espCode(lang) { return ESP[lang] || lang; }
  function ensureEngine() {
    if (engine) return Promise.resolve(engine);
    if (engineP) return engineP;
    U.toast(t('ovLoading'));
    engineP = Promise.all([import('/vendor/espeak/espeak-ng.js'), fetch('/vendor/espeak/espeak-ng.wasm').then(function (r) { if (!r.ok) throw new Error('wasm'); return r.arrayBuffer(); })]).then(function (x) {
      return WebAssembly.compile(x[1]).then(function (mod) { engine = { factory: x[0].default, mod: mod }; return engine; });
    }).catch(function (e) { engineP = null; throw e; });
    return engineP;
  }
  function synth(text, lang, rate) {
    var wpm = Math.max(80, Math.min(350, Math.round(175 * (rate || set.rate)))), key = lang + '|' + wpm + '|' + text;
    if (cache[key]) return Promise.resolve(cache[key]);
    return ensureEngine().then(function (E) {
      return E.factory({ arguments: ['-v', espCode(lang), '-s', String(wpm), '-w', 'o.wav', ' ' + text], print: function () { }, printErr: function () { }, instantiateWasm: function (imports, ok) { WebAssembly.instantiate(E.mod, imports).then(function (i) { ok(i, E.mod); }); return {}; } });
    }).then(function (m) {
      var d = m.FS.readFile('o.wav'); if (d.length < 500) throw new Error('empty');
      var url = URL.createObjectURL(new Blob([d], { type: 'audio/wav' })); cache[key] = url; cacheKeys.push(key);
      if (cacheKeys.length > 40) { var old = cacheKeys.shift(); try { URL.revokeObjectURL(cache[old]); } catch (e) { } delete cache[old]; }
      return url;
    });
  }
  U.offlineLoaded = function () { return !!engine; };
  function ask(lang) {
    return new Promise(function (res) {
      if (set.ov === 'yes') return res(true); if (set.ov === 'no' || sessionNo) return res(false);
      U.closePopup(); var old = document.getElementById('ov-ask'); if (old) old.remove();
      function done(v, remember) { box.remove(); if (remember) { set.ov = v ? 'yes' : 'no'; U.saveSet(); } res(v); }
      var box = h('div', { class: 'popup', id: 'ov-ask', role: 'alertdialog', 'aria-label': t('ovAskQ', { l: U.langName(lang) }) }, [h('div', { class: 'pw' }, [h('p', { text: t('ovAskQ', { l: U.langName(lang) }) }), h('div', { class: 'pw-row' }, [h('button', { type: 'button', class: 'abtn gold', text: t('ovYes'), onclick: function () { done(true, true); } }), h('button', { type: 'button', class: 'abtn', text: t('ovNo'), onclick: function () { sessionNo = true; done(false, false); } })])])]);
      document.body.appendChild(box); box.querySelector('.gold').focus();
    });
  }
  function fallback(text, lang, onend, rate, my) {
    function fin() { if (onend) onend(); }
    ask(lang).then(function (yes) {
      if (!yes) { U.toast(t('noVoice', { l: U.langName(lang) })); return fin(); }
      return synth(text, lang, rate).then(function (url) {
        if (my !== tok) return;
        if (audioEl) { try { audioEl.pause(); } catch (e) { } }
        audioEl = new Audio(url); audioEl.onended = fin; audioEl.onerror = fin; var p = audioEl.play(); if (p && p.catch) p.catch(function () { U.toast(t('ovFail')); fin(); });
      });
    }).catch(function () { U.toast(t('ovFail')); fin(); });
  }
  // ---- native path with chunking and a watchdog
  function chunks(text, lang) {
    var out = [], cur = ''; B.sentences(text, lang).forEach(function (s) { if ((cur + s).length > 180 && cur) { out.push(cur); cur = s; } else cur += s; }); if (cur.trim()) out.push(cur); return out.length ? out : [text];
  }
  function nativeSpeak(v, text, lang, onend, rate, my) {
    var parts = chunks(text, lang), i = 0;
    function next() {
      if (my !== tok) return; if (i >= parts.length) { if (onend) onend(); return; }
      var u = new SpeechSynthesisUtterance(parts[i++]); u.lang = v.lang || B.bcp(lang); u.voice = v; u.rate = rate || set.rate;
      var started = false, ended = false, wd = setTimeout(function () { if (!started && !ended && my === tok) { dead[lang] = true; try { speechSynthesis.cancel(); } catch (e) { } fallback(parts.slice(i - 1).join(' '), lang, onend, rate, my); } }, 3500);
      u.onstart = function () { started = true; clearTimeout(wd); };
      u.onend = function () { if (ended) return; ended = true; clearTimeout(wd); next(); };
      u.onerror = function (e) { if (ended) return; ended = true; clearTimeout(wd); if (e && (e.error === 'canceled' || e.error === 'interrupted')) return; dead[lang] = true; fallback(parts.slice(i - 1).join(' '), lang, onend, rate, my); };
      try { speechSynthesis.speak(u); } catch (e) { clearTimeout(wd); dead[lang] = true; fallback(parts.slice(i - 1).join(' '), lang, onend, rate, my); }
    }
    try { speechSynthesis.cancel(); } catch (e) { }
    next();
  }
  U.speak = function (text, lang, onend, rate, fixed) {
    if (!text) { if (onend) onend(); return false; }
    var my = ++tok; if (audioEl) { try { audioEl.pause(); } catch (e) { } }
    if (!fixed && (rate == null || rate === set.rate)) rate = U.rateFor(lang);
    if (!U.canSpeak()) { fallback(text, lang, onend, rate, my); return true; }
    whenVoices().then(function () {
      if (my !== tok) return; load(); var v = U.voiceFor(lang);
      if (v) nativeSpeak(v, text, lang, onend, rate, my); else fallback(text, lang, onend, rate, my);
    });
    return true;
  };
  U.stopSpeak = function () { tok++; try { if (U.canSpeak()) speechSynthesis.cancel(); } catch (e) { } if (audioEl) { try { audioEl.pause(); } catch (e) { } } };
  U.voiceStatus = function (lang) { load(); var v = U.voiceFor(lang); return { device: v ? v.name : null, offline: !!engine, ov: set.ov }; };

  // ---- voice check dialog
  U.openVoiceCheck = function () {
    U.closePopup(); var old = document.getElementById('vc'); if (old) old.remove(); load();
    var box = h('div', { class: 'popup vc', id: 'vc', role: 'dialog', 'aria-label': t('voiceCheck') }), rows = h('div', { class: 'vc-rows' });
    function paint() {
      load(); rows.textContent = '';
      B.LEARN.concat(['en']).forEach(function (l) {
        var v = U.voiceFor(l), st = v ? t('vcDevice') + ': ' + v.name : (engine ? t('vcOffline') : (set.ov === 'no' ? t('vcNone') : t('vcOfflineAvail')));
        var phr = (B.PHRASES.filter(function (p) { return p.id === 'hello'; })[0] || {})[l] || 'Hello';
        var vs = U.voicesFor(l), vsel = null, rsel = null;
        if (vs.length) {
          vsel = h('select', { id: 'vc-v-' + l, 'aria-label': t('vcVoice') + ': ' + U.langName(l) }, [h('option', { value: '', text: t('vcAuto') })].concat(vs.map(function (x) { return h('option', { value: x.voiceURI, text: x.name + ' (' + x.lang + ')' }); })));
          vsel.value = (set.voices && set.voices[l]) || ''; if (vsel.value !== ((set.voices && set.voices[l]) || '')) vsel.value = '';
          vsel.addEventListener('change', function () { if (vsel.value) set.voices[l] = vsel.value; else delete set.voices[l]; delete dead[l]; U.saveSet(); var id = vsel.id; paint(); var nn = document.getElementById(id); if (nn) nn.focus(); });
        }
        rsel = h('select', { id: 'vc-r-' + l, 'aria-label': t('vcSpeed') + ': ' + U.langName(l) }, [h('option', { value: '', text: t('vcDefault') })].concat(['0.6', '0.75', '0.9', '1', '1.15'].map(function (x) { return h('option', { value: x, text: x + '×' }); })));
        rsel.value = set.rates && set.rates[l] ? String(set.rates[l]) : '';
        rsel.addEventListener('change', function () { if (rsel.value) set.rates[l] = +rsel.value; else delete set.rates[l]; U.saveSet(); });
        rows.appendChild(h('div', { class: 'vc-row' }, [h('div', { class: 'vc-l' }, [h('b', { text: U.langNative(l) }), h('span', { text: ' ' + U.langName(l) })]), h('div', { class: 'vc-s', text: st }), vsel ? h('label', { class: 'vc-c', for: 'vc-v-' + l }, [h('span', { text: t('vcVoice') }), vsel]) : null, h('label', { class: 'vc-c', for: 'vc-r-' + l }, [h('span', { text: t('vcSpeed') }), rsel]), h('button', { type: 'button', class: 'abtn', text: '🔊 ' + t('vcTest'), onclick: function () { U.speak(phr, l, function () { paint(); }); } })]));
      });
    }
    var seg = h('div', { class: 'seg', role: 'group', 'aria-label': t('ovLabel') });
    [['ask', t('ovAsk')], ['yes', t('on')], ['no', t('off')]].forEach(function (o) { seg.appendChild(h('button', { type: 'button', 'aria-pressed': String(set.ov === o[0]), text: o[1], onclick: function () { set.ov = o[0]; U.saveSet(); [].forEach.call(seg.children, function (b, i) { b.setAttribute('aria-pressed', String(['ask', 'yes', 'no'][i] === set.ov)); }); paint(); } })); });
    box.appendChild(h('div', { class: 'pw' }, [h('div', { class: 'pw-head' }, [h('h2', { text: t('voiceCheck') }), h('button', { type: 'button', class: 'abtn', 'aria-label': t('close'), text: '✕', onclick: function () { box.remove(); } })]), h('p', { class: 'note', text: t('vcLede') }), rows, h('label', { text: t('ovLabel') }), seg, h('p', { class: 'note', text: t('ovNote') })]));
    document.body.appendChild(box); paint(); whenVoices().then(paint);
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { box.remove(); document.removeEventListener('keydown', esc); } });
  };
})(window.B);
