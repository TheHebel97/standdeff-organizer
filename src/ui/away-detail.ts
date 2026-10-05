import {ensureOrganizerStyles, escapeHtml} from "./components/organizer-style";
import {buildBunkerPreset, describeBunkerPreset} from "../helpers/bunker-import-settings";
import {LocalStorageHelper} from "../helpers/local-storage-helper";
import {Log} from "../helpers/logging-helper";
import {PageContext} from "../helpers/script-context";
import {
    BUNKER_IMPORT_UNIT_ORDER,
    calculateBunkerSplitPower
} from "../helpers/bunker-import-settings";
import {forumQuickSettingsPosition, sdInquiry, Threads, unitNumberMap} from "../types/types";
import {Unit} from "../types/tw-types";

const PANEL_ID = "sd-bunker-import-panel";
const PANEL_HANDLE_CLASS = "sd-bunker-import-panel-handle";
const BUTTON_ID = "sd-import-bunker-requests";
const DRAG_NAMESPACE = ".bunkerImportPanelDrag";
const PREVIEW_ROW_SELECTOR = "[data-bunker-import-preview-row]";

const log = Log.scope("away-detail");
const importSelectionByCoords: Record<string, boolean> = {};

type bunkerImportCalculation = {
    splitPower: number;
    importedRequests: sdInquiry[];
}

function isImportRequestSelected(coords: string): boolean {
    return importSelectionByCoords[coords] ?? true;
}

function setImportRequestSelection(coords: string, isSelected: boolean) {
    importSelectionByCoords[coords] = isSelected;
}

function clampPanelPosition($panel: JQuery<HTMLElement>, position: forumQuickSettingsPosition): forumQuickSettingsPosition {
    const panelWidth = $panel.outerWidth() ?? 0;
    const panelHeight = $panel.outerHeight() ?? 0;
    const maxLeft = Math.max(0, window.innerWidth - panelWidth);
    const maxTop = Math.max(0, window.innerHeight - panelHeight);

    return {
        left: Math.min(Math.max(0, position.left), maxLeft),
        top: Math.min(Math.max(0, position.top), maxTop)
    };
}

function applyStoredPanelPosition($panel: JQuery<HTMLElement>, localStorageService: LocalStorageHelper) {
    const storedPosition = localStorageService.getBunkerImportPanelPosition;
    if (!storedPosition) {
        return;
    }

    const clampedPosition = clampPanelPosition($panel, storedPosition);
    $panel.css({
        left: `${clampedPosition.left}px`,
        top: `${clampedPosition.top}px`,
        right: "auto"
    });
}

function enableDragging($panel: JQuery<HTMLElement>, localStorageService: LocalStorageHelper) {
    const $document = $(document);
    let isDragging = false;
    let panelLeft = 0;
    let panelTop = 0;
    let pointerOffsetX = 0;
    let pointerOffsetY = 0;

    $document.off(DRAG_NAMESPACE);

    $panel.find(`.${PANEL_HANDLE_CLASS}`).on("mousedown", function (event) {
        if (event.which !== 1) {
            return;
        }

        const panelRect = $panel[0].getBoundingClientRect();
        const clientX = event.clientX ?? 0;
        const clientY = event.clientY ?? 0;
        panelLeft = panelRect.left;
        panelTop = panelRect.top;
        pointerOffsetX = clientX - panelRect.left;
        pointerOffsetY = clientY - panelRect.top;
        isDragging = true;

        $panel.css({
            left: `${panelLeft}px`,
            top: `${panelTop}px`,
            right: "auto"
        });

        event.preventDefault();
    });

    $document.on(`mousemove${DRAG_NAMESPACE}`, function (event) {
        if (!isDragging) {
            return;
        }

        const clientX = event.clientX ?? 0;
        const clientY = event.clientY ?? 0;
        const clampedPosition = clampPanelPosition($panel, {
            left: clientX - pointerOffsetX,
            top: clientY - pointerOffsetY
        });
        panelLeft = clampedPosition.left;
        panelTop = clampedPosition.top;

        $panel.css({
            left: `${panelLeft}px`,
            top: `${panelTop}px`
        });
    });

    $document.on(`mouseup${DRAG_NAMESPACE}`, function () {
        if (isDragging) {
            localStorageService.setBunkerImportPanelPosition = {
                left: panelLeft,
                top: panelTop
            };
            log.info("Stored bunker import panel position", {
                left: panelLeft,
                top: panelTop
            });
        }
        isDragging = false;
    });
}

function getAvailableUnits(): Unit[] {
    return BUNKER_IMPORT_UNIT_ORDER.filter((unit) => game_data.units.includes(unit));
}

function buildUnitSettingsRows(units: Unit[], splitConfig: unitNumberMap, unitPowers: unitNumberMap): string {
    return units.map((unit) => `
      <tr>
        <td style="padding: 4px 6px; font-weight: bold;"><img src="/graphic/unit/unit_${unit}.png" alt="${unit}" title="${unit}"></td>
        <td style="padding: 4px 6px;">
          <input type="number" min="0" step="1" data-unit="${unit}" data-config="split" value="${splitConfig[unit] ?? 0}"
                 style="width: 90px; background-color: #e6dcc1; border: 1px solid #7d510f; box-sizing: border-box;">
        </td>
        <td style="padding: 4px 6px;">
          <input type="number" min="0" step="0.01" data-unit="${unit}" data-config="power" value="${unitPowers[unit] ?? 0}"
                 style="width: 90px; background-color: #e6dcc1; border: 1px solid #7d510f; box-sizing: border-box;">
        </td>
      </tr>
    `).join("");
}

function buildThreadOptionsHtml(threads: Threads): string {
    let html = '<option value="">Bitte waehlen</option>';
    Object.entries(threads).forEach(([threadId, threadData]) => {
        html += `<option value="${escapeHtml(threadId)}">${escapeHtml(threadData.forumName)} - ${escapeHtml(threadData.threadName)}</option>`;
    });
    return html;
}

function resolveSelectedThreadId(localStorageService: LocalStorageHelper, threads: Threads): string {
    const threadIds = Object.keys(threads);
    if (threadIds.length === 0) {
        return "";
    }

    const storedThreadId = localStorageService.getBunkerImportTargetThreadId;
    if (storedThreadId !== "" && threads[storedThreadId] !== undefined) {
        return storedThreadId;
    }

    return threadIds[0];
}

function buildImportPreviewSectionHtml(): string {
    return `
    <div style="margin-top: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 6px;">
        <div style="font-weight: bold;">Import-Vorschau</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end;">
          <input class="btn" type="button" value="Alle" data-bunker-import-select="all">
          <input class="btn" type="button" value="Keine" data-bunker-import-select="none">
          <input class="btn" type="button" value="Unter 5 entfernen" title="Entfernt auch vorhandene Anfrage-Entwürfe derselben Koordinaten im gewählten Ziel-Thread" data-bunker-import-select="below-five">
        </div>
      </div>
      <div id="sd-bunker-import-preview-summary" style="font-size: 12px; color: #4d2f00; margin-bottom: 6px;"></div>
      <div id="sd-bunker-import-preview" style="max-height: 220px; overflow-y: auto; border: 1px solid #c4a36b; background-color: #f8edd0; padding: 6px;"></div>
    </div>`;
}

function ensurePanel(localStorageService: LocalStorageHelper, threads: Threads) {
    ensureOrganizerStyles();
    let $panel = $(`#${PANEL_ID}`);
    if ($panel.length > 0) {
        return $panel;
    }

    const availableUnits = getAvailableUnits();
    const splitConfig = localStorageService.getBunkerSplitConfig;
    const unitPowers = localStorageService.getBunkerUnitPowers;
    const selectedThreadId = resolveSelectedThreadId(localStorageService, threads);

    const panelHtml = `<div id="${PANEL_ID}" class="sd-organizer" style="position: fixed; top: 140px; right: 20px; width: 360px; z-index: 9999; background: #f4e4bc; border: 2px solid #7d510f; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35); border-radius: 6px;">
  <div class="${PANEL_HANDLE_CLASS} sd-organizer-handle" style="cursor: move; user-select: none; padding: 8px 10px;  font-weight: bold; border-top-left-radius: 4px; border-top-right-radius: 4px;">
    SD Organizer
  </div>
  <div style="padding: 10px;">
    <div style="font-weight:bold">Paketgröße für den Bunkerimport</div>
    <div class="sd-preset-buttons">${[100,200].map(amount => `<input class="btn" type="button" data-preset="dual" data-amount="${amount}" value="${amount} Dual">`).join('')}
    ${game_data.units.includes('archer') ? [100,200].map(amount => `<input class="btn" type="button" data-preset="trial" data-amount="${amount}" value="${amount} Trial">`).join('') : ''}</div>
    <div id="sd-bunker-active-preset"></div>
    <p>Berechnet die aktuell sichtbaren Truppen dieser Seite. Filter und weitere Seiten werden nicht automatisch eingelesen.</p>
    <div style="margin-bottom: 10px;">
      <div style="font-weight: bold; margin-bottom: 4px;">Ziel-Thread</div>
      <select id="sd-bunker-import-thread-id" style="width:100%; background-color: #e6dcc1; border: 1px solid #7d510f; padding: 5px 8px; box-sizing: border-box;">
        ${buildThreadOptionsHtml(threads)}
      </select>
      <div id="sd-bunker-import-thread-hint" style="font-size: 12px; color: #4d2f00; margin-top: 5px;"></div>
    </div>
    <details><summary>Eigene Paketgröße</summary>
      <table style="width:100%"><tbody>${buildUnitSettingsRows(availableUnits, splitConfig, unitPowers).replace(/<td style="padding: 4px 6px;">\s*<input type="number" min="0" step="0.01"[\s\S]*?<\/td>/g, '')}</tbody></table>
    </details>
    <details><summary>Erweiterte Berechnung: Power</summary>
      <table style="width:100%"><tbody>${buildUnitSettingsRows(availableUnits, splitConfig, unitPowers).replace(/<td style="padding: 4px 6px;">\s*<input type="number" min="0" step="1"[\s\S]*?<\/td>/g, '')}</tbody></table>
    </details>
    <div id="sd-bunker-import-split-power" style="font-size: 12px; color: #4d2f00; font-weight: bold;"></div>
    ${buildImportPreviewSectionHtml()}
  </div>
</div>`;

    $("body").append(panelHtml);
    $panel = $(`#${PANEL_ID}`);
    applyStoredPanelPosition($panel, localStorageService);
    $panel.find("#sd-bunker-import-thread-id").val(selectedThreadId);
    localStorageService.setBunkerImportTargetThreadId = selectedThreadId;
    enableDragging($panel, localStorageService);
    return $panel;
}

function parseNumericInput(rawValue: string, fallbackValue: number): number {
    const normalizedValue = Number(String(rawValue ?? "").replace(",", "."));
    if (isNaN(normalizedValue) || !isFinite(normalizedValue) || normalizedValue < 0) {
        return fallbackValue;
    }
    return normalizedValue;
}

function syncSplitPower($panel: JQuery<HTMLElement>, localStorageService: LocalStorageHelper) {
    const splitPower = calculateBunkerSplitPower(
        localStorageService.getBunkerSplitConfig,
        localStorageService.getBunkerUnitPowers,
        getAvailableUnits()
    );
    const active = describeBunkerPreset(localStorageService.getBunkerSplitConfig, game_data.units.includes('archer'));
    $panel.find('#sd-bunker-active-preset').text(`Aktuell: ${active}`);
    $panel.find('[data-preset]').each(function () {
        $(this).attr('aria-pressed', String(`${$(this).data('amount')} ${String($(this).data('preset')).replace(/^./, c => c.toUpperCase())}` === active));
    });
    $panel.find("#sd-bunker-import-split-power").text(`Power pro Split: ${splitPower.toFixed(2)}`);
}

function syncThreadHint($panel: JQuery<HTMLElement>, threads: Threads) {
    const selectedThreadId = String($panel.find("#sd-bunker-import-thread-id").val() ?? "");
    const $hint = $panel.find("#sd-bunker-import-thread-hint");
    if (selectedThreadId === "" || threads[selectedThreadId] === undefined) {
        $hint.text("Kein bekannter SD-Thread ausgewaehlt.");
        return;
    }

    const targetThread = threads[selectedThreadId];
    $hint.text(`Speichert einen Anfrage-Entwurf für: ${targetThread.threadName}`);
}

function calculateImportedRequests(localStorageService: LocalStorageHelper): bunkerImportCalculation {
    const unitPowers = localStorageService.getBunkerUnitPowers;
    const splitConfig = localStorageService.getBunkerSplitConfig;
    const splitPower = calculateBunkerSplitPower(splitConfig, unitPowers, getAvailableUnits());
    if (splitPower <= 0) {
        return {
            splitPower,
            importedRequests: []
        };
    }

    const villagePowerMap = getVillagePowerMap(unitPowers);
    return {
        splitPower,
        importedRequests: buildImportedRequests(villagePowerMap, splitPower)
    };
}

function buildImportPreviewRows(importedRequests: sdInquiry[], existingRequests: sdInquiry[]): string {
    const existingRequestsByCoords = new Map(existingRequests.map((request) => [request.coords, request]));
    return importedRequests.map((request) => {
        const existingRequest = existingRequestsByCoords.get(request.coords);
        const isSelected = isImportRequestSelected(request.coords);
        const statusText = existingRequest
            ? `Ersetzt ${existingRequest.amount} -> ${request.amount}`
            : `Neu ${request.amount}`;

        return `
        <tr data-bunker-import-preview-row data-coords="${request.coords}" data-amount="${request.amount}" data-is-replacement="${existingRequest ? "1" : "0"}">
          <td style="padding: 4px 6px; vertical-align: top;">
            <input type="checkbox" class="sd-bunker-import-preview-checkbox" data-coords="${request.coords}" ${isSelected ? "checked" : ""}>
          </td>
          <td style="padding: 4px 6px; vertical-align: top;">
            <div style="font-weight: bold;">${request.coords}</div>
            <div style="font-size: 11px; color: #4d2f00;">${statusText}</div>
          </td>
        </tr>`;
    }).join("");
}

function syncImportPreviewSummary($panel: JQuery<HTMLElement>) {
    const $rows = $panel.find(PREVIEW_ROW_SELECTOR);
    const totalCount = $rows.length;
    let selectedCount = 0;
    let selectedNewCount = 0;
    let selectedReplacementCount = 0;

    $rows.each(function () {
        const $row = $(this);
        const isSelected = $row.find(".sd-bunker-import-preview-checkbox").is(":checked");
        if (!isSelected) {
            return;
        }

        selectedCount += 1;
        if (String($row.data("isReplacement")) === "1") {
            selectedReplacementCount += 1;
            return;
        }

        selectedNewCount += 1;
    });

    $panel.find("#sd-bunker-import-preview-summary").text(
        `${totalCount} Anfragen gefunden, ${selectedCount} markiert. Markiert: ${selectedNewCount} neu, ${selectedReplacementCount} ersetzen.`
    );
}

function renderImportPreview($panel: JQuery<HTMLElement>, localStorageService: LocalStorageHelper, threads: Threads) {
    const calculation = calculateImportedRequests(localStorageService);
    const selectedThreadId = String($panel.find("#sd-bunker-import-thread-id").val() ?? localStorageService.getBunkerImportTargetThreadId);
    const hasKnownThread = selectedThreadId !== "" && threads[selectedThreadId] !== undefined;
    const $preview = $panel.find("#sd-bunker-import-preview");
    const $summary = $panel.find("#sd-bunker-import-preview-summary");

    if (calculation.splitPower <= 0) {
        $summary.text("Die Split-Berechnung ergibt 0. Bitte Split oder Power anpassen.");
        $preview.html("");
        return;
    }

    if (calculation.importedRequests.length === 0) {
        $summary.text("Keine gueltigen Bunkeranfragen auf der Seite gefunden.");
        $preview.html("");
        return;
    }

    if (!hasKnownThread) {
        $summary.text(`${calculation.importedRequests.length} Anfragen gefunden. Bitte zuerst einen bekannten SD-Thread waehlen.`);
        $preview.html(`
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tbody>
            ${buildImportPreviewRows(calculation.importedRequests, [])}
          </tbody>
        </table>`);
        return;
    }

    const existingRequests = localStorageService.getSdInquiry(selectedThreadId);
    $preview.html(`
    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
      <tbody>
        ${buildImportPreviewRows(calculation.importedRequests, existingRequests)}
      </tbody>
    </table>`);
    syncImportPreviewSummary($panel);
}

function syncImportButtonState(localStorageService: LocalStorageHelper, threads: Threads) {
    const $panel = $(`#${PANEL_ID}`);
    const selectedThreadId = String($panel.find("#sd-bunker-import-thread-id").val() ?? localStorageService.getBunkerImportTargetThreadId);
    const hasKnownThread = selectedThreadId !== "" && threads[selectedThreadId] !== undefined;
    const selectedCount = $panel.find(".sd-bunker-import-preview-checkbox:checked").length;
    const hasPreviewRows = $panel.find(PREVIEW_ROW_SELECTOR).length > 0;

    $(`#${BUTTON_ID}`)
        .prop("disabled", !(hasKnownThread && hasPreviewRows && selectedCount > 0))
        .val(selectedCount > 0 ? `Markierte Bunker uebernehmen (${selectedCount})` : "Markierte Bunker uebernehmen");
}

function removePreviewRowsBelowAmount($panel: JQuery<HTMLElement>, minimumAmount: number): string[] {
    const removedCoords: string[] = [];

    $panel.find(PREVIEW_ROW_SELECTOR).each(function () {
        const $row = $(this);
        const amount = Number($row.data("amount") ?? 0);
        if (!isFinite(amount) || amount >= minimumAmount) {
            return;
        }

        const coords = String($row.data("coords") ?? "");
        setImportRequestSelection(coords, false);
        $row.remove();
        removedCoords.push(coords);
    });

    syncImportPreviewSummary($panel);
    return removedCoords;
}

function removeStoredRequestsByCoords(
    localStorageService: LocalStorageHelper,
    targetThreadId: string,
    coordsToRemove: string[]
): number {
    if (targetThreadId === "" || coordsToRemove.length === 0) {
        return 0;
    }

    const coordsToRemoveSet = new Set(coordsToRemove);
    const existingRequests = localStorageService.getSdInquiry(targetThreadId);
    const filteredRequests = existingRequests.filter((request) => !coordsToRemoveSet.has(request.coords));
    const removedCount = existingRequests.length - filteredRequests.length;

    if (removedCount > 0) {
        localStorageService.setSdInquiry(targetThreadId, filteredRequests);
    }

    return removedCount;
}

function bindPanelEvents($panel: JQuery<HTMLElement>, localStorageService: LocalStorageHelper, threads: Threads) {
    $panel.off(".bunkerImportSettings");
    $panel.on('click.bunkerImportSettings', '[data-preset]', function () {
        const config = buildBunkerPreset(Number($(this).data('amount')), String($(this).data('preset')) === 'trial');
        localStorageService.setBunkerSplitConfig = config;
        $panel.find('input[data-config=split]').each(function () { $(this).val(config[String($(this).data('unit')) as Unit]); });
        syncSplitPower($panel, localStorageService);
        renderImportPreview($panel, localStorageService, threads);
        syncImportButtonState(localStorageService, threads);
    });

    $panel.on("change.bunkerImportSettings", "#sd-bunker-import-thread-id", function () {
        const selectedThreadId = String($(this).val() ?? "");
        localStorageService.setBunkerImportTargetThreadId = selectedThreadId;
        syncThreadHint($panel, threads);
        renderImportPreview($panel, localStorageService, threads);
        syncImportButtonState(localStorageService, threads);
    });

    $panel.on("change.bunkerImportSettings", "input[data-config='split']", function () {
        const unit = String($(this).data("unit")) as Unit;
        const nextConfig = {...localStorageService.getBunkerSplitConfig};
        const amount = parseNumericInput(String($(this).val() ?? ""), nextConfig[unit] ?? 0);
        nextConfig[unit] = Number.isSafeInteger(amount) ? amount : (nextConfig[unit] ?? 0);
        $(this).val(String(nextConfig[unit]));
        localStorageService.setBunkerSplitConfig = nextConfig;
        syncSplitPower($panel, localStorageService);
        renderImportPreview($panel, localStorageService, threads);
        syncImportButtonState(localStorageService, threads);
    });

    $panel.on("change.bunkerImportSettings", "input[data-config='power']", function () {
        const unit = String($(this).data("unit")) as Unit;
        const nextConfig = {...localStorageService.getBunkerUnitPowers};
        nextConfig[unit] = parseNumericInput(String($(this).val() ?? ""), nextConfig[unit] ?? 0);
        $(this).val(String(nextConfig[unit]));
        localStorageService.setBunkerUnitPowers = nextConfig;
        syncSplitPower($panel, localStorageService);
        renderImportPreview($panel, localStorageService, threads);
        syncImportButtonState(localStorageService, threads);
    });

    $panel.on("change.bunkerImportSettings", ".sd-bunker-import-preview-checkbox", function () {
        const coords = String($(this).data("coords") ?? "");
        setImportRequestSelection(coords, $(this).is(":checked"));
        syncImportPreviewSummary($panel);
        syncImportButtonState(localStorageService, threads);
    });

    $panel.on("click.bunkerImportSettings", "[data-bunker-import-select]", function () {
        const action = String($(this).data("bunkerImportSelect") ?? "");
        if (action === "below-five") {
            const targetThreadId = String($panel.find("#sd-bunker-import-thread-id").val() ?? localStorageService.getBunkerImportTargetThreadId);
            const removedCoords = removePreviewRowsBelowAmount($panel, 5);
            const removedCount = removedCoords.length;
            const removedStoredCount = removeStoredRequestsByCoords(localStorageService, targetThreadId, removedCoords);
            syncImportButtonState(localStorageService, threads);
            if (removedCount > 0) {
                UI.SuccessMessage(
                    `${removedCount} Bunkeranfragen unter 5 entfernt, ${removedStoredCount} im Ziel-Thread aktualisiert.`,
                    3000
                );
                return;
            }

            UI.SuccessMessage("Keine Bunkeranfragen unter 5 gefunden.", 3000);
            return;
        }

        const nextSelectionState = action === "all";
        $panel.find(".sd-bunker-import-preview-checkbox").each(function () {
            const coords = String($(this).data("coords") ?? "");
            $(this).prop("checked", nextSelectionState);
            setImportRequestSelection(coords, nextSelectionState);
        });
        syncImportPreviewSummary($panel);
        syncImportButtonState(localStorageService, threads);
    });

    syncThreadHint($panel, threads);
    syncSplitPower($panel, localStorageService);
    renderImportPreview($panel, localStorageService, threads);
    syncImportButtonState(localStorageService, threads);
}

function getCoordsFromVillageName(name: string): string {
    const coordsMatch = name.match(/\d+\|\d+/);
    return coordsMatch ? coordsMatch[0] : "";
}

function parseDisplayedUnitCount(rawText: string): number {
    const digitsOnly = rawText.replace(/[^\d]/g, "");
    if (digitsOnly === "") {
        return 0;
    }
    const parsed = parseInt(digitsOnly, 10);
    return isNaN(parsed) ? 0 : parsed;
}

function getVillagePowerMap(unitPowers: unitNumberMap): Record<string, number> {
    const troopLocationAndPower: Record<string, number> = {};
    const unitsAwayTable = $("#units_table").find("tr[class^='row_']");

    $(unitsAwayTable).each(function (_, rowElement) {
        const coords = getCoordsFromVillageName($(rowElement).find("a").first().text());
        if (coords === "") {
            return;
        }

        if (troopLocationAndPower[coords] === undefined) {
            troopLocationAndPower[coords] = 0;
        }

        const unitCollection = $(rowElement).find("td.unit-item");
        let unitPowerSum = 0;
        unitCollection.each(function (index, cellElement) {
            const unit = game_data.units[index];
            if (!unit) {
                return;
            }
            const unitCount = parseDisplayedUnitCount($(cellElement).text());
            const configuredPower = Number(unitPowers[unit] ?? 0);
            if (!isNaN(configuredPower) && configuredPower > 0) {
                unitPowerSum += unitCount * configuredPower;
            }
        });

        troopLocationAndPower[coords] += unitPowerSum;
    });

    return troopLocationAndPower;
}

function buildImportedRequests(
    villagePowerMap: Record<string, number>,
    splitPower: number,
): sdInquiry[] {
    return Object.entries(villagePowerMap)
        .map(([coords, totalPower]) => ({
            coords,
            amount: Math.ceil(totalPower / splitPower),
            playerName: undefined,
            comment: undefined,
            dateFrom: undefined,
            dateUntil: undefined
        }))
        .filter((request) => request.coords !== "" && request.amount > 0);
}

function mergeImportedRequests(existingRequests: sdInquiry[], importedRequests: sdInquiry[]): sdInquiry[] {
    const mergedRequests = [...existingRequests];

    importedRequests.forEach((importedRequest) => {
        const existingIndex = mergedRequests.findIndex((request) => request.coords === importedRequest.coords);
        if (existingIndex === -1) {
            mergedRequests.push(importedRequest);
            return;
        }

        mergedRequests[existingIndex] = {
            ...mergedRequests[existingIndex],
            amount: importedRequest.amount
        };
    });

    return mergedRequests;
}

function bindImportButton(localStorageService: LocalStorageHelper, threads: Threads) {
    $(`#${BUTTON_ID}`).off("click").on("click", function () {
        const targetThreadId = localStorageService.getBunkerImportTargetThreadId;
        if (targetThreadId === "" || threads[targetThreadId] === undefined) {
            UI.ErrorMessage("Bitte zuerst einen bekannten SD-Thread waehlen.", 4000);
            return;
        }

        const calculation = calculateImportedRequests(localStorageService);
        if (calculation.splitPower <= 0) {
            UI.ErrorMessage("Die Split-Berechnung ergibt 0. Bitte Split oder Power anpassen.", 5000);
            return;
        }

        if (calculation.importedRequests.length === 0) {
            UI.ErrorMessage("Keine gueltigen Bunkeranfragen auf der Seite gefunden.", 4000);
            return;
        }

        const selectedImportedRequests = calculation.importedRequests.filter((request) => isImportRequestSelected(request.coords));
        if (selectedImportedRequests.length === 0) {
            UI.ErrorMessage("Bitte mindestens eine Bunkeranfrage markieren.", 4000);
            return;
        }

        const existingRequests = localStorageService.getSdInquiry(targetThreadId);
        const mergedRequests = mergeImportedRequests(existingRequests, selectedImportedRequests);
        localStorageService.setSdInquiry(targetThreadId, mergedRequests);
        const $panel = $(`#${PANEL_ID}`);
        renderImportPreview($panel, localStorageService, threads);
        syncImportButtonState(localStorageService, threads);
        UI.SuccessMessage(
            `${selectedImportedRequests.length} markierte Bunkeranfragen fuer "${threads[targetThreadId].threadName}" uebernommen.`,
            4000
        );
        log.info("Imported bunker requests from away-detail page", {
            targetThreadId,
            importedCount: calculation.importedRequests.length,
            selectedImportedCount: selectedImportedRequests.length,
            totalStoredCount: mergedRequests.length
        });
    });
}

export function displayAwayDetail(pageContext: PageContext) {
    const localStorageService = LocalStorageHelper.getInstance();
    const threads = localStorageService.getAllThreads;

    log.info("Initializing away-detail controller", {
        href: pageContext.href,
        knownThreadCount: Object.keys(threads).length
    });

    const buttonHtml = `<input class="btn" type="button" value="Markierte Bunker uebernehmen" id="${BUTTON_ID}" style="margin-bottom: 10px;">`;
    if ($(`#${BUTTON_ID}`).length === 0) {
        // The primary action belongs to the organizer panel.

    }

    const $panel = ensurePanel(localStorageService, threads);
    if (!$panel.find(`#${BUTTON_ID}`).length) $panel.children().last().append(buttonHtml);
    bindPanelEvents($panel, localStorageService, threads);
    bindImportButton(localStorageService, threads);
    syncImportButtonState(localStorageService, threads);
}
