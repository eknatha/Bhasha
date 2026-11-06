/* My words (saved list, import/export) and Review (spaced repetition). */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set, W = U.words;
  B.views = B.views || {};
  var F = { lang: 'all', st: 'all', q: '' };
  var V = { mode: 'w2m', lang: 'focus', queue: [], cur: null, shown: false, done: 0, total: 0, opts: null, picked: -1, only: null, run: null };

  B.views.words = function (app) {
    app.textContent = '';
    app.appendChild(h('h1', { text: t('nav_words') })); app.appendChild(h('p', { class: 'lede', text: t('wdLede') }));
    var listBox = h('div', { class: 'wd-list' }), sum = h('p', { class: 'note', 'aria-live': 'polite' });
    var langs = {}; W.list.forEach(function (x) { langs[x.lang] = 1; });
    var ls = h('select', { id: 'wd-lang', 'aria-label': t('language') }, [h('option', { value: 'all', text: t('allLangs') })].concat(Object.keys(langs).map(function (l) { return h('option', { value: l, text: U.langNative(l) }); }))); ls.value = langs[F.lang] ? F.lang : 'all'; F.lang = ls.value;
    var ss = h('select', { id: 'wd-st', 'aria-label': t('status') }, [['all', t('allStatus')], ['1', t('st1')], ['2', t('st2')]].map(function (o) { return h('option', { value: o[0], text: o[1] }); })); ss.value = F.st;
    var q = h('input', { type: 'search', id: 'wd-q', placeholder: t('search'), 'aria-label': t('search'), value: F.q });
    function rows() { var s = F.q.toLowerCase(); return W.list.filter(function (x) { return (F.lang === 'all' || x.lang === F.lang) && (F.st === 'all' || String(x.st) === F.st) && (!s || x.w.toLowerCase().indexOf(s) >= 0 || (x.m || '').toLowerCase().indexOf(s) >= 0); }).sort(function (a, b) { return b.added - a.added; }); }
    function draw() {
      var r = rows(); listBox.textContent = '';
      sum.textContent = t('wdCount', { n: r.length, d: W.due().length });
      if (!r.length) { listBox.appendChild(h('p', { class: 'empty', text: W.list.length ? t('wdNoMatch') : t('wdEmpty') })); return; }
      r.slice(0, 400).forEach(function (x) {
        var rm = B.isBrahmic(x.w) ? B.translit(x.w, set.scheme, x.lang) : '';
        var row = h('div', { class: 'wd-row' }, [
          h('div', { class: 'wd-main' }, [h('span', { class: 'wd-w', lang: x.lang, text: x.w }), rm ? h('span', { class: 'wd-r', text: rm }) : null, h('span', { class: 'wd-m', text: x.m || '—' }), x.c ? h('span', { class: 'wd-c', lang: x.lang, text: x.c }) : null]),
          h('div', { class: 'wd-side' }, [h('span', { class: 'chip ' + (x.st >= 2 ? 'ok' : 'lr'), text: x.st >= 2 ? t('st2') : t('st1') }), h('span', { class: 'wd-due', text: x.st >= 2 ? '' : (x.due <= Date.now() ? t('dueNow') : fmtDue(x.due)) }),
            h('button', { type: 'button', class: 'abtn', 'aria-label': t('speak') + ' ' + x.w, text: '🔊', onclick: function () { U.speak(x.w, x.lang, null, set.rate); } }),
            h('button', { type: 'button', class: 'abtn', text: t('edit'), onclick: function () { U.openPopup({ word: x.w, lang: x.lang, context: x.c, onChange: function () { draw(); }, anchor: row }); } }),
            h('button', { type: 'button', class: 'abtn danger', 'aria-label': t('remove') + ' ' + x.w, text: '✕', onclick: function () { W.del(x.id); draw(); } })])]);
        listBox.appendChild(row);
      });
      if (r.length > 400) listBox.appendChild(h('p', { class: 'note', text: t('wdMore', { n: r.length - 400 }) }));
    }
    function fmtDue(ts) { var d = Math.round((ts - Date.now()) / 864e5); return d <= 0 ? t('dueToday') : t('dueIn', { n: d }); }
    ls.addEventListener('change', function () { F.lang = ls.value; draw(); }); ss.addEventListener('change', function () { F.st = ss.value; draw(); }); q.addEventListener('input', function () { F.q = q.value; draw(); });
    function exp(kind) {
      var r = rows(); if (!r.length) { U.toast(t('wdNothing')); return; }
      if (kind === 'csv') U.download('bhasha-words.csv', '﻿' + B.csv([['word', 'language', 'meaning', 'context', 'notes', 'status']].concat(r.map(function (x) { return [x.w, x.lang, x.m, x.c, x.n, x.st]; }))), 'text/csv;charset=utf-8');
      else if (kind === 'anki') U.download('bhasha-anki.txt', B.csv(r.map(function (x) { return [x.w + (B.isBrahmic(x.w) ? ' (' + B.translit(x.w, set.scheme) + ')' : ''), x.m + (x.c ? '<br><i>' + x.c.replace(/</g, '&lt;') + '</i>' : ''), x.lang]; }), '\t'), 'text/tab-separated-values;charset=utf-8');
      else U.download('bhasha-backup.json', JSON.stringify({ app: 'bhasha', v: 1, words: W.list, stats: U.stats }, null, 1), 'application/json');
    }
    function imp() {
      U.file('.csv,.json,.txt,text/csv,application/json', function (text, f) {
        var n = 0, add = function (w, lang, m, c, nt, st) { w = (w || '').trim(); if (!w) return; lang = (lang || '').trim() || set.focus; if (!B.allLangs().some(function (x) { return x[0] === lang; })) lang = set.focus; if (!W.get(lang, w)) n++; W.put({ w: w, lang: lang, m: m || undefined, c: c || undefined, n: nt || undefined, st: +st >= 2 ? 2 : 1 }); };
        try {
          if (/\.json$/i.test(f.name) || text.trim()[0] === '{') { var o = JSON.parse(text); (o.words || []).forEach(function (x) { if (x && x.w && x.lang) { if (!W.get(x.lang, x.w)) n++; var e = Object.assign({}, x); delete e.id; W.put(e); } }); }
          else { var rows2 = B.parseCsv(text, /\t/.test(text.split('\n')[0]) && text.split('\n')[0].indexOf(',') < 0 ? '\t' : ','); if (rows2.length && /^word$/i.test((rows2[0][0] || '').trim())) rows2.shift(); rows2.forEach(function (r) { add(r[0], r[1], r[2], r[3], r[4], r[5]); }); }
          W.save(); U.toast(t('wdImported', { n: n })); draw();
        } catch (e) { U.toast(t('wdImportFail')); }
      });
    }
    app.appendChild(h('section', { class: 'panel' }, [
      h('div', { class: 'tools' }, [h('div', { class: 'tf' }, [h('label', { for: 'wd-lang', text: t('language') }), ls]), h('div', { class: 'tf' }, [h('label', { for: 'wd-st', text: t('status') }), ss]), h('div', { class: 'tf grow' }, [h('label', { for: 'wd-q', text: t('search') }), q])]),
      h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn gold', text: '▶ ' + t('nav_review'), onclick: function () { U.go('/review/'); } }), h('button', { type: 'button', class: 'abtn', id: 'wd-manage', text: '⚙ ' + t('nav_manage'), onclick: function () { U.go('/manage/'); } }), h('button', { type: 'button', class: 'abtn', text: '⬇ CSV', onclick: function () { exp('csv'); } }), h('button', { type: 'button', class: 'abtn', text: '⬇ Anki', onclick: function () { exp('anki'); } }), h('button', { type: 'button', class: 'abtn', text: '⬇ ' + t('backup'), onclick: function () { exp('json'); } }), h('button', { type: 'button', class: 'abtn', text: '⬆ ' + t('importWords'), onclick: imp }), ]),
      sum, listBox, h('p', { class: 'note', text: t('wdPrivacy') })]));
    draw();
  };

  // ---------------- Review
  function pool() { if (V.run) return W.list.filter(function (x) { return V.run.indexOf(x.id) >= 0 && x.st < 2 && !x.sus; }); var l = V.lang === 'focus' ? set.focus : V.lang; return W.due(l === 'all' ? null : l); }
  function nextOptions(card) { // 3 distractor meanings for meaning->word is not needed; typed/reveal flow keeps it simple
    return null;
  }
  B.views.review = function (app) {
    app.textContent = ''; U.stopSpeak(); V.run = V.only; V.only = null;
    app.appendChild(h('h1', { text: t('nav_review') })); app.appendChild(h('p', { class: 'lede', text: t('rvLede') }));
    var box = h('div', { class: 'rv' });
    var modeSel = h('select', { id: 'rv-mode', 'aria-label': t('rvMode') }, [['w2m', t('rvW2M')], ['m2w', t('rvM2W')], ['listen', t('rvListen')], ['cloze', t('rvCloze')]].map(function (o) { return h('option', { value: o[0], text: o[1] }); })); modeSel.value = V.mode;
    var langs = {}; W.list.forEach(function (x) { langs[x.lang] = 1; });
    var ls = h('select', { id: 'rv-lang', 'aria-label': t('language') }, [h('option', { value: 'focus', text: U.langNative(set.focus) }), h('option', { value: 'all', text: t('allLangs') })].concat(Object.keys(langs).filter(function (l) { return l !== set.focus; }).map(function (l) { return h('option', { value: l, text: U.langNative(l) }); }))); ls.value = V.lang;
    function start() { V.queue = pool().sort(function (a, b) { return a.due - b.due; }); var cap = set.perDay > 0 ? set.perDay : 9999; V.queue = V.queue.slice(0, Math.max(cap, 1)); V.total = V.queue.length; V.done = 0; V.shown = false; draw(); }
    modeSel.addEventListener('change', function () { V.mode = modeSel.value; V.shown = false; draw(); }); ls.addEventListener('change', function () { V.lang = ls.value; start(); });
    app.appendChild(h('div', { class: 'tools' }, [h('div', { class: 'tf' }, [h('label', { for: 'rv-mode', text: t('rvMode') }), modeSel]), h('div', { class: 'tf' }, [h('label', { for: 'rv-lang', text: t('language') }), ls])]));
    app.appendChild(box);
    app.appendChild(h('p', { class: 'note', text: t('rvStreak', { n: U.streak() }) }));
    function mask(c, w) { return c.split(w).join('_____'); }
    function draw() {
      box.textContent = ''; U.stopSpeak();
      var c = V.queue[0];
      if (!c) {
        var more = W.list.filter(function (x) { return x.st < 2; }).length;
        box.appendChild(h('div', { class: 'panel center' }, [h('h2', { text: V.total ? t('rvDone', { n: V.done }) : (W.list.length ? t('rvNone') : t('wdEmpty')) }), h('p', { text: V.total ? t('rvDoneSub') : (more ? t('rvNoneSub') : t('wdEmptySub')) }), h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn gold', text: t('nav_read'), onclick: function () { U.go('/read/'); } }), h('button', { type: 'button', class: 'abtn', text: t('nav_words'), onclick: function () { U.go('/words/'); } })])]));
        return;
      }
      var mode = V.mode, hasCtx = !!(c.c && c.c.indexOf(c.w) >= 0), em = mode === 'cloze' && !hasCtx ? 'w2m' : mode;
      var rm = B.isBrahmic(c.w) ? B.translit(c.w, set.scheme, c.lang) : '';
      var front = h('div', { class: 'rv-front' }), back = h('div', { class: 'rv-back' });
      if (em === 'w2m') { front.appendChild(h('div', { class: 'rv-big', lang: c.lang, text: c.w })); if (set.roman && rm) front.appendChild(h('div', { class: 'rv-sub', text: rm })); }
      else if (em === 'm2w') { front.appendChild(h('div', { class: 'rv-big', text: c.m || '—' })); front.appendChild(h('div', { class: 'rv-sub', text: t('rvWhichWord') })); }
      else if (em === 'listen') { front.appendChild(h('button', { type: 'button', class: 'abtn gold big', text: '🔊 ' + t('rvPlay'), onclick: function () { U.speak(c.w, c.lang, null, set.rate); } })); front.appendChild(h('div', { class: 'rv-sub', text: t('rvListenQ') })); setTimeout(function () { if (!V.shown) U.speak(c.w, c.lang, null, set.rate); }, 200); }
      else { front.appendChild(h('div', { class: 'rv-ctx', lang: c.lang, text: mask(c.c, c.w) })); front.appendChild(h('div', { class: 'rv-sub', text: c.m ? t('rvHint') + ': ' + c.m : '' })); }
      back.appendChild(h('div', { class: 'rv-big', lang: c.lang, text: c.w })); if (rm) back.appendChild(h('div', { class: 'rv-sub', text: rm })); back.appendChild(h('div', { class: 'rv-mean', text: c.m || '—' })); if (c.c) back.appendChild(h('div', { class: 'rv-ctx', lang: c.lang, text: c.c }));
      back.appendChild(h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn', text: '🔊 ' + t('speak'), onclick: function () { U.speak(c.w, c.lang, null, set.rate); } })]));
      var grades = h('div', { class: 'rv-grades' });
      [[0, t('again')], [1, t('hard')], [2, t('good')], [3, t('easy')]].forEach(function (g) { grades.appendChild(h('button', { type: 'button', class: 'abtn g' + g[0], 'data-g': g[0], onclick: function () { grade(g[0]); } }, [h('span', { text: g[1] }), h('small', { text: B.srsLabel(c, g[0], Date.now()) })])); });
      var show = h('button', { type: 'button', class: 'abtn gold wide', text: t('rvShow'), onclick: function () { V.shown = true; draw(); } });
      var prog = h('div', { class: 'rv-prog', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(V.total), 'aria-valuenow': String(V.done), 'aria-label': t('rvProgress') }, [h('span', { style: 'width:' + Math.round(100 * V.done / Math.max(1, V.total)) + '%' })]);
      box.appendChild(h('div', { class: 'panel rv-card' }, [prog, h('div', { class: 'rv-count', text: (V.done + 1) + ' / ' + V.total + ' · ' + U.langNative(c.lang) }), V.shown ? h('div', null, [back, grades]) : h('div', null, [front, show])]));
      if (V.shown) { var gb = box.querySelector('.g2'); if (gb) gb.focus(); } else { show.focus(); }
    }
    function grade(g) {
      var c = V.queue.shift(); if (!c) return;
      var n = B.srsNext(c, g); c.iv = n.iv; c.ef = n.ef; c.reps = n.reps; c.lapses = n.lapses; c.due = n.due; W.save(); U.logReview();
      if (g === 0) V.queue.push(c); else V.done++;
      V.shown = false; draw();
    }
    var kh = function (e) {
      if (!document.getElementById('app') || !box.isConnected) { document.removeEventListener('keydown', kh); return; }
      if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName) || e.ctrlKey || e.metaKey) return;
      if (!V.queue[0]) return;
      if (!V.shown && (e.key === ' ' || e.key === 'Enter') && !(e.target && e.target.tagName === 'BUTTON')) { e.preventDefault(); V.shown = true; draw(); }
      else if (V.shown && /^[1-4]$/.test(e.key)) { grade(+e.key - 1); }
    };
    document.addEventListener('keydown', kh);
    start();
  };
  // ---------------- Review manager: every card, its state, and bulk actions
  var M = { lang: 'all', f: 'all', sort: 'due', q: '', sel: {}, confirm: false };
  function cstate(x, now) {
    if (x.sus) return 'paused'; if (x.st >= 2) return 'known';
    if (!x.reps && !x.lapses) return 'new'; return x.iv >= 21 ? 'mature' : 'learning';
  }
  function isWeak(x) { return x.st < 2 && !x.sus && ((x.lapses || 0) >= 2 || (x.ef || 2.5) < 2.0); }
  function isDue(x, now) { return x.st < 2 && !x.sus && x.due <= now; }
  B.views.manage = function (app) {
    app.textContent = ''; U.stopSpeak(); var now = Date.now();
    app.appendChild(h('h1', { text: t('nav_manage') })); app.appendChild(h('p', { class: 'lede', text: t('mgLede') }));
    if (!W.list.length) { app.appendChild(h('div', { class: 'panel center' }, [h('h2', { text: t('wdEmpty') }), h('p', { text: t('wdEmptySub') }), h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn gold', text: t('nav_read'), onclick: function () { U.go('/read/'); } })])])); return; }
    var counts = { all: W.list.length, new: 0, learning: 0, mature: 0, known: 0, paused: 0, due: 0, weak: 0 };
    W.list.forEach(function (x) { counts[cstate(x, now)]++; if (isDue(x, now)) counts.due++; if (isWeak(x)) counts.weak++; });
    var tabs = h('div', { class: 'tabs', role: 'group', 'aria-label': t('mgFilter') });
    ['all', 'due', 'weak', 'new', 'learning', 'mature', 'known', 'paused'].forEach(function (f) {
      tabs.appendChild(h('button', { type: 'button', class: 'tab' + (M.f === f ? ' on' : ''), 'data-f': f, 'aria-pressed': String(M.f === f), text: t('mg_' + f) + ' · ' + counts[f], onclick: function () { M.f = f; M.sel = {}; M.confirm = false; B.views.manage(app); var b = app.querySelector('.tab.on'); if (b) b.focus(); } }));
    });
    app.appendChild(tabs);
    var langs = {}; W.list.forEach(function (x) { langs[x.lang] = 1; });
    var ls = h('select', { id: 'mg-lang', 'aria-label': t('language') }, [h('option', { value: 'all', text: t('allLangs') })].concat(Object.keys(langs).map(function (l) { return h('option', { value: l, text: U.langNative(l) }); }))); ls.value = langs[M.lang] ? M.lang : 'all'; M.lang = ls.value;
    var so = h('select', { id: 'mg-sort', 'aria-label': t('mgSort') }, [['due', t('mgSDue')], ['lapses', t('mgSLapses')], ['ease', t('mgSEase')], ['new', t('mgSNew')], ['az', t('mgSAz')]].map(function (o) { return h('option', { value: o[0], text: o[1] }); })); so.value = M.sort;
    var q = h('input', { type: 'search', id: 'mg-q', placeholder: t('search'), 'aria-label': t('search'), value: M.q });
    app.appendChild(h('div', { class: 'tools' }, [h('div', { class: 'tf' }, [h('label', { for: 'mg-lang', text: t('language') }), ls]), h('div', { class: 'tf' }, [h('label', { for: 'mg-sort', text: t('mgSort') }), so]), h('div', { class: 'tf grow' }, [h('label', { for: 'mg-q', text: t('search') }), q])]));
    var weakBtn = h('button', { type: 'button', class: 'abtn gold', id: 'mg-weak', text: '🎯 ' + t('mgWeakGo'), disabled: !counts.weak, onclick: function () { practise(W.list.filter(isWeak).sort(function (a, b) { return (b.lapses || 0) - (a.lapses || 0); }).slice(0, 20)); } });
    app.appendChild(h('div', { class: 'acts' }, [weakBtn, h('button', { type: 'button', class: 'abtn', text: '▶ ' + t('nav_review'), onclick: function () { U.go('/review/'); } })]));
    var bar = h('div', { class: 'mg-bar', id: 'mg-bar' }), listBox = h('div', { class: 'wd-list', id: 'mg-list' });
    app.appendChild(h('section', { class: 'panel' }, [bar, listBox]));
    function rows() {
      var s = M.q.toLowerCase(), r = W.list.filter(function (x) {
        if (M.lang !== 'all' && x.lang !== M.lang) return false;
        if (s && x.w.toLowerCase().indexOf(s) < 0 && (x.m || '').toLowerCase().indexOf(s) < 0) return false;
        if (M.f === 'all') return true; if (M.f === 'due') return isDue(x, now); if (M.f === 'weak') return isWeak(x); return cstate(x, now) === M.f;
      });
      var cmp = { due: function (a, b) { return a.due - b.due; }, lapses: function (a, b) { return (b.lapses || 0) - (a.lapses || 0) || a.due - b.due; }, ease: function (a, b) { return (a.ef || 2.5) - (b.ef || 2.5); }, new: function (a, b) { return b.added - a.added; }, az: function (a, b) { return a.w.localeCompare(b.w); } };
      return r.sort(cmp[M.sort]);
    }
    function chosen() { return W.list.filter(function (x) { return M.sel[x.id]; }); }
    function practise(list) { if (!list.length) return; V.only = list.map(function (x) { return x.id; }); U.go('/review/'); }
    function bulk(fn, msg) { var c = chosen(); if (!c.length) return; c.forEach(fn); W.save(); U.toast(t(msg, { n: c.length })); M.sel = {}; M.confirm = false; B.views.manage(app); }
    function drawBar(r) {
      bar.textContent = ''; var n = chosen().length, all = h('input', { type: 'checkbox', id: 'mg-all', 'aria-label': t('mgSel') });
      all.checked = r.length > 0 && r.slice(0, 300).every(function (x) { return M.sel[x.id]; });
      all.addEventListener('change', function () { r.slice(0, 300).forEach(function (x) { if (all.checked) M.sel[x.id] = true; else delete M.sel[x.id]; }); M.confirm = false; draw(); });
      var dis = !n, b = function (id, label, fn, cls) { return h('button', { type: 'button', class: 'abtn' + (cls ? ' ' + cls : ''), id: id, disabled: dis, text: label, onclick: fn }); };
      bar.appendChild(h('label', { class: 'tf chk', for: 'mg-all' }, [all, h('span', { text: t('mgSel') })]));
      bar.appendChild(h('span', { class: 'chip', id: 'mg-n', 'aria-live': 'polite', text: t('mgSelected', { n: n }) }));
      bar.appendChild(h('div', { class: 'acts' }, [
        b('mg-practise', '▶ ' + t('mgPractise'), function () { practise(chosen().filter(function (x) { return x.st < 2 && !x.sus; })); }, 'gold'),
        b('mg-known', t('mgKnownBtn'), function () { bulk(function (x) { x.st = 2; delete x.sus; }, 'mgDone'); }),
        b('mg-learn', t('mgLearnBtn'), function () { bulk(function (x) { x.st = 1; delete x.sus; }, 'mgDone'); }),
        b('mg-reset', t('mgReset'), function () { bulk(function (x) { x.reps = 0; x.iv = 0; x.ef = 2.5; x.lapses = 0; x.due = Date.now(); x.st = 1; }, 'mgDone'); }),
        b('mg-pause', t('mgPause'), function () { bulk(function (x) { x.sus = true; }, 'mgDone'); }),
        b('mg-resume', t('mgResume'), function () { bulk(function (x) { delete x.sus; }, 'mgDone'); }),
        b('mg-del', M.confirm ? t('mgDelConfirm', { n: n }) : t('mgDel'), function () { if (!M.confirm) { M.confirm = true; drawBar(r); var bb = document.getElementById('mg-del'); if (bb) bb.focus(); return; } bulk(function (x) { W.list = W.list.filter(function (y) { return y !== x; }); }, 'mgDeleted'); }, 'danger')]));
    }
    function draw() {
      var r = rows(); listBox.textContent = ''; drawBar(r);
      if (!r.length) { listBox.appendChild(h('p', { class: 'empty', text: t('mgEmpty') })); return; }
      r.slice(0, 300).forEach(function (x) {
        var cb = h('input', { type: 'checkbox', 'data-id': x.id, 'aria-label': x.w }); cb.checked = !!M.sel[x.id];
        cb.addEventListener('change', function () { if (cb.checked) M.sel[x.id] = true; else delete M.sel[x.id]; M.confirm = false; drawBar(r); });
        var st = cstate(x, now), rm = B.isBrahmic(x.w) || x.lang === 'ja' ? B.translit(x.w, set.scheme, x.lang) : '';
        listBox.appendChild(h('div', { class: 'wd-row mg-row', 'data-state': st }, [cb,
          h('div', { class: 'wd-main' }, [h('span', { class: 'wd-w', lang: x.lang, text: x.w }), rm && rm !== x.w ? h('span', { class: 'wd-r', text: rm }) : null, h('span', { class: 'wd-m', text: x.m || '—' })]),
          h('div', { class: 'wd-side' }, [h('span', { class: 'chip ' + (st === 'known' ? 'ok' : st === 'paused' ? '' : 'lr'), text: t('mg_' + st) }), (x.lapses || 0) ? h('span', { class: 'chip', text: t('mgMisses', { n: x.lapses }) }) : null, x.st < 2 && !x.sus && x.reps ? h('span', { class: 'chip', text: t('mgInterval', { n: x.iv || 0 }) }) : null,
            h('button', { type: 'button', class: 'abtn', 'aria-label': t('speak') + ' ' + x.w, text: '🔊', onclick: function () { U.speak(x.w, x.lang, null, set.rate); } })])]));
      });
      if (r.length > 300) listBox.appendChild(h('p', { class: 'note', text: t('wdMore', { n: r.length - 300 }) }));
    }
    ls.addEventListener('change', function () { M.lang = ls.value; M.sel = {}; M.confirm = false; draw(); }); so.addEventListener('change', function () { M.sort = so.value; draw(); }); q.addEventListener('input', function () { M.q = q.value; draw(); });
    draw();
  };
})(window.B);
