import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const pages = {
  'secteurs/vaudreuil-soulanges/index.html': 'vs-universal',
  'vaudreuil-soulanges/o1a11/index.html': 'vs-o1a11',
  'vaudreuil-soulanges/02a22/index.html': 'vs-02a22',
  'vaudreuil-soulanges/03i33/index.html': 'vs-03i33',
  'vaudreuil-soulanges/04m44/index.html': 'vs-04m44',
  'vaudreuil-soulanges/05c55/index.html': 'vs-05c55',
};

for (const [relativePath, pageClass] of Object.entries(pages)) {
  const path = join(root, relativePath);
  let html = await readFile(path, 'utf8');
  html = html.replace('<link rel="stylesheet" href="/campaign.css">', '<link rel="stylesheet" href="/campaign.css"><link rel="stylesheet" href="/vaudreuil-photos-v1.css">');
  html = html.replace('<body>', `<body class="vs-page ${pageClass}">`);
  await writeFile(path, html, 'utf8');
}

console.log(`Applied Vaudreuil photography to ${Object.keys(pages).length} pages.`);
