import {readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const root = process.cwd();
const key = 'ndg-montreal-ouest';
const paths = [`secteurs/${key}`, `${key}/o1a11`, `${key}/02a22`, `${key}/03i33`, `${key}/04m44`, `${key}/05c55`];

for (const path of paths) {
  const file = join(root, path, 'index.html');
  let html = await readFile(file, 'utf8');
  html = html
    .replace('Le marché immobilier du NDG–Montréal-Ouest en chiffres', 'Repères du marché pour NDG–Montréal-Ouest')
    .replace('Portrait du 2e trimestre 2026. Ces données couvrent l’arrondissement et ne constituent pas l’évaluation d’une propriété ni d’une rue.', 'Portrait du 2e trimestre 2026 pour Montréal (Côte-des-Neiges/Notre-Dame-de-Grâce). Cette géographie inclut Côte-des-Neiges, n’isole pas NDG et ne comprend pas Montréal-Ouest; aucune statistique distincte n’est fusionnée.')
    .replace('Centris — NDG–Montréal-Ouest, T2 2026', 'Centris — Montréal (Côte-des-Neiges/Notre-Dame-de-Grâce), T2 2026')
    .replace('Un arrondissement, plusieurs micro-marchés.', 'Un secteur, plusieurs micro-marchés.')
    .replaceAll('Pierre peut analyser un projet partout dans l’arrondissement, notamment dans NDG–Montréal-Ouest, le Village Monkland, Loyola, Westhaven et Benny Farm.', 'Pierre peut analyser un projet dans NDG, notamment au Village Monkland, à Loyola, à Benny Farm et à Westhaven, ainsi que dans la ville de Montréal-Ouest.');
  await writeFile(file, html, 'utf8');

  const enFile = join(root, 'en', path, 'index.html');
  let en = await readFile(enFile, 'utf8');
  en = en
    .replaceAll('NDG–Montréal-Ouest', 'NDG–Montreal West')
    .replace('NDG–Montreal West real estate market in numbers', 'Market reference points for NDG–Montreal West')
    .replace('Q2 2026 snapshot. These figures cover the borough and are not a property or street valuation.', 'Q2 2026 snapshot for Montréal (Côte-des-Neiges/Notre-Dame-de-Grâce). This geography includes Côte-des-Neiges, does not isolate NDG and excludes Montreal West; no separate statistics are combined.')
    .replace('Centris — NDG–Montreal West, T2 2026', 'Centris — Montréal (Côte-des-Neiges/Notre-Dame-de-Grâce), Q2 2026')
    .replace('One borough, several micro-markets.', 'One area, several micro-markets.')
    .replaceAll('Pierre can review a project anywhere in the borough, including NDG–Montreal West, Monkland Village, Loyola, Benny Farm, Westhaven and Montreal West.', 'Pierre can review a project in NDG, including Monkland Village, Loyola, Benny Farm and Westhaven, as well as in the City of Montreal West.');
  await writeFile(enFile, en, 'utf8');
}

console.log('Applied NDG–Montréal-Ouest geography and English-name corrections.');
