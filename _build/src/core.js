/* Bhasha core. DOM-free so Node can test it. */
(function (B) {
  'use strict';
  // ---------- languages
  B.LANGS = { te: { name: 'Telugu', native: 'తెలుగు', bcp: 'te-IN', script: 'Telugu' }, hi: { name: 'Hindi', native: 'हिन्दी', bcp: 'hi-IN', script: 'Devanagari' }, kn: { name: 'Kannada', native: 'ಕನ್ನಡ', bcp: 'kn-IN', script: 'Kannada' }, ta: { name: 'Tamil', native: 'தமிழ்', bcp: 'ta-IN', script: 'Tamil' }, ml: { name: 'Malayalam', native: 'മലയാളം', bcp: 'ml-IN', script: 'Malayalam' }, bn: { name: 'Bengali', native: 'বাংলা', bcp: 'bn-IN', script: 'Bengali' }, mr: { name: 'Marathi', native: 'मराठी', bcp: 'mr-IN', script: 'Devanagari' }, ko: { name: 'Korean', native: '한국어', bcp: 'ko-KR', script: 'Hangul' }, es: { name: 'Spanish', native: 'Español', bcp: 'es-ES', script: 'Latin' }, de: { name: 'German', native: 'Deutsch', bcp: 'de-DE', script: 'Latin' } };
  B.LEARN = ['te', 'hi', 'kn', 'ta', 'ml', 'bn', 'mr', 'ko', 'es', 'de']; // languages with phrasebook, voice and Say it
  B.SCRIPT_LANGS = ['te', 'hi', 'kn', 'ta', 'ml', 'bn', 'mr', 'ko']; // languages with a script chart
  B.INDIC = B.LEARN;
  // other reading languages: code, English name, native name, BCP 47 for speech
  B.OTHER = [['en', 'English', 'English', 'en-US'], ['es', 'Spanish', 'Español', 'es-ES'], ['fr', 'French', 'Français', 'fr-FR'], ['de', 'German', 'Deutsch', 'de-DE'], ['it', 'Italian', 'Italiano', 'it-IT'], ['pt', 'Portuguese', 'Português', 'pt-PT'], ['ru', 'Russian', 'Русский', 'ru-RU'], ['ja', 'Japanese', '日本語', 'ja-JP'], ['ko', 'Korean', '한국어', 'ko-KR'], ['zh', 'Chinese', '中文', 'zh-CN'], ['ar', 'Arabic', 'العربية', 'ar-SA'], ['bn', 'Bengali', 'বাংলা', 'bn-IN'], ['mr', 'Marathi', 'मराठी', 'mr-IN'], ['gu', 'Gujarati', 'ગુજરાતી', 'gu-IN'], ['pa', 'Punjabi', 'ਪੰਜਾਬੀ', 'pa-IN'], ['ur', 'Urdu', 'اردو', 'ur-PK'], ['tr', 'Turkish', 'Türkçe', 'tr-TR'], ['id', 'Indonesian', 'Bahasa Indonesia', 'id-ID'], ['th', 'Thai', 'ไทย', 'th-TH'], ['vi', 'Vietnamese', 'Tiếng Việt', 'vi-VN']];
  B.allLangs = function () { return B.LEARN.map(function (c) { return [c, B.LANGS[c].name, B.LANGS[c].native, B.LANGS[c].bcp]; }).concat(B.OTHER.filter(function (o) { return !B.LANGS[o[0]]; })); };
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
  var BASES = { hi: 0x900, bn: 0x980, ta: 0xB80, te: 0xC00, kn: 0xC80, ml: 0xD00 };
  var VOW = { 5: ['a', 'a'], 6: ['aa', 'ā'], 7: ['i', 'i'], 8: ['ee', 'ī'], 9: ['u', 'u'], 10: ['oo', 'ū'], 11: ['ru', 'ṛ'], 12: ['lu', 'ḷ'], 13: ['e', 'ĕ'], 14: ['e', 'e'], 15: ['e', 'ē'], 16: ['ai', 'ai'], 17: ['o', 'ŏ'], 18: ['o', 'o'], 19: ['o', 'ō'], 20: ['au', 'au'] };
  var SIGN = { 0x3E: 6, 0x3F: 7, 0x40: 8, 0x41: 9, 0x42: 10, 0x43: 11, 0x44: 11, 0x45: 13, 0x46: 14, 0x47: 15, 0x48: 16, 0x49: 17, 0x4A: 18, 0x4B: 19, 0x4C: 20, 0x62: 12, 0x63: 12 };
  var CON = { 0x15: ['k', 'k'], 0x16: ['kh', 'kh'], 0x17: ['g', 'g'], 0x18: ['gh', 'gh'], 0x19: ['ng', 'ṅ'], 0x1A: ['ch', 'c'], 0x1B: ['chh', 'ch'], 0x1C: ['j', 'j'], 0x1D: ['jh', 'jh'], 0x1E: ['ny', 'ñ'], 0x1F: ['t', 'ṭ'], 0x20: ['th', 'ṭh'], 0x21: ['d', 'ḍ'], 0x22: ['dh', 'ḍh'], 0x23: ['n', 'ṇ'], 0x24: ['t', 't'], 0x25: ['th', 'th'], 0x26: ['d', 'd'], 0x27: ['dh', 'dh'], 0x28: ['n', 'n'], 0x29: ['n', 'ṉ'], 0x2A: ['p', 'p'], 0x2B: ['ph', 'ph'], 0x2C: ['b', 'b'], 0x2D: ['bh', 'bh'], 0x2E: ['m', 'm'], 0x2F: ['y', 'y'], 0x30: ['r', 'r'], 0x31: ['r', 'ṟ'], 0x32: ['l', 'l'], 0x33: ['l', 'ḷ'], 0x34: ['zh', 'ḻ'], 0x35: ['v', 'v'], 0x36: ['sh', 'ś'], 0x37: ['sh', 'ṣ'], 0x38: ['s', 's'], 0x39: ['h', 'h'] };
  var NUKTA = { 0x58: ['q', 'q'], 0x59: ['kh', 'kh'], 0x5A: ['gh', 'ġ'], 0x5B: ['z', 'z'], 0x5C: ['r', 'ṛ'], 0x5D: ['rh', 'ṛh'], 0x5E: ['f', 'f'], 0x5F: ['y', 'y'] };
  var CHILLU = { 0xD7A: ['n', 'ṇ'], 0xD7B: ['n', 'n'], 0xD7C: ['r', 'r'], 0xD7D: ['l', 'l'], 0xD7E: ['l', 'ḷ'], 0xD7F: ['k', 'k'] };
  function script(cp) { if (cp >= 0x900 && cp < 0x980) return 'hi'; if (cp >= 0x980 && cp < 0xA00) return 'bn'; if ((cp >= 0xAC00 && cp <= 0xD7A3) || (cp >= 0x3131 && cp <= 0x3163) || (cp >= 0x1100 && cp <= 0x11FF)) return 'ko'; if (cp >= 0xB80 && cp < 0xC00) return 'ta'; if (cp >= 0xC00 && cp < 0xC80) return 'te'; if (cp >= 0xC80 && cp < 0xD00) return 'kn'; if (cp >= 0xD00 && cp < 0xD80) return 'ml'; return null; }
  B.isBrahmic = function (s) { for (var i = 0; i < s.length; i++) if (script(s.charCodeAt(i))) return true; return false; };

  // Bengali-specific values (index = offset in the Bengali block): inherent vowel is 'o'
  var BN_V = { 5: ['o', 'ô'], 6: ['a', 'ā'], 7: ['i', 'i'], 8: ['i', 'ī'], 9: ['u', 'u'], 10: ['u', 'ū'], 11: ['ri', 'ṛ'], 12: ['li', 'ḷ'], 15: ['e', 'e'], 16: ['oi', 'ai'], 19: ['o', 'o'], 20: ['ou', 'au'] };
  var BN_S = { 0x3E: 6, 0x3F: 7, 0x40: 8, 0x41: 9, 0x42: 10, 0x43: 11, 0x47: 15, 0x48: 16, 0x4B: 19, 0x4C: 20 };
  var BN_C = { 0x1C: ['j', 'j'], 0x1E: ['n', 'ñ'], 0x23: ['n', 'ṇ'], 0x2F: ['j', 'y'], 0x36: ['sh', 'ś'], 0x37: ['sh', 'ṣ'], 0x38: ['sh', 's'] };
  // Korean (Revised Romanization with the common sound rules)
  var HL = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
  var HV = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
  var HT = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't'];
  var HLI = ['', 'g', 'kk', 'ks', 'n', 'nj', 'n', 'd', 'r', 'lg', 'lm', 'lb', 'ls', 'lt', 'lp', 'r', 'm', 'b', 'bs', 's', 'ss', 'ng', 'j', 'ch', 'k', 't', 'p', ''];
  var HJ = { 0x3131: 'g', 0x3132: 'kk', 0x3134: 'n', 0x3137: 'd', 0x3138: 'tt', 0x3139: 'r', 0x3141: 'm', 0x3142: 'b', 0x3143: 'pp', 0x3145: 's', 0x3146: 'ss', 0x3147: 'ng', 0x3148: 'j', 0x3149: 'jj', 0x314A: 'ch', 0x314B: 'k', 0x314C: 't', 0x314D: 'p', 0x314E: 'h' };
  function hangul(w) {
    var syl = [], i, cp, o = '';
    for (i = 0; i < w.length; i++) { cp = w.charCodeAt(i); if (cp >= 0xAC00 && cp <= 0xD7A3) { var x = cp - 0xAC00; syl.push({ l: Math.floor(x / 588), v: Math.floor(x % 588 / 28), t: x % 28 }); } else if (cp >= 0x314F && cp <= 0x3163) syl.push({ j: HV[cp - 0x314F] }); else if (HJ[cp]) syl.push({ j: HJ[cp] }); else syl.push({ j: '' }); }
    for (i = 0; i < syl.length; i++) {
      var a = syl[i], nx = syl[i + 1]; if (a.j != null) { o += a.j; continue; }
      var init = HL[a.l]; if (a.l === 5 && i > 0 && syl[i - 1].t === 8) init = 'l'; if (a.l === 5 && i > 0 && syl[i - 1].t === 4) init = 'l';
      o += init + HV[a.v];
      if (a.t) {
        var fin = HT[a.t];
        if (nx && nx.l === 11) { o += HLI[a.t]; }
        else if (nx && nx.l != null && (nx.l === 2 || nx.l === 6) && (fin === 'k' || fin === 't' || fin === 'p')) o += fin === 'k' ? 'ng' : fin === 't' ? 'n' : 'm';
        else if (nx && nx.l === 5 && (fin === 'n' || fin === 'l')) o += 'l';
        else if (nx && nx.l === 5 && (fin === 'k' || fin === 'p' || fin === 't')) o += fin === 'k' ? 'ng' : fin === 'p' ? 'm' : 'n';
        else o += fin;
      }
    }
    return o;
  }
  // Transliterate one word or a whole string. scheme: 'simple' (default) or 'iast'.
  B.translit = function (str, scheme) {
    var si = scheme === 'iast' ? 1 : 0, out = '', i = 0, n = str.length;
    // split into runs of one script so word-level rules (schwa, Tamil voicing) can apply
    var token = [], res = [];
    function flush() { if (token.length) { res.push(word(token.join(''))); token = []; } }
    for (i = 0; i < n; i++) { var cp = str.charCodeAt(i), sc = script(cp); if (sc || (token.length && (cp === 0x200C || cp === 0x200D))) token.push(str[i]); else { flush(); res.push(str[i]); } }
    flush(); return res.join('');
    function word(w) {
      if (script(w.charCodeAt(0)) === 'ko') return hangul(w);
      var units = [], k, cp, sc = script(w.charCodeAt(0)), base = BASES[sc], pendingA = -1, vowelCount = 0, prevVowel = false, prevNasalVir = false;
      for (k = 0; k < w.length; k++) {
        cp = w.charCodeAt(k); var idx = cp - base;
        if (cp === 0x200C || cp === 0x200D) continue;
        if (sc === 'ml' && CHILLU[cp]) { var ch = CHILLU[cp][si]; units.push({ t: ch, type: 'c', fin: true }); pendingA = -1; vowelCount++; continue; }
        if (idx >= 5 && idx <= 20 && (sc === 'bn' ? BN_V[idx] : VOW[idx])) { units.push({ t: (sc === 'bn' ? BN_V : VOW)[idx][si], type: 'v' }); pendingA = -1; vowelCount++; continue; }
        if ((idx >= 0x15 && idx <= 0x39) || NUKTA[idx] && (sc === 'hi' || sc === 'bn')) {
          var c = ((sc === 'hi' || sc === 'bn') && NUKTA[idx]) ? NUKTA[idx] : (sc === 'bn' && BN_C[idx]) ? BN_C[idx] : CON[idx]; if (!c) continue;
          if (sc === 'bn' && idx === 0x2F && units.length && units[units.length - 1].vir && units[units.length - 1].type === 'c' && units[units.length - 1].idx !== 0x39) { var pu = units[units.length - 1]; pu.t = pu.t + pu.t; pu.vir = false; pu.a = true; pu.g = true; pendingA = units.length - 1; vowelCount++; continue; }
          if (sc === 'bn' && idx === 0x2F && units.length && units[units.length - 1].vir) c = ['y', 'y'];
          var nx = w.charCodeAt(k + 1) - base;
          if (sc === 'te' && idx === 0x15 && false) { }
          units.push({ t: c[si], type: 'c', idx: idx, a: true }); pendingA = units.length - 1; vowelCount++; continue;
        }
        if ((sc === 'bn' ? BN_S[idx] : SIGN[idx]) && idx >= 0x3E) { var VV = (sc === 'bn' ? BN_V : VOW)[sc === 'bn' ? BN_S[idx] : SIGN[idx]]; if (pendingA >= 0) { units[pendingA].a = false; units[pendingA].vs = VV[si]; pendingA = -1; } else units.push({ t: VV[si], type: 'v' }); continue; }
        if (idx === 0x3C && (sc === 'hi' || sc === 'bn') && units.length) { var NK = { 0x15: 0x58, 0x16: 0x59, 0x17: 0x5A, 0x1C: 0x5B, 0x21: 0x5C, 0x22: 0x5D, 0x2B: 0x5E, 0x2F: 0x5F }, pk = units[units.length - 1]; if (pk.type === 'c' && NK[pk.idx]) { pk.t = NUKTA[NK[pk.idx]][si]; } continue; }
        if (idx === 0x4D) { if (pendingA >= 0) { units[pendingA].a = false; units[pendingA].vir = true; vowelCount--; pendingA = -1; } continue; }
        if (idx === 0x01) { units.push({ t: si ? 'm̐' : 'n', type: 'm' }); continue; }
        if (idx === 0x02) { units.push({ t: si ? 'ṃ' : (sc === 'bn' ? 'ng' : 'm'), type: 'm', anu: sc !== 'bn' }); continue; }
        if (cp === 0x9CE) { units.push({ t: 't', type: 'c', fin: true }); pendingA = -1; vowelCount++; continue; }
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
          if (x.vs) o += x.vs; else if (x.a) { var last = k === units.length - 1 || units[k + 1].type === 'p'; if ((sc === 'hi' || sc === 'bn') && last && vowelCount >= 2 && !x.g) { } else o += (sc === 'bn' ? 'o' : 'a'); }
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
