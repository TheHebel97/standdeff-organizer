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

    public load(): string | null {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null) { this.baseline = null; return null; }
        let data: any;
        try {
            data = JSON.parse(raw);
            if (!object(data)) throw new Error('Storage root is not an object');
        } catch {
            // Keep corrupt source for recovery before initializing defaults.
            localStorage.setItem(`${STORAGE_KEY}:backup:${Date.now()}`, raw);
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
        this.revision = 0;
        for (const [,change] of changes) {
            this.revision = Math.max(this.revision, change.revision);
            if (change.operation) applyConfirmedOperation(data, change.operation);
            for (const patch of change.patches) {
                if (!Array.isArray(patch.path) || !patch.path.length || patch.path.some(key => ['__proto__','constructor','prototype'].includes(key))) continue;
                let target = data;
                patch.path.slice(0,-1).forEach(key => { if (!object(target[key])) target[key] = {}; target = target[key]; });
                const key = patch.path[patch.path.length - 1];
                if (patch.remove) delete target[key]; else target[key] = clone(patch.value);
            }
        }
        this.baseline = clone(data);
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
            diff(this.baseline, data, []);
            if (!patches.length) return;
            const id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            localStorage.setItem(`${CHANGE_PREFIX}${id}`, JSON.stringify({revision:this.revision + 1, patches}));
        }
        this.baseline = clone(data);
        this.revision++;
    }

    public confirmOperation(operation:PendingOperation) {
        if (!localStorage.getItem(STORAGE_KEY)) throw new Error('SD Organizer Speicher fehlt.');
        this.load();
        const key = `${CHANGE_PREFIX}operation-${operation.id}`;
        if (localStorage.getItem(key)) return;
        localStorage.setItem(key, JSON.stringify({revision:this.revision + 1, patches:[], operation}));
    }

    public clear() {
        const keys: string[] = [];
        for (let i=0; i<localStorage.length; i++) { const key=localStorage.key(i)!; if (key === STORAGE_KEY || key.startsWith(CHANGE_PREFIX)) keys.push(key); }
        keys.forEach(key => localStorage.removeItem(key));
        this.baseline = null;
    }
}
