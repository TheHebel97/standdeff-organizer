// ==UserScript==
// @name         SD Organizer (Development)
// @namespace    standdeff-organizer
// @version      2.0.0-rc.1
// @description  SD-Tabellen, Bunkeranfragen und Massen-Unterstützung organisieren
// @author       You, Fine, Regenmantel
// @match        https://*.die-staemme.de/game.php*
// @match        https://*.tribalwars.net/game.php*
// @grant        none
// @run-at       document-end
// ==/UserScript==

fetch('http://localhost:9000/bundle.js')
  .then(response => { if (!response.ok) throw new Error('HTTP ' + response.status); return response.text(); })
  .then(script => { (0, eval)(script); })
  .catch(error => console.error('[SD Organizer] Entwicklungsserver nicht erreichbar:', error));
