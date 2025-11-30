import {sdInquiry} from "./types";

export type LocalStorageData = {
    generalSettings: generalSettings,
    threads: lsThreads
}

export type generalSettings = {
    newThread: boolean,
    firstStartPopup: boolean,
    automateMassenUt: boolean,
    sdGroupId: string,
    sortBy: string,
    selectedTemplate: string,
    preventDuplicateDestination: boolean,
    templateData: templateData[],
    groupData: groupData[]
}
export type groupData = {
    id: string;
    name: string;
}
export type templateData = {
    id: string;
    name: string;
}
export type lsThreads = {
    [threadId: string]: lsThreadData
}

export type lsThreadData = {
    threadName: string;
    forumName: string;
    forumId: string;
    sdPostId: string;
    bunkerInquiryCache: sdInquiry[];
    stateOfSdTable: lsSdTableState;
    packagesSent: lsPackages;
    updatedPostIds: string[];

}

export type lsSdTableState = Array<[number, rowSdTable]> //villageId, rowSdTable

export type rowSdTable = {
    coords: string,
    sdId: string;
    startAmount: number;
    leftAmount: number;
    playerName: string;
    comment: string;
    dateFrom: string;
    dateUntil: string;
}

export type lsPackages = Array<[string, string]> //internalSdId, amount
