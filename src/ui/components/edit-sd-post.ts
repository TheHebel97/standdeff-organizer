import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import { updateData, sdState} from "../../types/types";
import {calculateSdTableState, parseEditSdTableData, parseSdStateToTableString} from "../../helpers/table-helper";
import {Log} from "../../helpers/logging-helper";

export function editSdPost(updateData: updateData) {
    Log.info("Sd tabellen bearbeitenmodus")
    //only sf mod can edit sd table
    const localStorageService = LocalStorageHelper.getInstance();
    const urlParams = new URLSearchParams(window.location.search);
    const currentThreadId = urlParams.get("thread_id") || "";

    //ui
    const sdPostId = localStorageService.getSdPostId(currentThreadId);
    const updateBtn = `<a class="updateSDTabelle" style="cursor: pointer">Update SD Tabelle</a>`
    $("a[name='" + sdPostId + "']").parent().find(".postheader_right").append(updateBtn);

    $(".updateSDTabelle").on("click", function () {
        updateSdTable(updateData)
    })


}


function updateSdTable(updateData: updateData) { // hier wird mir kinda schlecht
    const tablePattern = /\[table]([\s\S]*)\[\/table]/;
    const cachePattern = /\[spoiler=postCache]([\s\S]*?)\[\/spoiler]/;
    const rawSdPostText = String($("#message").val());
    const table = rawSdPostText.match(tablePattern);
    const cache = rawSdPostText.match(cachePattern);

    if (table === null || cache === null) {
        Log.error("Table or Cache not found")
        return;
    }

    let sdState: sdState = parseEditSdTableData(table[1], cache[0])

    let newSdState:sdState = calculateSdTableState(updateData, sdState)

    let [tableText, cacheText] = parseSdStateToTableString(newSdState)

    let updatedSdPostText = rawSdPostText.replace(tablePattern, `[table]
    [**]ID[||]Dorfkoordinaten[||]Angefordert[||][color=#8d0100]Noch benötigt[/color] [||]Spieler[||]Bemerkung[||]Ab[||]Bis[||][color=#001c83]Massen UT-Link[/color][/**]${tableText}[/table]`);
    updatedSdPostText = updatedSdPostText.replace(cachePattern, `${cacheText}`);
    Log.info("updated sd post text:")
    $("#message").val(updatedSdPostText)

}


