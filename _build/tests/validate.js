// node tests/validate.js : content validation (phrases, scripts, interface text)
const fs=require('fs'),path=require('path');globalThis.window={B:undefined};
const load=f=>new Function('window',fs.readFileSync(path.join(__dirname,'../src/'+f),'utf8'))(globalThis.window);
globalThis.window.B=undefined;
// core/data use (function(B){})(window.B = window.B || {}) style or global B; emulate
globalThis.window={B:{}};load('core.js');load('data.js');load('phrases2.js');load('i18n.js');
const B=globalThis.window.B;let fails=0;const bad=(m)=>{fails++;console.log('FAIL',m)};
const R={te:/[ఀ-౿]/,hi:/[ऀ-ॿ]/,mr:/[ऀ-ॿ]/,kn:/[ಀ-೿]/,ta:/[஀-௿]/,ml:/[ഀ-ൿ]/,bn:/[ঀ-৿]/,ko:/[가-힯]/,es:/[a-záéíóúñü¿¡]/i,de:/[a-zäöüß]/i,fr:/[a-zàâçéèêëîïôûùüÿœ]/i,gu:/[\u0A80-\u0AFF]/,as:/[\u0980-\u09FF]/};
const LAT=/[A-Za-z]/;
const P=B.PHRASES;
if(P.length!==250)bad('phrase count '+P.length);
if(new Set(P.map(p=>p.id)).size!==P.length)bad('duplicate ids');
const cats=new Set(B.PHRASE_CATS);
P.forEach(p=>{if(!cats.has(p.cat))bad(p.id+' bad cat '+p.cat);if(!p.en)bad(p.id+' no en');
 B.LEARN.forEach(l=>{const t=p[l];
  if(!t||!String(t).trim()){bad(p.id+' missing '+l);return}
  if(!R[l].test(t))bad(p.id+' '+l+' wrong script: '+t);
  if(B.SCRIPT_LANGS.includes(l)&&LAT.test(t.replace(/\{.*?\}/g,'')))bad(p.id+' '+l+' stray Latin: '+t);
  if(B.SCRIPT_LANGS.includes(l)){const r=B.translit(t,'simple');if(!r||!r.trim()||/[\u0900-\u0DFF\uAC00-\uD7AF]/.test(r))bad(p.id+' '+l+' romanization bad: '+r)}
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
console.log('drills',B.DRILLS.length,'turns',B.DRILLS.reduce((a,d)=>a+d.turns.length,0));
B.PHRASE_CATS.forEach(c=>{if(!en['cat_'+c])bad('missing cat_'+c)});
console.log('ui languages',codes.length,'keys',Object.keys(en).length);
console.log(fails?'FAILED '+fails:'ALL PASS');process.exit(fails?1:0);
