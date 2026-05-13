import {groupData, templateData, ThreadData, Threads} from "../types/types";
import {LocalStorageHelper} from "../helpers/local-storage-helper";
import {Log} from "../helpers/logging-helper";
import {PageContext} from "../helpers/script-context";
import {ADD_THREAD_ICON_DATA_URI} from "./ui-assets";
import {buildForumThreadUrl} from "../helpers/game-url-helper";

const localStorageService = LocalStorageHelper.getInstance();
const log = Log.scope("settings");

function buildThreadRow(threadId: string, threadData: ThreadData): string {
    const threadLink = buildForumThreadUrl(threadData.forumId, threadId);
    const sentPackageCount = threadData.packagesSent.size;
    const resetDisabled = sentPackageCount === 0 ? "disabled" : "";
    const resetOpacity = sentPackageCount === 0 ? "opacity: 0.5;" : "";

    return `<tr>
             <td>
                 <span style="font-size: larger; font-weight: bold">${threadData.forumName}</span> -
                 <a href="${threadLink}">
                     ${threadData.threadName}
                 </a>
                 <div style="font-size: x-small; margin-top: 4px;">Gespeicherte Versand-Eintraege: ${sentPackageCount}</div>
             </td>
             <td style="text-align: center;">
                 <input type="button" value="Reset" class="btn reset-thread-packages" data-thread-id="${threadId}" ${resetDisabled}
                        style="width: 70px; ${resetOpacity}">
             </td>
             <td style="text-align: center;"><button style="background: url(/graphic/delete.png); width: 20px; height: 20px;  border: none" class="delete-thread" data-thread-id="${threadId}"></button></td>
         </tr>`;
}

function renderThreadRows(threads: Threads) {
    let rowsHtml = `<tr>
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
    log.info("Initializing settings controller", {href: pageContext.href});

    let unitDropDownOptions: string = '<option value="default"></option>';
    game_data.units.forEach(unit => {
        unitDropDownOptions += `<option value="${unit}">${unit}</option>`;
    })

    const settingsHtml = `<table class="vis settings" width="100%" style="margin-top: 15px">
  <tbody>
  <tr>
    <th colspan="4" style="text-align: center">
      <img class="addThread" style="cursor: pointer"
           src="${ADD_THREAD_ICON_DATA_URI}"/>
      SD-Tabellen-Skript-Einstellungen
      <img class="addThread" style="cursor: pointer"
           src="${ADD_THREAD_ICON_DATA_URI}"/>
    </th>
  </tr>
  <tr>
    <td width="40%">
      <table class="vis settings">
        <tbody>
        <tr>
          <td>
            Popup beim ersten Start:
          </td>
          <td>
            <input class="btn btn-confirm-no" type="button" value="An" id="first-start-popup" style="width:75px; background-color: #8d0100; color: #ffffff !important;"/>
          </td>
        </tr>
        <tr>
          <td>
            Massen-UT vereinfachen:
          </td>
          <td>
            <input class="btn btn-confirm-no"  type="button" value="Aus" id="automate-massen-ut" style="width:75px;  background-color: #8d0100;color: #ffffff "/>
          </td>

        </tr>
        <tr>
          <td>
            verhindere doppeltes Schicken:
          </td>
          <td>
            <input class="btn btn-confirm-no"  type="button" value="An" id="prevent-duplicate-destination" style="width:75px;  background-color: #8d0100;color: #ffffff "/>
          </td>

        </tr>
        <tr>
            <td>
                sortieren nach:
            </td>
            <td>
                <select id="sd-sort-by" style="width:150px; background-color: #8d0100; color: #ffffff; border: none; padding: 5px 10px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">` + unitDropDownOptions + `</select>
            </td>
      </tr>
        <tr>
          <td>
            SD verschicken Gruppen ID:
          </td>
          <td>
            <input type="number" value="0" id="sd-group-id" style="width:68px;  background-color: #8d0100; color: #ffffff"/>
          </td>

        </tr>
        <tr>
          <td>
            SD Vorlagen ID:
          </td>
          <td>
            <input type="number" value="0" id="sd-template-id" style="width:68px;  background-color: #8d0100; color: #ffffff"/>
          </td>

        </tr>
        <tr>
          <td>
            Schwert Laufzeit:
          </td>
          <td>
            <input type="number" value="0" id="sd-schwertLfz" style="width:68px;  background-color: #8d0100; color: #ffffff"/>
          </td>

        </tr>
        
        </tbody>
      </table>

    </td>
    <td width="50%">
      <table class="vis settings" width="100%">
        <tbody id="activeSdThreads">
        <tr>
          <th width="85%">
            Forenname
          </th>
          <th> Löschen
          </th>
        </tr>
        </tbody>
      </table>
    </td>
  </tr>

</table>`;

    $("#content_value > table > tbody > tr > td:nth-child(2)").append(settingsHtml);
    //colorize the buttons depending on the value of the setting
    if (localStorageService.getFirstStartPopup) {
        $("#first-start-popup").val("An").css("background", "#0e7a0e");
    } else {
        $("#first-start-popup").val("Aus").css("background", "#8d0100");
    }

    if (localStorageService.getAutomateMassenUt) {
        $("#automate-massen-ut").val("An").css("background", "#0e7a0e");

    } else {
        $("#automate-massen-ut").val("Aus").css("background", "#8d0100");
    }

    if (localStorageService.getPreventDuplicateDestination) {
        $("#prevent-duplicate-destination").val("An").css("background", "#0e7a0e");
    } else {
        $("#prevent-duplicate-destination").val("Aus").css("background", "#8d0100");
    }

    if (localStorageService.getSortBy !== "default") {
        $("#sd-sort-by").val(localStorageService.getSortBy).css("background", "#0e7a0e");
    } else {
        $("#sd-sort-by").val("default").css("background", "#8d0100");
    }

    if (localStorageService.getSwordLfz !== 0) {
        $("#sd-schwertLfz").val(localStorageService.getSwordLfz).css("background", "#0e7a0e");
    } else {
        $("#sd-schwertLfz").val("0").css("background", "#8d0100");
    }

    // get group data from local storage
    let groupData: groupData[] = localStorageService.getGroupData;
    log.state("Loaded settings data sources", {
        groupCount: groupData.length,
        templateCount: localStorageService.getTemplateData.length,
        threadCount: Object.keys(localStorageService.getAllThreads).length
    });
    let templateData: templateData[] = localStorageService.getTemplateData;

    if (groupData.length > 0) {
        let dropdown = '<select id="sd-group-id" style="width:150px; background-color: #8d0100; color: #ffffff; border: none; padding: 5px 10px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">';
        groupData.forEach(group => {
            dropdown += `<option value="${group.id}">${group.name}</option>`;
        });
        dropdown += '</select>';

        $("#sd-group-id").replaceWith(dropdown);

        if (localStorageService.getSdGroupId !== "0") {
            $("#sd-group-id").val(localStorageService.getSdGroupId).css("background", "#0e7a0e");
        }
    }

    if (templateData.length > 0) {
        let dropdown = '<select id="sd-template-id" style="width:150px; background-color: #8d0100; color: #ffffff; border: none; padding: 5px 10px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">';
        dropdown += '<option value="">nicht gesetzt</option>';
        templateData.forEach(template => {
            dropdown += `<option value="${template.id}">${template.name}</option>`;
        });
        dropdown += '</select>';

        $("#sd-template-id").replaceWith(dropdown);

        if (localStorageService.getSelectedTemplate !== "") {
            $("#sd-template-id").val(localStorageService.getSelectedTemplate).css("background", "#0e7a0e");
        }
    }

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
        const threadData = localStorageService.getThreadData(threadId);
        if (!threadData || threadData.packagesSent.size === 0) {
            return;
        }
        const shouldReset = window.confirm(`Geschickte Pakete fuer "${threadData.threadName}" zuruecksetzen?`);
        if (!shouldReset) {
            return;
        }
        localStorageService.resetPackagesSent(threadId);
        log.info("Reset sent packages from settings", {threadId});
        renderThreadRows(localStorageService.getAllThreads);
    });


    $("#first-start-popup").on("click", function () {
        const value = $(this).val();

        if (value === "An") {
            $(this).val("Aus");
            $("#first-start-popup").css("background", "#8d0100");
            localStorageService.setFirstStartPopup = false;
            log.info("Updated setting", {setting: "firstStartPopup", value: false});
        } else {
            $(this).val("An");
            $("#first-start-popup").css("background", "#0e7a0e");
            localStorageService.setFirstStartPopup = true;
            log.info("Updated setting", {setting: "firstStartPopup", value: true});
        }
    });
    $("#prevent-duplicate-destination").on("click", function () {
        const value = $(this).val();

        if (value === "An") {
            $(this).val("Aus");
            $("#prevent-duplicate-destination").css("background", "#8d0100");
            localStorageService.setPreventDuplicateDestination = false;
            log.info("Updated setting", {setting: "preventDuplicateDestination", value: false});

        } else {
            $(this).val("An");
            $("#prevent-duplicate-destination").css("background", "#0e7a0e");
            localStorageService.setPreventDuplicateDestination = true;
            log.info("Updated setting", {setting: "preventDuplicateDestination", value: true});
        }
    });


    $("#automate-massen-ut").on("click", function () {
        const value = $(this).val();

        if (value === "An") {
            $(this).val("Aus");
            $("#automate-massen-ut").css("background", "#8d0100");
            localStorageService.setAutomateMassenUt = false;
            log.info("Updated setting", {setting: "automateMassenUt", value: false});

        } else {
            $(this).val("An");
            $("#automate-massen-ut").css("background", "#0e7a0e");
            localStorageService.setAutomateMassenUt = true;
            log.info("Updated setting", {setting: "automateMassenUt", value: true});
        }
    });

    $("#sd-group-id").on("change", function () {
        if ($(this).val() !== "0") {
            localStorageService.setSdGroupId = String($(this).val());
            $(this).css("background", "#0e7a0e");
            log.info("Updated setting", {setting: "sdGroupId", value: String($(this).val())});
            return;
        }
        localStorageService.setSdGroupId = "0";
        $(this).css("background", "#8d0100");
        log.info("Updated setting", {setting: "sdGroupId", value: "0"});
    });

    $("#sd-template-id").on("change", function () {
        if ($(this).val() !== "0") {
            localStorageService.setSelectedTemplate = String($(this).val());
            $(this).css("background", "#0e7a0e");
            log.info("Updated setting", {setting: "selectedTemplate", value: String($(this).val())});
            return;
        }
        localStorageService.setSelectedTemplate = "0";
        $(this).css("background", "#8d0100");
        log.info("Updated setting", {setting: "selectedTemplate", value: "0"});
    });

    $("#sd-sort-by").on("change", function () {
        if ($(this).val() !== "default") {
            localStorageService.setSortBy = String($(this).val());
            $(this).css("background", "#0e7a0e");
            log.info("Updated setting", {setting: "sortBy", value: String($(this).val())});
            return;
        }
        localStorageService.setSortBy = "default";
        $(this).css("background", "#8d0100");
        log.info("Updated setting", {setting: "sortBy", value: "default"});
    });

    $("#sd-schwertLfz").on("change", function () {
        const value = Number($(this).val());
        if (!isNaN(value) && value >= 0) {
            localStorageService.setSwordLfz = value;
            log.info("Updated setting", {setting: "swordLfz", value});
        } else {
            log.error("Invalid value for sword travel time", {value: $(this).val()});
            $(this).val(localStorageService.getSwordLfz);
        }
    })
}
