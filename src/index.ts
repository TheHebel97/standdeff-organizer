// ==UserScript==
// @name         standdeff-organizer
// @version      0.1
// @description  Automatisiert das Organisieren von Standdeffs in Die Stämme
// @author       TheHebel97
// @match        https://*.die-staemme.de/game.php?village=*&screen=place&mode=call&target=*
// @match        https://*.die-staemme.de/game.php?village=*&screen=forum*
// @match        https://*.die-staemme.de/game.php?*village=*&screen=settings*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        none
// ==/UserScript==


import {getCurrentScriptContext} from "./logic/helpers/tw-helper";
import {setupScriptUI} from "./ui/script-ui-logic";

(function () {
    //load when document is ready
    $(function () {

        let currentScriptContext:string = getCurrentScriptContext();
        console.log("standdeff-organizer will be loaded in " + currentScriptContext);
        setupScriptUI(currentScriptContext);
    });


})();
