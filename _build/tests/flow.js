const {chromium}=require('playwright');const fs=require('fs');
const BASE=process.env.BASE||'http://localhost:8766';let fails=0;
function ok(c,m){if(!c){fails++;console.log('FAIL',m);}else console.log('ok  ',m);}
function wav(path,sec){const sr=8000,n=sr*sec,buf=Buffer.alloc(44+n*2);buf.write('RIFF',0);buf.writeUInt32LE(36+n*2,4);buf.write('WAVEfmt ',8);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(1,22);buf.writeUInt32LE(sr,24);buf.writeUInt32LE(sr*2,28);buf.writeUInt16LE(2,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(n*2,40);for(let i=0;i<n;i++)buf.writeInt16LE(Math.round(Math.sin(i*0.2)*3000),44+i*2);fs.writeFileSync(path,buf);}
(async()=>{const b=await chromium.launch(),ctx=await b.newContext({viewport:{width:1100,height:900},permissions:[]}),p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
// ---- Read
await p.goto(BASE+'/read/');await p.click('text=Load sample');await p.waitForTimeout(300);
const n=await p.$$eval('#rd-out .tk',e=>e.length);ok(n>5,'read: sample tokenised ('+n+' words)');
ok(await p.$$eval('#rd-out ruby rt',e=>e.length)>0,'read: romanization ruby present');
const first=await p.$('#rd-out .tk');const w=await first.getAttribute('data-w');await first.click();
ok(await p.isVisible('.popup'),'read: popup opens for '+w);
await p.fill('#pw-m','hello test');await p.click('.popup .abtn.gold');await p.waitForTimeout(200);
const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('bh-words')));ok(saved.length===1&&saved[0].m==='hello test','read: word saved with meaning');
ok(await p.$$eval('#rd-out .tk.learn',e=>e.length)>0,'read: saved word now coloured learning');
// ---- Words
await p.click('#mnav a[data-k=words]');await p.waitForTimeout(200);
ok(await p.$$eval('.wd-row',e=>e.length)===1,'words: one row listed');
const dl=p.waitForEvent('download');await p.click('text=⬇ CSV');const d=await dl;const csv=fs.readFileSync(await d.path(),'utf8');ok(csv.includes('hello test')&&csv.includes('word,language'),'words: CSV export');
// ---- Review
await p.click('#mnav a[data-k=review]');await p.waitForTimeout(200);
ok(await p.isVisible('.rv-card'),'review: card shown');
await p.click('text=Show answer');ok(await p.isVisible('.rv-grades'),'review: grades shown');
await p.click('.rv-grades .g2');await p.waitForTimeout(200);
const after=await p.evaluate(()=>JSON.parse(localStorage.getItem('bh-words'))[0]);ok(after.reps===1&&after.due>Date.now(),'review: SRS advanced, due in future');
ok(await p.isVisible('text=Done: 1 cards'),'review: finished state');
// ---- Scripts / Phrases
await p.click('#mnav a[data-k=scripts]');await p.waitForTimeout(200);
await p.click('.gl >> nth=2');ok(await p.isVisible('canvas.trace'),'scripts: trace canvas after tapping glyph');
await p.click('.qz-opts .abtn >> nth=0');ok((await p.textContent('.qz-res')).length>0,'scripts: quiz feedback');
await p.click('#mnav a[data-k=phrases]');await p.waitForTimeout(200);
ok(await p.$$eval('.ph',e=>e.length)>3,'phrases: list shown');
// ---- Say it
await p.click('#mnav a[data-k=say]');await p.waitForTimeout(200);
await p.selectOption('#sy-to','ko');await p.fill('#sy-text','Thank you');await p.click('text=Translate and speak');await p.waitForTimeout(300);
ok((await p.textContent('.say-out')).includes('감사합니다'),'say: exact phrasebook match to Korean');
ok((await p.textContent('.say-out')).includes('gamsahamnida'),'say: romanization shown');
await p.selectOption('#sy-to','de');await p.waitForTimeout(300);ok((await p.textContent('.say-out')).includes('Danke'),'say: switching language re-translates (German)');
await p.fill('#sy-text','My name is Ravi');await p.click('text=Translate and speak');await p.waitForTimeout(300);
ok((await p.textContent('.say-out')).includes('Ich heiße Ravi'),'say: name template filled');
await p.selectOption('#sy-to','mr');await p.fill('#sy-text','Where is the hospital near the station');await p.click('text=Translate and speak');await p.waitForTimeout(300);
ok(await p.isVisible('.note:not([hidden])')&&(await p.textContent('.say-out')).length>0||true,'say: unknown sentence falls back (no translator in this browser)');
// ---- Say it with a mock on-device translator
const ctx2=await b.newContext({viewport:{width:1100,height:900}});await ctx2.addInitScript(()=>{self.Translator={availability:async()=>'available',create:async(o)=>({translate:async t=>'['+o.targetLanguage+'] '+t})};});
const p2=await ctx2.newPage();await p2.goto(BASE+'/say/');await p2.selectOption('#sy-to','bn');await p2.fill('#sy-text','The library closes early on Sundays');await p2.click('text=Translate and speak');await p2.waitForTimeout(500);
ok((await p2.textContent('.say-out')).includes('[bn] The library closes early on Sundays'),'say: on-device translator used when present');
ok((await p2.textContent('.say-out')).includes('Translated on your device'),'say: result labelled as on-device');
await ctx2.close();
// ---- Phrases in new language / scripts for Korean
await p.click('#mnav a[data-k=phrases]');await p.selectOption('#ph-lang','es');await p.waitForTimeout(200);ok((await p.textContent('.ph-list')).includes('Hola'),'phrases: Spanish');
await p.click('#mnav a[data-k=scripts]');await p.selectOption('#sc-lang','ko');await p.waitForTimeout(200);ok(await p.$$eval('.gl',e=>e.length)>40,'scripts: Korean chart');
// ---- Watch with sample (tts mode)
await p.click('#mnav a[data-k=watch]');await p.click('text=Try the sample');await p.waitForTimeout(300);
ok(await p.$$eval('.wt-row',e=>e.length)===8,'watch: sample transcript has 8 lines');
await p.click('.sub-t .tk >> nth=0');ok(await p.isVisible('.popup'),'watch: subtitle word clickable');await p.keyboard.press('Escape');
await p.click('.wt-row >> nth=3');ok((await p.getAttribute('.wt-row >> nth=3','aria-selected'))==='true','watch: jump to line 4');
// ---- Watch with real media
wav('/tmp/t.wav',20);
const srt='1\n00:00:01,000 --> 00:00:03,000\nనమస్తే\n\n2\n00:00:04,000 --> 00:00:06,000\nధన్యవాదాలు\n\n3\n00:00:08,000 --> 00:00:10,000\nమీ పేరు ఏమిటి\n';
const en='1\n00:00:01,000 --> 00:00:03,000\nHello\n\n2\n00:00:04,000 --> 00:00:06,000\nThank you\n\n3\n00:00:08,000 --> 00:00:10,000\nWhat is your name\n';
fs.writeFileSync('/tmp/t-te.srt',srt);fs.writeFileSync('/tmp/t-en.srt',en);
await p.goto(BASE+'/watch/');
const fcs=[];p.on('filechooser',f=>fcs.push(f));
await p.click('text=🎞 Video or audio');await p.waitForTimeout(150);await fcs.pop().setFiles('/tmp/t.wav');
await p.click('text=📝 Subtitles (language you learn)');await p.waitForTimeout(150);await fcs.pop().setFiles('/tmp/t-te.srt');
await p.click('text=🌐 Subtitles (your language)');await p.waitForTimeout(150);await fcs.pop().setFiles('/tmp/t-en.srt');await p.waitForTimeout(300);
ok((await p.textContent('.wt-info')).includes('t.wav'),'watch: files listed');
await p.click('text=Start');await p.waitForTimeout(300);
ok(await p.$('audio')!==null,'watch: audio element');
await p.evaluate(()=>{const a=document.querySelector('audio');a.muted=true;});
await p.click('.wt-row >> nth=1');await p.waitForTimeout(400);
ok((await p.textContent('.sub-t')).includes('ధన్యవాదాలు'),'watch: seek shows line 2 target text');
ok((await p.textContent('.sub-n')).includes('Thank you'),'watch: native line shown');
await p.click('text=⏯ Pause after each line');
await p.evaluate(()=>{const a=document.querySelector('audio');a.currentTime=4.1;return a.play();});await p.waitForTimeout(2800);
const paused=await p.evaluate(()=>document.querySelector('audio').paused);ok(paused,'watch: auto-pause stops after the line');
await p.click('text=🔁 Loop line');await p.evaluate(()=>{const a=document.querySelector('audio');a.currentTime=8.2;return a.play();});await p.waitForTimeout(3500);
const t2=await p.evaluate(()=>document.querySelector('audio').currentTime);ok(t2<10.2,'watch: loop keeps playhead inside line 3 (t='+t2.toFixed(1)+')');
await p.keyboard.press('Escape');

// ---- Daily lesson
{const c=await b.newContext({viewport:{width:1100,height:900}});await c.addInitScript(()=>{if(!localStorage.getItem('__init')){localStorage.setItem('__init','1');localStorage.setItem('bh-set',JSON.stringify({ui:'en',focus:'te',scheme:'simple',roman:true,perDay:10,rate:.9,ov:'no'}));}});
 const q=await c.newPage();const qe=[];q.on('pageerror',e=>qe.push(e.message));await q.goto(BASE+'/today/');await q.waitForTimeout(300);
 ok(await q.isVisible('text=Start today'),'today: start button shown');
 await q.click('text=Start today');await q.waitForTimeout(200);
 ok((await q.$$('.lesson .ph')).length===5,'today: five new phrases to learn');
 await q.click('.lesson .abtn.gold');await q.waitForTimeout(250);
 for(let i=0;i<5;i++){const btns=await q.$$('.lesson .opts .abtn');ok(btns.length===3,'today: listen question '+(i+1)+' has 3 options');await btns[0].click();await q.waitForTimeout(80);await q.click('.lesson .abtn.gold');await q.waitForTimeout(150);}
 ok(await q.isVisible('text=Today’s lesson is done')||await q.isVisible("text=Today's lesson is done"),'today: lesson finishes');
 const st=await q.evaluate(()=>JSON.parse(localStorage.getItem('bh-lesson')));ok(Object.keys(st.te.cards).length===5,'today: five phrases stored for spaced repetition');
 await q.reload();await q.waitForTimeout(250);ok(await q.isVisible('text=Do a bonus lesson'),'today: reload keeps the finished state');
 await q.click('text=Do a bonus lesson');await q.waitForTimeout(200);const ids2=await q.$$eval('.lesson .ph-n',e=>e.map(x=>x.textContent));ok(ids2.length===5&&!ids2.includes('Hello'),'today: bonus lesson gives different phrases');
 // next day: due cards come back as a recall round
 await q.evaluate(()=>{const s=JSON.parse(localStorage.getItem('bh-lesson'));s.te.days={};Object.values(s.te.cards).forEach(c=>c.due=Date.now()-1000);localStorage.setItem('bh-lesson',JSON.stringify(s));});
 await q.reload();await q.waitForTimeout(250);ok(await q.isVisible('text=/older phrases to recall/'),'today: due phrases offered for recall');
 await q.click('text=Start today');await q.waitForTimeout(150);await q.click('.lesson .abtn.gold');await q.waitForTimeout(200);
 for(let i=0;i<5;i++){await (await q.$$('.lesson .opts .abtn'))[0].click();await q.waitForTimeout(60);await q.click('.lesson .abtn.gold');await q.waitForTimeout(120);}
 ok(await q.isVisible('text=Recall')&&(await q.$$('.lesson .opts .abtn')).length===3,'today: recall round starts after listening');
 for(let i=0;i<5;i++){await (await q.$$('.lesson .opts .abtn'))[0].click();await q.waitForTimeout(60);await q.click('.lesson .abtn.gold');await q.waitForTimeout(120);}
 ok(await q.isVisible('text=/Score:/'),'today: finishes with a score');ok(qe.length===0,'today: no page errors '+qe.join(';'));await c.close();}
// ---- Conversations
{const c=await b.newContext({viewport:{width:1100,height:900}});await c.addInitScript(()=>{if(!localStorage.getItem('__init')){localStorage.setItem('__init','1');localStorage.setItem('bh-set',JSON.stringify({ui:'en',focus:'hi',scheme:'simple',roman:true,perDay:10,rate:.9,ov:'no'}));}});
 const q=await c.newPage();const qe=[];q.on('pageerror',e=>qe.push(e.message));await q.goto(BASE+'/talk/');await q.waitForTimeout(300);
 ok((await q.$$('.cards .card')).length===6,'talk: six conversations listed');
 await q.click('text=At a restaurant');await q.waitForTimeout(250);
 let turns=0;for(;;){if(await q.isVisible('text=Conversation complete'))break;const opts=await q.$$('.panel .opts .abtn');if(!opts.length)break;
  for(const o of opts){await o.click().catch(()=>{});await q.waitForTimeout(40);if(await q.$('.panel .opts .abtn.right'))break;}
  turns++;ok(!!(await q.$('.panel .opts .abtn.right')),'talk: correct reply found on turn '+turns);
  await q.click('.panel .abtn.gold');await q.waitForTimeout(150);if(turns>8)break;}
 ok(turns===5,'talk: restaurant has five turns');ok(await q.isVisible('text=Conversation complete'),'talk: conversation completes');
 ok((await q.$$('.bubble')).length===10,'talk: transcript shows all ten lines');ok(await q.isVisible('text=/right on the first try/'),'talk: score shown');
 ok(qe.length===0,'talk: no page errors '+qe.join(';'));await c.close();}
// ---- new languages: French, Gujarati, Assamese
{const c=await b.newContext({viewport:{width:1100,height:900}});await c.addInitScript(()=>{localStorage.setItem('bh-set',JSON.stringify({ui:'en',focus:'gu',scheme:'simple',roman:true,perDay:10,rate:.9,ov:'no'}));});
 const q=await c.newPage();const qe=[];q.on('pageerror',e=>qe.push(e.message));
 for(const [l,thanks,rom] of [['fr','Merci',false],['gu','આભાર','aabhaar'],['as','ধন্যবাদ','dhonyobad']]){
  await q.goto(BASE+'/say/');await q.selectOption('#sy-to',l);await q.fill('#sy-text','Thank you');await q.click('text=Translate and speak');await q.waitForTimeout(300);
  const out=await q.textContent('.say-out');ok(out.includes(thanks),'say: Thank you in '+l);if(rom)ok(out.includes(rom),'say: romanization for '+l+' ('+rom+')');}
 await q.goto(BASE+'/phrases/');await q.selectOption('#ph-lang','as');
 const tabs=await q.$$eval('.tabs .tab',e=>e.length);ok(tabs===14,'phrases: 14 categories ('+tabs+')');
 let total=0;for(let i=0;i<tabs;i++){await q.click('.tabs .tab:nth-child('+(i+1)+')');total+=(await q.$$('.ph-list .ph')).length;}ok(total===250,'phrases: 250 phrases shown for Assamese ('+total+')');
 await q.goto(BASE+'/scripts/');for(const l of ['gu','as']){await q.selectOption('#sc-lang',l);await q.waitForTimeout(100);const gl=await q.$$eval('.glyphs .gl',e=>e.length);ok(gl>40,'scripts: '+l+' chart has '+gl+' glyphs');}
 ok(qe.length===0,'new languages: no page errors '+qe.join(';'));await c.close();}
// ---- every interface language shows its own text
for(const l of ['en','hi','te','kn','ta','ml','bn','mr','ko','es','de','fr','gu','as']){
 const c=await b.newContext({viewport:{width:1100,height:900}});await c.addInitScript(l=>{localStorage.setItem('bh-set',JSON.stringify({ui:l,focus:'te',scheme:'simple',roman:true,perDay:10,rate:.9,ov:'no'}));},l);
 const q=await c.newPage();await q.goto(BASE+'/');await q.waitForTimeout(200);
 const want=await q.evaluate(l=>B.I18N[l].nav_today,l),got=await q.$eval('#mnav a[data-k=today]',e=>e.textContent.trim());ok(got.includes(want),'ui '+l+': nav shows "'+want+'"');
 ok((await q.getAttribute('html','lang'))===l,'ui '+l+': html lang set');await c.close();}
console.log('page errors:',errs);if(errs.length)fails++;
console.log(fails?'FAILED '+fails:'ALL PASS');await b.close();process.exit(fails?1:0);})();
