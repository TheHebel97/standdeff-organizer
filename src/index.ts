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

import {displayMassUt} from "./ui/mass-ut";
import {viewThread} from "./ui/view-thread";
import {createNewTable} from "./ui/new-thread";
import {displaySettings} from "./ui/settings";

(function () {
    //load when document is ready
    $(function () {
        const currentScriptContext: string = getCurrentScriptContext();
        Log.info("standdeff-organizer will be loaded in context: " + currentScriptContext);
        setupScriptUI(currentScriptContext);
    });

    function getCurrentScriptContext() :string {
        // returns the current context of the script as string
        const urlParams = new URLSearchParams(window.location.search);
        const screenParamValue = urlParams.get('screen');
        const screenName:string = screenParamValue !== null ? screenParamValue : "";
        if (screenName === "place") {
            return screenName;
        }
        if (screenName === "forum") {
            const modeParamValue = urlParams.get('mode')===null ? urlParams.get('screenmode') : urlParams.get('mode');
            return screenName + "-" + modeParamValue;
        }
        if(screenName === "settings"){
            return screenName;
        }
        return "unknown";
    }

    function setupScriptUI(currentScriptContext: string) {
        // the four possible contexts are: place, forum-view_thread, forum-new_thread, settings
        if (currentScriptContext === "place") {
            displayMassUt();
        } else if (currentScriptContext === "forum-view_thread") {
            viewThread();
        } else if (currentScriptContext === "forum-new_thread") {
            createNewTable();
        } else if (currentScriptContext === "settings") {
            displaySettings();
        }
    }
})();
