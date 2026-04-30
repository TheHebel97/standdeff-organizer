import {groupData, rowSdTable, templateData, ThreadData} from "../types/types";
import {LocalStorageHelper} from "../helpers/local-storage-helper";
import {Log} from "../helpers/logging-helper";
import {distanceXY, villageBBCodeToCoordinates} from "../helpers/tw-helper";
import {parseGermanDate} from "../helpers/helper-functions";

const log = Log.scope("mass-ut");

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

export function displayMassUt() {
    log.info("Initializing mass-ut controller", {href: window.location.href});
    storeGroupData();
    storeTemplateData();

    const localStorageService = LocalStorageHelper.getInstance();
    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    const refererThreadId = urlParams.get("sdTableId");
    const destinationVillageId = urlParams.get("target");
    const automateMassenUt = localStorageService.getAutomateMassenUt;
    const preventDuplicateDestination = localStorageService.getPreventDuplicateDestination;

    log.state("Mass-ut route params", {
        refererThreadId,
        destinationVillageId,
        automateMassenUt,
        preventDuplicateDestination
    });

    if (refererThreadId === null) {
        log.info("No sdTableId present; only caching groups and templates on this page");
        return;
    }

    $(".group-menu-item").each(function () {
        const currentHref = $(this).attr("href");
        if (!currentHref) {
            return;
        }
        const newHref = new URL(currentHref, window.location.origin);
        newHref.searchParams.set("sdTableId", refererThreadId);
        $(this).attr("href", newHref.toString());
    });

    const threadData = localStorageService.getThreadData(refererThreadId);
    if (!threadData) {
        log.warn("No thread data found for sdTableId", {refererThreadId});
        return;
    }
    log.state("Loaded thread data snapshot", summarizeThreadData(refererThreadId, threadData));

    const selectedTemplate = localStorageService.getSelectedTemplate;
    if (automateMassenUt) {
        let matchingTemplateFound = false;
        $("select[name='template'] > option").each(function () {
            const optionValue = $(this).val();
            if (!optionValue) {
                return;
            }
            const optionObj = JSON.parse(String(optionValue));
            if (optionObj.id === selectedTemplate) {
                $(this).prop("selected", true);
                matchingTemplateFound = true;
                return false;
            }
        });
        log.info("Template auto-selection completed", {
            selectedTemplate,
            matchingTemplateFound
        });
    }

    const sendingObj = threadData.stateOfSdTable.get(Number(destinationVillageId));
    if (!sendingObj) {
        log.warn("No SD row found for destination village", {
            refererThreadId,
            destinationVillageId
        });
        return;
    }

    const alreadySentAmount = parseInt(String(threadData.packagesSent.get(sendingObj.sdId)), 10) || 0;
    let packagesToSend = sendingObj.leftAmount - alreadySentAmount;
    const epochDateUntil = parseGermanDate(sendingObj.dateUntil);
    const epochDateFrom = parseGermanDate(sendingObj.dateFrom);

    if ((alreadySentAmount > 0 && preventDuplicateDestination) || packagesToSend < 0) {
        packagesToSend = 0;
    }

    log.info("Computed sending target", summarizeSendingRow(destinationVillageId, sendingObj, alreadySentAmount, packagesToSend));
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

            const fromIsSet = typeof epochDateFrom === "number" && epochDateFrom > 0;
            const untilIsSet = typeof epochDateUntil === "number" && epochDateUntil > 0;
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

    log.info("Auto-selection completed", {
        checkedBoxes: $(".troop-request-selector:checked").length,
        packagesRemainingAfterSelection: packagesToSend
    });

    $("#place_call_form_submit").prop("disabled", true);
    $(".evt-button-fill").css("background", "#0e7a0e");

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
