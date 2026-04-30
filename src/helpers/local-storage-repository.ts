import {LocalStorageData} from "../types/localStorageTypes";
import {Log} from "./logging-helper";

const log = Log.scope("storage-repository");
const STORAGE_KEY = "standdeff-organizer";

export class StandDeffStorageRepository {
    public readonly storageKey = STORAGE_KEY;

    public load(): string | null {
        try {
            return localStorage.getItem(this.storageKey);
        } catch (error) {
            log.error("Failed to load data from localStorage", error);
            return null;
        }
    }

    public save(data: LocalStorageData) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            log.error("Failed to save data into localStorage", error);
            throw error;
        }
    }

    public clear() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            log.error("Failed to clear data from localStorage", error);
            throw error;
        }
    }
}
