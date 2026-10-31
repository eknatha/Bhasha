/* Bhasha shell: routing, header, settings, footer. */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set, $ = U.$;
  var ORIGIN = 'https://eknathalabs.com', MARK = 'M29.2 23.2V35.5Q29.2 37.5 28.4 38.4Q27.6 39.4 26.1 39.4Q25 39.4 23.8 38.7Q22.6 38.1 21.6 37Q20.7 36 20 34.8Q19.4 33.6 19.4 32.5Q19.4 31.2 20.1 30.4Q20.9 29.6 22.9 29.6L23 29.7V23.2H18V18.2H46V23.2H41.9V45.8H35.7V23.2Z';
  B.MARK = MARK; B.base = '/';
  var ROUTES = { '': 'home', today: 'today', talk: 'talk', privacy: 'privacy', read: 'read', say: 'say', watch: 'watch', words: 'words', review: 'review', scripts: 'scripts', phrases: 'phrases' };
  var NAV = [['today', '📅'], ['say', '🗣'], ['talk', '💬'], ['watch', '🎬'], ['read', '📖'], ['words', '🗂'], ['review', '🧠'], ['scripts', 'अ'], ['phrases', '📚']];
  var app;
  function mark() { var NS = 'http://www.w3.org/2000/svg', s = document.createElementNS(NS, 'svg'), p = document.createElementNS(NS, 'path'); s.setAttribute('viewBox', '14 14 36 36'); s.setAttribute('width', '22'); s.setAttribute('height', '22'); s.setAttribute('aria-hidden', 'true'); p.setAttribute('d', MARK); p.setAttribute('fill', 'currentColor'); s.appendChild(p); return s; }
  function pathKey() { var p = location.pathname.replace(/index\.html$/, '').replace(/^\/+|\/+$/g, ''); return p; }
  U.go = function (url) { history.pushState(null, '', url); route(); window.scrollTo(0, 0); };

  function buildChrome() {
    var hd = $('#hdr'); hd.textContent = '';
    var bar = h('div', { class: 'wrap bar' });
    bar.appendChild(h('a', { class: 'brand', href: '/', 'data-nav': '1', 'aria-label': 'Bhasha' }, [h('b', null, [mark()]), h('span', null, ['Bhasha', h('small', { text: 'EknathaLabs' })])]));
    bar.appendChild(h('span', { class: 'grow' }));
    bar.appendChild(h('a', { class: 'ibtn', href: ORIGIN + (set.ui === 'en' || U.MAINSITE.indexOf(set.ui) < 0 ? '/' : '/' + set.ui + '/'), 'aria-label': 'EknathaLabs' }, [h('span', { text: '⌂' }), h('span', { class: 'lab', text: 'EknathaLabs' })]));
    var panel = h('div', { class: 'pop-panel', id: 'setp', hidden: true, role: 'dialog', 'aria-label': t('settings') }), btn = h('button', { class: 'ibtn', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'setp' }, [h('span', { text: '⚙' }), h('span', { class: 'lab', text: t('settings') })]);
    function sel(id, label, opts, val, fn) { var s = h('select', { id: id }, opts.map(function (o) { return h('option', { value: o[0], text: o[1] }); })); s.value = val; s.addEventListener('change', function () { fn(s.value); }); panel.appendChild(h('label', { for: id, text: label })); panel.appendChild(s); }
    function seg(label, items, val, fn) { panel.appendChild(h('label', { text: label })); var g = h('div', { class: 'seg', role: 'group', 'aria-label': label }); items.forEach(function (it) { g.appendChild(h('button', { type: 'button', 'aria-pressed': String(val === it[0]), text: it[1], onclick: function () { fn(it[0]); [].forEach.call(g.children, function (b, i) { b.setAttribute('aria-pressed', String(items[i][0] === it[0])); }); } })); }); panel.appendChild(g); }
    var NAMES = { en: 'English', hi: 'हिन्दी', te: 'తెలుగు', kn: 'ಕನ್ನಡ', ta: 'தமிழ்', ml: 'മലയാളം', bn: 'বাংলা', mr: 'मराठी', ko: '한국어', es: 'Español', de: 'Deutsch', fr: 'Français', gu: 'ગુજરાતી', as: 'অসমীয়া' };
    panel.appendChild(h('div', { class: 'pop-title', text: t('settings') }));
    sel('s-ui', t('uiLang'), Object.keys(NAMES).map(function (k) { return [k, NAMES[k]]; }), set.ui, function (v) { set.ui = v; U.saveSet(); U.applyLang(); buildChrome(); route(); });
    sel('s-focus', t('focusLang'), B.INDIC.map(function (l) { return [l, U.langNative(l) + ' · ' + U.langName(l)]; }), set.focus, function (v) { set.focus = v; U.saveSet(); route(); });
    seg(t('scheme'), [['simple', t('schSimple')], ['iast', t('schIast')]], set.scheme, function (v) { set.scheme = v; U.saveSet(); route(); });
    seg(t('showRoman'), [['1', t('on')], ['0', t('off')]], set.roman ? '1' : '0', function (v) { set.roman = v === '1'; U.saveSet(); route(); });
    sel('s-rate', t('voiceSpeed'), [['0.6', '0.6×'], ['0.75', '0.75×'], ['0.9', '0.9×'], ['1', '1×'], ['1.15', '1.15×']], String(set.rate), function (v) { set.rate = +v; U.saveSet(); });
    sel('s-perday', t('perDay'), [['5', '5'], ['10', '10'], ['20', '20'], ['40', '40'], ['0', t('unlimited')]], String(set.perDay), function (v) { set.perDay = +v; U.saveSet(); });
    seg(t('theme'), [['light', t('light')], ['dark', t('dark')], ['new', t('new')]], set.theme, function (v) { set.theme = v; U.saveSet(); U.applyTheme(); });
    seg(t('setSound'), [['1', t('on')], ['0', t('off')]], set.sound ? '1' : '0', function (v) { set.sound = v === '1'; U.saveSet(); if (set.sound && B.fx) B.fx.good(); });
    seg(t('setHaptic'), [['1', t('on')], ['0', t('off')]], set.haptic ? '1' : '0', function (v) { set.haptic = v === '1'; U.saveSet(); if (set.haptic && B.fx) B.fx.tap(); });
    panel.appendChild(h('button', { type: 'button', class: 'abtn', style: 'margin-top:12px', text: '🔊 ' + t('voiceCheck'), onclick: function () { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); U.openVoiceCheck(); } }));
    function close(f) { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (f) btn.focus(); }
    btn.addEventListener('click', function () { var o = panel.hidden; panel.hidden = !o; btn.setAttribute('aria-expanded', String(o)); if (o) $('select', panel).focus(); });
    var pop = h('div', { class: 'pop' }, [btn, panel]); bar.appendChild(pop);
    if (!buildChrome.bound) { buildChrome.bound = true; document.addEventListener('keydown', function (e) { var p = $('#setp'); if (e.key === 'Escape' && p && !p.hidden) { p.hidden = true; var b = $('[aria-controls=setp]'); if (b) { b.setAttribute('aria-expanded', 'false'); b.focus(); } } }); document.addEventListener('click', function (e) { var p = $('#setp'); if (p && !p.hidden && !p.parentNode.contains(e.target)) { p.hidden = true; $('[aria-controls=setp]').setAttribute('aria-expanded', 'false'); } }); }
    hd.appendChild(bar);
    var nav = h('nav', { class: 'wrap tabsnav', 'aria-label': t('mainNav'), id: 'mnav' });
    NAV.forEach(function (n) { nav.appendChild(h('a', { href: '/' + n[0] + '/', 'data-nav': '1', 'data-k': n[0] }, [h('span', { 'aria-hidden': 'true', text: n[1] }), h('span', { text: t('nav_' + n[0]) })])); });
    hd.appendChild(nav);
    var sk = $('.skip'); if (sk) sk.textContent = t('skip');
    var ft = $('#ftr'); ft.textContent = ''; ft.appendChild(h('div', { class: 'wrap' }, [h('span', null, [t('part') + ' · ', h('a', { href: ORIGIN + (set.ui === 'en' || U.MAINSITE.indexOf(set.ui) < 0 ? '/' : '/' + set.ui + '/'), text: 'eknathalabs.com' })]), h('a', { class: 'pvlink', href: '/privacy/', 'data-nav': '1', text: '🔒 ' + t('pvBadge') }), h('span', { text: t('privacyNote') })]));
  }

  function route() {
    var k = pathKey(), view = ROUTES[k]; if (!view) { k = ''; view = 'home'; }
    U.closePopup(); app.textContent = ''; if (U.pronClose) U.pronClose(); if (B.views._cleanup) B.views._cleanup();
    B.views[view](app);
    document.title = (k ? t('nav_' + k) + ' · ' : '') + 'Bhasha · EknathaLabs';
    [].forEach.call(document.querySelectorAll('#mnav a'), function (a) { if (a.getAttribute('data-k') === k) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  }

  function init() {
    app = $('#app'); U.applyTheme(); U.applyLang(); buildChrome();
    document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[data-nav]'); if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; e.preventDefault(); U.go(a.getAttribute('href')); });
    window.addEventListener('popstate', route);
    route();
    if (('serviceWorker' in navigator) && (location.protocol === 'https:' || location.hostname === 'localhost')) { try { navigator.serviceWorker.register('/sw.js'); } catch (e) { } }
  }
  B.init = init;
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', init);
})(window.B);
