import {readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const root = process.cwd();
const key = 'repentigny';
const paths = [`secteurs/${key}`, `${key}/o1a11`, `${key}/02a22`, `${key}/03i33`, `${key}/04m44`, `${key}/05c55`];

for (const path of paths) {
  const file = join(root, path, 'index.html');
  let html = await readFile(file, 'utf8');
  html = html
    .replaceAll('dans Repentigny', 'à Repentigny')
    .replaceAll('du Repentigny', 'de Repentigny')
    .replaceAll('de le Gardeur', 'du Gardeur')
    .replace('Le marché immobilier de Repentigny en chiffres', 'Le marché immobilier de Repentigny en chiffres')
    .replace('Portrait du 2e trimestre 2026. Ces données couvrent la ville et ne constituent pas l’évaluation d’une propriété ni d’une rue.', 'Portrait du 2e trimestre 2026. Ces données couvrent la ville de Repentigny et ne constituent pas l’évaluation d’une propriété ni d’une rue.')
    .replace('Centris — Repentigny, T2 2026', 'Centris — Repentigny (Repentigny), T2 2026')
    .replaceAll('La page affiche le segment Centris des propriétés de 2 à 5 logements à Repentigny.', 'La page affiche le segment Centris des propriétés de 2 à 5 logements à Repentigny. Les valeurs masquées par la source ne sont pas inventées.');
  await writeFile(file, html, 'utf8');

  const enFile = join(root, 'en', path, 'index.html');
  let en = await readFile(enFile, 'utf8');
  en = en
    .replace('Q2 2026 snapshot. These figures cover the city and are not a property or street valuation.', 'Q2 2026 snapshot. These figures cover the city of Repentigny and are not a property or street valuation.')
    .replace('Centris — Repentigny, Q2 2026', 'Centris — Repentigny (Repentigny), Q2 2026')
    .replaceAll('The page displays Centris data for properties with two to five units in Repentigny.', 'The page displays Centris data for properties with two to five units in Repentigny. Values masked by the source are not invented.');
  await writeFile(enFile, en, 'utf8');
}

console.log('Applied Repentigny data-scope and bilingual corrections.');
