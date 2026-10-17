const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const script = fs.readFileSync(path.join(__dirname, '../assets/js/site-views.js'), 'utf8');

async function run(fetchResult, expire = false) {
  const counter = {};
  let timer, cleared = false, calls = 0;
  const task = vm.runInNewContext(script, {
    document: { getElementById: () => counter, referrer: '' },
    location: { href: 'https://xieeix-code.github.io/' },
    AbortController,
    setTimeout: (callback, delay) => { assert.equal(delay, 10000); timer = callback; return 1; },
    clearTimeout: () => { cleared = true; },
    fetch: async (url, options) => {
      calls++;
      assert.equal(url, 'https://cdn.busuanzi.cc/api.php');
      assert.equal(options.method, 'POST');
      if (expire) return new Promise((_, reject) => options.signal.addEventListener('abort', () => reject(new Error('Aborted'))));
      return fetchResult();
    }
  });
  assert.equal(counter.textContent, 'Loading…');
  if (expire) timer();
  await task;
  assert.equal(calls, 1);
  assert(cleared);
  return counter.textContent;
}

(async () => {
  for (const value of [0, 123, '456']) {
    assert.equal(await run(() => ({ ok: true, json: async () => ({ busuanzi_site_pv: value }) })), String(value));
  }
  for (const data of [{}, null, { busuanzi_site_pv: '域名/IP已被禁用' }]) {
    assert.equal(await run(() => ({ ok: true, json: async () => data })), '暂不可用');
  }
  assert.equal(await run(() => { throw new Error('Offline'); }), '暂不可用');
  assert.equal(await run(() => ({ ok: false })), '暂不可用');
  assert.equal(await run(() => ({ ok: true, json: async () => { throw new Error('Invalid JSON'); } })), '暂不可用');
  assert.equal(await run(null, true), '暂不可用');
  console.log('PASS: counts including zero, network/HTTP/JSON/service errors, timeout, timer cleanup, one request per visit.');
})();
