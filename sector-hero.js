(() => {
  'use strict';

  const mobileHeroQuery = window.matchMedia('(max-width: 900px), (orientation: portrait)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const selectedFormat = mobileHeroQuery.matches ? 'mobile' : 'desktop';
  const heroes = [...document.querySelectorAll('[data-sector-hero]')];

  if (heroes.length === 0) return;

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

  const bindFallbackEvents = (hero, video) => {
    if (video.dataset.sectorHeroBound === 'true') return;
    video.dataset.sectorHeroBound = 'true';
    video.addEventListener('error', () => keepPoster(hero, video));
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

    if (reducedMotionQuery.matches) {
      removeSource(video);
      hero.classList.add('is-reduced-motion');
      hero.classList.remove('is-fallback');
      return;
    }

    hero.classList.remove('is-reduced-motion');
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
      playPromise.catch(() => keepPoster(hero, video));
    }
  };

  const configureAll = () => heroes.forEach(configureHero);
  const observeQuery = (query) => {
    if (typeof query.addEventListener === 'function') query.addEventListener('change', configureAll);
    else if (typeof query.addListener === 'function') query.addListener(configureAll);
  };

  configureAll();
  observeQuery(reducedMotionQuery);
})();
