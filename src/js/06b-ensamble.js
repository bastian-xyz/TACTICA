// ================= ENSAMBLE DEL TITÁN =================
// El Titán humano no sale caminando del Lab: se arma en el lugar. Las piezas bajan una a una,
// de las piernas a las armas, se acoplan con chispas y un anillo de escaneo sube con el avance.
// Mientras se arma no dispara ni se mueve (spawn), pero sí recibe daño.
const ASM_T=3.8;
const ASM_RING=new THREE.TorusGeometry(1,0.035,6,40);
function startAsm(u){
 if(!u||u.type!=='titan'||teamSp(u.team)===2||!u.mesh)return;
 const g=u.mesh,ud=g.userData,skip=new Set([ud.td,ud.ring,ud.hit]);
 g.position.y=0;g.updateMatrixWorld(true);
 const parts=[],wp=new THREE.Vector3(),ws=new THREE.Vector3();
 const walk=o=>{if(skip.has(o))return;if(o.isMesh)parts.push(o);for(const c of o.children)walk(c)};
 for(const c of g.children)walk(c);
 for(const o of parts){o.getWorldPosition(wp);o.parent.getWorldScale(ws);
  o.userData.asm={p:o.position.clone(),y:wp.y-g.position.y,r:Math.hypot(wp.x-g.position.x,wp.z-g.position.z),s:ws.x||1}}
 parts.sort((a,b)=>a.userData.asm.y-b.userData.asm.y);
 const n=parts.length,top=parts.length?parts[n-1].userData.asm.y:2;
 parts.forEach((o,k)=>{const A=o.userData.asm;A.t0=0.25+(k/n)*(ASM_T-1.1);A.dur=0.4+Math.random()*0.15;
  const a=Math.random()*6.283;A.off=new THREE.Vector3(Math.cos(a)*0.5,1.6+Math.random()*0.8,Math.sin(a)*0.5).multiplyScalar(1/A.s);o.visible=false});
 const ring=new THREE.Mesh(ASM_RING,new THREE.MeshBasicMaterial({color:0x7fe8ff,transparent:true,opacity:0.8,depthWrite:false}));ring.rotation.x=Math.PI/2;
 const pad=new THREE.Mesh(G.hex,new THREE.MeshBasicMaterial({color:TC[u.team],transparent:true,opacity:0.25,depthWrite:false}));pad.scale.set(2.2,0.02,2.2);
 scene.add(ring,pad);
 u.asm={t:0,parts,top,ring,pad,lk:0};u.spawn=ASM_T;u.from=null;
 if(u.team===0)toast('Titán en ensamble');
}
function asmTick(e,dt){
 const A=e.asm,m=e.mesh;A.t+=dt;const t=A.t,base=m.position;
 for(const o of A.parts){const S=o.userData.asm;
  if(t<S.t0){o.visible=false;continue}
  const k=Math.min(1,(t-S.t0)/S.dur),q=1-Math.pow(1-k,3);o.visible=m.visible;
  o.position.set(S.p.x+S.off.x*(1-q),S.p.y+S.off.y*(1-q),S.p.z+S.off.z*(1-q));
  if(k>=1&&!S.done){S.done=1;o.position.copy(S.p);
   if(m.visible&&(A.lk++)%3===0){const r=S.r*0.6,a=Math.random()*6.283;sparkBurst(base.x+Math.cos(a)*r,base.y+S.y,base.z+Math.sin(a)*r,3,1.4)}}
 }
 const p=Math.min(1,t/(ASM_T-0.6));
 A.ring.position.set(base.x,base.y+0.1+p*A.top,base.z);A.ring.scale.setScalar(1.15-0.25*p);A.ring.material.opacity=(0.45+0.35*Math.sin(t*14))*(1-Math.max(0,(t-ASM_T+0.6)/0.6));A.ring.visible=m.visible;
 A.pad.position.set(base.x,heightAt(base.x,base.z)+0.03,base.z);A.pad.material.opacity=0.25*(1-Math.max(0,(t-ASM_T+0.4)/0.4));A.pad.visible=m.visible;
 if(t>=ASM_T||e.dead){
  for(const o of A.parts){o.position.copy(o.userData.asm.p);o.visible=true}
  scene.remove(A.ring,A.pad);A.ring.material.dispose();A.pad.material.dispose();e.asm=null;
  if(!e.dead&&m.visible){for(let i=0;i<8;i++){const a=i*0.785;dust(base.x+Math.cos(a)*0.9,heightAt(base.x,base.z)+0.05,base.z+Math.sin(a)*0.9,0.45,1.1)}sparkBurst(base.x,base.y+A.top*0.7,base.z,8,2.2);shake=Math.max(shake,0.15)}
  if(e.team===0&&!e.dead)toast('Titán listo')}
}

