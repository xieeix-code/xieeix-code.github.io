const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class Element {
  constructor() { this.listeners = {}; this.attributes = {}; this.hidden = false; this.children = {}; this.classes = new Set(); this.classList = { toggle: (name, on) => on ? this.classes.add(name) : this.classes.delete(name) }; }
  querySelector(selector) { return this.children[selector]; }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  setAttribute(name, value) { this.attributes[name] = value; }
  contains(target) { return target === this || Object.values(this.children).includes(target); }
  fire(name, props = {}) { this.listeners[name]?.({pointerType: 'mouse', relatedTarget: null, ...props}); }
}
const papers = Array.from({length: 4}, () => {
  const resources = new Element(), button = new Element(), panel = new Element(), arrow = new Element();
  resources.children = {'.detail-toggle': button, '.detail-panel': panel};
  button.children = {'.detail-arrow': arrow};
  return {resources, button, panel, arrow};
});
let now = 0, nextId = 0;
const timers = new Map();
const tick = (ms) => { now += ms; for (const [id, task] of timers) if (task.at <= now) { timers.delete(id); task.fn(); } };
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname, '../assets/js/publication-details.js'), 'utf8'), {
  document: {querySelectorAll: () => papers.map(p => p.resources)},
  setTimeout: (fn, ms) => { const id = ++nextId; timers.set(id, {fn, at: now + ms}); return id; },
  clearTimeout: (id) => timers.delete(id)
});
const [a, b] = papers;
assert(papers.every(p => p.panel.hidden && !p.button.hidden));
a.button.fire('pointerenter'); tick(999); assert(a.panel.hidden);
tick(1); assert(!a.panel.hidden && a.resources.classes.has('is-preview'));
a.button.fire('pointerleave', {relatedTarget: a.panel}); assert(!a.panel.hidden);
a.panel.fire('pointerleave'); assert(a.panel.hidden);
a.button.fire('pointerenter'); tick(500); a.button.fire('pointerleave'); tick(1000); assert(a.panel.hidden);
a.button.fire('pointerenter'); tick(1000); a.button.fire('click');
assert(!a.panel.hidden && !a.resources.classes.has('is-preview'));
assert.equal(a.arrow.textContent, '▴');
a.button.fire('pointerleave'); a.panel.fire('pointerleave'); a.resources.fire('keydown', {key: 'Escape'}); assert(!a.panel.hidden);
b.button.fire('click'); assert(!a.panel.hidden && !b.panel.hidden);
a.button.fire('click'); tick(2000); assert(a.panel.hidden && !b.panel.hidden);
assert.equal(a.arrow.textContent, '▾'); assert.equal(a.button.attributes['aria-expanded'], 'false');
a.button.fire('pointerenter', {pointerType: 'touch'}); tick(2000); assert(a.panel.hidden);
a.button.fire('click'); assert(!a.panel.hidden); a.button.fire('click');
a.button.fire('pointerenter'); tick(1000); a.resources.fire('keydown', {key: 'Escape'}); assert(a.panel.hidden);
a.button.fire('pointerenter'); tick(500); a.button.fire('click'); tick(1000);
assert(!a.panel.hidden && !a.resources.classes.has('is-preview'));
console.log('PASS: 1s delay, early leave cancellation, preview reading, pin/unpin, no immediate reopening, independent papers, touch, Escape, pending timer cancellation.');
