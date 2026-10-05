import {ThreadData} from "../types/types";
import {lsThreadData} from "../types/localStorageTypes";
import {normalizeDateEpoch} from './date-helper';

export function normalizeStoredThread(raw: unknown): lsThreadData {
    const value: any = raw && typeof raw === 'object' ? raw : {};
    const pairs = (source: any): any[] => Array.isArray(source) ? source.filter(entry => Array.isArray(entry) && entry.length === 2) : [];
    const text = (source: any) => typeof source === 'string' ? source : '';
    return {
        threadName:text(value.threadName), forumName:text(value.forumName), forumId:text(value.forumId), sdPostId:text(value.sdPostId),
        bunkerInquiryCache: (Array.isArray(value.bunkerInquiryCache) ? value.bunkerInquiryCache : []).filter((row: any) => row && /^\d{3}\|\d{3}$/.test(row.coords)).map((row: any) => ({
            coords:row.coords, amount:Number.isSafeInteger(row.amount) && row.amount > 0 ? row.amount : 0,
            playerName:text(row.playerName), comment:text(row.comment), dateFrom:normalizeDateEpoch(row.dateFrom), dateUntil:normalizeDateEpoch(row.dateUntil)
        })),
        stateOfSdTable: pairs(value.stateOfSdTable).filter(([id,row]) => Number.isSafeInteger(id) && id > 0 && row && /^\d+$/.test(String(row.sdId)) && Number.isFinite(row.leftAmount) && Number.isFinite(row.startAmount)),
        packagesSent: pairs(value.packagesSent).filter(([id,amount]) => /^\d+$/.test(String(id)) && (/^done$/i.test(String(amount)) || /^\d+$/.test(String(amount)))).map(([id,amount]) => [String(id),String(amount).toLowerCase()]),
        updatedPostIds: Array.isArray(value.updatedPostIds) ? value.updatedPostIds.filter((id: any) => typeof id === 'string') : [],
        unresolvedPackages:pairs(value.unresolvedPackages)
    };
}

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
        , unresolvedPackages: value.unresolvedPackages ?? []
    };
}

export function deserializeThreadData(value: lsThreadData): ThreadData {
    value = normalizeStoredThread(value);
    return {
        threadName: value.threadName,
        forumName: value.forumName,
        forumId: value.forumId,
        sdPostId: value.sdPostId,
        bunkerInquiryCache: value.bunkerInquiryCache,
        stateOfSdTable: new Map(value.stateOfSdTable),
        packagesSent: new Map(value.packagesSent),
        updatedPostIds: value.updatedPostIds
        , unresolvedPackages: value.unresolvedPackages ?? []
    };
}
