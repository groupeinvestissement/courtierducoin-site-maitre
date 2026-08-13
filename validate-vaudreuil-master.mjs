import fs from 'node:fs';

const pages = [
  ['secteurs/vaudreuil-soulanges/index.html','Courtier immobilier à Vaudreuil-Soulanges | Pierre Dalpé','https://www.courtierducoin.ca/secteurs/vaudreuil-soulanges/',['vs-universal-guide','vs-universal-analysis']],
  ['vaudreuil-soulanges/o1a11/index.html','Avis de 60 jours ou vente pour taxes à Vaudreuil-Soulanges | Pierre Dalpé','https://www.courtierducoin.ca/vaudreuil-soulanges/o1a11/',['vs-options-plan-confidentiel','vs-options-analysis']],
  ['vaudreuil-soulanges/02a22/index.html','Vendre une propriété en succession à Vaudreuil-Soulanges | Pierre Dalpé','https://www.courtierducoin.ca/vaudreuil-soulanges/02a22/',['vs-accompagnement-checklist','vs-accompagnement-analysis']],
  ['vaudreuil-soulanges/03i33/index.html','Vendre un plex à Vaudreuil-Soulanges | Pierre Dalpé','https://www.courtierducoin.ca/vaudreuil-soulanges/03i33/',['vs-investisseur-guide','vs-investisseur-analysis']],
  ['vaudreuil-soulanges/04m44/index.html','Vendre une maison à Vaudreuil-Soulanges | Pierre Dalpé','https://www.courtierducoin.ca/vaudreuil-soulanges/04m44/',['vs-maison-guide','vs-maison-analysis']],
  ['vaudreuil-soulanges/05c55/index.html','Vendre un condo à Vaudreuil-Soulanges | Pierre Dalpé','https://www.courtierducoin.ca/vaudreuil-soulanges/05c55/',['vs-condo-guide','vs-condo-analysis']],
];
const sitemap = fs.readFileSync('sitemap.xml','utf8');
const registry = fs.readFileSync('api/web-form-sources.php','utf8');
const endpoint = fs.readFileSync('api/contact.php','utf8');
const redirects = fs.readFileSync('.htaccess','utf8');
const titles = new Set();
const keys = [];

for (const [file,title,canonical,expectedKeys] of pages) {
  const html = fs.readFileSync(file,'utf8');
  const actualTitle = html.match(/<title>([^<]+)<\/title>/)?.[1];
  if (actualTitle !== title) throw new Error(`${file}: title invalide`);
  if (titles.has(title)) throw new Error(`${file}: title dupliqué`);
  titles.add(title);
  if (!html.includes(`<link rel="canonical" href="${canonical}">`)) throw new Error(`${file}: canonical invalide`);
  if (!html.includes('name="robots" content="index,follow')) throw new Error(`${file}: non indexable`);
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) throw new Error(`${file}: absent du sitemap`);
  if (!html.includes('Vaudreuil-Soulanges') || (html.match(/<h1>/g)||[]).length !== 1) throw new Error(`${file}: contenu local ou H1 invalide`);
  const body = html.match(/<body[\s\S]*<\/body>/)?.[0] || '';
  const visible = body.replace(/<[^>]+>/g,' ');
  if (/Rosemont|Masson|Angus|Ville de Vaudreuil-Soulanges/.test(visible) || /montreal\.ca/.test(html)) throw new Error(`${file}: fuite locale`);
  if (!html.includes('/vaudreuil-master.css') || !html.includes('/vaudreuil-master.js')) throw new Error(`${file}: master commun absent`);
  const formKeys = [...html.matchAll(/data-source-key="([^"]+)"/g)].map((m)=>m[1]);
  if (JSON.stringify(formKeys) !== JSON.stringify(expectedKeys)) throw new Error(`${file}: source keys invalides`);
  if ((html.match(/name="consent_request"/g)||[]).length !== 2 || (html.match(/name="consent_marketing"/g)||[]).length !== 2) throw new Error(`${file}: consentements invalides`);
  if ((html.match(/class="form-privacy"/g)||[]).length !== 2) throw new Error(`${file}: lien confidentialité manquant`);
  for (const key of formKeys) {
    keys.push(key);
    if (!registry.includes(`'${key}' =>`)) throw new Error(`${file}: ${key} absent du serveur`);
  }
  const schema = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  if (!schema) throw new Error(`${file}: données structurées absentes`);
  const schemaJson = JSON.parse(schema);
  const schemaTypes = new Set((schemaJson['@graph'] || []).map((item)=>item['@type']));
  for (const type of ['WebPage','BreadcrumbList','Person','Organization','RealEstateAgent','VideoObject']) {
    if (!schemaTypes.has(type)) throw new Error(`${file}: schema ${type} absent`);
  }
}

if (new Set(keys).size !== 12 || keys.length !== 12) throw new Error('Les 12 Form IDs doivent être uniques');
if (!endpoint.includes("Web form rejected: unknown source_key") || !endpoint.includes('Courtier du Coin > {$webRegion} >') || !registry.includes("'vs-universal-analysis'")) throw new Error('Validation serveur de provenance absente');
if (!registry.includes("'web_page' => 'Vaudreuil-Soulanges — Universelle'") || !registry.includes("'source_detail_type' => 'Faire le point'")) throw new Error('Libellés CRM autoritaires invalides');
if (!redirects.includes('?entry=vs-universal') || !redirects.includes('?entry=vs-$1')) throw new Error('Attribution du sous-domaine marketing absente');
const market = JSON.parse(fs.readFileSync('data/vaudreuil-soulanges-market.json','utf8'));
const expected = {residential:[567,1004,914,2082,3286,838],singleFamily:[417,636,629000,37,1467,560,625000,43],condo:[136,244,382223,60,538,237,372368,64],plex2to5:[13,23,64,29,714625,79]};
const actual = {
  residential:[market.residential.quarter.sales,market.residential.quarter.newListings,market.residential.quarter.activeListings,market.residential.rolling4Q.sales,market.residential.rolling4Q.newListings,market.residential.rolling4Q.activeListings],
  singleFamily:[market.singleFamily.quarter.sales,market.singleFamily.quarter.activeListings,market.singleFamily.quarter.medianPrice,market.singleFamily.quarter.avgDaysOnMarket,market.singleFamily.rolling4Q.sales,market.singleFamily.rolling4Q.activeListings,market.singleFamily.rolling4Q.medianPrice,market.singleFamily.rolling4Q.avgDaysOnMarket],
  condo:[market.condo.quarter.sales,market.condo.quarter.activeListings,market.condo.quarter.medianPrice,market.condo.quarter.avgDaysOnMarket,market.condo.rolling4Q.sales,market.condo.rolling4Q.activeListings,market.condo.rolling4Q.medianPrice,market.condo.rolling4Q.avgDaysOnMarket],
  plex2to5:[market.plex2to5.quarter.sales,market.plex2to5.quarter.activeListings,market.plex2to5.rolling4Q.sales,market.plex2to5.rolling4Q.activeListings,market.plex2to5.rolling4Q.medianPrice,market.plex2to5.rolling4Q.avgDaysOnMarket],
};
if (JSON.stringify(actual)!==JSON.stringify(expected)) throw new Error('Dataset de marché invalide');
if (market.geographicScope.municipalityCount!==14 || market.verifiedAt!=='2026-08-11') throw new Error('Portée/date du dataset invalide');

const allHtml = pages.map(([file])=>fs.readFileSync(file,'utf8')).join('\n');
for (const old of ['>418<','627000','627 000 $','>635<','38 jours','>245<','61 jours','692500','692 500 $','78 jours','>568<','1 006 nouvelles','913 inscriptions','1 468 ventes','44 jours']) {
  if (allHtml.includes(old)) throw new Error(`Ancienne statistique détectée: ${old}`);
}
console.log('Validation MASTER Vaudreuil-Soulanges réussie: 6 pages, 12 formulaires, dataset, SEO et sitemap.');
