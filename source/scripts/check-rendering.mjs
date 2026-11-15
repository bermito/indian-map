import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const nodes=new Map();function element(k){if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',open:false,addEventListener(){},setAttribute(){},removeAttribute(){},showModal(){this.open=true},close(){this.open=false},classList:{add(){},remove(){},toggle(){}},querySelector(){return null},querySelectorAll(){return []}});return nodes.get(k)}
const location={href:'https://example.test/events/?view=%3Cimg%20src=x%20onerror=alert(1)%3E',pathname:'/events/',search:'?view=%3Cimg%20src=x%20onerror=alert(1)%3E',origin:'https://example.test'};
const document={querySelector:element,querySelectorAll:()=>[],addEventListener(){},body:element('body')};
const ctx=vm.createContext({document,location,console,URL,URLSearchParams,FormData,Blob,setTimeout,clearTimeout,fetch:async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync('data/'+url.split('/').at(-1),'utf8'))}),localStorage:{getItem(){return null},setItem(){}},window:{addEventListener(){},scrollTo(){}},history:{replaceState(){},pushState(){}}});
let src=fs.readFileSync('assets/app.js','utf8').replace(/\nboot\(\)\.catch[\s\S]*$/,'');
src+='\nglobalThis.probe={eventPage,recordCard,detail,setCore:(m,c,d)=>{manifest=m;coverage=c;directory=d},setLocation:v=>Object.assign(location,v)};';vm.runInContext(src,ctx);
ctx.probe.setCore(JSON.parse(fs.readFileSync('data/manifest.json')),JSON.parse(fs.readFileSync('data/coverage.json')),JSON.parse(fs.readFileSync('data/directory.json')));
await ctx.probe.eventPage();
const html=nodes.get('#app').innerHTML;
assert.ok(!html.includes('<img src=x onerror=alert(1)>'),'Untrusted view query must not be rendered as HTML');
const card=ctx.probe.recordCard({id:'test',name:'<img src=x onerror=alert(1)>',category:'test',url:'javascript:alert(1)'});assert.ok(!card.includes('<img src=x'));assert.ok(card.includes('&lt;img'));
console.log('Runtime rendering probes passed.');
