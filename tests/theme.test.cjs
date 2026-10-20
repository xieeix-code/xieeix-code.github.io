const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/theme.js'), 'utf8');
function load({ dark = false, saved = null, blocked = false, animated = false, reduced = false, style = 'minimal', imageError = false } = {}) {
  const root = { dataset: { style } };
  const meta = {};
  const listeners = {};
  const animations = [];
  const decodedImages = [];
  const system = { matches: dark, addEventListener: (_, handler) => { listeners.system = handler; } };
  const button = {
    hidden: true, attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener: (_, handler) => { listeners.click = handler; }
  };
  const document = {
    documentElement: root,
    querySelector: selector => selector.startsWith('meta') ? meta : button,
    addEventListener: (_, handler) => { listeners.ready = handler; }
  };
  if (animated) document.startViewTransition = update => {
    const animation = { update, ready: Promise.resolve(), skipped: false,
      skipTransition() { this.skipped = true; } };
    animations.push(animation);
    return animation;
  };
  vm.runInNewContext(source, {
    window: { matchMedia: query => query.includes('reduced-motion') ? { matches: reduced } : system },
    document,
    Image: class {
      decode() {
        decodedImages.push(this.src);
        return imageError ? Promise.reject(Error('Image unavailable')) : Promise.resolve();
      }
    },
    localStorage: {
      getItem() { if (blocked) throw Error('Storage blocked'); return saved; },
      setItem(_, value) { if (blocked) throw Error('Storage blocked'); saved = value; }
    }
  });
  const initialTheme = root.dataset.theme;
  listeners.ready();
  return {
    root, meta, button, initialTheme, animations, decodedImages,
    click: () => listeners.click(),
    system: dark => listeners.system({ matches: dark }),
    saved: () => saved,
    async flush(reverse = false) {
      await new Promise(setImmediate); // Finish image preparation before the browser takes a snapshot.
      const pending = animations.filter(animation => !animation.ran);
      if (reverse) pending.reverse();
      for (const animation of pending) {
        animation.ran = true;
        await animation.update();
      }
    }
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
(async () => {
  const page = load({ animated: true, style: 'liquid' });
  assert.equal(page.animations.length, 0); // Initial paint never animates.
  page.click();
  assert.equal(page.root.dataset.theme, 'light'); // The old view remains until the snapshot callback.
  assert.equal(page.saved(), 'dark');
  await page.flush();
  assert.equal(page.root.dataset.theme, 'dark');
  assert.equal(page.decodedImages.at(-1), '/images/themes/liquid-stars.svg');
  page.click();
  await page.flush();
  assert.equal(page.root.dataset.theme, 'light');
  assert.equal(page.decodedImages.at(-1), '/images/themes/liquid-desert.svg');

  const previous = page.animations.at(-1);
  page.click(); page.click();
  assert.equal(previous.skipped, true);
  await page.flush(true); // Even an older, skipped callback must not restore a stale theme.
  assert.equal(page.root.dataset.theme, 'light');
  assert.equal(page.saved(), 'light');
  page.click(); page.click(); page.click();
  await page.flush();
  assert.equal(page.root.dataset.theme, 'dark');
  assert.equal(page.saved(), 'dark');
  assert.equal(page.button.attributes['aria-label'], '切换为亮色主题');

  const minimal = load({ animated: true });
  minimal.system(true);
  await minimal.flush();
  assert.equal(minimal.root.dataset.theme, 'dark');
  assert.equal(minimal.decodedImages.length, 0);
  minimal.click(); minimal.click();
  assert.equal(minimal.animations.at(-2).skipped, true);
  await minimal.flush(true);
  assert.equal(minimal.root.dataset.theme, 'dark');

  const reduced = load({ animated: true, reduced: true });
  reduced.click();
  assert.equal(reduced.root.dataset.theme, 'dark');
  assert.equal(reduced.animations.length, 0);

  const missingImage = load({ animated: true, style: 'liquid', imageError: true });
  missingImage.click();
  await missingImage.flush();
  assert.equal(missingImage.root.dataset.theme, 'dark');
  console.log('PASS: theme defaults, persistence, animated snapshots, rapid clicks, reduced motion and image fallback.');
})().catch(error => { console.error(error); process.exitCode = 1; });
