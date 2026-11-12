// ================= CAMERA / INPUT =================
const cam={x:0,z:0,dist:30,pitch:0.98};
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),gp=new THREE.Plane(new THREE.Vector3(0,1,0),-(0.25+2*LV)),tmpV=new THREE.Vector3();
const bounds={x0:-CX-1,x1:CX+1,z0:-CZ-1,z1:CZ+1};
function updCam(){
 cam.x=clamp(cam.x,bounds.x0,bounds.x1);cam.z=clamp(cam.z,bounds.z0,bounds.z1);cam.dist=clamp(cam.dist,11,52);
 const sx=shake?(Math.random()-.5)*shake:0,sz=shake?(Math.random()-.5)*shake:0;
 const zk=(typeof INTRO!=='undefined'&&INTRO)?0:clamp((26-cam.dist)/15,0,1),pt=cam.pitch-0.36*zk*zk*(3-2*zk);// al acercar, la cámara se inclina hacia el horizonte
 camera.position.set(cam.x+sx,cam.dist*Math.sin(pt),cam.z+FL*cam.dist*Math.cos(pt)+sz);
 camera.lookAt(cam.x+sx,0,cam.z+sz);
}
function setNdc(cx,cy){const r=cv.getBoundingClientRect();ndc.set((cx-r.left)/r.width*2-1,-(cy-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera)}
function groundAt(cx,cy){setNdc(cx,cy);return ray.ray.intersectPlane(gp,new THREE.Vector3())}
function hexAt(x,z){
 const x0=x+CX,z0=z+CZ;const rf=z0/1.5,qf=x0/SQ3-rf/2,sf=-qf-rf;
 let q=Math.round(qf),r=Math.round(rf),s=Math.round(sf);
 const dq=Math.abs(q-qf),dr=Math.abs(r-rf),ds=Math.abs(s-sf);
 if(dq>dr&&dq>ds)q=-r-s;else if(dr>ds)r=-q-s;
 return idx(q+((r-(r&1))>>1),r);
}
function tileAt(cx,cy){setNdc(cx,cy);const th=TER&&ray.intersectObject(TER.mesh,false)[0];if(th)return hexAt(th.point.x,th.point.z);const g=ray.ray.intersectPlane(gp,tmpV);return g?hexAt(g.x,g.z):-1}
const GHOFF=e=>e.pointerType==='touch'?46:0; // con el dedo, el fantasma va un poco más arriba para que se vea
const placing=()=>!!(started&&!over&&selCard&&BD[selCard]);
let cardDragT=0;
const ptr=new Map();let drag=null,pinch=null;
const pd=()=>{const a=[...ptr.values()];return Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)};
cv.addEventListener('pointerdown',e=>{
 if(e.pointerType==='mouse'&&e.button===2){if(started&&!over)dropSel();return}
 if(e.pointerType==='mouse'&&e.button!==0)return;
 cv.setPointerCapture(e.pointerId);ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(ptr.size===2){pinch={d:pd(),dist:cam.dist};drag=null}
 else if(ptr.size===1){drag={sx:e.clientX,sy:e.clientY,moved:false,g:groundAt(e.clientX,e.clientY),place:placing()};
  if(!drag.place&&started&&!over&&!INTRO){const d0=drag;d0.lp=setTimeout(()=>{if(drag===d0&&!d0.moved&&ptr.size===1&&!pinch){d0.box=true;d0.bx=d0.sx;d0.by=d0.sy;try{navigator.vibrate&&navigator.vibrate(18)}catch(_){}boxDraw(d0);toast('Selección múltiple · arrastra y suelta')}},420)}}
 if(pinch)setGhost(null);
});
cv.addEventListener('pointermove',e=>{
 if(!ptr.has(e.pointerId)){if(e.pointerType==='mouse'&&placing())setGhost(tileAt(e.clientX,e.clientY));return}ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pinch&&ptr.size===2){cam.dist=pinch.dist*pinch.d/Math.max(20,pd());updCam();return}
if(drag&&drag.box){drag.bx=e.clientX;drag.by=e.clientY;boxDraw(drag);return}
 if(drag){
  if(!drag.moved&&Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>10){drag.moved=true;clearTimeout(drag.lp)}
  if(drag.place){if(drag.moved)setGhost(tileAt(e.clientX,e.clientY-GHOFF(e)));return}
  if(drag.moved&&drag.g){CAMF=null;const g=groundAt(e.clientX,e.clientY);if(g){cam.x+=drag.g.x-g.x;cam.z+=drag.g.z-g.z;updCam()}}
 }
});
const boxEl=()=>$('selBox');
function boxDraw(d){const el=boxEl(),x=Math.min(d.sx,d.bx),y=Math.min(d.sy,d.by);el.style.display='block';el.style.left=x+'px';el.style.top=y+'px';el.style.width=Math.abs(d.bx-d.sx)+'px';el.style.height=Math.abs(d.by-d.sy)+'px'}
function boxSelect(d){
 boxEl().style.display='none';const r=cv.getBoundingClientRect(),x0=Math.min(d.sx,d.bx),x1=Math.max(d.sx,d.bx),y0=Math.min(d.sy,d.by),y1=Math.max(d.sy,d.by);
 if(x1-x0<12&&y1-y0<12)return;const v=new THREE.Vector3(),pick=[];
 for(const e of ents){if(e.dead||e.kind!=='u'||e.team!==0||e.boarded||e.spawn>0||e.carry||!e.mesh||!visE(e))continue;v.copy(e.mesh.position);v.y+=0.3;v.project(camera);if(v.z>1)continue;
  const sx=(v.x+1)/2*r.width+r.left,sy=(1-v.y)/2*r.height+r.top;if(sx>=x0&&sx<=x1&&sy>=y0&&sy<=y1)pick.push(e)}
 if(!pick.length){toast('No hay tropas en el recuadro');return}
 selDrop=null;selFree=null;freeAct=null;setCard(null);sel.clear();pick.forEach(u=>sel.add(u));selB=null;routeOpen=false;updSel();toast(pick.length+(pick.length===1?' tropa elegida':' tropas elegidas'))}
const endPtr=e=>{
 if(drag)clearTimeout(drag.lp);
 if(drag&&drag.box&&ptr.size===1){boxSelect(drag);ptr.delete(e.pointerId);drag=null;return}
 if(drag&&drag.place&&drag.moved&&ptr.size===1&&!pinch){const i=GH.i;setGhost(null);if(i>=0&&placing())command(i,null)}
 else if(drag&&!drag.moved&&ptr.size===1&&!pinch){setGhost(null);tapView(e.clientX,e.clientY)}
 ptr.delete(e.pointerId);if(ptr.size<2)pinch=null;if(!ptr.size)drag=null;
};
cv.addEventListener('pointerup',endPtr);cv.addEventListener('contextmenu',e=>e.preventDefault());cv.addEventListener('pointercancel',e=>{if(drag)clearTimeout(drag.lp);boxEl().style.display='none';ptr.delete(e.pointerId);drag=null;pinch=null;setGhost(null)});cv.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&!ptr.size)setGhost(null)});
cv.addEventListener('wheel',e=>{e.preventDefault();cam.dist*=1+Math.sign(e.deltaY)*0.1;updCam()},{passive:false});

// selección por modelo: caja real de cada figura proyectada a la pantalla (sin radio invisible ni casilla)
const PKV=new THREE.Vector3(),PKB=new THREE.Box3(),PKM=new THREE.Matrix4(),PKI=new THREE.Matrix4();
function pickParts(e){const m=e.mesh,U=m.userData;if(U.pk)return U.pk;const skip=new Set([U.hit,U.ring,U.td]);
 const boxOf=root=>{root.updateMatrixWorld(true);PKI.copy(root.matrixWorld).invert();const B=new THREE.Box3();
  const walk=o=>{if(skip.has(o)||o.visible===false)return;if(o.isMesh&&o.geometry){if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();PKB.copy(o.geometry.boundingBox).applyMatrix4(PKM.multiplyMatrices(PKI,o.matrixWorld));B.union(PKB)}for(const c of o.children)walk(c)};walk(root);return B};
 const figs=U.figs;U.pk=(figs&&figs.length>1&&figs.every(F=>F.f))?figs.map(F=>({o:F.f,b:boxOf(F.f)})):[{o:m,b:boxOf(m)}];return U.pk}
function unitAt(cx,cy){const r=cv.getBoundingClientRect(),PAD=4,MIN=30;let best=null,bz=1e9;
 for(const e of ents){if(e.dead||e.kind!=='u'||e.boarded||!e.mesh.visible||!visE(e))continue;
  for(const p of pickParts(e)){if(p.b.isEmpty()||!p.o.visible||(p.o!==e.mesh&&p.o.parent!==e.mesh&&!e.mesh.getObjectById(p.o.id)))continue;p.o.updateMatrixWorld(true);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9,z=0;
   for(let k=0;k<8;k++){PKV.set(k&1?p.b.max.x:p.b.min.x,k&2?p.b.max.y:p.b.min.y,k&4?p.b.max.z:p.b.min.z).applyMatrix4(p.o.matrixWorld).project(camera);const sx=(PKV.x+1)/2*r.width+r.left,sy=(1-PKV.y)/2*r.height+r.top;if(sx<x0)x0=sx;if(sx>x1)x1=sx;if(sy<y0)y0=sy;if(sy>y1)y1=sy;z+=PKV.z/8}
   {const ix=(x1-x0)>48?(x1-x0)*0.1:0,iy=(y1-y0)>48?(y1-y0)*0.08:0;x0+=ix;x1-=ix;y0+=iy;y1-=iy}// las cajas grandes se ajustan a la silueta
   const gx=Math.max(PAD,(MIN-(x1-x0))/2),gy=Math.max(PAD,(MIN-(y1-y0))/2);
   if(cx>=x0-gx&&cx<=x1+gx&&cy>=y0-gy&&cy<=y1+gy&&z<bz){bz=z;best=e}}}
 return best}
function tapView(cx,cy){
 if(!started||over)return;
 setNdc(cx,cy);
 const hits=ray.intersectObjects(hitList,false).map(h=>h.object.userData.ent).filter(e=>e&&!e.dead&&visE(e));
 const direct=unitAt(cx,cy),dirB=hits.find(e=>e.kind==='b')||null;
 let iT=-1;{const th=TER&&ray.intersectObject(TER.mesh,false)[0];if(th)iT=hexAt(th.point.x,th.point.z);else{const g=ray.ray.intersectPlane(gp,tmpV);if(g)iT=hexAt(g.x,g.z)}}
 const near=()=>{ // radio invisible: unidad más cercana al dedo (hasta ~52 px), solo para seleccionar sin nada elegido
  const r=cv.getBoundingClientRect();let best=null,bd=52;const v=new THREE.Vector3();
  for(const e of ents){if(e.dead||e.kind!=='u'||!visE(e))continue;v.copy(e.mesh.position);v.y+=0.4;v.project(camera);
   const sx=(v.x+1)/2*r.width+r.left,sy=(1-v.y)/2*r.height+r.top,d=Math.hypot(sx-cx,sy-cy)-(e.team===0?6:0);if(d<bd){bd=d;best=e}}
  return best};
 let ent=null,i=iT;
 if(selCard){
  if(iT>=0&&!why(0,selCard,iT)){ent=null;i=iT}
  else if(direct&&direct.team===0){setCard(null);ent=direct;i=direct.tile}
 }else if(sel.size){
  ent=direct||dirB||null;if(ent)i=ent.tile;
 }else{
  ent=direct||dirB||null;if(ent)i=ent.tile;
 }
 if(i<0)return;
 command(i,ent,true);
}
function command(i,ent,strict){
 if(selDrop){pickupOrder(i);return}
 if(selFree){freeTap(i);return}
 if(rovArm){const h=rovArm;rovArm=null;if(isRover(h))rovCmd(h,i);ctxKey='';updCtx();return}
 const t=tiles[i];
 const ownHit=ent&&ent.kind==='u'&&ent.team===0;
 if(selCard&&ownHit&&why(0,selCard,i))setCard(null);
 if(selCard){
  const w=why(0,selCard,i);
  if(w){toast(w);return}
  const k=selCard;place(0,k,i);ping(i);
  if(BD[k]||SUP[k])setCard(null);
  refreshHi();return;
 }
 const own=(ent&&ent.team===0&&ent.kind==='u')?ent:strict?null:((t.au&&t.au.team===0)?t.au:(t.gu&&t.gu.team===0)?t.gu:null);
 if(own){routeOpen=false;if(sel.size===1&&sel.has(own)){aliveOf(0,'u').filter(u=>u.type===own.type&&u.spawn<=0).forEach(u=>sel.add(u))}else{sel.clear();sel.add(own)}selB=null;updSel();return}
 const enemy0=(ent&&ent.team===1)?ent:(t.bld&&t.bld.team===1)?t.bld:strict?null:(t.gu&&t.gu.team===1)?t.gu:(t.au&&t.au.team===1)?t.au:null;
 const enemy=enemy0&&visE(enemy0)?enemy0:null;
 if(sel.size){
  if(enemy){routeOpen=false;for(const u of sel)u.wps=[];orderAttack([...sel],enemy);if(NET.on&&NET.role==='guest'&&enemy.hid)mpCmd({at:mpIds(sel),tg:enemy.hid});marker(tiles[enemy.tile].x,tiles[enemy.tile].z,0,0xff4040,0.6)}
  else{const us=[...sel].filter(u=>!u.dead);
   {for(const u of us)u.wps=[];orderMove(us,i);routeOpen=false;if(NET.on&&NET.role==='guest')mpCmd({mv:mpIds(us),i})}// cada toque recalcula la ruta (sin paradas encadenadas)
   ping(i)}
 }else{const bl=(ent&&ent.kind==='b')?ent:t.bld;
  if(selB&&selB.team===0&&isRover(selB)&&!(ent&&ent.kind==='b'&&ent!==selB)&&(!t.bld||t.bld===selB)){if(hd(i,selB.tile)>1){rovCmd(selB,i);ctxKey='';updCtx()}return}// el Centro de Control elegido se mueve como una unidad
  selB=(bl&&(bl.team===0||visE(bl)))?bl:null;updSel()}
}

