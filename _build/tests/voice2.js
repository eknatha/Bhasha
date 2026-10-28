// Native voice matching + consent prompt + voice-check dialog
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(),p=await (await b.newContext()).newPage();let fails=0;const ck=(c,m)=>{if(!c)fails++;console.log(c?'ok  ':'FAIL',m)};
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{
 const tags=['bn-BD','mr_IN','ko_KR','es-MX','de-AT','te-IN','hi-IN','kn-IN','ta-IN','ml-IN'];
 const voices=tags.map((t,i)=>({name:'Mock '+t,lang:t,localService:i%2==0,default:false,voiceURI:t}));
 window.__spoken=[];
 const ss={getVoices:()=>voices,speak(u){window.__spoken.push([u.lang,u.voice&&u.voice.name,u.text]);setTimeout(()=>{u.onstart&&u.onstart({});u.onend&&u.onend({})},20)},cancel(){},addEventListener(){},removeEventListener(){}};
 Object.defineProperty(window,'speechSynthesis',{value:ss,configurable:true});
 window.SpeechSynthesisUtterance=function(t){this.text=t};
});
await p.goto('http://localhost:8766/phrases/');await p.waitForTimeout(500);
const m={bn:'Mock bn-BD',mr:'Mock mr_IN',ko:'Mock ko_KR',es:'Mock es-MX',de:'Mock de-AT',te:'Mock te-IN',hi:'Mock hi-IN',kn:'Mock kn-IN',ta:'Mock ta-IN',ml:'Mock ml-IN'};
for(const l in m){const r=await p.evaluate(l=>{const v=window.B.ui.voiceFor(l);return v&&v.name},l);ck(r===m[l],'voiceFor '+l+' -> '+r)}
const sp=await p.evaluate(async()=>{await new Promise(r=>window.B.ui.speak('Hallo Welt','de',r,1));return window.__spoken});
ck(sp.length&&sp[0][1]==='Mock de-AT','native speak used device voice '+JSON.stringify(sp[0]));
// voice check dialog
await p.evaluate(()=>window.B.ui.openVoiceCheck());await p.waitForTimeout(300);
const rows=await p.$$eval('.vc-row, .vc li, .vc [class*=row]',e=>e.length);ck(rows>=11,'voice check rows '+rows);
await p.screenshot({path:'/tmp/vc.png'});
console.log('page errors',errs);console.log(fails||errs.length?'FAILED':'ALL PASS');await b.close();process.exit(fails||errs.length?1:0)})();
