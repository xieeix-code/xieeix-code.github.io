const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const buttons = ['zh', 'en'].map(language => ({
  dataset: {language}, attributes: {'aria-pressed': String(language === 'zh')}, listeners: {},
  setAttribute(name, value) { this.attributes[name] = value; },
  addEventListener(name, callback) { this.listeners[name] = callback; }
}));
const copies = ['zh', 'en', 'zh', 'en'].map(copyLanguage => ({
  dataset: {copyLanguage}, hidden: copyLanguage !== 'zh'
}));
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/js/intro-language.js'), 'utf8'), {
  document: {querySelectorAll: selector => selector === '.language-switch button' ? buttons : copies}
});
function check(language) {
  assert(copies.every(copy => copy.hidden === (copy.dataset.copyLanguage !== language)));
  assert(buttons.every(button => button.attributes['aria-pressed'] === String(button.dataset.language === language)));
}
check('zh');
buttons[1].listeners.pointerenter({pointerType: 'touch'}); check('zh');
buttons[1].listeners.pointerenter({pointerType: 'mouse'}); check('en');
buttons[0].listeners.focus(); check('zh');
buttons[1].listeners.click(); check('en');
buttons[0].listeners.pointerenter({pointerType: 'mouse'}); check('zh');
console.log('PASS: default Chinese, synchronized hover switch, touch click and keyboard focus.');
