import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const root = process.cwd();
const base = 'https://www.courtierducoin.ca';
const codes = ['', 'o1a11', '02a22', '03i33', '04m44', '05c55'];
const types = ['universal', 'options', 'accompagnement', 'investisseur', 'maison', 'condo'];

const sectors = [
  {
    key: 'ahuntsic-cartierville', name: 'Ahuntsic-Cartierville', prefix: 'ahuntsic', host: 'ahuntsic.courtierducoin.ca',
    areas: ['Ahuntsic', 'Cartierville', 'Nouveau-Bordeaux', 'Sault-au-Récollet', 'Saint-Sulpice'],
    propertyTypes: 'maisons, copropriétés, duplex et triplex',
    localIntro: 'Entre les rues résidentielles d’Ahuntsic, les secteurs riverains de Cartierville, les plex et les copropriétés, les comparables doivent rester proches de la typologie et du micro-marché.',
    imageAlt: 'Rue résidentielle arborée d’Ahuntsic-Cartierville bordée de propriétés typiques du secteur.',
    source: 'https://www.centris.ca/fr/outils/statistiques-immobilieres/province-de-quebec/montreal-ahuntsic-cartierville'
  },
  {
    key: 'anjou-saint-leonard', name: 'Anjou / Saint-Léonard', prefix: 'anjou', host: 'anjou-saint-leonard.courtierducoin.ca',
    areas: ['Anjou', 'Saint-Léonard', 'Galeries d’Anjou', 'Vieux-Saint-Léonard', 'Langelier'],
    propertyTypes: 'bungalows, maisons, copropriétés et plex',
    localIntro: 'Anjou et Saint-Léonard rassemblent des maisons d’après-guerre, des bungalows, des copropriétés et des plex dont les acheteurs, les terrains et la concurrence varient d’un secteur à l’autre.',
    imageAlt: 'Propriété résidentielle dans un quartier arboré d’Anjou et de Saint-Léonard.',
    source: 'https://www.centris.ca/fr/outils/statistiques-immobilieres/province-de-quebec/montreal-anjou'
  },
  {
    key: 'cdn-cote-saint-luc', name: 'CDN / Côte-Saint-Luc', prefix: 'cdn', host: 'cdn-csl.courtierducoin.ca',
    areas: ['Côte-des-Neiges', 'Côte-Saint-Luc', 'Snowdon', 'Hampstead', 'Décarie'],
    propertyTypes: 'copropriétés, maisons et plex',
    localIntro: 'La densité de Côte-des-Neiges et le tissu résidentiel de Côte-Saint-Luc ne se comparent pas de la même façon. Le type de bâtiment, la rue, le stationnement et les documents changent la lecture.',
    imageAlt: 'Immeuble résidentiel dans le secteur de Côte-des-Neiges et Côte-Saint-Luc.',
    source: 'https://www.centris.ca/fr/outils/statistiques-immobilieres/province-de-quebec/montreal-cote-des-neiges-notre-dame-de-grace'
  },
  {
    key: 'lachine-lasalle', name: 'Lachine / LaSalle', prefix: 'lachinelasalle', host: 'lachine-lasalle.courtierducoin.ca',
    areas: ['Lachine', 'LaSalle', 'Vieux-Lachine', 'Angrignon', 'bord du fleuve'],
    propertyTypes: 'maisons, copropriétés et immeubles à revenus',
    localIntro: 'La proximité du fleuve, l’âge des bâtiments, la typologie, l’accès aux transports et la rue créent des micro-marchés distincts entre Lachine et LaSalle.',
    imageAlt: 'Propriété résidentielle dans un quartier établi de Lachine et LaSalle.',
    source: 'https://www.centris.ca/fr/outils/statistiques-immobilieres/province-de-quebec/montreal-lachine'
  },
  {
    key: 'ile-des-soeurs', name: 'L’Île-des-Sœurs', prefix: 'ids', host: 'ile-des-soeurs.courtierducoin.ca',
    areas: ['Pointe-Sud', 'Pointe-Nord', 'centre de l’île', 'secteurs riverains', 'axes de transport'],
    propertyTypes: 'copropriétés, maisons de ville et maisons',
    localIntro: 'À L’Île-des-Sœurs, l’immeuble, l’étage, la vue, l’administration de la copropriété, le stationnement et la proximité des services peuvent modifier fortement la comparaison.',
    imageAlt: 'Immeuble résidentiel contemporain dans un secteur verdoyant de L’Île-des-Sœurs.',
    source: 'https://www.centris.ca/fr/outils/statistiques-immobilieres/province-de-quebec/montreal-verdun-ile-des-soeurs'
  }
];

const pageText = {
  universal: {
    page: 'Vue d’ensemble', title: s => `Courtier immobilier à ${s.name} | Pierre Dalpé`,
    description: s => `Vous pensez vendre une maison, un condo ou un plex à ${s.name}? Analyse locale, préparation et accompagnement direct avec Pierre Dalpé.`,
    kicker: s => `Courtier immobilier · ${s.name}`,
    h1: s => `Vous pensez vendre à ${s.name}? Commencez par comprendre la valeur réelle de votre propriété.`,
    lead: s => `${s.areas.slice(0, 3).join(', ')} : la valeur varie selon le type de propriété, la rue, l’état du bâtiment, les documents et la concurrence actuelle. Je vous aide à mettre ces éléments en contexte avant de décider.`,
    proofTitle: s => `${s.name} réunit plusieurs micro-marchés dans un même secteur.`,
    proofIntro: s => s.localIntro,
    guide: 'Guide du vendeur', guideIntro: s => `Une ressource pratique pour préparer les documents, les travaux utiles et le calendrier avant de vendre à ${s.name}.`,
    guideButton: 'Recevoir le guide', analysis: 'Demander mon analyse', final: 'Vous n’avez pas besoin d’avoir tout préparé avant d’appeler.'
  },
  options: {
    page: 'Options', title: s => `Options immobilières à ${s.name} | Décider clairement`,
    description: s => `Préavis, échéance, taxes impayées ou offre rapide à ${s.name} : clarifiez le document, les dates, la valeur, le produit net et vos options.`,
    kicker: s => `Options immobilières · ${s.name}`,
    h1: () => 'Une échéance approche? Commencez par organiser le document, les dates, la valeur et les options possibles.',
    lead: () => 'Un préavis, des taxes impayées, une séparation financière ou une offre rapide peuvent créer de la pression. Pierre organise le volet immobilier avec discrétion, sans remplacer votre notaire, avocat, créancier ou municipalité.',
    proofTitle: () => 'Une décision pressée devient plus claire quand les faits sont séparés.',
    proofIntro: () => 'Commencez par identifier le document, confirmer les dates avec les professionnels appropriés et estimer ce qu’une vente réaliste pourrait produire.',
    guide: 'Plan confidentiel', guideIntro: () => 'Une feuille de route pour noter les dates, organiser les documents et comparer des scénarios réalistes sans pression.',
    guideButton: 'Recevoir le plan', analysis: 'Faire le point', final: 'Vous n’avez pas à tout décider avant de demander une lecture confidentielle.'
  },
  accompagnement: {
    page: 'Accompagnement', title: s => `Succession et propriété héritée à ${s.name} | Pierre Dalpé`,
    description: s => `Propriété héritée ou succession à ${s.name} : organisez les documents, la valeur, la préparation et le calendrier avec Pierre Dalpé.`,
    kicker: s => `Accompagnement immobilier · ${s.name}`,
    h1: () => 'Une propriété héritée demande un plan clair avant de parler de mise en marché.',
    lead: () => 'Lorsqu’une propriété implique une succession, plusieurs héritiers ou une personne à distance, la priorité est de clarifier les rôles, les autorisations, les documents et l’état du bâtiment.',
    proofTitle: () => 'Le rôle du courtier est d’organiser le volet immobilier.',
    proofIntro: () => 'Le liquidateur, le notaire et les autres professionnels conservent leur rôle. Pierre structure la valeur, la préparation, la mise en marché et les communications liées à la propriété.',
    guide: 'Liste succession', guideIntro: () => 'Une liste pratique pour organiser les autorisations, les accès, les documents, l’entretien et les décisions.',
    guideButton: 'Recevoir la liste', analysis: 'Analyser la propriété', final: 'Le dossier de la propriété peut être organisé une étape à la fois.'
  },
  investisseur: {
    page: 'Patrimoine / Investisseur', title: s => `Vendre un plex à ${s.name} | Pierre Dalpé`,
    description: s => `Duplex, triplex ou immeuble à revenus à ${s.name} : organisez revenus, dépenses, occupation, travaux et valeur.`,
    kicker: s => `Patrimoine et investissement · ${s.name}`,
    h1: s => `Vous pensez vendre un plex à ${s.name}? Commencez par mettre les chiffres et le bâtiment en contexte.`,
    lead: () => 'Pour un duplex, un triplex ou un petit immeuble à revenus, les loyers, dépenses, baux, occupations, travaux et l’état du bâtiment influencent la lecture des acheteurs.',
    proofTitle: () => 'La valeur d’un plex ne tient pas dans un multiplicateur isolé.',
    proofIntro: () => 'Un dossier crédible relie les revenus réels, les dépenses, les baux, l’état du bâtiment, les travaux et les ventes comparables du bon micro-marché.',
    guide: 'Guide du vendeur de plex', guideIntro: () => 'Une liste de préparation pour les baux, revenus, dépenses, travaux et caractéristiques du bâtiment.',
    guideButton: 'Recevoir le guide', analysis: 'Analyser mon plex', final: 'Des chiffres et des documents clairs aident les acheteurs à comprendre le bâtiment.'
  },
  maison: {
    page: 'Maison', title: s => `Vendre une maison à ${s.name} | Valeur et préparation`,
    description: s => `Vendre une maison à ${s.name} : analysez la valeur, les travaux utiles, la préparation, la concurrence et le calendrier avec Pierre Dalpé.`,
    kicker: s => `Vendre une maison · ${s.name}`,
    h1: s => `Vous pensez vendre votre maison à ${s.name}? Commencez par savoir ce qui mérite votre attention.`,
    lead: () => 'La valeur, l’état de la propriété, le terrain, les travaux, la présentation, la concurrence et le calendrier doivent être analysés ensemble avant de dépenser ou de fixer une date.',
    proofTitle: () => 'La bonne préparation est sélective.',
    proofIntro: () => 'L’objectif n’est pas de transformer la maison. Il est de réduire les objections, mettre en valeur ses forces et aligner les travaux utiles sur le calendrier de vente.',
    guide: 'Guide du vendeur de maison', guideIntro: () => 'Un plan pratique pour les documents, les travaux utiles, la photographie et le calendrier.',
    guideButton: 'Recevoir le guide', analysis: 'Analyser ma maison', final: 'Une première lecture aide à distinguer les travaux utiles des dépenses inutiles.'
  },
  condo: {
    page: 'Condo', title: s => `Vendre un condo à ${s.name} | Documents et stratégie`,
    description: s => `Vendre un condo à ${s.name} : préparez les documents de copropriété, la valeur, la présentation et la stratégie de mise en marché.`,
    kicker: s => `Vendre un condo · ${s.name}`,
    h1: s => `Vous pensez vendre votre condo à ${s.name}? Commencez par préparer le bon dossier.`,
    lead: () => 'L’unité, la concurrence active, les frais, les procès-verbaux, les états financiers, l’assurance, le fonds de prévoyance et les travaux prévus peuvent influencer la décision d’un acheteur.',
    proofTitle: () => 'Les acheteurs évaluent l’unité et la copropriété.',
    proofIntro: () => 'La présentation compte, mais la qualité des documents, l’administration, l’entretien et les travaux prévus influencent aussi la confiance des acheteurs.',
    guide: 'Guide du vendeur de condo', guideIntro: () => 'Une liste claire des documents de copropriété, des caractéristiques de l’unité et des comparables à préparer.',
    guideButton: 'Recevoir le guide', analysis: 'Analyser mon condo', final: 'Un dossier de copropriété organisé peut éviter des délais inutiles.'
  }
};

const cards = {
  universal: [['Typologie', 'Maison, copropriété et plex attirent des acheteurs différents et demandent des comparables distincts.'], ['Micro-marché', 'Quelques rues, services ou caractéristiques physiques peuvent changer la comparaison.'], ['Bâtiment et documents', 'L’état, les travaux, les baux ou les documents de copropriété influencent la confiance et la stratégie.']],
  options: [['Dates', 'Identifiez les échéances à confirmer et le temps réellement disponible.'], ['Valeur', 'Appuyez-vous sur des ventes pertinentes plutôt que sur une estimation automatisée.'], ['Produit net', 'Distinguez le prix demandé du montant qui pourrait rester après la transaction.']],
  accompagnement: [['Autorisations', 'Identifiez qui peut décider, signer et recevoir l’information liée au dossier.'], ['Documents', 'Rassemblez certificat, baux, factures, travaux et informations disponibles sur le bâtiment.'], ['Préparation', 'Sécurisez, dégagez, nettoyez et corrigez seulement ce qui soutient réellement la vente.']],
  investisseur: [['Revenus', 'Baux, loyers, inclusions, vacance et potentiel présentés sans projection non fondée.'], ['Dépenses', 'Taxes, assurances, énergie et travaux récurrents présentés de façon cohérente.'], ['Bâtiment', 'État, entretien, occupation et investissements récents remis en contexte.']],
  maison: [['Valeur', 'Ventes pertinentes, concurrence active et caractéristiques remises en contexte.'], ['Préparation', 'Corrections utiles, désencombrement, présentation et priorités photographiques.'], ['Calendrier', 'Coordonnez la vente avec le prochain achat ou le déménagement lorsque nécessaire.']],
  condo: [['Unité', 'Étage, lumière, stationnement, rangement, balcon, rénovations et état intérieur.'], ['Immeuble', 'Administration, entretien, travaux, assurance et qualité du dossier documentaire.'], ['Concurrence', 'Comparez les unités réellement concurrentes plutôt que tous les condos du secteur.']]
};

const faqs = {
  universal: [['Les statistiques du secteur suffisent-elles pour fixer un prix?', 'Non. Elles donnent un contexte, mais ne remplacent pas les ventes comparables pertinentes et une lecture directe de la propriété.'], ['Dois-je rénover avant de vendre?', 'Pas automatiquement. Une visite aide à séparer les corrections utiles des travaux qui risquent de ne pas être récupérés.'], ['Pierre peut-il aider pour une maison, un condo ou un plex?', 'Oui. Le parcours et les documents demandés sont adaptés au type de propriété.'], ['Puis-je demander une analyse avant de décider de vendre?', 'Oui. Une première conversation peut simplement clarifier la valeur, les options et la préparation.']],
  options: [['La mise en vente arrête-t-elle automatiquement une procédure?', 'Non. Les dates et obligations doivent être confirmées avec les professionnels appropriés.'], ['Puis-je parler à Pierre sans m’engager à vendre?', 'Oui. Une première conversation peut simplement clarifier le volet immobilier.'], ['Une offre directe est-elle toujours préférable?', 'Non. Il faut comparer prix, conditions, calendrier, produit net et probabilité de conclure.'], ['Mes renseignements resteront-ils confidentiels?', 'Ils servent à répondre à votre demande. La motivation et les seuils de négociation ne sont pas des arguments publicitaires.']],
  accompagnement: [['Le courtier remplace-t-il le notaire ou le liquidateur?', 'Non. Pierre s’occupe du volet immobilier et coordonne avec les personnes autorisées.'], ['Faut-il tout vider avant une première rencontre?', 'Non. Une première visite peut aider à prioriser ce qui doit être fait, conservé ou documenté.'], ['Pouvez-vous communiquer avec plusieurs membres de la famille?', 'Oui, lorsque les rôles et les attentes de communication sont clairement définis.'], ['Comment la valeur est-elle établie?', 'En analysant le bâtiment, son état, l’occupation, le micro-marché et les ventes comparables pertinentes.']],
  investisseur: [['Dois-je avoir tous les baux avant d’appeler?', 'Ils sont importants, mais une première discussion peut commencer avec l’information disponible.'], ['Le prix dépend-il seulement des revenus?', 'Non. Les dépenses, l’état, l’occupation, le secteur, le financement et les ventes comparables comptent aussi.'], ['Un plex occupé par le propriétaire peut-il être analysé?', 'Oui. Il faut simplement comprendre et documenter l’occupation actuelle et prévue.'], ['Un seul multiplicateur suffit-il?', 'Non. Il peut être un repère, mais le bâtiment et les preuves de marché doivent aussi être considérés.']],
  maison: [['Dois-je faire des rénovations majeures avant de vendre?', 'Pas automatiquement. Il faut d’abord évaluer le coût, le délai et l’effet probable sur les acheteurs.'], ['Quels documents préparer?', 'Certificat de localisation, taxes, factures, garanties, permis et rapports disponibles sont de bons points de départ.'], ['Les inscriptions actives sont-elles des comparables?', 'Elles montrent la concurrence, mais les ventes conclues indiquent ce que les acheteurs ont réellement accepté.'], ['Dois-je vendre avant d’acheter?', 'Cela dépend du financement, de la tolérance au risque, de la prochaine propriété et du calendrier.']],
  condo: [['Quels documents préparer?', 'Selon la copropriété : déclaration, règlements, procès-verbaux, états financiers, budget, assurance, étude du fonds de prévoyance et carnet d’entretien lorsque disponibles.'], ['Des frais élevés empêchent-ils une vente?', 'Ils doivent être expliqués en fonction des services, de l’entretien, des réserves et de l’état général.'], ['La médiane du secteur est-elle la valeur de mon condo?', 'Non. Elle donne un contexte, mais ne remplace pas les unités comparables et la concurrence directe.'], ['Quand demander les documents?', 'Le plus tôt possible, car un dossier incomplet peut ralentir l’analyse d’un acheteur.']]
};

const frPath = (s, code = '') => code ? `${s.key}/${code}` : `secteurs/${s.key}`;
const enPath = (s, code = '') => `en/${frPath(s, code)}`;
const frUrl = (s, code = '') => `${base}/${frPath(s, code)}/`;
const enUrl = (s, code = '') => `${base}/${enPath(s, code)}/`;
const image = (s, type) => `/assets/${s.key}/hero-${s.key}-${type}.webp`;
const formKeys = (s, type) => type === 'options'
  ? [`${s.prefix}-options-plan-confidentiel`, `${s.prefix}-options-analysis`]
  : type === 'accompagnement'
    ? [`${s.prefix}-accompagnement-checklist`, `${s.prefix}-accompagnement-analysis`]
    : [`${s.prefix}-${type}-guide`, `${s.prefix}-${type}-analysis`];

function schema(s, type, code, t) {
  const canonical = frUrl(s, code);
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': `${canonical}#page`, url: canonical, name: t.title(s), description: t.description(s), inLanguage: 'fr-CA', breadcrumb: { '@id': `${canonical}#breadcrumb` }, about: { '@id': `${base}/#broker` } },
    { '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Accueil', item: `${base}/` }, { '@type': 'ListItem', position: 2, name: s.name, item: frUrl(s) }, { '@type': 'ListItem', position: 3, name: t.page, item: canonical }] },
    { '@type': 'Person', '@id': `${base}/#pierre`, name: 'Pierre Dalpé', jobTitle: 'Courtier immobilier résidentiel et commercial', telephone: '+1-514-216-4013', email: 'pierre@courtierducoin.ca', image: `${base}/assets/pierre-dalpe-portrait-transparent.png` },
    { '@type': 'Organization', '@id': `${base}/#organization`, name: 'Courtier du Coin', url: `${base}/`, founder: { '@id': `${base}/#pierre` } },
    { '@type': 'RealEstateAgent', '@id': `${base}/#broker`, name: 'Pierre Dalpé — Courtier du Coin', url: canonical, telephone: '+1-514-216-4013', areaServed: { '@type': 'AdministrativeArea', name: s.name }, parentOrganization: { '@type': 'Organization', name: 'groupe sutton - performer inc.' } },
    { '@type': 'VideoObject', name: `${t.page} à ${s.name}`, description: `Capsule de préparation immobilière pour le parcours ${t.page.toLowerCase()} à ${s.name}.`, thumbnailUrl: `${base}${image(s, type)}`, uploadDate: '2026-08-14' },
    { '@type': 'FAQPage', mainEntity: faqs[type].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  ] }).replaceAll('<', '\\u003c');
}

function header(s, code) {
  return `<header class="rm-header"><a class="rm-brand" href="/" aria-label="Courtier du Coin"><span aria-hidden="true">C</span><b>COURTIER DU COIN<small>avec Pierre Dalpé</small></b></a><nav aria-label="Navigation principale"><a href="/vendre/">Vendre</a><a href="/acheter/">Acheter</a><a href="/investir/">Investir</a><a href="${frUrl(s)}">${s.name}</a><a href="#guide">Guides</a></nav><a class="lang-switch" href="${enUrl(s, code)}" lang="en" hreflang="en-CA">🌐 EN</a><a class="rm-phone" href="tel:+15142164013">514 216-4013</a><a class="rm-button compact" href="#analyse">Demander une analyse</a><img src="/assets/sutton-wordmark.png" alt="groupe sutton - performer inc., agence immobilière" width="118" height="42"><button class="rm-menu" type="button" aria-label="Ouvrir le menu" aria-expanded="false">Menu</button></header>`;
}

function footer(s, code) {
  return `<footer class="rm-footer"><div><b>COURTIER DU COIN</b><span>avec Pierre Dalpé</span><p>Immobilier local, stratégie claire et accompagnement direct.</p></div><div><b>Pierre Dalpé</b><span>Courtier immobilier résidentiel et commercial</span><span>groupe sutton - performer inc. — Agence immobilière</span><img src="/assets/sutton-wordmark.png" alt="groupe sutton - performer inc., agence immobilière" width="160" height="52"></div><div><a href="tel:+15142164013">514 216-4013</a><a href="mailto:pierre@courtierducoin.ca">pierre@courtierducoin.ca</a></div><div><a href="${enUrl(s, code)}" lang="en">🌐 English</a><a href="${frUrl(s)}">${s.name}</a><a href="/confidentialite.html">Politique de confidentialité</a></div><small>© 2026 Pierre Dalpé Inc. Tous droits réservés.</small></footer><div class="rm-mobile"><a href="tel:+15142164013">Appeler</a><a href="sms:+15142164013">Texter</a><a href="#analyse">Commencer</a></div>`;
}

function hiddenFields(s, type, code, key) {
  return `<input type="hidden" name="source_key" value="${key}"><input type="hidden" name="form_id" value="${key}"><input type="hidden" name="projet" value="Vendre"><input type="hidden" name="langue" value="Français"><input type="hidden" name="region" value="${s.key}"><input type="hidden" name="page_type" value="${type === 'universal' ? 'universal' : 'specialized'}"><input type="hidden" name="campaign_type" value="${type}"><input type="hidden" name="campaign_code" value="${code || 'universal'}">`;
}

function guideForm(s, type, code, key, button) {
  return `<form class="rm-mini-form" action="/api/contact.php" method="post" data-source-key="${key}"><div><label>Prénom<input name="prenom" autocomplete="given-name" required></label><label>Courriel ou téléphone<input name="contact" autocomplete="email" required></label></div>${hiddenFields(s, type, code, key)}<input type="hidden" name="nom" value="Demande de ressource"><input type="hidden" name="courriel"><input type="hidden" name="telephone"><input type="hidden" name="contact_pref" value="À confirmer"><input type="hidden" name="moment" value="À convenir"><label class="check"><input type="checkbox" name="consent_request" value="oui" required> J’accepte que Pierre Dalpé communique avec moi pour répondre à cette demande.</label><label class="check"><input type="checkbox" name="consent_marketing" value="oui"> Je souhaite recevoir occasionnellement des conseils immobiliers. Je peux me désabonner en tout temps.</label><button class="rm-button" type="submit">${button}</button><small class="form-privacy">Vos renseignements servent à répondre à votre demande. <a href="/confidentialite.html">Politique de confidentialité</a>.</small><p class="form-status" aria-live="polite"></p></form>`;
}

function analysisForm(s, type, code, key, button) {
  const listId = `${s.prefix}-${type}-fr`;
  return `<form class="progress-form" action="/api/contact.php" method="post" data-source-key="${key}">${hiddenFields(s, type, code, key)}<section data-step="1"><label>Type de propriété<select name="property_type" required><option value="">Choisir</option><option>Maison</option><option>Condo</option><option>Duplex</option><option>Triplex</option><option>4–5 logements</option><option>Autre</option></select></label><label>Secteur ou quartier<input name="municipality" list="${listId}" required><datalist id="${listId}">${s.areas.map(area => `<option>${area}</option>`).join('')}</datalist></label><button class="rm-button" type="button" data-next>Continuer</button></section><section data-step="2" hidden><label>Adresse de la propriété<input name="adresse" autocomplete="street-address" required></label><label>Votre calendrier<select name="timeline"><option>Je m’informe</option><option>Dans les 3 prochains mois</option><option>Dans 3 à 6 mois</option><option>Dans 6 à 12 mois</option><option>Échéance à confirmer</option></select></label><button class="rm-button" type="button" data-next>Continuer</button></section><section data-step="3" hidden><div class="form-grid"><label>Prénom<input name="prenom" autocomplete="given-name" required></label><label>Nom<input name="nom" autocomplete="family-name" required></label><label>Téléphone<input type="tel" name="telephone" autocomplete="tel"></label><label>Courriel<input type="email" name="courriel" autocomplete="email"></label><label>Préférence<select name="contact_pref"><option>Appel</option><option>SMS</option><option>Courriel</option></select></label><label>Meilleur moment<input name="moment"></label><label class="wide">Ce que vous souhaitez clarifier<textarea name="message"></textarea></label></div><label class="check"><input type="checkbox" name="consent_request" value="oui" required> J’accepte que Pierre Dalpé communique avec moi pour répondre à cette demande.</label><label class="check"><input type="checkbox" name="consent_marketing" value="oui"> Je souhaite recevoir occasionnellement des conseils immobiliers. Je peux me désabonner en tout temps.</label><button class="rm-button" type="submit">${button}</button><small class="form-privacy">Vos renseignements servent à répondre à votre demande. <a href="/confidentialite.html">Politique de confidentialité</a>.</small><p class="form-status" aria-live="polite"></p></section></form>`;
}

function pageHtml(s, type, code) {
  const t = pageText[type];
  const canonical = frUrl(s, code);
  const alternate = enUrl(s, code);
  const [guideKey, analysisKey] = formKeys(s, type);
  const localCards = cards[type].map(([title, body]) => `<article><h3>${title}</h3><p>${body}</p></article>`).join('');
  const faqMarkup = faqs[type].map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('');
  const pathwayLinks = types.slice(1).map((pathType, i) => {
    const text = pageText[pathType];
    return `<a href="/${s.key}/${codes[i + 1]}/"><b>${text.page}</b><span>${text.description(s)}</span><i>Ouvrir ce parcours →</i></a>`;
  }).join('');
  const localContext = type === 'universal'
    ? `<section class="rm-section pathways"><p class="rm-kicker">Cinq parcours spécialisés</p><h2>Choisissez la page qui correspond le mieux à votre situation.</h2><div class="path-list">${pathwayLinks}</div></section>`
    : `<section class="rm-section shade"><p class="rm-kicker dark">Contexte local</p><h2>Un nom de secteur, plusieurs micro-marchés.</h2><p>${s.localIntro}</p><ul class="micro-list">${s.areas.map(area => `<li>${area}</li>`).join('')}</ul></section>`;

  return `<!doctype html><html lang="fr-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${t.title(s)}</title><meta name="description" content="${t.description(s)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="fr-CA" href="${canonical}"><link rel="alternate" hreflang="en-CA" href="${alternate}"><link rel="alternate" hreflang="x-default" href="${canonical}"><meta property="og:type" content="website"><meta property="og:locale" content="fr_CA"><meta property="og:title" content="${t.title(s)}"><meta property="og:description" content="${t.description(s)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${base}${image(s, type)}"><link rel="preload" as="image" href="/assets/pierre-dalpe-portrait-transparent.png" fetchpriority="high"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/sector-master.css?v=20260814-protected-shared-v2"><script type="application/ld+json">${schema(s, type, code, t)}</script></head><body class="rm-page sector-page ${s.key}-page ${s.key}-${type}" data-region="${s.key}" data-region-name="${s.name}" data-entry-prefix="${s.prefix}" data-marketing-host="${s.host}" data-market-data="/data/${s.key}-market-data.json" data-page-type="${type === 'universal' ? 'universal' : 'specialized'}" data-campaign-type="${type}" data-public-page="${t.page}" data-campaign-code="${code || 'universal'}">${header(s, code)}<main><nav class="breadcrumb" aria-label="Fil d’Ariane"><a href="/">Accueil</a><span>›</span><a href="${frUrl(s)}">${s.name}</a><span>›</span><span>${t.page}</span></nav><section class="rm-hero"><div><p class="rm-kicker">${t.kicker(s)}</p><h1>${t.h1(s)}</h1><p class="rm-lead">${t.lead(s)}</p><div class="rm-actions"><a class="rm-button" href="#analyse">${t.analysis}</a><a class="rm-button outline" href="#guide">${t.guideButton}</a></div><p>Vous préférez parler maintenant? Appelez ou textez Pierre.</p><div class="trust-line">Accompagnement direct • Comparables pertinents • Préparation claire</div></div><div class="rm-hero-photo rm-hero-portrait"><img src="/assets/pierre-dalpe-portrait-transparent.png" alt="Pierre Dalpé, courtier immobilier résidentiel et commercial." width="1254" height="1254" fetchpriority="high"><span>Pierre Dalpé<small>Courtier immobilier résidentiel et commercial</small></span></div></section><section class="rm-section video-section"><div><p class="rm-kicker dark">Une première lecture, sans pression</p><h2>${t.page} à ${s.name}</h2><p>Cette capsule expliquera les vérifications utiles avant de décider de la valeur, des travaux ou du calendrier.</p><p class="notice">La capsule vidéo est en préparation. La page reste complète et fonctionnelle sans lecteur externe.</p></div><div class="rm-video" data-video style="--video-image:url('${image(s, type)}')"><button class="video-poster" type="button"><span aria-hidden="true">▶</span><b>Capsule locale en préparation</b><small>Aucun lecteur lourd n’est chargé.</small></button></div></section><section class="rm-section property-proof-section"><div class="property-proof-copy"><p class="rm-kicker dark">Une lecture locale structurée</p><h2>${t.proofTitle(s)}</h2><p class="intro">${t.proofIntro(s)}</p></div><figure class="property-proof-photo"><img src="${image(s, type)}" alt="${s.imageAlt}" width="1600" height="900" loading="lazy" decoding="async"><figcaption>${t.page} · ${s.name}</figcaption></figure><div class="local-proof">${localCards}</div></section>${localContext}<section class="rm-section guide" id="guide"><div class="guide-cover"><small>COURTIER DU COIN</small><strong>${t.guide}</strong><span>${s.name} · 2026</span><b>Préparer. Comprendre. Décider.</b></div><div><p class="rm-kicker dark">Ressource pratique</p><h2>${t.guide} — ${s.name}</h2><p>${t.guideIntro(s)}</p><ul><li>Clarifier le type de propriété et le secteur</li><li>Rassembler les documents utiles</li><li>Prioriser les vérifications et les travaux</li><li>Préparer un calendrier réaliste</li></ul>${guideForm(s, type, code, guideKey, t.guideButton)}</div></section><section class="rm-section stats"><p class="rm-kicker dark">Repère de marché vérifié</p><h2>Utiliser les données du marché comme contexte, pas comme évaluation automatisée.</h2><p>Le jeu de données vérifié du secteur fournit un repère général. L’analyse d’une propriété doit encore tenir compte de son type exact, de son emplacement, de son état, de ses documents et de sa concurrence directe.</p><small class="source">Source : <a href="${s.source}" rel="noopener">Centris — ${s.name}</a>. Les valeurs absentes ou masquées ne sont pas extrapolées.</small></section><section class="rm-section process"><p class="rm-kicker">Méthode</p><h2>Avancer dans le bon ordre.</h2><div class="card-grid four"><article><span>01</span><h3>Comprendre</h3><p>Votre propriété, votre situation et votre calendrier.</p></article><article><span>02</span><h3>Comparer</h3><p>Les données utiles et les ventes réellement pertinentes.</p></article><article><span>03</span><h3>Préparer</h3><p>Les documents, les corrections et la présentation.</p></article><article><span>04</span><h3>Décider</h3><p>Une stratégie cohérente avec votre prochaine étape.</p></article></div></section><section class="rm-section faq"><p class="rm-kicker dark">Questions fréquentes</p><h2>${t.page} · ${s.name}</h2><div class="faq-grid">${faqMarkup}</div></section><section class="rm-section valuation" id="analyse"><div><p class="rm-kicker">Une première étape simple</p><h2>${t.analysis}</h2><p>Le formulaire conserve la provenance de cette page afin que Pierre comprenne immédiatement le contexte.</p></div>${analysisForm(s, type, code, analysisKey, t.analysis)}</section><section class="rm-final"><h2>${t.final}</h2><p>Une première conversation peut simplement clarifier la propriété, le micro-marché et les prochaines vérifications utiles.</p><div class="rm-actions"><a class="rm-button" href="tel:+15142164013">Parler avec Pierre</a><a class="rm-button outline" href="#analyse">${t.analysis}</a></div></section></main>${footer(s, code)}<script src="/sector-master.js?v=20260814-protected-fr-v1" defer></script></body></html>`;
}

for (const sector of sectors) {
  for (let i = 0; i < codes.length; i += 1) {
    const destination = join(root, frPath(sector, codes[i]), 'index.html');
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, pageHtml(sector, types[i], codes[i]), 'utf8');
  }
}

console.log('Modernisé les 30 pages françaises des cinq secteurs protégés avec le patron partagé.');
