const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const version = require(path.join(root, 'package.json')).version;
const matches = ['https://*.die-staemme.de/game.php*', 'https://*.tribalwars.net/game.php*'];
const header = name => `// ==UserScript==
// @name         ${name}
// @namespace    standdeff-organizer
// @version      ${version}
// @description  SD-Tabellen, Bunkeranfragen und Massen-Unterstützung organisieren
// @author       You, Fine, Regenmantel
${matches.map(match => `// @match        ${match}`).join('\n')}
// @grant        none
// @run-at       document-end
// ==/UserScript==
`;
const bundle = fs.readFileSync(path.join(root, 'dist/bundle.js'), 'utf8');
if (/\beval\s*\(/.test(bundle)) throw new Error('Release bundle must not use development eval');
fs.writeFileSync(path.join(root, 'compiledScript.js'), header('SD Organizer') + '\n' + bundle, 'utf8');
fs.writeFileSync(path.join(root, 'devUserscript.js'), header('SD Organizer (Development)') + `
fetch('http://localhost:9000/bundle.js')
  .then(response => { if (!response.ok) throw new Error('HTTP ' + response.status); return response.text(); })
  .then(script => { (0, eval)(script); })
  .catch(error => console.error('[SD Organizer] Entwicklungsserver nicht erreichbar:', error));
`, 'utf8');
console.log('Exported compiledScript.js and devUserscript.js (' + version + ')');
