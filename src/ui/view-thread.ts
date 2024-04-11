import {
    addThreadIdToLocalStorage,
    getDataFromLocalStorage,
    storeDataInLocalStorage
} from "../logic/helpers/helper-functions";
import {isUserForumMod} from "../logic/helpers/tw-helper";
import {addSdOptions} from "./components/options-sd-thread";
import {addSdPopup} from "./components/first-start-thread-popup";
import {sdTable} from "./components/sd-table";


export function viewThread() {
    console.log("standdeff-organizer loaded in view_thread");
    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    const currentThreadId: string | null = urlParams.get('thread_id');
    //wenn zuvor ein neuer SD Thread erstellt wurde, ist der Boolen in newThread true
    if (getDataFromLocalStorage("newThread") === true) {
        console.log("new thread data found")
        storeDataInLocalStorage(false, "newThread")
        const edit_post_id: string | undefined = $(".post > a").attr("name")
        if (edit_post_id !== undefined) {
            addThreadIdToLocalStorage(currentThreadId, edit_post_id);
            console.log(getDataFromLocalStorage("threadIds"))
        } else {
            console.error("edit_post_id is undefined")
        }
    } else {
        console.log("no new thread data found")
    }

// auslesen der ThreadIds aus dem localstorage um zu verifizieren, dass es sich um eine SD Tabelle handelt
    let threadIds: { [key: string]: string } = getDataFromLocalStorage("threadIds");
    console.log(threadIds)
    if (threadIds !== undefined && currentThreadId !== null) {
        console.log("thread ids found")
        if (threadIds.hasOwnProperty(currentThreadId)) {
            sdTable(threadIds);
        } else {
            addSdOptions(currentThreadId);
        }
    } else {
        addSdPopup(currentThreadId);
    }
}
