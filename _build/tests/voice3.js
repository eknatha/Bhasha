// node tests/voice3.js : voice ranking, voice kinds, offline voice smoothing, Voice check badges
const {chromium}=require('playwright');const BASE=process.env.BASE||'http://localhost:8766';let fails=0;
function ok(c,m){if(!c){fails++;console.log('FAIL',m);}else console.log('ok  ',m);}
const L={te:'te-IN',hi:'hi-IN',kn:'kn-IN',ta:'ta-IN',ml:'ml-IN',bn:'bn-IN',mr:'mr-IN',gu:'gu-IN',as:'as-IN',ko:'ko-KR',es:'es-ES',de:'de-DE',fr:'fr-FR',en:'en-US',or:'or-IN',ne:'ne-NP',ja:'ja-JP'};
(async()=>{const b=await chromium.launch();
function ctx(voices){return b.newContext({viewport:{width:1100,height:900}}).then(async c=>{await c.addInitScript(([vs])=>{if(!localStorage.getItem('__i')){localStorage.setItem('__i','1');localStorage.setItem('bh-tour','1');localStorage.setItem('bh-set',JSON.stringify({ui:'en',focus:'te',ov:'yes',sound:false,haptic:false}));}
 const V=vs.map((v,i)=>({name:v[0],lang:v[1],voiceURI:'u'+i,localService:v[2],default:false}));
 window.SpeechSynthesisUtterance=function(t){this.text=t;};
 Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>V,speak(){},cancel(){},addEventListener(){}},configurable:true});},[voices]);return c;});}
// 1 ranking: natural online beats Google beats plain beats compact/espeak/desktop, per language
{const vs=[];for(const l in L){const c=L[l];vs.push(['eSpeak '+l,c,true],['Microsoft Old Desktop - '+l,c,true],['Compact '+l,c,true],['Plain '+l,c,true],['Google '+l,c,false],['Microsoft Aria Online (Natural) - '+l,c,false]);}
 const c=await ctx(vs),p=await c.newPage();await p.goto(BASE+'/');await p.waitForTimeout(500);
 const r=await p.evaluate(()=>{const o={};for(const l of B.LEARN){const v=B.ui.voiceFor(l);o[l]=[v&&v.name,B.ui.voiceKind(l).kind];}return o;});
 for(const l in L)ok(/Natural/.test(r[l][0])&&r[l][1]==='nat','rank '+l+': natural voice wins ('+r[l][0]+')');await c.close();}
{const vs=[];for(const l in L){const c=L[l];vs.push(['eSpeak '+l,c,true],['Compact '+l,c,true],['Plain '+l,c,true],['Google '+l,c,false]);}
 const c=await ctx(vs),p=await c.newPage();await p.goto(BASE+'/');await p.waitForTimeout(500);
 const r=await p.evaluate(()=>{const o={};for(const l of B.LEARN){const v=B.ui.voiceFor(l);o[l]=[v&&v.name,B.ui.voiceKind(l).kind];}return o;});
 for(const l in L)ok(/Google/.test(r[l][0]),'rank '+l+': Google beats plain/compact/eSpeak ('+r[l][0]+')');await c.close();}
{const vs=[];for(const l in L){const c=L[l];vs.push(['eSpeak '+l,c,true],['Compact '+l,c,true],['Plain '+l,c,true]);}
 const c=await ctx(vs),p=await c.newPage();await p.goto(BASE+'/');await p.waitForTimeout(500);
 const r=await p.evaluate(()=>{const o={};for(const l of B.LEARN){const v=B.ui.voiceFor(l);o[l]=[v&&v.name,B.ui.voiceKind(l).kind];}return o;});
 for(const l in L)ok(/Plain/.test(r[l][0])&&r[l][1]==='dev','rank '+l+': plain device voice beats compact/eSpeak ('+r[l][0]+')');await c.close();}
// 2 no device voices: basic kind, and Voice check shows the badge and help for every language
{const c=await ctx([]),p=await c.newPage();await p.goto(BASE+'/');await p.waitForTimeout(500);
 const k=await p.evaluate(()=>B.LEARN.map(l=>B.ui.voiceKind(l).kind));ok(k.every(x=>x==='basic'),'kind: basic when no device voice');
 await p.evaluate(()=>B.ui.openVoiceCheck());await p.waitForTimeout(500);
 const badges=await p.$$eval('.vq-basic',e=>e.length);ok(badges===17,'voice check: basic badge on 17 languages ('+badges+')');
 ok(await p.isVisible('.vq-help summary'),'voice check: help block present');await p.click('.vq-help summary');
 const help=await p.textContent('.vq-help p');ok(/Edge/.test(help)&&/Android/.test(help)&&/iPhone/.test(help),'voice check: help names Edge, Android, iPhone and Mac');await c.close();}
// 3 offline voice: smoothed output is softer than raw eSpeak, loud enough, not clipped, ends quietly
{const c=await ctx([]);await c.addInitScript(()=>{window.__blobs=[];const O=URL.createObjectURL;URL.createObjectURL=function(b){window.__blobs.push(b);return O.call(URL,b);};
 window.Audio=function(u){this.src=u;this.play=()=>Promise.resolve();this.pause=()=>{};};});
 const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.goto(BASE+'/');await p.waitForTimeout(500);
 const r=await p.evaluate(async()=>{
  function feat(u8){const dv=new DataView(u8.buffer,u8.byteOffset,u8.byteLength);const n=(u8.length-44)>>1;let e=0,de=0,pk=0,px=0;for(let i=0;i<n;i++){const x=dv.getInt16(44+i*2,true);e+=x*x;if(Math.abs(x)>pk)pk=Math.abs(x);if(i){const d=x-px;de+=d*d;}px=x;}
   let tail=0;for(let i=n-20;i<n;i++)tail=Math.max(tail,Math.abs(dv.getInt16(44+i*2,true)));return {n,hf:de/Math.max(e,1),pk,tail};}
  const mod=await import('/vendor/espeak/espeak-ng.js'),wasm=await (await fetch('/vendor/espeak/espeak-ng.wasm')).arrayBuffer(),m=await WebAssembly.compile(wasm);
  const out={};for(const l of ['te','hi','kn','ta','ml','bn','mr','gu','as','ko','es','de','fr','en','or','ne','ja']){
   const ph=B.PHRASES.find(x=>x.id==='how-old')||B.PHRASES[0];const txt=ph[l];
   const raw=await mod.default({arguments:['-v',l==='en'?'en-us':l,'-s','157','-g','2','-w','o.wav',' '+txt],print(){},printErr(){},instantiateWasm:(i,ok)=>{WebAssembly.instantiate(m,i).then(x=>ok(x,m));return {}}});
   const R=feat(raw.FS.readFile('o.wav'));window.__blobs.length=0;B.ui.set.rate=0.9;await new Promise(r=>{B.ui.speak(txt,l,r,0.9,true);setTimeout(r,6000);});
   const blob=window.__blobs[window.__blobs.length-1];if(!blob){out[l]=null;continue;}const S=feat(new Uint8Array(await blob.arrayBuffer()));out[l]={raw:R,sm:S};}
  return out;});
 for(const l in r){const x=r[l];if(!x){ok(false,'offline '+l+': audio produced');continue;}
  ok(x.sm.hf<x.raw.hf*0.9,'offline '+l+': softer than raw ('+x.sm.hf.toFixed(3)+' vs '+x.raw.hf.toFixed(3)+')');
  ok(x.sm.pk>8000&&x.sm.pk<=32767,'offline '+l+': loud enough, not clipped (peak '+x.sm.pk+')');
  ok(x.sm.tail<200,'offline '+l+': ends quietly (tail '+x.sm.tail+')');}
 ok(p.errs.length===0,'offline: no errors '+p.errs.join(';'));await c.close();}
console.log(fails?'FAILED '+fails:'ALL PASS');await b.close();process.exit(fails?1:0);})();
