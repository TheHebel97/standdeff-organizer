import {ThreadData} from "../types/types";
import {lsThreadData} from "../types/localStorageTypes";

export function serializeThreadData(value: ThreadData): lsThreadData {
    return {
        threadName: value.threadName,
        forumName: value.forumName,
        forumId: value.forumId,
        sdPostId: value.sdPostId,
        bunkerInquiryCache: value.bunkerInquiryCache,
        stateOfSdTable: Array.from(value.stateOfSdTable.entries()),
        packagesSent: Array.from(value.packagesSent.entries()),
        updatedPostIds: value.updatedPostIds
    };
}

export function deserializeThreadData(value: lsThreadData): ThreadData {
    return {
        threadName: value.threadName,
        forumName: value.forumName,
        forumId: value.forumId,
        sdPostId: value.sdPostId,
        bunkerInquiryCache: value.bunkerInquiryCache,
        stateOfSdTable: new Map(value.stateOfSdTable),
        packagesSent: new Map(value.packagesSent),
        updatedPostIds: value.updatedPostIds
    };
}
