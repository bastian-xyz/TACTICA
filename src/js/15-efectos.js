// ================= FX =================
function tracer(x1,y1,z1,x2,y2,z2,team){
 if(!vis[hexAt(x1,z1)]&&!vis[hexAt(x2,z2)])return;
 const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x1,y1,z1),new THREE.Vector3(x2,y2,z2)]);
 const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:team?0xffb27a:0xa8f0ff,transparent:true}));scene.add(l);fx.push({o:l,t:0,life:0.14,k:'line'});
}
const MZ=[new THREE.MeshBasicMaterial({color:0xfff0a0,transparent:true,depthWrite:false})];
function muzzle(x,y,z,team){const h=hexAt(x,z);if(team!==0&&!(h>=0&&vis[h]))return;const m=new THREE.Mesh(G.sph,MZ[0].clone());m.position.set(x,y,z);m.scale.setScalar(0.18);scene.add(m);fx.push({o:m,t:0,life:0.08,k:'boom',s:0.3})}
function boom(x,z,s,y){
 BOOMS.push({x,z,t:performance.now()/1000,s:s||1});
 {const h=hexAt(x,z);if(h>=0&&!vis[h])return}
 const m=new THREE.Mesh(G.sph,new THREE.MeshBasicMaterial({color:0xffb24d,transparent:true,depthWrite:false}));
 {const h=hexAt(x,z);m.position.set(x,(h>=0?tiles[h].h:0.25)+(y||0.25),z)}m.scale.setScalar(0.1);scene.add(m);fx.push({o:m,t:0,life:0.5,k:'boom',s});
}
function marker(x,z,r,col,life){
 const m=new THREE.Mesh(G.ring,new THREE.MeshBasicMaterial({color:col,transparent:true,depthWrite:false}));
 const s=(r*1.73+0.9)/0.62;m.scale.set(s,1,s);{const h=hexAt(x,z);m.position.set(x,(h>=0?tiles[h].h:0.25)+0.06,z)}scene.add(m);fx.push({o:m,t:0,life,k:'mark'});
}
function ping(i){const t=tiles[i];const m=new THREE.Mesh(G.ring,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false}));m.position.set(t.x,t.h+0.06,t.z);scene.add(m);fx.push({o:m,t:0,life:0.5,k:'ping'})}
function updFx(dt){
 if(ghMesh.count){const p=performance.now()*0.008;ghMat.opacity=0.42+0.16*Math.sin(p);ghLines.material.opacity=0.75+0.25*Math.sin(p)}
 for(const f of fx){
  f.t+=dt;const k=f.t/f.life;
  if(f.k==='line')f.o.material.opacity=1-k;
  else if(f.k==='boom'){f.o.scale.setScalar(f.s*(0.3+0.7*k));f.o.material.opacity=1-k}
  else if(f.k==='mark'){f.o.material.opacity=0.5+0.5*Math.sin(f.t*12)}
  else if(f.k==='smoke'){f.o.scale.setScalar(f.s*(0.4+k*1.2));f.o.material.opacity=0.5*(1-k);if(f.vy){f.o.position.y+=f.vy*dt*(1-k*0.5);f.o.position.x+=0.12*dt}}
  else if(f.k==='spark'){const o=f.o;o.position.x+=f.vx*dt;o.position.z+=f.vz*dt;o.position.y+=f.vy*dt;f.vy-=9*dt;o.scale.setScalar(0.035*(1-k*0.7))}
  else if(f.k==='ping'){f.o.scale.setScalar(1.6-k);f.o.material.opacity=1-k}
  else if(f.k==='fish'){const o=f.o;const y=0.16+Math.sin(Math.PI*k)*0.55;o.position.set(f.x+Math.sin(f.a)*k*0.6,y,f.z+Math.cos(f.a)*k*0.6);o.rotation.set(Math.PI/2-(k-0.5)*2.4,f.a,0,'YXZ');if(k>0.92&&!f.sp){f.sp=1;foam(o.position.x,0.17,o.position.z)}}
  else if(f.k==='corpse'){const o=f.o;o.position.x+=f.vx*dt;o.position.z+=f.vz*dt;o.position.y+=f.vy*dt;f.vy-=11*dt;o.rotation.x+=f.spin*dt;o.rotation.z+=f.spin*0.55*dt;
   const g=heightAt(o.position.x,o.position.z);if(o.position.y<g){o.position.y=g;f.vy=Math.abs(f.vy)*0.3;f.vx*=0.45;f.vz*=0.45;f.spin*=0.4}
   if(k>0.7)o.scale.setScalar((f.s0||1)*Math.max(0.01,(1-k)/0.3));if(Math.random()<dt*10&&k<0.5)smoke(o.position.x,o.position.y,o.position.z,0.3,0.5)}
  else if(f.k==='chunk'){const o=f.o;o.position.x+=f.vx*dt;o.position.z+=f.vz*dt;o.position.y+=f.vy*dt;f.vy-=10*dt;o.rotation.x+=f.spin*dt;o.rotation.y+=f.spin*0.7*dt;
   const g=heightAt(o.position.x,o.position.z);if(o.position.y<g){o.position.y=g;f.vy=Math.abs(f.vy)*0.25;f.vx*=0.4;f.vz*=0.4;f.spin*=0.3}if(k>0.75){const q=Math.max(0.01,(1-k)/0.25);o.scale.multiplyScalar(q/(f.q||1));f.q=q}}
  else if(f.k==='collapse'){const o=f.o,e2=k*k;o.position.y=f.y0-f.hgt*e2;o.position.x=f.x0+(Math.random()-.5)*0.08*(1-k);o.position.z=f.z0+(Math.random()-.5)*0.08*(1-k);o.rotation.x=f.tx*k;o.rotation.z=f.tz*k;
   if(k<0.85&&Math.random()<dt*(f.big?14:8))smoke(f.x0+(Math.random()-.5)*(f.big?2.4:1.2),f.y0+0.3+Math.random()*0.6,f.z0+(Math.random()-.5)*(f.big?2.4:1.2),f.big?0.8:0.5,1.8,0x7a746c,0.4);
   if(k<0.6&&Math.random()<dt*4)debris(f.x0,f.y0+f.hgt*(1-k)*0.7,f.z0,1,0.6)}
  else if(f.k==='rubble'){const h=f.tile;f.o.visible=!started||!!expl[h];if(f.t<12&&vis[h]&&Math.random()<dt*(f.t<4?5:1.5))smoke(f.x+(Math.random()-.5)*f.r,heightAt(f.x,f.z)+0.15,f.z+(Math.random()-.5)*f.r,0.4,2,f.t<4?0x2a2a2a:0x5a5a5c,0.5);if(k>0.9)f.o.position.y=-((k-0.9)/0.1)*0.4}
  else if(f.k==='fall'){const o=f.o;f.vy-=7*dt;o.position.y+=f.vy*dt;o.position.x+=f.vx*dt;o.position.z+=f.vz*dt;o.rotation.y+=f.spin*dt;o.rotation.z=Math.min(0.6,o.rotation.z+dt*0.5);o.rotation.x=Math.min(0.5,o.rotation.x+dt*0.4);
   if(Math.random()<dt*25)smoke(o.position.x,o.position.y+0.1,o.position.z,0.35,1.4,0x2a2a2c,0.3);
   const g=heightAt(o.position.x,o.position.z);if(o.position.y<=g+0.05||f.t>4){o.position.y=g+0.05;boom(o.position.x,o.position.z,1.4,0.2);debris(o.position.x,g+0.2,o.position.z,5,1);sparkBurst(o.position.x,g+0.2,o.position.z,6,2);
    f.k='wreck';f.t=0;f.life=8;f.y0=o.position.y;f.fl=flameMesh();f.fs=0.25}}
  else if(f.k==='wreck'){const o=f.o,h=hexAt(o.position.x,o.position.z),vs=!started||(h>=0&&!!vis[h]);o.visible=!started||(h>=0&&!!expl[h]);
   if(f.fl){const b=Math.max(0,1-f.t/5),s=f.fs*b*(0.8+0.3*Math.sin(f.t*30)+Math.random()*0.15);f.fl.position.set(o.position.x,o.position.y+0.2+s*0.5,o.position.z);f.fl.scale.set(s*0.7,s*1.5,s*0.7);f.fl.visible=vs&&b>0;if(b<=0){scene.remove(f.fl);f.fl=null}}
   if(vs&&Math.random()<dt*(f.t<5?7:2))smoke(o.position.x+(Math.random()-.5)*0.2,o.position.y+0.3,o.position.z+(Math.random()-.5)*0.2,0.32,2,f.t<5?0x2a2a2c:0x4a4a4c,0.7);
   if(k>0.82)o.position.y=f.y0-((k-0.82)/0.18)*0.7}
  if(k>=1){scene.remove(f.o);if(f.fl)scene.remove(f.fl);if(f.k==='line')f.o.geometry.dispose();if(f.o.material&&!f.shared)f.o.material.dispose();f.dead=true}
 }
 fx=fx.filter(f=>!f.dead);
}

