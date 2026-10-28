const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:1100,height:900}});
const errs=[];p.on('pageerror',e=>errs.push('PAGEERR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text());});
const reqs=[];p.on('request',r=>{const u=new URL(r.url());if(u.hostname!=='localhost')reqs.push(r.url());});
for(const path of ['/','/read/','/watch/','/words/','/review/','/scripts/','/phrases/']){
 await p.goto('http://localhost:8766'+path);await p.waitForTimeout(400);
 const h1=await p.$eval('h1',e=>e.textContent).catch(()=>'NO H1');console.log(path,'->',h1.slice(0,60));
 await p.screenshot({path:'/tmp/bh'+(path.replace(/\W/g,'')||'home')+'.png'});}
console.log('errors',errs,'external',reqs);await b.close();})();
