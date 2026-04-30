import {
    addThreadIdToLocalStorage,
} from "../helpers/helper-functions";
import {addSdOptions} from "./components/options-sd-thread";
import {addSdPopup} from "./components/first-start-thread-popup";
import {sdTable} from "./components/sd-table";
import { Threads} from "../types/types";
import {LocalStorageHelper} from "../helpers/local-storage-helper";
import {Log} from "../helpers/logging-helper";
import {PageContext} from "../helpers/script-context";
import {getThreadIdFromContext, isKnownSdThread, shouldShowFirstStartPopup} from "../helpers/thread-guards";

const log = Log.scope("view-thread");

type ViewThreadPageState = {
    currentThreadId: string;
    threads: Threads;
};

type ViewThreadDerivedState = {
    hasPendingNewThreadMarker: boolean;
    isKnownThread: boolean;
    shouldShowPopup: boolean;
};

export function viewThread(pageContext: PageContext) {
    const localStorageService = LocalStorageHelper.getInstance();
    const currentThreadId = getThreadIdFromContext(pageContext);
    log.info("Initializing view-thread controller", {
        currentThreadId,
        href: window.location.href
    });

    const pageState = readPageState(pageContext, localStorageService);
    const derivedState = deriveState(pageContext, pageState, localStorageService);

    if (derivedState.hasPendingNewThreadMarker) {
        log.info("Detected pending new-thread marker");
        localStorageService.setNewThread = false;
        const edit_post_id: string | undefined = $(".post > a").attr("name")
        const thread_name: string | null = $(".clearfix > table").first().find("h2").text();
        const forum_name: string | null = $(".forum-container").find(".selected").text().trim();
        const forum_id: string | null = pageContext.forumId;
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

    log.state("Known thread ids in localStorage", {
        currentThreadId: pageState.currentThreadId,
        knownThreadIds: Object.keys(pageState.threads),
        knownThreadCount: Object.keys(pageState.threads).length
    });

    if (derivedState.isKnownThread) {
        log.info("Thread is registered as SD thread; rendering SD table", {
            currentThreadId: pageState.currentThreadId
        });
        sdTable(pageContext, pageState.threads);
    } else {
        if (derivedState.shouldShowPopup) {
            log.info("No known threads stored yet; showing first-start popup", {
                currentThreadId: pageState.currentThreadId
            });
            addSdPopup(pageState.currentThreadId, pageContext.forumId);
        }
        log.info("Thread not registered; showing SD thread options", {
            currentThreadId: pageState.currentThreadId
        });
        addSdOptions(pageState.currentThreadId, pageContext.forumId);
    }
}

function readPageState(pageContext: PageContext, localStorageService: LocalStorageHelper): ViewThreadPageState {
    return {
        currentThreadId: getThreadIdFromContext(pageContext),
        threads: localStorageService.getAllThreads
    };
}

function deriveState(pageContext: PageContext, pageState: ViewThreadPageState, localStorageService: LocalStorageHelper): ViewThreadDerivedState {
    return {
        hasPendingNewThreadMarker: localStorageService.getNewThread,
        isKnownThread: isKnownSdThread(pageState.threads, pageContext),
        shouldShowPopup: shouldShowFirstStartPopup(pageState.threads)
    };
}
