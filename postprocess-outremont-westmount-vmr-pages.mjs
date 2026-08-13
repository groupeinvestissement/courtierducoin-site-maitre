import {readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const root = process.cwd();
const key = 'outremont-westmount-vmr';
const paths = [`secteurs/${key}`, `${key}/o1a11`, `${key}/02a22`, `${key}/03i33`, `${key}/04m44`, `${key}/05c55`];

for (const path of paths) {
  const file = join(root, path, 'index.html');
  let html = await readFile(file, 'utf8');
  html = html
    .replaceAll('dans Outremont / Westmount / VMR', 'à Outremont, Westmount ou Mont-Royal')
    .replaceAll('du Outremont / Westmount / VMR', 'd’Outremont, Westmount ou Mont-Royal')
    .replace('Le marché immobilier du Outremont / Westmount / VMR en chiffres', 'Repères du marché pour Outremont, Westmount et Mont-Royal')
    .replace('Portrait du 2e trimestre 2026. Ces données couvrent l’arrondissement et ne constituent pas l’évaluation d’une propriété ni d’une rue.', 'Portrait du 2e trimestre 2026 pour Montréal (Outremont). Westmount et Mont-Royal possèdent leurs propres profils Centris : les marchés ne sont ni additionnés ni moyennés.')
    .replace('Centris — Outremont / Westmount / VMR, T2 2026', 'Centris — Montréal (Outremont), T2 2026')
    .replace('Un arrondissement, plusieurs micro-marchés.', 'Trois territoires, plusieurs micro-marchés.')
    .replaceAll('La page affiche le segment Centris des propriétés de 2 à 5 logements dans Outremont / Westmount / VMR.', 'La page affiche le segment Centris des propriétés de 2 à 5 logements à Outremont. Les données de Westmount et Mont-Royal restent séparées, et les valeurs masquées ne sont pas inventées.');
  await writeFile(file, html, 'utf8');

  const enFile = join(root, 'en', path, 'index.html');
  let en = await readFile(enFile, 'utf8');
  en = en
    .replace('Outremont / Westmount / VMR real estate market in numbers', 'Market reference points for Outremont, Westmount and Town of Mount Royal')
    .replace('Q2 2026 snapshot. These figures cover the borough and are not a property or street valuation.', 'Q2 2026 snapshot for Montréal (Outremont). Westmount and Town of Mount Royal have separate Centris profiles: the markets are neither added nor averaged.')
    .replace('Centris — Outremont / Westmount / VMR, T2 2026', 'Centris — Montréal (Outremont), Q2 2026')
    .replace('One borough, several micro-markets.', 'Three territories, several micro-markets.')
    .replaceAll('The page displays Centris data for properties with two to five units in Outremont / Westmount / VMR.', 'The page displays Centris data for properties with two to five units in Outremont. Westmount and Town of Mount Royal data remain separate, and masked values are not invented.');
  await writeFile(enFile, en, 'utf8');
}

console.log('Applied Outremont / Westmount / VMR data-scope and bilingual corrections.');
