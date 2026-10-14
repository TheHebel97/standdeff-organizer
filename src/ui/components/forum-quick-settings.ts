import {ensureOrganizerStyles} from "./organizer-style";
import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import {Log} from "../../helpers/logging-helper";
import {applySettingsToMassUtLink, updateSentPackagesInSdTable} from "../../helpers/table-helper";
import {dockOrganizerPanel} from "./organizer-dock";
import {initializeSdSettingsControls} from "./sd-settings-controls";
import {refreshGameCatalogs} from '../../helpers/game-catalog';

const PANEL_ID = "sd-forum-quick-settings";
const RESET_NAMESPACE = ".forumQuickReset";

const log = Log.scope("forum-quick-settings");

export function addForumQuickSettings(currentThreadId?: string) {
    ensureOrganizerStyles();
    const localStorageService = LocalStorageHelper.getInstance();
    let $panel = $(`#${PANEL_ID}`);
    if ($panel.length === 0) {
        const panelHtml = `<div id="${PANEL_ID}" class="sd-organizer" style="position: fixed; top: 140px; right: 12px; width: 245px; z-index: 9999;">
  <div class="sd-forum-quick-settings-handle sd-organizer-handle" style="cursor: move; user-select: none; padding: 8px 10px;  font-weight: bold; border-top-left-radius: 4px; border-top-right-radius: 4px;">
    SD Organizer
  </div>
  <div class="sd-organizer-body" style="padding: 10px;">
    <div style="margin-bottom: 10px;">
      <div style="font-weight: bold; margin-bottom: 4px;">Massen-UT automatisch vorbereiten</div>
      <input class="btn btn-confirm-no" type="button" value="Aus" id="automate-massen-ut" style="width:100%; background-color: #8d0100; color: #ffffff">
    </div>
    <div style="margin-bottom: 10px;">
      <div style="font-weight: bold; margin-bottom: 4px;">Doppeltes Schicken</div>
      <input class="btn btn-confirm-no" type="button" value="Aus" id="prevent-duplicate-destination" style="width:100%; background-color: #8d0100; color: #ffffff">
    </div>
    <div style="margin-bottom: 10px;">
      <div style="font-weight: bold; margin-bottom: 4px;">sortieren nach</div>
      <select id="sd-sort-by" style="width:100%; background-color: #fff8e8; color: #3b2713; border: 1px solid #b59766; padding: 5px 10px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);"></select>
    </div>
    <div style="margin-bottom: 10px;">
      <div style="font-weight: bold; margin-bottom: 4px;">SD Gruppe</div>
      <input type="number" value="0" id="sd-group-id" style="width:100%; background-color: #fff8e8; color: #3b2713; border: 1px solid #b59766; padding: 5px 10px; border-radius: 4px; box-sizing: border-box;">
    </div>
    <div>
      <div style="font-weight: bold; margin-bottom: 4px;">SD Vorlage</div>
      <input type="number" value="0" id="sd-template-id" style="width:100%; background-color: #fff8e8; color: #3b2713; border: 1px solid #b59766; padding: 5px 10px; border-radius: 4px; box-sizing: border-box;">
    </div>
    <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(125, 81, 15, 0.35);">
      <div class="sd-forum-quick-settings-reset-status" style="font-size: 12px; margin-bottom: 6px; color: #4d2f00; font-weight: bold;"></div>
      <input class="btn" type="button" value="Zur&#252;cksetzen" id="reset-thread-packages" style="width:100%;">
    </div>
  </div>
</div>`;

        $("body").append(panelHtml);
        $panel = $(`#${PANEL_ID}`);

        initializeForumQuickSettingsControls($panel, localStorageService, currentThreadId);
        dockOrganizerPanel($panel[0], {legacyPosition:localStorageService.getForumQuickSettingsPosition});

        log.info("Injected forum quick settings panel");
    }

    syncResetButtonState($panel, localStorageService, currentThreadId);
    bindResetButton($panel, localStorageService, currentThreadId);
    if (currentThreadId) {
        $(document).off('sd-catalog-updated.sdForumSettings').on('sd-catalog-updated.sdForumSettings',()=>{
            initializeForumQuickSettingsControls($panel,localStorageService,currentThreadId);
            applySettingsToMassUtLink(currentThreadId);
        });
        void refreshGameCatalogs();
    }
}

function syncResetButtonState(
    $panel: JQuery<HTMLElement>,
    localStorageService: LocalStorageHelper,
    currentThreadId?: string,
) {
    const $resetButton = $panel.find("#reset-thread-packages");
    const $statusText = $panel.find(".sd-forum-quick-settings-reset-status");
    let $caption=$statusText.find('.sd-reset-caption');
    if (!$caption.length) $caption=$('<span class="sd-reset-caption">').prependTo($statusText);
    $caption.text("Geschickte Pakete");

    if (!currentThreadId) {
        $resetButton.prop("disabled", true).css("opacity", "0.5").data("thread-id", "");
        return;
    }

    $resetButton.prop("disabled", false).css("opacity", "1").data("thread-id", currentThreadId);
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

        localStorageService.resetPackagesSent(threadId);
        updateSentPackagesInSdTable(threadId);
        syncResetButtonState($panel, localStorageService, threadId);
        log.info("Reset sent packages from forum quick settings", {threadId});
    });
}

function initializeForumQuickSettingsControls(
    $panel: JQuery<HTMLElement>,
    localStorageService: LocalStorageHelper,
    currentThreadId?: string,
) {
    initializeSdSettingsControls($panel, localStorageService, log, {
        selectStyle: "width:100%; background-color: #fff8e8; color: #3b2713; border: 1px solid #b59766; padding: 5px 10px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); box-sizing: border-box;",
        onSettingsChange: currentThreadId ? () => applySettingsToMassUtLink(currentThreadId) : undefined
    });
}
