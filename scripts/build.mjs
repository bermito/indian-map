import { createAtlas } from '../assets/atlas-pages.mjs';
import { allPages, schemaFor } from '../assets/published-pages.mjs';
import { renderJournalTeasers } from '../assets/journal.mjs';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(),out=path.join(root,'dist'),origin='https://www.specialtycoffeeindia.blog';
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'data',name+'.json'),'utf8'));
const coverage=read('coverage'),directory=read('directory'),manifest=read('manifest');
const atlas = createAtlas(directory, read('districts'));
const newPages = allPages(atlas);
const coreIds = new Set(directory.map(place => place.id));
// Resolve saved IDs without downloading every catalogue for one saved place.
const recordIndex={};
for(const dataset of ['directory','products','equipment','communities','learn','events','other-products','experiences','leads','arpan','legacy'])for(const row of read(dataset))if(row.id&&!recordIndex[row.id])recordIndex[row.id]=dataset;
fs.writeFileSync(path.join(root,'data/record-index.json'),JSON.stringify(recordIndex));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const safe=v=>{try{const u=new URL(v);return /^https?:$/.test(u.protocol)?u.href:''}catch{return ''}};
const sourceLink=(url,label)=>safe(url)?`<a href="${esc(safe(url))}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`:'';
const dateParts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
const datePart=t=>dateParts.find(p=>p.type===t).value;
const today=`${datePart('year')}-${datePart('month')}-${datePart('day')}`;
const statesNav=()=>`<div class="state-grid">${coverage.states.map(s=>`<a class="state-card" href="/states/${slug(s.state)}/"><span>${esc(s.state)}</span><small>${s.directory_entries?`${s.directory_entries} listings`:'Help us explore'}</small><span aria-hidden="true">↗</span></a>`).join('')}</div>`;
function sourceDetails(r){
 return `${r.description||r.notes?`<p class="card-description">${esc(r.description||r.notes)}</p>`:''}${r.price==null&&r.priceNote?`<p class="price-basis">${esc(r.priceNote)}</p>`:''}${r.visitNote?`<p class="notice">${esc(r.visitNote)}</p>`:''}${r.hours?`<p class="card-description">Hours: ${esc(r.hours)}</p>`:''}`;
}
const routeDefs=[
 ['explore','Explore cafés, roasters and estates','Find coffee cafés, roasters, farms and coffee professionals across India, with state and district filters.','directory'],
 ['coffee','Indian coffee catalogue','Explore Indian coffee listings by roaster, roast, process and origin. Every snapshot price retains its pack or unit basis.','products'],
 ['equipment','Coffee brewing equipment','Discover brewers, grinders and coffee equipment from collected seller catalogues. Check current price and availability with the source.','equipment'],
 ['events','Coffee events calendar','Find upcoming organiser-supported coffee events, cuppings, workshops and gatherings in India.','events'],
 ['community','Coffee people and communities','Discover coffee communities, home-brewing groups and public community links across India.','communities'],
 ['learn','Coffee education and publications','Find coffee courses, education providers, publications and practical learning resources in India.','learn'],
 ['experiences','Coffee estate experiences','Explore coffee estate visits and coffee experiences, with links to providers.','experiences'],
 ['more','Subscriptions and more coffee','Browse coffee subscriptions, sampler packs, prepared coffee and other catalogue finds.','other-products'],
 ['leads','Coffee business research leads','Additional coffee business leads awaiting verification, kept separate from the specialty coffee directory.','leads',true],
 ['arpan',"Arpan’s specialty coffee café list",'Explore all 412 places in Arpan (coffee.devout)’s original curated café collection, including clearly labelled overseas venues.','arpan'],
 ['sources','Sources and methodology','Review the coffee directory’s sources, coverage, attribution and research limitations.','sources'],
 ['saved','Your saved coffee places','Your coffee places, products and events saved privately in this browser.',null,true],
 ['legacy','Original website records','Historical website listings retained as unverified records for reference and review.','legacy',true],
 ...coverage.states.map(s=>['states/'+slug(s.state),'Coffee in '+s.state,`Explore cafés, roasters, coffee farms and coffee education in ${s.state}. Source-linked directory with city and district filters.`,'directory',false,s.state])
];
function rowsFor(def){const [route,,,dataset,,state]=def;if(!dataset)return [];let rows=dataset==='directory'?directory:read(dataset);if(state)rows=rows.filter(r=>r.state===state);if(route==='events')rows=rows.filter(r=>r.calendarEligible&&(r.endDate||r.date)>=today).sort((a,b)=>a.date.localeCompare(b.date));else rows=[...rows].sort((a,b)=>a.name.localeCompare(b.name));return rows;}
function card(r){const source=r.sourceUrls?.[0]||r.url,link=r.url||r.mapUrl||source;const loc=[r.city,r.district&&r.district!==r.city?r.district:'',r.state,r.country&&r.country!=='India'?r.country:''].filter(Boolean).join(' · ');return `<article class="listing-card"><div class="card-top"><span class="tag">${esc(r.category||r.kind||'Source')}</span></div><h3 class="card-title">${coreIds.has(r.id) ? `<a href="${esc(atlas.profilePath(r))}">${esc(r.name)}</a>` : safe(link) ? sourceLink(link,r.name) : esc(r.name)}</h3>${sourceDetails(r)}${r.brand?`<p class="card-brand">${esc(r.brand)}</p>`:''}${loc?`<p class="card-location">${esc(loc)}</p>`:''}${r.date?`<p class="event-date">${esc(r.date)}${r.endDate?' – '+esc(r.endDate):''}</p>`:''}${r.flavourNotes?`<p class="card-description">${esc(r.flavourNotes)}</p>`:''}${r.price!=null?`<div class="price">₹${Number(r.price).toLocaleString('en-IN')}</div><p class="price-basis">${esc(r.priceUnit||'Source-listed price; confirm with provider')}</p>`:''}<div class="card-footer"><span class="badge">${esc(r.evidenceLabel||r.status||'Source listed')}</span><div class="card-actions">${sourceLink(source,'Source')}${r.mapUrl?sourceLink(r.mapUrl,'Map'):''}</div></div></article>`;}
function routeMain(def,rows){const [route,title,description,,,state]=def;const preview=state==='Kerala'?rows:rows.slice(0,12);let notice='Listings retain their sources. Confirm current details directly before visiting or buying.';if(route==='coffee'||route==='equipment'||route==='more')notice='Catalogue observations can overlap. Prices and availability are snapshots, with units shown beside each price.';if(route==='leads')notice='Unverified business leads. Inclusion does not establish specialty quality, current operation or a precise location.';if(route==='legacy')notice='Historical observations from the original website. These have not been independently confirmed and are separate from the current directory.';if(route==='events')notice='Only organiser-supported upcoming dates appear below. Interactive views also include past events and event leads awaiting confirmation.';if(route==='saved')notice='Saved finds stay in this browser’s local storage. They are not shared or synced to an account.';if(state&&state!=='Kerala'&&!rows.some(r=>r.district))notice='District information is still being checked. Browse by city or category. Listings retain their source links; confirm current details before visiting.';return `<main id="app" tabindex="-1"><section class="page-intro"><div class="breadcrumb"><a href="/">India</a> / ${state?'States / ':''}${esc(state||title)}</div><p class="eyebrow">${state?'Explore by place':'The coffee field guide'}</p><h1>${esc(title)}</h1><p class="lede">${esc(description)}</p></section>${state ? atlas.districtNav(state) : ''}<section class="section">${route==='explore'?`<div class="section-head"><h2>Explore every state and territory.</h2></div>${statesNav()}<div class="section-head"><h2>From the directory.</h2></div>`:''}<p class="notice">${esc(notice)}</p>${preview.length?`<p class="results-head">${preview.length<rows.length?`A selection of ${preview.length} from ${rows.length.toLocaleString('en-IN')} collected listings`:`${rows.length.toLocaleString('en-IN')} collected listings`}</p><div class="card-grid">${preview.map(card).join('')}</div>`:`<div class="empty-state"><h2>${route==='saved'?'Your next discovery starts here.':route==='events'?'No confirmed upcoming dates in this snapshot.':'This part of the guide is still growing.'}</h2><p>${route==='saved'?'Use the heart on any listing to save it in this browser.':'A gap in the collection is not proof that there is no coffee activity here.'}</p><a class="button secondary" href="/explore/">Explore India ↗</a></div>`}<noscript><p class="notice">This page includes a source-linked preview. Enable JavaScript for the full searchable collection, filters and saved lists.</p></noscript>${state?`<div class="section-head"><h2>Keep exploring.</h2></div>${statesNav()}`:''}</section></main>`;}
function metadata(html,title,description,url,noindex=false){html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${esc(title)}</title>`);for(const [attr,key,value]of [['name','description',description],['property','og:title',title],['property','og:description',description],['property','og:url',url]]){const re=new RegExp(`<meta ${attr}="${key}" content="[^"]*"\\s*\\/?>`);html=html.replace(re,`<meta ${attr}="${key}" content="${esc(value)}">`)}html=html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/,`<link rel="canonical" href="${esc(url)}">`);if(noindex)html=html.replace('</head>','<meta name="robots" content="noindex,follow">\n</head>');return html;}
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const file of ['map.html','favicon.ico','apple-touch-icon.png','icon-192.png','icon-512.png','og-image.png','manifest.webmanifest'])if(fs.existsSync(file))fs.copyFileSync(file,path.join(out,file));
for(const dir of ['assets','data'])fs.cpSync(dir,path.join(out,dir),{recursive:true});
const shell = fs.readFileSync('index.html', 'utf8').replace('</head>',
  '<link rel="stylesheet" href="/assets/journal.css">\n<link rel="stylesheet" href="/assets/atlas-pages.css">\n</head>');
let home=metadata(shell,'Specialty Coffee India — Find your next cup',"Explore India's coffee by state and district. Find cafés, roasters, coffee farms, beans, equipment, events and communities, with sources behind every listing.",origin+'/');
const stage = shell.match(/<template id="atlas-stage-template">([\s\S]*?)<\/template>/);
if (stage) home = home.replace('<!--atlas-stage-->', () => stage[1]);
home = home.replace(/<noscript>[\s\S]*?<\/noscript>/, () =>
  '<div class="home-collection" id="home-collection">' + renderJournalTeasers(3) +
  '<section class="section" id="states"><h2>States and union territories</h2>' + statesNav() +
  '</section></div>');
fs.writeFileSync(path.join(out,'index.html'),home);
for(const def of routeDefs){const [route,title,description,,noindex]=def,rows=rowsFor(def),url=origin+'/'+route+'/';let html=metadata(shell,title+' · Specialty Coffee India',description,url,noindex);html=html.replace(/<main id="app"[\s\S]*?<\/main>/,routeMain(def,rows));const ld={'@context':'https://schema.org','@type':'CollectionPage',name:title,description,url,isPartOf:{'@type':'WebSite',name:'Specialty Coffee India',url:origin+'/'},dateModified:manifest.checkedDate,mainEntity:{'@type':'ItemList',itemListElement:(def[5]==='Kerala'?rows:rows.slice(0,12)).map((r,i)=>({'@type':'ListItem',position:i+1,name:r.name,url:safe(r.url||r.mapUrl||r.sourceUrls?.[0])||url}))}};html=html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,`<script type="application/ld+json">${JSON.stringify(ld).replace(/</g,'\\u003c')}</script>`);const dir=path.join(out,route);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),html)}
fs.writeFileSync(path.join(out,'404.html'),metadata(shell,'Page not found · Specialty Coffee India','Explore India’s coffee directory.',origin+'/',true).replace(/<main id="app"[\s\S]*?<\/main>/,'<main id="app" tabindex="-1"><section class="empty-state"><h1>A little off the coffee trail.</h1><p>This page was not found.</p><a class="button" href="/">Back to India</a></section></main>'));
for (const page of newPages) {
  const url = origin + page.path;
  let html = metadata(shell, page.title + ' · Specialty Coffee India', page.description, url, page.noindex);
  const body = '<main id="app" tabindex="-1" data-static-page>' + page.html() + '</main>';
  html = html.replace(/<main id="app"[\s\S]*?<\/main>/, () => body);
  const structured = JSON.stringify(schemaFor(page)).replace(/</g, '\\u003c');
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, () =>
    '<script type="application/ld+json">' + structured + '</script>');
  if (page.type === 'BlogPosting') html = html.replace('property="og:type" content="website"', 'property="og:type" content="article"');
  if (page.image) {
    html = html.replace(/property="og:image" content="[^"]*"/, 'property="og:image" content="' + esc(origin + page.image) + '"');
    if (page.imageAlt) html = html.replace('</head>', '<meta property="og:image:alt" content="' + esc(page.imageAlt) + '">\n</head>');
  }
  const destination = path.join(out, page.path);
  fs.mkdirSync(destination, { recursive: true });
  fs.writeFileSync(path.join(destination, 'index.html'), html);
}
const locs = ['', ...routeDefs.filter(r => !r[4]).map(r => r[0] + '/'),
  ...newPages.filter(page => !page.noindex).map(page => page.path.slice(1))];
fs.writeFileSync(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+locs.map(r=>`<url><loc>${origin}/${r}</loc></url>`).join('')+'</urlset>');
fs.writeFileSync(path.join(out,'robots.txt'),'User-agent: *\nAllow: /\nDisallow: /map.html\nSitemap: '+origin+'/sitemap.xml\n');
console.log(`Built ${routeDefs.length+1+newPages.length} page routes with source-linked static previews and route metadata.`);
