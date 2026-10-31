/* Pronunciation practice: hear the model, record yourself, play yours, compare by ear and look at your waveform.
   The recording lives in memory only (a Blob URL that is revoked on retry/close). It is never saved or uploaded.
   There is no automatic score: a wrong score teaches the wrong thing, so you judge by ear. */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set;
  var active = null;
  function canRec() { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder); }
  function peaks(blob, n) {
    return blob.arrayBuffer().then(function (buf) {
      var A = window.AudioContext || window.webkitAudioContext, c = new A();
      return new Promise(function (res, rej) { c.decodeAudioData(buf, res, rej); }).then(function (ab) {
        var d = ab.getChannelData(0), step = Math.max(1, Math.floor(d.length / n)), out = [];
        for (var i = 0; i < n; i++) { var m = 0; for (var j = i * step; j < Math.min(d.length, (i + 1) * step); j++) { var v = Math.abs(d[j]); if (v > m) m = v; } out.push(m); }
        var mx = Math.max.apply(null, out) || 1; try { c.close(); } catch (e) { }
        return { p: out.map(function (v) { return v / mx; }), dur: ab.duration };
      });
    });
  }
  function draw(cv, pk) {
    var g = cv.getContext('2d'), w = cv.width, hh = cv.height, bar = w / pk.length, st = getComputedStyle(cv);
    g.clearRect(0, 0, w, hh); g.fillStyle = st.color || '#888';
    pk.forEach(function (v, i) { var bh = Math.max(2, v * hh * 0.9); g.fillRect(i * bar + 1, (hh - bh) / 2, Math.max(1, bar - 2), bh); });
  }
  // text, lang -> element. Returns a panel with Model / Record / Yours / Compare.
  B.ui.pronBox = function (text, lang) {
    if (active && active.close) active.close();
    var url = null, rec = null, stream = null, mine = null, state = 'idle';
    var msg = h('p', { class: 'pr-msg', 'aria-live': 'polite', text: canRec() ? t('pronHelp') : t('pronNoMic') });
    var cv = h('canvas', { class: 'pr-wave', width: 320, height: 56, role: 'img', 'aria-label': t('pronYou'), hidden: true });
    var meter = h('div', { class: 'pr-meter', hidden: true }, [h('i')]);
    var bRec = h('button', { type: 'button', class: 'abtn gold', 'data-quiet': '1', text: '🎙 ' + t('pronRec'), disabled: !canRec() });
    var bModel = h('button', { type: 'button', class: 'abtn', text: '🔊 ' + t('pronModel'), onclick: function () { stopMine(); U.speak(text, lang, null, set.rate); } });
    var bYou = h('button', { type: 'button', class: 'abtn', text: '▶ ' + t('pronYou'), hidden: true, onclick: function () { U.stopSpeak(); playMine(); } });
    var bCmp = h('button', { type: 'button', class: 'abtn', text: '⇄ ' + t('pronCompare'), hidden: true, onclick: function () { stopMine(); U.speak(text, lang, function () { setTimeout(playMine, 350); }, set.rate); } });
    var audioEl = null;
    function playMine() { if (!url) return; stopMine(); audioEl = new Audio(url); audioEl.play().catch(function () { }); }
    function stopMine() { if (audioEl) { try { audioEl.pause(); } catch (e) { } audioEl = null; } }
    function release() { if (url) { URL.revokeObjectURL(url); url = null; } mine = null; }
    function stopStream() { if (stream) { stream.getTracks().forEach(function (tr) { tr.stop(); }); stream = null; } }
    var raf = 0, an = null, ac = null;
    function level() {
      if (!an) return; var d = new Uint8Array(an.fftSize); an.getByteTimeDomainData(d); var m = 0; for (var i = 0; i < d.length; i++) { var v = Math.abs(d[i] - 128) / 128; if (v > m) m = v; }
      meter.firstChild.style.width = Math.min(100, Math.round(m * 160)) + '%'; raf = requestAnimationFrame(level);
    }
    function stopRec() { if (rec && rec.state !== 'inactive') rec.stop(); }
    function start() {
      U.stopSpeak(); stopMine(); release(); cv.hidden = true; bYou.hidden = true; bCmp.hidden = true;
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
        stream = s; var chunks = []; rec = new MediaRecorder(s);
        rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
        rec.onstop = function () {
          cancelAnimationFrame(raf); meter.hidden = true; try { ac && ac.close(); } catch (e) { } an = null; ac = null; stopStream(); state = 'idle'; bRec.textContent = '🎙 ' + t('pronAgain'); bRec.classList.remove('rec');
          mine = new Blob(chunks, { type: rec.mimeType || 'audio/webm' }); if (!chunks.length) { msg.textContent = t('pronEmpty'); return; }
          url = URL.createObjectURL(mine); bYou.hidden = false; bCmp.hidden = false; cv.hidden = false; msg.textContent = t('pronDone');
          peaks(mine, 64).then(function (r) { draw(cv, r.p); cv.setAttribute('aria-label', t('pronYou') + ' ' + r.dur.toFixed(1) + ' s'); cv.setAttribute('data-dur', r.dur.toFixed(2)); }).catch(function () { cv.hidden = true; });
          if (B.fx) B.fx.rec();
        };
        try { var A = window.AudioContext || window.webkitAudioContext; ac = new A(); var src = ac.createMediaStreamSource(s); an = ac.createAnalyser(); an.fftSize = 512; src.connect(an); meter.hidden = false; level(); } catch (e) { }
        rec.start(); state = 'rec'; bRec.textContent = '⏹ ' + t('pronStop'); bRec.classList.add('rec'); msg.textContent = t('pronListening'); if (B.fx) B.fx.rec();
        setTimeout(stopRec, 15000);
      }).catch(function (e) { msg.textContent = (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) ? t('pronDenied') : t('pronNoMic'); });
    }
    bRec.addEventListener('click', function () { if (state === 'rec') stopRec(); else start(); });
    var box = h('div', { class: 'pron', 'data-pron': '1' }, [h('div', { class: 'pr-row' }, [bModel, bRec, bYou, bCmp]), meter, cv, msg]);
    box.close = function () { stopRec(); cancelAnimationFrame(raf); stopStream(); stopMine(); release(); if (active === box) active = null; };
    active = box; return box;
  };
  // a "Practise" toggle button for a phrase row: opens/closes a pron box right under the row
  B.ui.pronToggle = function (row, text, lang) {
    var b = h('button', { type: 'button', class: 'abtn', 'aria-expanded': 'false', 'aria-label': t('pronBtn'), text: '🎙', onclick: function () {
      var ex = row.querySelector('.pron'); if (ex) { ex.close && ex.close(); ex.remove(); b.setAttribute('aria-expanded', 'false'); return; }
      var bx = U.pronBox(text, lang); row.appendChild(bx); b.setAttribute('aria-expanded', 'true');
    } });
    return b;
  };
  U.pronClose = function () { if (active && active.close) active.close(); };
})(window.B);
