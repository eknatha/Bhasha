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
console.log('page errors:',errs);if(errs.length)fails++;
console.log(fails?'FAILED '+fails:'ALL PASS');await b.close();process.exit(fails?1:0);})();
