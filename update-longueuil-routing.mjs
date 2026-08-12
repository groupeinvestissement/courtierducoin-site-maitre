import {readFile, writeFile} from 'node:fs/promises';

const root = process.cwd();
const routes = [
  'https://www.courtierducoin.ca/secteurs/longueuil/',
  'https://www.courtierducoin.ca/longueuil/o1a11/',
  'https://www.courtierducoin.ca/longueuil/02a22/',
  'https://www.courtierducoin.ca/longueuil/03i33/',
  'https://www.courtierducoin.ca/longueuil/04m44/',
  'https://www.courtierducoin.ca/longueuil/05c55/'
];
const publicRoutes=[...routes,...routes.map((url)=>url.replace('courtierducoin.ca/','courtierducoin.ca/en/'))];
const sitemapPath=`${root}/sitemap.xml`; let sitemap=await readFile(sitemapPath,'utf8');
for(const url of publicRoutes)if(!sitemap.includes(`<loc>${url}</loc>`))sitemap=sitemap.replace('</urlset>',`  <url><loc>${url}</loc></url>\n</urlset>`);
await writeFile(sitemapPath,sitemap,'utf8');
const mapPath=`${root}/redirect-map.json`; const redirects=JSON.parse(await readFile(mapPath,'utf8'));
for(const [index,code] of ['', 'o1a11','02a22','03i33','04m44','05c55'].entries()){
  const entry=`https://longueuil.courtierducoin.ca/${code}`; const destination=`${routes[index]}?entry=longueuil-${code||'universal'}`;
  const existing=redirects.find((item)=>item.entry===entry); if(existing)Object.assign(existing,{destination,status:301,preserveQuery:true});else redirects.push({entry,destination,status:301,preserveQuery:true});
}
await writeFile(mapPath,`${JSON.stringify(redirects,null,2)}\n`,'utf8');
console.log('Updated Longueuil sitemap and redirect map.');
