// node tests/tour.js : welcome, spotlight tour, mini-tours, motion, ambient, reduced motion
const {chromium}=require('playwright');const BASE=process.env.BASE||'http://localhost:8766';let fails=0;
function ok(c,m){if(!c){fails++;console.log('FAIL',m);}else console.log('ok  ',m);}
(async()=>{const b=await chromium.launch();
async function page(opt,init){const c=await b.newContext(Object.assign({viewport:{width:1280,height:900}},opt||{}));if(init)await c.addInitScript(init);
 const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('console',m=>{if(m.type()==='error')p.errs.push(m.text());});p.ctx=c;return p;}
// 1 clean context shows welcome; finishing saves settings
{const p=await page();await p.goto(BASE+'/');await p.waitForTimeout(400);
 ok(await p.isVisible('.wel'),'welcome: shown on first run');
 await p.selectOption('#wel-lang','hi');await p.click('#wel-next');await p.click('.wel-seg button:nth-child(3)');await p.click('#wel-next');
 ok(await p.isVisible('.wel-opt'),'welcome: step 3 options');
 await p.click('.wel-last .abtn:nth-child(2)');await p.waitForTimeout(300);
 ok(!(await p.$('.wel')),'welcome: closed');
 const s=await p.evaluate(()=>({set:JSON.parse(localStorage.getItem('bh-set')),t:localStorage.getItem('bh-tour')}));
 ok(s.set.focus==='hi'&&s.set.perDay===20&&s.t==='1','welcome: saved '+JSON.stringify([s.set.focus,s.set.perDay,s.t]));
 await p.reload();await p.waitForTimeout(300);ok(!(await p.$('.wel')),'welcome: not shown again');
 // replay from settings
 await p.click('[aria-controls=setp]');await p.click('#setp >> text=🧭');await p.waitForTimeout(700);
 ok(await p.isVisible('.tour-bub'),'tour: replay from Settings');
 const n=await p.textContent('.tour-n');ok(/1/.test(n),'tour: step 1 ('+n+')');
 await p.keyboard.press('ArrowRight');await p.waitForTimeout(450);ok(/2/.test(await p.textContent('.tour-n')),'tour: arrow advances');
 const hole=await p.evaluate(()=>{const r=document.querySelector('.tour-hole').getBoundingClientRect();return r.width>20&&r.height>20;});ok(hole,'tour: spotlight has size');
 await p.keyboard.press('Escape');await p.waitForTimeout(100);ok(!(await p.$('.tour')),'tour: Esc closes');
 ok(p.errs.length===0,'tour: no errors '+p.errs.join(';'));await p.ctx.close();}
// 2 welcome -> "Show me around" runs the tour; full run through Done
{const p=await page();await p.goto(BASE+'/');await p.waitForTimeout(300);
 await p.click('#wel-next');await p.click('#wel-next');await p.click('.wel-last .abtn.gold');await p.waitForTimeout(700);
 ok(await p.isVisible('.tour-bub'),'show-me-around: tour starts');
 for(let i=0;i<8&&(await p.$('.tour'));i++){await p.click('.tour-acts .abtn.gold');await p.waitForTimeout(350);}
 ok(!(await p.$('.tour')),'tour: finishes with Done');ok(p.errs.length===0,'tour: no errors '+p.errs.join(';'));await p.ctx.close();}
// 3 existing settings: no welcome; mini-tour on first read visit; "?" works
{const p=await page({},()=>{if(!localStorage.getItem('__i')){localStorage.setItem('__i','1');localStorage.setItem('bh-set',JSON.stringify({ui:'en',focus:'te'}));localStorage.setItem('bh-tour','1');}});
 await p.goto(BASE+'/');await p.waitForTimeout(300);ok(!(await p.$('.wel')),'existing user: no welcome');
 await p.goto(BASE+'/read/');await p.waitForTimeout(1300);ok(await p.isVisible('.tour-bub'),'mini-tour: auto on first visit');
 await p.keyboard.press('Escape');await p.waitForTimeout(100);
 await p.goto(BASE+'/read/');await p.waitForTimeout(1300);ok(!(await p.$('.tour')),'mini-tour: not repeated');
 ok(await p.isVisible('.tour-fab'),'help "?" present');await p.click('.tour-fab');await p.waitForTimeout(500);ok(await p.isVisible('.tour-bub'),'help "?" opens tour');
 ok(p.errs.length===0,'mini: no errors '+p.errs.join(';'));await p.ctx.close();}
// 4 mobile bottom sheet
{const p=await page({viewport:{width:390,height:800}},()=>{localStorage.setItem('bh-set',JSON.stringify({ui:'en',focus:'te'}));});
 await p.goto(BASE+'/');await p.waitForTimeout(300);await p.click('.tour-fab');await p.waitForTimeout(600);
 const r=await p.evaluate(()=>{const r=document.querySelector('.tour-bub').getBoundingClientRect();return [r.left>=0,r.right<=innerWidth,r.bottom<=innerHeight];});
 ok(r.every(Boolean),'mobile: bubble inside viewport '+r);await p.ctx.close();}
// 5 motion: ambient on home, off with reduced motion or setting; no overflow
{const init=()=>{localStorage.setItem('bh-set',JSON.stringify({ui:'en',focus:'te',ambient:true}));localStorage.setItem('bh-tour','1');Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});};
 const p=await page({},init);await p.goto(BASE+'/');await p.waitForTimeout(500);
 ok(!!(await p.$('.amb span')),'ambient: present on Home');
 ok(!!(await p.$('.nav-ind')),'nav indicator present');
 ok(!!(await p.$('.rise')),'stagger classes applied');
 await p.goto(BASE+'/phrases/');await p.waitForTimeout(300);ok(!(await p.$('.amb')),'ambient: not on other pages');
 const ov=await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);ok(ov,'no horizontal overflow');await p.ctx.close();
 const q=await page({reducedMotion:'reduce'},init);await q.goto(BASE+'/');await q.waitForTimeout(500);
 ok(!(await q.$('.amb')),'reduced motion: no ambient');ok(!(await q.$('.rise')),'reduced motion: no stagger');await q.ctx.close();
 const r=await page({},()=>{localStorage.setItem('bh-set',JSON.stringify({ui:'en',focus:'te',ambient:false}));localStorage.setItem('bh-tour','1');Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});});
 await r.goto(BASE+'/');await r.waitForTimeout(500);ok(!(await r.$('.amb')),'ambient: off when setting off');await r.ctx.close();}
console.log(fails?'FAILED '+fails:'ALL PASS');await b.close();process.exit(fails?1:0);})();
