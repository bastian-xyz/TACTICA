// ================= BARRA COMPACTA (celular): cartas en una fila, modo base, riel de poderes, minimapa flotante, aviso de ataque y gesto de volver =================
const isWide=()=>document.body.classList.contains('wide');
let UIREADY=false,BASEM=false,baseBtn=null,upCard=null;
// el minimapa y el riel de poderes viven dentro de la vista; la barra del Droper va en la barra de abajo (en celular) o flotando sobre la vista (en computador)
function placeUI(){view.appendChild($('mapwrap'));view.appendChild($('pwr'));(isWide()?view:$('bar')).appendChild($('dropBar'));if(isWide()){BASEM=false;$('bar').classList.remove('base')}mmApply()}
function buildCompact(){
 cardsEl.classList.add('cmp');
 const P=$('pwr');P.innerHTML='';P.style.display='';for(const k in pwrEls)delete pwrEls[k];
 for(const k of['sat','dropper','missile']){const b=mkPw(k);P.appendChild(b);pwrEls[k]=b}
 baseBtn=document.createElement('div');baseBtn.className='card basebt';
 baseBtn.innerHTML='<svg viewBox="0 0 24 24">'+ICON.barracks+'</svg><span class="ct">BASE</span>';
 baseBtn.addEventListener('click',()=>{if(!started||over)return;baseMode(!BASEM)});cardsEl.appendChild(baseBtn);
 const deck=DECK.filter(k=>UD[k]).slice(0,8);
 for(const k of deck){const el=mkCard(k);el.classList.add('unit');cardsEl.appendChild(el);cardEls[k]=el}
 for(let n=deck.length;n<8;n++){const sl=document.createElement('div');sl.className='slot unit';cardsEl.appendChild(sl)}
 for(const k of['barracks','factory','helipad','ialab','extractor','turret']){const el=mkCard(k);el.classList.add('bmode');cardsEl.appendChild(el);cardEls[k]=el}
 upCard=document.createElement('div');upCard.className='card bmode upc';
 upCard.innerHTML='<svg viewBox="0 0 24 24"><path d="M12 19V6M6 12l6-6 6 6"/><path d="M5 21h14"/></svg><span class="ct"></span>';
 upCard.addEventListener('click',()=>{if(!started||over)return;baseUp()});cardsEl.appendChild(upCard);
 const x=document.createElement('div');x.className='card bmode';x.innerHTML='<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';
 x.addEventListener('click',()=>baseMode(false));cardsEl.appendChild(x);
 $('bar').classList.toggle('base',BASEM);
}
function baseMode(on){
 if(isWide())on=false;BASEM=!!on;$('bar').classList.toggle('base',BASEM);
 if(selCard&&((BASEM&&UD[selCard])||(!BASEM&&BD[selCard])))setCard(null);
 if(BASEM){sel.clear();selB=null;selFree=null;selDrop=null;dropBarSync();updSel()}
}
function baseUp(){const h=pwrHQ(0);if(!h)return;const lv=h.lvl||1;if(lv>=3){toast('Base al nivel máximo');return}
 const c=BASEUP[lv];if(money[0]<c){toast('Falta energía ⚡ (mejora ⚡'+c+')');return}
 if(NET.on&&NET.role==='guest'){mpCmd({up:1});toast('Mejorando la base…');return}
 if(!upgradeB(h))toast('No se puede mejorar ahora')}
function updCompact(){
 if(isWide()||!upCard)return;const h=pwrHQ(0),lv=h?(h.lvl||1):1,c=BASEUP[lv]||0,ct=upCard.querySelector('.ct');
 const tx=lv>=3?'MÁX':'N'+(lv+1)+' ⚡'+c;if(ct.textContent!==tx)ct.textContent=tx;upCard.classList.toggle('off',lv>=3||money[0]<c);
 upCard.classList.toggle('rdy',lv<3&&money[0]>=c);
}
// ---- minimapa flotante: se cierra con ✕, queda como botón; se abre solo unos segundos si atacan la base ----
let MMON=CFG.mm!==0,mmAuto=0,mmLastAuto=-1e9;
function mmApply(){document.body.classList.toggle('mmoff',!MMON&&!isWide());if(MMON)requestAnimationFrame(()=>{resizeMini()})}
function mmSet(on,auto){MMON=!!on;if(!auto){mmAuto=0;CFG.mm=MMON?1:0;store.set('cfg',CFG)}mmApply()}
$('mmX').addEventListener('click',e=>{e.stopPropagation();mmSet(false)});
$('mmBtn').addEventListener('click',()=>mmSet(true));
// ---- aviso de ataque: flecha en el borde hacia donde te pegan, si no lo estás viendo ----
const ALR={t:-1e9,x:0,z:0,bt:-1e9};const _av=new THREE.Vector3();
function noteHit(e){if(!started||over||e.team!==0||e.dead)return;const p=entPos(e),now=performance.now();ALR.t=now;ALR.x=p.x;ALR.z=p.z;if(e.kind==='b')ALR.bt=now}
$('atkArr').addEventListener('click',()=>{CAMF=null;cam.x=ALR.x;cam.z=ALR.z-1.5*FL;updCam();$('atkArr').classList.remove('on')});
function uiTick(){
 const now=performance.now(),live=started&&!over&&!INTRO,A=$('atkArr');
 let show=false;
 if(live&&now-ALR.t<3000){_av.set(ALR.x,heightAt(ALR.x,ALR.z)+0.5,ALR.z).project(camera);let dx=_av.x,dy=-_av.y;const behind=_av.z>1;if(behind){dx=-dx;dy=-dy}
  if(behind||Math.abs(dx)>0.92||Math.abs(dy)>0.92){show=true;const r=view.getBoundingClientRect(),k=Math.max(Math.abs(dx),Math.abs(dy))||1;
   const px=(0.5+dx/k*0.45)*r.width,py=(0.5+dy/k*0.45)*r.height,ang=Math.atan2(dy*r.height,dx*r.width)*180/Math.PI;
   A.style.transform='translate('+px.toFixed(0)+'px,'+py.toFixed(0)+'px) rotate('+ang.toFixed(0)+'deg)'}}
 A.classList.toggle('on',show);
 $('mmBtn').classList.toggle('alr',live&&!MMON&&now-ALR.t<3000);
 if(live&&!isWide()&&!MMON&&now-ALR.bt<400&&now-mmLastAuto>20000&&!selCard){mmLastAuto=now;mmAuto=now+4000;mmSet(true,true)}
 if(mmAuto&&now>mmAuto){mmAuto=0;mmSet(false,true)}
}
// ---- gesto de volver (Android): cancelar → cerrar → pausa → continuar; en menús, pantalla anterior; solo en el inicio deja salir ----
let bkArmed=false;
function bkArm(){if(bkArmed)return;try{history.pushState({tac:1},'');bkArmed=true}catch(e){}}
addEventListener('pointerdown',bkArm,true);
addEventListener('popstate',()=>{bkArmed=false;const o=ovOpen();
 if(started&&!over){
  if(INTRO)introEnd();
  else if(o){if(o.id==='ovPause')$('bResume').click()}
  else if(selCard||sel.size||selB||selDrop||selFree||rovArm||BASEM){dropSel();baseMode(false)}
  else $('mbtn').click();
  bkArm();return}
 if(o&&o.id!=='scrMain'&&o.id!=='ovEnd'){const g=o.querySelector('.mbtn.ghost,.btn[data-go="scrMain"]');if(g)g.click();else showScr('scrMain');bkArm()}
});
