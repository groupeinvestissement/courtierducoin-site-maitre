import { readFile } from 'node:fs/promises';

const base = 'https://www.courtierducoin.ca';
const codes = ['', 'o1a11', '02a22', '03i33', '04m44', '05c55'];
const oldKeys = ['verdun', 'ile-des-soeurs'];
const newKey = 'verdun-ile-des-soeurs';
const errors = [];
const read = file => readFile(file, 'utf8');
const route = (key, code, lang = 'fr') => `${base}/${lang === 'en' ? 'en/' : ''}${code ? `${key}/${code}` : `secteurs/${key}`}/`;

const sitemap = await read('sitemap.xml');
const newCanonicals = codes.flatMap(code => ['fr', 'en'].map(lang => route(newKey, code, lang)));
for (const url of newCanonicals) {
  const count = sitemap.split(`<loc>${url}</loc>`).length - 1;
  if (count !== 1) errors.push(`sitemap: ${url} doit apparaître exactement une fois`);
}
for (const oldKey of oldKeys) {
  for (const code of codes) {
    for (const lang of ['fr', 'en']) {
      const oldUrl = route(oldKey, code, lang);
      if (sitemap.includes(`<loc>${oldUrl}</loc>`)) errors.push(`sitemap: ancienne URL encore indexée ${oldUrl}`);
    }
  }
}

const redirects = JSON.parse(await read('redirect-map.json'));
const legacy = redirects.filter(item => oldKeys.some(oldKey => item.entry.includes(oldKey)));
if (legacy.length !== 36) errors.push(`redirect-map: 36 redirections attendues, ${legacy.length} trouvées`);
for (const item of legacy) {
  if (item.status !== 301 || item.preserveQuery !== true) errors.push(`redirect-map: règle invalide ${item.entry}`);
  if (!item.destination.includes(newKey)) errors.push(`redirect-map: destination non unifiée ${item.entry}`);
}

const home = await read('index.html');
const script = await read('script.js');
if ((home.match(/\shref="\/secteurs\/verdun-ile-des-soeurs\//g) || []).length !== 1) errors.push('accueil: une seule carte unifiée est requise');
if (!home.includes('data-en-href="/en/secteurs/verdun-ile-des-soeurs/"')) errors.push('accueil: lien anglais unifié absent');
if (/href="\/secteurs\/(verdun|ile-des-soeurs)\//.test(home) || /key:\s*['"]ile-des-soeurs['"]/.test(script)) errors.push('accueil: ancienne carte Verdun ou Île-des-Sœurs encore active');

const htaccess = await read('.htaccess');
for (const token of [
  '^(verdun|ile-des-soeurs)\\.courtierducoin\\.ca$',
  '^secteurs/(verdun|ile-des-soeurs)/?$',
  '^en/secteurs/(verdun|ile-des-soeurs)/?$',
  '[R=301,L,NE,QSA]'
]) if (!htaccess.includes(token)) errors.push(`.htaccess: règle absente ${token}`);

const registry = await read('api/web-form-sources.php');
const registeredKeys = [...registry.matchAll(/'(verdunids-[^']+)'\s*=>/g)].map(match => match[1]);
if (registeredKeys.length !== 12 || new Set(registeredKeys).size !== 12) errors.push('registre: 12 sources verdunids uniques requises');

const market = JSON.parse(await read('data/verdun-ile-des-soeurs-market-data.json'));
if (market.region?.key !== newKey || !market.region?.publicName?.includes('Île-des-Sœurs')) errors.push('données: identité du secteur unifié invalide');
if (!market.snapshot?.granularityNote?.includes('même profil')) errors.push('données: note de granularité combinée absente');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('PASS: fusion Verdun / L’Île-des-Sœurs — 12 routes bilingues, accueil, formulaires, sitemap et 36 redirections validés.');
