import {refreshGameCatalogs} from "../helpers/game-catalog";
import {ensureOrganizerStyles, escapeHtml} from "./components/organizer-style";
import {ThreadData, Threads} from "../types/types";
import {LocalStorageHelper} from "../helpers/local-storage-helper";
import {Log} from "../helpers/logging-helper";
import {PageContext} from "../helpers/script-context";
import {buildForumThreadUrl} from "../helpers/game-url-helper";
import {initializeSdSettingsControls} from "./components/sd-settings-controls";

let localStorageService: LocalStorageHelper;
const log = Log.scope("settings");

function buildThreadRow(threadId: string, threadData: ThreadData): string {
    const threadLink = buildForumThreadUrl(threadData.forumId, threadId);
    const sentPackageCount = threadData.packagesSent.size;

    return `<tr>
             <td>
                 <span style="font-size: larger; font-weight: bold">${escapeHtml(threadData.forumName)}</span> -
                 <a href="${threadLink}">
                     ${escapeHtml(threadData.threadName)}
                 </a>
                 <div style="font-size: x-small; margin-top: 4px;">Gespeicherte Versand-Eintraege: ${sentPackageCount}</div>
             </td>
             <td style="text-align: center;">
                 <input type="button" value="Reset" class="btn reset-thread-packages" data-thread-id="${threadId}"
                        style="width: 70px;">
             </td>
             <td style="text-align: center;"><button style="background: url(/graphic/delete.png); width: 20px; height: 20px;  border: none" class="delete-thread" data-thread-id="${threadId}"></button></td>
         </tr>`;
}

function renderThreadRows(threads: Threads) {
    let rowsHtml = `<tr><th colspan="3">Gespeicherte SD-Threads</th></tr><tr>
          <th width="75%">
            Forenname
          </th>
          <th>
            Pakete
          </th>
          <th> LÃ¶schen
          </th>
        </tr>`;

    Object.entries(threads).forEach(([threadId, threadData]) => {
        rowsHtml += buildThreadRow(threadId, threadData);
    });

    $("#activeSdThreads").html(rowsHtml);
    $("#activeSdThreads th").last().text("Loeschen");
}


export function displaySettings(pageContext: PageContext) {
    localStorageService = LocalStorageHelper.getInstance();
    ensureOrganizerStyles();
    log.info("Initializing settings controller", {href: pageContext.href});

    const settingsHtml = `<table class="vis" id="sd-settings-root" data-sd-native-settings="true" width="100%">
      <tbody>
        <tr><th colspan="2">SD Organizer</th></tr>
        <tr>
          <td>Massen-UT automatisch vorbereiten:</td>
          <td><label><input type="checkbox" id="automate-massen-ut"> Gruppe, Vorlage und Filter für SD-Anfragen anwenden</label></td>
        </tr>
        <tr>
          <td>Doppeltes Schicken:</td>
          <td><label><input type="checkbox" id="prevent-duplicate-destination"> Bereits bearbeitete SD-Anfragen erneut vorauswählen</label></td>
        </tr>
        <tr>
          <td><label for="sd-sort-by">Sortieren nach:</label></td>
          <td><select id="sd-sort-by"></select></td>
        </tr>
        <tr>
          <td><label for="sd-group-id">SD-Gruppe:</label></td>
          <td><input type="number" min="0" value="0" id="sd-group-id" size="6"></td>
        </tr>
        <tr>
          <td><label for="sd-template-id">SD-Vorlage:</label></td>
          <td><input type="number" min="0" value="0" id="sd-template-id" size="6"></td>
        </tr>
        <tr>
          <td><label for="sd-schwertLfz">Schwert-Laufzeit:</label></td>
          <td><input type="number" min="0.01" step="any" value="0" id="sd-schwertLfz" size="6"> Minuten pro Feld</td>
        </tr>
        <tr><td colspan="2"><small>Änderungen werden sofort gespeichert. Grün / ✓: gültig oder aktiv.</small></td></tr>
      </tbody>
    </table>
    <br>
    <table class="vis" width="100%"><tbody id="activeSdThreads"></tbody></table>`;

    const $mount = $("#content_value > table > tbody > tr > td:nth-child(2)").first();
    ($mount.length ? $mount : $("#content_value")).append(settingsHtml);
    const $settingsRoot = $("#sd-settings-root");
    if (localStorageService.getSwordLfz !== 0) {
        $("#sd-schwertLfz").val(localStorageService.getSwordLfz);
    } else {
        $("#sd-schwertLfz").val("0");
    }

    log.state("Loaded settings data sources", {
        groupCount: localStorageService.getGroupData.length,
        templateCount: localStorageService.getTemplateData.length,
        threadCount: Object.keys(localStorageService.getAllThreads).length
    });
    initializeSdSettingsControls($settingsRoot, localStorageService, log);

    $(document).off('sd-catalog-updated.sdSettings').on('sd-catalog-updated.sdSettings', () => initializeSdSettingsControls($settingsRoot, localStorageService, log));
    void refreshGameCatalogs();

    let threads: Threads = localStorageService.getAllThreads;
    renderThreadRows(threads);

    //listener

    $("#activeSdThreads").on("click", ".delete-thread", function () {
        const threadIdToDelete = String($(this).data("thread-id"));
        log.info("Deleting thread from settings", {threadIdToDelete});
        localStorageService.deleteThread(threadIdToDelete);
        renderThreadRows(localStorageService.getAllThreads);
    });

    $("#activeSdThreads").on("click", ".reset-thread-packages", function () {
        const threadId = String($(this).data("thread-id"));
        localStorageService.resetPackagesSent(threadId);
        log.info("Reset sent packages from settings", {threadId});
        renderThreadRows(localStorageService.getAllThreads);
    });


    $("#sd-schwertLfz").on("change", function () {
        const value = Number($(this).val());
        if (Number.isFinite(value) && value > 0) {
            localStorageService.setSwordLfz = value;
            document.dispatchEvent(new Event('sd-settings-changed'));
            log.info("Updated setting", {setting: "swordLfz", value});
        } else {
            log.error("Invalid value for sword travel time", {value: $(this).val()});
            $(this).val(localStorageService.getSwordLfz);
            document.dispatchEvent(new Event('sd-settings-changed'));
        }
    })
    $("#sd-schwertLfz").on('input',()=>document.dispatchEvent(new Event('sd-settings-changed')));
}
