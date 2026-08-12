import {mkdir, writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const root = process.cwd();
const base = 'https://www.courtierducoin.ca';
const microMarkets = ['Auteuil','Chomedey','Duvernay','Fabreville','Îles-Laval','Laval-des-Rapides','Laval-Ouest','Laval-sur-le-Lac','Pont-Viau','Saint-François','Saint-Vincent-de-Paul','Sainte-Dorothée','Sainte-Rose','Vimont'];
const pages = [
  {
    key:'universal', code:'universal', page:'Universelle', path:'secteurs/laval', image:'universal',
    alt:'Rue résidentielle verdoyante de Laval bordée de maisons unifamiliales près de la rivière.',
    title:'Courtier immobilier à Laval | Pierre Dalpé',
    description:'Vous pensez vendre une maison, un condo ou un plex à Laval? Analyse locale, valeur, préparation et accompagnement direct avec Pierre Dalpé.',
    kicker:'Courtier immobilier à Laval',
    h1:'Vous pensez vendre à Laval? Commencez par comprendre la valeur réelle de votre propriété.',
    lead:'Maison à Sainte-Dorothée, bungalow à Chomedey, condo près de Montmorency ou plex à Pont-Viau : la valeur change selon le type de propriété, le micro-marché, l’état du bâtiment et la concurrence actuelle. Je vous aide à mettre ces éléments en contexte avant de décider.',
    trust:'Sainte-Rose • Chomedey • Duvernay • Fabreville • Laval-des-Rapides • Sainte-Dorothée',
    video:'Laval : par où commencer pour vendre?',
    guide:'Guide du vendeur — Laval 2026', guideCover:'Guide du vendeur', guideKey:'laval-universal-guide', guideButton:'Recevoir le guide', guideIntro:'Une ressource pratique pour préparer les documents, les travaux utiles et le calendrier avant de vendre une propriété à Laval.',
    analysisKey:'laval-universal-analysis', analysisHeading:'Recevez une première lecture de votre propriété à Laval.', analysisButton:'Demander mon analyse',
    statType:'all',
    proofTitle:'Laval réunit plusieurs marchés dans une même ville.',
    proofIntro:'Une propriété lavalloise ne se compare pas seulement par code postal. Le secteur, la typologie, le terrain, l’âge du bâtiment et la proximité des services changent la lecture du marché.',
    cards:[['Type de propriété','Maison détachée, copropriété ou plex : chaque catégorie a ses propres comparables.'],['Micro-marché','Les milieux établis, les secteurs riverains et les pôles plus denses n’attirent pas les mêmes acheteurs.'],['État et préparation','Les travaux utiles dépendent du bâtiment, du calendrier et des attentes des acheteurs actifs.']],
    faq:[['Une moyenne de Laval suffit-elle pour fixer un prix?','Non. Les données régionales donnent un contexte, mais une analyse doit tenir compte des ventes comparables, du micro-marché et des caractéristiques réelles de la propriété.'],['Quels secteurs de Laval accompagnez-vous?','Pierre peut analyser un projet partout à Laval, notamment dans les secteurs historiques comme Chomedey, Duvernay, Fabreville, Sainte-Rose, Sainte-Dorothée et Laval-des-Rapides.'],['Dois-je rénover avant de vendre?','Pas automatiquement. Il vaut mieux prioriser les corrections qui améliorent la présentation ou réduisent une objection, puis comparer leur coût à leur impact probable.'],['Pouvez-vous m’aider pour un condo ou un plex?','Oui. Le parcours est adapté au type de propriété, aux documents requis, à l’occupation et au calendrier.']]
  },
  {
    key:'options', code:'o1a11', page:'Options', path:'laval/o1a11', image:'options',
    alt:'Bungalow en brique dans une rue calme et arborée de Laval.',
    title:'Options immobilières à Laval | Décider avec clarté',
    description:'Préavis, taxes, échéance ou offre rapide à Laval : clarifiez la valeur, les dates, les montants à confirmer et les options immobilières possibles.',
    kicker:'Options immobilières à Laval',
    h1:'Une échéance approche? Commencez par mettre les dates, la valeur et vos options en ordre.',
    lead:'Un document officiel, des taxes impayées, une séparation financière ou une offre rapide peuvent créer de la pression. Pierre organise le volet immobilier avec discrétion, sans remplacer le notaire, l’avocat, le créancier ou la municipalité.',
    trust:'Approche confidentielle • Valeur documentée • Calendrier réaliste',
    video:'Laval : reprendre le contrôle avant de décider',
    guide:'Plan confidentiel — valeur, échéancier et options', guideCover:'Plan confidentiel', guideKey:'laval-options-plan-confidentiel', guideButton:'Recevoir le plan', guideIntro:'Une feuille de route pour identifier le document reçu, noter les dates à confirmer et comparer le produit net de scénarios réalistes.',
    analysisKey:'laval-options-analysis', analysisHeading:'Faites le point confidentiellement sur votre situation.', analysisButton:'Faire analyser ma situation',
    statType:'all',
    proofTitle:'Une décision pressée devient plus claire quand les faits sont séparés.',
    proofIntro:'La première étape consiste à identifier le document, confirmer les dates auprès des bons intervenants et estimer ce qu’une vente réaliste pourrait produire.',
    cards:[['Dates','Repérer la date du document, les échéances à confirmer et le temps réellement disponible.'],['Valeur','Comparer la propriété à des ventes pertinentes plutôt qu’à une estimation automatique.'],['Produit net','Distinguer le prix affiché des montants qui seraient réellement disponibles après la transaction.']],
    faq:[['Est-ce que mettre la propriété en vente arrête automatiquement une procédure?','Non. Une mise en marché ne suspend pas automatiquement un processus. Les dates et obligations doivent être confirmées avec les intervenants compétents.'],['Puis-je parler à Pierre sans m’engager à vendre?','Oui. Une première conversation sert à clarifier la situation et les options immobilières possibles.'],['Une offre directe est-elle toujours la meilleure option?','Pas nécessairement. Il faut comparer le prix, les conditions, le délai, le produit net et la probabilité réelle de conclure.'],['Mes renseignements restent-ils confidentiels?','Les renseignements servent à répondre à votre demande. Les motivations et seuils de négociation ne sont pas des arguments de mise en marché.']]
  },
  {
    key:'accompagnement', code:'02a22', page:'Accompagnement', path:'laval/02a22', image:'accompagnement',
    alt:'Maison familiale à demi-niveaux entourée d’arbres matures dans un quartier de Laval.',
    title:'Succession et propriété héritée à Laval | Accompagnement',
    description:'Maison héritée, succession ou décision familiale à Laval : coordonnez documents, valeur, préparation et calendrier avec un accompagnement immobilier direct.',
    kicker:'Accompagnement immobilier à Laval',
    h1:'Une propriété héritée demande un plan clair avant de parler de mise en marché.',
    lead:'Lorsqu’une maison ou un immeuble implique une succession, plusieurs héritiers ou une personne à distance, la priorité est de clarifier les rôles, les documents, l’état du bâtiment et le calendrier.',
    trust:'Décisions partagées • Documents organisés • Interlocuteur direct',
    video:'Laval : organiser une propriété héritée sans brûler les étapes',
    guide:'Checklist succession — propriété héritée à Laval', guideCover:'Checklist succession', guideKey:'laval-accompagnement-checklist', guideButton:'Recevoir la checklist', guideIntro:'Une liste pour organiser les autorisations, les documents, les accès, l’entretien et les décisions entre les personnes concernées.',
    analysisKey:'laval-accompagnement-analysis', analysisHeading:'Expliquez-nous où en est la propriété.', analysisButton:'Faire le point avec Pierre',
    statType:'house',
    proofTitle:'Le rôle du courtier est d’organiser le volet immobilier.',
    proofIntro:'Le liquidateur, le notaire et les autres professionnels conservent leurs rôles. Pierre structure la valeur, la préparation, la mise en marché et les communications liées à la propriété.',
    cards:[['Documents','Déclaration de copropriété, factures, baux, certificat de localisation et renseignements sur le bâtiment selon le cas.'],['Décisions','Identifier qui peut décider, qui doit être informé et comment documenter les choix.'],['Préparation','Sécuriser, vider, nettoyer et corriger seulement ce qui soutient réellement la vente.']],
    faq:[['Le courtier remplace-t-il le notaire ou le liquidateur?','Non. Pierre prend en charge le volet immobilier et coordonne son travail avec les personnes autorisées.'],['Faut-il vider complètement la maison avant une première rencontre?','Non. Une première visite peut aider à prioriser ce qui doit être fait, conservé ou documenté.'],['Pouvez-vous communiquer avec plusieurs membres de la famille?','Oui, lorsqu’une personne autorisée définit clairement les rôles et les attentes de communication.'],['Comment établissez-vous la valeur?','À partir du bâtiment, de son état, de son micro-marché et de ventes comparables pertinentes, sans transformer une statistique régionale en estimation automatique.']]
  },
  {
    key:'investisseur', code:'03i33', page:'Patrimoine / Investisseur', path:'laval/03i33', image:'investisseur',
    alt:'Duplex en brique avec balcons dans un secteur résidentiel de Laval.',
    title:'Vendre un plex ou immeuble à revenus à Laval',
    description:'Duplex, triplex ou immeuble à revenus à Laval : structurez revenus, dépenses, occupation, travaux et valeur avant la mise en marché.',
    kicker:'Patrimoine et investissement à Laval',
    h1:'Un plex se vend avec des chiffres lisibles, un bâtiment compris et une stratégie adaptée.',
    lead:'Duplex ou triplex à Chomedey, Pont-Viau ou Laval-des-Rapides : les revenus, les dépenses, l’occupation, les travaux et le potentiel du bâtiment influencent la lecture d’un acheteur.',
    trust:'Revenus et dépenses • État du bâtiment • Acheteurs ciblés',
    video:'Laval : préparer un plex pour une analyse crédible',
    guide:'Guide du vendeur de plex — Laval', guideCover:'Guide du vendeur de plex', guideKey:'laval-investisseur-guide', guideButton:'Recevoir le guide', guideIntro:'Une liste de préparation des baux, revenus, dépenses, travaux, occupations et caractéristiques du bâtiment avant l’analyse.',
    analysisKey:'laval-investisseur-analysis', analysisHeading:'Faites analyser votre immeuble à revenus.', analysisButton:'Demander une analyse du plex',
    statType:'plex',
    proofTitle:'La valeur d’un plex ne tient pas dans un multiplicateur isolé.',
    proofIntro:'Un dossier crédible relie les revenus réels, les dépenses, les baux, l’état du bâtiment, les travaux et les comparables de vente.',
    cards:[['Revenus','Baux, loyers, inclusions, stationnements, locaux vacants et potentiel à expliquer sans extrapolation.'],['Dépenses','Taxes, assurances, énergie et travaux récurrents présentés de façon cohérente.'],['Bâtiment','État, entretien, conformité documentaire et investissements récents à mettre en contexte.']],
    faq:[['Quelle statistique utilisez-vous pour les plex à Laval?','La page affiche le segment Centris des propriétés de 2 à 5 logements pour la région statistique de Laval.'],['Faut-il avoir tous les baux avant l’analyse?','Ils sont importants, mais une première discussion peut commencer avec l’information disponible et une liste claire des documents manquants.'],['Est-ce que le prix dépend seulement des revenus?','Non. Les dépenses, l’état du bâtiment, l’occupation, le secteur, le financement des acheteurs et les ventes comparables comptent aussi.'],['Pouvez-vous analyser un immeuble partiellement occupé par le propriétaire?','Oui. L’occupation actuelle et future doit simplement être comprise et documentée.']]
  },
  {
    key:'maison', code:'04m44', page:'Maison', path:'laval/04m44', image:'maison',
    alt:'Maison familiale de deux étages avec garage dans un quartier établi de Laval.',
    title:'Vendre une maison à Laval | Valeur et préparation',
    description:'Vendre une maison à Laval : analysez la valeur, les travaux utiles, la présentation et le calendrier avec Pierre Dalpé.',
    kicker:'Vendre une maison à Laval',
    h1:'Votre maison mérite une stratégie fondée sur son secteur, son état et votre prochaine étape.',
    lead:'Bungalow, maison à demi-niveaux ou cottage familial : les acheteurs ne lisent pas chaque propriété de la même façon. Une préparation ciblée aide à présenter la maison sans sur-rénover.',
    trust:'Valeur locale • Travaux prioritaires • Vente et prochain achat',
    video:'Laval : préparer une maison sans sur-rénover',
    guide:'Guide du vendeur de maison — Laval', guideCover:'Guide maison', guideKey:'laval-maison-guide', guideButton:'Recevoir le guide', guideIntro:'Une ressource pour prioriser la présentation, les documents, les travaux utiles et la synchronisation avec le prochain achat.',
    analysisKey:'laval-maison-analysis', analysisHeading:'Recevez un plan de vente adapté à votre maison.', analysisButton:'Faire analyser ma maison',
    statType:'house',
    proofTitle:'La bonne préparation est sélective.',
    proofIntro:'Le but n’est pas de transformer la maison. Il est de réduire les objections, mettre en valeur ses forces et aligner les travaux sur le calendrier de vente.',
    cards:[['Comparables','Sélectionner des maisons vraiment comparables par secteur, dimensions, âge et état.'],['Présentation','Lumière, rangement, entretien et petites corrections qui soutiennent les photos et les visites.'],['Synchronisation','Prévoir l’occupation, la date de vente et le prochain achat avant le lancement.']],
    faq:[['Quand devrais-je demander une analyse?','Idéalement avant d’engager des travaux importants ou de fixer votre prochain achat.'],['Toutes les rénovations augmentent-elles la valeur?','Non. Leur impact dépend du coût, de l’état initial, du secteur, des attentes des acheteurs et du temps disponible.'],['Les données régionales donnent-elles le prix de ma maison?','Non. Elles situent le marché des maisons à Laval; la propriété doit ensuite être comparée individuellement.'],['Pouvez-vous coordonner vente et achat?','Oui. Le calendrier, les conditions et les solutions d’occupation peuvent être planifiés ensemble.']]
  },
  {
    key:'condo', code:'05c55', page:'Condo', path:'laval/05c55', image:'condo',
    alt:'Immeuble de copropriétés contemporain dans un secteur urbain verdoyant de Laval.',
    title:'Vendre un condo à Laval | Documents et stratégie',
    description:'Vendre un condo à Laval : préparez les documents de copropriété, la valeur, la présentation et la stratégie de mise en marché.',
    kicker:'Vendre un condo à Laval',
    h1:'Un condo bien préparé se distingue par sa présentation et par la qualité de son dossier.',
    lead:'À Laval, les copropriétés se trouvent autant dans des milieux établis que près de pôles de transport et de services. Les comparables, les frais, les documents et la concurrence active influencent la décision des acheteurs.',
    trust:'Documents de copropriété • Concurrence active • Présentation claire',
    video:'Laval : les documents qui sécurisent la vente d’un condo',
    guide:'Guide du vendeur de condo — Laval', guideCover:'Guide condo', guideKey:'laval-condo-guide', guideButton:'Recevoir le guide', guideIntro:'Une liste claire des documents de copropriété, des caractéristiques de l’unité et des comparables à préparer.',
    analysisKey:'laval-condo-analysis', analysisHeading:'Faites analyser votre condo et sa concurrence.', analysisButton:'Faire analyser mon condo',
    statType:'condo',
    proofTitle:'Les acheteurs évaluent l’unité et la copropriété.',
    proofIntro:'La présentation du logement compte, mais les procès-verbaux, les états financiers, les assurances, le fonds de prévoyance et les travaux planifiés peuvent aussi influencer la confiance.',
    cards:[['Unité','Étage, lumière, stationnement, rangement, balcon, rénovations et état intérieur.'],['Immeuble','Administration, entretien, travaux, assurances et qualité du dossier documentaire.'],['Concurrence','Comparer les unités réellement concurrentes plutôt que toutes les copropriétés de Laval.']],
    faq:[['Quels documents devrais-je préparer?','Selon la copropriété : déclaration, règlements, procès-verbaux, états financiers, budget, assurances, étude du fonds de prévoyance et carnet d’entretien lorsqu’ils existent.'],['Les frais de condo élevés empêchent-ils une vente?','Ils doivent être expliqués dans le contexte des services, de l’entretien, des réserves et de l’état général de l’immeuble.'],['Le prix médian de Laval est-il mon prix?','Non. Il situe le segment, mais ne remplace pas les comparables de l’unité et de sa concurrence immédiate.'],['Quand commencer à demander les documents au syndicat?','Le plus tôt possible, car un dossier incomplet peut ralentir l’analyse d’un acheteur.']]
  }
];

const esc = (value) => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const pageUrl = (page) => `${base}/${page.path}/`;
const englishPath = (page) => page.key === 'universal' ? 'en/secteurs/laval' : `en/laval/${page.code}`;
const englishUrl = (page) => `${base}/${englishPath(page)}/`;
const imageUrl = (page) => `${base}/assets/laval/hero-laval-${page.image}.webp`;
const pathLinks = pages.filter((p) => p.key !== 'universal').map((p) => `<a href="/${p.path}/"><b>${p.page}</b><span>${p.description}</span><i>Ouvrir ce parcours →</i></a>`).join('');
const microList = microMarkets.map((name) => `<li>${name}</li>`).join('');

function schema(page) {
  return JSON.stringify({'@context':'https://schema.org','@graph':[
    {'@type':'WebPage','@id':`${pageUrl(page)}#page`,url:pageUrl(page),name:page.title,description:page.description,inLanguage:'fr-CA',breadcrumb:{'@id':`${pageUrl(page)}#breadcrumb`},about:{'@id':`${base}/#broker`}},
    {'@type':'BreadcrumbList','@id':`${pageUrl(page)}#breadcrumb`,itemListElement:[{'@type':'ListItem',position:1,name:'Accueil',item:`${base}/`},{'@type':'ListItem',position:2,name:'Laval',item:`${base}/secteurs/laval/`},{'@type':'ListItem',position:3,name:page.page,item:pageUrl(page)}]},
    {'@type':'Person','@id':`${base}/#pierre`,name:'Pierre Dalpé',jobTitle:'Courtier immobilier résidentiel et commercial',telephone:'+1-514-216-4013',email:'pierre@courtierducoin.ca',image:`${base}/assets/pierre-dalpe-portrait-transparent.png`},
    {'@type':'RealEstateAgent','@id':`${base}/#broker`,name:'Pierre Dalpé — Courtier du Coin',url:pageUrl(page),telephone:'+1-514-216-4013',areaServed:{'@type':'AdministrativeArea',name:'Laval'},parentOrganization:{'@id':`${base}/#sutton`}},
    {'@type':'Organization','@id':`${base}/#organization`,name:'Courtier du Coin',url:`${base}/`,founder:{'@id':`${base}/#pierre`}},
    {'@type':'Organization','@id':`${base}/#sutton`,name:'groupe sutton - performer inc.',description:'Agence immobilière'},
    {'@type':'VideoObject',name:page.video,description:`Capsule de préparation immobilière pour ${page.page.toLowerCase()} à Laval.`,thumbnailUrl:imageUrl(page),uploadDate:'2026-08-11'},
    {'@type':'FAQPage',mainEntity:page.faq.map(([question,answer]) => ({'@type':'Question',name:question,acceptedAnswer:{'@type':'Answer',text:answer}}))}
  ]}).replaceAll('<','\\u003c');
}

function header(page) {
  return `<header class="rm-header"><a class="rm-brand" href="/" aria-label="Courtier du Coin — accueil"><span aria-hidden="true">C</span><b>COURTIER DU COIN<small>avec Pierre Dalpé</small></b></a><nav aria-label="Navigation principale"><a href="/vendre/">Vendre</a><a href="/acheter/">Acheter</a><a href="/investir/">Investir</a><a href="/#secteurs">Secteurs</a><a href="#guide">Guides</a></nav><a class="lang-switch" href="/${englishPath(page)}/" lang="en" hreflang="en-CA" aria-label="View this page in English">🌐 EN</a><a class="rm-phone" href="tel:+15142164013">514 216-4013</a><a class="rm-button compact" href="#analyse">Demander une analyse</a><img src="/assets/sutton-wordmark.png" alt="groupe sutton - performer inc., agence immobilière" width="118" height="42"><button class="rm-menu" type="button" aria-label="Ouvrir le menu" aria-expanded="false">Menu</button></header>`;
}

function footer(page) {
  return `<footer class="rm-footer"><div><b>COURTIER DU COIN</b><span>avec Pierre Dalpé</span><p>Immobilier local, stratégie claire et accompagnement direct.</p></div><div><b>Pierre Dalpé</b><span>Courtier immobilier résidentiel et commercial</span><span>groupe sutton - performer inc. — Agence immobilière</span><img src="/assets/sutton-wordmark.png" alt="groupe sutton - performer inc., agence immobilière" width="160" height="52"></div><div><a href="tel:+15142164013">514 216-4013</a><a href="mailto:pierre@courtierducoin.ca">pierre@courtierducoin.ca</a></div><div><a href="/${englishPath(page)}/" lang="en" hreflang="en-CA">🌐 English</a><a href="/secteurs/laval/">Laval</a><a href="/confidentialite.html">Politique de confidentialité</a></div><small>© 2026 Pierre Dalpé Inc. Tous droits réservés.</small></footer><div class="rm-mobile"><a href="tel:+15142164013">Appeler</a><a href="sms:+15142164013">Texter</a><a href="#analyse">Faire le point</a></div>`;
}

function statCards(page) {
  const all = `<article><small>Total résidentiel</small><strong data-market-stat="residential.quarter.sales">—</strong><b>ventes au T2 2026</b><span><span data-market-stat="residential.quarter.newListings">—</span> nouvelles inscriptions</span><span><span data-market-stat="residential.quarter.activeListings">—</span> inscriptions en vigueur</span></article>`;
  const house = `<article><small>Maisons</small><strong data-market-stat="singleFamily.quarter.sales">—</strong><b>ventes au T2 2026</b><span>Prix médian : <span data-market-stat="singleFamily.quarter.medianPrice" data-format="currency">—</span></span><span>Délai moyen : <span data-market-stat="singleFamily.quarter.avgDaysOnMarket" data-format="days">—</span></span></article>`;
  const condo = `<article><small>Condos</small><strong data-market-stat="condo.quarter.sales">—</strong><b>ventes au T2 2026</b><span>Prix médian : <span data-market-stat="condo.quarter.medianPrice" data-format="currency">—</span></span><span>Délai moyen : <span data-market-stat="condo.quarter.avgDaysOnMarket" data-format="days">—</span></span></article>`;
  const plex = `<article><small>Plex — 2 à 5 logements</small><strong data-market-stat="plex2to5.quarter.sales">—</strong><b>ventes au T2 2026</b><span>Prix médian : <span data-market-stat="plex2to5.quarter.medianPrice" data-format="currency">—</span></span><span>Délai moyen : <span data-market-stat="plex2to5.quarter.avgDaysOnMarket" data-format="days">—</span></span></article>`;
  if (page.statType === 'house') return house;
  if (page.statType === 'condo') return condo;
  if (page.statType === 'plex') return plex;
  return all + house + condo + plex;
}

function guideForm(page) {
  return `<form class="rm-mini-form" action="/api/contact.php" method="post" data-source-key="${page.guideKey}"><div><label>Prénom<input name="prenom" autocomplete="given-name" required></label><label>Courriel ou téléphone<input name="contact" autocomplete="email" required></label></div><input type="hidden" name="source_key" value="${page.guideKey}"><input type="hidden" name="form_id" value="${page.guideKey}"><input type="hidden" name="nom" value="Demande ${esc(page.guide)}"><input type="hidden" name="courriel"><input type="hidden" name="telephone"><input type="hidden" name="projet" value="Vendre"><input type="hidden" name="langue" value="Français"><input type="hidden" name="contact_pref" value="À confirmer"><input type="hidden" name="moment" value="À convenir"><input type="hidden" name="region" value="laval"><input type="hidden" name="page_type" value="${page.key === 'universal' ? 'universal' : 'specialized'}"><input type="hidden" name="campaign_type" value="${page.key}"><input type="hidden" name="campaign_code" value="${page.code}"><label class="check"><input type="checkbox" name="consent_request" value="oui" required> J’accepte que Pierre Dalpé communique avec moi pour répondre à cette demande.</label><label class="check"><input type="checkbox" name="consent_marketing" value="oui"> Je souhaite recevoir occasionnellement des conseils immobiliers. Je peux me désabonner en tout temps.</label><button class="rm-button" type="submit">${page.guideButton}</button><small class="form-privacy">Vos renseignements servent à répondre à votre demande. <a href="/confidentialite.html">Politique de confidentialité</a>.</small><p class="form-status" aria-live="polite"></p></form>`;
}

function analysisForm(page) {
  return `<form class="progress-form" action="/api/contact.php" method="post" data-source-key="${page.analysisKey}"><input type="hidden" name="source_key" value="${page.analysisKey}"><input type="hidden" name="form_id" value="${page.analysisKey}"><section data-step="1"><label>Type de propriété<select name="property_type" required><option value="">Choisir</option><option>Maison</option><option>Condo</option><option>Duplex</option><option>Triplex</option><option>4–5 logements</option><option>Autre</option></select></label><label>Secteur ou quartier<input name="municipality" list="laval-sectors" required><datalist id="laval-sectors">${microMarkets.map((name) => `<option>${name}</option>`).join('')}</datalist></label><button class="rm-button" type="button" data-next>Continuer</button></section><section data-step="2" hidden><label>Adresse de la propriété<input name="adresse" autocomplete="street-address" required></label><label>Votre calendrier<select name="timeline"><option>Je m’informe</option><option>Dans les 3 prochains mois</option><option>Dans 3 à 6 mois</option><option>Dans 6 à 12 mois</option><option>Échéance à confirmer</option></select></label><button class="rm-button" type="button" data-next>Continuer</button></section><section data-step="3" hidden><div class="form-grid"><label>Prénom<input name="prenom" autocomplete="given-name" required></label><label>Nom<input name="nom" autocomplete="family-name" required></label><label>Téléphone<input type="tel" name="telephone" autocomplete="tel"></label><label>Courriel<input type="email" name="courriel" autocomplete="email"></label><label>Préférence<select name="contact_pref"><option>Appel</option><option>SMS</option><option>Courriel</option></select></label><label>Meilleur moment<input name="moment"></label><label class="wide">Ce que vous souhaitez clarifier<textarea name="message"></textarea></label></div><input type="hidden" name="projet" value="Vendre"><input type="hidden" name="langue" value="Français"><input type="hidden" name="region" value="laval"><input type="hidden" name="page_type" value="${page.key === 'universal' ? 'universal' : 'specialized'}"><input type="hidden" name="campaign_type" value="${page.key}"><input type="hidden" name="campaign_code" value="${page.code}"><label class="check"><input type="checkbox" name="consent_request" value="oui" required> J’accepte que Pierre Dalpé communique avec moi pour répondre à cette demande.</label><label class="check"><input type="checkbox" name="consent_marketing" value="oui"> Je souhaite recevoir occasionnellement des conseils immobiliers. Je peux me désabonner en tout temps.</label><button class="rm-button" type="submit">${page.analysisButton}</button><small class="form-privacy">Vos renseignements servent à répondre à votre demande. <a href="/confidentialite.html">Politique de confidentialité</a>.</small><p class="form-status" aria-live="polite"></p></section></form>`;
}

function html(page) {
  const canonical = pageUrl(page);
  const cards = page.cards.map(([title,text]) => `<article><h3>${title}</h3><p>${text}</p></article>`).join('');
  const faq = page.faq.map(([question,answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join('');
  const statsClass = page.statType === 'all' ? 'stat-grid' : 'stat-grid one';
  const heroAsset = '/assets/pierre-dalpe-portrait-transparent.png';
  const heroMedia = `<div class="rm-hero-photo rm-hero-portrait"><img src="/assets/pierre-dalpe-portrait-transparent.png" alt="Pierre Dalpé, courtier immobilier résidentiel et commercial." width="1254" height="1254" fetchpriority="high"><span>Pierre Dalpé<small>Courtier immobilier résidentiel et commercial</small></span></div>`;
  const proofSection = `<section class="rm-section property-proof-section"><div class="property-proof-copy"><p class="rm-kicker dark">Une lecture locale structurée</p><h2>${page.proofTitle}</h2><p class="intro">${page.proofIntro}</p></div><figure class="property-proof-photo"><img src="/assets/laval/hero-laval-${page.image}.webp" alt="${page.alt}" width="1600" height="900" loading="lazy" decoding="async"><figcaption>${page.page} à Laval</figcaption></figure><div class="local-proof">${cards}</div></section>`;
  return `<!doctype html>
<html lang="fr-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${page.title}</title><meta name="description" content="${esc(page.description)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="fr-CA" href="${canonical}"><link rel="alternate" hreflang="en-CA" href="${englishUrl(page)}"><link rel="alternate" hreflang="x-default" href="${canonical}"><link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><meta property="og:type" content="website"><meta property="og:locale" content="fr_CA"><meta property="og:title" content="${esc(page.title)}"><meta property="og:description" content="${esc(page.description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${imageUrl(page)}"><link rel="preload" as="image" href="${heroAsset}" fetchpriority="high"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/laval-master.css?v=20260812-bilingual"><script type="application/ld+json">${schema(page)}</script></head>
<body class="rm-page laval-page laval-${page.key}" data-region="laval" data-page-type="${page.key === 'universal' ? 'universal' : 'specialized'}" data-campaign-type="${page.key}" data-public-page="${page.page}" data-campaign-code="${page.code}">
${header(page)}<main><nav class="breadcrumb" aria-label="Fil d’Ariane"><a href="/">Accueil</a><span>›</span><a href="/secteurs/laval/">Laval</a><span>›</span><span>${page.page}</span></nav>
<section class="rm-hero"><div><p class="rm-kicker">${page.kicker}</p><h1>${page.h1}</h1><p class="rm-lead">${page.lead}</p><div class="rm-actions"><a class="rm-button" href="#analyse">${page.analysisButton}</a><a class="rm-button outline" href="#guide">${page.guideButton}</a></div><p>Vous préférez parler maintenant? <a href="tel:+15142164013">Appelez</a> ou <a href="sms:+15142164013">textez</a> Pierre.</p><div class="trust-line">${page.trust}</div></div>${heroMedia}</section>
<section class="rm-section video-section"><div><p class="rm-kicker dark">Une première lecture, sans pression</p><h2>${page.video}</h2><p>Cette capsule expliquera les vérifications utiles avant de décider de la valeur, des travaux ou du calendrier.</p><p class="notice">La capsule vidéo est en préparation. La page reste complète et fonctionnelle sans lecteur externe.</p></div><div class="rm-video" data-video style="--video-image:url('/assets/laval/hero-laval-${page.image}.webp')"><button class="video-poster" type="button" aria-label="Capsule vidéo locale en préparation"><span aria-hidden="true">▶</span><b>Capsule locale en préparation</b><small>Aucun lecteur lourd n’est chargé.</small></button></div></section>
${proofSection}
${page.key === 'universal' ? `<section class="rm-section pathways"><p class="rm-kicker">Cinq parcours spécialisés</p><h2>Choisissez la page qui correspond le mieux à votre situation.</h2><p>Chaque parcours conserve la même méthode locale pour Laval.</p><div class="path-list">${pathLinks}</div></section>` : `<section class="rm-section shade"><p class="rm-kicker dark">Le contexte lavallois</p><h2>Un seul nom de ville, plusieurs micro-marchés.</h2><p>Les secteurs historiques et les formes bâties de Laval ne se comparent pas automatiquement. Voici les milieux reconnus à considérer dans une première lecture.</p><ul class="micro-list">${microList}</ul><p><small>Ces repères servent à orienter l’analyse; ils ne constituent ni des statistiques de quartier ni une estimation automatisée.</small></p></section>`}
<section class="rm-section guide" id="guide"><div class="guide-cover"><small>COURTIER DU COIN</small><strong>${page.guideCover}</strong><span>Laval · 2026</span><b>Préparer. Comprendre. Décider.</b></div><div><p class="rm-kicker dark">Ressource pratique</p><h2>${page.guide}</h2><p>${page.guideIntro}</p><ul><li>Clarifier le type de propriété et le secteur</li><li>Rassembler les documents utiles</li><li>Prioriser les vérifications et les travaux</li><li>Préparer un calendrier réaliste</li></ul>${guideForm(page)}</div></section>
<section class="rm-section stats"><p class="rm-kicker dark">Centris · données vérifiées le 11 août 2026</p><h2>Le marché immobilier de Laval en chiffres</h2><p>Portrait du 2e trimestre 2026. Ces données couvrent la région statistique de Laval et ne constituent pas l’évaluation d’une propriété ni d’un quartier.</p><div class="${statsClass}">${statCards(page)}</div>${page.statType === 'all' ? `<p><strong>Cumul des quatre derniers trimestres :</strong> <span data-market-stat="residential.rolling4Q.sales">—</span> ventes résidentielles, <span data-market-stat="residential.rolling4Q.newListings">—</span> nouvelles inscriptions et <span data-market-stat="residential.rolling4Q.activeListings">—</span> inscriptions en vigueur.</p>` : ''}<small class="source">Source : <a href="https://www.centris.ca/fr/outils/statistiques-immobilieres/laval" rel="noopener">Centris, statistiques immobilières — Laval, T2 2026</a>. Les valeurs affichées proviennent du fichier de données central du secteur. Aucune moyenne ou médiane de quartier n’est créée.</small></section>
<section class="rm-section ${page.key === 'universal' ? 'shade' : 'process'}"><p class="rm-kicker ${page.key === 'universal' ? 'dark' : ''}">Méthode</p><h2>Avancer dans le bon ordre.</h2><div class="card-grid four"><article><span>01</span><h3>Comprendre</h3><p>Votre propriété, votre situation et votre calendrier.</p></article><article><span>02</span><h3>Comparer</h3><p>Les données utiles et les ventes réellement pertinentes.</p></article><article><span>03</span><h3>Préparer</h3><p>Les documents, les corrections et la présentation.</p></article><article><span>04</span><h3>Décider</h3><p>Une stratégie cohérente avec votre prochaine étape.</p></article></div></section>
<section class="rm-section faq"><p class="rm-kicker dark">Questions fréquentes</p><h2>${page.page} à Laval</h2><div class="faq-grid">${faq}</div></section>
<section class="rm-section valuation" id="analyse"><div><p class="rm-kicker">Une première étape simple</p><h2>${page.analysisHeading}</h2><p>Le formulaire conserve la provenance de cette page et vos paramètres de campagne afin que Pierre comprenne immédiatement le contexte.</p></div>${analysisForm(page)}</section>
<section class="rm-final"><h2>Vous n’avez pas besoin d’avoir tout préparé avant d’appeler.</h2><p>Une première conversation peut simplement servir à comprendre la propriété, le micro-marché, le calendrier et les prochaines vérifications utiles.</p><div class="rm-actions"><a class="rm-button" href="tel:+15142164013">Parler à Pierre</a><a class="rm-button outline" href="#analyse">${page.analysisButton}</a></div></section></main>${footer(page)}<script src="/laval-master.js?v=20260812-bilingual" defer></script></body></html>`;
}

for (const page of pages) {
  const dir = join(root, ...page.path.split('/'));
  await mkdir(dir, {recursive:true});
  await writeFile(join(dir,'index.html'), html(page), 'utf8');
}
console.log(`Generated ${pages.length} Laval pages.`);
