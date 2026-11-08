const {chromium}=require('/tmp/claude-0/-home-claude/56917933-c953-547f-b654-5d85608aea18/scratchpad/bhasha-repo/_build/node_modules/playwright');
(async()=>{const b=await chromium.launch();
for(const th of ['light','dark','new']){const c=await b.newContext({viewport:{width:1366,height:800}});
await c.addInitScript(t=>{localStorage.setItem('bh-set',JSON.stringify({ui:'en',focus:'te'}));localStorage.setItem('bh-tour','1');localStorage.setItem('el-theme',t);Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});},th);
const p=await c.newPage();await p.goto('http://localhost:8766/');await p.waitForTimeout(1200);await p.screenshot({path:'/tmp/s-'+th+'.png'});
if(th==='dark'){await p.click('.tour-fab');await p.waitForTimeout(800);await p.screenshot({path:'/tmp/s-tour.png'});}
await c.close();}
await b.close();})();
