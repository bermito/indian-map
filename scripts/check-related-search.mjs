import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

let panel, pending=[], observed, query='Kuruvinakunnel', state='Kerala';
const input={get value(){return query}};
const stateInput={get value(){return state}};
const form={querySelector:s=>s.includes('"q"')?input:stateInput};
const anchor={insertAdjacentElement(_where,el){panel=el;panel.isConnected=true;}};
const doc={
 querySelector(s){return s==='#app'?{}:s==='#filter-form'?form:s==='#pagination'?anchor:s==='#related-search'?panel||null:null},
 createElement(){return {innerHTML:'',isConnected:false,setAttribute(){},remove(){this.isConnected=false;panel=undefined}}},
 addEventListener(){}
};
class MutationObserver {constructor(fn){observed=fn} observe(){}}
const context=vm.createContext({document:doc,location:{pathname:'/states/kerala/'},window:{addEventListener(){}},MutationObserver,URLSearchParams,Promise,console,
 fetch(){throw new Error('Directory typing must not fetch other catalogues')},
 setTimeout(fn){pending.push(fn);return pending.length},clearTimeout(){pending=[]}
});
vm.runInContext(fs.readFileSync('assets/related-search.js','utf8'),context);
await pending.pop()();
assert.match(panel.innerHTML,/href="\/leads\/\?q=/);
assert.match(panel.innerHTML,/href="\/arpan\/\?q=/);
assert.match(panel.innerHTML,/q=Kuruvinakunnel&amp;state=Kerala/);
assert.match(panel.innerHTML,/awaiting verification/);
query='<img src=x>'; observed(); await pending.pop()();
assert.ok(!panel.innerHTML.includes('<img src=x>'),'Search text must be HTML escaped');
query='ab'; observed(); await pending.pop()(); assert.equal(panel,undefined,'Short queries must remove the section');
console.log('Related search, state, escaping and minimum-length checks passed.');
