import {sdInquiry} from '../types/types';

export type PendingOperation = {
    id:string; threadId:string; created:number; kind:'send'|'forum';
    villageId?:number; amount?:number; leftAmount?:number;
    requestId?:string;
    message?:string; knownPostIds?:string[]; inquiries?:sdInquiry[]; packages?:[string,string][];
};
const PREFIX = 'standdeff-organizer:pending:';
export function createPendingOperation(value: Omit<PendingOperation,'id'|'created'>): PendingOperation {
    const operation = {...value, id:typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`, created:Date.now()};
    localStorage.setItem(PREFIX + operation.id, JSON.stringify(operation));
    return operation;
}
export function readPendingOperations(): PendingOperation[] {
    const operations: PendingOperation[] = [];
    for (let i=0;i<localStorage.length;i++) {
        const key = localStorage.key(i)!;
        if (!key.startsWith(PREFIX)) continue;
        try { const operation=JSON.parse(localStorage.getItem(key)!); if (operation.id && /^\d+$/.test(operation.threadId) && ['send','forum'].includes(operation.kind)) operations.push(operation); } catch {}
    }
    return operations.sort((a,b) => a.created - b.created);
}
export function discardPendingOperation(id:string) { localStorage.removeItem(PREFIX + id); }

// Applied while replaying the journal, so concurrent sends add instead of replacing snapshots.
export function applyConfirmedOperation(data:any, operation:PendingOperation) {
    const thread = data.threads?.[operation.threadId];
    if (!thread) return;
    const packages = new Map<string,string>(thread.packagesSent ?? []);
    if (operation.kind === 'send') {
        const row = (Array.isArray(thread.stateOfSdTable) ? thread.stateOfSdTable : []).find(([id]:[number,unknown]) => id === operation.villageId)?.[1];
        if (!row || (operation.requestId && String(row.sdId) !== operation.requestId)) {
            thread.unresolvedPackages = [...(thread.unresolvedPackages ?? []), [`Dorf ${operation.villageId}, Anfrage ${operation.requestId ?? '?'}`,String(operation.amount)]];
            return;
        }
        const current = packages.get(String(row.sdId));
        if (current !== 'done') {
            const total = (Number(current) || 0) + (operation.amount ?? 0);
            packages.set(String(row.sdId), total >= (operation.leftAmount ?? row.leftAmount) ? 'done' : String(total));
        }
    } else {
        const reported = new Map(operation.packages ?? []);
        reported.forEach((amount,id) => {
            const current = packages.get(id);
            if (current === amount) packages.delete(id);
            else if (current !== 'done' && amount !== 'done') {
                const remaining = (Number(current) || 0) - Number(amount);
                if (remaining > 0) packages.set(id,String(remaining));
            }
        });
        const sentDrafts = new Set((operation.inquiries ?? []).map(row => JSON.stringify(row)));
        thread.bunkerInquiryCache = (thread.bunkerInquiryCache ?? []).filter((row:sdInquiry) => !sentDrafts.has(JSON.stringify(row)));
    }
    thread.packagesSent = Array.from(packages);
}
