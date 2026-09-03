#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtimeCode = await readFile(path.join(ROOT, 'sector-hero.js'), 'utf8');

function scenario({ mobile = false, reduced = false, missing = false } = {}) {
  const listeners = new Map();
  const queryListeners = new Map();
  const classes = new Set();
  const heroClasses = new Set();
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
    querySelector() { return video; },
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
    document: { querySelectorAll: () => [hero] },
    window: {
      matchMedia(query) {
        return {
          matches: mediaQueries[query],
          addEventListener(name, listener) { queryListeners.set(`${query}:${name}`, listener); },
        };
      },
    },
  };
  vm.runInNewContext(runtimeCode, context);
  return { video, listeners, queryListeners, classes, heroClasses };
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
assert(reduced.video.src === '', 'Le mouvement réduit déclenche une source MP4.');
assert(reduced.video.playCalls === 0, 'Le mouvement réduit tente une lecture.');
assert(reduced.heroClasses.has('is-reduced-motion'), 'Le mouvement réduit n’est pas signalé au composant.');

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
    scenarios: ['desktop', 'mobile-or-portrait', 'reduced-motion', 'missing-data', 'video-error'],
  }, null, 2));
}
