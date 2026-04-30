import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import {updateData, sdState} from "../../types/types";
import {calculateSdTableState, parseEditSdTableData, parseSdStateToTableString} from "../../helpers/table-domain";
import {Log} from "../../helpers/logging-helper";
import {buildMassUtCallUrl} from "../../helpers/game-url-helper";

const log = Log.scope("edit-sd-post");

export function editSdPost(currentThreadId: string, updateData: updateData) {
    log.info("Initializing SD post edit mode", {currentThreadId});
    const localStorageService = LocalStorageHelper.getInstance();
    const sdPostId = localStorageService.getSdPostId(currentThreadId);
    const updateBtn = `<a class="updateSDTabelle" style="cursor: pointer">Update SD Tabelle</a>`;
    $("a[name='" + sdPostId + "']").parent().find(".postheader_right").append(updateBtn);

    $(".updateSDTabelle").on("click", function () {
        updateSdTable(updateData);
    });
}

function updateSdTable(updateData: updateData) {
    const tablePattern = /\[table]([\s\S]*)\[\/table]/;
    const cachePattern = /\[spoiler=postCache]([\s\S]*?)\[\/spoiler]/;
    const rawSdPostText = String($("#message").val());
    const table = rawSdPostText.match(tablePattern);
    const cache = rawSdPostText.match(cachePattern);

    if (table === null || cache === null) {
        log.error("Table or Cache not found");
        return;
    }

    let currentSdState: sdState = parseEditSdTableData(table[1], cache[0]);
    let newSdState: sdState = calculateSdTableState(updateData, currentSdState);
    let [tableText, cacheText] = parseSdStateToTableString(newSdState, buildMassUtCallUrl);

    let updatedSdPostText = rawSdPostText.replace(tablePattern, `[table]
    [**]ID[||]Dorfkoordinaten[||]Angefordert[||][color=#8d0100]Noch benoetigt[/color] [||]Spieler[||]Bemerkung[||]Ab[||]Bis[||][color=#001c83]Massen UT-Link[/color][/**]${tableText}[/table]`);
    updatedSdPostText = updatedSdPostText.replace(cachePattern, `${cacheText}`);
    log.info("Updated SD post text in textarea", {
        newLength: updatedSdPostText.length
    });
    $("#message").val(updatedSdPostText);
}
