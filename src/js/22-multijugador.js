// ================= MULTIJUGADOR 1v1 POR SALA (anfitrión con autoridad) =================
// El anfitrión corre la simulación. El invitado manda órdenes y recibe instantáneas con el estado absoluto.
// El invitado se ve a sí mismo como bando 0: los bandos se intercambian con LT() al recibir y enviar.
const LT=t=>NET.role==='guest'?1-t:t;
const mpEnt=id=>{for(const e of ents)if(e.id===id&&!e.dead)return e;return null};
const mpName=()=>{const u=store.get('user',null);return String((u&&u.name)||'Jugador').slice(0,18)};
const mpSafe=s=>String(s==null?'':s).replace(/[<>&"]/g,'').slice(0,18);
const mpSpOk=s=>Number.isInteger(s)&&SPECIES[s]&&SPECIES[s].st?s:0;
async function mpRoom(){
 if(NET.lobby)return NET.lobby;
 try{const r=await SALA.lobby();if(!r)return null;NET.lobby=r;
  r.onPeers(()=>{if(!$('scrFriends').classList.contains('hide'))mpLobbyDraw()},()=>{NET.lobby=null;mpLobbyDraw()});
  mpLobbyPres();return r}catch(e){return null}
}
function mpLobbyPres(){const L=NET.lobby;if(!L)return;const p={n:mpName(),sp:CFG.species||0,v:VERSION};
 if(NET.role==='host'&&NET.code&&(!started||NET.wait))p.code=NET.code;L.presence({tac:p}).catch(()=>{})}
function mpBan(s){const b=$('mpBan');b.textContent=s||'';b.classList.toggle('on',!!s)}
// ---------- lobby
function mpLobbyOpen(){$('mpSt').textContent='Conectando con la sala…';mpLobbyDraw();mpRoom().then(r=>{if(!r)$('mpSt').textContent=SALA.sinSala;mpLobbyDraw()})}
function mpLobbyDraw(){
 const L=NET.lobby,box=$('mpList'),wt=$('mpWait');if(!box)return;
 const hosting=NET.role==='host'&&NET.R&&!started;
 wt.classList.toggle('hide',!hosting);$('mpCreate').classList.toggle('hide',!!hosting||!L);$('mpJoinRow').classList.toggle('hide',!!hosting||!L);
 if(hosting){$('mpCode').textContent=NET.code.toUpperCase();$('mpLink').value=mpLink()}
 $('mpLinkRow').classList.toggle('hide',SALA.lista);$('mpListH').classList.toggle('hide',!SALA.lista);$('mpNote').textContent=SALA.nota;
 if(!L){box.innerHTML='';return}
 if(!SALA.lista){box.innerHTML='';if(!NET.R)$('mpSt').textContent='Crea una partida y comparte el enlace, o escribe el código que te pasaron · tú eres '+mpName();return}
 const ps=L.peers().filter(p=>p.presence&&p.presence.tac);
 $('mpSt').textContent='En la sala: '+ps.length+(ps.length===1?' jugador':' jugadores')+' · tú eres '+mpName();
 const open=ps.filter(p=>!p.isMe&&typeof p.presence.tac.code==='string'&&/^[a-z0-9]{4}$/.test(p.presence.tac.code));
 box.innerHTML='';
 if(!open.length){const d=document.createElement('p');d.className='mu';d.textContent=hosting?'':'No hay partidas abiertas. Crea una y avísale a tu amigo.';box.appendChild(d)}
 for(const p of open){const T=p.presence.tac,b=document.createElement('button');b.className='mbtn';
  b.innerHTML='<span></span><small></small>';b.firstChild.textContent=mpSafe(T.n).toUpperCase()+' · '+T.code.toUpperCase();
  b.lastChild.textContent=(SPECIES[mpSpOk(T.sp)].n)+(p.guest?' · invitado':'')+(T.v&&T.v!==VERSION?' · otra versión ('+mpSafe(T.v)+')':'')+' · toca para unirte';
  b.disabled=hosting;b.onclick=()=>mpJoin(T.code);box.appendChild(b)}
}
const mpLink=()=>location.origin+location.pathname+'#sala-'+NET.code;
function mpHashJoin(){const m=/^#sala-([a-z0-9]{4})$/i.exec(location.hash||'');if(!m)return;try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}showScr('scrFriends');setTimeout(()=>mpJoin(m[1]),300)}
const mpNewCode=()=>{const A='abcdefghjkmnpqrstuvwxyz23456789';let s='';for(let i=0;i<4;i++)s+=A[Math.floor(Math.random()*A.length)];return s};
async function mpHost(){
 const L=await mpRoom();if(!L||NET.R)return;
 NET.role='host';$('mpSt').textContent='Abriendo la sala…';
 for(let k=0;k<3&&!NET.R;k++){NET.code=mpNewCode();try{NET.R=await L.join('tac-'+NET.code,{host:true})}catch(e){if(!e||e.code!=='taken'){NET.role='';NET.code='';$('mpSt').textContent=(e&&e.message)||'No se pudo abrir la sala';toast('No se pudo abrir la sala');return}}}
 if(!NET.R){NET.role='';NET.code='';toast('No se pudo abrir la sala');return}
 $('mpSt').textContent=SALA.lista?'Partida abierta: aparece en la lista de tu amigo':'Sala abierta · comparte el enlace o el código';
 mpWire(NET.R);NET.R.presence({role:'host',n:mpName(),sp:CFG.species||0,v:VERSION}).catch(()=>{});mpLobbyPres();mpLobbyDraw();
}
async function mpJoin(code){
 code=String(code||'').toLowerCase().trim();if(!/^[a-z0-9]{4}$/.test(code)){toast('Código de 4 caracteres');return}
 const L=await mpRoom();if(!L||NET.R)return;
 NET.role='guest';NET.code=code;
 $('mpSt').textContent='Buscando la partida '+code.toUpperCase()+'…';
 try{NET.R=await L.join('tac-'+code,{host:false})}catch(e){NET.role='';NET.code='';const m=(e&&e.message)||'No se pudo entrar a la sala';$('mpSt').textContent=m+' · revisa el código';toast(m);return}
 mpWire(NET.R);NET.R.presence({role:'guest',n:mpName(),sp:CFG.species||0,v:VERSION}).catch(()=>{});
 $('mpSt').textContent='Entrando a la partida '+code.toUpperCase()+'…';
 NET.joinT=performance.now();
}
function mpWire(R){
 R.on('snap',m=>{if(NET.role==='guest'&&m.peer===NET.host&&!m.sameTab)mpOnSnap(m.data)});
 R.on('start',m=>{if(NET.role==='guest'&&!m.sameTab)mpOnStart(m)});
 R.on('cmd',m=>{if(NET.role==='host'&&!m.sameTab)mpOnCmd(m)});
 R.on('bye',m=>{if(m.sameTab)return;if(m.peer===(NET.role==='host'?NET.opp:NET.host))mpOppGone(true)});
 R.onPeers(()=>mpPeers(),()=>{if(NET.on&&!over)mpOppGone(false)});
}
const mpPeer=pid=>NET.R?NET.R.peers().find(p=>p.peer===pid):null;
function mpPeers(){
 if(!NET.R)return;const ps=NET.R.peers();
 if(NET.role==='host'){
  const cur=NET.opp&&ps.find(p=>p.peer===NET.opp);
  if(cur){NET.oppN=mpSafe(cur.presence.n);if(cur.presence.bye)mpOppGone(true);return}
  if(NET.opp){NET.opp=null;NET.goneT=performance.now()}
  const g=ps.find(p=>!p.isMe&&p.presence&&p.presence.role==='guest');
  if(g){NET.opp=g.peer;NET.oppN=mpSafe(g.presence.n)||'Rival';NET.oppSp=mpSpOk(g.presence.sp);NET.goneT=0;NET.startT=0;if(!started)mpBegin();else{mpBan(NET.oppN+' volvió · sincronizando…');}}
  else if(started&&!over&&!NET.wait){NET.wait=true;mpBan('Tu rival se desconectó · esperando que vuelva (código '+NET.code.toUpperCase()+')');mpLobbyPres()}
 }else{
  const h=NET.host&&ps.find(p=>p.peer===NET.host);
  if(h){NET.goneT=0;if(h.presence&&h.presence.bye)mpOppGone(true)}else if(NET.host&&!NET.goneT)NET.goneT=performance.now();
 }
}
// ---------- inicio de partida
function mpBegin(){
 const ks=Object.keys(PLANETS);NET.pl=PLANETS[CFG.planet]?CFG.planet:ks[Math.floor(Math.random()*ks.length)];
 NET.seed=Math.floor(Math.random()*1e9);NET.gid=1+Math.floor(Math.random()*1e9);
 NET.on=true;NET.wait=false;NET.frame=0;NET.evq=[];NET.evId=0;NET.done=[];NET.ak=[];FL=1;
 NET.sz=SIZES[CFG.size]?CFG.size:'m';NET.sh=shapeFor(CFG.shape);
 showScr(null);buildCards();newGame({mp:1,seed:NET.seed,pl:NET.pl,sz:NET.sz,sh:NET.sh,fs:NET.oppSp});started=true;paused=false;over=false;last=performance.now();
 mpLobbyPres();toast('Partida contra '+NET.oppN+' · '+PL.n+' · '+shapeName(MSH)+' · '+SIZES[MSZ].n);mpBan('Esperando a '+NET.oppN+'…');
}
function mpOnStart(m){
 const d=m.data;if(!d||!Number.isInteger(d.seed)||!PLANETS[d.pl])return;
 const hp=mpPeer(m.peer);if(!hp||!hp.presence||hp.presence.role!=='host')return;
 if(NET.on&&NET.gid===d.gid&&NET.host===m.peer){NET.R.presence({ready:d.gid}).catch(()=>{});return}
 NET.host=m.peer;NET.gid=d.gid;NET.oppN=mpSafe(d.hn)||'Rival';
 NET.on=true;NET.synced=false;NET.map.clear();NET.gone.clear();NET.buf={};NET.lastFull=0;NET.evSeen.clear();NET.pend=[];NET.lastSnap=0;NET.goneT=0;FL=-1;
 showScr(null);buildCards();newGame({mp:1,guest:1,seed:d.seed,pl:d.pl,sz:SIZES[d.sz]?d.sz:'m',sh:shapeFor(d.sh),fs:mpSpOk(d.hs)});started=true;paused=false;over=false;last=performance.now();
 NET.R.presence({ready:d.gid}).catch(()=>{});mpBan('Sincronizando con '+NET.oppN+'…');toast('Partida contra '+NET.oppN+' · '+PL.n);
}
// ---------- instantáneas (anfitrión → invitado)
function mpEvent(o){if(!(NET.on&&NET.role==='host'))return;o.id=++NET.evId;o.ts=performance.now();NET.evq.push(o);if(NET.evq.length>12)NET.evq.shift()}
function mpSnap(){
 const f=++NET.frame,now=performance.now(),hb=ents.some(e=>!e.dead&&e.kind==='b'&&BD[e.type].key&&e.team===0),cb=ents.some(e=>!e.dead&&e.kind==='b'&&BD[e.type].key&&e.team===1);
 const H={f,g:+gameTime.toFixed(2),m:money.map(v=>Math.floor(v)),c:charge.map(o=>{const r={};for(const k in o)r[k]=Math.round((+o[k]||0)*100)/100;return r}),mu:mslUsed.slice(),x:x2?1:0,ak:NET.ak.slice(-12),
  ev:NET.evq.filter(v=>now-v.ts<2500).map(v=>{const o=Object.assign({},v);delete o.ts;return o})};
 if(over)H.ov=hb&&!cb?1:!hb&&cb?2:3;
 const items=[];
 for(const e of ents){if(e.dead)continue;
  if(e.kind==='u')items.push([e.id,e.type,e.team,e.tile,e.next,Math.round(e.mt*100),Math.ceil(e.hp),e.max,e.dest,e.focus&&!e.focus.dead?e.focus.id:-1,(e.spawn>0?1:0)|(e.boarded?2:0),e.post==null?-1:e.post]);
  else items.push([e.id,'#'+e.type,e.team,e.tile,Math.ceil(e.hp),e.max,e.built?1:0,Math.round(e.prog*100),e.lvl||1,e.foot||0]);
 }
 const parts=[];let cur=[],sz=0;
 for(const it of items){const s=JSON.stringify(it).length+1;if(sz+s>2900&&cur.length){parts.push(cur);cur=[];sz=0}cur.push(it);sz+=s}
 parts.push(cur);
 parts.forEach((L,k)=>{const d=k===0?Object.assign({},H):{f};d.n=parts.length;d.k=k;d.L=L;NET.R.emit('snap',d).catch(()=>{})});
}
function mpOnSnap(d){
 if(!d||!Number.isInteger(d.f)||!Number.isInteger(d.k)||!Number.isInteger(d.n)||d.n<1||d.n>12||!Array.isArray(d.L))return;
 if(d.f<NET.lastFull)return;
 const B=NET.buf[d.f]||(NET.buf[d.f]={n:d.n,got:0,parts:[]});if(B.parts[d.k])return;B.parts[d.k]=d;B.got++;
 NET.auth=true;
 try{
  if(d.k===0)mpHeader(d);
  for(const it of d.L)if(Array.isArray(it))mpApply(it);
  if(d.k===0&&Array.isArray(d.ev))for(const v of d.ev)if(v&&!NET.evSeen.has(v.id)){NET.evSeen.add(v.id);mpDoEv(v)}
  if(B.got===B.n&&d.f>NET.lastFull){
   NET.lastFull=d.f;const ids=new Set();B.parts.forEach(p=>p.L.forEach(it=>ids.add(it[0])));
   for(const[id,e]of NET.map)if(!ids.has(id)){NET.gone.add(id);NET.map.delete(id);if(!e.dead)kill(e)}
   ents=ents.filter(e=>!e.dead);
   for(const k in NET.buf)if(+k<=d.f)delete NET.buf[k];
   if(!NET.synced){NET.synced=true;mpBan('');const h=pwrHQ(0);if(h){cam.x=tiles[h.tile].x;cam.z=tiles[h.tile].z+3;updCam()}}
  }
 }finally{NET.auth=false}
 NET.lastSnap=performance.now();
}
function mpHeader(d){
 if(typeof d.g==='number'&&Math.abs(d.g-gameTime)>0.5)gameTime=d.g;
 if(Array.isArray(d.m))money=[+d.m[LT(0)]||0,+d.m[LT(1)]||0];
 if(Array.isArray(d.c)&&d.c.length===2){const cp=o=>{const r={};for(const k in o)if(SUP[k])r[k]=+o[k]||0;return r};charge=[cp(d.c[LT(0)]||{}),cp(d.c[LT(1)]||{})]}
 if(Array.isArray(d.mu))mslUsed=[d.mu[LT(0)]?1:0,d.mu[LT(1)]?1:0];
 if(d.x&&!x2){x2=true;toast('⚡ Energía ×2')}
 if(Array.isArray(d.ak)&&NET.pend.length)NET.pend=NET.pend.filter(p=>!d.ak.includes(p.s));
 if(d.ov&&!over&&NET.synced){const w=d.ov===1?LT(0):d.ov===2?LT(1):-1;mpEnd(w===0,w<0?'Empate':'')}
}
const mpPos=(ti,nx,k)=>{const a=tiles[ti];if(nx<0||!tiles[nx])return{x:a.x,z:a.z};const b=tiles[nx];return{x:a.x+(b.x-a.x)*k,z:a.z+(b.z-a.z)*k}};
function mpApply(it){
 const id=it[0];if(!Number.isInteger(id)||NET.gone.has(id))return;
 let e=NET.map.get(id);if(e&&e.dead){NET.map.delete(id);e=null}
 const tm=LT(it[2]===1?1:0),ti=it[3];if(!Number.isInteger(ti)||!tiles[ti])return;
 if(typeof it[1]==='string'&&it[1][0]==='#'){
  const ty=it[1].slice(1);if(!BD[ty])return;const foot=Array.isArray(it[9])&&it[9].length===3&&it[9].every(f=>tiles[f])?it[9]:null;
  if(!e){e=addBuilding(tm,ty,ti,!!it[6],foot);e.hid=id;NET.map.set(id,e);if(!it[6])e.prog=(+it[7]||0)/100}
  const L=Math.min(3,Math.max(1,it[8]|0));
  if(ty==='hq'){let g=0;while((e.lvl||1)<L&&g++<3){money[tm]+=BASEUP[e.lvl||1];if(!upgradeB(e))break}}
  else if((e.lvl||1)<L)applyLvl(e,L,false);
  e.max=+it[5]||e.max;e.hp=Math.min(+it[4]||1,e.max);
  if(ty==='hq'&&e.tile!==ti&&e.mesh.userData.rover){const far=hd(e.tile,ti)>1;rovStep(e,ti);if(far){e.rk=1;e.cx=tiles[ti].x;e.cz=tiles[ti].z}}
  if(!e.built){if(it[6])e.prog=Math.max(e.prog,0.999);else if(Math.abs(e.prog-it[7]/100)>0.05)e.prog=it[7]/100}
  return;
 }
 const ty=it[1];if(!UD[ty])return;const air=UD[ty].cls==='air',fl=it[10]|0;
 if(!e){
  e=addUnit(tm,ty,ti);e.hid=id;NET.map.set(id,e);e.spawn=0;
  if(fl&1){const pr=producers(tm,UD[ty].req).sort((a,b)=>hd(a.tile,ti)-hd(b.tile,ti))[0];e.spawn=1.2;if(pr){e.from={x:tiles[pr.tile].x,z:tiles[pr.tile].z};pr.doorT=1.5}startAsm(e)}
  if(fl&2){if(occ(ti,air)===e)setOcc(ti,air,null);e.boarded=true}
 }
 e.max=+it[7]||e.max;e.hp=Math.min(Math.max(1,+it[6]||1),e.max);
 if(e.boarded||e.carry||e.fly||(fl&2))return;
 const nx=Number.isInteger(it[4])&&tiles[it[4]]?it[4]:-1,mt=clamp((+it[5]||0)/100,0,1);
 const hp=mpPos(ti,nx,mt),lp=entPos(e);
 if(Math.hypot(hp.x-lp.x,hp.z-lp.z)>1.0){
  if(occ(e.tile,air)===e)setOcc(e.tile,air,null);if(e.next>=0&&occ(e.next,air)===e)setOcc(e.next,air,null);
  e.tile=ti;e.next=nx;e.mt=nx>=0?Math.max(0.0001,mt):0;setOcc(ti,air,e);if(nx>=0)setOcc(nx,air,e);
  e.path=[];if(e.dest>=0)e.path=astar(e.next>=0?e.next:e.tile,e.dest,air,false,e)||[];
 }
 const d=it[8];if(Number.isInteger(d)&&d>=0&&tiles[d]&&d!==e.dest){e.dest=d;e.path=astar(e.next>=0?e.next:e.tile,d,air,false,e)||[]}
 if(Number.isInteger(it[11])&&tiles[it[11]])e.post=it[11];
 const fo=Number.isInteger(it[9])&&it[9]>=0?NET.map.get(it[9]):null;if(fo&&!fo.dead&&fo.team!==e.team&&e.focus!==fo){e.focus=fo;e.auto=true}
}
function mpDoEv(v){
 if(!v||typeof v!=='object')return;
 if(v.e==='pw'&&SUP[v.k]&&Number.isInteger(v.i)&&tiles[v.i]){const t=LT(v.t===1?1:0),d=1-t;mslUsed[t]=0;charge[t][v.k]=1;
  if(v.k==='missile'){if(v.ix){mslUsed[d]=0;charge[d].missile=1}else charge[d].missile=0}
  usePowerRaw(t,v.k,v.i)}
 else if(v.e==='pk'){const b=NET.map.get(v.b);if(b&&!b.dead&&Number.isInteger(v.i)&&tiles[v.i])startDrop(b.team,v.i,b)}
 else if(v.e==='fo'){const b=NET.map.get(v.b),D=b&&DROPS.find(x=>x.b===b);if(D&&D.free&&Number.isInteger(v.i)&&tiles[v.i])freeApply(D,v.a,v.i)}
 else if(v.e==='dd'){const b=NET.map.get(v.b),D=b&&DROPS.find(x=>x.b===b);if(D)dropDown(D)}
}
// ---------- órdenes (invitado → anfitrión)
function mpCmd(c){const p={s:++NET.seq,c,t:0,n:0};NET.pend.push(p);mpSend(p)}
function mpSend(p){p.t=performance.now();p.n++;if(NET.R)NET.R.emit('cmd',{s:p.s,c:p.c}).catch(e=>{if(e&&e.code==='not_permitted'){p.dead=1;mpBan('Sin permiso para mandar órdenes: pide acceso de colaborador al dueño del juego')}})}
const mpIds=us=>[...us].filter(u=>u&&!u.dead&&u.hid).map(u=>u.hid);
function mpOnCmd(m){
 if(m.peer!==NET.opp||!started||over)return;const d=m.data;if(!d||!Number.isInteger(d.s))return;
 if(!NET.done.includes(d.s)){NET.done.push(d.s);if(NET.done.length>80)NET.done.shift();try{mpExec(1,d.c)}catch(e){}}
 NET.ak.push(d.s);if(NET.ak.length>24)NET.ak.splice(0,NET.ak.length-24);
}
function mpExec(T,c){
 if(!c||typeof c!=='object')return;
 const I=v=>Number.isInteger(v)&&v>=0&&v<tiles.length;
 const mine=ids=>Array.isArray(ids)?ids.slice(0,60).map(mpEnt).filter(u=>u&&u.team===T&&u.kind==='u'&&!u.boarded):[];
 if(typeof c.p==='string'&&(UD[c.p]||BD[c.p]||SUP[c.p])&&I(c.i)){const i=c.p==='sat'?(T?HQC:HQP):c.i;if(!why(T,c.p,i))place(T,c.p,i);return}
 if(c.mv&&I(c.i)){const us=mine(c.mv);us.forEach(u=>u.wps=[]);orderMove(us,c.i);return}
 if(c.wp&&I(c.i)){mine(c.wp).forEach(u=>{(u.wps||(u.wps=[])).push(c.i)});return}
 if(c.at){const t=mpEnt(c.tg);if(t&&t.team!==T){const us=mine(c.at);us.forEach(u=>u.wps=[]);orderAttack(us,t)}return}
 if(c.st){mine(c.st).forEach(u=>{u.path=[];u.dest=-1;u.focus=null;u.auto=false;u.wps=[];u.post=u.next>=0?u.next:u.tile});return}
 if(c.rp){const b=mpEnt(c.rp);if(b&&b.kind==='b'&&b.team===T&&b.built&&!(b.repairLeft>0)&&b.hp<b.max){const k=repCost(b);if(money[T]>=k){money[T]-=k;b.repairLeft=b.max-b.hp}}return}
 if(c.rv!=null||c.rs){const h=pwrHQ(T);if(h&&isRover(h)){if(c.rs)h.mv=null;else if(I(c.rv))rovOrder(h,c.rv)}return}
 if(c.up){const h=pwrHQ(T);if(h)upgradeB(h);return}
 if(c.fo&&I(c.i)){const b=mpEnt(c.fo),D=b&&DROPS.find(x=>x.b===b);if(D&&D.team===T&&D.free)freeOrder(D,String(c.a),c.i);return}
 if(c.pk&&I(c.i)){const b=mpEnt(c.pk);if(b&&b.team===T&&b.type==='barracks'&&passable(c.i,false))startDrop(T,c.i,b)}
}
// ---------- por cuadro
function mpSimOk(){return !NET.on||(NET.role==='host'?!NET.wait:NET.synced&&!NET.hostGone)}
function mpTick(dt){
 if(!NET.on||!NET.R)return;const now=performance.now();
 if(NET.role==='host'){
  const op=NET.opp&&mpPeer(NET.opp),ready=!!(op&&op.presence&&op.presence.ready===NET.gid);
  if(op&&!ready&&now-(NET.startT||0)>1000){NET.startT=now;NET.R.emit('start',{gid:NET.gid,seed:NET.seed,pl:NET.pl,sz:NET.sz,sh:NET.sh,hs:CFG.species||0,gs:NET.oppSp,hn:mpName()}).catch(e=>{if(e&&e.code==='not_permitted')mpBan('Sin permiso para crear partidas: pide acceso de colaborador al dueño del juego')})}
  if(ready&&NET.wait){NET.wait=false;last=now;mpLobbyPres()}
  if(ready&&$('mpBan').classList.contains('on')&&!NET.wait)mpBan('');
  NET.snapT-=dt;if(NET.snapT<=0&&op){NET.snapT=over?1:0.15;mpSnap()}
 }else{
  for(const p of NET.pend)if(now-p.t>700){if(p.n>=6)p.dead=1;else mpSend(p)}
  NET.pend=NET.pend.filter(p=>!p.dead);
  if(NET.synced&&!over){const st=now-NET.lastSnap,bt=$('mpBan').textContent;if(st>2500){if(!bt.startsWith('Reconectando'))mpBan('Conexión inestable con '+NET.oppN+'…')}else if(bt.startsWith('Conexión')||bt.startsWith('Reconectando'))mpBan('')}
  if(NET.goneT&&!over){const g=now-NET.goneT;if(g>60000)mpOppGone(false);else if(g>2000&&!NET.rejoining&&now-(NET.lastTry||0)>5000)mpRejoin()}
 }
 if(NET.role==='host'&&NET.goneT&&!NET.opp&&!over&&started&&!NET.wait){NET.wait=true;mpBan('Tu rival se desconectó · esperando que vuelva (código '+NET.code.toUpperCase()+')');mpLobbyPres()}
}
// el invitado perdió al anfitrión (red, app en segundo plano): vuelve a entrar a la misma sala sin perder la partida
async function mpRejoin(){
 NET.rejoining=true;NET.lastTry=performance.now();mpBan('Reconectando con '+NET.oppN+'…');
 const L=NET.lobby,old=NET.R;try{if(old)old.leave().catch(()=>{})}catch(e){}
 try{const R=await L.join('tac-'+NET.code,{host:false});if(!NET.on){R.leave().catch(()=>{});return}NET.R=R;mpWire(R);R.presence({role:'guest',n:mpName(),sp:CFG.species||0,v:VERSION,ready:NET.gid}).catch(()=>{})}catch(e){}
 finally{NET.rejoining=false}
}
function mpEnd(win,why2){
 if(over)return;over=true;$('endT').textContent=why2||(win?'VICTORIA':'DERROTA');$('endT').style.color=win?TCS[0]:TCS[1];$('bagain').style.display='none';
 $('endS').innerHTML='';$('endS').appendChild(document.createTextNode('1v1 contra '+NET.oppN+' · Tiempo '+$('clock').textContent.split(' ')[0]+' · v'+VERSION));
 mpBan('');setTimeout(()=>$('ovEnd').classList.remove('hide'),900);
}
function mpOppGone(bye){
 if(!NET.on||over)return;
 if(NET.role==='guest'){NET.hostGone=true;mpEnd(!!bye,bye?'VICTORIA':'SIN CONEXIÓN');if(!bye)$('endS').textContent='El anfitrión salió de la partida.';else $('endS').textContent=NET.oppN+' abandonó la partida.'}
 else if(bye){mpEnd(true,'VICTORIA');$('endS').textContent=NET.oppN+' abandonó la partida.'}
 else{NET.wait=true;mpBan('Tu rival se desconectó · esperando que vuelva (código '+NET.code.toUpperCase()+')');mpLobbyPres()}
}
function mpLeave(){
 const R=NET.R;
 if(R){try{if(NET.on&&!over){R.presence({bye:1}).catch(()=>{});R.emit('bye',{}).catch(()=>{});setTimeout(()=>R.emit('bye',{}).catch(()=>{}),150)}}catch(e){}setTimeout(()=>{try{R.leave().catch(()=>{})}catch(e){}},450)}
 Object.assign(NET,{on:false,role:'',R:null,opp:null,host:null,code:'',gid:0,synced:false,wait:false,hostGone:false,goneT:0,lastTry:0,rejoining:false,pend:[]});
 NET.map.clear();NET.gone.clear();NET.evSeen.clear();FL=1;mpBan('');$('bagain').style.display='';mpLobbyPres();
}

$('mpCreate').onclick=()=>mpHost();$('mpCancel').onclick=()=>{mpLeave();mpLobbyDraw()};$('mpJoinB').onclick=()=>mpJoin($('mpIn').value);
$('mpBack').onclick=()=>{if(NET.R&&!NET.on)mpLeave();showScr('scrMain')};
$('mpCopy').onclick=()=>{const v=$('mpLink').value;const ok=()=>toast('Enlace copiado');try{navigator.clipboard.writeText(v).then(ok,()=>{$('mpLink').select();toast('Copia el enlace a mano')})}catch(e){$('mpLink').select()}};

