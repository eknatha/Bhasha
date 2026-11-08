/* Guided tour: a first-run welcome, a spotlight tour of the main screens, and short per-page tours.
   Everything is local. The only things stored are two small flags ("tour done" and "which page tours were seen"). */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set, $ = U.$;
  var tour = B.tour = {}, KEY = 'bh-tour', SEEN = 'bh-tours', cur = null;
  function lget(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lset(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function seen() { try { return JSON.parse(lget(SEEN) || '{}') || {}; } catch (e) { return {}; } }
  function markSeen(k) { var s = seen(); s[k] = 1; lset(SEEN, JSON.stringify(s)); }
  function reduced() { return !!(B.fx && B.fx.reduced()); }
  function visible(el) { return !!(el && el.getClientRects().length); }

  var MAIN = [
    { sel: '#mnav a[data-k="today"]', title: 'nav_today', body: 'ts1' },
    { sel: '#mnav a[data-k="say"]', title: 'nav_say', body: 'ts2' },
    { sel: '#mnav a[data-k="read"]', title: 'nav_read', body: 'ts3' },
    { sel: '#mnav a[data-k="review"]', title: 'nav_review', body: 'ts4' },
    { sel: '.pop > button', title: 'settings', body: 'ts5' },
    { sel: '#mnav', title: 'ts6t', body: 'ts6' }
  ];
  var MINI = {
    read: [{ sel: '#app textarea', title: 'nav_read', body: 'tm_read1' }, { sel: '#rd-mode', title: 'nav_read', body: 'tm_read2' }],
    review: [{ sel: '#rv-mode', title: 'nav_review', body: 'tm_rev1' }, { sel: '#app .panel', title: 'nav_review', body: 'tm_rev2' }],
    write: [{ sel: '#wr-lang', title: 'nav_write', body: 'tm_wr1' }, { sel: '#wr-box', title: 'nav_write', body: 'tm_wr2' }]
  };

  // ---------- spotlight
  tour.close = function () { if (cur) { cur.end(false); } };
  tour.run = function (steps, key) {
    tour.close();
    steps = steps.filter(function (s) { return visible($(s.sel)); });
    if (!steps.length) return;
    var opener = document.activeElement, i = 0;
    var hole = h('div', { class: 'tour-hole', 'aria-hidden': 'true' });
    var title = h('div', { class: 'tour-t', id: 'tour-t' }), body = h('p', { class: 'tour-b', id: 'tour-b' }), count = h('span', { class: 'tour-n' });
    var dots = h('div', { class: 'tour-dots', 'aria-hidden': 'true' }, steps.map(function () { return h('i'); }));
    var skip = h('button', { type: 'button', class: 'abtn tour-skip', 'data-quiet': '1', text: t('tw_skip'), onclick: function () { end(true); } });
    var back = h('button', { type: 'button', class: 'abtn', 'data-quiet': '1', text: t('tw_back'), onclick: function () { go(i - 1); } });
    var next = h('button', { type: 'button', class: 'abtn gold', 'data-quiet': '1', onclick: function () { if (i >= steps.length - 1) end(true); else go(i + 1); } });
    var bub = h('div', { class: 'tour-bub' }, [h('div', { class: 'tour-top' }, [dots, count]), title, body, h('div', { class: 'tour-acts' }, [skip, h('span', { class: 'grow' }), back, next])]);
    var ov = h('div', { class: 'tour', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'tour-t', 'aria-describedby': 'tour-b' }, [hole, bub]);
    document.body.appendChild(ov); document.documentElement.classList.add('tour-on');
    function place() {
      var s = steps[i], el = $(s.sel); if (!visible(el)) return;
      var r = el.getBoundingClientRect(), pad = 8, vw = window.innerWidth, vh = window.innerHeight;
      hole.style.left = (r.left - pad) + 'px'; hole.style.top = (r.top - pad) + 'px'; hole.style.width = (r.width + pad * 2) + 'px'; hole.style.height = (r.height + pad * 2) + 'px';
      if (vw <= 640) { bub.style.left = ''; bub.style.top = ''; return; }
      var w = bub.offsetWidth, bh = bub.offsetHeight, top = r.bottom + pad + 14;
      if (top + bh > vh - 12) top = r.top - pad - 14 - bh;
      if (top < 12) top = Math.max(12, vh - bh - 12);
      var left = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), vw - w - 12);
      bub.style.left = left + 'px'; bub.style.top = top + 'px';
    }
    function go(n) {
      i = Math.max(0, Math.min(steps.length - 1, n)); var s = steps[i], el = $(s.sel);
      try { el.scrollIntoView({ block: 'center', inline: 'nearest' }); } catch (e) { }
      title.textContent = t(s.title); body.textContent = t(s.body); count.textContent = t('tw_of', { n: i + 1, m: steps.length });
      [].forEach.call(dots.children, function (d, k) { d.className = k === i ? 'on' : (k < i ? 'done' : ''); });
      back.hidden = i === 0; next.textContent = i >= steps.length - 1 ? t('tw_done') : t('tw_next');
      bub.classList.remove('swap'); if (!reduced()) { void bub.offsetWidth; bub.classList.add('swap'); }
      place(); requestAnimationFrame(place); next.focus();
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); end(true); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); if (i < steps.length - 1) go(i + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); if (i > 0) go(i - 1); }
      else if (e.key === 'Tab') { var f = [].filter.call(bub.querySelectorAll('button'), function (b) { return !b.hidden; }), a = document.activeElement, k = f.indexOf(a); e.preventDefault(); f[(k + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus(); }
    }
    function end(mark) {
      document.removeEventListener('keydown', onKey, true); window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true);
      if (ov.parentNode) ov.parentNode.removeChild(ov); document.documentElement.classList.remove('tour-on'); cur = null;
      if (mark && key) { if (key === 'main') lset(KEY, '1'); else markSeen(key); }
      try { if (opener && opener.focus && document.contains(opener)) opener.focus(); } catch (e) { }
    }
    document.addEventListener('keydown', onKey, true); window.addEventListener('resize', place); window.addEventListener('scroll', place, true);
    cur = { end: end }; go(0);
  };

  // ---------- welcome (first run only)
  tour.welcome = function () {
    var step = 0, host = h('div', { class: 'wel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'wel-h' }), opener = document.activeElement;
    function finish(then) {
      lset(KEY, '1'); document.removeEventListener('keydown', onKey, true);
      if (host.parentNode) host.parentNode.removeChild(host); document.documentElement.classList.remove('tour-on');
      U.saveSet(); if (B.route) B.route();
      if (then) then(); else { try { if (opener && opener.focus) opener.focus(); } catch (e) { } }
    }
    function onKey(e) { if (e.key === 'Escape') { e.preventDefault(); finish(); } }
    function dotsEl() { return h('div', { class: 'tour-dots wel-dots', 'aria-hidden': 'true' }, [0, 1, 2].map(function (k) { return h('i', { class: k === step ? 'on' : (k < step ? 'done' : '') }); })); }
    function draw() {
      host.textContent = '';
      var card = h('div', { class: 'wel-card' }), pane = h('div', { class: 'wel-pane' });
      card.appendChild(h('div', { class: 'wel-top' }, [dotsEl(), h('button', { type: 'button', class: 'abtn', 'data-quiet': '1', 'aria-label': t('tw_close'), text: '✕', onclick: function () { finish(); } })]));
      if (step === 0) {
        var sel = h('select', { id: 'wel-lang', 'aria-label': t('tw_pick') }, B.INDIC.map(function (l) { return h('option', { value: l, text: U.langNative(l) + ' · ' + U.langName(l) }); })); sel.value = set.focus;
        sel.addEventListener('change', function () { set.focus = sel.value; });
        pane.appendChild(h('div', { class: 'wel-logo', 'aria-hidden': 'true', text: 'भा' })); pane.appendChild(h('h2', { id: 'wel-h', text: t('tw_h1') }));
        pane.appendChild(h('p', { class: 'wel-priv', text: '🔒 ' + t('tw_priv') })); pane.appendChild(h('label', { for: 'wel-lang', text: t('tw_pick') })); pane.appendChild(sel);
      } else if (step === 1) {
        pane.appendChild(h('h2', { id: 'wel-h', text: t('tw_goal') }));
        var seg = h('div', { class: 'seg wel-seg', role: 'group', 'aria-label': t('tw_goal') });
        [5, 10, 20, 40].forEach(function (n) { seg.appendChild(h('button', { type: 'button', class: 'abtn', 'data-quiet': '1', 'aria-pressed': String(set.perDay === n), text: String(n), onclick: function () { set.perDay = n; [].forEach.call(seg.children, function (b) { b.setAttribute('aria-pressed', String(b === this)); }, this); } })); });
        pane.appendChild(seg); pane.appendChild(h('p', { class: 'wel-hint', text: t('tw_goalHint') }));
      } else {
        pane.appendChild(h('h2', { id: 'wel-h', text: t('tw_first') }));
        var grid = h('div', { class: 'wel-go' });
        [['/today/', '📅', 'tw_o_today'], ['/read/', '📖', 'tw_o_read'], ['/watch/', '🎬', 'tw_o_watch'], ['/talk/', '💬', 'tw_o_talk']].forEach(function (o) { grid.appendChild(h('button', { type: 'button', class: 'abtn wel-opt', 'data-quiet': '1', onclick: function () { finish(function () { U.go(o[0]); }); } }, [h('span', { 'aria-hidden': 'true', text: o[1] }), h('span', { text: t(o[2]) })])); });
        pane.appendChild(grid);
        pane.appendChild(h('div', { class: 'wel-last' }, [h('button', { type: 'button', class: 'abtn gold', 'data-quiet': '1', text: '🧭 ' + t('tw_show'), onclick: function () { finish(function () { setTimeout(function () { tour.run(MAIN, 'main'); }, 250); }); } }), h('button', { type: 'button', class: 'abtn', 'data-quiet': '1', text: t('tw_later'), onclick: function () { finish(); } })]));
      }
      card.appendChild(pane);
      if (step < 2) card.appendChild(h('div', { class: 'tour-acts' }, [h('button', { type: 'button', class: 'abtn', 'data-quiet': '1', text: t('tw_skip'), onclick: function () { finish(); } }), h('span', { class: 'grow' }), step ? h('button', { type: 'button', class: 'abtn', 'data-quiet': '1', text: t('tw_back'), onclick: function () { step--; draw(); } }) : null, h('button', { type: 'button', class: 'abtn gold', id: 'wel-next', 'data-quiet': '1', text: t('tw_next'), onclick: function () { step++; draw(); } })]));
      host.appendChild(card);
      var f = $('#wel-next', host) || $('.wel-opt', host); if (f) f.focus();
    }
    document.body.appendChild(host); document.documentElement.classList.add('tour-on'); document.addEventListener('keydown', onKey, true); draw();
  };
  tour.maybeWelcome = function () { if (!lget(KEY) && !lget('bh-set') && !lget('bh-words')) tour.welcome(); };

  // ---------- per-page help button and first-visit hint
  tour.afterRoute = function (view) {
    var old = $('.tour-fab'); if (old) old.parentNode.removeChild(old);
    var steps = view === 'home' || view === 'today' ? MAIN : MINI[view]; if (!steps || document.documentElement.classList.contains('tour-on')) return;
    var key = view === 'home' || view === 'today' ? 'main' : view;
    document.body.appendChild(h('button', { type: 'button', class: 'tour-fab', 'data-quiet': '1', 'aria-label': t('tour_help'), title: t('tour_help'), text: '?', onclick: function () { tour.run(steps, key); } }));
    if (MINI[view] && lget(KEY) === '1' && !seen()[view]) setTimeout(function () { if (!document.documentElement.classList.contains('tour-on') && $('#app')) tour.run(MINI[view], view); }, 700);
  };
  tour.start = function () { var p = $('#setp'); if (p) p.hidden = true; U.go('/'); setTimeout(function () { tour.run(MAIN, 'main'); }, 300); };
})(window.B);
