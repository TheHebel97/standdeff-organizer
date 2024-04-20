import {Unit} from "./tw-types";

export interface requestData {
    coords: string;
    amount: number;
    playerName: string | undefined;
    comment: string | undefined;
    dateFrom: number | undefined;
    dateUntil: number | undefined;
}

export interface sdThreadData {
    threadId: string;
    editPostId: string;
    threadName: string;
    forumName: string;
    forumId: string;
}

export interface sdSettings {
    firstStartPopup: boolean;
    automateMassenUt: boolean;
    sdGroupId: string;
}

export interface groupData {
    id: string;
    name: string;
}

interface LocalStorageData {
    newThread: boolean;
    settings: sdSettings;
    groupData: groupData[];
}
