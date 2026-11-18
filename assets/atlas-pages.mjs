// Shared by the static build and the browser router.
const escapeText = value => String(value ?? '').replace(/[&<>"']/g, char =>
  ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
const slug = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const statePath = state => '/states/' + slug(state) + '/';
export const districtPath = (state, district) => statePath(state) + 'districts/' + slug(district) + '/';
export const placePath = record => '/places/' + (/^IND-/i.test(record.id)
  ? [slug(record.name).slice(0,85).replace(/-$/,''), slug(record.id)].filter(Boolean).join('-')
  : slug(record.id)) + '/';

const categories = {
  cafes:'Cafés', roasters:'Roasters', farms:'Farms & producers', brands:'Coffee brands',
  education:'Coffee education', people:'People', trade:'Trade & organisations',
  'producer-leads':'Estate-linked brands'
};
const trail = links => '<nav class="breadcrumb" aria-label="Breadcrumb">' + links.map(([text,link]) =>
  link ? '<a href="'+escapeText(link)+'">'+escapeText(text)+'</a>' :
    '<span aria-current="page">'+escapeText(text)+'</span>').join(' / ')+'</nav>';
function external(url, label, className='') {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '';
    return '<a href="'+escapeText(parsed.href)+'" class="'+className+'" target="_blank" rel="noopener noreferrer">'+escapeText(label)+' ↗</a>';
  } catch { return ''; }
}
function sourceList(record) {
  return (record.sourceUrls || []).map((url,index) => {
    const link = external(url,record.sourceNames?.[index] || (()=>{try{return new URL(url).hostname}catch{return 'Source'}})());
    return link ? '<li>'+link+'</li>' : '';
  }).join('');
}
const plural = (count, singular) => count+' '+singular+(count===1?'':'s');
const formatDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') ?
  new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T00:00:00Z')) : value;

function renderProfile(record, recordsById, districtExists, options = {}) {
  const {id, name, state, district, city} = record;
  const location = [...new Set([city,district,state].filter(Boolean))].join(', ');
  const category = record.category || categories[record.kind] || 'Directory';
  const links = [['India','/'],['Directory','/explore/']];
  if(state) links.push([state,statePath(state)]);
  if(district && districtExists) links.push([district,districtPath(state,district)]);
  links.push([name]);
  const description = record.description || '';
  const facts = [
    ['Locality',location],['Address',record.address],['Opening hours',record.hours],
    ['Origin region',record.originRegion],['Source last checked',formatDate(record.checkedDate)],
    ['Contact last checked',formatDate(record.contactChecked)]
  ].filter(([,value]) => value);
  const actions = [external(record.url,'Website','button'), external(record.mapUrl,'Open map','button secondary')];
  if(record.shopUrl && record.shopUrl !== record.url) actions.push(external(record.shopUrl,'Shop coffee','button secondary'));
  if(record.instagram && record.instagram !== record.url) actions.push(external(record.instagram,'Instagram','button secondary'));
  if(record.phone && /^\+?[\d ()-]+$/.test(record.phone)) actions.push('<a class="button secondary" href="tel:'+escapeText(record.phone.replace(/[ ()-]/g,''))+'">Call '+escapeText(record.phoneDisplay || record.phone)+'</a>');
  if(record.email && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(record.email)) actions.push('<a class="button secondary" href="mailto:'+escapeText(record.email)+'">Email</a>');
  const isSaved = options?.saved?.has?.(id) || false;
  const connections = (record.relationships || []).map(relation => {
    const forward = relation.from === (record.authorityId || id);
    const target = recordsById.get(forward ? relation.to : relation.from);
    if(!target) return '';
    return '<li>'+escapeText(forward ? relation.label : relation.reverse)+' <a href="'+placePath(target)+'">'+escapeText(target.name)+'</a>'
      +(relation.note ? '<p>'+escapeText(relation.note)+'</p>':'')+'</li>';
  }).join('');
  return '<article class="atlas-place"><section class="page-intro">'+trail(links)
    +'<p class="eyebrow">'+escapeText(category)+'</p><h1>'+escapeText(name)+'</h1>'
    +(record.nameMl ? '<p lang="ml">'+escapeText(record.nameMl)+'</p>':'')
    +(description ? '<p class="lede">'+escapeText(description)+'</p>':'')
    +'</section><div class="atlas-place-body"><section aria-labelledby="place-details"><h2 id="place-details">Listing details</h2>'
    +(record.visitNote ? '<p class="notice">'+escapeText(record.visitNote)+'</p>':'')
    +(facts.length ? '<dl class="fact-grid">'+facts.map(([key,value])=>'<div><dt>'+escapeText(key)+'</dt><dd>'+escapeText(value)+'</dd></div>').join('')+'</dl>':'')
    +'<div class="hero-actions">'+actions.join('')+'<button type="button" class="button secondary save-button" data-save="'+escapeText(id)+'" aria-pressed="'+isSaved+'">'+(isSaved?'Saved ♥':'Save ♡')+'</button></div></section>'
    +(connections ? '<section><h2>Coffee connections</h2><ul>'+connections+'</ul></section>':'')
    +'<section><h2>Sources</h2><p>'+escapeText(record.evidenceLabel || 'Directory listing')+'</p>'
    +(record.editorNote ? '<p>'+escapeText(record.editorNote)+'</p>':'')
    +(record.sourceNote ? '<p>'+escapeText(record.sourceNote)+'</p>':'')
    +(record.districtEvidence ? '<p>'+escapeText(record.districtEvidence.reason)+' '+external(record.districtEvidence.source,'District reference')+'</p>':'')
    +(record.geographyNote && !district ? '<p>'+escapeText(record.geographyNote)+'</p>':'')
    +'<ul class="atlas-source-list">'+sourceList(record)+'</ul><button type="button" class="text-button" data-correction="'+escapeText(id)+'">Suggest a correction ↗</button></section></div></article>';
}

export function createAtlas(directory, districtData) {
  const routes = new Map();
  const recordsById = new Map(directory.map(record => [record.id,record]));
  const states = districtData?.states || {};
  const groups = new Map();
  const names = new Map(Object.entries(states).map(([state,rows]) => [state,new Set(rows.map(row=>row.name))]));
  for (const record of directory) {
    const evidence = districtData?.evidence?.[record.id];
    if (!record.district && evidence && names.get(record.state)?.has(evidence.district)) {
      record.district = evidence.district;
      record.districtEvidence = evidence;
      if(record.reviewNeeded) {
        record.reviewNeeded = record.reviewNeeded.replace(/^District not yet verified(?:;\s*)?/i, '');
      }
    }
    const hasDistrict = names.get(record.state)?.has(record.district) || false;
    if(hasDistrict) {
      const key = districtPath(record.state,record.district);
      if(!groups.has(key)) groups.set(key,[]);
      groups.get(key).push(record);
    }
    const path = placePath(record);
    const location = [...new Set([record.city,record.district,record.state].filter(Boolean))].join(', ');
    routes.set(path, {path, title:record.name, description:record.description ||
      [record.name, record.category, location].filter(Boolean).join(' · ')+'. See the listing and its sources.',
      type:'WebPage',record, noindex:false, html:options=>renderProfile(record,recordsById,hasDistrict,options)});
  }
  function districtNav(state) {
    const districts = states[state] || [];
    if(!districts.length) return '';
    return '<div class="atlas-district-nav"><details><summary>Browse '+escapeText(state)+' by district <span>'+plural(districts.length,'district')+'</span></summary>'
      +'<nav class="atlas-district-grid" aria-label="'+escapeText(state)+' districts">'+districts.map(({name}) => {
        const path = districtPath(state,name), count = groups.get(path)?.length || 0;
        return '<a href="'+path+'">'+escapeText(name)+(count ? '<small>'+plural(count,'listing')+'</small>':'')+'</a>';
      }).join('')+'</nav><p>District names from the '+external(districtData.sourceUrl,'Local Government Directory')+' ('
      +escapeText(formatDate(districtData.asOf))+'). Counts include entries with a recorded district.</p></details></div>';
  }
  for (const [state,districts] of Object.entries(states)) for(const {name} of districts) {
    const path = districtPath(state,name), rows = (groups.get(path)||[]).sort((a,b)=>a.name.localeCompare(b.name));
    const title = 'Coffee in '+name, description = rows.length
      ? 'Find '+plural(rows.length,'coffee listing')+' in '+name+', '+state+', with location details and sources.'
      : 'District guide to '+name+', '+state+'. Explore the state directory and contribute a local coffee place.';
    const byKind = new Map();
    for(const row of rows) {
      if(!byKind.has(row.kind)) byKind.set(row.kind,[]);
      byKind.get(row.kind).push(row);
    }
    const html = () => '<section class="page-intro">'+trail([['India','/'],[state,statePath(state)],[name]])
      +'<p class="eyebrow">'+escapeText(state)+' · District guide</p><h1>'+escapeText(title)+'</h1>'
      +'<p class="lede">'+(rows.length?escapeText(plural(rows.length,'directory listing')):'We’re still collecting coffee places in this district.')+'</p></section>'
      +'<div class="atlas-place-body">'+[...byKind].map(([kind,items]) =>
        '<section><h2>'+escapeText(categories[kind]||kind)+'</h2><ul class="atlas-places-list">'+items.map(r=>'<li><a href="'+placePath(r)+'"><span>'+escapeText(r.name)+'</span><small>'+escapeText(r.city || r.category)+'</small></a></li>').join('')+'</ul></section>').join('')
      +'<section><h2>Explore '+escapeText(state)+'</h2><p>Find more cafés, roasters and producers in the state directory, including places whose district is still being checked.</p><div class="hero-actions"><a class="button secondary" href="'+statePath(state)+'">All '+escapeText(state)+' listings</a><button type="button" class="button secondary" data-action="submit" data-state-name="'+escapeText(state)+'" data-district-name="'+escapeText(name)+'">Suggest a place</button></div></section></div>';
    routes.set(path,{path,title,description,type:'CollectionPage',state,district:name,noindex:!rows.length,html});
  }
  return {
    pages:[...routes.values()], resolve:path => routes.get(path.replace(/\/+$/,'')+'/'),
    profilePath:record => recordsById.has(record.id) ? placePath(record) : '',
    districtNav, districtNames:state=>[...(names.get(state)||[])]
  };
}
