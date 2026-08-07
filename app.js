import * as THREE from './three.module.min.js';

/* ===================== data ===================== */
const roasters=DATA.roasters.slice().sort((a,b)=>a.name.localeCompare(b.name));
const origins =DATA.origins.slice().sort((a,b)=>a.name.localeCompare(b.name));
const cafes   =(DATA.cafes||[]).slice().sort((a,b)=>a.name.localeCompare(b.name));
const edu     =(DATA.edu||[]).slice().sort((a,b)=>a.name.localeCompare(b.name));
const CATS=[
  {k:'c',label:'Specialty cafés',   items:cafes,    sub:d=>d.city+' · '+d.desc},
  {k:'r',label:'Specialty roasters',items:roasters, sub:d=>(d.city?d.city+' · ':'')+d.source},
  {k:'o',label:'Specialty farms',   items:origins,  sub:d=>d.landscape+' · '+d.coffee},
  {k:'e',label:'Coffee education',  items:edu,      sub:d=>d.city+' · '+d.cat}
];
const counts={};
function bump(st,k){ (counts[st]=counts[st]||{c:0,r:0,o:0,e:0})[k]++; }
cafes.forEach(x=>bump(x.state,'c')); roasters.forEach(x=>bump(x.state,'r'));
origins.forEach(x=>bump(x.state,'o')); edu.forEach(x=>bump(x.state,'e'));
const dataStates=Object.keys(counts).sort();
const TOTAL=cafes.length+roasters.length+origins.length+edu.length;

const GW=TMETA.w, GH=TMETA.h, EENC=TMETA.emax;
const SNAMES=TMETA.states, SMETA=TMETA.meta;
const INDIA_EMAX=Math.max(...Object.values(SMETA).map(m=>m.emax));
const NOLIST='No verified specialty café currently listed. Recommend a place for review.';

const cv=document.getElementById('gl');
const hoverName=document.getElementById('hoverName');
const hoverSub=document.getElementById('hoverSub');
const emaxLbl=document.getElementById('emaxLbl');
const fmt=v=>Math.round(v).toLocaleString();

let ELEV=null,SIDX=null,failed=false;
function fail(reason){
  if(failed)return; failed=true; console.error('[map] '+reason);
  const el=document.getElementById('nogl');
  el.innerHTML="This browser can't run WebGL, so the 3D map is off.<br><span style='font-size:11px;opacity:.6'>"+reason+'</span>';
  el.style.display='flex'; cv.style.display='none';
}

/* ===================== terrain decode ===================== */
function decodeTerrain(cb){
  const im=new Image();
  im.onload=()=>{
    try{
      const c=document.createElement('canvas'); c.width=GW; c.height=GH;
      const x=c.getContext('2d',{willReadFrequently:true});
      x.drawImage(im,0,0);
      const d=x.getImageData(0,0,GW,GH).data;
      ELEV=new Float32Array(GW*GH); SIDX=new Uint8Array(GW*GH);
      for(let i=0,p=0;i<GW*GH;i++,p+=4){
        ELEV[i]=((d[p]<<8)|d[p+1])/65535*EENC;
        SIDX[i]=d[p+2];
      }
      cb();
    }catch(e){ fail('terrain decode failed: '+(e&&e.message||e)); }
  };
  im.onerror=()=>fail('terrain image failed to load');
  im.src=TERRAIN_PNG;
}

/* ===================== elevation palette (green → gold → brown) ===================== */
const STOPS=[[0.00,0.847,0.933,0.769],[0.12,0.690,0.859,0.573],[0.30,0.804,0.796,0.471],
             [0.52,0.769,0.580,0.337],[0.75,0.588,0.400,0.243],[1.00,0.373,0.243,0.157]];
const _c=new THREE.Color();
function rampColor(t){
  t=Math.max(0,Math.min(1,t));
  for(let i=0;i<STOPS.length-1;i++){
    const a=STOPS[i],b=STOPS[i+1];
    if(t<=b[0]){
      const u=(t-a[0])/Math.max(1e-6,b[0]-a[0]);
      return _c.setRGB(a[1]+(b[1]-a[1])*u, a[2]+(b[2]-a[2])*u, a[3]+(b[3]-a[3])*u);
    }
  }
  const l=STOPS[STOPS.length-1]; return _c.setRGB(l[1],l[2],l[3]);
}

/* ===================== scene ===================== */
let renderer,scene,camera,mesh,gridMesh,cells=[],instState=null,instElev=null;
const PAPER=0xFBFAF6;
const group=new THREE.Group();
const HREL=0.055;                 // gentle relief, like Kerala
let unit=1, hUnit=1;

function buildScene(){
  renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
  renderer.setClearColor(0x000000,0);
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(30,1,1,20000);

  // ---- curved grid backdrop that sits behind the terrain ----
  const gw=GW*2.6, gh=GH*2.6;
  const gg=new THREE.PlaneGeometry(gw,gh,40,40);
  const pos=gg.attributes.position;
  for(let i=0;i<pos.count;i++){            // bend it into a soft curve
    const x=pos.getX(i), y=pos.getY(i);
    pos.setZ(i, -(x*x/(gw*3.1) + y*y/(gh*3.4)));
  }
  gg.computeVertexNormals();
  const gtex=makeGridTexture();
  gridMesh=new THREE.Mesh(gg,new THREE.MeshBasicMaterial({map:gtex,transparent:true,opacity:.5,depthWrite:false}));
  gridMesh.rotation.x=-Math.PI/2;
  gridMesh.position.y=-GH*0.30;
  scene.add(gridMesh);

  // ---- lighting: soft sky/ground fill plus one key light ----
  scene.add(new THREE.HemisphereLight(0xffffff,0xdcd8c8,1.05));
  const key=new THREE.DirectionalLight(0xffffff,1.15);
  key.position.set(-0.55,1.0,0.55).multiplyScalar(1000);
  scene.add(key);
  const rim=new THREE.DirectionalLight(0xffffff,0.32);
  rim.position.set(0.7,0.5,-0.7).multiplyScalar(1000);
  scene.add(rim);

  scene.add(group);
  buildTerrain(2);
}

function makeGridTexture(){
  const S=1024, c=document.createElement('canvas'); c.width=c.height=S;
  const x=c.getContext('2d');
  x.clearRect(0,0,S,S);
  x.strokeStyle='rgba(0,168,63,0.30)'; x.lineWidth=1.4;
  const step=S/26;
  for(let i=0;i<=26;i++){
    x.beginPath(); x.moveTo(i*step,0); x.lineTo(i*step,S); x.stroke();
    x.beginPath(); x.moveTo(0,i*step); x.lineTo(S,i*step); x.stroke();
  }
  const t=new THREE.CanvasTexture(c);
  t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(9,9);
  return t;
}

function buildTerrain(stride){
  if(mesh){ group.remove(mesh); mesh.geometry.dispose(); mesh.material.dispose(); mesh=null; }
  const S=stride;
  cells=[];
  for(let r=0;r<GH;r+=S) for(let c=0;c<GW;c+=S){
    const i=r*GW+c; if(!SIDX[i]) continue;
    cells.push(i);
  }
  const n=cells.length;
  const geo=new THREE.BoxGeometry(1,1,1);
  const mat=new THREE.MeshLambertMaterial({vertexColors:false});
  mesh=new THREE.InstancedMesh(geo,mat,n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  instState=new Uint8Array(n); instElev=new Float32Array(n);
  const m=new THREE.Matrix4();
  hUnit=HREL*Math.max(GW,GH)/Math.max(INDIA_EMAX,1);
  for(let k=0;k<n;k++){
    const i=cells[k], cx=i%GW, cy=(i/GW)|0, e=ELEV[i];
    instState[k]=SIDX[i]; instElev[k]=e;
    const h=Math.max(e*hUnit, S*0.35);
    m.makeScale(S*1.02,h,S*1.02);
    m.setPosition(cx-GW/2, h/2, cy-GH/2);
    mesh.setMatrixAt(k,m);
    mesh.setColorAt(k, rampColor(e/INDIA_EMAX));
  }
  mesh.instanceMatrix.needsUpdate=true;
  if(mesh.instanceColor) mesh.instanceColor.needsUpdate=true;
  group.add(mesh);
}

/* recolour instances: hover tint + selection fade */
const HOVER=new THREE.Color(0x39c06a), FADE=new THREE.Color(0xF2EFE7);
function recolour(){
  if(!mesh) return;
  const n=cells.length;
  for(let k=0;k<n;k++){
    const st=instState[k];
    let col;
    if(sel && st!==sel){ col=FADE; }
    else{
      col=rampColor(instElev[k]/(sel?Math.max(SMETA[SNAMES[sel-1]].emax,320):INDIA_EMAX)).clone();
      if(!sel && hoverState && st===hoverState) col.lerp(HOVER,0.55);
    }
    mesh.setColorAt(k,col);
  }
  if(mesh.instanceColor) mesh.instanceColor.needsUpdate=true;
}
/* push non-selected states back and down; lift the selected one */
function reposition(t){
  if(!mesh) return;
  const S=curStride, m=new THREE.Matrix4();
  const selName=sel?SNAMES[sel-1]:null;
  const sm=selName?SMETA[selName]:null;
  const hu = sel? HREL*Math.max(sm.x1-sm.x0+1,sm.y1-sm.y0+1)/Math.max(sm.emax,1) : hUnit;
  for(let k=0;k<cells.length;k++){
    const i=cells[k], cx=i%GW, cy=(i/GW)|0, e=instElev[k];
    const other = sel && instState[k]!==sel ? t : 0;
    const h=Math.max(e*hu*(1-0.75*other), S*0.35);
    m.makeScale(S*1.02,h,S*1.02);
    m.setPosition(cx-GW/2, h/2 - other*Math.max(GW,GH)*0.10, cy-GH/2);
    mesh.setMatrixAt(k,m);
  }
  mesh.instanceMatrix.needsUpdate=true;
}
let curStride=2;

/* ===================== camera / motion ===================== */
const TILT=0.92;
let sel=0, hoverState=0;
let dragging=false, dragMoved=0, lastX=0, lastY=0;
let yaw=0, pitch=TILT, velYaw=0, velPitch=0, mpx=0, mpy=0, tmpx=0, tmpy=0;
const view={cx:GW/2,cy:GH/2,bx:GW/2,bz:GH/2,ramp:INDIA_EMAX,sel:0};
const target={cx:GW/2,cy:GH/2,bx:GW/2,bz:GH/2,ramp:INDIA_EMAX,sel:0};

function stateTarget(name){
  const m=SMETA[name]; if(!m) return null;
  return {cx:(m.x0+m.x1)/2, cy:(m.y0+m.y1)/2,
          bx:Math.max((m.x1-m.x0+1)/2,10), bz:Math.max((m.y1-m.y0+1)/2,10),
          ramp:Math.max(m.emax,320), sel:1};
}
function goIndia(){
  sel=0; Object.assign(target,{cx:GW/2,cy:GH/2,bx:GW/2,bz:GH/2,ramp:INDIA_EMAX,sel:0});
  hoverName.textContent=''; hoverSub.textContent='';
  emaxLbl.textContent=fmt(INDIA_EMAX)+' m';
  closeStatePanel();
  if(stSel) stSel.value=''; shown=18; renderList();
  recolour();
}
function goState(name){
  const t=stateTarget(name); if(!t) return;
  sel=SMETA[name].i; Object.assign(target,t);
  const m=SMETA[name];
  hoverName.textContent=name.toUpperCase();
  hoverSub.textContent=fmt(m.emin)+'–'+fmt(m.emax)+' m';
  emaxLbl.textContent=fmt(m.emax)+' m';
  openStatePanel(name);
  if(stSel) stSel.value=dataStates.includes(name)?name:''; shown=18; renderList();
  recolour();
}

const ray=new THREE.Raycaster(), ndc=new THREE.Vector2();
function pickAt(px,py){
  if(!mesh) return 0;
  ndc.x=(px/cv.clientWidth)*2-1; ndc.y=-(py/cv.clientHeight)*2+1;
  ray.setFromCamera(ndc,camera);
  const hit=ray.intersectObject(mesh,false);
  if(!hit.length) return 0;
  const id=hit[0].instanceId;
  return (id!=null && id<instState.length)? instState[id] : 0;
}

let selMix=0;
function frame(time){
  const w=cv.clientWidth, h=cv.clientHeight;
  if(cv.width!==Math.round(w*renderer.getPixelRatio())||cv.height!==Math.round(h*renderer.getPixelRatio())){
    renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
  }
  // ease view + selection
  const k=0.075;
  for(const p of ['cx','cy','bx','bz','ramp']) view[p]+=(target[p]-view[p])*k;
  const prevMix=selMix;
  selMix+=((sel?1:0)-selMix)*0.09;
  if(Math.abs(selMix-prevMix)>0.0015) reposition(selMix);

  // idle drift + inertia + parallax
  if(!dragging){
    yaw+=velYaw; pitch+=velPitch;
    velYaw*=0.94; velPitch*=0.94;
    yaw+=0.00022 + (sel?0.00040:0);           // selected state turns a little faster
  }
  pitch=Math.max(-1.42,Math.min(1.42,pitch));
  tmpx+=(mpx-tmpx)*0.045; tmpy+=(mpy-tmpy)*0.045;
  const vYaw=yaw+tmpx*0.16, vPitch=Math.max(-1.42,Math.min(1.42,pitch-tmpy*0.10));

  // exact framing so the map fills the screen without cropping
  const maxSpan=Math.max(view.bx,view.bz)*2;
  const hW=HREL*maxSpan;
  const cyC=hW*0.30;
  const ty=Math.tan(camera.fov*Math.PI/360), tx=ty*(w/h);
  const dir=[Math.sin(vYaw)*Math.cos(vPitch), Math.sin(vPitch), Math.cos(vYaw)*Math.cos(vPitch)];
  const upy=Math.cos(vPitch)>=0?1:-1;
  let ax=[upy*dir[2],0,-upy*dir[0]];
  const al=Math.hypot(ax[0],ax[1],ax[2])||1; ax=[ax[0]/al,ax[1]/al,ax[2]/al];
  const ay=[dir[1]*ax[2]-dir[2]*ax[1], dir[2]*ax[0]-dir[0]*ax[2], dir[0]*ax[1]-dir[1]*ax[0]];
  let need=0;
  for(let i=0;i<8;i++){
    const v=[(i&1?view.bx:-view.bx), ((i&2?hW:0)-cyC), (i&4?view.bz:-view.bz)];
    const cxv=v[0]*ax[0]+v[1]*ax[1]+v[2]*ax[2];
    const cyv=v[0]*ay[0]+v[1]*ay[1]+v[2]*ay[2];
    const czv=v[0]*dir[0]+v[1]*dir[1]+v[2]*dir[2];
    need=Math.max(need, czv+Math.abs(cxv)/tx, czv+Math.abs(cyv)/ty);
  }
  const dist=Math.max(need*1.07,12);
  group.position.set(-(view.cx-GW/2), 0, -(view.cy-GH/2));
  camera.position.set(dir[0]*dist, cyC+dir[1]*dist, dir[2]*dist);
  camera.up.set(0,upy,0);
  camera.lookAt(0,cyC,0);
  camera.near=Math.max(1,dist*0.02); camera.far=dist*6+6000;
  camera.updateProjectionMatrix();

  // grid sits behind and drifts with the map; dims when a state is open
  gridMesh.position.y=-Math.max(view.bx,view.bz)*0.62;
  gridMesh.rotation.z=vYaw*0.35;
  gridMesh.material.opacity=0.5-0.34*selMix;

  renderer.render(scene,camera);
  requestAnimationFrame(frame);
}

/* ===================== interaction ===================== */
let pickT=0;
function localXY(e){const r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];}
cv.addEventListener('pointerdown',e=>{
  dragging=true; dragMoved=0; lastX=e.clientX; lastY=e.clientY;
  velYaw=velPitch=0;
  cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);
  cv.style.cursor='grabbing';
});
addEventListener('pointerup',e=>{
  if(!dragging)return; dragging=false; cv.style.cursor='grab';
  if(dragMoved<5){
    const [x,y]=localXY(e);
    if(x>=0&&y>=0&&x<=cv.clientWidth&&y<=cv.clientHeight){
      const st=pickAt(x,y);
      if(st&&st!==sel) goState(SNAMES[st-1]); else if(sel) goIndia();
    }
  }
});
cv.addEventListener('pointermove',e=>{
  const r=cv.getBoundingClientRect();
  mpx=((e.clientX-r.left)/r.width-0.5)*2; mpy=((e.clientY-r.top)/r.height-0.5)*2;
  if(dragging){
    const dx=e.clientX-lastX, dy=e.clientY-lastY;
    lastX=e.clientX; lastY=e.clientY;
    dragMoved+=Math.abs(dx)+Math.abs(dy);
    yaw-=dx*0.0052; pitch-=dy*0.0042;
    velYaw=-dx*0.0018; velPitch=-dy*0.0014;      // inertia carries on release
    return;
  }
  const now=performance.now(); if(now-pickT<100) return; pickT=now;
  const [x,y]=localXY(e);
  const st=pickAt(x,y);
  if(st!==hoverState){
    hoverState=st; recolour();
    cv.style.cursor=st?'pointer':'grab';
    if(!sel){
      if(st){const n=SNAMES[st-1],m=SMETA[n];
        hoverName.textContent=n.toUpperCase();
        hoverSub.textContent=m?fmt(m.emin)+'–'+fmt(m.emax)+' m':'';
      } else {hoverName.textContent='';hoverSub.textContent='';}
    }
  }
});
cv.addEventListener('mouseleave',()=>{
  mpx=mpy=0;
  if(hoverState){hoverState=0;recolour();}
  if(!sel&&!dragging){hoverName.textContent='';hoverSub.textContent='';}
});
cv.style.cursor='grab';
addEventListener('keydown',e=>{if(e.key==='Escape'){ if(openPanel) closeP(); else if(sel) goIndia(); }});

/* ===================== state panel ===================== */
const sp=document.getElementById('statePanel');
function openStatePanel(name){
  const m=SMETA[name], c=counts[name]||{c:0,r:0,o:0,e:0};
  let h='<button class="pclose" id="spClose">✕</button>';
  h+='<div class="kick">State</div><h2>'+name+'</h2>';
  h+='<div class="psub">Elevation '+fmt(m.emin)+'–'+fmt(m.emax)+' m</div><div class="cats">';
  CATS.forEach(cat=>{
    const items=cat.items.filter(x=>x.state===name);
    h+='<div class="cat" data-k="'+cat.k+'"><button class="catrow"><span>'+cat.label+'</span>'+
       '<span class="cnt">'+String(items.length).padStart(2,'0')+(items.length?' <span class="chev">›</span>':'')+'</span></button>';
    if(items.length){
      h+='<div class="catlist">';
      items.forEach(it=>{
        const url=it.url?' href="'+it.url+'" target="_blank" rel="noopener noreferrer"':'';
        h+='<a class="ent"'+url+'><span class="en">'+it.name+'</span><span class="es">'+cat.sub(it)+'</span></a>';
      });
      h+='</div>';
    } else if(cat.k==='c'){
      h+='<div class="catlist open"><div class="empty2">'+NOLIST+'</div></div>';
    }
    h+='</div>';
  });
  h+='</div>';
  sp.innerHTML=h; sp.classList.add('on');
  sp.querySelector('#spClose').addEventListener('click',goIndia);
  sp.querySelectorAll('.catrow').forEach(b=>b.addEventListener('click',()=>{
    const l=b.parentElement.querySelector('.catlist'); if(l) l.classList.toggle('open');
  }));
  const first=sp.querySelector('.cat[data-k="c"] .catlist'); if(first) first.classList.add('open');
}
function closeStatePanel(){ sp.classList.remove('on'); sp.innerHTML=''; }

/* ===================== side panels ===================== */
const ov=document.getElementById('ov'); let openPanel=null;
function openP(n){
  if(openPanel)document.getElementById('p-'+openPanel).classList.remove('on');
  const el=document.getElementById('p-'+n); if(!el)return;
  el.classList.add('on'); el.setAttribute('aria-hidden','false'); ov.classList.add('on'); openPanel=n;
  document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.p===n));
  if(n==='directory'){ renderList(); setTimeout(()=>document.getElementById('q').focus(),340); }
}
function closeP(){
  if(openPanel){const el=document.getElementById('p-'+openPanel);el.classList.remove('on');el.setAttribute('aria-hidden','true');}
  ov.classList.remove('on'); openPanel=null;
  document.querySelectorAll('nav button').forEach(b=>b.classList.remove('on'));
}
document.querySelectorAll('[data-p]').forEach(b=>b.addEventListener('click',()=>openP(b.dataset.p)));
document.querySelectorAll('.pclose2').forEach(b=>b.addEventListener('click',closeP));
ov.addEventListener('click',closeP);
const burger=document.getElementById('burger'), nav=document.getElementById('nav');
burger.addEventListener('click',()=>{const o=nav.classList.toggle('on');burger.setAttribute('aria-expanded',o);});
nav.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{nav.classList.remove('on');burger.setAttribute('aria-expanded',false);}));
document.getElementById('emgo').addEventListener('click',()=>{
  const v=document.getElementById('em').value.trim();
  if(/.+@.+\..+/.test(v)){document.querySelector('.corner p').innerHTML='Thanks — you\u2019re on the list <b>✓</b>';document.getElementById('em').value='';}
  else document.getElementById('em').focus();
});

/* ===================== directory ===================== */
let mode='c', shown=18;
const q=document.getElementById('q'), dlist=document.getElementById('dlist'),
      more=document.getElementById('more'), cnt=document.getElementById('cnt'), stSel=document.getElementById('stSel');
dataStates.forEach(s=>{const o=document.createElement('option');o.value=s;
  const v=counts[s]; o.textContent=s+' ('+(v.c+v.r+v.o+v.e)+')'; stSel.appendChild(o);});
stSel.addEventListener('change',()=>{stSel.value?goState(stSel.value):goIndia();});
document.querySelectorAll('.tabs button').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('on'));
  b.classList.add('on'); mode=b.dataset.m; shown=18; renderList();
}));
q.addEventListener('input',()=>{shown=18;renderList();});
more.addEventListener('click',()=>{shown+=18;renderList();});
document.getElementById('rst').addEventListener('click',()=>{
  q.value=''; mode='c'; shown=18;
  document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('on',x.dataset.m==='c'));
  sel?goIndia():renderList();
});
function renderList(){
  const t=(q.value||'').trim().toLowerCase();
  const s=sel?SNAMES[sel-1]:null;
  const cat=CATS.find(c=>c.k===mode);
  const items=cat.items.filter(x=>(!s||x.state===s)&&
    (!t||(x.name+' '+(x.city||'')+' '+x.state+' '+(x.desc||x.cat||x.landscape||'')).toLowerCase().includes(t)));
  cnt.textContent=items.length+' '+cat.label.toLowerCase()+(s?' · '+s:'');
  const sl=items.slice(0,shown);
  dlist.innerHTML=sl.length?sl.map(x=>{
    const url=x.url?' href="'+x.url+'" target="_blank" rel="noopener noreferrer"':'';
    return '<li><a class="row"'+url+'><span class="b"><span class="nm">'+x.name+'</span>'+
      '<span class="lc">'+cat.sub(x)+' · '+x.state+'</span></span>'+(x.url?'<span class="ar">↗</span>':'')+'</a></li>';
  }).join(''):'<div class="none">No matches. Try another state or term.</div>';
  more.style.display=items.length>shown?'block':'none';
}
document.getElementById('ebody').innerHTML=
  '<div class="evt"><div class="d">Add your event</div><h3>Cuppings &amp; producer days</h3>'+
  '<div class="v">Across India</div><p>Placeholder. Community cuppings, producer days, roaster meetups and training will be listed here.</p></div>';
document.getElementById('ld').textContent=JSON.stringify([
 {"@context":"https://schema.org","@type":"Organization","name":"Specialty Coffee India","url":"https://specialtycoffeeindia.blog/"},
 {"@context":"https://schema.org","@type":"WebSite","name":"Specialty Coffee India","url":"https://specialtycoffeeindia.blog/"},
 {"@context":"https://schema.org","@type":"ItemList","name":"India specialty coffee directory","numberOfItems":TOTAL}
]);

/* ===================== boot ===================== */
emaxLbl.textContent=fmt(INDIA_EMAX)+' m';
renderList();
decodeTerrain(()=>{
  try{
    buildScene();
    curStride=2;
    renderer.setSize(cv.clientWidth,cv.clientHeight,false);
    requestAnimationFrame(frame);
  }catch(e){ fail('3D init failed: '+(e&&e.message||e)); }
});
