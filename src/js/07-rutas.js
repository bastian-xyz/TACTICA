// ================= PATHING =================
function astar(start,goal,air,avoid,self){
 if(start===goal)return[];
 const N=tiles.length,g=new Float64Array(N).fill(1e9),came=new Int32Array(N).fill(-1),closed=new Uint8Array(N);
 const S=tiles[start],Gt=tiles[goal],dx=Gt.x-S.x,dz=Gt.z-S.z,dl=Math.hypot(dx,dz)||1;
 // heurística: distancia hexagonal + desempate por desvío de la línea recta (rutas más derechas)
 const hf=n=>{const t=tiles[n];return hd(n,goal)*1.001+Math.abs((t.x-S.x)*dz-(t.z-S.z)*dx)/dl*0.002};
 const heap=[],push=(n,f)=>{heap.push([f,n]);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=heap[i][0])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p}},
  pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){const l=i*2+1,r=l+1;let m=i;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m}}return top[1]};
 g[start]=0;push(start,hf(start));let best=start,bh=hd(start,goal),it=0;
 while(heap.length&&it++<20000){
  const cur=pop();if(closed[cur])continue;closed[cur]=1;
  if(cur===goal){best=cur;break}
  const h=hd(cur,goal);if(h<bh||(h===bh&&g[cur]<g[best])){bh=h;best=cur}
  for(const n of tiles[cur].nb){
   if(closed[n]||!passable(n,air)||(!air&&!canStep(cur,n,self)))continue;
   let cost=1;
   if(!air&&(tiles[n].ramp||tiles[cur].ramp))cost+=0.08;
   if(avoid){const o=occ(n,air);if(o&&o!==self)cost+=(o.next<0&&!o.path.length)?(o.team===self?.team?2.5:6):0.8}
   const ng=g[cur]+cost;
   if(ng<g[n]){g[n]=ng;came[n]=cur;push(n,ng+hf(n))}
  }
 }
 if(best===start)return null;
 const p=[];let c=best;while(c!==start&&c>=0){p.push(c);c=came[c]}return p.reverse();
}
function stepAside(o,from){ // la tropa propia quieta se corre a una casilla libre
 if(o.next>=0||o.path.length||o.focus||o.spawn>0||o.stun>0)return false;const air=isAir(o);
 const c=tiles[o.tile].nb.filter(n=>n!==from&&passable(n,air)&&!occ(n,air)&&(air||canStep(o.tile,n,o)));if(!c.length)return false;
 const n=c[Math.floor(Math.random()*c.length)];setOcc(n,air,o);o.next=n;o.mt=0.0001;o.post=n;return true;
}
function nearestFree(goal,air,self,used){
 const seen=new Set([goal]),q=[goal];
 for(let h=0;h<q.length;h++){
  const c=q[h];const o=occ(c,air);
  if(passable(c,air)&&(!o||o===self)&&!(used&&used.has(c*2+(air?1:0))))return c;
  for(const n of tiles[c].nb)if(!seen.has(n)){seen.add(n);q.push(n)}
 }
 return -1;
}
function orderMove(us,goal){
 const used=new Set();
 us=us.filter(u=>!u.dead).sort((a,b)=>hd(a.tile,goal)-hd(b.tile,goal));
 for(const u of us){
  const air=isAir(u);const d=nearestFree(goal,air,u,used);if(d<0)continue;used.add(d*2+(air?1:0));
  u.dest=d;u.post=d;u.focus=null;u.auto=false;u.ordered=true;
  let pa=astar(u.next>=0?u.next:u.tile,d,air,false,u);
  // a medio paso: si el camino más corto es hacia atrás, da la vuelta ahí mismo en vez de terminar el paso
  if(u.next>=0&&u.mt<1&&occ(u.tile,air)===u&&u.pass!==u.next&&!u.knock&&!u.fly&&!u.carry){const pb=d===u.tile?[]:astar(u.tile,d,air,false,u),ca=pa?pa.length+(1-u.mt):1e9,cb=pb?pb.length+u.mt:1e9;
   if(cb<ca-0.01){const t0=u.tile;u.tile=u.next;u.next=t0;u.mt=Math.max(0.0001,1-u.mt);pa=pb}}
  u.path=pa||[];
 }
}
function orderAttack(us,t){for(const u of us){if(u.dead)continue;if(!udOf(u).atk.vs[clsOf(t)]){orderMove([u],t.tile);continue}u.focus=t;u.auto=false;u.ordered=false;u.dest=-1;u.path=[];u.rp=0}}
function approachTile(u,t){
 const air=isAir(u),rng=udOf(u).atk.rng;let best=-1,bd=1e9;
 for(const tl of tiles){const d=distTo(tl.i,t);if(d>rng||!passable(tl.i,air))continue;const o=occ(tl.i,air);if(o&&o!==u)continue;const du=hd(u.tile,tl.i);if(du<bd){bd=du;best=tl.i}}
 return best>=0?best:nearestFree(t.tile,air,u,null);
}

