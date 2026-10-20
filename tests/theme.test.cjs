const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/theme.js'), 'utf8');
function load({ dark = false, saved = null, blocked = false } = {}) {
  const root = { dataset: {} };
  const meta = {};
  const listeners = {};
  const system = { matches: dark, addEventListener: (_, handler) => { listeners.system = handler; } };
  const button = {
    hidden: true, attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener: (_, handler) => { listeners.click = handler; }
  };
  vm.runInNewContext(source, {
    window: { matchMedia: () => system },
    document: {
      documentElement: root,
      querySelector: selector => selector.startsWith('meta') ? meta : button,
      addEventListener: (_, handler) => { listeners.ready = handler; }
    },
    localStorage: {
      getItem() { if (blocked) throw Error('Storage blocked'); return saved; },
      setItem(_, value) { if (blocked) throw Error('Storage blocked'); saved = value; }
    }
  });
  const initialTheme = root.dataset.theme;
  listeners.ready();
  return {
    root, meta, button, initialTheme,
    click: () => listeners.click(),
    system: dark => listeners.system({ matches: dark }),
    saved: () => saved
  };
}

for (const dark of [false, true]) {
  const page = load({ dark });
  assert.equal(page.initialTheme, dark ? 'dark' : 'light'); // Applied before DOMContentLoaded.
  assert.equal(page.button.hidden, false);
  page.system(!dark);
  assert.equal(page.root.dataset.theme, dark ? 'light' : 'dark');
  page.click();
  const selected = dark ? 'dark' : 'light';
  assert.equal(page.root.dataset.theme, selected);
  assert.equal(page.saved(), selected);
  assert.equal(page.button.attributes['aria-label'], dark ? '切换为亮色主题' : '切换为暗色主题');
  assert.equal(page.button.title, page.button.attributes['aria-label']);
  assert.equal(page.meta.content, dark ? '#1b2028' : '#ffffff');
  page.system(!dark);
  assert.equal(page.root.dataset.theme, selected);
  assert.equal(load({ dark: !dark, saved: page.saved() }).root.dataset.theme, selected);
  page.click();
  assert.notEqual(page.root.dataset.theme, selected);
}
assert.equal(load({ dark: true, saved: 'invalid' }).root.dataset.theme, 'dark');
for (const dark of [false, true]) {
  const page = load({ dark, blocked: true });
  page.click();
  assert.equal(page.root.dataset.theme, dark ? 'light' : 'dark');
  page.system(dark);
  assert.equal(page.root.dataset.theme, dark ? 'light' : 'dark');
}
console.log('PASS: system theme, pre-paint initialization, saved preference, toggle labels and blocked storage.');
