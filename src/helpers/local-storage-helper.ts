import {forumQuickSettingsPosition, groupData, rowSdTable, sdInquiry, ThreadData, Threads, templateData} from "../types/types";
import {LocalStorageData, lsThreadData} from "../types/localStorageTypes";
import {Log} from "./logging-helper";
import {StandDeffStorageRepository} from "./local-storage-repository";
import {deserializeThreadData, serializeThreadData} from "./local-storage-serializer";

export class LocalStorageHelper {
    private _localStorageData: LocalStorageData;
    private static instance: LocalStorageHelper;
    private readonly log = Log.scope("storage");
    private readonly repository = new StandDeffStorageRepository();

    constructor() {
        const initData = this.repository.load();
        if (initData !== null && this.isStringValidJson(initData)) {
            this._localStorageData = JSON.parse(initData);
            if (this._localStorageData.generalSettings.forumQuickSettingsPosition === undefined) {
                this._localStorageData.generalSettings.forumQuickSettingsPosition = null;
            }
            this.log.info("Loaded existing localStorage data", this.summarizeLocalStorageData(this._localStorageData));
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
                preventDuplicateDestination: true,
                swordLfz: 22,
                forumQuickSettingsPosition: null,
                templateData: [],
                groupData: []
            },
            threads: {}
        };
        this.log.info("Initialized localStorage with default values");
        this.storeDataInLocalStorage(this._localStorageData, "constructor:init-default");
    }

    private isStringValidJson(str: string) {
        try {
            JSON.parse(str);
        } catch (error) {
            this.log.error("Error parsing string to JSON", error);
            return false;
        }
        return true;
    }

    private summarizeThreadData(threadId: string, value: ThreadData | lsThreadData) {
        const sdRowCount = value.stateOfSdTable instanceof Map
            ? value.stateOfSdTable.size
            : value.stateOfSdTable.length;
        const packagesCount = value.packagesSent instanceof Map
            ? value.packagesSent.size
            : value.packagesSent.length;
        return {
            threadId,
            threadName: value.threadName,
            forumName: value.forumName,
            forumId: value.forumId,
            sdPostId: value.sdPostId,
            bunkerInquiryCount: value.bunkerInquiryCache.length,
            sdRowCount,
            packagesCount,
            updatedPostIdsCount: value.updatedPostIds.length
        };
    }

    private summarizeLocalStorageData(data: LocalStorageData) {
        const threadIds = Object.keys(data.threads);
        return {
            threadCount: threadIds.length,
            threadIds,
            generalSettings: {
                newThread: data.generalSettings.newThread,
                firstStartPopup: data.generalSettings.firstStartPopup,
                automateMassenUt: data.generalSettings.automateMassenUt,
                preventDuplicateDestination: data.generalSettings.preventDuplicateDestination,
                sdGroupId: data.generalSettings.sdGroupId,
                selectedTemplate: data.generalSettings.selectedTemplate,
                sortBy: data.generalSettings.sortBy,
                swordLfz: data.generalSettings.swordLfz,
                forumQuickSettingsPosition: data.generalSettings.forumQuickSettingsPosition ?? null,
                groupCount: data.generalSettings.groupData.length,
                templateCount: data.generalSettings.templateData.length
            }
        };
    }

    private getStoredThread(id: string): lsThreadData | undefined {
        return this._localStorageData.threads[id];
    }

    private storeDataInLocalStorage(data: LocalStorageData, reason: string) {
        this.log.debug("Persisting localStorage data", {
            reason,
            summary: this.summarizeLocalStorageData(data)
        });
        try {
            this.repository.save(data);
        } catch (error) {
            this.log.error("Error storing data in LocalStorage", error);
        }
    }

    private updateFromLocalStorage(reason: string) {
        const data = this.repository.load();
        if (data === null) {
            this.log.warn("No data found in LocalStorage", {storageKey: this.repository.storageKey, reason});
            return;
        }
        if (this.isStringValidJson(data)) {
            this._localStorageData = JSON.parse(data);
            this.log.trace("Refreshed localStorage cache", {
                reason,
                summary: this.summarizeLocalStorageData(this._localStorageData)
            });
        }
    }

    public static getInstance(): LocalStorageHelper {
        if (!LocalStorageHelper.instance) {
            LocalStorageHelper.instance = new LocalStorageHelper();
        }
        return LocalStorageHelper.instance;
    }

    public get getNewThread(): boolean {
        this.updateFromLocalStorage("getNewThread");
        return this._localStorageData.generalSettings.newThread;
    }

    public set setNewThread(value: boolean) {
        this._localStorageData.generalSettings.newThread = value;
        this.storeDataInLocalStorage(this._localStorageData, "setNewThread");
    }

    public get getFirstStartPopup(): boolean {
        this.updateFromLocalStorage("getFirstStartPopup");
        return this._localStorageData.generalSettings.firstStartPopup;
    }

    public set setFirstStartPopup(value: boolean) {
        this._localStorageData.generalSettings.firstStartPopup = value;
        this.storeDataInLocalStorage(this._localStorageData, "setFirstStartPopup");
    }

    public get getSortBy(): string {
        this.updateFromLocalStorage("getSortBy");
        return this._localStorageData.generalSettings.sortBy;
    }

    public set setSortBy(value: string) {
        this._localStorageData.generalSettings.sortBy = value;
        this.storeDataInLocalStorage(this._localStorageData, "setSortBy");
    }

    public get getAutomateMassenUt(): boolean {
        this.updateFromLocalStorage("getAutomateMassenUt");
        return this._localStorageData.generalSettings.automateMassenUt;
    }

    public set setAutomateMassenUt(value: boolean) {
        this._localStorageData.generalSettings.automateMassenUt = value;
        this.storeDataInLocalStorage(this._localStorageData, "setAutomateMassenUt");
    }

    public get getPreventDuplicateDestination(): boolean {
        this.updateFromLocalStorage("getPreventDuplicateDestination");
        return this._localStorageData.generalSettings.preventDuplicateDestination;
    }

    public set setPreventDuplicateDestination(value: boolean) {
        this._localStorageData.generalSettings.preventDuplicateDestination = value;
        this.storeDataInLocalStorage(this._localStorageData, "setPreventDuplicateDestination");
    }

    public get getSdGroupId(): string {
        this.updateFromLocalStorage("getSdGroupId");
        return this._localStorageData.generalSettings.sdGroupId;
    }

    public set setSdGroupId(value: string) {
        this._localStorageData.generalSettings.sdGroupId = value;
        this.storeDataInLocalStorage(this._localStorageData, "setSdGroupId");
    }

    public get getGroupData(): groupData[] {
        this.updateFromLocalStorage("getGroupData");
        return this._localStorageData.generalSettings.groupData;
    }

    public set setGroupData(value: groupData[]) {
        this._localStorageData.generalSettings.groupData = value;
        this.storeDataInLocalStorage(this._localStorageData, "setGroupData");
    }

    public get getSwordLfz(): number {
        this.updateFromLocalStorage("getSwordLfz");
        return this._localStorageData.generalSettings.swordLfz;
    }

    public set setSwordLfz(value: number) {
        this._localStorageData.generalSettings.swordLfz = value;
        this.storeDataInLocalStorage(this._localStorageData, "setSwordLfz");
    }

    public get getTemplateData(): templateData[] {
        this.updateFromLocalStorage("getTemplateData");
        return this._localStorageData.generalSettings.templateData;
    }

    public set setTemplateData(value: templateData[]) {
        this._localStorageData.generalSettings.templateData = value;
        this.storeDataInLocalStorage(this._localStorageData, "setTemplateData");
    }

    public get getForumQuickSettingsPosition(): forumQuickSettingsPosition | null {
        this.updateFromLocalStorage("getForumQuickSettingsPosition");
        return this._localStorageData.generalSettings.forumQuickSettingsPosition ?? null;
    }

    public set setForumQuickSettingsPosition(value: forumQuickSettingsPosition | null) {
        this._localStorageData.generalSettings.forumQuickSettingsPosition = value;
        this.storeDataInLocalStorage(this._localStorageData, "setForumQuickSettingsPosition");
    }

    public get getSelectedTemplate(): string {
        this.updateFromLocalStorage("getSelectedTemplate");
        return this._localStorageData.generalSettings.selectedTemplate;
    }

    public set setSelectedTemplate(value: string) {
        this._localStorageData.generalSettings.selectedTemplate = value;
        this.storeDataInLocalStorage(this._localStorageData, "setSelectedTemplate");
    }

    public getThreadData(id: string): ThreadData | undefined {
        this.updateFromLocalStorage(`getThreadData:${id}`);
        const storedThreadData = this.getStoredThread(id);
        if (!storedThreadData) {
            this.log.warn("Requested thread data for unknown thread", {threadId: id});
            return undefined;
        }
        const threadData = deserializeThreadData(storedThreadData);
        this.log.trace("Loaded thread data", this.summarizeThreadData(id, threadData));
        return threadData;
    }

    public setThreadData(id: string, value: ThreadData) {
        this._localStorageData.threads[id] = serializeThreadData(value);
        this.log.info("Updating thread data", this.summarizeThreadData(id, value));
        this.storeDataInLocalStorage(this._localStorageData, `setThreadData:${id}`);
    }

    public get getAllThreads(): Threads {
        this.updateFromLocalStorage("getAllThreads");
        const threads: Threads = {};
        for (const id in this._localStorageData.threads) {
            const storedThreadData = this._localStorageData.threads[id];
            if (storedThreadData) {
                threads[id] = deserializeThreadData(storedThreadData);
            }
        }
        this.log.trace("Loaded all threads", {
            threadCount: Object.keys(threads).length,
            threadIds: Object.keys(threads)
        });
        return threads;
    }

    public addThread(id: string, value: ThreadData) {
        this._localStorageData.threads[id] = serializeThreadData(value);
        this.log.info("Adding thread to localStorage", this.summarizeThreadData(id, value));
        this.storeDataInLocalStorage(this._localStorageData, `addThread:${id}`);
    }

    public deleteThread(id: string) {
        if (!this._localStorageData.threads[id]) {
            this.log.warn("Tried to delete unknown thread", {threadId: id});
            return;
        }
        delete this._localStorageData.threads[id];
        this.log.info("Deleted thread from localStorage", {threadId: id});
        this.storeDataInLocalStorage(this._localStorageData, `deleteThread:${id}`);
    }

    public getSdInquiry(id: string): sdInquiry[] {
        this.updateFromLocalStorage(`getSdInquiry:${id}`);
        const threadData = this.getStoredThread(id);
        if (!threadData) {
            this.log.warn("Requested bunker inquiries for unknown thread", {threadId: id});
            return [];
        }
        return threadData.bunkerInquiryCache;
    }

    public setSdInquiry(id: string, value: sdInquiry[]) {
        const threadData = this.getStoredThread(id);
        if (!threadData) {
            this.log.warn("Tried to update bunker inquiries for unknown thread", {threadId: id});
            return;
        }
        threadData.bunkerInquiryCache = value;
        this.log.info("Updated bunker inquiries", {
            threadId: id,
            bunkerInquiryCount: value.length
        });
        this.storeDataInLocalStorage(this._localStorageData, `setSdInquiry:${id}`);
    }

    public getSdPostId(id: string): string {
        this.updateFromLocalStorage(`getSdPostId:${id}`);
        const threadData = this.getStoredThread(id);
        if (!threadData) {
            this.log.warn("Requested sdPostId for unknown thread", {threadId: id});
            return "";
        }
        return threadData.sdPostId;
    }

    public setSdTableState(id: string, value: Map<number, rowSdTable>) {
        const threadData = this.getStoredThread(id);
        if (!threadData) {
            this.log.warn("Tried to update SD table state for unknown thread", {threadId: id});
            return;
        }
        threadData.stateOfSdTable = Array.from(value.entries());
        this.log.info("Updated SD table state", {
            threadId: id,
            rowCount: value.size
        });
        this.storeDataInLocalStorage(this._localStorageData, `setSdTableState:${id}`);
    }

    public getSdTableState(id: string): Map<number, rowSdTable> {
        this.updateFromLocalStorage(`getSdTableState:${id}`);
        const threadData = this.getStoredThread(id);
        if (!threadData) {
            this.log.warn("Requested SD table state for unknown thread", {threadId: id});
            return new Map<number, rowSdTable>();
        }
        return new Map(threadData.stateOfSdTable);
    }

    public setPackagesSent(id: string, value: Map<string, string>) {
        const threadData = this.getStoredThread(id);
        if (!threadData) {
            this.log.warn("Tried to update sent packages for unknown thread", {threadId: id});
            return;
        }
        threadData.packagesSent = Array.from(value.entries());
        this.log.info("Updated sent packages", {
            threadId: id,
            packageCount: value.size
        });
        this.storeDataInLocalStorage(this._localStorageData, `setPackagesSent:${id}`);
    }

    public resetPackagesSent(id: string) {
        const threadData = this.getStoredThread(id);
        if (!threadData) {
            this.log.warn("Tried to reset sent packages for unknown thread", {threadId: id});
            return;
        }
        threadData.packagesSent = [];
        this.log.info("Reset sent packages", {
            threadId: id,
            packageCount: 0
        });
        this.storeDataInLocalStorage(this._localStorageData, `resetPackagesSent:${id}`);
    }

    public getPackagesSent(id: string): Map<string, string> {
        this.updateFromLocalStorage(`getPackagesSent:${id}`);
        const threadData = this.getStoredThread(id);
        if (!threadData) {
            this.log.warn("Requested sent packages for unknown thread", {threadId: id});
            return new Map<string, string>();
        }
        return new Map(threadData.packagesSent);
    }
}
