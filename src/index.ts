// ==UserScript==
// @name         Development Script
// @version      0.1
// @description  try to take over the world!
// @author       You, Fine, Regenmantel
// @match        https://*/game.php?village=*&screen=place&*mode=call*
// @match        https://*/game.php?*screen=overview_villages&mode=units&type=away_detail&*
// @match        https://*/game.php?*village=*&screen=forum*
// @match        https://*/game.php?*village=*&screen=settings*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        none
// ==/UserScript==

import {displayMassUt} from "./ui/mass-ut";
import {viewThread} from "./ui/view-thread";
import {createNewTable} from "./ui/new-thread";
import {displaySettings} from "./ui/settings";
import {Log} from "./helpers/logging-helper";
import {PageContext, resolveScriptContext, ScriptContext} from "./helpers/script-context";
import {displayAwayDetail} from "./ui/away-detail";

const log = Log.scope("bootstrap");

const contextHandlers: Partial<Record<ScriptContext, { name: string, run: (pageContext: PageContext) => void }>> = {
    "place": {name: "displayMassUt", run: displayMassUt},
    "overview-away_detail": {name: "displayAwayDetail", run: displayAwayDetail},
    "forum-view_thread": {name: "viewThread", run: viewThread},
    "forum-new_thread": {name: "createNewTable", run: createNewTable},
    "settings": {name: "displaySettings", run: displaySettings}
};

(function () {
    $(function () {
        const contextResolution = resolveScriptContext();
        log.groupCollapsed("Boot sequence");
        log.state("Resolved script context", contextResolution);

        const handler = contextHandlers[contextResolution.context];
        if (!handler) {
            log.warn("No controller registered for resolved context", {
                context: contextResolution.context,
                screen: contextResolution.screen,
                mode: contextResolution.mode
            });
            log.groupEnd();
            return;
        }

        log.info("Dispatching controller", {
            context: contextResolution.context,
            handler: handler.name
        });

        try {
            handler.run(contextResolution);
            log.info("Controller finished boot phase", {
                context: contextResolution.context,
                handler: handler.name
            });
        } catch (error) {
            log.error("Unhandled error during controller boot", error);
            throw error;
        } finally {
            log.groupEnd();
        }
    });
})();
