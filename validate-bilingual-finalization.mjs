import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const base = 'https://www.courtierducoin.ca';
const codes = ['', 'o1a11', '02a22', '03i33', '04m44', '05c55'];
const sectors = [
  ['ouest-de-lile', 'ouestile'],
  ['ahuntsic-cartierville', 'ahuntsic'],
  ['anjou-saint-leonard', 'anjou'],
  ['cdn-cote-saint-luc', 'cdn'],
  ['lachine-lasalle', 'lachinelasalle'],
  ['ile-des-soeurs', 'ids'],
  ['vaudreuil-soulanges', 'vs'],
];
const errors = [];
const fail = message => errors.push(message);
const fileFor = (key, code, lang) => code
  ? join(root, lang === 'en' ? 'en' : '', key, code, 'index.html')
  : join(root, lang === 'en' ? 'en' : '', 'secteurs', key, 'index.html');
const urlFor = (key, code, lang) => `${base}/${lang === 'en' ? 'en/' : ''}${code ? `${key}/${code}` : `secteurs/${key}`}/`;
const attribute = (html, selector) => html.match(selector)?.[1] || '';
const registry = await readFile(join(root, 'api', 'web-form-sources.php'), 'utf8');
const allTitles = new Map();
const allCanonicals = new Set();

for (const [key, prefix] of sectors) {
  const requiresSharedPattern = key !== 'vaudreuil-soulanges';
  const keysByLanguage = { fr: new Set(), en: new Set() };
  for (const lang of ['fr', 'en']) {
    for (const code of codes) {
      const file = fileFor(key, code, lang);
      let html = '';
      try { html = await readFile(file, 'utf8'); } catch { fail(`missing page: ${file}`); continue; }
      const expected = urlFor(key, code, lang);
      const reciprocal = urlFor(key, code, lang === 'en' ? 'fr' : 'en');
      const canonical = attribute(html, /<link rel="canonical" href="([^"]+)"/);
      const title = attribute(html, /<title>([^<]+)<\/title>/);
      const description = attribute(html, /<meta name="description" content="([^"]+)"/);
      const h1s = [...html.matchAll(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/g)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
      if (canonical !== expected) fail(`${expected}: canonical is ${canonical || 'missing'}`);
      if (allCanonicals.has(canonical)) fail(`${expected}: duplicate canonical`); else allCanonicals.add(canonical);
      if (!html.includes(`hreflang="${lang === 'en' ? 'en-CA' : 'fr-CA'}" href="${expected}"`)) fail(`${expected}: self hreflang missing`);
      if (!html.includes(`hreflang="${lang === 'en' ? 'fr-CA' : 'en-CA'}" href="${reciprocal}"`)) fail(`${expected}: reciprocal hreflang missing`);
      if (!html.includes('name="robots" content="index,follow')) fail(`${expected}: index directive missing`);
      if (h1s.length !== 1 || !h1s[0]) fail(`${expected}: expected one H1`);
      if (!title || !description) fail(`${expected}: title or description missing`);
      const titleKey = `${lang}:${title}`;
      if (allTitles.has(titleKey)) fail(`${expected}: duplicate title with ${allTitles.get(titleKey)}`); else allTitles.set(titleKey, expected);
      const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
      if (!jsonLd.length) fail(`${expected}: JSON-LD missing`);
      for (const block of jsonLd) {
        try {
          const parsed = JSON.parse(block[1]);
          const nodes = parsed['@graph'] || [parsed];
          const schemaTypes = new Set(nodes.map(node => node['@type']));
          if (requiresSharedPattern) {
            for (const requiredType of ['WebPage', 'BreadcrumbList', 'Person', 'Organization', 'RealEstateAgent', 'VideoObject', 'FAQPage']) {
              if (!schemaTypes.has(requiredType)) fail(`${expected}: ${requiredType} schema missing`);
            }
          }
        } catch { fail(`${expected}: invalid JSON-LD`); }
      }

      if (!html.includes(`<html lang="${lang === 'en' ? 'en-CA' : 'fr-CA'}">`)) fail(`${expected}: language declaration is incorrect`);
      if (!html.includes('class="lang-switch"') || !html.includes(`href="${reciprocal}"`)) fail(`${expected}: visible reciprocal language switch missing`);
      if (requiresSharedPattern && (!html.includes('/sector-master.css') || !html.includes('/sector-master.js'))) fail(`${expected}: shared modern pattern missing`);
      if (requiresSharedPattern && !html.includes('class="rm-page sector-page')) fail(`${expected}: modern sector page class missing`);

      const forms = [...html.matchAll(/<form\b[\s\S]*?<\/form>/g)].map(m => m[0]);
      if (forms.length !== 2) fail(`${expected}: expected two forms, found ${forms.length}`);
      for (const form of forms) {
        const sourceKey = attribute(form, /name="source_key" value="([^"]+)"/) || attribute(form, /data-source-key="([^"]+)"/);
        if (!sourceKey) fail(`${expected}: form source key missing`);
        else {
          keysByLanguage[lang].add(sourceKey);
          if (!registry.includes(`'${sourceKey}' =>`)) fail(`${expected}: ${sourceKey} absent from registry`);
        }
        if (!form.includes('name="consent_request"')) fail(`${expected}: required consent missing`);
        if (!form.includes('name="consent_marketing"')) fail(`${expected}: optional marketing consent missing`);
      }
      if (requiresSharedPattern) {
        if (!html.includes('/assets/pierre-dalpe-portrait-transparent.png')) fail(`${expected}: Pierre portrait missing`);
        const property = attribute(html, /class="property-proof-photo"[\s\S]*?<img src="([^"]+)"/);
        if (!property) fail(`${expected}: property proof image missing`);
        else {
          try { const info = await stat(join(root, property.replace(/^\//, ''))); if (info.size < 50_000) fail(`${expected}: property image too small`); }
          catch { fail(`${expected}: property image file missing: ${property}`); }
        }
      }
      for (const link of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
        let value = link[1];
        if (/^(?:https?:\/\/|tel:|mailto:|sms:|#|data:)/.test(value)) continue;
        value = value.split(/[?#]/)[0];
        if (!value || value === '/') continue;
        const candidate = value.endsWith('/') ? join(root, value.replace(/^\//, ''), 'index.html') : join(root, value.replace(/^\//, ''));
        try { await stat(candidate); } catch { fail(`${expected}: broken internal reference ${value}`); }
      }
    }
  }
  for (const lang of ['fr', 'en']) {
    const keys = keysByLanguage[lang];
    if (keys.size !== 12) fail(`${key}: expected 12 unique ${lang.toUpperCase()} form keys, found ${keys.size}`);
    for (const sourceKey of keys) if (!sourceKey.startsWith(`${prefix}-`)) fail(`${key}: unexpected ${lang.toUpperCase()} form prefix in ${sourceKey}`);
  }
}

const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
for (const [key] of sectors) for (const lang of ['fr', 'en']) for (const code of codes) {
  const url = urlFor(key, code, lang);
  if (!sitemap.includes(`<loc>${url}</loc>`)) fail(`sitemap missing ${url}`);
}
if (/ouest-de-lile-(?:nord|sud)/.test(sitemap)) fail('deprecated West Island URL remains in sitemap');

const redirects = JSON.parse(await readFile(join(root, 'redirect-map.json'), 'utf8'));
const westRedirects = redirects.filter(r => /ouest-(?:de-lile|ile)/.test(`${r.entry}${r.destination}`));
if (westRedirects.length !== 42) fail(`expected 42 West Island redirects, found ${westRedirects.length}`);
if (westRedirects.some(r => r.status !== 301 || r.preserveQuery !== true)) fail('West Island redirects must be 301 and preserve queries');
for (const r of westRedirects) if (/destination/.test('destination') && /ouest-de-lile-(?:nord|sud)/.test(r.destination)) fail(`deprecated redirect destination: ${r.destination}`);

const home = await readFile(join(root, 'index.html'), 'utf8');
if (!home.includes('data-fr-href="/secteurs/ouest-de-lile/" data-en-href="/en/secteurs/ouest-de-lile/"')) fail('home unified West Island card missing');
if (/href="\/secteurs\/ouest-de-lile-(?:nord|sud)\//.test(home)) fail('deprecated West Island card remains on home');

if (errors.length) {
  console.error(`FAIL: ${errors.length} issue(s)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('PASS: 7 bilingual sectors, 84 pages, 168 form placements, shared modern pattern where required, SEO, assets, links, sitemap and 42 West Island redirects validated.');
