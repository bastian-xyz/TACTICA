// ================= STATE =================
const rnd32=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
let R=Math.random;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const idx=(c,r)=>(c<0||r<0||c>=W||r>=H)?-1:r*W+c;
let VILS=[],BOOMS=[];let tiles=[],zones=[],ents=[],fx=[],strikes=[],nextId=1,HQP=-1,HQC=-1,BASP=[],BASC=[];
let money=[0,0],charge=[{},{}];
let FL=1; // 1 normal · -1 vista girada 180° (el invitado ve su base abajo)
const NET={on:false,role:'',lobby:null,R:null,opp:null,host:null,code:'',gid:0,seq:0,pend:[],done:[],ak:[],map:new Map(),gone:new Set(),evSeen:new Set(),evq:[],evId:0,buf:{},frame:0,lastFull:0,lastSnap:0,snapT:0,synced:false,wait:false,auth:false,hostGone:false,goneT:0,oppN:'',oppSp:0};
let vis=new Uint8Array(0),expl=new Uint8Array(0),revealT=0,fogT=0;
const visE=e=>e.team===0||vis[e.tile]||(e.kind==='b'&&e.seen);
let gameTime=0,paused=true,over=false,started=false,shake=0;
const sel=new Set();let selCard=null;
const AI={t:2,wave:8,attacking:false,expT:-99,expU:new Set()};

const ROUGH={0:['titan','mech','buggy'],2:['tank','buggy','artillery','mech','sentinel','titan']};
const teamSp=t=>t===0?(CFG.species||0):FOESP;
const rough=u=>!!(u&&u.kind==='u'&&(ROUGH[teamSp(u.team)]||ROUGH[0]).includes(u.type));
function canStep(a,b,u){const A=tiles[a],B=tiles[b];if(A.lv===B.lv)return true;if(u&&UD[u.type]&&UD[u.type].climb)return true;if(rough(u)&&Math.abs(A.lv-B.lv)<=1)return true;if(B.lv===A.lv+1)return !!A.ramp;if(A.lv===B.lv+1)return !!B.ramp;return false}
function hd(a,b){const A=tiles[a],B=tiles[b];const dq=A.q-B.q,dr=A.r-B.r;return(Math.abs(dq)+Math.abs(dr)+Math.abs(dq+dr))/2}
const mirror=i=>{const t=tiles[i];return idx(W-1-t.c,H-1-t.r)};

