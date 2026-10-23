// ==UserScript==
// @name         Standdeff Tabelle (Development)
// @namespace    standdeff-organizer
// @version      2.0.0-rc.3
// @description  SD-Tabellen, Bunkeranfragen und Massen-Unterstützung organisieren
// @author       TheHebel97, Fine, Regenmantel
// @license      MIT
// @homepageURL  https://github.com/TheHebel97/standdeff-organizer
// @match        https://*.die-staemme.de/game.php?*screen=forum*
// @match        https://*.die-staemme.de/game.php?*screen=ally*
// @match        https://*.die-staemme.de/game.php?*screen=settings*
// @match        https://*.die-staemme.de/game.php?*screen=overview_villages*
// @match        https://*.die-staemme.de/game.php?*screen=place*
// @grant        none
// @run-at       document-end
// @noframes
// ==/UserScript==

fetch('http://localhost:9000/bundle.js')
  .then(response => { if (!response.ok) throw new Error('HTTP ' + response.status); return response.text(); })
  .then(script => { (0, eval)(script); })
  .catch(error => console.error('[SD Organizer] Entwicklungsserver nicht erreichbar:', error));
