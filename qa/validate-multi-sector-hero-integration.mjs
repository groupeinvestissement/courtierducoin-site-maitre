#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_COMMIT = 'b3e4643146af928a37194259e08181196c8de2e7';
const RELEASE_ID = 'heroes-2026-08-31-v01';
const RELEASE_ROOT = path.join(ROOT, 'assets', 'video', 'heroes', RELEASE_ID);
const SAMPLE_ROUTES = new Set([
  '/secteurs/villeray-saint-michel-parc-extension/',
  '/rosemont-la-petite-patrie/o1a11/',
  '/vaudreuil-soulanges/04m44/',
  '/secteurs/laval/',
]);
const EXTRA_GROUPS = [
  'centre-outremont-westmount-vmr',
  'centre-ville-de-laval',
  'ile-des-soeurs',
  'ouest-de-lile-nord',
  'ouest-de-lile-sud',
  'verdun',
];

const mode = process.argv.includes('--all')
  ? 'all'
  : process.argv.includes('--sample')
    ? 'sample'
    : null;
if (!mode) throw new Error('Choisissez explicitement --sample ou --all.');

const errors = [];
const passes = [];
const fail = (message) => errors.push(message);
const pass = (message) => passes.push(message);
const occurrences = (text, pattern) => [...text.matchAll(pattern)].length;
const normalizeTag = (tag) => tag.replace(/\s+/g, ' ').trim();
const htmlPathFor = ({ sectorId, pageKey }) => pageKey === 'main'
  ? path.join(ROOT, 'secteurs', sectorId, 'index.html')
  : path.join(ROOT, sectorId, pageKey, 'index.html');

function getAttribute(tag, name) {
  return tag.match(new RegExp(`\\s${name}=(['"])([\\s\\S]*?)\\1`, 'i'))?.[2] ?? null;
}

function relativeFromRoot(absolutePath) {
  return path.relative(ROOT, absolutePath).replaceAll('\\', '/');
}

function baseHtml(absolutePath) {
  return execFileSync('git', ['show', `${BASE_COMMIT}:${relativeFromRoot(absolutePath)}`], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
  });
}

function values(text, pattern, group = 1) {
  return [...text.matchAll(pattern)].map((match) => match[group]);
}

function sameSequence(label, route, before, after) {
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    fail(`${route} — ${label} modifié.`);
  }
}

function extractMeta(html, name) {
  const tags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0]);
  const tag = tags.find((candidate) => getAttribute(candidate, 'name') === name);
  return tag ? getAttribute(tag, 'content') : null;
}

function extractCanonical(html) {
  const tags = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]);
  return getAttribute(tags.find((tag) => getAttribute(tag, 'rel') === 'canonical') ?? '', 'href');
}

function preserveBusinessPage(base, current, route) {
  const title = (html) => html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? null;
  const h1 = (html) => html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? null;
  if (title(base) !== title(current)) fail(`${route} — titre SEO modifié.`);
  if (extractMeta(base, 'description') !== extractMeta(current, 'description')) fail(`${route} — méta-description modifiée.`);
  if (extractCanonical(base) !== extractCanonical(current)) fail(`${route} — canonique modifiée.`);
  if (h1(base) !== h1(current)) fail(`${route} — H1 modifié.`);

  const heroText = (html) => {
    const hero = html.match(/<section\b(?=[^>]*\bclass=(?:"[^"]*(?:rm-hero|lead-hero)[^"]*"|'[^']*(?:rm-hero|lead-hero)[^']*'))[^>]*>[\s\S]*?<\/section>/i)?.[0] ?? '';
    return hero.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  };
  if (heroText(base) !== heroText(current)) fail(`${route} — texte visible du hero modifié ou perdu.`);

  const anchorValues = (html) => values(html, /<a\b[^>]*\shref=(['"])([\s\S]*?)\1[^>]*>/gi, 2)
    .filter((href) => href !== '/credits-heros-secteurs.html');
  sameSequence('liens et CTA', route, anchorValues(base), anchorValues(current));

  const trackedEvents = (html) => values(html, /\sdata-(?:event|conversion|source-key)=(['"])([\s\S]*?)\1/gi, 2);
  sameSequence('attributs analytics/CRM', route, trackedEvents(base), trackedEvents(current));

  const formControls = (html) => values(html, /<(?:form|input|select|textarea|button)\b[^>]*>/gi, 0).map(normalizeTag);
  sameSequence('formulaires et champs', route, formControls(base), formControls(current));

  const directContacts = (html) => values(html, /\shref=(['"])((?:tel:|sms:|mailto:)[^'"]+)\1/gi, 2);
  sameSequence('coordonnées directes', route, directContacts(base), directContacts(current));
}

async function expectedPagesFromManifests() {
  const pageKeys = ['main', 'o1a11', '02a22', '03i33', '04m44', '05c55'];
  const directories = (await readdir(RELEASE_ROOT, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  const pages = [];
  let manifestCount = 0;
  for (const directory of directories) {
    let manifest;
    try {
      manifest = JSON.parse(await readFile(path.join(RELEASE_ROOT, directory.name, 'web-manifest.json'), 'utf8'));
    } catch (error) {
      if (error?.code === 'ENOENT') continue;
      throw error;
    }
    manifestCount += 1;
    for (const pageKey of pageKeys) {
      const source = manifest.pages?.[pageKey];
      if (!source) continue;
      const asset = (value) => `/assets/video/heroes/${RELEASE_ID}/${value}`;
      pages.push({
        displayName: manifest.displayName,
        sectorId: manifest.sectorId,
        pageKey,
        route: source.route,
        desktopVideo: asset(source.desktopVideo),
        mobileVideo: asset(source.mobileVideo),
        desktopPoster: asset(source.desktopPoster),
        mobilePoster: asset(source.mobilePoster),
      });
    }
  }
  pages.sort((a, b) => a.sectorId.localeCompare(b.sectorId) || pageKeys.indexOf(a.pageKey) - pageKeys.indexOf(b.pageKey));
  return { manifestCount, pages };
}

async function physicalReleaseInventory(directory) {
  let files = 0;
  let bytes = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const nested = await physicalReleaseInventory(target);
      files += nested.files;
      bytes += nested.bytes;
    } else if (entry.isFile()) {
      const fileStat = await stat(target);
      files += 1;
      bytes += fileStat.size;
    }
  }
  return { files, bytes };
}

function validatePageMarkup(html, page) {
  const route = page.route;
  if (occurrences(html, /<h1\b/gi) !== 1) fail(`${route} — le nombre de H1 n'est pas 1.`);
  if (occurrences(html, /\bdata-sector-hero=/gi) !== 1) fail(`${route} — composant hero absent ou dupliqué.`);
  if (occurrences(html, /class=(['"])[^'"]*\bsector-hero__poster\b[^'"]*\1/gi) !== 1) fail(`${route} — picture poster absent ou dupliqué.`);
  if (occurrences(html, /\bdata-sector-hero-video\b/gi) !== 1) fail(`${route} — vidéo décorative absente ou dupliquée.`);
  if (occurrences(html, /\/sector-hero\.css\?v=20260902-v1/gi) !== 1) fail(`${route} — CSS commun absent ou dupliqué.`);
  if (occurrences(html, /\/sector-hero\.js\?v=20260902-v1/gi) !== 1) fail(`${route} — JS commun absent ou dupliqué.`);
  if (occurrences(html, /credits-heros-secteurs\.html/gi) !== 1) fail(`${route} — lien de crédits absent ou dupliqué.`);
  if (/VideoObject/i.test(html)) fail(`${route} — VideoObject décoratif interdit encore présent.`);
  if (/rosemont-(?:lead-hero|hero-video)\.js/i.test(html)) fail(`${route} — ancien chargeur vidéo Rosemont encore actif.`);

  const heroTag = html.match(/<section\b[^>]*\bdata-sector-hero=(['"])[\s\S]*?\1[^>]*>/i)?.[0];
  if (!heroTag) return;
  const expectedAttributes = {
    'data-sector-hero': RELEASE_ID,
    'data-sector-id': page.sectorId,
    'data-page-key': page.pageKey,
    'data-desktop-video': page.desktopVideo,
    'data-mobile-video': page.mobileVideo,
    'data-desktop-poster': page.desktopPoster,
    'data-mobile-poster': page.mobilePoster,
  };
  for (const [name, expected] of Object.entries(expectedAttributes)) {
    if (getAttribute(heroTag, name) !== expected) fail(`${route} — ${name} ne correspond pas au manifeste.`);
  }

  const picture = html.match(/<picture\b[^>]*\bsector-hero__poster\b[^>]*>[\s\S]*?<\/picture>/i)?.[0] ?? '';
  const sourceTag = picture.match(/<source\b[^>]*>/i)?.[0] ?? '';
  const imageTag = picture.match(/<img\b[^>]*>/i)?.[0] ?? '';
  if (getAttribute(sourceTag, 'media') !== '(max-width: 900px), (orientation: portrait)') fail(`${route} — media query du poster mobile invalide.`);
  if (getAttribute(sourceTag, 'srcset') !== page.mobilePoster) fail(`${route} — poster mobile incorrect.`);
  if (getAttribute(imageTag, 'src') !== page.desktopPoster) fail(`${route} — poster bureau incorrect.`);
  if (getAttribute(imageTag, 'width') !== '1920' || getAttribute(imageTag, 'height') !== '1080') fail(`${route} — dimensions intrinsèques du poster absentes.`);
  if (getAttribute(imageTag, 'alt') !== '' || getAttribute(imageTag, 'fetchpriority') !== 'high' || getAttribute(imageTag, 'decoding') !== 'async') fail(`${route} — attributs LCP/décoratifs du poster invalides.`);

  const videoTag = html.match(/<video\b[^>]*\bdata-sector-hero-video\b[^>]*>/i)?.[0] ?? '';
  for (const attribute of ['autoplay', 'muted', 'loop', 'playsinline']) {
    if (!new RegExp(`\\s${attribute}(?:\\s|>|=)`, 'i').test(videoTag)) fail(`${route} — attribut vidéo ${attribute} absent.`);
  }
  if (getAttribute(videoTag, 'preload') !== 'metadata') fail(`${route} — preload vidéo n'est pas metadata.`);
  if (getAttribute(videoTag, 'tabindex') !== '-1' || getAttribute(videoTag, 'aria-hidden') !== 'true') fail(`${route} — vidéo décorative exposée à l'accessibilité.`);
  if (/\ssrc\s*=/i.test(videoTag) || /\sposter\s*=/i.test(videoTag) || /\scontrols(?:\s|>|=)/i.test(videoTag)) fail(`${route} — la vidéo initiale a src/poster/controls.`);
  if (/<source\b/i.test((html.match(/<video\b[^>]*\bdata-sector-hero-video\b[^>]*>[\s\S]*?<\/video>/i)?.[0] ?? ''))) fail(`${route} — source vidéo injectée dans le HTML initial.`);
  if (/\brm-hero-photo\b/i.test((html.match(/<section\b[^>]*\bdata-sector-hero=[\s\S]*?<\/section>/i)?.[0] ?? ''))) fail(`${route} — ancien visuel de hero encore présent.`);

  if (['o1a11', '02a22'].includes(page.pageKey)) {
    const hero = html.match(/<section\b[^>]*\bdata-sector-hero=[\s\S]*?<\/section>/i)?.[0] ?? '';
    if (/\b\d{3,5}\s+(?:rue|avenue|boulevard|chemin)\b/i.test(hero)) fail(`${route} — adresse civique détectée sur une page sensible.`);
  }
}

const mapPath = path.join(ROOT, 'data', 'sector-hero-map.json');
const map = JSON.parse(await readFile(mapPath, 'utf8'));
const expectedMap = await expectedPagesFromManifests();
if (expectedMap.manifestCount !== 19 || expectedMap.pages.length !== 114) {
  fail(`Manifestes web sources invalides : ${expectedMap.manifestCount} manifestes, ${expectedMap.pages.length} routes.`);
} else if (JSON.stringify(map.pages) !== JSON.stringify(expectedMap.pages)) {
  fail('La table build-time diverge des 19 manifestes web sources.');
} else if (map.releaseId !== RELEASE_ID || map.pageCount !== 114 || map.pages?.length !== 114) {
  fail('La table build-time ne contient pas exactement les 114 routes de la release.');
} else {
  pass('Table build-time recalculée depuis 19 manifestes : 114 routes exactes.');
}
if (new Set(map.pages.map((page) => page.route)).size !== 114) fail('La table build-time contient des routes dupliquées.');

const targetRoutes = mode === 'all' ? new Set(map.pages.map((page) => page.route)) : SAMPLE_ROUTES;
let integratedCount = 0;
for (const page of map.pages) {
  const htmlPath = htmlPathFor(page);
  const current = await readFile(htmlPath, 'utf8');
  const integrated = /\bdata-sector-hero=/.test(current);
  const shouldBeIntegrated = targetRoutes.has(page.route);
  if (integrated !== shouldBeIntegrated) {
    fail(`${page.route} — état d'intégration inattendu pour le mode ${mode}.`);
    continue;
  }
  if (!integrated) continue;
  integratedCount += 1;
  validatePageMarkup(current, page);
  preserveBusinessPage(baseHtml(htmlPath), current, page.route);
}
if (integratedCount === targetRoutes.size) pass(`Pages intégrées : ${integratedCount}/${targetRoutes.size}.`);

for (const extraGroup of EXTRA_GROUPS) {
  const candidatePaths = [
    path.join(ROOT, 'secteurs', extraGroup, 'index.html'),
    ...['o1a11', '02a22', '03i33', '04m44', '05c55'].map((key) => path.join(ROOT, extraGroup, key, 'index.html')),
  ];
  for (const candidate of candidatePaths) {
    try {
      const content = await readFile(candidate, 'utf8');
      if (/\bdata-sector-hero=/.test(content)) fail(`${relativeFromRoot(candidate)} — alias historique modifié malgré NEW_SECTOR_REQUIRED.`);
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }
}
pass('Alias historiques : aucun média attribué.');

const credits = await readFile(path.join(ROOT, 'credits-heros-secteurs.html'), 'utf8');
if (occurrences(credits, /<section id="[^\"]+">/g) !== 19 || occurrences(credits, /<li><h3>/g) !== 190) {
  fail('La page de crédits ne contient pas 19 secteurs et 190 médias.');
} else {
  pass('Crédits : 19 secteurs et 190 médias documentés.');
}
if (!/href="\/#secteurs"/.test(credits) || /href="\/secteurs\/"/.test(credits)) {
  fail('Le retour de la page de crédits ne cible pas /#secteurs.');
}

const manifestBytes = await readFile(path.join(RELEASE_ROOT, 'MANIFEST.json'));
const manifestHash = createHash('sha256').update(manifestBytes).digest('hex');
if (manifestHash !== '130525f7da1278e8bdd54037e98e63e1118bb9d97341e07f6cea57573e0b2df9') {
  fail(`Empreinte du manifeste copiée incorrecte : ${manifestHash}.`);
} else {
  pass('Empreinte du manifeste copiée conforme.');
}

const releaseManifest = JSON.parse(manifestBytes.toString('utf8'));
let payloadErrors = 0;
let payloadBytes = 0;
for (const file of releaseManifest.files ?? []) {
  const fileBytes = await readFile(path.join(RELEASE_ROOT, ...file.path.split('/')));
  payloadBytes += fileBytes.length;
  if (fileBytes.length !== file.bytes || createHash('sha256').update(fileBytes).digest('hex') !== file.sha256) {
    payloadErrors += 1;
  }
}
if (releaseManifest.files?.length !== 480 || payloadErrors !== 0 || payloadBytes !== 544297674) {
  fail(`Charge utile copiée invalide : ${releaseManifest.files?.length ?? 0} fichiers, ${payloadErrors} erreurs, ${payloadBytes} octets.`);
} else {
  pass('Charge utile copiée : 480/480 tailles et SHA-256 conformes.');
}

const physicalInventory = await physicalReleaseInventory(RELEASE_ROOT);
if (physicalInventory.files !== 482 || physicalInventory.bytes !== 544696118) {
  fail(`Inventaire physique copié invalide : ${physicalInventory.files} fichiers, ${physicalInventory.bytes} octets.`);
} else {
  pass('Inventaire physique copié : 482 fichiers, 544 696 118 octets.');
}

for (const asset of ['sector-hero.css', 'sector-hero.js']) {
  const assetStat = await stat(path.join(ROOT, asset));
  if (!assetStat.isFile() || assetStat.size === 0) fail(`${asset} absent ou vide.`);
}

const componentCss = await readFile(path.join(ROOT, 'sector-hero.css'), 'utf8');
const layerRule = componentCss.match(/\.sector-hero\s*>\s*\.sector-hero__poster[\s\S]*?\}/)?.[0] ?? '';
for (const declaration of ['position: absolute !important', 'width: 100% !important', 'height: 100% !important', 'max-width: none !important']) {
  if (!layerRule.includes(declaration)) fail(`La règle des couches communes ne garantit pas « ${declaration} ».`);
}
const heroRule = componentCss.match(/\.sector-hero\s*\{[\s\S]*?\}/)?.[0] ?? '';
for (const declaration of ['min-height: 720px !important', 'height: auto !important']) {
  if (!heroRule.includes(declaration)) fail(`La règle du hero commun ne garantit pas « ${declaration} ».`);
}

if (errors.length > 0) {
  console.error(JSON.stringify({ status: 'FAIL', mode, passes, errors }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ status: 'PASS', mode, passes, errors: [] }, null, 2));
}
