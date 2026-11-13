// ================= CONFIG =================
const MAPGEN=3; // versión del generador: las partidas guardadas con otra no se pueden continuar
const LV=0.68,SQ3=Math.sqrt(3);
// Tamaños de mapa (casillas). El mapa se dimensiona en cada partida con setMapSize().
const SIZES={p:{n:'Pequeño',w:46,h:26,d:'Partidas cortas'},m:{n:'Mediano',w:58,h:32,d:'Estándar'},g:{n:'Gigante',w:72,h:40,d:'Partidas largas'}};
let MSZ='m',W=58,H=32,CX=SQ3*(W-0.5)/2,CZ=1.5*(H-1)/2;
function setMapSize(k){MSZ=SIZES[k]?k:'m';W=SIZES[MSZ].w;H=SIZES[MSZ].h;CX=SQ3*(W-0.5)/2;CZ=1.5*(H-1)/2;Object.assign(bounds,{x0:-CX-1,x1:CX+1,z0:-CZ-1,z1:CZ+1});applyWide()}
// Formas de mapa: una figura grande (m) que se suma al relieve al generar. u y v van de −1 a 1 (ancho y alto del mapa)
// y la figura debe ser igual en (u,v) y (−u,−v) para que el mapa quede parejo para los dos lados.
const SHAPES={
 var:{n:'Variado',d:'Relieve libre: terrazas, mesetas y hondonadas repartidas.'},
 llano:{d:'Casi todo llano y abierto, con pocos accidentes. Manda la movilidad.',bk:0.7,q:[0.05,0.48,0.35,0.09,0.03]},
 valle:{d:'Un valle bajo une las dos bases en diagonal, flanqueado por tierras altas.',amp:1.9,m:(u,v)=>Math.min(1,Math.abs(u+v)/1.1)},
 meseta:{d:'Una gran meseta domina el centro: quien la toma ve y dispara más lejos.',amp:2.1,m:(u,v)=>Math.exp(-(u*u+v*v*1.3)/0.2)},
 cuenca:{d:'Una hondonada en el centro rodeada por un anillo de altura.',amp:2.1,lk:1.5,m:(u,v)=>{const r=Math.hypot(u,v);return -Math.exp(-r*r/0.11)+0.75*Math.exp(-((r-0.6)**2)/0.03)}},
 cordillera:{d:'Una cadena de cumbres separa las dos mitades; se cruza por los pasos.',amp:2.3,m:(u,v)=>Math.exp(-((u-v)**2)/0.09)*(0.45+0.55*Math.cos((u+v)*5))},
 lagos:{d:'Terreno bajo salpicado de lagos que cortan el paso por tierra.',lk:3.5,bk:0.85,q:[0.12,0.42,0.30,0.11,0.05]}
};
let MSH='var';
const shapesOf=pk=>(PLANETS[pk]&&PLANETS[pk].shapes)||[];
const shapeFor=(pk,k)=>shapesOf(pk).some(s=>s[0]===k)&&SHAPES[k]?k:'var';
const shapeName=(pk,k)=>{const s=shapesOf(pk).find(s=>s[0]===k);return s?s[1]:SHAPES.var.n};
const DIRS=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
const TC=[0x2ad4ff,0xff7a2a],TCS=['#2ad4ff','#ff7a2a'];
const CAP=40;const baseLvl=tm=>{const h=ents.find(e=>!e.dead&&e.kind==='b'&&e.type==='hq'&&e.team===tm);return h?(h.lvl||1):1};const capOf=tm=>POPCAP[baseLvl(tm)-1]||10;
const BD={
 hq:{n:'Centro de Control',hp:3200,cost:0,bt:0,inc:2,terr:3,key:1,atk:{dmg:45,rng:4,cd:1.6,vs:{inf:1.0,veh:1.3,air:1.2,bld:0.5}}},
 bastion:{n:'Bastión',hp:1800,cost:0,bt:0,terr:2,key:1,atk:{dmg:22,rng:3,cd:0.9,vs:{inf:1.2,veh:1.1,air:0.9,bld:0.6}}},
 barracks:{n:'Cuartel',hp:650,cost:150,bt:7,terr:2},
 factory:{n:'Fábrica',hp:850,cost:225,bt:9,terr:2},
 helipad:{n:'Helipuerto',hp:700,cost:200,bt:8,terr:2},
 ialab:{n:'Lab',hp:800,cost:300,bt:10,terr:2},
 extractor:{n:'Extractor',hp:450,cost:100,bt:6,inc:4,terr:2,onLitio:1},
 turret:{n:'Torreta',hp:550,cost:250,bt:9,terr:0,atk:{dmg:20,rng:3,cd:0.9,vs:{inf:1.2,veh:1,air:0.6,bld:0.6}}}
};
const UD={
 rifle:{n:'Fusilero',cls:'inf',hp:120,cost:50,spd:1.1,req:'barracks',atk:{dmg:12,rng:1,cd:0.8,vs:{inf:1.6,veh:0.5,air:0.4,bld:0.6}}},
 rocket:{n:'Lanzacoh.',cls:'inf',hp:100,cost:80,spd:1.0,req:'barracks',atk:{dmg:24,rng:2,cd:1.3,vs:{inf:0.5,veh:1.6,air:1.4,bld:1}}},
 buggy:{n:'Buggy',cls:'veh',hp:230,cost:100,spd:2.2,req:'factory',atk:{dmg:14,rng:1,cd:0.6,vs:{inf:1.7,veh:0.6,air:0,bld:0.5}}},
 tank:{n:'Tanque',cls:'veh',hp:520,cost:180,spd:0.9,req:'factory',atk:{dmg:42,rng:2,cd:1.6,vs:{inf:0.8,veh:1.5,air:0,bld:1.6}}},
 aa:{n:'Antiaéreo',cls:'veh',hp:320,cost:120,spd:1.2,req:'factory',atk:{dmg:30,rng:3,cd:1.0,vs:{inf:0.3,veh:0.3,air:2.0,bld:0.3}}},
 drone:{n:'Dron',cls:'air',hp:210,cost:150,spd:1.9,req:'helipad',atk:{dmg:28,rng:1,cd:1.0,vs:{inf:0.8,veh:1.6,air:0,bld:1}}},
 sniper:{n:'Francotir.',cls:'inf',hp:90,cost:90,spd:1.0,req:'barracks',atk:{dmg:40,rng:3,cd:2.0,vs:{inf:1.7,veh:0.3,air:0.2,bld:0.3}}},
 grenadier:{n:'Granadero',cls:'inf',hp:130,cost:85,spd:0.95,req:'barracks',atk:{dmg:22,rng:2,cd:1.4,vs:{inf:1.3,veh:0.8,air:0,bld:1.4}}},
 artillery:{n:'Artillería',cls:'veh',hp:260,cost:200,spd:0.7,req:'factory',atk:{dmg:55,rng:4,cd:3.0,vs:{inf:1.3,veh:0.9,air:0,bld:1.5}}},
 heli:{n:'Helicóptero',cls:'air',hp:300,cost:190,spd:1.6,req:'helipad',atk:{dmg:30,rng:2,cd:1.0,vs:{inf:1.3,veh:1.3,air:0.3,bld:0.8}}},
 fighter:{n:'Caza',cls:'air',hp:220,cost:170,spd:2.6,req:'helipad',atk:{dmg:34,rng:2,cd:0.9,vs:{inf:0,veh:0,air:1.9,bld:0}}},
 bomber:{n:'VTOL',cls:'air',hp:360,cost:260,spd:1.2,req:'helipad',atk:{dmg:90,rng:1,cd:3.0,vs:{inf:0.7,veh:0.8,air:0,bld:1.9}}},
 flamer:{n:'Lanzallamas',cls:'inf',hp:140,cost:95,spd:1.0,req:'barracks',atk:{dmg:18,rng:1,cd:0.4,vs:{inf:1.6,veh:0.6,air:0,bld:1.3}}},
 commando:{n:'Comando',cls:'inf',hp:200,cost:160,spd:1.4,req:'barracks',atk:{dmg:26,rng:2,cd:0.7,vs:{inf:1.4,veh:0.9,air:0.5,bld:1.2}}},
 apc:{n:'Blindado',cls:'veh',hp:650,cost:160,spd:1.3,req:'factory',atk:{dmg:12,rng:2,cd:0.5,vs:{inf:1.3,veh:0.6,air:0.6,bld:0.5}}},
 mlrs:{n:'Lanzamisiles',cls:'veh',hp:240,cost:230,spd:0.85,req:'factory',atk:{dmg:70,rng:4,cd:3.5,vs:{inf:0.7,veh:1.5,air:0.4,bld:1.4}}},
 gunship:{n:'Cañonera',cls:'air',hp:480,cost:280,spd:1.1,req:'helipad',atk:{dmg:24,rng:2,cd:0.5,vs:{inf:1.4,veh:1.3,air:0.2,bld:0.9}}},
 scout:{n:'Avión espía',cls:'air',hp:140,cost:90,spd:3.0,req:'helipad',sight:8,atk:{dmg:10,rng:2,cd:0.8,vs:{inf:0.8,veh:0.5,air:0.8,bld:0.3}}},
 android:{n:'Androide',cls:'inf',hp:160,cost:110,spd:1.5,req:'ialab',atk:{dmg:20,rng:2,cd:0.7,vs:{inf:1.4,veh:0.8,air:0.6,bld:0.8}}},
 spider:{n:'Araña',cls:'veh',hp:220,cost:130,spd:1.9,req:'ialab',climb:1,atk:{dmg:16,rng:1,cd:0.5,vs:{inf:1.6,veh:0.7,air:0,bld:0.6}}},
 mech:{n:'Mecha',cls:'mec',hp:700,cost:260,spd:0.8,req:'ialab',atk:{dmg:50,rng:2,cd:1.4,vs:{inf:0.9,veh:1.5,air:0.3,bld:1.4,mec:2.0}}},
 sentinel:{n:'Centinela',cls:'veh',hp:300,cost:150,spd:0.9,req:'ialab',atk:{dmg:28,rng:4,cd:1.0,vs:{inf:1.0,veh:0.6,air:1.8,bld:0.4}}},
 swarm:{n:'Enjambre',cls:'air',hp:160,cost:120,spd:2.4,req:'ialab',atk:{dmg:9,rng:1,cd:0.3,vs:{inf:1.5,veh:0.7,air:0.6,bld:0.5}}},
 titan:{n:'Titán',cls:'mec',hp:1500,cost:520,spd:0.55,req:'ialab',atk:{dmg:55,rng:4,cd:1.8,vs:{inf:0.3,veh:1.4,air:1.7,bld:1.0,mec:0.6}},atk2:{dmg:9,rng:2,cd:0.22,vs:{inf:1.7,veh:0.3,air:0,bld:0.3,mec:0.2}}}
};
const SUP={
 missile:{n:'Misil',lv:3,time:90},
 sat:{n:'Satélite',lv:1,time:60},
 dropper:{n:'Dropper',lv:2,time:30},
 extract:{n:'Extracción',lv:9,time:60,off:1}
};
const ZN=['O','E','C'];
const BASEUP=[0,650,1150],POPCAP=[10,15,20],INTR=6;let mslUsed=[0,0];const ARRIVE=[];
for(const D of[...Object.values(UD),...Object.values(BD)])for(const A of[D.atk,D.atk2])if(A&&A.vs.mec===undefined)A.vs.mec=A.vs.veh;
const CFG=(()=>{let c={};try{c=JSON.parse(localStorage.getItem('tactica.cfg')||'{}')}catch(e){}return Object.assign({diff:'normal',quality:'alta',grid:true,planet:'verdea',lay:'auto',size:'m',shape:'var'},c)})();
let DECK=(()=>{let d=null;try{d=JSON.parse(localStorage.getItem('tactica.deck')||'null')}catch(e){}const D0=['rifle','rocket','grenadier','tank','drone','heli','android','mech'];d=(d||D0).filter(k=>UD[k]).slice(0,8);return d.length?d:D0})();
const PLANETS={
 verdea:{n:'Kepler-442b',sub:'Templado',d:'Mundo de los Humanos. Súper-Tierra templada de una enana naranja, a ~1.200 años luz: praderas, bosques y ríos con vado.',ball:'radial-gradient(circle at 35% 35%,#8fd16a,#2f6a2a 55%,#16301a)',
  sky:0x0a0c0f,fog:0x07090c,hemi:[0xdfeaff,0x2a2218,0.75],sun:[0xfff1dc,0.9],
  col:{grass:0x2f4424,dirt:0x4c3a29,stone:0x46494d,rock:0x5c544b},
  mini:{grass:'#2f4424',dirt:'#4c3a29',stone:'#46494d',rock:'#857a6e',liq:'#123a5e',ford:'#24566a',ramp:'#4d4636',vil:'#a8763e'},
  liq:{bed:0x1c2c2a,ford:0x3a3a2c,top:0x15384f,cau:[0.07,0.13,0.16],glow:[0,0,0],op:0.86,f1:[0.16,0.42,0.6],f2:[0.85,0.95,1.0],foam:0xe8f6ff,fish:0xb8c4c8},
  gen:{blobs:5,sg0:5,sgR:6,smooth:2,lakes:1,rocks:0.08,rockPair:0.5,villages:3},shapes:[['llano','Praderas'],['valle','Valle'],['meseta','Altiplano']],
  deco:{tuft:[0x5f8a3e,0x7a9a48],tree:'crown',trunk:0x4a3624,crown:[0x2f5a2a,0x3d6b30],bush:0x47703a,flowers:[0xf2f0e6,0xffd84a,0xb07ad8,0xe0535a,0x6fa8ff,0xff9a3c],reed:0x8a9a52,peb:[0x8a7258,0x8b8f94,0x6f7378],boulder:0x8f8578,edge:[0x55803a,0x6b8f42],treeP:0.16},
  fauna:'deer',bird:0x2a2d30,part:{n:70,col:0xfff2b8,size:0.09,vy:0.06,op:0.4,drift:0.35},
  vil:{style:'cabin',wall:0x8a6a48,roof:0x6b3a2a,cloth:[0x7a5a3a,0x4a6a8a,0x9a4a3a,0x5a7a3a],skin:[0xe0b090,0xb07850,0x7a4a30]}},
 kharon:{n:'LP 791-18 d',sub:'Volcánico',d:'Mundo de los Dracos. Calentado por las mareas de su vecino gigante, cubierto de volcanes: basalto, ceniza y ríos de lava.',ball:'radial-gradient(circle at 35% 35%,#ffb060,#a02a08 50%,#2a0a04)',
  sky:0x120806,fog:0x160905,hemi:[0xffc8a0,0x2a0e06,0.62],sun:[0xffa060,0.95],
  col:{grass:0x2e2826,dirt:0x3e2a22,stone:0x383433,rock:0x2c2826},
  mini:{grass:'#2e2826',dirt:'#4a2c22',stone:'#3d3838',rock:'#141110',liq:'#d2500e',ford:'#5a2a14',ramp:'#4a3426',vil:'#8a8478'},
  liq:{bed:0x4a1003,ford:0x4a2414,top:0xff520e,cau:[0.55,0.2,0.02],glow:[1.0,0.34,0.06],op:1,f1:[1.0,0.32,0.03],f2:[1.0,0.86,0.32],foam:0xffa040,fish:0xffb030},
  gen:{blobs:8,sg0:3.5,sgR:4.5,smooth:2,lakes:2,rocks:0.12,rockPair:0.7,villages:3,q:[0.09,0.31,0.28,0.19,0.13]},shapes:[['cuenca','Caldera'],['cordillera','Cordillera'],['lagos','Mar de lava']],
  deco:{tuft:[0x5a4a3a,0x4a3a30],tree:'dead',trunk:0x1c1816,crown:[0x1c1816],bush:0x3a2e28,flowers:null,reed:0x4a2a1a,peb:[0x2a2422,0x3a3230,0x1e1a19],boulder:0x2a2523,edge:[0x3a302a,0x4a3a2e],treeP:0.12,spike:0x16131a,ember:0xff6a1a,fum:1},
  fauna:'salamander',bird:0x3a1410,part:{n:220,col:0xff7a2a,size:0.11,vy:0.55,op:0.85,drift:0.45,glow:1},
  vil:{style:'dome',wall:0x6a625a,roof:0x45403c,cloth:[0xc28a2a,0x5a5a5a,0xa04a1a,0x3a4a5a],skin:[0xd0a080,0x9a6a48,0x6a4028],lamp:0xffb040}},
 nivalis:{n:'LHS 1140 b',sub:'Glacial',d:'Mundo de los Ferox. Bola de nieve con océano en la cara que mira a su estrella: planicies heladas, mesetas y lagos de deshielo.',ball:'radial-gradient(circle at 35% 35%,#ffffff,#8ab4d4 50%,#1e3448)',
  sky:0x0c1218,fog:0x1a2430,hemi:[0xe8f4ff,0x40505e,0.85],sun:[0xe0ecff,0.85],
  col:{grass:0x96a2ae,dirt:0x5e646a,stone:0x66717e,rock:0x8aa6bc},
  mini:{grass:'#a6b2be',dirt:'#5e646a',stone:'#6a7684',rock:'#d4e6f2',liq:'#2a5a7a',ford:'#5a8aa8',ramp:'#7a7f84',vil:'#f0f6fa'},
  liq:{bed:0x1a3448,ford:0x6a8aa0,top:0x3a6e8c,cau:[0.12,0.18,0.22],glow:[0,0,0],op:0.82,f1:[0.4,0.6,0.75],f2:[0.95,0.98,1.0],foam:0xffffff,fish:0xd0dce4},
  gen:{blobs:4,sg0:8,sgR:6,smooth:3,lakes:3,rocks:0.05,rockPair:0.5,villages:3,q:[0.08,0.42,0.32,0.12,0.06]},shapes:[['llano','Tundra'],['meseta','Glaciar'],['lagos','Deshielo']],
  deco:{tuft:[0xb8c4cc,0x9aa8a0],tree:'snowpine',trunk:0x3a2e26,crown:[0x24382e,0x2c4034],bush:0xc8d2da,flowers:null,reed:0x8a9aa0,peb:[0xa8b4c0,0x8894a0,0xc8d4e0],boulder:0xb0cce0,edge:[0xd8e2ea,0xb8c4cc],treeP:0.2,spike:0x9fd4f0},
  fauna:'mammoth',bird:0xe8eef2,part:{n:320,col:0xffffff,size:0.12,vy:-0.55,op:0.85,drift:0.6},
  vil:{style:'igloo',wall:0xe8f0f6,roof:0xc8d8e4,cloth:[0x8a5a3a,0x6a4a3a,0xb07040,0x4a5a6a],skin:[0xd8b090,0xa87850,0x7a5034],lamp:0xffd080}},
 xenthe:{n:'Kepler-186f',sub:'Selva alien',d:'Mundo de los Micelian. Bajo la luz roja de su estrella la vida no es verde: musgo violeta, pozas que brillan y hongos gigantes.',ball:'radial-gradient(circle at 35% 35%,#c08aff,#4a2a8a 50%,#0a2a24)',
  sky:0x08060f,fog:0x0d0918,hemi:[0xc8b0ff,0x10261e,0.72],sun:[0xd8c0ff,0.8],
  col:{grass:0x3a2a52,dirt:0x3a2a30,stone:0x2a3a40,rock:0x34284a},
  mini:{grass:'#3a2a52',dirt:'#3a2a30',stone:'#2a3a40',rock:'#7a3a9a',liq:'#0fbf9a',ford:'#1a6a5a',ramp:'#4a3a5a',vil:'#2affc8'},
  liq:{bed:0x062a24,ford:0x1a4a40,top:0x0a5a4a,cau:[0.05,0.42,0.32],glow:[0.0,0.38,0.28],op:0.88,f1:[0.05,0.7,0.55],f2:[0.6,1.0,0.9],foam:0x80ffe0,fish:0x7affd8},
  gen:{blobs:6,sg0:4.5,sgR:5,smooth:2,lakes:3,rocks:0.10,rockPair:0.75,villages:3},shapes:[['cuenca','Cuenca'],['valle','Cañón'],['lagos','Pozas']],
  deco:{tuft:[0x7a4ab0,0x5a8a9a],tree:'mush',trunk:0xd8c8e8,crown:[0x2affc8,0xff4ad8,0x8a6aff],bush:0x5a3a8a,flowers:[0x2affc8,0xff4ad8,0xffe14d,0x8affff],reed:0x4affb0,peb:[0x4a3a5a,0x2a3a40,0x3a2a4a],boulder:0x3a2a50,edge:[0x6a3a9a,0x3a7a8a],treeP:0.22,glow:1},
  fauna:'crawler',bird:0x6affe0,birdGlow:1,part:{n:180,col:0x8affd8,size:0.11,vy:0.12,op:0.75,drift:0.5,glow:1},
  vil:{style:'pod',wall:0x5a3a7a,roof:0x2affc8,cloth:[0x8a6aff,0x2affc8,0xff4ad8,0x5a8aff],skin:[0x7a9a6a,0x5a8a7a,0x8a7aa0],lamp:0x2affc8}}
};
let PLK='verdea',PL=PLANETS.verdea;
function pickPlanet(){const ks=Object.keys(PLANETS);PLK=PLANETS[CFG.planet]?CFG.planet:ks[Math.floor(Math.random()*ks.length)];PL=PLANETS[PLK]}
const SPECIES=[
 {n:'Humanos',l:1,c:'#2ad4ff',k:'Humanidad',st:1,tg:'Ingenio, blindaje y tripulación.',d:'Ejércitos convencionales que combinan infantería, blindados y naves tripuladas. Su fuerza es adaptarse: un mazo humano responde a cualquier amenaza.',tr:['Naves y vehículos tripulados','Edificio: Lab (investigación y robótica)']},
 {n:'Crystal',l:1,c:'#ff6ad5',k:'Cristal arcano',tg:'Lo que tocan, estalla.',d:'Colosos de cristal facetado que resuenan con una energía antigua. Su brillo rosa es la última advertencia: cada golpe carga al objetivo hasta que revienta en esquirlas que destrozan todo a su alrededor.',tr:['Fragmentación: los enemigos revientan en esquirlas que dañan en área','Edificio: Geoda']},
 {n:'Micelian',l:1,st:1,c:'#8aff5a',k:'Red micelial',tg:'Todo lo vivo está conectado.',d:'Una red de micelio que despertó a la conciencia y une plantas e insectos como un solo organismo. No destruye: conecta. Todo ser vivo termina siendo parte de la red.',tr:['Enraizar: los vencidos quedan cubiertos de micelio en el mapa, estorbando el paso','Edificio: Corazón Micelial']},
 {n:'Demonios',c:'#ff3a3a',k:'Horda infernal',tg:'Hambre que no termina.',d:'Criaturas que llegan en oleadas, mutan entre batallas y corrompen el terreno que pisan.',tr:['Corrupción: el terreno tomado debilita a quien lo cruza','Edificio: Fosa']},
 {n:'Netlink',c:'#7affff',k:'IA en hardware',tg:'Una mente, mil cuerpos.',d:'Una inteligencia artificial que existe físicamente a través de hardware: drones, servidores y cuerpos de repuesto. Si cae una máquina, la mente sigue.',tr:['Reenlace: las unidades caídas se vuelven a descargar','Edificio especial: Data Center Orbital']},
 {n:'Ángeles',c:'#ffe9a0',k:'Seres de luz',tg:'Luz, escudo y juicio.',d:'Seres de energía con armaduras ceremoniales. Son pocos y caros, pero muy resistentes.',tr:['Égida: escudos de luz que se recargan fuera de combate','Edificio: Santuario']},
 {n:'Dracos',c:'#ff9a2a',k:'Reptilianos',tg:'Sangre antigua, escamas de acero.',d:'Reptilianos de linaje dracónico. Fuerza bruta, fuego y dominio del aire con bestias aladas.',tr:['Ira: más daño mientras más herido está','Edificio: Nido']},
 {n:'Ferox',c:'#d9a066',k:'Mamíferos',tg:'La manada no deja a nadie atrás.',d:'Tribus de felinos, caninos y ursinos con tecnología tosca pero muy física. Felinos rápidos que emboscan, caninos baratos que pelean en grupo y ursinos acorazados que abren paso.',tr:['Manada: más fuertes mientras más juntos pelean','Edificio: Gran Madriguera']}
];
const AIDECK=['rifle','rocket','sniper','tank','aa','artillery','drone','heli','android','mech'];
const ICON={
 dropper:'<path d="M12 4l3 6v6l-3 3-3-3v-6z"/><path d="M9 11H4v3h5M15 11h5v3h-5"/>',extract:'<path d="M12 20V8M8 12l4-4 4 4"/><path d="M5 4h14"/>',
 cannon:'<path d="M4 18l12-9"/><circle cx="7" cy="18" r="3"/><path d="M18 4l2 2M21 9h-2M15 2v2"/>',
 patrol:'<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
 missile:'<path d="M12 2c3 3 3 9 3 13H9c0-4 0-10 3-13z"/><path d="M9 15l-3 4h3M15 15l3 4h-3M11 19h2v3h-2z"/>',
 sat:'<rect x="9" y="8" width="6" height="6"/><path d="M6 11h3M15 11h3"/><rect x="1" y="9" width="5" height="4"/><rect x="18" y="9" width="5" height="4"/><path d="M12 14v8"/>',
 barracks:'<path d="M4 20V10l8-5 8 5v10z"/><path d="M9 20v-5h6v5"/>',
 factory:'<path d="M3 20V11l5 3v-3l5 3v-3l5 3V5h3v15z"/>',
 helipad:'<circle cx="12" cy="12" r="9"/><path d="M9 7v10M15 7v10M9 12h6"/>',
 extractor:'<path d="M12 3 6 20M12 3l6 17M8 14h8M9 9h6"/>',
 turret:'<rect x="6" y="8" width="10" height="7" rx="1"/><path d="M16 10h5M16 13h5M3 9v5M8 15v3M14 15v3M5 21h12"/>',
 rifle:'<circle cx="12" cy="5" r="2.5"/><path d="M12 8v7M8 11h8M12 15l-3 6M12 15l3 6"/>',
 rocket:'<circle cx="10" cy="5" r="2.5"/><path d="M10 8v7M10 15l-3 6M10 15l3 6M4 13l16-6"/>',
 buggy:'<path d="M3 15h18l-2-5H8z"/><circle cx="7" cy="17" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
 tank:'<rect x="3" y="13" width="18" height="6" rx="3"/><rect x="7" y="9" width="8" height="4"/><path d="M15 11h7"/>',
 aa:'<rect x="4" y="15" width="16" height="5" rx="2"/><path d="M8 15l5-11M11 15l5-11"/>',
 drone:'<circle cx="5" cy="5" r="3"/><circle cx="19" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="M7 7l10 10M17 7 7 17"/>',
 sniper:'<circle cx="12" cy="12" r="8"/><path d="M12 2v6M12 16v6M2 12h6M16 12h6"/>',
 grenadier:'<circle cx="12" cy="14" r="6"/><path d="M12 8V4h4M10 4h2"/>',
 artillery:'<rect x="3" y="15" width="14" height="5" rx="2"/><path d="M9 15 21 5"/><circle cx="7" cy="20" r="1"/>',
 heli:'<path d="M2 6h20M12 6v4"/><path d="M6 13c0-2 2-3 6-3s6 1 6 3-2 3-6 3-6-1-6-3zM18 13h4M12 16v3"/>',
 fighter:'<path d="M12 2 15 12 22 16v2l-7-2-1 4h-4l-1-4-7 2v-2l7-4z"/>',
 bomber:'<path d="M2 12h20M12 4c2 0 3 2 3 8s-1 8-3 8-3-2-3-8 1-8 3-8z"/><path d="M5 12v3M19 12v3"/>',
 ialab:'<path d="M9 3h6M10 3v6l-5 10a1 1 0 0 0 1 2h12a1 1 0 0 0 1-2l-5-10V3"/><circle cx="10" cy="16" r="1"/><circle cx="14" cy="18" r="1"/>',
 flamer:'<path d="M4 18h9l4-3"/><path d="M19 12c2 1 2 4 0 5-1-1-2-2-1-4"/><circle cx="6" cy="12" r="2"/>',
 commando:'<circle cx="12" cy="5" r="2.5"/><path d="M12 8v7M7 10l5 2 5-2M12 15l-3 6M12 15l3 6"/><path d="M8 4h8"/>',
 apc:'<rect x="2" y="8" width="20" height="8" rx="2"/><circle cx="6" cy="18" r="2"/><circle cx="12" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M12 8V5h5"/>',
 mlrs:'<rect x="3" y="15" width="16" height="5" rx="2"/><path d="M7 15 18 6l3 4-9 5"/><path d="M15 8l2 3"/>',
 gunship:'<path d="M2 5h20M12 5v3"/><rect x="6" y="8" width="12" height="7" rx="3"/><path d="M4 12h2M18 12h2M12 15v4"/>',
 scout:'<path d="M12 3v18M4 11l8-2 8 2M9 19l3-1 3 1"/><circle cx="12" cy="7" r="1.5"/>',
 android:'<rect x="8" y="2" width="8" height="7" rx="2"/><path d="M10 6h4M12 9v6M7 11h10M12 15l-3 6M12 15l3 6"/>',
 spider:'<ellipse cx="12" cy="12" rx="4" ry="3"/><path d="M8 11 3 7M8 13 3 17M16 11l5-4M16 13l5 4M9 10 6 4M15 10l3-6"/>',
 mech:'<rect x="7" y="4" width="10" height="8" rx="1"/><path d="M9 12v8M15 12v8M7 20h4M13 20h4M7 7H3M17 7h4"/>',
 sentinel:'<circle cx="12" cy="8" r="4"/><path d="M12 8h10M12 12 7 21M12 12l5 9M12 12v9"/>',
 swarm:'<circle cx="6" cy="6" r="2"/><circle cx="18" cy="7" r="2"/><circle cx="12" cy="13" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
 titan:'<rect x="6" y="2" width="12" height="11" rx="2"/><path d="M8 13v8M16 13v8M5 21h5M14 21h5M6 6H2M18 6h4M10 6h4"/>'
};

