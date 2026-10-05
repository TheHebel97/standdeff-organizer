import {registerSdThread, readSdPostId} from "../helpers/thread-registration";
import {addSdOptions} from "./components/options-sd-thread";
import {addSdPopup} from "./components/first-start-thread-popup";
import {sdTable} from "./components/sd-table";
import { Threads} from "../types/types";
import {LocalStorageHelper} from "../helpers/local-storage-helper";
import {Log} from "../helpers/logging-helper";
import {PageContext} from "../helpers/script-context";
import {getThreadIdFromContext, isKnownSdThread, shouldShowFirstStartPopup} from "../helpers/thread-guards";
import {addForumQuickSettings} from "./components/forum-quick-settings";

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
    addForumQuickSettings(currentThreadId);

    let pageState = readPageState(pageContext, localStorageService);
    let derivedState = deriveState(pageContext, pageState, localStorageService);

    if (derivedState.hasPendingNewThreadMarker && readSdPostId()) {
        if (registerSdThread(currentThreadId, pageContext.forumId)) {
            localStorageService.setNewThread = false;
            pageState = readPageState(pageContext, localStorageService);
            derivedState = deriveState(pageContext, pageState, localStorageService);
        }
    }

    log.state("Known thread ids in localStorage", {
        currentThreadId: pageState.currentThreadId,
        knownThreadIds: Object.keys(pageState.threads),
        knownThreadCount: Object.keys(pageState.threads).length
    });

    if (derivedState.isKnownThread) {
        localStorageService.setBunkerImportTargetThreadId = pageState.currentThreadId;
        log.info("Thread is registered as SD thread; rendering SD table", {
            currentThreadId: pageState.currentThreadId
        });
        sdTable(pageContext, pageState.threads);
    } else {
        if (derivedState.shouldShowPopup) {
            log.info("No known threads stored yet; showing first-start popup", {
                currentThreadId: pageState.currentThreadId
            });
            addSdPopup(pageState.currentThreadId, pageContext.forumId, () => viewThread(pageContext));
        }
        log.info("Thread not registered; showing SD thread options", {
            currentThreadId: pageState.currentThreadId
        });
        addSdOptions(pageState.currentThreadId, pageContext.forumId, () => viewThread(pageContext));
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
