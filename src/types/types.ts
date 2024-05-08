import {Unit} from "./tw-types";


export type LocalStorageData = {
    generalSettings: generalSettings,
    threads: Threads
}

export type generalSettings = {
    newThread: boolean,
    firstStartPopup: boolean,
    automateMassenUt: boolean,
    sdGroupId: string,
    groupData: groupData[]
}
export type groupData = {
    id: string;
    name: string;
}

export type Threads = {
    [threadId: string]: ThreadData
}
export type ThreadData = {
    threadName: string;
    forumName: string;
    forumId: string;
    sdPostId: string;
    activeBunkerInquiry: sdInquiry[];
    stateOfSdTable: sdTableData;
    packages: packages;

}

export type sdInquiry = {
    coords: string;
    amount: number;
    playerName: string | undefined;
    comment: string | undefined;
    dateFrom: number | undefined;
    dateUntil: number | undefined;
}

export type sdTableData = {
    [internalId: string]: rowSdTable
}
export type rowSdTable = {
    internalId: number;
    coords: string;
    startAmount: number;
    leftAmount: number;
    playerName: string;
    comment: string;
    dateFrom: number;
    dateUntil: number;
}

export type packages = {
    [internalId: string]: packageSent

}
export type packageSent = {
    amount: number;
}




