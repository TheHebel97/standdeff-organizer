import {groupData, rowSdTable, templateData, ThreadData} from "../types/types";
import {LocalStorageHelper} from "../helpers/local-storage-helper";
import {Log} from "../helpers/logging-helper";
import {distanceXY, villageBBCodeToCoordinates} from "../helpers/tw-helper";
import {parseGermanDate} from "../helpers/helper-functions";
import {PageContext} from "../helpers/script-context";

const log = Log.scope("mass-ut");

type MassUtPageState = {
    refererThreadId: string | null;
    destinationVillageId: string | null;
    automateMassenUt: boolean;
    preventDuplicateDestination: boolean;
    selectedTemplate: string;
    threadData?: ThreadData;
};

type MassUtDerivedState = {
    sendingObj?: rowSdTable;
    alreadySentAmount: number;
    packagesToSend: number;
    epochDateFrom: number;
    epochDateUntil: number;
};

function summarizeThreadData(threadId: string, threadData: ThreadData) {
    return {
        threadId,
        threadName: threadData.threadName,
        forumId: threadData.forumId,
        sdPostId: threadData.sdPostId,
        bunkerInquiryCount: threadData.bunkerInquiryCache.length,
        sdRowCount: threadData.stateOfSdTable.size,
        packageCount: threadData.packagesSent.size
    };
}

function summarizeSendingRow(destinationVillageId: string | null, sendingObj: rowSdTable | undefined, alreadySentAmount: number, packagesToSend: number) {
    return {
        destinationVillageId,
        sdId: sendingObj?.sdId ?? null,
        coords: sendingObj?.coords ?? null,
        leftAmount: sendingObj?.leftAmount ?? null,
        alreadySentAmount,
        packagesToSend,
        dateFrom: sendingObj?.dateFrom ?? "",
        dateUntil: sendingObj?.dateUntil ?? ""
    };
}

export function displayMassUt(pageContext: PageContext) {
    log.info("Initializing mass-ut controller", {href: window.location.href});
    storeGroupData();
    storeTemplateData();

    const localStorageService = LocalStorageHelper.getInstance();
    const pageState = readPageState(pageContext, localStorageService);

    log.state("Mass-ut route params", {
        refererThreadId: pageState.refererThreadId,
        destinationVillageId: pageState.destinationVillageId,
        automateMassenUt: pageState.automateMassenUt,
        preventDuplicateDestination: pageState.preventDuplicateDestination
    });

    if (pageState.refererThreadId === null) {
        log.info("No sdTableId present; only caching groups and templates on this page");
        return;
    }

    renderGroupLinks(pageState.refererThreadId);

    if (!pageState.threadData) {
        log.warn("No thread data found for sdTableId", {refererThreadId: pageState.refererThreadId});
        return;
    }
    log.state("Loaded thread data snapshot", summarizeThreadData(pageState.refererThreadId, pageState.threadData));

    applyTemplateSelection(pageState);

    const derivedState = deriveState(pageState);
    if (!derivedState.sendingObj) {
        log.warn("No SD row found for destination village", {
            refererThreadId: pageState.refererThreadId,
            destinationVillageId: pageState.destinationVillageId
        });
        return;
    }

    renderAutoSelection(pageState, derivedState, localStorageService);
    bindEvents(pageState, derivedState, localStorageService);
}

function readPageState(pageContext: PageContext, localStorageService: LocalStorageHelper): MassUtPageState {
    const refererThreadId = pageContext.query.sdTableId ?? null;
    return {
        refererThreadId,
        destinationVillageId: pageContext.targetVillageId,
        automateMassenUt: localStorageService.getAutomateMassenUt,
        preventDuplicateDestination: localStorageService.getPreventDuplicateDestination,
        selectedTemplate: localStorageService.getSelectedTemplate,
        threadData: refererThreadId ? localStorageService.getThreadData(refererThreadId) : undefined
    };
}

function deriveState(pageState: MassUtPageState): MassUtDerivedState {
    const sendingObj = pageState.threadData?.stateOfSdTable.get(Number(pageState.destinationVillageId));
    const alreadySentAmount = sendingObj
        ? parseInt(String(pageState.threadData?.packagesSent.get(sendingObj.sdId)), 10) || 0
        : 0;
    let packagesToSend = sendingObj ? sendingObj.leftAmount - alreadySentAmount : 0;
    const epochDateUntil = parseGermanDate(sendingObj?.dateUntil ?? "");
    const epochDateFrom = parseGermanDate(sendingObj?.dateFrom ?? "");

    if ((alreadySentAmount > 0 && pageState.preventDuplicateDestination) || packagesToSend < 0) {
        packagesToSend = 0;
    }

    return {
        sendingObj,
        alreadySentAmount,
        packagesToSend,
        epochDateFrom,
        epochDateUntil
    };
}

function renderGroupLinks(refererThreadId: string) {
    $(".group-menu-item").each(function () {
        const currentHref = $(this).attr("href");
        if (!currentHref) {
            return;
        }
        const newHref = new URL(currentHref, window.location.origin);
        newHref.searchParams.set("sdTableId", refererThreadId);
        $(this).attr("href", newHref.toString());
    });
}

function applyTemplateSelection(pageState: MassUtPageState) {
    if (!pageState.automateMassenUt) {
        return;
    }

    let matchingTemplateFound = false;
    $("select[name='template'] > option").each(function () {
        const optionValue = $(this).val();
        if (!optionValue) {
            return;
        }
        const optionObj = JSON.parse(String(optionValue));
        if (optionObj.id === pageState.selectedTemplate) {
            $(this).prop("selected", true);
            matchingTemplateFound = true;
            return false;
        }
    });
    log.info("Template auto-selection completed", {
        selectedTemplate: pageState.selectedTemplate,
        matchingTemplateFound
    });
}

function renderAutoSelection(pageState: MassUtPageState, derivedState: MassUtDerivedState, localStorageService: LocalStorageHelper) {
    let {sendingObj, alreadySentAmount, packagesToSend, epochDateFrom, epochDateUntil} = derivedState;
    if (!sendingObj) {
        return;
    }

    log.info("Computed sending target", summarizeSendingRow(pageState.destinationVillageId, sendingObj, alreadySentAmount, packagesToSend));
    log.state("Date window for package selection", {
        dateFrom: epochDateFrom > 0 ? new Date(epochDateFrom).toISOString() : null,
        dateUntil: epochDateUntil > 0 ? new Date(epochDateUntil).toISOString() : null
    });

    $(".unit_checkbox").each(function () {
        if (!$(this).is(":checked")) {
            $(this).trigger("click");
        }
    });

    if ($(".troop-request-selector").length < packagesToSend && epochDateFrom === 0 && epochDateUntil === 0) {
        log.info("Using select-all because available rows are fewer than requested packages", {
            availableRows: $(".troop-request-selector").length,
            packagesToSend
        });
        $("#place_call_select_all").trigger("click");
    } else {
        const slowestUnitLfz = localStorageService.getSwordLfz * 60 * 1000;
        const currentTime = Date.now();
        $(".call-village").each(function (index) {
            if (packagesToSend <= 0) {
                return;
            }

            const sourceCoords = villageBBCodeToCoordinates($(this).find("a").text().trim());
            const destinationCoords = villageBBCodeToCoordinates(sendingObj.coords);
            const distance = Number(distanceXY(sourceCoords, destinationCoords).toFixed(3));
            const travelTime = distance * slowestUnitLfz;
            const arrival = currentTime + travelTime;

            const fromIsSet = epochDateFrom > 0;
            const untilIsSet = epochDateUntil > 0;
            const withinFrom = fromIsSet ? arrival >= epochDateFrom : true;
            const withinUntil = untilIsSet ? arrival <= epochDateUntil : true;

            log.trace("Evaluated candidate village", {
                index,
                sourceCoords,
                destinationCoords,
                distance,
                arrivalIso: new Date(arrival).toISOString(),
                fromIso: fromIsSet ? new Date(epochDateFrom).toISOString() : null,
                untilIso: untilIsSet ? new Date(epochDateUntil).toISOString() : null,
                withinFrom,
                withinUntil,
                packagesRemainingBeforeSelection: packagesToSend
            });

            if (withinFrom && withinUntil) {
                $(this).find(".troop-request-selector").trigger("click");
                packagesToSend--;
            }
        });
    }

    derivedState.packagesToSend = packagesToSend;
    log.info("Auto-selection completed", {
        checkedBoxes: $(".troop-request-selector:checked").length,
        packagesRemainingAfterSelection: packagesToSend
    });

    $("#place_call_form_submit").prop("disabled", true);
    $(".evt-button-fill").css("background", "#0e7a0e");
}

function bindEvents(pageState: MassUtPageState, derivedState: MassUtDerivedState, localStorageService: LocalStorageHelper) {
    if (!pageState.refererThreadId || !pageState.threadData || !derivedState.sendingObj) {
        return;
    }
    const refererThreadId = pageState.refererThreadId;
    const threadData = pageState.threadData;
    const sendingObj = derivedState.sendingObj;

    $(".evt-button-fill").on("click", function () {
        $(this).prop("disabled", true);
        $("#place_call_form_submit").prop("disabled", false);
        $("#place_call_form_submit").css("background", "#0e7a0e");
        log.info("User confirmed auto-filled selection", {
            checkedBoxes: $(".troop-request-selector:checked").length
        });
    });

    $("#place_call_form_submit").on("click", function () {
        const checkedBoxes = $(".troop-request-selector:checked").length;
        const currentStored = threadData.packagesSent.get(sendingObj.sdId);
        if (String(currentStored ?? "").toLowerCase() !== "done") {
            const previous = parseInt(String(currentStored), 10) || 0;
            const newTotal = previous + checkedBoxes;
            const leftAmount = sendingObj.leftAmount ?? 0;
            threadData.packagesSent.set(sendingObj.sdId, newTotal >= leftAmount ? "done" : String(newTotal));
        }

        localStorageService.setThreadData(refererThreadId, threadData);
        log.info("Persisted sent package delta", {
            refererThreadId,
            sdId: sendingObj.sdId,
            checkedBoxes,
            previousStoredValue: currentStored ?? null,
            newStoredValue: threadData.packagesSent.get(sendingObj.sdId) ?? null
        });
    });
}

function storeGroupData() {
    const groupEntries: groupData[] = [];
    const localStorageService = LocalStorageHelper.getInstance();

    $(".vis_item").find(".group-menu-item").each(function () {
        const groupId = $(this).attr("data-group-id");
        const groupName = $(this).text().trim().slice(1, -1);
        if (groupId !== undefined && groupName !== undefined) {
            groupEntries.push({id: groupId, name: groupName});
            return;
        }
        log.error("Group id or group name is undefined");
    });

    localStorageService.setGroupData = groupEntries;
    log.info("Cached mass-ut group data", {groupCount: groupEntries.length});
}

function storeTemplateData() {
    const optionArray: templateData[] = [];
    const localStorageService = LocalStorageHelper.getInstance();

    $("select[name='template'] > option").each(function () {
        if ($(this).val() === "") {
            return;
        }
        const optionValue = String($(this).val());
        const optionObj = JSON.parse(optionValue);
        optionArray.push({id: optionObj.id, name: optionObj.name});
    });

    localStorageService.setTemplateData = optionArray;
    log.info("Cached mass-ut template data", {templateCount: optionArray.length});
}
