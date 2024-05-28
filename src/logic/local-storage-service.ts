import {generalSettings, groupData, LocalStorageData, rowSdTable, sdInquiry, ThreadData, Threads} from "../types/types";


export class LocalStorageService {
    private _localStorageData: LocalStorageData;
    private static instance: LocalStorageService;

    constructor() {
        const initData = localStorage.getItem("standdeff-organizer");
        if (initData !== null) {
            this._localStorageData = JSON.parse(initData);
            return;
        }
        this._localStorageData = {
            generalSettings: {
                newThread: false,
                firstStartPopup: true,
                automateMassenUt: false,
                sdGroupId: "0",
                groupData: []
            },
            threads: {}
        }
        this.storeDataInLocalStorage(this._localStorageData);
    }

    private isStringValidJson(str: string) {
        try {
            JSON.parse(str);
        } catch (e) {
            console.error("Error parsing string to JSON: " + str);
            return false;
        }
        return true;
    }

    private storeDataInLocalStorage(data: LocalStorageData) {
        console.log("storing data in local storage")
console.log(data)
        let test = JSON.stringify(data);
        try{
            localStorage.setItem("standdeff-organizer", test);
        }catch(e){
            console.error("Error storing data in LocalStorage: " + e);
        }

    }

    private updateFromLocalStorage() {
        let data: string | null = localStorage.getItem("standdeff-organizer");
        if (data === null) {
            console.error("No data found in LocalStorage for key: " + "standdeff-organizer");
        }
        if (data !== null && this.isStringValidJson(data)) {
            this._localStorageData = JSON.parse(data);
        }
    }

    public static getInstance(): LocalStorageService {
        if (!LocalStorageService.instance) {
            LocalStorageService.instance = new LocalStorageService();
        }
        return LocalStorageService.instance;
    }


    // generalSettings getter and setter
    public get getNewThread(): boolean {
        this.updateFromLocalStorage();
        return this._localStorageData.generalSettings.newThread;
    }

    public set setNewThread(value: boolean) {
        this._localStorageData.generalSettings.newThread = value;
        this.storeDataInLocalStorage(this._localStorageData);
    }

    public get getFirstStartPopup(): boolean {
        this.updateFromLocalStorage();
        return this._localStorageData.generalSettings.firstStartPopup;
    }

    public set setFirstStartPopup(value: boolean) {
        this._localStorageData.generalSettings.firstStartPopup = value;
        this.storeDataInLocalStorage(this._localStorageData);
    }

    public get getAutomateMassenUt(): boolean {
        this.updateFromLocalStorage();
        return this._localStorageData.generalSettings.automateMassenUt;
    }

    public set setAutomateMassenUt(value: boolean) {
        this._localStorageData.generalSettings.automateMassenUt = value;
        this.storeDataInLocalStorage(this._localStorageData);
    }

    public get getSdGroupId(): string {
        this.updateFromLocalStorage();
        return this._localStorageData.generalSettings.sdGroupId;
    }

    public set setSdGroupId(value: string) {
        this._localStorageData.generalSettings.sdGroupId = value;
        this.storeDataInLocalStorage(this._localStorageData);
    }

    public get getGroupData(): groupData[] {
        this.updateFromLocalStorage();
        return this._localStorageData.generalSettings.groupData;
    }

    public set setGroupData(value: groupData[]) {
        this._localStorageData.generalSettings.groupData = value;
        this.storeDataInLocalStorage(this._localStorageData);
    }

    // threads getter and setter
    public getThreadData(id: string): ThreadData | undefined {
        this.updateFromLocalStorage();
        return this._localStorageData.threads[id];
    }

    public setThreadData(id: string, value: ThreadData) {
        this._localStorageData.threads[id] = value;
        this.storeDataInLocalStorage(this._localStorageData);
    }

    public get getAllThreads(): Threads {
        this.updateFromLocalStorage();
        return this._localStorageData.threads;
    }

    public addThread(id:string, value: ThreadData) {
        this._localStorageData.threads[id] = value;
        this.storeDataInLocalStorage(this._localStorageData);

    }

    public deleteThread(id: string) {
        delete this._localStorageData.threads[id];
        this.storeDataInLocalStorage(this._localStorageData);
    }

    public getSdInquiry(id: string): sdInquiry[] {
        this.updateFromLocalStorage();
        return this._localStorageData.threads[id].bunkerInquiryCache;
    }

    public setSdInquiry(id: string, value: sdInquiry[]) {
        this._localStorageData.threads[id].bunkerInquiryCache = value;
        this.storeDataInLocalStorage(this._localStorageData);
    }

    public getSdPostId(id: string): string {
        this.updateFromLocalStorage();
        return this._localStorageData.threads[id].sdPostId;
    }

    public getSdTableState(id: string): Map<number, rowSdTable> {
        return this._localStorageData.threads[id].stateOfSdTable;
    }

    public setSdTableState(id: string, value: Map<number, rowSdTable>) {
        console.log("setting sd table state")
        console.log(value)
        this._localStorageData.threads[id].stateOfSdTable = value;
        console.log(this._localStorageData)
        this.storeDataInLocalStorage(this._localStorageData);
    }


}
