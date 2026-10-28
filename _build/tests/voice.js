// Offline-voice fallback: every learning language must produce audible audio when the device has no voices.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(),ctx=await b.newContext(),p=await ctx.newPage();let fails=0;
await p.addInitScript(()=>{localStorage.setItem('bh-set',JSON.stringify({ui:'en',ov:'yes'}));
 window.__plays=[];const pl=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__plays.push(this.src);return pl.apply(this,arguments).catch(()=>{});};});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/phrases/');await p.waitForTimeout(500);
const langs=['te','hi','kn','ta','ml','bn','mr','gu','as','ko','es','de','fr'];
const text={te:'నమస్తే, మీరు ఎలా ఉన్నారు?',hi:'नमस्ते, आप कैसे हैं?',kn:'ನಮಸ್ತೆ, ನೀವು ಹೇಗಿದ್ದೀರಿ?',ta:'வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?',ml:'നമസ്കാരം, സുഖമാണോ?',bn:'নমস্কার, আপনি কেমন আছেন?',mr:'नमस्कार, तुम्ही कसे आहात?',ko:'안녕하세요, 어떻게 지내세요?',es:'Hola, ¿cómo estás?',de:'Hallo, wie geht es dir?',fr:'Bonjour, comment allez-vous ?',gu:'નમસ્તે, તમે કેમ છો?',as:'নমস্কাৰ, আপুনি কেনে আছে?'};
for(const l of langs){
 const r=await p.evaluate(async([l,t])=>{window.__plays.length=0;const U=window.B.ui;
  await new Promise(res=>{U.speak(t,l,res,1);setTimeout(res,25000)});
  const src=window.__plays[0];if(!src)return{err:'no audio played'};
  const ab=await (await fetch(src)).arrayBuffer();const dv=new DataView(ab);let n=(ab.byteLength-44)/2,s=0;for(let i=0;i<n;i++){const v=dv.getInt16(44+i*2,true);s+=v*v}
  return{bytes:ab.byteLength,rms:Math.round(Math.sqrt(s/n)),sec:+(n/(dv.getUint32(24,true))).toFixed(2)}},[l,text[l]]);
 const ok=!r.err&&r.rms>300&&r.sec>0.5;if(!ok)fails++;console.log(ok?'ok  ':'FAIL',l,JSON.stringify(r));}
console.log('page errors',errs);
console.log(fails||errs.length?'FAILED':'ALL PASS');await b.close();process.exit(fails||errs.length?1:0)})();
