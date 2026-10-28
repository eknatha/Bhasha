/* Bhasha core. DOM-free so Node can test it. */
(function (B) {
  'use strict';
  // ---------- languages
  B.LANGS = { te: { name: 'Telugu', native: 'తెలుగు', bcp: 'te-IN', script: 'Telugu' }, hi: { name: 'Hindi', native: 'हिन्दी', bcp: 'hi-IN', script: 'Devanagari' }, kn: { name: 'Kannada', native: 'ಕನ್ನಡ', bcp: 'kn-IN', script: 'Kannada' }, ta: { name: 'Tamil', native: 'தமிழ்', bcp: 'ta-IN', script: 'Tamil' }, ml: { name: 'Malayalam', native: 'മലയാളം', bcp: 'ml-IN', script: 'Malayalam' } };
  B.INDIC = ['te', 'hi', 'kn', 'ta', 'ml'];
  // other reading languages: code, English name, native name, BCP 47 for speech
  B.OTHER = [['en', 'English', 'English', 'en-US'], ['es', 'Spanish', 'Español', 'es-ES'], ['fr', 'French', 'Français', 'fr-FR'], ['de', 'German', 'Deutsch', 'de-DE'], ['it', 'Italian', 'Italiano', 'it-IT'], ['pt', 'Portuguese', 'Português', 'pt-PT'], ['ru', 'Russian', 'Русский', 'ru-RU'], ['ja', 'Japanese', '日本語', 'ja-JP'], ['ko', 'Korean', '한국어', 'ko-KR'], ['zh', 'Chinese', '中文', 'zh-CN'], ['ar', 'Arabic', 'العربية', 'ar-SA'], ['bn', 'Bengali', 'বাংলা', 'bn-IN'], ['mr', 'Marathi', 'मराठी', 'mr-IN'], ['gu', 'Gujarati', 'ગુજરાતી', 'gu-IN'], ['pa', 'Punjabi', 'ਪੰਜਾਬੀ', 'pa-IN'], ['ur', 'Urdu', 'اردو', 'ur-PK'], ['tr', 'Turkish', 'Türkçe', 'tr-TR'], ['id', 'Indonesian', 'Bahasa Indonesia', 'id-ID'], ['th', 'Thai', 'ไทย', 'th-TH'], ['vi', 'Vietnamese', 'Tiếng Việt', 'vi-VN']];
  B.allLangs = function () { return B.INDIC.map(function (c) { return [c, B.LANGS[c].name, B.LANGS[c].native, B.LANGS[c].bcp]; }).concat(B.OTHER); };
  B.bcp = function (code) { var a = B.allLangs().filter(function (x) { return x[0] === code; })[0]; return a ? a[3] : code; };
  B.detectLang = function (text) {
    var c = { te: 0, hi: 0, kn: 0, ta: 0, ml: 0, ja: 0, ko: 0, zh: 0, ar: 0, ru: 0, th: 0, bn: 0, gu: 0, pa: 0 }, n = 0, i, cp;
    for (i = 0; i < text.length && n < 600; i++) {
      cp = text.charCodeAt(i);
      if (cp >= 0xC00 && cp < 0xC80) c.te++; else if (cp >= 0x900 && cp < 0x980) c.hi++; else if (cp >= 0xC80 && cp < 0xD00) c.kn++; else if (cp >= 0xB80 && cp < 0xC00) c.ta++; else if (cp >= 0xD00 && cp < 0xD80) c.ml++;
      else if ((cp >= 0x3040 && cp < 0x3100)) c.ja++; else if (cp >= 0xAC00 && cp < 0xD7B0) c.ko++; else if (cp >= 0x4E00 && cp < 0xA000) c.zh++; else if (cp >= 0x600 && cp < 0x700) c.ar++; else if (cp >= 0x400 && cp < 0x500) c.ru++; else if (cp >= 0xE00 && cp < 0xE80) c.th++; else if (cp >= 0x980 && cp < 0xA00) c.bn++; else if (cp >= 0xA80 && cp < 0xB00) c.gu++; else if (cp >= 0xA00 && cp < 0xA80) c.pa++; else continue;
      n++;
    }
    var best = null, bv = 0; for (var k in c) if (c[k] > bv) { bv = c[k]; best = k; }
    if (best === 'zh' && c.ja > 0) best = 'ja';
    return bv >= 3 ? best : null;
  };

  // ---------- transliteration: Brahmic scripts to Latin
  var BASES = { hi: 0x900, ta: 0xB80, te: 0xC00, kn: 0xC80, ml: 0xD00 };
  var VOW = { 5: ['a', 'a'], 6: ['aa', 'ā'], 7: ['i', 'i'], 8: ['ee', 'ī'], 9: ['u', 'u'], 10: ['oo', 'ū'], 11: ['ru', 'ṛ'], 12: ['lu', 'ḷ'], 13: ['e', 'ĕ'], 14: ['e', 'e'], 15: ['e', 'ē'], 16: ['ai', 'ai'], 17: ['o', 'ŏ'], 18: ['o', 'o'], 19: ['o', 'ō'], 20: ['au', 'au'] };
  var SIGN = { 0x3E: 6, 0x3F: 7, 0x40: 8, 0x41: 9, 0x42: 10, 0x43: 11, 0x44: 11, 0x45: 13, 0x46: 14, 0x47: 15, 0x48: 16, 0x49: 17, 0x4A: 18, 0x4B: 19, 0x4C: 20, 0x62: 12, 0x63: 12 };
  var CON = { 0x15: ['k', 'k'], 0x16: ['kh', 'kh'], 0x17: ['g', 'g'], 0x18: ['gh', 'gh'], 0x19: ['ng', 'ṅ'], 0x1A: ['ch', 'c'], 0x1B: ['chh', 'ch'], 0x1C: ['j', 'j'], 0x1D: ['jh', 'jh'], 0x1E: ['ny', 'ñ'], 0x1F: ['t', 'ṭ'], 0x20: ['th', 'ṭh'], 0x21: ['d', 'ḍ'], 0x22: ['dh', 'ḍh'], 0x23: ['n', 'ṇ'], 0x24: ['t', 't'], 0x25: ['th', 'th'], 0x26: ['d', 'd'], 0x27: ['dh', 'dh'], 0x28: ['n', 'n'], 0x29: ['n', 'ṉ'], 0x2A: ['p', 'p'], 0x2B: ['ph', 'ph'], 0x2C: ['b', 'b'], 0x2D: ['bh', 'bh'], 0x2E: ['m', 'm'], 0x2F: ['y', 'y'], 0x30: ['r', 'r'], 0x31: ['r', 'ṟ'], 0x32: ['l', 'l'], 0x33: ['l', 'ḷ'], 0x34: ['zh', 'ḻ'], 0x35: ['v', 'v'], 0x36: ['sh', 'ś'], 0x37: ['sh', 'ṣ'], 0x38: ['s', 's'], 0x39: ['h', 'h'] };
  var NUKTA = { 0x58: ['q', 'q'], 0x59: ['kh', 'kh'], 0x5A: ['gh', 'ġ'], 0x5B: ['z', 'z'], 0x5C: ['r', 'ṛ'], 0x5D: ['rh', 'ṛh'], 0x5E: ['f', 'f'], 0x5F: ['y', 'y'] };
  var CHILLU = { 0xD7A: ['n', 'ṇ'], 0xD7B: ['n', 'n'], 0xD7C: ['r', 'r'], 0xD7D: ['l', 'l'], 0xD7E: ['l', 'ḷ'], 0xD7F: ['k', 'k'] };
  function script(cp) { if (cp >= 0x900 && cp < 0x980) return 'hi'; if (cp >= 0xB80 && cp < 0xC00) return 'ta'; if (cp >= 0xC00 && cp < 0xC80) return 'te'; if (cp >= 0xC80 && cp < 0xD00) return 'kn'; if (cp >= 0xD00 && cp < 0xD80) return 'ml'; return null; }
  B.isBrahmic = function (s) { for (var i = 0; i < s.length; i++) if (script(s.charCodeAt(i))) return true; return false; };
  // Transliterate one word or a whole string. scheme: 'simple' (default) or 'iast'.
  B.translit = function (str, scheme) {
    var si = scheme === 'iast' ? 1 : 0, out = '', i = 0, n = str.length;
    // split into runs of one script so word-level rules (schwa, Tamil voicing) can apply
    var token = [], res = [];
    function flush() { if (token.length) { res.push(word(token.join(''))); token = []; } }
    for (i = 0; i < n; i++) { var cp = str.charCodeAt(i), sc = script(cp); if (sc || (token.length && (cp === 0x200C || cp === 0x200D))) token.push(str[i]); else { flush(); res.push(str[i]); } }
    flush(); return res.join('');
    function word(w) {
      var units = [], k, cp, sc = script(w.charCodeAt(0)), base = BASES[sc], pendingA = -1, vowelCount = 0, prevVowel = false, prevNasalVir = false;
      for (k = 0; k < w.length; k++) {
        cp = w.charCodeAt(k); var idx = cp - base;
        if (cp === 0x200C || cp === 0x200D) continue;
        if (sc === 'ml' && CHILLU[cp]) { var ch = CHILLU[cp][si]; units.push({ t: ch, type: 'c', fin: true }); pendingA = -1; vowelCount++; continue; }
        if (idx >= 5 && idx <= 20 && VOW[idx]) { units.push({ t: VOW[idx][si], type: 'v' }); pendingA = -1; vowelCount++; continue; }
        if ((idx >= 0x15 && idx <= 0x39) || NUKTA[idx] && sc === 'hi') {
          var c = (sc === 'hi' && NUKTA[idx]) ? NUKTA[idx] : CON[idx]; if (!c) continue;
          var nx = w.charCodeAt(k + 1) - base;
          if (sc === 'te' && idx === 0x15 && false) { }
          units.push({ t: c[si], type: 'c', idx: idx, a: true }); pendingA = units.length - 1; vowelCount++; continue;
        }
        if (SIGN[idx] && idx >= 0x3E) { if (pendingA >= 0) { units[pendingA].a = false; units[pendingA].vs = VOW[SIGN[idx]][si]; pendingA = -1; } else units.push({ t: VOW[SIGN[idx]][si], type: 'v' }); continue; }
        if (idx === 0x4D) { if (pendingA >= 0) { units[pendingA].a = false; units[pendingA].vir = true; vowelCount--; pendingA = -1; } continue; }
        if (idx === 0x01) { units.push({ t: si ? 'm̐' : 'n', type: 'm' }); continue; }
        if (idx === 0x02) { units.push({ t: si ? 'ṃ' : 'm', type: 'm', anu: true }); continue; }
        if (idx === 0x03) { units.push({ t: si ? 'ḥ' : 'h', type: 'm' }); continue; }
        if (idx >= 0x66 && idx <= 0x6F) { units.push({ t: String(idx - 0x66), type: 'd' }); continue; }
        if (cp === 0x964 || cp === 0x965) { units.push({ t: '.', type: 'p' }); continue; }
        if (cp === 0xB83 && sc === 'ta') { units.push({ t: 'h', type: 'm' }); continue; }
        if (cp === 0xD57) { continue; }
      }
      for (k = 0; k < units.length; k++) {
        if (!units[k].anu || si) continue; var nxu = units[k + 1];
        if (!nxu) units[k].t = sc === 'hi' ? 'n' : 'm';
        else if (nxu.type === 'c' && nxu.idx >= 0x2A && nxu.idx <= 0x2E) units[k].t = 'm';
        else if (nxu.type === 'c') units[k].t = 'n';
      }
      for (k = 1; k < units.length; k++) if (units[k].type === 'c' && units[k].idx === 0x19 && units[k - 1].type === 'c' && units[k - 1].idx === 0x19 && units[k - 1].vir) units[k - 1].t = '';
      // Tamil voicing of stops: intervocalic and after nasals
      if (sc === 'ta') {
        var VO = { 0x15: 'g', 0x1A: 's', 0x1F: 'd', 0x24: 'd', 0x2A: 'b' }, NA = { 0x19: 1, 0x1E: 1, 0x23: 1, 0x28: 1, 0x2E: 1, 0x29: 1 };
        for (k = 1; k < units.length; k++) {
          var u = units[k], p = units[k - 1];
          if (u.type === 'c' && u.idx === 0x31 && !u.vir && p.type === 'c' && p.vir) { if (p.idx === 0x31) { p.t = 't'; } else if (p.idx === 0x28 || p.idx === 0x29) { u.t = 'dr'; } continue; }
          if (u.type !== 'c' || !VO[u.idx] || u.vir) continue;
          var prevV = p.type === 'v' || (p.type === 'c' && !p.vir), prevN = p.type === 'c' && p.vir && NA[p.idx];
          var gem = p.type === 'c' && p.vir && p.idx === u.idx;
          if (gem) continue;
          if (prevN) { u.t = u.idx === 0x1A ? 'j' : VO[u.idx]; if (p.idx === 0x19 || p.idx === 0x1E) p.t = si ? (p.idx === 0x19 ? 'ṅ' : 'ñ') : 'n'; }
          else if (prevV) { u.t = VO[u.idx]; }
          if (si && u.t !== VO[u.idx] && false) { }
        }
      }
      // assemble
      var o = '';
      for (k = 0; k < units.length; k++) {
        var x = units[k]; o += x.t;
        if (x.type === 'c' && !x.fin) {
          if (x.vs) o += x.vs; else if (x.a) { var last = k === units.length - 1 || units[k + 1].type === 'p'; if (sc === 'hi' && last && vowelCount >= 2) { } else o += 'a'; }
          else if (x.vir && sc === 'ml' && k === units.length - 1) o += 'u';
        }
      }
      if (sc === 'ml' && units.length && units[units.length - 1].fin) { /* chillu: no vowel */ }
      return o;
    }
  };

  // ---------- spaced repetition (SM-2 style)
  B.srsNew = function (now) { return { st: 1, iv: 0, ef: 2.5, reps: 0, lapses: 0, due: now || Date.now() }; };
  var DAY = 86400000, MIN = 60000;
  B.srsNext = function (card, grade, now) {
    // grade: 0 again, 1 hard, 2 good, 3 easy. returns a new card object and the interval in days
    now = now || Date.now(); var c = JSON.parse(JSON.stringify(card)), iv;
    if (grade === 0) { c.reps = 0; c.lapses = (c.lapses || 0) + 1; c.ef = Math.max(1.3, c.ef - 0.2); iv = 0; c.due = now + 10 * MIN; c.iv = 0; return c; }
    if (c.reps === 0) iv = grade === 1 ? 1 : grade === 2 ? 1 : 3;
    else if (c.reps === 1) iv = grade === 1 ? 2 : grade === 2 ? 3 : 5;
    else iv = Math.max(1, Math.round(c.iv * (grade === 1 ? 1.2 : grade === 2 ? c.ef : c.ef * 1.3)));
    if (grade === 1) c.ef = Math.max(1.3, c.ef - 0.15); else if (grade === 3) c.ef = c.ef + 0.15;
    if (iv <= c.iv && c.reps > 1) iv = c.iv + 1;
    c.reps++; c.iv = iv; c.due = now + iv * DAY; return c;
  };
  B.srsLabel = function (card, grade, now) { var n = B.srsNext(card, grade, now), d = (n.due - (now || Date.now())); return d < 3600000 ? Math.round(d / MIN) + 'm' : d < DAY ? Math.round(d / 3600000) + 'h' : d < 30 * DAY ? Math.round(d / DAY) + 'd' : d < 365 * DAY ? Math.round(d / (30 * DAY)) + 'mo' : (d / (365 * DAY)).toFixed(1) + 'y'; };

  // ---------- subtitles
  function ts(s) { var m = /(?:(\d+):)?(\d{1,2}):(\d{2})[.,](\d{1,3})/.exec(s); if (!m) return null; return (+(m[1] || 0)) * 3600 + (+m[2]) * 60 + (+m[3]) + (+((m[4] + '00').slice(0, 3))) / 1000; }
  B.parseSubs = function (text) {
    text = String(text).replace(/^﻿/, '').replace(/\r\n?/g, '\n');
    var blocks = text.split(/\n{2,}/), out = [];
    blocks.forEach(function (b) {
      var lines = b.split('\n').filter(function (l) { return l.length; }), i;
      for (i = 0; i < lines.length; i++) if (/-->/.test(lines[i])) break;
      if (i >= lines.length) return;
      var parts = lines[i].split('-->'), s = ts(parts[0]), e = ts(parts[1]);
      if (s == null || e == null) return;
      var t = lines.slice(i + 1).join('\n').replace(/<[^>]+>/g, '').replace(/\{\\[^}]*\}/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
      if (t) out.push({ s: s, e: e, t: t });
    });
    out.sort(function (a, b) { return a.s - b.s; });
    return out;
  };
  B.pairSubs = function (a, b) { // for each line of a, find the b line with the greatest overlap
    return a.map(function (x) { var best = null, bo = 0; (b || []).forEach(function (y) { var o = Math.min(x.e, y.e) - Math.max(x.s, y.s); if (o > bo) { bo = o; best = y; } }); return { s: x.s, e: x.e, t: x.t, n: best ? best.t : '' }; });
  };
  B.lineAt = function (lines, time) { // binary search: index of the line active at time, else -1
    var lo = 0, hi = lines.length - 1, r = -1; while (lo <= hi) { var m = (lo + hi) >> 1; if (lines[m].s <= time) { r = m; lo = m + 1; } else hi = m - 1; }
    return r >= 0 && time <= lines[r].e + 0.05 ? r : -1;
  };
  B.fmtTime = function (t) { t = Math.max(0, t); var hh = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = Math.floor(t % 60), ss = String(s).padStart(2, '0'); return hh ? hh + ':' + String(m).padStart(2, '0') + ':' + ss : m + ':' + ss; };

  // ---------- words and tokens
  B.normWord = function (w) { return String(w).normalize('NFC').toLowerCase().replace(/^[\s\p{P}\p{S}]+|[\s\p{P}\p{S}]+$/gu, ''); };
  B.tokenize = function (text, lang) { // returns [{t, w:boolean}] covering the whole text
    var out = [], seg;
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      try { seg = new Intl.Segmenter(lang && lang !== 'auto' ? lang : undefined, { granularity: 'word' }); for (var s of seg.segment(text)) out.push({ t: s.segment, w: !!s.isWordLike }); return out; } catch (e) { }
    }
    var re = /[\p{L}\p{M}\p{N}'’]+|[^\p{L}\p{M}\p{N}'’]+/gu, m; while ((m = re.exec(text))) out.push({ t: m[0], w: /[\p{L}\p{N}]/u.test(m[0]) });
    return out;
  };
  B.sentences = function (text, lang) { // split into sentences, keeping the text exactly
    var out = [], seg;
    if (typeof Intl !== 'undefined' && Intl.Segmenter) { try { seg = new Intl.Segmenter(lang && lang !== 'auto' ? lang : undefined, { granularity: 'sentence' }); for (var s of seg.segment(text)) out.push(s.segment); return out; } catch (e) { } }
    var re = /[^.!?।॥。！？\n]+[.!?।॥。！？]*\s*|\n+/g, m; while ((m = re.exec(text))) out.push(m[0]); return out;
  };

  // ---------- CSV / TSV
  B.csv = function (rows, sep) { sep = sep || ','; return rows.map(function (r) { return r.map(function (c) { c = String(c == null ? '' : c); return /[",\t\n\r]/.test(c) || (sep === ',' && c.indexOf(',') >= 0) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(sep); }).join('\n'); };
  B.parseCsv = function (text, sep) {
    text = String(text).replace(/^﻿/, ''); if (!sep) sep = (text.split('\n')[0].split('\t').length > text.split('\n')[0].split(',').length) ? '\t' : ',';
    var rows = [], row = [], cell = '', q = false, i, c;
    for (i = 0; i < text.length; i++) {
      c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
      else if (c === '"' && cell === '') q = true;
      else if (c === sep) { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); cell = ''; if (row.length > 1 || row[0] !== '') rows.push(row); row = []; }
      else cell += c;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows;
  };
})(typeof window !== 'undefined' ? (window.B = window.B || {}) : (globalThis.B = globalThis.B || {}));

;
/* Bhasha data: alphabets, numerals and a starter phrasebook for Telugu, Hindi, Kannada, Tamil and Malayalam.
   The phrasebook is a draft and must be reviewed by native speakers (see README). */
(function (B) {
  'use strict';
  var sp = function (s) { return s.split(' '); };
  B.SCRIPTS = {
    te: { vowels: sp('అ ఆ ఇ ఈ ఉ ఊ ఋ ఎ ఏ ఐ ఒ ఓ ఔ'), cons: sp('క ఖ గ ఘ ఙ చ ఛ జ ఝ ఞ ట ఠ డ ఢ ణ త థ ద ధ న ప ఫ బ భ మ య ర ల వ శ ష స హ ళ ఱ'), signs: sp('ా ి ీ ు ూ ృ ె ే ై ొ ో ౌ'), base: 'క', digits: sp('౦ ౧ ౨ ౩ ౪ ౫ ౬ ౭ ౮ ౯') },
    hi: { vowels: sp('अ आ इ ई उ ऊ ऋ ए ऐ ओ औ'), cons: sp('क ख ग घ ङ च छ ज झ ञ ट ठ ड ढ ण त थ द ध न प फ ब भ म य र ल व श ष स ह'), signs: sp('ा ि ी ु ू ृ े ै ो ौ'), base: 'क', digits: sp('० १ २ ३ ४ ५ ६ ७ ८ ९') },
    kn: { vowels: sp('ಅ ಆ ಇ ಈ ಉ ಊ ಋ ಎ ಏ ಐ ಒ ಓ ಔ'), cons: sp('ಕ ಖ ಗ ಘ ಙ ಚ ಛ ಜ ಝ ಞ ಟ ಠ ಡ ಢ ಣ ತ ಥ ದ ಧ ನ ಪ ಫ ಬ ಭ ಮ ಯ ರ ಲ ವ ಶ ಷ ಸ ಹ ಳ'), signs: sp('ಾ ಿ ೀ ು ೂ ೃ ೆ ೇ ೈ ೊ ೋ ೌ'), base: 'ಕ', digits: sp('೦ ೧ ೨ ೩ ೪ ೫ ೬ ೭ ೮ ೯') },
    ta: { vowels: sp('அ ஆ இ ஈ உ ஊ எ ஏ ஐ ஒ ஓ ஔ'), cons: sp('க ங ச ஞ ட ண த ந ப ம ய ர ல வ ழ ள ற ன ஜ ஷ ஸ ஹ'), signs: sp('ா ி ீ ு ூ ெ ே ை ொ ோ ௌ'), base: 'க', digits: sp('௦ ௧ ௨ ௩ ௪ ௫ ௬ ௭ ௮ ௯') },
    ml: { vowels: sp('അ ആ ഇ ഈ ഉ ഊ ഋ എ ഏ ഐ ഒ ഓ ഔ'), cons: sp('ക ഖ ഗ ഘ ങ ച ഛ ജ ഝ ഞ ട ഠ ഡ ഢ ണ ത ഥ ദ ധ ന പ ഫ ബ ഭ മ യ ര ല വ ശ ഷ സ ഹ ള ഴ റ'), signs: sp('ാ ി ീ ു ൂ ൃ െ േ ൈ ൊ ോ ൌ'), base: 'ക', digits: sp('൦ ൧ ൨ ൩ ൪ ൫ ൬ ൭ ൮ ൯') }
  };
  B.PHRASE_CATS = ['greet', 'intro', 'daily', 'num'];
  // id, category, English, then te, hi, kn, ta, ml
  var P = [
    ['hello', 'greet', 'Hello', 'నమస్కారం', 'नमस्ते', 'ನಮಸ್ಕಾರ', 'வணக்கம்', 'നമസ്കാരം'],
    ['morning', 'greet', 'Good morning', 'శుభోదయం', 'सुप्रभात', 'ಶುಭೋದಯ', 'காலை வணக்கம்', 'സുപ്രഭാതം'],
    ['night', 'greet', 'Good night', 'శుభ రాత్రి', 'शुभ रात्रि', 'ಶುಭ ರಾತ್ರಿ', 'இனிய இரவு', 'ശുഭരാത്രി'],
    ['bye', 'greet', 'See you again', 'మళ్ళీ కలుద్దాం', 'फिर मिलेंगे', 'ಮತ್ತೆ ಸಿಗೋಣ', 'மீண்டும் சந்திப்போம்', 'വീണ്ടും കാണാം'],
    ['thanks', 'greet', 'Thank you', 'ధన్యవాదాలు', 'धन्यवाद', 'ಧನ್ಯವಾದಗಳು', 'நன்றி', 'നന്ദി'],
    ['welcome', 'greet', "You're welcome", 'పరవాలేదు', 'आपका स्वागत है', 'ಪರವಾಗಿಲ್ಲ', 'பரவாயில்லை', 'ഒരു കുഴപ്പവുമില്ല'],
    ['please', 'greet', 'Please', 'దయచేసి', 'कृपया', 'ದಯವಿಟ್ಟು', 'தயவுசெய்து', 'ദയവായി'],
    ['sorry', 'greet', 'Sorry', 'క్షమించండి', 'माफ़ कीजिए', 'ಕ್ಷಮಿಸಿ', 'மன்னிக்கவும்', 'ക്ഷമിക്കണം'],
    ['yes', 'greet', 'Yes', 'అవును', 'हाँ', 'ಹೌದು', 'ஆம்', 'അതെ'],
    ['no', 'greet', 'No', 'కాదు', 'नहीं', 'ಇಲ್ಲ', 'இல்லை', 'ഇല്ല'],
    ['name-q', 'intro', 'What is your name?', 'మీ పేరు ఏమిటి?', 'आपका नाम क्या है?', 'ನಿಮ್ಮ ಹೆಸರೇನು?', 'உங்கள் பெயர் என்ன?', 'നിങ്ങളുടെ പേര് എന്താണ്?'],
    ['name-is', 'intro', 'My name is …', 'నా పేరు …', 'मेरा नाम … है।', 'ನನ್ನ ಹೆಸರು …', 'என் பெயர் …', 'എന്റെ പേര് …'],
    ['from-q', 'intro', 'Where are you from?', 'మీరు ఎక్కడి నుండి వచ్చారు?', 'आप कहाँ से हैं?', 'ನೀವು ಎಲ್ಲಿಂದ ಬಂದಿದ್ದೀರಿ?', 'நீங்கள் எங்கிருந்து வருகிறீர்கள்?', 'നിങ്ങൾ എവിടെ നിന്നാണ്?'],
    ['from-india', 'intro', 'I am from India.', 'నేను భారతదేశం నుండి వచ్చాను.', 'मैं भारत से हूँ।', 'ನಾನು ಭಾರತದಿಂದ ಬಂದಿದ್ದೇನೆ.', 'நான் இந்தியாவிலிருந்து வருகிறேன்.', 'ഞാൻ ഇന്ത്യയിൽ നിന്നാണ്.'],
    ['nice', 'intro', 'Nice to meet you.', 'మిమ్మల్ని కలవడం సంతోషం.', 'आपसे मिलकर खुशी हुई।', 'ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿ ಸಂತೋಷವಾಯಿತು.', 'உங்களைச் சந்தித்ததில் மகிழ்ச்சி.', 'നിങ്ങളെ കണ്ടതിൽ സന്തോഷം.'],
    ['how', 'intro', 'How are you?', 'మీరు ఎలా ఉన్నారు?', 'आप कैसे हैं?', 'ನೀವು ಹೇಗಿದ್ದೀರಿ?', 'நீங்கள் எப்படி இருக்கிறீர்கள்?', 'സുഖമാണോ?'],
    ['fine', 'intro', 'I am fine.', 'నేను బాగున్నాను.', 'मैं ठीक हूँ।', 'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ.', 'நான் நலமாக இருக்கிறேன்.', 'എനിക്ക് സുഖമാണ്.'],
    ['dont-understand', 'intro', "I don't understand.", 'నాకు అర్థం కాలేదు.', 'मुझे समझ नहीं आया।', 'ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ.', 'எனக்குப் புரியவில்லை.', 'എനിക്ക് മനസ്സിലായില്ല.'],
    ['english-q', 'intro', 'Do you speak English?', 'మీకు ఇంగ్లీష్ వచ్చా?', 'क्या आप अंग्रेज़ी बोलते हैं?', 'ನಿಮಗೆ ಇಂಗ್ಲಿಷ್ ಬರುತ್ತದೆಯೇ?', 'உங்களுக்கு ஆங்கிலம் தெரியுமா?', 'നിങ്ങൾക്ക് ഇംഗ്ലീഷ് അറിയാമോ?'],
    ['slowly', 'intro', 'Please speak slowly.', 'దయచేసి నెమ్మదిగా మాట్లాడండి.', 'कृपया धीरे बोलिए।', 'ದಯವಿಟ್ಟು ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ.', 'தயவுசெய்து மெதுவாகப் பேசுங்கள்.', 'ദയവായി പതുക്കെ സംസാരിക്കൂ.'],
    ['price', 'daily', 'How much is this?', 'ఇది ఎంత?', 'यह कितने का है?', 'ಇದರ ಬೆಲೆ ಎಷ್ಟು?', 'இது எவ்வளவு?', 'ഇതിന് എത്രയാണ് വില?'],
    ['toilet', 'daily', 'Where is the toilet?', 'టాయిలెట్ ఎక్కడ ఉంది?', 'शौचालय कहाँ है?', 'ಶೌಚಾಲಯ ಎಲ್ಲಿದೆ?', 'கழிப்பறை எங்கே இருக்கிறது?', 'ശൗചാലയം എവിടെയാണ്?'],
    ['help', 'daily', 'I need help.', 'నాకు సహాయం కావాలి.', 'मुझे मदद चाहिए।', 'ನನಗೆ ಸಹಾಯ ಬೇಕು.', 'எனக்கு உதவி வேண்டும்.', 'എനിക്ക് സഹായം വേണം.'],
    ['water', 'daily', 'Water, please.', 'దయచేసి నీళ్ళు ఇవ్వండి.', 'कृपया पानी दीजिए।', 'ದಯವಿಟ್ಟು ನೀರು ಕೊಡಿ.', 'தயவுசெய்து தண்ணீர் கொடுங்கள்.', 'ദയവായി വെള്ളം തരൂ.'],
    ['hungry', 'daily', 'I am hungry.', 'నాకు ఆకలిగా ఉంది.', 'मुझे भूख लगी है।', 'ನನಗೆ ಹಸಿವಾಗಿದೆ.', 'எனக்குப் பசிக்கிறது.', 'എനിക്ക് വിശക്കുന്നു.'],
    ['delicious', 'daily', 'The food is delicious.', 'భోజనం చాలా రుచిగా ఉంది.', 'खाना बहुत स्वादिष्ट है।', 'ಊಟ ತುಂಬಾ ರುಚಿಯಾಗಿದೆ.', 'உணவு மிகவும் சுவையாக இருக்கிறது.', 'ഭക്ഷണം വളരെ രുചികരമാണ്.'],
    ['bus', 'daily', 'Where is the bus stop?', 'బస్ స్టాప్ ఎక్కడ ఉంది?', 'बस स्टॉप कहाँ है?', 'ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?', 'பேருந்து நிறுத்தம் எங்கே இருக்கிறது?', 'ബസ് സ്റ്റോപ്പ് എവിടെയാണ്?'],
    ['doctor', 'daily', 'Please call a doctor.', 'దయచేసి డాక్టర్‌ని పిలవండి.', 'कृपया डॉक्टर को बुलाइए।', 'ದಯವಿಟ್ಟು ವೈದ್ಯರನ್ನು ಕರೆಯಿರಿ.', 'தயவுசெய்து மருத்துவரை அழையுங்கள்.', 'ദയവായി ഡോക്ടറെ വിളിക്കൂ.'],
    ['time', 'daily', 'What time is it?', 'ఇప్పుడు సమయం ఎంత?', 'अभी क्या समय हुआ है?', 'ಈಗ ಸಮಯ ಎಷ್ಟು?', 'இப்போது மணி என்ன?', 'ഇപ്പോൾ സമയം എത്രയായി?'],
    ['learn', 'daily', 'I want to learn this language.', 'నేను తెలుగు నేర్చుకోవాలనుకుంటున్నాను.', 'मैं हिंदी सीखना चाहता हूँ।', 'ನಾನು ಕನ್ನಡ ಕಲಿಯಲು ಬಯಸುತ್ತೇನೆ.', 'நான் தமிழ் கற்றுக்கொள்ள விரும்புகிறேன்.', 'എനിക്ക് മലയാളം പഠിക്കണം.'],
    ['today', 'daily', 'Today', 'ఈ రోజు', 'आज', 'ಇಂದು', 'இன்று', 'ഇന്ന്'],
    ['tomorrow', 'daily', 'Tomorrow', 'రేపు', 'आने वाला कल', 'ನಾಳೆ', 'நாளை', 'നാളെ'],
    ['yesterday', 'daily', 'Yesterday', 'నిన్న', 'बीता हुआ कल', 'ನಿನ್ನೆ', 'நேற்று', 'ഇന്നലെ']
  ];
  var N = [['one', 'One', 'ఒకటి', 'एक', 'ಒಂದು', 'ஒன்று', 'ഒന്ന്'], ['two', 'Two', 'రెండు', 'दो', 'ಎರಡು', 'இரண்டு', 'രണ്ട്'], ['three', 'Three', 'మూడు', 'तीन', 'ಮೂರು', 'மூன்று', 'മൂന്ന്'], ['four', 'Four', 'నాలుగు', 'चार', 'ನಾಲ್ಕು', 'நான்கு', 'നാല്'], ['five', 'Five', 'ఐదు', 'पाँच', 'ಐದು', 'ஐந்து', 'അഞ്ച്'], ['six', 'Six', 'ఆరు', 'छह', 'ಆರು', 'ஆறு', 'ആറ്'], ['seven', 'Seven', 'ఏడు', 'सात', 'ಏಳು', 'ஏழு', 'ഏഴ്'], ['eight', 'Eight', 'ఎనిమిది', 'आठ', 'ಎಂಟು', 'எட்டு', 'എട്ട്'], ['nine', 'Nine', 'తొమ్మిది', 'नौ', 'ಒಂಬತ್ತು', 'ஒன்பது', 'ഒമ്പത്'], ['ten', 'Ten', 'పది', 'दस', 'ಹತ್ತು', 'பத்து', 'പത്ത്']];
  var IDX = { te: 3, hi: 4, kn: 5, ta: 6, ml: 7 };
  B.PHRASES = P.map(function (r) { var o = { id: r[0], cat: r[1], en: r[2] }; B.INDIC.forEach(function (l) { o[l] = r[IDX[l]]; }); return o; }).concat(N.map(function (r) { var o = { id: 'n-' + r[0], cat: 'num', en: r[1] }; B.INDIC.forEach(function (l) { o[l] = r[IDX[l] - 1]; }); return o; }));
  B.sampleText = function (lang) { var ids = ['how', 'fine', 'name-q', 'from-q', 'from-india', 'nice', 'slowly', 'learn']; return ids.map(function (i) { return B.PHRASES.filter(function (p) { return p.id === i; })[0][lang]; }).join(' '); };
  B.sampleSrt = function (lang) { var ids = ['hello', 'how', 'fine', 'name-q', 'from-q', 'from-india', 'nice', 'thanks'], t = 0, out = []; ids.forEach(function (i, k) { var p = B.PHRASES.filter(function (x) { return x.id === i; })[0]; out.push({ s: t, e: t + 3.5, t: p[lang], n: p.en }); t += 4; }); return out; };
  B.srtText = function (lines, which) { function f(x) { var h = Math.floor(x / 3600), m = Math.floor(x % 3600 / 60), s = Math.floor(x % 60), ms = Math.round((x % 1) * 1000); return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') + ',' + String(ms).padStart(3, '0'); } return lines.map(function (l, i) { return (i + 1) + '\n' + f(l.s) + ' --> ' + f(l.e) + '\n' + (which === 'n' ? l.n : l.t) + '\n'; }).join('\n'); };
})(typeof window !== 'undefined' ? window.B : globalThis.B);

;
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
  var UILANGS = ['en', 'hi', 'te', 'kn', 'ta', 'ml'];
  var set = U.set = (function () {
    var s = jget('bh-set', {}), nl = (navigator.language || 'en').toLowerCase().slice(0, 2), sl = store.get('el-lang');
    if (UILANGS.indexOf(s.ui) < 0) s.ui = UILANGS.indexOf(sl) >= 0 ? sl : (UILANGS.indexOf(nl) >= 0 ? nl : 'en');
    if (B.INDIC.indexOf(s.focus) < 0) s.focus = 'te';
    if (s.scheme !== 'iast') s.scheme = 'simple';
    if (s.roman == null) s.roman = true;
    if (!(s.perDay >= 0)) s.perDay = 10;
    if (!(s.rate > 0)) s.rate = 0.9;
    s.theme = document.documentElement.getAttribute('data-theme') || 'light';
    return s;
  })();
  U.saveSet = function () { store.set('bh-set', JSON.stringify({ ui: set.ui, focus: set.focus, scheme: set.scheme, roman: set.roman, perDay: set.perDay, rate: set.rate })); store.set('el-lang', set.ui); store.set('el-theme', set.theme); };
  U.t = function (k, v) { var d = B.I18N[set.ui] || B.I18N.en, s = d[k]; if (s == null) s = B.I18N.en[k]; if (s == null) s = k; if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]); return s; };
  var t = U.t;
  U.applyTheme = function () { document.documentElement.setAttribute('data-theme', set.theme); var m = $('meta[name=theme-color]'); if (m) m.setAttribute('content', { light: '#1c1b4b', dark: '#1c1b4b', new: '#0b3d3a' }[set.theme]); };
  U.applyLang = function () { document.documentElement.lang = set.ui; };
  var toastT; U.toast = function (m) { var e = $('#toast'); if (!e) return; e.textContent = m; e.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { e.hidden = true; }, 2200); };
  U.langName = function (c) { var a = B.allLangs().filter(function (x) { return x[0] === c; })[0]; return a ? a[1] : c; };
  U.langNative = function (c) { var a = B.allLangs().filter(function (x) { return x[0] === c; })[0]; return a ? a[2] : c; };
  U.roman = function (w, lang) { return B.isBrahmic(w) ? B.translit(w, set.scheme) : ''; };
  U.today = function () { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

  // ---------- speech
  var voices = [];
  function loadVoices() { try { voices = window.speechSynthesis ? speechSynthesis.getVoices() : []; } catch (e) { voices = []; } }
  if ('speechSynthesis' in window) { loadVoices(); try { speechSynthesis.addEventListener('voiceschanged', loadVoices); } catch (e) { } }
  U.voiceFor = function (lang) { var code = B.bcp(lang).toLowerCase(), pre = code.slice(0, 2), v = null, i; for (i = 0; i < voices.length; i++) if (voices[i].lang.toLowerCase().replace('_', '-') === code) { v = voices[i]; break; } if (!v) for (i = 0; i < voices.length; i++) if (voices[i].lang.toLowerCase().indexOf(pre) === 0) { v = voices[i]; break; } return v; };
  U.canSpeak = function () { return 'speechSynthesis' in window; };
  U.speak = function (text, lang, onend, rate) {
    if (!U.canSpeak()) { U.toast(t('noTts')); if (onend) setTimeout(onend, 0); return false; }
    loadVoices(); var v = U.voiceFor(lang), u = new SpeechSynthesisUtterance(text);
    u.lang = B.bcp(lang); if (v) u.voice = v; else if (voices.length) U.toast(t('noVoice', { l: U.langName(lang) }));
    u.rate = rate || set.rate; var done = false; function fin() { if (!done) { done = true; if (onend) onend(); } } u.onend = fin; u.onerror = fin;
    try { speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { fin(); return false; }
    return true;
  };
  U.stopSpeak = function () { try { if (U.canSpeak()) speechSynthesis.cancel(); } catch (e) { } };

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
      if (opts && opts.roman && B.isBrahmic(w)) { var ru = h('ruby', null, [document.createTextNode(w), h('rt', { text: B.translit(w, set.scheme) })]); el.appendChild(ru); } else el.textContent = w;
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

;
/* Bhasha interface text. English is the master; other languages are drafts awaiting native review. */
(function (B) {
  'use strict';
  var I = B.I18N = {};
  I.en = {
    skip: 'Skip to content', settings: 'Settings', part: 'Part of EknathaLabs', privacyNote: 'Runs in your browser. Your files and words stay on your device.', mainNav: 'Main', uiLang: 'Interface language', focusLang: 'Language I am learning', scheme: 'Romanization style', schSimple: 'Simple', schIast: 'Scholarly', showRoman: 'Show romanization', on: 'On', off: 'Off', voiceSpeed: 'Voice speed', perDay: 'Reviews per session', unlimited: 'No limit', theme: 'Theme', light: 'Light', dark: 'Dark', 'new': 'New', language: 'Language', allLangs: 'All languages', allStatus: 'All', auto: 'Detect automatically', indianLangs: 'Indian languages', otherLangs: 'Other languages',
    nav_watch: 'Watch', nav_read: 'Read', nav_words: 'My words', nav_review: 'Review', nav_scripts: 'Scripts', nav_phrases: 'Phrases',
    homeH: 'Learn spoken languages from what you watch and read', homeSub: 'Bring your own video, audio or text. Tap any word to hear it, see how it sounds in English letters, and save it. Review with spaced repetition. Free, private and works offline.', statWords: 'Saved words', statDue: 'Due today', statStreak: 'Day streak',
    cWatch: 'Play your video or audio with two subtitle lines. Tap words, repeat a line, slow it down, shadow the speaker.', cRead: 'Paste or open any text. Every word is tappable, with romanization and read-aloud.', cWords: 'Everything you saved, with export to CSV, Anki and a backup file.', cReview: 'Flashcards that come back just before you forget.', cScripts: 'Letters, vowel signs and digits. Hear, quiz and trace them.', cPhrases: 'Everyday phrases in Telugu, Hindi, Kannada, Tamil and Malayalam.', dueCount: '{n} due',
    howH: 'How it works', how1: 'Open a subtitle file with your video, or paste a text.', how2: 'Tap a word you do not know. Hear it and save it with a meaning.', how3: 'Come back to Review. Cards return at the right time.', how4: 'Everything stays on this device. Export any time.', homeNote: 'Voices come from your device. Indian-language voices vary by phone and browser. Install one in your system settings if you hear none.',
    noTts: 'This browser cannot speak text aloud.', noVoice: 'No {l} voice on this device. Install one in your system settings.', storageFull: 'Could not save. Browser storage is full or blocked.', meaning: 'Meaning', status: 'Status', st0: 'New', st1: 'Learning', st2: 'Known', seenIn: 'Also in the phrasebook', speak: 'Speak', close: 'Close', update: 'Update', save: 'Save word', saved: 'Saved', remove: 'Remove', speakSentence: 'Read sentence', translateDevice: 'Translate on device', trFail: 'Translation is not available.', lookup: 'Look up', opensTab: 'opens a new tab', wordDetails: 'Word details',
    rdLede: 'Paste or open a text. Tap any word.', rdPlaceholder: 'Paste text in any language here', rdText: 'Text to read', rdEmpty: 'Nothing to show yet. Paste a text or load the sample.', rdStats: '{n} words, {u} different. {k} known, {l} learning. Language: {lang}', textLang: 'Text language', colorWords: 'Colour words by status', fontSize: 'Text size', readAloud: 'Read aloud', stop: 'Stop', sample: 'Load sample', importTxt: 'Open text file', clear: 'Clear', clickWord: 'Tap a word to see details',
    wtLede: 'Use your own video or audio with a subtitle file. Nothing is uploaded.', wtSetup: 'Choose your files', wtDrop: 'Drop a video or audio file and subtitle files here, or use the buttons.', wtMedia: 'Video or audio', wtSub1: 'Subtitles (language you learn)', wtSub2: 'Subtitles (your language)', subLang: 'Subtitle language', wtStart: 'Start', wtSample: 'Try the sample (reads aloud)', noSubs: 'No subtitles found in {f}. Use .srt or .vtt.', wtPrivacy: 'Files are opened inside your browser and never leave your device. Without a video or audio file, the lines are read aloud by your device voice.', wtListenMode: 'Listen mode: lines are read aloud', wtTranscript: 'Transcript', playPause: 'Play or pause', prevLine: 'Previous line', nextLine: 'Next line', replay: 'Replay line', loopLine: 'Loop line', autoPause: 'Pause after each line', hideTarget: 'Hide learning subtitle', hideNative: 'Hide my-language subtitle', blurNative: 'Blur my language', speed: 'Speed', subEarlier: 'Show subtitles earlier', subLater: 'Show subtitles later', shadow: 'Shadow', stopRec: 'Stop', yourVoice: 'Your voice', orig: 'Original', noMic: 'Recording is not supported here.', micDenied: 'Microphone permission was denied.', wtChange: 'Change files', wtKeys: 'Keys: Space play/pause, A/D or arrows previous/next, R replay, L loop, P pause after each line.',
    wdLede: 'Your saved words. Stored only in this browser.', wdCount: '{n} shown, {d} due now', wdNoMatch: 'No words match.', wdEmpty: 'No saved words yet.', wdEmptySub: 'Open Read or Watch and tap a word to save it.', wdMore: '{n} more not shown. Use the search.', wdNothing: 'Nothing to export.', wdImported: '{n} new words imported.', wdImportFail: 'Could not read that file.', wdPrivacy: 'Clear your browser data and the list is gone, so export a backup now and then.', search: 'Search', edit: 'Edit', dueNow: 'Due now', dueToday: 'Due today', dueIn: 'In {n} d', backup: 'Backup', importWords: 'Import',
    rvLede: 'Flip the card, then rate how well you knew it.', rvMode: 'Practice mode', rvW2M: 'Word to meaning', rvM2W: 'Meaning to word', rvListen: 'Listening', rvCloze: 'Fill the gap', rvStreak: 'Day streak: {n}', rvDone: 'Done: {n} cards', rvDoneSub: 'Come back later. Cards you missed return in minutes, the rest in days.', rvNone: 'Nothing due', rvNoneSub: 'You are caught up. Read or watch more to find new words.', rvWhichWord: 'What is the word?', rvPlay: 'Play word', rvListenQ: 'Listen, then recall the meaning', rvHint: 'Meaning', rvShow: 'Show answer', rvProgress: 'Session progress', again: 'Again', hard: 'Hard', good: 'Good', easy: 'Easy',
    scLede: 'Learn the letters. Tap any glyph to hear it and trace it.', scVowels: 'Vowels', scCons: 'Consonants', scSigns: 'Vowel signs', scSignsNote: 'Shown on the letter {b}', scDigits: 'Digits', scQuiz: 'Quick quiz', scQuizQ: 'How do you read this letter?', scTrace: 'Trace', scTraceHint: 'Tap a letter above, then trace it here.', correct: 'Correct!', wrongIs: 'Not quite. It is {a}.', next: 'Next',
    phLede: 'Everyday phrases. Tap any word to save it.', phNote: 'Phrases are a starter set. A native speaker should check them before you rely on them.', cat_greet: 'Greetings', cat_intro: 'Introductions', cat_daily: 'Daily life', cat_num: 'Numbers', slow: 'Slow'
  };
  I.hi = {
    skip: 'सामग्री पर जाएँ', settings: 'सेटिंग', part: 'EknathaLabs का हिस्सा', privacyNote: 'आपके ब्राउज़र में चलता है। आपकी फ़ाइलें और शब्द आपके डिवाइस पर रहते हैं।', mainNav: 'मुख्य', uiLang: 'इंटरफ़ेस भाषा', focusLang: 'जो भाषा मैं सीख रहा/रही हूँ', scheme: 'रोमन लिपि शैली', schSimple: 'सरल', schIast: 'विद्वत', showRoman: 'रोमन में उच्चारण दिखाएँ', on: 'चालू', off: 'बंद', voiceSpeed: 'आवाज़ की गति', perDay: 'हर सत्र में दोहराव', unlimited: 'असीमित', theme: 'थीम', light: 'हल्का', dark: 'गहरा', 'new': 'नया', language: 'भाषा', allLangs: 'सभी भाषाएँ', allStatus: 'सभी', auto: 'अपने आप पहचानें', indianLangs: 'भारतीय भाषाएँ', otherLangs: 'अन्य भाषाएँ',
    nav_watch: 'देखें', nav_read: 'पढ़ें', nav_words: 'मेरे शब्द', nav_review: 'दोहराएँ', nav_scripts: 'लिपियाँ', nav_phrases: 'वाक्यांश',
    homeH: 'जो देखते और पढ़ते हैं, उसी से बोली जाने वाली भाषाएँ सीखें', homeSub: 'अपना वीडियो, ऑडियो या पाठ लाएँ। किसी भी शब्द पर टैप करके सुनें, अंग्रेज़ी अक्षरों में उच्चारण देखें और सहेजें। अंतराल दोहराव से याद रखें। मुफ़्त, निजी और ऑफ़लाइन चलता है।', statWords: 'सहेजे शब्द', statDue: 'आज के लिए', statStreak: 'लगातार दिन',
    cWatch: 'अपना वीडियो या ऑडियो दो उपशीर्षक पंक्तियों के साथ चलाएँ। शब्द टैप करें, पंक्ति दोहराएँ, गति घटाएँ, वक्ता की नकल करें।', cRead: 'कोई भी पाठ चिपकाएँ या खोलें। हर शब्द टैप हो सकता है, रोमन उच्चारण और पढ़कर सुनाने के साथ।', cWords: 'आपके सहेजे सभी शब्द, CSV, Anki और बैकअप फ़ाइल में निर्यात के साथ।', cReview: 'फ़्लैशकार्ड जो भूलने से ठीक पहले लौटते हैं।', cScripts: 'अक्षर, मात्राएँ और अंक। सुनें, क्विज़ खेलें और लिखकर अभ्यास करें।', cPhrases: 'तेलुगु, हिन्दी, कन्नड़, तमिल और मलयालम के रोज़मर्रा के वाक्यांश।', dueCount: '{n} बाकी',
    howH: 'यह कैसे काम करता है', how1: 'अपने वीडियो के साथ उपशीर्षक फ़ाइल खोलें, या पाठ चिपकाएँ।', how2: 'जो शब्द न आता हो उस पर टैप करें। सुनें और अर्थ के साथ सहेजें।', how3: 'दोहराएँ में लौटें। कार्ड सही समय पर आते हैं।', how4: 'सब कुछ इसी डिवाइस पर रहता है। कभी भी निर्यात करें।', homeNote: 'आवाज़ें आपके डिवाइस से आती हैं। भारतीय भाषाओं की आवाज़ें फ़ोन और ब्राउज़र के अनुसार अलग होती हैं। कोई आवाज़ न सुनाई दे तो सिस्टम सेटिंग में एक इंस्टॉल करें।',
    noTts: 'यह ब्राउज़र पाठ को बोलकर नहीं सुना सकता।', noVoice: 'इस डिवाइस पर {l} की आवाज़ नहीं है। सिस्टम सेटिंग में इंस्टॉल करें।', storageFull: 'सहेज नहीं सके। ब्राउज़र का स्टोरेज भरा या बंद है।', meaning: 'अर्थ', status: 'स्थिति', st0: 'नया', st1: 'सीख रहे हैं', st2: 'आता है', seenIn: 'वाक्यांश-पुस्तिका में भी', speak: 'बोलें', close: 'बंद करें', update: 'अपडेट करें', save: 'शब्द सहेजें', saved: 'सहेजा गया', remove: 'हटाएँ', speakSentence: 'वाक्य पढ़ें', translateDevice: 'डिवाइस पर अनुवाद', trFail: 'अनुवाद उपलब्ध नहीं है।', lookup: 'खोजें', opensTab: 'नया टैब खुलता है', wordDetails: 'शब्द का विवरण',
    rdLede: 'पाठ चिपकाएँ या खोलें। किसी भी शब्द पर टैप करें।', rdPlaceholder: 'यहाँ किसी भी भाषा का पाठ चिपकाएँ', rdText: 'पढ़ने का पाठ', rdEmpty: 'अभी दिखाने को कुछ नहीं। पाठ चिपकाएँ या नमूना लोड करें।', rdStats: '{n} शब्द, {u} अलग। {k} आते हैं, {l} सीख रहे हैं। भाषा: {lang}', textLang: 'पाठ की भाषा', colorWords: 'स्थिति के अनुसार शब्दों को रंगें', fontSize: 'अक्षर का आकार', readAloud: 'पढ़कर सुनाएँ', stop: 'रोकें', sample: 'नमूना लोड करें', importTxt: 'पाठ फ़ाइल खोलें', clear: 'साफ़ करें', clickWord: 'विवरण के लिए शब्द टैप करें',
    wtLede: 'अपना वीडियो या ऑडियो उपशीर्षक फ़ाइल के साथ इस्तेमाल करें। कुछ भी अपलोड नहीं होता।', wtSetup: 'अपनी फ़ाइलें चुनें', wtDrop: 'वीडियो या ऑडियो और उपशीर्षक फ़ाइलें यहाँ छोड़ें, या बटन इस्तेमाल करें।', wtMedia: 'वीडियो या ऑडियो', wtSub1: 'उपशीर्षक (जो भाषा सीख रहे हैं)', wtSub2: 'उपशीर्षक (आपकी भाषा)', subLang: 'उपशीर्षक की भाषा', wtStart: 'शुरू करें', wtSample: 'नमूना आज़माएँ (बोलकर सुनाता है)', noSubs: '{f} में उपशीर्षक नहीं मिले। .srt या .vtt इस्तेमाल करें।', wtPrivacy: 'फ़ाइलें आपके ब्राउज़र में ही खुलती हैं और डिवाइस से बाहर नहीं जातीं। वीडियो या ऑडियो के बिना पंक्तियाँ आपके डिवाइस की आवाज़ में सुनाई जाती हैं।', wtListenMode: 'सुनने का मोड: पंक्तियाँ बोलकर सुनाई जाती हैं', wtTranscript: 'लिखित पाठ', playPause: 'चलाएँ या रोकें', prevLine: 'पिछली पंक्ति', nextLine: 'अगली पंक्ति', replay: 'पंक्ति दोबारा', loopLine: 'पंक्ति दोहराएँ', autoPause: 'हर पंक्ति के बाद रुकें', hideTarget: 'सीखी जा रही भाषा का उपशीर्षक छिपाएँ', hideNative: 'अपनी भाषा का उपशीर्षक छिपाएँ', blurNative: 'अपनी भाषा धुंधली करें', speed: 'गति', subEarlier: 'उपशीर्षक जल्दी दिखाएँ', subLater: 'उपशीर्षक देर से दिखाएँ', shadow: 'नकल करें', stopRec: 'रोकें', yourVoice: 'आपकी आवाज़', orig: 'मूल', noMic: 'यहाँ रिकॉर्डिंग समर्थित नहीं है।', micDenied: 'माइक्रोफ़ोन की अनुमति नहीं मिली।', wtChange: 'फ़ाइलें बदलें', wtKeys: 'कुंजियाँ: स्पेस चलाएँ/रोकें, A/D या तीर पिछली/अगली, R दोबारा, L दोहराव, P हर पंक्ति पर रुकें।',
    wdLede: 'आपके सहेजे शब्द। केवल इसी ब्राउज़र में रखे जाते हैं।', wdCount: '{n} दिख रहे हैं, {d} अभी बाकी', wdNoMatch: 'कोई शब्द मेल नहीं खाता।', wdEmpty: 'अभी कोई शब्द सहेजा नहीं है।', wdEmptySub: 'पढ़ें या देखें खोलकर किसी शब्द पर टैप करें और सहेजें।', wdMore: '{n} और नहीं दिख रहे। खोज इस्तेमाल करें।', wdNothing: 'निर्यात के लिए कुछ नहीं।', wdImported: '{n} नए शब्द आयात हुए।', wdImportFail: 'वह फ़ाइल पढ़ नहीं सके।', wdPrivacy: 'ब्राउज़र डेटा साफ़ करने पर सूची मिट जाती है, इसलिए समय-समय पर बैकअप निर्यात करें।', search: 'खोजें', edit: 'बदलें', dueNow: 'अभी बाकी', dueToday: 'आज बाकी', dueIn: '{n} दिन में', backup: 'बैकअप', importWords: 'आयात',
    rvLede: 'कार्ड पलटें, फिर बताएँ कि कितना याद था।', rvMode: 'अभ्यास का तरीका', rvW2M: 'शब्द से अर्थ', rvM2W: 'अर्थ से शब्द', rvListen: 'सुनकर', rvCloze: 'खाली जगह भरें', rvStreak: 'लगातार दिन: {n}', rvDone: 'पूरा: {n} कार्ड', rvDoneSub: 'बाद में लौटें। छूटे कार्ड मिनटों में, बाकी दिनों में लौटते हैं।', rvNone: 'कुछ भी बाकी नहीं', rvNoneSub: 'आप आगे हैं। नए शब्द पाने के लिए और पढ़ें या देखें।', rvWhichWord: 'यह कौन सा शब्द है?', rvPlay: 'शब्द सुनें', rvListenQ: 'सुनें, फिर अर्थ याद करें', rvHint: 'अर्थ', rvShow: 'उत्तर दिखाएँ', rvProgress: 'सत्र की प्रगति', again: 'फिर से', hard: 'कठिन', good: 'ठीक', easy: 'आसान',
    scLede: 'अक्षर सीखें। किसी भी अक्षर पर टैप करके सुनें और लिखकर अभ्यास करें।', scVowels: 'स्वर', scCons: 'व्यंजन', scSigns: 'मात्राएँ', scSignsNote: 'अक्षर {b} पर दिखाई गई', scDigits: 'अंक', scQuiz: 'छोटी क्विज़', scQuizQ: 'यह अक्षर कैसे पढ़ते हैं?', scTrace: 'लिखकर देखें', scTraceHint: 'ऊपर कोई अक्षर टैप करें, फिर यहाँ उसे लिखें।', correct: 'सही!', wrongIs: 'ठीक नहीं। यह {a} है।', next: 'आगे',
    phLede: 'रोज़मर्रा के वाक्यांश। किसी भी शब्द पर टैप करके सहेजें।', phNote: 'ये वाक्यांश शुरुआती सेट हैं। भरोसा करने से पहले किसी मातृभाषी से जँचवा लें।', cat_greet: 'अभिवादन', cat_intro: 'परिचय', cat_daily: 'रोज़मर्रा', cat_num: 'संख्याएँ', slow: 'धीरे'
  };
  I.te = {
    skip: 'కంటెంట్‌కు వెళ్లండి', settings: 'సెట్టింగ్‌లు', part: 'EknathaLabs లో భాగం', privacyNote: 'మీ బ్రౌజర్‌లోనే నడుస్తుంది. మీ ఫైళ్లు, పదాలు మీ పరికరంలోనే ఉంటాయి.', mainNav: 'ప్రధాన', uiLang: 'ఇంటర్‌ఫేస్ భాష', focusLang: 'నేను నేర్చుకుంటున్న భాష', scheme: 'రోమన్ శైలి', schSimple: 'సరళం', schIast: 'పండిత', showRoman: 'రోమన్ ఉచ్చారణ చూపు', on: 'ఆన్', off: 'ఆఫ్', voiceSpeed: 'స్వరం వేగం', perDay: 'ఒక సెషన్‌లో రివ్యూలు', unlimited: 'పరిమితి లేదు', theme: 'థీమ్', light: 'లైట్', dark: 'డార్క్', 'new': 'కొత్త', language: 'భాష', allLangs: 'అన్ని భాషలు', allStatus: 'అన్నీ', auto: 'ఆటోమేటిక్‌గా గుర్తించు', indianLangs: 'భారతీయ భాషలు', otherLangs: 'ఇతర భాషలు',
    nav_watch: 'చూడండి', nav_read: 'చదవండి', nav_words: 'నా పదాలు', nav_review: 'పునశ్చరణ', nav_scripts: 'లిపులు', nav_phrases: 'వాక్యాలు',
    homeH: 'మీరు చూసే, చదివే వాటి నుంచే మాట్లాడే భాషలు నేర్చుకోండి', homeSub: 'మీ సొంత వీడియో, ఆడియో లేదా టెక్స్ట్ తీసుకురండి. ఏ పదాన్నైనా తాకి వినండి, ఇంగ్లీష్ అక్షరాల్లో ఉచ్చారణ చూడండి, సేవ్ చేయండి. విరామ పునరావృతంతో గుర్తుంచుకోండి. ఉచితం, ప్రైవేట్, ఆఫ్‌లైన్‌లో పనిచేస్తుంది.', statWords: 'సేవ్ చేసిన పదాలు', statDue: 'ఈ రోజు', statStreak: 'వరుస రోజులు',
    cWatch: 'మీ వీడియో లేదా ఆడియోను రెండు సబ్‌టైటిల్ లైన్లతో ప్లే చేయండి. పదాలను తాకండి, లైన్‌ను మళ్లీ వినండి, వేగం తగ్గించండి, వక్తను అనుకరించండి.', cRead: 'ఏ టెక్స్ట్‌నైనా పేస్ట్ చేయండి లేదా తెరవండి. ప్రతి పదం తాకవచ్చు, రోమన్ ఉచ్చారణ, చదివి వినిపించడంతో.', cWords: 'మీరు సేవ్ చేసినవన్నీ, CSV, Anki, బ్యాకప్ ఫైల్‌కు ఎగుమతితో.', cReview: 'మరచిపోయే ముందే తిరిగి వచ్చే ఫ్లాష్‌కార్డులు.', cScripts: 'అక్షరాలు, గుణింతాలు, అంకెలు. వినండి, క్విజ్ చేయండి, రాసి చూడండి.', cPhrases: 'తెలుగు, హిందీ, కన్నడ, తమిళం, మలయాళంలో రోజువారీ వాక్యాలు.', dueCount: '{n} మిగిలాయి',
    howH: 'ఇది ఎలా పనిచేస్తుంది', how1: 'మీ వీడియోతో పాటు సబ్‌టైటిల్ ఫైల్ తెరవండి, లేదా టెక్స్ట్ పేస్ట్ చేయండి.', how2: 'తెలియని పదాన్ని తాకండి. వినండి, అర్థంతో సేవ్ చేయండి.', how3: 'పునశ్చరణకు రండి. కార్డులు సరైన సమయానికి వస్తాయి.', how4: 'అంతా ఈ పరికరంలోనే ఉంటుంది. ఎప్పుడైనా ఎగుమతి చేయండి.', homeNote: 'స్వరాలు మీ పరికరం నుంచి వస్తాయి. భారతీయ భాషల స్వరాలు ఫోన్, బ్రౌజర్‌ను బట్టి మారుతాయి. వినిపించకపోతే సిస్టమ్ సెట్టింగ్స్‌లో ఒకటి ఇన్‌స్టాల్ చేయండి.',
    noTts: 'ఈ బ్రౌజర్ టెక్స్ట్‌ను చదివి వినిపించలేదు.', noVoice: 'ఈ పరికరంలో {l} స్వరం లేదు. సిస్టమ్ సెట్టింగ్స్‌లో ఇన్‌స్టాల్ చేయండి.', storageFull: 'సేవ్ కాలేదు. బ్రౌజర్ నిల్వ నిండింది లేదా నిరోధించబడింది.', meaning: 'అర్థం', status: 'స్థితి', st0: 'కొత్త', st1: 'నేర్చుకుంటున్నా', st2: 'తెలుసు', seenIn: 'వాక్యాల జాబితాలో కూడా', speak: 'చదువు', close: 'మూసివేయి', update: 'అప్‌డేట్', save: 'పదం సేవ్ చేయి', saved: 'సేవ్ అయింది', remove: 'తొలగించు', speakSentence: 'వాక్యం చదువు', translateDevice: 'పరికరంలో అనువదించు', trFail: 'అనువాదం అందుబాటులో లేదు.', lookup: 'వెతకండి', opensTab: 'కొత్త ట్యాబ్ తెరుచుకుంటుంది', wordDetails: 'పదం వివరాలు',
    rdLede: 'టెక్స్ట్ పేస్ట్ చేయండి లేదా తెరవండి. ఏ పదాన్నైనా తాకండి.', rdPlaceholder: 'ఏ భాషలోనైనా టెక్స్ట్ ఇక్కడ పేస్ట్ చేయండి', rdText: 'చదివే టెక్స్ట్', rdEmpty: 'ఇంకా చూపడానికి ఏమీ లేదు. టెక్స్ట్ పేస్ట్ చేయండి లేదా నమూనా లోడ్ చేయండి.', rdStats: '{n} పదాలు, {u} వేరువేరు. {k} తెలుసు, {l} నేర్చుకుంటున్నా. భాష: {lang}', textLang: 'టెక్స్ట్ భాష', colorWords: 'స్థితిని బట్టి పదాలకు రంగు', fontSize: 'అక్షరాల పరిమాణం', readAloud: 'చదివి వినిపించు', stop: 'ఆపు', sample: 'నమూనా లోడ్ చేయి', importTxt: 'టెక్స్ట్ ఫైల్ తెరువు', clear: 'తొలగించు', clickWord: 'వివరాల కోసం పదాన్ని తాకండి',
    wtLede: 'మీ సొంత వీడియో లేదా ఆడియోను సబ్‌టైటిల్ ఫైల్‌తో వాడండి. ఏదీ అప్‌లోడ్ కాదు.', wtSetup: 'మీ ఫైళ్లను ఎంచుకోండి', wtDrop: 'వీడియో లేదా ఆడియో, సబ్‌టైటిల్ ఫైళ్లను ఇక్కడ వదలండి, లేదా బటన్లు వాడండి.', wtMedia: 'వీడియో లేదా ఆడియో', wtSub1: 'సబ్‌టైటిల్స్ (నేర్చుకునే భాష)', wtSub2: 'సబ్‌టైటిల్స్ (మీ భాష)', subLang: 'సబ్‌టైటిల్ భాష', wtStart: 'ప్రారంభించు', wtSample: 'నమూనా చూడండి (చదివి వినిపిస్తుంది)', noSubs: '{f} లో సబ్‌టైటిల్స్ కనబడలేదు. .srt లేదా .vtt వాడండి.', wtPrivacy: 'ఫైళ్లు మీ బ్రౌజర్‌లోనే తెరుచుకుంటాయి, పరికరం దాటి వెళ్లవు. వీడియో లేదా ఆడియో లేకపోతే లైన్లను మీ పరికరం స్వరం చదివి వినిపిస్తుంది.', wtListenMode: 'వినే మోడ్: లైన్లు చదివి వినిపిస్తాయి', wtTranscript: 'లిఖిత పాఠం', playPause: 'ప్లే లేదా ఆపు', prevLine: 'ముందు లైన్', nextLine: 'తర్వాతి లైన్', replay: 'లైన్ మళ్లీ', loopLine: 'లైన్ పునరావృతం', autoPause: 'ప్రతి లైన్ తర్వాత ఆగు', hideTarget: 'నేర్చుకునే భాష సబ్‌టైటిల్ దాచు', hideNative: 'నా భాష సబ్‌టైటిల్ దాచు', blurNative: 'నా భాషను మసక చేయి', speed: 'వేగం', subEarlier: 'సబ్‌టైటిల్స్ ముందుగా', subLater: 'సబ్‌టైటిల్స్ ఆలస్యంగా', shadow: 'అనుకరించు', stopRec: 'ఆపు', yourVoice: 'మీ స్వరం', orig: 'అసలు', noMic: 'ఇక్కడ రికార్డింగ్‌కు మద్దతు లేదు.', micDenied: 'మైక్రోఫోన్ అనుమతి ఇవ్వలేదు.', wtChange: 'ఫైళ్లు మార్చు', wtKeys: 'కీలు: Space ప్లే/ఆపు, A/D లేదా బాణాలు ముందు/తర్వాత, R మళ్లీ, L పునరావృతం, P ప్రతి లైన్ తర్వాత ఆగు.',
    wdLede: 'మీరు సేవ్ చేసిన పదాలు. ఈ బ్రౌజర్‌లో మాత్రమే నిల్వ అవుతాయి.', wdCount: '{n} చూపుతున్నాం, {d} ఇప్పుడు మిగిలాయి', wdNoMatch: 'సరిపోయే పదాలు లేవు.', wdEmpty: 'ఇంకా పదాలు సేవ్ చేయలేదు.', wdEmptySub: 'చదవండి లేదా చూడండి తెరిచి పదాన్ని తాకి సేవ్ చేయండి.', wdMore: 'ఇంకా {n} చూపలేదు. శోధన వాడండి.', wdNothing: 'ఎగుమతి చేయడానికి ఏమీ లేదు.', wdImported: '{n} కొత్త పదాలు దిగుమతి అయ్యాయి.', wdImportFail: 'ఆ ఫైల్ చదవలేకపోయాం.', wdPrivacy: 'బ్రౌజర్ డేటా తొలగిస్తే జాబితా పోతుంది, కాబట్టి అప్పుడప్పుడు బ్యాకప్ ఎగుమతి చేయండి.', search: 'శోధన', edit: 'మార్చు', dueNow: 'ఇప్పుడే', dueToday: 'ఈ రోజు', dueIn: '{n} రోజుల్లో', backup: 'బ్యాకప్', importWords: 'దిగుమతి',
    rvLede: 'కార్డు తిప్పండి, ఎంత గుర్తుందో చెప్పండి.', rvMode: 'సాధన విధానం', rvW2M: 'పదం నుంచి అర్థం', rvM2W: 'అర్థం నుంచి పదం', rvListen: 'వినడం', rvCloze: 'ఖాళీ నింపండి', rvStreak: 'వరుస రోజులు: {n}', rvDone: 'పూర్తి: {n} కార్డులు', rvDoneSub: 'తర్వాత రండి. మిస్సైన కార్డులు నిమిషాల్లో, మిగతావి రోజుల్లో వస్తాయి.', rvNone: 'ఏదీ మిగల్లేదు', rvNoneSub: 'మీరు ముందున్నారు. కొత్త పదాల కోసం మరింత చదవండి లేదా చూడండి.', rvWhichWord: 'ఈ పదం ఏమిటి?', rvPlay: 'పదం వినండి', rvListenQ: 'విని, అర్థం గుర్తు చేసుకోండి', rvHint: 'అర్థం', rvShow: 'జవాబు చూపు', rvProgress: 'సెషన్ పురోగతి', again: 'మళ్లీ', hard: 'కష్టం', good: 'బాగుంది', easy: 'సులభం',
    scLede: 'అక్షరాలు నేర్చుకోండి. ఏ అక్షరాన్నైనా తాకి వినండి, రాసి చూడండి.', scVowels: 'అచ్చులు', scCons: 'హల్లులు', scSigns: 'గుణింతాలు', scSignsNote: '{b} అక్షరంపై చూపబడ్డాయి', scDigits: 'అంకెలు', scQuiz: 'చిన్న క్విజ్', scQuizQ: 'ఈ అక్షరాన్ని ఎలా చదువుతారు?', scTrace: 'రాసి చూడండి', scTraceHint: 'పైన ఒక అక్షరాన్ని తాకి, ఇక్కడ రాయండి.', correct: 'సరైనది!', wrongIs: 'కాదు. ఇది {a}.', next: 'తర్వాత',
    phLede: 'రోజువారీ వాక్యాలు. ఏ పదాన్నైనా తాకి సేవ్ చేయండి.', phNote: 'ఈ వాక్యాలు ప్రారంభ సెట్. నమ్మే ముందు మాతృభాష వారితో సరిచూడండి.', cat_greet: 'పలకరింపులు', cat_intro: 'పరిచయం', cat_daily: 'రోజువారీ', cat_num: 'సంఖ్యలు', slow: 'నెమ్మదిగా'
  };
  I.kn = {
    skip: 'ವಿಷಯಕ್ಕೆ ಹೋಗಿ', settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', part: 'EknathaLabs ನ ಭಾಗ', privacyNote: 'ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲೇ ಕೆಲಸ ಮಾಡುತ್ತದೆ. ನಿಮ್ಮ ಫೈಲ್‌ಗಳು ಮತ್ತು ಪದಗಳು ನಿಮ್ಮ ಸಾಧನದಲ್ಲೇ ಇರುತ್ತವೆ.', mainNav: 'ಮುಖ್ಯ', uiLang: 'ಇಂಟರ್‌ಫೇಸ್ ಭಾಷೆ', focusLang: 'ನಾನು ಕಲಿಯುತ್ತಿರುವ ಭಾಷೆ', scheme: 'ರೋಮನ್ ಶೈಲಿ', schSimple: 'ಸರಳ', schIast: 'ಪಾಂಡಿತ್ಯ', showRoman: 'ರೋಮನ್ ಉಚ್ಚಾರಣೆ ತೋರಿಸಿ', on: 'ಆನ್', off: 'ಆಫ್', voiceSpeed: 'ಧ್ವನಿ ವೇಗ', perDay: 'ಒಂದು ಅಧಿವೇಶನದಲ್ಲಿ ಪುನರಾವರ್ತನೆ', unlimited: 'ಮಿತಿ ಇಲ್ಲ', theme: 'ಥೀಮ್', light: 'ಲೈಟ್', dark: 'ಡಾರ್ಕ್', 'new': 'ಹೊಸ', language: 'ಭಾಷೆ', allLangs: 'ಎಲ್ಲಾ ಭಾಷೆಗಳು', allStatus: 'ಎಲ್ಲಾ', auto: 'ತಾನಾಗಿ ಗುರುತಿಸಿ', indianLangs: 'ಭಾರತೀಯ ಭಾಷೆಗಳು', otherLangs: 'ಇತರ ಭಾಷೆಗಳು',
    nav_watch: 'ನೋಡಿ', nav_read: 'ಓದಿ', nav_words: 'ನನ್ನ ಪದಗಳು', nav_review: 'ಪುನರಾವರ್ತನೆ', nav_scripts: 'ಲಿಪಿಗಳು', nav_phrases: 'ವಾಕ್ಯಗಳು',
    homeH: 'ನೀವು ನೋಡುವ, ಓದುವುದರಿಂದಲೇ ಮಾತನಾಡುವ ಭಾಷೆಗಳನ್ನು ಕಲಿಯಿರಿ', homeSub: 'ನಿಮ್ಮ ಸ್ವಂತ ವೀಡಿಯೊ, ಆಡಿಯೊ ಅಥವಾ ಪಠ್ಯ ತನ್ನಿ. ಯಾವ ಪದವನ್ನಾದರೂ ಒತ್ತಿ ಕೇಳಿ, ಇಂಗ್ಲಿಷ್ ಅಕ್ಷರಗಳಲ್ಲಿ ಉಚ್ಚಾರಣೆ ನೋಡಿ, ಉಳಿಸಿ. ಅಂತರದ ಪುನರಾವರ್ತನೆಯಿಂದ ನೆನಪಿಡಿ. ಉಚಿತ, ಖಾಸಗಿ, ಆಫ್‌ಲೈನ್‌ನಲ್ಲೂ ಕೆಲಸ ಮಾಡುತ್ತದೆ.', statWords: 'ಉಳಿಸಿದ ಪದಗಳು', statDue: 'ಇಂದಿಗೆ', statStreak: 'ಸತತ ದಿನಗಳು',
    cWatch: 'ನಿಮ್ಮ ವೀಡಿಯೊ ಅಥವಾ ಆಡಿಯೊವನ್ನು ಎರಡು ಉಪಶೀರ್ಷಿಕೆ ಸಾಲುಗಳೊಂದಿಗೆ ಪ್ಲೇ ಮಾಡಿ. ಪದಗಳನ್ನು ಒತ್ತಿ, ಸಾಲನ್ನು ಮತ್ತೆ ಕೇಳಿ, ವೇಗ ಕಡಿಮೆ ಮಾಡಿ, ಮಾತನಾಡುವವರನ್ನು ಅನುಕರಿಸಿ.', cRead: 'ಯಾವುದೇ ಪಠ್ಯವನ್ನು ಅಂಟಿಸಿ ಅಥವಾ ತೆರೆಯಿರಿ. ಪ್ರತಿ ಪದವನ್ನೂ ಒತ್ತಬಹುದು, ರೋಮನ್ ಉಚ್ಚಾರಣೆ ಮತ್ತು ಓದಿ ಹೇಳುವುದರೊಂದಿಗೆ.', cWords: 'ನೀವು ಉಳಿಸಿದ್ದೆಲ್ಲವೂ, CSV, Anki ಮತ್ತು ಬ್ಯಾಕಪ್ ಫೈಲ್‌ಗೆ ರಫ್ತು ಸಹಿತ.', cReview: 'ಮರೆಯುವ ಮೊದಲೇ ಮರಳಿ ಬರುವ ಫ್ಲ್ಯಾಶ್‌ಕಾರ್ಡ್‌ಗಳು.', cScripts: 'ಅಕ್ಷರಗಳು, ಸ್ವರ ಚಿಹ್ನೆಗಳು, ಅಂಕೆಗಳು. ಕೇಳಿ, ರಸಪ್ರಶ್ನೆ ಆಡಿ, ಬರೆದು ಅಭ್ಯಾಸ ಮಾಡಿ.', cPhrases: 'ತೆಲುಗು, ಹಿಂದಿ, ಕನ್ನಡ, ತಮಿಳು, ಮಲಯಾಳಂನ ದಿನನಿತ್ಯದ ವಾಕ್ಯಗಳು.', dueCount: '{n} ಬಾಕಿ',
    howH: 'ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ', how1: 'ನಿಮ್ಮ ವೀಡಿಯೊದೊಂದಿಗೆ ಉಪಶೀರ್ಷಿಕೆ ಫೈಲ್ ತೆರೆಯಿರಿ, ಅಥವಾ ಪಠ್ಯ ಅಂಟಿಸಿ.', how2: 'ಗೊತ್ತಿಲ್ಲದ ಪದವನ್ನು ಒತ್ತಿ. ಕೇಳಿ, ಅರ್ಥದೊಂದಿಗೆ ಉಳಿಸಿ.', how3: 'ಪುನರಾವರ್ತನೆಗೆ ಬನ್ನಿ. ಕಾರ್ಡ್‌ಗಳು ಸರಿಯಾದ ಸಮಯಕ್ಕೆ ಬರುತ್ತವೆ.', how4: 'ಎಲ್ಲವೂ ಈ ಸಾಧನದಲ್ಲೇ ಇರುತ್ತದೆ. ಯಾವಾಗ ಬೇಕಾದರೂ ರಫ್ತು ಮಾಡಿ.', homeNote: 'ಧ್ವನಿಗಳು ನಿಮ್ಮ ಸಾಧನದಿಂದ ಬರುತ್ತವೆ. ಭಾರತೀಯ ಭಾಷೆಗಳ ಧ್ವನಿಗಳು ಫೋನ್ ಮತ್ತು ಬ್ರೌಸರ್ ಪ್ರಕಾರ ಬೇರೆಯಾಗುತ್ತವೆ. ಕೇಳಿಸದಿದ್ದರೆ ಸಿಸ್ಟಮ್ ಸೆಟ್ಟಿಂಗ್‌ನಲ್ಲಿ ಒಂದನ್ನು ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ.',
    noTts: 'ಈ ಬ್ರೌಸರ್ ಪಠ್ಯವನ್ನು ಓದಿ ಹೇಳಲು ಸಾಧ್ಯವಿಲ್ಲ.', noVoice: 'ಈ ಸಾಧನದಲ್ಲಿ {l} ಧ್ವನಿ ಇಲ್ಲ. ಸಿಸ್ಟಮ್ ಸೆಟ್ಟಿಂಗ್‌ನಲ್ಲಿ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ.', storageFull: 'ಉಳಿಸಲಾಗಲಿಲ್ಲ. ಬ್ರೌಸರ್ ಸಂಗ್ರಹ ತುಂಬಿದೆ ಅಥವಾ ನಿರ್ಬಂಧಿತವಾಗಿದೆ.', meaning: 'ಅರ್ಥ', status: 'ಸ್ಥಿತಿ', st0: 'ಹೊಸ', st1: 'ಕಲಿಯುತ್ತಿದ್ದೇನೆ', st2: 'ಗೊತ್ತು', seenIn: 'ವಾಕ್ಯಗಳ ಪಟ್ಟಿಯಲ್ಲೂ ಇದೆ', speak: 'ಹೇಳು', close: 'ಮುಚ್ಚಿ', update: 'ನವೀಕರಿಸಿ', save: 'ಪದ ಉಳಿಸಿ', saved: 'ಉಳಿಸಲಾಗಿದೆ', remove: 'ತೆಗೆದುಹಾಕಿ', speakSentence: 'ವಾಕ್ಯ ಓದಿ', translateDevice: 'ಸಾಧನದಲ್ಲೇ ಅನುವಾದಿಸಿ', trFail: 'ಅನುವಾದ ಲಭ್ಯವಿಲ್ಲ.', lookup: 'ಹುಡುಕಿ', opensTab: 'ಹೊಸ ಟ್ಯಾಬ್ ತೆರೆಯುತ್ತದೆ', wordDetails: 'ಪದದ ವಿವರ',
    rdLede: 'ಪಠ್ಯ ಅಂಟಿಸಿ ಅಥವಾ ತೆರೆಯಿರಿ. ಯಾವ ಪದವನ್ನಾದರೂ ಒತ್ತಿ.', rdPlaceholder: 'ಯಾವುದೇ ಭಾಷೆಯ ಪಠ್ಯವನ್ನು ಇಲ್ಲಿ ಅಂಟಿಸಿ', rdText: 'ಓದುವ ಪಠ್ಯ', rdEmpty: 'ಇನ್ನೂ ತೋರಿಸಲು ಏನೂ ಇಲ್ಲ. ಪಠ್ಯ ಅಂಟಿಸಿ ಅಥವಾ ಮಾದರಿ ಲೋಡ್ ಮಾಡಿ.', rdStats: '{n} ಪದಗಳು, {u} ವಿಭಿನ್ನ. {k} ಗೊತ್ತು, {l} ಕಲಿಯುತ್ತಿದ್ದೇನೆ. ಭಾಷೆ: {lang}', textLang: 'ಪಠ್ಯದ ಭಾಷೆ', colorWords: 'ಸ್ಥಿತಿಯ ಪ್ರಕಾರ ಪದಗಳಿಗೆ ಬಣ್ಣ', fontSize: 'ಅಕ್ಷರ ಗಾತ್ರ', readAloud: 'ಓದಿ ಹೇಳಿ', stop: 'ನಿಲ್ಲಿಸಿ', sample: 'ಮಾದರಿ ಲೋಡ್ ಮಾಡಿ', importTxt: 'ಪಠ್ಯ ಫೈಲ್ ತೆರೆಯಿರಿ', clear: 'ಅಳಿಸಿ', clickWord: 'ವಿವರಕ್ಕಾಗಿ ಪದವನ್ನು ಒತ್ತಿ',
    wtLede: 'ನಿಮ್ಮ ಸ್ವಂತ ವೀಡಿಯೊ ಅಥವಾ ಆಡಿಯೊವನ್ನು ಉಪಶೀರ್ಷಿಕೆ ಫೈಲ್‌ನೊಂದಿಗೆ ಬಳಸಿ. ಏನೂ ಅಪ್‌ಲೋಡ್ ಆಗುವುದಿಲ್ಲ.', wtSetup: 'ನಿಮ್ಮ ಫೈಲ್‌ಗಳನ್ನು ಆರಿಸಿ', wtDrop: 'ವೀಡಿಯೊ ಅಥವಾ ಆಡಿಯೊ ಮತ್ತು ಉಪಶೀರ್ಷಿಕೆ ಫೈಲ್‌ಗಳನ್ನು ಇಲ್ಲಿ ಬಿಡಿ, ಅಥವಾ ಬಟನ್‌ಗಳನ್ನು ಬಳಸಿ.', wtMedia: 'ವೀಡಿಯೊ ಅಥವಾ ಆಡಿಯೊ', wtSub1: 'ಉಪಶೀರ್ಷಿಕೆ (ಕಲಿಯುವ ಭಾಷೆ)', wtSub2: 'ಉಪಶೀರ್ಷಿಕೆ (ನಿಮ್ಮ ಭಾಷೆ)', subLang: 'ಉಪಶೀರ್ಷಿಕೆ ಭಾಷೆ', wtStart: 'ಪ್ರಾರಂಭಿಸಿ', wtSample: 'ಮಾದರಿ ಪ್ರಯತ್ನಿಸಿ (ಓದಿ ಹೇಳುತ್ತದೆ)', noSubs: '{f} ನಲ್ಲಿ ಉಪಶೀರ್ಷಿಕೆ ಸಿಗಲಿಲ್ಲ. .srt ಅಥವಾ .vtt ಬಳಸಿ.', wtPrivacy: 'ಫೈಲ್‌ಗಳು ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲೇ ತೆರೆಯುತ್ತವೆ, ಸಾಧನ ಬಿಟ್ಟು ಹೋಗುವುದಿಲ್ಲ. ವೀಡಿಯೊ ಅಥವಾ ಆಡಿಯೊ ಇಲ್ಲದಿದ್ದರೆ ಸಾಲುಗಳನ್ನು ನಿಮ್ಮ ಸಾಧನದ ಧ್ವನಿ ಓದಿ ಹೇಳುತ್ತದೆ.', wtListenMode: 'ಕೇಳುವ ಮೋಡ್: ಸಾಲುಗಳನ್ನು ಓದಿ ಹೇಳಲಾಗುತ್ತದೆ', wtTranscript: 'ಲಿಖಿತ ಪಠ್ಯ', playPause: 'ಪ್ಲೇ ಅಥವಾ ವಿರಾಮ', prevLine: 'ಹಿಂದಿನ ಸಾಲು', nextLine: 'ಮುಂದಿನ ಸಾಲು', replay: 'ಸಾಲು ಮತ್ತೆ', loopLine: 'ಸಾಲು ಪುನರಾವರ್ತಿಸಿ', autoPause: 'ಪ್ರತಿ ಸಾಲಿನ ನಂತರ ನಿಲ್ಲಿಸಿ', hideTarget: 'ಕಲಿಯುವ ಭಾಷೆಯ ಉಪಶೀರ್ಷಿಕೆ ಮರೆಮಾಡಿ', hideNative: 'ನನ್ನ ಭಾಷೆಯ ಉಪಶೀರ್ಷಿಕೆ ಮರೆಮಾಡಿ', blurNative: 'ನನ್ನ ಭಾಷೆ ಮಸುಕು', speed: 'ವೇಗ', subEarlier: 'ಉಪಶೀರ್ಷಿಕೆ ಬೇಗ', subLater: 'ಉಪಶೀರ್ಷಿಕೆ ತಡವಾಗಿ', shadow: 'ಅನುಕರಿಸಿ', stopRec: 'ನಿಲ್ಲಿಸಿ', yourVoice: 'ನಿಮ್ಮ ಧ್ವನಿ', orig: 'ಮೂಲ', noMic: 'ಇಲ್ಲಿ ರೆಕಾರ್ಡಿಂಗ್ ಬೆಂಬಲಿತವಲ್ಲ.', micDenied: 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ.', wtChange: 'ಫೈಲ್‌ಗಳನ್ನು ಬದಲಿಸಿ', wtKeys: 'ಕೀಗಳು: Space ಪ್ಲೇ/ವಿರಾಮ, A/D ಅಥವಾ ಬಾಣಗಳು ಹಿಂದೆ/ಮುಂದೆ, R ಮತ್ತೆ, L ಪುನರಾವರ್ತನೆ, P ಪ್ರತಿ ಸಾಲಿನ ನಂತರ ನಿಲ್ಲಿಸಿ.',
    wdLede: 'ನೀವು ಉಳಿಸಿದ ಪದಗಳು. ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮಾತ್ರ ಸಂಗ್ರಹವಾಗುತ್ತವೆ.', wdCount: '{n} ತೋರಿಸಲಾಗಿದೆ, {d} ಈಗ ಬಾಕಿ', wdNoMatch: 'ಹೊಂದುವ ಪದಗಳಿಲ್ಲ.', wdEmpty: 'ಇನ್ನೂ ಪದಗಳನ್ನು ಉಳಿಸಿಲ್ಲ.', wdEmptySub: 'ಓದಿ ಅಥವಾ ನೋಡಿ ತೆರೆದು ಪದವನ್ನು ಒತ್ತಿ ಉಳಿಸಿ.', wdMore: 'ಇನ್ನೂ {n} ತೋರಿಸಿಲ್ಲ. ಹುಡುಕಾಟ ಬಳಸಿ.', wdNothing: 'ರಫ್ತು ಮಾಡಲು ಏನೂ ಇಲ್ಲ.', wdImported: '{n} ಹೊಸ ಪದಗಳು ಆಮದಾದವು.', wdImportFail: 'ಆ ಫೈಲ್ ಓದಲಾಗಲಿಲ್ಲ.', wdPrivacy: 'ಬ್ರೌಸರ್ ಡೇಟಾ ಅಳಿಸಿದರೆ ಪಟ್ಟಿ ಹೋಗುತ್ತದೆ, ಆದ್ದರಿಂದ ಆಗಾಗ ಬ್ಯಾಕಪ್ ರಫ್ತು ಮಾಡಿ.', search: 'ಹುಡುಕಿ', edit: 'ಬದಲಿಸಿ', dueNow: 'ಈಗಲೇ', dueToday: 'ಇಂದು', dueIn: '{n} ದಿನದಲ್ಲಿ', backup: 'ಬ್ಯಾಕಪ್', importWords: 'ಆಮದು',
    rvLede: 'ಕಾರ್ಡ್ ತಿರುಗಿಸಿ, ಎಷ್ಟು ನೆನಪಿತ್ತು ಎಂದು ಹೇಳಿ.', rvMode: 'ಅಭ್ಯಾಸ ವಿಧಾನ', rvW2M: 'ಪದದಿಂದ ಅರ್ಥ', rvM2W: 'ಅರ್ಥದಿಂದ ಪದ', rvListen: 'ಆಲಿಸುವುದು', rvCloze: 'ಖಾಲಿ ತುಂಬಿ', rvStreak: 'ಸತತ ದಿನಗಳು: {n}', rvDone: 'ಮುಗಿದಿದೆ: {n} ಕಾರ್ಡ್‌ಗಳು', rvDoneSub: 'ನಂತರ ಬನ್ನಿ. ತಪ್ಪಿದ ಕಾರ್ಡ್‌ಗಳು ನಿಮಿಷಗಳಲ್ಲಿ, ಉಳಿದವು ದಿನಗಳಲ್ಲಿ ಬರುತ್ತವೆ.', rvNone: 'ಏನೂ ಬಾಕಿ ಇಲ್ಲ', rvNoneSub: 'ನೀವು ಮುಂದಿದ್ದೀರಿ. ಹೊಸ ಪದಗಳಿಗಾಗಿ ಇನ್ನಷ್ಟು ಓದಿ ಅಥವಾ ನೋಡಿ.', rvWhichWord: 'ಈ ಪದ ಯಾವುದು?', rvPlay: 'ಪದ ಕೇಳಿ', rvListenQ: 'ಕೇಳಿ, ಅರ್ಥ ನೆನಪಿಸಿಕೊಳ್ಳಿ', rvHint: 'ಅರ್ಥ', rvShow: 'ಉತ್ತರ ತೋರಿಸಿ', rvProgress: 'ಅಧಿವೇಶನ ಪ್ರಗತಿ', again: 'ಮತ್ತೆ', hard: 'ಕಷ್ಟ', good: 'ಚೆನ್ನಾಗಿದೆ', easy: 'ಸುಲಭ',
    scLede: 'ಅಕ್ಷರಗಳನ್ನು ಕಲಿಯಿರಿ. ಯಾವ ಅಕ್ಷರವನ್ನಾದರೂ ಒತ್ತಿ ಕೇಳಿ, ಬರೆದು ಅಭ್ಯಾಸ ಮಾಡಿ.', scVowels: 'ಸ್ವರಗಳು', scCons: 'ವ್ಯಂಜನಗಳು', scSigns: 'ಸ್ವರ ಚಿಹ್ನೆಗಳು', scSignsNote: 'ಅಕ್ಷರ {b} ಮೇಲೆ ತೋರಿಸಲಾಗಿದೆ', scDigits: 'ಅಂಕೆಗಳು', scQuiz: 'ಸಣ್ಣ ರಸಪ್ರಶ್ನೆ', scQuizQ: 'ಈ ಅಕ್ಷರವನ್ನು ಹೇಗೆ ಓದುತ್ತೀರಿ?', scTrace: 'ಬರೆದು ನೋಡಿ', scTraceHint: 'ಮೇಲೆ ಒಂದು ಅಕ್ಷರವನ್ನು ಒತ್ತಿ, ಇಲ್ಲಿ ಬರೆಯಿರಿ.', correct: 'ಸರಿ!', wrongIs: 'ಅಲ್ಲ. ಇದು {a}.', next: 'ಮುಂದೆ',
    phLede: 'ದಿನನಿತ್ಯದ ವಾಕ್ಯಗಳು. ಯಾವ ಪದವನ್ನಾದರೂ ಒತ್ತಿ ಉಳಿಸಿ.', phNote: 'ಈ ವಾಕ್ಯಗಳು ಆರಂಭಿಕ ಸೆಟ್. ನಂಬುವ ಮೊದಲು ಮಾತೃಭಾಷಿಕರಿಂದ ಪರಿಶೀಲಿಸಿ.', cat_greet: 'ಶುಭಾಶಯಗಳು', cat_intro: 'ಪರಿಚಯ', cat_daily: 'ದಿನನಿತ್ಯ', cat_num: 'ಸಂಖ್ಯೆಗಳು', slow: 'ನಿಧಾನ'
  };
  I.ta = {
    skip: 'உள்ளடக்கத்துக்குச் செல்லவும்', settings: 'அமைப்புகள்', part: 'EknathaLabs இன் பகுதி', privacyNote: 'உங்கள் உலாவியிலேயே இயங்குகிறது. உங்கள் கோப்புகளும் சொற்களும் உங்கள் சாதனத்திலேயே இருக்கும்.', mainNav: 'முதன்மை', uiLang: 'இடைமுக மொழி', focusLang: 'நான் கற்கும் மொழி', scheme: 'ரோமன் பாணி', schSimple: 'எளிய', schIast: 'அறிஞர்', showRoman: 'ரோமன் உச்சரிப்பைக் காட்டு', on: 'இயக்கு', off: 'நிறுத்து', voiceSpeed: 'குரல் வேகம்', perDay: 'ஒரு அமர்வின் மீளாய்வுகள்', unlimited: 'வரம்பு இல்லை', theme: 'தீம்', light: 'ஒளி', dark: 'இருள்', 'new': 'புதிய', language: 'மொழி', allLangs: 'அனைத்து மொழிகள்', allStatus: 'அனைத்தும்', auto: 'தானாகக் கண்டறி', indianLangs: 'இந்திய மொழிகள்', otherLangs: 'பிற மொழிகள்',
    nav_watch: 'பார்', nav_read: 'படி', nav_words: 'என் சொற்கள்', nav_review: 'மீளாய்வு', nav_scripts: 'எழுத்துகள்', nav_phrases: 'சொற்றொடர்கள்',
    homeH: 'நீங்கள் பார்ப்பதிலும் படிப்பதிலும் இருந்தே பேசும் மொழிகளைக் கற்கலாம்', homeSub: 'உங்கள் சொந்த வீடியோ, ஆடியோ அல்லது உரையைக் கொண்டு வாருங்கள். எந்தச் சொல்லையும் தொட்டுக் கேளுங்கள், ஆங்கில எழுத்துகளில் உச்சரிப்பைப் பாருங்கள், சேமியுங்கள். இடைவெளி மீள்பயிற்சியால் நினைவில் வையுங்கள். இலவசம், தனிப்பட்டது, இணையமின்றியும் இயங்கும்.', statWords: 'சேமித்த சொற்கள்', statDue: 'இன்று', statStreak: 'தொடர் நாட்கள்',
    cWatch: 'உங்கள் வீடியோ அல்லது ஆடியோவை இரண்டு வசன வரிகளுடன் இயக்குங்கள். சொற்களைத் தொடுங்கள், வரியை மீண்டும் கேளுங்கள், வேகத்தைக் குறையுங்கள், பேசுபவரைப் பின்பற்றுங்கள்.', cRead: 'எந்த உரையையும் ஒட்டவும் அல்லது திறக்கவும். ஒவ்வொரு சொல்லும் தொடக்கூடியது, ரோமன் உச்சரிப்பு, வாசித்துக் காட்டுதலுடன்.', cWords: 'நீங்கள் சேமித்தவை அனைத்தும், CSV, Anki, காப்புக் கோப்பாக ஏற்றுமதியுடன்.', cReview: 'மறப்பதற்கு முன்பே திரும்பி வரும் ஃபிளாஷ் கார்டுகள்.', cScripts: 'எழுத்துகள், உயிர்மெய் குறிகள், எண்கள். கேளுங்கள், வினாடி வினா, எழுதிப் பழகுங்கள்.', cPhrases: 'தெலுங்கு, இந்தி, கன்னடம், தமிழ், மலையாளத்தில் அன்றாடச் சொற்றொடர்கள்.', dueCount: '{n} நிலுவை',
    howH: 'இது எப்படி வேலை செய்கிறது', how1: 'உங்கள் வீடியோவுடன் வசனக் கோப்பைத் திறக்கவும், அல்லது உரையை ஒட்டவும்.', how2: 'தெரியாத சொல்லைத் தொடுங்கள். கேட்டு, பொருளுடன் சேமியுங்கள்.', how3: 'மீளாய்வுக்கு வாருங்கள். அட்டைகள் சரியான நேரத்தில் திரும்பும்.', how4: 'எல்லாம் இந்தச் சாதனத்திலேயே இருக்கும். எப்போது வேண்டுமானாலும் ஏற்றுமதி செய்யலாம்.', homeNote: 'குரல்கள் உங்கள் சாதனத்திலிருந்து வருகின்றன. இந்திய மொழிக் குரல்கள் தொலைபேசி, உலாவிக்கு ஏற்ப மாறும். கேட்கவில்லையெனில் கணினி அமைப்புகளில் ஒன்றை நிறுவவும்.',
    noTts: 'இந்த உலாவி உரையை வாசித்துக் காட்ட முடியாது.', noVoice: 'இந்தச் சாதனத்தில் {l} குரல் இல்லை. கணினி அமைப்புகளில் நிறுவவும்.', storageFull: 'சேமிக்க முடியவில்லை. உலாவி சேமிப்பு நிரம்பியுள்ளது அல்லது தடுக்கப்பட்டுள்ளது.', meaning: 'பொருள்', status: 'நிலை', st0: 'புதியது', st1: 'கற்கிறேன்', st2: 'தெரியும்', seenIn: 'சொற்றொடர் பட்டியலிலும் உள்ளது', speak: 'சொல்', close: 'மூடு', update: 'புதுப்பி', save: 'சொல்லைச் சேமி', saved: 'சேமிக்கப்பட்டது', remove: 'நீக்கு', speakSentence: 'வாக்கியம் வாசி', translateDevice: 'சாதனத்தில் மொழிபெயர்', trFail: 'மொழிபெயர்ப்பு கிடைக்கவில்லை.', lookup: 'தேடு', opensTab: 'புதிய தாவல் திறக்கும்', wordDetails: 'சொல் விவரம்',
    rdLede: 'உரையை ஒட்டவும் அல்லது திறக்கவும். எந்தச் சொல்லையும் தொடுங்கள்.', rdPlaceholder: 'எந்த மொழியிலும் உரையை இங்கே ஒட்டவும்', rdText: 'படிக்கும் உரை', rdEmpty: 'காட்ட இன்னும் எதுவும் இல்லை. உரையை ஒட்டவும் அல்லது மாதிரியை ஏற்றவும்.', rdStats: '{n} சொற்கள், {u} வேறுபட்டவை. {k} தெரியும், {l} கற்கிறேன். மொழி: {lang}', textLang: 'உரை மொழி', colorWords: 'நிலைக்கு ஏற்ப சொற்களுக்கு நிறம்', fontSize: 'எழுத்து அளவு', readAloud: 'வாசித்துக் காட்டு', stop: 'நிறுத்து', sample: 'மாதிரியை ஏற்று', importTxt: 'உரைக் கோப்பைத் திற', clear: 'அழி', clickWord: 'விவரத்துக்குச் சொல்லைத் தொடுங்கள்',
    wtLede: 'உங்கள் சொந்த வீடியோ அல்லது ஆடியோவை வசனக் கோப்புடன் பயன்படுத்துங்கள். எதுவும் பதிவேற்றப்படாது.', wtSetup: 'உங்கள் கோப்புகளைத் தேர்ந்தெடுங்கள்', wtDrop: 'வீடியோ அல்லது ஆடியோ மற்றும் வசனக் கோப்புகளை இங்கே விடுங்கள், அல்லது பொத்தான்களைப் பயன்படுத்துங்கள்.', wtMedia: 'வீடியோ அல்லது ஆடியோ', wtSub1: 'வசனம் (கற்கும் மொழி)', wtSub2: 'வசனம் (உங்கள் மொழி)', subLang: 'வசன மொழி', wtStart: 'தொடங்கு', wtSample: 'மாதிரியை முயலுங்கள் (வாசித்துக் காட்டும்)', noSubs: '{f} இல் வசனங்கள் இல்லை. .srt அல்லது .vtt பயன்படுத்துங்கள்.', wtPrivacy: 'கோப்புகள் உங்கள் உலாவியிலேயே திறக்கப்படும், சாதனத்தை விட்டு வெளியே செல்லாது. வீடியோ அல்லது ஆடியோ இல்லையெனில் வரிகளை உங்கள் சாதனக் குரல் வாசிக்கும்.', wtListenMode: 'கேட்கும் முறை: வரிகள் வாசிக்கப்படும்', wtTranscript: 'எழுத்து வடிவம்', playPause: 'இயக்கு அல்லது இடைநிறுத்து', prevLine: 'முந்தைய வரி', nextLine: 'அடுத்த வரி', replay: 'வரியை மீண்டும்', loopLine: 'வரியைத் திரும்பத் திரும்ப', autoPause: 'ஒவ்வொரு வரிக்கும் பின் நிறுத்து', hideTarget: 'கற்கும் மொழி வசனத்தை மறை', hideNative: 'என் மொழி வசனத்தை மறை', blurNative: 'என் மொழியை மங்கலாக்கு', speed: 'வேகம்', subEarlier: 'வசனம் முன்னதாக', subLater: 'வசனம் தாமதமாக', shadow: 'பின்பற்று', stopRec: 'நிறுத்து', yourVoice: 'உங்கள் குரல்', orig: 'அசல்', noMic: 'இங்கே பதிவு ஆதரிக்கப்படவில்லை.', micDenied: 'ஒலிவாங்கி அனுமதி மறுக்கப்பட்டது.', wtChange: 'கோப்புகளை மாற்று', wtKeys: 'விசைகள்: Space இயக்கு/நிறுத்து, A/D அல்லது அம்புகள் முந்தைய/அடுத்த, R மீண்டும், L திரும்பத் திரும்ப, P ஒவ்வொரு வரிக்கும் பின் நிறுத்து.',
    wdLede: 'நீங்கள் சேமித்த சொற்கள். இந்த உலாவியில் மட்டுமே சேமிக்கப்படும்.', wdCount: '{n} காட்டப்படுகின்றன, {d} இப்போது நிலுவை', wdNoMatch: 'பொருந்தும் சொற்கள் இல்லை.', wdEmpty: 'இன்னும் சொற்கள் சேமிக்கப்படவில்லை.', wdEmptySub: 'படி அல்லது பார் பகுதியைத் திறந்து சொல்லைத் தொட்டுச் சேமியுங்கள்.', wdMore: 'மேலும் {n} காட்டப்படவில்லை. தேடலைப் பயன்படுத்துங்கள்.', wdNothing: 'ஏற்றுமதி செய்ய எதுவும் இல்லை.', wdImported: '{n} புதிய சொற்கள் இறக்குமதியாயின.', wdImportFail: 'அந்தக் கோப்பைப் படிக்க முடியவில்லை.', wdPrivacy: 'உலாவித் தரவை அழித்தால் பட்டியல் போய்விடும், எனவே அவ்வப்போது காப்புப் பிரதி எடுங்கள்.', search: 'தேடு', edit: 'திருத்து', dueNow: 'இப்போதே', dueToday: 'இன்று', dueIn: '{n} நாளில்', backup: 'காப்புப் பிரதி', importWords: 'இறக்குமதி',
    rvLede: 'அட்டையைத் திருப்புங்கள், எவ்வளவு நினைவிருந்தது என்று சொல்லுங்கள்.', rvMode: 'பயிற்சி முறை', rvW2M: 'சொல்லிலிருந்து பொருள்', rvM2W: 'பொருளிலிருந்து சொல்', rvListen: 'கேட்டல்', rvCloze: 'இடைவெளியை நிரப்புக', rvStreak: 'தொடர் நாட்கள்: {n}', rvDone: 'முடிந்தது: {n} அட்டைகள்', rvDoneSub: 'பின்னர் வாருங்கள். தவறியவை நிமிடங்களில், மற்றவை நாட்களில் திரும்பும்.', rvNone: 'எதுவும் நிலுவையில்லை', rvNoneSub: 'நீங்கள் முன்னிலையில் உள்ளீர்கள். புதிய சொற்களுக்கு மேலும் படியுங்கள் அல்லது பாருங்கள்.', rvWhichWord: 'இந்தச் சொல் எது?', rvPlay: 'சொல்லைக் கேள்', rvListenQ: 'கேட்டு, பொருளை நினைவுகூருங்கள்', rvHint: 'பொருள்', rvShow: 'விடையைக் காட்டு', rvProgress: 'அமர்வு முன்னேற்றம்', again: 'மீண்டும்', hard: 'கடினம்', good: 'நன்று', easy: 'எளிது',
    scLede: 'எழுத்துகளைக் கற்கலாம். எந்த எழுத்தையும் தொட்டுக் கேளுங்கள், எழுதிப் பழகுங்கள்.', scVowels: 'உயிரெழுத்துகள்', scCons: 'மெய்யெழுத்துகள்', scSigns: 'உயிர்மெய் குறிகள்', scSignsNote: '{b} எழுத்தின் மீது காட்டப்பட்டவை', scDigits: 'எண்கள்', scQuiz: 'சிறு வினாடி வினா', scQuizQ: 'இந்த எழுத்தை எப்படிப் படிப்பீர்கள்?', scTrace: 'எழுதிப் பாருங்கள்', scTraceHint: 'மேலே ஓர் எழுத்தைத் தொட்டு, இங்கே எழுதுங்கள்.', correct: 'சரி!', wrongIs: 'இல்லை. இது {a}.', next: 'அடுத்து',
    phLede: 'அன்றாடச் சொற்றொடர்கள். எந்தச் சொல்லையும் தொட்டுச் சேமியுங்கள்.', phNote: 'இந்தச் சொற்றொடர்கள் தொடக்கத் தொகுப்பு. நம்புவதற்கு முன் தாய்மொழிப் பேச்சாளரிடம் சரிபாருங்கள்.', cat_greet: 'வாழ்த்துகள்', cat_intro: 'அறிமுகம்', cat_daily: 'அன்றாடம்', cat_num: 'எண்கள்', slow: 'மெதுவாக'
  };
  I.ml = {
    skip: 'ഉള്ളടക്കത്തിലേക്ക് പോകുക', settings: 'ക്രമീകരണങ്ങൾ', part: 'EknathaLabs ന്റെ ഭാഗം', privacyNote: 'നിങ്ങളുടെ ബ്രൗസറിൽ തന്നെ പ്രവർത്തിക്കുന്നു. ഫയലുകളും വാക്കുകളും നിങ്ങളുടെ ഉപകരണത്തിൽ തന്നെ ഇരിക്കും.', mainNav: 'പ്രധാനം', uiLang: 'ഇന്റർഫേസ് ഭാഷ', focusLang: 'ഞാൻ പഠിക്കുന്ന ഭാഷ', scheme: 'റോമൻ ശൈലി', schSimple: 'ലളിതം', schIast: 'പാണ്ഡിത്യം', showRoman: 'റോമൻ ഉച്ചാരണം കാണിക്കുക', on: 'ഓൺ', off: 'ഓഫ്', voiceSpeed: 'ശബ്ദ വേഗത', perDay: 'ഒരു സെഷനിലെ പുനരവലോകനങ്ങൾ', unlimited: 'പരിധി ഇല്ല', theme: 'തീം', light: 'ലൈറ്റ്', dark: 'ഡാർക്ക്', 'new': 'പുതിയത്', language: 'ഭാഷ', allLangs: 'എല്ലാ ഭാഷകളും', allStatus: 'എല്ലാം', auto: 'സ്വയം കണ്ടെത്തുക', indianLangs: 'ഇന്ത്യൻ ഭാഷകൾ', otherLangs: 'മറ്റ് ഭാഷകൾ',
    nav_watch: 'കാണുക', nav_read: 'വായിക്കുക', nav_words: 'എന്റെ വാക്കുകൾ', nav_review: 'പുനരവലോകനം', nav_scripts: 'ലിപികൾ', nav_phrases: 'വാക്യങ്ങൾ',
    homeH: 'നിങ്ങൾ കാണുന്നതിലും വായിക്കുന്നതിലും നിന്ന് സംസാരഭാഷകൾ പഠിക്കൂ', homeSub: 'നിങ്ങളുടെ സ്വന്തം വീഡിയോ, ഓഡിയോ അല്ലെങ്കിൽ ടെക്സ്റ്റ് കൊണ്ടുവരൂ. ഏത് വാക്കിലും തൊട്ട് കേൾക്കൂ, ഇംഗ്ലീഷ് അക്ഷരങ്ങളിൽ ഉച്ചാരണം കാണൂ, സേവ് ചെയ്യൂ. ഇടവേളയിട്ടുള്ള ആവർത്തനത്തിലൂടെ ഓർമ്മിക്കൂ. സൗജന്യം, സ്വകാര്യം, ഓഫ്‌ലൈനിലും പ്രവർത്തിക്കും.', statWords: 'സേവ് ചെയ്ത വാക്കുകൾ', statDue: 'ഇന്ന്', statStreak: 'തുടർച്ചയായ ദിവസങ്ങൾ',
    cWatch: 'നിങ്ങളുടെ വീഡിയോയോ ഓഡിയോയോ രണ്ട് സബ്‌ടൈറ്റിൽ വരികളോടെ പ്ലേ ചെയ്യൂ. വാക്കുകളിൽ തൊടൂ, വരി ആവർത്തിക്കൂ, വേഗത കുറയ്ക്കൂ, സംസാരിക്കുന്നവരെ അനുകരിക്കൂ.', cRead: 'ഏത് ടെക്സ്റ്റും പേസ്റ്റ് ചെയ്യുക അല്ലെങ്കിൽ തുറക്കുക. ഓരോ വാക്കും തൊടാം, റോമൻ ഉച്ചാരണവും വായിച്ചുകേൾപ്പിക്കലും സഹിതം.', cWords: 'നിങ്ങൾ സേവ് ചെയ്തതെല്ലാം, CSV, Anki, ബാക്കപ്പ് ഫയൽ എന്നിവയിലേക്ക് എക്സ്പോർട്ട് സഹിതം.', cReview: 'മറക്കുന്നതിന് തൊട്ടുമുമ്പ് തിരികെ വരുന്ന ഫ്ലാഷ്‌കാർഡുകൾ.', cScripts: 'അക്ഷരങ്ങൾ, സ്വരചിഹ്നങ്ങൾ, അക്കങ്ങൾ. കേൾക്കൂ, ക്വിസ് ചെയ്യൂ, എഴുതി പഠിക്കൂ.', cPhrases: 'തെലുങ്ക്, ഹിന്ദി, കന്നഡ, തമിഴ്, മലയാളം ഭാഷകളിലെ ദൈനംദിന വാക്യങ്ങൾ.', dueCount: '{n} ബാക്കി',
    howH: 'ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു', how1: 'നിങ്ങളുടെ വീഡിയോയ്ക്കൊപ്പം സബ്‌ടൈറ്റിൽ ഫയൽ തുറക്കുക, അല്ലെങ്കിൽ ടെക്സ്റ്റ് പേസ്റ്റ് ചെയ്യുക.', how2: 'അറിയാത്ത വാക്കിൽ തൊടൂ. കേട്ട് അർത്ഥത്തോടൊപ്പം സേവ് ചെയ്യൂ.', how3: 'പുനരവലോകനത്തിലേക്ക് വരൂ. കാർഡുകൾ ശരിയായ സമയത്ത് തിരിച്ചെത്തും.', how4: 'എല്ലാം ഈ ഉപകരണത്തിൽ തന്നെ. എപ്പോൾ വേണമെങ്കിലും എക്സ്പോർട്ട് ചെയ്യാം.', homeNote: 'ശബ്ദങ്ങൾ നിങ്ങളുടെ ഉപകരണത്തിൽ നിന്നാണ്. ഇന്ത്യൻ ഭാഷാ ശബ്ദങ്ങൾ ഫോണും ബ്രൗസറും അനുസരിച്ച് മാറും. കേൾക്കുന്നില്ലെങ്കിൽ സിസ്റ്റം ക്രമീകരണത്തിൽ ഒന്ന് ഇൻസ്റ്റാൾ ചെയ്യുക.',
    noTts: 'ഈ ബ്രൗസറിന് ടെക്സ്റ്റ് വായിച്ചുകേൾപ്പിക്കാൻ കഴിയില്ല.', noVoice: 'ഈ ഉപകരണത്തിൽ {l} ശബ്ദം ഇല്ല. സിസ്റ്റം ക്രമീകരണത്തിൽ ഇൻസ്റ്റാൾ ചെയ്യുക.', storageFull: 'സേവ് ചെയ്യാനായില്ല. ബ്രൗസർ സംഭരണം നിറഞ്ഞതോ തടഞ്ഞതോ ആണ്.', meaning: 'അർത്ഥം', status: 'നില', st0: 'പുതിയത്', st1: 'പഠിക്കുന്നു', st2: 'അറിയാം', seenIn: 'വാക്യ പട്ടികയിലും ഉണ്ട്', speak: 'പറയുക', close: 'അടയ്ക്കുക', update: 'പുതുക്കുക', save: 'വാക്ക് സേവ് ചെയ്യുക', saved: 'സേവ് ചെയ്തു', remove: 'നീക്കം ചെയ്യുക', speakSentence: 'വാക്യം വായിക്കുക', translateDevice: 'ഉപകരണത്തിൽ വിവർത്തനം ചെയ്യുക', trFail: 'വിവർത്തനം ലഭ്യമല്ല.', lookup: 'തിരയുക', opensTab: 'പുതിയ ടാബ് തുറക്കും', wordDetails: 'വാക്കിന്റെ വിവരം',
    rdLede: 'ടെക്സ്റ്റ് പേസ്റ്റ് ചെയ്യുക അല്ലെങ്കിൽ തുറക്കുക. ഏത് വാക്കിലും തൊടുക.', rdPlaceholder: 'ഏത് ഭാഷയിലെയും ടെക്സ്റ്റ് ഇവിടെ പേസ്റ്റ് ചെയ്യുക', rdText: 'വായിക്കാനുള്ള ടെക്സ്റ്റ്', rdEmpty: 'കാണിക്കാൻ ഇതുവരെ ഒന്നുമില്ല. ടെക്സ്റ്റ് പേസ്റ്റ് ചെയ്യുക അല്ലെങ്കിൽ സാമ്പിൾ ലോഡ് ചെയ്യുക.', rdStats: '{n} വാക്കുകൾ, {u} വ്യത്യസ്തം. {k} അറിയാം, {l} പഠിക്കുന്നു. ഭാഷ: {lang}', textLang: 'ടെക്സ്റ്റ് ഭാഷ', colorWords: 'നില അനുസരിച്ച് വാക്കുകൾക്ക് നിറം', fontSize: 'അക്ഷര വലുപ്പം', readAloud: 'വായിച്ചുകേൾപ്പിക്കുക', stop: 'നിർത്തുക', sample: 'സാമ്പിൾ ലോഡ് ചെയ്യുക', importTxt: 'ടെക്സ്റ്റ് ഫയൽ തുറക്കുക', clear: 'മായ്ക്കുക', clickWord: 'വിവരങ്ങൾക്ക് വാക്കിൽ തൊടുക',
    wtLede: 'നിങ്ങളുടെ സ്വന്തം വീഡിയോയോ ഓഡിയോയോ സബ്‌ടൈറ്റിൽ ഫയലിനൊപ്പം ഉപയോഗിക്കൂ. ഒന്നും അപ്‌ലോഡ് ചെയ്യപ്പെടില്ല.', wtSetup: 'നിങ്ങളുടെ ഫയലുകൾ തിരഞ്ഞെടുക്കുക', wtDrop: 'വീഡിയോ അല്ലെങ്കിൽ ഓഡിയോയും സബ്‌ടൈറ്റിൽ ഫയലുകളും ഇവിടെ ഇടുക, അല്ലെങ്കിൽ ബട്ടണുകൾ ഉപയോഗിക്കുക.', wtMedia: 'വീഡിയോ അല്ലെങ്കിൽ ഓഡിയോ', wtSub1: 'സബ്‌ടൈറ്റിൽ (പഠിക്കുന്ന ഭാഷ)', wtSub2: 'സബ്‌ടൈറ്റിൽ (നിങ്ങളുടെ ഭാഷ)', subLang: 'സബ്‌ടൈറ്റിൽ ഭാഷ', wtStart: 'ആരംഭിക്കുക', wtSample: 'സാമ്പിൾ പരീക്ഷിക്കൂ (വായിച്ചുകേൾപ്പിക്കും)', noSubs: '{f} ൽ സബ്‌ടൈറ്റിൽ കണ്ടില്ല. .srt അല്ലെങ്കിൽ .vtt ഉപയോഗിക്കുക.', wtPrivacy: 'ഫയലുകൾ നിങ്ങളുടെ ബ്രൗസറിനുള്ളിൽ തന്നെ തുറക്കുന്നു, ഉപകരണം വിട്ടുപോകില്ല. വീഡിയോയോ ഓഡിയോയോ ഇല്ലെങ്കിൽ വരികൾ നിങ്ങളുടെ ഉപകരണത്തിന്റെ ശബ്ദത്തിൽ വായിക്കും.', wtListenMode: 'കേൾക്കൽ മോഡ്: വരികൾ വായിച്ചുകേൾപ്പിക്കും', wtTranscript: 'ലിഖിത രൂപം', playPause: 'പ്ലേ അല്ലെങ്കിൽ താൽക്കാലികമായി നിർത്തുക', prevLine: 'മുൻ വരി', nextLine: 'അടുത്ത വരി', replay: 'വരി വീണ്ടും', loopLine: 'വരി ആവർത്തിക്കുക', autoPause: 'ഓരോ വരിക്കും ശേഷം നിർത്തുക', hideTarget: 'പഠിക്കുന്ന ഭാഷയുടെ സബ്‌ടൈറ്റിൽ മറയ്ക്കുക', hideNative: 'എന്റെ ഭാഷയുടെ സബ്‌ടൈറ്റിൽ മറയ്ക്കുക', blurNative: 'എന്റെ ഭാഷ മങ്ങിക്കുക', speed: 'വേഗത', subEarlier: 'സബ്‌ടൈറ്റിൽ നേരത്തെ', subLater: 'സബ്‌ടൈറ്റിൽ വൈകി', shadow: 'അനുകരിക്കുക', stopRec: 'നിർത്തുക', yourVoice: 'നിങ്ങളുടെ ശബ്ദം', orig: 'യഥാർത്ഥം', noMic: 'ഇവിടെ റെക്കോർഡിംഗ് പിന്തുണയ്ക്കുന്നില്ല.', micDenied: 'മൈക്രോഫോൺ അനുമതി നിഷേധിച്ചു.', wtChange: 'ഫയലുകൾ മാറ്റുക', wtKeys: 'കീകൾ: Space പ്ലേ/നിർത്തുക, A/D അല്ലെങ്കിൽ ആരോകൾ മുമ്പത്തെ/അടുത്തത്, R വീണ്ടും, L ആവർത്തനം, P ഓരോ വരിക്കും ശേഷം നിർത്തുക.',
    wdLede: 'നിങ്ങൾ സേവ് ചെയ്ത വാക്കുകൾ. ഈ ബ്രൗസറിൽ മാത്രം സൂക്ഷിക്കുന്നു.', wdCount: '{n} കാണിക്കുന്നു, {d} ഇപ്പോൾ ബാക്കി', wdNoMatch: 'യോജിക്കുന്ന വാക്കുകളില്ല.', wdEmpty: 'ഇതുവരെ വാക്കുകൾ സേവ് ചെയ്തിട്ടില്ല.', wdEmptySub: 'വായിക്കുക അല്ലെങ്കിൽ കാണുക തുറന്ന് വാക്കിൽ തൊട്ട് സേവ് ചെയ്യുക.', wdMore: 'ഇനിയും {n} കാണിച്ചിട്ടില്ല. തിരയൽ ഉപയോഗിക്കുക.', wdNothing: 'എക്സ്പോർട്ട് ചെയ്യാൻ ഒന്നുമില്ല.', wdImported: '{n} പുതിയ വാക്കുകൾ ഇമ്പോർട്ട് ചെയ്തു.', wdImportFail: 'ആ ഫയൽ വായിക്കാനായില്ല.', wdPrivacy: 'ബ്രൗസർ ഡാറ്റ മായ്ച്ചാൽ പട്ടിക പോകും, അതിനാൽ ഇടയ്ക്കിടെ ബാക്കപ്പ് എക്സ്പോർട്ട് ചെയ്യുക.', search: 'തിരയുക', edit: 'മാറ്റുക', dueNow: 'ഇപ്പോൾ', dueToday: 'ഇന്ന്', dueIn: '{n} ദിവസത്തിൽ', backup: 'ബാക്കപ്പ്', importWords: 'ഇമ്പോർട്ട്',
    rvLede: 'കാർഡ് മറിക്കൂ, എത്ര ഓർമ്മയുണ്ടായിരുന്നു എന്ന് പറയൂ.', rvMode: 'പരിശീലന രീതി', rvW2M: 'വാക്കിൽ നിന്ന് അർത്ഥം', rvM2W: 'അർത്ഥത്തിൽ നിന്ന് വാക്ക്', rvListen: 'കേൾക്കൽ', rvCloze: 'വിടവ് നിറയ്ക്കുക', rvStreak: 'തുടർച്ചയായ ദിവസങ്ങൾ: {n}', rvDone: 'കഴിഞ്ഞു: {n} കാർഡുകൾ', rvDoneSub: 'പിന്നീട് വരൂ. തെറ്റിയ കാർഡുകൾ മിനിറ്റുകൾക്കുള്ളിൽ, ബാക്കി ദിവസങ്ങൾക്കുള്ളിൽ തിരിച്ചെത്തും.', rvNone: 'ഒന്നും ബാക്കിയില്ല', rvNoneSub: 'നിങ്ങൾ മുന്നിലാണ്. പുതിയ വാക്കുകൾക്ക് കൂടുതൽ വായിക്കൂ അല്ലെങ്കിൽ കാണൂ.', rvWhichWord: 'ഈ വാക്ക് ഏത്?', rvPlay: 'വാക്ക് കേൾക്കുക', rvListenQ: 'കേട്ട് അർത്ഥം ഓർക്കുക', rvHint: 'അർത്ഥം', rvShow: 'ഉത്തരം കാണിക്കുക', rvProgress: 'സെഷൻ പുരോഗതി', again: 'വീണ്ടും', hard: 'ബുദ്ധിമുട്ട്', good: 'നല്ലത്', easy: 'എളുപ്പം',
    scLede: 'അക്ഷരങ്ങൾ പഠിക്കൂ. ഏത് അക്ഷരത്തിലും തൊട്ട് കേൾക്കൂ, എഴുതി പഠിക്കൂ.', scVowels: 'സ്വരങ്ങൾ', scCons: 'വ്യഞ്ജനങ്ങൾ', scSigns: 'സ്വരചിഹ്നങ്ങൾ', scSignsNote: '{b} എന്ന അക്ഷരത്തിൽ കാണിച്ചിരിക്കുന്നു', scDigits: 'അക്കങ്ങൾ', scQuiz: 'ചെറിയ ക്വിസ്', scQuizQ: 'ഈ അക്ഷരം എങ്ങനെ വായിക്കും?', scTrace: 'എഴുതി നോക്കൂ', scTraceHint: 'മുകളിൽ ഒരു അക്ഷരത്തിൽ തൊട്ട്, ഇവിടെ എഴുതൂ.', correct: 'ശരി!', wrongIs: 'അല്ല. ഇത് {a}.', next: 'അടുത്തത്',
    phLede: 'ദൈനംദിന വാക്യങ്ങൾ. ഏത് വാക്കിലും തൊട്ട് സേവ് ചെയ്യൂ.', phNote: 'ഈ വാക്യങ്ങൾ ഒരു പ്രാരംഭ സെറ്റ് ആണ്. ആശ്രയിക്കുന്നതിനുമുമ്പ് മാതൃഭാഷക്കാരനെക്കൊണ്ട് പരിശോധിപ്പിക്കുക.', cat_greet: 'അഭിവാദ്യങ്ങൾ', cat_intro: 'പരിചയപ്പെടുത്തൽ', cat_daily: 'ദൈനംദിനം', cat_num: 'സംഖ്യകൾ', slow: 'പതുക്കെ'
  };
})(window.B = window.B || {});

;
/* Read view: paste or import text, click words, romanisation, read aloud. */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set;
  var R = { lang: 'auto', text: '', color: true, size: 22, editing: true, speaking: false, sIdx: -1 };
  B.views = B.views || {};
  B.views.read = function (app) {
    app.textContent = ''; U.stopSpeak(); R.speaking = false;
    if (!R.text) { try { R.text = U.store.get('bh-readtext') || ''; } catch (e) { } }
    var ta = h('textarea', { id: 'rd-text', rows: 7, placeholder: t('rdPlaceholder'), 'aria-label': t('rdText'), spellcheck: 'false' }); ta.value = R.text;
    var out = h('div', { class: 'rd-out', id: 'rd-out', 'aria-live': 'off' });
    var langSel = U.langSelect('rd-lang', R.lang, function (v) { R.lang = v; draw(); }, true);
    function curLang() { return R.lang === 'auto' ? (B.detectLang(R.text) || (set.focus)) : R.lang; }
    var romanCb = h('input', { type: 'checkbox', id: 'rd-rom' }); romanCb.checked = set.roman; romanCb.addEventListener('change', function () { set.roman = romanCb.checked; U.saveSet(); draw(); });
    var colorCb = h('input', { type: 'checkbox', id: 'rd-col' }); colorCb.checked = R.color; colorCb.addEventListener('change', function () { R.color = colorCb.checked; out.classList.toggle('nocolor', !R.color); });
    var scheme = h('select', { id: 'rd-sch' }, [h('option', { value: 'simple', text: t('schSimple') }), h('option', { value: 'iast', text: t('schIast') })]); scheme.value = set.scheme; scheme.addEventListener('change', function () { set.scheme = scheme.value; U.saveSet(); draw(); });
    var size = h('input', { type: 'range', id: 'rd-size', min: 16, max: 44, value: R.size, 'aria-label': t('fontSize') }); size.addEventListener('input', function () { R.size = +size.value; out.style.fontSize = R.size + 'px'; });
    function sentences() { return B.sentences(R.text, curLang()); }
    function draw() {
      R.text = ta.value; U.store.set('bh-readtext', R.text.slice(0, 200000));
      out.textContent = ''; out.style.fontSize = R.size + 'px'; out.classList.toggle('nocolor', !R.color);
      var lang = curLang(), sens = sentences();
      if (!R.text.trim()) { out.appendChild(h('p', { class: 'empty', text: t('rdEmpty') })); stats.textContent = ''; return; }
      sens.forEach(function (s, i) { var sp = h('span', { class: 'sen', 'data-i': i, 'data-s': s }); sp.appendChild(U.renderText(s, lang, { roman: set.roman })); out.appendChild(sp); });
      updateStats(lang);
    }
    var stats = h('div', { class: 'rd-stats', 'aria-live': 'polite' });
    function updateStats(lang) { var tk = B.tokenize(R.text, lang).filter(function (x) { return x.w; }), uniq = {}; tk.forEach(function (x) { uniq[B.normWord(x.t)] = 1; }); var u = Object.keys(uniq), kn = u.filter(function (w) { var s = U.words.get(lang, w); return s && s.st >= 2; }).length, ln = u.filter(function (w) { var s = U.words.get(lang, w); return s && s.st < 2; }).length; stats.textContent = t('rdStats', { n: tk.length, u: u.length, k: kn, l: ln, lang: U.langName(lang) }); }
    U.bindWords(out, curLang, function (el) { var s = el.closest('.sen'); return s ? (s.getAttribute('data-s') || '').replace(/\s+/g, ' ').trim() : ''; }, function () { var sc = out.parentNode.scrollTop; draw(); });
    ta.addEventListener('input', function () { clearTimeout(ta._t); ta._t = setTimeout(draw, 250); });
    function readAloud() {
      if (R.speaking) { R.speaking = false; U.stopSpeak(); mark(-1); btnRead.textContent = '▶ ' + t('readAloud'); return; }
      var sens = out.querySelectorAll('.sen'), lang = curLang(), i = Math.max(0, R.sIdx < 0 ? 0 : R.sIdx);
      if (!sens.length) return; R.speaking = true; btnRead.textContent = '■ ' + t('stop');
      (function next() { if (!R.speaking || i >= sens.length) { R.speaking = false; mark(-1); btnRead.textContent = '▶ ' + t('readAloud'); return; } mark(i); var txt = sens[i].textContent.trim(); i++; if (!txt) return next(); U.speak(txt, lang, next); })();
    }
    function mark(i) { R.sIdx = i; out.querySelectorAll('.sen.speaking').forEach(function (x) { x.classList.remove('speaking'); }); if (i >= 0) { var s = out.querySelectorAll('.sen')[i]; if (s) { s.classList.add('speaking'); s.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } } }
    var btnRead = h('button', { type: 'button', class: 'abtn gold', text: '▶ ' + t('readAloud'), onclick: readAloud });
    var tools = h('div', { class: 'tools' }, [
      h('div', { class: 'tf' }, [h('label', { for: 'rd-lang', text: t('textLang') }), langSel]),
      h('div', { class: 'tf chk' }, [romanCb, h('label', { for: 'rd-rom', text: t('showRoman') })]),
      h('div', { class: 'tf' }, [h('label', { for: 'rd-sch', text: t('scheme') }), scheme]),
      h('div', { class: 'tf chk' }, [colorCb, h('label', { for: 'rd-col', text: t('colorWords') })]),
      h('div', { class: 'tf' }, [h('label', { for: 'rd-size', text: t('fontSize') }), size])
    ]);
    var actions = h('div', { class: 'acts' }, [btnRead,
      h('button', { type: 'button', class: 'abtn', text: t('sample'), onclick: function () { var l = B.INDIC.indexOf(R.lang) >= 0 ? R.lang : set.focus; R.lang = l; langSel.value = l; ta.value = B.sampleText(l); draw(); } }),
      h('button', { type: 'button', class: 'abtn', text: t('importTxt'), onclick: function () { U.file('.txt,.md,.srt,.vtt,text/plain', function (txt, f) { if (/\.(srt|vtt)$/i.test(f.name)) txt = B.parseSubs(txt).map(function (x) { return x.t; }).join('\n'); ta.value = txt; draw(); }); } }),
      h('button', { type: 'button', class: 'abtn', text: t('clear'), onclick: function () { ta.value = ''; draw(); } })]);
    app.appendChild(h('h1', { text: t('nav_read') })); app.appendChild(h('p', { class: 'lede', text: t('rdLede') }));
    app.appendChild(h('section', { class: 'panel' }, [h('h2', { text: t('rdText') }), ta, actions, tools]));
    app.appendChild(h('section', { class: 'panel rd-panel' }, [h('div', { class: 'legend2' }, [h('span', { class: 'tk new', text: t('st0') }), h('span', { class: 'tk learn', text: t('st1') }), h('span', { class: 'tk known', text: t('st2') }), h('span', { class: 'hint', text: t('clickWord') })]), out, stats]));
    draw();
  };
})(window.B);

;
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

;
/* My words (saved list, import/export) and Review (spaced repetition). */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set, W = U.words;
  B.views = B.views || {};
  var F = { lang: 'all', st: 'all', q: '' };
  var V = { mode: 'w2m', lang: 'focus', queue: [], cur: null, shown: false, done: 0, total: 0, opts: null, picked: -1 };

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
        var rm = B.isBrahmic(x.w) ? B.translit(x.w, set.scheme) : '';
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
      h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn gold', text: '▶ ' + t('nav_review'), onclick: function () { U.go('/review/'); } }), h('button', { type: 'button', class: 'abtn', text: '⬇ CSV', onclick: function () { exp('csv'); } }), h('button', { type: 'button', class: 'abtn', text: '⬇ Anki', onclick: function () { exp('anki'); } }), h('button', { type: 'button', class: 'abtn', text: '⬇ ' + t('backup'), onclick: function () { exp('json'); } }), h('button', { type: 'button', class: 'abtn', text: '⬆ ' + t('importWords'), onclick: imp }), ]),
      sum, listBox, h('p', { class: 'note', text: t('wdPrivacy') })]));
    draw();
  };

  // ---------------- Review
  function pool() { var l = V.lang === 'focus' ? set.focus : V.lang; return W.due(l === 'all' ? null : l); }
  function nextOptions(card) { // 3 distractor meanings for meaning->word is not needed; typed/reveal flow keeps it simple
    return null;
  }
  B.views.review = function (app) {
    app.textContent = ''; U.stopSpeak();
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
      var rm = B.isBrahmic(c.w) ? B.translit(c.w, set.scheme) : '';
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
})(window.B);

;
/* Home dashboard, Scripts (charts, quiz, tracing) and Phrases. */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set, W = U.words;
  B.views = B.views || {};

  B.views.home = function (app) {
    app.textContent = '';
    var due = W.due(null).length, saved = W.list.length;
    app.appendChild(h('section', { class: 'hero' }, [h('h1', { text: t('homeH') }), h('p', { class: 'lede', text: t('homeSub') }),
      h('div', { class: 'tools' }, [h('div', { class: 'tf' }, [h('label', { for: 'hm-focus', text: t('focusLang') }), (function () { var s = h('select', { id: 'hm-focus' }, B.INDIC.map(function (l) { return h('option', { value: l, text: U.langNative(l) + ' · ' + U.langName(l) }); })); s.value = set.focus; s.addEventListener('change', function () { set.focus = s.value; U.saveSet(); B.views.home(app); }); return s; })()])])]));
    var stats = h('div', { class: 'stats' }, [stat(saved, t('statWords')), stat(due, t('statDue')), stat(U.streak(), t('statStreak'))]);
    app.appendChild(stats);
    var cards = [['/watch/', '🎬', 'nav_watch', 'cWatch'], ['/read/', '📖', 'nav_read', 'cRead'], ['/review/', '🧠', 'nav_review', 'cReview'], ['/words/', '🗂', 'nav_words', 'cWords'], ['/scripts/', 'अ', 'nav_scripts', 'cScripts'], ['/phrases/', '💬', 'nav_phrases', 'cPhrases']];
    var grid = h('div', { class: 'cards' });
    cards.forEach(function (c) { grid.appendChild(h('a', { class: 'card', href: B.base + c[0].slice(1), onclick: function (e) { if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) return; e.preventDefault(); U.go(c[0]); } }, [h('span', { class: 'ci', 'aria-hidden': 'true', text: c[1] }), h('h2', { text: t(c[2]) }), h('p', { text: t(c[3]) }), c[0] === '/review/' && due ? h('span', { class: 'chip lr', text: t('dueCount', { n: due }) }) : null])); });
    app.appendChild(grid);
    app.appendChild(h('section', { class: 'panel' }, [h('h2', { text: t('howH') }), h('ol', { class: 'steps' }, ['how1', 'how2', 'how3', 'how4'].map(function (k) { return h('li', { text: t(k) }); }))]));
    app.appendChild(h('p', { class: 'note', text: t('homeNote') }));
  };
  function stat(n, l) { return h('div', { class: 'stat' }, [h('b', { text: String(n) }), h('span', { text: l })]); }

  // ---------------- Scripts
  var SC = { lang: null, quiz: null, trace: null };
  B.views.scripts = function (app) {
    app.textContent = ''; SC.lang = SC.lang || set.focus;
    app.appendChild(h('h1', { text: t('nav_scripts') })); app.appendChild(h('p', { class: 'lede', text: t('scLede') }));
    var ls = h('select', { id: 'sc-lang', 'aria-label': t('language') }, B.INDIC.map(function (l) { return h('option', { value: l, text: U.langNative(l) + ' · ' + U.langName(l) }); })); ls.value = SC.lang;
    ls.addEventListener('change', function () { SC.lang = ls.value; SC.quiz = null; draw(); });
    var body = h('div'); app.appendChild(h('div', { class: 'tools' }, [h('div', { class: 'tf' }, [h('label', { for: 'sc-lang', text: t('language') }), ls])])); app.appendChild(body);
    function cell(g, rom, extra) {
      return h('button', { type: 'button', class: 'gl', 'aria-label': g + ' ' + rom, onclick: function () { U.speak(g, SC.lang, null, 0.7); SC.trace = g; drawTrace(); } }, [h('span', { class: 'g', lang: SC.lang, text: g }), h('span', { class: 'r', text: rom })]);
    }
    function grid(title, arr, mk) { return h('section', { class: 'panel' }, [h('h2', { text: title }), h('div', { class: 'glyphs' }, arr.map(mk))]); }
    var traceBox = h('section', { class: 'panel' });
    function drawTrace() {
      traceBox.textContent = ''; traceBox.appendChild(h('h2', { text: t('scTrace') }));
      var g = SC.trace; if (!g) { traceBox.appendChild(h('p', { class: 'note', text: t('scTraceHint') })); return; }
      var cv = h('canvas', { width: 320, height: 240, class: 'trace', role: 'img', 'aria-label': t('scTraceHint') }), ctx = cv.getContext('2d');
      function bg() { var dk = document.documentElement.getAttribute('data-theme') !== 'light'; ctx.clearRect(0, 0, 320, 240); ctx.fillStyle = dk ? 'rgba(255,255,255,.14)' : 'rgba(28,27,75,.14)'; ctx.font = '170px "Noto Sans Indic","Noto Sans",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(g, 160, 125); ctx.strokeStyle = dk ? '#ffd24a' : '#1c1b4b'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; }
      bg(); var down = false, lx = 0, ly = 0;
      function pos(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 320 / r.width, (e.clientY - r.top) * 240 / r.height]; }
      cv.addEventListener('pointerdown', function (e) { down = true; var p = pos(e); lx = p[0]; ly = p[1]; cv.setPointerCapture(e.pointerId); ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + .1, ly + .1); ctx.stroke(); });
      cv.addEventListener('pointermove', function (e) { if (!down) return; var p = pos(e); ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(p[0], p[1]); ctx.stroke(); lx = p[0]; ly = p[1]; });
      ['pointerup', 'pointercancel'].forEach(function (ev) { cv.addEventListener(ev, function () { down = false; }); });
      traceBox.appendChild(cv); traceBox.appendChild(h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn', text: t('clear'), onclick: bg }), h('button', { type: 'button', class: 'abtn', text: '🔊', 'aria-label': t('speak'), onclick: function () { U.speak(g, SC.lang, null, 0.7); } })]));
    }
    function quiz() {
      var S = B.SCRIPTS[SC.lang], pool = S.vowels.concat(S.cons), box = h('section', { class: 'panel' });
      function q() {
        box.textContent = ''; box.appendChild(h('h2', { text: t('scQuiz') }));
        var ans = pool[Math.floor(Math.random() * pool.length)], rom = function (g) { return B.translit(g, 'simple') || g; }, opts = [ans];
        var guard = 0; while (opts.length < 4 && guard++ < 100) { var x = pool[Math.floor(Math.random() * pool.length)]; if (opts.indexOf(x) < 0 && rom(x) !== rom(ans) && opts.every(function (o) { return rom(o) !== rom(x); })) opts.push(x); }
        opts.sort(function () { return Math.random() - .5; });
        box.appendChild(h('div', { class: 'qz-g', lang: SC.lang, text: ans })); box.appendChild(h('p', { class: 'note', text: t('scQuizQ') }));
        var res = h('p', { class: 'qz-res', 'aria-live': 'polite' }), done = false;
        box.appendChild(h('div', { class: 'qz-opts' }, opts.map(function (o) { return h('button', { type: 'button', class: 'abtn', text: rom(o), onclick: function (ev) { if (done) return; done = true; var ok = o === ans; ev.target.classList.add(ok ? 'right' : 'wrong'); res.textContent = ok ? t('correct') : t('wrongIs', { a: rom(ans) }); U.speak(ans, SC.lang, null, .7); SC.score = (SC.score || 0) + (ok ? 1 : 0); SC.tries = (SC.tries || 0) + 1; sc.textContent = SC.score + ' / ' + SC.tries; nb.hidden = false; nb.focus(); } }); })));
        box.appendChild(res); var nb = h('button', { type: 'button', class: 'abtn gold', text: t('next'), hidden: true, onclick: q }); var sc = h('span', { class: 'chip', text: (SC.score || 0) + ' / ' + (SC.tries || 0) }); box.appendChild(h('div', { class: 'acts' }, [nb, sc]));
      }
      q(); return box;
    }
    function draw() {
      body.textContent = ''; var S = B.SCRIPTS[SC.lang], rom = function (g) { return B.translit(g, set.scheme) || g; };
      body.appendChild(grid(t('scVowels'), S.vowels, function (g) { return cell(g, rom(g)); }));
      body.appendChild(grid(t('scCons'), S.cons, function (g) { return cell(g, rom(g)); }));
      body.appendChild(h('section', { class: 'panel' }, [h('h2', { text: t('scSigns') }), h('p', { class: 'note', text: t('scSignsNote', { b: S.base }) }), h('div', { class: 'glyphs' }, S.signs.map(function (s) { var g = S.base + s; return cell(g, rom(g)); }))]));
      body.appendChild(grid(t('scDigits'), S.digits, function (g, i) { return cell(g, String(i)); }));
      body.appendChild(quiz()); drawTrace(); body.appendChild(traceBox);
    }
    draw();
  };

  // ---------------- Phrases
  var PH = { cat: 'greet', lang: null };
  B.views.phrases = function (app) {
    app.textContent = ''; PH.lang = PH.lang || set.focus;
    app.appendChild(h('h1', { text: t('nav_phrases') })); app.appendChild(h('p', { class: 'lede', text: t('phLede') }));
    var ls = h('select', { id: 'ph-lang', 'aria-label': t('language') }, B.INDIC.map(function (l) { return h('option', { value: l, text: U.langNative(l) + ' · ' + U.langName(l) }); })); ls.value = PH.lang;
    ls.addEventListener('change', function () { PH.lang = ls.value; draw(); });
    var tabs = h('div', { class: 'tabs', role: 'tablist' }), list = h('div', { class: 'ph-list' });
    B.PHRASE_CATS.forEach(function (c) { tabs.appendChild(h('button', { type: 'button', role: 'tab', class: 'tab', 'data-c': c, text: t('cat_' + c), onclick: function () { PH.cat = c; draw(); } })); });
    app.appendChild(h('div', { class: 'tools' }, [h('div', { class: 'tf' }, [h('label', { for: 'ph-lang', text: t('language') }), ls])])); app.appendChild(tabs); app.appendChild(list);
    app.appendChild(h('p', { class: 'note', text: t('phNote') }));
    function draw() {
      [].forEach.call(tabs.children, function (b) { var on = b.getAttribute('data-c') === PH.cat; b.setAttribute('aria-selected', String(on)); b.classList.toggle('on', on); }); list.textContent = '';
      B.PHRASES.filter(function (p) { return p.cat === PH.cat; }).forEach(function (p) {
        var txt = p[PH.lang], tgt = h('div', { class: 'ph-t', lang: PH.lang }); tgt.appendChild(U.renderText(txt, PH.lang, { roman: false }));
        U.bindWords(tgt, function () { return PH.lang; }, function () { return txt; }, function () { draw(); });
        list.appendChild(h('div', { class: 'ph' }, [h('div', { class: 'ph-main' }, [tgt, h('div', { class: 'ph-r', text: B.translit(txt, set.scheme) }), h('div', { class: 'ph-n', text: p.en })]), h('div', { class: 'ph-a' }, [h('button', { type: 'button', class: 'abtn', 'aria-label': t('speak') + ': ' + p.en, text: '🔊', onclick: function () { U.speak(txt, PH.lang, null, set.rate); } }), h('button', { type: 'button', class: 'abtn', 'aria-label': t('slow') + ': ' + p.en, text: '🐢', onclick: function () { U.speak(txt, PH.lang, null, 0.55); } })])]));
      });
    }
    draw();
  };
})(window.B);

;
/* Bhasha shell: routing, header, settings, footer. */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set, $ = U.$;
  var ORIGIN = 'https://eknathalabs.com', MARK = 'M29.2 23.2V35.5Q29.2 37.5 28.4 38.4Q27.6 39.4 26.1 39.4Q25 39.4 23.8 38.7Q22.6 38.1 21.6 37Q20.7 36 20 34.8Q19.4 33.6 19.4 32.5Q19.4 31.2 20.1 30.4Q20.9 29.6 22.9 29.6L23 29.7V23.2H18V18.2H46V23.2H41.9V45.8H35.7V23.2Z';
  B.MARK = MARK; B.base = '/';
  var ROUTES = { '': 'home', read: 'read', watch: 'watch', words: 'words', review: 'review', scripts: 'scripts', phrases: 'phrases' };
  var NAV = [['watch', '🎬'], ['read', '📖'], ['words', '🗂'], ['review', '🧠'], ['scripts', 'अ'], ['phrases', '💬']];
  var app;
  function mark() { var NS = 'http://www.w3.org/2000/svg', s = document.createElementNS(NS, 'svg'), p = document.createElementNS(NS, 'path'); s.setAttribute('viewBox', '14 14 36 36'); s.setAttribute('width', '22'); s.setAttribute('height', '22'); s.setAttribute('aria-hidden', 'true'); p.setAttribute('d', MARK); p.setAttribute('fill', 'currentColor'); s.appendChild(p); return s; }
  function pathKey() { var p = location.pathname.replace(/index\.html$/, '').replace(/^\/+|\/+$/g, ''); return p; }
  U.go = function (url) { history.pushState(null, '', url); route(); window.scrollTo(0, 0); };

  function buildChrome() {
    var hd = $('#hdr'); hd.textContent = '';
    var bar = h('div', { class: 'wrap bar' });
    bar.appendChild(h('a', { class: 'brand', href: '/', 'data-nav': '1', 'aria-label': 'Bhasha' }, [h('b', null, [mark()]), h('span', null, ['Bhasha', h('small', { text: 'EknathaLabs' })])]));
    bar.appendChild(h('span', { class: 'grow' }));
    bar.appendChild(h('a', { class: 'ibtn', href: ORIGIN + (set.ui === 'en' ? '/' : '/' + set.ui + '/'), 'aria-label': 'EknathaLabs' }, [h('span', { text: '⌂' }), h('span', { class: 'lab', text: 'EknathaLabs' })]));
    var panel = h('div', { class: 'pop-panel', id: 'setp', hidden: true, role: 'dialog', 'aria-label': t('settings') }), btn = h('button', { class: 'ibtn', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'setp' }, [h('span', { text: '⚙' }), h('span', { class: 'lab', text: t('settings') })]);
    function sel(id, label, opts, val, fn) { var s = h('select', { id: id }, opts.map(function (o) { return h('option', { value: o[0], text: o[1] }); })); s.value = val; s.addEventListener('change', function () { fn(s.value); }); panel.appendChild(h('label', { for: id, text: label })); panel.appendChild(s); }
    function seg(label, items, val, fn) { panel.appendChild(h('label', { text: label })); var g = h('div', { class: 'seg', role: 'group', 'aria-label': label }); items.forEach(function (it) { g.appendChild(h('button', { type: 'button', 'aria-pressed': String(val === it[0]), text: it[1], onclick: function () { fn(it[0]); [].forEach.call(g.children, function (b, i) { b.setAttribute('aria-pressed', String(items[i][0] === it[0])); }); } })); }); panel.appendChild(g); }
    var NAMES = { en: 'English', hi: 'हिन्दी', te: 'తెలుగు', kn: 'ಕನ್ನಡ', ta: 'தமிழ்', ml: 'മലയാളം' };
    panel.appendChild(h('div', { class: 'pop-title', text: t('settings') }));
    sel('s-ui', t('uiLang'), Object.keys(NAMES).map(function (k) { return [k, NAMES[k]]; }), set.ui, function (v) { set.ui = v; U.saveSet(); U.applyLang(); buildChrome(); route(); });
    sel('s-focus', t('focusLang'), B.INDIC.map(function (l) { return [l, U.langNative(l) + ' · ' + U.langName(l)]; }), set.focus, function (v) { set.focus = v; U.saveSet(); route(); });
    seg(t('scheme'), [['simple', t('schSimple')], ['iast', t('schIast')]], set.scheme, function (v) { set.scheme = v; U.saveSet(); route(); });
    seg(t('showRoman'), [['1', t('on')], ['0', t('off')]], set.roman ? '1' : '0', function (v) { set.roman = v === '1'; U.saveSet(); route(); });
    sel('s-rate', t('voiceSpeed'), [['0.6', '0.6×'], ['0.75', '0.75×'], ['0.9', '0.9×'], ['1', '1×'], ['1.15', '1.15×']], String(set.rate), function (v) { set.rate = +v; U.saveSet(); });
    sel('s-perday', t('perDay'), [['5', '5'], ['10', '10'], ['20', '20'], ['40', '40'], ['0', t('unlimited')]], String(set.perDay), function (v) { set.perDay = +v; U.saveSet(); });
    seg(t('theme'), [['light', t('light')], ['dark', t('dark')], ['new', t('new')]], set.theme, function (v) { set.theme = v; U.saveSet(); U.applyTheme(); });
    function close(f) { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (f) btn.focus(); }
    btn.addEventListener('click', function () { var o = panel.hidden; panel.hidden = !o; btn.setAttribute('aria-expanded', String(o)); if (o) $('select', panel).focus(); });
    var pop = h('div', { class: 'pop' }, [btn, panel]); bar.appendChild(pop);
    if (!buildChrome.bound) { buildChrome.bound = true; document.addEventListener('keydown', function (e) { var p = $('#setp'); if (e.key === 'Escape' && p && !p.hidden) { p.hidden = true; var b = $('[aria-controls=setp]'); if (b) { b.setAttribute('aria-expanded', 'false'); b.focus(); } } }); document.addEventListener('click', function (e) { var p = $('#setp'); if (p && !p.hidden && !p.parentNode.contains(e.target)) { p.hidden = true; $('[aria-controls=setp]').setAttribute('aria-expanded', 'false'); } }); }
    hd.appendChild(bar);
    var nav = h('nav', { class: 'wrap tabsnav', 'aria-label': t('mainNav'), id: 'mnav' });
    NAV.forEach(function (n) { nav.appendChild(h('a', { href: '/' + n[0] + '/', 'data-nav': '1', 'data-k': n[0] }, [h('span', { 'aria-hidden': 'true', text: n[1] }), h('span', { text: t('nav_' + n[0]) })])); });
    hd.appendChild(nav);
    var sk = $('.skip'); if (sk) sk.textContent = t('skip');
    var ft = $('#ftr'); ft.textContent = ''; ft.appendChild(h('div', { class: 'wrap' }, [h('span', null, [t('part') + ' · ', h('a', { href: ORIGIN + (set.ui === 'en' ? '/' : '/' + set.ui + '/'), text: 'eknathalabs.com' })]), h('span', { text: t('privacyNote') })]));
  }

  function route() {
    var k = pathKey(), view = ROUTES[k]; if (!view) { k = ''; view = 'home'; }
    U.closePopup(); app.textContent = ''; if (B.views._cleanup) B.views._cleanup();
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
