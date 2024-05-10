import {parseReturn, sdInquiry, ThreadData, Threads} from "../../types/types";
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

export function parseSdPosts(): parseReturn {
    const localStorageService = LocalStorageService.getInstance();
    const urlParams = new URLSearchParams(window.location.search);
    const currentThreadId = urlParams.get("thread_id") || "";
    const sdPostId = localStorageService.getSdPostId(currentThreadId);


    let coordVilIdMap = new Map<string, number>();
    let packagesSent = new Map<string, string>();
    let inquiries = new Map<string, sdInquiry>();
    let postIds: string[] = [];

    //parse all village links on page to get the village id and store into map
    $(".village_anchor").each((index, element) => {
        const coordsMatch = /(\d{3}\|\d{3})\)\sK/
        const possibleCoords = $(element).text().trim().split("(");
        const coords = possibleCoords[possibleCoords.length - 1].match(coordsMatch)?.[1];
        const villageId = $(element).attr("data-id");
        if (coords && villageId) {
            coordVilIdMap.set(coords, parseInt(villageId));
        } else {
            console.error("coords or village id is undefined")
        }
    });

    // Get the post container
    const newInquiryRegex = /(\d{3}\|\d{3})\)\sK\d+\s+(\d+)\s+["|“](.+)?["|“](.+)?["|“](\d+)?["|“](\d+)?/; // hier die anführungszeichen für mac hinzufügen todo:
    const packagesSentRegex = /(\d+)\s(\d+|done)/; // evtl noch optimieren todo:
    $(".post").each((index, element) => {

        let finished = false; // for skipping the signature
        if ($(element).find("a").first().attr("name") === sdPostId) { // or already updated and not deleted todo:
            return; // skip sd thread id
        }
        const postId = $(element).find("a").first().attr("name")||"";
        const postContent = $(element).find(".text").text();
        const postContentSplit = postContent.split("\n");


        postContentSplit.forEach((line, index) => {
            if (finished || line === "______________________________") {
                finished = true;
                return;
            }

            let inquiryMatch = line.match(newInquiryRegex);
            let packagesMatch = line.match(packagesSentRegex);
            if (inquiryMatch) {

                if (!coordVilIdMap.has(inquiryMatch[1])) {
                    console.error("coords not found in map")
                }
                const villageId = coordVilIdMap.get(inquiryMatch[1]) || 0;

                let sdInquiry: sdInquiry = {
                    coords: inquiryMatch[1],
                    amount: parseInt(inquiryMatch[2]),
                    playerName: inquiryMatch[3],
                    comment: inquiryMatch[4],
                    dateFrom: inquiryMatch[5] ? parseInt(inquiryMatch[5]) : undefined,
                    dateUntil: inquiryMatch[6] ? parseInt(inquiryMatch[6]) : undefined
                }
                inquiries.set(villageId.toString(), sdInquiry);
            } else if (packagesMatch) {
                if (packagesSent.has(packagesMatch[1])) {
                    let oldVal = packagesSent.get(packagesMatch[1]);
                    if (oldVal === "done" || oldVal === undefined) {
                        return;
                    }
                    let newVal = parseInt(oldVal) + parseInt(packagesMatch[2]);
                    packagesSent.set(packagesMatch[1], newVal.toString());
                    return;
                }
                packagesSent.set(packagesMatch[1], packagesMatch[2]);

            }
        })
        postIds.push(postId);


    });
    return [inquiries, packagesSent, postIds];
}




