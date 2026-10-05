import {LocalStorageData} from "../types/localStorageTypes";
import {applyConfirmedOperation, PendingOperation} from './pending-operation';

const STORAGE_KEY = 'standdeff-organizer';
const CHANGE_PREFIX = `${STORAGE_KEY}:change:`;
type Patch = {path: string[]; value?: unknown; remove?: boolean};
type Change = {revision: number; patches: Patch[]; operation?:PendingOperation};
const clone = (value: any) => JSON.parse(JSON.stringify(value));
const object = (value: unknown): value is Record<string, any> => !!value && typeof value === 'object' && !Array.isArray(value);

// Each change owns a unique key. Independent tab writes cannot overwrite one another.
// Concurrent changes of the SAME field use revision + unique ID order (last writer wins).
export class StandDeffStorageRepository {
    public readonly storageKey = STORAGE_KEY;
    private baseline: any = null;
    private revision = 0;
    private signature = '';
    private loadedKeys:string[]=[];

    public load(): string | null {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null) { this.baseline = null; return null; }
        const keys:string[]=[];
        for (let i=0;i<localStorage.length;i++) { const key=localStorage.key(i)!; if (key.startsWith(CHANGE_PREFIX)) keys.push(key); }
        const signature=raw + keys.sort().join(',');
        if (this.baseline && signature === this.signature) return JSON.stringify(this.baseline);
        let data: any;
        try {
            data = JSON.parse(raw);
            if (!object(data)) throw new Error('Storage root is not an object');
        } catch {
            // Keep corrupt source for recovery before initializing defaults.
            localStorage.setItem(`${STORAGE_KEY}:backup:${Date.now()}`, raw);
            sessionStorage.setItem('sd-storage-recovered','1');
            this.baseline = null;
            return null;
        }
        if (Number(data.schemaVersion ?? 1) > 2) throw new Error('SD Organizer: neuere Speicherversion; bitte Skript aktualisieren.');
        const changes: [string, Change][] = [];
        for (let index = 0; index < localStorage.length; index++) {
            const key = localStorage.key(index)!;
            if (!key.startsWith(CHANGE_PREFIX)) continue;
            try {
                const change = JSON.parse(localStorage.getItem(key)!);
                if (!Number.isSafeInteger(change.revision) || !Array.isArray(change.patches)) continue;
                changes.push([key, change]);
            } catch { /* Ignore incomplete journal entries; never overwrite them. */ }
        }
        changes.sort((a,b) => a[1].revision - b[1].revision || a[0].localeCompare(b[0]));
        this.loadedKeys=changes.map(([key])=>key);
        this.revision = Number(data.journalRevision) || 0;
        const applied=new Set<string>(Array.isArray(data.appliedChanges) ? data.appliedChanges : []);
        const confirmed=new Set<string>(Array.isArray(data.confirmedOperations) ? data.confirmedOperations : []);
        for (const [changeKey,change] of changes) {
            this.revision = Math.max(this.revision, change.revision);
            if (applied.has(changeKey)) continue;
            if (change.operation && !confirmed.has(change.operation.id)) {
                applyConfirmedOperation(data, change.operation);
                confirmed.add(change.operation.id);
            }
            for (const patch of change.patches) {
                if (!Array.isArray(patch.path) || !patch.path.length || patch.path.some(key => ['__proto__','constructor','prototype'].includes(key))) continue;
                let target = data;
                patch.path.slice(0,-1).forEach(key => { if (!object(target[key])) target[key] = {}; target = target[key]; });
                const key = patch.path[patch.path.length - 1];
                if (key === 'stateOfSdTable' && Array.isArray(patch.value)) {
                    const oldRows=new Map<number,any>(Array.isArray(target.stateOfSdTable) ? target.stateOfSdTable : []);
                    const nextRows=new Map<number,any>(patch.value as any);
                    const sent=new Map<string,string>(Array.isArray(target.packagesSent) ? target.packagesSent : []);
                    const nextSent=new Map<string,string>();
                    oldRows.forEach((row,village) => { const next=nextRows.get(village); const amount=sent.get(String(row.sdId)); if (next && amount !== undefined) nextSent.set(String(next.sdId),amount); });
                    const oldIds=new Set(Array.from(oldRows.values(),row=>String(row.sdId)));
                    const unresolved=Array.from(sent).filter(([id])=>!oldIds.has(id));
                    target.unresolvedPackages=[...(target.unresolvedPackages ?? []),...unresolved];
                    target.packagesSent=Array.from(nextSent);
                }
                if (patch.remove) delete target[key]; else target[key] = clone(patch.value);
            }
        }
        data.confirmedOperations=Array.from(confirmed);
        this.baseline = clone(data);
        this.signature=signature;
        return JSON.stringify(data);
    }

    public save(data: LocalStorageData) {
        if (this.baseline === null) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } else {
            const patches: Patch[] = [];
            const diff = (old: any, next: any, path: string[]) => {
                if (JSON.stringify(old) === JSON.stringify(next)) return;
                if (object(old) && object(next)) {
                    new Set([...Object.keys(old), ...Object.keys(next)]).forEach(key => diff(old[key], next[key], [...path,key]));
                } else patches.push(next === undefined ? {path,remove:true} : {path,value:next});
            };
            ['schemaVersion','generalSettings','threads'].forEach(key=>diff(this.baseline[key], (data as any)[key], [key]));
            // A table migration remaps the LIVE package state when replayed, never a stale snapshot.
            const changedTables=new Set(patches.filter(p=>p.path[2] === 'stateOfSdTable').map(p=>p.path[1]));
            for (let i=patches.length-1;i>=0;i--) {
                if (changedTables.has(patches[i].path[1]) && ['packagesSent','unresolvedPackages'].includes(patches[i].path[2])) patches.splice(i,1);
            }
            if (!patches.length) return;
            const id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            localStorage.setItem(`${CHANGE_PREFIX}${id}`, JSON.stringify({revision:this.revision + 1, patches}));
        }
        this.baseline = clone(data);
        this.revision++;
        this.signature='';
        if (typeof navigator.locks?.request === 'function') {
            const count=Object.keys(localStorage).filter(key=>key.startsWith(CHANGE_PREFIX)).length;
            if (count >= 100) void this.compact().catch(error=>console.error('[SD Organizer] Journal bleibt erhalten:',error));
        }
    }

    public confirmOperation(operation:PendingOperation) {
        if (!localStorage.getItem(STORAGE_KEY)) throw new Error('SD Organizer Speicher fehlt.');
        this.load();
        if (this.baseline?.confirmedOperations?.includes(operation.id)) return;
        const key = `${CHANGE_PREFIX}operation-${operation.id}`;
        if (localStorage.getItem(key)) return;
        localStorage.setItem(key, JSON.stringify({revision:this.revision + 1, patches:[], operation}));
    }

    public async compact():Promise<boolean> {
        if (typeof navigator.locks?.request !== 'function') return false;
        return navigator.locks.request('sd-organizer-journal-compaction', () => {
            const data=JSON.parse(this.load() ?? 'null');
            if (!data) return false;
            const keys=this.loadedKeys.slice();
            data.appliedChanges=keys;
            data.journalRevision=this.revision;
            // Write the complete snapshot FIRST. New changes have unique keys and remain replayable.
            localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
            keys.forEach(key=>localStorage.removeItem(key));
            this.signature='';
            return true;
        });
    }

    public clear() {
        const keys: string[] = [];
        for (let i=0; i<localStorage.length; i++) { const key=localStorage.key(i)!; if (key === STORAGE_KEY || key.startsWith(CHANGE_PREFIX)) keys.push(key); }
        keys.forEach(key => localStorage.removeItem(key));
        this.baseline = null;
    }
}
