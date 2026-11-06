// node tests/validate.js : content validation (phrases, scripts, interface text)
const fs=require('fs'),path=require('path');globalThis.window={B:undefined};
const load=f=>new Function('window',fs.readFileSync(path.join(__dirname,'../src/'+f),'utf8'))(globalThis.window);
globalThis.window.B=undefined;
// core/data use (function(B){})(window.B = window.B || {}) style or global B; emulate
globalThis.window={B:{}};load('core.js');load('data.js');load('phrases2.js');load('phrases3.js');load('fundata.js');load('fundata2.js');load('i18n.js');
const B=globalThis.window.B;let fails=0;const bad=(m)=>{fails++;console.log('FAIL',m)};
const R={te:/[ఀ-౿]/,hi:/[ऀ-ॿ]/,mr:/[ऀ-ॿ]/,kn:/[ಀ-೿]/,ta:/[஀-௿]/,ml:/[ഀ-ൿ]/,bn:/[ঀ-৿]/,ko:/[가-힯]/,es:/[a-záéíóúñü¿¡]/i,de:/[a-zäöüß]/i,fr:/[a-zàâçéèêëîïôûùüÿœ]/i,gu:/[\u0A80-\u0AFF]/,as:/[\u0980-\u09FF]/,en:/[A-Za-z]/,or:/[\u0B00-\u0B7F]/,ne:/[ऀ-ॿ]/,ja:/[\u3040-\u30FF\u4E00-\u9FFF]/};
const LAT=/[A-Za-z]/;
const P=B.PHRASES;
if(P.length!==460)bad('phrase count (want 460) '+P.length);
if(new Set(P.map(p=>p.id)).size!==P.length)bad('duplicate ids');
const cats=new Set(B.PHRASE_CATS);
P.forEach(p=>{if(!cats.has(p.cat))bad(p.id+' bad cat '+p.cat);if(!p.en)bad(p.id+' no en');
 B.LEARN.forEach(l=>{const t=p[l];
  if(!t||!String(t).trim()){bad(p.id+' missing '+l);return}
  if(!R[l].test(t))bad(p.id+' '+l+' wrong script: '+t);
  if(B.SCRIPT_LANGS.includes(l)&&l!=='ja'&&LAT.test(t.replace(/\{.*?\}/g,'')))bad(p.id+' '+l+' stray Latin: '+t);
  if(B.SCRIPT_LANGS.includes(l)){const r=B.translit(t,'simple');if(!r||!r.trim()||/[\u0900-\u0DFF\uAC00-\uD7AF\u3040-\u30FF\u4E00-\u9FFF]/.test(r))bad(p.id+' '+l+' romanization bad: '+r)}
  if((p.en.includes('…'))!==t.includes('…'))bad(p.id+' '+l+' template ellipsis mismatch');
 })});
B.LEARN.forEach(l=>{const s=P.map(p=>p[l]);const d=s.filter((x,i)=>s.indexOf(x)!==i);if(d.length)bad(l+' duplicate phrases '+JSON.stringify(d));
 console.log(l,'phrases',s.filter(Boolean).length)});
const cc={};P.forEach(p=>cc[p.cat]=(cc[p.cat]||0)+1);console.log('categories',JSON.stringify(cc));
// interface text
const I=B.I18N,en=I.en,codes=['en','hi','te','kn','ta','ml','bn','mr','ko','es','de','fr','gu','as'];
codes.forEach(c=>{if(!I[c]){bad('no dict '+c);return}
 Object.keys(en).forEach(k=>{if(!(k in I[c])||!String(I[c][k]).trim())return bad(c+' missing '+k);
  const a=(en[k].match(/\{\w+\}/g)||[]).sort().join(),b=(I[c][k].match(/\{\w+\}/g)||[]).sort().join();if(a!==b)bad(c+' '+k+' placeholders');
  if(c!=='en'&&c!=='es'&&c!=='de'&&c!=='fr'&&R[c]&&en[k].length>25&&!R[c].test(I[c][k]))bad(c+' '+k+' not translated');});
 Object.keys(I[c]).forEach(k=>{if(!(k in en))bad(c+' extra '+k)})});
// drills: every referenced phrase exists, and the right reply is distinct from the others in its scenario
const ids=new Set(P.map(p=>p.id));
B.DRILLS.forEach(d=>{d.turns.forEach(t=>{t.forEach(i=>{if(!ids.has(i))bad('drill '+d.id+' unknown phrase '+i)})});
 B.LEARN.forEach(l=>{const rs=d.turns.map(t=>P.find(p=>p.id===t[1])[l]);if(new Set(rs).size!==rs.length)bad('drill '+d.id+' duplicate replies in '+l)});
 if(!en['d_'+d.id])bad('missing d_'+d.id)});

// ---- fun data: sayings, tongue twisters, kids words, video topics
const latinOk=(l,tx)=>!B.SCRIPT_LANGS.includes(l)||l==='ja'||!LAT.test(tx);
B.LEARN.forEach(l=>{
 const pv=B.PROVERBS[l]||[];if(pv.length!==12)bad('proverbs '+l+' count '+pv.length);
 pv.forEach(x=>{if(!R[l].test(x[0]))bad('proverb '+l+' wrong script: '+x[0]);if(!latinOk(l,x[0]))bad('proverb '+l+' stray Latin: '+x[0]);if(!x[1]||x[1].length<8)bad('proverb '+l+' no meaning');if(x[2]!=='p'&&x[2]!=='i')bad('proverb kind '+l);
  if(B.SCRIPT_LANGS.includes(l)){const r=B.translit(x[0],'simple');if(!r||/[ऀ-෿가-힯぀-ヿ一-鿿]/.test(r))bad('proverb '+l+' romanization bad: '+x[0])}});
 if(new Set(pv.map(x=>x[0])).size!==pv.length)bad('proverbs '+l+' duplicates');
 const tw=B.TWISTERS[l]||[];if(tw.length!==3)bad('twisters '+l+' count '+tw.length);
 tw.forEach(x=>{if(!R[l].test(x[0]))bad('twister '+l+' wrong script: '+x[0]);if(!latinOk(l,x[0]))bad('twister '+l+' stray Latin: '+x[0]);if(!x[1])bad('twister '+l+' no gloss');
  if(B.SCRIPT_LANGS.includes(l)){const r=B.translit(x[0],'simple');if(!r||/[ऀ-෿가-힯぀-ヿ一-鿿]/.test(r))bad('twister '+l+' romanization bad')}});
 const kw=B.KIDS.words;kw.forEach(w=>{const tx=w[l];if(!tx||!R[l].test(tx))bad('kids '+w.id+' '+l+' wrong script: '+tx);else if(!latinOk(l,tx))bad('kids '+w.id+' '+l+' stray Latin: '+tx);
  if(B.SCRIPT_LANGS.includes(l)&&tx){const r=B.translit(tx,'simple');if(!r||/[ऀ-෿가-힯぀-ヿ一-鿿]/.test(r))bad('kids '+w.id+' '+l+' romanization bad')}});
 const ks=kw.map(w=>w[l]),kd=ks.filter((x,i)=>ks.indexOf(x)!==i);if(kd.length)bad('kids duplicates in '+l+' '+JSON.stringify(kd));
 if(!B.VIDEOS.names[l])bad('video language name '+l)});
if(B.KIDS.words.length!==38)bad('kids words '+B.KIDS.words.length);
B.KIDS.cats.forEach(c=>{const n=B.KIDS.words.filter(w=>w.cat===c).length;if(n<6)bad('kids category '+c+' has '+n);if(!en['kdC_'+c])bad('missing kdC_'+c)});
B.KIDS.words.forEach(w=>{if(!w.e||!w.en||!B.KIDS.cats.includes(w.cat))bad('kids word '+w.id)});
if(new Set(B.KIDS.words.map(w=>w.id)).size!==B.KIDS.words.length)bad('kids duplicate ids');
B.VIDEOS.topics.forEach(tp=>{if(!en['wsT_'+tp[0]])bad('missing wsT_'+tp[0]);if(!tp[1].includes('{L}'))bad('video topic query '+tp[0])});
Object.keys(B.VIDEOS.channels).forEach(l=>{if(!B.LEARN.includes(l))bad('channels for unknown language '+l)});
console.log('sayings',B.LEARN.length*12,'twisters',B.LEARN.length*3,'kids words',B.KIDS.words.length,'video topics',B.VIDEOS.topics.length);
console.log('drills',B.DRILLS.length,'turns',B.DRILLS.reduce((a,d)=>a+d.turns.length,0));
B.PHRASE_CATS.forEach(c=>{if(!en['cat_'+c])bad('missing cat_'+c)});
console.log('ui languages',codes.length,'keys',Object.keys(en).length);
console.log(fails?'FAILED '+fails:'ALL PASS');process.exit(fails?1:0);
