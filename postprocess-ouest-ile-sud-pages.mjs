import {readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const root = process.cwd();
const key = 'ouest-de-lile-sud';
const paths = [`secteurs/${key}`, `${key}/o1a11`, `${key}/02a22`, `${key}/03i33`, `${key}/04m44`, `${key}/05c55`];

for (const path of paths) {
  const file = join(root, path, 'index.html');
  let html = await readFile(file, 'utf8');
  html = html
    .replaceAll('dans Ouest-de-l’Île — Sud', 'dans l’Ouest-de-l’Île — Sud')
    .replaceAll('dans Ouest-de-l’Île Sud', 'dans l’Ouest-de-l’Île Sud')
    .replaceAll('du Ouest-de-l’Île', 'de l’Ouest-de-l’Île')
    .replace('Le marché immobilier du Ouest-de-l’Île — Sud en chiffres', 'Repères du marché pour le sud de l’Ouest-de-l’Île')
    .replace('Portrait du 2e trimestre 2026. Ces données couvrent l’arrondissement et ne constituent pas l’évaluation d’une propriété ni d’une rue.', 'Portrait du 2e trimestre 2026 pour Pointe-Claire. Cette géographie sert de repère vérifiable et ne représente pas automatiquement Beaconsfield, Dorval, Baie-d’Urfé ou Kirkland; aucune moyenne combinée n’est calculée.')
    .replace('Centris — Ouest-de-l’Île — Sud, T2 2026', 'Centris — Pointe-Claire, T2 2026')
    .replace('Un arrondissement, plusieurs micro-marchés.', 'Un secteur, plusieurs micro-marchés.')
    .replaceAll('La page affiche le segment Centris des propriétés de 2 à 5 logements dans Ouest-de-l’Île — Sud.', 'La page affiche le segment Centris des propriétés de 2 à 5 logements à Pointe-Claire. Les prix et délais masqués pour volume insuffisant ne sont pas inventés.');
  await writeFile(file, html, 'utf8');

  const enFile = join(root, 'en', path, 'index.html');
  let en = await readFile(enFile, 'utf8');
  en = en
    .replaceAll('Ouest-de-l’Île — Sud', 'West Island — South')
    .replaceAll('Ouest-de-l’Île Sud', 'southern West Island')
    .replace('West Island — South real estate market in numbers', 'Market reference points for the southern West Island')
    .replace('Q2 2026 snapshot. These figures cover the borough and are not a property or street valuation.', 'Q2 2026 snapshot for Pointe-Claire. This verified geography is a market reference and does not automatically represent Beaconsfield, Dorval, Baie-d’Urfé or Kirkland; no combined average is calculated.')
    .replace('Centris — West Island — South, T2 2026', 'Centris — Pointe-Claire, Q2 2026')
    .replace('One borough, several micro-markets.', 'One area, several micro-markets.')
    .replaceAll('The page displays Centris data for properties with two to five units in West Island — South.', 'The page displays Centris data for properties with two to five units in Pointe-Claire. Prices and timing masked for insufficient volume are not invented.');
  await writeFile(enFile, en, 'utf8');
}

console.log('Applied West Island South geography and bilingual-name corrections.');
