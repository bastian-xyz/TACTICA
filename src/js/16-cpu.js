// ================= AI =================
function aiThink(){
 const me=1,B=aliveOf(me,'b'),U=aliveOf(me,'u');
 const hq=B.find(b=>b.type==='hq')||B[0];if(!hq)return;
 const cnt=t=>B.filter(b=>b.type===t).length;
 const spots=k=>tiles.filter(t=>canPlace(me,k,t.i)).map(t=>t.i);
 let want=null;
 const canX=tiles.some(t=>t.type==='litio'&&t.amt>0&&!t.bld&&terr(me).has(t.i));
 if(cnt('extractor')<1&&canX)want='extractor';
 else if(cnt('barracks')<1)want='barracks';
 else if(AI.early&&cnt('turret')<1&&gameTime>25)want='turret';
 else if(canX&&cnt('extractor')<AI.prof.ext+(HARD()?3:1))want='extractor';
 else if(cnt('helipad')<1&&gameTime>AI.prof.heli*(HARD()?0.7:1)&&money[me]>200)want='helipad';
 else if(cnt('ialab')<1&&gameTime>AI.prof.lab*(HARD()?0.7:1)&&money[me]>300)want='ialab';
 else if(cnt('factory')<1&&U.length>=2)want='factory';
 else if(cnt('helipad')<1&&cnt('factory')>=1&&gameTime>170)want='helipad';
 else if(cnt('ialab')<1&&cnt('factory')>=1&&(gameTime>(HARD()?140:230)||aliveOf(0,'u').some(u=>UD[u.type].cls==='mec')))want='ialab';
 else if(cnt('extractor')<AI.prof.ext&&tiles.some(t=>t.type==='litio'&&t.amt>0&&!t.bld&&terr(me).has(t.i)))want='extractor';
 else if(cnt('turret')<Math.min(4,1+Math.floor(gameTime/150)))want='turret';
 else if(cnt('barracks')<2&&gameTime>240)want='barracks';
 else if(cnt('factory')<2&&gameTime>360)want='factory';
 if(want&&money[me]>=costOf(me,want)){
  const sp=spots(want);
  if(sp.length){
   let best=-1,bs=1e9;
   for(const i of sp){
    let s;
    if(want==='extractor')s=hd(i,hq.tile);
    else if(want==='turret')s=hd(i,HQP)+Math.random()*3;
    else{const adj=tiles[i].nb.filter(n=>tiles[n].bld).length;s=Math.abs(hd(i,hq.tile)-2)+adj*2+Math.random()*2}
    if(s<bs){bs=s;best=i}
   }
   place(me,want,best);want=null;
  }else want=null;
 }
 const reserve=want?costOf(me,want):0;
 // units
 for(let g=0;g<(HARD()?6:3);g++){
  const pick=aiPickUnit();if(!pick)break;
  if(money[me]-UD[pick].cost<reserve*0.6)break;
  const sp=spots(pick);if(!sp.length)break;
  let best=sp[0];for(const i of sp)if(hd(i,HQP)<hd(best,HQP))best=i;
  place(me,pick,best);
 }
 {const lv=hq.lvl||1;if(hq.type==='hq'&&lv<3&&money[me]>BASEUP[lv]+(unitCount(me)>=capOf(me)-1?60:260))upgradeB(hq)}
 // powers
 for(const k in SUP)if(k!=='sat'&&charge[me][k]>=1){const tg=aiPowerTarget(k);if(tg>=0)usePower(me,k,tg)}
 // army
 const army=U.filter(u=>u.spawn<=0&&!u.free);
 // retirada: tropas dañadas vuelven a reparar junto al Centro de Control
 for(const u of army){if(u.hp<u.max*0.3&&!u.retreat&&distTo(u.tile,hq)>2){u.retreat=true;orderMove([u],hq.tile)}else if(u.retreat&&u.hp>u.max*0.85)u.retreat=false}
 const fit=army.filter(u=>!u.retreat);
 const foesU=aliveOf(0,'u').filter(u=>u.spawn<=0);
 const threats=foesU.filter(e=>B.some(b=>distTo(e.tile,b)<=5));
 if(AI.obs&&!AI.obs.rush&&threats.filter(e=>distTo(e.tile,hq)<=7).length>=2)AI.obs.rush=gameTime;
 if(threats.length){const tv=armyVal(threats);AI.def=true;
  // apoyos defensivos sobre el atacante
  if(charge[me].cannon>=1&&tv>150){const t=threats.reduce((a,b)=>b.hp>a.hp?b:a);usePower(me,'cannon',t.tile)}
  if(charge[me].missile>=1&&tv>500){const t=threats[Math.floor(threats.length/2)],ph=pwrHQ(0);if(!(ph&&!mslUsed[0]&&charge[0].missile>=1&&hd(t.tile,ph.tile)<=INTR))usePower(me,'missile',t.tile)}
  for(const u of fit)if(!u.focus||u.auto){const t=threats.reduce((a,b)=>{const sa=distTo(u.tile,a)+(a.hp/a.max)-(UD[u.type].atk.vs[clsOf(a)]>=1.3?1:0),sb=distTo(u.tile,b)+(b.hp/b.max)-(UD[u.type].atk.vs[clsOf(b)]>=1.3?1:0);return sb<sa?b:a});orderAttack([u],t)}
  return}
 const idle=u=>!u.path.length&&!u.focus&&u.next<0;
 let punish=false;if(AI.def){AI.def=false;if(!AI.attacking&&fit.length>=3&&armyVal(fit)>armyVal(foesU)*0.8)punish=true}
 if(gameTime-AI.expT>(HARD()?28:45)&&army.length>=3&&cnt('extractor')>=1&&!AI.attacking){
  const lt=tiles.filter(t=>t.type==='litio'&&t.amt>0&&!t.bld&&!terr(me).has(t.i)).sort((a,b)=>hd(a.i,hq.tile)-hd(b.i,hq.tile))[0];
  if(lt){AI.expT=gameTime;const g=lt.nb.find(n=>tiles[n].type==='grass'&&passable(n,false))??lt.i;const two=army.filter(idle).slice(0,3);AI.expU=new Set(two);orderMove(two,g)}
 }
 if(AI.attacking){
  const near=foesU.filter(e=>fit.some(u=>hd(u.tile,e.tile)<=4));
  if(fit.length<3||armyVal(fit)<armyVal(near)*0.6){AI.attacking=false;AI.fail++;AI.lastAtk=gameTime;AI.wave=Math.max(3,AI.prof.wave[0]-(HARD()?1:0)-Math.min(2,AI.fail));orderMove(fit,hq.tile);return}
  else{
   const tb=keyTarget(army[0].tile);
   if(tb){const id=army.filter(idle);if(id.length)orderMove(id,tb.tile)}
  }
  return;
 }
 const myV=armyVal(fit),hisV=armyVal(foesU);
 const ratio=(HARD()?1.05:1.25)*Math.max(0.72,1-0.09*(AI.fail||0)),idleT=gameTime-(AI.lastAtk||0);
 const harass=!punish&&gameTime>AI.atkT&&idleT>(HARD()?65:100)&&fit.length>=4&&myV>hisV*0.65;
 if(punish||harass||(fit.length>=AI.wave&&gameTime>AI.atkT&&myV>hisV*ratio)){
  AI.attacking=true;AI.lastAtk=gameTime;if(!punish&&!harass)AI.wave=Math.min(14,AI.wave+1);
  const pb=aliveOf(0,'b'),eco=pb.filter(b=>b.type==='extractor'&&!pb.some(t=>t.type==='turret'&&hd(t.tile,b.tile)<=3)),tb=(eco.length&&(harass||myV<hisV*1.6))?eco.sort((a,b)=>hd(a.tile,hq.tile)-hd(b.tile,hq.tile))[0]:keyTarget(hq.tile);
  if(tb){const split=army.length>=6&&aliveOf(0,'b').some(b=>(b.type==='turret'||b.type==='hq')&&hd(b.tile,tb.tile)<=4);
   if(split){const half=army.slice(0,Math.ceil(army.length/2)),rest=army.slice(half.length);orderMove(half,tb.tile);
    const t=tiles[tb.tile],ang=Math.random()*6.28,fx=t.x+Math.cos(ang)*8,fz=t.z+Math.sin(ang)*8;let wp=hexAt(clamp(fx,-CX,CX),clamp(fz,-CZ,CZ));if(wp<0)wp=tb.tile;orderMove(rest,wp);for(const u of rest)u.wps=[tb.tile]}
   else orderMove(army,tb.tile)}
  return;
 }
 // contest zones or rally
 let rally;
 const zp={missile:-6,cannon:-2,patrol:0};const nz=zones.filter(z=>z.own!==me).sort((a,b)=>hd(a.cores[0],hq.tile)+zp[a.type]-hd(b.cores[0],hq.tile)-zp[b.type])[0];
 if(nz&&fit.length>=3)rally=nz.cores[0];
 else{rally=hq.tile;for(let k=0;k<4;k++){const n=tiles[rally].nb.reduce((b,x)=>hd(x,HQP)<hd(b,HQP)?x:b);rally=n}}
 const exp=gameTime-AI.expT<35;
 {const hg=tiles.filter(t=>hd(t.i,rally)<=2&&passable(t.i,false)&&t.type!=='water').sort((a,b)=>b.lv-a.lv)[0];if(hg)rally=hg.i}
 const gather=fit.filter(u=>idle(u)&&hd(u.tile,rally)>2&&!(exp&&AI.expU.has(u)));
 if(gather.length)orderMove(gather,rally);
}
const AIMEM={get(){const m=store.get('ai',null)||{};return Object.assign({n:0,w:0,mix:{inf:0.25,veh:0.25,air:0.25,mec:0.25},rush:0,pr:{}},m)},set(m){store.set('ai',m)}};
const CLSN={inf:'infantería',veh:'blindados',air:'aéreos',mec:'mechas'};
function aiLearn(aiWin){if(!AI.obs||AI.learned)return'';AI.learned=1;const m=AIMEM.get(),o=AI.obs,tot=Object.values(o.mix).reduce((a,b)=>a+b,0);
 if(tot>0){const a=m.n?0.35:1;for(const c in m.mix)m.mix[c]=m.mix[c]*(1-a)+(o.mix[c]||0)/tot*a}
 if(o.rush)m.rush=m.rush?m.rush*0.65+o.rush*0.35:o.rush;
 const p=m.pr[AI.pk]||(m.pr[AI.pk]={n:0,w:0});p.n++;p.w+=aiWin?1:0;m.n++;m.w+=aiWin?1:0;AIMEM.set(m);
 const top=Object.keys(m.mix).sort((a,b)=>m.mix[b]-m.mix[a])[0];
 return 'La CPU aprendió: usas mucho '+CLSN[top]+(m.rush&&m.rush<150?' y atacas temprano':'')+' · '+m.n+' partida'+(m.n>1?'s':'')+' en su memoria'}
const AIPROF={
 asalto:{n:'Asalto',atk:90,wave:[5,7],ext:4,heli:200,lab:260,fav:['rifle','buggy','flamer','commando','grenadier','apc']},
 blindado:{n:'Blindado',atk:140,wave:[6,9],ext:5,heli:260,lab:220,fav:['tank','artillery','mlrs','apc','aa','mech']},
 aereo:{n:'Aéreo',atk:120,wave:[5,8],ext:5,heli:80,lab:300,fav:['drone','heli','gunship','fighter','bomber','scout']},
 robotico:{n:'Robótico',atk:150,wave:[5,8],ext:5,heli:300,lab:120,fav:['android','spider','mech','sentinel','swarm','titan']},
 economico:{n:'Económico',atk:200,wave:[8,12],ext:7,heli:200,lab:200,fav:['rifle','tank','aa','heli','mech','sniper']}};
const rr=a=>a[Math.floor(Math.random()*a.length)];
const COUNTER={inf:['flamer','buggy','rifle','gunship','grenadier'],veh:['rocket','tank','mlrs','drone'],air:['aa','sentinel','fighter','rocket'],mec:['mech','mlrs','rocket']};
function aiSetup(){
 const mem=AIMEM.get();AI.mem=mem;AI.obs={mix:{inf:0,veh:0,air:0,mec:0},rush:0};AI.perf={};AI.fail=0;AI.lastAtk=0;AI.def=false;AI.learned=0;
 const mix={inf:0,veh:0,air:0,mec:0};for(const k of DECK)mix[UD[k].cls]++;
 if(mem.n){const wt=Math.min(4,1+mem.n*0.5);for(const c in mix)mix[c]+=mem.mix[c]*wt}
 AI.early=mem.rush>0&&mem.rush<150;
 const deck=[];const add=k=>{if(UD[k]&&!deck.includes(k)&&(k!=='titan'||HARD()))deck.push(k)};
 for(const c of Object.keys(mix).sort((a,b)=>mix[b]-mix[a]))if(mix[c])for(const k of COUNTER[c].slice(0,mix[c]>=2?2:1))add(k);
 for(const k of['tank','rifle','heli','android','aa','mech'])if(deck.length<6)add(k);
 AI.deck=deck.slice(0,8);
 let bp=null,bo=-1e9;const N=Object.values(mem.pr).reduce((a,p)=>a+p.n,0);
 for(const k in AIPROF){let o=AI.deck.filter(u=>AIPROF[k].fav.includes(u)).length;const p=mem.pr[k];
  o+=p?((p.w+1)/(p.n+2)-0.5)*4+Math.sqrt(2*Math.log(N+1)/(p.n+1))*0.8:0.8;o+=Math.random()*0.3;if(o>bo){bo=o;bp=k}}
 AI.prof=AIPROF[bp];AI.pk=bp;AI.wave=AI.prof.wave[0]-(HARD()?1:0);AI.atkT=AI.prof.atk*(HARD()?0.7:1);
}
const armyVal=us=>us.reduce((a,u)=>a+UD[u.type].cost*(u.hp/u.max),0);
function keyTarget(from){const k=aliveOf(0,'b').filter(b=>BD[b.type].key);const pool=k.length?k:aliveOf(0,'b');return pool.sort((a,b)=>hd(a.tile,from)-hd(b.tile,from))[0]}
function aiPickUnit(){
 const me=1;
 const opts=AI.deck.filter(k=>producers(me,UD[k].req).length&&unitCount(me)+UD[k].pob<=capOf(me));
 if(!opts.length)return null;
 const comp={inf:0,veh:0,air:0,mec:0};
 aliveOf(0,'u').forEach(u=>comp[UD[u.type].cls]+=UD[u.type].cost);if(AI.mem&&AI.mem.n)for(const c in comp)comp[c]+=AI.mem.mix[c]*Math.max(0,300-gameTime);
 const w={android:0.7,mech:0.5,artillery:0.35,sniper:0.5,rifle:1,rocket:0.8,buggy:1,tank:1,aa:0.15,drone:0.6,heli:0.6,sniper:0.5,grenadier:0.6,artillery:0.4,fighter:0.2,bomber:0.3};
 w.aa+=comp.air/90;w.rocket+=comp.air/160+comp.veh/110;w.tank+=comp.veh/150;w.drone+=comp.veh/180;w.mech=(w.mech||0.5)+comp.mec/110;w.rocket+=comp.mec/260;w.mlrs=(w.mlrs||0.3)+comp.mec/200+comp.veh/250;w.titan=(w.titan||0.25)+comp.inf/400;w.sentinel=(w.sentinel||0.2)+comp.air/120;w.heli+=comp.veh/200+comp.inf/220;w.buggy+=comp.inf/90;w.rifle+=comp.inf/130;
 for(const k of opts){w[k]=(w[k]||0.6)*(AI.prof.fav.includes(k)?1.4:1);const P=AI.perf&&AI.perf[k];if(P&&P.d+P.l>250)w[k]*=clamp((P.d+150)/(P.l+150),0.35,2.2)}
 let tot=0;opts.forEach(k=>tot+=w[k]);let r=Math.random()*tot;
 for(const k of opts){r-=w[k];if(r<=0)return money[me]>=UD[k].cost?k:null}
 return null;
}
function aiPowerTarget(k){
 const foes=aliveOf(0);if(!foes.length)return -1;
 if(k==='patrol'){const z=zones.filter(z=>z.own!==1).sort((a,b)=>Math.abs(a.cap)-Math.abs(b.cap))[0];return z?z.cores[0]:foes[0].tile}
 let best=-1,bs=0;const ph=pwrHQ(0),pint=k==='missile'&&ph&&!mslUsed[0]&&pwrUnlocked(0,'missile')&&charge[0].missile>=0.9;
 for(const f of foes){if(pint&&hd(f.tile,ph.tile)<=INTR)continue;
  let s=0;for(const g of foes){if(hd(f.tile,g.tile)<=(k==='sat'?1:2))s+=g.kind==='b'?(BD[g.type].key?400:BD[g.type].cost):UD[g.type].cost}
  if(s>bs){bs=s;best=f.tile}
 }
 return bs>=(k==='missile'?(HARD()?220:350):(HARD()?120:200))?best:-1;
}

