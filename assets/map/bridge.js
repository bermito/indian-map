(function(){
'use strict';
const select=document.getElementById('stateSelect'),status=document.getElementById('mapStatus');
const canonical=name=>({'Daman & Diu':'Dadra and Nagar Haveli and Daman and Diu','Dadra & Nagar Haveli':'Dadra and Nagar Haveli and Daman and Diu','Jammu & Kashmir':'Jammu and Kashmir','Orissa':'Odisha','Pondicherry':'Puducherry','NCT of Delhi':'Delhi'}[name]||name||'');
window.CoffeeMap={canonical,focus:null,active:'',fallback:function(){document.getElementById('fallback').hidden=false;document.getElementById('fallback').style.display='grid';document.getElementById('fallbackNote').textContent='Interactive state view';document.getElementById('mapHint').innerHTML='Select a state to explore coffee<br>All 36 states & territories in the selector';},select:function(state,notify=true){
 const name=canonical(state);this.active=name;select.value=name;status.textContent=name?'Selected '+name:'All India';
 document.querySelectorAll('[data-state]').forEach(p=>p.classList.toggle('active',p.dataset.state===name));
 if(notify&&window.parent!==window)window.parent.postMessage({type:'coffee-state-select',state:name},location.origin);
},choose:function(state,notify=true){this.select(state,notify);if(this.focus)this.focus(canonical(state));}};
select.addEventListener('change',()=>window.CoffeeMap.choose(select.value));
document.getElementById('reset').addEventListener('click',()=>window.CoffeeMap.choose(''));
document.querySelectorAll('[data-state]').forEach(p=>p.addEventListener('click',()=>window.CoffeeMap.choose(p.dataset.state)));
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==window.parent||!event.data||event.data.type!=='coffee-map-focus')return;const state=canonical(event.data.state);if(state&&!Array.from(select.options).some(o=>o.value===state))return;window.CoffeeMap.choose(state,false);});
window.addEventListener('error',()=>{if(!window.CoffeeMap.ready)window.CoffeeMap.fallback();});
if(window.parent!==window)window.parent.postMessage({type:'coffee-map-ready'},location.origin);
})();