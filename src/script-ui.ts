export function setupScriptUI(currentScriptContext:string) {

    if (currentScriptContext === "place") {
        console.log("standdeff-organizer loaded in place");
    } else if (currentScriptContext === "forum-view_thread") {
        console.log("standdeff-organizer loaded in view_thread");
    } else if (currentScriptContext === "forum-new_thread") {
        console.log("standdeff-organizer loaded in new_thread");
    }

}
