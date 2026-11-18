import { createAtlas } from '../assets/atlas-pages.mjs';
import { findPage, schemaFor } from '../assets/published-pages.mjs';
import { renderJournalTeasers } from '../assets/journal.mjs';
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read=name=>JSON.parse(fs.readFileSync(`data/${name}.json`,'utf8'));
const nodes=new Map();
function element(key){
 if(!nodes.has(key))nodes.set(key,{innerHTML:'',textContent:'',open:false,attributes:{},elements:{},addEventListener(){},setAttribute(k,v){this.attributes[k]=String(v)},getAttribute(k){return this.attributes[k]??null},removeAttribute(k){delete this.attributes[k]},remove(){nodes.delete(key)},showModal(){this.open=true},close(){this.open=false},classList:{add(){},remove(){},toggle(){}},querySelector(){return null},querySelectorAll(){return []}});
 return nodes.get(key);
}
const location={href:'https://example.test/',pathname:'/',search:'',origin:'https://example.test'};
const document={querySelector:element,querySelectorAll:()=>[],addEventListener(){},createElement:tag=>element('new:'+tag),head:{appendChild(){}},body:element('body')};
const requests=[],failedDatasets=new Set();
const fetch=async url=>{
 requests.push(url);const name=url.split('/').at(-1).replace(/\.json$/,'');
 return {ok:!failedDatasets.has(name),json:async()=>read(name),text:async()=>fs.readFileSync('.'+url,'utf8')};
};
const ctx=vm.createContext({createAtlas,findPage,schemaFor,renderJournalTeasers,document,location,console,URL,URLSearchParams,FormData,Blob,setTimeout,clearTimeout,fetch,localStorage:{getItem(){return null},setItem(){}},window:{addEventListener(){},scrollTo(){}},history:{replaceState(){},pushState(){}}});
let src=fs.readFileSync('assets/app.js','utf8').replace(/^import .*?;$/gm, '').replace(/\nboot\(\)\.catch[\s\S]*$/,'');
src+='\nglobalThis.probe={eventPage,recordCard,price,listing,applyFilters,refreshSavedView,renderCalendar,showCalendarDay,savedPage,updateRouteMetadata,getFiltered:()=>filtered,setRoute:v=>{route=v},setSaved:v=>{saved=new Set(v)},setCore:(m,c,d,a,geography)=>{manifest=m;coverage=c;directory=d;current=d;keralaAuthority=a;atlas=createAtlas(directory, geography);d.forEach(remember)},setLocation:v=>Object.assign(location,v)};';
vm.runInContext(src,ctx);
const probe=ctx.probe,core=read('directory');
probe.setCore(read('manifest'),read('coverage'),core,read('kerala-authority'),read('districts'));
function at(path){const u=new URL(path,location.origin);probe.setLocation({href:u.href,pathname:u.pathname,search:u.search})}

assert.match(probe.recordCard({id:'guide-test',name:'Guide',kind:'learning_resource',geographicScope:'India',notes:'Practical brewing lessons.'}),/Practical brewing lessons\./,'Learning summaries must be visible');
assert.match(probe.recordCard({id:'community-test',name:'Coffee circle',kind:'community',geographicScope:'India',notes:'A public coffee community.'}),/Across India/,'National resources need an accurate scope label');
assert.match(probe.price({price:null,priceNote:'Price not confirmed.'}),/Check price with seller/,'Unreliable prices need a visible replacement');

const listedPast=read('events').filter(r=>r.status==='past_listed');
assert.equal(listedPast.length,6,'Six historical third-party event listings must remain available');
at('/events/?view=past');await probe.eventPage();
for(const r of listedPast)assert.ok(nodes.get('#app').innerHTML.includes(`data-record="${r.id}"`),`${r.name} missing from Past`);
assert.ok(!nodes.get('#app').innerHTML.includes('data-ics='),'Unconfirmed historic listings must not gain calendar downloads');
at('/events/?view=review');await probe.eventPage();
for(const r of listedPast)assert.ok(!nodes.get('#app').innerHTML.includes(`data-record="${r.id}"`),'Expired listings must leave To confirm');
probe.renderCalendar([{id:'calendar-one',name:'First same-day event',kind:'event',date:'2099-01-01'},{id:'calendar-two',name:'Second same-day event',kind:'event',date:'2099-01-01'}]);
probe.showCalendarDay('2099-01-01');
assert.match(nodes.get('#detail-content').innerHTML,/First same-day event/);
assert.match(nodes.get('#detail-content').innerHTML,/Second same-day event/,'A calendar date must expose every same-day event');

probe.setSaved([core[0].id,core[1].id]);probe.setRoute('explore');probe.applyFilters(new URLSearchParams('saved=1'));
probe.setSaved([core[1].id]);probe.refreshSavedView();
assert.equal(probe.getFiltered().length,1,'Unsave must immediately refresh a Saved only directory');
assert.equal(probe.getFiltered()[0].id,core[1].id);
at('/saved/');probe.setRoute('saved');probe.setSaved([core[0].id]);let before=requests.length;
await probe.savedPage();assert.equal(requests.length,before,'An already loaded saved place must not fetch other catalogues');
const product=read('products')[0],equipment=read('equipment')[0];
probe.setSaved([product.id,equipment.id]);failedDatasets.add('equipment');before=requests.length;
await probe.savedPage();
const requested=requests.slice(before);
assert.ok(requested.includes('/data/record-index.json')&&requested.includes('/data/products.json')&&requested.includes('/data/equipment.json'));
assert.ok(!requested.includes('/data/leads.json')&&!requested.includes('/data/arpan.json'),'Saved must fetch only needed datasets');
assert.match(nodes.get('#app').innerHTML,/Some saved finds could not load/,'Partial saved failures need a recovery notice');
assert.ok(nodes.get('#results').innerHTML.includes(product.id),'Loaded saves must survive another dataset failure');
failedDatasets.clear();await probe.savedPage();
assert.ok(!nodes.get('#app').innerHTML.includes('Some saved finds could not load'),'Retry must recover the failed dataset');

at('/states/karnataka/');probe.setRoute('states');await probe.listing('explore','Karnataka');
assert.match(nodes.get('#app').innerHTML,/Browse Karnataka by district/);
assert.ok(nodes.get('#app').innerHTML.includes('select name="district"'),'Karnataka supports district selection');
if(!read('equipment').some(r=>r.state)){
 at('/equipment/?state=Kerala');probe.setRoute('equipment');await probe.listing('equipment');
 assert.ok(!nodes.get('#app').innerHTML.includes('select name="state"'),'Catalogues with no location data must not offer state filters');
 assert.equal(probe.getFiltered().length,read('equipment').length,'An obsolete state query must not empty a nationwide equipment catalogue');
}

at('/legacy/');probe.updateRouteMetadata();
assert.equal(nodes.get('meta[name="robots"]').attributes.content,'noindex,follow');
at('/states/kerala/?district=Kozhikode');probe.updateRouteMetadata();
assert.ok(!nodes.has('meta[name="robots"]'),'Client navigation must remove a previous noindex directive');
assert.equal(nodes.get('link[rel="canonical"]').attributes.href,'https://www.specialtycoffeeindia.blog/states/kerala/');
assert.match(nodes.get('meta[name="description"]').attributes.content,/in Kerala/);
assert.match(nodes.get('meta[property="og:title"]').attributes.content,/Coffee in Kerala/);
assert.equal(nodes.get('meta[property="og:url"]').attributes.content,'https://www.specialtycoffeeindia.blog/states/kerala/');
assert.equal(JSON.parse(nodes.get('script[type="application/ld+json"]').textContent).url,'https://www.specialtycoffeeindia.blog/states/kerala/');
at('/');probe.updateRouteMetadata();
assert.equal(JSON.parse(nodes.get('script[type="application/ld+json"]').textContent)['@type'],'WebSite');
at('/states/kerala/unknown');probe.updateRouteMetadata();
assert.equal(nodes.get('meta[name="robots"]').attributes.content,'noindex,follow','Unknown routes must not inherit indexable metadata');
console.log('PASS: catalogue scope, event archives/day chooser, targeted saved loading and route metadata.');
