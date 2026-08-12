import * as THREE from './three.module.min.js';

/* ===================== data ===================== */
const roasters=DATA.roasters.slice().sort((a,b)=>a.name.localeCompare(b.name));
const origins =DATA.origins.slice().sort((a,b)=>a.name.localeCompare(b.name));
const cafes   =(DATA.cafes||[]).slice().sort((a,b)=>a.name.localeCompare(b.name));
const edu     =(DATA.edu||[]).slice().sort((a,b)=>a.name.localeCompare(b.name));
const CATS=[
  {k:'c',label:'Specialty cafés',   items:cafes,    sub:d=>d.city+' · '+d.desc},
  {k:'r',label:'Specialty roasters',items:roasters, sub:d=>(d.city||d.state)},
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

/* ===================== palette — Kerala's exact ramps =====================
   Lifted verbatim from the Kerala build rather than reconstructed by eye.
   Both the stop lists and the pow() gammas matter: the gamma is what pushes
   the bulk of the country into green instead of leaving it pale.
   ------------------------------------------------------------------ */
const STOPS=[[0.00,0x7cc98c],[0.13,0x59bb70],[0.30,0xb6c765],[0.48,0xd8a74c],
             [0.66,0xb06a35],[0.83,0x7d472a],[1.00,0xefe4cf]];
const GSTOPS=[[0.00,0xb7e3c4],[0.45,0x8ed4a6],[1.00,0x6ac48a]];
const OVERSTOPS=[[0.00,0xdff2d4],[0.15,0xcfeabf],[0.32,0xb7e0a3],[0.50,0xa0d788],
                 [0.62,0xb9cc7a],[0.80,0xc99a5b],[1.00,0xb06a35]];
const tA=new THREE.Color(), tB=new THREE.Color(), col=new THREE.Color();
function ramp(stops,t,out){
  t=Math.max(0,Math.min(1,t));
  for(let i=1;i<stops.length;i++){
    if(t<=stops[i][0]){
      const a=stops[i-1],b=stops[i],k=(t-a[0])/(b[0]-a[0]);
      tA.setHex(a[1]); tB.setHex(b[1]);
      return out.setRGB(tA.r+(tB.r-tA.r)*k, tA.g+(tB.g-tA.g)*k, tA.b+(tB.b-tA.b)*k);
    }
  }
  return out.setHex(stops[stops.length-1][1]);
}
/* Kerala tops out at 2,695 m and India at 7,793 m. Colour is normalised
   against Kerala's ceiling so the plains read green and the Ghats read
   brown exactly as they do there; depth uses India's own ceiling so the
   Himalaya still stands proud. One ceiling for both would either bleach
   the whole country or flatten the mountains. */
const MAXE_C=2695, MAXE_D=7793;

/* Precomputed ramps. ramp() allocates and does two setHex calls per block;
   at 60k blocks that alone was a visible hitch. Sampling a flat table is a
   couple of array reads. */
const LUT_N=512;
function makeLUT(stops,gamma){
  const a=new Float32Array(LUT_N*3), c=new THREE.Color();
  for(let i=0;i<LUT_N;i++){
    ramp(stops,Math.pow(i/(LUT_N-1),gamma),c);
    a[i*3]=c.r; a[i*3+1]=c.g; a[i*3+2]=c.b;
  }
  return a;
}
let LUT_T=null, LUT_G=null;
function lut(a,t,out){
  const i=Math.max(0,Math.min(LUT_N-1,(t*(LUT_N-1))|0));
  return out.setRGB(a[i*3],a[i*3+1],a[i*3+2]);
}
const depthOf = e => 0.16+0.62*Math.pow(Math.min(1,e/MAXE_D),0.62);

/* ===================== scene =====================
   Kerala is not an oblique landscape. The blocks extrude along +Z toward a
   camera parked on the Z axis, and the whole plate rocks. That face-on
   stance is the single biggest reason the two maps looked unrelated. */
let renderer,scene,camera,mesh,cells=[],instState=null,instT=null,stateRows=null;
const mapGroup=new THREE.Group();
const fineGroup=new THREE.Group();
const dummy=new THREE.Object3D();
let S=1, CELL=1;
let curStride=2;

function buildScene(){
  renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
  renderer.setClearColor(0x000000,0);
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(32,1,0.1,200);
  camera.position.set(0,0,14);

  /* Kerala's light rig is ambient 0.34 + key 0.62 + fill 0.25 (tinted
     0xd8ffe6). Those were tuned on r128 with legacy lighting; this build
     runs r169 where lighting is physically correct, so the same numbers
     render dark. GAIN restores the working exposure while keeping the
     ratio between the three lights exactly as Kerala has it. */
  const GAIN=2.08;
  scene.add(new THREE.AmbientLight(0xffffff,0.34*GAIN));
  const key=new THREE.DirectionalLight(0xffffff,0.62*GAIN);
  key.position.set(-0.4,0.7,1.0).multiplyScalar(50); scene.add(key);
  const fill=new THREE.DirectionalLight(0xd8ffe6,0.25*GAIN);
  fill.position.set(0.6,-0.4,0.8).multiplyScalar(50); scene.add(fill);

  LUT_T=makeLUT(STOPS,0.78); LUT_G=makeLUT(GSTOPS,0.62);
  scene.add(mapGroup);
  mapGroup.add(fineGroup);
  buildTerrain(curStride);
}

function buildTerrain(stride){
  if(mesh){ mapGroup.remove(mesh); mesh.geometry.dispose(); mesh.material.dispose(); }
  S=6.6/GH; CELL=S*stride;
  cells=[];
  for(let r=0;r<GH;r+=stride) for(let c=0;c<GW;c+=stride){
    const i=r*GW+c; if(SIDX[i]) cells.push(i);
  }
  const n=cells.length;
  const geo=new THREE.BoxGeometry(CELL*0.985,CELL*0.985,1);
  const mat=new THREE.MeshLambertMaterial({transparent:true,opacity:1});
  mesh=new THREE.InstancedMesh(geo,mat,n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  instState=new Uint8Array(n); instT=new Float32Array(n);
  for(let j=0;j<n;j++){
    const i=cells[j], c=i%GW, r=(i/GW)|0, e=ELEV[i];
    instState[j]=SIDX[i]; instT[j]=Math.min(1,e/MAXE_C);
    const dep=depthOf(e);
    dummy.position.set((c-GW/2)*S, -(r-GH/2)*S, dep/2);
    dummy.scale.set(1,1,dep); dummy.updateMatrix();
    mesh.setMatrixAt(j,dummy.matrix);
    mesh.setColorAt(j, lut(LUT_T,instT[j],col));
  }
  mesh.instanceMatrix.needsUpdate=true;
  if(mesh.instanceColor) mesh.instanceColor.needsUpdate=true;
  const tally=new Int32Array(256);
  for(let j=0;j<n;j++) tally[instState[j]]++;
  stateRows=new Array(256);
  for(let i=0;i<256;i++) stateRows[i]=new Int32Array(tally[i]);
  const ptr=new Int32Array(256);
  for(let j=0;j<n;j++){ const st=instState[j]; stateRows[st][ptr[st]++]=j; }
  mapGroup.add(mesh);
}

/* hover: Kerala tints the district with GSTOPS at pow(t,0.62). Only the
   state entering or leaving hover is repainted — repainting all 60k blocks
   on every pointer move was most of the hover lag. */
let painted=0;
function tintState(si,green){
  if(!mesh||!stateRows||!si) return;
  const rows=stateRows[si]; if(!rows) return;
  const tbl=green?LUT_G:LUT_T;
  for(let k=0;k<rows.length;k++){
    const j=rows[k];
    mesh.setColorAt(j,lut(tbl,instT[j],col));
  }
  if(mesh.instanceColor) mesh.instanceColor.needsUpdate=true;
}
function recolour(){
  const want=sel?0:hoverState;
  if(want===painted) return;
  if(painted) tintState(painted,false);
  if(want) tintState(want,true);
  painted=want;
}

/* ===================== per-state plate =====================
   Opening a state fades the country out and fades in that state alone at
   full 0.035° resolution, centred and scaled to the viewport — the same
   move Kerala makes when a district is picked. */
/* Upsampling budget. A state plate is bilinear-interpolated up to this many
   blocks; small states get a lot of subdivision, big ones stay coarse.
   No elevation is invented — values between samples are interpolated from
   the samples either side, and the state mask still comes from the source
   grid, so no cell appears where the data says there is none. */
const UP_CAP=90000, UP_MAX=6;
let fineJob=null;
let fineMesh=null, fineName='', fineW=0, fineH=0;
let homeX=0, homeY=0;                 // where this state sits on the India plate

function disposeFine(){
  if(!fineMesh) return;
  fineGroup.remove(fineMesh);
  fineMesh.geometry.dispose(); fineMesh.material.dispose();
  fineMesh=null; fineName=''; fineJob=null;
}

function bilin(a,w,h,fx,fy){
  const x=Math.max(0,Math.min(w-1.001,fx)), y=Math.max(0,Math.min(h-1.001,fy));
  const c0=x|0, r0=y|0, dx=x-c0, dy=y-r0;
  const c1=Math.min(w-1,c0+1), r1=Math.min(h-1,r0+1);
  const v00=a[r0*w+c0], v10=a[r0*w+c1], v01=a[r1*w+c0], v11=a[r1*w+c1];
  return v00+(v10-v00)*dx + (v01-v00)*dy + (v00-v10-v01+v11)*dx*dy;
}

function buildFine(name){
  disposeFine();
  const m=SMETA[name]; if(!m||!ELEV) return;
  const si=m.i, x0=m.x0, y0=m.y0, bw=m.x1-x0+1, bh=m.y1-y0+1;

  const src=new Float32Array(bw*bh), msk=new Uint8Array(bw*bh);
  let owned=0;
  for(let r=0;r<bh;r++) for(let c=0;c<bw;c++){
    const i=(y0+r)*GW+(x0+c), k=r*bw+c;
    src[k]=ELEV[i];
    if(SIDX[i]===si){ msk[k]=1; owned++; }
  }
  if(!owned) return;

  /* light centre-weighted smoothing over in-state neighbours only. ETOPO at
     0.035 deg carries real sampling noise, which is what made the Ghats read
     as spikes; this settles it without flattening the range. */
  const sm=new Float32Array(bw*bh);
  for(let r=0;r<bh;r++) for(let c=0;c<bw;c++){
    let acc=0,wt=0;
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
      const rr=r+dr, cc=c+dc;
      if(rr<0||cc<0||rr>=bh||cc>=bw) continue;
      const k=rr*bw+cc; if(!msk[k]) continue;
      const w=(dr===0&&dc===0)?4:1; acc+=src[k]*w; wt+=w;
    }
    sm[r*bw+c]=wt?acc/wt:src[r*bw+c];
  }

  /* Walk only the cells this state owns and emit F x F subcells inside each.
     Scanning the bounding box instead threw away 71% of the work on a shape
     as narrow as Kerala. Block count is now exactly owned * F^2. */
  const own=new Int32Array(owned);
  let p=0;
  for(let r=0;r<bh;r++) for(let c=0;c<bw;c++) if(msk[r*bw+c]) own[p++]=r*bw+c;

  let F=1; while(F<UP_MAX && owned*(F+1)*(F+1)<=UP_CAP) F++;
  const n=owned*F*F;

  const cxm=(x0+m.x1)/2, cym=(y0+m.y1)/2;
  fineW=bw*S; fineH=bh*S;
  homeX=(cxm-GW/2)*S; homeY=-(cym-GH/2)*S;

  const geo=new THREE.BoxGeometry((S/F)*0.985,(S/F)*0.985,1);
  const mat=new THREE.MeshLambertMaterial({transparent:true,opacity:0});
  fineMesh=new THREE.InstancedMesh(geo,mat,n);
  fineMesh.count=0;                     // only draw what has been filled
  fineName=name;
  fineGroup.add(fineMesh);

  /* Filled in slices from frame(). count rises as blocks land, so nothing
     renders half-initialised, and the plate is fading in over the same
     window anyway — the fill is invisible instead of a freeze. */
  fineJob={ own:own, sm:sm, bw:bw, bh:bh, x0:x0, y0:y0, cxm:cxm, cym:cym,
            F:F, i:0, out:0, emax:Math.max(m.emax,320),
            per:Math.max(1,Math.ceil(9000/(F*F))) };
}

function stepFine(){
  const jb=fineJob; if(!jb||!fineMesh) return;
  const {own,sm,bw,bh,x0,y0,cxm,cym,F,emax}=jb;
  const inv=1/F, end=Math.min(own.length, jb.i+jb.per);
  for(; jb.i<end; jb.i++){
    const k=own[jb.i], lr=(k/bw)|0, lc=k%bw;
    for(let sy=0;sy<F;sy++) for(let sx=0;sx<F;sx++){
      const fx=lc-0.5+(sx+0.5)*inv, fy=lr-0.5+(sy+0.5)*inv;
      const e=bilin(sm,bw,bh,fx,fy), dep=depthOf(e);
      dummy.position.set((x0+fx-cxm)*S, -(y0+fy-cym)*S, dep/2);
      dummy.scale.set(1,1,dep); dummy.updateMatrix();
      fineMesh.setMatrixAt(jb.out,dummy.matrix);
      fineMesh.setColorAt(jb.out,lut(LUT_T,Math.min(1,e/emax),col));
      jb.out++;
    }
  }
  fineMesh.count=jb.out;
  fineMesh.instanceMatrix.needsUpdate=true;
  if(fineMesh.instanceColor) fineMesh.instanceColor.needsUpdate=true;
  if(jb.i>=own.length) fineJob=null;
}

/* ===================== motion ===================== */
let sel=0, hoverState=0;
let dragging=false, dragMoved=0, lastX=0, lastY=0;
let rotX=0, rotY=0, velX=0, velY=0, userX=0, userY=0, spinY=0, idle=0;
let mouseX=0, mouseY=0, selMix=0, clock=0;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

function viewSize(){
  const h=2*Math.tan(camera.fov*Math.PI/360)*camera.position.z;
  return {h:h, w:h*camera.aspect};
}
function mapFit(){
  const W=cv.clientWidth,H=cv.clientHeight;
  return Math.min(1,(W/H)/0.78)*(W<760?0.8:1);
}
function fineFit(){
  if(!fineMesh) return 1;
  const v=viewSize();
  return Math.min(v.h*0.72/Math.max(fineH,0.01), v.w*0.72/Math.max(fineW,0.01))/mapFit();
}

function goIndia(){
  sel=0; hoverName.textContent=''; hoverSub.textContent='';
  emaxLbl.textContent=fmt(INDIA_EMAX)+' m';
  closeStatePanel(); userX=userY=0; spinY=0;
  if(stSel) stSel.value=''; shown=18; renderList();
  recolour();
}
function goState(name){
  const m=SMETA[name]; if(!m) return;
  sel=m.i;
  hoverName.textContent=name.toUpperCase();
  hoverSub.textContent=fmt(m.emin)+'–'+fmt(m.emax)+' m';
  emaxLbl.textContent=fmt(m.emax)+' m';
  openStatePanel(name);
  buildFine(name);
  if(stSel) stSel.value=dataStates.includes(name)?name:''; shown=18; renderList();
  recolour();
}

const ray=new THREE.Raycaster(), ndc=new THREE.Vector2();
function pickAt(px,py){
  if(!mesh||sel) return 0;
  ndc.x=(px/cv.clientWidth)*2-1; ndc.y=-(py/cv.clientHeight)*2+1;
  ray.setFromCamera(ndc,camera);
  const hit=ray.intersectObject(mesh,false);
  if(!hit.length) return 0;
  const id=hit[0].instanceId;
  return (id!=null&&id<instState.length)?instState[id]:0;
}

function frame(){
  requestAnimationFrame(frame);
  const w=cv.clientWidth,h=cv.clientHeight;
  if(cv.width!==Math.round(w*renderer.getPixelRatio())||cv.height!==Math.round(h*renderer.getPixelRatio())){
    renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
  }
  clock+=0.006; idle++;
  if(fineJob) stepFine();
  const open=!!sel;
  selMix+=((open?1:0)-selMix)*0.085;

  /* plate rocking — levelled while a state is open, drifting when it isn't */
  if(open){ rotY+=(0-rotY)*0.07; rotX+=(0-rotX)*0.07; velX=velY=0; }
  else{
    rotY+=velY; rotX+=velX; velY*=0.90; velX*=0.90;
    rotX=Math.max(-0.6,Math.min(0.6,rotX));
    if(!dragging&&idle>90&&!reduce){
      rotY+=(Math.sin(clock)*0.22-rotY)*0.012;
      rotX+=(Math.sin(clock*0.7)*0.08-rotX)*0.012;
    }
  }
  mapGroup.rotation.y=rotY; mapGroup.rotation.x=rotX;
  const par=open?0:1;
  mapGroup.position.x=mouseX*0.3*par;
  mapGroup.position.y=-mouseY*0.22*par;
  mapGroup.scale.setScalar(mapFit());

  if(mesh){ mesh.material.opacity=1-selMix; mesh.material.transparent=selMix>0.01; }
  if(mesh) mesh.visible=selMix<0.98;

  if(fineMesh){
    fineMesh.material.opacity=selMix;
    fineGroup.visible=selMix>0.02;
    const k=fineFit();
    fineGroup.scale.setScalar(1+(k-1)*selMix);
    /* Kerala eases each district from its home square to centre. Without
       this every state grew out of the middle of the country. */
    fineGroup.position.set(homeX*(1-selMix), homeY*(1-selMix), 0);
    spinY+=reduce?0:0.0035;
    fineGroup.rotation.y=(Math.sin(spinY)*0.62+userY)*selMix;
    fineGroup.rotation.x=(0.22+Math.sin(spinY*0.7)*0.06+userX)*selMix;
  }
  userY*=0.985; userX*=0.985;

  const gEl=document.getElementById('grid');
  if(gEl){
    gEl.style.transform='translate('+(-rotY*46).toFixed(1)+'px,'+(rotX*40).toFixed(1)+'px)';
    gEl.style.opacity=(1-0.55*selMix).toFixed(3);
  }
  const halo=document.getElementById('halo');
  if(halo){
    halo.style.setProperty('--hx',(w/2).toFixed(0)+'px');
    halo.style.setProperty('--hy',(h/2).toFixed(0)+'px');
    halo.style.setProperty('--hr',(Math.min(w,h)*0.52).toFixed(0)+'px');
  }
  renderer.render(scene,camera);
}

/* ===================== interaction ===================== */
let pickT=0;
function localXY(e){const r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];}
cv.addEventListener('pointerdown',e=>{
  dragging=true; dragMoved=0; lastX=e.clientX; lastY=e.clientY; idle=0;
  velX=velY=0; cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);
  cv.style.cursor='grabbing';
});
addEventListener('pointerup',e=>{
  if(!dragging) return; dragging=false; cv.style.cursor='grab';
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
  mouseX=((e.clientX-r.left)/r.width-0.5)*2; mouseY=((e.clientY-r.top)/r.height-0.5)*2;
  if(dragging){
    const dx=e.clientX-lastX, dy=e.clientY-lastY;
    lastX=e.clientX; lastY=e.clientY; dragMoved+=Math.abs(dx)+Math.abs(dy); idle=0;
    if(sel){ userY+=dx*0.006; userX+=dy*0.005; }
    else{ velY=dx*0.0022; velX=dy*0.0018; rotY+=dx*0.004; rotX+=dy*0.003; }
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
      }else{hoverName.textContent='';hoverSub.textContent='';}
    }
  }
});
cv.addEventListener('mouseleave',()=>{
  mouseX=mouseY=0;
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
    camera.aspect=cv.clientWidth/cv.clientHeight; camera.updateProjectionMatrix();
    renderer.setSize(cv.clientWidth,cv.clientHeight,false);
    frame();
  }catch(e){ fail('3D init failed: '+(e&&e.message||e)); }
});
