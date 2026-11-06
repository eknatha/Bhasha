// node tests/newfeat.js : new languages, minimal pairs, stories, write, manage, read tracking
const {chromium}=require('playwright');const BASE=process.env.BASE||'http://localhost:8766';let fails=0;
function ok(c,m){if(!c){fails++;console.log('FAIL',m);}else console.log('ok  ',m);}
const SET=o=>JSON.stringify(Object.assign({ui:'en',focus:'te',scheme:'simple',roman:true,perDay:10,rate:.9,sound:false,haptic:false},o||{}));
(async()=>{const b=await chromium.launch();
async function page(o,seed){const c=await b.newContext({viewport:{width:1100,height:900}});
 await c.addInitScript(([s,sd])=>{if(!localStorage.getItem('__i')){localStorage.setItem('__i','1');localStorage.setItem('bh-set',s);if(sd)localStorage.setItem('bh-words',sd);}},[SET(o),seed||null]);
 const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('console',m=>{if(m.type()==='error')p.errs.push(m.text());});p.ctx=c;return p;}
const LEARN=['te','hi','kn','ta','ml','bn','mr','gu','as','ko','es','de','fr','en','or','ne','ja'];
// pairs in every language
for(const l of LEARN){const p=await page({focus:l});await p.goto(BASE+'/pairs/');await p.waitForTimeout(250);
 const btns=await p.$$('.pa-opt');ok(btns.length===2,'pairs '+l+': 2 options ('+btns.length+')');if(btns.length){await btns[0].click();await p.waitForTimeout(100);ok(await p.isVisible('#pa-next'),'pairs '+l+': next after answer');}ok(p.errs.length===0,'pairs '+l+': no errors '+p.errs.join(';'));await p.ctx.close();}
// stories
for(const l of ['te','ja','or','ne','en','ko']){const p=await page({focus:l});await p.goto(BASE+'/stories/');await p.waitForTimeout(250);
 const cards=await p.$$('.stcard, [data-story]');ok(cards.length===10,'stories '+l+': 10 stories ('+cards.length+')');
 await cards[0].click();await p.waitForTimeout(250);ok((await p.$$('.bubble, .st-line')).length>=4,'stories '+l+': lines shown');ok(p.errs.length===0,'stories '+l+': no errors '+p.errs.join(';'));await p.ctx.close();}
// write: typed check
{const p=await page({focus:'hi'});await p.goto(BASE+'/write/');await p.waitForTimeout(300);
 const ans=await p.evaluate(()=>B.PHRASES[0].hi);
 const r=await p.evaluate(()=>[B.checkTyped('नमस्ते',['नमस्ते'],'hi'),B.checkTyped('namaste',['नमस्ते'],'hi'),B.checkTyped('xyz',['नमस्ते'],'hi')]);
 ok(r[0]==='right','checkTyped exact');ok(r[2]==='wrong','checkTyped wrong');
 ok(await p.isVisible('input[type=text], .wr input, #wr-in'),'write: input shown');ok(p.errs.length===0,'write: no errors '+p.errs.join(';'));await p.ctx.close();}
{const p=await page({focus:'ja'});await p.goto(BASE+'/write/');await p.waitForTimeout(300);ok(p.errs.length===0,'write ja: no errors');await p.ctx.close();}
// manage
{const now=Date.now();const seed=JSON.stringify([1,2,3,4].map(i=>({id:'te:w'+i,w:'w'+i,lang:'te',m:'m'+i,c:'',n:'',st:1,added:now,iv:i*10,ef:2.5,reps:i,lapses:i%3,due:now-1000})));
 const p=await page({},seed);await p.goto(BASE+'/manage/');await p.waitForTimeout(300);
 const rows=await p.$$('.mg-row, [data-mg]');ok(rows.length===4,'manage: 4 rows ('+rows.length+')');ok(p.errs.length===0,'manage: no errors '+p.errs.join(';'));
 await p.ctx.close();}
// read
{const p=await page({focus:'te'});await p.goto(BASE+'/read/');await p.waitForTimeout(300);ok(await p.isVisible('#rd-mode'),'read: mode select');ok(p.errs.length===0,'read: no errors '+p.errs.join(';'));await p.ctx.close();}
console.log(fails?'FAILED '+fails:'ALL PASS');await b.close();process.exit(fails?1:0);})();
