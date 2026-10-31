/* Free and private: says plainly what Bhasha does and does not do, shows what is saved in this browser,
   and lets you download, restore or delete all of it. Everything here is local. */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set;
  B.views = B.views || {};
  var KEYS = ['bh-set', 'bh-words', 'bh-stats', 'bh-lesson', 'bh-readtext'];
  function raw(k) { return U.store.get(k); }
  function size(k) { var v = raw(k); return v ? v.length : 0; }
  function kb(n) { return n < 1024 ? n + ' B' : (n / 1024).toFixed(1) + ' KB'; }
  function counts() {
    var w = 0, l = 0, s = 0, c = 0;
    try { w = (JSON.parse(raw('bh-words')) || []).length; } catch (e) { }
    try { var ls = JSON.parse(raw('bh-lesson')) || {}; Object.keys(ls).forEach(function (k) { l += Object.keys((ls[k] && ls[k].cards) || {}).length; }); } catch (e) { }
    try { s = Object.keys(JSON.parse(raw('bh-stats')) || {}).length; } catch (e) { }
    return { words: w, lesson: l, days: s };
  }
  B.views.privacy = function (app) {
    app.textContent = '';
    app.appendChild(h('h1', { text: '🔒 ' + t('pvTitle') })); app.appendChild(h('p', { class: 'lede', text: t('pvLede') }));
    var cards = h('div', { class: 'cards pv' });
    [['💚', 'pvFree', 'pvFreeT'], ['📱', 'pvPriv', 'pvPrivT'], ['🚫', 'pvNet', 'pvNetT'], ['🎙', 'pvMic', 'pvMicT']].forEach(function (c) {
      cards.appendChild(h('div', { class: 'card', style: 'cursor:default' }, [h('span', { class: 'ci', 'aria-hidden': 'true', text: c[0] }), h('b', { text: t(c[1]) }), h('span', { text: t(c[2]) })]));
    });
    app.appendChild(cards);
    var panel = h('section', { class: 'panel', id: 'pv-stored' }); app.appendChild(panel);
    function paint() {
      panel.textContent = ''; var c = counts();
      panel.appendChild(h('h2', { text: t('pvStored') }));
      var rows = [['pvWords', t('pvItems', { n: c.words }), 'bh-words'], ['pvLesson', t('pvItems', { n: c.lesson }), 'bh-lesson'], ['pvStats', t('pvItems', { n: c.days }), 'bh-stats'], ['pvSet', '', 'bh-set']];
      var ul = h('ul', { class: 'plain pv-list' });
      rows.forEach(function (r) { ul.appendChild(h('li', null, [h('b', { text: t(r[0]) }), h('span', { text: ' · ' + (r[1] ? r[1] + ' · ' : '') + kb(size(r[2])) })])); });
      var total = KEYS.reduce(function (a, k) { return a + size(k); }, 0);
      panel.appendChild(ul); panel.appendChild(h('p', { class: 'note', id: 'pv-total', text: t('pvTotal', { n: kb(total) }) }));
      var imp = U.file('.json,application/json', function (txt) {
        try {
          var d = JSON.parse(txt); if (!d || d.app !== 'bhasha') throw new Error('bad');
          if (d.words) U.store.set('bh-words', JSON.stringify(d.words)); if (d.stats) U.store.set('bh-stats', JSON.stringify(d.stats));
          if (d.lesson) U.store.set('bh-lesson', JSON.stringify(d.lesson)); if (d.settings) U.store.set('bh-set', JSON.stringify(d.settings));
          U.toast(t('pvImported')); setTimeout(function () { location.reload(); }, 600);
        } catch (e) { U.toast(t('pvBadFile')); }
      }, true);
      panel.appendChild(h('div', { class: 'acts' }, [
        h('button', { type: 'button', class: 'abtn gold', id: 'pv-export', text: '⬇ ' + t('pvExport'), onclick: function () {
          var o = { app: 'bhasha', v: 2, words: [], stats: {}, lesson: {}, settings: {} };
          try { o.words = JSON.parse(raw('bh-words')) || []; o.stats = JSON.parse(raw('bh-stats')) || {}; o.lesson = JSON.parse(raw('bh-lesson')) || {}; o.settings = JSON.parse(raw('bh-set')) || {}; } catch (e) { }
          U.download('bhasha-backup.json', JSON.stringify(o, null, 1), 'application/json');
        } }),
        h('button', { type: 'button', class: 'abtn', id: 'pv-import', text: '⬆ ' + t('pvImport'), onclick: function () { imp.click(); } }), imp,
        h('button', { type: 'button', class: 'abtn danger', id: 'pv-clear', text: '🗑 ' + t('pvClear'), onclick: ask })
      ]));
    }
    function ask() {
      var old = document.getElementById('pv-dlg'); if (old) old.remove();
      var box = h('div', { class: 'popup', id: 'pv-dlg', role: 'alertdialog', 'aria-label': t('pvClear') }, [h('div', { class: 'pw' }, [h('h2', { text: t('pvClear') }), h('p', { text: t('pvClearAsk') }), h('div', { class: 'acts' }, [
        h('button', { type: 'button', class: 'abtn danger', id: 'pv-yes', text: t('pvClearYes'), onclick: function () {
          KEYS.forEach(function (k) { try { localStorage.removeItem(k); } catch (e) { } }); U.words.load(); box.remove(); U.toast(t('pvCleared')); paint();
        } }),
        h('button', { type: 'button', class: 'abtn', id: 'pv-no', text: t('cancel'), onclick: function () { box.remove(); } })])])]);
      document.body.appendChild(box); var no = box.querySelector('#pv-no'); if (no) no.focus();
      box.addEventListener('keydown', function (e) { if (e.key === 'Escape') box.remove(); });
    }
    paint();
    app.appendChild(h('p', { class: 'note', text: t('pvLicence') }));
  };
})(window.B);
