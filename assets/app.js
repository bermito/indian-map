import { createAtlas } from './atlas-pages.mjs';
import { schemaFor } from './page-schema.mjs';
let atlas, atlasPromise, homeJournal;
const documentRoute = path => /^\/(journal(?:\/|$)|explore\/all(?:\/|$))/.test(path);
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe = v => { try { const u=new URL(v); return ['http:','https:'].includes(u.protocol)?u.href:''; } catch{return ''} };
const arrowSvg = '<svg class="arrow-icon" viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true"><path d="M5 15 15 5M5 5h10v10" stroke="currentColor" stroke-width="1.5"/></svg>';
const fmt = n => Number(n||0).toLocaleString('en-IN');
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const datasetCache = new Map();
const records = new Map();
let manifest, coverage, directory, keralaAuthority, current=[], filtered=[], page=1, viewToken=0, route='home', activeFilterParams=new URLSearchParams(), calendarDayEvents=[];
let calendarMonth = new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'}).slice(0,7);
if(!/^\d{4}-\d{2}$/.test(calendarMonth)) calendarMonth = new Date().toISOString().slice(0,7);
const today=()=>{const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const v=t=>p.find(x=>x.type===t).value;return `${v('year')}-${v('month')}-${v('day')}`};
const kinds={cafes:'Cafés',roasters:'Roasters',farms:'Farms & producers','producer-leads':'Estate-linked brands',brands:'Coffee brands',education:'Education',community:'Community',people:'People',trade:'Trade & organisations',experiences:'Experiences',buyroasted:'Buy roasted coffee'};
const plain=v=>String(v||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function brandKey(v){return plain(v).replace(/&/g,'and').replace(/\b(coffee|roasters?|company|co)\b/g,'').replace(/[^a-z0-9]/g,'')}
function brandOptions(rows){const map=new Map();for(const r of rows){if(!r.brand)continue;const key=brandKey(r.brand);if(!map.has(key)||r.brand.length>map.get(key).length)map.set(key,r.brand)}return [...map.entries()].sort((a,b)=>a[1].localeCompare(b[1]));}
function roastGroup(r){const v=plain(r.roast).replace(/[_–‑-]/g,' ');if(!v||['null','roast level','washed process'].includes(v))return 'Not stated / unclear';if(/choose|choice|pick your|custom/.test(v)||(/light/.test(v)&&/dark/.test(v)))return 'Multiple / selectable';if(/medium.*light|light.*medium|light med|med light|city plus|city roast/.test(v))return 'Medium-light';if(/medium.*dark|med.*dark|full city/.test(v))return 'Medium-dark';if(/dark|french|italian|vienna/.test(v))return 'Dark';if(/light|cinnamon|blonde|new england/.test(v))return 'Light';if(/medium|med roast|city/.test(v))return 'Medium';if(/omni/.test(v))return 'Omni';return 'Not stated / unclear'}
const processOptions=['Natural','Washed','Honey','Anaerobic / anoxic','Carbonic maceration','Monsooned','Decaffeinated','Other / not stated'];
function processGroups(r){const v=plain(r.process).replaceAll('_',' '),a=[];if(/natural|sun.?dried|dry process|unwashed/.test(v))a.push('Natural');if(/\bwashed\b|wet process/.test(v))a.push('Washed');if(/honey|pulped/.test(v))a.push('Honey');if(/anaerobic|anoxic/.test(v))a.push('Anaerobic / anoxic');if(/carbonic|\bcm\b/.test(v))a.push('Carbonic maceration');if(/monsoon/.test(v))a.push('Monsooned');if(/decaf|caffeine|co2|co₂|sugarcane/.test(v))a.push('Decaffeinated');return a.length?a:['Other / not stated']}
const sections={legacy:['legacy','From the original field guide.','Historical website observations, retained for review. These may overlap with the current directory and are not independently verified.'],explore:['directory','Find your next coffee stop.','Cafés, roasters, estates and the people behind them. Explore by state, district or city.'],coffee:['products','Find a coffee to come home to.','Compare coffees by roaster, roast and process. Prices are source snapshots; visit the seller for current stock and pack options.'],equipment:['equipment','Tools for your daily ritual.','Brewers, grinders, espresso equipment and accessories from the collected catalogues.'],community:['communities','Good coffee brings people together.','Find local coffee circles, home-brewing groups and communities across India.'],learn:['learn','Keep your curiosity brewing.','Courses, coffee publications, training providers and practical learning resources.'],experiences:['experiences','Go a little closer to the source.','Explore estate visits and coffee experiences. Confirm the schedule directly with the host.'],more:['other-products','More from the coffee world.','Subscriptions, sampler packs, prepared coffee and other catalogue finds.'],leads:['leads','The wider coffee directory.','Additional business leads awaiting review. These listings are not a verified specialty-coffee selection.'],arpan:['arpan','Arpan’s specialty café collection.','All 412 original list entries, with attribution to Arpan (coffee.devout). Three overseas entries are labelled and excluded from the India directory.']};
let saved;
try{saved=new Set(JSON.parse(localStorage.getItem('sci-saved-v1')||'[]'))}catch{saved=new Set()}
const remember=r=>{if(r.id)records.set(r.id,r);return r};
async function data(name){ if(!datasetCache.has(name))datasetCache.set(name,fetch(`/data/${name}.json`).then(r=>{if(!r.ok)throw Error(`Could not load ${name}`);return r.json()}).then(rows=>{if(Array.isArray(rows))rows.forEach(remember);return rows}).catch(e=>{datasetCache.delete(name);throw e}));return datasetCache.get(name); }
function ext(url,label,cls=''){let u=safe(url);return u?`<a class="${cls}" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${label} ${arrowSvg}</a>`:''}
function button(label,href,secondary=false){return `<a class="button${secondary?' secondary':''}" href="${href}">${label.replaceAll('↗',arrowSvg)}</a>`}
function toast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2800)}
function migrateSavedIds(){const aliases=keralaAuthority?.oldIdToNewId||Object.fromEntries(directory.flatMap(r=>(r.previousResearchIds||[]).map(id=>[id,r.id])));let changed=false;const migrated=new Set([...saved].map(id=>{const target=aliases[id]||id;if(target!==id)changed=true;return target}));if(changed){saved=migrated;storeSaved()}}
function storeSaved(){try{localStorage.setItem('sci-saved-v1',JSON.stringify([...saved]))}catch{toast('Your browser could not save this list.')}updateSavedCount()}
function updateSavedCount(){const e=$('#saved-count');if(e)e.textContent=saved.size||''}
function cleanText(v){return Array.isArray(v)?v.join(' · '):String(v||'').replaceAll('_',' ').replaceAll(';',' · ')}
function price(r){if(r.price==null)return r.priceNote?`<p class="price">Check price with seller</p><p class="price-basis">${esc(r.priceNote)}</p>`:'';return `<div class="price">₹${fmt(r.price)}${r.weightGrams?` <small>/ ${fmt(r.weightGrams)} g</small>`:''}</div><p class="price-basis">${esc(r.priceUnit||'Source-listed price')}</p>`}
function recordCard(r){remember(r);const profile=atlas?.profilePath(r);const description=r.description||(['event','learning_resource','community'].includes(r.kind)?r.notes:'');const isEvent=r.kind==='event',loc=[r.city,r.district&&r.district!==r.city?r.district:'',r.state].filter(Boolean).join(' · ');const category=kinds[r.kind]||r.category||r.kind||'Listing';return `<article class="listing-card" data-record="${esc(r.id)}"><div class="card-top"><span class="tag">${esc(category)}</span><button class="icon-button save-button ${saved.has(r.id)?'is-saved':''}" data-save="${esc(r.id)}" aria-pressed="${saved.has(r.id)}" aria-label="${saved.has(r.id)?'Remove':'Save'} ${esc(r.name)}">${saved.has(r.id)?'♥':'♡'}</button></div>${isEvent?`<p class="event-date">${esc(dateLabel(r.date))}${r.endDate?' – '+esc(dateLabel(r.endDate)):''}</p>`:''}<h3 class="card-title">${profile?`<a href="${profile}">${esc(r.name)}</a>`:`<button data-detail="${esc(r.id)}">${esc(r.name)}</button>`}</h3>${r.country&&r.country!=='India'?`<span class="badge">Outside India · ${esc(r.country)}</span>`:''}${r.brand?`<p class="card-brand">${esc(r.brand)}</p>`:''}<p class="card-location">${esc(loc||(r.country&&r.country!=='India'?r.country:r.geographicScope==='India'?'Across India':r.geographicScope==='India_or_unspecified'?'Across India / location unspecified':'Location not supplied'))}</p>${description?`<p class="card-description clamp">${esc(description)}</p>`:''}${r.categories?.includes('buyroasted')?'<p class="card-facet">Roasted coffee available</p>':''}${r.visitNote?`<p class="card-visit-note">${esc(r.visitNote)}</p>`:''}${r.flavourNotes?`<p class="card-description tasting">${esc(cleanText(r.flavourNotes))}</p>`:''}${r.roast||r.process?`<p class="card-description">${esc([r.roast?(r.roast.length<45?cleanText(r.roast):roastGroup(r)):'',r.process?processGroups(r).filter(p=>p!=='Other / not stated').join(' / '):''].filter(Boolean).join(' · '))}</p>`:''}${r.venue?`<p class="card-description">${esc(r.venue)}</p>`:''}${r.tags?.length?`<p class="card-description clamp">${esc(r.tags.join(' · '))}</p>`:''}${r.time?`<p class="card-description">${esc(r.time)} IST</p>`:''}${price(r)}<div class="card-footer"><span class="badge">${esc(r.evidenceLabel||'Source listed')}</span><div class="card-actions">${profile?`<a class="text-button" href="${profile}">View profile ${arrowSvg}</a>`:`<button class="text-button" data-detail="${esc(r.id)}">Details ${arrowSvg}</button>`}${r.mapUrl?ext(r.mapUrl,'Map','text-button'):''}</div></div></article>`}
function stateCard(s){const count=s.directory_entries;return `<a href="/states/${slug(s.state)}/" class="state-card"><span>${esc(s.state)}</span><small>${count?fmt(count)+' listings':'Help us explore'}</small>${arrowSvg}</a>`}
async function home() {
  const renderHref = location.href;
  const app = $('#app');
  if (!app.querySelector('.atlas-hero')) {
    const stage = $('#atlas-stage-template').content.cloneNode(true);
    app.replaceChildren(stage);
  }
  homeJournal ||= app.querySelector('.ij-home')?.outerHTML;
  const [eventResult] = await Promise.allSettled([data('events')]);
  if (location.href !== renderHref) return;

  const journal = homeJournal || '<section class="section"><h2><a href="/journal/">The India coffee journal →</a></h2></section>';
  const events = eventResult.status === 'fulfilled' ? eventResult.value : [];
  const upcoming = events
    .filter(upcomingEvent)
    .sort((first, second) => first.date.localeCompare(second.date))
    .slice(0, 3);
  const categories = [
    ['Cafés', 'Find a place to brew or sit down for a cup.', '/explore/?kind=cafes'],
    ['Roasters', 'Discover who roasts coffee near you.', '/explore/?kind=roasters'],
    ['Farms & producers', 'Trace a coffee to the place it was grown.', '/explore/?kind=farms'],
    ['Coffee beans', 'Explore lots by roaster, variety and process.', '/coffee/'],
    ['People & community', 'Meet local coffee circles and home brewers.', '/community/'],
    ['Coffee education', 'Find courses, publications and brewing guides.', '/learn/']
  ];
  const categoryCards = categories.map(([title, description, link]) =>
    `<a class="category-card" href="${link}"><h3>${title}</h3><p>${description}</p><span class="category-arrow">${arrowSvg}</span></a>`
  ).join('');
  const eventsList = upcoming.length
    ? `<div class="card-grid">${upcoming.map(recordCard).join('')}</div>`
    : `<p class="home-event-empty">${eventResult.status === 'fulfilled' ? 'There are no confirmed upcoming dates in the guide.' : 'The event list could not load.'} <a href="/events/">Open the calendar →</a></p>`;
  const html = `
    <div class="home-collection" id="home-collection">
      <section class="home-edition section">
        <div class="section-head">
          <div><p class="eyebrow">The India field guide</p><h2>Good coffee.<br>Every direction.</h2></div>
          <form class="atlas-directory-search" action="/explore/" method="get" id="home-search" role="search">
            <label for="hero-query">Search the directory</label>
            <div><input id="hero-query" name="q" placeholder="A café, a roaster or a city" autocomplete="off"><button type="submit" aria-label="Search directory">${arrowSvg}</button></div>
          </form>
        </div>
        <div class="category-grid">${categoryCards}</div>
        <nav class="home-secondary-links" aria-label="More collections"><a href="/explore/?kind=people">Coffee professionals →</a><a href="/equipment/">Brewing equipment →</a><a href="/experiences/">Estate visits →</a><a href="/more/">Subscriptions &amp; more →</a></nav>
      </section>
      ${journal}
      <section class="section" id="states">
        <div class="section-head"><div><p class="eyebrow">Explore by location</p><h2>States and union territories</h2></div><p>Choose a place to open its local directory.</p></div>
        <div class="state-grid">${coverage.states.map(stateCard).join('')}</div>
      </section>
      <section class="spotlight kerala-feature" aria-labelledby="kerala-feature-title">
        <div><p class="eyebrow">The Kerala guide</p><h2 id="kerala-feature-title">From the hills to the coast.</h2><p>Start with the producers of Wayanad, the estates of Idukki or the cafés of Kozhikode and Kochi.</p>${button('Explore Kerala ↗','/states/kerala/')}</div>
        <nav class="district-links" aria-label="Featured Kerala districts">${['Wayanad','Idukki','Kozhikode','Ernakulam'].map(d => `<a href="/states/kerala/districts/${slug(d)}/">${d} ${arrowSvg}</a>`).join('')}</nav>
      </section>
      <section class="section"><div class="section-head"><div><p class="eyebrow">Calendar</p><h2>Upcoming coffee events</h2></div><a href="/events/" class="text-button">All events ↗</a></div>${eventsList}</section>
    </div>`;
  $('#home-collection')?.remove();
  app.insertAdjacentHTML('beforeend', html);
  $('#home-search').addEventListener('submit', event => {
    event.preventDefault();
    const query = $('#hero-query').value.trim();
    go('/explore/' + (query ? '?q=' + encodeURIComponent(query) : ''));
  });
  if (location.hash === '#states') $('#states').scrollIntoView();
}
function option(value,label,selected){return `<option value="${esc(value)}"${value===selected?' selected':''}>${esc(label||value)}</option>`}
function select(name,label,values,chosen='',all='All'){return `<label class="filter-label"><span>${label}</span><select name="${name}" class="filter-select">${option('',all,chosen)}${values.map(v=>Array.isArray(v)?option(v[0],v[1],chosen):option(v,v,chosen)).join('')}</select></label>`}
function unique(rows,key){return [...new Set(rows.map(r=>r[key]).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b)))}
const keralaLabels={Kozhikode:'Kozhikode (Calicut)',Ernakulam:'Ernakulam · Kochi',Thiruvananthapuram:'Thiruvananthapuram (Trivandrum)'};
const keralaDistricts=()=>keralaAuthority?.districts||coverage.keralaDistricts.map(d=>({...d,name:d.district,displayName:keralaLabels[d.district]||d.district}));
const districtMeta=name=>keralaDistricts().find(d=>(d.name||d.district)===name);
function filterHref(params,changes,path=location.pathname){const next=new URLSearchParams(params);for(const [key,value]of Object.entries(changes)){if(value)next.set(key,value);else next.delete(key)}next.delete('page');return path+(next.size?'?'+next:'')}
function districtHref(params,name) {
  const filters = new URLSearchParams(params);
  if (filters.get('district') !== name) filters.delete('city');
  filters.delete('state');
  filters.delete('district');
  if (!filters.size && name && atlas) return '/states/kerala/districts/'+slug(name)+'/';
  return filterHref(filters,{district:name},'/states/kerala/');
}
function stateShortcuts(state,params){const options=[['cafes','Cafés'],['roasters','Roasters'],['farms','Farms'],...(state==='Kerala'?[['education','Education'],['people','People'],['buyroasted','Buy roasted coffee']]:[])];return `<div class="hero-actions state-shortcuts">${options.map(([kind,label])=>`<a class="button secondary${params.get('kind')===kind?' is-active':''}" data-state-kind="${kind}" href="${esc(filterHref(params,{kind},'/states/'+slug(state)+'/'))}"${params.get('kind')===kind?' aria-current="true"':''}>${label}</a>`).join('')}<a class="button secondary" href="/events/?state=${encodeURIComponent(state)}">Events</a><a class="button secondary" href="/community/?state=${encodeURIComponent(state)}">Community</a><a class="button secondary" href="/learn/?state=${encodeURIComponent(state)}">Guides & learning</a></div>`}
let keralaMapPromise;
async function loadKeralaMap(){if(!keralaMapPromise)keralaMapPromise=fetch('/assets/map/kerala-districts.svg').then(r=>{if(!r.ok)throw Error('District illustration unavailable');return r.text()}).catch(()=>{keralaMapPromise=null;return ''});return keralaMapPromise}
function keralaDistrictPicker(params,svg){return `<section class="kerala-explorer" id="kerala-district-picker" aria-labelledby="kerala-explorer-title"><div class="kerala-map-graphic">${svg}</div><div class="kerala-map-copy"><p class="eyebrow">The Keralam coffee map</p><h2 id="kerala-explorer-title">Find your district.</h2><p>From the northern coast to the highlands and the capital. Choose a district to explore its coffee places and people.</p><nav class="kerala-district-links" aria-label="Kerala districts">${keralaDistricts().map(d=>{const name=d.name||d.district;return `<a href="${esc(districtHref(params,name))}" data-kerala-district="${esc(name)}">${esc(d.displayName||keralaLabels[name]||name)}${arrowSvg}</a>`}).join('')}</nav><a class="text-button kerala-all-districts" href="${esc(districtHref(params,''))}" data-kerala-district="">All districts ↗</a><p class="kerala-map-source">District shapes and local guidance from <a href="https://www.specialtycoffeekerala.com/" target="_blank" rel="noopener noreferrer">Specialty Coffee Keralam ↗</a>. Empty districts are gaps in the guide.</p></div></section>`}
function syncDistrictNavigation(params){$$('[data-kerala-district]').forEach(link=>{const name=link.dataset.keralaDistrict,active=(params.get('district')||'')===name;link.setAttribute('href',districtHref(params,name));link.classList.toggle('is-active',active);if(active)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current')});$$('[data-state-kind]').forEach(link=>{const kind=link.dataset.stateKind,active=params.get('kind')===kind;link.setAttribute('href',filterHref(params,{kind}));link.classList.toggle('is-active',active);if(active)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current')})}
function recordRelationships(r){const key=r.authorityId||r.id;return (keralaAuthority?.relationships||[]).flatMap(link=>{const forward=link.from===key;if(!forward&&link.to!==key)return [];const target=directory.find(place=>(place.authorityId||place.id)===(forward?link.to:link.from));return target?[{...link,target,label:forward?link.label:link.reverse}]:[]})}
function relationshipHTML(r){const links=recordRelationships(r);return links.length?`<section class="detail-relationships"><h3>Coffee connections</h3>${links.map(link=>`<div><p>${esc(link.label)} <button class="text-button" data-detail="${esc(link.target.id)}">${esc(link.target.name)} ${arrowSvg}</button></p>${link.note?`<p class="relationship-note">${esc(link.note)}</p>`:''}${link.source?ext(link.source,'View source','text-button'):''}</div>`).join('')}</section>`:''}

async function listing(section,state=''){page=1;const renderHref=location.href;const spec=sections[section]||sections.explore;const rows=section==='explore'?directory:await data(spec[0]);if(renderHref!==location.href)return;current=rows;const params=new URLSearchParams(location.search);if(state)params.set('state',state);const hasState=rows.some(r=>Boolean(r.state));if(!hasState)params.delete('state');const hasDistrict=section==='explore'&&(params.get('state')==='Kerala'||districtValues(rows,params.get('state')).length>0);const keralaMap=state==='Kerala'?await loadKeralaMap():'';if(renderHref!==location.href)return;if(params.get('brand'))params.set('brand',brandKey(params.get('brand')));let title=state?`Coffee in ${state}.`:spec[1];const desc=state?`Discover cafés, roasters, farms and coffee communities in ${state}. Filter by district or city to get closer.`:spec[2];if(renderHref!==location.href)return;$('#app').innerHTML=`<section class="page-intro"><div class="breadcrumb"><a href="/">India</a> / ${state?'States / '+esc(state):esc(section==='more'?'More coffee':section)}</div><p class="eyebrow">${state?'Explore by place':'The coffee field guide'}</p><h1>${esc(title)}</h1><p class="lede">${esc(desc)}</p>${state?stateShortcuts(state,params):section==='explore'?'<a class="text-button" href="/explore/all/">All profiles A–Z →</a>':''}</section>${state==='Kerala'?keralaDistrictPicker(params,keralaMap):state?atlas?.districtNav(state)||'':''}<section class="directory-section"><form id="filter-form" class="toolbar"><div class="search-field"><label for="directory-search" class="sr-only">Search ${esc(section)}</label><span aria-hidden="true">⌕</span><input id="directory-search" type="search" name="q" value="${esc(params.get('q')||'')}" placeholder="Search name, city, flavour or source…"></div><div class="filters">${hasState?select('state',section==='coffee'?'Roaster / seller state':'State / UT',coverage.states.map(x=>x.state),params.get('state')||'','All India'):''}${section==='explore'?select('kind','Category',Object.entries(kinds),params.get('kind')||'','All places'):''}${hasDistrict?select('district','District',districtValues(rows,params.get('state')),params.get('district')||'','All districts'):''}${section==='explore'?select('city','City',cityValues(rows,params.get('state'),params.get('district')),params.get('city')||'','All cities'):''}${section==='coffee'?select('brand','Roaster / seller',brandOptions(rows),params.get('brand')||'','All roasters')+select('roast','Roast',['Light','Medium-light','Medium','Medium-dark','Dark','Omni','Multiple / selectable','Not stated / unclear'],params.get('roast')||'','All roasts')+select('process','Process',processOptions,params.get('process')||'','All processes'):''}${['coffee','equipment','more'].includes(section)?select('source','Source', [...new Set(rows.flatMap(r=>r.sourceNames||[]))].sort(),params.get('source')||'','All sources'):''}${['community','learn','equipment','more'].includes(section)?select('category','Type',unique(rows,'category'),params.get('category')||'','All types'):''}${select('sort','Sort',[['name','Name A–Z'],['name-desc','Name Z–A'],...(section==='coffee'?[['normalized-price','Price per 250 g (known only)']]:[])],params.get('sort')||'name','Default')}</div><div class="toolbar-bottom"><label class="checkbox-label"><input type="checkbox" name="saved" ${params.get('saved')==='1'?'checked':''}> Saved only</label><button type="button" class="text-button" id="clear-filters">Reset filters</button></div></form>${section==='coffee'?`<p class="notice">${fmt(rows.length)} source listings, with overlaps between catalogues. Prices use different pack sizes; each price shows its basis. Roast and process filters group source descriptions; original wording is kept in details. State filters describe roaster or seller locations, not bean origins.</p>`:''}${!hasState&&['equipment','more'].includes(section)?'<p class="notice">Browse online sellers across India. Check each seller’s delivery coverage and current availability.</p>':''}${section==='leads'?`<p class="notice">Unverified leads are kept separate from the main guide. Inclusion does not establish specialty quality, current operation or a precise map location.</p>`:''}${state==='Kerala'?`<p class="notice">All 14 districts are available to explore. Some have no collected records yet. Unknown districts remain unassigned.</p>`:state&&!hasDistrict?'<p class="notice">District information is still being checked. Browse by city or category.</p>':''}<div class="results-head"><p id="result-count" role="status"></p><button class="text-button" id="download-results">Download these results ↓</button></div><div class="card-grid" id="results"></div><div class="pagination" id="pagination"></div></section>`;
const form=$('#filter-form');const sync=()=>{if(form!==$('#filter-form'))return;page=1;const p=new URLSearchParams();new FormData(form).forEach((v,k)=>{if(v)p.set(k,k==='saved'?'1':v)});history.replaceState({},'',location.pathname+(p.size?'?'+p:''));syncDistrictNavigation(p);applyFilters(p);};form.addEventListener('submit',e=>{e.preventDefault();sync()});let timer;$('#directory-search').addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(sync,120)});form.addEventListener('change',e=>{if(e.target.name==='district'&&form.elements.city){
  const choices=cityValues(rows,form.elements.state?.value,e.target.value);
  form.elements.city.innerHTML=option('','All cities','')+choices.map(city=>option(city,city,'')).join('');
}if(e.target.name==='state'){const s=e.target.value;if(section==='explore'&&!state){const p=new URLSearchParams(location.search);p.delete('district');p.delete('city');if(s)p.set('state',s);else p.delete('state');go('/explore/'+(p.size?'?'+p:''));return;}if(state){const p=new URLSearchParams(location.search);p.delete('state');p.delete('district');p.delete('city');go((s?'/states/'+slug(s)+'/':'/explore/')+(p.size?'?'+p:''));return;}for(const key of ['district','city']){const el=form.elements[key];if(el){const vals=key==='district'?districtValues(rows,s):unique(s?rows.filter(r=>r.state===s):rows,'city');el.innerHTML=option('',key==='district'?'All districts':'All cities','')+vals.map(x=>option(x,x,'')).join('')}}}sync()});$('#clear-filters').onclick=()=>go(state?`/states/${slug(state)}/`:`/${section}/`);$('#download-results').onclick=()=>downloadCSV(filtered,`${section}-coffee-list.csv`);syncDistrictNavigation(params);applyFilters(params);}
function cityValues(rows, state, district) {
  return unique(rows.filter(r => (!state || r.state === state) && (!district || r.district === district)), 'city');
}
function districtValues(rows,state){if(state && atlas?.districtNames(state).length)return atlas.districtNames(state);let vals=unique(state?rows.filter(r=>r.state===state):rows,'district');if(state==='Kerala')vals=[...new Set([...vals,...(coverage.keralaDistricts||coverage.kerala_districts||[]).map(x=>x.district)])].sort();return vals}
function applyFilters(params) {
  activeFilterParams = new URLSearchParams(params);
  const terms = plain(params.get('q')).trim().split(/\s+/).filter(Boolean);
  const fields = ['state','district','city','category'].filter(key => params.get(key));
  const kind = params.get('kind'), brand = params.get('brand'), roast = params.get('roast');
  const process = params.get('process'), source = params.get('source'), onlySaved = params.get('saved') === '1';
  const canonicalBrand = brand && brandKey(brand);
  filtered = current.filter(record => {
    if (onlySaved && !saved.has(record.id)) return false;
    if (fields.some(key => record[key] !== params.get(key))) return false;
    if (kind && record.kind !== kind && !record.categories?.includes(kind)) return false;
    if (brand && brandKey(record.brand) !== canonicalBrand) return false;
    if (roast && roastGroup(record) !== roast) return false;
    if (process && !processGroups(record).includes(process)) return false;
    if (source && !record.sourceNames?.includes(source)) return false;
    if (!terms.length) return true;
    const searchable = plain([
      record.name, record.category, kinds[record.kind], ...(record.categories||[]).map(key => kinds[key]||key),
      record.brand, record.city, record.district, record.state, record.address,
      record.flavourNotes, record.origin, record.estate, record.roast, record.process, record.variety,
      record.description, record.name_ml, record.nameMl, record.description_ml, record.descriptionMl,
      ...(record.stateAliases||[]), ...(record.districtAliases||[]), ...(record.sourceNames||[]),
      ...(record.state==='Kerala' ? districtMeta(record.district)?.aliases||[] : [])
    ].filter(Boolean).join(' '));
    return terms.every(term => searchable.includes(term));
  });
  const sort = params.get('sort');
  if (sort === 'normalized-price') {
    filtered = filtered.filter(r => Number.isFinite(Number(r.normalized250gINR)) && Number(r.normalized250gINR) > 0);
    filtered.sort((a,b) => a.normalized250gINR - b.normalized250gINR);
  } else {
    const order = sort === 'name-desc' ? -1 : 1;
    filtered.sort((a,b) => order * String(a.name).localeCompare(String(b.name)));
  }
  renderResults();
}
function renderResults(){let total=filtered.length,last=Math.max(1,Math.ceil(total/24));page=Math.min(page,last);$('#result-count').textContent=`${fmt(total)} ${total===1?'result':'results'}${total>24?` · Page ${page} of ${last}`:''}`;$('#results').innerHTML=total?filtered.slice((page-1)*24,page*24).map(recordCard).join(''):`<div class="empty-state"><span class="empty-symbol">⌕</span><h2>No listings found.</h2><p>Try a different place or fewer filters. A blank district is a research gap, not proof that there is no coffee activity.</p><button class="button secondary" data-action="submit">Suggest a place</button></div>`;$('#pagination').innerHTML=total>24?`<button class="button secondary" data-page="${page-1}" ${page===1?'disabled':''}>← Previous</button><span>${page} / ${last}</span><button class="button secondary" data-page="${page+1}" ${page===last?'disabled':''}>Next →</button>`:'';}
function dateLabel(value){if(!value)return 'Date to be confirmed';const d=new Date(value+'T12:00:00Z');return Number.isNaN(+d)?value:d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})}
const upcomingEvent = event => Boolean(event.calendarEligible && event.date && event.status!=='completed' && (event.endDate||event.date)>=today());
const historicalEvent=r=>Boolean(r.date&&(r.endDate||r.date)<today()&&(r.status==='past_editorial_archive'||r.status==='past_listed'||r.historicalStatus==='archived'||r.archived===true));
async function eventPage(){const renderHref=location.href;const events=await data('events');const params=new URLSearchParams(location.search), selectedState=params.get('state')||'',mode=['upcoming','past','review'].includes(params.get('view'))?params.get('view'):'upcoming';let all=events.filter(r=>!selectedState||r.state===selectedState);let shown=all.filter(r=>mode==='past'?(r.calendarEligible||historicalEvent(r))&&(r.endDate||r.date)<today():mode==='review'?!r.calendarEligible&&!historicalEvent(r):upcomingEvent(r)).sort((a,b)=>mode==='past'?(b.date||'').localeCompare(a.date||''):(a.date||'').localeCompare(b.date||''));if(renderHref!==location.href)return;$('#app').innerHTML=`<section class="page-intro"><p class="eyebrow">Meet over coffee</p><h1>Put coffee on<br>your calendar.</h1><p class="lede">Cuppings, festivals, workshops and conversations. Upcoming dates use organiser-supported sources. Past events include the corrected Keralam archive; unscheduled leads stay in “To confirm”.</p></section><section class="section event-section"><div class="event-controls"><div class="tabs">${[['upcoming','Upcoming'],['past','Past events'],['review','To confirm']].map(([v,l])=>`<a class="${mode===v?'active':''}" href="/events/?view=${v}${selectedState?'&state='+encodeURIComponent(selectedState):''}">${l}</a>`).join('')}</div>${select('event-state','State / UT',coverage.states.map(x=>x.state),selectedState,'All India')}<button class="button secondary" data-action="submit">Suggest an event ↗</button></div><div class="events-layout"><div><p class="results-head">${shown.length} ${mode==='review'?'event leads':mode+' events'}</p>${shown.length?shown.map(r=>`<div class="event-card">${recordCard(r)}${calendarButton(r,'text-button calendar-download')}</div>`).join(''):`<div class="empty-state"><h2>${mode==='upcoming'?'No confirmed upcoming events here yet.':'No events in this view.'}</h2><p>Try all India or browse past events. Organisers can suggest new dates.</p></div>`}</div><aside class="calendar" id="calendar"></aside></div></section>`;$('[name="event-state"]').onchange=e=>go(`/events/?view=${mode}&state=${encodeURIComponent(e.target.value)}`);renderCalendar(all.filter(r=>r.calendarEligible||(historicalEvent(r)&&r.status!=='past_listed')));}
function renderCalendar(events){calendarDayEvents=events;const [y,m]=calendarMonth.split('-').map(Number),first=new Date(Date.UTC(y,m-1,1)),days=new Date(Date.UTC(y,m,0)).getUTCDate(),offset=(first.getUTCDay()+6)%7;const label=first.toLocaleDateString('en-IN',{month:'long',year:'numeric',timeZone:'UTC'});$('#calendar').innerHTML=`<div class="calendar-head"><button class="icon-button" data-month="-1" aria-label="Previous month">←</button><h3>${label}</h3><button class="icon-button" data-month="1" aria-label="Next month">→</button></div><div class="calendar-grid">${['M','T','W','T','F','S','S'].map(x=>`<span class="calendar-weekday">${x}</span>`).join('')}${Array.from({length:offset},()=>'<span></span>').join('')}${Array.from({length:days},(_,i)=>{const date=`${calendarMonth}-${String(i+1).padStart(2,'0')}`, ev=events.filter(e=>e.date<=date&&(e.endDate||e.date)>=date);return ev.length?`<button class="calendar-day has-event" data-calendar-date="${date}" aria-label="${esc(dateLabel(date))}: ${ev.length} ${ev.length===1?'event':'events'}" title="${esc(ev.map(e=>e.name).join(' · '))}">${i+1}<span class="event-dot"></span></button>`:`<span class="calendar-day ${date===today()?'today':''}">${i+1}</span>`}).join('')}</div><p class="calendar-caption">● Published dates and archives · India Standard Time<br>See each event’s source and status before making plans.</p>`;$$('[data-month]').forEach(b=>b.onclick=()=>{const d=new Date(Date.UTC(y,m-1+Number(b.dataset.month),1));calendarMonth=d.toISOString().slice(0,7);renderCalendar(events)})}
function sessionTimes(event) {
  if (event.timezone !== 'Asia/Kolkata' || (event.endDate && event.endDate !== event.date)) return null;
  const range = /^([01]\d|2[0-3]):([0-5]\d)\s*[-–—]\s*([01]\d|2[0-3]):([0-5]\d)$/.exec(event.time || '');
  if (!range) return null;
  const start = new Date(event.date+'T'+range[1]+':'+range[2]+':00+05:30');
  const end = new Date(event.date+'T'+range[3]+':'+range[4]+':00+05:30');
  if (!Number.isFinite(+start) || !Number.isFinite(+end) || +start===+end) return null;
  if (end < start) end.setUTCDate(end.getUTCDate()+1);
  return {start,end};
}
function calendarButton(event, className) {
  if (!upcomingEvent(event)) return '';
  const label = sessionTimes(event) ? 'Add session to calendar' : 'Download date reminder';
  return '<button class="'+className+'" data-ics="'+esc(event.id)+'">'+label+' ↓</button>';
}
function calendarFile(event, times=sessionTimes(event)) {
  const timestamp = date => date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const escapeText = value => String(value||'').replace(/\\/g,'\\\\').replace(/\r\n?|\n/g,'\\n').replace(/[,;]/g,'\\$&');
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Specialty Coffee India//Events//EN','BEGIN:VEVENT',
    'UID:'+event.id+'@specialtycoffeeindia.blog','DTSTAMP:'+timestamp(new Date())];
  if (times) {
    lines.push('DTSTART:'+timestamp(times.start),'DTEND:'+timestamp(times.end));
  } else {
    // All-day DTEND is exclusive, including for events that span several dates.
    const end = new Date((event.endDate||event.date)+'T00:00:00Z');
    end.setUTCDate(end.getUTCDate()+1);
    lines.push('DTSTART;VALUE=DATE:'+event.date.replaceAll('-',''),'DTEND;VALUE=DATE:'+timestamp(end).slice(0,8));
  }
  const url = safe(event.url || event.sourceUrls?.[0]);
  const sourceTime = event.time ? ' Listed time: '+event.time+(event.timezone==='Asia/Kolkata'?' IST.':'.') : '';
  const description = (times?'Session time from the organiser.':'Date reminder.')+sourceTime+' Confirm availability with the organiser.';
  lines.push('SUMMARY:'+escapeText(event.name),'LOCATION:'+escapeText([event.venue,event.city,event.state].filter(Boolean).join(', ')),'DESCRIPTION:'+escapeText(description));
  if (url) lines.push('URL:'+url);
  lines.push('END:VEVENT','END:VCALENDAR');
  const encoder = new TextEncoder();
  return lines.map(line => {
    let folded='', length=0;
    for (const char of line) {
      const bytes=encoder.encode(char).length;
      if (length+bytes>75) { folded+='\r\n '; length=1; }
      folded+=char;
      length+=bytes;
    }
    return folded;
  }).join('\r\n')+'\r\n';
}
function downloadICS(event) {
  if (!event || !upcomingEvent(event)) return;
  const times = sessionTimes(event);
  download(calendarFile(event,times),slug(event.name)+'.ics','text/calendar;charset=utf-8');
  toast(times?'Calendar session downloaded.':'Calendar date reminder downloaded.');
}
function detail(r){if(!r)return;const description=r.description||(['event','learning_resource','community'].includes(r.kind)?r.notes:'');let facts=[['Location',[...new Set([r.city,r.district,r.state,r.country&&r.country!=='India'?r.country:''].filter(Boolean))].join(' · ')],['Address',r.address],['Opening hours',r.hours],['Phone',r.phoneDisplay||r.phone],['Roaster / seller',r.brand],['Roast',r.roast],['Process',r.process],['Variety',r.variety],['Farm / estate',r.estate],['Bean origin',r.origin],['Altitude',r.altitude],['Pack size',r.weightGrams?`${r.weightGrams} g`:r.availableWeights],['Flavour notes',cleanText(r.flavourNotes)],['Date',r.date?dateLabel(r.date):''],['End date',r.endDate?dateLabel(r.endDate):''],['Venue',r.venue],['Time (IST)',r.time],['Time notes',r.timeNote],['Entry',r.entry],['Registration',r.registrationClosed?'Closed · past event':''],['Platform',r.platform],['Source snapshot',r.snapshotDate],['Research checked',r.checkedDate]];$('#detail-content').innerHTML=`<div class="detail-body"><p class="eyebrow">${esc(kinds[r.kind]||r.category||'Coffee directory')}</p><h2 id="detail-title">${esc(r.name)}</h2><span class="badge">${esc(r.evidenceLabel||'Source listed')}</span>${description?`<p class="detail-description">${esc(description)}</p>`:''}${r.categories?.includes('buyroasted')?'<span class="badge detail-facet">Buy roasted coffee</span>':''}${r.visitNote?`<p class="notice detail-visit-note">${esc(r.visitNote)}</p>`:''}${price(r)}<div class="hero-actions">${ext(r.url,r.kind==='community'?'Open community':'Visit website','button')}${ext(r.mapUrl,'Open map','button secondary')}${r.shopUrl&&r.shopUrl!==r.url?ext(r.shopUrl,'Shop coffee','button secondary'):''}${r.phone&&/^\+?[0-9 ()-]+$/.test(r.phone)?`<a class="button secondary" href="tel:${esc(r.phone.replace(/[ ()-]/g,''))}">Call</a>`:''}<button class="button secondary save-button" data-save="${esc(r.id)}" aria-pressed="${saved.has(r.id)}">${saved.has(r.id)?'Saved ♥':'Save ♡'}</button></div><dl class="fact-grid">${facts.filter(x=>x[1]).map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>${relationshipHTML(r)}${r.sourceNote?`<p class="detail-editor-note">${esc(r.sourceNote)}</p>`:''}${r.editorNote?`<p class="detail-editor-note"><strong>Editorial note:</strong> ${esc(r.editorNote)}</p>`:''}${r.kind==='coffee'||r.price!=null?'<p class="notice">Price and availability are recorded snapshots. Confirm the exact pack, current price and stock with the seller.</p>':''}<details class="evidence-details"><summary>Sources & verification notes</summary>${r.notes?`<p>${esc(r.notes)}</p>`:''}<p>${esc(r.status||r.verification||'Not independently verified')}</p>${r.specialtyStatus?`<p>${esc(r.specialtyStatus)}</p>`:''}${r.geographyNote?`<p>${esc(r.geographyNote)}</p>`:''}${r.reviewNeeded?`<p><strong>To review:</strong> ${esc(r.reviewNeeded)}</p>`:''}<ul class="source-list">${(r.sourceUrls||[]).map((u,i)=>`<li>${ext(u,esc(r.sourceNames?.[i]||new URL(u).hostname))}</li>`).join('')}</ul></details>${calendarButton(r,'button secondary')}<button class="text-button correction-link" data-correction="${esc(r.id)}">Suggest a correction ↗</button></div>`;const dialog=$('#detail-dialog');dialog.setAttribute('aria-labelledby','detail-title');if(!dialog.open)dialog.showModal()}
async function sourcePage(){const renderHref=location.href;const sources=await data('sources');if(renderHref!==location.href)return;$('#app').innerHTML=`<section class="page-intro"><p class="eyebrow">A transparent field guide</p><h1>Built from many<br>coffee conversations.</h1><p class="lede">This collection brings independent lists, catalogues and primary sources together. Every listing retains its evidence. Collection dated ${dateLabel(manifest.checkedDate)}. Latest editorial update ${dateLabel(manifest.latestEditorialUpdate||manifest.checkedDate)}.</p></section><section class="section"><div class="source-principles"><div><h3>Places, not promises.</h3><p>A directory listing does not certify specialty quality, opening hours or current operation. Follow the source before you visit.</p></div><div><h3>Origins stay distinct.</h3><p>A roaster’s address is different from a farm’s location. Estate-linked retail brands are kept separate from physical farms.</p></div><div><h3>Room to fill the gaps.</h3><p>Unknown districts remain unassigned. Some sources were only partly accessible. Empty areas indicate research gaps.</p></div></div><div class="hero-actions">${button('Arpan’s original 412 places','/arpan/',true)}${button('Additional business leads','/leads/',true)}${button('Original website archive','/legacy/',true)}${button('Equipment','/equipment/',true)}${button('Subscriptions & more','/more/',true)}${button('Coffee experiences','/experiences/',true)}</div><div class="section-head"><h2>The source register.</h2><span>${sources.length} sources</span></div><div class="sources-table">${sources.map(s=>`<article><div><h3>${ext(s.url,esc(s.name))}</h3><span class="badge">${esc(s.status)}</span></div><div><strong>${fmt(s.collected)} collected${s.expected!=null?' / '+fmt(s.expected):''}</strong><p>${esc(s.notes)}</p></div></article>`).join('')}</div><p class="notice">Download the complete research snapshot: <a href="/data/research.json.gz" download>JSON archive ↓</a>. The original spreadsheet and import files also retain the collection history.</p><div class="notice"><strong>About the map</strong><p>The original terrain illustration is retained, using ETOPO 2022 elevation data (NOAA NCEI). The state directory includes all current states and union territories, including islands that are absent from the terrain geometry. Use the state list for complete navigation.</p></div></section>`}
async function savedPage(){
 const renderHref=location.href;let incomplete=false;
 const missing=[...saved].filter(id=>!records.has(id));
 if(missing.length){
  try{
   const index=await data('record-index');
   const allowed=new Set(['directory','products','equipment','communities','learn','events','other-products','experiences','leads','arpan','legacy']);
   const datasets=[...new Set(missing.map(id=>index[id]).filter(name=>allowed.has(name)))];
   const results=await Promise.allSettled(datasets.map(data));
   incomplete=results.some(result=>result.status==='rejected')||missing.some(id=>!records.has(id));
  }catch{incomplete=true}
 }
 if(renderHref!==location.href)return;
 current=[...saved].map(id=>records.get(id)).filter(Boolean);filtered=current;page=1;
 $('#app').innerHTML=`<section class="page-intro"><p class="eyebrow">Your coffee trail</p><h1>Keep the good finds.</h1><p class="lede">Saved on this browser. Gather places to visit, coffees to try and people to follow.</p></section><section class="section">${incomplete?'<p class="notice" role="status">Some saved finds could not load. Your saved IDs are still kept in this browser. <button class="text-button" data-action="retry">Try again</button></p>':''}<div class="results-head"><p id="result-count" role="status"></p><button class="text-button" id="download-results">Download saved list ↓</button></div><div class="card-grid" id="results"></div><div class="pagination" id="pagination"></div></section>`;
 if(!current.length){$('#result-count').textContent=incomplete?'Saved finds could not load':'No saved finds yet';$('#results').innerHTML=incomplete?'':`<div class="empty-state"><h2>Your next discovery starts here.</h2><p>Tap the heart on any listing to keep it in this browser.</p>${button('Explore the directory ↗','/explore/')}</div>`}else renderResults();
 $('#download-results').onclick=()=>downloadCSV(current,'my-coffee-trail.csv');
}
function refreshSavedView(){if(route==='saved')return savedPage();if((route==='states'||sections[route])&&activeFilterParams.get('saved')==='1')applyFilters(activeFilterParams)}
function showCalendarDay(date){
 const events=calendarDayEvents.filter(r=>r.date<=date&&(r.endDate||r.date)>=date);
 if(events.length===1){detail(events[0]);return}if(!events.length)return;
 $('#detail-content').innerHTML=`<div class="detail-body"><p class="eyebrow">Coffee on this date</p><h2 id="detail-title">${esc(dateLabel(date))}</h2><p class="detail-description">${events.length} events. Choose one for its details and source.</p><div class="calendar-event-list">${events.map(recordCard).join('')}</div></div>`;
 const dialog=$('#detail-dialog');dialog.setAttribute('aria-labelledby','detail-title');if(!dialog.open)dialog.showModal();
}
function download(content,name,type){const u=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000)}
function downloadCSV(rows,name){const keys=['name','category','state','district','city','brand','price','priceUnit','url','mapUrl','checkedDate','snapshotDate','evidenceLabel','sourceUrls'];const cell=v=>{let s=Array.isArray(v)?v.join(' | '):String(v??'');if(/^[=+\-@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'};download('\ufeff'+[keys.join(','),...rows.map(r=>keys.map(k=>cell(r[k])).join(','))].join('\r\n'),name,'text/csv;charset=utf-8');toast(`${fmt(rows.length)} records downloaded.`)}
function updateRouteMetadata(publishedPage){
 const path=location.pathname.replace(/\/+$/,'')||'/',parts=path.split('/'),state=parts[1]==='states'?coverage.states.find(s=>slug(s.state)===parts[2]):null;
 const key=path==='/'?'home':parts[1],spec=sections[key],known=Boolean(publishedPage)||path==='/'||(Boolean(state)&&parts.length===3)||(Boolean(spec)&&parts.length===2)||(['events','sources','saved'].includes(key)&&parts.length===2);
 const canonical='https://www.specialtycoffeeindia.blog'+(known&&path!=='/'?path+'/':'/');
 let title='Specialty Coffee India — Find your next cup',description="Explore India's coffee by state and district. Find cafés, roasters, coffee farms, beans, equipment, events and communities, with sources behind every listing.";
 if(publishedPage){title=(publishedPage.searchTitle||publishedPage.title)+' · Specialty Coffee India';description=publishedPage.description}
 else if(state&&known){title=`Coffee in ${state.state} · Specialty Coffee India`;description=`Explore cafés, roasters, coffee farms and coffee education in ${state.state}. Source-linked directory with city and district filters.`}
 else if(spec&&known){title=({explore:'Explore cafés, roasters and estates',coffee:'Indian coffee catalogue',equipment:'Coffee brewing equipment',community:'Coffee people and communities',learn:'Coffee education and publications',experiences:'Coffee estate experiences',more:'Subscriptions and more coffee',leads:'Coffee business research leads',arpan:'Arpan’s specialty coffee café list',legacy:'Original website records'}[key]||spec[1])+' · Specialty Coffee India';description=spec[2]}
 else if(key==='events'&&known){title='Coffee events calendar · Specialty Coffee India';description='Find upcoming organiser-supported coffee events, cuppings, workshops and gatherings in India, plus source-linked past archives.'}
 else if(key==='sources'&&known){title='Sources and methodology · Specialty Coffee India';description='Review the coffee directory’s sources, coverage, attribution and research limitations.'}
 else if(key==='saved'&&known){title='Your saved coffee places · Specialty Coffee India';description='Your coffee places, products and events saved privately in this browser.'}
 else if(!known){title='Page not found · Specialty Coffee India';description='Explore India’s coffee directory.'}
 document.title=title;
 const set=(selector,attr,value,tag,attrs)=>{let node=$(selector);if(!node){node=document.createElement(tag);for(const [k,v]of Object.entries(attrs||{}))node.setAttribute(k,v);document.head.appendChild(node)}node.setAttribute(attr,value)};
 set('link[rel="canonical"]','href',canonical,'link',{rel:'canonical'});
 for(const [selector,attrs,value]of [['meta[name="description"]',{name:'description'},description],['meta[property="og:title"]',{property:'og:title'},title],['meta[property="og:description"]',{property:'og:description'},description],['meta[property="og:url"]',{property:'og:url'},canonical]])set(selector,'content',value,'meta',attrs);
 set('meta[property="og:type"]','content',publishedPage?.type==='BlogPosting'?'article':'website','meta',{property:'og:type'});
 set('meta[property="og:image"]','content','https://www.specialtycoffeeindia.blog'+(publishedPage?.image || '/og-image.png'),'meta',{property:'og:image'});
 if (publishedPage?.imageAlt) set('meta[property="og:image:alt"]','content',publishedPage.imageAlt,'meta',{property:'og:image:alt'});
 else $('meta[property="og:image:alt"]')?.remove();
 const emptyState=key==='states'&&parts.length===3&&state?.directory_entries===0;
 const robots=$('meta[name="robots"]');if(emptyState||publishedPage?.noindex||['saved','leads','legacy'].includes(key)||!known)set('meta[name="robots"]','content','noindex,follow','meta',{name:'robots'});else robots?.remove();
 let schema=$('script[type="application/ld+json"]');if(!schema){schema=document.createElement('script');schema.type='application/ld+json';document.head.appendChild(schema)}
 const ld={'@context':'https://schema.org','@type':key==='home'?'WebSite':'CollectionPage',name:title,description,url:canonical,inLanguage:'en-IN'};
 if(key!=='home')ld.isPartOf={'@type':'WebSite',name:'Specialty Coffee India',url:'https://www.specialtycoffeeindia.blog/'};
 schema.textContent=JSON.stringify(publishedPage ? schemaFor(publishedPage) : ld).replace(/</g,'\\u003c');
}
function setNavigation(routeName) {
  document.body.classList.remove('menu-open');
  const toggle = $('#menu-toggle');
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.setAttribute('aria-label', 'Open navigation');
  for (const link of $$('#main-nav a')) {
    const active = link.pathname === '/' ? routeName === 'home' :
      link.pathname.split('/')[1] === routeName || (link.pathname === '/explore/' && ['states','places'].includes(routeName));
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  }
}

async function render(preservePage=false){
  const token = ++viewToken;
  const path = location.pathname.replace(/\/+$/, '') || '/';
  route = path.split('/')[1] || 'home';
  setNavigation(route);
  const main = $('#app');
  main.setAttribute('aria-busy', 'true');
  try {
    await prepareRoute(route);
    if (token !== viewToken) return;
    const published = atlas?.resolve(path);
    if (published) {
      main.innerHTML = published.html();
      for (const control of main.querySelectorAll('[data-save]')) {
        const active = saved.has(control.dataset.save);
        control.setAttribute('aria-pressed', String(active));
        if (active) control.textContent = 'Saved ♥';
      }
    } else if (path === '/') await home();
    else if (route === 'states') {
      const state = coverage.states.find(s => slug(s.state) === path.split('/')[2]);
      if (state && path.split('/').length === 3) await listing('explore',state.state);
      else await notFound();
    } else if (path === '/events') await eventPage();
    else if (path === '/sources') await sourcePage();
    else if (path === '/saved') await savedPage();
    else if (sections[route] && path === '/'+route) await listing(route);
    else await notFound();
    if (token !== viewToken) return;
    main.querySelector('#interactive-retry')?.remove();
    updateRouteMetadata(published);
    updateSavedCount();
  } catch (error) {
    if (token !== viewToken) return;
    console.error(error);
    if (preservePage && main.querySelector('h1')) {
      if (!main.querySelector('#interactive-retry')) {
        main.insertAdjacentHTML('afterbegin','<p class="notice" id="interactive-retry" role="status">The interactive view could not load. <button class="text-button" data-action="retry">Try again</button></p>');
      }
      return;
    }
    main.innerHTML = '<section class="empty-state"><h1>This page could not load.</h1><p>Please check your connection and try again.</p><button class="button" data-action="retry">Try again</button></section>';
  } finally {
    if (token === viewToken) main.removeAttribute('aria-busy');
  }
}
function notFound(){const renderHref=location.href;if(renderHref!==location.href)return;$('#app').innerHTML=`<section class="empty-state"><h1>A little off the coffee trail.</h1><p>This page was not found.</p>${button('Back to India','/')}</section>`}
function go(url) {
  const path = new URL(url, location.href).pathname;
  if (documentRoute(path) || documentRoute(location.pathname) || (path === '/' && !homeJournal)) {
    location.assign(url);
    return;
  }
  history.pushState({}, '', url);
  render().then(() => {
    if (location.pathname + location.search !== url) return;
    $('#app').focus({preventScroll:true});
    window.scrollTo({top:0,behavior:'instant'});
  });
}
document.addEventListener('click',e=>{const target=e.target.closest('button,a');if(!target)return;if(target.matches('a[href]')&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){const u=new URL(target.getAttribute('href'),location.href);if(u.origin===location.origin&&!target.hasAttribute('download')&&!/\.[a-z0-9]+$/i.test(u.pathname)&&target.target!=='_blank'&&!u.hash){e.preventDefault();go(u.pathname+u.search);return}}if(target.dataset.calendarDate){showCalendarDay(target.dataset.calendarDate);return}if(target.dataset.detail){detail(records.get(target.dataset.detail));return}if(target.dataset.save){const id=target.dataset.save;saved.has(id)?saved.delete(id):saved.add(id);storeSaved();$$('[data-save]').filter(b=>b.dataset.save===id).forEach(b=>{b.setAttribute('aria-pressed',saved.has(id));b.classList.toggle('is-saved',saved.has(id));if(b.classList.contains('icon-button'))b.setAttribute('aria-label',(saved.has(id)?'Remove ':'Save ')+(records.get(id)?.name||'listing'));b.textContent=b.classList.contains('icon-button')?(saved.has(id)?'♥':'♡'):(saved.has(id)?'Saved ♥':'Save ♡')});refreshSavedView();return}if(target.dataset.page){page=Number(target.dataset.page);renderResults();$('#result-count').scrollIntoView({block:'start',behavior:'smooth'});return}if(target.dataset.ics){downloadICS(records.get(target.dataset.ics));return}if(target.dataset.correction){const r=records.get(target.dataset.correction);$('#detail-dialog').close();openSuggestion(r);return}if(target.dataset.action==='submit')openSuggestion(undefined, target.dataset);if(target.dataset.action==='retry')render(Boolean(target.closest('#interactive-retry')));});
function openSuggestion(r,place={}){const f=$('#suggest-form');f.reset();if(place.stateName)f.elements.state.value=place.stateName;if(place.districtName)f.elements.city.value=place.districtName;f.elements.type.value=r?'Correction':route==='events'?'Event':'';toggleEventFields();if(r){if(f.elements.name)f.elements.name.value=r.name;if(f.elements.url)f.elements.url.value=r.url||r.sourceUrls?.[0]||'';if(f.elements.state)f.elements.state.value=r.state||'';if(f.elements.city)f.elements.city.value=r.city||r.district||'';if(f.elements.details)f.elements.details.value=`Correction for ${r.name} (${r.id}):\n`;}$('#form-status').textContent='';$('#submit-dialog').showModal()}
function toggleEventFields(){const f=$('#suggest-form'),on=f.elements.type.value==='Event';$('#event-fields').hidden=!on;f.elements.event_date.required=on;}
$('#suggest-form [name=type]').addEventListener('change',toggleEventFields);
$('#newsletter-form').addEventListener('submit',async e=>{e.preventDefault();const f=e.target,btn=$('[type=submit]',f),status=$('#newsletter-status');if(!f.reportValidity())return;btn.disabled=true;status.textContent='Sending…';try{const res=await fetch('https://formspree.io/f/xrpzgeky',{method:'POST',body:new FormData(f),headers:{Accept:'application/json'}});if(!res.ok)throw Error();status.textContent='Your subscription request has been sent.';f.reset()}catch{status.textContent='Could not send. Please try again later.'}finally{btn.disabled=false}});
$('#menu-toggle')?.addEventListener('click',()=>{const open=document.body.classList.toggle('menu-open');$('#menu-toggle').setAttribute('aria-expanded',open);$('#menu-toggle').setAttribute('aria-label',open?'Close navigation':'Open navigation')});
$('#detail-close')?.addEventListener('click',()=>$('#detail-dialog').close());
$$('[data-close-dialog]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && document.body.classList.contains('menu-open')) {
    $('#menu-toggle')?.click();
    $('#menu-toggle')?.focus();
  }
});
window.addEventListener('popstate', () => { if (!documentRoute(location.pathname)) render(); });
window.addEventListener('message',async e=>{const map=$('#india-map');if(e.origin!==location.origin||e.source!==map?.contentWindow||e.data?.type!=='coffee-state-select')return;let stateData=coverage;try{stateData ||= await data('coverage')}catch{return}const state=stateData.states.find(s=>s.state===e.data.state);if(state&&map===$('#india-map'))go(`/states/${slug(state.state)}/`)});
$('#suggest-form')?.addEventListener('submit',async e=>{e.preventDefault();const f=e.target;if(!f.reportValidity())return;const btn=$('[type="submit"]',f),status=$('#form-status');btn.disabled=true;status.textContent='Sending your suggestion…';try{const res=await fetch('https://formspree.io/f/xrpzgeky',{method:'POST',body:new FormData(f),headers:{Accept:'application/json'}});if(!res.ok)throw Error('Request failed');status.textContent='Thank you. Your suggestion has been sent for review.';f.reset()}catch{status.textContent='Your suggestion could not be sent. Please try again later; your details are still here.'}finally{btn.disabled=false}});
async function prepareRoute(key) {
  if (['explore','states','places'].includes(key) || (key === 'saved' && saved.size)) {
    if (!atlasPromise) {
      atlasPromise = Promise.all([data('coverage'), data('directory'), data('kerala-authority'), data('districts')])
        .then(([stateData, places, kerala, districts]) => {
          coverage = stateData;
          directory = places;
          keralaAuthority = kerala;
          atlas = createAtlas(places, districts);
          if (saved.size) migrateSavedIds();
        }).catch(error => { atlasPromise = null; throw error; });
    }
    await atlasPromise;
  } else if (key === 'sources') manifest = await data('manifest');
  else if (key === 'home' || key === 'events' || sections[key]) coverage = await data('coverage');
}

async function boot() {
  if (documentRoute(location.pathname) && $('#app').hasAttribute('data-static-page')) {
    route = location.pathname.split('/')[1];
    setNavigation(route);
    updateSavedCount();
    return;
  }
  await render(true);
}
boot().catch(error => {
  console.error(error);
  const notice = document.createElement('p');
  notice.className = 'notice';
  notice.setAttribute('role','status');
  notice.textContent = 'Interactive features could not load. Reload the page to try again.';
  $('#app').prepend(notice);
});
