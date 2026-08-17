import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const base='https://www.courtierducoin.ca';
const source='Source : Association professionnelle des courtiers immobiliers du Québec (APCIQ), FSMI | Baromètre résidentiel, RMR de Montréal, Vaudreuil-Soulanges, 2e trimestre 2026. Données établies à partir du système Centris. Les limites statistiques ne correspondent pas exactement aux 23 municipalités de la MRC et ne remplacent pas l’analyse d’une propriété précise.';
const pages={
 universal:{src:'secteurs/rosemont-la-petite-patrie/index.html',dest:'secteurs/vaudreuil-soulanges/index.html',className:'vs-universal',campaign:'universal',code:'universal',title:'Courtier immobilier à Vaudreuil-Soulanges | Pierre Dalpé',meta:'Vous pensez vendre, acheter ou investir à Vaudreuil-Soulanges? Analyse locale, valeur, préparation et accompagnement direct avec Pierre Dalpé.',image:'hero-vaudreuil-soulanges-universal.webp',script:'rosemont-master.js'},
 o1a11:{src:'rosemont-la-petite-patrie/o1a11/index.html',dest:'vaudreuil-soulanges/o1a11/index.html',className:'vs-o1a11',campaign:'options',code:'o1a11',title:'Préavis de 60 jours ou vente pour taxes à Vaudreuil-Soulanges | Pierre Dalpé',meta:'Préavis hypothécaire, taxes impayées ou autre échéance à Vaudreuil-Soulanges? Clarifiez dates, valeur et options immobilières avec Pierre Dalpé.',image:'hero-vaudreuil-soulanges-options.webp',script:'options-master-v1.js'},
 '02a22':{src:'rosemont-la-petite-patrie/02a22/index.html',dest:'vaudreuil-soulanges/02a22/index.html',className:'vs-02a22',campaign:'accompagnement',code:'02a22',title:'Vendre une propriété en succession à Vaudreuil-Soulanges | Pierre Dalpé',meta:'Vous gérez une propriété héritée à Vaudreuil-Soulanges? Valeur, documents, préparation et coordination immobilière avec Pierre Dalpé.',image:'hero-vaudreuil-soulanges-succession.webp',script:'succession-master-v1.js'},
 '03i33':{src:'rosemont-la-petite-patrie/03i33/index.html',dest:'vaudreuil-soulanges/03i33/index.html',className:'vs-03i33',campaign:'investisseur',code:'03i33',title:'Vendre un plex à Vaudreuil-Soulanges | Pierre Dalpé',meta:'Duplex, triplex ou immeuble à revenus à Vaudreuil-Soulanges? Analysez revenus, dépenses, travaux et marché avec Pierre Dalpé.',image:'hero-vaudreuil-soulanges-investisseur.webp',script:'investor-master.js'},
 '04m44':{src:'rosemont-la-petite-patrie/04m44/index.html',dest:'vaudreuil-soulanges/04m44/index.html',className:'vs-04m44',campaign:'maison',code:'04m44',title:'Vendre une maison à Vaudreuil-Soulanges | Pierre Dalpé',meta:'Vous pensez vendre votre maison à Vaudreuil-Soulanges? Valeur, terrain, travaux, préparation et calendrier avec Pierre Dalpé.',image:'hero-vaudreuil-soulanges-maison.webp',script:'home-master.js'},
 '05c55':{src:'rosemont-la-petite-patrie/05c55/index.html',dest:'vaudreuil-soulanges/05c55/index.html',className:'vs-05c55',campaign:'condo',code:'05c55',title:'Vendre un condo à Vaudreuil-Soulanges | Pierre Dalpé',meta:'Vous pensez vendre votre condo à Vaudreuil-Soulanges? Valeur, documents, fonds de prévoyance, concurrence et présentation avec Pierre Dalpé.',image:'hero-vaudreuil-soulanges-condo.webp',script:'condo-master-v1.js'}
};
const localize=html=>html
 .replaceAll('/rosemont-la-petite-patrie/','/vaudreuil-soulanges/')
 .replaceAll('/secteurs/rosemont-la-petite-patrie/','/secteurs/vaudreuil-soulanges/')
 .replaceAll('rosemont-la-petite-patrie','vaudreuil-soulanges')
 .replaceAll('Rosemont–La Petite-Patrie','Vaudreuil-Soulanges')
 .replaceAll('Rosemont-La Petite-Patrie','Vaudreuil-Soulanges')
 .replaceAll('Rosemont / La Petite-Patrie','Vaudreuil-Soulanges')
 .replaceAll('Rosemont et La Petite-Patrie','Vaudreuil-Soulanges')
 .replaceAll('La Petite-Patrie','L’Île-Perrot')
 .replaceAll('Promenade Masson','Vaudreuil-Dorion')
 .replaceAll('secteur Masson','Soulanges Sud')
 .replaceAll('sur Masson','à Vaudreuil-Dorion')
 .replaceAll('Rosemont','Vaudreuil-Soulanges')
 .replaceAll('à Montréal','près de la propriété')
 .replaceAll('Montréal','Vaudreuil-Soulanges');
const setTitleMeta=(h,c)=>h.replace(/<title>.*?<\/title>/,`<title>${c.title}</title>`).replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${c.meta}">`).replace(/<meta property="og:title" content="[^"]*">/,`<meta property="og:title" content="${c.title}">`).replace(/<meta property="og:description" content="[^"]*">/,`<meta property="og:description" content="${c.meta}">`).replace(/<meta property="og:image" content="[^"]*">/,`<meta property="og:image" content="${base}/assets/vaudreuil-soulanges/${c.image}">`);
const sectionByClass=(html,classToken,replacement)=>html.replace(new RegExp(`<section class="[^"]*\\b${classToken}\\b[^"]*"[^>]*>[\\s\\S]*?<\\/section>`),replacement);
const universalStats=`<section class="rm-section stats"><p class="rm-kicker dark">Données vérifiées le 11 août 2026</p><h2>Le marché immobilier de Vaudreuil-Soulanges en chiffres</h2><p>Portrait du 2e trimestre 2026. Ces données donnent un contexte régional et ne constituent pas une estimation.</p><div class="stat-grid"><article><small>Total résidentiel</small><strong>568</strong><b>ventes</b><span>1 006 nouvelles inscriptions</span><span>913 inscriptions en vigueur</span></article><article><small>Maisons</small><strong>418</strong><b>ventes</b><span>Prix médian : 627 000 $</span><span>Délai moyen : 38 jours</span></article><article><small>Condos</small><strong>136</strong><b>ventes</b><span>Prix médian : 382 223 $</span><span>Délai moyen : 61 jours</span></article><article><small>Plex</small><strong>13</strong><b>ventes au T2</b><span>64 ventes sur 12 mois</span><span>692 500 $ • 78 jours sur 12 mois</span></article></div><small class="source">${source}</small></section>`;
const statsByCode={
 o1a11:`<section class="rm-section"><p class="rm-kicker dark">Marché régional • T2 2026</p><h2>Comprendre le rythme du marché selon votre propriété</h2><div class="card-grid three"><article><h3>Maison</h3><p>418 ventes • médiane 627 000 $ • délai moyen 38 jours</p></article><article><h3>Condo</h3><p>136 ventes • médiane 382 223 $ • délai moyen 61 jours</p></article><article><h3>Plex</h3><p>13 ventes au T2 • médiane 692 500 $ et délai 78 jours sur 12 mois</p></article></div><small>${source}</small></section>`,
 '03i33':`<section class="rm-section stats investor-stats"><p class="rm-kicker dark">APCIQ • 2e trimestre 2026</p><h2>Le marché des plex à Vaudreuil-Soulanges</h2><div class="stat-grid"><article><strong>13</strong><b>ventes au trimestre</b></article><article><strong>23</strong><b>inscriptions en vigueur</b></article><article><strong>692 500 $</strong><b>prix médian sur 12 mois</b></article><article><strong>78 jours</strong><b>délai moyen sur 12 mois</b></article></div><aside>Le nombre de transactions du trimestre est insuffisant pour publier certaines statistiques fiables. Le prix médian et le délai utilisent donc les 12 derniers mois.</aside><small class="source">${source}</small></section>`,
 '04m44':`<section class="rm-section stats"><p class="rm-kicker dark">APCIQ • 2e trimestre 2026</p><h2>Le marché des maisons à Vaudreuil-Soulanges</h2><div class="stat-grid"><article><strong>418</strong><b>ventes de maisons</b></article><article><strong>627 000 $</strong><b>prix médian</b></article><article><strong>635</strong><b>inscriptions en vigueur</b></article><article><strong>38 jours</strong><b>délai moyen de vente</b></article></div><small class="source">${source}</small></section>`,
 '05c55':`<section class="rm-section stats"><p class="rm-kicker dark">APCIQ • 2e trimestre 2026</p><h2>Le marché des condos à Vaudreuil-Soulanges</h2><div class="stat-grid"><article><strong>136</strong><b>ventes de condos</b></article><article><strong>382 223 $</strong><b>prix médian</b></article><article><strong>245</strong><b>inscriptions en vigueur</b></article><article><strong>61 jours</strong><b>délai moyen de vente</b></article></div><small class="source">${source}</small></section>`
};
const markets=`<section class="rm-section shade micro-markets"><p class="rm-kicker dark">Une lecture locale</p><h2>Vaudreuil-Soulanges, secteur par secteur</h2><div class="card-grid four"><article><h3>L’Île-Perrot</h3><p>L’Île-Perrot, Notre-Dame-de-l’Île-Perrot, Pincourt et Terrasse-Vaudreuil.</p><p>Maisons et copropriétés doivent être comparées selon la municipalité, l’environnement et la concurrence réelle.</p></article><article><h3>Vaudreuil-Dorion</h3><p>Vaudreuil-Dorion, Vaudreuil-sur-le-Lac et L’Île-Cadieux.</p><p>Maisons, copropriétés et développements de différentes générations se côtoient.</p></article><article><h3>Soulanges Sud</h3><p>Coteau-du-Lac, Saint-Zotique, Les Cèdres, Les Coteaux et Pointe-des-Cascades.</p><p>Terrain, environnement, âge, axes et services créent des écarts importants.</p></article><article><h3>Saint-Lazare / Hudson</h3><p>Saint-Lazare, Hudson et Vaudreuil-Ouest.</p><p>Grands terrains, propriétés boisées et maisons de caractère exigent des comparables prudents.</p></article></div></section>`;
const genericTranscript={universal:'Une première analyse commence par le type de propriété, son état, ses caractéristiques, le marché actuel et votre calendrier. Le but est de mettre les faits en ordre avant de parler de prix ou de stratégie.',options:'Lorsqu’un document comporte une échéance, identifiez d’abord le document, sa date et les professionnels concernés. Le courtier organise le volet immobilier sans remplacer un avis juridique ou financier.',accompagnement:'Une propriété héritée demande de clarifier les personnes, les documents, l’état du bien, sa valeur et les décisions à prendre. Le volet immobilier peut être préparé progressivement avec les professionnels concernés.',investisseur:'La valeur d’un immeuble à revenus dépend des baux, revenus, dépenses, état, travaux, occupation et profil d’acheteur. Un dossier clair facilite l’analyse et la mise en marché.',maison:'Avant de rénover ou de vendre une maison, commencez par comprendre les comparables, l’état, les travaux réellement utiles, la présentation et votre calendrier.',condo:'Avant de vendre un condo, clarifiez l’unité, la concurrence et le dossier de copropriété : documents, fonds de prévoyance, travaux, frais et cotisations.'};
const replaceVideoTranscript=(html,c)=>html.replace(/(<section class="rm-section video-section[^"]*">[\s\S]*?<details><summary>Lire la transcription<\/summary>)[\s\S]*?(<\/details>[\s\S]*?<\/section>)/,`$1<p>${genericTranscript[c.campaign]}</p>$2`);
for(const [key,c] of Object.entries(pages)){
 if(key==='universal'&&c.src==='secteurs/rosemont-la-petite-patrie/index.html'){
  console.log('Skipped Vaudreuil universal regeneration: the Rosemont source has a route-specific video hero.');
  continue;
 }
 let html=localize(await readFile(join(root,c.src),'utf8'));
 html=setTitleMeta(html,c);
 if(!html.includes('rel="icon"')) html=html.replace('</title>','</title><link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png">');
 html=html.replace(/<body class="([^"]*)">/,`<body class="$1 vs-parity ${c.className}" data-region="vaudreuil-soulanges" data-page-type="${key==='universal'?'universal':'specialized'}" data-campaign-type="${c.campaign}" data-campaign-code="${c.code}">`);
 html=html.replace('</head>','<link rel="stylesheet" href="/vaudreuil-strict-parity.css"></head>');
 html=html.replace(/<script src="\/[^"]+" defer><\/script><\/body>/,`<script src="/vaudreuil-parity-${c.code}.js" defer></script></body>`);
 html=html.replace(/(<p class="trust-line">[\s\S]*?<\/p>)/,`$1<small class="ai-disclosure">Illustration créée à l’aide de l’intelligence artificielle; elle ne représente pas une propriété à vendre.</small>`);
 html=replaceVideoTranscript(html,c);
 if(key==='universal'){
  html=sectionByClass(html,'stats',universalStats);
  html=html.replace(/<section class="rm-section shade"><p class="rm-kicker dark">Une lecture locale<\/p>[\s\S]*?<\/section>/,markets);
  html=html.replace('Votre projet immobilier à Vaudreuil-Soulanges, avec un plan clair','Votre projet immobilier à Vaudreuil-Soulanges, avec un plan clair');
  html=html.replace('/assets/pierre-dalpe-portrait-transparent.png',`/assets/vaudreuil-soulanges/${c.image}`);
 } else {
  if(statsByCode[key]) html=key==='o1a11'?html.replace(/<section class="rm-section"><h2>Comprendre le rythme du marché selon votre propriété<\/h2>[\s\S]*?<\/section>/,statsByCode[key]):sectionByClass(html,key==='03i33'?'investor-stats':'stats',statsByCode[key]);
  if(['o1a11','02a22'].includes(key)) html=html.replace(/(<section class="rm-section (?:shade )?path-options">[\s\S]*?<\/section>)/,m=>m.replace('Ville de Vaudreuil-Soulanges','MRC ou municipalité concernée'));
  if(key==='o1a11') html=html.replace(/<section class="rm-section shade path-options">[\s\S]*?<\/section>/,`<section class="rm-section shade path-options tax-local"><h2>La vente pour taxes dépend de la municipalité et de l’autorité responsable.</h2><p>La MRC administre actuellement le processus pour 16 municipalités ayant délégué cette responsabilité. Pour toute autre municipalité, le document et l’autorité responsable doivent être vérifiés directement.</p><aside>Mettre une propriété en vente ne suspend pas automatiquement le processus. Continuez les démarches avec l’autorité concernée.</aside><a class="rm-button" href="https://mrcvs.ca/municipalites/vente-pour-taxes/">Consulter la source officielle de la MRC</a></section>`);
  if(key==='02a22') html=html.replace('Vous n’habitez pas près de la propriété?','Vous n’habitez pas près de la propriété?');
  if(key==='03i33') html=html.replace('/assets/pierre-dalpe-portrait-transparent.png',`/assets/vaudreuil-soulanges/${c.image}`);
 }
 html=html.replaceAll('secteur 13 — Vaudreuil-Soulanges','secteur statistique Vaudreuil-Soulanges').replaceAll('secteur 13 : Vaudreuil-Soulanges','secteur statistique Vaudreuil-Soulanges');
 html=html.replaceAll('secteur 13','secteur statistique Vaudreuil-Soulanges');
 if(key==='universal') html=html.replace('29 jours pour les copropriétés, 41 pour les unifamiliales et 43 pour les plex','61 jours pour les copropriétés, 38 pour les unifamiliales et 78 jours sur 12 mois pour les plex');
 if(key==='03i33') html=html.replaceAll('43 jours','78 jours');
 if(key==='04m44') html=html.replaceAll('41 jours','38 jours').replaceAll('1 138 000 $','627 000 $');
 if(key==='05c55') html=html.replaceAll('29 jours','61 jours').replaceAll('560 000 $','382 223 $');
 html=html.replaceAll('region" value="rosemont','region" value="vaudreuil-soulanges').replaceAll('region" value="Vaudreuil-Soulanges','region" value="vaudreuil-soulanges');
 const destination=join(root,c.dest);await mkdir(dirname(destination),{recursive:true});await writeFile(destination,html,'utf8');
 let js=localize(await readFile(join(root,c.script),'utf8')).replaceAll("region:'Vaudreuil-Soulanges'","region:'vaudreuil-soulanges'").replaceAll("region: 'Vaudreuil-Soulanges'","region: 'vaudreuil-soulanges'");
 await writeFile(join(root,`vaudreuil-parity-${c.code}.js`),js,'utf8');
}
console.log('Generated strict Rosemont-parity Vaudreuil pages.');
