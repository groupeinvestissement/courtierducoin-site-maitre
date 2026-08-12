import {readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const root = process.cwd();
const key = 'ouest-de-lile-nord';
const paths = [`secteurs/${key}`, `${key}/o1a11`, `${key}/02a22`, `${key}/03i33`, `${key}/04m44`, `${key}/05c55`];

for (const path of paths) {
  const file = join(root, path, 'index.html');
  let html = await readFile(file, 'utf8');
  html = html
    .replaceAll('dans Ouest-de-l’Île — Nord', 'dans l’Ouest-de-l’Île — Nord')
    .replaceAll('dans Ouest-de-l’Île Nord', 'dans l’Ouest-de-l’Île Nord')
    .replaceAll('du Ouest-de-l’Île', 'de l’Ouest-de-l’Île')
    .replace('Le marché immobilier du Ouest-de-l’Île — Nord en chiffres', 'Repères du marché pour l’Ouest-de-l’Île Nord')
    .replace('Portrait du 2e trimestre 2026. Ces données couvrent l’arrondissement et ne constituent pas l’évaluation d’une propriété ni d’une rue.', 'Portrait du 2e trimestre 2026 pour Montréal (Pierrefonds-Roxboro). Cette géographie sert de repère vérifiable et ne représente pas automatiquement L’Île-Bizard ou Sainte-Geneviève; aucune moyenne combinée n’est calculée.')
    .replace('Centris — Ouest-de-l’Île — Nord, T2 2026', 'Centris — Montréal (Pierrefonds-Roxboro), T2 2026')
    .replace('Un arrondissement, plusieurs micro-marchés.', 'Un secteur, plusieurs micro-marchés.')
    .replaceAll('La page affiche le segment Centris des propriétés de 2 à 5 logements dans Ouest-de-l’Île — Nord.', 'La page affiche le segment Centris des propriétés de 2 à 5 logements à Pierrefonds-Roxboro. Les prix et délais masqués pour volume insuffisant ne sont pas inventés.');
  await writeFile(file, html, 'utf8');

  const enFile = join(root, 'en', path, 'index.html');
  let en = await readFile(enFile, 'utf8');
  en = en
    .replaceAll('Ouest-de-l’Île — Nord', 'West Island — North')
    .replaceAll('Ouest-de-l’Île Nord', 'northern West Island')
    .replace('West Island — North real estate market in numbers', 'Market reference points for the northern West Island')
    .replace('Q2 2026 snapshot. These figures cover the borough and are not a property or street valuation.', 'Q2 2026 snapshot for Montréal (Pierrefonds-Roxboro). This verified geography is a market reference and does not automatically represent L’Île-Bizard or Sainte-Geneviève; no combined average is calculated.')
    .replace('Centris — West Island — North, T2 2026', 'Centris — Montréal (Pierrefonds-Roxboro), Q2 2026')
    .replace('One borough, several micro-markets.', 'One area, several micro-markets.')
    .replaceAll('The page displays Centris data for properties with two to five units in West Island — North.', 'The page displays Centris data for properties with two to five units in Pierrefonds-Roxboro. Prices and timing masked for insufficient volume are not invented.');
  await writeFile(enFile, en, 'utf8');
}

console.log('Applied West Island North geography and bilingual-name corrections.');
