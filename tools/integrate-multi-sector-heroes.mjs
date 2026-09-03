#!/usr/bin/env node

import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_COMMIT = 'b3e4643146af928a37194259e08181196c8de2e7';
const RELEASE_ID = 'heroes-2026-08-31-v01';
const RELEASE_ROOT = path.join(ROOT, 'assets', 'video', 'heroes', RELEASE_ID);
const PUBLIC_RELEASE_ROOT = `/assets/video/heroes/${RELEASE_ID}`;
const COMPONENT_VERSION = '20260902-v1';
const PAGE_KEYS = ['main', 'o1a11', '02a22', '03i33', '04m44', '05c55'];
const SAMPLE_ROUTES = new Set([
  '/secteurs/villeray-saint-michel-parc-extension/',
  '/rosemont-la-petite-patrie/o1a11/',
  '/vaudreuil-soulanges/04m44/',
  '/secteurs/laval/',
]);
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
  'meta', 'param', 'source', 'track', 'wbr',
]);

const mode = process.argv.includes('--all')
  ? 'all'
  : process.argv.includes('--sample')
    ? 'sample'
    : null;

if (!mode) {
  throw new Error('Choisissez explicitement --sample ou --all.');
}

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const publicAsset = (assetPath) => `${PUBLIC_RELEASE_ROOT}/${assetPath.replaceAll('\\', '/')}`;

const expectedRoute = (sectorId, pageKey) => pageKey === 'main'
  ? `/secteurs/${sectorId}/`
  : `/${sectorId}/${pageKey}/`;

const htmlPathFor = (sectorId, pageKey) => pageKey === 'main'
  ? path.join(ROOT, 'secteurs', sectorId, 'index.html')
  : path.join(ROOT, sectorId, pageKey, 'index.html');

async function readReleaseMap() {
  const directoryEntries = await readdir(RELEASE_ROOT, { withFileTypes: true });
  const manifests = [];

  for (const directoryEntry of directoryEntries.sort((a, b) => a.name.localeCompare(b.name, 'fr'))) {
    if (!directoryEntry.isDirectory()) continue;
    const manifestPath = path.join(RELEASE_ROOT, directoryEntry.name, 'web-manifest.json');
    try {
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      manifests.push({ manifest, manifestPath });
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }

  if (manifests.length !== 19) {
    throw new Error(`19 manifestes web attendus, ${manifests.length} trouvés.`);
  }

  const sectors = new Set();
  const routes = new Set();
  const pages = [];

  for (const { manifest, manifestPath } of manifests) {
    const sectorId = manifest.sectorId;
    if (!sectorId || sectors.has(sectorId)) {
      throw new Error(`Identifiant de secteur absent ou dupliqué dans ${manifestPath}.`);
    }
    sectors.add(sectorId);

    if (manifest.releaseId !== RELEASE_ID
      || manifest.status !== 'READY_FOR_SITE_INTEGRATION'
      || manifest.deploymentStatus !== 'NOT_DEPLOYED') {
      throw new Error(`Statut de livraison non intégrable dans ${manifestPath}.`);
    }

    const manifestKeys = Object.keys(manifest.pages ?? {});
    if (manifestKeys.length !== PAGE_KEYS.length || PAGE_KEYS.some((key) => !manifestKeys.includes(key))) {
      throw new Error(`Matrice de pages invalide dans ${manifestPath}.`);
    }

    for (const pageKey of PAGE_KEYS) {
      const page = manifest.pages[pageKey];
      const route = expectedRoute(sectorId, pageKey);
      if (!page?.applicable || page.route !== route || routes.has(route)) {
        throw new Error(`Route absente, dupliquée ou non applicable : ${route}.`);
      }
      routes.add(route);

      const assetNames = ['desktopVideo', 'mobileVideo', 'desktopPoster', 'mobilePoster'];
      for (const assetName of assetNames) {
        const relativeAsset = page[assetName];
        if (!relativeAsset || relativeAsset.includes('..') || path.isAbsolute(relativeAsset)) {
          throw new Error(`Chemin ${assetName} invalide pour ${route}.`);
        }
        const assetStat = await stat(path.join(RELEASE_ROOT, ...relativeAsset.split('/')));
        if (!assetStat.isFile() || assetStat.size === 0) {
          throw new Error(`Média ${assetName} absent ou vide pour ${route}.`);
        }
      }

      const htmlPath = htmlPathFor(sectorId, pageKey);
      const htmlStat = await stat(htmlPath);
      if (!htmlStat.isFile()) throw new Error(`Page HTML absente : ${route}.`);

      pages.push({
        sectorId,
        displayName: manifest.displayName,
        pageKey,
        route,
        htmlPath,
        desktopVideo: publicAsset(page.desktopVideo),
        mobileVideo: publicAsset(page.mobileVideo),
        desktopPoster: publicAsset(page.desktopPoster),
        mobilePoster: publicAsset(page.mobilePoster),
      });
    }
  }

  if (pages.length !== 114) throw new Error(`114 routes attendues, ${pages.length} trouvées.`);
  pages.sort((a, b) => a.sectorId.localeCompare(b.sectorId) || PAGE_KEYS.indexOf(a.pageKey) - PAGE_KEYS.indexOf(b.pageKey));
  return { manifests: manifests.map(({ manifest }) => manifest), pages };
}

function getAttribute(tag, attributeName) {
  const match = tag.match(new RegExp(`\\s${attributeName}=(['"])([\\s\\S]*?)\\1`, 'i'));
  return match?.[2] ?? null;
}

function removeAttribute(tag, attributeName) {
  return tag.replace(new RegExp(`\\s${attributeName}=(['"])[\\s\\S]*?\\1`, 'gi'), '');
}

function setAttribute(tag, attributeName, value) {
  const cleanTag = removeAttribute(tag, attributeName);
  return cleanTag.replace(/\s*>$/, ` ${attributeName}="${escapeHtml(value)}">`);
}

function addClass(tag, className) {
  const classes = (getAttribute(tag, 'class') ?? '').split(/\s+/).filter(Boolean);
  if (!classes.includes(className)) classes.push(className);
  return setAttribute(tag, 'class', classes.join(' '));
}

function cleanLegacyPosterStyle(tag) {
  const style = getAttribute(tag, 'style');
  if (style === null) return tag;
  const cleaned = style
    .replace(/--lead-hero-(?:desktop|mobile)-poster\s*:\s*url\([^;]+\)\s*;?/gi, '')
    .trim();
  return cleaned ? setAttribute(tag, 'style', cleaned) : removeAttribute(tag, 'style');
}

function findOpeningTagWithClass(html, className) {
  const tagPattern = /<([a-z][\w:-]*)\b[^>]*>/gi;
  for (const match of html.matchAll(tagPattern)) {
    const classValue = getAttribute(match[0], 'class');
    if (classValue?.split(/\s+/).includes(className)) {
      return { index: match.index, tag: match[1].toLowerCase(), openingTag: match[0] };
    }
  }
  return null;
}

function balancedElementEnd(html, startIndex, tagName) {
  const tokenPattern = new RegExp(`<\\/?${tagName}\\b[^>]*>`, 'gi');
  tokenPattern.lastIndex = startIndex;
  let depth = 0;
  let token;

  while ((token = tokenPattern.exec(html))) {
    const isClosing = /^<\//.test(token[0]);
    const isSelfClosing = /\/\s*>$/.test(token[0]) || VOID_ELEMENTS.has(tagName);
    if (isClosing) depth -= 1;
    else if (!isSelfClosing) depth += 1;
    if (depth === 0) return tokenPattern.lastIndex;
  }
  throw new Error(`Balise <${tagName}> non équilibrée dans le hero.`);
}

function removeElementsByClass(html, className) {
  let output = html;
  let found;
  while ((found = findOpeningTagWithClass(output, className))) {
    const end = balancedElementEnd(output, found.index, found.tag);
    output = output.slice(0, found.index) + output.slice(end);
  }
  return output;
}

function extractLegacyCaption(html) {
  const hero = html.match(/<section\b(?=[^>]*\bclass=(?:"[^"]*(?:rm-hero|lead-hero)[^"]*"|'[^']*(?:rm-hero|lead-hero)[^']*'))[^>]*>[\s\S]*?<\/section>/i)?.[0];
  if (!hero) return null;
  const photo = findOpeningTagWithClass(hero, 'rm-hero-photo');
  if (!photo) return null;
  const photoEnd = balancedElementEnd(hero, photo.index, photo.tag);
  const photoHtml = hero.slice(photo.index, photoEnd);
  return photoHtml.match(/<span\b[^>]*>([\s\S]*?)<\/span>/i)?.[1]?.trim() || null;
}

function appendLegacyCaption(innerHtml, captionHtml) {
  if (!captionHtml || /\bsector-hero__legacy-caption\b/i.test(innerHtml)) return innerHtml;
  const content = findOpeningTagWithClass(innerHtml, 'sector-hero__content');
  if (!content) throw new Error('Conteneur éditorial commun introuvable pour restaurer le libellé du portrait.');
  const contentEnd = balancedElementEnd(innerHtml, content.index, content.tag);
  const closingStart = innerHtml.lastIndexOf(`</${content.tag}`, contentEnd);
  if (closingStart < content.index) throw new Error('Fermeture du contenu hero introuvable.');
  const caption = `<p class="sector-hero__legacy-caption">${captionHtml}</p>`;
  return innerHtml.slice(0, closingStart) + caption + innerHtml.slice(closingStart);
}

function addContentClass(innerHtml) {
  const h1Index = innerHtml.search(/<h1\b/i);
  if (h1Index < 0) throw new Error('Hero sans H1.');

  const stack = [];
  const tagPattern = /<\/?([a-z][\w:-]*)\b[^>]*>/gi;
  let match;
  while ((match = tagPattern.exec(innerHtml)) && match.index < h1Index) {
    const tagName = match[1].toLowerCase();
    if (/^<\//.test(match[0])) {
      const stackIndex = stack.map((item) => item.tagName).lastIndexOf(tagName);
      if (stackIndex >= 0) stack.splice(stackIndex);
    } else if (!VOID_ELEMENTS.has(tagName) && !/\/\s*>$/.test(match[0])) {
      stack.push({ tagName, start: match.index, end: tagPattern.lastIndex, tag: match[0] });
    }
  }

  const container = [...stack].reverse().find((item) => item.tagName === 'div');
  if (!container) throw new Error('Conteneur éditorial du hero introuvable.');
  const updatedTag = addClass(container.tag, 'sector-hero__content');
  return innerHtml.slice(0, container.start) + updatedTag + innerHtml.slice(container.end);
}

function heroMarkup(page) {
  return [
    '<picture class="sector-hero__poster" aria-hidden="true">',
    `  <source media="(max-width: 900px), (orientation: portrait)" srcset="${page.mobilePoster}">`,
    `  <img src="${page.desktopPoster}" width="1920" height="1080" alt="" fetchpriority="high" decoding="async">`,
    '</picture>',
    '<video class="sector-hero__video" autoplay muted loop playsinline preload="metadata" tabindex="-1" aria-hidden="true" data-sector-hero-video></video>',
    '<div class="sector-hero__shade" aria-hidden="true"></div>',
  ].join('\n');
}

function transformHero(html, page, fallbackLegacyCaption = null) {
  const heroPattern = /<section\b(?=[^>]*\bclass=(?:"[^"]*(?:rm-hero|lead-hero)[^"]*"|'[^']*(?:rm-hero|lead-hero)[^']*'))[^>]*>[\s\S]*?<\/section>/i;
  const match = heroPattern.exec(html);
  if (!match) throw new Error(`Hero principal introuvable pour ${page.route}.`);

  const hero = match[0];
  const openingTag = hero.match(/^<section\b[^>]*>/i)?.[0];
  if (!openingTag) throw new Error(`Balise d'ouverture du hero invalide pour ${page.route}.`);

  let newOpeningTag = cleanLegacyPosterStyle(openingTag);
  newOpeningTag = addClass(newOpeningTag, 'sector-hero');
  newOpeningTag = setAttribute(newOpeningTag, 'data-sector-hero', RELEASE_ID);
  newOpeningTag = setAttribute(newOpeningTag, 'data-sector-id', page.sectorId);
  newOpeningTag = setAttribute(newOpeningTag, 'data-page-key', page.pageKey);
  newOpeningTag = setAttribute(newOpeningTag, 'data-desktop-video', page.desktopVideo);
  newOpeningTag = setAttribute(newOpeningTag, 'data-mobile-video', page.mobileVideo);
  newOpeningTag = setAttribute(newOpeningTag, 'data-desktop-poster', page.desktopPoster);
  newOpeningTag = setAttribute(newOpeningTag, 'data-mobile-poster', page.mobilePoster);

  let inner = hero.slice(openingTag.length, -'</section>'.length);
  const legacyCaption = extractLegacyCaption(hero) ?? fallbackLegacyCaption;
  for (const layerClass of [
    'sector-hero__poster', 'sector-hero__video', 'sector-hero__shade',
    'lead-hero__poster', 'lead-hero__video', 'lead-hero__shade',
    'rosemont-hero-poster', 'rosemont-hero-video', 'rosemont-hero-shade',
    'rm-hero-photo',
  ]) {
    inner = removeElementsByClass(inner, layerClass);
  }
  inner = addContentClass(inner);
  inner = appendLegacyCaption(inner, legacyCaption);
  inner = `\n${heroMarkup(page)}\n${inner.trimStart()}`;

  const transformedHero = `${newOpeningTag}${inner}</section>`;
  return html.slice(0, match.index) + transformedHero + html.slice(match.index + hero.length);
}

function removeLegacyImagePreloads(html) {
  return html.replace(/<link\b[^>]*>/gi, (tag) => {
    if ((getAttribute(tag, 'rel') ?? '').toLowerCase() !== 'preload') return tag;
    if ((getAttribute(tag, 'as') ?? '').toLowerCase() !== 'image') return tag;
    const href = getAttribute(tag, 'href') ?? '';
    if (href === '/assets/pierre-dalpe-portrait-transparent.png') return '';
    if (href.startsWith('/assets/video/rosemont/') && href.endsWith('-poster.jpg')) return '';
    return tag;
  });
}

function removeVideoObjects(html) {
  const cleanValue = (value) => {
    if (Array.isArray(value)) return value.map(cleanValue).filter((item) => item !== undefined);
    if (!value || typeof value !== 'object') return value;
    const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
    if (types.includes('VideoObject')) return undefined;
    return Object.fromEntries(Object.entries(value)
      .map(([key, nested]) => [key, cleanValue(nested)])
      .filter(([, nested]) => nested !== undefined));
  };

  return html.replace(/<script\b([^>]*\btype=(['"])application\/ld\+json\2[^>]*)>([\s\S]*?)<\/script>/gi,
    (full, attributes, _quote, jsonText) => {
      let data;
      try {
        data = JSON.parse(jsonText);
      } catch {
        throw new Error('Bloc JSON-LD invalide rencontré pendant le retrait de VideoObject.');
      }
      const cleaned = cleanValue(data);
      return cleaned === undefined ? '' : `<script${attributes}>${JSON.stringify(cleaned)}</script>`;
    });
}

function addComponentAssets(html) {
  html = html.replace(/<link\b[^>]*href=(['"])\/sector-hero\.css(?:\?[^'"]*)?\1[^>]*>/gi, '');
  html = html.replace(/<script\b[^>]*src=(['"])(?:\/sector-hero\.js|\/rosemont-hero-video\.js|\/rosemont-lead-hero\.js)(?:\?[^'"]*)?\1[^>]*><\/script>/gi, '');
  html = html.replace('</head>', `<link rel="stylesheet" href="/sector-hero.css?v=${COMPONENT_VERSION}"></head>`);
  html = html.replace('</body>', `<script src="/sector-hero.js?v=${COMPONENT_VERSION}" defer></script></body>`);
  return html;
}

function addCreditsLink(html) {
  const footerPattern = /<footer\b[^>]*class=(?:"[^"]*\brm-footer\b[^"]*"|'[^']*\brm-footer\b[^']*')[^>]*>[\s\S]*?<\/footer>/i;
  const match = footerPattern.exec(html);
  if (!match) throw new Error('Pied de page .rm-footer introuvable.');
  let footer = match[0].replace(/<a\b[^>]*class=(['"])[^'"]*\bsector-hero-credit-link\b[^'"]*\1[^>]*>[\s\S]*?<\/a>/gi, '');
  const link = '<a class="sector-hero-credit-link" href="/credits-heros-secteurs.html">Crédits des médias des secteurs</a>';
  const smallIndex = footer.lastIndexOf('<small');
  footer = smallIndex >= 0
    ? footer.slice(0, smallIndex) + link + footer.slice(smallIndex)
    : footer.replace('</footer>', `${link}</footer>`);
  return html.slice(0, match.index) + footer + html.slice(match.index + match[0].length);
}

function transformPage(html, page, fallbackLegacyCaption = null) {
  let output = transformHero(html, page, fallbackLegacyCaption);
  output = removeLegacyImagePreloads(output);
  output = removeVideoObjects(output);
  output = addComponentAssets(output);
  output = addCreditsLink(output);
  return output;
}

async function writeRuntimeMap(pages) {
  const data = {
    schemaVersion: '1.0.0',
    releaseId: RELEASE_ID,
    generatedBy: 'tools/integrate-multi-sector-heroes.mjs',
    pageCount: pages.length,
    pages: pages.map(({ htmlPath: _htmlPath, displayName, ...page }) => ({ displayName, ...page })),
  };
  await writeFile(path.join(ROOT, 'data', 'sector-hero-map.json'), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function parseLinkCell(text) {
  const match = /^\[([^\]]+)]\(([\s\S]+)\)$/.exec(text.trim());
  if (!match) return escapeHtml(text);
  return `<a href="${escapeHtml(match[2])}" rel="license noopener">${escapeHtml(match[1])}</a>`;
}

function parseCodeCell(text) {
  const match = /^`([^`]+)`$/.exec(text.trim());
  return match ? `<code>${escapeHtml(match[1])}</code>` : escapeHtml(text);
}

async function writeCreditsPage(manifests) {
  const markdown = await readFile(path.join(RELEASE_ROOT, 'CREDITS_PHOTOS.md'), 'utf8');
  const rows = markdown.split(/\r?\n/)
    .filter((line) => /^\|[^-]/.test(line))
    .slice(1)
    .map((line) => line.slice(1, -1).split('|').map((cell) => cell.trim()));
  if (rows.length !== 190 || rows.some((row) => row.length !== 9)) {
    throw new Error(`Table de crédits invalide : ${rows.length} lignes.`);
  }

  const sectorIds = new Map(manifests.map((manifest) => [manifest.displayName, manifest.sectorId]));
  const groups = new Map();
  for (const row of rows) {
    const [sector] = row;
    if (!groups.has(sector)) groups.set(sector, []);
    groups.get(sector).push(row);
  }
  if (groups.size !== 19 || [...groups.values()].some((group) => group.length !== 10)) {
    throw new Error('Les crédits ne couvrent pas exactement 19 secteurs × 10 rôles.');
  }

  const navigation = [...groups.keys()].map((sector) => {
    const sectorId = sectorIds.get(sector);
    if (!sectorId) throw new Error(`Crédits sans secteur manifeste correspondant : ${sector}.`);
    return `<a href="#${sectorId}">${escapeHtml(sector)}</a>`;
  }).join('');

  const sections = [...groups.entries()].map(([sector, sectorRows]) => {
    const sectorId = sectorIds.get(sector);
    const cards = sectorRows.map((row) => {
      const [, role, work, author, license, source, transformation, originalHash, deliveredHash] = row;
      return `<li><h3><span>${escapeHtml(role)}</span>${escapeHtml(work)}</h3><p><strong>Auteur :</strong> ${escapeHtml(author)}</p><p>${parseLinkCell(license)} · ${parseLinkCell(source)}</p><details><summary>Transformation et empreintes</summary><p>${escapeHtml(transformation)}</p><dl><div><dt>Original</dt><dd>${parseCodeCell(originalHash)}</dd></div><div><dt>Livré</dt><dd>${parseCodeCell(deliveredHash)}</dd></div></dl></details></li>`;
    }).join('');
    return `<section id="${sectorId}"><div class="credits-heading"><p>10 médias documentés</p><h2>${escapeHtml(sector)}</h2><a href="#top">Retour au sommaire</a></div><ol>${cards}</ol></section>`;
  }).join('');

  const page = `<!doctype html><html lang="fr-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Crédits des médias des secteurs | Courtier du Coin</title><meta name="description" content="Crédits, licences, sources et transformations des médias utilisés dans les héros des 19 secteurs de Courtier du Coin."><meta name="robots" content="index,follow"><link rel="canonical" href="https://www.courtierducoin.ca/credits-heros-secteurs.html"><link rel="stylesheet" href="/styles.css"><style>:root{color-scheme:light}.credits-page{margin:0;background:#f5f2ec;color:#111}.credits-header{padding:1rem clamp(1rem,5vw,5rem);display:flex;justify-content:space-between;gap:1rem;background:#071321;color:#fff}.credits-header a{color:inherit;font-weight:800}.credits-main{width:min(1440px,calc(100% - 2rem));margin:auto;padding:clamp(3rem,6vw,6rem) 0}.credits-main h1{max-width:1000px}.credits-intro{max-width:850px;font-size:1.1rem}.credits-nav{display:flex;flex-wrap:wrap;gap:.55rem;margin:2rem 0 4rem}.credits-nav a{padding:.7rem .85rem;border:1px solid #bbb;background:#fff;color:#111}.credits-main section{scroll-margin-top:1rem;margin:4rem 0}.credits-heading{display:flex;align-items:end;gap:1rem;border-bottom:3px solid #b40000}.credits-heading p{margin-right:auto}.credits-heading a{padding-bottom:.6rem}.credits-main ol{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;padding:0;list-style:none}.credits-main li{min-width:0;padding:1.25rem;background:#fff;border-top:4px solid #b40000;box-shadow:0 8px 22px rgba(0,0,0,.08)}.credits-main h3{margin-top:0;font-size:1.2rem}.credits-main h3 span{display:block;margin-bottom:.35rem;color:#9b0000;font:800 .72rem/1.2 sans-serif;letter-spacing:.12em;text-transform:uppercase}.credits-main details{margin-top:1rem}.credits-main summary{min-height:44px;display:flex;align-items:center;font-weight:800;cursor:pointer}.credits-main dl{display:grid;gap:.5rem}.credits-main dl div{min-width:0}.credits-main dt{font-weight:800}.credits-main dd{margin:0}.credits-main code{display:block;overflow-wrap:anywhere;font-size:.72rem}.credits-footer{padding:2rem clamp(1rem,5vw,5rem);background:#071321;color:#fff}.credits-footer a{color:inherit}@media(max-width:760px){.credits-header{display:grid}.credits-heading{display:grid;align-items:start}.credits-heading p{margin:0}.credits-main ol{grid-template-columns:1fr}}</style></head><body class="credits-page" id="top"><header class="credits-header"><a href="/">COURTIER DU COIN · Pierre Dalpé</a><a href="/#secteurs">Retour aux secteurs</a></header><main class="credits-main"><p class="rm-kicker dark">Transparence des médias</p><h1>Crédits des médias des 19 secteurs</h1><p class="credits-intro">Cette page documente les 190 médias locaux de la livraison ${RELEASE_ID}, leurs auteurs, licences, sources, transformations et empreintes de contrôle.</p><nav class="credits-nav" aria-label="Sommaire des secteurs">${navigation}</nav>${sections}</main><footer class="credits-footer"><p>© 2026 Pierre Dalpé Inc. · <a href="/confidentialite.html">Politique de confidentialité</a></p></footer></body></html>`;
  await writeFile(path.join(ROOT, 'credits-heros-secteurs.html'), `${page}\n`, 'utf8');
}

const { manifests, pages } = await readReleaseMap();
await writeRuntimeMap(pages);
await writeCreditsPage(manifests);

const selectedPages = mode === 'all' ? pages : pages.filter((page) => SAMPLE_ROUTES.has(page.route));
if (mode === 'sample' && selectedPages.length !== SAMPLE_ROUTES.size) {
  throw new Error(`Échantillon incomplet : ${selectedPages.length}/${SAMPLE_ROUTES.size}.`);
}

let changed = 0;
for (const page of selectedPages) {
  const before = await readFile(page.htmlPath, 'utf8');
  let fallbackLegacyCaption = null;
  if (/\bdata-sector-hero=/.test(before) && !/\bsector-hero__legacy-caption\b/.test(before)) {
    const baseline = execFileSync('git', ['show', `${BASE_COMMIT}:${path.relative(ROOT, page.htmlPath).replaceAll('\\', '/')}`], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 8 * 1024 * 1024,
    });
    fallbackLegacyCaption = extractLegacyCaption(baseline);
  }
  const after = transformPage(before, page, fallbackLegacyCaption);
  if (before !== after) {
    await writeFile(page.htmlPath, after, 'utf8');
    changed += 1;
  }
}

console.log(JSON.stringify({
  releaseId: RELEASE_ID,
  mode,
  manifests: manifests.length,
  mappedRoutes: pages.length,
  selectedRoutes: selectedPages.length,
  changedPages: changed,
  selected: selectedPages.map((page) => page.route),
}, null, 2));
