// ================= LLEGADA DEL DROPER: vuela desde fuera del mapa a la torre del Cuartel =================
function startArrive(b){if(!b.mesh||!b.mesh.userData.hatch||b.drop||(b.shipLv||1)>=(b.lvl||1))return;b.shipLv=b.lvl;b.drop=true;
 const ship=CQ.heliModel(TC[b.team],b.lvl);ship.scale.setScalar(b.lvl>=3?1.6:1.45);scene.add(ship);
 const hw=hatchWorld(b),P0=hw.top.clone(),Hp=P0.clone().add(new THREE.Vector3(0,0.9,0));
 let cx=0,cz=0;for(const t of tiles){cx+=t.x;cz+=t.z}cx/=tiles.length;cz/=tiles.length;
 const out=new THREE.Vector3(P0.x-cx,0,P0.z-cz).normalize(),side=new THREE.Vector3(-out.z,0,out.x);
 const S0=P0.clone().addScaledVector(out,20).addScaledVector(side,8).setY(P0.y+15);
 ARRIVE.push({b,ship,t:0,P0,Hp,S0,out,yaw:Math.atan2(-out.x,-out.z),fly:3.4,dl:0})}
function arrivePath(A,t){const{S0,Hp,out}=A,F=A.fly;if(t<F){const u=io2(t/F);return bz3(S0,S0.clone().setY(Hp.y+6).addScaledVector(out,-6),Hp.clone().setY(Hp.y+2.2).addScaledVector(out,1.4),Hp,u)}return Hp.clone()}
function updArrive(dt){for(let i=ARRIVE.length-1;i>=0;i--){const A=ARRIVE[i],S=A.ship,U=S.userData,b=A.b;A.t+=dt;const t=A.t,F=A.fly;
 if(b.dead||!b.mesh||!b.mesh.userData.hatch){scene.remove(S);ARRIVE.splice(i,1);b.drop=false;continue}
 const H=b.mesh.userData.hatch,T1=F,T2=F+0.45,T3=T2+0.4,T4=T3+0.55,T5=T4+0.35;
 const open=t<F-0.8?0:t<F-0.4?sm((t-F+0.8)/0.4):t<T4?1:1-sm((t-T4)/0.3);H.doors.forEach(d=>d.rotation.z=d.userData.sx*open*1.95);
 const padY=H.pad0+(t<F-0.4?0:t<T3?0.65*sm((t-F+0.4)/0.4):t<T4?0.65*(1-sm((t-T3)/0.5)):0);H.pad.position.y=padY;H.pad.visible=open>0.02;
 (b.mesh.userData.landL||[]).forEach(L=>{const k=t>F-1.2&&t<T4?Math.max(0,Math.sin(t*14-L.q*1.2)):0.6;L.lm.color.setHex(L.sx<0?0xff2a2a:0x2aff5a).multiplyScalar(0.25+0.75*k);L.hm.opacity=0.45*k});
 const e=1/30,p=arrivePath(A,t),pa=arrivePath(A,t-e),pb=arrivePath(A,t+e),v=pb.clone().sub(pa).multiplyScalar(1/(2*e)),vh=Math.hypot(v.x,v.z);
 let pp=p;const padW=b.mesh.localToWorld(new THREE.Vector3(H.x,H.pad.position.y+0.11,H.z));if(t>=T1&&t<T2)pp=A.Hp.clone().lerp(padW,sm((t-T1)/0.45));else if(t>=T2)pp=padW;
 S.position.copy(pp);{const th=hexAt(pp.x,pp.z);S.visible=t<T4+0.25&&(b.team===0||(th>=0&&!!vis[th]));}if(vh>0.8&&t<T1-0.3)A.yaw=Math.atan2(v.x,v.z);
 const flying=t<T1-0.3;S.rotation.order='YXZ';S.rotation.set(flying?clamp(-v.y*0.02,-0.3,0.3):0,A.yaw,0);
 const fold=t<T2?1:t<T3?1-sm((t-T2)/0.4):0;const spd=t<T1?24:t<T2?14:t<T3?6:0;
 U.bl.forEach(pv=>pv.rotation.z=pv.userData.sx*(1-fold)*1.5);U.pods.forEach(pd=>pd.rotation.x=-Math.PI/2*(1-(flying?clamp(vh/4,0,1):0))*0.95*fold);
 U.jets.forEach(j=>{const k=Math.min(1,spd/22);j.scale.set(1,0.2+k*1.05,1);j.visible=spd>1&&S.visible});U.skids.forEach(k=>k.scale.y=flying?0.15:1);
 if(spd>3&&t>T1-0.4&&t<T3&&(A.dl-=dt)<=0){A.dl=0.06;const a=Math.random()*6.28;dust(pp.x+Math.cos(a)*0.25,padY>0?padW.y-0.1:pp.y-0.2,pp.z+Math.sin(a)*0.25,0.35+Math.random()*0.25,0.9)}
 if(t>T5){scene.remove(S);H.pad.visible=false;H.pad.position.y=H.pad0;b.drop=false;ARRIVE.splice(i,1);if(b.team===0)toast(b.lvl>=3?'El Relevo en su torre':'Droper en su torre: listo')}}}
// ---------- Radar de torreta (base nivel 3): marca movimiento enemigo en el minimapa, sin visión
const RADR=7;
function addRadar(e){const g=e.mesh,R=new THREE.Group();R.visible=false;g.add(R);const U=R.userData;
 if(teamSp(e.team)===2){const gc=new THREE.Color(0x2affc8),gm=glowMat(gc);U.f=[];for(const sx of[-1,1]){const a=new THREE.Group();a.position.set(sx*0.14,1.55,-0.1);R.add(a);a.add(P(G.cyl,0x4a3078,0.035,0.55,0.035,0,0.27,0,0,0,sx*0.25));const tip=new THREE.Mesh(G.sph,gm);tip.scale.setScalar(0.09);tip.position.set(-sx*0.07,0.55,0);a.add(tip);a.userData.sx=sx;U.f.push(a)}U.gm=gm;U.e0=gm.emissive.clone()}
 else{R.position.set(-0.42,0.78,-0.32);R.add(P(G.cyl,DARK,0.07,0.75,0.07,0,0.37,0),P(G.cyl,MID,0.16,0.06,0.16,0,0.75,0));const sp=new THREE.Group();sp.position.y=0.8;R.add(sp);
  sp.add(P(G.box,LIGHT,0.62,0.05,0.07,0,0.03,0),P(G.box,DARK,0.07,0.1,0.07,0,0.03,0),P(G.box,e.team===0?TC[0]:TC[1],0.64,0.02,0.02,0,0.065,0.03));const lm=new THREE.MeshBasicMaterial({color:0x8ff0ff});const l=new THREE.Mesh(G.sph,lm);l.scale.setScalar(0.04);l.position.set(0.3,0.07,0);sp.add(l);U.sp=sp;U.lm=lm}
 e.radar=R}
function updRadars(){const now=performance.now()*0.001;for(const e of ents){if(e.dead||e.type!=='turret'||!e.radar)continue;const on=e.built&&(e.lvl||1)>=3;e.radar.visible=on;if(!on)continue;const U=e.radar.userData;
 if(U.sp){U.sp.rotation.y=now*2.2;U.lm.color.setHex(Math.sin(now*9)>0?0x8ff0ff:0x1a4a55)}else{U.f.forEach((a,k)=>{a.rotation.z=a.userData.sx*(0.15+0.12*Math.sin(now*3+k*1.7));a.rotation.x=0.15*Math.sin(now*2.3+k)});U.gm.emissive.copy(U.e0).multiplyScalar(0.6+0.5*Math.sin(now*4))}}}
const radarOn=tm=>ents.filter(e=>!e.dead&&e.team===tm&&e.type==='turret'&&e.built&&(e.lvl||1)>=3);
const SHM=new THREE.MeshBasicMaterial({color:0xffd27a});
function shellMesh(){const m=new THREE.Mesh(G.sph,SHM);m.scale.set(0.2,0.2,0.45);m.visible=false;scene.add(m);return m}
const DUST={pool:[],i:0,col:new THREE.Color(0x9a8a70)};
function dust(x,y,z,s,life){let d=DUST.pool[DUST.i];if(!d){const m=new THREE.Mesh(G.sph,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false,opacity:0}));m.visible=false;scene.add(m);d=DUST.pool[DUST.i]={m,t:1,life:1}}
 DUST.i=(DUST.i+1)%200;d.m.position.set(x,y,z);d.m.material.color.copy(DUST.col);d.t=0;d.life=life;d.s=s;d.vx=(Math.random()-.5)*0.5*s;d.vz=(Math.random()-.5)*0.5*s;d.vy=0.18+Math.random()*0.25;d.m.visible=true}
function updDust(dt){for(const d of DUST.pool){if(d.t>=d.life){if(d.m.visible)d.m.visible=false;continue}d.t+=dt;const k=Math.min(1,d.t/d.life);d.m.position.x+=d.vx*dt;d.m.position.z+=d.vz*dt;d.m.position.y+=d.vy*dt*(1-k);
 d.m.scale.set(d.s*(0.45+k),d.s*(0.3+k*0.55),d.s*(0.45+k));d.m.material.opacity=0.38*(1-k)*Math.min(1,k*6)}}
const DUSTB={titan:[16,0.75,1.4],mech:[9,0.42,1],sentinel:[9,0.45,1],tank:[10,0.4,1],artillery:[9,0.38,1],mlrs:[9,0.38,1],apc:[9,0.4,1],aa:[8,0.36,1],buggy:[10,0.3,0.8],spider:[6,0.22,0.6],android:[3,0.14,0.5]};
function smoke(x,y,z,s,life,col,vy){const m=new THREE.Mesh(G.sph,new THREE.MeshBasicMaterial({color:col||0x9aa3ab,transparent:true,opacity:0.5,depthWrite:false}));m.position.set(x,y,z);m.scale.setScalar(s*0.4);scene.add(m);fx.push({o:m,t:0,life,k:'smoke',s,vy})}
const _tv=new THREE.Vector3();
function flyStrike(s,t){
 const seen=s.team===0||s.dfn===0||vis[s.tile];
 if(s.k==='missile'){
  if(s.im){const L0=2.45;if(s.t>L0)s.im.visible=false;else{const u=clamp((L0-s.t)/(L0-s.ix),0,1),e=u*u*(1.6-0.6*u),a=s.sp,b2=s.mp;
    const c1=a.clone().setY(a.y+10),c2=b2.clone().add(new THREE.Vector3(0,-6,0)),q=bz3(a,c1,c2,b2,e),q2=bz3(a,c1,c2,b2,Math.min(1,e+0.03));
    s.im.position.copy(q);s.im.lookAt(q2);s.im.visible=true;if(Math.random()<0.95)smoke(q.x,q.y,q.z,0.8,1.0)}}
  const D=2.4;if(s.t>D){s.mesh.visible=false;return}
  const p=1-s.t/D,e=p*p,sx=t.x+9,sy=48,sz=t.z-14;
  const x=sx+(t.x-sx)*e,y=sy+(t.h-sy)*e,z=sz+(t.z-sz)*e;
  s.mesh.position.set(x,y,z);_tv.set(t.x,t.h,t.z);s.mesh.lookAt(_tv);s.mesh.visible=seen;
  if(seen&&Math.random()<0.9)smoke(x,y,z,0.9,1.1);
 }else if(s.k==='shell'){
  const D=0.75;if(s.t>D){s.mesh.visible=false;return}
  const p=1-s.t/D,ox=(s.team?1:-1)*5,oz=(s.team?-1:1)*7;
  const x=t.x+ox*(1-p),z=t.z+oz*(1-p),y=t.h+22*(1-p)*(1-p)+3*Math.sin(p*Math.PI)*(1-p);
  s.mesh.position.set(x,y,z);_tv.set(t.x,t.h,t.z);s.mesh.lookAt(_tv);s.mesh.visible=seen;
  if(seen&&Math.random()<0.5)smoke(x,y,z,0.4,0.5);
 }
}
let proj=[];
const RKM=[new THREE.MeshLambertMaterial({color:0xcfd6dc}),new THREE.MeshBasicMaterial({color:0xffc060})];
function rocketMesh(){const g=new THREE.Group(),b=new THREE.Group();b.rotation.x=Math.PI/2;g.add(b);b.add(P(G.cyl,RKM[0],0.09,0.45,0.09,0,0,0),P(G.cone,0xd23a2a,0.09,0.16,0.09,0,0.3,0),P(G.cone,RKM[1],0.08,0.22,0.08,0,-0.32,0,Math.PI));scene.add(g);return g}
function kamiMesh(team){const g=new THREE.Group();g.add(P(G.oct,TC[team],0.22,0.1,0.26,0,0,0),P(G.box,DARK,0.34,0.02,0.03,0,0.02,0,0,0.785),P(G.box,DARK,0.34,0.02,0.03,0,0.02,0,0,-0.785),P(G.sph,0xff4040,0.05,0.05,0.05,0,0,0.12));scene.add(g);return g}
function hqFire(b,t){
 const m=b.mesh,sl=m.userData.slots;b.si=((b.si||0)+1)%sl.length;m.updateMatrixWorld();
 const from=m.localToWorld(sl[b.si].clone());proj.push({k:'msl',team:b.team,src:b,tgt:t,from,t:0,dur:0.95,mesh:rocketMesh()});
}
function launchKami(b){
 const m=b.mesh;m.updateMatrixWorld();
 for(const v of m.userData.bays){const p=m.localToWorld(v.clone());const mesh=kamiMesh(b.team);mesh.position.copy(p);proj.push({k:'kami',team:b.team,home:b,mesh,life:9,tgt:null,age:0})}
 if(b.team===0)toast('Drones kamikaze desplegados');
}
const _pv=new THREE.Vector3();
function projTarget(t){const p=entPos(t);return{x:p.x,y:heightAt(p.x,p.z)+(t.kind==='b'?0.9:isAir(t)?1.1:0.35),z:p.z}}
function updProj(dt){
 for(const p of proj){
  if(p.k==='seed'){
   p.t+=dt;const k=Math.min(1,p.t/p.dur);if(!p.tgt.dead)p.last=projTarget(p.tgt);const tp=p.last||p.from;
   const x=p.from.x+(tp.x-p.from.x)*k,z=p.from.z+(tp.z-p.from.z)*k,y=p.from.y+(tp.y-p.from.y)*k+Math.sin(k*Math.PI)*p.arc;
   p.mesh.position.set(x,y,z);p.mesh.rotation.x+=dt*9;p.mesh.rotation.y+=dt*5;const h=hexAt(x,z);p.mesh.visible=p.team===0||(h>=0&&!!vis[h]);
   if(k>=1){if(!p.tgt.dead)applyHit(p.src,p.tgt,p.atk);if(p.mesh.visible){const gy=heightAt(tp.x,tp.z);for(let q=0;q<4;q++)smoke(tp.x+(Math.random()-.5)*0.5,Math.max(gy+0.1,tp.y-0.1)+Math.random()*0.2,tp.z+(Math.random()-.5)*0.5,0.45+Math.random()*0.3,0.7,0x6affc0,0.5);dust(tp.x,gy+0.05,tp.z,0.35,0.8)}p.done=true}
  }else if(p.k==='msl'){
   p.t+=dt;const k=Math.min(1,p.t/p.dur);if(!p.tgt.dead)p.last=projTarget(p.tgt);const tp=p.last||p.from;
   const x=p.from.x+(tp.x-p.from.x)*k,z=p.from.z+(tp.z-p.from.z)*k,y=p.from.y+(tp.y-p.from.y)*k+Math.sin(k*Math.PI)*2.2;
   const k2=Math.min(1,k+0.03);_pv.set(p.from.x+(tp.x-p.from.x)*k2,p.from.y+(tp.y-p.from.y)*k2+Math.sin(k2*Math.PI)*2.2,p.from.z+(tp.z-p.from.z)*k2);
   p.mesh.position.set(x,y,z);p.mesh.lookAt(_pv);const h=hexAt(x,z);p.mesh.visible=p.team===0||(h>=0&&!!vis[h]);
   if(p.mesh.visible&&Math.random()<0.7)smoke(x,y,z,0.35,0.6);
   if(k>=1){if(!p.tgt.dead){const D=BD.hq.atk;applyHit(p.src,p.tgt,D.atk?D.atk:D)}boom(tp.x,tp.z,0.9,tp.y-heightAt(tp.x,tp.z));p.done=true}
  }else{
   p.life-=dt;p.age+=dt;const home=p.home;
   if(!p.tgt||p.tgt.dead){p.tgt=null;if(!home.dead){let bd=8;for(const e of ents){if(e.dead||e.team===p.team||e.kind!=='u')continue;const d=hd(e.tile,home.tile);if(d<bd){bd=d;p.tgt=e}}}}
   const pos=p.mesh.position;
   if(p.age<0.5){pos.y+=dt*2.2}
   else if(p.tgt){const tp=projTarget(p.tgt);_pv.set(tp.x-pos.x,tp.y-pos.y,tp.z-pos.z);const d=_pv.length();
    if(d<0.35){damageArea(p.team,p.tgt.tile,[70,25]);boom(pos.x,pos.z,0.9,pos.y-heightAt(pos.x,pos.z));p.done=true}
    else{_pv.multiplyScalar(Math.min(d,dt*5.5)/d);pos.add(_pv);p.mesh.lookAt(tp.x,tp.y,tp.z)}}
   else{pos.y+=dt*1.5;if(p.life>1.2)p.life=1.2}
   p.mesh.rotation.z+=dt*8;
   if(p.life<=0&&!p.done){boom(pos.x,pos.z,0.5,pos.y-heightAt(pos.x,pos.z));p.done=true}
   const h=hexAt(pos.x,pos.z);p.mesh.visible=p.team===0||(h>=0&&!!vis[h]);
  }
  if(p.done)scene.remove(p.mesh);
 }
 proj=proj.filter(p=>!p.done);
}
function updStrikes(dt){
 for(const s of strikes){
  s.t-=dt;const t=tiles[s.tile];
  if(s.mesh)flyStrike(s,t);
  if(s.ix!=null&&!s.done&&s.t<=s.ix){const q=s.mesh?s.mesh.position.clone():s.mp;if(s.mesh)scene.remove(s.mesh);if(s.im)scene.remove(s.im);s.mesh=s.im=null;s.done=true;
   boom(q.x,q.z,4.2,q.y-heightAt(q.x,q.z));for(let n=0;n<10;n++)smoke(q.x+(Math.random()-.5)*3,q.y+(Math.random()-.5)*2,q.z+(Math.random()-.5)*3,1.6,2.4,n%3?0x8a8f94:0xffb060,0.2);shake=Math.max(shake,0.35);
   strikes.push({k:'shard',team:s.team,tile:s.tile,t:1.1});if(s.dfn===0)toast('Misil interceptado: solo cae la metralla');continue}
  if(s.t<=0&&s.mesh){scene.remove(s.mesh);s.mesh=null}
  if(s.k==='sat'){
   s.age+=dt;s.beam.material.opacity=Math.min(0.55,s.age*2)*(s.t<0.4?s.t/0.4:1);s.beam.scale.x=s.beam.scale.z=0.9+Math.sin(s.age*30)*0.15;
   if(s.age>0.4)damageArea(s.team,s.tile,[90*dt,60*dt]);
   if(Math.random()<dt*12)boom(t.x+(Math.random()-.5)*1.5,t.z+(Math.random()-.5)*1.5,0.6,0.3);
   if(s.t<=0){scene.remove(s.beam);s.done=true}
  }else if(s.t<=0){
   if(s.k==='shell'){damageArea(s.team,s.tile,[80,25]);boom(t.x,t.z,1.1,0.4);shake=Math.max(shake,0.15)}
   else if(s.k==='shard'){{const hq=ents.find(e=>!e.dead&&e.kind==='b'&&e.type==='hq'&&e.team!==s.team&&distTo(s.tile,e)<=1);if(hq){hq.hp-=260;hqHurt(hq);if(hq.hp<=0)kill(hq)}}damageArea(s.team,s.tile,[240,150,70]);for(let n=0;n<7;n++)boom(t.x+(Math.random()-.5)*4,t.z+(Math.random()-.5)*4,0.9,0.3);shake=Math.max(shake,0.3)}
   else if(s.k==='missile'){{const hq=ents.find(e=>!e.dead&&e.kind==='b'&&e.type==='hq'&&e.team!==s.team&&distTo(s.tile,e)<=1);if(hq){hq.hp-=2500-450;hqHurt(hq);if(hq.hp<=0)kill(hq)}}damageArea(s.team,s.tile,[450,300,140]);boom(t.x,t.z,5.5,1.0);boom(t.x,t.z,3,2.5);shake=0.8}
   s.done=true;
  }
 }
 strikes=strikes.filter(s=>!s.done);
}

