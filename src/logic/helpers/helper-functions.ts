import {ThreadData, Threads} from "../../types/types";
import {LocalStorageService} from "../local-storage-service";


// export function storeDataInLocalStorage<T>(data: T, key: string) {
//     let newData: any;
//     const type = typeof data;
//     if (type === undefined) {
//         console.error("Error storing data in GM: data is undefined");
//         return;
//     }
//     if (type === "object" || Array.isArray(data)) {
//         newData = JSON.stringify(data);
//     }
//     if (type === "string" || type === "number" || type === "boolean") {
//         newData = data;
//     }
//     localStorage.setItem(key, newData);
// }
//
// export function getDataFromLocalStorage<T>(key: string): T {
//
//     const storedData: string | null = localStorage.getItem(key);
//     let result: T;
//     if (storedData === null) {
//         console.error("Error getting data from GM: data is null");
//         return undefined as unknown as T;
//     }
//
//     return isStringValidJson(storedData) ? JSON.parse(storedData) : storedData as T;
// }

export function addThreadIdToLocalStorage(currentThreadId: string | null, postId: string | null, threadName: string | null, forumName: string | null, forumId: string | null) {
    const localStorageService = LocalStorageService.getInstance();

    let threads: Threads = localStorageService.getAllThreads;

    if (currentThreadId !== null && postId !== null && threadName !== null && forumName !== null && forumId !== null) {
        const existingThread = threads[currentThreadId]!==undefined;
        if (!existingThread) {
            let threadData : ThreadData = {
                threadName: threadName,
                forumName: forumName,
                forumId: forumId,
                sdPostId: postId,
                activeBunkerInquiry: [],
                stateOfSdTable: [],
                packetSent: []
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

//private helper functions
function isStringValidJson(str: string) {
    try {
        JSON.parse(str);
    } catch (e) {
        console.error("Error parsing string to JSON: " + str);
        return false;
    }
    return true;
}

