// node tests/feel.js : pronunciation practice, sounds/vibration/celebration, Free and private page. Needs the site on BASE (default :8766).
const {chromium}=require('playwright');const BASE=process.env.BASE||'http://localhost:8766';let fails=0;
function ok(c,m){if(!c){fails++;console.log('FAIL',m);}else console.log('ok  ',m);}
const SET=(o)=>JSON.stringify(Object.assign({ui:'en',focus:'te',scheme:'simple',roman:true,perDay:10,rate:.9,ov:'no'},o||{}));
(async()=>{const b=await chromium.launch({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--autoplay-policy=no-user-gesture-required']});
async function page(o,perm,init){const c=await b.newContext({viewport:{width:1100,height:900},permissions:perm===false?[]:['microphone'],reducedMotion:(o&&o.rm)?'reduce':'no-preference'});
 await c.addInitScript(([s,i])=>{if(!localStorage.getItem('__i')){localStorage.setItem('__i','1');localStorage.setItem('bh-set',s);if(i)for(const k in i)localStorage.setItem(k,i[k]);}
  window.__vib=[];navigator.vibrate=function(p){window.__vib.push(p);return true;};window.__osc=0;const A=window.AudioContext;if(A){const o=A.prototype.createOscillator;A.prototype.createOscillator=function(){window.__osc++;return o.apply(this,arguments);};}},[SET(o),init||null]);
 const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/getUserMedia|Permission|NotAllowed/i.test(m.text()))p.errs.push(m.text());});p.ctx=c;return p;}
// ---- phrases: practise a phrase
{const p=await page();await p.goto(BASE+'/phrases/');await p.waitForTimeout(300);
 ok((await p.$$('.ph-a button[aria-label="Practise speaking"]')).length===(await p.$$('.ph')).length,'pron: every phrase has a practise button');
 await p.click('.ph:first-child button[aria-label="Practise speaking"]');ok(await p.isVisible('.pron'),'pron: panel opens');
 ok((await p.getAttribute('.ph:first-child button[aria-label="Practise speaking"]','aria-expanded'))==='true','pron: aria-expanded true');
 ok(await p.isDisabled('.pron .abtn.gold')===false,'pron: record enabled');
 await p.click('.pron .abtn.gold');await p.waitForTimeout(700);ok(await p.isVisible('.pron .abtn.rec'),'pron: recording state shown');ok(await p.isVisible('.pr-meter'),'pron: level meter shown while recording');
 await p.click('.pron .abtn.rec');await p.waitForTimeout(900);
 ok(await p.isVisible('.pr-wave'),'pron: waveform shown after recording');ok(+await p.getAttribute('.pr-wave','data-dur')>0.3,'pron: recorded duration measured');
 const px=await p.$eval('.pr-wave',cv=>{const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)n++;return n;});ok(px>200,'pron: waveform actually drawn ('+px+' px)');
 const names=await p.$$eval('.pron .abtn',e=>e.filter(x=>!x.hidden).map(x=>x.textContent));ok(names.length===4&&names.some(x=>/Your voice/.test(x))&&names.some(x=>/Compare/.test(x)),'pron: model, record, yours and compare buttons');
 // playing yours must not leave the page without a network request
 let played=false;await p.exposeFunction('__played',()=>{played=true;});await p.evaluate(()=>{const P=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__played();return P.apply(this,arguments);};});
 await p.click('.pron .abtn:has-text("Your voice")');await p.waitForTimeout(300);ok(played,'pron: your recording plays');
 const blobSrc=await p.evaluate(()=>{const a=[...document.querySelectorAll('audio')];return a.length;});
 ok(await p.evaluate(()=>localStorage.length&&Object.keys(localStorage).every(k=>!/rec|audio|voice/i.test(localStorage.getItem(k)||'x'.repeat(0))&&true)),'pron: nothing recorded is written to storage');
 const idb=await p.evaluate(()=>indexedDB.databases?indexedDB.databases().then(d=>d.length):0);ok(idb===0,'pron: nothing in IndexedDB');
 await p.click('.ph:first-child button[aria-label="Practise speaking"]');ok(!(await p.$('.pron')),'pron: panel closes');
 await p.click('.ph:nth-child(2) button[aria-label="Practise speaking"]');await p.click('.ph:nth-child(3) button[aria-label="Practise speaking"]');ok((await p.$$('.pron')).length>=1,'pron: other rows still open');
 await p.goto(BASE+'/privacy/');ok(p.errs.length===0,'pron: no page errors '+p.errs.join(';'));await p.ctx.close();}
// ---- denied microphone gives a clear message
{const p=await page(null,false);await p.addInitScript(()=>{navigator.mediaDevices.getUserMedia=()=>Promise.reject(Object.assign(new Error('x'),{name:'NotAllowedError'}));});await p.goto(BASE+'/phrases/');await p.waitForTimeout(250);
 await p.click('.ph:first-child button[aria-label="Practise speaking"]');await p.click('.pron .abtn.gold');await p.waitForTimeout(300);
 ok(/blocked/i.test(await p.textContent('.pr-msg')),'pron: blocked microphone explained');ok(!(await p.isVisible('.pr-wave')),'pron: no waveform when blocked');await p.ctx.close();}
// ---- no MediaRecorder: record button disabled, message
{const p=await page();await p.addInitScript(()=>{delete window.MediaRecorder;});await p.goto(BASE+'/phrases/');await p.waitForTimeout(250);await p.click('.ph:first-child button[aria-label="Practise speaking"]');
 ok(await p.isDisabled('.pron .abtn.gold'),'pron: record disabled without MediaRecorder');ok(/cannot record/i.test(await p.textContent('.pr-msg')),'pron: unsupported browser explained');await p.ctx.close();}
// ---- lesson: practise button in learn step; sounds, vibration and confetti
{const p=await page();await p.goto(BASE+'/today/');await p.waitForTimeout(250);await p.click('text=Start today');await p.waitForTimeout(200);
 ok((await p.$$('.lesson .ph-a button[aria-label="Practise speaking"]')).length===5,'lesson: practise button on each new phrase');
 await p.click('.lesson .ph:first-child button[aria-label="Practise speaking"]');ok(await p.isVisible('.lesson .pron'),'lesson: practise panel opens');
 await p.click('.lesson .abtn.gold.big');await p.waitForTimeout(250);ok(!(await p.$('.pron')),'lesson: practise panel closed when leaving the step');
 const v0=await p.evaluate(()=>window.__vib.length),o0=await p.evaluate(()=>window.__osc);
 for(let i=0;i<5;i++){const bt=await p.$$('.lesson .opts .abtn');await bt[0].click();await p.waitForTimeout(120);await p.click('.lesson .abtn.gold');await p.waitForTimeout(160);}
 const v1=await p.evaluate(()=>window.__vib.length),o1=await p.evaluate(()=>window.__osc);ok(v1>v0,'fx: vibration used on answers ('+(v1-v0)+')');ok(o1>o0,'fx: sounds played on answers ('+(o1-o0)+')');
 ok(!!(await p.$('.confetti i')),'fx: confetti on finishing the lesson');await p.waitForTimeout(2500);ok(!(await p.$('.confetti')),'fx: confetti removed afterwards');
 ok(p.errs.length===0,'fx: no page errors '+p.errs.join(';'));await p.ctx.close();}
// ---- mute and vibration off
{const p=await page({sound:false,haptic:false});await p.goto(BASE+'/today/');await p.waitForTimeout(250);await p.click('text=Start today');await p.click('.lesson .abtn.gold.big');await p.waitForTimeout(250);
 for(let i=0;i<5;i++){const bt=await p.$$('.lesson .opts .abtn');await bt[0].click();await p.waitForTimeout(100);await p.click('.lesson .abtn.gold');await p.waitForTimeout(140);}
 ok((await p.evaluate(()=>window.__osc))===0,'fx: sound off means no sound is made');ok((await p.evaluate(()=>window.__vib.length))===0,'fx: vibration off means no vibration');await p.ctx.close();}
// ---- reduced motion: no confetti, no entrance animation
{const p=await page({rm:true});await p.goto(BASE+'/today/');await p.waitForTimeout(250);await p.click('text=Start today');await p.click('.lesson .abtn.gold.big');await p.waitForTimeout(250);
 for(let i=0;i<5;i++){const bt=await p.$$('.lesson .opts .abtn');await bt[0].click();await p.waitForTimeout(100);await p.click('.lesson .abtn.gold');await p.waitForTimeout(140);}
 ok(!(await p.$('.confetti')),'fx: no confetti with reduced motion');ok(!(await p.$('.lesson.enter')),'fx: no entrance animation with reduced motion');await p.ctx.close();}
// ---- settings toggles persist
{const p=await page();await p.goto(BASE+'/');await p.click('[aria-controls=setp]');
 const seg=async(label,txt)=>{await p.click('#setp .seg[aria-label="'+label+'"] button:has-text("'+txt+'")');};
 await seg('Sound effects','Off');await seg('Vibration','Off');const s=await p.evaluate(()=>JSON.parse(localStorage.getItem('bh-set')));ok(s.sound===false&&s.haptic===false,'settings: sound and vibration switches are saved');
 await p.reload();await p.click('[aria-controls=setp]');ok((await p.getAttribute('#setp .seg[aria-label="Sound effects"] button:has-text("Off")','aria-pressed'))==='true','settings: sound switch remembered after reload');await p.ctx.close();}
// ---- conversation transcript: practise
{const p=await page({focus:'hi'});await p.goto(BASE+'/talk/');await p.waitForTimeout(250);await p.click('text=Meeting someone');await p.waitForTimeout(200);
 for(let t=0;t<4;t++){for(const o of await p.$$('.panel .opts .abtn')){await o.click().catch(()=>{});if(await p.$('.panel .opts .abtn.right'))break;}await p.click('.panel .abtn.gold');await p.waitForTimeout(120);}
 ok(await p.isVisible('.bubble'),'talk: transcript shown');ok((await p.$$('.bubble button[aria-label="Practise speaking"]')).length===8,'talk: practise button on every transcript line');
 ok(!!(await p.$('.confetti i')),'talk: confetti on finishing');await p.ctx.close();}
// ---- Free and private page
{const seed={'bh-words':JSON.stringify([{id:'te:నమస్తే',w:'నమస్తే',lang:'te',m:'hello',c:'',n:'',st:1,added:1,due:1,iv:1,ease:2.5,reps:0},{id:'te:ధన్యవాదాలు',w:'ధన్యవాదాలు',lang:'te',m:'thanks',c:'',n:'',st:1,added:1,due:1,iv:1,ease:2.5,reps:0}]),'bh-stats':JSON.stringify({'2026-10-01':4,'2026-10-02':2}),'bh-lesson':JSON.stringify({te:{cards:{hello:{due:1},morning:{due:1},thanks:{due:1}},days:{}}})};
 const p=await page(null,true,seed);await p.goto(BASE+'/privacy/');await p.waitForTimeout(300);
 ok(await p.isVisible('h1:has-text("Free and private")'),'privacy: page title');ok((await p.$$('.cards.pv .card')).length===4,'privacy: four promises');
 const txt=await p.textContent('#pv-stored');ok(/Saved words · 2 items/.test(txt),'privacy: counts saved words');ok(/Lesson phrases · 3 items/.test(txt),'privacy: counts lesson phrases');ok(/Study days · 2 items/.test(txt),'privacy: counts study days');
 // honest claim: this page and every other make no requests outside the site
 const out=[];p.on('request',r=>{const u=r.url();if(!u.startsWith(BASE)&&!u.startsWith('data:')&&!u.startsWith('blob:'))out.push(u);});
 for(const r of ['/','/today/','/talk/','/say/','/phrases/','/words/','/review/','/scripts/','/read/','/watch/','/privacy/']){await p.goto(BASE+r);await p.waitForTimeout(250);}
 ok(out.length===0,'privacy: no requests outside this site on any page '+out.join(','));
 ok((await p.evaluate(()=>document.cookie))==='','privacy: no cookies');
 ok((await p.$$eval('script',s=>s.filter(x=>x.src&&!x.src.startsWith(location.origin)).length))===0,'privacy: no third-party scripts');
 await p.goto(BASE+'/privacy/');await p.waitForTimeout(200);
 const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#pv-export')]);const fs=require('fs');const f=await dl.path();const j=JSON.parse(fs.readFileSync(f,'utf8'));
 ok(j.app==='bhasha'&&j.words.length===2&&Object.keys(j.stats).length===2&&Object.keys(j.lesson.te.cards).length===3&&j.settings.ui==='en','privacy: export contains words, stats, lesson and settings');
 // delete: cancel keeps data, confirm removes it
 await p.click('#pv-clear');ok(await p.isVisible('#pv-dlg'),'privacy: confirmation shown');await p.click('#pv-no');ok(!(await p.$('#pv-dlg')),'privacy: cancel closes');ok((await p.evaluate(()=>localStorage.getItem('bh-words')))!==null,'privacy: cancel keeps data');
 await p.click('#pv-clear');await p.click('#pv-yes');await p.waitForTimeout(200);
 const left=await p.evaluate(()=>['bh-words','bh-stats','bh-lesson','bh-set','bh-readtext'].filter(k=>localStorage.getItem(k)!==null));ok(left.length===0,'privacy: everything deleted ('+left.join(',')+')');
 ok(/Saved words · 0 items/.test(await p.textContent('#pv-stored')),'privacy: counts drop to zero');
 // restore from the exported file
 await p.setInputFiles('input[type=file]',f);await p.waitForTimeout(1200);
 const back=await p.evaluate(()=>[JSON.parse(localStorage.getItem('bh-words')).length,Object.keys(JSON.parse(localStorage.getItem('bh-stats'))).length,Object.keys(JSON.parse(localStorage.getItem('bh-lesson')).te.cards).length]);ok(back.join()==='2,2,3','privacy: restore brings everything back ('+back+')');
 // a wrong file is refused and changes nothing
 fs.writeFileSync('/tmp/not-a-backup.json','{"hello":1}');await p.setInputFiles('input[type=file]','/tmp/not-a-backup.json');await p.waitForTimeout(300);
 ok(/not a Bhasha backup/.test(await p.textContent('#toast')),'privacy: wrong file refused');ok((await p.evaluate(()=>JSON.parse(localStorage.getItem('bh-words')).length))===2,'privacy: wrong file changes nothing');
 // link from footer and home
 ok(await p.isVisible('#ftr a.pvlink'),'privacy: footer badge');await p.goto(BASE+'/');ok(await p.isVisible('a[href="/privacy/"]'),'privacy: reachable from home');
 ok(p.errs.length===0,'privacy: no page errors '+p.errs.join(';'));await p.ctx.close();}
// ---- the page and its buttons in every interface language
for(const l of ['en','hi','te','kn','ta','ml','bn','mr','ko','es','de','fr','gu','as']){const p=await page({ui:l});await p.goto(BASE+'/privacy/');await p.waitForTimeout(150);
 const want=await p.evaluate(l=>B.I18N[l].pvTitle,l);ok((await p.textContent('h1')).includes(want),'privacy '+l+': title in own language');
 const ov=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);ok(!ov,'privacy '+l+': no horizontal overflow');
 await p.goto(BASE+'/phrases/');await p.click('.ph:first-child button[aria-label]:last-child');const lab=await p.evaluate(l=>B.I18N[l].pronRec,l);ok((await p.textContent('.pron .abtn.gold')).includes(lab),'pron '+l+': record label in own language');await p.ctx.close();}
console.log(fails?'FAILED '+fails:'ALL PASS');await b.close();process.exit(fails?1:0);})();
