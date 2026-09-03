#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.argv.find((argument) => argument.startsWith('--base='))?.slice('--base='.length)
  ?? 'b3e4643146af928a37194259e08181196c8de2e7';
const GIT = process.env.HERO_GIT_EXECUTABLE ?? 'git';
const JSON_REPORT = 'reports/hero-integration/deployment-files.json';
const TEXT_REPORT = 'reports/hero-integration/deployment-files.txt';
const SELF_EXCLUDED = new Set([JSON_REPORT, TEXT_REPORT]);

function gitNullList(arguments_) {
  const output = execFileSync(GIT, arguments_, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  return output.split('\0').filter(Boolean).map((entry) => entry.replaceAll('\\', '/'));
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

const baseFiles = new Set(gitNullList(['ls-tree', '-r', '--name-only', '-z', BASE]));
const changed = gitNullList(['diff', '--name-only', '-z', BASE, '--']);
const untracked = gitNullList(['ls-files', '--others', '--exclude-standard', '-z']);
const paths = [...new Set([...changed, ...untracked])]
  .filter((relativePath) => !SELF_EXCLUDED.has(relativePath))
  .sort((left, right) => left.localeCompare(right, 'en'));

const files = [];
for (const relativePath of paths) {
  const absolutePath = path.join(ROOT, ...relativePath.split('/'));
  const fileStat = await stat(absolutePath);
  if (!fileStat.isFile()) continue;
  const content = await readFile(absolutePath);
  files.push({
    status: baseFiles.has(relativePath) ? 'M' : 'A',
    path: relativePath,
    bytes: fileStat.size,
    sha256: sha256(content),
  });
}

const counts = files.reduce((summary, file) => {
  summary[file.status] = (summary[file.status] ?? 0) + 1;
  const extension = path.extname(file.path).toLowerCase() || '(none)';
  summary.byExtension[extension] = (summary.byExtension[extension] ?? 0) + 1;
  summary.totalBytes += file.bytes;
  return summary;
}, { A: 0, M: 0, totalBytes: 0, byExtension: {} });

const report = {
  generatedAt: new Date().toISOString(),
  baseCommit: BASE,
  branch: execFileSync(GIT, ['branch', '--show-current'], { cwd: ROOT, encoding: 'utf8' }).trim(),
  selfExcludedReports: [...SELF_EXCLUDED],
  note: 'The two inventory reports exclude themselves to avoid circular hashes.',
  summary: {
    totalFiles: files.length,
    addedFiles: counts.A,
    modifiedFiles: counts.M,
    totalBytes: counts.totalBytes,
    byExtension: Object.fromEntries(Object.entries(counts.byExtension).sort()),
  },
  files,
};

const text = [
  '# Multi-sector hero deployment inventory',
  `# Base: ${BASE}`,
  `# Branch: ${report.branch}`,
  `# Files: ${report.summary.totalFiles} (A ${report.summary.addedFiles}, M ${report.summary.modifiedFiles})`,
  `# Bytes: ${report.summary.totalBytes}`,
  '# Inventory reports exclude themselves to avoid circular hashes.',
  '# STATUS\tBYTES\tSHA256\tPATH',
  ...files.map((file) => `${file.status}\t${file.bytes}\t${file.sha256}\t${file.path}`),
  '',
].join('\n');

await writeFile(path.join(ROOT, JSON_REPORT), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(path.join(ROOT, TEXT_REPORT), text);

console.log(JSON.stringify(report.summary, null, 2));
