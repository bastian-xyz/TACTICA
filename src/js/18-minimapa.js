// ================= MODO HORIZONTAL · TECLADO Y MOUSE (computador) =================
function applyWide(){const m=CFG.lay||'auto',w=innerWidth,h=innerHeight,was=document.body.classList.contains('wide');document.body.classList.toggle('wide',m!=='v'&&w>h*1.2&&(m==='h'||w>=700));if(was!==document.body.classList.contains('wide')&&UIREADY)buildCards();document.body.style.setProperty('--mar',((CX*2+2)/(CZ*2+2.2)).toFixed(3))}
const KEYS={},KBD={},BKEYS='zxcvbn';
function keyMap(){for(const k in KBD)delete KBD[k];let n=0,b=0;
 for(const[k,col,row]of makeLayout()){const el=cardEls[k];if(!el)continue;const key=UD[k]?String(++n):BD[k]?BKEYS[b++]:null;if(!key)continue;KBD[key]=k;el.dataset.k=key.toUpperCase()}}
function dropSel(){selDrop=null;selFree=null;freeAct=null;rovArm=null;setCard(null);sel.clear();selB=null;routeOpen=false;updSel();dropBarSync()}
const ovOpen=()=>document.querySelector('.ov:not(.hide)');
addEventListener('keydown',e=>{
 const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'))return;if(e.ctrlKey||e.metaKey||e.altKey)return;
 const k=e.key.length===1?e.key.toLowerCase():e.key,o=ovOpen();
 if(k==='Escape'){if(o){if(o.id==='ovPause')$('bResume').click();return}if(!started||over)return;if(INTRO){introEnd();return}
  if(selCard||sel.size||selB||selDrop||selFree||rovArm)dropSel();else $('mbtn').click();return}
 if(o||!started||over||INTRO)return;
 if(k===' '){e.preventDefault();if(!e.repeat){const h=pwrHQ(0);if(h){CAMF=null;cam.x=tiles[h.tile].x;cam.z=tiles[h.tile].z-3*FL;updCam()}}return}
 if(k.startsWith('Arrow'))e.preventDefault();
 KEYS[k]=1;
 if(!e.repeat&&KBD[k]&&cardEls[KBD[k]]){const c=KBD[k];setCard(selCard===c?null:c)}
});
addEventListener('keyup',e=>{delete KEYS[e.key.length===1?e.key.toLowerCase():e.key]});
addEventListener('blur',()=>{for(const k in KEYS)delete KEYS[k]});
function keyTick(dt){
 const dx=(KEYS.d||KEYS.ArrowRight?1:0)-(KEYS.a||KEYS.ArrowLeft?1:0),dz=(KEYS.s||KEYS.ArrowDown?1:0)-(KEYS.w||KEYS.ArrowUp?1:0),zm=(KEYS['-']||KEYS.q?1:0)-(KEYS['+']||KEYS['=']||KEYS.e?1:0);
 if(!dx&&!dz&&!zm)return;if(!started||over||INTRO||ovOpen()){for(const k in KEYS)delete KEYS[k];return}
 if(dx||dz){CAMF=null;const v=cam.dist*0.95*dt/Math.hypot(dx,dz)*FL;cam.x+=dx*v;cam.z+=dz*v}
 if(zm)cam.dist*=1+zm*1.2*dt;
}
// ================= MINIMAP =================
const mini=document.getElementById('mini'),mctx=mini.getContext('2d');
const terrCv=document.createElement('canvas'),tctx=terrCv.getContext('2d');
const MM={s:1,ox:0,oy:0,w:0,h:0,dpr:1};
const w2m=(x,z)=>[MM.ox+FL*x*MM.s,MM.oy+FL*z*MM.s];let _tsp=0;const TSP=()=>_tsp||(tiles.length?(_tsp=Math.hypot(tiles[0].x-tiles[tiles[0].nb[0]].x,tiles[0].z-tiles[tiles[0].nb[0]].z)):1);
const m2w=(px,py)=>[FL*(px-MM.ox)/MM.s,FL*(py-MM.oy)/MM.s];
function hexPath(ctx,x,y,r){ctx.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;const px=x+r*Math.sin(a),py=y+r*Math.cos(a);k?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath()}
function resizeMini(){
 const r=mini.getBoundingClientRect();MM.dpr=Math.min(devicePixelRatio||1,2);
 MM.w=r.width;MM.h=r.height;mini.width=terrCv.width=r.width*MM.dpr;mini.height=terrCv.height=r.height*MM.dpr;
 const ww=CX*2+2,wh=CZ*2+2.2;MM.s=Math.min(MM.w/ww,(MM.h-16)/wh)*0.95;
 MM.ox=MM.w/2;MM.oy=MM.h/2+6;drawTerrMini();
}
function drawTerrMini(){
 if(!MM.w)return;const c=tctx;c.setTransform(MM.dpr,0,0,MM.dpr,0,0);c.clearRect(0,0,MM.w,MM.h);
 for(const t of tiles){
  const[x,y]=w2m(t.x,t.z);hexPath(c,x,y,MM.s*0.97);
  if(!expl[t.i]){c.fillStyle='#131920';c.fill();if(t.zone<0)continue}
  else{const MC2=PL.mini;c.fillStyle=t.vil?MC2.vil:t.type==='rock'?MC2.rock:t.type==='water'?MC2.liq:t.type==='ford'?MC2.ford:t.ramp?MC2.ramp:t.type==='litio'?(t.amt>0?'#e0b72e':'#30363c'):(MC2[t.surf]||MC2.grass);c.fill();if(!vis[t.i]){c.fillStyle='#000000a0';c.fill()}}
  if(t.zone>=0){const z=zones[t.zone];c.strokeStyle=z.own<0?'#8996a4':TCS[z.own];c.lineWidth=1;c.stroke()}
 }
 drawContMini(c);
}
function drawContMini(c){c.strokeStyle='#0a0c0fcc';c.lineWidth=2.2;c.lineCap='round';c.beginPath();for(const[i,x0,z0,x1,z1]of CONT){if(!expl[i])continue;const A=w2m(x0,z0),B=w2m(x1,z1);c.moveTo(A[0],A[1]);c.lineTo(B[0],B[1])}c.stroke()}
function drawMini(){
 if(!MM.w||!MM.h)return;const c=mctx;c.setTransform(MM.dpr,0,0,MM.dpr,0,0);c.clearRect(0,0,MM.w,MM.h);c.drawImage(terrCv,0,0,MM.w,MM.h);
 if(hiSet){c.fillStyle=TCS[0]+'26';for(const i of hiSet){const[x,y]=w2m(tiles[i].x,tiles[i].z);hexPath(c,x,y,MM.s*0.99);c.fill()}c.strokeStyle=TCS[0];c.lineWidth=2;c.lineCap='round';c.beginPath();for(const[x0,z0,x1,z1]of hiEdges){const a=w2m(x0,z0),b=w2m(x1,z1);c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1])}c.stroke()}
 for(const e of ents){
  if(e.dead||!visE(e))continue;const p=entPos(e);const[x,y]=w2m(p.x,p.z);
  c.fillStyle=TCS[e.team];
  if(e.kind==='b'){hexPath(c,x,y,MM.s*0.85);c.globalAlpha=e.built?1:0.5;c.fill();c.globalAlpha=1;if(BD[e.type].key){c.strokeStyle='#fff';c.lineWidth=1.2;c.stroke()}}
  else if(isAir(e)){c.beginPath();c.moveTo(x,y-MM.s*0.55);c.lineTo(x+MM.s*0.5,y+MM.s*0.4);c.lineTo(x-MM.s*0.5,y+MM.s*0.4);c.closePath();c.fill()}
  else{c.beginPath();c.arc(x,y,MM.s*0.42,0,7);c.fill()}
  if(sel.has(e)){c.strokeStyle='#fff';c.lineWidth=1.2;c.beginPath();c.arc(x,y,MM.s*0.65,0,7);c.stroke()}
 }
 for(const s of strikes){if(s.team===1&&!vis[s.tile]&&s.k==='shell')continue;const t=tiles[s.tile];const[x,y]=w2m(t.x,t.z);c.strokeStyle=s.k==='missile'?'#ff3b3b':'#ffc04d';c.lineWidth=1.5;c.beginPath();c.arc(x,y,MM.s*(s.k==='missile'?3.6:s.k==='sat'?2:1),0,7);c.stroke()}
 {const rs=radarOn(0);if(rs.length){const tt=performance.now()*0.001,R=MM.s*RADR*TSP();c.save();c.strokeStyle=TCS[0];c.globalAlpha=0.18;c.lineWidth=1;for(const t of rs){const p=entPos(t),[x,y]=w2m(p.x,p.z);c.beginPath();c.arc(x,y,R,0,7);c.stroke()}
   c.globalAlpha=1;for(const u of ents){if(u.dead||u.team!==1||u.kind!=='u'||u.boarded||vis[u.tile])continue;if(!(u.next>=0||u.path.length))continue;if(!rs.some(t=>distTo(u.tile,t)<=RADR))continue;const p=entPos(u),[x,y]=w2m(p.x,p.z),k=(tt*1.5+u.id*0.37)%1;c.strokeStyle='#ff5a4a';c.globalAlpha=1-k;c.lineWidth=1.3;c.beginPath();c.arc(x,y,MM.s*(0.4+k*1.2),0,7);c.stroke();c.globalAlpha=1;c.fillStyle='#ff5a4a';c.fillRect(x-1,y-1,2,2)}c.restore()}}
 for(const D of DROPS){if(D.team===0&&D.free&&D.free.tgt&&D.free.st==='move'){const sp=D.ship.position,[x0,y0]=w2m(sp.x,sp.z),[x1,y1]=w2m(D.free.tgt.x,D.free.tgt.z);c.save();c.setLineDash([4,3]);c.strokeStyle=TCS[0];c.globalAlpha=0.9;c.lineWidth=1.4;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();c.restore()}if(D.team!==0||!D.T||D.free)continue;const back=D.t>D.T[5],sp=D.ship.position,[x0,y0]=w2m(sp.x,sp.z),dst=back?D.P0:D.Dg,[x1,y1]=w2m(dst.x,dst.z);c.save();c.setLineDash([4,3]);c.strokeStyle=TCS[0];c.globalAlpha=0.9;c.lineWidth=1.4;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();c.setLineDash([]);if(!back){const r=MM.s*1.1;c.beginPath();c.moveTo(x1-r,y1);c.lineTo(x1+r,y1);c.moveTo(x1,y1-r);c.lineTo(x1,y1+r);c.stroke();c.beginPath();c.arc(x1,y1,r*0.8,0,7);c.stroke()}c.restore()}
 for(const S of[...DROPS.map(d=>[d.ship,d.team]),...ARRIVE.map(a=>[a.ship,a.b.team])]){const[sh,tm]=S;if(!sh.visible)continue;const[x,y]=w2m(sh.position.x,sh.position.z),r=MM.s*0.9;c.fillStyle=TCS[tm];c.strokeStyle='#fff';c.lineWidth=1;c.beginPath();c.moveTo(x,y-r);c.lineTo(x+r*0.75,y);c.lineTo(x,y+r);c.lineTo(x-r*0.75,y);c.closePath();c.fill();c.stroke()}
 {const rr=(tm)=>{const h=pwrHQ(tm);if(!h)return;const t0=tiles[h.tile],[x,y]=w2m(t0.x,t0.z);c.save();c.setLineDash([3,3]);c.strokeStyle=TCS[tm];c.globalAlpha=0.8;c.lineWidth=1.3;c.beginPath();c.arc(x,y,MM.s*INTR*TSP(),0,7);c.stroke();c.globalAlpha=0.07;c.fillStyle=TCS[tm];c.fill();c.restore()};
  const rdy=tm=>!mslUsed[tm]&&pwrUnlocked(tm,'missile')&&(charge[tm].missile||0)>=0.75;if(rdy(0))rr(0);if(revealT>0&&rdy(1))rr(1)}
 // viewport
 const pts=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>{ndc.set(a,b);ray.setFromCamera(ndc,camera);const g=ray.ray.intersectPlane(gp,tmpV);return g?w2m(g.x,g.z):null});
 if(pts.every(Boolean)){c.strokeStyle='#ffffffcc';c.lineWidth=1.5;c.beginPath();pts.forEach((p,k)=>k?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.stroke();c.fillStyle='#ffffff0d';c.fill()}
}
let md=null;
mini.addEventListener('pointerdown',e=>{mmAuto=0;mini.setPointerCapture(e.pointerId);md={sx:e.clientX,sy:e.clientY,moved:false}});
mini.addEventListener('pointermove',e=>{
 if(!md)return;if(!md.moved&&Math.hypot(e.clientX-md.sx,e.clientY-md.sy)>8)md.moved=true;
 if(md.moved){CAMF=null;const r=mini.getBoundingClientRect();const[x,z]=m2w(e.clientX-r.left,e.clientY-r.top);cam.x=x;cam.z=z-1.5*FL;updCam()}
});
mini.addEventListener('pointerup',e=>{
 if(md&&!md.moved&&started&&!over){
  const r=mini.getBoundingClientRect();const[x,z]=m2w(e.clientX-r.left,e.clientY-r.top);const i=hexAt(x,z);
  if(i>=0&&(selCard||sel.size||selDrop||selFree||rovArm||(selB&&selB.team===0&&isRover(selB))))command(i,null);else{CAMF=null;cam.x=x;cam.z=z-1.5*FL;updCam()}
 }
 md=null;
});

