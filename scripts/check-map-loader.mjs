import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const source=fs.readFileSync('assets/map/load-terrain.js','utf8');
function run({saveData=false,reduced=false,graphics=true}) {
  let fallbacks=0,requests=[],canvasCount=0;
  const window={CoffeeMap:{fallback(){fallbacks++}},matchMedia(){return {matches:reduced}}};
  const gl={};
  const document={createElement(tag){if(tag==='canvas'){canvasCount++;return {getContext:()=>graphics?gl:null}}return {};},head:{appendChild(script){requests.push(script.src);queueMicrotask(script.onload)}}};
  vm.runInNewContext(source,{window,navigator:{connection:{saveData}},document,Promise});
  return {map:window.CoffeeMap,requests,get canvasCount(){return canvasCount},get fallbacks(){return fallbacks}};
}
for(const mode of [{saveData:true},{reduced:true},{graphics:false}]) {
 const gated=run(mode);assert.equal(gated.fallbacks,1);assert.deepEqual(gated.requests,[]);if(mode.saveData||mode.reduced)assert.equal(gated.canvasCount,0);
}
const full=run({});
assert.deepEqual(full.requests,['/assets/map/three.js','/assets/map/overview-data.js','/assets/map/terrain.js']);
await Promise.all([full.map.loadDetail(),full.map.loadDetail()]);
assert.equal(full.requests.filter(path=>path.endsWith('fine-data.js')).length,1);
assert.ok(full.map.rendererOptions.canvas&&full.map.rendererOptions.context);
console.log('Map keeps the SVG without 3D downloads in all three fallback modes, reuses the working context and requests the fine terrain only once on demand.');
