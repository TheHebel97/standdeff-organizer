import {
    addThreadIdToLocalStorage,
} from "../helpers/helper-functions";
import {addSdOptions} from "./components/options-sd-thread";
import {addSdPopup} from "./components/first-start-thread-popup";
import {sdTable} from "./components/sd-table";
import { Threads} from "../types/types";
import {LocalStorageHelper} from "../helpers/local-storage-helper";
import {Log} from "../helpers/logging-helper";

const log = Log.scope("view-thread");

export function viewThread() {
    const localStorageService = LocalStorageHelper.getInstance();
    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    const currentThreadId: string = urlParams.get('thread_id') || "";
    log.info("Initializing view-thread controller", {
        currentThreadId,
        href: window.location.href
    });

    //wenn zuvor ein neuer SD Thread erstellt wurde, ist der Boolean in newThread true
    if (localStorageService.getNewThread) {
        log.info("Detected pending new-thread marker");
        localStorageService.setNewThread = false;
        const edit_post_id: string | undefined = $(".post > a").attr("name")
        const thread_name: string | null = $(".clearfix > table").first().find("h2").text();
        const forum_name: string | null = $(".forum-container").find(".selected").text().trim();
        // @ts-ignore
        const forum_id: string | null = $(".forum.selected").find("a").attr("href").match(/forum_id=\d+/)[0].split("=")[1] || null;
        if (edit_post_id !== undefined) {
            log.info("Persisting newly created SD thread", {
                currentThreadId,
                edit_post_id,
                thread_name,
                forum_name,
                forum_id
            });
            addThreadIdToLocalStorage(currentThreadId, edit_post_id, thread_name, forum_name, forum_id);
        } else {
            log.error("edit_post_id is undefined");
        }
    } else {
        log.info("No pending new-thread marker found");
    }

    // auslesen der ThreadIds aus dem localstorage um zu verifizieren, dass es sich um eine SD Tabelle handelt
    let threads: Threads = localStorageService.getAllThreads;
    log.state("Known thread ids in localStorage", {
        currentThreadId,
        knownThreadIds: Object.keys(threads),
        knownThreadCount: Object.keys(threads).length
    });

    if (threads[currentThreadId] !== undefined) {
        log.info("Thread is registered as SD thread; rendering SD table", {
            currentThreadId
        });
        sdTable(threads);
    } else {
        if (Object.keys(threads).length === 0) {
            log.info("No known threads stored yet; showing first-start popup", {
                currentThreadId
            });
            addSdPopup(currentThreadId);
        }
        log.info("Thread not registered; showing SD thread options", {
            currentThreadId
        });
        addSdOptions(currentThreadId);
    }
}
