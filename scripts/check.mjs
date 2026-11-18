import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=process.cwd();
const json=name=>JSON.parse(fs.readFileSync(path.join(root,'data',name+'.json'),'utf8'));
const manifest=json('manifest'), coverage=json('coverage'), directory=json('directory');
let checks=0;
function check(condition,message){assert.ok(condition,message);checks++;}
const expected={directory:993,products:5163,events:33,communities:19,learn:34,equipment:1641,'other-products':546,experiences:2,leads:1416,arpan:412,legacy:379};
for(const [name,n]of Object.entries(expected)){
 const rows=json(name);check(rows.length===n,`${name}: expected ${n}, got ${rows.length}`);
 check(manifest.counts[name]===rows.length,`${name}: manifest count mismatch`);
 check(rows.every(r=>r.id&&r.name),`${name}: missing id/name`);
 check(new Set(rows.map(r=>r.id)).size===rows.length,`${name}: duplicate IDs`);
 for(const r of rows){
  for(const u of [r.url,r.mapUrl,...(r.sourceUrls||[])].filter(Boolean)){
   check(/^https?:\/\//.test(u),`${name}/${r.id}: non-http URL`);
   try{new URL(u)}catch{throw Error(`${name}/${r.id}: invalid URL ${u}`)}
  }
  if(r.price!=null){check(typeof r.price==='number'&&Number.isFinite(r.price)&&r.price>=0,`${name}/${r.id}: invalid price`);check(Boolean(r.priceUnit),`${name}/${r.id}: missing price unit`)}
 }
}
const states=coverage.states.map(r=>r.state);
check(states.length===36&&new Set(states).size===36,'Coverage must contain 36 unique states/UTs');
check(coverage.states.filter(r=>r.type==='State').length===28,'Expected 28 state entries');
check(coverage.keralaDistricts.length===14,'Expected 14 Kerala districts');
const correctedCities=directory.filter(r=>r.cityCheckedDate==='2026-11-18'&&['Goa','Nagaland','India'].includes(r.sourceCity));
check(correctedCities.length===13,'State and country source labels must retain their original values');
check(correctedCities.every(r=>r.city!==r.sourceCity&&(!r.city||r.sourceUrls.includes(r.citySourceUrl))),'Corrected city must have branch-specific evidence');
const kerala=directory.filter(r=>r.state==='Kerala'), authority=json('kerala-authority-source'), keralaMeta=json('kerala-authority');
check(kerala.length===33,'Expected 33 unique corrected Kerala records');
check(kerala.every(r=>r.authorityId),'Every Kerala core record must retain its authority ID');
for(const a of authority.places){
 const r=kerala.find(r=>r.authorityId===a.id);
 check(Boolean(r),`Missing approved Kerala place ${a.id}`);
 for(const [dest,src]of [['name','n'],['district','district'],['description','m'],['mapUrl','mapUrl'],['hours','hours'],['visitNote','visitNote'],['editorNote','editorNote'],['phone','phone'],['email','email'],['instagram','instagram'],['contactChecked','contactChecked']])check((r[dest]||'')===(a[src]||''),`${a.id}: corrected ${dest} changed`);
 check(!r.hasPin,`${a.id}: coordinates must not be inferred from an old observation`);
}
check(kerala.filter(r=>r.kind==='roasters').length===3,'Expected three corrected Kerala roaster entries');
check(kerala.filter(r=>r.categories?.includes('buyroasted')).length===3,'Expected three buy-roasted facets without duplicate places');
check(coverage.keralaDistricts.filter(d=>!d.entries).length===6,'Expected six Kerala coverage gaps');
const districtSvg=fs.readFileSync(path.join(root,'assets/map/kerala-districts.svg'),'utf8');
const svgDistricts=[...districtSvg.matchAll(/data-kerala-district="([^"]+)"/g)].map(m=>m[1]);
check(svgDistricts.length===14&&new Set(svgDistricts).size===14,'District map needs 14 unique selectable shapes');
check(svgDistricts.every(d=>coverage.keralaDistricts.some(x=>x.district===d)),'District map contains a noncanonical district key');
check(json('kerala-research-archive').directory.length===76,'Original Kerala research records must be retained');
check(directory.every(r=>!r.state||states.includes(r.state)),'Unknown state label in core directory');
check(directory.every(r=>!r.country||r.country==='India'),'Overseas venue in India directory');
check(directory.every(r=>!r.id.startsWith('LEGACY-')),'Legacy observations mixed into core directory');
const overseas=json('arpan').filter(r=>r.country&&r.country!=='India');
check(overseas.length===3,'Arpan list must retain three overseas observations');
for(const r of overseas)check(!directory.some(d=>d.mapUrl&&d.mapUrl===r.mapUrl),`Overseas venue ${r.name} leaked into India directory`);
for(const r of directory){
 check(Array.isArray(r.sourceUrls)&&r.sourceUrls.length>0,`${r.id}: missing provenance`);
 if(r.hasPin)check(Number.isFinite(r.lat)&&Number.isFinite(r.lng)&&r.lat>=6&&r.lat<=38&&r.lng>=67&&r.lng<=98,`${r.id}: invalid India pin`);
}
for(const s of coverage.states)check(directory.filter(r=>r.state===s.state).length===s.directory_entries,`${s.state}: coverage count mismatch`);
for(const d of coverage.keralaDistricts)check(directory.filter(r=>r.state==='Kerala'&&r.district===d.district).length===d.entries,`${d.district}: district count mismatch`);
const leads=json('leads');check(leads.every(r=>r.hasPin===false),'Unverified broad leads must not gain pins');
const catalogueAudit=json('catalogue-audit'), coffee=json('products'), gear=json('equipment'), more=json('other-products');
const catalogue=[...coffee,...gear,...more];
check(catalogue.every(r=>r.price!==0),'Missing catalogue prices must not appear as free');
check(catalogueAudit.classificationMoves.length===56,'Expected 56 reviewed classification repairs');
for(const change of catalogueAudit.classificationMoves){
 check(!coffee.some(r=>r.id===change.id),`${change.id}: non-bean record remains in coffee`);
 const row=json(change.to).find(r=>r.id===change.id);
 check(Boolean(row),`${change.id}: moved record missing from ${change.to}`);
 check(row.normalized250gINR==null,`${change.id}: invalid bean-price normalization retained`);
}
for(const fix of catalogueAudit.priceCorrections){const r=coffee.find(r=>r.id===fix.id);check(r?.price===fix.price&&r?.weightGrams===fix.weightGrams,`${fix.id}: primary price/pack correction lost`);check(r?.rawPrice!=null,`${fix.id}: original observation lost`);}
const recordIndex=json('record-index');
for(const [dataset]of Object.entries(expected))for(const r of json(dataset))check(Boolean(recordIndex[r.id]),`${r.id}: missing saved-record dataset index`);
const events=json('events'), eligible=events.filter(r=>r.calendarEligible);
check(eligible.length===14,'Expected fourteen organiser-supported sessions at this snapshot');
check(eligible.every(r=>['official_schedule_observed','organiser_page_and_ticket_listing_agree'].includes(r.verification)),'Unconfirmed event was made calendar-eligible');
check(eligible.every(r=>/^\d{4}-\d{2}-\d{2}$/.test(r.date)&&!Number.isNaN(Date.parse(r.date))),'Calendar event has invalid date');
const upcomingAtSnapshot=eligible.filter(r=>r.status!=='completed'&&(r.endDate||r.date)>=manifest.eventScheduleCheckedDate);
check(upcomingAtSnapshot.length===manifest.upcomingConfirmedEventsAtSnapshot,'Event manifest and organiser-backed dates disagree');
const blueTokaiSessions=eligible.filter(r=>r.organiser==='Blue Tokai Coffee Roasters');
check(blueTokaiSessions.length===12,'Every listed Blue Tokai venue has its own session');
check(new Set(blueTokaiSessions.map(r=>[r.date,r.city,r.venue].join('|'))).size===blueTokaiSessions.length,'Duplicate Blue Tokai date and venue');
check(blueTokaiSessions.every(r=>r.timezone==='Asia/Kolkata'&&r.time&&r.mapUrl&&r.sourceUrls.includes(r.url)),'Organiser session missing venue, local time or booking source');
const archivedKerala=events.filter(r=>r.state==='Kerala');
check(archivedKerala.length===11,'Expected eleven Kerala editorial event archives');
check(archivedKerala.every(r=>r.status==='past_editorial_archive'&&!r.calendarEligible&&r.registrationClosed&&(r.endDate||r.date)<'2026-11-15'),'Kerala past events must stay archived with registration closed');
const hoffmann=events.find(r=>r.name.includes('James Hoffmann'));
check(hoffmann?.date==='2026-11-21'&&hoffmann?.sourceRawDate==='2026-11-22','Hoffmann date conflict provenance was lost');
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
for(const s of states)check(fs.existsSync(path.join(root,'dist','states',slug(s),'index.html')),`Missing route for ${s}`);
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(dir,x.name)):[path.join(dir,x.name)])}
const files=walk(path.join(root,'dist'));
const broken=[];
for(const file of files.filter(f=>f.endsWith('.html'))){
 const html=fs.readFileSync(file,'utf8');
 for(const [,attr,raw]of html.matchAll(/\b(src|href)=["']([^"']+)["']/g)){
  if(/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(raw))continue;
  const clean=decodeURIComponent(raw.split(/[?#]/)[0]);if(!clean)continue;
  const target=clean.startsWith('/')?path.join(root,'dist',clean):path.resolve(path.dirname(file),clean);
  if(!fs.existsSync(target)&&!fs.existsSync(target+'.html')&&!fs.existsSync(path.join(target,'index.html')))broken.push(`${path.relative(root,file)} ${attr}=${raw}`);
 }
 check(/<html[^>]*lang="en(?:-IN)?"/.test(html),`${file}: missing English language`);
}
check(!broken.length,'Broken local references:\n'+broken.join('\n'));
const keralaHtml=fs.readFileSync(path.join(root,'dist/states/kerala/index.html'),'utf8');
for(const d of coverage.keralaDistricts)check(keralaHtml.includes('/states/kerala/districts/'+slug(d.district)+'/'),`Static Kerala preview lacks ${d.district} link`);
for(const r of kerala)check(keralaHtml.includes(r.name.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')),`Static Kerala preview lacks ${r.name}`);
for(const file of walk(path.join(root,'assets')).filter(f=>f.endsWith('.js')))execFileSync(process.execPath,['--check',file],{stdio:'pipe'});
checks++;
const source=fs.readFileSync(path.join(root,'assets/app.js'),'utf8');
check(source.includes('https://formspree.io/f/xrpzgeky'),'Original suggestion endpoint must be retained');
check(source.includes('e.origin!==location.origin')&&source.includes('e.source!==map?.contentWindow'),'Map message origin/source guard missing');
execFileSync(process.execPath,['scripts/check-rendering.mjs'],{stdio:'pipe'});checks++;
const report={passed:true,checks,counts:expected,states:36,keralaDistricts:14,calendarEligible:eligible.length,overseasPreserved:overseas.length,brokenLocalReferences:broken,generatedAt:new Date().toISOString()};
fs.mkdirSync(path.join(root,'qa'),{recursive:true});fs.writeFileSync(path.join(root,'qa/check-report.json'),JSON.stringify(report,null,2));
console.log(`PASS: ${checks.toLocaleString()} assertions. Data counts, provenance, event eligibility, geography, output links and JavaScript syntax checked.`);
