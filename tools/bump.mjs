// Sube la versión y anota los cambios.
//   node tools/bump.mjs <x.y.z|patch|minor|major> "cambio 1" "cambio 2" …
import {readFileSync,writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=join(dirname(fileURLToPath(import.meta.url)),'..');
const [how,...items]=process.argv.slice(2);
if(!how||!items.length){console.error('Uso: node tools/bump.mjs <x.y.z|patch|minor|major> "cambio" …');process.exit(1)}
const pf=join(ROOT,'package.json'),pkg=JSON.parse(readFileSync(pf,'utf8'));
let [a,b,c]=pkg.version.split('.').map(Number);
if(how==='major'){a++;b=0;c=0}else if(how==='minor'){b++;c=0}else if(how==='patch'){c++}
else if(/^\d+\.\d+\.\d+$/.test(how)){[a,b,c]=how.split('.').map(Number)}else{console.error('Versión no válida: '+how);process.exit(1)}
pkg.version=a+'.'+b+'.'+c;writeFileSync(pf,JSON.stringify(pkg,null,2)+'\n');
const d=new Date(),p=n=>String(n).padStart(2,'0'),fecha=p(d.getDate())+'-'+p(d.getMonth()+1)+'-'+d.getFullYear();
const cf=join(ROOT,'src','changelog.json'),cl=JSON.parse(readFileSync(cf,'utf8'));
cl.unshift({v:pkg.version+' BETA',d:fecha,items});writeFileSync(cf,JSON.stringify(cl,null,1)+'\n');
let md='# Registro de cambios\n\n';for(const e of cl){md+='## '+e.v+' · '+e.d+'\n'+e.items.map(i=>'- '+i).join('\n')+'\n\n'}
writeFileSync(join(ROOT,'CHANGELOG.md'),md);
console.log('v'+pkg.version+' · '+items.length+' cambio(s). Sigue: npm run build · git commit · git tag v'+pkg.version+' · git push --follow-tags');
