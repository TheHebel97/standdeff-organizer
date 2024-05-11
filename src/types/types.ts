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
    bunkerInquiryCache: sdInquiry[];
    stateOfSdTable: sdTableState;
    packagesSent: packages;
    updatedPostIds: string[];

}

export type sdInquiry = {
    coords: string;
    amount: number;
    playerName: string | undefined;
    comment: string | undefined;
    dateFrom: number | undefined;
    dateUntil: number | undefined;
}

export type newInquiry = Map<string, sdInquiry>

export type sdState = [sdTableState, string[]]

export type sdTableState = Map<string, rowSdTable>

export type rowSdTable = {
    villageId: number,
    sdId: string;
    startAmount: number;
    leftAmount: number;
    playerName: string;
    comment: string;
    dateFrom: number;
    dateUntil: number;
}

export type packages = Map<string, string>


export type coordinates = `${number}|${number}`;

export type postData = {
    inquiries: newInquiry,
    packages: packages,
}

export type updateData = Map<string, postData> //inquiries, packages, postIds




