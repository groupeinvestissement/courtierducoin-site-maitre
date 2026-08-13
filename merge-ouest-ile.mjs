import {copyFile, mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, join} from 'node:path';

const root = process.cwd();
const base = 'https://www.courtierducoin.ca';
const key = 'ouest-de-lile';
const prefix = 'ouestile';
const host = 'ouest-ile.courtierducoin.ca';
const codes = ['', 'o1a11', '02a22', '03i33', '04m44', '05c55'];
const types = ['universal', 'options', 'accompagnement', 'investisseur', 'maison', 'condo'];

const route = (lang, code = '') => code
  ? `${lang === 'en' ? 'en/' : ''}${key}/${code}`
  : `${lang === 'en' ? 'en/' : ''}secteurs/${key}`;
const sourceRoute = (lang, code = '') => code
  ? `${lang === 'en' ? 'en/' : ''}ouest-de-lile-sud/${code}`
  : `${lang === 'en' ? 'en/' : ''}secteurs/ouest-de-lile-sud`;
const url = (lang, code = '') => `${base}/${route(lang, code)}/`;

const alt = {
  universal: [
    'Rue résidentielle arborée de l’Ouest-de-l’Île bordée de maisons familiales près de l’eau.',
    'Tree-lined West Island residential street with family homes near the water.'
  ],
  options: [
    'Maison en brique sur une rue calme et arborée de l’Ouest-de-l’Île.',
    'Brick house on a quiet, tree-lined West Island street.'
  ],
  accompagnement: [
    'Maison familiale entourée d’arbres matures dans l’Ouest-de-l’Île.',
    'Family home surrounded by mature trees in the West Island.'
  ],
  investisseur: [
    'Petit immeuble à revenus en brique dans un milieu résidentiel de l’Ouest-de-l’Île.',
    'Small brick income property in a West Island residential setting.'
  ],
  maison: [
    'Maison familiale avec garage dans une rue arborée de l’Ouest-de-l’Île.',
    'Family house with a garage on a tree-lined West Island street.'
  ],
  condo: [
    'Immeuble de copropriétés contemporain dans un milieu verdoyant de l’Ouest-de-l’Île.',
    'Contemporary condominium building in a green West Island setting.'
  ]
};

const broadMicroMarkets = [
  'Pierrefonds-Roxboro', 'L’Île-Bizard–Sainte-Geneviève', 'Dollard-des-Ormeaux',
  'Pointe-Claire', 'Beaconsfield', 'Kirkland', 'Dorval', 'Baie-d’Urfé', 'Senneville'
];

function statsSection(type, lang) {
  const en = lang === 'en';
  const segment = type === 'investisseur' ? 'plex2to5' : type === 'maison' ? 'singleFamily' : type === 'condo' ? 'condo' : 'residential';
  const label = en
    ? ({residential: 'Residential', singleFamily: 'Houses', condo: 'Condominiums', plex2to5: 'Plex — 2 to 5 units'})[segment]
    : ({residential: 'Résidentiel', singleFamily: 'Maisons', condo: 'Condos', plex2to5: 'Plex — 2 à 5 logements'})[segment];
  const card = (side, place) => `<article><small>${place} · ${label}</small><strong data-market-stat="references.${side}.${segment}.quarter.sales">—</strong><b>${en ? 'sales in Q2 2026' : 'ventes au T2 2026'}</b><span><span data-market-stat="references.${side}.${segment}.quarter.activeListings">—</span> ${en ? 'active listings' : 'inscriptions en vigueur'}</span>${segment === 'residential' ? `<span><span data-market-stat="references.${side}.${segment}.quarter.newListings">—</span> ${en ? 'new listings' : 'nouvelles inscriptions'}</span>` : `<span>${en ? 'Median price' : 'Prix médian'}: <span data-market-stat="references.${side}.${segment}.quarter.medianPrice" data-format="currency">—</span></span>`}</article>`;
  return `<section class="rm-section stats"><p class="rm-kicker dark">Centris · ${en ? 'data verified August 12, 2026' : 'données vérifiées le 12 août 2026'}</p><h2>${en ? 'Two verified references, without combining unlike markets.' : 'Deux repères vérifiés, sans mélanger des marchés différents.'}</h2><p>${en ? 'The West Island covers municipalities and boroughs with distinct housing stock. Pierrefonds-Roxboro and Pointe-Claire are shown separately; no West Island average or median is calculated.' : 'L’Ouest-de-l’Île couvre des municipalités et arrondissements aux parcs immobiliers distincts. Pierrefonds-Roxboro et Pointe-Claire sont affichés séparément; aucune moyenne ni médiane de l’Ouest-de-l’Île n’est calculée.'}</p><div class="stat-grid two">${card('north', 'Pierrefonds-Roxboro')}${card('south', 'Pointe-Claire')}</div><small class="source">${en ? 'Sources' : 'Sources'} : <a href="https://www.centris.ca/${en ? 'en/tools/real-estate-statistics/province-of-quebec/montreal-pierrefonds-roxboro' : 'fr/outils/statistiques-immobilieres/province-de-quebec/montreal-pierrefonds-roxboro'}" rel="noopener">Centris — Pierrefonds-Roxboro</a> · <a href="https://www.centris.ca/${en ? 'en/tools/real-estate-statistics/province-of-quebec/pointe-claire' : 'fr/outils/statistiques-immobilieres/province-de-quebec/pointe-claire'}" rel="noopener">Centris — Pointe-Claire</a>. ${en ? 'Masked values are not inferred.' : 'Les valeurs masquées ne sont pas extrapolées.'}</small></section>`;
}

function localize(html, lang, type, code) {
  const en = lang === 'en';
  html = html
    .replaceAll('/assets/ouest-de-lile-sud/', '/assets/ouest-de-lile/')
    .replaceAll('hero-ouest-de-lile-sud-', 'hero-ouest-de-lile-')
    .replaceAll('/data/ouest-de-lile-sud-market-data.json', '/data/ouest-de-lile-market-data.json')
    .replaceAll('ouest-ile-sud.courtierducoin.ca', host)
    .replaceAll('ouest-de-lile-sud', key)
    .replaceAll('ouestsud-page', 'ouestile-page')
    .replaceAll('ouestsud', prefix)
    .replaceAll('Ouest-de-l’Île — Sud', en ? 'West Island' : 'Ouest-de-l’Île')
    .replaceAll('Ouest-de-l’Île Sud', en ? 'West Island' : 'Ouest-de-l’Île')
    .replaceAll('West Island — South', 'West Island')
    .replaceAll('the southern West Island', 'the West Island')
    .replaceAll('southern West Island', 'West Island');

  const names = broadMicroMarkets.map((name) => `<li>${name}</li>`).join('');
  html = html.replace(/<ul class="micro-list">[\s\S]*?<\/ul>/, `<ul class="micro-list">${names}</ul>`);
  html = html.replace(/<section class="rm-section stats">[\s\S]*?<\/section>/, statsSection(type, lang));
  html = html.replace(/(<figure class="property-proof-photo"><img src="[^"]+" alt=")[^"]+("[^>]*>)/, `$1${alt[type][en ? 1 : 0]}$2`);

  if (type === 'universal') {
    html = html
      .replace(/<h1>[\s\S]*?<\/h1>/, `<h1>${en ? 'Thinking of selling in the West Island? Start by placing your property in its real micro-market.' : 'Vous pensez vendre dans l’Ouest-de-l’Île? Commencez par situer votre propriété dans son vrai micro-marché.'}</h1>`)
      .replace(/<p class="rm-lead">[\s\S]*?<\/p>/, `<p class="rm-lead">${en ? 'A house in Pierrefonds, property in Beaconsfield, condo in Dorval or residence near Lake Saint-Louis will not be read the same way. Municipality, street, property type, condition, documents and active competition all shape value.' : 'Maison à Pierrefonds, propriété à Beaconsfield, condo à Dorval ou résidence près du lac Saint-Louis : la municipalité, la rue, la typologie, l’état, les documents et la concurrence active modifient la valeur.'}</p>`)
      .replace(/<div class="trust-line">[\s\S]*?<\/div>/, `<div class="trust-line">Pierrefonds • Pointe-Claire • Dollard-des-Ormeaux • Beaconsfield • Dorval</div>`)
      .replace(/(<div class="property-proof-copy">[\s\S]*?<h2>)[\s\S]*?(<\/h2>)/, `$1${en ? 'The West Island brings together several distinct residential markets.' : 'L’Ouest-de-l’Île réunit plusieurs marchés résidentiels distincts.'}$2`)
      .replace(/<p class="intro">[\s\S]*?<\/p>/, `<p class="intro">${en ? 'Waterfront setting, municipality, lot, building age, transportation and property type can all change the comparison. Regional statistics provide context; they do not replace relevant comparable sales.' : 'Le contexte riverain, la municipalité, le terrain, l’âge du bâtiment, les transports et la typologie peuvent changer la comparaison. Les statistiques donnent un contexte; elles ne remplacent pas les ventes comparables pertinentes.'}</p>`);
  }

  html = html
    .replaceAll('Pointe-Claire Village, Valois Village, Cedar Park, Bowling Green, Terra-Cotta et Lakeshore', broadMicroMarkets.join(', '))
    .replaceAll('Pointe-Claire Village, Valois Village, Cedar Park, Bowling Green, Terra-Cotta and Lakeshore', broadMicroMarkets.join(', '))
    .replaceAll('Pointe-Claire-wide statistics', 'West Island reference statistics')
    .replaceAll('Une statistique de Pointe-Claire', 'Un seul repère statistique')
    .replaceAll('A Pointe-Claire statistic', 'One statistical reference')
    .replaceAll('v=20260812-ouestsud-v1', 'v=20260813-ouestile-v1');

  const canonical = url(lang, code);
  const other = url(en ? 'fr' : 'en', code);
  html = html
    .replace(/<link rel="canonical" href="[^"]+">/, `<link rel="canonical" href="${canonical}">`)
    .replace(/<link rel="alternate" hreflang="fr-CA" href="[^"]+">/, `<link rel="alternate" hreflang="fr-CA" href="${url('fr', code)}">`)
    .replace(/<link rel="alternate" hreflang="en-CA" href="[^"]+">/, `<link rel="alternate" hreflang="en-CA" href="${url('en', code)}">`)
    .replace(/<link rel="alternate" hreflang="x-default" href="[^"]+">/, `<link rel="alternate" hreflang="x-default" href="${url('fr', code)}">`)
    .replaceAll(other.replace(base, ''), other.replace(base, ''));
  return html;
}

async function writePages() {
  for (const lang of ['fr', 'en']) {
    for (let index = 0; index < codes.length; index += 1) {
      const code = codes[index];
      const src = join(root, sourceRoute(lang, code), 'index.html');
      const dest = join(root, route(lang, code), 'index.html');
      await mkdir(dirname(dest), {recursive: true});
      const html = localize(await readFile(src, 'utf8'), lang, types[index], code);
      await writeFile(dest, html, 'utf8');
    }
  }
}

async function writeAssetsAndData() {
  const selections = {
    universal: ['ouest-de-lile-sud', 'universal'],
    options: ['ouest-de-lile-nord', 'options'],
    accompagnement: ['ouest-de-lile-sud', 'accompagnement'],
    investisseur: ['ouest-de-lile-nord', 'investisseur'],
    maison: ['ouest-de-lile-sud', 'maison'],
    condo: ['ouest-de-lile-nord', 'condo']
  };
  await mkdir(join(root, 'assets', key), {recursive: true});
  for (const [type, [sourceKey, sourceType]] of Object.entries(selections)) {
    await copyFile(
      join(root, 'assets', sourceKey, `hero-${sourceKey}-${sourceType}.webp`),
      join(root, 'assets', key, `hero-${key}-${type}.webp`)
    );
  }
  const north = JSON.parse(await readFile(join(root, 'data', 'ouest-de-lile-nord-market-data.json'), 'utf8'));
  const south = JSON.parse(await readFile(join(root, 'data', 'ouest-de-lile-sud-market-data.json'), 'utf8'));
  const selectReference = (source, name) => ({
    name,
    geography: source.snapshot.geography,
    granularityNote: source.snapshot.granularityNote,
    residential: source.residential,
    singleFamily: source.singleFamily,
    condo: source.condo,
    plex2to5: source.plex2to5,
    sources: source.sources
  });
  const merged = {
    region: {key: 'ouest-ile', publicName: 'Ouest-de-l’Île', canonical: `${base}/secteurs/${key}/`, marketingHost: host},
    snapshot: {period: 'T2 2026', accessedAt: '2026-08-12', geography: 'Deux repères Centris présentés séparément', granularityNote: 'Aucune moyenne ni médiane combinée n’est calculée pour l’Ouest-de-l’Île.'},
    references: {north: selectReference(north, 'Pierrefonds-Roxboro'), south: selectReference(south, 'Pointe-Claire')},
    microMarkets: broadMicroMarkets,
    rules: {missingValue: null, noCombinedMedian: true, notAnAutomatedValuation: true, visibleStatisticsMustResolveFromThisFile: true}
  };
  await writeFile(join(root, 'data', 'ouest-de-lile-market-data.json'), `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
}

async function updateRegistryAndBackend() {
  const registryPath = join(root, 'api', 'web-form-sources.php');
  let registry = await readFile(registryPath, 'utf8');
  if (!registry.includes(`'${prefix}-universal-analysis'`)) {
    const entries = [
      ['universal-analysis', 'Universelle', 'universal', 'Analyse de propriété', 'General seller / property analysis'],
      ['universal-guide', 'Universelle', 'universal', 'Guide vendeur', 'General seller / property analysis'],
      ['options-analysis', 'Options', 'o1a11', 'Faire le point - Options', 'Time-sensitive / options'],
      ['options-plan-confidentiel', 'Options', 'o1a11', 'Plan confidentiel', 'Time-sensitive / options'],
      ['accompagnement-analysis', 'Accompagnement', '02a22', 'Faire le point', 'Succession / multi-party'],
      ['accompagnement-checklist', 'Accompagnement', '02a22', 'Checklist succession', 'Succession / multi-party'],
      ['investisseur-analysis', 'Patrimoine / Investisseur', '03i33', 'Analyse immeuble', 'Plex / income property'],
      ['investisseur-guide', 'Patrimoine / Investisseur', '03i33', 'Guide vendeur de plex', 'Plex / income property'],
      ['maison-analysis', 'Maison', '04m44', 'Analyse maison', 'House seller'],
      ['maison-guide', 'Maison', '04m44', 'Guide vendeur de maison', 'House seller'],
      ['condo-analysis', 'Condo', '05c55', 'Analyse condo', 'Condo seller'],
      ['condo-guide', 'Condo', '05c55', 'Guide vendeur de condo', 'Condo seller']
    ].map(([suffix, page, code, type, context]) => {
      const canonical = code === 'universal' ? url('fr') : url('fr', code);
      return `    '${prefix}-${suffix}' => ['region' => 'Ouest-de-l’Île', 'region_code' => 'OI', 'page' => '${page}', 'code' => '${code}', 'type' => '${type}', 'context' => '${context}', 'canonical' => '${canonical}'],`;
    }).join('\n');
    registry = registry.replace(/\n\];\s*$/, `\n${entries}\n];\n`);
    await writeFile(registryPath, registry, 'utf8');
  }

  const contactPath = join(root, 'api', 'contact.php');
  let contact = await readFile(contactPath, 'utf8');
  contact = contact.replaceAll("'ouest-ile-nord.courtierducoin.ca', 'ouest-ile-sud.courtierducoin.ca'", "'ouest-ile-nord.courtierducoin.ca', 'ouest-ile-sud.courtierducoin.ca', 'ouest-ile.courtierducoin.ca'");
  contact = contact.replace("$submittedRegion === 'ouest-de-lile-nord' || $submittedRegion === 'ouest-de-lile-sud'", "$submittedRegion === 'ouest-de-lile-nord' || $submittedRegion === 'ouest-de-lile-sud' || $submittedRegion === 'ouest-de-lile'");
  contact = contact.replace("clean('canonical_url', 1000) === 'https://www.courtierducoin.ca/secteurs/ouest-de-lile-sud/'", "clean('canonical_url', 1000) === 'https://www.courtierducoin.ca/secteurs/ouest-de-lile-sud/' || str_starts_with(clean('canonical_url', 1000), 'https://www.courtierducoin.ca/ouest-de-lile/') || clean('canonical_url', 1000) === 'https://www.courtierducoin.ca/secteurs/ouest-de-lile/'");
  await writeFile(contactPath, contact, 'utf8');
}

async function updateRouting() {
  const htaccessPath = join(root, '.htaccess');
  let htaccess = await readFile(htaccessPath, 'utf8');
  htaccess = htaccess.replace(/RewriteCond %\{HTTP_HOST\} \^ouest-ile-nord\\\.courtierducoin\\\.ca\$ \[NC\][\s\S]*?RewriteRule \^\(o1a11\|02a22\|03i33\|04m44\|05c55\)\/\?\$ https:\/\/www\.courtierducoin\.ca\/ouest-de-lile-nord\/\$1\/\?entry=ouestnord-\$1 \[R=301,L,QSA\]\r?\n/, '');
  htaccess = htaccess.replace(/RewriteCond %\{HTTP_HOST\} \^ouest-ile-sud\\\.courtierducoin\\\.ca\$ \[NC\][\s\S]*?RewriteRule \^\(o1a11\|02a22\|03i33\|04m44\|05c55\)\/\?\$ https:\/\/www\.courtierducoin\.ca\/ouest-de-lile-sud\/\$1\/\?entry=ouestsud-\$1 \[R=301,L,QSA\]\r?\n/, '');
  const rules = `# Ouest-de-l’Île unifié : les anciens hôtes et les anciennes routes conservent leurs paramètres.\nRewriteCond %{HTTP_HOST} ^(ouest-ile|ouest-ile-nord|ouest-ile-sud)\\.courtierducoin\\.ca$ [NC]\nRewriteRule ^$ https://www.courtierducoin.ca/secteurs/ouest-de-lile/?entry=ouestile-universal [R=301,L,NE,QSA]\nRewriteCond %{HTTP_HOST} ^(ouest-ile|ouest-ile-nord|ouest-ile-sud)\\.courtierducoin\\.ca$ [NC]\nRewriteRule ^(o1a11|02a22|03i33|04m44|05c55)/?$ https://www.courtierducoin.ca/ouest-de-lile/$1/?entry=ouestile-$1 [R=301,L,NE,QSA]\nRewriteRule ^secteurs/ouest-de-lile-(nord|sud)/?$ https://www.courtierducoin.ca/secteurs/ouest-de-lile/?entry=ouestile-universal [R=301,L,NE,QSA]\nRewriteRule ^ouest-de-lile-(nord|sud)/(o1a11|02a22|03i33|04m44|05c55)/?$ https://www.courtierducoin.ca/ouest-de-lile/$2/?entry=ouestile-$2 [R=301,L,NE,QSA]\nRewriteRule ^en/secteurs/ouest-de-lile-(nord|sud)/?$ https://www.courtierducoin.ca/en/secteurs/ouest-de-lile/ [R=301,L,NE,QSA]\nRewriteRule ^en/ouest-de-lile-(nord|sud)/(o1a11|02a22|03i33|04m44|05c55)/?$ https://www.courtierducoin.ca/en/ouest-de-lile/$2/ [R=301,L,NE,QSA]\n`;
  if (!htaccess.includes('Ouest-de-l’Île unifié')) htaccess = htaccess.replace('RewriteEngine On\n', `RewriteEngine On\n${rules}`);
  await writeFile(htaccessPath, htaccess, 'utf8');

  const mapPath = join(root, 'redirect-map.json');
  let redirects = JSON.parse(await readFile(mapPath, 'utf8'));
  redirects = redirects.filter((item) => !item.entry.startsWith(`https://${host}/`));
  for (const oldHost of ['ouest-ile-nord.courtierducoin.ca', 'ouest-ile-sud.courtierducoin.ca']) {
    for (const code of codes) {
      const entry = `https://${oldHost}/${code}`;
      const destination = `${url('fr', code)}?entry=${prefix}-${code || 'universal'}`;
      const existing = redirects.find((item) => item.entry === entry);
      if (existing) Object.assign(existing, {destination, status: 301, preserveQuery: true});
      else redirects.push({entry, destination, status: 301, preserveQuery: true});
    }
  }
  for (const code of codes) redirects.push({entry: `https://${host}/${code}`, destination: `${url('fr', code)}?entry=${prefix}-${code || 'universal'}`, status: 301, preserveQuery: true});
  for (const oldKey of ['ouest-de-lile-nord', 'ouest-de-lile-sud']) {
    for (const lang of ['fr', 'en']) {
      for (const code of codes) {
        const oldPath = code ? `${lang === 'en' ? 'en/' : ''}${oldKey}/${code}` : `${lang === 'en' ? 'en/' : ''}secteurs/${oldKey}`;
        redirects.push({entry: `${base}/${oldPath}/`, destination: url(lang, code), status: 301, preserveQuery: true});
      }
    }
  }
  const byEntry = new Map(redirects.map((item) => [item.entry, item]));
  await writeFile(mapPath, `${JSON.stringify([...byEntry.values()], null, 2)}\n`, 'utf8');
}

async function updateDiscoverySurfaces() {
  const sitemapPath = join(root, 'sitemap.xml');
  let sitemap = await readFile(sitemapPath, 'utf8');
  sitemap = sitemap.replace(/\s*<url><loc>https:\/\/www\.courtierducoin\.ca\/(?:en\/)?(?:secteurs\/)?ouest-de-lile-(?:nord|sud)(?:\/(?:o1a11|02a22|03i33|04m44|05c55))?\/<\/loc><\/url>/g, '');
  for (const lang of ['fr', 'en']) for (const code of codes) {
    const canonical = url(lang, code);
    if (!sitemap.includes(`<loc>${canonical}</loc>`)) sitemap = sitemap.replace('</urlset>', `  <url><loc>${canonical}</loc></url>\n</urlset>`);
  }
  await writeFile(sitemapPath, sitemap, 'utf8');

  const homePath = join(root, 'index.html');
  let home = await readFile(homePath, 'utf8');
  home = home.replace(/<a class="sector-card" href="\/secteurs\/ouest-de-lile-nord\/"[\s\S]*?<\/a><a class="sector-card" href="\/secteurs\/ouest-de-lile-sud\/"[\s\S]*?<\/a>/, `<a class="sector-card" href="/secteurs/${key}/" data-fr-href="/secteurs/${key}/" data-en-href="/en/secteurs/${key}/"><b>Ouest-de-l’Île</b><span>Consulter la page locale complète →</span></a>`);
  await writeFile(homePath, home, 'utf8');

  const scriptPath = join(root, 'script.js');
  let script = await readFile(scriptPath, 'utf8');
  script = script.replace("'Ouest-de-l’Île — Nord':'West Island — North','Ouest-de-l’Île — Sud':'West Island — South'", "'Ouest-de-l’Île':'West Island'");
  await writeFile(scriptPath, script, 'utf8');

  const validatorPath = join(root, 'validate-sector.mjs');
  let validator = await readFile(validatorPath, 'utf8');
  if (!validator.includes("'ouest-de-lile':")) validator = validator.replace("  'ouest-de-lile-nord':", `  'ouest-de-lile': {prefix:'${prefix}',host:'${host}',imageDir:'${key}',data:'ouest-de-lile-market-data.json'},\n  'ouest-de-lile-nord':`);
  await writeFile(validatorPath, validator, 'utf8');
}

await writeAssetsAndData();
await writePages();
await updateRegistryAndBackend();
await updateRouting();
await updateDiscoverySurfaces();
console.log('Merged West Island North and South into 12 bilingual pages with preserved redirects.');
