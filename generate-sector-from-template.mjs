import {readFile, writeFile, unlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const configPath = process.argv[2];
if (!configPath) throw new Error('Usage: node generate-sector-from-template.mjs <config.json>');

const config = JSON.parse(await readFile(resolve(configPath), 'utf8'));
let source = await readFile(resolve(config.template || 'generate-plateau-pages.mjs'), 'utf8');

for (const [from, to] of config.replacements) {
  if (!source.includes(from)) continue;
  source = source.split(from).join(to);
}

const temporaryModule = resolve(`.generated-${config.key}-pages.mjs`);
await writeFile(temporaryModule, source, 'utf8');
try {
  await import(`${pathToFileURL(temporaryModule).href}?v=${Date.now()}`);
} finally {
  await unlink(temporaryModule).catch(() => {});
}
