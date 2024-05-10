import {ThreadData, Threads} from "../../types/types";
import {LocalStorageService} from "../local-storage-service";

export function addThreadIdToLocalStorage(currentThreadId: string | null, postId: string | null, threadName: string | null, forumName: string | null, forumId: string | null) {
    const localStorageService = LocalStorageService.getInstance();

    let threads: Threads = localStorageService.getAllThreads;

    if (currentThreadId !== null && postId !== null && threadName !== null && forumName !== null && forumId !== null) {
        const existingThread = threads[currentThreadId] !== undefined;
        if (!existingThread) {
            let threadData: ThreadData = {
                threadName: threadName,
                forumName: forumName,
                forumId: forumId,
                sdPostId: postId,
                bunkerInquiryCache: [],
                stateOfSdTable: {},
                packagesSent: new Map<string, string>(),
                updatedPostIds: []
            }

            localStorageService.addThread(currentThreadId, threadData);
        } else {
            console.error("thread id is already in thread ids")
            return;
        }
    } else {
        if (currentThreadId === null) {
            console.error("current thread id is null")
        }
        if (postId === null) {
            console.error("post id is null")
        }
        if (threadName === null) {
            console.error("thread name is null")
        }
        if (forumName === null) {
            console.error("forum name is null")
        }
        return;
    }
}

export function convertEpochToDate(epoch: number): string {
    // Convert the epoch to milliseconds and create a new Date object
    let date = new Date(epoch * 1000);
    // Format the date and time in the 'YYYY-MM-DDTHH:mm' format
    return date.toISOString().substring(0, 16);
}

export function convertDateToEpoch(date: string): number {
    // Create a new Date object from the date string
    let datetime = new Date(date);
    // Get the time in milliseconds and convert it to seconds
    return datetime.getTime() / 1000;
}






