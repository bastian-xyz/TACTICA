// ================= ENTITIES =================
const BIG3={barracks:1,factory:1,helipad:1,ialab:1};
const distTo=(tile,e)=>e.foot?Math.min(...e.foot.map(f=>hd(tile,f))):Math.max(0,hd(tile,e.tile)-(e.big?1:0));
const footOK=(team,j,lv)=>{const t=tiles[j];return t&&t.type==='grass'&&!t.bld&&!t.gu&&!t.ramp&&t.zone<0&&t.lv===lv&&terr(team).has(j)};
function footFor(team,i){const t=tiles[i];for(const a of t.nb){if(!footOK(team,a,t.lv))continue;for(const b of tiles[a].nb){if(b!==i&&t.nb.includes(b)&&footOK(team,b,t.lv))return[i,a,b]}}return null}
const isAir=e=>e.kind==='u'&&UD[e.type].cls==='air';
const clsOf=e=>e.kind==='b'?'bld':UD[e.type].cls;
const occ=(i,air)=>air?tiles[i].au:tiles[i].gu;
const setOcc=(i,air,e)=>{if(air)tiles[i].au=e;else tiles[i].gu=e};
const passable=(i,air)=>air||(tiles[i].type!=='rock'&&tiles[i].type!=='water'&&tiles[i].type!=='litio'&&!tiles[i].bld);
let hitList=[];

const BLD_SCAF=new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.97,0.97,1,6,1));BLD_SCAF.translate(0,0.5,0);
const easeBack=k=>{const c=1.9,q=k-1;return 1+(c+1)*q*q*q+c*q*q};
function setupBuild(e){
 const g=e.mesh,inner=g.children[0],sc=g.scale.y,L=[];g.updateMatrixWorld(true);const bx=new THREE.Box3();
 for(const c of inner.children){bx.setFromObject(c);const lo=(bx.min.y-g.position.y)/sc,hi=(bx.max.y-g.position.y)/sc;L.push({o:c,y:c.position.y,sx:c.scale.x,sy:c.scale.y,sz:c.scale.z,lo,hi,d:Math.max(0.7,hi-lo+0.35),k:0});c.visible=false}
 L.sort((a,b)=>(a.lo-b.lo)||(a.hi-b.hi));
 const n=L.length,w=Math.min(0.3,Math.max(0.12,2.6/n));L.forEach((p,i)=>{p.s=n>1?i/(n-1)*(0.9-w):0;p.w=w});
 const top=Math.max(...L.map(p=>p.hi)),base=0.2,tc=TC[e.team];
 const scaf=new THREE.Group();
 const fr=new THREE.LineSegments(BLD_SCAF,new THREE.LineBasicMaterial({color:tc,transparent:true,opacity:0.55,depthWrite:false}));fr.position.y=base;fr.scale.set(1,top-base,1);scaf.add(fr);
 const scan=new THREE.Mesh(new THREE.CylinderGeometry(1.02,1.02,0.04,6,1,true),new THREE.MeshBasicMaterial({color:tc,transparent:true,opacity:0.7,side:THREE.DoubleSide,depthWrite:false}));scaf.add(scan);
 const ghost=new THREE.Mesh(new THREE.CylinderGeometry(0.97,0.97,1,6),new THREE.MeshBasicMaterial({color:tc,transparent:true,opacity:0.07,depthWrite:false}));ghost.position.y=(top+base)/2;ghost.scale.y=top-base;scaf.add(ghost);
 g.add(scaf);
 e.bld={parts:L,scaf,fr,scan,ghost,top,base,sp:0,fade:0};
}
function animBuild(e,dt){
 const B=e.bld,g=e.mesh,pr=e.built?1:e.prog;let cur=B.base;
 for(const p of B.parts){
  const k=Math.max(0,Math.min(1,(pr-p.s)/p.w));
  if(k<=0){p.o.visible=false;continue}
  p.o.visible=true;const eb=easeBack(k),xz=0.72+0.28*Math.min(1,eb);
  p.o.position.y=p.y-p.d*(1-eb);p.o.scale.set(p.sx*xz,p.sy,p.sz*xz);
  if(k<1)cur=Math.max(cur,Math.min(p.hi,p.lo+(p.hi-p.lo)*k));
  if(k>=1&&p.k<1&&!e.built){const sc=g.scale.x;if(p.lo<B.base+0.15){for(let q=0;q<3;q++){const a=q*2.1+Math.random();smoke(g.position.x+Math.cos(a)*0.8*sc,g.position.y+0.25,g.position.z+Math.sin(a)*0.8*sc,0.7,0.7)}}else sparks(g,p.hi,5)}
  p.k=k;
 }
 B.scan.position.y=cur;B.scan.material.opacity=0.45+0.3*Math.sin(performance.now()*0.012);
 if(!e.built){B.sp+=dt*14;while(B.sp>1){B.sp--;sparks(g,cur,1)}return}
 if(!B.fade){for(const p of B.parts){p.o.visible=true;p.o.position.y=p.y;p.o.scale.set(p.sx,p.sy,p.sz)}
  ping(e.tile);const sc=g.scale.x;for(let q=0;q<6;q++){const a=q*1.047;smoke(g.position.x+Math.cos(a)*0.95*sc,g.position.y+0.25,g.position.z+Math.sin(a)*0.95*sc,0.9,0.9)}}
 B.fade+=dt;const f=Math.max(0,1-B.fade/0.7);
 B.fr.material.opacity=0.55*f;B.ghost.material.opacity=0.07*f+0.25*Math.max(0,1-B.fade/0.25);B.scan.position.y=B.top+(1-f)*0.4;B.scan.material.opacity=0.7*f;
 if(f<=0){g.remove(B.scaf);B.scaf.traverse(o=>{if(o.material)o.material.dispose();if(o.geometry&&o.geometry!==BLD_SCAF)o.geometry.dispose()});e.bld=null}
}
const SPARKM=[0xffd27a,0xffffff,0xff9a3a].map(c=>new THREE.MeshBasicMaterial({color:c}));
function sparks(g,yl,n){const sc=g.scale.x;for(let q=0;q<n;q++){const a=Math.random()*6.283,r=(0.55+Math.random()*0.4)*sc;const m=new THREE.Mesh(G.box,SPARKM[q%3]);m.scale.setScalar(0.035);m.position.set(g.position.x+Math.cos(a)*r,g.position.y+yl*g.scale.y,g.position.z+Math.sin(a)*r);scene.add(m);fx.push({o:m,t:0,life:0.35+Math.random()*0.3,k:'spark',vx:Math.cos(a)*1.4,vz:Math.sin(a)*1.4,vy:1.2+Math.random()*1.8,shared:1})}}
// ---------- ROVER: el Centro de Control humano se desplaza (lento, sin límite de desnivel)
const ROVSPD=0.12;let rovArm=null;
const isRover=e=>!!(e&&!e.dead&&e.kind==='b'&&e.type==='hq'&&e.mesh.userData.rover);
const rovMoving=e=>!!(e.mv||e.rk<1||(e.mvG&&(e.rIdle||0)<1.5));
function rovFree(i,e){const t=tiles[i];if(!t||t.nb.length<6||t.type==='rock')return false;for(const j of[i,...t.nb]){const q=tiles[j];if(q.vil||q.type==='litio'||(q.bld&&q.bld!==e))return false}return true}
function rovPath(e,goal){const prev=new Map([[e.tile,-1]]),Q=[e.tile];let best=e.tile,bd=hd(e.tile,goal);
 for(let q=0;q<Q.length;q++){const c=Q[q],d=hd(c,goal);if(d<bd){bd=d;best=c}if(c===goal)break;
  for(const n of tiles[c].nb.slice().sort((x,y)=>hd(x,goal)-hd(y,goal)))if(!prev.has(n)&&rovFree(n,e)){prev.set(n,c);Q.push(n)}}
 const R=[];for(let c=best;c!==e.tile;c=prev.get(c))R.unshift(c);return R}
function rovOrder(e,goal){if(!isRover(e)||!e.built||!tiles[goal])return 0;const R=rovPath(e,goal);if(!R.length){e.mv=null;return 0}e.mv={path:R,goal,wait:0,nt:0};return R.length}
function rovStep(e,n){for(const j of[e.tile,...tiles[e.tile].nb])if(tiles[j].bld===e)tiles[j].bld=null;
 const p=entPos(e);e.rfx=p.x;e.rfz=p.z;e.rk=0;e.tile=n;for(const j of[n,...tiles[n].nb])tiles[j].bld=e;
 if(Math.hypot(tiles[n].x-p.x,tiles[n].z-p.z)>0.01)e.hdg=Math.atan2(tiles[n].x-p.x,tiles[n].z-p.z);
 terrC[e.team].t=-1;if(DECO.length)paintDeco();if(selB===e)ctxKey=''}
function rovNudge(e,n,blk){for(const u of blk){if(u.team!==e.team||u.next>=0||(u.path&&u.path.length))continue;
 let best=-1,bd=1e9;for(const t of tiles){const d0=hd(t.i,n);if(d0<2||d0>5||hd(t.i,e.tile)<2||!passable(t.i,false)||t.gu)continue;const d=hd(t.i,u.tile);if(d<bd){bd=d;best=t.i}}
 if(best>=0)orderMove([u],best)}}
function updRover(e,dt){
 if(e.rk<1){e.rIdle=0;e.rk=Math.min(1,e.rk+dt*ROVSPD);const t=tiles[e.tile],k=e.rk;e.cx=e.rfx+(t.x-e.rfx)*k;e.cz=e.rfz+(t.z-e.rfz)*k;if(e.rk<1)return}
 else e.rIdle=(e.rIdle||0)+dt;
 const mv=e.mv;if(!mv||(NET.on&&NET.role==='guest'))return;
 if(!mv.path.length){e.mv=null;if(e.team===0){toast('Centro de Control en posición');if(selB===e)ctxKey=''}return}
 let n=mv.path[0];
 if(!rovFree(n,e)){const R=rovPath(e,mv.goal);if(!R.length){e.mv=null;if(e.team===0)toast('Centro de Control detenido: paso cerrado');return}mv.path=R;n=R[0]}
 const blk=[];for(const j of[n,...tiles[n].nb]){const u=tiles[j].gu;if(u&&!u.dead&&tiles[j].bld!==e)blk.push(u)}
 if(blk.length){mv.nt-=dt;if(mv.nt<=0){mv.nt=1.5;rovNudge(e,n,blk)}mv.wait+=dt;if(mv.wait>4&&!mv.warn&&e.team===0){mv.warn=1;toast('Tropas en el camino del Centro de Control')}return}
 mv.wait=0;mv.warn=0;mv.path.shift();rovStep(e,n)}
function rovCmd(b,i){if(hd(i,b.tile)<=1)return;
 if(NET.on&&NET.role==='guest'){mpCmd({rv:i});b.mvG=1;b.rIdle=0;ping(i);toast('Centro de Control en marcha');return}
 const n=rovOrder(b,i);if(!n){toast('El Centro de Control no puede llegar ahí');return}
 ping(b.mv.path[n-1]);toast('Centro de Control en marcha · '+n+(n===1?' casilla':' casillas'))}
function rovStop(b){if(NET.on&&NET.role==='guest'){mpCmd({rs:1});b.mvG=0}else b.mv=null;toast('Centro de Control: se detiene al terminar el paso')}
const rovLink=(m,y1,z1,y2,z2)=>{const dy=y2-y1,dz=z2-z1;m.position.y=(y1+y2)/2;m.position.z=(z1+z2)/2;m.scale.z=Math.hypot(dy,dz);m.rotation.x=-Math.atan2(dy,dz)};
function rovSync(e,m,dt,now){const R=m.userData.rover,cs=Math.cos(m.rotation.y),sn=Math.sin(m.rotation.y),hs=[];let sum=0;
 if(e.hdg!=null){let d=e.hdg-m.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));m.rotation.y+=clamp(d,-0.5*dt,0.5*dt)}
 for(const W of R.wheels){const wx=m.position.x+W.x*cs+W.z*sn,wz=m.position.z-W.x*sn+W.z*cs,h=Math.max(0,heightAt(wx,wz));hs.push(h);sum+=h}
 const base=sum/6,mvg=e.rk<1;e.ry=e.ry==null?base:e.ry+(base-e.ry)*Math.min(1,dt*3);m.position.y=e.ry;
 hs.forEach((h,i)=>{const W=R.wheels[i],ty=clamp(h-e.ry,-0.85,0.45)+R.RW;W.w.position.y+=(ty-W.w.position.y)*Math.min(1,dt*8);if(mvg)W.tire.rotation.x+=dt*ROVSPD*SQ3/R.RW});
 const K=Math.min(1,dt*2.5),pt=clamp(Math.atan2((hs[2]+hs[5])/2-(hs[0]+hs[3])/2,3.5)*0.7,-0.16,0.16),rl=clamp(Math.atan2((hs[3]+hs[4]+hs[5])/3-(hs[0]+hs[1]+hs[2])/3,3.3)*0.7,-0.14,0.14);
 R.body.rotation.x+=(pt-R.body.rotation.x)*K;R.body.rotation.z+=(rl-R.body.rotation.z)*K;
 for(let sd=0;sd<2;sd++){const L=R.links[sd],F=R.wheels[sd*3].w.position.y,Mh=R.wheels[sd*3+1].w.position.y,Rh=R.wheels[sd*3+2].w.position.y,By=(Mh+Rh)/2+0.42;
  rovLink(L.fa,R.PY,R.PZ,F,1.75);rovLink(L.ra,R.PY,R.PZ,By,R.BZ);rovLink(L.bm,By,R.BZ,Mh,-0.05);rovLink(L.br,By,R.BZ,Rh,-1.75);L.bp.position.y=By}
 R.mast.rotation.y=Math.sin(now*0.0004+e.id)*0.9;
 if(mvg&&vis[e.tile]){e.dacc=(e.dacc||0)+dt*5;while(e.dacc>=1){e.dacc-=1;const W=R.wheels[(Math.random()*6)|0],wx=m.position.x+W.x*cs+W.z*sn,wz=m.position.z-W.x*sn+W.z*cs;dust(wx,heightAt(wx,wz)+0.05,wz,0.3+Math.random()*0.2,1)}}}
// ---------- REACTOR: llega en una cápsula que cae del cielo, se clava y abre sus cuatro paneles; el reactor se arma dentro
const REACT_RED=new THREE.Color(0xff2a1a),REACT_W=new THREE.Color(0xffffff);
function podStart(e){const tc=TC[e.team],g=new THREE.Group(),cap=new THREE.Group(),hin=[];g.add(cap);
 for(let k=0;k<4;k++){const a=k*Math.PI/2,o=new THREE.Group(),h=new THREE.Group();o.rotation.y=a;o.position.set(Math.sin(a)*0.25,0.1,Math.cos(a)*0.25);o.add(h);
  h.add(P(G.box,LIGHT,0.5,1.0,0.05,0,0.5,0),P(G.box,tc,0.5,0.08,0.06,0,0.76,0),P(G.box,DARK,0.5,0.2,0.06,0,0.1,0),P(G.box,DARK,0.04,0.32,0.3,0,0.86,0.15),P(G.box,0xffb030,0.3,0.03,0.055,0,0.4,0.004));cap.add(o);hin.push(h)}
 cap.add(P(G.cone,DARK,0.66,0.55,0.66,0,-0.14,0,Math.PI,0,0),P(G.box,MID,0.5,0.06,0.5,0,1.1,0));
 const fl=P(G.cone,new THREE.MeshBasicMaterial({color:0xffc060,transparent:true,opacity:0.85}),0.42,1.8,0.42,0,2.05,0);cap.add(fl);cap.position.y=26;
 e.mesh.add(g);e.pod={g,cap,hin,fl,t:0,hit:false};if(e.bld)e.bld.scaf.visible=false}
function podTick(e,dt){const Pd=e.pod,m=e.mesh,F=1.0;Pd.t+=dt;if(e.built&&Pd.t<F)Pd.t=F;const T=Pd.t;
 if(T<F){const k=T/F;Pd.cap.position.y=26*(1-k*k);Pd.fl.scale.y=1.8*(0.8+Math.random()*0.5);if(Math.random()<0.7)smoke(m.position.x,m.position.y+Pd.cap.position.y+1.8,m.position.z,0.35,0.6);return false}
 if(!Pd.hit){Pd.hit=true;Pd.cap.position.y=0;Pd.fl.visible=false;if(e.bld)e.bld.scaf.visible=true;for(let i=0;i<12;i++){const a=i*0.5236;dust(m.position.x+Math.cos(a)*0.7,m.position.y+0.08,m.position.z+Math.sin(a)*0.7,0.45,1.1)}sparks(m,0.25,10);if(vis[e.tile])shake=Math.max(shake,0.16)}
 const o=clamp((T-F-0.15)/0.8,0,1),eo=o*o*(3-2*o),r=clamp((T-F-1.7)/1.0,0,1);
 for(const h of Pd.hin){h.rotation.x=eo*1.5;h.scale.y=Math.max(0.001,1-r)}
 Pd.cap.children[4].visible=Pd.cap.children[5].visible=o<0.2;
 if(r>=1){m.remove(Pd.g);e.pod=null}return true}
function addBuilding(team,type,i,built,foot){
 const D=BD[type];
 const e={id:nextId++,kind:'b',type,team,hp:built?D.hp:D.hp*0.25,max:D.hp,tile:i,prog:built?1:0,built:!!built,cd:0,dead:false,face:null};
 tiles[i].bld=e;if(DECO.length)paintDeco();e.mesh=buildingMesh(type,TC[team],team===0?(CFG.species||0):FOESP);e.mesh.position.set(tiles[i].x,groundY(i),tiles[i].z);
 if((team===1)!==(FL<0))e.mesh.rotation.y=Math.PI;
 if(type==='hq'){e.big=true;e.kamiCd=0;for(const n of tiles[i].nb)tiles[n].bld=e;if(e.mesh.userData.rover&&tiles[HQP]&&tiles[HQC]){const o=tiles[hd(i,HQP)>hd(i,HQC)?HQP:HQC];e.hdg=Math.atan2(o.x-tiles[i].x,o.z-tiles[i].z);e.mesh.rotation.y=e.hdg}}
 if(foot){e.foot=foot;for(const f of foot)tiles[f].bld=e;e.cx=foot.reduce((a,f)=>a+tiles[f].x,0)/3;e.cz=foot.reduce((a,f)=>a+tiles[f].z,0)/3;e.mesh.position.x=e.cx;e.mesh.position.z=e.cz;e.mesh.scale.setScalar(1.55);if(type==='barracks'&&teamSp(team)!==2){e.mesh.scale.setScalar(1);let best=foot[0],bd=-1e9;for(const f of foot){const d=(tiles[f].z-e.cz)*FL;if(d>bd){bd=d;best=f}}e.mesh.rotation.y=Math.atan2(tiles[best].x-e.cx,tiles[best].z-e.cz)}if(DECO.length)paintDeco()}
 if(type!=='hq'){const L=baseLvl(team);if(L>1)applyLvl(e,L,true)}else addSilo(e);if(type==='turret')addRadar(e);
 e.mesh.userData.hit.userData.ent=e;if(!built)setupBuild(e);if(!built&&e.mesh.userData.reactor)podStart(e);scene.add(e.mesh);e.bar=makeBar(TC[team]);ents.push(e);hitList.push(e.mesh.userData.hit);return e;
}
function spawnUnit(team,k,target){
 const D=UD[k],air=D.cls==='air';
 const pr=producers(team,D.req).sort((a,b)=>hd(a.tile,target)-hd(b.tile,target))[0];
 if(!pr)return addUnit(team,k,target);
 let st=-1;
 if(air){st=tiles[pr.tile].au?nearestFree(pr.tile,true,null,null):pr.tile}
 else{const c=tiles[pr.tile].nb.filter(n=>passable(n,false)&&!tiles[n].gu&&canStep(n,n)).sort((a,b)=>hd(a,target)-hd(b,target));st=c.length?c[0]:nearestFree(pr.tile,false,null,null)}
 if(st<0)st=target;
 const u=addUnit(team,k,st);if((pr.lvl||1)>1){u.max=Math.round(u.max*(1+0.15*(pr.lvl-1)));u.hp=u.max}u.from={x:tiles[pr.tile].x,z:tiles[pr.tile].z};pr.doorT=1.5;
 if(st!==target)u.pendingDest=target;
 startAsm(u);
 return u;
}
function addUnit(team,type,i){
 const D=UD[type],air=D.cls==='air';
 const e={id:nextId++,kind:'u',type,team,hp:D.hp,max:D.hp,tile:i,next:-1,mt:0,path:[],dest:-1,focus:null,cd:0,rp:0,wait:0,spawn:1.2,dead:false,face:null,auto:false};
 if(team===0&&started&&AI.obs)AI.obs.mix[D.cls]=(AI.obs.mix[D.cls]||0)+D.cost;
 setOcc(i,air,e);e.mesh=unitMesh(type,TC[team],team===0?(CFG.species||0):FOESP);e.mesh.position.set(tiles[i].x,tiles[i].h,tiles[i].z);
 e.mesh.rotation.y=(team===0)!==(FL<0)?Math.PI:0;e.mesh.userData.hit.userData.ent=e;scene.add(e.mesh);e.bar=makeBar(TC[team]);e.post=i;ents.push(e);hitList.push(e.mesh.userData.hit);return e;
}
function kill(e){
 if(e.dead)return;if(NET.on&&NET.role==='guest'&&!NET.auth){if(e.hp<=0)e.hp=1;return}
 if(e.asm){scene.remove(e.asm.ring,e.asm.pad);for(const o of e.asm.parts){o.position.copy(o.userData.asm.p);o.visible=true}e.asm=null}e.dead=true;if(e.team===1&&e.kind==='u'&&AI.perf){const P=AI.perf[e.type]||(AI.perf[e.type]={d:0,l:0});P.l+=UD[e.type].cost}
 if(e.kind==='b'){for(const j of[e.tile,...tiles[e.tile].nb,...(e.foot||[])])if(tiles[j].bld===e)tiles[j].bld=null}
 else{const air=isAir(e);if(occ(e.tile,air)===e)setOcc(e.tile,air,null);if(e.next>=0&&occ(e.next,air)===e)setOcc(e.next,air,null)}
 const p=entPos(e);boom(p.x,p.z,e.kind==='b'?2.2:1,e.kind==='b'?1.2:(isAir(e)?1.4:0.5));
 if(e.kind==='u'&&e.blastV&&e.mesh.visible){const v=e.blastV;e.mesh.userData.ring.visible=false;
  const figs=e.mesh.userData.figs;
  if(figs&&figs.length>1){e.mesh.updateMatrixWorld();figs.forEach((F,i)=>{const wp=new THREE.Vector3();F.f.getWorldPosition(wp);const q=new THREE.Quaternion();F.f.getWorldQuaternion(q);const sc=e.mesh.scale.x*F.f.scale.x;
    scene.add(F.f);F.f.position.copy(wp);F.f.quaternion.copy(q);F.f.scale.setScalar(sc);const j=0.6+Math.random()*0.7;
    fx.push({k:'corpse',o:F.f,vx:v.vx*j+(Math.random()-0.5)*0.8,vy:v.vy*(0.7+Math.random()*0.5),vz:v.vz*j+(Math.random()-0.5)*0.8,spin:v.spin*(0.6+Math.random()*0.8),t:0,life:1.6+i*0.1,s0:sc})});scene.remove(e.mesh)}
  else fx.push({k:'corpse',o:e.mesh,vx:v.vx,vy:v.vy,vz:v.vz,spin:v.spin,t:0,life:1.7})}
 else if(e.mesh.visible&&e.kind==='b')collapseB(e);
 else if(e.mesh.visible&&isMechE(e))wreckU(e);
 else scene.remove(e.mesh);
 if(e.flm){e.flm.forEach(g=>scene.remove(g));e.flm=[]}
 scene.remove(e.bar.g);sel.delete(e);hitList=hitList.filter(h=>h!==e.mesh.userData.hit);
 if(e.kind==='b'&&BD[e.type].key)toast((e.team?'Centro de Control enemigo destruido':'¡Perdiste tu Centro de Control!'));else if(e.kind==='b'&&e.team===0)toast(BD[e.type].n+' destruido');
}
function entPos(e){
 const a=tiles[e.tile];
 if(e.kind==='b'&&e.cx!=null)return{x:e.cx,y:a.h,z:e.cz};
 if(e.kind==='b'||e.next<0)return{x:a.x,y:a.h,z:a.z};
 const b=tiles[e.next],k=e.mt,ky=k<0.35?0:k>0.65?1:(k-0.35)/0.3;return{x:a.x+(b.x-a.x)*k,y:a.h+(b.h-a.h)*ky,z:a.z+(b.z-a.z)*k};
}
const aliveOf=(team,kind)=>ents.filter(e=>!e.dead&&e.team===team&&(!kind||e.kind===kind));
const producers=(team,type)=>ents.filter(e=>!e.dead&&e.team===team&&e.kind==='b'&&e.type===type&&e.built);
const costOf=(team,k)=>{const D=BD[k]||UD[k];if(k==='turret')return D.cost+75*ents.filter(e=>!e.dead&&e.kind==='b'&&e.team===team&&e.type==='turret').length;return D.cost};
const unitCount=team=>ents.filter(e=>!e.dead&&e.team===team&&e.kind==='u'&&!e.free).length;

// territory cache
const terrC=[{t:-1,s:null},{t:-1,s:null}];
function terr(team){
 const c=terrC[team];if(c.s&&gameTime-c.t<0.3)return c.s;
 const s=new Set();
 for(const e of ents){
  if(e.dead||e.team!==team)continue;
  let r;if(e.kind==='b')r=BD[e.type].terr;else{if(e.spawn>0||isAir(e))continue;r=1}
  for(const t of tiles)if(hd(e.tile,t.i)<=r)s.add(t.i);
 }
 c.s=s;c.t=gameTime;return s;
}
function why(team,card,i){
 const t=tiles[i];if(!t)return'Casilla inválida';
 if(SUP[card])return card==='missile'&&mslUsed[team]?'Misil ya usado en esta partida':!pwrUnlocked(team,card)?pwrLockMsg(card):charge[team][card]>=1?null:card==='dropper'?'Droper en misión':'Apoyo sin cargar';
 const cost=costOf(team,card);
 if(money[team]<cost)return'Falta energía ⚡';
 if(BD[card]){
  const D=BD[card];if(t.type==='rock'||t.bld||t.gu)return'Casilla ocupada';
  if(D.onLitio){if(t.type!=='litio'||t.amt<=0)return'Debe ir sobre un campo de energía'}else if(t.type!=='grass')return'Terreno no apto';
  if(t.ramp)return'No se construye en pendientes';
  if(t.zone>=0)return'No se construye en zonas de control';
  if(!terr(team).has(i))return'Fuera de tu territorio';
  if(BIG3[card]&&!footFor(team,i))return'Necesita 3 casillas planas libres';
  return null;
 }
 const D=UD[card],air=D.cls==='air';
 if(unitCount(team)>=capOf(team))return baseLvl(team)<3?'Población llena: mejora el Centro de Control':'Población llena';
 const pr=producers(team,D.req);if(!pr.length)return'Necesitas '+BD[D.req].n;
 if(air?t.au:(!passable(i,false)||t.gu))return'Casilla no disponible';
 return terr(team).has(i)||pr.some(b=>hd(b.tile,i)<=2)?null:'Fuera de tu territorio';
}
const canPlace=(team,card,i)=>!why(team,card,i);
function cardUsable(team,card){
 if(SUP[card])return charge[team][card]>=1;
 const D=BD[card]||UD[card];if(money[team]<costOf(team,card))return false;
 if(UD[card])return producers(team,D.req).length>0&&unitCount(team)<capOf(team);
 return true;
}
function place(team,card,i){
 if(NET.on&&NET.role==='guest'&&!NET.auth){if(team===0)mpCmd({p:card,i});return}
 if(SUP[card]){usePower(team,card,i);return}
 if(BD[card]){money[team]-=costOf(team,card);addBuilding(team,card,i,false,BIG3[card]?footFor(team,i):null)}
 else{money[team]-=UD[card].cost;spawnUnit(team,card,i)}
 terrC[team].t=-1;
}

