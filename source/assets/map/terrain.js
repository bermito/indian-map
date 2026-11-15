(function(){
"use strict";
const NAMES = ["Arunachal Pradesh", "Assam", "Chandigarh", "Chhattisgarh", "Delhi", "Goa", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Punjab", "Rajasthan", "Sikkim", "Tripura", "Uttarakhand", "Telangana", "Bihar", "Gujarat", "Kerala", "Madhya Pradesh", "Odisha", "Tamil Nadu", "Uttar Pradesh", "West Bengal", "Andhra Pradesh", "Puducherry", "Maharashtra", "Daman & Diu", "Dadra & Nagar Haveli", "Ladakh", "Jammu & Kashmir"];
const nf=n=>n.toLocaleString("en-IN");
  /* ==========================================================================
     3D map — one object per state
     ========================================================================== */
  if(typeof THREE==='undefined'||typeof IDX==='undefined'){ window.CoffeeMap.fallback(); return; }
  let renderer;
  try{ renderer=new THREE.WebGLRenderer({antialias:true,alpha:false}); }
  catch(err){ window.CoffeeMap.fallback(); return; }

  const PAPER=0xffffff;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setClearColor(PAPER,1);
  if(THREE.sRGBEncoding) renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.toneMapping=THREE.NoToneMapping;
  document.body.appendChild(renderer.domElement);

  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(32,window.innerWidth/window.innerHeight,0.1,200);
  camera.position.set(0,0,14);

  function envTexture(){
    const c=document.createElement('canvas'); c.width=256; c.height=128;
    const g=c.getContext('2d');
    const grad=g.createLinearGradient(0,0,0,128);
    grad.addColorStop(0.00,'#ffffff'); grad.addColorStop(0.45,'#e9f2e8');
    grad.addColorStop(0.55,'#c8dcc9'); grad.addColorStop(0.80,'#5c7a60');
    grad.addColorStop(1.00,'#243a28');
    g.fillStyle=grad; g.fillRect(0,0,256,128);
    const t=new THREE.CanvasTexture(c); t.mapping=THREE.EquirectangularReflectionMapping; return t;
  }
  const pmrem=new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  scene.environment=pmrem.fromEquirectangular(envTexture()).texture;

  /* Lighting sums to about 1.0 on an upward-facing top face. Above that the pale
     overview palette clips to white and the whole state renders as blank paper. */
  scene.add(new THREE.AmbientLight(0xffffff,0.34));
  const key=new THREE.DirectionalLight(0xffffff,0.62); key.position.set(-5,7,9); scene.add(key);
  const fill=new THREE.DirectionalLight(0xd8ffe6,0.25); fill.position.set(7,-5,4); scene.add(fill);

  /* grid backdrop */
  const gridGeo=new THREE.PlaneGeometry(60,40,90,60);
  (function(){const p=gridGeo.attributes.position;
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i); p.setZ(i,0.012*(x*x+y*y));}
    p.needsUpdate=true;})();
  const gridMat=new THREE.ShaderMaterial({
    uniforms:{uScale:{value:new THREE.Vector2(92,62)},uLineA:{value:new THREE.Color(0xFF9933)},uLineB:{value:new THREE.Color(0x138808)},
              uBg:{value:new THREE.Color(PAPER)},uDim:{value:1.0}},
    extensions:{derivatives:true},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:['varying vec2 vUv;uniform vec2 uScale;uniform vec3 uLineA;uniform vec3 uLineB;uniform vec3 uBg;uniform float uDim;',
      'void main(){vec2 g=vUv*uScale;vec2 d=abs(fract(g-0.5)-0.5)/fwidth(g);',
      'float l=1.0-min(min(d.x,d.y),1.0);float r=length((vUv-0.5)*vec2(1.6,1.0));',
      'float fade=smoothstep(0.06,0.30,r)*(1.0-smoothstep(0.60,0.92,r)*0.55);',
      'gl_FragColor=vec4(mix(uBg,mix(uLineB,uLineA,vUv.y),l*0.55*fade*uDim),1.0);}'].join('\n')
  });
  const grid=new THREE.Mesh(gridGeo,gridMat); grid.position.z=-9; scene.add(grid);

  /* ---------- build the state objects ---------- */
  const N=IDX.length;
  const latSpan=G.rows*G.cell, S=6.6/latSpan;
  const cx=G.minLng+G.cols*G.cell/2, cy=G.minLat+latSpan/2;
  const size=G.cell*S, MAXE=7793, CMAX=2695; /* depth vs colour ceilings: full range for relief, Kerala-band for greens */

  // terrain ramp: coastal green -> gold -> brown -> pale summit
  const STOPS=[[0.00,0x7cc98c],[0.13,0x59bb70],[0.30,0xb6c765],[0.48,0xd8a74c],
               [0.66,0xb06a35],[0.83,0x7d472a],[1.00,0xefe4cf]];
  // hover ramp: a light tint of the brand green, elevation as lightness
  const GSTOPS=[[0.00,0xb7e3c4],[0.45,0x8ed4a6],[1.00,0x6ac48a]];
  // zoomed-out tone: light white coast -> light green midland -> brown Ghats
  const OVERSTOPS=[[0.00,0xdff2d4],[0.15,0xcfeabf],[0.32,0xb7e0a3],[0.50,0xa0d788],
                   [0.62,0xb9cc7a],[0.80,0xc99a5b],[1.00,0xb06a35]];
  const tA=new THREE.Color(), tB=new THREE.Color(), col=new THREE.Color();
  function ramp(stops,t,out){
    t=Math.max(0,Math.min(1,t));
    for(let i=1;i<stops.length;i++){
      if(t<=stops[i][0]){
        const a=stops[i-1],b=stops[i],k=(t-a[0])/(b[0]-a[0]);
        tA.setHex(a[1]).convertSRGBToLinear(); tB.setHex(b[1]).convertSRGBToLinear();
        return out.copy(tA).lerp(tB,k);
      }
    }
    return out.setHex(stops[stops.length-1][1]).convertSRGBToLinear();
  }

  const geo=new THREE.BoxGeometry(size*0.985,size*0.985,1);
  const baseMat=new THREE.MeshStandardMaterial({metalness:0.22,roughness:0.52,color:0xffffff,
                                                envMapIntensity:0.42,transparent:true,opacity:1});
  const dummy=new THREE.Object3D();

  const perD=[]; for(let d=0;d<NAMES.length;d++) perD.push([]);
  for(let i=0;i<N;i++) perD[DST[i]].push(i);

  const mapGroup=new THREE.Group(); scene.add(mapGroup);
  const D=[];              // per-district record
  const meshes=[];

  for(let d=0;d<NAMES.length;d++){
    const ids=perD[d], n=ids.length;
    let sx=0,sy=0,minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9,maxDepth=0;
    const px=new Float32Array(n),py=new Float32Array(n),dep=new Float32Array(n),tt=new Float32Array(n);
    for(let j=0;j<n;j++){
      const i=ids[j], id=IDX[i], c=id%G.cols, r=(id-c)/G.cols;
      const lng=G.minLng+(c+0.5)*G.cell, lat=G.minLat+(r+0.5)*G.cell;
      const t=Math.min(1,ELV[i]/CMAX), tD=ELV[i]/MAXE;
      px[j]=(lng-cx)*S; py[j]=(lat-cy)*S; tt[j]=t;
      dep[j]=0.16+0.62*Math.pow(tD,0.62);
      if(dep[j]>maxDepth) maxDepth=dep[j];
      sx+=px[j]; sy+=py[j];
      if(px[j]<minx)minx=px[j]; if(px[j]>maxx)maxx=px[j];
      if(py[j]<miny)miny=py[j]; if(py[j]>maxy)maxy=py[j];
    }
    const cX=sx/n, cY=sy/n;
    const mesh=new THREE.InstancedMesh(geo,baseMat.clone(),n);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const base=new Float32Array(n*3);
    for(let j=0;j<n;j++){
      dummy.position.set(px[j]-cX,py[j]-cY,dep[j]/2);
      dummy.scale.set(1,1,dep[j]); dummy.updateMatrix();
      mesh.setMatrixAt(j,dummy.matrix);
      ramp(OVERSTOPS,Math.pow(tt[j],0.78),col);
      base[j*3]=col.r; base[j*3+1]=col.g; base[j*3+2]=col.b;
      mesh.setColorAt(j,col);
    }
    mesh.instanceColor.needsUpdate=true;
    mesh.userData.d=d;
    const g=new THREE.Group();
    g.position.set(cX,cY,0); g.add(mesh); mapGroup.add(g);
    meshes.push(mesh);
    D.push({g:g,mesh:mesh,base:base,t:tt,home:new THREE.Vector3(cX,cY,0),
            w:(maxx-minx)+size,h:(maxy-miny)+size,
            pos:new THREE.Vector3(cX,cY,0),scale:1,op:1,sat:0,satT:0,
            tPos:new THREE.Vector3(cX,cY,0),tScale:1,tOp:1});
  }

  /* ---------- fine detail: 1.1 km cells, built the first time a district opens ---------- */
  function buildFine(d){
    const rec=D[d];
    if(rec.fine!==undefined) return rec.fine;
    if(typeof FINE==='undefined'||!FINE[NAMES[d]]){ rec.fine=null; return null; }
    const F=FINE[NAMES[d]], bin=atob(F.d), len=bin.length;
    let cnt=0;
    for(let i=0;i<len;i++) if(bin.charCodeAt(i)) cnt++;
    const fcl=F.cl||FINE_CELL;
    const fs=fcl*S;
    const fgeo=new THREE.BoxGeometry(fs*0.985,fs*0.985,1);
    const m=new THREE.InstancedMesh(fgeo,baseMat.clone(),cnt);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const full=new Float32Array(cnt*3), pale=new Float32Array(cnt*3);
    let j=0;
    for(let r=0;r<F.h;r++){
      for(let c=0;c<F.w;c++){
        const v=bin.charCodeAt(r*F.w+c);
        if(!v) continue;
        const e=(v-1)*ESTEP;
        const t=Math.min(1,e/CMAX), tD=e/MAXE;
        const lng=F.x0+(c+0.5)*fcl, lat=F.y0+(r+0.5)*fcl;
        const dep=0.16+0.62*Math.pow(tD,0.62);
        dummy.position.set((lng-cx)*S-rec.home.x,(lat-cy)*S-rec.home.y,dep/2);
        dummy.scale.set(1,1,dep); dummy.updateMatrix();
        m.setMatrixAt(j,dummy.matrix);
        ramp(STOPS,Math.pow(t,0.78),col);
        full[j*3]=col.r; full[j*3+1]=col.g; full[j*3+2]=col.b;
        ramp(OVERSTOPS,Math.pow(t,0.78),col);
        pale[j*3]=col.r; pale[j*3+1]=col.g; pale[j*3+2]=col.b;
        m.setColorAt(j,col);
        j++;
      }
    }
    m.instanceColor.needsUpdate=true;
    m.userData.d=d; m.visible=false;
    m.userData.full=full; m.userData.pale=pale; m.userData.n=cnt;
    rec.g.add(m); rec.fine=m;
    return m;
  }
  function setDetail(d,on){
    const rec=D[d];
    if(on){
      const f=buildFine(d);
      if(f){ f.visible=true; rec.mesh.visible=false; rec.act=f; return; }
    }
    if(rec.fine) rec.fine.visible=false;
    rec.mesh.visible=true; rec.act=rec.mesh;
  }

  /* ---------- colour states ---------- */
  function paint(d,mode){
    const rec=D[d], m=rec.mesh, n=rec.t.length;
    for(let j=0;j<n;j++){
      if(mode==='green') ramp(GSTOPS,Math.pow(rec.t[j],0.62),col);
      else col.setRGB(rec.base[j*3],rec.base[j*3+1],rec.base[j*3+2]);
      m.setColorAt(j,col);
    }
    m.instanceColor.needsUpdate=true;
  }

  /* ---------- selection & hover ---------- */
  let selected=-1, hovered=-1, spinY=0, userY=0, userX=0;
  const hoverEl=document.getElementById('hoverName');

  function setHover(d){
    if(d===hovered) return;
    if(hovered>=0 && hovered!==selected) paint(hovered,'base');
    hovered=d;
    if(d>=0 && selected<0){
      paint(d,'green');
      const er=(typeof ERANGE!=='undefined'&&ERANGE[NAMES[d]])?ERANGE[NAMES[d]]:null;
      hoverEl.innerHTML=NAMES[d]+(er?'<small>'+nf(er[0])+'-'+nf(er[1])+' m</small>':'');
      hoverEl.classList.add('on');
    }else hoverEl.classList.remove('on');
  }

  function fitScaleFor(d){
    const vs=viewSize(), rec=D[d];
    const availH=vs.h*0.72, availW=vs.w*0.78;
    const k=Math.min(availH/rec.h, availW/rec.w)*0.92;
    return k/mapFit();                       // mapGroup already carries mapFit()
  }

  function selectDistrict(i,silent){
    if(i===selected&&!silent) return;
    if(selected>=0) paint(selected,'base');
    selected=i;
    userY=0; userX=0; spinY=0;
    for(let d=0;d<NAMES.length;d++) if(d!==i){ setDetail(d,false); D[d].satT=0; }
    if(i>=0){
      hoverEl.classList.remove('on');
      if(hovered>=0) paint(hovered,'base');
      hovered=-1;
      paint(i,'base');
      setDetail(i,true);
      D[i].sat=0; D[i].satT=1;
      window.CoffeeMap.select(NAMES[i],!silent);
    }
    updateTargets();
  }

  function updateTargets(){
    const vs=viewSize();
    for(let d=0;d<NAMES.length;d++){
      const rec=D[d];
      if(selected<0){
        rec.tPos.copy(rec.home); rec.tScale=1; rec.tOp=1;
      }else if(d===selected){
        const k=fitScaleFor(d), f=mapFit();
        const wx=0, wy=0, wz=1.4;
        rec.tPos.set(wx/f,wy/f,wz/f); rec.tScale=k; rec.tOp=1;
      }else{
        rec.tPos.set(rec.home.x*1.15,rec.home.y*1.15,-4.5);
        rec.tScale=1; rec.tOp=0;
      }
    }
  }

  /* ---------- pointer ---------- */
  const ray=new THREE.Raycaster(), ptr=new THREE.Vector2(), mouse={x:0,y:0};
  function hitDistrict(x,y){
    ptr.x=(x/window.innerWidth)*2-1; ptr.y=-(y/window.innerHeight)*2+1;
    ray.setFromCamera(ptr,camera);
    const list=selected>=0?[D[selected].act||D[selected].mesh]:meshes;
    const h=ray.intersectObjects(list,false)[0];
    return (h&&h.object)?h.object.userData.d:-1;
  }
  let dragging=false,moved=0,px0=0,py0=0,velX=0,velY=0,rotX=0,rotY=0,idle=0;
  const el=renderer.domElement;
  el.addEventListener('pointerdown',function(e){ dragging=true;moved=0;px0=e.clientX;py0=e.clientY;idle=0;
    el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointermove',function(e){
    if(dragging){
      const dx=e.clientX-px0,dy=e.clientY-py0;
      moved+=Math.abs(dx)+Math.abs(dy);
      if(selected>=0){ userY+=dx*0.005; userX+=dy*0.004; }
      else { velY+=dx*0.0026; velX+=dy*0.0022; }
      px0=e.clientX; py0=e.clientY; idle=0;
    }else if(e.pointerType==='mouse'&&selected<0){ setHover(hitDistrict(e.clientX,e.clientY)); }
    mouse.x=(e.clientX/window.innerWidth-0.5); mouse.y=(e.clientY/window.innerHeight-0.5);
  });
  el.addEventListener('pointerup',function(e){
    if(dragging&&moved<7){
      const d=hitDistrict(e.clientX,e.clientY);
      if(d>=0&&selected<0) selectDistrict(d);
      else if(selected>=0){ selectDistrict(-1,true); window.CoffeeMap.select(''); }
    }
    dragging=false;
    if(e.pointerId!=null&&el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  });
  el.addEventListener('pointercancel',function(){ dragging=false; });
  el.addEventListener('pointerleave',function(){ if(selected<0) setHover(-1); });

  /* ---------- resize / loop ---------- */
  let W=0,H=0,isNarrow=false;
  function resize(){
    W=window.innerWidth;H=window.innerHeight;isNarrow=W<860;
    camera.aspect=W/H; camera.updateProjectionMatrix(); renderer.setSize(W,H);
    updateTargets();
  }
  function viewSize(){ const h=2*Math.tan(camera.fov*Math.PI/360)*camera.position.z; return {h:h,w:h*camera.aspect}; }
  function mapFit(){ return Math.min(1,(W/H)/0.78)*(isNarrow?0.8:1); }
  window.addEventListener('resize',resize); resize();

  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t=0;
  function frame(){
    requestAnimationFrame(frame);
    if(document.hidden)return;
    t+=0.006; idle+=1;
    const open=selected>=0;

    /* whole-map rotation: idle drift when nothing is picked, levelled when one is */
    if(open){ rotY+=(0-rotY)*0.07; rotX+=(0-rotX)*0.07; velX=velY=0; }
    else{
      rotY+=velY; rotX+=velX; velY*=0.90; velX*=0.90;
      rotX=Math.max(-0.6,Math.min(0.6,rotX));
      if(!dragging&&idle>90&&!reduce){
        rotY+=(Math.sin(t)*0.22-rotY)*0.012;
        rotX+=(Math.sin(t*0.7)*0.08-rotX)*0.012;
      }
    }
    mapGroup.rotation.y=rotY; mapGroup.rotation.x=rotX;
    const par=open?0:1;
    mapGroup.position.x=mouse.x*0.3*par;
    mapGroup.position.y=-mouse.y*0.22*par;
    mapGroup.scale.setScalar(mapFit());
    grid.position.x=-mouse.x*0.9*par; grid.position.y=mouse.y*0.6*par;
    gridMat.uniforms.uDim.value+=((open?0.45:1.0)-gridMat.uniforms.uDim.value)*0.06;

    /* per-district transitions */
    for(let d=0;d<NAMES.length;d++){
      const rec=D[d];
      rec.pos.lerp(rec.tPos,0.085);
      rec.scale+=(rec.tScale-rec.scale)*0.085;
      rec.op+=(rec.tOp-rec.op)*0.11;
      rec.g.position.copy(rec.pos);
      rec.g.scale.setScalar(rec.scale);
      rec.mesh.material.opacity=rec.op;
      rec.mesh.material.depthWrite=rec.op>0.9;
      if(rec.fine){
        rec.fine.material.opacity=rec.op; rec.fine.material.depthWrite=rec.op>0.9;
        if(Math.abs(rec.satT-rec.sat)>0.004){
          rec.sat+=(rec.satT-rec.sat)*0.09;
          const f=rec.fine.userData.full,p=rec.fine.userData.pale,n=rec.fine.userData.n,k=rec.sat;
          for(let j=0;j<n;j++){
            col.setRGB(p[j*3]+(f[j*3]-p[j*3])*k,
                       p[j*3+1]+(f[j*3+1]-p[j*3+1])*k,
                       p[j*3+2]+(f[j*3+2]-p[j*3+2])*k);
            rec.fine.setColorAt(j,col);
          }
          rec.fine.instanceColor.needsUpdate=true;
        }
      }
      rec.g.visible=rec.op>0.02;
      if(d===selected){
        spinY+=(reduce?0:0.0035);
        rec.g.rotation.y=Math.sin(spinY)*0.62+userY;
        rec.g.rotation.x=0.22+Math.sin(spinY*0.7)*0.06+userX;
      }else if(rec.g.rotation.y!==0||rec.g.rotation.x!==0){
        rec.g.rotation.y*=0.88; rec.g.rotation.x*=0.88;
        if(Math.abs(rec.g.rotation.y)<0.001) rec.g.rotation.y=0;
        if(Math.abs(rec.g.rotation.x)<0.001) rec.g.rotation.x=0;
      }
    }
    userY*=0.985; userX*=0.985;
    renderer.render(scene,camera);
  }
  window.CoffeeMap.focus=function(state){
    const index=state?NAMES.findIndex(name=>window.CoffeeMap.canonical(name)===state):-1;
    selectDistrict(index,true);
  };
  document.getElementById('fallback').style.display='none';
  document.getElementById('fallbackNote').textContent='';
  window.CoffeeMap.ready=true;
  renderer.domElement.setAttribute('aria-hidden','true');
  renderer.domElement.addEventListener('webglcontextlost',function(event){event.preventDefault();renderer.domElement.style.display='none';window.CoffeeMap.fallback();});
  window.addEventListener('keydown',function(event){if(event.key==='Escape'){selectDistrict(-1,true);window.CoffeeMap.select('');}});
  if(window.CoffeeMap.active)window.CoffeeMap.focus(window.CoffeeMap.active);
  frame();

  /* ---------- idle glow: sweeps hover tint state by state, north to south,
     after ~3.5s of stillness; any interaction stops it instantly ---------- */
  (function(){
    var order=[]; for(var d=0;d<NAMES.length;d++) order.push(d);
    order.sort(function(x,y){ return D[y].home.y-D[x].home.y; });
    var pos=-1, lit=-1, last=Date.now(), timer=null;
    function calm(){ return !reduce && selected<0 && hovered<0 && !document.hidden; }
    function clearLit(){ if(lit>=0){ if(lit!==selected&&lit!==hovered) paint(lit,'base'); lit=-1; } }
    function step(){
      if(Date.now()-last<3500 || !calm()){ clearLit(); return; }
      clearLit();
      pos=(pos+1)%order.length; lit=order[pos]; paint(lit,'green');
    }
    ['pointermove','pointerdown','wheel','keydown','touchstart'].forEach(function(t){
      window.addEventListener(t,function(){ last=Date.now(); clearLit(); pos=-1; },{passive:true});
    });
    timer=setInterval(step,650);
    document.addEventListener('visibilitychange',function(){ if(document.hidden) clearLit(); });
  })();

})();
