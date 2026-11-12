// ================= AMBIENTE: cascadas, aves, fauna, peces =================
let FALLS=[],BIRDS=[],CRIT=[],ambT=0,PPL=[],HUTS=[],VILLS=[],FLOCKS=[],FUMS=[],PART=null;
const BMC={},BM=c=>BMC[c]||(BMC[c]=new THREE.MeshBasicMaterial({color:c}));
const FAUNA={
 deer:{n:10,sp:1,mk(){const g=new THREE.Group(),c=0x8a6440;g.add(P(G.box,c,0.16,0.14,0.36,0,0.3,0),P(G.box,c,0.08,0.16,0.08,0,0.42,0.17,0.5),P(G.box,0x7a5636,0.09,0.08,0.14,0,0.5,0.25),P(G.box,0xe8dcc6,0.06,0.06,0.04,0,0.33,-0.19));
  const legs=[];for(const[x,z]of[[-.05,.12],[.05,.12],[-.05,-.12],[.05,-.12]]){const l=new THREE.Group();l.position.set(x,0.23,z);l.add(P(G.box,0x5a4028,0.035,0.23,0.035,0,-0.115,0));g.add(l);legs.push(l)}
  g.add(P(G.box,0x4a3624,0.02,0.12,0.02,-0.03,0.6,0.24,0,0,0.4),P(G.box,0x4a3624,0.02,0.12,0.02,0.03,0.6,0.24,0,0,-0.4));g.scale.setScalar(1.2);scene.add(g);return{g,legs}}},
 salamander:{n:9,sp:1.2,mk(){const g=new THREE.Group(),c=0x2a1c18;g.add(P(G.box,c,0.15,0.08,0.42,0,0.12,0),P(G.box,c,0.11,0.07,0.15,0,0.13,0.27),P(G.cone,c,0.07,0.34,0.07,0,0.12,-0.37,-Math.PI/2),P(G.box,BM(0xff6a1a),0.05,0.025,0.3,0,0.17,0),P(G.sph,BM(0xffc040),0.03,0.03,0.03,0.04,0.16,0.33),P(G.sph,BM(0xffc040),0.03,0.03,0.03,-0.04,0.16,0.33));
  const legs=[];for(const[x,z]of[[-.09,.12],[.09,.12],[-.09,-.1],[.09,-.1]]){const l=new THREE.Group();l.position.set(x,0.11,z);l.add(P(G.box,c,0.04,0.11,0.04,0,-0.055,0));g.add(l);legs.push(l)}
  g.scale.setScalar(1.35);scene.add(g);return{g,legs}}},
 mammoth:{n:6,sp:0.75,mk(){const g=new THREE.Group(),c=0x5a3a24,d=0x3e2818;g.add(P(G.box,c,0.36,0.34,0.56,0,0.48,0),P(G.box,d,0.38,0.12,0.5,0,0.33,0),P(G.box,c,0.26,0.26,0.22,0,0.58,0.34),P(G.box,d,0.08,0.26,0.08,0,0.38,0.47,0.25),P(G.box,0xf0e8d8,0.03,0.03,0.22,0.08,0.44,0.48,0.5),P(G.box,0xf0e8d8,0.03,0.03,0.22,-0.08,0.44,0.48,0.5),P(G.box,d,0.04,0.14,0.1,0.15,0.6,0.3),P(G.box,d,0.04,0.14,0.1,-0.15,0.6,0.3));
  const legs=[];for(const[x,z]of[[-.12,.18],[.12,.18],[-.12,-.18],[.12,-.18]]){const l=new THREE.Group();l.position.set(x,0.32,z);l.add(P(G.box,d,0.1,0.32,0.1,0,-0.16,0));g.add(l);legs.push(l)}
  g.scale.setScalar(1.15);scene.add(g);return{g,legs}}},
 crawler:{n:10,sp:1.3,mk(){const g=new THREE.Group(),c=0x2a1a3a;g.add(P(G.sph,c,0.2,0.12,0.22,0,0.14,0.12),P(G.sph,c,0.24,0.14,0.26,0,0.15,-0.08),P(G.sph,0x3a2a50,0.13,0.1,0.13,0,0.15,0.27),P(G.sph,BM(0x2affc8),0.05,0.03,0.05,0,0.22,-0.08),P(G.sph,BM(0x2affc8),0.04,0.03,0.04,0,0.2,0.12),P(G.box,BM(0xff4ad8),0.012,0.012,0.18,0.04,0.2,0.36,-0.5),P(G.box,BM(0xff4ad8),0.012,0.012,0.18,-0.04,0.2,0.36,-0.5));
  const legs=[];for(const z of[0.14,0.0,-0.14])for(const x of[-1,1]){const l=new THREE.Group();l.position.set(x*0.1,0.13,z);l.add(P(G.box,0x1a1026,0.16,0.02,0.02,x*0.08,-0.05,0,0,0,x*-0.6));g.add(l);legs.push(l)}
  g.scale.setScalar(1.25);scene.add(g);return{g,legs}}}
};
// ---- aldeas nativas
const VG={pyr:new THREE.ConeGeometry(0.5,1,4).rotateY(Math.PI/4),dome:new THREE.SphereGeometry(0.5,12,6,0,Math.PI*2,0,Math.PI/2)};
const CHARM=[0x1c1a19,0x2c2724,0x121110].map(c=>new THREE.MeshLambertMaterial({color:c}));
function hutMesh(V){const g=new THREE.Group(),w=V.wall,r=V.roof;let ch=null;
 if(V.style==='cabin'){g.add(P(G.box,w,0.44,0.28,0.36,0,0.14,0),P(G.box,0x5a4630,0.46,0.04,0.38,0,0.02,0),P(VG.pyr,r,0.78,0.24,0.62,0,0.4,0),P(G.box,0x2a1c12,0.1,0.16,0.02,0,0.08,0.185),P(G.box,BM(0xffc870),0.07,0.06,0.02,0.14,0.16,0.185),P(G.box,0x5a5450,0.07,0.2,0.07,0.13,0.48,-0.08));ch=[0.13,0.6,-0.08]}
 else if(V.style==='dome'){g.add(P(G.hex,0x3a3634,0.56,0.1,0.56,0,0.05,0),P(VG.dome,w,0.48,0.36,0.48,0,0.1,0),P(G.box,r,0.14,0.16,0.12,0,0.09,0.22),P(G.box,BM(V.lamp),0.08,0.03,0.02,0,0.18,0.285),P(G.cyl,0x2a2a2a,0.015,0.36,0.015,0.12,0.4,-0.05),P(G.sph,BM(V.lamp),0.04,0.04,0.04,0.12,0.58,-0.05),P(G.cyl,0x4a4440,0.07,0.14,0.07,-0.13,0.36,-0.06));ch=[-0.13,0.45,-0.06]}
 else if(V.style==='igloo'){g.add(P(VG.dome,w,0.56,0.4,0.56,0,0,0),P(VG.dome,r,0.2,0.2,0.24,0,0,0.27),P(G.box,0x1a2430,0.09,0.09,0.02,0,0.05,0.385),P(G.sph,BM(V.lamp),0.035,0.035,0.035,0.09,0.06,0.38));for(let k=0;k<3;k++)g.add(P(G.box,0xd4e0ea,0.6-k*0.12,0.012,0.012,0,0.06+k*0.08,0.0,0,k*0.6,0))}
 else{g.add(P(G.sph,w,0.38,0.58,0.38,0,0.3,0),P(G.sph,BM(r),0.12,0.12,0.12,0,0.62,0),P(G.box,BM(V.lamp),0.06,0.12,0.02,0,0.2,0.185),P(G.cone,0x2a1a3a,0.06,0.3,0.06,0.18,0.1,0.1,0,0,0.6),P(G.cone,0x2a1a3a,0.06,0.3,0.06,-0.18,0.1,0.1,0,0,-0.6),P(G.cone,0x2a1a3a,0.06,0.3,0.06,0,0.1,-0.2,0.6,0,0))}
 g.userData.ch=ch;return g}
function villagerMk(V){const g=new THREE.Group(),cl=V.cloth[Math.floor(Math.random()*V.cloth.length)],sk=V.skin[Math.floor(Math.random()*V.skin.length)];
 g.add(P(G.cyl,cl,0.1,0.15,0.08,0,0.17,0),P(G.sph,sk,0.075,0.075,0.075,0,0.29,0),P(G.box,cl,0.03,0.11,0.03,0.06,0.18,0,0,0,0.2),P(G.box,cl,0.03,0.11,0.03,-0.06,0.18,0,0,0,-0.2));
 if(V.style==='igloo')g.add(P(G.sph,0x6a4a34,0.095,0.07,0.095,0,0.31,-0.01));
 else if(V.style==='dome')g.add(P(G.cyl,0xd09020,0.09,0.035,0.09,0,0.33,0),P(G.sph,BM(V.lamp),0.022,0.022,0.022,0,0.33,0.045));
 else if(V.style==='pod')g.add(P(G.box,BM(V.lamp),0.01,0.08,0.01,0.025,0.36,0.01,0.3,0,0.3),P(G.box,BM(V.lamp),0.01,0.08,0.01,-0.025,0.36,0.01,0.3,0,-0.3));
 else g.add(P(G.cyl,0x6a5030,0.11,0.02,0.11,0,0.33,0),P(G.cyl,0x6a5030,0.06,0.04,0.06,0,0.355,0));
 const legs=[];for(const x of[-0.026,0.026]){const l=new THREE.Group();l.position.set(x,0.1,0);l.add(P(G.box,0x2a2622,0.032,0.1,0.034,0,-0.05,0));g.add(l);legs.push(l)}
 g.scale.setScalar(1.2);scene.add(g);return{g,legs}}
function buildVillages(R){
 const V=PL.vil;
 for(const vd of VILLS.length?[]:VILS){const c=tiles[vd.c];const v={c:vd.c,x:c.x,z:c.z,huts:[],ppl:[],calm:99,home:[]};
  for(const t of tiles)if(hd(t.i,vd.c)<=2&&t.type!=='rock'&&t.type!=='water'&&t.type!=='ford'&&t.type!=='litio'&&canStep(t.i,t.i)&&Math.abs(t.lv-c.lv)<=0)v.home.push(t.i);
  if(!v.home.length)v.home=[vd.c];
  vd.t.forEach((ti,j)=>{const t=tiles[ti];const n=j===0?2:1,a0=R()*6.283;
   for(let k=0;k<n;k++){const a=a0+k*Math.PI,r=n>1?0.45:0.1,x=t.x+Math.cos(a)*r,z=t.z+Math.sin(a)*r;const g=hutMesh(V);const sc=1.45+R()*0.35;g.scale.setScalar(sc);g.position.set(x,heightAt(x,z),z);g.rotation.y=Math.atan2(c.x-x,c.z-z)+(j?Math.PI:0)+(R()-.5)*0.6;
    if(Math.hypot(c.x-x,c.z-z)<0.05)g.rotation.y=R()*6.283;world.add(g);
    const h={g,x,z,tile:ti,burn:0,ch:false,smk:R()*3,dx:x+Math.sin(g.rotation.y)*0.32*sc,dz:z+Math.cos(g.rotation.y)*0.32*sc};v.huts.push(h);HUTS.push(h)}
   if(j===1){for(let k=0;k<3;k++){const a=R()*6.283,x=t.x+Math.cos(a)*0.55,z=t.z+Math.sin(a)*0.55;world.add(P(G.box,V.style==='pod'?0x3a2a50:0x6a5236,0.12,0.1,0.12,x,heightAt(x,z)+0.05,z,0,R()*3,0))}}
  });
  const n=4+Math.floor(R()*3);for(let k=0;k<n;k++){const m=villagerMk(V);const h0=tiles[v.home[Math.floor(R()*v.home.length)]];const p={...m,v,x:h0.x+(R()-.5)*0.6,z:h0.z+(R()-.5)*0.6,tx:0,tz:0,mode:'idle',wait:R()*4,ph:R()*6,ry:R()*6,k};v.ppl.push(p);PPL.push(p)}
  VILLS.push(v)}
}
function buildPart(){
 if(PART){scene.remove(PART.pts);PART.pts.geometry.dispose()}
 const p=PL.part,n=CFG.quality==='baja'?Math.floor(p.n/3):p.n,pos=new Float32Array(n*3),sp=new Float32Array(n);
 for(let i=0;i<n;i++){pos[i*3]=(Math.random()*2-1)*(CX+2);pos[i*3+1]=Math.random()*8;pos[i*3+2]=(Math.random()*2-1)*(CZ+2);sp[i]=0.5+Math.random()}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
 const m=new THREE.PointsMaterial({color:p.col,size:p.size,transparent:true,opacity:p.op,depthWrite:false,blending:p.glow?THREE.AdditiveBlending:THREE.NormalBlending});
 const pts=new THREE.Points(g,m);pts.frustumCulled=false;pts.renderOrder=4;scene.add(pts);PART={pts,pos,sp,n,p};
}
function updPart(dt,T){
 if(!PART)return;const{pos,sp,n,p}=PART;
 for(let i=0;i<n;i++){const k=i*3;pos[k+1]+=p.vy*sp[i]*dt;pos[k]+=Math.sin(T*0.6+i*1.3)*p.drift*dt;pos[k+2]+=Math.cos(T*0.5+i*0.7)*p.drift*0.6*dt;
  if(p.vy>0&&pos[k+1]>8){pos[k+1]=0.2;pos[k]=(Math.random()*2-1)*(CX+2);pos[k+2]=(Math.random()*2-1)*(CZ+2)}
  if(p.vy<=0&&pos[k+1]<-0.3){pos[k+1]=8}}
 PART.pts.geometry.attributes.position.needsUpdate=true;
}
const FLM=[new THREE.MeshBasicMaterial({color:0xff6a14,transparent:true,opacity:0.85,depthWrite:false,blending:THREE.AdditiveBlending}),new THREE.MeshBasicMaterial({color:0xffd060,transparent:true,opacity:0.9,depthWrite:false,blending:THREE.AdditiveBlending})];
function flameMesh(){const g=new THREE.Group();g.add(new THREE.Mesh(G.cone,FLM[0]));const i=new THREE.Mesh(G.cone,FLM[1]);i.scale.set(0.55,0.6,0.55);i.position.y=-0.15;g.add(i);scene.add(g);return g}
function updVillages(dt,now){
 const T=now/1000;
 for(const v of VILLS){
  let th=false;if(started)for(const e of ents){if(e.dead||e.kind!=='u')continue;if(hd(e.tile,v.c)<=4){th=true;break}}
  for(const b of BOOMS)if(Math.hypot(b.x-v.x,b.z-v.z)<5.5)th=true;
  v.calm=th?0:v.calm+dt;
  const seenV=!started||!!expl[v.c];
  for(const h of v.huts){
   for(const b of BOOMS)if(Math.hypot(b.x-h.x,b.z-h.z)<1.5+b.s*0.15){if(h.burn<=0)h.burn=10+Math.random()*6;h.bt=(h.bt||0)}
   h.g.visible=seenV;const vs=!started||!!vis[h.tile];
   if(h.burn>0){h.burn-=dt;h.bt=(h.bt||0)+dt;if(h.bt>2.5&&!h.ch){h.ch=true;h.g.traverse(o=>{if(o.isMesh&&!(o.material instanceof THREE.MeshBasicMaterial))o.material=CHARM[o.id%3]})}
    h.flm=h.flm||[flameMesh(),flameMesh()];const k=Math.min(1,h.burn/3);
    h.flm.forEach((g,i)=>{const s=0.48*k*(0.8+0.3*Math.sin(now*0.03+i*2)+Math.random()*0.15);g.position.set(h.x+(i?0.12:-0.1),h.g.position.y+0.25+s*0.5,h.z+(i?-0.06:0.08));g.scale.set(s*0.8,s*1.6,s*0.8);g.visible=vs});
    if(vs&&Math.random()<dt*5)smoke(h.x+(Math.random()-.5)*0.3,h.g.position.y+0.5,h.z+(Math.random()-.5)*0.3,0.55,2,0x303032,0.8);
    if(h.burn<=0){h.flm.forEach(g=>scene.remove(g));h.flm=null}}
   else if(vs&&h.g.userData.ch&&!h.ch){h.smk-=dt;if(h.smk<=0){h.smk=1.2+Math.random();const c=h.g.userData.ch,a=h.g.rotation.y,sc=h.g.scale.x;smoke(h.x+(c[0]*Math.cos(a)+c[2]*Math.sin(a))*sc,h.g.position.y+c[1]*sc,h.z+(-c[0]*Math.sin(a)+c[2]*Math.cos(a))*sc,0.22,2.6,0xb8bcc0,0.45)}}
   else if(vs&&h.ch&&Math.random()<dt*0.6)smoke(h.x,h.g.position.y+0.3,h.z,0.25,2.2,0x4a4a4c,0.4);
  }
  for(const p of v.ppl){
   if(th&&p.mode!=='hide'&&p.mode!=='run'){const ok=v.huts.filter(h=>h.burn<=0).sort((a,b)=>Math.hypot(a.dx-p.x,a.dz-p.z)-Math.hypot(b.dx-p.x,b.dz-p.z))[0];
    if(ok){p.tx=ok.dx;p.tz=ok.dz;p.hut=true}else{const a=Math.atan2(p.z-v.z,p.x-v.x);p.tx=v.x+Math.cos(a)*2.6;p.tz=v.z+Math.sin(a)*2.6;p.hut=false}p.mode='run'}
   if(p.mode==='hide'&&v.calm>5+p.k*1.3){p.mode='idle';p.wait=Math.random()*2}
   if(p.mode==='idle'){p.wait-=dt;if(p.wait<=0){const t=tiles[v.home[Math.floor(Math.random()*v.home.length)]];p.tx=t.x+(Math.random()-.5)*0.9;p.tz=t.z+(Math.random()-.5)*0.9;p.mode='walk'}}
   let mv=false;
   if(p.mode==='walk'||p.mode==='run'){const sp=p.mode==='run'?1.7:0.32,dx=p.tx-p.x,dz=p.tz-p.z,d=Math.hypot(dx,dz);
    if(d<0.06){if(p.mode==='run'&&p.hut)p.mode='hide';else{p.mode=th?'run2':'idle';p.wait=2+Math.random()*5}}
    else{const st=Math.min(d,sp*dt);p.x+=dx/d*st;p.z+=dz/d*st;let w=Math.atan2(dx,dz)-p.ry;w=Math.atan2(Math.sin(w),Math.cos(w));p.ry+=w*Math.min(1,dt*10);p.ph+=dt*(p.mode==='run'?20:8);mv=true}}
   if(p.mode==='run2'&&!th){p.mode='idle'}
   const hi=hexAt(p.x,p.z);p.g.visible=p.mode!=='hide'&&(!started||(hi>=0&&!!vis[hi]));
   p.g.position.set(p.x,heightAt(p.x,p.z),p.z);p.g.rotation.y=p.ry;
   const sw=mv?Math.sin(p.ph)*(p.mode==='run'?0.9:0.5):0;p.legs[0].rotation.x=sw;p.legs[1].rotation.x=-sw;
   p.g.position.y+=mv&&p.mode==='run'?Math.abs(Math.sin(p.ph))*0.03:0;
  }
 }
}
const fallMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
 uniforms:{uTime:TU.uTime,uF1:TU.uF1,uF2:TU.uF2},
 fragmentShader:'uniform float uTime;uniform vec3 uF1;uniform vec3 uF2;varying vec2 vUv;float h(float n){return fract(sin(n)*43758.5);}void main(){float x=floor(vUv.x*22.0);float s=fract(vUv.y*3.0+uTime*(1.4+h(x)*0.9)+h(x*7.1));float streak=smoothstep(0.55,1.0,s);vec3 c=mix(uF1,uF2,streak*0.8+0.15*(1.0-vUv.y));float a=0.78*smoothstep(0.0,0.06,vUv.x)*smoothstep(1.0,0.94,vUv.x);gl_FragColor=vec4(c,a);}'});
function addFall(x,z,ytop,ybot,dirX,dirZ,w){
 const ang=Math.atan2(dirX,dirZ),rad=w*0.55;const g=new THREE.CylinderGeometry(rad,rad*1.15,ytop-ybot,16,1,true,ang-Math.PI*0.6,Math.PI*1.2);const m=new THREE.Mesh(g,fallMat);m.position.set(x-dirX*rad*0.6,(ytop+ybot)/2,z-dirZ*rad*0.6);m.renderOrder=3;world.add(m);
 FALLS.push({x:x+dirX*0.15,z:z+dirZ*0.15,y:ybot,w,dx:dirX,dz:dirZ,tile:hexAt(x+dirX*0.4,z+dirZ*0.4)});
}
function buildAmbient(){
 FALLS=[];for(const b of BIRDS)scene.remove(b.g);for(const c of CRIT)scene.remove(c.g);for(const p of PPL)scene.remove(p.g);for(const h of HUTS)(h.flm||[]).forEach(g=>scene.remove(g));BIRDS=[];CRIT=[];PPL=[];HUTS=[];VILLS=[];FLOCKS=[];
 const R=rnd32(tiles.length*7+((tiles[0].v*1e6)|0));
 // cascadas naturales: agua junto a terreno alto
 const cand=[];
 for(const t of tiles){if(t.type!=='water'||t.r<H/2)continue;for(const n of t.nb){const N=tiles[n];if(N.type==='water'||N.type==='ford'||N.type==='rock')continue;const drop=N.h-0.16;if(drop>0.95)cand.push([drop,t.i,n])}}
 cand.sort((a,b)=>b[0]-a[0]);
 for(const[,ti,ni]of cand.slice(0,1))for(const[a,b]of[[ti,ni],[mirror(ti),mirror(ni)]]){const t=tiles[a],N=tiles[b];const dx=t.x-N.x,dz=t.z-N.z,d=Math.hypot(dx,dz);const mx=(t.x+N.x)/2,mz=(t.z+N.z)/2;addFall(mx,mz,heightAt(mx-dx/d*0.3,mz-dz/d*0.3),0.16,dx/d,dz/d,0.9)}
 // nacimiento del río en el borde: farallón con cascada
 for(const t of tiles){if(t.type!=='water'||(t.c!==0&&t.c!==W-1))continue;const s=t.c===0?-1:1;const bx=t.x+s*1.2;
  const rm=new THREE.MeshLambertMaterial({color:PL.col.rock,flatShading:true});
  for(const[ox,oy,oz,sc]of[[0.55,0.5,-0.55,5.5],[0.6,0.6,0.55,5.2],[0.75,1.45,0,5.8],[0.45,1.9,-0.4,3.8],[0.5,1.85,0.45,3.6],[1.1,0.9,0,6.5]]){const r=new THREE.Mesh(decoGeo.peb,rm);r.position.set(bx+s*ox,oy,t.z+oz);r.scale.set(sc,sc*1.1,sc);r.rotation.set(R()*3,R()*3,R()*3);world.add(r)}
  addFall(bx-s*0.05,t.z,2.15,0.16,-s,0,1.1)}
 // aves: bandadas que planean en círculos
 const bodyG=new THREE.ConeGeometry(0.06,0.3,4),wingG=new THREE.BufferGeometry();wingG.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0.08,0,0,-0.08,0.42,0.02,-0.02],3));wingG.computeVertexNormals();
 const bm=PL.birdGlow?new THREE.MeshBasicMaterial({color:PL.bird,side:THREE.DoubleSide,transparent:true,opacity:0.85}):new THREE.MeshLambertMaterial({color:PL.bird,side:THREE.DoubleSide});
 for(let f=0;f<3;f++){const cx=(R()*2-1)*CX*0.7,cz=(R()*2-1)*CZ*0.7,rad=4+R()*6,sp=(0.12+R()*0.1)*(R()<0.5?-1:1),hgt=6+R()*3,n=4+Math.floor(R()*3),ph=R()*6;const fk={cx,cz,sc:0};FLOCKS.push(fk);
  for(let k=0;k<n;k++){const g=new THREE.Group(),b=new THREE.Mesh(bodyG,bm);b.rotation.x=Math.PI/2;g.add(b);const wl=new THREE.Mesh(wingG,bm),wr=new THREE.Mesh(wingG,bm);wr.scale.x=-1;g.add(wl,wr);scene.add(g);
   BIRDS.push({g,wl,wr,cx,cz,rad,sp,hgt,ph,off:k,ox:(k%2?1:-1)*Math.ceil(k/2)*0.5,oz:-Math.ceil(k/2)*0.45,fl:R()*6,fk})}}
 // fauna terrestre según el planeta: pastan y huyen de las tropas y de las explosiones
 const FA=FAUNA[PL.fauna]||FAUNA.deer;
 const meadow=tiles.filter(t=>t.type==='grass'&&(t.surf==='grass'||PL.fauna!=='deer')&&!t.ramp&&!PLAT.has(t.i)&&hd(t.i,HQP)>5&&hd(t.i,HQC)>5);
 for(let k=0;k<FA.n&&meadow.length;k++){const t=meadow[Math.floor(R()*meadow.length)];const d=FA.mk();CRIT.push({...d,tile:t.i,next:-1,mt:0,wait:R()*4,ph:R()*6,flee:0,x:t.x,z:t.z,ry:R()*6,sp:FA.sp})}
 buildVillages(R);buildPart();
}
function critStep(c,away){
 const t=tiles[c.tile];let opts=t.nb.filter(n=>{const N=tiles[n];return N.type!=='water'&&N.type!=='rock'&&!N.bld&&!PLAT.has(n)&&canStep(c.tile,n)});
 if(!opts.length)return -1;
 if(away){opts.sort((a,b)=>hd(b,away.tile)-hd(a,away.tile));return opts[0]}
 return opts[Math.floor(Math.random()*opts.length)];
}
function updAmbient(dt,now){
 const T=now/1000;
 const nowS=now/1000;if(BOOMS.length)BOOMS=BOOMS.filter(b=>nowS-b.t<2.5).slice(-40);
 for(const fk of FLOCKS){fk.sc=Math.max(0,fk.sc-dt);for(const b of BOOMS)if(Math.hypot(b.x-fk.cx,b.z-fk.cz)<10)fk.sc=4}
 updPart(dt,T);updVillages(dt,now);
 for(const b of BIRDS){const sc=Math.min(1,b.fk.sc/2);b.pa=(b.pa??(T*b.sp+b.ph))+dt*b.sp*(1+2.5*sc);b.lift=(b.lift||0)+(sc*3.5-(b.lift||0))*Math.min(1,dt*2);const a=b.pa,cx=b.cx+Math.cos(a)*b.rad,cz=b.cz+Math.sin(a)*b.rad,dir=a+(b.sp>0?Math.PI/2:-Math.PI/2);
  const fx=Math.cos(dir),fz=Math.sin(dir);b.g.position.set(cx+fx*b.oz-fz*b.ox,b.hgt+b.lift+Math.sin(T*0.7+b.off)*0.3,cz+fz*b.oz+fx*b.ox);b.g.rotation.y=Math.atan2(fx,fz);
  const fl=Math.sin(T*(9+sc*12)+b.fl)*0.6;b.wl.rotation.z=fl;b.wr.rotation.z=-fl;}
 for(const c of CRIT){
  let threat=null;if(started)for(const e of ents){if(e.dead||e.kind!=='u')continue;if(hd(e.tile,c.tile)<=2){threat=e;break}}
  if(!threat)for(const b of BOOMS){const bi=hexAt(b.x,b.z);if(bi>=0&&hd(bi,c.tile)<=4){threat={tile:bi};break}}
  if(c.next<0){c.wait-=dt;if(threat||c.wait<=0){const n=critStep(c,threat);if(n>=0){c.next=n;c.mt=0;c.fast=!!threat}c.wait=1.5+Math.random()*5}}
  else{c.mt+=dt*(c.fast?2.4:0.5)*(c.sp||1);if(c.mt>=1){c.tile=c.next;c.next=-1;c.mt=0}}
  const a=tiles[c.tile],b2=c.next>=0?tiles[c.next]:a;const x=a.x+(b2.x-a.x)*c.mt,z=a.z+(b2.z-a.z)*c.mt;
  if(c.next>=0){const want=Math.atan2(b2.x-a.x,b2.z-a.z);let d=want-c.ry;d=Math.atan2(Math.sin(d),Math.cos(d));c.ry+=d*Math.min(1,dt*6);c.ph+=dt*(c.fast?16:7)}
  c.g.position.set(x,heightAt(x,z),z);c.g.rotation.y=c.ry;
  const sw=c.next>=0?Math.sin(c.ph)*(c.fast?0.8:0.4):0;c.legs.forEach((l,i)=>l.rotation.x=((i%2===0)!==(Math.floor(i/2)%2===1))?sw:-sw);
  c.g.visible=!started||!!vis[c.tile];
 }
 ambT-=dt;if(ambT<=0){ambT=0.12;
  for(const f of FALLS){if(started&&!vis[f.tile]&&f.tile>=0)continue;const o=(Math.random()-0.5)*f.w;foam(f.x-f.dz*o,f.y+0.05,f.z+f.dx*o)}
  for(const f of FUMS){if(started&&!vis[f.t])continue;if(Math.random()<0.3)smoke(f.x+(Math.random()-.5)*0.1,f.y+0.15,f.z+(Math.random()-.5)*0.1,0.32,2.2,0x8a8480,0.6)}
  if(Math.random()<0.25){const ws=tiles.filter(t=>t.type==='water'&&(!started||vis[t.i]));if(ws.length){const t=ws[Math.floor(Math.random()*ws.length)];fish(t.x+(Math.random()-.5)*1.2,t.z+(Math.random()-.5)*1.2)}}}
}
function foam(x,y,z){const m=new THREE.Mesh(G.sph,new THREE.MeshBasicMaterial({color:PL.liq.foam,transparent:true,opacity:0.6,depthWrite:false}));m.position.set(x,y,z);m.scale.setScalar(0.15);scene.add(m);fx.push({o:m,t:0,life:0.9,k:'smoke',s:0.7})}
function fish(x,z){const m=new THREE.Mesh(G.cone,PL.liq.glow[0]+PL.liq.glow[1]>0?new THREE.MeshBasicMaterial({color:PL.liq.fish}):new THREE.MeshLambertMaterial({color:PL.liq.fish}));m.scale.set(0.07,0.22,0.05);m.position.set(x,0.16,z);scene.add(m);fx.push({o:m,t:0,life:0.9,k:'fish',x,z,a:Math.random()*6})}
function updFog(){
 const nv=new Uint8Array(tiles.length);
 if(revealT>0)nv.fill(1);
 else for(const e of ents){
  if(e.dead||e.team!==0)continue;
  const r=e.kind==='b'?(BD[e.type].key?5:4):(UD[e.type].sight||(isAir(e)?5:4));
  const air=e.kind==='u'&&isAir(e),lv=tiles[e.tile].lv;
  for(const t of tiles){if(nv[t.i])continue;const d=hd(e.tile,t.i);if(d>r+2)continue;
   let lim=r;if(!air){const dl=lv-t.lv;if(dl>0)lim=r+Math.min(2,dl);else if(dl<0)lim=Math.min(r,1)}
   if(d<=lim)nv[t.i]=1}
 }
 if(revealT<=0)for(const S of[...DROPS.filter(d=>d.team===0).map(d=>d.ship),...ARRIVE.filter(a=>a.b.team===0).map(a=>a.ship)]){if(!S.visible)continue;const c=hexAt(S.position.x,S.position.z);if(c<0)continue;for(const t of tiles)if(!nv[t.i]&&hd(c,t.i)<=4)nv[t.i]=1}
 let ch=false;for(let i=0;i<nv.length;i++){if(nv[i]!==vis[i])ch=true;if(nv[i]&&!expl[i])expl[i]=1}
 vis=nv;for(const e of ents)if(e.kind==='b'&&e.team===1&&vis[e.tile])e.seen=true;
 if(ch){paintTiles();drawTerrMini()}
}
let CONT=[];
function contourSegs(){
 const out=[];
 for(const t of tiles){
  if(t.ramp||t.type==='water'||t.type==='ford')continue;
  for(let k=0;k<6;k++){const mid=(k*60+30)*Math.PI/180;const n=hexAt(t.x+SQ3*Math.sin(mid),t.z+SQ3*Math.cos(mid));const N=n>=0?tiles[n]:null;
   const draw=!N||(N.lv<t.lv&&!(N.ramp&&N.lv===t.lv-1))||N.type==='water'||N.type==='ford';
   if(!draw)continue;const a0=k*Math.PI/3,a1=(k+1)*Math.PI/3,r=0.965;
   out.push([t.i,t.x+r*Math.sin(a0),t.z+r*Math.cos(a0),t.x+r*Math.sin(a1),t.z+r*Math.cos(a1),t.h+0.012]);
  }}
 return out;
}
function rampGeo(t){
 let dx=0,dz=0;for(const n of t.nb){const N=tiles[n];if(N.lv===t.lv+1&&N.type!=='rock'&&N.type!=='water'){dx+=N.x-t.x;dz+=N.z-t.z}}
 const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;const r=0.965,top=[];
 for(let k=0;k<6;k++){const a=k*Math.PI/3,x=r*Math.sin(a),z=r*Math.cos(a);top.push([x,LV*((x*dx+z*dz)/r+1)/2,z])}
 const pos=[];
 for(let k=0;k<6;k++){const a=top[k],b=top[(k+1)%6];pos.push(0,LV/2,0,...b,...a);pos.push(a[0],0,a[2],...b,b[0],0,b[2],a[0],0,a[2],...a,...b)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
 return g;
}
let DECO=[];
const decoGeo={tuft:new THREE.ConeGeometry(0.045,0.26,3),peb:new THREE.DodecahedronGeometry(0.11,0),bush:new THREE.IcosahedronGeometry(0.2,0),flower:new THREE.IcosahedronGeometry(0.045,0),stem:new THREE.CylinderGeometry(0.008,0.008,0.14,3),crown:new THREE.ConeGeometry(0.26,0.75,6),snow:new THREE.ConeGeometry(0.19,0.36,6),branch:new THREE.CylinderGeometry(0.012,0.028,0.34,4).translate(0,0.17,0),stalk:new THREE.CylinderGeometry(0.04,0.065,0.5,6),cap:new THREE.SphereGeometry(0.24,9,5,0,Math.PI*2,0,Math.PI/2),gstalk:new THREE.CylinderGeometry(0.1,0.17,1.1,7),gcap:new THREE.SphereGeometry(0.5,11,6,0,Math.PI*2,0,Math.PI/2),spike:new THREE.ConeGeometry(0.08,0.62,4),ember:new THREE.IcosahedronGeometry(0.05,0),trunk:new THREE.CylinderGeometry(0.05,0.06,0.25,5),reed:new THREE.CylinderGeometry(0.015,0.02,0.4,3)};
function buildDeco(){
 const rr=rnd32(tiles.length*31+tiles[0].v*1e6|0);
 const L={tuft:[],peb:[],bush:[],crown:[],trunk:[],reed:[],flower:[],stem:[],snow:[],branch:[],stalk:[],cap:[],gstalk:[],gcap:[],spike:[],ember:[]};
 const DC=PL.deco,FC=DC.flowers||[0xffffff],pk=a=>a[Math.floor(rr()*a.length)];FUMS=[];
 const add=(k,t,x,y,z,s,ry,rx,col)=>{const top=t.ramp?t.base+LV/2:t.h;L[k].push({t:t.i,x,y:heightAt(x,z)+(y-top),z,s,ry,rx:rx||0,col})};
 const spot=(t,rmin,rmax)=>{const a=rr()*Math.PI*2,r=rmin+rr()*(rmax-rmin);return[t.x+Math.sin(a)*r,t.z+Math.cos(a)*r]};
 const tree=(t,x,top,z)=>{const s=0.8+rr()*0.6;
  if(DC.tree==='mush'){add('stalk',t,x,top+0.25*s,z,s,0,(rr()-.5)*0.2,DC.trunk);add('cap',t,x,top+0.49*s,z,s,rr()*6,0,pk(DC.crown));return}
  if(DC.tree==='dead'){const s2=s*1.25;add('trunk',t,x,top+0.12*s2,z,s2,0,0,DC.trunk);add('trunk',t,x,top+0.33*s2,z,s2*0.72,0,0,DC.trunk);for(let b=0;b<3;b++)add('branch',t,x,top+(0.3+b*0.08)*s2,z,s2*(0.9-b*0.15),rr()*6.3,0.6+rr()*0.5,DC.trunk);return}
  add('trunk',t,x,top+0.12*s,z,s,0,0,DC.trunk);add('crown',t,x,top+0.6*s,z,s,rr()*6,0,pk(DC.crown));
  if(DC.tree==='snowpine')add('snow',t,x,top+0.8*s,z,s,rr()*6,0,0xeef4f8)};
 for(const t of tiles){
  if(t.type==='water'||PLAT.has(t.i)){continue}
  if(t.type==='ford'||t.type==='rock'&&false)continue;
  const top=t.ramp?t.base+LV/2:t.h;
  if(t.type==='rock'){if(t.vil)continue;
   if(DC.tree==='mush'){const[x,z]=spot(t,0,0.25);const s=0.85+rr()*0.5;add('gstalk',t,x,t.h+0.55*s,z,s,rr()*6,(rr()-.5)*0.15,DC.trunk);add('gcap',t,x,t.h+1.08*s,z,s,rr()*6,0,pk(DC.crown));
    if(rr()<0.7){const[x2,z2]=spot(t,0.5,0.8);const s2=0.4+rr()*0.3;add('gstalk',t,x2,t.h+0.55*s2,z2,s2,0,(rr()-.5)*0.3,DC.trunk);add('gcap',t,x2,t.h+1.08*s2,z2,s2,rr()*6,0,pk(DC.crown))}continue}
   for(let k=0;k<2;k++){const[x,z]=spot(t,0.2,0.7);add('peb',t,x,t.h,z,1.2+rr()*1.4,rr()*6,rr(),DC.boulder)}
   if(DC.spike)for(let k=0;k<2+Math.floor(rr()*3);k++){const[x,z]=spot(t,0.1,0.75);const s=0.7+rr()*0.9;add('spike',t,x,t.h+0.26*s,z,s,rr()*6,(rr()-.5)*0.5,DC.spike)}
   continue}
  if(t.type==='litio')continue;
  const wet=t.nb.some(j=>tiles[j].type==='water');
  if(t.surf==='grass'){
   const n=4+Math.floor(rr()*5);for(let k=0;k<n;k++){const[x,z]=spot(t,0.1,0.85);add('tuft',t,x,top,z,0.7+rr()*0.8,rr()*6,(rr()-.5)*0.4,pk(DC.tuft))}
   if(!t.ramp&&t.zone<0&&rr()<DC.treeP){const[x,z]=spot(t,0.45,0.75);if(rr()<0.55)tree(t,x,top,z);else add('bush',t,x,top+0.12,z,0.8+rr()*0.7,rr()*6,0,DC.bush)}
   if(DC.flowers&&rr()<0.55){const fc=FC[Math.floor(rr()*FC.length)];const n2=2+Math.floor(rr()*5);const[cx0,cz0]=spot(t,0.1,0.6);for(let k=0;k<n2;k++){const x=cx0+(rr()-.5)*0.35,z=cz0+(rr()-.5)*0.35;add('stem',t,x,top+0.07,z,1,0,0,0x5a8a3a);add('flower',t,x,top+0.15,z,0.8+rr()*0.5,rr()*6,rr(),rr()<0.85?fc:FC[Math.floor(rr()*FC.length)])}}
   if(wet){if(DC.ember){for(let k=0;k<4;k++){const[x,z]=spot(t,0.5,0.95);add('ember',t,x,top+0.03,z,0.7+rr()*0.9,rr()*6,rr(),DC.ember)}}else for(let k=0;k<5;k++){const[x,z]=spot(t,0.4,0.9);add('reed',t,x,top+0.18,z,0.8+rr()*0.6,0,(rr()-.5)*0.3,DC.reed)}}
  }else if(t.surf==='dirt'){
   for(let k=0;k<2+Math.floor(rr()*3);k++){const[x,z]=spot(t,0.1,0.8);add('peb',t,x,top+0.02,z,0.35+rr()*0.5,rr()*6,rr(),DC.peb[0])}
   if(rr()<0.5){const[x,z]=spot(t,0.3,0.85);add('tuft',t,x,top,z,0.8,rr()*6,0.2,DC.tuft[1])}
   if(DC.fum&&!t.ramp&&t.zone<0&&rr()<0.07){const[x,z]=spot(t,0,0.4);FUMS.push({x,z,y:heightAt(x,z),t:t.i});add('ember',t,x,top+0.02,z,1.4,0,0,DC.ember);for(let k=0;k<4;k++){const a=k*1.57+rr();add('peb',t,x+Math.sin(a)*0.18,top+0.03,z+Math.cos(a)*0.18,0.6+rr()*0.4,rr()*6,rr(),DC.peb[2])}}
  }else{
   for(let k=0;k<3+Math.floor(rr()*3);k++){const[x,z]=spot(t,0.1,0.8);add('peb',t,x,top+0.03,z,0.4+rr()*0.9,rr()*6,rr(),rr()<0.5?DC.peb[1]:DC.peb[2])}
   if(DC.spike&&rr()<0.18){const[x,z]=spot(t,0.2,0.7);const s=0.4+rr()*0.5;add('spike',t,x,top+0.26*s,z,s,rr()*6,(rr()-.5)*0.4,DC.spike)}
   if(DC.fum&&!t.ramp&&t.zone<0&&rr()<0.06){const[x,z]=spot(t,0,0.4);FUMS.push({x,z,y:heightAt(x,z),t:t.i});add('ember',t,x,top+0.02,z,1.4,0,0,DC.ember)}
  }
 }
 // franja de borde: grava y vegetación donde el terreno cae
 for(const t of tiles){if(t.type==='water'||t.type==='ford'||t.type==='rock'||PLAT.has(t.i))continue;for(let k=0;k<7;k++){const a=rr()*6.283,r=0.55+rr()*0.45,x=t.x+Math.sin(a)*r,z=t.z+Math.cos(a)*r;const h0=heightAt(x,z),hx=heightAt(x+Math.sin(a)*0.45,z+Math.cos(a)*0.45);const top=t.ramp?t.base+LV/2:t.h;
  if(h0-hx>0.25){add('peb',t,x,top+(h0-top)+0.02,z,0.3+rr()*0.5,rr()*6,rr(),rr()<0.5?DC.peb[0]:DC.peb[2]);if(rr()<0.6)add('tuft',t,x+(rr()-.5)*0.2,top+(h0-top),z+(rr()-.5)*0.2,0.9+rr()*0.6,rr()*6,(rr()-.5)*0.5,pk(DC.edge));if(rr()<0.18&&t.surf==='grass')add('bush',t,x,top+(h0-top)+0.1,z,0.6+rr()*0.5,rr()*6,0,DC.bush)}
  else if(hx-h0>0.35&&rr()<0.7)add('peb',t,x,top+(h0-top)+0.02,z,0.4+rr()*0.8,rr()*6,rr(),DC.peb[2])}}
 DECO=[];
 const GLK={ember:1,cap:DC.glow,flower:DC.glow};
 for(const k in L){if(!L[k].length)continue;const gl=!!GLK[k],im=new THREE.InstancedMesh(decoGeo[k],gl?new THREE.MeshBasicMaterial({color:0xffffff}):new THREE.MeshLambertMaterial({color:0xffffff}),L[k].length);
  const d=new THREE.Object3D(),c=new THREE.Color(),fm=gl?0.95:0.6;
  L[k].forEach((o,i)=>{d.position.set(o.x,o.y+(k==='tuft'?0.13*o.s:k==='reed'?0:0),o.z);d.rotation.set(o.rx,o.ry,0,'YXZ');d.scale.setScalar(o.s);d.updateMatrix();o.m=d.matrix.clone();im.setMatrixAt(i,o.m);im.setColorAt(i,c.setHex(o.col).multiplyScalar(fm))});
  world.add(im);DECO.push({im,list:L[k],fm});}
}
const _z=new THREE.Matrix4().makeScale(0,0,0),_dc=new THREE.Color();
function paintDeco(){
 for(const{im,list,fm}of DECO){
  list.forEach((o,i)=>{const t=tiles[o.t];const hide=!expl[o.t]||t.bld;im.setMatrixAt(i,hide?_z:o.m);if(!hide){_dc.setHex(o.col).multiplyScalar(fm);if(!vis[o.t])_dc.multiplyScalar(0.42);im.setColorAt(i,_dc)}});
  im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true;
 }
}
function buildContours(){
 CONT=contourSegs();
}
function paintTiles(){
 if(!TER)return;
 const{vt,vb,col,wcol,N}=TER,zc=zones.map(z=>new THREE.Color(z.own<0?0x8996a4:TC[z.own])),wb=new THREE.Color(PL.liq.top);
 for(let k=0;k<N;k++){
  const ti=vt[k];let r=vb[k*3],g=vb[k*3+1],b=vb[k*3+2],wr=wb.r,wg=wb.g,wbb=wb.b;
  if(ti>=0){const t=tiles[ti];
   if(t.zone>=0){const z=zc[t.zone];r+=(z.r-r)*0.16;g+=(z.g-g)*0.16;b+=(z.b-b)*0.16}
   if(!expl[ti]){r=0.035;g=0.045;b=0.06;wr=0.03;wg=0.04;wbb=0.055}else if(!vis[ti]){r*=0.42;g*=0.42;b*=0.42;wr*=0.42;wg*=0.42;wbb*=0.42}}
  col[k*3]=r;col[k*3+1]=g;col[k*3+2]=b;wcol[k*3]=wr;wcol[k*3+1]=wg;wcol[k*3+2]=wbb;
 }
 TER.geo.attributes.color.needsUpdate=true;TER.wgeo.attributes.color.needsUpdate=true;
 tiles.forEach((t,i)=>{if(t.crys)t.crys.forEach(m=>m.visible=!!expl[i]&&t.amt>0)});
 paintPlat();
 paintDeco();updHiMesh();
}
const hiGeo=new THREE.CylinderGeometry(0.9,0.9,0.04,6);
const hiMesh=new THREE.InstancedMesh(hiGeo,new THREE.MeshBasicMaterial({color:0x2ad4ff,transparent:true,opacity:0.16,depthWrite:false}),1000);hiMesh.count=0;hiMesh.renderOrder=5;scene.add(hiMesh);
const edgeMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,0.05,0.11),new THREE.MeshBasicMaterial({color:0x5fe3ff}),3000);edgeMesh.count=0;edgeMesh.renderOrder=6;scene.add(edgeMesh);
// fantasma de colocación: solo las casillas que ocupará el edificio
const GH={i:-1};
const ghMat=new THREE.MeshBasicMaterial({color:0x2ad4ff,transparent:true,opacity:0.4,depthWrite:false});
const ghMesh=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.9,0.9,0.05,6),ghMat,3);ghMesh.count=0;ghMesh.renderOrder=7;scene.add(ghMesh);
const ghRG=new THREE.RingGeometry(0.74,0.93,6,1,Math.PI/2);ghRG.rotateX(-Math.PI/2);
const ghLines=new THREE.InstancedMesh(ghRG,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.95,depthWrite:false,side:THREE.DoubleSide}),3);ghLines.count=0;ghLines.renderOrder=8;ghLines.visible=false;scene.add(ghLines);
function setGhost(i){
 if(i==null||i<0||!selCard||!BD[selCard]){ghMesh.count=0;ghLines.visible=false;GH.i=-1;return}
 if(i===GH.i)return;GH.i=i;
 const ok=!why(0,selCard,i);let ft=[i];
 if(BIG3[selCard]){const f=footFor(0,i);if(f)ft=f;else{const t=tiles[i];for(const a of t.nb){const b=tiles[a].nb.find(n=>n!==i&&t.nb.includes(n));if(b!=null){ft=[i,a,b];break}}}}
 const m=new THREE.Matrix4();
 ft.forEach((j,n)=>{const t=tiles[j],y=groundY(j)+0.06;m.makeTranslation(t.x,y,t.z);ghMesh.setMatrixAt(n,m);m.makeTranslation(t.x,y+0.05,t.z);ghLines.setMatrixAt(n,m)});
 ghMesh.count=ft.length;ghMesh.instanceMatrix.needsUpdate=true;
 ghLines.count=ft.length;ghLines.instanceMatrix.needsUpdate=true;
 ghMat.color.setHex(ok?0xcff6ff:0xff4a3a);ghLines.material.color.setHex(ok?0xffffff:0xff6a5a);ghLines.visible=true;
}
let hiEdges=[];
function boundaryEdges(set){
 const out=[];
 for(const i of set){const t=tiles[i];
  for(let k=0;k<6;k++){const mid=(k*60+30)*Math.PI/180;const n=hexAt(t.x+SQ3*Math.sin(mid),t.z+SQ3*Math.cos(mid));
   if(n>=0&&set.has(n))continue;
   const a0=k*Math.PI/3,a1=(k+1)*Math.PI/3,r=0.95;
   out.push([t.x+r*Math.sin(a0),t.z+r*Math.cos(a0),t.x+r*Math.sin(a1),t.z+r*Math.cos(a1),t.h]);
  }}
 return out;
}
function updHiMesh(){
 const m=new THREE.Matrix4(),d=new THREE.Object3D();let n=0;
 if(hiSet)for(const i of hiSet){const t=tiles[i];m.makeTranslation(t.x,groundY(i)+0.03,t.z);hiMesh.setMatrixAt(n++,m)}
 hiMesh.count=n;hiMesh.instanceMatrix.needsUpdate=true;
 let full=null;
 if(hiSet){const ext=new Uint8Array(tiles.length),st=[];for(const t of tiles)if((t.c===0||t.r===0||t.c===W-1||t.r===H-1)&&!hiSet.has(t.i)){ext[t.i]=1;st.push(t.i)}
  while(st.length){const c=st.pop();for(const n of tiles[c].nb)if(!ext[n]&&!hiSet.has(n)){ext[n]=1;st.push(n)}}
  full=new Set();for(const t of tiles)if(!ext[t.i])full.add(t.i)}
 hiEdges=full?boundaryEdges(full):[];let e=0;
 for(const[x0,z0,x1,z1,h]of hiEdges){const tx=x1-x0,tz=z1-z0,L=Math.hypot(tx,tz);d.position.set((x0+x1)/2,heightAt((x0+x1)/2,(z0+z1)/2)+0.07,(z0+z1)/2);d.rotation.set(0,Math.atan2(-tz,tx),0);d.scale.set(L+0.1,1,1);d.updateMatrix();edgeMesh.setMatrixAt(e++,d.matrix)}
 edgeMesh.count=e;edgeMesh.instanceMatrix.needsUpdate=true;
}


