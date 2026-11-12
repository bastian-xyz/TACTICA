// ================= THREE =================
const view=document.getElementById('view');
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
view.insertBefore(renderer.domElement,view.firstChild);
const cv=renderer.domElement;
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x0a0c0f);
scene.fog=new THREE.Fog(0x07090c,34,80);
const camera=new THREE.PerspectiveCamera(38,1,0.5,200);
const hemi=new THREE.HemisphereLight(0xdfeaff,0x2a2218,0.75);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff1dc,0.9);sun.position.set(-12,26,10);scene.add(sun);
const world=new THREE.Group();scene.add(world);

const G={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(0.5,0.5,1,10),hex:new THREE.CylinderGeometry(0.5,0.5,1,6),sph:new THREE.SphereGeometry(0.5,10,8),cone:new THREE.ConeGeometry(0.5,1,6),oct:new THREE.OctahedronGeometry(0.5),ring:new THREE.RingGeometry(0.55,0.68,28),disc:new THREE.CircleGeometry(0.5,16),plane:new THREE.PlaneGeometry(1,0.13),hit:new THREE.BoxGeometry(1,1,1)};
G.ring.rotateX(-Math.PI/2);G.disc.rotateX(-Math.PI/2);
const hexGeo=new THREE.CylinderGeometry(0.965,0.965,1,6);hexGeo.translate(0,0.5,0);
{const p=hexGeo.attributes.position,nm=hexGeo.attributes.normal,col=[];for(let i=0;i<p.count;i++){const ny=nm.getY(i),y=p.getY(i);let k;if(ny>0.5)k=[1,1,1];else if(ny<-0.5)k=[0.2,0.2,0.2];else k=y>0.5?[0.62,0.56,0.5]:[0.3,0.26,0.23];col.push(...k)}hexGeo.setAttribute('color',new THREE.Float32BufferAttribute(col,3))}
const hexLine=(()=>{const p=[];for(let k=0;k<=6;k++){const a=k*Math.PI/3;p.push(new THREE.Vector3(0.86*Math.sin(a),0,0.86*Math.cos(a)))}return new THREE.BufferGeometry().setFromPoints(p)})();
const PANEL=(()=>{const N=128,cv=document.createElement('canvas');cv.width=cv.height=N;const x=cv.getContext('2d');
 x.fillStyle='#cfcfcf';x.fillRect(0,0,N,N);
 const id=x.getImageData(0,0,N,N),d=id.data;let s=7;const rn=()=>{s=(s*16807)%2147483647;return s/2147483647};
 for(let i=0;i<d.length;i+=4){const v=(rn()-0.5)*16;d[i]+=v;d[i+1]+=v;d[i+2]+=v}x.putImageData(id,0,0);
 const g1=x.createLinearGradient(0,0,0,N);g1.addColorStop(0,'rgba(255,255,255,0.10)');g1.addColorStop(1,'rgba(0,0,0,0.14)');x.fillStyle=g1;x.fillRect(0,0,N,N);
 const bev=(a,b,c,d2,w)=>{x.lineWidth=w;x.strokeStyle='rgba(255,255,255,0.55)';x.beginPath();x.moveTo(a,d2);x.lineTo(a,b);x.lineTo(c,b);x.stroke();x.strokeStyle='rgba(0,0,0,0.5)';x.beginPath();x.moveTo(c,b);x.lineTo(c,d2);x.lineTo(a,d2);x.stroke()};
 bev(2,2,N-2,N-2,4);
 x.strokeStyle='rgba(0,0,0,0.45)';x.lineWidth=1.5;x.beginPath();x.moveTo(N*0.62,6);x.lineTo(N*0.62,N*0.55);x.lineTo(N-6,N*0.55);x.stroke();
 x.strokeStyle='rgba(255,255,255,0.3)';x.beginPath();x.moveTo(N*0.62+1.5,6);x.lineTo(N*0.62+1.5,N*0.55-1.5);x.lineTo(N-6,N*0.55-1.5);x.stroke();
 for(const[a,b]of[[10,10],[N-10,10],[10,N-10],[N-10,N-10],[N*0.62-7,N*0.55+7]]){x.fillStyle='rgba(0,0,0,0.45)';x.beginPath();x.arc(a+0.8,b+0.8,2.6,0,7);x.fill();x.fillStyle='rgba(255,255,255,0.65)';x.beginPath();x.arc(a-0.4,b-0.4,1.8,0,7);x.fill()}
 x.fillStyle='rgba(0,0,0,0.35)';for(let i=0;i<4;i++)x.fillRect(14,N*0.7+i*7,28,3);
 x.strokeStyle='rgba(255,255,255,0.18)';x.lineWidth=0.7;for(let i=0;i<14;i++){const a=rn()*N,b=rn()*N,l=4+rn()*12,an=rn()*3;x.beginPath();x.moveTo(a,b);x.lineTo(a+Math.cos(an)*l,b+Math.sin(an)*l);x.stroke()}
 x.strokeStyle='rgba(255,255,255,0.35)';x.lineWidth=2;x.setLineDash([3,5]);x.strokeRect(1,1,N-2,N-2);
 const t=new THREE.CanvasTexture(cv);t.anisotropy=4;return t})();
let PANELON=false;
const rimify=m=>{m.onBeforeCompile=sh=>{sh.vertexShader='varying vec3 vRN;varying vec3 vRV;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vRN=normalize(normalMatrix*objectNormal);vRV=normalize(-mvPosition.xyz);');
 sh.fragmentShader='varying vec3 vRN;varying vec3 vRV;\n'+sh.fragmentShader.replace('#include <output_fragment>','float rimF=pow(1.0-clamp(abs(dot(normalize(vRN),normalize(vRV))),0.0,1.0),2.2);outgoingLight+=vec3(0.62,0.7,0.78)*rimF*0.55;\n#include <output_fragment>')};return m};
const MC={},MP={};const M=c=>PANELON?(MP[c]||(MP[c]=rimify(new THREE.MeshLambertMaterial({color:new THREE.Color(c).multiplyScalar(1.12),map:PANEL})))):(MC[c]||(MC[c]=new THREE.MeshLambertMaterial({color:c})));
const HITM=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false});
const DARK=0x2e353d,MID=0x56616c,LIGHT=0xb3bfca;
function P(geo,c,sx,sy,sz,x,y,z,rx,ry,rz){const m=new THREE.Mesh(geo,typeof c==='number'?M(c):c);m.scale.set(sx,sy,sz);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);return m}

const COL={ramp:new THREE.Color(0x8c7a55),grass:new THREE.Color(0x2f4424),dirt:new THREE.Color(0x4c3a29),stone:new THREE.Color(0x46494d),litio:new THREE.Color(0x4a3d14),dep:new THREE.Color(0x2b2f33),rock:new THREE.Color(0x5c544b),hi:new THREE.Color(0x2ad4ff),zone:new THREE.Color(0x8996a4)};
let tileMesh=null,hiSet=null;
// ---------- procedural detail textures (R grass, G dirt, B cells/cracks, A strata)
const detTex=(()=>{
 const N=256,cv=document.createElement('canvas');cv.width=cv.height=N;const cx=cv.getContext('2d'),img=cx.createImageData(N,N),D=img.data;
 const rr=rnd32(1234);
 const grid=(g)=>{const a=new Float32Array(g*g);for(let i=0;i<a.length;i++)a[i]=rr();return a};
 const G=[4,8,16,32,64].map(g=>({g,a:grid(g)}));
 const vn=(o,x,y)=>{const g=o.g,fx=x*g,fy=y*g,x0=Math.floor(fx),y0=Math.floor(fy),tx=fx-x0,ty=fy-y0,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty);
  const v=(i,j)=>o.a[((j%g+g)%g)*g+((i%g+g)%g)];
  return (v(x0,y0)*(1-sx)+v(x0+1,y0)*sx)*(1-sy)+(v(x0,y0+1)*(1-sx)+v(x0+1,y0+1)*sx)*sy};
 const fbm=(x,y,o0,n)=>{let s=0,a=0.5,t=0;for(let k=0;k<n;k++){s+=vn(G[o0+k],x,y)*a;t+=a;a*=0.5}return s/t};
 const C=24,pts=[];for(let i=0;i<C;i++)pts.push([rr(),rr()]);
 const blades=new Float32Array(N*N);for(let k=0;k<2600;k++){let x=rr()*N,y=rr()*N;const L=3+rr()*6,ang=-1.2+rr()*0.5,b=0.5+rr()*0.5;for(let s=0;s<L;s++){const X=((Math.round(x+Math.cos(ang)*s)%N)+N)%N,Y=((Math.round(y+Math.sin(ang)*s)%N)+N)%N;blades[Y*N+X]=Math.max(blades[Y*N+X],b*(1-s/L*0.5))}}
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const u=x/N,v=y/N,i=(y*N+x)*4;
  const gr=0.45*fbm(u,v,2,3)+0.35*blades[y*N+x]+0.2*vn(G[4],u,v);
  const di=0.55*fbm(u,v,0,4)+0.3*(vn(G[4],u,v)>0.78?1:0)*vn(G[3],u,v)+0.15*vn(G[4],u+0.3,v);
  let f1=9,f2=9;for(const[px,py]of pts){let dx=Math.abs(u-px),dy=Math.abs(v-py);dx=Math.min(dx,1-dx);dy=Math.min(dy,1-dy);const d=Math.sqrt(dx*dx+dy*dy);if(d<f1){f2=f1;f1=d}else if(d<f2)f2=d}
  const cell=Math.min(1,(f2-f1)*6);
  const st=0.5+0.5*Math.sin((v*7+fbm(u,v,0,3)*1.6)*Math.PI*2);
  D[i]=gr*255;D[i+1]=di*255;D[i+2]=cell*255;D[i+3]=(0.55*st+0.45*fbm(u,v,1,4))*255;
 }
 cx.putImageData(img,0,0);
 const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;
})();
const TU={uTime:{value:0},uDet:{value:detTex},uCau:{value:new THREE.Vector3(0.07,0.13,0.16)},uGlow:{value:new THREE.Vector3(0,0,0)},uF1:{value:new THREE.Vector3(0.16,0.42,0.6)},uF2:{value:new THREE.Vector3(0.85,0.95,1.0)}};
function terrainMat(opts){
 const m=new THREE.MeshLambertMaterial(opts);
 m.onBeforeCompile=sh=>{
  sh.uniforms.uTime=TU.uTime;sh.uniforms.uDet=TU.uDet;sh.uniforms.uCau=TU.uCau;sh.uniforms.uGlow=TU.uGlow;
  sh.vertexShader='attribute vec4 aW;attribute vec2 aE;\nvarying vec3 vWP;varying vec4 vW;varying float vNy;varying vec2 vE;\n'+sh.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
  #ifdef USE_INSTANCING
   vWP=(modelMatrix*instanceMatrix*vec4(transformed,1.0)).xyz;
  #else
   vWP=(modelMatrix*vec4(transformed,1.0)).xyz;
  #endif
  vW=aW;vNy=normal.y;vE=aE;`);
  sh.fragmentShader='uniform sampler2D uDet;uniform float uTime;uniform vec3 uCau;uniform vec3 uGlow;\nvarying vec3 vWP;varying vec4 vW;varying float vNy;varying vec2 vE;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=uGlow*gAmt;').replace('#include <color_fragment>',`#include <color_fragment>
  float gAmt=0.0;
  {vec2 uv=vWP.xz*0.16;vec4 d=texture2D(uDet,uv);vec4 m=texture2D(uDet,uv*0.23+vec2(0.37,0.61));
   float fg=0.68+0.6*d.r,fd=0.6+0.75*d.g,fs=0.55+0.45*smoothstep(0.0,0.35,texture2D(uDet,uv*3.1).b)+0.2*d.g+0.15*d.r;
   float f=(vW.x*fg+vW.y*fd+vW.z*fs+vW.w*0.85)/max(0.001,vW.x+vW.y+vW.z+vW.w);f*=0.85+0.3*m.g;
   if(vW.w>0.98){vec2 w=vWP.xz*1.1;float c1=texture2D(uDet,w+vec2(uTime*0.012,uTime*0.007)).b;float c2=texture2D(uDet,w*1.37+vec2(-uTime*0.009,uTime*0.011)).b;
    float cau=pow(1.0-smoothstep(0.0,0.14,min(c1,c2)),2.5)*0.8;float fl=smoothstep(0.72,0.95,texture2D(uDet,vec2(vWP.x*0.35-uTime*0.22,vWP.z*2.2)).r)*0.6;cau+=fl;f=0.8+0.3*texture2D(uDet,w*0.5+uTime*0.004).g;float mc=max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b));diffuseColor.rgb+=uCau*cau*f*min(1.0,mc*6.0);gAmt=(0.55+0.7*cau)*clamp(mc*1.6,0.0,1.0);}
   else{float cl=smoothstep(0.86,0.6,vNy);float st=texture2D(uDet,vec2((vWP.x+vWP.z)*0.22,vWP.y*0.55)).a;
    float gv=texture2D(uDet,vWP.xz*0.9).b;float nz=texture2D(uDet,vWP.xz*0.07).g;
    float top=smoothstep(0.0,1.0,vE.x)*(1.0-cl),bot=smoothstep(0.0,1.0,vE.y)*(1.0-cl);
    float gravel=clamp(top*(0.55+0.5*nz)+bot*0.8,0.0,1.0);
    diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(0.78,0.86,0.7),top*0.6);
    float lum=dot(diffuseColor.rgb,vec3(0.3,0.59,0.11));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(lum)*vec3(1.12,1.0,0.86)*1.15,gravel*smoothstep(0.25,0.6,gravel+gv*0.4)*0.6);
    f=mix(f,0.55+0.7*gv,gravel*0.7);
    float rim=smoothstep(0.55,1.0,vE.x)*(1.0-cl);f*=1.0+rim*0.35;f*=1.0-bot*0.5;
    float cw=smoothstep(0.75,0.35,vNy);f=mix(f,(0.42+0.55*st)*0.48,cl);f*=1.0-cw*0.25;diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(0.85,0.82,0.8),cl);}
   diffuseColor.rgb*=f;}`);

 };
 return m;
}
const crysGeo=new THREE.ConeGeometry(0.16,0.7,5);
const crysMat=new THREE.MeshLambertMaterial({color:0xffe14d,emissive:0x8a6a00});

const PT=0.16;let PLAT=new Set(),PLATM=null;
const groundY=i=>tiles[i].h+(PLAT.has(i)?PT:0);
function buildPlatforms(){
 PLAT=new Set();const groups=[];
 const okP=i=>{const t=tiles[i];return(t.type==='grass'||t.type==='litio')&&!t.ramp};
 zones.forEach((z,zi)=>{const g=z.tiles.filter(okP);g.forEach(i=>PLAT.add(i));groups.push({set:new Set(g),mat:z.lmat})});
 for(const[k,tm]of[[HQP,0],[HQC,1],...BASP.map(b=>[b,0]),...BASC.map(b=>[b,1])]){const g=[k,...tiles[k].nb].filter(okP);g.forEach(i=>PLAT.add(i));groups.push({set:new Set(g),mat:new THREE.LineBasicMaterial({color:TC[tm],transparent:true,opacity:0.85})})}
 const ring=r=>{const a=[];for(let k=0;k<6;k++){const an=k*Math.PI/3;a.push([r*Math.sin(an),r*Math.cos(an)])}return a};
 const TOP=ring(0.95),BEV=ring(1.0);
 const pos=[],base=[],own=[];
 const v=(x,y,z,k,i)=>{pos.push(x,y,z);base.push(k);own.push(i)};
 for(const i of PLAT){
  const t=tiles[i],y=t.h+PT,yb=y-0.05,yd=t.h-0.9,X=t.x,Z=t.z,sh=0.92+0.12*t.v;
  for(let k=0;k<6;k++){const a=TOP[k],b=TOP[(k+1)%6],A=BEV[k],B=BEV[(k+1)%6];
   v(X,y,Z,sh,i);v(X+a[0],y,Z+a[1],sh,i);v(X+b[0],y,Z+b[1],sh,i);
   v(X+a[0],y,Z+a[1],0.8,i);v(X+A[0],yb,Z+A[1],0.8,i);v(X+B[0],yb,Z+B[1],0.8,i);
   v(X+a[0],y,Z+a[1],0.8,i);v(X+B[0],yb,Z+B[1],0.8,i);v(X+b[0],y,Z+b[1],0.8,i);
   v(X+A[0],yb,Z+A[1],0.55,i);v(X+A[0],yd,Z+A[1],0.3,i);v(X+B[0],yd,Z+B[1],0.3,i);
   v(X+A[0],yb,Z+A[1],0.55,i);v(X+B[0],yd,Z+B[1],0.3,i);v(X+B[0],yb,Z+B[1],0.55,i);
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(pos.length),3));g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}));world.add(m);
 PLATM={g,base:Float32Array.from(base),own:Int32Array.from(own)};
 // crisp rim on the outer boundary of each platform
 for(const{set,mat}of groups){const pts=[];
  for(const i of set){const t=tiles[i],y=t.h+PT+0.012;
   for(let k=0;k<6;k++){const mid=(k*60+30)*Math.PI/180;const n=hexAt(t.x+SQ3*Math.sin(mid),t.z+SQ3*Math.cos(mid));if(n>=0&&set.has(n))continue;
    const a=TOP[k],b=TOP[(k+1)%6],s=0.93/0.95;pts.push(t.x+a[0]*s,y,t.z+a[1]*s,t.x+b[0]*s,y,t.z+b[1]*s)}}
  world.add(lineMesh(pts,mat));}
}
function paintPlat(){
 if(!PLATM)return;const c=PLATM.g.attributes.color.array,cb=new THREE.Color(0x4a4e53);
 for(let k=0;k<PLATM.base.length;k++){const i=PLATM.own[k];let f=PLATM.base[k];if(!expl[i])f=0.06;else if(!vis[i])f*=0.42;c[k*3]=cb.r*f;c[k*3+1]=cb.g*f;c[k*3+2]=cb.b*f*1.04}
 PLATM.g.attributes.color.needsUpdate=true;
}
let TSTEP=0.2,TER=null,GRID=null;
const wob=(x,z)=>[x+0.2*Math.sin(z*1.7+x*0.6)+0.09*Math.sin(z*4.3-x*2.1),z+0.2*Math.sin(x*1.5-z*0.8)+0.09*Math.sin(x*3.7+z*2.9)];
const topOf=t=>t.type==='water'?-0.08:t.type==='ford'?0.09:t.h;
const surfIdx=t=>(t.type==='water'||t.type==='ford')?3:t.vil?1:t.type==='rock'?2:t.type==='litio'?1:({grass:0,dirt:1,stone:2}[t.surf]||0);
const micro=(x,z)=>0.012*Math.sin(x*1.3+z*0.7)*Math.sin(z*1.1-x*0.5);
function sampleT(x,z,tc){
 const[wx,wz]=wob(x,z);let c=hexAt(wx,wz);if(c<0)c=hexAt(x,z);if(c<0)return null;
 const T=tiles[c];let sw=0,sh=0,r=0,g=0,b=0;const W=[0,0,0,0];
 for(const i of[c,...T.nb]){const t=tiles[i];const d=Math.hypot(wx-t.x,wz-t.z);const w=Math.max(0,1-d/(t.soft?1.6:1.2));if(w<=0)continue;const ww=t.soft?w*w*(3-2*w):w*w*w*w;sw+=ww;sh+=ww*topOf(t);
  if(tc){const cc=tc[i];r+=cc.r*ww;g+=cc.g*ww;b+=cc.b*ww;W[surfIdx(t)]+=ww}}
 if(!sw)return{h:topOf(T),c,r:0,g:0,b:0,W};
 return{h:sh/sw+micro(x,z),c,r:r/sw,g:g/sw,b:b/sw,W:W.map(v=>v/sw)};
}
function heightAt(x,z){const pi=hexAt(x,z);if(pi>=0&&PLAT.has(pi))return tiles[pi].h+PT;const s=sampleT(x,z,null);return s?s.h:-0.4}
function tileBaseColor(t){
 const c=new THREE.Color();
 if(t.vil)c.copy(COL.dirt).multiplyScalar(1.05);
 else if(t.type==='rock')c.copy(COL.stone).multiplyScalar(0.95+t.v*0.3);
 else if(t.type==='water')c.setHex(PL.liq.bed);
 else if(t.type==='ford')c.setHex(PL.liq.ford);
 else if(t.type==='litio')c.copy(t.amt>0?COL.litio:COL.dep);
 else c.copy(COL[t.surf]||COL.grass).multiplyScalar(0.88+t.v*0.2);
 if(t.type!=='water'&&t.type!=='ford')c.multiplyScalar(0.58+t.lv*0.13);
 return c;
}
function buildSurface(){
 TSTEP=CFG.quality==='baja'?0.34:0.24;
 const x0=-CX-1.4,x1=CX+1.4,z0=-CZ-1.4,z1=CZ+1.4,nx=Math.ceil((x1-x0)/TSTEP)+1,nz=Math.ceil((z1-z0)/TSTEP)+1,N=nx*nz;
 const pos=new Float32Array(N*3),col=new Float32Array(N*3),aw=new Float32Array(N*4),vt=new Int32Array(N),vb=new Float32Array(N*3);
 const tc=tiles.map(tileBaseColor);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
  const k=j*nx+i,x=x0+i*TSTEP,z=z0+j*TSTEP,sm=sampleT(x,z,tc);
  pos[k*3]=x;pos[k*3+2]=z;
  if(sm){pos[k*3+1]=sm.h;vb[k*3]=sm.r;vb[k*3+1]=sm.g;vb[k*3+2]=sm.b;aw.set(sm.W,k*4);vt[k]=sm.c}
  else{pos[k*3+1]=-0.5;vb[k*3]=0.03;vb[k*3+1]=0.035;vb[k*3+2]=0.04;aw[k*4+2]=1;vt[k]=-1}
 }
 const ix=[],wix=[];
 const wt=tiles.filter(t=>t.type==='water'||t.type==='ford').map(t=>t.i),nearW=new Uint8Array(tiles.length);for(const t of tiles)if(wt.some(w=>hd(w,t.i)<=2))nearW[t.i]=1;
 const isW=t=>t>=0&&nearW[t];
 for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+1,c=a+nx,d=c+1;ix.push(a,c,b,b,c,d);if(isW(vt[a])&&isW(vt[d])&&isW(vt[b])&&isW(vt[c]))wix.push(a,c,b,b,c,d)}
 const ae=new Float32Array(N*2);{const H=k=>pos[k*3+1];for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,h=H(k);let lo=h,hi=h;for(const[di,dj]of[[2,0],[-2,0],[0,2],[0,-2],[1,1],[-1,-1],[1,-1],[-1,1]]){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=nx||jj>=nz)continue;const hh=H(jj*nx+ii);if(hh<lo)lo=hh;if(hh>hi)hi=hh}ae[k*2]=clamp((h-lo-0.08)/0.35,0,1);ae[k*2+1]=clamp((hi-h-0.08)/0.35,0,1)}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('aE',new THREE.BufferAttribute(ae,2));geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.setAttribute('aW',new THREE.BufferAttribute(aw,4));geo.setIndex(ix);geo.computeVertexNormals();
 const mesh=new THREE.Mesh(geo,terrainMat({color:0xffffff,vertexColors:true}));world.add(mesh);
 const wpos=new Float32Array(pos.length);for(let k=0;k<N;k++){wpos[k*3]=pos[k*3];wpos[k*3+1]=0.16;wpos[k*3+2]=pos[k*3+2]}
 const waw=new Float32Array(N*4);for(let k=0;k<N;k++)waw[k*4+3]=1;
 const wcol=new Float32Array(N*3);
 const wgeo=new THREE.BufferGeometry();wgeo.setAttribute('aE',new THREE.BufferAttribute(new Float32Array(N*2),2));wgeo.setAttribute('position',new THREE.BufferAttribute(wpos,3));wgeo.setAttribute('color',new THREE.BufferAttribute(wcol,3));wgeo.setAttribute('aW',new THREE.BufferAttribute(waw,4));wgeo.setIndex(wix);wgeo.computeVertexNormals();
 const wmesh=new THREE.Mesh(wgeo,terrainMat({color:0xffffff,vertexColors:true,transparent:PL.liq.op<1,opacity:PL.liq.op}));wmesh.renderOrder=2;world.add(wmesh);
 TER={mesh,geo,vt,vb,col,wgeo,wcol,N};
}
function drapeSegs(list,yo){const pts=[];for(const[x0,z0,x1,z1]of list){for(let s=0;s<3;s++){const a=s/3,b=(s+1)/3;const xa=x0+(x1-x0)*a,za=z0+(z1-z0)*a,xb=x0+(x1-x0)*b,zb=z0+(z1-z0)*b;pts.push(xa,heightAt(xa,za)+yo,za,xb,heightAt(xb,zb)+yo,zb)}}return pts}
function hexEdges(t,r){const o=[];for(let k=0;k<6;k++){const a0=k*Math.PI/3,a1=(k+1)*Math.PI/3;o.push([t.x+r*Math.sin(a0),t.z+r*Math.cos(a0),t.x+r*Math.sin(a1),t.z+r*Math.cos(a1)])}return o}
function lineMesh(pts,mat){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));return new THREE.LineSegments(g,mat)}
function buildTerrain(){
 while(world.children.length)world.remove(world.children[0]);
 for(const t of tiles){t.flat=t.nb.every(n=>tiles[n].lv===t.lv&&tiles[n].type!=='rock');t.soft=t.ramp||t.type==='water'||t.type==='ford'||t.lv<=1||t.nb.some(n=>tiles[n].ramp||tiles[n].type==='water')}
 PLAT=new Set();buildSurface();
 zones.forEach(z=>{z.lmat=new THREE.LineBasicMaterial({color:0x8996a4,transparent:true,opacity:0.9})});
 buildPlatforms();
 {const L=[];for(const t of tiles)if(t.type!=='water'){const e=hexEdges(t,1);L.push(e[0],e[1],e[2])}
  GRID=lineMesh(drapeSegs(L,0.03),new THREE.LineBasicMaterial({color:0x000000,transparent:true,opacity:0.2}));GRID.visible=!!CFG.grid;world.add(GRID)}
 buildContours();
 if(CFG.quality==='baja')DECO=[];else buildDeco();
 for(const t of tiles){
  if(t.type!=='litio')continue;t.crys=[];
  for(let k=0;k<3;k++){const c=new THREE.Mesh(crysGeo,crysMat);const a=k*2.1+t.v*3,r=0.25+0.15*k;const s=0.7+0.5*((t.v*7+k)%1);const cx2=t.x+Math.cos(a)*r,cz2=t.z+Math.sin(a)*r;c.position.set(cx2,heightAt(cx2,cz2)+0.3*s,cz2);c.scale.setScalar(s);c.rotation.z=(k-1)*0.2;world.add(c);t.crys.push(c)}
 }
 zones.forEach(z=>{
  z.mat=new THREE.MeshLambertMaterial({color:0x8996a4,emissive:0x333a42});
  for(const ci of z.cores){const t=tiles[ci];const g=new THREE.Group();g.position.set(t.x,t.h+PT,t.z);
   g.add(P(G.hex,DARK,0.7,0.2,0.7,0,0.1,0),P(G.cyl,MID,0.12,1.4,0.12,0,0.8,0),P(G.oct,z.mat,0.45,0.6,0.45,0,1.75,0));g.userData.spin=g.children[2];world.add(g);z.pyl=(z.pyl||[]).concat(g)}
 });
 buildAmbient();
 zones.forEach(z=>(z.pyl||[]).forEach(g=>g.visible=false));
 paintTiles();
}

