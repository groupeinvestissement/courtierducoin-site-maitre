import {createHash} from 'node:crypto';
import {readFile, readdir, stat} from 'node:fs/promises';
import {dirname, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mediaOnly = process.argv.includes('--media-only');
const errors = [];

const pages = {
  o1a11: {
    file: 'rosemont-la-petite-patrie/o1a11/index.html',
    h1: 'Vous avez reçu un avis lié à votre propriété? Clarifions les dates, la valeur et vos options avant de décider.',
    cta: 'Clarifier ma situation',
  },
  '02a22': {
    file: 'rosemont-la-petite-patrie/02a22/index.html',
    h1: 'Une propriété en succession à Rosemont? Commençons par mettre le dossier immobilier en ordre.',
    cta: 'Mettre le dossier en ordre',
  },
  '03i33': {
    file: 'rosemont-la-petite-patrie/03i33/index.html',
    h1: 'Vendre un plex à Rosemont–La Petite-Patrie : comprendre sa valeur avant de décider',
    cta: 'Comprendre la valeur de mon plex',
  },
  '04m44': {
    file: 'rosemont-la-petite-patrie/04m44/index.html',
    h1: 'Vous pensez vendre votre maison à Rosemont–La Petite-Patrie? Commencez par savoir quoi préparer.',
    cta: 'Préparer la vente de ma maison',
  },
  '05c55': {
    file: 'rosemont-la-petite-patrie/05c55/index.html',
    h1: 'Vous pensez vendre votre condo à Rosemont–La Petite-Patrie? Commencez par préparer le bon dossier.',
    cta: 'Préparer la vente de mon condo',
  },
};

const manifest = [
  ['02a22/rosemont-02a22-hero-desktop-poster.jpg', 257534, '569C38781A95248CDE719042BFC1DDAEE59B0B583282D90AFFCCA4CCCFD0E515'],
  ['02a22/rosemont-02a22-hero-desktop-web.mp4', 7532630, 'D5719EB388027240D0BCFB1E7964E567EF46EC473E8C67E9410842F78458D0C6'],
  ['02a22/rosemont-02a22-hero-mobile-poster.jpg', 232154, '7BB38E31AFB48ABE08C9DF86F6B1D7050D58ADA79E7B2AC84E2D742186550A64'],
  ['02a22/rosemont-02a22-hero-mobile-web.mp4', 3574078, '6BD753475240AE9B6A65C818C6D3B49B072E42AEE68788FFBFCBFD3D17B5AE55'],
  ['03i33/rosemont-03i33-hero-desktop-poster.jpg', 371342, '27744DD5B77C8041A19E9552E369F9956450658F385A593E0C7D6BFC84BD0E5C'],
  ['03i33/rosemont-03i33-hero-desktop-web.mp4', 10481896, '8CC042C98EC3C97517E5EC3F5F6EF43DD296612485EECEBC7AE734DC6BA83473'],
  ['03i33/rosemont-03i33-hero-mobile-poster.jpg', 297206, 'B1F08CB378EA91820712195D0EF2CC9F9909E2514B2C142744B066C751E5D38B'],
  ['03i33/rosemont-03i33-hero-mobile-web.mp4', 4454165, '385E3FDDDD9A3517066A9CEDBA9F16A7779F34F813D66E59E9981C1AF2385C88'],
  ['04m44/rosemont-04m44-hero-desktop-poster.jpg', 254833, 'FD6E4F8D6C40E48302DE6AF713AC223E39480061224FEEE0E8EBA060A8502C34'],
  ['04m44/rosemont-04m44-hero-desktop-web.mp4', 6944582, 'A79C924557E6B4EB8C57DEB17D7577FE51857EC86974B1D7F22CF1846FD51822'],
  ['04m44/rosemont-04m44-hero-mobile-poster.jpg', 222682, '68C736C2964DAC1A82D8874E83A9EE8FE4D072646E3B0C471C17CD951E1C9201'],
  ['04m44/rosemont-04m44-hero-mobile-web.mp4', 2759236, 'CAEDEDABD2FEC5263EA04B4BA60B296E7688370D1C5651F46A95F8EDB2D0F349'],
  ['05c55/rosemont-05c55-hero-desktop-poster.jpg', 199062, 'CD94FBD877859280395D99DAA217BF701D34F8E7E79FC6A410A1A6996E867FA3'],
  ['05c55/rosemont-05c55-hero-desktop-web.mp4', 6353072, '59B56F19B5613A4038E92473E9F0749710B36E71F2DEE792EFCC4353363503F6'],
  ['05c55/rosemont-05c55-hero-mobile-poster.jpg', 190273, '18D37ABB99708FC41E2289FA9506D6B8FE2F77A89713D0346E451AE58ADE8D17'],
  ['05c55/rosemont-05c55-hero-mobile-web.mp4', 3034013, '4ED24F429DD656159BEB0046FF2B95D66349AFD9785E66AD5B5B04A5D3A814EA'],
  ['o1a11/rosemont-o1a11-hero-desktop-poster.jpg', 206615, 'B8D685D267FA7EA770A54AC6C67F47D2BEA4991C5AE1BE0392FA2B68D457B44A'],
  ['o1a11/rosemont-o1a11-hero-desktop-web.mp4', 6768186, '121BA22125550B625674A81BDB547FB9521D851EFC08B15FF45621C1BD8725BC'],
  ['o1a11/rosemont-o1a11-hero-mobile-poster.jpg', 192634, '50B7C0E31136F8FAD6474B69C389C7EEA58781877FC7A2CE2EB0D4C7B65B6FB7'],
  ['o1a11/rosemont-o1a11-hero-mobile-web.mp4', 3451177, '40B9995B10695DD0F4722BFB9D87FE02EAE39FAC3B7C1474F1595A478F447CA0'],
];

const mediaRoot = join(root, 'assets', 'video', 'rosemont', 'leads');

const normalizeText = (value) => value
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ')
  .trim();

const attribute = (tag, name) => tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))?.[2];
const hasBooleanAttribute = (tag, name) => new RegExp(`(?:^|\\s)${name}(?:\\s|=|>)`, 'i').test(tag);

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

async function validateMedia() {
  const expected = new Set(manifest.map(([path]) => path));
  let actualFiles = [];
  try {
    actualFiles = await walk(mediaRoot);
  } catch {
    errors.push('assets/video/rosemont/leads: dossier absent');
    return;
  }

  const actual = actualFiles.map((path) => relative(mediaRoot, path).split(sep).join('/'));
  for (const path of actual) if (!expected.has(path)) errors.push(`média inattendu: ${path}`);
  for (const path of expected) if (!actual.includes(path)) errors.push(`média absent: ${path}`);
  if (actual.length !== 20) errors.push(`inventaire: 20 médias requis, ${actual.length} trouvé(s)`);
  if (actual.some((path) => /master|\.(md|txt|json)$/i.test(path))) errors.push('inventaire: master ou document publié dans le dossier Web');

  let total = 0;
  for (const [relativePath, expectedSize, expectedHash] of manifest) {
    const path = join(mediaRoot, ...relativePath.split('/'));
    try {
      const info = await stat(path);
      total += info.size;
      if (info.size !== expectedSize) errors.push(`${relativePath}: taille ${info.size}, attendu ${expectedSize}`);
      const data = await readFile(path);
      const hash = createHash('sha256').update(data).digest('hex').toUpperCase();
      if (hash !== expectedHash) errors.push(`${relativePath}: SHA-256 ${hash}, attendu ${expectedHash}`);
      if (relativePath.endsWith('.jpg') && !(data[0] === 0xff && data[1] === 0xd8)) errors.push(`${relativePath}: signature JPEG absente`);
      if (relativePath.endsWith('.mp4') && data.subarray(4, 8).toString('ascii') !== 'ftyp') errors.push(`${relativePath}: signature MP4 ftyp absente`);
    } catch (error) {
      errors.push(`${relativePath}: illisible (${error.message})`);
    }
  }
  if (total !== 57777370) errors.push(`taille totale ${total}, attendu 57777370`);
}

function localReference(pageFile, reference) {
  const clean = reference.split(/[?#]/, 1)[0];
  if (!clean || /^(?:https?:)?\/\//i.test(clean)) return null;
  return clean.startsWith('/') ? join(root, clean.slice(1)) : resolve(root, dirname(pageFile), clean);
}

async function referencedSource(html, pageFile, element, extension) {
  const values = [...html.matchAll(new RegExp(`<${element}\\b[^>]*(?:href|src)=["']([^"']+\\.${extension}(?:[?#][^"']*)?)["'][^>]*>`, 'gi'))]
    .map((match) => match[1]);
  const parts = [html];
  for (const value of values) {
    const path = localReference(pageFile, value);
    if (!path) continue;
    try {
      parts.push(await readFile(path, 'utf8'));
    } catch {
      errors.push(`${relative(root, pageFile)}: ressource référencée absente ${value}`);
    }
  }
  return parts.join('\n');
}

async function validatePage(code, contract) {
  const pageFile = join(root, ...contract.file.split('/'));
  const html = await readFile(pageFile, 'utf8');
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  if (h1s.length !== 1) errors.push(`${contract.file}: un seul H1 requis, ${h1s.length} trouvé(s)`);
  else if (normalizeText(h1s[0][1]) !== contract.h1) errors.push(`${contract.file}: H1 non conforme`);

  const hero = html.match(/<section\b(?=[^>]*class=["'][^"']*\blead-hero\b[^"']*["'])(?=[^>]*data-lead-code=["'][^"']+["'])[^>]*>[\s\S]*?<\/section>/i)?.[0];
  if (!hero) {
    errors.push(`${contract.file}: section .lead-hero[data-lead-code] absente`);
    return;
  }
  if (attribute(hero.match(/^<section\b[^>]*>/i)?.[0] ?? '', 'data-lead-code') !== code) errors.push(`${contract.file}: data-lead-code doit être ${code}`);
  if (/<section\b[^>]*class=["'][^"']*\brm-hero\b/i.test(html)) errors.push(`${contract.file}: ancien hero .rm-hero encore présent`);

  const base = `/assets/video/rosemont/leads/${code}/rosemont-${code}-hero`;
  for (const path of [`${base}-desktop-poster.jpg`, `${base}-mobile-poster.jpg`]) {
    if (!hero.includes(path)) errors.push(`${contract.file}: poster HTML absent ${path}`);
  }
  if (!/class=["'][^"']*lead-hero__poster[^"']*["'][^>]*aria-hidden=["']true["']/i.test(hero)) errors.push(`${contract.file}: poster décoratif aria-hidden absent`);

  const video = hero.match(/<video\b[^>]*data-lead-hero-video[^>]*>/i)?.[0];
  if (!video) errors.push(`${contract.file}: vidéo data-lead-hero-video absente`);
  else {
    for (const name of ['autoplay', 'muted', 'loop', 'playsinline']) if (!hasBooleanAttribute(video, name)) errors.push(`${contract.file}: attribut vidéo ${name} absent`);
    if (attribute(video, 'preload') !== 'metadata') errors.push(`${contract.file}: preload vidéo doit être metadata`);
    if (attribute(video, 'tabindex') !== '-1') errors.push(`${contract.file}: tabindex vidéo doit être -1`);
    if (attribute(video, 'aria-hidden') !== 'true') errors.push(`${contract.file}: aria-hidden vidéo doit être true`);
    if (hasBooleanAttribute(video, 'controls')) errors.push(`${contract.file}: controls interdit sur la vidéo décorative`);
  }
  if (/<source\b/i.test(hero)) errors.push(`${contract.file}: aucune balise source statique ne doit précharger une autre vidéo`);
  if (/VideoObject/i.test(html)) errors.push(`${contract.file}: VideoObject interdit pour la boucle décorative`);
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';
  if (/\.mp4|as=["']video["']/i.test(head)) errors.push(`${contract.file}: MP4 préchargé globalement dans head`);

  const anchors = [...hero.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((match) => ({tag: match[0], text: normalizeText(match[2]), href: attribute(match[0], 'href')}));
  const primary = anchors.find((anchor) => anchor.text === contract.cta);
  if (!primary) errors.push(`${contract.file}: CTA principal « ${contract.cta} » absent`);
  else if (!primary.href?.startsWith('#') || !new RegExp(`\\bid=["']${primary.href.slice(1)}["']`, 'i').test(html)) errors.push(`${contract.file}: cible réelle du CTA principal absente (${primary.href ?? 'sans href'})`);
  const secondary = anchors.find((anchor) => anchor.text === 'Appeler Pierre · 514 216-4013');
  if (!secondary || secondary.href !== 'tel:+15142164013') errors.push(`${contract.file}: CTA téléphonique commun non conforme`);
  if (!/<a\b[^>]*href=["']\/credits-photos\.html["'][^>]*>\s*Crédits photos\s*<\/a>/i.test(html)) errors.push(`${contract.file}: lien permanent Crédits photos absent du pied de page`);

  const css = await referencedSource(html, pageFile, 'link', 'css');
  for (const token of ['.lead-hero', '.lead-hero__poster', '.lead-hero__video', '.lead-hero__shade', '.lead-hero__content', '.lead-hero__actions', '--lead-hero-desktop-poster', '--lead-hero-mobile-poster', 'prefers-reduced-motion', 'focus-visible']) {
    if (!css.includes(token)) errors.push(`${contract.file}: contrat CSS absent (${token})`);
  }
  if (!/max-width\s*:\s*900px[\s\S]{0,160}orientation\s*:\s*portrait/i.test(css)) errors.push(`${contract.file}: breakpoint mobile 900px/orientation portrait absent`);
  if (!/max-width\s*:\s*700px/i.test(css)) errors.push(`${contract.file}: breakpoint contenu 700px absent`);

  const js = await referencedSource(html, pageFile, 'script', 'js');
  for (const token of ['data-lead-hero-video', 'leadHeroAssets', `${base}`, 'loadedSrc', 'removeAttribute(\'src\')', '-web.mp4', '-poster.jpg', 'prefers-reduced-motion']) {
    if (!js.includes(token)) errors.push(`${contract.file}: contrat JavaScript absent (${token})`);
  }
  if (!/max-width:\s*900px[\s\S]{0,80}orientation:\s*portrait/i.test(js)) errors.push(`${contract.file}: sélection JS 900px/orientation portrait absente`);
}

async function validateCredits() {
  const path = join(root, 'credits-photos.html');
  let credits = '';
  try {
    credits = await readFile(path, 'utf8');
  } catch {
    errors.push('credits-photos.html: page absente');
    return;
  }
  for (const token of [
    'Ashoola', 'Jeangagnon', 'Cantons-de-l’Est', 'Ptaff', 'Cossette.phil', 'Iván Hernández Cazorla', 'Panoramio',
    'CC BY 3.0', 'CC BY-SA 3.0', 'CC BY-SA 4.0', 'CC0 1.0', 'Portrait', 'autorisation',
  ]) if (!credits.includes(token)) errors.push(`credits-photos.html: attribution absente (${token})`);
  if (!/(?:ne représentent pas|ne représente)[\s\S]{0,220}(?:dossiers?|cas)[\s\S]{0,30}(?:réels?|traité)/i.test(credits)) errors.push('credits-photos.html: avertissement propriétés/dossiers réels absent');
}

async function validateServerContract() {
  const htaccess = await readFile(join(root, '.htaccess'), 'utf8');
  for (const token of ['AddType video/mp4 .mp4', 'AddType image/jpeg .jpg .jpeg', 'Cache-Control "public, max-age=31536000, immutable"']) {
    if (!htaccess.includes(token)) errors.push(`.htaccess: règle absente (${token})`);
  }
  if (!/<FilesMatch\s+["'][^"']*mp4[^"']*jpe\?g[^"']*["']/i.test(htaccess)) errors.push('.htaccess: FilesMatch MP4/JPEG absent');
  const compressionLines = htaccess.split(/\r?\n/).filter((line) => /AddOutputFilterByType/i.test(line));
  if (!compressionLines.some((line) => /BROTLI_COMPRESS|DEFLATE/i.test(line))) errors.push('.htaccess: compression HTML/CSS/JS absente');
  if (compressionLines.some((line) => /video\/mp4|image\/jpe?g/i.test(line))) errors.push('.htaccess: MP4/JPEG ne doivent pas être recompressés');
  if (/Accept-Ranges\s+none/i.test(htaccess)) errors.push('.htaccess: requêtes par plage explicitement désactivées');
}

async function validateGeneratorSafety() {
  const generator = await readFile(join(root, 'generate-vaudreuil-strict-parity.mjs'), 'utf8');
  if (!generator.includes("c.src.startsWith('rosemont-la-petite-patrie/')")) {
    errors.push('generate-vaudreuil-strict-parity.mjs: garde des héros vidéo Rosemont absente');
  }

  for (const code of Object.keys(pages)) {
    const file = join(root, 'vaudreuil-soulanges', code, 'index.html');
    const html = await readFile(file, 'utf8');
    for (const token of ['class="lead-hero"', 'rosemont-lead-hero', '/assets/video/rosemont/leads/']) {
      if (html.includes(token)) errors.push(`vaudreuil-soulanges/${code}/index.html: fuite Rosemont (${token})`);
    }
  }
}

await validateMedia();
if (!mediaOnly) {
  for (const [code, contract] of Object.entries(pages)) await validatePage(code, contract);
  await validateCredits();
  await validateServerContract();
  await validateGeneratorSafety();
}

if (errors.length) {
  console.error(errors.map((error) => `FAIL: ${error}`).join('\n'));
  process.exit(1);
}

console.log(mediaOnly
  ? 'PASS: 20 médias Web Rosemont leads — inventaire, tailles, signatures et SHA-256 conformes.'
  : 'PASS: héros Rosemont leads — médias, 5 pages, CSS/JS, crédits et contrat serveur conformes.');
