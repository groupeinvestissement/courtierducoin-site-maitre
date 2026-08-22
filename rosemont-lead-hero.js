(() => {
  'use strict';

  const leadHeroAssets = {
    o1a11: '/assets/video/rosemont/leads/o1a11/rosemont-o1a11-hero',
    '02a22': '/assets/video/rosemont/leads/02a22/rosemont-02a22-hero',
    '03i33': '/assets/video/rosemont/leads/03i33/rosemont-03i33-hero',
    '04m44': '/assets/video/rosemont/leads/04m44/rosemont-04m44-hero',
    '05c55': '/assets/video/rosemont/leads/05c55/rosemont-05c55-hero',
  };

  const mobileHeroQuery = window.matchMedia('(max-width: 900px), (orientation: portrait)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const removeVideoSource = (video) => {
    video.pause();
    video.classList.remove('is-ready');
    video.removeAttribute('src');
    delete video.dataset.loadedSrc;
    video.load();
  };

  const configureLeadHero = (hero) => {
    const video = hero.querySelector('[data-lead-hero-video]');
    const base = leadHeroAssets[hero.dataset.leadCode];
    if (!video || !base) return;

    const format = mobileHeroQuery.matches ? 'mobile' : 'desktop';
    const poster = `${base}-${format}-poster.jpg`;

    hero.style.setProperty(`--lead-hero-${format}-poster`, `url("${poster}")`);
    video.poster = poster;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    if (reducedMotionQuery.matches) {
      removeVideoSource(video);
      return;
    }

    const source = `${base}-${format}-web.mp4`;
    if (video.dataset.loadedSrc !== source) {
      video.classList.remove('is-ready');
      video.src = source;
      video.dataset.loadedSrc = source;
      video.load();
    }

    const reveal = () => video.classList.add('is-ready');
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      reveal();
    } else {
      video.addEventListener('canplay', reveal, { once: true });
    }

    video.play().catch(() => {
      video.classList.remove('is-ready');
    });
  };

  const configureAllLeadHeroes = () => {
    document
      .querySelectorAll('.lead-hero[data-lead-code]')
      .forEach(configureLeadHero);
  };

  const observeQuery = (query) => {
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', configureAllLeadHeroes);
    } else if (typeof query.addListener === 'function') {
      query.addListener(configureAllLeadHeroes);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', configureAllLeadHeroes, { once: true });
  } else {
    configureAllLeadHeroes();
  }

  observeQuery(mobileHeroQuery);
  observeQuery(reducedMotionQuery);
})();
