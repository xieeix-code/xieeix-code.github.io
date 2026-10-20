(() => {
  const root = document.documentElement;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let preference = null;
  let button;
  let transition;
  let requestedTheme;
  let changeVersion = 0;

  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch { /* Theme switching also works when browser storage is unavailable. */ }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#1b2028' : '#ffffff';
    if (button) {
      const label = theme === 'dark' ? '切换为亮色主题' : '切换为暗色主题';
      button.setAttribute('aria-label', label);
      button.title = label;
    }
  }

  async function changeTheme(theme) {
    requestedTheme = theme;
    const version = ++changeVersion;
    transition?.skipTransition();
    if (!button || !document.startViewTransition || reducedMotion.matches) {
      applyTheme(theme);
      return;
    }
    if (root.dataset.style === 'liquid') {
      const background = new Image();
      background.src = theme === 'dark' ? '/images/themes/liquid-stars.svg' : '/images/themes/liquid-desert.svg';
      try { await background.decode(); } catch { /* A missing image must not prevent theme switching. */ }
    }
    if (version !== changeVersion) return;
    transition = document.startViewTransition(() => {
      if (version === changeVersion) applyTheme(theme);
    });
    transition.ready.catch(() => {}); // A newer click can cancel this animation.
  }

  applyTheme(preference || (systemTheme.matches ? 'dark' : 'light'));
  systemTheme.addEventListener('change', event => {
    if (!preference) changeTheme(event.matches ? 'dark' : 'light');
  });

  document.addEventListener('DOMContentLoaded', () => {
    button = document.querySelector('.theme-toggle');
    applyTheme(root.dataset.theme);
    button.hidden = false;
    button.addEventListener('click', () => {
      preference = (preference || requestedTheme || root.dataset.theme) === 'dark' ? 'light' : 'dark';
      changeTheme(preference);
      try { localStorage.setItem('theme', preference); } catch { /* Keep the selection for this page. */ }
    });
  });
})();
