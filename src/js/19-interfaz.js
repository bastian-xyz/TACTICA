// ================= UI =================
const $=id=>document.getElementById(id);
const cardsEl=$('cards');const cardEls={};
function makeLayout(){const L=[['barracks',1,3],['factory',2,3],['helipad',3,3],['ialab',4,3],['extractor',5,3],['turret',6,3]];const free=[];for(let r=1;r<=2;r++)for(let c=1;c<=4;c++)free.push([c,r]);const ord=[...DECK].sort((a,b)=>PRODS.indexOf(UD[a].req)-PRODS.indexOf(UD[b].req));for(const k of ord){const p=free.shift();if(p)L.push([k,p[0],p[1]])}for(const f of free)L.push(['_slot',f[0],f[1]]);return L}
const pwrEls={};
function buildPwr(){const box=cardsEl;$('pwr').style.display='none';const POS={missile:[5,1],sat:[6,1],dropper:[5,2],extract:[6,2]};for(const k of['missile','sat','dropper','extract']){const b=document.createElement('button');b.className='pw';b.style.gridColumn=POS[k][0];b.style.gridRow=POS[k][1];
 b.innerHTML='<svg class="ring" viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" class="bg"/><circle cx="22" cy="22" r="19" class="rg" stroke-dasharray="119.4" stroke-dashoffset="119.4" transform="rotate(-90 22 22)"/></svg><svg class="ic" viewBox="0 0 24 24">'+ICON[k]+'</svg><span>'+SUP[k].n+'</span>';
 b.onclick=()=>{if(!started||over)return;setCard(selCard===k?null:k)};box.appendChild(b);pwrEls[k]=b}}
function buildCards(){
 cardsEl.innerHTML='';for(const k in cardEls)delete cardEls[k];buildPwr();
 for(const[k,col,row]of makeLayout()){
  if(UD[k]||k==='_slot'){const sl=document.createElement('div');sl.className='slot';sl.style.gridColumn=col;sl.style.gridRow=row;cardsEl.appendChild(sl)}
  if(k==='_slot')continue;
  const el=document.createElement('div');const sup=!!SUP[k];
  el.className='card'+(sup?' sup':'')+(BD[k]?' bld':'');el.style.gridColumn=col;el.style.gridRow=row;
  const D=SUP[k]||BD[k]||UD[k];
  const tag=sup?'APOYO':BD[k]?'':({inf:'INF',veh:'VEH',air:'AIRE',mec:'MEC'})[UD[k].cls];
  el.innerHTML=(sup?'<div class="fill"></div>':'')+'<span class="tg">'+tag+'</span><svg viewBox="0 0 24 24">'+ICON[k]+'</svg><span class="nm">'+D.n+'</span><span class="ct">'+(sup?'0%':'⚡'+D.cost)+'</span>';
  el.addEventListener('click',()=>{if(!started||over||performance.now()-cardDragT<350)return;setCard(selCard===k?null:k)});
  if(BD[k])el.addEventListener('pointerdown',e=>{if(!started||over)return;const sx=e.clientX,sy=e.clientY;let on=false;
   const end=()=>{window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',cn)};
   const mv=ev=>{if(!on&&Math.hypot(ev.clientX-sx,ev.clientY-sy)>12){on=true;if(selCard!==k)setCard(k);if(selCard!==k){end();return}}
    if(on){ev.preventDefault();const r=cv.getBoundingClientRect(),y=ev.clientY-GHOFF(ev);setGhost(ev.clientX>=r.left&&ev.clientX<=r.right&&y>=r.top&&y<=r.bottom?tileAt(ev.clientX,y):-1)}};
   const up=()=>{end();if(!on)return;cardDragT=performance.now();const i=GH.i;setGhost(null);if(i>=0)command(i,null);else setCard(null)};
   const cn=()=>{end();setGhost(null)};
   window.addEventListener('pointermove',mv,{passive:false});window.addEventListener('pointerup',up);window.addEventListener('pointercancel',cn)});
  cardsEl.appendChild(el);cardEls[k]=el;
 }
 keyMap();
}
function setCard(k){
 if(k){selDrop=null;selFree=null;rovArm=null;dropBarSync()}
 selCard=k;setGhost(null);for(const c in cardEls)cardEls[c].classList.toggle('sel',c===k);for(const c in pwrEls)pwrEls[c].classList.toggle('sel',c===k);
 if(k==='dropper'&&pwrUnlocked(0,k)&&charge[0][k]<1&&DROPS.some(d=>d.team===0)){camFollowNext();selCard=null;pwrEls[k].classList.remove('sel')}
 else if(k&&SUP[k]&&(!pwrUnlocked(0,k)||charge[0][k]<1)){toast(k==='missile'&&mslUsed[0]?'Misil: ya usado en esta partida':!pwrUnlocked(0,k)?pwrLockMsg(k):k==='dropper'?'Droper en misión ('+Math.floor((charge[0][k]||0)*100)+'%)':SUP[k].n+' cargando ('+Math.floor((charge[0][k]||0)*100)+'%)');selCard=null;(cardEls[k]||pwrEls[k]).classList.remove('sel')}
 else if(k==='sat'){usePower(0,'sat',HQP);selCard=null;(cardEls[k]||pwrEls[k]).classList.remove('sel')}
 else if(k&&!SUP[k]){const w=UD[k]&&!producers(0,UD[k].req).length?'Necesitas '+BD[UD[k].req].n:null;if(w)toast(w)}
 refreshHi();
}
function refreshHi(){
 if(selCard&&!SUP[selCard]){hiSet=new Set();for(const t of tiles)if(canPlace(0,selCard,t.i))hiSet.add(t.i)}else hiSet=null;
 paintTiles();
}
function updCards(){
 for(const k in pwrEls){const ul=pwrUnlocked(0,k),c=ul?charge[0][k]||0:0,el=pwrEls[k];el.querySelector('.rg').setAttribute('stroke-dashoffset',(119.4*(1-c)).toFixed(1));el.classList.toggle('rdy',ul&&c>=1);el.classList.toggle('lock',!ul);if(k==='dropper'){const all=dropBarracks(0),av=all.filter(b=>!b.drop).length;let bd=el.querySelector('.dcnt');if(!bd){bd=document.createElement('b');bd.className='dcnt';el.appendChild(bd)}const tx=all.length?av+'/'+all.length:'';if(bd.textContent!==tx)bd.textContent=tx;bd.style.display=all.length?'':'none';bd.classList.toggle('z',!av)}if(k==='missile'){const us=!!mslUsed[0];el.classList.toggle('used',us);const sp=el.querySelector('span');const tx=us?'Usado':SUP[k].n;if(sp.textContent!==tx)sp.textContent=tx}}
 for(const k in cardEls){
  const el=cardEls[k];
  if(SUP[k]){const c=charge[0][k]||0;el.querySelector('.fill').style.height=(c*100)+'%';el.querySelector('.ct').textContent=c>=1?'LISTO':Math.floor(c*100)+'%';el.classList.toggle('rdy',c>=1);el.classList.toggle('off',c<=0)}
  else{if(UD[k]){const has=aliveOf(0,'b').some(b=>b.type===UD[k].req&&b.built);el.classList.toggle('hid',!has);if(!has&&selCard===k)setCard(null)}el.classList.toggle('off',!cardUsable(0,k));if(k==='turret'){const ct=el.querySelector('.ct'),tx='⚡'+costOf(0,k);if(ct&&ct.textContent!==tx)ct.textContent=tx}}
 }
}

