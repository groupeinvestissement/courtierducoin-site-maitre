import {readFile, writeFile} from 'node:fs/promises';

const root = process.cwd();
const routes = [
  'https://www.courtierducoin.ca/secteurs/le-sud-ouest/',
  'https://www.courtierducoin.ca/le-sud-ouest/o1a11/',
  'https://www.courtierducoin.ca/le-sud-ouest/02a22/',
  'https://www.courtierducoin.ca/le-sud-ouest/03i33/',
  'https://www.courtierducoin.ca/le-sud-ouest/04m44/',
  'https://www.courtierducoin.ca/le-sud-ouest/05c55/'
];
const english = routes.map((url) => url.replace('courtierducoin.ca/', 'courtierducoin.ca/en/'));

const sitemapPath = `${root}/sitemap.xml`;
let sitemap = await readFile(sitemapPath, 'utf8');
for (const url of english) {
  if (!sitemap.includes(`<loc>${url}</loc>`)) sitemap = sitemap.replace('</urlset>', `  <url><loc>${url}</loc></url>\n</urlset>`);
}
await writeFile(sitemapPath, sitemap, 'utf8');

const mapPath = `${root}/redirect-map.json`;
const redirects = JSON.parse(await readFile(mapPath, 'utf8'));
const hostRoutes = ['', 'o1a11', '02a22', '03i33', '04m44', '05c55'];
for (const [index, code] of hostRoutes.entries()) {
  const entry = `https://sud-ouest.courtierducoin.ca/${code}`;
  const destination = `${routes[index]}?entry=sudouest-${code || 'universal'}`;
  const existing = redirects.find((item) => item.entry === entry);
  if (existing) Object.assign(existing, {destination,status:301,preserveQuery:true});
  else redirects.push({entry,destination,status:301,preserveQuery:true});
}
await writeFile(mapPath, `${JSON.stringify(redirects,null,2)}\n`, 'utf8');
console.log('Updated Le Sud-Ouest sitemap and redirect map.');
