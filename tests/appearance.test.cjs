const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/appearance.js'), 'utf8');
function load({ saved = null, blocked = false, theme = 'light', chromium = true } = {}) {
  const root = { dataset: { theme } };
  const listeners = {};
  const slider = {
    parentElement: { hidden: true }, attributes: {}, value: '0',
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, handler) { listeners[name] = handler; }
  };
  vm.runInNewContext(source, {
    document: {
      documentElement: root, querySelector: () => slider,
      addEventListener: (_, handler) => { listeners.ready = handler; }
    },
    navigator: { userAgent: chromium ? 'Chrome/140.0' : 'Version/26.0 Safari/605.1.15' },
    CSS: { supports: () => true },
    localStorage: {
      getItem(key) { assert.equal(key, 'appearance'); if (blocked) throw Error('Blocked'); return saved; },
      setItem(key, value) { assert.equal(key, 'appearance'); if (blocked) throw Error('Blocked'); saved = value; }
    }
  });
  const initial = root.dataset.style;
  listeners.ready();
  return { root, slider, initial, saved: () => saved, select(value) { slider.value = value; listeners.input(); } };
}

for (const theme of ['light', 'dark']) {
  const page = load({ theme });
  assert.equal(page.initial, 'minimal');
  assert.equal(page.slider.parentElement.hidden, false);
  assert.equal(page.slider.attributes['aria-valuetext'], '极简主题');
  page.select('1');
  assert.equal(page.root.dataset.style, 'liquid');
  assert.equal(page.root.dataset.theme, theme);
  assert.equal(page.slider.attributes['aria-valuetext'], '液态主题');
  assert.equal(page.saved(), 'liquid');
  const reloaded = load({ saved: page.saved(), theme });
  assert.equal(reloaded.initial, 'liquid');
  assert.equal(reloaded.slider.value, '1');
  page.select('0');
  assert.equal(page.root.dataset.style, 'minimal');
  assert.equal(page.root.dataset.theme, theme);
  assert.equal(page.saved(), 'minimal');
}
assert.equal(load({ saved: 'invalid' }).initial, 'minimal');
const blocked = load({ blocked: true });
blocked.select('1');
assert.equal(blocked.root.dataset.style, 'liquid');
assert.equal(load().root.dataset.refraction, 'svg');
assert.equal(load({ chromium: false }).root.dataset.refraction, undefined);
console.log('PASS: pre-paint style, independent light/dark state, persistence, blocked storage and refraction fallback.');
