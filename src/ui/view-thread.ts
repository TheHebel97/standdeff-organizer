import {
    addThreadIdToLocalStorage,
} from "../logic/helpers/helper-functions";
import {isUserForumMod} from "../logic/helpers/tw-helper";
import {addSdOptions} from "./components/options-sd-thread";
import {addSdPopup} from "./components/first-start-thread-popup";
import {sdTable} from "./components/sd-table";
import {updateData, Threads} from "../types/types";
import {LocalStorageService} from "../logic/local-storage-service";
import {parseSdPosts} from "../logic/helpers/table-helper";


export function viewThread() {
    const localStorageService = LocalStorageService.getInstance();
    console.log("standdeff-organizer loaded in view_thread");
    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    const currentThreadId: string = urlParams.get('thread_id') || "";
    //wenn zuvor ein neuer SD Thread erstellt wurde, ist der Boolean in newThread true
    if (localStorageService.getNewThread) {
        console.log("new thread data found")
        localStorageService.setNewThread = false;
        const edit_post_id: string | undefined = $(".post > a").attr("name")
        const thread_name: string | null = $(".clearfix > table").first().find("h2").text();
        const forum_name: string | null = $(".forum-container").find(".selected").text().trim();
        // @ts-ignore
        const forum_id: string | null = $(".forum.selected").find("a").attr("href").match(/forum_id=\d+/)[0].split("=")[1] || null;
        if (edit_post_id !== undefined) {
            addThreadIdToLocalStorage(currentThreadId, edit_post_id, thread_name, forum_name, forum_id);
        } else {
            console.error("edit_post_id is undefined")
        }
    } else {
        console.log("no new thread data found")
    }

// auslesen der ThreadIds aus dem localstorage um zu verifizieren, dass es sich um eine SD Tabelle handelt
    let threads: Threads = localStorageService.getAllThreads;
    if (threads[currentThreadId] !== undefined) {
        console.log("thread ids found")

        sdTable(threads);
    } else {
        if (Object.keys(threads).length === 0) {
            addSdPopup(currentThreadId);
        }
        addSdOptions(currentThreadId);
    }


}
