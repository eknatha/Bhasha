/* Watch view: your own video or audio plus one or two subtitle files. Dual subtitles, click words,
   auto-pause, line repeat, speed, shadowing. With no media it can read the lines aloud (listen mode). */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set;
  var S = { raw: [], pair: [], lang: 'auto', mediaUrl: null, mediaEl: null, isVideo: false, idx: -1, shown: -1, loop: false, loopIdx: -1, auto: false, pausedIdx: -2, speed: 1, off: 0, hideT: false, hideN: false, blurN: true, playing: false, mode: 'media', raf: 0, rec: null, recUrl: null, name: '' };
  var keyH = null;
  B.views = B.views || {};
  B.views._cleanup = function () { cancelAnimationFrame(S.raf); U.stopSpeak(); S.playing = false; if (keyH) { document.removeEventListener('keydown', keyH); keyH = null; } if (S.mediaEl) { try { S.mediaEl.pause(); } catch (e) { } } stopRec(true); };
  function stopRec(discard) { if (S.rec) { try { S.rec.state !== 'inactive' && S.rec.stop(); S.rec.stream.getTracks().forEach(function (x) { x.stop(); }); } catch (e) { } S.rec = null; } }
  function curLang() { return S.lang === 'auto' ? (B.detectLang(S.raw.map(function (x) { return x.t; }).slice(0, 40).join(' ')) || set.focus) : S.lang; }

  B.views.watch = function (app) {
    B.views._cleanup(); app.textContent = '';
    var root = h('div'); app.appendChild(h('h1', { text: t('nav_watch') })); app.appendChild(h('p', { class: 'lede', text: t('wtLede') })); app.appendChild(root);
    if (S.pair.length) player(root); else setup(root);
  };

  function setup(root) {
    root.textContent = '';
    var info = h('div', { class: 'wt-info', 'aria-live': 'polite' }), subs = [null, null], files = { media: null };
    function status() { info.textContent = [files.media ? '🎞 ' + files.media.name : '', subs[0] ? '📝 ' + subs[0].name + ' (' + subs[0].lines.length + ')' : '', subs[1] ? '🌐 ' + subs[1].name + ' (' + subs[1].lines.length + ')' : ''].filter(Boolean).join('   '); startBtn.disabled = !subs[0]; }
    function loadFiles(list) {
      [].forEach.call(list, function (f) {
        if (/^(audio|video)\//.test(f.type) || /\.(mp4|webm|mkv|mov|mp3|m4a|wav|ogg|opus|aac|flac)$/i.test(f.name)) { files.media = f; status(); }
        else if (/\.(srt|vtt)$/i.test(f.name) || /text/.test(f.type)) { var r = new FileReader(); r.onload = function () { var lines = B.parseSubs(String(r.result)); if (!lines.length) { U.toast(t('noSubs', { f: f.name })); return; } var slot = subs[0] ? (subs[1] ? 1 : 1) : 0; subs[slot] = { name: f.name, lines: lines }; status(); }; r.readAsText(f); }
      });
    }
    function pick(accept, which) { U.file(accept, function (f) { loadFiles([f]); if (which === 'sub2' && subs[0]) { } }, false); }
    function pickSub(slot) { U.file('.srt,.vtt,text/vtt,text/plain', function (f) { var r = new FileReader(); r.onload = function () { var lines = B.parseSubs(String(r.result)); if (!lines.length) { U.toast(t('noSubs', { f: f.name })); return; } subs[slot] = { name: f.name, lines: lines }; status(); }; r.readAsText(f); }, false); }
    var drop = h('div', { class: 'wt-drop', tabindex: '0', role: 'group', 'aria-label': t('wtDrop') }, [h('p', { text: t('wtDrop') })]);
    ['dragover', 'dragenter'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function () { drop.classList.remove('over'); }); });
    drop.addEventListener('drop', function (e) { e.preventDefault(); loadFiles(e.dataTransfer.files); });
    var langSel = U.langSelect('wt-lang', S.lang, function (v) { S.lang = v; }, true);
    var startBtn = h('button', { type: 'button', class: 'abtn gold', text: t('wtStart'), disabled: true, onclick: function () { S.raw = subs[0].lines; S.pair = B.pairSubs(subs[0].lines, subs[1] ? subs[1].lines : []); S.mode = files.media ? 'media' : 'tts'; S.name = files.media ? files.media.name : ''; if (S.mediaUrl) URL.revokeObjectURL(S.mediaUrl); S.mediaUrl = files.media ? URL.createObjectURL(files.media) : null; S.isVideo = !!(files.media && (/^video\//.test(files.media.type) || /\.(mp4|webm|mkv|mov)$/i.test(files.media.name))); S.idx = -1; S.shown = -1; S.off = 0; S.pausedIdx = -2; player(root); } });
    root.appendChild(h('section', { class: 'panel' }, [h('h2', { text: t('wtSetup') }), drop,
      h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn', text: '🎞 ' + t('wtMedia'), onclick: function () { pick('video/*,audio/*,.mkv', 'media'); } }), h('button', { type: 'button', class: 'abtn', text: '📝 ' + t('wtSub1'), onclick: function () { pickSub(0); } }), h('button', { type: 'button', class: 'abtn', text: '🌐 ' + t('wtSub2'), onclick: function () { pickSub(1); } })]),
      h('div', { class: 'tools' }, [h('div', { class: 'tf' }, [h('label', { for: 'wt-lang', text: t('subLang') }), langSel])]), info,
      h('div', { class: 'acts' }, [startBtn, h('button', { type: 'button', class: 'abtn', text: t('wtSample'), onclick: function () { var l = set.focus, ls = B.sampleSrt(l); subs[0] = { name: 'sample-' + l + '.srt', lines: B.parseSubs(B.srtText(ls, 't')) }; subs[1] = { name: 'sample-en.srt', lines: B.parseSubs(B.srtText(ls, 'n')) }; files.media = null; S.lang = l; langSel.value = l; status(); startBtn.click(); } })]),
      h('p', { class: 'note', text: t('wtPrivacy') })]));
    status();
  }

  function player(root) {
    root.textContent = '';
    var lang = curLang(), media = null, mediaBox = h('div', { class: 'wt-media' });
    if (S.mode === 'media') { media = h(S.isVideo ? 'video' : 'audio', { src: S.mediaUrl, controls: true, playsinline: true, preload: 'auto', 'aria-label': S.name }); mediaBox.appendChild(media); S.mediaEl = media; }
    else { S.mediaEl = null; mediaBox.appendChild(h('div', { class: 'wt-tts', text: '🔊 ' + t('wtListenMode') })); }
    var subT = h('div', { class: 'sub-t', lang: lang }), subN = h('div', { class: 'sub-n' }), subBox = h('div', { class: 'sub-box', 'aria-live': 'off' }, [subT, subN]);
    var list = h('div', { class: 'wt-list', role: 'listbox', 'aria-label': t('wtTranscript') }), rows = [];
    S.pair.forEach(function (l, i) { var r = h('button', { type: 'button', class: 'wt-row', role: 'option', 'data-i': i, 'aria-selected': 'false' }, [h('span', { class: 'tm', text: B.fmtTime(l.s) }), h('span', { class: 'tx', lang: lang, text: l.t.replace(/\n/g, ' ') }), l.n ? h('span', { class: 'nt', text: l.n.replace(/\n/g, ' ') }) : null]); r.addEventListener('click', function () { seek(i, true); }); rows.push(r); list.appendChild(r); });
    function now() { return (media ? media.currentTime : 0) - S.off; }
    function showLine(i) {
      S.shown = i; var l = S.pair[i]; subT.textContent = ''; subN.textContent = '';
      if (l && !S.hideT) { l.t.split('\n').forEach(function (ln, k) { var d = h('div'); d.appendChild(U.renderText(ln, lang, { roman: set.roman })); subT.appendChild(d); }); }
      if (l && l.n && !S.hideN) { subN.textContent = l.n; } subN.classList.toggle('blur', S.blurN);
      rows.forEach(function (r, k) { r.classList.toggle('on', k === i); r.setAttribute('aria-selected', String(k === i)); }); var on = rows[i]; if (on) { var lb = list.getBoundingClientRect(), rb = on.getBoundingClientRect(); if (rb.top < lb.top || rb.bottom > lb.bottom) list.scrollTop += rb.top - lb.top - lb.height / 3; }
      counter.textContent = (i + 1) + ' / ' + S.pair.length;
    }
    U.bindWords(subT, function () { return lang; }, function () { var l = S.pair[S.shown]; return l ? l.t.replace(/\n/g, ' ') : ''; }, function () { showLine(S.shown); });
    var counter = h('span', { class: 'wt-count' });
    function seek(i, play) {
      i = Math.max(0, Math.min(S.pair.length - 1, i)); S.idx = i; S.pausedIdx = -2; showLine(i);
      if (S.mode === 'media' && media) { media.currentTime = Math.max(0, S.pair[i].s + S.off + 0.01); if (play) media.play().catch(function () { }); }
      else if (play) ttsStart(i);
    }
    // listen mode (text to speech)
    function ttsStart(i) { S.playing = true; playBtn.textContent = '⏸'; speakLine(i); }
    function speakLine(i) { if (!S.playing) return; S.idx = i; showLine(i); U.speak(S.pair[i].t.replace(/\n/g, ' '), lang, function () { if (!S.playing) return; if (S.auto || i >= S.pair.length - 1) { S.playing = false; playBtn.textContent = '▶'; return; } setTimeout(function () { speakLine(i + 1); }, 350); }, set.rate * S.speed); }
    function toggle() {
      if (S.mode === 'media' && media) { if (media.paused) { S.pausedIdx = S.idx; media.play().catch(function () { }); } else media.pause(); }
      else { if (S.playing) { S.playing = false; U.stopSpeak(); playBtn.textContent = '▶'; } else ttsStart(Math.max(0, S.idx)); }
    }
    function replay() { seek(S.shown >= 0 ? S.shown : 0, true); }
    // frame loop
    function frame() {
      S.raf = requestAnimationFrame(frame); if (!media) return;
      var tm = now(), i = B.lineAt(S.pair, tm);
      if (i >= 0 && i !== S.idx) { S.idx = i; showLine(i); S.pausedIdx = -2; }
      if (i >= 0 && !media.paused) {
        var end = S.pair[i].e - 0.04;
        if (S.loop && S.loopIdx === i && tm >= end) { media.currentTime = S.pair[i].s + S.off + 0.01; }
        else if (S.auto && tm >= end && S.pausedIdx !== i) { S.pausedIdx = i; media.pause(); }
      }
    }
    frame();
    var playBtn = h('button', { type: 'button', class: 'abtn gold', 'aria-label': t('playPause'), text: '▶', onclick: toggle });
    if (media) { media.addEventListener('play', function () { playBtn.textContent = '⏸'; }); media.addEventListener('pause', function () { playBtn.textContent = '▶'; }); }
    function tog(label, key, fn) { var b = h('button', { type: 'button', class: 'abtn', 'aria-pressed': String(!!S[key]), text: label, onclick: function () { S[key] = !S[key]; b.setAttribute('aria-pressed', String(!!S[key])); if (fn) fn(); } }); return b; }
    var loopBtn = tog('🔁 ' + t('loopLine'), 'loop', function () { S.loopIdx = S.loop ? Math.max(0, S.shown) : -1; });
    var autoBtn = tog('⏯ ' + t('autoPause'), 'auto');
    var hideT = tog(t('hideTarget'), 'hideT', function () { showLine(S.shown); }), hideN = tog(t('hideNative'), 'hideN', function () { showLine(S.shown); }), blurN = tog(t('blurNative'), 'blurN', function () { subN.classList.toggle('blur', S.blurN); });
    var speed = h('select', { id: 'wt-speed', 'aria-label': t('speed') }, [0.5, 0.6, 0.75, 0.9, 1, 1.1, 1.25, 1.5].map(function (x) { return h('option', { value: x, text: x + '×' }); })); speed.value = String(S.speed); speed.addEventListener('change', function () { S.speed = +speed.value; if (media) media.playbackRate = S.speed; });
    if (media) media.playbackRate = S.speed;
    var off = h('span', { class: 'wt-off', text: '0.0s' });
    function adj(d) { S.off = Math.round((S.off + d) * 10) / 10; off.textContent = (S.off > 0 ? '+' : '') + S.off.toFixed(1) + 's'; }
    var recBtn = h('button', { type: 'button', class: 'abtn', 'aria-pressed': 'false', text: '🎤 ' + t('shadow'), onclick: function () { shadow(recBtn, recOut); } }), recOut = h('div', { class: 'wt-rec' });
    function shadow(btn, outEl) {
      if (S.rec) { stopRec(); btn.setAttribute('aria-pressed', 'false'); return; }
      if (!navigator.mediaDevices || !window.MediaRecorder) { U.toast(t('noMic')); return; }
      if (media) media.pause(); U.stopSpeak();
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        var chunks = [], r = new MediaRecorder(stream); S.rec = r; btn.setAttribute('aria-pressed', 'true'); btn.textContent = '⏹ ' + t('stopRec');
        r.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
        r.onstop = function () { stream.getTracks().forEach(function (x) { x.stop(); }); S.rec = null; btn.setAttribute('aria-pressed', 'false'); btn.textContent = '🎤 ' + t('shadow'); if (S.recUrl) URL.revokeObjectURL(S.recUrl); S.recUrl = URL.createObjectURL(new Blob(chunks, { type: r.mimeType || 'audio/webm' })); outEl.textContent = ''; var a = h('audio', { controls: true, src: S.recUrl, 'aria-label': t('yourVoice') }); outEl.appendChild(h('span', { text: t('yourVoice') + ': ' })); outEl.appendChild(a); outEl.appendChild(h('button', { type: 'button', class: 'abtn', text: '↺ ' + t('orig'), onclick: replay })); a.play().catch(function () { }); };
        r.start();
      }, function () { U.toast(t('micDenied')); });
    }
    var bar = h('div', { class: 'wt-bar' }, [
      h('button', { type: 'button', class: 'abtn', 'aria-label': t('prevLine'), text: '⏮', onclick: function () { seek(S.shown - 1, true); } }), playBtn,
      h('button', { type: 'button', class: 'abtn', 'aria-label': t('nextLine'), text: '⏭', onclick: function () { seek(S.shown + 1, true); } }),
      h('button', { type: 'button', class: 'abtn', text: '↺ ' + t('replay'), onclick: replay }), loopBtn, autoBtn, counter,
      h('label', { for: 'wt-speed', class: 'sr', text: t('speed') }), speed,
      h('span', { class: 'wt-offs' }, [h('button', { type: 'button', class: 'abtn', 'aria-label': t('subEarlier'), text: '−0.5s', onclick: function () { adj(-0.5); } }), off, h('button', { type: 'button', class: 'abtn', 'aria-label': t('subLater'), text: '+0.5s', onclick: function () { adj(0.5); } })])]);
    var bar2 = h('div', { class: 'wt-bar' }, [hideT, hideN, blurN, recBtn,
      h('button', { type: 'button', class: 'abtn', text: '⇄ ' + t('wtChange'), onclick: function () { B.views._cleanup(); S.pair = []; S.raw = []; if (S.mediaUrl) { URL.revokeObjectURL(S.mediaUrl); S.mediaUrl = null; } setup(root); } })]);
    root.appendChild(h('div', { class: 'wt-grid' }, [h('div', { class: 'wt-main' }, [mediaBox, subBox, bar, bar2, recOut, h('p', { class: 'hint', text: t('wtKeys') })]), h('aside', { class: 'panel wt-side' }, [h('h2', { text: t('wtTranscript') }), list])]));
    keyH = function (e) {
      var tg = e.target, typing = tg && /^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName) && tg.type !== 'range'; if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
      var k = e.key;
      if (k === ' ' && !(tg && tg.tagName === 'BUTTON')) { e.preventDefault(); toggle(); }
      else if (k === 'ArrowLeft' || k === 'a' || k === 'A') { e.preventDefault(); seek(S.shown - 1, true); }
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') { e.preventDefault(); seek(S.shown + 1, true); }
      else if (k === 'r' || k === 'R') { replay(); }
      else if (k === 'l' || k === 'L') { loopBtn.click(); }
      else if (k === 'p' || k === 'P') { autoBtn.click(); }
    };
    document.addEventListener('keydown', keyH);
    seek(0, false);
  }
})(window.B);
