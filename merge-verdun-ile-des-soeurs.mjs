import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const root = process.cwd();
const base = 'https://www.courtierducoin.ca';
const key = 'verdun-ile-des-soeurs';
const nameFr = 'Verdun / L’Île-des-Sœurs';
const nameEn = 'Verdun / Nuns’ Island';
const prefix = 'verdunids';
const host = 'verdun.courtierducoin.ca';
const codes = ['', 'o1a11', '02a22', '03i33', '04m44', '05c55'];
const types = ['universal', 'options', 'accompagnement', 'investisseur', 'maison', 'condo'];
const suffixes = ['universal-guide','universal-analysis','options-plan-confidentiel','options-analysis','accompagnement-checklist','accompagnement-analysis','investisseur-guide','investisseur-analysis','maison-guide','maison-analysis','condo-guide','condo-analysis'];
const areasFr = ['Wellington–De l’Église', 'Desmarchais-Crawford', 'Berges de Verdun', 'Pointe-Sud', 'Pointe-Nord', 'centre de L’Île-des-Sœurs'];
const areasEn = ['Wellington–De l’Église', 'Desmarchais-Crawford', 'Verdun riverfront', 'Pointe-Sud', 'Pointe-Nord', 'central Nuns’ Island'];

const copyMap = {
  universal: ['verdun', 'universal'],
  options: ['verdun', 'options'],
  accompagnement: ['verdun', 'accompagnement'],
  investisseur: ['verdun', 'investisseur'],
  maison: ['ile-des-soeurs', 'maison'],
  condo: ['ile-des-soeurs', 'condo']
};

const copyFr = {
  universal: {
    title: `Courtier immobilier à ${nameFr} | Pierre Dalpé`,
    description: `Vous pensez vendre une maison, un condo ou un plex à ${nameFr}? Analyse locale, préparation et accompagnement direct avec Pierre Dalpé.`,
    h1: `Vous pensez vendre à Verdun ou à L’Île-des-Sœurs? Commencez par situer votre propriété dans son vrai micro-marché.`,
    lead: `Duplex près de Wellington, maison à Desmarchais-Crawford, condo à Pointe-Sud ou propriété près du Domaine Saint-Paul : la valeur change selon la typologie, la rue, l’immeuble, les documents et la concurrence actuelle.`,
    proofTitle: `Verdun et L’Île-des-Sœurs réunissent des micro-marchés très différents.`,
    proofIntro: `Le Verdun continental se distingue par ses plex, ses rues urbaines et l’accès au métro; L’Île-des-Sœurs par ses copropriétés, ses maisons de ville, ses immeubles et ses secteurs riverains. Les données communes donnent un contexte, mais les comparables doivent rester propres au bon territoire.`,
    alt: `Vue résidentielle représentant les milieux urbains de Verdun et les copropriétés verdoyantes de L’Île-des-Sœurs.`
  },
  options: {
    title: `Options immobilières à ${nameFr} | Décider clairement`,
    description: `Préavis, échéance, taxes impayées ou offre rapide à ${nameFr} : clarifiez les dates, la valeur, le produit net et vos options.`,
    h1: `Une échéance approche à Verdun ou à L’Île-des-Sœurs? Commencez par organiser le document, les dates, la valeur et vos options.`,
    lead: `Un préavis, des taxes impayées, une séparation financière ou une offre rapide peuvent créer de la pression. Pierre organise le volet immobilier avec discrétion, sans remplacer votre notaire, avocat, créancier ou municipalité.`,
    proofTitle: `Une décision pressée devient plus claire quand les faits sont séparés.`,
    proofIntro: `La propriété doit être comparée dans son vrai micro-marché : un plex du Verdun continental et un condo de L’Île-des-Sœurs ne répondent ni aux mêmes acheteurs ni aux mêmes documents.`,
    alt: `Propriété résidentielle sobre dans le Verdun continental, utilisée pour présenter les options immobilières.`
  },
  accompagnement: {
    title: `Succession et propriété héritée à ${nameFr} | Pierre Dalpé`,
    description: `Propriété héritée ou succession à ${nameFr} : organisez les documents, la valeur, la préparation et le calendrier avec Pierre Dalpé.`,
    h1: `Une propriété héritée à Verdun ou à L’Île-des-Sœurs demande un plan clair avant la mise en marché.`,
    lead: `Lorsque le dossier implique plusieurs héritiers ou une personne à distance, la priorité est de clarifier les rôles, les autorisations, les documents et l’état du bâtiment.`,
    proofTitle: `Le rôle du courtier est d’organiser le volet immobilier.`,
    proofIntro: `Le type de propriété change le dossier : plex et maison dans le Verdun continental, copropriété ou maison de ville à L’Île-des-Sœurs. Le liquidateur, le notaire et les autres professionnels conservent leur rôle.`,
    alt: `Propriété familiale établie dans Verdun, utilisée pour illustrer un accompagnement de succession.`
  },
  investisseur: {
    title: `Plex et immeuble à revenus à ${nameFr} | Pierre Dalpé`,
    description: `Duplex, triplex ou actif locatif à ${nameFr} : organisez revenus, dépenses, occupation, travaux et valeur.`,
    h1: `Vous pensez vendre un plex ou un actif locatif à Verdun ou à L’Île-des-Sœurs? Commencez par mettre les chiffres et le bâtiment en contexte.`,
    lead: `Les loyers, les dépenses, les baux, l’occupation, les travaux et l’état du bâtiment influencent la lecture des acheteurs. La typologie et le micro-marché déterminent ensuite les comparables pertinents.`,
    proofTitle: `La valeur d’un immeuble ne tient pas dans un multiplicateur isolé.`,
    proofIntro: `Un plex du Verdun continental et une copropriété locative de L’Île-des-Sœurs demandent des lectures différentes. Le dossier doit relier les revenus, les dépenses, les documents et les ventes réellement comparables.`,
    alt: `Plex en brique du Verdun continental, représentatif du marché des immeubles à revenus.`
  },
  maison: {
    title: `Vendre une maison à ${nameFr} | Valeur et préparation`,
    description: `Vendre une maison à ${nameFr} : analysez la valeur, les travaux utiles, la préparation, la concurrence et le calendrier.`,
    h1: `Vous pensez vendre votre maison à Verdun ou à L’Île-des-Sœurs? Commencez par savoir ce qui mérite votre attention.`,
    lead: `Maison à Desmarchais-Crawford ou maison de ville sur L’Île-des-Sœurs : le terrain, l’état, les travaux, la présentation, les documents et la concurrence doivent être analysés ensemble.`,
    proofTitle: `La bonne préparation est sélective.`,
    proofIntro: `L’objectif n’est pas de transformer la propriété. Il est de réduire les objections, mettre en valeur ses forces et adapter les travaux utiles au calendrier et aux attentes du bon micro-marché.`,
    alt: `Maison de ville dans un environnement verdoyant de L’Île-des-Sœurs.`
  },
  condo: {
    title: `Vendre un condo à ${nameFr} | Documents et stratégie`,
    description: `Vendre un condo à ${nameFr} : préparez les documents de copropriété, la valeur, la présentation et la stratégie de mise en marché.`,
    h1: `Vous pensez vendre votre condo à Verdun ou à L’Île-des-Sœurs? Commencez par préparer le bon dossier.`,
    lead: `L’unité, l’immeuble, l’étage, la vue, les frais, les procès-verbaux, les états financiers, l’assurance et le fonds de prévoyance peuvent tous influencer la décision d’un acheteur.`,
    proofTitle: `Les acheteurs évaluent l’unité et la copropriété.`,
    proofIntro: `Un condo près du métro à Verdun et une unité à Pointe-Sud ou Pointe-Nord ne partagent pas toujours les mêmes comparables. Les documents de l’immeuble et la concurrence directe restent déterminants.`,
    alt: `Immeuble de copropriétés contemporain dans un secteur verdoyant de L’Île-des-Sœurs.`
  }
};

const copyEn = {
  universal: {
    title: `${nameEn} real estate broker | Pierre Dalpé`,
    description: `Thinking of selling a house, condo or plex in ${nameEn}? Get a local review, preparation plan and direct guidance from Pierre Dalpé.`,
    h1: `Thinking of selling in Verdun or on Nuns’ Island? Start by placing your property in its real micro-market.`,
    lead: `A duplex near Wellington, a Desmarchais-Crawford house, a Pointe-Sud condo or a property near Domaine Saint-Paul will not be read the same way. Property type, street, building, documents and active competition all shape value.`,
    proofTitle: `Verdun and Nuns’ Island contain very different residential micro-markets.`,
    proofIntro: `Mainland Verdun is defined by plexes, urban streets and metro access; Nuns’ Island by condominiums, townhouses, residential buildings and waterfront settings. Combined statistics provide context, but comparable sales must remain specific to the right territory.`,
    alt: `Residential view representing Verdun’s urban fabric and the landscaped condominium settings of Nuns’ Island.`
  },
  options: {
    title: `Real estate options in ${nameEn} | Decide clearly`,
    description: `Notice, deadline, unpaid taxes or quick offer in ${nameEn}: clarify dates, value, net proceeds and available options.`,
    h1: `A deadline is approaching in Verdun or on Nuns’ Island? Start by organizing the document, dates, value and available options.`,
    lead: `An official notice, unpaid taxes, a financial separation or a quick offer can create pressure. Pierre organizes the real estate side discreetly without replacing your notary, lawyer, creditor or municipality.`,
    proofTitle: `A pressured decision becomes clearer when the facts are separated.`,
    proofIntro: `The property must be compared within its real micro-market: a mainland Verdun plex and a Nuns’ Island condo do not attract the same buyers or require the same document review.`,
    alt: `Quiet residential property in mainland Verdun used to present real estate options.`
  },
  accompagnement: {
    title: `Estate and inherited property in ${nameEn} | Pierre Dalpé`,
    description: `Inherited property or estate in ${nameEn}: organize documents, value, preparation and timing with Pierre Dalpé.`,
    h1: `An inherited property in Verdun or on Nuns’ Island needs a clear plan before marketing begins.`,
    lead: `When a file involves several heirs or someone living at a distance, the priority is to clarify roles, authorizations, documents and building condition.`,
    proofTitle: `The broker’s role is to organize the real estate side.`,
    proofIntro: `The property type changes the file: a plex or house in mainland Verdun, a condominium or townhouse on Nuns’ Island. The liquidator, notary and other professionals retain their roles.`,
    alt: `Long-held family property in Verdun used to illustrate estate guidance.`
  },
  investisseur: {
    title: `Plex and income property in ${nameEn} | Pierre Dalpé`,
    description: `Duplex, triplex or rental asset in ${nameEn}: organize income, expenses, occupancy, work and value.`,
    h1: `Thinking of selling a plex or rental asset in Verdun or on Nuns’ Island? Start by placing the numbers and building in context.`,
    lead: `Rent, expenses, leases, occupancy, work and building condition influence how buyers read the property. Property type and micro-market then determine the relevant comparable sales.`,
    proofTitle: `An income property’s value cannot be reduced to one isolated multiplier.`,
    proofIntro: `A mainland Verdun plex and a rented condominium on Nuns’ Island require different readings. The file must connect income, expenses, documents and genuinely comparable sales.`,
    alt: `Brick plex in mainland Verdun representative of the income-property market.`
  },
  maison: {
    title: `Selling a house in ${nameEn} | Value and preparation`,
    description: `Selling a house in ${nameEn}: review value, useful work, preparation, competition and timing.`,
    h1: `Thinking of selling your house in Verdun or on Nuns’ Island? Start by knowing what deserves attention.`,
    lead: `A Desmarchais-Crawford house and a Nuns’ Island townhouse need different comparable sales. Lot, condition, work, presentation, documents and active competition should be reviewed together.`,
    proofTitle: `Good preparation is selective.`,
    proofIntro: `The goal is not to transform the property. It is to reduce objections, highlight strengths and align useful work with the timing and expectations of the right micro-market.`,
    alt: `Townhouse in a landscaped residential setting on Nuns’ Island.`
  },
  condo: {
    title: `Selling a condo in ${nameEn} | Documents and strategy`,
    description: `Selling a condo in ${nameEn}: prepare co-ownership documents, value, presentation and marketing strategy.`,
    h1: `Thinking of selling your condo in Verdun or on Nuns’ Island? Start by preparing the right file.`,
    lead: `The unit, building, floor, view, fees, minutes, financial statements, insurance and reserve fund can all influence a buyer’s decision.`,
    proofTitle: `Buyers evaluate both the unit and the co-ownership.`,
    proofIntro: `A condo near the Verdun metro and a Pointe-Sud or Pointe-Nord unit do not always share the same comparable sales. Building documents and direct competition remain decisive.`,
    alt: `Contemporary condominium building in a landscaped area of Nuns’ Island.`
  }
};

const pathFor = (code, lang = 'fr', sectorKey = key) => code ? `${lang === 'en' ? 'en/' : ''}${sectorKey}/${code}` : `${lang === 'en' ? 'en/' : ''}secteurs/${sectorKey}`;
const canonicalFor = (code, lang = 'fr') => `${base}/${pathFor(code, lang)}/`;

function replaceSectorName(html, lang) {
  const token = '__VERDUN_IDS__';
  if (lang === 'fr') {
    html = html
      .replaceAll('dans le Verdun continental', `à ${token}`)
      .replaceAll('du Verdun continental continental', `de ${token}`)
      .replaceAll('du Verdun continental', `de ${token}`)
      .replaceAll('le Verdun continental', token)
      .replaceAll('Verdun continental', token)
      .replaceAll('Verdun/Île-des-Sœurs', token)
      .replaceAll('Verdun/Île-des-Soeurs', token)
      .replaceAll('Verdun et l’Île-des-Sœurs', token)
      .replaceAll('Verdun et L’Île-des-Sœurs', token)
      .replaceAll('dans Verdun', `à ${token}`)
      .replaceAll('Verdun', token)
      .replaceAll(token, nameFr);
  } else {
    html = html
      .replaceAll('mainland Verdun', token)
      .replaceAll('Mainland Verdun', token)
      .replaceAll('Verdun/Nuns’ Island', token)
      .replaceAll('Verdun and Nuns’ Island', token)
      .replaceAll('Verdun', token)
      .replaceAll(token, nameEn);
  }
  return html;
}

function transformPage(source, lang, code, type) {
  const text = (lang === 'fr' ? copyFr : copyEn)[type];
  let html = source
    .replaceAll('/assets/verdun/hero-verdun-', `/assets/${key}/hero-${key}-`)
    .replaceAll('/data/verdun-market-data.json', `/data/${key}-market-data.json`)
    .replaceAll('/en/secteurs/verdun/', `/en/secteurs/${key}/`)
    .replaceAll('/secteurs/verdun/', `/secteurs/${key}/`)
    .replaceAll('/en/verdun/', `/en/${key}/`)
    .replaceAll('/verdun/', `/${key}/`)
    .replaceAll('data-region="verdun"', `data-region="${key}"`)
    .replaceAll('data-entry-prefix="verdun"', `data-entry-prefix="${prefix}"`)
    .replaceAll('name="region" value="verdun"', `name="region" value="${key}"`)
    .replaceAll('v=20260813-verdun-v1', 'v=20260814-verdunids-v1');

  for (const suffix of suffixes) html = html.replaceAll(`verdun-${suffix}`, `${prefix}-${suffix}`);
  html = html.replaceAll(`class="rm-page sector-page verdun-page verdun-${type}"`, `class="rm-page sector-page verdun-ids-page verdun-ids-${type}"`);
  html = html.replaceAll('id="verdun-', `id="${prefix}-`).replaceAll('list="verdun-', `list="${prefix}-`);
  html = replaceSectorName(html, lang);
  html = html.replace(/data-region-name="[^"]+"/, `data-region-name="${lang === 'fr' ? nameFr : nameEn}"`);

  if (lang === 'fr') {
    html = html
      .replaceAll(`Le ${nameFr}, plusieurs micro-marchés.`, 'Verdun et L’Île-des-Sœurs : plusieurs micro-marchés.')
      .replaceAll(`Centris regroupe ${nameFr} : ces chiffres couvrent les deux territoires et ne sont pas attribuables au seul ${nameFr}.`, 'Centris regroupe Verdun et L’Île-des-Sœurs : ces chiffres couvrent les deux territoires et ne sont pas attribuables à une seule propriété ou à un seul micro-marché.');
  } else {
    html = html
      .replaceAll(`${nameEn}, several micro-markets.`, 'Verdun and Nuns’ Island: several micro-markets.')
      .replaceAll(`Centris groups ${nameEn}: these figures cover both territories and are not attributable to ${nameEn} alone.`, 'Centris groups Verdun and Nuns’ Island: these figures cover both territories and are not attributable to one property or one micro-market.');
  }

  const currentTitle = html.match(/<title>([^<]+)<\/title>/)?.[1] || '';
  const currentDescription = html.match(/<meta name="description" content="([^"]+)"/)?.[1] || '';
  if (currentTitle) html = html.replaceAll(currentTitle, text.title);
  if (currentDescription) html = html.replaceAll(currentDescription, text.description);
  html = html
    .replace(/<h1>[\s\S]*?<\/h1>/, `<h1>${text.h1}</h1>`)
    .replace(/<p class="rm-lead">[\s\S]*?<\/p>/, `<p class="rm-lead">${text.lead}</p>`)
    .replace(/(<section class="rm-section property-proof-section"><div class="property-proof-copy"><p[^>]*>[^<]*<\/p><h2>)[\s\S]*?(<\/h2><p class="intro">)[\s\S]*?(<\/p>)/, `$1${text.proofTitle}$2${text.proofIntro}$3`)
    .replace(/(<figure class="property-proof-photo"><img src="[^"]+" alt=")[^"]+(" )/, `$1${text.alt}$2`)
    .replace(/<div class="trust-line">[\s\S]*?<\/div>/, `<div class="trust-line">${lang === 'fr' ? areasFr.join(' • ') : areasEn.join(' • ')}</div>`)
    .replace(/<datalist id="([^"]+)">[\s\S]*?<\/datalist>/, (_, id) => `<datalist id="${id}">${(lang === 'fr' ? areasFr : areasEn).map(area => `<option>${area}</option>`).join('')}</datalist>`)
    .replace(/<ul class="micro-list">[\s\S]*?<\/ul>/, `<ul class="micro-list">${(lang === 'fr' ? areasFr : areasEn).map(area => `<li>${area}</li>`).join('')}</ul>`);

  if (lang === 'fr') html = html.replace('<section class="rm-section shade"><p class="rm-kicker dark">Méthode</p>', '<section class="rm-section process"><p class="rm-kicker">Méthode</p>');
  else html = html.replace('<section class="rm-section shade"><p class="rm-kicker dark">Method</p>', '<section class="rm-section process"><p class="rm-kicker">Method</p>');
  html = html.replaceAll('class="rm-kicker "', 'class="rm-kicker"');

  if (!html.includes(`data-region="${key}"`) || !html.includes(`/sector-master.css`) || !html.includes(`/assets/${key}/`)) throw new Error(`Transformation incomplète: ${lang} ${code || 'universal'}`);
  return html;
}

async function createAssetsAndData() {
  await mkdir(join(root, 'assets', key), { recursive: true });
  for (const [type, [sourceKey, sourceType]] of Object.entries(copyMap)) {
    await copyFile(join(root, 'assets', sourceKey, `hero-${sourceKey}-${sourceType}.webp`), join(root, 'assets', key, `hero-${key}-${type}.webp`));
  }
  const market = JSON.parse(await readFile(join(root, 'data', 'verdun-market-data.json'), 'utf8'));
  market.region = { key, publicName: nameFr, canonical: canonicalFor(''), marketingHost: host };
  market.snapshot.granularityNote = 'Centris publie Verdun et L’Île-des-Sœurs dans un même profil. Les données couvrent donc le nouveau secteur unifié; elles ne remplacent jamais une analyse par type de propriété et micro-marché.';
  market.microMarkets = areasFr;
  market.localContext.propertyDiversityNote = 'Le secteur unifié réunit les plex, maisons et copropriétés du Verdun continental ainsi que les copropriétés, maisons de ville et maisons de L’Île-des-Sœurs. Les comparables doivent rester propres au territoire et à la typologie.';
  await writeFile(join(root, 'data', `${key}-market-data.json`), `${JSON.stringify(market, null, 2)}\n`, 'utf8');
}

async function createPages() {
  for (const lang of ['fr', 'en']) {
    for (let i = 0; i < codes.length; i += 1) {
      const source = await readFile(join(root, pathFor(codes[i], lang, 'verdun'), 'index.html'), 'utf8');
      const destination = join(root, pathFor(codes[i], lang), 'index.html');
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, transformPage(source, lang, codes[i], types[i]), 'utf8');
    }
  }
}

async function updateRegistry() {
  const registryPath = join(root, 'api', 'web-form-sources.php');
  let registry = await readFile(registryPath, 'utf8');
  if (registry.includes(`'${prefix}-universal-guide'`)) return;
  const pageNames = ['Universelle', 'Options', 'Accompagnement', 'Patrimoine / Investisseur', 'Maison', 'Condo'];
  const entries = [];
  for (let i = 0; i < types.length; i += 1) {
    const type = types[i];
    const code = codes[i] || 'universal';
    const canonical = canonicalFor(codes[i]);
    const resourceSuffix = type === 'options' ? 'options-plan-confidentiel' : type === 'accompagnement' ? 'accompagnement-checklist' : `${type}-guide`;
    const analysisSuffix = `${type}-analysis`;
    const resourceType = type === 'options' ? 'Plan confidentiel' : type === 'accompagnement' ? 'Checklist succession' : 'Guide vendeur';
    entries.push(`    '${prefix}-${resourceSuffix}' => ['region' => '${nameFr}', 'region_code' => 'VERIDS', 'page' => '${pageNames[i]}', 'code' => '${code}', 'type' => '${resourceType}', 'context' => '${type}', 'canonical' => '${canonical}'],`);
    entries.push(`    '${prefix}-${analysisSuffix}' => ['region' => '${nameFr}', 'region_code' => 'VERIDS', 'page' => '${pageNames[i]}', 'code' => '${code}', 'type' => 'Analyse de propriété', 'context' => '${type}', 'canonical' => '${canonical}'],`);
  }
  registry = registry.replace(/\n\];\s*$/, `\n${entries.join('\n')}\n];\n`);
  await writeFile(registryPath, registry, 'utf8');
}

async function updateHomeAndSitemap() {
  const homePath = join(root, 'index.html');
  let home = await readFile(homePath, 'utf8');
  home = home.replace('<a class="sector-card" href="/secteurs/verdun/" data-fr-href="/secteurs/verdun/" data-en-href="/en/secteurs/verdun/"><b>Verdun</b>', `<a class="sector-card" href="/secteurs/${key}/" data-fr-href="/secteurs/${key}/" data-en-href="/en/secteurs/${key}/"><b>${nameFr}</b>`);
  await writeFile(homePath, home, 'utf8');

  const scriptPath = join(root, 'script.js');
  let script = await readFile(scriptPath, 'utf8');
  script = script.replace("['ile-des-soeurs','L’Île-des-Sœurs','/en/secteurs/ile-des-soeurs/'],", '');
  await writeFile(scriptPath, script, 'utf8');

  const sitemapPath = join(root, 'sitemap.xml');
  let sitemap = await readFile(sitemapPath, 'utf8');
  sitemap = sitemap.split(/\r?\n/).filter(line => !/(?:\/en)?\/(?:secteurs\/)?(?:verdun|ile-des-soeurs|verdun-ile-des-soeurs)(?:\/|<)/.test(line)).join('\n');
  const urls = [];
  for (const lang of ['fr', 'en']) for (const code of codes) urls.push(`  <url><loc>${canonicalFor(code, lang)}</loc></url>`);
  sitemap = sitemap.replace('</urlset>', `${urls.join('\n')}\n</urlset>`);
  await writeFile(sitemapPath, `${sitemap.replace(/\n+$/, '')}\n`, 'utf8');
}

async function updateRedirects() {
  const mapPath = join(root, 'redirect-map.json');
  let map = JSON.parse(await readFile(mapPath, 'utf8'));
  const oldHosts = ['verdun.courtierducoin.ca', 'ile-des-soeurs.courtierducoin.ca'];
  const oldKeys = ['verdun', 'ile-des-soeurs'];
  map = map.filter(item => {
    if (oldHosts.some(oldHost => item.entry.startsWith(`https://${oldHost}/`))) return false;
    return !oldKeys.some(oldKey => item.entry.startsWith(`${base}/secteurs/${oldKey}/`) || item.entry.startsWith(`${base}/${oldKey}/`) || item.entry.startsWith(`${base}/en/secteurs/${oldKey}/`) || item.entry.startsWith(`${base}/en/${oldKey}/`));
  });
  for (const oldHost of oldHosts) {
    for (const code of codes) {
      map.push({ entry: `https://${oldHost}/${code}`, destination: `${canonicalFor(code)}${code ? `?entry=${prefix}-${code}` : `?entry=${prefix}-universal`}`, status: 301, preserveQuery: true });
    }
  }
  for (const oldKey of oldKeys) {
    for (const lang of ['fr', 'en']) {
      for (const code of codes) {
        map.push({ entry: `${base}/${pathFor(code, lang, oldKey)}/`, destination: canonicalFor(code, lang), status: 301, preserveQuery: true });
      }
    }
  }
  await writeFile(mapPath, `${JSON.stringify(map, null, 2)}\n`, 'utf8');

  const htaccessPath = join(root, '.htaccess');
  let htaccess = await readFile(htaccessPath, 'utf8');
  htaccess = htaccess
    .replace(/RewriteCond %\{HTTP_HOST\} \^ile-des-soeurs\\\.courtierducoin\\\.ca\$ \[NC\]\r?\nRewriteRule \^\$[^\r\n]+\r?\nRewriteCond %\{HTTP_HOST\} \^ile-des-soeurs\\\.courtierducoin\\\.ca\$ \[NC\]\r?\nRewriteRule \^\(o1a11\|02a22\|03i33\|04m44\|05c55\)[^\r\n]+\r?\n/, '')
    .replace(/RewriteCond %\{HTTP_HOST\} \^verdun\\\.courtierducoin\\\.ca\$ \[NC\]\r?\nRewriteRule \^\$[^\r\n]+\r?\nRewriteCond %\{HTTP_HOST\} \^verdun\\\.courtierducoin\\\.ca\$ \[NC\]\r?\nRewriteRule \^\(o1a11\|02a22\|03i33\|04m44\|05c55\)[^\r\n]+\r?\n/, '');
  if (!htaccess.includes('# Verdun / L’Île-des-Sœurs unifié')) {
    const block = `# Verdun / L’Île-des-Sœurs unifié : anciens hôtes et anciennes routes vers le nouveau secteur.\nRewriteCond %{HTTP_HOST} ^(verdun|ile-des-soeurs)\\.courtierducoin\\.ca$ [NC]\nRewriteRule ^$ ${canonicalFor('')}?entry=${prefix}-universal [R=301,L,NE,QSA]\nRewriteCond %{HTTP_HOST} ^(verdun|ile-des-soeurs)\\.courtierducoin\\.ca$ [NC]\nRewriteRule ^(o1a11|02a22|03i33|04m44|05c55)/?$ ${base}/${key}/$1/?entry=${prefix}-$1 [R=301,L,NE,QSA]\nRewriteRule ^secteurs/(verdun|ile-des-soeurs)/?$ ${canonicalFor('')}?entry=${prefix}-universal [R=301,L,NE,QSA]\nRewriteRule ^(verdun|ile-des-soeurs)/(o1a11|02a22|03i33|04m44|05c55)/?$ ${base}/${key}/$2/?entry=${prefix}-$2 [R=301,L,NE,QSA]\nRewriteRule ^en/secteurs/(verdun|ile-des-soeurs)/?$ ${canonicalFor('', 'en')} [R=301,L,NE,QSA]\nRewriteRule ^en/(verdun|ile-des-soeurs)/(o1a11|02a22|03i33|04m44|05c55)/?$ ${base}/en/${key}/$2/ [R=301,L,NE,QSA]\n`;
    htaccess = htaccess.replace('RewriteEngine On\n', `RewriteEngine On\n${block}`);
  }
  await writeFile(htaccessPath, htaccess, 'utf8');
}

await createAssetsAndData();
await createPages();
await updateRegistry();
await updateHomeAndSitemap();
await updateRedirects();
console.log('Verdun / L’Île-des-Sœurs unifié : 12 pages, données, formulaires, navigation et redirections créés.');
