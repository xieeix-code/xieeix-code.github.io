(() => {
  const root = document.documentElement;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  let button;

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

  applyTheme(preference || (systemTheme.matches ? 'dark' : 'light'));
  systemTheme.addEventListener('change', event => {
    if (!preference) applyTheme(event.matches ? 'dark' : 'light');
  });

  document.addEventListener('DOMContentLoaded', () => {
    button = document.querySelector('.theme-toggle');
    applyTheme(root.dataset.theme);
    button.hidden = false;
    button.addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(preference);
      try { localStorage.setItem('theme', preference); } catch { /* Keep the selection for this page. */ }
    });
  });
})();
