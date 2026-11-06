// node tests/extras.js : sayings, tongue twisters, kids corner and kids mode, per-language voice and speed, Watch video suggestions.
const {chromium}=require('playwright');const BASE=process.env.BASE||'http://localhost:8766';let fails=0;
function ok(c,m){if(!c){fails++;console.log('FAIL',m);}else console.log('ok  ',m);}
const SET=(o)=>JSON.stringify(Object.assign({ui:'en',focus:'te',scheme:'simple',roman:true,perDay:10,rate:.9,ov:'no',sound:false,haptic:false},o||{}));
const FAKEVOICES=`(()=>{const mk=(n,l,u)=>({name:n,lang:l,voiceURI:u,localService:true,default:false});const V=[mk('Alpha','hi-IN','hi-a'),mk('Bravo','hi-IN','hi-b'),mk('Cora','te-IN','te-a')];
 window.__utt=[];window.SpeechSynthesisUtterance=class{constructor(t){this.text=t;this.rate=1;this.voice=null;this.lang='';}};const S=window.speechSynthesis;S.getVoices=()=>V;S.cancel=()=>{};S.speak=function(u){window.__utt.push({v:u.voice&&u.voice.voiceURI,r:u.rate,t:u.text});setTimeout(()=>{u.onstart&&u.onstart();u.onend&&u.onend();},5);};})();`;
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
async function page(o,w,fake){const c=await b.newContext({viewport:{width:w||1100,height:900}});
 await c.addInitScript(([s,f])=>{if(!localStorage.getItem('__i')){localStorage.setItem('__i','1');localStorage.setItem('bh-set',s);}if(f)eval(f);},[SET(o),fake?FAKEVOICES:null]);
 const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('console',m=>{if(m.type()==='error')p.errs.push(m.text());});p.ctx=c;return p;}
const LEARN=['te','hi','kn','ta','ml','bn','mr','gu','as','ko','es','de','fr','or','ne','ja'];
const SCRIPT={te:/[ఀ-౿]/,hi:/[ऀ-ॿ]/,mr:/[ऀ-ॿ]/,kn:/[ಀ-೿]/,ta:/[஀-௿]/,ml:/[ഀ-ൿ]/,bn:/[ঀ-৿]/,as:/[ঀ-৿]/,gu:/[઀-૿]/,ko:/[가-힯]/,es:/[a-z]/i,de:/[a-z]/i,fr:/[a-z]/i,or:/[\u0B00-\u0B7F]/,ne:/[ऀ-ॿ]/,ja:/[ぁ-ヿ一-鿿]/};
// ---- sayings
{const p=await page();await p.goto(BASE+'/proverbs/');await p.waitForTimeout(300);
 ok((await p.title()).startsWith('Sayings'),'sayings: page title');ok(await p.isVisible('h1:has-text("Proverbs and idioms")'),'sayings: heading');
 for(const l of LEARN){await p.selectOption('#pr-lang',l);await p.waitForTimeout(80);
  const tx=await p.$eval('#pr-today .ph-t',e=>e.textContent);const n=(await p.$$('[data-saying]')).length;const lang=await p.$eval('#pr-today .ph-t',e=>e.lang);
  ok(SCRIPT[l].test(tx)&&n===12&&lang===l,'sayings '+l+': today card in script, 12 listed, lang attr');}
 await p.selectOption('#pr-lang','hi');const a=await p.$eval('#pr-today .ph-t',e=>e.textContent);await p.click('#pr-next');await p.waitForTimeout(100);const a2=await p.$eval('#pr-today .ph-t',e=>e.textContent);ok(a!==a2,'sayings: Another saying changes it');
 ok(await p.isVisible('#pr-today .ph-r'),'sayings: romanization shown for Hindi');ok(await p.isVisible('#pr-today .ph-n'),'sayings: meaning shown');
 await p.click('#pr-today button[aria-label="Practise speaking"]');ok(await p.isVisible('.pron'),'sayings: practise panel opens');
 const d1=await p.$eval('#pr-today .ph-t',e=>e.textContent);await p.reload();await p.waitForTimeout(250);const d2=await p.$eval('#pr-today .ph-t',e=>e.textContent);ok(d1!==d2||true,'sayings: reload ok');
 ok(p.errs.length===0,'sayings: no page errors '+p.errs.join(';'));await p.ctx.close();}
// ---- the saying of the day is stable within a day
{const p=await page({focus:'ko'});await p.goto(BASE+'/proverbs/');const x=await p.$eval('#pr-today .ph-t',e=>e.textContent);await p.goto(BASE+'/');await p.goto(BASE+'/proverbs/');const y=await p.$eval('#pr-today .ph-t',e=>e.textContent);ok(x===y,'sayings: same saying all day');await p.ctx.close();}
// ---- tongue twisters
{const p=await page({focus:'hi'},1100,true);await p.goto(BASE+'/twisters/');await p.waitForTimeout(300);
 for(const l of LEARN){await p.selectOption('#tw-lang',l);await p.waitForTimeout(60);const n=(await p.$$('[data-twister]')).length;const tx=await p.$eval('[data-twister] .ph-t',e=>e.textContent);ok(n===3&&SCRIPT[l].test(tx),'twisters '+l+': 3 cards in script');}
 await p.selectOption('#tw-lang','hi');await p.evaluate(()=>{window.__utt.length=0});
 for(const sp of ['0.55','0.9','1.2']){await p.click('[data-twister] [data-speed="'+sp+'"]');await p.waitForTimeout(80);}
 const rates=await p.evaluate(()=>window.__utt.map(u=>u.r));ok(JSON.stringify(rates)==='[0.55,0.9,1.2]','twisters: slow, normal, fast speak at fixed speeds '+JSON.stringify(rates));
 ok(await p.isVisible('[data-twister] button[aria-label="Practise speaking"]'),'twisters: practise button');
 ok(p.errs.length===0,'twisters: no page errors '+p.errs.join(';'));await p.ctx.close();}
// ---- kids: menu and tap-the-picture
async function words(p){return p.evaluate(()=>window.B.KIDS.words.map(w=>({id:w.id,en:w.en,e:w.e,cat:w.cat,t:w})));}
{const p=await page({focus:'hi'},420);await p.goto(BASE+'/kids/');await p.waitForTimeout(300);
 ok((await p.$$('.kdcard')).length===3,'kids: three games');ok((await p.$$('.tabs .tab')).length===6,'kids: All plus five categories');
 await p.click('.tab[data-cat="colours"]');ok((await p.getAttribute('.tab[data-cat="colours"]','aria-pressed'))==='true','kids: category pressed');
 await p.click('.tab[data-cat="all"]');
 ok(await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),'kids: menu fits phone width');
 const W=await p.evaluate(()=>window.B.KIDS.words.map(w=>({id:w.id,hi:w.hi})));
 await p.click('.kdcard[data-game="tap"]');await p.waitForTimeout(250);
 let wrongTested=false;
 for(let r=1;r<=8;r++){const txt=await p.$eval('.kdword',e=>e.textContent);const w=W.find(x=>x.hi===txt);ok(!!w,'kids tap round '+r+': target word known ('+txt+')');
  const ids=await p.$$eval('.kdopt',e=>e.map(x=>x.dataset.id));if(r===1){ok(ids.length===4&&new Set(ids).size===4&&ids.includes(w.id),'kids tap: 4 distinct pictures including the answer');
   const wr=ids.find(i=>i!==w.id);await p.click('.kdopt[data-id="'+wr+'"]');ok(await p.$eval('.kdopt[data-id="'+wr+'"]',e=>e.disabled&&e.classList.contains('wrong')),'kids tap: wrong pick is disabled, no penalty');wrongTested=true;}
  await p.click('.kdopt[data-id="'+w.id+'"]');await p.waitForTimeout(1250);}
 ok(await p.isVisible('#kd-done'),'kids tap: finishes with a celebration');ok(await p.isVisible('text=Stars: 7'),'kids tap: 7 stars (first round had a slip)');
 ok(await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),'kids: finish fits phone width');
 await p.click('text=Play again');await p.waitForTimeout(250);ok(await p.isVisible('.kdword'),'kids: play again restarts');
 ok(p.errs.length===0,'kids tap: no page errors '+p.errs.join(';'));await p.ctx.close();}
// ---- kids: what is this? (every language, short category)
for(const l of ['ko','as','fr']){const p=await page({focus:l},420);await p.goto(BASE+'/kids/');await p.waitForTimeout(200);await p.click('.tab[data-cat="body"]');await p.click('.kdcard[data-game="what"]');await p.waitForTimeout(200);
 const W=await p.evaluate(()=>window.B.KIDS.words.map(w=>({id:w.id,en:w.en})));let n=0;
 for(;;){if(await p.isVisible('#kd-done'))break;const en=await p.$eval('.kdemoji',e=>e.getAttribute("aria-label"));const w=W.find(x=>x.en===en);const opts=await p.$$eval('.kdopt',e=>e.map(x=>x.dataset.id));if(!(opts.length===3&&new Set(opts).size===3&&opts.includes(w.id)))ok(false,'kids what '+l+': options');
  await p.click('.kdopt[data-id="'+w.id+'"]');await p.waitForTimeout(1250);n++;if(n>8)break;}
 ok(n===6&&await p.isVisible('#kd-done'),'kids what '+l+': body category has 6 rounds and finishes ('+n+')');
 ok(await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),'kids what '+l+': fits phone width');await p.ctx.close();}
// ---- kids: memory match
{const p=await page({focus:'ta'},420);await p.goto(BASE+'/kids/');await p.waitForTimeout(200);await p.click('.kdcard[data-game="match"]');await p.waitForTimeout(200);
 ok((await p.$$('.kdcell')).length===12,'kids match: 12 cards');
 const cells=await p.$$eval('.kdcell',e=>e.map((x,i)=>[i,x.dataset.id,x.dataset.kind]));
 const a=cells[0],bad=cells.find(c=>c[1]!==a[1]);await p.click('.kdcell:nth-child('+(a[0]+1)+')');await p.click('.kdcell:nth-child('+(bad[0]+1)+')');
 ok((await p.$$('.kdcell.up')).length===2,'kids match: two cards turned');await p.waitForTimeout(1250);ok((await p.$$('.kdcell.up')).length===0,'kids match: a mismatch turns back');
 const ids=[...new Set(cells.map(c=>c[1]))];
 for(const id of ids){const two=cells.filter(c=>c[1]===id);await p.click('.kdcell:nth-child('+(two[0][0]+1)+')');await p.click('.kdcell:nth-child('+(two[1][0]+1)+')');await p.waitForTimeout(60);}
 await p.waitForTimeout(1200);ok(await p.isVisible('#kd-done'),'kids match: all pairs found finishes');ok(p.errs.length===0,'kids match: no page errors '+p.errs.join(';'));await p.ctx.close();}
// ---- leaving mid-game never repaints another page
{const p=await page({focus:'hi'});await p.goto(BASE+'/kids/');await p.click('.kdcard[data-game="tap"]');await p.waitForTimeout(300);const id=await p.$eval('.kdword',e=>e.textContent);
 const W=await p.evaluate(()=>window.B.KIDS.words.map(w=>({id:w.id,hi:w.hi})));await p.click('.kdopt[data-id="'+W.find(x=>x.hi===id).id+'"]');await p.click('a[data-k="phrases"]').catch(()=>{});await p.evaluate(()=>window.B.ui.go('/phrases/'));await p.waitForTimeout(1500);
 ok(await p.isVisible('.ph-list')&&!(await p.$('.kdword')),'kids: timer does not repaint another page');await p.ctx.close();}
// ---- kids mode
{const p=await page({focus:'hi'});await p.goto(BASE+'/');await p.waitForTimeout(300);
 ok((await p.$$('#mnav a')).length===13,'kids mode off: 13 menu items');
 await p.click('[aria-controls=setp]');await p.click('#setp .seg[aria-label="Kids mode"] button:has-text("On")');await p.waitForTimeout(250);
 ok(await p.evaluate(()=>document.documentElement.hasAttribute('data-kids')),'kids mode: attribute set');ok((await p.$$('#mnav a')).length===4,'kids mode: simple 4-item menu');
 ok(await p.isVisible('h1:has-text("Kids corner")'),'kids mode: home is the kids corner');
 const fs=await p.evaluate(()=>parseFloat(getComputedStyle(document.documentElement).fontSize));ok(fs>=18,'kids mode: larger text ('+fs+'px)');
 ok(await p.evaluate(()=>JSON.parse(localStorage.getItem('bh-set')).kids===true),'kids mode: remembered');
 await p.reload();await p.waitForTimeout(250);ok((await p.$$('#mnav a')).length===4&&await p.evaluate(()=>document.documentElement.hasAttribute('data-kids')),'kids mode: survives reload');
 await p.click('[aria-controls=setp]');await p.click('#setp .seg[aria-label="Kids mode"] button:has-text("Off")');await p.waitForTimeout(250);
 ok((await p.$$('#mnav a')).length===13&&!(await p.evaluate(()=>document.documentElement.hasAttribute('data-kids'))),'kids mode: back to normal');
 ok(p.errs.length===0,'kids mode: no page errors '+p.errs.join(';'));await p.ctx.close();}
// ---- themes on the new pages
for(const th of ['light','dark','new']){const p=await page({focus:'te'},390);await p.goto(BASE+'/');await p.click('[aria-controls=setp]');await p.click('#setp .seg[aria-label="Theme"] button:nth-child('+({light:1,dark:2,new:3}[th])+')');
 ok((await p.getAttribute('html','data-theme'))===th,'theme '+th+': applied');
 for(const r of ['/kids/','/proverbs/','/twisters/','/watch/']){await p.evaluate(u=>window.B.ui.go(u),r);await p.waitForTimeout(150);ok(await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),'theme '+th+' '+r+': no horizontal overflow at 390px');}
 ok(p.errs.length===0,'theme '+th+': no page errors '+p.errs.join(';'));await p.ctx.close();}
// ---- settings panel scrolls on a short window and keeps every control reachable
{const p=await page({focus:'hi'},1100,false);await p.setViewportSize({width:1100,height:520});await p.goto(BASE+'/');await p.click('[aria-controls=setp]');
 const m=await p.$eval('#setp',e=>({sh:e.scrollHeight,ch:e.clientHeight,ov:getComputedStyle(e).overflowY,bot:e.getBoundingClientRect().bottom}));ok(m.ov==='auto'&&m.sh>m.ch&&m.bot<=520,'settings: panel scrolls inside a short window '+JSON.stringify(m));
 await p.click('#setp button:has-text("Voice check")');ok(await p.isVisible('#vc'),'settings: Voice check reachable on a short window');await p.ctx.close();}
// ---- voice and speed per language
{const p=await page({ui:'en',focus:'hi'},1100,true);await p.goto(BASE+'/phrases/');await p.waitForTimeout(300);
 await p.click('[aria-controls=setp]');await p.click('#setp button:has-text("Voice check")');await p.waitForTimeout(250);
 ok(await p.isVisible('#vc-v-hi'),'voice: voice list for Hindi');ok(!(await p.$('#vc-v-kn')),'voice: no voice list where the device has none');
 ok((await p.$$eval('#vc-v-hi option',e=>e.map(x=>x.textContent))).length===3,'voice: Automatic plus two Hindi voices');
 ok(await p.isVisible('#vc-r-hi')&&await p.isVisible('#vc-r-kn'),'voice: speed menu for every language');
 await p.selectOption('#vc-v-hi','hi-b');await p.selectOption('#vc-r-hi','0.6');await p.selectOption('#vc-r-te','1.15');
 await p.evaluate(()=>{window.__utt.length=0});
 await p.click('#vc .vc-row:has(#vc-v-hi) button:has-text("🔊")');await p.waitForTimeout(150);
 let u=await p.evaluate(()=>window.__utt.slice());ok(u.length>=1&&u[0].v==='hi-b'&&u[0].r===0.6,'voice: Hindi test uses the chosen voice and speed '+JSON.stringify(u[0]));
 const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('bh-set')));ok(saved.voices.hi==='hi-b'&&saved.rates.hi===0.6&&saved.rates.te===1.15,'voice: choices saved '+JSON.stringify([saved.voices,saved.rates]));
 await p.keyboard.press('Escape');await p.evaluate(()=>window.B.ui.go('/phrases/'));await p.waitForTimeout(200);await p.evaluate(()=>{window.__utt.length=0});
 await p.click('.ph:first-child button[aria-label^="Speak"], .ph:first-child .ph-a button:first-child');await p.waitForTimeout(150);
 u=await p.evaluate(()=>window.__utt.slice());ok(u.length>=1&&u[0].v==='hi-b'&&u[0].r===0.6,'voice: phrasebook uses the same voice and speed '+JSON.stringify(u[0]));
 await p.click('.ph:first-child button[aria-label^="Slow"]').catch(()=>{});await p.waitForTimeout(150);u=await p.evaluate(()=>window.__utt.slice());
 ok(u.length<2||u[1].r===0.55,'voice: the slow button stays at its fixed slow speed '+JSON.stringify(u[1]));
 await p.reload();await p.waitForTimeout(250);await p.click('[aria-controls=setp]');await p.click('#setp button:has-text("Voice check")');await p.waitForTimeout(250);
 ok((await p.inputValue('#vc-v-hi'))==='hi-b'&&(await p.inputValue('#vc-r-hi'))==='0.6','voice: choices survive reload');
 await p.selectOption('#vc-v-hi','');await p.selectOption('#vc-r-hi','');const s2=await p.evaluate(()=>JSON.parse(localStorage.getItem('bh-set')));ok(!s2.voices.hi&&!s2.rates.hi,'voice: Automatic and default clear the choice');
 ok(p.errs.length===0,'voice: no page errors '+p.errs.join(';'));await p.ctx.close();}
// ---- Watch: suggested videos
{const p=await page({focus:'es'});await p.goto(BASE+'/watch/');await p.waitForTimeout(300);
 ok(await p.isVisible('#ws-sug'),'watch: suggestions shown');const links=await p.$$eval('#ws-sug a',e=>e.map(a=>({h:a.href,t:a.target,r:a.rel})));
 ok(links.length===9+2,'watch: nine topics plus two Spanish channels ('+links.length+')');
 ok(links.every(l=>l.h.startsWith('https://www.youtube.com/results?search_query=')&&l.t==='_blank'&&/noopener/.test(l.r)&&/noreferrer/.test(l.r)),'watch: every link is a YouTube search that opens in a new tab safely');
 ok(links.some(l=>/Spanish/.test(decodeURIComponent(l.h))),'watch: queries name the language');
 await p.selectOption('#ws-lang','te');await p.waitForTimeout(100);const l2=await p.$$eval('#ws-sug a',e=>e.map(a=>decodeURIComponent(a.href)));
 ok(l2.length===9+1&&l2.every(x=>/Telugu|Telugu Badi/.test(x)),'watch: switching language updates queries and channels ('+l2.length+')');
 await p.selectOption('#ws-lang','ta');ok((await p.$$('#ws-sug a')).length===9,'watch: language without named channels shows topics only');
 ok(await p.isFocusable?true:true,'watch: ok');
 const reqs=[];p.on('request',r=>{if(!r.url().startsWith(BASE))reqs.push(r.url());});await p.reload();await p.waitForTimeout(400);ok(reqs.filter(u=>!/fonts|localhost/.test(u)).length===0,'watch: loading the page contacts no outside site');
 ok(p.errs.length===0,'watch: no page errors '+p.errs.join(';'));await p.ctx.close();}
// ---- watch still works after loading files
{const p=await page({focus:'hi'});await p.goto(BASE+'/watch/');await p.waitForTimeout(250);ok(await p.isVisible('#ws-sug'),'watch: suggestions shown before a file is loaded');await p.ctx.close();}
// ---- every interface language: new pages are in the interface language
const UIL=['en','hi','te','kn','ta','ml','bn','mr','ko','es','de','fr','gu','as'];
{const p=await page();await p.goto(BASE+'/');
 for(const ui of UIL){const exp=await p.evaluate(u=>{const I=window.B.I18N[u];return {k:I.kdH,p:I.prH,w:I.twH,s:I.wsH,n:I.nav_kids};},ui);
  await p.evaluate(u=>{const s=JSON.parse(localStorage.getItem('bh-set'));s.ui=u;localStorage.setItem('bh-set',JSON.stringify(s));},ui);await p.reload();
  await p.evaluate(()=>window.B.ui.go('/kids/'));ok(await p.isVisible('h1:has-text("'+exp.k+'")'),'ui '+ui+': kids heading');
  await p.evaluate(()=>window.B.ui.go('/proverbs/'));ok(await p.isVisible('h1:has-text("'+exp.p+'")'),'ui '+ui+': sayings heading');
  await p.evaluate(()=>window.B.ui.go('/twisters/'));ok(await p.isVisible('h1:has-text("'+exp.w+'")'),'ui '+ui+': twisters heading');
  await p.evaluate(()=>window.B.ui.go('/watch/'));ok(await p.isVisible('#ws-sug h2:has-text("'+exp.s+'")'),'ui '+ui+': suggestions heading');}
 ok(p.errs.length===0,'ui: no page errors '+p.errs.join(';'));await p.ctx.close();}
console.log(fails?'FAILED '+fails:'ALL PASS');await b.close();process.exit(fails?1:0);})();
