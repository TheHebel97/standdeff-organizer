// ==UserScript==
// @name         standdeff-organizer
// @version      0.1
// @description  Automatisiert das Organisieren von Standdeffs in Die Stämme
// @author       TheHebel97
// @match        https://*.die-staemme.de/game.php?village=*&screen=place&mode=call*
// @match        https://*.die-staemme.de/game.php?village=*&screen=forum*
// @match        https://*.die-staemme.de/game.php?*village=*&screen=settings*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        none
// ==/UserScript==

import {setupScriptUI} from "./ui/script-ui-logic";
import {LocalStorageService} from "./logic/local-storage-service";

(function () {
    //load when document is ready
    $(function () {
        const localStorageService = LocalStorageService.getInstance();
        let currentScriptContext: string = getCurrentScriptContext();
        console.log("standdeff-organizer will be loaded in " + currentScriptContext);
        setupScriptUI(currentScriptContext);
    });

    function getCurrentScriptContext() :string {
        const urlParams = new URLSearchParams(window.location.search);
        let screenParamValue = urlParams.get('screen');
        let screenName:string = screenParamValue !== null ? screenParamValue : "";
        if (screenName === "place") {
            return screenName;
        }
        if (screenName === "forum") {
            const modeParamValue = urlParams.get('mode')===null ? urlParams.get('screenmode') : urlParams.get('mode');
            //const editModeParamValue = urlParams.get('edit_post_id');
            return screenName + "-" + modeParamValue;
        }
        if(screenName === "settings"){
            return screenName;
        }
        return "unknown";
    }


})();
