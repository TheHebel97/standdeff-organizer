import {groupData, rowSdTable, templateData, ThreadData} from "../types/types";
import {LocalStorageHelper} from "../helpers/local-storage-helper";
import {Log} from "../helpers/logging-helper";
import {distanceXY, villageBBCodeToCoordinates} from "../helpers/tw-helper";
import {parseGermanDate} from "../helpers/helper-functions";
import {PageContext} from "../helpers/script-context";
import {buildMassUtCallUrl} from "../helpers/game-url-helper";

const log = Log.scope("mass-ut");

type MassUtPageState = {
    refererThreadId: string | null;
    destinationVillageId: string | null;
    automateMassenUt: boolean;
    preventDuplicateDestination: boolean;
    sdGroupId: string;
    sortBy: string;
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

type RepeatSendTarget = {
    threadId: string;
    sendingObj: rowSdTable;
    returnUrl: string;
    matchedBy: "villageId" | "coords";
};

type MassUtTemplateDefinition = {
    id: string;
    name?: string;
    use_all?: string[];
    [key: string]: unknown;
};

type SupportSpeedInsights = {
    configuredSwordMsPerField: number;
    effectiveSwordMsPerField: number;
    speedModifier: number;
    boostPercent: number;
    sampleCount: number;
    isBoostActive: boolean;
};

type RowTravelTimeResolution = {
    travelTimeMs: number;
    distance: number;
    source: "displayedTemplateUnitTime" | "calculatedTemplateUnitTime" | "displayedDistance" | "coords";
    unit: string;
};

type CandidateSelectionEvaluation = {
    index: number;
    villageId: string;
    sourceCoords: string;
    distance: number;
    travelTimeHours: number;
    travelTimeSource: RowTravelTimeResolution["source"];
    slowestTemplateUnit: string;
    arrivalIso: string;
    fromIso: string | null;
    untilIso: string | null;
    withinFrom: boolean;
    withinUntil: boolean;
    selected: boolean;
    skipReason: "packages-exhausted" | "outside-window" | null;
    packagesRemainingBeforeSelection: number;
    packagesRemainingAfterSelection: number;
};

type TemplateTravelProfile = {
    templateId: string | null;
    templateName: string | null;
    usedUnits: string[];
    configuredSlowestUnit: string;
    configuredSlowestMinutesPerField: number;
};

const UNIT_MINUTES_PER_FIELD: Record<string, number> = {
    spear: 16,
    sword: 22,
    axe: 16,
    archer: 16,
    spy: 9,
    light: 10,
    marcher: 10,
    heavy: 11,
    ram: 30,
    catapult: 30,
    knight: 10,
    snob: 35
};

const DEFAULT_TRAVEL_UNIT = "sword";

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

function getConfiguredSwordMinutesPerField(localStorageService: LocalStorageHelper): number {
    const configuredSwordMinutesPerField = localStorageService.getSwordLfz;
    return configuredSwordMinutesPerField > 0 ? configuredSwordMinutesPerField : 22;
}

function getConfiguredUnitMinutesPerField(unit: string, configuredSwordMinutesPerField: number): number {
    const baseMinutesPerField = UNIT_MINUTES_PER_FIELD[unit];
    if (baseMinutesPerField === undefined) {
        return configuredSwordMinutesPerField;
    }
    return baseMinutesPerField * (configuredSwordMinutesPerField / 22);
}

function parseTemplateDefinition(rawValue: string): MassUtTemplateDefinition | null {
    if (rawValue.trim() === "") {
        return null;
    }
    try {
        return JSON.parse(rawValue) as MassUtTemplateDefinition;
    } catch (error) {
        log.warn("Failed to parse template option value", {
            rawValue,
            error
        });
        return null;
    }
}

function resolveSelectedTemplateDefinition(pageState: MassUtPageState): MassUtTemplateDefinition | null {
    const $templateSelect = $("select[name='template']");
    const selectedOptionValue = String($templateSelect.find("option:selected").val() ?? "").trim();
    const selectedTemplateFromDom = parseTemplateDefinition(selectedOptionValue);
    if (selectedTemplateFromDom) {
        return selectedTemplateFromDom;
    }

    if (pageState.selectedTemplate === "" || pageState.selectedTemplate === "0") {
        return null;
    }

    let matchingTemplate: MassUtTemplateDefinition | null = null;
    $templateSelect.find("option").each(function () {
        const optionValue = String($(this).val() ?? "").trim();
        const parsedTemplate = parseTemplateDefinition(optionValue);
        if (!parsedTemplate) {
            return;
        }
        if (String(parsedTemplate.id) === pageState.selectedTemplate) {
            matchingTemplate = parsedTemplate;
            return false;
        }
    });

    return matchingTemplate;
}

function resolveTemplateUsedUnits(templateDefinition: MassUtTemplateDefinition | null): string[] {
    if (!templateDefinition) {
        return [DEFAULT_TRAVEL_UNIT];
    }

    const usedUnits = new Set<string>();
    Object.keys(UNIT_MINUTES_PER_FIELD).forEach((unit) => {
        const configuredAmount = Number(templateDefinition[unit] ?? 0);
        if (!isNaN(configuredAmount) && configuredAmount !== 0) {
            usedUnits.add(unit);
        }
    });

    const useAllUnits = Array.isArray(templateDefinition.use_all) ? templateDefinition.use_all : [];
    useAllUnits.forEach((unit) => {
        if (UNIT_MINUTES_PER_FIELD[unit] !== undefined) {
            usedUnits.add(unit);
        }
    });

    if (usedUnits.size === 0) {
        usedUnits.add(DEFAULT_TRAVEL_UNIT);
    }

    return Array.from(usedUnits);
}

function resolveTemplateTravelProfile(pageState: MassUtPageState, localStorageService: LocalStorageHelper): TemplateTravelProfile {
    const configuredSwordMinutesPerField = getConfiguredSwordMinutesPerField(localStorageService);
    const templateDefinition = resolveSelectedTemplateDefinition(pageState);
    const usedUnits = resolveTemplateUsedUnits(templateDefinition);

    let configuredSlowestUnit = usedUnits[0] ?? DEFAULT_TRAVEL_UNIT;
    let configuredSlowestMinutesPerField = getConfiguredUnitMinutesPerField(configuredSlowestUnit, configuredSwordMinutesPerField);
    usedUnits.slice(1).forEach((unit) => {
        const configuredMinutesPerField = getConfiguredUnitMinutesPerField(unit, configuredSwordMinutesPerField);
        if (configuredMinutesPerField >= configuredSlowestMinutesPerField) {
            configuredSlowestUnit = unit;
            configuredSlowestMinutesPerField = configuredMinutesPerField;
        }
    });

    return {
        templateId: templateDefinition?.id ? String(templateDefinition.id) : null,
        templateName: templateDefinition?.name ? String(templateDefinition.name) : null,
        usedUnits,
        configuredSlowestUnit,
        configuredSlowestMinutesPerField
    };
}

function readCurrentTargetCoords(): string | null {
    const targetText = $("#place_target .village-name").first().text().trim();
    const coordsMatch = targetText.match(/(\d{3}\|\d{3})/);
    return coordsMatch?.[1] ?? null;
}

function parseDisplayedDistance(value: string): number {
    const normalizedValue = value.trim().replace(",", ".");
    const parsedValue = parseFloat(normalizedValue);
    return isNaN(parsedValue) ? 0 : parsedValue;
}

function parseTravelTimeTitleToMs(title: string): number {
    const timeMatch = title.match(/(\d+):(\d{2}):(\d{2})/);
    if (!timeMatch) {
        return 0;
    }

    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const seconds = parseInt(timeMatch[3], 10);
    if ([hours, minutes, seconds].some((value) => isNaN(value))) {
        return 0;
    }

    return (((hours * 60) + minutes) * 60 + seconds) * 1000;
}

function readDisplayedSwordTravelTimeMs($row: JQuery<HTMLElement>): number {
    const title = String($row.find("td[data-unit='sword']").attr("data-title") ?? "");
    return parseTravelTimeTitleToMs(title);
}

function readDisplayedUnitTravelTimeMs($row: JQuery<HTMLElement>, unit: string): number {
    const title = String($row.find(`td[data-unit='${unit}']`).attr("data-title") ?? "");
    return parseTravelTimeTitleToMs(title);
}

function readDisplayedRowDistance($row: JQuery<HTMLElement>): number {
    return parseDisplayedDistance(String($row.find("td").eq(1).text() ?? ""));
}

function resolveSupportSpeedInsights(localStorageService: LocalStorageHelper): SupportSpeedInsights {
    const configuredSwordMsPerField = getConfiguredSwordMinutesPerField(localStorageService) * 60 * 1000;
    const samples: number[] = [];

    $(".call-village").each(function () {
        const $row = $(this);
        const displayedDistance = readDisplayedRowDistance($row);
        const displayedSwordTravelTimeMs = readDisplayedSwordTravelTimeMs($row);

        if (displayedDistance <= 0 || displayedSwordTravelTimeMs <= 0) {
            return;
        }

        samples.push(displayedSwordTravelTimeMs / displayedDistance);
    });

    const effectiveSwordMsPerField = samples.length > 0
        ? samples.reduce((sum, sample) => sum + sample, 0) / samples.length
        : configuredSwordMsPerField;
    const speedModifier = configuredSwordMsPerField > 0
        ? effectiveSwordMsPerField / configuredSwordMsPerField
        : 1;
    const boostPercent = Math.max(0, (1 - speedModifier) * 100);
    const isBoostActive = Math.abs(speedModifier - 1) > 0.01;

    return {
        configuredSwordMsPerField,
        effectiveSwordMsPerField,
        speedModifier,
        boostPercent,
        sampleCount: samples.length,
        isBoostActive
    };
}

function resolveRowTemplateUnit(
    $row: JQuery<HTMLElement>,
    templateTravelProfile: TemplateTravelProfile,
    configuredSwordMinutesPerField: number,
): {unit: string; configuredMinutesPerField: number} {
    let resolvedUnit: string | null = null;
    let resolvedMinutesPerField = 0;

    templateTravelProfile.usedUnits.forEach((unit) => {
        const availableCount = parseInt(String($row.find(`td[data-unit='${unit}']`).attr("data-count") ?? "0"), 10);
        if (isNaN(availableCount) || availableCount <= 0) {
            return;
        }

        const configuredMinutesPerField = getConfiguredUnitMinutesPerField(unit, configuredSwordMinutesPerField);
        if (configuredMinutesPerField >= resolvedMinutesPerField) {
            resolvedUnit = unit;
            resolvedMinutesPerField = configuredMinutesPerField;
        }
    });

    if (resolvedUnit === null) {
        return {
            unit: templateTravelProfile.configuredSlowestUnit,
            configuredMinutesPerField: templateTravelProfile.configuredSlowestMinutesPerField
        };
    }

    return {
        unit: resolvedUnit,
        configuredMinutesPerField: resolvedMinutesPerField
    };
}

function resolveRowTravelTime(
    $row: JQuery<HTMLElement>,
    sendingObj: rowSdTable,
    supportSpeedInsights: SupportSpeedInsights,
    templateTravelProfile: TemplateTravelProfile,
): RowTravelTimeResolution {
    const rowTemplateUnit = resolveRowTemplateUnit(
        $row,
        templateTravelProfile,
        supportSpeedInsights.configuredSwordMsPerField / 60000,
    );
    const displayedTemplateUnitTravelTimeMs = readDisplayedUnitTravelTimeMs($row, rowTemplateUnit.unit);
    const displayedDistance = readDisplayedRowDistance($row);

    if (displayedTemplateUnitTravelTimeMs > 0 && displayedDistance > 0) {
        return {
            travelTimeMs: displayedTemplateUnitTravelTimeMs,
            distance: displayedDistance,
            source: "displayedTemplateUnitTime",
            unit: rowTemplateUnit.unit
        };
    }

    if (displayedDistance > 0) {
        return {
            travelTimeMs: displayedDistance * rowTemplateUnit.configuredMinutesPerField * 60 * 1000 * supportSpeedInsights.speedModifier,
            distance: displayedDistance,
            source: "calculatedTemplateUnitTime",
            unit: rowTemplateUnit.unit
        };
    }

    const sourceCoords = villageBBCodeToCoordinates($row.find("a").text().trim());
    const destinationCoords = villageBBCodeToCoordinates(sendingObj.coords);
    const coordinateDistance = Number(distanceXY(sourceCoords, destinationCoords).toFixed(3));
    return {
        travelTimeMs: coordinateDistance * rowTemplateUnit.configuredMinutesPerField * 60 * 1000 * supportSpeedInsights.speedModifier,
        distance: coordinateDistance,
        source: "coords",
        unit: rowTemplateUnit.unit
    };
}

function hasDateConstraint(row: rowSdTable): boolean {
    const dateFrom = String(row.dateFrom ?? "").trim();
    const dateUntil = String(row.dateUntil ?? "").trim();
    return (dateFrom !== "" && dateFrom !== "0") || (dateUntil !== "" && dateUntil !== "0");
}

function buildRepeatSendUrl(pageState: MassUtPageState, threadId: string, targetVillageId: string, sendingObj: rowSdTable): string {
    const nextUrl = new URL(buildMassUtCallUrl(targetVillageId), window.location.origin);
    nextUrl.searchParams.set("sdTableId", threadId);
    nextUrl.searchParams.set("dir", "0");

    if (pageState.automateMassenUt) {
        if (pageState.sdGroupId !== "" && pageState.sdGroupId !== "0") {
            nextUrl.searchParams.set("group", pageState.sdGroupId);
        }
        if (pageState.sortBy !== "" && pageState.sortBy !== "default") {
            nextUrl.searchParams.set("order", pageState.sortBy);
        }
    }

    if (hasDateConstraint(sendingObj)) {
        nextUrl.searchParams.set("order", "distance");
        nextUrl.searchParams.set("dir", "1");
    }

    return nextUrl.toString();
}

function resolveRepeatSendTarget(pageState: MassUtPageState, localStorageService: LocalStorageHelper): RepeatSendTarget | null {
    const targetVillageId = pageState.destinationVillageId;
    const targetCoords = readCurrentTargetCoords();
    const allThreads = localStorageService.getAllThreads;
    const matches: RepeatSendTarget[] = [];

    Object.entries(allThreads).forEach(([threadId, threadData]) => {
        if (targetVillageId) {
            const sendingObjByVillageId = threadData.stateOfSdTable.get(Number(targetVillageId));
            if (sendingObjByVillageId) {
                matches.push({
                    threadId,
                    sendingObj: sendingObjByVillageId,
                    returnUrl: buildRepeatSendUrl(pageState, threadId, targetVillageId, sendingObjByVillageId),
                    matchedBy: "villageId"
                });
                return;
            }
        }

        if (!targetCoords) {
            return;
        }

        const matchingEntryByCoords = Array.from(threadData.stateOfSdTable.entries()).find(([_, row]) => row.coords === targetCoords);
        if (!matchingEntryByCoords) {
            return;
        }
        const [matchedVillageId, sendingObjByCoords] = matchingEntryByCoords;
        matches.push({
            threadId,
            sendingObj: sendingObjByCoords,
            returnUrl: buildRepeatSendUrl(pageState, threadId, String(matchedVillageId), sendingObjByCoords),
            matchedBy: "coords"
        });
    });

    if (matches.length === 0) {
        log.info("No matching SD target found for repeat-send button", {
            targetVillageId,
            targetCoords
        });
        return null;
    }

    const preferredMatch = pageState.refererThreadId
        ? matches.find((match) => match.threadId === pageState.refererThreadId) ?? matches[0]
        : matches[0];

    if (matches.length > 1) {
        log.warn("Found multiple SD targets for repeat-send button; using first matching entry", {
            targetVillageId,
            targetCoords,
            preferredThreadId: preferredMatch.threadId,
            candidateThreadIds: matches.map((match) => match.threadId)
        });
    }

    return preferredMatch;
}

function renderRepeatSendButton(repeatSendTarget: RepeatSendTarget | null) {
    const $anchorButton = $(".evt-button-fill").first().length > 0
        ? $(".evt-button-fill").first()
        : $("#place_call_form_submit").first();

    if ($anchorButton.length === 0) {
        log.warn("No anchor button found for repeat-send button");
        return;
    }

    let $repeatButton = $("#sd-repeat-send-button");
    if ($repeatButton.length === 0) {
        $repeatButton = $('<input type="button" id="sd-repeat-send-button" class="btn" value="SD erneut schicken" style="margin-left: 8px;">');
        $anchorButton.after($repeatButton);
    }

    const isEnabled = repeatSendTarget !== null;
    $repeatButton.prop("disabled", !isEnabled)
        .css("opacity", isEnabled ? "1" : "0.5")
        .attr("title", isEnabled
            ? "Ruft die Massen-UT-Seite mit SD-Parametern erneut auf."
            : "Zieldorf wurde in keiner gespeicherten SD-Tabelle gefunden.");

    $repeatButton.off(".sdRepeatSend");
    $repeatButton.on("click.sdRepeatSend", function () {
        if (!repeatSendTarget) {
            return;
        }
        log.info("Navigating via repeat-send button", {
            threadId: repeatSendTarget.threadId,
            matchedBy: repeatSendTarget.matchedBy,
            targetCoords: repeatSendTarget.sendingObj.coords,
            returnUrl: repeatSendTarget.returnUrl
        });
        window.location.href = repeatSendTarget.returnUrl;
    });
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
        preventDuplicateDestination: pageState.preventDuplicateDestination,
        sdGroupId: pageState.sdGroupId,
        sortBy: pageState.sortBy,
        duplicateSendingEnabled: !pageState.preventDuplicateDestination
    });

    const repeatSendTarget = resolveRepeatSendTarget(pageState, localStorageService);
    renderRepeatSendButton(repeatSendTarget);

    if (pageState.refererThreadId === null) {
        log.info("No sdTableId present; only caching groups, templates and repeat-send target on this page");
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
        sdGroupId: localStorageService.getSdGroupId,
        sortBy: localStorageService.getSortBy,
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
    const supportSpeedInsights = resolveSupportSpeedInsights(localStorageService);
    const templateTravelProfile = resolveTemplateTravelProfile(pageState, localStorageService);
    const selectionEvaluations: CandidateSelectionEvaluation[] = [];
    const selectionStartIso = epochDateFrom > 0 ? new Date(epochDateFrom).toISOString() : null;
    const selectionEndIso = epochDateUntil > 0 ? new Date(epochDateUntil).toISOString() : null;

    log.info("Computed sending target", summarizeSendingRow(pageState.destinationVillageId, sendingObj, alreadySentAmount, packagesToSend));
    log.state("Date window for package selection", {
        dateFrom: epochDateFrom > 0 ? new Date(epochDateFrom).toISOString() : null,
        dateUntil: epochDateUntil > 0 ? new Date(epochDateUntil).toISOString() : null,
        configuredSwordMinutesPerField: supportSpeedInsights.configuredSwordMsPerField / 60000,
        effectiveSwordMinutesPerField: Number((supportSpeedInsights.effectiveSwordMsPerField / 60000).toFixed(3)),
        speedModifier: Number(supportSpeedInsights.speedModifier.toFixed(4)),
        boostPercent: Number(supportSpeedInsights.boostPercent.toFixed(2)),
        isBoostActive: supportSpeedInsights.isBoostActive,
        sampleCount: supportSpeedInsights.sampleCount,
        templateId: templateTravelProfile.templateId,
        templateName: templateTravelProfile.templateName,
        templateUsedUnits: templateTravelProfile.usedUnits,
        configuredSlowestTemplateUnit: templateTravelProfile.configuredSlowestUnit,
        configuredSlowestTemplateMinutesPerField: templateTravelProfile.configuredSlowestMinutesPerField
    });
    log.state("Mass-ut checkbox selection boundaries", {
        selectionStartIso,
        selectionEndIso,
        initialPackagesToSend: packagesToSend,
        destinationCoords: sendingObj.coords,
        targetVillageId: pageState.destinationVillageId,
        templateId: templateTravelProfile.templateId,
        templateName: templateTravelProfile.templateName,
        templateUsedUnits: templateTravelProfile.usedUnits,
        configuredSlowestTemplateUnit: templateTravelProfile.configuredSlowestUnit,
        configuredSlowestTemplateMinutesPerField: templateTravelProfile.configuredSlowestMinutesPerField,
        configuredSwordMinutesPerField: supportSpeedInsights.configuredSwordMsPerField / 60000,
        effectiveSwordMinutesPerField: Number((supportSpeedInsights.effectiveSwordMsPerField / 60000).toFixed(3)),
        speedModifier: Number(supportSpeedInsights.speedModifier.toFixed(4)),
        boostPercent: Number(supportSpeedInsights.boostPercent.toFixed(2))
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
        const currentTime = Date.now();
        $(".call-village").each(function (index) {
            const $row = $(this);
            const villageId = String($row.find(".troop-request-selector").data("village-id") ?? "");
            const sourceCoords = villageBBCodeToCoordinates($row.find("a").text().trim());
            const travelTimeResolution = resolveRowTravelTime($row, sendingObj, supportSpeedInsights, templateTravelProfile);
            const arrival = currentTime + travelTimeResolution.travelTimeMs;
            const packagesRemainingBeforeSelection = packagesToSend;

            const fromIsSet = epochDateFrom > 0;
            const untilIsSet = epochDateUntil > 0;
            const withinFrom = fromIsSet ? arrival >= epochDateFrom : true;
            const withinUntil = untilIsSet ? arrival <= epochDateUntil : true;
            const selected = packagesToSend > 0 && withinFrom && withinUntil;
            let skipReason: CandidateSelectionEvaluation["skipReason"] = null;
            if (!selected) {
                skipReason = packagesToSend <= 0 ? "packages-exhausted" : "outside-window";
            }

            log.trace("Evaluated candidate village", {
                index,
                villageId,
                sourceCoords,
                destinationCoords: sendingObj.coords,
                distance: Number(travelTimeResolution.distance.toFixed(3)),
                travelTimeHours: Number((travelTimeResolution.travelTimeMs / 3600000).toFixed(3)),
                travelTimeSource: travelTimeResolution.source,
                slowestTemplateUnit: travelTimeResolution.unit,
                arrivalIso: new Date(arrival).toISOString(),
                fromIso: fromIsSet ? new Date(epochDateFrom).toISOString() : null,
                untilIso: untilIsSet ? new Date(epochDateUntil).toISOString() : null,
                withinFrom,
                withinUntil,
                selected,
                skipReason,
                packagesRemainingBeforeSelection
            });

            if (selected) {
                $row.find(".troop-request-selector").trigger("click");
                packagesToSend--;
            }

            selectionEvaluations.push({
                index,
                villageId,
                sourceCoords,
                distance: Number(travelTimeResolution.distance.toFixed(3)),
                travelTimeHours: Number((travelTimeResolution.travelTimeMs / 3600000).toFixed(3)),
                travelTimeSource: travelTimeResolution.source,
                slowestTemplateUnit: travelTimeResolution.unit,
                arrivalIso: new Date(arrival).toISOString(),
                fromIso: selectionStartIso,
                untilIso: selectionEndIso,
                withinFrom,
                withinUntil,
                selected,
                skipReason,
                packagesRemainingBeforeSelection,
                packagesRemainingAfterSelection: packagesToSend
            });
        });
    }

    derivedState.packagesToSend = packagesToSend;
    const selectedEvaluations = selectionEvaluations.filter((evaluation) => evaluation.selected);
    const lastSelectedEvaluation = selectedEvaluations.length > 0
        ? selectedEvaluations[selectedEvaluations.length - 1]
        : null;
    const firstRejectedEvaluation = selectionEvaluations.find((evaluation) => !evaluation.selected) ?? null;
    if (selectionEvaluations.length > 0) {
        log.state("Mass-ut checkbox selection evaluation", {
            totalCandidatesEvaluated: selectionEvaluations.length,
            selectedCandidateCount: selectedEvaluations.length,
            remainingPackagesAfterSelection: packagesToSend,
            lastSelectedEvaluation,
            firstRejectedEvaluation,
            evaluations: selectionEvaluations
        });
    }
    log.info("Auto-selection completed", {
        checkedBoxes: $(".troop-request-selector:checked").length,
        packagesRemainingAfterSelection: packagesToSend,
        selectionStartIso,
        selectionEndIso,
        selectedCandidateCount: selectedEvaluations.length,
        lastSelectedVillageId: lastSelectedEvaluation?.villageId ?? null,
        lastSelectedArrivalIso: lastSelectedEvaluation?.arrivalIso ?? null,
        firstRejectedVillageId: firstRejectedEvaluation?.villageId ?? null,
        firstRejectedArrivalIso: firstRejectedEvaluation?.arrivalIso ?? null
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
