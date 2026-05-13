import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import {Log} from "../../helpers/logging-helper";
import {initializeSdSettingsControls} from "./sd-settings-controls";

const PANEL_ID = "sd-forum-quick-settings";
const DRAG_NAMESPACE = ".forumQuickSettingsDrag";
const RESET_NAMESPACE = ".forumQuickReset";

const log = Log.scope("forum-quick-settings");

export function addForumQuickSettings(currentThreadId?: string) {
    const localStorageService = LocalStorageHelper.getInstance();
    let $panel = $(`#${PANEL_ID}`);
    if ($panel.length === 0) {
        const panelHtml = `<div id="${PANEL_ID}" style="position: fixed; top: 140px; right: 20px; width: 245px; z-index: 9999; background: #f4e4bc; border: 2px solid #7d510f; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35); border-radius: 6px;">
  <div class="sd-forum-quick-settings-handle" style="cursor: move; user-select: none; padding: 8px 10px; background: linear-gradient(180deg, #8d0100 0%, #660000 100%); color: #ffffff; font-weight: bold; border-top-left-radius: 4px; border-top-right-radius: 4px;">
    SD Quick Settings
  </div>
  <div style="padding: 10px;">
    <div style="margin-bottom: 10px;">
      <div style="font-weight: bold; margin-bottom: 4px;">Massen-UT</div>
      <input class="btn btn-confirm-no" type="button" value="Aus" id="automate-massen-ut" style="width:100%; background-color: #8d0100; color: #ffffff">
    </div>
    <div style="margin-bottom: 10px;">
      <div style="font-weight: bold; margin-bottom: 4px;">Doppeltes Schicken</div>
      <input class="btn btn-confirm-no" type="button" value="An" id="prevent-duplicate-destination" style="width:100%; background-color: #8d0100; color: #ffffff">
    </div>
    <div style="margin-bottom: 10px;">
      <div style="font-weight: bold; margin-bottom: 4px;">sortieren nach</div>
      <select id="sd-sort-by" style="width:100%; background-color: #8d0100; color: #ffffff; border: none; padding: 5px 10px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);"></select>
    </div>
    <div style="margin-bottom: 10px;">
      <div style="font-weight: bold; margin-bottom: 4px;">SD Gruppe</div>
      <input type="number" value="0" id="sd-group-id" style="width:100%; background-color: #8d0100; color: #ffffff; border: none; padding: 5px 10px; border-radius: 4px; box-sizing: border-box;">
    </div>
    <div>
      <div style="font-weight: bold; margin-bottom: 4px;">SD Vorlage</div>
      <input type="number" value="0" id="sd-template-id" style="width:100%; background-color: #8d0100; color: #ffffff; border: none; padding: 5px 10px; border-radius: 4px; box-sizing: border-box;">
    </div>
    <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(125, 81, 15, 0.35);">
      <div style="font-weight: bold; margin-bottom: 4px;">Geschickte Pakete</div>
      <div class="sd-forum-quick-settings-reset-status" style="font-size: 11px; margin-bottom: 6px; color: #4d2f00;"></div>
      <input class="btn" type="button" value="Reset" id="reset-thread-packages" style="width:100%;">
    </div>
  </div>
</div>`;

        $("body").append(panelHtml);
        $panel = $(`#${PANEL_ID}`);

        initializeForumQuickSettingsControls($panel, localStorageService);
        enableDragging($panel);

        log.info("Injected forum quick settings panel");
    }

    syncResetButtonState($panel, localStorageService, currentThreadId);
    bindResetButton($panel, localStorageService, currentThreadId);
}

function syncResetButtonState(
    $panel: JQuery<HTMLElement>,
    localStorageService: LocalStorageHelper,
    currentThreadId?: string,
) {
    const $resetButton = $panel.find("#reset-thread-packages");
    const $statusText = $panel.find(".sd-forum-quick-settings-reset-status");

    if (!currentThreadId) {
        $resetButton.prop("disabled", true).css("opacity", "0.5").data("thread-id", "");
        $statusText.text("Erst in einem bestehenden SD-Thread verfuegbar.");
        return;
    }

    const threadData = localStorageService.getThreadData(currentThreadId);
    const sentPackageCount = threadData?.packagesSent.size ?? 0;
    $resetButton.prop("disabled", sentPackageCount === 0).css("opacity", sentPackageCount === 0 ? "0.5" : "1").data("thread-id", currentThreadId);
    $statusText.text(`Gespeicherte Versand-Eintraege: ${sentPackageCount}`);
}

function bindResetButton(
    $panel: JQuery<HTMLElement>,
    localStorageService: LocalStorageHelper,
    currentThreadId?: string,
) {
    $panel.off(`click${RESET_NAMESPACE}`, "#reset-thread-packages");
    $panel.on(`click${RESET_NAMESPACE}`, "#reset-thread-packages", function () {
        const threadId = currentThreadId ?? String($(this).data("thread-id") ?? "");
        if (threadId === "") {
            return;
        }

        const threadData = localStorageService.getThreadData(threadId);
        if (!threadData || threadData.packagesSent.size === 0) {
            syncResetButtonState($panel, localStorageService, threadId);
            return;
        }

        const shouldReset = window.confirm(`Geschickte Pakete fuer "${threadData.threadName}" zuruecksetzen?`);
        if (!shouldReset) {
            return;
        }

        localStorageService.resetPackagesSent(threadId);
        syncResetButtonState($panel, localStorageService, threadId);
        log.info("Reset sent packages from forum quick settings", {threadId});
    });
}

function initializeForumQuickSettingsControls(
    $panel: JQuery<HTMLElement>,
    localStorageService: LocalStorageHelper,
) {
    initializeSdSettingsControls($panel, localStorageService, log, {
        selectStyle: "width:100%; background-color: #8d0100; color: #ffffff; border: none; padding: 5px 10px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); box-sizing: border-box;"
    });
}

function enableDragging($panel: JQuery<HTMLElement>) {
    const $document = $(document);
    let isDragging = false;
    let panelLeft = 0;
    let panelTop = 0;
    let pointerOffsetX = 0;
    let pointerOffsetY = 0;

    $document.off(DRAG_NAMESPACE);

    $panel.find(".sd-forum-quick-settings-handle").on("mousedown", function (event) {
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
        panelLeft = clientX - pointerOffsetX;
        panelTop = clientY - pointerOffsetY;

        $panel.css({
            left: `${Math.max(0, panelLeft)}px`,
            top: `${Math.max(0, panelTop)}px`
        });
    });

    $document.on(`mouseup${DRAG_NAMESPACE}`, function () {
        isDragging = false;
    });
}
