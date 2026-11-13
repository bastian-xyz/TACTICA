// ================= SUPPORT POWERS =================
function usePower(team,k,tile){
 if(NET.on&&NET.role==='guest'&&!NET.auth){if(team===0)mpCmd({p:k,i:tile});return}
 const d=1-team,pre=mslUsed[d];usePowerRaw(team,k,tile);
 if(NET.on&&NET.role==='host')mpEvent({e:'pw',t:team,k,i:tile,ix:k==='missile'&&!pre&&mslUsed[d]?1:0});
}
function usePowerRaw(team,k,tile){
 if(!SUP[k]||SUP[k].off)return;if(k==='dropper'){if(teamSp(team)===2)germinar(team,tile);else startDrop(team,tile);return}
 charge[team][k]=0;
 const t=tiles[tile];
 if(k==='cannon'){
  marker(t.x,t.z,2,0xffc04d,3.2);
  for(let n=0;n<9;n++){
   const near=tiles.filter(x=>hd(x.i,tile)<=2);const tt=near[Math.floor(Math.random()*near.length)];
   strikes.push({k:'shell',team,tile:tt.i,t:0.9+n*0.28,mesh:shellMesh()});
  }
  if(team===1)toast('¡Artillería enemiga!');
 }else if(k==='missile'){
  if(mslUsed[team])return;mslUsed[team]=1;siloLaunch(team);
  marker(t.x,t.z,2,0xff3b3b,3);const S={k:'missile',team,tile,t:3,mesh:missileMesh(team)};strikes.push(S);
  const d=1-team,dh=pwrHQ(d);
  if(dh&&!mslUsed[d]&&pwrUnlocked(d,'missile')&&charge[d].missile>=1&&hd(tile,dh.tile)<=INTR){mslUsed[d]=1;charge[d].missile=0;S.ix=0.3;S.dfn=d;S.im=missileMesh(d);
   const p=1-S.ix/2.4,e=p*p,sx=t.x+9,sy=48,sz=t.z-14;S.mp=new THREE.Vector3(sx+(t.x-sx)*e,sy+(t.h-sy)*e,sz+(t.z-sz)*e);S.sp=siloTop(dh);
   setTimeout(()=>siloLaunch(d),500);
   toast(team===1?'¡MISIL ENTRANTE! Tu misil sale a interceptarlo':'¡El enemigo intercepta tu misil!')}
  else if(team===1)toast('¡MISIL ENTRANTE!');
 }else if(k==='sat'){
  if(team===0){revealT=15;toast('Satélite: mapa revelado 15 s');updFog()}
 }else if(k==='patrol'){
  const z=zones[1];const src=z.own===team?z.cores[0]:(team?HQC:HQP);
  const used=new Set(),us=[];
  for(const ty of['rifle','rifle','buggy']){const i=nearestFree(src,false,null,used);if(i<0)continue;used.add(i*2);const u=addUnit(team,ty,i);u.free=true;us.push(u)}
  setTimeout(()=>orderMove(us,tile),1300);
  if(team===0)toast('Patrulla en camino');
 }
}
function missileMesh(team){
 const g=new THREE.Group(),b=new THREE.Group();g.add(b);b.rotation.x=Math.PI/2;
 if(teamSp(team)===2){const gc=new THREE.Color(0x2affc8),gm=glowMat(gc);const m=new THREE.Mesh(ICOG,gm);m.scale.set(0.7,1.5,0.7);b.add(m);for(let k=0;k<5;k++){const a=k*1.257;b.add(P(G.box,0x46385a,0.1,1.2,0.3,Math.cos(a)*0.3,0,Math.sin(a)*0.3,0,-a,0))}b.add(P(G.cone,new THREE.MeshBasicMaterial({color:0x8fffe0,transparent:true,opacity:0.7}),0.4,1.2,0.4,0,-1.1,0,Math.PI,0,0));g.scale.setScalar(1.6);g.visible=false;scene.add(g);return g}
 b.add(P(G.cyl,LIGHT,0.32,1.8,0.32,0,0,0),P(G.cone,0xd23a2a,0.32,0.6,0.32,0,1.2,0),P(G.cyl,TC[team],0.34,0.25,0.34,0,0.4,0));
 for(let k=0;k<4;k++)b.add(P(G.box,DARK,0.04,0.45,0.5,0,-0.75,0,0,k*Math.PI/2,0));
 const fl=P(G.cone,new THREE.MeshBasicMaterial({color:0xffc060}),0.3,0.9,0.3,0,-1.3,0,Math.PI,0,0);b.add(fl);
 g.scale.setScalar(1.6);g.visible=false;scene.add(g);return g;
}

