(() => {
  'use strict';

  const mobileHeroQuery = window.matchMedia('(max-width: 900px), (orientation: portrait)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const selectedFormat = mobileHeroQuery.matches ? 'mobile' : 'desktop';
  const heroes = [...document.querySelectorAll('[data-sector-hero]')];
  const MOTION_OVERRIDE_KEY = 'courtierducoin-sector-hero-motion';

  if (heroes.length === 0) return;

  const readMotionOverride = () => {
    try {
      return window.sessionStorage?.getItem(MOTION_OVERRIDE_KEY) !== 'disabled';
    } catch {
      return true;
    }
  };

  let motionOverride = readMotionOverride();
  let configureAll = () => {};

  const storeMotionOverride = (enabled) => {
    motionOverride = enabled;
    try {
      if (enabled) window.sessionStorage?.setItem(MOTION_OVERRIDE_KEY, 'enabled');
      else window.sessionStorage?.setItem(MOTION_OVERRIDE_KEY, 'disabled');
    } catch {
      // Le stockage peut être bloqué; le choix reste valable pour la page courante.
    }
  };

  const removeSource = (video) => {
    video.pause();
    video.classList.remove('is-ready');
    video.removeAttribute('src');
    delete video.dataset.loadedSrc;
    video.load();
  };

  const keepPoster = (hero, video) => {
    video.classList.remove('is-ready');
    hero.classList.add('is-fallback');
  };

  const updateMotionControl = (hero) => {
    const control = hero.querySelector('[data-sector-hero-motion-control]');
    if (!control) return;
    control.hidden = !reducedMotionQuery.matches;
    control.textContent = motionOverride ? 'Mettre la vidéo en pause' : 'Lire la vidéo';
  };

  const ensureMotionControl = (hero) => {
    let control = hero.querySelector('[data-sector-hero-motion-control]');
    if (!reducedMotionQuery.matches) {
      if (control) control.hidden = true;
      return;
    }
    if (!control) {
      control = document.createElement('button');
      control.type = 'button';
      control.className = 'sector-hero__motion-control';
      control.dataset.sectorHeroMotionControl = '';
      control.addEventListener('click', () => {
        storeMotionOverride(!motionOverride);
        configureAll();
      });
      hero.append(control);
    }
    updateMotionControl(hero);
  };

  const handlePlaybackFailure = (hero, video) => {
    keepPoster(hero, video);
    if (!reducedMotionQuery.matches || !motionOverride) return;
    storeMotionOverride(false);
    hero.classList.remove('is-motion-enabled');
    hero.classList.add('is-reduced-motion');
    removeSource(video);
    updateMotionControl(hero);
  };

  const bindFallbackEvents = (hero, video) => {
    if (video.dataset.sectorHeroBound === 'true') return;
    video.dataset.sectorHeroBound = 'true';
    video.addEventListener('error', () => handlePlaybackFailure(hero, video));
    video.addEventListener('stalled', () => keepPoster(hero, video));
    video.addEventListener('playing', () => {
      hero.classList.remove('is-fallback');
      video.classList.add('is-ready');
    });
  };

  const configureHero = (hero) => {
    const video = hero.querySelector('[data-sector-hero-video]');
    if (!video) return;

    bindFallbackEvents(hero, video);
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    ensureMotionControl(hero);

    if (reducedMotionQuery.matches && !motionOverride) {
      removeSource(video);
      hero.classList.add('is-reduced-motion');
      hero.classList.remove('is-motion-enabled');
      hero.classList.remove('is-fallback');
      updateMotionControl(hero);
      return;
    }

    hero.classList.remove('is-reduced-motion');
    if (reducedMotionQuery.matches) hero.classList.add('is-motion-enabled');
    else hero.classList.remove('is-motion-enabled');
    updateMotionControl(hero);
    const source = selectedFormat === 'mobile'
      ? hero.dataset.mobileVideo
      : hero.dataset.desktopVideo;

    if (!source) {
      removeSource(video);
      keepPoster(hero, video);
      return;
    }

    if (video.dataset.loadedSrc !== source) {
      removeSource(video);
      video.src = source;
      video.dataset.loadedSrc = source;
      video.load();
    }

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => handlePlaybackFailure(hero, video));
    }
  };

  configureAll = () => heroes.forEach(configureHero);
  const observeQuery = (query) => {
    if (typeof query.addEventListener === 'function') query.addEventListener('change', configureAll);
    else if (typeof query.addListener === 'function') query.addListener(configureAll);
  };

  configureAll();
  observeQuery(reducedMotionQuery);
})();
