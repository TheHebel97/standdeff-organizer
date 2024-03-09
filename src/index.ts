// ==UserScript==
// @name         standdeff-organizer
// @version      0.1
// @description  Automatisiert das Organisieren von Standdeffs in Die Stämme
// @author       TheHebel97
// @match        https://*.die-staemme.de/game.php?village=*&screen=place&mode=call&target=*
// @match        https://*.die-staemme.de/game.php?village=*&screen=forum*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        none
// ==/UserScript==


import {getCurrentScriptContext} from "./tw-helper";

(function () {
    //load when document is ready
    $(function () {

        let currentScriptContext = getCurrentScriptContext();
        if (currentScriptContext === "place") {
            console.log("standdeff-organizer loaded in place");
        } else if (currentScriptContext === "forum-view_thread") {
            console.log("standdeff-organizer loaded in view_thread");
        } else if (currentScriptContext === "forum-new_thread") {
            console.log("standdeff-organizer loaded in new_thread");
        }

    });
})();
