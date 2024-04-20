import {sdSettings, groupData, LocalStorageData, requestData} from "../types/types";


class LocalStorageService {
    private _data: LocalStorageData;

    constructor(private storage: Storage) {
        this._data = this.getDataFromLocalStorage('localStorageData') || this.initializeDefaultData();
    }

    get newThread(): boolean {
        this.loadDataFromLocalStorage();
        return this._data.newThread;
    }

    set newThread(value: boolean) {
        this._data.newThread = value;
        this.updateLocalStorage();
    }

    get settings(): sdSettings {
        this.loadDataFromLocalStorage();
        return this._data.settings;
    }

    set settings(value: sdSettings) {
        this._data.settings = value;
        this.updateLocalStorage();
    }

    get groupData(): groupData[] {
        this.loadDataFromLocalStorage();
        return this._data.groupData;
    }

    set groupData(value: groupData[]) {
        this._data.groupData = value;
        this.updateLocalStorage();
    }


    private getDataFromLocalStorage(key: string): LocalStorageData | null {
        const data = this.storage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    private updateLocalStorage(): void {
        this.storage.setItem('localStorageData', JSON.stringify(this._data));
    }

    private loadDataFromLocalStorage(): void {
        const data = this.getDataFromLocalStorage('localStorageData') || this.initializeDefaultData();
        this._data = data;
    }

    private initializeDefaultData(): LocalStorageData {
        return {
            newThread: false,
            settings: {firstStartPopup: false, automateMassenUt: false, sdGroupId: ''},
            groupData: [],
            threads: {}
        };
    }
}
