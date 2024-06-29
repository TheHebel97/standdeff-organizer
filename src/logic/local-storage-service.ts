import {groupData, rowSdTable, sdInquiry, ThreadData, Threads,templateData} from "../types/types";
import {LocalStorageData} from "../types/localStorageTypes";


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
                sortBy: "",
                selectedTemplate: "",
                templateData: [],
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
        try {
            localStorage.setItem("standdeff-organizer", test);
        } catch (e) {
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

    public get getSortBy(): string {
        this.updateFromLocalStorage();
        return this._localStorageData.generalSettings.sortBy;
    }

    public set setSortBy(value: string) {
        this._localStorageData.generalSettings.sortBy = value;
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

    public get getTemplateData(): templateData[] {
        this.updateFromLocalStorage();
        return this._localStorageData.generalSettings.templateData;
    }

    public set setTemplateData(value: templateData[]) {
        this._localStorageData.generalSettings.templateData = value;
        this.storeDataInLocalStorage(this._localStorageData);
    }

    public get getSelectedTemplate(): string {
        this.updateFromLocalStorage();
        return this._localStorageData.generalSettings.selectedTemplate;
    }

    public set setSelectedTemplate(value: string) {
        this._localStorageData.generalSettings.selectedTemplate = value;
        this.storeDataInLocalStorage(this._localStorageData);
    }

    public getThreadData(id: string): ThreadData | undefined {
        this.updateFromLocalStorage();
        let lsThreadData = this._localStorageData.threads[id];
        if (!lsThreadData) {
            return undefined;
        }
        return {
            threadName: lsThreadData.threadName,
            forumName: lsThreadData.forumName,
            forumId: lsThreadData.forumId,
            sdPostId: lsThreadData.sdPostId,
            bunkerInquiryCache: lsThreadData.bunkerInquiryCache,
            stateOfSdTable: new Map(lsThreadData.stateOfSdTable),
            packagesSent: new Map(lsThreadData.packagesSent),
            updatedPostIds: lsThreadData.updatedPostIds
        };
    }

    public setThreadData(id: string, value: ThreadData) {
        // Convert the Map to an Array before storing it
        let stateOfSdTable = Array.from(value.stateOfSdTable.entries());
        let packagesSent = Array.from(value.packagesSent.entries());
        this._localStorageData.threads[id] = {
            threadName: value.threadName,
            forumName: value.forumName,
            forumId: value.forumId,
            sdPostId: value.sdPostId,
            bunkerInquiryCache: value.bunkerInquiryCache,
            stateOfSdTable: stateOfSdTable,
            packagesSent: packagesSent,
            updatedPostIds: value.updatedPostIds
        };
        this.storeDataInLocalStorage(this._localStorageData);
    }

    public get getAllThreads(): Threads {
        this.updateFromLocalStorage();
        let threads: Threads = {};
        for (let id in this._localStorageData.threads) {
            let lsThreadData = this._localStorageData.threads[id];
            if (lsThreadData) {
                // Convert the Array back to a Map when retrieving it
                let stateOfSdTable = new Map(lsThreadData.stateOfSdTable);
                let packagesSent = new Map(lsThreadData.packagesSent);
                // Create a new ThreadData object with the converted data
                threads[id] = {
                    threadName: lsThreadData.threadName,
                    forumName: lsThreadData.forumName,
                    forumId: lsThreadData.forumId,
                    sdPostId: lsThreadData.sdPostId,
                    bunkerInquiryCache: lsThreadData.bunkerInquiryCache,
                    stateOfSdTable: stateOfSdTable,
                    packagesSent: packagesSent,
                    updatedPostIds: lsThreadData.updatedPostIds
                };
            }
        }
        return threads;
    }

    public addThread(id: string, value: ThreadData) {
        // Convert the Map to an Array before storing it
        let stateOfSdTable = Array.from(value.stateOfSdTable.entries());
        let packagesSent = Array.from(value.packagesSent.entries());
        this._localStorageData.threads[id] = {
            threadName: value.threadName,
            forumName: value.forumName,
            forumId: value.forumId,
            sdPostId: value.sdPostId,
            bunkerInquiryCache: value.bunkerInquiryCache,
            stateOfSdTable: stateOfSdTable,
            packagesSent: packagesSent,
            updatedPostIds: value.updatedPostIds
        };
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

    public setSdTableState(id: string, value: Map<number, rowSdTable>) {
        this._localStorageData.threads[id].stateOfSdTable = Array.from(value.entries());
        this.storeDataInLocalStorage(this._localStorageData);
    }

    public getSdTableState(id: string): Map<number, rowSdTable> {
        this.updateFromLocalStorage();
        return new Map(this._localStorageData.threads[id].stateOfSdTable);
    }

    public setPackagesSent(id: string, value: Map<string, string>) {
        this._localStorageData.threads[id].packagesSent = Array.from(value.entries());
        this.storeDataInLocalStorage(this._localStorageData);
    }

    public getPackagesSent(id: string): Map<string, string> {
        this.updateFromLocalStorage();
        return new Map(this._localStorageData.threads[id].packagesSent);
    }

}
