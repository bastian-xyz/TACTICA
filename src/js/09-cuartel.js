// ================= CUARTEL HUMANO (diseño aprobado en el atlas) =================
function bunkerTex(base,seed){const N=256,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d');let r=seed||7;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;
 x.fillStyle=base;x.fillRect(0,0,N,N);const im=x.getImageData(0,0,N,N),d=im.data;for(let i=0;i<d.length;i+=4){const n=(rnd()-0.5)*26;d[i]+=n;d[i+1]+=n;d[i+2]+=n}x.putImageData(im,0,0);
 for(let k=0;k<26;k++){const cx=rnd()*N,cy=rnd()*N,rr=15+rnd()*55,g=x.createRadialGradient(cx,cy,0,cx,cy,rr),dk=rnd()<0.6;g.addColorStop(0,dk?'rgba(20,22,24,0.18)':'rgba(255,255,255,0.08)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(cx-rr,cy-rr,rr*2,rr*2)}
 for(let y=0;y<N;y+=32){x.fillStyle='rgba(0,0,0,0.28)';x.fillRect(0,y,N,1.5);x.fillStyle='rgba(255,255,255,0.07)';x.fillRect(0,y+2,N,1);for(let k=0;k<6;k++){x.fillStyle='rgba(0,0,0,0.08)';x.fillRect(0,y+4+rnd()*26,N,1)}}
 for(let X=0;X<N;X+=128){x.fillStyle='rgba(0,0,0,0.3)';x.fillRect(X,0,1.5,N)}
 for(let y=16;y<N;y+=64)for(let X=32;X<N;X+=64){x.fillStyle='rgba(10,10,12,0.75)';x.beginPath();x.arc(X,y,2.6,0,6.3);x.fill()}
 for(let k=0;k<14;k++){const X=rnd()*N,w=2+rnd()*6,L=40+rnd()*150,g=x.createLinearGradient(0,0,0,L);g.addColorStop(0,'rgba(15,16,18,0.32)');g.addColorStop(1,'rgba(15,16,18,0)');x.fillStyle=g;x.fillRect(X,rnd()*40,w,L)}
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,1);return t}
let CQBASE=null;const CQTC={};
function CQMAT(tc){if(!CQBASE){const L=(c,tx)=>rimify(new THREE.MeshLambertMaterial({color:c,map:tx}));CQBASE={wall:L(0x9aa0a6,bunkerTex('#7a8085',11)),dark:L(0x868c92,bunkerTex('#565b60',23)),slab:L(0x969ca2,bunkerTex('#44494e',37)),light:M(0x8a96a2),stripe:new THREE.MeshLambertMaterial({color:0x3a2a10,emissive:0xffa030})}}
 if(!CQTC[tc])CQTC[tc]=new THREE.MeshLambertMaterial({color:new THREE.Color(tc).multiplyScalar(0.5),emissive:new THREE.Color(tc).multiplyScalar(0.9)});return Object.assign({tc:CQTC[tc]},CQBASE)}
const T={A:[-0.866,-0.5],C:[0.866,-0.5],B:[0,1]};const __L=()=>{};
const box=(w,h,d)=>new THREE.BoxGeometry(w,h,d),hexF=(rt,rb,h)=>new THREE.CylinderGeometry(rt,rb,h,6);
function mesh(g,m,p,par){const o=new THREE.Mesh(g,m);o.castShadow=o.receiveShadow=true;if(p)o.position.set(...p);par.add(o);return o}
function cuartelModel(lv,tcol){const MAT=CQMAT(tcol);const g=new THREE.Group();__L('01_Explanada');
 // explanada siguiendo las 3 casillas
 const ph=lv===3?0.2:lv===2?0.15:0.1;
 for(const k in T){const[x,z]=T[k];mesh(hexF(1.0,1.06,ph),lv===1?MAT.dark:MAT.slab,[x,ph/2,z],g);
  if(lv===3)mesh(hexF(1.07,1.07,0.03),MAT.stripe,[x,0.015,z],g)}
 __L('02_Rampa'); // rampa al frente
 {const r=mesh(box(0.7,0.04,0.5),MAT.dark,[0.5*1.08,ph*0.5,1+0.866*1.08],g);r.rotation.order='YXZ';r.rotation.set(0.18,Math.PI/6,0)}
 if(lv>=2)for(let i=-2;i<=2;i++){const o=mesh(box(0.12,0.02,0.04),MAT.stripe,[0.43+i*0.28*0.866,ph+0.005,1.745-i*0.28*0.5],g);o.rotation.y=Math.PI/6}
 const y0=ph,rot=0;
 const vol=(k,rb,rt,h,m)=>{const[x,z]=T[k];const o=mesh(hexF(rt,rb,h),m,[x,y0+h/2,z],g);o.rotation.y=rot;return o};
 const slab=(k,r,y,th)=>{const[x,z]=T[k];const o=mesh(hexF(r*0.95,r,th),MAT.slab,[x,y+th/2,z],g);o.rotation.y=rot;return o};
 __L('03_A_Mando'); // A mando
 const hA=lv===3?1.6:lv===2?1.25:1.0;vol('A',0.95,0.84,hA,MAT.wall);slab('A',0.95,y0+hA,0.12);
 if(lv>=2)for(let i=0;i<4;i++){const o=mesh(box(0.42,0.035,0.03),MAT.dark,[T.A[0]+0.37,y0+hA-0.25-i*0.09,T.A[1]+0.64],g);o.rotation.y=Math.PI/6}
 __L('04_C_Ala'); // C ala con cubierta inclinada
 const hC=lv===3?0.75:lv===2?0.65:0.55;vol('C',0.72,0.66,hC,MAT.wall);
 {const o=mesh(box(1.2,0.1,0.92),MAT.slab,[T.C[0]+0.05,y0+hC+0.14,T.C[1]-0.05],g);o.rotation.z=-0.22;
  __L('05_C_Paneles_Solares');const sp=new THREE.Group();sp.position.copy(o.position);sp.rotation.z=-0.22;g.add(sp);
  const pm=new THREE.MeshStandardMaterial({color:0x123a66,emissive:0x061830,roughness:0.25,metalness:0.7,flatShading:true});
  for(let i=0;i<3;i++)for(let j=0;j<3;j++){const px=-0.37+i*0.37,pz=-0.28+j*0.28;mesh(box(0.34,0.02,0.25),pm,[px,0.06,pz],sp);
   for(const q of[-0.055,0.055])mesh(box(0.34,0.024,0.006),MAT.light,[px,0.06,pz+q],sp);mesh(box(0.006,0.024,0.25),MAT.light,[px,0.06,pz],sp)}}
 __L('06_C_Atiesadores');if(lv>=2)for(const ang of[Math.PI/6,Math.PI/2,5*Math.PI/6]){const G=new THREE.Group(),rw=0.72*0.866;G.position.set(T.C[0]+Math.sin(ang)*rw,y0,T.C[1]+Math.cos(ang)*rw);G.rotation.y=ang;g.add(G);
  const h=hC*0.92,L=0.2,lean=-(0.72-0.66)*0.866*0.92,sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(L,0);sh.lineTo(L,0.04);sh.lineTo(lean+0.02,h);sh.lineTo(lean-0.01,h);sh.closePath();
  const gg=new THREE.ExtrudeGeometry(sh,{depth:0.07,bevelEnabled:true,bevelThickness:0.008,bevelSize:0.008,bevelSegments:1});gg.translate(0,0,-0.035);gg.rotateY(-Math.PI/2);
  mesh(gg,MAT.dark,[0,0,0],G);
  const hyp=Math.hypot(L-lean,h-0.04),an=Math.atan2(h-0.04,L-lean);const fl=mesh(box(0.13,0.03,hyp),MAT.slab,[0,(0.04+h)/2+0.012,(L+lean)/2+0.01],G);fl.rotation.x=an;
  mesh(box(0.2,0.025,L+0.02),MAT.slab,[0,0.012,L/2-0.01],G);
  for(const q of[-0.06,0.06])for(const zz of[L*0.35,L*0.8])mesh(new THREE.CylinderGeometry(0.014,0.014,0.03,6),MAT.light,[q,0.03,zz],G)}
 __L('07_C_Blindaje');if(lv===3){const[x,z]=T.C;mesh(box(0.7,hC*0.6,0.06),MAT.dark,[x,y0+hC*0.3,z+0.64],g)}
 __L('08_B_Nave'); // B nave al frente
 const hB=lv===3?1.15:lv===2?1.1:0.8;vol('B',0.93,0.8,hB,MAT.wall);slab('B',0.93,y0+hB,0.12);
 if(lv>=2){const[x,z]=T.B;const o=mesh(hexF(0.45,0.56,0.3),MAT.wall,[x,y0+hB+0.12+0.15,z-0.05],g);o.rotation.y=rot;const s2=mesh(hexF(0.5,0.53,0.07),MAT.slab,[x,y0+hB+0.12+0.335,z-0.05],g);s2.rotation.y=rot;
  mesh(box(0.5,0.035,0.02),MAT.tc,[x,y0+hB+0.3,z+0.4],g)}
 __L('09_B_Porton'); // portón hundido en la cara frontal-derecha de B (30°)
 {const[bx,bz]=T.B,dh=lv===1?0.5:lv===2?0.66:0.78,dw=lv===1?0.5:lv===2?0.58:0.64,fa=Math.PI/6,ap=0.93*0.866-0.04,P=new THREE.Group();P.position.set(bx+Math.sin(fa)*ap,0,bz+Math.cos(fa)*ap);P.rotation.y=fa;g.add(P);
  mesh(box(dw+0.18,dh+0.1,0.18),MAT.dark,[0,y0+(dh+0.1)/2,0],P);{const cd=mesh(box(dw,dh,0.2),M(0x6b737b),[0,y0+dh/2,0.02],P);cd.userData.y0=cd.position.y;cd.userData.lift=dh*0.7;g.userData.door=cd}for(let q=0.06;q<dh;q+=0.065)mesh(box(dw-0.02,0.012,0.012),M(0x3e454c),[0,y0+q,0.125],P);mesh(box(dw+0.04,0.07,0.22),MAT.dark,[0,y0+dh+0.02,0.03],P);
  for(const sx of[-1,1])mesh(box(0.06,dh+0.08,0.05),MAT.tc,[sx*(dw/2+0.05),y0+dh/2,0.1],P)}
 __L('10_A_Compuerta_Droper'); // nivel 3: puente de mando en voladizo desde A sobre la entrada
 if(lv>=2){const[x,z]=T.A,ty=y0+hA+0.12;mesh(hexF(0.97,0.93,0.12),MAT.slab,[x,ty+0.06,z],g);mesh(box(0.74,0.02,1.3),MAT.stripe,[x,ty+0.125,z],g);g.userData.landL=[];for(const sx of[-1,1])for(let q=0;q<4;q++){const lm=new THREE.MeshBasicMaterial({color:sx<0?0xff2a2a:0x2aff5a}),hm=new THREE.MeshBasicMaterial({color:sx<0?0xff3030:0x30ff60,transparent:true,opacity:0.35,blending:THREE.AdditiveBlending,depthWrite:false});
  const lz=z-0.5+q*0.333,lx=x+sx*0.43;mesh(box(0.05,0.035,0.05),lm,[lx,ty+0.145,lz],g).castShadow=false;const hh=mesh(new THREE.CircleGeometry(0.08,12),hm,[lx,ty+0.128,lz],g);hh.rotation.x=-Math.PI/2;hh.castShadow=false;g.userData.landL.push({lm,hm,q,sx})}g.userData.hatch={x,z,ty,doors:[-1,1].map(sx=>{const hg=new THREE.Group();hg.position.set(x+sx*0.32,ty+0.165,z);g.add(hg);mesh(box(0.32,0.04,1.2),MAT.dark,[-sx*0.16,0,0],hg);mesh(box(0.02,0.045,1.2),MAT.stripe,[-sx*0.31,0,0],hg);hg.userData.sx=sx;return hg})};
  {const PD=new THREE.Group();PD.position.set(x,ty-0.45,z);g.add(PD);mesh(box(0.58,0.05,1.14),MAT.dark,[0,0,0],PD);mesh(box(0.46,0.012,1.0),MAT.stripe,[0,0.03,0],PD);mesh(box(0.4,0.016,0.94),MAT.dark,[0,0.035,0],PD);for(const sx of[-1,1])mesh(box(0.06,1.2,0.06),MAT.light,[sx*0.2,-0.62,0],PD);PD.visible=false;g.userData.hatch.pad=PD;g.userData.hatch.pad0=ty-0.45}}
 __L('11_B_Antena_Satelital'); // antena satelital sobre B
 {const[x,z]=T.B,ry=y0+hB+0.12+(lv>=2?0.37:0),D=new THREE.Group();D.position.set(x+(lv>=2?0.0:-0.25),ry,z+(lv>=2?-0.05:0.1));D.scale.setScalar(1.35);g.add(D);
  mesh(new THREE.CylinderGeometry(0.05,0.07,0.16,8),MAT.dark,[0,0.08,0],D);const tl=new THREE.Group();tl.position.y=0.18;tl.rotation.order='YXZ';tl.rotation.set(-0.75,Math.PI/4,0);D.add(tl);
  const dm=mesh(new THREE.SphereGeometry(0.2,16,8,0,Math.PI*2,Math.PI-0.9,0.9),M(0xc8d0d8),[0,0.17,0],tl);dm.material.side=THREE.DoubleSide;
  mesh(new THREE.CylinderGeometry(0.008,0.008,0.22,4),MAT.dark,[0,0.0,0.0],tl).position.y=0.0;mesh(new THREE.CylinderGeometry(0.01,0.01,0.2,4),MAT.dark,[0,0.1,0],tl);mesh(new THREE.SphereGeometry(0.025,8,6),MAT.tc,[0,0.2,0],tl)}
 __L('12_Franjas_Bando'); // franjas del bando en los zócalos de A y B
 for(const k of['A','B']){const[x,z]=T[k];const o=mesh(hexF(k==='A'?0.96:0.94,k==='A'?0.96:0.94,0.04),MAT.tc,[x,y0+0.06,z],g);o.rotation.y=rot}
 __L('13_A_Antena');
 // antena
 if(lv<2)mesh(new THREE.CylinderGeometry(0.015,0.015,0.6,6),MAT.light,[T.A[0]-0.25,y0+hA+0.42,T.A[1]-0.2],g);
 return g}
function prof(pts,depth,bev){const sh=new THREE.Shape();sh.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))sh.lineTo(p[0],p[1]);sh.closePath();
 const g=new THREE.ExtrudeGeometry(sh,{depth,bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:1});g.rotateY(-Math.PI/2);g.translate(depth/2,0,0);g.computeVertexNormals();return g}
function heliModel(tcol,lv){const R3=(lv||2)>=3;const MAT=Object.assign({},CQMAT(tcol),{glass:R3?glowMat(new THREE.Color(0x3fe6ff)):new THREE.MeshLambertMaterial({color:0x0a2a38,emissive:0x2a8fb0})});const h=new THREE.Group(),U=h.userData;U.bl=[];U.jets=[];U.pods=[];U.lights=[];U.skids=[];
 // casco: perfil lateral extruido (cola -z, nariz +z)
 mesh(prof([[-0.17,-0.105],[-0.17,0.135],[0.16,0.14],[0.33,0.07],[0.52,0.0],[0.44,-0.07],[0.1,-0.11]],0.3,0.025),MAT.wall,[0,0,0],h);
 // bodega de carga: casco trasero hueco abierto atrás (paredes, piso, techo) con nervios y luz roja
 for(const sx of[-1,1]){const w=mesh(prof([[-0.47,-0.1],[-0.47,0.09],[-0.22,0.14],[-0.16,0.14],[-0.16,-0.105]],0.03,0.012),MAT.wall,[sx*0.15,0,0],h)}
 mesh(box(0.31,0.025,0.32),MAT.wall,[0,-0.098,-0.315],h);{const r=mesh(box(0.31,0.025,0.33),MAT.wall,[0,0.118,-0.31],h);r.rotation.x=-0.17}
 const IN=M(0x2a2f34);mesh(box(0.26,0.004,0.3),IN,[0,-0.083,-0.315],h);for(const sx of[-1,1])mesh(box(0.004,0.17,0.3),IN,[sx*0.133,0.0,-0.315],h);mesh(box(0.26,0.17,0.006),M(0x15181b),[0,0.0,-0.168],h);
 for(let q=0;q<4;q++){const zq=-0.2-q*0.075;for(const sx of[-1,1])mesh(box(0.012,0.17,0.012),MAT.dark,[sx*0.125,0,zq],h);mesh(box(0.25,0.012,0.012),MAT.dark,[0,0.085-(0.035*(q/3)),zq],h)}
 for(const sx of[-1,1])mesh(box(0.035,0.03,0.28),MAT.dark,[sx*0.105,-0.068,-0.315],h);
 mesh(prof([[-0.3,0.13],[-0.18,0.2],[0.08,0.2],[0.2,0.14]],0.18,0.015),MAT.slab,[0,0,0],h);
 mesh(prof([[0.17,0.135],[0.26,0.105],[0.36,0.065],[0.2,0.15]],0.2,0.01),MAT.glass,[0,0.005,0],h);
 for(const sx of[-1,1]){mesh(box(0.012,0.05,0.62),MAT.dark,[sx*0.168,0.02,0.02],h);mesh(box(0.01,0.025,0.4),MAT.tc,[sx*0.17,-0.04,0.05],h)}
 {const bl=new THREE.MeshBasicMaterial({color:0xff3a2a});mesh(box(0.012,0.012,0.26),bl,[0,0.092,-0.31],h);U.bayL=bl;
  const rp=new THREE.Group();rp.position.set(0,-0.088,-0.478);h.add(rp);mesh(box(0.27,0.022,0.2),MAT.wall,[0,0,-0.1],rp);
  for(const sx of[-1,1])mesh(box(0.014,0.035,0.2),MAT.dark,[sx*0.128,0.018,-0.1],rp);for(let q=0;q<4;q++)mesh(box(0.22,0.008,0.012),MAT.dark,[0,0.014,-0.03-q*0.045],rp);
  mesh(box(0.24,0.006,0.02),MAT.stripe,[0,0.013,-0.192],rp);for(const sx of[-1,1])mesh(new THREE.CylinderGeometry(0.014,0.014,0.03,8),MAT.dark,[sx*0.1,0,0],rp).rotation.z=Math.PI/2;
  rp.rotation.x=1.5;U.ramp=rp}
 for(const sx of[-1,1]){const f=mesh(box(0.025,0.17,0.16),MAT.slab,[sx*0.09,0.22,-0.36],h);f.rotation.set(-0.35,0,sx*0.35)}
 // alas con góndolas basculantes
 for(const sx of[-1,1]){const pv=new THREE.Group();pv.position.set(sx*0.15,0.04,-0.06);h.add(pv);pv.userData.sx=sx;
  const w=mesh(prof([[-0.12,0],[0.12,0],[0.06,0.33],[-0.1,0.33]],0.035,0.008),MAT.slab,[0,0,0],pv);w.rotation.set(Math.PI/2,0,-sx*Math.PI/2);w.position.set(0,0,0);
  const pod=new THREE.Group();pod.position.set(sx*0.38,0,0);pv.add(pod);
  const nc=mesh(new THREE.CylinderGeometry(0.075,0.085,0.34,10),MAT.wall,[0,0,0],pod);nc.rotation.x=Math.PI/2;
  mesh(new THREE.CylinderGeometry(0.088,0.088,0.04,10),MAT.dark,[0,0,0.16],pod).rotation.x=Math.PI/2;
  mesh(new THREE.CylinderGeometry(0.06,0.07,0.06,10),MAT.dark,[0,0,-0.19],pod).rotation.x=Math.PI/2;
  mesh(box(0.02,0.02,0.2),MAT.tc,[sx*0.07,0.03,0],pod);
  const jm=new THREE.MeshBasicMaterial({color:0x8fefff,transparent:true,opacity:0.75,depthWrite:false});const jt=mesh(new THREE.ConeGeometry(0.05,0.32,10),jm,[0,0,-0.37],pod);jt.rotation.x=-Math.PI/2;U.jets.push(jt);
  const lm=new THREE.MeshBasicMaterial({color:sx<0?0xff3030:0x30ff60});mesh(new THREE.SphereGeometry(0.018,6,4),lm,[sx*0.1,0,0.05],pod);U.lights.push(lm);
  U.pods.push(pod);U.bl.push(pv)}
 if(R3){// El Relevo: segundo par de alas atrás con sus góndolas (4 en total), blindaje lateral y franjas del bando
  for(const sx of[-1,1]){const pv=new THREE.Group();pv.position.set(sx*0.15,0.1,-0.33);h.add(pv);pv.userData.sx=sx;
   const w=mesh(prof([[-0.09,0],[0.09,0],[0.05,0.27],[-0.07,0.27]],0.03,0.008),MAT.slab,[0,0,0],pv);w.rotation.set(Math.PI/2,0,-sx*Math.PI/2);
   const pod=new THREE.Group();pod.position.set(sx*0.31,0,0);pv.add(pod);
   const nc=mesh(new THREE.CylinderGeometry(0.06,0.07,0.28,10),MAT.wall,[0,0,0],pod);nc.rotation.x=Math.PI/2;
   mesh(new THREE.CylinderGeometry(0.073,0.073,0.035,10),MAT.dark,[0,0,0.13],pod).rotation.x=Math.PI/2;mesh(box(0.018,0.018,0.17),MAT.tc,[sx*0.06,0.025,0],pod);
   const jm=new THREE.MeshBasicMaterial({color:0x8fefff,transparent:true,opacity:0.75,depthWrite:false});const jt=mesh(new THREE.ConeGeometry(0.042,0.27,10),jm,[0,0,-0.3],pod);jt.rotation.x=-Math.PI/2;U.jets.push(jt);
   U.pods.push(pod);U.bl.push(pv)}
  for(const sx of[-1,1]){mesh(box(0.03,0.13,0.5),MAT.slab,[sx*0.178,0.0,-0.05],h);mesh(box(0.034,0.025,0.46),MAT.tc,[sx*0.182,0.035,-0.05],h);mesh(box(0.034,0.025,0.46),MAT.tc,[sx*0.182,-0.03,-0.05],h);mesh(box(0.035,0.04,0.12),MAT.dark,[sx*0.18,0.0,0.24],h)}
  mesh(box(0.22,0.03,0.4),MAT.slab,[0,0.21,-0.02],h);for(const sx of[-1,1])mesh(box(0.025,0.008,0.36),MAT.tc,[sx*0.07,0.227,-0.02],h)}
 // patines retráctiles
 for(const sx of[-1,1]){const k=new THREE.Group();k.position.set(sx*0.1,-0.1,0);h.add(k);mesh(box(0.02,0.08,0.02),MAT.dark,[0,-0.04,0.12],k);mesh(box(0.02,0.08,0.02),MAT.dark,[0,-0.04,-0.15],k);mesh(box(0.03,0.02,0.4),MAT.dark,[0,-0.08,-0.01],k);U.skids.push(k)}
 const st=new THREE.MeshBasicMaterial({color:0xffffff});mesh(new THREE.SphereGeometry(0.015,6,4),st,[0,0.21,-0.2],h);U.strobe=st;
 return h}
return{cuartelModel,heliModel}})();

