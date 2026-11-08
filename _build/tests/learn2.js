// node tests/learn2.js : speech sanitising, numbers/money/time/dates, tone variants, songs, why notes, night reading
const {chromium}=require('playwright');const BASE=process.env.BASE||'http://localhost:8766';let fails=0;
function ok(c,m){if(!c){fails++;console.log('FAIL',m);}else console.log('ok  ',m);}
const CODES={te:'te-IN',hi:'hi-IN',kn:'kn-IN',ta:'ta-IN',ml:'ml-IN',bn:'bn-IN',mr:'mr-IN',gu:'gu-IN',as:'as-IN',ko:'ko-KR',es:'es-ES',de:'de-DE',fr:'fr-FR',en:'en-US',or:'or-IN',ne:'ne-NP',ja:'ja-JP'};
const FAKE=`(()=>{window.__sp=[];const codes=${JSON.stringify(CODES)};const V=Object.values(codes).map(x=>({name:'V'+x,lang:x,voiceURI:x,localService:true,default:false}));
window.SpeechSynthesisUtterance=function(t){this.text=t;};
Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>V,speak:u=>{window.__sp.push([u.text,u.lang]);setTimeout(()=>u.onstart&&u.onstart(),3);setTimeout(()=>u.onend&&u.onend(),20);},cancel(){},addEventListener(){},speaking:false},configurable:true});})();`;
(async()=>{const b=await chromium.launch();
async function page(set,extra){const c=await b.newContext({viewport:{width:1100,height:900}});
 await c.addInitScript(([s,f,x])=>{if(!localStorage.getItem('__i')){localStorage.setItem('__i','1');localStorage.setItem('bh-tour','1');localStorage.setItem('bh-tours','{"read":1,"review":1,"write":1}');localStorage.setItem('bh-set',JSON.stringify(Object.assign({ui:'en',focus:'te',ov:'no',sound:false,haptic:false},s)));}eval(f);if(x)eval(x);},[set||{},FAKE,extra||'']);
 const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('console',m=>{if(m.type()==='error')p.errs.push(m.text());});p.ctx=c;return p;}
// speech: lone punctuation is never spoken, even if the engine splits sentences badly
{const p=await page({},`(()=>{const O=Intl.Segmenter;Intl.Segmenter=function(l,o){const s=new O(l,o);return {segment:t=>{const a=[];const m=String(t).match(/[^?!।]+|[?!।]+/g)||[t];m.forEach(x=>a.push({segment:x}));return a;}};};})();`);
 await p.goto(BASE+'/');await p.waitForTimeout(400);
 const r=await p.evaluate(async()=>{const out={};
  for(const [txt,l] of [['ఎలా ఉన్నారు?','te'],['?','te'],['!?','hi'],['आप कैसे हैं?!','hi'],['Hello?','en'],['నమస్కారం 🔊','te'],['  ','hi']]){window.__sp.length=0;B.ui.speak(txt,l,null,0.9);await new Promise(r=>setTimeout(r,300));out[txt]=window.__sp.map(x=>x[0]);}
  return out;});
 for(const k in r){const bad=r[k].some(x=>!/[\p{L}\p{N}]/u.test(x));ok(!bad,'speech: no punctuation-only utterance for "'+k+'" '+JSON.stringify(r[k]));}
 ok(r['?'].length===0&&r['!?'].length===0&&r['  '].length===0,'speech: nothing spoken for punctuation-only or empty text');
 ok(r['ఎలా ఉన్నారు?'].join('').includes('?'),'speech: question mark stays inside the sentence');
 ok(!/🔊/.test(r['నమస్కారం 🔊'].join('')),'speech: emoji stripped before speaking');await p.ctx.close();}
// numbers / money / time / dates in every language
for(const l of Object.keys(CODES)){const p=await page({focus:l});await p.goto(BASE+'/numbers/');await p.waitForTimeout(400);
 for(const m of ['n','m','t','d']){await p.click('.seg [data-m='+m+']');await p.waitForTimeout(250);
  const sp=await p.evaluate(()=>window.__sp.slice(-1)[0]);const opts=await p.$$('.nm-opt');
  ok(opts.length===3&&sp&&/[\p{L}\p{N}]/u.test(sp[0]),'numbers '+l+'/'+m+': 3 options, spoken '+JSON.stringify(sp&&sp[0]));
  if(m==='d'||m==='m'){ok(!/undefined|NaN|\?\?/.test(sp[0]),'numbers '+l+'/'+m+': clean text');}
  await opts[0].click();await p.waitForTimeout(80);ok(await p.isVisible('#nm-next'),'numbers '+l+'/'+m+': answer then next');}
 ok(p.errs.length===0,'numbers '+l+': no errors '+p.errs.join(';'));await p.ctx.close();}
// tone + songs in every language
for(const l of Object.keys(CODES)){const p=await page({focus:l});await p.goto(BASE+'/tone/');await p.waitForTimeout(300);
 const cards=await p.$$('.tone-card'),cols=await p.$$('.tone-col');ok(cards.length===6&&cols.length===12,'tone '+l+': 6 cards, 12 columns');
 const same=await p.$$eval('.tone-card',cs=>cs.map(c=>[...c.querySelectorAll('.ph-t')].map(x=>x.textContent)).filter(x=>x[0]===x[1]).length);
 if(l!=='en')ok(same<=1,'tone '+l+': formal and casual differ ('+same+' same)');
 const cjk=l==='ja'?await p.$$eval('.ph-r',e=>e.filter(x=>/[一-鿿]/.test(x.textContent)).map(x=>x.textContent)):[];ok(cjk.length===0,'tone '+l+': romanization has no leftover kanji ('+cjk+')');
 await p.goto(BASE+'/songs/');await p.waitForTimeout(300);
 ok((await p.$$('.vs-line')).length===4,'songs '+l+': 4 lines');
 await p.evaluate(()=>{window.__sp.length=0});await p.click('#sg-all');await p.waitForTimeout(1600);
 const sp=await p.evaluate(()=>window.__sp.map(x=>x[0]));ok(sp.length===4&&sp.every(x=>/[\p{L}]/u.test(x)),'songs '+l+': play all speaks 4 lines ('+sp.length+')');
 await p.click('#app .seg button:nth-child(2)');await p.waitForTimeout(200);ok((await p.$$('.vs-line')).length===4,'songs '+l+': second verse');
 const cjk2=l==='ja'?await p.$$eval('.ph-r',e=>e.filter(x=>/[一-鿿]/.test(x.textContent)).length):0;ok(cjk2===0,'songs '+l+': romanization clean');
 ok(p.errs.length===0,'tone/songs '+l+': no errors '+p.errs.join(';'));await p.ctx.close();}
// why notes in phrases and Today, in a few UI languages
for(const ui of ['en','hi','te','ko','fr','as']){const p=await page({ui,focus:'te'});await p.goto(BASE+'/phrases/');await p.waitForTimeout(300);
 const n=await p.$$eval('.why',e=>e.length);ok(n>=1,'why '+ui+': notes on greetings ('+n+')');
 if(n){await p.click('.why summary');const txt=await p.textContent('.why p');ok(txt.length>30,'why '+ui+': note text opens');if(ui!=='en')ok(!/^Greetings carry/.test(txt),'why '+ui+': translated');}
 ok(p.errs.length===0,'why '+ui+': no errors '+p.errs.join(';'));await p.ctx.close();}
// night reading
{const p=await page({});await p.goto(BASE+'/read/');await p.waitForTimeout(300);
 ok(!(await p.evaluate(()=>document.documentElement.hasAttribute('data-night'))),'night: off by default');
 await p.click('text=🌙');await p.waitForTimeout(100);ok(await p.evaluate(()=>document.documentElement.hasAttribute('data-night')),'night: on from Read');
 await p.reload();await p.waitForTimeout(300);ok(await p.evaluate(()=>document.documentElement.hasAttribute('data-night')),'night: remembered');
 const bg=await p.evaluate(()=>getComputedStyle(document.body).backgroundColor);ok(/rgb\(2[0-9], 2[0-9], 1[0-9]\)|rgb\(27, 24, 18\)/.test(bg),'night: warm dark background '+bg);
 await p.click('[aria-controls=setp]');await p.click('#setp .seg >> nth=3 >> button:nth-child(1)').catch(()=>{});
 ok(p.errs.length===0,'night: no errors '+p.errs.join(';'));await p.ctx.close();}
console.log(fails?'FAILED '+fails:'ALL PASS');await b.close();process.exit(fails?1:0);})();
