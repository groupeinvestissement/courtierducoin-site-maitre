import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const redirects=JSON.parse(await readFile(join(root,'redirect-map.json'),'utf8'));
const errors=[]; let specialized=0, universal=0;
for(const {destination} of redirects){
  const url=new URL(destination); const rel=url.pathname.replace(/^\//,'')+'index.html'; const html=await readFile(join(root,rel),'utf8');
  const count=(needle)=>(html.match(new RegExp(needle,'g'))||[]).length;
  if(count('<h1>')!==1)errors.push(`${url.pathname}: expected one H1`);
  if(!html.includes(`<link rel="canonical" href="${destination}">`))errors.push(`${url.pathname}: canonical mismatch`);
  if(!html.includes('<meta name="robots" content="noindex,follow">')&&!['/rosemont-la-petite-patrie/o1a11/','/rosemont-la-petite-patrie/02a22/','/rosemont-la-petite-patrie/04m44/','/rosemont-la-petite-patrie/05c55/'].includes(url.pathname))errors.push(`${url.pathname}: progressive noindex missing`);
  if(url.pathname.startsWith('/secteurs/')){universal++; if(html.includes('data-campaign-video'))errors.push(`${url.pathname}: universal page has campaign video`);}
  else {specialized++; const required=[['video','data-campaign-video','data-investor-video','data-home-video'],['guide','data-guide-view','data-investor-guide','data-home-guide'],['guide form','data-track-form="guide"','data-investor-guide','data-home-guide'],['contact form','data-track-form="contact"','data-investor-analysis','data-home-analysis']]; for(const [label,...tokens] of required)if(!tokens.some(token=>html.includes(token)))errors.push(`${url.pathname}: missing ${label}`);}
}
if(redirects.length!==102)errors.push(`expected 102 redirects, got ${redirects.length}`);
if(universal!==17||specialized!==85)errors.push(`expected 17/85 pages, got ${universal}/${specialized}`);
const sitemap=await readFile(join(root,'sitemap.xml'),'utf8');
if((sitemap.match(/<url>/g)||[]).length!==103)errors.push('sitemap must contain home + 102 canonical pages');
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`QA passed: ${universal} universal pages, ${specialized} specialized pages, ${redirects.length} redirects, exact canonicals, one H1, progressive noindex, video, guide and forms.`);
