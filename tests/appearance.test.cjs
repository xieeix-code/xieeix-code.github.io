const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/appearance.js'), 'utf8');
function load({ saved = null, blocked = false, theme = 'light', chromium = true, animated = false, reduced = false, imageError = false, combined = false } = {}) {
  const root = { dataset: { theme } };
  const listeners = {};
  const ready = [], animations = [], decodedImages = [];
  let savedTheme = null;
  const slider = {
    parentElement: { hidden: true }, attributes: {}, value: '0',
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, handler) { listeners[name] = handler; }
  };
  const themeButton = {
    setAttribute() {},
    addEventListener: (_, handler) => { listeners.themeClick = handler; }
  };
  const document = {
    documentElement: root,
    querySelector: selector => selector === '#appearance' ? slider : selector.startsWith('meta') ? {} : themeButton,
    addEventListener: (_, handler) => { ready.push(handler); }
  };
  if (animated) document.startViewTransition = update => {
    animations.at(-1)?.skipTransition(); // A new document transition skips the previous animation, but not its callback.
    const animation = { update, ready: Promise.resolve(), skipped: false,
      skipTransition() { this.skipped = true; } };
    animations.push(animation);
    return animation;
  };
  const context = {
    document,
    window: { matchMedia: query => query.includes('reduced-motion') ? { matches: reduced } : { matches: theme === 'dark', addEventListener() {} } },
    Image: class {
      decode() {
        decodedImages.push(this.src);
        return imageError ? Promise.reject(Error('Image unavailable')) : Promise.resolve();
      }
    },
    navigator: { userAgent: chromium ? 'Chrome/140.0' : 'Version/26.0 Safari/605.1.15' },
    CSS: { supports: () => true },
    localStorage: {
      getItem(key) { if (blocked) throw Error('Blocked'); return key === 'appearance' ? saved : savedTheme; },
      setItem(key, value) { if (blocked) throw Error('Blocked'); if (key === 'appearance') saved = value; else savedTheme = value; }
    }
  };
  if (combined) vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/js/theme.js'), 'utf8'), context);
  vm.runInNewContext(source, context);
  const initial = root.dataset.style;
  ready.forEach(handler => handler());
  return {
    root, slider, initial, animations, decodedImages, saved: () => saved, savedTheme: () => savedTheme,
    select(value) { slider.value = value; listeners.input(); },
    themeClick: () => listeners.themeClick(),
    async flush(reverse = false) {
      await new Promise(setImmediate);
      const pending = animations.filter(animation => !animation.ran);
      if (reverse) pending.reverse();
      for (const animation of pending) { animation.ran = true; await animation.update(); }
    }
  };
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
(async () => {
  assert.equal(load({ saved: 'liquid', animated: true }).animations.length, 0);
  for (const theme of ['light', 'dark']) {
    const page = load({ animated: true, theme });
    page.select('1');
    assert.equal(page.root.dataset.style, 'minimal'); // The old view stays in place until the snapshot callback.
    assert.equal(page.saved(), 'liquid');
    await page.flush();
    assert.equal(page.root.dataset.style, 'liquid');
    assert.equal(page.root.dataset.theme, theme);
    assert.equal(page.slider.attributes['aria-valuetext'], '液态主题');
    assert.deepEqual(page.decodedImages, ['/images/themes/liquid-desert.svg', '/images/themes/liquid-stars.svg']);
    page.select('0');
    assert.equal(page.root.dataset.style, 'liquid');
    await page.flush();
    assert.equal(page.root.dataset.style, 'minimal');

    page.select('1'); page.select('0');
    await page.flush(true);
    assert.equal(page.root.dataset.style, 'minimal'); // A pending decode cannot restore an old selection.
    page.select('1'); await page.flush();
    page.select('0'); page.select('1');
    await page.flush(true);
    assert.equal(page.root.dataset.style, 'liquid'); // A skipped snapshot callback cannot restore an old selection.
    assert.equal(page.slider.value, '1');
    assert.equal(page.saved(), 'liquid');
  }
  const reduced = load({ animated: true, reduced: true });
  reduced.select('1');
  assert.equal(reduced.root.dataset.style, 'liquid');
  assert.equal(reduced.animations.length, 0);
  const failedImages = load({ animated: true, imageError: true, blocked: true });
  failedImages.select('1'); await failedImages.flush();
  assert.equal(failedImages.root.dataset.style, 'liquid');

  const mixed = load({ animated: true, combined: true });
  mixed.select('1'); mixed.themeClick(); await mixed.flush(true);
  assert.equal(mixed.root.dataset.style, 'liquid');
  assert.equal(mixed.root.dataset.theme, 'dark');
  mixed.select('0'); mixed.themeClick(); mixed.select('1'); mixed.themeClick(); mixed.select('0');
  await mixed.flush(true);
  assert.equal(mixed.root.dataset.style, 'minimal');
  assert.equal(mixed.root.dataset.theme, 'dark');
  assert.equal(mixed.saved(), 'minimal');
  assert.equal(mixed.savedTheme(), 'dark');
  console.log('PASS: appearance snapshots, image preparation, rapid and interleaved changes, reduced motion, persistence and fallback.');
})().catch(error => { console.error(error); process.exitCode = 1; });
