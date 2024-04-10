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
    /*let test = {"test": 1};
    console.log(typeof test);

    storeDataInLocalStorage(test, "test1")
    window.addEventListener('storage', (event) => {
        // Prüfen Sie den Schlüssel, der geändert wurde
        if (event.key === 'test1') {
            // Führen Sie Ihre Aktion aus
            console.log('Der Wert von "meinSchlüssel" hat sich geändert!');
        }
    });
    setTimeout(() => {
        test = {"test": 2};
        storeDataInLocalStorage(test, "test1")
        console.log(getDataFromLocalStorage("test1"))
    }, 2000);


*/

}










