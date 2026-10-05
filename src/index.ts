import {showPendingOperations, confirmVisibleForumPosts} from "./ui/components/pending-operations";
import {initializeOnboarding} from './ui/components/onboarding';


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
        document.addEventListener('sd-storage-error',()=>{
            $('#sd-storage-error').remove();
            $('<p id="sd-storage-error" role="alert" style="padding:8px;border:1px solid #8d0100">').text('SD Organizer: Speichern fehlgeschlagen. Bitte freien Browserspeicher prüfen und die Änderung erneut ausführen.').prependTo('#content_value');
        });
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
            if (contextResolution.context === 'forum-view_thread') confirmVisibleForumPosts(contextResolution.query.thread_id ?? '');
            handler.run(contextResolution);
            showPendingOperations();
            initializeOnboarding(contextResolution);
            if (sessionStorage.getItem('sd-storage-recovered')) {
                $('<p role="alert" style="padding:8px;border:1px solid #8d0100">').text('SD Organizer: beschädigte Speicherdaten wurden vor der Wiederherstellung unter standdeff-organizer:backup gesichert. Bitte die Thread-Zuordnungen und Einstellungen prüfen.').prependTo('#content_value');
                sessionStorage.removeItem('sd-storage-recovered');
            }
            log.info("Controller finished boot phase", {
                context: contextResolution.context,
                handler: handler.name
            });
        } catch (error) {
            log.error("Unhandled error during controller boot", error);
            $('<p role="alert" style="padding:8px;border:1px solid #8d0100">').text(`SD Organizer konnte nicht gestartet werden: ${error instanceof Error ? error.message : 'unbekannter Fehler'}`).prependTo('#content_value');
            throw error;
        } finally {
            log.groupEnd();
        }
    });
})();
