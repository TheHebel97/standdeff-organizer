import {normalizeDateEpoch} from "./date-helper";
import {rowSdTable, ThreadData, Threads} from "../types/types";
import {LocalStorageHelper} from "./local-storage-helper";
import {Log} from "./logging-helper";
import {hasValidThreadMetadata} from './thread-guards';

const log = Log.scope("helper-functions");

export function addThreadIdToLocalStorage(currentThreadId: string | null, postId: string | null, threadName: string | null, forumName: string | null, forumId: string | null): boolean {
    const localStorageService = LocalStorageHelper.getInstance();

    let threads: Threads = localStorageService.getAllThreads;

    if (currentThreadId !== null && postId !== null && threadName !== null && forumName !== null && forumId !== null) {
        const existingThread = hasValidThreadMetadata(threads[currentThreadId]);
        if (!existingThread) {
            let threadData: ThreadData = {
                threadName: threadName,
                forumName: forumName,
                forumId: forumId,
                sdPostId: postId,
                bunkerInquiryCache: [],
                stateOfSdTable: new Map<number, rowSdTable>(),
                packagesSent: new Map<string, string>(),
                updatedPostIds: []
            }

            try {
                localStorageService.addThread(currentThreadId, threadData);
            } catch (error) {
                log.error("Could not persist SD thread", error);
                return false;
            }
            log.info("Registered SD thread in localStorage", {
                currentThreadId,
                postId,
                threadName,
                forumName,
                forumId
            });
            return true;
        } else {
            return true;
        }
    } else {
        if (currentThreadId === null) {
            log.error("current thread id is null");
        }
        if (postId === null) {
            log.error("post id is null");
        }
        if (threadName === null) {
            log.error("thread name is null");
        }
        if (forumName === null) {
            log.error("forum name is null");
        }
        if (forumId === null) log.error("forum id is missing");
        return false;
    }
}

export {formatLocalDateInput as convertEpochToDate, normalizeDateEpoch as convertDateToEpoch} from "./date-helper";

export function parseGermanDate(dateStr: string): number {
    return normalizeDateEpoch(dateStr) * 1000;
}
