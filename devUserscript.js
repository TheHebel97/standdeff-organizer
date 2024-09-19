// ==UserScript==
// @name         Development Script
// @version      0.1
// @description  try to take over the world!
// @author       You, Fine, Regenmantel
// @match        https://*.die-staemme.de/game.php?village=*&screen=place&*mode=call*
// @match        https://*.die-staemme.de/game.php?*village=*&screen=forum*
// @match        https://*.die-staemme.de/game.php?*village=*&screen=settings*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        none
// ==/UserScript==



function log(...args) {
  console.log("%cUserscript:", "color: purple; font-weight: bold", ...args);
}

log("Dev mode started");
function main() {
  fetch("http://localhost:9000/bundle.js").then(resp => {
    resp.text().then(script => {
      log("Got Dev script");
      eval(script);
      log("Dev script evaled");
    });
  });
}

// Make sure we run once at the start
main.bind({})();
