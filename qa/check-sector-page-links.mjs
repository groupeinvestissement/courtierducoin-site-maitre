#!/usr/bin/env node

import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_ORIGIN = 'https://www.courtierducoin.ca';
const map = JSON.parse(await readFile(path.join(ROOT, 'data', 'sector-hero-map.json'), 'utf8'));
const missing = [];
const fragmentErrors = [];
const checked = new Set();
const targetCache = new Map();

async function resolvePublicPath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const relative = decoded === '/'
    ? 'index.html'
    : decoded.endsWith('/')
      ? `${decoded.slice(1)}index.html`
      : decoded.slice(1);
  const candidates = [path.join(ROOT, ...relative.split('/'))];
  if (!path.extname(relative)) candidates.push(path.join(ROOT, ...`${relative}.html`.split('/')));
  for (const candidate of candidates) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }
  return null;
}

function localReference(raw, sourceRoute) {
  if (!raw || /^(?:tel:|sms:|mailto:|data:|blob:|javascript:)/i.test(raw)) return null;
  try {
    const url = new URL(raw, `${SITE_ORIGIN}${sourceRoute}`);
    if (url.origin !== SITE_ORIGIN) return null;
    return url;
  } catch {
    return null;
  }
}

function collectReferences(html) {
  const references = [];
  for (const match of html.matchAll(/<(?:a|link|script|img|source|video|track|form)\b[^>]*>/gi)) {
    const tag = match[0];
    for (const attribute of ['href', 'src', 'poster', 'action']) {
      const value = tag.match(new RegExp(`\\s${attribute}=(['"])([\\s\\S]*?)\\1`, 'i'))?.[2];
      if (value) references.push({ attribute, value });
    }
    const srcset = tag.match(/\ssrcset=(['"])([\s\S]*?)\1/i)?.[2];
    if (srcset) {
      for (const candidate of srcset.split(',')) references.push({ attribute: 'srcset', value: candidate.trim().split(/\s+/)[0] });
    }
  }
  for (const match of html.matchAll(/url\((['"]?)(\/[^)'"\s]+)\1\)/gi)) {
    references.push({ attribute: 'css-url', value: match[2] });
  }
  return references;
}

async function targetHtml(filePath) {
  if (!targetCache.has(filePath)) targetCache.set(filePath, await readFile(filePath, 'utf8'));
  return targetCache.get(filePath);
}

for (const page of map.pages) {
  const sourcePath = page.pageKey === 'main'
    ? path.join(ROOT, 'secteurs', page.sectorId, 'index.html')
    : path.join(ROOT, page.sectorId, page.pageKey, 'index.html');
  const html = await readFile(sourcePath, 'utf8');
  for (const reference of collectReferences(html)) {
    const url = localReference(reference.value, page.route);
    if (!url) continue;
    const key = `${url.pathname}|${reference.attribute}`;
    let targetPath = null;
    if (!checked.has(key)) {
      targetPath = await resolvePublicPath(url.pathname);
      checked.add(key);
      if (!targetPath) missing.push({ source: page.route, attribute: reference.attribute, value: reference.value });
    } else {
      targetPath = await resolvePublicPath(url.pathname);
    }
    if (!targetPath || !url.hash || !/\.html?$/i.test(targetPath)) continue;
    const fragment = decodeURIComponent(url.hash.slice(1));
    if (!fragment) continue;
    const destination = await targetHtml(targetPath);
    const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (!new RegExp(`\\s(?:id|name)=(['"])${escaped}\\1`, 'i').test(destination)) {
      fragmentErrors.push({ source: page.route, value: reference.value });
    }
  }
}

const uniqueMissing = [...new Map(missing.map((item) => [`${item.attribute}|${item.value}`, item])).values()];
const uniqueFragments = [...new Map(fragmentErrors.map((item) => [item.value, item])).values()];
if (uniqueMissing.length || uniqueFragments.length) {
  console.error(JSON.stringify({ status: 'FAIL', checkedLocalTargets: checked.size, missing: uniqueMissing, fragmentErrors: uniqueFragments }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ status: 'PASS', pages: map.pages.length, checkedLocalTargets: checked.size, missing: [], fragmentErrors: [] }, null, 2));
}
