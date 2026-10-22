(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let appearance = 'minimal';
  let transition;
  let changeVersion = 0;
  try {
    if (localStorage.getItem('appearance') === 'liquid') appearance = 'liquid';
  } catch { /* The control still works when browser storage is unavailable. */ }
  root.dataset.style = appearance;

  // ponytail: SVG backdrop refraction is Chromium-only until browser support is interoperable.
  if (/\b(?:Chrome|Chromium|Edg)\//.test(navigator.userAgent)
    && CSS.supports('backdrop-filter', 'url("#liquid-edge-refraction")')) {
    root.dataset.refraction = 'svg';
  }

  document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('#appearance');
    function update() {
      root.dataset.style = appearance;
      slider.value = appearance === 'liquid' ? '1' : '0';
      slider.setAttribute('aria-valuetext', appearance === 'liquid' ? '液态主题' : '极简主题');
    }
    async function changeAppearance() {
      const version = ++changeVersion;
      transition?.skipTransition();
      if (root.dataset.style === appearance || !document.startViewTransition || reducedMotion.matches) {
        update();
        return;
      }
      if (appearance === 'liquid') {
        // Prepare both scenes in case light/dark changes while these images load.
        await Promise.allSettled(['desert', 'stars'].map(scene => {
          const background = new Image();
          background.src = `/images/themes/liquid-${scene}.svg`;
          return background.decode();
        }));
      }
      if (version !== changeVersion) return;
      transition = document.startViewTransition(() => {
        if (version === changeVersion) update();
      });
      transition.ready.catch(() => {}); // A newer selection can cancel this animation.
    }
    update();
    slider.parentElement.hidden = false;
    slider.addEventListener('input', () => {
      appearance = slider.value === '1' ? 'liquid' : 'minimal';
      changeAppearance();
      try { localStorage.setItem('appearance', appearance); } catch { /* Retain this page's selection. */ }
    });
  });
})();
