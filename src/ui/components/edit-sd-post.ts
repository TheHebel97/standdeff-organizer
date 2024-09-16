import {LocalStorageService} from "../../logic/local-storage-service";
import {packages, updateData, rowSdTable, sdInquiry, sdState, sdTableState} from "../../types/types";
import {calculateSdTableState, parseEditSdTableData, parseSdStateToTableString} from "../../logic/helpers/table-helper";

export function editSdPost(updateData: updateData) {
    console.log("Sd tabellen bearbeitenmodus")
    //only sf mod can edit sd table
    const localStorageService = LocalStorageService.getInstance();
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
        console.error("Table or Cache not found")
        return;
    }

    let sdState: sdState = parseEditSdTableData(table[1], cache[0])

    let newSdState:sdState = calculateSdTableState(updateData, sdState)

    let [tableText, cacheText] = parseSdStateToTableString(newSdState)

    let updatedSdPostText = rawSdPostText.replace(tablePattern, `[table]
    [**]ID[||]Dorfkoordinaten[||]Angefordert[||][color=#8d0100]Noch benötigt[/color] [||]Spieler[||]Bemerkung[||]Ab[||]Bis[||][color=#001c83]Massen UT-Link[/color][/**]${tableText}[/table]`);
    updatedSdPostText = updatedSdPostText.replace(cachePattern, `${cacheText}`);
    console.log("updated sd post text:")
    $("#message").val(updatedSdPostText)

}


