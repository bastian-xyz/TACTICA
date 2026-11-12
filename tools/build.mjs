// Une las fuentes de src/ en un solo index.html por destino.
//   dist/web/index.html     → página pública (GitHub Pages), 1v1 por enlace
//   dist/claude/index.html  → versión que se publica como artefacto
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=join(dirname(fileURLToPath(import.meta.url)),'..'),SRC=join(ROOT,'src');
const rd=f=>readFileSync(join(SRC,f),'utf8');
const VERSION=JSON.parse(readFileSync(join(ROOT,'package.json'),'utf8')).version;
const CHANGELOG=JSON.stringify(JSON.parse(rd('changelog.json')));
const THREE='<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n';
const secs=readdirSync(join(SRC,'js')).filter(f=>/^\d\d[a-z]?-.*\.js$/.test(f)).sort((a,b)=>{
  const k=f=>{const m=/^(\d\d)([a-z]?)/.exec(f);return m[1]+(m[2]||' ')};return k(a)<k(b)?-1:1});
function build(target){
  let js='const VERSION='+JSON.stringify(VERSION)+';const BUILD='+JSON.stringify(target)+';\nconst CHANGELOG='+CHANGELOG+';\n';
  js+=rd('net/sala-'+target+'.js');
  for(const f of secs)js+='// ---- '+f+'\n'+rd('js/'+f);
  // función en vez de texto: el código tiene secuencias "$'" que replace() interpretaría
  const html=rd('index.html').replace('/*__CSS__*/',()=>rd('css/game.css')).replace('<!--__BODY__-->',()=>rd('body.html')).replace('<!--__LIBS__-->',()=>THREE).replace('/*__JS__*/',()=>js);
  const out=join(ROOT,'dist',target);mkdirSync(out,{recursive:true});writeFileSync(join(out,'index.html'),html);
  if(target==='web'){writeFileSync(join(out,'version.json'),JSON.stringify({version:VERSION})+'\n');writeFileSync(join(out,'.nojekyll'),'')}
  console.log(target.padEnd(7),'v'+VERSION,(html.length/1024).toFixed(0)+' KB',secs.length+' secciones');
}
build('web');build('claude');
