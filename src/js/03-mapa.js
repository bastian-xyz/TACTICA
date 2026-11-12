// ================= MAP =================
function genMap(seed){
 for(let att=0;att<60;att++){
  R=rnd32(seed+att*7919);
  tiles=[];zones=[];
  for(let r=0;r<H;r++)for(let c=0;c<W;c++){
   tiles.push({i:tiles.length,c,r,q:c-((r-(r&1))>>1),x:SQ3*(c+0.5*(r&1))-CX,z:1.5*r-CZ,type:'grass',amt:0,h:0.25,v:R(),zone:-1,bld:null,gu:null,au:null,nb:[],crys:null});
  }
  for(const t of tiles)for(const[dq,dr]of DIRS){const nq=t.q+dq,nr=t.r+dr;if(nr<0||nr>=H)continue;const j=idx(nq+((nr-(nr&1))>>1),nr);if(j>=0)t.nb.push(j)}
  HQP=idx(6,H-6);HQC=mirror(HQP);BASP=[];BASC=BASP.map(mirror);
  const fair=tiles.filter(t=>Math.abs(hd(t.i,HQP)-hd(t.i,HQC))<=1);
  const pick=f=>fair.reduce((b,t)=>f(t)<f(b)?t:b);
  const wc=pick(t=>Math.abs(t.c-2)*2+Math.abs(t.r-(H/2-0.5))+(t.c<1?9:0));
  const cc=pick(t=>Math.abs(t.c-(W/2-0.5))+Math.abs(t.r-(H/2-0.5)));
  const mk=(type,cores)=>{const s=new Set();cores.forEach(ci=>{s.add(ci);tiles[ci].nb.forEach(n=>s.add(n))});const z={type,cores,tiles:[...s],own:-1,cap:0,mat:null,lmat:null};z.tiles.forEach(i=>{if(tiles[i].zone<0)tiles[i].zone=zones.length});zones.push(z)};
  mk('cannon',[wc.i]);mk('patrol',[mirror(wc.i)]);mk('missile',[cc.i,mirror(cc.i)]);
  {const bl=[];const GP=PL.gen;for(let k=0;k<GP.blobs;k++){const bx=(R()*2-1)*CX,bz=(R()*2-1)*CZ,sg=GP.sg0+R()*GP.sgR,am=(R()<0.35?-1:1)*(0.7+R()*0.7);bl.push([bx,bz,sg,am],[-bx,-bz,sg,am])}
   const f=tiles.map(t=>{let v=0;for(const[bx,bz,sg,am]of bl)v+=am*Math.exp(-((t.x-bx)**2+(t.z-bz)**2)/(sg*sg));return v});
   const mn=Math.min(...f),mx=Math.max(...f);
   tiles.forEach((t,i)=>{t.lv=clamp(Math.floor((f[i]-mn)/(mx-mn+1e-6)*5),0,4);t.ramp=false;t.rampMesh=null});
   for(let it=0;it<GP.smooth;it++){const nl=tiles.map(t=>{const cnt=[0,0,0,0,0];cnt[t.lv]+=2;t.nb.forEach(n=>cnt[tiles[n].lv]++);let b=t.lv;for(let k=0;k<5;k++)if(cnt[k]>cnt[b])b=k;return b});tiles.forEach((t,i)=>t.lv=nl[i])}
   const flat=(c,r,lv)=>{for(const t of tiles)if(hd(t.i,c)<=r){t.lv=lv;tiles[mirror(t.i)].lv=lv}};
   flat(HQP,3,1);BASP.forEach(b=>flat(b,1,1));
   zones.forEach(z=>{const lv=z.type==='missile'?3:2;z.tiles.forEach(i=>{tiles[i].lv=lv;tiles[mirror(i)].lv=lv})});}
  const LP=[[2,H-3],[3,H-3],[2,H-2],[14,H-3],[15,H-3],[15,H-4],[4,H-14],[5,H-14],[4,H-15],[19,H-11],[20,H-11],[19,H-12],[11,H-21],[12,H-21],[11,H-22],[29,H-5],[30,H-5],[29,H-4]];
  {const near=tiles.filter(t=>hd(t.i,HQP)===2&&t.zone<0).sort((a,b)=>(a.c+(H-a.r))-(b.c+(H-b.r))).slice(0,3);for(const t of near)for(const i of[t.i,mirror(t.i)]){tiles[i].type='litio';tiles[i].amt=900}}
  for(const[c,r]of LP){const a=idx(c,r);for(const i of[a,mirror(a)]){const t=tiles[i];if(t.zone<0&&![HQP,HQC,...BASP,...BASC].includes(i)){t.type='litio';t.amt=900}}}
  const keyT=[HQP,HQC,...BASP,...BASC];
  // ---- river + lake + ford (one per side, mirrored)
  {const special=i=>{const t=tiles[i];return t.type!=='grass'||t.zone>=0||keyT.some(k=>hd(i,k)<=2)};
   let c=0,r=Math.floor(H/2)+2+Math.floor(R()*4),g=0;const path=[];
   while(c<W/2-1&&g++<200){const i=idx(c,r);if(i<0||special(i))break;if(!path.includes(i))path.push(i);if(R()<0.7)c++;else r=clamp(r+(R()<0.5?-1:1),Math.floor(H/2)+1,H-7)}
   if(path.length>4){
    const last=path[path.length-1];const wat=new Set([...path,last,...tiles[last].nb.filter(n=>!special(n)&&R()<0.75)]);
    const ford=path[Math.floor(path.length*(0.35+R()*0.3))];
    for(const i of wat)for(const j of[i,mirror(i)]){tiles[j].type=i===ford?'ford':'water';tiles[j].lv=0}
    for(const i of wat)for(const j of[i,mirror(i)])for(const n of tiles[j].nb){const t=tiles[n];if(t.type==='grass'&&t.zone<0&&t.lv>1&&!keyT.some(k=>hd(n,k)<=3))t.lv=1}
   }}
  // ---- lagos extra según el planeta (simétricos)
  for(let L=0;L<(PL.gen.lakes||0);L++){const sp=i=>{const t=tiles[i];return t.type!=='grass'||t.zone>=0||keyT.some(k=>hd(i,k)<=3)};
   const cs=tiles.filter(t=>t.r>=H/2&&t.r<H-2&&t.c>2&&t.c<W-3&&!sp(t.i)&&t.nb.every(n=>!sp(n)));if(!cs.length)break;
   const c0=cs[Math.floor(R()*cs.length)],set=[c0.i,...c0.nb.filter(()=>R()<0.55)];
   for(const i of set)for(const j of[i,mirror(i)]){tiles[j].type='water';tiles[j].lv=0}
   for(const i of set)for(const j of[i,mirror(i)])for(const n of tiles[j].nb){const t=tiles[n];if(t.type==='grass'&&t.zone<0&&t.lv>1&&!keyT.some(k=>hd(n,k)<=3))t.lv=Math.max(1,t.lv-1)}}
  const keys=[...keyT];tiles.forEach(t=>{if(t.type==='litio'||t.zone>=0)keys.push(t.i)});
  const near=(i,d)=>keys.some(k=>hd(i,k)<=d);
  const ok=i=>{const t=tiles[i];return t.type==='grass'&&t.zone<0&&!near(i,1)&&hd(i,HQP)>3&&hd(i,HQC)>3};
  const setRock=i=>{for(const j of[i,mirror(i)])tiles[j].type='rock'};
  for(const t of tiles){
   if(t.r<H/2||!ok(t.i))continue;
   if(R()<PL.gen.rocks){setRock(t.i);if(R()<PL.gen.rockPair){const n=t.nb[Math.floor(R()*t.nb.length)];if(ok(n))setRock(n)}}
  }
  // ---- aldeas nativas: 2 casillas bloqueadas por aldea, simétricas
  VILS=[];
  {const okV=t=>t.type==='grass'&&t.zone<0&&!t.ramp&&hd(t.i,HQP)>=6&&hd(t.i,HQC)>=6&&!keys.some(k=>hd(t.i,k)<=2)&&t.nb.length===6&&t.nb.every(n=>tiles[n].type==='grass'&&tiles[n].lv===t.lv&&tiles[n].zone<0&&!tiles[n].vil);
   for(let v=0;v<(PL.gen.villages||0);v++){const cs=tiles.filter(t=>t.r>=H/2&&okV(t)&&VILS.every(o=>hd(o.c,t.i)>=8));if(!cs.length)break;const t=cs[Math.floor(R()*cs.length)];
    const n2=t.nb[Math.floor(R()*6)];for(const i of[t.i,n2])for(const j of[i,mirror(i)]){tiles[j].type='rock';tiles[j].vil=true}
    VILS.push({c:t.i,t:[t.i,n2]},{c:mirror(t.i),t:[mirror(t.i),mirror(n2)]})}}
  // ---- ramps until every walkable tile is reachable, then a few extra routes
  const walk=i=>tiles[i].type!=='rock'&&tiles[i].type!=='water'&&tiles[i].type!=='litio';
  const comp=()=>{const S=new Set([HQP]),st=[HQP];while(st.length){const c=st.pop();for(const n of tiles[c].nb)if(!S.has(n)&&walk(n)&&canStep(c,n)){S.add(n);st.push(n)}}return S};
  const setRamp=i=>{for(const j of[i,mirror(i)])tiles[j].ramp=true};
  const goodRamp=i=>{const t=tiles[i];return t.type==='grass'&&t.zone<0&&!keyT.some(k=>hd(i,k)<=1)&&!t.nb.some(n=>tiles[n].ramp)};
  let okMap=false;
  for(let it=0;it<400;it++){
   const S=comp();
   if(tiles.every(t=>!walk(t.i)||S.has(t.i))){okMap=true;break}
   const cand=[],cand2=[],flatc=[];
   for(const a of S)for(const b of tiles[a].nb){
    if(S.has(b)||!walk(b))continue;const A=tiles[a],B=tiles[b];
    if(Math.abs(A.lv-B.lv)===1){const lo=A.lv<B.lv?a:b;(goodRamp(lo)?cand:cand2).push(lo)}else flatc.push([a,b]);
   }
   if(cand.length)setRamp(cand[Math.floor(R()*cand.length)]);
   else if(cand2.length)setRamp(cand2[Math.floor(R()*cand2.length)]);
   else if(flatc.length){const[a,b]=flatc[Math.floor(R()*flatc.length)];const lv=tiles[a].lv+Math.sign(tiles[b].lv-tiles[a].lv);for(const j of[b,mirror(b)])tiles[j].lv=lv}
   else break;
  }
  if(!okMap)continue;
  for(let k=0;k<16;k++){
   const c=[];for(const t of tiles){if(!goodRamp(t.i)||t.ramp)continue;if(t.nb.some(n=>walk(n)&&tiles[n].lv===t.lv+1))c.push(t.i)}
   if(c.length)setRamp(c[Math.floor(R()*c.length)]);
  }
  {const bl=[];for(let k=0;k<9;k++){const bx=(R()*2-1)*CX,bz=(R()*2-1)*CZ,sg=2.5+R()*4,am=R()<0.5?-1:1;bl.push([bx,bz,sg,am],[-bx,-bz,sg,am])}
   for(const t of tiles){let n=0;for(const[bx,bz,sg,am]of bl)n+=am*Math.exp(-((t.x-bx)**2+(t.z-bz)**2)/(sg*sg));
    const wet=t.nb.some(j=>tiles[j].type==='water'||tiles[j].type==='ford');
    t.surf=t.ramp?'dirt':wet?'grass':(t.lv>=4&&n>-0.2||(t.lv>=3&&n>0.55))?'stone':n<-0.35?'dirt':'grass';
    if(keyT.some(k=>hd(t.i,k)<=1)||t.vil)t.surf='dirt'}}
  tiles.forEach(t=>{t.base=t.type==='water'?0.12:t.type==='ford'?0.17:0.25+t.lv*LV;t.h=t.base+(t.ramp?LV/2:0);if(t.type==='rock'&&!t.vil)t.h=t.base+0.7+t.v*0.7});
  return;
 }
}

