// ================= SILO DEL MISIL (Centro de Control nivel 3) =================
// Humanos: silo con compuertas, riel y brazos de servicio. Micelian: vaina que crece en una copa del Árbol de la Vida.
function addSilo(e){const g=e.mesh,sp=teamSp(e.team),tc=TC[e.team];const S=new THREE.Group();S.visible=false;g.add(S);const U={sp};S.userData=U;
 if(sp===2){const CL=g.userData.CL;if(!CL)return;const[cx,hy,cz]=CL[0],gc=g.userData.glowC||new THREE.Color(0x2affc8);S.position.set(cx*1.08,hy+0.5,cz*1.08);
  const lm=new THREE.MeshBasicMaterial({color:gc,transparent:true,opacity:0.8});const stem=new THREE.Mesh(G.cyl,lm);S.add(stem);
  const gm=glowMat(gc),pod=new THREE.Group();S.add(pod);const body=new THREE.Mesh(ICOG,gm);body.scale.set(0.42,0.62,0.42);pod.add(body);
  const sh=M(0x46385a);for(let k=0;k<5;k++){const a=k*1.257;const l=new THREE.Mesh(G.box,sh);l.scale.set(0.05,0.5,0.14);l.position.set(Math.cos(a)*0.17,0.04,Math.sin(a)*0.17);l.rotation.set(Math.sin(a)*0.25,-a,-Math.cos(a)*0.25);pod.add(l)}
  const tip=new THREE.Mesh(G.sph,new THREE.MeshBasicMaterial({color:0xffffff}));tip.scale.setScalar(0.08);tip.position.y=0.32;pod.add(tip);
  const fl=[];for(let k=0;k<7;k++){const f=new THREE.Mesh(G.sph,new THREE.MeshBasicMaterial({color:gc.clone().lerp(new THREE.Color(0xffffff),0.4),transparent:true,opacity:0}));f.scale.setScalar(0.05);S.add(f);fl.push(f)}
  Object.assign(U,{stem,pod,gm,e0:gm.emissive.clone(),tip,fl,lm});e.silo=S;return}
 const a=Math.PI/6,r=1.92;S.position.set(Math.sin(a)*r,0.4,Math.cos(a)*r);S.rotation.y=a+Math.PI/2;if(g.userData.rover){g.userData.deck.add(S);S.position.set(0,1.8,-1.2);S.rotation.y=Math.PI/2}
 const CON=M(0x5d646b),DK=M(0x1d2228),ST=M(0x9aa3ab);
 // carcasa del silo: zócalo, muros y marco
 S.add(P(G.box,0x4a5158,0.62,0.06,0.98,0,0.03,0));
 for(const sx of[-1,1])S.add(P(G.box,0x5d646b,0.1,0.3,0.92,sx*0.26,0.2,0));for(const sz of[-1,1])S.add(P(G.box,0x5d646b,0.62,0.3,0.1,0,0.2,sz*0.41));
 S.add(P(G.box,0x15181b,0.42,0.02,0.72,0,0.08,0));
 for(const sx of[-1,1])S.add(P(G.box,tc,0.02,0.05,0.8,sx*0.315,0.28,0));
 // compuertas (bisagra en cada muro largo)
 const doors=[];for(const sx of[-1,1]){const h=new THREE.Group();h.position.set(sx*0.21,0.36,0);S.add(h);h.add(P(G.box,0x7d858d,0.21,0.04,0.74,-sx*0.105,0,0),P(G.box,0x23282d,0.02,0.045,0.74,-sx*0.2,0,0));
  for(let q=0;q<3;q++)h.add(P(G.box,0xd8a12a,0.18,0.046,0.04,-sx*0.105,0.002,-0.24+q*0.24));h.userData.sx=sx;doors.push(h)}
 // luces de las compuertas y de trabajo
 const dl=new THREE.MeshBasicMaterial({color:0xffb030}),wl=new THREE.MeshBasicMaterial({color:0xffd06a});
 for(const sz of[-1,1]){S.add(P(G.box,dl,0.4,0.015,0.02,0,0.36,sz*0.37))}
 const wls=[];for(const sx of[-1,1])for(const sz of[-1,1]){const m=new THREE.Mesh(G.sph,wl);m.scale.setScalar(0.045);m.position.set(sx*0.3,0.38,sz*0.44);S.add(m);wls.push(m)}
 // riel y torre de servicio con brazos
 const tw=new THREE.Group();tw.position.set(0.42,0,-0.38);S.add(tw);tw.add(P(G.box,0x3a4148,0.12,1.35,0.12,0,0.68,0));for(let q=0;q<5;q++)tw.add(P(G.box,0xd8a12a,0.13,0.025,0.13,0,0.2+q*0.27,0));
 const arms=[];for(const y of[0.62,1.02]){const am=new THREE.Group();am.position.set(0,y,0);tw.add(am);am.add(P(G.box,0x7d858d,0.34,0.05,0.06,-0.17,0,0),P(G.box,0x23282d,0.05,0.09,0.09,-0.34,0,0));arms.push(am)}
 const rail=new THREE.Group();S.add(rail);for(const sx of[-1,1])rail.add(P(G.box,0x23282d,0.02,0.02,0.7,sx*0.08,0.1,0));
 // misil: gira sobre su base (pivote en z=-0.33)
 const piv=new THREE.Group();piv.position.set(0,0.12,-0.3);S.add(piv);const ms=new THREE.Group();ms.scale.setScalar(0.78);piv.add(ms);
 ms.add(P(G.cyl,LIGHT,0.13,0.62,0.13,0,0.36,0),P(G.cone,0xd23a2a,0.13,0.2,0.13,0,0.77,0),P(G.cyl,tc,0.14,0.07,0.14,0,0.55,0),P(G.cyl,DARK,0.11,0.06,0.11,0,0.03,0));
 for(let k=0;k<4;k++)ms.add(P(G.box,DARK,0.015,0.14,0.11,Math.sin(k*1.571)*0.07,0.12,Math.cos(k*1.571)*0.07,0,k*1.571,0));
 const tipM=new THREE.MeshBasicMaterial({color:0xff2020});const tp=new THREE.Mesh(G.sph,tipM);tp.scale.setScalar(0.05);tp.position.y=0.88;ms.add(tp);
 const fl=P(G.cone,new THREE.MeshBasicMaterial({color:0xffc060,transparent:true,opacity:0.85}),0.12,0.5,0.12,0,-0.2,0,Math.PI,0,0);fl.visible=false;ms.add(fl);
 Object.assign(U,{doors,dl,wl,wls,arms,piv,ms,tipM,fl});e.silo=S}
function siloTop(hq){const S=hq.silo;if(!S)return new THREE.Vector3(tiles[hq.tile].x,tiles[hq.tile].h+2,tiles[hq.tile].z);S.updateMatrixWorld(true);return S.userData.sp===2?S.userData.pod.getWorldPosition(new THREE.Vector3()):S.userData.ms.localToWorld(new THREE.Vector3(0,0.9,0))}
function siloLaunch(tm){const h=pwrHQ(tm);if(h&&h.silo){h.silo.userData.L=0}}
function updSilos(dt){const now=performance.now()*0.001;for(const e of ents){if(e.dead||e.type!=='hq'||!e.silo)continue;const S=e.silo,U=S.userData,on=(e.lvl||1)>=3;S.visible=on;if(!on)continue;
 const tm=e.team,used=!!mslUsed[tm],c=used?0:clamp(charge[tm].missile||0,0,1);let L=U.L;if(L!=null){L+=dt;U.L=L;if(L>1.6)U.L=null}
 const st=x=>clamp(x,0,1);
 if(U.sp===2){const g1=st(c/0.25),g2=st((c-0.25)/0.25),g3=st((c-0.5)/0.25),g4=st((c-0.75)/0.25),full=c>=1;
  const len=0.12+0.55*g3,sc=used&&L==null?0:1.7*(0.25+0.25*g1+0.35*g2+0.15*g3)*(g4>0?1+0.06*g4*Math.sin(now*(6+8*g4)):1);
  U.stem.scale.set(0.05,len,0.05);U.stem.position.y=len/2;U.pod.position.y=len+0.3*sc;U.pod.scale.setScalar(Math.max(0.001,sc));U.stem.visible=!used||L!=null;
  U.gm.emissive.copy(U.e0).multiplyScalar(0.25+0.9*g2+(full?0.4+0.3*Math.sin(now*5):0));U.tip.visible=full||L!=null;
  U.fl.forEach((f,k)=>{const a=now*1.6+k*0.9,r=0.7+0.15*Math.sin(now*2+k);f.position.set(Math.cos(a)*r,U.pod.position.y+0.25*Math.sin(now*3+k*1.7),Math.sin(a)*r);f.material.opacity=full?0.5+0.5*Math.sin(now*9+k*2):0});
  if(L!=null){U.pod.position.y+=L*L*20;U.pod.visible=L<0.9;if(Math.random()<0.6){const w=U.pod.getWorldPosition(new THREE.Vector3());smoke(w.x,w.y,w.z,0.5,0.8,0x2affc8,0.1)}}else U.pod.visible=!used;
  continue}
 const g2=st((c-0.25)/0.25),g3=st((c-0.5)/0.25),g4=st((c-0.75)/0.25),full=c>=1;
 const open=L!=null?1:used?0:g2;U.doors.forEach(d=>d.rotation.z=-d.userData.sx*open*1.9);
 U.dl.color.setHex(0xffb030).multiplyScalar(used?0.08:c<0.25?0.15+0.35*c/0.25*(0.6+0.4*Math.sin(now*3)):0.55+0.45*Math.sin(now*6));
 U.wls.forEach((m,k)=>m.visible=!used&&c>=0.25&&(c>=0.5||Math.sin(now*8+k*1.6)>-0.3));
 U.piv.position.y=0.12+0.36*g3;U.piv.rotation.x=Math.PI/2*(1-g4);U.ms.visible=!used||L!=null;
 U.arms.forEach((a,k)=>a.rotation.y=-1.3*st((g4-k*0.25)/0.6));
 U.tipM.color.setHex(full&&Math.sin(now*7)>0?0xff3030:0x501010);
 if(c>0.25&&c<0.55&&!used&&Math.random()<dt*7){const w=S.localToWorld(new THREE.Vector3((Math.random()-.5)*0.3,0.45,(Math.random()-.5)*0.6));smoke(w.x,w.y,w.z,0.35,1.2,0xdfe6ea,0.5)}
 if(L!=null){U.piv.rotation.x=0;U.piv.position.y=0.48;U.ms.position.y=L*L*14;U.fl.visible=L<1.2;U.ms.visible=L<1.2;if(Math.random()<0.8){const w=U.ms.localToWorld(new THREE.Vector3(0,-0.1,0));smoke(w.x,w.y,w.z,0.7,1.2)}}else{U.ms.position.y=0;U.fl.visible=false}
}}


// ---------- Droper derribable: fuego antiaéreo, caída, reemplazo
const TRC=[];const TRM=new THREE.MeshBasicMaterial({color:0xffe08a});
function tracer(a,b){const m=new THREE.Mesh(G.sph,TRM);m.scale.set(0.05,0.05,0.5);m.position.copy(a);m.lookAt(b);scene.add(m);TRC.push({m,a:a.clone(),b:b.clone(),t:0})}
function updTracers(dt){for(let i=TRC.length-1;i>=0;i--){const T=TRC[i];T.t+=dt*4.5;if(T.t>=1){scene.remove(T.m);TRC.splice(i,1);continue}T.m.position.lerpVectors(T.a,T.b,T.t)}}
function dropFlak(D,dt){const S=D.ship;D.sc=(D.sc||0)-dt;if(D.sc>0)return;D.sc=0.25;const tl=hexAt(S.position.x,S.position.z);if(tl<0)return;let dmg=0,nt=0;
 for(const e of ents){if(e.dead||e.team===D.team)continue;let A,r;
  if(e.kind==='u'){if(e.spawn>0||e.boarded||e.carry)continue;A=UD[e.type].atk;if(!A||!(A.vs.air>0))continue;r=A.rng+(isAir(e)?0:1)}
  else{if(!e.built)continue;A=BD[e.type].atk;if(!A||!(A.vs.air>0))continue;r=bRange(e)}
  if(distTo(tl,e)>r)continue;dmg+=A.dmg*A.vs.air/A.cd*0.25;
  if(nt<3&&Math.random()<0.7){nt++;const p=entPos(e);tracer(new THREE.Vector3(p.x,(e.kind==='u'?e.mesh.position.y:p.y)+0.6,p.z),S.position.clone().add(new THREE.Vector3((Math.random()-.5)*0.5,(Math.random()-.5)*0.3,(Math.random()-.5)*0.5)))}}
 if(dmg<=0)return;D.hp-=dmg;if(S.visible)sparkBurst(S.position.x,S.position.y,S.position.z,dmg>30?5:3);
 if(D.hp<=0){if(NET.on&&NET.role==='guest')D.hp=1;else dropDown(D)}}
const CRASH=[];let CAMF=null;
function camFollowNext(){const my=DROPS.filter(d=>d.team===0);if(!my.length){CAMF=null;return false}const i=my.indexOf(CAMF);CAMF=my[(i+1)%my.length];toast(my.length>1?'Cámara siguiendo al Droper '+(my.indexOf(CAMF)+1)+'/'+my.length:'Cámara siguiendo al Droper');return true}
function camFollowTick(dt){if(!CAMF)return;const S=CAMF.ship;if(!DROPS.includes(CAMF)&&!CRASH.some(c=>c.S===S)){CAMF=null;return}const k=Math.min(1,dt*5);cam.x+=(S.position.x-cam.x)*k;const el=Math.max(0,S.position.y-heightAt(S.position.x,S.position.z));cam.z+=(S.position.z+FL*(el*0.75-1.5)-cam.z)*k}
function dropDown(D){if(NET.on&&NET.role==='host')mpEvent({e:'dd',b:D.b.id});const i=DROPS.indexOf(D);if(i>=0)DROPS.splice(i,1);const S=D.ship,b=D.b,p=S.position.clone();
 if(!D.out){const used=new Set(),t0=hexAt(p.x,p.z);D.units.forEach((u,k)=>{if(u.dead)return;const f=nearestFree(t0>=0?t0:b.tile,false,u,used);if(f<0){kill(u);return}used.add(f*2);
  u.tile=f;setOcc(f,false,u);u.boarded=false;u.post=f;u.dest=-1;u.path=[];u.spawn=0.7+k*0.45;u.from={x:p.x,z:p.z};u.hp=Math.max(1,u.hp*0.65);u.mesh.visible=true})}
 if(b.mesh&&b.mesh.userData.hatch){const H=b.mesh.userData.hatch;H.doors.forEach(d=>d.rotation.z=0);H.pad.position.y=H.pad0;H.pad.visible=false}
 b.drop=true;b.shipLv=0;b.reT=25;if(D.bar)scene.remove(D.bar.g);
 CRASH.push({S,t:0,v:new THREE.Vector3(Math.sin(D.yaw)*4,0,Math.cos(D.yaw)*4),sp:(Math.random()<.5?-1:1)*(4+Math.random()*3),team:D.team});
 toast(D.team===0?'¡Droper derribado! Reemplazo en 25 s':'¡Droper enemigo derribado!')}
function updCrash(dt){for(let i=CRASH.length-1;i>=0;i--){const C=CRASH[i],S=C.S;C.t+=dt;C.v.y-=12*dt;S.position.addScaledVector(C.v,dt);S.rotation.y+=C.sp*dt;S.rotation.z+=dt*1.6;
  if(Math.random()<0.8)smoke(S.position.x,S.position.y,S.position.z,0.7,1.6,0x303032,0.3);
  const g=heightAt(S.position.x,S.position.z);if(S.position.y<=g+0.1||C.t>6){boom(S.position.x,S.position.z,2.2,0.2);debris(S.position.x,g+0.3,S.position.z,8,1);shake=Math.max(shake,0.3);
   const tl=hexAt(S.position.x,S.position.z);if(tl>=0)damageArea(1-C.team,tl,[120,40]);scene.remove(S);CRASH.splice(i,1)}}}
function updReships(dt){for(const b of ents){if(b.dead||b.type!=='barracks'||!(b.reT>0))continue;b.reT-=dt;if(b.reT<=0){b.reT=0;b.drop=false;startArrive(b);if(b.team===0)toast('Droper de reemplazo en camino')}}}

