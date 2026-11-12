// ================= RECOLECCIÓN: ícono sobre el Droper guardado en su torre =================
// Cuando el Droper está posado en la torre del Cuartel aparece un ícono encima. Tócalo para elegirlo
// y luego toca el mapa (o el minimapa): vuela vacío, recoge hasta 4 pelotones de infantería propia
// a ≤2 casillas del punto y los trae a la base con la vida llena.
let selDrop=null;
const DICO={};
const DICON='<svg viewBox="0 0 24 24"><path d="M4 9l8-4 8 4-2 3H6z" fill="currentColor" opacity=".9"/><path d="M12 12v6m-3-3l3 3 3-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 20h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const dropDocked=b=>!b.drop&&b.built&&b.mesh&&b.mesh.userData.hatch&&!ARRIVE.some(a=>a.b===b);
function pickDrop(b){
 if(selDrop===b){selDrop=null;toast('Recolección cancelada');return}
 if(!dropDocked(b))return;
 setCard(null);sel.clear();selB=null;updSel();selDrop=b;
 toast('Droper listo · toca dónde recoger infantería');
}
function pickupOrder(i){
 const b=selDrop;selDrop=null;
 if(!b||b.dead||!dropDocked(b)){toast('Ese Droper ya no está en su torre');return}
 const t=tiles[i];if(!t){return}
 marker(t.x,t.z,1,0x7dffcf,1.6);ping(i);
 if(NET.on&&NET.role==='guest'){if(b.hid)mpCmd({pk:b.hid,i});toast('Droper: recolección en camino');return}
 if(startDrop(0,i,b))toast('Droper: recolección en camino');
}
const _dv=new THREE.Vector3();
function updDropIcons(){
 const show=started&&!over&&!INTRO,live=new Set(),r=view.getBoundingClientRect();
 if(show)for(const b of dropBarracks(0)){
  if(!dropDocked(b))continue;
  const H=b.mesh.userData.hatch;b.mesh.updateMatrixWorld(true);b.mesh.localToWorld(_dv.set(H.x,H.ty+0.9,H.z));_dv.project(camera);
  if(_dv.z>1||Math.abs(_dv.x)>1.05||Math.abs(_dv.y)>1.05)continue;
  let el=DICO[b.id];
  if(!el){el=document.createElement('button');el.className='dico';el.innerHTML=DICON;el.title='Droper: recolección';
   el.addEventListener('pointerdown',e=>e.stopPropagation());el.addEventListener('click',e=>{e.stopPropagation();pickDrop(b)});$('dropIcons').appendChild(el);DICO[b.id]=el}
  el.style.transform='translate('+((_dv.x+1)/2*r.width).toFixed(1)+'px,'+((1-_dv.y)/2*r.height).toFixed(1)+'px) translate(-50%,-100%)';
  el.classList.toggle('on',selDrop===b);live.add(String(b.id));
 }
 if(show)for(const D of DROPS){
  if(D.team!==0||!D.free||D.free.st==='dock'||!D.ship.visible)continue;
  _dv.set(D.ship.position.x,D.ship.position.y+0.9,D.ship.position.z).project(camera);
  if(_dv.z>1||Math.abs(_dv.x)>1.05||Math.abs(_dv.y)>1.05)continue;
  const key='f'+D.b.id;let el=DICO[key];
  if(!el){el=document.createElement('button');el.className='dico free';el.innerHTML=DICON;el.title='Droper libre';
   el.addEventListener('pointerdown',e=>e.stopPropagation());el.addEventListener('click',e=>{e.stopPropagation();pickFree(D)});$('dropIcons').appendChild(el);DICO[key]=el}
  el.style.transform='translate('+((_dv.x+1)/2*r.width).toFixed(1)+'px,'+((1-_dv.y)/2*r.height).toFixed(1)+'px) translate(-50%,-100%)';
  el.classList.toggle('on',selFree===D);live.add(key)}
 for(const k in DICO)if(!live.has(k)){DICO[k].remove();delete DICO[k]}
 if(selFree&&(!DROPS.includes(selFree)||!selFree.free||sel.size||selB||selCard||over)){selFree=null;freeAct=null}
 if(selFree===null&&$('dropBar').classList.contains('show'))dropBarSync();else if(selFree)dropBarSync();
 if(selDrop&&(!live.has(String(selDrop.id))||selDrop.dead))selDrop=null;
}

