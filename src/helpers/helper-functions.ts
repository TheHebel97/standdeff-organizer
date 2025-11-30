import {rowSdTable, ThreadData, Threads} from "../types/types";
import {LocalStorageHelper} from "./local-storage-helper";
import {Log} from "./logging-helper";

export function addThreadIdToLocalStorage(currentThreadId: string | null, postId: string | null, threadName: string | null, forumName: string | null, forumId: string | null) {
    const localStorageService = LocalStorageHelper.getInstance();

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
                stateOfSdTable: new Map<number, rowSdTable>(),
                packagesSent: new Map<string, string>(),
                updatedPostIds: []
            }

            localStorageService.addThread(currentThreadId, threadData);
        } else {
            Log.error("thread id is already in thread ids")
            return;
        }
    } else {
        if (currentThreadId === null) {
            Log.error("current thread id is null")
        }
        if (postId === null) {
            Log.error("post id is null")
        }
        if (threadName === null) {
            Log.error("thread name is null")
        }
        if (forumName === null) {
            Log.error("forum name is null")
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

export function parseGermanDate(dateStr:string) {
    if (!dateStr || typeof dateStr !== "string") return 0;

    // Erwartetes Format: "DD.MM.YYYY HH:MM"
    const [d, t] = dateStr.split(" ");
    const [day, month, year] = d.split(".").map(Number);
    const [hour, minute] = t.split(":").map(Number);

    // gültiges Date-Objekt erzeugen → richtig interpretiert
    return new Date(year, month - 1, day, hour, minute).getTime();
}






