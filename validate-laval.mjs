import {readFile, stat} from 'node:fs/promises';
import {join} from 'node:path';

const root = process.cwd();
const routes = [
  ['secteurs/laval/index.html','https://www.courtierducoin.ca/secteurs/laval/','laval-universal-guide','laval-universal-analysis','universal'],
  ['laval/o1a11/index.html','https://www.courtierducoin.ca/laval/o1a11/','laval-options-plan-confidentiel','laval-options-analysis','options'],
  ['laval/02a22/index.html','https://www.courtierducoin.ca/laval/02a22/','laval-accompagnement-checklist','laval-accompagnement-analysis','accompagnement'],
  ['laval/03i33/index.html','https://www.courtierducoin.ca/laval/03i33/','laval-investisseur-guide','laval-investisseur-analysis','investisseur'],
  ['laval/04m44/index.html','https://www.courtierducoin.ca/laval/04m44/','laval-maison-guide','laval-maison-analysis','maison'],
  ['laval/05c55/index.html','https://www.courtierducoin.ca/laval/05c55/','laval-condo-guide','laval-condo-analysis','condo']
];
const errors = [];
const pass = (condition, message) => { if (!condition) errors.push(message); };
const titles = new Set();
const descriptions = new Set();
const h1s = new Set();
const canonicals = new Set();
const clientKeys = new Set();

for (const [file,canonical,guideKey,analysisKey,image] of routes) {
  const html = await readFile(join(root,file),'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  const h1 = html.match(/<h1>([^<]+)<\/h1>/)?.[1];
  const canonicalFound = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  pass(Boolean(title && description && h1), `${file}: title, description ou H1 manquant`);
  pass(!titles.has(title), `${file}: title dupliqué`); titles.add(title);
  pass(!descriptions.has(description), `${file}: meta description dupliquée`); descriptions.add(description);
  pass(!h1s.has(h1), `${file}: H1 dupliqué`); h1s.add(h1);
  pass(canonicalFound === canonical, `${file}: canonical incorrect`);
  pass(!canonicals.has(canonicalFound), `${file}: canonical dupliqué`); canonicals.add(canonicalFound);
  pass(html.includes('name="robots" content="index,follow,max-image-preview:large"'), `${file}: robots indexable absent`);
  pass((html.match(/<h1>/g) || []).length === 1, `${file}: nombre de H1 différent de 1`);
  pass(html.includes('application/ld+json'), `${file}: JSON-LD absent`);
  for (const schemaType of ['WebPage','BreadcrumbList','Person','Organization','RealEstateAgent','VideoObject','FAQPage']) pass(html.includes(`"@type":"${schemaType}"`), `${file}: schema ${schemaType} absent`);
  pass(html.includes(`/assets/laval/hero-laval-${image}.webp`), `${file}: image héros incorrecte`);
  pass(html.includes('width="1600" height="900"'), `${file}: dimensions image absentes`);
  for (const key of [guideKey,analysisKey]) {
    pass(html.includes(`data-source-key="${key}"`), `${file}: data-source-key ${key} absent`);
    pass(html.includes(`name="source_key" value="${key}"`), `${file}: source_key ${key} absent du HTML`);
    clientKeys.add(key);
  }
  pass((html.match(/name="consent_request"/g) || []).length === 2, `${file}: consentement de demande incomplet`);
  pass((html.match(/name="consent_marketing"/g) || []).length === 2, `${file}: consentement marketing incomplet`);
  pass(!/Vaudreuil|Rosemont|Centre-Ville de Laval/i.test(html), `${file}: résidu d'un autre secteur`);
}

const sourceRegistry = await readFile(join(root,'api/web-form-sources.php'),'utf8');
const serverKeys = new Set([...sourceRegistry.matchAll(/'(laval-[a-z0-9-]+)'\s*=>/g)].map((match) => match[1]));
pass(clientKeys.size === 12, `Client: ${clientKeys.size} IDs, 12 attendus`);
pass(serverKeys.size === 12, `Serveur: ${serverKeys.size} IDs, 12 attendus`);
for (const key of clientKeys) pass(serverKeys.has(key), `Serveur: ID absent ${key}`);
pass([...serverKeys].every((key) => clientKeys.has(key)), 'Serveur: ID Laval sans formulaire client');
pass((sourceRegistry.match(/'region' => 'Laval'/g) || []).length === 12, 'Serveur: Web Region Laval absent pour un formulaire');
pass((sourceRegistry.match(/'region_code' => 'LAV'/g) || []).length === 12, 'Serveur: code région LAV absent pour un formulaire');
const sourceDictionary = await readFile(join(root,'docs/laval-lead-source-dictionary.md'),'utf8');
for (const key of clientKeys) pass(sourceDictionary.includes(key), `Dictionnaire CRM: ${key} absent`);

const contact = await readFile(join(root,'api/contact.php'),'utf8');
pass(contact.includes("'laval.courtierducoin.ca'"), 'contact.php: host Laval non autorisé');
pass(contact.includes("$source['region']"), 'contact.php: région non dérivée du registre serveur');
pass(contact.includes("$source['region_code']"), 'contact.php: code région non dérivé du registre serveur');
pass(contact.includes("$source ? 'Vaudreuil-Soulanges'"), 'contact.php: compatibilité Vaudreuil non préservée');
pass(contact.includes("clean('region', 80) === 'laval'"), 'contact.php: sourceKey Laval non obligatoire');
pass(contact.includes("http_response_code(422)"), 'contact.php: rejet 422 absent');

for (const image of ['universal','options','accompagnement','investisseur','maison','condo']) {
  const file = join(root,'assets/laval',`hero-laval-${image}.webp`);
  const info = await stat(file);
  pass(info.size > 50000 && info.size < 500000, `${file}: poids image hors cible`);
}
const data = JSON.parse(await readFile(join(root,'data/laval-market-data.json'),'utf8'));
pass(data.snapshot.period === 'T2 2026', 'Données: période incorrecte');
pass(data.singleFamily.quarter.medianPrice === 634000, 'Données: médiane maison incorrecte');
pass(data.condo.quarter.medianPrice === 428000, 'Données: médiane condo incorrecte');
pass(data.plex2to5.quarter.medianPrice === 898000, 'Données: médiane plex incorrecte');
pass(data.microMarkets.includes('Îles-Laval'), 'Données: Îles-Laval manquant');
const lavalJs = await readFile(join(root,'laval-master.js'),'utf8');
pass(lavalJs.includes("fetch('/data/laval-market-data.json'"), 'JS: fichier data Laval non utilisé');
pass(!/vaudreuil|rosemont/i.test(lavalJs), 'JS: résidu d’un autre secteur');
const sitemap = await readFile(join(root,'sitemap.xml'),'utf8');
for (const [,canonical] of routes) pass(sitemap.includes(`<loc>${canonical}</loc>`), `Sitemap: ${canonical} absent`);
pass(!sitemap.includes('/centre-ville-de-laval/'), 'Sitemap: anciennes routes Laval encore présentes');
const redirects = JSON.parse(await readFile(join(root,'redirect-map.json'),'utf8'));
for (const host of ['laval.courtierducoin.ca','laval-centre.courtierducoin.ca','centre-laval.courtierducoin.ca']) {
  pass(redirects.filter((item) => item.entry.startsWith(`https://${host}/`)).length === 6, `Redirect map: 6 routes attendues pour ${host}`);
}
const htaccess = await readFile(join(root,'.htaccess'),'utf8');
pass(htaccess.includes('(laval|laval-centre|centre-laval)'), '.htaccess: hôtes Laval absents');
pass(htaccess.includes('entry=laval-universal'), '.htaccess: attribution universelle absente');
pass(htaccess.includes('centre-ville-de-laval/(o1a11|02a22|03i33|04m44|05c55)'), '.htaccess: anciennes campagnes non redirigées');
pass(htaccess.includes('QSA'), '.htaccess: conservation des paramètres absente');

if (errors.length) {
  console.error(`LAVAL_VALIDATION_FAIL (${errors.length})`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log('LAVAL_VALIDATION_PASS');
console.log('6 routes, 6 images, 12 Form IDs client/serveur, données, SEO, schemas, sitemap et redirections conformes.');
