import {Unit} from "./tw-types";




export type {generalSettings} from "./localStorageTypes";

export type forumQuickSettingsPosition = {
    left: number;
    top: number;
}
export type groupData = {
    id: string;
    name: string;
}

export type templateData = {
    id: string;
    name: string;
}

export type unitNumberMap = Record<Unit, number>;

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
    unresolvedPackages?: [string,string][];

}

export type sdInquiry = {
    coords: string;
    amount: number;
    playerName: string | undefined;
    comment: string | undefined;
    dateFrom: number | undefined;
    dateUntil: number | undefined;
}

export type newInquiry = Map<number, sdInquiry>  // villageId , sdInquiry

export type sdState = [sdTableState, string[]]

export type sdTableState = Map<number, rowSdTable> //villageId, rowSdTable

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

export type packages = Map<string, string> //internalSdId, amount

export type villageAnchorSource = {
    coords: string;
    villageId: number;
}

export type forumPostSource = {
    postId: string;
    lines: string[];
}

export type sdTableRowSource = {
    sdId: string;
    coordsText: string;
    startAmountText: string;
    leftAmountText: string;
    playerNameText: string;
    commentText: string;
    dateFromText: string;
    dateUntilText: string;
    villageHref: string;
}

export type sdTableRenderRow = {
    sdId: string;
    leftAmountText: string;
}


export type coordinates = `${number}|${number}`;

export type postData = {
    inquiries: newInquiry,
    packages: packages,
}

export type updateData = Map<string, postData> //inquiries, packages, postIds




