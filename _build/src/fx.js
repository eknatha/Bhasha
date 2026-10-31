/* Feel: small sounds (synthesised, no audio files), vibration and a confetti burst. All optional, all off-switchable,
   and all disabled when the system asks for reduced motion. Nothing here touches the network. */
(function (B) {
  'use strict';
  var U = B.ui, set = U.set, fx = B.fx = {}, ctx = null;
  function reduced() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  fx.reduced = reduced;
  function audio() { if (ctx) return ctx; try { var A = window.AudioContext || window.webkitAudioContext; if (A) ctx = new A(); } catch (e) { } return ctx; }
  function tone(freq, start, dur, type, vol) {
    var c = audio(); if (!c) return; if (c.state === 'suspended') { try { c.resume(); } catch (e) { } }
    var o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + start;
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.06, t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function buzz(p) { if (set.haptic !== false && navigator.vibrate) { try { navigator.vibrate(p); } catch (e) { } } }
  function snd(fn) { if (set.sound !== false) { try { fn(); } catch (e) { } } }
  fx.log = [];   // names of the effects fired, for tests
  fx.tap = function () { fx.log.push('tap'); buzz(8); snd(function () { tone(520, 0, 0.06, 'sine', 0.04); }); };
  fx.good = function () { fx.log.push('good'); buzz(15); snd(function () { tone(660, 0, 0.12); tone(880, 0.09, 0.18); }); };
  fx.bad = function () { fx.log.push('bad'); buzz([20, 40, 20]); snd(function () { tone(220, 0, 0.18, 'triangle', 0.05); }); };
  fx.done = function () { fx.log.push('done'); buzz([20, 50, 20, 50, 40]); snd(function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.1, 0.22); }); }); };
  fx.rec = function () { fx.log.push('rec'); buzz(12); snd(function () { tone(740, 0, 0.08, 'sine', 0.05); }); };
  // confetti: plain DOM, removed after the animation, skipped for reduced motion
  fx.celebrate = function (host) {
    fx.done(); if (reduced()) return;
    var box = U.h('div', { class: 'confetti', 'aria-hidden': 'true' }), cols = ['#f5b301', '#e4572e', '#2a9d8f', '#6a4c93', '#3a86ff'];
    for (var i = 0; i < 28; i++) {
      var s = U.h('i'); s.style.left = (Math.random() * 100) + '%'; s.style.background = cols[i % cols.length]; s.style.animationDelay = (Math.random() * 0.4) + 's'; s.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px'); s.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg'); box.appendChild(s);
    }
    (host || document.body).appendChild(box); setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 2200);
  };
  // soft entrance for a freshly drawn step
  fx.enter = function (el) { if (!el || reduced()) return; el.classList.remove('enter'); void el.offsetWidth; el.classList.add('enter'); };
  // light tap feedback on every button press
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('.abtn,.tab,.card,.ibtn'); if (b && !b.classList.contains('opt') && !b.hasAttribute('data-quiet')) fx.tap(); }, true);
})(window.B);
