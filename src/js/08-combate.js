// ================= COMBAT =================
const lvOf=e=>(e.kind==='u'&&isAir(e))?-1:tiles[e.tile].lv;
function hAdv(a,b){const la=lvOf(a),lb=lvOf(b);if(la<0||lb<0)return 0;return Math.sign(la-lb)}
const effR=(a,t,r)=>r+(hAdv(a,t)>0?1:0)+(a.kind==='b'&&(a.lvl||1)>=3?1:0);
function enemyNear(team,tile,atk,r,src){
 let best=null,bs=1e9;
 for(const e of ents){
  if(e.dead||e.team===team||e.boarded)continue;
  if(!atk.vs[clsOf(e)])continue;
  const d=distTo(tile,e);if(d>(src?effR(src,e,r):r))continue;
  let s=d+(e.kind==='b'?0.6:0);if(team===1&&!NET.on&&src&&src.kind==='u'){s+=(e.hp/e.max)*1.2-(atk.vs[clsOf(e)]>=1.3?0.9:0)+(e.kind==='b'?(BD[e.type].key?-0.3:0.8):0)}if(s<bs){bs=s;best=e}
 }
 return best;
}
const vpos=e=>{if(e.kind==='u'&&e.mesh&&e.mesh.visible){const q=e.mesh.position;return{x:q.x,y:q.y-(isAir(e)?1.05:0),z:q.z}}return entPos(e)};
const MUZ={titan:[1.55,0.55],mech:[0.95,0.45],sentinel:[1.1,0.35],tank:[0.45,0.7],artillery:[0.55,0.75],aa:[0.55,0.45],mlrs:[0.6,0.4],apc:[0.42,0.45],buggy:[0.45,0.3],spider:[0.3,0.3],android:[0.42,0.15]};
const _wp=new THREE.Vector3();
function memberPos(e){const ud=e.mesh&&e.mesh.userData,L=ud&&(ud.figs&&ud.figs.length>1?ud.figs.map(F=>F.f):(ud.mic&&ud.mic.bob&&ud.mic.bob.length>1?ud.mic.bob:null));
 if(!L||!e.mesh.visible)return null;const f=L[Math.floor(Math.random()*L.length)];e.mesh.updateMatrixWorld();f.getWorldPosition(_wp);return{x:_wp.x,y:_wp.y,z:_wp.z}}
const micFly=u=>u&&u.kind==='u'&&teamSp(u.team)===2&&(u.type==='heli'||u.type==='fighter');
const evasive=u=>u&&u.kind==='u'&&teamSp(u.team)===2&&(u.type==='heli'||u.type==='fighter'||u.type==='scout');
// Arrebatar: trayectoria de insecto (picada, vuelo en espiral con zigzag, lanzamiento con inercia y regreso)
function snatchFly(S,t){
 if(t<S.tD){const k=Math.max(0,t/S.tD),h=k*k*(3-2*k);return{x:S.P0.x+(S.V.x-S.P0.x)*h,y:S.P0.y+(S.V.y-S.P0.y)*k*k,z:S.P0.z+(S.V.z-S.P0.z)*h}}
 const f=t-S.tD,r=S.r,a=S.th+S.dir*f*S.w,ca=Math.cos(S.th),sa=Math.sin(S.th),dr=f*0.55,
  jx=Math.sin(f*13+S.ph)*0.16+Math.sin(f*23+S.ph*2)*0.06,jz=Math.cos(f*11+S.ph)*0.16,up=Math.min(1,f/0.9);
 return{x:S.V.x+(Math.cos(a)-ca)*r*Math.min(1,f*2.5)+ca*dr+jx,y:S.V.y+S.lift*up*up*(3-2*up)+Math.sin(f*9+S.ph)*0.12,z:S.V.z+(Math.sin(a)-sa)*r*Math.min(1,f*2.5)+sa*dr+jz};
}
function snatchRelease(S,tR){
 S.tR=tR;const p=snatchFly(S,tR),q=snatchFly(S,tR-0.06);
 let vx=(p.x-q.x)/0.06,vz=(p.z-q.z)/0.06;const vy=clamp((p.y-q.y)/0.06,-1,2),hs=Math.hypot(vx,vz),mx=2.8;if(hs>mx){vx*=mx/hs;vz*=mx/hs}
 S.F={x:p.x,y:p.y,z:p.z,vx,vy,vz};S.R={x:p.x,y:p.y-0.5,z:p.z,vx,vy,vz};
 let t=0.1,x=p.x,y=S.R.y,z=p.z;for(;t<4;t+=1/60){x=S.R.x+vx*t;z=S.R.z+vz*t;y=S.R.y+vy*t-4.6*t*t;if(y<=heightAt(x,z))break}
 S.tL=tR+t;S.L={x,z};S.tB=tR+1.25;
}
function snatchPlan(u,v){
 const a=entPos(u),b=entPos(v),um=u.mesh&&u.mesh.visible?u.mesh.position:null;
 const P0={x:um?um.x:a.x,y:um?um.y:heightAt(a.x,a.z)+2.2,z:um?um.z:a.z},gv=heightAt(b.x,b.z);
 const S={P0,V:{x:b.x,y:gv+0.6,z:b.z},th:Math.atan2(b.z-P0.z,b.x-P0.x)+(Math.random()-0.5)*1.4,dir:Math.random()<0.5?1:-1,
  ph:Math.random()*6.28,r:0.9+Math.random()*0.5,w:2.6+Math.random()*0.8,lift:2.5+Math.random()*0.7,tD:0.4};
 snatchRelease(S,S.tD+1.5+Math.random()*0.5);return S;
}
const _mzv=new THREE.Vector3();
function seedMesh(team){const g=new THREE.Group(),gm=glowMat(micGlow(TC[team]));const s=new THREE.Mesh(G.sph,gm);s.scale.set(0.2,0.17,0.2);g.add(s,P(G.sph,0x3a6a5a,0.08,0.03,0.18,0,0.1,0,0.4,0,0));scene.add(g);return g}
function fire(a,t,atk){
 const pa=vpos(a),pt=vpos(t);
 if(a.kind==='b'&&a.type==='turret'&&teamSp(a.team)===2&&a.mesh){const mz=a.mesh.userData.muz;let from;
  if(mz&&mz[0]){a.mesh.updateMatrixWorld(true);mz[0].getWorldPosition(_mzv);from={x:_mzv.x,y:_mzv.y,z:_mzv.z}}else from={x:pa.x,y:pa.y+1.4,z:pa.z};
  const d=Math.hypot(pt.x-from.x,pt.z-from.z);proj.push({k:'seed',team:a.team,src:a,tgt:t,atk,from,t:0,dur:0.55+d*0.07,arc:1.1+d*0.22,mesh:seedMesh(a.team)});a.recoil=0.3;return}
 if(evasive(t)&&Math.random()<(t.face||t.next>=0?0.35:0.15)){const r=Math.random()*6.28;tracer(pa.x,pa.y+0.4,pa.z,pt.x+Math.cos(r)*0.7,pt.y+1.05+(Math.random()-0.3)*0.6,pt.z+Math.sin(r)*0.7,a.team);a.recoil=0.15;t.dodgeV=0.35;t.dodgeA=r+Math.PI;return}
 let ya=pa.y+(a.kind==='b'?0.9:(isAir(a)?1.05:0.3)),yt=pt.y+(t.kind==='b'?0.8:(isAir(t)?1.05:0.2));
 let ox=pa.x,oz=pa.z,tx2=pt.x,tz2=pt.z;
 if(a.kind==='u'){const mp=memberPos(a),dx=pt.x-pa.x,dz=pt.z-pa.z,dl=Math.hypot(dx,dz)||1;
  if(mp){ox=mp.x+dx/dl*0.12;oz=mp.z+dz/dl*0.12;ya=mp.y+0.3}else{const mz=MUZ[a.type]||[0.3,0.2];ya=pa.y+(isAir(a)?1.0:mz[0]);ox=pa.x+dx/dl*mz[1];oz=pa.z+dz/dl*mz[1]}}
 else if(a.mesh&&a.mesh.userData.muz){const M2=a.mesh.userData.muz;a.shot=((a.shot||0)+1)%M2.length;a.mesh.updateMatrixWorld(true);M2[a.shot].getWorldPosition(_mzv);ox=_mzv.x;ya=_mzv.y;oz=_mzv.z}
 if(t.kind==='u'){const tp=memberPos(t);if(tp){tx2=tp.x;tz2=tp.z;yt=tp.y+0.22}else if(!isAir(t)){const mz=MUZ[t.type];if(mz)yt=pt.y+mz[0]*0.6}}
 tracer(ox,ya,oz,tx2,yt,tz2,a.team);
 a.recoil=0.15;muzzle(ox,ya,oz,a.team);
 applyHit(a,t,atk);
}
function applyHit(a,t,atk){
 const ex=a.kind==='u'?EXPL[a.type]:a.type==='hq'?0.9:0;if(ex){const pt=entPos(t);blastAt(a.team,pt.x,pt.z,ex*0.7)}
 const adv=hAdv(a,t),dmg=atk.dmg*atk.vs[clsOf(t)]*(adv>0?1.25:adv<0?0.75:1)*(a.kind==='b'?1+0.2*((a.lvl||1)-1):1);
 if(a.team===1&&a.kind==='u'&&AI.perf){const P=AI.perf[a.type]||(AI.perf[a.type]={d:0,l:0});P.d+=Math.min(dmg,Math.max(0,t.hp))/t.max*(t.kind==='u'?UD[t.type].cost:BD[t.type].cost)}
 t.hp-=dmg;hqHurt(t);hitFx(t,dmg);
 if(t.hp<=0){kill(t);if(ex)settleBlast();return}
 if(ex)settleBlast();
 if(t.kind==='u'&&!t.focus&&!t.path.length&&t.next<0&&UD[t.type].atk.vs[clsOf(a)]){t.focus=a;t.auto=true}
}
const hqHurt=t=>{if(t.type==='hq'&&!t.dead&&t.kamiCd<=0&&t.hp>0){t.kamiCd=12;launchKami(t)}};
const LIGHTU={rifle:1,rocket:1,sniper:1,grenadier:1,flamer:1,commando:0.9,android:0.8,buggy:0.7,drone:0.6,swarm:0.7,scout:0.6};
const EXPL={grenadier:0.7,artillery:1.1,tank:0.75,bomber:1.3,rocket:0.5,mlrs:1.0,titan:1.0,mech:0.7,gunship:0.5};
function blastAt(team,x,z,power){
 const R=1.6+power*1.0;
 for(const e of ents){if(e.dead||e.team===team||e.kind!=='u'||e.spawn>0)continue;const w=LIGHTU[e.type];if(!w)continue;const p=entPos(e);const dx=p.x-x,dz=p.z-z,d=Math.hypot(dx,dz);if(d>R)continue;
  const k=(1-d/R)*power*w;if(k<0.1)continue;let nx=dx,nz=dz;if(d<0.05){const a=Math.random()*6.28;nx=Math.cos(a);nz=Math.sin(a)}else{nx/=d;nz/=d}
  e.blastV={vx:nx*k*1.8,vz:nz*k*1.8,vy:1.8+k*2.2,spin:(Math.random()<0.5?-1:1)*(3+k*5)}}
}
const isMechE=e=>e.kind==='b'||UD[e.type].cls!=='inf';
function sparkBurst(x,y,z,n,v){for(let q=0;q<n;q++){const m=new THREE.Mesh(G.box,SPARKM[q%3]);m.scale.setScalar(0.035);m.position.set(x,y,z);scene.add(m);const b=Math.random()*6.283,w=(v||1.6)*(0.5+Math.random()*0.7);fx.push({o:m,t:0,life:0.25+Math.random()*0.3,k:'spark',vx:Math.cos(b)*w,vz:Math.sin(b)*w,vy:0.8+Math.random()*1.8,shared:1})}}
function debris(x,y,z,n,pw){for(let q=0;q<n;q++){const m=new THREE.Mesh(G.box,CHARM[q%3]);const s=0.05+Math.random()*0.08;m.scale.set(s,s*0.7,s*1.2);m.position.set(x,y,z);scene.add(m);const b=Math.random()*6.283,v=(0.8+Math.random()*2)*pw;
 fx.push({o:m,t:0,life:1.1+Math.random()*0.7,k:'chunk',vx:Math.cos(b)*v,vz:Math.sin(b)*v,vy:1.4+Math.random()*2.4*pw,spin:(Math.random()-.5)*14,shared:1})}}
function hitFx(e,dmg){
 if(e.dead||!isMechE(e)||!e.mesh||!e.mesh.visible)return;e.hitT=0.16;
 const p=entPos(e),air=e.kind==='u'&&isAir(e),y=e.kind==='b'?p.y+0.4+Math.random()*(e.big?1.5:e.foot?1.1:0.7):(air?e.mesh.position.y+0.05:p.y+0.25);
 const r=e.kind==='b'?(e.big?1.3:e.foot?0.9:0.45):0.18,a=Math.random()*6.283,x=p.x+Math.cos(a)*r,z=p.z+Math.sin(a)*r;
 sparkBurst(x,y,z,dmg>=40?5:3);
 if(e.kind==='b'&&dmg>=25&&Math.random()<0.5)debris(x,y,z,2,0.5);
}
function dmgFx(e,dt,now){
 const m=e.mesh;
 if(e.hitT>0){e.hitT-=dt;const k=Math.max(0,e.hitT)/0.16,j=(e.kind==='b'?0.07:0.05)*k;m.position.x+=(Math.random()-.5)*j;m.position.z+=(Math.random()-.5)*j;if(e.kind==='u')m.rotation.z=(Math.random()-.5)*0.14*k}
 if(!isMechE(e)||(e.kind==='b'&&(!e.built||e.bld)))return;
 const f=e.hp/e.max;
 if(!e.dOff){const n=e.kind==='b'?(e.big?3:2):1,rs=e.kind==='b'?(e.big?1.1:e.foot?0.75:0.3):0.1;e.dOff=[];
  for(let i=0;i<n;i++){const a=i*2.1+Math.random(),r=rs*(0.4+Math.random()*0.6);e.dOff.push([Math.cos(a)*r,(e.kind==='b'?(e.big?1.3:e.foot?1.15:0.7):(isAir(e)?0.1:0.3))*(0.7+Math.random()*0.4),Math.sin(a)*r])}}
 const bx=m.position.x,by=m.position.y,bz=m.position.z;
 if(f<0.66){e.smkT=(e.smkT||0)-dt;if(e.smkT<=0){e.smkT=f<0.33?0.12:0.3;const o=e.dOff[Math.floor(Math.random()*e.dOff.length)];smoke(bx+o[0],by+o[1],bz+o[2],e.kind==='b'?(e.big?0.9:0.6):0.34,2.2,f<0.33?0x303032:0x7a7e82,e.kind==='b'?0.9:0.7)}}
 const nf=f<0.33?e.dOff.length:0;e.flm=e.flm||[];
 while(e.flm.length<nf)e.flm.push(flameMesh());
 while(e.flm.length>nf)scene.remove(e.flm.pop());
 e.flm.forEach((g,i)=>{const o=e.dOff[i],s=(e.kind==='b'?(e.big?0.6:0.4):0.2)*(0.8+0.3*Math.sin(now*0.03+i*2.1)+Math.random()*0.15);g.position.set(bx+o[0],by+o[1]-0.05+s*0.5,bz+o[2]);g.scale.set(s*0.7,s*1.5,s*0.7);g.visible=m.visible});
 if(f<0.33&&Math.random()<dt*2.5){const o=e.dOff[0];sparkBurst(bx+o[0],by+o[1],bz+o[2],2,1.2)}
}
function rubble(x,y,z,r,n,tile){const g=new THREE.Group();for(let q=0;q<n;q++){const a=Math.random()*6.283,d=Math.sqrt(Math.random())*r,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,s=0.08+Math.random()*0.16;
  const m=new THREE.Mesh(q%3?G.box:decoGeo.peb,q%4===0?M(MID):CHARM[q%3]);m.scale.set(s*(q%3?1.4:2.2),s*(q%3?0.7:1.6),s*(q%3?1:2));m.position.set(px,heightAt(px,pz)+s*0.25,pz);m.rotation.set(Math.random()*0.6,Math.random()*6,Math.random()*0.6);g.add(m)}
 scene.add(g);fx.push({k:'rubble',o:g,t:0,life:45,tile,x,z,r,shared:1})}
function collapseB(e){const m=e.mesh,p=entPos(e),hgt=e.big?2.8:e.foot?2.0:1.2;
 fx.push({k:'collapse',o:m,t:0,life:e.big?2.8:2.2,y0:m.position.y,hgt,tx:(Math.random()-.5)*0.3,tz:(Math.random()-.5)*0.3,x0:m.position.x,z0:m.position.z,big:e.big||!!e.foot,shared:1});
 debris(p.x,p.y+0.6,p.z,e.big?16:e.foot?11:7,e.big?1.4:1);sparkBurst(p.x,p.y+0.8,p.z,8,2.4);
 const nr=e.big?10:6;for(let i=0;i<nr;i++){const a=i/nr*6.283,r=e.big?1.7:e.foot?1.2:0.8;smoke(p.x+Math.cos(a)*r,p.y+0.2,p.z+Math.sin(a)*r,e.big?1.0:0.7,2,0x8a8278)}
 shake=Math.max(shake,e.big?0.7:0.3);
 rubble(p.x,p.y,p.z,e.big?1.7:e.foot?1.15:0.6,e.big?26:e.foot?16:9,e.tile);
}
function wreckU(e){const m=e.mesh,ud=m.userData;ud.ring.visible=false;
 m.traverse(o=>{if(o.isMesh&&o!==ud.hit&&o!==ud.ring)o.material=CHARM[o.id%3]});
 if(isAir(e))fx.push({k:'fall',o:m,t:0,life:12,vy:0,spin:(Math.random()<0.5?-1:1)*(3+Math.random()*3),vx:(Math.random()-.5)*1.4,vz:(Math.random()-.5)*1.4,shared:1});
 else{const big=UD[e.type].cls==='mec';fx.push({k:'wreck',o:m,t:0,life:big?11:9,y0:m.position.y,shared:1,fl:flameMesh(),fs:big?0.4:0.22});debris(m.position.x,m.position.y+0.3,m.position.z,big?8:4,0.8)}
}
function settleBlast(){for(const e of ents)if(e.blastV&&!e.dead)e.blastV=null}
function damageArea(team,tile,arr){
 const c=tiles[tile];blastAt(team,c.x,c.z,arr[0]>=300?2:arr[0]>=70?1.1:0.6);
 for(const e of ents){if(e.dead||e.team===team)continue;const d=distTo(tile,e);if(d<arr.length){e.hp-=arr[d]*(e.kind==='b'?0.7:1);hqHurt(e);hitFx(e,arr[d]);if(e.hp<=0)kill(e)}}
 settleBlast();
}

const CQ=(()=>{

