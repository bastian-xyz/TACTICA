// ================= CONTEXT PANEL (selección) =================
let selB=null,ctxKey='';
function ctxKeyOf(){const u=[...sel].filter(x=>!x.dead);if(u.length){const c={};u.forEach(x=>c[x.type]=(c[x.type]||0)+1);return'u'+JSON.stringify(c)}if(selB&&!selB.dead)return'b'+selB.id+(selB.built?1:0)+'L'+(selB.lvl||1);return''}
function renderCtx(){
 const u=[...sel].filter(x=>!x.dead);
 if(u.length){const c={};u.forEach(x=>c[x.type]=(c[x.type]||0)+1);
  return '<div class="ch"><b>UNIDADES · '+u.length+'</b><button data-act="close" class="cx">✕</button></div>'+
   '<div class="hpb"><i id="ctxHp"></i></div>'+
   '<div class="cchips">'+Object.keys(c).map(t=>'<button data-act="type" data-t="'+t+'"><svg viewBox="0 0 24 24">'+ICON[t]+'</svg><span>'+UD[t].n+'</span><em>×'+c[t]+'</em></button>').join('')+'</div>'+
   '<div class="cact"><button data-act="all">TODAS MIS TROPAS</button><button data-act="stop">DETENER</button></div>';}
 const b=selB,D=BD[b.type],mine=b.team===0;
 const prod=mine&&PRODS.includes(b.type)?DECK.filter(k=>UD[k].req===b.type):null;
 return '<div class="ch"><b style="color:'+TCS[b.team]+'">'+D.n.toUpperCase()+'</b><span id="ctxSt" class="mu"></span><button data-act="close" class="cx">✕</button></div>'+
  '<div class="hpb"><i id="ctxHp"></i></div><div id="ctxInfo" class="mu" style="margin-top:4px"></div>'+
  (mine&&b.built?'<div class="cact"><button data-act="repair" id="ctxRep"></button><button data-act="upgrade" id="ctxUp"></button>'+(isRover(b)?'<button data-act="rover" id="ctxRov"></button>':'')+'</div>':'')+
  (prod?'<div class="cchips">'+(prod.length?prod.map(k=>'<button data-act="card" data-t="'+k+'"><svg viewBox="0 0 24 24">'+ICON[k]+'</svg><span>'+UD[k].n+'</span><em>⚡'+UD[k].cost+'</em></button>').join(''):'<span class="mu">No hay tropas de este edificio en tu mazo</span>')+'</div>':'')+
  (mine?'':'<div class="mu" style="margin-top:6px">Edificio enemigo · selecciona tropas y tócalo para atacar</div>');
}
function updCtx(){
 const k=ctxKeyOf(),box=$('ctx');
 if(!k){if(!box.classList.contains('hide')){box.classList.add('hide');cardsEl.classList.remove('hide')}if(ctxKey)buildRange();ctxKey='';return}
 cardsEl.classList.add('hide');box.classList.remove('hide');
 if(k!==ctxKey){ctxKey=k;box.innerHTML=renderCtx();buildRange()}
 const hp=$('ctxHp');
 if(k[0]==='u'){let a=0,m=0;sel.forEach(x=>{if(!x.dead){a+=x.hp;m+=x.max}});if(hp)hp.style.width=(m?a/m*100:0)+'%'}
 else{const b=selB;if(hp)hp.style.width=(b.hp/b.max*100)+'%';const st=$('ctxSt');if(st)st.textContent=b.built?Math.ceil(b.hp)+' / '+b.max:'Construyendo '+Math.floor(b.prog*100)+'%';
  const rp=$('ctxRep'),up=$('ctxUp'),rv=$('ctxRov');if(rv){const mvg=rovMoving(b);rv.textContent=mvg?'DETENER':'TOCA EL MAPA';rv.disabled=!mvg}
  if(rp){const c=repCost(b);rp.textContent=b.repairLeft>0?'REPARANDO…':b.hp>=b.max-0.5?'SIN DAÑO':'REPARAR ⚡'+c;rp.disabled=b.repairLeft>0||b.hp>=b.max-0.5||money[0]<c}
  if(up){const c=upCost(b);if(b.type!=='hq'){up.textContent='NIVEL DE BASE · MEJORA EL CENTRO DE CONTROL';up.disabled=true}else{up.textContent=(b.lvl||1)>=3?'BASE NIVEL MÁX ★★★':(rv?'BASE → NV':'MEJORAR BASE → NV')+((b.lvl||1)+1)+' ⚡'+c;up.disabled=(b.lvl||1)>=3||money[0]<c}}
  const inf=$('ctxInfo');if(inf){inf.textContent='Nv '+(b.lvl||1)+' '+'★'.repeat(b.lvl||1)+' · '+rangeTxt(b)+' · '+(b.type==='extractor'?'Energía restante en el campo: ⚡'+Math.floor(tiles[b.tile].amt):b.type==='hq'?'Población '+unitCount(0)+'/'+capOf(0)+' · Misiles a 4 casillas · Drones kamikaze: '+(b.kamiCd>0?'recarga '+Math.ceil(b.kamiCd)+' s':'listos')+(isRover(b)?(b.mv?' · En marcha: faltan '+(b.mv.path.length+(b.rk<1?1:0))+' casillas':' · Toca el mapa para moverlo: lento, sube cualquier desnivel'):''):b.type==='turret'?((b.lvl||1)>=3?'Radar: marca movimiento enemigo a '+RADR+' casillas en el mapa (sin visión)':'Dispara sola a lo que entre en el contorno rojo · radar con base nivel 3'):PRODS.includes(b.type)&&b.team===0?(b.built?'Tropas +'+15*((b.lvl||1)-1)+'% vida':'Las tropas se activan al terminar la construcción'):'')}}
}
$('ctx').addEventListener('click',e=>{const bt=e.target.closest('[data-act]');if(!bt)return;const a=bt.dataset.act,t=bt.dataset.t;
 routeOpen=false;
 if(a!=='rover')rovArm=null;
 if(a==='rover'){const b=selB;if(b&&b.team===0&&isRover(b)){if(rovMoving(b)){rovArm=null;rovStop(b)}else{rovArm=rovArm===b?null:b;if(rovArm)toast('Toca el mapa: destino del Centro de Control')}}}
 else if(a==='close'){sel.clear();selB=null}
 else if(a==='type'){for(const u of[...sel])if(u.type!==t)sel.delete(u)}
 else if(a==='all'){aliveOf(0,'u').filter(u=>u.spawn<=0).forEach(u=>sel.add(u))}
 else if(a==='stop'){for(const u of sel){u.path=[];u.dest=-1;u.focus=null;u.auto=false;u.wps=[];u.post=u.next>=0?u.next:u.tile}if(NET.on&&NET.role==='guest')mpCmd({st:mpIds(sel)});toast('Tropas detenidas')}
 else if(a==='card'){selB=null;ctxKey='';updCtx();setCard(t);return}
 else if(a==='repair'&&selB&&NET.on&&NET.role==='guest'){if(selB.hid&&selB.team===0&&money[0]>=repCost(selB)){mpCmd({rp:selB.hid});toast('Reparando '+BD[selB.type].n)}}
 else if(a==='upgrade'&&selB&&NET.on&&NET.role==='guest'){if(selB.type==='hq'&&money[0]>=upCost(selB))mpCmd({up:1})}
 else if(a==='repair'&&selB){const b=selB,c=repCost(b);if(money[0]>=c&&b.hp<b.max){money[0]-=c;b.repairLeft=b.max-b.hp;toast('Reparando '+BD[b.type].n)}}
 else if(a==='upgrade'&&selB){upgradeB(selB)}
 ctxKey='';updCtx()});
function updSel(){updCtx()}
const repCost=b=>Math.ceil((b.max-b.hp)*0.35);
const upCost=b=>b.type==='hq'?(BASEUP[b.lvl||1]||0):0;
const bRange=b=>{const D=BD[b.type];return D.atk?D.atk.rng+((b.lvl||1)>=3?1:0):D.terr};
const rangeTxt=b=>(BD[b.type].atk?'Alcance ':'Territorio ')+bRange(b);
function cuartelRefresh(b){if(b.type!=='barracks'||teamSp(b.team)===2||!b.mesh)return;const inner=b.mesh.children[0],q=CQ.cuartelModel(b.lvl||1,TC[b.team]);while(inner.children.length)inner.remove(inner.children[0]);[...q.children].forEach(c=>inner.add(c));const U=b.mesh.userData;delete U.hatch;delete U.landL;Object.assign(U,q.userData)}
function applyLvl(b,L,silent){let ch=false;while((b.lvl||1)<L){b.lvl=(b.lvl||1)+1;ch=true;const add=b.max*0.25;b.max=Math.round(b.max+add);b.hp+=add;}
 if(!ch)return;if(b.bld&&!b.built)b.pendRef=1;else cuartelRefresh(b);
 if(!silent&&b.built&&b.type==='barracks'&&teamSp(b.team)!==2)startArrive(b)}
function upgradeB(b){if(b.type!=='hq')return false;const lv=b.lvl||1,c=BASEUP[lv];if(lv>=3||!b.built||money[b.team]<c)return false;money[b.team]-=c;
 const add=b.max*0.25;b.max=Math.round(b.max+add);b.hp+=add;b.lvl=lv+1;
 for(const o of ents)if(!o.dead&&o.kind==='b'&&o.team===b.team&&o!==b)applyLvl(o,b.lvl);terrC[b.team].t=-1;
 if(b.team===0){const nw=Object.keys(SUP).filter(k=>!SUP[k].off&&SUP[k].lv===b.lvl);toast('Base nivel '+b.lvl+' · población '+capOf(0)+(nw.length?' · nuevo poder: '+nw.map(k=>SUP[k].n).join(', '):''));
  if(b.lvl>=2&&teamSp(0)!==2&&dropBarracks(0).length)setTimeout(()=>toast(b.lvl===3?'El Relevo en camino a sus torres':'Droper en camino a su torre'),1600)}
 return true}
const rangeMesh=new THREE.LineSegments(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xff5a5a,transparent:true,opacity:0.7}));rangeMesh.renderOrder=7;scene.add(rangeMesh);
const rangeFill=new THREE.InstancedMesh(hiGeo,new THREE.MeshBasicMaterial({color:0xff4a4a,transparent:true,opacity:0.06,depthWrite:false}),400);rangeFill.count=0;rangeFill.renderOrder=6;scene.add(rangeFill);
function buildRange(){
 const b=selB&&!selB.dead&&![...sel].length?selB:null;
 if(!b){rangeMesh.visible=false;rangeFill.count=0;return}
 const R=bRange(b),S=new Set();for(const t of tiles)if(distTo(t.i,b)<=R)S.add(t.i);
 const L=[];for(const i of S){const t=tiles[i];for(let k=0;k<6;k++){const mid=(k*60+30)*Math.PI/180;const n=hexAt(t.x+SQ3*Math.sin(mid),t.z+SQ3*Math.cos(mid));if(n>=0&&S.has(n))continue;const a0=k*Math.PI/3,a1=(k+1)*Math.PI/3,r=0.97;L.push([t.x+r*Math.sin(a0),t.z+r*Math.cos(a0),t.x+r*Math.sin(a1),t.z+r*Math.cos(a1)])}}
 rangeMesh.geometry.setAttribute('position',new THREE.Float32BufferAttribute(drapeSegs(L,0.1),3));rangeMesh.geometry.computeBoundingSphere();rangeMesh.visible=true;
}
let routeOpen=false;
const routeLine=new THREE.LineSegments(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0.85,depthTest:false}));routeLine.renderOrder=30;scene.add(routeLine);
const wpMarks=[];for(let k=0;k<12;k++){const m=new THREE.Mesh(G.ring,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,depthTest:false}));m.renderOrder=31;m.visible=false;scene.add(m);wpMarks.push(m)}
function updRoute(now){
 const L=[...sel].find(u=>!u.dead&&(u.dest>=0||u.path.length||(u.wps&&u.wps.length)));
 wpMarks.forEach(m=>m.visible=false);
 if(!L||!started){routeLine.visible=false;return}
 const pts=[],P0=entPos(L);let px=P0.x,pz=P0.z;
 const seg=(x,z)=>{const n=Math.max(1,Math.ceil(Math.hypot(x-px,z-pz)/0.6));for(let k=0;k<n;k++){const a=k/n,b=(k+1)/n;const x0=px+(x-px)*a,z0=pz+(z-pz)*a,x1=px+(x-px)*b,z1=pz+(z-pz)*b;pts.push(x0,heightAt(x0,z0)+0.15,z0,x1,heightAt(x1,z1)+0.15,z1)}px=x;pz=z};
 if(L.next>=0)seg(tiles[L.next].x,tiles[L.next].z);
 for(const i of L.path)seg(tiles[i].x,tiles[i].z);
 const stops=[];if(L.dest>=0)stops.push(L.dest);
 for(const i of(L.wps||[])){seg(tiles[i].x,tiles[i].z);stops.push(i)}
 routeLine.geometry.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));routeLine.geometry.computeBoundingSphere();routeLine.visible=pts.length>0;
 stops.slice(0,12).forEach((i,k)=>{const m=wpMarks[k],t=tiles[i];m.visible=true;m.position.set(t.x,heightAt(t.x,t.z)+0.12,t.z);const s=1+0.12*Math.sin(now*0.006+k);m.scale.set(s,1,s);m.material.color.setHex(k===stops.length-1?0x7dffcf:0xffffff)});
}

let toastT=0;function toast(s){const t=$('toast');t.textContent=s;t.style.opacity=1;toastT=1.8}
function buildZoneChips(){$('zones').style.display='none';$('zones').innerHTML=zones.map((z,i)=>'<div class="zc" id="zc'+i+'"><i></i><span>'+ZN[i]+'</span></div>').join('')}
function updHud(){
 $('res').querySelector('b').textContent=Math.floor(money[0]);
 let inc=0;aliveOf(0,'b').forEach(b=>{if(b.built&&BD[b.type].inc&&(b.type!=='extractor'||tiles[b.tile].amt>0))inc+=BD[b.type].inc});
 $('inc').textContent='+'+inc*incMul()+'/s'+(incMul()>1?' ×2':'');
 const m=Math.floor(gameTime/60),s=Math.floor(gameTime%60);$('clock').textContent=m+':'+String(s).padStart(2,'0')+(gameTime<180?'  ·  ⚡×2 en '+Math.floor((180-gameTime)/60)+':'+String(Math.floor((180-gameTime)%60)).padStart(2,'0'):'');
 $('ucount').textContent='Tropas '+unitCount(0)+'/'+capOf(0);
 zones.forEach((z,i)=>{const el=$('zc'+i);if(!el)return;const f=el.querySelector('i');const c=z.cap;f.style.background=c>=0?TCS[0]:TCS[1];f.style.opacity=0.55;f.style.width=Math.abs(c)*100+'%';f.style.left=c>=0?'0':'auto';f.style.right=c<0?'0':'auto';el.style.borderColor=z.own<0?'#33414f':TCS[z.own]});
 const hpq=t=>{const h=aliveOf(t,'b').find(b=>b.type==='hq');return h?Math.ceil(h.hp/h.max*100):0};
 $('keys').innerHTML='<span style="color:'+TCS[0]+'">◆ '+hpq(0)+'%</span> vs <span style="color:'+TCS[1]+'">◆ '+hpq(1)+'%</span>';
 updSel();
}
$('ver').textContent='v'+VERSION;
$('changelog').innerHTML=CHANGELOG.map(c=>'<p><b>v'+c.v+'</b> · '+c.d+'</p><ul>'+c.items.map(x=>'<li>'+x+'</li>').join('')+'</ul>').join('');

