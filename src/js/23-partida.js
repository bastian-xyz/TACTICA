// ================= GAME =================
let SEED=0;
function newGame(sv){
 for(const e of ents){scene.remove(e.mesh);scene.remove(e.bar.g);if(e.flm)e.flm.forEach(g=>scene.remove(g))}
 for(const f of fx){scene.remove(f.o);if(f.fl)scene.remove(f.fl)}BOOMS=[];for(const s of strikes){if(s.beam)scene.remove(s.beam);if(s.mesh)scene.remove(s.mesh);if(s.im)scene.remove(s.im)}for(const A of ARRIVE)scene.remove(A.ship);ARRIVE.length=0;for(const D of DROPS){scene.remove(D.ship);if(D.bar)scene.remove(D.bar.g)}DROPS.length=0;for(const C of CRASH)scene.remove(C.S);CRASH.length=0;for(const T of TRC)scene.remove(T.m);TRC.length=0;for(const p of proj)scene.remove(p.mesh);proj=[];
 ents=[];fx=[];strikes=[];hitList=[];sel.clear();selCard=null;hiSet=null;
 mycReset();gameTime=0;over=false;x2=false;money=[400,400];charge=[{},{}];mslUsed=[0,0];
 Object.assign(AI,{t:2,wave:HARD()?5:8,attacking:false,expT:-99,expU:new Set()});aiSetup();
 terrC.forEach(c=>c.t=-1);
 if(sv&&!sv.mp){CFG.planet=sv.pl;CFG.species=sv.sp}
 {const pl=SPECIES.map((S,i)=>S.st?i:-1).filter(i=>i>=0),f=CFG.foe;FOESP=sv&&sv.fs!=null?sv.fs:(typeof f==='number'&&SPECIES[f]&&SPECIES[f].st?f:pl[Math.floor(Math.random()*pl.length)])}
 if(sv&&sv.mp){PLK=sv.pl;PL=PLANETS[PLK]}else pickPlanet();applyPlanet();
 teamColors();
 setMapSize(sv?sv.sz:CFG.size);MSH=shapeFor(sv?sv.sh:CFG.shape);
 SEED=sv?sv.seed:Math.floor(Math.random()*1e9);genMap(SEED);
 vis=new Uint8Array(tiles.length);expl=new Uint8Array(tiles.length);revealT=0;
 buildTerrain();buildZoneChips();
 if(sv&&sv.guest){const h=HQP;HQP=HQC;HQC=h;const b=BASP;BASP=BASC;BASC=b}
 if(sv&&!sv.mp)restoreState(sv);else if(!(sv&&sv.guest)){addBuilding(0,'hq',HQP,true);addBuilding(1,'hq',HQC,true)}
 updFog();
 cam.x=tiles[HQP].x;cam.z=tiles[HQP].z-3*FL;cam.dist=30;updCam();
 resizeMini();for(const c in cardEls)cardEls[c].classList.remove('sel');updSel();
}
// ---------- guardar / continuar partida
function saveGame(){
 if(!started||over||NET.on)return;
 try{const ai={};for(const k in AI){const v=AI[k];if(v instanceof Set)continue;if(k==='prof'){ai.prof=Object.keys(AIPROF).find(p=>AIPROF[p]===v);continue}ai[k]=v}
  const st={v:VERSION,mg:MAPGEN,t:Date.now(),seed:SEED,pl:PLK,sz:MSZ,sh:MSH,sp:CFG.species||0,fs:FOESP,gt:gameTime,x2,money,charge,mu:mslUsed,ai,
   amt:tiles.map(t=>t.type==='litio'?Math.round(t.amt):-1),expl:Array.from(expl).join(''),zones:zones.map(z=>[z.own,z.cap]),
   ents:ents.filter(e=>!e.dead).map(e=>e.kind==='b'?{k:'b',ty:e.type,tm:e.team,ti:e.tile,f:e.foot||null,hp:e.hp,mx:e.max,b:e.built?1:0,p:e.prog,l:e.lvl||1}
    :{k:'u',ty:e.type,tm:e.team,ti:e.tile,hp:e.hp,mx:e.max,ps:e.post})};
  localStorage.setItem('tactica.save',JSON.stringify(st))}catch(e){}
}
const loadSave=()=>{try{const s=JSON.parse(localStorage.getItem('tactica.save')||'null');return s&&s.seed!=null&&s.mg===MAPGEN?s:null}catch(e){return null}};
const clearSave=()=>{try{localStorage.removeItem('tactica.save')}catch(e){}};
function restoreState(sv){
 gameTime=sv.gt||0;x2=!!sv.x2;money=sv.money||[400,400];charge=sv.charge||[{},{}];mslUsed=sv.mu||[0,0];
 if(sv.ai){const a=sv.ai;for(const k in a){if(k==='prof')AI.prof=AIPROF[a.prof]||AI.prof;else AI[k]=a[k]}AI.expU=new Set()}
 if(sv.amt)sv.amt.forEach((v,i)=>{if(v>=0&&tiles[i]&&tiles[i].type==='litio')tiles[i].amt=v});
 if(sv.expl&&sv.expl.length===tiles.length)for(let i=0;i<tiles.length;i++)expl[i]=sv.expl.charCodeAt(i)===49?1:0;
 if(sv.zones)sv.zones.forEach((z,i)=>{const Z=zones[i];if(Z){Z.own=z[0];Z.cap=z[1];const c=Z.own<0?0x8996a4:TC[Z.own];Z.lmat.color.setHex(c);Z.mat.color.setHex(c);Z.mat.emissive.setHex(Z.own<0?0x333a42:c).multiplyScalar(0.35)}});
 for(const d of sv.ents||[]){
  if(d.k==='b'){if(!BD[d.ty])continue;const e=addBuilding(d.tm,d.ty,d.ti,!!d.b||d.ty==='hq',d.f||undefined);e.max=d.mx;e.hp=d.hp;e.lvl=d.l;if(!e.built)e.prog=d.p||0;cuartelRefresh(e)}
  else{if(!UD[d.ty])continue;const t=tiles[d.ti];if(!t)continue;const air=UD[d.ty].cls==='air';if(occ(d.ti,air))continue;const e=addUnit(d.tm,d.ty,d.ti);e.max=d.mx;e.hp=d.hp;e.post=d.ps!=null?d.ps:d.ti;e.spawn=0}}
 tiles.forEach((t,i)=>{if(t.crys)t.crys.forEach(m=>m.visible=!!expl[i]&&t.amt>0)});
 paintTiles();drawTerrMini();
}
function resumeGame(){const sv=loadSave();if(!sv)return;showScr(null);buildCards();newGame(sv);started=true;paused=false;over=false;last=performance.now();toast('Partida retomada · '+PL.n)}
setInterval(saveGame,4000);
document.addEventListener('visibilitychange',()=>{if(document.hidden)saveGame()});
addEventListener('pagehide',saveGame);
function applyPlanet(){{const pb=(PL.deco&&PL.deco.peb)||[0x9a8a70];DUST.col.setHex(pb[0]).lerp(new THREE.Color(0xffffff),0.2)}
 scene.background.setHex(PL.sky);scene.fog.color.setHex(PL.fog);
 hemi.color.setHex(PL.hemi[0]);hemi.groundColor.setHex(PL.hemi[1]);hemi.intensity=PL.hemi[2];sun.color.setHex(PL.sun[0]);sun.intensity=PL.sun[1];
 for(const k of['grass','dirt','stone','rock'])COL[k].setHex(PL.col[k]);
 TU.uCau.value.set(...PL.liq.cau);TU.uGlow.value.set(...PL.liq.glow);TU.uF1.value.set(...PL.liq.f1);TU.uF2.value.set(...PL.liq.f2);
 $('mapLbl').textContent='MAPA · '+PL.n.toUpperCase()+' · ARRASTRA PARA NAVEGAR';
}
function sim(dt){
 gameTime+=dt;
 if(!x2&&gameTime>=180){x2=true;toast('⚡ Energía ×2')}
 for(const e of ents){if(e.dead)continue;if(e.kind==='u')updUnit(e,dt);else{updBuilding(e,dt);if(e.mv||e.rk<1)updRover(e,dt)}}
 updZones(dt);updDrops(dt);updStrikes(dt);updSilos(dt);updRadars();updProj(dt);
 if(ents.some(e=>e.dead))ents=ents.filter(e=>!e.dead);
 if(!NET.on){AI.t-=dt;if(AI.t<=0){AI.t=HARD()?0.6:1.2;aiThink()}}
 const pb=aliveOf(0,'b').filter(b=>BD[b.type].key).length,cb=aliveOf(1,'b').filter(b=>BD[b.type].key).length;
 if((!pb||!cb)&&NET.on){if(NET.role==='host'||NET.synced)mpEnd(!!pb,pb||cb?'':'EMPATE');return}
 if(!pb||!cb){over=true;clearSave();const lrn=aiLearn(!pb);$('endT').textContent=cb?'DERROTA':'VICTORIA';$('endT').style.color=cb?TCS[1]:TCS[0];
  $('endS').innerHTML='Tiempo '+$('clock').textContent+' · v'+VERSION+(lrn?'<br><small style="opacity:.75">'+lrn+'</small>':'');setTimeout(()=>$('ovEnd').classList.remove('hide'),900)}
}
// pose compartida de infantería: piernas, rodillas, brazos, codos y balanceo
// arma en las manos: puntos de agarre por tipo (empuñadura g1, guardamanos g2) y altura al apuntar
const WGRIP={def:{g1:[0,-0.02,0.02],g2:[0,-0.01,0.09],ay:0.1},rocket:{g1:[0.03,0.075,-0.02],g2:[0.03,0.075,0.07],ay:0.02},sniper:{g1:[0,-0.012,-0.02],g2:[0,-0.012,0.08],ay:0.1},flamer:{g1:[0,-0.01,0],g2:[0,-0.01,0.09],ay:0.08},gren:{g1:[0,-0.03,-0.03],g2:[0,-0.02,0.06],ay:0.1},android:{g1:[0,-0.015,0],g2:[0,-0.015,0.09],ay:0.1}};
const _gv=new THREE.Vector3();
// IK de dos huesos: hombro + codo para llevar la mano al punto t (espacio del torso)
function ik2(A,t){const L=A.userData.L,kn=A.userData.kn;if(!L||!kn)return;const a=L[0],b=L[1];
 let dx=t.x-A.position.x,dy=t.y-A.position.y,dz=t.z-A.position.z;const d=Math.hypot(dx,dy,dz)||1e-4,dm=Math.min(d,(a+b)*0.999);dx/=d;dy/=d;dz/=d;
 const el=Math.PI-Math.acos(clamp((a*a+b*b-dm*dm)/(2*a*b),-1,1)),al=Math.acos(clamp((a*a+dm*dm-b*b)/(2*a*dm),-1,1));
 A.rotation.z=Math.asin(clamp(dx,-1,1));A.rotation.x=Math.atan2(-dz,-dy)+al;A.rotation.y=0;kn.rotation.x=-el}
function figArms(F,dt,run,aim,rc){if(F.mech||!F.gun)return;const g=F.gun,W=WGRIP[F.kind]||WGRIP.def,k=Math.min(1,dt*9);
 let p,r;if(F.kind==='rocket'&&!aim){p=[0.02,W.ay,0];r=[-0.25,0]}else if(aim){p=[0.02,W.ay,0.02-rc*0.025];r=[-rc*0.12,0]}else if(run){p=[0,0.06,0.05];r=[0.35,-0.75]}else{p=[0.03,0.05,0.05];r=[0.5,-0.15]}
 g.position.x+=(p[0]-g.position.x)*k;g.position.y+=(p[1]-g.position.y)*k;g.position.z+=(p[2]-g.position.z)*k;g.rotation.x+=(r[0]-g.rotation.x)*k;g.rotation.y+=(r[1]-g.rotation.y)*k;g.rotation.z=0;
 g.updateMatrix();
 _gv.set(W.g1[0],W.g1[1],W.g1[2]).applyMatrix4(g.matrix);ik2(F.armR,_gv);
 _gv.set(W.g2[0],W.g2[1],W.g2[2]).applyMatrix4(g.matrix);ik2(F.armL,_gv);
}
// giro: la cadera sigue al objetivo a medias y los hombros completan el giro
function figYaw(F,dt,w){const ff=F.f,up=ff.userData.up,k=Math.min(1,dt*8);
 if(w==null){ff.rotation.y*=0.85;if(up)up.rotation.y*=0.85;return}
 const a=Math.atan2(Math.sin(w),Math.cos(w));
 ff.rotation.y+=(a*0.4-ff.rotation.y)*k;
 if(up)up.rotation.y+=(a*0.6-up.rotation.y)*Math.min(1,dt*12);
}
function figPose(F,dt,run,aim,spd){
 const dm={rotation:{x:0}},k=Math.min(1,dt*10),kl=F.legL.userData.kn||dm,kr=F.legR.userData.kn||dm,ka=F.armL.userData.kn||dm,kb=F.armR.userData.kn||dm;
 if(run){F.ph+=dt*spd*11;const sn=Math.sin(F.ph);
  F.legL.rotation.x=sn*0.75;F.legR.rotation.x=-sn*0.75;
  kl.rotation.x=Math.max(0,-sn)*1.1;kr.rotation.x=Math.max(0,sn)*1.1;
  F.f.position.y=Math.abs(Math.cos(F.ph))*0.025;
  F.f.rotation.z=sn*0.04;F.f.rotation.x+=(0.07-F.f.rotation.x)*k;
  if(aim){F.armL.rotation.x+=(-1.45-F.armL.rotation.x)*k;F.armR.rotation.x+=(-1.45-F.armR.rotation.x)*k;F.armL.rotation.z+=(0.3-F.armL.rotation.z)*k;F.armR.rotation.z+=(-0.3-F.armR.rotation.z)*k;ka.rotation.x+=(-0.35-ka.rotation.x)*k;kb.rotation.x+=(-1.1-kb.rotation.x)*k}
  else{F.armL.rotation.x=-sn*0.65-0.2;F.armR.rotation.x=sn*0.65-0.2;ka.rotation.x=-1.1+sn*0.2;kb.rotation.x=-1.1-sn*0.2;F.armL.rotation.z*=0.8;F.armR.rotation.z*=0.8}
 }else{
  F.legL.rotation.x*=0.8;F.legR.rotation.x*=0.8;kl.rotation.x*=0.8;kr.rotation.x*=0.8;F.f.position.y=0;F.f.rotation.z*=0.85;F.f.rotation.x*=0.85;
  if(aim){F.armL.rotation.x+=(-1.45-F.armL.rotation.x)*k;F.armR.rotation.x+=(-1.45-F.armR.rotation.x)*k;F.armL.rotation.z+=(0.3-F.armL.rotation.z)*k;F.armR.rotation.z+=(-0.3-F.armR.rotation.z)*k}else{F.armL.rotation.x+=(-0.25-F.armL.rotation.x)*k;F.armR.rotation.x+=(-0.35-F.armR.rotation.x)*k;F.armL.rotation.z*=0.85;F.armR.rotation.z*=0.85}
  ka.rotation.x+=((aim?-0.35:-0.3)-ka.rotation.x)*k;kb.rotation.x+=((aim?-1.1:-0.3)-kb.rotation.x)*k;
 }
}
const qY=new THREE.Quaternion();
function syncEnt(e,dt,now){
 if(e.boarded){e.mesh.visible=false;e.bar.g.visible=false;return}
 const p=entPos(e),m=e.mesh;
 if(e.kind==='u'&&e.spawn>0&&e.from){const k=Math.min(1,1-e.spawn/1.2),q=k*k*(3-2*k);p.x=e.from.x+(p.x-e.from.x)*q;p.z=e.from.z+(p.z-e.from.z)*q}
 const sv=visE(e);m.visible=sv;if(!sv){e.bar.g.visible=false;return}
 if(e.kind==='b'){
  m.position.x=e.cx!=null?e.cx:tiles[e.tile].x;m.position.z=e.cz!=null?e.cz:tiles[e.tile].z;
  if(m.userData.rover)rovSync(e,m,dt,now);
  if(e.pod&&!podTick(e,dt)){}else if(e.bld)animBuild(e,dt);
  if(m.userData.spin&&e.built)m.userData.spin.rotation.y+=dt*2;
  if(m.userData.reactor){const R2=m.userData.reactor,on=tiles[e.tile].amt>0,work=on&&e.built,k=0.5+0.5*Math.sin(now*0.006+e.id),col=on?R2.tc:REACT_RED;
   R2.core.scale.setScalar(0.5*(work?0.9+0.14*k:0.7));R2.cm.color.copy(col).lerp(REACT_W,work?0.35+0.2*k:0).multiplyScalar(work?1:on?0.6:0.75);
   R2.rm.color.copy(col);R2.rm.emissive.copy(col).multiplyScalar(work?0.45+0.4*k:0.12);R2.lm.color.copy(col).multiplyScalar(work?0.8+0.2*k:0.7);R2.gls.color.copy(col);
   R2.halo.visible=work;if(work){R2.halo.scale.setScalar(1.25+0.3*k);R2.hm.opacity=0.2+0.16*k}
   if(e.built){R2.r1.rotation.z+=dt*(on?1.6:0);R2.r2.rotation.z-=dt*(on?2.3:0);R2.r2.rotation.x=Math.PI/2.6+(on?Math.sin(now*0.001)*0.2:0)}
   if(e.built&&e.team===0&&R2.st===1&&!on)toast('Reactor sin mineral');R2.st=on?1:0}
  if(m.userData.flies&&e.built)updFlies(m.userData.flies,now/1000+e.id);
  if(m.userData.pulse&&e.built){const k=0.5+0.5*Math.sin(now*0.0025+e.id);for(const q of m.userData.pulse)q.m.emissive.copy(q.c).multiplyScalar(0.7+0.5*k)}
  if(m.userData.pod&&e.built)m.userData.pod.rotation.z=Math.sin(now*0.0011+e.id)*0.08;
  if(m.userData.tree&&e.built){const T2=m.userData.tree,on=e.type==='hq'||tiles[e.tile].amt>0,k=0.5+0.5*Math.sin(now*0.0025+e.id);T2.can.rotation.y=Math.sin(now*0.0006+e.id)*0.12;T2.can.position.y=(T2.y0!=null?T2.y0:2.35)+Math.sin(now*0.0012+e.id)*(T2.big?0.06:0.03);
   T2.gm.emissive.copy(T2.c1).multiplyScalar(on?0.75+0.45*k:0.3);T2.gm2.emissive.copy(T2.c2).multiplyScalar(on?0.8+0.4*k:0.35)}
  if(m.userData.dish)m.userData.dish.rotation.y+=dt*0.25;
  if(e.recoil>0)e.recoil-=dt;
  if(m.userData.brl){const B=m.userData.brl;B.position.z=B.userData.z0-Math.max(0,e.recoil||0)/0.15*0.12}
  if(m.userData.bulb){const k=Math.max(0,e.recoil||0)/0.3,br=1+Math.sin(now*0.003+e.id)*0.035,sq=k>0.5?(1-k)*2:k*2;m.userData.bulb.scale.set(br*(1+0.18*(1-sq)*(k>0?1:0)-0.12*sq),br*(1+0.18*(1-sq)*(k>0?1:0)-0.12*sq),br*(1+0.35*sq));m.userData.head.children[0].rotation.x=-0.45-0.25*sq}
  if(m.userData.door&&e.built&&!e.bld){const d=m.userData.door;let o=0;if(e.doorT>0){e.doorT-=dt;o=e.doorT>1.1?(1.5-e.doorT)/0.4:e.doorT>0.4?1:e.doorT/0.4}
   if(d.userData.ring){d.material.opacity=o*(0.45+0.35*Math.sin(now*0.02))}else d.position.y=d.userData.y0+o*d.userData.lift}
  if(m.userData.head&&e.face&&!e.face.dead){const fp=entPos(e.face);m.userData.head.rotation.y=Math.atan2(fp.x-p.x,fp.z-p.z)-m.rotation.y}
 }else{
  const air=isAir(e);{const sd=e.id*2.37,mv=e.next>=0,A=mv?(air?0.34:0.24):(air?0.22:0.14),t=now*0.001;
   const tx=Math.sin(t*0.53+sd)*0.6+Math.sin(t*1.31+sd*1.9)*0.4,tz=Math.cos(t*0.47+sd*1.3)*0.6+Math.sin(t*1.07+sd*0.7)*0.4;
   let gx=tx*A,gz=tz*A;{const T0=tiles[e.tile];let cx=0,cz=0,n=0;for(const nb of T0.nb){const o=occ(nb,air);if(o&&o!==e&&o.team===e.team){cx+=tiles[nb].x-T0.x;cz+=tiles[nb].z-T0.z;n++}}if(n){gx+=cx/n*0.3;gz+=cz/n*0.3}}
   if(e.dodge&&e.dodge.t>0){e.dodge.t-=dt;const dg=Math.sin(Math.min(1,e.dodge.t/1.1)*Math.PI)*0.42;gx+=e.dodge.x*dg;gz+=e.dodge.z*dg}
   const k=Math.min(1,dt*(e.dodge&&e.dodge.t>0?6:1.6));e.ox=(e.ox||0)+(gx-(e.ox||0))*k;e.oz=(e.oz||0)+(gz-(e.oz||0))*k;p.x+=e.ox;p.z+=e.oz}
  const smooth=UD[e.type].cls!=='inf'&&!e.knock;if(smooth){if(!e.vp||Math.hypot(e.vp.x-p.x,e.vp.z-p.z)>3)e.vp={x:p.x,z:p.z,dx:0,dz:0};const K=Math.min(1,dt*(air?4.5:6.5)),nx=e.vp.x+(p.x-e.vp.x)*K,nz=e.vp.z+(p.z-e.vp.z)*K;e.vp.dx=nx-e.vp.x;e.vp.dz=nz-e.vp.z;e.vp.x=nx;e.vp.z=nz;p.x=nx;p.z=nz}
  if(air){const ta=evasive(e)?(e.face&&!e.face.dead?1.25:2.25):1.05;e.alt=e.alt==null?ta:e.alt+(ta-e.alt)*Math.min(1,dt*1.4)}
  m.position.set(p.x,heightAt(p.x,p.z)+(air?e.alt+Math.sin(now*0.003+e.id)*0.08:0),p.z);
  if(e.fly){const S=e.fly.S,t=e.fly.t;let q,v;
   if(t<S.tR){q=snatchFly(S,t);const q2=snatchFly(S,t+0.04);v={x:(q2.x-q.x)/0.04,y:(q2.y-q.y)/0.04,z:(q2.z-q.z)/0.04}}
   else{const F=S.F,d=S.tB-S.tR,u2=Math.min(1,(t-S.tR)/d),H={x:m.position.x,y:m.position.y,z:m.position.z},h00=2*u2*u2*u2-3*u2*u2+1,h10=u2*u2*u2-2*u2*u2+u2,h01=-2*u2*u2*u2+3*u2*u2,
     d00=6*u2*u2-6*u2,d10=3*u2*u2-4*u2+1,d01=-6*u2*u2+6*u2;
    q={x:h00*F.x+h10*F.vx*d+h01*H.x,y:h00*F.y+h10*F.vy*d+h01*H.y,z:h00*F.z+h10*F.vz*d+h01*H.z};v={x:(d00*F.x+d10*F.vx*d+d01*H.x)/d,y:0,z:(d00*F.z+d10*F.vz*d+d01*H.z)/d}}
   m.position.set(q.x,q.y,q.z);e.flyV=v}else e.flyV=null
  if(e.dodgeV>0){e.dodgeV-=dt;const k=Math.sin(Math.min(1,e.dodgeV/0.35)*Math.PI)*0.45;m.position.x+=Math.cos(e.dodgeA)*k;m.position.z+=Math.sin(e.dodgeA)*k;m.rotation.z=Math.cos(e.dodgeA)*k}else if(evasive(e))m.rotation.z*=0.85
  if(e.carry){const C=e.carry,S=C.S,t=C.t;
   if(t>=S.tD&&t<S.tR){const q=snatchFly(S,t),k=Math.min(1,(t-S.tD)/0.15);m.position.x+=(q.x-m.position.x)*k;m.position.z+=(q.z-m.position.z)*k;m.position.y+=(q.y-0.5-m.position.y)*k;m.rotation.x=Math.sin(t*10)*0.35;m.rotation.z=Math.cos(t*7)*0.25}
   else if(t>=S.tR){const f=t-S.tR,R=S.R;m.position.set(R.x+R.vx*f,Math.max(heightAt(R.x+R.vx*f,R.z+R.vz*f),R.y+R.vy*f-4.6*f*f),R.z+R.vz*f);m.rotation.x=f*7;m.rotation.z=f*3*S.dir}}
  else if(e.landFx){e.landFx=0;m.rotation.x=0;m.rotation.z=0;for(let i=0;i<10;i++)dust(p.x+(Math.random()-.5)*0.6,heightAt(p.x,p.z)+0.05,p.z+(Math.random()-.5)*0.6,0.35,1.1);shake=Math.max(shake,0.12)}
  if(!air&&e.next>=0&&vis[e.tile]){const B=DUSTB[e.type]||(UD[e.type].cls==='inf'?[2.2,0.12,0.6]:[6,0.26,0.8]);e.dacc=(e.dacc||0)+dt*B[0];
   while(e.dacc>=1){e.dacc-=1;const r=e.mesh.rotation.y,bk=-0.25-B[1]*0.6,sd=(Math.random()-.5)*B[1]*2.2,x=p.x+Math.sin(r)*bk+Math.cos(r)*sd,z=p.z+Math.cos(r)*bk-Math.sin(r)*sd;dust(x,heightAt(x,z)+0.05,z,B[1]*(0.8+Math.random()*0.5),B[2]*(0.8+Math.random()*0.4))}}
  if(e.knock){const K=e.knock;K.t+=dt;const ph=Math.min(1,K.t/K.dur),tt=K.t;const hy=Math.max(0,(K.dur*5.5)*tt-5.5*tt*tt);const sw=Math.sin(Math.PI*ph)*K.dur*0.5;
   m.position.x+=K.vx*sw;m.position.z+=K.vz*sw;m.position.y+=hy;m.rotation.x=ph*Math.PI*2*Math.sign(K.spin)*Math.min(1,Math.abs(K.spin)/9);m.rotation.z=Math.sin(ph*Math.PI)*0.4*Math.sign(K.spin);
   if(ph>=1){e.knock=null;m.rotation.x=0;m.rotation.z=0;smoke(m.position.x,m.position.y,m.position.z,0.35,0.5)}}
  const head=m.userData.head,tgt=e.face&&!e.face.dead?vpos(e.face):null;
  let tx=null,tz;
  if(e.next>=0){tx=tiles[e.next].x;tz=tiles[e.next].z}else if(tgt&&!head){tx=tgt.x;tz=tgt.z}
  if(e.vp&&UD[e.type].cls!=='inf'&&e.next>=0&&Math.hypot(e.vp.dx,e.vp.dz)>dt*0.05){tx=p.x+e.vp.dx;tz=p.z+e.vp.dz}
  if(tx!==null&&(Math.abs(tx-p.x)+Math.abs(tz-p.z))>0.001){let a=Math.atan2(tx-p.x,tz-p.z),d=a-m.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));const tr=UD[e.type].cls==='inf'?10:(['titan','tank','artillery','mlrs','apc','mech'].includes(e.type)?2.6:isAir(e)?3.5:4.5);m.rotation.y+=clamp(d*Math.min(1,dt*(head?6:10)),-tr*dt,tr*dt)}
  if(e.flyV&&Math.hypot(e.flyV.x,e.flyV.z)>0.2){let a=Math.atan2(e.flyV.x,e.flyV.z),d=a-m.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));m.rotation.y+=d*Math.min(1,dt*9);m.rotation.z=clamp(-d*1.4,-0.7,0.7);m.rotation.x=clamp((e.flyV.y||0)*-0.12,-0.5,0.5)}else if(e.fly===null&&isAir(e)&&!(e.dodgeV>0))m.rotation.x*=0.9
  if(head){const want=tgt?Math.atan2(tgt.x-p.x,tgt.z-p.z)-m.rotation.y:0;let d=want-head.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));head.rotation.y+=d*Math.min(1,dt*(tgt?9:3))}
  if(e.asm)asmTick(e,dt);
  const s=e.asm?1:e.spawn>0?(e.from?Math.min(1,0.55+0.45*(1-e.spawn/1.2)):Math.max(0.05,1-e.spawn/1.2)):1;m.scale.setScalar(s);
  m.userData.ring.visible=sel.has(e);
  if(m.userData.rotor)m.userData.rotor.rotation.y+=dt*28;
  if(m.userData.tail)m.userData.tail.rotation.x+=dt*40;
  if(m.userData.gat){for(const sp of[].concat(m.userData.gat))sp.rotation.z+=dt*((e.gat||0)>0?38:1.5);if(e.gat>0)e.gat-=dt}
  if(m.userData.lids){const o=(e.vls||0)>0?Math.min(1,e.vls*4):0;if(e.vls>0){e.vls-=dt;if(Math.random()<dt*20)smoke(m.position.x,m.position.y+1.3,m.position.z,0.3,0.6)}for(const l of m.userData.lids)l.rotation.x=-o*1.2}
  if(false&&m.userData.gbob){const gb=m.userData.gbob,mv=e.next>=0;if(mv)e.tph=(e.tph||0)+dt*UD[e.type].spd*7;gb.T.position.y=4.83*0.29+(mv?Math.abs(Math.sin(e.tph))*0.06:Math.sin(now*0.002)*0.01);gb.T.rotation.z=mv?Math.sin(e.tph)*0.035:gb.T.rotation.z*0.9}
  if(m.userData.tleg){const mv=e.next>=0;if(mv)e.tph=(e.tph||0)+dt*UD[e.type].spd*7;for(const L of m.userData.tleg){const sn=Math.sin((e.tph||0)+(L.sd>0?Math.PI:0));L.hip.rotation.x=mv?sn*0.38:L.hip.rotation.x*0.9;L.knee.rotation.x=mv?Math.max(0,-sn)*0.45:L.knee.rotation.x*0.9}
   m.userData.thull.position.y=0.62+(mv?Math.abs(Math.cos(e.tph||0))*0.03:Math.sin(now*0.002)*0.006)}
  if(m.userData.props)for(const r of m.userData.props)r.rotation.y+=dt*45;
  if(m.userData.radar)m.userData.radar.rotation.y+=dt*2.5;
  if(m.userData.flame){const fl=m.userData.flame;fl.scale.y=0.28*(0.8+Math.random()*0.4)*(e.next>=0?1.4:0.8)}
  if(m.userData.pods){const mv=e.next>=0;for(const P2 of m.userData.pods){P2.fan.rotation.y+=dt*38;const want=mv?-1.15:0;P2.pd.rotation.x+=(want-P2.pd.rotation.x)*Math.min(1,dt*3)}m.children[0].rotation.x=(mv?0.08:0)}
  if(m.userData.bob){const body=m.children[0];if(e.next>=0){body.position.y=Math.abs(Math.sin(now*0.025+e.id))*0.018;body.rotation.x=Math.sin(now*0.012+e.id)*0.025}else{body.position.y*=0.85;body.rotation.x*=0.85}}
  if(m.userData.figs&&e.next<0&&!e.face)for(const F of m.userData.figs)F.f.position.y=Math.sin(now*0.003+e.id*1.7)*0.006;
  if(m.userData.wheels&&e.next>=0)for(const w of m.userData.wheels)w.rotation.x+=dt*UD[e.type].spd*9;
  if(m.userData.sleg){const mv=e.next>=0;m.userData.sleg.forEach((l,i)=>{l.rotation.x=mv?Math.sin(now*0.02+i*1.7)*0.35:0})}
  {const mem=m.userData.figs&&m.userData.figs.length>1?m.userData.figs.map(F=>F.f):(m.userData.mic&&m.userData.mic.bob&&m.userData.mic.bob.length>1?m.userData.mic.bob:null);
   if(mem){const mv=e.next>=0||(e.spawn>0&&e.from),t=now*0.001;mem.forEach((f,i)=>{const u=f.userData;if(u.x0==null){u.x0=f.position.x+(Math.random()-0.5)*0.12;u.z0=f.position.z+(Math.random()-0.5)*0.12;u.sd=Math.random()*20;u.wx=0;u.wz=0}
    const A=mv?1:0.35,wx=(Math.sin(t*1.7+u.sd)*0.07+Math.sin(t*3.1+u.sd*2)*0.03)*A,wz=(Math.cos(t*1.3+u.sd*1.4)*0.1+Math.sin(t*2.6+u.sd)*0.04)*A,k=Math.min(1,dt*3);
    u.wx+=(wx-u.wx)*k;u.wz+=(wz-u.wz)*k;f.position.x=u.x0+u.wx;f.position.z=u.z0+u.wz;if(mv&&!m.userData.figs)f.rotation.y=Math.sin(t*2.2+u.sd)*0.18})}}
  if(m.userData.mic){const U=m.userData.mic,mv=e.next>=0;e.mph=(e.mph||Math.random()*6)+dt*(mv?UD[e.type].spd*(U.heavy?5:9):1.5);
   if(U.bob)U.bob.forEach((f,i)=>{f.position.y=mv?Math.abs(Math.sin(e.mph+i*1.3))*0.05:Math.sin(now*0.003+i)*0.008;f.rotation.z=mv?Math.sin(e.mph+i)*0.1:0});
   if(U.legs)U.legs.forEach((l,i)=>{l.rotation.x=mv?Math.sin(e.mph*(U.walk?1:1.6)+i*(U.walk?Math.PI:1.1))*(U.walk?0.45:0.5):0});
   if(U.walk&&mv)m.children[0].position.y=Math.abs(Math.cos(e.mph))*0.04;
   if(U.wings)U.wings.forEach(W=>{W.w.rotation.z=W.s*Math.sin(now*(W.slow?0.012:(U.fast?0.06:0.045))+(W.w.position.z*9))*(W.slow?0.45:0.5)})}
  if(m.userData.flies)updFlies(m.userData.flies,now/1000+e.id);
  if(m.userData.swarm){const sw=m.userData.swarm;sw.rotation.y+=dt*2.2;sw.children.forEach((d,i)=>{d.position.y=Math.sin(now*0.005+i)*0.08})}
  if(e.recoil>0){e.recoil-=dt;const h=m.userData.head;if(h){const k=Math.max(0,e.recoil)/0.15;h.position.z=(h.userData.z0??(h.userData.z0=h.position.z))-k*0.06}}
  if(m.userData.figs){const run=e.next>=0||(e.spawn>0&&e.from),aim=!!(e.face&&!e.face.dead);
   for(const F of m.userData.figs){
    figPose(F,dt,run,aim,UD[e.type].spd);
    figArms(F,dt,run,aim,Math.max(0,e.recoil||0)/0.15);
    figYaw(F,dt,aim&&e.face?Math.atan2(vpos(e.face).x-p.x,vpos(e.face).z-p.z)-m.rotation.y:null);
   }}
 }
 dmgFx(e,dt,now);
 const show=e.hp<e.max-0.5||sel.has(e)||(e.kind==='b'&&!e.built);
 e.bar.g.visible=show;
 if(show){const w=e.big?3:e.kind==='b'?1.6:0.8,f=clamp(e.hp/e.max,0,1);if(e.kind==='u'){const q=e.mesh.position;e.bar.g.position.set(q.x,(isAir(e)||e.carry)?q.y+0.7:p.y+(e.big?(e.mesh.userData.barY||3.1):0.8),q.z)}else e.bar.g.position.set(p.x,p.y+(e.big?(e.mesh.userData.barY||3.1):2.45),p.z);e.bar.g.quaternion.copy(camera.quaternion);e.bar.g.scale.set(w,1,1);e.bar.fg.scale.x=f;e.bar.fg.position.x=-(1-f)/2}
}
let last=performance.now(),hudT=0,miniT=0,hiT=0;
function loop(now){
 TU.uTime.value=now/1000;
 requestAnimationFrame(loop);
 const dt=Math.max(0,Math.min(0.05,(now-last)/1000));last=now;
 if(started&&!paused&&!over&&mpSimOk())sim(dt);
 mpTick(dt);
 for(const e of ents)if(!e.dead)syncEnt(e,dt,now);
 updFx(dt);pvTick(dt,now);updRoute(now);updAmbient(dt,now);
 zones.forEach(z=>(z.pyl||[]).forEach(g=>g.userData.spin.rotation.y+=dt*1.5));
 if(shake>0){shake=Math.max(0,shake-dt*1.5)}
 if(!started){const tt=now*0.00004;cam.x=Math.sin(tt)*CX*0.55;cam.z=Math.cos(tt*0.8)*CZ*0.6;cam.dist=30}
 updDust(dt);updDropIcons();uiTick();trackTick(dt);
 if(INTRO)introCam(dt);else{keyTick(dt);camFollowTick(dt);updCam()}
 if(started||$('scrMain').classList.contains('hide'))renderer.render(scene,camera);
 miniT-=dt;if(miniT<=0){miniT=1/30;drawMini()}
 hudT-=dt;if(hudT<=0){hudT=0.2;updHud();updCards()}
 if(started&&!paused&&!over&&revealT>0)revealT-=dt;
 fogT-=dt;if(fogT<=0){fogT=0.25;updFog()}
 hiT-=dt;if(hiT<=0&&selCard&&!SUP[selCard]){hiT=0.5;refreshHi()}
 if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').style.opacity=0}
}
function resize(){const r=view.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix();resizeMini()}
addEventListener('resize',applyWide);applyWide();new ResizeObserver(resize).observe(view);new ResizeObserver(resizeMini).observe(mini);

buildCards();UIREADY=true;newGame();revealT=1e9;applyCfg();showScr('scrMain');requestAnimationFrame(loop);
mpHashJoin();addEventListener('hashchange',mpHashJoin);
// aviso de versión nueva (solo en la web: en Claude la página no puede pedir archivos)
if(BUILD==='web'){const chk=()=>{fetch('version.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{if(!j||!j.version||j.version===VERSION)return;const b=$('updBan');b.textContent='Nueva versión v'+j.version+' disponible · toca para actualizar';b.classList.remove('hide');b.onclick=()=>{if(started&&!over&&!confirmUpd())return;location.reload()}}).catch(()=>{})};
 const confirmUpd=()=>{const b=$('updBan');if(b.dataset.ok){return true}b.dataset.ok=1;b.textContent='Estás en partida: toca de nuevo para actualizar igual';return false};
 setTimeout(chk,5000);setInterval(chk,300000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)chk()})}

