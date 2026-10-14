const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const { version } = require('../package.json');
const source = fs.readFileSync(path.join(root, 'compiledScript.js'), 'utf8');

assert.ok(source.startsWith('// ==UserScript=='));
assert.ok(source.includes(`// @version      ${version}`));
assert.ok(source.includes('// @name         Standdeff Tabelle'));
assert.ok(source.includes('// @license      MIT'));
assert.ok(source.includes('// @noframes'));
assert.ok(source.includes(fs.readFileSync(path.join(root, 'LICENSE'), 'utf8').trim()));
assert.ok(!/\beval\s*\(|new\s+Function\b|localhost:9000|127\.0\.0\.1:9000|sourceMappingURL/.test(source));
assert.ok(!source.includes('tribalwars.net'));
assert.ok(source.split('\n').length > 1000, 'Review artifact must remain readable, not minified');
new vm.Script(source, { filename: 'compiledScript.js' });

function run(register, useUnsafeWindow=false) {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
    url: 'https://de0.die-staemme.de/game.php?village=1&screen=overview', runScripts: 'outside-only'
  });
  const { window } = dom;
  const $ = require('jquery')(window);
  window.$ = window.jQuery = $;
  // The registration is synchronous and must happen before the ready callback/UI.
  if (register) window.ScriptAPI = { register };
  if (useUnsafeWindow) {
    window.unsafeWindow = { ScriptAPI: { register } };
    window.ScriptAPI.register = () => { throw new Error('wrong API scope'); };
  }
  return { dom, window, execute: () => vm.runInContext(source, dom.getInternalVMContext(), { timeout: 2000 }) };
}

const missing = run();
try {
  assert.throws(missing.execute, /register/);
  assert.equal(missing.window.document.head.childElementCount, 0);
  assert.equal(missing.window.document.body.childElementCount, 0);
} finally { missing.window.close(); }
const denied = run(() => { throw new Error('API rejected'); });
try {
  assert.throws(denied.execute, /API rejected/);
  assert.equal(denied.window.document.head.childElementCount, 0);
  assert.equal(denied.window.document.body.childElementCount, 0);
} finally { denied.window.close(); }
for (const useUnsafeWindow of [false, true]) {
  let calls = 0;
  const accepted = run((...args) => {
    calls++;
    assert.equal(accepted.window.document.head.childElementCount, 0);
    assert.equal(accepted.window.document.body.childElementCount, 0);
    assert.deepEqual(args, ['Standdeff Tabelle', true, 'TheHebel97', 'support-nur-im-forum@die-staemme.de']);
  }, useUnsafeWindow);
  try { accepted.execute(); assert.equal(calls, 1); }
  finally { accepted.window.close(); }
}
console.log(`Userscript ${version}: readable standalone build, metadata, MIT notice and native ScriptAPI startup verified.`);
