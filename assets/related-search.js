/* Carry a directory search into the original map list and unverified leads. */
(() => {
  let timer;
  function showLinks() {
    const form = document.querySelector('#filter-form');
    const query = form?.querySelector('[name="q"]')?.value.trim() || '';
    let panel = document.querySelector('#related-search');
    if (query.length < 3 || !/^\/(?:explore\/?|states\/[^/]+\/?)$/.test(location.pathname)) {
      panel?.remove();
      return;
    }
    const pagination = document.querySelector('#pagination');
    if (!pagination) return;
    if (!panel) {
      panel = document.createElement('aside');
      panel.id = 'related-search';
      panel.className = 'notice';
      pagination.insertAdjacentElement('afterend', panel);
    }
    const params = new URLSearchParams({q:query});
    const state = form.querySelector('[name="state"]')?.value;
    if (state) params.set('state', state);
    const search = params.toString().replaceAll('&','&amp;');
    panel.innerHTML = `<strong>Search other collections</strong><ul>
      <li><a href="/arpan/?${search}">Search Arpan’s specialty café list →</a></li>
      <li><a href="/leads/?${search}">Search business leads awaiting verification →</a></li>
    </ul>`;
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(showLinks, 150); }
  document.addEventListener('input', e => { if (e.target?.matches('#filter-form [name="q"]')) schedule(); });
  document.addEventListener('change', e => { if (e.target?.closest('#filter-form')) schedule(); });
  const app = document.querySelector('#app');
  if (app) new MutationObserver(schedule).observe(app, {childList:true});
  window.addEventListener('popstate',schedule);
  schedule();
})();
