/* Bhasha core. DOM-free so Node can test it. */
(function (B) {
  'use strict';
  // ---------- languages
  B.LANGS = { te: { name: 'Telugu', native: 'తెలుగు', bcp: 'te-IN', script: 'Telugu' }, hi: { name: 'Hindi', native: 'हिन्दी', bcp: 'hi-IN', script: 'Devanagari' }, kn: { name: 'Kannada', native: 'ಕನ್ನಡ', bcp: 'kn-IN', script: 'Kannada' }, ta: { name: 'Tamil', native: 'தமிழ்', bcp: 'ta-IN', script: 'Tamil' }, ml: { name: 'Malayalam', native: 'മലയാളം', bcp: 'ml-IN', script: 'Malayalam' }, bn: { name: 'Bengali', native: 'বাংলা', bcp: 'bn-IN', script: 'Bengali' }, mr: { name: 'Marathi', native: 'मराठी', bcp: 'mr-IN', script: 'Devanagari' }, ko: { name: 'Korean', native: '한국어', bcp: 'ko-KR', script: 'Hangul' }, gu: { name: 'Gujarati', native: 'ગુજરાતી', bcp: 'gu-IN', script: 'Gujarati' }, as: { name: 'Assamese', native: 'অসমীয়া', bcp: 'as-IN', script: 'Bengali' }, fr: { name: 'French', native: 'Français', bcp: 'fr-FR', script: 'Latin' }, es: { name: 'Spanish', native: 'Español', bcp: 'es-ES', script: 'Latin' }, de: { name: 'German', native: 'Deutsch', bcp: 'de-DE', script: 'Latin' } };
  B.LEARN = ['te', 'hi', 'kn', 'ta', 'ml', 'bn', 'mr', 'gu', 'as', 'ko', 'es', 'de', 'fr']; // languages with phrasebook, voice and Say it
  B.SCRIPT_LANGS = ['te', 'hi', 'kn', 'ta', 'ml', 'bn', 'mr', 'gu', 'as', 'ko']; // languages with a script chart
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
  function script(cp) { if (cp >= 0x900 && cp < 0x980) return 'hi'; if (cp >= 0x980 && cp < 0xA00) return 'bn'; if ((cp >= 0xAC00 && cp <= 0xD7A3) || (cp >= 0x3131 && cp <= 0x3163) || (cp >= 0x1100 && cp <= 0x11FF)) return 'ko'; if (cp >= 0xB80 && cp < 0xC00) return 'ta'; if (cp >= 0xC00 && cp < 0xC80) return 'te'; if (cp >= 0xC80 && cp < 0xD00) return 'kn'; if (cp >= 0xA80 && cp < 0xB00) return 'gu'; if (cp >= 0xD00 && cp < 0xD80) return 'ml'; return null; }
  B.isBrahmic = function (s) { for (var i = 0; i < s.length; i++) if (script(s.charCodeAt(i))) return true; return false; };

  // Bengali-specific values (index = offset in the Bengali block): inherent vowel is 'o'
  var BN_V = { 5: ['o', 'ô'], 6: ['a', 'ā'], 7: ['i', 'i'], 8: ['i', 'ī'], 9: ['u', 'u'], 10: ['u', 'ū'], 11: ['ri', 'ṛ'], 12: ['li', 'ḷ'], 15: ['e', 'e'], 16: ['oi', 'ai'], 19: ['o', 'o'], 20: ['ou', 'au'] };
  var BN_S = { 0x3E: 6, 0x3F: 7, 0x40: 8, 0x41: 9, 0x42: 10, 0x43: 11, 0x47: 15, 0x48: 16, 0x4B: 19, 0x4C: 20 };
  var AS_C = { 0x16: ['kh', 'kh'], 0x1A: ['s', 'c'], 0x1B: ['s', 'ch'], 0x1C: ['z', 'j'], 0x1D: ['z', 'jh'], 0x2F: ['z', 'y'], 0x36: ['x', 'ś'], 0x37: ['x', 'ṣ'], 0x38: ['x', 's'] };
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
  B.translit = function (str, scheme, lang) {
    var si = scheme === 'iast' ? 1 : 0, out = '', i = 0, n = str.length;
    // split into runs of one script so word-level rules (schwa, Tamil voicing) can apply
    var token = [], res = [];
    function flush() { if (token.length) { res.push(word(token.join(''))); token = []; } }
    for (i = 0; i < n; i++) { var cp = str.charCodeAt(i), sc = script(cp); if (sc || (token.length && (cp === 0x200C || cp === 0x200D))) token.push(str[i]); else { flush(); res.push(str[i]); } }
    flush(); return res.join('');
    function word(w) {
      if (script(w.charCodeAt(0)) === 'ko') return hangul(w);
      var units = [], k, cp, sc = script(w.charCodeAt(0)), base = BASES[sc], AS = lang === 'as' || /[\u09F0\u09F1]/.test(w), pendingA = -1, vowelCount = 0, prevVowel = false, prevNasalVir = false;
      if (sc === 'gu') { sc = 'hi'; base = 0xA80; }
      for (k = 0; k < w.length; k++) {
        cp = w.charCodeAt(k); var idx = cp - base;
        if (cp === 0x200C || cp === 0x200D) continue;
        if (sc === 'ml' && CHILLU[cp]) { var ch = CHILLU[cp][si]; units.push({ t: ch, type: 'c', fin: true }); pendingA = -1; vowelCount++; continue; }
        if (idx >= 5 && idx <= 20 && (sc === 'bn' ? BN_V[idx] : VOW[idx])) { units.push({ t: (sc === 'bn' ? BN_V : VOW)[idx][si], type: 'v' }); pendingA = -1; vowelCount++; continue; }
        if (sc === 'bn' && (cp === 0x9F0 || cp === 0x9F1)) { var c0 = cp === 0x9F0 ? ['r', 'r'] : ['w', 'w']; units.push({ t: c0[si], type: 'c', idx: cp === 0x9F0 ? 0x30 : 0x35, a: true }); pendingA = units.length - 1; vowelCount++; continue; }
        if ((idx >= 0x15 && idx <= 0x39) || NUKTA[idx] && (sc === 'hi' || sc === 'bn')) {
          var c = ((sc === 'hi' || sc === 'bn') && NUKTA[idx]) ? NUKTA[idx] : (sc === 'bn' && AS && AS_C[idx]) ? AS_C[idx] : (sc === 'bn' && BN_C[idx]) ? BN_C[idx] : CON[idx]; if (!c) continue;
          if (sc === 'bn' && AS && idx === 0x37 && units.length && units[units.length - 1].vir && units[units.length - 1].idx === 0x15) { units[units.length - 1].t = ''; c = ['kh', 'kṣ']; }
          if (sc === 'bn' && !AS && idx === 0x2F && units.length && units[units.length - 1].vir && units[units.length - 1].type === 'c' && units[units.length - 1].idx !== 0x39) { var pu = units[units.length - 1]; pu.t = pu.t + pu.t; pu.vir = false; pu.a = true; pu.g = true; pendingA = units.length - 1; vowelCount++; continue; }
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
  B.SCRIPTS.bn = { vowels: sp('অ আ ই ঈ উ ঊ ঋ এ ঐ ও ঔ'), cons: sp('ক খ গ ঘ ঙ চ ছ জ ঝ ঞ ট ঠ ড ঢ ণ ত থ দ ধ ন প ফ ব ভ ম য র ল শ ষ স হ ড় ঢ় য় ৎ'), signs: sp('া ি ী ু ূ ৃ ে ৈ ো ৌ'), base: 'ক', digits: sp('০ ১ ২ ৩ ৪ ৫ ৬ ৭ ৮ ৯') };
  B.SCRIPTS.mr = { vowels: B.SCRIPTS.hi.vowels, cons: B.SCRIPTS.hi.cons.concat(['ळ']), signs: B.SCRIPTS.hi.signs, base: B.SCRIPTS.hi.base, digits: B.SCRIPTS.hi.digits };
  B.SCRIPTS.ko = { vowels: sp('ㅏ ㅑ ㅓ ㅕ ㅗ ㅛ ㅜ ㅠ ㅡ ㅣ ㅐ ㅔ'), cons: sp('ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅅ ㅇ ㅈ ㅊ ㅋ ㅌ ㅍ ㅎ ㄲ ㄸ ㅃ ㅆ ㅉ'), signs: sp('가 갸 거 겨 고 교 구 규 그 기 개 게'), base: 'ㄱ', full: true, digits: sp('영 일 이 삼 사 오 육 칠 팔 구') };
  B.PHRASE_CATS = ['greet', 'intro', 'daily', 'food', 'travel', 'shop', 'health', 'people', 'time', 'num'];
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
    ['today', 'time', 'Today', 'ఈ రోజు', 'आज', 'ಇಂದು', 'இன்று', 'ഇന്ന്'],
    ['tomorrow', 'time', 'Tomorrow', 'రేపు', 'आने वाला कल', 'ನಾಳೆ', 'நாளை', 'നാളെ'],
    ['yesterday', 'time', 'Yesterday', 'నిన్న', 'बीता हुआ कल', 'ನಿನ್ನೆ', 'நேற்று', 'ഇന്നലെ']
  ];
  var N = [['one', 'One', 'ఒకటి', 'एक', 'ಒಂದು', 'ஒன்று', 'ഒന്ന്'], ['two', 'Two', 'రెండు', 'दो', 'ಎರಡು', 'இரண்டு', 'രണ്ട്'], ['three', 'Three', 'మూడు', 'तीन', 'ಮೂರು', 'மூன்று', 'മൂന്ന്'], ['four', 'Four', 'నాలుగు', 'चार', 'ನಾಲ್ಕು', 'நான்கு', 'നാല്'], ['five', 'Five', 'ఐదు', 'पाँच', 'ಐದು', 'ஐந்து', 'അഞ്ച്'], ['six', 'Six', 'ఆరు', 'छह', 'ಆರು', 'ஆறு', 'ആറ്'], ['seven', 'Seven', 'ఏడు', 'सात', 'ಏಳು', 'ஏழு', 'ഏഴ്'], ['eight', 'Eight', 'ఎనిమిది', 'आठ', 'ಎಂಟು', 'எட்டு', 'എട്ട്'], ['nine', 'Nine', 'తొమ్మిది', 'नौ', 'ಒಂಬತ್ತು', 'ஒன்பது', 'ഒമ്പത്'], ['ten', 'Ten', 'పది', 'दस', 'ಹತ್ತು', 'பத்து', 'പത്ത്']];
  var IDX = { te: 3, hi: 4, kn: 5, ta: 6, ml: 7 };
  B.PHRASES = P.map(function (r) { var o = { id: r[0], cat: r[1], en: r[2] }; ['te', 'hi', 'kn', 'ta', 'ml'].forEach(function (l) { o[l] = r[IDX[l]]; }); return o; }).concat(N.map(function (r) { var o = { id: 'n-' + r[0], cat: 'num', en: r[1] }; ['te', 'hi', 'kn', 'ta', 'ml'].forEach(function (l) { o[l] = r[IDX[l] - 1]; }); return o; }));
  var X = {"hello": ["নমস্কার", "नमस्कार", "Hola", "안녕하세요", "Hallo"], "morning": ["সুপ্রভাত", "शुभ प्रभात", "Buenos días", "좋은 아침이에요", "Guten Morgen"], "night": ["শুভ রাত্রি", "शुभ रात्री", "Buenas noches", "안녕히 주무세요", "Gute Nacht"], "bye": ["আবার দেখা হবে", "पुन्हा भेटू", "Hasta pronto", "또 만나요", "Bis bald"], "thanks": ["ধন্যবাদ", "धन्यवाद", "Gracias", "감사합니다", "Danke"], "welcome": ["কোনো সমস্যা নেই", "काही हरकत नाही", "De nada", "천만에요", "Gern geschehen"], "please": ["দয়া করে", "कृपया", "Por favor", "부탁합니다", "Bitte"], "sorry": ["দুঃখিত", "क्षमा करा", "Lo siento", "죄송합니다", "Entschuldigung"], "yes": ["হ্যাঁ", "हो", "Sí", "네", "Ja"], "no": ["না", "नाही", "No", "아니요", "Nein"], "name-q": ["আপনার নাম কী?", "तुमचे नाव काय आहे?", "¿Cómo te llamas?", "이름이 뭐예요?", "Wie heißen Sie?"], "name-is": ["আমার নাম …", "माझे नाव … आहे.", "Me llamo …", "제 이름은 …이에요.", "Ich heiße …"], "from-q": ["আপনি কোথা থেকে এসেছেন?", "तुम्ही कुठून आलात?", "¿De dónde eres?", "어디에서 오셨어요?", "Woher kommen Sie?"], "from-india": ["আমি ভারত থেকে এসেছি।", "मी भारतातून आलो आहे.", "Soy de India.", "저는 인도에서 왔어요.", "Ich komme aus Indien."], "nice": ["আপনার সঙ্গে দেখা হয়ে ভালো লাগল।", "तुम्हाला भेटून आनंद झाला.", "Mucho gusto.", "만나서 반갑습니다.", "Freut mich."], "how": ["আপনি কেমন আছেন?", "तुम्ही कसे आहात?", "¿Cómo estás?", "어떻게 지내세요?", "Wie geht es Ihnen?"], "fine": ["আমি ভালো আছি।", "मी ठीक आहे.", "Estoy bien.", "저는 잘 지내요.", "Mir geht es gut."], "dont-understand": ["আমি বুঝতে পারছি না।", "मला समजले नाही.", "No entiendo.", "이해가 안 돼요.", "Ich verstehe nicht."], "english-q": ["আপনি কি ইংরেজি বলতে পারেন?", "तुम्ही इंग्रजी बोलता का?", "¿Hablas inglés?", "영어 할 수 있어요?", "Sprechen Sie Englisch?"], "slowly": ["দয়া করে ধীরে বলুন।", "कृपया हळू बोला.", "Por favor, habla despacio.", "천천히 말해 주세요.", "Bitte sprechen Sie langsam."], "price": ["এটার দাম কত?", "याची किंमत किती आहे?", "¿Cuánto cuesta esto?", "이거 얼마예요?", "Wie viel kostet das?"], "toilet": ["টয়লেট কোথায়?", "शौचालय कुठे आहे?", "¿Dónde está el baño?", "화장실이 어디예요?", "Wo ist die Toilette?"], "help": ["আমার সাহায্য দরকার।", "मला मदत हवी आहे.", "Necesito ayuda.", "도와주세요.", "Ich brauche Hilfe."], "water": ["দয়া করে জল দিন।", "कृपया पाणी द्या.", "Agua, por favor.", "물 주세요.", "Wasser, bitte."], "hungry": ["আমার খিদে পেয়েছে।", "मला भूक लागली आहे.", "Tengo hambre.", "배고파요.", "Ich habe Hunger."], "delicious": ["খাবারটা খুব সুস্বাদু।", "जेवण खूप चविष्ट आहे.", "La comida está deliciosa.", "음식이 정말 맛있어요.", "Das Essen ist köstlich."], "bus": ["বাস স্টপ কোথায়?", "बस स्टॉप कुठे आहे?", "¿Dónde está la parada de autobús?", "버스 정류장이 어디예요?", "Wo ist die Bushaltestelle?"], "doctor": ["দয়া করে একজন ডাক্তার ডাকুন।", "कृपया डॉक्टरांना बोलवा.", "Por favor, llame a un médico.", "의사를 불러 주세요.", "Bitte rufen Sie einen Arzt."], "time": ["এখন কটা বাজে?", "आता किती वाजले आहेत?", "¿Qué hora es?", "지금 몇 시예요?", "Wie spät ist es?"], "learn": ["আমি বাংলা শিখতে চাই।", "मला मराठी शिकायची आहे.", "Quiero aprender español.", "저는 한국어를 배우고 싶어요.", "Ich möchte Deutsch lernen."], "today": ["আজ", "आज", "Hoy", "오늘", "Heute"], "tomorrow": ["আগামীকাল", "उद्या", "Mañana", "내일", "Morgen"], "yesterday": ["গতকাল", "काल", "Ayer", "어제", "Gestern"], "n-one": ["এক", "एक", "Uno", "하나", "Eins"], "n-two": ["দুই", "दोन", "Dos", "둘", "Zwei"], "n-three": ["তিন", "तीन", "Tres", "셋", "Drei"], "n-four": ["চার", "चार", "Cuatro", "넷", "Vier"], "n-five": ["পাঁচ", "पाच", "Cinco", "다섯", "Fünf"], "n-six": ["ছয়", "सहा", "Seis", "여섯", "Sechs"], "n-seven": ["সাত", "सात", "Siete", "일곱", "Sieben"], "n-eight": ["আট", "आठ", "Ocho", "여덟", "Acht"], "n-nine": ["নয়", "नऊ", "Nueve", "아홉", "Neun"], "n-ten": ["দশ", "दहा", "Diez", "열", "Zehn"]};
  var XL = ['bn', 'mr', 'es', 'ko', 'de'];
  B.PHRASES.forEach(function (p) { var r = X[p.id]; if (r) XL.forEach(function (l, i) { p[l] = r[i]; }); });
  var Q = [["mon", "time", "Monday", "సోమవారం", "सोमवार", "ಸೋಮವಾರ", "திங்கள்", "തിങ്കൾ", "সোমবার", "सोमवार", "lunes", "월요일", "Montag"], ["tue", "time", "Tuesday", "మంగళవారం", "मंगलवार", "ಮಂಗಳವಾರ", "செவ்வாய்", "ചൊവ്വ", "মঙ্গলবার", "मंगळवार", "martes", "화요일", "Dienstag"], ["wed", "time", "Wednesday", "బుధవారం", "बुधवार", "ಬುಧವಾರ", "புதன்", "ബുധൻ", "বুধবার", "बुधवार", "miércoles", "수요일", "Mittwoch"], ["thu", "time", "Thursday", "గురువారం", "गुरुवार", "ಗುರುವಾರ", "வியாழன்", "വ്യാഴം", "বৃহস্পতিবার", "गुरुवार", "jueves", "목요일", "Donnerstag"], ["fri", "time", "Friday", "శుక్రవారం", "शुक्रवार", "ಶುಕ್ರವಾರ", "வெள்ளி", "വെള്ളി", "শুক্রবার", "शुक्रवार", "viernes", "금요일", "Freitag"], ["sat", "time", "Saturday", "శనివారం", "शनिवार", "ಶನಿವಾರ", "சனி", "ശനി", "শনিবার", "शनिवार", "sábado", "토요일", "Samstag"], ["sun", "time", "Sunday", "ఆదివారం", "रविवार", "ಭಾನುವಾರ", "ஞாயிறு", "ഞായർ", "রবিবার", "रविवार", "domingo", "일요일", "Sonntag"], ["rice", "food", "Rice", "అన్నం", "चावल", "ಅನ್ನ", "சாதம்", "ചോറ്", "ভাত", "भात", "Arroz", "밥", "Reis"], ["bread", "food", "Bread", "రొట్టె", "ब्रेड", "ಬ್ರೆಡ್", "ரொட்டி", "ബ്രെഡ്", "পাউরুটি", "ब्रेड", "Pan", "빵", "Brot"], ["tea", "food", "Tea", "టీ", "चाय", "ಚಹಾ", "தேநீர்", "ചായ", "চা", "चहा", "Té", "차", "Tee"], ["coffee", "food", "Coffee", "కాఫీ", "कॉफ़ी", "ಕಾಫಿ", "காபி", "കാപ്പി", "কফি", "कॉफी", "Café", "커피", "Kaffee"], ["milk", "food", "Milk", "పాలు", "दूध", "ಹಾಲು", "பால்", "പാൽ", "দুধ", "दूध", "Leche", "우유", "Milch"], ["veg", "food", "Vegetables", "కూరగాయలు", "सब्ज़ियाँ", "ತರಕಾರಿಗಳು", "காய்கறிகள்", "പച്ചക്കറികൾ", "সবজি", "भाज्या", "Verduras", "채소", "Gemüse"], ["fruit", "food", "Fruit", "పండ్లు", "फल", "ಹಣ್ಣುಗಳು", "பழங்கள்", "പഴങ്ങൾ", "ফল", "फळे", "Fruta", "과일", "Obst"], ["vegetarian", "food", "I am vegetarian.", "నేను శాకాహారిని.", "मैं शाकाहारी हूँ।", "ನಾನು ಸಸ್ಯಾಹಾರಿ.", "நான் சைவம்.", "ഞാൻ സസ്യാഹാരിയാണ്.", "আমি নিরামিষাশী।", "मी शाकाहारी आहे.", "Soy vegetariano.", "저는 채식주의자예요.", "Ich bin Vegetarier."], ["notspicy", "food", "Not spicy, please.", "కారం వద్దు, దయచేసి.", "कृपया तीखा नहीं।", "ದಯವಿಟ್ಟು ಖಾರ ಬೇಡ.", "தயவுசெய்து காரம் வேண்டாம்.", "ദയവായി എരിവ് വേണ്ട.", "দয়া করে ঝাল দেবেন না।", "कृपया तिखट नको.", "Sin picante, por favor.", "맵지 않게 해 주세요.", "Nicht scharf, bitte."], ["bill", "food", "The bill, please.", "దయచేసి బిల్లు ఇవ్వండి.", "कृपया बिल दीजिए।", "ದಯವಿಟ್ಟು ಬಿಲ್ ಕೊಡಿ.", "தயவுசெய்து பில் கொடுங்கள்.", "ദയവായി ബിൽ തരൂ.", "দয়া করে বিলটা দিন।", "कृपया बिल द्या.", "La cuenta, por favor.", "계산서 주세요.", "Die Rechnung, bitte."], ["station", "travel", "Where is the railway station?", "రైల్వే స్టేషన్ ఎక్కడ ఉంది?", "रेलवे स्टेशन कहाँ है?", "ರೈಲ್ವೆ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?", "ரயில் நிலையம் எங்கே இருக்கிறது?", "റെയിൽവേ സ്റ്റേഷൻ എവിടെയാണ്?", "রেলস্টেশন কোথায়?", "रेल्वे स्टेशन कुठे आहे?", "¿Dónde está la estación de tren?", "기차역이 어디예요?", "Wo ist der Bahnhof?"], ["airport", "travel", "Where is the airport?", "విమానాశ్రయం ఎక్కడ ఉంది?", "हवाई अड्डा कहाँ है?", "ವಿಮಾನ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?", "விமான நிலையம் எங்கே இருக்கிறது?", "വിമാനത്താവളം എവിടെയാണ്?", "বিমানবন্দর কোথায়?", "विमानतळ कुठे आहे?", "¿Dónde está el aeropuerto?", "공항이 어디예요?", "Wo ist der Flughafen?"], ["hotel", "travel", "Where is the hotel?", "హోటల్ ఎక్కడ ఉంది?", "होटल कहाँ है?", "ಹೋಟೆಲ್ ಎಲ್ಲಿದೆ?", "ஹோட்டல் எங்கே இருக்கிறது?", "ഹോട്ടൽ എവിടെയാണ്?", "হোটেল কোথায়?", "हॉटेल कुठे आहे?", "¿Dónde está el hotel?", "호텔이 어디예요?", "Wo ist das Hotel?"], ["taxi", "travel", "I need a taxi.", "నాకు టాక్సీ కావాలి.", "मुझे टैक्सी चाहिए।", "ನನಗೆ ಟ್ಯಾಕ್ಸಿ ಬೇಕು.", "எனக்கு டாக்ஸி வேண்டும்.", "എനിക്ക് ടാക്സി വേണം.", "আমার একটা ট্যাক্সি দরকার।", "मला टॅक्सी हवी आहे.", "Necesito un taxi.", "택시가 필요해요.", "Ich brauche ein Taxi."], ["far", "travel", "How far is it?", "ఎంత దూరం?", "कितनी दूर है?", "ಎಷ್ಟು ದೂರ?", "எவ்வளவு தூரம்?", "എത്ര ദൂരമുണ്ട്?", "কত দূর?", "किती दूर आहे?", "¿A qué distancia está?", "얼마나 멀어요?", "Wie weit ist es?"], ["left", "travel", "Turn left.", "ఎడమకు తిరగండి.", "बाएँ मुड़िए।", "ಎಡಕ್ಕೆ ತಿರುಗಿ.", "இடதுபுறம் திரும்புங்கள்.", "ഇടത്തേക്ക് തിരിയുക.", "বাঁয়ে ঘুরুন।", "डावीकडे वळा.", "Gire a la izquierda.", "왼쪽으로 가세요.", "Biegen Sie links ab."], ["right", "travel", "Turn right.", "కుడికి తిరగండి.", "दाएँ मुड़िए।", "ಬಲಕ್ಕೆ ತಿರುಗಿ.", "வலதுபுறம் திரும்புங்கள்.", "വലത്തേക്ക് തിരിയുക.", "ডানে ঘুরুন।", "उजवीकडे वळा.", "Gire a la derecha.", "오른쪽으로 가세요.", "Biegen Sie rechts ab."], ["straight", "travel", "Go straight.", "నేరుగా వెళ్ళండి.", "सीधे जाइए।", "ನೇರವಾಗಿ ಹೋಗಿ.", "நேராகச் செல்லுங்கள்.", "നേരെ പോകുക.", "সোজা যান।", "सरळ जा.", "Siga recto.", "직진하세요.", "Gehen Sie geradeaus."], ["stop", "travel", "Please stop here.", "దయచేసి ఇక్కడ ఆపండి.", "कृपया यहाँ रोकिए।", "ದಯವಿಟ್ಟು ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ.", "தயவுசெய்து இங்கே நிறுத்துங்கள்.", "ദയവായി ഇവിടെ നിർത്തൂ.", "দয়া করে এখানে থামুন।", "कृपया इथे थांबवा.", "Pare aquí, por favor.", "여기서 세워 주세요.", "Bitte halten Sie hier an."], ["ticket", "travel", "One ticket, please.", "దయచేసి ఒక టికెట్ ఇవ్వండి.", "कृपया एक टिकट दीजिए।", "ದಯವಿಟ್ಟು ಒಂದು ಟಿಕೆಟ್ ಕೊಡಿ.", "தயவுசெய்து ஒரு டிக்கெட் கொடுங்கள்.", "ദയവായി ഒരു ടിക്കറ്റ് തരൂ.", "দয়া করে একটা টিকিট দিন।", "कृपया एक तिकीट द्या.", "Un billete, por favor.", "표 한 장 주세요.", "Eine Fahrkarte, bitte."], ["hospital", "travel", "Where is the hospital?", "ఆసుపత్రి ఎక్కడ ఉంది?", "अस्पताल कहाँ है?", "ಆಸ್ಪತ್ರೆ ಎಲ್ಲಿದೆ?", "மருத்துவமனை எங்கே இருக்கிறது?", "ആശുപത്രി എവിടെയാണ്?", "হাসপাতাল কোথায়?", "रुग्णालय कुठे आहे?", "¿Dónde está el hospital?", "병원이 어디예요?", "Wo ist das Krankenhaus?"], ["lost", "travel", "I am lost.", "నేను దారి తప్పిపోయాను.", "मैं रास्ता भूल गया हूँ।", "ನಾನು ದಾರಿ ತಪ್ಪಿದ್ದೇನೆ.", "நான் வழி தவறிவிட்டேன்.", "ഞാൻ വഴി തെറ്റിപ്പോയി.", "আমি পথ হারিয়ে ফেলেছি।", "मी रस्ता हरवलो आहे.", "Estoy perdido.", "길을 잃었어요.", "Ich habe mich verlaufen."], ["expensive", "shop", "It is too expensive.", "ఇది చాలా ఖరీదు.", "यह बहुत महँगा है।", "ಇದು ತುಂಬಾ ದುಬಾರಿ.", "இது மிகவும் விலை அதிகம்.", "ഇത് വളരെ വിലയേറിയതാണ്.", "এটা খুব দামি।", "हे खूप महाग आहे.", "Es demasiado caro.", "너무 비싸요.", "Das ist zu teuer."], ["reduce", "shop", "Can you reduce the price?", "ధర తగ్గిస్తారా?", "क्या आप दाम कम कर सकते हैं?", "ಬೆಲೆ ಕಡಿಮೆ ಮಾಡುತ್ತೀರಾ?", "விலையைக் குறைக்க முடியுமா?", "വില കുറയ്ക്കാമോ?", "দাম কি একটু কমাতে পারেন?", "तुम्ही किंमत कमी करू शकता का?", "¿Puede bajar el precio?", "가격을 깎아 주실 수 있어요?", "Können Sie den Preis senken?"], ["take", "shop", "I will take this.", "నేను ఇది తీసుకుంటాను.", "मैं यह ले लूँगा।", "ನಾನು ಇದನ್ನು ತೆಗೆದುಕೊಳ್ಳುತ್ತೇನೆ.", "நான் இதை எடுத்துக்கொள்கிறேன்.", "ഞാൻ ഇത് എടുക്കാം.", "আমি এটা নেব।", "मी हे घेतो.", "Me llevo esto.", "이걸로 할게요.", "Ich nehme das."], ["card", "shop", "Do you accept cards?", "మీరు కార్డులు తీసుకుంటారా?", "क्या आप कार्ड लेते हैं?", "ನೀವು ಕಾರ್ಡ್ ಸ್ವೀಕರಿಸುತ್ತೀರಾ?", "நீங்கள் கார்டு ஏற்கிறீர்களா?", "നിങ്ങൾ കാർഡ് സ്വീകരിക്കുമോ?", "আপনারা কি কার্ড নেন?", "तुम्ही कार्ड घेता का?", "¿Aceptan tarjetas?", "카드 되나요?", "Akzeptieren Sie Karten?"], ["market", "shop", "Where is the market?", "మార్కెట్ ఎక్కడ ఉంది?", "बाज़ार कहाँ है?", "ಮಾರುಕಟ್ಟೆ ಎಲ್ಲಿದೆ?", "சந்தை எங்கே இருக்கிறது?", "ചന്ത എവിടെയാണ്?", "বাজার কোথায়?", "बाजार कुठे आहे?", "¿Dónde está el mercado?", "시장이 어디예요?", "Wo ist der Markt?"], ["another", "shop", "Please show me another one.", "దయచేసి ఇంకొకటి చూపించండి.", "कृपया दूसरा दिखाइए।", "ದಯವಿಟ್ಟು ಇನ್ನೊಂದನ್ನು ತೋರಿಸಿ.", "தயவுசெய்து இன்னொன்றைக் காட்டுங்கள்.", "ദയവായി മറ്റൊന്ന് കാണിക്കൂ.", "দয়া করে আরেকটা দেখান।", "कृपया दुसरे दाखवा.", "Muéstreme otro, por favor.", "다른 것을 보여 주세요.", "Zeigen Sie mir bitte ein anderes."], ["sick", "health", "I am not well.", "నాకు ఆరోగ్యం బాగాలేదు.", "मेरी तबीयत ठीक नहीं है।", "ನನ್ನ ಆರೋಗ್ಯ ಚೆನ್ನಾಗಿಲ್ಲ.", "எனக்கு உடம்பு சரியில்லை.", "എനിക്ക് സുഖമില്ല.", "আমার শরীর ভালো নেই।", "मला बरे वाटत नाही.", "No me siento bien.", "몸이 안 좋아요.", "Mir geht es nicht gut."], ["headache", "health", "I have a headache.", "నాకు తలనొప్పిగా ఉంది.", "मेरे सिर में दर्द है।", "ನನಗೆ ತಲೆನೋವು ಇದೆ.", "எனக்குத் தலைவலிக்கிறது.", "എനിക്ക് തലവേദനയുണ്ട്.", "আমার মাথা ব্যথা করছে।", "माझे डोके दुखत आहे.", "Me duele la cabeza.", "머리가 아파요.", "Ich habe Kopfschmerzen."], ["police", "health", "Please call the police.", "దయచేసి పోలీసులను పిలవండి.", "कृपया पुलिस को बुलाइए।", "ದಯವಿಟ್ಟು ಪೊಲೀಸರನ್ನು ಕರೆಯಿರಿ.", "தயவுசெய்து காவல்துறையை அழையுங்கள்.", "ദയവായി പോലീസിനെ വിളിക്കൂ.", "দয়া করে পুলিশ ডাকুন।", "कृपया पोलिसांना बोलवा.", "Por favor, llame a la policía.", "경찰을 불러 주세요.", "Bitte rufen Sie die Polizei."], ["ambulance", "health", "Please call an ambulance.", "దయచేసి అంబులెన్స్‌ని పిలవండి.", "कृपया एम्बुलेंस बुलाइए।", "ದಯವಿಟ್ಟು ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಯಿರಿ.", "தயவுசெய்து ஆம்புலன்ஸை அழையுங்கள்.", "ദയവായി ആംബുലൻസ് വിളിക്കൂ.", "দয়া করে অ্যাম্বুলেন্স ডাকুন।", "कृपया रुग्णवाहिका बोलवा.", "Por favor, llame a una ambulancia.", "구급차를 불러 주세요.", "Bitte rufen Sie einen Krankenwagen."], ["medicine", "health", "I need medicine.", "నాకు మందు కావాలి.", "मुझे दवा चाहिए।", "ನನಗೆ ಔಷಧಿ ಬೇಕು.", "எனக்கு மருந்து வேண்டும்.", "എനിക്ക് മരുന്ന് വേണം.", "আমার ওষুধ দরকার।", "मला औषध हवे आहे.", "Necesito medicina.", "약이 필요해요.", "Ich brauche Medikamente."], ["hurts", "health", "It hurts here.", "ఇక్కడ నొప్పిగా ఉంది.", "यहाँ दर्द हो रहा है।", "ಇಲ್ಲಿ ನೋವಾಗುತ್ತಿದೆ.", "இங்கே வலிக்கிறது.", "ഇവിടെ വേദനയുണ്ട്.", "এখানে ব্যথা করছে।", "इथे दुखत आहे.", "Me duele aquí.", "여기가 아파요.", "Es tut hier weh."], ["love", "people", "I love you.", "నేను నిన్ను ప్రేమిస్తున్నాను.", "मैं तुमसे प्यार करता हूँ।", "ನಾನು ನಿನ್ನನ್ನು ಪ್ರೀತಿಸುತ್ತೇನೆ.", "நான் உன்னை நேசிக்கிறேன்.", "ഞാൻ നിന്നെ സ്നേഹിക്കുന്നു.", "আমি তোমাকে ভালোবাসি।", "माझे तुझ्यावर प्रेम आहे.", "Te quiero.", "사랑해요.", "Ich liebe dich."], ["happy", "people", "I am happy.", "నేను సంతోషంగా ఉన్నాను.", "मैं खुश हूँ।", "ನಾನು ಸಂತೋಷವಾಗಿದ್ದೇನೆ.", "நான் மகிழ்ச்சியாக இருக்கிறேன்.", "ഞാൻ സന്തോഷവാനാണ്.", "আমি খুশি।", "मी आनंदी आहे.", "Estoy feliz.", "저는 행복해요.", "Ich bin glücklich."], ["tired", "people", "I am tired.", "నాకు అలసటగా ఉంది.", "मैं थक गया हूँ।", "ನನಗೆ ಸುಸ್ತಾಗಿದೆ.", "நான் களைப்பாக இருக்கிறேன்.", "എനിക്ക് ക്ഷീണമുണ്ട്.", "আমি ক্লান্ত।", "मी थकलो आहे.", "Estoy cansado.", "피곤해요.", "Ich bin müde."], ["friend", "people", "This is my friend.", "ఇతను నా స్నేహితుడు.", "यह मेरा दोस्त है।", "ಇವರು ನನ್ನ ಸ್ನೇಹಿತ.", "இவர் என் நண்பர்.", "ഇത് എന്റെ സുഹൃത്താണ്.", "ইনি আমার বন্ধু।", "हा माझा मित्र आहे.", "Este es mi amigo.", "이 사람은 제 친구예요.", "Das ist mein Freund."], ["family", "people", "This is my family.", "ఇది నా కుటుంబం.", "यह मेरा परिवार है।", "ಇದು ನನ್ನ ಕುಟುಂಬ.", "இது என் குடும்பம்.", "ഇത് എന്റെ കുടുംബമാണ്.", "এটা আমার পরিবার।", "हे माझे कुटुंब आहे.", "Esta es mi familia.", "이쪽은 제 가족이에요.", "Das ist meine Familie."], ["congrats", "people", "Congratulations!", "అభినందనలు!", "बधाई हो!", "ಅಭಿನಂದನೆಗಳು!", "வாழ்த்துகள்!", "അഭിനന്ദനങ്ങൾ!", "অভিনন্দন!", "अभिनंदन!", "¡Felicidades!", "축하합니다!", "Herzlichen Glückwunsch!"], ["birthday", "people", "Happy birthday!", "పుట్టినరోజు శుభాకాంక్షలు!", "जन्मदिन मुबारक हो!", "ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು!", "பிறந்தநாள் வாழ்த்துகள்!", "ജന്മദിനാശംസകൾ!", "শুভ জন্মদিন!", "वाढदिवसाच्या शुभेच्छा!", "¡Feliz cumpleaños!", "생일 축하해요!", "Alles Gute zum Geburtstag!"], ["luck", "people", "Good luck!", "శుభం కలగాలి!", "शुभकामनाएँ!", "ಶುಭವಾಗಲಿ!", "நல்வாழ்த்துகள்!", "ആശംസകൾ!", "শুভকামনা!", "शुभेच्छा!", "¡Buena suerte!", "행운을 빌어요!", "Viel Glück!"], ["n-eleven", "num", "Eleven", "పదకొండు", "ग्यारह", "ಹನ್ನೊಂದು", "பதினொன்று", "പതിനൊന്ന്", "এগারো", "अकरा", "Once", "열하나", "Elf"], ["n-twelve", "num", "Twelve", "పన్నెండు", "बारह", "ಹನ್ನೆರಡು", "பன்னிரண்டு", "പന്ത്രണ്ട്", "বারো", "बारा", "Doce", "열둘", "Zwölf"], ["n-fifteen", "num", "Fifteen", "పదిహేను", "पंद्रह", "ಹದಿನೈದು", "பதினைந்து", "പതിനഞ്ച്", "পনেরো", "पंधरा", "Quince", "열다섯", "Fünfzehn"], ["n-twenty", "num", "Twenty", "ఇరవై", "बीस", "ಇಪ್ಪತ್ತು", "இருபது", "ഇരുപത്", "কুড়ি", "वीस", "Veinte", "스물", "Zwanzig"], ["n-thirty", "num", "Thirty", "ముప్పై", "तीस", "ಮೂವತ್ತು", "முப்பது", "മുപ്പത്", "ত্রিশ", "तीस", "Treinta", "서른", "Dreißig"], ["n-fifty", "num", "Fifty", "యాభై", "पचास", "ಐವತ್ತು", "ஐம்பது", "അമ്പത്", "পঞ্চাশ", "पन्नास", "Cincuenta", "쉰", "Fünfzig"], ["n-hundred", "num", "One hundred", "వంద", "सौ", "ನೂರು", "நூறு", "നൂറ്", "একশো", "शंभर", "Cien", "백", "Hundert"], ["n-thousand", "num", "One thousand", "వెయ్యి", "हज़ार", "ಸಾವಿರ", "ஆயிரம்", "ആയിരം", "হাজার", "हजार", "Mil", "천", "Tausend"]];
  var QL = ['te', 'hi', 'kn', 'ta', 'ml', 'bn', 'mr', 'es', 'ko', 'de'];
  Q.forEach(function (r) { var o = { id: r[0], cat: r[1], en: r[2] }; QL.forEach(function (l, i) { o[l] = r[3 + i]; }); B.PHRASES.push(o); });
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
  var UILANGS = ['en', 'hi', 'te', 'kn', 'ta', 'ml', 'bn', 'mr', 'ko', 'es', 'de', 'fr', 'gu', 'as'], MAINSITE = ['en', 'hi', 'te', 'kn', 'ta', 'ml'];
  U.UILANGS = UILANGS; U.MAINSITE = MAINSITE;
  var set = U.set = (function () {
    var s = jget('bh-set', {}), nl = (navigator.language || 'en').toLowerCase().slice(0, 2), sl = store.get('el-lang');
    if (UILANGS.indexOf(s.ui) < 0) s.ui = UILANGS.indexOf(sl) >= 0 ? sl : (UILANGS.indexOf(nl) >= 0 ? nl : 'en');
    if (B.INDIC.indexOf(s.focus) < 0) s.focus = 'te';
    if (s.scheme !== 'iast') s.scheme = 'simple';
    if (s.roman == null) s.roman = true;
    if (!(s.perDay >= 0)) s.perDay = 10;
    if (!(s.rate > 0)) s.rate = 0.9;
    if (['ask', 'yes', 'no'].indexOf(s.ov) < 0) s.ov = 'ask';
    if (s.sound == null) s.sound = true;
    if (s.haptic == null) s.haptic = true;
    s.theme = document.documentElement.getAttribute('data-theme') || 'light';
    return s;
  })();
  U.saveSet = function () { store.set('bh-set', JSON.stringify({ ui: set.ui, focus: set.focus, scheme: set.scheme, roman: set.roman, perDay: set.perDay, rate: set.rate, ov: set.ov, sound: set.sound, haptic: set.haptic })); if (MAINSITE.indexOf(set.ui) >= 0) store.set('el-lang', set.ui); store.set('el-theme', set.theme); };
  U.t = function (k, v) { var d = B.I18N[set.ui] || B.I18N.en, s = d[k]; if (s == null) s = B.I18N.en[k]; if (s == null) s = k; if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]); return s; };
  var t = U.t;
  U.applyTheme = function () { document.documentElement.setAttribute('data-theme', set.theme); var m = $('meta[name=theme-color]'); if (m) m.setAttribute('content', { light: '#1c1b4b', dark: '#1c1b4b', new: '#0b3d3a' }[set.theme]); };
  U.applyLang = function () { document.documentElement.lang = set.ui; };
  var toastT; U.toast = function (m) { var e = $('#toast'); if (!e) return; e.textContent = m; e.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { e.hidden = true; }, 2200); };
  U.langName = function (c) { var a = B.allLangs().filter(function (x) { return x[0] === c; })[0]; return a ? a[1] : c; };
  U.langNative = function (c) { var a = B.allLangs().filter(function (x) { return x[0] === c; })[0]; return a ? a[2] : c; };
  U.roman = function (w, lang) { return B.isBrahmic(w) ? B.translit(w, set.scheme, lang) : ''; };
  U.today = function () { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

  // ---------- speech lives in speech.js (device voices with an offline fallback)

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
      if (opts && opts.roman && B.isBrahmic(w)) { var ru = h('ruby', null, [document.createTextNode(w), h('rt', { text: B.translit(w, set.scheme, lang) })]); el.appendChild(ru); } else el.textContent = w;
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

;
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

;
/* Speech: device voices first, then an optional offline voice (eSpeak NG, GPL-3.0) if the device has none for a language. */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set;
  var sessionNo = false, voices = [], ready = null, tok = 0, dead = {}, engine = null, engineP = null, cache = {}, cacheKeys = [], audioEl = null;
  function load() { try { voices = window.speechSynthesis ? speechSynthesis.getVoices() || [] : []; } catch (e) { voices = []; } }
  U.canSpeak = function () { return 'speechSynthesis' in window; };
  if (U.canSpeak()) { load(); try { speechSynthesis.addEventListener('voiceschanged', load); } catch (e) { } }
  function whenVoices() {
    if (ready) return ready;
    ready = new Promise(function (res) {
      load(); if (voices.length || !U.canSpeak()) return res();
      var done = false; function fin() { if (done) return; done = true; load(); res(); }
      try { speechSynthesis.addEventListener('voiceschanged', fin); } catch (e) { } setTimeout(fin, 1500);
    });
    return ready;
  }
  // best device voice for a language: exact tag first, then same primary language; offline (local) voices win ties
  U.voiceFor = function (lang) {
    var code = B.bcp(lang).toLowerCase().replace('_', '-'), pre = code.split('-')[0], best = null, bs = -1, i, v, tag, sc;
    for (i = 0; i < voices.length; i++) {
      v = voices[i]; tag = (v.lang || '').toLowerCase().replace('_', '-'); if (tag.split('-')[0] !== pre) continue;
      sc = (tag === code ? 2 : 1) + (v.localService ? 0.5 : 0) + (v['default'] ? 0.1 : 0);
      if (sc > bs) { bs = sc; best = v; }
    }
    return dead[lang] ? null : best;
  };
  // ---- offline engine
  var ESP = { en: 'en-us', zh: 'cmn', pt: 'pt-pt', no: 'nb', iw: 'he' };
  function espCode(lang) { return ESP[lang] || lang; }
  function ensureEngine() {
    if (engine) return Promise.resolve(engine);
    if (engineP) return engineP;
    U.toast(t('ovLoading'));
    engineP = Promise.all([import('/vendor/espeak/espeak-ng.js'), fetch('/vendor/espeak/espeak-ng.wasm').then(function (r) { if (!r.ok) throw new Error('wasm'); return r.arrayBuffer(); })]).then(function (x) {
      return WebAssembly.compile(x[1]).then(function (mod) { engine = { factory: x[0].default, mod: mod }; return engine; });
    }).catch(function (e) { engineP = null; throw e; });
    return engineP;
  }
  function synth(text, lang, rate) {
    var wpm = Math.max(80, Math.min(350, Math.round(175 * (rate || set.rate)))), key = lang + '|' + wpm + '|' + text;
    if (cache[key]) return Promise.resolve(cache[key]);
    return ensureEngine().then(function (E) {
      return E.factory({ arguments: ['-v', espCode(lang), '-s', String(wpm), '-w', 'o.wav', ' ' + text], print: function () { }, printErr: function () { }, instantiateWasm: function (imports, ok) { WebAssembly.instantiate(E.mod, imports).then(function (i) { ok(i, E.mod); }); return {}; } });
    }).then(function (m) {
      var d = m.FS.readFile('o.wav'); if (d.length < 500) throw new Error('empty');
      var url = URL.createObjectURL(new Blob([d], { type: 'audio/wav' })); cache[key] = url; cacheKeys.push(key);
      if (cacheKeys.length > 40) { var old = cacheKeys.shift(); try { URL.revokeObjectURL(cache[old]); } catch (e) { } delete cache[old]; }
      return url;
    });
  }
  U.offlineLoaded = function () { return !!engine; };
  function ask(lang) {
    return new Promise(function (res) {
      if (set.ov === 'yes') return res(true); if (set.ov === 'no' || sessionNo) return res(false);
      U.closePopup(); var old = document.getElementById('ov-ask'); if (old) old.remove();
      function done(v, remember) { box.remove(); if (remember) { set.ov = v ? 'yes' : 'no'; U.saveSet(); } res(v); }
      var box = h('div', { class: 'popup', id: 'ov-ask', role: 'alertdialog', 'aria-label': t('ovAskQ', { l: U.langName(lang) }) }, [h('div', { class: 'pw' }, [h('p', { text: t('ovAskQ', { l: U.langName(lang) }) }), h('div', { class: 'pw-row' }, [h('button', { type: 'button', class: 'abtn gold', text: t('ovYes'), onclick: function () { done(true, true); } }), h('button', { type: 'button', class: 'abtn', text: t('ovNo'), onclick: function () { sessionNo = true; done(false, false); } })])])]);
      document.body.appendChild(box); box.querySelector('.gold').focus();
    });
  }
  function fallback(text, lang, onend, rate, my) {
    function fin() { if (onend) onend(); }
    ask(lang).then(function (yes) {
      if (!yes) { U.toast(t('noVoice', { l: U.langName(lang) })); return fin(); }
      return synth(text, lang, rate).then(function (url) {
        if (my !== tok) return;
        if (audioEl) { try { audioEl.pause(); } catch (e) { } }
        audioEl = new Audio(url); audioEl.onended = fin; audioEl.onerror = fin; var p = audioEl.play(); if (p && p.catch) p.catch(function () { U.toast(t('ovFail')); fin(); });
      });
    }).catch(function () { U.toast(t('ovFail')); fin(); });
  }
  // ---- native path with chunking and a watchdog
  function chunks(text, lang) {
    var out = [], cur = ''; B.sentences(text, lang).forEach(function (s) { if ((cur + s).length > 180 && cur) { out.push(cur); cur = s; } else cur += s; }); if (cur.trim()) out.push(cur); return out.length ? out : [text];
  }
  function nativeSpeak(v, text, lang, onend, rate, my) {
    var parts = chunks(text, lang), i = 0;
    function next() {
      if (my !== tok) return; if (i >= parts.length) { if (onend) onend(); return; }
      var u = new SpeechSynthesisUtterance(parts[i++]); u.lang = v.lang || B.bcp(lang); u.voice = v; u.rate = rate || set.rate;
      var started = false, ended = false, wd = setTimeout(function () { if (!started && !ended && my === tok) { dead[lang] = true; try { speechSynthesis.cancel(); } catch (e) { } fallback(parts.slice(i - 1).join(' '), lang, onend, rate, my); } }, 3500);
      u.onstart = function () { started = true; clearTimeout(wd); };
      u.onend = function () { if (ended) return; ended = true; clearTimeout(wd); next(); };
      u.onerror = function (e) { if (ended) return; ended = true; clearTimeout(wd); if (e && (e.error === 'canceled' || e.error === 'interrupted')) return; dead[lang] = true; fallback(parts.slice(i - 1).join(' '), lang, onend, rate, my); };
      try { speechSynthesis.speak(u); } catch (e) { clearTimeout(wd); dead[lang] = true; fallback(parts.slice(i - 1).join(' '), lang, onend, rate, my); }
    }
    try { speechSynthesis.cancel(); } catch (e) { }
    next();
  }
  U.speak = function (text, lang, onend, rate) {
    if (!text) { if (onend) onend(); return false; }
    var my = ++tok; if (audioEl) { try { audioEl.pause(); } catch (e) { } }
    if (!U.canSpeak()) { fallback(text, lang, onend, rate, my); return true; }
    whenVoices().then(function () {
      if (my !== tok) return; load(); var v = U.voiceFor(lang);
      if (v) nativeSpeak(v, text, lang, onend, rate, my); else fallback(text, lang, onend, rate, my);
    });
    return true;
  };
  U.stopSpeak = function () { tok++; try { if (U.canSpeak()) speechSynthesis.cancel(); } catch (e) { } if (audioEl) { try { audioEl.pause(); } catch (e) { } } };
  U.voiceStatus = function (lang) { load(); var v = U.voiceFor(lang); return { device: v ? v.name : null, offline: !!engine, ov: set.ov }; };

  // ---- voice check dialog
  U.openVoiceCheck = function () {
    U.closePopup(); var old = document.getElementById('vc'); if (old) old.remove(); load();
    var box = h('div', { class: 'popup vc', id: 'vc', role: 'dialog', 'aria-label': t('voiceCheck') }), rows = h('div', { class: 'vc-rows' });
    function paint() {
      load(); rows.textContent = '';
      B.LEARN.concat(['en']).forEach(function (l) {
        var v = U.voiceFor(l), st = v ? t('vcDevice') + ': ' + v.name : (engine ? t('vcOffline') : (set.ov === 'no' ? t('vcNone') : t('vcOfflineAvail')));
        var phr = (B.PHRASES.filter(function (p) { return p.id === 'hello'; })[0] || {})[l] || 'Hello';
        rows.appendChild(h('div', { class: 'vc-row' }, [h('div', { class: 'vc-l' }, [h('b', { text: U.langNative(l) }), h('span', { text: ' ' + U.langName(l) })]), h('div', { class: 'vc-s', text: st }), h('button', { type: 'button', class: 'abtn', text: '🔊 ' + t('vcTest'), onclick: function () { U.speak(phr, l, function () { paint(); }, 0.9); } })]));
      });
    }
    var seg = h('div', { class: 'seg', role: 'group', 'aria-label': t('ovLabel') });
    [['ask', t('ovAsk')], ['yes', t('on')], ['no', t('off')]].forEach(function (o) { seg.appendChild(h('button', { type: 'button', 'aria-pressed': String(set.ov === o[0]), text: o[1], onclick: function () { set.ov = o[0]; U.saveSet(); [].forEach.call(seg.children, function (b, i) { b.setAttribute('aria-pressed', String(['ask', 'yes', 'no'][i] === set.ov)); }); paint(); } })); });
    box.appendChild(h('div', { class: 'pw' }, [h('div', { class: 'pw-head' }, [h('h2', { text: t('voiceCheck') }), h('button', { type: 'button', class: 'abtn', 'aria-label': t('close'), text: '✕', onclick: function () { box.remove(); } })]), h('p', { class: 'note', text: t('vcLede') }), rows, h('label', { text: t('ovLabel') }), seg, h('p', { class: 'note', text: t('ovNote') })]));
    document.body.appendChild(box); paint(); whenVoices().then(paint);
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { box.remove(); document.removeEventListener('keydown', esc); } });
  };
})(window.B);

;
/* Bhasha interface text. English is the master; other languages are drafts awaiting native review. */
(function (B) {
  'use strict';
  var I = B.I18N = {};
  I.en = {
    "skip": "Skip to content",
    "settings": "Settings",
    "part": "Part of EknathaLabs",
    "privacyNote": "Runs in your browser. Your files and words stay on your device.",
    "mainNav": "Main",
    "uiLang": "Interface language",
    "focusLang": "Language I am learning",
    "scheme": "Romanization style",
    "schSimple": "Simple",
    "schIast": "Scholarly",
    "showRoman": "Show romanization",
    "on": "On",
    "off": "Off",
    "voiceSpeed": "Voice speed",
    "perDay": "Reviews per session",
    "unlimited": "No limit",
    "theme": "Theme",
    "light": "Light",
    "dark": "Dark",
    "new": "New",
    "language": "Language",
    "allLangs": "All languages",
    "allStatus": "All",
    "auto": "Detect automatically",
    "indianLangs": "Indian languages",
    "otherLangs": "Other languages",
    "nav_watch": "Watch",
    "nav_read": "Read",
    "nav_words": "My words",
    "nav_review": "Review",
    "nav_scripts": "Scripts",
    "nav_phrases": "Phrases",
    "homeH": "Learn spoken languages from what you watch and read",
    "homeSub": "Bring your own video, audio or text. Tap any word to hear it, see how it sounds in English letters, and save it. Review with spaced repetition. Free, private and works offline.",
    "statWords": "Saved words",
    "statDue": "Due today",
    "statStreak": "Day streak",
    "cWatch": "Play your video or audio with two subtitle lines. Tap words, repeat a line, slow it down, shadow the speaker.",
    "cRead": "Paste or open any text. Every word is tappable, with romanization and read-aloud.",
    "cWords": "Everything you saved, with export to CSV, Anki and a backup file.",
    "cReview": "Flashcards that come back just before you forget.",
    "cScripts": "Letters, vowel signs and digits. Hear, quiz and trace them.",
    "cPhrases": "250 everyday phrases in thirteen languages, with romanization and voice.",
    "dueCount": "{n} due",
    "howH": "How it works",
    "how1": "Open a subtitle file with your video, or paste a text.",
    "how2": "Tap a word you do not know. Hear it and save it with a meaning.",
    "how3": "Come back to Review. Cards return at the right time.",
    "how4": "Everything stays on this device. Export any time.",
    "homeNote": "Voices come from your device. Indian-language voices vary by phone and browser. Install one in your system settings if you hear none.",
    "noTts": "This browser cannot speak text aloud.",
    "noVoice": "No {l} voice on this device. Install one in your system settings.",
    "storageFull": "Could not save. Browser storage is full or blocked.",
    "meaning": "Meaning",
    "status": "Status",
    "st0": "New",
    "st1": "Learning",
    "st2": "Known",
    "seenIn": "Also in the phrasebook",
    "speak": "Speak",
    "close": "Close",
    "update": "Update",
    "save": "Save word",
    "saved": "Saved",
    "remove": "Remove",
    "speakSentence": "Read sentence",
    "translateDevice": "Translate on device",
    "trFail": "Translation is not available.",
    "lookup": "Look up",
    "opensTab": "opens a new tab",
    "wordDetails": "Word details",
    "rdLede": "Paste or open a text. Tap any word.",
    "rdPlaceholder": "Paste text in any language here",
    "rdText": "Text to read",
    "rdEmpty": "Nothing to show yet. Paste a text or load the sample.",
    "rdStats": "{n} words, {u} different. {k} known, {l} learning. Language: {lang}",
    "textLang": "Text language",
    "colorWords": "Colour words by status",
    "fontSize": "Text size",
    "readAloud": "Read aloud",
    "stop": "Stop",
    "sample": "Load sample",
    "importTxt": "Open text file",
    "clear": "Clear",
    "clickWord": "Tap a word to see details",
    "wtLede": "Use your own video or audio with a subtitle file. Nothing is uploaded.",
    "wtSetup": "Choose your files",
    "wtDrop": "Drop a video or audio file and subtitle files here, or use the buttons.",
    "wtMedia": "Video or audio",
    "wtSub1": "Subtitles (language you learn)",
    "wtSub2": "Subtitles (your language)",
    "subLang": "Subtitle language",
    "wtStart": "Start",
    "wtSample": "Try the sample (reads aloud)",
    "noSubs": "No subtitles found in {f}. Use .srt or .vtt.",
    "wtPrivacy": "Files are opened inside your browser and never leave your device. Without a video or audio file, the lines are read aloud by your device voice.",
    "wtListenMode": "Listen mode: lines are read aloud",
    "wtTranscript": "Transcript",
    "playPause": "Play or pause",
    "prevLine": "Previous line",
    "nextLine": "Next line",
    "replay": "Replay line",
    "loopLine": "Loop line",
    "autoPause": "Pause after each line",
    "hideTarget": "Hide learning subtitle",
    "hideNative": "Hide my-language subtitle",
    "blurNative": "Blur my language",
    "speed": "Speed",
    "subEarlier": "Show subtitles earlier",
    "subLater": "Show subtitles later",
    "shadow": "Shadow",
    "stopRec": "Stop",
    "yourVoice": "Your voice",
    "orig": "Original",
    "noMic": "Recording is not supported here.",
    "micDenied": "Microphone permission was denied.",
    "wtChange": "Change files",
    "wtKeys": "Keys: Space play/pause, A/D or arrows previous/next, R replay, L loop, P pause after each line.",
    "wdLede": "Your saved words. Stored only in this browser.",
    "wdCount": "{n} shown, {d} due now",
    "wdNoMatch": "No words match.",
    "wdEmpty": "No saved words yet.",
    "wdEmptySub": "Open Read or Watch and tap a word to save it.",
    "wdMore": "{n} more not shown. Use the search.",
    "wdNothing": "Nothing to export.",
    "wdImported": "{n} new words imported.",
    "wdImportFail": "Could not read that file.",
    "wdPrivacy": "Clear your browser data and the list is gone, so export a backup now and then.",
    "search": "Search",
    "edit": "Edit",
    "dueNow": "Due now",
    "dueToday": "Due today",
    "dueIn": "In {n} d",
    "backup": "Backup",
    "importWords": "Import",
    "rvLede": "Flip the card, then rate how well you knew it.",
    "rvMode": "Practice mode",
    "rvW2M": "Word to meaning",
    "rvM2W": "Meaning to word",
    "rvListen": "Listening",
    "rvCloze": "Fill the gap",
    "rvStreak": "Day streak: {n}",
    "rvDone": "Done: {n} cards",
    "rvDoneSub": "Come back later. Cards you missed return in minutes, the rest in days.",
    "rvNone": "Nothing due",
    "rvNoneSub": "You are caught up. Read or watch more to find new words.",
    "rvWhichWord": "What is the word?",
    "rvPlay": "Play word",
    "rvListenQ": "Listen, then recall the meaning",
    "rvHint": "Meaning",
    "rvShow": "Show answer",
    "rvProgress": "Session progress",
    "again": "Again",
    "hard": "Hard",
    "good": "Good",
    "easy": "Easy",
    "scLede": "Learn the letters. Tap any glyph to hear it and trace it.",
    "scVowels": "Vowels",
    "scCons": "Consonants",
    "scSigns": "Vowel signs",
    "scSignsNote": "Shown on the letter {b}",
    "scDigits": "Digits",
    "scQuiz": "Quick quiz",
    "scQuizQ": "How do you read this letter?",
    "scTrace": "Trace",
    "scTraceHint": "Tap a letter above, then trace it here.",
    "correct": "Correct!",
    "wrongIs": "Not quite. It is {a}.",
    "next": "Next",
    "phLede": "Everyday phrases. Tap any word to save it.",
    "phNote": "Phrases are a starter set. A native speaker should check them before you rely on them.",
    "cat_greet": "Greetings",
    "cat_intro": "Introductions",
    "cat_daily": "Daily life",
    "cat_num": "Numbers",
    "slow": "Slow",
    "nav_say": "Say it",
    "cSay": "Type an English sentence and hear it in Telugu, Hindi, Kannada, Tamil, Malayalam, Bengali, Marathi, Gujarati, Assamese, Korean, Spanish, German or French.",
    "sayLede": "Type a sentence in English. Get it in another language with romanization and a voice.",
    "sayPlaceholder": "Type an English sentence, for example: How are you?",
    "sayInput": "English sentence",
    "sayTo": "Say it in",
    "sayGo": "Translate and speak",
    "sayEnglish": "Speak English",
    "sayResult": "Result",
    "sayMatch": "Phrasebook",
    "sayDevice": "Translated on your device",
    "sayClosest": "Closest phrasebook entries",
    "sayNone": "Free-form translation needs a browser with an on-device translator (recent Chrome). Here are the closest phrases from the phrasebook.",
    "sayWorking": "Translating on your device…",
    "sayFail": "The on-device translator could not do this language pair. Here are the closest phrases from the phrasebook.",
    "sayNote": "Nothing is sent to a server. Machine translation can be wrong, so check important sentences with a native speaker.",
    "copy": "Copy",
    "copied": "Copied",
    "cat_food": "Food",
    "cat_travel": "Travel",
    "cat_shop": "Shopping",
    "cat_health": "Health",
    "cat_people": "People",
    "cat_time": "Days and time",
    "voiceCheck": "Voice check",
    "vcLede": "Which voices work on this device. Tap Test to hear each one. If a language has no device voice, Bhasha can use a small offline voice instead.",
    "vcDevice": "Device voice",
    "vcOffline": "Offline voice ready",
    "vcOfflineAvail": "No device voice. Offline voice available",
    "vcNone": "No voice",
    "vcTest": "Test",
    "ovLabel": "Offline voice backup",
    "ovAsk": "Ask",
    "ovNote": "The offline voice (eSpeak NG) is about 18 MB, downloads once, then works without internet. It sounds more robotic than device voices.",
    "ovAskQ": "This device has no {l} voice. Download an offline voice (about 18 MB, once)?",
    "ovYes": "Download",
    "ovNo": "Not now",
    "ovLoading": "Loading the offline voice…",
    "ovFail": "Could not play the offline voice.",
    "nav_today": "Today",
    "nav_talk": "Conversations",
    "cToday": "A short lesson every day: five new phrases, a listening quiz and a recall round.",
    "cTalk": "Practise real conversations: restaurant, directions, shopping, doctor, hotel. Hear a line, then choose your reply.",
    "tdLede": "Five new phrases a day. Learn them, hear them, then recall older ones just before you forget.",
    "tdStart": "Start today's lesson",
    "tdDone": "Today's lesson is done. Come back tomorrow.",
    "tdLearn": "Learn",
    "tdListen": "Listen",
    "tdRecall": "Recall",
    "tdNext": "Next",
    "tdFinish": "Finish",
    "tdListenQ": "Listen, then pick the meaning",
    "tdRecallQ": "Pick the phrase that means:",
    "tdScore": "Score: {n} of {m}",
    "tdBonus": "Do a bonus lesson",
    "tdProgress": "{n} of {m} phrases learned",
    "tdRecallN": "{n} older phrases to recall today",
    "drLede": "Pick a conversation. Hear what they say, then choose your reply.",
    "drPick": "Conversations",
    "drTurns": "{n} turns",
    "drThem": "They say",
    "drYou": "Your turn. Say:",
    "drHide": "Listening mode: hide what they say",
    "drTry": "Not quite. Try again.",
    "drDone": "Conversation complete",
    "drScore": "{n} of {m} right on the first try",
    "drReplay": "Play again",
    "drTranscript": "Full conversation",
    "drAnother": "Another conversation",
    "d_meet": "Meeting someone",
    "d_rest": "At a restaurant",
    "d_dir": "Asking directions",
    "d_shop": "Shopping",
    "d_doc": "At the doctor",
    "d_hotel": "At a hotel",
    "cat_talk": "Conversation",
    "cat_feel": "Feelings",
    "cat_work": "Work and phone",
    "cat_home": "Home and weather",
    "pvTitle": "Free and private",
    "pvLede": "Bhasha is free for everyone. No account, no ads, no tracking. Everything you do stays on this device.",
    "pvFree": "Free, for everyone",
    "pvFreeT": "No payment, no sign-up, nothing locked. EknathaLabs builds it to stay free.",
    "pvPriv": "Stays on your device",
    "pvPrivT": "Your files, words and progress are kept in this browser only. There is no server to send them to.",
    "pvNet": "No tracking",
    "pvNetT": "No analytics, no cookies, no third-party scripts. Fonts and the offline voice are served from this site. External dictionary links open only if you tap them.",
    "pvMic": "Your voice",
    "pvMicT": "A pronunciation recording stays in memory while the page is open. It is never saved or uploaded.",
    "pvStored": "Saved in this browser",
    "pvWords": "Saved words",
    "pvLesson": "Lesson phrases",
    "pvStats": "Study days",
    "pvSet": "Settings",
    "pvItems": "{n} items",
    "pvTotal": "Total: {n}",
    "pvExport": "Download my data",
    "pvImport": "Restore from file",
    "pvClear": "Delete all my data",
    "pvClearAsk": "Delete saved words, lesson progress, study history and settings from this browser? This cannot be undone. Download a copy first if you want to keep it.",
    "pvClearYes": "Yes, delete everything",
    "pvCleared": "All data deleted",
    "pvImported": "Data restored",
    "pvBadFile": "This is not a Bhasha backup file",
    "pvLicence": "Bhasha is part of EknathaLabs. The optional offline voice (eSpeak NG) is open source under GPL-3.0 and is downloaded from this site only if you allow it.",
    "pvBadge": "Free · Private · Offline",
    "cPrivacy": "See what stays on your device, then download or delete it. Free, no tracking.",
    "cancel": "Cancel",
    "setSound": "Sound effects",
    "setHaptic": "Vibration",
    "pronBtn": "Practise speaking",
    "pronRec": "Record",
    "pronStop": "Stop",
    "pronAgain": "Record again",
    "pronModel": "Model",
    "pronYou": "Your voice",
    "pronCompare": "Compare",
    "pronHelp": "Listen to the model, record yourself, then compare by ear. Your recording is not saved.",
    "pronListening": "Recording… speak now",
    "pronDone": "Play yours, or compare it with the model.",
    "pronDenied": "The microphone is blocked. Allow it in your browser settings to practise.",
    "pronNoMic": "This browser cannot record audio.",
    "pronEmpty": "Nothing was recorded. Try again."
  };
  I.hi = {
    "skip": "सामग्री पर जाएँ",
    "settings": "सेटिंग",
    "part": "EknathaLabs का हिस्सा",
    "privacyNote": "आपके ब्राउज़र में चलता है। आपकी फ़ाइलें और शब्द आपके डिवाइस पर रहते हैं।",
    "mainNav": "मुख्य",
    "uiLang": "इंटरफ़ेस भाषा",
    "focusLang": "जो भाषा मैं सीख रहा/रही हूँ",
    "scheme": "रोमन लिपि शैली",
    "schSimple": "सरल",
    "schIast": "विद्वत",
    "showRoman": "रोमन में उच्चारण दिखाएँ",
    "on": "चालू",
    "off": "बंद",
    "voiceSpeed": "आवाज़ की गति",
    "perDay": "हर सत्र में दोहराव",
    "unlimited": "असीमित",
    "theme": "थीम",
    "light": "हल्का",
    "dark": "गहरा",
    "new": "नया",
    "language": "भाषा",
    "allLangs": "सभी भाषाएँ",
    "allStatus": "सभी",
    "auto": "अपने आप पहचानें",
    "indianLangs": "भारतीय भाषाएँ",
    "otherLangs": "अन्य भाषाएँ",
    "nav_watch": "देखें",
    "nav_read": "पढ़ें",
    "nav_words": "मेरे शब्द",
    "nav_review": "दोहराएँ",
    "nav_scripts": "लिपियाँ",
    "nav_phrases": "वाक्यांश",
    "homeH": "जो देखते और पढ़ते हैं, उसी से बोली जाने वाली भाषाएँ सीखें",
    "homeSub": "अपना वीडियो, ऑडियो या पाठ लाएँ। किसी भी शब्द पर टैप करके सुनें, अंग्रेज़ी अक्षरों में उच्चारण देखें और सहेजें। अंतराल दोहराव से याद रखें। मुफ़्त, निजी और ऑफ़लाइन चलता है।",
    "statWords": "सहेजे शब्द",
    "statDue": "आज के लिए",
    "statStreak": "लगातार दिन",
    "cWatch": "अपना वीडियो या ऑडियो दो उपशीर्षक पंक्तियों के साथ चलाएँ। शब्द टैप करें, पंक्ति दोहराएँ, गति घटाएँ, वक्ता की नकल करें।",
    "cRead": "कोई भी पाठ चिपकाएँ या खोलें। हर शब्द टैप हो सकता है, रोमन उच्चारण और पढ़कर सुनाने के साथ।",
    "cWords": "आपके सहेजे सभी शब्द, CSV, Anki और बैकअप फ़ाइल में निर्यात के साथ।",
    "cReview": "फ़्लैशकार्ड जो भूलने से ठीक पहले लौटते हैं।",
    "cScripts": "अक्षर, मात्राएँ और अंक। सुनें, क्विज़ खेलें और लिखकर अभ्यास करें।",
    "cPhrases": "तेरह भाषाओं में 250 रोज़मर्रा के वाक्यांश, रोमन उच्चारण और आवाज़ के साथ।",
    "dueCount": "{n} बाकी",
    "howH": "यह कैसे काम करता है",
    "how1": "अपने वीडियो के साथ उपशीर्षक फ़ाइल खोलें, या पाठ चिपकाएँ।",
    "how2": "जो शब्द न आता हो उस पर टैप करें। सुनें और अर्थ के साथ सहेजें।",
    "how3": "दोहराएँ में लौटें। कार्ड सही समय पर आते हैं।",
    "how4": "सब कुछ इसी डिवाइस पर रहता है। कभी भी निर्यात करें।",
    "homeNote": "आवाज़ें आपके डिवाइस से आती हैं। भारतीय भाषाओं की आवाज़ें फ़ोन और ब्राउज़र के अनुसार अलग होती हैं। कोई आवाज़ न सुनाई दे तो सिस्टम सेटिंग में एक इंस्टॉल करें।",
    "noTts": "यह ब्राउज़र पाठ को बोलकर नहीं सुना सकता।",
    "noVoice": "इस डिवाइस पर {l} की आवाज़ नहीं है। सिस्टम सेटिंग में इंस्टॉल करें।",
    "storageFull": "सहेज नहीं सके। ब्राउज़र का स्टोरेज भरा या बंद है।",
    "meaning": "अर्थ",
    "status": "स्थिति",
    "st0": "नया",
    "st1": "सीख रहे हैं",
    "st2": "आता है",
    "seenIn": "वाक्यांश-पुस्तिका में भी",
    "speak": "बोलें",
    "close": "बंद करें",
    "update": "अपडेट करें",
    "save": "शब्द सहेजें",
    "saved": "सहेजा गया",
    "remove": "हटाएँ",
    "speakSentence": "वाक्य पढ़ें",
    "translateDevice": "डिवाइस पर अनुवाद",
    "trFail": "अनुवाद उपलब्ध नहीं है।",
    "lookup": "खोजें",
    "opensTab": "नया टैब खुलता है",
    "wordDetails": "शब्द का विवरण",
    "rdLede": "पाठ चिपकाएँ या खोलें। किसी भी शब्द पर टैप करें।",
    "rdPlaceholder": "यहाँ किसी भी भाषा का पाठ चिपकाएँ",
    "rdText": "पढ़ने का पाठ",
    "rdEmpty": "अभी दिखाने को कुछ नहीं। पाठ चिपकाएँ या नमूना लोड करें।",
    "rdStats": "{n} शब्द, {u} अलग। {k} आते हैं, {l} सीख रहे हैं। भाषा: {lang}",
    "textLang": "पाठ की भाषा",
    "colorWords": "स्थिति के अनुसार शब्दों को रंगें",
    "fontSize": "अक्षर का आकार",
    "readAloud": "पढ़कर सुनाएँ",
    "stop": "रोकें",
    "sample": "नमूना लोड करें",
    "importTxt": "पाठ फ़ाइल खोलें",
    "clear": "साफ़ करें",
    "clickWord": "विवरण के लिए शब्द टैप करें",
    "wtLede": "अपना वीडियो या ऑडियो उपशीर्षक फ़ाइल के साथ इस्तेमाल करें। कुछ भी अपलोड नहीं होता।",
    "wtSetup": "अपनी फ़ाइलें चुनें",
    "wtDrop": "वीडियो या ऑडियो और उपशीर्षक फ़ाइलें यहाँ छोड़ें, या बटन इस्तेमाल करें।",
    "wtMedia": "वीडियो या ऑडियो",
    "wtSub1": "उपशीर्षक (जो भाषा सीख रहे हैं)",
    "wtSub2": "उपशीर्षक (आपकी भाषा)",
    "subLang": "उपशीर्षक की भाषा",
    "wtStart": "शुरू करें",
    "wtSample": "नमूना आज़माएँ (बोलकर सुनाता है)",
    "noSubs": "{f} में उपशीर्षक नहीं मिले। .srt या .vtt इस्तेमाल करें।",
    "wtPrivacy": "फ़ाइलें आपके ब्राउज़र में ही खुलती हैं और डिवाइस से बाहर नहीं जातीं। वीडियो या ऑडियो के बिना पंक्तियाँ आपके डिवाइस की आवाज़ में सुनाई जाती हैं।",
    "wtListenMode": "सुनने का मोड: पंक्तियाँ बोलकर सुनाई जाती हैं",
    "wtTranscript": "लिखित पाठ",
    "playPause": "चलाएँ या रोकें",
    "prevLine": "पिछली पंक्ति",
    "nextLine": "अगली पंक्ति",
    "replay": "पंक्ति दोबारा",
    "loopLine": "पंक्ति दोहराएँ",
    "autoPause": "हर पंक्ति के बाद रुकें",
    "hideTarget": "सीखी जा रही भाषा का उपशीर्षक छिपाएँ",
    "hideNative": "अपनी भाषा का उपशीर्षक छिपाएँ",
    "blurNative": "अपनी भाषा धुंधली करें",
    "speed": "गति",
    "subEarlier": "उपशीर्षक जल्दी दिखाएँ",
    "subLater": "उपशीर्षक देर से दिखाएँ",
    "shadow": "नकल करें",
    "stopRec": "रोकें",
    "yourVoice": "आपकी आवाज़",
    "orig": "मूल",
    "noMic": "यहाँ रिकॉर्डिंग समर्थित नहीं है।",
    "micDenied": "माइक्रोफ़ोन की अनुमति नहीं मिली।",
    "wtChange": "फ़ाइलें बदलें",
    "wtKeys": "कुंजियाँ: स्पेस चलाएँ/रोकें, A/D या तीर पिछली/अगली, R दोबारा, L दोहराव, P हर पंक्ति पर रुकें।",
    "wdLede": "आपके सहेजे शब्द। केवल इसी ब्राउज़र में रखे जाते हैं।",
    "wdCount": "{n} दिख रहे हैं, {d} अभी बाकी",
    "wdNoMatch": "कोई शब्द मेल नहीं खाता।",
    "wdEmpty": "अभी कोई शब्द सहेजा नहीं है।",
    "wdEmptySub": "पढ़ें या देखें खोलकर किसी शब्द पर टैप करें और सहेजें।",
    "wdMore": "{n} और नहीं दिख रहे। खोज इस्तेमाल करें।",
    "wdNothing": "निर्यात के लिए कुछ नहीं।",
    "wdImported": "{n} नए शब्द आयात हुए।",
    "wdImportFail": "वह फ़ाइल पढ़ नहीं सके।",
    "wdPrivacy": "ब्राउज़र डेटा साफ़ करने पर सूची मिट जाती है, इसलिए समय-समय पर बैकअप निर्यात करें।",
    "search": "खोजें",
    "edit": "बदलें",
    "dueNow": "अभी बाकी",
    "dueToday": "आज बाकी",
    "dueIn": "{n} दिन में",
    "backup": "बैकअप",
    "importWords": "आयात",
    "rvLede": "कार्ड पलटें, फिर बताएँ कि कितना याद था।",
    "rvMode": "अभ्यास का तरीका",
    "rvW2M": "शब्द से अर्थ",
    "rvM2W": "अर्थ से शब्द",
    "rvListen": "सुनकर",
    "rvCloze": "खाली जगह भरें",
    "rvStreak": "लगातार दिन: {n}",
    "rvDone": "पूरा: {n} कार्ड",
    "rvDoneSub": "बाद में लौटें। छूटे कार्ड मिनटों में, बाकी दिनों में लौटते हैं।",
    "rvNone": "कुछ भी बाकी नहीं",
    "rvNoneSub": "आप आगे हैं। नए शब्द पाने के लिए और पढ़ें या देखें।",
    "rvWhichWord": "यह कौन सा शब्द है?",
    "rvPlay": "शब्द सुनें",
    "rvListenQ": "सुनें, फिर अर्थ याद करें",
    "rvHint": "अर्थ",
    "rvShow": "उत्तर दिखाएँ",
    "rvProgress": "सत्र की प्रगति",
    "again": "फिर से",
    "hard": "कठिन",
    "good": "ठीक",
    "easy": "आसान",
    "scLede": "अक्षर सीखें। किसी भी अक्षर पर टैप करके सुनें और लिखकर अभ्यास करें।",
    "scVowels": "स्वर",
    "scCons": "व्यंजन",
    "scSigns": "मात्राएँ",
    "scSignsNote": "अक्षर {b} पर दिखाई गई",
    "scDigits": "अंक",
    "scQuiz": "छोटी क्विज़",
    "scQuizQ": "यह अक्षर कैसे पढ़ते हैं?",
    "scTrace": "लिखकर देखें",
    "scTraceHint": "ऊपर कोई अक्षर टैप करें, फिर यहाँ उसे लिखें।",
    "correct": "सही!",
    "wrongIs": "ठीक नहीं। यह {a} है।",
    "next": "आगे",
    "phLede": "रोज़मर्रा के वाक्यांश। किसी भी शब्द पर टैप करके सहेजें।",
    "phNote": "ये वाक्यांश शुरुआती सेट हैं। भरोसा करने से पहले किसी मातृभाषी से जँचवा लें।",
    "cat_greet": "अभिवादन",
    "cat_intro": "परिचय",
    "cat_daily": "रोज़मर्रा",
    "cat_num": "संख्याएँ",
    "slow": "धीरे",
    "nav_say": "बोलें",
    "cSay": "अंग्रेज़ी में वाक्य लिखें और उसे तेलुगु, हिन्दी, कन्नड़, तमिल, मलयालम, बांग्ला, मराठी, गुजराती, असमिया, कोरियाई, स्पैनिश, जर्मन या फ़्रेंच में सुनें।",
    "sayLede": "अंग्रेज़ी में वाक्य लिखें। उसे दूसरी भाषा में रोमन उच्चारण और आवाज़ के साथ पाएँ।",
    "sayPlaceholder": "अंग्रेज़ी में वाक्य लिखें, जैसे: How are you?",
    "sayInput": "अंग्रेज़ी वाक्य",
    "sayTo": "इस भाषा में बोलें",
    "sayGo": "अनुवाद करें और बोलें",
    "sayEnglish": "अंग्रेज़ी बोलें",
    "sayResult": "नतीजा",
    "sayMatch": "वाक्यांश-पुस्तिका",
    "sayDevice": "आपके डिवाइस पर अनुवादित",
    "sayClosest": "वाक्यांश-पुस्तिका के सबसे करीबी वाक्य",
    "sayNone": "खुला अनुवाद डिवाइस पर चलने वाले अनुवादक वाले ब्राउज़र (हाल का Chrome) में होता है। वाक्यांश-पुस्तिका के सबसे करीबी वाक्य ये हैं।",
    "sayWorking": "आपके डिवाइस पर अनुवाद हो रहा है…",
    "sayFail": "डिवाइस का अनुवादक इस भाषा-जोड़ी के लिए काम नहीं कर सका। वाक्यांश-पुस्तिका के सबसे करीबी वाक्य ये हैं।",
    "sayNote": "कुछ भी सर्वर को नहीं भेजा जाता। मशीनी अनुवाद गलत हो सकता है, इसलिए ज़रूरी वाक्य किसी मातृभाषी से जँचवाएँ।",
    "copy": "कॉपी करें",
    "copied": "कॉपी हो गया",
    "cat_food": "खाना",
    "cat_travel": "यात्रा",
    "cat_shop": "खरीदारी",
    "cat_health": "सेहत",
    "cat_people": "लोग",
    "cat_time": "दिन और समय",
    "voiceCheck": "आवाज़ जाँच",
    "vcLede": "इस डिवाइस पर कौन-सी आवाज़ें चलती हैं। हर एक सुनने के लिए जाँचें दबाएँ। किसी भाषा की आवाज़ न हो तो Bhasha एक छोटी ऑफ़लाइन आवाज़ इस्तेमाल कर सकता है।",
    "vcDevice": "डिवाइस की आवाज़",
    "vcOffline": "ऑफ़लाइन आवाज़ तैयार",
    "vcOfflineAvail": "डिवाइस की आवाज़ नहीं। ऑफ़लाइन आवाज़ उपलब्ध",
    "vcNone": "आवाज़ नहीं",
    "vcTest": "जाँचें",
    "ovLabel": "ऑफ़लाइन आवाज़ का सहारा",
    "ovAsk": "पूछें",
    "ovNote": "ऑफ़लाइन आवाज़ (eSpeak NG) लगभग 18 MB की है, एक बार डाउनलोड होती है, फिर बिना इंटरनेट चलती है। यह डिवाइस की आवाज़ों से ज़्यादा मशीनी लगती है।",
    "ovAskQ": "इस डिवाइस पर {l} की आवाज़ नहीं है। ऑफ़लाइन आवाज़ डाउनलोड करें (लगभग 18 MB, एक बार)?",
    "ovYes": "डाउनलोड करें",
    "ovNo": "अभी नहीं",
    "ovLoading": "ऑफ़लाइन आवाज़ लोड हो रही है…",
    "ovFail": "ऑफ़लाइन आवाज़ चला नहीं सके।",
    "nav_today": "आज",
    "nav_talk": "बातचीत",
    "cToday": "हर दिन एक छोटा पाठ: पाँच नए वाक्यांश, सुनकर जवाब देना और दोहराई।",
    "cTalk": "असली बातचीत का अभ्यास करें: रेस्तराँ, रास्ता पूछना, खरीदारी, डॉक्टर, होटल। एक पंक्ति सुनें, फिर अपना जवाब चुनें।",
    "tdLede": "रोज़ पाँच नए वाक्यांश। उन्हें सीखें, सुनें, और पुराने वाक्यांश भूलने से ठीक पहले दोहराएँ।",
    "tdStart": "आज का पाठ शुरू करें",
    "tdDone": "आज का पाठ पूरा हुआ। कल फिर आइए।",
    "tdLearn": "सीखें",
    "tdListen": "सुनें",
    "tdRecall": "याद करें",
    "tdNext": "आगे",
    "tdFinish": "समाप्त",
    "tdListenQ": "सुनिए, फिर अर्थ चुनिए",
    "tdRecallQ": "वह वाक्यांश चुनिए जिसका अर्थ है:",
    "tdScore": "अंक: {m} में से {n}",
    "tdBonus": "एक और पाठ करें",
    "tdProgress": "{m} में से {n} वाक्यांश सीखे",
    "tdRecallN": "आज दोहराने के लिए {n} पुराने वाक्यांश",
    "drLede": "एक बातचीत चुनें। सुनें कि वे क्या कहते हैं, फिर अपना जवाब चुनें।",
    "drPick": "बातचीत",
    "drTurns": "{n} बारी",
    "drThem": "वे कहते हैं",
    "drYou": "आपकी बारी। कहिए:",
    "drHide": "सुनने का मोड: उनकी बात छिपाएँ",
    "drTry": "ठीक नहीं। फिर कोशिश कीजिए।",
    "drDone": "बातचीत पूरी हुई",
    "drScore": "पहली कोशिश में {m} में से {n} सही",
    "drReplay": "फिर से चलाएँ",
    "drTranscript": "पूरी बातचीत",
    "drAnother": "दूसरी बातचीत",
    "d_meet": "किसी से मिलना",
    "d_rest": "रेस्तराँ में",
    "d_dir": "रास्ता पूछना",
    "d_shop": "खरीदारी",
    "d_doc": "डॉक्टर के पास",
    "d_hotel": "होटल में",
    "cat_talk": "बातचीत",
    "cat_feel": "भावनाएँ",
    "cat_work": "काम और फ़ोन",
    "cat_home": "घर और मौसम",
    "pvTitle": "मुफ़्त और निजी",
    "pvLede": "Bhasha सबके लिए मुफ़्त है। न खाता, न विज्ञापन, न ट्रैकिंग। आप जो भी करते हैं वह इसी डिवाइस पर रहता है।",
    "pvFree": "सबके लिए मुफ़्त",
    "pvFreeT": "न भुगतान, न साइन-अप, कुछ भी बंद नहीं। EknathaLabs इसे हमेशा मुफ़्त रखने के लिए बनाता है।",
    "pvPriv": "आपके डिवाइस पर ही रहता है",
    "pvPrivT": "आपकी फ़ाइलें, शब्द और प्रगति केवल इसी ब्राउज़र में रहते हैं। उन्हें भेजने के लिए कोई सर्वर नहीं है।",
    "pvNet": "कोई ट्रैकिंग नहीं",
    "pvNetT": "न एनालिटिक्स, न कुकी, न बाहरी स्क्रिप्ट। फ़ॉन्ट और ऑफ़लाइन आवाज़ इसी साइट से आते हैं। बाहरी शब्दकोश के लिंक तभी खुलते हैं जब आप उन्हें दबाते हैं।",
    "pvMic": "आपकी आवाज़",
    "pvMicT": "उच्चारण की रिकॉर्डिंग पेज खुला रहने तक केवल मेमोरी में रहती है। उसे कभी सहेजा या अपलोड नहीं किया जाता।",
    "pvStored": "इस ब्राउज़र में सहेजा गया",
    "pvWords": "सहेजे गए शब्द",
    "pvLesson": "पाठ के वाक्यांश",
    "pvStats": "अध्ययन के दिन",
    "pvSet": "सेटिंग्स",
    "pvItems": "{n} आइटम",
    "pvTotal": "कुल: {n}",
    "pvExport": "मेरा डेटा डाउनलोड करें",
    "pvImport": "फ़ाइल से वापस लाएँ",
    "pvClear": "मेरा सारा डेटा मिटाएँ",
    "pvClearAsk": "इस ब्राउज़र से सहेजे गए शब्द, पाठ की प्रगति, अध्ययन का इतिहास और सेटिंग्स मिटा दें? इसे वापस नहीं किया जा सकता। रखना चाहें तो पहले एक प्रति डाउनलोड कर लें।",
    "pvClearYes": "हाँ, सब मिटाएँ",
    "pvCleared": "सारा डेटा मिटा दिया गया",
    "pvImported": "डेटा वापस लाया गया",
    "pvBadFile": "यह Bhasha की बैकअप फ़ाइल नहीं है",
    "pvLicence": "Bhasha, EknathaLabs का हिस्सा है। वैकल्पिक ऑफ़लाइन आवाज़ (eSpeak NG) GPL-3.0 के तहत ओपन सोर्स है और आपकी अनुमति देने पर ही इसी साइट से डाउनलोड होती है।",
    "pvBadge": "मुफ़्त · निजी · ऑफ़लाइन",
    "cPrivacy": "देखें कि आपके डिवाइस पर क्या रहता है, फिर उसे डाउनलोड या मिटाएँ। मुफ़्त, कोई ट्रैकिंग नहीं।",
    "cancel": "रद्द करें",
    "setSound": "ध्वनि प्रभाव",
    "setHaptic": "कंपन",
    "pronBtn": "बोलने का अभ्यास",
    "pronRec": "रिकॉर्ड करें",
    "pronStop": "रोकें",
    "pronAgain": "फिर रिकॉर्ड करें",
    "pronModel": "नमूना",
    "pronYou": "आपकी आवाज़",
    "pronCompare": "तुलना करें",
    "pronHelp": "नमूना सुनें, खुद को रिकॉर्ड करें और कान से तुलना करें। आपकी रिकॉर्डिंग सहेजी नहीं जाती।",
    "pronListening": "रिकॉर्ड हो रहा है… अब बोलें",
    "pronDone": "अपनी रिकॉर्डिंग सुनें या नमूने से तुलना करें।",
    "pronDenied": "माइक्रोफ़ोन बंद है। अभ्यास के लिए ब्राउज़र की सेटिंग्स में उसे अनुमति दें।",
    "pronNoMic": "यह ब्राउज़र ऑडियो रिकॉर्ड नहीं कर सकता।",
    "pronEmpty": "कुछ रिकॉर्ड नहीं हुआ। फिर कोशिश करें।"
  };
  I.te = {
    "skip": "కంటెంట్‌కు వెళ్లండి",
    "settings": "సెట్టింగ్‌లు",
    "part": "EknathaLabs లో భాగం",
    "privacyNote": "మీ బ్రౌజర్‌లోనే నడుస్తుంది. మీ ఫైళ్లు, పదాలు మీ పరికరంలోనే ఉంటాయి.",
    "mainNav": "ప్రధాన",
    "uiLang": "ఇంటర్‌ఫేస్ భాష",
    "focusLang": "నేను నేర్చుకుంటున్న భాష",
    "scheme": "రోమన్ శైలి",
    "schSimple": "సరళం",
    "schIast": "పండిత",
    "showRoman": "రోమన్ ఉచ్చారణ చూపు",
    "on": "ఆన్",
    "off": "ఆఫ్",
    "voiceSpeed": "స్వరం వేగం",
    "perDay": "ఒక సెషన్‌లో రివ్యూలు",
    "unlimited": "పరిమితి లేదు",
    "theme": "థీమ్",
    "light": "లైట్",
    "dark": "డార్క్",
    "new": "కొత్త",
    "language": "భాష",
    "allLangs": "అన్ని భాషలు",
    "allStatus": "అన్నీ",
    "auto": "ఆటోమేటిక్‌గా గుర్తించు",
    "indianLangs": "భారతీయ భాషలు",
    "otherLangs": "ఇతర భాషలు",
    "nav_watch": "చూడండి",
    "nav_read": "చదవండి",
    "nav_words": "నా పదాలు",
    "nav_review": "పునశ్చరణ",
    "nav_scripts": "లిపులు",
    "nav_phrases": "వాక్యాలు",
    "homeH": "మీరు చూసే, చదివే వాటి నుంచే మాట్లాడే భాషలు నేర్చుకోండి",
    "homeSub": "మీ సొంత వీడియో, ఆడియో లేదా టెక్స్ట్ తీసుకురండి. ఏ పదాన్నైనా తాకి వినండి, ఇంగ్లీష్ అక్షరాల్లో ఉచ్చారణ చూడండి, సేవ్ చేయండి. విరామ పునరావృతంతో గుర్తుంచుకోండి. ఉచితం, ప్రైవేట్, ఆఫ్‌లైన్‌లో పనిచేస్తుంది.",
    "statWords": "సేవ్ చేసిన పదాలు",
    "statDue": "ఈ రోజు",
    "statStreak": "వరుస రోజులు",
    "cWatch": "మీ వీడియో లేదా ఆడియోను రెండు సబ్‌టైటిల్ లైన్లతో ప్లే చేయండి. పదాలను తాకండి, లైన్‌ను మళ్లీ వినండి, వేగం తగ్గించండి, వక్తను అనుకరించండి.",
    "cRead": "ఏ టెక్స్ట్‌నైనా పేస్ట్ చేయండి లేదా తెరవండి. ప్రతి పదం తాకవచ్చు, రోమన్ ఉచ్చారణ, చదివి వినిపించడంతో.",
    "cWords": "మీరు సేవ్ చేసినవన్నీ, CSV, Anki, బ్యాకప్ ఫైల్‌కు ఎగుమతితో.",
    "cReview": "మరచిపోయే ముందే తిరిగి వచ్చే ఫ్లాష్‌కార్డులు.",
    "cScripts": "అక్షరాలు, గుణింతాలు, అంకెలు. వినండి, క్విజ్ చేయండి, రాసి చూడండి.",
    "cPhrases": "పదమూడు భాషల్లో 250 రోజువారీ వాక్యాలు, రోమన్ ఉచ్చారణ మరియు స్వరంతో.",
    "dueCount": "{n} మిగిలాయి",
    "howH": "ఇది ఎలా పనిచేస్తుంది",
    "how1": "మీ వీడియోతో పాటు సబ్‌టైటిల్ ఫైల్ తెరవండి, లేదా టెక్స్ట్ పేస్ట్ చేయండి.",
    "how2": "తెలియని పదాన్ని తాకండి. వినండి, అర్థంతో సేవ్ చేయండి.",
    "how3": "పునశ్చరణకు రండి. కార్డులు సరైన సమయానికి వస్తాయి.",
    "how4": "అంతా ఈ పరికరంలోనే ఉంటుంది. ఎప్పుడైనా ఎగుమతి చేయండి.",
    "homeNote": "స్వరాలు మీ పరికరం నుంచి వస్తాయి. భారతీయ భాషల స్వరాలు ఫోన్, బ్రౌజర్‌ను బట్టి మారుతాయి. వినిపించకపోతే సిస్టమ్ సెట్టింగ్స్‌లో ఒకటి ఇన్‌స్టాల్ చేయండి.",
    "noTts": "ఈ బ్రౌజర్ టెక్స్ట్‌ను చదివి వినిపించలేదు.",
    "noVoice": "ఈ పరికరంలో {l} స్వరం లేదు. సిస్టమ్ సెట్టింగ్స్‌లో ఇన్‌స్టాల్ చేయండి.",
    "storageFull": "సేవ్ కాలేదు. బ్రౌజర్ నిల్వ నిండింది లేదా నిరోధించబడింది.",
    "meaning": "అర్థం",
    "status": "స్థితి",
    "st0": "కొత్త",
    "st1": "నేర్చుకుంటున్నా",
    "st2": "తెలుసు",
    "seenIn": "వాక్యాల జాబితాలో కూడా",
    "speak": "చదువు",
    "close": "మూసివేయి",
    "update": "అప్‌డేట్",
    "save": "పదం సేవ్ చేయి",
    "saved": "సేవ్ అయింది",
    "remove": "తొలగించు",
    "speakSentence": "వాక్యం చదువు",
    "translateDevice": "పరికరంలో అనువదించు",
    "trFail": "అనువాదం అందుబాటులో లేదు.",
    "lookup": "వెతకండి",
    "opensTab": "కొత్త ట్యాబ్ తెరుచుకుంటుంది",
    "wordDetails": "పదం వివరాలు",
    "rdLede": "టెక్స్ట్ పేస్ట్ చేయండి లేదా తెరవండి. ఏ పదాన్నైనా తాకండి.",
    "rdPlaceholder": "ఏ భాషలోనైనా టెక్స్ట్ ఇక్కడ పేస్ట్ చేయండి",
    "rdText": "చదివే టెక్స్ట్",
    "rdEmpty": "ఇంకా చూపడానికి ఏమీ లేదు. టెక్స్ట్ పేస్ట్ చేయండి లేదా నమూనా లోడ్ చేయండి.",
    "rdStats": "{n} పదాలు, {u} వేరువేరు. {k} తెలుసు, {l} నేర్చుకుంటున్నా. భాష: {lang}",
    "textLang": "టెక్స్ట్ భాష",
    "colorWords": "స్థితిని బట్టి పదాలకు రంగు",
    "fontSize": "అక్షరాల పరిమాణం",
    "readAloud": "చదివి వినిపించు",
    "stop": "ఆపు",
    "sample": "నమూనా లోడ్ చేయి",
    "importTxt": "టెక్స్ట్ ఫైల్ తెరువు",
    "clear": "తొలగించు",
    "clickWord": "వివరాల కోసం పదాన్ని తాకండి",
    "wtLede": "మీ సొంత వీడియో లేదా ఆడియోను సబ్‌టైటిల్ ఫైల్‌తో వాడండి. ఏదీ అప్‌లోడ్ కాదు.",
    "wtSetup": "మీ ఫైళ్లను ఎంచుకోండి",
    "wtDrop": "వీడియో లేదా ఆడియో, సబ్‌టైటిల్ ఫైళ్లను ఇక్కడ వదలండి, లేదా బటన్లు వాడండి.",
    "wtMedia": "వీడియో లేదా ఆడియో",
    "wtSub1": "సబ్‌టైటిల్స్ (నేర్చుకునే భాష)",
    "wtSub2": "సబ్‌టైటిల్స్ (మీ భాష)",
    "subLang": "సబ్‌టైటిల్ భాష",
    "wtStart": "ప్రారంభించు",
    "wtSample": "నమూనా చూడండి (చదివి వినిపిస్తుంది)",
    "noSubs": "{f} లో సబ్‌టైటిల్స్ కనబడలేదు. .srt లేదా .vtt వాడండి.",
    "wtPrivacy": "ఫైళ్లు మీ బ్రౌజర్‌లోనే తెరుచుకుంటాయి, పరికరం దాటి వెళ్లవు. వీడియో లేదా ఆడియో లేకపోతే లైన్లను మీ పరికరం స్వరం చదివి వినిపిస్తుంది.",
    "wtListenMode": "వినే మోడ్: లైన్లు చదివి వినిపిస్తాయి",
    "wtTranscript": "లిఖిత పాఠం",
    "playPause": "ప్లే లేదా ఆపు",
    "prevLine": "ముందు లైన్",
    "nextLine": "తర్వాతి లైన్",
    "replay": "లైన్ మళ్లీ",
    "loopLine": "లైన్ పునరావృతం",
    "autoPause": "ప్రతి లైన్ తర్వాత ఆగు",
    "hideTarget": "నేర్చుకునే భాష సబ్‌టైటిల్ దాచు",
    "hideNative": "నా భాష సబ్‌టైటిల్ దాచు",
    "blurNative": "నా భాషను మసక చేయి",
    "speed": "వేగం",
    "subEarlier": "సబ్‌టైటిల్స్ ముందుగా",
    "subLater": "సబ్‌టైటిల్స్ ఆలస్యంగా",
    "shadow": "అనుకరించు",
    "stopRec": "ఆపు",
    "yourVoice": "మీ స్వరం",
    "orig": "అసలు",
    "noMic": "ఇక్కడ రికార్డింగ్‌కు మద్దతు లేదు.",
    "micDenied": "మైక్రోఫోన్ అనుమతి ఇవ్వలేదు.",
    "wtChange": "ఫైళ్లు మార్చు",
    "wtKeys": "కీలు: Space ప్లే/ఆపు, A/D లేదా బాణాలు ముందు/తర్వాత, R మళ్లీ, L పునరావృతం, P ప్రతి లైన్ తర్వాత ఆగు.",
    "wdLede": "మీరు సేవ్ చేసిన పదాలు. ఈ బ్రౌజర్‌లో మాత్రమే నిల్వ అవుతాయి.",
    "wdCount": "{n} చూపుతున్నాం, {d} ఇప్పుడు మిగిలాయి",
    "wdNoMatch": "సరిపోయే పదాలు లేవు.",
    "wdEmpty": "ఇంకా పదాలు సేవ్ చేయలేదు.",
    "wdEmptySub": "చదవండి లేదా చూడండి తెరిచి పదాన్ని తాకి సేవ్ చేయండి.",
    "wdMore": "ఇంకా {n} చూపలేదు. శోధన వాడండి.",
    "wdNothing": "ఎగుమతి చేయడానికి ఏమీ లేదు.",
    "wdImported": "{n} కొత్త పదాలు దిగుమతి అయ్యాయి.",
    "wdImportFail": "ఆ ఫైల్ చదవలేకపోయాం.",
    "wdPrivacy": "బ్రౌజర్ డేటా తొలగిస్తే జాబితా పోతుంది, కాబట్టి అప్పుడప్పుడు బ్యాకప్ ఎగుమతి చేయండి.",
    "search": "శోధన",
    "edit": "మార్చు",
    "dueNow": "ఇప్పుడే",
    "dueToday": "ఈ రోజు",
    "dueIn": "{n} రోజుల్లో",
    "backup": "బ్యాకప్",
    "importWords": "దిగుమతి",
    "rvLede": "కార్డు తిప్పండి, ఎంత గుర్తుందో చెప్పండి.",
    "rvMode": "సాధన విధానం",
    "rvW2M": "పదం నుంచి అర్థం",
    "rvM2W": "అర్థం నుంచి పదం",
    "rvListen": "వినడం",
    "rvCloze": "ఖాళీ నింపండి",
    "rvStreak": "వరుస రోజులు: {n}",
    "rvDone": "పూర్తి: {n} కార్డులు",
    "rvDoneSub": "తర్వాత రండి. మిస్సైన కార్డులు నిమిషాల్లో, మిగతావి రోజుల్లో వస్తాయి.",
    "rvNone": "ఏదీ మిగల్లేదు",
    "rvNoneSub": "మీరు ముందున్నారు. కొత్త పదాల కోసం మరింత చదవండి లేదా చూడండి.",
    "rvWhichWord": "ఈ పదం ఏమిటి?",
    "rvPlay": "పదం వినండి",
    "rvListenQ": "విని, అర్థం గుర్తు చేసుకోండి",
    "rvHint": "అర్థం",
    "rvShow": "జవాబు చూపు",
    "rvProgress": "సెషన్ పురోగతి",
    "again": "మళ్లీ",
    "hard": "కష్టం",
    "good": "బాగుంది",
    "easy": "సులభం",
    "scLede": "అక్షరాలు నేర్చుకోండి. ఏ అక్షరాన్నైనా తాకి వినండి, రాసి చూడండి.",
    "scVowels": "అచ్చులు",
    "scCons": "హల్లులు",
    "scSigns": "గుణింతాలు",
    "scSignsNote": "{b} అక్షరంపై చూపబడ్డాయి",
    "scDigits": "అంకెలు",
    "scQuiz": "చిన్న క్విజ్",
    "scQuizQ": "ఈ అక్షరాన్ని ఎలా చదువుతారు?",
    "scTrace": "రాసి చూడండి",
    "scTraceHint": "పైన ఒక అక్షరాన్ని తాకి, ఇక్కడ రాయండి.",
    "correct": "సరైనది!",
    "wrongIs": "కాదు. ఇది {a}.",
    "next": "తర్వాత",
    "phLede": "రోజువారీ వాక్యాలు. ఏ పదాన్నైనా తాకి సేవ్ చేయండి.",
    "phNote": "ఈ వాక్యాలు ప్రారంభ సెట్. నమ్మే ముందు మాతృభాష వారితో సరిచూడండి.",
    "cat_greet": "పలకరింపులు",
    "cat_intro": "పరిచయం",
    "cat_daily": "రోజువారీ",
    "cat_num": "సంఖ్యలు",
    "slow": "నెమ్మదిగా",
    "nav_say": "చెప్పండి",
    "cSay": "ఇంగ్లీషులో వాక్యం రాసి, తెలుగు, హిందీ, కన్నడ, తమిళం, మలయాళం, బెంగాలీ, మరాఠీ, గుజరాతీ, అస్సామీ, కొరియన్, స్పానిష్, జర్మన్ లేదా ఫ్రెంచ్‌లో వినండి.",
    "sayLede": "ఇంగ్లీష్‌లో వాక్యం రాయండి. మరో భాషలో రోమన్ ఉచ్చారణ, స్వరంతో పొందండి.",
    "sayPlaceholder": "ఇంగ్లీష్ వాక్యం రాయండి, ఉదాహరణకు: How are you?",
    "sayInput": "ఇంగ్లీష్ వాక్యం",
    "sayTo": "ఈ భాషలో చెప్పు",
    "sayGo": "అనువదించి చదువు",
    "sayEnglish": "ఇంగ్లీష్ చదువు",
    "sayResult": "ఫలితం",
    "sayMatch": "వాక్యాల జాబితా",
    "sayDevice": "మీ పరికరంలో అనువదించబడింది",
    "sayClosest": "వాక్యాల జాబితాలో దగ్గరి వాక్యాలు",
    "sayNone": "స్వేచ్ఛా అనువాదానికి పరికరంలో అనువాదకం ఉన్న బ్రౌజర్ (ఇటీవలి Chrome) కావాలి. వాక్యాల జాబితాలో దగ్గరి వాక్యాలు ఇవి.",
    "sayWorking": "మీ పరికరంలో అనువదిస్తోంది…",
    "sayFail": "పరికరంలోని అనువాదకం ఈ భాషా జతకు పని చేయలేదు. వాక్యాల జాబితాలో దగ్గరి వాక్యాలు ఇవి.",
    "sayNote": "ఏదీ సర్వర్‌కు పంపబడదు. యంత్ర అనువాదం తప్పు కావచ్చు, ముఖ్యమైన వాక్యాలను మాతృభాష వారితో సరిచూడండి.",
    "copy": "కాపీ",
    "copied": "కాపీ అయింది",
    "cat_food": "ఆహారం",
    "cat_travel": "ప్రయాణం",
    "cat_shop": "షాపింగ్",
    "cat_health": "ఆరోగ్యం",
    "cat_people": "మనుషులు",
    "cat_time": "రోజులు, సమయం",
    "voiceCheck": "స్వరం పరీక్ష",
    "vcLede": "ఈ పరికరంలో ఏ స్వరాలు పనిచేస్తాయో చూడండి. ప్రతిదాన్ని వినడానికి పరీక్ష నొక్కండి. ఏ భాషకైనా పరికర స్వరం లేకపోతే Bhasha చిన్న ఆఫ్‌లైన్ స్వరాన్ని వాడగలదు.",
    "vcDevice": "పరికర స్వరం",
    "vcOffline": "ఆఫ్‌లైన్ స్వరం సిద్ధం",
    "vcOfflineAvail": "పరికర స్వరం లేదు. ఆఫ్‌లైన్ స్వరం అందుబాటులో ఉంది",
    "vcNone": "స్వరం లేదు",
    "vcTest": "పరీక్ష",
    "ovLabel": "ఆఫ్‌లైన్ స్వరం బ్యాకప్",
    "ovAsk": "అడుగు",
    "ovNote": "ఆఫ్‌లైన్ స్వరం (eSpeak NG) సుమారు 18 MB, ఒకసారి డౌన్‌లోడ్ అయ్యాక ఇంటర్నెట్ లేకుండా పనిచేస్తుంది. ఇది పరికర స్వరాల కంటే యాంత్రికంగా వినిపిస్తుంది.",
    "ovAskQ": "ఈ పరికరంలో {l} స్వరం లేదు. ఆఫ్‌లైన్ స్వరం డౌన్‌లోడ్ చేయాలా (సుమారు 18 MB, ఒకసారి)?",
    "ovYes": "డౌన్‌లోడ్",
    "ovNo": "ఇప్పుడు కాదు",
    "ovLoading": "ఆఫ్‌లైన్ స్వరం లోడ్ అవుతోంది…",
    "ovFail": "ఆఫ్‌లైన్ స్వరం ప్లే చేయలేకపోయాం.",
    "nav_today": "ఈ రోజు",
    "nav_talk": "సంభాషణలు",
    "cToday": "ప్రతిరోజూ ఒక చిన్న పాఠం: ఐదు కొత్త వాక్యాలు, వినే క్విజ్, గుర్తుచేసుకునే రౌండ్.",
    "cTalk": "నిజమైన సంభాషణలను సాధన చేయండి: రెస్టారెంట్, దారి అడగడం, షాపింగ్, డాక్టర్, హోటల్. ఒక వాక్యం విని, మీ జవాబు ఎంచుకోండి.",
    "tdLede": "రోజుకు ఐదు కొత్త వాక్యాలు. నేర్చుకోండి, వినండి, మర్చిపోయే ముందు పాత వాటిని గుర్తుచేసుకోండి.",
    "tdStart": "ఈ రోజు పాఠం మొదలుపెట్టండి",
    "tdDone": "ఈ రోజు పాఠం పూర్తయింది. రేపు మళ్ళీ రండి.",
    "tdLearn": "నేర్చుకోండి",
    "tdListen": "వినండి",
    "tdRecall": "గుర్తుచేసుకోండి",
    "tdNext": "తదుపరి",
    "tdFinish": "ముగించు",
    "tdListenQ": "విని, అర్థం ఎంచుకోండి",
    "tdRecallQ": "ఈ అర్థం ఇచ్చే వాక్యాన్ని ఎంచుకోండి:",
    "tdScore": "స్కోరు: {m}లో {n}",
    "tdBonus": "మరో పాఠం చేయండి",
    "tdProgress": "{m}లో {n} వాక్యాలు నేర్చుకున్నారు",
    "tdRecallN": "ఈ రోజు గుర్తుచేసుకోవాల్సిన {n} పాత వాక్యాలు",
    "drLede": "ఒక సంభాషణ ఎంచుకోండి. వారు ఏమంటారో విని, మీ జవాబు ఎంచుకోండి.",
    "drPick": "సంభాషణలు",
    "drTurns": "{n} మలుపులు",
    "drThem": "వారు అంటారు",
    "drYou": "మీ వంతు. చెప్పండి:",
    "drHide": "వినే మోడ్: వారి మాటలు దాచు",
    "drTry": "సరిగ్గా లేదు. మళ్ళీ ప్రయత్నించండి.",
    "drDone": "సంభాషణ పూర్తయింది",
    "drScore": "మొదటి ప్రయత్నంలో {m}లో {n} సరైనవి",
    "drReplay": "మళ్ళీ ఆడండి",
    "drTranscript": "పూర్తి సంభాషణ",
    "drAnother": "మరో సంభాషణ",
    "d_meet": "ఒకరిని కలవడం",
    "d_rest": "రెస్టారెంట్‌లో",
    "d_dir": "దారి అడగడం",
    "d_shop": "షాపింగ్",
    "d_doc": "డాక్టర్ దగ్గర",
    "d_hotel": "హోటల్‌లో",
    "cat_talk": "సంభాషణ",
    "cat_feel": "భావాలు",
    "cat_work": "పని మరియు ఫోన్",
    "cat_home": "ఇల్లు మరియు వాతావరణం",
    "pvTitle": "ఉచితం మరియు ప్రైవేట్",
    "pvLede": "Bhasha అందరికీ ఉచితం. ఖాతా లేదు, ప్రకటనలు లేవు, ట్రాకింగ్ లేదు. మీరు చేసేదంతా ఈ పరికరంలోనే ఉంటుంది.",
    "pvFree": "అందరికీ ఉచితం",
    "pvFreeT": "చెల్లింపు లేదు, సైన్-అప్ లేదు, ఏదీ లాక్ చేయలేదు. EknathaLabs దీన్ని ఎప్పటికీ ఉచితంగా ఉంచేలా తయారు చేస్తుంది.",
    "pvPriv": "మీ పరికరంలోనే ఉంటుంది",
    "pvPrivT": "మీ ఫైళ్లు, పదాలు, పురోగతి ఈ బ్రౌజర్‌లో మాత్రమే ఉంటాయి. వాటిని పంపడానికి సర్వర్ లేదు.",
    "pvNet": "ట్రాకింగ్ లేదు",
    "pvNetT": "అనలిటిక్స్ లేదు, కుకీలు లేవు, బయటి స్క్రిప్టులు లేవు. ఫాంట్లు, ఆఫ్‌లైన్ స్వరం ఈ సైట్ నుంచే వస్తాయి. బయటి నిఘంటువు లింకులు మీరు నొక్కితేనే తెరుచుకుంటాయి.",
    "pvMic": "మీ స్వరం",
    "pvMicT": "ఉచ్చారణ రికార్డింగ్ పేజీ తెరిచి ఉన్నంత వరకే మెమరీలో ఉంటుంది. దాన్ని ఎప్పుడూ సేవ్ చేయరు, అప్‌లోడ్ చేయరు.",
    "pvStored": "ఈ బ్రౌజర్‌లో సేవ్ అయినవి",
    "pvWords": "సేవ్ చేసిన పదాలు",
    "pvLesson": "పాఠం వాక్యాలు",
    "pvStats": "చదివిన రోజులు",
    "pvSet": "సెట్టింగ్‌లు",
    "pvItems": "{n} అంశాలు",
    "pvTotal": "మొత్తం: {n}",
    "pvExport": "నా డేటాను డౌన్‌లోడ్ చేయి",
    "pvImport": "ఫైల్ నుంచి పునరుద్ధరించు",
    "pvClear": "నా డేటా మొత్తం తొలగించు",
    "pvClearAsk": "ఈ బ్రౌజర్ నుంచి సేవ్ చేసిన పదాలు, పాఠ పురోగతి, అభ్యాస చరిత్ర, సెట్టింగ్‌లను తొలగించాలా? దీన్ని వెనక్కి తీసుకోలేరు. ఉంచుకోవాలంటే ముందు ఒక కాపీ డౌన్‌లోడ్ చేయండి.",
    "pvClearYes": "అవును, అన్నీ తొలగించు",
    "pvCleared": "డేటా మొత్తం తొలగించబడింది",
    "pvImported": "డేటా పునరుద్ధరించబడింది",
    "pvBadFile": "ఇది Bhasha బ్యాకప్ ఫైల్ కాదు",
    "pvLicence": "Bhasha EknathaLabs లో భాగం. ఐచ్ఛిక ఆఫ్‌లైన్ స్వరం (eSpeak NG) GPL-3.0 కింద ఓపెన్ సోర్స్, మీరు అనుమతిస్తేనే ఈ సైట్ నుంచి డౌన్‌లోడ్ అవుతుంది.",
    "pvBadge": "ఉచితం · ప్రైవేట్ · ఆఫ్‌లైన్",
    "cPrivacy": "మీ పరికరంలో ఏముందో చూసి, డౌన్‌లోడ్ చేయండి లేదా తొలగించండి. ఉచితం, ట్రాకింగ్ లేదు.",
    "cancel": "రద్దు",
    "setSound": "ధ్వని ప్రభావాలు",
    "setHaptic": "కంపనం",
    "pronBtn": "మాట్లాడే సాధన",
    "pronRec": "రికార్డ్",
    "pronStop": "ఆపు",
    "pronAgain": "మళ్ళీ రికార్డ్ చేయి",
    "pronModel": "నమూనా",
    "pronYou": "మీ స్వరం",
    "pronCompare": "పోల్చు",
    "pronHelp": "నమూనా వినండి, మీరు రికార్డ్ చేసుకుని చెవితో పోల్చండి. మీ రికార్డింగ్ సేవ్ కాదు.",
    "pronListening": "రికార్డ్ అవుతోంది… ఇప్పుడు మాట్లాడండి",
    "pronDone": "మీ రికార్డింగ్ వినండి లేదా నమూనాతో పోల్చండి.",
    "pronDenied": "మైక్రోఫోన్ బ్లాక్ అయింది. సాధన కోసం బ్రౌజర్ సెట్టింగ్‌లలో అనుమతించండి.",
    "pronNoMic": "ఈ బ్రౌజర్ ఆడియో రికార్డ్ చేయలేదు.",
    "pronEmpty": "ఏదీ రికార్డ్ కాలేదు. మళ్ళీ ప్రయత్నించండి."
  };
  I.kn = {
    "skip": "ವಿಷಯಕ್ಕೆ ಹೋಗಿ",
    "settings": "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    "part": "EknathaLabs ನ ಭಾಗ",
    "privacyNote": "ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲೇ ಕೆಲಸ ಮಾಡುತ್ತದೆ. ನಿಮ್ಮ ಫೈಲ್‌ಗಳು ಮತ್ತು ಪದಗಳು ನಿಮ್ಮ ಸಾಧನದಲ್ಲೇ ಇರುತ್ತವೆ.",
    "mainNav": "ಮುಖ್ಯ",
    "uiLang": "ಇಂಟರ್‌ಫೇಸ್ ಭಾಷೆ",
    "focusLang": "ನಾನು ಕಲಿಯುತ್ತಿರುವ ಭಾಷೆ",
    "scheme": "ರೋಮನ್ ಶೈಲಿ",
    "schSimple": "ಸರಳ",
    "schIast": "ಪಾಂಡಿತ್ಯ",
    "showRoman": "ರೋಮನ್ ಉಚ್ಚಾರಣೆ ತೋರಿಸಿ",
    "on": "ಆನ್",
    "off": "ಆಫ್",
    "voiceSpeed": "ಧ್ವನಿ ವೇಗ",
    "perDay": "ಒಂದು ಅಧಿವೇಶನದಲ್ಲಿ ಪುನರಾವರ್ತನೆ",
    "unlimited": "ಮಿತಿ ಇಲ್ಲ",
    "theme": "ಥೀಮ್",
    "light": "ಲೈಟ್",
    "dark": "ಡಾರ್ಕ್",
    "new": "ಹೊಸ",
    "language": "ಭಾಷೆ",
    "allLangs": "ಎಲ್ಲಾ ಭಾಷೆಗಳು",
    "allStatus": "ಎಲ್ಲಾ",
    "auto": "ತಾನಾಗಿ ಗುರುತಿಸಿ",
    "indianLangs": "ಭಾರತೀಯ ಭಾಷೆಗಳು",
    "otherLangs": "ಇತರ ಭಾಷೆಗಳು",
    "nav_watch": "ನೋಡಿ",
    "nav_read": "ಓದಿ",
    "nav_words": "ನನ್ನ ಪದಗಳು",
    "nav_review": "ಪುನರಾವರ್ತನೆ",
    "nav_scripts": "ಲಿಪಿಗಳು",
    "nav_phrases": "ವಾಕ್ಯಗಳು",
    "homeH": "ನೀವು ನೋಡುವ, ಓದುವುದರಿಂದಲೇ ಮಾತನಾಡುವ ಭಾಷೆಗಳನ್ನು ಕಲಿಯಿರಿ",
    "homeSub": "ನಿಮ್ಮ ಸ್ವಂತ ವೀಡಿಯೊ, ಆಡಿಯೊ ಅಥವಾ ಪಠ್ಯ ತನ್ನಿ. ಯಾವ ಪದವನ್ನಾದರೂ ಒತ್ತಿ ಕೇಳಿ, ಇಂಗ್ಲಿಷ್ ಅಕ್ಷರಗಳಲ್ಲಿ ಉಚ್ಚಾರಣೆ ನೋಡಿ, ಉಳಿಸಿ. ಅಂತರದ ಪುನರಾವರ್ತನೆಯಿಂದ ನೆನಪಿಡಿ. ಉಚಿತ, ಖಾಸಗಿ, ಆಫ್‌ಲೈನ್‌ನಲ್ಲೂ ಕೆಲಸ ಮಾಡುತ್ತದೆ.",
    "statWords": "ಉಳಿಸಿದ ಪದಗಳು",
    "statDue": "ಇಂದಿಗೆ",
    "statStreak": "ಸತತ ದಿನಗಳು",
    "cWatch": "ನಿಮ್ಮ ವೀಡಿಯೊ ಅಥವಾ ಆಡಿಯೊವನ್ನು ಎರಡು ಉಪಶೀರ್ಷಿಕೆ ಸಾಲುಗಳೊಂದಿಗೆ ಪ್ಲೇ ಮಾಡಿ. ಪದಗಳನ್ನು ಒತ್ತಿ, ಸಾಲನ್ನು ಮತ್ತೆ ಕೇಳಿ, ವೇಗ ಕಡಿಮೆ ಮಾಡಿ, ಮಾತನಾಡುವವರನ್ನು ಅನುಕರಿಸಿ.",
    "cRead": "ಯಾವುದೇ ಪಠ್ಯವನ್ನು ಅಂಟಿಸಿ ಅಥವಾ ತೆರೆಯಿರಿ. ಪ್ರತಿ ಪದವನ್ನೂ ಒತ್ತಬಹುದು, ರೋಮನ್ ಉಚ್ಚಾರಣೆ ಮತ್ತು ಓದಿ ಹೇಳುವುದರೊಂದಿಗೆ.",
    "cWords": "ನೀವು ಉಳಿಸಿದ್ದೆಲ್ಲವೂ, CSV, Anki ಮತ್ತು ಬ್ಯಾಕಪ್ ಫೈಲ್‌ಗೆ ರಫ್ತು ಸಹಿತ.",
    "cReview": "ಮರೆಯುವ ಮೊದಲೇ ಮರಳಿ ಬರುವ ಫ್ಲ್ಯಾಶ್‌ಕಾರ್ಡ್‌ಗಳು.",
    "cScripts": "ಅಕ್ಷರಗಳು, ಸ್ವರ ಚಿಹ್ನೆಗಳು, ಅಂಕೆಗಳು. ಕೇಳಿ, ರಸಪ್ರಶ್ನೆ ಆಡಿ, ಬರೆದು ಅಭ್ಯಾಸ ಮಾಡಿ.",
    "cPhrases": "ಹದಿಮೂರು ಭಾಷೆಗಳಲ್ಲಿ 250 ದಿನನಿತ್ಯದ ವಾಕ್ಯಗಳು, ರೋಮನ್ ಉಚ್ಚಾರಣೆ ಮತ್ತು ಧ್ವನಿಯೊಂದಿಗೆ.",
    "dueCount": "{n} ಬಾಕಿ",
    "howH": "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
    "how1": "ನಿಮ್ಮ ವೀಡಿಯೊದೊಂದಿಗೆ ಉಪಶೀರ್ಷಿಕೆ ಫೈಲ್ ತೆರೆಯಿರಿ, ಅಥವಾ ಪಠ್ಯ ಅಂಟಿಸಿ.",
    "how2": "ಗೊತ್ತಿಲ್ಲದ ಪದವನ್ನು ಒತ್ತಿ. ಕೇಳಿ, ಅರ್ಥದೊಂದಿಗೆ ಉಳಿಸಿ.",
    "how3": "ಪುನರಾವರ್ತನೆಗೆ ಬನ್ನಿ. ಕಾರ್ಡ್‌ಗಳು ಸರಿಯಾದ ಸಮಯಕ್ಕೆ ಬರುತ್ತವೆ.",
    "how4": "ಎಲ್ಲವೂ ಈ ಸಾಧನದಲ್ಲೇ ಇರುತ್ತದೆ. ಯಾವಾಗ ಬೇಕಾದರೂ ರಫ್ತು ಮಾಡಿ.",
    "homeNote": "ಧ್ವನಿಗಳು ನಿಮ್ಮ ಸಾಧನದಿಂದ ಬರುತ್ತವೆ. ಭಾರತೀಯ ಭಾಷೆಗಳ ಧ್ವನಿಗಳು ಫೋನ್ ಮತ್ತು ಬ್ರೌಸರ್ ಪ್ರಕಾರ ಬೇರೆಯಾಗುತ್ತವೆ. ಕೇಳಿಸದಿದ್ದರೆ ಸಿಸ್ಟಮ್ ಸೆಟ್ಟಿಂಗ್‌ನಲ್ಲಿ ಒಂದನ್ನು ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ.",
    "noTts": "ಈ ಬ್ರೌಸರ್ ಪಠ್ಯವನ್ನು ಓದಿ ಹೇಳಲು ಸಾಧ್ಯವಿಲ್ಲ.",
    "noVoice": "ಈ ಸಾಧನದಲ್ಲಿ {l} ಧ್ವನಿ ಇಲ್ಲ. ಸಿಸ್ಟಮ್ ಸೆಟ್ಟಿಂಗ್‌ನಲ್ಲಿ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ.",
    "storageFull": "ಉಳಿಸಲಾಗಲಿಲ್ಲ. ಬ್ರೌಸರ್ ಸಂಗ್ರಹ ತುಂಬಿದೆ ಅಥವಾ ನಿರ್ಬಂಧಿತವಾಗಿದೆ.",
    "meaning": "ಅರ್ಥ",
    "status": "ಸ್ಥಿತಿ",
    "st0": "ಹೊಸ",
    "st1": "ಕಲಿಯುತ್ತಿದ್ದೇನೆ",
    "st2": "ಗೊತ್ತು",
    "seenIn": "ವಾಕ್ಯಗಳ ಪಟ್ಟಿಯಲ್ಲೂ ಇದೆ",
    "speak": "ಹೇಳು",
    "close": "ಮುಚ್ಚಿ",
    "update": "ನವೀಕರಿಸಿ",
    "save": "ಪದ ಉಳಿಸಿ",
    "saved": "ಉಳಿಸಲಾಗಿದೆ",
    "remove": "ತೆಗೆದುಹಾಕಿ",
    "speakSentence": "ವಾಕ್ಯ ಓದಿ",
    "translateDevice": "ಸಾಧನದಲ್ಲೇ ಅನುವಾದಿಸಿ",
    "trFail": "ಅನುವಾದ ಲಭ್ಯವಿಲ್ಲ.",
    "lookup": "ಹುಡುಕಿ",
    "opensTab": "ಹೊಸ ಟ್ಯಾಬ್ ತೆರೆಯುತ್ತದೆ",
    "wordDetails": "ಪದದ ವಿವರ",
    "rdLede": "ಪಠ್ಯ ಅಂಟಿಸಿ ಅಥವಾ ತೆರೆಯಿರಿ. ಯಾವ ಪದವನ್ನಾದರೂ ಒತ್ತಿ.",
    "rdPlaceholder": "ಯಾವುದೇ ಭಾಷೆಯ ಪಠ್ಯವನ್ನು ಇಲ್ಲಿ ಅಂಟಿಸಿ",
    "rdText": "ಓದುವ ಪಠ್ಯ",
    "rdEmpty": "ಇನ್ನೂ ತೋರಿಸಲು ಏನೂ ಇಲ್ಲ. ಪಠ್ಯ ಅಂಟಿಸಿ ಅಥವಾ ಮಾದರಿ ಲೋಡ್ ಮಾಡಿ.",
    "rdStats": "{n} ಪದಗಳು, {u} ವಿಭಿನ್ನ. {k} ಗೊತ್ತು, {l} ಕಲಿಯುತ್ತಿದ್ದೇನೆ. ಭಾಷೆ: {lang}",
    "textLang": "ಪಠ್ಯದ ಭಾಷೆ",
    "colorWords": "ಸ್ಥಿತಿಯ ಪ್ರಕಾರ ಪದಗಳಿಗೆ ಬಣ್ಣ",
    "fontSize": "ಅಕ್ಷರ ಗಾತ್ರ",
    "readAloud": "ಓದಿ ಹೇಳಿ",
    "stop": "ನಿಲ್ಲಿಸಿ",
    "sample": "ಮಾದರಿ ಲೋಡ್ ಮಾಡಿ",
    "importTxt": "ಪಠ್ಯ ಫೈಲ್ ತೆರೆಯಿರಿ",
    "clear": "ಅಳಿಸಿ",
    "clickWord": "ವಿವರಕ್ಕಾಗಿ ಪದವನ್ನು ಒತ್ತಿ",
    "wtLede": "ನಿಮ್ಮ ಸ್ವಂತ ವೀಡಿಯೊ ಅಥವಾ ಆಡಿಯೊವನ್ನು ಉಪಶೀರ್ಷಿಕೆ ಫೈಲ್‌ನೊಂದಿಗೆ ಬಳಸಿ. ಏನೂ ಅಪ್‌ಲೋಡ್ ಆಗುವುದಿಲ್ಲ.",
    "wtSetup": "ನಿಮ್ಮ ಫೈಲ್‌ಗಳನ್ನು ಆರಿಸಿ",
    "wtDrop": "ವೀಡಿಯೊ ಅಥವಾ ಆಡಿಯೊ ಮತ್ತು ಉಪಶೀರ್ಷಿಕೆ ಫೈಲ್‌ಗಳನ್ನು ಇಲ್ಲಿ ಬಿಡಿ, ಅಥವಾ ಬಟನ್‌ಗಳನ್ನು ಬಳಸಿ.",
    "wtMedia": "ವೀಡಿಯೊ ಅಥವಾ ಆಡಿಯೊ",
    "wtSub1": "ಉಪಶೀರ್ಷಿಕೆ (ಕಲಿಯುವ ಭಾಷೆ)",
    "wtSub2": "ಉಪಶೀರ್ಷಿಕೆ (ನಿಮ್ಮ ಭಾಷೆ)",
    "subLang": "ಉಪಶೀರ್ಷಿಕೆ ಭಾಷೆ",
    "wtStart": "ಪ್ರಾರಂಭಿಸಿ",
    "wtSample": "ಮಾದರಿ ಪ್ರಯತ್ನಿಸಿ (ಓದಿ ಹೇಳುತ್ತದೆ)",
    "noSubs": "{f} ನಲ್ಲಿ ಉಪಶೀರ್ಷಿಕೆ ಸಿಗಲಿಲ್ಲ. .srt ಅಥವಾ .vtt ಬಳಸಿ.",
    "wtPrivacy": "ಫೈಲ್‌ಗಳು ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲೇ ತೆರೆಯುತ್ತವೆ, ಸಾಧನ ಬಿಟ್ಟು ಹೋಗುವುದಿಲ್ಲ. ವೀಡಿಯೊ ಅಥವಾ ಆಡಿಯೊ ಇಲ್ಲದಿದ್ದರೆ ಸಾಲುಗಳನ್ನು ನಿಮ್ಮ ಸಾಧನದ ಧ್ವನಿ ಓದಿ ಹೇಳುತ್ತದೆ.",
    "wtListenMode": "ಕೇಳುವ ಮೋಡ್: ಸಾಲುಗಳನ್ನು ಓದಿ ಹೇಳಲಾಗುತ್ತದೆ",
    "wtTranscript": "ಲಿಖಿತ ಪಠ್ಯ",
    "playPause": "ಪ್ಲೇ ಅಥವಾ ವಿರಾಮ",
    "prevLine": "ಹಿಂದಿನ ಸಾಲು",
    "nextLine": "ಮುಂದಿನ ಸಾಲು",
    "replay": "ಸಾಲು ಮತ್ತೆ",
    "loopLine": "ಸಾಲು ಪುನರಾವರ್ತಿಸಿ",
    "autoPause": "ಪ್ರತಿ ಸಾಲಿನ ನಂತರ ನಿಲ್ಲಿಸಿ",
    "hideTarget": "ಕಲಿಯುವ ಭಾಷೆಯ ಉಪಶೀರ್ಷಿಕೆ ಮರೆಮಾಡಿ",
    "hideNative": "ನನ್ನ ಭಾಷೆಯ ಉಪಶೀರ್ಷಿಕೆ ಮರೆಮಾಡಿ",
    "blurNative": "ನನ್ನ ಭಾಷೆ ಮಸುಕು",
    "speed": "ವೇಗ",
    "subEarlier": "ಉಪಶೀರ್ಷಿಕೆ ಬೇಗ",
    "subLater": "ಉಪಶೀರ್ಷಿಕೆ ತಡವಾಗಿ",
    "shadow": "ಅನುಕರಿಸಿ",
    "stopRec": "ನಿಲ್ಲಿಸಿ",
    "yourVoice": "ನಿಮ್ಮ ಧ್ವನಿ",
    "orig": "ಮೂಲ",
    "noMic": "ಇಲ್ಲಿ ರೆಕಾರ್ಡಿಂಗ್ ಬೆಂಬಲಿತವಲ್ಲ.",
    "micDenied": "ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ.",
    "wtChange": "ಫೈಲ್‌ಗಳನ್ನು ಬದಲಿಸಿ",
    "wtKeys": "ಕೀಗಳು: Space ಪ್ಲೇ/ವಿರಾಮ, A/D ಅಥವಾ ಬಾಣಗಳು ಹಿಂದೆ/ಮುಂದೆ, R ಮತ್ತೆ, L ಪುನರಾವರ್ತನೆ, P ಪ್ರತಿ ಸಾಲಿನ ನಂತರ ನಿಲ್ಲಿಸಿ.",
    "wdLede": "ನೀವು ಉಳಿಸಿದ ಪದಗಳು. ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮಾತ್ರ ಸಂಗ್ರಹವಾಗುತ್ತವೆ.",
    "wdCount": "{n} ತೋರಿಸಲಾಗಿದೆ, {d} ಈಗ ಬಾಕಿ",
    "wdNoMatch": "ಹೊಂದುವ ಪದಗಳಿಲ್ಲ.",
    "wdEmpty": "ಇನ್ನೂ ಪದಗಳನ್ನು ಉಳಿಸಿಲ್ಲ.",
    "wdEmptySub": "ಓದಿ ಅಥವಾ ನೋಡಿ ತೆರೆದು ಪದವನ್ನು ಒತ್ತಿ ಉಳಿಸಿ.",
    "wdMore": "ಇನ್ನೂ {n} ತೋರಿಸಿಲ್ಲ. ಹುಡುಕಾಟ ಬಳಸಿ.",
    "wdNothing": "ರಫ್ತು ಮಾಡಲು ಏನೂ ಇಲ್ಲ.",
    "wdImported": "{n} ಹೊಸ ಪದಗಳು ಆಮದಾದವು.",
    "wdImportFail": "ಆ ಫೈಲ್ ಓದಲಾಗಲಿಲ್ಲ.",
    "wdPrivacy": "ಬ್ರೌಸರ್ ಡೇಟಾ ಅಳಿಸಿದರೆ ಪಟ್ಟಿ ಹೋಗುತ್ತದೆ, ಆದ್ದರಿಂದ ಆಗಾಗ ಬ್ಯಾಕಪ್ ರಫ್ತು ಮಾಡಿ.",
    "search": "ಹುಡುಕಿ",
    "edit": "ಬದಲಿಸಿ",
    "dueNow": "ಈಗಲೇ",
    "dueToday": "ಇಂದು",
    "dueIn": "{n} ದಿನದಲ್ಲಿ",
    "backup": "ಬ್ಯಾಕಪ್",
    "importWords": "ಆಮದು",
    "rvLede": "ಕಾರ್ಡ್ ತಿರುಗಿಸಿ, ಎಷ್ಟು ನೆನಪಿತ್ತು ಎಂದು ಹೇಳಿ.",
    "rvMode": "ಅಭ್ಯಾಸ ವಿಧಾನ",
    "rvW2M": "ಪದದಿಂದ ಅರ್ಥ",
    "rvM2W": "ಅರ್ಥದಿಂದ ಪದ",
    "rvListen": "ಆಲಿಸುವುದು",
    "rvCloze": "ಖಾಲಿ ತುಂಬಿ",
    "rvStreak": "ಸತತ ದಿನಗಳು: {n}",
    "rvDone": "ಮುಗಿದಿದೆ: {n} ಕಾರ್ಡ್‌ಗಳು",
    "rvDoneSub": "ನಂತರ ಬನ್ನಿ. ತಪ್ಪಿದ ಕಾರ್ಡ್‌ಗಳು ನಿಮಿಷಗಳಲ್ಲಿ, ಉಳಿದವು ದಿನಗಳಲ್ಲಿ ಬರುತ್ತವೆ.",
    "rvNone": "ಏನೂ ಬಾಕಿ ಇಲ್ಲ",
    "rvNoneSub": "ನೀವು ಮುಂದಿದ್ದೀರಿ. ಹೊಸ ಪದಗಳಿಗಾಗಿ ಇನ್ನಷ್ಟು ಓದಿ ಅಥವಾ ನೋಡಿ.",
    "rvWhichWord": "ಈ ಪದ ಯಾವುದು?",
    "rvPlay": "ಪದ ಕೇಳಿ",
    "rvListenQ": "ಕೇಳಿ, ಅರ್ಥ ನೆನಪಿಸಿಕೊಳ್ಳಿ",
    "rvHint": "ಅರ್ಥ",
    "rvShow": "ಉತ್ತರ ತೋರಿಸಿ",
    "rvProgress": "ಅಧಿವೇಶನ ಪ್ರಗತಿ",
    "again": "ಮತ್ತೆ",
    "hard": "ಕಷ್ಟ",
    "good": "ಚೆನ್ನಾಗಿದೆ",
    "easy": "ಸುಲಭ",
    "scLede": "ಅಕ್ಷರಗಳನ್ನು ಕಲಿಯಿರಿ. ಯಾವ ಅಕ್ಷರವನ್ನಾದರೂ ಒತ್ತಿ ಕೇಳಿ, ಬರೆದು ಅಭ್ಯಾಸ ಮಾಡಿ.",
    "scVowels": "ಸ್ವರಗಳು",
    "scCons": "ವ್ಯಂಜನಗಳು",
    "scSigns": "ಸ್ವರ ಚಿಹ್ನೆಗಳು",
    "scSignsNote": "ಅಕ್ಷರ {b} ಮೇಲೆ ತೋರಿಸಲಾಗಿದೆ",
    "scDigits": "ಅಂಕೆಗಳು",
    "scQuiz": "ಸಣ್ಣ ರಸಪ್ರಶ್ನೆ",
    "scQuizQ": "ಈ ಅಕ್ಷರವನ್ನು ಹೇಗೆ ಓದುತ್ತೀರಿ?",
    "scTrace": "ಬರೆದು ನೋಡಿ",
    "scTraceHint": "ಮೇಲೆ ಒಂದು ಅಕ್ಷರವನ್ನು ಒತ್ತಿ, ಇಲ್ಲಿ ಬರೆಯಿರಿ.",
    "correct": "ಸರಿ!",
    "wrongIs": "ಅಲ್ಲ. ಇದು {a}.",
    "next": "ಮುಂದೆ",
    "phLede": "ದಿನನಿತ್ಯದ ವಾಕ್ಯಗಳು. ಯಾವ ಪದವನ್ನಾದರೂ ಒತ್ತಿ ಉಳಿಸಿ.",
    "phNote": "ಈ ವಾಕ್ಯಗಳು ಆರಂಭಿಕ ಸೆಟ್. ನಂಬುವ ಮೊದಲು ಮಾತೃಭಾಷಿಕರಿಂದ ಪರಿಶೀಲಿಸಿ.",
    "cat_greet": "ಶುಭಾಶಯಗಳು",
    "cat_intro": "ಪರಿಚಯ",
    "cat_daily": "ದಿನನಿತ್ಯ",
    "cat_num": "ಸಂಖ್ಯೆಗಳು",
    "slow": "ನಿಧಾನ",
    "nav_say": "ಹೇಳಿ",
    "cSay": "ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ವಾಕ್ಯ ಬರೆದು ತೆಲುಗು, ಹಿಂದಿ, ಕನ್ನಡ, ತಮಿಳು, ಮಲಯಾಳಂ, ಬಂಗಾಳಿ, ಮರಾಠಿ, ಗುಜರಾತಿ, ಅಸ್ಸಾಮಿ, ಕೊರಿಯನ್, ಸ್ಪ್ಯಾನಿಷ್, ಜರ್ಮನ್ ಅಥವಾ ಫ್ರೆಂಚ್‌ನಲ್ಲಿ ಕೇಳಿ.",
    "sayLede": "ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ವಾಕ್ಯ ಬರೆಯಿರಿ. ಬೇರೆ ಭಾಷೆಯಲ್ಲಿ ರೋಮನ್ ಉಚ್ಚಾರಣೆ ಮತ್ತು ಧ್ವನಿಯೊಂದಿಗೆ ಪಡೆಯಿರಿ.",
    "sayPlaceholder": "ಇಂಗ್ಲಿಷ್ ವಾಕ್ಯ ಬರೆಯಿರಿ, ಉದಾಹರಣೆಗೆ: How are you?",
    "sayInput": "ಇಂಗ್ಲಿಷ್ ವಾಕ್ಯ",
    "sayTo": "ಈ ಭಾಷೆಯಲ್ಲಿ ಹೇಳು",
    "sayGo": "ಅನುವಾದಿಸಿ ಹೇಳು",
    "sayEnglish": "ಇಂಗ್ಲಿಷ್ ಹೇಳು",
    "sayResult": "ಫಲಿತಾಂಶ",
    "sayMatch": "ವಾಕ್ಯಗಳ ಪಟ್ಟಿ",
    "sayDevice": "ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ ಅನುವಾದಿಸಲಾಗಿದೆ",
    "sayClosest": "ವಾಕ್ಯಗಳ ಪಟ್ಟಿಯ ಹತ್ತಿರದ ವಾಕ್ಯಗಳು",
    "sayNone": "ಮುಕ್ತ ಅನುವಾದಕ್ಕೆ ಸಾಧನದಲ್ಲೇ ಅನುವಾದಕ ಇರುವ ಬ್ರೌಸರ್ (ಇತ್ತೀಚಿನ Chrome) ಬೇಕು. ವಾಕ್ಯಗಳ ಪಟ್ಟಿಯ ಹತ್ತಿರದ ವಾಕ್ಯಗಳು ಇಲ್ಲಿವೆ.",
    "sayWorking": "ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ ಅನುವಾದಿಸುತ್ತಿದೆ…",
    "sayFail": "ಸಾಧನದ ಅನುವಾದಕ ಈ ಭಾಷಾ ಜೋಡಿಗೆ ಕೆಲಸ ಮಾಡಲಿಲ್ಲ. ವಾಕ್ಯಗಳ ಪಟ್ಟಿಯ ಹತ್ತಿರದ ವಾಕ್ಯಗಳು ಇಲ್ಲಿವೆ.",
    "sayNote": "ಏನೂ ಸರ್ವರ್‌ಗೆ ಕಳುಹಿಸಲ್ಪಡುವುದಿಲ್ಲ. ಯಂತ್ರ ಅನುವಾದ ತಪ್ಪಾಗಬಹುದು, ಮುಖ್ಯ ವಾಕ್ಯಗಳನ್ನು ಮಾತೃಭಾಷಿಕರಿಂದ ಪರಿಶೀಲಿಸಿ.",
    "copy": "ನಕಲಿಸಿ",
    "copied": "ನಕಲಾಯಿತು",
    "cat_food": "ಆಹಾರ",
    "cat_travel": "ಪ್ರಯಾಣ",
    "cat_shop": "ಖರೀದಿ",
    "cat_health": "ಆರೋಗ್ಯ",
    "cat_people": "ಜನರು",
    "cat_time": "ದಿನಗಳು ಮತ್ತು ಸಮಯ",
    "voiceCheck": "ಧ್ವನಿ ಪರೀಕ್ಷೆ",
    "vcLede": "ಈ ಸಾಧನದಲ್ಲಿ ಯಾವ ಧ್ವನಿಗಳು ಕೆಲಸ ಮಾಡುತ್ತವೆ ಎಂದು ನೋಡಿ. ಪ್ರತಿಯೊಂದನ್ನು ಕೇಳಲು ಪರೀಕ್ಷೆ ಒತ್ತಿ. ಯಾವುದೇ ಭಾಷೆಗೆ ಸಾಧನ ಧ್ವನಿ ಇಲ್ಲದಿದ್ದರೆ Bhasha ಸಣ್ಣ ಆಫ್‌ಲೈನ್ ಧ್ವನಿ ಬಳಸಬಹುದು.",
    "vcDevice": "ಸಾಧನದ ಧ್ವನಿ",
    "vcOffline": "ಆಫ್‌ಲೈನ್ ಧ್ವನಿ ಸಿದ್ಧ",
    "vcOfflineAvail": "ಸಾಧನದ ಧ್ವನಿ ಇಲ್ಲ. ಆಫ್‌ಲೈನ್ ಧ್ವನಿ ಲಭ್ಯ",
    "vcNone": "ಧ್ವನಿ ಇಲ್ಲ",
    "vcTest": "ಪರೀಕ್ಷೆ",
    "ovLabel": "ಆಫ್‌ಲೈನ್ ಧ್ವನಿ ಬ್ಯಾಕಪ್",
    "ovAsk": "ಕೇಳು",
    "ovNote": "ಆಫ್‌ಲೈನ್ ಧ್ವನಿ (eSpeak NG) ಸುಮಾರು 18 MB, ಒಮ್ಮೆ ಡೌನ್‌ಲೋಡ್ ಆದ ಮೇಲೆ ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ. ಇದು ಸಾಧನದ ಧ್ವನಿಗಳಿಗಿಂತ ಯಾಂತ್ರಿಕವಾಗಿ ಕೇಳಿಸುತ್ತದೆ.",
    "ovAskQ": "ಈ ಸಾಧನದಲ್ಲಿ {l} ಧ್ವನಿ ಇಲ್ಲ. ಆಫ್‌ಲೈನ್ ಧ್ವನಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಬೇಕೇ (ಸುಮಾರು 18 MB, ಒಮ್ಮೆ)?",
    "ovYes": "ಡೌನ್‌ಲೋಡ್",
    "ovNo": "ಈಗ ಬೇಡ",
    "ovLoading": "ಆಫ್‌ಲೈನ್ ಧ್ವನಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ…",
    "ovFail": "ಆಫ್‌ಲೈನ್ ಧ್ವನಿ ಪ್ಲೇ ಮಾಡಲಾಗಲಿಲ್ಲ.",
    "nav_today": "ಇಂದು",
    "nav_talk": "ಸಂಭಾಷಣೆಗಳು",
    "cToday": "ಪ್ರತಿದಿನ ಒಂದು ಚಿಕ್ಕ ಪಾಠ: ಐದು ಹೊಸ ವಾಕ್ಯಗಳು, ಕೇಳುವ ರಸಪ್ರಶ್ನೆ ಮತ್ತು ನೆನಪಿಸಿಕೊಳ್ಳುವ ಸುತ್ತು.",
    "cTalk": "ನಿಜವಾದ ಸಂಭಾಷಣೆಗಳನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿ: ರೆಸ್ಟೋರೆಂಟ್, ದಾರಿ ಕೇಳುವುದು, ಶಾಪಿಂಗ್, ವೈದ್ಯರು, ಹೋಟೆಲ್. ಒಂದು ವಾಕ್ಯ ಕೇಳಿ, ನಿಮ್ಮ ಉತ್ತರ ಆರಿಸಿ.",
    "tdLede": "ದಿನಕ್ಕೆ ಐದು ಹೊಸ ವಾಕ್ಯಗಳು. ಕಲಿಯಿರಿ, ಕೇಳಿ, ಮರೆಯುವ ಮೊದಲು ಹಳೆಯವನ್ನು ನೆನಪಿಸಿಕೊಳ್ಳಿ.",
    "tdStart": "ಇಂದಿನ ಪಾಠ ಆರಂಭಿಸಿ",
    "tdDone": "ಇಂದಿನ ಪಾಠ ಮುಗಿಯಿತು. ನಾಳೆ ಮತ್ತೆ ಬನ್ನಿ.",
    "tdLearn": "ಕಲಿಯಿರಿ",
    "tdListen": "ಕೇಳಿ",
    "tdRecall": "ನೆನಪಿಸಿಕೊಳ್ಳಿ",
    "tdNext": "ಮುಂದೆ",
    "tdFinish": "ಮುಗಿಸಿ",
    "tdListenQ": "ಕೇಳಿ, ನಂತರ ಅರ್ಥ ಆರಿಸಿ",
    "tdRecallQ": "ಈ ಅರ್ಥದ ವಾಕ್ಯವನ್ನು ಆರಿಸಿ:",
    "tdScore": "ಅಂಕ: {m}ರಲ್ಲಿ {n}",
    "tdBonus": "ಇನ್ನೊಂದು ಪಾಠ ಮಾಡಿ",
    "tdProgress": "{m}ರಲ್ಲಿ {n} ವಾಕ್ಯಗಳನ್ನು ಕಲಿತಿದ್ದೀರಿ",
    "tdRecallN": "ಇಂದು ನೆನಪಿಸಿಕೊಳ್ಳಬೇಕಾದ {n} ಹಳೆಯ ವಾಕ್ಯಗಳು",
    "drLede": "ಒಂದು ಸಂಭಾಷಣೆ ಆರಿಸಿ. ಅವರು ಏನು ಹೇಳುತ್ತಾರೆ ಕೇಳಿ, ನಂತರ ನಿಮ್ಮ ಉತ್ತರ ಆರಿಸಿ.",
    "drPick": "ಸಂಭಾಷಣೆಗಳು",
    "drTurns": "{n} ಸರದಿಗಳು",
    "drThem": "ಅವರು ಹೇಳುತ್ತಾರೆ",
    "drYou": "ನಿಮ್ಮ ಸರದಿ. ಹೇಳಿ:",
    "drHide": "ಕೇಳುವ ಮೋಡ್: ಅವರ ಮಾತು ಮರೆಮಾಡಿ",
    "drTry": "ಸರಿಯಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    "drDone": "ಸಂಭಾಷಣೆ ಮುಗಿಯಿತು",
    "drScore": "ಮೊದಲ ಪ್ರಯತ್ನದಲ್ಲಿ {m}ರಲ್ಲಿ {n} ಸರಿ",
    "drReplay": "ಮತ್ತೆ ಪ್ಲೇ ಮಾಡಿ",
    "drTranscript": "ಪೂರ್ಣ ಸಂಭಾಷಣೆ",
    "drAnother": "ಇನ್ನೊಂದು ಸಂಭಾಷಣೆ",
    "d_meet": "ಒಬ್ಬರನ್ನು ಭೇಟಿಯಾಗುವುದು",
    "d_rest": "ರೆಸ್ಟೋರೆಂಟ್‌ನಲ್ಲಿ",
    "d_dir": "ದಾರಿ ಕೇಳುವುದು",
    "d_shop": "ಶಾಪಿಂಗ್",
    "d_doc": "ವೈದ್ಯರ ಬಳಿ",
    "d_hotel": "ಹೋಟೆಲ್‌ನಲ್ಲಿ",
    "cat_talk": "ಸಂಭಾಷಣೆ",
    "cat_feel": "ಭಾವನೆಗಳು",
    "cat_work": "ಕೆಲಸ ಮತ್ತು ಫೋನ್",
    "cat_home": "ಮನೆ ಮತ್ತು ಹವಾಮಾನ",
    "pvTitle": "ಉಚಿತ ಮತ್ತು ಖಾಸಗಿ",
    "pvLede": "Bhasha ಎಲ್ಲರಿಗೂ ಉಚಿತ. ಖಾತೆ ಇಲ್ಲ, ಜಾಹೀರಾತು ಇಲ್ಲ, ಟ್ರ್ಯಾಕಿಂಗ್ ಇಲ್ಲ. ನೀವು ಮಾಡುವುದೆಲ್ಲ ಈ ಸಾಧನದಲ್ಲೇ ಉಳಿಯುತ್ತದೆ.",
    "pvFree": "ಎಲ್ಲರಿಗೂ ಉಚಿತ",
    "pvFreeT": "ಪಾವತಿ ಇಲ್ಲ, ಸೈನ್-ಅಪ್ ಇಲ್ಲ, ಯಾವುದೂ ಲಾಕ್ ಆಗಿಲ್ಲ. EknathaLabs ಇದನ್ನು ಯಾವಾಗಲೂ ಉಚಿತವಾಗಿರಿಸಲು ಮಾಡುತ್ತದೆ.",
    "pvPriv": "ನಿಮ್ಮ ಸಾಧನದಲ್ಲೇ ಉಳಿಯುತ್ತದೆ",
    "pvPrivT": "ನಿಮ್ಮ ಫೈಲ್‌ಗಳು, ಪದಗಳು ಮತ್ತು ಪ್ರಗತಿ ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮಾತ್ರ ಇರುತ್ತವೆ. ಅವನ್ನು ಕಳುಹಿಸಲು ಸರ್ವರ್ ಇಲ್ಲ.",
    "pvNet": "ಟ್ರ್ಯಾಕಿಂಗ್ ಇಲ್ಲ",
    "pvNetT": "ಅನಲಿಟಿಕ್ಸ್ ಇಲ್ಲ, ಕುಕೀಗಳಿಲ್ಲ, ಹೊರಗಿನ ಸ್ಕ್ರಿಪ್ಟ್‌ಗಳಿಲ್ಲ. ಫಾಂಟ್‌ಗಳು ಮತ್ತು ಆಫ್‌ಲೈನ್ ಧ್ವನಿ ಈ ಸೈಟ್‌ನಿಂದಲೇ ಬರುತ್ತವೆ. ಹೊರಗಿನ ನಿಘಂಟು ಲಿಂಕ್‌ಗಳು ನೀವು ಒತ್ತಿದರೆ ಮಾತ್ರ ತೆರೆಯುತ್ತವೆ.",
    "pvMic": "ನಿಮ್ಮ ಧ್ವನಿ",
    "pvMicT": "ಉಚ್ಚಾರಣೆಯ ರೆಕಾರ್ಡಿಂಗ್ ಪುಟ ತೆರೆದಿರುವವರೆಗೆ ಮಾತ್ರ ಮೆಮೊರಿಯಲ್ಲಿರುತ್ತದೆ. ಅದನ್ನು ಎಂದಿಗೂ ಉಳಿಸುವುದಿಲ್ಲ, ಅಪ್‌ಲೋಡ್ ಮಾಡುವುದಿಲ್ಲ.",
    "pvStored": "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಉಳಿಸಿದ್ದು",
    "pvWords": "ಉಳಿಸಿದ ಪದಗಳು",
    "pvLesson": "ಪಾಠದ ವಾಕ್ಯಗಳು",
    "pvStats": "ಅಧ್ಯಯನದ ದಿನಗಳು",
    "pvSet": "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    "pvItems": "{n} ಅಂಶಗಳು",
    "pvTotal": "ಒಟ್ಟು: {n}",
    "pvExport": "ನನ್ನ ಡೇಟಾ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    "pvImport": "ಫೈಲ್‌ನಿಂದ ಮರುಸ್ಥಾಪಿಸಿ",
    "pvClear": "ನನ್ನ ಎಲ್ಲಾ ಡೇಟಾ ಅಳಿಸಿ",
    "pvClearAsk": "ಈ ಬ್ರೌಸರ್‌ನಿಂದ ಉಳಿಸಿದ ಪದಗಳು, ಪಾಠದ ಪ್ರಗತಿ, ಅಧ್ಯಯನ ಇತಿಹಾಸ ಮತ್ತು ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಅಳಿಸಬೇಕೇ? ಇದನ್ನು ಹಿಂದಕ್ಕೆ ಪಡೆಯಲಾಗದು. ಇಟ್ಟುಕೊಳ್ಳಬೇಕಾದರೆ ಮೊದಲು ಒಂದು ಪ್ರತಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.",
    "pvClearYes": "ಹೌದು, ಎಲ್ಲವನ್ನೂ ಅಳಿಸಿ",
    "pvCleared": "ಎಲ್ಲಾ ಡೇಟಾ ಅಳಿಸಲಾಗಿದೆ",
    "pvImported": "ಡೇಟಾ ಮರುಸ್ಥಾಪಿಸಲಾಗಿದೆ",
    "pvBadFile": "ಇದು Bhasha ಬ್ಯಾಕಪ್ ಫೈಲ್ ಅಲ್ಲ",
    "pvLicence": "Bhasha EknathaLabs ನ ಭಾಗ. ಐಚ್ಛಿಕ ಆಫ್‌ಲೈನ್ ಧ್ವನಿ (eSpeak NG) GPL-3.0 ಅಡಿಯಲ್ಲಿ ಓಪನ್ ಸೋರ್ಸ್ ಆಗಿದ್ದು, ನೀವು ಅನುಮತಿಸಿದರೆ ಮಾತ್ರ ಈ ಸೈಟ್‌ನಿಂದ ಡೌನ್‌ಲೋಡ್ ಆಗುತ್ತದೆ.",
    "pvBadge": "ಉಚಿತ · ಖಾಸಗಿ · ಆಫ್‌ಲೈನ್",
    "cPrivacy": "ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ ಏನಿದೆ ಎಂದು ನೋಡಿ, ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಅಳಿಸಿ. ಉಚಿತ, ಟ್ರ್ಯಾಕಿಂಗ್ ಇಲ್ಲ.",
    "cancel": "ರದ್ದುಮಾಡಿ",
    "setSound": "ಧ್ವನಿ ಪರಿಣಾಮಗಳು",
    "setHaptic": "ಕಂಪನ",
    "pronBtn": "ಮಾತನಾಡುವ ಅಭ್ಯಾಸ",
    "pronRec": "ರೆಕಾರ್ಡ್",
    "pronStop": "ನಿಲ್ಲಿಸಿ",
    "pronAgain": "ಮತ್ತೆ ರೆಕಾರ್ಡ್ ಮಾಡಿ",
    "pronModel": "ಮಾದರಿ",
    "pronYou": "ನಿಮ್ಮ ಧ್ವನಿ",
    "pronCompare": "ಹೋಲಿಸಿ",
    "pronHelp": "ಮಾದರಿಯನ್ನು ಕೇಳಿ, ನೀವೇ ರೆಕಾರ್ಡ್ ಮಾಡಿ, ಕಿವಿಯಿಂದ ಹೋಲಿಸಿ. ನಿಮ್ಮ ರೆಕಾರ್ಡಿಂಗ್ ಉಳಿಯುವುದಿಲ್ಲ.",
    "pronListening": "ರೆಕಾರ್ಡ್ ಆಗುತ್ತಿದೆ… ಈಗ ಮಾತನಾಡಿ",
    "pronDone": "ನಿಮ್ಮ ರೆಕಾರ್ಡಿಂಗ್ ಕೇಳಿ ಅಥವಾ ಮಾದರಿಯೊಂದಿಗೆ ಹೋಲಿಸಿ.",
    "pronDenied": "ಮೈಕ್ರೋಫೋನ್ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ಅಭ್ಯಾಸಕ್ಕಾಗಿ ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಅನುಮತಿಸಿ.",
    "pronNoMic": "ಈ ಬ್ರೌಸರ್ ಆಡಿಯೊ ರೆಕಾರ್ಡ್ ಮಾಡಲಾರದು.",
    "pronEmpty": "ಏನೂ ರೆಕಾರ್ಡ್ ಆಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
  };
  I.ta = {
    "skip": "உள்ளடக்கத்துக்குச் செல்லவும்",
    "settings": "அமைப்புகள்",
    "part": "EknathaLabs இன் பகுதி",
    "privacyNote": "உங்கள் உலாவியிலேயே இயங்குகிறது. உங்கள் கோப்புகளும் சொற்களும் உங்கள் சாதனத்திலேயே இருக்கும்.",
    "mainNav": "முதன்மை",
    "uiLang": "இடைமுக மொழி",
    "focusLang": "நான் கற்கும் மொழி",
    "scheme": "ரோமன் பாணி",
    "schSimple": "எளிய",
    "schIast": "அறிஞர்",
    "showRoman": "ரோமன் உச்சரிப்பைக் காட்டு",
    "on": "இயக்கு",
    "off": "நிறுத்து",
    "voiceSpeed": "குரல் வேகம்",
    "perDay": "ஒரு அமர்வின் மீளாய்வுகள்",
    "unlimited": "வரம்பு இல்லை",
    "theme": "தீம்",
    "light": "ஒளி",
    "dark": "இருள்",
    "new": "புதிய",
    "language": "மொழி",
    "allLangs": "அனைத்து மொழிகள்",
    "allStatus": "அனைத்தும்",
    "auto": "தானாகக் கண்டறி",
    "indianLangs": "இந்திய மொழிகள்",
    "otherLangs": "பிற மொழிகள்",
    "nav_watch": "பார்",
    "nav_read": "படி",
    "nav_words": "என் சொற்கள்",
    "nav_review": "மீளாய்வு",
    "nav_scripts": "எழுத்துகள்",
    "nav_phrases": "சொற்றொடர்கள்",
    "homeH": "நீங்கள் பார்ப்பதிலும் படிப்பதிலும் இருந்தே பேசும் மொழிகளைக் கற்கலாம்",
    "homeSub": "உங்கள் சொந்த வீடியோ, ஆடியோ அல்லது உரையைக் கொண்டு வாருங்கள். எந்தச் சொல்லையும் தொட்டுக் கேளுங்கள், ஆங்கில எழுத்துகளில் உச்சரிப்பைப் பாருங்கள், சேமியுங்கள். இடைவெளி மீள்பயிற்சியால் நினைவில் வையுங்கள். இலவசம், தனிப்பட்டது, இணையமின்றியும் இயங்கும்.",
    "statWords": "சேமித்த சொற்கள்",
    "statDue": "இன்று",
    "statStreak": "தொடர் நாட்கள்",
    "cWatch": "உங்கள் வீடியோ அல்லது ஆடியோவை இரண்டு வசன வரிகளுடன் இயக்குங்கள். சொற்களைத் தொடுங்கள், வரியை மீண்டும் கேளுங்கள், வேகத்தைக் குறையுங்கள், பேசுபவரைப் பின்பற்றுங்கள்.",
    "cRead": "எந்த உரையையும் ஒட்டவும் அல்லது திறக்கவும். ஒவ்வொரு சொல்லும் தொடக்கூடியது, ரோமன் உச்சரிப்பு, வாசித்துக் காட்டுதலுடன்.",
    "cWords": "நீங்கள் சேமித்தவை அனைத்தும், CSV, Anki, காப்புக் கோப்பாக ஏற்றுமதியுடன்.",
    "cReview": "மறப்பதற்கு முன்பே திரும்பி வரும் ஃபிளாஷ் கார்டுகள்.",
    "cScripts": "எழுத்துகள், உயிர்மெய் குறிகள், எண்கள். கேளுங்கள், வினாடி வினா, எழுதிப் பழகுங்கள்.",
    "cPhrases": "பதின்மூன்று மொழிகளில் 250 அன்றாட வாக்கியங்கள், ரோமன் உச்சரிப்பு மற்றும் குரலுடன்.",
    "dueCount": "{n} நிலுவை",
    "howH": "இது எப்படி வேலை செய்கிறது",
    "how1": "உங்கள் வீடியோவுடன் வசனக் கோப்பைத் திறக்கவும், அல்லது உரையை ஒட்டவும்.",
    "how2": "தெரியாத சொல்லைத் தொடுங்கள். கேட்டு, பொருளுடன் சேமியுங்கள்.",
    "how3": "மீளாய்வுக்கு வாருங்கள். அட்டைகள் சரியான நேரத்தில் திரும்பும்.",
    "how4": "எல்லாம் இந்தச் சாதனத்திலேயே இருக்கும். எப்போது வேண்டுமானாலும் ஏற்றுமதி செய்யலாம்.",
    "homeNote": "குரல்கள் உங்கள் சாதனத்திலிருந்து வருகின்றன. இந்திய மொழிக் குரல்கள் தொலைபேசி, உலாவிக்கு ஏற்ப மாறும். கேட்கவில்லையெனில் கணினி அமைப்புகளில் ஒன்றை நிறுவவும்.",
    "noTts": "இந்த உலாவி உரையை வாசித்துக் காட்ட முடியாது.",
    "noVoice": "இந்தச் சாதனத்தில் {l} குரல் இல்லை. கணினி அமைப்புகளில் நிறுவவும்.",
    "storageFull": "சேமிக்க முடியவில்லை. உலாவி சேமிப்பு நிரம்பியுள்ளது அல்லது தடுக்கப்பட்டுள்ளது.",
    "meaning": "பொருள்",
    "status": "நிலை",
    "st0": "புதியது",
    "st1": "கற்கிறேன்",
    "st2": "தெரியும்",
    "seenIn": "சொற்றொடர் பட்டியலிலும் உள்ளது",
    "speak": "சொல்",
    "close": "மூடு",
    "update": "புதுப்பி",
    "save": "சொல்லைச் சேமி",
    "saved": "சேமிக்கப்பட்டது",
    "remove": "நீக்கு",
    "speakSentence": "வாக்கியம் வாசி",
    "translateDevice": "சாதனத்தில் மொழிபெயர்",
    "trFail": "மொழிபெயர்ப்பு கிடைக்கவில்லை.",
    "lookup": "தேடு",
    "opensTab": "புதிய தாவல் திறக்கும்",
    "wordDetails": "சொல் விவரம்",
    "rdLede": "உரையை ஒட்டவும் அல்லது திறக்கவும். எந்தச் சொல்லையும் தொடுங்கள்.",
    "rdPlaceholder": "எந்த மொழியிலும் உரையை இங்கே ஒட்டவும்",
    "rdText": "படிக்கும் உரை",
    "rdEmpty": "காட்ட இன்னும் எதுவும் இல்லை. உரையை ஒட்டவும் அல்லது மாதிரியை ஏற்றவும்.",
    "rdStats": "{n} சொற்கள், {u} வேறுபட்டவை. {k} தெரியும், {l} கற்கிறேன். மொழி: {lang}",
    "textLang": "உரை மொழி",
    "colorWords": "நிலைக்கு ஏற்ப சொற்களுக்கு நிறம்",
    "fontSize": "எழுத்து அளவு",
    "readAloud": "வாசித்துக் காட்டு",
    "stop": "நிறுத்து",
    "sample": "மாதிரியை ஏற்று",
    "importTxt": "உரைக் கோப்பைத் திற",
    "clear": "அழி",
    "clickWord": "விவரத்துக்குச் சொல்லைத் தொடுங்கள்",
    "wtLede": "உங்கள் சொந்த வீடியோ அல்லது ஆடியோவை வசனக் கோப்புடன் பயன்படுத்துங்கள். எதுவும் பதிவேற்றப்படாது.",
    "wtSetup": "உங்கள் கோப்புகளைத் தேர்ந்தெடுங்கள்",
    "wtDrop": "வீடியோ அல்லது ஆடியோ மற்றும் வசனக் கோப்புகளை இங்கே விடுங்கள், அல்லது பொத்தான்களைப் பயன்படுத்துங்கள்.",
    "wtMedia": "வீடியோ அல்லது ஆடியோ",
    "wtSub1": "வசனம் (கற்கும் மொழி)",
    "wtSub2": "வசனம் (உங்கள் மொழி)",
    "subLang": "வசன மொழி",
    "wtStart": "தொடங்கு",
    "wtSample": "மாதிரியை முயலுங்கள் (வாசித்துக் காட்டும்)",
    "noSubs": "{f} இல் வசனங்கள் இல்லை. .srt அல்லது .vtt பயன்படுத்துங்கள்.",
    "wtPrivacy": "கோப்புகள் உங்கள் உலாவியிலேயே திறக்கப்படும், சாதனத்தை விட்டு வெளியே செல்லாது. வீடியோ அல்லது ஆடியோ இல்லையெனில் வரிகளை உங்கள் சாதனக் குரல் வாசிக்கும்.",
    "wtListenMode": "கேட்கும் முறை: வரிகள் வாசிக்கப்படும்",
    "wtTranscript": "எழுத்து வடிவம்",
    "playPause": "இயக்கு அல்லது இடைநிறுத்து",
    "prevLine": "முந்தைய வரி",
    "nextLine": "அடுத்த வரி",
    "replay": "வரியை மீண்டும்",
    "loopLine": "வரியைத் திரும்பத் திரும்ப",
    "autoPause": "ஒவ்வொரு வரிக்கும் பின் நிறுத்து",
    "hideTarget": "கற்கும் மொழி வசனத்தை மறை",
    "hideNative": "என் மொழி வசனத்தை மறை",
    "blurNative": "என் மொழியை மங்கலாக்கு",
    "speed": "வேகம்",
    "subEarlier": "வசனம் முன்னதாக",
    "subLater": "வசனம் தாமதமாக",
    "shadow": "பின்பற்று",
    "stopRec": "நிறுத்து",
    "yourVoice": "உங்கள் குரல்",
    "orig": "அசல்",
    "noMic": "இங்கே பதிவு ஆதரிக்கப்படவில்லை.",
    "micDenied": "ஒலிவாங்கி அனுமதி மறுக்கப்பட்டது.",
    "wtChange": "கோப்புகளை மாற்று",
    "wtKeys": "விசைகள்: Space இயக்கு/நிறுத்து, A/D அல்லது அம்புகள் முந்தைய/அடுத்த, R மீண்டும், L திரும்பத் திரும்ப, P ஒவ்வொரு வரிக்கும் பின் நிறுத்து.",
    "wdLede": "நீங்கள் சேமித்த சொற்கள். இந்த உலாவியில் மட்டுமே சேமிக்கப்படும்.",
    "wdCount": "{n} காட்டப்படுகின்றன, {d} இப்போது நிலுவை",
    "wdNoMatch": "பொருந்தும் சொற்கள் இல்லை.",
    "wdEmpty": "இன்னும் சொற்கள் சேமிக்கப்படவில்லை.",
    "wdEmptySub": "படி அல்லது பார் பகுதியைத் திறந்து சொல்லைத் தொட்டுச் சேமியுங்கள்.",
    "wdMore": "மேலும் {n} காட்டப்படவில்லை. தேடலைப் பயன்படுத்துங்கள்.",
    "wdNothing": "ஏற்றுமதி செய்ய எதுவும் இல்லை.",
    "wdImported": "{n} புதிய சொற்கள் இறக்குமதியாயின.",
    "wdImportFail": "அந்தக் கோப்பைப் படிக்க முடியவில்லை.",
    "wdPrivacy": "உலாவித் தரவை அழித்தால் பட்டியல் போய்விடும், எனவே அவ்வப்போது காப்புப் பிரதி எடுங்கள்.",
    "search": "தேடு",
    "edit": "திருத்து",
    "dueNow": "இப்போதே",
    "dueToday": "இன்று",
    "dueIn": "{n} நாளில்",
    "backup": "காப்புப் பிரதி",
    "importWords": "இறக்குமதி",
    "rvLede": "அட்டையைத் திருப்புங்கள், எவ்வளவு நினைவிருந்தது என்று சொல்லுங்கள்.",
    "rvMode": "பயிற்சி முறை",
    "rvW2M": "சொல்லிலிருந்து பொருள்",
    "rvM2W": "பொருளிலிருந்து சொல்",
    "rvListen": "கேட்டல்",
    "rvCloze": "இடைவெளியை நிரப்புக",
    "rvStreak": "தொடர் நாட்கள்: {n}",
    "rvDone": "முடிந்தது: {n} அட்டைகள்",
    "rvDoneSub": "பின்னர் வாருங்கள். தவறியவை நிமிடங்களில், மற்றவை நாட்களில் திரும்பும்.",
    "rvNone": "எதுவும் நிலுவையில்லை",
    "rvNoneSub": "நீங்கள் முன்னிலையில் உள்ளீர்கள். புதிய சொற்களுக்கு மேலும் படியுங்கள் அல்லது பாருங்கள்.",
    "rvWhichWord": "இந்தச் சொல் எது?",
    "rvPlay": "சொல்லைக் கேள்",
    "rvListenQ": "கேட்டு, பொருளை நினைவுகூருங்கள்",
    "rvHint": "பொருள்",
    "rvShow": "விடையைக் காட்டு",
    "rvProgress": "அமர்வு முன்னேற்றம்",
    "again": "மீண்டும்",
    "hard": "கடினம்",
    "good": "நன்று",
    "easy": "எளிது",
    "scLede": "எழுத்துகளைக் கற்கலாம். எந்த எழுத்தையும் தொட்டுக் கேளுங்கள், எழுதிப் பழகுங்கள்.",
    "scVowels": "உயிரெழுத்துகள்",
    "scCons": "மெய்யெழுத்துகள்",
    "scSigns": "உயிர்மெய் குறிகள்",
    "scSignsNote": "{b} எழுத்தின் மீது காட்டப்பட்டவை",
    "scDigits": "எண்கள்",
    "scQuiz": "சிறு வினாடி வினா",
    "scQuizQ": "இந்த எழுத்தை எப்படிப் படிப்பீர்கள்?",
    "scTrace": "எழுதிப் பாருங்கள்",
    "scTraceHint": "மேலே ஓர் எழுத்தைத் தொட்டு, இங்கே எழுதுங்கள்.",
    "correct": "சரி!",
    "wrongIs": "இல்லை. இது {a}.",
    "next": "அடுத்து",
    "phLede": "அன்றாடச் சொற்றொடர்கள். எந்தச் சொல்லையும் தொட்டுச் சேமியுங்கள்.",
    "phNote": "இந்தச் சொற்றொடர்கள் தொடக்கத் தொகுப்பு. நம்புவதற்கு முன் தாய்மொழிப் பேச்சாளரிடம் சரிபாருங்கள்.",
    "cat_greet": "வாழ்த்துகள்",
    "cat_intro": "அறிமுகம்",
    "cat_daily": "அன்றாடம்",
    "cat_num": "எண்கள்",
    "slow": "மெதுவாக",
    "nav_say": "சொல்",
    "cSay": "ஆங்கிலத்தில் வாக்கியம் எழுதி தெலுங்கு, இந்தி, கன்னடம், தமிழ், மலையாளம், வங்காளம், மராத்தி, குஜராத்தி, அசாமி, கொரியன், ஸ்பானிஷ், ஜெர்மன் அல்லது பிரெஞ்சில் கேளுங்கள்.",
    "sayLede": "ஆங்கிலத்தில் வாக்கியம் எழுதுங்கள். வேறொரு மொழியில் ரோமன் உச்சரிப்பு, குரலுடன் பெறுங்கள்.",
    "sayPlaceholder": "ஆங்கில வாக்கியத்தை எழுதுங்கள், எ.கா: How are you?",
    "sayInput": "ஆங்கில வாக்கியம்",
    "sayTo": "இந்த மொழியில் சொல்",
    "sayGo": "மொழிபெயர்த்துச் சொல்",
    "sayEnglish": "ஆங்கிலம் சொல்",
    "sayResult": "முடிவு",
    "sayMatch": "சொற்றொடர் பட்டியல்",
    "sayDevice": "உங்கள் சாதனத்தில் மொழிபெயர்க்கப்பட்டது",
    "sayClosest": "சொற்றொடர் பட்டியலின் நெருங்கிய வாக்கியங்கள்",
    "sayNone": "சுதந்திர மொழிபெயர்ப்புக்கு சாதனத்திலேயே மொழிபெயர்ப்பி உள்ள உலாவி (சமீபத்திய Chrome) தேவை. சொற்றொடர் பட்டியலின் நெருங்கிய வாக்கியங்கள் இதோ.",
    "sayWorking": "உங்கள் சாதனத்தில் மொழிபெயர்க்கிறது…",
    "sayFail": "சாதன மொழிபெயர்ப்பி இந்த மொழி ஜோடிக்கு வேலை செய்யவில்லை. சொற்றொடர் பட்டியலின் நெருங்கிய வாக்கியங்கள் இதோ.",
    "sayNote": "எதுவும் சேவையகத்துக்கு அனுப்பப்படாது. இயந்திர மொழிபெயர்ப்பு தவறாகலாம், முக்கிய வாக்கியங்களைத் தாய்மொழியாளரிடம் சரிபாருங்கள்.",
    "copy": "நகலெடு",
    "copied": "நகலெடுக்கப்பட்டது",
    "cat_food": "உணவு",
    "cat_travel": "பயணம்",
    "cat_shop": "கடைப்பயணம்",
    "cat_health": "உடல்நலம்",
    "cat_people": "மக்கள்",
    "cat_time": "நாட்களும் நேரமும்",
    "voiceCheck": "குரல் சோதனை",
    "vcLede": "இந்தச் சாதனத்தில் எந்தக் குரல்கள் வேலை செய்கின்றன என்று பாருங்கள். ஒவ்வொன்றையும் கேட்க சோதனை அழுத்துங்கள். ஒரு மொழிக்குச் சாதனக் குரல் இல்லையெனில் Bhasha சிறிய இணையமில்லாக் குரலைப் பயன்படுத்தலாம்.",
    "vcDevice": "சாதனக் குரல்",
    "vcOffline": "இணையமில்லாக் குரல் தயார்",
    "vcOfflineAvail": "சாதனக் குரல் இல்லை. இணையமில்லாக் குரல் கிடைக்கும்",
    "vcNone": "குரல் இல்லை",
    "vcTest": "சோதனை",
    "ovLabel": "இணையமில்லாக் குரல் காப்பு",
    "ovAsk": "கேள்",
    "ovNote": "இணையமில்லாக் குரல் (eSpeak NG) சுமார் 18 MB, ஒருமுறை பதிவிறக்கியபின் இணையம் இல்லாமல் வேலை செய்யும். இது சாதனக் குரல்களை விட இயந்திரத்தனமாக ஒலிக்கும்.",
    "ovAskQ": "இந்தச் சாதனத்தில் {l} குரல் இல்லை. இணையமில்லாக் குரலைப் பதிவிறக்கவா (சுமார் 18 MB, ஒருமுறை)?",
    "ovYes": "பதிவிறக்கு",
    "ovNo": "இப்போது வேண்டாம்",
    "ovLoading": "இணையமில்லாக் குரல் ஏற்றப்படுகிறது…",
    "ovFail": "இணையமில்லாக் குரலை இயக்க முடியவில்லை.",
    "nav_today": "இன்று",
    "nav_talk": "உரையாடல்கள்",
    "cToday": "தினமும் ஒரு சிறிய பாடம்: ஐந்து புதிய வாக்கியங்கள், கேட்டு பதிலளிக்கும் வினாடி வினா, நினைவுகூரும் சுற்று.",
    "cTalk": "உண்மையான உரையாடல்களைப் பயிற்சி செய்யுங்கள்: உணவகம், வழி கேட்பது, ஷாப்பிங், மருத்துவர், ஹோட்டல். ஒரு வரியைக் கேட்டு உங்கள் பதிலைத் தேர்ந்தெடுங்கள்.",
    "tdLede": "தினமும் ஐந்து புதிய வாக்கியங்கள். கற்று, கேட்டு, மறப்பதற்கு முன் பழையவற்றை நினைவுகூருங்கள்.",
    "tdStart": "இன்றைய பாடத்தைத் தொடங்குங்கள்",
    "tdDone": "இன்றைய பாடம் முடிந்தது. நாளை மீண்டும் வாருங்கள்.",
    "tdLearn": "கற்க",
    "tdListen": "கேட்க",
    "tdRecall": "நினைவுகூர்",
    "tdNext": "அடுத்து",
    "tdFinish": "முடி",
    "tdListenQ": "கேட்டு, பொருளைத் தேர்ந்தெடுங்கள்",
    "tdRecallQ": "இந்தப் பொருள் தரும் வாக்கியத்தைத் தேர்ந்தெடுங்கள்:",
    "tdScore": "மதிப்பெண்: {m}-இல் {n}",
    "tdBonus": "கூடுதல் பாடம் செய்",
    "tdProgress": "{m}-இல் {n} வாக்கியங்கள் கற்றுள்ளீர்கள்",
    "tdRecallN": "இன்று நினைவுகூர வேண்டிய {n} பழைய வாக்கியங்கள்",
    "drLede": "ஒரு உரையாடலைத் தேர்ந்தெடுங்கள். அவர்கள் சொல்வதைக் கேட்டு, உங்கள் பதிலைத் தேர்ந்தெடுங்கள்.",
    "drPick": "உரையாடல்கள்",
    "drTurns": "{n} முறைகள்",
    "drThem": "அவர்கள் சொல்வது",
    "drYou": "உங்கள் முறை. சொல்லுங்கள்:",
    "drHide": "கேட்கும் முறை: அவர்கள் சொல்வதை மறை",
    "drTry": "சரியில்லை. மீண்டும் முயலுங்கள்.",
    "drDone": "உரையாடல் முடிந்தது",
    "drScore": "முதல் முயற்சியில் {m}-இல் {n} சரி",
    "drReplay": "மீண்டும் இயக்கு",
    "drTranscript": "முழு உரையாடல்",
    "drAnother": "மற்றொரு உரையாடல்",
    "d_meet": "ஒருவரைச் சந்தித்தல்",
    "d_rest": "உணவகத்தில்",
    "d_dir": "வழி கேட்டல்",
    "d_shop": "ஷாப்பிங்",
    "d_doc": "மருத்துவரிடம்",
    "d_hotel": "ஹோட்டலில்",
    "cat_talk": "உரையாடல்",
    "cat_feel": "உணர்வுகள்",
    "cat_work": "வேலை மற்றும் தொலைபேசி",
    "cat_home": "வீடு மற்றும் வானிலை",
    "pvTitle": "இலவசம் மற்றும் தனிப்பட்டது",
    "pvLede": "Bhasha அனைவருக்கும் இலவசம். கணக்கு இல்லை, விளம்பரம் இல்லை, கண்காணிப்பு இல்லை. நீங்கள் செய்வதெல்லாம் இந்தச் சாதனத்திலேயே இருக்கும்.",
    "pvFree": "அனைவருக்கும் இலவசம்",
    "pvFreeT": "கட்டணம் இல்லை, பதிவு இல்லை, எதுவும் பூட்டப்படவில்லை. EknathaLabs இதை எப்போதும் இலவசமாக வைத்திருக்க உருவாக்குகிறது.",
    "pvPriv": "உங்கள் சாதனத்திலேயே இருக்கும்",
    "pvPrivT": "உங்கள் கோப்புகள், சொற்கள், முன்னேற்றம் இந்த உலாவியில் மட்டுமே இருக்கும். அவற்றை அனுப்ப சேவையகம் இல்லை.",
    "pvNet": "கண்காணிப்பு இல்லை",
    "pvNetT": "பகுப்பாய்வு இல்லை, குக்கீகள் இல்லை, வெளி ஸ்கிரிப்ட்கள் இல்லை. எழுத்துருக்களும் ஆஃப்லைன் குரலும் இந்தத் தளத்திலிருந்தே வருகின்றன. வெளி அகராதி இணைப்புகள் நீங்கள் தொட்டால் மட்டுமே திறக்கும்.",
    "pvMic": "உங்கள் குரல்",
    "pvMicT": "உச்சரிப்புப் பதிவு பக்கம் திறந்திருக்கும் வரை மட்டுமே நினைவகத்தில் இருக்கும். அது ஒருபோதும் சேமிக்கப்படாது, பதிவேற்றப்படாது.",
    "pvStored": "இந்த உலாவியில் சேமித்தவை",
    "pvWords": "சேமித்த சொற்கள்",
    "pvLesson": "பாடச் சொற்றொடர்கள்",
    "pvStats": "படித்த நாட்கள்",
    "pvSet": "அமைப்புகள்",
    "pvItems": "{n} உருப்படிகள்",
    "pvTotal": "மொத்தம்: {n}",
    "pvExport": "என் தரவைப் பதிவிறக்கு",
    "pvImport": "கோப்பிலிருந்து மீட்டெடு",
    "pvClear": "என் தரவு அனைத்தையும் நீக்கு",
    "pvClearAsk": "இந்த உலாவியிலிருந்து சேமித்த சொற்கள், பாட முன்னேற்றம், படிப்பு வரலாறு, அமைப்புகளை நீக்கவா? இதைத் திரும்பப் பெற முடியாது. வைத்துக்கொள்ள விரும்பினால் முதலில் ஒரு நகலைப் பதிவிறக்குங்கள்.",
    "pvClearYes": "ஆம், அனைத்தையும் நீக்கு",
    "pvCleared": "எல்லாத் தரவும் நீக்கப்பட்டது",
    "pvImported": "தரவு மீட்டெடுக்கப்பட்டது",
    "pvBadFile": "இது Bhasha காப்புக் கோப்பு அல்ல",
    "pvLicence": "Bhasha EknathaLabs-இன் ஒரு பகுதி. விருப்பமான ஆஃப்லைன் குரல் (eSpeak NG) GPL-3.0 கீழ் திறந்த மூலம்; நீங்கள் அனுமதித்தால் மட்டுமே இந்தத் தளத்திலிருந்து பதிவிறங்கும்.",
    "pvBadge": "இலவசம் · தனிப்பட்டது · ஆஃப்லைன்",
    "cPrivacy": "உங்கள் சாதனத்தில் என்ன இருக்கிறது என்று பார்த்து, பதிவிறக்குங்கள் அல்லது நீக்குங்கள். இலவசம், கண்காணிப்பு இல்லை.",
    "cancel": "ரத்து செய்",
    "setSound": "ஒலி விளைவுகள்",
    "setHaptic": "அதிர்வு",
    "pronBtn": "பேச்சுப் பயிற்சி",
    "pronRec": "பதிவு செய்",
    "pronStop": "நிறுத்து",
    "pronAgain": "மீண்டும் பதிவு செய்",
    "pronModel": "மாதிரி",
    "pronYou": "உங்கள் குரல்",
    "pronCompare": "ஒப்பிடு",
    "pronHelp": "மாதிரியைக் கேளுங்கள், நீங்களே பதிவு செய்து காதால் ஒப்பிடுங்கள். உங்கள் பதிவு சேமிக்கப்படாது.",
    "pronListening": "பதிவாகிறது… இப்போது பேசுங்கள்",
    "pronDone": "உங்கள் பதிவைக் கேளுங்கள் அல்லது மாதிரியுடன் ஒப்பிடுங்கள்.",
    "pronDenied": "மைக்ரோஃபோன் தடுக்கப்பட்டுள்ளது. பயிற்சிக்கு உலாவி அமைப்புகளில் அனுமதியுங்கள்.",
    "pronNoMic": "இந்த உலாவியால் ஆடியோ பதிவு செய்ய முடியாது.",
    "pronEmpty": "எதுவும் பதிவாகவில்லை. மீண்டும் முயலுங்கள்."
  };
  I.ml = {
    "skip": "ഉള്ളടക്കത്തിലേക്ക് പോകുക",
    "settings": "ക്രമീകരണങ്ങൾ",
    "part": "EknathaLabs ന്റെ ഭാഗം",
    "privacyNote": "നിങ്ങളുടെ ബ്രൗസറിൽ തന്നെ പ്രവർത്തിക്കുന്നു. ഫയലുകളും വാക്കുകളും നിങ്ങളുടെ ഉപകരണത്തിൽ തന്നെ ഇരിക്കും.",
    "mainNav": "പ്രധാനം",
    "uiLang": "ഇന്റർഫേസ് ഭാഷ",
    "focusLang": "ഞാൻ പഠിക്കുന്ന ഭാഷ",
    "scheme": "റോമൻ ശൈലി",
    "schSimple": "ലളിതം",
    "schIast": "പാണ്ഡിത്യം",
    "showRoman": "റോമൻ ഉച്ചാരണം കാണിക്കുക",
    "on": "ഓൺ",
    "off": "ഓഫ്",
    "voiceSpeed": "ശബ്ദ വേഗത",
    "perDay": "ഒരു സെഷനിലെ പുനരവലോകനങ്ങൾ",
    "unlimited": "പരിധി ഇല്ല",
    "theme": "തീം",
    "light": "ലൈറ്റ്",
    "dark": "ഡാർക്ക്",
    "new": "പുതിയത്",
    "language": "ഭാഷ",
    "allLangs": "എല്ലാ ഭാഷകളും",
    "allStatus": "എല്ലാം",
    "auto": "സ്വയം കണ്ടെത്തുക",
    "indianLangs": "ഇന്ത്യൻ ഭാഷകൾ",
    "otherLangs": "മറ്റ് ഭാഷകൾ",
    "nav_watch": "കാണുക",
    "nav_read": "വായിക്കുക",
    "nav_words": "എന്റെ വാക്കുകൾ",
    "nav_review": "പുനരവലോകനം",
    "nav_scripts": "ലിപികൾ",
    "nav_phrases": "വാക്യങ്ങൾ",
    "homeH": "നിങ്ങൾ കാണുന്നതിലും വായിക്കുന്നതിലും നിന്ന് സംസാരഭാഷകൾ പഠിക്കൂ",
    "homeSub": "നിങ്ങളുടെ സ്വന്തം വീഡിയോ, ഓഡിയോ അല്ലെങ്കിൽ ടെക്സ്റ്റ് കൊണ്ടുവരൂ. ഏത് വാക്കിലും തൊട്ട് കേൾക്കൂ, ഇംഗ്ലീഷ് അക്ഷരങ്ങളിൽ ഉച്ചാരണം കാണൂ, സേവ് ചെയ്യൂ. ഇടവേളയിട്ടുള്ള ആവർത്തനത്തിലൂടെ ഓർമ്മിക്കൂ. സൗജന്യം, സ്വകാര്യം, ഓഫ്‌ലൈനിലും പ്രവർത്തിക്കും.",
    "statWords": "സേവ് ചെയ്ത വാക്കുകൾ",
    "statDue": "ഇന്ന്",
    "statStreak": "തുടർച്ചയായ ദിവസങ്ങൾ",
    "cWatch": "നിങ്ങളുടെ വീഡിയോയോ ഓഡിയോയോ രണ്ട് സബ്‌ടൈറ്റിൽ വരികളോടെ പ്ലേ ചെയ്യൂ. വാക്കുകളിൽ തൊടൂ, വരി ആവർത്തിക്കൂ, വേഗത കുറയ്ക്കൂ, സംസാരിക്കുന്നവരെ അനുകരിക്കൂ.",
    "cRead": "ഏത് ടെക്സ്റ്റും പേസ്റ്റ് ചെയ്യുക അല്ലെങ്കിൽ തുറക്കുക. ഓരോ വാക്കും തൊടാം, റോമൻ ഉച്ചാരണവും വായിച്ചുകേൾപ്പിക്കലും സഹിതം.",
    "cWords": "നിങ്ങൾ സേവ് ചെയ്തതെല്ലാം, CSV, Anki, ബാക്കപ്പ് ഫയൽ എന്നിവയിലേക്ക് എക്സ്പോർട്ട് സഹിതം.",
    "cReview": "മറക്കുന്നതിന് തൊട്ടുമുമ്പ് തിരികെ വരുന്ന ഫ്ലാഷ്‌കാർഡുകൾ.",
    "cScripts": "അക്ഷരങ്ങൾ, സ്വരചിഹ്നങ്ങൾ, അക്കങ്ങൾ. കേൾക്കൂ, ക്വിസ് ചെയ്യൂ, എഴുതി പഠിക്കൂ.",
    "cPhrases": "പതിമൂന്ന് ഭാഷകളിൽ 250 ദൈനംദിന വാക്യങ്ങൾ, റോമൻ ഉച്ചാരണവും ശബ്ദവും സഹിതം.",
    "dueCount": "{n} ബാക്കി",
    "howH": "ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു",
    "how1": "നിങ്ങളുടെ വീഡിയോയ്ക്കൊപ്പം സബ്‌ടൈറ്റിൽ ഫയൽ തുറക്കുക, അല്ലെങ്കിൽ ടെക്സ്റ്റ് പേസ്റ്റ് ചെയ്യുക.",
    "how2": "അറിയാത്ത വാക്കിൽ തൊടൂ. കേട്ട് അർത്ഥത്തോടൊപ്പം സേവ് ചെയ്യൂ.",
    "how3": "പുനരവലോകനത്തിലേക്ക് വരൂ. കാർഡുകൾ ശരിയായ സമയത്ത് തിരിച്ചെത്തും.",
    "how4": "എല്ലാം ഈ ഉപകരണത്തിൽ തന്നെ. എപ്പോൾ വേണമെങ്കിലും എക്സ്പോർട്ട് ചെയ്യാം.",
    "homeNote": "ശബ്ദങ്ങൾ നിങ്ങളുടെ ഉപകരണത്തിൽ നിന്നാണ്. ഇന്ത്യൻ ഭാഷാ ശബ്ദങ്ങൾ ഫോണും ബ്രൗസറും അനുസരിച്ച് മാറും. കേൾക്കുന്നില്ലെങ്കിൽ സിസ്റ്റം ക്രമീകരണത്തിൽ ഒന്ന് ഇൻസ്റ്റാൾ ചെയ്യുക.",
    "noTts": "ഈ ബ്രൗസറിന് ടെക്സ്റ്റ് വായിച്ചുകേൾപ്പിക്കാൻ കഴിയില്ല.",
    "noVoice": "ഈ ഉപകരണത്തിൽ {l} ശബ്ദം ഇല്ല. സിസ്റ്റം ക്രമീകരണത്തിൽ ഇൻസ്റ്റാൾ ചെയ്യുക.",
    "storageFull": "സേവ് ചെയ്യാനായില്ല. ബ്രൗസർ സംഭരണം നിറഞ്ഞതോ തടഞ്ഞതോ ആണ്.",
    "meaning": "അർത്ഥം",
    "status": "നില",
    "st0": "പുതിയത്",
    "st1": "പഠിക്കുന്നു",
    "st2": "അറിയാം",
    "seenIn": "വാക്യ പട്ടികയിലും ഉണ്ട്",
    "speak": "പറയുക",
    "close": "അടയ്ക്കുക",
    "update": "പുതുക്കുക",
    "save": "വാക്ക് സേവ് ചെയ്യുക",
    "saved": "സേവ് ചെയ്തു",
    "remove": "നീക്കം ചെയ്യുക",
    "speakSentence": "വാക്യം വായിക്കുക",
    "translateDevice": "ഉപകരണത്തിൽ വിവർത്തനം ചെയ്യുക",
    "trFail": "വിവർത്തനം ലഭ്യമല്ല.",
    "lookup": "തിരയുക",
    "opensTab": "പുതിയ ടാബ് തുറക്കും",
    "wordDetails": "വാക്കിന്റെ വിവരം",
    "rdLede": "ടെക്സ്റ്റ് പേസ്റ്റ് ചെയ്യുക അല്ലെങ്കിൽ തുറക്കുക. ഏത് വാക്കിലും തൊടുക.",
    "rdPlaceholder": "ഏത് ഭാഷയിലെയും ടെക്സ്റ്റ് ഇവിടെ പേസ്റ്റ് ചെയ്യുക",
    "rdText": "വായിക്കാനുള്ള ടെക്സ്റ്റ്",
    "rdEmpty": "കാണിക്കാൻ ഇതുവരെ ഒന്നുമില്ല. ടെക്സ്റ്റ് പേസ്റ്റ് ചെയ്യുക അല്ലെങ്കിൽ സാമ്പിൾ ലോഡ് ചെയ്യുക.",
    "rdStats": "{n} വാക്കുകൾ, {u} വ്യത്യസ്തം. {k} അറിയാം, {l} പഠിക്കുന്നു. ഭാഷ: {lang}",
    "textLang": "ടെക്സ്റ്റ് ഭാഷ",
    "colorWords": "നില അനുസരിച്ച് വാക്കുകൾക്ക് നിറം",
    "fontSize": "അക്ഷര വലുപ്പം",
    "readAloud": "വായിച്ചുകേൾപ്പിക്കുക",
    "stop": "നിർത്തുക",
    "sample": "സാമ്പിൾ ലോഡ് ചെയ്യുക",
    "importTxt": "ടെക്സ്റ്റ് ഫയൽ തുറക്കുക",
    "clear": "മായ്ക്കുക",
    "clickWord": "വിവരങ്ങൾക്ക് വാക്കിൽ തൊടുക",
    "wtLede": "നിങ്ങളുടെ സ്വന്തം വീഡിയോയോ ഓഡിയോയോ സബ്‌ടൈറ്റിൽ ഫയലിനൊപ്പം ഉപയോഗിക്കൂ. ഒന്നും അപ്‌ലോഡ് ചെയ്യപ്പെടില്ല.",
    "wtSetup": "നിങ്ങളുടെ ഫയലുകൾ തിരഞ്ഞെടുക്കുക",
    "wtDrop": "വീഡിയോ അല്ലെങ്കിൽ ഓഡിയോയും സബ്‌ടൈറ്റിൽ ഫയലുകളും ഇവിടെ ഇടുക, അല്ലെങ്കിൽ ബട്ടണുകൾ ഉപയോഗിക്കുക.",
    "wtMedia": "വീഡിയോ അല്ലെങ്കിൽ ഓഡിയോ",
    "wtSub1": "സബ്‌ടൈറ്റിൽ (പഠിക്കുന്ന ഭാഷ)",
    "wtSub2": "സബ്‌ടൈറ്റിൽ (നിങ്ങളുടെ ഭാഷ)",
    "subLang": "സബ്‌ടൈറ്റിൽ ഭാഷ",
    "wtStart": "ആരംഭിക്കുക",
    "wtSample": "സാമ്പിൾ പരീക്ഷിക്കൂ (വായിച്ചുകേൾപ്പിക്കും)",
    "noSubs": "{f} ൽ സബ്‌ടൈറ്റിൽ കണ്ടില്ല. .srt അല്ലെങ്കിൽ .vtt ഉപയോഗിക്കുക.",
    "wtPrivacy": "ഫയലുകൾ നിങ്ങളുടെ ബ്രൗസറിനുള്ളിൽ തന്നെ തുറക്കുന്നു, ഉപകരണം വിട്ടുപോകില്ല. വീഡിയോയോ ഓഡിയോയോ ഇല്ലെങ്കിൽ വരികൾ നിങ്ങളുടെ ഉപകരണത്തിന്റെ ശബ്ദത്തിൽ വായിക്കും.",
    "wtListenMode": "കേൾക്കൽ മോഡ്: വരികൾ വായിച്ചുകേൾപ്പിക്കും",
    "wtTranscript": "ലിഖിത രൂപം",
    "playPause": "പ്ലേ അല്ലെങ്കിൽ താൽക്കാലികമായി നിർത്തുക",
    "prevLine": "മുൻ വരി",
    "nextLine": "അടുത്ത വരി",
    "replay": "വരി വീണ്ടും",
    "loopLine": "വരി ആവർത്തിക്കുക",
    "autoPause": "ഓരോ വരിക്കും ശേഷം നിർത്തുക",
    "hideTarget": "പഠിക്കുന്ന ഭാഷയുടെ സബ്‌ടൈറ്റിൽ മറയ്ക്കുക",
    "hideNative": "എന്റെ ഭാഷയുടെ സബ്‌ടൈറ്റിൽ മറയ്ക്കുക",
    "blurNative": "എന്റെ ഭാഷ മങ്ങിക്കുക",
    "speed": "വേഗത",
    "subEarlier": "സബ്‌ടൈറ്റിൽ നേരത്തെ",
    "subLater": "സബ്‌ടൈറ്റിൽ വൈകി",
    "shadow": "അനുകരിക്കുക",
    "stopRec": "നിർത്തുക",
    "yourVoice": "നിങ്ങളുടെ ശബ്ദം",
    "orig": "യഥാർത്ഥം",
    "noMic": "ഇവിടെ റെക്കോർഡിംഗ് പിന്തുണയ്ക്കുന്നില്ല.",
    "micDenied": "മൈക്രോഫോൺ അനുമതി നിഷേധിച്ചു.",
    "wtChange": "ഫയലുകൾ മാറ്റുക",
    "wtKeys": "കീകൾ: Space പ്ലേ/നിർത്തുക, A/D അല്ലെങ്കിൽ ആരോകൾ മുമ്പത്തെ/അടുത്തത്, R വീണ്ടും, L ആവർത്തനം, P ഓരോ വരിക്കും ശേഷം നിർത്തുക.",
    "wdLede": "നിങ്ങൾ സേവ് ചെയ്ത വാക്കുകൾ. ഈ ബ്രൗസറിൽ മാത്രം സൂക്ഷിക്കുന്നു.",
    "wdCount": "{n} കാണിക്കുന്നു, {d} ഇപ്പോൾ ബാക്കി",
    "wdNoMatch": "യോജിക്കുന്ന വാക്കുകളില്ല.",
    "wdEmpty": "ഇതുവരെ വാക്കുകൾ സേവ് ചെയ്തിട്ടില്ല.",
    "wdEmptySub": "വായിക്കുക അല്ലെങ്കിൽ കാണുക തുറന്ന് വാക്കിൽ തൊട്ട് സേവ് ചെയ്യുക.",
    "wdMore": "ഇനിയും {n} കാണിച്ചിട്ടില്ല. തിരയൽ ഉപയോഗിക്കുക.",
    "wdNothing": "എക്സ്പോർട്ട് ചെയ്യാൻ ഒന്നുമില്ല.",
    "wdImported": "{n} പുതിയ വാക്കുകൾ ഇമ്പോർട്ട് ചെയ്തു.",
    "wdImportFail": "ആ ഫയൽ വായിക്കാനായില്ല.",
    "wdPrivacy": "ബ്രൗസർ ഡാറ്റ മായ്ച്ചാൽ പട്ടിക പോകും, അതിനാൽ ഇടയ്ക്കിടെ ബാക്കപ്പ് എക്സ്പോർട്ട് ചെയ്യുക.",
    "search": "തിരയുക",
    "edit": "മാറ്റുക",
    "dueNow": "ഇപ്പോൾ",
    "dueToday": "ഇന്ന്",
    "dueIn": "{n} ദിവസത്തിൽ",
    "backup": "ബാക്കപ്പ്",
    "importWords": "ഇമ്പോർട്ട്",
    "rvLede": "കാർഡ് മറിക്കൂ, എത്ര ഓർമ്മയുണ്ടായിരുന്നു എന്ന് പറയൂ.",
    "rvMode": "പരിശീലന രീതി",
    "rvW2M": "വാക്കിൽ നിന്ന് അർത്ഥം",
    "rvM2W": "അർത്ഥത്തിൽ നിന്ന് വാക്ക്",
    "rvListen": "കേൾക്കൽ",
    "rvCloze": "വിടവ് നിറയ്ക്കുക",
    "rvStreak": "തുടർച്ചയായ ദിവസങ്ങൾ: {n}",
    "rvDone": "കഴിഞ്ഞു: {n} കാർഡുകൾ",
    "rvDoneSub": "പിന്നീട് വരൂ. തെറ്റിയ കാർഡുകൾ മിനിറ്റുകൾക്കുള്ളിൽ, ബാക്കി ദിവസങ്ങൾക്കുള്ളിൽ തിരിച്ചെത്തും.",
    "rvNone": "ഒന്നും ബാക്കിയില്ല",
    "rvNoneSub": "നിങ്ങൾ മുന്നിലാണ്. പുതിയ വാക്കുകൾക്ക് കൂടുതൽ വായിക്കൂ അല്ലെങ്കിൽ കാണൂ.",
    "rvWhichWord": "ഈ വാക്ക് ഏത്?",
    "rvPlay": "വാക്ക് കേൾക്കുക",
    "rvListenQ": "കേട്ട് അർത്ഥം ഓർക്കുക",
    "rvHint": "അർത്ഥം",
    "rvShow": "ഉത്തരം കാണിക്കുക",
    "rvProgress": "സെഷൻ പുരോഗതി",
    "again": "വീണ്ടും",
    "hard": "ബുദ്ധിമുട്ട്",
    "good": "നല്ലത്",
    "easy": "എളുപ്പം",
    "scLede": "അക്ഷരങ്ങൾ പഠിക്കൂ. ഏത് അക്ഷരത്തിലും തൊട്ട് കേൾക്കൂ, എഴുതി പഠിക്കൂ.",
    "scVowels": "സ്വരങ്ങൾ",
    "scCons": "വ്യഞ്ജനങ്ങൾ",
    "scSigns": "സ്വരചിഹ്നങ്ങൾ",
    "scSignsNote": "{b} എന്ന അക്ഷരത്തിൽ കാണിച്ചിരിക്കുന്നു",
    "scDigits": "അക്കങ്ങൾ",
    "scQuiz": "ചെറിയ ക്വിസ്",
    "scQuizQ": "ഈ അക്ഷരം എങ്ങനെ വായിക്കും?",
    "scTrace": "എഴുതി നോക്കൂ",
    "scTraceHint": "മുകളിൽ ഒരു അക്ഷരത്തിൽ തൊട്ട്, ഇവിടെ എഴുതൂ.",
    "correct": "ശരി!",
    "wrongIs": "അല്ല. ഇത് {a}.",
    "next": "അടുത്തത്",
    "phLede": "ദൈനംദിന വാക്യങ്ങൾ. ഏത് വാക്കിലും തൊട്ട് സേവ് ചെയ്യൂ.",
    "phNote": "ഈ വാക്യങ്ങൾ ഒരു പ്രാരംഭ സെറ്റ് ആണ്. ആശ്രയിക്കുന്നതിനുമുമ്പ് മാതൃഭാഷക്കാരനെക്കൊണ്ട് പരിശോധിപ്പിക്കുക.",
    "cat_greet": "അഭിവാദ്യങ്ങൾ",
    "cat_intro": "പരിചയപ്പെടുത്തൽ",
    "cat_daily": "ദൈനംദിനം",
    "cat_num": "സംഖ്യകൾ",
    "slow": "പതുക്കെ",
    "nav_say": "പറയൂ",
    "cSay": "ഇംഗ്ലീഷിൽ ഒരു വാക്യം എഴുതി തെലുഗു, ഹിന്ദി, കന്നഡ, തമിഴ്, മലയാളം, ബംഗാളി, മറാത്തി, ഗുജറാത്തി, അസമീസ്, കൊറിയൻ, സ്പാനിഷ്, ജർമ്മൻ അല്ലെങ്കിൽ ഫ്രഞ്ചിൽ കേൾക്കുക.",
    "sayLede": "ഇംഗ്ലീഷിൽ വാക്യം ടൈപ്പ് ചെയ്യൂ. മറ്റൊരു ഭാഷയിൽ റോമൻ ഉച്ചാരണവും ശബ്ദവും സഹിതം നേടൂ.",
    "sayPlaceholder": "ഇംഗ്ലീഷ് വാക്യം ടൈപ്പ് ചെയ്യൂ, ഉദാ: How are you?",
    "sayInput": "ഇംഗ്ലീഷ് വാക്യം",
    "sayTo": "ഈ ഭാഷയിൽ പറയുക",
    "sayGo": "വിവർത്തനം ചെയ്ത് പറയുക",
    "sayEnglish": "ഇംഗ്ലീഷ് പറയുക",
    "sayResult": "ഫലം",
    "sayMatch": "വാക്യ പട്ടിക",
    "sayDevice": "നിങ്ങളുടെ ഉപകരണത്തിൽ വിവർത്തനം ചെയ്തത്",
    "sayClosest": "വാക്യ പട്ടികയിലെ ഏറ്റവും അടുത്ത വാക്യങ്ങൾ",
    "sayNone": "സ്വതന്ത്ര വിവർത്തനത്തിന് ഉപകരണത്തിൽ തന്നെ വിവർത്തകൻ ഉള്ള ബ്രൗസർ (പുതിയ Chrome) വേണം. വാക്യ പട്ടികയിലെ ഏറ്റവും അടുത്ത വാക്യങ്ങൾ ഇതാ.",
    "sayWorking": "നിങ്ങളുടെ ഉപകരണത്തിൽ വിവർത്തനം ചെയ്യുന്നു…",
    "sayFail": "ഉപകരണത്തിലെ വിവർത്തകന് ഈ ഭാഷാ ജോടിക്ക് പ്രവർത്തിക്കാനായില്ല. വാക്യ പട്ടികയിലെ ഏറ്റവും അടുത്ത വാക്യങ്ങൾ ഇതാ.",
    "sayNote": "ഒന്നും സെർവറിലേക്ക് അയയ്ക്കില്ല. യന്ത്ര വിവർത്തനം തെറ്റാകാം, പ്രധാന വാക്യങ്ങൾ മാതൃഭാഷക്കാരനെക്കൊണ്ട് പരിശോധിപ്പിക്കുക.",
    "copy": "പകർത്തുക",
    "copied": "പകർത്തി",
    "cat_food": "ഭക്ഷണം",
    "cat_travel": "യാത്ര",
    "cat_shop": "ഷോപ്പിംഗ്",
    "cat_health": "ആരോഗ്യം",
    "cat_people": "ആളുകൾ",
    "cat_time": "ദിവസങ്ങളും സമയവും",
    "voiceCheck": "ശബ്ദ പരിശോധന",
    "vcLede": "ഈ ഉപകരണത്തിൽ ഏത് ശബ്ദങ്ങൾ പ്രവർത്തിക്കുന്നു എന്ന് നോക്കൂ. ഓരോന്നും കേൾക്കാൻ പരിശോധന അമർത്തൂ. ഒരു ഭാഷയ്ക്ക് ഉപകരണ ശബ്ദം ഇല്ലെങ്കിൽ Bhasha ചെറിയ ഓഫ്‌ലൈൻ ശബ്ദം ഉപയോഗിക്കാം.",
    "vcDevice": "ഉപകരണ ശബ്ദം",
    "vcOffline": "ഓഫ്‌ലൈൻ ശബ്ദം തയ്യാർ",
    "vcOfflineAvail": "ഉപകരണ ശബ്ദം ഇല്ല. ഓഫ്‌ലൈൻ ശബ്ദം ലഭ്യം",
    "vcNone": "ശബ്ദം ഇല്ല",
    "vcTest": "പരിശോധന",
    "ovLabel": "ഓഫ്‌ലൈൻ ശബ്ദ ബാക്കപ്പ്",
    "ovAsk": "ചോദിക്കുക",
    "ovNote": "ഓഫ്‌ലൈൻ ശബ്ദം (eSpeak NG) ഏകദേശം 18 MB ആണ്, ഒരിക്കൽ ഡൗൺലോഡ് ചെയ്താൽ ഇന്റർനെറ്റ് ഇല്ലാതെ പ്രവർത്തിക്കും. ഇത് ഉപകരണ ശബ്ദങ്ങളേക്കാൾ യന്ത്രസ്വരമായി തോന്നും.",
    "ovAskQ": "ഈ ഉപകരണത്തിൽ {l} ശബ്ദം ഇല്ല. ഓഫ്‌ലൈൻ ശബ്ദം ഡൗൺലോഡ് ചെയ്യണോ (ഏകദേശം 18 MB, ഒരിക്കൽ)?",
    "ovYes": "ഡൗൺലോഡ്",
    "ovNo": "ഇപ്പോൾ വേണ്ട",
    "ovLoading": "ഓഫ്‌ലൈൻ ശബ്ദം ലോഡ് ചെയ്യുന്നു…",
    "ovFail": "ഓഫ്‌ലൈൻ ശബ്ദം പ്ലേ ചെയ്യാനായില്ല.",
    "nav_today": "ഇന്ന്",
    "nav_talk": "സംഭാഷണങ്ങൾ",
    "cToday": "ദിവസവും ഒരു ചെറിയ പാഠം: അഞ്ച് പുതിയ വാക്യങ്ങൾ, കേൾക്കൽ ക്വിസ്, ഓർമ്മിക്കൽ റൗണ്ട്.",
    "cTalk": "യഥാർത്ഥ സംഭാഷണങ്ങൾ പരിശീലിക്കുക: റസ്റ്റോറന്റ്, വഴി ചോദിക്കൽ, ഷോപ്പിംഗ്, ഡോക്ടർ, ഹോട്ടൽ. ഒരു വരി കേട്ട് നിങ്ങളുടെ മറുപടി തിരഞ്ഞെടുക്കുക.",
    "tdLede": "ദിവസം അഞ്ച് പുതിയ വാക്യങ്ങൾ. പഠിക്കുക, കേൾക്കുക, മറക്കുന്നതിന് മുമ്പ് പഴയവ ഓർമ്മിക്കുക.",
    "tdStart": "ഇന്നത്തെ പാഠം തുടങ്ങുക",
    "tdDone": "ഇന്നത്തെ പാഠം കഴിഞ്ഞു. നാളെ വീണ്ടും വരൂ.",
    "tdLearn": "പഠിക്കുക",
    "tdListen": "കേൾക്കുക",
    "tdRecall": "ഓർമ്മിക്കുക",
    "tdNext": "അടുത്തത്",
    "tdFinish": "പൂർത്തിയാക്കുക",
    "tdListenQ": "കേട്ട് അർത്ഥം തിരഞ്ഞെടുക്കുക",
    "tdRecallQ": "ഈ അർത്ഥമുള്ള വാക്യം തിരഞ്ഞെടുക്കുക:",
    "tdScore": "സ്കോർ: {m}-ൽ {n}",
    "tdBonus": "ഒരു അധിക പാഠം ചെയ്യുക",
    "tdProgress": "{m}-ൽ {n} വാക്യങ്ങൾ പഠിച്ചു",
    "tdRecallN": "ഇന്ന് ഓർമ്മിക്കേണ്ട {n} പഴയ വാക്യങ്ങൾ",
    "drLede": "ഒരു സംഭാഷണം തിരഞ്ഞെടുക്കുക. അവർ പറയുന്നത് കേട്ട് നിങ്ങളുടെ മറുപടി തിരഞ്ഞെടുക്കുക.",
    "drPick": "സംഭാഷണങ്ങൾ",
    "drTurns": "{n} ഊഴങ്ങൾ",
    "drThem": "അവർ പറയുന്നു",
    "drYou": "നിങ്ങളുടെ ഊഴം. പറയുക:",
    "drHide": "കേൾക്കൽ മോഡ്: അവർ പറയുന്നത് മറയ്ക്കുക",
    "drTry": "ശരിയായില്ല. വീണ്ടും ശ്രമിക്കുക.",
    "drDone": "സംഭാഷണം പൂർത്തിയായി",
    "drScore": "ആദ്യ ശ്രമത്തിൽ {m}-ൽ {n} ശരി",
    "drReplay": "വീണ്ടും പ്ലേ ചെയ്യുക",
    "drTranscript": "മുഴുവൻ സംഭാഷണം",
    "drAnother": "മറ്റൊരു സംഭാഷണം",
    "d_meet": "ഒരാളെ പരിചയപ്പെടൽ",
    "d_rest": "റസ്റ്റോറന്റിൽ",
    "d_dir": "വഴി ചോദിക്കൽ",
    "d_shop": "ഷോപ്പിംഗ്",
    "d_doc": "ഡോക്ടറുടെ അടുത്ത്",
    "d_hotel": "ഹോട്ടലിൽ",
    "cat_talk": "സംഭാഷണം",
    "cat_feel": "വികാരങ്ങൾ",
    "cat_work": "ജോലിയും ഫോണും",
    "cat_home": "വീടും കാലാവസ്ഥയും",
    "pvTitle": "സൗജന്യവും സ്വകാര്യവും",
    "pvLede": "Bhasha എല്ലാവർക്കും സൗജന്യമാണ്. അക്കൗണ്ട് ഇല്ല, പരസ്യമില്ല, ട്രാക്കിംഗ് ഇല്ല. നിങ്ങൾ ചെയ്യുന്നതെല്ലാം ഈ ഉപകരണത്തിൽ തന്നെ നിൽക്കും.",
    "pvFree": "എല്ലാവർക്കും സൗജന്യം",
    "pvFreeT": "പണമടയ്ക്കലില്ല, സൈൻ-അപ്പില്ല, ഒന്നും പൂട്ടിയിട്ടില്ല. EknathaLabs ഇത് എപ്പോഴും സൗജന്യമായി നിലനിർത്താനാണ് നിർമ്മിക്കുന്നത്.",
    "pvPriv": "നിങ്ങളുടെ ഉപകരണത്തിൽ തന്നെ നിൽക്കും",
    "pvPrivT": "നിങ്ങളുടെ ഫയലുകളും വാക്കുകളും പുരോഗതിയും ഈ ബ്രൗസറിൽ മാത്രമാണ്. അയയ്ക്കാൻ സെർവർ ഇല്ല.",
    "pvNet": "ട്രാക്കിംഗ് ഇല്ല",
    "pvNetT": "അനലിറ്റിക്സ് ഇല്ല, കുക്കികളില്ല, പുറമെയുള്ള സ്ക്രിപ്റ്റുകളില്ല. ഫോണ്ടുകളും ഓഫ്‌ലൈൻ ശബ്ദവും ഈ സൈറ്റിൽ നിന്നുതന്നെയാണ്. പുറമെയുള്ള നിഘണ്ടു ലിങ്കുകൾ നിങ്ങൾ തൊട്ടാൽ മാത്രമേ തുറക്കൂ.",
    "pvMic": "നിങ്ങളുടെ ശബ്ദം",
    "pvMicT": "ഉച്ചാരണ റെക്കോർഡിംഗ് പേജ് തുറന്നിരിക്കുന്നിടത്തോളം മാത്രം മെമ്മറിയിൽ ഉണ്ടാകും. അത് ഒരിക്കലും സേവ് ചെയ്യുകയോ അപ്‌ലോഡ് ചെയ്യുകയോ ഇല്ല.",
    "pvStored": "ഈ ബ്രൗസറിൽ സേവ് ചെയ്തത്",
    "pvWords": "സേവ് ചെയ്ത വാക്കുകൾ",
    "pvLesson": "പാഠ വാക്യങ്ങൾ",
    "pvStats": "പഠിച്ച ദിവസങ്ങൾ",
    "pvSet": "ക്രമീകരണങ്ങൾ",
    "pvItems": "{n} ഇനങ്ങൾ",
    "pvTotal": "ആകെ: {n}",
    "pvExport": "എന്റെ ഡാറ്റ ഡൗൺലോഡ് ചെയ്യുക",
    "pvImport": "ഫയലിൽ നിന്ന് പുനഃസ്ഥാപിക്കുക",
    "pvClear": "എന്റെ ഡാറ്റ മുഴുവൻ ഇല്ലാതാക്കുക",
    "pvClearAsk": "ഈ ബ്രൗസറിൽ നിന്ന് സേവ് ചെയ്ത വാക്കുകൾ, പാഠ പുരോഗതി, പഠന ചരിത്രം, ക്രമീകരണങ്ങൾ എന്നിവ ഇല്ലാതാക്കട്ടെ? ഇത് തിരികെ എടുക്കാനാവില്ല. സൂക്ഷിക്കണമെങ്കിൽ ആദ്യം ഒരു പകർപ്പ് ഡൗൺലോഡ് ചെയ്യുക.",
    "pvClearYes": "അതെ, എല്ലാം ഇല്ലാതാക്കുക",
    "pvCleared": "ഡാറ്റ മുഴുവൻ ഇല്ലാതാക്കി",
    "pvImported": "ഡാറ്റ പുനഃസ്ഥാപിച്ചു",
    "pvBadFile": "ഇത് Bhasha ബാക്കപ്പ് ഫയൽ അല്ല",
    "pvLicence": "Bhasha EknathaLabs-ന്റെ ഭാഗമാണ്. ഓപ്ഷണൽ ഓഫ്‌ലൈൻ ശബ്ദം (eSpeak NG) GPL-3.0 പ്രകാരമുള്ള ഓപ്പൺ സോഴ്‌സ് ആണ്; നിങ്ങൾ അനുവദിച്ചാൽ മാത്രമേ ഈ സൈറ്റിൽ നിന്ന് ഡൗൺലോഡ് ചെയ്യൂ.",
    "pvBadge": "സൗജന്യം · സ്വകാര്യം · ഓഫ്‌ലൈൻ",
    "cPrivacy": "നിങ്ങളുടെ ഉപകരണത്തിൽ എന്തുണ്ടെന്ന് കണ്ട് ഡൗൺലോഡ് ചെയ്യുകയോ ഇല്ലാതാക്കുകയോ ചെയ്യുക. സൗജന്യം, ട്രാക്കിംഗ് ഇല്ല.",
    "cancel": "റദ്ദാക്കുക",
    "setSound": "ശബ്ദ ഇഫക്റ്റുകൾ",
    "setHaptic": "വൈബ്രേഷൻ",
    "pronBtn": "സംസാര പരിശീലനം",
    "pronRec": "റെക്കോർഡ്",
    "pronStop": "നിർത്തുക",
    "pronAgain": "വീണ്ടും റെക്കോർഡ് ചെയ്യുക",
    "pronModel": "മാതൃക",
    "pronYou": "നിങ്ങളുടെ ശബ്ദം",
    "pronCompare": "താരതമ്യം ചെയ്യുക",
    "pronHelp": "മാതൃക കേൾക്കൂ, സ്വയം റെക്കോർഡ് ചെയ്ത് ചെവികൊണ്ട് താരതമ്യം ചെയ്യൂ. നിങ്ങളുടെ റെക്കോർഡിംഗ് സേവ് ചെയ്യില്ല.",
    "pronListening": "റെക്കോർഡ് ചെയ്യുന്നു… ഇപ്പോൾ സംസാരിക്കൂ",
    "pronDone": "നിങ്ങളുടെ റെക്കോർഡിംഗ് കേൾക്കൂ, അല്ലെങ്കിൽ മാതൃകയുമായി താരതമ്യം ചെയ്യൂ.",
    "pronDenied": "മൈക്രോഫോൺ തടഞ്ഞിരിക്കുന്നു. പരിശീലിക്കാൻ ബ്രൗസർ ക്രമീകരണങ്ങളിൽ അനുവദിക്കൂ.",
    "pronNoMic": "ഈ ബ്രൗസറിന് ഓഡിയോ റെക്കോർഡ് ചെയ്യാനാവില്ല.",
    "pronEmpty": "ഒന്നും റെക്കോർഡ് ആയില്ല. വീണ്ടും ശ്രമിക്കൂ."
  };
  I.bn = {
    "skip": "মূল বিষয়ে যান",
    "settings": "সেটিংস",
    "part": "EknathaLabs-এর অংশ",
    "privacyNote": "আপনার ব্রাউজারেই চলে। আপনার ফাইল ও শব্দ আপনার ডিভাইসেই থাকে।",
    "mainNav": "প্রধান",
    "uiLang": "ইন্টারফেসের ভাষা",
    "focusLang": "আমি যে ভাষা শিখছি",
    "scheme": "রোমান বানানের ধরন",
    "schSimple": "সহজ",
    "schIast": "পাণ্ডিত্যপূর্ণ",
    "showRoman": "রোমান উচ্চারণ দেখান",
    "on": "চালু",
    "off": "বন্ধ",
    "voiceSpeed": "কণ্ঠস্বরের গতি",
    "perDay": "প্রতি সেশনে পুনরাবৃত্তি",
    "unlimited": "সীমাহীন",
    "theme": "থিম",
    "light": "হালকা",
    "dark": "গাঢ়",
    "new": "নতুন",
    "language": "ভাষা",
    "allLangs": "সব ভাষা",
    "allStatus": "সব",
    "auto": "নিজে থেকে শনাক্ত করুন",
    "indianLangs": "ভারতীয় ভাষা",
    "otherLangs": "অন্যান্য ভাষা",
    "nav_watch": "দেখুন",
    "nav_read": "পড়ুন",
    "nav_words": "আমার শব্দ",
    "nav_review": "পুনরাবৃত্তি",
    "nav_scripts": "লিপি",
    "nav_phrases": "বাক্যাংশ",
    "nav_say": "বলুন",
    "homeH": "যা দেখেন ও পড়েন তা থেকেই মুখের ভাষা শিখুন",
    "homeSub": "নিজের ভিডিও, অডিও বা লেখা আনুন। যেকোনো শব্দে ট্যাপ করে শুনুন, ইংরেজি অক্ষরে উচ্চারণ দেখুন, সংরক্ষণ করুন। ব্যবধান দিয়ে পুনরাবৃত্তি করে মনে রাখুন। বিনামূল্যে, ব্যক্তিগত এবং অফলাইনে চলে।",
    "statWords": "সংরক্ষিত শব্দ",
    "statDue": "আজকের জন্য",
    "statStreak": "টানা দিন",
    "cWatch": "নিজের ভিডিও বা অডিও দুই লাইনের সাবটাইটেলসহ চালান। শব্দে ট্যাপ করুন, লাইন আবার শুনুন, গতি কমান, বক্তার অনুকরণ করুন।",
    "cRead": "যেকোনো লেখা পেস্ট করুন বা খুলুন। প্রতিটি শব্দ ট্যাপ করা যায়, রোমান উচ্চারণ ও পড়ে শোনানোসহ।",
    "cWords": "আপনার সংরক্ষিত সবকিছু, CSV, Anki ও ব্যাকআপ ফাইলে রপ্তানিসহ।",
    "cReview": "ফ্ল্যাশকার্ড যা ভুলে যাওয়ার ঠিক আগে ফিরে আসে।",
    "cScripts": "অক্ষর, স্বরচিহ্ন ও সংখ্যা। শুনুন, কুইজ করুন, লিখে অভ্যাস করুন।",
    "cPhrases": "তেরোটি ভাষায় ২৫০টি দৈনন্দিন বাক্যাংশ, রোমান উচ্চারণ ও কণ্ঠস্বরসহ।",
    "cSay": "ইংরেজিতে বাক্য লিখুন এবং তেলুগু, হিন্দি, কন্নড়, তামিল, মালায়ালম, বাংলা, মারাঠি, গুজরাটি, অসমীয়া, কোরিয়ান, স্প্যানিশ, জার্মান বা ফরাসিতে শুনুন।",
    "dueCount": "{n}টি বাকি",
    "howH": "এটি কীভাবে কাজ করে",
    "how1": "আপনার ভিডিওর সঙ্গে সাবটাইটেল ফাইল খুলুন, অথবা লেখা পেস্ট করুন।",
    "how2": "যে শব্দ জানেন না তাতে ট্যাপ করুন। শুনুন এবং অর্থসহ সংরক্ষণ করুন।",
    "how3": "পুনরাবৃত্তিতে ফিরে আসুন। কার্ড ঠিক সময়ে ফিরে আসে।",
    "how4": "সবকিছু এই ডিভাইসেই থাকে। যখন খুশি রপ্তানি করুন।",
    "homeNote": "কণ্ঠস্বর আসে আপনার ডিভাইস থেকে। ভারতীয় ভাষার কণ্ঠস্বর ফোন ও ব্রাউজারভেদে আলাদা। কিছু না শুনলে সেটিংস থেকে কণ্ঠস্বর পরীক্ষা খুলুন।",
    "noTts": "এই ব্রাউজার লেখা পড়ে শোনাতে পারে না।",
    "noVoice": "এই ডিভাইসে {l} কণ্ঠস্বর নেই। সিস্টেম সেটিংসে একটি ইনস্টল করুন।",
    "storageFull": "সংরক্ষণ করা গেল না। ব্রাউজারের স্টোরেজ ভরা বা বন্ধ।",
    "meaning": "অর্থ",
    "status": "অবস্থা",
    "st0": "নতুন",
    "st1": "শিখছি",
    "st2": "জানা",
    "seenIn": "বাক্যাংশ তালিকাতেও আছে",
    "speak": "বলুন",
    "close": "বন্ধ করুন",
    "update": "হালনাগাদ",
    "save": "শব্দ সংরক্ষণ",
    "saved": "সংরক্ষিত",
    "remove": "সরান",
    "speakSentence": "বাক্য পড়ুন",
    "translateDevice": "ডিভাইসে অনুবাদ",
    "trFail": "অনুবাদ পাওয়া যাচ্ছে না।",
    "lookup": "খুঁজুন",
    "opensTab": "নতুন ট্যাব খোলে",
    "wordDetails": "শব্দের বিবরণ",
    "rdLede": "লেখা পেস্ট করুন বা খুলুন। যেকোনো শব্দে ট্যাপ করুন।",
    "rdPlaceholder": "এখানে যেকোনো ভাষার লেখা পেস্ট করুন",
    "rdText": "পড়ার লেখা",
    "rdEmpty": "দেখানোর মতো কিছু নেই। লেখা পেস্ট করুন বা নমুনা লোড করুন।",
    "rdStats": "{n}টি শব্দ, {u}টি আলাদা। {k}টি জানা, {l}টি শিখছি। ভাষা: {lang}",
    "textLang": "লেখার ভাষা",
    "colorWords": "অবস্থা অনুযায়ী শব্দে রং",
    "fontSize": "লেখার আকার",
    "readAloud": "পড়ে শোনান",
    "stop": "থামান",
    "sample": "নমুনা লোড করুন",
    "importTxt": "লেখার ফাইল খুলুন",
    "clear": "মুছুন",
    "clickWord": "বিবরণ দেখতে শব্দে ট্যাপ করুন",
    "wtLede": "নিজের ভিডিও বা অডিও সাবটাইটেল ফাইলের সঙ্গে ব্যবহার করুন। কিছুই আপলোড হয় না।",
    "wtSetup": "আপনার ফাইল বেছে নিন",
    "wtDrop": "ভিডিও বা অডিও এবং সাবটাইটেল ফাইল এখানে ছাড়ুন, অথবা বোতাম ব্যবহার করুন।",
    "wtMedia": "ভিডিও বা অডিও",
    "wtSub1": "সাবটাইটেল (যে ভাষা শিখছেন)",
    "wtSub2": "সাবটাইটেল (আপনার ভাষা)",
    "subLang": "সাবটাইটেলের ভাষা",
    "wtStart": "শুরু করুন",
    "wtSample": "নমুনা চেষ্টা করুন (পড়ে শোনায়)",
    "noSubs": "{f}-এ কোনো সাবটাইটেল পাওয়া যায়নি। .srt বা .vtt ব্যবহার করুন।",
    "wtPrivacy": "ফাইল আপনার ব্রাউজারের ভেতরেই খোলে, ডিভাইসের বাইরে যায় না। ভিডিও বা অডিও ছাড়া লাইনগুলো আপনার ডিভাইসের কণ্ঠস্বরে পড়ে শোনানো হয়।",
    "wtListenMode": "শোনার মোড: লাইনগুলো পড়ে শোনানো হয়",
    "wtTranscript": "লিখিত রূপ",
    "playPause": "চালান বা থামান",
    "prevLine": "আগের লাইন",
    "nextLine": "পরের লাইন",
    "replay": "লাইন আবার",
    "loopLine": "লাইন পুনরাবৃত্তি",
    "autoPause": "প্রতি লাইনের পরে থামুন",
    "hideTarget": "শেখা ভাষার সাবটাইটেল লুকান",
    "hideNative": "আমার ভাষার সাবটাইটেল লুকান",
    "blurNative": "আমার ভাষা ঝাপসা করুন",
    "speed": "গতি",
    "subEarlier": "সাবটাইটেল আগে দেখান",
    "subLater": "সাবটাইটেল পরে দেখান",
    "shadow": "অনুকরণ",
    "stopRec": "থামান",
    "yourVoice": "আপনার কণ্ঠ",
    "orig": "মূল",
    "noMic": "এখানে রেকর্ডিং সমর্থিত নয়।",
    "micDenied": "মাইক্রোফোনের অনুমতি দেওয়া হয়নি।",
    "wtChange": "ফাইল বদলান",
    "wtKeys": "কী: Space চালান/থামান, A/D বা তীর আগে/পরে, R আবার, L পুনরাবৃত্তি, P প্রতি লাইনের পরে থামা।",
    "wdLede": "আপনার সংরক্ষিত শব্দ। শুধু এই ব্রাউজারে রাখা হয়।",
    "wdCount": "{n}টি দেখানো হচ্ছে, {d}টি এখন বাকি",
    "wdNoMatch": "কোনো শব্দ মেলেনি।",
    "wdEmpty": "এখনও কোনো শব্দ সংরক্ষিত নেই।",
    "wdEmptySub": "পড়ুন বা দেখুন খুলে শব্দে ট্যাপ করে সংরক্ষণ করুন।",
    "wdMore": "আরও {n}টি দেখানো হয়নি। অনুসন্ধান ব্যবহার করুন।",
    "wdNothing": "রপ্তানির মতো কিছু নেই।",
    "wdImported": "{n}টি নতুন শব্দ আমদানি হয়েছে।",
    "wdImportFail": "ওই ফাইল পড়া গেল না।",
    "wdPrivacy": "ব্রাউজারের ডেটা মুছলে তালিকা চলে যায়, তাই মাঝেমধ্যে ব্যাকআপ রপ্তানি করুন।",
    "search": "অনুসন্ধান",
    "edit": "সম্পাদনা",
    "dueNow": "এখনই",
    "dueToday": "আজ",
    "dueIn": "{n} দিনে",
    "backup": "ব্যাকআপ",
    "importWords": "আমদানি",
    "rvLede": "কার্ড উল্টান, তারপর বলুন কতটা মনে ছিল।",
    "rvMode": "অনুশীলনের ধরন",
    "rvW2M": "শব্দ থেকে অর্থ",
    "rvM2W": "অর্থ থেকে শব্দ",
    "rvListen": "শোনা",
    "rvCloze": "ফাঁকা পূরণ",
    "rvStreak": "টানা দিন: {n}",
    "rvDone": "শেষ: {n}টি কার্ড",
    "rvDoneSub": "পরে আবার আসুন। যেগুলো ভুল হয়েছে সেগুলো কয়েক মিনিটে, বাকিগুলো কয়েক দিনে ফিরে আসবে।",
    "rvNone": "কিছু বাকি নেই",
    "rvNoneSub": "আপনি হালনাগাদ আছেন। নতুন শব্দ পেতে আরও পড়ুন বা দেখুন।",
    "rvWhichWord": "শব্দটি কী?",
    "rvPlay": "শব্দ শুনুন",
    "rvListenQ": "শুনুন, তারপর অর্থ মনে করুন",
    "rvHint": "অর্থ",
    "rvShow": "উত্তর দেখান",
    "rvProgress": "সেশনের অগ্রগতি",
    "again": "আবার",
    "hard": "কঠিন",
    "good": "ভালো",
    "easy": "সহজ",
    "scLede": "অক্ষর শিখুন। যেকোনো অক্ষরে ট্যাপ করে শুনুন ও লিখে অভ্যাস করুন।",
    "scVowels": "স্বরবর্ণ",
    "scCons": "ব্যঞ্জনবর্ণ",
    "scSigns": "স্বরচিহ্ন",
    "scSignsNote": "{b} অক্ষরের ওপর দেখানো হয়েছে",
    "scDigits": "সংখ্যা",
    "scQuiz": "ছোট কুইজ",
    "scQuizQ": "এই অক্ষরটি কীভাবে পড়বেন?",
    "scTrace": "লিখে দেখুন",
    "scTraceHint": "ওপরে একটি অক্ষরে ট্যাপ করুন, তারপর এখানে লিখুন।",
    "correct": "ঠিক!",
    "wrongIs": "ঠিক হয়নি। এটি {a}।",
    "next": "পরেরটি",
    "phLede": "দৈনন্দিন বাক্যাংশ। যেকোনো শব্দে ট্যাপ করে সংরক্ষণ করুন।",
    "phNote": "এই বাক্যাংশগুলো শুরুর সংকলন। ভরসা করার আগে মাতৃভাষীকে দিয়ে দেখিয়ে নিন।",
    "cat_greet": "শুভেচ্ছা",
    "cat_intro": "পরিচয়",
    "cat_daily": "দৈনন্দিন জীবন",
    "cat_num": "সংখ্যা",
    "slow": "ধীরে",
    "sayLede": "ইংরেজিতে একটি বাক্য লিখুন। অন্য ভাষায় রোমান উচ্চারণ ও কণ্ঠস্বরসহ পান।",
    "sayPlaceholder": "ইংরেজিতে বাক্য লিখুন, যেমন: How are you?",
    "sayInput": "ইংরেজি বাক্য",
    "sayTo": "এই ভাষায় বলুন",
    "sayGo": "অনুবাদ করে বলুন",
    "sayEnglish": "ইংরেজি বলুন",
    "sayResult": "ফল",
    "sayMatch": "বাক্যাংশ তালিকা",
    "sayDevice": "আপনার ডিভাইসে অনুবাদ করা",
    "sayClosest": "বাক্যাংশ তালিকার সবচেয়ে কাছের বাক্য",
    "sayNone": "যেকোনো বাক্য অনুবাদ করতে ডিভাইসে অনুবাদক আছে এমন ব্রাউজার (সাম্প্রতিক Chrome) লাগে। বাক্যাংশ তালিকার সবচেয়ে কাছের বাক্যগুলো এখানে।",
    "sayWorking": "আপনার ডিভাইসে অনুবাদ হচ্ছে…",
    "sayFail": "ডিভাইসের অনুবাদক এই ভাষাজোড়ার জন্য কাজ করেনি। বাক্যাংশ তালিকার সবচেয়ে কাছের বাক্যগুলো এখানে।",
    "sayNote": "কিছুই সার্ভারে পাঠানো হয় না। যন্ত্র-অনুবাদ ভুল হতে পারে, তাই জরুরি বাক্য মাতৃভাষীকে দিয়ে যাচাই করুন।",
    "copy": "কপি",
    "copied": "কপি হয়েছে",
    "cat_food": "খাবার",
    "cat_travel": "ভ্রমণ",
    "cat_shop": "কেনাকাটা",
    "cat_health": "স্বাস্থ্য",
    "cat_people": "মানুষ",
    "cat_time": "দিন ও সময়",
    "voiceCheck": "কণ্ঠস্বর পরীক্ষা",
    "vcLede": "এই ডিভাইসে কোন কণ্ঠস্বর কাজ করছে। প্রতিটি শুনতে পরীক্ষা চাপুন। কোনো ভাষার ডিভাইস কণ্ঠস্বর না থাকলে Bhasha একটি ছোট অফলাইন কণ্ঠস্বর ব্যবহার করতে পারে।",
    "vcDevice": "ডিভাইসের কণ্ঠস্বর",
    "vcOffline": "অফলাইন কণ্ঠস্বর প্রস্তুত",
    "vcOfflineAvail": "ডিভাইসের কণ্ঠস্বর নেই। অফলাইন কণ্ঠস্বর পাওয়া যাবে",
    "vcNone": "কণ্ঠস্বর নেই",
    "vcTest": "পরীক্ষা",
    "ovLabel": "অফলাইন কণ্ঠস্বরের ব্যাকআপ",
    "ovAsk": "জিজ্ঞাসা",
    "ovNote": "অফলাইন কণ্ঠস্বর (eSpeak NG) প্রায় ১৮ MB, একবার ডাউনলোড হলে ইন্টারনেট ছাড়াই চলে। এটি ডিভাইসের কণ্ঠস্বরের চেয়ে বেশি যান্ত্রিক শোনায়।",
    "ovAskQ": "এই ডিভাইসে {l} কণ্ঠস্বর নেই। অফলাইন কণ্ঠস্বর ডাউনলোড করবেন (প্রায় ১৮ MB, একবার)?",
    "ovYes": "ডাউনলোড",
    "ovNo": "এখন নয়",
    "ovLoading": "অফলাইন কণ্ঠস্বর লোড হচ্ছে…",
    "ovFail": "অফলাইন কণ্ঠস্বর চালানো গেল না।",
    "nav_today": "আজ",
    "nav_talk": "কথোপকথন",
    "cToday": "প্রতিদিন একটি ছোট পাঠ: পাঁচটি নতুন বাক্যাংশ, শোনার কুইজ ও মনে করার রাউন্ড।",
    "cTalk": "বাস্তব কথোপকথনের অনুশীলন করুন: রেস্টুরেন্ট, পথ জিজ্ঞাসা, কেনাকাটা, ডাক্তার, হোটেল। একটি লাইন শুনে আপনার উত্তর বেছে নিন।",
    "tdLede": "প্রতিদিন পাঁচটি নতুন বাক্যাংশ। শিখুন, শুনুন, তারপর ভুলে যাওয়ার আগেই পুরোনোগুলো মনে করুন।",
    "tdStart": "আজকের পাঠ শুরু করুন",
    "tdDone": "আজকের পাঠ শেষ। কাল আবার আসুন।",
    "tdLearn": "শিখুন",
    "tdListen": "শুনুন",
    "tdRecall": "মনে করুন",
    "tdNext": "পরবর্তী",
    "tdFinish": "শেষ",
    "tdListenQ": "শুনুন, তারপর অর্থ বেছে নিন",
    "tdRecallQ": "এই অর্থের বাক্যাংশটি বেছে নিন:",
    "tdScore": "স্কোর: {m}-এর মধ্যে {n}",
    "tdBonus": "আরেকটি পাঠ করুন",
    "tdProgress": "{m}-এর মধ্যে {n}টি বাক্যাংশ শেখা হয়েছে",
    "tdRecallN": "আজ মনে করার জন্য {n}টি পুরোনো বাক্যাংশ",
    "drLede": "একটি কথোপকথন বেছে নিন। তারা কী বলে শুনুন, তারপর আপনার উত্তর বেছে নিন।",
    "drPick": "কথোপকথন",
    "drTurns": "{n}টি পালা",
    "drThem": "তারা বলে",
    "drYou": "আপনার পালা। বলুন:",
    "drHide": "শোনার মোড: তাদের কথা লুকান",
    "drTry": "ঠিক হয়নি। আবার চেষ্টা করুন।",
    "drDone": "কথোপকথন শেষ",
    "drScore": "প্রথমবারেই {m}-এর মধ্যে {n}টি ঠিক",
    "drReplay": "আবার চালান",
    "drTranscript": "পুরো কথোপকথন",
    "drAnother": "আরেকটি কথোপকথন",
    "d_meet": "কারও সঙ্গে পরিচয়",
    "d_rest": "রেস্টুরেন্টে",
    "d_dir": "পথ জিজ্ঞাসা",
    "d_shop": "কেনাকাটা",
    "d_doc": "ডাক্তারের কাছে",
    "d_hotel": "হোটেলে",
    "cat_talk": "কথোপকথন",
    "cat_feel": "অনুভূতি",
    "cat_work": "কাজ ও ফোন",
    "cat_home": "বাড়ি ও আবহাওয়া",
    "pvTitle": "বিনামূল্যে ও ব্যক্তিগত",
    "pvLede": "Bhasha সবার জন্য বিনামূল্যে। কোনো অ্যাকাউন্ট নেই, বিজ্ঞাপন নেই, ট্র্যাকিং নেই। আপনি যা করেন সবই এই ডিভাইসে থাকে।",
    "pvFree": "সবার জন্য বিনামূল্যে",
    "pvFreeT": "কোনো পেমেন্ট নেই, সাইন-আপ নেই, কিছুই তালাবদ্ধ নয়। EknathaLabs এটি সবসময় বিনামূল্যে রাখার জন্য তৈরি করে।",
    "pvPriv": "আপনার ডিভাইসেই থাকে",
    "pvPrivT": "আপনার ফাইল, শব্দ ও অগ্রগতি শুধু এই ব্রাউজারেই থাকে। পাঠানোর জন্য কোনো সার্ভার নেই।",
    "pvNet": "কোনো ট্র্যাকিং নেই",
    "pvNetT": "কোনো অ্যানালিটিক্স নেই, কুকি নেই, বাইরের স্ক্রিপ্ট নেই। ফন্ট ও অফলাইন কণ্ঠ এই সাইট থেকেই আসে। বাইরের অভিধানের লিংক আপনি ট্যাপ করলে তবেই খোলে।",
    "pvMic": "আপনার কণ্ঠ",
    "pvMicT": "উচ্চারণের রেকর্ডিং পেজ খোলা থাকা পর্যন্ত শুধু মেমরিতে থাকে। এটি কখনও সংরক্ষণ বা আপলোড হয় না।",
    "pvStored": "এই ব্রাউজারে সংরক্ষিত",
    "pvWords": "সংরক্ষিত শব্দ",
    "pvLesson": "পাঠের বাক্যাংশ",
    "pvStats": "পড়ার দিন",
    "pvSet": "সেটিংস",
    "pvItems": "{n}টি আইটেম",
    "pvTotal": "মোট: {n}",
    "pvExport": "আমার ডেটা ডাউনলোড করুন",
    "pvImport": "ফাইল থেকে ফিরিয়ে আনুন",
    "pvClear": "আমার সব ডেটা মুছুন",
    "pvClearAsk": "এই ব্রাউজার থেকে সংরক্ষিত শব্দ, পাঠের অগ্রগতি, পড়ার ইতিহাস ও সেটিংস মুছবেন? এটি ফেরানো যাবে না। রাখতে চাইলে আগে একটি কপি ডাউনলোড করুন।",
    "pvClearYes": "হ্যাঁ, সব মুছুন",
    "pvCleared": "সব ডেটা মুছে ফেলা হয়েছে",
    "pvImported": "ডেটা ফিরিয়ে আনা হয়েছে",
    "pvBadFile": "এটি Bhasha-র ব্যাকআপ ফাইল নয়",
    "pvLicence": "Bhasha EknathaLabs-এর অংশ। ঐচ্ছিক অফলাইন কণ্ঠ (eSpeak NG) GPL-3.0 অধীনে ওপেন সোর্স এবং আপনি অনুমতি দিলে তবেই এই সাইট থেকে ডাউনলোড হয়।",
    "pvBadge": "বিনামূল্যে · ব্যক্তিগত · অফলাইন",
    "cPrivacy": "আপনার ডিভাইসে কী আছে দেখুন, তারপর ডাউনলোড বা মুছুন। বিনামূল্যে, কোনো ট্র্যাকিং নেই।",
    "cancel": "বাতিল",
    "setSound": "শব্দের প্রভাব",
    "setHaptic": "কম্পন",
    "pronBtn": "বলার অনুশীলন",
    "pronRec": "রেকর্ড",
    "pronStop": "থামান",
    "pronAgain": "আবার রেকর্ড করুন",
    "pronModel": "নমুনা",
    "pronYou": "আপনার কণ্ঠ",
    "pronCompare": "তুলনা করুন",
    "pronHelp": "নমুনা শুনুন, নিজে রেকর্ড করুন, তারপর কানে তুলনা করুন। আপনার রেকর্ডিং সংরক্ষিত হয় না।",
    "pronListening": "রেকর্ড হচ্ছে… এখন বলুন",
    "pronDone": "নিজের রেকর্ডিং শুনুন বা নমুনার সঙ্গে তুলনা করুন।",
    "pronDenied": "মাইক্রোফোন বন্ধ আছে। অনুশীলনের জন্য ব্রাউজারের সেটিংসে অনুমতি দিন।",
    "pronNoMic": "এই ব্রাউজার অডিও রেকর্ড করতে পারে না।",
    "pronEmpty": "কিছু রেকর্ড হয়নি। আবার চেষ্টা করুন।"
  };
  I.mr = {
    "skip": "मुख्य मजकुराकडे जा",
    "settings": "सेटिंग्ज",
    "part": "EknathaLabs चा भाग",
    "privacyNote": "तुमच्या ब्राउझरमध्येच चालते. तुमच्या फाइल्स आणि शब्द तुमच्या डिव्हाइसवरच राहतात.",
    "mainNav": "मुख्य",
    "uiLang": "इंटरफेसची भाषा",
    "focusLang": "मी शिकत असलेली भाषा",
    "scheme": "रोमन लेखनशैली",
    "schSimple": "साधी",
    "schIast": "विद्वत",
    "showRoman": "रोमन उच्चार दाखवा",
    "on": "चालू",
    "off": "बंद",
    "voiceSpeed": "आवाजाचा वेग",
    "perDay": "प्रत्येक सत्रातील उजळणी",
    "unlimited": "मर्यादा नाही",
    "theme": "थीम",
    "light": "फिकट",
    "dark": "गडद",
    "new": "नवी",
    "language": "भाषा",
    "allLangs": "सर्व भाषा",
    "allStatus": "सर्व",
    "auto": "आपोआप ओळखा",
    "indianLangs": "भारतीय भाषा",
    "otherLangs": "इतर भाषा",
    "nav_watch": "पाहा",
    "nav_read": "वाचा",
    "nav_words": "माझे शब्द",
    "nav_review": "उजळणी",
    "nav_scripts": "लिप्या",
    "nav_phrases": "वाक्प्रचार",
    "nav_say": "बोला",
    "homeH": "जे पाहता आणि वाचता त्यातूनच बोलली जाणारी भाषा शिका",
    "homeSub": "तुमचा स्वतःचा व्हिडिओ, ऑडिओ किंवा मजकूर आणा. कोणत्याही शब्दावर टॅप करून ऐका, इंग्रजी अक्षरांत उच्चार पाहा आणि साठवा. अंतराने उजळणी करून लक्षात ठेवा. मोफत, खाजगी आणि ऑफलाइन चालते.",
    "statWords": "साठवलेले शब्द",
    "statDue": "आजसाठी",
    "statStreak": "सलग दिवस",
    "cWatch": "तुमचा व्हिडिओ किंवा ऑडिओ दोन उपशीर्षक ओळींसह चालवा. शब्दांवर टॅप करा, ओळ पुन्हा ऐका, वेग कमी करा, वक्त्याची नक्कल करा.",
    "cRead": "कोणताही मजकूर पेस्ट करा किंवा उघडा. प्रत्येक शब्दावर टॅप करता येते, रोमन उच्चार आणि वाचून दाखवण्यासह.",
    "cWords": "तुम्ही साठवलेले सर्व काही, CSV, Anki आणि बॅकअप फाइलमध्ये निर्यातीसह.",
    "cReview": "विसरण्याआधीच परत येणारी फ्लॅशकार्ड्स.",
    "cScripts": "अक्षरे, स्वरचिन्हे आणि अंक. ऐका, प्रश्नमंजुषा खेळा, गिरवून सराव करा.",
    "cPhrases": "तेरा भाषांमध्ये २५० रोजचे वाक्प्रचार, रोमन उच्चार आणि आवाजासह.",
    "cSay": "इंग्रजीत वाक्य लिहा आणि ते तेलुगू, हिंदी, कन्नड, तमिळ, मल्याळम, बंगाली, मराठी, गुजराती, आसामी, कोरियन, स्पॅनिश, जर्मन किंवा फ्रेंचमध्ये ऐका.",
    "dueCount": "{n} बाकी",
    "howH": "हे कसे चालते",
    "how1": "तुमच्या व्हिडिओसोबत उपशीर्षक फाइल उघडा, किंवा मजकूर पेस्ट करा.",
    "how2": "माहीत नसलेल्या शब्दावर टॅप करा. ऐका आणि अर्थासह साठवा.",
    "how3": "उजळणीसाठी परत या. कार्ड्स योग्य वेळी परत येतात.",
    "how4": "सर्व काही याच डिव्हाइसवर राहते. केव्हाही निर्यात करा.",
    "homeNote": "आवाज तुमच्या डिव्हाइसमधून येतात. भारतीय भाषांचे आवाज फोन आणि ब्राउझरनुसार वेगळे असतात. काही ऐकू न आल्यास सेटिंग्जमधून आवाज तपासणी उघडा.",
    "noTts": "हा ब्राउझर मजकूर वाचून दाखवू शकत नाही.",
    "noVoice": "या डिव्हाइसवर {l} आवाज नाही. सिस्टम सेटिंग्जमध्ये एक इन्स्टॉल करा.",
    "storageFull": "साठवता आले नाही. ब्राउझरची साठवण भरली आहे किंवा बंद आहे.",
    "meaning": "अर्थ",
    "status": "स्थिती",
    "st0": "नवा",
    "st1": "शिकत आहे",
    "st2": "माहीत आहे",
    "seenIn": "वाक्प्रचार यादीतही आहे",
    "speak": "बोला",
    "close": "बंद करा",
    "update": "अद्यतनित करा",
    "save": "शब्द साठवा",
    "saved": "साठवले",
    "remove": "काढा",
    "speakSentence": "वाक्य वाचा",
    "translateDevice": "डिव्हाइसवर भाषांतर",
    "trFail": "भाषांतर उपलब्ध नाही.",
    "lookup": "शोधा",
    "opensTab": "नवा टॅब उघडतो",
    "wordDetails": "शब्दाचा तपशील",
    "rdLede": "मजकूर पेस्ट करा किंवा उघडा. कोणत्याही शब्दावर टॅप करा.",
    "rdPlaceholder": "येथे कोणत्याही भाषेचा मजकूर पेस्ट करा",
    "rdText": "वाचायचा मजकूर",
    "rdEmpty": "अजून दाखवण्यासारखे काही नाही. मजकूर पेस्ट करा किंवा नमुना लोड करा.",
    "rdStats": "{n} शब्द, {u} वेगळे. {k} माहीत, {l} शिकत आहे. भाषा: {lang}",
    "textLang": "मजकुराची भाषा",
    "colorWords": "स्थितीनुसार शब्दांना रंग",
    "fontSize": "अक्षराचा आकार",
    "readAloud": "वाचून दाखवा",
    "stop": "थांबवा",
    "sample": "नमुना लोड करा",
    "importTxt": "मजकूर फाइल उघडा",
    "clear": "पुसा",
    "clickWord": "तपशिलासाठी शब्दावर टॅप करा",
    "wtLede": "तुमचा स्वतःचा व्हिडिओ किंवा ऑडिओ उपशीर्षक फाइलसह वापरा. काहीही अपलोड होत नाही.",
    "wtSetup": "तुमच्या फाइल्स निवडा",
    "wtDrop": "व्हिडिओ किंवा ऑडिओ आणि उपशीर्षक फाइल्स येथे सोडा, किंवा बटणे वापरा.",
    "wtMedia": "व्हिडिओ किंवा ऑडिओ",
    "wtSub1": "उपशीर्षक (शिकत असलेली भाषा)",
    "wtSub2": "उपशीर्षक (तुमची भाषा)",
    "subLang": "उपशीर्षकाची भाषा",
    "wtStart": "सुरू करा",
    "wtSample": "नमुना पाहा (वाचून दाखवतो)",
    "noSubs": "{f} मध्ये उपशीर्षके सापडली नाहीत. .srt किंवा .vtt वापरा.",
    "wtPrivacy": "फाइल्स तुमच्या ब्राउझरमध्येच उघडतात आणि डिव्हाइसबाहेर जात नाहीत. व्हिडिओ किंवा ऑडिओ नसेल तर ओळी तुमच्या डिव्हाइसच्या आवाजात वाचून दाखवल्या जातात.",
    "wtListenMode": "ऐकण्याचा मोड: ओळी वाचून दाखवल्या जातात",
    "wtTranscript": "लिखित मजकूर",
    "playPause": "चालवा किंवा थांबवा",
    "prevLine": "मागील ओळ",
    "nextLine": "पुढील ओळ",
    "replay": "ओळ पुन्हा",
    "loopLine": "ओळ पुन्हा पुन्हा",
    "autoPause": "प्रत्येक ओळीनंतर थांबा",
    "hideTarget": "शिकत असलेल्या भाषेचे उपशीर्षक लपवा",
    "hideNative": "माझ्या भाषेचे उपशीर्षक लपवा",
    "blurNative": "माझी भाषा अस्पष्ट करा",
    "speed": "वेग",
    "subEarlier": "उपशीर्षक आधी दाखवा",
    "subLater": "उपशीर्षक नंतर दाखवा",
    "shadow": "नक्कल करा",
    "stopRec": "थांबवा",
    "yourVoice": "तुमचा आवाज",
    "orig": "मूळ",
    "noMic": "येथे रेकॉर्डिंग समर्थित नाही.",
    "micDenied": "मायक्रोफोनची परवानगी नाकारली.",
    "wtChange": "फाइल्स बदला",
    "wtKeys": "कळा: Space चालवा/थांबवा, A/D किंवा बाण मागे/पुढे, R पुन्हा, L पुनरावृत्ती, P प्रत्येक ओळीनंतर थांबा.",
    "wdLede": "तुमचे साठवलेले शब्द. फक्त या ब्राउझरमध्ये ठेवले जातात.",
    "wdCount": "{n} दाखवले, {d} आता बाकी",
    "wdNoMatch": "कोणताही शब्द जुळत नाही.",
    "wdEmpty": "अजून कोणतेही शब्द साठवलेले नाहीत.",
    "wdEmptySub": "वाचा किंवा पाहा उघडून शब्दावर टॅप करून साठवा.",
    "wdMore": "आणखी {n} दाखवलेले नाहीत. शोध वापरा.",
    "wdNothing": "निर्यात करण्यासाठी काही नाही.",
    "wdImported": "{n} नवे शब्द आयात झाले.",
    "wdImportFail": "ती फाइल वाचता आली नाही.",
    "wdPrivacy": "ब्राउझर डेटा पुसल्यास यादी जाते, म्हणून अधूनमधून बॅकअप निर्यात करा.",
    "search": "शोध",
    "edit": "बदला",
    "dueNow": "आत्ता",
    "dueToday": "आज",
    "dueIn": "{n} दिवसांत",
    "backup": "बॅकअप",
    "importWords": "आयात",
    "rvLede": "कार्ड उलटा, मग किती लक्षात होते ते सांगा.",
    "rvMode": "सरावाचा प्रकार",
    "rvW2M": "शब्दावरून अर्थ",
    "rvM2W": "अर्थावरून शब्द",
    "rvListen": "ऐकणे",
    "rvCloze": "रिकाम्या जागा भरा",
    "rvStreak": "सलग दिवस: {n}",
    "rvDone": "पूर्ण: {n} कार्ड्स",
    "rvDoneSub": "नंतर परत या. चुकलेली कार्ड्स काही मिनिटांत, बाकीची काही दिवसांत परत येतात.",
    "rvNone": "काहीही बाकी नाही",
    "rvNoneSub": "तुम्ही पुढे आहात. नवे शब्द शोधण्यासाठी आणखी वाचा किंवा पाहा.",
    "rvWhichWord": "हा शब्द कोणता?",
    "rvPlay": "शब्द ऐका",
    "rvListenQ": "ऐका, मग अर्थ आठवा",
    "rvHint": "अर्थ",
    "rvShow": "उत्तर दाखवा",
    "rvProgress": "सत्राची प्रगती",
    "again": "पुन्हा",
    "hard": "कठीण",
    "good": "छान",
    "easy": "सोपे",
    "scLede": "अक्षरे शिका. कोणत्याही अक्षरावर टॅप करून ऐका आणि गिरवा.",
    "scVowels": "स्वर",
    "scCons": "व्यंजने",
    "scSigns": "स्वरचिन्हे",
    "scSignsNote": "अक्षर {b} वर दाखवली आहेत",
    "scDigits": "अंक",
    "scQuiz": "छोटी प्रश्नमंजुषा",
    "scQuizQ": "हे अक्षर कसे वाचाल?",
    "scTrace": "गिरवा",
    "scTraceHint": "वर एका अक्षरावर टॅप करा, मग येथे गिरवा.",
    "correct": "बरोबर!",
    "wrongIs": "चुकले. हे {a} आहे.",
    "next": "पुढे",
    "phLede": "रोजचे वाक्प्रचार. कोणत्याही शब्दावर टॅप करून साठवा.",
    "phNote": "हे वाक्प्रचार सुरुवातीचा संच आहेत. त्यावर विसंबण्यापूर्वी मातृभाषिकाकडून तपासून घ्या.",
    "cat_greet": "अभिवादन",
    "cat_intro": "ओळख",
    "cat_daily": "रोजचे जीवन",
    "cat_num": "संख्या",
    "slow": "हळू",
    "sayLede": "इंग्रजीत वाक्य लिहा. ते दुसऱ्या भाषेत रोमन उच्चार आणि आवाजासह मिळवा.",
    "sayPlaceholder": "इंग्रजी वाक्य लिहा, उदाहरणार्थ: How are you?",
    "sayInput": "इंग्रजी वाक्य",
    "sayTo": "या भाषेत बोला",
    "sayGo": "भाषांतर करून बोला",
    "sayEnglish": "इंग्रजी बोला",
    "sayResult": "निकाल",
    "sayMatch": "वाक्प्रचार यादी",
    "sayDevice": "तुमच्या डिव्हाइसवर भाषांतरित",
    "sayClosest": "वाक्प्रचार यादीतील सर्वात जवळची वाक्ये",
    "sayNone": "कोणतेही वाक्य भाषांतरित करण्यासाठी डिव्हाइसवरील भाषांतरकार असलेला ब्राउझर (अलीकडील Chrome) लागतो. वाक्प्रचार यादीतील सर्वात जवळची वाक्ये येथे आहेत.",
    "sayWorking": "तुमच्या डिव्हाइसवर भाषांतर होत आहे…",
    "sayFail": "डिव्हाइसवरील भाषांतरकार या भाषाजोडीसाठी चालला नाही. वाक्प्रचार यादीतील सर्वात जवळची वाक्ये येथे आहेत.",
    "sayNote": "काहीही सर्व्हरला पाठवले जात नाही. यांत्रिक भाषांतर चुकू शकते, म्हणून महत्त्वाची वाक्ये मातृभाषिकाकडून तपासा.",
    "copy": "कॉपी",
    "copied": "कॉपी झाले",
    "cat_food": "जेवण",
    "cat_travel": "प्रवास",
    "cat_shop": "खरेदी",
    "cat_health": "आरोग्य",
    "cat_people": "माणसे",
    "cat_time": "दिवस आणि वेळ",
    "voiceCheck": "आवाज तपासणी",
    "vcLede": "या डिव्हाइसवर कोणते आवाज चालतात ते पाहा. प्रत्येक ऐकण्यासाठी तपासा दाबा. एखाद्या भाषेचा डिव्हाइस आवाज नसेल तर Bhasha छोटा ऑफलाइन आवाज वापरू शकतो.",
    "vcDevice": "डिव्हाइसचा आवाज",
    "vcOffline": "ऑफलाइन आवाज तयार",
    "vcOfflineAvail": "डिव्हाइसचा आवाज नाही. ऑफलाइन आवाज उपलब्ध",
    "vcNone": "आवाज नाही",
    "vcTest": "तपासा",
    "ovLabel": "ऑफलाइन आवाजाचा आधार",
    "ovAsk": "विचारा",
    "ovNote": "ऑफलाइन आवाज (eSpeak NG) सुमारे १८ MB चा आहे, एकदा डाउनलोड झाला की इंटरनेटशिवाय चालतो. तो डिव्हाइसच्या आवाजांपेक्षा अधिक यांत्रिक वाटतो.",
    "ovAskQ": "या डिव्हाइसवर {l} आवाज नाही. ऑफलाइन आवाज डाउनलोड करायचा का (सुमारे १८ MB, एकदा)?",
    "ovYes": "डाउनलोड",
    "ovNo": "आत्ता नको",
    "ovLoading": "ऑफलाइन आवाज लोड होत आहे…",
    "ovFail": "ऑफलाइन आवाज वाजवता आला नाही.",
    "nav_today": "आज",
    "nav_talk": "संभाषणे",
    "cToday": "दररोज एक छोटा धडा: पाच नवे वाक्प्रचार, ऐकून उत्तर देणे आणि उजळणी.",
    "cTalk": "खऱ्या संभाषणांचा सराव करा: रेस्टॉरंट, रस्ता विचारणे, खरेदी, डॉक्टर, हॉटेल. एक ओळ ऐका, मग तुमचे उत्तर निवडा.",
    "tdLede": "रोज पाच नवे वाक्प्रचार. शिका, ऐका, आणि विसरण्याआधी जुने आठवा.",
    "tdStart": "आजचा धडा सुरू करा",
    "tdDone": "आजचा धडा पूर्ण झाला. उद्या पुन्हा या.",
    "tdLearn": "शिका",
    "tdListen": "ऐका",
    "tdRecall": "आठवा",
    "tdNext": "पुढे",
    "tdFinish": "संपवा",
    "tdListenQ": "ऐका, मग अर्थ निवडा",
    "tdRecallQ": "हा अर्थ असलेला वाक्प्रचार निवडा:",
    "tdScore": "गुण: {m} पैकी {n}",
    "tdBonus": "आणखी एक धडा करा",
    "tdProgress": "{m} पैकी {n} वाक्प्रचार शिकले",
    "tdRecallN": "आज आठवायचे {n} जुने वाक्प्रचार",
    "drLede": "एक संभाषण निवडा. ते काय म्हणतात ते ऐका, मग तुमचे उत्तर निवडा.",
    "drPick": "संभाषणे",
    "drTurns": "{n} फेऱ्या",
    "drThem": "ते म्हणतात",
    "drYou": "तुमची पाळी. म्हणा:",
    "drHide": "ऐकण्याचा मोड: त्यांचे बोलणे लपवा",
    "drTry": "बरोबर नाही. पुन्हा प्रयत्न करा.",
    "drDone": "संभाषण पूर्ण झाले",
    "drScore": "पहिल्या प्रयत्नात {m} पैकी {n} बरोबर",
    "drReplay": "पुन्हा वाजवा",
    "drTranscript": "संपूर्ण संभाषण",
    "drAnother": "दुसरे संभाषण",
    "d_meet": "कोणाला भेटणे",
    "d_rest": "रेस्टॉरंटमध्ये",
    "d_dir": "रस्ता विचारणे",
    "d_shop": "खरेदी",
    "d_doc": "डॉक्टरकडे",
    "d_hotel": "हॉटेलमध्ये",
    "cat_talk": "संभाषण",
    "cat_feel": "भावना",
    "cat_work": "काम आणि फोन",
    "cat_home": "घर आणि हवामान",
    "pvTitle": "मोफत आणि खाजगी",
    "pvLede": "Bhasha सर्वांसाठी मोफत आहे. खाते नाही, जाहिराती नाहीत, ट्रॅकिंग नाही. तुम्ही जे काही करता ते याच उपकरणावर राहते.",
    "pvFree": "सर्वांसाठी मोफत",
    "pvFreeT": "पैसे नाहीत, साइन-अप नाही, काहीही बंद नाही. EknathaLabs हे कायम मोफत राहावे म्हणून बनवते.",
    "pvPriv": "तुमच्या उपकरणावरच राहते",
    "pvPrivT": "तुमच्या फाइल, शब्द आणि प्रगती फक्त या ब्राउझरमध्ये राहतात. ते पाठवायला सर्व्हरच नाही.",
    "pvNet": "ट्रॅकिंग नाही",
    "pvNetT": "अ‍ॅनालिटिक्स नाही, कुकीज नाहीत, बाहेरील स्क्रिप्ट नाहीत. फॉन्ट आणि ऑफलाइन आवाज याच साइटवरून येतात. बाहेरील शब्दकोशाच्या लिंक तुम्ही दाबल्यावरच उघडतात.",
    "pvMic": "तुमचा आवाज",
    "pvMicT": "उच्चाराचे रेकॉर्डिंग पान उघडे असेपर्यंतच मेमरीत राहते. ते कधीही सेव्ह किंवा अपलोड केले जात नाही.",
    "pvStored": "या ब्राउझरमध्ये सेव्ह केलेले",
    "pvWords": "सेव्ह केलेले शब्द",
    "pvLesson": "धड्यातील वाक्ये",
    "pvStats": "अभ्यासाचे दिवस",
    "pvSet": "सेटिंग्ज",
    "pvItems": "{n} आयटम",
    "pvTotal": "एकूण: {n}",
    "pvExport": "माझा डेटा डाउनलोड करा",
    "pvImport": "फाइलमधून पुनर्संचयित करा",
    "pvClear": "माझा सर्व डेटा हटवा",
    "pvClearAsk": "या ब्राउझरमधून सेव्ह केलेले शब्द, धड्यांची प्रगती, अभ्यासाचा इतिहास आणि सेटिंग्ज हटवायचे? हे परत करता येणार नाही. ठेवायचे असल्यास आधी एक प्रत डाउनलोड करा.",
    "pvClearYes": "होय, सर्व हटवा",
    "pvCleared": "सर्व डेटा हटवला",
    "pvImported": "डेटा पुनर्संचयित केला",
    "pvBadFile": "ही Bhasha ची बॅकअप फाइल नाही",
    "pvLicence": "Bhasha हे EknathaLabs चा भाग आहे. ऐच्छिक ऑफलाइन आवाज (eSpeak NG) GPL-3.0 अंतर्गत ओपन सोर्स आहे आणि तुम्ही परवानगी दिल्यावरच या साइटवरून डाउनलोड होतो.",
    "pvBadge": "मोफत · खाजगी · ऑफलाइन",
    "cPrivacy": "तुमच्या उपकरणावर काय राहते ते पाहा, मग डाउनलोड करा किंवा हटवा. मोफत, ट्रॅकिंग नाही.",
    "cancel": "रद्द करा",
    "setSound": "ध्वनी प्रभाव",
    "setHaptic": "कंपन",
    "pronBtn": "बोलण्याचा सराव",
    "pronRec": "रेकॉर्ड करा",
    "pronStop": "थांबवा",
    "pronAgain": "पुन्हा रेकॉर्ड करा",
    "pronModel": "नमुना",
    "pronYou": "तुमचा आवाज",
    "pronCompare": "तुलना करा",
    "pronHelp": "नमुना ऐका, स्वतः रेकॉर्ड करा आणि कानाने तुलना करा. तुमचे रेकॉर्डिंग सेव्ह होत नाही.",
    "pronListening": "रेकॉर्ड होत आहे… आता बोला",
    "pronDone": "तुमचे रेकॉर्डिंग ऐका किंवा नमुन्याशी तुलना करा.",
    "pronDenied": "मायक्रोफोन बंद आहे. सरावासाठी ब्राउझर सेटिंग्जमध्ये परवानगी द्या.",
    "pronNoMic": "हा ब्राउझर ऑडिओ रेकॉर्ड करू शकत नाही.",
    "pronEmpty": "काहीही रेकॉर्ड झाले नाही. पुन्हा प्रयत्न करा."
  };
  I.ko = {
    "skip": "본문으로 건너뛰기",
    "settings": "설정",
    "part": "EknathaLabs의 일부",
    "privacyNote": "브라우저에서 실행됩니다. 파일과 단어는 기기에만 저장됩니다.",
    "mainNav": "메인",
    "uiLang": "인터페이스 언어",
    "focusLang": "배우는 언어",
    "scheme": "로마자 표기 방식",
    "schSimple": "간단",
    "schIast": "학술식",
    "showRoman": "로마자 발음 표시",
    "on": "켜짐",
    "off": "꺼짐",
    "voiceSpeed": "음성 속도",
    "perDay": "세션당 복습 수",
    "unlimited": "제한 없음",
    "theme": "테마",
    "light": "밝게",
    "dark": "어둡게",
    "new": "새 테마",
    "language": "언어",
    "allLangs": "모든 언어",
    "allStatus": "전체",
    "auto": "자동 감지",
    "indianLangs": "인도 언어",
    "otherLangs": "기타 언어",
    "nav_watch": "보기",
    "nav_read": "읽기",
    "nav_words": "내 단어",
    "nav_review": "복습",
    "nav_scripts": "문자",
    "nav_phrases": "표현",
    "nav_say": "말하기",
    "homeH": "이미 보고 읽는 것으로 말하는 언어를 배우세요",
    "homeSub": "내 영상, 오디오, 글을 가져오세요. 단어를 탭하면 소리를 듣고, 로마자 발음을 보고, 저장할 수 있습니다. 간격을 두고 복습해 기억하세요. 무료, 비공개, 오프라인 지원.",
    "statWords": "저장한 단어",
    "statDue": "오늘 복습",
    "statStreak": "연속 일수",
    "cWatch": "내 영상이나 오디오를 두 줄 자막과 함께 재생하세요. 단어를 탭하고, 문장을 반복하고, 속도를 늦추고, 화자를 따라 말해 보세요.",
    "cRead": "글을 붙여넣거나 열어 보세요. 모든 단어를 탭할 수 있고, 로마자 발음과 소리 내어 읽기를 지원합니다.",
    "cWords": "저장한 모든 단어를 CSV, Anki, 백업 파일로 내보낼 수 있습니다.",
    "cReview": "잊기 직전에 다시 나타나는 플래시카드.",
    "cScripts": "글자, 모음 기호, 숫자. 듣고, 퀴즈를 풀고, 쓰기를 연습하세요.",
    "cPhrases": "13개 언어의 일상 표현 250개, 로마자 발음과 음성 포함.",
    "cSay": "영어로 문장을 쓰고 텔루구어, 힌디어, 칸나다어, 타밀어, 말라얄람어, 벵골어, 마라티어, 구자라트어, 아삼어, 한국어, 스페인어, 독일어, 프랑스어로 들어 보세요.",
    "dueCount": "{n}개 남음",
    "howH": "사용 방법",
    "how1": "영상과 함께 자막 파일을 열거나 글을 붙여넣으세요.",
    "how2": "모르는 단어를 탭하세요. 듣고 뜻과 함께 저장하세요.",
    "how3": "복습으로 돌아오세요. 카드가 알맞은 때에 다시 나타납니다.",
    "how4": "모든 것이 이 기기에 남습니다. 언제든 내보낼 수 있습니다.",
    "homeNote": "음성은 기기에서 나옵니다. 인도 언어 음성은 휴대폰과 브라우저에 따라 다릅니다. 소리가 나지 않으면 설정에서 음성 점검을 열어 보세요.",
    "noTts": "이 브라우저는 글을 소리 내어 읽을 수 없습니다.",
    "noVoice": "이 기기에는 {l} 음성이 없습니다. 시스템 설정에서 설치하세요.",
    "storageFull": "저장할 수 없습니다. 브라우저 저장 공간이 가득 찼거나 꺼져 있습니다.",
    "meaning": "뜻",
    "status": "상태",
    "st0": "새 단어",
    "st1": "학습 중",
    "st2": "아는 단어",
    "seenIn": "표현 목록에도 있음",
    "speak": "말하기",
    "close": "닫기",
    "update": "업데이트",
    "save": "단어 저장",
    "saved": "저장됨",
    "remove": "삭제",
    "speakSentence": "문장 읽기",
    "translateDevice": "기기에서 번역",
    "trFail": "번역을 사용할 수 없습니다.",
    "lookup": "찾아보기",
    "opensTab": "새 탭에서 열림",
    "wordDetails": "단어 상세",
    "rdLede": "글을 붙여넣거나 여세요. 아무 단어나 탭하세요.",
    "rdPlaceholder": "여기에 어떤 언어든 글을 붙여넣으세요",
    "rdText": "읽을 글",
    "rdEmpty": "아직 표시할 내용이 없습니다. 글을 붙여넣거나 예시를 불러오세요.",
    "rdStats": "{n}단어, 중복 제외 {u}. 아는 단어 {k}, 학습 중 {l}. 언어: {lang}",
    "textLang": "글의 언어",
    "colorWords": "상태별로 단어 색칠",
    "fontSize": "글자 크기",
    "readAloud": "소리 내어 읽기",
    "stop": "중지",
    "sample": "예시 불러오기",
    "importTxt": "텍스트 파일 열기",
    "clear": "지우기",
    "clickWord": "단어를 탭하면 자세히 볼 수 있습니다",
    "wtLede": "내 영상이나 오디오를 자막 파일과 함께 사용하세요. 아무것도 업로드되지 않습니다.",
    "wtSetup": "파일 선택",
    "wtDrop": "영상이나 오디오와 자막 파일을 여기에 놓거나 버튼을 사용하세요.",
    "wtMedia": "영상 또는 오디오",
    "wtSub1": "자막 (배우는 언어)",
    "wtSub2": "자막 (내 언어)",
    "subLang": "자막 언어",
    "wtStart": "시작",
    "wtSample": "예시 체험 (소리 내어 읽어 줌)",
    "noSubs": "{f}에서 자막을 찾지 못했습니다. .srt 또는 .vtt를 사용하세요.",
    "wtPrivacy": "파일은 브라우저 안에서 열리며 기기 밖으로 나가지 않습니다. 영상이나 오디오가 없으면 문장을 기기 음성으로 읽어 줍니다.",
    "wtListenMode": "듣기 모드: 문장을 소리 내어 읽어 줍니다",
    "wtTranscript": "대본",
    "playPause": "재생 또는 일시정지",
    "prevLine": "이전 문장",
    "nextLine": "다음 문장",
    "replay": "문장 다시",
    "loopLine": "문장 반복",
    "autoPause": "문장마다 일시정지",
    "hideTarget": "배우는 언어 자막 숨기기",
    "hideNative": "내 언어 자막 숨기기",
    "blurNative": "내 언어 흐리게",
    "speed": "속도",
    "subEarlier": "자막 앞당기기",
    "subLater": "자막 늦추기",
    "shadow": "따라 말하기",
    "stopRec": "중지",
    "yourVoice": "내 목소리",
    "orig": "원본",
    "noMic": "여기서는 녹음을 지원하지 않습니다.",
    "micDenied": "마이크 권한이 거부되었습니다.",
    "wtChange": "파일 변경",
    "wtKeys": "키: Space 재생/일시정지, A/D 또는 화살표 이전/다음, R 다시, L 반복, P 문장마다 일시정지.",
    "wdLede": "저장한 단어입니다. 이 브라우저에만 보관됩니다.",
    "wdCount": "{n}개 표시, 지금 복습할 것 {d}개",
    "wdNoMatch": "일치하는 단어가 없습니다.",
    "wdEmpty": "아직 저장한 단어가 없습니다.",
    "wdEmptySub": "읽기나 보기에서 단어를 탭해 저장하세요.",
    "wdMore": "{n}개가 더 있습니다. 검색을 사용하세요.",
    "wdNothing": "내보낼 항목이 없습니다.",
    "wdImported": "새 단어 {n}개를 가져왔습니다.",
    "wdImportFail": "파일을 읽을 수 없습니다.",
    "wdPrivacy": "브라우저 데이터를 지우면 목록이 사라지므로 가끔 백업을 내보내세요.",
    "search": "검색",
    "edit": "편집",
    "dueNow": "지금",
    "dueToday": "오늘",
    "dueIn": "{n}일 후",
    "backup": "백업",
    "importWords": "가져오기",
    "rvLede": "카드를 뒤집고 얼마나 기억했는지 알려 주세요.",
    "rvMode": "연습 방식",
    "rvW2M": "단어에서 뜻",
    "rvM2W": "뜻에서 단어",
    "rvListen": "듣기",
    "rvCloze": "빈칸 채우기",
    "rvStreak": "연속 일수: {n}",
    "rvDone": "완료: 카드 {n}장",
    "rvDoneSub": "나중에 다시 오세요. 틀린 카드는 몇 분 뒤, 나머지는 며칠 뒤에 다시 나옵니다.",
    "rvNone": "복습할 것이 없습니다",
    "rvNoneSub": "모두 마쳤습니다. 더 읽거나 보면서 새 단어를 찾아보세요.",
    "rvWhichWord": "어떤 단어일까요?",
    "rvPlay": "단어 듣기",
    "rvListenQ": "듣고 뜻을 떠올려 보세요",
    "rvHint": "뜻",
    "rvShow": "정답 보기",
    "rvProgress": "세션 진행률",
    "again": "다시",
    "hard": "어려움",
    "good": "좋음",
    "easy": "쉬움",
    "scLede": "글자를 배우세요. 글자를 탭하면 소리를 듣고 쓰기를 연습할 수 있습니다.",
    "scVowels": "모음",
    "scCons": "자음",
    "scSigns": "모음 기호",
    "scSignsNote": "글자 {b} 위에 표시됨",
    "scDigits": "숫자",
    "scQuiz": "간단 퀴즈",
    "scQuizQ": "이 글자는 어떻게 읽나요?",
    "scTrace": "따라 쓰기",
    "scTraceHint": "위에서 글자를 탭한 뒤 여기에 따라 쓰세요.",
    "correct": "정답!",
    "wrongIs": "아쉽네요. 정답은 {a}입니다.",
    "next": "다음",
    "phLede": "일상 표현입니다. 단어를 탭해 저장하세요.",
    "phNote": "이 표현들은 기초 모음입니다. 사용하기 전에 원어민에게 확인받으세요.",
    "cat_greet": "인사",
    "cat_intro": "소개",
    "cat_daily": "일상",
    "cat_num": "숫자",
    "slow": "느리게",
    "sayLede": "영어로 문장을 쓰세요. 다른 언어로 로마자 발음과 음성과 함께 들을 수 있습니다.",
    "sayPlaceholder": "영어 문장을 입력하세요. 예: How are you?",
    "sayInput": "영어 문장",
    "sayTo": "말할 언어",
    "sayGo": "번역하고 말하기",
    "sayEnglish": "영어로 말하기",
    "sayResult": "결과",
    "sayMatch": "표현집",
    "sayDevice": "기기에서 번역됨",
    "sayClosest": "표현집에서 가장 비슷한 문장",
    "sayNone": "자유 문장 번역은 기기 내 번역기가 있는 브라우저(최신 Chrome)가 필요합니다. 표현집에서 가장 비슷한 문장을 보여 드립니다.",
    "sayWorking": "기기에서 번역 중…",
    "sayFail": "기기 번역기가 이 언어 조합에서 작동하지 않았습니다. 표현집에서 가장 비슷한 문장을 보여 드립니다.",
    "sayNote": "아무것도 서버로 전송되지 않습니다. 기계 번역은 틀릴 수 있으니 중요한 문장은 원어민에게 확인받으세요.",
    "copy": "복사",
    "copied": "복사됨",
    "cat_food": "음식",
    "cat_travel": "여행",
    "cat_shop": "쇼핑",
    "cat_health": "건강",
    "cat_people": "사람",
    "cat_time": "요일과 시간",
    "voiceCheck": "음성 점검",
    "vcLede": "이 기기에서 작동하는 음성을 확인합니다. 테스트를 눌러 각각 들어 보세요. 기기 음성이 없는 언어는 Bhasha가 작은 오프라인 음성을 사용할 수 있습니다.",
    "vcDevice": "기기 음성",
    "vcOffline": "오프라인 음성 준비됨",
    "vcOfflineAvail": "기기 음성 없음. 오프라인 음성 사용 가능",
    "vcNone": "음성 없음",
    "vcTest": "테스트",
    "ovLabel": "오프라인 음성 대체",
    "ovAsk": "물어보기",
    "ovNote": "오프라인 음성(eSpeak NG)은 약 18MB이며 한 번 내려받으면 인터넷 없이 작동합니다. 기기 음성보다 기계적으로 들립니다.",
    "ovAskQ": "이 기기에는 {l} 음성이 없습니다. 오프라인 음성을 내려받을까요 (약 18MB, 한 번)?",
    "ovYes": "내려받기",
    "ovNo": "나중에",
    "ovLoading": "오프라인 음성을 불러오는 중…",
    "ovFail": "오프라인 음성을 재생할 수 없습니다.",
    "nav_today": "오늘",
    "nav_talk": "대화",
    "cToday": "매일 짧은 수업: 새 표현 5개, 듣기 퀴즈, 복습 라운드.",
    "cTalk": "실전 대화를 연습하세요: 식당, 길 묻기, 쇼핑, 병원, 호텔. 한 문장을 듣고 답변을 고르세요.",
    "tdLede": "하루 새 표현 5개. 배우고, 듣고, 잊기 전에 이전 표현을 떠올려 보세요.",
    "tdStart": "오늘의 수업 시작",
    "tdDone": "오늘의 수업을 마쳤어요. 내일 또 오세요.",
    "tdLearn": "배우기",
    "tdListen": "듣기",
    "tdRecall": "떠올리기",
    "tdNext": "다음",
    "tdFinish": "마치기",
    "tdListenQ": "듣고 뜻을 고르세요",
    "tdRecallQ": "이 뜻의 표현을 고르세요:",
    "tdScore": "점수: {m}개 중 {n}개",
    "tdBonus": "보너스 수업 하기",
    "tdProgress": "{m}개 중 {n}개 표현 학습",
    "tdRecallN": "오늘 복습할 이전 표현 {n}개",
    "drLede": "대화를 고르세요. 상대의 말을 듣고 답변을 고르세요.",
    "drPick": "대화",
    "drTurns": "{n}번 주고받기",
    "drThem": "상대의 말",
    "drYou": "당신 차례. 말해 보세요:",
    "drHide": "듣기 모드: 상대의 말 숨기기",
    "drTry": "아쉬워요. 다시 해 보세요.",
    "drDone": "대화 완료",
    "drScore": "첫 시도에 {m}개 중 {n}개 정답",
    "drReplay": "다시 하기",
    "drTranscript": "전체 대화",
    "drAnother": "다른 대화",
    "d_meet": "처음 만났을 때",
    "d_rest": "식당에서",
    "d_dir": "길 묻기",
    "d_shop": "쇼핑",
    "d_doc": "병원에서",
    "d_hotel": "호텔에서",
    "cat_talk": "대화",
    "cat_feel": "감정",
    "cat_work": "일과 전화",
    "cat_home": "집과 날씨",
    "pvTitle": "무료 · 개인정보 보호",
    "pvLede": "Bhasha는 누구나 무료입니다. 계정도, 광고도, 추적도 없습니다. 하신 모든 것은 이 기기에만 남습니다.",
    "pvFree": "누구에게나 무료",
    "pvFreeT": "결제도 가입도 없고 잠긴 기능도 없습니다. EknathaLabs는 계속 무료로 쓰실 수 있도록 만듭니다.",
    "pvPriv": "내 기기에만 저장",
    "pvPrivT": "파일, 단어, 학습 기록은 이 브라우저에만 저장됩니다. 보낼 서버가 없습니다.",
    "pvNet": "추적 없음",
    "pvNetT": "분석 도구, 쿠키, 외부 스크립트가 없습니다. 글꼴과 오프라인 음성은 이 사이트에서 제공됩니다. 외부 사전 링크는 직접 누를 때만 열립니다.",
    "pvMic": "내 목소리",
    "pvMicT": "발음 녹음은 페이지가 열려 있는 동안 메모리에만 있습니다. 저장되거나 업로드되지 않습니다.",
    "pvStored": "이 브라우저에 저장된 항목",
    "pvWords": "저장한 단어",
    "pvLesson": "레슨 표현",
    "pvStats": "학습한 날",
    "pvSet": "설정",
    "pvItems": "{n}개",
    "pvTotal": "합계: {n}",
    "pvExport": "내 데이터 내려받기",
    "pvImport": "파일에서 복원",
    "pvClear": "내 데이터 모두 삭제",
    "pvClearAsk": "이 브라우저에서 저장한 단어, 레슨 진행, 학습 기록, 설정을 삭제할까요? 되돌릴 수 없습니다. 보관하려면 먼저 사본을 내려받으세요.",
    "pvClearYes": "예, 모두 삭제",
    "pvCleared": "모든 데이터를 삭제했습니다",
    "pvImported": "데이터를 복원했습니다",
    "pvBadFile": "Bhasha 백업 파일이 아닙니다",
    "pvLicence": "Bhasha는 EknathaLabs의 일부입니다. 선택 사항인 오프라인 음성(eSpeak NG)은 GPL-3.0 오픈 소스이며, 허용하실 때만 이 사이트에서 내려받습니다.",
    "pvBadge": "무료 · 비공개 · 오프라인",
    "cPrivacy": "내 기기에 무엇이 남는지 확인하고 내려받거나 삭제하세요. 무료, 추적 없음.",
    "cancel": "취소",
    "setSound": "효과음",
    "setHaptic": "진동",
    "pronBtn": "말하기 연습",
    "pronRec": "녹음",
    "pronStop": "중지",
    "pronAgain": "다시 녹음",
    "pronModel": "예시 음성",
    "pronYou": "내 목소리",
    "pronCompare": "비교",
    "pronHelp": "예시를 듣고, 직접 녹음한 뒤 귀로 비교해 보세요. 녹음은 저장되지 않습니다.",
    "pronListening": "녹음 중… 지금 말하세요",
    "pronDone": "내 녹음을 듣거나 예시와 비교해 보세요.",
    "pronDenied": "마이크가 차단되어 있습니다. 연습하려면 브라우저 설정에서 허용해 주세요.",
    "pronNoMic": "이 브라우저는 오디오를 녹음할 수 없습니다.",
    "pronEmpty": "녹음된 내용이 없습니다. 다시 시도하세요."
  };
  I.es = {
    "skip": "Saltar al contenido",
    "settings": "Ajustes",
    "part": "Parte de EknathaLabs",
    "privacyNote": "Funciona en tu navegador. Tus archivos y palabras se quedan en tu dispositivo.",
    "mainNav": "Principal",
    "uiLang": "Idioma de la interfaz",
    "focusLang": "Idioma que estoy aprendiendo",
    "scheme": "Estilo de romanización",
    "schSimple": "Simple",
    "schIast": "Académico",
    "showRoman": "Mostrar romanización",
    "on": "Sí",
    "off": "No",
    "voiceSpeed": "Velocidad de la voz",
    "perDay": "Repasos por sesión",
    "unlimited": "Sin límite",
    "theme": "Tema",
    "light": "Claro",
    "dark": "Oscuro",
    "new": "Nuevo",
    "language": "Idioma",
    "allLangs": "Todos los idiomas",
    "allStatus": "Todos",
    "auto": "Detectar automáticamente",
    "indianLangs": "Idiomas de la India",
    "otherLangs": "Otros idiomas",
    "nav_watch": "Ver",
    "nav_read": "Leer",
    "nav_words": "Mis palabras",
    "nav_review": "Repaso",
    "nav_scripts": "Escrituras",
    "nav_phrases": "Frases",
    "nav_say": "Decir",
    "homeH": "Aprende la lengua hablada con lo que ya ves y lees",
    "homeSub": "Trae tu propio vídeo, audio o texto. Toca cualquier palabra para oírla, ver su pronunciación en letras latinas y guardarla. Repasa a intervalos para recordarla. Gratis, privado y sin conexión.",
    "statWords": "Palabras guardadas",
    "statDue": "Para hoy",
    "statStreak": "Días seguidos",
    "cWatch": "Reproduce tu vídeo o audio con subtítulos en dos líneas. Toca palabras, repite líneas, baja la velocidad e imita al hablante.",
    "cRead": "Pega o abre cualquier texto. Cada palabra es tocable, con pronunciación en letras latinas y lectura en voz alta.",
    "cWords": "Todo lo que has guardado, con exportación a CSV, Anki y archivo de copia.",
    "cReview": "Tarjetas que vuelven justo antes de que las olvides.",
    "cScripts": "Letras, signos vocálicos y números. Escucha, haz un test y practica el trazo.",
    "cPhrases": "250 frases cotidianas en trece idiomas, con pronunciación y voz.",
    "cSay": "Escribe una frase en inglés y escúchala en telugu, hindi, canarés, tamil, malayalam, bengalí, maratí, guyaratí, asamés, coreano, español, alemán o francés.",
    "dueCount": "{n} pendientes",
    "howH": "Cómo funciona",
    "how1": "Abre un archivo de subtítulos junto a tu vídeo, o pega un texto.",
    "how2": "Toca una palabra que no conozcas. Escúchala y guárdala con su significado.",
    "how3": "Vuelve al repaso. Las tarjetas regresan en el momento justo.",
    "how4": "Todo se queda en este dispositivo. Exporta cuando quieras.",
    "homeNote": "Las voces vienen de tu dispositivo. Las voces de idiomas indios varían según el teléfono y el navegador. Si no oyes nada, abre la prueba de voz en Ajustes.",
    "noTts": "Este navegador no puede leer texto en voz alta.",
    "noVoice": "Este dispositivo no tiene voz para {l}. Instala una en los ajustes del sistema.",
    "storageFull": "No se pudo guardar. El almacenamiento del navegador está lleno o desactivado.",
    "meaning": "Significado",
    "status": "Estado",
    "st0": "Nueva",
    "st1": "Aprendiendo",
    "st2": "Conocida",
    "seenIn": "También está en las frases",
    "speak": "Decir",
    "close": "Cerrar",
    "update": "Actualizar",
    "save": "Guardar palabra",
    "saved": "Guardada",
    "remove": "Quitar",
    "speakSentence": "Leer frase",
    "translateDevice": "Traducir en el dispositivo",
    "trFail": "Traducción no disponible.",
    "lookup": "Buscar",
    "opensTab": "Abre una pestaña nueva",
    "wordDetails": "Detalles de la palabra",
    "rdLede": "Pega o abre un texto. Toca cualquier palabra.",
    "rdPlaceholder": "Pega aquí texto en cualquier idioma",
    "rdText": "Texto para leer",
    "rdEmpty": "Aún no hay nada que mostrar. Pega un texto o carga el ejemplo.",
    "rdStats": "{n} palabras, {u} distintas. {k} conocidas, {l} aprendiendo. Idioma: {lang}",
    "textLang": "Idioma del texto",
    "colorWords": "Colorear palabras por estado",
    "fontSize": "Tamaño del texto",
    "readAloud": "Leer en voz alta",
    "stop": "Parar",
    "sample": "Cargar ejemplo",
    "importTxt": "Abrir archivo de texto",
    "clear": "Borrar",
    "clickWord": "Toca una palabra para ver detalles",
    "wtLede": "Usa tu propio vídeo o audio con un archivo de subtítulos. No se sube nada.",
    "wtSetup": "Elige tus archivos",
    "wtDrop": "Suelta aquí el vídeo o audio y los subtítulos, o usa los botones.",
    "wtMedia": "Vídeo o audio",
    "wtSub1": "Subtítulos (idioma que aprendes)",
    "wtSub2": "Subtítulos (tu idioma)",
    "subLang": "Idioma de los subtítulos",
    "wtStart": "Empezar",
    "wtSample": "Probar con un ejemplo (lee en voz alta)",
    "noSubs": "No se encontraron subtítulos en {f}. Usa .srt o .vtt.",
    "wtPrivacy": "Los archivos se abren dentro del navegador y no salen de tu dispositivo. Sin vídeo ni audio, las líneas se leen con la voz de tu dispositivo.",
    "wtListenMode": "Modo de escucha: se leen las líneas en voz alta",
    "wtTranscript": "Transcripción",
    "playPause": "Reproducir o pausar",
    "prevLine": "Línea anterior",
    "nextLine": "Línea siguiente",
    "replay": "Repetir línea",
    "loopLine": "Línea en bucle",
    "autoPause": "Pausar tras cada línea",
    "hideTarget": "Ocultar subtítulos del idioma que aprendo",
    "hideNative": "Ocultar subtítulos de mi idioma",
    "blurNative": "Difuminar mi idioma",
    "speed": "Velocidad",
    "subEarlier": "Subtítulos antes",
    "subLater": "Subtítulos después",
    "shadow": "Imitar",
    "stopRec": "Parar",
    "yourVoice": "Tu voz",
    "orig": "Original",
    "noMic": "La grabación no es compatible aquí.",
    "micDenied": "Se denegó el permiso del micrófono.",
    "wtChange": "Cambiar archivos",
    "wtKeys": "Teclas: Espacio reproducir/pausar, A/D o flechas anterior/siguiente, R repetir, L bucle, P pausar tras cada línea.",
    "wdLede": "Tus palabras guardadas. Se guardan solo en este navegador.",
    "wdCount": "{n} mostradas, {d} pendientes ahora",
    "wdNoMatch": "Ninguna palabra coincide.",
    "wdEmpty": "Aún no hay palabras guardadas.",
    "wdEmptySub": "Abre Leer o Ver, toca una palabra y guárdala.",
    "wdMore": "{n} más sin mostrar. Usa la búsqueda.",
    "wdNothing": "No hay nada que exportar.",
    "wdImported": "Se importaron {n} palabras nuevas.",
    "wdImportFail": "No se pudo leer ese archivo.",
    "wdPrivacy": "Si borras los datos del navegador, la lista desaparece, así que exporta una copia de vez en cuando.",
    "search": "Buscar",
    "edit": "Editar",
    "dueNow": "Ahora",
    "dueToday": "Hoy",
    "dueIn": "En {n} d",
    "backup": "Copia",
    "importWords": "Importar",
    "rvLede": "Da la vuelta a la tarjeta y di cuánto recordabas.",
    "rvMode": "Tipo de práctica",
    "rvW2M": "Palabra a significado",
    "rvM2W": "Significado a palabra",
    "rvListen": "Escuchar",
    "rvCloze": "Completar",
    "rvStreak": "Días seguidos: {n}",
    "rvDone": "Terminado: {n} tarjetas",
    "rvDoneSub": "Vuelve más tarde. Las que fallaste regresan en minutos y el resto en días.",
    "rvNone": "Nada pendiente",
    "rvNoneSub": "Estás al día. Lee o mira algo más para encontrar palabras nuevas.",
    "rvWhichWord": "¿Qué palabra es?",
    "rvPlay": "Oír la palabra",
    "rvListenQ": "Escucha y recuerda el significado",
    "rvHint": "Significado",
    "rvShow": "Mostrar respuesta",
    "rvProgress": "Progreso de la sesión",
    "again": "Otra vez",
    "hard": "Difícil",
    "good": "Bien",
    "easy": "Fácil",
    "scLede": "Aprende las letras. Toca cualquiera para oírla y practicar el trazo.",
    "scVowels": "Vocales",
    "scCons": "Consonantes",
    "scSigns": "Signos vocálicos",
    "scSignsNote": "Mostrados sobre la letra {b}",
    "scDigits": "Números",
    "scQuiz": "Mini test",
    "scQuizQ": "¿Cómo se lee esta letra?",
    "scTrace": "Traza",
    "scTraceHint": "Toca una letra arriba y trázala aquí.",
    "correct": "¡Correcto!",
    "wrongIs": "No es esa. Es {a}.",
    "next": "Siguiente",
    "phLede": "Frases cotidianas. Toca cualquier palabra para guardarla.",
    "phNote": "Estas frases son una colección inicial. Haz que las revise un hablante nativo antes de fiarte de ellas.",
    "cat_greet": "Saludos",
    "cat_intro": "Presentaciones",
    "cat_daily": "Vida diaria",
    "cat_num": "Números",
    "slow": "Lento",
    "sayLede": "Escribe una frase en inglés. Obtenla en otro idioma con pronunciación y voz.",
    "sayPlaceholder": "Escribe una frase en inglés, por ejemplo: How are you?",
    "sayInput": "Frase en inglés",
    "sayTo": "Decir en",
    "sayGo": "Traducir y decir",
    "sayEnglish": "Decir en inglés",
    "sayResult": "Resultado",
    "sayMatch": "Libro de frases",
    "sayDevice": "Traducido en tu dispositivo",
    "sayClosest": "Frases más cercanas del libro de frases",
    "sayNone": "Traducir frases libres necesita un navegador con traductor en el dispositivo (Chrome reciente). Aquí tienes las frases más cercanas del libro de frases.",
    "sayWorking": "Traduciendo en tu dispositivo…",
    "sayFail": "El traductor del dispositivo no funcionó para este par de idiomas. Aquí tienes las frases más cercanas del libro de frases.",
    "sayNote": "No se envía nada a ningún servidor. La traducción automática puede fallar, así que haz revisar con un hablante nativo las frases importantes.",
    "copy": "Copiar",
    "copied": "Copiado",
    "cat_food": "Comida",
    "cat_travel": "Viajes",
    "cat_shop": "Compras",
    "cat_health": "Salud",
    "cat_people": "Personas",
    "cat_time": "Días y hora",
    "voiceCheck": "Prueba de voz",
    "vcLede": "Qué voces funcionan en este dispositivo. Pulsa Probar para oír cada una. Si un idioma no tiene voz del dispositivo, Bhasha puede usar una pequeña voz sin conexión.",
    "vcDevice": "Voz del dispositivo",
    "vcOffline": "Voz sin conexión lista",
    "vcOfflineAvail": "Sin voz del dispositivo. Voz sin conexión disponible",
    "vcNone": "Sin voz",
    "vcTest": "Probar",
    "ovLabel": "Voz de respaldo sin conexión",
    "ovAsk": "Preguntar",
    "ovNote": "La voz sin conexión (eSpeak NG) pesa unos 18 MB, se descarga una vez y luego funciona sin internet. Suena más robótica que las voces del dispositivo.",
    "ovAskQ": "Este dispositivo no tiene voz para {l}. ¿Descargar una voz sin conexión (unos 18 MB, una vez)?",
    "ovYes": "Descargar",
    "ovNo": "Ahora no",
    "ovLoading": "Cargando la voz sin conexión…",
    "ovFail": "No se pudo reproducir la voz sin conexión.",
    "nav_today": "Hoy",
    "nav_talk": "Conversaciones",
    "cToday": "Una lección corta cada día: cinco frases nuevas, un test de escucha y una ronda de repaso.",
    "cTalk": "Practica conversaciones reales: restaurante, indicaciones, compras, médico, hotel. Escucha una frase y elige tu respuesta.",
    "tdLede": "Cinco frases nuevas al día. Apréndelas, escúchalas y repasa las antiguas justo antes de olvidarlas.",
    "tdStart": "Empezar la lección de hoy",
    "tdDone": "La lección de hoy está hecha. Vuelve mañana.",
    "tdLearn": "Aprender",
    "tdListen": "Escuchar",
    "tdRecall": "Repasar",
    "tdNext": "Siguiente",
    "tdFinish": "Terminar",
    "tdListenQ": "Escucha y elige el significado",
    "tdRecallQ": "Elige la frase que significa:",
    "tdScore": "Puntuación: {n} de {m}",
    "tdBonus": "Hacer una lección extra",
    "tdProgress": "{n} de {m} frases aprendidas",
    "tdRecallN": "{n} frases antiguas para repasar hoy",
    "drLede": "Elige una conversación. Escucha lo que dicen y elige tu respuesta.",
    "drPick": "Conversaciones",
    "drTurns": "{n} turnos",
    "drThem": "Dicen",
    "drYou": "Tu turno. Di:",
    "drHide": "Modo escucha: ocultar lo que dicen",
    "drTry": "No exactamente. Inténtalo de nuevo.",
    "drDone": "Conversación completa",
    "drScore": "{n} de {m} bien al primer intento",
    "drReplay": "Repetir",
    "drTranscript": "Conversación completa",
    "drAnother": "Otra conversación",
    "d_meet": "Conocer a alguien",
    "d_rest": "En un restaurante",
    "d_dir": "Pedir indicaciones",
    "d_shop": "De compras",
    "d_doc": "En el médico",
    "d_hotel": "En un hotel",
    "cat_talk": "Conversación",
    "cat_feel": "Sentimientos",
    "cat_work": "Trabajo y teléfono",
    "cat_home": "Casa y tiempo",
    "pvTitle": "Gratis y privado",
    "pvLede": "Bhasha es gratis para todos. Sin cuenta, sin anuncios, sin seguimiento. Todo lo que haces se queda en este dispositivo.",
    "pvFree": "Gratis, para todos",
    "pvFreeT": "Sin pagos, sin registro, nada bloqueado. EknathaLabs lo crea para que siga siendo gratis.",
    "pvPriv": "Se queda en tu dispositivo",
    "pvPrivT": "Tus archivos, palabras y progreso se guardan solo en este navegador. No hay ningún servidor al que enviarlos.",
    "pvNet": "Sin seguimiento",
    "pvNetT": "Sin analíticas, sin cookies, sin scripts de terceros. Las fuentes y la voz sin conexión se sirven desde este sitio. Los enlaces a diccionarios externos solo se abren si los tocas.",
    "pvMic": "Tu voz",
    "pvMicT": "Una grabación de pronunciación se queda en la memoria mientras la página está abierta. Nunca se guarda ni se sube.",
    "pvStored": "Guardado en este navegador",
    "pvWords": "Palabras guardadas",
    "pvLesson": "Frases de lecciones",
    "pvStats": "Días de estudio",
    "pvSet": "Ajustes",
    "pvItems": "{n} elementos",
    "pvTotal": "Total: {n}",
    "pvExport": "Descargar mis datos",
    "pvImport": "Restaurar desde archivo",
    "pvClear": "Borrar todos mis datos",
    "pvClearAsk": "¿Borrar de este navegador las palabras guardadas, el progreso de las lecciones, el historial de estudio y los ajustes? No se puede deshacer. Descarga una copia antes si quieres conservarla.",
    "pvClearYes": "Sí, borrar todo",
    "pvCleared": "Todos los datos borrados",
    "pvImported": "Datos restaurados",
    "pvBadFile": "Este no es un archivo de copia de Bhasha",
    "pvLicence": "Bhasha forma parte de EknathaLabs. La voz opcional sin conexión (eSpeak NG) es de código abierto bajo GPL-3.0 y solo se descarga de este sitio si lo permites.",
    "pvBadge": "Gratis · Privado · Sin conexión",
    "cPrivacy": "Mira qué se queda en tu dispositivo y descárgalo o bórralo. Gratis, sin seguimiento.",
    "cancel": "Cancelar",
    "setSound": "Efectos de sonido",
    "setHaptic": "Vibración",
    "pronBtn": "Practicar la pronunciación",
    "pronRec": "Grabar",
    "pronStop": "Detener",
    "pronAgain": "Grabar de nuevo",
    "pronModel": "Modelo",
    "pronYou": "Tu voz",
    "pronCompare": "Comparar",
    "pronHelp": "Escucha el modelo, grábate y compara de oído. Tu grabación no se guarda.",
    "pronListening": "Grabando… habla ahora",
    "pronDone": "Escucha la tuya o compárala con el modelo.",
    "pronDenied": "El micrófono está bloqueado. Permítelo en los ajustes del navegador para practicar.",
    "pronNoMic": "Este navegador no puede grabar audio.",
    "pronEmpty": "No se grabó nada. Inténtalo de nuevo."
  };
  I.de = {
    "skip": "Zum Inhalt springen",
    "settings": "Einstellungen",
    "part": "Teil von EknathaLabs",
    "privacyNote": "Läuft in deinem Browser. Deine Dateien und Wörter bleiben auf deinem Gerät.",
    "mainNav": "Hauptmenü",
    "uiLang": "Sprache der Oberfläche",
    "focusLang": "Sprache, die ich lerne",
    "scheme": "Umschrift-Stil",
    "schSimple": "Einfach",
    "schIast": "Wissenschaftlich",
    "showRoman": "Umschrift anzeigen",
    "on": "An",
    "off": "Aus",
    "voiceSpeed": "Sprechtempo",
    "perDay": "Wiederholungen pro Sitzung",
    "unlimited": "Unbegrenzt",
    "theme": "Design",
    "light": "Hell",
    "dark": "Dunkel",
    "new": "Neu",
    "language": "Sprache",
    "allLangs": "Alle Sprachen",
    "allStatus": "Alle",
    "auto": "Automatisch erkennen",
    "indianLangs": "Indische Sprachen",
    "otherLangs": "Weitere Sprachen",
    "nav_watch": "Ansehen",
    "nav_read": "Lesen",
    "nav_words": "Meine Wörter",
    "nav_review": "Wiederholen",
    "nav_scripts": "Schriften",
    "nav_phrases": "Redewendungen",
    "nav_say": "Sagen",
    "homeH": "Lerne die gesprochene Sprache aus dem, was du ohnehin siehst und liest",
    "homeSub": "Bring dein eigenes Video, Audio oder deinen Text mit. Tippe auf ein Wort, um es zu hören, die Aussprache in lateinischen Buchstaben zu sehen und es zu speichern. Wiederhole in Abständen, um es zu behalten. Kostenlos, privat und offline.",
    "statWords": "Gespeicherte Wörter",
    "statDue": "Für heute",
    "statStreak": "Tage in Folge",
    "cWatch": "Spiele dein Video oder Audio mit zweizeiligen Untertiteln ab. Tippe auf Wörter, wiederhole Zeilen, verlangsame und ahme die Sprecher nach.",
    "cRead": "Füge einen Text ein oder öffne ihn. Jedes Wort ist antippbar, mit Umschrift und Vorlesen.",
    "cWords": "Alles, was du gespeichert hast, mit Export als CSV, Anki und Sicherungsdatei.",
    "cReview": "Karteikarten, die kurz vor dem Vergessen wiederkommen.",
    "cScripts": "Buchstaben, Vokalzeichen und Ziffern. Anhören, Quiz machen, Schreiben üben.",
    "cPhrases": "250 Alltagssätze in dreizehn Sprachen, mit Umschrift und Sprachausgabe.",
    "cSay": "Schreibe einen Satz auf Englisch und höre ihn auf Telugu, Hindi, Kannada, Tamil, Malayalam, Bengalisch, Marathi, Gujarati, Assamesisch, Koreanisch, Spanisch, Deutsch oder Französisch.",
    "dueCount": "{n} fällig",
    "howH": "So funktioniert es",
    "how1": "Öffne eine Untertiteldatei zu deinem Video oder füge einen Text ein.",
    "how2": "Tippe auf ein unbekanntes Wort. Hör es dir an und speichere es mit Bedeutung.",
    "how3": "Komm zur Wiederholung zurück. Die Karten kehren zum richtigen Zeitpunkt wieder.",
    "how4": "Alles bleibt auf diesem Gerät. Exportiere, wann du willst.",
    "homeNote": "Die Stimmen kommen von deinem Gerät. Stimmen für indische Sprachen unterscheiden sich je nach Telefon und Browser. Hörst du nichts, öffne den Stimmtest in den Einstellungen.",
    "noTts": "Dieser Browser kann keinen Text vorlesen.",
    "noVoice": "Auf diesem Gerät gibt es keine Stimme für {l}. Installiere eine in den Systemeinstellungen.",
    "storageFull": "Speichern nicht möglich. Der Browserspeicher ist voll oder deaktiviert.",
    "meaning": "Bedeutung",
    "status": "Status",
    "st0": "Neu",
    "st1": "Lerne ich",
    "st2": "Bekannt",
    "seenIn": "Auch in den Redewendungen",
    "speak": "Sagen",
    "close": "Schließen",
    "update": "Aktualisieren",
    "save": "Wort speichern",
    "saved": "Gespeichert",
    "remove": "Entfernen",
    "speakSentence": "Satz vorlesen",
    "translateDevice": "Auf dem Gerät übersetzen",
    "trFail": "Übersetzung nicht verfügbar.",
    "lookup": "Nachschlagen",
    "opensTab": "Öffnet einen neuen Tab",
    "wordDetails": "Worteinzelheiten",
    "rdLede": "Füge einen Text ein oder öffne ihn. Tippe auf ein beliebiges Wort.",
    "rdPlaceholder": "Text in einer beliebigen Sprache hier einfügen",
    "rdText": "Text zum Lesen",
    "rdEmpty": "Noch nichts anzuzeigen. Füge einen Text ein oder lade das Beispiel.",
    "rdStats": "{n} Wörter, {u} verschiedene. {k} bekannt, {l} in Arbeit. Sprache: {lang}",
    "textLang": "Sprache des Textes",
    "colorWords": "Wörter nach Status einfärben",
    "fontSize": "Schriftgröße",
    "readAloud": "Vorlesen",
    "stop": "Stopp",
    "sample": "Beispiel laden",
    "importTxt": "Textdatei öffnen",
    "clear": "Leeren",
    "clickWord": "Tippe auf ein Wort für Details",
    "wtLede": "Nutze dein eigenes Video oder Audio mit einer Untertiteldatei. Es wird nichts hochgeladen.",
    "wtSetup": "Wähle deine Dateien",
    "wtDrop": "Video oder Audio und Untertitel hier ablegen oder die Schaltflächen nutzen.",
    "wtMedia": "Video oder Audio",
    "wtSub1": "Untertitel (Lernsprache)",
    "wtSub2": "Untertitel (deine Sprache)",
    "subLang": "Sprache der Untertitel",
    "wtStart": "Starten",
    "wtSample": "Beispiel ausprobieren (liest vor)",
    "noSubs": "In {f} wurden keine Untertitel gefunden. Nutze .srt oder .vtt.",
    "wtPrivacy": "Dateien werden im Browser geöffnet und verlassen dein Gerät nicht. Ohne Video oder Audio werden die Zeilen mit der Stimme deines Geräts vorgelesen.",
    "wtListenMode": "Hörmodus: Die Zeilen werden vorgelesen",
    "wtTranscript": "Transkript",
    "playPause": "Abspielen oder pausieren",
    "prevLine": "Vorherige Zeile",
    "nextLine": "Nächste Zeile",
    "replay": "Zeile wiederholen",
    "loopLine": "Zeile in Schleife",
    "autoPause": "Nach jeder Zeile pausieren",
    "hideTarget": "Untertitel der Lernsprache ausblenden",
    "hideNative": "Untertitel meiner Sprache ausblenden",
    "blurNative": "Meine Sprache verwischen",
    "speed": "Tempo",
    "subEarlier": "Untertitel früher",
    "subLater": "Untertitel später",
    "shadow": "Nachsprechen",
    "stopRec": "Stopp",
    "yourVoice": "Deine Stimme",
    "orig": "Original",
    "noMic": "Aufnahme wird hier nicht unterstützt.",
    "micDenied": "Mikrofonzugriff verweigert.",
    "wtChange": "Dateien ändern",
    "wtKeys": "Tasten: Leertaste abspielen/pausieren, A/D oder Pfeile zurück/vor, R wiederholen, L Schleife, P nach jeder Zeile pausieren.",
    "wdLede": "Deine gespeicherten Wörter. Sie werden nur in diesem Browser aufbewahrt.",
    "wdCount": "{n} angezeigt, {d} jetzt fällig",
    "wdNoMatch": "Kein Wort passt.",
    "wdEmpty": "Noch keine Wörter gespeichert.",
    "wdEmptySub": "Öffne Lesen oder Ansehen, tippe auf ein Wort und speichere es.",
    "wdMore": "{n} weitere nicht angezeigt. Nutze die Suche.",
    "wdNothing": "Nichts zu exportieren.",
    "wdImported": "{n} neue Wörter importiert.",
    "wdImportFail": "Diese Datei konnte nicht gelesen werden.",
    "wdPrivacy": "Wenn du die Browserdaten löschst, ist die Liste weg. Exportiere deshalb gelegentlich eine Sicherung.",
    "search": "Suchen",
    "edit": "Bearbeiten",
    "dueNow": "Jetzt",
    "dueToday": "Heute",
    "dueIn": "In {n} T",
    "backup": "Sicherung",
    "importWords": "Importieren",
    "rvLede": "Drehe die Karte um und sag, wie gut du dich erinnert hast.",
    "rvMode": "Übungsart",
    "rvW2M": "Wort zu Bedeutung",
    "rvM2W": "Bedeutung zu Wort",
    "rvListen": "Hören",
    "rvCloze": "Lückentext",
    "rvStreak": "Tage in Folge: {n}",
    "rvDone": "Fertig: {n} Karten",
    "rvDoneSub": "Komm später wieder. Verpasste Karten kommen in Minuten zurück, die übrigen in Tagen.",
    "rvNone": "Nichts fällig",
    "rvNoneSub": "Du bist auf dem neuesten Stand. Lies oder sieh mehr, um neue Wörter zu finden.",
    "rvWhichWord": "Welches Wort ist das?",
    "rvPlay": "Wort anhören",
    "rvListenQ": "Hör zu und erinnere dich an die Bedeutung",
    "rvHint": "Bedeutung",
    "rvShow": "Antwort zeigen",
    "rvProgress": "Fortschritt der Sitzung",
    "again": "Nochmal",
    "hard": "Schwer",
    "good": "Gut",
    "easy": "Leicht",
    "scLede": "Lerne die Buchstaben. Tippe auf einen, um ihn zu hören und das Schreiben zu üben.",
    "scVowels": "Vokale",
    "scCons": "Konsonanten",
    "scSigns": "Vokalzeichen",
    "scSignsNote": "Dargestellt auf dem Buchstaben {b}",
    "scDigits": "Ziffern",
    "scQuiz": "Kurzes Quiz",
    "scQuizQ": "Wie liest man diesen Buchstaben?",
    "scTrace": "Nachzeichnen",
    "scTraceHint": "Tippe oben auf einen Buchstaben und zeichne ihn hier nach.",
    "correct": "Richtig!",
    "wrongIs": "Leider nicht. Es ist {a}.",
    "next": "Weiter",
    "phLede": "Alltägliche Redewendungen. Tippe auf ein Wort, um es zu speichern.",
    "phNote": "Diese Redewendungen sind eine Startsammlung. Lass sie von Muttersprachlern prüfen, bevor du dich darauf verlässt.",
    "cat_greet": "Begrüßungen",
    "cat_intro": "Vorstellen",
    "cat_daily": "Alltag",
    "cat_num": "Zahlen",
    "slow": "Langsam",
    "sayLede": "Schreibe einen englischen Satz. Erhalte ihn in einer anderen Sprache mit Umschrift und Sprachausgabe.",
    "sayPlaceholder": "Englischen Satz eingeben, zum Beispiel: How are you?",
    "sayInput": "Englischer Satz",
    "sayTo": "Sagen auf",
    "sayGo": "Übersetzen und sagen",
    "sayEnglish": "Englisch sagen",
    "sayResult": "Ergebnis",
    "sayMatch": "Phrasenbuch",
    "sayDevice": "Auf deinem Gerät übersetzt",
    "sayClosest": "Ähnlichste Sätze aus dem Phrasenbuch",
    "sayNone": "Freie Sätze zu übersetzen erfordert einen Browser mit Übersetzer auf dem Gerät (aktuelles Chrome). Hier sind die ähnlichsten Sätze aus dem Phrasenbuch.",
    "sayWorking": "Übersetze auf deinem Gerät…",
    "sayFail": "Der Übersetzer des Geräts hat für dieses Sprachpaar nicht funktioniert. Hier sind die ähnlichsten Sätze aus dem Phrasenbuch.",
    "sayNote": "Nichts wird an einen Server gesendet. Maschinelle Übersetzung kann falsch sein, lass wichtige Sätze daher von Muttersprachlern prüfen.",
    "copy": "Kopieren",
    "copied": "Kopiert",
    "cat_food": "Essen",
    "cat_travel": "Reisen",
    "cat_shop": "Einkaufen",
    "cat_health": "Gesundheit",
    "cat_people": "Menschen",
    "cat_time": "Tage und Zeit",
    "voiceCheck": "Stimmtest",
    "vcLede": "Welche Stimmen auf diesem Gerät funktionieren. Tippe auf Testen, um jede zu hören. Hat eine Sprache keine Gerätestimme, kann Bhasha eine kleine Offline-Stimme nutzen.",
    "vcDevice": "Gerätestimme",
    "vcOffline": "Offline-Stimme bereit",
    "vcOfflineAvail": "Keine Gerätestimme. Offline-Stimme verfügbar",
    "vcNone": "Keine Stimme",
    "vcTest": "Testen",
    "ovLabel": "Offline-Stimme als Reserve",
    "ovAsk": "Fragen",
    "ovNote": "Die Offline-Stimme (eSpeak NG) ist etwa 18 MB groß, wird einmal geladen und funktioniert dann ohne Internet. Sie klingt roboterhafter als Gerätestimmen.",
    "ovAskQ": "Dieses Gerät hat keine Stimme für {l}. Eine Offline-Stimme laden (etwa 18 MB, einmalig)?",
    "ovYes": "Laden",
    "ovNo": "Jetzt nicht",
    "ovLoading": "Offline-Stimme wird geladen…",
    "ovFail": "Die Offline-Stimme konnte nicht abgespielt werden.",
    "nav_today": "Heute",
    "nav_talk": "Gespräche",
    "cToday": "Jeden Tag eine kurze Lektion: fünf neue Sätze, ein Hörquiz und eine Wiederholungsrunde.",
    "cTalk": "Übe echte Gespräche: Restaurant, Wegbeschreibung, Einkaufen, Arzt, Hotel. Höre eine Zeile und wähle deine Antwort.",
    "tdLede": "Fünf neue Sätze pro Tag. Lerne sie, höre sie und wiederhole ältere, kurz bevor du sie vergisst.",
    "tdStart": "Heutige Lektion starten",
    "tdDone": "Die heutige Lektion ist geschafft. Komm morgen wieder.",
    "tdLearn": "Lernen",
    "tdListen": "Hören",
    "tdRecall": "Wiederholen",
    "tdNext": "Weiter",
    "tdFinish": "Fertig",
    "tdListenQ": "Hören und die Bedeutung wählen",
    "tdRecallQ": "Wähle den Satz mit dieser Bedeutung:",
    "tdScore": "Ergebnis: {n} von {m}",
    "tdBonus": "Bonuslektion machen",
    "tdProgress": "{n} von {m} Sätzen gelernt",
    "tdRecallN": "{n} ältere Sätze zum Wiederholen heute",
    "drLede": "Wähle ein Gespräch. Höre, was gesagt wird, und wähle deine Antwort.",
    "drPick": "Gespräche",
    "drTurns": "{n} Runden",
    "drThem": "Die andere Person sagt",
    "drYou": "Du bist dran. Sage:",
    "drHide": "Hörmodus: Gesagtes verbergen",
    "drTry": "Nicht ganz. Versuche es nochmal.",
    "drDone": "Gespräch abgeschlossen",
    "drScore": "{n} von {m} beim ersten Versuch richtig",
    "drReplay": "Nochmal spielen",
    "drTranscript": "Ganzes Gespräch",
    "drAnother": "Anderes Gespräch",
    "d_meet": "Jemanden kennenlernen",
    "d_rest": "Im Restaurant",
    "d_dir": "Nach dem Weg fragen",
    "d_shop": "Einkaufen",
    "d_doc": "Beim Arzt",
    "d_hotel": "Im Hotel",
    "cat_talk": "Gespräch",
    "cat_feel": "Gefühle",
    "cat_work": "Arbeit und Telefon",
    "cat_home": "Zuhause und Wetter",
    "pvTitle": "Kostenlos und privat",
    "pvLede": "Bhasha ist für alle kostenlos. Kein Konto, keine Werbung, kein Tracking. Alles, was du tust, bleibt auf diesem Gerät.",
    "pvFree": "Kostenlos für alle",
    "pvFreeT": "Keine Zahlung, keine Anmeldung, nichts gesperrt. EknathaLabs baut es, damit es kostenlos bleibt.",
    "pvPriv": "Bleibt auf deinem Gerät",
    "pvPrivT": "Deine Dateien, Wörter und dein Fortschritt werden nur in diesem Browser gespeichert. Es gibt keinen Server, an den sie gesendet werden könnten.",
    "pvNet": "Kein Tracking",
    "pvNetT": "Keine Analyse, keine Cookies, keine Skripte von Dritten. Schriften und die Offline-Stimme kommen von dieser Seite. Externe Wörterbuch-Links öffnen sich nur, wenn du sie antippst.",
    "pvMic": "Deine Stimme",
    "pvMicT": "Eine Aussprache-Aufnahme bleibt im Speicher, solange die Seite offen ist. Sie wird nie gespeichert oder hochgeladen.",
    "pvStored": "In diesem Browser gespeichert",
    "pvWords": "Gespeicherte Wörter",
    "pvLesson": "Lektionssätze",
    "pvStats": "Lerntage",
    "pvSet": "Einstellungen",
    "pvItems": "{n} Einträge",
    "pvTotal": "Gesamt: {n}",
    "pvExport": "Meine Daten herunterladen",
    "pvImport": "Aus Datei wiederherstellen",
    "pvClear": "Alle meine Daten löschen",
    "pvClearAsk": "Gespeicherte Wörter, Lektionsfortschritt, Lernverlauf und Einstellungen aus diesem Browser löschen? Das kann nicht rückgängig gemacht werden. Lade vorher eine Kopie herunter, wenn du sie behalten willst.",
    "pvClearYes": "Ja, alles löschen",
    "pvCleared": "Alle Daten gelöscht",
    "pvImported": "Daten wiederhergestellt",
    "pvBadFile": "Das ist keine Bhasha-Sicherungsdatei",
    "pvLicence": "Bhasha gehört zu EknathaLabs. Die optionale Offline-Stimme (eSpeak NG) ist Open Source unter GPL-3.0 und wird nur von dieser Seite geladen, wenn du es erlaubst.",
    "pvBadge": "Kostenlos · Privat · Offline",
    "cPrivacy": "Sieh, was auf deinem Gerät bleibt, und lade es herunter oder lösche es. Kostenlos, ohne Tracking.",
    "cancel": "Abbrechen",
    "setSound": "Soundeffekte",
    "setHaptic": "Vibration",
    "pronBtn": "Aussprache üben",
    "pronRec": "Aufnehmen",
    "pronStop": "Stopp",
    "pronAgain": "Erneut aufnehmen",
    "pronModel": "Vorbild",
    "pronYou": "Deine Stimme",
    "pronCompare": "Vergleichen",
    "pronHelp": "Höre das Vorbild, nimm dich auf und vergleiche nach Gehör. Deine Aufnahme wird nicht gespeichert.",
    "pronListening": "Aufnahme läuft… sprich jetzt",
    "pronDone": "Spiel deine Aufnahme ab oder vergleiche sie mit dem Vorbild.",
    "pronDenied": "Das Mikrofon ist gesperrt. Erlaube es in den Browsereinstellungen, um zu üben.",
    "pronNoMic": "Dieser Browser kann kein Audio aufnehmen.",
    "pronEmpty": "Es wurde nichts aufgenommen. Versuche es erneut."
  };
  I.fr = {
    "skip": "Aller au contenu",
    "settings": "Réglages",
    "part": "Fait partie d’EknathaLabs",
    "privacyNote": "Fonctionne dans votre navigateur. Vos fichiers et vos mots restent sur votre appareil.",
    "mainNav": "Principal",
    "uiLang": "Langue de l’interface",
    "focusLang": "Langue que j’apprends",
    "scheme": "Style de romanisation",
    "schSimple": "Simple",
    "schIast": "Savant",
    "showRoman": "Afficher la romanisation",
    "on": "Oui",
    "off": "Non",
    "voiceSpeed": "Vitesse de la voix",
    "perDay": "Révisions par séance",
    "unlimited": "Illimité",
    "theme": "Thème",
    "light": "Clair",
    "dark": "Sombre",
    "new": "Nouveau",
    "language": "Langue",
    "allLangs": "Toutes les langues",
    "allStatus": "Tous",
    "auto": "Détecter automatiquement",
    "indianLangs": "Langues de l’Inde",
    "otherLangs": "Autres langues",
    "nav_watch": "Regarder",
    "nav_read": "Lire",
    "nav_words": "Mes mots",
    "nav_review": "Réviser",
    "nav_scripts": "Écritures",
    "nav_phrases": "Phrases",
    "nav_say": "Dire",
    "homeH": "Apprenez la langue parlée avec ce que vous regardez et lisez déjà",
    "homeSub": "Apportez votre propre vidéo, audio ou texte. Touchez un mot pour l’entendre, voir sa prononciation en lettres latines et l’enregistrer. Révisez à intervalles pour le retenir. Gratuit, privé et hors ligne.",
    "statWords": "Mots enregistrés",
    "statDue": "Pour aujourd’hui",
    "statStreak": "Jours de suite",
    "cWatch": "Lisez votre vidéo ou audio avec des sous-titres sur deux lignes. Touchez les mots, répétez les lignes, ralentissez et imitez le locuteur.",
    "cRead": "Collez ou ouvrez n’importe quel texte. Chaque mot est cliquable, avec romanisation et lecture à voix haute.",
    "cWords": "Tout ce que vous avez enregistré, avec export en CSV, Anki et fichier de sauvegarde.",
    "cReview": "Des fiches qui reviennent juste avant que vous les oubliiez.",
    "cScripts": "Lettres, signes vocaliques et chiffres. Écoutez, faites un quiz et entraînez-vous à tracer.",
    "cPhrases": "250 phrases du quotidien en treize langues, avec romanisation et voix.",
    "cSay": "Écrivez une phrase en anglais et écoutez-la en télougou, hindi, kannada, tamoul, malayalam, bengali, marathi, gujarati, assamais, coréen, espagnol, allemand ou français.",
    "dueCount": "{n} à réviser",
    "howH": "Comment ça marche",
    "how1": "Ouvrez un fichier de sous-titres avec votre vidéo, ou collez un texte.",
    "how2": "Touchez un mot que vous ne connaissez pas. Écoutez-le et enregistrez-le avec son sens.",
    "how3": "Revenez réviser. Les fiches reviennent au bon moment.",
    "how4": "Tout reste sur cet appareil. Exportez quand vous voulez.",
    "homeNote": "Les voix viennent de votre appareil. Les voix des langues indiennes varient selon le téléphone et le navigateur. Si vous n’entendez rien, ouvrez le test de voix dans les Réglages.",
    "noTts": "Ce navigateur ne peut pas lire le texte à voix haute.",
    "noVoice": "Cet appareil n’a pas de voix pour {l}. Installez-en une dans les réglages du système.",
    "storageFull": "Enregistrement impossible. Le stockage du navigateur est plein ou désactivé.",
    "meaning": "Sens",
    "status": "Statut",
    "st0": "Nouveau",
    "st1": "En cours",
    "st2": "Connu",
    "seenIn": "Aussi dans les phrases",
    "speak": "Dire",
    "close": "Fermer",
    "update": "Mettre à jour",
    "save": "Enregistrer le mot",
    "saved": "Enregistré",
    "remove": "Retirer",
    "speakSentence": "Lire la phrase",
    "translateDevice": "Traduire sur l’appareil",
    "trFail": "Traduction indisponible.",
    "lookup": "Rechercher",
    "opensTab": "Ouvre un nouvel onglet",
    "wordDetails": "Détails du mot",
    "rdLede": "Collez ou ouvrez un texte. Touchez n’importe quel mot.",
    "rdPlaceholder": "Collez ici un texte dans n’importe quelle langue",
    "rdText": "Texte à lire",
    "rdEmpty": "Rien à afficher pour l’instant. Collez un texte ou chargez l’exemple.",
    "rdStats": "{n} mots, {u} distincts. {k} connus, {l} en cours. Langue : {lang}",
    "textLang": "Langue du texte",
    "colorWords": "Colorer les mots selon le statut",
    "fontSize": "Taille du texte",
    "readAloud": "Lire à voix haute",
    "stop": "Arrêter",
    "sample": "Charger l’exemple",
    "importTxt": "Ouvrir un fichier texte",
    "clear": "Effacer",
    "clickWord": "Touchez un mot pour voir les détails",
    "wtLede": "Utilisez votre propre vidéo ou audio avec un fichier de sous-titres. Rien n’est envoyé.",
    "wtSetup": "Choisissez vos fichiers",
    "wtDrop": "Déposez ici la vidéo ou l’audio et les sous-titres, ou utilisez les boutons.",
    "wtMedia": "Vidéo ou audio",
    "wtSub1": "Sous-titres (langue apprise)",
    "wtSub2": "Sous-titres (votre langue)",
    "subLang": "Langue des sous-titres",
    "wtStart": "Commencer",
    "wtSample": "Essayer un exemple (lecture à voix haute)",
    "noSubs": "Aucun sous-titre trouvé dans {f}. Utilisez .srt ou .vtt.",
    "wtPrivacy": "Les fichiers s’ouvrent dans le navigateur et ne quittent pas votre appareil. Sans vidéo ni audio, les lignes sont lues avec la voix de votre appareil.",
    "wtListenMode": "Mode écoute : les lignes sont lues à voix haute",
    "wtTranscript": "Transcription",
    "playPause": "Lecture ou pause",
    "prevLine": "Ligne précédente",
    "nextLine": "Ligne suivante",
    "replay": "Répéter la ligne",
    "loopLine": "Ligne en boucle",
    "autoPause": "Pause après chaque ligne",
    "hideTarget": "Masquer les sous-titres de la langue apprise",
    "hideNative": "Masquer les sous-titres de ma langue",
    "blurNative": "Flouter ma langue",
    "speed": "Vitesse",
    "subEarlier": "Sous-titres plus tôt",
    "subLater": "Sous-titres plus tard",
    "shadow": "Imiter",
    "stopRec": "Arrêter",
    "yourVoice": "Votre voix",
    "orig": "Original",
    "noMic": "L’enregistrement n’est pas pris en charge ici.",
    "micDenied": "L’accès au micro a été refusé.",
    "wtChange": "Changer de fichiers",
    "wtKeys": "Touches : Espace lecture/pause, A/D ou flèches précédent/suivant, R répéter, L boucle, P pause après chaque ligne.",
    "wdLede": "Vos mots enregistrés. Conservés uniquement dans ce navigateur.",
    "wdCount": "{n} affichés, {d} à réviser maintenant",
    "wdNoMatch": "Aucun mot ne correspond.",
    "wdEmpty": "Aucun mot enregistré pour l’instant.",
    "wdEmptySub": "Ouvrez Lire ou Regarder, touchez un mot et enregistrez-le.",
    "wdMore": "{n} de plus non affichés. Utilisez la recherche.",
    "wdNothing": "Rien à exporter.",
    "wdImported": "{n} nouveaux mots importés.",
    "wdImportFail": "Ce fichier n’a pas pu être lu.",
    "wdPrivacy": "Si vous effacez les données du navigateur, la liste disparaît : exportez une sauvegarde de temps en temps.",
    "search": "Rechercher",
    "edit": "Modifier",
    "dueNow": "Maintenant",
    "dueToday": "Aujourd’hui",
    "dueIn": "Dans {n} j",
    "backup": "Sauvegarde",
    "importWords": "Importer",
    "rvLede": "Retournez la fiche, puis dites ce dont vous vous souveniez.",
    "rvMode": "Type d’exercice",
    "rvW2M": "Mot vers sens",
    "rvM2W": "Sens vers mot",
    "rvListen": "Écoute",
    "rvCloze": "Texte à trous",
    "rvStreak": "Jours de suite : {n}",
    "rvDone": "Terminé : {n} fiches",
    "rvDoneSub": "Revenez plus tard. Les fiches ratées reviennent en quelques minutes, les autres en quelques jours.",
    "rvNone": "Rien à réviser",
    "rvNoneSub": "Vous êtes à jour. Lisez ou regardez davantage pour trouver de nouveaux mots.",
    "rvWhichWord": "Quel est ce mot ?",
    "rvPlay": "Écouter le mot",
    "rvListenQ": "Écoutez, puis rappelez-vous le sens",
    "rvHint": "Sens",
    "rvShow": "Voir la réponse",
    "rvProgress": "Progression de la séance",
    "again": "Encore",
    "hard": "Difficile",
    "good": "Bien",
    "easy": "Facile",
    "scLede": "Apprenez les lettres. Touchez-en une pour l’entendre et vous entraîner à la tracer.",
    "scVowels": "Voyelles",
    "scCons": "Consonnes",
    "scSigns": "Signes vocaliques",
    "scSignsNote": "Affichés sur la lettre {b}",
    "scDigits": "Chiffres",
    "scQuiz": "Mini-quiz",
    "scQuizQ": "Comment lit-on cette lettre ?",
    "scTrace": "Tracer",
    "scTraceHint": "Touchez une lettre ci-dessus, puis tracez-la ici.",
    "correct": "Correct !",
    "wrongIs": "Raté. C’est {a}.",
    "next": "Suivant",
    "phLede": "Phrases du quotidien. Touchez un mot pour l’enregistrer.",
    "phNote": "Ces phrases sont une base de départ. Faites-les relire par un locuteur natif avant de vous y fier.",
    "cat_greet": "Salutations",
    "cat_intro": "Présentations",
    "cat_daily": "Vie quotidienne",
    "cat_num": "Nombres",
    "slow": "Lent",
    "sayLede": "Écrivez une phrase en anglais. Obtenez-la dans une autre langue avec romanisation et voix.",
    "sayPlaceholder": "Écrivez une phrase en anglais, par exemple : How are you?",
    "sayInput": "Phrase en anglais",
    "sayTo": "Dire en",
    "sayGo": "Traduire et dire",
    "sayEnglish": "Dire en anglais",
    "sayResult": "Résultat",
    "sayMatch": "Recueil de phrases",
    "sayDevice": "Traduit sur votre appareil",
    "sayClosest": "Phrases les plus proches du recueil",
    "sayNone": "Traduire des phrases libres demande un navigateur avec traducteur intégré (Chrome récent). Voici les phrases les plus proches du recueil.",
    "sayWorking": "Traduction sur votre appareil…",
    "sayFail": "Le traducteur de l’appareil n’a pas fonctionné pour cette paire de langues. Voici les phrases les plus proches du recueil.",
    "sayNote": "Rien n’est envoyé à un serveur. La traduction automatique peut se tromper : faites vérifier les phrases importantes par un locuteur natif.",
    "copy": "Copier",
    "copied": "Copié",
    "cat_food": "Nourriture",
    "cat_travel": "Voyage",
    "cat_shop": "Achats",
    "cat_health": "Santé",
    "cat_people": "Personnes",
    "cat_time": "Jours et heure",
    "voiceCheck": "Test de voix",
    "vcLede": "Quelles voix fonctionnent sur cet appareil. Appuyez sur Tester pour entendre chacune. Si une langue n’a pas de voix d’appareil, Bhasha peut utiliser une petite voix hors ligne.",
    "vcDevice": "Voix de l’appareil",
    "vcOffline": "Voix hors ligne prête",
    "vcOfflineAvail": "Pas de voix d’appareil. Voix hors ligne disponible",
    "vcNone": "Pas de voix",
    "vcTest": "Tester",
    "ovLabel": "Voix hors ligne de secours",
    "ovAsk": "Demander",
    "ovNote": "La voix hors ligne (eSpeak NG) pèse environ 18 Mo, se télécharge une fois, puis fonctionne sans internet. Elle sonne plus robotique que les voix d’appareil.",
    "ovAskQ": "Cet appareil n’a pas de voix pour {l}. Télécharger une voix hors ligne (environ 18 Mo, une seule fois) ?",
    "ovYes": "Télécharger",
    "ovNo": "Pas maintenant",
    "ovLoading": "Chargement de la voix hors ligne…",
    "ovFail": "La voix hors ligne n’a pas pu être lue.",
    "nav_today": "Aujourd’hui",
    "nav_talk": "Conversations",
    "cToday": "Une courte leçon chaque jour : cinq nouvelles phrases, un quiz d’écoute et un tour de rappel.",
    "cTalk": "Entraînez-vous à de vraies conversations : restaurant, itinéraire, achats, médecin, hôtel. Écoutez une réplique, puis choisissez votre réponse.",
    "tdLede": "Cinq nouvelles phrases par jour. Apprenez-les, écoutez-les, puis rappelez-vous les anciennes juste avant de les oublier.",
    "tdStart": "Commencer la leçon du jour",
    "tdDone": "La leçon du jour est terminée. Revenez demain.",
    "tdLearn": "Apprendre",
    "tdListen": "Écouter",
    "tdRecall": "Rappel",
    "tdNext": "Suivant",
    "tdFinish": "Terminer",
    "tdListenQ": "Écoutez, puis choisissez le sens",
    "tdRecallQ": "Choisissez la phrase qui signifie :",
    "tdScore": "Score : {n} sur {m}",
    "tdBonus": "Faire une leçon bonus",
    "tdProgress": "{n} phrases apprises sur {m}",
    "tdRecallN": "{n} anciennes phrases à revoir aujourd’hui",
    "drLede": "Choisissez une conversation. Écoutez ce qu’on vous dit, puis choisissez votre réponse.",
    "drPick": "Conversations",
    "drTurns": "{n} répliques",
    "drThem": "Ils disent",
    "drYou": "À vous. Dites :",
    "drHide": "Mode écoute : masquer ce qu’ils disent",
    "drTry": "Pas tout à fait. Réessayez.",
    "drDone": "Conversation terminée",
    "drScore": "{n} sur {m} justes du premier coup",
    "drReplay": "Rejouer",
    "drTranscript": "Conversation complète",
    "drAnother": "Une autre conversation",
    "d_meet": "Faire connaissance",
    "d_rest": "Au restaurant",
    "d_dir": "Demander son chemin",
    "d_shop": "Faire des achats",
    "d_doc": "Chez le médecin",
    "d_hotel": "À l’hôtel",
    "cat_talk": "Conversation",
    "cat_feel": "Sentiments",
    "cat_work": "Travail et téléphone",
    "cat_home": "Maison et météo",
    "pvTitle": "Gratuit et privé",
    "pvLede": "Bhasha est gratuit pour tous. Pas de compte, pas de publicité, pas de suivi. Tout ce que vous faites reste sur cet appareil.",
    "pvFree": "Gratuit, pour tous",
    "pvFreeT": "Pas de paiement, pas d’inscription, rien de verrouillé. EknathaLabs le conçoit pour qu’il reste gratuit.",
    "pvPriv": "Reste sur votre appareil",
    "pvPrivT": "Vos fichiers, mots et progrès sont conservés uniquement dans ce navigateur. Il n’y a aucun serveur où les envoyer.",
    "pvNet": "Aucun suivi",
    "pvNetT": "Pas d’analyse, pas de cookies, pas de scripts tiers. Les polices et la voix hors ligne sont servies depuis ce site. Les liens vers des dictionnaires externes ne s’ouvrent que si vous les touchez.",
    "pvMic": "Votre voix",
    "pvMicT": "Un enregistrement de prononciation reste en mémoire tant que la page est ouverte. Il n’est jamais enregistré ni envoyé.",
    "pvStored": "Enregistré dans ce navigateur",
    "pvWords": "Mots enregistrés",
    "pvLesson": "Phrases des leçons",
    "pvStats": "Jours d’étude",
    "pvSet": "Réglages",
    "pvItems": "{n} éléments",
    "pvTotal": "Total : {n}",
    "pvExport": "Télécharger mes données",
    "pvImport": "Restaurer depuis un fichier",
    "pvClear": "Supprimer toutes mes données",
    "pvClearAsk": "Supprimer de ce navigateur les mots enregistrés, la progression des leçons, l’historique d’étude et les réglages ? Cette action est irréversible. Téléchargez d’abord une copie si vous voulez la garder.",
    "pvClearYes": "Oui, tout supprimer",
    "pvCleared": "Toutes les données supprimées",
    "pvImported": "Données restaurées",
    "pvBadFile": "Ce n’est pas un fichier de sauvegarde Bhasha",
    "pvLicence": "Bhasha fait partie d’EknathaLabs. La voix hors ligne facultative (eSpeak NG) est open source sous GPL-3.0 et n’est téléchargée depuis ce site que si vous l’autorisez.",
    "pvBadge": "Gratuit · Privé · Hors ligne",
    "cPrivacy": "Voyez ce qui reste sur votre appareil, puis téléchargez-le ou supprimez-le. Gratuit, sans suivi.",
    "cancel": "Annuler",
    "setSound": "Effets sonores",
    "setHaptic": "Vibration",
    "pronBtn": "S’entraîner à parler",
    "pronRec": "Enregistrer",
    "pronStop": "Arrêter",
    "pronAgain": "Réenregistrer",
    "pronModel": "Modèle",
    "pronYou": "Votre voix",
    "pronCompare": "Comparer",
    "pronHelp": "Écoutez le modèle, enregistrez-vous, puis comparez à l’oreille. Votre enregistrement n’est pas conservé.",
    "pronListening": "Enregistrement… parlez maintenant",
    "pronDone": "Écoutez votre voix ou comparez-la avec le modèle.",
    "pronDenied": "Le microphone est bloqué. Autorisez-le dans les réglages du navigateur pour vous entraîner.",
    "pronNoMic": "Ce navigateur ne peut pas enregistrer d’audio.",
    "pronEmpty": "Rien n’a été enregistré. Réessayez."
  };
  I.gu = {
    "skip": "મુખ્ય સામગ્રી પર જાઓ",
    "settings": "સેટિંગ્સ",
    "part": "EknathaLabs નો ભાગ",
    "privacyNote": "તમારા બ્રાઉઝરમાં જ ચાલે છે. તમારી ફાઇલો અને શબ્દો તમારા ડિવાઇસ પર જ રહે છે.",
    "mainNav": "મુખ્ય",
    "uiLang": "ઇન્ટરફેસની ભાષા",
    "focusLang": "હું જે ભાષા શીખું છું",
    "scheme": "રોમન લખાણની શૈલી",
    "schSimple": "સરળ",
    "schIast": "વિદ્વત્",
    "showRoman": "રોમન ઉચ્ચાર બતાવો",
    "on": "ચાલુ",
    "off": "બંધ",
    "voiceSpeed": "અવાજની ગતિ",
    "perDay": "દરેક સત્રમાં પુનરાવર્તન",
    "unlimited": "અમર્યાદિત",
    "theme": "થીમ",
    "light": "આછી",
    "dark": "ઘેરી",
    "new": "નવી",
    "language": "ભાષા",
    "allLangs": "બધી ભાષાઓ",
    "allStatus": "બધા",
    "auto": "આપોઆપ ઓળખો",
    "indianLangs": "ભારતીય ભાષાઓ",
    "otherLangs": "અન્ય ભાષાઓ",
    "nav_watch": "જુઓ",
    "nav_read": "વાંચો",
    "nav_words": "મારા શબ્દો",
    "nav_review": "પુનરાવર્તન",
    "nav_scripts": "લિપિઓ",
    "nav_phrases": "વાક્યો",
    "nav_say": "બોલો",
    "homeH": "તમે જે જુઓ અને વાંચો છો તેમાંથી જ બોલાતી ભાષા શીખો",
    "homeSub": "તમારો પોતાનો વીડિયો, ઑડિયો કે લખાણ લાવો. કોઈપણ શબ્દ પર ટૅપ કરીને સાંભળો, અંગ્રેજી અક્ષરોમાં ઉચ્ચાર જુઓ અને સાચવો. અંતરાલે પુનરાવર્તન કરીને યાદ રાખો. મફત, ખાનગી અને ઑફલાઇન.",
    "statWords": "સાચવેલા શબ્દો",
    "statDue": "આજ માટે",
    "statStreak": "સળંગ દિવસો",
    "cWatch": "તમારો વીડિયો કે ઑડિયો બે લીટીના સબટાઇટલ સાથે ચલાવો. શબ્દો પર ટૅપ કરો, લીટી ફરી સાંભળો, ગતિ ધીમી કરો, વક્તાની નકલ કરો.",
    "cRead": "કોઈપણ લખાણ પેસ્ટ કરો કે ખોલો. દરેક શબ્દ ટૅપ થઈ શકે છે, રોમન ઉચ્ચાર અને મોટેથી વાંચન સાથે.",
    "cWords": "તમે સાચવેલું બધું, CSV, Anki અને બેકઅપ ફાઇલમાં નિકાસ સાથે.",
    "cReview": "ભૂલી જાઓ તે પહેલાં પાછા આવતા ફ્લૅશકાર્ડ.",
    "cScripts": "અક્ષરો, સ્વરચિહ્નો અને અંકો. સાંભળો, ક્વિઝ કરો, લખીને પ્રૅક્ટિસ કરો.",
    "cPhrases": "તેર ભાષાઓમાં 250 રોજિંદા વાક્યો, રોમન ઉચ્ચાર અને અવાજ સાથે.",
    "cSay": "અંગ્રેજીમાં વાક્ય લખો અને તેને તેલુગુ, હિન્દી, કન્નડ, તમિલ, મલયાલમ, બંગાળી, મરાઠી, ગુજરાતી, આસામી, કોરિયન, સ્પૅનિશ, જર્મન કે ફ્રેન્ચમાં સાંભળો.",
    "dueCount": "{n} બાકી",
    "howH": "આ કેવી રીતે કામ કરે છે",
    "how1": "તમારા વીડિયો સાથે સબટાઇટલ ફાઇલ ખોલો, અથવા લખાણ પેસ્ટ કરો.",
    "how2": "ન આવડતા શબ્દ પર ટૅપ કરો. સાંભળો અને અર્થ સાથે સાચવો.",
    "how3": "પુનરાવર્તન માટે પાછા આવો. કાર્ડ યોગ્ય સમયે પાછા આવે છે.",
    "how4": "બધું આ ડિવાઇસ પર જ રહે છે. જ્યારે ઇચ્છો ત્યારે નિકાસ કરો.",
    "homeNote": "અવાજ તમારા ડિવાઇસમાંથી આવે છે. ભારતીય ભાષાઓના અવાજ ફોન અને બ્રાઉઝર પ્રમાણે જુદા હોય છે. કંઈ ન સંભળાય તો સેટિંગ્સમાંથી અવાજ ચકાસણી ખોલો.",
    "noTts": "આ બ્રાઉઝર લખાણ મોટેથી વાંચી શકતું નથી.",
    "noVoice": "આ ડિવાઇસ પર {l} અવાજ નથી. સિસ્ટમ સેટિંગ્સમાં એક ઇન્સ્ટૉલ કરો.",
    "storageFull": "સાચવી શકાયું નથી. બ્રાઉઝરનો સ્ટોરેજ ભરેલો છે કે બંધ છે.",
    "meaning": "અર્થ",
    "status": "સ્થિતિ",
    "st0": "નવો",
    "st1": "શીખું છું",
    "st2": "આવડે છે",
    "seenIn": "વાક્યોની યાદીમાં પણ છે",
    "speak": "બોલો",
    "close": "બંધ કરો",
    "update": "અપડેટ",
    "save": "શબ્દ સાચવો",
    "saved": "સાચવ્યો",
    "remove": "કાઢી નાખો",
    "speakSentence": "વાક્ય વાંચો",
    "translateDevice": "ડિવાઇસ પર અનુવાદ",
    "trFail": "અનુવાદ ઉપલબ્ધ નથી.",
    "lookup": "શોધો",
    "opensTab": "નવું ટૅબ ખૂલે છે",
    "wordDetails": "શબ્દની વિગત",
    "rdLede": "લખાણ પેસ્ટ કરો કે ખોલો. કોઈપણ શબ્દ પર ટૅપ કરો.",
    "rdPlaceholder": "અહીં કોઈપણ ભાષાનું લખાણ પેસ્ટ કરો",
    "rdText": "વાંચવાનું લખાણ",
    "rdEmpty": "હજી બતાવવા જેવું કંઈ નથી. લખાણ પેસ્ટ કરો કે નમૂનો લોડ કરો.",
    "rdStats": "{n} શબ્દો, {u} અલગ. {k} આવડે છે, {l} શીખું છું. ભાષા: {lang}",
    "textLang": "લખાણની ભાષા",
    "colorWords": "સ્થિતિ પ્રમાણે શબ્દોને રંગ",
    "fontSize": "અક્ષરનું કદ",
    "readAloud": "મોટેથી વાંચો",
    "stop": "અટકાવો",
    "sample": "નમૂનો લોડ કરો",
    "importTxt": "લખાણ ફાઇલ ખોલો",
    "clear": "ભૂંસો",
    "clickWord": "વિગત માટે શબ્દ પર ટૅપ કરો",
    "wtLede": "તમારો પોતાનો વીડિયો કે ઑડિયો સબટાઇટલ ફાઇલ સાથે વાપરો. કંઈ અપલોડ થતું નથી.",
    "wtSetup": "તમારી ફાઇલો પસંદ કરો",
    "wtDrop": "વીડિયો કે ઑડિયો અને સબટાઇટલ ફાઇલો અહીં મૂકો, અથવા બટનો વાપરો.",
    "wtMedia": "વીડિયો કે ઑડિયો",
    "wtSub1": "સબટાઇટલ (શીખવાની ભાષા)",
    "wtSub2": "સબટાઇટલ (તમારી ભાષા)",
    "subLang": "સબટાઇટલની ભાષા",
    "wtStart": "શરૂ કરો",
    "wtSample": "નમૂનો અજમાવો (મોટેથી વાંચે છે)",
    "noSubs": "{f} માં સબટાઇટલ મળ્યા નથી. .srt કે .vtt વાપરો.",
    "wtPrivacy": "ફાઇલો તમારા બ્રાઉઝરમાં જ ખૂલે છે અને ડિવાઇસની બહાર જતી નથી. વીડિયો કે ઑડિયો ન હોય તો લીટીઓ તમારા ડિવાઇસના અવાજમાં વંચાય છે.",
    "wtListenMode": "સાંભળવાનો મોડ: લીટીઓ મોટેથી વંચાય છે",
    "wtTranscript": "લિખિત લખાણ",
    "playPause": "ચલાવો કે થોભાવો",
    "prevLine": "પાછલી લીટી",
    "nextLine": "આગલી લીટી",
    "replay": "લીટી ફરી",
    "loopLine": "લીટી વારંવાર",
    "autoPause": "દરેક લીટી પછી થોભો",
    "hideTarget": "શીખવાની ભાષાના સબટાઇટલ છુપાવો",
    "hideNative": "મારી ભાષાના સબટાઇટલ છુપાવો",
    "blurNative": "મારી ભાષા ઝાંખી કરો",
    "speed": "ગતિ",
    "subEarlier": "સબટાઇટલ વહેલા",
    "subLater": "સબટાઇટલ મોડા",
    "shadow": "નકલ કરો",
    "stopRec": "અટકાવો",
    "yourVoice": "તમારો અવાજ",
    "orig": "મૂળ",
    "noMic": "અહીં રેકૉર્ડિંગ સપોર્ટેડ નથી.",
    "micDenied": "માઇક્રોફોનની પરવાનગી મળી નથી.",
    "wtChange": "ફાઇલો બદલો",
    "wtKeys": "કી: Space ચલાવો/થોભો, A/D કે તીર પાછળ/આગળ, R ફરી, L વારંવાર, P દરેક લીટી પછી થોભો.",
    "wdLede": "તમારા સાચવેલા શબ્દો. ફક્ત આ બ્રાઉઝરમાં રહે છે.",
    "wdCount": "{n} બતાવ્યા, {d} હમણાં બાકી",
    "wdNoMatch": "કોઈ શબ્દ મળતો નથી.",
    "wdEmpty": "હજી કોઈ શબ્દ સાચવ્યો નથી.",
    "wdEmptySub": "વાંચો કે જુઓ ખોલીને શબ્દ પર ટૅપ કરી સાચવો.",
    "wdMore": "બીજા {n} બતાવ્યા નથી. શોધ વાપરો.",
    "wdNothing": "નિકાસ કરવા જેવું કંઈ નથી.",
    "wdImported": "{n} નવા શબ્દો આયાત થયા.",
    "wdImportFail": "એ ફાઇલ વાંચી શકાઈ નહીં.",
    "wdPrivacy": "બ્રાઉઝર ડેટા સાફ કરશો તો યાદી જતી રહેશે, એટલે વચ્ચે વચ્ચે બેકઅપ નિકાસ કરો.",
    "search": "શોધ",
    "edit": "સંપાદન",
    "dueNow": "હમણાં",
    "dueToday": "આજે",
    "dueIn": "{n} દિવસમાં",
    "backup": "બેકઅપ",
    "importWords": "આયાત",
    "rvLede": "કાર્ડ ફેરવો, પછી કહો કે કેટલું યાદ હતું.",
    "rvMode": "પ્રૅક્ટિસનો પ્રકાર",
    "rvW2M": "શબ્દથી અર્થ",
    "rvM2W": "અર્થથી શબ્દ",
    "rvListen": "સાંભળવું",
    "rvCloze": "ખાલી જગ્યા પૂરો",
    "rvStreak": "સળંગ દિવસો: {n}",
    "rvDone": "પૂર્ણ: {n} કાર્ડ",
    "rvDoneSub": "પછી પાછા આવજો. ખોટા કાર્ડ થોડી મિનિટોમાં અને બાકીના થોડા દિવસોમાં પાછા આવશે.",
    "rvNone": "કંઈ બાકી નથી",
    "rvNoneSub": "તમે અદ્યતન છો. નવા શબ્દો માટે વધુ વાંચો કે જુઓ.",
    "rvWhichWord": "આ કયો શબ્દ છે?",
    "rvPlay": "શબ્દ સાંભળો",
    "rvListenQ": "સાંભળો, પછી અર્થ યાદ કરો",
    "rvHint": "અર્થ",
    "rvShow": "જવાબ બતાવો",
    "rvProgress": "સત્રની પ્રગતિ",
    "again": "ફરી",
    "hard": "અઘરું",
    "good": "સારું",
    "easy": "સહેલું",
    "scLede": "અક્ષરો શીખો. કોઈપણ અક્ષર પર ટૅપ કરીને સાંભળો અને લખવાની પ્રૅક્ટિસ કરો.",
    "scVowels": "સ્વર",
    "scCons": "વ્યંજન",
    "scSigns": "સ્વરચિહ્નો",
    "scSignsNote": "અક્ષર {b} પર બતાવ્યા છે",
    "scDigits": "અંક",
    "scQuiz": "નાની ક્વિઝ",
    "scQuizQ": "આ અક્ષર કેવી રીતે વંચાય?",
    "scTrace": "લખીને જુઓ",
    "scTraceHint": "ઉપર એક અક્ષર પર ટૅપ કરો, પછી અહીં લખો.",
    "correct": "સાચું!",
    "wrongIs": "ખોટું. આ {a} છે.",
    "next": "આગળ",
    "phLede": "રોજિંદા વાક્યો. કોઈપણ શબ્દ પર ટૅપ કરીને સાચવો.",
    "phNote": "આ વાક્યો શરૂઆતનો સંગ્રહ છે. તેના પર આધાર રાખતાં પહેલાં માતૃભાષીને બતાવીને ચકાસો.",
    "cat_greet": "અભિવાદન",
    "cat_intro": "પરિચય",
    "cat_daily": "રોજિંદું જીવન",
    "cat_num": "સંખ્યાઓ",
    "slow": "ધીમે",
    "sayLede": "અંગ્રેજીમાં વાક્ય લખો. તેને બીજી ભાષામાં રોમન ઉચ્ચાર અને અવાજ સાથે મેળવો.",
    "sayPlaceholder": "અંગ્રેજી વાક્ય લખો, જેમ કે: How are you?",
    "sayInput": "અંગ્રેજી વાક્ય",
    "sayTo": "આ ભાષામાં બોલો",
    "sayGo": "અનુવાદ કરીને બોલો",
    "sayEnglish": "અંગ્રેજીમાં બોલો",
    "sayResult": "પરિણામ",
    "sayMatch": "વાક્ય સંગ્રહ",
    "sayDevice": "તમારા ડિવાઇસ પર અનુવાદિત",
    "sayClosest": "વાક્ય સંગ્રહના સૌથી નજીકના વાક્યો",
    "sayNone": "કોઈપણ વાક્યનો અનુવાદ કરવા ડિવાઇસ પર અનુવાદક ધરાવતું બ્રાઉઝર (તાજેતરનું Chrome) જોઈએ. વાક્ય સંગ્રહના સૌથી નજીકના વાક્યો અહીં છે.",
    "sayWorking": "તમારા ડિવાઇસ પર અનુવાદ થઈ રહ્યો છે…",
    "sayFail": "ડિવાઇસનો અનુવાદક આ ભાષાજોડી માટે ચાલ્યો નહીં. વાક્ય સંગ્રહના સૌથી નજીકના વાક્યો અહીં છે.",
    "sayNote": "કંઈ સર્વરને મોકલાતું નથી. યંત્ર-અનુવાદ ખોટો હોઈ શકે, એટલે મહત્ત્વના વાક્યો માતૃભાષી પાસે ચકાસાવો.",
    "copy": "કૉપી",
    "copied": "કૉપી થયું",
    "cat_food": "ભોજન",
    "cat_travel": "પ્રવાસ",
    "cat_shop": "ખરીદી",
    "cat_health": "આરોગ્ય",
    "cat_people": "લોકો",
    "cat_time": "દિવસો અને સમય",
    "voiceCheck": "અવાજ ચકાસણી",
    "vcLede": "આ ડિવાઇસ પર કયા અવાજ ચાલે છે. દરેક સાંભળવા ચકાસો દબાવો. કોઈ ભાષાનો ડિવાઇસ અવાજ ન હોય તો Bhasha નાનો ઑફલાઇન અવાજ વાપરી શકે છે.",
    "vcDevice": "ડિવાઇસનો અવાજ",
    "vcOffline": "ઑફલાઇન અવાજ તૈયાર",
    "vcOfflineAvail": "ડિવાઇસનો અવાજ નથી. ઑફલાઇન અવાજ ઉપલબ્ધ",
    "vcNone": "અવાજ નથી",
    "vcTest": "ચકાસો",
    "ovLabel": "ઑફલાઇન અવાજનો બેકઅપ",
    "ovAsk": "પૂછો",
    "ovNote": "ઑફલાઇન અવાજ (eSpeak NG) આશરે 18 MB નો છે, એક વાર ડાઉનલોડ થયા પછી ઇન્ટરનેટ વિના ચાલે છે. તે ડિવાઇસના અવાજ કરતાં વધુ યાંત્રિક લાગે છે.",
    "ovAskQ": "આ ડિવાઇસ પર {l} અવાજ નથી. ઑફલાઇન અવાજ ડાઉનલોડ કરવો (આશરે 18 MB, એક વાર)?",
    "ovYes": "ડાઉનલોડ",
    "ovNo": "હમણાં નહીં",
    "ovLoading": "ઑફલાઇન અવાજ લોડ થઈ રહ્યો છે…",
    "ovFail": "ઑફલાઇન અવાજ વગાડી શકાયો નહીં.",
    "nav_today": "આજે",
    "nav_talk": "વાતચીત",
    "cToday": "દરરોજ એક ટૂંકો પાઠ: પાંચ નવા વાક્યો, સાંભળવાની ક્વિઝ અને યાદ કરવાનો રાઉન્ડ.",
    "cTalk": "સાચી વાતચીતની પ્રૅક્ટિસ કરો: રેસ્ટોરાં, રસ્તો પૂછવો, ખરીદી, ડૉક્ટર, હોટેલ. એક લીટી સાંભળો, પછી તમારો જવાબ પસંદ કરો.",
    "tdLede": "રોજ પાંચ નવા વાક્યો. શીખો, સાંભળો, અને ભૂલી જાઓ તે પહેલાં જૂના યાદ કરો.",
    "tdStart": "આજનો પાઠ શરૂ કરો",
    "tdDone": "આજનો પાઠ પૂરો થયો. કાલે ફરી આવજો.",
    "tdLearn": "શીખો",
    "tdListen": "સાંભળો",
    "tdRecall": "યાદ કરો",
    "tdNext": "આગળ",
    "tdFinish": "પૂરું",
    "tdListenQ": "સાંભળો, પછી અર્થ પસંદ કરો",
    "tdRecallQ": "આ અર્થવાળું વાક્ય પસંદ કરો:",
    "tdScore": "ગુણ: {m} માંથી {n}",
    "tdBonus": "એક વધુ પાઠ કરો",
    "tdProgress": "{m} માંથી {n} વાક્યો શીખ્યા",
    "tdRecallN": "આજે યાદ કરવાના {n} જૂના વાક્યો",
    "drLede": "એક વાતચીત પસંદ કરો. તેઓ શું કહે છે તે સાંભળો, પછી તમારો જવાબ પસંદ કરો.",
    "drPick": "વાતચીત",
    "drTurns": "{n} વારા",
    "drThem": "તેઓ કહે છે",
    "drYou": "તમારો વારો. કહો:",
    "drHide": "સાંભળવાનો મોડ: તેમની વાત છુપાવો",
    "drTry": "બરાબર નથી. ફરી પ્રયાસ કરો.",
    "drDone": "વાતચીત પૂરી થઈ",
    "drScore": "પહેલા પ્રયાસે {m} માંથી {n} સાચા",
    "drReplay": "ફરી ચલાવો",
    "drTranscript": "આખી વાતચીત",
    "drAnother": "બીજી વાતચીત",
    "d_meet": "કોઈને મળવું",
    "d_rest": "રેસ્ટોરાંમાં",
    "d_dir": "રસ્તો પૂછવો",
    "d_shop": "ખરીદી",
    "d_doc": "ડૉક્ટર પાસે",
    "d_hotel": "હોટેલમાં",
    "cat_talk": "વાતચીત",
    "cat_feel": "લાગણીઓ",
    "cat_work": "કામ અને ફોન",
    "cat_home": "ઘર અને હવામાન",
    "pvTitle": "મફત અને ખાનગી",
    "pvLede": "Bhasha બધા માટે મફત છે. ખાતું નહીં, જાહેરાત નહીં, ટ્રેકિંગ નહીં. તમે જે કંઈ કરો છો તે આ ઉપકરણ પર જ રહે છે.",
    "pvFree": "બધા માટે મફત",
    "pvFreeT": "ચુકવણી નહીં, સાઇન-અપ નહીં, કંઈ બંધ નહીં. EknathaLabs તેને હંમેશાં મફત રાખવા બનાવે છે.",
    "pvPriv": "તમારા ઉપકરણ પર જ રહે છે",
    "pvPrivT": "તમારી ફાઇલો, શબ્દો અને પ્રગતિ ફક્ત આ બ્રાઉઝરમાં રહે છે. મોકલવા માટે કોઈ સર્વર નથી.",
    "pvNet": "ટ્રેકિંગ નહીં",
    "pvNetT": "એનાલિટિક્સ નહીં, કૂકીઝ નહીં, બહારની સ્ક્રિપ્ટ નહીં. ફૉન્ટ અને ઑફલાઇન અવાજ આ જ સાઇટ પરથી આવે છે. બહારના શબ્દકોશની લિંક તમે દબાવો ત્યારે જ ખૂલે છે.",
    "pvMic": "તમારો અવાજ",
    "pvMicT": "ઉચ્ચારનું રેકોર્ડિંગ પાનું ખુલ્લું હોય ત્યાં સુધી જ મેમરીમાં રહે છે. તે ક્યારેય સાચવાતું કે અપલોડ થતું નથી.",
    "pvStored": "આ બ્રાઉઝરમાં સાચવેલું",
    "pvWords": "સાચવેલા શબ્દો",
    "pvLesson": "પાઠના વાક્યો",
    "pvStats": "અભ્યાસના દિવસો",
    "pvSet": "સેટિંગ્સ",
    "pvItems": "{n} આઇટમ",
    "pvTotal": "કુલ: {n}",
    "pvExport": "મારો ડેટા ડાઉનલોડ કરો",
    "pvImport": "ફાઇલમાંથી પાછું લાવો",
    "pvClear": "મારો બધો ડેટા કાઢી નાખો",
    "pvClearAsk": "આ બ્રાઉઝરમાંથી સાચવેલા શબ્દો, પાઠની પ્રગતિ, અભ્યાસનો ઇતિહાસ અને સેટિંગ્સ કાઢી નાખવા છે? આ પાછું નહીં લાવી શકાય. રાખવું હોય તો પહેલા એક નકલ ડાઉનલોડ કરો.",
    "pvClearYes": "હા, બધું કાઢી નાખો",
    "pvCleared": "બધો ડેટા કાઢી નાખ્યો",
    "pvImported": "ડેટા પાછો લાવ્યા",
    "pvBadFile": "આ Bhasha ની બેકઅપ ફાઇલ નથી",
    "pvLicence": "Bhasha એ EknathaLabs નો ભાગ છે. વૈકલ્પિક ઑફલાઇન અવાજ (eSpeak NG) GPL-3.0 હેઠળ ઓપન સોર્સ છે અને તમે મંજૂરી આપો ત્યારે જ આ સાઇટ પરથી ડાઉનલોડ થાય છે.",
    "pvBadge": "મફત · ખાનગી · ઑફલાઇન",
    "cPrivacy": "તમારા ઉપકરણ પર શું રહે છે તે જુઓ, પછી ડાઉનલોડ કરો અથવા કાઢી નાખો. મફત, ટ્રેકિંગ નહીં.",
    "cancel": "રદ કરો",
    "setSound": "અવાજની અસરો",
    "setHaptic": "કંપન",
    "pronBtn": "બોલવાનો મહાવરો",
    "pronRec": "રેકોર્ડ કરો",
    "pronStop": "રોકો",
    "pronAgain": "ફરી રેકોર્ડ કરો",
    "pronModel": "નમૂનો",
    "pronYou": "તમારો અવાજ",
    "pronCompare": "સરખાવો",
    "pronHelp": "નમૂનો સાંભળો, જાતે રેકોર્ડ કરો અને કાનથી સરખાવો. તમારું રેકોર્ડિંગ સચવાતું નથી.",
    "pronListening": "રેકોર્ડ થઈ રહ્યું છે… હવે બોલો",
    "pronDone": "તમારું રેકોર્ડિંગ સાંભળો અથવા નમૂના સાથે સરખાવો.",
    "pronDenied": "માઇક્રોફોન બંધ છે. મહાવરા માટે બ્રાઉઝર સેટિંગ્સમાં મંજૂરી આપો.",
    "pronNoMic": "આ બ્રાઉઝર ઑડિયો રેકોર્ડ કરી શકતું નથી.",
    "pronEmpty": "કંઈ રેકોર્ડ થયું નથી. ફરી પ્રયત્ન કરો."
  };
  I.as = {
    "skip": "মূল বিষয়লৈ যাওক",
    "settings": "ছেটিংছ",
    "part": "EknathaLabs ৰ অংশ",
    "privacyNote": "আপোনাৰ ব্ৰাউজাৰতে চলে। আপোনাৰ ফাইল আৰু শব্দ আপোনাৰ ডিভাইচতে থাকে।",
    "mainNav": "মূল",
    "uiLang": "ইণ্টাৰফেচৰ ভাষা",
    "focusLang": "মই শিকি থকা ভাষা",
    "scheme": "ৰোমান লিপিৰ ধৰণ",
    "schSimple": "সহজ",
    "schIast": "পাণ্ডিত্যপূৰ্ণ",
    "showRoman": "ৰোমান উচ্চাৰণ দেখুৱাওক",
    "on": "চলি আছে",
    "off": "বন্ধ",
    "voiceSpeed": "মাতৰ গতি",
    "perDay": "প্ৰতিটো ছেছনত পুনৰাবৃত্তি",
    "unlimited": "সীমাহীন",
    "theme": "থীম",
    "light": "পাতল",
    "dark": "গাঢ়",
    "new": "নতুন",
    "language": "ভাষা",
    "allLangs": "সকলো ভাষা",
    "allStatus": "সকলো",
    "auto": "নিজে নিজে চিনাক্ত কৰক",
    "indianLangs": "ভাৰতীয় ভাষা",
    "otherLangs": "অন্য ভাষা",
    "nav_watch": "চাওক",
    "nav_read": "পঢ়ক",
    "nav_words": "মোৰ শব্দ",
    "nav_review": "পুনৰাবৃত্তি",
    "nav_scripts": "লিপি",
    "nav_phrases": "বাক্যাংশ",
    "nav_say": "কওক",
    "homeH": "আপুনি যি চায় আৰু পঢ়ে তাৰ পৰাই কথিত ভাষা শিকক",
    "homeSub": "নিজৰ ভিডিঅ’, অডিঅ’ বা লেখা আনক। যিকোনো শব্দত টেপ কৰি শুনক, ইংৰাজী আখৰত উচ্চাৰণ চাওক আৰু সংৰক্ষণ কৰক। ব্যৱধানত পুনৰাবৃত্তি কৰি মনত ৰাখক। বিনামূলীয়া, ব্যক্তিগত আৰু অফলাইনত চলে।",
    "statWords": "সংৰক্ষিত শব্দ",
    "statDue": "আজিৰ বাবে",
    "statStreak": "লগে লগে দিন",
    "cWatch": "নিজৰ ভিডিঅ’ বা অডিঅ’ দুশাৰী উপশিৰোনামৰ সৈতে চলাওক। শব্দত টেপ কৰক, শাৰী পুনৰ শুনক, গতি লেহেমীয়া কৰক, বক্তাৰ অনুকৰণ কৰক।",
    "cRead": "যিকোনো লেখা পেষ্ট কৰক বা খোলক। প্ৰতিটো শব্দ টেপ কৰিব পাৰি, ৰোমান উচ্চাৰণ আৰু ডাঙৰকৈ পঢ়াৰ সৈতে।",
    "cWords": "আপুনি সংৰক্ষণ কৰা সকলো, CSV, Anki আৰু বেকআপ ফাইলত ৰপ্তানিৰ সৈতে।",
    "cReview": "পাহৰি যোৱাৰ আগতে উভতি অহা ফ্লেছকাৰ্ড।",
    "cScripts": "আখৰ, স্বৰচিহ্ন আৰু সংখ্যা। শুনক, কুইজ খেলক, লিখি অভ্যাস কৰক।",
    "cPhrases": "তেৰটা ভাষাত ২৫০টা দৈনন্দিন বাক্যাংশ, ৰোমান উচ্চাৰণ আৰু মাতৰ সৈতে।",
    "cSay": "ইংৰাজীত বাক্য লিখক আৰু তেলুগু, হিন্দী, কন্নড়, তামিল, মালয়ালম, বঙালী, মাৰাঠী, গুজৰাটী, অসমীয়া, কোৰিয়ান, স্পেনিছ, জাৰ্মান বা ফৰাচীত শুনক।",
    "dueCount": "{n}টা বাকী",
    "howH": "ই কেনেকৈ কাম কৰে",
    "how1": "আপোনাৰ ভিডিঅ’ৰ সৈতে উপশিৰোনাম ফাইল খোলক, বা লেখা পেষ্ট কৰক।",
    "how2": "নজনা শব্দত টেপ কৰক। শুনক আৰু অৰ্থৰ সৈতে সংৰক্ষণ কৰক।",
    "how3": "পুনৰাবৃত্তিলৈ উভতি আহক। কাৰ্ডবোৰ ঠিক সময়ত উভতি আহে।",
    "how4": "সকলো এই ডিভাইচতে থাকে। যেতিয়া ইচ্ছা ৰপ্তানি কৰক।",
    "homeNote": "মাত আপোনাৰ ডিভাইচৰ পৰা আহে। ভাৰতীয় ভাষাৰ মাত ফোন আৰু ব্ৰাউজাৰ অনুসৰি বেলেগ হয়। একো নুশুনিলে ছেটিংছৰ পৰা মাত পৰীক্ষা খোলক।",
    "noTts": "এই ব্ৰাউজাৰে লেখা ডাঙৰকৈ পঢ়িব নোৱাৰে।",
    "noVoice": "এই ডিভাইচত {l} মাত নাই। ছিষ্টেম ছেটিংছত এটা ইনষ্টল কৰক।",
    "storageFull": "সংৰক্ষণ কৰিব পৰা নগ’ল। ব্ৰাউজাৰৰ ষ্ট’ৰেজ ভৰ্তি বা বন্ধ।",
    "meaning": "অৰ্থ",
    "status": "অৱস্থা",
    "st0": "নতুন",
    "st1": "শিকি আছোঁ",
    "st2": "জানোঁ",
    "seenIn": "বাক্যাংশৰ তালিকাতো আছে",
    "speak": "কওক",
    "close": "বন্ধ কৰক",
    "update": "হালনাগাদ",
    "save": "শব্দ সংৰক্ষণ",
    "saved": "সংৰক্ষিত",
    "remove": "আঁতৰাওক",
    "speakSentence": "বাক্য পঢ়ক",
    "translateDevice": "ডিভাইচত অনুবাদ",
    "trFail": "অনুবাদ উপলব্ধ নহয়।",
    "lookup": "সন্ধান",
    "opensTab": "নতুন টেব খোলে",
    "wordDetails": "শব্দৰ বিৱৰণ",
    "rdLede": "লেখা পেষ্ট কৰক বা খোলক। যিকোনো শব্দত টেপ কৰক।",
    "rdPlaceholder": "ইয়াত যিকোনো ভাষাৰ লেখা পেষ্ট কৰক",
    "rdText": "পঢ়িবলগীয়া লেখা",
    "rdEmpty": "এতিয়ালৈকে দেখুৱাবলৈ একো নাই। লেখা পেষ্ট কৰক বা নমুনা লোড কৰক।",
    "rdStats": "{n}টা শব্দ, {u}টা বেলেগ। {k}টা জানোঁ, {l}টা শিকি আছোঁ। ভাষা: {lang}",
    "textLang": "লেখাৰ ভাষা",
    "colorWords": "অৱস্থা অনুসৰি শব্দত ৰং",
    "fontSize": "আখৰৰ আকাৰ",
    "readAloud": "ডাঙৰকৈ পঢ়ক",
    "stop": "ৰখাওক",
    "sample": "নমুনা লোড কৰক",
    "importTxt": "লেখাৰ ফাইল খোলক",
    "clear": "মচক",
    "clickWord": "বিৱৰণৰ বাবে শব্দত টেপ কৰক",
    "wtLede": "নিজৰ ভিডিঅ’ বা অডিঅ’ উপশিৰোনাম ফাইলৰ সৈতে ব্যৱহাৰ কৰক। একো আপলোড নহয়।",
    "wtSetup": "আপোনাৰ ফাইল বাছক",
    "wtDrop": "ভিডিঅ’ বা অডিঅ’ আৰু উপশিৰোনাম ফাইল ইয়াত এৰি দিয়ক, বা বুটাম ব্যৱহাৰ কৰক।",
    "wtMedia": "ভিডিঅ’ বা অডিঅ’",
    "wtSub1": "উপশিৰোনাম (শিকি থকা ভাষা)",
    "wtSub2": "উপশিৰোনাম (আপোনাৰ ভাষা)",
    "subLang": "উপশিৰোনামৰ ভাষা",
    "wtStart": "আৰম্ভ কৰক",
    "wtSample": "নমুনা চেষ্টা কৰক (ডাঙৰকৈ পঢ়ে)",
    "noSubs": "{f} ত উপশিৰোনাম পোৱা নগ’ল। .srt বা .vtt ব্যৱহাৰ কৰক।",
    "wtPrivacy": "ফাইল আপোনাৰ ব্ৰাউজাৰতে খোলে, ডিভাইচৰ বাহিৰলৈ নাযায়। ভিডিঅ’ বা অডিঅ’ নাথাকিলে শাৰীবোৰ আপোনাৰ ডিভাইচৰ মাতেৰে পঢ়া হয়।",
    "wtListenMode": "শুনাৰ মোড: শাৰীবোৰ ডাঙৰকৈ পঢ়া হয়",
    "wtTranscript": "লিখিত ৰূপ",
    "playPause": "চলাওক বা ৰখাওক",
    "prevLine": "আগৰ শাৰী",
    "nextLine": "পিছৰ শাৰী",
    "replay": "শাৰী পুনৰ",
    "loopLine": "শাৰী বাৰে বাৰে",
    "autoPause": "প্ৰতি শাৰীৰ পিছত ৰওক",
    "hideTarget": "শিকি থকা ভাষাৰ উপশিৰোনাম লুকুৱাওক",
    "hideNative": "মোৰ ভাষাৰ উপশিৰোনাম লুকুৱাওক",
    "blurNative": "মোৰ ভাষা জাপ মাৰক",
    "speed": "গতি",
    "subEarlier": "উপশিৰোনাম আগতে",
    "subLater": "উপশিৰোনাম পিছত",
    "shadow": "অনুকৰণ",
    "stopRec": "ৰখাওক",
    "yourVoice": "আপোনাৰ মাত",
    "orig": "মূল",
    "noMic": "ইয়াত ৰেকৰ্ডিং সমৰ্থিত নহয়।",
    "micDenied": "মাইক্ৰ’ফোনৰ অনুমতি দিয়া হোৱা নাই।",
    "wtChange": "ফাইল সলনি কৰক",
    "wtKeys": "চাবি: Space চলাওক/ৰখাওক, A/D বা কাঁড় আগ/পিছ, R পুনৰ, L বাৰে বাৰে, P প্ৰতি শাৰীৰ পিছত ৰওক।",
    "wdLede": "আপোনাৰ সংৰক্ষিত শব্দ। কেৱল এই ব্ৰাউজাৰতে থাকে।",
    "wdCount": "{n}টা দেখুওৱা হৈছে, {d}টা এতিয়া বাকী",
    "wdNoMatch": "কোনো শব্দ মিলা নাই।",
    "wdEmpty": "এতিয়ালৈকে কোনো শব্দ সংৰক্ষণ কৰা হোৱা নাই।",
    "wdEmptySub": "পঢ়ক বা চাওক খুলি শব্দত টেপ কৰি সংৰক্ষণ কৰক।",
    "wdMore": "আৰু {n}টা দেখুওৱা হোৱা নাই। সন্ধান ব্যৱহাৰ কৰক।",
    "wdNothing": "ৰপ্তানি কৰিবলৈ একো নাই।",
    "wdImported": "{n}টা নতুন শব্দ আমদানি হ’ল।",
    "wdImportFail": "সেই ফাইল পঢ়িব পৰা নগ’ল।",
    "wdPrivacy": "ব্ৰাউজাৰৰ ডাটা মচিলে তালিকা নাইকিয়া হয়, গতিকে মাজে মাজে বেকআপ ৰপ্তানি কৰক।",
    "search": "সন্ধান",
    "edit": "সম্পাদনা",
    "dueNow": "এতিয়া",
    "dueToday": "আজি",
    "dueIn": "{n} দিনত",
    "backup": "বেকআপ",
    "importWords": "আমদানি",
    "rvLede": "কাৰ্ড লুটিয়াওক, তাৰ পিছত কওক কিমান মনত আছিল।",
    "rvMode": "অভ্যাসৰ প্ৰকাৰ",
    "rvW2M": "শব্দৰ পৰা অৰ্থ",
    "rvM2W": "অৰ্থৰ পৰা শব্দ",
    "rvListen": "শুনা",
    "rvCloze": "খালী ঠাই পূৰ কৰক",
    "rvStreak": "লগে লগে দিন: {n}",
    "rvDone": "সম্পূৰ্ণ: {n}খন কাৰ্ড",
    "rvDoneSub": "পিছত আকৌ আহক। ভুল হোৱা কাৰ্ড কেইমিনিটমানৰ ভিতৰত, বাকীবোৰ কেইদিনমানৰ ভিতৰত উভতি আহিব।",
    "rvNone": "একো বাকী নাই",
    "rvNoneSub": "আপুনি হালনাগাদ আছে। নতুন শব্দ পাবলৈ আৰু পঢ়ক বা চাওক।",
    "rvWhichWord": "এইটো কি শব্দ?",
    "rvPlay": "শব্দ শুনক",
    "rvListenQ": "শুনক, তাৰ পিছত অৰ্থ মনত পেলাওক",
    "rvHint": "অৰ্থ",
    "rvShow": "উত্তৰ দেখুৱাওক",
    "rvProgress": "ছেছনৰ অগ্ৰগতি",
    "again": "পুনৰ",
    "hard": "টান",
    "good": "ভাল",
    "easy": "সহজ",
    "scLede": "আখৰ শিকক। যিকোনো আখৰত টেপ কৰি শুনক আৰু লিখি অভ্যাস কৰক।",
    "scVowels": "স্বৰবৰ্ণ",
    "scCons": "ব্যঞ্জনবৰ্ণ",
    "scSigns": "স্বৰচিহ্ন",
    "scSignsNote": "{b} আখৰৰ ওপৰত দেখুওৱা হৈছে",
    "scDigits": "সংখ্যা",
    "scQuiz": "সৰু কুইজ",
    "scQuizQ": "এই আখৰটো কেনেকৈ পঢ়িব?",
    "scTrace": "লিখি চাওক",
    "scTraceHint": "ওপৰত এটা আখৰত টেপ কৰক, তাৰ পিছত ইয়াত লিখক।",
    "correct": "শুদ্ধ!",
    "wrongIs": "ভুল। এইটো {a}।",
    "next": "পিছৰটো",
    "phLede": "দৈনন্দিন বাক্যাংশ। যিকোনো শব্দত টেপ কৰি সংৰক্ষণ কৰক।",
    "phNote": "এই বাক্যাংশবোৰ আৰম্ভণিৰ সংকলন। ইয়াত ভৰসা কৰাৰ আগতে মাতৃভাষীক দেখুৱাই লওক।",
    "cat_greet": "শুভেচ্ছা",
    "cat_intro": "পৰিচয়",
    "cat_daily": "দৈনন্দিন জীৱন",
    "cat_num": "সংখ্যা",
    "slow": "লাহে লাহে",
    "sayLede": "ইংৰাজীত বাক্য লিখক। আন ভাষাত ৰোমান উচ্চাৰণ আৰু মাতৰ সৈতে পাওক।",
    "sayPlaceholder": "ইংৰাজী বাক্য লিখক, যেনে: How are you?",
    "sayInput": "ইংৰাজী বাক্য",
    "sayTo": "এই ভাষাত কওক",
    "sayGo": "অনুবাদ কৰি কওক",
    "sayEnglish": "ইংৰাজীত কওক",
    "sayResult": "ফলাফল",
    "sayMatch": "বাক্যাংশ সংকলন",
    "sayDevice": "আপোনাৰ ডিভাইচত অনুবাদ কৰা",
    "sayClosest": "বাক্যাংশ সংকলনৰ আটাইতকৈ ওচৰৰ বাক্য",
    "sayNone": "যিকোনো বাক্য অনুবাদ কৰিবলৈ ডিভাইচত অনুবাদক থকা ব্ৰাউজাৰ (শেহতীয়া Chrome) লাগে। বাক্যাংশ সংকলনৰ আটাইতকৈ ওচৰৰ বাক্যবোৰ ইয়াত আছে।",
    "sayWorking": "আপোনাৰ ডিভাইচত অনুবাদ হৈ আছে…",
    "sayFail": "ডিভাইচৰ অনুবাদকে এই ভাষাযোৰৰ বাবে কাম কৰা নাই। বাক্যাংশ সংকলনৰ আটাইতকৈ ওচৰৰ বাক্যবোৰ ইয়াত আছে।",
    "sayNote": "একো চাৰ্ভাৰলৈ পঠোৱা নহয়। যান্ত্ৰিক অনুবাদ ভুল হ’ব পাৰে, গতিকে গুৰুত্বপূৰ্ণ বাক্য মাতৃভাষীৰ দ্বাৰা পৰীক্ষা কৰাই লওক।",
    "copy": "কপি",
    "copied": "কপি হ’ল",
    "cat_food": "আহাৰ",
    "cat_travel": "ভ্ৰমণ",
    "cat_shop": "বজাৰ-সদাই",
    "cat_health": "স্বাস্থ্য",
    "cat_people": "মানুহ",
    "cat_time": "দিন আৰু সময়",
    "voiceCheck": "মাত পৰীক্ষা",
    "vcLede": "এই ডিভাইচত কোনবোৰ মাত চলে। প্ৰত্যেকটো শুনিবলৈ পৰীক্ষা টিপক। কোনো ভাষাৰ ডিভাইচ মাত নাথাকিলে Bhasha এটা সৰু অফলাইন মাত ব্যৱহাৰ কৰিব পাৰে।",
    "vcDevice": "ডিভাইচৰ মাত",
    "vcOffline": "অফলাইন মাত সাজু",
    "vcOfflineAvail": "ডিভাইচৰ মাত নাই। অফলাইন মাত উপলব্ধ",
    "vcNone": "মাত নাই",
    "vcTest": "পৰীক্ষা",
    "ovLabel": "অফলাইন মাতৰ বেকআপ",
    "ovAsk": "সোধক",
    "ovNote": "অফলাইন মাত (eSpeak NG) প্ৰায় ১৮ MB, এবাৰ ডাউনলোড হ’লে ইণ্টাৰনেট অবিহনে চলে। ই ডিভাইচৰ মাতৰ তুলনাত অধিক যান্ত্ৰিক শুনায়।",
    "ovAskQ": "এই ডিভাইচত {l} মাত নাই। অফলাইন মাত ডাউনলোড কৰিবনে (প্ৰায় ১৮ MB, এবাৰ)?",
    "ovYes": "ডাউনলোড",
    "ovNo": "এতিয়া নহয়",
    "ovLoading": "অফলাইন মাত লোড হৈ আছে…",
    "ovFail": "অফলাইন মাত বজাব পৰা নগ’ল।",
    "nav_today": "আজি",
    "nav_talk": "কথোপকথন",
    "cToday": "প্ৰতিদিনে এটা চমু পাঠ: পাঁচটা নতুন বাক্যাংশ, শুনা কুইজ আৰু মনত পেলোৱা ৰাউণ্ড।",
    "cTalk": "প্ৰকৃত কথোপকথনৰ অভ্যাস কৰক: ৰেষ্টুৰেণ্ট, বাট সোধা, বজাৰ-সদাই, ডাক্তৰ, হোটেল। এটা শাৰী শুনি আপোনাৰ উত্তৰ বাছক।",
    "tdLede": "দিনে পাঁচটা নতুন বাক্যাংশ। শিকক, শুনক, আৰু পাহৰি যোৱাৰ আগতে পুৰণিবোৰ মনত পেলাওক।",
    "tdStart": "আজিৰ পাঠ আৰম্ভ কৰক",
    "tdDone": "আজিৰ পাঠ শেষ। কাইলৈ আকৌ আহক।",
    "tdLearn": "শিকক",
    "tdListen": "শুনক",
    "tdRecall": "মনত পেলাওক",
    "tdNext": "পিছৰটো",
    "tdFinish": "শেষ",
    "tdListenQ": "শুনক, তাৰ পিছত অৰ্থ বাছক",
    "tdRecallQ": "এই অৰ্থৰ বাক্যাংশটো বাছক:",
    "tdScore": "নম্বৰ: {m}ৰ ভিতৰত {n}",
    "tdBonus": "আৰু এটা পাঠ কৰক",
    "tdProgress": "{m}ৰ ভিতৰত {n}টা বাক্যাংশ শিকিলে",
    "tdRecallN": "আজি মনত পেলাবলগীয়া {n}টা পুৰণি বাক্যাংশ",
    "drLede": "এটা কথোপকথন বাছক। তেওঁলোকে কি কয় শুনক, তাৰ পিছত আপোনাৰ উত্তৰ বাছক।",
    "drPick": "কথোপকথন",
    "drTurns": "{n}টা পালা",
    "drThem": "তেওঁলোকে কয়",
    "drYou": "আপোনাৰ পালা। কওক:",
    "drHide": "শুনা মোড: তেওঁলোকৰ কথা লুকুৱাওক",
    "drTry": "ঠিক হোৱা নাই। আকৌ চেষ্টা কৰক।",
    "drDone": "কথোপকথন সম্পূৰ্ণ",
    "drScore": "প্ৰথম চেষ্টাতে {m}ৰ ভিতৰত {n}টা শুদ্ধ",
    "drReplay": "পুনৰ চলাওক",
    "drTranscript": "সম্পূৰ্ণ কথোপকথন",
    "drAnother": "আন এটা কথোপকথন",
    "d_meet": "কাৰোবাক লগ পোৱা",
    "d_rest": "ৰেষ্টুৰেণ্টত",
    "d_dir": "বাট সোধা",
    "d_shop": "বজাৰ-সদাই",
    "d_doc": "ডাক্তৰৰ ওচৰত",
    "d_hotel": "হোটেলত",
    "cat_talk": "কথোপকথন",
    "cat_feel": "অনুভৱ",
    "cat_work": "কাম আৰু ফোন",
    "cat_home": "ঘৰ আৰু বতৰ",
    "pvTitle": "বিনামূলীয়া আৰু ব্যক্তিগত",
    "pvLede": "Bhasha সকলোৰে বাবে বিনামূলীয়া। একাউণ্ট নাই, বিজ্ঞাপন নাই, ট্ৰেকিং নাই। আপুনি যি কৰে সকলো এই ডিভাইচতে থাকে।",
    "pvFree": "সকলোৰে বাবে বিনামূলীয়া",
    "pvFreeT": "পেমেণ্ট নাই, চাইন-আপ নাই, একো তালাবদ্ধ নহয়। EknathaLabs-এ ইয়াক সদায় বিনামূলীয়া ৰাখিবলৈ বনায়।",
    "pvPriv": "আপোনাৰ ডিভাইচতে থাকে",
    "pvPrivT": "আপোনাৰ ফাইল, শব্দ আৰু অগ্ৰগতি কেৱল এই ব্ৰাউজাৰতে থাকে। পঠিয়াবলৈ কোনো ছাৰ্ভাৰ নাই।",
    "pvNet": "ট্ৰেকিং নাই",
    "pvNetT": "এনালিটিক্স নাই, কুকি নাই, বাহিৰৰ স্ক্ৰিপ্ট নাই। ফণ্ট আৰু অফলাইন কণ্ঠ এই চাইটৰ পৰাই আহে। বাহিৰৰ অভিধানৰ লিংক আপুনি টিপিলেহে খোলে।",
    "pvMic": "আপোনাৰ কণ্ঠ",
    "pvMicT": "উচ্চাৰণৰ ৰেকৰ্ডিং পৃষ্ঠা খোলা থকালৈকে মেম’ৰীতহে থাকে। ইয়াক কেতিয়াও সংৰক্ষণ বা আপলোড কৰা নহয়।",
    "pvStored": "এই ব্ৰাউজাৰত সংৰক্ষিত",
    "pvWords": "সংৰক্ষিত শব্দ",
    "pvLesson": "পাঠৰ বাক্যাংশ",
    "pvStats": "পঢ়াৰ দিন",
    "pvSet": "ছেটিংছ",
    "pvItems": "{n}টা বস্তু",
    "pvTotal": "মুঠ: {n}",
    "pvExport": "মোৰ ডাটা ডাউনলোড কৰক",
    "pvImport": "ফাইলৰ পৰা পুনৰুদ্ধাৰ কৰক",
    "pvClear": "মোৰ সকলো ডাটা মচি পেলাওক",
    "pvClearAsk": "এই ব্ৰাউজাৰৰ পৰা সংৰক্ষিত শব্দ, পাঠৰ অগ্ৰগতি, পঢ়াৰ ইতিহাস আৰু ছেটিংছ মচিব নেকি? ইয়াক ঘূৰাই পোৱা নাযায়। ৰাখিব বিচাৰিলে আগতে এটা কপি ডাউনলোড কৰক।",
    "pvClearYes": "হয়, সকলো মচক",
    "pvCleared": "সকলো ডাটা মচা হ’ল",
    "pvImported": "ডাটা পুনৰুদ্ধাৰ হ’ল",
    "pvBadFile": "এইটো Bhasha-ৰ বেকআপ ফাইল নহয়",
    "pvLicence": "Bhasha EknathaLabs-ৰ অংশ। বৈকল্পিক অফলাইন কণ্ঠ (eSpeak NG) GPL-3.0 অধীনত মুকলি উৎস আৰু আপুনি অনুমতি দিলেহে এই চাইটৰ পৰা ডাউনলোড হয়।",
    "pvBadge": "বিনামূলীয়া · ব্যক্তিগত · অফলাইন",
    "cPrivacy": "আপোনাৰ ডিভাইচত কি আছে চাওক, তাৰ পিছত ডাউনলোড বা মচক। বিনামূলীয়া, ট্ৰেকিং নাই।",
    "cancel": "বাতিল",
    "setSound": "শব্দৰ প্ৰভাৱ",
    "setHaptic": "কম্পন",
    "pronBtn": "কোৱাৰ অনুশীলন",
    "pronRec": "ৰেকৰ্ড",
    "pronStop": "ৰখাওক",
    "pronAgain": "আকৌ ৰেকৰ্ড কৰক",
    "pronModel": "নমুনা",
    "pronYou": "আপোনাৰ কণ্ঠ",
    "pronCompare": "তুলনা কৰক",
    "pronHelp": "নমুনা শুনক, নিজে ৰেকৰ্ড কৰক, তাৰ পিছত কাণেৰে তুলনা কৰক। আপোনাৰ ৰেকৰ্ডিং সংৰক্ষণ নহয়।",
    "pronListening": "ৰেকৰ্ড হৈ আছে… এতিয়া কওক",
    "pronDone": "নিজৰ ৰেকৰ্ডিং শুনক বা নমুনাৰ লগত তুলনা কৰক।",
    "pronDenied": "মাইক্ৰ’ফোন অৱৰুদ্ধ। অনুশীলনৰ বাবে ব্ৰাউজাৰৰ ছেটিংছত অনুমতি দিয়ক।",
    "pronNoMic": "এই ব্ৰাউজাৰে অডিঅ’ ৰেকৰ্ড কৰিব নোৱাৰে।",
    "pronEmpty": "একো ৰেকৰ্ড হোৱা নাই। আকৌ চেষ্টা কৰক।"
  };
})(window.B = window.B || {});

;
/* Bhasha phrasebook, part 2: French, Gujarati and Assamese for the first 100 phrases, plus 150 more phrases
   (conversation lines, feelings, work, home, travel and more) in all 13 languages.
   Drafts: must be reviewed by native speakers (see README). Generated; edit with care. */
(function (B) {
  'use strict';
  var L3 = ['fr', 'gu', 'as'];
  var OLD3 = {"hello": ["Bonjour", "નમસ્તે", "নমস্কাৰ"], "morning": ["Bonne matinée", "સુપ્રભાત", "শুভ ৰাতিপুৱা"], "night": ["Bonne nuit", "શુભ રાત્રિ", "শুভ ৰাতি"], "bye": ["À bientôt", "ફરી મળીશું", "পুনৰ লগ পাম"], "thanks": ["Merci", "આભાર", "ধন্যবাদ"], "welcome": ["Je vous en prie", "કંઈ વાંધો નહીં", "একো কথা নাই"], "please": ["S’il vous plaît", "મહેરબાની કરીને", "অনুগ্ৰহ কৰি"], "sorry": ["Désolé", "માફ કરશો", "ক্ষমা কৰিব"], "yes": ["Oui", "હા", "হয়"], "no": ["Non", "ના", "নহয়"], "name-q": ["Comment vous appelez-vous ?", "તમારું નામ શું છે?", "আপোনাৰ নাম কি?"], "name-is": ["Je m’appelle …", "મારું નામ … છે.", "মোৰ নাম …"], "from-q": ["D’où venez-vous ?", "તમે ક્યાંથી આવો છો?", "আপুনি ক’ৰ পৰা আহিছে?"], "from-india": ["Je viens de l’Inde.", "હું ભારતથી આવ્યો છું.", "মই ভাৰতৰ পৰা আহিছোঁ।"], "nice": ["Enchanté de faire votre connaissance.", "તમને મળીને આનંદ થયો.", "আপোনাক লগ পাই ভাল লাগিল।"], "how": ["Comment allez-vous ?", "તમે કેમ છો?", "আপুনি কেনে আছে?"], "fine": ["Je vais bien.", "હું મજામાં છું.", "মই ভালে আছোঁ।"], "dont-understand": ["Je ne comprends pas.", "મને સમજાયું નહીં.", "মই বুজি পোৱা নাই।"], "english-q": ["Parlez-vous anglais ?", "શું તમે અંગ્રેજી બોલો છો?", "আপুনি ইংৰাজী কয়নে?"], "slowly": ["Parlez lentement, s’il vous plaît.", "મહેરબાની કરીને ધીમે બોલો.", "অনুগ্ৰহ কৰি লাহে লাহে কওক।"], "price": ["Combien ça coûte ?", "આની કિંમત કેટલી છે?", "এইটোৰ দাম কিমান?"], "toilet": ["Où sont les toilettes ?", "શૌચાલય ક્યાં છે?", "শৌচালয় ক’ত?"], "help": ["J’ai besoin d’aide.", "મને મદદની જરૂર છે.", "মোক সহায় লাগে।"], "water": ["De l’eau, s’il vous plaît.", "મહેરબાની કરીને પાણી આપો.", "অনুগ্ৰহ কৰি পানী দিয়ক।"], "hungry": ["J’ai faim.", "મને ભૂખ લાગી છે.", "মোৰ ভোক লাগিছে।"], "delicious": ["Le repas est délicieux.", "ભોજન ખૂબ સ્વાદિષ્ટ છે.", "আহাৰ বহুত সুস্বাদু।"], "bus": ["Où est l’arrêt de bus ?", "બસ સ્ટોપ ક્યાં છે?", "বাছ ষ্টপ ক’ত?"], "doctor": ["Appelez un médecin, s’il vous plaît.", "મહેરબાની કરીને ડૉક્ટરને બોલાવો.", "অনুগ্ৰহ কৰি ডাক্তৰ মাতক।"], "time": ["Quelle heure est-il ?", "અત્યારે કેટલા વાગ્યા છે?", "এতিয়া কিমান বাজিছে?"], "learn": ["Je veux apprendre le français.", "મારે ગુજરાતી શીખવી છે.", "মই অসমীয়া শিকিব বিচাৰোঁ।"], "today": ["Aujourd’hui", "આજે", "আজি"], "tomorrow": ["Demain", "કાલે", "কাইলৈ"], "yesterday": ["Hier", "ગઈકાલે", "কালি"], "n-one": ["Un", "એક", "এক"], "n-two": ["Deux", "બે", "দুই"], "n-three": ["Trois", "ત્રણ", "তিনি"], "n-four": ["Quatre", "ચાર", "চাৰি"], "n-five": ["Cinq", "પાંચ", "পাঁচ"], "n-six": ["Six", "છ", "ছয়"], "n-seven": ["Sept", "સાત", "সাত"], "n-eight": ["Huit", "આઠ", "আঠ"], "n-nine": ["Neuf", "નવ", "ন"], "n-ten": ["Dix", "દસ", "দহ"], "mon": ["Lundi", "સોમવાર", "সোমবাৰ"], "tue": ["Mardi", "મંગળવાર", "মঙ্গলবাৰ"], "wed": ["Mercredi", "બુધવાર", "বুধবাৰ"], "thu": ["Jeudi", "ગુરુવાર", "বৃহস্পতিবাৰ"], "fri": ["Vendredi", "શુક્રવાર", "শুক্ৰবাৰ"], "sat": ["Samedi", "શનિવાર", "শনিবাৰ"], "sun": ["Dimanche", "રવિવાર", "দেওবাৰ"], "rice": ["Du riz", "ભાત", "ভাত"], "bread": ["Du pain", "બ્રેડ", "পাউৰুটি"], "tea": ["Du thé", "ચા", "চাহ"], "coffee": ["Du café", "કૉફી", "কফি"], "milk": ["Du lait", "દૂધ", "গাখীৰ"], "veg": ["Des légumes", "શાકભાજી", "পাচলি"], "fruit": ["Des fruits", "ફળ", "ফল"], "vegetarian": ["Je suis végétarien.", "હું શાકાહારી છું.", "মই নিৰামিষভোজী।"], "notspicy": ["Pas épicé, s’il vous plaît.", "મહેરબાની કરીને તીખું નહીં.", "অনুগ্ৰহ কৰি জলফাই নিদিব।"], "bill": ["L’addition, s’il vous plaît.", "મહેરબાની કરીને બિલ આપો.", "অনুগ্ৰহ কৰি বিলটো দিয়ক।"], "station": ["Où est la gare ?", "રેલવે સ્ટેશન ક્યાં છે?", "ৰেল ষ্টেচন ক’ত?"], "airport": ["Où est l’aéroport ?", "એરપોર્ટ ક્યાં છે?", "বিমানবন্দৰ ক’ত?"], "hotel": ["Où est l’hôtel ?", "હોટેલ ક્યાં છે?", "হোটেল ক’ত?"], "taxi": ["J’ai besoin d’un taxi.", "મને ટેક્સી જોઈએ છે.", "মোক এখন টেক্সী লাগে।"], "far": ["C’est à quelle distance ?", "કેટલું દૂર છે?", "কিমান দূৰ?"], "left": ["Tournez à gauche.", "ડાબી બાજુ વળો.", "বাওঁফালে ঘূৰক।"], "right": ["Tournez à droite.", "જમણી બાજુ વળો.", "সোঁফালে ঘূৰক।"], "straight": ["Allez tout droit.", "સીધા જાઓ.", "পোনে যাওক।"], "stop": ["Arrêtez-vous ici, s’il vous plaît.", "મહેરબાની કરીને અહીં રોકો.", "অনুগ্ৰহ কৰি ইয়াতে ৰখাওক।"], "ticket": ["Un billet, s’il vous plaît.", "મહેરબાની કરીને એક ટિકિટ આપો.", "অনুগ্ৰহ কৰি এখন টিকট দিয়ক।"], "hospital": ["Où est l’hôpital ?", "હોસ્પિટલ ક્યાં છે?", "চিকিৎসালয় ক’ত?"], "lost": ["Je suis perdu.", "હું રસ્તો ભૂલી ગયો છું.", "মই বাট হেৰুৱালোঁ।"], "expensive": ["C’est trop cher.", "આ બહુ મોંઘું છે.", "এইটো বেছি দামী।"], "reduce": ["Pouvez-vous baisser le prix ?", "શું તમે ભાવ ઘટાડી શકો?", "আপুনি দাম অলপ কমাব পাৰিবনে?"], "take": ["Je prends celui-ci.", "હું આ લઈશ.", "মই এইটো ল’ম।"], "card": ["Acceptez-vous les cartes ?", "શું તમે કાર્ડ સ્વીકારો છો?", "আপুনি কাৰ্ড লয়নে?"], "market": ["Où est le marché ?", "બજાર ક્યાં છે?", "বজাৰ ক’ত?"], "another": ["Montrez-m’en un autre, s’il vous plaît.", "મહેરબાની કરીને બીજું બતાવો.", "অনুগ্ৰহ কৰি আন এটা দেখুৱাওক।"], "sick": ["Je ne me sens pas bien.", "મારી તબિયત સારી નથી.", "মোৰ শৰীৰ ভাল নহয়।"], "headache": ["J’ai mal à la tête.", "મને માથું દુખે છે.", "মোৰ মূৰ বিষাইছে।"], "police": ["Appelez la police, s’il vous plaît.", "મહેરબાની કરીને પોલીસને બોલાવો.", "অনুগ্ৰহ কৰি আৰক্ষী মাতক।"], "ambulance": ["Appelez une ambulance, s’il vous plaît.", "મહેરબાની કરીને એમ્બ્યુલન્સ બોલાવો.", "অনুগ্ৰহ কৰি এম্বুলেন্স মাতক।"], "medicine": ["J’ai besoin de médicaments.", "મને દવા જોઈએ છે.", "মোক ঔষধ লাগে।"], "hurts": ["J’ai mal ici.", "અહીં દુખે છે.", "ইয়াত বিষাইছে।"], "love": ["Je t’aime.", "હું તને પ્રેમ કરું છું.", "মই তোমাক ভালপাওঁ।"], "happy": ["Je suis heureux.", "હું ખુશ છું.", "মই সুখী।"], "tired": ["Je suis fatigué.", "હું થાકી ગયો છું.", "মই ভাগৰুৱা অনুভৱ কৰিছোঁ।"], "friend": ["Voici mon ami.", "આ મારો મિત્ર છે.", "ইও মোৰ বন্ধু।"], "family": ["Voici ma famille.", "આ મારો પરિવાર છે.", "এয়া মোৰ পৰিয়াল।"], "congrats": ["Félicitations !", "અભિનંદન!", "অভিনন্দন!"], "birthday": ["Joyeux anniversaire !", "જન્મદિવસની શુભેચ્છાઓ!", "জন্মদিনৰ শুভেচ্ছা!"], "luck": ["Bonne chance !", "શુભેચ્છાઓ!", "শুভকামনা!"], "n-eleven": ["Onze", "અગિયાર", "এঘাৰ"], "n-twelve": ["Douze", "બાર", "বাৰ"], "n-fifteen": ["Quinze", "પંદર", "পোন্ধৰ"], "n-twenty": ["Vingt", "વીસ", "বিশ"], "n-thirty": ["Trente", "ત્રીસ", "ত্ৰিশ"], "n-fifty": ["Cinquante", "પચાસ", "পঞ্চাশ"], "n-hundred": ["Cent", "સો", "এশ"], "n-thousand": ["Mille", "હજાર", "হাজাৰ"]};
  B.PHRASES.forEach(function (p) { var r = OLD3[p.id]; if (r) L3.forEach(function (l, i) { p[l] = r[i]; }); });
  var NL = ['te', 'hi', 'kn', 'ta', 'ml', 'bn', 'mr', 'ko', 'es', 'de', 'fr', 'gu', 'as'];
  var NEW = [["little", "talk", "Only a little.", "కొంచెం మాత్రమే.", "थोड़ा-सा ही।", "ಸ್ವಲ್ಪ ಮಾತ್ರ.", "கொஞ்சம் தான்.", "കുറച്ച് മാത്രം.", "অল্প একটু।", "थोडंसंच.", "조금만요.", "Solo un poco.", "Nur ein bisschen.", "Seulement un peu.", "થોડું જ.", "অলপহে।"], ["nice-too", "talk", "Nice to meet you too.", "మిమ్మల్ని కలవడం నాకూ సంతోషం.", "मुझे भी आपसे मिलकर खुशी हुई।", "ನನಗೂ ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿ ಸಂತೋಷವಾಯಿತು.", "உங்களைச் சந்தித்ததில் எனக்கும் மகிழ்ச்சி.", "നിങ്ങളെ കണ്ടതിൽ എനിക്കും സന്തോഷം.", "আমারও আপনার সঙ্গে দেখা হয়ে ভালো লাগল।", "मलाही तुम्हाला भेटून आनंद झाला.", "저도 만나서 반갑습니다.", "Encantado de conocerle también.", "Freut mich auch.", "Moi aussi, enchanté.", "મને પણ તમને મળીને આનંદ થયો.", "মোকো আপোনাক লগ পাই ভাল লাগিল।"], ["table-how-many", "food", "How many people?", "ఎంతమంది?", "कितने लोग हैं?", "ಎಷ್ಟು ಜನ?", "எத்தனை பேர்?", "എത്ര പേരുണ്ട്?", "কতজন?", "किती जण आहात?", "몇 분이세요?", "¿Cuántas personas?", "Für wie viele Personen?", "Combien de personnes ?", "કેટલા લોકો છો?", "কিমান জন?"], ["table-two", "food", "A table for two, please.", "దయచేసి ఇద్దరికి టేబుల్ ఇవ్వండి.", "कृपया दो लोगों के लिए मेज़ दीजिए।", "ದಯವಿಟ್ಟು ಇಬ್ಬರಿಗೆ ಟೇಬಲ್ ಕೊಡಿ.", "தயவுசெய்து இருவருக்கு ஒரு மேசை வேண்டும்.", "ദയവായി രണ്ടുപേർക്ക് ഒരു മേശ വേണം.", "দয়া করে দুজনের জন্য একটা টেবিল দিন।", "कृपया दोघांसाठी टेबल द्या.", "두 명 자리로 부탁합니다.", "Una mesa para dos, por favor.", "Einen Tisch für zwei, bitte.", "Une table pour deux, s’il vous plaît.", "મહેરબાની કરીને બે જણ માટે ટેબલ આપો.", "অনুগ্ৰহ কৰি দুজনৰ বাবে এখন টেবুল দিয়ক।"], ["drink-q", "food", "What would you like to drink?", "మీరు ఏం తాగుతారు?", "आप क्या पीना चाहेंगे?", "ನೀವು ಏನು ಕುಡಿಯುತ್ತೀರಿ?", "நீங்கள் என்ன குடிக்க விரும்புகிறீர்கள்?", "നിങ്ങൾ എന്താണ് കുടിക്കുക?", "আপনি কী পান করবেন?", "तुम्ही काय प्याल?", "음료는 무엇으로 하시겠어요?", "¿Qué desea beber?", "Was möchten Sie trinken?", "Que souhaitez-vous boire ?", "તમે શું પીશો?", "আপুনি কি পান কৰিব?"], ["eat-q", "food", "What would you like to eat?", "మీరు ఏం తింటారు?", "आप क्या खाना चाहेंगे?", "ನೀವು ಏನು ತಿನ್ನುತ್ತೀರಿ?", "நீங்கள் என்ன சாப்பிட விரும்புகிறீர்கள்?", "നിങ്ങൾ എന്താണ് കഴിക്കുക?", "আপনি কী খাবেন?", "तुम्ही काय खाणार?", "무엇을 드시겠어요?", "¿Qué desea comer?", "Was möchten Sie essen?", "Que souhaitez-vous manger ?", "તમે શું જમશો?", "আপুনি কি খাব?"], ["order-rice", "food", "I would like rice, please.", "నాకు అన్నం కావాలి.", "मुझे चावल चाहिए।", "ನನಗೆ ಅನ್ನ ಬೇಕು.", "எனக்கு சாதம் வேண்டும்.", "എനിക്ക് ചോറ് വേണം.", "আমি ভাত নেব।", "मला भात हवा आहे.", "밥을 주세요.", "Quisiera arroz, por favor.", "Ich hätte gern Reis.", "Je voudrais du riz, s’il vous plaît.", "મને ભાત જોઈએ છે.", "মোক ভাত লাগে।"], ["spicy-q", "food", "Would you like it spicy?", "కారంగా కావాలా?", "क्या आपको तीखा चाहिए?", "ಖಾರ ಬೇಕಾ?", "காரமாக வேண்டுமா?", "എരിവ് വേണോ?", "ঝাল চান?", "तिखट हवे का?", "맵게 해 드릴까요?", "¿Lo quiere picante?", "Möchten Sie es scharf?", "Vous le voulez épicé ?", "તીખું જોઈએ છે?", "জলফাই দিম নেকি?"], ["anything-else", "food", "Anything else?", "ఇంకేమైనా కావాలా?", "और कुछ चाहिए?", "ಇನ್ನೇನಾದರೂ ಬೇಕಾ?", "வேறு ஏதாவது வேண்டுமா?", "വേറെ എന്തെങ്കിലും വേണോ?", "আর কিছু লাগবে?", "आणखी काही हवे का?", "더 필요하신 것 있으세요?", "¿Algo más?", "Sonst noch etwas?", "Autre chose ?", "બીજું કંઈ જોઈએ છે?", "আৰু একো লাগিবনে?"], ["need-help-q", "talk", "Do you need help?", "మీకు సహాయం కావాలా?", "क्या आपको मदद चाहिए?", "ನಿಮಗೆ ಸಹಾಯ ಬೇಕಾ?", "உங்களுக்கு உதவி வேண்டுமா?", "നിങ്ങൾക്ക് സഹായം വേണോ?", "আপনার কি সাহায্য লাগবে?", "तुम्हाला मदत हवी आहे का?", "도움이 필요하세요?", "¿Necesita ayuda?", "Brauchen Sie Hilfe?", "Avez-vous besoin d’aide ?", "શું તમને મદદ જોઈએ છે?", "আপোনাক সহায় লাগিবনে?"], ["where-go", "travel", "Where do you want to go?", "మీరు ఎక్కడికి వెళ్ళాలి?", "आप कहाँ जाना चाहते हैं?", "ನೀವು ಎಲ್ಲಿಗೆ ಹೋಗಬೇಕು?", "நீங்கள் எங்கே போக வேண்டும்?", "നിങ്ങൾക്ക് എവിടെ പോകണം?", "আপনি কোথায় যেতে চান?", "तुम्हाला कुठे जायचे आहे?", "어디로 가고 싶으세요?", "¿A dónde quiere ir?", "Wohin möchten Sie gehen?", "Où voulez-vous aller ?", "તમારે ક્યાં જવું છે?", "আপুনি ক’লৈ যাব বিচাৰে?"], ["straight-then-left", "travel", "Go straight, then turn left.", "సూటిగా వెళ్ళి, తర్వాత ఎడమవైపు తిరగండి.", "सीधे जाइए, फिर बाएँ मुड़िए।", "ನೇರವಾಗಿ ಹೋಗಿ, ನಂತರ ಎಡಕ್ಕೆ ತಿರುಗಿ.", "நேராகப் போய், பிறகு இடதுபுறம் திரும்புங்கள்.", "നേരെ പോയി, പിന്നെ ഇടത്തോട്ട് തിരിയുക.", "সোজা যান, তারপর বাঁয়ে ঘুরুন।", "सरळ जा, मग डावीकडे वळा.", "직진한 다음 왼쪽으로 도세요.", "Siga recto y luego gire a la izquierda.", "Gehen Sie geradeaus und dann links.", "Allez tout droit, puis tournez à gauche.", "સીધા જાઓ, પછી ડાબી બાજુ વળો.", "পোনে যাওক, তাৰ পিছত বাওঁফালে ঘূৰক।"], ["five-min-walk", "travel", "It is five minutes on foot.", "నడిస్తే ఐదు నిమిషాలు పడుతుంది.", "पैदल पाँच मिनट लगते हैं।", "ನಡೆದರೆ ಐದು ನಿಮಿಷ.", "நடந்தால் ஐந்து நிமிடம்.", "നടന്നാൽ അഞ്ച് മിനിറ്റ്.", "হেঁটে পাঁচ মিনিট লাগে।", "चालत पाच मिनिटे लागतात.", "걸어서 5분 걸려요.", "Está a cinco minutos andando.", "Es sind fünf Minuten zu Fuß.", "C’est à cinq minutes à pied.", "ચાલીને પાંચ મિનિટ લાગે છે.", "খোজ কাঢ়ি গ’লে পাঁচ মিনিট লাগে।"], ["help-you-q", "shop", "Can I help you?", "నేను మీకు సహాయం చేయగలనా?", "क्या मैं आपकी मदद कर सकता हूँ?", "ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲೇ?", "நான் உங்களுக்கு உதவலாமா?", "ഞാൻ സഹായിക്കണോ?", "আমি কি আপনাকে সাহায্য করতে পারি?", "मी तुम्हाला मदत करू का?", "도와드릴까요?", "¿En qué puedo ayudarle?", "Kann ich Ihnen helfen?", "Puis-je vous aider ?", "હું તમારી શું મદદ કરી શકું?", "মই আপোনাক সহায় কৰিব পাৰোঁনে?"], ["price-500", "shop", "It is five hundred rupees.", "ఐదు వందల రూపాయలు.", "पाँच सौ रुपये हैं।", "ಐನೂರು ರೂಪಾಯಿ.", "ஐந்நூறு ரூபாய்.", "അഞ്ഞൂറ് രൂപയാണ്.", "পাঁচশো টাকা।", "पाचशे रुपये आहेत.", "오백 루피예요.", "Son quinientas rupias.", "Es kostet fünfhundert Rupien.", "Ça fait cinq cents roupies.", "પાંચસો રૂપિયા છે.", "পাঁচশ টকা।"], ["price-400", "shop", "I can give it for four hundred.", "నాలుగు వందలకు ఇస్తాను.", "मैं इसे चार सौ में दे सकता हूँ।", "ನಾನು ನಾನೂರಕ್ಕೆ ಕೊಡುತ್ತೇನೆ.", "நாநூறுக்குத் தருகிறேன்.", "നാനൂറിന് തരാം.", "আমি চারশোতে দিতে পারি।", "मी हे चारशेला देऊ शकतो.", "사백에 드릴게요.", "Puedo dárselo por cuatrocientas.", "Ich gebe es Ihnen für vierhundert.", "Je peux vous le laisser à quatre cents.", "હું તે ચારસોમાં આપી શકું.", "মই এইটো চাৰিশ টকাত দিব পাৰোঁ।"], ["cash-or-card", "shop", "Cash or card?", "నగదా లేక కార్డా?", "नकद या कार्ड?", "ನಗದೋ ಕಾರ್ಡೋ?", "பணமா அல்லது கார்டா?", "പണമോ കാർഡോ?", "নগদ না কার্ড?", "रोख की कार्ड?", "현금이세요, 카드세요?", "¿Efectivo o tarjeta?", "Bar oder mit Karte?", "Espèces ou carte ?", "રોકડ કે કાર્ડ?", "নগদ নে কাৰ্ড?"], ["pay-card", "shop", "I will pay by card.", "నేను కార్డుతో చెల్లిస్తాను.", "मैं कार्ड से भुगतान करूँगा।", "ನಾನು ಕಾರ್ಡ್‌ನಿಂದ ಪಾವತಿಸುತ್ತೇನೆ.", "நான் கார்டில் பணம் செலுத்துகிறேன்.", "ഞാൻ കാർഡ് ഉപയോഗിച്ച് പണമടയ്ക്കാം.", "আমি কার্ডে টাকা দেব।", "मी कार्डने पैसे देईन.", "카드로 계산할게요.", "Pagaré con tarjeta.", "Ich zahle mit Karte.", "Je paierai par carte.", "હું કાર્ડથી ચૂકવીશ.", "মই কাৰ্ডেৰে দাম দিম।"], ["problem-q", "health", "What is the problem?", "సమస్య ఏమిటి?", "क्या समस्या है?", "ಸಮಸ್ಯೆ ಏನು?", "என்ன பிரச்சினை?", "എന്താണ് പ്രശ്നം?", "সমস্যা কী?", "काय त्रास आहे?", "어디가 불편하세요?", "¿Cuál es el problema?", "Was fehlt Ihnen?", "Quel est le problème ?", "શું તકલીફ છે?", "কি সমস্যা?"], ["where-hurt", "health", "Where does it hurt?", "ఎక్కడ నొప్పిగా ఉంది?", "कहाँ दर्द हो रहा है?", "ಎಲ್ಲಿ ನೋವಾಗುತ್ತಿದೆ?", "எங்கே வலிக்கிறது?", "എവിടെയാണ് വേദന?", "কোথায় ব্যথা করছে?", "कुठे दुखत आहे?", "어디가 아프세요?", "¿Dónde le duele?", "Wo tut es weh?", "Où avez-vous mal ?", "ક્યાં દુખે છે?", "ক’ত বিষাইছে?"], ["fever-q", "health", "Do you have a fever?", "మీకు జ్వరం ఉందా?", "क्या आपको बुखार है?", "ನಿಮಗೆ ಜ್ವರ ಇದೆಯಾ?", "உங்களுக்குக் காய்ச்சல் இருக்கிறதா?", "നിങ്ങൾക്ക് പനിയുണ്ടോ?", "আপনার কি জ্বর আছে?", "तुम्हाला ताप आहे का?", "열이 있으세요?", "¿Tiene fiebre?", "Haben Sie Fieber?", "Avez-vous de la fièvre ?", "શું તમને તાવ છે?", "আপোনাৰ জ্বৰ আছেনে?"], ["since-yesterday", "health", "Yes, since yesterday.", "అవును, నిన్నటి నుండి.", "हाँ, कल से।", "ಹೌದು, ನಿನ್ನೆಯಿಂದ.", "ஆம், நேற்றிலிருந்து.", "അതെ, ഇന്നലെ മുതൽ.", "হ্যাঁ, গতকাল থেকে।", "हो, कालपासून.", "네, 어제부터요.", "Sí, desde ayer.", "Ja, seit gestern.", "Oui, depuis hier.", "હા, ગઈકાલથી.", "হয়, কালিৰে পৰা।"], ["medicine-twice", "health", "Take this medicine twice a day.", "ఈ మందు రోజుకు రెండుసార్లు వేసుకోండి.", "यह दवा दिन में दो बार लीजिए।", "ಈ ಔಷಧಿಯನ್ನು ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ ತೆಗೆದುಕೊಳ್ಳಿ.", "இந்த மருந்தை தினமும் இரண்டு முறை சாப்பிடுங்கள்.", "ഈ മരുന്ന് ദിവസം രണ്ടു തവണ കഴിക്കുക.", "এই ওষুধ দিনে দুবার খান।", "हे औषध दिवसातून दोनदा घ्या.", "이 약을 하루에 두 번 드세요.", "Tome esta medicina dos veces al día.", "Nehmen Sie dieses Medikament zweimal täglich.", "Prenez ce médicament deux fois par jour.", "આ દવા દિવસમાં બે વાર લો.", "এই ঔষধ দিনত দুবাৰ খাওক।"], ["reservation-q", "travel", "Do you have a reservation?", "మీకు రిజర్వేషన్ ఉందా?", "क्या आपकी बुकिंग है?", "ನಿಮ್ಮ ಬುಕಿಂಗ್ ಇದೆಯಾ?", "உங்களிடம் முன்பதிவு இருக்கிறதா?", "നിങ്ങൾക്ക് ബുക്കിംഗ് ഉണ്ടോ?", "আপনার কি বুকিং আছে?", "तुमचे बुकिंग आहे का?", "예약하셨나요?", "¿Tiene una reserva?", "Haben Sie eine Reservierung?", "Avez-vous une réservation ?", "શું તમારું બુકિંગ છે?", "আপোনাৰ বুকিং আছেনে?"], ["have-reservation", "travel", "Yes, I have a reservation.", "అవును, నాకు రిజర్వేషన్ ఉంది.", "हाँ, मेरी बुकिंग है।", "ಹೌದು, ನನ್ನ ಬುಕಿಂಗ್ ಇದೆ.", "ஆம், என்னிடம் முன்பதிவு இருக்கிறது.", "അതെ, എനിക്ക് ബുക്കിംഗ് ഉണ്ട്.", "হ্যাঁ, আমার বুকিং আছে।", "हो, माझे बुकिंग आहे.", "네, 예약했어요.", "Sí, tengo una reserva.", "Ja, ich habe eine Reservierung.", "Oui, j’ai une réservation.", "હા, મારું બુકિંગ છે.", "হয়, মোৰ বুকিং আছে।"], ["nights-q", "travel", "How many nights?", "ఎన్ని రాత్రులు?", "कितनी रातें?", "ಎಷ್ಟು ರಾತ್ರಿ?", "எத்தனை இரவுகள்?", "എത്ര രാത്രി?", "কত রাত?", "किती रात्री?", "며칠 묵으세요?", "¿Cuántas noches?", "Wie viele Nächte?", "Pour combien de nuits ?", "કેટલી રાત?", "কিমান ৰাতি?"], ["two-nights", "travel", "Two nights.", "రెండు రాత్రులు.", "दो रातें।", "ಎರಡು ರಾತ್ರಿ.", "இரண்டு இரவுகள்.", "രണ്ട് രാത്രി.", "দুই রাত।", "दोन रात्री.", "이틀이요.", "Dos noches.", "Zwei Nächte.", "Deux nuits.", "બે રાત.", "দুটা ৰাতি।"], ["third-floor", "travel", "Your room is on the third floor.", "మీ గది మూడవ అంతస్తులో ఉంది.", "आपका कमरा तीसरी मंज़िल पर है।", "ನಿಮ್ಮ ಕೋಣೆ ಮೂರನೇ ಮಹಡಿಯಲ್ಲಿದೆ.", "உங்கள் அறை மூன்றாவது மாடியில் உள்ளது.", "നിങ്ങളുടെ മുറി മൂന്നാം നിലയിലാണ്.", "আপনার ঘর তিনতলায়।", "तुमची खोली तिसऱ्या मजल्यावर आहे.", "객실은 3층입니다.", "Su habitación está en el tercer piso.", "Ihr Zimmer ist im dritten Stock.", "Votre chambre est au troisième étage.", "તમારો રૂમ ત્રીજા માળે છે.", "আপোনাৰ কোঠাটো তৃতীয় মহলাত আছে।"], ["breakfast-incl", "travel", "Is breakfast included?", "అల్పాహారం కలిపి ఉందా?", "क्या नाश्ता शामिल है?", "ಉಪಾಹಾರ ಸೇರಿದೆಯಾ?", "காலை உணவு சேர்ந்ததா?", "പ്രഭാതഭക്ഷണം ഉൾപ്പെടുന്നുണ്ടോ?", "সকালের খাবার কি অন্তর্ভুক্ত?", "नाश्ता समाविष्ट आहे का?", "아침 식사가 포함되어 있나요?", "¿El desayuno está incluido?", "Ist das Frühstück inbegriffen?", "Le petit-déjeuner est-il compris ?", "શું નાસ્તો સામેલ છે?", "ৰাতিপুৱাৰ আহাৰ অন্তৰ্ভুক্ত নেকি?"], ["breakfast-8", "travel", "Yes, breakfast is at eight.", "అవును, అల్పాహారం ఎనిమిది గంటలకు.", "हाँ, नाश्ता आठ बजे है।", "ಹೌದು, ಉಪಾಹಾರ ಎಂಟು ಗಂಟೆಗೆ.", "ஆம், காலை உணவு எட்டு மணிக்கு.", "അതെ, പ്രഭാതഭക്ഷണം എട്ട് മണിക്കാണ്.", "হ্যাঁ, সকালের খাবার আটটায়।", "हो, नाश्ता आठ वाजता आहे.", "네, 아침 식사는 8시입니다.", "Sí, el desayuno es a las ocho.", "Ja, das Frühstück ist um acht Uhr.", "Oui, le petit-déjeuner est à huit heures.", "હા, નાસ્તો આઠ વાગ્યે છે.", "হয়, ৰাতিপুৱাৰ আহাৰ আঠ বজাত।"], ["repeat", "talk", "Could you repeat that?", "మళ్ళీ చెప్పగలరా?", "क्या आप दोहरा सकते हैं?", "ಮತ್ತೆ ಹೇಳಬಹುದೇ?", "மீண்டும் சொல்ல முடியுமா?", "ഒന്നുകൂടി പറയാമോ?", "আবার বলবেন?", "पुन्हा सांगाल का?", "다시 말씀해 주시겠어요?", "¿Puede repetirlo?", "Können Sie das wiederholen?", "Pouvez-vous répéter ?", "શું તમે ફરીથી કહેશો?", "আপুনি পুনৰ কব পাৰিবনে?"], ["what-mean", "talk", "What does this mean?", "దీని అర్థం ఏమిటి?", "इसका क्या मतलब है?", "ಇದರ ಅರ್ಥವೇನು?", "இதன் அர்த்தம் என்ன?", "ഇതിന്റെ അർത്ഥം എന്താണ്?", "এর মানে কী?", "याचा अर्थ काय आहे?", "이게 무슨 뜻이에요?", "¿Qué significa esto?", "Was bedeutet das?", "Que veut dire ceci ?", "આનો અર્થ શું છે?", "ইয়াৰ অৰ্থ কি?"], ["how-say", "talk", "How do you say this in English?", "దీన్ని ఇంగ్లీషులో ఎలా అంటారు?", "इसे अंग्रेज़ी में कैसे कहते हैं?", "ಇದನ್ನು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಹೇಗೆ ಹೇಳುತ್ತಾರೆ?", "இதை ஆங்கிலத்தில் எப்படிச் சொல்வது?", "ഇത് ഇംഗ്ലീഷിൽ എങ്ങനെ പറയും?", "এটা ইংরেজিতে কীভাবে বলে?", "हे इंग्रजीत कसे म्हणतात?", "이것을 영어로 어떻게 말해요?", "¿Cómo se dice esto en inglés?", "Wie sagt man das auf Englisch?", "Comment dit-on cela en anglais ?", "આને અંગ્રેજીમાં શું કહેવાય?", "ইয়াক ইংৰাজীত কেনেকৈ কয়?"], ["write-down", "talk", "Please write it down.", "దయచేసి రాసి ఇవ్వండి.", "कृपया इसे लिख दीजिए।", "ದಯವಿಟ್ಟು ಬರೆದುಕೊಡಿ.", "தயவுசெய்து எழுதிக் கொடுங்கள்.", "ദയവായി എഴുതിത്തരൂ.", "দয়া করে লিখে দিন।", "कृपया लिहून द्या.", "적어 주세요.", "Escríbalo, por favor.", "Bitte schreiben Sie es auf.", "Écrivez-le, s’il vous plaît.", "મહેરબાની કરીને લખી આપો.", "অনুগ্ৰহ কৰি লিখি দিয়ক।"], ["wait", "talk", "Please wait a moment.", "దయచేసి ఒక్క క్షణం ఆగండి.", "कृपया एक पल रुकिए।", "ದಯವಿಟ್ಟು ಒಂದು ಕ್ಷಣ ನಿಲ್ಲಿ.", "தயவுசெய்து ஒரு நிமிடம் காத்திருங்கள்.", "ദയവായി ഒരു നിമിഷം കാത്തിരിക്കൂ.", "দয়া করে এক মুহূর্ত অপেক্ষা করুন।", "कृपया थोडा वेळ थांबा.", "잠시만 기다려 주세요.", "Espere un momento, por favor.", "Bitte warten Sie einen Moment.", "Veuillez patienter un instant.", "મહેરબાની કરીને થોડી વાર રાહ જુઓ.", "অনুগ্ৰহ কৰি এক মুহূৰ্ত অপেক্ষা কৰক।"], ["dont-know", "talk", "I don't know.", "నాకు తెలియదు.", "मुझे नहीं पता।", "ನನಗೆ ಗೊತ್ತಿಲ್ಲ.", "எனக்குத் தெரியாது.", "എനിക്കറിയില്ല.", "আমি জানি না।", "मला माहीत नाही.", "모르겠어요.", "No lo sé.", "Ich weiß es nicht.", "Je ne sais pas.", "મને ખબર નથી.", "মই নাজানো।"], ["understand", "talk", "I understand.", "నాకు అర్థమైంది.", "मैं समझ गया।", "ನನಗೆ ಅರ್ಥವಾಯಿತು.", "எனக்குப் புரிகிறது.", "എനിക്ക് മനസ്സിലായി.", "আমি বুঝেছি।", "मला समजले.", "이해했어요.", "Entiendo.", "Ich verstehe.", "Je comprends.", "હું સમજી ગયો.", "মই বুজি পাইছোঁ।"], ["maybe", "talk", "Maybe.", "బహుశా.", "शायद।", "ಬಹುಶಃ.", "ஒருவேளை.", "ഒരുപക്ഷേ.", "হয়তো।", "कदाचित.", "아마도요.", "Quizás.", "Vielleicht.", "Peut-être.", "કદાચ.", "হয়তো।"], ["of-course", "talk", "Of course.", "తప్పకుండా.", "बिल्कुल।", "ಖಂಡಿತ.", "நிச்சயமாக.", "തീർച്ചയായും.", "অবশ্যই।", "नक्कीच.", "물론이죠.", "Por supuesto.", "Natürlich.", "Bien sûr.", "ચોક્કસ.", "অৱশ্যে।"], ["excuse", "talk", "Excuse me.", "ఏమండీ.", "सुनिए।", "ದಯವಿಟ್ಟು ಕೇಳಿ.", "கொஞ்சம் கேளுங்கள்.", "ഒന്നു കേൾക്കൂ.", "শুনুন তো।", "ऐका ना.", "실례합니다.", "Perdone.", "Verzeihung.", "Excusez-moi.", "સાંભળો ને.", "শুনিছেনে?"], ["correct", "talk", "That is correct.", "అది సరైనది.", "यह सही है।", "ಅದು ಸರಿ.", "அது சரி.", "അത് ശരിയാണ്.", "এটা ঠিক।", "ते बरोबर आहे.", "맞아요.", "Eso es correcto.", "Das stimmt.", "C’est exact.", "એ સાચું છે.", "সেয়া শুদ্ধ।"], ["really", "talk", "Really?", "నిజమా?", "सच में?", "ನಿಜವಾಗಿಯೂ?", "உண்மையாகவா?", "ശരിക്കും?", "সত্যি?", "खरंच?", "정말요?", "¿De verdad?", "Wirklich?", "Vraiment ?", "ખરેખર?", "সঁচাকৈ?"], ["can-help", "talk", "Can you help me?", "మీరు నాకు సహాయం చేయగలరా?", "क्या आप मेरी मदद कर सकते हैं?", "ನೀವು ನನಗೆ ಸಹಾಯ ಮಾಡಬಹುದೇ?", "நீங்கள் எனக்கு உதவ முடியுமா?", "നിങ്ങൾക്ക് എന്നെ സഹായിക്കാമോ?", "আপনি কি আমাকে সাহায্য করতে পারেন?", "तुम्ही माझी मदत करू शकता का?", "도와주실 수 있나요?", "¿Puede ayudarme?", "Können Sie mir helfen?", "Pouvez-vous m’aider ?", "શું તમે મારી મદદ કરી શકો?", "আপুনি মোক সহায় কৰিব পাৰিবনে?"], ["good-idea", "talk", "That is a good idea.", "అది మంచి ఆలోచన.", "यह अच्छा विचार है।", "ಅದು ಒಳ್ಳೆಯ ಯೋಚನೆ.", "அது நல்ல யோசனை.", "അത് നല്ല ആശയമാണ്.", "এটা ভালো ধারণা।", "ही चांगली कल्पना आहे.", "좋은 생각이에요.", "Es una buena idea.", "Das ist eine gute Idee.", "C’est une bonne idée.", "એ સારો વિચાર છે.", "সেয়া ভাল ধাৰণা।"], ["sad", "feel", "I am sad.", "నాకు బాధగా ఉంది.", "मैं उदास हूँ।", "ನನಗೆ ದುಃಖವಾಗಿದೆ.", "எனக்குச் சோகமாக இருக்கிறது.", "എനിക്ക് സങ്കടമുണ്ട്.", "আমার মন খারাপ।", "मी दुःखी आहे.", "슬퍼요.", "Estoy triste.", "Ich bin traurig.", "Je suis triste.", "હું દુઃખી છું.", "মোৰ দুখ লাগিছে।"], ["worried", "feel", "I am worried.", "నాకు ఆందోళనగా ఉంది.", "मुझे चिंता हो रही है।", "ನನಗೆ ಚಿಂತೆಯಾಗಿದೆ.", "எனக்குக் கவலையாக இருக்கிறது.", "എനിക്ക് ആശങ്കയുണ്ട്.", "আমি চিন্তিত।", "मला काळजी वाटते.", "걱정돼요.", "Estoy preocupado.", "Ich mache mir Sorgen.", "Je suis inquiet.", "મને ચિંતા થાય છે.", "মোৰ চিন্তা হৈছে।"], ["excited", "feel", "I am excited.", "నాకు ఉత్సాహంగా ఉంది.", "मैं उत्साहित हूँ।", "ನನಗೆ ಉತ್ಸಾಹವಾಗಿದೆ.", "எனக்கு உற்சாகமாக இருக்கிறது.", "എനിക്ക് ആവേശമുണ്ട്.", "আমি উত্তেজিত।", "मी उत्साहित आहे.", "신나요.", "Estoy emocionado.", "Ich freue mich sehr.", "Je suis enthousiaste.", "હું ઉત્સાહિત છું.", "মই উৎসাহিত।"], ["cold", "feel", "I am cold.", "నాకు చలిగా ఉంది.", "मुझे ठंड लग रही है।", "ನನಗೆ ಚಳಿಯಾಗುತ್ತಿದೆ.", "எனக்குக் குளிர்கிறது.", "എനിക്ക് തണുക്കുന്നു.", "আমার ঠান্ডা লাগছে।", "मला थंडी वाजत आहे.", "추워요.", "Tengo frío.", "Mir ist kalt.", "J’ai froid.", "મને ઠંડી લાગે છે.", "মোৰ ঠাণ্ডা লাগিছে।"], ["hot", "feel", "I am hot.", "నాకు వేడిగా ఉంది.", "मुझे गर्मी लग रही है।", "ನನಗೆ ಸೆಕೆಯಾಗುತ್ತಿದೆ.", "எனக்கு வெப்பமாக இருக்கிறது.", "എനിക്ക് ചൂടെടുക്കുന്നു.", "আমার গরম লাগছে।", "मला गरम होत आहे.", "더워요.", "Tengo calor.", "Mir ist heiß.", "J’ai chaud.", "મને ગરમી લાગે છે.", "মোৰ গৰম লাগিছে।"], ["sleepy", "feel", "I am sleepy.", "నాకు నిద్ర వస్తోంది.", "मुझे नींद आ रही है।", "ನನಗೆ ನಿದ್ರೆ ಬರುತ್ತಿದೆ.", "எனக்குத் தூக்கம் வருகிறது.", "എനിക്ക് ഉറക്കം വരുന്നു.", "আমার ঘুম পাচ্ছে।", "मला झोप येत आहे.", "졸려요.", "Tengo sueño.", "Ich bin schläfrig.", "J’ai sommeil.", "મને ઊંઘ આવે છે.", "মোৰ টোপনি আহিছে।"], ["thirsty", "feel", "I am thirsty.", "నాకు దాహంగా ఉంది.", "मुझे प्यास लगी है।", "ನನಗೆ ಬಾಯಾರಿಕೆಯಾಗಿದೆ.", "எனக்குத் தாகமாக இருக்கிறது.", "എനിക്ക് ദാഹിക്കുന്നു.", "আমার তেষ্টা পেয়েছে।", "मला तहान लागली आहे.", "목말라요.", "Tengo sed.", "Ich habe Durst.", "J’ai soif.", "મને તરસ લાગી છે.", "মোৰ পিয়াহ লাগিছে।"], ["bored", "feel", "I am bored.", "నాకు విసుగ్గా ఉంది.", "मैं ऊब गया हूँ।", "ನನಗೆ ಬೇಸರವಾಗಿದೆ.", "எனக்குச் சலிப்பாக இருக்கிறது.", "എനിക്ക് ബോറടിക്കുന്നു.", "আমার একঘেয়ে লাগছে।", "मला कंटाळा आला आहे.", "심심해요.", "Estoy aburrido.", "Mir ist langweilig.", "Je m’ennuie.", "મને કંટાળો આવે છે.", "মোৰ বিৰক্তি লাগিছে।"], ["job-q", "work", "What do you do?", "మీరు ఏం పని చేస్తారు?", "आप क्या काम करते हैं?", "ನೀವು ಏನು ಕೆಲಸ ಮಾಡುತ್ತೀರಿ?", "நீங்கள் என்ன வேலை செய்கிறீர்கள்?", "നിങ്ങൾ എന്ത് ജോലി ചെയ്യുന്നു?", "আপনি কী কাজ করেন?", "तुम्ही काय काम करता?", "무슨 일을 하세요?", "¿A qué se dedica?", "Was machen Sie beruflich?", "Que faites-vous dans la vie ?", "તમે શું કામ કરો છો?", "আপুনি কি কাম কৰে?"], ["engineer", "work", "I am an engineer.", "నేను ఇంజనీర్‌ని.", "मैं इंजीनियर हूँ।", "ನಾನು ಎಂಜಿನಿಯರ್.", "நான் ஒரு பொறியாளர்.", "ഞാൻ ഒരു എഞ്ചിനീയറാണ്.", "আমি একজন ইঞ্জিনিয়ার।", "मी अभियंता आहे.", "저는 엔지니어예요.", "Soy ingeniero.", "Ich bin Ingenieur.", "Je suis ingénieur.", "હું એન્જિનિયર છું.", "মই এজন ইঞ্জিনিয়াৰ।"], ["student", "work", "I am a student.", "నేను విద్యార్థిని.", "मैं विद्यार्थी हूँ।", "ನಾನು ವಿದ್ಯಾರ್ಥಿ.", "நான் ஒரு மாணவர்.", "ഞാൻ ഒരു വിദ്യാർത്ഥിയാണ്.", "আমি একজন ছাত্র।", "मी विद्यार्थी आहे.", "저는 학생이에요.", "Soy estudiante.", "Ich bin Student.", "Je suis étudiant.", "હું વિદ્યાર્થી છું.", "মই এজন ছাত্ৰ।"], ["busy", "work", "I am busy.", "నేను బిజీగా ఉన్నాను.", "मैं व्यस्त हूँ।", "ನಾನು ಬ್ಯುಸಿಯಾಗಿದ್ದೇನೆ.", "நான் வேலையாக இருக்கிறேன்.", "ഞാൻ തിരക്കിലാണ്.", "আমি ব্যস্ত।", "मी व्यस्त आहे.", "바빠요.", "Estoy ocupado.", "Ich bin beschäftigt.", "Je suis occupé.", "હું વ્યસ્ત છું.", "মই ব্যস্ত।"], ["free-today", "work", "I am free today.", "ఈ రోజు నేను ఖాళీగా ఉన్నాను.", "आज मैं खाली हूँ।", "ಇಂದು ನಾನು ಖಾಲಿಯಾಗಿದ್ದೇನೆ.", "இன்று நான் ஓய்வாக இருக்கிறேன்.", "ഇന്ന് ഞാൻ ഫ്രീയാണ്.", "আজ আমি ফাঁকা আছি।", "आज मी मोकळा आहे.", "오늘은 시간이 있어요.", "Hoy estoy libre.", "Heute habe ich Zeit.", "Je suis libre aujourd’hui.", "આજે હું ફ્રી છું.", "আজি মই মুকলি আছোঁ।"], ["meeting", "work", "I have a meeting today.", "ఈ రోజు నాకు మీటింగ్ ఉంది.", "आज मेरी एक बैठक है।", "ಇಂದು ನನಗೆ ಮೀಟಿಂಗ್ ಇದೆ.", "இன்று எனக்கு ஒரு கூட்டம் இருக்கிறது.", "ഇന്ന് എനിക്ക് ഒരു മീറ്റിംഗ് ഉണ്ട്.", "আজ আমার একটা মিটিং আছে।", "आज माझी एक बैठक आहे.", "오늘 회의가 있어요.", "Hoy tengo una reunión.", "Ich habe heute ein Meeting.", "J’ai une réunion aujourd’hui.", "આજે મારી એક મીટિંગ છે.", "আজি মোৰ এখন সভা আছে।"], ["call-me", "work", "Please call me.", "దయచేసి నాకు ఫోన్ చేయండి.", "कृपया मुझे फ़ोन कीजिए।", "ದಯವಿಟ್ಟು ನನಗೆ ಕರೆ ಮಾಡಿ.", "தயவுசெய்து என்னை அழையுங்கள்.", "ദയവായി എന്നെ വിളിക്കൂ.", "দয়া করে আমাকে ফোন করুন।", "कृपया मला फोन करा.", "저에게 전화해 주세요.", "Llámeme, por favor.", "Bitte rufen Sie mich an.", "Appelez-moi, s’il vous plaît.", "મહેરબાની કરીને મને ફોન કરો.", "অনুগ্ৰহ কৰি মোক ফোন কৰক।"], ["phone-q", "work", "What is your phone number?", "మీ ఫోన్ నంబర్ ఏమిటి?", "आपका फ़ोन नंबर क्या है?", "ನಿಮ್ಮ ಫೋನ್ ನಂಬರ್ ಏನು?", "உங்கள் தொலைபேசி எண் என்ன?", "നിങ്ങളുടെ ഫോൺ നമ്പർ എന്താണ്?", "আপনার ফোন নম্বর কত?", "तुमचा फोन नंबर काय आहे?", "전화번호가 어떻게 되세요?", "¿Cuál es su número de teléfono?", "Wie ist Ihre Telefonnummer?", "Quel est votre numéro de téléphone ?", "તમારો ફોન નંબર શું છે?", "আপোনাৰ ফোন নম্বৰ কি?"], ["wifi-q", "work", "Is there Wi-Fi here?", "ఇక్కడ వై-ఫై ఉందా?", "क्या यहाँ वाई-फ़ाई है?", "ಇಲ್ಲಿ ವೈ-ಫೈ ಇದೆಯಾ?", "இங்கே வைஃபை இருக்கிறதா?", "ഇവിടെ വൈ-ഫൈ ഉണ്ടോ?", "এখানে কি ওয়াই-ফাই আছে?", "इथे वाय-फाय आहे का?", "여기 와이파이 있나요?", "¿Hay Wi-Fi aquí?", "Gibt es hier WLAN?", "Y a-t-il du Wi-Fi ici ?", "અહીં વાઇ-ફાઇ છે?", "ইয়াত ৱাই-ফাই আছেনে?"], ["wifi-pass", "work", "What is the Wi-Fi password?", "వై-ఫై పాస్‌వర్డ్ ఏమిటి?", "वाई-फ़ाई का पासवर्ड क्या है?", "ವೈ-ಫೈ ಪಾಸ್‌ವರ್ಡ್ ಏನು?", "வைஃபை கடவுச்சொல் என்ன?", "വൈ-ഫൈ പാസ്‌വേഡ് എന്താണ്?", "ওয়াই-ফাইয়ের পাসওয়ার্ড কী?", "वाय-फायचा पासवर्ड काय आहे?", "와이파이 비밀번호가 뭐예요?", "¿Cuál es la contraseña del Wi-Fi?", "Wie lautet das WLAN-Passwort?", "Quel est le mot de passe du Wi-Fi ?", "વાઇ-ફાઇનો પાસવર્ડ શું છે?", "ৱাই-ফাইৰ পাছৱৰ্ড কি?"], ["weather-q", "home", "How is the weather today?", "ఈ రోజు వాతావరణం ఎలా ఉంది?", "आज मौसम कैसा है?", "ಇಂದು ಹವಾಮಾನ ಹೇಗಿದೆ?", "இன்று வானிலை எப்படி இருக்கிறது?", "ഇന്ന് കാലാവസ്ഥ എങ്ങനെയാണ്?", "আজ আবহাওয়া কেমন?", "आज हवामान कसे आहे?", "오늘 날씨가 어때요?", "¿Qué tiempo hace hoy?", "Wie ist das Wetter heute?", "Quel temps fait-il aujourd’hui ?", "આજે હવામાન કેવું છે?", "আজি বতৰ কেনে?"], ["hot-today", "home", "It is very hot today.", "ఈ రోజు చాలా వేడిగా ఉంది.", "आज बहुत गर्मी है।", "ಇಂದು ತುಂಬಾ ಬಿಸಿಲು.", "இன்று மிகவும் வெயிலாக இருக்கிறது.", "ഇന്ന് നല്ല ചൂടാണ്.", "আজ খুব গরম।", "आज खूप उकाडा आहे.", "오늘은 아주 더워요.", "Hoy hace mucho calor.", "Heute ist es sehr heiß.", "Il fait très chaud aujourd’hui.", "આજે બહુ ગરમી છે.", "আজি বহুত গৰম।"], ["raining", "home", "It is raining.", "వర్షం పడుతోంది.", "बारिश हो रही है।", "ಮಳೆ ಬರುತ್ತಿದೆ.", "மழை பெய்கிறது.", "മഴ പെയ്യുന്നു.", "বৃষ্টি হচ্ছে।", "पाऊस पडत आहे.", "비가 와요.", "Está lloviendo.", "Es regnet.", "Il pleut.", "વરસાદ પડે છે.", "বৰষুণ দিছে।"], ["date-q", "home", "What is the date today?", "ఈ రోజు తేదీ ఏమిటి?", "आज की तारीख़ क्या है?", "ಇಂದಿನ ದಿನಾಂಕ ಏನು?", "இன்றைய தேதி என்ன?", "ഇന്നത്തെ തീയതി എന്താണ്?", "আজ কত তারিখ?", "आज तारीख काय आहे?", "오늘 며칠이에요?", "¿Qué fecha es hoy?", "Welches Datum ist heute?", "Quelle est la date aujourd’hui ?", "આજે તારીખ શું છે?", "আজি কেইতাৰিখ?"], ["open-q", "home", "What time does it open?", "ఇది ఎన్ని గంటలకు తెరుస్తారు?", "यह कितने बजे खुलता है?", "ಇದು ಎಷ್ಟು ಗಂಟೆಗೆ ತೆರೆಯುತ್ತದೆ?", "இது எத்தனை மணிக்குத் திறக்கும்?", "ഇത് എപ്പോൾ തുറക്കും?", "এটা কখন খোলে?", "हे किती वाजता उघडते?", "몇 시에 열어요?", "¿A qué hora abre?", "Wann öffnet es?", "À quelle heure ça ouvre ?", "આ કેટલા વાગ્યે ખુલે છે?", "এইটো কেতিয়া খোলে?"], ["close-q", "home", "What time does it close?", "ఇది ఎన్ని గంటలకు మూసేస్తారు?", "यह कितने बजे बंद होता है?", "ಇದು ಎಷ್ಟು ಗಂಟೆಗೆ ಮುಚ್ಚುತ್ತದೆ?", "இது எத்தனை மணிக்கு மூடுவார்கள்?", "ഇത് എപ്പോൾ അടയ്ക്കും?", "এটা কখন বন্ধ হয়?", "हे किती वाजता बंद होते?", "몇 시에 닫아요?", "¿A qué hora cierra?", "Wann schließt es?", "À quelle heure ça ferme ?", "આ કેટલા વાગ્યે બંધ થાય છે?", "এইটো কেতিয়া বন্ধ হয়?"], ["right-now", "home", "Right now.", "ఇప్పుడే.", "अभी।", "ಈಗಲೇ.", "இப்போதே.", "ഇപ്പോൾ തന്നെ.", "এখনই।", "आत्ताच.", "지금요.", "Ahora mismo.", "Jetzt gleich.", "Tout de suite.", "હમણાં જ.", "এতিয়াই।"], ["come-in", "home", "Please come in.", "దయచేసి లోపలికి రండి.", "कृपया अंदर आइए।", "ದಯವಿಟ್ಟು ಒಳಗೆ ಬನ್ನಿ.", "தயவுசெய்து உள்ளே வாருங்கள்.", "ദയവായി അകത്തേക്ക് വരൂ.", "দয়া করে ভেতরে আসুন।", "कृपया आत या.", "들어오세요.", "Pase, por favor.", "Bitte kommen Sie herein.", "Entrez, s’il vous plaît.", "મહેરબાની કરીને અંદર આવો.", "অনুগ্ৰহ কৰি ভিতৰলৈ আহক।"], ["sit", "home", "Please sit down.", "దయచేసి కూర్చోండి.", "कृपया बैठिए।", "ದಯವಿಟ್ಟು ಕುಳಿತುಕೊಳ್ಳಿ.", "தயவுசெய்து உட்காருங்கள்.", "ദയവായി ഇരിക്കൂ.", "দয়া করে বসুন।", "कृपया बसा.", "앉으세요.", "Siéntese, por favor.", "Bitte setzen Sie sich.", "Asseyez-vous, s’il vous plaît.", "મહેરબાની કરીને બેસો.", "অনুগ্ৰহ কৰি বহক।"], ["open-door", "home", "Please open the door.", "దయచేసి తలుపు తెరవండి.", "कृपया दरवाज़ा खोलिए।", "ದಯವಿಟ್ಟು ಬಾಗಿಲು ತೆರೆಯಿರಿ.", "தயவுசெய்து கதவைத் திறங்கள்.", "ദയവായി വാതിൽ തുറക്കൂ.", "দয়া করে দরজা খুলুন।", "कृपया दार उघडा.", "문을 열어 주세요.", "Abra la puerta, por favor.", "Bitte öffnen Sie die Tür.", "Ouvrez la porte, s’il vous plaît.", "મહેરબાની કરીને દરવાજો ખોલો.", "অনুগ্ৰহ কৰি দুৱাৰ খোলক।"], ["glass-water", "food", "A glass of water, please.", "దయచేసి ఒక గ్లాసు నీళ్ళు ఇవ్వండి.", "कृपया एक गिलास पानी दीजिए।", "ದಯವಿಟ್ಟು ಒಂದು ಲೋಟ ನೀರು ಕೊಡಿ.", "தயவுசெய்து ஒரு டம்ளர் தண்ணீர் தாருங்கள்.", "ദയവായി ഒരു ഗ്ലാസ് വെള്ളം തരൂ.", "দয়া করে এক গ্লাস জল দিন।", "कृपया एक ग्लास पाणी द्या.", "물 한 잔 주세요.", "Un vaso de agua, por favor.", "Ein Glas Wasser, bitte.", "Un verre d’eau, s’il vous plaît.", "મહેરબાની કરીને એક ગ્લાસ પાણી આપો.", "অনুগ্ৰহ কৰি এগিলাছ পানী দিয়ক।"], ["breakfast-q", "food", "What is for breakfast?", "అల్పాహారానికి ఏముంది?", "नाश्ते में क्या है?", "ಉಪಾಹಾರಕ್ಕೆ ಏನಿದೆ?", "காலை உணவுக்கு என்ன இருக்கிறது?", "പ്രഭാതഭക്ഷണത്തിന് എന്താണുള്ളത്?", "সকালের খাবারে কী আছে?", "नाश्त्याला काय आहे?", "아침 식사로 뭐가 있어요?", "¿Qué hay de desayuno?", "Was gibt es zum Frühstück?", "Qu’y a-t-il au petit-déjeuner ?", "નાસ્તામાં શું છે?", "ৰাতিপুৱাৰ আহাৰত কি আছে?"], ["lunch", "food", "Let's have lunch.", "భోజనం చేద్దాం రండి.", "चलिए, दोपहर का खाना खाते हैं।", "ಊಟ ಮಾಡೋಣ ಬನ್ನಿ.", "மதிய உணவு சாப்பிடலாம்.", "നമുക്ക് ഉച്ചഭക്ഷണം കഴിക്കാം.", "চলুন, দুপুরের খাবার খাই।", "चला, दुपारचे जेवण करूया.", "점심 먹어요.", "Vamos a comer.", "Lass uns zu Mittag essen.", "Allons déjeuner.", "ચાલો, બપોરનું ભોજન કરીએ.", "আহক, দুপৰীয়াৰ আহাৰ খাওঁ।"], ["dinner-ready", "food", "Dinner is ready.", "రాత్రి భోజనం సిద్ధంగా ఉంది.", "रात का खाना तैयार है।", "ರಾತ್ರಿ ಊಟ ಸಿದ್ಧವಾಗಿದೆ.", "இரவு உணவு தயாராக இருக்கிறது.", "അത്താഴം തയ്യാറാണ്.", "রাতের খাবার তৈরি।", "रात्रीचे जेवण तयार आहे.", "저녁 식사가 준비됐어요.", "La cena está lista.", "Das Abendessen ist fertig.", "Le dîner est prêt.", "રાતનું ભોજન તૈયાર છે.", "ৰাতিৰ আহাৰ সাজু।"], ["more", "food", "A little more, please.", "దయచేసి కొంచెం ఇంకా వడ్డించండి.", "कृपया थोड़ा और दीजिए।", "ದಯವಿಟ್ಟು ಇನ್ನೂ ಸ್ವಲ್ಪ ಕೊಡಿ.", "தயவுசெய்து இன்னும் கொஞ்சம் தாருங்கள்.", "ദയവായി കുറച്ചു കൂടി തരൂ.", "দয়া করে আরেকটু দিন।", "कृपया थोडे आणखी द्या.", "조금 더 주세요.", "Un poco más, por favor.", "Etwas mehr, bitte.", "Encore un peu, s’il vous plaît.", "મહેરબાની કરીને થોડું વધારે આપો.", "অনুগ্ৰহ কৰি অলপ আৰু দিয়ক।"], ["enough", "food", "That is enough, thank you.", "చాలు, ధన్యవాదాలు.", "बस, धन्यवाद।", "ಸಾಕು, ಧನ್ಯವಾದಗಳು.", "போதும், நன்றி.", "മതി, നന്ദി.", "যথেষ্ট, ধন্যবাদ।", "पुरे, धन्यवाद.", "충분해요, 감사합니다.", "Es suficiente, gracias.", "Das reicht, danke.", "Ça suffit, merci.", "બસ, આભાર.", "যথেষ্ট, ধন্যবাদ।"], ["train-q", "travel", "When does the train leave?", "రైలు ఎప్పుడు బయలుదేరుతుంది?", "ट्रेन कब छूटती है?", "ರೈಲು ಯಾವಾಗ ಹೊರಡುತ್ತದೆ?", "ரயில் எப்போது புறப்படும்?", "ട്രെയിൻ എപ്പോഴാണ് പുറപ്പെടുന്നത്?", "ট্রেন কখন ছাড়ে?", "रेल्वे कधी सुटते?", "기차는 언제 출발해요?", "¿Cuándo sale el tren?", "Wann fährt der Zug ab?", "Quand part le train ?", "ટ્રેન ક્યારે ઊપડે છે?", "ৰেল কেতিয়া ওলায়?"], ["platform-q", "travel", "Which platform?", "ఏ ప్లాట్‌ఫామ్?", "कौन-सा प्लेटफ़ॉर्म?", "ಯಾವ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್?", "எந்த நடைமேடை?", "ഏത് പ്ലാറ്റ്ഫോം?", "কোন প্ল্যাটফর্ম?", "कोणता प्लॅटफॉर्म?", "몇 번 승강장이에요?", "¿Qué andén?", "Welcher Bahnsteig?", "Quel quai ?", "કયું પ્લેટફોર્મ?", "কোনটো প্লেটফৰ্ম?"], ["tickets-two", "travel", "Two tickets, please.", "దయచేసి రెండు టికెట్లు ఇవ్వండి.", "कृपया दो टिकट दीजिए।", "ದಯವಿಟ್ಟು ಎರಡು ಟಿಕೆಟ್ ಕೊಡಿ.", "தயவுசெய்து இரண்டு டிக்கெட் தாருங்கள்.", "ദയവായി രണ്ട് ടിക്കറ്റ് തരൂ.", "দয়া করে দুটো টিকিট দিন।", "कृपया दोन तिकिटे द्या.", "표 두 장 주세요.", "Dos billetes, por favor.", "Zwei Fahrkarten, bitte.", "Deux billets, s’il vous plaît.", "મહેરબાની કરીને બે ટિકિટ આપો.", "অনুগ্ৰহ কৰি দুখন টিকট দিয়ক।"], ["seat-free", "travel", "Is this seat free?", "ఈ సీటు ఖాళీగా ఉందా?", "क्या यह सीट खाली है?", "ಈ ಸೀಟು ಖಾಲಿ ಇದೆಯಾ?", "இந்த இருக்கை காலியாக இருக்கிறதா?", "ഈ സീറ്റ് ഒഴിവാണോ?", "এই সিটটা কি খালি?", "ही जागा रिकामी आहे का?", "이 자리 비어 있나요?", "¿Está libre este asiento?", "Ist dieser Platz frei?", "Cette place est-elle libre ?", "શું આ સીટ ખાલી છે?", "এই আসনটো খালী নেকি?"], ["late", "travel", "The bus is late.", "బస్సు ఆలస్యంగా వస్తోంది.", "बस देर से आ रही है।", "ಬಸ್ ತಡವಾಗಿದೆ.", "பேருந்து தாமதமாக வருகிறது.", "ബസ് വൈകിയാണ് വരുന്നത്.", "বাস দেরিতে আসছে।", "बस उशिरा येत आहे.", "버스가 늦어요.", "El autobús llega tarde.", "Der Bus hat Verspätung.", "Le bus est en retard.", "બસ મોડી છે.", "বাছ পলমকৈ আহিছে।"], ["how-long", "travel", "How long does it take?", "ఎంత సమయం పడుతుంది?", "कितना समय लगेगा?", "ಎಷ್ಟು ಸಮಯ ಬೇಕು?", "எவ்வளவு நேரம் ஆகும்?", "എത്ര സമയം എടുക്കും?", "কত সময় লাগবে?", "किती वेळ लागेल?", "얼마나 걸려요?", "¿Cuánto tarda?", "Wie lange dauert es?", "Combien de temps cela prend-il ?", "કેટલો સમય લાગશે?", "কিমান সময় লাগিব?"], ["map", "travel", "Can you show me on the map?", "మ్యాప్‌లో చూపించగలరా?", "क्या आप नक्शे पर दिखा सकते हैं?", "ನಕ್ಷೆಯಲ್ಲಿ ತೋರಿಸಬಹುದೇ?", "வரைபடத்தில் காட்ட முடியுமா?", "മാപ്പിൽ കാണിക്കാമോ?", "মানচিত্রে দেখিয়ে দেবেন?", "नकाशावर दाखवाल का?", "지도에서 보여 주시겠어요?", "¿Puede mostrármelo en el mapa?", "Können Sie es mir auf der Karte zeigen?", "Pouvez-vous me le montrer sur la carte ?", "શું તમે નકશા પર બતાવશો?", "আপুনি মানচিত্ৰত দেখুৱাব পাৰিবনে?"], ["passport", "travel", "Here is my passport.", "ఇదిగో నా పాస్‌పోర్ట్.", "यह मेरा पासपोर्ट है।", "ಇಗೋ ನನ್ನ ಪಾಸ್‌ಪೋರ್ಟ್.", "இதோ என் கடவுச்சீட்டு.", "ഇതാ എന്റെ പാസ്പോർട്ട്.", "এই যে আমার পাসপোর্ট।", "हा माझा पासपोर्ट आहे.", "여기 제 여권이에요.", "Aquí está mi pasaporte.", "Hier ist mein Reisepass.", "Voici mon passeport.", "આ મારો પાસપોર્ટ છે.", "এয়া মোৰ পাছপ’ৰ্ট।"], ["cheaper", "shop", "Do you have a cheaper one?", "ఇంకా చవకైనది ఉందా?", "क्या इससे सस्ता कोई है?", "ಇನ್ನೂ ಅಗ್ಗದ್ದು ಇದೆಯಾ?", "இன்னும் விலை குறைவானது இருக்கிறதா?", "വില കുറഞ്ഞത് ഉണ്ടോ?", "এর চেয়ে সস্তা কিছু আছে?", "यापेक्षा स्वस्त काही आहे का?", "더 싼 것 있나요?", "¿Tiene uno más barato?", "Haben Sie etwas Günstigeres?", "En avez-vous un moins cher ?", "શું આનાથી સસ્તું કંઈ છે?", "ইয়াতকৈ শস্তা কিবা আছেনে?"], ["bigger", "shop", "Do you have a bigger size?", "పెద్ద సైజ్ ఉందా?", "क्या इससे बड़ा साइज़ है?", "ದೊಡ್ಡ ಸೈಜ್ ಇದೆಯಾ?", "பெரிய அளவு இருக்கிறதா?", "വലിയ സൈസ് ഉണ്ടോ?", "আরও বড় সাইজ আছে?", "यापेक्षा मोठा आकार आहे का?", "더 큰 사이즈 있나요?", "¿Tiene una talla más grande?", "Haben Sie eine größere Größe?", "Avez-vous une taille au-dessus ?", "શું આનાથી મોટી સાઇઝ છે?", "ইয়াতকৈ ডাঙৰ আকাৰ আছেনে?"], ["try-on", "shop", "Can I try this on?", "ఇది వేసుకుని చూడవచ్చా?", "क्या मैं इसे पहनकर देख सकता हूँ?", "ಇದನ್ನು ಹಾಕಿ ನೋಡಬಹುದೇ?", "இதை அணிந்து பார்க்கலாமா?", "ഇത് ഇട്ടുനോക്കാമോ?", "এটা কি পরে দেখতে পারি?", "हे घालून पाहू शकतो का?", "입어 봐도 될까요?", "¿Puedo probármelo?", "Kann ich das anprobieren?", "Puis-je l’essayer ?", "શું હું આ પહેરી જોઈ શકું?", "মই এইটো পিন্ধি চাব পাৰোঁনে?"], ["receipt", "shop", "Please give me a receipt.", "దయచేసి రసీదు ఇవ్వండి.", "कृपया रसीद दीजिए।", "ದಯವಿಟ್ಟು ರಶೀದಿ ಕೊಡಿ.", "தயவுசெய்து ரசீது தாருங்கள்.", "ദയവായി രസീത് തരൂ.", "দয়া করে একটা রসিদ দিন।", "कृपया पावती द्या.", "영수증 주세요.", "Deme el recibo, por favor.", "Bitte geben Sie mir eine Quittung.", "Un reçu, s’il vous plaît.", "મહેરબાની કરીને રસીદ આપો.", "অনুগ্ৰহ কৰি এখন ৰচিদ দিয়ক।"], ["discount", "shop", "Is there a discount?", "డిస్కౌంట్ ఉందా?", "क्या कोई छूट है?", "ರಿಯಾಯಿತಿ ಇದೆಯಾ?", "தள்ளுபடி இருக்கிறதா?", "കിഴിവ് ഉണ്ടോ?", "কোনো ছাড় আছে?", "काही सूट आहे का?", "할인되나요?", "¿Hay descuento?", "Gibt es einen Rabatt?", "Y a-t-il une réduction ?", "કોઈ છૂટ છે?", "কোনো ৰেহাই আছেনে?"], ["open-today", "shop", "Are you open today?", "ఈ రోజు మీరు తెరిచి ఉన్నారా?", "क्या आप आज खुले हैं?", "ಇಂದು ನೀವು ತೆರೆದಿದ್ದೀರಾ?", "இன்று நீங்கள் திறந்திருக்கிறீர்களா?", "ഇന്ന് തുറന്നിട്ടുണ്ടോ?", "আপনারা কি আজ খোলা?", "तुम्ही आज उघडे आहात का?", "오늘 영업하세요?", "¿Está abierto hoy?", "Haben Sie heute geöffnet?", "Êtes-vous ouverts aujourd’hui ?", "શું તમે આજે ખુલ્લા છો?", "আপোনালোক আজি খোলা নেকি?"], ["fever", "health", "I have a fever.", "నాకు జ్వరంగా ఉంది.", "मुझे बुखार है।", "ನನಗೆ ಜ್ವರ ಇದೆ.", "எனக்குக் காய்ச்சல் இருக்கிறது.", "എനിക്ക് പനിയുണ്ട്.", "আমার জ্বর আছে।", "मला ताप आहे.", "열이 나요.", "Tengo fiebre.", "Ich habe Fieber.", "J’ai de la fièvre.", "મને તાવ છે.", "মোৰ জ্বৰ আছে।"], ["pharmacy", "health", "Where is the pharmacy?", "మందుల దుకాణం ఎక్కడ ఉంది?", "दवा की दुकान कहाँ है?", "ಔಷಧಿ ಅಂಗಡಿ ಎಲ್ಲಿದೆ?", "மருந்தகம் எங்கே இருக்கிறது?", "മെഡിക്കൽ ഷോപ്പ് എവിടെയാണ്?", "ওষুধের দোকান কোথায়?", "औषधांचे दुकान कुठे आहे?", "약국이 어디예요?", "¿Dónde está la farmacia?", "Wo ist die Apotheke?", "Où est la pharmacie ?", "દવાની દુકાન ક્યાં છે?", "ঔষধৰ দোকান ক’ত?"], ["rest", "health", "I need to rest.", "నేను విశ్రాంతి తీసుకోవాలి.", "मुझे आराम करना है।", "ನಾನು ವಿಶ್ರಾಂತಿ ತೆಗೆದುಕೊಳ್ಳಬೇಕು.", "நான் ஓய்வெடுக்க வேண்டும்.", "എനിക്ക് വിശ്രമിക്കണം.", "আমার বিশ্রাম দরকার।", "मला विश्रांती घ्यायची आहे.", "쉬어야 해요.", "Necesito descansar.", "Ich muss mich ausruhen.", "J’ai besoin de me reposer.", "મારે આરામ કરવો છે.", "মোক জিৰণি লাগে।"], ["better", "health", "I feel better now.", "ఇప్పుడు నాకు కొంచెం మెరుగ్గా ఉంది.", "अब मुझे बेहतर लग रहा है।", "ಈಗ ನನಗೆ ಉತ್ತಮ ಅನಿಸುತ್ತಿದೆ.", "இப்போது நலமாக உணர்கிறேன்.", "ഇപ്പോൾ എനിക്ക് സുഖം തോന്നുന്നു.", "এখন আমার ভালো লাগছে।", "आता मला बरे वाटत आहे.", "이제 좀 나아졌어요.", "Ahora me siento mejor.", "Jetzt geht es mir besser.", "Je me sens mieux maintenant.", "હવે મને સારું લાગે છે.", "এতিয়া মোৰ ভাল লাগিছে।"], ["how-old", "people", "How old are you?", "మీ వయసు ఎంత?", "आपकी उम्र कितनी है?", "ನಿಮ್ಮ ವಯಸ್ಸು ಎಷ್ಟು?", "உங்கள் வயது என்ன?", "നിങ്ങൾക്ക് എത്ര വയസ്സായി?", "আপনার বয়স কত?", "तुमचे वय किती आहे?", "나이가 어떻게 되세요?", "¿Cuántos años tiene?", "Wie alt sind Sie?", "Quel âge avez-vous ?", "તમારી ઉંમર કેટલી છે?", "আপোনাৰ বয়স কিমান?"], ["beautiful", "people", "It is beautiful here.", "ఇక్కడ చాలా అందంగా ఉంది.", "यहाँ बहुत सुंदर है।", "ಇಲ್ಲಿ ತುಂಬಾ ಸುಂದರವಾಗಿದೆ.", "இங்கே மிக அழகாக இருக்கிறது.", "ഇവിടെ വളരെ മനോഹരമാണ്.", "এখানটা খুব সুন্দর।", "इथे खूप सुंदर आहे.", "여기 정말 아름다워요.", "Qué bonito es esto.", "Es ist wunderschön hier.", "C’est magnifique ici.", "અહીં બહુ સુંદર છે.", "ইয়াত বহুত ধুনীয়া।"], ["miss-you", "people", "I miss you.", "నిన్ను మిస్ అవుతున్నాను.", "मुझे तुम्हारी याद आती है।", "ನನಗೆ ನಿನ್ನ ನೆನಪಾಗುತ್ತಿದೆ.", "எனக்கு உன் நினைவாகவே இருக்கிறது.", "എനിക്ക് നിന്നെ ഓർമ്മ വരുന്നു.", "আমি তোমাকে মিস করি।", "मला तुझी आठवण येते.", "보고 싶어요.", "Te echo de menos.", "Ich vermisse dich.", "Tu me manques.", "મને તમારી યાદ આવે છે.", "মই তোমাক মনত পেলাইছোঁ।"], ["take-care", "people", "Take care.", "జాగ్రత్తగా ఉండండి.", "अपना ध्यान रखिए।", "ಜಾಗ್ರತೆಯಾಗಿರಿ.", "கவனமாக இருங்கள்.", "സൂക്ഷിക്കണേ.", "নিজের যত্ন নেবেন।", "काळजी घ्या.", "몸조심하세요.", "Cuídese.", "Passen Sie auf sich auf.", "Prenez soin de vous.", "ધ્યાન રાખજો.", "নিজৰ যত্ন লব।"], ["afternoon", "greet", "Good afternoon", "శుభ మధ్యాహ్నం", "शुभ दोपहर", "ಶುಭ ಮಧ್ಯಾಹ್ನ", "இனிய மதிய வணக்கம்", "ശുഭ മധ്യാഹ്നം", "শুভ অপরাহ্ন", "शुभ दुपार", "좋은 오후예요", "Buenas tardes", "Guten Tag", "Bon après-midi", "શુભ બપોર", "শুভ অপৰাহ্ন"], ["see-tomorrow", "greet", "See you tomorrow", "రేపు కలుద్దాం", "कल मिलते हैं", "ನಾಳೆ ಸಿಗೋಣ", "நாளை சந்திப்போம்", "നാളെ കാണാം", "কাল দেখা হবে", "उद्या भेटू", "내일 봐요", "Hasta mañana", "Bis morgen", "À demain", "કાલે મળીશું", "কাইলৈ লগ পাম"], ["see-you", "greet", "See you later", "తర్వాత కలుద్దాం", "बाद में मिलते हैं", "ನಂತರ ಸಿಗೋಣ", "பிறகு சந்திப்போம்", "പിന്നെ കാണാം", "পরে দেখা হবে", "नंतर भेटू", "나중에 봐요", "Hasta luego", "Bis später", "À tout à l’heure", "પછી મળીશું", "পাছত লগ পাম"], ["live-here", "intro", "I live here", "నేను ఇక్కడే ఉంటాను", "मैं यहीं रहता हूँ", "ನಾನು ಇಲ್ಲೇ ವಾಸಿಸುತ್ತೇನೆ", "நான் இங்கேயே வசிக்கிறேன்", "ഞാൻ ഇവിടെയാണ് താമസിക്കുന്നത്", "আমি এখানেই থাকি", "मी इथेच राहतो", "저는 여기에 살아요", "Vivo aquí", "Ich wohne hier", "J’habite ici", "હું અહીં રહું છું", "মই ইয়াতে থাকোঁ"], ["learning-lang", "intro", "I am learning your language", "నేను మీ భాష నేర్చుకుంటున్నాను", "मैं आपकी भाषा सीख रहा हूँ", "ನಾನು ನಿಮ್ಮ ಭಾಷೆ ಕಲಿಯುತ್ತಿದ್ದೇನೆ", "நான் உங்கள் மொழியைக் கற்றுக்கொண்டிருக்கிறேன்", "ഞാൻ നിങ്ങളുടെ ഭാഷ പഠിക്കുകയാണ്", "আমি আপনার ভাষা শিখছি", "मी तुमची भाषा शिकत आहे", "저는 당신의 언어를 배우고 있어요", "Estoy aprendiendo su idioma", "Ich lerne Ihre Sprache", "J’apprends votre langue", "હું તમારી ભાષા શીખી રહ્યો છું", "মই আপোনাৰ ভাষা শিকি আছোঁ"], ["this-friend", "intro", "This is my friend", "ఇతను నా స్నేహితుడు", "ये मेरे दोस्त हैं", "ಇವರು ನನ್ನ ಸ್ನೇಹಿತ", "இவர் என் நண்பர்", "ഇത് എന്റെ സുഹൃത്താണ്", "ইনি আমার বন্ধু", "हे माझे मित्र आहेत", "이쪽은 제 친구예요", "Este es mi amigo", "Das ist mein Freund", "Voici mon ami", "આ મારા મિત્ર છે", "ইয়াক মোৰ বন্ধু"], ["louder", "talk", "Please speak louder", "దయచేసి కొంచెం గట్టిగా మాట్లాడండి", "कृपया ज़ोर से बोलिए", "ದಯವಿಟ್ಟು ಜೋರಾಗಿ ಮಾತನಾಡಿ", "தயவுசெய்து சத்தமாகப் பேசுங்கள்", "ദയവായി ഉറക്കെ സംസാരിക്കൂ", "দয়া করে জোরে বলুন", "कृपया मोठ्याने बोला", "좀 더 크게 말씀해 주세요", "Hable más alto, por favor", "Bitte sprechen Sie lauter", "Parlez plus fort, s’il vous plaît", "કૃપા કરીને મોટેથી બોલો", "অনুগ্ৰহ কৰি জোৰেৰে কওক"], ["agree", "talk", "I agree", "నేను ఒప్పుకుంటున్నాను", "मैं सहमत हूँ", "ನಾನು ಒಪ್ಪುತ್ತೇನೆ", "நான் ஒப்புக்கொள்கிறேன்", "ഞാൻ സമ്മതിക്കുന്നു", "আমি একমত", "मी सहमत आहे", "동의해요", "Estoy de acuerdo", "Ich stimme zu", "Je suis d’accord", "હું સહમત છું", "মই একমত"], ["disagree", "talk", "I don’t agree", "నేను ఒప్పుకోవడం లేదు", "मैं सहमत नहीं हूँ", "ನಾನು ಒಪ್ಪುವುದಿಲ್ಲ", "நான் ஒப்புக்கொள்ளவில்லை", "ഞാൻ സമ്മതിക്കുന്നില്ല", "আমি একমত নই", "मी सहमत नाही", "동의하지 않아요", "No estoy de acuerdo", "Ich stimme nicht zu", "Je ne suis pas d’accord", "હું સહમત નથી", "মই একমত নহয়"], ["moment", "talk", "Just a moment", "ఒక్క నిమిషం", "एक मिनट", "ಒಂದು ನಿಮಿಷ", "ஒரு நிமிடம்", "ഒരു നിമിഷം", "এক মুহূর্ত", "एक क्षण", "잠깐만요", "Un momento", "Einen Moment", "Un instant", "એક ક્ષણ", "এক মুহূৰ্ত"], ["whats-wrong", "talk", "What is the matter?", "ఏమైంది?", "क्या हुआ?", "ಏನಾಯಿತು?", "என்ன ஆச்சு?", "എന്താ പറ്റിയത്?", "কী হয়েছে?", "काय झालं?", "무슨 일이에요?", "¿Qué pasa?", "Was ist los?", "Que se passe-t-il ?", "શું થયું?", "কি হ’ল?"], ["going-home", "daily", "I am going home", "నేను ఇంటికి వెళ్తున్నాను", "मैं घर जा रहा हूँ", "ನಾನು ಮನೆಗೆ ಹೋಗುತ್ತಿದ್ದೇನೆ", "நான் வீட்டுக்குப் போகிறேன்", "ഞാൻ വീട്ടിലേക്ക് പോകുന്നു", "আমি বাড়ি যাচ্ছি", "मी घरी जात आहे", "저는 집에 가요", "Me voy a casa", "Ich gehe nach Hause", "Je rentre à la maison", "હું ઘરે જાઉં છું", "মই ঘৰলৈ গৈ আছোঁ"], ["lets-go", "daily", "Let’s go", "పదండి వెళ్దాం", "चलिए चलते हैं", "ಹೋಗೋಣ", "போகலாம்", "നമുക്ക് പോകാം", "চলুন যাই", "चला जाऊया", "가요", "Vamos", "Gehen wir", "Allons-y", "ચાલો જઈએ", "যাওঁ আহক"], ["ready", "daily", "I am ready", "నేను సిద్ధంగా ఉన్నాను", "मैं तैयार हूँ", "ನಾನು ಸಿದ್ಧ", "நான் தயார்", "ഞാൻ തയ്യാറാണ്", "আমি প্রস্তুত", "मी तयार आहे", "준비됐어요", "Estoy listo", "Ich bin bereit", "Je suis prêt", "હું તૈયાર છું", "মই সাজু"], ["coming", "daily", "I am coming", "నేను వస్తున్నాను", "मैं आ रहा हूँ", "ನಾನು ಬರುತ್ತಿದ್ದೇನೆ", "நான் வருகிறேன்", "ഞാൻ വരുന്നു", "আমি আসছি", "मी येत आहे", "곧 가요", "Ya voy", "Ich komme", "J’arrive", "હું આવું છું", "মই আহিছোঁ"], ["wake-up", "daily", "Wake up", "లేవండి", "उठो", "ಏಳಿ", "எழுந்திரு", "എഴുന്നേൽക്കൂ", "ওঠো", "ऊठ", "일어나요", "Despierta", "Wach auf", "Réveille-toi", "ઊઠો", "উঠা"], ["full", "food", "I am full", "నా కడుపు నిండింది", "मेरा पेट भर गया है", "ನನ್ನ ಹೊಟ್ಟೆ ತುಂಬಿದೆ", "என் வயிறு நிறைந்துவிட்டது", "എന്റെ വയർ നിറഞ്ഞു", "আমার পেট ভরে গেছে", "माझं पोट भरलं आहे", "배불러요", "Estoy lleno", "Ich bin satt", "Je n’ai plus faim", "મારું પેટ ભરાઈ ગયું છે", "মোৰ পেট ভৰি গ’ল"], ["salt", "food", "Salt, please", "ఉప్పు ఇవ్వండి", "नमक दीजिए", "ಉಪ್ಪು ಕೊಡಿ", "உப்பு கொடுங்கள்", "ഉപ്പ് തരൂ", "লবণ দিন", "मीठ द्या", "소금 좀 주세요", "Sal, por favor", "Salz, bitte", "Du sel, s’il vous plaît", "મીઠું આપો", "নিমখ দিয়ক"], ["no-sugar", "food", "Without sugar, please", "దయచేసి చక్కెర లేకుండా", "बिना चीनी के, कृपया", "ಸಕ್ಕರೆ ಇಲ್ಲದೆ", "சர்க்கரை இல்லாமல்", "പഞ്ചസാര ഇല്ലാതെ", "চিনি ছাড়া", "साखरेशिवाय", "설탕 없이 주세요", "Sin azúcar, por favor", "Ohne Zucker, bitte", "Sans sucre, s’il vous plaît", "ખાંડ વગર", "চেনী নোহোৱাকৈ"], ["fresh-q", "food", "Is this fresh?", "ఇది తాజాగా ఉందా?", "क्या यह ताज़ा है?", "ಇದು ತಾಜಾ ಇದೆಯೇ?", "இது புதியதா?", "ഇത് പുതിയതാണോ?", "এটা কি তাজা?", "हे ताजं आहे का?", "이거 신선해요?", "¿Está fresco?", "Ist das frisch?", "C’est frais ?", "શું આ તાજું છે?", "এইটো তাজা নেকি?"], ["spoon", "food", "Can I have a spoon?", "ఒక చెంచా ఇవ్వగలరా?", "क्या मुझे एक चम्मच मिल सकता है?", "ಒಂದು ಚಮಚ ಕೊಡಬಹುದೇ?", "ஒரு கரண்டி கிடைக்குமா?", "ഒരു സ്പൂൺ തരാമോ?", "একটা চামচ পাব?", "मला एक चमचा मिळेल का?", "숟가락 하나 주실 수 있어요?", "¿Me da una cuchara?", "Kann ich einen Löffel haben?", "Je peux avoir une cuillère ?", "મને એક ચમચી મળશે?", "এটা চামুচ পাব নে?"], ["atm", "travel", "Where is the nearest ATM?", "దగ్గరలో ఏటీఎం ఎక్కడ ఉంది?", "सबसे पास का एटीएम कहाँ है?", "ಹತ್ತಿರದ ಎಟಿಎಂ ಎಲ್ಲಿದೆ?", "அருகிலுள்ள ஏடிஎம் எங்கே?", "അടുത്തുള്ള എടിഎം എവിടെയാണ്?", "কাছের এটিএম কোথায়?", "जवळचे एटीएम कुठे आहे?", "가장 가까운 현금인출기가 어디예요?", "¿Dónde está el cajero automático más cercano?", "Wo ist der nächste Geldautomat?", "Où est le distributeur le plus proche ?", "નજીકનું એટીએમ ક્યાં છે?", "ওচৰৰ এটিএমটো ক’ত আছে?"], ["fare-q", "travel", "How much is the fare?", "ఛార్జీ ఎంత?", "किराया कितना है?", "ಪ್ರಯಾಣ ದರ ಎಷ್ಟು?", "கட்டணம் எவ்வளவு?", "നിരക്ക് എത്രയാണ്?", "ভাড়া কত?", "भाडे किती आहे?", "요금이 얼마예요?", "¿Cuánto cuesta el pasaje?", "Wie viel kostet die Fahrt?", "Combien coûte le trajet ?", "ભાડું કેટલું છે?", "ভাড়া কিমান?"], ["stop-here", "travel", "Please stop here", "ఇక్కడ ఆపండి", "यहाँ रोकिए", "ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ", "இங்கே நிறுத்துங்கள்", "ഇവിടെ നിർത്തൂ", "এখানে থামান", "इथे थांबवा", "여기서 세워 주세요", "Pare aquí, por favor", "Halten Sie bitte hier an", "Arrêtez-vous ici, s’il vous plaît", "અહીં ઊભા રાખો", "ইয়াতে ৰখাওক"], ["right-way-q", "travel", "Is this the right way?", "ఇదే సరైన దారా?", "क्या यही सही रास्ता है?", "ಇದೇ ಸರಿಯಾದ ದಾರಿಯೇ?", "இதுதான் சரியான வழியா?", "ഇതാണോ ശരിയായ വഴി?", "এটাই কি সঠিক রাস্তা?", "हाच योग्य रस्ता आहे का?", "이 길이 맞아요?", "¿Es este el camino correcto?", "Ist das der richtige Weg?", "C’est le bon chemin ?", "શું આ સાચો રસ્તો છે?", "এইটোৱেই নে শুদ্ধ বাট?"], ["take-address", "travel", "Please take me to this address", "నన్ను ఈ చిరునామాకు తీసుకెళ్లండి", "मुझे इस पते पर ले चलिए", "ನನ್ನನ್ನು ಈ ವಿಳಾಸಕ್ಕೆ ಕರೆದುಕೊಂಡು ಹೋಗಿ", "என்னை இந்த முகவரிக்குக் கூட்டிச் செல்லுங்கள்", "എന്നെ ഈ വിലാസത്തിലേക്ക് കൊണ്ടുപോകൂ", "আমাকে এই ঠিকানায় নিয়ে যান", "मला या पत्त्यावर घेऊन चला", "이 주소로 데려다 주세요", "Lléveme a esta dirección, por favor", "Bitte bringen Sie mich zu dieser Adresse", "Conduisez-moi à cette adresse, s’il vous plaît", "મને આ સરનામે લઈ જાઓ", "মোক এই ঠিকনালৈ লৈ যাওক"], ["other-colour", "shop", "Do you have another colour?", "ఇంకో రంగు ఉందా?", "क्या दूसरा रंग है?", "ಬೇರೆ ಬಣ್ಣ ಇದೆಯೇ?", "வேறு நிறம் இருக்கிறதா?", "മറ്റൊരു നിറം ഉണ്ടോ?", "অন্য রঙ আছে?", "दुसरा रंग आहे का?", "다른 색 있어요?", "¿Tiene otro color?", "Haben Sie eine andere Farbe?", "Avez-vous une autre couleur ?", "શું બીજો રંગ છે?", "আন ৰং আছে নে?"], ["just-looking", "shop", "I am just looking", "నేను చూస్తున్నాను అంతే", "मैं बस देख रहा हूँ", "ನಾನು ಸುಮ್ಮನೆ ನೋಡುತ್ತಿದ್ದೇನೆ", "நான் சும்மா பார்க்கிறேன்", "ഞാൻ വെറുതെ നോക്കുകയാണ്", "আমি শুধু দেখছি", "मी फक्त बघतोय", "그냥 구경하는 거예요", "Solo estoy mirando", "Ich schaue nur", "Je regarde seulement", "હું બસ જોઈ રહ્યો છું", "মই এনেই চাই আছোঁ"], ["pay-phone", "shop", "Can I pay with my phone?", "ఫోన్‌తో చెల్లించవచ్చా?", "क्या मैं फ़ोन से भुगतान कर सकता हूँ?", "ಫೋನ್‌ನಿಂದ ಪಾವತಿಸಬಹುದೇ?", "போனில் பணம் செலுத்தலாமா?", "ഫോൺ വഴി പണം നൽകാമോ?", "ফোনে টাকা দিতে পারি?", "मी फोनने पैसे देऊ शकतो का?", "휴대폰으로 결제해도 돼요?", "¿Puedo pagar con el móvil?", "Kann ich mit dem Handy bezahlen?", "Puis-je payer avec mon téléphone ?", "શું હું ફોનથી ચૂકવી શકું?", "মই ফোনেৰে পইচা দিব পাৰোনে?"], ["pack-it", "shop", "Please pack it", "దయచేసి ప్యాక్ చేయండి", "कृपया इसे पैक कर दीजिए", "ದಯವಿಟ್ಟು ಪ್ಯಾಕ್ ಮಾಡಿ", "தயவுசெய்து பேக் செய்யுங்கள்", "ദയവായി പാക്ക് ചെയ്യൂ", "দয়া করে প্যাক করে দিন", "कृपया पॅक करून द्या", "포장해 주세요", "Envuélvalo, por favor", "Bitte packen Sie es ein", "Emballez-le, s’il vous plaît", "કૃપા કરીને પેક કરી આપો", "অনুগ্ৰহ কৰি পেক কৰি দিয়ক"], ["have-cold", "health", "I have a cold", "నాకు జలుబు చేసింది", "मुझे सर्दी हो गई है", "ನನಗೆ ಶೀತವಾಗಿದೆ", "எனக்கு சளி பிடித்திருக்கிறது", "എനിക്ക് ജലദോഷമുണ്ട്", "আমার সর্দি হয়েছে", "मला सर्दी झाली आहे", "감기에 걸렸어요", "Tengo un resfriado", "Ich bin erkältet", "Je suis enrhumé", "મને શરદી થઈ છે", "মোৰ সৰ্দি হৈছে"], ["stomachache", "health", "I have a stomach ache", "నాకు కడుపు నొప్పిగా ఉంది", "मेरे पेट में दर्द है", "ನನಗೆ ಹೊಟ್ಟೆ ನೋವು ಇದೆ", "எனக்கு வயிற்று வலி", "എനിക്ക് വയറുവേദനയുണ്ട്", "আমার পেট ব্যথা করছে", "माझं पोट दुखत आहे", "배가 아파요", "Me duele el estómago", "Ich habe Bauchschmerzen", "J’ai mal au ventre", "મારા પેટમાં દુખે છે", "মোৰ পেট বিষাইছে"], ["allergic", "health", "I am allergic to this", "నాకు దీనితో అలర్జీ ఉంది", "मुझे इससे एलर्जी है", "ನನಗೆ ಇದರಿಂದ ಅಲರ್ಜಿ ಇದೆ", "எனக்கு இதனால் ஒவ்வாமை உள்ளது", "എനിക്ക് ഇതിനോട് അലർജിയുണ്ട്", "আমার এতে অ্যালার্জি আছে", "मला याची अॅलर्जी आहे", "저는 이것에 알레르기가 있어요", "Soy alérgico a esto", "Ich bin dagegen allergisch", "Je suis allergique à cela", "મને આનાથી એલર્જી છે", "মোৰ ইয়াত এলাৰ্জি আছে"], ["call-doctor", "health", "Please call a doctor", "దయచేసి డాక్టర్‌ని పిలవండి", "कृपया डॉक्टर को बुलाइए", "ದಯವಿಟ್ಟು ವೈದ್ಯರನ್ನು ಕರೆಯಿರಿ", "தயவுசெய்து மருத்துவரை அழையுங்கள்", "ദയവായി ഡോക്ടറെ വിളിക്കൂ", "দয়া করে ডাক্তার ডাকুন", "कृपया डॉक्टरांना बोलवा", "의사를 불러 주세요", "Llame a un médico, por favor", "Rufen Sie bitte einen Arzt", "Appelez un médecin, s’il vous plaît", "કૃપા કરીને ડૉક્ટરને બોલાવો", "অনুগ্ৰহ কৰি ডাক্তৰ মাতক"], ["mother", "people", "This is my mother", "ఈమె నా తల్లి", "ये मेरी माँ हैं", "ಇವರು ನನ್ನ ತಾಯಿ", "இவர் என் அம்மா", "ഇത് എന്റെ അമ്മയാണ്", "ইনি আমার মা", "ही माझी आई आहे", "이분은 제 어머니예요", "Esta es mi madre", "Das ist meine Mutter", "Voici ma mère", "આ મારી માતા છે", "ইয়াই মোৰ মা"], ["father", "people", "This is my father", "ఈయన నా తండ్రి", "ये मेरे पिता हैं", "ಇವರು ನನ್ನ ತಂದೆ", "இவர் என் அப்பா", "ഇത് എന്റെ അച്ഛനാണ്", "ইনি আমার বাবা", "हे माझे वडील आहेत", "이분은 제 아버지예요", "Este es mi padre", "Das ist mein Vater", "Voici mon père", "આ મારા પિતા છે", "ইয়াই মোৰ দেউতা"], ["brother", "people", "I have a brother", "నాకు ఒక సోదరుడు ఉన్నాడు", "मेरा एक भाई है", "ನನಗೆ ಒಬ್ಬ ಸಹೋದರನಿದ್ದಾನೆ", "எனக்கு ஒரு சகோதரர் இருக்கிறார்", "എനിക്ക് ഒരു സഹോദരനുണ്ട്", "আমার একটা ভাই আছে", "मला एक भाऊ आहे", "저는 형제가 한 명 있어요", "Tengo un hermano", "Ich habe einen Bruder", "J’ai un frère", "મારે એક ભાઈ છે", "মোৰ এজন ভাই আছে"], ["sister", "people", "I have a sister", "నాకు ఒక సోదరి ఉంది", "मेरी एक बहन है", "ನನಗೆ ಒಬ್ಬ ಸಹೋದರಿ ಇದ್ದಾಳೆ", "எனக்கு ஒரு சகோதரி இருக்கிறாள்", "എനിക്ക് ഒരു സഹോദരിയുണ്ട്", "আমার একটা বোন আছে", "मला एक बहीण आहे", "저는 자매가 한 명 있어요", "Tengo una hermana", "Ich habe eine Schwester", "J’ai une sœur", "મારે એક બહેન છે", "মোৰ এজনী ভনী আছে"], ["afraid", "feel", "I am afraid", "నాకు భయంగా ఉంది", "मुझे डर लग रहा है", "ನನಗೆ ಭಯವಾಗುತ್ತಿದೆ", "எனக்குப் பயமாக இருக்கிறது", "എനിക്ക് പേടിയാകുന്നു", "আমার ভয় করছে", "मला भीती वाटत आहे", "무서워요", "Tengo miedo", "Ich habe Angst", "J’ai peur", "મને ડર લાગે છે", "মোৰ ভয় লাগিছে"], ["proud", "feel", "I am proud of you", "నాకు నీ గురించి గర్వంగా ఉంది", "मुझे तुम पर गर्व है", "ನನಗೆ ನಿನ್ನ ಬಗ್ಗೆ ಹೆಮ್ಮೆ ಇದೆ", "உன்னைப் பற்றி எனக்குப் பெருமையாக இருக்கிறது", "എനിക്ക് നിന്നെക്കുറിച്ച് അഭിമാനമുണ്ട്", "আমি তোমার জন্য গর্বিত", "मला तुझा अभिमान वाटतो", "네가 자랑스러워", "Estoy orgulloso de ti", "Ich bin stolz auf dich", "Je suis fier de toi", "મને તારા પર ગર્વ છે", "মই তোমাৰ বাবে গৌৰৱান্বিত"], ["dont-worry", "feel", "Don’t worry", "చింతించకండి", "चिंता मत कीजिए", "ಚಿಂತಿಸಬೇಡಿ", "கவலைப்படாதீர்கள்", "വിഷമിക്കരുത്", "চিন্তা করবেন না", "काळजी करू नका", "걱정하지 마세요", "No se preocupe", "Keine Sorge", "Ne vous inquiétez pas", "ચિંતા કરશો નહીં", "চিন্তা নকৰিব"], ["office", "work", "I work in an office", "నేను ఆఫీసులో పని చేస్తాను", "मैं दफ़्तर में काम करता हूँ", "ನಾನು ಕಚೇರಿಯಲ್ಲಿ ಕೆಲಸ ಮಾಡುತ್ತೇನೆ", "நான் அலுவலகத்தில் வேலை செய்கிறேன்", "ഞാൻ ഓഫീസിൽ ജോലി ചെയ്യുന്നു", "আমি অফিসে কাজ করি", "मी कार्यालयात काम करतो", "저는 사무실에서 일해요", "Trabajo en una oficina", "Ich arbeite in einem Büro", "Je travaille dans un bureau", "હું ઓફિસમાં કામ કરું છું", "মই অফিচত কাম কৰোঁ"], ["email-me", "work", "Please email me", "దయచేసి నాకు ఈమెయిల్ చేయండి", "कृपया मुझे ईमेल कीजिए", "ದಯವಿಟ್ಟು ನನಗೆ ಇಮೇಲ್ ಮಾಡಿ", "தயவுசெய்து எனக்கு மின்னஞ்சல் அனுப்புங்கள்", "ദയവായി എനിക്ക് ഇമെയിൽ അയയ്ക്കൂ", "দয়া করে আমাকে ইমেল করুন", "कृपया मला ईमेल करा", "이메일을 보내 주세요", "Envíeme un correo, por favor", "Bitte schreiben Sie mir eine E-Mail", "Envoyez-moi un courriel, s’il vous plaît", "કૃપા કરીને મને ઇમેઇલ કરો", "অনুগ্ৰহ কৰি মোক ইমেইল কৰক"], ["lets-start", "work", "Let’s begin", "ప్రారంభిద్దాం", "शुरू करते हैं", "ಪ್ರಾರಂಭಿಸೋಣ", "தொடங்கலாம்", "തുടങ്ങാം", "শুরু করা যাক", "सुरू करूया", "시작합시다", "Empecemos", "Fangen wir an", "Commençons", "ચાલો શરૂ કરીએ", "আৰম্ভ কৰোঁ আহক"], ["light-off", "home", "Please switch off the light", "దయచేసి లైట్ ఆర్పండి", "कृपया बत्ती बंद कर दीजिए", "ದಯವಿಟ್ಟು ದೀಪ ಆರಿಸಿ", "தயவுசெய்து விளக்கை அணையுங்கள்", "ദയവായി ലൈറ്റ് ഓഫ് ചെയ്യൂ", "দয়া করে আলো নিভিয়ে দিন", "कृपया दिवा बंद करा", "불을 꺼 주세요", "Apague la luz, por favor", "Bitte machen Sie das Licht aus", "Éteignez la lumière, s’il vous plaît", "કૃપા કરીને લાઇટ બંધ કરો", "অনুগ্ৰহ কৰি পোহৰ নুমুৱাই দিয়ক"], ["window", "home", "Please close the window", "దయచేసి కిటికీ మూసివేయండి", "कृपया खिड़की बंद कर दीजिए", "ದಯವಿಟ್ಟು ಕಿಟಕಿ ಮುಚ್ಚಿ", "தயவுசெய்து ஜன்னலை மூடுங்கள்", "ദയവായി ജനൽ അടയ്ക്കൂ", "দয়া করে জানালা বন্ধ করুন", "कृपया खिडकी बंद करा", "창문을 닫아 주세요", "Cierre la ventana, por favor", "Bitte schließen Sie das Fenster", "Fermez la fenêtre, s’il vous plaît", "કૃપા કરીને બારી બંધ કરો", "অনুগ্ৰহ কৰি খিৰিকী বন্ধ কৰক"], ["five-min", "time", "Wait five minutes", "ఐదు నిమిషాలు ఆగండి", "पाँच मिनट रुकिए", "ಐದು ನಿಮಿಷ ಕಾಯಿರಿ", "ஐந்து நிமிடம் காத்திருங்கள்", "അഞ്ച് മിനിറ്റ് കാത്തിരിക്കൂ", "পাঁচ মিনিট অপেক্ষা করুন", "पाच मिनिटे थांबा", "오 분만 기다려 주세요", "Espere cinco minutos", "Warten Sie fünf Minuten", "Attendez cinq minutes", "પાંચ મિનિટ રાહ જુઓ", "পাঁচ মিনিট অপেক্ষা কৰক"], ["every-day", "time", "Every day", "ప్రతిరోజూ", "हर दिन", "ಪ್ರತಿದಿನ", "ஒவ்வொரு நாளும்", "എല്ലാ ദിവസവും", "প্রতিদিন", "दररोज", "매일", "Todos los días", "Jeden Tag", "Tous les jours", "દરરોજ", "প্ৰতিদিনে"], ["next-week", "time", "Next week", "వచ్చే వారం", "अगले हफ़्ते", "ಮುಂದಿನ ವಾರ", "அடுத்த வாரம்", "അടുത്ത ആഴ്ച", "পরের সপ্তাহে", "पुढच्या आठवड्यात", "다음 주", "La semana que viene", "Nächste Woche", "La semaine prochaine", "આવતા અઠવાડિયે", "অহা সপ্তাহত"], ["last-night", "time", "Last night", "నిన్న రాత్రి", "कल रात", "ನಿನ್ನೆ ರಾತ್ರಿ", "நேற்று இரவு", "ഇന്നലെ രാത്രി", "গতকাল রাতে", "काल रात्री", "어젯밤", "Anoche", "Gestern Abend", "Hier soir", "ગઈ કાલે રાત્રે", "কালি ৰাতি"]];
  NEW.forEach(function (r) { var o = { id: r[0], cat: r[1], en: r[2] }; NL.forEach(function (l, i) { o[l] = r[3 + i]; }); B.PHRASES.push(o); });
  // script charts for Gujarati and Assamese
  var sp = function (s) { return s.split(' '); };
  B.SCRIPTS.gu = { vowels: sp('અ આ ઇ ઈ ઉ ઊ ઋ એ ઐ ઓ ઔ'), cons: sp('ક ખ ગ ઘ ઙ ચ છ જ ઝ ઞ ટ ઠ ડ ઢ ણ ત થ દ ધ ન પ ફ બ ભ મ ય ર લ વ શ ષ સ હ ળ'), signs: sp('ા િ ી ુ ૂ ૃ ે ૈ ો ૌ'), base: 'ક', digits: sp('૦ ૧ ૨ ૩ ૪ ૫ ૬ ૭ ૮ ૯') };
  var bn = B.SCRIPTS.bn;
  B.SCRIPTS.as = { vowels: bn.vowels, cons: bn.cons.filter(function (c) { return c !== 'ৎ'; }).map(function (c) { return c === 'র' ? 'ৰ' : c; }).concat(['ৱ']), signs: bn.signs, base: bn.base, digits: bn.digits };
  B.PHRASE_CATS = ['greet', 'intro', 'talk', 'daily', 'food', 'travel', 'shop', 'health', 'people', 'feel', 'work', 'home', 'time', 'num'];
  // Conversation drills: each turn is [what the other person says, your reply], both phrase ids.
  B.DRILLS = [
    { id: 'meet', icon: '🤝', turns: [['how', 'fine'], ['from-q', 'from-india'], ['english-q', 'little'], ['nice', 'nice-too']] },
    { id: 'rest', icon: '🍛', turns: [['table-how-many', 'table-two'], ['drink-q', 'water'], ['eat-q', 'order-rice'], ['spicy-q', 'notspicy'], ['anything-else', 'bill']] },
    { id: 'dir', icon: '🧭', turns: [['need-help-q', 'lost'], ['where-go', 'station'], ['straight-then-left', 'far'], ['five-min-walk', 'thanks']] },
    { id: 'shop', icon: '🛍', turns: [['help-you-q', 'price'], ['price-500', 'expensive'], ['price-400', 'take'], ['cash-or-card', 'pay-card']] },
    { id: 'doc', icon: '🩺', turns: [['problem-q', 'sick'], ['where-hurt', 'hurts'], ['fever-q', 'since-yesterday'], ['medicine-twice', 'thanks']] },
    { id: 'hotel', icon: '🏨', turns: [['reservation-q', 'have-reservation'], ['nights-q', 'two-nights'], ['third-floor', 'breakfast-incl'], ['breakfast-8', 'thanks']] }
  ];
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
/* Say it: type English, get the sentence in another language with romanization and voice.
   Order of attempts: exact phrasebook match, on-device translator (if the browser has one), closest phrasebook entries. */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set;
  var Y = { to: null, text: '' };
  B.views = B.views || {};
  function norm(s) { return s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9'… ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  function toks(s) { return norm(s).replace(/…/g, ' ').split(' ').filter(Boolean); }
  // best phrasebook matches for an English sentence
  B.sayMatch = function (text, lang) {
    var q = norm(text), qt = toks(text), out = [];
    if (!qt.length) return out;
    B.PHRASES.forEach(function (p) {
      var pn = norm(p.en), pt = toks(p.en), score;
      if (pn === q) score = 1;
      else {
        var inter = pt.filter(function (w) { return qt.indexOf(w) >= 0; }).length, uni = pt.length + qt.length - inter;
        score = uni ? inter / uni : 0;
      }
      var tpl = null;
      if (p.en.indexOf('…') >= 0) { var pre = norm(p.en.split('…')[0]); if (pre && q.indexOf(pre) === 0 && q.length > pre.length) { tpl = text.trim().slice(pre.length).trim().replace(/[.!?]+$/, ''); score = Math.max(score, 0.95); } }
      if (score > 0) out.push({ p: p, score: score, tpl: tpl, text: tpl ? p[lang].replace('…', tpl) : p[lang] });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out;
  };
  B.views.say = function (app) {
    app.textContent = ''; U.stopSpeak(); Y.to = Y.to || set.focus;
    app.appendChild(h('h1', { text: t('nav_say') })); app.appendChild(h('p', { class: 'lede', text: t('sayLede') }));
    var ta = h('textarea', { id: 'sy-text', rows: 3, maxlength: 600, placeholder: t('sayPlaceholder'), 'aria-label': t('sayInput'), spellcheck: 'true', lang: 'en' }); ta.value = Y.text;
    var sel = h('select', { id: 'sy-to', 'aria-label': t('sayTo') }, B.LEARN.map(function (l) { return h('option', { value: l, text: U.langNative(l) + ' · ' + U.langName(l) }); })); sel.value = Y.to;
    var out = h('div', { class: 'say-out', 'aria-live': 'polite' }), status = h('p', { class: 'note', hidden: true });
    sel.addEventListener('change', function () { Y.to = sel.value; if (Y.text) go(false); });
    ta.addEventListener('input', function () { Y.text = ta.value; });
    ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); go(true); } });
    var goBtn = h('button', { type: 'button', class: 'abtn gold', text: '🔊 ' + t('sayGo'), onclick: function () { go(true); } });
    app.appendChild(h('section', { class: 'panel' }, [h('div', { class: 'tools' }, [h('div', { class: 'tf grow' }, [h('label', { for: 'sy-text', text: t('sayInput') }), ta]), h('div', { class: 'tf' }, [h('label', { for: 'sy-to', text: t('sayTo') }), sel])]),
      h('div', { class: 'acts' }, [goBtn, h('button', { type: 'button', class: 'abtn', text: '🔊 ' + t('sayEnglish'), onclick: function () { if (ta.value.trim()) U.speak(ta.value.trim(), 'en', null, set.rate); } }), h('button', { type: 'button', class: 'abtn', text: t('clear'), onclick: function () { ta.value = ''; Y.text = ''; out.textContent = ''; status.hidden = true; ta.focus(); } })]), status]));
    app.appendChild(out);
    app.appendChild(h('p', { class: 'note', text: t('sayNote') }));
    var seq = 0;
    function row(text, lang, label, speakNow) {
      var main = h('div', { class: 'ph-t', lang: lang }); main.appendChild(U.renderText(text, lang, { roman: false }));
      U.bindWords(main, function () { return lang; }, function () { return text; }, function () { });
      var rom = B.isBrahmic(text) ? B.translit(text, set.scheme, lang) : '';
      var el = h('div', { class: 'ph say-row' }, [h('div', { class: 'ph-main' }, [main, rom ? h('div', { class: 'ph-r', text: rom }) : null, label ? h('div', { class: 'ph-n', text: label }) : null]),
        h('div', { class: 'ph-a' }, [h('button', { type: 'button', class: 'abtn', 'aria-label': t('speak'), text: '🔊', onclick: function () { U.speak(text, lang, null, set.rate); } }), h('button', { type: 'button', class: 'abtn', 'aria-label': t('slow'), text: '🐢', onclick: function () { U.speak(text, lang, null, 0.55); } }), h('button', { type: 'button', class: 'abtn', 'aria-label': t('copy'), text: '⧉', onclick: function () { try { navigator.clipboard.writeText(text); U.toast(t('copied')); } catch (e) { } } })])]);
      return el;
    }
    function show(list, title, speakFirst) {
      out.textContent = ''; if (title) out.appendChild(h('h2', { text: title }));
      list.forEach(function (x, i) { out.appendChild(row(x.text, Y.to, x.label)); });
      if (speakFirst && list.length) U.speak(list[0].text, Y.to, null, set.rate);
    }
    function go(speak) {
      var text = ta.value.trim(); Y.text = ta.value; status.hidden = true; if (!text) { ta.focus(); return; }
      var my = ++seq, lang = Y.to, m = B.sayMatch(text, lang), best = m[0];
      if (best && best.score >= 0.95) { show([{ text: best.text, label: t('sayMatch') + ': ' + best.p.en }], t('sayResult'), speak); return; }
      var near = m.filter(function (x) { return x.score >= 0.2; }).slice(0, 4).map(function (x) { return { text: x.text, label: x.p.en }; });
      function fallback(msg) { if (my !== seq) return; status.hidden = false; status.textContent = msg; if (near.length) show(near, t('sayClosest'), false); else out.textContent = ''; }
      if (!U.canTranslate()) { fallback(t('sayNone')); return; }
      out.textContent = ''; status.hidden = false; status.textContent = t('sayWorking');
      U.translate(text, 'en', lang).then(function (r) {
        if (my !== seq) return; status.hidden = true; r = String(r || '').trim(); if (!r) { fallback(t('trFail')); return; }
        show([{ text: r, label: t('sayDevice') }], t('sayResult'), speak);
      }, function () { fallback(t('sayFail')); });
    }
    if (Y.text) go(false);
  };
})(window.B);

;
/* Daily lesson: five new phrases a day, a listening quiz, and recall of older phrases (spaced repetition on phrases).
   Progress is stored in this browser only (localStorage "bh-lesson"). */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set;
  B.views = B.views || {};
  var ORDER = ['greet', 'intro', 'talk', 'daily', 'food', 'travel', 'shop', 'health', 'people', 'feel', 'work', 'home', 'time', 'num'];
  var MAP = null, CUR = null;
  function P(id) { if (!MAP) { MAP = {}; B.PHRASES.forEach(function (p) { MAP[p.id] = p; }); } return MAP[id]; }
  function curriculum() { if (!CUR) { CUR = []; ORDER.forEach(function (c) { B.PHRASES.forEach(function (p) { if (p.cat === c) CUR.push(p.id); }); }); } return CUR; }
  function shuffle(a) { return a.slice().sort(function () { return Math.random() - 0.5; }); }
  B.lesson = {
    load: function () { try { return JSON.parse(U.store.get('bh-lesson')) || {}; } catch (e) { return {}; } },
    save: function (s) { U.store.set('bh-lesson', JSON.stringify(s)); },
    // other phrases to use as wrong answers: same category first, no duplicate text
    distract: function (id, n, key) {
      var p = P(id), seen = {}, out = []; seen[key(p)] = 1;
      var pool = shuffle(B.PHRASES.filter(function (q) { return q.id !== id; })), same = pool.filter(function (q) { return q.cat === p.cat; }), rest = pool.filter(function (q) { return q.cat !== p.cat; });
      same.concat(rest).forEach(function (q) { var k = key(q); if (out.length < n && !seen[k]) { seen[k] = 1; out.push(q); } });
      return out;
    },
    shuffle: shuffle, P: P,
    plan: function (st, force) {
      var d = U.today(), L = st.days[d];
      if (L && !force) return L;
      var fresh = curriculum().filter(function (id) { return !st.cards[id]; }).slice(0, 5), now = Date.now();
      var due = Object.keys(st.cards).filter(function (id) { return st.cards[id].due <= now; }).sort(function (a, b) { return st.cards[a].due - st.cards[b].due; }).slice(0, 5);
      L = { ids: fresh, recall: due, done: false, score: [0, 0] }; st.days[d] = L; return L;
    }
  };
  var TD = { lang: null, step: 'intro', i: 0, right: 0, total: 0, res: {} };

  B.views.today = function (app) {
    app.textContent = ''; TD.lang = TD.lang || set.focus; var lang = TD.lang;
    var all = B.lesson.load(); all[lang] = all[lang] || { cards: {}, days: {} }; var st = all[lang]; var L = B.lesson.plan(st); B.lesson.save(all);
    app.appendChild(h('h1', { text: t('nav_today') })); app.appendChild(h('p', { class: 'lede', text: t('tdLede') }));
    var ls = h('select', { id: 'td-lang', 'aria-label': t('language') }, B.INDIC.map(function (l) { return h('option', { value: l, text: U.langNative(l) + ' · ' + U.langName(l) }); })); ls.value = lang;
    ls.addEventListener('change', function () { TD.lang = ls.value; TD.step = 'intro'; B.views.today(app); });
    app.appendChild(h('div', { class: 'tools' }, [h('div', { class: 'tf' }, [h('label', { for: 'td-lang', text: t('language') }), ls]), h('span', { class: 'chip ok', text: t('tdProgress', { n: Object.keys(st.cards).length, m: B.PHRASES.length }) }), h('span', { class: 'chip lr', text: t('statStreak') + ': ' + U.streak() })]));
    var box = h('section', { class: 'panel lesson' }); app.appendChild(box);
    function save() { B.lesson.save(all); }
    function rom(txt) { return B.isBrahmic(txt) ? B.translit(txt, set.scheme, lang) : ''; }
    function steps(cur) {
      var names = [['learn', t('tdLearn')], ['listen', t('tdListen')]]; if (L.recall.length) names.push(['recall', t('tdRecall')]);
      return h('ol', { class: 'stepbar', 'aria-label': t('nav_today') }, names.map(function (n) { return h('li', { class: n[0] === cur ? 'on' : '', 'aria-current': n[0] === cur ? 'step' : null, text: n[1] }); }));
    }
    function draw() {
      box.textContent = ''; if (B.fx) B.fx.enter(box);
      if (TD.step === 'intro') return intro();
      if (TD.step === 'learn') return learn();
      if (TD.step === 'listen') return quiz('listen');
      if (TD.step === 'recall') return quiz('recall');
      return finish();
    }
    function intro() {
      if (L.done) {
        box.appendChild(h('h2', { text: t('tdDone') })); box.appendChild(h('p', { class: 'lede', text: t('tdScore', { n: L.score[0], m: L.score[1] }) }));
        box.appendChild(h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn gold big', text: t('tdBonus'), onclick: function () { L = B.lesson.plan(st, true); save(); TD.step = 'learn'; draw(); } }), h('a', { class: 'abtn', href: '/talk/', 'data-nav': '1', text: '💬 ' + t('nav_talk') })]));
        return;
      }
      if (!L.ids.length && !L.recall.length) { box.appendChild(h('p', { text: t('tdDone') })); return; }
      box.appendChild(h('h2', { text: t('tdLearn') + ': ' + L.ids.length }));
      box.appendChild(h('ul', { class: 'plain' }, L.ids.map(function (id) { return h('li', { lang: lang, text: B.lesson.P(id).en }); })));
      if (L.recall.length) box.appendChild(h('p', { class: 'note', text: t('tdRecallN', { n: L.recall.length }) }));
      box.appendChild(h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn gold big', text: t('tdStart'), onclick: function () { TD.step = L.ids.length ? 'learn' : 'recall'; TD.i = 0; TD.right = 0; TD.total = 0; draw(); } })]));
    }
    function learn() {
      box.appendChild(steps('learn'));
      var list = h('div', { class: 'ph-list' });
      L.ids.forEach(function (id) {
        var p = B.lesson.P(id), txt = p[lang], tgt = h('div', { class: 'ph-t', lang: lang }); tgt.appendChild(U.renderText(txt, lang, { roman: false }));
        U.bindWords(tgt, function () { return lang; }, function () { return txt; }, function () { });
        var row = h('div', { class: 'ph' }, [h('div', { class: 'ph-main' }, [tgt, rom(txt) ? h('div', { class: 'ph-r', text: rom(txt) }) : null, h('div', { class: 'ph-n', text: p.en })]),
          h('div', { class: 'ph-a' }, [h('button', { type: 'button', class: 'abtn', 'aria-label': t('speak') + ': ' + p.en, text: '🔊', onclick: function () { U.speak(txt, lang, null, set.rate); } }), h('button', { type: 'button', class: 'abtn', 'aria-label': t('slow') + ': ' + p.en, text: '🐢', onclick: function () { U.speak(txt, lang, null, 0.55); } })])]);
        row.querySelector('.ph-a').appendChild(U.pronToggle(row, txt, lang)); list.appendChild(row);
      });
      box.appendChild(list);
      box.appendChild(h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn gold big', text: t('tdNext'), onclick: function () { TD.step = 'listen'; TD.i = 0; draw(); } })]));
    }
    function quiz(kind) {
      var ids = kind === 'listen' ? L.ids : L.recall;
      if (TD.i >= ids.length) { if (kind === 'listen' && L.recall.length) { TD.step = 'recall'; TD.i = 0; return draw(); } TD.step = 'done'; return draw(); }
      var id = ids[TD.i], p = B.lesson.P(id), txt = p[lang];
      box.appendChild(steps(kind)); box.appendChild(h('p', { class: 'note', text: (TD.i + 1) + ' / ' + ids.length }));
      var keyOf = kind === 'listen' ? function (q) { return q.en; } : function (q) { return q[lang]; };
      var opts = B.lesson.shuffle([p].concat(B.lesson.distract(id, 2, keyOf)));
      if (kind === 'listen') {
        box.appendChild(h('h2', { text: t('tdListenQ') }));
        box.appendChild(h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn big', text: '🔊', 'aria-label': t('speak'), onclick: function () { U.speak(txt, lang, null, set.rate); } }), h('button', { type: 'button', class: 'abtn', text: '🐢', 'aria-label': t('slow'), onclick: function () { U.speak(txt, lang, null, 0.55); } })]));
        setTimeout(function () { U.speak(txt, lang, null, set.rate); }, 150);
      } else {
        box.appendChild(h('h2', { text: t('tdRecallQ') })); box.appendChild(h('p', { class: 'ph-n big', text: p.en }));
      }
      var res = h('p', { class: 'qz-res', 'aria-live': 'polite' }), done = false, nb = h('button', { type: 'button', class: 'abtn gold', text: t('tdNext'), hidden: true, onclick: function () { TD.i++; draw(); } });
      var wrap = h('div', { class: 'opts' }, opts.map(function (o) {
        var kids = kind === 'listen' ? [h('span', { text: o.en })] : [h('span', { lang: lang, text: o[lang] }), rom(o[lang]) ? h('span', { class: 'r', text: rom(o[lang]) }) : null];
        return h('button', { type: 'button', class: 'abtn opt', onclick: function (ev) {
          if (done) return; done = true; var ok = o.id === id, b = ev.currentTarget; b.classList.add(ok ? 'right' : 'wrong');
          if (!ok) [].forEach.call(wrap.children, function (x, i) { if (opts[i].id === id) x.classList.add('right'); });
          res.textContent = ok ? t('correct') : t('wrongIs', { a: kind === 'listen' ? p.en : txt }); U.speak(txt, lang, null, set.rate);
          TD.total++; if (ok) TD.right++; U.logReview(); if (B.fx) { if (ok) B.fx.good(); else B.fx.bad(); }
          var c = st.cards[id] || B.srsNew(Date.now()); st.cards[id] = B.srsNext(c, ok ? 2 : 0, Date.now());
          if (kind === 'recall' || !ok) save(); else save();
          if (TD.i + 1 >= ids.length && !(kind === 'listen' && L.recall.length)) nb.textContent = t('tdFinish');
          nb.hidden = false; nb.focus();
        } }, kids);
      }));
      box.appendChild(wrap); box.appendChild(res); box.appendChild(h('div', { class: 'acts' }, [nb]));
    }
    function finish() {
      L.done = true; L.score = [TD.right, TD.total]; save(); if (B.fx) B.fx.celebrate(box);
      box.appendChild(h('h2', { text: t('tdDone') })); box.appendChild(h('p', { class: 'lede', text: t('tdScore', { n: TD.right, m: TD.total }) }));
      box.appendChild(h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn gold big', text: t('tdBonus'), onclick: function () { L = B.lesson.plan(st, true); save(); TD.step = 'learn'; draw(); } }), h('a', { class: 'abtn', href: '/talk/', 'data-nav': '1', text: '💬 ' + t('nav_talk') })]));
      var chip = document.querySelector('.tools .chip.ok'); if (chip) chip.textContent = t('tdProgress', { n: Object.keys(st.cards).length, m: B.PHRASES.length });
    }
    if (L.done) TD.step = 'intro'; draw();
  };
})(window.B);

;
/* Conversation drills: hear what the other person says, then choose your reply. Lines come from the phrasebook. */
(function (B) {
  'use strict';
  var U = B.ui, h = U.h, t = U.t, set = U.set;
  B.views = B.views || {};
  var DR = { lang: null, sc: null, turn: 0, ok: 0, first: true, hide: false };

  B.views.talk = function (app) {
    app.textContent = ''; DR.lang = DR.lang || set.focus; var lang = DR.lang, LS = B.lesson;
    function rom(txt) { return B.isBrahmic(txt) ? B.translit(txt, set.scheme, lang) : ''; }
    function line(p, who) {
      var txt = p[lang], r = rom(txt);
      return h('div', { class: 'bubble ' + who }, [h('div', { class: 'bub-t' }, [h('div', { class: 'ph-t', lang: lang, text: txt }), r ? h('div', { class: 'ph-r', text: r }) : null, h('div', { class: 'ph-n', text: p.en })]),
        h('div', { class: 'ph-a' }, [h('button', { type: 'button', class: 'abtn', 'aria-label': t('speak') + ': ' + p.en, text: '🔊', onclick: function () { U.speak(txt, lang, null, set.rate); } }), h('button', { type: 'button', class: 'abtn', 'aria-label': t('slow') + ': ' + p.en, text: '🐢', onclick: function () { U.speak(txt, lang, null, 0.55); } })])]);
    }
    function list() {
      DR.sc = null; app.textContent = '';
      app.appendChild(h('h1', { text: t('nav_talk') })); app.appendChild(h('p', { class: 'lede', text: t('drLede') }));
      var ls = h('select', { id: 'dr-lang', 'aria-label': t('language') }, B.INDIC.map(function (l) { return h('option', { value: l, text: U.langNative(l) + ' · ' + U.langName(l) }); })); ls.value = lang;
      ls.addEventListener('change', function () { DR.lang = ls.value; B.views.talk(app); });
      var hide = h('input', { type: 'checkbox', id: 'dr-hide' }); hide.checked = DR.hide; hide.addEventListener('change', function () { DR.hide = hide.checked; });
      app.appendChild(h('div', { class: 'tools' }, [h('div', { class: 'tf' }, [h('label', { for: 'dr-lang', text: t('language') }), ls]), h('label', { class: 'tf chk', for: 'dr-hide' }, [hide, h('span', { text: t('drHide') })])]));
      var grid = h('div', { class: 'cards' });
      B.DRILLS.forEach(function (d) { grid.appendChild(h('button', { type: 'button', class: 'card', onclick: function () { DR.sc = d; DR.turn = 0; DR.ok = 0; run(); } }, [h('span', { class: 'ci', 'aria-hidden': 'true', text: d.icon }), h('h2', { text: t('d_' + d.id) }), h('p', { text: t('drTurns', { n: d.turns.length }) })])); });
      app.appendChild(grid);
    }
    function run() {
      app.textContent = ''; var d = DR.sc, tr = d.turns[DR.turn];
      if (!tr) return done();
      var them = LS.P(tr[0]), you = LS.P(tr[1]); DR.first = true;
      app.appendChild(h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn', text: '← ' + t('drPick'), onclick: list }), h('span', { class: 'chip', text: (DR.turn + 1) + ' / ' + d.turns.length })]));
      app.appendChild(h('h1', { text: d.icon + ' ' + t('d_' + d.id) }));
      var panel = h('section', { class: 'panel' }); app.appendChild(panel);
      panel.appendChild(h('h2', { text: t('drThem') }));
      var tb = line(them, 'them'); panel.appendChild(tb);
      if (DR.hide) { tb.classList.add('veil'); tb.querySelector('.bub-t').hidden = true; panel.appendChild(h('button', { type: 'button', class: 'abtn', id: 'dr-show', text: '👁 ' + t('drThem'), onclick: function (e) { tb.querySelector('.bub-t').hidden = false; e.currentTarget.remove(); } })); }
      setTimeout(function () { U.speak(them[lang], lang, null, set.rate); }, 200);
      panel.appendChild(h('h2', { class: 'yt', text: t('drYou') })); panel.appendChild(h('p', { class: 'ph-n big', text: you.en }));
      var others = []; d.turns.forEach(function (x) { if (x[1] !== tr[1] && others.indexOf(x[1]) < 0 && LS.P(x[1])[lang] !== you[lang]) others.push(x[1]); });
      var picks = LS.shuffle(others).slice(0, 2).map(LS.P); if (picks.length < 2) picks = picks.concat(LS.distract(tr[1], 2 - picks.length, function (q) { return q[lang]; }));
      var opts = LS.shuffle([you].concat(picks)), res = h('p', { class: 'qz-res', 'aria-live': 'polite' }), last = DR.turn + 1 >= d.turns.length, solved = false;
      var nb = h('button', { type: 'button', class: 'abtn gold', text: last ? t('tdFinish') : t('tdNext'), hidden: true, onclick: function () { DR.turn++; run(); } });
      panel.appendChild(h('div', { class: 'opts' }, opts.map(function (o) {
        var r = rom(o[lang]);
        return h('button', { type: 'button', class: 'abtn opt', onclick: function (ev) {
          if (solved) return; var b = ev.currentTarget;
          if (o.id === you.id) { solved = true; b.classList.add('right'); res.textContent = t('correct'); if (B.fx) B.fx.good(); U.speak(o[lang], lang, null, set.rate); if (DR.first) DR.ok++; U.logReview(); nb.hidden = false; nb.focus(); var sh = document.getElementById('dr-show'); if (sh) sh.click(); }
          else { DR.first = false; b.classList.add('wrong'); b.disabled = true; res.textContent = t('drTry'); if (B.fx) B.fx.bad(); }
        } }, [h('span', { lang: lang, text: o[lang] }), r ? h('span', { class: 'r', text: r }) : null]);
      })));
      panel.appendChild(res); panel.appendChild(h('div', { class: 'acts' }, [nb]));
    }
    function done() {
      app.textContent = ''; var d = DR.sc; if (B.fx) B.fx.celebrate(app);
      app.appendChild(h('h1', { text: d.icon + ' ' + t('drDone') })); app.appendChild(h('p', { class: 'lede', text: t('drScore', { n: DR.ok, m: d.turns.length }) }));
      var panel = h('section', { class: 'panel' }, [h('h2', { text: t('drTranscript') })]);
      d.turns.forEach(function (x) { [[x[0], 'them'], [x[1], 'you']].forEach(function (z) { var b = line(LS.P(z[0]), z[1]); var pa = b.querySelector('.ph-a'); if (pa) pa.appendChild(U.pronToggle(b, LS.P(z[0])[lang], lang)); panel.appendChild(b); }); });
      app.appendChild(panel);
      app.appendChild(h('div', { class: 'acts' }, [h('button', { type: 'button', class: 'abtn gold', text: t('drReplay'), onclick: function () { DR.turn = 0; DR.ok = 0; run(); } }), h('button', { type: 'button', class: 'abtn', text: t('drAnother'), onclick: list })]));
    }
    list();
  };
})(window.B);

;
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
    var cards = [['/today/', '📅', 'nav_today', 'cToday'], ['/say/', '🗣', 'nav_say', 'cSay'], ['/talk/', '💬', 'nav_talk', 'cTalk'], ['/watch/', '🎬', 'nav_watch', 'cWatch'], ['/read/', '📖', 'nav_read', 'cRead'], ['/review/', '🧠', 'nav_review', 'cReview'], ['/words/', '🗂', 'nav_words', 'cWords'], ['/scripts/', 'अ', 'nav_scripts', 'cScripts'], ['/phrases/', '📚', 'nav_phrases', 'cPhrases'], ['/privacy/', '🔒', 'pvTitle', 'cPrivacy']];
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
    app.textContent = ''; SC.lang = SC.lang || (B.SCRIPT_LANGS.indexOf(set.focus) >= 0 ? set.focus : 'te');
    app.appendChild(h('h1', { text: t('nav_scripts') })); app.appendChild(h('p', { class: 'lede', text: t('scLede') }));
    var ls = h('select', { id: 'sc-lang', 'aria-label': t('language') }, B.SCRIPT_LANGS.map(function (l) { return h('option', { value: l, text: U.langNative(l) + ' · ' + U.langName(l) }); })); ls.value = SC.lang;
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
      body.textContent = ''; var S = B.SCRIPTS[SC.lang], rom = function (g) { return B.translit(g, set.scheme, SC.lang) || g; };
      body.appendChild(grid(t('scVowels'), S.vowels, function (g) { return cell(g, rom(g)); }));
      body.appendChild(grid(t('scCons'), S.cons, function (g) { return cell(g, rom(g)); }));
      body.appendChild(h('section', { class: 'panel' }, [h('h2', { text: t('scSigns') }), h('p', { class: 'note', text: t('scSignsNote', { b: S.base }) }), h('div', { class: 'glyphs' }, S.signs.map(function (s) { var g = S.full ? s : S.base + s; return cell(g, rom(g)); }))]));
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
        var row = h('div', { class: 'ph' }, [h('div', { class: 'ph-main' }, [tgt, (B.isBrahmic(txt) ? h('div', { class: 'ph-r', text: B.translit(txt, set.scheme, PH.lang) }) : null), h('div', { class: 'ph-n', text: p.en })]), h('div', { class: 'ph-a' }, [h('button', { type: 'button', class: 'abtn', 'aria-label': t('speak') + ': ' + p.en, text: '🔊', onclick: function () { U.speak(txt, PH.lang, null, set.rate); } }), h('button', { type: 'button', class: 'abtn', 'aria-label': t('slow') + ': ' + p.en, text: '🐢', onclick: function () { U.speak(txt, PH.lang, null, 0.55); } })])]);
        row.querySelector('.ph-a').appendChild(U.pronToggle(row, txt, PH.lang)); list.appendChild(row);
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
