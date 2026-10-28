// node tests/core.test.js  (DOM-free checks of core.js)
const fs=require('fs'),path=require('path');globalThis.window=undefined;
new Function(fs.readFileSync(path.join(__dirname,'../src/core.js'),'utf8'))();new Function(fs.readFileSync(path.join(__dirname,'../src/data.js'),'utf8'))();
const B=globalThis.B;let fails=0;const eq=(a,b,m)=>{if(JSON.stringify(a)!==JSON.stringify(b)){fails++;console.log('FAIL',m,JSON.stringify(a),'!=',JSON.stringify(b))}else console.log('ok  ',m)};
[['తెలుగు','telugu'],['నుండి','nundi'],['हिन्दी','hindee'],['हैं','hain'],['நன்றி','nandri'],['ഒന്ന്','onnu']].forEach(([s,r])=>eq(B.translit(s,'simple'),r,'translit '+s));
eq(B.translit('అంగ','iast'),'aṃga','iast anusvara as ṃ');
eq(B.detectLang('నమస్తే మిత్రమా'),'te','detect te');eq(B.detectLang('धन्यवाद दोस्त'),'hi','detect hi');eq(B.detectLang('வணக்கம் நண்பா'),'ta','detect ta');
// SRS
let c=B.srsNew(1e12);const g2=B.srsNext(c,2,1e12);eq([g2.reps,g2.iv],[1,1],'srs good #1 = 1 day');
const g3=B.srsNext(g2,2,1e12);eq([g3.reps,g3.iv],[2,3],'srs good #2 = 3 days');
const ag=B.srsNext(g3,0,1e12);eq([ag.reps,ag.lapses],[0,1],'srs again resets');eq(ag.due-1e12,600000,'srs again = 10 min');
// subtitles
const srt='1\n00:00:01,000 --> 00:00:02,500\nA\nB\n\n2\n00:00:03,000 --> 00:00:04,000\nC\n';
const l=B.parseSubs(srt);eq(l.length,2,'srt 2 cues');eq(l[0].t,'A\nB','srt multi-line');eq([l[0].s,l[0].e],[1,2.5],'srt times');
const v=B.parseSubs('WEBVTT\n\n00:01.000 --> 00:02.000 align:start\nHi\n');eq([v.length,v[0].s],[1,1],'vtt short timestamps');
eq(B.lineAt(l,1.2),0,'lineAt in cue');eq(B.lineAt(l,2.7),-1,'lineAt gap is -1');
eq(B.fmtTime(3725),'1:02:05','fmtTime hours');
eq(B.parseCsv(B.csv([['a,b','c"d','e\nf']])),[['a,b','c"d','e\nf']],'csv round trip');
eq(B.PHRASES.every(p=>B.LEARN.concat(['en']).every(k=>p[k])),true,'phrases complete in all 10 languages');
eq(B.LEARN.length,10,'10 learning languages');eq(B.allLangs().filter(x=>x[0]==='ko').length,1,'no duplicate language entries');
[['বাংলা','bangla'],['ধন্যবাদ','dhonnobad'],['আমি ভালো আছি','ami bhalo achhi'],['नमस्कार','namaskaar'],['안녕하세요','annyeonghaseyo'],['감사합니다','gamsahamnida'],['한국어','hangugeo'],['좋은 아침이에요','joeun achimieyo'],['천만에요','cheonmaneyo']].forEach(([s,r])=>eq(B.translit(s,'simple'),r,'translit '+s));
eq(B.detectLang('안녕하세요 감사합니다'),'ko','detect ko');eq(B.detectLang('আমি ভালো আছি'),'bn','detect bn');
eq(B.SCRIPTS.ko.signs.length+B.SCRIPTS.bn.cons.length>0,true,'scripts for bn, mr, ko');
console.log(fails?'FAILED '+fails:'ALL PASS');process.exit(fails?1:0);
