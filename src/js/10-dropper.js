// ================= DROPPER: nave de desembarco del Cuartel (nivel 2+) =================
const DROPS=[];
const pwrHQ=tm=>ents.find(e=>!e.dead&&e.kind==='b'&&e.type==='hq'&&e.team===tm);
const dropBarracks=tm=>ents.filter(e=>!e.dead&&e.kind==='b'&&e.type==='barracks'&&e.team===tm&&e.built&&(e.lvl||1)>=2&&teamSp(tm)!==2);
function pwrUnlocked(tm,k){const S=SUP[k];if(!S||S.off)return false;const hq=pwrHQ(tm);if(!hq||(hq.lvl||1)<S.lv)return false;if(k==='dropper')return dropBarracks(tm).length>0;return true}
function pwrLockMsg(k){const S=SUP[k];if(S.off)return S.n+': próximamente';return S.n+': se activa con el Centro de Control nivel '+S.lv+(k==='dropper'?' y un Cuartel':'')}
function hatchWorld(b){const H=b.mesh.userData.hatch;b.mesh.updateMatrixWorld(true);return{H,top:b.mesh.localToWorld(new THREE.Vector3(H.x,H.ty+0.2,H.z)),q:b.mesh.getWorldQuaternion(new THREE.Quaternion())}}
// pick: Droper elegido que vuela vacío a recoger infantería propia y la trae a su Cuartel (recolección)
// casilla de aterrizaje válida: sin edificio, sin roca/agua y sin tropa encima; si no, la libre más cercana
function dropSpot(tile,team){const j=nearestFree(tile,false,null,null);if(j>=0&&j!==tile&&team===0)toast('Zona ocupada · el Droper aterriza en el punto libre más cercano');return j}
function startDrop(team,tile,pick){
 {const j=dropSpot(tile,team);if(j<0){if(team===0)toast('No hay dónde aterrizar');return false}tile=j}
 const tgt=tiles[tile],bs=dropBarracks(team).filter(b=>!b.drop&&b.mesh&&b.mesh.userData.hatch&&(!pick||b===pick));
 if(!bs.length){if(team===0){const all=dropBarracks(team).length,ar=ARRIVE.filter(a=>a.b.team===team).length;toast(ar?'Droper llegando a su torre ('+ar+')':'Todos los Droper en vuelo ('+all+'/'+all+')')}return false}
 const b=bs.sort((a,c)=>hd(a.tile,tile)-hd(c.tile,tile))[0];
 const inf=pick?[]:ents.filter(u=>!u.dead&&u.kind==='u'&&u.team===team&&UD[u.type].cls==='inf'&&u.spawn<=0&&!u.boarded&&distTo(u.tile,b)<=5).sort((a,c)=>distTo(a.tile,b)-distTo(c.tile,b)).slice(0,4);
 if(!inf.length&&!pick){if(team===0)toast('No hay infantería junto al Cuartel para embarcar');return false}
 for(const u of inf){if(occ(u.tile,false)===u)setOcc(u.tile,false,null);if(u.next>=0&&occ(u.next,false)===u)setOcc(u.next,false,null);u.next=-1;u.path=[];u.dest=-1;u.focus=null;u.boarded=true;sel.delete(u)}
 const ship=CQ.heliModel(TC[team],b.lvl||2);ship.scale.setScalar((b.lvl||2)>=3?1.6:1.45);scene.add(ship);
 const hw=hatchWorld(b),gy=heightAt(tgt.x,tgt.z);
 const P0=hw.top.clone(),Hp=P0.clone().add(new THREE.Vector3(0,0.9,0)),Dg=new THREE.Vector3(tgt.x,gy+0.18,tgt.z),Dair=Dg.clone().add(new THREE.Vector3(0,1.3,0));
 const dist=Math.hypot(Dg.x-Hp.x,Dg.z-Hp.z),cruise=Math.max(Hp.y,Dair.y)+2.6,fly=Math.max(1.2,dist/7.5);
 b.drop=true;const mx=(b.lvl||2)>=3?900:550;DROPS.push({team,b,units:inf,pick:!!pick,ship,tile,t:0,P0,Hp,Dg,Dair,cruise,fly,dist,yaw:0,dl:0,hp:mx,mx,bar:makeBar(TC[team])});
 if(pick&&NET.on&&NET.role==='host')mpEvent({e:'pk',b:b.id,i:tile});
 if(team===1)toast(pick?'Droper enemigo en misión de recolección':'¡Droper enemigo en camino!');return true}
// infantería propia que sube en la recolección: hasta 4 pelotones a ≤2 casillas del punto de aterrizaje
const DCAP=4,CAPW=u=>{const c=UD[u.type].cls;return c==='inf'?1:u.type==='titan'?4:2};
const cargoW=D=>D.units.reduce((n,u)=>n+(u.dead?0:CAPW(u)),0);
const pickables=(team,tile,cap)=>{const l=ents.filter(u=>!u.dead&&u.kind==='u'&&u.team===team&&UD[u.type].cls!=='air'&&u.spawn<=0&&!u.boarded&&!u.carry&&distTo(tile,u)<=2).sort((a,c)=>distTo(tile,a)-distTo(tile,c)),o=[];let w=0;cap=cap==null?DCAP:cap;for(const u of l){const k=CAPW(u);if(w+k>cap)continue;w+=k;o.push(u);if(w>=cap)break}return o};
const bz3=(a,b,c,d,u)=>{const v=1-u;return a.clone().multiplyScalar(v*v*v).add(b.clone().multiplyScalar(3*v*v*u)).add(c.clone().multiplyScalar(3*v*u*u)).add(d.clone().multiplyScalar(u*u*u))};
const sm=k=>k<0?0:k>1?1:k*k*(3-2*k),io2=k=>k<0?0:k>1?1:k<0.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
function dropPath(D,t){const F=D.fly,pad=D.P0.clone().add(new THREE.Vector3(0,-0.05,0)),{Hp,Dair,Dg,cruise}=D;
 const T1=1.3,T2=T1+0.25,T3=T2+F,T4=T3+0.35,T5=T4+0.25,T6=T5+0.6,T7=T6+0.25,T8=T7+F,T9=T8+0.3,T10=T9+0.4;D.T=[T1,T2,T3,T4,T5,T6,T7,T8,T9,T10];
 const mid=(a,b2)=>a.clone().lerp(b2,0.5).setY(cruise),dir=new THREE.Vector3(Dair.x-Hp.x,0,Dair.z-Hp.z).normalize();
 if(t<T1)return pad;if(t<T2)return pad.clone().lerp(Hp,sm((t-T1)/0.25));
 if(t<T3)return bz3(Hp,Hp.clone().setY(cruise),Dair.clone().setY(cruise).addScaledVector(dir,-0.6),Dair.clone().addScaledVector(dir,0.25),io2((t-T2)/F));
 if(t<T4){const s=t-T3;return Dair.clone().addScaledVector(dir,0.25*Math.exp(-6.5*s)*Math.cos(10*s))}
 if(t<T5)return Dair.clone().lerp(Dg,sm((t-T4)/0.25));if(t<T6)return Dg.clone();if(t<T7)return Dg.clone().lerp(Dair,sm((t-T6)/0.25));
 if(t<T8)return bz3(Dair,Dair.clone().setY(cruise),Hp.clone().setY(cruise).addScaledVector(dir,0.6),Hp.clone().addScaledVector(dir,-0.25),io2((t-T7)/F));
 if(t<T9){const s=t-T8;return Hp.clone().addScaledVector(dir,-0.25*Math.exp(-6.5*s)*Math.cos(10*s))}
 if(t<T10)return Hp.clone().lerp(pad,sm((t-T9)/0.4));return pad}
function updDrops(dt){updArrive(dt);updCrash(dt);updTracers(dt);updReships(dt);for(let i=DROPS.length-1;i>=0;i--){const D=DROPS[i],S=D.ship,U=S.userData;D.t+=dt;const t=D.t;
 if(D.pick&&!D.free&&D.T&&t>=D.T[6])startFree(D);
 if(D.free){updFree(D,dt,i);continue}
 if(D.b.dead||!D.b.mesh){for(const u of D.units)if(u.boarded&&!u.dead)kill(u);scene.remove(S);if(D.bar)scene.remove(D.bar.g);DROPS.splice(i,1);continue}
 const p=dropPath(D,t),T=D.T,H=D.b.mesh.userData.hatch,e=1/30,pa=dropPath(D,t-e),pb=dropPath(D,t+e),v=pb.clone().sub(pa).multiplyScalar(1/(2*e)),ac=pb.clone().add(pa).sub(p.clone().multiplyScalar(2)).multiplyScalar(1/(e*e));
 // compuerta, montacargas y luces de la torre
 const open=t<0.3?sm(t/0.3):t<T[9]+0.2?1:1-sm((t-T[9]-0.2)/0.3);H.doors.forEach(d=>d.rotation.z=d.userData.sx*open*1.95);
 const padY=H.pad0+(t<0.3?0:t<0.8?0.65*sm((t-0.3)/0.5):t<T[9]+0.1?0.65:0.65*(1-sm((t-T[9]-0.1)/0.4)));H.pad.position.y=padY;H.pad.visible=open>0.02;
 (D.b.mesh.userData.landL||[]).forEach(L=>{const k=(t<1.6||(t>T[7]&&t<T[9]+0.4))?Math.max(0,Math.sin(t*14-L.q*1.2)):0.6;L.lm.color.setHex(L.sx<0?0xff2a2a:0x2aff5a).multiplyScalar(0.25+0.75*k);L.hm.opacity=0.45*k});
 // nave: plataforma → despliegue → vuelo
 const onPad=t<T[1]-0.2||t>T[8]+0.2;let pp=p;if(t<0.8||t>T[9]+0.1)pp=D.b.mesh.localToWorld(new THREE.Vector3(H.x,H.pad.position.y+0.11,H.z));
 S.position.copy(pp);{const th=hexAt(pp.x,pp.z);S.visible=t>0.35&&t<T[9]+0.45&&(D.team===0||(th>=0&&!!vis[th]));}
 if(t>0.9&&t<T[9]-0.05){dropFlak(D,dt);if(!DROPS.includes(D))continue}
 if(D.bar){const sh=S.visible&&D.hp<D.mx-0.5;D.bar.g.visible=sh;if(sh){const f=clamp(D.hp/D.mx,0,1);D.bar.g.position.set(pp.x,pp.y+0.8,pp.z);D.bar.g.quaternion.copy(camera.quaternion);D.bar.g.scale.set(1.2,1,1);D.bar.fg.scale.x=f;D.bar.fg.position.x=-(1-f)/2}}
 const vh=Math.hypot(v.x,v.z);if(vh>0.6)D.yaw=Math.atan2(v.x,v.z);const fw=new THREE.Vector3(Math.sin(D.yaw),0,Math.cos(D.yaw)),rt=new THREE.Vector3(Math.cos(D.yaw),0,-Math.sin(D.yaw));
 const flying=(t>T[1]&&t<T[2])||(t>T[6]&&t<T[7]);S.rotation.order='YXZ';S.rotation.set(flying?clamp(ac.dot(fw)*0.03,-0.45,0.4):0,D.yaw,flying?clamp(-ac.dot(rt)*0.04,-0.55,0.55):0);
 const fold=t<0.8?0:t<1.2?sm((t-0.8)/0.4):t>T[9]+0.1?1-sm((t-T[9]-0.1)/0.3):1;
 const spd=(t>0.9&&t<1.3)?4+(t-0.9)/0.4*18:(t>=1.3&&t<T[9])?(flying?26:20):(t>=T[9]&&t<T[9]+0.2)?18*(1-(t-T[9])/0.2):0;
 U.bl.forEach(pv=>pv.rotation.z=pv.userData.sx*(1-fold)*1.5);U.pods.forEach(pd=>pd.rotation.x=-Math.PI/2*(1-(flying?clamp(vh/4,0,1):0))*0.95*fold);
 U.jets.forEach(j=>{const k=Math.min(1,spd/22);j.scale.set(1,0.2+k*1.05,1);j.visible=spd>1&&S.visible});U.skids.forEach(k=>k.scale.y=flying?0.15:1);
 const ro=t>T[4]&&t<T[5]+0.15?sm((t-T[4])/0.14)*(1-sm((t-T[5]+0.05)/0.2)):0;U.ramp.rotation.x=1.5-1.68*ro;if(U.bayL)U.bayL.color.setHex(ro>0.05?0xff3a2a:0x3a0c08);
 // polvo de propulsores cerca de la superficie
 const surf=onPad?padY:heightAt(p.x,p.z),h=p.y-surf;if(spd>3&&h<1.4&&S.visible&&(D.dl-=dt)<=0){D.dl=0.05;const a=Math.random()*6.28;dust(p.x+Math.cos(a)*0.2,(onPad?S.position.y-0.15:surf+0.05),p.z+Math.sin(a)*0.2,0.35+Math.random()*0.25,0.9)}
 // desembarco: la tropa sale por la rampa
 if(D.pick&&!D.got&&t>T[4]+0.12){D.got=true;D.units=pickables(D.team,D.tile);
  for(const u of D.units){if(occ(u.tile,false)===u)setOcc(u.tile,false,null);if(u.next>=0&&occ(u.next,false)===u)setOcc(u.next,false,null);u.next=-1;u.path=[];u.dest=-1;u.focus=null;u.wps=[];u.boarded=true;sel.delete(u);dust(u.mesh.position.x,u.mesh.position.y+0.05,u.mesh.position.z,0.3,0.8)}
  if(D.team===0)toast(D.units.length?'Droper: '+D.units.length+(D.units.length>1?' unidades a bordo':' unidad a bordo')+' · queda libre en el aire':'Droper: no había tropas en la zona · queda libre')}
 else if(!D.pick&&!D.out&&t>T[4]+0.12){D.out=true;const used=new Set(),back=S.position.clone().addScaledVector(fw,-0.9);
  D.units.forEach((u,k)=>{if(u.dead)return;const f=nearestFree(D.tile,false,u,used);if(f<0){kill(u);return}used.add(f*2);u.tile=f;setOcc(f,false,u);u.boarded=false;u.post=f;u.dest=-1;u.spawn=1.2+k*0.15;u.from={x:back.x,z:back.z};u.mesh.visible=true});
  if(D.team===0)toast('Droper: tropas desplegadas')}
 if(D.pick&&!D.out&&!D.free&&t>T[9]+0.6){D.out=true;const used=new Set(),pad=D.b.mesh.localToWorld(new THREE.Vector3(H.x,H.pad0+0.3,H.z)),bt=D.b.tile;
  D.units.forEach((u,k)=>{if(u.dead)return;const f=nearestFree(bt,false,u,used);if(f<0){kill(u);return}used.add(f*2);u.tile=f;setOcc(f,false,u);u.boarded=false;u.post=f;u.dest=-1;u.hp=u.max;u.spawn=1.2+k*0.25;u.from={x:pad.x,z:pad.z};u.mesh.visible=true});
  if(D.team===0&&D.units.length)toast('Droper: tropas de vuelta en la base y curadas')}
 if(t>T[9]+0.9){scene.remove(S);if(D.bar)scene.remove(D.bar.g);H.pad.visible=false;D.b.drop=false;DROPS.splice(i,1)}}}

