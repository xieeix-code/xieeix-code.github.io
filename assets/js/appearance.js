(() => {
  const root = document.documentElement;
  let appearance = 'minimal';
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
    update();
    slider.parentElement.hidden = false;
    slider.addEventListener('input', () => {
      appearance = slider.value === '1' ? 'liquid' : 'minimal';
      update();
      try { localStorage.setItem('appearance', appearance); } catch { /* Retain this page's selection. */ }
    });
  });
})();
