#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtimeCode = await readFile(path.join(ROOT, 'sector-hero.js'), 'utf8');

function scenario({ mobile = false, reduced = false, missing = false, storedPreference = null } = {}) {
  const listeners = new Map();
  const queryListeners = new Map();
  const controlListeners = new Map();
  const classes = new Set();
  const heroClasses = new Set();
  const storage = new Map(storedPreference ? [['courtierducoin-sector-hero-motion', storedPreference]] : []);
  let control = null;
  const video = {
    dataset: {},
    muted: false,
    defaultMuted: false,
    playsInline: false,
    src: '',
    pauseCalls: 0,
    loadCalls: 0,
    playCalls: 0,
    pause() { this.pauseCalls += 1; },
    load() { this.loadCalls += 1; },
    play() { this.playCalls += 1; return Promise.resolve(); },
    removeAttribute(name) { if (name === 'src') this.src = ''; },
    addEventListener(name, listener) { listeners.set(name, listener); },
    classList: {
      add(name) { classes.add(name); },
      remove(name) { classes.delete(name); },
    },
  };
  Object.defineProperty(video, 'src', {
    get() { return this._src ?? ''; },
    set(value) { this._src = value; },
  });
  const hero = {
    dataset: missing ? {} : { desktopVideo: '/desktop.mp4', mobileVideo: '/mobile.mp4' },
    querySelector(selector) {
      if (selector === '[data-sector-hero-video]') return video;
      if (selector === '[data-sector-hero-motion-control]') return control;
      return null;
    },
    append(node) { control = node; },
    classList: {
      add(name) { heroClasses.add(name); },
      remove(name) { heroClasses.delete(name); },
    },
  };
  const mediaQueries = {
    '(max-width: 900px), (orientation: portrait)': mobile,
    '(prefers-reduced-motion: reduce)': reduced,
  };
  const context = {
    document: {
      querySelectorAll: () => [hero],
      createElement(name) {
        if (name !== 'button') throw new Error(`Élément inattendu : ${name}`);
        const attributes = new Map();
        return {
          attributes,
          className: '',
          dataset: {},
          hidden: false,
          textContent: '',
          type: '',
          addEventListener(event, listener) { controlListeners.set(event, listener); },
          setAttribute(attribute, value) { attributes.set(attribute, String(value)); },
        };
      },
    },
    window: {
      sessionStorage: {
        getItem(key) { return storage.get(key) ?? null; },
        setItem(key, value) { storage.set(key, String(value)); },
        removeItem(key) { storage.delete(key); },
      },
      matchMedia(query) {
        return {
          matches: mediaQueries[query],
          addEventListener(name, listener) { queryListeners.set(`${query}:${name}`, listener); },
        };
      },
    },
  };
  vm.runInNewContext(runtimeCode, context);
  return { video, listeners, queryListeners, controlListeners, classes, heroClasses, storage, control };
}

const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };

const desktop = scenario();
assert(desktop.video.src === '/desktop.mp4', 'Le scénario bureau ne choisit pas uniquement la source bureau.');
assert(desktop.video.playCalls === 1, 'Le scénario bureau ne tente pas une seule lecture.');
assert(!desktop.queryListeners.has('(max-width: 900px), (orientation: portrait):change'), 'La source MP4 peut changer après redimensionnement ou rotation.');
assert(desktop.queryListeners.has('(prefers-reduced-motion: reduce):change'), 'Le changement de préférence de mouvement n’est pas observé.');
desktop.listeners.get('playing')?.();
assert(desktop.classes.has('is-ready'), 'La vidéo n’est pas révélée après playing.');

const mobile = scenario({ mobile: true });
assert(mobile.video.src === '/mobile.mp4', 'Le scénario mobile/portrait ne choisit pas uniquement la source mobile.');

const reduced = scenario({ reduced: true });
assert(reduced.video.src === '/desktop.mp4', 'Le mouvement réduit ne charge pas la source bureau par défaut.');
assert(reduced.video.playCalls === 1, 'Le mouvement réduit ne lance pas automatiquement la vidéo par défaut.');
assert(reduced.heroClasses.has('is-motion-enabled') && !reduced.heroClasses.has('is-reduced-motion'), 'Le mouvement réduit n’affiche pas la vidéo par défaut.');
assert(reduced.control !== null && reduced.control.hidden === false, 'Le mouvement réduit ne propose pas de commande vidéo visible.');
assert(reduced.control?.textContent === 'Mettre la vidéo en pause', 'La commande initiale du mouvement réduit est incorrecte.');

reduced.controlListeners.get('click')?.();
assert(reduced.video.src === '', 'La mise en pause ne retire pas la source en mouvement réduit.');
assert(reduced.heroClasses.has('is-reduced-motion') && !reduced.heroClasses.has('is-motion-enabled'), 'La mise en pause ne restaure pas le repli réduit.');
assert(reduced.control?.textContent === 'Lire la vidéo', 'La commande désactivée n’annonce pas la lecture disponible.');
assert(reduced.storage.get('courtierducoin-sector-hero-motion') === 'disabled', 'Le choix de pause n’est pas conservé pendant la session.');

reduced.controlListeners.get('click')?.();
assert(reduced.video.src === '/desktop.mp4', 'La reprise volontaire ne recharge pas la source bureau.');
assert(reduced.video.playCalls === 2, 'La reprise volontaire ne relance pas la vidéo.');
assert(reduced.heroClasses.has('is-motion-enabled') && !reduced.heroClasses.has('is-reduced-motion'), 'La reprise volontaire ne remplace pas le repli réduit.');
assert(reduced.control?.textContent === 'Mettre la vidéo en pause', 'La commande active n’annonce pas la pause disponible.');
assert(reduced.storage.get('courtierducoin-sector-hero-motion') === 'enabled', 'Le choix de reprise n’est pas conservé pendant la session.');

const reducedPaused = scenario({ reduced: true, storedPreference: 'disabled' });
assert(reducedPaused.video.src === '' && reducedPaused.video.playCalls === 0, 'Le choix de pause n’est pas réappliqué à la page suivante.');
assert(reducedPaused.heroClasses.has('is-reduced-motion'), 'Le choix de pause ne restaure pas l’affiche à la page suivante.');

const reducedStoredMobile = scenario({ mobile: true, reduced: true, storedPreference: 'enabled' });
assert(reducedStoredMobile.video.src === '/mobile.mp4', 'Le choix de session réduit ne respecte pas la variante mobile.');

const missing = scenario({ missing: true });
assert(missing.video.src === '', 'Des données absentes déclenchent une source MP4.');
assert(missing.heroClasses.has('is-fallback'), 'Des données absentes ne conservent pas explicitement le poster.');

const failing = scenario();
failing.listeners.get('error')?.();
assert(!failing.classes.has('is-ready') && failing.heroClasses.has('is-fallback'), 'Une erreur vidéo ne revient pas au poster.');

if (errors.length > 0) {
  console.error(JSON.stringify({ status: 'FAIL', errors }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({
    status: 'PASS',
    scenarios: ['desktop', 'mobile-or-portrait', 'reduced-motion-autoplay-and-pause', 'session-pause', 'session-resume-mobile', 'missing-data', 'video-error'],
  }, null, 2));
}
