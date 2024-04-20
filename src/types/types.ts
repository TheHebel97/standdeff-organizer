import {Unit} from "./tw-types";

export interface VillageData {
    coords?: string;
    spear?: number;
    sword?: number;
    archer?: number;
    axe?: number;
    spy?: number;
    light?: number;
    marcher?: number;
    heavy?: number;
    ram?: number;
    catapult?: number;
    knight?: number;
    snob?: number;
}

export interface QueueEntry {
    id: string;
    url: string;
    scanPages: boolean;
}

export interface HandleResponseProps {
    total: number;
    queue: QueueEntry[];
    current: QueueEntry;
    mode: 'members_troops' | 'members_defense';
    includeMoving: boolean;
    csv: string;
    memberNames: { [id: string]: string };
}

export interface VillageScavengeData {
    unit_counts_home: UnitCounts;
    scavenges: Scavenges;
}

export interface UnitCounts {
    [unit: string]: number
}

export interface Scavenges {
    1: ScavengeTypes;
    2: ScavengeTypes;
    3: ScavengeTypes;
    4: ScavengeTypes;
}

export interface ScavengeTypes {
    is_locked: boolean;
    return_time: number;
    unit_counts?: UnitCounts;
}

export interface TroopsSummarised {
    unit_counts_home: UnitCounts;
    units_away_total: UnitCounts;
    units_total: UnitCounts;
}

export interface TwWorkbenchDataWithSendTime {
    origin_Village_Id: number;
    target_Village_Id: number;
    unit_Symbol: string;
    send_Time: number;
    arrival_Time: number;
    wb_Unit_Type_Id: number;
    units: Unit;
}

export interface TwScavengeBaseFactors {
    duration_exponent: number;
    duration_factor: number;
    duration_initial_seconds: number;
}

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
