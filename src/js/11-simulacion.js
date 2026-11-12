// ================= SIM =================
function updUnit(u,dt){
 if(u.boarded)return;
 const D=UD[u.type],air=D.cls==='air';
 if(u.fly){u.fly.t+=dt;if(u.fly.t>=u.fly.S.tB)u.fly=null}
 if(u.carry){const C=u.carry,S=C.S;C.t+=dt;if(C.by.dead&&C.t<=S.tD){u.carry=null;u.stun=0.2}else{if(C.t<S.tR&&C.t>S.tD&&C.by.dead)snatchRelease(S,C.t);
  if(C.t>=S.tL){u.carry=null;let nt=hexAt(S.L.x,S.L.z);nt=nearestFree(nt>=0?nt:u.tile,false,u,null);if(nt<0)nt=u.tile;
   if(nt!==u.tile){if(occ(u.tile,false)===u)setOcc(u.tile,false,null);setOcc(nt,false,u);u.tile=nt}
   u.post=u.tile;u.dest=-1;u.path=[];u.ox=S.L.x-tiles[u.tile].x+S.R.vx*0.3;u.oz=S.L.z-tiles[u.tile].z+S.R.vz*0.3;u.landV={x:S.R.vx,z:S.R.vz};
   const dmg=Math.max(70,u.max*0.55);u.hp-=dmg;hqHurt(u);hitFx(u,dmg);u.landFx=1;if(u.hp<=0){kill(u);return}}}}
 if(u.stun>0){u.stun-=dt;return}
 if(micFly(u)){u.gcd=(u.gcd||2)-dt;if(u.gcd<=0){let best=null;for(const e of ents){if(e.dead||e.team===u.team||e.kind!=='u'||UD[e.type].cls!=='inf'||e.carry||e.spawn>0)continue;if(hd(e.tile,u.tile)<=1){best=e;break}}
  if(best){u.gcd=9;if(best.next>=0){if(occ(best.tile,false)===best)setOcc(best.tile,false,null);best.tile=best.next;best.next=-1;best.mt=0;setOcc(best.tile,false,best)}
   const S=snatchPlan(u,best);best.carry={by:u,t:0,S};best.stun=S.tL+0.6;best.path=[];best.dest=-1;best.focus=null;u.fly={S,t:0};u.stun=S.tB}else u.gcd=0.5}}
 if(u.hp<u.max&&(u._hq=u._hq||0,(u._hq-=dt)<=0)){u._hq=1;const hq=aliveOf(u.team,'b').find(b=>b.type==='hq');u.nearHQ=!!hq&&distTo(u.tile,hq)<=2}
 if(u.nearHQ&&u.hp<u.max)u.hp=Math.min(u.max,u.hp+u.max*0.04*dt);
 if(u.spawn>0){u.spawn-=dt;if(u.spawn<=0&&u.pendingDest!=null){const d=u.pendingDest;u.pendingDest=null;orderMove([u],d)}return}
 u.cd-=dt;u.rp-=dt;
 if(u.focus&&u.focus.dead){if(!u.auto)u.post=u.tile;u.focus=null;u.auto=false}
 const leash=u.focus&&u.auto&&u.post!=null&&hd(u.tile,u.post)>2;
 if(leash){u.focus=null;u.auto=false;u.path=[];u.rp=0}
 // disparo: funciona también en movimiento (prioriza el objetivo ordenado)
 let t=null;
 if(u.focus&&distTo(u.tile,u.focus)<=effR(u,u.focus,D.atk.rng))t=u.focus;
 else t=enemyNear(u.team,u.tile,D.atk,D.atk.rng,u);
 u.face=t;
 if(t&&u.cd<=0){fire(u,t,D.atk);u.cd=D.atk.cd;if(u.type==='titan')u.vls=0.5}
 if(D.atk2){u.cd2=(u.cd2||0)-dt;if(u.cd2<=0){const t2=enemyNear(u.team,u.tile,D.atk2,D.atk2.rng,u);if(t2){fire(u,t2,D.atk2);u.cd2=D.atk2.cd;u.gat=0.4}}}
 if(u.next>=0){
  u.mt+=dt*D.spd*1.15*(u.sv||(u.sv=0.92+Math.random()*0.16))*(u.face&&evasive(u)?1.35:1)*((!air&&(tiles[u.tile].ramp||tiles[u.next].ramp))?0.88:1)*((!air&&tiles[u.tile].lv!==tiles[u.next].lv&&!tiles[u.tile].ramp&&!tiles[u.next].ramp)?0.7:1);
  if(u.mt<1)return;
  if(occ(u.tile,air)===u)setOcc(u.tile,air,null);
  u.tile=u.next;u.next=-1;u.mt=0;
 }
 if(u.pass===u.tile&&occ(u.tile,air)!==u){if(!u.path.length){const f=nearestFree(u.tile,air,u,null);if(f>=0&&f!==u.tile){u.path=astar(u.tile,f,air,true,u)||[];if(u.dest>=0)u.dest=f}}}else u.pass=-1;
 if(u.dest===u.tile)u.dest=-1;
 if(!u.path.length&&u.next<0&&u.dest>=0&&u.dest!==u.tile)u.dest=-1;
 if(!u.path.length&&u.dest<0&&u.wps&&u.wps.length&&!(u.focus&&!u.auto)){const d=u.wps.shift();orderMove([u],d);if(!u.path.length)u.dest=-1}
 if(!u.path.length){
  if(u.focus){
   if(u.auto&&hd(u.tile,u.focus.tile)>7){u.focus=null;u.auto=false}
   else if(t===u.focus)return;
   else if(u.rp<=0){u.rp=1;const g=approachTile(u,u.focus);u.path=g>=0?(astar(u.tile,g,air,true,u)||[]):[]}
  }else if(t)return;
  else if(u.dest<0){const e=enemyNear(u.team,u.tile,D.atk,D.atk.rng+1,u);if(e){u.focus=e;u.auto=true;u.rp=0}
   else if(u.post!=null&&u.post!==u.tile&&u.rp<=0){u.rp=1.5;const o=occ(u.post,air);if(o&&o!==u)u.post=u.tile;else{u.path=astar(u.tile,u.post,air,true,u)||[];if(!u.path.length)u.post=u.tile}}}
  if(!u.path.length)return;
 }else if(u.focus&&!u.ordered&&u.rp<=0&&t!==u.focus){u.rp=1;const g=approachTile(u,u.focus);if(g>=0)u.path=astar(u.tile,g,air,true,u)||u.path}
 else if(u.focus&&t===u.focus&&!u.ordered){u.path=[];return}
 if(!u.path.length)return;
 const n=u.path[0];
 if(!passable(n,air)){const goal=u.dest>=0?u.dest:u.path[u.path.length-1];u.path=passable(goal,air)?(astar(u.tile,goal,air,true,u)||[]):[];return}
 const o=occ(n,air);
 if(o&&o!==u&&!air&&o.team===u.team&&UD[o.type].cls==='inf'&&D.cls!=='inf'&&u.path.length>1&&o.next<0&&!o.path.length&&(air||canStep(u.tile,n,u))){
  const A=tiles[u.tile],B=tiles[n],dl=Math.hypot(B.x-A.x,B.z-A.z)||1;o.dodge={t:1.1,x:-(B.z-A.z)/dl,z:(B.x-A.x)/dl};
  u.wait=0;u.next=n;u.pass=n;u.path.shift();u.mt=0.0001;return}
 if(o&&o!==u){
  u.wait+=dt;
  if(o.team===u.team&&u.wait>0.15&&stepAside(o,u.tile))return;
  if(u.wait>0.5){
   u.wait=0;let goal=u.dest>=0?u.dest:u.path[u.path.length-1];
   const og=occ(goal,air);if(og&&og!==u&&og.next<0&&!og.path.length){goal=nearestFree(goal,air,u,null);if(u.dest>=0)u.dest=goal}
   u.path=goal>=0?(astar(u.tile,goal,air,true,u)||[]):[];
   if(!u.path.length)u.dest=-1;
  }
  return;
 }
 if(!air&&!canStep(u.tile,n,u)){u.path=[];return}
 u.wait=0;setOcc(n,air,u);u.next=n;u.path.shift();u.mt=0.0001;
 if(!u.path.length)u.ordered=false;
}
const incMul=()=>gameTime>=180?2:1;let x2=false;
function updBuilding(b,dt){
 const D=BD[b.type];
 if(b.repairLeft>0&&b.built){const h=Math.min(b.repairLeft,b.max*0.15*dt);b.hp=Math.min(b.max,b.hp+h);b.repairLeft-=h;if(b.hp>=b.max)b.repairLeft=0}
 if(!b.built){b.prog+=dt/D.bt;b.hp=Math.min(b.max,b.hp+dt*b.max*0.75/D.bt);if(b.prog>=1){b.prog=1;b.built=true;terrC[b.team].t=-1;if(b.team===0)toast(D.n+' listo');if(b.pendRef){b.pendRef=0;cuartelRefresh(b)}if(b.type==='barracks'&&(b.lvl||1)>=2&&teamSp(b.team)!==2)startArrive(b)}return}
 if(D.inc){
  if(b.type==='extractor'){const t=tiles[b.tile];if(t.amt>0){const take=Math.min(D.inc*(1+0.5*((b.lvl||1)-1))*incMul()*(b.team&&!NET.on?DIFFM[CFG.diff]:1)*dt,t.amt);t.amt-=take;money[b.team]+=take;if(t.amt<=0){t.crys&&t.crys.forEach(c=>c.visible=false);paintTiles();drawTerrMini()}}}
  else money[b.team]+=D.inc*incMul()*(b.team&&!NET.on?DIFFM[CFG.diff]:1)*dt;
 }
 if(D.atk){
  b.cd-=dt;const t=enemyNear(b.team,b.tile,D.atk,D.atk.rng,b);b.face=t;
  if(b.kamiCd>0)b.kamiCd-=dt;
  if(t&&b.cd<=0){if(b.type==='hq')hqFire(b,t);else fire(b,t,D.atk);b.cd=D.atk.cd}
 }
}
function updZones(dt){ // control de zonas apagado por ahora: los poderes cargan solos según el nivel del Centro de Control
 for(const tm of[0,1])for(const k in SUP){if(k==='missile'&&mslUsed[tm]){charge[tm][k]=0;continue}if(k==='dropper'){const free=dropBarracks(tm).some(b=>!b.drop);let best=0;for(const D of DROPS)if(D.team===tm)best=Math.max(best,Math.min(0.99,D.t/((D.T?D.T[9]:D.fly*2+3)+0.9)));charge[tm][k]=free?1:best;continue}if(pwrUnlocked(tm,k))charge[tm][k]=Math.min(1,(charge[tm][k]||0)+dt/SUP[k].time)}
}

