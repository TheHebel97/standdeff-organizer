const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const version = require(path.join(root, 'package.json')).version;
const matches = ['forum', 'ally', 'settings', 'overview_villages', 'place']
  .map(screen => `https://*.die-staemme.de/game.php?*screen=${screen}*`);
const header = name => `// ==UserScript==
// @name         ${name}
// @namespace    standdeff-organizer
// @version      ${version}
// @description  SD-Tabellen, Bunkeranfragen und Massen-Unterstützung organisieren
// @author       TheHebel97, Fine, Regenmantel
// @license      MIT
// @homepageURL  https://github.com/TheHebel97/standdeff-organizer
${matches.map(match => `// @match        ${match}`).join('\n')}
// @grant        none
// @run-at       document-end
// @noframes
// ==/UserScript==
`;
const bundle = fs.readFileSync(path.join(root, 'dist/bundle.js'), 'utf8').replace(/[ \t]+$/gm, '');
if (/\beval\s*\(|new\s+Function\b|sourceMappingURL/.test(bundle)) throw new Error('Review bundle must not use eval, dynamic code generation or source maps');
const license = fs.readFileSync(path.join(root, 'LICENSE'), 'utf8').trim();
fs.writeFileSync(path.join(root, 'compiledScript.js'), header('Standdeff Tabelle') + `\n/*\n${license}\n\nOriginal authors credited by the project: Fine, Regenmantel.\n*/\n\n` + bundle, 'utf8');
fs.writeFileSync(path.join(root, 'devUserscript.js'), header('Standdeff Tabelle (Development)') + `
fetch('http://localhost:9000/bundle.js')
  .then(response => { if (!response.ok) throw new Error('HTTP ' + response.status); return response.text(); })
  .then(script => { (0, eval)(script); })
  .catch(error => console.error('[SD Organizer] Entwicklungsserver nicht erreichbar:', error));
`, 'utf8');
console.log('Exported compiledScript.js and devUserscript.js (' + version + ')');
