// ================= DROPER LIBRE: después de recoger se queda en el aire como unidad propia =================
// Estados: rise · idle · move · land · ground · dock. Órdenes: mv (volar), pick (recolectar), drop (soltar), home (volver a la torre).
let selFree=null,freeAct=null;
const DFR={};
const FLYSPD=8,CRZ=2.6;
function startFree(D){
 if(D.free)return;const P=D.ship.position;
 D.free={st:'rise',t:0,tgt:null,act:null,did:false,ramp:0,sp:0};D.T=null;
 P.y=Math.max(P.y,heightAt(P.x,P.z)+0.18);
}
function boardU(u){if(occ(u.tile,false)===u)setOcc(u.tile,false,null);if(u.next>=0&&occ(u.next,false)===u)setOcc(u.next,false,null);u.next=-1;u.path=[];u.dest=-1;u.focus=null;u.wps=[];u.boarded=true;sel.delete(u);dust(u.mesh.position.x,u.mesh.position.y+0.05,u.mesh.position.z,0.3,0.8)}
function freeBusy(D){return !D.free||D.free.st==='land'||D.free.st==='ground'||D.free.st==='dock'}
// aplica la orden (también en el invitado, por evento del anfitrión)
function freeApply(D,a,i){
 const F=D.free;if(!F||F.st==='dock'||F.st==='ground'||F.st==='land')return false;const t=tiles[i];if(!t)return false;
 if(a==='home'){const b=D.b;if(b.dead||!b.mesh||!b.mesh.userData.hatch){if(D.team===0)toast('La torre ya no existe');return false}
  F.tgt=hatchWorld(b).top.clone();F.act='home';F.st='move';return true}
 if(a!=='mv'){const j=dropSpot(i,D.team);if(j<0){if(D.team===0)toast('No hay dónde aterrizar');return false}i=j}
 const t2=tiles[i];F.tgt=new THREE.Vector3(t2.x,0,t2.z);F.act=a==='pick'||a==='drop'?a:null;F.st='move';return true}
// orden del jugador / anfitrión: valida, aplica y avisa
function freeOrder(D,a,i){
 if(!D||!D.free)return false;
 if(a==='drop'&&!D.units.some(u=>!u.dead)){if(D.team===0)toast('El Droper va vacío');return false}
 if(a==='pick'&&cargoW(D)>=DCAP){if(D.team===0)toast('El Droper va lleno');return false}
 if(!freeApply(D,a,i))return false;
 if(NET.on&&NET.role==='host')mpEvent({e:'fo',b:D.b.id,a,i});return true}
function freeTap(i){
 const D=selFree;if(!D||!D.free||!DROPS.includes(D)){selFree=null;dropBarSync();return}
 const a=freeAct||'mv';
 if(NET.on&&NET.role==='guest'){if(D.b.hid)mpCmd({fo:D.b.hid,a,i});marker(tiles[i].x,tiles[i].z,1,0x7dffcf,1.6);ping(i);freeAct=null;dropBarSync();return}
 if(freeOrder(D,a,i)){marker(tiles[i].x,tiles[i].z,1,0x7dffcf,1.6);ping(i)}
 freeAct=null;dropBarSync()}
function pickFree(D){
 if(selFree===D){selFree=null;freeAct=null;dropBarSync();return}
 setCard(null);sel.clear();selB=null;selDrop=null;updSel();selFree=D;freeAct=null;dropBarSync();toast('Droper libre · toca el mapa para moverlo')}
let _dxL=0;const dxLast=()=>_dxL;
function dropBarSync(){
 const el=$('dropBar');if(!el)return;const D=selFree;
 if(!D||!D.free||!DROPS.includes(D)){el.classList.remove('show');return}
 if(!el.firstChild){
  const mk=(id,txt,fn)=>{const b=document.createElement('button');b.id=id;b.textContent=txt;b.addEventListener('click',e=>{e.stopPropagation();if(Math.abs(dxLast())>8)return;fn()});el.appendChild(b)};
  mk('dbPick','Recolectar',()=>freeArm('pick'));mk('dbDrop','Soltar',()=>freeArm('drop'));mk('dbHome','Volver',()=>{const D=selFree;if(!D)return;
   if(NET.on&&NET.role==='guest'){if(D.b.hid)mpCmd({fo:D.b.hid,a:'home',i:D.b.tile})}else freeOrder(D,'home',D.b.tile);freeAct=null;dropBarSync()});
  const cg=document.createElement('span');cg.className='cg';cg.id='dbCg';el.appendChild(cg);
  // deslizar hacia los lados cierra la tarjeta
  let sx=null,sy=0,dx=0;const rest=()=>{el.style.transform='';el.style.opacity=''};
  el.addEventListener('pointerdown',e=>{e.stopPropagation();sx=e.clientX;sy=e.clientY;dx=0;_dxL=0;el.style.transition='none'});
  window.addEventListener('pointermove',e=>{if(sx===null)return;const x=e.clientX-sx,y=e.clientY-sy;if(Math.abs(x)<8&&!dx)return;if(Math.abs(y)>Math.abs(x)*1.5&&!dx){sx=null;el.style.transition='';return}dx=x;_dxL=x;el.style.transform='translateX(calc(-50% + '+dx+'px))';el.style.opacity=String(Math.max(0.2,1-Math.abs(dx)/160))});
  const end=()=>{if(sx===null)return;sx=null;el.style.transition='';if(Math.abs(dx)>60){el.dataset.sw='1';setTimeout(()=>delete el.dataset.sw,50);rest();selFree=null;freeAct=null;dropBarSync()}else{rest()}dx=0};
  window.addEventListener('pointerup',end);window.addEventListener('pointercancel',end)}
 el.classList.add('show');const w=cargoW(D);
 $('dbPick').classList.toggle('on',freeAct==='pick');$('dbDrop').classList.toggle('on',freeAct==='drop');
 $('dbPick').disabled=w>=DCAP;$('dbDrop').disabled=!D.units.some(u=>!u.dead);$('dbHome').disabled=D.b.dead||!D.b.mesh;
 $('dbCg').textContent='Carga '+w+'/'+DCAP}
function freeArm(a){const D=selFree;if(!D)return;freeAct=freeAct===a?null:a;dropBarSync();if(freeAct)toast(a==='pick'?'Toca dónde recoger tropas':'Toca dónde soltar la carga')}
function updFree(D,dt,idx){
 const F=D.free,S=D.ship,U=S.userData,P=S.position,t0=F.t;F.t+=dt;
 const fin=()=>{scene.remove(S);if(D.bar)scene.remove(D.bar.g);DROPS.splice(idx,1);if(selFree===D){selFree=null;dropBarSync()}if(CAMF===D)CAMF=null};
 let fold=1,flying=true,spd=0,vx=0,vz=0;
 const air=(x,z)=>heightAt(x,z)+CRZ;
 if(F.st==='rise'||F.st==='idle'){P.y+=(air(P.x,P.z)-P.y)*Math.min(1,dt*2.5);spd=F.st==='rise'?10:6;if(F.st==='rise'&&F.t>0.9)F.st='idle'}
 else if(F.st==='move'){
  const tx=F.tgt.x,tz=F.tgt.z,dx=tx-P.x,dz=tz-P.z,d=Math.hypot(dx,dz),stp=FLYSPD*dt;
  P.y+=(air(P.x,P.z)-P.y)*Math.min(1,dt*3);
  if(d<=stp+0.02){P.x=tx;P.z=tz;F.sp=0;
   if(F.act==='home'){F.st='dock';F.dk=0;F.did=false;F.from=P.clone()}
   else if(F.act==='pick'||F.act==='drop'){F.st='land';F.job=F.act;F.t=0}
   else{F.st='idle';F.t=0}F.act=null}
  else{vx=dx/d;vz=dz/d;P.x+=vx*stp;P.z+=vz*stp;D.yaw=Math.atan2(vx,vz);spd=22;F.sp=FLYSPD}}
 else if(F.st==='land'){
  const ty=heightAt(P.x,P.z)+0.18;P.y+=(ty-P.y)*Math.min(1,dt*3.5);spd=10;
  if(P.y-ty<0.06){P.y=ty;F.st='ground';F.t=0;F.did=false}}
 else if(F.st==='ground'){
  flying=false;P.y=heightAt(P.x,P.z)+0.18;const g=F.t;F.ramp=g<0.25?sm(g/0.25):g<1.0?1:1-sm((g-1.0)/0.3);
  if(g>0.3&&!F.did){F.did=true;const tl=hexAt(P.x,P.z),fw=new THREE.Vector3(Math.sin(D.yaw),0,Math.cos(D.yaw));
   if(F.job==='pick'){const got=pickables(D.team,tl,DCAP-cargoW(D));got.forEach(boardU);D.units.push(...got);
    if(D.team===0)toast(got.length?'Droper: '+got.length+(got.length>1?' unidades subieron':' unidad subió')+' · carga '+cargoW(D)+'/'+DCAP:'Droper: no había tropas a ≤2 casillas')}
   else{const used=new Set(),back=P.clone().addScaledVector(fw,-0.9);let n=0;
    D.units.forEach((u,k)=>{if(u.dead)return;const f=nearestFree(tl,false,u,used);if(f<0){kill(u);return}used.add(f*2);u.tile=f;setOcc(f,false,u);u.boarded=false;u.post=f;u.dest=-1;u.spawn=1.2+k*0.15;u.from={x:back.x,z:back.z};u.mesh.visible=true;n++});
    D.units=[];if(D.team===0)toast('Droper: '+n+(n===1?' unidad desplegada':' unidades desplegadas'))}
   if(selFree===D)dropBarSync()}
  if(g>1.3){F.st='rise';F.t=0;F.ramp=0}
  spd=0}
 else if(F.st==='dock'){
  flying=false;const b=D.b;
  if(!b.mesh||!b.mesh.userData.hatch||b.dead){F.st='idle';F.t=0;flying=true}
  else{const H=b.mesh.userData.hatch,dk=F.dk+=dt;
   const open=dk<0.4?sm(dk/0.4):dk<2.4?1:1-sm((dk-2.4)/0.3);H.doors.forEach(d=>d.rotation.z=d.userData.sx*open*1.95);H.pad.visible=open>0.02;
   const up=dk<0.4?0:dk<0.9?sm((dk-0.4)/0.5):dk<1.9?1:1-sm((dk-1.9)/0.5),padY=H.pad0+0.65*up;H.pad.position.y=padY;
   const pw=b.mesh.localToWorld(new THREE.Vector3(H.x,padY+0.11,H.z));
   if(dk<0.4)P.copy(F.from);else if(dk<1.3)P.lerpVectors(F.from,pw,sm((dk-0.4)/0.9));else P.copy(pw);
   fold=dk>1.3?1-sm((dk-1.3)/0.3):1;spd=dk<1.3?8:0;
   if(dk>1.3&&!F.did){F.did=true;const used=new Set(),pad=b.mesh.localToWorld(new THREE.Vector3(H.x,H.pad0+0.3,H.z));
    D.units.forEach((u,k)=>{if(u.dead)return;const f=nearestFree(b.tile,false,u,used);if(f<0){kill(u);return}used.add(f*2);u.tile=f;setOcc(f,false,u);u.boarded=false;u.post=f;u.dest=-1;u.hp=u.max;u.spawn=1.2+k*0.25;u.from={x:pad.x,z:pad.z};u.mesh.visible=true});
    if(D.team===0&&D.units.length)toast('Droper: tropas de vuelta en la base y curadas');D.units=[]}
   if(dk>2.7){H.doors.forEach(d=>d.rotation.z=0);H.pad.position.y=H.pad0;H.pad.visible=false;b.drop=false;fin();return}}}
 // visibilidad, vida y fuego antiaéreo
 {const th=hexAt(P.x,P.z);S.visible=D.team===0||(th>=0&&!!vis[th])}
 if(F.st!=='dock'){dropFlak(D,dt);if(!DROPS.includes(D))return}
 if(D.bar){const sh=S.visible&&D.hp<D.mx-0.5;D.bar.g.visible=sh;if(sh){const f=clamp(D.hp/D.mx,0,1);D.bar.g.position.set(P.x,P.y+0.8,P.z);D.bar.g.quaternion.copy(camera.quaternion);D.bar.g.scale.set(1.2,1,1);D.bar.fg.scale.x=f;D.bar.fg.position.x=-(1-f)/2}}
 // animación
 S.rotation.order='YXZ';S.rotation.set(F.st==='move'?0.12:0,D.yaw,0);
 U.bl.forEach(pv=>pv.rotation.z=pv.userData.sx*(1-fold)*1.5);
 const mv=F.st==='move'?1:0;U.pods.forEach(pd=>pd.rotation.x=-Math.PI/2*(1-mv)*0.95*fold);
 U.jets.forEach(j=>{const k=Math.min(1,spd/22);j.scale.set(1,0.2+k*1.05,1);j.visible=spd>1&&S.visible});U.skids.forEach(k=>k.scale.y=flying?0.15:1);
 U.ramp.rotation.x=1.5-1.68*(F.ramp||0);if(U.bayL)U.bayL.color.setHex((F.ramp||0)>0.05?0xff3a2a:0x3a0c08);
 const h=P.y-heightAt(P.x,P.z);if(spd>3&&h<1.6&&S.visible&&F.st!=='dock'&&((D.dl=(D.dl||0)-dt)<=0)){D.dl=0.06;const a=Math.random()*6.28;dust(P.x+Math.cos(a)*0.2,heightAt(P.x,P.z)+0.05,P.z+Math.sin(a)*0.2,0.35+Math.random()*0.25,0.9)}
}

