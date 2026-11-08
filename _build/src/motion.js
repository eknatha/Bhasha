/* Motion layer: page transitions, staggered cards, nav indicator, counters, streak flame and confetti,
   review flip and swipe, word-tap ripple, speaker pulse, and a quiet ambient background.
   Pure CSS plus a little JS. Nothing is fetched. All of it stays off when the system asks for reduced motion. */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, set = U.set, $ = U.$, M = B.motion = {}, mo = null, amb = null, tmr = null;
  function reduced() { return !!(B.fx && B.fx.reduced()); }
  function lget(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lset(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

  // sliding underline under the current nav item
  function indicator() {
    var nav = $('#mnav'); if (!nav) return;
    var ind = $('.nav-ind', nav); if (!ind) { ind = h('i', { class: 'nav-ind', 'aria-hidden': 'true' }); nav.appendChild(ind); }
    var a = $('a[aria-current]', nav);
    if (!a) { ind.style.opacity = '0'; return; }
    ind.style.opacity = '1'; ind.style.width = a.offsetWidth + 'px'; ind.style.transform = 'translate(' + a.offsetLeft + 'px,' + (a.offsetTop + a.offsetHeight - 3) + 'px)';
  }

  function count(el) {
    var n = parseInt(el.textContent, 10); if (!(n > 0) || el.getAttribute('data-r')) return;
    el.setAttribute('data-r', '1'); if (reduced()) return;
    var t0 = null, dur = 700;
    function step(ts) { if (t0 == null) t0 = ts; var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = String(Math.round(n * e)); if (p < 1) requestAnimationFrame(step); else el.textContent = String(n); }
    el.textContent = '0'; requestAnimationFrame(step);
  }

  function milestones() {
    var st = $('.stats .stat:last-child b'); if (!st) return;
    var n = parseInt(st.getAttribute('data-n') || st.textContent, 10);
    if (!(n > 0)) return;
    var box = st.parentNode; if (!$('.flame', box)) box.insertBefore(h('span', { class: 'flame', 'aria-hidden': 'true', text: '🔥' }), box.firstChild);
    var seen = (lget('bh-ms') || '').split(',');
    [30, 7, 3].some(function (m) { if (n >= m) { if (seen.indexOf(String(m)) < 0) { seen.push(String(m)); lset('bh-ms', seen.join(',')); if (B.fx && B.fx.celebrate) B.fx.celebrate(); } return true; } return false; });
  }

  function decorate() {
    var app = $('#app'); if (!app) return;
    [].forEach.call(app.querySelectorAll('.cards > *, .stats > *, .ph-list > *'), function (el, i) { if (el.hasAttribute('data-m')) return; el.setAttribute('data-m', '1'); el.style.setProperty('--i', Math.min(i, 14)); el.classList.add('rise'); });
    var sb = app.querySelectorAll('.stat b'); [].forEach.call(sb, function (b, i) { if (i === sb.length - 1) b.setAttribute('data-n', b.textContent); count(b); });
    var card = app.querySelector('.rv-card');
    if (card && !card.hasAttribute('data-m')) {
      card.setAttribute('data-m', '1'); var shown = !!card.querySelector('.rv-grades');
      if (shown) card.classList.add('flip'); else card.classList.add('slide');
      var x0 = null, dx = 0;
      card.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse' || e.target.closest('button,select,a')) { x0 = null; return; } x0 = e.clientX; dx = 0; });
      card.addEventListener('pointermove', function (e) { if (x0 == null || !card.querySelector('.rv-grades')) return; dx = e.clientX - x0; card.style.transform = 'translateX(' + dx + 'px) rotate(' + dx / 40 + 'deg)'; card.style.transition = 'none'; });
      function up() { if (x0 == null) return; x0 = null; card.style.transition = ''; card.style.transform = ''; if (Math.abs(dx) > 90) { var b = card.querySelector('[data-g="' + (dx > 0 ? 2 : 0) + '"]'); if (b) b.click(); } dx = 0; }
      card.addEventListener('pointerup', up); card.addEventListener('pointercancel', up);
    }
    milestones();
  }

  var pend = false;
  function observe() {
    var app = $('#app'); if (!app || mo || !window.MutationObserver) return;
    mo = new MutationObserver(function () { if (pend) return; pend = true; requestAnimationFrame(function () { pend = false; if (!reduced()) decorate(); }); });
    mo.observe(app, { childList: true, subtree: true });
  }

  // word-tap ripple and speaker pulse
  function bindGlobal() {
    document.addEventListener('click', function (e) {
      if (reduced()) return;
      var tk = e.target.closest && e.target.closest('.tk'); if (tk) { tk.classList.remove('pulse'); void tk.offsetWidth; tk.classList.add('pulse'); }
    }, true);
    var speak = U.speak;
    U.speak = function (text, lang, onend, rate, fixed) {
      var b = document.activeElement && document.activeElement.closest ? document.activeElement.closest('button.abtn') : null;
      var ret = speak.apply(this, arguments);
      if (b && !reduced()) { b.classList.add('speaking'); setTimeout(function () { b.classList.remove('speaking'); }, Math.min(6000, 700 + String(text || '').length * 70)); }
      return ret;
    };
    window.addEventListener('resize', indicator);
    document.addEventListener('visibilitychange', function () { if (amb) amb.classList.toggle('paused', document.hidden); });
  }

  // ambient layer: a few large script glyphs drifting slowly behind the Home page
  M.ambient = function () {
    var on = set.ambient !== false && !reduced() && !(navigator.connection && navigator.connection.saveData) && !(navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
    var home = !!$('#app .cards');
    if (amb && (!on || !home)) { amb.remove(); amb = null; document.documentElement.classList.remove('amb-on'); }
    if (!on || !home || amb) return;
    var g = (B.SCRIPTS && B.SCRIPTS[set.focus]) || {}, chars = [].concat(g.vowels || [], g.cons || []).filter(function (c) { return c && String(c).trim(); });
    if (chars.length < 4) chars = ['अ', 'आ', 'క', 'க', 'ক', 'ಕ', 'മ', 'ગ'];
    amb = h('div', { class: 'amb', 'aria-hidden': 'true' });
    for (var i = 0; i < 9; i++) amb.appendChild(h('span', { text: chars[(i * 7 + 3) % chars.length], style: 'left:' + ((i * 11 + 4) % 92) + '%;font-size:' + (60 + (i * 23) % 90) + 'px;animation-duration:' + (26 + (i * 5) % 22) + 's;animation-delay:-' + ((i * 7) % 30) + 's' }));
    document.body.insertBefore(amb, document.body.firstChild); document.documentElement.classList.add('amb-on');
  };

  M.after = function () { requestAnimationFrame(function () { indicator(); M.ambient(); }); var app = $('#app'); if (app && !reduced()) { app.classList.remove('pg'); void app.offsetWidth; app.classList.add('pg'); decorate(); } };
  M.init = function () { observe(); bindGlobal(); indicator(); };
})(window.B);
