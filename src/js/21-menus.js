// ================= MENUS / DECK / SETTINGS =================
const store={get(k,d){try{const v=localStorage.getItem('tactica.'+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem('tactica.'+k,JSON.stringify(v))}catch(e){}}};
const PRODS=['barracks','factory','helipad','ialab'];
function showScr(id){document.querySelectorAll('.ov').forEach(o=>o.classList.add('hide'));if(id)$(id).classList.remove('hide');
 if(id==='scrFriends')mpLobbyOpen();if(id==='scrDeck')renderDeck();if(id==='scrSettings')renderSettings();if(id==='scrMain')$('deckCount').textContent=DECK.length+'/8 cartas';if(id==='scrVersus'){$('vsDiff').textContent=DIFFN[CFG.diff];renderPlanets()}if(id==='scrSpecies')renderSpecies();if(id==='scrMain'){homeInit();homeSync();homeBattle()}if(id==='scrUser'){const u=store.get('user',null);$('uName').value=u&&u.name||'';renderUserCols()}
 if(id==='scrDeck'){const sp=SPECIES[CFG.species||0];$('deckMsg').textContent=(sp.st||(CFG.species||0)===2)?'':'Tropas de '+sp.n+' en desarrollo: por ahora el mazo es Humano.'}}
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showScr(b.dataset.go)));
const strongOf=D=>{const n={inf:'infantería',veh:'vehículos',air:'aire',mec:'mechas',bld:'edificios'};const s=Object.keys(n).filter(k=>D.atk.vs[k]>=1.3).map(k=>n[k]);return s.length?'Fuerte vs '+s.join(', '):'Polivalente'};
const ABIL={
 rifle:['Pelotón de 5','Fuego rápido'],flamer:['Llamas a corta distancia','Quema edificios'],commando:['Élite','Rápido y polivalente'],apc:['Muy resistente','Ametralladora ligera'],mlrs:['Alcance 4','Salvas contra blindados'],gunship:['Vuela','Blindada','Ataque a tierra'],scout:['Vuela','Visión 8','Explorador'],android:['Androide','Láser alcance 2','Rápido'],spider:['Escala acantilados','Asalto a infantería'],mech:['Caminante blindado','Cañones dobles','Fuerte contra mechas'],sentinel:['Alcance 4','Defensa antiaérea láser'],swarm:['Enjambre de 5 microdrones','Vuela'],titan:['Coloso de asalto','Misiles contra vehículos y aire','Ametralladora rotativa contra infantería','Débil contra Mechas'],rocket:['Antiblindaje','Puede atacar aire'],sniper:['Alcance 3','Letal contra infantería','Frágil'],grenadier:['Granadas','Daña edificios'],
 buggy:['Muy rápido','Explora y captura zonas'],tank:['Blindado','Torreta giratoria'],aa:['Alcance 3','Defensa aérea'],artillery:['Alcance 4','Asedio','Lenta'],
 drone:['Vuela sobre ríos y acantilados','Cazatanques'],heli:['Vuela','Polivalente contra tierra'],fighter:['El más rápido','Caza aérea'],bomber:['Transporte VTOL armado','Turbinas basculantes','Destruye edificios']};
let deckTab='barracks',deckSel=null,repMode=false,dragDone=false;
function dropCard(k,from,j){
 if(from>=0){if(j>=DECK.length)j=DECK.length-1;const t=DECK[j];DECK[j]=DECK[from];DECK[from]=t}
 else{const at=DECK.indexOf(k);if(at>=0){if(j<DECK.length){const t=DECK[j];DECK[j]=k;DECK[at]=t}}else if(j<DECK.length)DECK[j]=k;else if(DECK.length<8)DECK.push(k)}
 repMode=false;deckSel=k;store.set(deckKey(),DECK);renderDeck();
}
function dragify(el,k,from){
 el.addEventListener('pointerdown',e=>{const sx=e.clientX,sy=e.clientY;let ghost=null;dragDone=false;
  const mv=ev=>{if(!ghost&&Math.hypot(ev.clientX-sx,ev.clientY-sy)>10){ghost=el.cloneNode(true);ghost.className+=' dghost';const r=el.getBoundingClientRect();ghost.style.width=r.width+'px';document.body.appendChild(ghost);$('dSlots').classList.add('rep');dragDone=true}
   if(ghost){ghost.style.left=ev.clientX+'px';ghost.style.top=ev.clientY+'px';ev.preventDefault();
    const t=document.elementFromPoint(ev.clientX,ev.clientY),sd=t&&t.closest('[data-slot]');document.querySelectorAll('.dslots .hov').forEach(x=>x.classList.remove('hov'));if(sd)sd.classList.add('hov')}};
  const up=ev=>{window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);
   if(ghost){ghost.remove();const t=document.elementFromPoint(ev.clientX,ev.clientY),sd=t&&t.closest('[data-slot]');if(sd)dropCard(k,from,+sd.dataset.slot);else renderDeck();setTimeout(()=>dragDone=false,50)}};
  window.addEventListener('pointermove',mv,{passive:false});window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up)});
}
const PV={r:null,scene:null,cam:null,obj:null};
function pvInit(){const cv=$('pvCanvas');PV.r=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});PV.r.setPixelRatio(Math.min(devicePixelRatio||1,2));
 PV.scene=new THREE.Scene();PV.scene.add(new THREE.HemisphereLight(0xdfeaff,0x2a2218,0.9));const d=new THREE.DirectionalLight(0xffffff,0.9);d.position.set(3,5,4);PV.scene.add(d);
 PV.cam=new THREE.PerspectiveCamera(30,1,0.1,50);PV.cam.position.set(3.3,2.6,3.9);PV.cam.lookAt(0,0.55,0);
 PV.scene.add(P(G.hex,0x2a323b,2.3,0.12,2.3,0,-0.06,0),(PV.rim=P(G.hex,0x2ad4ff,2.36,0.03,2.36,0,-0.1,0)))}
function pvShow(k){PV.k=k;if(!PV.r)pvInit();PV.rim.material=new THREE.MeshLambertMaterial({color:TC[0]});if(PV.obj)PV.scene.remove(PV.obj);const m=unitMesh(k,TC[0]);m.scale.setScalar(k==='titan'?0.85:1.5);if(UD[k].cls==='air')m.position.y=0.8;PV.obj=m;PV.scene.add(m);
 const cv=$('pvCanvas'),w=cv.clientWidth||140,h=cv.clientHeight||150;PV.r.setSize(w,h,false);PV.cam.aspect=w/h;PV.cam.updateProjectionMatrix()}
function pvTick(dt,now){if(!PV.obj||$('scrDeck').classList.contains('hide'))return;PV.obj.rotation.y+=dt*0.6;pvAnim(PV.obj,dt,now||0);PV.r.render(PV.scene,PV.cam)}
function pvAnim(m,dt,now){const ud=m.userData,spd=UD[PV.k].spd,aim=(now*0.001)%5>3,mv=!aim;
 if(ud.figs)for(const F of ud.figs){figPose(F,dt,mv,aim,spd);figYaw(F,dt,aim?0.5*Math.sin(now*0.0015):null);figArms(F,dt,mv,aim,aim?Math.pow(Math.max(0,Math.sin(now*0.012)),8):0)}
 if(ud.wheels)for(const w of ud.wheels)w.rotation.x+=dt*spd*9*(mv?1:0.2);
 if(ud.rotor)ud.rotor.rotation.y+=dt*28;
 if(ud.tail)ud.tail.rotation.x+=dt*40;
 if(ud.radar)ud.radar.rotation.y+=dt*2.5;
 if(ud.props)for(const r of ud.props)r.rotation.y+=dt*45;
 if(ud.gat)for(const sp of[].concat(ud.gat))sp.rotation.z+=dt*(aim?38:1.5);
 if(ud.flame)ud.flame.scale.y=0.28*(0.8+Math.random()*0.4)*(mv?1.4:0.8);
 if(ud.pods)for(const P2 of ud.pods){P2.fan.rotation.y+=dt*38;P2.pd.rotation.x+=((mv?-1.15:0)-P2.pd.rotation.x)*Math.min(1,dt*3)}
 if(ud.sleg)ud.sleg.forEach((l,i)=>{l.rotation.x=mv?Math.sin(now*0.02+i*1.7)*0.35:0});
 if(ud.swarm){ud.swarm.rotation.y+=dt*2.2;ud.swarm.children.forEach((d,i)=>{d.position.y=Math.sin(now*0.005+i)*0.08})}
 if(ud.tleg){ud._tph=(ud._tph||0)+(mv?dt*spd*7:0);for(const L of ud.tleg){const sn=Math.sin(ud._tph+(L.sd>0?Math.PI:0));L.hip.rotation.x=mv?sn*0.38:L.hip.rotation.x*0.9;L.knee.rotation.x=mv?Math.max(0,-sn)*0.45:L.knee.rotation.x*0.9}}
 if(ud.thull)ud.thull.position.y=0.62+(mv?Math.abs(Math.cos(ud._tph||0))*0.03:Math.sin(now*0.002)*0.006)}
const clsN={inf:'Infantería',veh:'Vehículo',air:'Aéreo',mec:'Mecha'};
function renderDeck(){
 if(!deckSel||!roster().includes(deckSel))deckSel=DECK[0]||roster()[0];deckTab=UD[deckSel].req;
 const D=UD[deckSel],inD=DECK.includes(deckSel);
 $('deckN').textContent=DECK.length+'/8';
 $('dName').textContent=D.n.replace('.','').replace('Francotir','Francotirador').replace('Lanzacoh','Lanzacohetes');
 $('dSub').textContent=clsN[D.cls]+' · '+BD[D.req].n;
 const bar=(l,v,mx,t)=>'<div class="st">'+l+'<i><b style="width:'+Math.min(100,v/mx*100)+'%"></b></i><span>'+t+'</span></div>';
 {const X=(CFG.species||0)===2&&MUD[deckSel]||D;$('dStats').innerHTML=bar('Vida',X.hp,520,X.hp)+bar('Daño',X.atk.dmg,90,X.atk.dmg)+bar('Cadencia',1/X.atk.cd,1.7,(1/X.atk.cd).toFixed(1)+'/s')+bar('Alcance',X.atk.rng,4,X.atk.rng)+bar('Velocidad',X.spd,2.6,X.spd)+bar('Costo',D.cost,260,'⚡'+D.cost)+bar('Población',D.pob,3,D.pob)}
 const n={inf:'infantería',veh:'vehículos',air:'aire',mec:'mechas',bld:'edificios'};
 $('dAbil').innerHTML=((CFG.species||0)===2&&MICU[deckSel]?MICU[deckSel].slice(1):(ABIL[deckSel]||[])).map(a=>'<span>'+a+'</span>').join('')+Object.keys(n).filter(k=>D.atk.vs[k]>=1.3).map(k=>'<span class="str">Fuerte vs '+n[k]+'</span>').join('')+Object.keys(n).filter(k=>!D.atk.vs[k]).map(k=>'<span style="opacity:.6">No ataca '+n[k]+'</span>').join('');
 const tg=$('dToggle');tg.textContent=inD?'QUITAR DEL MAZO':'AGREGAR AL MAZO';tg.classList.toggle('rm',inD);
 if(inD)repMode=false;
 $('deckMsg').textContent=repMode?'Toca la carta del mazo que quieres reemplazar por '+UD[deckSel].n+' (o arrástrala)':'';
 if(repMode){tg.textContent='CANCELAR REEMPLAZO'}
 tg.onclick=()=>{const m=$('deckMsg');m.textContent='';
  if(inD){if(DECK.length<=1){m.textContent='El mazo necesita al menos 1 carta';return}DECK=DECK.filter(x=>x!==deckSel)}
  else if(DECK.length>=8){repMode=!repMode;renderDeck();return}else DECK.push(deckSel);
  store.set(deckKey(),DECK);renderDeck()};
 const sl=$('dSlots');sl.innerHTML='';sl.classList.toggle('rep',repMode);
 for(let i=0;i<8;i++){const k=DECK[i],d=document.createElement('div');d.dataset.slot=i;if(k){d.className='f'+(k===deckSel?' cur':'');d.innerHTML='<svg viewBox="0 0 24 24">'+ICON[k]+'</svg>'+UD[k].n;
  d.onclick=()=>{if(dragDone)return;if(repMode){if(!DECK.includes(deckSel))DECK[i]=deckSel;repMode=false;store.set(deckKey(),DECK);renderDeck()}else{deckSel=k;renderDeck()}};dragify(d,k,i)}sl.appendChild(d)}
 const tb=$('dTabs');tb.innerHTML='';
 for(const b of PRODS){const bt=document.createElement('button');bt.className=b===deckTab?'on':'';const c=DECK.filter(x=>UD[x].req===b).length;
  bt.innerHTML='<svg viewBox="0 0 24 24">'+ICON[b]+'</svg>'+BD[b].n+'<small>'+c+' en mazo</small>';bt.onclick=()=>{deckSel=roster().find(x=>UD[x].req===b);renderDeck()};tb.appendChild(bt)}
 const cs=$('dCards');cs.innerHTML='';
 for(const k of roster().filter(x=>UD[x].req===deckTab)){const c=document.createElement('div');c.className='dcard2'+(DECK.includes(k)?' on':'')+(k===deckSel?' sel':'');
  c.innerHTML='<svg viewBox="0 0 24 24">'+ICON[k]+'</svg><b>'+UD[k].n+'</b><span>⚡'+UD[k].cost+'</span>';c.onclick=()=>{if(dragDone)return;if(repMode&&k!==deckSel)repMode=false;deckSel=k;renderDeck()};dragify(c,k,-1);cs.appendChild(c)}
 requestAnimationFrame(()=>pvShow(deckSel));
}

const DIFFN={facil:'Fácil',normal:'Normal',dificil:'Difícil'},DIFFM={facil:0.75,normal:1,dificil:1.75};const HARD=()=>CFG.diff==='dificil';
function renderFoe(){const g=$('foeGrid');if(!g)return;g.innerHTML='';const opts=[...SPECIES.map((S,i)=>S.st?i:-1).filter(i=>i>=0),'r'];
 for(const k of opts){const S=SPECIES[k],b=document.createElement('button');b.innerHTML=S?'<svg viewBox="0 0 40 40" fill="none" stroke="'+S.c+'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+SPG[k]+'</svg>'+S.n+'<small>'+S.k+'</small>':'<i style="background:conic-gradient(#2ad4ff,#8aff5a,#2ad4ff)"></i>Azar<small>Sorpresa</small>';
  b.className=(CFG.foe==null?'r':CFG.foe)===k?'on':'';b.onclick=()=>{CFG.foe=k;store.set('cfg',CFG);renderFoe()};g.appendChild(b)}}
function renderPlanets(){renderFoe();const g=$('plGrid');g.innerHTML='';
 for(const k of[...Object.keys(PLANETS),'random']){const Q=PLANETS[k],b=document.createElement('button');
  b.innerHTML='<i style="background:'+(Q?Q.ball:'conic-gradient(#8fd16a,#ffb060,#ffffff,#c08aff,#8fd16a)')+'"></i>'+(Q?Q.n:'Azar')+'<small>'+(Q?Q.sub:'Sorpresa')+'</small>';
  b.className=(CFG.planet===k||(k==='random'&&!PLANETS[CFG.planet]))?'on':'';
  b.onclick=()=>{CFG.planet=k;store.set('cfg',CFG);renderPlanets();if(!started){newGame();revealT=1e9}};g.appendChild(b)}
 const Q=PLANETS[CFG.planet];$('plDesc').textContent=Q?Q.d:'Cada partida sale en un planeta al azar.';renderMapOpts()}
// ---- forma y tamaño del mapa (Versus)
// Miniatura de ejemplo: genera un mapa chico de esa forma con semilla fija, lo dibuja y deja todo como estaba.
function mapThumb(cv,pk,sh){
 const keep=[tiles,zones,VILS,HQP,HQC,BASP,BASC,W,H,CX,CZ,PL,PLK,MSH,R];
 try{PLK=pk;PL=PLANETS[pk];MSH=sh;W=SIZES.p.w;H=SIZES.p.h;CX=SQ3*(W-0.5)/2;CZ=1.5*(H-1)/2;genMap(20261113);
  const k=3,c=cv.getContext('2d'),M=PL.mini;cv.width=Math.ceil((W+0.5)*2*k);cv.height=Math.ceil(H*1.75*k);c.fillStyle='#0a0e13';c.fillRect(0,0,cv.width,cv.height);
  // color por nivel (tinte del suelo del planeta, de oscuro a claro) para que se lea la forma; agua y campos de energía encima
  const g=parseInt(M.grass.slice(1),16),gr=g>>16,gg=g>>8&255,gb=g&255,K=[-0.5,-0.2,0.08,0.34,0.62],mix=(v,k)=>Math.round(k<0?v*(1+k):v+(255-v)*k);
  const LC=K.map(k=>'rgb('+mix(gr,k)+','+mix(gg,k)+','+mix(gb,k)+')');
  for(const t of tiles){c.fillStyle=t.type==='water'?M.liq:t.type==='ford'?'#e8e2c8':t.type==='litio'?'#ffd21f':t.wall?'#0b0d10':LC[t.lv];
   c.fillRect((t.c+0.5*(t.r&1))*2*k,t.r*1.75*k,2*k,1.75*k+0.5)}
  for(const i of[HQP,HQC]){const t=tiles[i];c.fillStyle=i===HQP?'#2ad4ff':'#ff5a3a';c.fillRect((t.c+0.5*(t.r&1))*2*k-k,t.r*1.75*k-k,4*k,3.75*k)}
 }catch(e){}
 [tiles,zones,VILS,HQP,HQC,BASP,BASC,W,H,CX,CZ,PL,PLK,MSH,R]=keep;
}
function renderMapOpts(){
 const pk=PLANETS[CFG.planet]?CFG.planet:'verdea',cur=shapeFor(CFG.shape),sz=SIZES[CFG.size]?CFG.size:'m';
 const bg=()=>{if(!started){newGame();revealT=1e9}};
 const g=$('shGrid');g.innerHTML='';
 for(const k in SHAPES){const b=document.createElement('button');b.className=k===cur?'on':'';
  const cv=document.createElement('canvas');b.appendChild(cv);mapThumb(cv,pk,k);
  b.appendChild(document.createTextNode(SHAPES[k].n));b.onclick=()=>{CFG.shape=k;store.set('cfg',CFG);renderMapOpts();bg()};g.appendChild(b)}
 $('shDesc').textContent=SHAPES[cur].d;
 const z=$('szGrid');z.innerHTML='';
 for(const k in SIZES){const S=SIZES[k],b=document.createElement('button');b.className=k===sz?'on':'';
  b.innerHTML='<span class="szb"><u style="width:'+Math.round(S.w/72*100)+'%;height:'+Math.round(S.h/40*100)+'%"></u></span>'+S.n+'<small>'+S.w+' × '+S.h+' · '+S.d+'</small>';
  b.onclick=()=>{CFG.size=k;store.set('cfg',CFG);renderMapOpts();bg()};z.appendChild(b)}
}
const SPG=['<path d="M20 4l13 6v10c0 8-6 13-13 16C13 33 7 28 7 20V10z"/><path d="M14 18l6 5 6-5"/>',
 '<path d="M20 3l10 12-10 22L10 15z"/><path d="M10 15h20M15 15l5 22 5-22M15 15l5-12 5 12"/>',
 '<path d="M7 18c0-7 6-12 13-12s13 5 13 12z"/><path d="M17 18v7M23 18v7M20 25v11M20 27l-9 7M20 27l9 7M14 31l-7-1M26 31l7-1"/><circle cx="15" cy="12" r="1.3"/><circle cx="24" cy="11" r="1.3"/>',
 '<path d="M8 5c2 8 6 11 12 11s10-3 12-11"/><path d="M12 21c0 8 4 14 8 14s8-6 8-14"/><path d="M15 25l3 1M25 25l-3 1"/>',
 '<path d="M20 4l14 8v16l-14 8-14-8V12z"/><path d="M20 12v8l7 4M20 20l-7 4"/><circle cx="20" cy="12" r="2"/><circle cx="27" cy="24" r="2"/><circle cx="13" cy="24" r="2"/>',
 '<circle cx="20" cy="9" r="4"/><path d="M20 15v20M20 18c-6-6-12-6-16-2 4 2 9 6 16 8M20 18c6-6 12-6 16-2-4 2-9 6-16 8"/>',
 '<path d="M5 31c7-2 11-8 11-17 4 4 6 8 6 12 2-6 6-10 13-12-2 10-9 17-18 19z"/><circle cx="26" cy="18" r="1.5"/>',
 '<path d="M20 22c-6 0-10 5-10 9 0 3 3 4 5 3s3-1 5-1 3 0 5 1 5 0 5-3c0-4-4-9-10-9z"/><ellipse cx="11" cy="16" rx="2.6" ry="3.4"/><ellipse cx="17" cy="10" rx="2.6" ry="3.6"/><ellipse cx="23" cy="10" rx="2.6" ry="3.6"/><ellipse cx="29" cy="16" rx="2.6" ry="3.4"/>'];
const WORLDS=[
 {n:'Kepler-442b',sp:0,ra:285.37,dec:39.28,d:1196,st:'Enana naranja K5',b:'Templado',pl:'verdea',pal:{water:0x0a3a9a,sand:0x7c5420,grass:0x1c6a14,tree:0x0a5e0a,wood:0x3a1408,ice:0xe8eef2,blue:0x0a2a7a,red:0xb02a20,star:0xffc040,lava:0}},
 {n:'TRAPPIST-1e',sp:1,ra:346.62,dec:-5.04,d:40.7,st:'Enana roja ultrafría M8',b:'Salares y geodas',pal:{water:0x4a1a6a,sand:0xe0c0d8,grass:0xc860c8,tree:0xff6ad5,wood:0x8a3a7a,ice:0xffe8f8,blue:0x6a2a9a,red:0xff4ad8,star:0xff9ae8,lava:0}},
 {n:'Kepler-186f',sp:2,ra:298.65,dec:43.95,d:490,st:'Enana roja M1',b:'Selva de luz roja',pl:'xenthe',pal:{water:0x0a5a4a,sand:0x4a3a40,grass:0x3a2a5a,tree:0x8a6aff,wood:0x2a1a3a,ice:0xc8f0e8,blue:0x0a6a5a,red:0x2affc8,star:0x2affc8,lava:0}},
 {n:'Proxima Centauri b',sp:3,ra:217.43,dec:-62.68,d:4.24,st:'Enana roja M5,5 con llamaradas',b:'Páramo de tormentas',pal:{water:0x3a0606,sand:0x5a2a1a,grass:0x4a0c0a,tree:0x1a0a08,wood:0x0a0404,ice:0x6a5a58,blue:0x5a0a0a,red:0xff3a1a,star:0xff5a2a,lava:0.35}},
 {n:'TOI-700 d',sp:4,ra:97.10,dec:-65.58,d:101.4,st:'Enana roja M2 tranquila',b:'Mesetas de silicio',pal:{water:0x0a1a2e,sand:0x8a9098,grass:0x4a5560,tree:0x7affff,wood:0x2a3038,ice:0xd8e8f0,blue:0x1a3a5a,red:0x7affff,star:0x7affff,lava:0}},
 {n:'Teegarden b',sp:5,ra:43.25,dec:16.88,d:12.5,st:'Enana roja M7',b:'Altiplano de nubes',pal:{water:0x5a7ab0,sand:0xf0eadc,grass:0xd8d0a8,tree:0xffe9a0,wood:0xb8a070,ice:0xffffff,blue:0x8aa8d8,red:0xffd36e,star:0xfff0b0,lava:0}},
 {n:'LP 791-18 d',sp:6,ra:165.69,dec:-16.40,d:90,st:'Enana roja M6',b:'Volcánico',pl:'kharon',pal:{water:0xff4a0a,sand:0x3e2a22,grass:0x2e2826,tree:0x1c1816,wood:0x120e0c,ice:0x4a4440,blue:0xff6a1a,red:0xffa040,star:0xffa040,lava:1}},
 {n:'LHS 1140 b',sp:7,ra:11.25,dec:-15.27,d:48.8,st:'Enana roja M4,5',b:'Bola de nieve con océano',pl:'nivalis',pal:{water:0x2a6a8c,sand:0xa8b4c0,grass:0xe8f0f6,tree:0x2c4034,wood:0x3a2e26,ice:0xffffff,blue:0x3a7a9c,red:0xd9a066,star:0xfff0d0,lava:0}}
];
const SM={yaw:0.6,pitch:0.62,sel:0,drag:null,auto:1,bg:null,t:0};
const smR=d=>(Math.log10(d)+0.2)/(Math.log10(1300)+0.2);
(()=>{for(const w of WORLDS){const r=smR(w.d),a=w.ra*Math.PI/180,dd=w.dec*Math.PI/180;w.v=[Math.cos(dd)*Math.cos(a)*r,Math.sin(dd)*r,Math.cos(dd)*Math.sin(a)*r]}
 const rr=rnd32(77);SM.bg=[];for(let i=0;i<220;i++)SM.bg.push([rr(),rr(),rr()*1.2+0.2,rr()])})();
function smProj(v,W,Hh){const cy=Math.cos(SM.yaw),sy=Math.sin(SM.yaw),cp=Math.cos(SM.pitch),sp=Math.sin(SM.pitch);
 let x=v[0]*cy-v[2]*sy,z=v[0]*sy+v[2]*cy,y=v[1];const y2=y*cp-z*sp,z2=y*sp+z*cp;const R=Math.min(W,Hh)*0.47,f=3.2,k=f/(f+z2);return[W/2+x*R*k,Hh*0.52-y2*R*k,z2,k]}
function smDraw(now){
 const c=$('starMap');if(!c||$('scrMain').classList.contains('hide'))return;
 const dpr=Math.min(devicePixelRatio||1,2),W=c.clientWidth,Hh=c.clientHeight;if(!W||!Hh)return;
 if(c.width!==Math.round(W*dpr)||c.height!==Math.round(Hh*dpr)){c.width=Math.round(W*dpr);c.height=Math.round(Hh*dpr)}
 const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,Hh);
 const T=now/1000;if(!SM.drag&&SM.auto)SM.yaw+=0.0022;
 for(const[x,y,s,p]of SM.bg){g.globalAlpha=0.25+0.35*Math.abs(Math.sin(T*0.7+p*9));g.fillStyle='#cfe3ff';g.fillRect(x*W,y*Hh,s,s)}g.globalAlpha=1;
 // anillos de distancia en el plano
 for(const[ly,lab]of[[10,'10 al'],[100,'100 al'],[1000,'1.000 al']]){const r=smR(ly);g.beginPath();for(let k=0;k<=64;k++){const a=k/64*Math.PI*2,p=smProj([Math.cos(a)*r,0,Math.sin(a)*r],W,Hh);k?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])}g.strokeStyle='#2ad4ff22';g.lineWidth=1;g.stroke();
  const p=smProj([r,0,0],W,Hh);g.fillStyle='#2ad4ff55';g.font='600 9px Rajdhani,sans-serif';g.fillText(lab,p[0]+3,p[1]-3)}
 // ejes del plano
 g.strokeStyle='#2ad4ff14';for(const a of[0,Math.PI/2]){const p1=smProj([Math.cos(a),0,Math.sin(a)],W,Hh),p2=smProj([-Math.cos(a),0,-Math.sin(a)],W,Hh);g.beginPath();g.moveTo(p1[0],p1[1]);g.lineTo(p2[0],p2[1]);g.stroke()}
 const O=smProj([0,0,0],W,Hh);
 const L=WORLDS.map((w,i)=>({w,i,p:smProj(w.v,W,Hh),b:smProj([w.v[0],0,w.v[2]],W,Hh)})).sort((a,b)=>b.p[2]-a.p[2]);
 for(const{w,i,p,b}of L){const S=SPECIES[w.sp],sel=i===SM.sel;
  g.setLineDash([2,3]);g.strokeStyle=S.c+(sel?'aa':'44');g.beginPath();g.moveTo(O[0],O[1]);g.lineTo(p[0],p[1]);g.stroke();g.setLineDash([]);
  g.strokeStyle=S.c+'33';g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(b[0],b[1]);g.stroke();g.fillStyle=S.c+'55';g.beginPath();g.arc(b[0],b[1],1.6,0,7);g.fill()}
 // Tierra
 {const gr=g.createRadialGradient(O[0],O[1],0,O[0],O[1],14);gr.addColorStop(0,'#bfe8ff');gr.addColorStop(0.3,'#3a8fd8aa');gr.addColorStop(1,'#3a8fd800');g.fillStyle=gr;g.beginPath();g.arc(O[0],O[1],14,0,7);g.fill();
  g.fillStyle='#e8f6ff';g.beginPath();g.arc(O[0],O[1],3,0,7);g.fill();g.font='700 10px Rajdhani,sans-serif';g.fillStyle='#bfe8ff';g.fillText('TIERRA',O[0]+6,O[1]+12)}
 for(const{w,i,p}of L){const S=SPECIES[w.sp],sel=i===SM.sel,k=p[3],rad=(sel?6:4.2)*k;
  const gr=g.createRadialGradient(p[0],p[1],0,p[0],p[1],rad*4.5);gr.addColorStop(0,S.c);gr.addColorStop(0.25,S.c+'88');gr.addColorStop(1,S.c+'00');g.fillStyle=gr;g.beginPath();g.arc(p[0],p[1],rad*4.5,0,7);g.fill();
  g.fillStyle='#fff';g.beginPath();g.arc(p[0],p[1],rad*0.55,0,7);g.fill();
  if(sel){const pr=rad*2.2+3*Math.sin(T*3);g.strokeStyle=S.c;g.lineWidth=1.5;g.beginPath();g.arc(p[0],p[1],pr+6,0,7);g.stroke();g.lineWidth=1}
  w.sx=p[0];w.sy=p[1];w.rad=rad}
 // etiquetas sin superponerse
 const boxes=[[O[0]+4,O[1]+2,46,14]],hit=(x,y,wd)=>boxes.some(b=>x<b[0]+b[2]&&x+wd>b[0]&&y<b[1]+b[3]&&y+22>b[1]);
 const order=WORLDS.map((w,i)=>i).sort((a,b)=>(b===SM.sel)-(a===SM.sel));
 for(const i of order){const w=WORLDS[i],S=SPECIES[w.sp],sel=i===SM.sel;g.font=(sel?'700 11px':'600 9.5px')+' Rajdhani,sans-serif';const wd=Math.max(g.measureText(w.n).width,g.measureText(S.n.toUpperCase()).width*0.95)+4;
  let bx=null,by=null;
  for(const[dx,dy]of[[1,0],[1,1],[1,-1],[-1,0],[1,2],[-1,1],[-1,-1],[1,-2],[-1,2],[-1,-2]]){const x=dx>0?w.sx+w.rad+5:w.sx-w.rad-5-wd,y=w.sy-12+dy*21;if(x<2||x+wd>W-2||y<2||y+22>Hh-14)continue;if(!hit(x,y,wd)){bx=x;by=y;break}}
  if(bx===null){bx=w.sx+w.rad+5;by=w.sy-12}
  boxes.push([bx,by,wd,22]);
  if(Math.abs(by-(w.sy-12))>2||bx<w.sx){g.strokeStyle=S.c+'66';g.beginPath();g.moveTo(w.sx,w.sy);g.lineTo(bx<w.sx?bx+wd:bx,by+9);g.stroke()}
  g.fillStyle=sel?'#fff':'#c9d6e1';g.fillText(w.n,bx,by+9);g.font='600 8.5px Rajdhani,sans-serif';g.fillStyle=S.c;g.fillText(S.n.toUpperCase(),bx,by+19)}
}
function smInfo(){if(!$('wInfo'))return;const w=WORLDS[SM.sel],S=SPECIES[w.sp],dist=w.d<10?w.d.toFixed(1).replace('.',','):Math.round(w.d).toLocaleString('es-CL');
 $('wInfo').innerHTML='<div class="wt"><b class="wn" style="color:'+S.c+'">'+w.n+'</b><div class="wm">'+dist+' años luz · '+w.st+'<br>Mundo de los <b style="color:'+S.c+'">'+S.n+'</b> · '+w.b+'</div></div>'+(w.pl?'<button id="wPlay">JUGAR AQUÍ</button>':'<button disabled>PRÓXIMAMENTE</button>');
 const b=$('wPlay');if(b)b.onclick=()=>{CFG.planet=w.pl;store.set('cfg',CFG);startLocal()}}
(()=>{const c=$('starMap');if(!c)return;let st=null;
 c.addEventListener('pointerdown',e=>{c.setPointerCapture(e.pointerId);st={x:e.clientX,y:e.clientY,yaw:SM.yaw,pitch:SM.pitch,mv:0};SM.drag=1});
 c.addEventListener('pointermove',e=>{if(!st)return;const dx=e.clientX-st.x,dy=e.clientY-st.y;st.mv=Math.max(st.mv,Math.abs(dx)+Math.abs(dy));SM.yaw=st.yaw-dx*0.01;SM.pitch=clamp(st.pitch+dy*0.006,-0.2,1.35)});
 const up=e=>{if(!st)return;if(st.mv<7){const r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let bi=-1,bd=32;WORLDS.forEach((w,i)=>{const d=Math.hypot(w.sx-x,w.sy-y);if(d<bd){bd=d;bi=i}});if(bi>=0){SM.sel=bi;smInfo()}}st=null;SM.drag=null;SM.auto=0;setTimeout(()=>SM.auto=1,4000)};
 c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);
 const tick=now=>{smDraw(now);requestAnimationFrame(tick)};requestAnimationFrame(tick);smInfo()})();
function renderSpecies(){$('spList').innerHTML=SPECIES.map((S,i)=>'<div class="spc'+(i===(CFG.species||0)?' cur':'')+'" data-i="'+i+'" style="--sc2:'+S.c+'26;border-color:'+S.c+'44"><i class="'+(S.st?'ok':S.l?'l':'')+'"></i><svg viewBox="0 0 40 40" fill="none" stroke="'+S.c+'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 6px '+S.c+'aa)">'+SPG[i]+'</svg><b style="color:'+S.c+'">'+S.n.toUpperCase()+'</b></div>').join('');
 document.querySelectorAll('#spList .spc').forEach(el=>el.onclick=()=>{CFG.species=+el.dataset.i;store.set('cfg',CFG);homeSync();teamColors();if(!started){buildCards();newGame();revealT=1e9}showScr('scrMain')});}
const HOME={r:null,scene:null,cam:null,g:null,mats:[],mixer:null,atm:null,t:0,rot:0,drag:null};
const spWorld=i=>WORLDS.find(w=>w.sp===i);
const CIDPAL={petroleo:{n:'Petróleo',d:'La original C.I.D.: petróleo y cian sobre pizarra.',negro:'#111827',f0:'#070c14',f1:'#0b111a',pet:'#0f4c5c',br:'#17738a',ac:'#7fd3e3',cl:'#8fe6f2',cian:'#4fd8e8',plata:'#9ca3af',blanco:'#f8fafc'},grafito:{n:'Grafito',d:'Grises neutros y acento blanco, sin color.',negro:'#161618',f0:'#09090a',f1:'#0e0e10',pet:'#3a3a40',br:'#5c5c64',ac:'#d2d2d8',cl:'#ececf0',cian:'#dedee4',plata:'#96969c',blanco:'#f6f6f8'},arena:{n:'Arena',d:'Beige arena sobre café oscuro.',negro:'#1c1812',f0:'#0c0a07',f1:'#13100c',pet:'#5a4a30',br:'#8c744c',ac:'#e2c896',cl:'#f0deb6',cian:'#ecce8c',plata:'#aaa294',blanco:'#fcf9f2'},neon:{n:'Neón',d:'Cian eléctrico y fucsia, estilo cyberpunk.',negro:'#0e0c18',f0:'#06050c',f1:'#0a0912',pet:'#5a145a',br:'#0096a0',ac:'#00ffcc',cl:'#96ffe8',cian:'#ff40b8',plata:'#a298b6',blanco:'#faf8ff'},oxido:{n:'Óxido',d:'Rojo óxido y coral.',negro:'#1c0e0e',f0:'#0c0606',f1:'#130a0a',pet:'#641c18',br:'#a83228',ac:'#f57a66',cl:'#ffa28e',cian:'#ff604c',plata:'#b09694',blanco:'#fff6f4'},magenta:{n:'Magenta',d:'Rosa magenta intenso.',negro:'#1c0e1c',f0:'#0c060c',f1:'#130a13',pet:'#641450',br:'#aa2882',ac:'#f57ac8',cl:'#ffa2de',cian:'#ff5cbe',plata:'#b096aa',blanco:'#fff6fc'},artico:{n:'Ártico',d:'Hielo celeste sobre azul noche.',negro:'#0e161e',f0:'#060a0e',f1:'#0a1016',pet:'#285a6e',br:'#468caa',ac:'#bee8f8',cl:'#def5ff',cian:'#a2e2fa',plata:'#a0b0ba',blanco:'#fafdff'},indigo:{n:'Índigo',d:'Violeta índigo.',negro:'#141024',f0:'#090712',f1:'#0e0b1b',pet:'#3c2478',br:'#6440be',ac:'#b698ff',cl:'#cebaff',cian:'#ac84ff',plata:'#a09bb6',blanco:'#f8f6ff'},olivo:{n:'Olivo',d:'Verde oliva militar y caqui.',negro:'#14160e',f0:'#080905',f1:'#0d0f09',pet:'#3c4e1e',br:'#647e32',ac:'#b8d270',cl:'#d0e698',cian:'#acdc5c',plata:'#a0a490',blanco:'#f7f8f0'},esmeralda:{n:'Esmeralda',d:'Verde esmeralda profundo.',negro:'#0c1814',f0:'#050b09',f1:'#08110e',pet:'#0c523a',br:'#16825c',ac:'#70dcaa',cl:'#98ecc4',cian:'#48e2a0',plata:'#96a8a0',blanco:'#f4faf7'},alquimia:{n:'Alquimia',d:'Cian y rojo sobre carbón, como la portada.',negro:'#101214',f0:'#070809',f1:'#0b0c0e',pet:'#5a181e',br:'#aa2834',ac:'#78dcec',cl:'#ff7c86',cian:'#ff525e',plata:'#a0a4a8',blanco:'#f8f9fa'},cobalto:{n:'Cobalto',d:'Azul cobalto de plano técnico.',negro:'#0c1224',f0:'#050812',f1:'#080d1b',pet:'#143278',br:'#2454be',ac:'#7aa6fa',cl:'#a2c4ff',cian:'#5c98ff',plata:'#96a0b6',blanco:'#f4f7ff'},cobre:{n:'Cobre',d:'Cobre y naranja tostado, cálido de taller.',negro:'#1a120e',f0:'#0c0806',f1:'#120c09',pet:'#5c2d16',br:'#964e26',ac:'#e89860',cl:'#f6b886',cian:'#f28e50',plata:'#ac9c92',blanco:'#faf6f2'},ambar:{n:'Ámbar',d:'Amarillo ámbar de señalética industrial.',negro:'#18140a',f0:'#0a0804',f1:'#100d07',pet:'#5a420a',br:'#966e14',ac:'#f0c048',cl:'#fad87a',cian:'#ffc63e',plata:'#a8a08c',blanco:'#faf8f0'}};
const THEMES=[
 {a2:'#3a2aff',bg:'#07090c',pn:'#0d1218',ln:'#1e2833'},
 {a2:'#9a2aff',bg:'#0b060b',pn:'#170c16',ln:'#36182f'},
 {a2:'#8a6aff',bg:'#070a07',pn:'#0e150f',ln:'#1f3320'},
 {a2:'#ff7a2a',bg:'#0c0606',pn:'#170c0c',ln:'#381a1a'},
 {a2:'#2a6aff',bg:'#050a0c',pn:'#0b1518',ln:'#183038'},
 {a2:'#d8b84a',bg:'#0b0a07',pn:'#17150d',ln:'#363020'},
 {a2:'#ff4a1a',bg:'#0c0805',pn:'#18100a',ln:'#3a2414'},
 {a2:'#6a9ac0',bg:'#0a0908',pn:'#15120f',ln:'#332a20'}];
const TCOLS=['#2ad4ff','#ff7a2a','#8aff5a','#ff6ad5','#ff3a3a','#7affff','#ffe14d','#ff9a2a','#d9a066','#9a6aff','#3a6aff','#ffffff'];
function applyTheme(){const i=CFG.species||0,T=THEMES[i],r=document.documentElement.style;BD.extractor.n=EXN[i]||'Reactor';if(!HUMU.rifle)for(const k in UD){HUMU[k]=UD[k].n;HUMI[k]=ICON[k]}for(const k in MICU){UD[k].n=i===2?MICU[k][0]:HUMU[k];ICON[k]=i===2?MICI[k]:HUMI[k]}if(applyTheme.sp!==i){applyTheme.sp=i;loadDeck()}for(const k in MICN)BD[k].n=i===2?MICN[k]:HUMN[k];ICON.turret=i===2?'<path d="M12 21v-7M12 18c-3 0-5-1-6-3M12 18c3 0 5-1 6-3"/><circle cx="11" cy="9" r="4"/><path d="M15 8l4-2M15 10l4 2"/><circle cx="21" cy="5" r="1"/>':'<rect x="6" y="8" width="10" height="7" rx="1"/><path d="M16 10h5M16 13h5M3 9v5M8 15v3M14 15v3M5 21h12"/>';ICON.extractor=i===2?'<path d="M12 21v-7M12 14c-2-2-5-1-6 1M12 13c2-2 5-1 6 1M8 21h8"/><circle cx="12" cy="8" r="4.5"/>':'<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="9" ry="3.5"/><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-60 12 12)"/>';r.setProperty('--c0',SPECIES[i].c);r.setProperty('--a2',T.a2);r.setProperty('--bg',T.bg);r.setProperty('--pn',T.pn);r.setProperty('--ln',T.ln);applyPal()}
function applyPal(){const r=document.documentElement.style,i=CFG.species||0,T=THEMES[i],P=CIDPAL[CFG.pal];const hx=c=>'#'+c.getHexString(),C=x=>new THREE.Color(x);
 let V;if(P)V=P;else{const c0=C(SPECIES[i].c),bg=C(T.bg);V={negro:T.pn,f0:T.bg,f1:hx(bg.clone().lerp(C(T.pn),0.5)),pet:hx(bg.clone().lerp(c0,0.28)),br:T.a2,ac:SPECIES[i].c,cl:hx(c0.clone().lerp(C('#ffffff'),0.3)),cian:SPECIES[i].c,plata:'#8a98a6',blanco:'#e8eef3'}}
 for(const k in V)if(k!=='n'&&k!=='d')r.setProperty('--cid-'+k,V[k]);
 if(P){r.setProperty('--c0',P.ac);r.setProperty('--a2',P.br);r.setProperty('--bg',P.f0);r.setProperty('--pn',P.negro);r.setProperty('--ln',hx(C(P.negro).lerp(C(P.plata),0.22)));r.setProperty('--tx',hx(C(P.blanco).lerp(C(P.plata),0.18)));r.setProperty('--mu',P.plata)}
 else{r.removeProperty('--tx');r.removeProperty('--mu')}}
const cdist=(a,b)=>{const A=new THREE.Color(a),B=new THREE.Color(b);return Math.hypot(A.r-B.r,A.g-B.g,A.b-B.b)};
function teamColors(){const u=store.get('user',null)||{};const me=u.color||SPECIES[CFG.species||0].c;
 let foe=['#ff7a2a','#ff3a3a','#2ad4ff','#8aff5a','#ff6ad5','#ffe14d','#9a6aff'].sort((a,b)=>cdist(b,me)-cdist(a,me))[0];
 {const fc=SPECIES[FOESP||0].c;if(cdist(fc,me)>0.6)foe=fc}
 TCS[0]=me;TCS[1]=foe;TC[0]=new THREE.Color(me).getHex();TC[1]=new THREE.Color(foe).getHex();
 document.documentElement.style.setProperty('--c1',foe);
 hiMesh.material.color.set(me);edgeMesh.material.color.set(new THREE.Color(me).lerp(new THREE.Color(0xffffff),0.35));COL.hi.set(me)}
function renderUserCols(){const u=store.get('user',null)||{},box=$('uCol');box.innerHTML='';
 const mk=(c,lab)=>{const b=document.createElement('button');if(lab){b.className='auto'+(!u.color?' on':'');b.textContent=lab}else{b.style.background=c;if(u.color===c)b.className='on'}
  b.onclick=()=>{const v=store.get('user',null)||{};v.color=lab?'':c;store.set('user',v);renderUserCols()};box.appendChild(b)};
 mk(null,'Auto: color de la especie');TCOLS.forEach(c=>mk(c))}
// ---------- planetas hexagonales procedurales del inicio
const HXW=[
 {water:0.55,mount:0.12,pole:0.86,liq:'water',rivers:6,col:{liq:0x0a3a9a,shore:0xc8a860,land:0x2a7a1a,land2:0x5a8a2a,mnt:0x6a6660,peak:0xf2f6fa,ice:0xf0f6fa,core:0x0a1020,river:0x1a5ac8},props:[{t:'pine',on:['land'],p:0.6,n:3}],clouds:{n:14,col:0xffffff}},
 {water:0.26,mount:0.15,liq:'water',rivers:0,col:{liq:0x4a1a6a,shore:0xf6e6f0,land:0xecc8de,land2:0xd4a0cc,mnt:0x7a5a8a,peak:0xb08ac0,ice:0xffffff,core:0x1a0a20},props:[{t:'crystal',on:['mnt','peak'],p:0.7,n:3},{t:'crystal',on:['land'],p:0.12,n:2}],clouds:{n:5,col:0xffd8f0}},
 {water:0.45,mount:0.1,liq:'water',rivers:4,col:{liq:0x0a5a4a,shore:0x4a3a40,land:0x3a2a5a,land2:0x5a3a7a,mnt:0x2a2232,peak:0x4a3a5a,ice:0xc8f0e8,core:0x08060f,river:0x0a7a6a},props:[{t:'mush',on:['land','shore'],p:0.55,n:2}],clouds:{n:9,col:0xd8fff4}},
 {water:0.16,mount:0.16,liq:'brine',rivers:0,night:1,col:{liq:0x6a0a08,shore:0x3a1a12,land:0x7a3018,land2:0x4a1a0e,mnt:0x1a1210,peak:0x2a1a18,ice:0x9a9aa8,core:0x100404},props:[{t:'spire',on:['mnt','land'],p:0.25,n:2,day:1}],clouds:{n:12,col:0x5a2a20}},
 {water:0.4,mount:0.2,flat:1,liq:'water',rivers:0,col:{liq:0x0a1a2e,shore:0x8a9098,land:0x5a646e,land2:0x4a525c,mnt:0x8a949e,peak:0x9aa4ae,ice:0xd8e8f0,core:0x05080c},props:[{t:'antenna',on:['mnt','peak'],p:0.35,n:1},{t:'antenna',on:['land'],p:0.08,n:1}],clouds:{n:5,col:0xb8d0e0}},
 {water:0.33,mount:0.22,flat:1,liq:'water',rivers:2,col:{liq:0x5a8ac0,shore:0xfff4dc,land:0xf0e6c8,land2:0xe0d0a0,mnt:0xfaf6ee,peak:0xffffff,ice:0xffffff,core:0x2a3040,river:0x7aa8d8},props:[{t:'gspire',on:['mnt','peak'],p:0.35,n:1}],clouds:{n:22,col:0xfffaf0}},
 {water:0.22,mount:0.2,liq:'lava',rivers:10,col:{liq:0xff4a0a,shore:0x2a2220,land:0x2e2826,land2:0x3e2a22,mnt:0x1c1816,peak:0x141010,ice:0x4a4440,core:0x200800,river:0xff6a14,crater:0xffb030},props:[{t:'rock',on:['land','shore'],p:0.22,n:2}],clouds:{n:12,col:0x3a3634}},
 {water:0.14,mount:0.14,liq:'water',rivers:0,eye:1,col:{liq:0x2a7aa8,shore:0x8aa0b0,land:0xe8f0f6,land2:0xd0dce6,mnt:0xb0cce0,peak:0xffffff,ice:0xffffff,core:0x0a1420},props:[{t:'pine',on:['shore','land'],p:0.7,n:3,near:1}],clouds:{n:10,col:0xffffff}}
];
function hxNoise(seed){const h=(x,y,z)=>{const s=Math.sin(x*127.1+y*311.7+z*74.7+seed*13.13)*43758.5453;return s-Math.floor(s)};const sm=t=>t*t*(3-2*t);
 const vn=(x,y,z)=>{const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=sm(x-xi),yf=sm(y-yi),zf=sm(z-zi);let r=0;for(let a=0;a<2;a++)for(let b=0;b<2;b++)for(let c=0;c<2;c++)r+=h(xi+a,yi+b,zi+c)*(a?xf:1-xf)*(b?yf:1-yf)*(c?zf:1-zf);return r};
 return(x,y,z)=>{let s=0,a=0.5,f=1.5;for(let o=0;o<5;o++){s+=a*vn(x*f+o*7.1,y*f-o*3.3,z*f+o*1.7);a*=0.5;f*=2.07}return s}}
let HXG=null;
function hxGrid(){if(HXG)return HXG;const g=new THREE.IcosahedronGeometry(1,13),P=g.attributes.position.array,map=new Map(),V=[],F=[];
 const vid=i=>{const x=P[i*3],y=P[i*3+1],z=P[i*3+2],k=Math.round(x*1e4)+','+Math.round(y*1e4)+','+Math.round(z*1e4);let id=map.get(k);if(id===undefined){id=V.length;map.set(k,id);V.push(new THREE.Vector3(x,y,z).normalize())}return id};
 for(let i=0;i<P.length/3;i+=3)F.push([vid(i),vid(i+1),vid(i+2)]);
 const vf=V.map(()=>[]),nb=V.map(()=>new Set());F.forEach((f,fi)=>{for(let k=0;k<3;k++){vf[f[k]].push(fi);nb[f[k]].add(f[(k+1)%3]);nb[f[k]].add(f[(k+2)%3])}});
 const FC=F.map(f=>new THREE.Vector3().add(V[f[0]]).add(V[f[1]]).add(V[f[2]]).normalize());
 HXG=V.map((v,i)=>{const t1=Math.abs(v.y)<0.9?new THREE.Vector3(0,1,0):new THREE.Vector3(1,0,0);const u=new THREE.Vector3().crossVectors(v,t1).normalize(),w=new THREE.Vector3().crossVectors(v,u);
  return{c:v,cs:vf[i].map(fi=>FC[fi]).sort((a,b)=>Math.atan2(a.dot(w),a.dot(u))-Math.atan2(b.dot(w),b.dot(u))),nb:[...nb[i]],u,w}});
 g.dispose();return HXG}
const HXPG={pine:[[new THREE.ConeGeometry(0.017,0.055,6).translate(0,0.032,0),0]],
 mush:[[new THREE.CylinderGeometry(0.004,0.006,0.03,5).translate(0,0.015,0),0,0xe8e0f0],[new THREE.SphereGeometry(0.017,8,4,0,Math.PI*2,0,Math.PI/2).translate(0,0.028,0),1]],
 crystal:[[new THREE.ConeGeometry(0.009,0.065,4).translate(0,0.03,0),1]],
 spire:[[new THREE.ConeGeometry(0.008,0.075,4).translate(0,0.035,0),0,0x120a08],[new THREE.SphereGeometry(0.004,5,4).translate(0,0.072,0),1,0xff3a1a]],
 antenna:[[new THREE.CylinderGeometry(0.0025,0.0035,0.055,4).translate(0,0.027,0),0,0x3a4450],[new THREE.BoxGeometry(0.011,0.011,0.011).translate(0,0.058,0),1,0x7affff]],
 gspire:[[new THREE.ConeGeometry(0.007,0.07,6).translate(0,0.034,0),0,0xfaf6ee],[new THREE.SphereGeometry(0.008,8,6).translate(0,0.074,0),1,0xffd36e]],
 rock:[[new THREE.DodecahedronGeometry(0.012,0).translate(0,0.004,0),0,0x241e1c]]};
const HXC={};
function hxBuild(wi){
 if(HXC[wi])return HXC[wi];
 const G=HXW[wi],C=G.col,cells=hxGrid(),N=cells.length,nz=hxNoise(wi*17+3),R=rnd32(wi*97+11);
 const S=new THREE.Vector3(1,0.25,0.35).normalize();
 const e=cells.map(c=>nz(c.c.x+5,c.c.y+5,c.c.z+5)+(G.eye?(1-c.c.dot(S))*0.9:0));
 const srt=[...e].sort((a,b)=>a-b),q=f=>srt[Math.min(N-1,Math.floor(f*N))];
 const sea=q(G.water),mnt=q(1-G.mount),peak=q(1-G.mount*0.3);
 const T=cells.map((c,i)=>{const x=e[i];let t=x<sea?'liq':x>=peak?'peak':x>=mnt?'mnt':'land';if(G.pole&&Math.abs(c.c.y)>G.pole&&t!=='peak')t=t==='liq'?'icesheet':'ice';
  if(G.night&&c.c.x<-0.15){t=t==='liq'?'icesheet':t==='land'?'ice':t}return t});
 cells.forEach((c,i)=>{if(T[i]==='land'&&c.nb.some(j=>T[j]==='liq'))T[i]='shore'});
 const H=new Float32Array(N);
 cells.forEach((c,i)=>{const t=T[i],x=e[i];H[i]=t==='liq'?1:t==='icesheet'?1.012:t==='shore'?1.016:(t==='land'||t==='ice')?1.022+Math.max(0,x-sea)*0.05:t==='mnt'?(G.flat?1.07:1.05+(x-mnt)*0.3):(G.flat?1.075:1.09+(x-peak)*0.35)});
 const glow=new Uint8Array(N);
 if(G.liq==='lava')cells.forEach((c,i)=>{if(T[i]==='liq')glow[i]=1});
 if(G.rivers){const tops=cells.map((c,i)=>i).filter(i=>(T[i]==='peak'||T[i]==='mnt')&&cells[i].nb.every(j=>H[j]<=H[i]));
  tops.sort(()=>R()-0.5).slice(0,G.rivers).forEach(s=>{if(G.liq==='lava'){T[s]='crater';glow[s]=1;H[s]-=0.012}
   let cur=s;const seen=new Set([s]);for(let k=0;k<70;k++){const nx=cells[cur].nb.filter(j=>!seen.has(j)).sort((a,b)=>H[a]-H[b])[0];if(nx===undefined)break;seen.add(nx);if(T[nx]==='liq'||T[nx]==='river')break;
    if(T[nx]!=='crater'){T[nx]='river';H[nx]=1+(H[nx]-1)*0.45+0.002;if(G.liq==='lava')glow[nx]=1}cur=nx}})}
 const colOf=(i)=>{const t=T[i],c=new THREE.Color();
  if(t==='land'){c.setHex(C.land).lerp(new THREE.Color(C.land2),clamp((e[i]-sea)/(mnt-sea+1e-6),0,1))}
  else if(t==='liq')c.setHex(C.liq);else if(t==='river')c.setHex(C.river||C.liq);else if(t==='crater')c.setHex(C.crater||C.liq);else if(t==='icesheet')c.setHex(C.ice).multiplyScalar(0.92);else c.setHex(C[t]||C.land);
  if(!glow[i])c.multiplyScalar(0.9+0.2*R());return c};
 const sol={p:[],c:[]},gl={p:[],c:[]},IN=0.94,BR=0.975;
 const push=(o,v,c)=>{o.p.push(v.x,v.y,v.z);o.c.push(c.r,c.g,c.b)};
 cells.forEach((cell,i)=>{const o=glow[i]?gl:sol,col=colOf(i),sc=col.clone().multiplyScalar(0.55),h=H[i],cen=cell.c.clone().multiplyScalar(h);
  const top=cell.cs.map(k=>cell.c.clone().lerp(k,IN).normalize().multiplyScalar(h)),bot=cell.cs.map(k=>cell.c.clone().lerp(k,IN).normalize().multiplyScalar(BR));
  for(let k=0;k<top.length;k++){const a=top[k],b=top[(k+1)%top.length],a2=bot[k],b2=bot[(k+1)%top.length];
   push(o,cen,col);push(o,a,col);push(o,b,col);
   push(o,a,sc);push(o,a2,sc);push(o,b2,sc);push(o,a,sc);push(o,b2,sc);push(o,b,sc)}});
 const grp=new THREE.Group();
 const mk=(o,mat)=>{if(!o.p.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(o.p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(o.c,3));g.computeVertexNormals();grp.add(new THREE.Mesh(g,mat))};
 mk(sol,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:0.85,metalness:0,side:THREE.DoubleSide}));
 mk(gl,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide}));
 grp.add(new THREE.Mesh(new THREE.SphereGeometry(BR+0.002,32,20),new THREE.MeshBasicMaterial({color:C.core})));
 // props
 const near=new Uint8Array(N);cells.forEach((c,i)=>{if(T[i]==='liq')c.nb.forEach(j=>{near[j]=1;cells[j].nb.forEach(k=>near[k]=1)})});
 const pl={};const o3=new THREE.Object3D(),up=new THREE.Vector3(0,1,0);
 for(const pr of G.props){cells.forEach((cell,i)=>{if(!pr.on.includes(T[i])||R()>pr.p)return;if(pr.near&&!near[i])return;if(pr.day&&cell.c.x<-0.15)return;
  const n=1+Math.floor(R()*pr.n);for(let k=0;k<n;k++){const a=R()*6.283,r=R()*0.022;const p=cell.c.clone().addScaledVector(cell.u,Math.cos(a)*r).addScaledVector(cell.w,Math.sin(a)*r).normalize();
   o3.position.copy(p).multiplyScalar(H[i]-0.002);o3.quaternion.setFromUnitVectors(up,p);o3.rotateY(R()*6.283);o3.scale.setScalar(0.75+R()*0.6);o3.updateMatrix();(pl[pr.t]=pl[pr.t]||[]).push(o3.matrix.clone())}})}
 const TC2={pine:G.eye?0x1e3428:0x1a4a14,crystal:0xff6ad5,mush:[0x2affc8,0xff4ad8,0x8a6aff]};
 for(const t in pl){const ms=pl[t];HXPG[t].forEach(([geo,isGlow,col])=>{const mat=isGlow?new THREE.MeshBasicMaterial({color:0xffffff}):new THREE.MeshStandardMaterial({color:0xffffff,flatShading:true,roughness:0.8});
  const im=new THREE.InstancedMesh(geo,mat,ms.length);const cc=new THREE.Color();ms.forEach((m,j)=>{im.setMatrixAt(j,m);const base=col!=null?col:TC2[t];cc.setHex(Array.isArray(base)?base[j%base.length]:base);if(!isGlow)cc.multiplyScalar(0.85+0.3*R());im.setColorAt(j,cc)});grp.add(im)})}
 // nubes
 const cl=new THREE.Group(),cm=new THREE.MeshLambertMaterial({color:G.clouds.col,flatShading:true,transparent:true,opacity:0.92});
 for(let k=0;k<G.clouds.n;k++){const d=new THREE.Vector3(R()*2-1,(R()*2-1)*0.8,R()*2-1).normalize(),g=new THREE.Group();const n=2+Math.floor(R()*3);
  for(let j=0;j<n;j++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(0.03+R()*0.03,0),cm);m.position.set((j-n/2)*0.04,R()*0.015,(R()-.5)*0.03);g.add(m)}
  g.position.copy(d).multiplyScalar(1.17+R()*0.05);g.quaternion.setFromUnitVectors(up,d);cl.add(g)}
 grp.add(cl);grp.userData.clouds=cl;
 return HXC[wi]=grp}
function hxShow(wi){if(!HOME.piv)return;if(HOME.g)HOME.piv.remove(HOME.g);HOME.g=hxBuild(wi);HOME.g.scale.setScalar(0.86);HOME.piv.add(HOME.g);if(HXW[wi].eye)HOME.rot=Math.atan2(-1,0.35)+0.35}
function homeInit(){
 const c=$('homePlanet');if(HOME.r||!c)return;
 const r=new THREE.WebGLRenderer({canvas:c,antialias:true,alpha:true});r.setPixelRatio(Math.min(devicePixelRatio||1,2));HOME.r=r;
 const sc=new THREE.Scene();HOME.scene=sc;const cam=new THREE.PerspectiveCamera(32,1,0.1,100);cam.position.set(0,0.25,6.2);HOME.cam=cam;
 sc.add(new THREE.HemisphereLight(0xdfe8ff,0x101020,0.55));const sl=new THREE.DirectionalLight(0xffffff,1.25);sl.position.set(-4,2.5,3);sc.add(sl);HOME.sun=sl;
 {const n=500,p=new Float32Array(n*3);for(let i=0;i<n;i++){const u=Math.random()*2-1,a=Math.random()*6.283,rr=30+Math.random()*20,q=Math.sqrt(1-u*u);p[i*3]=q*Math.cos(a)*rr;p[i*3+1]=u*rr;p[i*3+2]=q*Math.sin(a)*rr-10}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));sc.add(new THREE.Points(g,new THREE.PointsMaterial({color:0xcfe3ff,size:0.12,transparent:true,opacity:0.8})))}
 const atm=new THREE.Mesh(new THREE.SphereGeometry(0.93,48,32),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.BackSide,uniforms:{uC:{value:new THREE.Color(0x2ad4ff)}},
  vertexShader:'varying vec3 vN;varying vec3 vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform vec3 uC;varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.0-abs(dot(vN,vV)),2.2);gl_FragColor=vec4(uC*f*1.6,f);}'}));
 HOME.atm=atm;HOME.piv=new THREE.Group();HOME.piv.position.set(0,0.05,0);sc.add(HOME.piv);HOME.piv.add(atm);
 let st=null;c.addEventListener('pointerdown',e=>{st={x:e.clientX,r:HOME.rot}});c.addEventListener('pointermove',e=>{if(st)HOME.rot=st.r+(e.clientX-st.x)*0.01});const up=()=>st=null;c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);
 const tick=now=>{requestAnimationFrame(tick);homeDraw(now)};requestAnimationFrame(tick);
}
function homeSync(){
 const i=CFG.species||0,S=SPECIES[i],w=spWorld(i);applyTheme();
 $('hSpGlyph').innerHTML=SPG[i];$('hSpGlyph').style.cssText='stroke:'+S.c+';filter:drop-shadow(0 0 6px '+S.c+')';$('hSpName').textContent=S.n.toUpperCase();$('hSpName').style.color=S.c;
 const dist=w.d<10?w.d.toFixed(1).replace('.',','):Math.round(w.d).toLocaleString('es-CL');
 $('hWorld').innerHTML='<b style="color:'+S.c+'">'+w.n.toUpperCase()+'</b>Mundo de los '+S.n+' · '+dist+' años luz<br>'+w.st+' · '+w.b;
 const u=store.get('user',null);$('hUserName').textContent=(u&&u.name?u.name:'JUGADOR').toUpperCase();
 if(HOME.atm)HOME.atm.material.uniforms.uC.value.set(S.c);
 hxShow(WORLDS.indexOf(w));
 if(w.pl){CFG.planet=w.pl}
}
function homeDraw(now){
 if(!HOME.r||$('scrMain').classList.contains('hide'))return;
 const c=HOME.r.domElement,W=c.clientWidth,Hh=c.clientHeight;if(!W||!Hh)return;
 if(c.width!==Math.round(W*HOME.r.getPixelRatio())||c.height!==Math.round(Hh*HOME.r.getPixelRatio())){HOME.r.setSize(W,Hh,false);HOME.cam.aspect=W/Hh;HOME.cam.updateProjectionMatrix();
  const fit=1.35/Math.tan(HOME.cam.fov*Math.PI/360);HOME.cam.position.z=Math.max(fit,fit/Math.min(1,HOME.cam.aspect)*0.9)}
 const dt=Math.min(0.05,(now-(HOME.t||now))/1000);HOME.t=now;if(HOME.mixer)HOME.mixer.update(dt);
 HOME.rot+=dt*0.08;HOME.piv.rotation.y=HOME.rot;HOME.piv.rotation.z=0.18;if(HOME.g&&HOME.g.userData.clouds)HOME.g.userData.clouds.rotation.y+=dt*0.05;
 HOME.r.render(HOME.scene,HOME.cam);
}
$('uName').addEventListener('input',e=>{const v=store.get('user',null)||{};v.name=e.target.value.trim();store.set('user',v)});
$('hSpecies').onclick=()=>showScr('scrSpecies');
$('hNew').onclick=e=>{e.stopPropagation();showScr('scrVersus')};
$('hBattle').onclick=()=>{if(loadSave())resumeGame();else showScr('scrVersus')};
function homeBattle(){const sv=loadSave(),b=$('hBattle');if(!b)return;
 if(sv){const m=Math.floor(sv.gt/60),sx=Math.floor(sv.gt%60),pn=(SPECIES[sv.sp||0].n)+' · '+((PLANETS[sv.pl]||{}).n||'');b.firstChild.nodeValue='CONTINUAR';$('hBattleSub').textContent=pn+' · '+m+':'+String(sx).padStart(2,'0');$('hNew').style.display='flex';b.parentNode.classList.add('two')}
 else{b.firstChild.nodeValue='BATALLA';$('hBattleSub').textContent='Contra la CPU · elige el mundo';$('hNew').style.display='none';b.parentNode.classList.remove('two')}}function renderSettings(){
 const rows=[['DIFICULTAD CPU','diff',[['facil','Fácil'],['normal','Normal'],['dificil','Difícil']]],['CALIDAD GRÁFICA','quality',[['alta','Alta'],['baja','Baja']]],['GRILLA DE CASILLAS','grid',[[true,'Visible'],[false,'Oculta']]],['PANTALLA','lay',[['auto','Auto'],['v','Vertical'],['h','Horizontal']]],['SONIDO','snd',[[0,'Próximamente']]]];
 const box=$('setRows');box.innerHTML='';
 {const r=document.createElement('div');r.className='srow';r.innerHTML='<b>TEMA DE INTERFAZ</b>';const g=document.createElement('div');g.className='thg';const cur=CIDPAL[CFG.pal]?CFG.pal:'esp';
  const S=SPECIES[CFG.species||0],opts=[['esp','Especie',S.c,THEMES[CFG.species||0].pn,'Los colores de '+S.n+', cambian con la especie.'],...Object.entries(CIDPAL).map(([k,P])=>[k,P.n,P.ac,P.pet,P.d])];
  for(const[k,n,c1,c2]of opts){const bt=document.createElement('button');bt.className=k===cur?'on':'';bt.innerHTML='<i style="background:linear-gradient(135deg,'+c1+' 50%,'+c2+' 50%)"></i><span>'+n+'</span>';bt.onclick=()=>{CFG.pal=k;store.set('cfg',CFG);applyPal();renderSettings()};g.appendChild(bt)}
  r.appendChild(g);const d=document.createElement('div');d.className='thd';d.textContent=(opts.find(o=>o[0]===cur)||opts[0])[4];r.appendChild(d);box.appendChild(r)}
 for(const[lab,key,opts]of rows){const r=document.createElement('div');r.className='srow';r.innerHTML='<b>'+lab+'</b>';const sg=document.createElement('div');sg.className='seg';
  for(const[v,t]of opts){const bt=document.createElement('button');bt.textContent=t;if(key==='snd'){bt.disabled=true}else{bt.className=CFG[key]===v?'on':'';bt.onclick=()=>{CFG[key]=v;store.set('cfg',CFG);applyCfg();renderSettings()}}sg.appendChild(bt)}
  r.appendChild(sg);box.appendChild(r)}
 const n=document.createElement('p');n.className='mu';n.style.marginTop='10px';n.textContent='La calidad gráfica se aplica por completo al iniciar la siguiente partida.';box.appendChild(n);
}
function applyCfg(){applyWide();renderer.setPixelRatio(CFG.quality==='baja'?1:Math.min(devicePixelRatio||1,2));resize();if(GRID)GRID.visible=!!CFG.grid}
function startLocal(){clearSave();showScr(null);buildCards();newGame();started=true;paused=true;last=performance.now();introStart()}
let INTRO=null;
function introStart(){
 const P=tiles[HQP],C=tiles[HQC],mx=(P.x+C.x)/2,mz=(P.z+C.z)/2;
 const mid=zones.length?tiles[zones.slice().sort((a,b)=>Math.hypot(tiles[a.cores[0]].x-mx,tiles[a.cores[0]].z-mz)-Math.hypot(tiles[b.cores[0]].x-mx,tiles[b.cores[0]].z-mz))[0].cores[0]]:{x:mx,z:mz};
 const lit=tiles.filter(t=>t.type==='litio'&&Math.hypot(t.x-P.x,t.z-P.z)>6&&Math.hypot(t.x-C.x,t.z-C.z)>6).sort((a,b)=>Math.hypot(a.x-mid.x,a.z-mid.z)-Math.hypot(b.x-mid.x,b.z-mid.z));
 const L1=lit[0]||mid,L2=lit.find(t=>Math.hypot(t.x-L1.x,t.z-L1.z)>8&&Math.hypot(t.x-P.x,t.z-P.z)<Math.hypot(L1.x-P.x,L1.z-P.z))||P;
 const dx=P.x-C.x,dz=P.z-C.z,dl=Math.hypot(dx,dz)||1,ux=dx/dl,uz=dz/dl,sx=-uz,sz=ux;
 const V=(x,y,z)=>new THREE.Vector3(x,y,z),pitch=0.98,D=30,fx=P.x,fz=P.z-3;
 const pos=[V(C.x-ux*10+sx*6,24,C.z-uz*10+sz*6),V(C.x+sx*7,9,C.z+sz*7),V(C.x+ux*7-sx*3,4.2,C.z+uz*7-sz*3),V(L1.x-sx*4,3.6,L1.z-sz*4),V(mid.x+sx*5,4.5,mid.z+sz*5),V(L2.x-sx*3,5,L2.z-sz*3),V(fx+sx*6,13,fz+9),V(fx,D*Math.sin(pitch),fz+D*Math.cos(pitch))];
 const tgt=[V(C.x,0,C.z),V(C.x,0.6,C.z),V(L1.x,0.4,L1.z),V(mid.x,0.4,mid.z),V(L2.x,0.4,L2.z),V(P.x,0.6,P.z),V(fx,0,fz),V(fx,0,fz)];
 INTRO={t:0,dur:11,pc:new THREE.CatmullRomCurve3(pos,false,'centripetal'),tc:new THREE.CatmullRomCurve3(tgt,false,'centripetal'),roll:0,lp:null,ex:expl.slice()};
 cam.x=fx;cam.z=fz;cam.dist=D;cam.pitch=pitch;revealT=1e9;updFog();camera.fov=50;camera.updateProjectionMatrix();
 const me=SPECIES[CFG.species||0],fo=SPECIES[FOESP||0];$('introT').innerHTML=PL.n.toUpperCase()+'<small><span style="color:'+TCS[0]+'">'+me.n.toUpperCase()+'</span>  VS  <span style="color:'+TCS[1]+'">'+fo.n.toUpperCase()+'</span> · '+PL.sub+'</small>';
 const o=$('intro');$('introT').style.opacity='';o.classList.add('on');$('app').classList.add('intro');requestAnimationFrame(()=>o.classList.add('go'));o.onpointerdown=e=>{e.preventDefault();introEnd()}}
function introCam(dt){const I=INTRO;I.t+=dt;let k=Math.min(1,I.t/I.dur);const u=k<0.5?2*k*k:1-Math.pow(-2*k+2,2)/2,e=u*0.35+k*0.65;
 const p=I.pc.getPoint(e),t=I.tc.getPoint(Math.min(1,e+0.02));p.y=Math.max(p.y,heightAt(p.x,p.z)+2.4);
 camera.position.copy(p);camera.up.set(0,1,0);camera.lookAt(t);
 if(I.lp){const vx=p.x-I.lp.x,vz=p.z-I.lp.z,f=new THREE.Vector3();camera.getWorldDirection(f);const lat=(vx*-f.z+vz*f.x)/Math.max(dt,1e-3);I.roll+=(clamp(-lat*0.012,-0.22,0.22)*(1-k)-I.roll)*Math.min(1,dt*2.5);camera.rotateZ(I.roll)}I.lp=p.clone();
 const fv=50-12*Math.max(0,(k-0.75)/0.25);if(Math.abs(camera.fov-fv)>0.05){camera.fov=fv;camera.updateProjectionMatrix()}
 if(I.t>4.2&&!I.ht){I.ht=1;$('introT').style.opacity=0}
 if(k>=1)introEnd()}
function introEnd(){if(!INTRO)return;expl.set(INTRO.ex);INTRO=null;const o=$('intro');o.classList.remove('go','on');$('app').classList.remove('intro');camera.fov=38;camera.updateProjectionMatrix();camera.up.set(0,1,0);
 revealT=0;updFog();paused=false;last=performance.now();toast('Planeta '+PL.n+' · '+PL.sub)}
$('bLocal').onclick=startLocal;
$('mbtn').onclick=()=>{if(!started)return;const m=NET.on;$('bRestart').style.display=m?'none':'';$('bToMenu').textContent=m?'ABANDONAR PARTIDA':'MENÚ PRINCIPAL';$('ovPause').querySelector('h2').textContent=m?'1v1 · SIN PAUSA':'PAUSA';if(!m)paused=true;showScr('ovPause')};
$('bResume').onclick=()=>{showScr(null);if(!NET.on){paused=false;last=performance.now()}};
$('bRestart').onclick=startLocal;
const toMenu=()=>{if(INTRO)introEnd();if(NET.on||NET.R)mpLeave();else if(!over)saveGame();else clearSave();routeOpen=false;started=false;paused=true;over=false;sel.clear();selB=null;setCard(null);newGame();revealT=1e9;showScr('scrMain')};
$('bToMenu').onclick=toMenu;$('bEndMenu').onclick=toMenu;
$('bagain').onclick=()=>{if(NET.on)toMenu();else startLocal()};

