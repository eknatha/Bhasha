const {chromium}=require('playwright');
const BASE=process.env.BASE||'http://localhost:8766';let fails=0;const F=m=>{fails++;console.log('FAIL',m)};
function lum(c){const a=c.map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*a[0]+.7152*a[1]+.0722*a[2]}
(async()=>{const b=await chromium.launch();
const routes=['/','/read/','/watch/','/words/','/review/','/scripts/','/phrases/'];
// seed data so lists render
const seed=()=>{const now=Date.now();localStorage.setItem('bh-words',JSON.stringify([{id:'te:నమస్తే',w:'నమస్తే',lang:'te',m:'hello',c:'నమస్తే మిత్రమా',n:'',st:1,added:now,iv:0,ef:2.5,reps:0,lapses:0,due:now-1000},{id:'hi:धन्यवाद',w:'धन्यवाद',lang:'hi',m:'thanks',c:'',n:'',st:2,added:now,iv:5,ef:2.5,reps:3,lapses:0,due:now+5*864e5}]));};
let n=0;
for(const lang of ['en','te','ta','ml']){for(const theme of ['light','dark','new']){
 for(const w of [320,375,768,1280]){
  const ctx=await b.newContext({viewport:{width:w,height:800}});await ctx.addInitScript(([l,t])=>{try{localStorage.setItem('el-theme',t);localStorage.setItem('bh-set',JSON.stringify({ui:l,focus:'te',scheme:'simple',roman:true,perDay:10,rate:.9}));localStorage.setItem('el-lang',l);}catch(e){}},[lang,theme]);
  await ctx.addInitScript(seed);const p=await ctx.newPage();
  for(const r of routes){await p.goto(BASE+r);await p.waitForTimeout(120);n++;
   if(r==='/read/'||r==='/watch/'){ if(r==='/read/')await p.click('#rd-text~*,#rd-text',{trial:true}).catch(()=>{}); }
   const ov=await p.evaluate(()=>{const de=document.documentElement;return de.scrollWidth-de.clientWidth});
   if(ov>0)F(`overflow ${ov}px ${lang}/${theme}/${w}${r}`);}
  await ctx.close();}}}
console.log('overflow checks',n);
// contrast on key text elements (light/dark/new) for en
for(const theme of ['light','dark','new']){const ctx=await b.newContext({viewport:{width:1100,height:800}});await ctx.addInitScript(t=>{localStorage.setItem('el-theme',t)},theme);await ctx.addInitScript(seed);const p=await ctx.newPage();
 for(const r of routes){await p.goto(BASE+r);await p.waitForTimeout(150);
  const bad=await p.evaluate(()=>{function rgb(s){const m=s.match(/rgba?\(([^)]+)\)/);if(!m)return null;const a=m[1].split(',').map(Number);return a}
   function bg(e){while(e){const c=rgb(getComputedStyle(e).backgroundColor);if(c&&(c.length<4||c[3]>0.9))return c;e=e.parentElement}return [255,255,255]}
   function L(c){const a=c.slice(0,3).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*a[0]+.7152*a[1]+.0722*a[2]}
   const out=[];document.querySelectorAll('h1,h2,p,label,button,a,.wd-m,.wd-r,.stat span,.note,small,.ph-n,.ph-r').forEach(e=>{if(!e.offsetParent||!e.textContent.trim())return;const cs=getComputedStyle(e),fg=rgb(cs.color),b=bg(e);if(!fg)return;const l1=L(fg),l2=L(b),r=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);if(r<4.5)out.push(e.tagName+'.'+e.className+' '+r.toFixed(2)+' "'+e.textContent.trim().slice(0,24)+'"')});return out.slice(0,6)});
  if(bad.length)F(`contrast ${theme}${r}: ${bad.join(' | ')}`);}
 await ctx.close();}
// keyboard reachability + no external requests + offline
{const ctx=await b.newContext({viewport:{width:1100,height:800}});await ctx.addInitScript(seed);const p=await ctx.newPage();const ext=[];p.on('request',r=>{if(new URL(r.url()).hostname!=='localhost')ext.push(r.url())});
 await p.goto(BASE+'/');await p.keyboard.press('Tab');const sk=await p.evaluate(()=>document.activeElement.className);if(!/skip/.test(sk))F('first Tab is not skip link: '+sk);
 for(const r of routes){await p.goto(BASE+r);await p.waitForTimeout(100);}
 if(ext.length)F('external requests '+ext.join(','));
 // fonts: English-only page should not pull Indic fonts when no Indic text is rendered (words page empty)
 await ctx.close();}
{const ctx=await b.newContext({viewport:{width:1100,height:800}});const p=await ctx.newPage();await p.goto(BASE+'/');await p.waitForTimeout(500);
 await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForTimeout(1500);await ctx.setOffline(true);
 for(const r of ['/','/read/','/watch/','/scripts/']){await p.goto(BASE+r).catch(e=>F('offline nav '+r+' '+e.message));const h=await p.$eval('h1',e=>e.textContent).catch(()=>null);if(!h)F('offline no h1 '+r);}
 await ctx.close();}
console.log(fails?'FAILED '+fails:'ALL PASS');await b.close();process.exit(fails?1:0)})();
