// ================= SALA: versión web (enlace directo, sin cuenta) =================
// Conexión directa entre los dos navegadores (WebRTC con PeerJS). El anfitrión registra el código de la
// partida y el invitado se conecta a él. Imita la sala de la versión publicada en Claude, así que
// 22-multijugador.js es el mismo para los dos destinos. `window.TACTICA_PEER` permite un servidor PeerJS propio.
const SALA=(()=>{
 const PRE='tactica-v1-',LIB='https://cdn.jsdelivr.net/npm/peerjs@1.5.5/dist/peerjs.min.js';
 const ICE=[{urls:['stun:stun.l.google.com:19302','stun:stun.cloudflare.com:3478']},
  {urls:['turn:openrelay.metered.ca:80','turn:openrelay.metered.ca:443','turn:openrelay.metered.ca:443?transport=tcp'],username:'openrelayproject',credential:'openrelayproject'}];
 let libP=null;
 const lib=()=>window.Peer?Promise.resolve(true):(libP=libP||new Promise(res=>{const s=document.createElement('script');s.src=LIB;s.onload=()=>res(!!window.Peer);s.onerror=()=>{libP=null;res(false)};document.head.appendChild(s)}));
 const opts=()=>Object.assign({config:{iceServers:ICE}},window.TACTICA_PEER||{});
 const err=(code,message)=>Object.assign(new Error(message),{code});
 function room(name,host){return new Promise((resolve,reject)=>{
  const hid=PRE+name,myPres={},conns=new Map(),subs={},pcb=[];let done=false,closed=false;
  const P=host?new window.Peer(hid,opts()):new window.Peer(opts());
  const fire=()=>pcb.forEach(f=>{try{f()}catch(e){}});
  const send=(c,o)=>{try{if(c.open)c.send(o)}catch(e){}};
  const all=o=>conns.forEach(v=>send(v.c,o));
  const drop=id=>{const v=conns.get(id);if(!v)return;conns.delete(id);try{v.c.close()}catch(e){}fire()};
  const wire=c=>{
   c.on('open',()=>{conns.set(c.peer,{c,pres:null,t:performance.now()});send(c,{t:'p',p:myPres});if(!host&&!done){done=true;resolve(R)}});
   c.on('data',m=>{const v=conns.get(c.peer);if(!v||!m)return;v.t=performance.now();
    if(m.t==='p'){v.pres=m.p||{};fire()}
    else if(m.t==='m'){(subs[m.k]||[]).forEach(f=>{try{f({peer:c.peer,data:m.d,sameTab:false})}catch(e){}})}
    else if(m.t==='x')drop(c.peer)});
   c.on('close',()=>drop(c.peer));c.on('error',()=>drop(c.peer));
  };
  // presencia repetida cada 2 s; sin noticias en 7 s = desconectado
  const iv=setInterval(()=>{const now=performance.now();all({t:'p',p:myPres});conns.forEach((v,id)=>{if(now-v.t>7000)drop(id)})},2000);
  const bye=()=>all({t:'x'});addEventListener('pagehide',bye);
  const stop=()=>{closed=true;clearInterval(iv);removeEventListener('pagehide',bye);setTimeout(()=>{try{P.destroy()}catch(e){}},200)};
  const fail=e=>{if(done)return;done=true;stop();reject(e)};
  const R={
   on(k,f){(subs[k]=subs[k]||[]).push(f)},
   emit(k,d){all({t:'m',k,d});return Promise.resolve()},
   presence(p){Object.assign(myPres,p);all({t:'p',p:myPres});return Promise.resolve()},
   peers(){const a=[{peer:P.id,isMe:true,presence:myPres,guest:false}];conns.forEach((v,id)=>{if(v.pres)a.push({peer:id,isMe:false,presence:v.pres,guest:false})});return a},
   onPeers(cb){pcb.push(cb)},
   leave(){if(!closed){bye();stop()}return Promise.resolve()}
  };
  P.on('open',()=>{if(host){done=true;resolve(R)}else wire(P.connect(hid,{reliable:true,serialization:'json'}))});
  P.on('connection',c=>{if(host&&!closed)wire(c);else try{c.close()}catch(e){}});
  P.on('error',e=>{const t=e&&e.type;fail(t==='unavailable-id'?err('taken','Ese código ya está en uso'):t==='peer-unavailable'?err('none','No hay una partida abierta con ese código'):err('net','No se pudo conectar'))});
  P.on('disconnected',()=>{if(!closed)try{P.reconnect()}catch(e){}});
  setTimeout(()=>fail(err('timeout','No se pudo conectar con la partida')),15000);
 })}
 return{
  tipo:'web',
  lista:false, // sin lista de partidas: se entra con el enlace o el código
  async lobby(){if(!await lib())return null;return{peers:()=>[],presence:()=>Promise.resolve(),onPeers(){},join:(name,o)=>room(name,!!(o&&o.host))}},
  sinSala:'No se pudo cargar la conexión. Revisa tu internet y vuelve a intentar.',
  nota:'Comparte el enlace o el código de 4 letras: tu amigo entra desde cualquier navegador, sin cuenta. La conexión es directa entre los dos equipos. Si alguien se desconecta, la partida espera a que vuelva.'
 };
})();

