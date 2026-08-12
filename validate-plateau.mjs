import {readFile, stat} from 'node:fs/promises';
import {join} from 'node:path';

const root = process.cwd();
const paths = ['secteurs/le-plateau-mont-royal','le-plateau-mont-royal/o1a11','le-plateau-mont-royal/02a22','le-plateau-mont-royal/03i33','le-plateau-mont-royal/04m44','le-plateau-mont-royal/05c55'];
const allPaths = [...paths,...paths.map((path)=>`en/${path}`)];
const expectedKeys = ['plateau-universal-guide','plateau-universal-analysis','plateau-options-plan-confidentiel','plateau-options-analysis','plateau-accompagnement-checklist','plateau-accompagnement-analysis','plateau-investisseur-guide','plateau-investisseur-analysis','plateau-maison-guide','plateau-maison-analysis','plateau-condo-guide','plateau-condo-analysis'];
const errors=[]; const canonicals=new Set(); const titles=new Set(); const h1s=new Set();
for (const path of allPaths) {
  const html=await readFile(join(root,path,'index.html'),'utf8');
  const canonical=html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  const title=html.match(/<title>([^<]+)<\/title>/)?.[1]; const h1=html.match(/<h1>([^<]+)<\/h1>/)?.[1];
  if(!canonical||canonicals.has(canonical))errors.push(`${path}: canonical absent ou en double`);else canonicals.add(canonical);
  if(!title||titles.has(title))errors.push(`${path}: title absent ou en double`);else titles.add(title);
  if(!h1||h1s.has(h1))errors.push(`${path}: H1 absent ou en double`);else h1s.add(h1);
  for (const token of ['index,follow','hreflang="fr-CA"','hreflang="en-CA"','pierre-dalpe-portrait-transparent.png','property-proof-photo','sector-master.css','sector-master.js','consent_request','consent_marketing','application/ld+json']) if(!html.includes(token))errors.push(`${path}: ${token} absent`);
  for (const schemaType of ['WebPage','BreadcrumbList','Person','Organization','RealEstateAgent','VideoObject','FAQPage']) if(!html.includes(`"@type":"${schemaType}"`))errors.push(`${path}: schema ${schemaType} absent`);
  if ((html.match(/<h1>/g)||[]).length!==1) errors.push(`${path}: exactement un H1 requis`);
  if ((html.match(/<form /g)||[]).length!==2) errors.push(`${path}: exactement deux formulaires requis`);
  const ownLanguage = path.startsWith('en/') ? 'English' : 'Français';
  if(!html.includes(`name="langue" value="${ownLanguage}"`))errors.push(`${path}: langue CRM incorrecte`);
  if(!html.includes('data-entry-prefix="plateau"'))errors.push(`${path}: préfixe attribution absent`);
  const image=(html.match(/property-proof-photo[\s\S]*?<img src="([^"]+)"/)||[])[1];
  if(!image||!image.includes('/assets/le-plateau-mont-royal/'))errors.push(`${path}: photo locale absente`);
  const keys=[...html.matchAll(/data-source-key="([^"]+)"/g)].map((m)=>m[1]); if(keys.length!==2||new Set(keys).size!==2)errors.push(`${path}: deux Form IDs distincts requis`);
}
const registry=await readFile(join(root,'api','web-form-sources.php'),'utf8');
for(const key of expectedKeys)if(!registry.includes(`'${key}'`))errors.push(`registre: ${key} absent`);
const uniqueRegistryKeys=[...registry.matchAll(/'(plateau-[^']+)'\s*=>/g)].map((match)=>match[1]);
if(uniqueRegistryKeys.length!==12||new Set(uniqueRegistryKeys).size!==12)errors.push('registre: 12 Form IDs Plateau uniques requis');
const sitemap=await readFile(join(root,'sitemap.xml'),'utf8');
for(const canonical of canonicals)if(!sitemap.includes(`<loc>${canonical}</loc>`))errors.push(`sitemap: ${canonical} absent`);
const data=JSON.parse(await readFile(join(root,'data','le-plateau-mont-royal-market-data.json'),'utf8'));
if(data.singleFamily.quarter.medianPrice!==null||data.singleFamily.quarter.avgDaysOnMarket!==null)errors.push('data: valeurs unifamiliales masquées doivent rester null');
for(const image of ['universal','options','accompagnement','investisseur','maison','condo']){const file=join(root,'assets','le-plateau-mont-royal',`hero-le-plateau-mont-royal-${image}.webp`);try{const info=await stat(file);if(info.size<100000)errors.push(`${file}: image trop petite`);}catch{errors.push(`${file}: image absente`);}}
const htaccess=await readFile(join(root,'.htaccess'),'utf8');
if(!htaccess.includes('plateau\\.courtierducoin\\.ca')||!htaccess.includes('QSA'))errors.push('.htaccess: redirection Plateau avec QSA absente');
const redirects=JSON.parse(await readFile(join(root,'redirect-map.json'),'utf8')).filter((item)=>item.entry.startsWith('https://plateau.courtierducoin.ca/'));
if(redirects.length!==6||redirects.some((item)=>item.status!==301||item.preserveQuery!==true||!item.destination.includes('?entry=le-plateau-mont-royal-')))errors.push('redirect-map: 6 redirections Plateau 301 avec conservation des paramètres requises');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}console.log('PASS: 12 pages Plateau FR/EN, 12 Form IDs, images, data, SEO and sitemap validated.');
