import {createNewTable} from "./new-thread";
import {viewThread} from "./view-thread";
import {displaySettings} from "./settings";
import {displayMassUt} from "./mass-ut";

export function setupScriptUI(this: any, currentScriptContext: string) {
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










