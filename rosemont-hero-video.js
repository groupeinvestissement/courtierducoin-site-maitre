(() => {
  const backgroundVideo = document.querySelector('[data-background-video]');
  if (!backgroundVideo) return;

  const mobileHeroQuery = window.matchMedia('(max-width: 700px)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const configureHeroVideo = () => {
    backgroundVideo.muted = true;
    backgroundVideo.playsInline = true;
    backgroundVideo.poster = mobileHeroQuery.matches
      ? backgroundVideo.dataset.mobilePoster
      : backgroundVideo.dataset.desktopPoster;

    if (reducedMotionQuery.matches) {
      backgroundVideo.pause();
      backgroundVideo.classList.remove('is-ready');
      return;
    }

    const selectedSource = mobileHeroQuery.matches
      ? backgroundVideo.dataset.mobileSrc
      : backgroundVideo.dataset.desktopSrc;

    if (backgroundVideo.dataset.loadedSrc !== selectedSource) {
      backgroundVideo.classList.remove('is-ready');
      backgroundVideo.src = selectedSource;
      backgroundVideo.dataset.loadedSrc = selectedSource;
      backgroundVideo.load();
    }

    const revealVideo = () => backgroundVideo.classList.add('is-ready');
    if (backgroundVideo.readyState >= 3) revealVideo();
    else backgroundVideo.addEventListener('canplay', revealVideo, { once: true });

    backgroundVideo.play().catch(() => {});
  };

  configureHeroVideo();

  const watchQuery = (query) => {
    if (query.addEventListener) query.addEventListener('change', configureHeroVideo);
    else query.addListener(configureHeroVideo);
  };

  watchQuery(mobileHeroQuery);
  watchQuery(reducedMotionQuery);
})();
