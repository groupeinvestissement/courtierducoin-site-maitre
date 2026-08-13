import {readFile} from 'node:fs/promises';
const pages=['secteurs/vaudreuil-soulanges/index.html','vaudreuil-soulanges/o1a11/index.html','vaudreuil-soulanges/02a22/index.html','vaudreuil-soulanges/03i33/index.html','vaudreuil-soulanges/04m44/index.html','vaudreuil-soulanges/05c55/index.html'];
const errors=[];
for(const path of pages){const h=await readFile(path,'utf8');if((h.match(/<h1>/g)||[]).length!==1)errors.push(`${path}: H1`);if(/Rosemont|La Petite-Patrie|Petite Italie|Jean-Talon|Beaubien|Masson|Angus/.test(h))errors.push(`${path}: residual locality`);if(!h.includes('/favicon.ico')||!h.includes('/assets/sutton-wordmark.png'))errors.push(`${path}: branding`);if(!h.includes('vaudreuil-soulanges'))errors.push(`${path}: route`);}
const universal=await readFile(pages[0],'utf8');
for(const token of ['index,follow','https://www.courtierducoin.ca/secteurs/vaudreuil-soulanges/','Vaudreuil-Dorion','L’Île-Perrot','Saint-Lazare','Hudson','Saint-Zotique','Pourquoi travailler directement avec Pierre','data-market-stat','vs-universal-guide','vs-universal-analysis','hreflang="en-CA"'])if(!universal.includes(token))errors.push(`universal: missing ${token}`);
const json=universal.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];try{JSON.parse(json)}catch{errors.push('universal: invalid structured data')}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}console.log('Vaudreuil V4 QA passed for all 6 pages.');
