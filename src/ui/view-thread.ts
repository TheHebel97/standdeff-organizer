import {registerSdThread, readSdPostId} from "../helpers/thread-registration";
import {addSdOptions} from "./components/options-sd-thread";
import {sdTable} from "./components/sd-table";
import { Threads} from "../types/types";
import {LocalStorageHelper} from "../helpers/local-storage-helper";
import {Log} from "../helpers/logging-helper";
import {PageContext} from "../helpers/script-context";
import {getThreadIdFromContext, isKnownSdThread} from "../helpers/thread-guards";
import {addForumQuickSettings} from "./components/forum-quick-settings";

const log = Log.scope("view-thread");

type ViewThreadPageState = {
    currentThreadId: string;
    threads: Threads;
};

type ViewThreadDerivedState = {
    hasPendingNewThreadMarker: boolean;
    isKnownThread: boolean;
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
    addSdOptions(pageState.currentThreadId,pageContext.forumId,()=>viewThread(pageContext),derivedState.isKnownThread);

    const createdTitle = sessionStorage.getItem('sd-created-title');
    const currentTitle = $('.clearfix > table').first().find('h2').text().trim();
    const existingThreads:string[]=JSON.parse(sessionStorage.getItem('sd-created-existing') ?? '[]');
    if (!derivedState.isKnownThread && readSdPostId()) {
        if (registerSdThread(currentThreadId, pageContext.forumId)) {
            if (!existingThreads.includes(currentThreadId) && derivedState.hasPendingNewThreadMarker && createdTitle === currentTitle) {
                localStorageService.setNewThread = false;
                sessionStorage.removeItem('sd-created-title');
                sessionStorage.removeItem('sd-created-existing');
            }
            pageState = readPageState(pageContext, localStorageService);
            derivedState = deriveState(pageContext, pageState, localStorageService);
        }
    }

    log.state("Known thread ids in localStorage", {
        currentThreadId: pageState.currentThreadId,
        knownThreadIds: Object.keys(pageState.threads),
        knownThreadCount: Object.keys(pageState.threads).length
    });

    addSdOptions(pageState.currentThreadId, pageContext.forumId, () => viewThread(pageContext), derivedState.isKnownThread);

    if (derivedState.isKnownThread) {
        localStorageService.setBunkerImportTargetThreadId = pageState.currentThreadId;
        log.info("Thread is registered as SD thread; rendering SD table", {
            currentThreadId: pageState.currentThreadId
        });
        sdTable(pageContext, pageState.threads);
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
        hasPendingNewThreadMarker: localStorageService.getNewThread || !!sessionStorage.getItem('sd-created-title'),
        isKnownThread: isKnownSdThread(pageState.threads, pageContext)
    };
}
