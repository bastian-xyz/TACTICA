// ---------- entity meshes
const DISHGEO=new THREE.SphereGeometry(0.62,20,8,0,Math.PI*2,0,0.62),DISHMAT=new THREE.MeshLambertMaterial({color:0xa3acb4,side:THREE.DoubleSide});
const FCHIM=new THREE.CylinderGeometry(0.32,0.5,1,6);
const RHC={};function rhombGeo(k,r,sh){const key=k+'|'+r+'|'+sh;if(RHC[key])return RHC[key];
 const v=[0,1,2].map(j=>{const a=(k+j)*Math.PI/3;return[Math.sin(a)*r,Math.cos(a)*r]}),c=[(v[0][0]+v[2][0])/2*0.0,(v[0][1]+v[2][1])/2*0.0];
 const pts=[[0,0],...v].map(([x,z])=>{const cx=(v[1][0])/2,cz=(v[1][1])/2;return[x+(cx-x)*sh*2,z+(cz-z)*sh*2]});
 const S=new THREE.Shape();pts.forEach(([x,z],i)=>i?S.lineTo(x,-z):S.moveTo(x,-z));S.closePath();
 const geo=new THREE.ExtrudeGeometry(S,{depth:1,bevelEnabled:false});geo.rotateX(-Math.PI/2);geo.computeVertexNormals();return RHC[key]=geo}
const glowMat=c=>new THREE.MeshStandardMaterial({color:c.clone().multiplyScalar(0.55),emissive:c.clone().multiplyScalar(0.5),roughness:0.85,metalness:0,flatShading:true});
function makeFlies(col,n,rad,y0,y1,parent){const pos=new Float32Array(n*3),cl=new Float32Array(n*3),par=[];
 for(let i=0;i<n;i++){par.push({a:Math.random()*6.283,r:0.3+Math.random()*rad,y:y0+Math.random()*(y1-y0),s:(Math.random()<0.5?-1:1)*(0.15+Math.random()*0.35),ph:Math.random()*6.283,f:0.8+Math.random()*1.6})}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(cl,3));
 const c=new THREE.Color(col).lerp(new THREE.Color(0xfff6a0),0.45),pts=new THREE.Points(g,new THREE.PointsMaterial({size:0.16,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));pts.frustumCulled=false;parent.add(pts);
 return{pts,par,c,n}}
function updFlies(F,t){const P2=F.pts.geometry.attributes.position.array,C2=F.pts.geometry.attributes.color.array;
 for(let i=0;i<F.n;i++){const p=F.par[i],a=p.a+t*p.s,r=p.r+0.25*Math.sin(t*0.7+p.ph);P2[i*3]=Math.cos(a)*r;P2[i*3+1]=p.y+0.35*Math.sin(t*p.f*0.6+p.ph);P2[i*3+2]=Math.sin(a)*r;
  const k=Math.max(0,Math.sin(t*p.f*2+p.ph));const b=0.15+0.85*k*k;C2[i*3]=F.c.r*b;C2[i*3+1]=F.c.g*b;C2[i*3+2]=F.c.b*b}
 F.pts.geometry.attributes.position.needsUpdate=true;F.pts.geometry.attributes.color.needsUpdate=true}
const TORG=new THREE.TorusGeometry(0.5,0.05,6,28),ICOG=new THREE.IcosahedronGeometry(0.5,1),EXN=['Reactor',null,'Árbol de Luz'];
let MESHSP=0,FOESP=0;
const CAPG=new THREE.SphereGeometry(0.5,14,6,0,Math.PI*2,0,Math.PI/2);
const MICN={barracks:'Seta Madre',factory:'Colmena',helipad:'Nido Alado',ialab:'Arboleda',turret:'Flor Lanzadora'},HUMN={barracks:'Cuartel',factory:'Fábrica',helipad:'Helipuerto',ialab:'Lab',turret:'Torreta'};
const micGlow=tc=>new THREE.Color(0x2affc8).lerp(new THREE.Color(tc),0.2);
const TDF=new THREE.CircleGeometry(0.5,6).rotateX(-Math.PI/2).rotateY(Math.PI/6),TDR=new THREE.RingGeometry(0.44,0.52,6,1).rotateX(-Math.PI/2).rotateY(Math.PI/6);
const SHDG=new THREE.PlaneGeometry(1.25,1.25).rotateX(-Math.PI/2),SHDM=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,map:(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,4,32,32,32);g.addColorStop(0,'rgba(0,0,0,0.75)');g.addColorStop(0.6,'rgba(0,0,0,0.35)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})()});
const TMC={};const teamMat=(tc,o)=>TMC[tc+'_'+o]||(TMC[tc+'_'+o]=new THREE.MeshBasicMaterial({color:tc,transparent:true,opacity:o,depthWrite:false}));
const capCol=tc=>0x7a52c8,shellCol=(tc,c)=>c;
const MGL={};const mGlow=tc=>MGL[tc]||(MGL[tc]=glowMat(micGlow(tc)));
const CAPC=0x7a52c8,STK=0xd8d0e4,CHI=0x3a2e48,CHI2=0x5a4868,BRK=0x5a4868;
function fungi(tc,sc,extra){const f=new THREE.Group();f.scale.setScalar(sc||1);const gm=mGlow(tc);
 f.add(P(G.cyl,STK,0.16,0.22,0.16,0,0.11,0),P(G.cyl,STK,0.12,0.06,0.12,0,0.25,0),P(CAPG,capCol(tc),0.42,0.22,0.42,0,0.27,0),P(G.cyl,tc,0.3,0.025,0.3,0,0.27,0));
 for(const s of[-1,1]){const e=new THREE.Mesh(G.sph,gm);e.scale.setScalar(0.035);e.position.set(s*0.035,0.17,0.075);f.add(e)}
 const sp=new THREE.Mesh(G.sph,gm);sp.scale.setScalar(0.04);sp.position.set(0.06,0.38,0.04);f.add(sp);
 if(extra)extra(f,gm);return f}
function bugLegs(grp,n,w,len,y,col){const L=[];for(let i=0;i<n;i++){const z=(i/(n-1)-0.5)*len;for(const s of[-1,1]){const l=new THREE.Group();l.position.set(s*w,y,z);l.add(P(G.box,col,0.32,0.035,0.035,s*0.15,-0.05,0,0,0,s*-0.5));grp.add(l);L.push(l)}}return L}
function treant(b,tc,sc,opt){const t=new THREE.Group();t.scale.setScalar(sc);b.add(t);const gm=mGlow(tc);opt=opt||{};
 const legs=[];for(const s of[-1,1]){const l=new THREE.Group();l.position.set(s*0.14,0.42,0);l.add(P(G.cyl,BRK,0.16,0.42,0.16,0,-0.21,0),P(G.box,CHI2,0.22,0.06,0.28,0,-0.42,0.04));t.add(l);legs.push(l)}
 const up=new THREE.Group();up.position.y=0.42;t.add(up);
 up.add(P(G.cyl,BRK,0.42,0.6,0.36,0,0.3,0),P(G.cyl,CHI2,0.36,0.25,0.32,0,0.68,0),P(G.cyl,tc,0.44,0.06,0.38,0,0.2,0),P(G.cyl,tc,0.38,0.05,0.34,0,0.55,0));
 for(const s of[-1,1]){const a=new THREE.Group();a.position.set(s*0.24,0.62,0);a.rotation.z=s*(opt.raise&&s>0?-2.4:0.25);a.add(P(G.cyl,BRK,0.1,0.5,0.1,0,-0.25,0),P(G.cyl,BRK,0.05,0.18,0.05,s*0.05,-0.52,0.04,0.4,0,s*0.4));up.add(a);if(opt.raise&&s>0){const seed=new THREE.Mesh(G.sph,gm);seed.scale.setScalar(0.12);seed.position.set(0,-0.58,0);a.add(seed)}}
 const head=new THREE.Mesh(ICOG,gm);head.scale.set(0.45*(opt.crown||1),0.32*(opt.crown||1),0.45*(opt.crown||1));head.position.y=0.95;up.add(head);
 for(const s of[-1,1]){const e=new THREE.Mesh(G.sph,glowMat(new THREE.Color(0xfff6a0)));e.scale.setScalar(0.035);e.position.set(s*0.07,0.66,0.17);up.add(e)}
 return{t,legs,up}}
const MICM={
 rifle(b,g,tc){const B=[];[[-0.25,0.18],[0.25,0.18],[0,0.03],[-0.25,-0.16],[0.25,-0.16]].forEach(([x,z])=>{const f=fungi(tc,1,(f,gm)=>{f.add(P(G.cyl,0x8a7a9a,0.02,0.36,0.02,0.11,0.2,0.04,0.3,0,0))});f.position.set(x,0,z);b.add(f);B.push(f)});g.userData.mic={bob:B}},
 grenadier(b,g,tc){const B=[];[[-0.2,0.15],[0.2,0.15],[-0.2,-0.15],[0.2,-0.15]].forEach(([x,z])=>{const f=fungi(tc,1.05,(f,gm)=>{const s=new THREE.Mesh(G.sph,gm);s.scale.set(0.16,0.2,0.14);s.position.set(0,0.17,-0.1);f.add(s);f.add(P(G.cyl,0x3a6a5a,0.03,0.2,0.03,0.07,0.2,0.06,0.9,0,0))});f.position.set(x,0,z);b.add(f);B.push(f)});g.userData.mic={bob:B}},
 flamer(b,g,tc){const B=[];[[-0.22,0.12],[0.22,0.12],[0,-0.16]].forEach(([x,z])=>{const f=fungi(tc,1.08,(f,gm)=>{f.add(P(TORG,0x3a8a4a,0.3,0.3,0.6,0.1,0.18,0.12,0,1.2,0))});f.position.set(x,0,z);b.add(f);B.push(f)});g.userData.mic={bob:B}},
 sniper(b,g,tc){const B=[];[[-0.14,0],[0.16,-0.05]].forEach(([x,z],i)=>{const f=fungi(tc,1.3,(f,gm)=>{f.add(P(G.cyl,0x6a5a7a,0.022,0.6,0.022,0.12,0.28,0));const o=new THREE.Mesh(G.oct,gm);o.scale.setScalar(0.07);o.position.set(0.12,0.6,0);f.add(o)});f.position.set(x,0,z);b.add(f);B.push(f)});g.userData.mic={bob:B}},
 tank(b,g,tc){b.add(P(G.sph,shellCol(tc,CHI),0.62,0.36,0.85,0,0.32,-0.02),P(G.box,tc,0.04,0.05,0.72,0,0.5,-0.02),P(G.sph,CHI2,0.32,0.24,0.28,0,0.3,0.42));
  const L=bugLegs(b,3,0.22,0.5,0.24,0x221a2c);const h=new THREE.Group();h.position.set(0,0.5,0.05);h.add(P(G.cone,0x2a2234,0.12,0.42,0.12,0,0.02,0.62,Math.PI/2,0,0),P(G.box,0x4a3a2a,0.3,0.06,0.3,0,0.02,0));const r=fungi(tc,1.15);r.position.set(0,0.04,-0.02);h.add(r);b.add(h);g.userData.head=h;g.userData.mic={legs:L}},
 buggy(b,g,tc){const L=[];for(let i=0;i<5;i++){const z=0.36-i*0.18;b.add(P(G.sph,i%2?shellCol(tc,CHI):CHI2,0.26,0.2,0.24,0,0.2,z));for(const s of[-1,1]){const l=new THREE.Group();l.position.set(s*0.1,0.16,z);l.add(P(G.box,0x221a2c,0.22,0.03,0.03,s*0.1,-0.05,0,0,0,s*-0.6));b.add(l);L.push(l)}}
  b.add(P(G.box,tc,0.2,0.04,0.12,0,0.31,0.18));const h=new THREE.Group();h.position.set(0,0.3,0.2);const r=fungi(tc,0.95);h.add(r);b.add(h);g.userData.head=h;g.userData.mic={legs:L}},
 artillery(b,g,tc){b.add(P(G.sph,shellCol(tc,CHI),0.58,0.32,0.8,0,0.3,0),P(G.sph,CHI2,0.28,0.2,0.24,0,0.28,0.4));const L=bugLegs(b,3,0.21,0.46,0.22,0x221a2c);
  const h=new THREE.Group();h.position.set(0,0.46,-0.12);const sac=new THREE.Mesh(G.sph,glowMat(new THREE.Color(0xb8ff3a)));sac.scale.set(0.36,0.3,0.4);sac.position.y=0.12;h.add(sac,P(G.cyl,0x2a2234,0.07,0.32,0.07,0,0.22,0.22,1.0,0,0),P(G.cyl,tc,0.38,0.03,0.42,0,0.0,0));const r=fungi(tc,0.9);r.position.set(0,0.0,0.32);h.add(r);b.add(h);g.userData.head=h;g.userData.mic={legs:L}},
 fighter(b,g,tc){b.add(P(G.cyl,0x2a5a6a,0.08,0.95,0.08,0,0,-0.05,Math.PI/2,0,0),P(G.sph,0x3a7a8a,0.18,0.15,0.2,0,0.02,0.38),P(G.box,tc,0.05,0.05,0.3,0,0.05,-0.3));
  const W=[];for(const[z,l]of[[0.18,0.6],[0.02,0.52]])for(const s of[-1,1]){const w=new THREE.Group();w.position.set(s*0.04,0.04,z);const m=new THREE.Mesh(G.box,new THREE.MeshLambertMaterial({color:0xb8f0ff,transparent:true,opacity:0.45,depthWrite:false}));m.scale.set(l,0.01,0.11);m.position.x=s*l/2;w.add(m);b.add(w);W.push({w,s})}
  const r=fungi(tc,0.85);r.position.set(0,0.06,0.2);b.add(r);g.userData.mic={wings:W,fast:1}},
 heli(b,g,tc){b.add(P(G.sph,0x2a2210,0.24,0.22,0.28,0,0.02,0.16),P(G.sph,0xd8a020,0.3,0.26,0.42,0,-0.04,-0.22),P(G.box,tc,0.31,0.05,0.06,0,-0.02,-0.18),P(G.box,0x1a1408,0.31,0.05,0.06,0,-0.04,-0.3),P(G.cone,0x1a1408,0.06,0.18,0.06,0,-0.08,-0.48,-Math.PI/2,0,0));
  const W=[];for(const s of[-1,1]){const w=new THREE.Group();w.position.set(s*0.08,0.12,0.06);const m=new THREE.Mesh(G.box,new THREE.MeshLambertMaterial({color:0xe8f0ff,transparent:true,opacity:0.45,depthWrite:false}));m.scale.set(0.5,0.01,0.16);m.position.x=s*0.25;w.add(m);b.add(w);W.push({w,s})}
  const h=new THREE.Group();h.position.set(0,0.12,0.1);const r=fungi(tc,0.8);h.add(r);b.add(h);g.userData.head=h;g.userData.mic={wings:W,fast:1}},
 scout(b,g,tc){const gm=mGlow(tc);b.add(P(G.sph,0x6a5a4a,0.2,0.18,0.42,0,0,0));const W=[];
  for(const s of[-1,1]){const w=new THREE.Group();w.position.set(s*0.06,0.04,0.02);const m=P(G.sph,0x8a7a5a,0.7,0.02,0.45,s*0.35,0,0);w.add(m);const e=new THREE.Mesh(G.sph,gm);e.scale.set(0.12,0.02,0.12);e.position.set(s*0.4,0.01,0.02);w.add(e);b.add(w);W.push({w,s,slow:1})}
  const r=fungi(tc,0.7);r.position.set(0,0.07,0.08);b.add(r);g.userData.mic={wings:W}},
 mech(b,g,tc){const T=treant(b,tc,1.25);g.userData.head=T.up;g.userData.mic={legs:T.legs,walk:1}},
 sentinel(b,g,tc){const T=treant(b,tc,1.1,{raise:1});g.userData.head=T.up;g.userData.mic={legs:T.legs,walk:1}},
 titan(b,g,tc){const T=treant(b,tc,2.1,{crown:1.8});g.userData.head=T.up;g.userData.mic={legs:T.legs,walk:1,heavy:1};g.userData.flies=makeFlies(micGlow(tc),16,0.9,1.2,3.4,g)}
};
const MICU={rifle:['Brotes','Pelotón de 5 fungi con lanzas de espora'],grenadier:['Esporero','Nube de esporas que daña en área'],flamer:['Enredador','Látigos de enredadera a corta distancia'],sniper:['Sembrador','Disparo de semilla a larga distancia'],
 tank:['Escarabajo','Bicho acorazado con jinete fungi'],buggy:['Ciempiés','Rápido, para flanquear'],artillery:['Bombardero','Lanza ácido a larga distancia'],
 fighter:['Libélula','Caza aéreo con jinete','Arrebata infantería y la suelta desde lo alto','Esquiva disparos'],heli:['Avispa','Picada con jinete','Arrebata infantería y la suelta desde lo alto','Esquiva disparos'],scout:['Polilla','Exploradora con mucha visión'],
 mech:['Guardián','Ser árbol acorazado'],sentinel:['Arbóreo','Lanza semillas, fuerte contra voladores'],titan:['Anciano','Ser árbol antiguo y colosal']};
const MICI={rifle:'<path d="M5 11a7 5 0 0 1 14 0z"/><path d="M10 11v8h4v-8M9 21h6"/>',grenadier:'<path d="M5 10a7 5 0 0 1 14 0z"/><path d="M10 10v8h4v-8"/><circle cx="17" cy="16" r="3"/>',flamer:'<path d="M5 10a7 5 0 0 1 14 0z"/><path d="M10 10v8h4v-8"/><path d="M14 15c3 0 5 2 5 5"/>',sniper:'<path d="M6 9a6 4 0 0 1 12 0z"/><path d="M10 9v10h4V9M19 3v18"/>',
 tank:'<ellipse cx="12" cy="14" rx="7" ry="5"/><path d="M12 9V3M5 18l-2 2M19 18l2 2M5 12H2M19 12h3"/>',buggy:'<circle cx="6" cy="12" r="2.5"/><circle cx="11" cy="12" r="2.5"/><circle cx="16" cy="12" r="2.5"/><path d="M4 16l-1 2M9 16l-1 2M14 16l-1 2M19 15l2 2"/>',artillery:'<ellipse cx="12" cy="15" rx="7" ry="4"/><circle cx="12" cy="8" r="3.5"/><path d="M14 6l4-3"/>',
 fighter:'<path d="M12 3v18M4 8h16M5 13h14"/>',heli:'<ellipse cx="12" cy="15" rx="4" ry="6"/><path d="M8 8 3 5M16 8l5-3M12 21v2"/>',scout:'<path d="M12 6v12M12 9C8 4 3 5 3 10s5 5 9 2c4 3 9 3 9-2s-5-6-9-1"/>',
 mech:'<path d="M9 21v-5M15 21v-5M8 16h8V9H8zM8 10l-3 4M16 10l3 4"/><circle cx="12" cy="6" r="3"/>',sentinel:'<path d="M9 21v-5M15 21v-5M8 16h8V9H8zM8 10l-3 4M16 10l2-6"/><circle cx="19" cy="3" r="1.5"/><circle cx="12" cy="6" r="3"/>',titan:'<path d="M8 22v-6M16 22v-6M7 16h10V9H7z"/><circle cx="12" cy="5" r="4"/><path d="M7 10 3 6M17 10l4-4"/>'};
const HUMU={},HUMI={};
const roster=()=>(CFG.species||0)===2?Object.keys(MICU):Object.keys(UD);
const deckKey=()=>{const i=CFG.species||0;return i===0?'deck':'deck'+i};
const DECK0={2:['rifle','grenadier','flamer','tank','buggy','fighter','mech','sentinel']};
function loadDeck(){const R=roster();let d=store.get(deckKey(),null);d=(d||DECK0[CFG.species||0]||['rifle','rocket','grenadier','tank','drone','heli','android','mech']).filter(k=>R.includes(k)).slice(0,8);DECK=d.length?d:R.slice(0,8);deckSel=null}
const MICB={
 barracks(inner,g,tc){const gc=micGlow(tc),gm=glowMat(gc),cap=0x6a4aa8,stalk=0xd8d0e4;
  inner.add(P(G.hex,0x3a2c48,1.5,0.18,1.5,0,0.3,0));
  inner.add(P(G.cyl,stalk,0.5,1.25,0.5,0,0.95,0),P(G.cyl,stalk,0.62,0.2,0.62,0,0.42,0),P(G.box,0x1a1222,0.26,0.36,0.08,0,0.56,0.26));
  inner.add(P(CAPG,cap,1.7,0.75,1.7,0,1.55,0));const gl=new THREE.Mesh(G.disc,gm);gl.scale.set(1.62,1.62,1);gl.rotation.x=Math.PI/2;gl.position.y=1.54;inner.add(gl);
  for(let k=0;k<7;k++){const a=k*0.9,r=0.25+0.3*(k%3)/2;const m=new THREE.Mesh(G.sph,gm);m.scale.set(0.13,0.06,0.13);m.position.set(Math.cos(a)*r,1.55+0.34*Math.sqrt(1-Math.min(1,r*r/0.72)),Math.sin(a)*r);inner.add(m)}
  for(const[x,z,h]of[[0.62,0.38,0.5],[-0.6,0.3,0.42],[0.45,-0.55,0.36],[-0.5,-0.45,0.55]]){inner.add(P(G.cyl,stalk,0.12,h,0.12,x,0.38+h/2,z),P(CAPG,cap,0.48,0.26,0.48,x,0.36+h,z));const d=new THREE.Mesh(G.disc,gm);d.scale.set(0.44,0.44,1);d.rotation.x=Math.PI/2;d.position.set(x,0.355+h,z);inner.add(d)}
  g.userData.pulse=[{m:gm,c:gm.emissive.clone()}];g.userData.flies=makeFlies(gc,10,0.9,1.0,2.3,g)},
 factory(inner,g,tc){const gc=micGlow(tc),gm=glowMat(new THREE.Color(0xffc040).lerp(gc,0.35)),ch=0x4a3c58,ch2=0x3a2e48;
  let y=0.3;[[1.7,0.5],[1.35,0.48],[1.0,0.42],[0.6,0.32]].forEach(([r,h],i)=>{inner.add(P(G.hex,i%2?ch2:ch,r,h,r,0,y+h/2,0,0,i*0.26));
   if(i<3)for(let k=0;k<6;k++){const a=k*Math.PI/3+i*0.26+Math.PI/6,rr=r*0.44;const c=new THREE.Mesh(G.hex,gm);c.scale.set(0.16,0.2,0.04);c.position.set(Math.cos(a)*rr,y+h/2,Math.sin(a)*rr);c.rotation.set(Math.PI/2,0,0);c.lookAt(Math.cos(a)*5,y+h/2,Math.sin(a)*5);c.rotateX(Math.PI/2);if(!(i===0&&k===1))inner.add(c)}
   y+=h*0.92});
  inner.add(P(G.cone,ch2,0.35,0.4,0.35,0,y+0.15,0));
  inner.add(P(G.box,0x120c18,0.5,0.42,0.12,0,0.55,0.78));
  g.userData.pulse=[{m:gm,c:gm.emissive.clone()}]},
 helipad(inner,g,tc){const gc=micGlow(tc),gm=glowMat(gc),bark=0x5a4868,leaf=0x3a6a5a;
  inner.add(P(G.hex,0x3a2c48,1.5,0.15,1.5,0,0.3,0));
  for(let k=0;k<3;k++){const a=k*2.094+0.4;inner.add(P(G.sph,leaf,0.85,0.08,0.5,Math.cos(a)*0.55,0.45,Math.sin(a)*0.55,0,-a,0));const v=new THREE.Mesh(G.box,gm);v.scale.set(0.7,0.02,0.03);v.position.set(Math.cos(a)*0.55,0.5,Math.sin(a)*0.55);v.rotation.y=-a;inner.add(v)}
  inner.add(P(G.cyl,bark,0.22,1.2,0.22,-0.35,0.95,-0.2,0,0,0.12),P(G.cyl,bark,0.16,0.9,0.16,-0.1,1.75,-0.2,0,0,-0.9),P(G.cyl,bark,0.06,0.3,0.06,0.28,1.85,-0.2));
  const pod=new THREE.Group();pod.position.set(0.28,1.35,-0.2);pod.add(P(G.hex,0x6a5a3a,0.5,0.75,0.5,0,0,0),P(G.cone,0x6a5a3a,0.5,0.25,0.5,0,-0.5,0,Math.PI,0,0));
  for(let k=0;k<3;k++){const b=new THREE.Mesh(G.hex,gm);b.scale.set(0.52,0.05,0.52);b.position.y=-0.22+k*0.22;pod.add(b)}inner.add(pod);
  g.userData.pulse=[{m:gm,c:gm.emissive.clone()}];g.userData.pod=pod},
 ialab(inner,g,tc){const gc=micGlow(tc),gm=glowMat(gc),gm2=glowMat(new THREE.Color(gc).lerp(new THREE.Color(0xffffff),0.4)),bark=0x5a4868,bark2=0x46385a;
  inner.add(P(G.hex,0x3a2c48,1.5,0.15,1.5,0,0.3,0));
  for(let k=0;k<3;k++){const a=k*2.094+0.5,x=Math.cos(a)*0.7,z=Math.sin(a)*0.7;
   inner.add(P(G.cyl,k?bark:bark2,0.34,1.1,0.34,x*0.92,0.9,z*0.92,Math.sin(a)*0.22,0,-Math.cos(a)*0.22),P(G.cyl,bark,0.24,0.9,0.24,x*0.55,1.75,z*0.55,Math.sin(a)*0.75,0,-Math.cos(a)*0.75));
   for(let j=0;j<3;j++){const b=a+(j-1)*0.6;inner.add(P(TORG,bark2,0.35,0.35,0.6,x+Math.cos(b)*0.15,0.36,z+Math.sin(b)*0.15,0,-b+Math.PI/2,0))}
   for(const[o,r]of[[0.85,0.36],[1.15,0.26]]){const cn=new THREE.Mesh(ICOG,gm);cn.scale.set(r,r*0.7,r);cn.position.set(x*o,1.95+(o-0.85)*0.4,z*o);inner.add(cn)}}
  {const a=0.5,x=Math.cos(a)*0.62,z=Math.sin(a)*0.62;for(const s2 of[-1,1]){const e2=new THREE.Mesh(G.sph,gm2);e2.scale.setScalar(0.06);e2.position.set(x+Math.sin(a)*0.08*s2,1.2,z-Math.cos(a)*0.08*s2);e2.position.addScaledVector(new THREE.Vector3(-Math.cos(a),0,-Math.sin(a)),0.17);inner.add(e2)}}
  const heart=new THREE.Mesh(G.oct,gm2);heart.scale.set(0.42,0.6,0.42);heart.position.y=1.15;inner.add(heart);g.userData.spin=heart;
  g.userData.pulse=[{m:gm,c:gm.emissive.clone()},{m:gm2,c:gm2.emissive.clone()}];g.userData.flies=makeFlies(gc,10,0.8,0.8,2.2,g)},
 turret(inner,g,tc){const gc=micGlow(tc),gm=glowMat(gc),leaf=0x3a6a5a,leaf2=0x2e5648,stem=0x4f7048,bulb=0x5e3f96,pet=0x7a52b8;
  inner.add(P(G.hex,0x3a2c48,1.4,0.16,1.4,0,0.3,0));
  for(let k=0;k<6;k++){const a=k*Math.PI/3+0.3,l=new THREE.Group();l.position.set(0,0.4,0);l.rotation.y=a;l.add(P(G.sph,k%2?leaf:leaf2,0.36,0.07,0.95,0,0.06,0.42,-0.18,0,0));const v=new THREE.Mesh(G.box,gm);v.scale.set(0.02,0.02,0.6);v.position.set(0,0.11,0.4);v.rotation.x=-0.18;l.add(v);inner.add(l)}
  inner.add(P(G.cyl,stem,0.26,0.8,0.26,0,0.78,0),P(G.cyl,stem,0.34,0.14,0.34,0,0.42,0),P(G.sph,leaf,0.4,0.06,0.18,0.24,0.85,0.05,0,0.4,0.5),P(G.sph,leaf2,0.36,0.06,0.16,-0.22,0.98,-0.06,0,-0.5,-0.5));
  const h=new THREE.Group();h.position.y=1.2;const tl=new THREE.Group();tl.rotation.x=-0.45;h.add(tl);const bl=new THREE.Group();tl.add(bl);
  bl.add(P(G.sph,bulb,0.82,0.7,0.8,0,0,-0.06),P(G.sph,0x4a3078,0.6,0.5,0.4,0,0,-0.36));
  for(let k=0;k<4;k++){const a=k*Math.PI/2+0.4,v=new THREE.Mesh(G.box,gm);v.scale.set(0.03,0.03,0.6);v.position.set(Math.cos(a)*0.37,Math.sin(a)*0.32,-0.1);bl.add(v)}
  for(let k=0;k<7;k++){const pv=new THREE.Group();pv.rotation.z=k*Math.PI*2/7;pv.position.z=0.26;pv.add(P(G.sph,k%2?pet:bulb,0.26,0.07,0.42,0,0.3,0.06,-0.85,0,0));const tip=new THREE.Mesh(G.sph,gm);tip.scale.set(0.09,0.04,0.1);tip.position.set(0,0.5,0.2);pv.add(tip);bl.add(pv)}
  bl.add(P(G.cyl,0x140a1a,0.34,0.08,0.34,0,0,0.3,Math.PI/2,0,0));const core=new THREE.Mesh(G.sph,gm);core.scale.setScalar(0.2);core.position.z=0.28;bl.add(core);
  const mz=new THREE.Object3D();mz.position.z=0.45;tl.add(mz);
  inner.add(h);g.userData.head=h;g.userData.bulb=bl;g.userData.muz=[mz];g.userData.pulse=[{m:gm,c:gm.emissive.clone()}];g.userData.flies=makeFlies(gc,6,0.7,0.8,1.8,g)}
};
function buildingMesh(type,tc,sp){PANELON=true;if(sp!=null)MESHSP=sp;
 const g=new THREE.Group(),inner=new THREE.Group();g.add(inner);
 const NEWQ=type==='barracks'&&MESHSP!==2;if(type!=='hq'&&!NEWQ)inner.add(P(G.hex,MESHSP===2?0x2a2034:DARK,1.9,0.9,1.9,0,-0.23,0),P(G.hex,tc,1.94,0.05,1.94,0,0.2,0));
 if(NEWQ){const q=CQ.cuartelModel(1,tc);[...q.children].forEach(c=>inner.add(c));Object.assign(g.userData,q.userData)}else
 if(MESHSP===2&&MICB[type])MICB[type](inner,g,tc);else switch(type){
  case'hq':{const H6=Math.PI/6;
   if(MESHSP===2){// Árbol de la Vida (Centro de Control Micelian): tronco a la vista y tres copas
    const bark=0x5a4868,bark2=0x46385a,glowC=new THREE.Color(0x2affc8).lerp(new THREE.Color(tc),0.2);
    inner.add(P(G.hex,0x2a2034,4.6,0.35,4.6,0,0.18,0,0,H6),P(G.hex,tc,4.66,0.05,4.66,0,0.06,0,0,H6),P(G.hex,0x3a2c48,3.0,0.3,3.0,0,0.45,0,0,H6));
    for(let k=0;k<9;k++){const a=k*0.698+0.2,r=1.3+0.2*(k%2);inner.add(P(TORG,k%2?bark:bark2,1.9,1.9,2.8,Math.cos(a)*r*0.55,0.5,Math.sin(a)*r*0.55,0,-a+Math.PI/2,0))}
    let y=0.5,x=0,z=0;for(let k=0;k<6;k++){const h=0.45,r=0.55-k*0.055,tx=Math.sin(k*1.9)*0.05,tz=Math.cos(k*1.4)*0.05;inner.add(P(G.cyl,k%2?bark:bark2,r*2,h,r*2,x,y+h/2,z,tz*1.2,k*0.4,-tx*1.2));x+=tx;z+=tz;y+=h*0.95}
    for(let k=0;k<3;k++){const a=k*2.094;for(let j=0;j<5;j++){const yy=0.7+j*0.45,aa=a+j*0.5;inner.add(P(G.cyl,bark2,0.15,0.5,0.15,Math.cos(aa)*0.5,yy,Math.sin(aa)*0.5,0.35*Math.sin(aa),0,-0.35*Math.cos(aa)))}}
    const top=y,gm=glowMat(glowC),gm2=glowMat(new THREE.Color(glowC).lerp(new THREE.Color(0xffffff),0.35));
    const lm=new THREE.MeshBasicMaterial({color:glowC,transparent:true,opacity:0.75});
    const can=new THREE.Group(),CL=[];
    for(let i=0;i<3;i++){const a=i*2.094+0.5,d=1.35,hy=top+0.55+i*0.3,cx=Math.cos(a)*d,cz=Math.sin(a)*d;CL.push([cx,hy,cz]);
     // rama principal hacia la copa
     for(let j=0;j<3;j++){const t=(j+0.5)/3;inner.add(P(G.cyl,j?bark:bark2,0.32-j*0.07,0.62,0.32-j*0.07,cx*t,top-0.25+(hy-top+0.25)*t,cz*t,Math.sin(a)*0.95,0,-Math.cos(a)*0.95))}
     const cg=new THREE.Group();cg.position.set(cx,hy,cz);
     for(const[ox,oy,oz,r]of[[0,0.15,0,0.62],[0.42,0,0.15,0.42],[-0.38,0.02,-0.18,0.44],[0.1,0.03,-0.42,0.4],[-0.22,-0.05,0.38,0.38],[0.05,0.48,0.03,0.38]]){const m=new THREE.Mesh(ICOG,r>0.6?gm2:gm);m.scale.set(r*1.5,r*1.05,r*1.5);m.position.set(ox,oy,oz);m.rotation.set(ox*2,oz*3,0);cg.add(m)}
     for(let k=0;k<6;k++){const b2=k*1.047+i,r=0.55+0.15*(k%2),l=0.55+((k*5+i)%4)*0.22;const v=new THREE.Mesh(G.cyl,lm);v.scale.set(0.03,l,0.03);v.position.set(Math.cos(b2)*r,-0.28-l/2,Math.sin(b2)*r);cg.add(v);const f=new THREE.Mesh(G.sph,gm2);f.scale.setScalar(0.09);f.position.set(Math.cos(b2)*r,-0.32-l,Math.sin(b2)*r);cg.add(f)}
     can.add(cg)}
    inner.add(can);
    const slots=[],bays=[];CL.forEach(([cx,hy,cz])=>{for(let k=0;k<4;k++){const a=k*1.57;slots.push(new THREE.Vector3(cx+Math.cos(a)*0.6,hy+0.5,cz+Math.sin(a)*0.6))}});
    for(let k=0;k<3;k++){const a=k*2.094+1.55;bays.push(new THREE.Vector3(Math.cos(a)*1.9,0.6,Math.sin(a)*1.9))}
    g.userData.slots=slots;g.userData.bays=bays;g.userData.CL=CL;g.userData.top=top;g.userData.glowC=glowC;g.userData.tree={can,gm,gm2,c1:gm.emissive.clone(),c2:gm2.emissive.clone(),y0:0,big:1};
    g.userData.flies=makeFlies(glowC,46,2.6,0.6,top+1.6,g);g.userData.barY=top+2.1;break}
   {// Centro de Control humano: rover colosal. Orden funcional de proa a popa: sensores y brazo · mando · comunicaciones y armas · silo y energía (el peso va sobre los bogies)
    const body=new THREE.Group();inner.add(body);const RW=0.6,WX=1.68,AX=1.3,PY=1.3,PZ=0.15,BZ=-0.9,HUB=0x7d858d,TY=0x15181b,STR=0x23282d,DECKC=0x6b747d,FOIL=0xb8923a;
    const win=new THREE.MeshBasicMaterial({color:0x8fe9ff}),amb=new THREE.MeshBasicMaterial({color:0xffb030}),lamp=new THREE.MeshBasicMaterial({color:0xfff2c0});
    // bastidor: dos largueros, travesaños y panza. Es lo que carga; todo lo demás se apoya encima
    for(const sx of[-1,1])body.add(P(G.box,STR,0.2,0.2,3.8,sx*0.8,1.0,0));
    for(const z of[-1.7,-0.6,0.6,1.7])body.add(P(G.box,STR,1.8,0.14,0.16,0,1.0,z));
    body.add(P(G.box,DARK,1.9,0.16,3.3,0,1.16,0),P(G.box,STR,2.36,0.2,0.18,0,1.02,1.98),P(G.box,STR,2.1,0.2,0.18,0,1.02,-1.94));
    for(const sx of[-1,1])body.add(P(G.box,amb,0.12,0.12,0.1,sx*0.7,1.02,2.1));
    // casco: caja térmica con franja del bando y cubierta transitable
    body.add(P(G.box,MID,2.3,0.52,3.4,0,1.5,0),P(G.box,tc,2.34,0.07,3.44,0,1.67,0),P(G.box,DECKC,2.24,0.04,3.34,0,1.78,0));
    // proa: glacis inclinado, barra de sensores y focos
    body.add(P(G.box,MID,2.1,0.46,0.62,0,1.46,1.84,0.6,0,0),P(G.box,DARK,1.5,0.12,0.08,0,1.52,2.13),P(G.box,lamp,0.22,0.1,0.04,0.92,1.5,2.1),P(G.box,lamp,0.22,0.1,0.04,-0.92,1.5,2.1));
    // costados: radiadores con lamas (evacúan el calor del generador), ojos de buey y escotilla de servicio
    for(const sx of[-1,1]){for(const z of[-1.25,-0.45]){body.add(P(G.box,0x101418,0.04,0.3,0.62,sx*1.16,1.44,z));for(let q=0;q<4;q++)body.add(P(G.box,LIGHT,0.05,0.02,0.6,sx*1.165,1.34+q*0.07,z))}
     for(let q=0;q<5;q++)body.add(P(G.box,win,0.02,0.06,0.09,sx*1.156,1.5,0.45+q*0.24))}
    // escala humana: barandas, escalera plegable y puerta. Son lo que hace leer el tamaño
    {const RL=0x9aa3ab;for(const sx of[-1,1]){for(const z of[-1.62,-1.1,-0.75])body.add(P(G.box,RL,0.025,0.22,0.025,sx*1.09,1.91,z));body.add(P(G.box,RL,0.025,0.025,0.9,sx*1.09,2.02,-1.18))}
     for(const x of[-1.09,-0.55,0.55,1.09])body.add(P(G.box,RL,0.025,0.22,0.025,x,1.91,-1.64));body.add(P(G.box,RL,0.5,0.025,0.025,-0.82,2.02,-1.64),P(G.box,RL,0.5,0.025,0.025,0.82,2.02,-1.64));
     for(const dz of[-0.11,0.11])body.add(P(G.box,RL,0.03,1.25,0.03,-1.19,0.72,-0.86+dz));for(let q=0;q<6;q++)body.add(P(G.box,RL,0.03,0.025,0.22,-1.19,0.2+q*0.2,-0.86));
     body.add(P(G.box,amb,0.02,0.05,0.34,-1.165,1.26,-0.86))}
    // puente de mando: el volumen que manda. Dos cuerpos escalonados, parabrisas corrido con visera y cúpula
    body.add(P(G.box,DARK,1.6,0.5,1.3,0,2.05,0.55),P(G.box,tc,1.64,0.05,1.34,0,2.32,0.55),P(G.box,MID,1.7,0.05,0.3,0,2.26,1.28),P(G.box,DARK,1.5,0.3,0.3,0,1.95,1.2,-0.5,0,0));
    body.add(P(G.box,win,1.44,0.15,0.02,0,2.13,1.205),P(G.box,win,0.02,0.15,0.9,0.805,2.13,0.65),P(G.box,win,0.02,0.15,0.9,-0.805,2.13,0.65));
    body.add(P(G.box,MID,1.1,0.3,0.8,0,2.49,0.45),P(G.box,win,1.0,0.07,0.02,0,2.52,0.855),P(G.box,0x101418,1.14,0.04,0.84,0,2.66,0.45));
    body.add(P(G.box,0x101418,0.3,0.4,0.02,0.45,2.02,-0.105),P(G.box,amb,0.3,0.03,0.03,0.45,2.25,-0.11),P(G.box,0x101418,0.5,0.34,0.02,-0.4,2.0,-0.105));
    // tren de rodaje: balancín y bogie por lado, con pivotes a la vista. Los brazos se recolocan cada cuadro según la altura de cada rueda
    const mkL=()=>{const m=P(G.box,HUB,0.14,0.17,1,0,0,0);inner.add(m);return m};const links=[];
    for(const sx of[-1,1]){const x=sx*AX;body.add(P(G.cyl,DARK,0.5,0.2,0.5,sx*1.24,PY,PZ,0,0,Math.PI/2),P(G.cyl,tc,0.24,0.24,0.24,sx*1.26,PY,PZ,0,0,Math.PI/2));
     const L={fa:mkL(),ra:mkL(),bm:mkL(),br:mkL(),bp:P(G.cyl,DARK,0.34,0.2,0.34,x,0,BZ,0,0,Math.PI/2)};for(const k of['fa','ra','bm','br'])L[k].position.x=x;L.bm.position.x=L.br.position.x=x+sx*0.02;inner.add(L.bp);links.push(L)}
    // ruedas anchas de llanta abierta con garras; cubo motor por dentro
    const wheels=[];for(const sx of[-1,1])for(const wz of[1.75,-0.05,-1.75]){const w=new THREE.Group();w.position.set(sx*WX,RW,wz);const tire=new THREE.Group();
     tire.add(P(G.cyl,TY,RW*2,0.56,RW*2,0,0,0,0,0,Math.PI/2),P(G.cyl,HUB,RW*1.5,0.58,RW*1.5,0,0,0,0,0,Math.PI/2),P(G.cyl,0x101418,RW*1.1,0.6,RW*1.1,0,0,0,0,0,Math.PI/2),P(G.cyl,tc,RW*0.5,0.64,RW*0.5,0,0,0,0,0,Math.PI/2));
     for(let k=0;k<10;k++){const a=k*Math.PI/5;tire.add(P(G.box,STR,0.58,0.09,0.15,0,Math.sin(a)*RW,Math.cos(a)*RW,Math.PI/2-a,0,(k%2?0.18:-0.18)))}
     for(let k=0;k<5;k++){const a=k*Math.PI*0.4;tire.add(P(G.box,LIGHT,0.6,0.05,RW*1.3,0,0,0,a,0,0))}
     w.add(tire,P(G.cyl,DARK,0.3,0.42,0.3,-sx*0.24,0,0,0,0,Math.PI/2));inner.add(w);wheels.push({w,tire,x:sx*WX,z:wz})}
    // mástil de dos tramos con cabeza de cámaras
    body.add(P(G.box,DARK,0.34,0.14,0.34,0.92,1.86,1.42),P(G.cyl,LIGHT,0.2,0.7,0.2,0.92,2.25,1.42),P(G.cyl,HUB,0.24,0.06,0.24,0.92,2.6,1.42),P(G.cyl,LIGHT,0.13,0.62,0.13,0.92,2.92,1.42));
    const mast=new THREE.Group();mast.position.set(0.92,3.33,1.42);mast.add(P(G.box,LIGHT,0.62,0.3,0.32,0,0,0),P(G.box,DARK,0.66,0.06,0.4,0,0.17,0.03),P(G.box,0x101418,0.52,0.2,0.02,0,0,0.162),P(G.sph,win,0.16,0.16,0.08,0.15,0,0.17),P(G.sph,win,0.11,0.11,0.08,-0.14,0.02,0.17),P(G.sph,lamp,0.06,0.06,0.05,-0.14,-0.08,0.17));body.add(mast);
    // brazo de trabajo recogido sobre la proa: hombro, brazo, codo, antebrazo y torreta de herramientas
    body.add(P(G.cyl,DARK,0.3,0.22,0.3,-0.82,1.3,2.02),P(G.box,LIGHT,0.15,0.15,0.95,-0.82,1.24,2.46,-0.2,0,0),P(G.cyl,HUB,0.2,0.2,0.2,-0.82,1.14,2.9,0,0,Math.PI/2),P(G.box,LIGHT,0.13,0.13,0.8,-0.6,1.14,2.52,0,0.12,0),P(G.box,DARK,0.3,0.26,0.3,-0.56,1.14,2.1),P(G.box,tc,0.32,0.05,0.32,-0.56,1.29,2.1));
    // generador trasero: cilindro con aletas de disipación, manta dorada y soportes
    {const rt=new THREE.Group();rt.position.set(0,1.56,-1.9);rt.rotation.x=-1.05;rt.add(P(G.cyl,DARK,0.5,1.2,0.5,0,0.6,0),P(G.cyl,FOIL,0.52,0.22,0.52,0,0.18,0),P(G.cyl,amb,0.3,0.04,0.3,0,1.22,0),P(G.cyl,HUB,0.56,0.05,0.56,0,1.16,0));
     for(let k=0;k<8;k++){const a=k*Math.PI/4;rt.add(P(G.box,LIGHT,0.03,0.85,0.2,Math.sin(a)*0.33,0.68,Math.cos(a)*0.33,0,a+Math.PI/2,0))}body.add(rt);
     for(const sx of[-1,1])body.add(P(G.box,STR,0.07,0.07,0.9,sx*0.36,1.55,-2.2,0.75,0,0))}
    // antena de látigo con baliza y antena de baja ganancia
    body.add(P(G.cyl,LIGHT,0.04,1.6,0.04,-1.0,2.6,-1.5),P(G.sph,0xff5050,0.09,0.09,0.09,-1.0,3.42,-1.5),P(G.box,DARK,0.16,0.1,0.16,-1.0,1.85,-1.5),P(G.cyl,LIGHT,0.16,0.2,0.16,1.0,1.9,-1.5),P(G.cyl,DARK,0.06,0.3,0.06,1.0,2.12,-1.5));
    // lanzadores en los flancos (6 tubos cada uno), inclinados hacia afuera para tener campo de tiro libre
    const slots=[],bays=[];
    for(const sx of[-1,1]){const pd=new THREE.Group();pd.position.set(sx*0.88,1.8,-0.42);pd.add(P(G.cyl,DARK,0.4,0.12,0.4,0,0.06,0));const bx=new THREE.Group();bx.position.y=0.3;bx.rotation.z=-sx*0.4;bx.add(P(G.box,DARK,0.46,0.34,0.62,0,0,0),P(G.box,tc,0.48,0.04,0.64,0,-0.12,0));
      for(let h=0;h<6;h++){const ox=(h%2?0.1:-0.1),oz=-0.2+Math.floor(h/2)*0.2;bx.add(P(G.cyl,LIGHT,0.15,0.03,0.15,ox,0.175,oz),P(G.cyl,0x101418,0.1,0.035,0.1,ox,0.176,oz));slots.push(new THREE.Vector3(sx*0.88+ox+sx*0.1,2.35,-0.42+oz))}pd.add(bx);body.add(pd)}
    // compuertas de drones: dos en los flancos de proa y una en el glacis
    for(const[bx,by,bz,ry]of[[-1.165,1.46,0.9,-Math.PI/2],[1.165,1.46,0.9,Math.PI/2],[0,1.6,2.02,0]]){body.add(P(G.box,0x101418,0.46,0.22,0.03,bx,by,bz,ry?0:0.6,ry,0),P(G.box,amb,0.46,0.02,0.035,bx,by+0.13,bz+(ry?0:-0.08),ry?0:0.6,ry,0));bays.push(new THREE.Vector3(bx*1.2,by+0.1,bz*1.1))}
    // parabólica de alta ganancia sobre la cúpula
    const dg=new THREE.Group();dg.position.set(-0.22,2.68,0.3);dg.add(P(G.cyl,DARK,0.24,0.2,0.24,0,0.1,0));
    const tilt=new THREE.Group();tilt.position.y=0.26;tilt.rotation.x=0.75;tilt.scale.setScalar(0.95);
    const dish=new THREE.Mesh(DISHGEO,DISHMAT);dish.rotation.x=Math.PI;dish.position.y=0.62;tilt.add(dish);
    for(let k=0;k<3;k++){const a=k*2.09;tilt.add(P(G.cyl,LIGHT,0.02,0.42,0.02,Math.sin(a)*0.22,0.2,Math.cos(a)*0.22,Math.cos(a)*0.5,0,-Math.sin(a)*0.5))}
    tilt.add(P(G.sph,LIGHT,0.08,0.08,0.08,0,0.4,0));dg.add(tilt);body.add(dg);
    g.userData.dish=dg;g.userData.slots=slots;g.userData.bays=bays;g.userData.barY=4.0;g.userData.deck=body;g.userData.rover={body,wheels,mast,links,RW,PY,PZ,BZ};break}}
  case'bastion':{inner.add(P(G.hex,MID,1.5,0.9,1.5,0,0.65,0),P(G.hex,tc,1.56,0.12,1.56,0,1.1,0));for(let k=0;k<6;k++){const a=k*Math.PI/3+Math.PI/6;inner.add(P(G.box,DARK,0.22,0.25,0.22,Math.sin(a)*0.62,1.28,Math.cos(a)*0.62))}const h=new THREE.Group();h.position.y=1.35;h.add(P(G.sph,LIGHT,0.6,0.45,0.6,0,0,0),P(G.box,DARK,0.14,0.14,0.9,0,0.05,0.45));inner.add(h);g.userData.head=h;break}
  case'barracks':inner.add(P(G.box,MID,1.5,0.7,1.15,0,0.55,0),P(G.box,tc,1.52,0.1,1.17,0,0.9,0),P(G.box,DARK,0.6,0.35,0.5,0.2,1.1,0),P(G.box,0x0a0d10,0.42,0.42,0.02,0,0.45,0.575));{const d=P(G.box,0x3a434d,0.42,0.42,0.05,0,0.45,0.6);d.userData.y0=0.45;d.userData.lift=0.38;inner.add(d,P(G.box,tc,0.42,0.05,0.06,0,0.68,0.6));g.userData.door=d}break;
  case'factory':{const DK=0x1c2126,HALL=0x3b444d,W=0x4a545e;
   // Hexágono partido en tres rombos (lectura de cubo isométrico): nave atrás, ala con portón a la izquierda, planta de estanques a la derecha
   const pol=(r,a)=>[Math.sin(a)*r,Math.cos(a)*r],D60=Math.PI/3;
   const RB=(k,r,c,h,y,sh)=>{const m=new THREE.Mesh(rhombGeo(k,r,sh||0),typeof c==='number'?M(c):c);m.scale.y=h;m.position.y=y;inner.add(m);return m};
   const Bx=(c,w,h,d,x,y,z,ry)=>{const m=P(G.box,c,w,h,d,x,y+h/2,z,0,ry||0);inner.add(m);return m};
   inner.add(P(G.hex,DARK,1.8,0.08,1.8,0,0.26,0));
   // nave principal (rombo trasero): dos pisos, faja, parapeto y pilares en sus 3 vértices exteriores
   RB(2,0.84,HALL,0.48,0.3,0.05);RB(2,0.87,DK,0.045,0.78,0.05);RB(2,0.8,HALL,0.36,0.82,0.07);RB(2,0.85,DARK,0.07,1.16,0.05);RB(2,0.7,DK,0.02,1.2,0.11);
   for(let v=2;v<=4;v++){const[x,z]=pol(0.8,v*D60);Bx(DARK,0.08,0.92,0.08,x,0.3,z,v*D60)}
   {const[x,z]=pol(0.42,3*D60);Bx(LIGHT,0.18,0.08,0.14,x-0.12,1.2,z,0);Bx(MID,0.22,0.06,0.16,x+0.16,1.2,z+0.05,0)}
   for(const v of[2.5,3.5]){const[x,z]=pol(0.72,v*D60);for(const[y,h]of[[0.46,0.1],[0.92,0.08]])Bx(DK,0.4,h,0.03,x,y,z,v*D60)}
   // ala baja (rombo izquierdo) con portón en la cara frontal y rejillas en el techo
   RB(4,0.84,W,0.42,0.3,0.05);RB(4,0.87,DK,0.04,0.72,0.05);
   {const fa=-D60/2,[fx,fz]=pol(0.84*0.866-0.03,fa);
    inner.add(P(G.box,DK,0.4,0.3,0.06,fx,0.47,fz,0,fa));
    const d=P(G.box,0x3a434d,0.38,0.28,0.04,fx+Math.sin(fa)*0.035,0.46,fz+Math.cos(fa)*0.035,0,fa);d.userData.y0=0.46;d.userData.lift=0.27;inner.add(d);for(let k=0;k<4;k++)d.add(P(G.box,0x2a3138,1.02,0.06,1.4,0,-0.36+k*0.24,0.2));g.userData.door=d;
    for(const o of[-0.22,0.22]){const px=fx+Math.cos(fa)*o+Math.sin(fa)*0.04,pz=fz-Math.sin(fa)*o+Math.cos(fa)*0.04;Bx(tc,0.045,0.34,0.045,px,0.3,pz,fa)}
    Bx(tc,0.5,0.035,0.05,fx+Math.sin(fa)*0.04,0.64,fz+Math.cos(fa)*0.04,fa)}
   for(const[r,va]of[[0.36,4.75],[0.6,5.25]]){const[x,z]=pol(r,va*D60);Bx(DK,0.2,0.06,0.28,x,0.76,z,va*D60);for(let k=0;k<3;k++)Bx(MID,0.18,0.012,0.025,x+Math.sin(va*D60)*(k-1)*0.08,0.82,z+Math.cos(va*D60)*(k-1)*0.08,va*D60+Math.PI/2)}
   {const[x,z]=pol(0.62,4.2*D60);inner.add(P(G.hex,LIGHT,0.09,0.17,0.09,x,0.85,z),P(G.hex,LIGHT,0.09,0.13,0.09,x+0.1,0.83,z+0.06))}
   // planta de proceso (rombo derecho): losa baja, estanques hexagonales del color del bando y chimeneas cónicas escalonadas
   RB(0,0.84,W,0.2,0.3,0.05);RB(0,0.87,DK,0.035,0.5,0.05);
   for(const va of[0.62,1.38]){const[x,z]=pol(0.5,va*D60);
    inner.add(P(G.hex,tc,0.34,0.62,0.34,x,0.84,z),P(G.hex,DK,0.37,0.04,0.37,x,0.6,z),P(G.hex,DK,0.37,0.04,0.37,x,1.12,z),P(G.hex,DARK,0.3,0.06,0.3,x,1.18,z),
     P(FCHIM,DARK,0.2,0.3,0.2,x,1.36,z),P(FCHIM,0x252b31,0.13,0.5,0.13,x,1.76,z),P(G.hex,DK,0.14,0.04,0.14,x,2.03,z))}
   {const[x1,z1]=pol(0.5,0.62*D60),[x2,z2]=pol(0.5,1.38*D60);Bx(DARK,0.06,0.06,Math.hypot(x2-x1,z2-z1),(x1+x2)/2,0.98,(z1+z2)/2,Math.atan2(x2-x1,z2-z1))}
   {const[x,z]=pol(0.36,1*D60),[hx,hz]=pol(0.4,2.2*D60);Bx(DARK,0.05,0.05,Math.hypot(hx-x,hz-z),(x+hx)/2,0.86,(z+hz)/2,Math.atan2(hx-x,hz-z))}
   {const[x,z]=pol(0.74,1.0*D60);Bx(MID,0.12,0.26,0.2,x,0.5,z,D60*1.5);Bx(LIGHT,0.035,0.18,0.14,x+0.06,0.54,z,D60*1.5)}
   break}
  case'ialab':{inner.add(P(G.hex,MID,1.7,0.5,1.7,0,0.4,0),P(G.hex,tc,1.74,0.06,1.74,0,0.66,0),P(G.box,DARK,0.9,0.5,0.5,0,0.5,0.55));const dome=new THREE.Mesh(G.sph,new THREE.MeshLambertMaterial({color:0x7fe8ff,transparent:true,opacity:0.55,emissive:0x0e4a5a}));dome.scale.set(1.15,0.8,1.15);dome.position.y=0.66;inner.add(dome);inner.add(P(G.cyl,LIGHT,0.04,0.9,0.04,0.45,1.1,-0.35),P(G.sph,0x7fe8ff,0.1,0.1,0.1,0.45,1.58,-0.35));const ring=new THREE.Group();ring.position.y=1.15;ring.add(P(G.box,LIGHT,1.3,0.03,0.05,0,0,0),P(G.box,LIGHT,0.05,0.03,1.3,0,0,0));inner.add(ring);g.userData.spin=ring;{const d=P(G.box,0x3a434d,0.6,0.36,0.05,0,0.45,0.81);d.userData.y0=0.45;d.userData.lift=0.34;inner.add(P(G.box,0x0a0d10,0.6,0.36,0.02,0,0.45,0.79),d);g.userData.door=d}break}
  case'helipad':inner.add(P(G.hex,MID,1.7,0.25,1.7,0,0.32,0),P(G.disc,tc,1.1,1,1.1,0,0.46,0),P(G.disc,DARK,0.8,1,0.8,0,0.47,0),P(G.box,LIGHT,0.1,0.02,0.45,-0.12,0.48,0),P(G.box,LIGHT,0.1,0.02,0.45,0.12,0.48,0),P(G.box,LIGHT,0.24,0.02,0.08,0,0.48,0),P(G.box,DARK,0.3,0.8,0.3,0.65,0.6,0.35));{const d=P(G.disc,0xffe27a,1.25,1,1.25,0,0.455,0);d.material=new THREE.MeshBasicMaterial({color:0xffe27a,transparent:true,opacity:0});d.userData.ring=true;inner.add(d);g.userData.door=d}break;
  case'extractor':{
   if(MESHSP===2){// Árbol de Luz (Micelian)
    const bark=0x5a4868,glowC=new THREE.Color(0x2affc8).lerp(new THREE.Color(tc),0.25);
    inner.add(P(G.hex,0x2a2034,1.3,0.12,1.3,0,0.3,0));
    for(let k=0;k<5;k++){const a=k*1.2566+0.3;inner.add(P(TORG,bark,0.55,0.55,0.9,Math.cos(a)*0.42,0.32,Math.sin(a)*0.42,0,-a+Math.PI/2,0))}
    const trunk=new THREE.Group();trunk.position.y=0.3;
    let y=0,x=0,z=0;for(let k=0;k<5;k++){const h=0.44,r=0.17-k*0.022,tx=Math.sin(k*1.7)*0.08,tz=Math.cos(k*1.3)*0.08;trunk.add(P(G.cyl,bark,r*2,h,r*2,x+tx*0.5,y+h/2,z+tz*0.5,tz*1.4,0,-tx*1.4));x+=tx;z+=tz;y+=h*0.92}
    inner.add(trunk);
    for(const[a,l,t]of[[0.4,0.55,0.9],[2.5,0.5,1.0],[4.4,0.6,0.85]]){inner.add(P(G.cyl,bark,0.09,l,0.09,Math.cos(a)*0.22,1.75,Math.sin(a)*0.22,Math.sin(a)*t,0,-Math.cos(a)*t))}
    const can=new THREE.Group();can.position.y=2.35;const gm=glowMat(glowC),gm2=glowMat(new THREE.Color(glowC).lerp(new THREE.Color(0xffffff),0.35));
    for(const[cx,cy,cz,r]of[[0,0.2,0,0.5],[0.5,0,0.18,0.34],[-0.45,0.02,-0.22,0.36],[0.12,0.04,-0.5,0.32],[-0.28,-0.06,0.45,0.3],[0.05,0.55,0.05,0.3],[0.38,0.3,-0.25,0.24]]){const m=new THREE.Mesh(ICOG,r>=0.5?gm2:gm);m.scale.set(r*1.7,r*1.25,r*1.7);m.position.set(cx,cy,cz);m.rotation.set(cx*2,cz*3,0);can.add(m)}
    for(let k=0;k<6;k++){const a=k*1.047+0.5,m=new THREE.Mesh(G.sph,gm2);m.scale.setScalar(0.11);m.position.set(Math.cos(a)*0.55,-0.45-0.1*(k%2),Math.sin(a)*0.55);can.add(m)}
    inner.add(can);g.userData.tree={can,gm,gm2,c1:gm.emissive.clone(),c2:gm2.emissive.clone()};g.userData.flies=makeFlies(glowC,14,0.9,1.2,2.9,g);break}
   // Reactor (Humanos y por defecto)
   inner.add(P(G.hex,MID,1.45,0.32,1.45,0,0.36,0),P(G.hex,tc,1.48,0.05,1.48,0,0.53,0));
   for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4,px=Math.cos(a)*0.62,pz=Math.sin(a)*0.62;inner.add(P(G.box,DARK,0.2,1.25,0.2,px,1.1,pz),P(G.box,tc,0.22,0.08,0.22,px,1.62,pz),P(G.box,MID,0.42,0.1,0.1,px*0.62,0.72,pz*0.62,0,-a,0))}
   inner.add(P(G.cyl,DARK,0.95,0.16,0.95,0,0.62,0),P(TORG,DARK,0.95,0.95,1.6,0,1.88,0,Math.PI/2,0,0));for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;inner.add(P(G.box,MID,0.08,0.08,0.5,Math.cos(a)*0.4,1.9,Math.sin(a)*0.4,0,-a+Math.PI/2,0))}
   const gls=new THREE.MeshLambertMaterial({color:tc,transparent:true,opacity:0.22,depthWrite:false}),glass=new THREE.Mesh(G.cyl,gls);glass.scale.set(0.78,1.1,0.78);glass.position.y=1.24;inner.add(glass);
   const cm=new THREE.MeshBasicMaterial({color:tc}),core=new THREE.Mesh(G.sph,cm);core.scale.setScalar(0.5);core.position.y=1.24;inner.add(core);
   const rm=new THREE.MeshLambertMaterial({color:tc,emissive:tc}),r1=P(TORG,LIGHT,1.25,1.25,1.25,0,1.24,0,Math.PI/2,0,0),r2=P(TORG,rm,1.05,1.05,1.05,0,1.24,0,Math.PI/2.6,0,0);inner.add(r1,r2);
   // halo: brilla con el color del bando mientras extrae; sin mineral se apaga y todo pasa a rojo
   const hm=new THREE.MeshBasicMaterial({color:tc,transparent:true,opacity:0.3,blending:THREE.AdditiveBlending,depthWrite:false}),halo=new THREE.Mesh(G.sph,hm);halo.position.y=1.24;halo.scale.setScalar(1.3);inner.add(halo);
   const lm=new THREE.MeshBasicMaterial({color:tc});for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;inner.add(P(G.box,lm,0.06,0.9,0.02,Math.cos(a)*0.72,1.1,Math.sin(a)*0.72,0,-a+Math.PI/2,0))}
   g.userData.reactor={core,cm,r1,r2,rm,gls,hm,halo,lm,tc:new THREE.Color(tc),st:-1};break}
  case'turret':{const PI2=Math.PI/2;
   inner.add(P(G.hex,MID,1.2,0.5,1.2,0,0.45,0),P(G.cyl,tc,0.92,0.05,0.92,0,0.71,0),P(G.hex,DARK,0.95,0.12,0.95,0,0.77,0));
   const h=new THREE.Group();h.position.y=0.86;
   h.add(P(G.cyl,DARK,0.72,0.14,0.72,0,0.06,0),P(G.box,MID,0.6,0.42,0.72,0,0.34,-0.02),P(G.box,LIGHT,0.54,0.08,0.42,0,0.57,0.04,-0.22,0,0),P(G.box,tc,0.62,0.09,0.06,0,0.36,0.36),P(G.box,DARK,0.5,0.14,0.2,0,0.2,0.36,0.35,0,0));
   h.add(P(G.cyl,DARK,0.13,1.12,0.13,0,0.34,-0.02,0,0,PI2));
   for(const sx of[-1,1]){const x=sx*0.5;h.add(P(G.box,tc,0.3,0.38,0.64,x,0.36,0.0),P(G.box,LIGHT,0.31,0.06,0.5,x,0.57,-0.02),P(G.box,DARK,0.27,0.32,0.05,x,0.36,0.33),P(G.box,DARK,0.06,0.3,0.5,x+sx*0.16,0.36,-0.02));
    for(const[dx,dy]of[[-1,-1],[1,-1],[-1,1],[1,1]])h.add(P(G.cyl,0x0a0d10,0.085,0.05,0.085,x+dx*0.065,0.36+dy*0.075,0.36,PI2,0,0))}
   const brl=new THREE.Group();brl.position.set(0,0.3,0.3);const muz=[];
   for(const bx of[-0.09,0.09]){brl.add(P(G.cyl,LIGHT,0.085,0.72,0.085,bx,0,0.32,PI2,0,0),P(G.cyl,DARK,0.12,0.1,0.12,bx,0,0.08,PI2,0,0),P(G.cyl,DARK,0.115,0.14,0.115,bx,0,0.66,PI2,0,0));const o=new THREE.Object3D();o.position.set(bx,0,0.74);brl.add(o);muz.push(o)}
   h.add(brl);brl.userData.z0=0.3;
   h.add(P(G.box,DARK,0.2,0.13,0.18,0.17,0.62,-0.24),P(G.cyl,0x8ff0ff,0.08,0.03,0.08,0.17,0.62,-0.14,PI2,0,0),P(G.cyl,LIGHT,0.025,0.55,0.025,-0.2,0.82,-0.28,-0.25,0,0.3),P(G.sph,0xff5050,0.05,0.05,0.05,-0.29,1.07,-0.35));
   inner.add(h);g.userData.head=h;g.userData.brl=brl;g.userData.muz=muz;break}
 }
 const hit=new THREE.Mesh(G.hit,HITM);if(type==='hq'){hit.scale.set(4.2,g.userData.rover?3.0:1.8,4.2)}else if(type==='barracks'&&MESHSP!==2)hit.scale.set(3.2,2.2,3.2);else hit.scale.set(1.7,1.8,1.7);hit.position.y=0.9;g.add(hit);g.userData.hit=hit;
 PANELON=false;
 return g;
}
const DELTA=(()=>{const sh=new THREE.Shape();sh.moveTo(0,0.42);sh.lineTo(0.6,-0.22);sh.lineTo(0.18,-0.18);sh.lineTo(0,-0.05);sh.lineTo(-0.18,-0.18);sh.lineTo(-0.6,-0.22);sh.closePath();const g=new THREE.ExtrudeGeometry(sh,{depth:0.035,bevelEnabled:false});g.rotateX(Math.PI/2);g.translate(0,0.02,0);return g})();
const GLASS=new THREE.MeshLambertMaterial({color:0x8fd8ff,emissive:0x0a3a4a,transparent:true,opacity:0.8});
const GLOW=new THREE.MeshBasicMaterial({color:0x8ff0ff});
const GU=(()=>{
 const w=0.44,r=0.07,sh=new THREE.Shape();sh.moveTo(-w+r,-w);sh.lineTo(w-r,-w);sh.quadraticCurveTo(w,-w,w,-w+r);sh.lineTo(w,w-r);sh.quadraticCurveTo(w,w,w-r,w);sh.lineTo(-w+r,w);sh.quadraticCurveTo(-w,w,-w,w-r);sh.lineTo(-w,-w+r);sh.quadraticCurveTo(-w,-w,-w+r,-w);
 const bx=new THREE.ExtrudeGeometry(sh,{depth:0.88,bevelEnabled:true,bevelThickness:0.06,bevelSize:0.06,bevelSegments:2,curveSegments:3});bx.center();bx.computeVertexNormals();
 return Object.assign({},G,{box:bx,cyl:new THREE.CylinderGeometry(0.5,0.5,1,24),sph:new THREE.SphereGeometry(0.5,22,16),cone:new THREE.ConeGeometry(0.5,1,20),oct:new THREE.OctahedronGeometry(0.5,1),hex:new THREE.CylinderGeometry(0.5,0.5,1,6),disc:(()=>{const d=new THREE.CircleGeometry(0.5,32);d.rotateX(-Math.PI/2);return d})()});
})();
const LIMBGEO=new THREE.CylinderGeometry(0.5,0.36,1,12);
function unitMesh(type,tc,sp){if(sp==null)sp=CFG.species||0;
 const G=GU;PANELON=true;
 const g=new THREE.Group(),b=new THREE.Group();g.add(b);
 const figs=[];g.userData.figs=figs;
 const tracks=(w,l,y)=>{const wh=[];for(const s of[-1,1]){b.add(P(G.box,0x15181b,0.16,0.16,l,s*w,y,0));for(let i=0;i<5;i++){const r=P(G.cyl,0x2a2f34,0.13,0.17,0.13,s*w,y,-l/2+0.1+i*(l-0.2)/4,0,0,Math.PI/2);b.add(r);wh.push(r)}for(let i=0;i<9;i++)b.add(P(G.box,0x0e1012,0.17,0.02,0.04,s*w,y+0.085,-l/2+0.05+i*(l-0.1)/8))}g.userData.wheels=wh};
 const walker=(sc,col)=>{const f=new THREE.Group();f.scale.setScalar(sc);
  const limb=(px,py,w,h,c)=>{const gp=new THREE.Group();gp.position.set(px,py,0);gp.add(P(G.box,c,w,h,w*1.3,0,-h/2,0));f.add(gp);return gp};
  const legL=limb(-0.11,0.32,0.09,0.32,DARK),legR=limb(0.11,0.32,0.09,0.32,DARK);
  f.add(P(G.box,col,0.38,0.24,0.3,0,0.44,0),P(G.box,tc,0.39,0.05,0.31,0,0.53,0),P(G.box,0x101418,0.16,0.07,0.04,0,0.48,0.16),P(G.sph,0x7fe8ff,0.06,0.03,0.02,0,0.48,0.18),P(G.box,DARK,0.12,0.12,0.12,-0.1,0.6,-0.08));
  const armL=limb(-0.24,0.52,0.08,0.24,MID),armR=limb(0.24,0.52,0.08,0.24,MID);
  armL.add(P(G.cyl,LIGHT,0.055,0.28,0.055,0,-0.24,0.1,Math.PI/2));armR.add(P(G.cyl,LIGHT,0.055,0.28,0.055,0,-0.24,0.1,Math.PI/2));
  const gun=new THREE.Group();f.add(gun);b.add(f);g.userData.figs=g.userData.figs||[];g.userData.figs.push({f,legL,legR,armL,armR,gun,ph:0,mech:true})};
 const fig=(x,z,kind)=>{const f=new THREE.Group();f.position.set(x,0,z);
  const R=a=>a[Math.floor(Math.random()*a.length)],rn=(lo,hi)=>lo+Math.random()*(hi-lo);
  const AN=kind==='android',CO=kind==='commando',SN=kind==='sniper',FL=kind==='flamer',GR=kind==='gren',RK=kind==='rocket',SP=kind==='spotter';
  const fem=!AN&&Math.random()<0.35,bw=fem?rn(0.9,0.97):rn(0.97,1.1),bh=rn(0.95,1.06),base=AN||CO?1.62:1.46;
  f.scale.set(base*bw,base*bh,base*bw);
  // paletas: uniforme, chaleco, piel
  const UNI=AN?[0xd5dbe1,0xc4cbd2,0xb8c0c8]:CO?[0x23282c,0x1e2226,0x2a2f33]:FL?[0x6b5b40,0x5e5038]:SN?[0x4a5236,0x55583c]:[0x46523d,0x4d5640,0x5a5a44,0x3f4a3a,0x52503c];
  const VEST=AN?[0x8a949e,0x7a848e]:CO?[0x15181b,0x1a1d20]:[0x2f3829,0x3a3f2e,0x50493a,0x343a2c];
  const SKIN=[0xf1c7a1,0xe0b088,0xc68e63,0xa7714a,0x8a5a3a,0x5e3b26];
  const cU=R(UNI),cV=R(VEST),cL=AN?0x9aa4ae:CO?0x1a1d20:R([0x2b3238,0x353b30,0x3a3a2e]),cS=R(SKIN),cB=0x15191d,cG=AN?0x7fe8ff:R([0x2a2f26,0x1d2022,0x3a3328]);
  const sw=fem?0.064:0.072,hw=fem?0.036:0.033; // hombros / caderas
  const limb=(px,py,w,h,c)=>{const gp=new THREE.Group();gp.position.set(px,py,0);const hu=h*0.5,lo=h-hu,kn=new THREE.Group();kn.position.set(0,-hu,0);gp.add(P(LIMBGEO,c,w,hu,w,0,-hu/2,0),kn);kn.add(P(LIMBGEO,c,w*0.9,lo,w*0.9,0,-lo/2,0));gp.userData.kn=kn;gp.userData.L=[hu,lo];f.add(gp);return gp};
  // piernas con rodillera y bota
  const legL=limb(-hw,0.19,0.04,0.185,cL),legR=limb(hw,0.19,0.04,0.185,cL);
  for(const L of[legL,legR])L.userData.kn.add(P(G.sph,cB,0.05,0.04,0.085,0,-0.078,0.012));
  // pelvis, abdomen, pecho (más ancho en hombres), cuello y cabeza
  f.add(P(G.sph,0x1a1d20,fem?0.08:0.078,0.05,0.056,0,0.19,0),P(G.sph,cU,fem?0.07:0.074,0.06,0.058,0,0.228,0),P(G.sph,cU,sw*1.35,0.08,0.066,0,0.28,0));
  if(!AN)f.add(P(G.cyl,cS,0.03,0.03,0.03,0,0.33,0.002));
  const head=new THREE.Group();head.position.set(0,0.362,0.004);f.add(head);
  if(AN){const hv=R([0,1,2]);head.add(P(G.sph,0x2a3138,0.066,0.072,0.066,0,0,0));
   if(hv===0)head.add(P(G.box,0x7fe8ff,0.07,0.018,0.02,0,0.004,0.031));
   else if(hv===1)head.add(P(G.sph,0x7fe8ff,0.026,0.026,0.012,0,0.004,0.032),P(G.cyl,0xd5dbe1,0.008,0.05,0.008,0.026,0.05,0));
   else head.add(P(G.box,0xd5dbe1,0.076,0.03,0.07,0,0.03,0),P(G.box,0x7fe8ff,0.05,0.012,0.02,0,-0.002,0.031));
   head.add(P(G.box,tc,0.068,0.012,0.012,0,0.022,-0.03))}
  else{head.add(P(G.sph,cS,fem?0.05:0.054,0.062,0.056,0,0,0));
   if(!fem&&!FL&&Math.random()<0.3)head.add(P(G.box,R([0x2a2018,0x3b2a1c,0x6a5a48]),0.05,0.022,0.02,0,-0.024,0.024));
   if(fem&&Math.random()<0.6)head.add(P(G.box,R([0x2a2018,0x4a3020,0x8a6a3a]),0.022,0.05,0.02,0,-0.02,-0.034));
   // casco / gorra / boonie / boina / pasamontañas según tipo y azar
   const hg=FL?'mask':SN?'boonie':CO?R(['beret','bala','nvg']):SP?R(['boonie','cap']):GR?R(['helm','helmG']):R(['helm','helm','helmG','cap','boonie']);
   const cH=CO?0x1a1d20:R([cU,cV,0x4a5040]);
   if(hg==='helm'||hg==='helmG'||hg==='nvg'){head.add(P(G.sph,cH,0.078,0.06,0.082,0,0.018,-0.002),P(G.cyl,tc,0.079,0.01,0.083,0,0.008,-0.002));
    if(hg==='helmG')head.add(P(G.box,0x101418,0.06,0.016,0.014,0,0.03,0.036),P(G.box,0x8fd8ff,0.022,0.012,0.006,-0.014,0.03,0.044),P(G.box,0x8fd8ff,0.022,0.012,0.006,0.014,0.03,0.044));
    if(hg==='nvg')head.add(P(G.cyl,0x101418,0.016,0.03,0.016,-0.01,0.03,0.045,Math.PI/2),P(G.cyl,0x101418,0.016,0.03,0.016,0.01,0.03,0.045,Math.PI/2),P(G.sph,0x7fff9a,0.01,0.01,0.004,-0.01,0.03,0.061),P(G.sph,0x7fff9a,0.01,0.01,0.004,0.01,0.03,0.061))}
   else if(hg==='cap')head.add(P(G.sph,cH,0.07,0.04,0.072,0,0.022,0),P(G.box,cH,0.05,0.008,0.035,0,0.022,0.045),P(G.box,tc,0.03,0.014,0.004,0,0.034,0.034));
   else if(hg==='boonie')head.add(P(G.cyl,cH,0.11,0.006,0.11,0,0.022,0),P(G.cyl,cH,0.066,0.032,0.066,0,0.036,0),P(G.cyl,tc,0.068,0.008,0.068,0,0.028,0));
   else if(hg==='beret')head.add(P(G.sph,0x2a2f33,0.074,0.026,0.072,0.006,0.03,0,0,0,-0.25),P(G.box,tc,0.012,0.014,0.004,-0.024,0.03,0.034));
   else if(hg==='bala')head.add(P(G.sph,0x15181b,0.07,0.076,0.072,0,0.001,0),P(G.box,cS,0.046,0.014,0.01,0,0.008,0.035));
   else if(hg==='mask')head.add(P(G.sph,0x2a2f33,0.068,0.074,0.07,0,0,0),P(G.sph,0x8fd8ff,0.022,0.018,0.01,-0.014,0.01,0.032),P(G.sph,0x8fd8ff,0.022,0.018,0.01,0.014,0.01,0.032),P(G.cyl,0x3a3f44,0.026,0.026,0.026,0,-0.022,0.038,Math.PI/2),P(G.sph,cH,0.078,0.05,0.08,0,0.026,-0.004));
   if(!CO&&!FL&&hg!=='helmG'&&Math.random()<0.15)head.add(P(G.box,0x101418,0.05,0.012,0.008,0,0.006,0.033))}
  // chaleco táctico con cargadores, brazalete del bando
  if(!AN){f.add(P(G.sph,cV,sw*1.4,0.09,0.074,0,0.272,0));
   const np=GR?4:R([2,3]);for(let k=0;k<np;k++)f.add(P(G.box,cV,0.022,0.03,0.016,(k-(np-1)/2)*0.026,0.245,0.046));
   if(GR)f.add(P(G.box,0x3a3328,0.02,0.15,0.012,0,0.27,0.048,0,0,0.75));
   if(Math.random()<0.5)f.add(P(G.box,0x1d2022,0.018,0.03,0.024,-0.05,0.19,0.036))}
  else f.add(P(G.box,0x7fe8ff,0.03,0.03,0.006,0,0.29,0.038),P(G.box,tc,sw*1.6,0.02,0.074,0,0.255,0));
  // espalda: mochila, radio, estanques o cohetes
  const back=FL?'tanks':RK?'rockets':SP?'radio':AN?'core':R(['none','pack','pack','ruck','radio']);
  if(back==='pack')f.add(P(G.box,R([cV,0x3a3f2e]),0.08,0.09,0.04,0,0.265,-0.056));
  else if(back==='ruck')f.add(P(G.box,0x3a3f2e,0.09,0.12,0.05,0,0.27,-0.06),P(G.cyl,0x50493a,0.03,0.09,0.03,0,0.34,-0.062,0,0,Math.PI/2));
  else if(back==='radio')f.add(P(G.box,0x2a2f33,0.075,0.09,0.04,0,0.265,-0.056),P(G.cyl,0x101418,0.004,0.16,0.004,0.028,0.37,-0.06));
  else if(back==='tanks')f.add(P(G.cyl,0x8a3a2a,0.042,0.15,0.042,-0.025,0.27,-0.058),P(G.cyl,0x8a3a2a,0.042,0.15,0.042,0.025,0.27,-0.058),P(G.cyl,0x2a2f33,0.008,0.08,0.008,0.04,0.21,-0.02,0.9));
  else if(back==='rockets')f.add(P(G.box,0x3a3f2e,0.07,0.08,0.035,0,0.255,-0.056),P(G.cone,LIGHT,0.024,0.08,0.024,-0.02,0.33,-0.06),P(G.cone,LIGHT,0.024,0.08,0.024,0.02,0.33,-0.06));
  else if(back==='core')f.add(P(G.box,0x8a949e,0.08,0.09,0.04,0,0.27,-0.05),P(G.cyl,0x7fe8ff,0.02,0.012,0.02,0,0.27,-0.072,Math.PI/2));
  if(SN)for(let k=0;k<6;k++)f.add(P(G.oct,R([0x4a5236,0x5c5a3a,0x3a4228]),0.05,0.04,0.05,rn(-0.06,0.06),rn(0.25,0.33),rn(-0.06,-0.02)));
  // brazos con hombrera, brazalete del bando y guante
  const armL=limb(-sw,0.315,0.03,0.15,cU),armR=limb(sw,0.315,0.03,0.15,cU);
  for(const A of[armL,armR]){A.add(P(G.sph,AN?0x8a949e:cV,0.046,0.04,0.046,0,-0.004,0),P(G.box,tc,0.036,0.016,0.036,0,-0.035,0));A.userData.kn.add(P(G.sph,AN?0x7fe8ff:cG,0.028,0.028,0.028,0,-0.075,0.004))}
  // armas
  const gun=new THREE.Group();gun.position.set(0.04,0.235,0.065);f.add(gun);
  if(kind==='rocket')gun.add(P(G.cyl,LIGHT,0.048,0.32,0.048,0.03,0.1,-0.02,Math.PI/2),P(G.box,0x2a2f33,0.03,0.04,0.05,0.03,0.08,0.02),P(G.cone,0x6a7178,0.05,0.06,0.05,0.03,0.1,0.15,Math.PI/2));
  else if(SN)gun.add(P(G.box,0x1a1f24,0.022,0.024,0.36,0,0,0.08),P(G.cyl,LIGHT,0.02,0.07,0.02,0,0.027,0.04,Math.PI/2),P(G.box,0x3a3328,0.024,0.04,0.08,0,-0.012,-0.08),P(G.box,0x101418,0.006,0.04,0.006,-0.012,-0.02,0.2,0.4),P(G.box,0x101418,0.006,0.04,0.006,0.012,-0.02,0.2,0.4));
  else if(FL)gun.add(P(G.cyl,0x2a2f33,0.03,0.22,0.03,0,0,0.08,Math.PI/2),P(G.cyl,0x5a6470,0.04,0.04,0.04,0,0,0.19,Math.PI/2),P(G.sph,0xff8a3a,0.03,0.03,0.03,0,0,0.215));
  else if(AN)gun.add(P(G.box,0xe8eef2,0.03,0.036,0.2,0,0,0.06),P(G.sph,0x7fe8ff,0.025,0.025,0.025,0,0,0.17));
  else if(GR)gun.add(P(G.cyl,0x4a5a3a,0.05,0.16,0.05,0,0,0.05,Math.PI/2),P(G.box,0x1a1f24,0.024,0.03,0.06,0,-0.02,-0.04));
  else{const lmg=!SP&&!CO&&Math.random()<0.2;
   gun.add(P(G.box,0x1a1f24,0.022,0.03,lmg?0.24:0.2,0,0,0.05),P(G.box,0x1a1f24,0.016,0.04,0.02,0,-0.028,0.06),P(G.box,0x2a2f33,0.018,0.026,0.06,0,-0.004,-0.07));
   if(lmg)gun.add(P(G.box,0x2a2f33,0.03,0.035,0.04,-0.02,-0.02,0.05));
   if(Math.random()<0.5)gun.add(P(G.box,0x101418,0.012,0.014,0.04,0,0.022,0.04))}
  {const up=new THREE.Group();up.position.y=0.19;f.userData.up=up;for(const c of[...f.children]){if(c.position.y>0.2&&c!==legL&&c!==legR){f.remove(c);c.position.y-=0.19;up.add(c)}}f.add(up)}
  b.add(f);figs.push({f,legL,legR,armL,armR,gun,kind,ph:Math.random()*6})};
 if(sp===2&&MICM[type])MICM[type](b,g,tc,figs);else switch(type){
  case'rifle':[[-0.25,0.18],[0.25,0.18],[0,0.03],[-0.25,-0.16],[0.25,-0.16]].forEach(([x,z])=>fig(x+(Math.random()-0.5)*0.04,z+(Math.random()-0.5)*0.04));break;
  case'rocket':[[-0.23,0.12],[0.23,0.12],[0,-0.18]].forEach(([x,z])=>fig(x,z,'rocket'));break;
  case'buggy':{b.add(P(G.box,DARK,0.42,0.1,0.74,0,0.2,0),P(G.box,tc,0.36,0.06,0.3,0,0.27,0.22),P(G.box,0x15191d,0.2,0.1,0.14,0,0.28,0.02));
   for(const x of[-0.17,0.17]){b.add(P(G.box,LIGHT,0.025,0.25,0.025,x,0.38,0.08),P(G.box,LIGHT,0.025,0.025,0.42,x,0.5,-0.08),P(G.box,LIGHT,0.025,0.25,0.025,x,0.38,-0.27))}b.add(P(G.box,LIGHT,0.36,0.025,0.025,0,0.5,0.12));
   const wh=[];for(const[x,z]of[[-.28,.26],[.28,.26],[-.28,-.25],[.28,-.25]]){const w=P(G.cyl,0x15191d,0.24,0.12,0.24,x,0.13,z,0,0,Math.PI/2);w.add(P(G.cyl,0x5a6470,0.5,1.05,0.5,0,0,0));b.add(w);wh.push(w)}g.userData.wheels=wh;
   const h=new THREE.Group();h.position.set(0,0.53,-0.12);h.add(P(G.cyl,MID,0.14,0.06,0.14,0,0,0),P(G.box,LIGHT,0.035,0.035,0.34,0,0.04,0.16),P(G.box,DARK,0.1,0.07,0.1,0,0.05,-0.02));b.add(h);g.userData.head=h;g.userData.bob=1;break}
  case'tank':{tracks(0.3,0.92,0.1);b.add(P(G.box,DARK,0.48,0.14,0.86,0,0.24,-0.02),P(G.box,DARK,0.48,0.08,0.22,0,0.26,0.43,-0.45),P(G.box,tc,0.5,0.03,0.5,0,0.32,-0.12),P(G.box,0x101418,0.12,0.05,0.04,-0.14,0.27,0.42));
   const h=new THREE.Group();h.position.set(0,0.38,-0.05);h.add(P(G.cyl,MID,0.38,0.12,0.42,0,0,0),P(G.box,tc,0.3,0.1,0.32,0,0.08,-0.04),P(G.box,DARK,0.1,0.06,0.1,0.1,0.15,-0.08),P(G.cyl,LIGHT,0.016,0.4,0.016,-0.13,0.3,-0.16));
   const bar=new THREE.Group();bar.position.set(0,0.03,0.18);bar.add(P(G.cyl,LIGHT,0.065,0.62,0.065,0,0,0.3,Math.PI/2),P(G.cyl,DARK,0.095,0.1,0.095,0,0,0.6,Math.PI/2));h.add(bar);b.add(h);g.userData.head=h;g.userData.bob=1;break}
  case'aa':{tracks(0.28,0.8,0.1);b.add(P(G.box,DARK,0.44,0.16,0.76,0,0.25,0),P(G.box,tc,0.46,0.03,0.4,0,0.34,-0.1));
   const h=new THREE.Group();h.position.y=0.4;h.add(P(G.cyl,tc,0.34,0.12,0.34,0,0,0),P(G.box,MID,0.3,0.14,0.24,0,0.1,-0.02));
   for(const x of[-0.11,0.11]){const br=P(G.box,LIGHT,0.045,0.045,0.55,x,0.2,0.18,-0.65);h.add(br)}
   const rd=new THREE.Group();rd.position.set(0,0.25,-0.16);rd.add(P(G.cyl,DARK,0.03,0.12,0.03,0,0,0),P(G.box,LIGHT,0.28,0.12,0.02,0,0.1,0));h.add(rd);g.userData.radar=rd;b.add(h);g.userData.head=h;g.userData.bob=1;break}
  case'sniper':fig(-0.14,0.06,'sniper');fig(0.16,-0.07,'spotter');break;
  case'grenadier':[[-0.23,0.16],[0.23,0.16],[-0.23,-0.16],[0.23,-0.16]].forEach(([x,z])=>fig(x,z,'gren'));break;
  case'artillery':{tracks(0.3,0.9,0.1);b.add(P(G.box,DARK,0.5,0.18,0.84,0,0.25,0),P(G.box,tc,0.52,0.03,0.3,0,0.35,-0.25));
   const h=new THREE.Group();h.position.set(0,0.42,-0.1);h.add(P(G.box,tc,0.44,0.2,0.5,0,0,-0.05),P(G.box,MID,0.38,0.06,0.44,0,0.12,-0.05));
   const bar=new THREE.Group();bar.position.set(0,0.06,0.2);bar.rotation.x=-0.45;bar.add(P(G.cyl,LIGHT,0.07,1.05,0.07,0,0,0.5,Math.PI/2),P(G.cyl,DARK,0.1,0.12,0.1,0,0,1.0,Math.PI/2),P(G.box,DARK,0.12,0.12,0.2,0,0,0.05));h.add(bar);b.add(h);g.userData.head=h;g.userData.bob=1;break}
  case'heli':{b.add(P(G.sph,tc,0.4,0.32,0.62,0,0,0.05),P(G.sph,GLASS,0.3,0.22,0.3,0,0.06,0.28),P(G.box,DARK,0.08,0.08,0.7,0,0.04,-0.55),P(G.box,tc,0.03,0.22,0.14,0,0.12,-0.86),P(G.box,DARK,0.24,0.03,0.08,0,0.04,-0.82),
   P(G.box,LIGHT,0.03,0.03,0.6,-0.2,-0.2,0.05),P(G.box,LIGHT,0.03,0.03,0.6,0.2,-0.2,0.05),P(G.box,LIGHT,0.02,0.12,0.02,-0.2,-0.14,0.18),P(G.box,LIGHT,0.02,0.12,0.02,0.2,-0.14,0.18),P(G.box,MID,0.6,0.05,0.1,0,-0.04,0.05),P(G.cyl,DARK,0.06,0.18,0.06,-0.3,-0.08,0.1,Math.PI/2),P(G.cyl,DARK,0.06,0.18,0.06,0.3,-0.08,0.1,Math.PI/2));
   const r=new THREE.Group();r.position.y=0.24;r.add(P(G.cyl,DARK,0.06,0.08,0.06,0,-0.04,0),P(G.box,LIGHT,1.5,0.015,0.07,0,0,0),P(G.box,LIGHT,0.07,0.015,1.5,0,0,0));b.add(r);g.userData.rotor=r;
   const tr=new THREE.Group();tr.position.set(0.04,0.13,-0.86);tr.add(P(G.box,LIGHT,0.01,0.3,0.04,0,0,0));b.add(tr);g.userData.tail=tr;break}
  case'fighter':{const fu=P(G.cyl,DARK,0.14,0.85,0.14,0,0,-0.02,Math.PI/2);b.add(fu,P(G.cone,tc,0.14,0.32,0.14,0,0,0.56,Math.PI/2),P(G.sph,GLASS,0.1,0.07,0.2,0,0.07,0.22),new THREE.Mesh(DELTA,M(tc)),
   P(G.box,DARK,0.03,0.2,0.16,-0.09,0.11,-0.36,0,0,-0.25),P(G.box,DARK,0.03,0.2,0.16,0.09,0.11,-0.36,0,0,0.25),P(G.box,0x101418,0.08,0.06,0.16,-0.12,-0.02,0.08),P(G.box,0x101418,0.08,0.06,0.16,0.12,-0.02,0.08));
   const fl=P(G.cone,GLOW,0.1,0.28,0.1,0,0,-0.55,-Math.PI/2);b.add(fl);g.userData.flame=fl;break}
  case'bomber':{b.add(P(G.box,DARK,0.4,0.3,1.0,0,0,-0.05),P(G.box,DARK,0.34,0.22,0.3,0,-0.02,0.55,0.25),P(G.box,GLASS,0.3,0.12,0.2,0,0.1,0.55,0.4),P(G.box,tc,0.42,0.04,0.7,0,0.16,-0.1),
   P(G.box,0x101418,0.32,0.02,0.4,0,-0.15,-0.2),P(G.box,MID,0.9,0.05,0.22,0,0.06,0.15),P(G.box,MID,0.8,0.05,0.2,0,0.06,-0.45),P(G.box,DARK,0.03,0.24,0.2,-0.17,0.22,-0.48,0,0,-0.3),P(G.box,DARK,0.03,0.24,0.2,0.17,0.22,-0.48,0,0,0.3));
   const pods=[];for(const[x,z]of[[-0.5,0.15],[0.5,0.15],[-0.45,-0.45],[0.45,-0.45]]){const pd=new THREE.Group();pd.position.set(x,0.06,z);
    pd.add(P(G.cyl,MID,0.26,0.14,0.26,0,0,0),P(G.cyl,0x101418,0.22,0.15,0.22,0,0,0));const fan=new THREE.Group();fan.add(P(G.box,LIGHT,0.2,0.01,0.03,0,0,0),P(G.box,LIGHT,0.03,0.01,0.2,0,0,0));pd.add(fan,P(G.cyl,GLOW,0.18,0.02,0.18,0,-0.08,0));b.add(pd);pods.push({pd,fan})}
   g.userData.pods=pods;break}
  case'flamer':[[-0.23,0.12],[0.23,0.12],[0,-0.18]].forEach(([x,z])=>fig(x,z,'flamer'));break;
  case'commando':[[-0.17,0.06],[0.17,-0.06]].forEach(([x,z])=>fig(x,z,'commando'));break;
  case'android':[[-0.24,0.12],[0.24,0.12],[0,-0.19]].forEach(([x,z])=>fig(x,z,'android'));break;
  case'apc':{b.add(P(G.box,DARK,0.58,0.26,1.0,0,0.27,0),P(G.box,tc,0.6,0.05,0.5,0,0.41,-0.1),P(G.box,0x101418,0.4,0.08,0.04,0,0.33,0.5));const wh=[];for(const z of[-0.34,0,0.34])for(const x of[-0.31,0.31]){const w=P(G.cyl,0x15191d,0.22,0.1,0.22,x,0.13,z,0,0,Math.PI/2);b.add(w);wh.push(w)}g.userData.wheels=wh;const h=new THREE.Group();h.position.set(0,0.45,0.1);h.add(P(G.cyl,MID,0.2,0.08,0.2,0,0,0),P(G.box,LIGHT,0.04,0.04,0.3,0,0.02,0.15));b.add(h);g.userData.head=h;break}
  case'mlrs':{b.add(P(G.box,0x1a1f24,0.62,0.14,0.9,0,0.09,0),P(G.box,DARK,0.56,0.2,0.84,0,0.24,0));const h=new THREE.Group();h.position.set(0,0.38,-0.05);const pod=new THREE.Group();pod.rotation.x=-0.5;pod.add(P(G.box,tc,0.44,0.26,0.5,0,0.1,0));for(let i=0;i<6;i++)pod.add(P(G.cyl,0x101418,0.07,0.04,0.07,-0.13+(i%3)*0.13,(i<3?0.04:0.16),0.26,Math.PI/2));h.add(pod);b.add(h);g.userData.head=h;break}
  case'gunship':{b.add(P(G.box,DARK,0.46,0.3,1.05,0,0,0),P(G.sph,tc,0.44,0.3,0.4,0,0.02,0.48),P(G.box,tc,0.48,0.05,0.6,0,0.17,-0.1),P(G.box,MID,1.0,0.06,0.18,0,-0.05,0.05),P(G.cyl,LIGHT,0.06,0.3,0.06,-0.48,-0.1,0.15,Math.PI/2),P(G.cyl,LIGHT,0.06,0.3,0.06,0.48,-0.1,0.15,Math.PI/2),P(G.box,DARK,0.05,0.25,0.25,0,0.12,-0.62));const r=new THREE.Group();r.position.y=0.24;r.add(P(G.box,LIGHT,1.9,0.02,0.07,0,0,0),P(G.box,LIGHT,0.07,0.02,1.9,0,0,0));b.add(r);g.userData.rotor=r;break}
  case'scout':b.add(P(G.cone,tc,0.16,0.8,0.14,0,0,0.05,Math.PI/2),P(G.box,DARK,1.1,0.02,0.16,0,0,-0.05),P(G.box,DARK,0.3,0.02,0.1,0,0,-0.35),P(G.box,DARK,0.02,0.16,0.12,0,0.08,-0.36),P(G.sph,0x7fe8ff,0.06,0.04,0.12,0,0.05,0.2));break;
  case'spider':{b.add(P(G.sph,DARK,0.36,0.16,0.42,0,0.28,0),P(G.sph,tc,0.24,0.09,0.28,0,0.35,-0.02),P(G.box,0x101418,0.14,0.06,0.05,0,0.3,0.2),P(G.sph,0xff4040,0.04,0.04,0.03,-0.04,0.31,0.22),P(G.sph,0xff4040,0.04,0.04,0.03,0.04,0.31,0.22));
   const legs=[];for(let i=0;i<6;i++){const s=i<3?-1:1,z=(i%3-1)*0.15;const l=new THREE.Group();l.position.set(s*0.14,0.28,z);l.rotation.y=s*Math.PI/2+(i%3-1)*0.5*s;l.add(P(G.box,MID,0.03,0.03,0.24,0,0.06,0.11,-0.5),P(G.box,LIGHT,0.025,0.26,0.025,0,-0.05,0.23));b.add(l);legs.push(l)}g.userData.sleg=legs;break}
  case'mech':walker(1,MID);break;
  case'titan':{const T=new THREE.Group();T.scale.setScalar(1.7);b.add(T);const HC=0x6a737c,AR=0x56616c;
   const up=new THREE.Group();up.position.y=0.62;T.add(up);
   up.add(P(G.box,HC,0.5,0.3,0.46,0,0,0),P(G.box,AR,0.42,0.12,0.2,0,0.16,-0.08),P(G.box,tc,0.52,0.045,0.48,0,0.08,0),
    P(G.box,DARK,0.3,0.1,0.07,0,0.03,0.24),P(G.box,GLOW,0.22,0.025,0.02,0,0.04,0.278),P(G.box,AR,0.36,0.08,0.1,0,-0.12,0.2,0.4),
    P(G.cyl,DARK,0.2,0.14,0.2,0,0.02,-0.27,Math.PI/2),P(G.cyl,GLOW,0.14,0.02,0.14,0,0.02,-0.345,Math.PI/2),P(G.box,DARK,0.04,0.16,0.04,-0.18,0.26,-0.15),P(G.sph,0xff4040,0.03,0.03,0.03,-0.18,0.35,-0.15));
   const lids=[],gats=[];
   for(const sd of[-1,1]){
    up.add(P(G.sph,MID,0.17,0.17,0.17,sd*0.32,0.06,0));
    up.add(P(G.box,AR,0.22,0.12,0.32,sd*0.38,0.2,0),P(G.box,tc,0.225,0.03,0.1,sd*0.38,0.26,0.1));
    up.add(P(G.box,DARK,0.1,0.06,0.14,sd*0.38,0.29,-0.02));
    const pod=new THREE.Group();pod.position.set(sd*0.38,0.39,0);up.add(pod);
    pod.add(P(G.box,HC,0.2,0.15,0.28,0,0,0),P(G.box,tc,0.205,0.035,0.1,0,0.06,-0.08),P(G.box,0x101418,0.17,0.12,0.02,0,0,0.141));
    for(let i=0;i<6;i++){const x=(i%3-1)*0.055,y=(i<3?0.03:-0.03);pod.add(P(G.cyl,0x0b0d10,0.04,0.02,0.04,x,y,0.148,Math.PI/2),P(G.sph,0xd23a2a,0.022,0.022,0.015,x,y,0.15))}
    const lid=new THREE.Group();lid.position.set(0,0.075,0.14);lid.add(P(G.box,AR,0.19,0.012,0.08,0,0,-0.04));pod.add(lid);lids.push(lid);
    const arm=new THREE.Group();arm.position.set(sd*0.42,0.02,0);up.add(arm);
    arm.add(P(G.box,DARK,0.1,0.2,0.11,0,-0.1,0),P(G.sph,MID,0.1,0.1,0.1,0,-0.21,0),P(G.box,AR,0.13,0.11,0.24,0,-0.26,0.08),P(G.box,tc,0.135,0.025,0.1,0,-0.2,0.1));
    const gh=P(G.cyl,MID,0.1,0.1,0.1,0,-0.26,0.24,Math.PI/2);arm.add(gh);
    const sp=new THREE.Group();sp.position.set(0,-0.26,0.3);for(let k=0;k<6;k++){const an=k*Math.PI/3;sp.add(P(G.cyl,DARK,0.018,0.22,0.018,Math.cos(an)*0.03,Math.sin(an)*0.03,0.1,Math.PI/2))}sp.add(P(G.cyl,LIGHT,0.08,0.02,0.08,0,0,0.19,Math.PI/2));arm.add(sp);gats.push(sp)}
   const legs=[];for(const sd of[-1,1]){const hip=new THREE.Group();hip.position.set(sd*0.21,0.5,0);T.add(hip);
    hip.add(P(G.sph,MID,0.16,0.16,0.16,0,0,0),P(G.box,DARK,0.16,0.31,0.18,0,-0.12,-0.06,0.5),P(G.box,AR,0.17,0.12,0.06,0,-0.1,0.03,0.5));
    const knee=new THREE.Group();knee.position.set(0,-0.26,-0.13);hip.add(knee);knee.add(P(G.sph,MID,0.14,0.14,0.14,0,0,0),P(G.box,HC,0.15,0.34,0.15,0,-0.14,0.07,-0.45),P(G.box,tc,0.155,0.04,0.155,0,-0.08,0.04,-0.45),P(G.box,DARK,0.06,0.2,0.05,0,-0.12,0.15,-0.45));
    const foot=new THREE.Group();foot.position.set(0,-0.29,0.14);knee.add(foot);foot.add(P(G.box,DARK,0.24,0.06,0.3,0,-0.02,0.03),P(G.box,DARK,0.07,0.05,0.12,-0.08,-0.025,0.21),P(G.box,DARK,0.07,0.05,0.12,0.08,-0.025,0.21),P(G.box,DARK,0.09,0.05,0.09,0,-0.025,-0.15));
    legs.push({hip,knee,sd})}
   T.position.y=0.2;g.userData.head=up;g.userData.tleg=legs;g.userData.thull=up;g.userData.gat=gats;g.userData.lids=lids;break}
  case'sentinel':{for(let i=0;i<3;i++){const a=i*2.09;b.add(P(G.box,DARK,0.04,0.42,0.04,Math.sin(a)*0.18,0.18,Math.cos(a)*0.18,Math.cos(a)*0.35,0,-Math.sin(a)*0.35))}b.add(P(G.cyl,MID,0.24,0.18,0.24,0,0.4,0),P(G.cyl,tc,0.25,0.04,0.25,0,0.33,0));const h=new THREE.Group();h.position.y=0.55;h.add(P(G.sph,LIGHT,0.24,0.2,0.24,0,0,0),P(G.box,DARK,0.05,0.05,0.5,0,0.02,0.25),P(G.sph,0x7fe8ff,0.06,0.06,0.06,0,0.02,0.5));b.add(h);g.userData.head=h;break}
  case'swarm':{const sw=new THREE.Group();for(let i=0;i<5;i++){const a=i*1.256,d=P(G.oct,i%2?tc:LIGHT,0.16,0.08,0.2,Math.sin(a)*0.28,(i%2)*0.1,Math.cos(a)*0.28);sw.add(d)}b.add(sw);g.userData.swarm=sw;break}
  case'drone':{b.add(P(G.box,DARK,0.22,0.08,0.32,0,0,0),P(G.box,tc,0.18,0.05,0.2,0,0.06,0.02),P(G.sph,0x101418,0.07,0.06,0.07,0,-0.06,0.12),P(G.sph,0xff4040,0.03,0.03,0.03,0,-0.06,0.17));
   const pr=[];for(const[x,z]of[[-.3,.28],[.3,.28],[-.3,-.28],[.3,-.28]]){b.add(P(G.box,DARK,Math.abs(x)*1.2,0.025,0.035,x/2,0.01,z/2,0,Math.atan2(x,z)+Math.PI/2),P(G.cyl,MID,0.12,0.06,0.12,x,0.03,z));const r=new THREE.Group();r.position.set(x,0.07,z);r.add(P(G.box,LIGHT,0.36,0.01,0.04,0,0,0),P(G.box,LIGHT,0.04,0.01,0.36,0,0,0));b.add(r);pr.push(r)}g.userData.props=pr;break}
 }
 {const big={titan:1.7,mech:1.25,tank:1.15,artillery:1.1,apc:1.15,mlrs:1.1,sentinel:1.05}[type]||1,air=UD[type]&&UD[type].cls==='air';
  const tg=new THREE.Group();tg.position.y=air?-1.0:0.025;tg.scale.setScalar(big);
  const sh=new THREE.Mesh(SHDG,SHDM);sh.position.y=-0.004;sh.scale.setScalar(air?0.8:1);const hf=new THREE.Mesh(TDF,teamMat(tc,0.16)),hr=new THREE.Mesh(TDR,teamMat(tc,air?0.5:0.85));tg.add(sh,hf,hr);g.add(tg);g.userData.td=tg}
 const ring=new THREE.Mesh(G.ring,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.9}));ring.position.y=0.03;ring.visible=false;g.add(ring);g.userData.ring=ring;
 const hit=new THREE.Mesh(G.hit,HITM);hit.scale.set(1.3,1.3,1.3);hit.position.y=0.5;g.add(hit);g.userData.hit=hit;
 PANELON=false;
 return g;
}
function makeBar(tc){
 const g=new THREE.Group();
 const bg=new THREE.Mesh(G.plane,new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.65,depthTest:false}));
 const fg=new THREE.Mesh(G.plane,new THREE.MeshBasicMaterial({color:tc,depthTest:false}));
 bg.renderOrder=20;fg.renderOrder=21;fg.position.z=0.001;g.add(bg,fg);scene.add(g);return{g,fg};
}

