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

const log = Log.scope("away-detail");

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
        <td style="padding: 4px 6px; font-weight: bold;">${unit}</td>
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
        html += `<option value="${threadId}">${threadData.forumName} - ${threadData.threadName}</option>`;
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

function ensurePanel(localStorageService: LocalStorageHelper, threads: Threads) {
    let $panel = $(`#${PANEL_ID}`);
    if ($panel.length > 0) {
        return $panel;
    }

    const availableUnits = getAvailableUnits();
    const splitConfig = localStorageService.getBunkerSplitConfig;
    const unitPowers = localStorageService.getBunkerUnitPowers;
    const selectedThreadId = resolveSelectedThreadId(localStorageService, threads);

    const panelHtml = `<div id="${PANEL_ID}" style="position: fixed; top: 140px; right: 20px; width: 360px; z-index: 9999; background: #f4e4bc; border: 2px solid #7d510f; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35); border-radius: 6px;">
  <div class="${PANEL_HANDLE_CLASS}" style="cursor: move; user-select: none; padding: 8px 10px; background: linear-gradient(180deg, #124d8c 0%, #09335d 100%); color: #ffffff; font-weight: bold; border-top-left-radius: 4px; border-top-right-radius: 4px;">
    SD Bunker Import
  </div>
  <div style="padding: 10px;">
    <div style="margin-bottom: 10px;">
      <div style="font-weight: bold; margin-bottom: 4px;">Ziel-Thread</div>
      <select id="sd-bunker-import-thread-id" style="width:100%; background-color: #e6dcc1; border: 1px solid #7d510f; padding: 5px 8px; box-sizing: border-box;">
        ${buildThreadOptionsHtml(threads)}
      </select>
      <div id="sd-bunker-import-thread-hint" style="font-size: 12px; color: #4d2f00; margin-top: 5px;"></div>
    </div>
    <div style="margin-bottom: 10px;">
      <div style="font-weight: bold; margin-bottom: 6px;">Berechnung pro Split</div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 4px 6px;">Einheit</th>
            <th style="text-align: left; padding: 4px 6px;">Split</th>
            <th style="text-align: left; padding: 4px 6px;">Power</th>
          </tr>
        </thead>
        <tbody>
          ${buildUnitSettingsRows(availableUnits, splitConfig, unitPowers)}
        </tbody>
      </table>
    </div>
    <div id="sd-bunker-import-split-power" style="font-size: 12px; color: #4d2f00; font-weight: bold;"></div>
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
    $hint.text(`Importiert direkt in: ${targetThread.threadName}`);
}

function syncImportButtonState(localStorageService: LocalStorageHelper, threads: Threads) {
    const selectedThreadId = String($(`#${PANEL_ID}`).find("#sd-bunker-import-thread-id").val() ?? localStorageService.getBunkerImportTargetThreadId);
    const hasKnownThread = selectedThreadId !== "" && threads[selectedThreadId] !== undefined;
    $(`#${BUTTON_ID}`).prop("disabled", !hasKnownThread);
}

function bindPanelEvents($panel: JQuery<HTMLElement>, localStorageService: LocalStorageHelper, threads: Threads) {
    $panel.off(".bunkerImportSettings");

    $panel.on("change.bunkerImportSettings", "#sd-bunker-import-thread-id", function () {
        const selectedThreadId = String($(this).val() ?? "");
        localStorageService.setBunkerImportTargetThreadId = selectedThreadId;
        syncThreadHint($panel, threads);
        syncImportButtonState(localStorageService, threads);
    });

    $panel.on("change.bunkerImportSettings", "input[data-config='split']", function () {
        const unit = String($(this).data("unit")) as Unit;
        const nextConfig = {...localStorageService.getBunkerSplitConfig};
        nextConfig[unit] = parseNumericInput(String($(this).val() ?? ""), nextConfig[unit] ?? 0);
        $(this).val(String(nextConfig[unit]));
        localStorageService.setBunkerSplitConfig = nextConfig;
        syncSplitPower($panel, localStorageService);
    });

    $panel.on("change.bunkerImportSettings", "input[data-config='power']", function () {
        const unit = String($(this).data("unit")) as Unit;
        const nextConfig = {...localStorageService.getBunkerUnitPowers};
        nextConfig[unit] = parseNumericInput(String($(this).val() ?? ""), nextConfig[unit] ?? 0);
        $(this).val(String(nextConfig[unit]));
        localStorageService.setBunkerUnitPowers = nextConfig;
        syncSplitPower($panel, localStorageService);
    });

    syncThreadHint($panel, threads);
    syncSplitPower($panel, localStorageService);
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

        const unitPowers = localStorageService.getBunkerUnitPowers;
        const splitConfig = localStorageService.getBunkerSplitConfig;
        const splitPower = calculateBunkerSplitPower(splitConfig, unitPowers, getAvailableUnits());
        if (splitPower <= 0) {
            UI.ErrorMessage("Die Split-Berechnung ergibt 0. Bitte Split oder Power anpassen.", 5000);
            return;
        }

        const villagePowerMap = getVillagePowerMap(unitPowers);
        const importedRequests = buildImportedRequests(villagePowerMap, splitPower);
        if (importedRequests.length === 0) {
            UI.ErrorMessage("Keine gueltigen Bunkeranfragen auf der Seite gefunden.", 4000);
            return;
        }

        const existingRequests = localStorageService.getSdInquiry(targetThreadId);
        const mergedRequests = mergeImportedRequests(existingRequests, importedRequests);
        localStorageService.setSdInquiry(targetThreadId, mergedRequests);
        UI.SuccessMessage(
            `${importedRequests.length} Bunkeranfragen fuer "${threads[targetThreadId].threadName}" uebernommen.`,
            4000
        );
        log.info("Imported bunker requests from away-detail page", {
            targetThreadId,
            importedCount: importedRequests.length,
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

    const buttonHtml = `<input class="btn" type="button" value="SD Bunker auslesen" id="${BUTTON_ID}" style="margin-bottom: 10px;">`;
    if ($(`#${BUTTON_ID}`).length === 0) {
        $("#units_table").before(buttonHtml);
    }

    const $panel = ensurePanel(localStorageService, threads);
    bindPanelEvents($panel, localStorageService, threads);
    bindImportButton(localStorageService, threads);
    syncImportButtonState(localStorageService, threads);
}
