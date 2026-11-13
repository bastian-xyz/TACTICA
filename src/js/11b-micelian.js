// ================= BALANCE v0.77: Micelian con números y mecánicas propias (micelio, Enraizar, Germinar), fuego, daño en área, zona protegida, huellas del Rover =================
// Tropas Micelian: mismas claves que su equivalente humano, con sus propios números (más vida, menos daño; atrapan en vez de destruir)
const MUD=(()=>{const O={
 rifle:{hp:145,atk:{dmg:10}},
 sniper:{hp:125,atk:{dmg:26,cd:1.6,rng:3,vs:{inf:1.5,veh:0.5,air:1.1,bld:0.5}}},
 flamer:{hp:165,atk:{dmg:9,cd:0.5,rng:2,vs:{inf:1.5,veh:0.7,air:0,bld:1.1}}},
 grenadier:{hp:140,atk:{dmg:20}},
 buggy:{hp:240,spd:2.0,climb:1,atk:{dmg:12}},
 tank:{hp:600,spd:0.85,atk:{dmg:36,vs:{inf:0.8,veh:1.6,air:0,bld:1.3}}},
 artillery:{hp:300,atk:{dmg:48}},
 scout:{hp:120,spd:2.8,atk:{dmg:8}},
 fighter:{hp:160,atk:{dmg:27}},
 heli:{hp:210,atk:{dmg:22}},
 sentinel:{hp:330,spd:0.75,atk:{dmg:26,vs:{inf:0.9,veh:0.6,air:2.0,bld:0.4}}},
 mech:{hp:760,spd:0.75,atk:{dmg:45,cd:1.5}},
 titan:{hp:1650,spd:0.5,atk:{dmg:50}}},M={};
 for(const k in O){const B=UD[k],o=O[k],a=Object.assign({},B.atk,o.atk||{});a.vs=Object.assign({},B.atk.vs,(o.atk&&o.atk.vs)||{});
  if(o.atk&&o.atk.vs&&o.atk.vs.mec==null&&B.atk.vs.mec===B.atk.vs.veh)a.vs.mec=a.vs.veh;M[k]=Object.assign({},B,o,{atk:a})}
 return M})();
const udOf=u=>teamSp(u.team)===2&&MUD[u.type]||UD[u.type];
const supName=k=>k==='dropper'&&teamSp(0)===2?'Germinar':SUP[k].n;
// ---- micelio: anillo permanente alrededor de los edificios Micelian + parches temporales que siembran sus tropas ----
const MY={n:0,perm:[null,null],tmp:[null,null],burn:null,t:0,sig:-1};
const MYCC=[[0.10,0.85,0.66],[0.85,0.30,0.75]];
function mycReset(){MY.n=0;MY.sig=-1;for(const g of GERM)scene.remove(g.mesh);GERM.length=0;for(const m of TRK.live)m.visible=false;TRK.live.length=0}
function mycAlloc(){if(MY.n===tiles.length)return;MY.n=tiles.length;for(const t of[0,1]){MY.perm[t]=new Uint8Array(MY.n);MY.tmp[t]=new Float32Array(MY.n)}MY.burn=new Float32Array(MY.n);MY.t=0}
const mycOn=(team,i)=>MY.n===tiles.length&&teamSp(team)===2&&MY.burn[i]<=gameTime&&(MY.perm[team][i]===1||MY.tmp[team][i]>gameTime);
const mycTint=i=>MY.n!==tiles.length?-1:mycOn(0,i)?0:mycOn(1,i)?1:-1;
function mycPlant(team,i,r,sec){if(teamSp(team)!==2)return;mycAlloc();const T=MY.tmp[team],e=gameTime+sec;if(T[i]<e)T[i]=e;if(r>0)for(const n of tiles[i].nb)if(T[n]<e)T[n]=e}
function mycBurn(i){mycAlloc();MY.burn[i]=gameTime+10;MY.tmp[0][i]=0;MY.tmp[1][i]=0}
const MYR=b=>b.type==='hq'?[4,6,8][(b.lvl||1)-1]:b.type==='cocoon'?-1:2;
function updMyc(dt){
 for(let k=GERM.length-1;k>=0;k--){const g=GERM[k];g.t-=dt;const s=1-Math.max(0,g.t)/2.5;g.mesh.scale.setScalar(0.5+s*1.1);g.mesh.rotation.y+=dt*2;
  if(g.t<=0){scene.remove(g.mesh);GERM.splice(k,1);for(const u of g.units){if(u.dead)continue;const j=nearestFree(g.tile,false,u,null);u.boarded=false;if(j>=0){u.tile=j;setOcc(j,false,u)}u.next=-1;u.mt=0;u.path=[];u.dest=-1;u.post=u.tile;u.spawn=0.4;u.mesh.visible=true}
   if(g.team===1&&vis[g.tile])toast('¡Germinación enemiga!')}}
 MY.t-=dt;if(MY.t>0)return;MY.t=1;
 if(teamSp(0)!==2&&teamSp(1)!==2)return;mycAlloc();let sig=0;
 for(const tm of[0,1]){const P=MY.perm[tm];P.fill(0);if(teamSp(tm)!==2)continue;
  const bs=ents.filter(e=>!e.dead&&e.kind==='b'&&e.team===tm&&e.built&&e.type!=='cocoon');
  for(const t of tiles){if(t.type==='water'||t.type==='rock')continue;for(const b of bs)if(hd(b.tile,t.i)<=MYR(b)){P[t.i]=1;break}}
  // la Polilla quieta siembra bajo ella
  for(const u of ents)if(!u.dead&&u.kind==='u'&&u.team===tm&&u.type==='scout'&&u.next<0&&!u.path.length){mycPlant(tm,u.tile,1,3);for(const n of tiles[u.tile].nb)mycPlant(tm,n,1,3)}
  for(let i=0;i<MY.n;i++)if(mycOn(tm,i))sig+=i+1+tm*7}
 if(sig!==MY.sig){MY.sig=sig;paintTiles()}
}
function mycRegen(u,dt){if(teamSp(u.team)!==2||u.hp>=u.max)return;const air=isAir(u);if(!air&&gameTime-(u.lastC||-9)>3&&mycOn(u.team,u.tile))u.hp=Math.min(u.max,u.hp+u.max*0.015*dt)}
const mycSpd=u=>teamSp(u.team)===2&&!isAir(u)&&MY.n===tiles.length&&mycOn(u.team,u.tile)?1.15:1;
// ---- modificadores de un golpe: fuego, área, siembra, enredo ----
const AOE={grenadier:[1.0,0.5],artillery:[1.5,0.5],mlrs:[1.5,0.5],bomber:[1.5,0.5]};
function hitMods(a,t,atk){
 let k=1;a.lastC=gameTime;t.lastC=gameTime;
 if(a.kind!=='u')return k;const sp=teamSp(a.team);
 if(a.type==='flamer'&&sp!==2){if(t.type==='cocoon')k*=2;else if(teamSp(t.team)===2&&t.kind==='u')k*=1.35;mycBurn(t.tile)}
 if(sp===2){if(a.type==='sniper'||a.type==='artillery')mycPlant(a.team,t.tile,1,15);
  if(a.type==='flamer'&&t.kind==='u'&&!isAir(t)&&(t.rootCd||0)<=gameTime){t.root=2;t.rootCd=gameTime+6}}
 const A=AOE[a.type];
 if(A&&atk===udOf(a).atk){const p=entPos(t),R=A[0]*TSP(),tAir=t.kind==='u'&&isAir(t);
  for(const e of ents){if(e===t||e.dead||e.team===a.team||e.boarded)continue;const eAir=e.kind==='u'&&isAir(e);if(eAir!==tAir)continue;const m=atk.vs[clsOf(e)];if(!m)continue;
   const q=entPos(e);if(Math.hypot(q.x-p.x,q.z-p.z)>R)continue;const d=atk.dmg*m*A[1];e.hp-=d;e.lastC=gameTime;hqHurt(e);hitFx(e,d);if(e.hp<=0){e.killer=a;kill(e)}}}
 return k}
// ---- Enraizar: lo que matan los Micelian en tierra queda como Capullo que bloquea el paso 20 s ----
function mycDeath(e){
 if(e.kind!=='u'||isAir(e))return;
 if(teamSp(e.team)===2&&e.type==='rifle')mycPlant(e.team,e.tile,0,12);
 const a=e.killer;if(!a||a.team===e.team||teamSp(a.team)!==2||e.carry)return;const t=tiles[e.tile];
 if(t.bld||t.gu||!passable(e.tile,false))return;
 if(ents.filter(x=>!x.dead&&x.type==='cocoon'&&x.team===a.team).length>=6)return;
 const c=addBuilding(a.team,'cocoon',e.tile,true);c.life=20}
function cocoonMesh(tc){const g=new THREE.Group(),gc=new THREE.Color(0x2affc8).lerp(new THREE.Color(tc),0.25);
 const body=new THREE.Mesh(G.sph,new THREE.MeshLambertMaterial({color:0x4a3660,flatShading:true}));body.scale.set(1.15,1.5,1.15);body.position.y=0.6;g.add(body);
 for(let k=0;k<5;k++){const a=k*1.257,v=new THREE.Mesh(G.cyl,glowMat(gc));v.scale.set(0.07,1.3,0.07);v.position.set(Math.cos(a)*0.5,0.6,Math.sin(a)*0.5);v.rotation.set(Math.sin(a)*0.35,0,-Math.cos(a)*0.35);g.add(v)}
 for(let k=0;k<4;k++){const a=k*1.57+0.4,r=new THREE.Mesh(G.cyl,new THREE.MeshLambertMaterial({color:0x3a2a4a,flatShading:true}));r.scale.set(0.16,0.7,0.16);r.position.set(Math.cos(a)*0.75,0.12,Math.sin(a)*0.75);r.rotation.set(Math.sin(a)*1.2,0,-Math.cos(a)*1.2);g.add(r)}
 const hit=new THREE.Mesh(G.hit,HITM);hit.scale.set(1.4,1.5,1.4);hit.position.y=0.7;g.add(hit);g.userData.hit=hit;return g}
// ---- zona protegida: no se desembarca ni se germina a 3 casillas de un extractor enemigo ni a 5 de su Centro de Control ----
function exclZ(team,i){for(const b of ents){if(b.dead||b.kind!=='b'||b.team===team||!b.built)continue;if(b.type==='hq'){if(distTo(i,b)<=5)return true}else if(b.type==='extractor'&&hd(i,b.tile)<=3)return true}return false}
function exclOut(team,i){let best=-1,bd=1e9;for(const t of tiles){const d=hd(i,t.i);if(d>=bd||d>9||!passable(t.i,false)||exclZ(team,t.i))continue;bd=d;best=t.i}return best}
function dropWhy(team,i){
 if(teamSp(team)===2){if(!mycOn(team,i))return'Germinar necesita micelio en el destino';if(exclZ(team,i))return'Zona protegida: muy cerca de la base enemiga';return null}
 if(team===0&&!vis[i])return'El Droper solo aterriza donde tienes visión';return null}
// ---- Germinar (poder N2 Micelian): hunde hasta 4 tropas de tierra junto al Árbol y brotan en una casilla con micelio tras 2,5 s ----
const GERM=[];
function germinar(team,tile){
 const hq=pwrHQ(team);if(!hq)return false;
 if(team===1&&!NET.on){let best=-1,bd=9;mycAlloc();for(const t of tiles){const d=hd(tile,t.i);if(d<bd&&mycOn(team,t.i)&&!exclZ(team,t.i)&&passable(t.i,false)){bd=d;best=t.i}}if(best<0)return false;tile=best}
 else if(dropWhy(team,tile)&&!(NET.on&&NET.role==='guest'))return false;
 const us=ents.filter(u=>!u.dead&&u.kind==='u'&&u.team===team&&!isAir(u)&&u.spawn<=0&&!u.boarded&&!u.carry&&distTo(u.tile,hq)<=4).sort((a,b)=>distTo(a.tile,hq)-distTo(b.tile,hq)).slice(0,4);
 if(!us.length){if(team===0)toast('No hay tropas de tierra junto al Árbol para germinar');return false}
 charge[team].dropper=0;
 for(const u of us){if(occ(u.tile,false)===u)setOcc(u.tile,false,null);if(u.next>=0&&occ(u.next,false)===u)setOcc(u.next,false,null);u.next=-1;u.path=[];u.dest=-1;u.focus=null;u.boarded=true;sel.delete(u)}
 const t=tiles[tile],gc=new THREE.Color(0x2affc8).lerp(new THREE.Color(TC[team]),0.25),m=new THREE.Mesh(G.sph,glowMat(gc));m.position.set(t.x,groundY(tile)+0.5,t.z);m.scale.setScalar(0.5);scene.add(m);
 GERM.push({team,tile,t:2.5,units:us,mesh:m});marker(t.x,t.z,1.5,0x2affc8,2.5);
 if(team===0)toast('Germinando '+us.length+' tropa'+(us.length>1?'s':'')+'…');return true}
// ---- huellas del Rover: marcas que se borran en 6 s, visibles solo donde tienes visión ----
const TRK={live:[],pool:[],geo:null};
function trackTick(dt){
 if(!TRK.geo){TRK.geo=new THREE.PlaneGeometry(0.42,0.55);TRK.geo.rotateX(-Math.PI/2)}
 for(const e of ents){if(e.dead||e.kind!=='b'||e.type!=='hq'||!e.mesh.userData.rover)continue;const p=e.mesh.position;
  if(!e.trk){e.trk={x:p.x,z:p.z};continue}if(Math.hypot(p.x-e.trk.x,p.z-e.trk.z)<0.55)continue;e.trk.x=p.x;e.trk.z=p.z;
  const h=e.hdg||0,cx=Math.cos(h),sx=Math.sin(h),ti=hexAt(p.x,p.z);
  for(const s of[-1,1]){const m=TRK.pool.pop()||new THREE.Mesh(TRK.geo,new THREE.MeshBasicMaterial({color:PL.liq.glow&&PL.liq.glow[0]>0.5?0x3a1206:0x07090a,transparent:true,opacity:0.5,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));
   const x=p.x+cx*s*1.05,z=p.z-sx*s*1.05;m.position.set(x,heightAt(x,z)+0.04,z);m.rotation.y=h;m.userData.t=6;m.userData.ti=ti;m.renderOrder=2;if(!m.parent)scene.add(m);m.visible=true;TRK.live.push(m)}}
 for(let k=TRK.live.length-1;k>=0;k--){const m=TRK.live[k];m.userData.t-=dt;if(m.userData.t<=0){m.visible=false;TRK.live.splice(k,1);TRK.pool.push(m);continue}m.material.opacity=0.5*Math.min(1,m.userData.t/3);m.visible=m.userData.ti<0||!!vis[m.userData.ti]}
}
