#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_URL = (process.env.SECTOR_HERO_BASE_URL ?? 'http://127.0.0.1:4173').replace(/\/$/, '');
const PLAYWRIGHT_MODULE = process.env.PLAYWRIGHT_MODULE;
const CHROME_EXECUTABLE = process.env.CHROME_EXECUTABLE;
const ALL_ROUTES = process.argv.includes('--all');
const MODE_ARGUMENT = process.argv.find((argument) => argument.startsWith('--mode='))?.split('=')[1] ?? 'both';
const MODES = MODE_ARGUMENT === 'both' ? ['desktop', 'mobile'] : [MODE_ARGUMENT];

if (!PLAYWRIGHT_MODULE) throw new Error('PLAYWRIGHT_MODULE est requis.');
if (!['desktop', 'mobile', 'both'].includes(MODE_ARGUMENT)) throw new Error('Utilisez --mode=desktop, --mode=mobile ou --mode=both.');

const { chromium } = await import(pathToFileURL(PLAYWRIGHT_MODULE).href);
const map = JSON.parse(await readFile(path.join(ROOT, 'data', 'sector-hero-map.json'), 'utf8'));
const sampleRoutes = new Set([
  '/secteurs/rosemont-la-petite-patrie/',
  '/rosemont-la-petite-patrie/o1a11/',
  '/rosemont-la-petite-patrie/02a22/',
  '/rosemont-la-petite-patrie/03i33/',
  '/rosemont-la-petite-patrie/04m44/',
  '/rosemont-la-petite-patrie/05c55/',
]);
const routes = ALL_ROUTES ? map.pages : map.pages.filter((page) => sampleRoutes.has(page.route));
const errors = [];
const results = [];

async function inspectRoute(page, route, mode) {
  const response = await page.goto(`${BASE_URL}${route.route}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  if (!response || !response.ok()) throw new Error(`HTTP ${response?.status() ?? 'sans réponse'}`);

  await page.waitForFunction(() => {
    const video = document.querySelector('[data-sector-hero-video]');
    return video && !video.paused && video.currentTime > 0.05;
  }, null, { timeout: 15_000 });
  await page.waitForTimeout(350);

  const state = await page.evaluate(() => {
    const heroVideo = document.querySelector('[data-sector-hero-video]');
    const motionControl = document.querySelector('[data-sector-hero-motion-control]');
    const secondaryVideos = [...document.querySelectorAll('video:not([data-sector-hero-video])')];
    return {
      hero: {
        autoplay: heroVideo.autoplay,
        muted: heroVideo.muted,
        defaultMuted: heroVideo.defaultMuted,
        loop: heroVideo.loop,
        playsInline: heroVideo.playsInline,
        paused: heroVideo.paused,
        currentTime: heroVideo.currentTime,
        currentSrc: heroVideo.currentSrc,
      },
      motionControl: motionControl ? {
        hidden: motionControl.hidden,
        text: motionControl.textContent,
      } : null,
      secondaryVideos: secondaryVideos.map((video) => ({
        autoplay: video.autoplay,
        paused: video.paused,
        currentTime: video.currentTime,
      })),
    };
  });

  const expectedSource = mode === 'mobile' ? route.mobileVideo : route.desktopVideo;
  if (!state.hero.currentSrc.includes(expectedSource)) throw new Error(`mauvaise source (${state.hero.currentSrc})`);
  for (const property of ['autoplay', 'muted', 'defaultMuted', 'loop', 'playsInline']) {
    if (!state.hero[property]) throw new Error(`propriété hero ${property} désactivée`);
  }
  if (state.hero.paused || state.hero.currentTime <= 0.05) throw new Error('hero non démarré');
  if (mode === 'desktop') {
    if (!state.motionControl || state.motionControl.hidden || state.motionControl.text !== 'Mettre la vidéo en pause') {
      throw new Error('commande de pause du mouvement réduit invalide');
    }
  }
  if (state.secondaryVideos.some((video) => video.autoplay || !video.paused || video.currentTime > 0.05)) {
    throw new Error('une vidéo secondaire démarre automatiquement');
  }

  return { route: route.route, mode, secondaryVideos: state.secondaryVideos.length, currentTime: state.hero.currentTime };
}

async function runMode(browser, mode) {
  const mobile = mode === 'mobile';
  const context = await browser.newContext({
    reducedMotion: mobile ? 'no-preference' : 'reduce',
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    isMobile: mobile,
    hasTouch: mobile,
  });
  const queue = [...routes];
  const workerCount = Math.min(4, queue.length);
  await Promise.all(Array.from({ length: workerCount }, async () => {
    const page = await context.newPage();
    page.setDefaultTimeout(15_000);
    while (queue.length > 0) {
      const route = queue.shift();
      try {
        results.push(await inspectRoute(page, route, mode));
      } catch (error) {
        errors.push(`${mode} ${route.route} — ${error.message}`);
      }
    }
    await page.close();
  }));
  await context.close();
}

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME_EXECUTABLE || undefined,
});
try {
  for (const mode of MODES) await runMode(browser, mode);
} finally {
  await browser.close();
}

const secondaryChecks = results.reduce((total, result) => total + result.secondaryVideos, 0);
if (errors.length > 0) {
  console.error(JSON.stringify({ status: 'FAIL', baseUrl: BASE_URL, routes: routes.length, modes: MODES, passed: results.length, secondaryChecks, errors }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ status: 'PASS', baseUrl: BASE_URL, routes: routes.length, modes: MODES, checks: results.length, secondaryChecks, errors: [] }, null, 2));
}
