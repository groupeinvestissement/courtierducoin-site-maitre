import fs from 'node:fs';

const file = 'vaudreuil-soulanges/04m44/index.html';
const html = fs.readFileSync(file, 'utf8');
const required = [
  'name="robots" content="index,follow"',
  'https://www.courtierducoin.ca/vaudreuil-soulanges/04m44/',
  'hero-vaudreuil-soulanges-maison.webp',
  '1 468 ventes', '625 000 $', '44 jours', '418', '627 000 $', '635', '38 jours',
  'name="house_type"', 'name="sale_timeline"', 'name="next_purchase"',
  'name="major_work_considered"', 'name="property_features[]"',
  'name="page_type" value="specialized"', 'name="campaign_type" value="maison"',
  'name="campaign_code" value="04m44"', 'name="lead_context" value="house-seller"',
  'name="consent_request"', 'name="consent_marketing"',
  '"@type":"Organization"', '"@type":"VideoObject"'
];
const missing = required.filter((token) => !html.includes(token));
const steps = [...html.matchAll(/<section data-step="(\d)"/g)].map((m) => m[1]);
const schemaText = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
if (!schemaText) throw new Error('Données structurées absentes');
JSON.parse(schemaText);
if (missing.length) throw new Error(`Éléments manquants: ${missing.join(', ')}`);
if (steps.join(',') !== '1,2,3,4') throw new Error(`Étapes invalides: ${steps.join(',')}`);
if (/Rosemont|Masson|Angus/.test(html)) throw new Error('Référence locale incorrecte détectée');
console.log('Validation Maison V4 réussie.');
