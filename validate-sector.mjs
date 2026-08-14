import {readFile, stat} from 'node:fs/promises';
import {join} from 'node:path';

const configs = {
  'ahuntsic-cartierville': {prefix:'ahuntsic',host:'ahuntsic.courtierducoin.ca',imageDir:'ahuntsic-cartierville',data:'ahuntsic-cartierville-market-data.json',directRouting:true},
  'anjou-saint-leonard': {prefix:'anjou',host:'anjou-saint-leonard.courtierducoin.ca',imageDir:'anjou-saint-leonard',data:'anjou-saint-leonard-market-data.json',directRouting:true},
  'cdn-cote-saint-luc': {prefix:'cdn',host:'cdn-csl.courtierducoin.ca',imageDir:'cdn-cote-saint-luc',data:'cdn-cote-saint-luc-market-data.json',directRouting:true},
  'ile-des-soeurs': {prefix:'ids',host:'ile-des-soeurs.courtierducoin.ca',imageDir:'ile-des-soeurs',data:'ile-des-soeurs-market-data.json',directRouting:true},
  'lachine-lasalle': {prefix:'lachinelasalle',host:'lachine-lasalle.courtierducoin.ca',imageDir:'lachine-lasalle',data:'lachine-lasalle-market-data.json',directRouting:true},
  'le-sud-ouest': {prefix:'sudouest',host:'sud-ouest.courtierducoin.ca',imageDir:'le-sud-ouest',data:'le-sud-ouest-market-data.json'},
  'longueuil': {prefix:'longueuil',host:'longueuil.courtierducoin.ca',imageDir:'longueuil',data:'longueuil-market-data.json'},
  'mercier-hochelaga-maisonneuve': {prefix:'mhm',host:'mercier-hochelaga.courtierducoin.ca',imageDir:'mercier-hochelaga-maisonneuve',data:'mercier-hochelaga-maisonneuve-market-data.json'},
  'ndg-montreal-ouest': {prefix:'ndg',host:'ndg.courtierducoin.ca',imageDir:'ndg-montreal-ouest',data:'ndg-montreal-ouest-market-data.json'},
  'ouest-de-lile': {prefix:'ouestile',host:'ouest-ile.courtierducoin.ca',imageDir:'ouest-de-lile',data:'ouest-de-lile-market-data.json'},
  'ouest-de-lile-nord': {prefix:'ouestnord',host:'ouest-ile-nord.courtierducoin.ca',imageDir:'ouest-de-lile-nord',data:'ouest-de-lile-nord-market-data.json'},
  'ouest-de-lile-sud': {prefix:'ouestsud',host:'ouest-ile-sud.courtierducoin.ca',imageDir:'ouest-de-lile-sud',data:'ouest-de-lile-sud-market-data.json'},
  'outremont-westmount-vmr': {prefix:'owvmr',host:'outremont-westmount-vmr.courtierducoin.ca',imageDir:'outremont-westmount-vmr',data:'outremont-westmount-vmr-market-data.json'},
  'repentigny': {prefix:'repentigny',host:'repentigny.courtierducoin.ca',imageDir:'repentigny',data:'repentigny-market-data.json'},
  'saint-laurent': {prefix:'saintlaurent',host:'saint-laurent.courtierducoin.ca',imageDir:'saint-laurent',data:'saint-laurent-market-data.json'},
  'verdun': {prefix:'verdun',host:'verdun.courtierducoin.ca',imageDir:'verdun',data:'verdun-market-data.json'},
  'ville-marie': {prefix:'villemarie',host:'ville-marie.courtierducoin.ca',imageDir:'ville-marie',data:'ville-marie-market-data.json'},
  'villeray-saint-michel-parc-extension': {prefix:'vsp',host:'villeray.courtierducoin.ca',imageDir:'villeray-saint-michel-parc-extension',data:'villeray-saint-michel-parc-extension-market-data.json'}
};
const key=process.argv[2]; const config=configs[key];
if(!config) throw new Error(`Unknown sector: ${key}`);
const root=process.cwd();
const paths=[`secteurs/${key}`,`${key}/o1a11`,`${key}/02a22`,`${key}/03i33`,`${key}/04m44`,`${key}/05c55`];
const allPaths=[...paths,...paths.map((path)=>`en/${path}`)];
const suffixes=['universal-guide','universal-analysis','options-plan-confidentiel','options-analysis','accompagnement-checklist','accompagnement-analysis','investisseur-guide','investisseur-analysis','maison-guide','maison-analysis','condo-guide','condo-analysis'];
const expectedKeys=suffixes.map((suffix)=>`${config.prefix}-${suffix}`);
const errors=[]; const canonicals=new Set(); const titles=new Set(); const h1s=new Set();
for(const path of allPaths){
  const html=await readFile(join(root,path,'index.html'),'utf8');
  const canonical=html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  const title=html.match(/<title>([^<]+)<\/title>/)?.[1]; const h1=html.match(/<h1>([^<]+)<\/h1>/)?.[1];
  if(!canonical||canonicals.has(canonical))errors.push(`${path}: canonical absent ou double`);else canonicals.add(canonical);
  if(!title||titles.has(title))errors.push(`${path}: title absent ou double`);else titles.add(title);
  if(!h1||h1s.has(h1))errors.push(`${path}: H1 absent ou double`);else h1s.add(h1);
  for(const token of ['index,follow','hreflang="fr-CA"','hreflang="en-CA"','pierre-dalpe-portrait-transparent.png','property-proof-photo','sector-master.css','sector-master.js','consent_request','consent_marketing','application/ld+json']) if(!html.includes(token))errors.push(`${path}: ${token} absent`);
  for(const schemaType of ['WebPage','BreadcrumbList','Person','Organization','RealEstateAgent','VideoObject','FAQPage'])if(!html.includes(`"@type":"${schemaType}"`))errors.push(`${path}: schema ${schemaType} absent`);
  if((html.match(/<h1>/g)||[]).length!==1)errors.push(`${path}: un seul H1 requis`);
  if((html.match(/<form /g)||[]).length!==2)errors.push(`${path}: deux formulaires requis`);
  if(!html.includes(`data-entry-prefix="${config.prefix}"`))errors.push(`${path}: préfixe attribution absent`);
  const image=(html.match(/property-proof-photo[\s\S]*?<img src="([^"]+)"/)||[])[1];
  if(!image||!image.includes(`/assets/${config.imageDir}/`))errors.push(`${path}: photo locale absente`);
  const sourceKeys=[...html.matchAll(/data-source-key="([^"]+)"/g)].map((m)=>m[1]);
  if(sourceKeys.length!==2||new Set(sourceKeys).size!==2)errors.push(`${path}: deux Form IDs distincts requis`);
}
const registry=await readFile(join(root,'api','web-form-sources.php'),'utf8');
for(const sourceKey of expectedKeys)if(!registry.includes(`'${sourceKey}'`))errors.push(`registre: ${sourceKey} absent`);
const registryKeys=[...registry.matchAll(new RegExp(`'(${config.prefix}-[^']+)'\\s*=>`,'g'))].map((match)=>match[1]);
if(registryKeys.length!==12||new Set(registryKeys).size!==12)errors.push('registre: 12 Form IDs uniques requis');
const sitemap=await readFile(join(root,'sitemap.xml'),'utf8');
for(const canonical of canonicals)if(!sitemap.includes(`<loc>${canonical}</loc>`))errors.push(`sitemap: ${canonical} absent`);
JSON.parse(await readFile(join(root,'data',config.data),'utf8'));
for(const image of ['universal','options','accompagnement','investisseur','maison','condo']){const file=join(root,'assets',config.imageDir,`hero-${config.imageDir}-${image}.webp`);try{const info=await stat(file);if(info.size<100000)errors.push(`${file}: image trop petite`);}catch{errors.push(`${file}: image absente`);}}
const htaccess=await readFile(join(root,'.htaccess'),'utf8');
const escapedHost=config.host.replaceAll('.','\\.');
const hostPresent=htaccess.includes(escapedHost)||(config.host==='ouest-ile.courtierducoin.ca'&&htaccess.includes('^(ouest-ile|ouest-ile-nord|ouest-ile-sud)\\.courtierducoin\\.ca$'));
if(!hostPresent||(!config.directRouting&&!htaccess.includes(`entry=${config.prefix}-`)))errors.push('.htaccess: redirection sectorielle absente');
const redirects=JSON.parse(await readFile(join(root,'redirect-map.json'),'utf8')).filter((item)=>item.entry.startsWith(`https://${config.host}/`));
if(redirects.length!==6||redirects.some((item)=>item.status!==301||(!config.directRouting&&item.preserveQuery!==true)||(!config.directRouting&&!item.destination.includes(`?entry=${config.prefix}-`))))errors.push('redirect-map: 6 redirections 301 avec conservation des paramètres requises');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}console.log(`PASS: ${key} — 12 pages FR/EN, 12 Form IDs, images, data, SEO and routing validated.`);
