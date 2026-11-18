/* Offer separately labelled research and map-list matches alongside directory search. */
(() => {
  const dataCache = new Map();
  let generation = 0, timer;
  const html = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = v => String(v ?? '').toLocaleLowerCase();
  const read = name => {
    if (!dataCache.has(name)) dataCache.set(name, fetch(`/data/${name}.json`).then(r => {
      if (!r.ok) throw new Error('Could not load '+name);
      return r.json();
    }).catch(e => { dataCache.delete(name); throw e; }));
    return dataCache.get(name);
  };
  function matches(r, q, state) {
    if (state && r.state !== state) return false;
    const terms = [r.name,r.brand,r.city,r.district,r.state,r.flavourNotes,r.origin,r.estate,r.description,r.name_ml,r.nameMl,r.description_ml,r.descriptionMl,...(r.stateAliases||[]),...(r.districtAliases||[]),...(r.sourceNames||[])];
    return terms.filter(Boolean).join(' ').toLocaleLowerCase().includes(q);
  }
  function href(section, q, state) {
    const p = new URLSearchParams({q});
    if (state) p.set('state', state);
    return '/'+section+'/?'+p.toString();
  }
  function getContext() {
    if (!/^\/(?:explore\/?|states\/[^/]+\/?)$/.test(location.pathname)) return null;
    const form=document.querySelector('#filter-form');
    const input=form?.querySelector('[name="q"]');
    if (!input) return null;
    return {form, input, q:input.value.trim(), state:form.querySelector('[name="state"]')?.value||''};
  }
  async function update() {
    const seq=++generation, c=getContext();
    let panel=document.querySelector('#related-search');
    if (!c || c.q.length<3) { panel?.remove(); return; }
    const pagination=document.querySelector('#pagination');
    if (!pagination) return;
    if (!panel) { panel=document.createElement('aside'); panel.id='related-search'; panel.className='notice'; panel.setAttribute('aria-live','polite'); pagination.insertAdjacentElement('afterend',panel); }
    panel.innerHTML='<strong>Searching related collections…</strong>';
    const responses=await Promise.allSettled([read('leads'),read('arpan')]);
    const latest=getContext();
    if (seq!==generation || !latest || latest.input!==c.input || latest.q!==c.q || latest.state!==c.state || !panel.isConnected) return;
    const q=text(c.q), links=[];
    if (responses[0].status==='fulfilled') {
      const n=responses[0].value.filter(r=>matches(r,q,c.state)).length;
      links.push(`<li><a href="${html(href('leads',c.q,c.state))}">${n.toLocaleString('en-IN')} related research leads ↗</a> <span>· awaiting verification</span></li>`);
    } else links.push('<li>Research leads could not be loaded. Try again later.</li>');
    if (responses[1].status==='fulfilled') {
      const n=responses[1].value.filter(r=>matches(r,q,c.state)).length;
      links.push(`<li><a href="${html(href('arpan',c.q,c.state))}">${n.toLocaleString('en-IN')} matches in Arpan’s café list ↗</a></li>`);
    } else links.push('<li>Arpan’s list could not be loaded. Try again later.</li>');
    panel.innerHTML=`<strong>Also search these collections</strong><p>These results are separate from the directory and may overlap. Research leads have not been verified. Searches use the name and state; other filters do not carry over.</p><ul>${links.join('')}</ul>`;
  }
  function schedule() { clearTimeout(timer); timer=setTimeout(update,200); }
  document.addEventListener('input', e=>{if(e.target?.matches('#filter-form [name="q"]'))schedule()});
  document.addEventListener('change', e=>{if(e.target?.closest('#filter-form'))schedule()});
  document.addEventListener('click', e=>{if(e.target?.closest('#clear-filters'))schedule()});
  const app=document.querySelector('#app');
  if (app) new MutationObserver(schedule).observe(app,{childList:true});
  window.addEventListener('popstate',schedule);
  schedule();
})();
